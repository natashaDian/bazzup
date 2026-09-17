"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { CalendarDays, MapPin, SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDateDisplay, formatDateParam, parseDateParam } from "@/lib/date";

const ALL_CITIES_VALUE = "__all__";

const POPOVER_THEME_VARS = { "--primary": "#7A5CA8" } as CSSProperties;

type ExploreSearchPanelInitial = {
  city?: string;
  start?: string;
  end?: string;
};

type ExploreSearchPanelProps = {
  cities: string[];
  initial?: ExploreSearchPanelInitial;
};

function rangeFromInitial(initial?: ExploreSearchPanelInitial): DateRange | undefined {
  const from = parseDateParam(initial?.start) ?? undefined;
  const to = parseDateParam(initial?.end) ?? undefined;
  return from || to ? { from, to } : undefined;
}

export function ExploreSearchPanel({ cities, initial }: ExploreSearchPanelProps) {
  const router = useRouter();
  const [city, setCity] = useState(initial?.city ?? ALL_CITIES_VALUE);
  const [range, setRange] = useState<DateRange | undefined>(() => rangeFromInitial(initial));
  const [datesOpen, setDatesOpen] = useState(false);

  function handleSearch() {
    const params = new URLSearchParams();
    if (city !== ALL_CITIES_VALUE) params.set("city", city);
    if (range?.from) params.set("start", formatDateParam(range.from));
    if (range?.to) params.set("end", formatDateParam(range.to));

    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  }

  return (
    <div className="flex h-full flex-col gap-6 rounded-2xl border border-[#EEE4FA] bg-white p-5 shadow-[0_4px_18px_rgba(122,92,168,0.06)]">
      <div>
        <h2 className="flex items-center gap-1.5 text-base font-bold text-[#3B1F4A]">
          <SearchIcon className="size-4 text-[#7A5CA8]" />
          Cari
        </h2>
        <p className="mt-1 text-xs text-[#6B7280]">Temukan bazaar berdasarkan lokasi dan tanggal.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-1.5 text-sm font-medium text-[#3B1F4A]">
          <MapPin className="size-3.5 text-[#7A5CA8]" />
          Lokasi
        </Label>
        <Select value={city} onValueChange={(value) => setCity(value ?? ALL_CITIES_VALUE)}>
          <SelectTrigger className="h-10 w-full rounded-xl border-[#E8E1EF] bg-white px-3 text-sm text-[#3B1F4A] focus-visible:border-[#7A5CA8] focus-visible:ring-[#7A5CA8]/25 data-[popup-open]:border-[#7A5CA8]">
            <SelectValue>
              {(value: string) => (value === ALL_CITIES_VALUE ? "Semua kota" : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CITIES_VALUE}>Semua kota</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-1.5 text-sm font-medium text-[#3B1F4A]">
          <CalendarDays className="size-3.5 text-[#7A5CA8]" />
          Tanggal
        </Label>
        <Popover open={datesOpen} onOpenChange={setDatesOpen}>
          <PopoverTrigger className="flex w-full flex-col gap-2 rounded-xl border border-[#E8E1EF] bg-white p-2.5 text-left transition-colors hover:border-[#C9A8E5] focus-visible:border-[#7A5CA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5CA8]/25 data-[popup-open]:border-[#7A5CA8]">
            <span className="flex items-center justify-between gap-2 text-sm">
              <span className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                Mulai
              </span>
              <span className={range?.from ? "font-medium text-[#3B1F4A]" : "text-[#6B7280]"}>
                {range?.from ? formatDateDisplay(range.from) : "Pilih tanggal"}
              </span>
            </span>
            <span className="h-px bg-[#F0E6FA]" />
            <span className="flex items-center justify-between gap-2 text-sm">
              <span className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                Akhir
              </span>
              <span className={range?.to ? "font-medium text-[#3B1F4A]" : "text-[#6B7280]"}>
                {range?.to ? formatDateDisplay(range.to) : "Pilih tanggal"}
              </span>
            </span>
          </PopoverTrigger>
          <PopoverContent className="p-3" style={POPOVER_THEME_VARS}>
            <Calendar mode="range" selected={range} onSelect={setRange} className="bg-white p-0" />
            <div className="mt-2 flex justify-end border-t border-[#F0E6FA] pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setDatesOpen(false)}
                className="h-8 rounded-lg bg-[#7A5CA8] px-4 text-xs font-semibold text-white hover:bg-[#6B4F98]"
              >
                Selesai
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        type="button"
        onClick={handleSearch}
        className="mt-auto h-11 w-full rounded-xl bg-[#7A5CA8] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(122,92,168,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6B4F98] hover:shadow-[0_6px_16px_rgba(122,92,168,0.24)]"
      >
        Cari
      </Button>
    </div>
  );
}
