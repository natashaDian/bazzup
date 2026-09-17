import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/notifications";

export async function GET() {
  const user = await requireUser();

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id),
    getUnreadCount(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
