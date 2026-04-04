/**
 * Demo mode configuration.
 * Demo mode is ONLY enabled when NEXT_PUBLIC_ENABLE_DEMO_MODE is explicitly set to "true".
 * In development, we default to FALSE to ensure we use real local data.
 */
export function isDemoMode(): boolean {
  // 1. Explicit flag ALWAYS takes precedence
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true") {
    return true;
  }
  
  // 2. In development, we want real data by default.
  // We only fallback to demo mode if we are NOT in development AND keys are missing.
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !hasUrl || !hasKey;
}

export const DEMO_USER = {
  id: "demo-user-00000000-0000-0000-0000-000000000001",
  email: "philip@cerebro.dev",
  app_metadata: {},
  user_metadata: { 
    full_name: "Philip Lewis",
    avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocL-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X=s96-c"
  },
  aud: "authenticated",
  created_at: "2026-01-15T08:00:00Z",
} as const;
