#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const root=process.cwd()
const fixture=path.join(root,'.ai/03_plans/content-editorial-pipeline-2026-05-05/admin-audit-local-fixtures.generated.json')
const out=path.join(root,'.ai/03_plans/content-editorial-pipeline-2026-05-05/supabase-rebaseline-autopilot/staging-validation/admin-audit-app-readiness-validation.generated.json')
const exists=existsSync(fixture)
const parsed=exists?JSON.parse(readFileSync(fixture,'utf8')):{}
const counts=Object.fromEntries(Object.entries(parsed).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,(v as unknown[]).length]))
const result={ok:exists, fixture_path:fixture, fixture_counts:counts, production_db_access:false, mutation:false, fixture_flag_required:'SLATECAMP_ENABLE_ADMIN_AI_AUDIT_FIXTURES=true'}
writeFileSync(out, JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2))
if(!result.ok) process.exit(1)
