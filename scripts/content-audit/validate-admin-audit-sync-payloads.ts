#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, readJson, writeJson, writeText } from './source-reconciliation-utils'
const files=['admin-sync-source-verification-payload.generated.json','admin-sync-article-improvement-payload.generated.json','admin-sync-question-improvement-payload.generated.json']
const payloads=files.map(f=>readJson<any>(path.join(PLAN_DIR,f),{}))
const checks:[string,boolean][]= [['payloads_present',payloads.every(p=>!!p.generated_at)],['dry_run_default',payloads.every(p=>p.dry_run===true)],['db_write_false',payloads.every(p=>p.db_write_attempted===false)],['items_present',payloads.every(p=>Array.isArray(p.items)&&p.items.length>0)],['payload_hashes_present',payloads.every(p=>!!p.payload_hash)]]
const ok=checks.every(([,v])=>v); await writeJson(path.join(PLAN_DIR,'admin-audit-sync-validation.generated.json'),{ok,checks:checks.map(([name,pass])=>({name,status:pass?'PASS':'FAIL'}))}); await writeText(path.join(PLAN_DIR,'admin-audit-sync-validation-report.md'),['# Admin Audit Sync Payload Validation','',`Result: ${ok?'PASS':'FAIL'}`,'',...checks.map(([n,p])=>`- ${p?'PASS':'FAIL'}: ${n}`),''].join('\n')); console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok)process.exit(1)
