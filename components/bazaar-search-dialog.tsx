"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Search bazaars</DialogTitle>
          <DialogDescription>Choose your preferred location and dates.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label>Location</Label>
          <Select value={city} onValueChange={(value) => setCity(value ?? ALL_CITIES_VALUE)}>
            <SelectTrigger className="w-full">
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

        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Start date</span>
              <Input
                readOnly
                value={range?.from ? formatDateDisplay(range.from) : ""}
                placeholder="Select date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">End date</span>
              <Input
                readOnly
                value={range?.to ? formatDateDisplay(range.to) : ""}
                placeholder="Select date"
              />
            </div>
          </div>
          <Calendar mode="range" selected={range} onSelect={setRange} className="mx-auto" />
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {count === null ? "Counting..." : `${count} bazaars found`}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
