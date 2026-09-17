"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import {
  LayoutGrid,
  FilePenLine,
  CircleCheck,
  Lock,
  FlagTriangleRight,
  Search,
  Plus,
} from "lucide-react";

const FILTERS = [
  { key: "ALL", label: "Semua", icon: LayoutGrid },
  { key: "DRAFT", label: "Draf", icon: FilePenLine },
  { key: "ACTIVE", label: "Aktif", icon: CircleCheck },
  { key: "FULL", label: "Penuh", icon: Lock },
  { key: "COMPLETED", label: "Selesai", icon: FlagTriangleRight },
];

type Counts = { all: number; DRAFT: number; ACTIVE: number; FULL: number; COMPLETED: number };

export function OrganizerBazaarsToolbar({
  counts,
  currentStatus,
  currentQuery,
}: {
  counts: Counts;
  currentStatus: string;
  currentQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(currentQuery);

  function updateParams(next: { status?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.status !== undefined) {
      if (next.status === "ALL") params.delete("status");
      else params.set("status", next.status);
    }
    if (next.q !== undefined) {
      if (!next.q) params.delete("q");
      else params.set("q", next.q);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    updateParams({ q: value });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari berdasarkan nama bazaar atau kota"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-card text-sm shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-[#7A5CA8]/30 focus:border-[#7A5CA8]"
          />
        </div>
        <a
          href="/organizer/bazaars/new"
          className="search-gradient-button flex items-center gap-1.5 text-white px-5 py-2.5 rounded-lg text-sm shadow-sm"
        >
          <Plus className="size-4" />
          Buat Bazaar
        </a>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const isActive = currentStatus === key || (key === "ALL" && !currentStatus);
          return (
            <button
              key={key}
              onClick={() => updateParams({ status: key })}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-card text-muted-foreground shadow-sm hover:text-[#3B1F4A]"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
              <span
                className={`text-xs px-1.5 rounded-full ${
                  isActive ? "bg-black/15" : "bg-secondary/20 text-primary"
                }`}
              >
                {counts[key as keyof Counts]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}