import type { ReactNode } from "react";
import { requireOrganizer } from "@/lib/auth";
import { OrganizerNav } from "@/components/organizer-nav";

export default async function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireOrganizer();

  return (
    <div className="flex min-h-screen flex-col">
      <OrganizerNav user={user} />
      {children}
    </div>
  );
}
