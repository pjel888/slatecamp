<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# app

## Purpose

Root Next.js App Router directory for SlateCamp — a cognitive-first, AI-adaptive board exam prep platform. Handles all user-facing routes, API endpoints, authentication flows, and the main dashboard interface.

This directory implements the Campfire design system and enforces strict pedagogical constraints: no generic gamification, zero temperature AI tutor, Item Response Theory (IRT) mastery calculations, and growth-framed voice throughout.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout: fonts (Inter, Syne, DM Mono, Geist), theme provider, tooltip provider, demo shell, navigation progress bar, toaster, noise filter |
| `page.tsx` | Landing page (marketing site) — force-dynamic, SEO metadata, Readiness Score messaging |
| `error.tsx` | Global error boundary — catches unhandled errors across all routes |
| `not-found.tsx` | 404 page |
| `globals.css` | Tailwind v4 CSS-first theme with Campfire design tokens (cobalt, emerald, warm red, amber, surfaces, text hierarchy) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(auth)` | Auth route group: login, register, forgot-password, onboarding — unauthenticated flows |
| `about` | About page (marketing) |
| `admin` | Admin panel: question/wiki CRUD, taxonomy management, reviews, audit logs, asset uploads |
| `api` | API routes: admin flags, AI endpoints (embed, generate-questions, study-agent, tutor), cron jobs, payments, webhooks |
| `auth` | Auth callback route (OAuth/SAML handler) |
| `contact` | Contact form page |
| `dashboard` | Main app — authenticated routes with sidebar navigation: wiki, review, notes, 3d-lab, analytics, settings, etc. |
| `pricing` | Pricing page (marketing) |
| `tools` | Standalone utilities: floor-tiles-calculator, lot-plotter, wall-paint-calculator |
| `try` | Try/demo page (public preview) |

## For AI Agents

### Working In This Directory

**Authentication Context:**
- All routes under `/dashboard/*` require Supabase session (checked by middleware)
- Auth flows use `/api/auth/callback` for OAuth/SAML
- Session tokens refresh via middleware in root layout
- Anonymous/public routes: `/(auth)`, `about`, `contact`, `pricing`, `try`, `page.tsx`

**Metadata & SEO:**
- Root `layout.tsx` sets `metadata.template` — all pages inherit `%s | SlateCamp`
- Use `export const metadata: Metadata = { title: "...", description: "..." }` in page.tsx or layout.tsx
- Dynamic pages can export `generateMetadata()` function (Next.js 14+)
- Root viewport uses light theme color `#FFFFFF` / dark `#000000`

**Font Loading:**
- **Inter** (main body text, default) — loaded via `next/font/google` in root layout with `variable: --font-inter`
- **Syne** (headings, bold accents) — weights 400/700/800 in `variable: --font-syne`
- **DM Mono** (code, data values, Readiness Score number) — weights 400/500 in `variable: --font-dm-mono`
- **Geist Sans** (fallback via `GeistSans` from 'geist/font/sans') — included in layout but Inter is primary
- All fonts load with `display: 'swap'` (progressive text rendering)

**Component Patterns:**
- Server Components by default — only mark client components with `'use client'`
- Suspense boundaries for async server component content
- Dashboard routes wrap content with shared layout (sidebar, navigation, settings context)
- Use shadcn/ui base components (`Button`, `Input`, `Card`, etc.)
- Use Phosphor icons (`@phosphor-icons/react`) for nav and UI actions

**Design Constraints:**
- Color palette strictly enforced: Camp Cobalt `#1B3FC4`, Emerald `#2D9F6F`, Warm Red `#D64545`, Amber `#D4951A`, Info Blue `#3B82C8`
- Border radius: `rounded-sm` (6px) for buttons/inputs, `rounded-md` (8px) for cards, `rounded-lg` (12px) for modals — never `rounded-xl`/`rounded-2xl`/`rounded-3xl`
- Shadows: `shadow-sm` on hover, `shadow-md` for dropdowns, `shadow-lg` for modals — never `shadow-xl`/`shadow-2xl` on non-modal elements
- Transitions max 300ms, default `duration-150 ease-out` — never `bounce`/`spring` easing (except framer-motion structural animations)
- Minimum text size `text-[11px]` — never use `text-[8px]`/`text-[9px]`/`text-[10px]`
- Monospace only on code snippets, data values, and Readiness Score number — never on labels/categories/metadata

**Voice & Messaging:**
- Never use: "blindspot protocol", "endurance cycle", "proof simulation", "drill"/"grind", "weakness"/"gap", "dominate"/"conquer", "behind"/"overdue"
- Always use: "Focus Review", "Extended Practice", "Full Exam Simulation", "practice"/"review"/"session", "area to revisit"/"developing skill", "master"/"cover"/"strengthen", "ready for review"
- Growth-framed: "42 topics covered" not "58 remaining"
- Specific CTAs: "Start 10-Question Review" not "Begin Assessment"
- Welcoming empty states — never accusatory
- Time-aware greetings (Good morning/evening with warm tone)

**Testing Modes:**
- **Camp** — adaptive practice with personalized question selection
- **Storm** — rapid-fire endurance test with minimal breaks
- **Chill** — untimed, relaxed review mode
- **Custom** — user-defined session parameters
- **Blindspot** — Focus Review mode — targets weaknesses from taxonomy
- **Proof_Sim** — Full Exam Simulation — proctored conditions, timed
- **Endurance** — Extended Practice — multiple sessions, recovery tracking

**Pedagogical Requirements (DO NOT BYPASS):**
- **No Generic Gamification:** Zero confetti, badges, virtual currency, empty streaks
- **Progression mapping:** Readiness Score only (IRT-based), Taxonomy Heatmap, Pacing Gauge
- **AI Tutor (Temperature 0.0):** MUST include citation badges linking to exact Wiki paragraphs; use structured rationales (Misconception vs. Principle) from questions
- **State Persistence:** All test environments auto-save every 10 seconds
- **IRT Mastery:** All calculations use 2-parameter logistic model (theta, discrimination, difficulty) — never raw percentages
- **Readiness Score:** Real-time calculation based on IRT estimates, never static
- **Wiki Sourcing:** Every claim in study materials must link to verified expert sources

**API Route Patterns:**
- Request validation with `zod` or similar schema library
- Try-catch with structured error logging (include context, not just error message)
- Return `Response.json({ ... }, { status: ... })` for consistency
- Check `Authorization` header on protected endpoints (Supabase bearer token or `CRON_SECRET` for scheduled jobs)
- Cron routes must verify `Authorization: Bearer ${process.env.CRON_SECRET}`
- Use `process.env.NEXT_PUBLIC_*` only for public values — never expose secrets in client bundle

### Common Patterns

**File Structure:**
```
app/
├── layout.tsx              # Root layout (fonts, theme, providers)
├── page.tsx                # Landing page
├── globals.css             # Tailwind theme + Campfire tokens
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404
├── (auth)/                 # Auth route group (no auth required)
│   ├── login/
│   ├── register/
│   └── onboarding/
├── dashboard/              # Protected routes (auth required)
│   ├── layout.tsx          # Sidebar nav, settings context
│   ├── page.tsx            # Dashboard home
│   ├── wiki/               # Knowledge base
│   ├── review/             # Active recall practice
│   ├── 3d-lab/             # Spatial visualization (R3F)
│   ├── analytics/          # Readiness/progress charts
│   └── settings/           # Account management
├── api/
│   ├── admin/              # Admin operations
│   ├── ai/                 # AI endpoints (tutor, question gen, embed)
│   ├── cron/               # Scheduled jobs (blindspot scan, signal compute)
│   ├── auth/               # OAuth callback
│   ├── payments/           # Stripe/Payrex webhooks
│   └── webhooks/           # External webhooks
└── admin/                  # Admin CRUD panel
```

**Dashboard Layout Pattern:**
```tsx
// app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser() // Server-side session check
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen">
      <Sidebar navigation={GROUPED_NAVIGATION} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

**API Route Pattern:**
```tsx
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({ /* ... */ })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = requestSchema.parse(body)

    // Handle request
    const result = await doWork(validated)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[api/resource] error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Client Component Pattern:**
