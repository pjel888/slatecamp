/**
 * Demo mode configuration.
 * Demo mode is ONLY enabled when NEXT_PUBLIC_ENABLE_DEMO_MODE is explicitly set to "true".
 * In production, missing Supabase credentials will throw an error.
 */
export function isDemoMode(): boolean {
  const demoModeEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (demoModeEnabled) {
    return true;
  }

  // In production, throw error if Supabase is not configured
  if (!hasSupabaseUrl && process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL is required in production. " +
      "If you intend to run in demo mode, set NEXT_PUBLIC_ENABLE_DEMO_MODE=true"
    );
  }

  return false;
}

export const DEMO_USER = {
  id: "demo-user-00000000-0000-0000-0000-000000000001",
  email: "philip@cerebro.dev",
  app_metadata: {},
  user_metadata: { full_name: "Philip Lewis" },
  aud: "authenticated",
  created_at: "2026-01-15T08:00:00Z",
} as const;
