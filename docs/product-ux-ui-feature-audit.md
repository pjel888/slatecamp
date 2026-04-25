# Product UX/UI + Feature Readiness Audit

Generated: 2026-04-25
Scope: SlateCamp application, current worktree at `/Users/philiplewis/slatecamp`
Primary evidence: route tree, app source, docs/audit corpus, local dev HTTP checks, package scripts, dependency/security checks, and authoritative UX/accessibility references.

## 1. Executive Summary

Overall readiness rating: **Internal testing ready, not beta-ready, not production-ready.**

SlateCamp has a serious and unusually broad MVP surface: marketing, auth, onboarding, dashboard, quiz, analytics, wiki, notes, CampTrails, 3D Lab, settings, admin content ops, developer tools, CEO views, and calculators. The app is not a prototype in breadth. The readiness risk is coherence plus safety: billing paths must stay disabled until live provider behavior is fully verified, first-run activation needs real user proof, and account/admin/accessibility/responsive workflows still need production-grade QA.

### Top 5 critical blockers

| # | Blocker | Evidence | Why it blocks readiness |
|---|---------|----------|--------------------------|
| 1 | Payments are not safe to re-enable | `src/lib/lemonsqueezy/config.ts`, `src/lib/payments/provider.ts`, `src/app/api/webhooks/payrex/route.ts`, `src/app/api/webhooks/lemonsqueezy/route.ts` | LemonSqueezy is a build stub, checkout creation can throw, webhook subscription updates are update-only, and billing account controls are missing. |
| 2 | A public 3D test route bypasses the dashboard entitlement gate | `src/app/test-3d/page.tsx`, `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | `/test-3d` renders `LabBrowser`/`ModuleViewer` without the `getViewerEntitlements` guard used by dashboard module routes. |
| 3 | Release gates are not green | `bun run check:entitlements` failed on direct env usage; `bun audit` reported 10 vulnerabilities including high Next.js and Storybook advisories | Production readiness cannot rely on manual confidence while security and governance gates fail. |
| 4 | Onboarding can end without enough activation guidance | `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`, `src/app/dashboard/settings/profile-card.tsx` | A new student can skip or complete setup without a clear first diagnostic, checklist, or tutorial path. |
| 5 | Settings/admin operations are missing production controls | `src/app/dashboard/settings/page.tsx`, `src/app/admin/_components/AdminShell.tsx`, `.ai/02_audits/ADMIN_SURFACE_AUDIT.md` | Users lack account/security/billing/privacy controls, while operators need clearer publish/review/destructive-action workflows. |

### Ralph remediation update - 2026-04-25

| Initial blocker | Current implementation status | Verification evidence |
|---|---|---|
| Payments unsafe to re-enable | Payments now fail closed through `PaymentUnavailableError`; checkout returns 503 for disabled/unavailable providers; PayRex and LemonSqueezy webhook subscription writes use canonical upsert paths; LemonSqueezy cancellation does not mark the event processed if the downgrade write fails. Payments should remain disabled until live provider contract QA is complete. | `bun test src/app/api/payments/checkout/route.test.ts src/app/api/webhooks/payrex/route.test.ts src/app/api/webhooks/lemonsqueezy/route.test.ts`, `bun audit`, `bun run type-check` |
| `/test-3d` entitlement bypass | `/test-3d` now redirects to the protected dashboard 3D Lab and is classified as protected in route audit evidence. | `.ai/02_audits/evidence/route-manifest.json`, `bun run build` |
| Release gates not green | Entitlement legacy check and dependency audit are green after centralizing dev override access and upgrading/overriding vulnerable dependencies. | `bun run check:entitlements`, `bun audit` |
| Weak first-run activation | Onboarding now blocks completed-user re-entry, reports skip failures, disables duplicate skip/submit actions, dashboard first-session CTAs point to the real assessment route, and the first dashboard card includes an activation checklist. More tutorial/user-proof work remains. | `bun run type-check`, `bun run build` |
| Settings/admin controls missing | Settings now includes an Account Center for access, billing state, security reset, privacy/support; notification saves announce state; admin editor now blocks invalid article/question saves before mutation; admin metadata mojibake was repaired. | `bun run lint`, `bun run build`, targeted webhook/logging/middleware tests |

### Top 5 highest-leverage improvements

| # | Improvement | Impact |
|---|-------------|--------|
| 1 | Build a first-run activation path: onboarding -> dashboard checklist -> first diagnostic/session -> first insight | Converts a broad app into an understandable product for anxious ALE candidates. |
| 2 | Upgrade `/dashboard/settings` into a real account center | Removes launch blockers around password/security, billing, notifications, privacy, and support. |
| 3 | Harden `/admin` around content workflows and role safety | Protects content quality, auditability, and publishing confidence. |
| 4 | Add release gates for build, type-check, lint, entitlement check, dependency audit, route smoke, and core flows | Turns readiness into an enforceable standard rather than a manual review. |
| 5 | Standardize empty/error/loading/success states across core dashboard, admin, analytics, and forms | Improves accessibility, first-time comprehension, and perceived reliability. |

Biggest UX risk: **the product has many strong surfaces but no single "what do I do next?" spine for first-time students.**

Biggest UI risk: **design-system rules are good, but implementation is inconsistent across old/new surfaces, especially monospace labels, hardcoded colors, rounded shapes, dense admin/editor UIs, and marketing/dashboard tone drift.**

Biggest feature-readiness risk: **payments, account management, support, first-run activation, and admin publishing are not fully production-complete despite visible routes or copy around them.**

Biggest technical/design-system risk: **release and governance checks are now green locally, but they are not yet consolidated into one repeatable app-release gate with CI evidence.**

Recommended next move: **Continue Phase 1 by proving the first-run activation path in-browser, adding a release validation aggregate, and completing account/privacy/support workflows before beta.**

### Readiness scorecard

| Category | Score | Rationale | Move to next level |
|---|---:|---|---|
| UX clarity | 3 | Main flows exist, but onboarding/dashboard/navigation do not consistently tell a new user the next best action. | Add activation checklist, guided first diagnostic, and contextual tutorials. |
| UI polish | 3 | Strong token base and many polished cards, but older surfaces drift in density, typography, and hierarchy. | Standardize shell/card/form/table patterns. |
| Feature completeness | 3 | Broad features exist, but account, billing, 3D entitlement safety, admin ops, support, and tutorials are incomplete. | Close payments/settings/3D/admin gaps. |
| Design system consistency | 3 | `globals.css`, deep docs, and component primitives exist, but violations remain. | Enforce token and component usage in review/CI. |
| Accessibility | 2 | Some semantic labels/alerts exist, but there is no app-wide keyboard/screen-reader proof. | Add focused WCAG audit and fix labels/status/focus/touch targets. |
| Responsiveness | 3 | Responsive grids and mobile nav exist, but complex tables/editors/3D/admin need manual viewport proof. | Run mobile/tablet/desktop visual QA and fix overflow. |
| Error handling | 2 | Route error boundaries exist, but many server sections throw to boundaries or silently redirect/null. | Add local recovery states and status messages. |
| Empty/loading/success states | 3 | Many loading files and empty states exist, but quality is uneven. | Create shared state patterns and retrofit core surfaces. |
| Navigation and IA | 3 | Dead routes were recently shimmed; IA still has duplicate route registries and hidden/legacy paths. | Centralize nav registries and remove stale promises. |
| Form usability | 3 | Forms generally have labels, but validation, unsaved-change handling, and status announcements are uneven. | Add form-level validation contract. |
| Content clarity | 3 | Copy is calmer after recent claim cleanup, but public metadata and some feature copy over-promise. | Finish claim matrix remediation. |
| Performance perception | 3 | Suspense/skeletons exist, but dashboard/admin/editor overfetch and dense analytics can feel heavy. | Paginate/heavy-load split key surfaces. |
| Code maintainability | 3 | Good App Router structure, but large components and duplicate registries increase UX drift. | Split admin/editor/dashboard hotspots. |
| Production readiness | 3 | Local build/type/lint/entitlement/dependency gates are green and `/test-3d` no longer bypasses protected 3D access, but payment/account/admin/accessibility workflows still need live QA and CI enforcement. | Keep billing disabled until provider QA is complete, finish account/admin workflows, and add a release validation aggregate. |

## 2. Methodology

### How the audit was performed

- Inspected repo instructions and docs:
  - `AGENTS.md`
  - `docs/AGENTS.md`
  - `.ai/AGENTS.md`
  - `.ai/00_system/ROUTE_SURFACE_MAP.md`
  - `.ai/00_system/VALIDATION_MATRIX.md`
  - `.ai/10_state/current-state.md`
  - `.ai/10_state/findings-register.md`
  - `.ai/02_audits/ADMIN_SURFACE_AUDIT.md`
  - `.ai/02_audits/DEVELOPER_SURFACE_AUDIT.md`
  - `.ai/02_audits/2026-04-25-public-claim-matrix.md`
  - `.ai/02_audits/2026-04-25-route-path-consumer-audit.md`
- Enumerated current routes from `src/app/**/page.tsx`.
- Inspected representative implementation files across marketing, auth, onboarding, dashboard, settings, admin, developer, quiz, wiki, 3D Lab, notifications, payments, and routes.
- Used existing route evidence at `.ai/02_audits/evidence/route-manifest.json`.
- Ran local HTTP HEAD checks against the existing dev server on `http://127.0.0.1:3001` for `/`, `/login`, `/dashboard/settings`, and `/admin`.
- Used earlier same-session verification evidence from the initial audit:
  - `bun run check:entitlements` failed before remediation.
  - `bun audit` failed with 10 vulnerabilities before remediation.
  - Earlier route-stabilization pass had `bun run type-check`, targeted route tests, `bun run build`, and `git diff --check` green.
- Captured post-remediation verification evidence:
  - `bun run check:entitlements` passed.
  - `bun audit` reported no vulnerabilities.
  - `bun run type-check`, `bun run lint`, targeted webhook/logging/middleware tests, route manifest regeneration, and `bun run build` passed locally.
- Used a read-only Kimi companion pass for second-opinion risk discovery. Codex owns the final synthesis.

### App run and browser review

The app was partially available through the existing dev server on port `3001`. `/login`, `/dashboard/settings`, and `/admin` returned HTTP 200 in HEAD checks; `/` initially timed out during compilation and then returned 200 on retry. No new screenshots were generated because the requested deliverable allows only this audit document to be created/updated, and there were no reference screenshots for a meaningful `$visual-verdict` comparison.

`$visual-verdict` was therefore **not applicable** as a screenshot-to-reference scoring tool for this audit. The audit still applies visual QA standards through source inspection and best-practice cross-reference.

### Online best-practice research used

