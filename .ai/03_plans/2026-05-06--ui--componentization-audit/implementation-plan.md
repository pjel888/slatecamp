# SlateCamp UI Componentization + UX/UI Audit Implementation Plan

> For Hermes: planning-only artifact. Do not implement from this file until Phase 0 readiness gate is completed and Philip authorizes execution. When implementation starts, use isolated worktrees, batch-sized agents, separate reviewer models, Storybook updates, browser visual inspection, and test gates after every batch.

Goal: Audit the SlateCamp UI/UX surface, identify repeated or custom implementations that should use `src/components/ui` or shared patterns, expand primitives where existing components do not fit real product behavior, then migrate safely without breaking app routes, Storybook, accessibility, or visual quality.

Architecture: Treat this as a governed refactor program, not a bulk rewrite. First create a source-grounded inventory with IDs and blast-radius classification; then implement in small batches by component family and route surface. Shared primitive changes are isolated from domain migrations and must be reviewed/tested separately.

Tech Stack: Next.js App Router, Bun, TypeScript, Tailwind CSS 4 tokens, Base UI primitives, Storybook React Vite, Playwright, Vitest, SlateCamp `DESIGN.md` design contract.

Current branch observed: `redesign/quiz-mode-hub`.
Important state: current working tree is dirty with many unrelated changes. Implementation must not begin in this worktree unless Philip explicitly says to continue on the dirty branch. Preferred: create a fresh branch/worktree from a clean base after the current changes are committed/stashed by the owner.

---

## 0. Non-goals and hard boundaries

This project is not:
- A visual redesign of every page.
- A mechanical Tailwind find-and-replace.
- A mandate to move every domain component into `src/components/ui`.
- A reason to change business logic, server actions, Supabase queries, quiz scoring, auth, payments, or content pipeline behavior.
- A reason to change content roundtrip artifacts.

Do not change:
- `src/lib/actions/**`, `src/lib/queries/**`, `src/stores/**`, Supabase migrations, or content pipeline scripts unless a UI component import boundary requires a tiny type-only/interface adjustment and the change is explicitly queued.
- Global tokens or `src/app/globals.css` without a dedicated primitive/token batch.
- Existing Storybook baselines or visual snapshots without before/after evidence and explicit approval.

---

## 1. Definitions

### UI primitive
A reusable low-level component in `src/components/ui` with stable semantics: Button, Dialog, Sheet, Popover, Tabs, Card, Input, Badge, Alert, Skeleton, Spinner, etc.

### Shared product pattern
A repeated SlateCamp-specific composition, usually in `src/components/shared` or a new shared pattern folder: EmptyState, SectionHeader, MetricCard, DataTable shell, StudyPanel, QuizFeedbackBlock, DashboardMetricCard. These can compose primitives but carry product meaning.

### Domain component
A feature-specific component under dashboard, wiki, quiz-v2, admin, 3D Lab, marketing, etc. Domain components may stay custom when the behavior is domain-specific.

### Migration classification
Each finding must land in one bucket:
- A — Definite drift: should use an existing primitive or shared pattern.
- B — Primitive gap: should use a primitive, but the primitive API does not support the use case yet.
- C — New shared pattern: repeated UI meaning across multiple surfaces; create/extend shared pattern.
- D — Intentional custom: keep custom due to domain-specific behavior, performance, canvas/3D constraints, or one-off marketing needs.
- E — Needs Philip decision: ambiguous visual or product intent.

---

## 2. Design contract checkpoints

Use `DESIGN.md` and `src/app/globals.css` as the visual source of truth.

Key rules to enforce:
- Small radii: 2px micro, 4px controls/chips, 6px cards, 8px dialogs/larger framed tools.
- Dense but breathable: avoid over-spaced SaaS cards in study/dashboard surfaces.
- Study-first: UI should reduce exam-prep friction, not decorate.
- Signal-first: color and motion must communicate state/priority.
- Legible by default: Atkinson Hyperlegible body, clear contrast, obvious focus states.
- Resting cards should use little/no shadow; stronger shadows reserved for dialogs, popovers, dropdowns, temporary elevation.
- Avoid decorative blobs/orbs/gradients unless already approved for that surface.
- Do not use red for low score/student weakness; reserve destructive color for real errors/destructive actions.

