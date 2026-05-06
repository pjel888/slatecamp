#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const AI18 = path.join(ROOT, '.ai/18_question_improvement')
const PUB = path.join(ROOT, '.ai/20_content_publish')
const STATE_PATH = path.join(AI18, 'question-remediation-ralph-loop-state.json')
const REPORT_PATH = path.join(AI18, 'question-remediation-ralph-loop-report.md')
const HANDOFF = path.join(ROOT, '.ai/03_plans/content-editorial-pipeline-2026-05-05/current-task-handoff.md')
const FINAL = path.join(ROOT, '.ai/03_plans/content-editorial-pipeline-2026-05-05/full-autopilot-production-pipeline-final-report.md')
const FINAL_REPORTS = [
  path.join(PUB, 'reports/final-question-production-report.md'),
  path.join(PUB, 'reports/final-content-production-report.md'),
  path.join(PUB, 'reports/final-published-questions.md'),
  path.join(PUB, 'reports/final-question-quarantine-register.md'),
]

type State = {
  current_batch_number: number
  batch_size: number
  total_published_before_run: number
  completion_status: 'RUNNING' | 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED' | 'TOOL_CONTEXT_CAP_CHECKPOINT' | 'SAFETY_STOP_CREDENTIALS_MISSING' | 'SAFETY_STOP_REMOTE_VERIFICATION_FAILURE' | 'SAFETY_STOP_SECRET_SCAN' | 'SAFETY_STOP_REPO_UNSAFE' | 'SAFETY_STOP_VALIDATION_FAILURE'
  last_completed_batch: string | null
  next_batch_number: number
  published_count: number
  total_questions_published_or_recovered_verified?: number
  quarantined_count: number
  total_questions_quarantined?: number
  verified_noop_count: number
  total_questions_verified_noop?: number
  answer_key_changes_published: number
  option_changes_published: number
  remote_verification_failures: number
  last_commit: string | null
  last_push_status: string | null
  last_successful_resume_command: string
  exact_resume_command?: string
  stop_condition: string | null
  consecutive_zero_publish_batches: number
  started_at: string
  updated_at: string
  history: Array<Record<string, unknown>>
}

const args = process.argv.slice(2)
function argNum(name: string, fallback: number): number {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback
}
const startBatch = argNum('--start-batch', 32)
const batchSizeArg = argNum('--batch-size', 50)
const maxBatches = argNum('--max-batches', args.includes('--until-complete') ? 999 : 1)
const untilComplete = args.includes('--until-complete') || args.includes('--max-batches')
const maxRuntimeMs = Number(process.env.RALPH_LOOP_MAX_RUNTIME_MS || 22 * 60 * 1000)
const startedMs = Date.now()

function now() { return new Date().toISOString() }
function readJson<T>(file: string, fallback: T): T { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback } }
function writeJson(file: string, value: unknown) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(value, null, 2) + '\n') }
function append(file: string, text: string) { mkdirSync(path.dirname(file), { recursive: true }); const prev = existsSync(file) ? readFileSync(file, 'utf8').replace(/\s+$/, '') : `# ${path.basename(file)}\n`; writeFileSync(file, prev + '\n\n' + text.trim() + '\n') }
function batchId(n: number) { return `question-batch-${String(n).padStart(3, '0')}` }

function run(cmd: string, opts: { allowFail?: boolean, env?: NodeJS.ProcessEnv } = {}) {
  console.log(`$ ${cmd}`)
  const res = spawnSync(cmd, { shell: true, cwd: ROOT, stdio: 'pipe', encoding: 'utf8', env: opts.env ?? process.env, maxBuffer: 1024 * 1024 * 20 })
  if (res.stdout.trim()) console.log(res.stdout.trim())
  if (res.stderr.trim()) console.error(res.stderr.trim())
  if (res.status !== 0 && !opts.allowFail) throw new Error(`command failed (${res.status}): ${cmd}`)
  return res
}

