import "server-only";
import { prisma } from "@/lib/prisma";

const CONFIRMED_STATUSES = ["CONFIRMED", "COMPLETED"] as const;
const REJECTED_STATUSES = ["REJECTED", "EXPIRED"] as const;

export type DashboardStats = {
  primaryLabel: string;
  primaryValue: number;
  pendingApplications: number;
  confirmedVendors: number;
  revenue: number;
};

export async function getDashboardStats(
  organizerId: string,
  bazaarId?: string,
): Promise<DashboardStats> {
  if (bazaarId) {
    const [totalAreas, pendingApplications, confirmedVendors, revenueResult] =
      await Promise.all([
        prisma.area.count({ where: { bazaarId } }),
        prisma.application.count({
          where: { status: "PENDING", area: { bazaarId } },
        }),
        prisma.application.count({
          where: { status: { in: CONFIRMED_STATUSES }, area: { bazaarId } },
        }),
        prisma.application.aggregate({
          where: { status: { in: CONFIRMED_STATUSES }, area: { bazaarId } },
          _sum: { platformFee: true },
        }),
      ]);

    return {
      primaryLabel: "Total areas",
      primaryValue: totalAreas,
      pendingApplications,
      confirmedVendors,
      revenue: revenueResult._sum.platformFee ?? 0,
    };
  }

  const [activeBazaars, pendingApplications, confirmedVendors, revenueResult] =
    await Promise.all([
      prisma.bazaar.count({ where: { organizerId, status: "ACTIVE" } }),
      prisma.application.count({
        where: { status: "PENDING", area: { bazaar: { organizerId } } },
      }),
      prisma.application.count({
        where: {
          status: { in: CONFIRMED_STATUSES },
          area: { bazaar: { organizerId } },
        },
      }),
      prisma.application.aggregate({
        where: {
          status: { in: CONFIRMED_STATUSES },
          area: { bazaar: { organizerId } },
        },
        _sum: { platformFee: true },
      }),
    ]);

  return {
    primaryLabel: "Active bazaars",
    primaryValue: activeBazaars,
    pendingApplications,
    confirmedVendors,
    revenue: revenueResult._sum.platformFee ?? 0,
  };
}

export type TrendPoint = { week: string; count: number };

export async function getApplicationsTrend(
  organizerId: string,
  bazaarId?: string,
): Promise<TrendPoint[]> {
  const weeksBack = 8;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksBack * 7);

  const applications = await prisma.application.findMany({
    where: {
      appliedAt: { gte: startDate },
      area: bazaarId ? { bazaarId } : { bazaar: { organizerId } },
    },
    select: { appliedAt: true },
  });

  const buckets: TrendPoint[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7 - 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const count = applications.filter(
      (a) => a.appliedAt >= weekStart && a.appliedAt < weekEnd,
    ).length;

    buckets.push({ week: `W${weeksBack - i}`, count });
  }

  return buckets;
}

export type StatusBreakdown = {
  confirmed: number;
  pending: number;
  rejected: number;
};

export async function getApplicationStatusBreakdown(
  organizerId: string,
  bazaarId?: string,
): Promise<StatusBreakdown> {
  const areaFilter = bazaarId ? { bazaarId } : { bazaar: { organizerId } };

  const [confirmed, pending, rejected] = await Promise.all([
    prisma.application.count({
      where: { status: { in: CONFIRMED_STATUSES }, area: areaFilter },
    }),
    prisma.application.count({
      where: { status: "PENDING", area: areaFilter },
    }),
    prisma.application.count({
      where: { status: { in: REJECTED_STATUSES }, area: areaFilter },
    }),
  ]);

  return { confirmed, pending, rejected };
}

export type CategoryCount = { category: string; count: number };

