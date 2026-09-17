import type { Metadata } from "next";

import Image from "next/image";
import { Inter } from "next/font/google";

import { RegisterForm } from "../register-form";
import { LoginBackground } from "../../../components/login-background";
import bazzupLogo from "../../../components/assets/bazzup logo.png";

export const metadata: Metadata = {
  title: "Buat Akun Vendor - BazzUp",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function VendorRegisterPage() {
  return (
    <main
      className={`${inter.className} relative min-h-screen overflow-x-hidden bg-white px-6 py-6 md:px-10 md:py-8`}
    >
      <LoginBackground />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E8E1EF] bg-white/95 md:min-h-[calc(100vh-4rem)] md:max-h-[900px] md:flex-row">

        {/* Left Side */}
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
              Produk Berkualitas
              <br />
              Pantas Mendapat
              <br />
              Panggung Lebih Besar
            </h1>

            {/* Description */}
            <p className="mt-5 hidden max-w-sm text-base leading-7 text-[#6B7280] md:block">
              Bergabunglah sebagai vendor dan dapatkan akses ke berbagai acara
              bazaar di kotamu.
            </p>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex w-full items-start overflow-y-auto px-8 py-8 md:w-[58%] md:px-10 lg:px-12">

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

          <div className="mx-auto my-auto flex w-full max-w-md flex-col">

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-3xl font-bold tracking-tight text-[#3B1F4A]">
                Buat Akun Vendor
              </h2>

              <p className="mt-2 text-base text-[#6B7280]">
                Ceritakan tentang bisnismu
              </p>
            </div>

            {/* Form Section */}
            <div>
              <h3 className="mb-5 text-lg font-semibold text-[#3B1F4A]">
                Informasi Dasar
              </h3>

              <RegisterForm role="VENDOR" />
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}