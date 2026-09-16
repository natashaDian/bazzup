import type { Metadata } from "next";

import { RegisterForm } from "../register-form";

export const metadata: Metadata = {
  title: "Create Vendor Account - BazzUp",
};

export default function VendorRegisterPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#B98CDE] bg-white md:flex-row">

        {/* Left Side */}
        <section className="flex w-full flex-col justify-center border-b border-[#B98CDE] bg-[#FAF8FF] px-8 py-12 md:w-[42%] md:border-b-0 md:border-r md:px-12 lg:px-16">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#3B1F4A]">
              Good Products
              <br />
              Deserve
              <br />
              Bigger Stages
            </h1>

            <p className="mt-6 max-w-sm text-base font-normal leading-7 text-[#6B7280]">
              Join as a vendor and get access to various bazaar events across
              your city.
            </p>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex w-full flex-col bg-white px-8 py-12 md:w-[58%] md:px-14 lg:px-16">

          {/* <div className="flex justify-end">
            <p className="text-sm font-normal text-[#6B7280]">
              Already have an account?{" "}
              <a
                href="/login"
                className="
                  text-[#7A5CA8]
                  transition-colors
                  duration-200
                  hover:text-[#3B1F4A]
                  hover:underline
                "
              >
                Log in
              </a>
            </p>
          </div> */}

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">

            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#3B1F4A]">
                Create Vendor Account
              </h2>

              <p className="mt-2 text-base font-normal text-[#6B7280]">
                Tell us about your business
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#3B1F4A]">
                Basic Information
              </h3>
            </div>

            <RegisterForm role="VENDOR" />

          </div>
        </section>
      </div>
    </main>
  );
}