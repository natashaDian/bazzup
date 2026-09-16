// Runs once when the Next.js server starts (both `next dev` and
// production). In production the review-request cron is driven by
// vercel.json instead, so this only sets up the interval in development -
// there's no way to run Vercel Cron against a local dev server otherwise.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "development") return;

  const { runReviewRequestCron } = await import("@/lib/review-request-cron");
  // TEMP: 1 minute for quick local testing - production stays on the 5-hour
  // schedule in vercel.json regardless of this value. Bump this back to
  // FIVE_HOURS_MS once done testing.
  const INTERVAL_MS = 1 * 60 * 1000;

  console.log(
    `[dev-cron] review-requests scheduled every ${INTERVAL_MS / 1000}s while \`npm run dev\` is running.`,
  );

  setInterval(() => {
    runReviewRequestCron()
      .then((result) => console.log("[dev-cron] review-requests result:", result))
      .catch((error) => console.error("[dev-cron] review-requests failed:", error));
  }, INTERVAL_MS);
}
