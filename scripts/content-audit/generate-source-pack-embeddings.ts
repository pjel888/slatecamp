#!/usr/bin/env bun
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { REPO_ROOT, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const mode=process.argv.includes('--provider')?'provider':process.argv.includes('--local')?'local':'dry-run'
if(mode==='provider') throw new Error('Provider embedding mode is not implemented in this safe pipeline. Use dry-run or implement a reviewed provider adapter with explicit boundary approval.')
const emb=path.join(REPO_ROOT,'.ai/16_source_packs/embeddings'); const lines=readFileSync(path.join(emb,'embedding-inputs.generated.jsonl'),'utf8').trim().split(/\n/).filter(Boolean).map(l=>JSON.parse(l))
const rows=lines.map((r:any)=>({embedding_id:`embedding-${r.chunk_hash}`,source_pack_id:r.source_pack_id,chunk_id:r.chunk_id,text_hash:r.text_hash,input_hash:r.input_hash,mode,provider_call_performed:false,embedding_created:mode==='dry-run'?false:false,vector_hash:mode==='dry-run'?null:sha256Text(r.text).slice(0,32),idempotency_key:sha256Text(`${r.source_pack_id}:${r.chunk_id}:${r.text_hash}:${mode}`)}))
await writeJson(path.join(emb,'embedding-manifest.generated.json'),{generated_at:new Date().toISOString(),mode,provider_call_performed:false,row_count:rows.length,embeddings_created:rows.filter(r=>r.embedding_created).length,rows})
await writeText(path.join(emb,'embedding-run-report.md'),`# Embedding Run Report\n\nMode: ${mode}\nProvider call performed: false\nInput rows: ${rows.length}\nEmbeddings created: ${rows.filter(r=>r.embedding_created).length}\n`)
console.log(JSON.stringify({ok:true,mode,rows:rows.length,provider_call_performed:false},null,2))
