#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/18_question_improvement'); await mkdir(path.join(root,'jobs'),{recursive:true}); await mkdir(path.join(root,'reports'),{recursive:true})
const packs=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs/manifests/source-pack-index.generated.json'),{manifests:[]}).manifests||[]
const jobs=Array.from({length:10},(_,i)=>({job_id:`question-improvement-job-${i+1}`,question_candidate_id:`question-candidate-${i+1}`,source_pack_id:packs[i%packs.length]?.source_pack_id||null,mode:'proposal_only',answer_key_change_allowed:false,job_hash:sha256Text(`q${i}`)}))
await writeJson(path.join(root,'jobs/question-improvement-jobs.generated.json'),{generated_at:new Date().toISOString(),pilot_size:jobs.length,jobs}); await writeText(path.join(root,'reports/question-improvement-job-report.md'),`# Question Improvement Job Report\n\nJobs: ${jobs.length}\nPilot scope: 10 questions.\n`); console.log(JSON.stringify({ok:true,jobs:jobs.length},null,2))
