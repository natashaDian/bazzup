"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  NON_TERMINAL_APPLICATION_STATUSES,
  OCCUPYING_APPLICATION_STATUSES,
} from "@/lib/bazaars";
import {
  ALREADY_APPLIED_MESSAGE,
  SLOT_SOLD_OUT_MESSAGE,
} from "@/lib/application-messages";
import { createNotification } from "@/lib/notifications";

export type ApplyToAreaState = {
  error?: string;
  success?: string;
};

function calculateMatchScore(params: {
  vendorCategory: string | null;
  areaCategoryWanted: string | null;
  vendorTargetMarket: string | null;
  areaVisitorProfile: string | null;
}): number {
  let score = 20;

  if (
    params.vendorCategory &&
    params.areaCategoryWanted &&
    params.vendorCategory.trim().toLowerCase() ===
      params.areaCategoryWanted.trim().toLowerCase()
  ) {
    score += 50;
  }

  if (
    params.vendorTargetMarket &&
    params.areaVisitorProfile &&
    params.vendorTargetMarket.trim().toLowerCase() ===
      params.areaVisitorProfile.trim().toLowerCase()
  ) {
    score += 30;
  }

  return score;
}

export async function applyToAreaAction(
  bazaarId: string,
  areaId: string,
  _prevState: ApplyToAreaState,
  _formData: FormData,
): Promise<ApplyToAreaState> {
  const user = await requireVendor();

  const area = await prisma.area.findUnique({
    where: { id: areaId },
    select: {
      bazaarId: true,
      totalSlot: true,
      categoryWanted: true,
      visitorProfile: true,
      bazaar: { select: { title: true, organizerId: true } },
      _count: {
        select: {
          applications: {
            where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
          },
        },
      },
    },
  });

  if (!area || area.bazaarId !== bazaarId) {
    return { error: "This area could not be found." };
  }

  if (area._count.applications >= area.totalSlot) {
    return { error: SLOT_SOLD_OUT_MESSAGE };
  }

  const existing = await prisma.application.findFirst({
    where: {
      areaId,
      vendorId: user.id,
      status: { in: NON_TERMINAL_APPLICATION_STATUSES },
    },
  });

  if (existing) {
    return { error: ALREADY_APPLIED_MESSAGE };
  }

  const matchScore = calculateMatchScore({
    vendorCategory: user.businessType,
    areaCategoryWanted: area.categoryWanted,
    vendorTargetMarket: user.targetMarket,
    areaVisitorProfile: area.visitorProfile,
  });

  const application = await prisma.application.create({
    data: {
      areaId,
      vendorId: user.id,
      businessCategory: user.businessType ?? "General",
      status: "PENDING",
      matchScore,
    },
  });

  const vendorName = user.businessName || user.name;
  await createNotification({
    userId: area.bazaar.organizerId,
    message: `New application from ${vendorName} for ${area.bazaar.title}`,
    linkUrl: `/organizer/applications/${application.id}`,
  });

  revalidatePath(`/bazaars/${bazaarId}`);

  return {
    success: "Application submitted! The organizer will review it soon.",
  };
}
