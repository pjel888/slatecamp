# Admin Editor Implementation Plan

## 1. Planning basis

### Source docs used

- `.ai/plans/2026-04-12_admin-editor-deep-audit.md`
- `.ai/plans/2026-04-12_admin-editor-spec-v2.md`
- `.ai/plans/2026-04-12_admin-editor-executive-summary.md`

### Fixed assumptions carried forward

1. `/admin` is mission-critical and must be treated as a business-critical CMS.
2. Unified new-article creation is broken and must be fixed first.
3. Taxonomy persistence in the active article editor is broken and must be fixed first.
4. The rule “if a topic is not readable, there should be no standard questions about it” must be enforced.
5. Status handling is inconsistent and must be normalized.
6. Reviewer flows are incomplete and currently route reviewers into dead-end or unauthorized surfaces.
7. Draft preview authorization / RLS must be aligned with the active role model.
8. Import flows are duplicated and inconsistent and must be consolidated.
9. MDX remains canonical storage.
10. The future editor is a structured authoring layer on top of MDX, not a storage-format rewrite.

### ADR

Decision:
- Deliver the overhaul incrementally in phases, starting with correctness and policy consolidation, then layered structured editing on top of the stabilized MDX/render pipeline.

Decision drivers:
- Current system has active correctness failures, not just UX debt.
- Student renderer and article delivery are already MDX-based and should remain the rendering truth.
- The system is too fragile for a large-bang rewrite.

Alternatives considered:
- Keep raw MDX and only improve snippets.
  Rejected because it does not solve SME usability or validation integrity.
- Replace MDX with a structured JSON document model now.
  Rejected because migration and parity risk are too high for the current failure profile.

Why chosen:
- This path fixes the current broken create/save/review/publish surfaces first, preserves existing valid content, and creates a safe runway for structured authoring.

Consequences:
- Some legacy paths and action modules will coexist temporarily.
- Feature-flagged coexistence is required during migration.
- Validation and workflow enforcement must become shared infrastructure, not page-local logic.

Follow-ups:
- Create executable task specs per phase.
- Create schema migration specs.
- Create structured block registry spec.

## 2. Delivery principles

1. No large-bang rewrite.
   Replace the system in layers. Keep the current `/admin/knowledge` surface operable while core correctness is repaired.

2. MDX remains canonical storage.
   All new structured editing serializes to valid MDX. No alternative persisted document model ships in this program.

3. Student renderer remains the rendering truth.
   Preview, validation, and block serialization must target the same component registry and compile path used by the student wiki renderer.

4. Integrity gates before convenience.
   Save, import, review, and publish correctness outrank editor ergonomics. Structured UX work starts only after correctness and policy foundations are in place.

5. Action-layer consolidation before advanced UX.
   Consolidate article/question/status/preview actions and shared validators before building block palettes, drag-and-drop, or prop inspectors.

6. Feature-flagged rollout for structured authoring.
   Structured block authoring ships behind internal admin flags, starting with content admins only.

7. Migration must preserve existing valid content.
   Existing valid MDX remains editable and renderable. Unsupported legacy constructs fall back to raw-MDX/expert mode, not silent corruption.

8. Standard questions become explicitly article-owned.
   `topic_id` remains for taxonomy and delivery, but standard editorial integrity is enforced through `article_id` ownership plus topic consistency checks.

9. Review and publish are policy workflows, not UI toggles.
   Status transitions must be validated centrally and never implemented as direct table writes from route-local logic.

10. Kill switches are required.
    Structured block editing, new publish gates, and new reviewer edit surfaces must be independently disableable.

## 3. Workstreams

### A. Core editor correctness

- Objective: restore a functional article create/edit/save path in the unified editor.
- Why it exists: the current primary authoring route cannot create a new article and drops critical state during save.
- Exact findings addressed: broken unified new-article creation, silent taxonomy drop, partial article/question save fragility.
- Code areas likely involved:
  - `src/app/admin/knowledge/new/page.tsx`
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
  - `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/wiki.ts`
- DB or migration impact: none required for initial stop-the-bleeding fixes.
- Dependencies: none.
- Rollout risk: high.
- Definition of done: a new article can be created from `/admin/knowledge/new`, saved, reopened, previewed, and taxonomy changes persist.

### B. Taxonomy persistence and coupling correctness

