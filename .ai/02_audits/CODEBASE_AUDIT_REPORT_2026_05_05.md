# Codebase Audit Report

Date: 2026-05-05
Repository: /Users/philiplewis/slatecamp
Branch audited: redesign/quiz-mode-hub
Audit mode: Read-only inspection, with safe validation commands. The only intentional file write is this report.
Report location: .ai/02_audits/CODEBASE_AUDIT_REPORT_2026_05_05.md

Note on requested path: the prompt requested AI/AUDITS/..., but the repository has no AI/ directory. The existing canonical project intelligence folder is .ai/, and .ai/00_system/ai-folder-canonical-map.md designates .ai/02_audits as the active audit entrypoint. To follow the instruction to use the existing .ai folder and inspect existing folders before creating new ones, this report was written to .ai/02_audits instead of creating a new top-level AI/ tree.

## 1. Executive Summary

Overall production readiness verdict: Beta-ready / soft-launch ready, not full production-ready yet.

SlateCamp is a broad pre-launch LEA prep platform with substantial implemented product surface: public marketing, Supabase auth, onboarding, dashboard, quiz v2, wiki, 3D Lab, SRS/focus review, analytics, notes, admin CMS, developer portal, CEO portal, tools/calculators, and deferred payment/AI provider code. The app builds, typechecks, lints with warnings only, passes 715 Bun tests, 53 DOM/component tests, 42 production smoke/access-boundary E2E tests, and entitlement legacy checks. Payment and live AI provider behavior are explicitly deferred and were not treated as blockers.

Biggest strengths:
- Large implemented feature set with real route, component, action, database, and test coverage.
- Strong Supabase/auth architecture in many places: middleware gating, admin/developer/CEO entitlements, server actions with tests, cron jobs, and RLS migrations.
- Good QA baseline: type-check, lint, unit tests, DOM tests, production smoke E2E, build, Storybook guard, and entitlement checks all pass.
- Mature operational documentation system under .ai with roadmap, state, audit, plans, performance, fact-checking, content-optimization, and source-of-truth docs.
- Current launch stance is clearly payment-free/live-AI-provider-free in README and .ai/deferred-integrations.md.

Biggest risks:
- Production debug/test routes are still in the built route surface, including routes that use SUPABASE_SERVICE_ROLE_KEY server-side.
- Cron endpoints compare Authorization against `Bearer ${process.env.CRON_SECRET}` without first requiring CRON_SECRET to exist. If CRON_SECRET is missing, `Bearer undefined` can authorize service-role cron work.
- AI audit database views/functions created by 20260501085339 grant broad authenticated access to sensitive audit/question overview surfaces, including question text/correct_option_id and content previews.
- Schema source-of-truth drift is high: DATABASE_SCHEMA.sql, schema.sql, db-spec.json, migrations, and app code disagree. DATABASE_SCHEMA.sql is stale/incomplete relative to migrations and app references; schema.sql is empty.
- .ai governance/state/roadmap docs are valuable but stale in key places: canonical map says numbered-only while live .ai contains unnumbered workstream folders; roadmap/current-state counts and content-optimization status are outdated.
- Dependency audit finds 13 vulnerabilities through payrex-node -> axios. Payment is deferred, but the vulnerable dependency remains installed in production dependency graph.

Recommended next move:
Fix the production blockers in this order: hard-gate/remove debug routes, fail-close cron secrets, restrict AI audit views/functions at DB layer, reconcile schema source-of-truth, then refresh .ai state/roadmap. After those changes, rerun the passing gate set plus staging E2E/auth-demo before public launch.

## 2. Production Readiness Verdict

Verdict: Beta-ready / soft-launch ready.

Reasoning:
- The product compiles and key validation gates pass:
  - `bun run type-check`: passed.
  - `bun run lint`: passed with 0 errors and 16 warnings.
  - `bun run test`: 715 pass, 0 fail across 84 files.
  - `bun run test:dom`: 53 pass, 0 fail across 8 files.
  - `bun run build`: passed on Next.js 16.2.3/Turbopack; generated 107 static pages and the full route manifest.
  - `bun run check:entitlements`: passed.
  - `bun run test:e2e:prod`: 42 pass, 0 fail.
- The implemented app surface is real, not merely scaffolded: README feature table and live route tree align broadly, and key flows have corresponding pages/components/actions/tests.
- However, there are security and operations blockers that should be fixed before full production: debug service-role routes, cron fail-open-on-missing-secret behavior, AI audit DB grants, schema drift, and dependency vulnerabilities.

What is acceptable to defer:
- Paid checkout/payment launch. Evidence: README.md:11-14 and .ai/deferred-integrations.md:5-10 say payment-free launch is intentional; src/lib/constants/feature-flags.ts:6-13 defaults payments off; src/app/dashboard/upgrade/page.tsx:24-27 redirects away when payments are disabled; src/app/api/payments/checkout/route.ts:23-29 returns 503 when payments are disabled.
- Live AI chatbot/provider launch. Evidence: README.md:44-45 and .ai/deferred-integrations.md:11 mark AI provider behavior deferred. AI endpoint code exists at src/app/api/ai/tutor/route.ts:6-101, but live provider QA is future-scope under current cutline.
- LemonSqueezy runtime behavior. Evidence: .ai/deferred-integrations.md:10 says runtime code is removed/deferred and only legacy schema/type references remain.
- Full broad performance suite and paid-provider smoke tests, provided public launch scope stays payment-free/live-AI-free.

What is not acceptable to defer for production:
- Public/ordinary-authenticated access to debug routes that use service-role keys or expose internal article compile/debug data.
- Cron endpoints authorizing when CRON_SECRET is unset.
- Broad authenticated access to AI audit views/functions exposing answer-key/content-review data.
- Unreconciled schema source-of-truth before production DB operations/migration governance.
- Known high dependency vulnerabilities in production dependency graph, even if reached through deferred PayRex dependency.

## 3. Repository Overview

