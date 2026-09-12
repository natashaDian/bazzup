"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NON_TERMINAL_APPLICATION_STATUSES } from "@/lib/bazaars";
import { ALREADY_APPLIED_MESSAGE } from "@/lib/application-messages";

export type ApplyToAreaState = {
  error?: string;
  success?: string;
};

export async function applyToAreaAction(
  bazaarId: string,
  areaId: string,
  _prevState: ApplyToAreaState,
  _formData: FormData
): Promise<ApplyToAreaState> {
  const user = await requireVendor();

  const area = await prisma.area.findUnique({
    where: { id: areaId },
    select: { bazaarId: true },
  });

  if (!area || area.bazaarId !== bazaarId) {
    return { error: "This area could not be found." };
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

  await prisma.application.create({
    data: {
      areaId,
      vendorId: user.id,
      businessCategory: user.businessType ?? "General",
      status: "PENDING",
    },
  });

  revalidatePath(`/bazaars/${bazaarId}`);

  return { success: "Application submitted! The organizer will review it soon." };
}
