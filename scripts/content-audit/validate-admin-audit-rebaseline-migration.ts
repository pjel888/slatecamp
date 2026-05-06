#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, writeText } from './source-reconciliation-utils'
const out=path.join(REPO_ROOT,'.ai/03_plans/content-editorial-pipeline-2026-05-05/supabase-rebaseline-autopilot')
const sql=await Bun.file(path.join(out,'admin-audit-rebaseline-migration.generated.sql')).text()
const destructive=[/\bdrop\s+table\b/i,/\bdrop\s+schema\b/i,/\btruncate\b/i,/\bdelete\s+from\b/i]
const checks=[{check:'contains_ai_audit_objects',pass:/ai_audit/i.test(sql)},{check:'local_staging_only_label',pass:/Local\/staging only/.test(sql)},{check:'no_forbidden_destructive_sql',pass:!destructive.some(r=>r.test(sql))},{check:'no_article_question_content_update',pass:!/update\s+(wiki_articles|questions|question_bank)/i.test(sql)}]
const ok=checks.every(c=>c.pass)
await writeText(path.join(out,'admin-audit-rebaseline-validation.md'),`# Admin Audit Rebaseline Migration Validation\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n\nProduction apply remains blocked.\n`)
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
