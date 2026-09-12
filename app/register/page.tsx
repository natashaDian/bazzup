import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign up - BazzUp",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#B98CDE] bg-white">

        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 md:px-12 lg:px-16">
          <div>
            <h1 className="text-2xl font-bold text-[#3B1F4A]">
              BazzUp
            </h1>
          </div>

          <p className="text-sm font-normal text-[#6B7280]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="
                font-normal
                text-[#7A5CA8]
                transition-colors
                duration-200
                hover:text-[#3B1F4A]
                hover:underline
              "
            >
              Log in
            </Link>
          </p>
        </header>

        {/* Role Selection */}
        <section className="flex flex-1 flex-col items-center justify-center px-8 py-12 md:px-14 lg:px-16">
          <div className="w-full max-w-3xl text-center">

            <h2 className="text-2xl font-bold text-[#3B1F4A]">
              Join BazzUp
            </h2>

            <p className="mt-2 text-base font-normal text-[#6B7280]">
              Create your account to start your journey
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">

              {/* Vendor Card */}
              <Link
                href="/register/vendor"
                className="
                  group
                  flex
                  min-h-[280px]
                  flex-col
                  justify-between
                  rounded-xl
                  border
                  border-[#B98CDE]
                  bg-[#FAF8FF]
                  p-8
                  text-left

                  transition-all
                  duration-200
                  ease-out

                  hover:-translate-y-1
                  hover:border-[#7A5CA8]
                  hover:bg-white
                  hover:shadow-[0_8px_24px_rgba(122,92,168,0.12)]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#7A5CA8]
                  focus-visible:ring-offset-2
                "
              >
                <div>
                  <h3 className="
                    text-xl
                    font-semibold
                    text-[#3B1F4A]
                    transition-colors
                    duration-200
                    group-hover:text-[#7A5CA8]
                  ">
                    I&apos;m a Vendor
                  </h3>

                  <p className="mt-4 text-base font-normal leading-7 text-[#6B7280]">
                    Find and join exciting bazaar events, grow your business,
                    and reach more customers.
                  </p>
                </div>

                <div className="mt-8">
                  <div
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#7A5CA8]
                      text-sm
                      font-normal
                      text-white

                      transition-all
                      duration-200
                      ease-out

                      group-hover:-translate-y-0.5
                      group-hover:bg-[#3B1F4A]
                    "
                  >
                    Get Started
                  </div>
                </div>
              </Link>

              {/* Organizer Card */}
              <Link
                href="/register/organizer"
                className="
                  group
                  flex
                  min-h-[280px]
                  flex-col
                  justify-between
                  rounded-xl
                  border
                  border-[#B98CDE]
                  bg-[#FAF8FF]
                  p-8
                  text-left

                  transition-all
                  duration-200
                  ease-out

                  hover:-translate-y-1
                  hover:border-[#7A5CA8]
                  hover:bg-white
                  hover:shadow-[0_8px_24px_rgba(122,92,168,0.12)]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#7A5CA8]
                  focus-visible:ring-offset-2
                "
              >
                <div>
                  <h3 className="
                    text-xl
                    font-semibold
                    text-[#3B1F4A]
                    transition-colors
                    duration-200
                    group-hover:text-[#7A5CA8]
                  ">
                    I&apos;m an Organizer
                  </h3>

                  <p className="mt-4 text-base font-normal leading-7 text-[#6B7280]">
                    Create and manage your bazaar events, find the right
                    vendors, and build amazing communities.
                  </p>
                </div>

                <div className="mt-8">
                  <div
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#7A5CA8]
                      text-sm
                      font-normal
                      text-white

                      transition-all
                      duration-200
                      ease-out

                      group-hover:-translate-y-0.5
                      group-hover:bg-[#3B1F4A]
                    "
                  >
                    Get Started
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}