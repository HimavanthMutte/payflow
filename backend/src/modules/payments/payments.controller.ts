import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { paiseToRupees, formatPaise } from '../../utils/amount.util';
import { generateReferenceNumber } from '../../utils/crypto.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotFoundError } from '../../middleware/error.middleware';
import { checkIdempotency, saveIdempotencyRecord } from './idempotency.service';
import {
  validatePaymentRequest,
  processPayment,
  retryPayment,
  reversePayment,
} from './payment-engine.service';
import { getPagination } from '../../types';

export async function createPayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const {
      recipientVirtualId,
      amountPaise,
      description,
      pin,
      idempotencyKey,
      simulationScenario,
    } = req.body;

    // Idempotency check
    const idempotency = await checkIdempotency(idempotencyKey, userId);
    if (idempotency.cached) {
      res
        .status(idempotency.statusCode || 200)
        .json(idempotency.responseBody);
      return;
    }

    // Pre-flight validation & PIN check
    const { recipient } = await validatePaymentRequest({
      senderId: userId,
      recipientVirtualId,
      amountPaise,
      pin,
    });

    const referenceNumber = generateReferenceNumber();

    // Create payment in INITIATED state
    const payment = await prisma.payment.create({
      data: {
        referenceNumber,
        senderId: userId,
        recipientId: recipient.id,
        amountPaise,
        description,
        status: 'INITIATED',
        simulationScenario,
      },
    });

    // Execute state transition & core accounting engine
    const finalStatus = await processPayment(payment.id);

    const paymentResult = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        recipient: {
          select: {
            id: true,
            displayName: true,
            virtualPaymentId: true,
          },
        },
        sender: {
          select: {
            id: true,
            displayName: true,
            virtualPaymentId: true,
          },
        },
      },
    });

    const responsePayload = successResponse(
      {
        id: paymentResult?.id,
        referenceNumber: paymentResult?.referenceNumber,
        amountPaise: paymentResult?.amountPaise.toString(),
        amountRupees: paiseToRupees(paymentResult?.amountPaise || 0n),
        formattedAmount: formatPaise(paymentResult?.amountPaise || 0n),
        status: finalStatus,
        failureReason: paymentResult?.failureReason,
        recipient: paymentResult?.recipient,
        sender: paymentResult?.sender,
        description: paymentResult?.description,
        createdAt: paymentResult?.createdAt,
        processedAt: paymentResult?.processedAt,
      },
      finalStatus === 'SUCCESS' ? 'Payment successful' : 'Payment processed',
    );

    // Save response in idempotency cache
    await saveIdempotencyRecord({
      idempotencyKey,
      userId,
      paymentId: payment.id,
      statusCode: 201,
      responseBody: responsePayload,
    });

    res.status(201).json(responsePayload);
  } catch (err) {
    next(err);
  }
}

export async function listPayments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { page, limit, skip } = getPagination(req.query);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          OR: [{ senderId: userId }, { recipientId: userId }],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          recipient: {
            select: { id: true, displayName: true, virtualPaymentId: true },
          },
          sender: {
            select: { id: true, displayName: true, virtualPaymentId: true },
          },
        },
      }),
      prisma.payment.count({
        where: {
          OR: [{ senderId: userId }, { recipientId: userId }],
        },
      }),
    ]);

    const formatted = payments.map((p) => ({
      id: p.id,
      referenceNumber: p.referenceNumber,
      amountPaise: p.amountPaise.toString(),
      amountRupees: paiseToRupees(p.amountPaise),
      formattedAmount: formatPaise(p.amountPaise),
      status: p.status,
      type: p.senderId === userId ? 'DEBIT' : 'CREDIT',
      recipient: p.recipient,
      sender: p.sender,
      description: p.description,
      createdAt: p.createdAt,
    }));

    res.json(paginatedResponse(formatted, total, page, limit));
  } catch (err) {
    next(err);
  }
}

export async function getPaymentById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        recipient: {
          select: { id: true, displayName: true, virtualPaymentId: true },
        },
        sender: {
          select: { id: true, displayName: true, virtualPaymentId: true },
        },
        reversal: true,
      },
    });

    if (
      !payment ||
      (payment.senderId !== userId && payment.recipientId !== userId)
    ) {
      throw new NotFoundError('Payment');
    }

    res.json(
      successResponse({
        id: payment.id,
        referenceNumber: payment.referenceNumber,
        amountPaise: payment.amountPaise.toString(),
        amountRupees: paiseToRupees(payment.amountPaise),
        formattedAmount: formatPaise(payment.amountPaise),
        status: payment.status,
        type: payment.senderId === userId ? 'DEBIT' : 'CREDIT',
        recipient: payment.recipient,
        sender: payment.sender,
        description: payment.description,
        failureReason: payment.failureReason,
        processedAt: payment.processedAt,
        reversal: payment.reversal,
        createdAt: payment.createdAt,
      }),
    );
  } catch (err) {
    next(err);
  }
}

export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        failureReason: true,
        senderId: true,
        recipientId: true,
        processedAt: true,
      },
    });

    if (
      !payment ||
      (payment.senderId !== userId && payment.recipientId !== userId)
    ) {
      throw new NotFoundError('Payment');
    }

    res.json(
      successResponse({
        id: payment.id,
        referenceNumber: payment.referenceNumber,
        status: payment.status,
        failureReason: payment.failureReason,
        processedAt: payment.processedAt,
      }),
    );
  } catch (err) {
    next(err);
  }
}

export async function retry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const result = await retryPayment(req.params.id, userId);
    res.json(successResponse(result, 'Payment retry executed'));
  } catch (err) {
    next(err);
  }
}

export async function reverse(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { reason } = req.body;
    const result = await reversePayment(req.params.id, userId, reason);
    res.json(successResponse(result, 'Payment reversed successfully'));
  } catch (err) {
    next(err);
  }
}
