import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StarIcon } from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateDisplay } from "@/lib/date";
import { ReviewForm } from "./review-form";

type PageParams = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Leave a Review - BazzUp",
};

export default async function ReviewPage({ params }: PageParams) {
  const { id } = await params;
  const user = await requireVendor();

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      vendorId: true,
      status: true,
      area: {
        select: {
          bazaar: {
            select: {
              title: true,
              city: true,
              eventStartDate: true,
              eventEndDate: true,
              organizerId: true,
            },
          },
        },
      },
      reviews: {
        where: { authorId: user.id, type: "VENDOR_TO_BAZAAR" },
        select: { id: true, rating: true, comment: true },
      },
    },
  });

  if (!application || application.vendorId !== user.id) {
    notFound();
  }

  const bazaar = application.area.bazaar;
  const isEligibleStatus = application.status === "CONFIRMED" || application.status === "COMPLETED";
  const hasEventEnded = bazaar.eventEndDate <= new Date();
  const existingReview = application.reviews[0] ?? null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{bazaar.title}</h1>
        <p className="text-sm text-muted-foreground">
          {bazaar.city} &middot; {formatDateDisplay(bazaar.eventStartDate)} -{" "}
          {formatDateDisplay(bazaar.eventEndDate)}
        </p>
      </div>

      {existingReview ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-6">
          <p className="text-sm font-medium">You&apos;ve already reviewed this bazaar</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <StarIcon
                key={value}
                className={
                  value <= existingReview.rating
                    ? "size-5 fill-amber-400 text-amber-400"
                    : "size-5 text-muted-foreground"
                }
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
          )}
        </div>
      ) : !isEligibleStatus ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Reviews are only available for confirmed applications.
        </p>
      ) : !hasEventEnded ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          You can leave a review once the event has ended.
        </p>
      ) : (
        <ReviewForm applicationId={application.id} />
      )}

      <Link href="/applications" className="text-sm font-medium text-primary hover:underline">
        &larr; Back to Application Status
      </Link>
    </main>
  );
}
