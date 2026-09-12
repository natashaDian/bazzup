import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { getApplicationDetail } from "@/lib/applications";
import { ApplicationDetailClient } from "@/components/application-detail-client";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOrganizer();
  const application = await getApplicationDetail(id, user.id);

  if (!application) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <ApplicationDetailClient application={application} />
    </main>
  );
}
