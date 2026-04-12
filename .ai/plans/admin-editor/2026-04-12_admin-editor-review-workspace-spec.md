# Admin Editor Review Workspace Spec

## Status after this run

Review workflow is now partially implemented.

## What changed that affects review

1. Status normalization groundwork was added:
   - canonical workflow helper in `src/lib/admin/editor-workflow.ts`
   - review queue queries widened to include legacy and canonical review statuses
2. Pipeline/editor status code began moving toward canonical workflow values.
3. Real queue actions were added:
   - `approveWikiArticleReview(...)`
   - `requestWikiArticleChanges(...)`
4. `SMEReviewQueue` now opens real review dialogs and commits review actions.
5. Reviewer-safe route behavior was added for:
   - `src/app/admin/knowledge/[id]/page.tsx`
   - `src/app/admin/knowledge/questions/[id]/page.tsx`
   Reviewers can open the surfaces safely without receiving unrestricted edit controls.
6. The reviewer-safe article surface now renders the actual article through the real wiki renderer in read-only mode.
7. Review approval now checks article compile validity but does not enforce question-count coverage. The 10-question threshold remains a publish gate.
8. The standalone question review surface now resolves article context from `question.article_id` first and only falls back to topic context for exception-class questions.
9. The standard question editor now renders exception/scenario question types as a non-editable surface with a dedicated-workflow warning instead of silently treating them as standard editable questions.

## What is still required next

1. Decide reviewer write scope explicitly:
   - review-only with comments and state transitions, or
   - limited safe edits for non-structural changes
2. Expand reviewer-safe workspace beyond the current constrained read-only fallback view.
3. Add audit events for review actions.
4. Decide whether reviewer-safe question review should remain read-only or gain limited structured correction rights.
5. Decide whether reviewers need a dedicated saved-draft preview launcher, or whether the current read-only rendered article workspace remains the canonical review surface.

## Constraint

Do not route `sme_reviewer` into content-admin-only destructive surfaces. Review UI must be safe by construction.
