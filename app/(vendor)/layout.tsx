import type { ReactNode } from "react";
import { requireVendor } from "@/lib/auth";
import { VendorNav } from "@/components/vendor-nav";
import { VendorChatWidget } from "@/components/vendor-chat-widget";
import { Footer } from "@/components/footer";

export default async function VendorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireVendor();

  return (
    <div className="flex min-h-screen flex-col">
      <VendorNav user={user} />
      {children}
      <Footer role={user.role} />
      <VendorChatWidget />
    </div>
  );
}
