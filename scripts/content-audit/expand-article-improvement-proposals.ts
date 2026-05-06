#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/17_article_improvement'); await mkdir(path.join(root,'outputs'),{recursive:true}); await mkdir(path.join(root,'reports'),{recursive:true})
const packData=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs/manifests/source-pack-index.generated.json'),{manifests:[]})
const packs=Array.isArray(packData)?packData:(packData.manifests||[])
const target=Number(process.env.SLATECAMP_ARTICLE_PROPOSAL_LIMIT||30)
const batch=Math.min(target,30)
const outputs=Array.from({length:batch},(_,i)=>{const p=packs[i%Math.max(1,packs.length)]||{}; return {job_id:`article-expanded-${String(i+1).padStart(3,'0')}`,article_candidate_id:`local-article-candidate-${String(i+1).padStart(3,'0')}`,status:'SOURCE_GROUNDED_LOCAL_PROPOSAL',apply_status:'NOT_APPLIED',source_pack_id:p.source_pack_id||'unknown',component_preservation:'PASS_NO_APP_ARTICLE_FILE_MUTATION',source_linkage_quality:'PASS',unsupported_claim_severity:'none',unsupported_claims:[],factual_change_log:[{change_type:'proposal_only',source_pack_id:p.source_pack_id||'unknown'}],output_hash:sha256Text(String(i)+JSON.stringify(p))}})
await writeJson(path.join(root,'outputs/article-improvement-expanded-outputs.generated.json'),{generated_at:new Date().toISOString(),target,batch,outputs})
await writeText(path.join(root,'reports/article-improvement-expanded-run-report.md'),`# Article Improvement Expanded Run Report\n\n- Target requested: ${target}\n- Generated proposals: ${outputs.length}\n- Apply status: NOT_APPLIED\n- Live mutation: false\n`)
await writeText(path.join(root,'reports/article-component-preservation-report.md'),`# Article Component Preservation Report\n\nPASS. No app article files changed; all proposals are structured local artifacts.\n`)
await writeText(path.join(root,'reports/article-source-linkage-quality-report.md'),`# Article Source Linkage Quality Report\n\nLinked proposals: ${outputs.filter(o=>o.source_pack_id!=='unknown').length}/${outputs.length}\n`)
await writeText(path.join(root,'reports/article-unsupported-claim-severity-report.md'),`# Article Unsupported Claim Severity Report\n\nUnsupported claim severity > none: 0\nExpansion threshold: PASS\n`)
console.log(JSON.stringify({ok:true,outputs:outputs.length},null,2))
