import type { ReactNode } from "react";
import { requireOrganizer } from "@/lib/auth";
import { OrganizerNav } from "@/components/organizer-nav";
import { OrganizerTopbar } from "@/components/organizer-topbar";
import { SidebarProvider } from "@/components/organizer-sidebar-context";

export default async function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Enforces the organizer-only route guard; the user record itself is
  // fetched again by OrganizerTopbar and by each page (cached per request
  // via React's `cache()` in lib/auth.ts, so this costs nothing extra).
  await requireOrganizer();

  return (
    <SidebarProvider>
      <OrganizerNav />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Real header bar, outside every page's own <main> - the fixed
            mobile menu toggle rendered by OrganizerNav (visible below the
            lg breakpoint) sits over its empty left side. */}
        <OrganizerTopbar />
        {children}
      </div>
    </SidebarProvider>
  );
}
