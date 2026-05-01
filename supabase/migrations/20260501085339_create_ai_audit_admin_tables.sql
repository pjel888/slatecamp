-- AI Audit Admin UI MVP infrastructure.
-- Dedicated audit/workflow tables only: this migration does not mutate live article/question content.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ai_audit_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  scope_type text not null default 'manual',
  phase text not null default 'not_started',
  provider text not null default 'manual',
  model text,
  prompt_version text,
  status text not null default 'completed',
  total_items integer not null default 0,
  completed_items integer not null default 0,
  flagged_items integer not null default 0,
  cost_estimate_usd numeric(12, 4),
  started_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_audit_runs_status_check check (status in ('queued','running','completed','failed','cancelled')),
  constraint ai_audit_runs_phase_check check (phase in (
    'not_started','tier0_static_check','tier1_ai_flag_scan','tier2_source_verification',
    'tier3_correction_proposal','tier4_validation','human_review','approved','published'
  ))
);

create table if not exists public.ai_audit_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.ai_audit_runs(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  article_id text,
  question_id text,
  phase text not null,
  status text not null,
  content_hash text,
  source_hash text,
  question_hash text,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_audit_items_target_type_check check (target_type in ('wiki_article','question','design_scenario_question','source','other')),
  constraint ai_audit_items_phase_check check (phase in (
    'not_started','tier0_static_check','tier1_ai_flag_scan','tier2_source_verification',
    'tier3_correction_proposal','tier4_validation','human_review','approved','published'
  )),
  constraint ai_audit_items_status_check check (status in (
    'not_checked','queued','running','passed','flagged','needs_source_check','likely_wrong','confirmed_wrong',
    'correction_proposed','validated','needs_human_review','approved','published','rejected','skipped','failed'
  ))
);

create table if not exists public.ai_audit_findings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.ai_audit_runs(id) on delete set null,
  audit_item_id uuid references public.ai_audit_items(id) on delete set null,
  target_type text not null,
  target_id text not null,
  article_id text,
  question_id text,
  severity text not null default 'medium',
  status text not null default 'open',
  risk_type text not null default 'other',
  finding_summary text not null,
  suspect_text text,
  ai_rationale_summary text,
  recommended_next_step text,
  confidence text,
  provider text not null default 'manual',
  model text,
  prompt_version text,
  raw_output jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_audit_findings_target_type_check check (target_type in ('wiki_article','question','design_scenario_question','source','other')),
  constraint ai_audit_findings_severity_check check (severity in ('low','medium','high','critical')),
  constraint ai_audit_findings_status_check check (status in ('open','confirmed','rejected','resolved','superseded','reopened')),
  constraint ai_audit_findings_confidence_check check (confidence is null or confidence in ('low','medium','high'))
);

create table if not exists public.ai_change_proposals (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid references public.ai_audit_findings(id) on delete set null,
  run_id uuid references public.ai_audit_runs(id) on delete set null,
  target_type text not null,
  target_id text not null,
  article_id text,
  question_id text,
  proposal_type text not null,
  old_content jsonb,
  proposed_content jsonb,
  diff_summary text,
  why_changed text,
  source_evidence jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  provider text not null default 'manual',
  model text,
  prompt_version text,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  applied_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_change_proposals_target_type_check check (target_type in ('wiki_article','question','design_scenario_question','source','other')),
  constraint ai_change_proposals_type_check check (proposal_type in ('article_edit','question_edit','answer_key_change','source_update','retire_question','status_only','other')),
  constraint ai_change_proposals_status_check check (status in ('pending','approved','rejected','needs_edit','applied','superseded'))
);

create table if not exists public.ai_review_decisions (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references auth.users(id) on delete set null,
  target_type text not null,
  target_id text not null,
  decision text not null,
  decision_notes text,
  previous_status text,
  new_status text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_review_decisions_target_type_check check (target_type in ('finding','proposal','audit_item','wiki_article','question','design_scenario_question','run','other')),
  constraint ai_review_decisions_decision_check check (decision in ('approve','reject','confirm','resolve','reopen','mark_reviewed','mark_needs_review','edit','retire','note','status_update','needs_edit'))
);

