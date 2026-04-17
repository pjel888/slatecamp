# Admin Editor Rollout Checklist

## Phase 0 rollout checks

- [ ] Apply `20260412_fix_admin_draft_preview_policy.sql`
- [ ] Apply `20260412_backfill_question_article_ownership.sql`
- [ ] Confirm `/admin/knowledge/new` can create and save a new article
- [ ] Confirm taxonomy changes persist after save/reload
- [ ] Confirm content admin preview generation works
- [ ] Run:
  - `bun test src/lib/actions/admin/content.test.ts src/lib/actions/preview-actions.test.ts src/lib/actions/admin/questions.test.ts src/lib/import/import-actions.test.ts`
  - `bun run type-check`

## Phase 1 rollout checks

- [ ] Apply `20260412_normalize_admin_editor_statuses.sql`
- [ ] Confirm review queue shows canonical `in_review` items
- [ ] Confirm pipeline no longer misbuckets canonical statuses
- [ ] Confirm standard question create/update/import requires article ownership
- [ ] Confirm standard question create/update/import requires an `approved` or `published` linked article
- [ ] Confirm exception-class question types do not inherit the standard ownership gate
- [ ] Confirm unresolved orphan questions are identified before stronger gating expands
- [ ] Confirm article editor loads only directly owned questions for the article
- [ ] Confirm question-bank grouping prefers `questions.article_id` and does not silently remap orphan standard questions through taxonomy
- [ ] Confirm queue-based approve/request-changes actions complete successfully
- [ ] Confirm reviewer-safe article/question routes do not expose unrestricted editing
- [ ] Confirm reviewer-safe article route renders the saved article through the admin workspace
- [ ] Confirm admin preview viewing works for reviewer-capable users
- [ ] Confirm review approval is blocked on invalid MDX but not on missing question coverage
- [ ] Confirm publish is blocked on invalid MDX
- [ ] Confirm publish is blocked until the article has been approved
- [ ] Confirm publish is blocked when the valid directly linked standard question count is below 10
- [ ] Confirm wiki review drills and prequestions exclude standard questions without published linked articles or valid article/topic mappings

## Kill switches / fallbacks

- [ ] If preview policy causes access issues, keep admin-client preview path active while DB policy is corrected
- [ ] If status normalization causes workflow deadlock, temporarily keep compatibility reads while reverting write normalization
- [ ] If article-ownership enforcement blocks too many imports, pause import commit and use dry-run remediation mode first
