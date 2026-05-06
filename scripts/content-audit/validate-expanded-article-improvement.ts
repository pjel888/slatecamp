#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/17_article_improvement')
const data=readJson<any>(path.join(root,'outputs/article-improvement-expanded-outputs.generated.json'),{outputs:[]})
const outs=data.outputs||[]
const checks=[{check:'proposal_count_10_to_30',pass:outs.length>=10&&outs.length<=30},{check:'not_applied',pass:outs.every((o:any)=>o.apply_status==='NOT_APPLIED')},{check:'component_pass',pass:outs.every((o:any)=>String(o.component_preservation).startsWith('PASS'))},{check:'source_linked',pass:outs.every((o:any)=>o.source_pack_id&&o.source_pack_id!=='unknown')},{check:'unsupported_none',pass:outs.every((o:any)=>o.unsupported_claim_severity==='none')}]
const ok=checks.every(c=>c.pass)
await writeText(path.join(root,'reports/article-expanded-validation-report.md'),`# Article Expanded Validation Report\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok,checks:checks.length,outputs:outs.length},null,2)); if(!ok) process.exit(1)
