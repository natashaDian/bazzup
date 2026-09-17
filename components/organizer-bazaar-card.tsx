"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Inbox,
  Settings,
  Eye,
  Send,
  Users,
  ChartBar,
} from "lucide-react";
import type { OrganizerBazaarCardData } from "@/lib/bazaars";
import { formatDateDisplay } from "@/lib/date";
import { BazaarSummaryModal } from "@/components/bazaar-summary-modal";
import { BazaarVendorsModal } from "@/components/bazaar-vendors-modal";

const STATUS_CONFIG: Record <
  string,
  { label: string; textClass: string; barClass: string }
> = {
  DRAFT: {
    label: "Draft",
    textClass: "text-gray-600",
    barClass: "bg-gray-300",
  },
  ACTIVE: {
    label: "Active",
    textClass: "text-[#3B6D11]",
    barClass: "bg-accent",
  },
  FULL: {
    label: "Full",
    textClass: "text-[#27500A]",
    barClass: "bg-[#639922]",
  },
  COMPLETED: {
    label: "Completed",
    textClass: "text-gray-500",
    barClass: "bg-gray-300",
  },
};

export function OrganizerBazaarCard({
  bazaar,
  autoOpenSummary = false,
}: {
  bazaar: OrganizerBazaarCardData;
  autoOpenSummary?: boolean;
}) {
  const status = STATUS_CONFIG[bazaar.status] ?? STATUS_CONFIG.DRAFT;
  const filledSlot = bazaar.totalSlot - bazaar.slotsLeft;
  const percentFilled =
    bazaar.totalSlot > 0
      ? Math.round((filledSlot / bazaar.totalSlot) * 100)
      : 0;

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-32 bg-secondary/15 flex items-center justify-center">
        {bazaar.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bazaar.coverImageUrl}
            alt={bazaar.title}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {bazaar.coverImageUrl && (
          <div className="absolute inset-0 bg-foreground/35" />
        )}

        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <span className="text-xs px-2.5 py-1 rounded-full bg-card/90 text-muted-foreground">
            {bazaar.categories[0] ?? "General"} · {bazaar.areaCount} areas
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full bg-card/90 ${status.textClass}`}
          >
            {status.label}
          </span>
        </div>

        <p
          className={`absolute bottom-3 left-3.5 right-3.5 text-lg font-medium ${
            bazaar.coverImageUrl ? "text-white" : "text-foreground"
          }`}
        >
          {bazaar.title}
        </p>
      </div>

      <div className="p-5">
        <div className="flex gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDateDisplay(bazaar.eventStartDate)} -{" "}
            {formatDateDisplay(bazaar.eventEndDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {bazaar.city}
          </span>
        </div>

        {bazaar.status === "DRAFT" ? (
          <p className="text-xs text-muted-foreground mb-2">
            Not published yet
          </p>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>
              {filledSlot} of {bazaar.totalSlot} slots filled
            </span>
            {bazaar.pendingApplicationsCount > 0 && (
              <span className="text-[#7A5CA8] font-medium">
                {bazaar.pendingApplicationsCount} pending
              </span>
            )}
          </div>
        )}

        <div className="h-1.5 rounded-full bg-secondary/15 overflow-hidden mb-4">
          <div
            className={`h-full ${status.barClass}`}
            style={{ width: `${percentFilled}%` }}
          />
        </div>

        <ActionButtons bazaar={bazaar} autoOpenSummary={autoOpenSummary} />
      </div>
    </div>
  );
}

function ActionButtons({
  bazaar,
  autoOpenSummary,
}: {
  bazaar: OrganizerBazaarCardData;
  autoOpenSummary: boolean;
}) {
  const [showSummary, setShowSummary] = useState(autoOpenSummary);
  const [showVendors, setShowVendors] = useState(false);

  const secondaryClass =
    "flex-1 flex items-center justify-center gap-1.5 bg-secondary/15 text-primary text-xs py-2.5 rounded-lg transition-colors hover:bg-secondary/25";
  const primaryClass =
    "flex-1 flex items-center justify-center gap-1.5 bg-accent text-white text-xs py-2.5 rounded-lg transition-colors hover:bg-[#a97bd1]";

  const detailHref = `/organizer/bazaars/${bazaar.id}`;

  if (bazaar.status === "DRAFT") {
    return (
      <div className="flex gap-2.5">
        <Link href={detailHref} className={secondaryClass}>
          <Eye className="size-3.5" /> Preview
        </Link>
        <Link href={detailHref} className={primaryClass}>
          <Send className="size-3.5" /> Publish
        </Link>
      </div>
    );
  }

  if (bazaar.status === "FULL") {
    return (
      <>
        <div className="flex gap-2.5">
          <button onClick={() => setShowVendors(true)} className={secondaryClass}>
            <Users className="size-3.5" /> Vendor list
          </button>
          <Link
            href={`/organizer/applications?bazaarId=${bazaar.id}`}
            className={primaryClass}
          >
            <Settings className="size-3.5" /> Manage vendor
          </Link>
        </div>

        {showVendors && (
          <BazaarVendorsModal
            bazaarTitle={bazaar.title}
            bazaarId={bazaar.id}
            onClose={() => setShowVendors(false)}
          />
        )}
      </>
    );
  }

  if (bazaar.status === "COMPLETED") {
    return (
      <>
        <div className="flex gap-2.5">
          <button onClick={() => setShowSummary(true)} className={secondaryClass}>
            <ChartBar className="size-3.5" /> View summary
          </button>
          <button onClick={() => setShowVendors(true)} className={primaryClass}>
            <Users className="size-3.5" /> View vendors
          </button>
        </div>

        {showSummary && (
          <BazaarSummaryModal
            bazaarTitle={bazaar.title}
            bazaarId={bazaar.id}
            onClose={() => setShowSummary(false)}
          />
        )}
        {showVendors && (
          <BazaarVendorsModal
            bazaarTitle={bazaar.title}
            bazaarId={bazaar.id}
            onClose={() => setShowVendors(false)}
            showPaymentStatus={false}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex gap-2.5">
      <Link
        href={`/organizer/applications?bazaarId=${bazaar.id}`}
        className={secondaryClass}
      >
        <Inbox className="size-3.5" /> Applications
      </Link>
      <Link href={detailHref} className={secondaryClass}>
        <Settings className="size-3.5" /> Manage
      </Link>
    </div>
  );
}