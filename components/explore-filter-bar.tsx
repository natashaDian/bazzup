"use client";

import { SearchIcon } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BazaarSearchDialog } from "@/components/bazaar-search-dialog";
import { formatDateDisplay, parseDateParam } from "@/lib/date";

type ExploreFilterBarProps = {
  cities: string[];
  initial: { city?: string; start?: string; end?: string };
};

export function ExploreFilterBar({ cities, initial }: ExploreFilterBarProps) {
  const startDate = parseDateParam(initial.start);
  const endDate = parseDateParam(initial.end);
  const hasFilters = Boolean(initial.city || startDate || endDate);

  return (
    <BazaarSearchDialog
      key={`${initial.city ?? ""}|${initial.start ?? ""}|${initial.end ?? ""}`}
      cities={cities}
      initial={initial}
      trigger={
        <DialogTrigger className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-3 py-1.5 text-sm hover:bg-muted">
          {hasFilters ? (
            <>
              {initial.city && <Badge variant="secondary">{initial.city}</Badge>}
              {(startDate || endDate) && (
                <Badge variant="secondary">
                  {startDate ? formatDateDisplay(startDate) : "..."}
                  {" - "}
                  {endDate ? formatDateDisplay(endDate) : "..."}
                </Badge>
              )}
              <span className="text-muted-foreground">Edit search</span>
            </>
          ) : (
            <>
              <SearchIcon className="size-4" />
              Search bazaars
            </>
          )}
        </DialogTrigger>
      }
    />
  );
}