Important nuance: do not mechanically remove every `rounded-full`. Avatars, progress dots, small status pills, and some controls may intentionally use full radius. Classify first.

---

## 3. Blast radius map

### Highest-risk shared primitives
- `src/components/ui/button.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`

Changes here can affect many pages. Do not edit them as part of a domain migration batch. Primitive changes get their own branch/batch and full validation.

### Highest-risk surfaces
- Quiz and quiz-v2: session flow, timers, slide/submit behavior, confirmation modals, results overlays.
- Wiki article and wiki quiz: MDX renderer, article shell, sidebars, quick review modal, article blocks.
- Dashboard/sidebar shell: layout, mobile/desktop nav, active states, route loading states.
- 3D Lab: canvas overlays, bottom sheets, onboarding, mobile controls, performance-sensitive UI.
- Admin/content tools: tables, editors, review queues, role-gated workflows.
- Auth/onboarding: conversion and form reliability.
- Marketing/landing: intentionally more expressive; classify before standardizing.

### Medium-risk surfaces
- Analytics/stat cards.
- Notes/settings/tools/calculators.
- Developer/CEO portals.

---

## 4. Agent orchestration plan

Use a small expert studio, not an uncontrolled swarm.

### Roles
1. Hermes supervisor
   - Owns plan, state, queues, gates, file ownership, final verification.
   - Does not let multiple agents edit the same files.

2. Command Code plan/review agent
   - Read-only plan critique and later taste/style-aware review.
   - Command used successfully for readiness check: `cmd --version`, `cmd status`.
   - Note: one headless plan command returned empty output in this session; treat Command Code output as authoritative only when it contains concrete findings.

3. OpenCode Kimi/DeepSeek exploration agents
   - Kimi: long-context synthesis and implementation-risk critique.
   - DeepSeek: logic/debug/risk review.
   - Available models confirmed include `opencode-go/kimi-k2.6` and `opencode-go/deepseek-v4-flash`.

4. Codex builder agents
   - Main implementation engine when Phase 1+ starts.
   - Must work in isolated branch/worktree.

5. Reviewer agent different from builder
   - Command Code, OpenCode, Kimi/DeepSeek, or Codex in reviewer-only thread if fallbacks are needed.

### Maximum default concurrency
- Discovery: up to 4 read-only agents in parallel.
- Implementation: 1 builder per batch; no parallel edits to shared primitives.
- Review: 1 independent reviewer per batch.
- Visual/test runner: 1 verifier.

### No-go agent rules
- No multiple agents editing `src/components/ui/**` concurrently.
- No bulk edits from search-and-replace without inventory IDs.
- No implementation if git worktree is dirty with unrelated changes unless explicitly scoped and approved.
- No `--yolo` outside a trusted isolated worktree.

---

## 5. Directory and artifact plan

All planning artifacts for this project live here:

`/.ai/03_plans/ui-componentization-audit-2026-05-06/`

Required files:
- `README.md` — entrypoint and current status.
- `implementation-plan.md` — this plan.
- `inventory-template.json` — schema for componentization findings.
- `agent-prompts.md` — prompts for discovery/review/build agents.
- `route-visual-matrix.md` — browser visual inspection route list.
- `validation-matrix.md` — commands and pass/fail gates.
- `UI_COMPONENTIZATION_STATE.json` — state machine.

Implementation phase will later create:
- `inventory/ui-primitive-inventory.json`
- `inventory/custom-ui-findings.json`
- `inventory/modal-dialog-inventory.json`
- `inventory/storybook-gap-inventory.json`
- `queues/queue-definite-drift.json`
- `queues/queue-primitive-gap.json`
- `queues/queue-shared-pattern.json`
- `queues/queue-intentional-custom.json`
- `queues/queue-decision-needed.json`
- `reports/phase-*-report.md`
- `reports/final-regression-report.md`

---

## 6. Phase plan

### Phase 0 — Readiness, isolation, and baseline capture

Objective: Prove the repo state is safe to refactor before implementation.

Steps:
1. Confirm branch and dirty state:
   - `git branch --show-current`
   - `git status --short`
   - `git diff --stat HEAD`
