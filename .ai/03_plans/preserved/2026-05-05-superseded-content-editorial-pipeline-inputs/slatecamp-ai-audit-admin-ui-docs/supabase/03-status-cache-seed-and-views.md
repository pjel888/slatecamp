# Status Cache Seed and Optional Overview Views

This file gives schema-specific SQL for the current SlateCamp content tables.

The UI can work by fetching base tables and merging status rows in TypeScript. However, for a cleaner admin implementation, Codex may add a seed function and optional overview views.

## Seed status cache function

This creates or updates one status-cache row per current article, normal question, and design scenario question.

```sql
create or replace function public.seed_ai_audit_status_cache()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ai_audit_status_cache (
    target_type,
    target_id,
    article_id,
    latest_phase,
    latest_status,
    content_hash,
    metadata
  )
  select
    'wiki_article',
    wa.article_id,
    wa.article_id,
    'not_started',
    'not_checked',
    md5(coalesce(wa.title, '') || '|' || coalesce(wa.content, '') || '|' || coalesce(wa.updated_at::text, '')),
    jsonb_build_object('title', wa.title, 'slug', wa.slug, 'subject_label', wa.subject_label)
  from public.wiki_articles wa
  on conflict (target_type, target_id) do update set
    article_id = excluded.article_id,
    content_hash = excluded.content_hash,
    metadata = public.ai_audit_status_cache.metadata || excluded.metadata,
    updated_at = now();

  insert into public.ai_audit_status_cache (
    target_type,
    target_id,
    article_id,
    question_id,
    latest_phase,
    latest_status,
    content_hash,
    metadata
  )
  select
    'question',
    q.question_id,
    q.article_id,
    q.question_id,
    'not_started',
    'not_checked',
    md5(
      coalesce(q.text, '') || '|' ||
      coalesce(q.options::text, '') || '|' ||
      coalesce(q.correct_option_id, '') || '|' ||
      coalesce(q.explanation, '') || '|' ||
      coalesce(q.rationale::text, '') || '|' ||
      coalesce(q.updated_at::text, '')
    ),
    jsonb_build_object('topic_id', q.topic_id, 'question_type', q.question_type)
  from public.questions q
  on conflict (target_type, target_id) do update set
    article_id = excluded.article_id,
    question_id = excluded.question_id,
    content_hash = excluded.content_hash,
    metadata = public.ai_audit_status_cache.metadata || excluded.metadata,
    updated_at = now();

  insert into public.ai_audit_status_cache (
    target_type,
    target_id,
    question_id,
    latest_phase,
    latest_status,
    content_hash,
    metadata
  )
  select
    'design_scenario_question',
    dq.question_id,
    dq.question_id,
    'not_started',
    'not_checked',
    md5(
      coalesce(dq.question_stem, '') || '|' ||
      coalesce(dq.options::text, '') || '|' ||
      coalesce(dq.correct_answer_index::text, '') || '|' ||
      coalesce(dq.rationale::text, '') || '|' ||
      coalesce(dq.code_citation, '')
    ),
    jsonb_build_object('scenario_id', dq.scenario_id, 'question_type', dq.question_type)
  from public.design_scenario_questions dq
  on conflict (target_type, target_id) do update set
    question_id = excluded.question_id,
    content_hash = excluded.content_hash,
    metadata = public.ai_audit_status_cache.metadata || excluded.metadata,
    updated_at = now();
end;
$$;
```

## Optional article overview view

```sql
create or replace view public.ai_audit_article_overview as
select
  wa.article_id,
  wa.title,
  wa.slug,
  wa.subject_label,
  wa.difficulty_label,
  wa.status as article_status,
  wa.reviewed_at,
  wa.updated_at,
  coalesce(src.source_count, 0)::integer as source_count,
  coalesce(src.verified_source_count, 0)::integer as verified_source_count,
  coalesce(qs.question_count, 0)::integer as question_count,
  coalesce(sc.latest_phase, 'not_started') as latest_phase,
  coalesce(sc.latest_status, 'not_checked') as latest_status,
  sc.highest_severity,
  coalesce(sc.findings_count, 0)::integer as findings_count,
  coalesce(sc.open_findings_count, 0)::integer as open_findings_count,
  coalesce(sc.needs_source_check, false) as needs_source_check,
  coalesce(sc.needs_correction, false) as needs_correction,
  coalesce(sc.needs_human_review, false) as needs_human_review,
  sc.last_audited_at,
  sc.content_hash
from public.wiki_articles wa
left join lateral (
  select
    count(*) as source_count,
    count(*) filter (where was.is_verified = true) as verified_source_count
  from public.wiki_article_sources was
  where was.article_id = wa.article_id
) src on true
left join lateral (
  select count(*) as question_count
  from public.questions q
  where q.article_id = wa.article_id
) qs on true
left join public.ai_audit_status_cache sc
  on sc.target_type = 'wiki_article'
 and sc.target_id = wa.article_id;
```

