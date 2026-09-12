"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnChange({ position }: { position: LatLng }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView([position.lat, position.lng], map.getZoom());
  }, [position.lat, position.lng, map]);
  return null;
}

export default function LocationPickerMap({
  position,
  onPick,
}: {
  position: LatLng;
  onPick: (pos: LatLng) => void;
}) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={14}
      style={{ height: "160px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker
        position={[position.lat, position.lng]}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            onPick({ lat: pos.lat, lng: pos.lng });
          },
        }}
      />
      <ClickHandler onPick={onPick} />
      <RecenterOnChange position={position} />
    </MapContainer>
  );
}
