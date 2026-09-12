import "server-only";
import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Mirrors the ApplicationStatus enum in prisma/schema.prisma - kept as an
// explicit array (rather than derived at runtime) so the "All Status"
// dropdown can render options in a deliberate order.
export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
  { value: "AWAITING_CONFIRMATION", label: "Awaiting Confirmation" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
  { value: "COMPLETED", label: "Completed" },
];

export type VendorApplicationRow = {
  id: string;
  displayId: string;
  bazaarTitle: string;
  bazaarCity: string;
  areaName: string;
  coverImageUrl: string | null;
  businessCategory: string;
  description: string | null;
  slotNumber: number | null;
  status: ApplicationStatus;
  pricePerSlot: number;
  totalPrice: number | null;
  platformFee: number | null;
  grandTotal: number | null;
  paymentDeadline: Date | null;
  appliedAt: Date;
  approvedAt: Date | null;
  paymentConfirmedAt: Date | null;
  invoiceSentAt: Date | null;
};

// There's no human-readable sequence number stored on Application (that
// would need a new schema field / counter) - this derives a stable,
// display-only id straight from the primary key instead.
function toDisplayId(id: string): string {
  return `APP-${id.slice(-6).toUpperCase()}`;
}

export async function getVendorApplications(
  vendorId: string,
  filters: { status?: ApplicationStatus; sort?: "newest" | "oldest" }
): Promise<VendorApplicationRow[]> {
  const applications = await prisma.application.findMany({
    where: {
      vendorId,
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { appliedAt: filters.sort === "oldest" ? "asc" : "desc" },
    include: {
      area: {
        select: {
          name: true,
          pricePerSlot: true,
          bazaar: { select: { title: true, city: true, images: { take: 1 } } },
        },
      },
    },
  });

  return applications.map((application) => ({
    id: application.id,
    displayId: toDisplayId(application.id),
    bazaarTitle: application.area.bazaar.title,
    bazaarCity: application.area.bazaar.city,
    areaName: application.area.name,
    coverImageUrl: application.area.bazaar.images[0]?.url ?? null,
    businessCategory: application.businessCategory,
    description: application.description,
    slotNumber: application.slotNumber,
    status: application.status,
    pricePerSlot: application.area.pricePerSlot,
    totalPrice: application.totalPrice,
    platformFee: application.platformFee,
    grandTotal:
      application.totalPrice !== null && application.platformFee !== null
        ? application.totalPrice + application.platformFee
        : null,
    paymentDeadline: application.paymentDeadline,
    appliedAt: application.appliedAt,
    approvedAt: application.approvedAt,
    paymentConfirmedAt: application.paymentConfirmedAt,
    invoiceSentAt: application.invoiceSentAt,
  }));
}