## Optional question overview view

```sql
create or replace view public.ai_audit_question_overview as
select
  q.question_id,
  q.article_id,
  wa.title as article_title,
  wa.slug as article_slug,
  q.topic_id,
  q.text,
  q.correct_option_id,
  q.question_type,
  q.code_citation,
  q.updated_at,
  coalesce(sc.latest_phase, 'not_started') as latest_phase,
  coalesce(sc.latest_status, 'not_checked') as latest_status,
  sc.highest_severity,
  coalesce(sc.findings_count, 0)::integer as findings_count,
  coalesce(sc.open_findings_count, 0)::integer as open_findings_count,
  coalesce(sc.needs_source_check, false) as needs_source_check,
  coalesce(sc.needs_correction, false) as needs_correction,
  coalesce(sc.needs_human_review, false) as needs_human_review,
  sc.last_audited_at,
  sc.content_hash
from public.questions q
left join public.wiki_articles wa on wa.article_id = q.article_id
left join public.ai_audit_status_cache sc
  on sc.target_type = 'question'
 and sc.target_id = q.question_id;
```

## Optional design scenario question overview view

```sql
create or replace view public.ai_audit_design_scenario_question_overview as
select
  dq.question_id,
  dq.scenario_id,
  ds.title as scenario_title,
  dq.question_number,
  dq.question_stem,
  dq.correct_answer_index,
  dq.question_type,
  dq.code_citation,
  dq.difficulty_rating,
  coalesce(sc.latest_phase, 'not_started') as latest_phase,
  coalesce(sc.latest_status, 'not_checked') as latest_status,
  sc.highest_severity,
  coalesce(sc.findings_count, 0)::integer as findings_count,
  coalesce(sc.open_findings_count, 0)::integer as open_findings_count,
  coalesce(sc.needs_source_check, false) as needs_source_check,
  coalesce(sc.needs_correction, false) as needs_correction,
  coalesce(sc.needs_human_review, false) as needs_human_review,
  sc.last_audited_at,
  sc.content_hash
from public.design_scenario_questions dq
left join public.design_scenarios ds on ds.scenario_id = dq.scenario_id
left join public.ai_audit_status_cache sc
  on sc.target_type = 'design_scenario_question'
 and sc.target_id = dq.question_id;
```

## Optional dashboard summary view

```sql
create or replace view public.ai_audit_dashboard_summary as
select
  (select count(*) from public.wiki_articles)::integer as total_articles,
  (select count(*) from public.questions)::integer as total_questions,
  (select count(*) from public.design_scenario_questions)::integer as total_design_scenario_questions,
  (select count(*) from public.ai_audit_status_cache where target_type = 'wiki_article' and latest_status = 'not_checked')::integer as articles_not_checked,
  (select count(*) from public.ai_audit_status_cache where target_type = 'question' and latest_status = 'not_checked')::integer as questions_not_checked,
  (select count(*) from public.ai_audit_status_cache where latest_status in ('needs_source_check','flagged','likely_wrong','confirmed_wrong','needs_human_review'))::integer as items_needing_attention,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened'))::integer as open_findings,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and severity in ('high','critical'))::integer as high_or_critical_findings,
  (select count(*) from public.ai_change_proposals where status = 'pending')::integer as pending_proposals,
  (select count(*) from public.ai_audit_runs)::integer as total_runs,
  (select count(*) from public.wiki_articles wa where not exists (select 1 from public.wiki_article_sources was where was.article_id = wa.article_id))::integer as articles_with_zero_sources;
```
