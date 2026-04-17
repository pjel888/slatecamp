# Admin Editor Deep Audit

Date: April 12, 2026

## Scope

This audit covers the `/admin` authoring system with emphasis on wiki article editing, question editing coupled to wiki articles, enforcement of article-question integrity, custom UI / MDX component authoring, and the preview, review, pipeline, import, taxonomy, and permission flows that affect authoring correctness.

This report uses:
- `VERIFIED` for source-backed facts
- `MISSING`
- `NOT ENFORCED`
- `PARTIALLY IMPLEMENTED`
- `DUPLICATED`
- `FRAGILE`
- `BROKEN BY DESIGN`
- `HIGH RISK`
- `NEEDS VERIFICATION`

## Files inspected

### Admin routes
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/error.tsx`
- `src/app/admin/_components/AdminShell.tsx`
- `src/app/admin/knowledge/page.tsx`
- `src/app/admin/knowledge/[id]/page.tsx`
- `src/app/admin/knowledge/new/page.tsx`
- `src/app/admin/knowledge/import/page.tsx`
- `src/app/admin/knowledge/questions/page.tsx`
- `src/app/admin/knowledge/questions/[id]/page.tsx`
- `src/app/admin/knowledge/questions/new/page.tsx`
- `src/app/admin/knowledge/_components/ArticleDetailClient.tsx`
- `src/app/admin/articles/page.tsx`
- `src/app/admin/articles/[id]/page.tsx`
- `src/app/admin/articles/new/page.tsx`
- `src/app/admin/content/page.tsx`
- `src/app/admin/content/[id]/page.tsx`
- `src/app/admin/content/new/page.tsx`
- `src/app/admin/questions/page.tsx`
- `src/app/admin/questions/[id]/page.tsx`
- `src/app/admin/questions/new/page.tsx`
- `src/app/admin/questions/import/page.tsx`
- `src/app/admin/reviews/page.tsx`
- `src/app/admin/pipeline/page.tsx`
- `src/app/admin/pipeline/_components/PipelineClient.tsx`
- `src/app/admin/pipeline/_components/PipelineCard.tsx`
- `src/app/admin/taxonomy/page.tsx`
- `src/app/admin/taxonomy/coverage/page.tsx`
- `src/app/admin/search/page.tsx`
- `src/app/admin/search/_components/ContentSearchClient.tsx`
- `src/app/admin/audit/page.tsx`
- `src/app/admin/activity/page.tsx`
- `src/app/admin/preview/[previewId]/page.tsx`

### Admin components
- `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
- `src/components/admin/unified-editor/ArticlePanel.tsx`
- `src/components/admin/unified-editor/QuestionsPanel.tsx`
- `src/components/admin/unified-editor/EIPromptsPanel.tsx`
- `src/components/admin/unified-editor/ContentEditorIndex.tsx`
- `src/components/admin/unified-editor/ContentBar.tsx`
- `src/components/admin/unified-editor/SaveAllBar.tsx`
- `src/components/admin/unified-editor/DirtyStateProvider.tsx`
- `src/components/admin/unified-editor/OutlinePanel.tsx`
- `src/components/admin/unified-editor/PanelErrorBoundary.tsx`
- `src/components/admin/unified-editor/types.ts`
- `src/components/admin/QuestionEditor.tsx`
- `src/components/admin/QuestionImporter.tsx`
- `src/components/admin/ArticleQuestionImporter.tsx`
- `src/components/admin/DeleteArticleModal.tsx`
- `src/components/admin/QuestionsTableClient.tsx`
- `src/components/admin/SMEReviewQueue.tsx`
- `src/components/admin/AuditLogViewer.tsx`
- `src/components/admin/NeedsAttentionCard.tsx`
- `src/components/admin/TaxonomyEditor.tsx`

