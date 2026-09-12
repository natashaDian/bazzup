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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-medium">
          {greeting}, {user.businessName || user.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all your created bazaars in one place.
        </p>
      </div>

      <OrganizerBazaarsToolbar
        counts={counts}
        currentStatus={params.status ?? "ALL"}
        currentQuery={params.q ?? ""}
      />

      {bazaars.length === 0 ? (
        <div className="border border-dashed rounded-xl py-16 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground mb-4">
            You haven't created any bazaars yet.
          </p>
          <Link
            href="/organizer/bazaars/new"
            className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
          >
            Create your first bazaar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bazaars.map((bazaar) => (
            <OrganizerBazaarCard key={bazaar.id} bazaar={bazaar} />
          ))}
        </div>
      )}
    </main>
  );
}