create table if not exists public.ai_audit_status_cache (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id text not null,
  article_id text,
  question_id text,
  latest_run_id uuid references public.ai_audit_runs(id) on delete set null,
  latest_phase text not null default 'not_started',
  latest_status text not null default 'not_checked',
  highest_severity text,
  findings_count integer not null default 0,
  open_findings_count integer not null default 0,
  needs_source_check boolean not null default false,
  needs_correction boolean not null default false,
  needs_human_review boolean not null default false,
  last_audited_at timestamptz,
  content_hash text,
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint ai_audit_status_cache_target_unique unique (target_type, target_id),
  constraint ai_audit_status_cache_target_type_check check (target_type in ('wiki_article','question','design_scenario_question','source','other')),
  constraint ai_audit_status_cache_phase_check check (latest_phase in (
    'not_started','tier0_static_check','tier1_ai_flag_scan','tier2_source_verification',
    'tier3_correction_proposal','tier4_validation','human_review','approved','published'
  )),
  constraint ai_audit_status_cache_status_check check (latest_status in (
    'not_checked','queued','running','passed','flagged','needs_source_check','likely_wrong','confirmed_wrong',
    'correction_proposed','validated','needs_human_review','approved','published','rejected','skipped','failed'
  )),
  constraint ai_audit_status_cache_severity_check check (highest_severity is null or highest_severity in ('low','medium','high','critical'))
);

create index if not exists ai_audit_runs_status_idx on public.ai_audit_runs(status);
create index if not exists ai_audit_runs_phase_idx on public.ai_audit_runs(phase);
create index if not exists ai_audit_runs_started_at_idx on public.ai_audit_runs(started_at desc);
create index if not exists ai_audit_items_target_idx on public.ai_audit_items(target_type, target_id);
create index if not exists ai_audit_items_article_idx on public.ai_audit_items(article_id);
create index if not exists ai_audit_items_question_idx on public.ai_audit_items(question_id);
create index if not exists ai_audit_items_run_idx on public.ai_audit_items(run_id);
create index if not exists ai_audit_items_status_idx on public.ai_audit_items(status);
create index if not exists ai_audit_items_phase_idx on public.ai_audit_items(phase);
create index if not exists ai_audit_findings_target_idx on public.ai_audit_findings(target_type, target_id);
create index if not exists ai_audit_findings_article_idx on public.ai_audit_findings(article_id);
create index if not exists ai_audit_findings_question_idx on public.ai_audit_findings(question_id);
create index if not exists ai_audit_findings_status_idx on public.ai_audit_findings(status);
create index if not exists ai_audit_findings_severity_idx on public.ai_audit_findings(severity);
create index if not exists ai_audit_findings_risk_type_idx on public.ai_audit_findings(risk_type);
create index if not exists ai_audit_findings_created_at_idx on public.ai_audit_findings(created_at desc);
create index if not exists ai_change_proposals_target_idx on public.ai_change_proposals(target_type, target_id);
create index if not exists ai_change_proposals_article_idx on public.ai_change_proposals(article_id);
create index if not exists ai_change_proposals_question_idx on public.ai_change_proposals(question_id);
create index if not exists ai_change_proposals_status_idx on public.ai_change_proposals(status);
create index if not exists ai_change_proposals_created_at_idx on public.ai_change_proposals(created_at desc);
create index if not exists ai_review_decisions_target_idx on public.ai_review_decisions(target_type, target_id);
create index if not exists ai_review_decisions_created_at_idx on public.ai_review_decisions(created_at desc);
create index if not exists ai_audit_status_cache_target_idx on public.ai_audit_status_cache(target_type, target_id);
create index if not exists ai_audit_status_cache_article_idx on public.ai_audit_status_cache(article_id);
create index if not exists ai_audit_status_cache_question_idx on public.ai_audit_status_cache(question_id);
create index if not exists ai_audit_status_cache_status_idx on public.ai_audit_status_cache(latest_status);
create index if not exists ai_audit_status_cache_phase_idx on public.ai_audit_status_cache(latest_phase);
create index if not exists ai_audit_status_cache_severity_idx on public.ai_audit_status_cache(highest_severity);
create index if not exists ai_audit_status_cache_review_idx on public.ai_audit_status_cache(needs_human_review) where needs_human_review = true;
create index if not exists ai_audit_status_cache_source_idx on public.ai_audit_status_cache(needs_source_check) where needs_source_check = true;

create or replace function public.set_ai_audit_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_audit_runs_updated_at on public.ai_audit_runs;
create trigger set_ai_audit_runs_updated_at
before update on public.ai_audit_runs
for each row execute function public.set_ai_audit_updated_at();

drop trigger if exists set_ai_audit_items_updated_at on public.ai_audit_items;
create trigger set_ai_audit_items_updated_at
before update on public.ai_audit_items
for each row execute function public.set_ai_audit_updated_at();

drop trigger if exists set_ai_audit_status_cache_updated_at on public.ai_audit_status_cache;
create trigger set_ai_audit_status_cache_updated_at
before update on public.ai_audit_status_cache
for each row execute function public.set_ai_audit_updated_at();

