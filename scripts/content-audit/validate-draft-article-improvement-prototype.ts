#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const data=readJson<any>(path.join(PLAN_DIR,'draft-article-improvement-prototype/index.generated.json'),{})
const ps=data.prototypes||[]
const checks=[['json_parses',!!data.generated_at],['prototypes_present',ps.length>0],['all_local_only',ps.every((p:any)=>p.allowed_use==='LOCAL_VALIDATION_ONLY')],['not_production_ready',ps.every((p:any)=>p.production_status==='NOT_PRODUCTION_READY')],['no_mutations',ps.every((p:any)=>!p.article_file_mutation&&!p.question_file_mutation&&!p.supabase_mutation&&!p.embeddings_created)],['unsupported_claims_listed',ps.every((p:any)=>Array.isArray(p.unsupported_claims))],['changed_factual_claims_listed',ps.every((p:any)=>Array.isArray(p.changed_factual_claims))]] as [string,boolean][]
const ok=checks.every(([,p])=>p); await writeJson(path.join(PLAN_DIR,'draft-article-improvement-prototype/validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))}); await writeText(path.join(PLAN_DIR,'draft-article-improvement-prototype/validation.md'),['# Draft Article Prototype Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok)process.exit(1)
