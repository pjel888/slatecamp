#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/18_question_improvement')
const outs=readJson<any>(path.join(root,'outputs/question-improvement-expanded-outputs.generated.json'),{outputs:[]}).outputs||[]
const checks=[{check:'proposal_count_50',pass:outs.length===50},{check:'not_applied',pass:outs.every((o:any)=>o.apply_status==='NOT_APPLIED')},{check:'no_answer_key_changes',pass:outs.every((o:any)=>o.answer_key_changed===false)},{check:'source_linked',pass:outs.every((o:any)=>o.source_pack_id&&o.source_pack_id!=='unknown')},{check:'rationale_linkage_present',pass:outs.every((o:any)=>o.rationale_source_linkage==='present')},{check:'ambiguity_flags_present',pass:outs.every((o:any)=>typeof o.ambiguity_risk==='string')},{check:'distractor_flags_present',pass:outs.every((o:any)=>typeof o.distractor_quality_flag==='string')},{check:'no_db_mutation',pass:outs.every((o:any)=>o.direct_db_mutation===false)}]
const ok=checks.every(c=>c.pass)
await writeText(path.join(root,'reports/question-expanded-validation-report.md'),`# Question Expanded Validation Report\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok,checks:checks.length,outputs:outs.length},null,2)); if(!ok) process.exit(1)
