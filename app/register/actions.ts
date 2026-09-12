"use server";

import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = {
  error?: string;
  success?: string;
};

function parseRole(value: FormDataEntryValue | null): Role | null {
  return value === "ORGANIZER" || value === "VENDOR" ? value : null;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (!role) {
    return { error: "Choose a role: Organizer or Vendor." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Registration failed, please try again." };
  }

  // Supabase does not return an error for an email that's already
  // registered (to prevent user enumeration) - an empty identities array
  // means the account actually already exists.
  if (data.user.identities && data.user.identities.length === 0) {
    return {
      error: "This email is already registered. Please sign in or use a different email.",
    };
  }

  try {
    await prisma.user.create({
      data: {
        supabaseUserId: data.user.id,
        email,
        name,
        role,
      },
    });
  } catch {
    return { error: "Failed to save user data. Please try again." };
  }

  if (data.session) {
    redirect(role === "VENDOR" ? "/vendor" : "/");
  }

  return {
    success: "Registration successful! Check your email to verify your account before signing in.",
  };
}
