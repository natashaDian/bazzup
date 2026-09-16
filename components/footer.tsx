import Image from "next/image";
import Link from "next/link";

import type { Role } from "@prisma/client";

import bazzupLogo from "./assets/bazzup logo.png";

const FOOTER_NAV_LINKS: Record<Role, [{ label: string; href: string }, { label: string; href: string }]> = {
  VENDOR: [
    { label: "Find a Booth", href: "/explore" },
    { label: "Learn More", href: "/about" },
  ],
  ORGANIZER: [
    { label: "Create an Event", href: "/organizer/bazaars/new" },
    { label: "Incoming Applications", href: "/organizer/applications" },
  ],
};

export function Footer({ role = "VENDOR" }: { role?: Role }) {
  const [firstLink, secondLink] = FOOTER_NAV_LINKS[role];

  // Vendor pages have no sidebar, so the content column is much wider than
  // the organizer's - without centering, the row piles up on the left with
  // a lot of dead space on the right at laptop widths.
  const rowAlignClass = role === "VENDOR" ? "xl:justify-center" : "";

  return (
    <footer className="mt-8 w-full border-t border-[#E5E0EB] bg-white sm:mt-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 md:px-8 xl:px-8 xl:py-6">
        <div
          className={`flex flex-col items-center gap-3 text-center xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-4 xl:gap-y-2 xl:text-left ${rowAlignClass}`}
        >
          {/* Logo */}
          <div className="flex w-full items-center justify-center border-b border-[#E5E0EB] pb-3 xl:w-auto xl:border-b-0 xl:border-r xl:border-[#E5E0EB] xl:pb-0 xl:pr-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={bazzupLogo}
                alt="BazzUp"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </Link>
          </div>

          {/* Brand text */}
          <div className="flex w-full flex-col items-center gap-0.5 border-b border-[#E5E0EB] pb-3 xl:w-auto xl:items-start xl:border-b-0 xl:border-r xl:border-[#E5E0EB] xl:pb-0 xl:pr-4">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#7A5CA8]">
              BOOST YOUR BAZAAR
            </p>
            <p className="max-w-xs text-[11px] leading-4 text-[#6B7280] xl:max-w-none">
              Discover booths and new opportunities for your events and business.
            </p>
          </div>

          {/* Role-based navigation */}
          <nav className="flex w-full items-center justify-center gap-2.5 border-b border-[#E5E0EB] pb-3 xl:w-auto xl:border-b-0 xl:border-r xl:border-[#E5E0EB] xl:pb-0 xl:pr-4">
            <Link
              href={firstLink.href}
              className="whitespace-nowrap text-xs font-medium text-[#3B1F4A] transition-colors duration-200 hover:text-[#7A5CA8]"
            >
              {firstLink.label}
            </Link>

            <span className="h-1 w-1 shrink-0 rounded-full bg-[#B98CDE]" />

            <Link
              href={secondLink.href}
              className="whitespace-nowrap text-xs font-medium text-[#3B1F4A] transition-colors duration-200 hover:text-[#7A5CA8]"
            >
              {secondLink.label}
            </Link>
          </nav>

          {/* Copyright */}
          <div className="flex w-full items-center justify-center xl:w-auto">
            <p className="whitespace-nowrap text-[11px] text-[#6B7280]">
              © 2026 BazzUp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
