"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[160px] w-full rounded-lg bg-secondary/10 flex items-center justify-center text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

const DEFAULT_POSITION = { lat: -6.2088, lng: 106.8456 };

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
  };
};

function extractCity(address?: NominatimResult["address"]) {
  return (
    address?.city || address?.town || address?.village || address?.county || ""
  );
}

export function LocationPicker({
  onChange,
}: {
  onChange: (data: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [isSearching, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextFetch = useRef(false);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function selectSuggestion(result: NominatimResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const city = extractCity(result.address);

    skipNextFetch.current = true;
    setQuery(result.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setPosition({ lat, lng });
    onChange({
      address: result.display_name,
      city,
      latitude: lat,
      longitude: lng,
    });
  }

  async function reverseGeocode(pos: { lat: number; lng: number }) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data: NominatimResult = await res.json();
      const city = extractCity(data.address);

      skipNextFetch.current = true;
      setQuery(data.display_name ?? "");
      onChange({
        address: data.display_name ?? "",
        city,
        latitude: pos.lat,
        longitude: pos.lng,
      });
    } catch {
      onChange({
        address: query,
        city: "",
        latitude: pos.lat,
        longitude: pos.lng,
      });
    }
  }

  function handlePick(pos: { lat: number; lng: number }) {
    setPosition(pos);
    startTransition(() => {
      reverseGeocode(pos);
    });
  }

  return (
    <div>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="e.g. Jl. Sudirman No. 1, Jakarta"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-sm"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg overflow-hidden z-[9999] shadow-md">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => selectSuggestion(s)}
                className="w-full flex items-start gap-2 px-3 py-2 text-left text-xs hover:bg-secondary/10 border-b border-input last:border-b-0"
              >
                <MapPin className="size-3.5 mt-0.5 text-accent shrink-0" />
                <span className="text-muted-foreground">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isSearching && (
        <p className="text-xs text-muted-foreground mb-2">
          Looking up location...
        </p>
      )}
      {error && <p className="text-xs text-destructive mb-2">{error}</p>}

      <LocationPickerMap position={position} onPick={handlePick} />

      <p className="text-xs text-muted-foreground mt-1.5">
        City and coordinates are set automatically from the address.
      </p>
    </div>
  );
}
