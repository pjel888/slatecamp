import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo/config";
import { trackServerEvent } from "@/lib/analytics-server";
import { ROUTES } from "@/lib/routes";

const normalizeNextPath = (next: string | null): string => {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return ROUTES.dashboard.root;
  }

  const [pathWithMaybeHash, query = ""] = next.split("?", 2);
  const [pathname, hash = ""] = pathWithMaybeHash.split("#", 2);
  const normalizedPath = pathname;
  const normalizedQuery = query ? `?${query}` : "";
  const normalizedHash = hash ? `#${hash}` : "";

  return `${normalizedPath}${normalizedQuery}${normalizedHash}`;
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = normalizeNextPath(searchParams.get("next"));

  if (isDemoMode()) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Capture UTM attribution on signup
      const signup_source = searchParams.get('source') || searchParams.get('utm_source') || 'direct'
      const utm_campaign = searchParams.get('utm_campaign') || null
      const utm_medium = searchParams.get('utm_medium') || null
      const utm_content = searchParams.get('utm_content') || null

      // Store attribution on user_global_stats (silent, non-blocking)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        supabase.from('user_global_stats').update({
          signup_source, utm_campaign, utm_medium, utm_content,
          first_touch_source: signup_source,
          first_touch_campaign: utm_campaign,
          last_touch_source: signup_source,
          last_touch_campaign: utm_campaign,
          acquisition_touchpoints: JSON.stringify([{
            source: signup_source, campaign: utm_campaign,
            medium: utm_medium, at: new Date().toISOString(),
          }]),
        }).eq('user_id', user.id).then(() => {})
        trackServerEvent('signup_completed', { source: signup_source, utm_campaign, utm_medium })
      }

      const { isAdmin } = await import("@/lib/admin/roles");
      const isUserAdmin = await isAdmin();
      
      let redirectPath = next;
      
      // Only redirect to admin dashboard if specifically requested
      if (isUserAdmin && next.startsWith('/admin')) {
        redirectPath = next;
      } else if (!isUserAdmin && redirectPath.startsWith('/admin')) {
        redirectPath = ROUTES.dashboard.root;
      }
      
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.auth.login}?error=auth_callback_failed`);
}
