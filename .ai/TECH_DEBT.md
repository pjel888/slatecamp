# Technical Debt & Risks

**Last updated:** 2026-05-09
**Sources:** Codebase audit, `known-issues.md`, `risk-register.md`, `legacy-retirement-plan.md`, `prelaunch-readiness.md`

---

## Critical

| Area | Issue | Severity | Evidence | Impact | Recommended Fix |
|------|-------|----------|----------|--------|-----------------|
| Database | No verified Supabase migration target | Critical | `.ai/01_roadmap/current-phase.md` milestone incomplete | Cannot verify schema integrity before launch | Create safe local/staging Supabase target; replay all 92 migrations |
| Database | Supabase types potentially stale | Critical | Types not regenerated since last schema changes | Type errors in database queries may be masked | Regenerate `src/types/supabase.ts` from verified schema |
| Deployment | Production/staging env not verified | Critical | README audit note; `.ai/01_roadmap/current-phase.md` | Unknown deployment risks | Access and verify deployment environment configuration |

---

## High

| Area | Issue | Severity | Evidence | Impact | Recommended Fix |
|------|-------|----------|----------|--------|-----------------|
| Schema | Objects referenced by code but absent from schema snapshot | High | `src/lib/cage/*`, preview actions, CEO queries reference objects not in `DATABASE_SCHEMA.sql` (audit_logs, cage_binding_tokens, materialized views) | Runtime errors if objects don't exist; confusion about actual schema | Audit all code references; either add to schema or remove callers |
| Schema | 76-table schema with 92 migrations; complex history | High | Migration count vs table count; rollback SQL in forward area | Hard to recreate from scratch; migration replay risks | Plan migration squash/reset for post-launch |
| Schema | Reset/seed scripts incomplete | High | `supabase/00_DROP_ALL_TABLES.sql` and `01_RESET_AND_SEED.sql` cover far fewer than 76 tables | Cannot reliably reset database | Replace with full baseline reset/seed or archive |
| Code | Pre-existing uncommitted source changes | High | `git status` shows 19 modified files + 3 untracked (landing, layout, marketing components) | Cannot release without reviewing; conflates with other work | Review and commit separately before any release |
| Code | Large Zustand quiz store | High | `src/stores/useQuizStore.ts` — documented complexity risk | Hard to test; hard to modify; regression risk | Split into focused slices (session, questions, timer, UI) |
| Code | Schema drift between app types and actual DB | High | `DATABASE_SCHEMA.sql` header claims 86 tables; parsed count is 76; types may not match | Type mismatches, query failures | Regenerate from live schema |

---

## Medium

| Area | Issue | Severity | Evidence | Impact | Recommended Fix |
|------|-------|----------|----------|--------|-----------------|
| Code | LemonSqueezy schema columns remain | Medium | `lemonsqueezy_customer_id`, `lemonsqueezy_subscription_id` in `DATABASE_SCHEMA.sql`, `src/types/supabase.ts`, `src/types/app.ts` | Dormant columns; cleanup confusion | Decide: remove in DB reset PR or document as deferred |
| Code | Deferred payment/AI code may bit-rot | Medium | PayRex routes, AI endpoints present but disabled; not tested with live providers | Code becomes stale; harder to re-enable later | Periodic smoke tests with mock providers |
| Route | Broad optional/internal route surface | Medium | 105+ routes including CEO, developer, pods, DAE, studio, professional, results-day | Unclear what's launch-critical vs internal | Founder cutline decision; hide non-launch from nav |
| Test | Full release matrix not run | Medium | `test:e2e`, `validate:release`, `perf:all` not executed in recent passes | Unknown regressions; performance surprises | Run full matrix in CI/staging before external launch |
| Docs | Route count inconsistency | Medium | README says 118; `.ai/routes.md` says 128; `find` returns ~105 | Confusion about actual route count | Standardize counting methodology; document it |
| Docs | Schema header/count drift | Medium | `DATABASE_SCHEMA.sql` header claims different counts than parsed results | Misleading documentation | Update header to match actual counts |
| Deps | Unused UI primitives and their dependencies | Medium | `react-day-picker`, `@radix-ui/react-tooltip`, `react-resizable-panels` tied to components with no app imports | Unnecessary bundle size; maintenance burden | Remove unused primitives and their deps |
| Code | Unused trail lifecycle mutations | Medium | `pauseTrail`, `resumeTrail`, `abandonTrail` in `src/lib/actions/trails.ts` with no callers | Dead code; confusion | Delete or wire to UI |
| Arch | Demo mode pervasive coupling | Medium | `src/lib/demo/config.ts` used in middleware, tests, and auth flows | Production behavior may diverge from demo | Keep for tests; document production vs demo paths clearly |

---

## Low

| Area | Issue | Severity | Evidence | Impact | Recommended Fix |
|------|-------|----------|----------|--------|-----------------|
| Docs | Compatibility mirrors need cleanup | Low | `api-surface.md`, `data-model.md`, `testing-and-quality.md`, `known-gaps.md` are compatibility pointers | Extra files; navigation confusion | Delete after confirming no remaining references |
| Docs | Storybook placeholder baseline noisy | Low | `bun run check:storybook` reports many cleaned/removed baseline files | Confusing output | Simplify or empty baseline |
| Code | Stale developer API reference | Low | `src/lib/developer/api-reference-data.ts` references `/api/debug-taxonomy` which doesn't exist | Incorrect API documentation | Remove or mark historical |
| Code | `__pycache__` artifact tracked in git | Low | `.codex/skills/ui-ux-pro-max/scripts/__pycache__/core.cpython-311.pyc` is tracked | Commit hygiene | Remove from tracking; add to `.gitignore` |
| Config | `rollback_lea_to_ale.sql` in forward migrations | Low | Rollback file in `supabase/migrations/` with no-op/corrupt content | Confusion during migration replay | Archive outside forward migrations |
| Deps | `payrex-node` / axios path removed but verification incomplete | Low | Removed from active dependency graph but full audit not done | Residual references may remain | Full grep for residual axios/payrex-node references |

---

## Risk Register Cross-Reference

This file supplements `risk-register.md`. For risk tracking with IDs, owners, and classifications, see that file. Key risks from the register:

| Risk ID | Description | Status |
|---------|-------------|--------|
| R-001 | Broad optional/internal route surface | Launch warning |
| R-002 | Legacy LemonSqueezy schema/type columns | Deferred technical debt |
| R-003 | PayRex live checkout/webhook not verified | Deferred post-launch |
| R-004 | Live AI provider behavior not verified | Deferred post-launch |
| R-005 | Pre-existing dirty source changes | Commit/review risk |
| R-006 | Full release/performance matrix not fully run | Release warning |
| R-007 | Generated pycache artifact is dirty | Commit hygiene risk |

---

## Known Issues Cross-Reference

This file supplements `known-issues.md`. See that file for the launch-focused issue tracker.
