# Agent Instructions

**Last updated:** 2026-05-09
**Audience:** Future AI/code agents working in this repository
**Purpose:** Practical, direct instructions for safe and effective work in this codebase

---

## Project Summary

**SlateCamp** is a Next.js 16 App Router application for Philippine LEA (Architecture board exam) preparation. It has 128 page routes, 652 components, 76 database tables, 150 server action files, and 88 test files. It's a pre-launch MVP — broad functionality but not yet production-hardened.

**Current launch stance:** Payment-free and learner-facing live-AI-provider-free. Payments (PayRex) and public learner AI are deferred post-launch. Internal developer AI is separate local tooling and is Codex-first with GPT-5.5 where available; OpenRouter is reserved for app/runtime learner/user AI when intentionally enabled.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 (App Router) |
| UI | React 19.2.5, TypeScript 5.9.3 |
| Styling | Tailwind CSS 4.2.4 |
| Backend | Supabase (PostgreSQL + Auth) |
| State | Zustand 5 |
| 3D | React Three Fiber, drei, Three.js |
| Testing | Bun test, Playwright, Storybook |
| Package Manager | Bun |
| App AI provider layer | `src/lib/ai/provider.ts` with OpenRouter preferred and OpenAI/Anthropic legacy fallbacks; learner-facing live AI remains deferred |
| Developer AI | Codex-first with GPT-5.5 where available; Hermes should use `openai-codex` when used as coordinator; OpenCode/Command Code/Kimi remain specialized optional worker lanes |

## Important Commands

### Always Safe to Run
```bash
bun run type-check        # TypeScript checking
bun run lint              # ESLint + Storybook guard
bun run test              # Unit/integration tests (bun test src/)
bun run check:storybook   # Storybook placeholder validation
bun run design:lint       # Design.md validation
bun run build             # Production build
bun run check:entitlements # Entitlement legacy usage check
```

### Supabase Verification Protocol

For any Supabase, RLS, migration, RPC, grant, policy, database-client, server-action, or query change, read and follow `.ai/00_system/supabase-change--protocol--v1.md` before editing.

Minimum expectations:
- Capture Supabase Advisor and lint baselines before SQL work when linked access is available.
- Treat advisor warnings as acceptance criteria, not optional cleanup.
- New public tables need RLS plus intentional policies; do not disable RLS to silence warnings.
- SECURITY DEFINER functions need callsite review, fixed grants, and advisor verification.
- Validate migrations with lint, dry-run, and rollback smoke before live apply.
- After any live apply, rerun advisors/lint and record remaining warning names in an `.ai/02_audits/` note.

### Context-Dependent (Safe in Dev, Verify Before Running in CI/Prod)
```bash
bun run test:e2e:smoke    # Quick Playwright smoke tests
bun run test:e2e:prod     # Production E2E tests
bun run test:e2e:auth-demo # Auth demo E2E tests
bun run perf:3d:gates     # 3D Lab performance gates
```

### Commands to Avoid
- Never run `rm -rf` or destructive file operations without explicit approval
- Never run destructive database commands without explicit approval
- Never run `git push --force` to main/master
- Never run `git reset --hard` or `git clean -fd` without confirmation
- Do not install packages without understanding the dependency impact
- Do not run `npm install` — use `bun install`

## Key Files/Folders

### Must Read Before Starting
- `README.md` — Comprehensive project overview (2000+ lines)
- `AGENTS.md` — Root agent governance
- `DESIGN.md` — Design system contract
- `DATABASE_SCHEMA.sql` — Canonical schema snapshot
- `package.json` — All available scripts and dependencies

### .ai/ Reading Order
1. `PROJECT_CONTEXT.md` — What this project is
2. `06_specs/architecture--spec--v3.md` — How it's built
3. `10_state/implementation-status--state--v2.md` — What's done
4. `01_roadmap/roadmap--state--v1.md` — Where we're going
5. `04_tasks/tasks--state--v1.md` — What to work on
6. `10_state/tech-debt--state--v1.md` — Known problems
7. `10_state/decisions--state--v1.md` — Why things are this way
8. `AGENT_INSTRUCTIONS.md` — This file

