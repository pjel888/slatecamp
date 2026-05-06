#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const apply=process.argv.includes('--apply')
const hasEnv=!!(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL)&&!!process.env.SUPABASE_SERVICE_ROLE_KEY
if(apply&&!hasEnv) throw new Error('Apply blocked: missing Supabase URL/service role environment. Dry-run is safe and default.')

const packs=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs/manifests/source-pack-index.generated.json'),{manifests:[]}).manifests||[]
const payload={generated_at:new Date().toISOString(),sync_type:'source_verification',dry_run:!apply,apply_requested:apply,db_write_attempted:false,table_targets:['ai_audit_runs','ai_audit_items','ai_audit_findings','ai_change_proposals'],items:packs.map((m:any)=>({target_type:'source',target_id:m.source_pack_id,status:'approved',phase:'approved',metadata:{document_code:m.document_code,source_pack_hash:m.source_pack_hash,approval_record:m.approval_record}})),payload_hash:sha256Text(JSON.stringify(packs.map((m:any)=>m.source_pack_hash)))}
await writeJson(path.join(PLAN_DIR,'admin-sync-source-verification-payload.generated.json'),payload); await writeText(path.join(PLAN_DIR,'admin-sync-source-verification-report.md'),`# Source Verification Admin Sync Report\n\nDry-run: ${payload.dry_run}\nDB write attempted: false\nItems: ${payload.items.length}\n`); console.log(JSON.stringify({ok:true,dry_run:payload.dry_run,items:payload.items.length},null,2))