```tsx
'use client'

import { useCallback, useState } from 'react'

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = useCallback(async () => {
    setIsLoading(true)
    try {
      // Call API
    } finally {
      setIsLoading(false)
    }
  }, [])

  return <button onClick={handleAction} disabled={isLoading}>Action</button>
}
```

**Route Configuration:**
- Single source of truth: `src/lib/routes.ts` — defines `DASHBOARD_ROUTES`, `SIDEBAR_NAVIGATION`, `GROUPED_NAVIGATION`, `getPageTitle()`
- Nav groups: `learn` (Wiki, Notes, 3D Lab), `practice` (CampTrails, Review), `data` (Analytics)
- Sidebar auto-generates from route metadata — no hardcoded nav lists elsewhere
- Dynamic page titles via `getPageTitle()` based on pathname prefixes

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/routes.ts` | Route metadata, sidebar navigation, page titles (single source of truth) |
| `@/lib/constants` | Site config, exam/question type enums |
| `@/lib/auth` | Supabase session utilities, role checks |
| `@/components/shared` | Theme provider, navigation progress, tooltips |
| `@/components/ui` | shadcn/ui components (button, card, input, etc.) |
| `@/components/landing` | Landing page content/fallback |
| `@/components/dashboard` | Dashboard shared components (sidebar, header, etc.) |
| `@/components/graphics` | 3D lab, R3F models, gradients, patterns |
| `@/lib/supabase` | Supabase client initialization, helpers |

### External Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14.x | App Router, server/client components, metadata |
| `react` | ^18.x | Components, hooks |
| `tailwindcss` | ^4.x | CSS-first theme, Campfire design tokens |
| `shadcn/ui` / `@base-ui/react` | Latest | Unstyled, accessible UI primitives |
| `@phosphor-icons/react` | Latest | Icon library for nav and UI |
| `@supabase/supabase-js` | Latest | Auth, database, realtime |
| `three` | ^r128+ | 3D rendering (spatial computing) |
| `@react-three/fiber` | Latest | React/Three.js integration |
| `zustand` | Latest | State management (alternative: React Context) |
| `zod` | Latest | API request validation |
| `framer-motion` | Latest | Structural animations (no decorative bounce) |
| `geist` | ^1.x | Geist font (fallback) |

## Environment Variables

**Required in `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only, for admin operations
- `NEXT_PUBLIC_APP_URL` — App base URL (for OAuth redirects, metadata)
- `CRON_SECRET` — Bearer token for scheduled job authorization

