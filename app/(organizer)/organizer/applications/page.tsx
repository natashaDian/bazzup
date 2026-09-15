import type { Metadata } from "next";
import { requireOrganizer } from "@/lib/auth";
import {
  getApplicationsBoard,
  getOrganizerBazaarOptionsForFilter,
} from "@/lib/applications";
import { ApplicationsBoardClient } from "@/components/applications-board-client";

export const metadata: Metadata = {
  title: "Incoming Applications - BazzUp",
};

export default async function IncomingApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ bazaarId?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const user = await requireOrganizer();

  const [board, bazaarOptions] = await Promise.all([
    getApplicationsBoard(user.id, params),
    getOrganizerBazaarOptionsForFilter(user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10">
      <ApplicationsBoardClient
        board={board}
        bazaarOptions={bazaarOptions}
        selectedBazaarId={params.bazaarId ?? ""}
        searchQuery={params.q ?? ""}
        sort={params.sort ?? "newest"}
      />
    </main>
  );
}
