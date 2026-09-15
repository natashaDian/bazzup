import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "VENDOR") {
    redirect("/vendor");
  }

  if (user.role === "ORGANIZER") {
    redirect("/organizer");
  }

  redirect("/login");
}
