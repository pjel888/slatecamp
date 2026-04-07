# SlateCamp — Feature Flag & Rollout Strategy
## Safe Incremental Deployment for a Solo Developer
### 2026-03-26

---

## Purpose

88 new files across 8 phases, shipping to a live product with real users on continuous deployment. This document defines how partially-complete features are hidden from users during development, how features are gradually rolled out, and when feature flags are removed.

---

## The Problem

SlateCamp deploys continuously (every push to main triggers a Vercel deployment). Without a feature flag system:

- A half-built Campfire page at `/dashboard/campfire` is accessible via URL
- A sidebar navigation link to a feature with no backend crashes on click
- A database migration that adds columns before the UI reads them is harmless, but a UI that reads columns before the migration runs is a crash
- A broken re-engagement email cron job sends emails to all users at 3 AM

The feature flag system prevents all of these.

---

## Feature Flag Architecture

### Layer 1: Database Flags (Already Exists)

The `feature_flags` table already exists in the schema:

```sql
-- Existing table
feature_flags (
  id UUID PK,
  key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

**Use for:** Features that need to be toggled without redeployment. Admin-controlled. Persistent across deploys.

**Query pattern:**
```typescript
// src/lib/queries/feature-flags.ts
import { createClient } from '@/lib/supabase/server'

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', key)
    .single()

  return data?.enabled ?? false
}
```

### Layer 2: Environment Variable Flags

**Use for:** Features that should be toggled per-environment (enabled in staging, disabled in production) without touching the database.

```typescript
// src/lib/config/flags.ts
export const FLAGS = {
  CAMPFIRE_ENABLED: process.env.NEXT_PUBLIC_FF_CAMPFIRE === 'true',
  REFERRAL_ENABLED: process.env.NEXT_PUBLIC_FF_REFERRAL === 'true',
  PUSH_NOTIFICATIONS: process.env.NEXT_PUBLIC_FF_PUSH === 'true',
  STREAK_SYSTEM: process.env.NEXT_PUBLIC_FF_STREAKS === 'true',
  INSTITUTIONAL_PORTAL: process.env.NEXT_PUBLIC_FF_INSTITUTIONS === 'true',
} as const
```

Set in Vercel environment variables:
```
# Production: all new features OFF by default
NEXT_PUBLIC_FF_CAMPFIRE=false
NEXT_PUBLIC_FF_REFERRAL=false