- [WCAG 2.2](https://www.w3.org/TR/wcag/) for focus, contrast, reflow, target size, labels, errors, and input assistance.
- [WAI form labeling tutorial](https://www.w3.org/WAI/tutorials/forms/labels/) for explicit labels and form-control association.
- [WAI status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html) for toast/save/loading/error announcements.
- [Nielsen Norman Group usability heuristics](https://media.nngroup.com/media/articles/attachments/Heuristic_Summary1_A4_compressed.pdf) for system status, consistency, error prevention, recognition, minimalist design, and recovery.
- [W3C Design Tokens Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/) for design-token structure, aliases, grouping, and cross-tool source-of-truth discipline.
- [Figma variables, collections, and modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes) for reusable values, semantic aliases, and future light/dark/accessibility token modes.
- [Storybook UI testing](https://storybook.js.org/docs/writing-tests) for treating component stories as browser-testable component states.

Current visual authority is the SlateCamp design system in `DESIGN.md`, `src/app/globals.css`, and `.ai/06_specs/deep/03-design/001-design-system.md`. External design systems are not governing style references for SlateCamp; they may be used only as background comparison when they support SlateCamp's own product constraints.

### Limitations

- This is a repo-aware audit, not a full moderated usability test.
- No authenticated browser walkthrough with real fixture users was performed in this pass.
- No screenshot diff was run because no reference screenshots were provided and this task restricts output to one audit document.
- Dynamic routes with IDs/slugs were evaluated from implementation and manifest evidence, not live fixture navigation.

## 3. Product Map

Product type: **ALE preparation and readiness intelligence platform** for Philippine Architecture Licensure Exam candidates.

Likely users:

- First-time ALE takers preparing for the exam.
- Returning reviewees trying to identify gaps.
- Passers transitioning to professional reference mode.
- Admin/content editors managing wiki, questions, taxonomy, assets, and reviews.
- Internal developers/operators inspecting app, database, logs, and status.
- Founder/CEO users monitoring business/content/product signals.

Core user goals:

- Understand current readiness.
- Identify weak topics.
- Practice questions and full exam simulations.
- Study by structured CampTrails.
- Read authoritative wiki content.
- Use notes, flash cards, calculators, and 3D modules.
- Manage account, preferences, notifications, and exam context.
- Administer content and review quality.

Primary flows:

- Public landing -> try flow -> account creation.
- Login/register -> onboarding -> dashboard.
- Dashboard -> first diagnostic/study session -> results/review.
- Wiki/article -> practice this article -> quiz -> review.
- CampTrails -> enroll -> daily activities -> completion.
- Analytics -> identify weak topics -> focus review.
- Settings -> profile/notifications/theme/account mode.
- Admin -> content create/edit/review/publish/audit.
- Developer -> inspect health, DB, logs, API reference.

App framework and stack:

- Next.js App Router, React 19, TypeScript, Tailwind CSS 4, shadcn-style components.
- Supabase/PostgreSQL for auth/data.
- Recharts and analytics components.
- React Three Fiber/Three.js/drei for 3D Lab.
- Bun for scripts and validation.

Current maturity level: **broad MVP / internal beta candidate**, not public production. Breadth is high; operational polish and launch gating are the main gaps.

## 4. Screen Inventory

Current route evidence:

- `112` `page.tsx` routes
- `15` layouts
- `91` loading states
- `7` error boundaries
- `12` `route.ts` handlers
- Route manifest groups after remediation: `14` public, `6` auth, `1` admin login, `91` protected

| # | Screen | Route | File/Component | Purpose | Current Status | Readiness |
|---|--------|-------|----------------|---------|----------------|-----------|
| 1 | Landing | `/` | `src/app/page.tsx` | Public product entry | Implemented | Needs polish |
| 2 | About | `/about` | `src/app/about/page.tsx` | Public company/product context | Implemented | Needs polish |
| 3 | Contact | `/contact` | `src/app/contact/page.tsx` | Contact/support entry | Implemented | Needs polish |
| 4 | Pricing | `/pricing` | `src/app/pricing/page.tsx` | Pricing/free-access messaging | Partial | Needs feature work |
| 5 | Try | `/try` | `src/app/try/page.tsx` | Public readiness teaser | Implemented | Needs UX work |
| 6 | Login | `/login` | `src/app/(auth)/login/page.tsx` | Auth sign-in | Implemented | Needs polish |
| 7 | Register | `/register` | `src/app/(auth)/register/page.tsx` | Account creation | Implemented | Needs polish |
| 8 | Forgot password | `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Request reset link | Implemented | Needs polish |
| 9 | Reset password | `/auth/reset-password` | `src/app/auth/reset-password/page.tsx` | Complete password reset | Implemented | Needs QA |
| 10 | Onboarding | `/onboarding` | `src/app/(auth)/onboarding/page.tsx` | Setup study path | Implemented | Needs UX work |
| 11 | Comp exam onboarding | `/onboarding/comp-exam` | `src/app/(auth)/onboarding/comp-exam/page.tsx` | Score import/setup | Partial | Needs feature work |
| 12 | Dashboard home | `/dashboard` | `src/app/dashboard/page.tsx` | Main student overview | Implemented | Needs UX work |
| 13 | Dashboard analytics | `/dashboard/analytics` | `src/app/dashboard/analytics/page.tsx` | Analytics overview | Implemented | Needs polish |
| 14 | Advanced analytics | `/dashboard/analytics/advanced` | `src/app/dashboard/analytics/advanced/page.tsx` | Deep analytics | Implemented | Needs QA |
| 15 | Heatmap shim | `/dashboard/heatmap` | `src/app/dashboard/heatmap/page.tsx` | Legacy redirect | Implemented | Needs feature decision |
| 16 | Assessment | `/dashboard/assessment` | `src/app/dashboard/assessment/page.tsx` | First diagnostic | Implemented | Needs UX work |
| 17 | Score reveal | `/dashboard/score-reveal` | `src/app/dashboard/score-reveal/page.tsx` | Readiness reveal | Implemented | Needs QA |
| 18 | Results day | `/dashboard/results-day` | `src/app/dashboard/results-day/page.tsx` | Exam outcome flow | Implemented | Needs UX work |
| 19 | Exam outcome | `/dashboard/exam-outcome` | `src/app/dashboard/exam-outcome/page.tsx` | Self-report outcome | Implemented | Needs QA |
| 20 | Drills hub | `/dashboard/drills` | `src/app/dashboard/drills/page.tsx` | Practice hub | Implemented | Needs UX work |
| 21 | Drill sessions | `/dashboard/drills/sessions` | `src/app/dashboard/drills/sessions/page.tsx` | Session history | Implemented | Needs polish |
| 22 | Quiz index | `/quiz` | `src/app/quiz/page.tsx` | Redirect to drills | Implemented | Ready |
| 23 | Quiz setup | `/quiz/[mode]/setup` | `src/app/quiz/[mode]/setup/page.tsx` | Configure session | Implemented | Needs UX work |
| 24 | Quiz session | `/quiz/[mode]/session/[sessionId]` | `src/app/quiz/[mode]/session/[sessionId]/page.tsx` | Active quiz | Implemented | Needs QA |
| 25 | Quiz results | `/quiz/[mode]/session/[sessionId]/results` | `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx` | Results | Implemented | Needs QA |
| 26 | Quiz review | `/quiz/[mode]/session/[sessionId]/review` | `src/app/quiz/[mode]/session/[sessionId]/review/page.tsx` | Review answers | Implemented | Needs QA |
| 27 | Wiki home | `/dashboard/wiki` | `src/app/dashboard/wiki/page.tsx` | Wiki empty/intro state | Partial | Needs UX work |
| 28 | Wiki article | `/dashboard/wiki/[slug]` | `src/app/dashboard/wiki/[slug]/page.tsx` | Article reader | Implemented | Needs polish |
| 29 | Notes | `/dashboard/notes` | `src/app/dashboard/notes/page.tsx` | User notes | Implemented | Needs QA |
| 30 | Flash cards | `/dashboard/flash` | `src/app/dashboard/flash/page.tsx` | Flash-card hub | Implemented | Needs QA |
| 31 | Flash category | `/dashboard/flash/[category]` | `src/app/dashboard/flash/[category]/page.tsx` | Flash-card category | Implemented | Needs QA |
| 32 | Cram card | `/dashboard/cram-card` | `src/app/dashboard/cram-card/page.tsx` | Focused study aid | Implemented | Needs QA |
| 33 | Code updates | `/dashboard/code-updates` | `src/app/dashboard/code-updates/page.tsx` | Update/change feed | Implemented | Needs polish |
| 34 | CampTrails hub | `/dashboard/camptrails` | `src/app/dashboard/camptrails/page.tsx` | Study paths | Implemented | Needs UX work |
| 35 | Trail detail | `/dashboard/camptrails/[slug]` | `src/app/dashboard/camptrails/[slug]/page.tsx` | Trail overview/enroll | Implemented | Needs QA |
| 36 | Trail today | `/dashboard/camptrails/[slug]/today` | `src/app/dashboard/camptrails/[slug]/today/page.tsx` | Daily trail work | Implemented | Needs QA |
| 37 | Trail complete | `/dashboard/camptrails/[slug]/day/[dayNumber]/complete` | `src/app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx` | Completion state | Implemented | Needs QA |
| 38 | Trail legacy shim | `/dashboard/trail` | `src/app/dashboard/trail/page.tsx` | Legacy redirect | Implemented | Ready |
| 39 | Trails legacy shim | `/dashboard/trails` | `src/app/dashboard/trails/page.tsx` | Legacy redirect | Implemented | Ready |
| 40 | 3D Lab hub | `/dashboard/3d-lab` | `src/app/dashboard/3d-lab/page.tsx` | 3D module browser | Implemented | Needs QA |
| 41 | 3D Lab module | `/dashboard/3d-lab/[moduleId]` | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Interactive module | Implemented | Needs QA |
| 42 | Area C hub | `/dashboard/area-c` | `src/app/dashboard/area-c/page.tsx` | Design problem area | Implemented | Needs QA |
| 43 | Area C calculator | `/dashboard/area-c/calculator` | `src/app/dashboard/area-c/calculator/page.tsx` | Area C calculator | Implemented | Needs QA |
| 44 | Design problems | `/dashboard/area-c/design-problems` | `src/app/dashboard/area-c/design-problems/page.tsx` | Problem list | Implemented | Needs QA |
| 45 | Design problem detail | `/dashboard/area-c/design-problems/[problemId]` | `src/app/dashboard/area-c/design-problems/[problemId]/page.tsx` | Problem session | Implemented | Needs QA |
| 46 | Design quiz | `/dashboard/area-c/design-quiz` | `src/app/dashboard/area-c/design-quiz/page.tsx` | Scenario quiz list | Implemented | Needs QA |
| 47 | Design quiz detail | `/dashboard/area-c/design-quiz/[scenarioId]` | `src/app/dashboard/area-c/design-quiz/[scenarioId]/page.tsx` | Scenario quiz | Implemented | Needs QA |
| 48 | Notifications | `/dashboard/notifications` | `src/app/dashboard/notifications/page.tsx` | Notification inbox | Implemented | Needs polish |
| 49 | Settings | `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` | Account/preferences | Partial | Needs feature work |
| 50 | Billing shim | `/dashboard/settings/billing` | `src/app/dashboard/settings/billing/page.tsx` | Legacy redirect | Implemented | Needs feature work |
| 51 | Developer settings shim | `/dashboard/settings/developer` | `src/app/dashboard/settings/developer/page.tsx` | Legacy redirect | Implemented | Ready |
| 52 | Top-level settings shim | `/settings` | `src/app/settings/page.tsx` | Legacy redirect | Implemented | Ready |
| 53 | Upgrade | `/dashboard/upgrade` | `src/app/dashboard/upgrade/page.tsx` | Paywall/plan upgrade | Hidden/partial | Not production-ready |
| 54 | Professional hub | `/dashboard/professional` | `src/app/dashboard/professional/page.tsx` | Passer/pro mode | Implemented | Needs QA |
| 55 | Welcome pro | `/dashboard/welcome-pro` | `src/app/dashboard/welcome-pro/page.tsx` | Pro welcome | Implemented | Needs QA |
| 56 | DAE mode | `/dashboard/dae-mode` | `src/app/dashboard/dae-mode/page.tsx` | Maintenance mode | Implemented | Needs feature decision |
| 57 | Study pods | `/dashboard/pods` | `src/app/dashboard/pods/page.tsx` | Group study | Partial | Needs feature work |
| 58 | Study pod detail | `/dashboard/pods/[podId]` | `src/app/dashboard/pods/[podId]/page.tsx` | Pod detail | Partial | Needs feature work |
| 59 | Studio | `/dashboard/studio` | `src/app/dashboard/studio/page.tsx` | Studio mode | Partial | Needs feature work |
| 60 | Admin login | `/admin/login` | `src/app/admin/login/page.tsx` | Admin sign-in | Implemented | Needs QA |
| 61 | Admin dashboard | `/admin` | `src/app/admin/page.tsx` | Admin overview | Implemented | Needs UX work |
| 62 | Admin knowledge | `/admin/knowledge` | `src/app/admin/knowledge/page.tsx` | Content editor index | Implemented | Needs feature work |
| 63 | Admin article editor | `/admin/knowledge/[id]` | `src/app/admin/knowledge/[id]/page.tsx` | Article edit | Implemented | Needs QA |
| 64 | Admin article new | `/admin/knowledge/new` | `src/app/admin/knowledge/new/page.tsx` | Create article | Implemented | Needs QA |
| 65 | Admin article analytics | `/admin/knowledge/analytics` | `src/app/admin/knowledge/analytics/page.tsx` | Content quality analytics | Implemented | Needs QA |
| 66 | Admin import | `/admin/knowledge/import` | `src/app/admin/knowledge/import/page.tsx` | Bulk import | Implemented | Needs QA |
| 67 | Admin questions | `/admin/knowledge/questions` | `src/app/admin/knowledge/questions/page.tsx` | Question bank | Implemented | Needs QA |
| 68 | Admin question new | `/admin/knowledge/questions/new` | `src/app/admin/knowledge/questions/new/page.tsx` | Create question | Implemented | Needs QA |
| 69 | Admin question detail | `/admin/knowledge/questions/[id]` | `src/app/admin/knowledge/questions/[id]/page.tsx` | Edit question | Implemented | Needs QA |
| 70 | Admin design-problem questions | `/admin/knowledge/questions/design-problems` | `src/app/admin/knowledge/questions/design-problems/page.tsx` | Design problem bank | Implemented | Needs QA |
| 71 | Admin design-problem detail | `/admin/knowledge/questions/design-problems/[id]` | `src/app/admin/knowledge/questions/design-problems/[id]/page.tsx` | Edit design problem | Implemented | Needs QA |
| 72 | Admin scenario questions | `/admin/knowledge/questions/scenarios` | `src/app/admin/knowledge/questions/scenarios/page.tsx` | Scenario bank | Implemented | Needs QA |
| 73 | Admin scenario detail | `/admin/knowledge/questions/scenarios/[id]` | `src/app/admin/knowledge/questions/scenarios/[id]/page.tsx` | Edit scenario | Implemented | Needs QA |
| 74 | Admin taxonomy | `/admin/taxonomy` | `src/app/admin/taxonomy/page.tsx` | Taxonomy editor | Implemented | Needs QA |
| 75 | Admin coverage | `/admin/taxonomy/coverage` | `src/app/admin/taxonomy/coverage/page.tsx` | Coverage map | Implemented | Needs QA |
| 76 | Admin assets | `/admin/assets` | `src/app/admin/assets/page.tsx` | Asset library | Implemented | Needs QA |
| 77 | Admin asset detail | `/admin/assets/[id]` | `src/app/admin/assets/[id]/page.tsx` | Asset detail | Implemented | Needs QA |
| 78 | Admin 3D models | `/admin/3d-models` | `src/app/admin/3d-models/page.tsx` | 3D registry ops | Implemented | Needs QA |
| 79 | Admin reviews | `/admin/reviews` | `src/app/admin/reviews/page.tsx` | Review queue | Implemented | Needs QA |
| 80 | Admin pipeline | `/admin/pipeline` | `src/app/admin/pipeline/page.tsx` | Publishing pipeline | Implemented | Needs UX work |
| 81 | Admin search | `/admin/search` | `src/app/admin/search/page.tsx` | Content search | Implemented | Needs QA |
| 82 | Admin audit | `/admin/audit` | `src/app/admin/audit/page.tsx` | Audit logs | Implemented | Needs QA |
| 83 | Admin activity | `/admin/activity` | `src/app/admin/activity/page.tsx` | Activity feed | Implemented | Needs QA |
| 84 | Admin settings | `/admin/settings` | `src/app/admin/settings/page.tsx` | Admin roles | Partial | Needs feature work |
| 85 | Admin preview | `/admin/preview/[previewId]` | `src/app/admin/preview/[previewId]/page.tsx` | Preview content | Implemented | Needs QA |
| 86 | Admin wiki shim | `/admin/wiki` | `src/app/admin/wiki/page.tsx` | Legacy redirect | Implemented | Ready |
| 87 | Developer home | `/developer` | `src/app/developer/page.tsx` | Internal portal | Implemented | Needs polish |
| 88 | Developer API reference | `/developer/api-reference` | `src/app/developer/api-reference/page.tsx` | API docs | Implemented | Needs freshness |
| 89 | Developer architecture | `/developer/architecture` | `src/app/developer/architecture/page.tsx` | Architecture docs | Partial | Needs freshness |
| 90 | Developer status | `/developer/status` | `src/app/developer/status/page.tsx` | Status overview | Partial | Needs feature work |
| 91 | Developer DB status | `/developer/status/database` | `src/app/developer/status/database/page.tsx` | DB status | Partial | Needs feature work |
| 92 | Developer infra status | `/developer/status/infrastructure` | `src/app/developer/status/infrastructure/page.tsx` | Infra status | Partial | Needs feature work |
| 93 | Developer tools | `/developer/tools` | `src/app/developer/tools/page.tsx` | Tool index | Implemented | Needs polish |
| 94 | Developer console | `/developer/tools/console` | `src/app/developer/tools/console/page.tsx` | Debug controls | Partial | Needs safety QA |
| 95 | Developer DB browser | `/developer/tools/db` | `src/app/developer/tools/db/page.tsx` | DB table view | Implemented | Needs QA |
| 96 | Developer logs | `/developer/tools/logs` | `src/app/developer/tools/logs/page.tsx` | Audit/error logs | Implemented | Needs QA |
| 97 | Developer test data | `/developer/tools/test-data` | `src/app/developer/tools/test-data/page.tsx` | Test data tools | Partial | Needs safety QA |
| 98 | CEO home | `/ceo` | `src/app/(protected)/ceo/page.tsx` | CEO dashboard | Implemented | Needs QA |
| 99 | CEO analytics | `/ceo/analytics` | `src/app/(protected)/ceo/analytics/page.tsx` | CEO analytics | Implemented | Needs QA |
| 100 | CEO financials | `/ceo/financials` | `src/app/(protected)/ceo/financials/page.tsx` | Financial view | Partial | Needs feature work |
| 101 | CEO insights | `/ceo/insights` | `src/app/(protected)/ceo/insights/page.tsx` | Insights | Partial | Needs feature work |
| 102 | CEO team | `/ceo/team` | `src/app/(protected)/ceo/team/page.tsx` | Team view | Partial | Needs feature work |
| 103 | Tools index | `/tools` | `src/app/tools/page.tsx` | Public tools | Implemented | Needs polish |
| 104 | Lot plotter | `/tools/lot-plotter` | `src/app/tools/lot-plotter/page.tsx` | Lot plotting tool | Implemented | Needs QA |
| 105 | Wall paint tool | `/tools/wall-paint-calculator` | `src/app/tools/wall-paint-calculator/page.tsx` | Paint calculator | Implemented | Needs QA |
| 106 | Floor tiles tool | `/tools/floor-tiles-calculator` | `src/app/tools/floor-tiles-calculator/page.tsx` | Tile calculator | Implemented | Needs QA |
| 107 | Calculators suite | `/calculators` | `src/app/calculators/page.tsx` | Calculator index | Implemented | Needs consolidation |
| 108 | CHB calculator | `/calculators/chb` | `src/app/calculators/chb/page.tsx` | CHB calculator | Implemented | Needs consolidation |
| 109 | Drywall calculator | `/calculators/drywall` | `src/app/calculators/drywall/page.tsx` | Drywall calculator | Implemented | Needs consolidation |
| 110 | Flooring calculator | `/calculators/flooring` | `src/app/calculators/flooring/page.tsx` | Flooring calculator | Implemented | Needs consolidation |
| 111 | Paint calculator | `/calculators/paint` | `src/app/calculators/paint/page.tsx` | Paint calculator | Implemented | Needs consolidation |
| 112 | 3D test route shim | `/test-3d` | `src/app/test-3d/page.tsx` | Protected redirect to 3D Lab | Implemented | Ready |

## 5. Screen-by-Screen Audit

The inventory above covers every current page route. This section audits the route families screen-by-screen by user-facing surface to avoid repeating identical shell findings for many dynamic/detail routes.

### Public Marketing Entry

**Route:** `/`, `/about`, `/contact`, `/pricing`, `/try`
**Files/Components:** `src/app/page.tsx`, `src/app/pricing/page.tsx`, `src/app/pricing/pricing-content.tsx`, marketing components, `.ai/02_audits/2026-04-25-public-claim-matrix.md`
**Purpose:** Explain product value, collect interest/support, start a free readiness path.
**Current Status:** Implemented, but claims and payments are not fully production-stable.
**Readiness Score:** 3/5

#### What Exists Now

Landing metadata promises a Readiness Score, expert-verified wiki, taxonomy heatmap, and interactive 3D models. Pricing now narrows copy when payments are disabled and shows free access. Contact copy has been tightened. `/try` provides a public sample path.

#### UX Findings

- Strong value proposition for ALE candidates.
- Public pricing is safer while payments are disabled.
- Metadata still over-promises "expert-verified wiki" unless review/publish evidence is made user-visible.
- `/try` is valuable but should explicitly bridge into account creation and onboarding with what happens next.

#### UI Findings

- Marketing surfaces are visually stronger than some product surfaces, creating a polish gap after login.
- Large hero claims need evidence-backed supporting UI rather than purely marketing copy.

#### Feature Specification Findings

- Paid checkout is not live; hidden plan data remains in code.
- Contact/support is basic; no in-app support/report-content path is visible in settings.

#### Accessibility Findings

- Needs full keyboard and screen-reader pass on marketing navigation, forms, and tabs.
- Public form errors should follow WAI label/error guidance.

#### Responsive Findings

- Marketing pages likely handle standard breakpoints, but no screenshot QA was run in this pass.

#### Design System / Code Findings

- Marketing occasionally uses distinct display patterns and imported serif styling. Keep it intentional and isolated from app/dashboard surfaces.

#### What Should Be Done

- Align metadata with shipped evidence.
- Add a clear `/try` completion handoff: create account -> setup -> first diagnostic.
- Keep payments disabled copy until billing management is actually shipped.

#### Acceptance Criteria

- Public metadata contains only claims evidenced by current routes/features.
- `/try` ends with one primary CTA and clear post-signup expectation.
- Pricing has no self-serve billing promise while `FEATURE_PAYMENTS_ENABLED` is false.

#### Priority

P1 High

#### Effort

Medium

#### Readiness Impact

Reduces trust risk before external users see the product.

### Authentication And Recovery

**Route:** `/login`, `/register`, `/forgot-password`, `/auth/reset-password`, `/admin/login`
**Files/Components:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/auth/reset-password/page.tsx`, `src/app/admin/login/page.tsx`
**Purpose:** Account access and recovery.
**Current Status:** Implemented.
**Readiness Score:** 3/5

#### What Exists Now

Login/register are centered, focused pages with Google-oriented copy. Forgot password sends a reset link and now targets the reset-password route. The reset route exists after recent route stabilization.

#### UX Findings

- Clear single-purpose auth pages.
- Register copy frames the product around a study trail.
- Need stronger account-state handling: existing session, email already registered, email verification, provider errors, and expired reset links.

#### UI Findings

- Layout is calm and compact.
- Login uses logo, register uses text brand. Standardize brand treatment.

#### Feature Specification Findings

- Password/security management is not exposed after login in settings.
- Admin login bypasses portal chrome correctly, but admin unauthorized handling should be QA-proven.

#### Accessibility Findings

- Forgot password has labels and `role="alert"` for errors.
- Auth provider buttons need accessible loading/status announcement checks.

#### Responsive Findings

- Single-column forms should work on mobile, but touch target and keyboard navigation should be verified.

#### Design System / Code Findings

- Some auth files use double quotes/semicolon style while repo style is mixed. Not a UX blocker, but consistency matters.

#### What Should Be Done

- Add explicit reset-link expired/invalid states.
- Add account/security settings after login.
- Standardize auth brand header.

#### Acceptance Criteria

- All auth failure paths show plain-language error, next action, and accessible status.
- Reset password supports expired links and successful recovery confirmation.
- Settings exposes password/security/session controls or clearly states provider-managed account mode.

#### Priority

P1 High

#### Effort

Medium

#### Readiness Impact

Reduces account lockout and support risk.

### Onboarding

**Route:** `/onboarding`, `/onboarding/comp-exam`
**Files/Components:** `src/app/(auth)/onboarding/page.tsx`, `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`, `src/app/(auth)/onboarding/comp-exam/*`, `src/app/dashboard/settings/profile-card.tsx`
**Purpose:** Capture discipline, reviewer type, exam date, study window, review center, and weak subjects.
**Current Status:** Implemented and partially hardened.
**Readiness Score:** 3/5

#### What Exists Now

Onboarding has multi-step screens: main setup, review center, coexistence, calibration. It tracks events and submits setup. Users can skip, but skip now has duplicate-submit protection, visible failure feedback, and clearer "finish later" behavior. Completed users are redirected away from onboarding, dashboard/settings now share a merged onboarding-completion source of truth, and the first dashboard card gives a three-step activation checklist.

#### UX Findings

- Good intent: asks relevant ALE preparation questions.
- Weakness: skip recovery and the first dashboard checklist are clearer, but the full activation path still needs authenticated browser proof and tutorial depth.
- Weakness: first-takers do not get a clear first diagnostic choice; returning reviewees get more tailored weak-subject input.
- No draft persistence across refresh/back.
- No "you are here" explanation connecting setup to the next product action.

#### UI Findings

- Focused card layout is understandable.
- Some controls use custom button/radio patterns that need keyboard and name/role verification.
- `Continue ->` copy is clear but not fully SlateCamp-specific; skip copy is now clearer about finishing later.

#### Feature Specification Findings

- Setup completion now validates active discipline before marking setup complete from settings.
- No explicit re-run onboarding/recalibrate path after initial setup.
- No tutorial preference capture.

#### Accessibility Findings

- Radio cards include real inputs, which is good.
- Custom subject buttons acting like checkboxes need `aria-pressed` or checkbox semantics.
- Calibration status needs screen-reader status announcements.

#### Responsive Findings

- Narrow card likely works on mobile; later review-center/coexistence screens need overflow QA.

#### Design System / Code Findings

- Some uppercase high-tracking labels conflict with current design guidance that letter spacing should be restrained.

#### What Should Be Done

- Keep the clearer "finish later in settings" path and validate the new first dashboard checklist in authenticated browser QA.
- Persist draft state locally until submission.
- Add first-run target experience: setup -> diagnostic -> first insight -> recommended trail.
- Add a settings action to "Recalibrate study profile."

#### Acceptance Criteria

- New user cannot arrive at a blank/ambiguous dashboard after skipping.
- Onboarding can be resumed without losing answers.
- Screen-reader users hear submission/loading/error/success state.
- Onboarding completion opens a clear next action.

#### Priority

P0 Critical

#### Effort

Large

#### Readiness Impact

This is the highest-leverage product-readiness fix because it shapes the user's first mental model.

### Dashboard Shell And Home

**Route:** `/dashboard` and dashboard layout shell
**Files/Components:** `src/app/dashboard/page.tsx`, `src/components/dashboard/DashboardLayoutContent.tsx`, `src/components/sidebar/*`, `src/components/shared/Navbar.tsx`, `src/components/shared/DashboardHeader.tsx`, `src/lib/routes.ts`
**Purpose:** Main student study cockpit.
**Current Status:** Implemented with many modules.
**Readiness Score:** 3/5

#### What Exists Now

The dashboard streams many cards through Suspense: welcome guide, professional transition, results banner, streak, hero/score/heatmap, daily dose, review calendar, activity feed, daily wiki, subject mastery, review-center sync, and Bloom tracker. Shell includes sidebar, mobile drawer/topbar, breadcrumbs, header, dev toolbar, providers, and toasts.

#### UX Findings

- Rich and useful for returning users.
- First-time user hierarchy risks overload: many widgets compete before the user has taken a first session.
- Welcome guide exists, but the dashboard needs a persistent activation spine, not only an optional guide.
- Header titles depend on `getPageTitle`; dynamic route title coverage is partial.

#### UI Findings

- Dense dashboard style is appropriate for repeated study.
- `gap-2` and many cards can feel cramped without clear prioritization.
- Mobile has both `MobileSidebarShell` and `Navbar` patterns in the shell, increasing nav complexity.

#### Feature Specification Findings

- Dashboard assumes enough data exists; several widgets may show empty/null/hidden states.
- Incomplete onboarding redirects are good, but settings exception creates a second setup path.

#### Accessibility Findings

- Sidebar has `aria-label`, skip links exist in portal layouts, but dashboard needs skip-to-main.
- Toast and async widget updates need status-message proof.

#### Responsive Findings

- Grid breakpoints exist, but full dashboard needs 360/390/768/1440 viewport QA to check overflow and sticky/fixed overlaps.

#### Design System / Code Findings

- Dashboard shell is high-responsibility and aligns with existing finding `ARC-002`.
- Duplicate nav sources increase route drift risk.

#### What Should Be Done

- Add "Today in SlateCamp" activation card above dashboard widgets for new users.
- Add dashboard skip link and consistent main landmark.
- Audit mobile nav duplication.
- Standardize data-empty fallback for each streamed widget.

#### Acceptance Criteria

- A new user with no sessions sees exactly one primary next action.
- Returning user sees score/next review/trail priority without scanning all cards.
- Every streamed widget has loading, empty, error, and success state.
- Dashboard passes mobile screenshot QA at 360, 390, 768, 1440 widths.

#### Priority

P1 High

#### Effort

Large

#### Readiness Impact

Improves activation, retention, and perceived product coherence.

### Practice And Quiz

**Route:** `/dashboard/drills`, `/dashboard/drills/sessions`, `/quiz`, `/quiz/[mode]/setup`, `/quiz/[mode]/session/[sessionId]`, `/quiz/[mode]/session/[sessionId]/results`, `/quiz/[mode]/session/[sessionId]/review`
**Files/Components:** `src/app/dashboard/drills/page.tsx`, `src/components/testing/hub/ReviewHub.tsx`, `src/components/testing/hub/HeroConfigurator.tsx`, `src/app/quiz/[mode]/*`, `src/components/quiz-v2/*`
**Purpose:** Configure, take, complete, and review practice sessions.
**Current Status:** Implemented.
**Readiness Score:** 3/5

#### What Exists Now

Drills pulls sessions, stats, focus review queues, weak nodes, core subjects, and successive relearning cycles. Quiz setup supports many modes and shortcuts. Active sessions restore answers and choose shell by mode.

#### UX Findings

- Strong practice engine breadth.
- Hero configurator is powerful but may be too abstract: "Canvas", "60/30/10 logic", and slide-to-start can be unclear for novice users.
- Slide-to-submit has novelty but must not block keyboard users.
- Session leave guard exists in sidebar.

#### UI Findings

- Dialog for session preparation has title/description and focus-trap primitives.
- Subject chips use rounded-full, which is acceptable for pills but should be consistent.
- Error messages are visible but need `role="alert"`/`aria-live`.

#### Feature Specification Findings

- No-questions and entitlement errors are handled.
- Need explicit empty state for no taxonomy/discipline and no sessions.
- Need acceptance tests for all modes, especially `full_exam`, `endurance`, and `article_review`.

#### Accessibility Findings

- `SlideToSubmit` requires keyboard alternative verification.
- Tooltip-only validation for no subject selection is insufficient because tooltips are not reliable form errors.

#### Responsive Findings

- Quiz shell needs mobile landscape and small-screen proof. Timed/full exam modes are high risk.

#### Design System / Code Findings

- Good use of dialog primitives.
- Needs shared form/status patterns across setup and active session.

#### What Should Be Done

- Add a standard Start button fallback or make slide control fully keyboard accessible.
- Replace tooltip-only validation with inline alert text.
- Add first-run mode recommendation.
- Add route tests for mode setup and session access.

#### Acceptance Criteria

- Keyboard-only user can configure and start a quiz.
- No subject/no question/pro-required states render inline, persistent, accessible errors.
- All quiz modes have smoke coverage.

#### Priority

P1 High

#### Effort

Medium

#### Readiness Impact

Practice is a core product promise; friction here directly reduces product value.

### Analytics And Readiness

**Route:** `/dashboard/analytics`, `/dashboard/analytics/advanced`, `/dashboard/heatmap`, `/dashboard/assessment`, `/dashboard/score-reveal`, `/dashboard/results-day`, `/dashboard/exam-outcome`
**Files/Components:** `src/app/dashboard/analytics/page.tsx`, `src/components/analytics/*`, `src/app/dashboard/assessment/page.tsx`, `src/components/assessment/*`
**Purpose:** Show readiness, performance, pacing, mastery, stamina, and outcomes.
**Current Status:** Implemented but data-state quality varies.
**Readiness Score:** 3/5

#### What Exists Now

Analytics page renders many chart sections with `AnalyticsChartContainer` and `ChartEmptyState`. Assessment redirects silently if completed, missing discipline, or no questions. Heatmap is now a shim to a real dashboard/analytics destination.

#### UX Findings

- Analytics breadth is compelling for returning users.
- For new users, many empty charts can feel like failure instead of guidance.
- Silent redirects from assessment hide why a diagnostic is unavailable.

#### UI Findings

- Chart containers and skeletons create good performance perception.
- Density is high; chart priority and grouping need clearer explanatory copy.

#### Feature Specification Findings

- Heatmap promise needs one canonical route/experience.
- Assessment unavailability needs explicit state.
- Advanced analytics should be gated by enough data and explain minimum data requirements.

#### Accessibility Findings

- Some charts expose `role="img"` labels, but not all.
- Empty chart states need next-action CTAs, not just descriptions.

#### Responsive Findings

- Many chart grids need mobile/tablet overflow QA.

#### Design System / Code Findings

- `ChartEmptyState` is marked deprecated and should be replaced with `EmptyState variant="card"` directly.

#### What Should Be Done

- Define a canonical heatmap/readiness surface.
- Add "not enough data yet" templates with direct CTAs.
- Add chart accessibility contract.
- Replace deprecated chart-empty shim.

#### Acceptance Criteria

- Every chart has a loading, empty, error, and accessible text alternative.
- New users see data requirements and next action.
- Heatmap links land on a real, named heatmap/readiness section.

#### Priority

P1 High

#### Effort

Large

#### Readiness Impact

Makes the readiness intelligence promise trustworthy.

### Wiki, Notes, Flash, And Study Content

**Route:** `/dashboard/wiki`, `/dashboard/wiki/[slug]`, `/dashboard/notes`, `/dashboard/flash`, `/dashboard/flash/[category]`, `/dashboard/cram-card`, `/dashboard/code-updates`
**Files/Components:** `src/app/dashboard/wiki/*`, `src/components/wiki/*`, `src/app/dashboard/notes/page.tsx`, `src/components/notes/NotesShell`, flash components
**Purpose:** Study content, notes, article reading, and recall aids.
**Current Status:** Implemented with polish gaps.
**Readiness Score:** 3/5

#### What Exists Now

Wiki article pages are robust: header, hero, article content, right sidebar, teach-back, wrong-answer banner, read tracker, sources, siblings. Wiki root is more of an instructional empty state. Notes loads notes/folders and opens a shell. Flash has categories and category detail.

#### UX Findings

- Article reader has strong study affordances.
- Wiki root tells users to use the taxonomy sidebar, which may not be visible or obvious on all screen sizes.
- Notes page returns `null` if user is missing; layout guard usually prevents this, but local page fallback is weak.

#### UI Findings

- Wiki article layout has strong reading structure.
- Wiki root uses monospace uppercase feature labels that may conflict with updated design guidance.

#### Feature Specification Findings

- Need report-content/source issue path from wiki/article.
- Need article verification status visible if claiming expert-verified wiki.
- Need notes empty state and create-note CTA verified.

#### Accessibility Findings

- Article content needs heading order and skip-link verification.
- Sticky sidebars and mobile actions need keyboard/focus QA.

#### Responsive Findings

- Wiki sidebars hide on smaller screens; mobile action discoverability needs real browser QA.

#### Design System / Code Findings

- Good use of shared wiki components.
- Source/related/practice actions should use consistent button hierarchy.

#### What Should Be Done

- Add article trust/status metadata.
- Add "report an issue" or "suggest correction" flow.
- Improve Wiki root as a searchable/browsable landing page.

#### Acceptance Criteria

- Wiki root works as a standalone starting point without relying on hidden sidebar knowledge.
- Article displays source/review status when available.
- Notes has actionable empty state and keyboard-accessible editor controls.

#### Priority

P1 High

#### Effort

Medium

#### Readiness Impact

Protects the knowledge-quality promise.

### CampTrails

**Route:** `/dashboard/camptrails`, `/dashboard/camptrails/[slug]`, `/dashboard/camptrails/[slug]/today`, completion route, legacy trail/trails shims
**Files/Components:** `src/app/dashboard/camptrails/*`, `src/components/trails/*`, `src/lib/queries/trails.ts`
**Purpose:** Structured daily study path.
**Current Status:** Implemented, needs first-run integration.
**Readiness Score:** 3/5

#### What Exists Now

CampTrails lists published trails, user enrollments, recommendations, active trail banners, trail library, detail pages, week previews, and empty state. Legacy `/dashboard/trail` and `/dashboard/trails` redirect to `/dashboard/camptrails`.

#### UX Findings

- Good core concept: daily study prescription.
- Empty state says trails are "coming soon" and suggests practice/Wiki but lacks direct CTAs.
- Recommendation should appear in onboarding/dashboard first-run path.

#### UI Findings

- Detail pages use clear hierarchy and progressive disclosure via details/summary.
- Duplicate enroll CTA appears top and bottom, which is reasonable but needs priority consistency.

#### Feature Specification Findings

- Need clear enrollment states: active, paused, completed, abandoned, resume.
- Need daily task completion recovery and undo rules.

#### Accessibility Findings

- `details/summary` is accessible by default, but custom styling should preserve focus and disclosure indicators.

#### Responsive Findings

- Week previews and day rows can overflow on narrow screens if titles are long.

#### Design System / Code Findings

- Uses several local trail components; ensure shared empty/action patterns.

#### What Should Be Done

- Add CTAs to empty state.
- Wire recommended trail into first-run dashboard.
- Add trail state matrix and QA fixtures.

#### Acceptance Criteria

- New user sees one recommended trail after diagnostic/setup.
- Empty trail state offers "Start Camp Mode" and "Open Wiki" actions.
- Active/enrolled/completed states are visually distinct and tested.

#### Priority

P1 High

#### Effort

Medium

#### Readiness Impact

Turns the app from a feature set into a guided study product.

### 3D Lab

**Route:** `/dashboard/3d-lab`, `/dashboard/3d-lab/[moduleId]`, `/test-3d`
**Files/Components:** `src/app/dashboard/3d-lab/*`, `src/features/3d-lab/components`, `src/features/3d-lab/config/registry`, `.ai/10_state/findings-register.md`
**Purpose:** Interactive architectural/code visualization.
**Current Status:** Implemented but high-risk.
**Readiness Score:** 3/5

#### What Exists Now

3D Lab dashboard module routes are entitlement-gated through `getViewerEntitlements`. Module route validates module existence, handles legacy wall-configurator redirect, and renders `ModuleViewer`. `/test-3d` now redirects to the protected dashboard 3D Lab and is no longer part of public route smoke coverage.

#### UX Findings

- Strong differentiator for SlateCamp.
- Gate CTA points to settings, which is not a real billing/upgrade solution yet.
- Need tutorials for orbit, pan, hotspots, sliders, and what students are meant to learn.

#### UI Findings

- 3D surfaces require visual QA for nonblank canvas, controls, mobile framing, and collision with shell UI.

#### Feature Specification Findings

- `.ai/10_state/findings-register.md` identifies 3D registry authority drift.
- The former public `/test-3d` bypass has been closed; remaining risk is visual reliability, mobile layout, fallback content, and registry authority drift.

#### Accessibility Findings

- 3D interactions need keyboard alternatives, text equivalents, reduced-motion handling, and fallback learning content.

#### Responsive Findings

- High risk on mobile and tablet due canvas/control density.

#### Design System / Code Findings

- 3D module files are among known large/complex hotspots.

#### What Should Be Done

- Keep `/test-3d` as a protected redirect shim only; do not expose it in public navigation.
- Add module-level help/tutorial overlays or side-panel instructions.
- Add visual QA checklist and screenshots for core modules.
- Consolidate 3D registry authorities.

#### Acceptance Criteria

- Every 3D module has nonblank render proof at desktop and mobile.
- Each module has keyboard/fallback content path.
- `/test-3d` remains classified as protected and excluded from public route smoke targets.

#### Priority

P1 High

#### Effort

Large

#### Readiness Impact

Protects a flagship differentiator from becoming a reliability liability.

### Settings, Notifications, And Account

**Route:** `/dashboard/settings`, `/dashboard/notifications`, settings shims
**Files/Components:** `src/app/dashboard/settings/page.tsx`, `profile-card.tsx`, `NotificationPreferences.tsx`, `NotificationList.tsx`
**Purpose:** Profile, preferences, notifications, account mode, logout.
**Current Status:** Partial, with Account Center remediation started.
**Readiness Score:** 3/5

#### What Exists Now

Settings includes profile/avatar/exam date, discipline, theme, email notifications, notification preferences, professional mode, logout, and a new Account Center that exposes current access, billing state, password reset, privacy/support contact, and disabled-billing truth. Notification page includes filters, mark all read, settings link, and empty state.

#### UX Findings

- Good base for study preferences.
- Still missing expected production settings: active sessions, connected accounts, self-serve billing/subscription management, privacy export/delete, accessibility/density/reduced motion, quiet hours UI, and reset onboarding/recalibration.
- Notification copy says "camp updates", which should be checked against Campfire cleanup and product voice.

#### UI Findings

- Settings max width is calm and readable.
- Multiple standalone cards are good, but no left nav or sections for larger account center.

#### Feature Specification Findings

- `quiet_hours_start/end` exist in preference shape but no UI controls.
- Billing route redirects to settings and now lands on a visible account/billing status section.
- Profile upload shows format guidance but needs server-side validation/user-facing max size.

#### Accessibility Findings

- Switches have aria-labels.
- Notification preference saves now include success/error toast feedback and an aria-live status region; other settings mutations still need the same pattern.

#### Responsive Findings

- Settings likely works on mobile, but multiple forms need keyboard and zoom QA.

#### Design System / Code Findings

- `campfire` remains in default notification prefs for compatibility but is hidden from UI. Keep until DB cleanup.

#### What Should Be Done

- Continue rebuilding settings into sections: Profile, Learning, Notifications, Security, Billing, Privacy, Accessibility, Support.
- Expand the new billing status into self-serve billing history/cancellation once payments are enabled.
- Add quiet hours controls.
- Add reset/recalibrate onboarding.
- Add delete/export data with confirmations.

#### Acceptance Criteria

- Settings answers "who am I, what plan am I on, how do I secure my account, what notifications do I get, how do I get help, how do I leave?"
- Every setting mutation has loading, success, error, and rollback behavior.
- Billing shim lands on a visible billing/account status section.

#### Priority

P0 Critical

#### Effort

Large

#### Readiness Impact

Production users expect account control and recovery.

### Payments And Upgrade

**Route:** `/pricing`, `/dashboard/upgrade`, checkout API
**Files/Components:** `src/app/pricing/*`, `src/app/dashboard/upgrade/page.tsx`, `src/lib/constants/feature-flags.ts`, `src/lib/payments/provider.ts`, `src/lib/lemonsqueezy/config.ts`, `src/lib/payrex/config.ts`
**Purpose:** Monetization and plan upgrade.
**Current Status:** Hidden/partial.
**Readiness Score:** 1/5 for production billing, 3/5 for safe disabled state.

#### What Exists Now

Payments are disabled by feature flag. Pricing shows free access. Upgrade route redirects to dashboard when payments are disabled. Payment provider behavior now fails closed with a typed unavailable error and the checkout API returns 503 when billing is disabled or unavailable. LemonSqueezy still returns `null` from `getLemonSqueezy()`, so it remains unavailable until the SDK/provider contract is implemented. PayRex and LemonSqueezy webhook subscription writes now upsert canonical subscription rows, but live provider-contract verification is still required before launch.

#### UX Findings

- Safe current behavior avoids asking for payment when billing is off.
- If payments are re-enabled, current upgrade copy includes testimonial/social proof and plan claims that need fresh evidence.

#### UI Findings

- Upgrade page has strong conversion framing but may be too sales-heavy for a trust-sensitive review product.

#### Feature Specification Findings

- No self-serve billing management.
- No billing history, cancellation, plan status, failed payment recovery, refund/support path.
- Re-enabling payments without live provider QA still risks unhandled provider events, incomplete billing recovery, cancellation gaps, or support issues.

#### Accessibility Findings

- Pricing tabs and checkout buttons need keyboard/ARIA QA before billing launch.

#### Responsive Findings

- Pricing grids and upgrade comparison table need mobile overflow QA.

#### Design System / Code Findings

- LemonSqueezy is stubbed and PayRex path exists. Provider unavailability now fails closed; do not expose dual-provider ambiguity to users or operators.

#### What Should Be Done

- Keep payments disabled publicly until account/billing settings exist.
- If launching billing, define a billing PRD, implement provider-specific checkout/webhook contracts, keep subscription upsert/idempotency tests, and audit all pricing/upgrade copy.

#### Acceptance Criteria

- User can see current plan, billing state, supported payment provider, cancellation/support path.
- Paid webhook processing creates or updates the subscription row exactly once and grants the expected entitlement.
- Checkout success/cancel returns to a real billing status section.
- No unverifiable testimonials or unsupported payment claims.

#### Priority

P0 Critical while billing is considered for launch; P1 High if payments remain disabled.

#### Effort

Large

#### Readiness Impact

Prevents revenue-flow trust and support failures.

### Admin

**Route:** `/admin` and admin subtree
**Files/Components:** `src/app/admin/layout.tsx`, `src/app/admin/_components/AdminShell.tsx`, `src/app/admin/page.tsx`, `src/app/admin/knowledge/page.tsx`, admin pages/components/actions, `.ai/02_audits/ADMIN_SURFACE_AUDIT.md`
**Purpose:** Content, review, publishing, taxonomy, assets, audit, roles, and operations.
**Current Status:** Implemented, not fully production-hardened.
**Readiness Score:** 3/5

#### What Exists Now

Admin layout gates users by role, wraps pages in portal shell, and supports full-bleed editor paths. Admin shell includes grouped sidebar and command palette. Dashboard shows coverage gaps, needs attention, stats, distribution, quick actions, and recent activity. Knowledge index fetches article/question/taxonomy/stats in one large call.

#### UX Findings

- Good operational breadth.
- Admin information architecture is logical but broad.
- Quick actions and nav duplicate route definitions manually.
- Recent activity uses raw actor ID slices, which is poor operator UX.
- Audit/activity trust model is not obvious.

#### UI Findings

- Portal shell is stable and has skip link.
- Metadata has mojibake in at least admin settings/reviews titles (`â€”`).
- Dense editor/index pages need usability tests.

#### Feature Specification Findings

- Need explicit workflow states: draft, review, changes requested, approved, published, archived.
- Need destructive-action policy for archive/delete/bulk changes.
- Need role matrix visible to admins.
- Need import validation report and rollback expectations.

#### Accessibility Findings

- Command palette, tree editors, tables, modals, and full-bleed editors require keyboard/focus audits.

#### Responsive Findings

- Admin is likely desktop-first. If mobile support is not intended, say so and enforce minimum-width messaging.

#### Design System / Code Findings

- Admin shell hardcodes routes outside `ROUTES.admin`.
- Content index overfetch is an existing performance finding.
- Unified editor components are known large hotspots.

#### What Should Be Done

- Centralize admin nav/command pages from a route registry.
- Add admin workflow/status labels and role matrix.
- Add trust labels for live vs synthesized logs/activity.
- Split or paginate content editor index.
- Fix mojibake metadata.

#### Acceptance Criteria

- Admin can complete article/question create -> review -> publish with clear state and recovery.
- Bulk/destructive actions require confirmation and show result summaries.
- Admin nav and command palette share one registry.
- No admin metadata mojibake.

#### Priority

P1 High

#### Effort

Large

#### Readiness Impact

Admin quality controls product truth.

### Developer Portal

**Route:** `/developer` and developer subtree
**Files/Components:** `src/app/developer/*`, `src/app/developer/_components/DevPortalShell.tsx`, `src/lib/developer/surface-registry.ts`, `.ai/02_audits/DEVELOPER_SURFACE_AUDIT.md`
**Purpose:** Internal docs, tools, status, DB, logs, API reference.
**Current Status:** Useful but mixed-trust.
**Readiness Score:** 3/5

#### What Exists Now

Developer portal is entitlement-gated. It includes health/status, repo metrics, API reference, architecture, tools, DB browser, logs, console, and test data. Truth notes label some surfaces as fallback/mixed/runtime-backed.

#### UX Findings

- Strong internal operator surface.
- Mixed source truth is acknowledged, which is good.
- Static architecture/API data can drift.

#### UI Findings

- Portal shell and env badge are strong.
- Dense tables need overflow and keyboard checks.

#### Feature Specification Findings

- Status pages are not fully runtime-backed.
- Test-data and console tools need strong safety labels and non-production protections.

#### Accessibility Findings

- Tables need header semantics and keyboard search/filter QA.

#### Responsive Findings

- Developer tools should be desktop-optimized; mobile can be readable but not necessarily fully operational.

#### Design System / Code Findings

- Surface registry is a good pattern and should influence admin nav.

#### What Should Be Done

- Promote truth labels to every mixed/static page.
- Generate static architecture/API data where possible.
- Add production safety confirmation for mutating dev tools.

#### Acceptance Criteria

- Every developer page declares runtime/static/mock truth.
- Mutating tools cannot run in production accidentally.
- DB/log tables have accessible table/search behavior.

#### Priority

P2 Medium

#### Effort

Medium

#### Readiness Impact

Improves internal observability and reduces operator error.

### CEO And Internal Business Views

**Route:** `/ceo`, `/ceo/analytics`, `/ceo/financials`, `/ceo/insights`, `/ceo/team`
**Files/Components:** `src/app/(protected)/ceo/*`, `src/lib/queries/ceo/*`
**Purpose:** Founder/business dashboard.
**Current Status:** Partial.
**Readiness Score:** 2/5

#### What Exists Now

Protected CEO routes exist with loading states and query helpers.

#### UX Findings

- Useful internally, but not required for student launch.
- Must clearly distinguish real metrics from placeholder/insufficient data.

#### UI Findings

- Needs consistency with developer/admin portal or dashboard depending intended audience.

#### Feature Specification Findings

- Financial/team/insights views should have data contracts and empty-state explanations.

#### Accessibility Findings

- Charts/tables need accessible summaries.

#### Responsive Findings

- Desktop-first is acceptable if documented.

#### Design System / Code Findings

- Keep internal views out of student IA and public promises.

#### What Should Be Done

- Mark as internal-only and exclude from launch-critical path unless business ops need it.

#### Acceptance Criteria

- CEO pages are gated, truth-labeled, and not linked from student flows.

#### Priority

P3 Low for public launch

#### Effort

Medium

#### Readiness Impact

Low student impact, high internal clarity.

### Tools And Calculators

**Route:** `/tools`, `/tools/*`, `/calculators`, `/calculators/*`, `/test-3d`
**Files/Components:** `src/app/tools/*`, `src/app/calculators/*`, `src/app/test-3d/page.tsx`
**Purpose:** Public/student utilities and test surface.
**Current Status:** Implemented with consolidation gaps.
**Readiness Score:** 3/5 for calculators, 1/5 for `/test-3d`.

#### What Exists Now

There are two calculator namespaces, plus a public 3D test route.

#### UX Findings

- Duplicate calculator namespaces can confuse users and SEO.
- `/test-3d` is not a production user concept.

#### UI Findings

- Calculator pages need consistent form/input/result patterns.

#### Feature Specification Findings

- Need canonical tool IA and redirects.

#### Accessibility Findings

- Calculators need labels, units, validation, and result announcements.

#### Responsive Findings

- Numeric tools need mobile keyboard/input mode QA.

#### Design System / Code Findings

- Consolidate duplicate tool/calculator entrypoints.

#### What Should Be Done

- Pick `/tools` or `/calculators` as canonical.
- Hide/gate `/test-3d`.
- Add calculator validation and result-state standard.

#### Acceptance Criteria

- Only one canonical calculator hub is linked.
- Public test route is removed/gated.
- Calculator results are announced and have unit clarity.

#### Priority

P2 Medium

#### Effort

Medium

#### Readiness Impact

Reduces navigation clutter and accidental test-surface exposure.

## 6. Flow Audit

### Landing / Initial Entry

Entry point: `/`, `/try`, `/pricing`, `/about`, `/contact`
Steps: landing -> try/pricing/register -> auth -> onboarding.
Current experience: Strong pitch, sample try path, safer pricing copy while payments are disabled.
Problems: Metadata claims still need evidence; `/try` should explain the next account/onboarding step.
Missing states: explicit "what happens after account creation" and support/report path.
Recommended target experience: One public promise, one sample, one account CTA, one onboarding expectation.
Acceptance criteria: Public claims match current implementation; try flow hands off to onboarding.
Priority: P1 High
Readiness impact: Sets trust expectations.

### Authentication

Entry point: `/login`, `/register`, `/forgot-password`.
Steps: choose provider -> callback -> onboarding/dashboard.
Current experience: Simple, focused auth pages.
Problems: Provider error/expired reset/account state handling needs proof.
Missing states: reset expired, existing session, email verification, account security settings after login.
Recommended target experience: Every auth outcome shows clear next step.
Acceptance criteria: Auth QA matrix covers success, cancel, provider failure, reset invalid/expired, and existing signed-in user.
Priority: P1 High
Readiness impact: Reduces lockout risk.

### Onboarding / First-Run Activation

Entry point: first authenticated user without `onboarding_completed_at`.
Steps: onboarding questions -> calibration -> dashboard/settings.
Current experience: Multi-step setup with skip and settings resume.
Problems: Skip and completion do not guarantee a clear first successful study action.
Missing states: draft persistence, first diagnostic CTA, tutorial preference, reset/recalibrate.
Recommended target experience: setup -> diagnostic -> first insight -> recommended trail.
Acceptance criteria: New user completes first meaningful action within one guided path.
Priority: P0 Critical
Readiness impact: Highest activation leverage.

### Main Dashboard

Entry point: `/dashboard`.
Steps: dashboard widgets -> next session/trail/wiki/analytics.
Current experience: Rich but dense.
Problems: Too many competing modules for new users.
Missing states: unified new-user dashboard and widget-level error states.
Recommended target experience: one primary next action, then progressive disclosure.
Acceptance criteria: Empty/new/returning users have distinct dashboards.
Priority: P1 High
Readiness impact: Reduces cognitive load.

### Practice Session

Entry point: `/dashboard/drills`, wiki article practice CTA, CampTrail day.
Steps: configure -> start -> answer -> results -> review -> next action.
Current experience: Broad quiz modes and shell routing.
Problems: Custom configuration language and slide-to-start can confuse or exclude.
Missing states: accessible validation, no-question recovery, mode explanation.
Recommended target experience: recommended mode first, advanced custom options second.
Acceptance criteria: Keyboard-only users can start and complete a session.
Priority: P1 High
Readiness impact: Core learning loop reliability.

### Wiki -> Practice -> Review

Entry point: `/dashboard/wiki/[slug]`.
Steps: read article -> practice article -> quiz -> review wrong answer -> related article.
Current experience: Article page supports practice and wrong-answer banner.
Problems: article verification/source status not prominent enough for public claims.
Missing states: report content issue, article unavailable, no practice questions.
Recommended target experience: trustworthy article with sources/review status and practice fallback.
Acceptance criteria: Article page exposes review/source status and report issue path.
Priority: P1 High
Readiness impact: Protects expert-content trust.

### Settings / Account

Entry point: `/dashboard/settings`, notification settings link, billing shim.
Steps: update profile/preferences -> save -> confirmation/error.
Current experience: Profile/theme/notifications/logout.
Problems: Missing security, billing, privacy, support, accessibility, quiet hours.
Missing states: unsaved changes, mutation success announcements, billing disabled state.
Recommended target experience: complete account center.
Acceptance criteria: Settings includes required account sections and accessible mutation feedback.
Priority: P0 Critical
Readiness impact: Required for production users.

### Admin Content Operations

Entry point: `/admin`.
Steps: create/import/edit -> review -> publish -> audit.
Current experience: Powerful, broad admin console.
Problems: route registries duplicated, workflow states unclear, heavy index, trust labels incomplete.
Missing states: import rollback/report, role matrix, publish confirmation, recovery.
Recommended target experience: explicit content workflow with queues and operator safety.
Acceptance criteria: Admin task can be completed end-to-end with visible state and audit trail.
Priority: P1 High
Readiness impact: Content quality and operator safety.

### Developer Inspection

Entry point: `/developer`.
Steps: inspect status/DB/logs/API/tools.
Current experience: Useful but mixed runtime/static/mock truth.
Problems: static docs can drift; some status surfaces are fallback.
Missing states: generated freshness, production safety labels.
Recommended target experience: every developer surface truth-labeled and safe.
Acceptance criteria: Pages state whether live, static, mock, or mixed.
Priority: P2 Medium
Readiness impact: Better internal operations.

### Payment / Upgrade

Entry point: `/pricing`, `/dashboard/upgrade`, gated feature CTA.
Steps: plan selection -> checkout -> return to billing status.
Current experience: disabled safely; upgrade redirects away when disabled.
Problems: no billing/account management; LemonSqueezy checkout is stubbed; PayRex subscription updates are not upserts; webhook contracts need provider-specific proof.
Missing states: payment failure, cancellation, invoice, refund/contact, plan state, entitlement grant failure.
Recommended target experience: keep disabled until billing center, checkout, webhook idempotency, subscription upsert, and entitlement grant tests exist.
Acceptance criteria: No billing promise without billing controls; successful provider webhook creates or updates the subscription and grants the expected tier exactly once.
Priority: P0 Critical if monetization is being launched; P1 High while disabled.
Readiness impact: Prevents payment trust failures.

### Error Recovery

Entry point: any route/action failure.
Steps: error/loading/empty -> retry/support/alternate action.
Current experience: many loading states, 7 error boundaries, uneven local recovery.
Problems: thrown server errors often rely on route boundary; status messages may be toast-only.
Missing states: retry CTA, support/report issue, accessible announcement.
Recommended target experience: local recovery by surface.
Acceptance criteria: Core flows have error copy, retry, and screen-reader announcement.
Priority: P1 High
Readiness impact: Makes failures survivable.

## 7. Feature Specification Gap Analysis

| Feature | Current Behavior | Expected Behavior | Gap | User Impact | Priority | Effort | Acceptance Criteria |
|---------|------------------|-------------------|-----|-------------|----------|--------|---------------------|
| Navigation | Route shims exist; nav still has duplicate registries | One canonical route/nav registry per surface | Drift risk | Dead links can reappear | P1 | Medium | Route audit passes; nav generated from registry |
| Authentication | Basic provider and reset flows | Full account access/recovery matrix | Missing state coverage | Lockouts/confusion | P1 | Medium | QA matrix covers auth outcomes |
| Onboarding | Multi-step setup with skip | Guided activation path | Weak first-run conversion | New users may stall | P0 | Large | Setup leads to first diagnostic/insight |
| Dashboard | Many widgets streamed | New/returning/adaptive dashboard | Cognitive overload | User misses next action | P1 | Large | One primary CTA by user state |
| Quiz setup | Powerful custom configurator | Novice-first mode recommendation | Too much abstraction | Friction before practice | P1 | Medium | Recommended mode is primary |
| Quiz session | Restores and shells by mode | Full keyboard/status/error proof | Accessibility unknown | Exclusion risk | P1 | Medium | Keyboard-only completion proof |
| Analytics | Many charts and empty states | Data requirement + next action per chart | Empty chart ambiguity | Users feel app is broken | P1 | Large | All charts have actionable empty states |
| Wiki | Article reader strong | Visible review/source trust | Trust signal gap | Public claim risk | P1 | Medium | Review/source status visible |
| Notes | Notes shell loads data | Create/empty/error QA | Unknown state proof | Note flow fragility | P2 | Medium | No-note and editor states verified |
| CampTrails | Trail recommendation/enrollment exists | First-run trail integration | Not tied to activation | Guidance gap | P1 | Medium | Diagnostic recommends trail |
| 3D Lab | Dashboard modules are gated and `/test-3d` redirects to protected 3D Lab | Same entitlement boundary plus tutorial/fallback/visual QA | Remaining high visual QA risk | Flagship feature may fail silently on weak devices | P1 | Large | Nonblank render, fallback, and mobile/control proof |
| Settings | Profile/theme/notifications/logout | Account center | Missing security/billing/privacy | Production trust gap | P0 | Large | Required settings sections exist |
| Notifications | Inbox/preferences exist | Quiet hours and accessible status | Preferences incomplete | Notification fatigue | P2 | Medium | Quiet hours UI and announcements |
| Permissions | Admin/dev gated | Visible role matrix and denial states | Hidden policy model | Operator confusion | P1 | Medium | Role matrix and denial screens |
| Admin publish | Broad tools | Explicit state machine | Workflow ambiguity | Content quality risk | P1 | Large | Draft/review/publish flow verified |
| Admin import | Import route exists | Validation report/rollback | Recovery unclear | Data corruption risk | P1 | Large | Import report and failure recovery |
| Billing | Disabled safely, but provider/webhook code is not launch-safe | Plan/billing management plus verified provider/webhook contract | Checkout stubs and entitlement grant risk | Paid users may not receive access | P0/P1 | Large | Billing status, checkout returns, subscription upsert/idempotency tests |
| Empty states | Many exist | Shared actionable pattern | Uneven quality | Dead ends | P1 | Medium | All core empty states have CTA |
| Error handling | Boundaries and local errors | Local recovery first | Over-reliance on boundary | Frustrating failures | P1 | Medium | Retry/support path on core errors |
| Responsive support | Breakpoints exist | Screenshot/browser QA | Unproven complex surfaces | Mobile polish risk | P1 | Medium | Viewport QA report green |
| Accessibility support | Some labels/roles | WCAG AA target | No full proof | Launch compliance risk | P1 | Large | Keyboard/screen-reader audit complete |

## 8. Design System Compliance Review

| Area | Existing Standard | Current Compliance | Issues | Recommendation |
|------|-------------------|--------------------|--------|----------------|
| Typography | Atkinson for body, Plus Jakarta/display, DM Mono for data/code | Partial | Monospace used for category/eyebrow labels in many surfaces | Reserve monospace for data/code/score; update label pattern |
| Spacing | 4px rhythm, 8/16/24 common steps | Mostly | Dashboard/admin sometimes too dense | Define surface density variants |
| Color tokens | Semantic tokens in `src/app/globals.css` | Mostly | Hardcoded amber/green/red classes and old signal tokens remain | Prefer tokens/utilities; audit hardcoded colors |
| Components | Use shared shadcn-style primitives | Mostly | Admin/editor has custom controls | Wrap repeated editor controls |
| Button hierarchy | One primary per view | Partial | Some dense surfaces expose multiple equally weighted actions | Audit core views for primary/secondary priority |
| Forms | Labels, helper text, error states | Partial | Validation and status feedback uneven | Add form-state contract |
| Cards | Rounded <= 8px, no nested cards | Partial | Some older surfaces use larger/pill shapes and nested-feeling panels | Normalize cards by surface |
| Tables/lists | Shared `DataTable` where possible | Partial | Admin tables/editors vary | Consolidate admin tables/actions |
| Icons | Icons clarify actions | Mostly | Some icons decorative without accessible names unknown | Audit icon buttons for labels/tooltips |
| Modals/drawers | Dialog/sheet primitives | Mostly | Need focus/escape QA | Add modal QA checklist |
| Layout containers | Full-width bands or unframed layouts | Partial | Operational pages sometimes card-stack too heavily | Define dashboard/admin layout recipes |
| Breakpoints | Responsive grids | Partial | 3D/admin/editor unproven | Run viewport QA |
| State styles | Hover/focus/active/disabled | Partial | Some custom controls use focus styles, not all | Add focus-visible lint/review checklist |
| Motion | Purposeful, reduced motion | Partial | Framer-motion subject chips and spinners need reduced-motion check | Use reduced-motion guards |
| Dark mode | Token-based themes | Partial | Complex colored cards need explicit dark QA | Add dark-mode visual pass |
| Naming/file organization | App Router by surface | Mostly | Duplicate `/tools` and `/calculators`; duplicate nav registries | Consolidate canonical IA |

## 9. Accessibility Review

| Issue | Location | WCAG/Best-Practice Relevance | Current Problem | Recommended Fix | Priority |
|-------|----------|------------------------------|-----------------|-----------------|----------|
| Keyboard start path for custom quiz | `HeroConfigurator`, `SlideToSubmit` | WCAG keyboard accessible, focus visible | Slide interaction may not be keyboard-equivalent | Provide standard button fallback and keyboard test | P1 |
| Tooltip-only validation | `HeroConfigurator` | WAI errors/status, NN/g error recovery | No-subject validation is transient and tooltip-based | Add persistent inline error with `role="alert"` | P1 |
| Dynamic save/status feedback | Settings, notifications, admin editor | WCAG 4.1.3 status messages | Toast-only feedback may not be announced | Use `role=status` or live regions for saves/errors | P1 |
| Custom checkbox-like subject buttons | Onboarding weak subjects | WCAG name/role/value | Buttons visually behave as checkboxes | Use checkbox inputs or `aria-pressed` with clear state | P1 |
| Chart alternatives | Analytics charts | WCAG non-text content, headings/labels | Chart text equivalents inconsistent | Add chart summary text and accessible labels | P1 |
| Mobile touch targets | Dashboard nav, chips, quiz controls | WCAG target size and mobile usability | Some 8-11px labels and dense controls may be hard to tap | Enforce 24px minimum target, preferably 44px for primary touch actions | P1 |
| Focus order in portals/admin | Admin/editor/developer shells | WCAG focus order and bypass blocks | Portal has skip link, dashboard lacks comparable proof | Add skip-to-main and keyboard walkthroughs | P1 |
| Form labels and instructions | Auth/settings/admin forms | WAI labels guidance | Many labels exist, but custom controls vary | Standardize labels/helper/error IDs | P1 |
| Error pages and route boundaries | App/admin/dashboard/developer errors | Error recovery heuristic | Boundaries may be generic | Add retry/back/support actions | P2 |
| 3D fallback content | 3D Lab modules | WCAG non-text/keyboard alternatives | Spatial interactions may not be accessible | Provide text equivalent and keyboard controls | P1 |

## 10. Responsive / Device Readiness Review

| Screen/Flow | Mobile | Tablet | Desktop | Issues | Recommendation |
|-------------|--------|--------|---------|--------|----------------|
| Landing/try | Likely usable | Likely usable | Strong | Needs claim/CTA proof | Run visual QA and align claims |
| Auth | Likely usable | Ready | Ready | Provider/error states unverified | QA all auth states |
| Onboarding | Likely usable | Likely usable | Ready | Multi-step back/overflow unverified | Add viewport QA and draft persistence |
| Dashboard | Risky | Risky | Strong | Dense cards, dual mobile nav patterns | Screenshot QA at 360/390/768/1440 |
| Quiz setup/session | Risky | Risky | Strong | Slide controls, timers, options, modals | Keyboard/mobile QA |
| Analytics | Risky | Moderate | Strong | Many charts can stack too long | Add mobile summary mode |
| Wiki article | Moderate | Strong | Strong | Sidebar hidden; mobile actions need discoverability | Mobile article tools QA |
| CampTrails | Moderate | Strong | Strong | Long titles/rows can wrap poorly | Clamp/wrap test data |
| Settings | Moderate | Strong | Strong | Account center missing more than responsive issue | Rebuild into sections |
| 3D Lab | High risk | High risk | Strong | Canvas/control overlap and performance | Visual/canvas QA required |
| Admin | High risk | Moderate | Strong | Desktop-first editor/tables | Declare desktop-first or add min-width state |
| Developer | Moderate | Strong | Strong | Tables/tools overflow | Add responsive table behavior |
| Calculators | Moderate | Strong | Strong | Numeric inputs/units | Mobile input-mode QA |

## 11. Content and Microcopy Review

| Location | Current Copy | Problem | Recommended Copy | Reason |
|----------|--------------|---------|------------------|--------|
| Landing metadata | "expert-verified wiki" | Trust claim not visibly evidenced | "source-backed wiki" until review status is visible | Avoids unverifiable claim |
| Onboarding skip | "Skip for now" | Ambiguous consequence | "Finish later in settings" | Sets expectation |
| Onboarding continue | "Continue ->" | Generic | "Continue to study setup" | Clarifies next step |
| Dashboard new user | Multiple modules | No single first action | "Start your first diagnostic" | Activation clarity |
| Assessment redirects | silent redirect | User does not know why unavailable | "Diagnostic is unavailable because..." | Error recovery |
| Wiki root | "Select a topic from the taxonomy tree on the left" | Left tree may not exist on mobile | "Search or choose a topic to begin" | Works across layouts |
| Notifications subtitle | "camp updates" | Campfire cleanup ambiguity | "study and account updates" | Accurate product language |
| Pricing disabled | "All features are currently available for free" | May overpromise gated features | "Available study surfaces are free in this build" | Matches current availability |
| Upgrade headline | "Know you'll win." | Too absolute for exam prep | "Know where you stand." | Avoids outcome guarantee |
| Admin activity actor | raw ID slice | Not human-readable | actor name/email/role fallback | Operator comprehension |
| Admin settings metadata | `Settings â€” SlateCamp Admin` | Encoding defect | `Settings - SlateCamp Admin` | Professional polish |
| Empty notifications filter | `No ${filter} notifications.` | Not actionable | "No study notifications in this filter yet." | Better context |
| 3D Lab gate CTA | settings link | Billing/action unclear | "Review account access" or real billing CTA | Honest entitlement state |

## 12. Technical UX Risks

- Initial audit evidence showed `bun run check:entitlements` and `bun audit` failing; post-remediation local evidence is green, and `bun run validate:release` now gives the app a repeatable local release aggregate with built-app Playwright smoke plus split demo-auth core, portal, and 3D Lab coverage.
- No root `test` script exists by design; Playwright launch-smoke, built-app smoke, demo-authenticated first-run coverage, demo-authenticated portal coverage, and an isolated demo-authenticated 3D Lab route check now live behind explicit `test:e2e*` scripts.
- CI now includes an app release-validation job plus the existing Storybook build, but live Supabase seeded-user product-flow coverage still needs expansion.
- Dashboard shell has many responsibilities: auth/bootstrap/entitlements/providers/dev tools/nav/toasts.
- Admin nav and command palette duplicate route strings.
- Admin content index overfetches large data for one page.
- Developer portal mixes runtime-backed, static, fallback, and mock truth.
- Payments provider layer now fails closed and webhook writes upsert subscriptions, but payments remain disabled/stubbed; re-enabling still requires live provider contract QA, billing settings, cancellation/support, and entitlement-grant proof.
- Chart and analytics components often throw errors to boundaries instead of local recovery.
- Some pages return `null` on missing user even though layout usually guards.
- `/test-3d` now redirects to protected dashboard 3D Lab and is classified as protected in route evidence; keep it out of public nav and route smoke public targets.
- Duplicate `/tools` and `/calculators` namespaces dilute IA.
- Design-system drift exists across old and new surfaces.

## 13. Prioritized Readiness Plan

### Phase 1 - Critical Readiness

| Priority | Task | Area | Why It Matters | Effort | Owner Type | Acceptance Criteria |
|----------|------|------|----------------|--------|------------|---------------------|
| P0 | Keep payments disabled until live billing QA is complete | Payments/backend | Paid users must receive access and recover from billing issues | Large | Product/Backend/Frontend/QA | Provider checkout, webhook idempotency, subscription upsert, return states, and billing settings are verified |
| P0 | Keep `/test-3d` protected and out of public nav | 3D/security | Test routes must not bypass entitlement boundaries | Small | Frontend/QA | `/test-3d` redirects into the protected dashboard 3D Lab and remains absent from public smoke targets |
| P0 | Build first-run activation path | Onboarding/dashboard | New users need an obvious first success | Large | Product/Design/Frontend | Setup leads to diagnostic/insight/trail |
| P0 | Rebuild settings as account center | Settings | Production users need account control | Large | Product/Frontend/Backend | Security, billing, privacy, support, notifications, accessibility sections exist |
| P1 | Preserve entitlement check as a release gate | Release | Governance gate must stay green | Small | Frontend/QA | `bun run check:entitlements` passes in local and CI validation |
| P1 | Preserve dependency audit as a release gate | Release/security | Known advisories cannot be ignored | Medium | Frontend/Backend | `bun audit` has accepted/cleared result in local and CI validation |
| P1 | Expand app release validation aggregate | QA | Release validation now covers built-app route smoke plus split demo-auth core and portal checks, but seeded-user/product-flow browser coverage is still thin | Medium | QA/Frontend | `validate:release` stays green and Playwright covers live seeded onboarding, dashboard activation, settings/account, and admin happy paths |
| P1 | Finish public claim cleanup | Marketing/content | Trust and legal risk | Medium | Product/Content | Metadata/copy claims match shipped proof |

### Phase 2 - UX/UI Polish

| Priority | Task | Area | Why It Matters | Effort | Owner Type | Acceptance Criteria |
|----------|------|------|----------------|--------|------------|---------------------|
| P1 | Standardize empty/loading/error/success states | App-wide | Reduces dead ends | Medium | Design/Frontend | Core surfaces use shared state patterns |
| P1 | Dashboard IA pass | Dashboard | Prevents widget overload | Large | Product/Design | New/returning dashboard states defined |
| P1 | Quiz setup UX pass | Practice | Core flow friction | Medium | Design/Frontend | Recommended mode and accessible validation |
| P1 | Mobile visual QA | Responsive | Mobile risk is unknown | Medium | QA/Frontend | Screenshots at key viewports accepted |
| P2 | Content microcopy pass | Product copy | Calm, accurate voice | Medium | Content/Design | Copy table fixes implemented |

### Phase 3 - Feature Completion

| Priority | Task | Area | Why It Matters | Effort | Owner Type | Acceptance Criteria |
|----------|------|------|----------------|--------|------------|---------------------|
| P1 | Admin workflow hardening | Admin | Content quality depends on operators | Large | Product/Frontend/Backend | Draft/review/publish/archive state machine visible |
| P1 | Wiki trust/reporting | Wiki | Supports expert/source claim | Medium | Product/Content/Frontend | Review/source status and issue report path |
| P1 | Billing readiness PRD or keep disabled | Payments | Prevents broken monetization | Large | Product/Backend/Frontend | Billing status and checkout return paths exist |
| P2 | Developer truth labels everywhere | Developer | Internal trust | Medium | Frontend | Every dev page labeled live/static/mock/mixed |
| P2 | Tools/calculators consolidation | IA | Reduces duplicated public surfaces | Medium | Product/Frontend | One canonical calculator hub |

### Phase 4 - Scale / Quality

| Priority | Task | Area | Why It Matters | Effort | Owner Type | Acceptance Criteria |
|----------|------|------|----------------|--------|------------|---------------------|
| P1 | Accessibility audit and remediation | App-wide | Required for inclusive launch | Large | Accessibility/Frontend/QA | Keyboard/screen-reader/focus/status checklist green |
| P1 | 3D Lab QA and fallback content | 3D | Flagship feature risk | Large | Frontend/Accessibility/QA | Nonblank render, mobile, keyboard/fallback proof |
| P2 | Admin/editor decomposition | Admin/code | Maintainability | Large | Frontend | Large hotspots split by responsibility |
| P2 | Analytics performance and state cleanup | Analytics | Perceived reliability | Medium | Frontend | All charts local recoveries and data requirements |
| P2 | Route/nav registry consolidation | IA/code | Prevents stale routes | Medium | Frontend | Route audit catches no dead current links |

## 14. Recommended Implementation Order

1. Fix blockers that prevent the app from being safely validated:
   - Keep payments disabled until checkout, webhook idempotency, subscription upsert, billing settings, and entitlement grant proof are live-QA verified.
   - Keep `/test-3d` protected by the dashboard 3D Lab route and absent from public route smoke targets.
   - Keep `bun run check:entitlements` green.
   - Keep `bun audit` clean or formally accepted.
   - Keep `bun run validate:release` green and expand Playwright beyond route smoke into authenticated first-run and admin/account flows.
2. Fix first-run activation:
   - Onboarding draft/resume.
   - Remove ambiguous skip.
   - Add dashboard activation checklist.
   - Add first diagnostic/session handoff.
3. Upgrade settings into production account center:
   - Security/password/session.
   - Billing status.
   - Notification quiet hours.
   - Privacy export/delete.
   - Support/report issue.
   - Accessibility preferences.
4. Standardize repeated UI state patterns:
   - Empty/loading/error/success.
   - Form validation and status messages.
   - Modal/drawer focus behavior.
5. Harden core study loop:
   - Quiz setup/accessibility.
   - Results/review next actions.
   - Wiki -> practice -> review loop.
6. Harden admin:
   - Route registry.
   - Workflow state machine.
   - Role matrix.
   - Import/review/publish/audit recovery.
7. Verify responsive and accessibility:
   - 360, 390, 768, 1024, 1440 viewports.
   - Keyboard-only walkthroughs.
   - Screen-reader status announcements.
8. Then address scale:
   - 3D registry consolidation.
   - Admin/editor decomposition.
   - Analytics performance and local error states.
   - Tool/calculator IA consolidation.

## 15. Final Verdict

Overall readiness rating: **Internal testing ready. Not beta ready. Not production ready. Not scale ready.**

Ready for internal testing: **Yes**, with known gaps and internal users who can tolerate rough edges.

Ready for beta users: **Not yet.** Beta needs first-run activation, settings/account controls, release gates, and core accessibility/responsive checks.

Ready for production: **No.** Production requires green release gates, security/dependency resolution, billing/account decisions, admin workflow safety, and public-claim proof.

Single most important thing to fix first: **Block unsafe public exposure: keep payments disabled or repair them end-to-end, and remove or gate `/test-3d`.**

Highest-leverage product improvement after that: **First-run activation from onboarding to first diagnostic/session.**

Biggest risk if no changes are made: **Users will experience a technically broad app as an unclear collection of tools, while operators carry preventable billing, entitlement, admin, security, and release risk.**
