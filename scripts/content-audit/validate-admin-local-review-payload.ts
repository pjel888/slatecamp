#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const p=readJson<any>(path.join(PLAN_DIR,'admin-local-review-payload.generated.json'),{})
const checks=[['json_parses',!!p.generated_at],['dry_run_true',p.dry_run===true],['db_write_false',p.db_write_attempted===false],['admin_live_sync_false',p.admin_live_sync===false],['local_only',p.allowed_use==='LOCAL_VALIDATION_ONLY'],['not_production_ready',p.production_status==='NOT_PRODUCTION_READY'],['no_supabase_mutation',p.supabase_status==='DO_NOT_MUTATE_SUPABASE']] as [string,boolean][]
const ok=checks.every(([,v])=>v); await writeJson(path.join(PLAN_DIR,'admin-local-review-payload-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))}); await writeText(path.join(PLAN_DIR,'admin-local-review-payload-validation.md'),['# Admin Local Review Payload Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok)process.exit(1)
