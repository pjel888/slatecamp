# Admin Editor Spec V2

## 1. Editor Product Intent

The `/admin` editor is a mission-critical internal CMS for SlateCamp’s instructional corpus. It must let content admins and reviewers produce readable, render-safe wiki articles and tightly coupled assessment items without relying on raw MDX expertise, route-specific tribal knowledge, or manual integrity policing.

The editor is not a convenience tool. It is the control plane for publishable learning material, assessment coverage, and student-facing instructional trust.

## 2. Authoring Personas and Competency Levels

1. Content Admin
   Owns article creation, article revision, question creation, question maintenance, taxonomy mapping, imports, and publish preparation.
2. SME Reviewer
   Owns review comments, approval, rejection, and integrity adjudication. Must be able to inspect and fix minor editorial issues without needing developer assistance.
3. Super Admin
   Owns role management, audit visibility, emergency unpublish, override actions, and policy-level remediation.
4. Non-technical SME
   Can edit copy, add structured blocks, review previews, and adjust approved block props through forms.
5. Technical editor
   Can inspect generated MDX, use advanced shortcuts, resolve edge-case rendering issues, and debug block-level output.

## 3. Editorial Workflow States

Canonical article and EI prompt statuses:
- `draft`
- `in_review`
- `changes_requested`
- `approved`
- `published`
- `archived`

Canonical question statuses:
- `draft`
- `in_review`
- `changes_requested`
- `approved`
- `published`
- `archived`

Legacy aliases such as `review` and `pending_review` must be migrated to canonical values and rejected at the action boundary after migration.

## 4. Article-Question Coupling Rules

1. Every standard question must resolve to exactly one primary readable article through a direct `article_id`.
2. Every standard question must also retain `topic_id` for taxonomy analytics and question selection.
3. `topic_id` and `article_id` must be consistent.
4. A readable topic means the article exists, is not archived, passes compile validation, and is review-approved or published depending on workflow step.
5. There must be no published standard question whose parent article is not published.
6. There must be no approved standard question whose parent article is not at least approved.
7. Standard question creation must be blocked if no article is directly linked.
8. Standard question import must be blocked if no article is directly linked.
9. Publish must be blocked if an article’s standard question set is below the minimum threshold.

## 5. Scenario-Based Exception Rules

1. Scenario-based endurance/design questions may exist outside direct article readability gating.
2. These items must live in their own model family and workflow.
3. They must not silently fall back into the standard `questions` table without an explicit exception type.
4. Their admin UI must clearly identify them as scenario-driven exceptions.
5. They must not count toward the “10 questions per article” rule unless explicitly mapped as supplemental article-linked questions.

## 6. Editor Interaction Model

1. Single article workspace with coordinated panes: article body, question set, EI prompts, outline, inspector, render preview.
2. One canonical save orchestration layer for all article-related entities.
3. One canonical validation engine shown inline and in save summaries.
4. One canonical preview renderer shared with the student-facing wiki component map.

## 7. Custom Component Authoring Model

1. MDX remains the canonical stored format.
2. Editors do not author component props as freeform strings by default.
3. Every supported block/component must have a registry entry, schema, display name, description, prop definitions, validation rules, default values, serializer, and real preview renderer.
4. Unsupported or malformed components render as explicit validation errors, not silent fallbacks.

## 8. Drag-and-Drop Block Editing Model

1. Article body is represented in the editor as a block tree.
2. Supported operations: insert, reorder, delete, duplicate, convert variant.
3. Markdown text sections remain editable in-place as prose blocks.
4. Structured blocks generate MDX under the hood.
5. Drag-and-drop updates block order before serialization.
6. Keyboard-accessible reordering is required.

## 9. Component Prop Editing and Validation Model

1. Each block opens an inspector panel or inline form.
2. Each prop is typed and validated before serialization.
3. Array/object props are edited through forms, not raw JSON strings.
4. Validation errors show block, field, reason, and whether publish is blocked.
5. Unknown props are stripped before serialization unless explicitly allowed.

