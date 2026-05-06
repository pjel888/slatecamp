#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const apply=process.argv.includes('--apply')
const hasEnv=!!(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL)&&!!process.env.SUPABASE_SERVICE_ROLE_KEY
if(apply&&!hasEnv) throw new Error('Apply blocked: missing Supabase URL/service role environment. Dry-run is safe and default.')

const outs=readJson<any>(path.join(REPO_ROOT,'.ai/18_question_improvement/outputs/question-improvement-outputs.generated.json'),{outputs:[]}).outputs||[]
const payload={generated_at:new Date().toISOString(),sync_type:'question_improvement',dry_run:!apply,apply_requested:apply,db_write_attempted:false,items:outs.map((o:any)=>({target_type:'question',target_id:o.question_candidate_id,status:o.answer_key_risk==='none'?'correction_proposed':'needs_human_review',phase:'tier3_correction_proposal',metadata:o})),payload_hash:sha256Text(JSON.stringify(outs.map((o:any)=>o.output_hash)))}
await writeJson(path.join(PLAN_DIR,'admin-sync-question-improvement-payload.generated.json'),payload); await writeText(path.join(PLAN_DIR,'admin-sync-question-improvement-report.md'),`# Question Improvement Admin Sync Report\n\nDry-run: ${payload.dry_run}\nDB write attempted: false\nItems: ${payload.items.length}\n`); console.log(JSON.stringify({ok:true,dry_run:payload.dry_run,items:payload.items.length},null,2))
