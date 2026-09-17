"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import { PlusIcon, MinusIcon, LocateFixedIcon } from "lucide-react";
import type { ExploreBazaar } from "@/lib/bazaars";
import type { LatLng } from "@/lib/geo";
import { formatDateDisplay } from "@/lib/date";

export type ExploreBazaarWithDistance = ExploreBazaar & { distanceKm: number };

const SELECTED_COLOR = "#3b1f4a";
const OTHER_COLOR = "#9ca3af";

function pinIcon(selected: boolean) {
  const color = selected ? SELECTED_COLOR : OTHER_COLOR;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}

export function ExploreMap({
  bazaars,
  userPosition,
  selectedId,
  onSelect,
}: {
  bazaars: ExploreBazaarWithDistance[];
  userPosition: LatLng;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const selectedBazaar = bazaars.find((bazaar) => bazaar.id === selectedId) ?? null;
  const selectedLat = selectedBazaar?.latitude;
  const selectedLng = selectedBazaar?.longitude;

  useEffect(() => {
    if (!mapRef.current || selectedLat === undefined || selectedLng === undefined) return;
    mapRef.current.flyTo([selectedLat, selectedLng], Math.max(mapRef.current.getZoom(), 14));
  }, [selectedLat, selectedLng]);

  return (
    <div className="relative isolate size-full">
      <MapContainer
        center={[userPosition.lat, userPosition.lng]}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <CircleMarker
          center={[userPosition.lat, userPosition.lng]}
          radius={8}
          pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.9, weight: 2 }}
        />

        {bazaars.map((bazaar) => (
          <Marker
            key={bazaar.id}
            position={[bazaar.latitude, bazaar.longitude]}
            icon={pinIcon(bazaar.id === selectedId)}
            eventHandlers={{ click: () => onSelect(bazaar.id) }}
          >
            {bazaar.id === selectedId && (
              <Popup autoClose={false} closeButton={false}>
                <div className="flex w-44 flex-col gap-1">
                  <p className="text-sm font-semibold">{bazaar.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateDisplay(bazaar.eventStartDate)} - {formatDateDisplay(bazaar.eventEndDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">{bazaar.city}</p>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-3 right-3 z-[1000] flex flex-col overflow-hidden rounded-lg border bg-background shadow">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex size-9 items-center justify-center hover:bg-muted"
          aria-label="Perbesar"
        >
          <PlusIcon className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex size-9 items-center justify-center hover:bg-muted"
          aria-label="Perkecil"
        >
          <MinusIcon className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => mapRef.current?.flyTo([userPosition.lat, userPosition.lng], 14)}
        className="absolute top-[104px] right-3 z-[1000] flex size-9 items-center justify-center rounded-lg border bg-background shadow hover:bg-muted"
        aria-label="Kembali ke lokasi saya"
      >
        <LocateFixedIcon className="size-4" />
      </button>

      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 rounded-lg border bg-background/95 px-3 py-1.5 text-xs shadow">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: SELECTED_COLOR }} />
          Bazaar Terpilih
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: OTHER_COLOR }} />
          Bazaar Lainnya
        </span>
      </div>
    </div>
  );
}
