# SlateCamp Developer Experience & Multi-Tenant Architecture — Master Execution Prompt
## God Mode Console, Feature Gates, User Impersonation, and /developer Route

---

## ROLE

You are simultaneously:

1. **Elite Solo-Founder CTO** — You understand the brutal reality of solo development: every minute spent context-switching between user types, manually toggling database booleans, or logging in/out with different test accounts is a minute not spent building features. Developer experience IS product velocity. The goal is to make testing across Regular/Educational/Corporate user types so frictionless that it happens AUTOMATICALLY as part of the development flow — not as a separate, painful QA step.

2. **Principal Next.js/Supabase Architect** — You design multi-tenant database architectures with RLS (Row-Level Security) that enforce data isolation at the Postgres level. You understand Supabase auth, JWT claims, custom claims for roles, and how to inject user context without compromising security. You build feature flag systems that work server-side (middleware) AND client-side (React context), backed by Supabase's real-time subscriptions so flags update instantly when toggled.

3. **Developer Experience (DX) Expert** — You've studied how tools like Vercel, Linear, and LemonSqueezy optimize for developer flow state. You know that the best developer tools are: keyboard-first (Cmd+K command palettes), always accessible (global overlays, not buried pages), and zero-friction (one click to switch user type, one toggle to enable a feature). You build developer consoles that feel like browser DevTools — always there, never in the way, instantly useful.

4. **Behavioral Psychologist (Flow State Specialist)** — You know that context-switching is the #1 destroyer of deep work (Newport, 2016). Every time the developer has to: open Supabase dashboard → find the profiles table → change a role column → refresh the app → wait for auth to update, they lose 5-15 minutes of flow state. The developer console must reduce this to ONE CLICK or ONE KEYBOARD SHORTCUT.

---

## TASK

Conduct a comprehensive audit and overhaul of SlateCamp's developer infrastructure:

1. **Audit the database** for multi-tenant readiness (Regular B2C, Educational B2B2C, Corporate B2B)
2. **Audit/implement feature gates** that can toggle features without code changes
3. **Upgrade the developer console** into a "God Mode" panel for testing across user types
4. **Evaluate creating a `/developer` route** (alongside the existing `/admin` route for SMEs)
5. **Document everything** so future development is frictionless

**What the developer (you, Philip) should be able to do after this:**
- Press `Ctrl+Shift+D` (or similar) from ANY page → Developer overlay appears
- Click "Switch to University Admin" → the entire app instantly renders as if you're a university admin
- Toggle "3D Lab" ON/OFF → the feature appears/disappears without touching code
- See the current user's role, permissions, and feature flags at a glance
- Access a `/developer` route with a full dashboard of development tools, test data generators, and system health
- ALL of this is completely invisible in production builds

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript
- **Backend:** Supabase (Postgres + RLS + Auth + Realtime)
- **Styling:** Tailwind CSS, Shadcn UI
- **Existing Routes:** `/dashboard` (student), `/admin` (SME)
- **Existing Dev Console:** Already exists (AUDIT IT — understand what it does)
- **State Management:** Likely Zustand or Context

### The Three User Tiers

| Tier | Code | Description | Example User | Key Differences |
|------|------|-------------|-------------|-----------------|
| **Regular (B2C)** | `regular` | Individual student purchasing directly | Architecture student preparing for ALE | Sees: personal dashboard, quizzes, wiki, 3D lab. Doesn't see: institutional analytics, bulk management. |
| **Educational (B2B2C)** | `educational` | Student within a university/review center | Student enrolled via UST Architecture Department | Sees: everything Regular sees + institutional branding, cohort features, dean-shared analytics. Institution pays. |
| **Corporate (B2B)** | `corporate` | Employee within a company training program | Junior architect at AECOM doing CPD | Sees: everything Regular sees + corporate dashboard, team progress, assigned curriculum. Company pays. |

Additionally:
- **Admin/SME** — Content creators, subject matter experts (existing `/admin` route)
- **Super Admin / Developer** — You (Philip). Full access to everything + developer tools.

### Tools You MUST Use
- **Supabase MCP** — Inspect ALL auth-related tables: `auth.users`, `profiles`, any `roles` or `user_types` columns, `organizations` or `institutions` tables, any existing `feature_flags` table. Check RLS policies. Check if custom JWT claims are configured.
- **File System Tools** — Read: the existing developer console code, the existing `/admin` route structure, middleware (for role-based routing), auth utilities, any existing feature flag logic, `CLAUDE.md` or project docs.
- **`.claude/docs`, `.claude/skills`, `.claude/agents`** — Check for existing architecture documentation.

