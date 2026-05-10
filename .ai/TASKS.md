# Task List

**Last updated:** 2026-05-09
**Derived from:** `ROADMAP.md`, `.ai/01_roadmap/current-phase.md`, codebase audit
**Priorities:** P0 = Critical/Blocking | P1 = Important | P2 = Useful | P3 = Optional

---

## Active Tasks

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P0 | Create/restore safe Supabase verification target | In Progress | Local Supabase instance running with verified migration target | `supabase/config.toml`, local Supabase | 2026-05-05 milestone; needs verify |
| P0 | Replay all 101 migrations on verified target | Todo | All migrations apply cleanly; no errors | `supabase/migrations/` | 2026-05-05 milestone |
| P0 | Verify AI audit access-control migration | Todo | Migration `20260505145349` applies correctly | `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql` | 2026-05-05 milestone |
| P0 | Regenerate Supabase types from verified schema | Todo | `src/types/supabase.ts` matches live schema | `src/types/supabase.ts` | Must run after migration replay |
| P0 | Rerun full validation gate after type regeneration | Todo | `bun run type-check`, `bun run lint`, `bun run test` all pass | `package.json` scripts | 2026-05-05 milestone |
| P0 | Verify production/staging deployment env | Todo | Env vars confirmed (names only); deployment targets identified | `.env.local`, deployment platform | Launch blocker |
| P1 | Complete landing page refactoring | In Progress | Four pillars visible; messaging gate applied; all sections render | `src/components/landing/`, `src/components/marketing/` | Working tree has uncommitted changes |
| P1 | Review and commit pre-existing dirty source changes | Todo | Landing, sidebar, 3D Lab diffs reviewed; committed separately | Multiple files in working tree | Documented risk R-005 |
| P1 | Human-review broad .ai/docs diff before commit | Todo | All .ai/ changes semantically reviewed | `.ai/` folder | 2026-05-05 milestone |

## Database & Schema Tasks

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P1 | Decide on LemonSqueezy column cleanup | Todo | Decision documented; either columns removed or deferred | `DATABASE_SCHEMA.sql`, `src/types/supabase.ts`, `src/types/app.ts` | Deferred technical debt |
| P1 | Resolve schema objects without snapshot coverage | Todo | All app-referenced objects either in schema or removed | `src/lib/cage/`, `src/lib/actions/preview-actions.ts`, CEO queries | Schema drift risk |
| P2 | Regenerate DATABASE_SCHEMA.sql from live DB | Todo | Schema snapshot matches live database | `DATABASE_SCHEMA.sql` | Only if drift confirmed |
| P2 | Update stale reset/seed scripts | Todo | Scripts cover all 76 tables | `supabase/00_DROP_ALL_TABLES.sql`, `supabase/01_RESET_AND_SEED.sql` | Currently incomplete |
| P2 | Archive rollback migration from forward migrations | Todo | `rollback_lea_to_ale.sql` moved out of `supabase/migrations/` | `supabase/migrations/rollback_lea_to_ale.sql` | Already done? Verify |

## Landing & Public Surface Tasks

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P1 | Implement four-pillar landing structure | In Progress | Knowledge Resources, Quizzes, 3D Lab, Free Tools sections visible | `src/app/page.tsx`, `src/components/landing/` | Per 2026-05-07 messaging gate |
| P1 | Add university/educator positioning | Todo | University partnership language present; legal boundaries clear | Landing components | Per positioning plan |
| P2 | Make free tools visible as acquisition surface | Todo | Tools linked from landing page | `src/app/tools/`, landing components | |
| P2 | SEO title/meta optimization | Todo | Title, description, OG tags aligned with messaging | `src/app/layout.tsx`, page metadata | Per messaging gate |

## Route & Navigation Tasks

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P1 | Founder cutline review of optional routes | Todo | Decision per surface: keep/hide/delete | CEO, developer, pods, DAE, studio, professional, results-day routes | Product decision needed |
| P2 | Update sidebar navigation to match cutline | Todo | Sidebar only shows launch-critical items | `src/components/sidebar/sidebar-constants.ts` | Depends on cutline decision |
| P2 | Audit public navigation for launch readiness | Todo | No links to deferred/disabled features | All nav components | |

## Testing & QA Tasks

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P1 | Run full test:e2e suite | Todo | All Playwright specs pass | `e2e/*.spec.ts` | Core suite passes; full suite not run |
| P1 | Run validate:release | Todo | All gates pass (type-check, lint, entitlements, build, e2e) | `package.json` scripts | Broad validation pipeline |
| P2 | Run perf:all suite | Todo | Performance metrics acceptable | `.ai/00_performance/scripts/` | 3D Lab perf critical |
| P2 | Set up CI/staging test automation | Todo | Automated test runs on PR/merge | CI config | Depends on deployment env |
| P3 | Add coverage reporting | Todo | Coverage reports generated and tracked | `bun test --coverage` | No coverage reporter currently |

## Code Quality Tasks

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P2 | Refactor large quiz store | Todo | Store split into focused slices; tests pass | `src/stores/useQuizStore.ts` | Complexity risk |
| P2 | Remove unused UI primitives and dependencies | Todo | Unused components/deps removed; build passes | `src/components/ui/` (bottom-navigation, dropdown-menu, etc.) | Storybook-only components |
| P2 | Migrate WikiReference to canonical tooltip | Todo | Radix tooltip dependency removed | `src/components/wiki/shared/WikiReference.tsx`, `src/components/ui/tooltip.tsx` | Duplicate dependency |
| P2 | Remove unused trail lifecycle mutations | Todo | `pauseTrail`, `resumeTrail`, `abandonTrail` removed or wired | `src/lib/actions/trails.ts` | No current callers |
| P3 | Simplify Storybook placeholder baseline | Todo | Baseline cleaned after no placeholder markers remain | `scripts/storybook-placeholder-baseline.ts` | Low priority |

## Deferred Tasks (Post-Launch)

| Priority | Task | Status | Acceptance Criteria | Related Files | Notes |
|----------|------|--------|---------------------|---------------|-------|
| P3 | PayRex staging checkout/webhook QA | Deferred | Checkout flow works; webhooks processed; subscriptions created | `src/lib/payrex/`, payment routes | Only before paid launch |
| P3 | Live AI provider smoke tests | Deferred | OpenAI/Anthropic calls work with live keys | `src/lib/ai/`, AI routes | Only before AI launch |
| P3 | Re-enable AI helper UI in quiz | Deferred | FeedbackPanel AI helpers visible and working | `src/components/quiz-v2/FeedbackPanel.tsx` | Only after AI verification |
| P3 | Mobile device performance testing | Deferred | Acceptable FPS on mid-range Android for 3D Lab | 3D Lab components | |

---

## Completed (This Audit Pass)

| Task | Completed | Notes |
|------|-----------|-------|
| .ai folder audit | 2026-05-09 | AUDIT_REPORT.md created |
| Implementation status documentation | 2026-05-09 | IMPLEMENTATION_STATUS.md created |
| Project context documentation | 2026-05-09 | PROJECT_CONTEXT.md created |
| Architecture documentation update | 2026-05-09 | ARCHITECTURE.md updated |
| Roadmap creation | 2026-05-09 | ROADMAP.md created |
| Task list creation | 2026-05-09 | This file |
| Tech debt documentation | 2026-05-09 | TECH_DEBT.md created |
| Decisions documentation | 2026-05-09 | DECISIONS.md created |
| Agent instructions | 2026-05-09 | AGENT_INSTRUCTIONS.md created |
| .ai/README.md update | 2026-05-09 | Updated with new files and reading order |
