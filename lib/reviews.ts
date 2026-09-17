"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export type ReviewActionState = {
  error?: string;
  success?: string;
};

export async function submitBazaarReviewAction(
  applicationId: string,
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await requireVendor();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      vendorId: true,
      status: true,
      area: {
        select: {
          bazaar: {
            select: { id: true, title: true, organizerId: true, eventEndDate: true },
          },
        },
      },
    },
  });

  if (!application || application.vendorId !== user.id) {
    return { error: "Application not found." };
  }
  if (application.status !== "CONFIRMED" && application.status !== "COMPLETED") {
    return { error: "This application isn't eligible for a review yet." };
  }
  if (application.area.bazaar.eventEndDate > new Date()) {
    return { error: "You can review this bazaar once the event has ended." };
  }

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a rating from 1 to 5." };
  }

  const existing = await prisma.review.findFirst({
    where: { applicationId, authorId: user.id, type: "VENDOR_TO_BAZAAR" },
    select: { id: true },
  });
  if (existing) {
    return { error: "You've already reviewed this bazaar." };
  }

  await prisma.review.create({
    data: {
      applicationId,
      authorId: user.id,
      revieweeId: application.area.bazaar.organizerId,
      type: "VENDOR_TO_BAZAAR",
      rating,
      comment: comment || null,
    },
  });

  const vendorName = user.businessName || user.name;
  await createNotification({
    userId: application.area.bazaar.organizerId,
    message: `${vendorName} melakukan review terhadap ${application.area.bazaar.title}, yuk lihat reviewnya!`,
    linkUrl: `/organizer/bazaars?openSummary=${application.area.bazaar.id}`,
  });

  revalidatePath("/applications");

  return { success: "Thanks for your review!" };
}
