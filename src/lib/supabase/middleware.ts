import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { isDemoMode } from "@/lib/demo/config";
import { resolveRoleFromInputs } from "@/lib/entitlements/resolve-role";
import {
  canAccessAdminCmsForRole,
  canAccessCeoPortalForRole,
  canAccessDeveloperPortalForRole,
  hasPermission,
} from "@/lib/entitlements/policy";
import type { AdminPermission } from "@/lib/entitlements/types";
import { logEntitlementAuditEvent } from "@/lib/entitlements/audit";
import { logEdgeError } from "@/lib/logging/edge";

const LEGACY_ROUTE_REDIRECTS: Record<string, string> = {
  [ROUTES.legacy.adminWiki]: ROUTES.admin.knowledge,
  [ROUTES.legacy.dashboardHeatmap]: ROUTES.dashboard.analytics,
  [ROUTES.legacy.dashboardSettingsBilling]: ROUTES.dashboard.settings,
  [ROUTES.legacy.dashboardSettingsDeveloper]: ROUTES.developer.root,
  [ROUTES.legacy.dashboardTrail]: ROUTES.dashboard.camptrails,
  [ROUTES.legacy.dashboardTrails]: ROUTES.dashboard.camptrails,
  [ROUTES.legacy.settings]: ROUTES.dashboard.settings,
}

const ADMIN_PATH_PERMISSIONS: Array<[RegExp, AdminPermission]> = [
  [/^\/admin\/audit(?:\/|$)/, 'admin.audit.view'],
  [/^\/admin\/activity(?:\/|$)/, 'admin.activity.view'],
  [/^\/admin\/pipeline(?:\/|$)/, 'admin.pipeline.manage'],
  [/^\/admin\/reviews(?:\/|$)/, 'admin.reviews.view'],
  [/^\/admin\/knowledge\/questions\/new(?:\/|$)/, 'admin.content.create'],
  [/^\/admin\/knowledge\/import(?:\/|$)/, 'admin.content.import'],
  [/^\/admin\/knowledge\/new(?:\/|$)/, 'admin.content.create'],
  [/^\/admin\/knowledge\/analytics(?:\/|$)/, 'admin.analytics.view'],
  [/^\/admin\/taxonomy(?:\/|$)/, 'admin.taxonomy.manage'],
  [/^\/admin\/assets(?:\/|$)/, 'admin.assets.manage'],
  [/^\/admin\/settings(?:\/|$)/, 'admin.users.manage'],
  [/^\/admin\/search(?:\/|$)/, 'admin.search.use'],
  [/^\/admin\/preview(?:\/|$)/, 'admin.preview.view'],
  [/^\/admin\/3d-models(?:\/|$)/, 'admin.access'],
  [/^\/admin(?:\/|$)/, 'admin.dashboard.view'],
]

const requiredAdminPermissionForPath = (pathname: string) =>
  ADMIN_PATH_PERMISSIONS.find(([pattern]) => pattern.test(pathname))?.[1] ?? null

const hasPrivilegedRouteAccess = ({
  pathname,
  isAdminPath,
  isDeveloperPath,
  isCeoPath,
  normalizedRole,
  allowDeveloperBypass,
}: {
  pathname: string
  isAdminPath: boolean
  isDeveloperPath: boolean
  isCeoPath: boolean
  normalizedRole: Parameters<typeof canAccessAdminCmsForRole>[0]
  allowDeveloperBypass: boolean
}) => {
  const canAccessPortal =
    isAdminPath
      ? canAccessAdminCmsForRole(normalizedRole)
      : isDeveloperPath
        ? canAccessDeveloperPortalForRole(normalizedRole, allowDeveloperBypass)
        : isCeoPath
          ? canAccessCeoPortalForRole(normalizedRole)
          : true

  if (!canAccessPortal) return false

  const adminPermission = isAdminPath
    ? requiredAdminPermissionForPath(pathname)
    : null

  return !adminPermission || hasPermission(normalizedRole, adminPermission)
}

