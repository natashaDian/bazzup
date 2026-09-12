import Link from "next/link";
import Image from "next/image";

import { BellIcon, SparklesIcon } from "lucide-react";
import type { User } from "@prisma/client";
import bazzupLogo from "./assets/bazzup logo.png";

export function VendorNav({ user }: { user: User }) {
  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3 sm:gap-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/vendor" className="flex items-center">
          <Image
            src={bazzupLogo}
            alt="BazzUp"
            width={70}
            height={32}
            className="h-auto w-[70px]"
          />
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
          <Link href="/vendor" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <span className="cursor-default">About</span>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <BellIcon className="size-5 text-muted-foreground" />
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
          {user.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profileImageUrl} alt={user.name} className="size-8 object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