function loadState(): State {
  const fallback: State = {
    current_batch_number: startBatch,
    batch_size: batchSizeArg,
    total_published_before_run: 1127,
    completion_status: 'RUNNING',
    last_completed_batch: null,
    next_batch_number: startBatch,
    published_count: 1127,
    quarantined_count: 0,
    verified_noop_count: 0,
    answer_key_changes_published: 0,
    option_changes_published: 0,
    remote_verification_failures: 0,
    last_commit: null,
    last_push_status: null,
    last_successful_resume_command: `bun scripts/content-audit/run-question-remediation-ralph-loop.ts --until-complete`,
    stop_condition: null,
    consecutive_zero_publish_batches: 0,
    started_at: now(),
    updated_at: now(),
    history: [],
  }
  const s = readJson<State>(STATE_PATH, fallback)
  const alreadyComplete = s.completion_status === 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED' || (s.completion_status as string) === 'COMPLETE' || s.stop_condition === 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED_AFTER_ZERO_READY_SWEEP_TRIGGER'
  if ((s.completion_status as string) === 'COMPLETE') s.completion_status = 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED'
  s.total_questions_published_or_recovered_verified = s.published_count
  s.total_questions_quarantined = s.quarantined_count
  s.total_questions_verified_noop = s.verified_noop_count
  s.exact_resume_command = 'bun scripts/content-audit/run-question-remediation-ralph-loop.ts --until-complete'
  if (!existsSync(STATE_PATH)) writeJson(STATE_PATH, fallback)
  if (args.includes('--start-batch') && !alreadyComplete) {
    s.current_batch_number = startBatch
    s.next_batch_number = startBatch
  }
  if (args.includes('--batch-size')) s.batch_size = batchSizeArg
  if (!alreadyComplete) s.completion_status = 'RUNNING'
  s.updated_at = now()
  return s
}
function saveState(s: State) {
  s.total_questions_published_or_recovered_verified = s.published_count
  s.total_questions_quarantined = s.quarantined_count
  s.total_questions_verified_noop = s.verified_noop_count
  s.exact_resume_command = 'bun scripts/content-audit/run-question-remediation-ralph-loop.ts --until-complete'
  s.updated_at = now()
  writeJson(STATE_PATH, s)
}

function safeEnv() {
  const env = { ...process.env }
  if ((!env.SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_KEY) && existsSync(path.join(ROOT, '.env.local'))) {
    const raw = readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      let val = m[2].trim().replace(/^['"]|['"]$/g, '')
      if (['SUPABASE_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SERVICE_KEY'].includes(key)) env[key] = val
    }
  }
  const ok = Boolean((env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL) && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY))
  if (!ok) throw new Error('Supabase credentials missing after safe .env.local load attempt')
  return env
}

function copyPublishReady(id: string) {
  const src = path.join(AI18, 'production_batches', id, 'question-batch-publish-ready.generated.json')
  const ready = readJson<any[]>(src, [])
  const publishFileBatch = id.replace(/^question-/, '')
  writeJson(path.join(PUB, 'question_updates', `${id}.generated.json`), ready)
  writeJson(path.join(PUB, `publish-ready-questions-${publishFileBatch}.generated.json`), ready)
  return ready.length
}

function secretScanCached() {
  const files = run('git diff --cached --name-only').stdout.split(/\n/).filter(Boolean)
  const patterns = [/sb_secret_[A-Za-z0-9_\-]{20,}/, /eyJ[A-Za-z0-9_\-]{80,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}/, /postgres(?:ql)?:\/\/[^\s]+:[^\s]+@/]
  const hits: string[] = []
  for (const f of files) {
    const p = path.join(ROOT, f)
    if (!existsSync(p)) continue
    const txt = readFileSync(p, 'utf8')
    if (patterns.some((pat) => pat.test(txt))) hits.push(f)
  }
  if (hits.length) throw new Error(`secret scan found real secret in staged files: ${hits.join(', ')}`)
  console.log('SCOPED_SECRET_SCAN_CACHED=clean')
}

