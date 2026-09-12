import type { Metadata } from "next";
import { requireOrganizer } from "@/lib/auth";
import {
  getDashboardStats,
  getApplicationsTrend,
  getApplicationStatusBreakdown,
  getTopCategories,
  getAttentionItems,
  getRecentActivity,
  getUpcomingBazaars,
  getOrganizerBazaarOptions,
} from "@/lib/dashboard";
import { getGreeting } from "@/lib/greeting";
import { OrganizerDashboardClient } from "@/components/organizer-dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard - BazzUp",
};

export default async function OrganizerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bazaarId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireOrganizer();
  const bazaarId = params.bazaarId || undefined;

  const [
    stats,
    trend,
    statusBreakdown,
    categories,
    attentionItems,
    recentActivity,
    upcomingBazaars,
    bazaarOptions,
  ] = await Promise.all([
    getDashboardStats(user.id, bazaarId),
    getApplicationsTrend(user.id, bazaarId),
    getApplicationStatusBreakdown(user.id, bazaarId),
    getTopCategories(user.id, bazaarId),
    getAttentionItems(user.id),
    getRecentActivity(user.id),
    getUpcomingBazaars(user.id),
    getOrganizerBazaarOptions(user.id),
  ]);

  const greeting = getGreeting();
  const displayName = user.businessName || user.name;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <OrganizerDashboardClient
        greeting={greeting}
        displayName={displayName}
        pendingCount={stats.pendingApplications}
        stats={stats}
        trend={trend}
        statusBreakdown={statusBreakdown}
        categories={categories}
        attentionItems={attentionItems}
        recentActivity={recentActivity}
        upcomingBazaars={upcomingBazaars}
        bazaarOptions={bazaarOptions}
        selectedBazaarId={bazaarId ?? ""}
      />
    </main>
  );
}
