import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Memoized per request - layouts and pages can both call this (e.g. a
// vendor layout for the nav plus a page for its own data) without
// re-hitting Supabase/Prisma for the same request.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const supabaseUserId = data?.claims?.sub;

  if (error || !supabaseUserId) {
    return null;
  }

  return prisma.user.findUnique({ where: { supabaseUserId } });
});

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
