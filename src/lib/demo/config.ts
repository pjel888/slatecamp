export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export const DEMO_USER = {
  id: "demo-user-00000000-0000-0000-0000-000000000001",
  email: "philip@cerebro.dev",
  app_metadata: {},
  user_metadata: { full_name: "Philip Lewis" },
  aud: "authenticated",
  created_at: "2026-01-15T08:00:00Z",
} as const;