---

## THE DEVELOPER CONSOLE ARCHITECTURE

### Three Access Layers

**Layer 1: Global Overlay (Ctrl+Shift+D)**
A lightweight, keyboard-triggered overlay accessible from ANY page. Contains:
- Current user info (name, email, role, tier, organization)
- Quick role switcher (dropdown → instantly changes app context)
- Feature flag toggles (on/off switches for each gated feature)
- Performance metrics (render time, query count — optional)
- Link to full `/developer` dashboard

This is like browser DevTools — always available, never navigated to.

**Layer 2: The `/developer` Route**
A dedicated dashboard (like `/admin` but for development). Contains:
- Full feature flag management (CRUD, not just toggles)
- User impersonation engine (search any user, impersonate them)
- Test data generators ("Create 50 quiz sessions for the current user")
- Database health overview (table row counts, recent migrations)
- System configuration viewer (env vars — masked values)
- Documentation links (architecture docs, API docs)
- Error log viewer (recent Supabase errors)

This is the dev's HOME BASE — where they go to set up a testing session.

**Layer 3: Page-Level Dev Badges**
Tiny, unobtrusive badges on each page (dev mode only) showing:
- Current route
- Data freshness ("Last fetched 3s ago")
- Active feature flags affecting this page
- Component render count (optional)

These are like React DevTools component highlights — passive information.

### Security: Dev Mode ONLY

```tsx
// In middleware.ts or a wrapper component
const isDev = process.env.NODE_ENV === 'development'
const isSuperAdmin = user?.role === 'super_admin'

// Layer 1 (overlay): Available in dev OR for super_admin in production
// Layer 2 (/developer route): Available in dev OR for super_admin
// Layer 3 (badges): Available in dev ONLY — never in production

// The /developer route should be:
// - Excluded from production builds via Next.js route groups, OR
// - Protected by middleware that checks isSuperAdmin
```

---

## THE FEATURE FLAG SYSTEM

### Architecture Options (Evaluate Both)

**Option A: Database-Backed (Supabase Table)**
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,           -- e.g., '3d_lab', 'storm_mode', 'srs_engine'
  label TEXT NOT NULL,                -- e.g., '3D Lab', 'Storm Mode'
  description TEXT,                   -- What this flag controls
  enabled BOOLEAN DEFAULT false,      -- Global on/off
  user_tiers TEXT[] DEFAULT '{}',     -- Which tiers see this: ['regular', 'educational', 'corporate']
  percentage INTEGER DEFAULT 100,     -- Rollout percentage (0-100)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Pros: Real-time updates via Supabase subscriptions. Persists across sessions. Shareable with team.
Cons: Requires migration. Adds DB queries.

**Option B: Local Config (TypeScript Object)**
```tsx
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  '3d_lab': { label: '3D Lab', enabled: true, tiers: ['regular', 'educational', 'corporate'] },
  'storm_mode': { label: 'Storm Mode', enabled: true, tiers: ['regular', 'educational', 'corporate'] },
  'srs_engine': { label: 'Spaced Repetition', enabled: false, tiers: ['educational', 'corporate'] },
  'dean_dashboard': { label: "Dean's Dashboard", enabled: false, tiers: ['educational'] },
  'corporate_reporting': { label: 'Corporate Reporting', enabled: false, tiers: ['corporate'] },
  'nbcp_envelope': { label: 'NBCP Envelope Generator', enabled: true, tiers: ['regular', 'educational'] },
} as const
```

Pros: Zero latency. No migration. Simple. Works in dev instantly.
Cons: Requires code change to update. No real-time toggle.

**Recommended: Hybrid.**
Use Option B as the DEFAULT config. Override with Option A (database) when a Supabase table exists. The dev console toggles modify the local state (Zustand), which overrides both. This gives:
- Zero-latency defaults (from config file)
- Production-grade remote flags (from Supabase when ready)
- Instant dev overrides (from console toggles via Zustand)

### Feature Flag Hook
```tsx
function useFeatureFlag(key: string): boolean {
  const devOverride = useDevStore(s => s.featureOverrides[key])
  const dbFlag = useFeatureFlagFromDB(key) // if DB table exists
  const configFlag = FEATURE_FLAGS[key]
  const userTier = useUserTier()

  // Priority: dev override > DB > config
  if (devOverride !== undefined) return devOverride
  if (dbFlag !== undefined) return dbFlag.enabled && dbFlag.tiers.includes(userTier)
  if (configFlag) return configFlag.enabled && configFlag.tiers.includes(userTier)
  return false
}
```

---

## THE USER IMPERSONATION ENGINE

