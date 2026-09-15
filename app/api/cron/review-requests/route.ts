import { NextResponse } from "next/server";
import { runReviewRequestCron } from "@/lib/review-request-cron";

// Runs once a day in production (see vercel.json). Emails every vendor
// whose CONFIRMED (or COMPLETED) application belongs to a bazaar whose
// event ends today. In development, instrumentation.ts calls the same
// logic on an interval instead - this route is used by Vercel Cron and by
// manual testing (curl with the Authorization header below).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runReviewRequestCron();
  return NextResponse.json(result);
}