**Optional:**
- `NEXT_PUBLIC_DEMO_MODE` — Set to enable demo shell (`isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL`)
- `OPENAI_API_KEY` — For AI endpoints (embed, tutor, question generation)
- `STRIPE_SECRET_KEY`, `PAYREX_API_KEY` — Payment processors
- `SENTRY_AUTH_TOKEN` — Error tracking (if configured)

## Testing & Verification

**Before committing changes to this directory:**

1. **Visual verification:** Use Chrome MCP to navigate to `http://localhost:3000` and verify UI changes match Campfire design constraints
2. **Route integrity:** Verify route paths in code match `src/lib/routes.ts` (sidebar nav should reflect actual routes)
3. **Metadata:** Check `page.tsx` files export `metadata` with correct title/description format
4. **API tests:** Use cURL or Postman to verify endpoint response codes, schema validation, error messages
5. **Auth checks:** Verify protected routes redirect to `/login` when unauthenticated
6. **Accessibility:** Test keyboard navigation, screen reader compatibility, color contrast (Campfire colors meet WCAG AA)

**Forbidden Patterns:**
- No hardcoded route paths outside `src/lib/routes.ts`
- No `function` declarations (use arrow functions only)
- No generic gamification features (confetti, badges, XP, streaks not backed by pedagogy)
- No blind CSS changes — always verify visually first
- No "pass" language in headlines for guaranteed outcomes (use "Know you'll win" style)
- No untested code examples in documentation or comments
- No `eval()` or dynamic code generation without explicit security review
- No state mutations without Zustand/Context patterns

## MANUAL

<!-- MANUAL: -->
