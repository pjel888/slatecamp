# Admin Editor Executive Summary

## Verdict

The `/admin` authoring system is not operating as a single reliable CMS. It is a collection of overlapping route families, duplicated actions, inconsistent status vocabularies, and partially coupled data paths. The current editor is usable for incremental article edits by a content admin, but it is not safe enough for a business-critical internal system and it does not enforce the article-question integrity rule the business requires.

## P0 findings

1. New article creation is effectively broken in the current unified editor.
   Evidence:
   - [`src/app/admin/knowledge/new/page.tsx`](/C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/admin/knowledge/new/page.tsx) boots `UnifiedContentEditor` with `article_id: ''`.
   - [`src/components/admin/unified-editor/SaveAllBar.tsx`](/C:/Users/Philip%20Lewis/Desktop/slatecamp/src/components/admin/unified-editor/SaveAllBar.tsx) only calls `updateArticleFull(...)`; it never calls `createWikiArticle(...)`.
   - `createWikiArticle(...)` exists in [`src/lib/actions/admin/wiki.ts`](/C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/actions/admin/wiki.ts) but is not used by the new article route.

2. Taxonomy changes made in the unified article editor are not saved.
   Evidence:
   - `UnifiedContentEditor` builds `articleState` with `node_id`.
   - `SaveAllBar` drops `node_id` when calling `updateArticleFull(...)`.
   - `updateArticleFull(...)` in [`src/lib/actions/admin/content.ts`](/C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/actions/admin/content.ts) can update taxonomy mappings, but the caller does not pass the field.

3. The core business rule “if a topic is not readable, there should be no questions about it” is not enforced.
   Verified gaps:
   - No database constraint tying `questions.topic_id` to a readable/published article.
   - No admin save validation blocking question creation for unreadable/unpublished/unmapped topics.
   - No publish gate that checks question readiness vs article readiness.
   - Student question delivery flows query `questions` by `topic_id` without checking article publication state.

4. Review and pipeline status handling is internally inconsistent.
   Evidence:
   - Unified editor, review queue, dashboard, and pipeline use `review`.
   - Legacy admin wiki action schema uses `pending_review`, `changes_requested`, `approved`, `published`, `archived`.
   - Pipeline UI buckets unknown statuses into `draft`.
   - Review queue queries `.eq('status', 'review')`, so `pending_review` items are invisible there.

5. Draft preview authorization is fragile and likely broken for the current role model.
   Evidence:
   - `admin_draft_previews` RLS migration grants access only when `user_roles.role = 'admin'`.
   - The active role system centers on `super_admin`, `content_admin`, and `sme_reviewer`.
   - Preview generation uses `createServerClient(...)`, not the service-role client, so RLS matters.

## P1 findings

1. The unified editor is MDX-string-first, not editor-first.
   - Custom blocks are inserted as raw snippets.
   - Props are edited as raw attributes or JSON-like strings.
   - There is no schema-backed block inspector, no drag-and-drop block model, and no prop-form editing.

2. Preview fidelity is partial.
   - The article preview uses a separate draft-preview table and iframe route.
   - The standalone question editor renders article context with a different MDX component map than the main wiki renderer.
   - The preview system has no MDX validation gate before save/publish, only best-effort preview compilation.

3. Bulk import paths are duplicated and inconsistent.
   - `QuestionImporter` uses `src/lib/import/*` with a schema that stores options differently.
   - `ArticleQuestionImporter` uses `importQuestionsForArticle(...)` with a different payload contract and richer fields.
   - These flows do not share a single validation model or coupling rule.

4. The review workflow is incomplete.
   - `SMEReviewQueue` loads pending items but its approve/request-changes dialog state is never rendered into an actionable workflow.
   - Reviewers can open the queue but article/question editor pages require `canManageContent()`, so `sme_reviewer` cannot use the main editor surfaces linked from the queue.

## Target direction

Do not replace MDX with a new document format right now. Keep MDX as the canonical storage format, but add a structured authoring layer on top of it.

Recommended direction:
- Stay on MDX.
- Build a block-aware editor shell that serializes to valid MDX.
- Introduce a slash menu, block palette, drag-and-drop ordering, and schema-backed prop forms.
- Keep the existing student render pipeline as the single rendering truth.
- Add a real content integrity engine that blocks invalid article/question states at save, review, import, and publish.

## Required outputs

- Detailed audit: [.ai/plans/2026-04-12_admin-editor-deep-audit.md](/C:/Users/Philip%20Lewis/Desktop/slatecamp/.ai/plans/2026-04-12_admin-editor-deep-audit.md)
- Revised spec: [.ai/plans/2026-04-12_admin-editor-spec-v2.md](/C:/Users/Philip%20Lewis/Desktop/slatecamp/.ai/plans/2026-04-12_admin-editor-spec-v2.md)
