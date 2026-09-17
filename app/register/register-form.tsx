"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

type RegisterFormProps = {
  role: "VENDOR" | "ORGANIZER";
};

export function RegisterForm({ role }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  const isVendor = role === "VENDOR";

  return (
    <form action={formAction} className="flex flex-col gap-7">

      {/* Role - Hidden */}
      <input type="hidden" name="role" value={role} />

      {/* Full Name */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="name"
          className="text-sm font-normal text-[#3B1F4A]"
        >
          Nama Lengkap
        </Label>

        <Input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Nama lengkap"
          className="
            h-12
            rounded-lg
            border-[#B98CDE]
            bg-[#FAF8FF]
            px-4
            text-base
            font-normal
            text-[#3B1F4A]
            shadow-none
            placeholder:text-[#6B7280]
            focus-visible:border-[#7A5CA8]
            focus-visible:ring-1
            focus-visible:ring-[#7A5CA8]
          "
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-sm font-normal text-[#3B1F4A]"
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
          className="
            h-12
            rounded-lg
            border-[#B98CDE]
            bg-[#FAF8FF]
            px-4
            text-base
            font-normal
            text-[#3B1F4A]
            shadow-none
            placeholder:text-[#6B7280]
            focus-visible:border-[#7A5CA8]
            focus-visible:ring-1
            focus-visible:ring-[#7A5CA8]
          "
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-sm font-normal text-[#3B1F4A]"
        >
          Kata Sandi
        </Label>

        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Buat kata sandi"
          className="
            h-12
            rounded-lg
            border-[#B98CDE]
            bg-[#FAF8FF]
            px-4
            text-base
            font-normal
            text-[#3B1F4A]
            shadow-none
            placeholder:text-[#6B7280]
            focus-visible:border-[#7A5CA8]
            focus-visible:ring-1
            focus-visible:ring-[#7A5CA8]
          "
        />
      </div>

      {/* Error */}
      {state.error && (
        <p className="text-sm font-normal text-red-500">
          {state.error}
        </p>
      )}

      {/* Success */}
      {state.success && (
        <p className="text-sm font-normal text-[#7A5CA8]">
          {state.success}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="
          h-12
          w-full
          rounded-lg
          bg-[#7A5CA8]
          text-sm
          font-normal
          text-white
          shadow-none
          hover:bg-[#B98CDE]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isPending ? "Memproses..." : "Daftar"}
      </Button>

      {/* Login */}
      <p className="text-center text-sm font-normal text-[#6B7280]">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-normal text-[#7A5CA8] hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}