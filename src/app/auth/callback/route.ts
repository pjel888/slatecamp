import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (isDemoMode()) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { isAdmin } = await import("@/lib/admin/roles");
      const isUserAdmin = await isAdmin();
      
      let redirectPath = next;
      
      // Only redirect to admin dashboard if specifically requested
      if (isUserAdmin && next.startsWith('/admin')) {
        redirectPath = next;
      } else if (!isUserAdmin && redirectPath.startsWith('/admin')) {
        redirectPath = "/dashboard";
      }
      
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
