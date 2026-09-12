import type { Metadata } from "next";
import Link from "next/link";
import { getBazaarCities, searchBazaars } from "@/lib/bazaars";
import { buildBazaarWhere, parseBazaarSearchParams } from "@/lib/bazaar-search";
import { ExploreFilterBar } from "@/components/explore-filter-bar";
import { BazaarCard } from "@/components/bazaar-card";

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

  const [cities, bazaars] = await Promise.all([getBazaarCities(), searchBazaars(where)]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Explore Bazaar</h1>
        <ExploreFilterBar
          cities={cities}
          initial={{ city: rawCity, start: rawStart, end: rawEnd }}
        />
      </div>

      <p className="text-sm text-muted-foreground">{bazaars.length} bazaars found</p>

      {bazaars.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bazaars match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bazaars.map((bazaar) => (
            <Link
              key={bazaar.id}
              href={`/bazaars/${bazaar.id}`}
              className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
            >
              <BazaarCard bazaar={bazaar} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
