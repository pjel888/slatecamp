#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/18_question_improvement'); const os=readJson<any>(path.join(root,'outputs/question-improvement-outputs.generated.json'),{outputs:[]}).outputs||[]
await writeText(path.join(root,'reports/question-improvement-diff-report.md'),['# Question Improvement Diff Report','',`Diffs generated: ${os.length}`,'',...os.map((o:any)=>`- ${o.job_id}: ${o.question_candidate_id}`),''].join('\n')); console.log(JSON.stringify({ok:true,diffs:os.length},null,2))
