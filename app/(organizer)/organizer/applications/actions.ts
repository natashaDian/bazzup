"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export type ApplicationActionState = {
  error?: string;
};

async function assertApplicationOwnership(
  applicationId: string,
  organizerId: string,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      status: true,
      areaId: true,
      vendorId: true,
      area: {
        select: {
          bazaarId: true,
          bazaar: { select: { organizerId: true, title: true } },
        },
      },
    },
  });

  if (!application || application.area.bazaar.organizerId !== organizerId) {
    throw new Error("Application not found");
  }
  return application;
}

export async function approveApplicationAction(
  applicationId: string,
): Promise<ApplicationActionState> {
  const user = await requireOrganizer();
  const application = await assertApplicationOwnership(applicationId, user.id);

  if (application.status !== "PENDING") {
    return { error: "This application has already been decided." };
  }

  const area = await prisma.area.findUnique({
    where: { id: application.areaId },
    select: {
      totalSlot: true,
      _count: {
        select: {
          applications: {
            where: {
              status: {
                in: [
                  "APPROVED",
                  "AWAITING_CONFIRMATION",
                  "CONFIRMED",
                  "COMPLETED",
                ],
              },
            },
          },
        },
      },
    },
  });

  if (!area || area._count.applications >= area.totalSlot) {
    return { error: "No more slots available in this area." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await createNotification({
    userId: application.vendorId,
    message: `Your application for ${application.area.bazaar.title} was approved! Please complete payment within 24 hours.`,
    linkUrl: "/applications",
  });

  revalidatePath("/organizer/applications");
  return {};
}

export async function rejectApplicationAction(
  applicationId: string,
  reason?: string,
): Promise<ApplicationActionState> {
  const user = await requireOrganizer();
  const application = await assertApplicationOwnership(applicationId, user.id);

  if (application.status !== "PENDING") {
    return { error: "This application has already been decided." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED", rejectReason: reason || null },
  });

  revalidatePath("/organizer/applications");
  return {};
}
