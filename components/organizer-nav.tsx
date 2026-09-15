"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  InboxIcon,
  LayoutDashboardIcon,
  MenuIcon,
  StoreIcon,
  XIcon,
} from "lucide-react";

import { useSidebarCollapsed } from "@/components/organizer-sidebar-context";

import bazzupLogo from "./assets/bazzup logo.png";

// Matches Tailwind's `lg` breakpoint - the sidebar is static above it and an
// off-canvas overlay below it.
const DESKTOP_QUERY = "(min-width: 1024px)";

function isNavItemActive(pathname: string, href: string) {
  // Dashboard ("/organizer") should only be active on that exact route -
  // nested routes like /organizer/bazaars must not also light up Dashboard.
  if (href === "/organizer") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const navItems = [
  {
    label: "Dashboard",
    href: "/organizer",
    icon: LayoutDashboardIcon,
  },
  {
    label: "My Bazaars",
    href: "/organizer/bazaars",
    icon: StoreIcon,
  },
  {
    label: "Incoming Applications",
    href: "/organizer/applications",
    icon: InboxIcon,
  },
];

type Indicator = { left: number; top: number; width: number; height: number };

export function OrganizerNav() {
  const pathname = usePathname();
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const { collapsed } = useSidebarCollapsed();

  // Open on desktop, closed (off-canvas) on smaller screens by default.
  const [open, setOpen] = useState(false);

  const activeHref = navItems.find((item) =>
    isNavItemActive(pathname, item.href),
  )?.href;

  // Keep the sidebar open on desktop and auto-close it whenever the
  // viewport shrinks below the desktop breakpoint (it no longer fits
  // alongside the content).
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setOpen(mql.matches);

    sync();

    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // Close the mobile overlay after navigating to a new section.
  useEffect(() => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      setOpen(false);
    }
  }, [pathname]);

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

    // Re-measure once the collapse/expand width transition (duration-300)
    // has settled, since `width` animates the actual box geometry over
    // time rather than just compositing.
    const settleTimer = window.setTimeout(measure, 320);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(settleTimer);
    };
  }, [activeHref, collapsed]);

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-xl bg-white text-[#3B1F4A] shadow-md transition-colors duration-200 hover:bg-[#F3EAFB] lg:hidden"
      >
        {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 isolate flex h-screen w-64 shrink-0 flex-col overflow-hidden bg-sidebar transition-[transform,width] duration-300 ease-out lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Animated purple background glow - same treatment as the /vendor hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="home-gradient home-gradient-one" />
          <div className="home-gradient home-gradient-two" />
        </div>

        <div
          className={`relative z-10 flex items-center justify-center px-6 py-6 transition-[padding] duration-300 ${collapsed ? "lg:px-2" : ""}`}
        >
          <Link href="/organizer" className="flex w-fit items-center">
            <Image
              src={bazzupLogo}
              alt="BazzUp"
              width={90}
              height={40}
              className={`h-auto w-[90px] transition-[width] duration-300 ${
                collapsed ? "lg:w-8" : "lg:w-[90px]"
              }`}
              priority
            />
          </Link>
        </div>

        <nav className="relative z-10 flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {indicator && (
            <span
              aria-hidden
              className="absolute rounded-xl bg-[#7A5CA8] shadow-sm transition-all duration-300 ease-out"
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
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.href, el);
                  else itemRefs.current.delete(item.href);
                }}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? `relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-colors duration-300 ${collapsed ? "lg:justify-center" : ""}`
                    : `relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#3B1F4A] transition-colors duration-300 hover:bg-[#F3EAFB] hover:text-[#7A5CA8] ${collapsed ? "lg:justify-center" : ""}`
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
