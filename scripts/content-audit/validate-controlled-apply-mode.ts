#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { REPO_ROOT, readJson, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/19_controlled_apply')
const article=readJson<any>(path.join(root,'logs/article-apply-run.generated.json'),{})
const question=readJson<any>(path.join(root,'logs/question-apply-run.generated.json'),{})
const source=readJson<any>(path.join(root,'logs/source-status-apply-run.generated.json'),{})
const backupExists=(runId:string)=>!!runId&&existsSync(path.join(root,'backups',`${runId}.json`))
const rollbackLogExists=existsSync(path.join(root,'logs/rollback-run.generated.json'))
const checks:[string,boolean][]= [
 ['article_log_present',!!article.run_id],
 ['question_log_present',!!question.run_id],
 ['source_log_present',!!source.run_id],
 ['article_not_live_applied',article.applied===false],
 ['question_not_live_applied',question.applied===false],
 ['source_live_not_applied',source.live_applied===false&&source.supabase_mutation===false],
 ['source_local_status_explicit',source.local_applied===true||source.local_applied===false],
 ['answer_key_changes_zero',question.answer_key_changes===0],
 ['article_backup_exists',backupExists(article.run_id)],
 ['question_backup_exists',backupExists(question.run_id)],
 ['source_backup_exists',backupExists(source.run_id)],
 ['rollback_log_exists',rollbackLogExists],
 ['batch_limits_respected',(article.items||[]).length<=50&&(question.items||[]).length<=50&&(source.items||[]).length<=50]
]
const ok=checks.every(([,v])=>v)
await writeJson(path.join(root,'logs/controlled-apply-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))})
await writeText(path.join(REPO_ROOT,'.ai/03_plans/content-editorial-pipeline-2026-05-05/controlled-apply-validation-report.md'),['# Controlled Apply Validation Report','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n'))
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok)process.exit(1)
