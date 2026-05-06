#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { REPO_ROOT, readJson, writeJson, writeText } from './source-reconciliation-utils'
const rollbackFile=process.argv.find(a=>a.endsWith('.json'))
const runRoot=path.join(REPO_ROOT,'.ai/19_controlled_apply')
const backupsRoot=path.join(runRoot,'backups')
const target=rollbackFile?path.resolve(rollbackFile):''
const relative=target?path.relative(backupsRoot,target):''
const contained=!!target&&!!relative&&!relative.startsWith('..')&&!path.isAbsolute(relative)
const ok=contained&&existsSync(target)
const snapshot=ok?readJson<any>(target,{}):null
const log={generated_at:new Date().toISOString(),rollback_requested:!!rollbackFile,rollback_file:target||null,rollback_possible:ok,rollback_executed:false,rollback_target:snapshot?.target||null,reason:ok?'No live mutation had been performed; rollback is a verification no-op.':'Missing/invalid rollback file.'}
await writeJson(path.join(runRoot,'logs/rollback-run.generated.json'),log)
await writeText(path.join(REPO_ROOT,'.ai/03_plans/content-editorial-pipeline-2026-05-05/rollback-content-application-report.md'),`# Rollback Content Application Report\n\nRollback possible: ${ok}\nRollback executed: false\nReason: ${log.reason}\n`)
console.log(JSON.stringify({ok:true,rollback_possible:ok,rollback_executed:false},null,2))
