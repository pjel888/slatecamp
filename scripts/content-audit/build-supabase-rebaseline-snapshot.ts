#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeJson, writeText, sha256Text } from './source-reconciliation-utils'
const out=path.join(REPO_ROOT,'.ai/03_plans/content-editorial-pipeline-2026-05-05/supabase-rebaseline-autopilot')
const table=readJson<any>(path.join(out,'remote-local-migration-table.generated.json'),{rows:[]})
const sql=`-- SlateCamp Supabase rebaseline sandbox snapshot\n-- SNAPSHOT ONLY: not an original migration-lineage replacement.\n-- Production apply is blocked until staging/preview validation.\n\ncreate schema if not exists slatecamp_rebaseline_sandbox;\n\ncreate table if not exists slatecamp_rebaseline_sandbox.migration_lineage_snapshot (\n  version text primary key,\n  present_remote boolean not null,\n  present_local boolean not null,\n  lineage_state text not null,\n  captured_at timestamptz not null default now()\n);\n\n-- Rows are represented in the JSON manifest, not inserted here, to keep this SQL idempotent and non-mutating beyond sandbox metadata.\n`
await writeText(path.join(out,'rebaseline-snapshot.generated.sql'),sql)
const manifest={generated_at:new Date().toISOString(), type:'sandbox_snapshot_metadata_only', destructive_sql:false, row_count:table.rows?.length||0, remote_only_count:table.remote_only_count, local_only_count:table.local_only_count, sql_sha256:sha256Text(sql)}
await writeJson(path.join(out,'rebaseline-snapshot-manifest.generated.json'),manifest)
console.log(JSON.stringify({ok:true,...manifest},null,2))
