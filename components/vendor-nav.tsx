import Image from "next/image";
import Link from "next/link";
import { BellIcon } from "lucide-react";
import type { User } from "@prisma/client";

import bazzupLogo from "./assets/bazzup logo.png";

export function Nav({ user }: { user: User }) {
  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const isOrganizer = user.role === "ORGANIZER";

  const navItems = isOrganizer
    ? [
        {
          label: "Dashboard",
          href: "/organizer",
        },
        {
          label: "My Bazaars",
          href: "/organizer/bazaars",
        },
        {
          label: "Incoming Applications",
          href: "/organizer/applications",
        },
      ]
    : [
        {
          label: "Home",
          href: "/vendor",
        },
        {
          label: "Explore",
          href: "/explore",
        },
      ];

  return (
    <header className="border-b border-[#E5E0EB] bg-card">
      <div className="grid min-h-[72px] grid-cols-3 items-center px-4 sm:min-h-[88px] sm:px-6 md:px-10 lg:px-16">

        {/* Left: Logo + Tagline */}
        <div className="min-w-0">
          <Link
            href={isOrganizer ? "/organizer" : "/vendor"}
            className="flex w-fit items-center gap-3 sm:gap-4"
          >
            <Image
              src={bazzupLogo}
              alt="BazzUp"
              width={70}
              height={32}
              className="h-auto w-[60px] shrink-0 sm:w-[70px]"
            />

            <span className="hidden text-[10px] font-medium tracking-[0.18em] text-[#7A5CA8] lg:block">
              <span className="mr-2 text-[#B98CDE]">|</span>
              BOOST YOUR BAZAAR
            </span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <div className="flex min-w-0 justify-center">
          <nav className="flex w-fit items-center rounded-full border border-[#E5E0EB] bg-white px-2 py-1 shadow-sm sm:px-3 sm:py-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3B1F4A] transition-colors duration-200 hover:bg-[#F3EAFB] hover:text-[#7A5CA8] sm:px-5 sm:py-2 sm:text-sm"
              >
                {item.label}
              </Link>
            ))}

            {!isOrganizer && (
              <span className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3B1F4A] transition-colors duration-200 hover:bg-[#F3EAFB] hover:text-[#7A5CA8] sm:px-5 sm:py-2 sm:text-sm">
                About
              </span>
            )}
          </nav>
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-full p-2 transition-colors duration-200 hover:bg-[#F3EAFB]"
          >
            <BellIcon className="size-4 text-muted-foreground sm:size-5" />
          </button>

          <Link
            href={
              isOrganizer
                ? "/organizer/profile"
                : "/vendor/profile"
            }
            className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors duration-200 hover:bg-[#F3EAFB] sm:px-2"
          >
            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground sm:size-8 sm:text-xs">
              {user.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="size-7 object-cover sm:size-8"
                />
              ) : (
                initials
              )}
            </div>

            <span className="hidden text-sm font-medium text-[#3B1F4A] md:block">
              {user.name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Compatibility exports
 * Both use the same Nav component and therefore the same design.
 */
export function VendorNav({ user }: { user: User }) {
  return <Nav user={user} />;
}

export function OrganizerNav({ user }: { user: User }) {
  return <Nav user={user} />;
}