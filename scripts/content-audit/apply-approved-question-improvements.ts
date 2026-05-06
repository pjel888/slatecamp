#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { PLAN_DIR, REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const apply=process.argv.includes('--apply')
const batchArg=process.argv.find(a=>a.startsWith('--batch-size=')); const batchSize=batchArg?Number(batchArg.split('=')[1]):25
if(batchSize>50) throw new Error('Batch size limit exceeded: maximum 50')
const runRoot=path.join(REPO_ROOT,'.ai/19_controlled_apply'); await mkdir(path.join(runRoot,'backups'),{recursive:true}); await mkdir(path.join(runRoot,'logs'),{recursive:true});

const outputs=readJson<any>(path.join(REPO_ROOT,'.ai/18_question_improvement/outputs/question-improvement-outputs.generated.json'),{outputs:[]}).outputs||[]
const selected=outputs.slice(0,batchSize); const snapshot={created_at:new Date().toISOString(),target:'question_improvements',apply_requested:apply,items:selected}
const rollbackId=`question-rollback-${sha256Text(JSON.stringify(snapshot)).slice(0,12)}`
await writeJson(path.join(runRoot,'backups',`${rollbackId}.json`),snapshot)
const log={run_id:rollbackId,mode:apply?'apply_requested_but_repo_local_only':'dry_run',applied:false,reason:apply?'Live question apply not executed by default; no direct question mutation adapter configured in this safe run.':'Dry-run preview only.',answer_key_changes:selected.filter((o:any)=>o.answer_key_changed).length,items:selected.map((o:any)=>({job_id:o.job_id,question_candidate_id:o.question_candidate_id,answer_key_changed:o.answer_key_changed}))}
await writeJson(path.join(runRoot,'logs/question-apply-run.generated.json'),log); await writeText(path.join(PLAN_DIR,'question-apply-preview-report.md'),`# Question Apply Preview\n\nMode: ${log.mode}\nApplied: false\nRollback snapshot: ${rollbackId}.json\nItems: ${selected.length}\nAnswer key changes: ${log.answer_key_changes}\n`); console.log(JSON.stringify({ok:true,applied:false,items:selected.length,rollback_id:rollbackId},null,2))
