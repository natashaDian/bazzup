import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Inter } from "next/font/google";
import { LoginBackground } from "../../components/login-background";
import bazzupLogo from "../../components/assets/bazzup logo.png";

export const metadata: Metadata = {
  title: "Sign up - BazzUp",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RegisterPage() {
  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-white px-6 py-6 md:px-10 md:py-8`}
    >
      <LoginBackground />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E8E1EF] bg-white/95 md:min-h-[calc(100vh-4rem)] md:max-h-[900px] md:flex-row">

        {/* Left Section */}
        <section className="flex w-full items-center justify-center px-8 py-8 md:w-[42%] md:border-r md:border-[#E8E1EF] md:px-10 lg:px-12">
          <div className="flex max-w-sm flex-col items-center text-center">

            {/* Logo */}
            <div className="mb-7">
              <Image
                src={bazzupLogo}
                alt="BazzUp"
                width={100}
                height={45}
                className="h-auto w-[90px]"
                priority
              />
            </div>

            {/* Heading */}
            <h1 className="hidden text-4xl font-bold leading-tight tracking-tight text-[#3B1F4A] md:block">
              From Local Events
              <br />
              to Bigger Opportunities
            </h1>

            {/* Description */}
            <p className="mt-5 hidden max-w-sm text-base leading-7 text-[#6B7280] md:block">
              BazzUp connects organizers and vendors in one platform —
              making every bazaar easier, faster, and more impactful.
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="flex w-full items-center px-8 py-8 md:w-[58%] md:px-10 lg:px-12">
          <div className="mx-auto flex w-full max-w-md flex-col">

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-3xl font-bold tracking-tight text-[#3B1F4A]">
                Join BazzUp
              </h2>

              <p className="mt-2 text-base text-[#6B7280]">
                Create your account to start your journey
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid gap-4 sm:grid-cols-2">

              {/* Vendor */}
              <Link
                href="/register/vendor"
                className="group flex min-h-[230px] flex-col justify-between rounded-xl border border-[#E8E1EF] bg-[#FAF8FF] p-6 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#B98CDE] hover:bg-white hover:shadow-[0_8px_24px_rgba(122,92,168,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5CA8] focus-visible:ring-offset-2"
              >
                <div>
                  <h3 className="text-xl font-semibold text-[#3B1F4A] transition-colors duration-200 group-hover:text-[#7A5CA8]">
                    I&apos;m a Vendor
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                    Find and join exciting bazaar events, grow your business,
                    and reach more customers.
                  </p>
                </div>

                <div className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-[#7A5CA8] text-sm font-medium text-white transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:bg-[#3B1F4A]">
                  Get Started
                </div>
              </Link>

              {/* Organizer */}
              <Link
                href="/register/organizer"
                className="group flex min-h-[230px] flex-col justify-between rounded-xl border border-[#E8E1EF] bg-[#FAF8FF] p-6 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#B98CDE] hover:bg-white hover:shadow-[0_8px_24px_rgba(122,92,168,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A5CA8] focus-visible:ring-offset-2"
              >
                <div>
                  <h3 className="text-xl font-semibold text-[#3B1F4A] transition-colors duration-200 group-hover:text-[#7A5CA8]">
                    I&apos;m an Organizer
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                    Create and manage your bazaar events, find the right
                    vendors, and build amazing communities.
                  </p>
                </div>

                <div className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-[#7A5CA8] text-sm font-medium text-white transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:bg-[#3B1F4A]">
                  Get Started
                </div>
              </Link>
            </div>

            {/* Login Link */}
            <p className="mt-7 text-center text-sm text-[#6B7280]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#7A5CA8] transition-colors duration-200 hover:text-[#3B1F4A] hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}