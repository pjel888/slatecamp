#!/usr/bin/env bun
import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { PLAN_DIR, readJson, writeText } from './source-reconciliation-utils'
const out=path.join(PLAN_DIR,'supabase-migration-rebaseline')
const required=['migration-lineage-analysis.generated.json','migration-lineage-analysis-report.md','migration-rebaseline-plan.md','migration-rebaseline-risk-register.md','remote-schema-capture-options.md']
const checks:any[]=[]
for(const f of required) checks.push({check:`exists_${f}`, status:existsSync(path.join(out,f))?'PASS':'FAIL'})
const a=readJson<any>(path.join(out,'migration-lineage-analysis.generated.json'),{})
checks.push({check:'repair_not_safe', status:a.migration_repair_safe===false?'PASS':'FAIL'})
checks.push({check:'live_apply_not_safe', status:a.live_apply_safe===false?'PASS':'FAIL'})
for(const f of required.filter(f=>f.endsWith('.md'))){ const t=readFileSync(path.join(out,f),'utf8'); checks.push({check:`${f}_no_repair_command`,status:!/migration repair --status reverted/i.test(t)?'PASS':'FAIL'}) }
const ok=checks.every(c=>c.status==='PASS')
await writeText(path.join(out,'migration-rebaseline-plan-validation.md'), `# Migration Rebaseline Plan Validation\n\n${checks.map(c=>`- ${c.status}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok, checks:checks.length}, null, 2)); if(!ok) process.exit(1)
