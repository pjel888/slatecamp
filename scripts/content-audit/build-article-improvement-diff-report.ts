#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/17_article_improvement'); const os=readJson<any>(path.join(root,'outputs/article-improvement-outputs.generated.json'),{outputs:[]}).outputs||[]
await writeText(path.join(root,'reports/article-improvement-diff-report.md'),['# Article Improvement Diff Report','',`Diffs generated: ${os.length}`,'',...os.map((o:any)=>`- ${o.job_id}: ${o.article_candidate_id} -> ${o.source_pack_id}`),''].join('\n')); console.log(JSON.stringify({ok:true,diffs:os.length},null,2))
