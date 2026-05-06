#!/usr/bin/env bun
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_AT, PLAN_DIR, REPO_ROOT, writeJson, writeText } from './source-reconciliation-utils'

type SmokeStep = {
  command: string[]
  status: 'PASS' | 'FAIL'
  exit_code: number | null
  stdout_tail: string
  stderr_tail: string
}

const commands = [
  ['bun', 'scripts/content-audit/build-source-reconciliation-matrix.ts'],
  ['bun', 'scripts/content-audit/validate-source-packet-readiness.ts'],
  ['bun', 'scripts/content-audit/extract-source-locators.ts'],
  ['bun', 'scripts/content-audit/build-human-sme-packet-prep.ts'],
  ['bun', 'scripts/content-audit/validate-locator-packet-readiness.ts'],
  ['bun', 'scripts/content-audit/validate-admin-ai-audit-schema.ts'],
  ['bun', 'scripts/content-audit/build-source-verification-admin-payload.ts'],
]

const jsonOutput = path.join(PLAN_DIR, 'source-verification-smoke-test.generated.json')
const mdOutput = path.join(PLAN_DIR, 'source-verification-smoke-test-report.md')

async function main() {
  const steps = commands.map(runStep)
  const artifactChecks = checkArtifacts()
  const ok = steps.every((step) => step.status === 'PASS') && artifactChecks.every((check) => check.status === 'PASS')
  const sourcePackDirectoryExists = directoryExists(['.ai/16_source_packs', '.ai/content-audit-export/source-packs', 'source-packs'])
  const embeddingsDirectoryExists = directoryExists(['.ai/content-audit-export/embeddings', 'embeddings'])
  const result = {
    generated_at: GENERATED_AT,
    ok,
    dry_run_only: true,
    db_write_attempted: false,
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    source_pack_directory_exists: sourcePackDirectoryExists,
    embeddings_directory_exists: embeddingsDirectoryExists,
    commands: steps,
    artifact_checks: artifactChecks,
  }
  await writeJson(jsonOutput, result)
  await writeText(mdOutput, render(result))
  console.log(JSON.stringify({ ok, commands: steps.length, artifact_checks: artifactChecks.length, outputs: [mdOutput, jsonOutput] }, null, 2))
  if (!ok) process.exit(1)
}

function directoryExists(relativePaths: string[]): boolean {
  return relativePaths.some((relativePath) => existsSync(path.join(REPO_ROOT, relativePath)))
}

function runStep(command: string[]): SmokeStep {
  const child = spawnSync(command[0], command.slice(1), {
    cwd: process.cwd(),
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 5,
  })
  return {
    command,
    status: child.status === 0 ? 'PASS' : 'FAIL',
    exit_code: child.status,
    stdout_tail: tail(child.stdout || ''),
    stderr_tail: tail(child.stderr || ''),
  }
}

function checkArtifacts() {
  const checks = [
    ['source-reconciliation-matrix.generated.json', (data: Record<string, unknown>) => Number(data.row_count ?? 0) === 9 || Array.isArray(data.rows)],
    ['source-locator-evidence.generated.json', (data: Record<string, unknown>) => Number(data.row_count ?? 0) === 9],
    ['source-human-sme-packet-prep.generated.json', (data: Record<string, unknown>) => Number(data.packet_count ?? 0) === 9],
    ['source-locator-packet-readiness-validation.json', (data: Record<string, unknown>) => data.ok === true],
    ['admin-ai-audit-source-payload.dry-run.json', (data: Record<string, unknown>) => data.dry_run === true && data.db_write_attempted === false],
  ] as const
  return checks.map(([file, predicate]) => {
    const fullPath = path.join(PLAN_DIR, file)
    if (!existsSync(fullPath)) return { file, status: 'FAIL' as const, details: 'missing' }
    try {
      const data = JSON.parse(readFileSync(fullPath, 'utf-8')) as Record<string, unknown>
      return { file, status: predicate(data) ? 'PASS' as const : 'FAIL' as const, details: predicate(data) ? 'ok' : 'predicate_failed' }
    } catch (error) {
      return { file, status: 'FAIL' as const, details: error instanceof Error ? error.message : String(error) }
    }
  })
}

function tail(text: string) {
  return text.split('\n').slice(-12).join('\n').trim()
}

function render(result: { generated_at: string; ok: boolean; commands: SmokeStep[]; artifact_checks: Array<{ file: string; status: 'PASS' | 'FAIL'; details: string }> }) {
  return [
    '# Source Verification Smoke Test Report',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Result: ${result.ok ? 'PASS' : 'FAIL'}`,
    '',
    'Scope: local deterministic source verification scripts only. No source approval, source-pack creation, chunks, embeddings, article/question edits, Supabase mutation, or admin live sync.',
    '',
    '## Commands',
    '',
    ...result.commands.map((step) => `- ${step.status}: \`${step.command.join(' ')}\` exit=${step.exit_code}`),
    '',
    '## Artifact checks',
    '',
    ...result.artifact_checks.map((check) => `- ${check.status}: ${check.file} — ${check.details}`),
    '',
    'Gate status: all source verification gates remain BLOCKED.',
  ].join('\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
