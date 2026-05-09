# Architecture

**Last audit:** 2026-04-29 | **Updated:** 2026-05-09 (cross-references added)

> See `PROJECT_CONTEXT.md` for project-level overview. This file covers technical architecture.

## System Overview

SlateCamp is a **Next.js 16 App Router** application with **Supabase-backed auth/data**, Server Actions for most mutations, API route handlers for AI/payments/cron/webhooks, and client-heavy interactive surfaces for quiz, 3D Lab, wiki, notes, and admin editors.

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Quiz UI  │ │ 3D Lab   │ │ Wiki UI  │ │ Notes  │ │
│  │(Zustand) │ │(R3F/GL)  │ │(MDX)     │ │(TipTap)│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
└───────┼────────────┼────────────┼────────────┼──────┘
        │            │            │            │
   Server Actions (src/lib/actions/)      Route Handlers
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴──────┐
│              Next.js Server (App Router)              │
│  ┌──────────────────────────────────────────────┐    │
│  │           middleware.ts                       │    │
│  │  └─ src/lib/supabase/middleware.ts            │    │
│  │     └─ Session refresh, legacy redirects,     │    │
│  │        role gating, demo mode bypass          │    │
│  └──────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────┐    │
│  │         Server Components (default)           │    │
│  │  └─ Pages, Layouts, Loading, Error boundaries │    │
│  └──────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────┐    │
│  │         Client Components ("use client")       │    │
│  │  └─ R3F Canvas, Quiz timers, Rich editors,    │    │
│  │     Wiki interactions, Nav, Charts            │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────┘
                       │
              ┌────────┴────────┐
              │    Supabase     │
              │  ┌──────────┐   │
              │  │   Auth   │   │
              │  ├──────────┤   │
              │  │PostgreSQL│   │
              │  │  (RLS)   │   │
              │  ├──────────┤   │
              │  │ Storage  │   │
              │  └──────────┘   │
              └─────────────────┘
