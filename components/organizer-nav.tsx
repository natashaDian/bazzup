import Link from "next/link";
import { SparklesIcon, UserIcon, ImageIcon, LogOutIcon } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import type { User } from "@prisma/client";

export function OrganizerNav({ user }: { user: User }) {
  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3 sm:gap-6">
      <div className="flex items-center gap-3 sm:gap-6">
        <Link
          href="/organizer"
          className="flex items-center gap-1.5 font-bold text-primary"
        >
          <SparklesIcon className="size-5" />
          BazzUp
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
          <Link href="/organizer" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/organizer/bazaars" className="hover:text-foreground">
            My Bazaars
          </Link>
          <Link
            href="/organizer/applications"
            className="hover:text-foreground"
          >
            Incoming Applications
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell className="size-5 text-muted-foreground" />
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
          {user.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="size-8 object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
