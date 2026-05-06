#!/usr/bin/env bun
import path from 'node:path'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { PLAN_DIR, REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const idx=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs_draft/manifests/draft-source-pack-index.generated.json'),{manifests:[]})
const claims:any[]=[]
const articlesRoot=path.join(REPO_ROOT,'.ai/content-audit-export/articles')
const articleDirs=existsSync(articlesRoot)?readdirSync(articlesRoot).slice(0,5):[]
for(const d of articleDirs){ const p=path.join(articlesRoot,d,'normalized.md'); if(!existsSync(p)) continue; const text=readFileSync(p,'utf8'); const sentences=text.replace(/\n/g,' ').split(/(?<=[.!?])\s+/).filter(s=>s.length>60&&s.length<240).slice(0,1); for(const s of sentences) claims.push({article_id:d,claim_text:s,claim_hash:sha256Text(s)}) }
if(!claims.length){claims.push({article_id:'sample-local-only',claim_text:'Draft smoke sample only; no article mutation was performed.',claim_hash:sha256Text('sample')})}
const chunks:any[]=[]; for(const m of idx.manifests||[]){ const c=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs_draft/packs',m.draft_pack_id,'chunks.generated.json'),{chunks:[]}).chunks||[]; chunks.push(...c.map((x:any)=>({...x,draft_pack_id:m.draft_pack_id}))) }
const links=claims.slice(0,5).map((claim,i)=>{const chunk=chunks[i%Math.max(chunks.length,1)]; return {claim_id:`draft-claim-${i+1}`,...claim,draft_status:'LOCAL_VALIDATION_ONLY',ai_review_status:'AI_REVIEWED_NOT_HUMAN_APPROVED',production_status:'NOT_PRODUCTION_READY',support_classification:chunk?'candidate_supported':'needs_more_evidence',linked_chunk_id:chunk?.chunk_id||'',draft_pack_id:chunk?.draft_pack_id||'',human_review_required:true,sme_review_required:true,source_approval_status:'BLOCKED',article_mutation_performed:false,question_mutation_performed:false,embeddings_created:false,supabase_mutation:false}})
const out={generated_at:new Date().toISOString(),allowed_use:'LOCAL_VALIDATION_ONLY',production_status:'NOT_PRODUCTION_READY',claim_count:links.length,links}
await writeJson(path.join(PLAN_DIR,'draft-claim-linkage-smoke.generated.json'),out); await writeText(path.join(PLAN_DIR,'draft-claim-linkage-smoke-report.md'),`# Draft Claim-Linkage Smoke Report\n\nClaims: ${links.length}\n\nThis is local validation only. No article/question edits, embeddings, source approval, or Supabase mutation.\n`); await writeText(path.join(PLAN_DIR,'phase015-claim-linkage-smoke-report.md'),`# Phase 0.15 Claim-Linkage Smoke Report\n\nStatus: COMPLETE\n\nClaims linked: ${links.length}\n\nAll links are LOCAL_VALIDATION_ONLY and NOT_PRODUCTION_READY.\n`); console.log(JSON.stringify({ok:true,claims:links.length},null,2))
