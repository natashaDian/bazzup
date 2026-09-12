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
    return { error: "Nama, email, dan password wajib diisi." };
  }
  if (!role) {
    return { error: "Pilih peran sebagai Organizer atau Vendor." };
  }
  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Registrasi gagal, coba lagi." };
  }

  // Supabase tidak mengembalikan error untuk email yang sudah terdaftar
  // (mencegah user enumeration) - identities kosong menandakan akun itu
  // sebenarnya sudah ada.
  if (data.user.identities && data.user.identities.length === 0) {
    return {
      error: "Email ini sudah terdaftar. Silakan login atau gunakan email lain.",
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
    return { error: "Gagal menyimpan data pengguna. Coba lagi." };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    success: "Registrasi berhasil! Cek email kamu untuk verifikasi akun sebelum login.",
  };
}
