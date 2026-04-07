# Phase 4: Security & Data Integrity Audit

**Auditor:** Claude Opus 4.6 (1M context)
**Date:** 2026-03-25
**Scope:** Full codebase security audit -- schema, RLS, auth, input validation, payment, AI, XSS, error handling, headers
**Source of truth:** Code, not docs

---

## Security Scorecard

| # | Vector | Status | Details |
|---|--------|--------|---------|
| 1 | RLS on all user tables | **CLEAN** | 50/51 tables have RLS. `anon_diagnostic_sessions` intentionally excluded (server-only, documented). CEO tables (4) have RLS via migration `20260325`. `user_roles` has RLS via migration `004`. |
| 2 | Auth check on all protected routes | **NEEDS_WORK** | Middleware covers `/admin/*`, `/ceo/*`, `/developer/*`. But 5 admin query functions (`getAdminStats`, `getAdminDashboardData`, `getContentBySubject`, `fetchCoverageData`, `getArticlesWithCoverage`) lack server-side auth checks -- they rely solely on middleware, not double-check in the action. |
| 3 | Input validation on all mutations | **NEEDS_WORK** | 13 Zod schemas defined in `src/lib/validations/index.ts`. CEO financial actions use Zod. Admin asset creation uses Zod. But most server actions (quiz, testing, trails, mastery, debrief, streak, notes, dashboard) accept raw arguments without Zod parsing. |
| 4 | Service role key isolation | **CLEAN** | `SUPABASE_SERVICE_ROLE_KEY` only used in `src/lib/supabase/admin.ts` (server-only file, no `'use client'`). All consumers are server actions or API routes. Not in any client component. |
| 5 | No `select('*')` queries | **NEEDS_WORK** | 24 instances of `.select('*')` across `quiz.ts`, `testing.ts`, `trails.ts`, `notes-actions.ts`, `wiki-actions.ts`, `teach-back.ts`, `user-stats.ts`, `onboarding.ts`, `taxonomy.ts`. Over-fetches columns, increases payload, leaks schema structure. |
| 6 | All queries scoped to user_id | **CRITICAL** | `social-proof.ts` queries `user_interactions` across ALL users without auth check or user scoping (lines 14-18, 35-39). This is a cross-user data leak -- any authenticated user can aggregate other users' interaction data. `debug-taxonomy` API route has no auth check at all. |
| 7 | Env var hygiene | **CLEAN** | `.gitignore` covers `.env`, `.env.local`, `.env.*.local`. `NEXT_PUBLIC_*` vars are only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_URL`, `DEMO_MODE`, `LEMONSQUEEZY_PUBLISHABLE_KEY` -- all public-safe. No secrets in `NEXT_PUBLIC_*`. |
| 8 | Error handling coverage | **NEEDS_WORK** | Only 10/45 server action files have try/catch. Most actions do not catch errors, letting them propagate raw to the client. Some admin actions `throw new Error(error.message)` which leaks Supabase error details. |
| 9 | Payment security | **CLEAN** | LemonSqueezy webhook verifies signature via `constructEvent()`. PayRex webhook verifies via `parseEvent()`. Checkout route requires auth. Tier from metadata, amounts not client-manipulable. |
| 10 | AI/LLM security | **NEEDS_WORK** | User input injected directly into LLM prompts without sanitization (prompt injection risk). AI Tutor uses `temperature: 0` (correct). But `provider.ts` defaults to `temperature: 0.7` -- callers must remember to override. `generate-questions` uses `temperature: 0.7` and `JSON.parse(response)` without try/catch. |
| 11 | XSS/Injection surface | **NEEDS_WORK** | 4 `dangerouslySetInnerHTML` usages in `question-card.tsx` (lines 233, 243, 409) render rationale/stem HTML WITHOUT sanitization. Only `ElaborativeInterrogation.tsx` uses DOMPurify. No `eval()` in source. No raw SQL. |
| 12 | Security headers | **CRITICAL** | `next.config.ts` has ZERO security headers. No `X-Frame-Options`, no `Content-Security-Policy`, no `Strict-Transport-Security`, no `X-Content-Type-Options`. App is vulnerable to clickjacking and MIME sniffing. |

---

## Critical Security Findings

### CRITICAL-001: Missing Security Headers in next.config.ts
- **File:** `D:/SlateCamp/slate-camp/next.config.ts`
- **Severity:** CRITICAL
- **Issue:** No HTTP security headers configured. The entire application lacks:
  - `X-Frame-Options: DENY` (clickjacking protection)
  - `Content-Security-Policy` (XSS mitigation)
  - `Strict-Transport-Security` (HSTS, force HTTPS)
  - `X-Content-Type-Options: nosniff` (MIME sniffing)
  - `Referrer-Policy` (referrer leaks)
  - `Permissions-Policy` (browser feature restrictions)
- **Risk:** Clickjacking attacks, XSS via injected scripts, protocol downgrade attacks.
- **Fix:** Add `headers()` function to `next.config.ts`:
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }]
}
```

