import "server-only";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@prisma/client";

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
    where: { organizerId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}
export type ApplicationDetail = {
  id: string;
  status: ApplicationStatus;
  matchScore: number | null;
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
    averageRating: number | null;
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
        },
      },
      area: {
        select: {
          id: true,
          name: true,
          totalSlot: true,
          pricePerSlot: true,
          categoryWanted: true,
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

  const [ratings, bazaarsJoined, products, portfolios] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: application.vendor.id, type: "ORGANIZER_TO_VENDOR" },
      _avg: { rating: true },
    }),
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

  return {
    id: application.id,
    status: application.status,
    matchScore: application.matchScore,
    appliedAt: application.appliedAt,
    approvedAt: application.approvedAt,
    paymentConfirmedAt: application.paymentConfirmedAt,
    rejectReason: application.rejectReason,
    vendor: application.vendor,
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
      averageRating: ratings._avg.rating,
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
  averageRating: number | null;
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

  const [ratings, bazaarsJoined, products, portfolios] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: vendorId, type: "ORGANIZER_TO_VENDOR" },
      _avg: { rating: true },
    }),
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
    averageRating: ratings._avg.rating,
    bazaarsJoined,
    products,
    portfolios,
  };
}
