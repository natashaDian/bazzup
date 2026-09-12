import Image from "next/image";
import Link from "next/link";

import bazzupLogo from "./assets/bazzup logo.png";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E0EB] bg-[#F3EAFB]">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        
        {/* Main Footer */}
        <div className="flex flex-col items-center py-14 text-center md:py-16">
          <Link href="/" className="inline-flex items-center">
            <Image
              src={bazzupLogo}
              alt="BazzUp"
              width={110}
              height={44}
              className="h-auto w-[110px]"
            />
          </Link>

          <p className="mt-5 text-sm font-medium tracking-[0.28em] text-[#7A5CA8]">
            BOOST YOUR BAZAAR
          </p>

          <p className="mt-3 max-w-md text-sm leading-6 text-[#6B7280]">
            Temukan booth dan peluang baru untuk acara dan bisnis kamu.
          </p>

          <nav className="mt-8 flex items-center gap-8">
            <Link
              href="/vendor"
              className="text-sm font-medium text-[#3B1F4A] transition-colors duration-200 hover:text-[#7A5CA8]"
            >
              Cari Booth
            </Link>

            <span className="h-1 w-1 rounded-full bg-[#B98CDE]" />

            <Link
              href="/organizer"
              className="text-sm font-medium text-[#3B1F4A] transition-colors duration-200 hover:text-[#7A5CA8]"
            >
              Jadi Partner
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#E5E0EB] py-6 text-center">
          <p className="text-xs text-[#6B7280]">
            © 2026 BazzUp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}