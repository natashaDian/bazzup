import "server-only";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const supabaseUserId = data?.claims?.sub;

  if (error || !supabaseUserId) {
    return null;
  }

  return prisma.user.findUnique({ where: { supabaseUserId } });
}

async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  if (user.role !== role) {
    redirect("/");
  }

  return user;
}

export function requireOrganizer(): Promise<User> {
  return requireRole("ORGANIZER");
}

export function requireVendor(): Promise<User> {
  return requireRole("VENDOR");
}
