# Concerns & Technical Debt

## Critical

### 1. TypeScript Strict Mode Disabled
- `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` in `tsconfig.json`
- 25 `as any` casts across 10 files, concentrated in:
  - `src/lib/actions/analytics.ts` (7 casts)
  - `src/lib/actions/dashboard-page.ts` (6 casts)
  - `src/lib/workflow/content-workflow.ts` (3 casts)
  - `src/lib/admin/get-admin-profile.ts` (3 casts)
- **Risk:** Runtime type errors silently pass compilation

### 2. In-Memory Rate Limiter
- `src/lib/rate-limit.ts` uses a `Map()` — resets on every deploy/restart
- Comment in code: "For production: replace with Vercel KV or Redis"
- **Risk:** No rate limiting in production across serverless instances

### 3. AI Provider Uses Raw Fetch (No SDK Patterns)
- `src/lib/ai/provider.ts` — Manual fetch to OpenAI/Anthropic APIs
- No retry logic, no error handling for rate limits, no streaming error recovery
- No response validation — trusts JSON shape from providers
- Uses `gpt-4o` (outdated model reference)
- **Risk:** Silent failures, no observability, no cost tracking

### 4. Admin Client Bypasses RLS
- `src/lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY`
- No RLS context, no audit trail for admin operations
- **Risk:** Admin actions not constrained by row-level security policies

## High

### 5. Low Test Coverage
- Only 11 test files for 685 source files (~1.6% file coverage)
- No E2E tests, no integration tests, no CI test pipeline
- Untested: auth flows, middleware, webhooks, AI endpoints, wiki, payments
- **Risk:** Regressions go undetected

### 6. Webhook Security
- Stripe webhook: needs verification that `STRIPE_WEBHOOK_SECRET` comparison is timing-safe
- PayRex webhook: needs audit of signature verification
- **Risk:** Webhook forgery if verification is incomplete

### 7. Large Server Action Files
- `dashboard-page.ts` (837 lines), `quiz.ts` (809 lines), `analytics.ts` (627 lines)
- Multiple concerns mixed in single files
- **Risk:** Maintenance burden, merge conflicts, hard to test

### 8. Demo Mode Mock Client
- `src/lib/demo/mock-supabase.ts` — Mock client with incomplete operator support
- Used when `NEXT_PUBLIC_SUPABASE_URL` is absent
- Returns fake data without validation
- **Risk:** Demo behavior may diverge from production, masking real bugs

## Medium

### 9. No Background Job System
- Cron jobs (`blindspot-scan`, `compute-signals`) run as API routes
- No retry queue, no dead-letter handling, no transaction boundaries
- **Risk:** Failed cron runs silently drop work

### 10. Missing Audit Logging
- `src/lib/audit/` exists but coverage unclear
- Admin actions (question CRUD, wiki edits) need audit trails
- **Risk:** No visibility into who changed what

### 11. Font Loading Complexity
- Root layout loads 4 fonts: Inter, Syne, DM Mono, GeistSans
- CLAUDE.md says primary font is Inter, but GeistSans also imported
- **Risk:** Unnecessary bandwidth, potential FOUT/layout shift

### 12. Wiki Slug Resolution
- `src/lib/actions/wiki-actions.ts` — Slug collision behavior undefined
- Error handling may silently swallow failures
- **Risk:** Broken wiki navigation edge cases

## Low

### 13. Unused/Duplicate Dependencies
- Both `shadcn` and `shadcn-ui` in package.json
- Both `radix-ui` and individual `@radix-ui/*` packages
- `add` package (likely accidental `npm add`)
- `resizable` alongside `react-resizable-panels`
- **Risk:** Bloated bundle, version conflicts

### 14. Missing Error Boundaries
- No visible React error boundaries in component tree
- Client errors may crash entire page segments
- **Risk:** Poor error UX for users

### 15. No Structured Logging
- Mix of console.log/error patterns, no structured logging library
- **Risk:** Hard to debug production issues

## Scaling Concerns

- **Heatmap rendering** — May degrade at 10K+ interactions
- **Wiki sidebar tree** — Recursive search without memoization, O(n) per route change
- **Readiness calculation** — Complex IRT computation, potential >5s at scale
- **localStorage** — Used for quiz persistence, unbounded growth potential