### Source Code Entry Points
| Task | Start Here |
|------|-----------|
| Routes/pages | `src/app/<route>/page.tsx` |
| Auth/access | `middleware.ts` → `src/lib/supabase/middleware.ts` → `src/lib/entitlements/` |
| Database queries | `DATABASE_SCHEMA.sql` → `src/lib/queries/` |
| Server mutations | `src/lib/actions/<domain>/` |
| Design/UI | `DESIGN.md` → `src/app/globals.css` → `src/components/ui/` |
| 3D Lab | `src/features/3d-lab/` |
| Quiz engine | `src/stores/useQuizStore.ts` → `src/components/quiz-v2/` → `src/lib/actions/quiz-v2/` |
| Wiki | `src/components/wiki/` → `src/lib/actions/wiki-actions.ts` |
| Admin | `src/app/admin/` → `src/lib/actions/admin/` |

## Coding Conventions Observed

1. **Server Components by default** — Only add `"use client"` when browser APIs are needed
2. **Server Actions for mutations** — Not REST endpoints (except for AI, cron, payments, webhooks)
3. **TypeScript strict** — No `as any`, `@ts-ignore`, or `@ts-expect-error`
4. **Tailwind utility classes** — Not CSS modules or styled-components
5. **shadcn/Radix UI patterns** — UI primitives in `src/components/ui/`
6. **Zustand for client state** — Keep stores focused; avoid giant stores
7. **Route groups** — `(auth)`, `(protected)`, `(admin-public)` for layout grouping
8. **Route-level loading/error** — `loading.tsx` and `error.tsx` per route segment
9. **Feature flags** — Use `src/config/feature-flags.ts` for gating
10. **Environment variables** — `NEXT_PUBLIC_*` for client-exposed; server-only for secrets; OpenRouter keys are app/runtime server secrets for learner/user AI, not default developer-agent credentials

## Testing Expectations

- Run `bun run type-check` after any TypeScript changes
- Run `bun run lint` after any code changes
- Run `bun run test` after logic changes
- Run relevant Playwright E2E tests after route/UI changes
- Run `bun run build` before considering work complete
- LSP diagnostics must be clean on changed files

## Documentation Expectations

- Update `README.md` when routes, features, or architecture change
- Update relevant `.ai/` docs when implementation reality changes
- Never copy secrets into documentation
- Cite file paths as evidence for claims
- Distinguish between: implemented, partially implemented, not implemented, obsolete, unknown

## Known Pitfalls

1. **Large Zustand quiz store** (`useQuizStore.ts`) — Complex; test thoroughly
2. **3D Lab is performance-sensitive** — Check on mobile before shipping changes
3. **Demo mode is pervasive** — Test both demo and live auth paths
4. **Schema drift** — `DATABASE_SCHEMA.sql` may not match live DB exactly
5. **LemonSqueezy columns still exist** — Don't reintroduce LemonSqueezy runtime
6. **Landing page has uncommitted changes** — Check `git status` before working on landing
7. **Route count varies by counting method** — Don't get hung up on exact number
8. **Some deps may be unused** — `react-day-picker`, Radix tooltip, resizable panels tied to unused UI primitives
9. **PayRex code is retained but disabled** — Don't accidentally enable payments
10. **OpenRouter boundary** — OpenRouter is for app/runtime learner and user AI when intentionally enabled; developer AI is Codex-first with GPT-5.5 where available

## Current Top Priorities

1. Supabase verification target and migration replay (launch blocker)
2. Landing page refactoring completion (active in working tree)
3. Production/staging deployment environment verification

## What NOT to Touch Without Human Approval

- `.env`, `.env.local`, or any file containing secrets
- `supabase/migrations/` — migration files (additive only; never modify existing)
- Production database state
- `middleware.ts` auth logic
- `src/lib/supabase/middleware.ts` session handling
- `src/lib/entitlements/` authorization logic
- Billing/payment configuration (`NEXT_PUBLIC_PAYMENTS_ENABLED`)
- DNS, deployment configuration, or hosting settings
- Any `AGENTS.md` files without understanding their governance role