alter table public.ai_audit_runs enable row level security;
alter table public.ai_audit_items enable row level security;
alter table public.ai_audit_findings enable row level security;
alter table public.ai_change_proposals enable row level security;
alter table public.ai_review_decisions enable row level security;
alter table public.ai_audit_status_cache enable row level security;

drop policy if exists "Content reviewers manage ai_audit_runs" on public.ai_audit_runs;
create policy "Content reviewers manage ai_audit_runs"
on public.ai_audit_runs
for all
to authenticated
using (public.can_review_content())
with check (public.can_review_content());

drop policy if exists "Content reviewers manage ai_audit_items" on public.ai_audit_items;
create policy "Content reviewers manage ai_audit_items"
on public.ai_audit_items
for all
to authenticated
using (public.can_review_content())
with check (public.can_review_content());

drop policy if exists "Content reviewers manage ai_audit_findings" on public.ai_audit_findings;
create policy "Content reviewers manage ai_audit_findings"
on public.ai_audit_findings
for all
to authenticated
using (public.can_review_content())
with check (public.can_review_content());

drop policy if exists "Content reviewers manage ai_change_proposals" on public.ai_change_proposals;
create policy "Content reviewers manage ai_change_proposals"
on public.ai_change_proposals
for all
to authenticated
using (public.can_review_content())
with check (public.can_review_content());

drop policy if exists "Content reviewers manage ai_review_decisions" on public.ai_review_decisions;
create policy "Content reviewers manage ai_review_decisions"
on public.ai_review_decisions
for all
to authenticated
using (public.can_review_content())
with check (public.can_review_content());

drop policy if exists "Content reviewers manage ai_audit_status_cache" on public.ai_audit_status_cache;
create policy "Content reviewers manage ai_audit_status_cache"
on public.ai_audit_status_cache
for all
to authenticated
using (public.can_review_content())
with check (public.can_review_content());

