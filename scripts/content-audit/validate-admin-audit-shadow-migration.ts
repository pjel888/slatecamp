#!/usr/bin/env bun
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { PLAN_DIR, writeText } from './source-reconciliation-utils'
const out=path.join(PLAN_DIR,'supabase-migration-rebaseline')
const file=path.join(out,'admin-audit-shadow-migration.generated.sql')
const sql=existsSync(file)?readFileSync(file,'utf8'):''
const forbidden=[/\bdrop\s+table\b/i,/\bdrop\s+schema\b/i,/\btruncate\s+table\b/i,/\bdelete\s+from\b/i]
const checks=[
 {check:'file_exists',pass:existsSync(file)},
 {check:'creates_ai_audit_runs',pass:/create table if not exists public\.ai_audit_runs/i.test(sql)},
 {check:'creates_ai_audit_items',pass:/create table if not exists public\.ai_audit_items/i.test(sql)},
 {check:'no_destructive_sql',pass:!forbidden.some(r=>r.test(sql))},
 {check:'local_preview_only_notice',pass:/local\/preview|Do not apply to live/i.test(sql)},
]
const ok=checks.every(c=>c.pass)
await writeText(path.join(out,'admin-audit-shadow-migration-validation.md'), `# Admin Audit Shadow Migration Validation\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok, checks:checks.length}, null, 2)); if(!ok) process.exit(1)
