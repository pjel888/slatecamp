#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, writeText, writeJson, sha256Text } from './source-reconciliation-utils'
const out=path.join(REPO_ROOT,'.ai/03_plans/content-editorial-pipeline-2026-05-05/supabase-rebaseline-autopilot')
const sourcePath=path.join(REPO_ROOT,'supabase/migrations/20260501085339_create_ai_audit_admin_tables.sql')
let source=''
try { source=await Bun.file(sourcePath).text() } catch { source='-- source migration unavailable\n' }
const sql=`-- Admin audit rebaseline migration draft\n-- Local/staging only until production migration lineage is reconciled.\n-- Source: supabase/migrations/20260501085339_create_ai_audit_admin_tables.sql\n\n${source}\n`
await writeText(path.join(out,'admin-audit-rebaseline-migration.generated.sql'),sql)
await writeJson(path.join(out,'admin-audit-rebaseline-migration-manifest.generated.json'),{generated_at:new Date().toISOString(), source:sourcePath, local_or_staging_only:true, sql_sha256:sha256Text(sql), bytes:sql.length})
console.log(JSON.stringify({ok:true,bytes:sql.length},null,2))
