import type { Metadata } from "next";
import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { getUpcomingBazaars} from "@/lib/bazaars";
import { UpcomingBazaarCard } from "@/components/upcoming-bazaar-card";

export const metadata: Metadata = {
  title: "Bazaar Mendatang - BazzUp",
};


export default async function VendorHomePage() {
const user = await requireVendor();

const [upcoming] = await Promise.all([
    getUpcomingBazaars()
  ]);
return(
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-10 md:px-10 md:py-12 lg:px-16 bg-white">
        <section className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl">Bazaar Mendatang</h1>
            <p className="text-base text-muted-foreground">
            Temukan acara yang tepat, terhubung dengan komunitas, dan kembangkan bisnismu ke lebih banyak orang.
            </p>
        </section>

        <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {upcoming.map((bazaar) => (
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