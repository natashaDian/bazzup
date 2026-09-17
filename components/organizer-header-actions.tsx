"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImageIcon, LogOutIcon, UserIcon } from "lucide-react";

import type { User } from "@prisma/client";
import { signOutAction } from "@/lib/sign-out";
import { NotificationBell } from "@/components/notification-bell";

export function OrganizerHeaderActions({ user }: { user: User }) {
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
    <div className="flex items-center gap-2 shrink-0">
      <NotificationBell />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-200 hover:bg-[#F3EAFB]"
        >
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            {user.profileImageUrl ? (
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
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-card shadow-lg overflow-hidden z-50">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b">
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                {user.profileImageUrl ? (
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
                <p className="text-xs text-muted-foreground">Organizer</p>
              </div>
            </div>

            <div className="py-1.5">
              <Link
                href="/organizer/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary/10"
              >
                <UserIcon className="size-4 text-muted-foreground" />
                Profil
              </Link>
              <Link
                href="/organizer/profile#past-bazaars"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary/10"
              >
                <ImageIcon className="size-4 text-muted-foreground" />
                Bazaar Sebelumnya
              </Link>
            </div>

            <div className="border-t py-1.5">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOutIcon className="size-4" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
