"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BazaarConfirmedVendor } from "@/lib/bazaars";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  APPROVED: {
    label: "Awaiting payment",
    className: "bg-amber-100 text-amber-800",
  },
  AWAITING_CONFIRMATION: {
    label: "Awaiting payment",
    className: "bg-amber-100 text-amber-800",
  },
  CONFIRMED: { label: "Paid", className: "bg-green-100 text-green-800" },
  COMPLETED: { label: "Paid", className: "bg-green-100 text-green-800" },
};

export function BazaarVendorsModal({
  bazaarTitle,
  bazaarId,
  onClose,
  showPaymentStatus = true,
}: {
  bazaarTitle: string;
  bazaarId: string;
  onClose: () => void;
  showPaymentStatus?: boolean;
}) {
  const [vendors, setVendors] = useState<BazaarConfirmedVendor[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bazaars/${bazaarId}/vendors`)
      .then((res) => res.json())
      .then((data) => setVendors(data))
      .finally(() => setLoading(false));
  }, [bazaarId]);

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-base font-medium">{bazaarTitle}</p>
            <p className="text-xs text-muted-foreground">
              {vendors
                ? `${vendors.length} vendors occupying slots`
                : "Loading..."}
            </p>
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

        {!loading && vendors && vendors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No vendors yet.
          </p>
        )}

        {!loading && vendors && vendors.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-center gap-2.5 bg-secondary/10 rounded-lg px-3 py-2.5"
              >
                <div className="size-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-medium text-accent shrink-0">
                  {vendor.vendorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {vendor.vendorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vendor.areaName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {vendor.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {vendor.category}
                    </span>
                  )}
                  {showPaymentStatus && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        STATUS_BADGE[vendor.status]?.className ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_BADGE[vendor.status]?.label ?? vendor.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
