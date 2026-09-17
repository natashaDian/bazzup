"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import type { BazaarCompletionSummary } from "@/lib/bazaars";

function formatDateShort(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function StarRating({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${size} ${
            value <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-secondary/25"
          }`}
        />
      ))}
    </div>
  );
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
            <p className="text-xs text-muted-foreground">Ringkasan acara</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Memuat...
          </p>
        )}

        {!loading && summary && (
          <>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Area</p>
                <p className="text-xl font-medium">{summary.totalAreas}</p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Vendor terkonfirmasi
                </p>
                <p className="text-xl font-medium">
                  {summary.totalVendorsConfirmed}
                </p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Pendapatan</p>
                <p className="text-xl font-medium">
                  {formatRupiahShort(summary.totalRevenue)}
                </p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Tanggal acara</p>
                <p className="text-sm font-medium pt-1">
                  {formatDateShort(summary.eventStartDate)} -{" "}
                  {formatDateShort(summary.eventEndDate)}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-2.5">
              Slot terisi per area
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
                        {area.filled} dari {area.totalSlot}
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

            <div className="mt-5 pt-5 border-t border-secondary/15">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs text-muted-foreground">
                  Ulasan vendor
                </p>
                {summary.averageRating !== null && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={Math.round(summary.averageRating)} />
                    <span className="text-xs font-medium">
                      {summary.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({summary.reviews.length})
                    </span>
                  </div>
                )}
              </div>

              {summary.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 bg-secondary/10 rounded-lg">
                  Belum ada ulasan.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {summary.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex gap-2.5 bg-secondary/10 rounded-lg px-3 py-2.5"
                    >
                      {review.vendorProfileImageUrl ? (
                        <img
                          src={review.vendorProfileImageUrl}
                          alt={review.vendorName}
                          className="size-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium text-accent shrink-0">
                          {review.vendorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {review.vendorName}
                          </p>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {formatDateShort(review.createdAt)}
                          </span>
                        </div>
                        <StarRating rating={review.rating} />
                        {review.comment && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