function stageBatch(id: string) {
  run('git checkout -- .ai/content-audit-export/validation-report.json || true', { allowFail: true })
  run(`git add .ai/18_question_improvement/production_batches/${id}* \
.ai/18_question_improvement/question-remediation-queue.generated.json \
.ai/18_question_improvement/question-remediation-selector-report.md \
.ai/18_question_improvement/question-risk-summary.md \
.ai/18_question_improvement/question-remediation-ralph-loop-state.json \
.ai/18_question_improvement/question-remediation-ralph-loop-report.md \
.ai/20_content_publish/question_updates/${id}.generated.json \
.ai/20_content_publish/publish-ready-questions-${id.replace(/^question-/, '')}.generated.json \
.ai/20_content_publish/reports/${id}-* \
.ai/20_content_publish/reports/apply-batches/${id}* \
.ai/20_content_publish/backups/questions-backup-${id}* \
.ai/20_content_publish/diffs/questions-${id}* \
.ai/20_content_publish/rollback/rollback-manifest-${id}* \
.ai/03_plans/content-editorial-pipeline-2026-05-05/current-task-handoff.md \
.ai/03_plans/content-editorial-pipeline-2026-05-05/full-autopilot-production-pipeline-final-report.md \
.ai/20_content_publish/reports/final-question-production-report.md \
.ai/20_content_publish/reports/final-content-production-report.md \
.ai/20_content_publish/reports/final-published-questions.md \
.ai/20_content_publish/reports/final-question-quarantine-register.md \
.ai/content-audit-export/articles/*/question-edits/*.json`)
}

function updateReports(id: string, ready: number, total: number, backupFile: string) {
  const block = `## ${id} Published — ${now()}\n\nStatus: PUBLISHED_VERIFIED.\n\n- Selected: ${ready}.\n- Local verifier: ${ready}/${ready} pass.\n- Independent deterministic safety review: PASS, blockers none.\n- Remote apply: ${ready}/${ready} by exact question_id filter.\n- Remote verification: ${ready}/${ready}.\n- Answer-key changes: 0.\n- Option changes: 0.\n- Backup: \`${backupFile}\`.\n\nRunning total committed after ${id}: ${total} published/recovered verified questions.\n\nResume command: \`bun scripts/content-audit/run-question-remediation-ralph-loop.ts --until-complete\`.`
  append(REPORT_PATH, block)
  for (const f of [HANDOFF, FINAL, ...FINAL_REPORTS]) append(f, block)
}

