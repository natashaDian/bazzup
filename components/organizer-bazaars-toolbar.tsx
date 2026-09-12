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
  { key: "ALL", label: "All", icon: LayoutGrid },
  { key: "DRAFT", label: "Draft", icon: FilePenLine },
  { key: "ACTIVE", label: "Active", icon: CircleCheck },
  { key: "FULL", label: "Full", icon: Lock },
  { key: "COMPLETED", label: "Completed", icon: FlagTriangleRight },
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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by bazaar name or city"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm"
          />
        </div>
        <a
          href="/organizer/bazaars/new"
          className="flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
        >
          <Plus className="size-4" />
          Create bazaar
        </a>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label, icon: Icon }) => {
          const isActive = currentStatus === key || (key === "ALL" && !currentStatus);
          return (
            <button
              key={key}
              onClick={() => updateParams({ status: key })}
              className={`flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
              <span
                className={`text-xs px-1.5 rounded-full ${
                  isActive ? "bg-white/25" : "bg-secondary/20 text-accent"
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