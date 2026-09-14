import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { getBazaarCities, getRecommendedBazaars, getUpcomingBazaars } from "@/lib/bazaars";
import { BazaarSearchDialog } from "@/components/bazaar-search-dialog";
import { BazaarCard } from "@/components/bazaar-card";
import { DialogTrigger } from "@/components/ui/dialog";
import { IncompleteProfileDialog } from "@/components/incomplete-profile-dialog";
import { isVendorProfileComplete } from "@/lib/vendor-profile";

export const metadata: Metadata = {
  title: "Home - BazzUp",
};

export default async function VendorHomePage() {
  const user = await requireVendor();

  const [cities, recommended, upcoming] = await Promise.all([
    getBazaarCities(),
    getRecommendedBazaars(user.businessType, user.targetMarket),
    getUpcomingBazaars(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-10 bg-white">
      <IncompleteProfileDialog defaultOpen={!isVendorProfileComplete(user)} />
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Discover Bazaars, Grow Your Business</h1>
        <p className="text-base text-muted-foreground">
          Find the right events, connect with communities, and bring your business to more
          people.
        </p>

        <BazaarSearchDialog
          cities={cities}
          trigger={
            <DialogTrigger className="flex w-full max-w-xl items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted">
              <SearchIcon className="size-4 shrink-0" />
              <span className="flex-1">Search event and location...</span>
              <span className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Search
              </span>
            </DialogTrigger>
          }
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Link href="/allbazaar/recommended" className="text-sm font-medium text-primary hover:underline">
            See All &rarr;
          </Link>
        </div>
        {recommended.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bazaars available yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((bazaar) => (
              <Link key={bazaar.id} href={`/bazaars/${bazaar.id}`}
              className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <BazaarCard bazaar={bazaar} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upcoming Bazaars</h2>
          <Link href="/allbazaar/upcoming" className="text-sm font-medium text-primary hover:underline">
            See All &rarr;
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bazaars yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {upcoming.map((bazaar) => (
              <Link key={bazaar.id} href={`/bazaars/${bazaar.id}`}
              className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <BazaarCard bazaar={bazaar} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
