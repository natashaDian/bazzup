"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPinIcon,
  ZapIcon,
  MessageCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanIcon,
  ArrowRightIcon,
  StarIcon,
} from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatDateDisplay } from "@/lib/date";
import { formatRupiah } from "@/lib/currency";
import { cancelApplicationAction } from "@/lib/payment";
import { PaymentCountdown } from "@/components/payment-countdown";
import { ApplicationPhotoCarousel } from "@/components/application-photo-carousel";
import { cn } from "@/lib/utils";
import type { VendorApplicationRow } from "@/lib/applications";
import type { ApplicationStatus } from "@prisma/client";

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  AWAITING_CONFIRMATION: "bg-purple-100 text-purple-800",
  CONFIRMED: "bg-green-100 text-green-800",
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">{label}</p>
      <p className="text-sm font-medium text-[#3B1F4A]">{value}</p>
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
  const hasEventEnded = row.eventEndDate.getTime() <= Date.now();
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
    <AccordionItem
      value={row.id}
      className="overflow-hidden rounded-[18px] border border-[#EEE4FA] bg-white shadow-[0_2px_10px_rgba(122,92,168,0.05)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(122,92,168,0.09)] data-open:border-[#DCC8EE] data-open:shadow-[0_10px_30px_rgba(122,92,168,0.10)]"
    >
      <AccordionTrigger className="rounded-[18px] border-transparent px-5 py-5 hover:no-underline sm:px-6">
        <div className="flex flex-1 flex-wrap items-center justify-between gap-4 pr-1 sm:pr-2">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-[#F3EAFB]">
              {row.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.images[0]} alt={row.bazaarTitle} className="size-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#3B1F4A]">{row.displayId}</p>
              <p className="truncate text-xs font-normal text-[#6B7280]">{row.bazaarTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-normal text-[#6B7280]">
            <MapPinIcon className="size-3.5 shrink-0 text-[#B98CDE]" />
            {row.areaName}, {row.bazaarCity}
          </div>

          <div className="flex items-center gap-3.5">
            {row.status === "APPROVED" && row.paymentDeadline ? (
              <PaymentCountdown deadline={row.paymentDeadline} />
            ) : (
              <span className="font-semibold text-[#3B1F4A]">{formatRupiah(row.pricePerSlot)}</span>
            )}
            <Badge className={STATUS_BADGE_CLASS[row.status]}>{statusLabel(row.status)}</Badge>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-5 pt-0 pb-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 divide-y divide-[#EEE4FA] border-t border-[#EEE4FA] pt-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-t-0 sm:pt-0">
            <div className="flex flex-col gap-3 pb-5 sm:pr-8 sm:pb-0">
              <h3 className="text-sm font-semibold text-[#3B1F4A]">Application Information</h3>
              <Field label="Application ID" value={row.displayId} />
              <Field label="Business Category" value={row.businessCategory} />
              {/* <Field label="Slot Number" value={row.slotNumber?.toString() ?? "-"} />
              <Field label="Description" value={row.description ?? "-"} /> */}
            </div>

            <div className="flex flex-col gap-3 py-5 sm:px-8 sm:py-0">
              <h3 className="text-sm font-semibold text-[#3B1F4A]">Event Information</h3>
              <div className="overflow-hidden rounded-xl">
                <ApplicationPhotoCarousel images={row.areaImages} />
              </div>
              <Field label="Event Name" value={row.bazaarTitle} />
              <Field label="Area" value={row.areaName} />
              <Field
                label="Event Date"
                value={`${formatDateDisplay(row.eventStartDate)} - ${formatDateDisplay(row.eventEndDate)}`}
              />
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {row.categoryWanted && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-800">
                    {row.categoryWanted}
                  </span>
                )}
                {row.hasElectricity && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-800">
                    <ZapIcon className="size-2.5" />
                    Electricity
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-5 sm:pt-0 sm:pl-8">
              <h3 className="text-sm font-semibold text-[#3B1F4A]">Timeline</h3>
              <div className="flex flex-col">
                {timelineFields.map((field, index) => {
                  const isDone = field.value !== "-";
                  const isLast = index === timelineFields.length - 1;
                  return (
                    <div key={field.label} className="relative flex gap-3 pb-5 last:pb-0">
                      {!isLast && (
                        <span className="absolute top-3 left-[5px] h-full w-px bg-[#EEE4FA]" />
                      )}
                      <span
                        className={cn(
                          "relative z-10 mt-1 size-2.5 shrink-0 rounded-full",
                          isDone ? "bg-[#7A5CA8]" : "bg-[#EEE4FA]",
                        )}
                      />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-[#3B1F4A]">{field.label}</p>
                        <p className={cn("text-xs", isDone ? "text-[#6B7280]" : "text-[#B7AFC2]")}>
                          {field.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#EEE4FA] pt-6">
            <h3 className="text-sm font-semibold text-[#3B1F4A]">Billing</h3>

            {row.status === "REJECTED" && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 px-5 py-4">
                <XCircleIcon className="mt-0.5 size-4 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-medium text-red-700">This application was rejected</p>
                  {row.rejectReason && <p className="mt-0.5 text-xs text-red-600">{row.rejectReason}</p>}
                </div>
              </div>
            )}

            {row.status === "CANCELLED" && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-gray-100 px-5 py-4">
                <BanIcon className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <div>
                  <p className="text-xs font-medium text-gray-700">This application was cancelled</p>
                  {row.cancelReason && <p className="mt-0.5 text-xs text-gray-600">{row.cancelReason}</p>}
                </div>
              </div>
            )}

            {row.status === "EXPIRED" && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-gray-100 px-5 py-4">
                <XCircleIcon className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <p className="text-xs text-gray-600">
                  Payment deadline passed. This application has expired.
                </p>
              </div>
            )}

            {row.status === "NO_SHOW" && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-gray-100 px-5 py-4">
                <BanIcon className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <p className="text-xs text-gray-600">Vendor was marked as no-show for this event.</p>
              </div>
            )}

            {(row.status === "PENDING" || row.status === "APPROVED") && (
              <div className="flex flex-col gap-5 rounded-2xl border border-[#E8E1EF] bg-white p-5 shadow-[0_1px_8px_rgba(122,92,168,0.05)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                  <Field label="Price" value={formatRupiah(row.pricePerSlot)} />
                  <Field label="Platform Fee" value={formatRupiah(estimatedPlatformFee)} />
                  <div className="flex flex-col gap-1 rounded-lg bg-[#F3EAFB] px-3.5 py-2">
                    <p className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                      Grand Total
                    </p>
                    <p className="text-lg font-bold text-[#7A5CA8] sm:text-xl">
                      {formatRupiah(estimatedGrandTotal)}
                    </p>
                  </div>
                  {row.status === "APPROVED" && (
                    <Field label="Payment Deadline" value={formatDateTime(row.paymentDeadline)} />
                  )}
                </div>

                {row.status === "APPROVED" && (
                  <div className="flex items-center sm:border-l sm:border-[#E8E1EF] sm:pl-6">
                    {!isPaymentExpired ? (
                      <button
                        onClick={() => router.push(`/payment/${row.id}`)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A5CA8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6B4F98] sm:w-auto"
                      >
                        Choose Payment Method
                        <ArrowRightIcon className="size-4" />
                      </button>
                    ) : (
                      <p className="text-xs font-medium text-destructive">
                        Payment deadline has passed. This application has expired.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {(row.status === "CONFIRMED" || row.status === "COMPLETED") && (
              <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-green-50 px-5 py-5 sm:px-6">
                <Field label="Price" value={formatRupiah(row.pricePerSlot)} />
                <Field label="Platform Fee" value={formatRupiah(estimatedPlatformFee)} />
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                    Grand Total
                  </p>
                  <p className="text-lg font-bold text-green-700 sm:text-xl">
                    {formatRupiah(estimatedGrandTotal)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <CheckCircleIcon className="size-4" />
                    {row.status === "COMPLETED" ? "Completed" : "Paid & Confirmed"}
                  </span>
                  {(row.status === "CONFIRMED" || row.status === "COMPLETED") && hasEventEnded && (
                    <Link
                      href={`/applications/${row.id}/review`}
                      className="flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs"
                    >
                      <StarIcon className="size-3.5 text-amber-500" />
                      Leave a review
                    </Link>
                  )}
                  {row.status === "CONFIRMED" && whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-[#EEE4FA] bg-white px-3 py-1.5 text-xs text-[#3B1F4A]"
                    >
                      <MessageCircleIcon className="size-3.5 text-green-700" />
                      Chat organizer
                    </a>
                  )}
                  {row.status === "CONFIRMED" && (
                    <button
                      onClick={handleCancel}
                      disabled={!canCancel || isPending}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        canCancel
                          ? "border-red-200 bg-white text-red-600"
                          : "cursor-not-allowed border-transparent bg-gray-50 text-gray-400",
                      )}
                    >
                      {isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {cancelError && <p className="text-xs text-destructive">{cancelError}</p>}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
