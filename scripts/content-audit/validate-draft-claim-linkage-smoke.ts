#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const data=readJson<any>(path.join(PLAN_DIR,'draft-claim-linkage-smoke.generated.json'),{})
const links=data.links||[]
const checks=[['json_parses',!!data.generated_at],['links_present',links.length>0],['all_local_only',links.every((l:any)=>l.draft_status==='LOCAL_VALIDATION_ONLY')],['no_mutations',links.every((l:any)=>!l.article_mutation_performed&&!l.question_mutation_performed&&!l.embeddings_created&&!l.supabase_mutation)],['no_positive_approval_labels',!JSON.stringify(data).match(/verified_source|(?<!NOT_)production_ready|safe_to_rewrite|ready_for_embeddings|(?<!NOT_)human_approved|(?<!NOT_)sme_approved/i)]] as [string,boolean][]
const ok=checks.every(([,p])=>p); await writeJson(path.join(PLAN_DIR,'draft-claim-linkage-smoke-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))}); await writeText(path.join(PLAN_DIR,'draft-claim-linkage-smoke-validation.md'),['# Draft Claim-Linkage Smoke Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok)process.exit(1)
