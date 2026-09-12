"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-[#3B1F4A]"
        >
          Email
        </Label>

        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="transition-all duration-200 focus-visible:border-[#7A5CA8] focus-visible:ring-1 focus-visible:ring-[#7A5CA8] focus-visible:shadow-[0_0_0_3px_rgba(185,140,222,0.12)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-[#3B1F4A]"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
            className="transition-all duration-200 focus-visible:border-[#7A5CA8] focus-visible:ring-1 focus-visible:ring-[#7A5CA8] focus-visible:shadow-[0_0_0_3px_rgba(185,140,222,0.12)]"

        />
      </div>

      {state.error && (
        <p className="text-sm text-red-500">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="
          h-12
          w-full
          rounded-lg
          bg-[#3B1F4A]
          text-sm
          font-medium
          text-white
          shadow-none
          hover:bg-[#4A285C]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isPending ? "Memproses..." : "Masuk"}
      </Button>

      <p className="text-center text-sm text-[#6B7280]">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="
            font-medium
            text-[#3B1F4A]
            underline-offset-4
            hover:underline
          "
        >
          Daftar
        </Link>
      </p>
    </form>
  );
}