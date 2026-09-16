"use server";

import { cookies } from "next/headers";

export async function clearJustLoggedInFlag() {
  const cookieStore = await cookies();
  cookieStore.delete("just_logged_in");
}
