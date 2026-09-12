import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Dengan Fluid compute, jangan simpan client ini di variabel global -
  // selalu buat baru per request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Jangan hapus ini: memanggil getClaims() di sini yang men-trigger
  // Supabase menulis token baru lewat setAll() di atas kalau sesi sudah
  // kedaluwarsa. Tanpa ini, user bisa random ke-logout.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
