import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in reverse relation order
  await prisma.notification.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentReversal.deleteMany();
  await prisma.idempotencyRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.favouriteRecipient.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await argon2.hash('Password@123', {
    type: argon2.argon2id,
  });
  const defaultPinHash = await argon2.hash('123456', {
    type: argon2.argon2id,
  });

  console.log('Creating demo users...');

  // User 1: Demo Sender
  const alice = await prisma.user.create({
    data: {
      email: 'alice@payflow.internal',
      username: 'alice',
      displayName: 'Alice Sharma',
      phone: '+919876543210',
      passwordHash: defaultPasswordHash,
      transactionPinHash: defaultPinHash,
      virtualPaymentId: 'alice@payflow',
      wallet: {
        create: {
          balance: 10000000n, // ₹1,00,000 (10,000,000 paise)
          currency: 'INR',
          dailyLimit: 20000000n,
        },
      },
    },
    include: { wallet: true },
  });

  // User 2: Demo Recipient
  const bob = await prisma.user.create({
    data: {
      email: 'bob@payflow.internal',
      username: 'bob',
      displayName: 'Bob Verma',
      phone: '+919876543211',
      passwordHash: defaultPasswordHash,
      transactionPinHash: defaultPinHash,
      virtualPaymentId: 'bob@payflow',
      wallet: {
        create: {
          balance: 5000000n, // ₹50,000
          currency: 'INR',
        },
      },
    },
    include: { wallet: true },
  });

  // User 3: Demo Merchant
  const chaiPoint = await prisma.user.create({
    data: {
      email: 'chaipoint@payflow.internal',
      username: 'chaipoint',
      displayName: 'Chai Point Café',
      phone: '+919876543212',
      passwordHash: defaultPasswordHash,
      transactionPinHash: defaultPinHash,
      virtualPaymentId: 'chaipoint@payflow',
      wallet: {
        create: {
          balance: 25000000n, // ₹2,50,000
          currency: 'INR',
        },
      },
    },
    include: { wallet: true },
  });

  // User 4: Regular User
  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@payflow.internal',
      username: 'charlie',
      displayName: 'Charlie Nair',
      phone: '+919876543213',
      passwordHash: defaultPasswordHash,
      transactionPinHash: defaultPinHash,
      virtualPaymentId: 'charlie@payflow',
      wallet: {
        create: {
          balance: 750000n, // ₹7,500
          currency: 'INR',
        },
      },
    },
    include: { wallet: true },
  });

  console.log('Creating favourites...');
  await prisma.favouriteRecipient.createMany({
    data: [
      { userId: alice.id, recipientId: bob.id },
      { userId: alice.id, recipientId: chaiPoint.id },
      { userId: bob.id, recipientId: alice.id },
    ],
  });

  console.log('Creating sample payment & double-entry ledger entries...');
  const refNum = `PF${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const paymentAmountPaise = 25000n; // ₹250.00

  const payment = await prisma.payment.create({
    data: {
      referenceNumber: refNum,
      senderId: alice.id,
      recipientId: chaiPoint.id,
      amountPaise: paymentAmountPaise,
      description: 'Morning masala chai & bun maska',
      status: 'SUCCESS',
      simulationScenario: 'SUCCESS',
      processedAt: new Date(),
    },
  });

  const transaction = await prisma.transaction.create({
    data: {
      id: uuidv4(),
      paymentId: payment.id,
      status: 'SUCCESS',
    },
  });

  await prisma.ledgerEntry.createMany({
    data: [
      {
        id: uuidv4(),
        transactionId: transaction.id,
        userId: alice.id,
        walletId: alice.wallet!.id,
        type: 'DEBIT',
        amountPaise: paymentAmountPaise,
        balanceBefore: 10000000n,
        balanceAfter: 9975000n,
        description: 'Payment to chaipoint@payflow',
      },
      {
        id: uuidv4(),
        transactionId: transaction.id,
        userId: chaiPoint.id,
        walletId: chaiPoint.wallet!.id,
        type: 'CREDIT',
        amountPaise: paymentAmountPaise,
        balanceBefore: 25000000n,
        balanceAfter: 25025000n,
        description: 'Payment from alice@payflow',
      },
    ],
  });

  await prisma.receipt.create({
    data: {
      id: uuidv4(),
      paymentId: payment.id,
      data: {
        referenceNumber: refNum,
        amountPaise: paymentAmountPaise.toString(),
        sender: { id: alice.id, vpa: alice.virtualPaymentId, name: alice.displayName },
        recipient: { id: chaiPoint.id, vpa: chaiPoint.virtualPaymentId, name: chaiPoint.displayName },
        description: 'Morning masala chai & bun maska',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      },
    },
  });

  await prisma.notification.create({
    data: {
      id: uuidv4(),
      userId: alice.id,
      type: 'PAYMENT_SENT',
      title: 'Payment Successful',
      body: '₹250 sent to Chai Point Café',
      data: { paymentId: payment.id, referenceNumber: refNum },
    },
  });

  console.log('✅ Seed completed successfully:');
  console.log(`  - Alice:     alice@payflow.internal (alice@payflow) / Password@123 / PIN 123456`);
  console.log(`  - Bob:       bob@payflow.internal (bob@payflow) / Password@123 / PIN 123456`);
  console.log(`  - ChaiPoint: chaipoint@payflow.internal (chaipoint@payflow) / Password@123 / PIN 123456`);
  console.log(`  - Charlie:   charlie@payflow.internal (charlie@payflow) / Password@123 / PIN 123456`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
