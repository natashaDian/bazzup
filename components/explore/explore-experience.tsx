"use client";

import { useEffect, useMemo, useState } from "react";
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
import { BazaarDetailPanel } from "./bazaar-detail-panel";
import type { ExploreBazaarWithDistance } from "./explore-map";

const ExploreMap = dynamic(
  () => import("./explore-map").then((mod) => mod.ExploreMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

// Jakarta - used only when the vendor's browser can't or won't share GPS.
const FALLBACK_POSITION: LatLng = { lat: -6.2088, lng: 106.8456 };

type SortOrder = "nearest" | "farthest" | "cheapest" | "expensive";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "nearest", label: "Nearest" },
  { value: "farthest", label: "Farthest" },
  { value: "cheapest", label: "Lowest price" },
  { value: "expensive", label: "Highest price" },
];

export function ExploreExperience({ bazaars }: { bazaars: ExploreBazaar[] }) {
  // Starts at null on both server and client render passes - deciding this
  // from `typeof navigator` instead would make the server (Node has a bare
  // `navigator` global with no `geolocation`) and the browser disagree on
  // the very first paint, which triggers a React hydration-mismatch error
  // that discards and rebuilds this whole subtree (map included).
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

  if (bazaars.length === 0) {
    return (
      <div className="flex min-h-80 flex-1 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
        No bazaars with a mapped location match these filters yet.
      </div>
    );
  }

  if (!userPosition) {
    return (
      <div className="flex h-105 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground lg:h-130">
        Getting your location...
      </div>
    );
  }

  const selectedBazaar = sortedBazaars.find((b) => b.id === selectedId) ?? sortedBazaars[0];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-105 overflow-hidden rounded-xl border lg:h-130">
          <ExploreMap
            bazaars={sortedBazaars}
            userPosition={userPosition}
            selectedId={selectedBazaar?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        <div className="flex h-105 flex-col gap-3 lg:h-130">
          <div>
            <h2 className="text-lg font-semibold">Nearby Bazaars</h2>
            <p className="text-xs text-muted-foreground">Bazaars near this location</p>
          </div>

          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {() => `Sort: ${SORT_OPTIONS.find((option) => option.value === sortOrder)?.label}`}
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
        "flex gap-3 rounded-xl border p-2.5 text-left transition-colors hover:bg-muted/60",
        selected ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {bazaar.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
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
              ? `Start from ${formatRupiah(bazaar.minPricePerSlot)}`
              : "Price unavailable"}
          </span>
          <span className="shrink-0 text-muted-foreground">{formatDistanceKm(bazaar.distanceKm)}</span>
        </div>
      </div>
    </button>
  );
}
