#!/usr/bin/env bun
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { GENERATED_AT, PLAN_DIR, writeJson, writeText } from './source-reconciliation-utils'

const tables = ['ai_audit_runs', 'ai_audit_items', 'ai_audit_findings', 'ai_change_proposals', 'ai_review_decisions', 'ai_audit_status_cache']
const mdOutput = path.join(PLAN_DIR, 'admin-ai-audit-schema-probe.generated.md')
const jsonOutput = path.join(PLAN_DIR, 'admin-ai-audit-schema-probe.generated.json')

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || ''
  const psqlAvailable = spawnSync('bash', ['-lc', 'command -v psql'], { encoding: 'utf-8' }).status === 0
  if (!databaseUrl || !psqlAvailable) {
    const result = {
      generated_at: GENERATED_AT,
      status: 'DB_SCHEMA_PROBE_SKIPPED_NO_ENV',
      dry_run: true,
      db_write_attempted: false,
      admin_live_sync_status: 'blocked',
      reason: !databaseUrl ? 'No DATABASE_URL/POSTGRES_URL/SUPABASE_DB_URL environment variable present.' : 'psql command not available.',
      expected_tables: tables.map((table) => ({ table_name: table, status: 'not_checked' })),
    }
    await writeJson(jsonOutput, result)
    await writeText(mdOutput, renderSkipped(result.reason))
    console.log(JSON.stringify({ ok: true, status: result.status, outputs: [mdOutput, jsonOutput] }, null, 2))
    return
  }

  const sql = `select table_name from information_schema.tables where table_schema = 'public' and table_name in (${tables.map((table) => `'${table}'`).join(',')}) order by table_name;`
  const probe = spawnSync('psql', [databaseUrl, '-Atc', sql], {
    encoding: 'utf-8',
    timeout: 15000,
    env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? '' },
  })
  const found = new Set((probe.stdout || '').split('\n').map((line) => line.trim()).filter(Boolean))
  const result = {
    generated_at: GENERATED_AT,
    status: probe.status === 0 ? 'DB_SCHEMA_PROBE_READ_ONLY_COMPLETED' : 'DB_SCHEMA_PROBE_READ_ONLY_FAILED',
    dry_run: true,
    db_write_attempted: false,
    admin_live_sync_status: 'blocked',
    expected_tables: tables.map((table) => ({ table_name: table, status: found.has(table) ? 'present' : 'missing' })),
    stderr_summary: probe.status === 0 ? '' : redact(probe.stderr || 'psql failed'),
  }
  await writeJson(jsonOutput, result)
  await writeText(mdOutput, renderResult(result))
  console.log(JSON.stringify({ ok: probe.status === 0, status: result.status, outputs: [mdOutput, jsonOutput] }, null, 2))
  if (probe.status !== 0) process.exit(1)
}

function redact(text: string) {
  return text.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgres://[REDACTED]').slice(0, 2000)
}

function renderSkipped(reason: string) {
  return [
    '# Admin AI Audit Schema Probe',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    'Status: DB_SCHEMA_PROBE_SKIPPED_NO_ENV',
    '',
    `Reason: ${reason}`,
    '',
    'No DB connection was opened. No Supabase mutation occurred. Admin live sync remains blocked.',
    '',
    'Expected tables:',
    ...tables.map((table) => `- ${table}: not_checked`),
  ].join('\n')
}

function renderResult(result: { status: string; expected_tables: Array<{ table_name: string; status: string }>; stderr_summary?: string }) {
  return [
    '# Admin AI Audit Schema Probe',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    `Status: ${result.status}`,
    '',
    'Mode: read-only information_schema probe. No writes were attempted. Admin live sync remains blocked.',
    '',
    '| table | status |',
    '|---|---|',
    ...result.expected_tables.map((row) => `| ${row.table_name} | ${row.status} |`),
    result.stderr_summary ? `\nError summary: ${result.stderr_summary}` : '',
  ].join('\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
