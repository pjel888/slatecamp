#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const out=path.join(REPO_ROOT,'.ai/03_plans/content-editorial-pipeline-2026-05-05/supabase-rebaseline-autopilot')
const sql=await Bun.file(path.join(out,'rebaseline-snapshot.generated.sql')).text()
const manifest=readJson<any>(path.join(out,'rebaseline-snapshot-manifest.generated.json'),{})
const forbidden=[/\bdrop\s+table\b/i,/\bdrop\s+schema\b/i,/\btruncate\b/i,/\bdelete\s+from\b/i]
const checks=[{check:'manifest_exists',pass:!!manifest.sql_sha256},{check:'snapshot_schema_only',pass:/slatecamp_rebaseline_sandbox/.test(sql)},{check:'no_forbidden_destructive_sql',pass:!forbidden.some(r=>r.test(sql))},{check:'production_block_label_present',pass:/Production apply is blocked/.test(sql)}]
const ok=checks.every(c=>c.pass)
await writeText(path.join(out,'local-rebaseline-sandbox-report.md'),`# Local Rebaseline Sandbox Report\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n\nNo production DB mutation performed.\n`)
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