```

## Current Structure

| Layer | Files/Paths | Role |
|-------|-------------|------|
| App Router | `src/app/` (128 page routes) | Pages, route groups, layouts, loading/error boundaries, route handlers |
| Components | `src/components/` (652 files, 61 dirs) | Shared and domain UI components |
| Features | `src/features/` (556 files, 64 dirs) | Large modules: 3D Lab, wall configurator |
| Server Logic | `src/lib/actions/` (150 files), `src/lib/queries/`, `src/lib/supabase/` | Mutations, reads, auth/data clients |
| State | `src/stores/` (5 Zustand stores), `src/hooks/` (13 hooks) | Client state management |
| Database | `DATABASE_SCHEMA.sql`, `supabase/migrations/` (101 files) | Schema snapshot and migration history |
| Docs/Ops | `.ai/`, `docs/`, `AGENTS.md` hierarchy | Operational intelligence and agent guidance |

## Request Flow

1. **middleware.ts** sets `x-pathname` header, delegates to `src/lib/supabase/middleware.ts`
2. **Supabase middleware** handles: static/API bypass, legacy redirects, dev force-user bypass, public path checks, demo mode, session refresh, privileged route gating (admin/developer/CEO)
3. **Route layouts/pages** render Server Components by default; Client Components mounted where interactivity needed
4. **Server Actions/queries** in `src/lib/` read/write Supabase (with RLS enforcement)
5. **Route handlers** in `src/app/api/` handle AI, cron, payments, webhooks, admin flag overrides

## Rendering / Client Boundaries

**Server-first intent**, but many files are client components due to:
- 3D rendering (R3F/WebGL requires browser)
- Quiz timers and interactive state
- Rich text editors (TipTap, CodeMirror)
- Navigation and sidebar interactivity
- Wiki interactions (bookmarks, highlights, feedback)
- Notes workspace (real-time editing)

## Route Groups

| Group | Purpose | Access |
|-------|---------|--------|
| `(auth)` | Login, register, forgot password, onboarding | Public (redirects authenticated users) |
| `(protected)` | CEO portal | Owner/CEO entitlement only |
| `(admin-public)` | Admin login | Public |
| `(dashboard)` | All student features | Authenticated |
| `(marketing)` | Public pages | Public |

## Database Schema

76 tables across 9 domain families (see `data-models.md` for full inventory):

| Domain | Tables | Key Entities |
|--------|--------|-------------|
| Identity/access | 6 | profiles, user_roles, user_subscriptions, organizations |
| Learning graph | 5 | taxonomy_tree, disciplines, cross_references, prerequisites |
| Wiki/content | 9 | wiki_articles, reads, bookmarks, highlights, feedback |
| Quiz/mastery/readiness | 23 | questions, quiz_sessions, user_interactions, mastery, SRS, readiness |
| Trails | 7 | camp_trails, trail_days, trail_steps, enrollments |
| 3D Lab | 2 | models_3d, spatial_hotspots |
| Design practice | 7 | design_problems, design_scenarios, sessions |
| Operations/notifications | 13 | notifications, analytics_events, notes, study_pods |
| CEO/business | 4 | ceo_financial_entries, ceo_cash_balance, ceo_gate_status |

## Auth Model (traced from source 2026-05-09)

### Middleware Chain
1. `middleware.ts` (33 lines) → delegates to `updateSession()` in `src/lib/supabase/middleware.ts` (265 lines)
2. **Step 1 — Static/API bypass:** Files, `/_next`, `/api/*`, `/auth/callback` skip auth
3. **Step 1.5 — Dev force-user bypass:** If `NODE_ENV=development` and `DEV_FORCE_USER_ID` is set, all routes allowed; redirects from /login to /dashboard. Guarded by `src/lib/env/production-guardrails.ts`
4. **Step 2 — Public paths:** Matched against `PUBLIC_ROUTES` in `src/lib/routes.ts`; `/admin/login` also public
5. **Step 3 — Demo mode:** Resolves demo user role via `resolveRoleFromInputs()`, gates admin/developer/CEO routes using `hasPrivilegedRouteAccess()`
6. **Step 4 — Supabase init:** `createServerClient()` from `@supabase/ssr` with cookie-based session management
7. **Step 5 — Auth check:** Unauthenticated users redirected to `/login` (with `?next=` param); logged-in users on login/register redirected to `/dashboard`
8. **Step 6 — Privileged route gating:** For admin/developer/CEO paths, queries `profiles.role` and `user_roles` table, resolves strongest role, checks permissions, logs audit event with full trace

### Role Resolution (`src/lib/entitlements/resolve-role.ts`, 228 lines)
**Priority order (first match wins):**
1. `dev_force_user` → `owner` (development only, guarded by `isDevForceUserRoleOverrideActive()`)
2. `user_roles` table → strongest role by priority (owner=10, super_admin=6, content_admin=5, developer=4, admin=4, ceo=4, sme_reviewer=3)
3. `profiles.role` → normalized compatibility role
4. `app_metadata.role` → normalized compatibility role
5. `user_metadata.role` → normalized compatibility role
6. `OWNER_EMAILS` env → `owner`
7. `ADMIN_EMAILS` env → `super_admin`
8. Fallback → `member` (if authenticated) or `anonymous`

### Permission Model (`src/lib/entitlements/policy.ts`, 165 lines)
- **7 role sets:** `ADMIN_CMS_ROLES` (7 roles), `CEO_PORTAL_ROLES` (3), `OVERRIDE_WRITE_ROLES` (4), `MANAGE_CONTENT_ROLES` (6), `MANAGE_USERS_ROLES` (2), etc.
- **20 granular admin permissions** per role: `admin.access`, `admin.content.create`, `admin.content.publish`, `admin.taxonomy.manage`, `admin.audit.view`, `admin.users.manage`, etc.
- `owner` and `super_admin` have all 20 permissions; `sme_reviewer` has 8; `member`/`anonymous` have 0
- **Route-to-permission mapping** (`ADMIN_PATH_PERMISSIONS`): 16 regex patterns matching URL paths to required permissions (e.g., `/admin/ai-audit` → `admin.content.view`)
- **Audit trail:** Every access decision logged via `logEntitlementAuditEvent()` with full trace including role source, tier, override state, and denial reason

### Portal Gate Guards
- **Developer portal** (`src/lib/developer/access.ts`): Uses `getViewerEntitlements()` → `ENTITLEMENT_FEATURE_KEYS.developerPortal`; throws `Error('Not authorized')` if denied
- **CEO portal** (`src/lib/ceo/access.ts`): Uses `getViewerEntitlements()` → `ENTITLEMENT_FEATURE_KEYS.ceoPortal`; throws `Error('Not authorized')` if denied
- Both support `ALLOW_DEV_PORTAL_BYPASS` env var (development only, production-guarded)

### Production Guardrails (`src/lib/env/production-guardrails.ts`)
- `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, `ALLOW_DEV_PORTAL_BYPASS`, `DISABLE_DEV_FORCE_USER_ID` all ignored in `NODE_ENV=production`
- Guards are checked at both middleware and server-action levels

### RLS (verified 2026-05-09)
Row Level Security policies exist on Supabase PostgreSQL tables. Verified example: `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql` — a P0 remediation that revoked authenticated-user access to 6 sensitive AI audit views (article overview, question overview, finding overview, etc.) and the cache seeding function, restricting them to `service_role` only. The migration includes clear comments explaining the security rationale and is part of a broader RLS strategy where admin pages use server-side service-role clients after application-level permission checks.

## Important Dependencies

| Dependency | Purpose | Risk Level |
|------------|---------|------------|
| Next.js 16.2.3 | Framework | Core |
| React 19.2.5 | UI library | Core |
| Supabase (`@supabase/ssr`, `supabase-js`) | Auth + Database | Critical |
| React Three Fiber + drei + Three.js | 3D Lab | High (complex, performance-sensitive) |
| Tailwind CSS 4.2.4 | Styling | Core |
| Zustand 5 | Client state | Medium (quiz store is large) |
| TipTap | Rich text editor | Medium |
| Recharts | Charts/analytics | Low |
| Framer Motion | Animations | Low |
| Zod 4 | Validation | Low |
| Playwright 1.59.1 | E2E testing | Dev only |
| Storybook 8.6.17 | Component testing | Dev only |

## External Integrations

See `integrations.md` for full details. Active integrations:

| Integration | Status | Purpose |
|-------------|--------|---------|
| Supabase | Active (launch-critical) | Auth, database, storage |
| Next.js ImageResponse | Active | OG score images |
| PayRex | Deferred (code present, disabled) | Payment processing |
| OpenAI/Anthropic | Deferred (code present, disabled) | AI tutor/generation |

## Known Architectural Risks

1. **Large Zustand quiz store** (`src/stores/useQuizStore.ts`) — complexity risk; hard to test in isolation
2. **3D Lab performance** — requires ongoing optimization for mobile devices
3. **Broad route surface** — 128 routes; many optional/internal surfaces (CEO, developer, pods, DAE, studio)
4. **Schema drift** — `DATABASE_SCHEMA.sql` may not capture all runtime objects; migration history is long (101 files)
5. **Client/Server boundary** — server-first intent but pervasive client components; boundary violations possible
6. **Demo mode coupling** — demo mode logic is pervasive in middleware and tests

## Areas That Are Fragile or Unclear

1. **Supabase verification target** — whether a safe local/staging target exists for migration replay
2. **Schema objects without snapshot coverage** — code references objects (`audit_logs`, `cage_binding_tokens`, CEO materialized views) not in `DATABASE_SCHEMA.sql`
3. **Deferred payment/AI code** — retained but unverified; could bit-rot
4. **Pre-existing working tree changes** — landing page, sidebar, 3D Lab components have uncommitted diffs

---

> **Related docs:** `routes.md`, `api-and-server.md`, `data-models.md`, `security.md`, `codebase-map.md`, `integrations.md`
