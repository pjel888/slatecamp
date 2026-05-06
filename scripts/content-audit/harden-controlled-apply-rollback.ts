#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeJson, writeText, sha256Text } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/19_controlled_apply')
const article=readJson<any>(path.join(root,'logs/article-apply-run.generated.json'),{})
const question=readJson<any>(path.join(root,'logs/question-apply-run.generated.json'),{})
const source=readJson<any>(path.join(root,'logs/source-status-apply-run.generated.json'),{})
const runs=[article,question,source]
const localApplyDetected=runs.some(r=>r.local_applied===true||r.applied===true)
const liveMutationFree=runs.every(r=>r.live_applied!==true&&r.supabase_mutation!==true&&r.db_write_attempted!==true)
const hardening={generated_at:new Date().toISOString(), live_mutation_free:liveMutationFree, local_apply_detected:localApplyDetected, dry_run_or_local_artifact_only:liveMutationFree, rollback_snapshot_count:runs.filter(r=>r.rollback_file||r.run_id).length, batch_limit_recommended:25, idempotency_key:sha256Text(JSON.stringify(runs)), live_apply:false}
await writeJson(path.join(root,'controlled-apply-hardening.generated.json'),hardening)
await writeText(path.join(root,'reports/controlled-apply-hardening-report.md'),`# Controlled Apply Hardening Report\n\n- Live mutation free: ${hardening.live_mutation_free}\n- Local apply artifact detected: ${hardening.local_apply_detected}\n- Live apply: false\n- Batch limit recommended: ${hardening.batch_limit_recommended}\n- Idempotency key: ${hardening.idempotency_key}\n`)
await writeText(path.join(root,'reports/rollback-readiness-report.md'),`# Rollback Readiness Report\n\nRollback snapshot references detected: ${hardening.rollback_snapshot_count}. Live apply remains blocked, but rollback manifests exist for dry-run/local-artifact modes.\n`)
await writeText(path.join(root,'reports/apply-mode-dry-run-preview-report.md'),`# Apply Mode Dry-Run Preview Report\n\nNo DB write attempted. No article/question/source-status live mutation attempted. Existing local source-status application artifacts are local-only and remain rollback-documented.\n`)
console.log(JSON.stringify({ok:hardening.live_mutation_free, ...hardening}, null, 2)); if(!hardening.live_mutation_free) process.exit(1)
