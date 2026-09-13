import type { Metadata } from "next";
import { getBazaarCities, getExploreBazaars } from "@/lib/bazaars";
import { buildBazaarWhere, parseBazaarSearchParams } from "@/lib/bazaar-search";
import { ExploreFilterBar } from "@/components/explore-filter-bar";
import { ExploreExperience } from "@/components/explore/explore-experience";

export const metadata: Metadata = {
  title: "Explore - BazzUp",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const rawCity = firstValue(sp.city);
  const rawStart = firstValue(sp.start);
  const rawEnd = firstValue(sp.end);

  const filters = parseBazaarSearchParams({ city: rawCity, start: rawStart, end: rawEnd });
  const where = buildBazaarWhere(filters);

  const [cities, bazaars] = await Promise.all([getBazaarCities(), getExploreBazaars(where)]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Explore Bazaar</h1>
          <p className="text-sm text-muted-foreground">
            Find bazaars on the map and discover new opportunities.
          </p>
        </div>
        <ExploreFilterBar
          cities={cities}
          initial={{ city: rawCity, start: rawStart, end: rawEnd }}
        />
      </div>

      <ExploreExperience bazaars={bazaars} />
    </main>
  );
}
