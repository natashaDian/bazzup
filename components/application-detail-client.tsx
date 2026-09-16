"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ExternalLink } from "lucide-react";
import type { ApplicationDetail } from "@/lib/applications";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/app/(organizer)/organizer/applications/actions";

const STATUS_STYLE: Record <
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B", label: "Pending" },
  APPROVED: { bg: "#EAF3DE", text: "#27500A", label: "Approved" },
  AWAITING_CONFIRMATION: {
    bg: "#F3EAFB",
    text: "#7A5CA8",
    label: "Awaiting payment",
  },
  CONFIRMED: { bg: "#EAF3DE", text: "#27500A", label: "Confirmed" },
  COMPLETED: { bg: "#F1EFE8", text: "#5F5E5A", label: "Completed" },
  REJECTED: { bg: "#FCEBEB", text: "#791F1F", label: "Rejected" },
  EXPIRED: { bg: "#F1EFE8", text: "#5F5E5A", label: "Expired" },
  CANCELLED: { bg: "#F1EFE8", text: "#5F5E5A", label: "Cancelled" },
  NO_SHOW: { bg: "#F1EFE8", text: "#5F5E5A", label: "No show" },
};

function getScoreColor(score: number | null) {
  const value = score ?? 0;
  if (value >= 70) return "#639922";
  if (value >= 40) return "#EF9F27";
  return "#E24B4A";
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MatchRingLarge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * value) / 100;
  const color = getScoreColor(score);

  return (
    <div className="relative w-[88px] h-[88px] mx-auto">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#F1EFE8"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}

export function ApplicationDetailClient({
  application,
}: {
  application: ApplicationDetail;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const vendorName = application.vendor.businessName || application.vendor.name;
  const status = STATUS_STYLE[application.status] ?? STATUS_STYLE.PENDING;
  const isPendingStatus = application.status === "PENDING";

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveApplicationAction(application.id);
      if (result?.error) {
        setError(result.error);
        setShowApproveDialog(false);
      } else {
        router.push("/organizer/applications");
      }
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectApplicationAction(
        application.id,
        rejectReason,
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setShowRejectDialog(false);
        router.push("/organizer/applications");
      }
    });
  }

  return (
    <div>
      <Link
        href="/organizer/applications"
        className="flex items-center gap-1.5 text-accent text-xs mb-4"
      >
        <ArrowLeft className="size-3.5" />
        Back to applications
      </Link>

      {error && (
        <p className="text-sm text-destructive mb-4 bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        <div>
          <div className="bg-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-[52px] h-[52px] rounded-full bg-secondary/15 flex items-center justify-center text-base font-medium text-accent shrink-0">
                {vendorName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-medium">{vendorName}</p>
                  {application.vendor.businessType && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-accent">
                      {application.vendor.businessType}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-secondary mt-0.5">
                  Applied on {formatDate(application.appliedAt)}
                </p>
              </div>
              <span
                className="text-xs px-3 py-1 rounded-full shrink-0"
                style={{ backgroundColor: status.bg, color: status.text }}
              >
                {status.label}
              </span>
            </div>
            {application.vendor.businessDesc && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {application.vendor.businessDesc}
              </p>
            )}
          </div>

          <div className="bg-card rounded-2xl p-5 mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
              Application details
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applying to</span>
                <span>
                  {application.bazaar.title} &middot; {application.area.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category wanted</span>
                <span>{application.area.categoryWanted || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slots available</span>
                <span>
                  {application.area.slotsLeft} of {application.area.totalSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per slot</span>
                <span>
                  Rp {application.area.pricePerSlot.toLocaleString("id-ID")}
                </span>
              </div>
              {application.rejectReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reject reason</span>
                  <span>{application.rejectReason}</span>
                </div>
              )}
            </div>
          </div>

          {isPendingStatus && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectDialog(true)}
                className="flex-1 bg-destructive/10 text-destructive py-3 rounded-xl text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => setShowApproveDialog(true)}
                className="flex-1 bg-accent text-accent-foreground py-3 rounded-xl text-sm"
              >
                Approve
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="bg-card rounded-2xl p-5 mb-4 text-center">
            <p className="text-[11px] text-muted-foreground mb-2.5">
              Match score
            </p>
            <MatchRingLarge score={application.matchScore} />
          </div>

          <div className="bg-card rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
              Vendor profile
            </p>

            <div className="flex flex-col gap-2 mb-3.5 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="size-3.5 text-accent" />
                {application.vendorStats.bazaarsJoined} bazaars joined
              </span>
              {application.vendor.instagram && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  @{application.vendor.instagram}
                </span>
              )}
            </div>

            {application.vendorStats.products.length > 0 && (
              <>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Products
                </p>
                <div className="flex flex-col gap-1.5 mb-3.5">
                  {application.vendorStats.products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-secondary/10 rounded-lg px-2.5 py-2 flex justify-between text-xs"
                    >
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">
                        Rp {p.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {application.vendorStats.portfolios.length > 0 && (
              <>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Past bazaars
                </p>
                <div className="flex flex-col gap-1.5 mb-3.5">
                  {application.vendorStats.portfolios.map((p) => (
                    <div
                      key={p.id}
                      className="bg-secondary/10 rounded-lg px-2.5 py-2 flex justify-between text-xs"
                    >
                      <span>{p.bazaarName}</span>
                      <span className="text-muted-foreground">
                        {formatDate(p.eventDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Link
              href={`/organizer/vendors/${application.vendor.id}`}
              className="flex items-center justify-center gap-1.5 text-xs text-accent"
            >
              View full profile
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {showApproveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-medium mb-2">
              Approve this application?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {vendorName} will be notified and given 24 hours to complete
              payment.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowApproveDialog(false)}
                className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
              >
                {isPending ? "Approving..." : "Yes, approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-medium mb-2">
              Reject this application?
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-4 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm"
              >
                {isPending ? "Rejecting..." : "Yes, reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}