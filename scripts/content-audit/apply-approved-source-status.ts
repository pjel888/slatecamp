#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { PLAN_DIR, REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const apply=process.argv.includes('--apply')
const batchArg=process.argv.find(a=>a.startsWith('--batch-size=')); const batchSize=batchArg?Number(batchArg.split('=')[1]):25
if(batchSize>50) throw new Error('Batch size limit exceeded: maximum 50')
const runRoot=path.join(REPO_ROOT,'.ai/19_controlled_apply'); await mkdir(path.join(runRoot,'backups'),{recursive:true}); await mkdir(path.join(runRoot,'logs'),{recursive:true});

const packs=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs/manifests/source-pack-index.generated.json'),{manifests:[]}).manifests||[]
const selected=packs.slice(0,batchSize); const snapshot={created_at:new Date().toISOString(),target:'source_status',apply_requested:apply,items:selected}
const rollbackId=`source-status-rollback-${sha256Text(JSON.stringify(snapshot)).slice(0,12)}`
await writeJson(path.join(runRoot,'backups',`${rollbackId}.json`),snapshot)
const log={run_id:rollbackId,mode:apply?'local_source_status_apply':'dry_run',local_applied:apply?true:false,live_applied:false,supabase_mutation:false,reason:apply?'Applied to local .ai source-pack status log only; no Supabase mutation.':'Dry-run preview only.',items:selected.map((m:any)=>({source_pack_id:m.source_pack_id,validation_status:m.validation_status,approved_by:m.approved_by}))}
await writeJson(path.join(runRoot,'logs/source-status-apply-run.generated.json'),log); await writeText(path.join(PLAN_DIR,'source-status-apply-preview-report.md'),`# Source Status Apply Preview\n\nMode: ${log.mode}\nLocal applied: ${log.local_applied}\nLive applied: false\nRollback snapshot: ${rollbackId}.json\nItems: ${selected.length}\nSupabase mutation: false\n`); console.log(JSON.stringify({ok:true,local_applied:log.local_applied,live_applied:false,items:selected.length,rollback_id:rollbackId},null,2))
