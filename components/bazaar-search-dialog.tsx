"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDateDisplay, formatDateParam, parseDateParam } from "@/lib/date";

const ALL_CITIES_VALUE = "__all__";

// Scopes the accent purple + a pure-white surface to just this dialog, so the
// Next/Search buttons and the calendar's range highlight pick up the BazzUp
// accent color without touching the app-wide theme tokens used elsewhere.
const DIALOG_THEME_VARS = {
  "--primary": "#7A5CA8",
  "--popover": "#FFFFFF",
} as CSSProperties;

type BazaarSearchDialogInitial = {
  city?: string;
  start?: string;
  end?: string;
};

type BazaarSearchDialogProps = {
  trigger: ReactNode;
  cities: string[];
  // `initial` is only read once, on mount - if the caller's filters change
  // (e.g. the URL search params on /explore), pass a `key` derived from
  // them so React remounts this component instead of us reset-in-effect.
  initial?: BazaarSearchDialogInitial;
};

function rangeFromInitial(initial?: BazaarSearchDialogInitial): DateRange | undefined {
  const from = parseDateParam(initial?.start) ?? undefined;
  const to = parseDateParam(initial?.end) ?? undefined;
  return from || to ? { from, to } : undefined;
}

export function BazaarSearchDialog({ trigger, cities, initial }: BazaarSearchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"location" | "date">("location");
  const [city, setCity] = useState(initial?.city ?? ALL_CITIES_VALUE);
  const [range, setRange] = useState<DateRange | undefined>(() => rangeFromInitial(initial));
  const [count, setCount] = useState<number | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!open) return;

    const id = ++requestId.current;
    const params = new URLSearchParams();
    if (city !== ALL_CITIES_VALUE) params.set("city", city);
    if (range?.from) params.set("start", formatDateParam(range.from));
    if (range?.to) params.set("end", formatDateParam(range.to));

    fetch(`/api/bazaars/count?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { count: number }) => {
        if (requestId.current === id) setCount(data.count);
      })
      .catch(() => {
        if (requestId.current === id) setCount(null);
      });
  }, [open, city, range?.from, range?.to]);

  function handleReset() {
    setCity(ALL_CITIES_VALUE);
    setRange(undefined);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (city !== ALL_CITIES_VALUE) params.set("city", city);
    if (range?.from) params.set("start", formatDateParam(range.from));
    if (range?.to) params.set("end", formatDateParam(range.to));

    const qs = params.toString();
    setOpen(false);
    router.push(qs ? `/explore?${qs}` : "/explore");
  }

  const cityLabel = city === ALL_CITIES_VALUE ? "All cities" : city;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setStep("location");
      }}
    >
      {trigger}
      <DialogContent
        className="gap-0 rounded-[20px] border border-[#EEE4FA] bg-white p-7 shadow-[0_16px_48px_rgba(122,92,168,0.14)] ring-0 sm:max-w-md"
        style={DIALOG_THEME_VARS}
      >
        {step === "location" ? (
          <div className="flex flex-col gap-6 duration-[240ms] animate-in fade-in-0 slide-in-from-left-3">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#3B1F4A]">
                Search bazaars
              </DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                Choose your preferred location.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-[#3B1F4A]">
                <MapPin className="size-3.5 text-[#7A5CA8]" />
                Location
              </Label>
              <Select value={city} onValueChange={(value) => setCity(value ?? ALL_CITIES_VALUE)}>
                <SelectTrigger className="h-11 w-full rounded-xl border-[#E8E1EF] bg-white px-3.5 text-sm text-[#3B1F4A] focus-visible:border-[#7A5CA8] focus-visible:ring-[#7A5CA8]/25 data-[popup-open]:border-[#7A5CA8]">
                  <SelectValue>
                    {(value: string) => (value === ALL_CITIES_VALUE ? "All cities" : value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CITIES_VALUE}>All cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-[#6B7280] transition-colors hover:text-[#7A5CA8]"
              >
                Reset
              </button>
              <Button
                type="button"
                onClick={() => setStep("date")}
                className="h-11 gap-1.5 rounded-xl bg-[#7A5CA8] px-6 text-sm font-semibold text-white hover:bg-[#6B4F98]"
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 duration-[240ms] animate-in fade-in-0 slide-in-from-right-3">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#3B1F4A]">
                Select your dates
              </DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                {cityLabel} · choose a start and end date.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-[#3B1F4A]">
                <CalendarDays className="size-3.5 text-[#7A5CA8]" />
                Date
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#6B7280]">Start date</span>
                  <Input
                    readOnly
                    value={range?.from ? formatDateDisplay(range.from) : ""}
                    placeholder="Select date"
                    className={
                      range?.from
                        ? "rounded-xl border-[#7A5CA8]/50 bg-[#F3EAFB] text-sm font-medium text-[#3B1F4A]"
                        : "rounded-xl border-[#E8E1EF] bg-white text-sm text-[#6B7280]"
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#6B7280]">End date</span>
                  <Input
                    readOnly
                    value={range?.to ? formatDateDisplay(range.to) : ""}
                    placeholder="Select date"
                    className={
                      range?.to
                        ? "rounded-xl border-[#7A5CA8]/50 bg-[#F3EAFB] text-sm font-medium text-[#3B1F4A]"
                        : "rounded-xl border-[#E8E1EF] bg-white text-sm text-[#6B7280]"
                    }
                  />
                </div>
              </div>
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                className="mx-auto bg-white p-0"
              />
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#F0E6FA] pt-4">
              <p className="text-xs text-[#6B7280]">
                {count === null ? "Counting..." : `${count} bazaars found`}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("location")}
                  className="h-10 gap-1.5 rounded-xl border-[#E8E1EF] bg-white px-4 text-sm font-medium text-[#3B1F4A] hover:bg-[#F9F5FF]"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSearch}
                  className="h-10 rounded-xl bg-[#7A5CA8] px-6 text-sm font-semibold text-white hover:bg-[#6B4F98]"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
