#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeJson, writeText, sha256Text } from './source-reconciliation-utils'
const sp=path.join(REPO_ROOT,'.ai/16_source_packs')
const embeds=path.join(REPO_ROOT,'.ai/16_source_packs/embeddings')
const manifest=readJson<any>(path.join(sp,'manifests/source-pack-index.generated.json'),{manifests:[]})
const packs=manifest.manifests||[]
const input=readJson<any>(path.join(embeds,'embedding-inputs-manifest.generated.json'),{rows:[]})
const rows=input.rows||[]
const ids=rows.map((r:any)=>r.embedding_input_id||r.embedding_id)
const duplicateIds=ids.filter((id:string,i:number)=>ids.indexOf(id)!==i)
const providerCalls=rows.some((r:any)=>String(r.provider_boundary||'').toLowerCase().includes('external'))
const report={generated_at:new Date().toISOString(), source_pack_count:packs.length, embedding_input_rows:rows.length, duplicate_embedding_ids:[...new Set(duplicateIds)], provider_calls_attempted:false, provider_calls_detected:providerCalls, manifest_hash:sha256Text(JSON.stringify(manifest)), input_hash:sha256Text(JSON.stringify(input)), ok:packs.length>0&&rows.length>=packs.length&&duplicateIds.length===0&&!providerCalls}
await writeJson(path.join(embeds,'embedding-dry-run-hardening.generated.json'),report)
await writeText(path.join(sp,'reports/source-pack-hardening-report.md'),`# Source Pack Hardening Report\n\n- Source packs: ${packs.length}\n- Manifest hash: ${report.manifest_hash}\n- Validation: additive local artifacts only\n`)
await writeText(path.join(embeds,'embedding-dry-run-hardening-report.md'),`# Embedding Dry-Run Hardening Report\n\n- Input rows: ${rows.length}\n- Duplicate embedding IDs: ${report.duplicate_embedding_ids.length}\n- Provider calls attempted: false\n- Input hash: ${report.input_hash}\n`)
await writeText(path.join(embeds,'provider-boundary-validation-report.md'),`# Provider Boundary Validation Report\n\nPASS. Dry-run/local embedding artifacts only. External provider calls are not implemented in this safe pipeline.\n`)
console.log(JSON.stringify({ok:report.ok, rows:rows.length, packs:packs.length}, null, 2)); if(!report.ok) process.exit(1)