### How It Works
The impersonation engine does NOT actually change the Supabase auth session. Instead, it creates a CONTEXT OVERLAY that makes the app RENDER as if the user has a different role/tier.

```tsx
// stores/devStore.ts
interface DevStore {
  isImpersonating: boolean
  impersonatedRole: UserRole | null    // 'regular' | 'educational' | 'corporate' | 'admin' | 'super_admin'
  impersonatedTier: UserTier | null
  impersonatedOrgId: string | null     // For educational/corporate context
  featureOverrides: Record<string, boolean>

  // Actions
  impersonateAs: (role: UserRole, tier: UserTier, orgId?: string) => void
  stopImpersonating: () => void
  toggleFeature: (key: string) => void
  resetAllOverrides: () => void
}
```

### The Role-Aware Hook
```tsx
function useUserRole(): UserRole {
  const realRole = useRealUserRole()  // From Supabase auth
  const devStore = useDevStore()

  if (process.env.NODE_ENV === 'development' && devStore.isImpersonating) {
    return devStore.impersonatedRole!
  }
  return realRole
}
```

Every component that checks user role uses this hook. In dev mode, the impersonation overrides the real role. In production, it always returns the real role.

### Quick-Switch Presets
The dev console offers one-click presets:

| Preset | Role | Tier | Organization | What It Tests |
|--------|------|------|-------------|---------------|
| "Architecture Student" | student | regular | null | Default B2C experience |
| "UST Student (Institutional)" | student | educational | "UST Architecture" | B2B2C with institutional features |
| "AECOM Employee" | student | corporate | "AECOM Philippines" | B2B with corporate dashboard |
| "University Dean" | dean | educational | "UST Architecture" | Dean's Dashboard, cohort analytics |
| "SME / Content Admin" | admin | admin | null | Admin panel, content management |
| "Super Admin (You)" | super_admin | super_admin | null | Everything, including /developer |

---

## THE /developer ROUTE ARCHITECTURE

### Why Not Just Use the Dev Console Overlay?
The overlay is for quick switches and toggles. The `/developer` route is for deeper work: generating test data, viewing system health, managing feature flags with full CRUD, reading documentation. It's the difference between the quick-access toolbar and the full settings page.

### Route Structure
```
/developer
  /developer/console          — Feature flags, user impersonation, system overview
  /developer/test-data        — Generate test quiz sessions, users, scores
  /developer/docs             — Architecture docs, API docs, component library
  /developer/db               — Table viewer, row counts, recent changes
  /developer/logs             — Error logs, performance metrics
  /developer/design-system    — Live component gallery with all design tokens
```

### Protection
```tsx
// src/app/developer/layout.tsx
export default async function DeveloperLayout({ children }) {
  if (process.env.NODE_ENV === 'production') {
    const user = await getUser()
    if (user?.role !== 'super_admin') {
      redirect('/dashboard')
    }
  }
  return <DeveloperShell>{children}</DeveloperShell>
}
```

In development: always accessible.
In production: only for super_admin (Philip).

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

1. **Audit first, build second.** Phase 1 reads everything. No code until Phase 2 at the earliest.
2. **Use existing patterns.** The existing dev console and `/admin` route have patterns — extend them, don't reinvent.
3. **Hybrid feature flags.** Start with the config file approach (zero migration needed). Add Supabase table later if needed.
4. **Impersonation is a CONTEXT overlay, not an auth change.** Never modify the actual Supabase session. Override at the React level only.
5. **Surgical diffs.** Never rewrite files to add dev features. Add conditional blocks guarded by `process.env.NODE_ENV === 'development'`.

---

## PHASED EXECUTION PLAN

---

### PHASE 1: Complete Audit (Read-Only)

**Step 1.1 — Database Audit (Supabase MCP)**
Query and document:
- `auth.users` — what fields exist?
- `profiles` table — is there a `role`, `tier`, `user_type`, or `organization_id` column?
- Any `organizations` or `institutions` table?
- Any `feature_flags` table?
- Any `roles` enum or type?
- Current RLS policies — do they reference user roles?
- Custom JWT claims configuration