- Objective: make taxonomy mapping authoritative and keep article/question/topic relationships coherent.
- Why it exists: current coupling is mostly implicit through topic mappings and breaks under taxonomy drift.
- Exact findings addressed: taxonomy changes not saved, topic-based question coupling dominates over direct article ownership, article/question ambiguity.
- Code areas likely involved:
  - `src/components/admin/unified-editor/ArticlePanel.tsx`
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/question-queries.ts`
  - `src/lib/actions/admin/dashboard.ts`
  - `src/lib/actions/admin/coverage.ts`
- DB or migration impact:
  - required backfill and likely enforcement around `questions.article_id`
- Dependencies: A.
- Rollout risk: high.
- Definition of done: standard questions are article-owned and topic-consistent; article editor loads the canonical coupled set.

### C. Status model normalization

- Objective: replace workflow status drift with one canonical model across editor, review queue, pipeline, and action layer.
- Why it exists: mixed `review`/`pending_review`/`approved` semantics make the workflow contradictory.
- Exact findings addressed: workflow status drift, invisible queue items, pipeline misbucketing.
- Code areas likely involved:
  - `src/components/admin/unified-editor/ContentBar.tsx`
  - `src/components/admin/SMEReviewQueue.tsx`
  - `src/app/admin/pipeline/_components/PipelineClient.tsx`
  - `src/app/admin/pipeline/_components/PipelineCard.tsx`
  - `src/lib/actions/admin/pipeline.ts`
  - `src/lib/actions/admin/wiki.ts`
  - `src/lib/actions/admin/dashboard.ts`
- DB or migration impact:
  - required migration/backfill for legacy values
- Dependencies: none for design, but must land before D, G, H.
- Rollout risk: high.
- Definition of done: one canonical status vocabulary is used everywhere.

### D. Review workflow and reviewer-safe workspace

- Objective: make review actionable and permission-safe.
- Why it exists: reviewers can currently see work items but cannot reliably act on them.
- Exact findings addressed: `SMEReviewQueue` incomplete, reviewer access contradiction.
- Code areas likely involved:
  - `src/components/admin/SMEReviewQueue.tsx`
  - `src/app/admin/reviews/page.tsx`
  - `src/app/admin/knowledge/[id]/page.tsx`
  - `src/app/admin/knowledge/questions/[id]/page.tsx`
  - `src/lib/admin/roles.ts`
  - `src/lib/admin/access-policy.ts`
  - `src/lib/entitlements/policy.ts`
- DB or migration impact: optional review metadata support.
- Dependencies: C.
- Rollout risk: medium-high.
- Definition of done: reviewers can open a review-safe workspace, approve, request changes, and leave audit-visible comments without being routed into unauthorized dead ends.

### E. Preview/RLS repair

- Objective: make draft preview reliably available to intended admin roles and keep preview parity anchored to the student renderer.
- Why it exists: current preview policy likely still depends on stale `admin` role assumptions.
- Exact findings addressed: preview authorization mismatch, preview fragility.
- Code areas likely involved:
  - `src/lib/actions/preview-actions.ts`
  - `src/app/admin/preview/[previewId]/page.tsx`
  - `supabase/migrations/20260329_create_admin_draft_previews.sql`
  - `src/lib/admin/roles.ts`
  - `src/lib/entitlements/policy.ts`
  - `src/components/wiki/article/WikiArticle.tsx`
- DB or migration impact:
  - required policy update
  - optional TTL/cleanup support
- Dependencies: none.
- Rollout risk: medium.
- Definition of done: `super_admin` and `content_admin` can generate and open previews consistently and preview parity remains anchored to student rendering.

### F. Import pipeline consolidation

- Objective: collapse duplicated question import paths into one canonical normalization and validation pipeline.
- Why it exists: generic import and article-specific import currently produce different shapes and rule enforcement.
- Exact findings addressed: duplicated import logic, question option-shape drift, rule bypass on import.
- Code areas likely involved:
  - `src/components/admin/QuestionImporter.tsx`
  - `src/components/admin/ArticleQuestionImporter.tsx`
  - `src/lib/import/question-importer.ts`
  - `src/lib/import/question-schema.ts`
  - `src/lib/import/import-actions.ts`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/questions.ts`
- DB or migration impact: optional audit metadata only.
- Dependencies: G and B.
- Rollout risk: high.
- Definition of done: all question imports use one canonical schema, one normalization layer, one validation engine, and one persistence shape.

### G. Validation and integrity engine

