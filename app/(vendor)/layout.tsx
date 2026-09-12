import type { ReactNode } from "react";
import { requireVendor } from "@/lib/auth";
import { VendorNav } from "@/components/vendor-nav";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const user = await requireVendor();

  return (
    <div className="flex min-h-screen flex-col">
      <VendorNav user={user} />
      {children}
    </div>
  );
}
