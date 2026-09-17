"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { clearJustLoggedInFlag } from "@/lib/clear-login-flag";

export function CreateFirstBazaarPopup({
  hasBazaars,
  justLoggedIn,
}: {
  hasBazaars: boolean;
  justLoggedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasBazaars && justLoggedIn) {
      setOpen(true);
      clearJustLoggedInFlag();
    }
  }, [hasBazaars, justLoggedIn]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 max-w-xs w-full relative">
        <button
          onClick={() => setOpen(false)}
          aria-label="Tutup"
          className="absolute top-3 right-3 text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <p className="text-base font-medium mb-1">
          Ayo mulai bazaar pertama Anda!
        </p>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Siapkan dalam beberapa menit dan vendor bisa langsung mengajukan aplikasi.
        </p>

        <button
          onClick={() => router.push("/organizer/bazaars/new")}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium"
        >
          Buat Bazaar
        </button>
      </div>
    </div>
  );
}
