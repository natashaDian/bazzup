import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "./login-form";
import { Inter } from "next/font/google";
import { LoginBackground } from "../../components/login-background";
import bazzupLogo from "../../components/assets/bazzup logo.png";

export const metadata: Metadata = {
  title: "Sign in - BazzUp",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function LoginPage() {
  return (
    <main
      className={`${inter.className} relative h-screen overflow-hidden bg-white px-6 py-6 md:px-10 md:py-8`}
    >
      <LoginBackground />

      <div className="login-container relative mx-auto flex h-full max-h-[900px] max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E8E1EF] bg-white/95 md:flex-row">

        {/* Left Section */}
        <section className="login-panel-left flex w-full items-center justify-center border-b border-[#E8E1EF] px-8 py-8 md:w-[42%] md:border-b-0 md:border-r md:px-10 lg:px-12">
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
            <h1 className="login-heading text-4xl font-bold leading-tight tracking-tight text-[#3B1F4A]">
              From Local Events
              <br />
              to Bigger Opportunities
            </h1>

            {/* Description */}
            <p className="login-description mt-5 max-w-sm text-base leading-7 text-[#6B7280]">
              BazzUp connects organizers and vendors in one platform —
              making every bazaar easier, faster, and more impactful.
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="login-panel-right flex w-full items-center px-8 py-8 md:w-[58%] md:px-10 lg:px-12">
          <div className="mx-auto flex w-full max-w-sm flex-col">

            {/* Heading */}
            <div className="login-form-heading mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-[#3B1F4A]">
                Welcome Back
              </h2>

              <p className="mt-2 text-base text-[#6B7280]">
                Log in to continue to BazzUp
              </p>
            </div>

            {/* Login Form */}
            <div className="login-form-wrapper">
              <LoginForm />
            </div>

            {/* Terms */}
            <p className="login-terms mt-8 text-center text-xs leading-5 text-[#6B7280]">
              By logging in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
} 