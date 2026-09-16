import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

import { RegisterForm } from "../register-form";
import { LoginBackground } from "../../../components/login-background";
import bazzupLogo from "../../../components/assets/bazzup logo.png";

export const metadata: Metadata = {
  title: "Create Organizer Account - BazzUp",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function OrganizerRegisterPage() {
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
              Create Spaces
              <br />
              for Greater
              <br />
              Possibilities
            </h1>

            {/* Description */}
            <p className="mt-5 hidden max-w-sm text-base leading-7 text-[#6B7280] md:block">
              Join as an organizer and bring amazing bazaar events to life
              with the right vendors.
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="flex w-full items-start overflow-y-auto px-8 py-8 md:w-[58%] md:px-10 lg:px-12">
          <div className="mx-auto my-auto flex w-full max-w-md flex-col">

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-3xl font-bold tracking-tight text-[#3B1F4A]">
                Create Organizer Account
              </h2>

              <p className="mt-2 text-base text-[#6B7280]">
                Tell us about yourself and your organization
              </p>
            </div>

            {/* Form Section */}
            <div>
              <h3 className="mb-5 text-lg font-semibold text-[#3B1F4A]">
                Basic Information
              </h3>

              <RegisterForm role="ORGANIZER" />
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}