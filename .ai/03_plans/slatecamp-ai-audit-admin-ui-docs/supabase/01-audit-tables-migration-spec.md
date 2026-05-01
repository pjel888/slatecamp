# Supabase Migration Spec: AI Audit Tables

This migration creates the audit logging foundation. It should be added as a normal Supabase migration in the repository.

## Important before applying

Codex must inspect existing admin authorization helpers before finalizing RLS policies.

Do not blindly create duplicate `is_admin()` functions if the codebase already has one.

## Design choice: polymorphic targets

Use `target_type` + `target_id text` rather than direct foreign keys to `wiki_articles` or `questions`.

Why:

- It supports `wiki_articles`, `questions`, `design_scenario_questions`, and future targets.
- It avoids migration failure if existing IDs are UUID/text/bigint.
- It keeps audit tables decoupled from content schema changes.

## Suggested SQL

```sql
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
  constraint ai_audit_findings_status_check check (status in ('open','confirmed','rejected','resolved','superseded')),
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
  constraint ai_change_proposals_status_check check (status in ('pending','approved','rejected','applied','superseded'))
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
  constraint ai_review_decisions_decision_check check (decision in ('approve','reject','confirm','resolve','reopen','mark_reviewed','mark_needs_review','edit','retire','note','status_update'))
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
```

## Indexes

```sql
create index if not exists ai_audit_runs_status_idx on public.ai_audit_runs(status);
create index if not exists ai_audit_runs_phase_idx on public.ai_audit_runs(phase);
create index if not exists ai_audit_runs_started_at_idx on public.ai_audit_runs(started_at desc);
create index if not exists ai_audit_items_target_idx on public.ai_audit_items(target_type, target_id);
create index if not exists ai_audit_items_run_idx on public.ai_audit_items(run_id);
create index if not exists ai_audit_items_status_idx on public.ai_audit_items(status);
create index if not exists ai_audit_items_phase_idx on public.ai_audit_items(phase);
create index if not exists ai_audit_findings_target_idx on public.ai_audit_findings(target_type, target_id);
create index if not exists ai_audit_findings_status_idx on public.ai_audit_findings(status);
create index if not exists ai_audit_findings_severity_idx on public.ai_audit_findings(severity);
create index if not exists ai_audit_findings_risk_type_idx on public.ai_audit_findings(risk_type);
create index if not exists ai_audit_findings_created_at_idx on public.ai_audit_findings(created_at desc);
create index if not exists ai_change_proposals_target_idx on public.ai_change_proposals(target_type, target_id);
create index if not exists ai_change_proposals_status_idx on public.ai_change_proposals(status);
create index if not exists ai_review_decisions_target_idx on public.ai_review_decisions(target_type, target_id);
create index if not exists ai_review_decisions_created_at_idx on public.ai_review_decisions(created_at desc);
create index if not exists ai_audit_status_cache_target_idx on public.ai_audit_status_cache(target_type, target_id);
create index if not exists ai_audit_status_cache_status_idx on public.ai_audit_status_cache(latest_status);
create index if not exists ai_audit_status_cache_phase_idx on public.ai_audit_status_cache(latest_phase);
create index if not exists ai_audit_status_cache_review_idx on public.ai_audit_status_cache(needs_human_review) where needs_human_review = true;
```

## Updated-at trigger

If the project already has a reusable updated-at trigger, use it. Otherwise add a simple one:

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_ai_audit_runs_updated_at
before update on public.ai_audit_runs
for each row execute function public.set_updated_at();

create trigger set_ai_audit_items_updated_at
before update on public.ai_audit_items
for each row execute function public.set_updated_at();

create trigger set_ai_audit_status_cache_updated_at
before update on public.ai_audit_status_cache
for each row execute function public.set_updated_at();
```

## RLS placeholder

See `supabase/02-rls-admin-policy-spec.md` before applying policies.
