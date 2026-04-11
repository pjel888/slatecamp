import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/demo/config";
import { featureFlagsSchema } from "@/lib/validations";
import { getViewerEntitlements } from "@/lib/entitlements/get-viewer-entitlements";
import { ENTITLEMENT_FEATURE_KEYS } from "@/lib/entitlements/feature-keys";
import {
  DEV_OVERRIDE_COOKIE_NAME,
  serializeDevOverrides,
} from "@/lib/entitlements/dev-overrides";
import { logEntitlementAuditEvent } from "@/lib/entitlements/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const flags = featureFlagsSchema.parse(body);
    const cookieStore = await cookies();

    if (!isDemoMode()) {
      const entitlements = await getViewerEntitlements([
        ENTITLEMENT_FEATURE_KEYS.devOverrideWrite,
      ]);

      if (!entitlements.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const canWrite =
        entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.devOverrideWrite]?.allowed ?? false;

      if (!canWrite) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      logEntitlementAuditEvent({
        eventName: 'tooling.override.write',
        timestamp: new Date().toISOString(),
        traceId: entitlements.traceId,
        userId: entitlements.userId,
        routeOrAction: 'POST /api/admin/flags',
        featureKey: ENTITLEMENT_FEATURE_KEYS.devOverrideWrite,
        normalizedRole: entitlements.normalizedRole,
        roleSource: entitlements.roleResolution.resolvedFrom,
        rawTier: entitlements.rawTier,
        subscriptionStatus: entitlements.subscriptionStatus,
        effectiveTier: entitlements.effectiveTier,
        overrideState: {
          ...entitlements.overrides,
          featureOverrides: Object.fromEntries(
            Object.entries(entitlements.overrides.featureOverrides),
          ),
        },
        decision: true,
        decisionSource: 'api.admin.flags',
        trace: ['override:write'],
      });
    }

    // Secure cookie settings: httpOnly=true prevents XSS access
    cookieStore.set(DEV_OVERRIDE_COOKIE_NAME, serializeDevOverrides(flags), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  if (!isDemoMode()) {
    const entitlements = await getViewerEntitlements([
      ENTITLEMENT_FEATURE_KEYS.devOverrideWrite,
    ]);

    if (!entitlements.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canWrite =
      entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.devOverrideWrite]?.allowed ?? false;

    if (!canWrite) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    logEntitlementAuditEvent({
      eventName: 'tooling.override.delete',
      timestamp: new Date().toISOString(),
      traceId: entitlements.traceId,
      userId: entitlements.userId,
      routeOrAction: 'DELETE /api/admin/flags',
      featureKey: ENTITLEMENT_FEATURE_KEYS.devOverrideWrite,
      normalizedRole: entitlements.normalizedRole,
      roleSource: entitlements.roleResolution.resolvedFrom,
      rawTier: entitlements.rawTier,
      subscriptionStatus: entitlements.subscriptionStatus,
      effectiveTier: entitlements.effectiveTier,
      overrideState: {
        ...entitlements.overrides,
        featureOverrides: Object.fromEntries(
          Object.entries(entitlements.overrides.featureOverrides),
        ),
      },
      decision: true,
      decisionSource: 'api.admin.flags',
      trace: ['override:delete'],
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEV_OVERRIDE_COOKIE_NAME);

  return NextResponse.json({ success: true });
}
