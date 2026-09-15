"use client";

import { MenuIcon } from "lucide-react";

import { useSidebarCollapsed } from "@/components/organizer-sidebar-context";

/**
 * Desktop-only sidebar minimize/maximize toggle, shown in the topbar. Uses
 * the same Menu icon as the mobile hamburger (rendered by OrganizerNav) for
 * visual consistency, but stays the same icon in both states (unlike the
 * mobile toggle's Menu/X swap) since this always minimizes/maximizes a
 * persistent sidebar rather than opening/closing an overlay.
 */
export function SidebarCollapseToggle() {
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-[#F3EAFB] hover:text-[#3B1F4A] lg:flex"
    >
      <MenuIcon className="size-5" />
    </button>
  );
}
