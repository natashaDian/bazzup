import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import type { BazaarCard as BazaarCardData } from "@/lib/bazaars";

export function BazaarCard({ bazaar }: { bazaar: BazaarCardData }) {
  return (
    <Card className="gap-3 overflow-hidden p-0 pb-4">
      <div className="aspect-video w-full bg-muted">
        {bazaar.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bazaar.coverImageUrl}
            alt={bazaar.title}
            className="size-full object-cover"
          />
        )}
      </div>
      <CardContent className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">{bazaar.title}</h3>
        <p className="text-sm text-muted-foreground">
          {formatDateDisplay(bazaar.eventStartDate)} - {formatDateDisplay(bazaar.eventEndDate)}
        </p>
        <p className="text-sm text-muted-foreground">{bazaar.city}</p>

        {bazaar.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bazaar.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Tersisa {bazaar.slotsLeft} dari {bazaar.totalSlot} slot
          </span>
          {bazaar.minPricePerSlot !== null && (
            <span className="font-medium">{formatRupiah(bazaar.minPricePerSlot)} / slot</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
