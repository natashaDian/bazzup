import type { Metadata } from "next";
import type { ApplicationStatus } from "@prisma/client";
import { MapPinIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { requireVendor } from "@/lib/auth";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import {
  APPLICATION_STATUSES,
  getVendorApplications,
  type VendorApplicationRow,
} from "@/lib/applications";
import { ApplicationsFilterBar } from "./applications-filter-bar";

export const metadata: Metadata = {
  title: "Application Status - BazzUp",
};

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  AWAITING_CONFIRMATION: "bg-purple-100 text-purple-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-600",
  NO_SHOW: "bg-gray-200 text-gray-700",
  COMPLETED: "bg-emerald-100 text-emerald-800",
};

function statusLabel(status: ApplicationStatus): string {
  return APPLICATION_STATUSES.find((option) => option.value === status)?.label ?? status;
}

function formatDate(date: Date | null): string {
  return date ? formatDateDisplay(date) : "-";
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isApplicationStatus(value: string | undefined): value is ApplicationStatus {
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

  const allRows = await getVendorApplications(user.id, { status, sort: rawSort });
  const rows = rawSearch ? allRows.filter((row) => matchesSearch(row, rawSearch)) : allRows;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Application Status</h1>
        <p className="text-muted-foreground">Track the status of the bazaars you&apos;ve applied to.</p>
      </div>

      <ApplicationsFilterBar
        statuses={APPLICATION_STATUSES}
        initialStatus={status}
        initialSearch={rawSearch}
        initialSort={rawSort}
      />

      <p className="text-sm text-muted-foreground">{rows.length} applications</p>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications match these filters.</p>
      ) : (
        <Accordion
          key={`${status ?? ""}|${rawSearch ?? ""}|${rawSort}`}
          defaultValue={[rows[0].id]}
          className="rounded-xl border bg-card px-4"
        >
          {rows.map((row) => (
            <AccordionItem key={row.id} value={row.id}>
              <AccordionTrigger>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-2">
                  <div className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {row.coverImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.coverImageUrl}
                          alt={row.bazaarTitle}
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{row.displayId}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {row.bazaarTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 text-xs font-normal text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPinIcon className="size-3.5" />
                      {row.areaName}, {row.bazaarCity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatRupiah(row.pricePerSlot)}</span>
                    <Badge className={STATUS_BADGE_CLASS[row.status]}>
                      {statusLabel(row.status)}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-1">
                  <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="flex flex-col gap-0.5 pb-1 sm:pr-5 sm:pb-0">
                      <h3 className="text-sm font-semibold">Application Information</h3>
                      <Field label="Application ID" value={row.displayId} />
                      <Field label="Business Category" value={row.businessCategory} />
                      <Field label="Slot Number" value={row.slotNumber?.toString() ?? "-"} />
                      <Field label="Description" value={row.description ?? "-"} />
                    </div>

                    <div className="flex flex-col gap-0.5 py-1 sm:px-5 sm:py-0">
                      <h3 className="text-sm font-semibold">Event Information</h3>
                      <Field label="Event Name" value={row.bazaarTitle} />
                      <Field label="Area" value={row.areaName} />
                    </div>

                    <div className="flex flex-col gap-0.5 pt-3 sm:pt-0 sm:pl-5">
                      <h3 className="text-sm font-semibold">Timeline</h3>
                      <Field label="Applied At" value={formatDate(row.appliedAt)} />
                      <Field label="Approved At" value={formatDate(row.approvedAt)} />
                      <Field
                        label="Payment Confirmation At"
                        value={formatDate(row.paymentConfirmedAt)}
                      />
                      <Field label="Invoice Sent At" value={formatDate(row.invoiceSentAt)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-border pt-1">
                    <h3 className="text-sm font-semibold">Billing</h3>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-5">
                      <Field label="Price" value={formatRupiah(row.pricePerSlot)} />
                      <Field
                        label="Platform Fee"
                        value={row.platformFee !== null ? formatRupiah(row.platformFee) : "-"}
                      />
                      <Field
                        label="Total Price"
                        value={row.totalPrice !== null ? formatRupiah(row.totalPrice) : "-"}
                      />
                      <Field
                        label="Grand Total"
                        value={row.grandTotal !== null ? formatRupiah(row.grandTotal) : "-"}
                        bold
                      />
                      <Field label="Payment Deadline" value={formatDate(row.paymentDeadline)} />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </main>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5" style={{ gap: "2px" }}>
      <p className="m-0 text-xs leading-none text-muted-foreground" style={{ margin: 0, lineHeight: 1 }}>{label}</p>
      <p className={bold ? "text-sm font-bold" : "text-sm"} style={{ margin: 0, lineHeight: 2 }}>{value}</p>
    </div>
  );
}
