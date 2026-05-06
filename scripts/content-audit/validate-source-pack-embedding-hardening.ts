#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const embeds=path.join(REPO_ROOT,'.ai/16_source_packs/embeddings')
const h=readJson<any>(path.join(embeds,'embedding-dry-run-hardening.generated.json'),{})
const checks=[{check:'source_pack_count_positive',pass:h.source_pack_count>0},{check:'embedding_rows_present',pass:h.embedding_input_rows>=h.source_pack_count},{check:'no_duplicate_embedding_ids',pass:(h.duplicate_embedding_ids||[]).length===0},{check:'no_provider_calls_attempted',pass:h.provider_calls_attempted===false},{check:'no_external_provider_boundary_detected',pass:h.provider_calls_detected===false}]
const ok=checks.every(c=>c.pass)
await writeText(path.join(embeds,'embedding-hardening-validation-report.md'),`# Embedding Hardening Validation Report\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
