import "server-only";
import { prisma } from "@/lib/prisma";

export type NotificationItem = {
  id: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: Date;
};

export async function getNotifications(
  userId: string,
  limit = 10,
): Promise<NotificationItem[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      message: true,
      linkUrl: true,
      isRead: true,
      createdAt: true,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function createNotification(params: {
  userId: string;
  message: string;
  linkUrl?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      message: params.message,
      linkUrl: params.linkUrl ?? null,
    },
  });
}

