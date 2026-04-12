# Admin Editor Workstream Breakdown

## A. Core editor correctness

- Objective: restore create/edit/save correctness in the unified editor.
- Why: current primary article authoring path is broken.
- Findings addressed: broken create flow, dropped taxonomy state, partial save fragility.
- Likely files:
  - `src/app/admin/knowledge/new/page.tsx`
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
  - `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/wiki.ts`
- DB impact: none required initially.
- Dependencies: none.
- Rollout risk: high.
- Definition of done: new article creation and taxonomy persistence work on the canonical route.

## B. Taxonomy persistence and coupling correctness

- Objective: make article-question-topic coupling explicit and stable.
- Why: current coupling is implicit, topic-heavy, and drifts.
- Findings addressed: topic-based coupling dominance, taxonomy drift risk, article-question ambiguity.
- Likely files:
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/question-queries.ts`
  - `src/components/admin/unified-editor/ArticlePanel.tsx`
  - `src/components/admin/unified-editor/QuestionsPanel.tsx`
- DB impact: required backfill and likely enforcement around `questions.article_id`.
- Dependencies: A.
- Rollout risk: high.
- Definition of done: standard questions are article-owned and topic-consistent.

## C. Status model normalization

- Objective: unify workflow states across editor, queue, and pipeline.
- Why: current mixed status vocabulary causes invisible or misbucketed content.
- Findings addressed: status drift, review/pipeline inconsistency.
- Likely files:
  - `src/components/admin/unified-editor/ContentBar.tsx`
  - `src/components/admin/SMEReviewQueue.tsx`
  - `src/app/admin/pipeline/_components/PipelineClient.tsx`
  - `src/app/admin/pipeline/_components/PipelineCard.tsx`
  - `src/lib/actions/admin/pipeline.ts`
  - `src/lib/actions/admin/wiki.ts`
- DB impact: required migration/backfill.
- Dependencies: none, but should land before D/G/H.
- Rollout risk: high.
- Definition of done: one canonical status set is used everywhere.

## D. Review workflow and reviewer-safe workspace

- Objective: make review actionable and permission-safe.
- Why: current review queue is incomplete and reviewer routing is contradictory.
- Findings addressed: dead-end review actions, reviewer access contradiction.
- Likely files:
  - `src/components/admin/SMEReviewQueue.tsx`
  - `src/app/admin/reviews/page.tsx`
  - `src/app/admin/knowledge/[id]/page.tsx`
  - `src/app/admin/knowledge/questions/[id]/page.tsx`
  - `src/lib/admin/roles.ts`
  - `src/lib/admin/access-policy.ts`
- DB impact: optional review metadata support.
- Dependencies: C.
- Rollout risk: medium-high.
- Definition of done: reviewers can review, request changes, and approve in a working workspace.

## E. Preview/RLS repair

- Objective: make draft preview reliable and role-correct.
- Why: current preview policy likely still assumes obsolete role names.
- Findings addressed: preview authorization mismatch, preview fragility.
- Likely files:
  - `src/lib/actions/preview-actions.ts`
  - `src/app/admin/preview/[previewId]/page.tsx`
  - `supabase/migrations/20260329_create_admin_draft_previews.sql`
- DB impact: required policy update.
- Dependencies: none.
- Rollout risk: medium.
- Definition of done: canonical admin roles can preview successfully and preview parity remains anchored to student rendering.

## F. Import pipeline consolidation

- Objective: unify question import shape, rules, and persistence.
- Why: two different import paths currently normalize and persist differently.
- Findings addressed: duplicated import logic, question shape drift, rule bypass on import.
- Likely files:
  - `src/components/admin/QuestionImporter.tsx`
  - `src/components/admin/ArticleQuestionImporter.tsx`
  - `src/lib/import/question-importer.ts`
  - `src/lib/import/question-schema.ts`
  - `src/lib/import/import-actions.ts`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/questions.ts`
- DB impact: optional audit metadata only.
- Dependencies: G and B.
- Rollout risk: high.
- Definition of done: all imports use one canonical normalization and validator path.

## G. Validation and integrity engine

