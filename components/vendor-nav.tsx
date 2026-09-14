"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BellIcon,
  SparklesIcon,
  UserIcon,
  PackageIcon,
  ImageIcon,
  LogOutIcon,
} from "lucide-react";
import type { User } from "@prisma/client";
import { signOutAction } from "@/lib/sign-out";

export function VendorNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3 sm:gap-6">
      <div className="flex items-center gap-3 sm:gap-6">
        <Link
          href="/vendor"
          className="flex items-center gap-1.5 font-bold text-primary"
        >
          <SparklesIcon className="size-5" />
          BazzUp
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
          <Link href="/vendor" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/explore" className="hover:text-foreground">
            Explore
          </Link>
          <Link href="/applications" className="hover:text-foreground">
            Status
          </Link>
          <span className="cursor-default">About</span>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <BellIcon className="size-5 text-muted-foreground" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
          >
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
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card shadow-lg overflow-hidden z-50">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                  {user.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profileImageUrl}
                      alt={user.name}
                      className="size-9 object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.businessName || user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Vendor</p>
                </div>
              </div>

              <div className="py-1.5">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary/10"
                >
                  <UserIcon className="size-4 text-muted-foreground" />
                  My Profile
                </Link>
                <Link
                  href="/profile#products"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary/10"
                >
                  <PackageIcon className="size-4 text-muted-foreground" />
                  My Products
                </Link>
                <Link
                  href="/profile#portfolio"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary/10"
                >
                  <ImageIcon className="size-4 text-muted-foreground" />
                  My Portfolio
                </Link>
              </div>

              <div className="border-t py-1.5">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOutIcon className="size-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