export async function getTopCategories(
  organizerId: string,
  bazaarId?: string,
): Promise<CategoryCount[]> {
  const applications = await prisma.application.findMany({
    where: {
      area: bazaarId ? { bazaarId } : { bazaar: { organizerId } },
    },
    select: { businessCategory: true },
  });

  const counts = new Map<string, number>();
  for (const app of applications) {
    const category = app.businessCategory || "Other";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export type AttentionItem = {
  type: "draft" | "pending" | "unrated";
  message: string;
  bazaarId: string;
};

export async function getAttentionItems(
  organizerId: string,
): Promise<AttentionItem[]> {
  const items: AttentionItem[] = [];

  const draftBazaars = await prisma.bazaar.findMany({
    where: { organizerId, status: "DRAFT" },
    select: { id: true, title: true },
    take: 3,
  });
  for (const bazaar of draftBazaars) {
    items.push({
      type: "draft",
      message: `${bazaar.title} is still a draft`,
      bazaarId: bazaar.id,
    });
  }

  const bazaarsWithPending = await prisma.bazaar.findMany({
    where: {
      organizerId,
      areas: { some: { applications: { some: { status: "PENDING" } } } },
    },
    select: {
      id: true,
      title: true,
      areas: {
        select: {
          _count: {
            select: { applications: { where: { status: "PENDING" } } },
          },
        },
      },
    },
    take: 3,
  });
  for (const bazaar of bazaarsWithPending) {
    const pendingCount = bazaar.areas.reduce(
      (sum, a) => sum + a._count.applications,
      0,
    );
    if (pendingCount > 0) {
      items.push({
        type: "pending",
        message: `${pendingCount} applications waiting at ${bazaar.title}`,
        bazaarId: bazaar.id,
      });
    }
  }

  const completedUnrated = await prisma.bazaar.findMany({
    where: {
      organizerId,
      status: "COMPLETED",
      areas: {
        some: {
          applications: {
            some: {
              status: "COMPLETED",
              reviews: { none: { type: "ORGANIZER_TO_VENDOR" } },
            },
          },
        },
      },
    },
    select: { id: true, title: true },
    take: 3,
  });
  for (const bazaar of completedUnrated) {
    items.push({
      type: "unrated",
      message: `Rate vendors from ${bazaar.title}`,
      bazaarId: bazaar.id,
    });
  }

  return items.slice(0, 5);
}

export type ActivityItem = {
  message: string;
  createdAt: Date;
};

export async function getRecentActivity(
  organizerId: string,
): Promise<ActivityItem[]> {
  const recentApplications = await prisma.application.findMany({
    where: { area: { bazaar: { organizerId } } },
    orderBy: { appliedAt: "desc" },
    take: 5,
    select: {
      appliedAt: true,
      status: true,
      vendor: { select: { businessName: true, name: true } },
      area: { select: { bazaar: { select: { title: true } } } },
    },
  });

  return recentApplications.map((app) => {
    const vendorName = app.vendor.businessName || app.vendor.name;
    const bazaarTitle = app.area.bazaar.title;

    let message = `${vendorName} applied to ${bazaarTitle}`;
    if (app.status === "CONFIRMED" || app.status === "COMPLETED") {
      message = `${vendorName} confirmed payment for ${bazaarTitle}`;
    } else if (app.status === "REJECTED") {
      message = `${vendorName}'s application to ${bazaarTitle} was rejected`;
    }

    return { message, createdAt: app.appliedAt };
  });
}

export type UpcomingBazaar = {
  id: string;
  title: string;
  daysUntil: number;
};

export async function getUpcomingBazaars(
  organizerId: string,
): Promise<UpcomingBazaar[]> {
  const now = new Date();

  const bazaars = await prisma.bazaar.findMany({
    where: { organizerId, eventStartDate: { gte: now } },
    orderBy: { eventStartDate: "asc" },
    take: 3,
    select: { id: true, title: true, eventStartDate: true },
  });

  return bazaars.map((bazaar) => {
    const diffMs = bazaar.eventStartDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { id: bazaar.id, title: bazaar.title, daysUntil };
  });
}

export async function getOrganizerBazaarOptions(organizerId: string) {
  return prisma.bazaar.findMany({
    where: { organizerId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
}
