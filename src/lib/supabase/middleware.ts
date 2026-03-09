import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_PATHS } from "@/lib/constants/routes";

/**
 * Refreshes the Supabase auth session and protects routes.
 * Cookie handling follows @supabase/ssr: getAll from request (read-only),
 * setAll writes only to the response so refreshed tokens reach the browser.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => request.nextUrl.pathname === path
  );
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (!user && !isPublicPath && !isAuthCallback && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  if (user && (request.nextUrl.pathname === ROUTES.LOGIN || request.nextUrl.pathname === ROUTES.REGISTER)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.DASHBOARD;
    return NextResponse.redirect(url);
  }

  return response;
}
