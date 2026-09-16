import { NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/notifications";

export async function GET() {
  const user = await requireOrganizer();

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id),
    getUnreadCount(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
