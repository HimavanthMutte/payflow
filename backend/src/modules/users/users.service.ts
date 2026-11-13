import { prisma } from '../../config/database';
import { NotFoundError } from '../../middleware/error.middleware';
import type { UpdateUserDto } from './users.schema';

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      phone: true,
      virtualPaymentId: true,
      avatarUrl: true,
      status: true,
      createdAt: true,
      transactionPinHash: true,
      wallet: {
        select: { balance: true, currency: true, dailyLimit: true },
      },
    },
  });
  if (!user) throw new NotFoundError('User');
  const { transactionPinHash, ...rest } = user;
  return { ...rest, hasPinSet: !!transactionPinHash };
}

export async function updateMe(userId: string, dto: UpdateUserDto) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: dto,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      phone: true,
      virtualPaymentId: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function searchUsers(query: string, currentUserId: string) {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { status: 'ACTIVE' },
        { id: { not: currentUserId } },
        {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
            { virtualPaymentId: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      virtualPaymentId: true,
      avatarUrl: true,
    },
    take: 20,
  });
  return users;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, status: 'ACTIVE' },
    select: {
      id: true,
      username: true,
      displayName: true,
      virtualPaymentId: true,
      avatarUrl: true,
    },
  });
  if (!user) throw new NotFoundError('User');
  return user;
}
