"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { BazaarCard } from "@/lib/bazaars";

const AUTO_ROTATE_MS = 5000;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export function RecommendedBazaarJumbotron({ bazaars }: { bazaars: BazaarCard[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const count = bazaars.length;
  const hasMultiple = count > 1;

  function goTo(index: number) {
    setActiveIndex(((index % count) + count) % count);
  }

  useEffect(() => {
    if (!hasMultiple || paused || prefersReducedMotion) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [hasMultiple, paused, prefersReducedMotion, count]);

  return (
    <div>
      <div
        className="group/jumbotron relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="overflow-hidden rounded-3xl border border-[#EEE8F5] bg-[#F3EAFB] shadow-[0_10px_36px_rgba(122,92,168,0.10)]">
          <div
            className={cn(
              "flex",
              !prefersReducedMotion && "transition-transform duration-500 ease-out",
            )}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {bazaars.map((bazaar) => (
              <Link
                key={bazaar.id}
                href={`/bazaars/${bazaar.id}`}
                className="relative aspect-[16/7] w-full shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5CA8] focus-visible:ring-offset-2"
              >
                {bazaar.coverImageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bazaar.coverImageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 size-full scale-110 object-cover object-center opacity-70 blur-2xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bazaar.coverImageUrl}
                        alt={bazaar.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#F3EAFB] text-sm text-[#6B7280]">
                    {bazaar.title}
                  </div>
                )}

                {/* Bazaar info overlay */}
                <div className="absolute inset-x-3 bottom-3 flex justify-center sm:inset-x-6 sm:bottom-6">
                  <div className="w-full max-w-2xl rounded-2xl border border-white/50 bg-white/80 px-4 py-3 shadow-[0_8px_28px_rgba(122,92,168,0.16)] backdrop-blur-md sm:px-6 sm:py-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <h3 className="truncate text-sm font-bold text-[#3B1F4A] sm:text-lg">
                        {bazaar.title}
                      </h3>
                      <p className="shrink-0 text-xs text-[#6B7280] sm:text-sm">
                        {formatDateDisplay(bazaar.eventStartDate)} -{" "}
                        {formatDateDisplay(bazaar.eventEndDate)} · {bazaar.city}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {bazaar.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {bazaar.categories.slice(0, 3).map((category) => (
                            <Badge key={category} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span />
                      )}

                      <p className="shrink-0 text-xs font-medium text-[#3B1F4A] sm:text-sm">
                        {bazaar.slotsLeft} of {bazaar.totalSlot} slots left
                        {bazaar.minPricePerSlot !== null && (
                          <> · {formatRupiah(bazaar.minPricePerSlot)} / slot</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous bazaar"
              className="absolute top-1/2 left-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[#3B1F4A] opacity-100 shadow-[0_4px_14px_rgba(122,92,168,0.18)] backdrop-blur-md transition-all duration-200 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5CA8] sm:opacity-0 sm:group-hover/jumbotron:opacity-100"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next bazaar"
              className="absolute top-1/2 right-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[#3B1F4A] opacity-100 shadow-[0_4px_14px_rgba(122,92,168,0.18)] backdrop-blur-md transition-all duration-200 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5CA8] sm:opacity-0 sm:group-hover/jumbotron:opacity-100"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-4 flex justify-center gap-1.5">
          {bazaars.map((bazaar, index) => (
            <button
              key={bazaar.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to ${bazaar.title}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === activeIndex ? "w-5 bg-[#7A5CA8]" : "w-1.5 bg-[#F3EAFB] border border-[#E8E1EF]",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
