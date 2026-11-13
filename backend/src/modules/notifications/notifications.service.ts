import { prisma } from '../../config/database';
import { NotificationType, Prisma } from '@prisma/client';
import { getPagination } from '../../types';

export async function getNotifications(
  userId: string,
  query: { page?: string; limit?: string },
) {
  const { page, limit, skip } = getPagination(query);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { items: notifications, total, unreadCount, page, limit };
}

export async function markAsRead(notificationId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: unknown;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: (params.data as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    },
  });
}
