import "server-only";
import type { ApplicationStatus, BazaarStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matchscore";

export const OCCUPYING_APPLICATION_STATUSES: ApplicationStatus[] = [
  "APPROVED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "COMPLETED",
];

// Statuses that count as "still an active application" - a vendor with one
// of these for an area should not be able to apply again for that area.
export const NON_TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = [
  "PENDING",
  "APPROVED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
];

// Applications that were APPROVED but whose 24-hour payment window has
// passed without payment should no longer occupy a slot - this "lazily"
// expires them whenever bazaar/area data is read, since there's no cron
// job in this hackathon build.
export async function expireOverdueApplications(): Promise<void> {
  await prisma.application.updateMany({
    where: {
      status: "APPROVED",
      paymentDeadline: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}

// Same "lazy" approach for bazaars whose event has already ended - they
// should flip to COMPLETED so their cards/summary reflect reality, instead
// of staying ACTIVE/FULL forever.
export async function completeOverdueBazaars(): Promise<void> {
  await prisma.bazaar.updateMany({
    where: {
      status: { in: ["ACTIVE", "FULL"] },
      eventEndDate: { lt: new Date() },
    },
    data: { status: "COMPLETED" },
  });
}

// Editing a bazaar's dates (e.g. directly in the database) can move its
// eventEndDate back into the future after it was already auto-completed.
// Reopen those as ACTIVE so completeOverdueBazaars/syncBazaarFullStatuses
// can re-derive the correct status instead of leaving it stuck COMPLETED.
export async function reopenBazaarsWithFutureEndDate(): Promise<void> {
  await prisma.bazaar.updateMany({
    where: {
      status: "COMPLETED",
      eventEndDate: { gte: new Date() },
    },
    data: { status: "ACTIVE" },
  });
}

// A bazaar should flip to FULL once every one of its areas has no slots
// left, and drop back to ACTIVE if a cancellation/rejection/expiry frees a
// slot again. Synced lazily on read, same pattern as the two functions
// above - there's no cron job in this hackathon build to react to
// application status changes as they happen.
export async function syncBazaarFullStatuses(): Promise<void> {
  const bazaars = await prisma.bazaar.findMany({
    where: { status: { in: ["ACTIVE", "FULL"] } },
    select: {
      id: true,
      status: true,
      areas: {
        select: {
          totalSlot: true,
          _count: {
            select: {
              applications: {
                where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
              },
            },
          },
        },
      },
    },
  });

  const toFull: string[] = [];
  const toActive: string[] = [];

  for (const bazaar of bazaars) {
    const areasWithSlots = bazaar.areas.filter((area) => area.totalSlot > 0);
    if (areasWithSlots.length === 0) continue;

    const isFull = areasWithSlots.every(
      (area) => area._count.applications >= area.totalSlot,
    );

    if (isFull && bazaar.status !== "FULL") toFull.push(bazaar.id);
    if (!isFull && bazaar.status === "FULL") toActive.push(bazaar.id);
  }

  await Promise.all([
    toFull.length > 0
      ? prisma.bazaar.updateMany({
          where: { id: { in: toFull } },
          data: { status: "FULL" },
        })
      : Promise.resolve(),
    toActive.length > 0
      ? prisma.bazaar.updateMany({
          where: { id: { in: toActive } },
          data: { status: "ACTIVE" },
        })
      : Promise.resolve(),
  ]);
}

export async function getVendorAppliedAreaIds(
  vendorId: string,
  areaIds: string[],
): Promise<Set<string>> {
  if (areaIds.length === 0) return new Set();

  const applications = await prisma.application.findMany({
    where: {
      vendorId,
      areaId: { in: areaIds },
      status: { in: NON_TERMINAL_APPLICATION_STATUSES },
    },
    select: { areaId: true },
  });

  return new Set(applications.map((application) => application.areaId));
}

const bazaarCardInclude = {
  images: { take: 1 },
  areas: {
    select: {
      totalSlot: true,
      pricePerSlot: true,
      categoryWanted: true,
      _count: {
        select: {
          applications: {
            where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
          },
        },
      },
    },
  },
} satisfies Prisma.BazaarInclude;

type BazaarWithCardData = Prisma.BazaarGetPayload<{
  include: typeof bazaarCardInclude;
}>;

export type BazaarCard = {
  id: string;
  title: string;
  city: string;
  address: string;
  eventStartDate: Date;
  eventEndDate: Date;
  coverImageUrl: string | null;
  totalSlot: number;
  slotsLeft: number;
  minPricePerSlot: number | null;
  categories: string[];
};

function toBazaarCard(bazaar: BazaarWithCardData): BazaarCard {
  const totalSlot = bazaar.areas.reduce((sum, area) => sum + area.totalSlot, 0);
  const takenSlot = bazaar.areas.reduce(
    (sum, area) => sum + area._count.applications,
    0,
  );
  const prices = bazaar.areas.map((area) => area.pricePerSlot);
  const categories = [
    ...new Set(
      bazaar.areas
        .map((area) => area.categoryWanted)
        .filter((c): c is string => Boolean(c)),
    ),
  ];

  return {
    id: bazaar.id,
    title: bazaar.title,
    city: bazaar.city,
    address: bazaar.address,
    eventStartDate: bazaar.eventStartDate,
    eventEndDate: bazaar.eventEndDate,
    coverImageUrl: bazaar.images[0]?.url ?? null,
    totalSlot,
    slotsLeft: Math.max(totalSlot - takenSlot, 0),
    minPricePerSlot: prices.length > 0 ? Math.min(...prices) : null,
    categories,
  };
}

export async function getBazaarCities(): Promise<string[]> {
  const rows = await prisma.bazaar.findMany({
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  return rows.map((row) => row.city);
}

export async function getRecommendedBazaars(
  businessType: string | null,
  targetMarket: string | null,
  limit?: number,
): Promise<(BazaarCard & { matchScore: number })[]> {
  const baseWhere: Prisma.BazaarWhereInput = {
    status: "ACTIVE",
    eventStartDate: { gte: new Date() },
  };

  const bazaars = await prisma.bazaar.findMany({
    where: baseWhere,
    include: {
      images: { take: 1 },
      areas: {
        select: {
          // Needed by toBazaarCard():
          totalSlot: true,
          pricePerSlot: true,
          categoryWanted: true,
          _count: {
            select: {
              applications: {
                where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
              },
            },
          },
          // Needed by calculateMatchScore():
          visitorProfile: true,
          estimatedTraffic: true,
          hasElectricity: true,
        },
      },
    },
  });

  const vendor = { businessType, targetMarket };

  const sorted = bazaars
    .map((bazaar) => {
      const bestScore = bazaar.areas.reduce((max, area) => {
        const { score } = calculateMatchScore({ area, vendor });
        return Math.max(max, score);
      }, 0);

      return { ...toBazaarCard(bazaar), matchScore: bestScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return limit === undefined ? sorted : sorted.slice(0, limit);
}

// Omit `limit` to get every upcoming bazaar (used by the "See all" pages) -
// the home page passes an explicit limit for its teaser cards.
export async function getUpcomingBazaars(
  limit?: number,
): Promise<BazaarCard[]> {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const bazaars = await prisma.bazaar.findMany({
    where: {
      status: "ACTIVE",
      eventStartDate: { gte: now, lte: in30Days },
    },
    orderBy: { eventStartDate: "asc" },
    take: limit,
    include: bazaarCardInclude,
  });
  return bazaars.map(toBazaarCard);
}

export async function countBazaars(
  where: Prisma.BazaarWhereInput,
): Promise<number> {
  return prisma.bazaar.count({ where });
}

const exploreBazaarInclude = {
  images: true,
  organizer: { select: { name: true, businessName: true } },
  areas: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      pricePerSlot: true,
      totalSlot: true,
      categoryWanted: true,
      _count: {
        select: {
          applications: {
            where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
          },
        },
      },
    },
  },
} satisfies Prisma.BazaarInclude;

type BazaarWithExploreData = Prisma.BazaarGetPayload<{
  include: typeof exploreBazaarInclude;
}>;

export type ExploreBazaarArea = {
  id: string;
  name: string;
  pricePerSlot: number;
  slotsLeft: number;
  totalSlot: number;
  categoryWanted: string | null;
};

export type ExploreBazaar = {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  eventStartDate: Date;
  eventEndDate: Date;
  images: string[];
  organizerName: string;
  categories: string[];
  minPricePerSlot: number | null;
  areas: ExploreBazaarArea[];
};

function toExploreBazaar(bazaar: BazaarWithExploreData): ExploreBazaar {
  const categories = [
    ...new Set(
      bazaar.areas
        .map((area) => area.categoryWanted)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  const prices = bazaar.areas.map((area) => area.pricePerSlot);

  return {
    id: bazaar.id,
    title: bazaar.title,
    description: bazaar.description,
    address: bazaar.address,
    city: bazaar.city,
    // Safe: the query below only selects rows where both are non-null.
    latitude: bazaar.latitude as number,
    longitude: bazaar.longitude as number,
    eventStartDate: bazaar.eventStartDate,
    eventEndDate: bazaar.eventEndDate,
    images: bazaar.images.map((image) => image.url),
    organizerName: bazaar.organizer.businessName ?? bazaar.organizer.name,
    categories,
    minPricePerSlot: prices.length > 0 ? Math.min(...prices) : null,
    areas: bazaar.areas.map((area) => ({
      id: area.id,
      name: area.name,
      pricePerSlot: area.pricePerSlot,
      slotsLeft: Math.max(area.totalSlot - area._count.applications, 0),
      totalSlot: area.totalSlot,
      categoryWanted: area.categoryWanted,
    })),
  };
}

// Only bazaars with coordinates can be placed on the map, so those are
// filtered out at the query level instead of showing pin-less rows.
export async function getExploreBazaars(
  where: Prisma.BazaarWhereInput,
): Promise<ExploreBazaar[]> {
  const bazaars = await prisma.bazaar.findMany({
    where: { ...where, latitude: { not: null }, longitude: { not: null } },
    orderBy: { eventStartDate: "asc" },
    include: exploreBazaarInclude,
  });
  return bazaars.map(toExploreBazaar);
}

const bazaarDetailInclude = {
  images: true,
  organizer: {
    select: {
      name: true,
      businessName: true,
      businessDesc: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      website: true,
    },
  },
  areas: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      totalSlot: true,
      pricePerSlot: true,
      categoryWanted: true,
      hasElectricity: true,
      estimatedTraffic: true,
      images: { take: 1 },
      _count: {
        select: {
          applications: {
            where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
          },
        },
      },
    },
  },
} satisfies Prisma.BazaarInclude;
type BazaarWithDetailData = Prisma.BazaarGetPayload<{
  include: typeof bazaarDetailInclude;
}>;

export type BazaarAreaDetail = {
  id: string;
  name: string;
  description: string | null;
  totalSlot: number;
  slotsLeft: number;
  pricePerSlot: number;
  categoryWanted: string | null;
  hasElectricity: boolean;
  estimatedTraffic: number | null;
  imageUrl: string | null;
};

export type BazaarOrganizerContact = {
  businessDesc: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
};

export type BazaarDetail = {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  eventStartDate: Date;
  eventEndDate: Date;
  status: BazaarStatus;
  images: string[];
  facilities: string[];
  organizerName: string;
  organizerContact: BazaarOrganizerContact;
  organizerRating: number | null;
  areas: BazaarAreaDetail[];
};
function toBazaarDetail(
  bazaar: BazaarWithDetailData,
  organizerRating: number | null,
): BazaarDetail {
  return {
    id: bazaar.id,
    title: bazaar.title,
    description: bazaar.description,
    address: bazaar.address,
    city: bazaar.city,
    latitude: bazaar.latitude,
    longitude: bazaar.longitude,
    eventStartDate: bazaar.eventStartDate,
    eventEndDate: bazaar.eventEndDate,
    status: bazaar.status,
    images: bazaar.images.map((image) => image.url),
    facilities: bazaar.facilities
      ? bazaar.facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
      : [],
    organizerName: bazaar.organizer.businessName ?? bazaar.organizer.name,
    organizerContact: {
      businessDesc: bazaar.organizer.businessDesc,
      phone: bazaar.organizer.phone,
      whatsapp: bazaar.organizer.whatsapp,
      instagram: bazaar.organizer.instagram,
      website: bazaar.organizer.website,
    },
    organizerRating,
    areas: bazaar.areas.map((area) => ({
      id: area.id,
      name: area.name,
      description: area.description,
      totalSlot: area.totalSlot,
      slotsLeft: Math.max(area.totalSlot - area._count.applications, 0),
      pricePerSlot: area.pricePerSlot,
      categoryWanted: area.categoryWanted,
      hasElectricity: area.hasElectricity,
      estimatedTraffic: area.estimatedTraffic,
      imageUrl: area.images[0]?.url ?? null,
    })),
  };
}
export async function getBazaarById(id: string): Promise<BazaarDetail | null> {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();
  await completeOverdueBazaars();

  const bazaar = await prisma.bazaar.findUnique({
    where: { id },
    include: bazaarDetailInclude,
  });

  if (!bazaar) return null;

  const ratingResult = await prisma.review.aggregate({
    where: { revieweeId: bazaar.organizerId, type: "VENDOR_TO_BAZAAR" },
    _avg: { rating: true },
  });

  return toBazaarDetail(bazaar, ratingResult._avg.rating);
}

export type OrganizerBazaarCardData = BazaarCard & {
  status: string;
  areaCount: number;
  pendingApplicationsCount: number;
};

export async function getOrganizerBazaarCounts(organizerId: string) {
  const groups = await prisma.bazaar.groupBy({
    by: ["status"],
    where: { organizerId },
    _count: { _all: true },
  });

  const counts = { all: 0, DRAFT: 0, ACTIVE: 0, FULL: 0, COMPLETED: 0 };
  for (const g of groups) {
    counts[g.status as keyof typeof counts] = g._count._all;
    counts.all += g._count._all;
  }
  return counts;
}
export async function getOrganizerBazaars(
  organizerId: string,
  filters: { status?: string; q?: string } = {},
): Promise<OrganizerBazaarCardData[]> {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();
  await completeOverdueBazaars();

  const where: Prisma.BazaarWhereInput = { organizerId };

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status as Prisma.EnumBazaarStatusFilter["equals"];
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { city: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const bazaars = await prisma.bazaar.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: bazaarCardInclude,
  });

  if (bazaars.length === 0) return [];

  const areaRows = await prisma.area.findMany({
    where: { bazaarId: { in: bazaars.map((b) => b.id) } },
    select: { id: true, bazaarId: true },
  });

  const areaIdToBazaarId = new Map(areaRows.map((a) => [a.id, a.bazaarId]));
  const areaCountPerBazaar = new Map<string, number>();
  for (const a of areaRows) {
    areaCountPerBazaar.set(
      a.bazaarId,
      (areaCountPerBazaar.get(a.bazaarId) ?? 0) + 1,
    );
  }

  const pendingCounts = await prisma.application.groupBy({
    by: ["areaId"],
    where: { status: "PENDING", areaId: { in: areaRows.map((a) => a.id) } },
    _count: { _all: true },
  });
  const pendingPerBazaar = new Map<string, number>();
  for (const row of pendingCounts) {
    const bazaarId = areaIdToBazaarId.get(row.areaId);
    if (!bazaarId) continue;
    pendingPerBazaar.set(
      bazaarId,
      (pendingPerBazaar.get(bazaarId) ?? 0) + row._count._all,
    );
  }

  return bazaars.map((bazaar) => ({
    ...toBazaarCard(bazaar),
    status: bazaar.status,
    areaCount: areaCountPerBazaar.get(bazaar.id) ?? 0,
    pendingApplicationsCount: pendingPerBazaar.get(bazaar.id) ?? 0,
  }));
}

export type BazaarReview = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorProfileImageUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

export type BazaarCompletionSummary = {
  totalAreas: number;
  totalVendorsConfirmed: number;
  totalRevenue: number;
  eventStartDate: Date;
  eventEndDate: Date;
  areaBreakdown: { areaName: string; filled: number; totalSlot: number }[];
  averageRating: number | null;
  reviews: BazaarReview[];
};

export async function getBazaarCompletionSummary(
  bazaarId: string,
): Promise<BazaarCompletionSummary | null> {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();
  await completeOverdueBazaars();

  const bazaar = await prisma.bazaar.findUnique({
    where: { id: bazaarId },
    select: {
      eventStartDate: true,
      eventEndDate: true,
      areas: {
        select: {
          name: true,
          totalSlot: true,
          _count: {
            select: {
              applications: {
                where: { status: { in: OCCUPYING_APPLICATION_STATUSES } },
              },
            },
          },
        },
      },
    },
  });

  if (!bazaar) return null;

  const totalAreas = bazaar.areas.length;
  const totalVendorsConfirmed = bazaar.areas.reduce(
    (sum, area) => sum + area._count.applications,
    0,
  );

  const [revenueResult, reviewRows] = await Promise.all([
    prisma.application.aggregate({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        area: { bazaarId },
      },
      _sum: { platformFee: true },
    }),
    prisma.review.findMany({
      where: { type: "VENDOR_TO_BAZAAR", application: { area: { bazaarId } } },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, businessName: true, profileImageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const reviews: BazaarReview[] = reviewRows.map((review) => ({
    id: review.id,
    vendorId: review.author.id,
    vendorName: review.author.businessName || review.author.name,
    vendorProfileImageUrl: review.author.profileImageUrl,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return {
    totalAreas,
    totalVendorsConfirmed,
    totalRevenue: revenueResult._sum.platformFee ?? 0,
    eventStartDate: bazaar.eventStartDate,
    eventEndDate: bazaar.eventEndDate,
    areaBreakdown: bazaar.areas.map((area) => ({
      areaName: area.name,
      filled: area._count.applications,
      totalSlot: area.totalSlot,
    })),
    averageRating,
    reviews,
  };
}

export type BazaarConfirmedVendor = {
  id: string;
  vendorName: string;
  category: string | null;
  areaName: string;
  status: ApplicationStatus;
};

export async function getBazaarConfirmedVendors(
  bazaarId: string,
): Promise<BazaarConfirmedVendor[]> {
  await expireOverdueApplications();
  await reopenBazaarsWithFutureEndDate();
  await syncBazaarFullStatuses();
  await completeOverdueBazaars();

  const applications = await prisma.application.findMany({
    where: {
      status: { in: OCCUPYING_APPLICATION_STATUSES },
      area: { bazaarId },
    },
    select: {
      id: true,
      businessCategory: true,
      status: true,
      vendor: { select: { name: true, businessName: true } },
      area: { select: { name: true } },
    },
    orderBy: { vendor: { businessName: "asc" } },
  });

  return applications.map((app) => ({
    id: app.id,
    vendorName: app.vendor.businessName || app.vendor.name,
    category: app.businessCategory,
    areaName: app.area.name,
    status: app.status,
  }));
}