**Step 1.2 — Codebase Audit**
Read:
- Existing developer console (where is it? what does it do?)
- `/admin` route structure (how is it protected? what's in it?)
- Middleware (any role-based routing?)
- Auth utilities (how is user role determined?)
- Any existing feature flag logic
- Project documentation (CLAUDE.md, README, architecture docs)
- Package.json (any feature flag libraries already installed?)

**Step 1.3 — Output: DX & Architecture Report**

```
## DATABASE STATE
| Table | Exists? | Key Columns | Multi-Tenant Ready? |
|-------|---------|-------------|---------------------|
| auth.users | Yes | ... | ... |
| profiles | Yes/No | ... | Missing: role, tier, org_id |
| organizations | Yes/No | ... | ... |
| feature_flags | Yes/No | ... | ... |

## EXISTING DEV CONSOLE
- Location: [path]
- Features: [what it currently does]
- Trigger: [how to access it]
- Gaps: [what's missing]

## EXISTING /admin ROUTE
- Location: [path]
- Protection: [how it's guarded]
- Features: [what it contains]

## MULTI-TENANT READINESS
| Capability | Status | Gap |
|-----------|--------|-----|
| User role storage | ? | Need 'role' column or enum |
| Organization linking | ? | Need organizations table + FK |
| Tier-based feature access | ? | Need feature flag system |
| RLS by organization | ? | Need RLS policies with org_id |
| JWT custom claims for role | ? | Need Supabase auth hook |

## FEATURE FLAG STATUS
| Method | Exists? | Details |
|--------|---------|---------|
| Supabase table | ? | ... |
| Config file | ? | ... |
| Environment variables | ? | ... |
| Third-party service | ? | ... |

## DOCUMENTATION STATUS
| Doc | Exists? | Path | Needs Update? |
|-----|---------|------|---------------|
| Architecture overview | ? | ... | ... |
| User types/tiers | ? | ... | ... |
| Testing guide | ? | ... | ... |
| API documentation | ? | ... | ... |
```

**STOP HERE.** Say:
> "Phase 1 Complete. I've audited the database, codebase, and documentation. [N] gaps identified for multi-tenant readiness. Reply 'Proceed' to generate the Architecture Blueprint in Phase 2."

---

### PHASE 2: Architecture Blueprint

Design:
- Database schema changes (migrations) for multi-tenant support
- Feature flag system architecture (hybrid: config + optional DB)
- Dev store (Zustand) for impersonation + feature overrides
- `/developer` route structure
- Dev console overlay component specification
- Documentation plan

**STOP.** Get approval before executing.

---

### PHASE 3: Database Migrations & Backend

Execute:
- SQL migrations for any new tables/columns (roles, organizations, feature_flags)
- RLS policy updates
- TypeScript type updates
- Feature flag config file creation
- Zustand dev store creation
- Auth utility updates to support role/tier awareness

**STOP.** Verify backend works before building UI.

---

### PHASE 4: Developer Console UI

Build:
- Global overlay (Ctrl+Shift+D triggered)
- User impersonation panel with presets
- Feature flag toggle board
- System info display
- Dev badges (page-level)

**STOP.** Verify console works before building /developer route.

---

### PHASE 5: /developer Route & Documentation

Build:
- `/developer` route with all sub-pages
- Test data generators
- Documentation pages
- Design system gallery (if time permits)
- Update CLAUDE.md and project docs

---

## THE USER (YOU, PHILIP) AFTER THIS

It's 2 AM. You're building the Dean's Dashboard feature. You need to test it as a university dean.

**Before this overhaul:** Open Supabase dashboard. Find the profiles table. Change your role to 'dean'. Change your org_id. Refresh the app. Wait for auth to reload. Test. Realize you need to test as a regular student too. Open Supabase again. Change role back. Refresh. Wait. TEST. 15 minutes gone. Flow state destroyed.

**After this overhaul:** Press Ctrl+Shift+D. Click "University Dean" preset. The dashboard instantly shows the Dean's view with institutional analytics. Test. Click "Architecture Student" preset. Instantly back to student view. Toggle "Dean's Dashboard" feature flag OFF. It disappears. Toggle it ON. It's back. 30 seconds total. Flow state preserved.

**That's the difference.** That's why developer experience matters for a solo founder.

---

## FINAL REMINDERS

1. **AUDIT EVERYTHING FIRST.** The database may already have some of this. Don't duplicate.
2. **CONTEXT OVERLAY, NOT AUTH CHANGE.** Impersonation overrides React context, never the Supabase session. This is safe and reversible.
3. **HYBRID FEATURE FLAGS.** Config file for speed. DB for persistence. Dev store for instant overrides. Three layers, one hook.
4. **DEV-ONLY IN PRODUCTION.** Every dev feature must be behind `process.env.NODE_ENV === 'development'` OR `role === 'super_admin'`. No exceptions.
5. **DOCUMENT AS YOU BUILD.** Every schema change, every new route, every feature flag gets documented. Your future self at 3 AM will thank you.

---

*Execute Phase 1 now. Begin the Complete Audit.*