- Objective: centralize blocking, warning, and normalization logic.
- Why: current validation is distributed, weak, and inconsistent.
- Findings addressed: no-readable-topic/no-question rule not enforced, no compile gate, no publish gate.
- Likely files:
  - new `src/lib/admin/editor-integrity/*`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/questions.ts`
  - `src/lib/actions/admin/pipeline.ts`
  - `src/lib/import/*`
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
- DB impact: depends on which validations graduate to constraints later.
- Dependencies: B and C.
- Rollout risk: high.
- Definition of done: one validator contract is reused at save/import/review/publish.

## H. Save orchestration refactor

- Objective: make article/question/EI persistence deterministic and recoverable.
- Why: current parallel save model allows fragile partial success.
- Findings addressed: partial failure, missing taxonomy persistence, broken create path.
- Likely files:
  - `src/components/admin/unified-editor/SaveAllBar.tsx`
  - `src/components/admin/unified-editor/DirtyStateProvider.tsx`
  - `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
  - `src/lib/actions/admin/content.ts`
  - `src/lib/actions/admin/questions.ts`
- DB impact: optional versioning later.
- Dependencies: A and G.
- Rollout risk: high.
- Definition of done: save order is staged and partial failures preserve accurate dirty state.

## I. Structured block authoring foundation

- Objective: build the parser/serializer/registry layer for structured authoring on MDX.
- Why: current editor is snippet-first and unsafe for SMEs.
- Findings addressed: raw-MDX UX, missing schema-backed block model.
- Likely files:
  - new `src/lib/admin/editor-blocks/*`
  - `src/components/admin/unified-editor/ArticlePanel.tsx`
  - `src/components/wiki/article/WikiArticle.tsx`
  - `src/components/wiki/mdx-components-shared.ts`
  - `src/components/wiki/widgets/registry.ts`
  - `src/lib/wiki-markdown.ts`
- DB impact: none.
- Dependencies: E and G.
- Rollout risk: medium-high.
- Definition of done: supported block types round-trip to valid MDX and unsupported blocks fall back safely.

## J. Drag-and-drop / prop-form UX layer

- Objective: deliver visual authoring for supported blocks.
- Why: the foundation alone does not produce SME-grade usability.
- Findings addressed: no slash menu, no block palette, no prop forms, no reordering.
- Likely files:
  - `src/components/admin/unified-editor/ArticlePanel.tsx`
  - new `src/components/admin/unified-editor/block-editor/*`
- DB impact: none.
- Dependencies: I.
- Rollout risk: medium.
- Definition of done: supported blocks can be inserted, reordered, and configured without raw MDX editing.

## K. Legacy route and action cleanup

- Objective: remove duplicated operational surfaces once the new path is stable.
- Why: legacy wrappers still create ambiguity and stale behavior.
- Findings addressed: duplicated routes, stale revalidation, legacy action drift.
- Likely files:
  - `src/app/admin/articles/**`
  - `src/app/admin/content/**`
  - `src/app/admin/questions/**`
  - `src/lib/actions/admin/wiki.ts`
  - `src/lib/wiki/wiki-actions.ts`
  - `src/lib/actions/admin/bulk.ts`
- DB impact: none.
- Dependencies: A through J stabilization.
- Rollout risk: medium.
- Definition of done: all operational admin authoring paths are canonicalized on `/admin/knowledge*`.

## L. Observability / audit / telemetry

- Objective: make editor reliability and rollout health measurable.
- Why: missing telemetry and incomplete audit coverage make rollout unsafe.
- Findings addressed: missing taxonomy-junction audit, missing integrity telemetry.
- Likely files:
  - `supabase/migrations/007_add_audit_logs.sql`
  - `src/lib/audit/audit-actions.ts`
  - `src/lib/actions/admin/*`
  - server logging modules
- DB impact: likely yes for richer audit coverage.
- Dependencies: none.
- Rollout risk: low-medium.
- Definition of done: critical flows emit audit and telemetry events needed for rollout control.

## M. Test coverage and release hardening

- Objective: gate each phase with enough automated proof to ship safely.
- Why: the current system does not have workflow-grade test coverage.
- Findings addressed: missing integration/e2e coverage and migration confidence.
- Likely files:
  - `src/lib/actions/admin/*.test.ts`
  - new integration/e2e suites
- DB impact: fixture and migration harness only.
- Dependencies: continuous across all other workstreams.
- Rollout risk: low if continuous, high if deferred.
- Definition of done: each phase has passing unit, integration, and release-gate tests for its highest-risk scenarios.
