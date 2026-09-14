import type { Metadata } from "next";
import type { ApplicationStatus } from "@prisma/client";
import { Accordion } from "@/components/ui/accordion";
import { requireVendor } from "@/lib/auth";
import {
  APPLICATION_STATUSES,
  getVendorApplications,
  type VendorApplicationRow,
} from "@/lib/applications";
import { ApplicationsFilterBar } from "./applications-filter-bar";
import { ApplicationStatusCard } from "@/components/application-status-card";

export const metadata: Metadata = {
  title: "Application Status - BazzUp",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isApplicationStatus(
  value: string | undefined,
): value is ApplicationStatus {
  return APPLICATION_STATUSES.some((option) => option.value === value);
}

function matchesSearch(row: VendorApplicationRow, search: string): boolean {
  const term = search.toLowerCase();
  return (
    row.displayId.toLowerCase().includes(term) ||
    row.bazaarTitle.toLowerCase().includes(term) ||
    row.areaName.toLowerCase().includes(term)
  );
}

export default async function ApplicationStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireVendor();
  const sp = await searchParams;

  const rawStatus = firstValue(sp.status);
  const rawSearch = firstValue(sp.search);
  const rawSort = firstValue(sp.sort) === "oldest" ? "oldest" : "newest";
  const status = isApplicationStatus(rawStatus) ? rawStatus : undefined;

  const allRows = await getVendorApplications(user.id, {
    status,
    sort: rawSort,
  });
  const rows = rawSearch
    ? allRows.filter((row) => matchesSearch(row, rawSearch))
    : allRows;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Application Status</h1>
        <p className="text-muted-foreground">
          Track the status of the bazaars you&apos;ve applied to.
        </p>
      </div>

      <ApplicationsFilterBar
        statuses={APPLICATION_STATUSES}
        initialStatus={status}
        initialSearch={rawSearch}
        initialSort={rawSort}
      />

      <p className="text-sm text-muted-foreground">
        {rows.length} applications
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No applications match these filters.
        </p>
      ) : (
        <Accordion
          key={`${status ?? ""}|${rawSearch ?? ""}|${rawSort}`}
          defaultValue={[rows[0].id]}
          className="rounded-xl border bg-card px-4"
        >
          {rows.map((row) => (
            <ApplicationStatusCard key={row.id} row={row} />
          ))}
        </Accordion>
      )}
    </main>
  );
}
