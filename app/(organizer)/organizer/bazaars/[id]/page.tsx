import { notFound } from "next/navigation";
import { getBazaarWithAreas } from "@/lib/areas";
import { formatDateDisplay } from "@/lib/date";
import { BazaarDetailClient } from "./bazaar-detail-client";

export default async function BazaarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bazaar = await getBazaarWithAreas(id);

  if (!bazaar) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <BazaarDetailClient bazaar={bazaar} />
    </main>
  );
}
