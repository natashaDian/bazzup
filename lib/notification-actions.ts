"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification || notification.userId !== user.id) {
    return { error: "Notification not found." };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath(user.role === "VENDOR" ? "/vendor" : "/organizer");
  return {};
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath(user.role === "VENDOR" ? "/vendor" : "/organizer");
  return {};
}

export async function deleteNotificationAction(notificationId: string) {
  const user = await requireOrganizer();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification || notification.userId !== user.id) {
    return { error: "Notification not found." };
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  revalidatePath("/organizer");
  return {};
}
