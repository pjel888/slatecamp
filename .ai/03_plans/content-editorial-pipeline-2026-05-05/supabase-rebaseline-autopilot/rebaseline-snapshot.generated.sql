-- SlateCamp Supabase rebaseline sandbox snapshot
-- SNAPSHOT ONLY: not an original migration-lineage replacement.
-- Production apply is blocked until staging/preview validation.

create schema if not exists slatecamp_rebaseline_sandbox;

create table if not exists slatecamp_rebaseline_sandbox.migration_lineage_snapshot (
  version text primary key,
  present_remote boolean not null,
  present_local boolean not null,
  lineage_state text not null,
  captured_at timestamptz not null default now()
);

-- Rows are represented in the JSON manifest, not inserted here, to keep this SQL idempotent and non-mutating beyond sandbox metadata.
