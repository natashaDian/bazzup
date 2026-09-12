"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronRight } from "lucide-react";
import type { ApplicationCard } from "@/lib/applications";

type BazaarOption = { id: string; title: string };

const STATUS_DOT: Record<string, string> = {
  pending: "#EF9F27",
  confirmed: "#639922",
  rejected: "#B4B2A9",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "F&B": { bg: "#FAECE7", text: "#993C1D" },
  Fashion: { bg: "#FBEAF0", text: "#993556" },
  Lifestyle: { bg: "#EEEDFE", text: "#3C3489" },
  Beauty: { bg: "#FBEAF0", text: "#993556" },
  Services: { bg: "#E1F5EE", text: "#0F6E56" },
};

function getCategoryStyle(category: string | null) {
  if (!category) return { bg: "#F1EFE8", text: "#5F5E5A" };
  const firstCategory = category.split(",")[0].trim();
  return CATEGORY_COLORS[firstCategory] ?? { bg: "#F1EFE8", text: "#5F5E5A" };
}

function getScoreColor(score: number | null) {
  const value = score ?? 0;
  if (value >= 70) return "#639922";
  if (value >= 40) return "#EF9F27";
  return "#E24B4A";
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MatchRing({ score }: { score: number | null }) {
  const value = score ?? 0;
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * value) / 100;
  const color = getScoreColor(score);

  return (
    <div className="relative w-8 h-8 shrink-0">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#F1EFE8"
          strokeWidth="4"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 16 16)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function VendorLink({
  vendorId,
  vendorName,
  initials,
}: {
  vendorId: string;
  vendorName: string;
  initials: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Link
        href={`/organizer/vendors/${vendorId}`}
        className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-[11px] font-medium text-accent shrink-0"
      >
        {initials}
      </Link>
      <Link
        href={`/organizer/vendors/${vendorId}`}
        className="text-xs font-medium text-accent underline decoration-secondary/40 hover:decoration-accent"
      >
        {vendorName}
      </Link>
    </div>
  );
}

function PendingCard({ app }: { app: ApplicationCard }) {
  const categoryStyle = getCategoryStyle(app.category);

  return (
    <div
      className="bg-card rounded-2xl p-3.5"
      style={{ borderTop: "3px solid #EF9F27" }}
    >
      <div className="flex items-start justify-between mb-2">
        <VendorLink
          vendorId={app.vendorId}
          vendorName={app.vendorName}
          initials={app.vendorInitials}
        />
        <MatchRing score={app.matchScore} />
      </div>
      {app.category && (
        <span
          className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mb-2"
          style={{
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.text,
          }}
        >
          {app.category.split(",")[0].trim()}
        </span>
      )}
      <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
        <MapPin className="size-3" />
        {app.bazaarTitle} &middot; {app.areaName}
      </p>
      <p className="text-[9px] text-secondary mb-2.5">
        Applied on {formatDate(app.appliedAt)}
      </p>
      <Link
        href={`/organizer/applications/${app.id}`}
        className="block w-full text-center bg-secondary/15 text-accent text-[11px] py-1.5 rounded-lg"
      >
        See details
      </Link>
    </div>
  );
}

function SimpleCard({
  app,
  borderColor,
  dateLabel,
  dateValue,
}: {
  app: ApplicationCard;
  borderColor: string;
  dateLabel: string;
  dateValue: Date | null;
}) {
  const categoryStyle = getCategoryStyle(app.category);

  return (
    <Link
      href={`/organizer/applications/${app.id}`}
      className="block bg-card rounded-2xl p-3.5 hover:shadow-sm transition-shadow"
      style={{ borderTop: `3px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center text-[11px] font-medium text-accent shrink-0"
        >
          {app.vendorInitials}
        </span>
        <div>
          <p className="text-xs font-medium text-accent underline decoration-secondary/40">
            {app.vendorName}
          </p>
          {app.category && (
            <span
              className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-0.5"
              style={{
                backgroundColor: categoryStyle.bg,
                color: categoryStyle.text,
              }}
            >
              {app.category.split(",")[0].trim()}
            </span>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
        <MapPin className="size-3" />
        {app.bazaarTitle} &middot; {app.areaName}
      </p>
      <p className="text-[9px] text-secondary">
        {dateLabel} {dateValue ? formatDate(dateValue) : "-"}
      </p>
    </Link>
  );
}

export function ApplicationsBoardClient({
  board,
  bazaarOptions,
  selectedBazaarId,
  searchQuery,
  sort,
}: {
  board: {
    pending: ApplicationCard[];
    confirmed: ApplicationCard[];
    rejected: ApplicationCard[];
  };
  bazaarOptions: BazaarOption[];
  selectedBazaarId: string;
  searchQuery: string;
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchQuery);

  function updateParams(next: {
    bazaarId?: string;
    q?: string;
    sort?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium">Incoming applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review vendors and manage decisions in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateParams({ q: query })}
              placeholder="Search vendor"
              className="pl-8 pr-3 py-2 rounded-lg border border-input bg-card text-xs w-40"
            />
          </div>
          <select
            value={selectedBazaarId}
            onChange={(e) => updateParams({ bazaarId: e.target.value })}
            className="text-xs px-3 py-2 rounded-lg border border-input bg-card"
          >
            <option value="">All bazaars</option>
            {bazaarOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: STATUS_DOT.pending }}
              />
              <span className="text-sm font-medium">Pending review</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">
                {board.pending.length}
              </span>
            </div>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="text-[10px] px-2 py-1 rounded-md border border-input bg-card text-accent"
            >
              <option value="newest">Newest first</option>
              <option value="highest">Highest score</option>
            </select>
          </div>
          <div className="flex flex-col gap-2.5">
            {board.pending.length > 0 ? (
              board.pending.map((app) => <PendingCard key={app.id} app={app} />)
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center text-xs text-muted-foreground">
                No pending applications.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_DOT.confirmed }}
            />
            <span className="text-sm font-medium">Confirmed</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#27500A]">
              {board.confirmed.length}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {board.confirmed.length > 0 ? (
              board.confirmed.map((app) => (
                <SimpleCard
                  key={app.id}
                  app={app}
                  borderColor="#639922"
                  dateLabel="Confirmed at"
                  dateValue={app.paymentConfirmedAt}
                />
              ))
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center text-xs text-muted-foreground">
                No confirmed vendors yet.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_DOT.rejected }}
            />
            <span className="text-sm font-medium">Rejected</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[#5F5E5A]">
              {board.rejected.length}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {board.rejected.length > 0 ? (
              board.rejected.map((app) => (
                <SimpleCard
                  key={app.id}
                  app={app}
                  borderColor="#B4B2A9"
                  dateLabel="Rejected at"
                  dateValue={app.appliedAt}
                />
              ))
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center text-xs text-muted-foreground">
                No rejected applications.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
