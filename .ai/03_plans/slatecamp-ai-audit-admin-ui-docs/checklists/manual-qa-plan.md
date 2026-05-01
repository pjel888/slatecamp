# Manual QA Plan

## Admin access

1. Log in as admin.
2. Open `/admin/ai-audit`.
3. Confirm page loads.
4. Confirm nav item appears.

## Non-admin access

1. Log in as non-admin or anonymous user.
2. Try `/admin/ai-audit`.
3. Confirm access is blocked/redirected.

## Article table

1. Open Articles tab/page.
2. Confirm articles load.
3. Confirm not-yet-audited rows show `Not checked`.
4. Test search.
5. Test status filter.
6. Test pagination.

## Manual finding

1. Open article detail.
2. Create manual finding.
3. Confirm finding appears.
4. Confirm article status updates.
5. Confirm dashboard counts update.

## Finding status update

1. Open finding.
2. Confirm it.
3. Verify `ai_review_decisions` row exists.
4. Resolve it.
5. Confirm target status cache recomputes.

## Question table

1. Open Questions tab/page.
2. Confirm pagination works.
3. Create manual finding for one question.
4. Confirm status updates.

## Safety checks

1. Confirm no calls to AI provider endpoints.
2. Confirm no edits to `wiki_articles` content.
3. Confirm no edits to `questions` content.
4. Confirm service role key not present in browser bundle.
