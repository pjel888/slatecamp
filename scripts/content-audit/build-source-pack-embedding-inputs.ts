#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/16_source_packs'); const emb=path.join(root,'embeddings'); await mkdir(emb,{recursive:true})
const idx=readJson<any>(path.join(root,'manifests/source-pack-index.generated.json'),{manifests:[]}); const rows:any[]=[]
for(const m of idx.manifests||[]) for(const c of readJson<any[]>(path.join(root,'packs',m.source_pack_id,'chunks.generated.json'),[])){ const id=`emb-input-${c.chunk_hash}`; rows.push({embedding_input_id:id,source_pack_id:c.source_pack_id,chunk_id:c.chunk_id,text:c.text,text_hash:c.text_hash,chunk_hash:c.chunk_hash,provider_boundary:'NO_PROVIDER_CALL_WITHOUT_EXPLICIT_FLAG',input_hash:sha256Text(JSON.stringify({id,text_hash:c.text_hash,chunk_hash:c.chunk_hash}))}) }
await writeText(path.join(emb,'embedding-inputs.generated.jsonl'),rows.map(r=>JSON.stringify(r)).join('\n')+'\n'); await writeJson(path.join(emb,'embedding-inputs-manifest.generated.json'),{generated_at:new Date().toISOString(),row_count:rows.length,mode:'input_build_only',rows:rows.map(({text:_text,...r})=>r)}); console.log(JSON.stringify({ok:true,rows:rows.length},null,2))
