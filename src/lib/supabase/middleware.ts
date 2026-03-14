import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_PATHS } from "@/lib/constants/routes";
import { isDemoMode, DEMO_USER } from "@/lib/demo/config";

/**
 * Refreshes the Supabase auth session and protects routes.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Handle Demo Mode
  if (isDemoMode()) {
    const isLoginPage = pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
    if (isLoginPage) {
      console.log("[Middleware] Demo Mode: Redirecting login/register to dashboard");
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.DASHBOARD;
      return NextResponse.redirect(url);
    }
    return response;
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path);
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isApiRoute = pathname.startsWith("/api");

  console.log("[Middleware] Path:", pathname, "isPublic:", isPublicPath, "isAuthCallback:", isAuthCallback);

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

  const { data: { session }, error } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (error) {
    console.error("[Middleware] getSession error:", error.message);
  }

  console.log("[Middleware] User ID:", user?.id ?? "none");

  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) =>
      res.cookies.set(c.name, c.value, { path: c.path ?? "/" })
    );
    return res;
  };

  if (!user && !isPublicPath && !isAuthCallback && !isApiRoute) {
    console.log("[Middleware] No user on protected path, redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return redirectWithCookies(url);
  }

  if (user && (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER)) {
    console.log("[Middleware] User exists on login/register, redirecting to dashboard");
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.DASHBOARD;
    return redirectWithCookies(url);
  }

  return response;
}
