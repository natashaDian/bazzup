import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Already-authenticated users have no reason to see the login form -
  // bounce them straight to their role's home instead.
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "VENDOR" ? "/vendor" : "/organizer");
  }

  return children;
}
