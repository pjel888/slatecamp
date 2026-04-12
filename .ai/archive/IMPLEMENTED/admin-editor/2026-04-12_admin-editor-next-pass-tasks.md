# Admin Editor Next Pass Tasks

Date: April 12, 2026

## Purpose

This document replaces the completed Phase 0 artifact and the already-consumed audit/summary documents as the active execution list for the next implementation pass on the admin editor overhaul.

## Completed and archived

These artifacts were archived because they are complete and no longer need to sit in the active `admin-editor` plan folder:

- `2026-04-12_admin-editor-deep-audit.md`
- `2026-04-12_admin-editor-executive-summary.md`
- `2026-04-12_admin-editor-phase-0-execution-spec.md`

Archive location:
- `.ai/archive/IMPLEMENTED/admin-editor/`

## Active tasks for the next pass

### 1. Deepen the dedicated exception/scenario authoring workflows

Current state:
- standard admin question flow now explicitly rejects exception/scenario question types
- dedicated admin routes and editor surfaces now exist for:
  - `design_scenarios` / `design_scenario_questions`
  - `design_problems` / `design_questions`
- both dedicated exception surfaces still need to deepen beyond the initial edit/create shell

Required next work:
- expand both dedicated exception routes beyond the initial edit shells
- add richer validation and workflow semantics for exception-class questions
- keep exception content out of the standard question editor path

Likely files:
- `src/lib/actions/admin/design-scenarios.ts`
- `src/lib/actions/admin/design-problems.ts`
- `src/components/admin/DesignScenarioEditor.tsx`
- `src/components/admin/DesignProblemEditor.tsx`
- `src/app/admin/knowledge/questions/scenarios/page.tsx`
- `src/app/admin/knowledge/questions/scenarios/[id]/page.tsx`
- `src/app/admin/knowledge/questions/design-problems/page.tsx`
- `src/app/admin/knowledge/questions/design-problems/[id]/page.tsx`
- `src/app/admin/knowledge/questions/new/page.tsx`
- `src/app/admin/knowledge/questions/[id]/page.tsx`
- `src/components/admin/QuestionEditor.tsx`
- `src/lib/actions/admin/questions.ts`
- `src/lib/admin/editor-integrity/standard-question.ts`

### 2. Consolidate the integrity engine beyond the current slices

Current state:
- save/create/import/publish use improved validation
- review approval and some workflow transitions are still partially action-local

Required next work:
- centralize review submission, approval, publish, and any remaining transition checks behind one shared validator contract
- reduce remaining route-local policy drift
- make warning vs blocking output reusable in editor UI

Likely files:
- `src/lib/admin/editor-integrity/*`
- `src/lib/actions/admin/content.ts`
- `src/lib/actions/admin/wiki.ts`
- `src/lib/actions/admin/pipeline.ts`
- `src/components/admin/unified-editor/SaveAllBar.tsx`

### 3. Finish status normalization sweep

Current state:
- touched editor/pipeline/review paths use the canonical vocabulary more consistently
- there are still untouched admin/UI/query surfaces that may still assume legacy values

Required next work:
- sweep admin route/components/actions for remaining `review` / `pending_review` / partial canonical handling
- remove compatibility drift where safe
- ensure all filters, badges, counts, and transitions agree

Likely files:
- `src/components/admin/**`
- `src/app/admin/**`
- `src/lib/actions/admin/**`
- `src/lib/admin/editor-workflow.ts`

### 4. Deepen reviewer-safe workspace behavior

Current state:
- reviewers can open safe article/question review surfaces
- the article route now renders read-only via the real wiki renderer
- question review remains constrained

Required next work:
- decide whether reviewer question review stays read-only or gains limited fix rights
- improve reviewer workspace UX so it is not just a constrained fallback
- add audit coverage for review actions if needed

Likely files:
- `src/components/admin/SMEReviewQueue.tsx`
- `src/app/admin/knowledge/[id]/page.tsx`
- `src/app/admin/knowledge/questions/[id]/page.tsx`
- `src/lib/actions/admin/wiki.ts`
- `src/lib/admin/roles.ts`

### 5. Tighten remaining student-facing delivery selectors

Current state:
- `wiki_review` and `prequestions` are filtered correctly
- other student-facing selectors may still rely on older topic-only assumptions

Required next work:
- inspect remaining question-serving paths and apply the same standard-question delivery rule where appropriate
- ensure article publication/readability is respected consistently for standard questions

Likely files:
- `src/lib/actions/quiz-v2/*`
- `src/lib/actions/assessment/*`
- other `src/lib/actions/*` question selection paths

### 6. Continue import consolidation

Current state:
- generic import now respects article ownership and uses canonical option shape
- article-specific import and generic import still remain separate surfaces

Required next work:
- collapse both import surfaces behind one normalization/validation/persistence contract
- ensure consistent UX and error reporting

Likely files:
- `src/components/admin/QuestionImporter.tsx`
- `src/components/admin/ArticleQuestionImporter.tsx`
- `src/lib/import/question-importer.ts`
- `src/lib/import/question-schema.ts`
- `src/lib/import/import-actions.ts`
- `src/lib/actions/admin/content.ts`

### 7. Push staged save orchestration further

Current state:
- article-first save/create is in place
- partial dependency handling is improved but not yet fully unified across article/question/EI entities

Required next work:
- continue moving toward one deterministic staged save contract
- improve partial-failure handling and retry semantics
- prepare the ground for future structured authoring without changing storage format

Likely files:
- `src/components/admin/unified-editor/SaveAllBar.tsx`
- `src/components/admin/unified-editor/DirtyStateProvider.tsx`
- `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
- `src/lib/actions/admin/content.ts`
- `src/lib/actions/admin/questions.ts`

### 8. Only after the above: begin structured block-authoring foundation

Prerequisite condition:
- do not start block palette / drag-and-drop / prop-form UX until the correctness and workflow layers above are stable enough

Foundation-only tasks when ready:
- canonical block registry
- serializer
- parser for supported legacy blocks
- unsupported/raw fallback handling
- real-renderer validation integration

Likely files:
- `src/components/wiki/article/WikiArticle.tsx`
- `src/components/wiki/mdx-components-shared.ts`
- `src/components/wiki/widgets/registry.ts`
- `src/lib/wiki-markdown.ts`
- new admin block modules

## Suggested execution order

1. Shared integrity engine expansion
2. Shared integrity engine expansion
3. Status normalization sweep
4. Reviewer-safe workspace deepening
5. Remaining student-delivery selector tightening
6. Import consolidation
7. Further staged save orchestration
8. Structured block-authoring foundation

## Acceptance criteria for the next pass

- exception/scenario questions stay on dedicated admin paths instead of the standard editor
- no remaining critical admin routes/actions rely on legacy status semantics
- reviewer workflow is safer and less fallback-driven
- more student-facing selection paths respect standard-question readability constraints
- import surfaces move closer to one canonical path