Tech stack:
- Next.js 16.2.3 App Router, React 19.2.5, TypeScript 5.9.3, Tailwind 4.2.4.
- Bun-first package management; only bun.lock exists at repo root.
- Supabase PostgreSQL/Auth/Storage style app architecture using @supabase/ssr and @supabase/supabase-js.
- UI: internal component system, Base UI/Radix-style primitives, shadcn, TipTap, R3F/Three/Drei, Recharts, MDX via next-mdx-remote.
- Testing: Bun unit tests, Vitest/jsdom DOM tests, Playwright E2E, Storybook, custom performance scripts.

Evidence:
- package.json:5-90 defines scripts.
- package.json:92-150 lists production dependencies.
- package.json:152-177 lists devDependencies.
- package.json:131 shows Next 16.2.3.
- package.json:136-138 shows React/React DOM 19.2.5.
- package.json:174 shows Supabase CLI 2.98.0.
- `date` command confirmed audit date: 2026-05-05 13:57:16 PST.

Main application structure:
- src/app: App Router routes, layouts, loading/error boundaries, route handlers.
- src/components: dashboard, admin, wiki, quiz, UI, shared components.
- src/features: larger feature modules, especially 3D Lab and wall configurator.
- src/lib: Supabase helpers, actions, queries, entitlements, quiz, SRS, AI, payments, logging.
- src/hooks, src/stores, src/config, src/data, src/types, tests, e2e.
- supabase/migrations: 101 SQL migration files.
- .ai: operational intelligence/governance/docs/plans/audits/content workflows.

Live inventory from read-only script:
- page.tsx routes: 134.
- layout.tsx files: 15.
- loading.tsx files: 104.
- error.tsx files: 8.
- route handlers: 11 route.ts + 1 route.tsx.
- migrations: 101.
- Storybook story files: 100.
- e2e specs: 18.
- src test-like files: 89.

