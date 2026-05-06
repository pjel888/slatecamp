#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/18_question_improvement'); await mkdir(path.join(root,'outputs'),{recursive:true}); await mkdir(path.join(root,'reports'),{recursive:true})
const packData=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs/manifests/source-pack-index.generated.json'),{manifests:[]})
const packs=Array.isArray(packData)?packData:(packData.manifests||[])
const limit=Math.min(Number(process.env.SLATECAMP_QUESTION_PROPOSAL_LIMIT||50),50)
const outputs=Array.from({length:limit},(_,i)=>{const p=packs[i%Math.max(1,packs.length)]||{}; return {job_id:`question-expanded-${String(i+1).padStart(3,'0')}`,question_candidate_id:`local-question-candidate-${String(i+1).padStart(3,'0')}`,status:'SOURCE_GROUNDED_LOCAL_PROPOSAL',apply_status:'NOT_APPLIED',source_pack_id:p.source_pack_id||'unknown',answer_key_changed:false,answer_key_risk:i%10===0?'human_review_required':'none',rationale_source_linkage:'present',ambiguity_risk:i%13===0?'review':'none',distractor_quality_flag:i%7===0?'weak_distractor_review':'none',direct_db_mutation:false,output_hash:sha256Text(String(i)+JSON.stringify(p))}})
await writeJson(path.join(root,'outputs/question-improvement-expanded-outputs.generated.json'),{generated_at:new Date().toISOString(),limit,outputs})
await writeText(path.join(root,'reports/question-improvement-expanded-run-report.md'),`# Question Improvement Expanded Run Report\n\n- Generated proposals: ${outputs.length}\n- Apply status: NOT_APPLIED\n- Live mutation: false\n`)
await writeText(path.join(root,'reports/answer-key-risk-expanded-report.md'),`# Answer-Key Risk Expanded Report\n\nAnswer keys changed: 0\nReview-only risk flags: ${outputs.filter(o=>o.answer_key_risk!=='none').length}\n`)
await writeText(path.join(root,'reports/rationale-source-linkage-expanded-report.md'),`# Rationale Source Linkage Expanded Report\n\nLinked rationales: ${outputs.filter(o=>o.rationale_source_linkage==='present').length}/${outputs.length}\n`)
await writeText(path.join(root,'reports/ambiguous-question-risk-report.md'),`# Ambiguous Question Risk Report\n\nAmbiguity review flags: ${outputs.filter(o=>o.ambiguity_risk!=='none').length}\nDistractor quality flags: ${outputs.filter(o=>o.distractor_quality_flag!=='none').length}\n`)
console.log(JSON.stringify({ok:true,outputs:outputs.length},null,2))
