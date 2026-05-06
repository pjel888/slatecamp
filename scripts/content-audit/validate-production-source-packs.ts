#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/16_source_packs')
const idx=readJson<any>(path.join(root,'manifests/source-pack-index.generated.json'),{})
const checks:[string,boolean][]=[]; const seen=new Set<string>(); let chunks:any[]=[]
checks.push(['index_exists',existsSync(path.join(root,'manifests/source-pack-index.generated.json'))])
checks.push(['packs_present',(idx.manifests||[]).length>0])
for(const m of idx.manifests||[]){
 const cs=readJson<any[]>(path.join(root,'packs',m.source_pack_id,'chunks.generated.json'),[])
 const manifest=readJson<any>(path.join(root,'packs',m.source_pack_id,'manifest.json'),{})
 chunks=chunks.concat(cs)
 checks.push([`${m.source_pack_id}_has_id`,!!m.source_pack_id]); checks.push([`${m.source_pack_id}_has_hash`,!!m.source_pack_hash]); checks.push([`${m.source_pack_id}_has_approval`,m.approval_record?.approved_by==='user_governance_approval_this_run']); checks.push([`${m.source_pack_id}_schema_core`,!!(m.source_family&&m.document_code&&m.document_title&&m.version&&m.created_at&&m.generated_by_script_version)]); checks.push([`${m.source_pack_id}_chunk_count_matches`,m.chunk_count===cs.length]); checks.push([`${m.source_pack_id}_index_manifest_consistent`,manifest.source_pack_hash===m.source_pack_hash&&manifest.source_pack_id===m.source_pack_id]); checks.push([`${m.source_pack_id}_conflict_approved_exception`,!m.conflict_summary?.conflict_flag||m.approval_record?.approved_by==='user_governance_approval_this_run']); checks.push([`${m.source_pack_id}_official_hash_or_exception`,(m.official_file_hashes||[]).length>0||m.approval_record?.approved_by==='user_governance_approval_this_run'])
 const hashBase={...manifest}
 delete hashBase.source_pack_hash
 hashBase.validation_status='PENDING_VALIDATION'
 const recomputed=sha256Text(JSON.stringify({...hashBase,chunks:cs.map((c:any)=>c.chunk_hash)}))
 checks.push([`${m.source_pack_id}_source_pack_hash_recomputes`,recomputed===manifest.source_pack_hash])
 for(const c of cs){ const {chunk_hash,...without}=c; checks.push([`${c.chunk_id}_has_hashes`,!!(c.chunk_id&&c.source_pack_id&&c.text_hash&&c.chunk_hash)]); checks.push([`${c.chunk_id}_text_non_empty`,String(c.text||'').trim().length>80]); checks.push([`${c.chunk_id}_text_hash_recomputes`,sha256Text(c.text||'')===c.text_hash]); checks.push([`${c.chunk_id}_chunk_hash_recomputes`,sha256Text(JSON.stringify(without))===chunk_hash]); checks.push([`${c.chunk_id}_no_dupe`,!seen.has(c.chunk_id)]); seen.add(c.chunk_id); checks.push([`${c.chunk_id}_not_article`,c.not_app_article_content===true]) }
}
checks.push(['chunk_count_matches',chunks.length===idx.chunk_count]); checks.push(['no_duplicate_chunk_ids',seen.size===chunks.length])
const ok=checks.every(([,v])=>v); await writeJson(path.join(root,'validation/source-pack-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'})),source_pack_count:(idx.manifests||[]).length,chunk_count:chunks.length}); await writeText(path.join(root,'validation/source-pack-validation-report.md'),['# Production Source-Pack Validation Report','',`Result: ${ok?'PASS':'FAIL'}`,'',`Source packs: ${(idx.manifests||[]).length}`,`Chunks: ${chunks.length}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length,source_packs:(idx.manifests||[]).length,chunks:chunks.length},null,2)); if(!ok) process.exit(1)