### Actions and utilities
- `src/lib/actions/admin/content.ts`
- `src/lib/actions/admin/questions.ts`
- `src/lib/actions/admin/question-queries.ts`
- `src/lib/actions/admin/wiki.ts`
- `src/lib/actions/admin/wiki-queries.ts`
- `src/lib/actions/admin/pipeline.ts`
- `src/lib/actions/admin/coverage.ts`
- `src/lib/actions/admin/dashboard.ts`
- `src/lib/actions/admin/bulk.ts`
- `src/lib/actions/admin/taxonomy.ts`
- `src/lib/actions/preview-actions.ts`
- `src/lib/actions/wiki-actions.ts`
- `src/lib/actions/wiki-quiz.ts`
- `src/lib/actions/wiki/get-prequestions.ts`
- `src/lib/actions/ei-prompts.ts`
- `src/lib/actions/taxonomy.ts`
- `src/lib/actions/quiz-v2/get-session-questions.ts`
- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/entitlements/policy.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/server.ts`
- `src/lib/import/question-importer.ts`
- `src/lib/import/question-schema.ts`
- `src/lib/import/import-actions.ts`
- `src/lib/audit/audit-actions.ts`
- `src/lib/routes.ts`
- `src/lib/wiki-markdown.ts`
- `src/lib/utils/question.ts`

### Wiki renderer / student delivery
- `src/components/wiki/article/WikiArticle.tsx`
- `src/components/wiki/mdx-components-shared.ts`
- `src/components/wiki/widgets/registry.ts`
- `src/components/wiki/shared/parse-mdx-prop.ts`
- `src/components/wiki/quiz/WikiQuizButton.tsx`
- `src/app/dashboard/wiki/[slug]/page.tsx`

### Schema / migrations / tests
- `DATABASE_SCHEMA.sql`
- `src/types/supabase.ts`
- `supabase/migrations/004_add_user_roles.sql`
- `supabase/migrations/007_add_audit_logs.sql`
- `supabase/migrations/20260324_unify_rls_admin_patterns.sql`
- `supabase/migrations/20260329_create_admin_draft_previews.sql`
- `supabase/migrations/20260331_add_article_id_to_questions.sql`
- `supabase/migrations/20260407_query_optimization.sql`
- `src/lib/actions/admin/content.test.ts`
- `src/lib/actions/admin/questions.test.ts`
- `src/lib/actions/admin/wiki.test.ts`
- `src/lib/actions/admin/pipeline.test.ts`
- `src/lib/admin/roles.test.ts`
- `src/lib/admin/access-policy.test.ts`

## Current architecture summary

### Route map

#### Primary live routes

| Route | Actual behavior | Finding |
|---|---|---|
| `/admin/knowledge` | `ContentEditorIndex` knowledge browser | Current article browser |
| `/admin/knowledge/[id]` | unified article editor | Current primary article editor |
| `/admin/knowledge/new` | unified editor with blank article shell | `BROKEN` create path |
| `/admin/knowledge/questions` | `ContentEditorIndex` question mode | Current question bank shell |
| `/admin/knowledge/questions/[id]` | standalone question editor + article reference | Separate stack from article editor |
| `/admin/knowledge/questions/new` | standalone question creation | Separate create path |
| `/admin/knowledge/import` | generic question importer | Import path 1 |
| `/admin/preview/[previewId]` | draft preview iframe/new-tab route | Real preview path |

#### Workflow routes

| Route | Actual behavior | Finding |
|---|---|---|
| `/admin/reviews` | loads `SMEReviewQueue` | `PARTIALLY IMPLEMENTED` |
| `/admin/pipeline` | loads status board | Status drift |
| `/admin/taxonomy` | taxonomy editor | Separate structure flow |
| `/admin/taxonomy/coverage` | coverage map | Broken deep links |
| `/admin/search` | client-side multi-entity search | Direct browser queries |
| `/admin/audit` | super-admin-only audit log | Audit coverage incomplete |
| `/admin/activity` | audit feed summary | Read-only |

#### Duplicated legacy routes

| Route | Actual behavior | Risk |
|---|---|---|
| `/admin/articles*` | redirects into `/admin/knowledge*` | still a live surface |
| `/admin/content*` | redirects into `/admin/knowledge*` | drops query intent |
| `/admin/questions*` | redirects into `/admin/knowledge/questions*` | still referenced by actions/links |

### Component map

#### Unified article editor path

1. Server page: `/admin/knowledge/[id]`
2. Client wrapper: `ArticleDetailClient`
3. Editor root: `UnifiedContentEditor`
4. Dirty tracking: `DirtyStateProvider`
5. Save orchestration: `SaveAllBar`
6. Article body editor: `ArticlePanel`
7. Question pane: `QuestionsPanel`
8. EI prompts pane: `EIPromptsPanel`
9. Outline pane: `OutlinePanel`
10. Panel isolation: `PanelErrorBoundary`

#### Standalone question editor path

1. Server page: `/admin/knowledge/questions/[id]`
2. Client editor: `QuestionEditor`
3. Local article preview inside the page using its own MDX component map

### Data flow map

#### Open article

1. `getArticleFull(id)` loads article data.
2. `getArticleTaxonomyNodes(articleId)` loads article-node mappings.
3. `getAllEIPromptsForArticle(articleId)` loads EI prompts.
4. `getQuestionsByNodeIds(nodeIds)` loads questions by topic, not by direct article ownership.

#### Edit article

1. `ArticlePanel` edits raw Markdown/MDX in CodeMirror.
2. Metadata lives in local state in `UnifiedContentEditor`.
3. Dirty flags are tracked in `DirtyStateProvider`.

#### Edit questions

1. Existing questions are local state copies.
2. Question updates mark question-specific dirty flags.
3. New questions are temporary local drafts until save.

#### Autosave

1. `UnifiedContentEditor` dispatches `unified-editor:save` every 10s if dirty.
2. `SaveAllBar` listens and executes save orchestration.
3. `MISSING`: no local recovery store.

#### Preview

1. `ArticlePanel` writes `admin_draft_previews`.
2. Preview route reads draft content + saved article metadata and renders the real wiki layout.

#### Publish/status change

1. Active editor and pipeline path use `draft`, `review`, `published`.
2. Legacy wiki action schema also supports `pending_review`, `changes_requested`, `approved`, `archived`.

#### Import

Two incompatible paths exist:
- generic `QuestionImporter`
- article-specific `ArticleQuestionImporter`

### Permission map

| Capability | Actual gate | Verified behavior |
|---|---|---|
| Access admin shell | `canReviewContent()` | `super_admin`, `content_admin`, `sme_reviewer` |
| Open article editor | `canManageContent()` | `super_admin`, `content_admin` only |
| Open question editor | `canManageContent()` | `super_admin`, `content_admin` only |
| Review queue | layout-level access only | reviewer can load queue |
| Preview draft | exact role check in preview page | reviewer blocked |
| View audit log | `isSuperAdmin()` | super-admin only |
| Manage roles | `canManageUsers()` | super-admin only |

`HIGH RISK`: reviewer can see the review queue but cannot use the editor routes the queue links to.

### Storage map

| Concern | Storage |
|---|---|
| raw article content | `wiki_articles.content` |
| article metadata | `wiki_articles` |
| article taxonomy relation | `wiki_article_taxonomy` |
| questions | `questions` |
| direct article-question relation | `questions.article_id` |
| EI prompts | `wiki_ei_prompts` |
| draft previews | `admin_draft_previews` |
| audit logs | `audit_logs` |
| roles | `user_roles` plus profile/auth metadata resolution |
| widget registry | code registry only |

## Critical findings

### 1. New article creation is broken

`CRITICAL`

Evidence:
- `src/app/admin/knowledge/new/page.tsx` creates a blank article shell with `article_id: ''`.
- `src/components/admin/unified-editor/SaveAllBar.tsx` only calls `updateArticleFull(...)`.
- `createWikiArticle(...)` exists in `src/lib/actions/admin/wiki.ts` but is unused in the active create route.

Result:
- The primary “Create Article” flow cannot create a persisted article record.

### 2. Taxonomy changes from the article editor are not saved

`CRITICAL`

Evidence:
- `UnifiedContentEditor` builds `articleState` with `node_id`.
- `SaveAllBar` omits `node_id` when calling `updateArticleFull(...)`.
- `updateArticleFull(...)` has logic to rewrite `wiki_article_taxonomy`, but the caller never supplies the field.

Result:
- Editors can change taxonomy in the UI and believe it saved when it did not.

### 3. The no-readable-topic/no-question rule is not enforced

`CRITICAL`

Verified gaps:
- no DB check on `questions` requiring readable article linkage
- no admin action validation blocking question creation/import for unreadable topics
- no publish gate enforcing article/question integrity
- inspected student question flows fetch by `topic_id` without checking article publication state

### 4. Status model drift breaks workflow correctness

`CRITICAL`

Evidence:
- `ContentBar`, `PipelineCard`, `PipelineClient`, `SMEReviewQueue`, dashboard counts all use `review`.
- `src/lib/actions/admin/wiki.ts` uses `pending_review`, `changes_requested`, `approved`, `published`, `archived`.
- `PipelineClient` buckets unrecognized statuses into draft.

Result:
- review queue visibility, pipeline grouping, and publish semantics are inconsistent.

### 5. Review queue actions are incomplete

`CRITICAL`

Evidence:
- `SMEReviewQueue` tracks `dialog` state for approve/request changes.
- No dialog or mutation UI is rendered from that state.

Result:
- Approve/request-changes buttons are dead-end UI.

### 6. Draft preview authorization likely mismatches the active role model

`CRITICAL`

Evidence:
- `20260329_create_admin_draft_previews.sql` policy checks `user_roles.role = 'admin'`.
- Current role model centers on `super_admin`, `content_admin`, `sme_reviewer`.
- `preview-actions.ts` uses a normal authenticated server client, so RLS applies.

Result:
- Preview generation can fail for valid content admins depending on live DB role rows.

## Editor UX findings

### Article editor

#### What is robust

- Clear multi-pane mental model.
- Dirty state is explicit.
- Preview route uses the real wiki renderer.
- Panel-level error boundaries prevent total editor collapse.

#### What is merely functional

- CodeMirror Markdown authoring.
- snippet dropdown insertion
- outline heading sync
- line diff
- conflict banner

#### What is unacceptable

1. `BROKEN BY DESIGN`: custom components are edited as raw MDX strings.
2. `MISSING`: no block palette, no slash menu, no drag-and-drop, no prop inspector.
3. `NOT ENFORCED`: no compile gate before save/publish.
4. `MISSING`: no autosave recovery or rollback.
5. `FRAGILE`: discard is full-page reload.

### Question editor

#### Unified question pane

- Good at batch-in-context editing for existing topic-linked questions.
- Weak on integrity:
  - existing question `topic_id` is read-only
  - `article_id` is not editable
  - question previews are explicitly unavailable in current pass

#### Standalone question editor

`DUPLICATED`
- separate form stack
- separate validation
- separate preview logic
- raw UUID taxonomy input

`HIGH RISK`
- `getQuestion(...)` parses `correct_option_id` with `parseInt(...)`, which is wrong for A/B/C/D values produced by `createQuestion(...)`.

### Custom components / MDX blocks

Current state:
- components and widgets are renderable
- authoring experience is raw-string based
- discoverability is weak
- validation is missing
- malformed props are easy to create

Assessment:
- sustainable for developers
- not sustainable for SMEs
- not suitable for a mission-critical internal CMS at current complexity

## Data integrity and rule enforcement findings

### Article-question coupling

#### Schema

- `questions.article_id` exists and is optional.
- main editor path ignores it and loads by taxonomy.
- `getQuestionsByArticleId(...)` exists but is unused in the inspected editor flow.

#### Save/import/publish

- question create/update does not require article link
- import does not require readable article
- publish does not validate coupled-question readiness

#### Student delivery

- `getWikiQuizQuestions(...)` queries `questions` by `topic_id`
- `getPrequestions(...)` selects by `topic_id`
- `getSessionQuestions(...)` trusts stored `question_ids`

No inspected path enforced readable article availability before serving standard questions.

### Additional integrity gaps

1. `HIGH RISK`: imported question option shape differs from editor-created shape.
2. `HIGH RISK`: direct article-linked question path exists but is ignored in the main editor.
3. `FRAGILE`: bulk delete revalidates legacy routes only.
4. `BROKEN`: coverage map links to `/admin/content?node=...`, but `/admin/content` redirects and drops the filter.
5. `BROKEN`: `NeedsAttentionCard` links to `/admin/knowledge/questions?filter=missing_rationale`, but no code reads that filter param.

## Recommended target architecture

Primary decision:
- Keep MDX as canonical storage.
- Build a registry-driven structured editor layer that serializes to valid MDX.

Why this is the correct decision now:
- It fixes SME usability without rewriting the student renderer.
- It keeps preview parity anchored to the existing wiki render path.
- It avoids a risky format migration while still replacing the current syntax-first editing model.
- It allows immediate enforcement of content integrity through a shared validation layer.

Do not choose raw-MDX-plus-better-snippets as the long-term answer. That path leaves the same core failure intact: the editor still asks SMEs to author implementation syntax directly.

## Proposed spec expansion

The revised spec adds:
- explicit personas
- canonical workflow states
- enforceable article-question coupling rules
- scenario-based exception rules
- structured custom component authoring model
- drag-and-drop block editing model
- prop validation model
- MDX compile rules
- draft/preview/publish state machine
- staged save and partial-failure strategy
- autosave, versioning, concurrency, offline, audit, import, accessibility, telemetry, migration, and acceptance sections

See:
- [.ai/plans/2026-04-12_admin-editor-spec-v2.md](/C:/Users/Philip%20Lewis/Desktop/slatecamp/.ai/plans/2026-04-12_admin-editor-spec-v2.md)

## Implementation roadmap

### P0

1. Fix new article creation in the unified editor.
2. Persist taxonomy mapping from the active editor.
3. Add article-question integrity validation across save/import/review/publish.
4. Normalize status vocabulary and migrate old values.
5. Fix preview authorization/RLS to match active roles.
6. Implement actual review actions and a reviewer-safe review workspace.

### P1

1. Unify question normalization and import shape.
2. Replace partial parallel save with staged orchestration.
3. Add save-time/publish-time MDX compile validation.
4. Revalidate live knowledge routes after bulk operations.

### P2

1. Add registry-backed block palette, slash menu, and prop forms.
2. Add local draft recovery and reconnect sync.
3. Expand audit logging to taxonomy junction and review actions.
4. Remove duplicated legacy route/action assumptions.

### P3

1. Drag-and-drop block ordering.
2. Version history and restore UI.
3. Expert raw-MDX mode with sandboxed validation.

## Artifacts written

- [.ai/plans/2026-04-12_admin-editor-deep-audit.md](/C:/Users/Philip%20Lewis/Desktop/slatecamp/.ai/plans/2026-04-12_admin-editor-deep-audit.md)
- [.ai/plans/2026-04-12_admin-editor-spec-v2.md](/C:/Users/Philip%20Lewis/Desktop/slatecamp/.ai/plans/2026-04-12_admin-editor-spec-v2.md)
- [.ai/plans/2026-04-12_admin-editor-executive-summary.md](/C:/Users/Philip%20Lewis/Desktop/slatecamp/.ai/plans/2026-04-12_admin-editor-executive-summary.md)
