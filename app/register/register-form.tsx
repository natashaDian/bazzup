"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Daftar sebagai</Label>
        <RadioGroup name="role" defaultValue="VENDOR" className="grid-cols-2">
          <Label className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 has-data-checked:border-primary">
            <RadioGroupItem value="VENDOR" />
            Vendor
          </Label>
          <Label className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 has-data-checked:border-primary">
            <RadioGroupItem value="ORGANIZER" />
            Organizer
          </Label>
        </RadioGroup>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-primary">{state.success}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Memproses..." : "Daftar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
