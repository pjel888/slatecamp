<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# app

## Purpose

Root Next.js App Router directory for SlateCamp -- a cognitive-first, AI-adaptive board exam prep platform. Contains 105 pages, 13 layouts, 87 loading states, and 8 error boundaries across 4 portals: Dashboard (student), Admin (content management), CEO (business analytics), and Developer (internal docs/tools). Handles all user-facing routes, API endpoints, authentication flows, and the main application interface.

This directory implements the Campfire design system and enforces strict pedagogical constraints: no generic gamification, zero temperature AI tutor, Item Response Theory (IRT) mastery calculations, and growth-framed voice throughout.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout: fonts (Inter, Syne, DM Mono, Geist), theme provider, tooltip provider, demo shell, navigation progress bar, toaster, noise filter |
| `page.tsx` | Landing page (marketing site) -- force-dynamic, SEO metadata, Readiness Score messaging |
| `error.tsx` | Global error boundary -- catches unhandled errors across all routes |
| `not-found.tsx` | 404 page |
| `globals.css` | Tailwind v4 CSS-first theme with Campfire design tokens (cobalt, emerald, warm red, amber, surfaces, text hierarchy) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(auth)` | Auth route group: login, register, forgot-password, onboarding -- unauthenticated flows |
| `(protected)` | Protected route group: CEO dashboard portal (role-gated to `ceo`/`super_admin`) |
| `about` | About page (marketing) |
| `admin` | Admin panel: question/wiki CRUD, taxonomy management, reviews, audit logs, asset uploads |
| `api` | API routes: admin flags, AI endpoints (embed, generate-questions, study-agent, tutor), cron jobs, payments, webhooks |
| `auth` | Auth callback route (OAuth/SAML handler) |
| `contact` | Contact form page |
| `dashboard` | Student portal -- authenticated routes with sidebar navigation: wiki, review, notes, 3d-lab, analytics, testing, settings |
| `developer` | Developer portal -- internal docs, API reference, architecture guides, design system catalog, dev tools |
| `pricing` | Pricing page (marketing) |
| `calculators` | Construction calculators: CHB, drywall, flooring, paint estimators |
| `quiz` | Quiz routes: dynamic [mode]/session/[sessionId] with results and review pages |
| `test-3d` | 3D rendering test page |
| `tools` | Standalone utilities: floor-tiles-calculator, lot-plotter, wall-paint-calculator |
| `try` | Try/demo page (public preview) |

## For AI Agents

### Working In This Directory

**Authentication Context:**
- All routes under `/dashboard/*` require Supabase session (checked by middleware)
- CEO portal (`/ceo`) requires `ceo` or `super_admin` role
- Developer portal (`/developer`) requires authenticated user or `ALLOW_DEV_PORTAL_BYPASS` env var
- Admin panel (`/admin`) requires admin role
- Auth flows use `/api/auth/callback` for OAuth/SAML
- Session tokens refresh via middleware in root layout
- Anonymous/public routes: `/(auth)`, `about`, `contact`, `pricing`, `try`, `page.tsx`

**Metadata & SEO:**
- Root `layout.tsx` sets `metadata.template` -- all pages inherit `%s | SlateCamp`
- Use `export const metadata: Metadata = { title: "...", description: "..." }` in page.tsx or layout.tsx
- Dynamic pages can export `generateMetadata()` function
- Root viewport uses light theme color `#FFFFFF` / dark `#000000`

**Font Loading:**
- **Inter** (main body text, default) -- loaded via `next/font/google` in root layout with `variable: --font-inter`
- **Syne** (headings, bold accents) -- weights 400/700/800 in `variable: --font-syne`
- **DM Mono** (code, data values, Readiness Score number) -- weights 400/500 in `variable: --font-dm-mono`
- **Geist Sans** (fallback via `GeistSans` from 'geist/font/sans') -- included in layout but Inter is primary
- All fonts load with `display: 'swap'` (progressive text rendering)

**Component Patterns:**
- Server Components by default -- only mark client components with `'use client'`
- Suspense boundaries for async server component content
- Dashboard routes wrap content with shared layout (sidebar, navigation, settings context)
- Use shadcn/ui base components (`Button`, `Input`, `Card`, etc.)
- Use Phosphor icons (`@phosphor-icons/react`) and Lucide icons (`lucide-react`) for nav and UI actions

**Design Constraints:**
- Color palette strictly enforced: Camp Cobalt `#1B3FC4`, Emerald `#2D9F6F`, Warm Red `#D64545`, Amber `#D4951A`, Info Blue `#3B82C8`
- Border radius: `rounded-sm` (6px) for buttons/inputs, `rounded-md` (8px) for cards, `rounded-lg` (12px) for modals -- never `rounded-xl`/`rounded-2xl`/`rounded-3xl`
- Shadows: `shadow-sm` on hover, `shadow-md` for dropdowns, `shadow-lg` for modals -- never `shadow-xl`/`shadow-2xl` on non-modal elements
- Transitions max 300ms, default `duration-150 ease-out` -- never `bounce`/`spring` easing (except framer-motion structural animations)
- Minimum text size `text-[11px]` -- never use `text-[8px]`/`text-[9px]`/`text-[10px]`
- Monospace only on code snippets, data values, and Readiness Score number -- never on labels/categories/metadata

**Voice & Messaging:**
- Never use: "blindspot protocol", "endurance cycle", "proof simulation", "drill"/"grind", "weakness"/"gap", "dominate"/"conquer", "behind"/"overdue"
- Always use: "Focus Review", "Extended Practice", "Full Exam Simulation", "practice"/"review"/"session", "area to revisit"/"developing skill", "master"/"cover"/"strengthen", "ready for review"
- Growth-framed: "42 topics covered" not "58 remaining"
- Specific CTAs: "Start 10-Question Review" not "Begin Assessment"
- Welcoming empty states -- never accusatory
- Time-aware greetings (Good morning/evening with warm tone)

**Testing Modes:**
- **Camp** -- adaptive practice with personalized question selection
- **Storm** -- rapid-fire timed practice with timer bar
- **Chill** -- untimed, relaxed review mode
- **Custom** -- user-defined session parameters
- **Focus Review** -- targets weak areas from taxonomy (formerly "Blindspot")
- **Simulation** -- Full Exam Simulation with proctored conditions, timed, cold delivery results
- **Endurance** -- Extended Practice with multiple sessions
- **Subject** -- subject-focused drill

**Pedagogical Requirements (DO NOT BYPASS):**
- **No Generic Gamification:** Zero confetti, badges, virtual currency, empty streaks
- **Progression mapping:** Readiness Score only (IRT-based), Taxonomy Heatmap, Pacing Gauge
- **AI Tutor (Temperature 0.0):** MUST include citation badges linking to exact Wiki paragraphs; use structured rationales (Misconception vs. Principle) from questions
- **State Persistence:** All test environments auto-save every 10 seconds
- **IRT Mastery:** All calculations use 2-parameter logistic model (theta, discrimination, difficulty) -- never raw percentages
- **Readiness Score:** Real-time calculation based on IRT estimates, never static
- **Wiki Sourcing:** Every claim in study materials must link to verified expert sources

**API Route Patterns:**
- Request validation with `zod` or similar schema library
- Try-catch with structured error logging (include context, not just error message)
- Return `Response.json({ ... }, { status: ... })` for consistency
- Check `Authorization` header on protected endpoints (Supabase bearer token or `CRON_SECRET` for scheduled jobs)
- Cron routes must verify `Authorization: Bearer ${process.env.CRON_SECRET}`
- Use `process.env.NEXT_PUBLIC_*` only for public values -- never expose secrets in client bundle

### Common Patterns

**Portal Shell Pattern:**
Each portal (Admin, CEO, Developer) uses `PortalLayout` from `@/components/portal` with its own navigation, topbar color, and accent. Portal configs are centralized in `@/config/portals`.

**Route Configuration:**
- Single source of truth: `src/lib/constants/routes.ts` -- defines route constants (`ROUTES.LOGIN`, `ROUTES.DASHBOARD`, etc.)
- Sidebar nav defined in `src/lib/sidebar-constants.ts` -- `SIDEBAR_NAV_ITEMS`, `DASHBOARD_ROUTES`, `getPageTitle()`
- Nav groups: `learn` (Wiki, Notes, 3D Lab), `practice` (CampTrails, Review), `data` (Analytics)

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/constants/routes` | Route constants (single source of truth for all portal paths) |
| `@/lib/sidebar-constants` | Sidebar navigation metadata and page titles |
| `@/lib/auth` | Supabase session utilities, role checks |
| `@/config/portals` | Portal configuration (Admin, CEO, Developer) |
| `@/components/portal` | Shared `PortalLayout` component for Admin, CEO, Developer shells |
| `@/components/shared` | Theme provider, navigation progress, tooltips |
| `@/components/ui` | shadcn/ui components (button, card, input, etc.) |
| `@/components/landing` | Landing page content/fallback |
| `@/components/dashboard` | Dashboard shared components (sidebar, header, etc.) |
| `@/lib/supabase` | Supabase client initialization, helpers |

### External Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | App Router, server/client components, metadata |
| `react` | 19.2.4 | Components, hooks |
| `tailwindcss` | 4.2.2 | CSS-first theme, Campfire design tokens |
| `@base-ui/react` + `shadcn` | Latest | Unstyled, accessible UI primitives |
| `@phosphor-icons/react` | Latest | Icon library for nav and UI |
| `lucide-react` | Latest | Additional icon library |
| `@supabase/supabase-js` | Latest | Auth, database, realtime |
| `three` | ^r183 | 3D rendering (spatial computing) |
| `@react-three/fiber` | 9.5.0 | React/Three.js integration |
| `zustand` | 5.0.12 | State management |
| `zod` | Latest | API request validation |
| `framer-motion` | Latest | Structural animations (no decorative bounce) |
| `geist` | ^1.x | Geist font (fallback) |

## Environment Variables

**Required in `.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anon key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY` -- Server-only, for admin operations
- `NEXT_PUBLIC_APP_URL` -- App base URL (for OAuth redirects, metadata)
- `CRON_SECRET` -- Bearer token for scheduled job authorization

**Optional:**
- `NEXT_PUBLIC_DEMO_MODE` -- Set to enable demo shell (`isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL`)
- `ALLOW_DEV_PORTAL_BYPASS` -- Set to `'true'` to allow unauthenticated developer portal access
- `OPENAI_API_KEY` -- For AI endpoints (embed, tutor, question generation)
- `STRIPE_SECRET_KEY`, `PAYREX_API_KEY` -- Payment processors

## MANUAL

<!-- MANUAL: -->