grant select, insert, update, delete on public.ai_audit_runs to authenticated;
grant select, insert, update, delete on public.ai_audit_items to authenticated;
grant select, insert, update, delete on public.ai_audit_findings to authenticated;
grant select, insert, update, delete on public.ai_change_proposals to authenticated;
grant select, insert, update, delete on public.ai_review_decisions to authenticated;
grant select, insert, update, delete on public.ai_audit_status_cache to authenticated;

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
    wa.article_id::text,
    wa.article_id::text,
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
    q.question_id::text,
    q.article_id::text,
    q.question_id::text,
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
    dq.question_id::text,
    dq.question_id::text,
    'not_started',
    'not_checked',
    md5(
      coalesce(dq.question_stem, '') || '|' ||
      coalesce(dq.options::text, '') || '|' ||
      coalesce(dq.correct_answer_index::text, '') || '|' ||
      coalesce(dq.rationale::text, '') || '|' ||
      coalesce(dq.code_citation, '') || '|' ||
      coalesce(dq.created_at::text, '')
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

create or replace view public.ai_audit_article_overview
with (security_invoker = true)
as
select
  wa.article_id::text as article_id,
  wa.title,
  wa.slug,
  wa.subject_label,
  wa.difficulty_label,
  wa.status as article_status,
  wa.reviewed_at,
  wa.updated_at,
  left(regexp_replace(wa.content, '\s+', ' ', 'g'), 240) as content_preview,
  coalesce(src.source_count, 0)::integer as source_count,
  coalesce(src.verified_source_count, 0)::integer as verified_source_count,
  coalesce(qs.question_count, 0)::integer as question_count,
  coalesce(sc.latest_phase, 'not_started') as latest_phase,
  coalesce(sc.latest_status, 'not_checked') as latest_status,
  sc.highest_severity,
  case sc.highest_severity
    when 'critical' then 4
    when 'high' then 3
    when 'medium' then 2
    when 'low' then 1
    else 0
  end as severity_rank,
  coalesce(sc.findings_count, 0)::integer as findings_count,
  coalesce(sc.open_findings_count, 0)::integer as open_findings_count,
  coalesce(sc.needs_source_check, false) as needs_source_check,
  coalesce(sc.needs_correction, false) as needs_correction,
  coalesce(sc.needs_human_review, false) as needs_human_review,
  sc.last_audited_at,
  sc.content_hash,
  coalesce(sc.metadata, '{}'::jsonb) as metadata
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
 and sc.target_id = wa.article_id::text;

create or replace view public.ai_audit_question_overview
with (security_invoker = true)
as
select
  q.question_id::text as question_id,
  q.article_id::text as article_id,
  wa.title as article_title,
  wa.slug as article_slug,
  q.topic_id::text as topic_id,
  tt.name as topic_name,
  q.text,
  q.correct_option_id,
  q.question_type,
  q.code_citation,
  q.updated_at,
  'question'::text as target_type,
  coalesce(sc.latest_phase, 'not_started') as latest_phase,
  coalesce(sc.latest_status, 'not_checked') as latest_status,
  sc.highest_severity,
  case sc.highest_severity
    when 'critical' then 4
    when 'high' then 3
    when 'medium' then 2
    when 'low' then 1
    else 0
  end as severity_rank,
  coalesce(sc.findings_count, 0)::integer as findings_count,
  coalesce(sc.open_findings_count, 0)::integer as open_findings_count,
  coalesce(sc.needs_source_check, false) as needs_source_check,
  coalesce(sc.needs_correction, false) as needs_correction,
  coalesce(sc.needs_human_review, false) as needs_human_review,
  sc.last_audited_at,
  sc.content_hash,
  coalesce(sc.metadata ->> 'risk_type', null) as risk_type,
  coalesce(sc.metadata, '{}'::jsonb) as metadata
from public.questions q
left join public.wiki_articles wa on wa.article_id = q.article_id
left join public.taxonomy_tree tt on tt.node_id = q.topic_id
left join public.ai_audit_status_cache sc
  on sc.target_type = 'question'
 and sc.target_id = q.question_id::text;

create or replace view public.ai_audit_design_scenario_question_overview
with (security_invoker = true)
as
select
  dq.question_id::text as question_id,
  null::text as article_id,
  ds.title as article_title,
  ds.scenario_id as article_slug,
  null::text as topic_id,
  ds.title as topic_name,
  dq.question_stem as text,
  dq.correct_answer_index::text as correct_option_id,
  dq.question_type,
  dq.code_citation,
  dq.created_at as updated_at,
  'design_scenario_question'::text as target_type,
  coalesce(sc.latest_phase, 'not_started') as latest_phase,
  coalesce(sc.latest_status, 'not_checked') as latest_status,
  sc.highest_severity,
  case sc.highest_severity
    when 'critical' then 4
    when 'high' then 3
    when 'medium' then 2
    when 'low' then 1
    else 0
  end as severity_rank,
  coalesce(sc.findings_count, 0)::integer as findings_count,
  coalesce(sc.open_findings_count, 0)::integer as open_findings_count,
  coalesce(sc.needs_source_check, false) as needs_source_check,
  coalesce(sc.needs_correction, false) as needs_correction,
  coalesce(sc.needs_human_review, false) as needs_human_review,
  sc.last_audited_at,
  sc.content_hash,
  coalesce(sc.metadata ->> 'risk_type', null) as risk_type,
  coalesce(sc.metadata, '{}'::jsonb) as metadata,
  dq.scenario_id,
  dq.question_number,
  dq.correct_answer_index
from public.design_scenario_questions dq
left join public.design_scenarios ds on ds.scenario_id = dq.scenario_id
left join public.ai_audit_status_cache sc
  on sc.target_type = 'design_scenario_question'
 and sc.target_id = dq.question_id::text;


create or replace view public.ai_audit_all_question_overview
with (security_invoker = true)
as
select
  question_id,
  article_id,
  article_title,
  article_slug,
  topic_id,
  topic_name,
  text,
  correct_option_id,
  question_type,
  code_citation,
  updated_at,
  target_type,
  latest_phase,
  latest_status,
  highest_severity,
  findings_count,
  open_findings_count,
  needs_source_check,
  needs_correction,
  needs_human_review,
  last_audited_at,
  content_hash,
  risk_type,
  severity_rank,
  metadata
from public.ai_audit_question_overview
union all
select
  question_id,
  article_id,
  article_title,
  article_slug,
  topic_id,
  topic_name,
  text,
  correct_option_id,
  question_type,
  code_citation,
  updated_at,
  target_type,
  latest_phase,
  latest_status,
  highest_severity,
  findings_count,
  open_findings_count,
  needs_source_check,
  needs_correction,
  needs_human_review,
  last_audited_at,
  content_hash,
  risk_type,
  severity_rank,
  metadata
from public.ai_audit_design_scenario_question_overview;

create or replace view public.ai_audit_dashboard_summary
with (security_invoker = true)
as
select
  (select count(*) from public.wiki_articles)::integer as total_articles,
  (select count(*) from public.questions)::integer as total_questions,
  (select count(*) from public.design_scenario_questions)::integer as total_design_scenario_questions,
  (select count(*) from public.wiki_articles wa left join public.ai_audit_status_cache sc on sc.target_type = 'wiki_article' and sc.target_id = wa.article_id::text where coalesce(sc.latest_status, 'not_checked') = 'not_checked')::integer as articles_not_checked,
  (select count(*) from public.ai_audit_status_cache where target_type = 'wiki_article' and latest_phase = 'tier0_static_check' and latest_status in ('passed','validated','approved','published'))::integer as tier0_complete,
  (select count(*) from public.ai_audit_status_cache where target_type = 'wiki_article' and latest_phase = 'tier1_ai_flag_scan' and latest_status in ('passed','validated','approved','published'))::integer as tier1_complete,
  (select count(*) from public.ai_audit_status_cache where needs_source_check = true or latest_status = 'needs_source_check')::integer as needs_source_check,
  (select count(*) from public.ai_audit_status_cache where latest_status in ('likely_wrong','confirmed_wrong','failed') or highest_severity in ('high','critical'))::integer as likely_or_confirmed_issues,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened'))::integer as open_findings,
  (select count(*) from public.ai_change_proposals where status = 'pending')::integer as correction_proposed,
  (select count(*) from public.ai_audit_status_cache where needs_human_review = true or latest_status = 'needs_human_review')::integer as needs_human_review,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'approved')::integer as approved,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'published')::integer as published,
  (select count(*) from public.ai_audit_status_cache where target_type in ('question','design_scenario_question') and latest_status in ('flagged','likely_wrong','confirmed_wrong','needs_human_review','needs_source_check'))::integer as questions_flagged,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and risk_type in ('answer_key_mismatch','missing_answer_key','no_valid_answer'))::integer as answer_key_risks,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and risk_type = 'multiple_correct_answers')::integer as multiple_answer_risks,
  (select count(*) from public.ai_change_proposals where status = 'pending')::integer as pending_proposals,
  (select count(*) from public.ai_audit_runs)::integer as total_runs,
  (select count(*) from public.wiki_articles wa where not exists (select 1 from public.wiki_article_sources was where was.article_id = wa.article_id))::integer as articles_with_zero_sources,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'not_checked')::integer as status_not_checked,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'passed')::integer as status_passed,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'flagged')::integer as status_flagged,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'needs_source_check')::integer as status_needs_source_check,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'likely_wrong')::integer as status_likely_wrong,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'confirmed_wrong')::integer as status_confirmed_wrong,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'correction_proposed')::integer as status_correction_proposed,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'needs_human_review')::integer as status_needs_human_review,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'approved')::integer as status_approved,
  (select count(*) from public.ai_audit_status_cache where latest_status = 'published')::integer as status_published,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and severity = 'low')::integer as severity_low,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and severity = 'medium')::integer as severity_medium,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and severity = 'high')::integer as severity_high,
  (select count(*) from public.ai_audit_findings where status in ('open','confirmed','reopened') and severity = 'critical')::integer as severity_critical;


