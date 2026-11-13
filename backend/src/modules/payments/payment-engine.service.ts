import { TransactionStatus, SimulationScenario } from '@prisma/client';
import { prisma } from '../../config/database';
import { verifyPin, generateReferenceNumber } from '../../utils/crypto.util';
import {
  InsufficientFundsError,
  PaymentError,
  NotFoundError,
} from '../../middleware/error.middleware';
import {
  assertValidTransition,
  isRetryEligible,
  isReversalEligible,
} from './payment-state-machine';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { v4 as uuidv4 } from 'uuid';

async function simulateProcessing(scenario: SimulationScenario): Promise<TransactionStatus> {
  switch (scenario) {
    case 'SUCCESS':
      return 'SUCCESS';
    case 'FAILURE':
      return 'FAILED';
    case 'PENDING':
      return 'PENDING';
    case 'TIMEOUT':
      // Backend sets PENDING, mimicking gateway network timeout
      await new Promise((resolve) => setTimeout(resolve, 80));
      return 'PENDING';
    case 'DELAYED_SUCCESS':
      return 'SUCCESS';
    default:
      return 'SUCCESS';
  }
}

export async function validatePaymentRequest(params: {
  senderId: string;
  recipientVirtualId: string;
  amountPaise: bigint;
  pin: string;
}): Promise<{
  recipient: { id: string; displayName: string; virtualPaymentId: string };
  sender: { id: string; virtualPaymentId: string };
}> {
  const { senderId, recipientVirtualId, amountPaise, pin } = params;

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: {
      id: true,
      virtualPaymentId: true,
      transactionPinHash: true,
      pinAttempts: true,
      pinLockedUntil: true,
    },
  });
  if (!sender) throw new NotFoundError('Sender');

  if (sender.virtualPaymentId.toLowerCase() === recipientVirtualId.toLowerCase()) {
    throw new PaymentError('Cannot send payment to yourself', 'SELF_PAYMENT');
  }

  if (sender.pinLockedUntil && sender.pinLockedUntil > new Date()) {
    const unlockIn = Math.ceil(
      (sender.pinLockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new PaymentError(
      `Transaction PIN locked. Try again in ${unlockIn} minutes.`,
      'PIN_LOCKED',
    );
  }

  if (!sender.transactionPinHash) {
    throw new PaymentError(
      'Transaction PIN not set. Please set your PIN first.',
      'PIN_NOT_SET',
    );
  }

  const pinValid = await verifyPin(pin, sender.transactionPinHash);
  if (!pinValid) {
    const newAttempts = sender.pinAttempts + 1;
    const updateData: { pinAttempts: number; pinLockedUntil?: Date } = {
      pinAttempts: newAttempts,
    };
    if (newAttempts >= 5) {
      updateData.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      updateData.pinAttempts = 0;
    }
    await prisma.user.update({ where: { id: senderId }, data: updateData });
    const remaining = Math.max(0, 5 - newAttempts);
    throw new PaymentError(
      remaining > 0
        ? `Incorrect PIN. ${remaining} attempts remaining.`
        : 'Too many incorrect attempts. PIN locked for 30 minutes.',
      'INVALID_PIN',
    );
  }

  if (sender.pinAttempts > 0) {
    await prisma.user.update({
      where: { id: senderId },
      data: { pinAttempts: 0, pinLockedUntil: null },
    });
  }

  const recipient = await prisma.user.findUnique({
    where: { virtualPaymentId: recipientVirtualId.toLowerCase(), status: 'ACTIVE' },
    select: { id: true, displayName: true, virtualPaymentId: true },
  });
  if (!recipient) throw new NotFoundError('Recipient');

  if (amountPaise < env.MIN_PAYMENT_AMOUNT_PAISE) {
    throw new PaymentError(
      `Minimum payment is ₹${Number(env.MIN_PAYMENT_AMOUNT_PAISE) / 100}`,
      'AMOUNT_TOO_LOW',
    );
  }
  if (amountPaise > env.MAX_PAYMENT_AMOUNT_PAISE) {
    throw new PaymentError(
      `Maximum payment is ₹${Number(env.MAX_PAYMENT_AMOUNT_PAISE) / 100}`,
      'AMOUNT_TOO_HIGH',
    );
  }

  return { recipient, sender: { id: sender.id, virtualPaymentId: sender.virtualPaymentId } };
}

export async function processPayment(paymentId: string): Promise<TransactionStatus> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      sender: { include: { wallet: true } },
      recipient: { include: { wallet: true } },
    },
  });
  if (!payment) throw new NotFoundError('Payment');

  assertValidTransition(payment.status, 'PROCESSING');
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'PROCESSING' },
  });

  try {
    const outcome = await simulateProcessing(payment.simulationScenario);

    if (outcome === 'SUCCESS') {
      await prisma.$transaction(
        async (tx) => {
          // Lock sender wallet row
          const senderWallets = await tx.$queryRaw<Array<{ id: string; balance: bigint }>>`
            SELECT id, balance FROM "Wallet" WHERE "userId" = ${payment.senderId} FOR UPDATE
          `;
          if (!senderWallets[0]) throw new Error('Sender wallet not found');

          const senderBalance = senderWallets[0].balance;
          if (senderBalance < payment.amountPaise) {
            throw new InsufficientFundsError();
          }

          // Lock recipient wallet row
          const recipientWallets = await tx.$queryRaw<Array<{ id: string; balance: bigint }>>`
            SELECT id, balance FROM "Wallet" WHERE "userId" = ${payment.recipientId} FOR UPDATE
          `;
          if (!recipientWallets[0]) throw new Error('Recipient wallet not found');

          const recipientBalance = recipientWallets[0].balance;
          const newSenderBalance = senderBalance - payment.amountPaise;
          const newRecipientBalance = recipientBalance + payment.amountPaise;

          // Double-entry balance updates
          await tx.wallet.update({
            where: { id: senderWallets[0].id },
            data: { balance: newSenderBalance },
          });
          await tx.wallet.update({
            where: { id: recipientWallets[0].id },
            data: { balance: newRecipientBalance },
          });

          // Create transaction audit record
          const transaction = await tx.transaction.create({
            data: { id: uuidv4(), paymentId, status: 'SUCCESS' },
          });

          // Double-entry ledger entries
          await tx.ledgerEntry.createMany({
            data: [
              {
                id: uuidv4(),
                transactionId: transaction.id,
                userId: payment.senderId,
                walletId: senderWallets[0].id,
                type: 'DEBIT',
                amountPaise: payment.amountPaise,
                balanceBefore: senderBalance,
                balanceAfter: newSenderBalance,
                description:
                  payment.description ||
                  `Payment to ${payment.recipient.virtualPaymentId}`,
              },
              {
                id: uuidv4(),
                transactionId: transaction.id,
                userId: payment.recipientId,
                walletId: recipientWallets[0].id,
                type: 'CREDIT',
                amountPaise: payment.amountPaise,
                balanceBefore: recipientBalance,
                balanceAfter: newRecipientBalance,
                description:
                  payment.description ||
                  `Payment from ${payment.sender.virtualPaymentId}`,
              },
            ],
          });

          // Update payment record
          await tx.payment.update({
            where: { id: paymentId },
            data: { status: 'SUCCESS', processedAt: new Date() },
          });

          // Create receipt record snapshot
          await tx.receipt.create({
            data: {
              id: uuidv4(),
              paymentId,
              data: {
                referenceNumber: payment.referenceNumber,
                amountPaise: payment.amountPaise.toString(),
                sender: {
                  id: payment.senderId,
                  vpa: payment.sender.virtualPaymentId,
                  name: payment.sender.displayName,
                },
                recipient: {
                  id: payment.recipientId,
                  vpa: payment.recipient.virtualPaymentId,
                  name: payment.recipient.displayName,
                },
                description: payment.description,
                timestamp: new Date().toISOString(),
                status: 'SUCCESS',
              },
            },
          });

          // Create notification for recipient
          await tx.notification.create({
            data: {
              id: uuidv4(),
              userId: payment.recipientId,
              type: 'PAYMENT_RECEIVED',
              title: 'Payment Received',
              body: `Received ₹${Number(payment.amountPaise) / 100} from ${payment.sender.displayName}`,
              data: { paymentId, referenceNumber: payment.referenceNumber },
            },
          });
        },
        { isolationLevel: 'Serializable' },
      );

      return 'SUCCESS';
    } else if (outcome === 'FAILED') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          failureReason: 'Payment declined by simulation engine',
        },
      });
      await prisma.transaction.create({
        data: {
          id: uuidv4(),
          paymentId,
          status: 'FAILED',
          metadata: { reason: 'Simulation: FAILURE scenario' },
        },
      });
      return 'FAILED';
    } else {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'PENDING' },
      });
      await prisma.transaction.create({
        data: {
          id: uuidv4(),
          paymentId,
          status: 'PENDING',
          metadata: { reason: 'Awaiting settlement' },
        },
      });
      return 'PENDING';
    }
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', failureReason: 'Insufficient funds' },
      });
      throw err;
    }
    logger.error('Payment processing error', {
      paymentId,
      error: (err as Error).message,
    });
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED', failureReason: 'Internal processing error' },
    });
    throw err;
  }
}

