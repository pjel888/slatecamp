#!/usr/bin/env bun
import path from 'node:path'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { REPO_ROOT, PLAN_DIR, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const out=path.join(PLAN_DIR,'supabase-migration-rebaseline')
const recon=path.join(PLAN_DIR,'supabase-migration-reconciliation')
function versionsFromList(file:string){ if(!existsSync(file)) return []; const text=readFileSync(file,'utf8'); const versions=new Set<string>(); for(const m of text.matchAll(/\b(\d{3}|\d{8}|\d{14})\b/g)) versions.add(m[1]); return [...versions].sort() }
const localFiles=existsSync(path.join(REPO_ROOT,'supabase/migrations'))?readdirSync(path.join(REPO_ROOT,'supabase/migrations')).filter(f=>f.endsWith('.sql')).sort():[]
const summaryPath=path.join(recon,'migration-mismatch-summary.generated.json')
const summary=existsSync(summaryPath)?JSON.parse(readFileSync(summaryPath,'utf8')):{}
const localOnly=summary.local_only_versions||[]
const remoteOnly=summary.remote_only_versions||[]
const sql=localFiles.map(f=>readFileSync(path.join(REPO_ROOT,'supabase/migrations',f),'utf8')).join('\n')
const destructive=(sql.match(/\b(drop\s+table|drop\s+schema|truncate\s+table|delete\s+from)\b/ig)||[])
const analysis={generated_at:new Date().toISOString(), local_file_count:summary.local_file_count||localFiles.length, linked_row_count:summary.row_count||versionsFromList(path.join(recon,'migration-list-linked.txt')).length, local_only_count:summary.local_only_count||localOnly.length, remote_only_count:summary.remote_only_count||remoteOnly.length, matched_count:summary.matched_count||0, local_only_versions:localOnly, remote_only_versions:remoteOnly, destructive_sql_tokens:destructive, admin_audit_shadow_recommended:true, migration_repair_safe:false, live_apply_safe:false, lineage_hash:sha256Text(JSON.stringify(summary))}
await writeJson(path.join(out,'migration-lineage-analysis.generated.json'), analysis)
await writeText(path.join(out,'migration-lineage-analysis-report.md'), `# Migration Lineage Analysis\n\nStatus: LIVE_REPAIR_UNSAFE\n\n- Local migration SQL files: ${analysis.local_file_count}\n- Linked migration rows observed: ${analysis.linked_row_count}\n- Matched versions: ${analysis.matched_count}\n- Local-only versions: ${analysis.local_only_count}\n- Remote-only versions: ${analysis.remote_only_count}\n- Migration repair safe: false\n- Live apply safe: false\n\nThe mismatch is broad lineage drift. Continue with additive shadow/admin tooling only.\n`)
console.log(JSON.stringify({ok:true, ...analysis}, null, 2))
