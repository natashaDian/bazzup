import "server-only";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/lib/mailer";

export type ReviewRequestCronResult = {
  bazaarsMatched: number;
  sent: number;
  failed: number;
};

// Shared by the /api/cron/review-requests route (Vercel Cron + manual curl)
// and the dev-only interval in instrumentation.ts, so both paths run the
// exact same logic. Matches bazaars whose eventEndDate falls on today only -
// see the route handler for why this is intentionally stateless.
export async function runReviewRequestCron(): Promise<ReviewRequestCronResult> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const bazaars = await prisma.bazaar.findMany({
    where: { eventEndDate: { gte: startOfToday, lt: startOfTomorrow } },
    select: {
      id: true,
      title: true,
      areas: {
        select: {
          applications: {
            where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
            select: {
              id: true,
              vendor: { select: { email: true, name: true } },
            },
          },
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const bazaar of bazaars) {
    const applications = bazaar.areas.flatMap((area) => area.applications);
    for (const application of applications) {
      try {
        await sendReviewRequestEmail({
          to: application.vendor.email,
          vendorName: application.vendor.name,
          bazaarTitle: bazaar.title,
          applicationId: application.id,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send review request for application ${application.id}`, error);
        failed++;
      }
    }
  }

  return { bazaarsMatched: bazaars.length, sent, failed };
}