# Preview/staging: enable features under development
NEXT_PUBLIC_FF_CAMPFIRE=true
```

### Layer 3: Middleware Route Protection

**Use for:** Preventing access to entire route groups that aren't ready.

```typescript
// src/middleware.ts (add to existing middleware)
const GATED_ROUTES = {
  '/dashboard/campfire': 'CAMPFIRE_ENABLED',
  '/dashboard/referral': 'REFERRAL_ENABLED',
  '/dashboard/schedule': 'SCHEDULE_ENABLED',
  '/institution': 'INSTITUTIONAL_PORTAL',
} as const

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  for (const [route, flag] of Object.entries(GATED_ROUTES)) {
    if (path.startsWith(route)) {
      const isEnabled = process.env[`NEXT_PUBLIC_FF_${flag}`] === 'true'
      if (!isEnabled) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // ... existing middleware logic
}
```

---

## Flag Naming Convention

```
NEXT_PUBLIC_FF_{FEATURE_NAME}
```

- Prefix `NEXT_PUBLIC_` if the flag needs to be read client-side (for conditional rendering)
- Prefix `FF_` (no `NEXT_PUBLIC_`) if server-side only
- `{FEATURE_NAME}` in SCREAMING_SNAKE_CASE matching the phase/feature name

### Complete Flag Registry

| Flag | Phase | Controls | Default (Prod) |
|---|---|---|---|
| `NEXT_PUBLIC_FF_CAMPFIRE` | 5 | Campfire community routes and sidebar link | `false` |
| `NEXT_PUBLIC_FF_REFERRAL` | 4 | Referral program UI | `false` |
| `NEXT_PUBLIC_FF_STREAKS` | 3 | Streak counter on dashboard | `false` |
| `NEXT_PUBLIC_FF_PUSH` | 3 | Push notification opt-in | `false` |
| `NEXT_PUBLIC_FF_SCHEDULE` | 2 | Study calendar | `false` |
| `NEXT_PUBLIC_FF_WIKI_SEARCH` | 2 | Student wiki search | `false` |
| `NEXT_PUBLIC_FF_QUESTION_BROWSER` | 2 | Student question browser | `false` |
| `NEXT_PUBLIC_FF_SCORE_SHARING` | 4 | Share score card button | `false` |
| `NEXT_PUBLIC_FF_HEATMAP_DELTA` | 3 | Heatmap delta notifications | `false` |
| `NEXT_PUBLIC_FF_SIMULATION_COMPARE` | 2 | Simulation comparison view | `false` |
| `NEXT_PUBLIC_FF_ANALYTICS_EXPORT` | 2 | Export button on analytics | `false` |
| `NEXT_PUBLIC_FF_INSTITUTIONS` | 8 | Institution portal routes | `false` |
| `NEXT_PUBLIC_FF_WHITE_LABEL` | 8 | Brand config overrides | `false` |
| `NEXT_PUBLIC_FF_GUARANTEE` | 8 | Guarantee Pro tier display | `false` |
| `NEXT_PUBLIC_FF_SUBJECT_FLOOR_ALERT` | Feature 5 | Subject Floor Alert on dashboard | `false` |
| `NEXT_PUBLIC_FF_CRAM_CARD` | Feature 4 | Cram Card generator | `false` |
| `NEXT_PUBLIC_FF_AREA_C` | Feature 3 | Area C preparation tooling | `false` |
| `NEXT_PUBLIC_FF_RETAKER_ONBOARDING` | Feature 2 | Retaker onboarding branch | `false` |
| `NEXT_PUBLIC_FF_PASSER_STORIES` | Feature 1a | Passer story submission | `false` |
| `NEXT_PUBLIC_FF_STUDY_PODS` | Feature 1d | Study pod creation | `false` |

---

## Conditional Rendering Patterns

### In Server Components

```tsx
// src/app/dashboard/page.tsx
import { FLAGS } from '@/lib/config/flags'

export default async function DashboardPage() {
  // ...existing code...

  return (
    <div>
      {/* Always visible */}
      <ReadinessScoreCard data={data.readiness} />

      {/* Feature-flagged: Subject Floor Alert */}
      {FLAGS.SUBJECT_FLOOR_ALERT && data.subScores && (
        <SubjectFloorAlert subScores={data.subScores} />
      )}

      {/* Always visible */}
      <StudyHeatmap data={data.heatmap} />

      {/* Feature-flagged: Heatmap Delta */}
      {FLAGS.HEATMAP_DELTA && (
        <HeatmapDelta data={data.heatmapDelta} />
      )}

      {/* Feature-flagged: Streak */}
      {FLAGS.STREAK_SYSTEM && (
        <StreakCounter data={data.streak} />
      )}
    </div>
  )
}
```

### In Client Components

```tsx
'use client'
import { FLAGS } from '@/lib/config/flags'

export function DashboardSidebar() {
  return (
    <nav>
      <SidebarLink href="/dashboard" icon={Home}>Dashboard</SidebarLink>
      <SidebarLink href="/dashboard/testing" icon={Target}>Testing Hub</SidebarLink>
      <SidebarLink href="/dashboard/wiki" icon={Book}>Wiki</SidebarLink>

      {/* Feature-flagged sidebar items */}
      {FLAGS.CAMPFIRE_ENABLED && (
        <SidebarLink href="/dashboard/campfire" icon={Flame}>Campfire</SidebarLink>
      )}
      {FLAGS.SCHEDULE_ENABLED && (
        <SidebarLink href="/dashboard/schedule" icon={Calendar}>Schedule</SidebarLink>
      )}
    </nav>
  )
}
```

### In Sidebar Navigation

The sidebar is the most visible place where feature flags matter. **Never add a sidebar link for a feature that isn't fully functional.** The sidebar link is the last thing to enable, not the first.

---

## Rollout Protocol

### Phase Gate Process

For each feature:

1. **Build** — All code written and tested locally. Flag set to `false` in production.
2. **Preview Deploy** — Flag set to `true` in Vercel preview environments. Test on preview URL.
3. **Soft Launch** — Flag set to `true` in production. No announcement. Monitor for 24-48 hours.
4. **Full Launch** — Announce to users. Add sidebar link (if applicable). Monitor.
5. **Flag Cleanup** — After 2 weeks of stable operation, remove the flag entirely and make the code unconditional.

### Flag Cleanup Checklist

When removing a feature flag:

- [ ] Feature has been live and stable for ≥2 weeks
- [ ] No errors related to the feature in error tracking
- [ ] Remove the flag from `src/lib/config/flags.ts`
- [ ] Remove all `FLAGS.{FEATURE}` conditional checks from components
- [ ] Remove the flag from `GATED_ROUTES` in middleware (if applicable)
- [ ] Remove the env variable from Vercel
- [ ] Remove the flag row from `feature_flags` table (if database-flagged)
- [ ] `bun run build` — zero errors

---

## Database Migration Ordering Rule

**Migrations before flags. Flags before UI.**

The correct sequence for any feature:

1. **Migration** — Add tables, columns, indexes, RLS policies. This is always safe because no code reads the new schema yet.
2. **Server actions & queries** — Add the functions that read/write the new schema. These are only called by flagged UI components, so they're dormant.
3. **UI components** — Build the components, wrapped in feature flag conditionals.
4. **Enable flag** — Turn on in preview, then production.

The reverse order causes crashes: UI that reads columns before the migration runs, or components that call server actions before the functions exist.

---

## Emergency Kill Switch

If a feature causes issues in production, the fastest rollback is:

1. Set `NEXT_PUBLIC_FF_{FEATURE}=false` in Vercel environment variables
2. Trigger a redeployment (Vercel redeploys automatically on env var change, or manually trigger)
3. Feature disappears from all users within ~60 seconds

This is faster than reverting code. The code stays in the codebase but the UI and routes are hidden.

For database-level flags (if a feature needs per-user rollout):

```sql
UPDATE feature_flags SET enabled = false WHERE key = 'campfire';
```

This takes effect immediately without redeployment.

---

## Phase 1 Exception: No Flags Needed

Phase 1 features (SRS wiring, IRT wiring, security headers, XSS fix, debug route deletion, auth checks, About page, Contact page, Profile editing) are all either:
- **Bug fixes** that should apply immediately (SRS, IRT, security)
- **New pages** on routes that don't conflict with existing functionality

These do not need feature flags. Ship directly.

---

*Document version: 2026-03-26*
*Update the flag registry when adding new features.*

