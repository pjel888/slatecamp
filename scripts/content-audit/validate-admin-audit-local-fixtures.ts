#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeText } from './source-reconciliation-utils'
const f=readJson<any>(path.join(PLAN_DIR,'admin-audit-local-fixtures.generated.json'),{})
const checks=[
 {check:'live_db_write_false',pass:f.live_db_write===false},
 {check:'has_source_array',pass:Array.isArray(f.source_items)},
 {check:'has_article_array',pass:Array.isArray(f.article_items)},
 {check:'has_question_array',pass:Array.isArray(f.question_items)},
 {check:'has_any_items',pass:(f.counts?.source||0)+(f.counts?.article||0)+(f.counts?.question||0)>0},
]
const ok=checks.every(c=>c.pass)
await writeText(path.join(PLAN_DIR,'admin-audit-local-fixtures-validation.md'), `# Admin Audit Local Fixtures Validation\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
