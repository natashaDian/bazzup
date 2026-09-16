"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export type PaymentActionState = {
  error?: string;
};

function generateTransactionId(): string {
  return `TRX-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
}

async function getApplicationForVendor(
  applicationId: string,
  vendorId: string,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      vendorId: true,
      totalPrice: true,
      platformFee: true,
      vendor: { select: { name: true, businessName: true } },
      area: {
        select: {
          pricePerSlot: true,
          bazaar: {
            select: {
              title: true,
              eventStartDate: true,
              organizerId: true,
            },
          },
        },
      },
    },
  });

  if (!application || application.vendorId !== vendorId) {
    return null;
  }
  return application;
}

export type PaymentPageData = {
  id: string;
  status: string;
  bazaarTitle: string;
  areaName: string;
  pricePerSlot: number;
  platformFee: number;
  grandTotal: number;
};

export async function getPaymentPageData(
  applicationId: string,
  vendorId: string,
): Promise<PaymentPageData | null> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      vendorId: true,
      totalPrice: true,
      platformFee: true,
      area: {
        select: {
          name: true,
          pricePerSlot: true,
          bazaar: { select: { title: true } },
        },
      },
    },
  });

  if (!application || application.vendorId !== vendorId) {
    return null;
  }

  const pricePerSlot = application.area.pricePerSlot;
  const platformFee =
    application.platformFee ?? Math.round(pricePerSlot * 0.05);
  const grandTotal = pricePerSlot + platformFee;

  return {
    id: application.id,
    status: application.status,
    bazaarTitle: application.area.bazaar.title,
    areaName: application.area.name,
    pricePerSlot,
    platformFee,
    grandTotal,
  };
}

export async function simulatePaymentAction(
  applicationId: string,
  method: string,
): Promise<PaymentActionState> {
  const user = await requireVendor();
  const application = await getApplicationForVendor(applicationId, user.id);

  if (!application) {
    return { error: "Application not found." };
  }
  if (application.status !== "APPROVED") {
    return { error: "This application is not awaiting payment." };
  }

  const now = new Date();
  const pricePerSlot = application.area.pricePerSlot;
  const totalPrice = application.totalPrice ?? pricePerSlot;
  const platformFee =
    application.platformFee ?? Math.round(pricePerSlot * 0.05);

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "CONFIRMED",
      totalPrice,
      platformFee,
      paidAt: now,
      transactionId: generateTransactionId(),
      paymentConfirmedAt: now,
      invoiceSentAt: now,
    },
  });

  const vendorName = application.vendor.businessName || application.vendor.name;
  await createNotification({
    userId: application.area.bazaar.organizerId,
    message: `${vendorName} confirmed payment for ${application.area.bazaar.title}`,
    linkUrl: `/organizer/applications/${applicationId}`,
  });

  revalidatePath("/applications");
  return {};
}

export async function cancelApplicationAction(
  applicationId: string,
): Promise<PaymentActionState> {
  const user = await requireVendor();
  const application = await getApplicationForVendor(applicationId, user.id);

  if (!application) {
    return { error: "Application not found." };
  }
  if (application.status !== "CONFIRMED") {
    return { error: "This application cannot be cancelled." };
  }

  const eventStartDate = application.area.bazaar.eventStartDate;
  const daysUntilEvent = Math.floor(
    (eventStartDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilEvent <= 7) {
    return { error: "Cannot cancel within 7 days of the event." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  const vendorName = application.vendor.businessName || application.vendor.name;
  await createNotification({
    userId: application.area.bazaar.organizerId,
    message: `${vendorName} cancelled their application for ${application.area.bazaar.title}`,
    linkUrl: `/organizer/applications/${applicationId}`,
  });

  revalidatePath("/applications");
  return {};
}