## 10. MDX Integrity and Compilation Rules

1. Every save runs parse + compile validation against the real wiki renderer component map.
2. Every publish runs parse + compile validation and blocks on failure.
3. Sanitization is not a substitute for validation.
4. A block is valid only if its tag exists in the registry, its props pass schema validation, and the MDX compiles with the real renderer.
5. The system must preserve valid hand-authored Markdown sections.
6. The system must reject malformed custom component syntax before persistence if the save path is structured mode.
7. Advanced raw-MDX edits may be allowed in expert mode, but must still pass compile validation before save.

## 11. Draft / Preview / Publish State Machine

States:
- `draft`
- `draft_valid`
- `draft_invalid`
- `in_review`
- `review_blocked`
- `approved`
- `publish_blocked`
- `published`
- `archived`

Transitions:
1. `draft` -> `draft_valid` when all blocking validation passes.
2. `draft` -> `draft_invalid` when any blocking validation fails.
3. `draft_valid` -> `in_review` only when article/question coupling checks pass.
4. `in_review` -> `approved` only when reviewer explicitly approves.
5. `approved` -> `published` only when all article/question coverage, compile, and taxonomy rules pass.
6. Any state -> `review_blocked` or `publish_blocked` when new blocking issues appear.

## 12. Save Orchestration and Partial Failure Strategy

1. Save orchestration must understand article, taxonomy mapping, questions, EI prompts, and derived preview state.
2. Save order: validate all, persist article draft shell first for new records, persist taxonomy mapping, persist questions, persist EI prompts, refresh preview state.
3. If article creation fails, question/EI persistence must not proceed.
4. If article save succeeds but question persistence fails, preserve successful article save, preserve failed question dirty state, and show explicit partial-failure summary.
5. Save summaries must list item-level success/failure.
6. Taxonomy saves must be part of the same orchestration contract, not silently dropped.

## 13. Autosave Rules

1. Autosave default interval: 10 seconds after last change, debounced.
2. Autosave must not run while offline.
3. Autosave must not publish.
4. Autosave must persist a local recovery snapshot before network save.
5. Autosave failures must surface visibly without clearing dirty state.
6. Repeated autosave failure must degrade into manual-save warning mode.

## 14. Versioning / Recovery / Rollback Strategy

1. Every successful article save stores a version record.
2. Every publish stores a release version.
3. Recovery supports restore last autosave, restore last saved version, and compare with published version.
4. Rollback may restore article content only or article + question set together.
5. Recovery history must show actor and timestamp.

## 15. Concurrency Strategy

1. Article save uses optimistic concurrency on `updated_at` or revision ID.
2. Taxonomy, question, and EI saves must also carry revision context.
3. Conflict resolution must offer reload remote, keep mine, or compare diff.
4. “Save anyway” is an explicit override, not the default path.
5. Conflict checks must apply to new and existing articles, not article-only edits.

## 16. Error and Empty State Catalog

Required error states:
- article compile failed
- block prop validation failed
- article saved but questions failed
- questions saved but article failed
- preview generation failed
- taxonomy mapping missing
- question below minimum fields
- question/article mismatch
- publish blocked by unreadable topic rule
- role cannot access requested action
- concurrent edit detected
- offline

Required empty states:
- no article yet
- no questions yet
- no EI prompts yet
- no taxonomy selected
- no preview yet
- no review items

## 17. Offline / Reconnect Handling

1. Local draft snapshot storage required.
2. Offline mode must disable preview refresh and remote publish.
3. Reconnect must offer review local unsynced changes, save now, or discard local snapshot.

## 18. Security and Permission Model for Authoring

1. `content_admin` and `super_admin` can create/edit/delete/publish.
2. `sme_reviewer` can open review workspaces, annotate, request changes, approve, and fix non-structural issues if policy allows.
3. `sme_reviewer` must not be routed to dead-end pages they cannot use.
4. Draft preview permissions must use the same canonical role policy as the rest of admin.
5. All writes must pass a single role-resolution model.

