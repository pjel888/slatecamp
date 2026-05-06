#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const plan=PLAN_DIR
const source=readJson<any>(path.join(plan,'admin-sync-source-verification-payload.generated.json'),{})
const article=readJson<any>(path.join(plan,'admin-sync-article-improvement-payload.generated.json'),{})
const question=readJson<any>(path.join(plan,'admin-sync-question-improvement-payload.generated.json'),{})
const fixtures={generated_at:new Date().toISOString(), live_db_write:false, source_items:source.items||[], article_items:article.items||[], question_items:question.items||[], counts:{source:(source.items||[]).length, article:(article.items||[]).length, question:(question.items||[]).length}}
await writeJson(path.join(plan,'admin-audit-local-fixtures.generated.json'),fixtures)
await writeText(path.join(plan,'admin-audit-local-preview-report.md'), `# Admin Audit Local Preview Report\n\n- Live DB write: false\n- Source items: ${fixtures.counts.source}\n- Article items: ${fixtures.counts.article}\n- Question items: ${fixtures.counts.question}\n`)
console.log(JSON.stringify({ok:true, counts:fixtures.counts}, null, 2))