Key entry points:
- Public app: src/app/page.tsx.
- Root request middleware: middleware.ts:4-27 calling src/lib/supabase/middleware.ts.
- Dashboard shell: src/app/dashboard/layout.tsx and src/components/dashboard/DashboardLayoutContent.tsx.
- Admin portal: src/app/admin/layout.tsx and src/app/admin/page.tsx.
- Quiz hub/session/results: src/app/dashboard/quiz/* and src/components/quiz-v2/*.
- Wiki: src/app/dashboard/wiki/* and src/components/wiki/*.
- 3D Lab: src/app/dashboard/3d-lab/* and src/features/3d-lab/*.
- API route handlers: src/app/api/admin/flags, src/app/api/ai/*, src/app/api/cron/*, src/app/api/payments/checkout, src/app/api/webhooks/payrex.

Database/Supabase structure:
- DATABASE_SCHEMA.sql says it was updated 2026-04-07 and claims 86 tables, 2 views, 39 functions at lines 2-3, but parsed live contents show fewer CREATE statements and it omits newer migration-created objects.
- schema.sql is empty at line 1.
- db-spec.json is a PostgREST API spec with a Supabase host at lines 2-8 and diverges from both DATABASE_SCHEMA.sql and migrations.
- supabase/migrations contains 101 SQL files with mixed filename conventions and a rollback_lea_to_ale.sql file inside the active migration directory.

Testing/build/deployment setup:
- package.json scripts: build, lint, type-check, test, test:dom, Playwright E2E, validate:release, content-audit, perf scripts.
- .github/workflows/storybook.yml runs install, Playwright install, validate:release, and Storybook build on PR/push to main/master.
- .github/workflows/3d-performance-warning.yml runs warning-mode 3D performance gates on 3D/perf-related changes.
- vercel.json:1-12 configures two cron routes.
- next.config.ts:3-20 sets security headers, including CSP; next.config.ts:43-120 defines redirects; next.config.ts:123-131 has server action body size and Turbopack root.

## 4. Implemented Features

| Feature | Status | Evidence | Notes/Risks |
|---|---|---|---|
| Public marketing landing/about/contact/pricing/try | Implemented | README.md:24-26; src/app/page.tsx; build route manifest includes /, /about, /contact, /pricing, /try | Production E2E public routes passed. |
| Auth and onboarding | Implemented | README.md:27; middleware.ts:4-27; src/lib/supabase/middleware.ts gates routes; build manifest includes /login, /register, /forgot-password, /auth/reset-password, /onboarding | Auth redirects passed in E2E. |
| Dashboard shell | Implemented | README.md:28; src/app/dashboard/page.tsx; src/components/dashboard/DashboardLayoutContent.tsx | High complexity component; broad blast radius. |
| Quiz engine v2 | Implemented | README.md:29-30; build manifest includes /dashboard/quiz, session/results/review routes; src/lib/actions/quiz-v2 tests pass | Large client store remains a maintainability risk. |
| Legacy quiz/drills redirects | Implemented | README.md:30; next.config.ts:65-119 | Both /quiz and /dashboard/drills compatibility exists. |
| Wiki learning system | Implemented | README.md:31; build manifest includes /dashboard/wiki and /dashboard/wiki/[articleId] | README still says /dashboard/wiki/[slug] at line 31; route is now [articleId] in build manifest. Documentation mismatch. |
| Camp Trails | Implemented | README.md:32; build manifest includes /dashboard/camptrails routes | Lint warnings in camptrails/[slug]/page.tsx for unused variables. |
| 3D Lab | Implemented/gated | README.md:33; src/app/dashboard/3d-lab/page.tsx; src/features/3d-lab tests pass | Performance-sensitive; dedicated warning gates exist. |
| Area C design practice | Implemented | README.md:34; build manifest includes /dashboard/area-c/* | Appears user-facing. |
| Assessment diagnostic | Implemented | README.md:35; build manifest includes /dashboard/assessment | Requires authenticated route. |
| Readiness and analytics | Implemented | README.md:36; build manifest includes /dashboard/analytics and /advanced | Uses dashboard and mastery actions. |
| SRS / Focus Review | Implemented | README.md:37; build manifest includes flash/cram-card and /api/cron/focus-review-scan | Cron auth bug blocks production until fixed. |
| Notes workspace | Implemented | README.md:38; build manifest includes /dashboard/notes | Uses TipTap and notes tables. |
| Notifications/settings | Implemented | README.md:39; build manifest includes /dashboard/notifications and /settings | User-facing. |
| Settings and deferred billing | Partial/deferred payment | README.md:40; src/lib/constants/feature-flags.ts:6-13; src/app/dashboard/upgrade/page.tsx:24-27 | Not a blocker while payments disabled; paid copy risky if flag enabled accidentally. |
| Admin portal | Implemented | README.md:41; build manifest includes /admin/*; src/app/admin/layout.tsx role-gated | Admin AI audit DB grants need tightening. |
| Developer portal | Implemented/gated | README.md:42; build manifest includes /developer/* | Developer bypass must stay dev-only. |
| CEO portal | Implemented/gated | README.md:43; build manifest includes /ceo/* | Internal/admin-only. |
| Deferred payments/webhooks | Deferred code retained | README.md:44; src/app/api/payments/checkout/route.ts:23-29; src/app/api/webhooks/payrex/route.test.ts passed | Dependency vulnerabilities via payrex-node/axios. |
| Deferred AI tutor/generation | Experimental/deferred | README.md:45; src/app/api/ai/tutor/route.ts:6-101 | Not blocker, but route currently exists; ensure UI does not claim live AI. |
| Tools/calculators | Implemented | README.md:46; build manifest includes /tools/*; calculator engine tests pass | E2E redirects for /calculators passed. |
| Professional/results-day/exam outcome | Implemented | README.md:47; build manifest includes /dashboard/professional, /results-day, /exam-outcome, /score-reveal | User-facing authenticated flows. |
| Study pods | Implemented | README.md:48; build manifest includes /dashboard/pods and /dashboard/pods/[podId] | May be broad for launch; verify UX copy before public exposure. |
| Daily dose / DAE / studio | Partial | README.md:49; build manifest includes /dashboard/dae-mode, /dashboard/studio | Product-specific flows not deeply verified in UI. |
| Code updates | Implemented | README.md:50; build manifest includes /dashboard/code-updates | User-facing. |
| Admin feature flags/dev overrides | Implemented | README.md:51; src/app/api/admin/flags/route.ts | Must remain entitlement-gated. |

## 5. Planned / Missing / Partial Features

| Feature or plan | Source document | Actual implementation status | Gap | Recommended action |
|---|---|---|---|---|
| Payment-free launch | README.md:11-14; .ai/deferred-integrations.md:5-10 | Implemented through disabled feature flag and upgrade redirect | No blocker. PayRex code/dependency remains | Keep disabled; before paid launch, patch dependency, staging QA checkout/webhook, verify entitlement grants. |
| Live AI provider-free launch | README.md:13, 44-45; .ai/deferred-integrations.md:11 | API routes exist, launch UI intended disabled | Potential mismatch if any UI claims live tutor is active | Keep deferred copy explicit; add provider-backed smoke tests before enabling. |
| Wiki route param migration | Build manifest shows /dashboard/wiki/[articleId]; README.md:31 says /dashboard/wiki/[slug] | Code appears articleId-routed | Documentation mismatch | Update README and .ai route docs to articleId language. |
| Content optimization | .ai/15_content_optimization/batch-tracker.md:1-17; release-readiness-report.md:1-5 | Local optimization complete per docs | .ai/10_state/current-state.md still says in progress | Refresh current state and roadmap; keep live push gated. |
| Fact-checking pass | .ai/14_fact_checking article tracker | Completed/active record set | Count wording inconsistency: 567 real articles vs older 568/575 directory references | Clarify tracker counts and link from roadmap. |
| Roadmap master/source-of-truth | .ai/01_roadmap/README.md | Stale index; current roadmap files exist | README says no single master roadmap and points to old .ai/plans/docs paths | Rewrite .ai/01_roadmap/README.md as current index. |
| .ai numbered-only taxonomy | .ai/00_system/ai-folder-canonical-map.md:3-8, 80-83 | Live .ai has numbered dirs plus unnumbered workstream/tooling folders | Governance mismatch | Update canonical map to acknowledge 14/15 and temporary workstream exceptions, or archive unnumbered dirs. |
| AI audit admin UI | .ai plans and src/app/admin/ai-audit routes | Implemented route surface and DB objects | DB grants too broad | Restrict DB views/functions before production. |
| Schema cleanup/reset/squash | .ai/final-launch-readiness.md:23-29, 74-80 | Deferred | Schema sources now materially divergent | Make schema reconciliation a pre-production blocker, but full destructive reset/squash can remain founder decision. |
| LemonSqueezy cleanup | README.md:340; .ai/deferred-integrations.md:10 | Runtime removed/deferred; schema/type residue remains | Documentation says deferred; not runtime blocker | Keep as post-launch DB cleanup unless schema reconciliation chooses to address now. |
| Debug/MDX diagnostics | Live route tree /debug-* and /test-media | Implemented in production build | Not in public README route map and includes service-role route | Remove or gate by NODE_ENV/developer entitlement before production. |

## 6. Roadmap Alignment

| Roadmap item | Expected status | Actual status | Evidence | Recommendation |
|---|---|---|---|---|
| Pre-launch MVP hardening | Active/current | Accurate in spirit | README.md:7, 15; .ai/final-launch-readiness.md:1-5 | Keep. Update readiness from “founder review” to current blocker list. |
| Payment-free launch | Deferred paid launch | Aligned | README.md:11-14; .ai/deferred-integrations.md:5-10; feature flag default false | Keep as launch stance. |
| Live-AI-free launch | Deferred live AI provider | Aligned | README.md:44-45; .ai/deferred-integrations.md:11 | Keep as launch stance; ensure UI copy does not claim live tutor. |
| Current route counts | Should be current | Stale in README/.ai | README.md:18 says 109 pages; README.md:55 says 118 pages; live count is 134 | Centralize metrics snapshot; avoid static counts in README unless regenerated. |
| .ai taxonomy | Numbered-only | Misaligned | .ai/00_system/ai-folder-canonical-map.md:3-8; live .ai has unnumbered dirs | Refresh canonical map or archive exceptions. |
| Roadmap entrypoint | Should identify active master roadmap | Stale/conflicting | .ai/01_roadmap/README.md says no master roadmap while current-phase/milestone files exist | Rewrite roadmap README. |
| Content optimization | Should reflect completed local pass | Misaligned in state | .ai/15_content_optimization complete; .ai/10_state/current-state says in progress | Refresh current state and link live-push blocker. |
| Active risks | Should reflect unresolved risks only | Stale | active-risks.md says docs/shared/agent-tiers missing; file exists | Mark resolved or update remaining risk. |
| Documentation source-of-truth | Should cover active workstreams | Mostly sound but incomplete | .ai/00_system/DOCS_SOURCE_OF_TRUTH.md defines hierarchy but omits 14/15 | Add fact-checking/content optimization entries. |
| Final launch readiness | Should reflect current branch | Stale | .ai/final-launch-readiness.md:35 says 105 page routes; live count 134 | Supersede with this audit; do not rely on 2026-04-29 counts. |

## 7. AI Folder Audit

Summary of AI folder contents:
- Canonical existing AI workspace is .ai, not AI.
- .ai contains numbered governance folders 00 through 15 plus unnumbered workstream/tooling folders such as content-audit-export, content-inspection-swarm, final-content-completion, wiki-mdx-render-debug, wiki-ui-audit, articlemedia backups, and scripts.
- .ai/README.md:1-27 explains root docs as current-state docs and .ai operational intelligence.
- .ai/00_system/ai-folder-canonical-map.md:46-56 defines source-of-truth policy and .ai/02_audits as active audit entrypoint.
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md provides useful hierarchy but needs updates for newer workstreams.

Current vs stale plans:
- Current/high-signal:
  - .ai/deferred-integrations.md:5-11: current launch stance for payment/AI deferral.
  - .ai/15_content_optimization/batch-tracker.md:1-17: local content optimization complete.
  - .ai/15_content_optimization/release-readiness-report.md:1-5 and 49-54: all passes complete locally, duplicate-question handling remains push gate.
  - .ai/00_system/DOCS_SOURCE_OF_TRUTH.md: useful source-of-truth policy.
  - .ai/02_audits/security-audit.md, performance-audit.md, data-and-supabase-audit.md, etc. remain useful historical/current audit surfaces, but should be dated and superseded where this audit conflicts.
- Stale or contradictory:
  - .ai/00_system/ai-folder-canonical-map.md says numbered-only and lists only 00-13, but live tree includes 14_fact_checking, 15_content_optimization, and unnumbered folders.
  - .ai/01_roadmap/README.md points to old paths and says no master roadmap despite existing current roadmap files.
  - .ai/10_state/current-state.md says content optimization is in progress while .ai/15_content_optimization says local pass is complete.
  - .ai/final-launch-readiness.md says no blockers and reports older route/test counts; this audit finds production blockers.
  - README and .ai docs carry stale route/test/migration counts.

Completed plans that should be archived or demoted:
- Prior final launch readiness snapshot should be kept but marked superseded by this 2026-05-05 audit.
- Completed content optimization docs should remain active until live push, then archive/demote to .ai/09_archive/store or a completed-work section.
- Backup folders articlemedia-fix-v2-backups and fix-articlemedia-backups appear completed/support artifacts; human should confirm before archival.
- wiki-mdx-render-debug appears completed diagnostic workspace; keep only if still referenced by current MDX debugging docs, otherwise archive.

Conflicting plans/instructions:
- Canonical map says no unnumbered top-level .ai content roots; live tree has several.
- Roadmap README says no master roadmap; actual roadmap files exist.
- Current-state says content optimization in progress; content optimization batch tracker says complete.
- Final readiness says no launch blockers; current audit identifies security/DB blockers.
- README feature table says wiki route /dashboard/wiki/[slug], while current build uses /dashboard/wiki/[articleId].

AI Folder Cleanup Recommendation:

Files/folders to keep active:
- .ai/00_system/ especially ai-folder-canonical-map.md, DOCS_SOURCE_OF_TRUTH.md, VALIDATION_MATRIX.md, ENVIRONMENT_CONTRACT.md, DATA_BOUNDARY_MAP.md.
- .ai/01_roadmap/ after refreshing README/current-phase/milestone tracker.
- .ai/02_audits/ as the active audit registry, including this report.
- .ai/03_plans/ active plans only.
- .ai/10_state/ current-state, active-risks, findings-register after refresh.
- .ai/14_fact_checking until factual/content flags are fully dispositioned.
- .ai/15_content_optimization until live content push verification is complete.
- .ai/content-audit-export if still part of the tracked roundtrip protocol.

Files/folders to archive:
- Superseded final launch readiness snapshots after adding a pointer to this report.
- Completed debug workspaces: .ai/wiki-mdx-render-debug, .ai/wiki-ui-audit, articlemedia backup folders, content-inspection-swarm, final-content-completion, if no active scripts reference them.
- Completed old implementation plans under .ai/03_plans once their code/docs state is reconciled.

Files/folders to merge:
- Roadmap status currently split across .ai/01_roadmap, .ai/10_state/current-state, .ai/final-launch-readiness.md, .ai/deferred-integrations.md, and README. Merge current launch status into one “current-phase” source, then link from README.
- Documentation baseline/disposition files should merge stale path inventories and route-count inventories into a generated current metrics reference.

Files/folders to delete only if clearly safe:
- Do not delete now. Prefer archive/demote first.
- Potential deletion candidates after human review: duplicate backup folders, generated reports with no current references, stale __pycache__ files.

Files requiring human decision:
- Whether .ai/content-audit-export remains permanently tracked or moves to archive after live push.
- Whether debug workspaces should be archived or retained for MDX/content roundtrip debugging.
- Whether to formalize 14_fact_checking and 15_content_optimization as permanent numbered categories.
- Whether to create a generated metrics snapshot file and remove exact counts from README.

Suggested new .ai/project-management structure:
- .ai/00_system/: source-of-truth policy, validation matrix, environment/data boundary maps.
- .ai/01_roadmap/current-phase.md: single active launch roadmap.
- .ai/01_roadmap/backlog.md: future/deferred items.
- .ai/02_audits/: current audits, named by date and scope.
- .ai/03_plans/active/: active implementation plans.
- .ai/03_plans/completed/: completed plans awaiting archive.
- .ai/09_archive/store/YYYY-MM/: completed historical artifacts.
- .ai/10_state/current-state.md: one-page operational truth.
- .ai/10_state/metrics-snapshot.md: generated date-stamped route/test/migration counts.
- .ai/14_fact_checking/ and .ai/15_content_optimization/: keep if active; otherwise archive after live push.

## 8. Supabase / Database Audit

Schema summary:
- Core user/auth/org: profiles, disciplines, user_roles, organizations, organization_members, user_subscriptions.
- Content: wiki_articles, wiki_article_sources, wiki_article_taxonomy, taxonomy_tree, questions, bookmarks/highlights/feedback.
- Quiz/readiness/SRS: quiz_sessions, user_interactions, user_node_mastery, user_srs_cards, user_theta, user_global_stats, focus_review_queues, readiness_score_snapshots.
- Admin/content operations: review/audit/editor/import/assets tables across migrations.
- 3D/design/Camp Trails/notes/notifications/CEO/developer surfaces across DATABASE_SCHEMA.sql and migrations.

Migration health:
- 101 migration SQL files found in supabase/migrations.
- Mixed filename schemes: numeric 004-039, date-based 20260321/20260326/20260407, timestamp 20260501085339/20260505132000.
- rollback_lea_to_ale.sql exists inside active migrations. This is operationally risky.
- DATABASE_SCHEMA.sql and schema.sql are not reliable full schema sources today.
- db-spec.json is generated from a Supabase API and diverges from local schema/migrations.

RLS/security review:
- Positive: many migrations do create RLS policies, and recent migrations tighten wiki_article_sources access.
- Risk: DATABASE_SCHEMA.sql only visibly enables RLS/policies for user_question_states around lines 1255-1268, making it misleading as a security reference.
- Risk: AI audit migration grants broad authenticated access to AI audit views/functions.
  - Views include content_preview at supabase/migrations/20260501085339_create_ai_audit_admin_tables.sql:385-397.
  - Question overview includes q.text and q.correct_option_id at lines 436-447.
  - Grants to authenticated at lines 658-664.
  - seed function is security definer at lines 287-291 and scans wiki_articles at lines 303-311.
- Risk: service-role client is easy to use and bypasses RLS. Evidence: src/lib/supabase/admin.ts:5-20.

App/schema mismatches:
- DATABASE_SCHEMA.sql is stale vs app/migrations; schema.sql is empty.
- App references table/view/RPC names not represented in DATABASE_SCHEMA.sql. Subagent audit identified suspicious names needing reconciliation: taxonomy_nodes, srs_queue, exam_profiles, subjects, review_sessions, cage_verifications, teach_back_responses.
- RPCs such as match_wiki_articles, submit_quiz_answer_v2, save_user_exam_date_preferences exist in migrations but not DATABASE_SCHEMA.sql.
- README.md:340 explicitly admits legacy lemonsqueezy schema/type fields remain after runtime removal.

Index/performance concerns:
- Without a verified generated schema and index inventory, missing-index assessment remains incomplete.
- Cron routes query quiz_sessions by status/started_at and user_id; confirm indexes before launch because they run across active users. Evidence: src/app/api/cron/compute-signals/route.ts:28-76 and focus-review-scan route lines 66-89.
- AI audit views use lateral counts over wiki_article_sources/questions and join ai_audit_status_cache. Confirm indexes on article_id, target_type/target_id, question_id.

Production concerns:
- Must fail-close cron secret handling.
- Must restrict service-role debug routes.
- Must restrict AI audit DB views/functions.
- Must reconcile schema source of truth before production DB operations.
- Must clarify migration ordering and remove/relocate rollback file from active migrations.

Recommendations:
Required before production:
1. Create a DB governance pass: regenerate schema/types from actual target DB or rebuild DATABASE_SCHEMA.sql from migrations.
2. Add a migration to revoke broad authenticated grants on AI audit views/functions and replace with role-gated RPC/views or admin-only policies.
3. Remove rollback_lea_to_ale.sql from active migrations or mark it outside migration tooling.
4. Audit code references to legacy/missing table names and fence dev-only paths.
5. Add tests for cron auth fail-closed behavior.

Recommended after launch:
- Decide whether to squash migrations before real production data.
- Clean LemonSqueezy legacy columns/types if provider is permanently removed.
- Add DB policy tests for admin AI audit visibility and learner answer-key isolation.

## 9. Security Findings

| Severity | Issue | Evidence | Risk | Recommended fix | Production blocker? |
|---|---|---|---|---|---|
| Critical | Cron endpoints authorize `Bearer undefined` if CRON_SECRET is unset | src/app/api/cron/compute-signals/route.ts:19-23; src/app/api/cron/focus-review-scan/route.ts:54-63 | Anyone who guesses/sends `Authorization: Bearer undefined` can trigger service-role cron work if env is missing | `const secret = process.env.CRON_SECRET; if (!secret) return 500/401;` then constant-time compare where feasible | Yes |
| Critical | Debug routes use service-role Supabase and are in production route tree | src/app/debug-supabase/page.tsx:11-23; src/app/debug-cache-bypass/page.tsx:8-16; build manifest includes /debug-* | Ordinary authenticated users may trigger service-role reads/internal diagnostics | Remove routes or gate by NODE_ENV !== production plus developer entitlement | Yes |
| High | AI audit views expose content previews/question answer keys to authenticated role | migration 20260501085339 lines 385-397, 436-447, 658-664 | Learners may access answer-key/content-review metadata through PostgREST if underlying tables are readable | Revoke authenticated grants; expose admin-only views/RPCs checked by can_review_content/can_manage_content | Yes |
| High | SECURITY DEFINER seed_ai_audit_status_cache executable by authenticated users | migration 20260501085339 lines 287-311 and 664 | Any authenticated user can refresh/update audit cache from privileged function | Revoke execute from authenticated; grant only service_role/admin or add role check inside function | Yes |
| High | Dependency vulnerabilities via payrex-node -> axios | `bun audit`: 13 vulnerabilities, 4 high, 8 moderate, 1 low | Production dependency graph contains vulnerable HTTP client gadgets even though payments are disabled | Upgrade payrex-node/axios, override axios safely, or remove/defer payrex-node until paid launch | Yes before full production; beta may proceed if payments disabled and dependency not reachable, but still should be fixed. |
| Medium | Broad service-role client usage increases blast radius | src/lib/supabase/admin.ts:5-20; src/lib/supabase/server.ts referenced by audit | RLS bypass means every caller needs explicit authorization/ownership | Inventory all createAdminClient/createServiceClient call sites; require authorization wrapper conventions | Should fix before beta where exposed. |
| Medium | CSP permits unsafe-inline and unsafe-eval | next.config.ts:17-18 | Larger XSS blast radius; may be partly required by Next/Turbopack/dev/MDX | Tighten production CSP after verifying Next requirements; add nonce/hash strategy where feasible | No, but launch hardening. |
| Medium | Dev bypass env vars must not be enabled in production | README.md:327; README.md:431-432; src/lib/supabase/middleware.ts dev bypass referenced | Accidental production bypass can alter auth/entitlements | Add startup/env validation to fail build/runtime if DEV_FORCE_USER_ID or ALLOW_DEV_PORTAL_BYPASS in production | Yes if env not controlled. |
| Medium | AI tutor accepts raw message and context for provider prompts | src/app/api/ai/tutor/route.ts:8-63 | Prompt injection/cost abuse/factual leakage if enabled | Keep disabled; before enabling add input validation, source filtering, output citation tests, cost limits | No for current no-live-AI launch. |
| Low | Lint warnings in debug routes and unused code | lint output: 16 warnings, including debug-supabase/page.tsx | Code hygiene and dead debug indicators | Remove debug routes and unused variables | No by itself. |
| Informational | Security headers present | next.config.ts:3-20 | Positive hardening | Keep and refine CSP | No. |

## 10. Code Quality Findings

| Severity | Area | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| High | Route surface hygiene | Debug/test routes remain in production build | Build manifest includes /debug-cache-bypass, /debug-check, /debug-mdx, /debug-mdx-detailed, /debug-supabase, /test-media | Remove/gate them before production. |
| High | Database boundary | App, migrations, DATABASE_SCHEMA.sql, db-spec.json disagree | DATABASE_SCHEMA.sql:2-3; schema.sql:1 empty; db-spec.json:2-8; migrations count 101 | Regenerate schema/types and choose one source of truth. |
| Medium | Dashboard architecture | DashboardLayoutContent combines auth/bootstrap/profile/subscription/stats/entitlements/layout/dev toolbar/3D special casing | src/components/dashboard/DashboardLayoutContent.tsx (subagent sampled lines 32-252) | Split route-agnostic shell, auth/bootstrap, layout, and special-case 3D branch. |
| Medium | Route constants discipline | ROUTES is documented as single source but hardcoded hrefs remain | src/lib/routes.ts:15-23; admin page hardcoded hrefs reported in subagent | Convert route strings to ROUTES constants during next cleanup. |
| Medium | Duplicate quiz compatibility routes | Canonical dashboard quiz routes and legacy /quiz routes both built | build manifest | Keep wrappers thin; add tests that legacy paths redirect and no new feature logic lives there. |
| Medium | Stale docs/counts | README and .ai have outdated route/test/migration counts | README.md:18, 55; .ai/final-launch-readiness.md:31-42 | Generate metrics or date all counts. |
| Medium | Large client-heavy surfaces | Broad client surfaces noted by authoritative reference and dashboard/quiz architecture | .ai/00_system/slatecamp-authoritative-reference.md:134-139 | Audit server/client boundaries for hot routes; reduce client bundle where easy. |
| Low | Lint warnings | 16 lint warnings, 0 errors | lint command output | Fix unused variables/imports and `<img>` warning when touching files. |
| Low | TODO/FIXME count | 19 TODO/FIXME/HACK/XXX occurrences under src | search output | Triage; most in 3D Lab and small utility areas. |

## 11. UX and Feature Flow Findings

| Flow/page | Current state | Issue | Recommendation |
|---|---|---|---|
| Public routes | E2E production smoke passed for /, auth pages, pricing, about, contact, try, tools | Good baseline | Keep smoke tests in CI. |
| Auth boundaries | Unauthenticated dashboard/developer/CEO/admin routes redirect correctly in E2E | Good baseline | Add authenticated role-boundary E2E in staging. |
| Wiki landing | Route exists; subagent found page is mostly instructional/sidebar-dependent | Passive landing may confuse users who expect search/browse | Add search/list CTA or featured taxonomy/articles on /dashboard/wiki. |
| 3D Lab locked state | Entitlement-gated; locked CTA points to settings | Payment-free launch may not explain how to unlock access | Add clear access explanation and admin/contact/request-access CTA. |
| Upgrade page | Paid copy exists but redirects if payments disabled | Safe now, but risky if flag accidentally enabled | Add production guardrails and paid-launch QA checklist before enabling. |
| Debug pages | Built and routable | User-facing production surface should not include diagnostics | Remove/gate. |
| Admin AI audit | Admin UI exists | DB grants may expose sensitive surfaces outside admin UI | Fix DB permissions, not just UI. |
| README route docs | Useful but stale | Docs say [slug] wiki route; build uses [articleId] | Refresh route docs. |

## 12. Performance Findings

| Severity | Area | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| Medium | Client bundle / dashboard | Dashboard shell is broad and likely client-heavy in places | src/components/dashboard/DashboardLayoutContent.tsx sampled by subagent; authoritative reference notes broad client-heavy surfaces | Profile route bundles after blockers; split shell responsibilities. |
| Medium | 3D Lab | Performance-sensitive WebGL/R3F modules | README.md:33; .github/workflows/3d-performance-warning.yml:1-98 | Keep warning gates; run full perf suite before public marketing push. |
| Medium | Cron N+1/loop work | compute-signals loops active users and queries per user | src/app/api/cron/compute-signals/route.ts:28-80 | Batch queries or add indexes before scale. |
| Medium | AI audit views | Lateral counts over articles/questions/sources | migration 20260501085339 lines 419-434 | Ensure indexes; consider materialized/cache table for dashboard. |
| Low | Image optimization | Lint warning for `<img>` | src/components/wiki/quiz/WikiQuizModal.tsx:534 in lint output | Replace with next/image where appropriate. |
| Low | Build warnings | Build prints `--localstorage-file` warnings during static generation | build output | Trace source of Bun/Node warning; likely non-blocking. |
| Informational | Build speed | Turbopack production build completed successfully | `bun run build` output: compiled in 18.1s, static pages generated in 881ms | Good current baseline. |

Pre-launch vs later:
- Before launch: remove debug routes, fix cron auth, restrict AI audit DB grants, verify indexes for cron/AI audit hot paths.
- Later optimization: bundle splitting, wiki landing UX performance, 3D deep performance sweeps, AI route cost controls when re-enabled.

## 13. Testing, CI/CD, and Reliability

Existing tests:
- Bun unit/integration tests under src.
- Vitest/jsdom DOM tests under tests/vitest.
- Playwright E2E tests under e2e.
- Storybook story guard and story files.
- 3D performance warning workflow.
- Entitlement legacy usage checker.

Commands run and results:

| Command | Result | Notes |
|---|---|---|
| `date '+%Y-%m-%d %H:%M:%S %Z'` | 2026-05-05 13:57:16 PST | Used for report date. |
| `bun --version` | 1.3.10 | CI uses Bun 1.3.11 in .github/workflows/storybook.yml:35-39. |
| `node --version` | v25.8.0 | Local runtime. |
| `git status --short` before report | clean | No pre-existing dirty tree during audit. |
| `bun run type-check` | pass | Output: `$ bun scripts/type-check.ts`, exit 0. |
| `bun run lint` | pass with warnings | 0 errors, 16 warnings. Storybook guard scanned 100 story files. |
| `bun run test` | pass | 715 pass, 0 fail, 5225 expects, 84 files. |
| `bun run test:dom` | pass | 8 files, 53 tests passed. |
| `bun run build` | pass | Next.js 16.2.3/Turbopack build compiled successfully. |
| `bun audit` | fail | 13 vulnerabilities through payrex-node -> axios: 4 high, 8 moderate, 1 low. |
| `bun run check:entitlements` | pass | Entitlement legacy usage check passed. |
| `bun run test:e2e:prod` | pass | 42 passed in 5.7s. |
| `git status --short` after validation | clean | Safe commands did not leave tracked modifications. |

CI/CD status:
- .github/workflows/storybook.yml is the main release validation workflow. It runs `bun run validate:release`, which chains type-check, lint, entitlements, audit, build, and many E2E suites. Because `bun audit` currently fails locally, validate:release will fail unless CI has different dependency resolution or audit settings.
- .github/workflows/3d-performance-warning.yml runs 3D performance gates in continue-on-error/warning mode for several steps, then evaluates gates.
- No generic ci.yml exists; .github/workflows/ci.yml was not found.
- vercel.json configures cron endpoints, so cron security matters for deployment.

Missing tests/reliability gaps:
- Add tests for cron auth when CRON_SECRET is missing.
- Add tests for debug routes absent/gated in production.
- Add DB/RLS policy tests for AI audit views and answer-key protection.
- Add authenticated role E2E for learner vs admin/developer/CEO route access.
- Add migration/schema drift check in CI: ensure app-referenced tables/RPCs exist in generated schema/types.
- Add startup/env validation for production-forbidden dev bypass env vars.
- Add backup/restore/migration runbook for Supabase production.

## 14. Documentation and Project Management

Accurate docs:
- README correctly identifies the app as pre-launch MVP and states payment-free/live-AI-free launch stance at lines 5-14.
- .ai/deferred-integrations.md accurately frames PayRex/LemonSqueezy/AI as deferred at lines 5-11.
- TESTING.md correctly documents three test layers and commands, although counts are stale.
- docs/README.md is a bridge surface pointing to README/.ai/deep specs.
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md is directionally strong for canonical hierarchy.

Stale docs:
- README counts are stale: README.md:18 says 109 page routes/92 migrations/88 tests; live counts are 134 page routes/101 migrations/89 src test files plus 18 e2e specs.
- README route map says 118 page routes at line 55; live count is 134.
- README wiki route says [slug] at line 31; build route is [articleId].
- .ai/final-launch-readiness.md says no blockers at lines 61-64 and older counts at lines 31-42; superseded by this audit.
- .ai/00_system/ai-folder-canonical-map.md says numbered-only and lists 00-13, but live tree includes 14/15 and unnumbered workspaces.
- .ai/01_roadmap/README.md is stale against existing current roadmap files.
- .ai/10_state/current-state.md is stale against content optimization completion.

Missing docs:
- Current schema source-of-truth/runbook that matches migrations and production DB.
- Production route-surface cutline explicitly listing debug/test/internal routes to exclude/gate.
- Launch blocker register separated from future/payment/AI backlog.
- Supabase RLS policy matrix per role/table/view.
- Dependency audit remediation policy, especially for deferred providers.

Conflicting docs:
- Final launch readiness says no product launch blocker; current audit finds security/DB blockers.
- AI folder canonical map says numbered-only; live folder contradicts it.
- Roadmap README says no master roadmap; roadmap folder contains active roadmap files.
- README and .ai counts conflict with live tree and each other.

Recommended single source of truth:
- README: external/developer onboarding and high-level product status only.
- .ai/10_state/current-state.md: current operational truth and launch blockers.
- .ai/01_roadmap/current-phase.md: active roadmap.
- .ai/02_audits/: evidence-backed audit reports.
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md: placement/source policy.
- Generated .ai/10_state/metrics-snapshot.md: route/test/migration counts.

Project-management cleanup:
1. Mark .ai/final-launch-readiness.md superseded by this report.
2. Refresh .ai/10_state/current-state.md with current blocker list.
3. Rewrite .ai/01_roadmap/README.md as an index.
4. Update .ai/00_system/ai-folder-canonical-map.md for 14/15 and workstream exceptions.
5. Move completed/debug artifacts to archive after human review.
6. Create a launch-blocker register with owner/status/evidence.
7. Separate deferred payment/AI roadmap from launch blockers.
8. Add schema governance as a named project-management item.

## 15. Launch Blockers

### Must fix before production
1. Remove or hard-gate production debug/test routes, especially /debug-supabase and /debug-cache-bypass.
2. Make cron endpoints fail closed when CRON_SECRET is absent.
3. Restrict AI audit views/functions and answer-key/content-preview exposure at the database layer.
4. Reconcile schema source-of-truth: production DB, migrations, DATABASE_SCHEMA.sql, db-spec.json, generated types, and app references.
5. Remove/relocate rollback_lea_to_ale.sql from active migrations or document migration tooling exclusion.
6. Resolve bun audit vulnerabilities from payrex-node -> axios or remove/defer vulnerable dependency from production graph.
7. Add production env guardrails for dev bypass variables and required CRON_SECRET.

### Should fix before beta
1. Refresh README/.ai counts and route docs, especially wiki [articleId] routing.
2. Add role-boundary E2E for authenticated learner vs admin/developer/CEO.
3. Add DB/RLS policy tests for AI audit views and learner access.
4. Fix lint warnings in debug routes/camptrails/HeroCommandBar/wiki-markdown.
5. Clarify 3D Lab locked-state UX under payment-free launch.
6. Refresh .ai current-state/roadmap/final readiness docs.
7. Triage legacy table references such as taxonomy_nodes/srs_queue/exam_profiles/subjects/review_sessions/cage_verifications/teach_back_responses.

### Can fix after launch
1. LemonSqueezy schema/type cleanup if runtime remains removed.
2. Full migration squash/reset decision before significant real production data.
3. Bundle/performance optimization after route-surface hardening.
4. Wiki landing enhancement.
5. AI provider smoke tests and source/citation QA before enabling AI UI.
6. PayRex staging checkout/webhook QA before paid launch.

### Nice to have
1. Generated metrics snapshot and docs automation.
2. Stronger CSP without unsafe-inline/unsafe-eval where feasible.
3. Automated unused dependency detection.
4. More component coverage thresholds enforced in CI.
5. Archive automation for .ai completed plans.

### Future roadmap
1. Paid subscription launch.
2. Live AI tutor/study-agent launch.
3. Full content push/release workflow after duplicate question gate.
4. Production observability/error monitoring and runbooks.
5. Expanded 3D Lab performance budgets and mobile WebGL support.

## 16. Recommended Next 10 Actions

| Priority | Task | Why it matters | Complexity | Dependencies | Expected impact |
|---|---|---|---|---|---|
| P0 | Remove/gate /debug-* and /test-media production routes | Eliminates service-role and diagnostic exposure | Small | Decide remove vs developer-only gate | Major security improvement |
| P0 | Fix CRON_SECRET fail-closed behavior | Prevents `Bearer undefined` authorization | Small | None | Blocks unauthorized service-role cron execution |
| P0 | Revoke/rebuild AI audit DB grants/functions | Prevents answer-key/content-preview leakage | Medium | Supabase migration and policy review | Major data-security improvement |
| P0 | Patch/remove vulnerable payrex-node/axios dependency | `bun audit` currently fails, CI validate likely fails | Medium | Check payrex-node version/override compatibility | Restores release validation confidence |
| P0 | Reconcile schema sources and generated types | Current DB truth is unreliable | Large | Access to target Supabase or migration replay | Reduces production migration/data risk |
| P1 | Add tests for cron auth, debug route gating, AI audit RLS | Locks blockers against regression | Medium | After fixes | Increases launch confidence |
| P1 | Refresh .ai current-state/roadmap/canonical map | Prevents AI/project-management drift | Medium | This report as source | Clear single source of truth |
| P1 | Update README route/count/docs mismatches | Prevents onboarding/review errors | Small | Live metrics snapshot | Accurate developer/product docs |
| P1 | Triage suspicious app/schema references | Prevents hidden route runtime failures | Medium | Schema reconciliation | Reduces production runtime errors |
| P2 | Run full staging validation after fixes | Confirms public launch candidate | Medium/large | P0 fixes complete | Evidence-based launch approval |

## 17. Final Assessment

Is this production-ready today?
No. It is close from a build/test/product breadth perspective, but not production-ready until the security and database governance blockers are fixed.

Is this beta-ready today?
Yes, for a controlled/internal or limited soft-launch beta, if access is constrained and the team accepts the known debug/DB/dependency risks. For any public beta with real users, fix the P0 security items first.

What would make it production-ready?
- Remove/gate debug routes.
- Fail-close cron auth.
- Restrict AI audit DB views/functions.
- Reconcile schema and migrations against the real production database.
- Fix dependency vulnerabilities.
- Refresh docs/state/roadmap so the team has one accurate launch truth.
- Rerun validation gates: type-check, lint, tests, DOM tests, build, bun audit, entitlements, production smoke E2E, and a staging authenticated role suite.

What should the team focus on next?
Security and database governance first. Do not spend the next sprint on payment or chatbot. Payment and AI can remain deferred. The next sprint should turn the current beta-quality app into a production-safe app by closing the P0 route/auth/RLS/schema/dependency issues, then updating .ai/roadmap docs to match reality.
