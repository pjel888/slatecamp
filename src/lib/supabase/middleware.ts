import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_PATHS } from "@/lib/constants/routes";
import { isDemoMode } from "@/lib/demo/config";
import { canReviewContent } from "@/lib/admin/roles";

export const updateSession = async (request: NextRequest) => {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 1. STATIC & API BYPASS
  if (pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/auth/callback')) {
    return response;
  }

  // 1.5 LOCAL DEV ABSOLUTE BYPASS
  // If we are on localhost and have a force user ID, we allow everything.
  const isLocal = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';
  const isDev = process.env.NODE_ENV === 'development' && isLocal;
  const hasForceUser = !!process.env.DEV_FORCE_USER_ID;

  if (isDev && hasForceUser) {
    // If user tries to go to login while forced, send them to dashboard
    if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER || pathname === '/admin/login') {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
    return response;
  }

  // 2. PUBLIC PATHS
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path) || pathname === '/admin/login';

  // 3. DEMO MODE
  if (isDemoMode()) {
    if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER || pathname === '/admin/login') {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
    return response;
  }

  // 4. SUPABASE INITIALIZATION (Normal flow)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const redirectWithCookies = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  // 5. PROTECTION LOGIC
  if (!user) {
    if (isPublicPath) return response;
    const target = pathname.startsWith('/admin/') ? '/admin/login' : ROUTES.LOGIN;
    const url = new URL(target, request.url);
    if (pathname !== target) url.searchParams.set('next', pathname);
    return redirectWithCookies(url.pathname + url.search);
  }

  // Logged-in user on public login pages
  if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER) {
    return redirectWithCookies(ROUTES.DASHBOARD);
  }

  return response;
}
