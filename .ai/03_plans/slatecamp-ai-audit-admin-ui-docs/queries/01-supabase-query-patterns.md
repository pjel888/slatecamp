# Supabase Query Patterns

This document gives implementation patterns for data loading. Codex must adapt exact column names to the existing generated database types.

## General rule

Use server-side data loading where possible. Keep admin data protected. Reuse the existing SlateCamp Supabase server client and admin guard.

## Article list query pattern

Load articles in pages, then load audit statuses and finding counts for those article IDs.

Pseudo-code:

```ts
const { data: articles, count } = await supabase
  .from('wiki_articles')
  .select('id, title, slug, updated_at', { count: 'exact' }) // adapt columns
  .order('updated_at', { ascending: false })
  .range(offset, offset + pageSize - 1)
```

If the exact columns are different, use the columns that existing admin article pages already use.

Then:

```ts
const targetIds = articles.map((a) => String(a.id))

const { data: statuses } = await supabase
  .from('ai_audit_status_cache')
  .select('*')
  .eq('target_type', 'wiki_article')
  .in('target_id', targetIds)
```

Then open findings:

```ts
const { data: findings } = await supabase
  .from('ai_audit_findings')
  .select('id, target_id, severity, status, risk_type')
  .eq('target_type', 'wiki_article')
  .in('target_id', targetIds)
  .in('status', ['open', 'confirmed'])
```

For source counts:

```ts
const { data: sourceRows } = await supabase
  .from('wiki_article_sources')
  .select('article_id') // adapt column if needed
  .in('article_id', targetIds)
```

Merge on the server into table rows.

## Question list query pattern

```ts
const { data: questions, count } = await supabase
  .from('questions')
  .select('id, stem, answer_key, updated_at', { count: 'exact' }) // adapt columns
  .order('updated_at', { ascending: false })
  .range(offset, offset + pageSize - 1)
```

Then load `ai_audit_status_cache` and findings:

```ts
const targetIds = questions.map((q) => String(q.id))

const { data: statuses } = await supabase
  .from('ai_audit_status_cache')
  .select('*')
  .eq('target_type', 'question')
  .in('target_id', targetIds)
```

## Design scenario question query pattern

Use the same pattern with:

```text
target_type = design_scenario_question
table = design_scenario_questions
```

## Missing status behavior

If no `ai_audit_status_cache` row exists for a target:

```ts
return {
  latest_phase: 'not_started',
  latest_status: 'not_checked',
  highest_severity: null,
  findings_count: 0,
  open_findings_count: 0,
  needs_source_check: false,
  needs_correction: false,
  needs_human_review: false,
}
```

## Dashboard summary query pattern

Use counts from:

- `wiki_articles`
- `questions`
- `design_scenario_questions`
- `ai_audit_status_cache`
- `ai_audit_findings`
- `ai_change_proposals`

Pseudo-code:

```ts
const totalArticles = await countRows('wiki_articles')
const totalQuestions = await countRows('questions')
const totalDesignQuestions = await countRows('design_scenario_questions')

const openFindings = await countRows('ai_audit_findings', { status: ['open','confirmed'] })
const needsReview = await countRows('ai_audit_status_cache', { needs_human_review: true })
const likelyWrong = await countRows('ai_audit_status_cache', { latest_status: ['likely_wrong','confirmed_wrong'] })
```

`not_checked` can be calculated as:

```text
total wiki_articles - count(status_cache rows where target_type = wiki_article)
```

Do not require seeding a status row for every item.

## Filtering

For filters that live in status cache, query status cache first, then fetch target rows by IDs. For full-text searches over article/question content, query target table first, then merge status.

## Pagination

Use server-side pagination. Do not load all 7,159 questions in the browser.