export async function retryPayment(
  paymentId: string,
  userId: string,
): Promise<{ status: TransactionStatus }> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new NotFoundError('Payment');
  if (payment.senderId !== userId) {
    throw new PaymentError('Unauthorized to retry this payment', 'FORBIDDEN');
  }
  if (!isRetryEligible(payment.status)) {
    throw new PaymentError(
      `Payment cannot be retried. Current status: ${payment.status}`,
      'NOT_RETRYABLE',
    );
  }

  if (payment.status === 'PENDING') {
    const latestTx = await prisma.transaction.findFirst({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
    if (latestTx?.status === 'SUCCESS') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCESS' },
      });
      return { status: 'SUCCESS' };
    }
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'INITIATED' },
  });
  const result = await processPayment(paymentId);
  return { status: result };
}

export async function reversePayment(
  paymentId: string,
  userId: string,
  reason?: string,
): Promise<{ reversalRefNumber: string }> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      sender: { include: { wallet: true } },
      recipient: { include: { wallet: true } },
    },
  });
  if (!payment) throw new NotFoundError('Payment');
  if (payment.senderId !== userId) {
    throw new PaymentError('Unauthorized to reverse this payment', 'FORBIDDEN');
  }
  if (!isReversalEligible(payment.status)) {
    throw new PaymentError(
      `Payment cannot be reversed. Current status: ${payment.status}`,
      'NOT_REVERSIBLE',
    );
  }

  const existingReversal = await prisma.paymentReversal.findUnique({
    where: { paymentId },
  });
  if (existingReversal) {
    throw new PaymentError(
      'Payment has already been reversed',
      'ALREADY_REVERSED',
    );
  }

  const reversalRef = generateReferenceNumber();

  await prisma.$transaction(
    async (tx) => {
      const recipientWallets = await tx.$queryRaw<Array<{ id: string; balance: bigint }>>`
        SELECT id, balance FROM "Wallet" WHERE "userId" = ${payment.recipientId} FOR UPDATE
      `;
      const senderWallets = await tx.$queryRaw<Array<{ id: string; balance: bigint }>>`
        SELECT id, balance FROM "Wallet" WHERE "userId" = ${payment.senderId} FOR UPDATE
      `;

      if (!recipientWallets[0] || !senderWallets[0]) {
        throw new Error('Wallets not found');
      }

      const newRecipientBalance = recipientWallets[0].balance - payment.amountPaise;
      const newSenderBalance = senderWallets[0].balance + payment.amountPaise;

      if (newRecipientBalance < 0n) {
        throw new PaymentError(
          'Recipient has insufficient balance for reversal',
          'REVERSAL_FAILED',
        );
      }

      await tx.wallet.update({
        where: { id: recipientWallets[0].id },
        data: { balance: newRecipientBalance },
      });
      await tx.wallet.update({
        where: { id: senderWallets[0].id },
        data: { balance: newSenderBalance },
      });

      const transaction = await tx.transaction.create({
        data: {
          id: uuidv4(),
          paymentId,
          status: 'REVERSED',
          metadata: { type: 'REVERSAL', reversalRef },
        },
      });

      await tx.ledgerEntry.createMany({
        data: [
          {
            id: uuidv4(),
            transactionId: transaction.id,
            userId: payment.recipientId,
            walletId: recipientWallets[0].id,
            type: 'DEBIT',
            amountPaise: payment.amountPaise,
            balanceBefore: recipientWallets[0].balance,
            balanceAfter: newRecipientBalance,
            description: `Reversal of payment ${payment.referenceNumber}`,
          },
          {
            id: uuidv4(),
            transactionId: transaction.id,
            userId: payment.senderId,
            walletId: senderWallets[0].id,
            type: 'CREDIT',
            amountPaise: payment.amountPaise,
            balanceBefore: senderWallets[0].balance,
            balanceAfter: newSenderBalance,
            description: `Reversal of payment ${payment.referenceNumber}`,
          },
        ],
      });

      await tx.paymentReversal.create({
        data: {
          id: uuidv4(),
          paymentId,
          initiatedBy: userId,
          reason: reason || 'User-initiated reversal',
          reversalRefNumber: reversalRef,
        },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'REVERSED' },
      });

      await tx.notification.create({
        data: {
          id: uuidv4(),
          userId: payment.recipientId,
          type: 'PAYMENT_REVERSED',
          title: 'Payment Reversed',
          body: `Payment of ₹${Number(payment.amountPaise) / 100} has been reversed`,
          data: { paymentId, reversalRef },
        },
      });
    },
    { isolationLevel: 'Serializable' },
  );

  return { reversalRefNumber: reversalRef };
}
