import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { isDemoMode } from "@/lib/demo/config";
import { resolveRoleFromInputs } from "@/lib/entitlements/resolve-role";
import {
  canAccessAdminCmsForRole,
  canAccessCeoPortalForRole,
  canAccessDeveloperPortalForRole,
} from "@/lib/entitlements/policy";
import { logEntitlementAuditEvent } from "@/lib/entitlements/audit";

export const updateSession = async (request: NextRequest) => {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 1. STATIC & API BYPASS
  if (pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith(ROUTES.auth.callback)) {
    return response;
  }

  // 1.5 LOCAL DEV ABSOLUTE BYPASS
  // If we are on localhost and have a force user ID, we allow everything.
  const isLocal = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';
  const isDev = process.env.NODE_ENV === 'development' && isLocal;
  const hasForceUser = !!process.env.DEV_FORCE_USER_ID;

  if (isDev && hasForceUser) {
    // If user tries to go to login while forced, send them to dashboard
    if (pathname === ROUTES.auth.login || pathname === ROUTES.auth.register || pathname === ROUTES.admin.login) {
      return NextResponse.redirect(new URL(ROUTES.dashboard.root, request.url));
    }
    return response;
  }

  // 2. PUBLIC PATHS
  const isPublicPath = PUBLIC_ROUTES.some((path) => pathname === path) || pathname === ROUTES.admin.login;

  // 3. DEMO MODE
  if (isDemoMode()) {
    if (pathname === ROUTES.auth.login || pathname === ROUTES.auth.register || pathname === ROUTES.admin.login) {
      return NextResponse.redirect(new URL(ROUTES.dashboard.root, request.url));
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
    const target = pathname.startsWith('/admin/') ? ROUTES.admin.login : ROUTES.auth.login;
    const url = new URL(target, request.url);
    if (pathname !== target) url.searchParams.set('next', pathname);
    return redirectWithCookies(url.pathname + url.search);
  }

  // Logged-in user on public login pages
  if (pathname === ROUTES.auth.login || pathname === ROUTES.auth.register) {
    return redirectWithCookies(ROUTES.dashboard.root);
  }

  // 6. PRIVILEGED ROUTE GATING (defense-in-depth — app layouts also check)
  if (
    pathname.startsWith('/admin/') && pathname !== ROUTES.admin.login ||
    pathname.startsWith('/developer') ||
    pathname.startsWith('/ceo')
  ) {
    const [profileResult, roleRowsResult] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    const roleResolution = resolveRoleFromInputs({
      email: user.email,
      appMetadataRole: user.app_metadata?.role,
      userMetadataRole: user.user_metadata?.role,
      profileRole: profileResult.data?.role,
      userRoleRows: roleRowsResult.data ?? [],
      forcedUserIdActive: isDev && hasForceUser,
    })

    const allowDeveloperBypass = process.env.ALLOW_DEV_PORTAL_BYPASS === 'true'

    const canAccess =
      pathname.startsWith('/admin/')
        ? canAccessAdminCmsForRole(roleResolution.normalizedRole)
        : pathname.startsWith('/developer')
          ? canAccessDeveloperPortalForRole(
              roleResolution.normalizedRole,
              allowDeveloperBypass,
            )
          : canAccessCeoPortalForRole(roleResolution.normalizedRole)

    logEntitlementAuditEvent({
      eventName: canAccess ? 'tooling.access' : 'entitlement.denied',
      timestamp: new Date().toISOString(),
      traceId: globalThis.crypto.randomUUID(),
      userId: user.id,
      routeOrAction: `middleware:${pathname}`,
      normalizedRole: roleResolution.normalizedRole,
      roleSource: roleResolution.resolvedFrom,
      rawTier: 'free',
      subscriptionStatus: 'unknown',
      effectiveTier: 'free',
      overrideState: {
        simulatedTier: null,
        legacySpoofedTier: null,
        forcedTier: null,
        forcedUserIdActive: isDev && hasForceUser,
        localDevBypassActive: false,
        allowDevPortalBypass: allowDeveloperBypass,
        featureOverrides: {},
        sourceTrace: roleResolution.precedenceTrace,
      },
      decision: canAccess,
      denialReason: canAccess ? undefined : 'tooling_policy_denied',
      decisionSource: 'middleware',
      trace: roleResolution.precedenceTrace,
    })

    if (!canAccess) {
      return redirectWithCookies(ROUTES.dashboard.root)
    }
  }

  return response;
}