2. Stop if the working tree has unrelated changes.
3. Create isolated branch/worktree only after owner approval or after current changes are clean:
   - preferred branch name: `refactor/ui-componentization-audit-2026-05-06`
4. Capture current validation baseline:
   - `bun run type-check`
   - `bun run lint`
   - `bun run design:lint`
   - `bun run test:dom`
   - `bun run build-storybook`
   - `bun run inspect:ui`
   - targeted e2e only if baseline credentials/demo auth are ready.
5. Record pre-existing failures with exact output and mark them as baseline failures, not refactor regressions.

Exit gate:
- Clean isolated worktree exists.
- Baseline commands recorded.
- Known failures documented.
- No implementation yet.

No-go:
- Dirty mixed-origin branch.
- Typecheck broken before refactor without documented baseline.
- Storybook build broken without documented baseline.

---

### Phase 1 — Inventory-only codebase audit

Objective: Produce a full, evidence-backed list of componentization opportunities and exceptions.

Discovery queries:
- Custom modal/dialog candidates:
  - `role="dialog"`
  - `aria-modal`
  - `fixed inset-0`
  - `createPortal`
  - file names containing Modal, Dialog, Drawer, Sheet, Overlay
- Raw controls:
  - `<button\b`
  - `role="button"`
  - `<input\b`, `<textarea\b`, `<select\b`
- Primitive usage:
  - imports from `@/components/ui/button`, dialog, sheet, popover, card, badge, input, tabs, etc.
- Design drift candidates:
  - `rounded-2xl`, `rounded-3xl`, `rounded-full`
  - `shadow-lg`, `shadow-xl`, `shadow-2xl`
  - arbitrary z-indexes: `z-[` and `z-` high values
  - gradients/orbs/backdrop blur outside approved marketing/overlay contexts
- Repeated product patterns:
  - cards/panels/stat tiles/empty states/section headers/data tables/error states/loading skeletons.
- Storybook gaps:
  - component `.tsx` files without nearby `.stories.tsx`, filtered for visual components only.

Output:
- `inventory/custom-ui-findings.json`
- `inventory/modal-dialog-inventory.json`
- `inventory/storybook-gap-inventory.json`
- `reports/phase-1-inventory-report.md`

Exit gate:
- Every finding has file path, classification, severity/risk, proposed target primitive/pattern, and verification needs.
- Ambiguous items are not implemented; they go to decision queue.

No-go:
- Any “fix” made during inventory.
- Any classification without file evidence.

---

### Phase 2 — Primitive gap analysis and API design

Objective: Determine what `src/components/ui` must support before migration.

Likely primitive gaps from discovery:
- Dialog/ConfirmDialog needs explicit non-dismissible mode, async confirm error behavior, initial focus controls, scrollable body pattern, mobile/fullscreen variants, and z-index/portal strategy.
- Sheet needs side/bottom drawer parity for quiz panels, app drawer, side panels, mobile bottom sheets.
- Button may need consistent loading state and icon placement variants if raw buttons repeat.
- Card/Panel may need a small-radius/elevation contract that matches `DESIGN.md`.
- Empty/loading/error states may deserve shared product patterns rather than low-level primitives.

Steps:
1. Read all consumers of each primitive before changing its API.
2. Write proposed API changes in `reports/phase-2-primitive-gap-analysis.md`.
3. Add or update Storybook stories first for intended behavior where possible.
4. Do not edit primitives until the plan is reviewed.

Exit gate:
- Primitive changes are approved as a separate batch list.
- Backward compatibility strategy exists.
- Story coverage requirements exist for each primitive change.

No-go:
- Breaking primitive API changes without migration map.
- Updating Dialog/Sheet while also migrating domain consumers in same batch.

---

### Phase 3 — Low-risk primitive adoption

Objective: Replace obvious raw/simple UI with existing primitives without changing user behavior.

Target candidates:
- Simple buttons that map directly to `Button`.
- Simple badges/status labels that map to `Badge` or a shared status pattern.
- Simple cards that map to `Card`/shared Panel only where semantics match.
- Simple inputs/textareas/selects that map to UI primitives.

Rules:
- Preserve component public props.
- Preserve route behavior and data flow.
- Prefer local changes in one surface at a time.
- Add/update stories for every changed visual component.

