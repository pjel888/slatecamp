#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { PLAN_DIR, REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const apply=process.argv.includes('--apply')
const batchArg=process.argv.find(a=>a.startsWith('--batch-size=')); const batchSize=batchArg?Number(batchArg.split('=')[1]):25
if(batchSize>50) throw new Error('Batch size limit exceeded: maximum 50')
const runRoot=path.join(REPO_ROOT,'.ai/19_controlled_apply'); await mkdir(path.join(runRoot,'backups'),{recursive:true}); await mkdir(path.join(runRoot,'logs'),{recursive:true});

const outputs=readJson<any>(path.join(REPO_ROOT,'.ai/17_article_improvement/outputs/article-improvement-outputs.generated.json'),{outputs:[]}).outputs||[]
const selected=outputs.slice(0,batchSize); const snapshot={created_at:new Date().toISOString(),target:'article_improvements',apply_requested:apply,items:selected}
const rollbackId=`article-rollback-${sha256Text(JSON.stringify(snapshot)).slice(0,12)}`
await writeJson(path.join(runRoot,'backups',`${rollbackId}.json`),snapshot)
const log={run_id:rollbackId,mode:apply?'apply_requested_but_repo_local_only':'dry_run',applied:false,reason:apply?'Live article apply not executed by default; proposals are .ai-local and no app/Supabase mutation adapter is configured.':'Dry-run preview only.',items:selected.map((o:any)=>({job_id:o.job_id,article_candidate_id:o.article_candidate_id,source_pack_id:o.source_pack_id}))}
await writeJson(path.join(runRoot,'logs/article-apply-run.generated.json'),log); await writeText(path.join(PLAN_DIR,'article-apply-preview-report.md'),`# Article Apply Preview\n\nMode: ${log.mode}\nApplied: false\nRollback snapshot: ${rollbackId}.json\nItems: ${selected.length}\n`); console.log(JSON.stringify({ok:true,applied:false,items:selected.length,rollback_id:rollbackId},null,2))
