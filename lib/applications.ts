import "server-only";
import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  expireOverdueApplications,
  reopenBazaarsWithFutureEndDate,
  syncBazaarFullStatuses,
} from "@/lib/bazaars";

export const APPLICATION_STATUSES: {
  value: ApplicationStatus;
  label: string;
}[] = [
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

// No cron/scheduler in this app, so a CONFIRMED application never moves to
// COMPLETED on its own once the bazaar's event is over. Called once before
// listing a vendor's applications so the "Leave a review" button (gated on
// status === "COMPLETED" in ApplicationStatusCard) actually has something to
// key off of.
export async function syncCompletedApplications(): Promise<void> {
  await prisma.application.updateMany({
    where: {
      status: "CONFIRMED",
      area: { bazaar: { eventEndDate: { lt: new Date() } } },
    },
    data: { status: "COMPLETED" },
  });
}

export type VendorApplicationRow = {
  id: string;
  displayId: string;
  bazaarTitle: string;
  bazaarCity: string;
  areaName: string;
  images: string[];
  areaImages: string[];
  businessCategory: string;
  categoryWanted: string | null;
  hasElectricity: boolean;
  description: string | null;
  slotNumber: number | null;
  status: ApplicationStatus;
  pricePerSlot: number;
  totalPrice: number | null;
  platformFee: number | null;
  grandTotal: number | null;
  paymentDeadline: Date | null;
  eventStartDate: Date;
  eventEndDate: Date;
  appliedAt: Date;
  approvedAt: Date | null;
  paymentConfirmedAt: Date | null;
  invoiceSentAt: Date | null;
  rejectReason: string | null;
  rejectedAt: Date | null;
  cancelReason: string | null;
  cancelledAt: Date | null;
  organizerWhatsapp: string | null;
  name: string;
  businessName: string;
};

function toDisplayId(id: string): string {
  return `APP-${id.slice(-6).toUpperCase()}`;
}

export async function getVendorApplications(
  vendorId: string,
  filters: { status?: ApplicationStatus; sort?: "newest" | "oldest" },
): Promise<VendorApplicationRow[]> {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();

  const applications = await prisma.application.findMany({
    where: {
      vendorId,
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { appliedAt: filters.sort === "oldest" ? "asc" : "desc" },
    include: {
      vendor: {
        select: {
          name: true,
          businessName: true,
        },
      },
      area: {
        select: {
          name: true,
          pricePerSlot: true,
          categoryWanted: true,
          hasElectricity: true,
          images: { select: { url: true } },
          bazaar: {
            select: {
              title: true,
              city: true,
              eventStartDate: true,
              eventEndDate: true,
              images: true,
              organizer: { select: { whatsapp: true } },
            },
          },
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
    images: application.area.bazaar.images.map((img) => img.url),
    areaImages: application.area.images.map((img) => img.url),
    businessCategory: application.businessCategory,
    categoryWanted: application.area.categoryWanted,
    hasElectricity: application.area.hasElectricity,
    description: application.description,
    slotNumber: application.slotNumber,
    status: application.status,
    name: application.vendor.name,
    businessName: application.vendor.businessName ?? "",
    pricePerSlot: application.area.pricePerSlot,
    totalPrice: application.totalPrice,
    platformFee: application.platformFee,
    grandTotal:
      application.totalPrice !== null && application.platformFee !== null
        ? application.totalPrice + application.platformFee
        : null,
    paymentDeadline: application.paymentDeadline,
    eventStartDate: application.area.bazaar.eventStartDate,
    eventEndDate: application.area.bazaar.eventEndDate,
    appliedAt: application.appliedAt,
    approvedAt: application.approvedAt,
    paymentConfirmedAt: application.paymentConfirmedAt,
    invoiceSentAt: application.invoiceSentAt,
    rejectReason: application.rejectReason,
    rejectedAt: application.rejectedAt,
    cancelReason: application.cancelReason,
    cancelledAt: application.cancelledAt,
    organizerWhatsapp: application.area.bazaar.organizer.whatsapp,
  }));
}

export type ApplicationCard = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorInitials: string;
  category: string | null;
  bazaarTitle: string;
  areaName: string;
  matchScore: number | null;
  status: ApplicationStatus;
  appliedAt: Date;
  approvedAt: Date | null;
  paymentConfirmedAt: Date | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function getApplicationsBoard(
  organizerId: string,
  filters: { bazaarId?: string; q?: string; sort?: string } = {},
) {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();

  const where = {
    area: {
      bazaar: {
        organizerId,
        ...(filters.bazaarId ? { id: filters.bazaarId } : {}),
      },
    },
    ...(filters.q
      ? {
          vendor: {
            OR: [
              {
                businessName: {
                  contains: filters.q,
                  mode: "insensitive" as const,
                },
              },
              { name: { contains: filters.q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const applications = await prisma.application.findMany({
    where,
    orderBy: { appliedAt: "desc" },
    select: {
      id: true,
      businessCategory: true,
      matchScore: true,
      status: true,
      appliedAt: true,
      approvedAt: true,
      paymentConfirmedAt: true,
      vendor: { select: { id: true, name: true, businessName: true } },
      area: {
        select: {
          name: true,
          bazaar: { select: { title: true } },
        },
      },
    },
  });

  const cards: ApplicationCard[] = applications.map((app) => {
    const vendorName = app.vendor.businessName || app.vendor.name;
    return {
      id: app.id,
      vendorId: app.vendor.id,
      vendorName,
      vendorInitials: getInitials(vendorName),
      category: app.businessCategory,
      bazaarTitle: app.area.bazaar.title,
      areaName: app.area.name,
      matchScore: app.matchScore,
      status: app.status,
      appliedAt: app.appliedAt,
      approvedAt: app.approvedAt,
      paymentConfirmedAt: app.paymentConfirmedAt,
    };
  });

  const pending = cards.filter((c) => c.status === "PENDING");
  const confirmed = cards.filter((c) =>
    ["APPROVED", "AWAITING_CONFIRMATION", "CONFIRMED", "COMPLETED"].includes(
      c.status,
    ),
  );
  const rejected = cards.filter((c) =>
    ["REJECTED", "EXPIRED", "CANCELLED", "NO_SHOW"].includes(c.status),
  );

  if (filters.sort === "highest") {
    pending.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  } else if (filters.sort === "newest") {
    pending.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  return { pending, confirmed, rejected };
}

export async function getOrganizerBazaarOptionsForFilter(organizerId: string) {
  return prisma.bazaar.findMany({
    where: { organizerId, status: { not: "DRAFT" } },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}

export type MatchScoreBreakdownItem = {
  label: string;
  points: number;
  achieved: boolean;
  isBaseline: boolean;
};

export type ApplicationDetail = {
  id: string;
  status: ApplicationStatus;
  matchScore: number | null;
  matchScoreBreakdown: MatchScoreBreakdownItem[];
  appliedAt: Date;
  approvedAt: Date | null;
  paymentConfirmedAt: Date | null;
  rejectReason: string | null;
  vendor: {
    id: string;
    name: string;
    businessName: string | null;
    businessType: string | null;
    businessDesc: string | null;
    instagram: string | null;
    isVerifiedVendor: boolean;
  };
  area: {
    id: string;
    name: string;
    totalSlot: number;
    pricePerSlot: number;
    categoryWanted: string | null;
    slotsLeft: number;
  };
  bazaar: {
    id: string;
    title: string;
  };
  vendorStats: {
    bazaarsJoined: number;
    products: { id: string; name: string; price: number }[];
    portfolios: { id: string; bazaarName: string; eventDate: Date }[];
  };
};

const OCCUPYING_STATUSES_LOCAL = [
  "APPROVED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "COMPLETED",
] as const;

export async function getApplicationDetail(
  applicationId: string,
  organizerId: string,
): Promise<ApplicationDetail | null> {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      matchScore: true,
      appliedAt: true,
      approvedAt: true,
      paymentConfirmedAt: true,
      rejectReason: true,
      vendor: {
        select: {
          id: true,
          name: true,
          businessName: true,
          businessType: true,
          businessDesc: true,
          instagram: true,
          isVerifiedVendor: true,
          targetMarket: true,
        },
      },
      area: {
        select: {
          id: true,
          name: true,
          totalSlot: true,
          pricePerSlot: true,
          categoryWanted: true,
          visitorProfile: true,
          bazaarId: true,
          bazaar: { select: { id: true, title: true, organizerId: true } },
          _count: {
            select: {
              applications: {
                where: { status: { in: [...OCCUPYING_STATUSES_LOCAL] } },
              },
            },
          },
        },
      },
    },
  });

  if (!application || application.area.bazaar.organizerId !== organizerId) {
    return null;
  }

  const [bazaarsJoined, products, portfolios] = await Promise.all([
    prisma.application.count({
      where: { vendorId: application.vendor.id, status: "COMPLETED" },
    }),
    prisma.product.findMany({
      where: { vendorId: application.vendor.id },
      select: { id: true, name: true, price: true },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),
    prisma.portfolio.findMany({
      where: { vendorId: application.vendor.id },
      select: { id: true, bazaarName: true, eventDate: true },
      take: 2,
      orderBy: { eventDate: "desc" },
    }),
  ]);

  const categoryMatch =
    !!application.vendor.businessType &&
    !!application.area.categoryWanted &&
    application.vendor.businessType.trim().toLowerCase() ===
      application.area.categoryWanted.trim().toLowerCase();
  const marketMatch =
    !!application.vendor.targetMarket &&
    !!application.area.visitorProfile &&
    application.vendor.targetMarket.trim().toLowerCase() ===
      application.area.visitorProfile.trim().toLowerCase();

  const matchScoreBreakdown: MatchScoreBreakdownItem[] = [
    {
      label: "Skor dasar (otomatis)",
      points: 20,
      achieved: true,
      isBaseline: true,
    },
    {
      label: "Kategori usaha sesuai area",
      points: categoryMatch ? 50 : 0,
      achieved: categoryMatch,
      isBaseline: false,
    },
    {
      label: "Target pasar sesuai area",
      points: marketMatch ? 30 : 0,
      achieved: marketMatch,
      isBaseline: false,
    },
  ];

  return {
    id: application.id,
    status: application.status,
    matchScore: application.matchScore,
    matchScoreBreakdown,
    appliedAt: application.appliedAt,
    approvedAt: application.approvedAt,
    paymentConfirmedAt: application.paymentConfirmedAt,
    rejectReason: application.rejectReason,
    vendor: {
      id: application.vendor.id,
      name: application.vendor.name,
      businessName: application.vendor.businessName,
      businessType: application.vendor.businessType,
      businessDesc: application.vendor.businessDesc,
      instagram: application.vendor.instagram,
      isVerifiedVendor: application.vendor.isVerifiedVendor,
    },
    area: {
      id: application.area.id,
      name: application.area.name,
      totalSlot: application.area.totalSlot,
      pricePerSlot: application.area.pricePerSlot,
      categoryWanted: application.area.categoryWanted,
      slotsLeft: Math.max(
        application.area.totalSlot - application.area._count.applications,
        0,
      ),
    },
    bazaar: application.area.bazaar,
    vendorStats: {
      bazaarsJoined,
      products,
      portfolios,
    },
  };
}

export type VendorPublicProfile = {
  id: string;
  name: string;
  businessName: string | null;
  businessType: string | null;
  businessDesc: string | null;
  targetMarket: string | null;
  phone: string | null;
  instagram: string | null;
  whatsapp: string | null;
  tiktok: string | null;
  website: string | null;
  profileImageUrl: string | null;
  isVerifiedVendor: boolean;
  bazaarsJoined: number;
  products: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  }[];
  portfolios: {
    id: string;
    bazaarName: string;
    eventDate: Date;
    photoUrl: string;
  }[];
};

export async function getVendorPublicProfile(
  vendorId: string,
): Promise<VendorPublicProfile | null> {
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId, role: "VENDOR" },
    select: {
      id: true,
      name: true,
      businessName: true,
      businessType: true,
      businessDesc: true,
      targetMarket: true,
      phone: true,
      instagram: true,
      whatsapp: true,
      tiktok: true,
      website: true,
      profileImageUrl: true,
      isVerifiedVendor: true,
    },
  });

  if (!vendor) return null;

  const [bazaarsJoined, products, portfolios] = await Promise.all([
    prisma.application.count({
      where: { vendorId, status: "COMPLETED" },
    }),
    prisma.product.findMany({
      where: { vendorId },
      select: { id: true, name: true, price: true, imageUrl: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.portfolio.findMany({
      where: { vendorId },
      select: { id: true, bazaarName: true, eventDate: true, photoUrl: true },
      orderBy: { eventDate: "desc" },
    }),
  ]);

  return {
    ...vendor,
    bazaarsJoined,
    products,
    portfolios,
  };
}
