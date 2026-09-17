import "server-only";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const REQUIRED_ORGANIZER_FIELDS = [
  "businessName",
  "businessDesc",
  "phone",
  "whatsapp",
  "profileImageUrl",
] as const satisfies readonly (keyof User)[];

// Mirrors isVendorProfileComplete in lib/vendor-profile.ts - same required-
// field bar, just for the organizer side of the User model.
export function isOrganizerProfileComplete(user: User): boolean {
  return REQUIRED_ORGANIZER_FIELDS.every((field) => {
    const value = user[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export type OrganizerProfileData = {
  id: string;
  name: string;
  businessName: string | null;
  businessDesc: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
};

export async function getOrganizerProfile(
  userId: string,
): Promise<OrganizerProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: "ORGANIZER" },
    select: {
      id: true,
      name: true,
      businessName: true,
      businessDesc: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      tiktok: true,
      website: true,
      profileImageUrl: true,
      coverImageUrl: true,
    },
  });

  return user;
}

export type OrganizerStats = {
  totalBazaars: number;
  totalVendorsHosted: number;
  averageRating: number | null;
};

export async function getOrganizerStats(
  organizerId: string,
): Promise<OrganizerStats> {
  const [totalBazaars, totalVendorsHosted, ratings] = await Promise.all([
    prisma.bazaar.count({
      where: { organizerId, status: "COMPLETED" },
    }),
    prisma.application.count({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        area: { bazaar: { organizerId } },
      },
    }),
    prisma.review.aggregate({
      where: { revieweeId: organizerId, type: "VENDOR_TO_BAZAAR" },
      _avg: { rating: true },
    }),
  ]);

  return {
    totalBazaars,
    totalVendorsHosted,
    averageRating: ratings._avg.rating,
  };
}

export type OrganizedBazaarCard = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  categories: string[];
  eventStartDate: Date;
  eventEndDate: Date;
  city: string;
  vendorCount: number;
};

export async function getOrganizedBazaars(
  organizerId: string,
): Promise<OrganizedBazaarCard[]> {
  const bazaars = await prisma.bazaar.findMany({
    where: { organizerId, status: "COMPLETED" },
    orderBy: { eventStartDate: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      city: true,
      eventStartDate: true,
      eventEndDate: true,
      images: { take: 1, select: { url: true } },
      areas: {
        select: {
          categoryWanted: true,
          _count: {
            select: {
              applications: {
                where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
              },
            },
          },
        },
      },
    },
  });

  return bazaars.map((bazaar) => {
    const categories = [
      ...new Set(
        bazaar.areas
          .map((a) => a.categoryWanted)
          .filter((c): c is string => Boolean(c)),
      ),
    ];
    const vendorCount = bazaar.areas.reduce(
      (sum, a) => sum + a._count.applications,
      0,
    );

    return {
      id: bazaar.id,
      title: bazaar.title,
      description: bazaar.description,
      coverImageUrl: bazaar.images[0]?.url ?? null,
      categories,
      eventStartDate: bazaar.eventStartDate,
      eventEndDate: bazaar.eventEndDate,
      city: bazaar.city,
      vendorCount,
    };
  });
}
