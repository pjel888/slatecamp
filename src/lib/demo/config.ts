import type { UserTier } from '@/types/app'

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

const DEMO_ROLE_OVERRIDES = new Set([
  'member',
  'owner',
  'super_admin',
  'content_admin',
  'sme_reviewer',
  'developer',
  'admin',
  'ceo',
] as const)

type DemoRoleOverride =
  | 'member'
  | 'owner'
  | 'super_admin'
  | 'content_admin'
  | 'sme_reviewer'
  | 'developer'
  | 'admin'
  | 'ceo'

const DEMO_TIER_OVERRIDES = new Set([
  'free',
  'pro',
  'prime',
  'institutional',
  'enterprise',
] as const)

export const getDemoEmailOverride = (): string | null => {
  const rawEmail = process.env.PLAYWRIGHT_DEMO_EMAIL?.trim()
  return rawEmail ? rawEmail : null
}

export const getDemoRoleOverride = (): DemoRoleOverride | null => {
  const rawRole = process.env.PLAYWRIGHT_DEMO_ROLE?.trim()
  if (!rawRole || !DEMO_ROLE_OVERRIDES.has(rawRole as DemoRoleOverride)) {
    return null
  }

  return rawRole as DemoRoleOverride
}

export const getDemoTierOverride = (): UserTier | null => {
  const rawTier = process.env.PLAYWRIGHT_DEMO_TIER?.trim()
  if (!rawTier || !DEMO_TIER_OVERRIDES.has(rawTier as UserTier)) {
    return null
  }

  return rawTier as UserTier
}

export const getDemoUser = () => {
  const demoRole = getDemoRoleOverride()
  const demoEmail = getDemoEmailOverride()

  return {
    ...DEMO_USER,
    email: demoEmail ?? DEMO_USER.email,
    app_metadata:
      demoRole && demoRole !== 'member' ? { role: demoRole } : {},
    user_metadata: {
      ...DEMO_USER.user_metadata,
      ...(demoRole && demoRole !== 'member' ? { role: demoRole } : {}),
    },
  } as const
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