export const updateSession = async (request: NextRequest) => {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 1. STATIC & API BYPASS
  if (pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith(ROUTES.auth.callback)) {
    return response;
  }

  const legacyRedirectPath = LEGACY_ROUTE_REDIRECTS[pathname]
  if (legacyRedirectPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = legacyRedirectPath
    return NextResponse.redirect(redirectUrl)
  }

  // 1.5 LOCAL DEV ABSOLUTE BYPASS
  // If we are in development and have a force user ID, we allow everything.
  const isDev = process.env.NODE_ENV === 'development';
  const hasForceUser =
    process.env.DISABLE_DEV_FORCE_USER_ID !== 'true' &&
    !!process.env.DEV_FORCE_USER_ID;

  if (isDev && hasForceUser) {
    // If user tries to go to login while forced, send them to dashboard
    if (pathname === ROUTES.auth.login || pathname === ROUTES.auth.register || pathname === ROUTES.admin.login) {
      return NextResponse.redirect(new URL(ROUTES.dashboard.root, request.url));
    }
    return response;
  }

  // 2. PUBLIC PATHS
  const isPublicPath = PUBLIC_ROUTES.some((path) => pathname === path) || pathname === ROUTES.admin.login;

  const isAdminPath = (pathname === ROUTES.admin.root || pathname.startsWith(ROUTES.admin.root + '/')) && pathname !== ROUTES.admin.login;
  const isDeveloperPath = pathname === ROUTES.developer.root || pathname.startsWith(ROUTES.developer.root + '/');
  const isCeoPath = pathname === ROUTES.ceo.root || pathname.startsWith(ROUTES.ceo.root + '/');

  // 3. DEMO MODE
  if (isDemoMode()) {
    if (pathname === ROUTES.auth.login || pathname === ROUTES.auth.register || pathname === ROUTES.admin.login) {
      return NextResponse.redirect(new URL(ROUTES.dashboard.root, request.url));
    }

    if (isAdminPath || isDeveloperPath || isCeoPath) {
      const { getDemoUser } = await import('@/lib/demo/config')
      const demoUser = getDemoUser()
      const roleResolution = resolveRoleFromInputs({
        email: demoUser.email,
        appMetadataRole: demoUser.app_metadata?.role,
        userMetadataRole: demoUser.user_metadata?.role,
        forcedUserIdActive: false,
      })
      const allowDeveloperBypass = process.env.ALLOW_DEV_PORTAL_BYPASS === 'true'
      const canAccess = hasPrivilegedRouteAccess({
        pathname,
        isAdminPath,
        isDeveloperPath,
        isCeoPath,
        normalizedRole: roleResolution.normalizedRole,
        allowDeveloperBypass,
      })

      if (!canAccess) {
        return NextResponse.redirect(new URL(ROUTES.dashboard.root, request.url))
      }
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

  let user = null;

  try {
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser();
    user = resolvedUser;
  } catch (error) {
    logEdgeError({
      family: 'auth',
      eventName: 'middleware_get_user_failed',
      message: 'Failed to refresh auth session in middleware.',
      context: {
        traceId: globalThis.crypto.randomUUID(),
        routeOrAction: `middleware:${pathname}`,
        metadata: {
          method: request.method,
          hostname: request.nextUrl.hostname,
        },
      },
      error,
    });
  }

  const redirectWithCookies = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  // 5. PROTECTION LOGIC
  if (!user) {
    if (isPublicPath) return response;
    const target =
      pathname === ROUTES.admin.root || pathname.startsWith(`${ROUTES.admin.root}/`)
        ? ROUTES.admin.login
        : ROUTES.auth.login;
    const url = new URL(target, request.url);
    if (pathname !== target) url.searchParams.set('next', pathname);
    return redirectWithCookies(url.pathname + url.search);
  }

  // Logged-in user on public login pages
  if (pathname === ROUTES.auth.login || pathname === ROUTES.auth.register) {
    return redirectWithCookies(ROUTES.dashboard.root);
  }

  // 6. PRIVILEGED ROUTE GATING (defense-in-depth — app layouts also check)
  if (isAdminPath || isDeveloperPath || isCeoPath) {
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

    const canAccess = hasPrivilegedRouteAccess({
      pathname,
      isAdminPath,
      isDeveloperPath,
      isCeoPath,
      normalizedRole: roleResolution.normalizedRole,
      allowDeveloperBypass,
    })

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
