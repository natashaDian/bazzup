import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Login - BazzUp",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function LoginPage() {
  return (
    <main
      className={`${inter.className} min-h-screen bg-white px-6 py-8 md:px-10 md:py-10`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#E8E1EF] bg-white md:flex-row">
        
        <section className="flex w-full flex-col justify-center border-b border-[#E8E1EF] px-8 py-12 md:w-[42%] md:border-b-0 md:border-r md:px-12 lg:px-16">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#3B1F4A] lg:text-5xl">
              From Local Events
              <br />
              to Bigger Opportunities
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-[#6B7280]">
              BazzUp connects organizers and vendors in one platform —
              making every bazaar easier, faster, and more impactful.
            </p>
          </div>
        </section>

        <section className="flex w-full flex-col px-8 py-12 md:w-[58%] md:px-14 lg:px-16">
          
          {/* <div className="flex justify-end">
            <p className="text-sm text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="font-medium text-[#3B1F4A] hover:underline"
              >
                Register
              </a>
            </p>
          </div> */}

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-[#3B1F4A]">
                Welcome Back
              </h2>

              <p className="mt-2 text-base text-[#6B7280]">
                Log in to continue to BazzUp
              </p>
            </div>

            <LoginForm />

            <p className="mt-10 text-center text-xs leading-5 text-[#6B7280]">
              By logging in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}