Validation per sub-batch:
- `bun run type-check`
- `bun run lint`
- relevant unit/DOM tests
- Storybook build if stories/shared components changed.

Exit gate:
- No visual regressions in affected routes.
- No new lint/type errors.
- Stories updated.

---

### Phase 4 — Modal/Dialog/Sheet normalization

Objective: Safely consolidate custom modal-like UI into Dialog/ConfirmDialog/Sheet where behavior matches.

Known high-value candidates from discovery:
- Simple centered/form modal: `src/app/dashboard/pods/_components/CreatePodModal.tsx`
- CEO/admin form drawers: likely Sheet candidates.
- Quiz-v2 confirmation modals: already partly using shared dialog; verify consistency.
- WikiQuizModal: high risk; defer until primitive supports non-dismissible and tests are strong.
- 3D Lab onboarding/bottom sheet: high risk; defer and verify z-index/canvas/mobile behavior.

Migration taxonomy:
- ConfirmDialog: simple yes/no confirmations.
- Dialog: centered content/form modals.
- Sheet: side/bottom drawers and panels.
- Custom: canvas overlays, loading/progress overlays, dev overlays, draggable/floating panels, and intentionally non-modal surfaces.

Required tests/inspection:
- `bun run test:e2e:dialog`
- focus trap, Escape/backdrop policy, focus restore, accessible title/description, body scroll lock.
- desktop and mobile visual inspection.

Exit gate:
- Every migrated dialog has Storybook or route-level visual proof.
- No accessibility regressions.
- Non-dismissible behavior is explicit and tested.

No-go:
- Migrating WikiQuizModal or 3D Lab overlays before primitive/API and tests are ready.

---

### Phase 5 — Shared product pattern extraction

Objective: Extract repeated SlateCamp product patterns that are not generic UI primitives.

Potential patterns:
- SectionHeader
- EmptyState
- RouteError / InlineError
- LoadingPanel / SkeletonPage
- MetricCard / StatCard
- PanelShell
- DataTable shell
- QuizFeedbackBlock
- StatusBadge variants
- ActionCard / QuickActionCard

Rules:
- Pattern must appear across multiple surfaces or encode stable product meaning.
- Do not abstract purely because class names look similar.
- Keep domain-specific content and behavior in domain components.

Exit gate:
- New shared pattern has Storybook coverage.
- At least two consumers justify extraction, unless it prevents a known recurring bug.

---

### Phase 6 — High-risk domain surfaces

Objective: Apply established primitives/patterns to complex surfaces only after lower-risk migrations prove the approach.

Order:
1. Dashboard non-shell components.
2. Admin/content surfaces.
3. Wiki article blocks/navigation.
4. Quiz-v2 session/modals/results.
5. 3D Lab overlays/controls only if specifically approved.
6. Marketing/landing only with explicit unify-vs-defer decision.

Validation:
- Surface-specific e2e scripts.
- Browser visual route matrix.
- Storybook scenes where route composition matters.

No-go:
- Touching quiz scoring/session logic.
- Touching 3D canvas behavior for visual-only refactor.
- Treating marketing expressive components as drift without decision.

---

### Phase 7 — Storybook hardening

Objective: Ensure UI library and shared patterns are discoverable and regression-resistant.

Requirements per changed primitive/pattern:
- Default state.
- Variant/size states.
- Disabled/loading/error state when relevant.
- Long content state.
- Mobile/narrow state.
- Interaction-open state for Dialog/Sheet/Popover/Dropdown/Tooltip/Tabs.
- Dark mode only if supported by product surface.

Required commands:
- `bun run check:storybook`
- `bun run build-storybook`

No-go:
- Placeholder stories.
- Stories that import no real component.
- Storybook-only component behavior that does not match app route behavior.

---

### Phase 8 — Browser visual inspection and regression

Objective: Prove the real app did not regress visually or behaviorally.

Use `route-visual-matrix.md` as the source route list.

Minimum per affected batch:
- Start dev server safely.
- Inspect affected routes in browser.
- Check console errors and network failures.
- Capture before/after screenshots where practical.
- For modal/sheet work, inspect open states at desktop and mobile widths.

Commands:
- `bun run inspect:ui`
- `bun run test:visual` only in a stable visual environment; current visual test is login-only and insufficient for broad refactor.
- Targeted Playwright route suites by touched surface.

