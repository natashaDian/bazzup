import { BellIcon } from "lucide-react";

import type { User } from "@prisma/client";

/**
 * Notification bell + profile avatar, shown at the far right of every
 * organizer page header. Mirrors the same cluster on the vendor navbar
 * (components/vendor-nav.tsx) for a consistent look across roles.
 */
export function OrganizerHeaderActions({ user }: { user: User }) {
  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        aria-label="Notifications"
        className="rounded-full p-2 transition-colors duration-200 hover:bg-[#F3EAFB]"
      >
        <BellIcon className="size-4 text-muted-foreground sm:size-5" />
      </button>

      <div className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2">
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

        <span className="hidden text-sm font-medium text-[#3B1F4A] md:block">
          {user.name}
        </span>
      </div>
    </div>
  );
}
