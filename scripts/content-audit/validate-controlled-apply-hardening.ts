#!/usr/bin/env bun
import path from 'node:path'
import { REPO_ROOT, readJson, writeText } from './source-reconciliation-utils'
const root=path.join(REPO_ROOT,'.ai/19_controlled_apply')
const h=readJson<any>(path.join(root,'controlled-apply-hardening.generated.json'),{})
const checks=[{check:'live_mutation_free',pass:h.live_mutation_free===true},{check:'dry_run_or_local_artifact_only',pass:h.dry_run_or_local_artifact_only===true},{check:'live_apply_false',pass:h.live_apply===false},{check:'has_idempotency_key',pass:typeof h.idempotency_key==='string'&&h.idempotency_key.length===64},{check:'batch_limit_set',pass:h.batch_limit_recommended>0&&h.batch_limit_recommended<=50}]
const ok=checks.every(c=>c.pass)
await writeText(path.join(root,'reports/controlled-apply-hardening-validation-report.md'),`# Controlled Apply Hardening Validation Report\n\n${checks.map(c=>`- ${c.pass?'PASS':'FAIL'}: ${c.check}`).join('\n')}\n`)
console.log(JSON.stringify({ok,checks:checks.length},null,2)); if(!ok) process.exit(1)
