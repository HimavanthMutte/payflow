import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import {
  hashPassword,
  verifyPassword,
  hashPin,
  verifyPin,
  hashToken,
  generateSecureToken,
} from '../../utils/crypto.util';
import {
  ConflictError,
  AuthError,
  PaymentError,
  NotFoundError,
} from '../../middleware/error.middleware';
import type { RegisterDto, LoginDto, ChangePinDto, SetPinDto } from './auth.schema';

const REFRESH_TOKEN_TTL_DAYS = 7;
const ACCESS_TOKEN_TTL = '15m';

function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function generateRefreshToken(): { raw: string; hash: string } {
  const raw = generateSecureToken(32);
  const hash = hashToken(raw);
  return { raw, hash };
}

export async function register(dto: RegisterDto) {
  // Check duplicates
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: dto.email }, { username: dto.username }],
    },
    select: { email: true, username: true },
  });
  if (existing) {
    if (existing.email === dto.email) {
      throw new ConflictError('Email already registered');
    }
    throw new ConflictError('Username already taken');
  }

  const passwordHash = await hashPassword(dto.password);
  const virtualPaymentId = `${dto.username.toLowerCase()}@payflow`;

  const user = await prisma.user.create({
    data: {
      email: dto.email.toLowerCase(),
      username: dto.username.toLowerCase(),
      displayName: dto.displayName,
      phone: dto.phone,
      passwordHash,
      virtualPaymentId,
      // Create wallet with ₹500 starter balance (50000 paise)
      wallet: {
        create: {
          balance: 50000n,
          currency: 'INR',
        },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      virtualPaymentId: true,
      createdAt: true,
    },
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  const accessToken = generateAccessToken(user.id, user.email);
  const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt,
    },
  });

  return { user, accessToken, refreshToken: refreshRaw };
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({
    where: { email: dto.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      virtualPaymentId: true,
      passwordHash: true,
      status: true,
    },
  });

  if (!user) throw new AuthError('Invalid email or password');
  if (user.status !== 'ACTIVE') throw new AuthError('Account suspended');

  const valid = await verifyPassword(dto.password, user.passwordHash);
  if (!valid) throw new AuthError('Invalid email or password');

  const accessToken = generateAccessToken(user.id, user.email);
  const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: refreshHash, expiresAt },
  });

  logger.info('User logged in', { userId: user.id });

  const { passwordHash: _pw, ...safeUser } = user;
  void _pw;
  return { user: safeUser, accessToken, refreshToken: refreshRaw };
}

export async function refreshTokens(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, status: true } } },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AuthError('Invalid or expired refresh token');
  }
  if (stored.user.status !== 'ACTIVE') {
    throw new AuthError('Account suspended');
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const accessToken = generateAccessToken(stored.user.id, stored.user.email);
  const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: { userId: stored.user.id, tokenHash: refreshHash, expiresAt },
  });

  return { accessToken, refreshToken: refreshRaw };
}

export async function logout(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function setTransactionPin(userId: string, dto: SetPinDto) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transactionPinHash: true },
  });
  if (!user) throw new NotFoundError('User');
  if (user.transactionPinHash) {
    throw new ConflictError(
      'PIN already set. Use change PIN to update.',
    );
  }

  const pinHash = await hashPin(dto.pin);
  await prisma.user.update({
    where: { id: userId },
    data: { transactionPinHash: pinHash, pinAttempts: 0, pinLockedUntil: null },
  });
}

export async function changeTransactionPin(
  userId: string,
  dto: ChangePinDto,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      transactionPinHash: true,
      pinAttempts: true,
      pinLockedUntil: true,
    },
  });
  if (!user) throw new NotFoundError('User');
  if (!user.transactionPinHash) {
    throw new PaymentError('No PIN set. Use set PIN first.', 'PIN_NOT_SET');
  }

  if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
    const unlockIn = Math.ceil(
      (user.pinLockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new PaymentError(
      `PIN locked. Try again in ${unlockIn} minutes.`,
      'PIN_LOCKED',
    );
  }

  const valid = await verifyPin(dto.currentPin, user.transactionPinHash);
  if (!valid) {
    const newAttempts = user.pinAttempts + 1;
    const updateData: { pinAttempts: number; pinLockedUntil?: Date } = {
      pinAttempts: newAttempts,
    };
    if (newAttempts >= 5) {
      updateData.pinLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      updateData.pinAttempts = 0;
    }
    await prisma.user.update({ where: { id: userId }, data: updateData });
    throw new PaymentError('Current PIN is incorrect', 'INVALID_PIN');
  }

  const newPinHash = await hashPin(dto.newPin);
  await prisma.user.update({
    where: { id: userId },
    data: {
      transactionPinHash: newPinHash,
      pinAttempts: 0,
      pinLockedUntil: null,
    },
  });
}
