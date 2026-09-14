"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPinIcon, ZapIcon, MessageCircleIcon, CheckCircleIcon, XCircleIcon, BanIcon } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import { cancelApplicationAction } from "@/lib/payment";
import { PaymentCountdown } from "@/components/payment-countdown";
import { ApplicationPhotoCarousel } from "@/components/application-photo-carousel";
import type { VendorApplicationRow } from "@/lib/applications";
import type { ApplicationStatus } from "@prisma/client";

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
  const labels: Record<ApplicationStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    EXPIRED: "Expired",
    AWAITING_CONFIRMATION: "Awaiting Confirmation",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
    COMPLETED: "Completed",
  };
  return labels[status];
}

function formatDateTime(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function toWhatsappNumber(number: string): string {
  const digits = number.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex flex-col" style={{ gap: "2px" }}>
      <p className="text-xs text-muted-foreground" style={{ margin: 0, lineHeight: 1 }}>
        {label}
      </p>
      <p className={bold ? "text-sm font-bold" : "text-sm"} style={{ margin: 0, lineHeight: 1.4 }}>
        {value}
      </p>
    </div>
  );
}

export function ApplicationStatusCard({ row }: { row: VendorApplicationRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelError, setCancelError] = useState<string | null>(null);

  const daysUntilEvent = Math.floor((row.eventStartDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const canCancel = row.status === "CONFIRMED" && daysUntilEvent > 7;
  const isPaymentExpired = row.paymentDeadline ? row.paymentDeadline.getTime() <= Date.now() : false;
  const estimatedPlatformFee = row.platformFee ?? Math.round(row.pricePerSlot * 0.05);
  const estimatedGrandTotal = row.grandTotal ?? row.pricePerSlot + estimatedPlatformFee;

  function handleCancel() {
    setCancelError(null);
    startTransition(async () => {
      const result = await cancelApplicationAction(row.id);
      if (result?.error) {
        setCancelError(result.error);
      }
    });
  }

  const whatsappLink = row.organizerWhatsapp
    ? `https://wa.me/${toWhatsappNumber(row.organizerWhatsapp)}?text=${encodeURIComponent(
        `Halo, saya sudah menyelesaikan pembayaran untuk ${row.bazaarTitle}. Ada info tambahan yang perlu saya ketahui?`
      )}`
    : null;

  // ---------------------------------------------------------------------
  // Timeline: which rows to show depends on status
  // ---------------------------------------------------------------------
  const timelineFields: { label: string; value: string }[] = [
    { label: "Applied At", value: formatDateTime(row.appliedAt) },
  ];

  if (row.status === "REJECTED") {
    timelineFields.push({ label: "Rejected At", value: formatDateTime(row.rejectedAt) });
  } else if (row.status === "CANCELLED") {
    timelineFields.push({ label: "Approved At", value: formatDateTime(row.approvedAt) });
    timelineFields.push({ label: "Cancelled At", value: formatDateTime(row.cancelledAt) });
  } else if (row.status === "EXPIRED") {
    timelineFields.push({ label: "Approved At", value: formatDateTime(row.approvedAt) });
    timelineFields.push({ label: "Expired At", value: formatDateTime(row.paymentDeadline) });
  } else if (row.status === "NO_SHOW") {
    timelineFields.push({ label: "Approved At", value: formatDateTime(row.approvedAt) });
    timelineFields.push({ label: "Payment Confirmation At", value: formatDateTime(row.paymentConfirmedAt) });
  } else if (row.status === "CONFIRMED" || row.status === "COMPLETED") {
    timelineFields.push({ label: "Approved At", value: formatDateTime(row.approvedAt) });
    timelineFields.push({ label: "Payment Confirmation At", value: formatDateTime(row.paymentConfirmedAt) });
    timelineFields.push({ label: "Invoice Sent At", value: formatDateTime(row.invoiceSentAt) });
  } else if (row.status === "APPROVED") {
    timelineFields.push({ label: "Approved At", value: formatDateTime(row.approvedAt) });
  }
  // PENDING: only "Applied At", already added above

  return (
    <AccordionItem value={row.id}>
      <AccordionTrigger>
        <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-2">
          <div className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              {row.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.images[0]} alt={row.bazaarTitle} className="size-full object-cover" />
              )}
            </div>
            <div>
              <p className="font-semibold">{row.displayId}</p>
              <p className="text-xs font-normal text-muted-foreground">{row.bazaarTitle}</p>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 text-xs font-normal text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {row.areaName}, {row.bazaarCity}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {row.status === "APPROVED" && row.paymentDeadline ? (
              <PaymentCountdown deadline={row.paymentDeadline} />
            ) : (
              <span className="font-semibold">{formatRupiah(row.pricePerSlot)}</span>
            )}
            <Badge className={STATUS_BADGE_CLASS[row.status]}>{statusLabel(row.status)}</Badge>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex flex-col gap-2 pb-3 sm:pr-5 sm:pb-0">
              <h3 className="text-sm font-semibold">Application Information</h3>
              <Field label="Application ID" value={row.displayId} />
              <Field label="Business Category" value={row.businessCategory} />
              <Field label="Slot Number" value={row.slotNumber?.toString() ?? "-"} />
              <Field label="Description" value={row.description ?? "-"} />
            </div>

            <div className="flex flex-col gap-2 py-3 sm:px-5 sm:py-0">
              <h3 className="text-sm font-semibold">Event Information</h3>
              <ApplicationPhotoCarousel images={row.areaImages} />
              <Field label="Event Name" value={row.bazaarTitle} />
              <Field label="Area" value={row.areaName} />
              <Field
                label="Event Date"
                value={`${formatDateDisplay(row.eventStartDate)} - ${formatDateDisplay(row.eventEndDate)}`}
              />
              <div className="flex gap-1.5 flex-wrap mt-0.5">
                {row.categoryWanted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {row.categoryWanted}
                  </span>
                )}
                {row.hasElectricity && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    <ZapIcon className="size-2.5" />
                    Electricity
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 sm:pt-0 sm:pl-5">
              <h3 className="text-sm font-semibold">Timeline</h3>
              {timelineFields.map((field) => (
                <Field key={field.label} label={field.label} value={field.value} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <h3 className="text-sm font-semibold">Billing</h3>

            {row.status === "REJECTED" && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 px-4 py-3">
                <XCircleIcon className="size-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-700">This application was rejected</p>
                  {row.rejectReason && <p className="text-xs text-red-600 mt-0.5">{row.rejectReason}</p>}
                </div>
              </div>
            )}

            {row.status === "CANCELLED" && (
              <div className="flex items-start gap-2.5 rounded-lg bg-gray-100 px-4 py-3">
                <BanIcon className="size-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">This application was cancelled</p>
                  {row.cancelReason && <p className="text-xs text-gray-600 mt-0.5">{row.cancelReason}</p>}
                </div>
              </div>
            )}

            {row.status === "EXPIRED" && (
              <div className="flex items-start gap-2.5 rounded-lg bg-gray-100 px-4 py-3">
                <XCircleIcon className="size-4 text-gray-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">
                  Payment deadline passed. This application has expired.
                </p>
              </div>
            )}

            {row.status === "NO_SHOW" && (
              <div className="flex items-start gap-2.5 rounded-lg bg-gray-100 px-4 py-3">
                <BanIcon className="size-4 text-gray-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">Vendor was marked as no-show for this event.</p>
              </div>
            )}

            {(row.status === "PENDING" || row.status === "APPROVED") && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <Field label="Price" value={formatRupiah(row.pricePerSlot)} />
                <Field label="Platform Fee" value={formatRupiah(estimatedPlatformFee)} />
                <Field label="Grand Total" value={formatRupiah(estimatedGrandTotal)} bold />
                {row.status === "APPROVED" && (
                  <Field label="Payment Deadline" value={formatDateTime(row.paymentDeadline)} />
                )}
              </div>
            )}

            {(row.status === "CONFIRMED" || row.status === "COMPLETED") && (
              <div className="flex flex-wrap items-center gap-5 rounded-lg bg-green-50 px-4 py-3">
                <Field label="Price" value={formatRupiah(row.pricePerSlot)} />
                <Field label="Platform Fee" value={formatRupiah(estimatedPlatformFee)} />
                <Field label="Grand Total" value={formatRupiah(estimatedGrandTotal)} bold />
                <div className="ml-auto flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <CheckCircleIcon className="size-4" />
                    {row.status === "COMPLETED" ? "Completed" : "Paid & Confirmed"}
                  </span>
                  {row.status === "CONFIRMED" && whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs"
                    >
                      <MessageCircleIcon className="size-3.5 text-green-700" />
                      Chat organizer
                    </a>
                  )}
                  {row.status === "CONFIRMED" && (
                    <button
                      onClick={handleCancel}
                      disabled={!canCancel || isPending}
                      className={`rounded-md border px-3 py-1.5 text-xs ${
                        canCancel
                          ? "bg-white text-red-600 border-red-200"
                          : "bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {cancelError && <p className="text-xs text-destructive">{cancelError}</p>}

            {row.status === "APPROVED" && !isPaymentExpired && (
              <button
                onClick={() => router.push(`/payment/${row.id}`)}
                className="self-start rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground"
              >
                Choose Payment Method
              </button>
            )}
            {row.status === "APPROVED" && isPaymentExpired && (
              <p className="text-xs text-destructive">
                Payment deadline has passed. This application has expired.
              </p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}