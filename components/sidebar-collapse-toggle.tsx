"use client";

import { MenuIcon } from "lucide-react";

import { useSidebarCollapsed } from "@/components/organizer-sidebar-context";

export function SidebarCollapseToggle() {
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
      aria-expanded={!collapsed}
      className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-[#F3EAFB] hover:text-[#3B1F4A] lg:flex"
    >
      <MenuIcon className="size-5" />
    </button>
  );
}
