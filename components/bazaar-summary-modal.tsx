"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BazaarCompletionSummary } from "@/lib/bazaars";

function formatDateShort(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatRupiahShort(amount: number) {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

export function BazaarSummaryModal({
  bazaarTitle,
  bazaarId,
  onClose,
}: {
  bazaarTitle: string;
  bazaarId: string;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState<BazaarCompletionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bazaars/${bazaarId}/summary`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .finally(() => setLoading(false));
  }, [bazaarId]);

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-base font-medium">{bazaarTitle}</p>
            <p className="text-xs text-muted-foreground">Event summary</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading...
          </p>
        )}

        {!loading && summary && (
          <>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Areas</p>
                <p className="text-xl font-medium">{summary.totalAreas}</p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Vendors confirmed
                </p>
                <p className="text-xl font-medium">
                  {summary.totalVendorsConfirmed}
                </p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-xl font-medium">
                  {formatRupiahShort(summary.totalRevenue)}
                </p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Event date</p>
                <p className="text-sm font-medium pt-1">
                  {formatDateShort(summary.eventStartDate)} -{" "}
                  {formatDateShort(summary.eventEndDate)}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-2.5">
              Slots filled per area
            </p>
            <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
              {summary.areaBreakdown.map((area) => {
                const percent =
                  area.totalSlot > 0
                    ? Math.round((area.filled / area.totalSlot) * 100)
                    : 0;
                const isFull = percent >= 100;
                return (
                  <div key={area.areaName}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{area.areaName}</span>
                      <span className="text-muted-foreground">
                        {area.filled} of {area.totalSlot}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/10 overflow-hidden">
                      <div
                        className={`h-full ${isFull ? "bg-green-600" : "bg-accent"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
