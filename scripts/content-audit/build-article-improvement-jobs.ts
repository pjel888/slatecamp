#!/usr/bin/env bun
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { REPO_ROOT, readJson, sha256Text, writeJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/17_article_improvement'); await mkdir(path.join(root,'jobs'),{recursive:true}); await mkdir(path.join(root,'reports'),{recursive:true})
const idx=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs/manifests/source-pack-index.generated.json'),{manifests:[]})
const jobs=(idx.manifests||[]).slice(0,3).map((m:any,i:number)=>({job_id:`article-improvement-job-${i+1}`,article_candidate_id:`source-grounded-article-${i+1}`,source_pack_id:m.source_pack_id,document_code:m.document_code,risk_tier:i===1?'high':'medium',mode:'proposal_only',provider_boundary:'NO_FULL_SOURCE_UPLOAD; use local source-pack excerpts only',preserve_custom_ui_components:true,created_at:new Date().toISOString(),job_hash:sha256Text(`${m.source_pack_id}:${i}`)}))
await writeJson(path.join(root,'jobs/article-improvement-jobs.generated.json'),{generated_at:new Date().toISOString(),pilot_size:jobs.length,jobs}); await writeText(path.join(root,'reports/article-improvement-job-report.md'),`# Article Improvement Job Report\n\nJobs: ${jobs.length}\nPilot scope: 3 articles.\n`); console.log(JSON.stringify({ok:true,jobs:jobs.length},null,2))
