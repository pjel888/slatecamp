#!/usr/bin/env bun
import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { REPO_ROOT, readJson, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/16_source_packs_draft')
const idx=readJson<any>(path.join(root,'manifests/draft-source-pack-index.generated.json'),{})
const checks:[string,boolean][]=[
 ['index_json_parses',Array.isArray(idx.manifests)],['draft_packs_present',(idx.manifests||[]).length>0],['production_blocked',idx.production_status==='BLOCKED'],
 ['all_draft_status',(idx.manifests||[]).every((m:any)=>m.draft_status==='DRAFT_SOURCE_PACK_CANDIDATE')],['all_local_only',(idx.manifests||[]).every((m:any)=>m.allowed_use==='LOCAL_VALIDATION_ONLY')],
 ['all_not_production_ready',(idx.manifests||[]).every((m:any)=>m.not_production_ready===true)],['no_embeddings',(idx.manifests||[]).every((m:any)=>m.embeddings_created===false)],
 ['no_article_rewrites',(idx.manifests||[]).every((m:any)=>m.article_rewrites_created===false)],['no_question_edits',(idx.manifests||[]).every((m:any)=>m.question_edits_created===false)],
 ['high_risk_requires_sme',(idx.manifests||[]).every((m:any)=>m.sme_review_required || !String(m.source_family).match(/RA|PD|BP|DOE/))]
]
for(const m of idx.manifests||[]){ const chunksPath=path.join(root,'packs',m.draft_pack_id,'chunks.generated.json'); const chunks=readJson<any>(chunksPath,{chunks:[]}).chunks||[]; checks.push([`${m.draft_pack_id}_chunks_local_only`,chunks.every((c:any)=>c.draft_status==='DRAFT_CHUNK_CANDIDATE'&&c.allowed_use==='LOCAL_VALIDATION_ONLY'&&c.not_production_ready===true)]) }
const text=existsSync(root)?readFileSync(path.join(root,'manifests/draft-source-pack-index.generated.json'),'utf8'):''
checks.push(['no_forbidden_positive_labels',!/(verified_source|(?<!NOT_)production_ready|source_pack_ready|safe_to_rewrite|ready_for_embeddings|ready_for_publication|(?<!NOT_)human_approved|(?<!NOT_)sme_approved)/i.test(text)])
const ok=checks.every(([,p])=>p); await writeJson(path.join(root,'validation/draft-source-pack-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))}); await writeText(path.join(root,'validation/draft-source-pack-validation.md'),['# Draft Source Pack Candidate Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
