# Current Schema-Specific Supabase Queries

Use these once the optional overview views from `supabase/03-status-cache-seed-and-views.md` are created.

## Dashboard summary

```ts
const { data, error } = await supabase
  .from('ai_audit_dashboard_summary')
  .select('*')
  .single()

if (error) throw error
```

## Article rows

```ts
const pageSize = 50
const from = (page - 1) * pageSize
const to = from + pageSize - 1

let query = supabase
  .from('ai_audit_article_overview')
  .select('*', { count: 'exact' })
  .order('updated_at', { ascending: false })
  .range(from, to)

if (status) query = query.eq('latest_status', status)
if (phase) query = query.eq('latest_phase', phase)
if (needsHumanReview) query = query.eq('needs_human_review', true)
if (missingSources) query = query.eq('source_count', 0)
if (search) query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`)

const { data, count, error } = await query
if (error) throw error
```

## Question rows

```ts
let query = supabase
  .from('ai_audit_question_overview')
  .select('*', { count: 'exact' })
  .order('updated_at', { ascending: false })
  .range(from, to)

if (status) query = query.eq('latest_status', status)
if (phase) query = query.eq('latest_phase', phase)
if (articleId) query = query.eq('article_id', articleId)
if (needsHumanReview) query = query.eq('needs_human_review', true)
if (search) query = query.ilike('text', `%${search}%`)

const { data, count, error } = await query
if (error) throw error
```

## Design scenario question rows

```ts
let query = supabase
  .from('ai_audit_design_scenario_question_overview')
  .select('*', { count: 'exact' })
  .order('question_number', { ascending: true })
  .range(from, to)

if (status) query = query.eq('latest_status', status)
if (scenarioId) query = query.eq('scenario_id', scenarioId)
if (search) query = query.ilike('question_stem', `%${search}%`)

const { data, count, error } = await query
if (error) throw error
```

## Article detail

```ts
const [articleResult, sourcesResult, questionsResult, findingsResult, proposalsResult, eventsResult] = await Promise.all([
  supabase.from('wiki_articles').select('*').eq('article_id', articleId).single(),
  supabase.from('wiki_article_sources').select('*').eq('article_id', articleId).order('sort_order'),
  supabase.from('questions').select('question_id,text,correct_option_id,question_type,code_citation,updated_at').eq('article_id', articleId),
  supabase.from('ai_audit_findings').select('*').eq('target_type', 'wiki_article').eq('target_id', articleId).order('created_at', { ascending: false }),
  supabase.from('ai_change_proposals').select('*').eq('target_type', 'wiki_article').eq('target_id', articleId).order('created_at', { ascending: false }),
  supabase.from('ai_audit_events').select('*').eq('target_type', 'wiki_article').eq('target_id', articleId).order('created_at', { ascending: false }).limit(50),
])
```

## Question detail

```ts
const questionResult = await supabase
  .from('questions')
  .select('*')
  .eq('question_id', questionId)
  .single()

if (questionResult.error) throw questionResult.error

const question = questionResult.data

const [articleResult, findingsResult, proposalsResult, eventsResult] = await Promise.all([
  question.article_id
    ? supabase.from('wiki_articles').select('article_id,title,slug').eq('article_id', question.article_id).single()
    : Promise.resolve({ data: null, error: null }),
  supabase.from('ai_audit_findings').select('*').eq('target_type', 'question').eq('target_id', questionId).order('created_at', { ascending: false }),
  supabase.from('ai_change_proposals').select('*').eq('target_type', 'question').eq('target_id', questionId).order('created_at', { ascending: false }),
  supabase.from('ai_audit_events').select('*').eq('target_type', 'question').eq('target_id', questionId).order('created_at', { ascending: false }).limit(50),
])
```

## Manual finding insert for article

```ts
const { data: finding, error } = await supabase
  .from('ai_audit_findings')
  .insert({
    target_type: 'wiki_article',
    target_id: articleId,
    article_id: articleId,
    severity,
    status: 'open',
    risk_type: riskType,
    finding_summary: summary,
    suspect_text: suspectText || null,
    recommended_next_step: nextStep || null,
    provider: 'manual',
    confidence: confidence || 'medium',
  })
  .select()
  .single()

if (error) throw error
```

## Manual finding insert for question

```ts
const { data: finding, error } = await supabase
  .from('ai_audit_findings')
  .insert({
    target_type: 'question',
    target_id: questionId,
    question_id: questionId,
    article_id: articleId || null,
    severity,
    status: 'open',
    risk_type: riskType,
    finding_summary: summary,
    suspect_text: suspectText || null,
    recommended_next_step: nextStep || null,
    provider: 'manual',
    confidence: confidence || 'medium',
  })
  .select()
  .single()

if (error) throw error
```
