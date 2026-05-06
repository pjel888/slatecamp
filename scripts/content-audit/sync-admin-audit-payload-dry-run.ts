#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText, sha256Text } from './source-reconciliation-utils'
const f=readJson<any>(path.join(PLAN_DIR,'admin-audit-local-fixtures.generated.json'),{})
const all=[...(f.source_items||[]),...(f.article_items||[]),...(f.question_items||[])]
const run={run_id:`admin-local-dry-run-${sha256Text(JSON.stringify(f)).slice(0,12)}`, generated_at:new Date().toISOString(), mode:'dry_run_local_only', live_db_write:false, item_count:all.length, payload_hash:sha256Text(JSON.stringify(all))}
await writeJson(path.join(PLAN_DIR,'admin-audit-local-dry-run.generated.json'),run)
await writeText(path.join(PLAN_DIR,'phase-j-admin-audit-local-implementation-report.md'), `# Phase J Admin Audit Local Implementation Report\n\n- Mode: dry_run_local_only\n- Live DB write: false\n- Item count: ${run.item_count}\n- Payload hash: ${run.payload_hash}\n`)
console.log(JSON.stringify({ok:true,...run},null,2))
