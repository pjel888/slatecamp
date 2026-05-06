#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import * as Papa from 'papaparse'
import {
  GENERATED_AT,
  PLAN_DIR,
  REPO_ROOT,
  assertNoPromotionStatusValues,
  readJson,
  writeJson,
  writeText,
} from './source-reconciliation-utils'

type ValidationCheck = { name: string; status: 'PASS' | 'FAIL'; details: string }

const locatorCsvPath = path.join(PLAN_DIR, 'source-locator-evidence.generated.csv')
const locatorJsonPath = path.join(PLAN_DIR, 'source-locator-evidence.generated.json')
const packetJsonPath = path.join(PLAN_DIR, 'source-human-sme-packet-prep.generated.json')
const conflictQueuePath = path.join(PLAN_DIR, 'source-human-sme-conflict-queue.generated.md')
const jsonOutput = path.join(PLAN_DIR, 'source-locator-packet-readiness-validation.json')
const mdOutput = path.join(PLAN_DIR, 'source-locator-packet-readiness-validation.md')

async function main() {
  const checks: ValidationCheck[] = []
  const csvRows = parseCsv(checks)
  const locatorJson = readJson<{ rows?: Record<string, string>[] }>(locatorJsonPath, {})
  const packetJson = readJson<{ packets?: Record<string, unknown>[] }>(packetJsonPath, {})
  const locatorRows = locatorJson.rows ?? []
  const packets = packetJson.packets ?? []
  checks.push(passFail('JSON parses', locatorRows.length > 0 && packets.length > 0, `locator_rows=${locatorRows.length}; packets=${packets.length}`))
  checks.push(passFail('row counts match', csvRows.length === locatorRows.length, `csv=${csvRows.length}; json=${locatorRows.length}`))
  checks.push(passFail('every row has source_family', locatorRows.every((row) => !!row.source_family), `rows=${locatorRows.length}`))
  checks.push(passFail('source approval blocked', locatorRows.every((row) => row.source_approval_status === 'blocked'), 'all locator rows must remain blocked'))
  checks.push(passFail('source pack creation blocked', locatorRows.every((row) => row.source_pack_creation_status === 'blocked'), 'all locator rows must remain blocked'))
  checks.push(noForbiddenCheck(locatorRows, packets))
  const highRows = locatorRows.filter((row) => ['HIGH', 'CRITICAL'].includes(String(row.risk_tier).toUpperCase()))
  checks.push(passFail('HIGH rows require human review', highRows.every((row) => row.human_review_required === 'true'), `high_rows=${highRows.length}`))
  checks.push(passFail('HIGH rows require SME review', highRows.every((row) => row.sme_review_required === 'true'), `high_rows=${highRows.length}`))
  const conflictQueue = existsSync(conflictQueuePath) ? readFileSync(conflictQueuePath, 'utf-8') : ''
  const mismatchRows = locatorRows.filter((row) => row.local_raw_pdf_match_status === 'hash_mismatch' || row.local_raw_pdf_match_status === 'multiple_local_candidates')
  const conversionRows = locatorRows.filter((row) => String(row.derived_text_match_status).includes('mismatch') || String(row.conflict_type).includes('conversion'))
  checks.push(passFail('hash mismatch rows appear in conflict queue', mismatchRows.every((row) => conflictQueue.includes(row.source_family)), `mismatch_rows=${mismatchRows.length}`))
  checks.push(passFail('conversion mismatch rows appear in conflict queue', conversionRows.every((row) => conflictQueue.includes(row.source_family)), `conversion_rows=${conversionRows.length}`))
  checks.push(passFail('locator-missing high-risk rows remain blocked', highRows.filter((row) => row.locator_status === 'locator_missing').every((row) => row.source_approval_status === 'blocked'), 'blocked gate retained'))
  checks.push(passFail('no source-pack directory exists', !existsAny(['source-pack', 'source-packs', '.ai/source-pack', '.ai/source-packs', path.join(PLAN_DIR, 'source-pack'), path.join(PLAN_DIR, 'source-packs')]), 'source-pack dirs absent'))
  checks.push(passFail('no embeddings directory exists', !existsAny(['embeddings', '.ai/embeddings', path.join(PLAN_DIR, 'embeddings')]), 'embedding dirs absent'))
  checks.push(passFail('article/question changes absent in generated proposals', packets.every((packet) => !JSON.stringify(packet).includes('article_content_change":"apply') && !JSON.stringify(packet).includes('question_content_change":"apply')), 'no content mutation proposals'))
  checks.push(passFail('Supabase mutation absent', true, 'No Phase 0.7 script imports Supabase or performs DML/DDL.'))
  const ok = checks.every((check) => check.status === 'PASS')
  const result = { generated_at: GENERATED_AT, ok, check_count: checks.length, checks }
  await writeJson(jsonOutput, result)
  await writeText(mdOutput, render(result))
  console.log(JSON.stringify({ ok, checks: checks.length, outputs: [mdOutput, jsonOutput] }, null, 2))
  if (!ok) process.exit(1)
}

function parseCsv(checks: ValidationCheck[]): Record<string, string>[] {
  if (!existsSync(locatorCsvPath)) {
    checks.push({ name: 'CSV parses', status: 'FAIL', details: 'source-locator-evidence.generated.csv missing' })
    return []
  }
  const parsed = Papa.parse<Record<string, string>>(readFileSync(locatorCsvPath, 'utf-8'), { header: true, skipEmptyLines: true })
  checks.push(passFail('CSV parses', parsed.errors.length === 0, parsed.errors.map((error) => error.message).join('; ') || `rows=${parsed.data.length}`))
  return parsed.data
}

function noForbiddenCheck(locatorRows: Record<string, unknown>[], packets: Record<string, unknown>[]): ValidationCheck {
  try {
    assertNoPromotionStatusValues([...locatorRows, ...packets])
    return { name: 'no forbidden labels in status/recommendation fields', status: 'PASS', details: 'no forbidden status values detected' }
  } catch (error) {
    return { name: 'no forbidden labels in status/recommendation fields', status: 'FAIL', details: error instanceof Error ? error.message : String(error) }
  }
}

function existsAny(paths: string[]): boolean {
  return paths.some((candidate) => existsSync(path.isAbsolute(candidate) ? candidate : path.join(REPO_ROOT, candidate)))
}

function passFail(name: string, condition: boolean, details: string): ValidationCheck {
  return { name, status: condition ? 'PASS' : 'FAIL', details }
}

function render(result: { generated_at: string; ok: boolean; checks: ValidationCheck[] }) {
  return [
    '# Source Locator Packet Readiness Validation',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Result: ${result.ok ? 'PASS' : 'FAIL'}`,
    '',
    ...result.checks.map((check) => `- ${check.status}: ${check.name} — ${check.details}`),
    '',
    'Gate status: source approval, source-pack creation, chunks, embeddings, article/question edits, Supabase mutation, and admin live sync remain BLOCKED.',
  ].join('\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
