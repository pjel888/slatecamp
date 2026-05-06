#!/usr/bin/env bun
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { PLAN_DIR, writeText } from './source-reconciliation-utils'
const base=path.join(PLAN_DIR,'supabase-migration-rebaseline')
const sql=existsSync(path.join(base,'admin-audit-shadow-migration.generated.sql'))?readFileSync(path.join(base,'admin-audit-shadow-migration.generated.sql'),'utf8'):''
const expected=['ai_audit_runs','ai_audit_items','ai_audit_findings','ai_change_proposals','ai_review_decisions','ai_audit_status_cache']
const checks=expected.map(t=>({check:`shadow_schema_has_${t}`,pass:new RegExp(`create table if not exists public\\.${t}`,'i').test(sql)}))
checks.push({check:'no_live_apply_instruction',pass:!/db query --linked|db push(?! --dry-run)|migration repair/i.test(sql)})
const ok=checks.every(c=>c.pass)
await writeText(path.join(PLAN_DIR,'phase-j-admin-audit-local-implementation-report.md'), `# Phase J Admin Audit Local Implementation Report\n\nShadow schema validation: ${ok?'PASS':'FAIL'}\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