### CRITICAL-002: Cross-User Data Leak in social-proof.ts
- **File:** `D:/SlateCamp/slate-camp/src/lib/actions/social-proof.ts` (lines 5-57)
- **Severity:** CRITICAL
- **Issue:** Three exported server actions (`getQuestionSocialProof`, `getTopicDailyStudiers`, `getTopicDailyStudiersBatch`) query `user_interactions` table **across all users** without any auth check. They use `createClient()` (anon key), so RLS applies -- but the RLS policy on `user_interactions` is `USING (auth.uid() = user_id)`, meaning the query will return an empty set for non-owned rows. However, the function has no `getUser()` call, so if the auth cookie is missing or expired, the query runs as anon with no user_id scoping.
- **Risk:** If RLS is bypassed (e.g., via future migration changes), all user interaction data is exposed. The function also lacks an auth check, so unauthenticated callers could invoke it.
- **Fix:** Add `getUser()` auth check at the top of each function. Consider redesigning to use a materialized aggregate view instead of querying raw user_interactions.

### CRITICAL-003: Unsanitized HTML Rendering in question-card.tsx
- **File:** `D:/SlateCamp/slate-camp/src/components/shared/question-card.tsx` (lines 233, 243, 409)
- **Severity:** HIGH
- **Issue:** Three instances of `dangerouslySetInnerHTML={{ __html: rationale }}` and `dangerouslySetInnerHTML={{ __html: stem }}` render database content as raw HTML **without DOMPurify sanitization**. Question content comes from the database and could be manipulated by admin users or via a compromised admin account.
- **Risk:** Stored XSS. A malicious question stem or rationale containing `<script>` tags would execute in every student's browser.
- **Fix:** Import DOMPurify and sanitize before rendering:
```tsx
import DOMPurify from 'dompurify'
// ...
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rationale) }}
```

