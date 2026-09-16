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

  return (
    <footer className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-[#F3EAFB] px-6 py-6 sm:px-10 md:rounded-full md:py-0">
        <div className="flex flex-col items-center text-center md:flex-row md:items-stretch md:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center border-b border-[#E5E0EB] pb-5 md:border-b-0 md:border-r md:py-5 md:pr-6">
            <Link href="/" className="inline-flex items-center">
              <Image
                src={bazzupLogo}
                alt="BazzUp"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
              />
            </Link>
          </div>

          {/* Brand text */}
          <div className="flex flex-col items-center justify-center gap-1 border-b border-[#E5E0EB] py-5 md:items-start md:border-b-0 md:border-r md:px-6">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#7A5CA8]">
              BOOST YOUR BAZAAR
            </p>
            <p className="max-w-xs text-sm leading-6 text-[#6B7280]">
              Discover booths and new opportunities for your events and business.
            </p>
          </div>

          {/* Role-based navigation */}
          <nav className="flex items-center justify-center gap-3 border-b border-[#E5E0EB] py-5 md:border-b-0 md:border-r md:px-6">
            <Link
              href={firstLink.href}
              className="text-sm font-semibold text-[#3B1F4A] transition-colors duration-200 hover:text-[#7A5CA8]"
            >
              {firstLink.label}
            </Link>

            <span className="h-1 w-1 shrink-0 rounded-full bg-[#B98CDE]" />

            <Link
              href={secondLink.href}
              className="text-sm font-semibold text-[#3B1F4A] transition-colors duration-200 hover:text-[#7A5CA8]"
            >
              {secondLink.label}
            </Link>
          </nav>

          {/* Copyright */}
          <div className="flex items-center justify-center pt-5 md:pt-0 md:pl-6">
            <p className="text-sm text-[#6B7280]">
              © 2026 BazzUp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
