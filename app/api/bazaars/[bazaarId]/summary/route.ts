import { NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBazaarCompletionSummary } from "@/lib/bazaars";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bazaarId: string }> },
) {
  const user = await requireOrganizer();
  const { bazaarId } = await params;

  const bazaar = await prisma.bazaar.findUnique({
    where: { id: bazaarId },
    select: { organizerId: true },
  });

  if (!bazaar || bazaar.organizerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const summary = await getBazaarCompletionSummary(bazaarId);
  return NextResponse.json(summary);
}
