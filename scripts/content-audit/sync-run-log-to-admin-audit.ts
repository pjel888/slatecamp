#!/usr/bin/env bun
import { existsSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  createContentAuditSupabaseClient,
  nowIso,
  parseArgs,
  resolveExportRoot,
  writeJson,
} from './lib'

type JsonRecord = Record<string, any>

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const runId = String((options as JsonRecord).runId ?? (options as JsonRecord).run_id ?? 'latest')
  const runLogPath = resolveRunLogPath(root, runId)
  if (!runLogPath) throw new Error(`No run-log.json found for run id ${runId}.`)
  const runLog = JSON.parse(await readFile(runLogPath, 'utf-8')) as JsonRecord
  const dryRun = options.dryRun === true || options.apply !== true
  const payload = buildAuditRunPayload(runLog)
  const report: JsonRecord = {
    attempted_at: nowIso(),
    dry_run: dryRun,
    apply: options.apply === true,
    run_log_path: path.relative(root, runLogPath),
    payload,
    logged: false,
    admin_run_id: null,
    warnings: [] as string[],
    blockers: [] as string[],
  }

  if (!dryRun) {
    const supabase = createContentAuditSupabaseClient() as any
    const { data, error } = await supabase
      .from('ai_audit_runs')
      .insert(payload)
      .select('id')
      .single()
    if (error) {
      report.warnings.push(`Optional admin audit logging skipped: ${error.message}`)
    } else {
      report.logged = true
      report.admin_run_id = data?.id ?? null
    }
  } else {
    report.warnings.push('Dry-run mode: no admin AI Audit row was inserted.')
  }

  await writeJson(path.join(root, 'admin-audit-log-report.json'), report)
  console.log(JSON.stringify(report, null, 2))
}

function resolveRunLogPath(root: string, runId: string) {
  const runsRoot = path.join(root, 'runs')
  if (!existsSync(runsRoot)) return null
  if (runId !== 'latest') {
    const exact = path.join(runsRoot, runId, 'run-log.json')
    return existsSync(exact) ? exact : null
  }
  const candidates = readdirSync(runsRoot)
    .map((name) => path.join(runsRoot, name, 'run-log.json'))
    .filter((filePath) => existsSync(filePath))
    .sort()
  return candidates.at(-1) ?? null
}

function buildAuditRunPayload(runLog: JsonRecord) {
  const errored = String(runLog.status ?? '').includes('error') || Number(runLog.error_count ?? 0) > 0
  const totalItems = Number(runLog.article_count ?? runLog.processed ?? runLog.component_count ?? 0) || 0
  return {
    run_type: 'content_audit_roundtrip',
    scope_type: String(runLog.command ?? 'content_audit_script'),
    phase: 'tier0_static_check',
    provider: 'manual',
    model: null,
    prompt_version: null,
    status: errored ? 'failed' : 'completed',
    total_items: totalItems,
    completed_items: errored ? 0 : totalItems,
    flagged_items: Number(runLog.warning_count ?? 0) || 0,
    completed_at: runLog.completed_at ?? nowIso(),
    notes: `Local content-audit run log imported from ${runLog.command ?? 'unknown command'}. No AI job was started.`,
    metadata: {
      created_from: 'content_audit_scripts',
      no_ai_job_started: true,
      local_run_log: runLog,
    },
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