- Objective: centralize content validation, normalization, warnings, and blocking gates for save/import/review/publish.
- Why it exists: current validations are page-local, incomplete, and inconsistent.
- Exact findings addressed: no readable-topic/no-question enforcement, no compile gate, no minimum-question threshold gate, no centralized publish/review blocking logic.
- Code areas likely involved:
  - new modules under `src/lib/admin/editor-integrity/*`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/questions.ts`
  - `src/lib/actions/admin/pipeline.ts`
  - `src/lib/import/*`
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
- DB or migration impact: depends on which checks become constraints later.
- Dependencies: B and C.
- Rollout risk: high.
- Definition of done: one validator contract is reused by save, autosave, import, review submission, approval, publish, and relevant delivery filters.

### H. Save orchestration refactor

- Objective: replace best-effort parallel saves with staged orchestration and deterministic failure handling.
- Why it exists: current article/question/EI saves can partially succeed without strong dependency control.
- Exact findings addressed: partial save fragility, broken create flow, missing taxonomy save in the active caller.
- Code areas likely involved:
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
  - `src/components/admin/unified-editor/DirtyStateProvider.tsx`
  - `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/questions.ts`
- DB or migration impact: optional versioning later.
- Dependencies: A and G.
- Rollout risk: high.
- Definition of done: save order is deterministic; partial failures preserve local dirty state accurately.

### I. Structured block authoring foundation

- Objective: build the registry, schema, parser, serializer, and compatibility model for structured block editing on top of MDX.
- Why it exists: the chosen target architecture depends on structured authoring, but current authoring is snippet-first.
- Exact findings addressed: MDX-string-first UX, missing component validation model.
- Code areas likely involved:
  - new `src/lib/admin/editor-blocks/*`
  - `src/components/admin/unified-editor/ArticlePanel.tsx`
  - `src/components/wiki/article/WikiArticle.tsx`
  - `src/components/wiki/mdx-components-shared.ts`
  - `src/components/wiki/widgets/registry.ts`
  - `src/lib/wiki-markdown.ts`
- DB or migration impact: none required to keep MDX canonical.
- Dependencies: E and G.
- Rollout risk: medium-high.
- Definition of done: a canonical block registry exists; supported blocks round-trip between structured editing state and valid MDX; unsupported content falls back safely.

### J. Drag-and-drop / prop-form UX layer

- Objective: add the SME-friendly UX layer on top of the structured block foundation.
- Why it exists: structured editing foundation alone does not solve usability.
- Exact findings addressed: missing visual insertion, missing prop forms, missing reordering.
- Code areas likely involved:
  - `src/components/admin/unified-editor/ArticlePanel.tsx`
  - new `src/components/admin/unified-editor/block-editor/*`
- DB or migration impact: none.
- Dependencies: I.
- Rollout risk: medium.
- Definition of done: supported blocks can be inserted visually, reordered, and edited through prop forms without directly editing MDX strings.

### K. Legacy route and action cleanup

- Objective: remove or quarantine duplicated routes, stale revalidation targets, and legacy action modules after the new path is stable.
- Why it exists: legacy surfaces currently create operational ambiguity and stale behavior.
- Exact findings addressed: duplicated route families, stale revalidation targets, multiple article mutation surfaces.
- Code areas likely involved:
  - `src/app/admin/articles/**`
  - `src/app/admin/content/**`
  - `src/app/admin/questions/**`
  - `src/lib/actions/admin/wiki.ts`
  - `src/lib/wiki/wiki-actions.ts`
  - `src/lib/actions/admin/bulk.ts`
  - `src/lib/routes.ts`
- DB or migration impact: none directly.
- Dependencies: A through J stabilization.
- Rollout risk: medium.
- Definition of done: operational docs, links, and revalidation all point to canonical `/admin/knowledge*` surfaces.

### L. Observability / audit / telemetry

- Objective: make integrity failures, review actions, preview failures, and rollout health measurable.
- Why it exists: current audit logging omits critical mutation surfaces and telemetry is insufficient for controlled rollout.
- Exact findings addressed: missing taxonomy-junction audit, missing preview/validation/publish observability.
- Code areas likely involved:
  - `supabase/migrations/007_add_audit_logs.sql`
  - `src/lib/actions/admin/*`
  - `src/lib/audit/audit-actions.ts`
  - server logging utilities
- DB or migration impact: likely yes for extra audit coverage or version tables.
- Dependencies: none for initial instrumentation.
- Rollout risk: low-medium.
- Definition of done: critical flows emit enough telemetry and audit evidence to detect regressions quickly.

### M. Test coverage and release hardening

- Objective: build enough automated confidence to ship correctness changes and structured editing safely.
- Why it exists: current tests cover fragments, not the end-to-end authoring workflow.
- Exact findings addressed: missing integration and e2e coverage.
- Code areas likely involved:
  - `src/lib/actions/admin/*.test.ts`
  - new integration/e2e suites
  - preview/render validation tests
  - role and permission tests
- DB or migration impact: test fixtures and migration test harness required.
- Dependencies: continuous across all other workstreams.
- Rollout risk: low if done continuously, high if deferred.
- Definition of done: each phase has passing unit, integration, and rollout-gate tests for its highest-risk paths.

## 4. Phased implementation plan

### Phase 0: Stop-the-bleeding fixes

Goal:
- Restore basic correctness in the active `/admin/knowledge` authoring flow.

Why this phase exists:
- The current primary editor is actively broken for article creation and silently drops taxonomy state.

Included work items:
- Fix unified new-article creation by introducing create-or-update orchestration.
- Persist taxonomy mapping from the article editor.
- Correct live revalidation targets for bulk/admin actions.
- Repair obvious link/deep-link failures such as coverage and missing-rationale links.
- Align preview role policy with the active role model.

Excluded work items:
- status normalization
- reviewer workspace redesign
- structured block authoring
- full validation engine

Prerequisite dependencies:
- None.

Technical deliverables:
- working create flow
- working taxonomy persistence
- corrected preview access
- corrected canonical route revalidation

Schema changes:
- Optional preview policy migration if RLS fix is DB-side.

Migration tasks:
- none required for article create/taxonomy fix
- if preview RLS changes via SQL, deploy policy update

Testing requirements:
- unit tests for create-or-update orchestration
- integration test for new article flow
- integration test for taxonomy persistence
- permission test for draft preview

Rollout strategy:
- ship directly behind existing admin access
- no feature flag required for the create/taxonomy fixes

Acceptance gate:
- content admin can create article, save it, preview it, reopen it, and see taxonomy persisted

Rollback plan:
- revert to previous save path if create/update orchestration introduces wider breakage
- keep preview route operational via service-role fallback if RLS fix misbehaves

### Phase 1: Integrity and workflow unification

Goal:
- Normalize workflow states and establish the shared article-question integrity model.

Why this phase exists:
- Advanced UX is unsafe until the policy model is coherent.

Included work items:
- Canonical status vocabulary migration.
- Central content integrity validator contract.
- Enforce article ownership model for standard questions.
- Define scenario-based exception boundaries.
- Consolidate question querying to respect the new coupling model in admin/editor paths.

Excluded work items:
- full save orchestration rewrite
- structured editing UI

Prerequisite dependencies:
- Phase 0.

Technical deliverables:
- status normalization migration
- shared validator service
- article-question linkage strategy implemented in action layer

Schema changes:
- required status normalization migration
- required article-question linkage migration/backfill
- optional helper indexes and views

Migration tasks:
- map old statuses to canonical states
- backfill `questions.article_id` for standard questions where resolvable
- flag unresolved/orphan questions for manual remediation

Testing requirements:
- migration tests for status mapping
- integration tests for coupling validation
- negative tests for orphan question creation

Rollout strategy:
- dark launch validation in warning-only mode first
- then turn on blocking for save/import/review

Acceptance gate:
- no live admin path can create or move a standard question into a state that violates the readable-topic rule

Rollback plan:
- keep validation engine capable of warning-only mode
- if backfill exposes too many unresolved records, block only publish first and defer save blocking

### Phase 2: Save/preview/review hardening

Goal:
- Make save behavior deterministic, preview reliable, and review operational.

Why this phase exists:
- Integrity rules are not enough if save/review flows still fail operationally.

Included work items:
- staged save orchestration
- improved partial-failure handling
- reviewer-safe review workspace
- actual approve/request-changes actions
- save-time and publish-time compile validation
- preview cleanup/TTL strategy

Excluded work items:
- structured block palette
- drag-and-drop editor UX

Prerequisite dependencies:
- Phase 1.

Technical deliverables:
- new save dependency order
- functional review actions
- compile validation gates
- better preview lifecycle

Schema changes:
- optional preview cleanup metadata
- optional review metadata expansion

Migration tasks:
- none mandatory beyond policy/data compatibility

Testing requirements:
- integration tests for staged save partial failure
- reviewer workflow tests
- preview parity and preview authorization tests
- compile validation failure tests

Rollout strategy:
- ship save/review hardening to all content admins
- reviewer workspace may be feature-flagged if reviewer policy remains unsettled

Acceptance gate:
- review queue is operational end-to-end
- partial saves behave predictably
- preview and publish gates use the real render contract

Rollback plan:
- fallback to warning-only compile checks if blocking causes widespread editorial deadlock

### Phase 3: Structured block authoring foundation

Goal:
- Build the non-UI foundation for structured authoring on top of MDX.

Why this phase exists:
- The UX layer cannot ship safely without parser/serializer/registry infrastructure.

Included work items:
- canonical block registry
- block schemas
- MDX serializer
- parser for supported legacy constructs
- unsupported-block fallback model
- expert/raw-MDX mode policy

Excluded work items:
- drag-and-drop and polished SME UI

Prerequisite dependencies:
- Phase 2.

Technical deliverables:
- block registry module
- block round-trip tests
- compatibility layer for mixed legacy/new content

Schema changes:
- none required for MDX canonical storage

Migration tasks:
- mark supported block families for structured mode
- define unsupported-block fallback handling

Testing requirements:
- parser/serializer round-trip tests
- compatibility tests on real sampled MDX
- unsupported-block fallback tests

Rollout strategy:
- dark launch behind feature flag for content admins only
- keep raw editor as fallback

Acceptance gate:
- supported blocks can round-trip to valid MDX without preview regressions

Rollback plan:
- disable structured foundation feature flag and fall back to raw MDX editor

### Phase 4: Structured editor UX rollout

Goal:
- Deliver the SME-friendly structured authoring experience.

Why this phase exists:
- This is the chosen future-state UX, but it must sit on hardened foundations.

Included work items:
- slash menu
- block palette
- prop inspector forms
- block reorder controls
- drag-and-drop where safe
- visual insertion for supported blocks

Excluded work items:
- full non-MDX document model

Prerequisite dependencies:
- Phase 3.

Technical deliverables:
- block authoring UI in article editor
- preview-integrated block editing
- mixed-mode handling between prose and structured blocks

Schema changes:
- none

Migration tasks:
- progressive enablement per block family

Testing requirements:
- e2e authoring tests for supported blocks
- accessibility tests for keyboard-only block operations
- regression tests for saved MDX compatibility

Rollout strategy:
- feature-flagged to content admins first
- migrate SMEs only after supported-block coverage is adequate

Acceptance gate:
- non-technical editors can insert and configure supported blocks without touching raw MDX

Rollback plan:
- disable structured editor flag and keep block registry/serialization code inactive

### Phase 5: Technical debt retirement and stabilization

Goal:
- Remove redundant surfaces and stabilize the system after the new path is proven.

Why this phase exists:
- Legacy routes/actions and inconsistent operational edges will keep causing regressions if left in place.

Included work items:
- retire or quarantine duplicated route families
- remove stale action surfaces
- clean up revalidation and canonical route usage
- add versioning/recovery if still pending
- finalize observability dashboards and runbooks

Excluded work items:
- unrelated admin portal work

Prerequisite dependencies:
- Phase 4 stable rollout

Technical deliverables:
- reduced route/action surface area
- operational runbooks
- final cleanup of deprecated paths

Schema changes:
- optional versioning/recovery tables if deferred earlier

Migration tasks:
- route cleanup with redirect safety audit

Testing requirements:
- regression tests on removed/redirected legacy paths
- post-cleanup smoke suite

Rollout strategy:
- staged removal with redirect monitoring

Acceptance gate:
- operational ownership is on one canonical admin authoring stack

Rollback plan:
- preserve redirects and deprecation shims until traffic proves safe

## 5. File-level implementation map

### Phase 0

| File / module | Intended change | Class | Blocking |
|---|---|---|---|
| `src/app/admin/knowledge/new/page.tsx` | Stop passing an impossible blank persisted article contract; route new articles through a create-capable editor mode | fix | yes |
| `src/components/admin/unified-editor/SaveAllBar.tsx` | Add create-or-update branching; include taxonomy persistence in save payload; fix save ordering | refactor | yes |
| `src/components/admin/unified-editor/UnifiedContentEditor.tsx` | Carry explicit editor mode and new-article state; prepare staged save inputs | refactor | yes |
| `src/lib/actions/admin/content.ts` | Consolidate article mutation entrypoint or delegate to a new canonical article save service | refactor | yes |
| `src/lib/actions/admin/wiki.ts` | Either become the canonical article create/update service or be deprecated in favor of one consolidated service | refactor / deprecate | yes |
| `src/lib/actions/preview-actions.ts` | Align preview access with current roles and improve failure reporting | fix | yes |
| `src/lib/actions/admin/bulk.ts` | Revalidate canonical `/admin/knowledge*` routes | fix | no |
| `src/app/admin/taxonomy/coverage/page.tsx` | Fix broken deep links to canonical filtered surfaces | fix | no |
| `src/components/admin/NeedsAttentionCard.tsx` | Point to a real filter implementation or remove dead filter link | fix | no |

### Phase 1

| File / module | Intended change | Class | Blocking |
|---|---|---|---|
| `src/lib/actions/admin/questions.ts` | Enforce direct article ownership model and standardized validation | refactor | yes |
| `src/lib/actions/admin/content.ts` | Stop article-question coupling from being topic-only in the editor path | refactor | yes |
| `src/lib/actions/admin/question-queries.ts` | Prefer direct article-coupled queries for editor contexts; preserve topic-based analytics separately | refactor | yes |
| `src/lib/actions/admin/pipeline.ts` | Replace free-form status updates with validated transitions | refactor | yes |
| `src/components/admin/unified-editor/ContentBar.tsx` | Use canonical statuses and transition gating | refactor | yes |
| `src/app/admin/pipeline/_components/PipelineClient.tsx` | Canonical status buckets only | fix | yes |
| `src/app/admin/pipeline/_components/PipelineCard.tsx` | Route through validated transition actions, not raw status flips | refactor | yes |
| `src/components/admin/SMEReviewQueue.tsx` | Consume canonical status model | refactor | yes |
| `src/lib/admin/roles.ts` | Clarify manage-content vs review-workspace permissions | refactor | yes |
| `supabase/migrations/*status*` | Normalize stored status values | migration | yes |
| `supabase/migrations/*questions*` | Backfill / enforce `article_id` for standard questions | migration | yes |

### Phase 2

| File / module | Intended change | Class | Blocking |
|---|---|---|---|
| `src/components/admin/unified-editor/SaveAllBar.tsx` | Staged save orchestration, partial failure handling, warning vs blocking validation, retry logic | refactor | yes |
| `src/components/admin/unified-editor/DirtyStateProvider.tsx` | Support staged save resets and later recovery state | refactor | yes |
| `src/components/admin/SMEReviewQueue.tsx` | Implement actual approve/request-changes actions and routing into reviewer-safe workspace | refactor | yes |
| `src/app/admin/knowledge/[id]/page.tsx` | Support reviewer-safe open mode if role policy allows | refactor | yes |
| `src/app/admin/knowledge/questions/[id]/page.tsx` | Support reviewer-safe moderation mode or dedicated review surface | refactor | yes |
| `src/components/admin/unified-editor/ArticlePanel.tsx` | Invoke compile validation and preview hardening | refactor | yes |
| `src/components/wiki/article/WikiArticle.tsx` | Remain renderer truth; export or support shared compile contract if needed | refactor | yes |

### Phase 3

| File / module | Intended change | Class | Blocking |
|---|---|---|---|
| `src/components/admin/unified-editor/ArticlePanel.tsx` | Add structured-authoring host layer behind flag | refactor | yes |
| `src/components/wiki/widgets/registry.ts` | Feed a canonical admin block registry or be wrapped by one | refactor | yes |
| `src/components/wiki/mdx-components-shared.ts` | Map canonical supported blocks for serializer/preview compatibility | refactor | yes |
| `src/lib/wiki-markdown.ts` | Add parser/serializer helpers and richer MDX validation utilities | refactor | yes |
| new `src/lib/admin/editor-blocks/*` | Registry, schemas, serializer, parser, fallback handling | new module | yes |

### Phase 4

| File / module | Intended change | Class | Blocking |
|---|---|---|---|
| `src/components/admin/unified-editor/ArticlePanel.tsx` | Replace snippet-only UX for supported blocks with slash menu, block list, and prop inspector | refactor | yes |
| new `src/components/admin/unified-editor/block-editor/*` | Block palette, inspector forms, reorder controls, drag-and-drop layer | new module | yes |
| `src/components/admin/unified-editor/OutlinePanel.tsx` | Optionally reflect block structure and validation errors | refactor | no |

### Phase 5

| File / module | Intended change | Class | Blocking |
|---|---|---|---|
| `src/app/admin/articles/**` | Keep redirects or retire after monitoring | deprecate / delete | no |
| `src/app/admin/content/**` | Remove misleading legacy deep-link behavior | deprecate / delete | no |
| `src/app/admin/questions/**` | Retire duplicate wrappers once canonical surfaces are stable | deprecate / delete | no |
| `src/lib/actions/admin/wiki.ts` | Delete or convert to compatibility shim if superseded | delete / deprecate | no |
| `src/lib/wiki/wiki-actions.ts` | Quarantine legacy admin CRUD/status surface from current admin workflow | deprecate | no |

## 6. Data and schema plan

### Required schema changes

#### 1. Status normalization

Purpose:
- Eliminate mixed `review` / `pending_review` style states.

Migration order:
1. add compatibility reads in code
2. backfill stored values
3. switch writes to canonical values
4. remove compatibility aliases

Compatibility considerations:
- queue/pipeline/dashboard must tolerate both old and new values during backfill.

Rollback considerations:
- keep a reversible mapping in the migration script.

#### 2. Standard question article linkage enforcement

Purpose:
- make standard questions explicitly article-owned.

Schema direction:
- backfill `questions.article_id` where resolvable from current taxonomy mapping
- introduce an exception discriminator for scenario-based content if standard `questions` currently mix exception types
- add supporting indexes if missing for article-owned queries

Migration order:
1. classify standard vs exception question families
2. backfill resolvable standard questions
3. surface unresolved rows to admin remediation report
4. enable app-layer enforcement
5. add DB constraints only when data is clean enough

Compatibility considerations:
- topic-based delivery may need to coexist temporarily with article-owned admin coupling.

Rollback considerations:
- constraints should be added only after backfill quality is verified.

#### 3. Preview role policy fix

Purpose:
- align `admin_draft_previews` access with current roles.

Migration order:
1. update policy
2. verify live role rows
3. deploy app-side preview changes

Compatibility considerations:
- preview route and action must continue to work during transition.

Rollback considerations:
- fallback to service-role preview writes if policy update causes access outages.

### Optional schema changes

#### 4. Versioning / recovery support

Purpose:
- support rollback and draft recovery.

Schema direction:
- add article version table and possibly question-set version snapshot support.

Migration order:
- after save orchestration stabilization.

#### 5. Review / audit enrichment

Purpose:
- capture richer reviewer actions and taxonomy mapping changes.

Schema direction:
- add explicit audit coverage for junction-table mutations and review state transitions.

### What should remain application-enforced

Keep in app-layer validation rather than hard DB constraints initially:
- minimum 10 standard questions per article
- compile-valid MDX
- structured block prop validity
- publish readiness
- scenario-based exceptions

Reason:
- these rules depend on renderer behavior, content type, and staged migration state.

## 7. Validation and policy enforcement plan

### Shared integrity engine location

Create a shared validation module under one canonical surface, for example:
- `src/lib/admin/editor-integrity/`

Suggested modules:
- `article-validation.ts`
- `question-validation.ts`
- `coupling-validation.ts`
- `status-transitions.ts`
- `publish-gates.ts`
- `import-normalization.ts`
- `result-types.ts`

### Enforcement model

#### Editor save

- Run normalization first.
- Run warning and blocking validation.
- Block save on:
  - invalid create/update identity
  - invalid compile
  - standard question without article linkage
  - topic/article mismatch

#### Autosave

- Run normalization and warning-only validation.
- Allow autosave to persist drafts unless blocking conditions would create unrecoverable corruption.
- Never publish on autosave.

#### Import

- Dry-run validation first.
- Normalize to canonical question shape.
- Block commit on coupling failures, invalid options, invalid status/state, or unresolved standard article linkage.

#### Submit for review

- Block on compile-invalid articles, unresolved standard question linkage, and canonical status preconditions.

#### Reviewer approval

- Re-run integrity checks.
- Reviewer can approve only if blocking validation passes.
- Reviewer-only overrides should not bypass compile or coupling failures.

#### Publish

- Re-run full integrity engine.
- Block on:
  - compile failure
  - unreadable parent article for standard questions
  - minimum-question-count failure
  - unresolved exception classification

#### Student-facing question delivery

- During migration: tighten delivery filters after `article_id` backfill is stable.
- End state: standard questions should not be served if their linked article is not in an allowed readable state.

## 8. Structured editor migration plan

### Canonical block registry

Add a registry defining, per supported block:
- `type`
- `displayName`
- `description`
- `propsSchema`
- `defaultProps`
- `serializer`
- `previewComponent`
- `parseSupportLevel`

### Serializer to MDX

- Structured blocks serialize to canonical MDX strings.
- Prose blocks preserve Markdown.
- Serialization output is compile-validated before save.

### Parser from existing MDX

1. Parse supported known block families into structured blocks.
2. Preserve plain Markdown sections as prose blocks.
3. Unsupported/custom/ambiguous constructs become raw-MDX fallback blocks.

### Fallback handling for unsupported blocks

- Unsupported content remains renderable.
- Unsupported content remains editable only in expert/raw-MDX mode.
- Unsupported blocks are surfaced as warnings, not silently transformed.

### Expert/raw-MDX mode policy

1. Expert mode is allowed for technical editors and content admins.
2. It is not the default for SMEs.
3. Expert mode still uses the same compile and integrity validation gates.
4. Expert mode is not a bypass channel.

### Preview integration

- Structured editor preview uses the same serializer and the same renderer contract as the student wiki renderer.
- No parallel component map is introduced for structured mode.

### Feature flag strategy

Flags to introduce:
- `admin_editor_structured_blocks_foundation`
- `admin_editor_structured_blocks_ui`
- `admin_editor_reviewer_workspace_v2`
- `admin_editor_publish_gates_v2`

### Incremental rollout path

1. Ship registry/parser/serializer with no visible structured UI.
2. Validate on sampled real content.
3. Expose structured mode to content admins for a limited supported block set.
4. Expand supported block families.
5. Onboard SMEs only after fallback rates and preview parity are acceptable.

### Coexistence with old content

1. Old valid MDX remains valid.
2. Old supported snippets can be parsed into structured blocks where possible.
3. Old unsupported snippets stay in raw-MDX blocks.
4. Migration is per-article, not forced globally.

### Success criteria

1. Supported block types round-trip safely.
2. Preview parity is maintained for structured-edited articles.
3. SMEs can perform common block authoring tasks without manual MDX syntax editing.
4. Legacy content is not corrupted when opened in the new editor.

## 9. Dependency order

1. Phase 0 create/taxonomy/preview repairs.
2. Status normalization design and migration planning.
3. Shared integrity engine contract.
4. Standard question coupling and `article_id` backfill.
5. Save orchestration refactor.
6. Review workflow repair and reviewer-safe workspace.
7. Compile validation and publish gating.
8. Import consolidation on top of normalized question shape and validator.
9. Structured block registry/parser/serializer foundation.
10. Structured editor UI rollout.
11. Legacy route/action retirement.

What can happen in parallel:
- preview/RLS repair can run in parallel with create/taxonomy fixes
- audit/telemetry groundwork can run in parallel with Phases 1-2
- import consolidation can start once normalization contracts are defined

What must not start early:
- drag-and-drop / prop-form UX work must not start before create flow, taxonomy persistence, status normalization, validation contracts, and preview parity are stabilized
- legacy route retirement must not start before canonical workflows are stable

## 10. Test and quality plan

### Unit tests

Target modules:
- new integrity engine modules
- status transition rules
- import normalization
- block serializer/parser

Highest-risk scenarios:
- valid vs invalid question/article coupling
- status alias normalization
- supported block round-trip

Pass criteria:
- deterministic pass/fail for validator categories.

### Integration tests

Target modules:
- `SaveAllBar`
- admin actions for article/question/pipeline
- preview actions

Highest-risk scenarios:
- new article create + save
- taxonomy persistence
- article save succeeds / question save fails
- review submission and approval gating

Pass criteria:
- editor workflows behave consistently with DB state.

### End-to-end tests

Target flows:
- create article -> assign taxonomy -> add questions -> preview -> submit review -> approve -> publish
- import questions into linked article
- reviewer opens item and completes workflow
- structured block insertion and preview parity

Highest-risk scenarios:
- partial save failure
- compile-invalid MDX blocking publish
- reviewer permission contradictions

### Migration tests

Target:
- status backfill migration
- `article_id` backfill for standard questions
- preview policy migration

Pass criteria:
- no data loss
- unresolved rows are reported, not silently discarded

### Permission tests

Target:
- `roles.ts`
- entitlements policy
- review and preview actions

Highest-risk scenarios:
- reviewer can access review workspace but not content-admin-only destructive actions
- content admin preview access
- super-admin audit-only access

### Import normalization tests

Target:
- `question-schema.ts`
- `question-importer.ts`
- `import-actions.ts`

Highest-risk scenarios:
- old CSV/JSON spreadsheets normalize to editor-compatible option shape
- invalid files fail with actionable errors

### Preview parity tests

Target:
- `ArticlePanel` -> preview serialization
- preview route
- `WikiArticle` render path

Highest-risk scenarios:
- same MDX produces same structural output in student and preview contexts

### Compile validation tests

Target:
- MDX validation helpers
- block registry serializers

Highest-risk scenarios:
- malformed supported block props
- unsupported block fallback

### Rollback and failure tests

Target:
- staged save orchestration
- feature flags
- migration rollback scripts

Highest-risk scenarios:
- create/save regression rollback
- publish-gate over-blocking
- structured editor flag disablement

## 11. Release and rollout plan

### Feature flags

Required flags:
- `admin_editor_publish_gates_v2`
- `admin_editor_reviewer_workspace_v2`
- `admin_editor_structured_blocks_foundation`
- `admin_editor_structured_blocks_ui`

### Dark launch / internal rollout

1. Phase 0 fixes ship to all content admins immediately.
2. Phase 1 validation engine starts in shadow/warning mode.
3. Publish gates switch to blocking only after warning telemetry is understood.
4. Structured block foundation ships dark first.
5. Structured block UI is internal-only to content admins first.

### Migration checkpoints

1. Status normalization complete and verified.
2. `article_id` backfill complete, with unresolved standard questions explicitly triaged.
3. Preview role policy verified on real admin accounts.
4. Import parity verified on representative legacy spreadsheets.

### Observability checkpoints

Track before expanding rollout:
- create/save success rate
- validation warning counts
- publish-block counts by reason
- preview failures
- review action success rate
- structured editor parse fallback rate

### Kill switches

1. Disable structured UI and fall back to raw MDX.
2. Downgrade publish gates from blocking to warning-only.
3. Disable reviewer workspace v2 and return to read-only queue if needed.
4. Route preview writes through service role if RLS migration fails.

### Release sequencing

1. Phase 0 code + minimal tests.
2. Phase 1 migrations + warning-mode validator.
3. Phase 2 save/review hardening.
4. Phase 3 dark-launch structured foundation.
5. Phase 4 internal structured UI rollout.
6. Phase 5 cleanup after stability window.

### Post-release verification

After each phase:
1. verify critical admin flows manually
2. verify telemetry dashboards
3. inspect audit trails for missing mutation coverage
4. verify no stale legacy route behavior remains in the touched area

## 12. Risk register

The detailed risk register is maintained separately:
- `.ai/plans/2026-04-12_admin-editor-risk-register.md`

Summary:
- highest-risk items are create-flow persistence, taxonomy silent drop, status migration drift, over/under-blocking integrity gates, reviewer permission contradictions, preview parity regression, structured-editor legacy-MDX corruption, and import normalization regressions.

## 13. Executive prioritization

### Top 10 implementation tasks by urgency

1. Fix unified new-article creation.
2. Fix taxonomy persistence from the active editor.
3. Repair preview authorization / RLS.
4. Normalize status vocabulary.
5. Build shared integrity engine.
6. Backfill and enforce standard question `article_id`.
7. Implement actual review actions and reviewer-safe workspace.
8. Refactor staged save orchestration.
9. Consolidate import normalization.
10. Add compile validation before publish.

### Top 10 implementation tasks by architectural leverage

1. Shared integrity engine.
2. Status normalization.
3. Standard question article-ownership model.
4. Save orchestration refactor.
5. Canonical article mutation service consolidation.
6. Import pipeline consolidation.
7. Reviewer-safe workspace.
8. Preview parity contract around the student renderer.
9. Structured block registry/parser/serializer foundation.
10. Legacy route/action cleanup.

### What absolutely must be done before any structured-editor UX work begins

1. Fix create flow.
2. Fix taxonomy persistence.
3. Normalize status model.
4. Define and implement shared integrity validation.
5. Stabilize save orchestration.
6. Preserve preview parity through the real renderer.

### What can be deferred safely

1. Drag-and-drop reordering polish.
2. Version history UI.
3. Advanced expert-mode tooling beyond safe raw fallback.
4. Full legacy route retirement, as long as redirects remain correct.

## 14. Implementation artifacts to create next

1. `.ai/plans/2026-04-12_admin-editor-phase-0-execution-spec.md`
2. `.ai/plans/2026-04-12_admin-editor-schema-migration-plan.md`
3. `.ai/plans/2026-04-12_admin-editor-validation-engine-spec.md`
4. `.ai/plans/2026-04-12_admin-editor-review-workspace-spec.md`
5. `.ai/plans/2026-04-12_admin-editor-structured-block-registry-spec.md`
6. `.ai/plans/2026-04-12_admin-editor-rollout-checklist.md`
