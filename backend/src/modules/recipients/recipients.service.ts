import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../middleware/error.middleware';

export async function searchRecipients(query: string, currentUserId: string) {
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
            { phone: { contains: query } },
          ],
        },
      ],
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      virtualPaymentId: true,
      avatarUrl: true,
      phone: true,
    },
    take: 15,
  });

  return users;
}

export async function getRecentRecipients(userId: string) {
  // Find distinct recipients from sent payments
  const recentPayments = await prisma.payment.findMany({
    where: {
      senderId: userId,
      status: { in: ['SUCCESS', 'PROCESSING', 'PENDING'] },
    },
    orderBy: { createdAt: 'desc' },
    distinct: ['recipientId'],
    take: 10,
    include: {
      recipient: {
        select: {
          id: true,
          displayName: true,
          username: true,
          virtualPaymentId: true,
          avatarUrl: true,
        },
      },
    },
  });

  return recentPayments.map((p) => p.recipient);
}

export async function getFavourites(userId: string) {
  const favourites = await prisma.favouriteRecipient.findMany({
    where: { userId },
    include: {
      recipient: {
        select: {
          id: true,
          displayName: true,
          username: true,
          virtualPaymentId: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favourites.map((f) => ({
    favouriteId: f.id,
    ...f.recipient,
    addedAt: f.createdAt,
  }));
}

export async function addFavourite(userId: string, recipientId: string) {
  if (userId === recipientId) {
    throw new ConflictError('Cannot add yourself as favourite');
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId, status: 'ACTIVE' },
  });
  if (!recipient) throw new NotFoundError('Recipient');

  const existing = await prisma.favouriteRecipient.findUnique({
    where: {
      userId_recipientId: {
        userId,
        recipientId,
      },
    },
  });
  if (existing) throw new ConflictError('Recipient already in favourites');

  const favourite = await prisma.favouriteRecipient.create({
    data: { userId, recipientId },
    include: {
      recipient: {
        select: {
          id: true,
          displayName: true,
          username: true,
          virtualPaymentId: true,
          avatarUrl: true,
        },
      },
    },
  });

  return favourite;
}

export async function removeFavourite(userId: string, recipientId: string) {
  const favourite = await prisma.favouriteRecipient.findUnique({
    where: {
      userId_recipientId: {
        userId,
        recipientId,
      },
    },
  });
  if (!favourite) throw new NotFoundError('Favourite recipient');

  await prisma.favouriteRecipient.delete({
    where: { id: favourite.id },
  });
}
