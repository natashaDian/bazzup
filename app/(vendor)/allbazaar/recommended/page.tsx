import type { Metadata } from "next";
import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { getRecommendedBazaars} from "@/lib/bazaars";
import { UpcomingBazaarCard } from "@/components/upcoming-bazaar-card";

export const metadata: Metadata = {
  title: "allrecommendation - BazzUp",
};


export default async function VendorHomePage() {
const user = await requireVendor();

const [recommended] = await Promise.all([
    getRecommendedBazaars(user.businessType, user.targetMarket)
  ]);
return(
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-6 py-10 md:px-10 md:py-12 lg:px-16 bg-white">
        <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl">Recommended Bazaars</h1>
            <p className="text-base text-muted-foreground">
            Find the right events, connect with communities, and bring your business to more people.
            </p>
        </section>

        <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8">
                {recommended.map((bazaar) => (
                <Link key={bazaar.id} href={`/bazaars/${bazaar.id}`}
                className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                    <UpcomingBazaarCard bazaar={bazaar} />
                </Link>
                ))}
            </div>
        </section>
    </main>
)
}