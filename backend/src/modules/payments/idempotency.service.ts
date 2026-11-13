import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

const IDEMPOTENCY_TTL_HOURS = 24;

export async function checkIdempotency(
  key: string,
  userId: string,
): Promise<{ cached: boolean; statusCode?: number; responseBody?: unknown }> {
  const existing = await prisma.idempotencyRecord.findUnique({
    where: { idempotencyKey: key },
  });

  if (!existing) {
    return { cached: false };
  }

  // If expired, delete and allow retry
  if (existing.expiresAt < new Date()) {
    await prisma.idempotencyRecord.delete({ where: { idempotencyKey: key } });
    return { cached: false };
  }

  // Idempotency key belongs to different user - do not disclose
  if (existing.userId !== userId) {
    return { cached: false };
  }

  return {
    cached: true,
    statusCode: existing.statusCode,
    responseBody: existing.responseBody,
  };
}

export async function saveIdempotencyRecord(params: {
  idempotencyKey: string;
  userId: string;
  paymentId?: string;
  statusCode: number;
  responseBody: unknown;
}): Promise<void> {
  const { idempotencyKey, userId, paymentId, statusCode, responseBody } = params;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + IDEMPOTENCY_TTL_HOURS);

  try {
    await prisma.idempotencyRecord.create({
      data: {
        idempotencyKey,
        userId,
        paymentId,
        statusCode,
        responseBody: (responseBody as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        expiresAt,
      },
    });
  } catch (error) {
    // If concurrent insert occurs, let database uniqueness rule handle it
  }
}
