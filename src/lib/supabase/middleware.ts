import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_PATHS } from "@/lib/constants/routes";
import { isDemoMode } from "@/lib/demo/config";
import { canReviewContent } from "@/lib/admin/roles";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 1. STATIC & API BYPASS
  if (pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/auth/callback')) {
    return response;
  }

  // 2. PUBLIC PATHS
  // Note: /admin is the login page and must be public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path) || pathname === '/admin';
  
  // 3. DEMO MODE
  if (isDemoMode()) {
    if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER || pathname === '/admin') {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
    return response;
  }

  // 4. SUPABASE INITIALIZATION
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

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const redirectWithCookies = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  // 5. PROTECTION LOGIC
  if (!user) {
    if (isPublicPath) return response;
    
    // Redirect unauthenticated /admin/* to /admin, others to /login
    const target = pathname.startsWith('/admin/') ? '/admin' : ROUTES.LOGIN;
    const url = new URL(target, request.url);
    if (pathname !== target) url.searchParams.set('next', pathname);
    return redirectWithCookies(url.pathname + url.search);
  }

  // Logged-in user on public login pages
  if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER || pathname === '/admin') {
    const isAdmin = await canReviewContent();
    return redirectWithCookies(isAdmin ? '/admin/dashboard' : ROUTES.DASHBOARD);
  }

  // Admin path protection
  if (pathname.startsWith('/admin/')) {
    const isAdmin = await canReviewContent();
    if (!isAdmin) return redirectWithCookies(ROUTES.DASHBOARD);
  }

  return response;
}
