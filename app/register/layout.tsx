import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Covers /register, /register/vendor and /register/organizer - a signed-in
  // user has nothing to do on any of those, so send them to their role's
  // home instead of letting them sign up again.
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "VENDOR" ? "/vendor" : "/organizer");
  }

  return children;
}
