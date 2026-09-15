"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SidebarContextValue = {
  /** Only meaningful at the `lg` breakpoint and up - mobile always shows
   *  the sidebar expanded (as an off-canvas overlay) regardless of this. */
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "organizer-sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Restore the last preference (desktop-only feature, so this is a
  // harmless no-op flash on mobile / first paint).
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        setCollapsed(true);
      }
    } catch {
      // localStorage unavailable (privacy mode, etc.) - just keep expanded.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  );
}

export function useSidebarCollapsed() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebarCollapsed must be used within SidebarProvider");
  }
  return ctx;
}