create or replace view public.ai_audit_finding_overview
with (security_invoker = true)
as
select
  f.*,
  case f.severity
    when 'critical' then 4
    when 'high' then 3
    when 'medium' then 2
    when 'low' then 1
    else 0
  end as severity_rank,
  case f.status
    when 'confirmed' then 4
    when 'reopened' then 3
    when 'open' then 2
    when 'resolved' then 1
    when 'rejected' then 0
    else 0
  end as status_rank,
  coalesce(wa.title, left(q.text, 160), left(dq.question_stem, 160), f.target_id) as target_label,
  coalesce(
    left(regexp_replace(wa.content, '\s+', ' ', 'g'), 240),
    left(regexp_replace(q.text, '\s+', ' ', 'g'), 240),
    left(regexp_replace(dq.question_stem, '\s+', ' ', 'g'), 240)
  ) as target_snippet
from public.ai_audit_findings f
left join public.wiki_articles wa
  on f.target_type = 'wiki_article'
 and wa.article_id::text = f.target_id
left join public.questions q
  on f.target_type = 'question'
 and q.question_id::text = f.target_id
left join public.design_scenario_questions dq
  on f.target_type = 'design_scenario_question'
 and dq.question_id::text = f.target_id;

grant select on public.ai_audit_article_overview to authenticated;
grant select on public.ai_audit_question_overview to authenticated;
grant select on public.ai_audit_design_scenario_question_overview to authenticated;
grant select on public.ai_audit_all_question_overview to authenticated;
grant select on public.ai_audit_dashboard_summary to authenticated;
grant select on public.ai_audit_finding_overview to authenticated;
grant execute on function public.seed_ai_audit_status_cache() to authenticated;

select public.seed_ai_audit_status_cache();
