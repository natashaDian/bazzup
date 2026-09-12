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
  Star,
} from "lucide-react";
import type { OrganizerBazaarCardData } from "@/lib/bazaars";
import { formatDateDisplay } from "@/lib/date";

const STATUS_CONFIG: Record<
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
}: {
  bazaar: OrganizerBazaarCardData;
}) {
  const status = STATUS_CONFIG[bazaar.status] ?? STATUS_CONFIG.DRAFT;
  const filledSlot = bazaar.totalSlot - bazaar.slotsLeft;
  const percentFilled =
    bazaar.totalSlot > 0
      ? Math.round((filledSlot / bazaar.totalSlot) * 100)
      : 0;

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
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

      <div className="p-4">
        <div className="flex gap-3.5 text-xs text-muted-foreground mb-2.5">
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
          <p className="text-xs text-muted-foreground mb-1.5">
            Not published yet
          </p>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {filledSlot} of {bazaar.totalSlot} slots filled
            </span>
            {bazaar.pendingApplicationsCount > 0 && (
              <span className="text-accent font-medium">
                {bazaar.pendingApplicationsCount} pending
              </span>
            )}
          </div>
        )}

        <div className="h-1.5 rounded-full bg-secondary/15 overflow-hidden mb-3.5">
          <div
            className={`h-full ${status.barClass}`}
            style={{ width: `${percentFilled}%` }}
          />
        </div>

        <ActionButtons bazaar={bazaar} />
      </div>
    </div>
  );
}

function ActionButtons({ bazaar }: { bazaar: OrganizerBazaarCardData }) {
  const secondaryClass =
    "flex-1 flex items-center justify-center gap-1.5 bg-secondary/15 text-accent text-xs py-2 rounded-lg";
  const primaryClass =
    "flex-1 flex items-center justify-center gap-1.5 bg-accent text-accent-foreground text-xs py-2 rounded-lg";

  const detailHref = `/organizer/bazaars/${bazaar.id}`;

  if (bazaar.status === "DRAFT") {
    return (
      <div className="flex gap-2">
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
      <div className="flex gap-2">
        <Link href={detailHref} className={secondaryClass}>
          <Users className="size-3.5" /> View vendors
        </Link>
        <Link href={detailHref} className={secondaryClass}>
          <Settings className="size-3.5" /> Manage
        </Link>
      </div>
    );
  }

  if (bazaar.status === "COMPLETED") {
    return (
      <div className="flex gap-2">
        <Link href={detailHref} className={secondaryClass}>
          <ChartBar className="size-3.5" /> View summary
        </Link>
        <Link href={detailHref} className={primaryClass}>
          <Star className="size-3.5" /> Rate vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
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
