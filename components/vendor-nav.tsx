"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { BellIcon } from "lucide-react";

import type { User } from "@prisma/client";

import bazzupLogo from "./assets/bazzup logo.png";

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Indicator = { left: number; top: number; width: number; height: number };

export function Nav({ user }: { user: User }) {
  const pathname = usePathname();
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const navItems = [
    {
      label: "Home",
      href: "/vendor",
    },
    {
      label: "Explore",
      href: "/explore",
    },
  ];

  const activeHref = navItems.find((item) =>
    isNavItemActive(pathname, item.href),
  )?.href;

  useLayoutEffect(() => {
    const activeEl = activeHref ? itemRefs.current.get(activeHref) : undefined;

    if (!activeEl) {
      setIndicator(null);
      return;
    }

    const measure = () =>
      setIndicator({
        left: activeEl.offsetLeft,
        top: activeEl.offsetTop,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
      });

    measure();

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeHref]);

  return (
  <header className="border-b border-[#E5E0EB] bg-card">
    <div className="mx-auto grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:min-h-[88px] sm:px-6 md:px-10 lg:grid-cols-3 lg:px-16">

      {/* Left: Logo + Tagline */}
      <div className="min-w-0">
        <Link
          href="/vendor"
          className="flex w-fit items-center gap-3 sm:gap-4"
        >
          <Image
            src={bazzupLogo}
            alt="BazzUp"
            width={70}
            height={32}
            className="h-auto w-[50px] shrink-0 sm:w-[70px]"
          />

          <span className="hidden text-[10px] font-medium tracking-[0.18em] text-[#7A5CA8] lg:block">
            <span className="mr-2 text-[#B98CDE]">|</span>
            BOOST YOUR BAZAAR
          </span>
        </Link>
      </div>

      {/* Center: Navigation */}
      <div className="flex min-w-0 justify-center">
        <nav className="relative flex max-w-full items-center overflow-x-auto rounded-full border border-[#E5E0EB] bg-white px-2 py-1 shadow-sm sm:px-3 sm:py-1.5">
          {indicator && (
            <span
              aria-hidden
              className="absolute rounded-full bg-[#7A5CA8] shadow-sm transition-all duration-300 ease-out"
              style={{
                left: indicator.left,
                top: indicator.top,
                width: indicator.width,
                height: indicator.height,
              }}
            />
          )}

          {navItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.href, el);
                  else itemRefs.current.delete(item.href);
                }}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors duration-300 sm:px-5 sm:py-2 sm:text-sm"
                    : "relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3B1F4A] transition-colors duration-300 hover:bg-[#F3EAFB] hover:text-[#7A5CA8] sm:px-5 sm:py-2 sm:text-sm"
                }
              >
                {item.label}
              </Link>
            );
          })}

          <span className="relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3B1F4A] transition-colors duration-200 hover:bg-[#F3EAFB] hover:text-[#7A5CA8] sm:px-5 sm:py-2 sm:text-sm">
            About
          </span>
        </nav>
      </div>

      {/* Right: Notification + Profile */}
      <div className="flex items-center justify-end gap-1 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-2 transition-colors duration-200 hover:bg-[#F3EAFB]"
        >
          <BellIcon className="size-4 text-muted-foreground sm:size-5" />
        </button>

        <Link
          href="/vendor/profile"
          className="flex items-center gap-2 rounded-full px-1 py-1 transition-colors duration-200 hover:bg-[#F3EAFB] sm:px-2"
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
 * Compatibility export
 */
export function VendorNav({ user }: { user: User }) {
  return <Nav user={user} />;
}