No-go:
- Claiming visual success from typecheck only.
- Updating screenshots without before/after review.

---

### Phase 9 — Final regression and closeout

Objective: Confirm all batches are integrated, documented, and safe.

Final command set, adjusted for touched surfaces and known baseline failures:
- `bun run type-check`
- `bun run lint`
- `bun run design:lint`
- `bun run test`
- `bun run test:dom`
- `bun run build-storybook`
- `bun run inspect:ui`
- `bun run test:e2e:smoke`
- `bun run test:e2e:dialog` if dialogs/sheets changed.
- `bun run test:e2e:ui` for broad UI changes.
- Surface-specific e2e: wiki, learning/quiz, 3D Lab, admin, portals as applicable.
- `bun run build` only after killing dev server first if running.

Deliverables:
- Final implementation log.
- Changed files summary.
- Storybook story map.
- Visual inspection screenshots/report paths.
- Test evidence table.
- Remaining exceptions/intentional customs.
- Follow-up queue.

---

## 7. Required queues

Use these queue files during execution:

- `queue-definite-drift.json`
  - UI drift with obvious primitive/pattern replacement.
- `queue-primitive-gap.json`
  - Existing primitive insufficient; requires API/design expansion.
- `queue-shared-pattern.json`
  - Repeated SlateCamp-specific composition.
- `queue-modal-dialog-sheet.json`
  - Modal-like surfaces and target primitive classification.
- `queue-storybook-gap.json`
  - Missing stories for touched or important components.
- `queue-intentional-custom.json`
  - Explicit exceptions with reasons.
- `queue-decision-needed.json`
  - Ambiguous items for Philip.
- `queue-completed.json`
  - Fixed items with validation evidence.
- `queue-quarantined.json`
  - Deferred items with reason and risk.

Each item must include:
- id
- file
- line/range if available
- component/surface
- current pattern
- proposed primitive/pattern
- classification
- risk level
- user impact
- implementation notes
- tests required
- storybook required
- visual inspection route(s)
- final status

---

## 8. Acceptance criteria

A batch is done only when:
1. All queued items for the batch have status fixed, intentional-custom, decision-needed, or quarantined.
2. Typecheck passes or baseline failure is documented and unaffected.
3. Lint passes or baseline warnings are documented and unaffected.
4. Storybook stories are updated for changed primitives/patterns.
5. `build-storybook` passes if stories/shared components changed.
6. Browser visual inspection was completed for affected routes/states.
7. Relevant e2e/DOM/unit tests were run.
8. Independent reviewer found no blocking issues.
9. Changed files are summarized with blast radius notes.
10. No unrelated files were modified.

---

## 9. Recommended first implementation target after planning approval

Do not start with WikiQuizModal, 3D Lab, sidebar shell, or global Button/Card changes.

Start with Phase 1 inventory, then a small pilot:
- One simple custom modal/form surface that can migrate to Dialog without business-logic changes, likely `CreatePodModal` only after reading current file and tests.
- One simple repeated card/status pattern in a low-risk dashboard/tool surface.
- One Storybook gap fix for the changed component.

Pilot success proves the workflow before touching shared primitives broadly.

---

## 10. Current model-review synthesis

Hermes/subagents found:
- UI library exists and is broad, but not universally adopted.
- Shared Dialog exists with Base UI and ConfirmDialog; many custom modal-like surfaces still exist.
- Several overlay hits are false positives: 3D/canvas/loading/dev overlays should not be blindly migrated.
- Storybook has about 100 story files and a placeholder guard, but visual regression is currently narrow.
- `inspect:ui` currently focuses mainly on homepage; route matrix needs expansion for this project.
- Current dirty branch is a critical blocker for safe implementation.

OpenCode DeepSeek critique added:
- Avoid “componentize everything”; classify definite drift vs intentional divergence vs ambiguous.
- Use batch gates and stop conditions.
- Current visual test coverage is insufficient for codebase-wide UI confidence.
- Keep high-risk Wiki/Quiz/3D work last.

Command Code status:
- `cmd status` authenticated successfully.
- One headless plan attempt returned no concrete output; use Command Code again later in interactive/plan mode or with narrower prompts if needed.
