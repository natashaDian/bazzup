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
  businessType: string | null, targetMarket: string | null,
  limit = 3,
): Promise<(BazaarCard & { matchScore: number })[]> {
  const baseWhere: Prisma.BazaarWhereInput = { status: "ACTIVE", eventStartDate: { gte: new Date() } };

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
              applications: { where: { status: { in: OCCUPYING_APPLICATION_STATUSES } } },
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

  return bazaars
    .map((bazaar) => {
      const bestScore = bazaar.areas.reduce((max, area) => {
        const { score } = calculateMatchScore({ area, vendor });
        return Math.max(max, score);
      }, 0);
 
      return { ...toBazaarCard(bazaar), matchScore: bestScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export async function getUpcomingBazaars(limit = 3): Promise<BazaarCard[]> {
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
  organizer: { select: { name: true, businessName: true } },
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

export type BazaarDetail = {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  eventStartDate: Date;
  eventEndDate: Date;
  status: BazaarStatus;
  images: string[];
  organizerName: string;
  areas: BazaarAreaDetail[];
};
function toBazaarDetail(bazaar: BazaarWithDetailData): BazaarDetail {
  return {
    id: bazaar.id,
    title: bazaar.title,
    description: bazaar.description,
    address: bazaar.address,
    city: bazaar.city,
    eventStartDate: bazaar.eventStartDate,
    eventEndDate: bazaar.eventEndDate,
    status: bazaar.status,
    images: bazaar.images.map((image) => image.url),
    organizerName: bazaar.organizer.businessName ?? bazaar.organizer.name,
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
  const bazaar = await prisma.bazaar.findUnique({
    where: { id },
    include: bazaarDetailInclude,
  });

  return bazaar ? toBazaarDetail(bazaar) : null;
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
