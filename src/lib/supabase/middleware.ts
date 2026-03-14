import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_PATHS } from "@/lib/constants/routes";

/**
 * Refreshes the Supabase auth session and protects routes.
 * Cookie handling follows @supabase/ssr: getAll from request (read-only),
 * setAll writes only to the response so refreshed tokens reach the browser.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => request.nextUrl.pathname === path
  );
  if (isPublicPath) {
    return response;
  }

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

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) =>
      res.cookies.set(c.name, c.value, { path: c.path ?? "/" })
    );
    return res;
  };

  if (!user && !isAuthCallback && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return redirectWithCookies(url);
  }

  if (user && (request.nextUrl.pathname === ROUTES.LOGIN || request.nextUrl.pathname === ROUTES.REGISTER)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.DASHBOARD;
    return redirectWithCookies(url);
  }

  return response;
}
