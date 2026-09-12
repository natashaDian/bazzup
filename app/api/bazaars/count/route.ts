import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { countBazaars } from "@/lib/bazaars";
import { buildBazaarWhere, parseBazaarSearchParams } from "@/lib/bazaar-search";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const filters = parseBazaarSearchParams({
    city: sp.get("city"),
    start: sp.get("start"),
    end: sp.get("end"),
  });

  const count = await countBazaars(buildBazaarWhere(filters));
  return NextResponse.json({ count });
}
