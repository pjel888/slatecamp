import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo/config";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";

  if (isDemoMode()) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      
      // Transfer cookies from the cookie store to the redirect response
      const cookieStore = await cookies();
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, {
          path: "/",
          ...cookie, // Include other options like httpOnly, secure, etc.
        });
      });

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
