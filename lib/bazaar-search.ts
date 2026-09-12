import "server-only";
import type { Prisma } from "@prisma/client";
import { parseDateParam } from "@/lib/date";

export type BazaarSearchParamsInput = {
  city?: string | null;
  start?: string | null;
  end?: string | null;
};

export type BazaarSearchFilters = {
  city?: string;
  start?: Date;
  end?: Date;
};

export function parseBazaarSearchParams(input: BazaarSearchParamsInput): BazaarSearchFilters {
  const city = input.city?.trim();
  const start = parseDateParam(input.start);
  const end = parseDateParam(input.end);

  return {
    city: city || undefined,
    start: start ?? undefined,
    end: end ?? undefined,
  };
}

// Bazaar dianggap cocok kalau rentang tanggal event-nya berpotongan
// dengan rentang pencarian vendor (bukan harus persis sama).
export function buildBazaarWhere(filters: BazaarSearchFilters): Prisma.BazaarWhereInput {
  const where: Prisma.BazaarWhereInput = { status: "ACTIVE" };

  if (filters.city) {
    where.city = filters.city;
  }
  if (filters.start) {
    where.eventEndDate = { gte: filters.start };
  }
  if (filters.end) {
    where.eventStartDate = { lte: filters.end };
  }

  return where;
}
