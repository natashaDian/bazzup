import type { Metadata } from "next";

import Link from "next/link";
import { ArrowRight, SearchIcon } from "lucide-react";

import { requireVendor } from "@/lib/auth";

import {
  getBazaarCities,
  getRecommendedBazaars,
  getUpcomingBazaars,
} from "@/lib/bazaars";

import { BazaarSearchDialog } from "@/components/bazaar-search-dialog";
import { BazaarCard } from "@/components/bazaar-card";
import { DialogTrigger } from "@/components/ui/dialog";

export const metadata: Metadata = {
  title: "Home - BazzUp",
};

export default async function VendorHomePage() {
  const user = await requireVendor();

  const [cities, recommended, upcoming] = await Promise.all([
    getBazaarCities(),
    getRecommendedBazaars(user.businessType),
    getUpcomingBazaars(),
  ]);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 md:px-10 md:py-12 lg:px-16">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="home-hero relative isolate flex flex-col overflow-hidden pb-2">

          {/* Animated background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="home-gradient home-gradient-one" />
            <div className="home-gradient home-gradient-two" />
          </div>

          <div className="relative z-10 max-w-4xl">

            <h1 className="home-hero-title max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#3B1F4A] sm:text-5xl lg:text-[52px]">
              Discover Bazaars,
              <br />
              <span className="home-gradient-text">
                Grow Your Business
              </span>
            </h1>

            <p className="home-hero-description mt-5 max-w-3xl text-base leading-7 text-[#6B7280] sm:text-lg">
              Find the right events, connect with communities, and bring your
              business to more people.
            </p>

          </div>

          {/* Search */}
          <div className="relative z-10 mt-7">
            <BazaarSearchDialog
              cities={cities}
              trigger={
                <DialogTrigger
                  className="
                    home-search
                    group
                    flex w-full max-w-3xl items-center gap-3
                    rounded-2xl
                    border border-[#E8E1EF]
                    bg-white
                    px-4 py-3
                    text-left text-sm text-[#6B7280]
                    shadow-[0_5px_20px_rgba(122,92,168,0.07)]
                    transition-all duration-300 ease-out
                    hover:-translate-y-0.5
                    hover:border-[#C9A8E5]
                    hover:shadow-[0_10px_28px_rgba(122,92,168,0.11)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#7A5CA8]
                    focus-visible:ring-offset-2
                  "
                >
                  <SearchIcon
                    className="
                      size-5 shrink-0
                      transition-all duration-300
                      group-hover:scale-110
                      group-hover:text-[#7A5CA8]
                    "
                  />

                  <span className="flex-1">
                    Search event and location...
                  </span>

                  <span
                    className="
                      search-gradient-button
                      rounded-xl
                      px-5 py-2
                      text-xs font-medium text-white
                      shadow-[0_4px_12px_rgba(122,92,168,0.18)]
                      transition-all duration-300
                      group-hover:shadow-[0_6px_18px_rgba(122,92,168,0.25)]
                    "
                  >
                    Search
                  </span>
                </DialogTrigger>
              }
            />
          </div>

          {/* Existing Explore route, presented as a stronger visual CTA */}
          <Link
            href="/explore"
            className="
              home-explore-cta
              group
              relative z-10 mt-5 flex w-fit items-center gap-2
              text-sm font-medium text-[#7A5CA8]
              transition-colors duration-200
              hover:text-[#3B1F4A]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#7A5CA8]
              focus-visible:ring-offset-4
            "
          >
            Explore all bazaars
            <ArrowRight
              className="
                size-4
                transition-transform duration-300 ease-out
                group-hover:translate-x-1
              "
            />
          </Link>
        </section>

        {/* =====================================================
            RECOMMENDED
        ====================================================== */}
        <section className="home-section mt-16 flex flex-col">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#3B1F4A] sm:text-[26px]">
                Recommended for You
              </h2>

              <p className="mt-1.5 text-sm text-[#6B7280]">
                Bazaars that may be a good fit for your business.
              </p>
            </div>

            <Link
              href="/explore"
              className="
                group
                flex shrink-0 items-center gap-1.5
                rounded-md
                text-sm font-medium text-[#7A5CA8]
                transition-all duration-200
                hover:text-[#3B1F4A]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#7A5CA8]
                focus-visible:ring-offset-2
              "
            >
              See All
              <ArrowRight
                className="
                  size-4
                  transition-transform duration-300 ease-out
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          <div className="mt-7">
            {recommended.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E8E1EF] px-6 py-10 text-center">
                <p className="text-sm text-[#6B7280]">
                  No bazaars available yet.
                </p>
              </div>
            ) : (
              <div
                className="
                  grid grid-cols-1 gap-5
                  lg:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {recommended.map((bazaar) => (
                  <Link
                    key={bazaar.id}
                    href={`/bazaars/${bazaar.id}`}
                    className="
                      group
                      block rounded-2xl
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#7A5CA8]
                      focus-visible:ring-offset-2
                    "
                  >
                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border border-[#EEE8F5]
                        bg-white
                        shadow-[0_4px_18px_rgba(122,92,168,0.05)]
                        transition-all duration-300 ease-out
                        group-hover:-translate-y-1
                        group-hover:border-[#DCC8EE]
                        group-hover:shadow-[0_12px_30px_rgba(122,92,168,0.10)]
                      "
                    >
                      <BazaarCard bazaar={bazaar} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            EXPLORE BRIDGE
        ====================================================== */}
        <section className="mt-14">
          <Link
            href="/explore"
            className="
              group
              relative flex flex-col
              items-center justify-between
              gap-5 overflow-hidden
              rounded-2xl
              border border-[#E9DDF4]
              bg-[#FAF7FF]
              px-8 py-6
              transition-all duration-300 ease-out
              hover:-translate-y-0.5
              hover:border-[#D7BDEB]
              hover:bg-[#FCFAFF]
              hover:shadow-[0_10px_28px_rgba(122,92,168,0.08)]
              sm:flex-row
              sm:px-10
            "
          >
            {/* Subtle decorative glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute -right-16 -top-20
                size-44 rounded-full
                bg-[#B98CDE]/10
                blur-3xl
                transition-transform duration-700
                group-hover:scale-125
              "
            />

            <div className="relative z-10">
              <p className="text-base font-semibold text-[#3B1F4A]">
                Looking for more opportunities?
              </p>

              <p className="mt-1 text-sm text-[#6B7280]">
                Explore all available bazaars and find the right one for you.
              </p>
            </div>

            <span
              className="
                relative z-10
                flex shrink-0 items-center gap-2
                rounded-xl
                bg-[#7A5CA8]
                px-5 py-2.5
                text-sm font-medium text-white
                shadow-[0_4px_12px_rgba(122,92,168,0.14)]
                transition-all duration-300
                group-hover:-translate-y-0.5
                group-hover:bg-[#6B4F98]
                group-hover:shadow-[0_7px_18px_rgba(122,92,168,0.20)]
              "
            >
              Explore Bazaars

              <ArrowRight
                className="
                  size-4
                  transition-transform duration-300 ease-out
                  group-hover:translate-x-1
                "
              />
            </span>
          </Link>
        </section>

        {/* =====================================================
            UPCOMING
        ====================================================== */}
        <section className="home-section mt-16 flex flex-col pb-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#3B1F4A] sm:text-[26px]">
                Upcoming Bazaars
              </h2>

              <p className="mt-1.5 text-sm text-[#6B7280]">
                Events coming up soon.
              </p>
            </div>

            <Link
              href="/explore"
              className="
                group
                flex shrink-0 items-center gap-1.5
                rounded-md
                text-sm font-medium text-[#7A5CA8]
                transition-all duration-200
                hover:text-[#3B1F4A]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#7A5CA8]
                focus-visible:ring-offset-2
              "
            >
              See All

              <ArrowRight
                className="
                  size-4
                  transition-transform duration-300 ease-out
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          <div className="mt-7">
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E8E1EF] px-6 py-10 text-center">
                <p className="text-sm text-[#6B7280]">
                  No upcoming bazaars yet.
                </p>
              </div>
            ) : (
              <div
                className="
                  grid grid-cols-1 gap-5
                  lg:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {upcoming.map((bazaar) => (
                  <Link
                    key={bazaar.id}
                    href={`/bazaars/${bazaar.id}`}
                    className="
                      group
                      block rounded-2xl
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#7A5CA8]
                      focus-visible:ring-offset-2
                    "
                  >
                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border border-[#EEE8F5]
                        bg-white
                        shadow-[0_4px_18px_rgba(122,92,168,0.05)]
                        transition-all duration-300 ease-out
                        group-hover:-translate-y-1
                        group-hover:border-[#DCC8EE]
                        group-hover:shadow-[0_12px_30px_rgba(122,92,168,0.10)]
                      "
                    >
                      <BazaarCard bazaar={bazaar} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}