import "server-only";
import type { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const OCCUPYING_APPLICATION_STATUSES: ApplicationStatus[] = [
  "APPROVED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "COMPLETED",
];

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
  limit = 3,
): Promise<BazaarCard[]> {
  const baseWhere: Prisma.BazaarWhereInput = { status: "ACTIVE" };

  let bazaars = await prisma.bazaar.findMany({
    where: businessType
      ? { ...baseWhere, areas: { some: { categoryWanted: businessType } } }
      : baseWhere,
    orderBy: { eventStartDate: "asc" },
    take: limit,
    include: bazaarCardInclude,
  });

  if (bazaars.length === 0 && businessType) {
    bazaars = await prisma.bazaar.findMany({
      where: baseWhere,
      orderBy: { eventStartDate: "asc" },
      take: limit,
      include: bazaarCardInclude,
    });
  }

  return bazaars.map(toBazaarCard);
}

export async function getUpcomingBazaars(limit = 3): Promise<BazaarCard[]> {
  const bazaars = await prisma.bazaar.findMany({
    where: { status: "ACTIVE" },
    orderBy: { eventStartDate: "asc" },
    take: limit,
    include: bazaarCardInclude,
  });
  return bazaars.map(toBazaarCard);
}

export async function searchBazaars(
  where: Prisma.BazaarWhereInput,
): Promise<BazaarCard[]> {
  const bazaars = await prisma.bazaar.findMany({
    where,
    orderBy: { eventStartDate: "asc" },
    include: bazaarCardInclude,
  });
  return bazaars.map(toBazaarCard);
}

export async function countBazaars(
  where: Prisma.BazaarWhereInput,
): Promise<number> {
  return prisma.bazaar.count({ where });
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