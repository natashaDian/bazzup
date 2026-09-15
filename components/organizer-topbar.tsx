import { requireOrganizer } from "@/lib/auth";
import { OrganizerHeaderActions } from "@/components/organizer-header-actions";
import { SidebarCollapseToggle } from "@/components/sidebar-collapse-toggle";

/**
 * Real top header bar for every organizer page - sits above the page's own
 * content (outside `<main>`), spanning the full width of the content
 * column next to the sidebar. Not part of any page's scrollable container.
 */
export async function OrganizerTopbar() {
  const user = await requireOrganizer();

  return (
    <header className="sticky top-0 z-20 flex items-center border-b border-[#E5E0EB] bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <SidebarCollapseToggle />
      <div className="ml-auto">
        <OrganizerHeaderActions user={user} />
      </div>
    </header>
  );
}
