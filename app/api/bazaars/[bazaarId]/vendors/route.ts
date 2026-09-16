import { NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBazaarConfirmedVendors } from "@/lib/bazaars";

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

  const vendors = await getBazaarConfirmedVendors(bazaarId);
  return NextResponse.json(vendors);
}
