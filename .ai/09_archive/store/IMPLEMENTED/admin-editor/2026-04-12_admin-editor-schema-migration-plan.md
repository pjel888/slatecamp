# Admin Editor Schema Migration Plan

## Migrations added in this run

### 1. `supabase/migrations/20260412_fix_admin_draft_preview_policy.sql`

Purpose:
- replace stale `admin`-only preview policy assumptions with `has_admin_role()`

Expected effect:
- `content_admin` and `super_admin` can use `admin_draft_previews` under the current role model

### 2. `supabase/migrations/20260412_normalize_admin_editor_statuses.sql`

Purpose:
- normalize legacy article/EI prompt review statuses toward canonical `in_review`
- update `wiki_articles` status check to canonical values

Expected effect:
- queue/pipeline/editor can converge on one workflow vocabulary once the migration is applied

### 3. `supabase/migrations/20260412_backfill_question_article_ownership.sql`

Purpose:
- backfill `questions.article_id` from `wiki_article_taxonomy`

Expected effect:
- existing standard questions gain direct article ownership where resolvable

## Migration order

1. Apply preview policy fix.
2. Apply question article-ownership backfill.
3. Apply status normalization migration.
4. Deploy app code that writes canonical statuses and requires article ownership.

## Compatibility notes

- The code added in this run already normalizes status values on write.
- Until the status migration is applied, DB constraints in environments still using older checks may reject canonical `in_review`.
- Question ownership backfill is additive and safe before stronger enforcement.

## Rollback notes

- Preview policy can be reverted independently.
- Question ownership backfill is data-additive; rollback means stopping enforcement, not deleting populated `article_id`.
- Status normalization should be rolled back by restoring old status aliases only if downstream surfaces are not yet updated.
