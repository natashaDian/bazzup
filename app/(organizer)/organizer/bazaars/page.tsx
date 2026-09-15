import type { Metadata } from "next";
import Link from "next/link";
import { requireOrganizer } from "@/lib/auth";
import { getOrganizerBazaars, getOrganizerBazaarCounts } from "@/lib/bazaars";
import { getGreeting } from "@/lib/greeting";
import { OrganizerBazaarsToolbar } from "@/components/organizer-bazaars-toolbar";
import { OrganizerBazaarCard } from "@/components/organizer-bazaar-card";
export const metadata: Metadata = {
  title: "My Bazaars - BazzUp",
};

export default async function MyBazaarsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const user = await requireOrganizer();

  const [bazaars, counts] = await Promise.all([
    getOrganizerBazaars(user.id, { status: params.status, q: params.q }),
    getOrganizerBazaarCounts(user.id),
  ]);

  const greeting = getGreeting();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#3B1F4A] sm:text-3xl">
          {greeting}, {user.businessName || user.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage and track all your created bazaars in one place.
        </p>
      </div>

      <OrganizerBazaarsToolbar
        counts={counts}
        currentStatus={params.status ?? "ALL"}
        currentQuery={params.q ?? ""}
      />

      {bazaars.length === 0 ? (
        <div className="border border-dashed rounded-xl py-20 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-5">
            You haven't created any bazaars yet.
          </p>
          <Link
            href="/organizer/bazaars/new"
            className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2.5 rounded-lg text-sm shadow-sm transition-colors hover:bg-[#a97bd1]"
          >
            Create your first bazaar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {bazaars.map((bazaar) => (
            <OrganizerBazaarCard key={bazaar.id} bazaar={bazaar} />
          ))}
        </div>
      )}
    </main>
  );
}
