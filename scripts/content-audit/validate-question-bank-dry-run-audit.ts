#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const data=readJson<any>(path.join(PLAN_DIR,'question-bank-dry-run-audit.generated.json'),{})
const fs=data.findings||[]
const checks=[['json_parses',!!data.generated_at],['findings_present',fs.length>0],['audit_only',fs.every((f:any)=>f.allowed_use==='LOCAL_VALIDATION_ONLY')],['no_question_edits',fs.every((f:any)=>!f.question_edit_performed&&!f.answer_key_changed)],['no_supabase_mutation',fs.every((f:any)=>!f.supabase_mutation)]] as [string,boolean][]
const ok=checks.every(([,p])=>p); await writeJson(path.join(PLAN_DIR,'question-bank-dry-run-audit-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))}); await writeText(path.join(PLAN_DIR,'question-bank-dry-run-audit-validation.md'),['# Question Bank Dry-Run Audit Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok)process.exit(1)
