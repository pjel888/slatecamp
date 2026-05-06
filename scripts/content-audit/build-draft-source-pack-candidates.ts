#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { PLAN_DIR, REPO_ROOT, VITRUVIUS_DIR, readJson, writeCsv, writeJson, writeText } from './source-reconciliation-utils'
import { extractPdfLocatorsLocal } from './pdf-locator-extraction-utils'

type AnyRow = Record<string, any>
const DRAFT_ROOT=path.join(REPO_ROOT,'.ai/16_source_packs_draft')
const matrix=readJson<{rows?:AnyRow[]}>(path.join(PLAN_DIR,'source-reconciliation-matrix.generated.json'),{rows:[]}).rows??[]
const locators=readJson<{rows?:AnyRow[]}>(path.join(PLAN_DIR,'source-locator-evidence.generated.json'),{rows:[]}).rows??[]
const packets=readJson<{packets?:AnyRow[]}>(path.join(PLAN_DIR,'source-human-sme-packet-prep.generated.json'),{packets:[]}).packets??[]
function slug(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'source'}
function absLocal(p:string){return path.isAbsolute(p)?p:path.join(VITRUVIUS_DIR,p)}
function textHash(t:string){return createHash('sha256').update(t).digest('hex')}
const priorities=['RA 11285','RA 11201','DOE DC2019-11-0014','BP 344','PD 1096','RA 9514','RA 9266']
const selected=priorities.map(code=>matrix.find(r=>`${r.document_code} ${r.source_family}`.includes(code))).filter(Boolean) as AnyRow[]
const manifests:AnyRow[]=[]
for(const row of selected){
 const locator=locators.find(l=>l.source_family===row.source_family)||{}
 const packet=packets.find(p=>p.source_family===row.source_family)||{}
 const id=`draft-${slug(row.document_code||row.source_family)}`
 const packDir=path.join(DRAFT_ROOT,'packs',id); await mkdir(packDir,{recursive:true})
 const pdfPath=row.local_raw_pdf_path?absLocal(row.local_raw_pdf_path):''
 const extraction=pdfPath?extractPdfLocatorsLocal(pdfPath,row.local_raw_pdf_hash||'',2):{ok:false,pages:[],external_upload_used:false,extraction_method:'unavailable'} as any
 const chunks=(extraction.pages||[]).filter((p:any)=>p.text_preview).slice(0,3).map((p:any,i:number)=>({
   chunk_id:`${id}-chunk-${i+1}`,
   source_family:row.source_family,
   locator:`page ${p.page_number}`,
   text_hash:textHash(p.text_preview),
   text_preview:p.text_preview,
   draft_status:'DRAFT_CHUNK_CANDIDATE',
   allowed_use:'LOCAL_VALIDATION_ONLY',
   ai_review_status:'AI_REVIEWED_NOT_HUMAN_APPROVED',
   not_production_ready:true,
   human_review_required:true,
   sme_review_required:String(row.sme_review_required)==='true'||String(row.risk_tier).toUpperCase()==='HIGH',
   production_embedding_status:'DO_NOT_EMBED_PRODUCTION',
   publication_status:'DO_NOT_PUBLISH'
 }))
 const manifest={
   draft_pack_id:id, source_family:row.source_family, document_code:row.document_code, document_title:row.document_title,
   draft_status:'DRAFT_SOURCE_PACK_CANDIDATE', production_status:'BLOCKED', allowed_use:'LOCAL_VALIDATION_ONLY',
   ai_review_status:'AI_REVIEWED_NOT_HUMAN_APPROVED', human_approval_gate:'HUMAN_APPROVAL_REQUIRED', sme_approval_gate:(String(row.sme_review_required)==='true'||String(row.risk_tier).toUpperCase()==='HIGH')?'SME_APPROVAL_REQUIRED':'HUMAN_APPROVAL_REQUIRED',
   publication_status:'DO_NOT_PUBLISH', embedding_status:'DO_NOT_EMBED_PRODUCTION', supabase_status:'DO_NOT_MUTATE_SUPABASE',
   human_review_required:true, sme_review_required:String(row.sme_review_required)==='true'||String(row.risk_tier).toUpperCase()==='HIGH',
   source_approval_status:'BLOCKED', official_evidence_summary:{official_pdf_hash:row.official_pdf_hash,official_pdf_url:row.official_pdf_url,issuing_body:row.official_publisher_or_issuing_body},
   local_file_hashes:[row.local_raw_pdf_hash].filter(Boolean), locator_summary:{locator_status:locator.locator_status,page_locator_summary:locator.page_locator_summary,section_locator_summary:locator.section_locator_summary,confidence:locator.locator_confidence}, conflict_summary:{conflict_flag:row.conflict_flag,conflict_type:row.conflict_type,packet_recommendation:packet.packet_recommendation},
   provider_boundary:'LOCAL_ONLY_NO_EXTERNAL_UPLOAD', copyright_boundary:'LOCAL_VALIDATION_ONLY_NO_PUBLICATION', chunks_created_for_local_validation_only:chunks.length>0,
   draft_chunk_candidate_count:chunks.length, embeddings_created:false, article_rewrites_created:false, question_edits_created:false, not_production_ready:true
 }
 await writeJson(path.join(packDir,'manifest.json'),manifest); await writeJson(path.join(packDir,'chunks.generated.json'),{draft_pack_id:id,chunks})
 await writeText(path.join(packDir,'validation.md'),`# ${id} validation\n\n- draft_status: DRAFT_SOURCE_PACK_CANDIDATE\n- production_status: BLOCKED\n- chunks: ${chunks.length}\n- embeddings_created: false\n- article_rewrites_created: false\n- question_edits_created: false\n`)
 manifests.push(manifest)
}
await mkdir(path.join(DRAFT_ROOT,'manifests'),{recursive:true}); await mkdir(path.join(DRAFT_ROOT,'validation'),{recursive:true})
await writeJson(path.join(DRAFT_ROOT,'manifests/draft-source-pack-index.generated.json'),{generated_at:new Date().toISOString(),draft_pack_count:manifests.length,draft_chunk_count:manifests.reduce((a,m)=>a+m.draft_chunk_candidate_count,0),production_status:'BLOCKED',manifests})
await writeCsv(path.join(DRAFT_ROOT,'manifests/draft-source-pack-index.generated.csv'),manifests,['draft_pack_id','source_family','document_code','draft_status','production_status','allowed_use','human_review_required','sme_review_required','draft_chunk_candidate_count','not_production_ready'])
await writeText(path.join(DRAFT_ROOT,'README.md'),'# Draft Source Pack Candidates\n\nLocal validation only. Not production source packs. Do not publish, embed in production, or mutate Supabase.\n')
await writeText(path.join(PLAN_DIR,'phase014-draft-source-pack-candidate-report.md'),`# Phase 0.14 Draft Source-Pack Candidate Report\n\nStatus: COMPLETE\n\nDraft packs: ${manifests.length}\nDraft chunks: ${manifests.reduce((a,m)=>a+m.draft_chunk_candidate_count,0)}\n\nAll outputs are DRAFT_SOURCE_PACK_CANDIDATE / LOCAL_VALIDATION_ONLY / NOT_PRODUCTION_READY. Production gates remain BLOCKED.\n`)
console.log(JSON.stringify({ok:true,draft_packs:manifests.length,draft_chunks:manifests.reduce((a,m)=>a+m.draft_chunk_candidate_count,0)},null,2))
