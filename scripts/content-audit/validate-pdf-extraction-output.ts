#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const inputPath=path.join(PLAN_DIR,'pdf-extraction-sample-output.generated.json')
const jsonOutput=path.join(PLAN_DIR,'pdf-extraction-validation.json')
const mdOutput=path.join(PLAN_DIR,'pdf-extraction-validation.md')
const data=readJson<any>(inputPath,{})
const checks=[
 ['json_parses', Boolean(data.generated_at)],
 ['external_upload_false', data.EXTERNAL_UPLOAD_USED===false],
 ['no_dependency_added', data.NEW_DEPENDENCY_ADDED===false],
 ['no_source_pack_created', data.SOURCE_PACK_CREATED===false],
 ['no_embeddings_created', data.EMBEDDINGS_CREATED===false],
 ['no_article_question_mutation', data.ARTICLE_QUESTION_MUTATION===false],
 ['statuses_blocked', data.source_approval_status==='blocked' && data.source_pack_creation_status==='blocked'],
  ['samples_present', Array.isArray(data.samples) && data.samples.length>0],
  ['sample_uploads_false', Array.isArray(data.samples) && data.samples.every((sample:any)=>sample.external_upload_used===false)],
  ['sample_methods_safe', Array.isArray(data.samples) && data.samples.every((sample:any)=>['python_pymupdf_local','python_pypdf_local','unavailable'].includes(sample.extraction_method))],
  ['sample_paths_local', Array.isArray(data.samples) && data.samples.every((sample:any)=>String(sample.file_path??'').includes('/vitruvius-connection/'))],
  ['sample_statuses_blocked', Array.isArray(data.samples) && data.samples.every((sample:any)=>sample.source_approval_status==='blocked' && sample.source_pack_creation_status==='blocked')],
]
const ok=checks.every(([,pass])=>pass)
await writeJson(jsonOutput,{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))})
await writeText(mdOutput,['# PDF Extraction Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n'))
console.log(JSON.stringify({ok,checks:checks.length,outputs:[mdOutput,jsonOutput]},null,2))
if(!ok) process.exit(1)