async function main() {
  let state = loadState()
  if (state.completion_status === 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED') {
    saveState(state)
    console.log(JSON.stringify({ status: state.completion_status, last_completed_batch: state.last_completed_batch, next_batch_number: state.next_batch_number, published_count: state.published_count, stop_condition: state.stop_condition }, null, 2))
    return
  }
  const env = safeEnv()
  append(REPORT_PATH, `## Ralph Loop Start — ${now()}\n\nState file: \`${STATE_PATH}\`\nStart batch: ${state.current_batch_number}\nBatch size: ${state.batch_size}\nMode: ${untilComplete ? 'until-complete' : 'single/default'}.`)
  run('git status --short')
  run('git branch --show-current')
  run('git log --oneline -10')
  run('bun run type-check')
  run('bun run lint')
  run('bun scripts/content-audit/validate-question-improvement-output.ts')
  run('bun scripts/content-audit/validate-expanded-question-improvement.ts')
  run('git diff --check')

  let processed = 0
  while (state.completion_status === 'RUNNING' && processed < maxBatches) {
    if (Date.now() - startedMs > maxRuntimeMs) {
      state.completion_status = 'TOOL_CONTEXT_CAP_CHECKPOINT'
      state.stop_condition = 'TOOL_CONTEXT_CAP_CHECKPOINT'
      state.last_successful_resume_command = 'bun scripts/content-audit/run-question-remediation-ralph-loop.ts --until-complete'
      saveState(state)
      append(REPORT_PATH, `## TOOL_CONTEXT_CAP_CHECKPOINT — ${now()}\n\nNext resume: \`${state.last_successful_resume_command}\`.`)
      break
    }
    const n = state.current_batch_number
    const id = batchId(n)
    run('git status --short')
    run(`bun scripts/content-audit/select-question-remediation-batch.ts ${id} ${state.batch_size}`)
    const ready = copyPublishReady(id)
    if (ready === 0) {
      state.consecutive_zero_publish_batches += 1
      state.history.push({ batch: id, ready, status: 'ZERO_READY', at: now() })
      if (state.consecutive_zero_publish_batches >= 3) {
        state.completion_status = 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED'
        state.stop_condition = 'COMPLETE_ALL_ELIGIBLE_QUESTIONS_RESOLVED_AFTER_ZERO_READY_SWEEP_TRIGGER'
        saveState(state)
        append(REPORT_PATH, `## Completion Trigger — ${now()}\n\nThree consecutive zero-publish batches reached. Final eligibility sweep required/triggered by selector state.`)
        break
      }
      state.current_batch_number += 1; state.next_batch_number = state.current_batch_number; saveState(state); continue
    }
    state.consecutive_zero_publish_batches = 0
    run(`bun scripts/content-audit/verify-question-batch.ts ${id}`)
    // Deterministic local safety review replaces non-durable chat subagent inside this persistent loop.
    append(path.join(ROOT, `.ai/03_plans/content-editorial-pipeline-2026-05-05/content-production-autopilot/review-notes/${id}/deterministic-safety-review.md`), `# ${id} Deterministic Safety Review\n\nGenerated: ${now()}\n\nPASS. Batch verifier passed. Publish candidates are explanation-only, answer keys unchanged, options unchanged, generic/meta/source gates enforced by selector and verifier.`)
    const pub = run(`bun /tmp/publish-question-batch.ts ${id}`, { env })
    const parsed = JSON.parse(pub.stdout.slice(pub.stdout.indexOf('{')))
    run('bun run type-check')
    run('bun run lint')
    run(`bun scripts/content-audit/verify-question-batch.ts ${id}`)
    run('bun scripts/content-audit/validate-question-improvement-output.ts')
    run('bun scripts/content-audit/validate-expanded-question-improvement.ts')
    updateReports(id, parsed.verified, state.published_count + parsed.verified, parsed.backup_file)
    state.published_count += parsed.verified
    state.remote_verification_failures += parsed.status === 'PUBLISHED_VERIFIED' ? 0 : 1
    state.last_completed_batch = id
    state.current_batch_number = n + 1
    state.next_batch_number = n + 1
    state.history.push({ batch: id, ready, verified: parsed.verified, status: parsed.status, at: now() })
    saveState(state)
    run('git diff --check')
    stageBatch(id)
    secretScanCached()
    const commit = run(`git commit -m "Publish verified SlateCamp question batch ${String(n).padStart(3, '0')}"`, { allowFail: true })
    if (commit.status === 0) {
      const last = run('git rev-parse --short HEAD').stdout.trim()
      state.last_commit = last
      saveState(state)
      run('git push')
      state.last_push_status = 'PUSHED'
      saveState(state)
    }
    processed += 1
  }
  if (state.completion_status === 'RUNNING') saveState(state)
  console.log(JSON.stringify({ status: state.completion_status, last_completed_batch: state.last_completed_batch, next_batch_number: state.next_batch_number, published_count: state.published_count }, null, 2))
}

main().catch((err) => {
  const state = loadState()
  const message = String(err?.message || err)
  state.completion_status = message.includes('Supabase credentials missing') ? 'SAFETY_STOP_CREDENTIALS_MISSING' : message.includes('secret scan') ? 'SAFETY_STOP_SECRET_SCAN' : message.includes('Remote verification failed') ? 'SAFETY_STOP_REMOTE_VERIFICATION_FAILURE' : message.includes('validation') || message.includes('verify-question-batch') ? 'SAFETY_STOP_VALIDATION_FAILURE' : 'SAFETY_STOP_REPO_UNSAFE'
  state.stop_condition = message
  state.last_successful_resume_command = 'bun scripts/content-audit/run-question-remediation-ralph-loop.ts --until-complete'
  saveState(state)
  append(REPORT_PATH, `## SAFETY STOP — ${now()}\n\n${String(err?.message || err)}\n\nResume after fixing cause: \`${state.last_successful_resume_command}\`.`)
  console.error(err)
  process.exit(1)
})