## 19. Audit Log Requirements

Audit must capture article create/update/delete/status change, question create/update/delete/status change, taxonomy mapping changes, import operations, EI prompt changes, publish/unpublish, rollback/restore, and override conflict save.

The current trigger coverage is insufficient because it excludes taxonomy junction mutations.

## 20. Import / Bulk Edit Safeguards

1. One canonical import schema per content type.
2. Question import must normalize to the same option shape as the editor.
3. Import must validate article link, topic link, option count, correct option, rationale, and duplicate detection.
4. Bulk delete must revalidate the live knowledge routes, not only legacy routes.

## 21. Accessibility Requirements

1. Keyboard-only full authoring path.
2. Focus-visible states for all controls.
3. Drag-and-drop alternative controls.
4. Screen-reader labels for block insertion, reorder, validation, and save results.

## 22. Keyboard Shortcut Requirements

Required:
- `Cmd/Ctrl+S` save
- `Cmd/Ctrl+K` search/focus filter
- `Esc` collapse active panel/card
- `Alt+Shift+Arrow` reorder block
- `/` open slash menu inside block editor

## 23. Performance Budgets

1. Initial editor load under 2.5s on warm admin path for a standard article.
2. Typing latency under 50ms for prose editing.
3. Preview refresh under 1.5s for medium article drafts.
4. Save feedback visible within 300ms.
5. Route refresh avoided unless required; prefer local optimistic reconciliation.

## 24. Test Plan

1. Unit tests: article validation, block prop validation, status transitions, coupling rule enforcement, import normalization.
2. Integration tests: new article creation, article save with taxonomy, article + question partial failure behavior, publish blocked on invalid states, review workflow with reviewer role.
3. End-to-end tests: create article, add 10 questions, preview, submit for review, approve, publish; insert block visually and confirm valid MDX output; recover from offline edit.

## 25. Telemetry / Observability Requirements

Track editor load time, save latency, autosave failure rate, preview generation failure rate, compile failure rate by component type, publish-block reason counts, conflict occurrence rate, and import failure rate.

## 26. Migration Plan from Current Editor to Improved Editor

1. Normalize statuses.
2. Fix article creation path.
3. Fix taxonomy save path.
4. Normalize question option shape.
5. Introduce direct `article_id` enforcement for standard questions.
6. Add block registry schemas.
7. Ship block palette + prop forms behind admin feature flag.
8. Migrate existing snippet-authored blocks incrementally.

## 27. Technical Debt Cleanup Plan

1. Retire duplicated legacy admin action surfaces.
2. Remove dead route assumptions that claim redirects without verifying runtime behavior.
3. Consolidate question import paths.
4. Consolidate article and question validation.
5. Remove status vocabulary drift.
6. Remove legacy admin RLS assumptions that still reference `admin`.

## 28. Acceptance Criteria

1. A new article can be created from `/admin/knowledge/new`, saved, previewed, and published.
2. Taxonomy mapping changes persist from the article editor.
3. Standard question creation is blocked unless a readable article is linked.
4. Publish is blocked if article-question integrity rules fail.
5. Reviewers can complete review work without landing on inaccessible editor routes.
6. Custom blocks can be inserted visually and serialized to valid MDX.
7. Preview uses the same component registry as student rendering.
8. Bulk imports produce editor-compatible question records.

## 29. Out-of-Scope Items

1. Replacing MDX with a fully new storage format in this phase.
2. Building scenario-based design question authoring into the standard article editor.
3. Rewriting student wiki rendering.

## 30. Open Questions

1. Should `sme_reviewer` have limited direct edit authority or review-only authority?
2. Is the minimum “10 questions per article” a hard publish gate for every standard article or configurable by article type?
3. Should approved-but-unpublished articles expose questions in any internal practice environment?
4. Should the system support article-level question sets distinct from topic-level fallback pools?
