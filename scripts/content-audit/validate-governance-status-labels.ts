#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'

const forbidden = ['approved','canonical','verified_source','production_ready','source_pack_ready','safe_to_rewrite','ready_for_embeddings','ready_for_publication','human_approved','sme_approved']
const allowedDraft = ['DRAFT_SOURCE_PACK_CANDIDATE','DRAFT_CHUNK_CANDIDATE','LOCAL_VALIDATION_ONLY','AI_REVIEWED_NOT_HUMAN_APPROVED','HUMAN_APPROVAL_REQUIRED','SME_APPROVAL_REQUIRED','NOT_PRODUCTION_READY','DO_NOT_PUBLISH','DO_NOT_EMBED_PRODUCTION','DO_NOT_MUTATE_SUPABASE']
const jsonFiles = [
  path.join(PLAN_DIR,'governance-status-label-validation.generated.json'),
  path.join(process.cwd(),'.ai/16_source_packs_draft/manifests/draft-source-pack-index.generated.json'),
  path.join(PLAN_DIR,'draft-claim-linkage-smoke.generated.json'),
  path.join(PLAN_DIR,'draft-article-improvement-prototype/index.generated.json'),
  path.join(PLAN_DIR,'question-bank-dry-run-audit.generated.json'),
  path.join(PLAN_DIR,'admin-local-review-payload.generated.json'),
].filter(existsSync)
const offenders:string[]=[]
const draftLabelHits=new Set<string>()
function scan(value:any, trail:string){
  if(Array.isArray(value)) return value.forEach((v,i)=>scan(v,`${trail}[${i}]`))
  if(value && typeof value==='object') return Object.entries(value).forEach(([k,v])=>{
    const text=String(v??'')
    for(const label of allowedDraft) if(text.includes(label)) draftLabelHits.add(label)
    if(typeof v === 'string') for(const label of forbidden) {
      const low=text.toLowerCase()
      const safeNegated = low.includes(`not_${label}`) || low.includes(`not ${label}`) || low.includes(`not-${label}`) || low.includes(`ai_reviewed_not_human_approved`) || low.includes(`ai_reviewed_not_sme_approved`)
      if(!safeNegated && (low===label || low.includes(label))) offenders.push(`${trail}.${k}=${text}`)
    }
    scan(v,`${trail}.${k}`)
  })
}
for(const f of jsonFiles) scan(readJson<any>(f,{}),path.relative(process.cwd(),f))
const result={generated_at:new Date().toISOString(),ok:offenders.length===0,forbidden_positive_labels:forbidden,allowed_draft_labels:allowedDraft,draft_labels_seen:[...draftLabelHits].sort(),production_gates:'BLOCKED',json_files_scanned:jsonFiles.map(f=>path.relative(process.cwd(),f)),offenders}
await writeJson(path.join(PLAN_DIR,'governance-status-label-validation.generated.json'),result)
await writeText(path.join(PLAN_DIR,'governance-status-label-validation.md'),['# Governance Status Label Validation','',`Result: ${result.ok?'PASS':'FAIL'}`,'',`JSON files scanned: ${result.json_files_scanned.length}`,`Allowed draft labels seen: ${result.draft_labels_seen.join(', ') || 'none yet'}`,'','Production gates remain BLOCKED.','',...offenders.map(o=>`- ${o}`),''].join('\n'))
console.log(JSON.stringify({ok:result.ok,offenders:offenders.length},null,2)); if(!result.ok) process.exit(1)