### CRITICAL-004: Unauthenticated Debug API Route
- **File:** `D:/SlateCamp/slate-camp/src/app/api/debug-taxonomy/route.ts`
- **Severity:** HIGH
- **Issue:** GET endpoint exposes taxonomy structure (total nodes, levels, sample data) with zero auth checks. Any anonymous user can call `/api/debug-taxonomy` and enumerate the entire taxonomy tree structure.
- **Risk:** Information disclosure. Attackers learn internal data structure and content counts.
- **Fix:** Either delete this route (it's a debug tool) or add auth + admin role check.

---

## High-Severity Findings

### HIGH-001: Admin Query Functions Missing Auth Checks
- **Files:**
  - `D:/SlateCamp/slate-camp/src/lib/actions/admin/dashboard.ts` -- `getAdminStats()`, `getAdminDashboardData()`, `getContentBySubject()`
  - `D:/SlateCamp/slate-camp/src/lib/actions/admin/coverage.ts` -- `fetchCoverageData()`
  - `D:/SlateCamp/slate-camp/src/lib/actions/admin/wiki-queries.ts` -- `getArticlesWithCoverage()`, `getArticles()`
- **Severity:** HIGH
- **Issue:** These server functions query content management data (questions count, wiki articles, taxonomy nodes, audit logs) without calling `canReviewContent()` or `canManageContent()`. They rely entirely on middleware route protection. Since they are `'use server'` actions, they can be invoked directly from any client-side code.
- **Note:** Admin mutation functions properly check `canManageContent()` -- only read functions are missing the check.
- **Fix:** Add `const authorized = await canReviewContent(); if (!authorized) throw new Error('Unauthorized');` at the top of each function.

### HIGH-002: Prompt Injection in AI Tutor
- **File:** `D:/SlateCamp/slate-camp/src/app/api/ai/tutor/route.ts` (line 44)
- **Severity:** HIGH
- **Issue:** User message is injected directly into the LLM call: `messages: [{ role: "user", content: message }]`. The `context` object is serialized with `JSON.stringify(context)` and injected into the system prompt. No input sanitization, no length limits beyond the Zod schema (max 4000 chars), no content filtering.
- **Risk:** Prompt injection. User could craft messages that override system instructions, extract system prompts, or generate harmful content.
- **Fix:** Sanitize user input (strip control characters, limit to printable chars). Consider a content moderation layer. Do not embed raw user data in system prompts.

### HIGH-003: Missing Input Validation on Most Server Actions
- **Files (sample of unvalidated):**
  - `D:/SlateCamp/slate-camp/src/lib/actions/quiz.ts` -- `startQuizSession()`, `submitAnswer()`, etc.
  - `D:/SlateCamp/slate-camp/src/lib/actions/testing.ts` -- 12+ exported functions
  - `D:/SlateCamp/slate-camp/src/lib/actions/trails.ts` -- 15+ exported functions
  - `D:/SlateCamp/slate-camp/src/lib/actions/notes-actions.ts` -- `createNote()`, `updateNote()`, etc.
  - `D:/SlateCamp/slate-camp/src/lib/actions/mastery.ts`
  - `D:/SlateCamp/slate-camp/src/lib/actions/streak.ts`
- **Severity:** HIGH
- **Issue:** These server actions accept raw TypeScript parameters without Zod validation. While `src/lib/validations/index.ts` defines schemas (`SubmitAnswerSchema`, `createSessionSchema`, etc.), they are NOT imported or used in most action files. The validation schemas exist but are orphaned.
- **Risk:** Type-level validation is compile-time only (and TS strict mode is OFF). Malformed input can cause database errors, unexpected behavior, or data corruption.
- **Fix:** Import and apply the existing Zod schemas at the entry point of each server action. For actions without schemas, create them.

### HIGH-004: `profiles.role` Column Not in Schema
- **File:** `D:/SlateCamp/slate-camp/DATABASE_SCHEMA.sql`
- **Severity:** HIGH
- **Issue:** CEO middleware checks `profiles.role` (line 84-88 in `src/lib/supabase/middleware.ts`) and CEO auth helper (`src/lib/queries/ceo/auth.ts`) queries `profiles.role`. But the `profiles` table in `DATABASE_SCHEMA.sql` has NO `role` column. The CEO dashboard migration (`20260325`) creates an index on `profiles.role` but never adds the column with `ALTER TABLE ADD COLUMN`.
- **Risk:** The `profiles.role` column may exist in production (added ad-hoc) but is undocumented. If the schema is recreated from `DATABASE_SCHEMA.sql`, CEO access control breaks silently -- queries return null, middleware falls through.
- **Fix:** Add `role TEXT` column to the `profiles` table definition in `DATABASE_SCHEMA.sql`. Add the `ALTER TABLE` to the CEO migration if not already applied.

### HIGH-005: `user_roles` and `audit_logs` Tables Missing from DATABASE_SCHEMA.sql
- **File:** `D:/SlateCamp/slate-camp/DATABASE_SCHEMA.sql`
- **Severity:** HIGH
- **Issue:** The schema file documents "50 tables" but omits:
  - `user_roles` (exists via migration `004_add_user_roles.sql`) -- critical for RBAC
  - `audit_logs` (exists via migration `007_add_audit_logs.sql`) -- queried in `getAdminDashboardData()`
- **Risk:** Schema documentation is the single source of truth (stated at line 6). Missing tables mean RLS policies, indexes, and constraints for these tables are undocumented and may drift.
- **Fix:** Add both tables with their full DDL, RLS policies, and indexes to `DATABASE_SCHEMA.sql`.

---

## Medium-Severity Findings

### MED-001: In-Memory Rate Limiter Not Production-Ready
- **File:** `D:/SlateCamp/slate-camp/src/lib/rate-limit.ts`
- **Severity:** MEDIUM
- **Issue:** Rate limiter uses an in-memory `Map()`. In a serverless environment (Vercel), each function invocation gets a fresh instance, making the rate limiter ineffective. The file itself notes "For production: replace with Vercel KV or Redis."
- **Risk:** Rate limiting on AI endpoints is non-functional in production. Attackers can spam AI endpoints, incurring significant API costs (Anthropic/OpenAI billing).
- **Fix:** Replace with Vercel KV or Upstash Redis rate limiting.

### MED-002: 24 `select('*')` Queries Over-Fetch Data
- **Files:**
  - `src/lib/actions/quiz.ts` (4 instances)
  - `src/lib/actions/testing.ts` (2 instances)
  - `src/lib/actions/trails.ts` (6 instances)
  - `src/lib/actions/notes-actions.ts` (2 instances)
  - `src/lib/actions/wiki-actions.ts` (4 instances)
  - `src/lib/actions/teach-back.ts` (1 instance)
  - `src/lib/actions/user-stats.ts` (2 instances)
  - `src/lib/actions/onboarding.ts` (1 instance)
  - `src/lib/actions/taxonomy.ts` (1 instance)
- **Severity:** MEDIUM
- **Issue:** `select('*')` fetches all columns including potentially sensitive fields (lemonsqueezy IDs, internal scores, admin metadata). Increases payload size and exposes schema structure.
- **Fix:** Replace each `select('*')` with explicit column lists.

### MED-003: Error Messages Leak Internal Details
- **Files:**
  - `src/lib/actions/admin/roles.ts` line 49: `throw new Error(\`Failed to assign role: ${error.message}\`)`
  - `src/lib/actions/admin/roles.ts` line 78: `throw new Error(\`Failed to revoke role: ${error.message}\`)`
  - `src/lib/actions/admin/content.ts` (multiple throw statements with Supabase errors)
  - `src/app/api/debug-taxonomy/route.ts` line 58: `return NextResponse.json({ error: err.message })`
- **Severity:** MEDIUM
- **Issue:** Supabase error messages can contain table names, column names, constraint names, and SQL state codes. These are returned directly to the client.
- **Fix:** Log full errors server-side, return generic error messages to clients.

### MED-004: `updateStreak` Accepts Raw userId Without Verification
- **File:** `D:/SlateCamp/slate-camp/src/lib/actions/streak.ts` (line 33)
- **Severity:** MEDIUM
- **Issue:** `updateStreak(userId: string)` accepts an arbitrary user ID parameter without verifying it matches `auth.uid()`. A caller could pass another user's ID. RLS prevents actual DB modification (the anon client is scoped), but the function design is insecure-by-default.
- **Fix:** Remove the `userId` parameter; derive it from `getUser()` inside the function.

### MED-005: `JSON.parse(response)` Without Error Handling in generate-questions
- **File:** `D:/SlateCamp/slate-camp/src/app/api/ai/generate-questions/route.ts` (line 62)
- **Severity:** MEDIUM
- **Issue:** `JSON.parse(response)` on raw LLM output without try/catch. If the AI returns malformed JSON (which happens), the route crashes with an unhandled exception.
- **Fix:** Wrap in try/catch and return a structured error.

### MED-006: AI Provider Default Temperature is 0.7, Not 0.0
- **File:** `D:/SlateCamp/slate-camp/src/lib/ai/provider.ts` (lines 59, 95)
- **Severity:** MEDIUM
- **Issue:** The AI provider defaults to `temperature: 0.7` when no override is specified. CLAUDE.md mandates "Temperature 0.0" for the AI Tutor. While the tutor route explicitly sets `temperature: 0`, any new caller of `getAIProvider().generateCompletion()` that forgets to set temperature will get non-deterministic output.
- **Fix:** Change default to `temperature: 0` or remove the default to force callers to specify.

---

## Low-Severity Findings

### LOW-001: `getAdminUsers()` Has No Auth Check
- **File:** `D:/SlateCamp/slate-camp/src/lib/actions/admin/roles.ts` (line 11)
- **Severity:** LOW
- **Issue:** `getAdminUsers()` lists all admin role assignments without checking the caller is an admin. Protected by middleware (only accessible from `/admin/settings`) and RLS (users can only read own roles). But as a server action, it could theoretically be called from any context.
- **Fix:** Add `canManageUsers()` check.

### LOW-002: Demo Mode Bypasses All Security
- **File:** `D:/SlateCamp/slate-camp/src/lib/supabase/middleware.ts` (lines 21-26)
- **Severity:** LOW
- **Issue:** When `NEXT_PUBLIC_DEMO_MODE=true`, middleware skips all auth checks and redirects login pages to dashboard. This is intentional for the demo experience but must never be enabled in production.
- **Fix:** Ensure `NEXT_PUBLIC_ENABLE_DEMO_MODE` is never set to `true` in production Vercel environment. Consider adding a build-time check.

### LOW-003: Hardcoded Admin Email in Migration
- **File:** `D:/SlateCamp/slate-camp/supabase/migrations/004_add_user_roles.sql` (line 104)
- **Severity:** LOW
- **Issue:** `philipjonlewis@gmail.com` is hardcoded as the initial super_admin. This is standard practice for bootstrapping but should be noted.
- **Fix:** No action needed -- this is a one-time seed. The email is visible in migration history.

### LOW-004: No Down Migrations
- **Files:** All 38 migration files in `supabase/migrations/`
- **Severity:** LOW
- **Issue:** No migration files contain rollback logic. All migrations are forward-only. Migration numbering gap: 016-021, then jumps to 032.
- **Risk:** Cannot roll back a bad migration without manual SQL.
- **Fix:** Acceptable for Supabase workflow (uses branching), but consider adding rollback comments.

### LOW-005: `models_3d.reviewed_by` Not FK-Constrained
- **File:** `D:/SlateCamp/slate-camp/DATABASE_SCHEMA.sql` (line 170)
- **Severity:** LOW
- **Issue:** `reviewed_by UUID` has no foreign key constraint to `auth.users(id)`. Data integrity not enforced at the DB level.
- **Fix:** Add `REFERENCES auth.users(id) ON DELETE SET NULL`.

---

## Schema & RLS Summary

### Tables with RLS Enabled (50 total):
All tables from `DATABASE_SCHEMA.sql` (44 core tables) + 6 from migrations (4 CEO tables + `user_roles` + `audit_logs`).

### Tables WITHOUT RLS (by design):
- `anon_diagnostic_sessions` -- documented server-only, 2-hour TTL, no user data

### RLS Policy Count: 89+ policies (77 in schema + 12+ from CEO migration + user_roles policies)

### Policy Quality Assessment:
- All user-data tables use `auth.uid() = user_id` pattern -- **CORRECT**
- Admin tables use `has_admin_role()` or `raw_app_meta_data ->> 'role' = 'admin'` -- **CORRECT but dual pattern**
- CEO tables use `is_ceo_or_super_admin()` via profiles.role -- **CORRECT**
- Content tables (questions, wiki, taxonomy, models) use `USING (true)` for SELECT -- **CORRECT** (public content)
- `notification_log` only has admin SELECT policy, no insert policy for server-side inserts -- **ACCEPTABLE** (service role bypasses RLS)

### Two Admin Role Check Patterns (Technical Debt):
1. **RLS policies** check `raw_app_meta_data ->> 'role' = 'admin'` (JWT metadata)
2. **Application code** checks `user_roles` table via `getUserRole()`
3. **CEO auth** checks `profiles.role` column

These three sources of role truth can diverge. A user could have a role in `user_roles` but not in JWT metadata, or vice versa.

---

## Migration Hygiene

| Metric | Value |
|--------|-------|
| Total migrations | 38 |
| Date range | 004 (unnumbered) to 20260325 |
| Naming convention | Mixed (`005_*` sequential + `20260320_*` dated) |
| Destructive operations | 0 (no DROP TABLE, DROP COLUMN, or TRUNCATE) |
| Down migrations | 0 |
| Schema file last regenerated | 2026-03-19 |
| Untracked migrations since schema regen | 6 (20260320 through 20260325) |
| Numbering gaps | 016-021 present, 022-031 missing, 032-039 present |

---

## Authentication Architecture

### Middleware (`middleware.ts` + `src/lib/supabase/middleware.ts`):
- Runs on every non-static request
- Bypasses: `/_next/*`, `/api/*`, static files, `/auth/callback`
- **WARNING:** `/api/*` is bypassed by middleware -- API routes must self-authenticate
- Public paths configurable via `PUBLIC_PATHS` constant
- Admin routes: checks `canReviewContent()` (user_roles table)
- CEO routes: checks `profiles.role` (profiles table)
- Developer routes: checks `user_roles` table for any role

### Server Actions Auth Pattern:
- User actions: `getUser()` from `src/lib/supabase/server.ts`
- Admin mutations: `canManageContent()` from `src/lib/admin/roles.ts`
- Admin reads: **NO auth check** (relies on middleware)
- CEO actions: `assertCeoRole()` from `src/lib/queries/ceo/auth.ts`

### API Route Auth Pattern:
- AI routes: `supabase.auth.getUser()` + rate limiting
- Webhook routes: signature verification (no user auth -- correct)
- Cron routes: `CRON_SECRET` Bearer token verification
- Debug route: **NO AUTH** (vulnerability)
- Admin flags: `isAdmin()` check

---

## Payment Security

| Check | Status |
|-------|--------|
| LemonSqueezy webhook signature verified | YES (`constructEvent()`) |
| PayRex webhook signature verified | YES (`parseEvent()`) |
| Checkout requires authentication | YES |
| Tier from webhook metadata, not client | YES (LemonSqueezy: `session.metadata?.tier`) |
| PayRex amount validated server-side | PARTIAL (`tierFromAmount()` used as fallback) |
| Subscription updates use service role | YES (`createAdminClient()`) |
| Free tier checkout blocked | YES (line 27-29 in checkout route) |

---

## Recommendations Priority Order

### Must Fix Before Launch (CRITICAL):
1. Add security headers to `next.config.ts`
2. Sanitize HTML in `question-card.tsx` with DOMPurify
3. Delete or auth-gate `/api/debug-taxonomy` route
4. Add auth checks to admin read functions

### Should Fix Soon (HIGH):
5. Add `profiles.role` column to `DATABASE_SCHEMA.sql`
6. Add `user_roles` and `audit_logs` tables to `DATABASE_SCHEMA.sql`
7. Apply Zod validation to all server action entry points
8. Sanitize user input before LLM injection

### Fix When Possible (MEDIUM):
9. Replace in-memory rate limiter with Vercel KV / Upstash
10. Replace all `select('*')` with explicit column lists
11. Sanitize error messages returned to clients
12. Change AI provider default temperature to 0

### Track (LOW):
13. Add FK constraint to `models_3d.reviewed_by`
14. Unify role-check patterns (JWT metadata vs user_roles table vs profiles.role)
15. Document demo mode production safeguards

---

## Appendix: File Index

| File | Relevance |
|------|-----------|
| `DATABASE_SCHEMA.sql` | Schema source of truth (50 tables, 89 RLS policies, 134 indexes) |
| `middleware.ts` | Root middleware -- delegates to supabase middleware |
| `src/lib/supabase/middleware.ts` | Auth enforcement for all routes |
| `src/lib/supabase/admin.ts` | Service role client (server-only) |
| `src/lib/supabase/server.ts` | Server component Supabase client |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/admin/roles.ts` | Role checking functions (getUserRole, canManageContent, etc.) |
| `src/lib/queries/ceo/auth.ts` | CEO role verification |
| `src/lib/validations/index.ts` | Zod schemas (13 schemas, many unused) |
| `src/lib/rate-limit.ts` | In-memory rate limiter (not production-ready) |
| `src/lib/ai/provider.ts` | AI provider abstraction (OpenAI + Anthropic) |
| `src/app/api/ai/tutor/route.ts` | AI Tutor endpoint |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | LemonSqueezy webhook handler |
| `src/app/api/webhooks/payrex/route.ts` | PayRex webhook handler |
| `src/app/api/payments/checkout/route.ts` | Checkout session creation |
| `src/app/api/debug-taxonomy/route.ts` | **UNAUTHENTICATED** debug endpoint |
| `src/lib/actions/social-proof.ts` | Cross-user data queries without auth |
| `src/components/shared/question-card.tsx` | Unsanitized HTML rendering |
| `src/components/wiki/ElaborativeInterrogation.tsx` | DOMPurify usage (correct pattern) |
| `next.config.ts` | Missing security headers |
| `.env.example` | Template with all env vars documented |
| `.gitignore` | Correctly excludes `.env`, `.env.local`, `.env.*.local` |
| `supabase/migrations/004_add_user_roles.sql` | RBAC table + RLS (not in schema doc) |
| `supabase/migrations/007_add_audit_logs.sql` | Audit log table (not in schema doc) |
| `supabase/migrations/20260325_ceo_dashboard.sql` | CEO tables + RLS + materialized views |
