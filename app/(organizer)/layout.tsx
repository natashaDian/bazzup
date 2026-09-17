import type { ReactNode } from "react";
import { requireOrganizer } from "@/lib/auth";
import { OrganizerNav } from "@/components/organizer-nav";
import { OrganizerTopbar } from "@/components/organizer-topbar";
import { SidebarProvider } from "@/components/organizer-sidebar-context";
import { Footer } from "@/components/footer";

export default async function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireOrganizer();

  return (
    <SidebarProvider>
      <OrganizerNav />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Real header bar, outside every page's own <main> - the fixed
            mobile menu toggle rendered by OrganizerNav (visible below the
            lg breakpoint) sits over its empty left side. */}
        <OrganizerTopbar />
        {children}
        <Footer role={user.role} />
      </div>
    </SidebarProvider>
  );
}
