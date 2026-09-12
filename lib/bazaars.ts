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
          applications: { where: { status: { in: OCCUPYING_APPLICATION_STATUSES } } },
        },
      },
    },
  },
} satisfies Prisma.BazaarInclude;

type BazaarWithCardData = Prisma.BazaarGetPayload<{ include: typeof bazaarCardInclude }>;

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
  const takenSlot = bazaar.areas.reduce((sum, area) => sum + area._count.applications, 0);
  const prices = bazaar.areas.map((area) => area.pricePerSlot);
  const categories = [
    ...new Set(
      bazaar.areas.map((area) => area.categoryWanted).filter((c): c is string => Boolean(c))
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
  limit = 3
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

export async function searchBazaars(where: Prisma.BazaarWhereInput): Promise<BazaarCard[]> {
  const bazaars = await prisma.bazaar.findMany({
    where,
    orderBy: { eventStartDate: "asc" },
    include: bazaarCardInclude,
  });
  return bazaars.map(toBazaarCard);
}

export async function countBazaars(where: Prisma.BazaarWhereInput): Promise<number> {
  return prisma.bazaar.count({ where });
}
