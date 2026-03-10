"use server";

import { cookies } from "next/headers";
import { isDemoMode, DEMO_USER } from "@/lib/demo/config";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/is-admin";

const COOKIE_NAME = "cerebro_dev_flags";

/**
 * Get feature flags for the current user.
 * This is a Server Action so it can read the httpOnly cookie securely.
 * Returns null for non-admin users or if no flags are set.
 */
export async function getFeatureFlags(): Promise<Record<string, boolean> | null> {
  const cookieStore = await cookies();

  // In demo mode, return demo flags if set
  if (isDemoMode()) {
    const flags = cookieStore.get(COOKIE_NAME)?.value;
    return flags ? JSON.parse(flags) : null;
  }

  // Check if user is admin
  const admin = await isAdmin();
  if (!admin) {
    return null;
  }

  const flags = cookieStore.get(COOKIE_NAME)?.value;
  return flags ? JSON.parse(flags) : null;
}

/**
 * Check if a specific feature flag is enabled.
 * Returns false for non-admin users or if flag is not set.
 */
export async function isFeatureEnabled(flagName: string): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags?.[flagName] ?? false;
}
