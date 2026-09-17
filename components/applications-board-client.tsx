"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronRight, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationCard } from "@/lib/applications";

type BazaarOption = { id: string; title: string };

const ALL_BAZAAR_VALUE = "__all__";

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
    <div className="flex items-center gap-3">
      <Link
        href={`/organizer/vendors/${vendorId}`}
        className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-xs font-medium text-[#7A5CA8] shrink-0"
      >
        {initials}
      </Link>
      <Link
        href={`/organizer/vendors/${vendorId}`}
        className="text-sm font-medium text-[#7A5CA8] underline decoration-secondary/40 hover:decoration-[#7A5CA8]"
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
      className="bg-card rounded-2xl p-4 shadow-sm"
      style={{ borderTop: "3px solid #EF9F27" }}
    >
      <div className="flex items-start justify-between mb-3">
        <VendorLink
          vendorId={app.vendorId}
          vendorName={app.vendorName}
          initials={app.vendorInitials}
        />
        <MatchRing score={app.matchScore} />
      </div>
      {app.category && (
        <span
          className="inline-block text-[10px] px-2 py-1 rounded-full mb-2.5"
          style={{
            backgroundColor: categoryStyle.bg,
            color: categoryStyle.text,
          }}
        >
          {app.category.split(",")[0].trim()}
        </span>
      )}
      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
        <MapPin className="size-3" />
        {app.bazaarTitle} &middot; {app.areaName}
      </p>
      <p className="text-[11px] text-secondary mb-3">
        Diajukan pada {formatDate(app.appliedAt)}
      </p>
      <Link
        href={`/organizer/applications/${app.id}`}
        className="flex w-full items-center justify-center gap-1 bg-secondary/15 text-primary text-xs font-medium py-2 rounded-lg transition-colors hover:bg-secondary/25"
      >
        Lihat Detail
        <ChevronRight className="size-3.5" />
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
      className="block bg-card rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderTop: `3px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          onClick={(e) => e.stopPropagation()}
          className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-xs font-medium text-[#7A5CA8] shrink-0"
        >
          {app.vendorInitials}
        </span>
        <div>
          <p className="text-sm font-medium text-[#7A5CA8] underline decoration-secondary/40">
            {app.vendorName}
          </p>
          {app.category && (
            <span
              className="inline-block text-[10px] px-2 py-1 rounded-full mt-1"
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
      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
        <MapPin className="size-3" />
        {app.bazaarTitle} &middot; {app.areaName}
      </p>
      <p className="text-[11px] text-secondary">
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
  const [openSections, setOpenSections] = useState({
    pending: true,
    confirmed: true,
    rejected: true,
  });

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-[#3B1F4A]">
            Pendaftaran Masuk
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Tinjau vendor dan kelola keputusan di satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex gap-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateParams({ q: query })}
                placeholder="Cari vendor"
                className="h-10 pl-10 pr-4 rounded-lg border border-[#E5E0EB] bg-white text-sm shadow-sm transition-all w-40 sm:w-48 hover:border-[#B98CDE] focus:outline-none focus:ring-2 focus:ring-[#7A5CA8]/30 focus:border-[#7A5CA8]"
              />
            </div>
            <Select
              value={selectedBazaarId || ALL_BAZAAR_VALUE}
              onValueChange={(value) =>
                updateParams({
                  bazaarId: value === ALL_BAZAAR_VALUE ? "" : (value ?? ""),
                })
              }
            >
              <SelectTrigger className="!h-10 w-fit rounded-lg border-[#E5E0EB] bg-white px-4 text-sm text-[#3B1F4A] shadow-sm transition-all hover:border-[#B98CDE] hover:shadow-md focus-visible:border-[#7A5CA8] focus-visible:ring-[#7A5CA8]/30">
                <SelectValue>
                  {(value: string) =>
                    value === ALL_BAZAAR_VALUE
                      ? "Semua bazaar"
                      : (bazaarOptions.find((b) => b.id === value)?.title ??
                        "Semua bazaar")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[180px] rounded-2xl border border-[#E5E0EB] bg-white p-2 shadow-lg">
                <SelectItem
                  value={ALL_BAZAAR_VALUE}
                  className="rounded-lg px-3 py-2.5 text-sm text-[#3B1F4A] data-[selected]:bg-[#F3EAFB] data-[selected]:font-medium data-[highlighted]:bg-[#F3EAFB]"
                >
                  Semua bazaar
                </SelectItem>
                {bazaarOptions.map((b) => (
                  <SelectItem
                    key={b.id}
                    value={b.id}
                    className="rounded-lg px-3 py-2.5 text-sm text-[#3B1F4A] data-[selected]:bg-[#F3EAFB] data-[selected]:font-medium data-[highlighted]:bg-[#F3EAFB]"
                  >
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-secondary/10 p-4">
          <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_DOT.pending }}
              />
              <span className="text-sm font-semibold text-[#3B1F4A]">
                Menunggu Peninjauan
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">
                {board.pending.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Select
                value={sort}
                onValueChange={(value) => updateParams({ sort: value ?? "newest" })}
              >
                <SelectTrigger className="h-auto w-fit rounded-full border-[#E5E0EB] bg-white px-2.5 py-1 text-xs text-[#7A5CA8] shadow-sm transition-colors hover:border-[#B98CDE] focus-visible:ring-[#7A5CA8]/30">
                  <SelectValue>
                    {(value: string) =>
                      value === "highest" ? "Skor tertinggi" : "Terbaru"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[160px] rounded-2xl border border-[#E5E0EB] bg-white p-2 shadow-lg">
                  <SelectItem
                    value="newest"
                    className="rounded-lg px-3 py-2 text-sm text-[#3B1F4A] data-[selected]:bg-[#F3EAFB] data-[selected]:font-medium data-[highlighted]:bg-[#F3EAFB]"
                  >
                    Terbaru
                  </SelectItem>
                  <SelectItem
                    value="highest"
                    className="rounded-lg px-3 py-2 text-sm text-[#3B1F4A] data-[selected]:bg-[#F3EAFB] data-[selected]:font-medium data-[highlighted]:bg-[#F3EAFB]"
                  >
                    Skor tertinggi
                  </SelectItem>
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => toggleSection("pending")}
                aria-label={openSections.pending ? "Ciutkan" : "Perluas"}
                aria-expanded={openSections.pending}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/70 lg:hidden"
              >
                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${
                    openSections.pending ? "" : "-rotate-90"
                  }`}
                />
              </button>
            </div>
          </div>
          <div
            className={`${openSections.pending ? "flex" : "hidden"} flex-col gap-3 lg:flex`}
          >
            {board.pending.length > 0 ? (
              board.pending.map((app) => <PendingCard key={app.id} app={app} />)
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center text-sm text-muted-foreground shadow-sm">
                Tidak ada pendaftaran yang menunggu.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/10 p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_DOT.confirmed }}
              />
              <span className="text-sm font-semibold text-[#3B1F4A]">
                Dikonfirmasi
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#27500A]">
                {board.confirmed.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleSection("confirmed")}
              aria-label={openSections.confirmed ? "Ciutkan" : "Perluas"}
              aria-expanded={openSections.confirmed}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/70 lg:hidden"
            >
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${
                  openSections.confirmed ? "" : "-rotate-90"
                }`}
              />
            </button>
          </div>
          <div
            className={`${openSections.confirmed ? "flex" : "hidden"} flex-col gap-3 lg:flex`}
          >
            {board.confirmed.length > 0 ? (
              board.confirmed.map((app) => (
                <SimpleCard
                  key={app.id}
                  app={app}
                  borderColor="#639922"
                  dateLabel="Dikonfirmasi pada"
                  dateValue={app.paymentConfirmedAt}
                />
              ))
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center text-sm text-muted-foreground shadow-sm">
                Belum ada vendor yang dikonfirmasi.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/10 p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_DOT.rejected }}
              />
              <span className="text-sm font-semibold text-[#3B1F4A]">
                Ditolak
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[#5F5E5A]">
                {board.rejected.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleSection("rejected")}
              aria-label={openSections.rejected ? "Ciutkan" : "Perluas"}
              aria-expanded={openSections.rejected}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/70 lg:hidden"
            >
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${
                  openSections.rejected ? "" : "-rotate-90"
                }`}
              />
            </button>
          </div>
          <div
            className={`${openSections.rejected ? "flex" : "hidden"} flex-col gap-3 lg:flex`}
          >
            {board.rejected.length > 0 ? (
              board.rejected.map((app) => (
                <SimpleCard
                  key={app.id}
                  app={app}
                  borderColor="#B4B2A9"
                  dateLabel="Ditolak pada"
                  dateValue={app.appliedAt}
                />
              ))
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center text-sm text-muted-foreground shadow-sm">
                Tidak ada pendaftaran yang ditolak.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
