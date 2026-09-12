import type { Metadata } from "next";
import { requireVendor } from "@/lib/auth";
import { ProfileView } from "./profile-view";
import { getVendorProducts, getVendorPortfolios } from "./actions";
import { ProductSection } from "./product-section";
import { PortfolioSection } from "./portfolio-section";

export const metadata: Metadata = {
  title: "Profil Usaha - BazzUp",
};

export default async function VendorProfilePage() {
  const user = await requireVendor();
  const products = await getVendorProducts();
  const portfolios = await getVendorPortfolios();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <ProfileView user={user} />
      <div className="mt-6">
        <ProductSection products={products} />
        <PortfolioSection portfolios={portfolios} />
      </div>
    </main>
  );
}
