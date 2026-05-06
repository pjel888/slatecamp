#!/usr/bin/env bun
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { PLAN_DIR, REPO_ROOT, writeText } from './source-reconciliation-utils'
const out=path.join(PLAN_DIR,'supabase-migration-rebaseline')
const src=path.join(REPO_ROOT,'supabase/migrations/20260501085339_create_ai_audit_admin_tables.sql')
const sql=readFileSync(src,'utf8')
const shadow=`-- SlateCamp admin AI audit shadow migration\n-- Generated for local/preview validation only. Do not apply to live while migration lineage is unreconciled.\n\n${sql}\n`
await writeText(path.join(out,'admin-audit-shadow-migration.generated.sql'), shadow)
await writeText(path.join(out,'admin-audit-shadow-schema-plan.md'), `# Admin Audit Shadow Schema Plan\n\nStatus: LOCAL_OR_PREVIEW_ONLY\n\nThis additive shadow migration is generated from ${path.relative(REPO_ROOT,src)}. It is for local/preview validation and review, not live production apply.\n`)
console.log(JSON.stringify({ok:true, bytes:shadow.length}, null, 2))
