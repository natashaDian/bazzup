"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import { haversineDistanceKm, formatDistanceKm, type LatLng } from "@/lib/geo";
import type { ExploreBazaar } from "@/lib/bazaars";
import { ExploreSearchPanel } from "@/components/explore-search-panel";
import { BazaarDetailPanel } from "./bazaar-detail-panel";
import type { ExploreBazaarWithDistance } from "./explore-map";

const ExploreMap = dynamic(
  () => import("./explore-map").then((mod) => mod.ExploreMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Memuat peta...
      </div>
    ),
  },
);

const FALLBACK_POSITION: LatLng = { lat: -6.2088, lng: 106.8456 };

type SortOrder = "nearest" | "farthest" | "cheapest" | "expensive";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "nearest", label: "Terdekat" },
  { value: "farthest", label: "Terjauh" },
  { value: "cheapest", label: "Harga Terendah" },
  { value: "expensive", label: "Harga Tertinggi" },
];

const EXPLORE_THEME_VARS = { "--primary": "#7A5CA8" } as CSSProperties;

type ExploreExperienceProps = {
  bazaars: ExploreBazaar[];
  cities: string[];
  initial: { city?: string; start?: string; end?: string };
};

export function ExploreExperience({ bazaars, cities, initial }: ExploreExperienceProps) {
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("nearest");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setUserPosition(FALLBACK_POSITION));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => setUserPosition(FALLBACK_POSITION),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const sortedBazaars = useMemo<ExploreBazaarWithDistance[]>(() => {
    if (!userPosition) return [];

    const withDistance = bazaars.map((bazaar) => ({
      ...bazaar,
      distanceKm: haversineDistanceKm(userPosition, { lat: bazaar.latitude, lng: bazaar.longitude }),
    }));

    return withDistance.sort((a, b) => {
      switch (sortOrder) {
        case "nearest":
          return a.distanceKm - b.distanceKm;
        case "farthest":
          return b.distanceKm - a.distanceKm;
        case "cheapest":
          return (a.minPricePerSlot ?? Infinity) - (b.minPricePerSlot ?? Infinity);
        case "expensive":
          return (b.minPricePerSlot ?? -Infinity) - (a.minPricePerSlot ?? -Infinity);
      }
    });
  }, [bazaars, userPosition, sortOrder]);

  const selectedBazaar = sortedBazaars.find((b) => b.id === selectedId) ?? sortedBazaars[0];
  const searchPanelKey = `${initial.city ?? ""}|${initial.start ?? ""}|${initial.end ?? ""}`;

  return (
    <div className="flex flex-1 flex-col gap-6" style={EXPLORE_THEME_VARS}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[0.9fr_2fr_1fr]">
        <div className="md:col-span-2 lg:col-span-1 lg:h-130">
          <ExploreSearchPanel key={searchPanelKey} cities={cities} initial={initial} />
        </div>

        {bazaars.length === 0 ? (
          <div className="flex h-105 items-center justify-center rounded-2xl border border-[#EEE4FA] bg-white p-6 text-center text-sm text-[#6B7280] md:col-span-2 lg:col-span-2 lg:h-130">
            Belum ada bazaar dengan lokasi peta yang cocok dengan filter ini.
          </div>
        ) : !userPosition ? (
          <div className="flex h-105 items-center justify-center rounded-2xl border border-[#EEE4FA] bg-white text-sm text-[#6B7280] md:col-span-2 lg:col-span-2 lg:h-130">
            Mengambil lokasimu...
          </div>
        ) : (
          <>
            <div className="h-105 overflow-hidden rounded-2xl border border-[#EEE4FA] shadow-[0_4px_18px_rgba(122,92,168,0.06)] lg:h-130">
              <ExploreMap
                bazaars={sortedBazaars}
                userPosition={userPosition}
                selectedId={selectedBazaar?.id ?? null}
                onSelect={setSelectedId}
              />
            </div>

            <div className="flex h-105 flex-col gap-3 rounded-2xl border border-[#EEE4FA] bg-white p-4 shadow-[0_4px_18px_rgba(122,92,168,0.06)] lg:h-130">
              <div>
                <h2 className="text-lg font-semibold text-[#3B1F4A]">Bazaar di Sekitar</h2>
                <p className="text-xs text-[#6B7280]">Bazaar di sekitar lokasi ini</p>
              </div>

              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                <SelectTrigger className="w-full rounded-xl border-[#E8E1EF] bg-white text-[#3B1F4A] focus-visible:border-[#7A5CA8] focus-visible:ring-[#7A5CA8]/25 data-[popup-open]:border-[#7A5CA8]">
                  <SelectValue>
                    {() => `Urutkan: ${SORT_OPTIONS.find((option) => option.value === sortOrder)?.label}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                {sortedBazaars.map((bazaar) => (
                  <NearbyBazaarItem
                    key={bazaar.id}
                    bazaar={bazaar}
                    selected={bazaar.id === selectedBazaar?.id}
                    onClick={() => setSelectedId(bazaar.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedBazaar && <BazaarDetailPanel bazaar={selectedBazaar} />}
    </div>
  );
}

function NearbyBazaarItem({
  bazaar,
  selected,
  onClick,
}: {
  bazaar: ExploreBazaarWithDistance;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex gap-3 rounded-xl border p-2.5 text-left transition-colors duration-200 hover:border-[#C9A8E5] hover:bg-[#F9F5FF]",
        selected ? "border-[#7A5CA8] bg-[#F3EAFB]" : "border-[#E8E1EF] bg-white",
      )}
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {bazaar.images[0] && (
          <img src={bazaar.images[0]} alt={bazaar.title} className="size-full object-cover" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-semibold">{bazaar.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDateDisplay(bazaar.eventStartDate)} - {formatDateDisplay(bazaar.eventEndDate)}
        </p>
        <p className="truncate text-xs text-muted-foreground">{bazaar.city}</p>

        {bazaar.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bazaar.categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="secondary" className="text-[10px]">
                {category}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-medium text-primary">
            {bazaar.minPricePerSlot !== null
              ? `Mulai dari ${formatRupiah(bazaar.minPricePerSlot)}`
              : "Harga tidak tersedia"}
          </span>
          <span className="shrink-0 text-muted-foreground">{formatDistanceKm(bazaar.distanceKm)}</span>
        </div>
      </div>
    </button>
  );
}
