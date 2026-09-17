import "server-only";
import { prisma } from "@/lib/prisma";

const OCCUPYING_STATUSES = [
  "APPROVED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "COMPLETED",
] as const;

export type ChatBazaarResult = {
  id: string;
  title: string;
  organizerName: string;
  city: string;
  coverImageUrl: string | null;
  category: string | null;
  eventStartDate: Date;
  eventEndDate: Date;
  totalSlot: number;
  slotsLeft: number;
  minPricePerSlot: number | null;
};

export async function searchBazaarsForChat(params: {
  category?: string;
  city?: string;
  maxPrice?: number;
}): Promise<ChatBazaarResult[]> {
  const areaFilter: {
    categoryWanted?: { contains: string; mode: "insensitive" };
    pricePerSlot?: { lte: number };
  } = {};

  if (params.category) {
    areaFilter.categoryWanted = {
      contains: params.category,
      mode: "insensitive",
    };
  }
  if (params.maxPrice) {
    areaFilter.pricePerSlot = { lte: params.maxPrice };
  }

  const bazaars = await prisma.bazaar.findMany({
    where: {
      status: "ACTIVE",
      ...(params.city
        ? { city: { contains: params.city, mode: "insensitive" } }
        : {}),
      areas: { some: areaFilter },
    },
    take: 5,
    orderBy: { eventStartDate: "asc" },
    select: {
      id: true,
      title: true,
      city: true,
      eventStartDate: true,
      eventEndDate: true,
      organizer: { select: { businessName: true, name: true } },
      images: { take: 1, select: { url: true } },
      areas: {
        where: params.category || params.maxPrice ? areaFilter : undefined,
        select: {
          totalSlot: true,
          pricePerSlot: true,
          categoryWanted: true,
          _count: {
            select: {
              applications: { where: { status: { in: [...OCCUPYING_STATUSES] } } },
            },
          },
        },
      },
    },
  });

  const results = bazaars
    .filter((b) => b.areas.length > 0)
    .map((bazaar) => {
      const totalSlot = bazaar.areas.reduce((sum, a) => sum + a.totalSlot, 0);
      const takenSlot = bazaar.areas.reduce(
        (sum, a) => sum + a._count.applications,
        0,
      );
      const prices = bazaar.areas.map((a) => a.pricePerSlot);

      return {
        id: bazaar.id,
        title: bazaar.title,
        organizerName: bazaar.organizer.businessName || bazaar.organizer.name,
        city: bazaar.city,
        coverImageUrl: bazaar.images[0]?.url ?? null,
        category: bazaar.areas[0]?.categoryWanted ?? null,
        eventStartDate: bazaar.eventStartDate,
        eventEndDate: bazaar.eventEndDate,
        totalSlot,
        slotsLeft: Math.max(totalSlot - takenSlot, 0),
        minPricePerSlot: prices.length > 0 ? Math.min(...prices) : null,
      };
    });

  console.log("hasil query:", results.length, JSON.stringify(results.slice(0, 2)));

  return results;
}
