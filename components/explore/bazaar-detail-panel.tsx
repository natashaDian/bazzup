import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BazaarImageCarousel } from "@/components/bazaar-image-carousel";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import type { ExploreBazaar } from "@/lib/bazaars";

export function BazaarDetailPanel({ bazaar }: { bazaar: ExploreBazaar }) {
  const mapsUrl = `https://www.google.com/maps?q=${bazaar.latitude},${bazaar.longitude}`;

  return (
    <div className="grid grid-cols-1 gap-5 rounded-xl border bg-card p-4 lg:grid-cols-[1.7fr_1fr]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-64 sm:shrink-0">
          <BazaarImageCarousel images={bazaar.images} title={bazaar.title} />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-xl font-bold">{bazaar.title}</h3>
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarIcon className="size-4 shrink-0" />
            {formatDateDisplay(bazaar.eventStartDate)} - {formatDateDisplay(bazaar.eventEndDate)}
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0" />
            {bazaar.city}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-primary underline underline-offset-2"
            >
              View on Maps
            </a>
          </p>

          {bazaar.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bazaar.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {bazaar.description && (
            <p className="text-sm text-muted-foreground">{bazaar.description}</p>
          )}

          <p className="text-xs text-muted-foreground">{bazaar.address}</p>
          <p className="text-xs text-muted-foreground">
            Organized by <span className="font-medium text-foreground">{bazaar.organizerName}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
        <h4 className="text-sm font-semibold">Area & Harga Sewa</h4>

        {bazaar.areas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No areas have been set up yet.</p>
        ) : (
          <div className="flex flex-col divide-y">
            {bazaar.areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="truncate">{area.name}</span>
                <span className="shrink-0 font-medium">{formatRupiah(area.pricePerSlot)} / slot</span>
              </div>
            ))}
          </div>
        )}

        <Link href={`/bazaars/${bazaar.id}`} className={buttonVariants({ className: "mt-1 w-full" })}>
          Apply Now
        </Link>
      </div>
    </div>
  );
}
