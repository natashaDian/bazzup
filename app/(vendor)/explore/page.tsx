import type { Metadata } from "next";
import { getBazaarCities, getExploreBazaars } from "@/lib/bazaars";
import { buildBazaarWhere, parseBazaarSearchParams } from "@/lib/bazaar-search";
import { ExploreExperience } from "@/components/explore/explore-experience";
import { IncompleteProfileDialog } from "@/components/incomplete-profile-dialog";

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
  const incompleteProfile = firstValue(sp.incompleteProfile) === "1";

  const filters = parseBazaarSearchParams({ city: rawCity, start: rawStart, end: rawEnd });
  const where = buildBazaarWhere(filters);

  const [cities, bazaars] = await Promise.all([getBazaarCities(), getExploreBazaars(where)]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 bg-white px-6 py-10 md:px-10 md:py-12 lg:px-16">
      <IncompleteProfileDialog defaultOpen={incompleteProfile} />
      <div>
        <h1 className="text-2xl font-bold text-[#3B1F4A]">Explore Bazaar</h1>
        <p className="text-sm text-[#6B7280]">
          Find bazaars on the map and discover new opportunities.
        </p>
      </div>

      <ExploreExperience
        bazaars={bazaars}
        cities={cities}
        initial={{ city: rawCity, start: rawStart, end: rawEnd }}
      />
    </main>
  );
}
