#!/usr/bin/env bun
import path from 'node:path'
import {
  GENERATED_AT,
  PLAN_DIR,
  assertNoPromotionStatusValues,
  buildMatrixRow,
  matrixFields,
  readCsv,
  readJson,
  scanVitruviusFiles,
  writeCsv,
  writeJson,
  writeText,
} from './source-reconciliation-utils'

const csvInput = path.join(PLAN_DIR, 'phase05b6-claude-reconciled-source-leads.generated.csv')
const jsonInput = path.join(PLAN_DIR, 'phase05b6-claude-reconciled-source-leads.generated.json')
const csvOutput = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.csv')
const jsonOutput = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.json')
const reportOutput = path.join(PLAN_DIR, 'source-reconciliation-report.md')

async function main() {
  const csvLeads = readCsv(csvInput)
  const jsonLeads = readJson<Record<string, string>[]>(jsonInput, [])
  const leads = jsonLeads.length ? jsonLeads : csvLeads
  if (!leads.length) throw new Error('No Phase 0.5B.6 evidence leads found.')

  const files = scanVitruviusFiles()
  const rows = leads.map((lead) => buildMatrixRow(lead, files))
  assertNoPromotionStatusValues(rows as unknown as Record<string, unknown>[])

  await writeCsv(csvOutput, rows as unknown as Record<string, unknown>[], matrixFields())
  await writeJson(jsonOutput, {
    generated_at: GENERATED_AT,
    allowed_use: 'discovery_only',
    evidence_status: 'FALLBACK_REVIEW_ONLY',
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    input_files: [path.relative(process.cwd(), csvInput), path.relative(process.cwd(), jsonInput)],
    vitruvius_inventory: summarizeFiles(files),
    row_count: rows.length,
    rows,
  })
  await writeText(reportOutput, renderReport(rows, files.length))
  console.log(JSON.stringify({ ok: true, rows: rows.length, vitruvius_files_scanned: files.length, outputs: [csvOutput, jsonOutput, reportOutput] }, null, 2))
}

function summarizeFiles(files: ReturnType<typeof scanVitruviusFiles>) {
  const summary: Record<string, { files: number; pdf: number; md: number; json: number; txt: number }> = {}
  for (const file of files) {
    summary[file.layer] ??= { files: 0, pdf: 0, md: 0, json: 0, txt: 0 }
    summary[file.layer].files += 1
    if (file.extension === '.pdf') summary[file.layer].pdf += 1
    if (file.extension === '.md' || file.extension === '.markdown') summary[file.layer].md += 1
    if (file.extension === '.json') summary[file.layer].json += 1
    if (file.extension === '.txt') summary[file.layer].txt += 1
  }
  return summary
}

function renderReport(rows: ReturnType<typeof buildMatrixRow>[], scannedCount: number): string {
  const exact = rows.filter((row) => row.local_raw_pdf_match_status === 'exact_hash_match').length
  const mismatch = rows.filter((row) => row.local_raw_pdf_match_status === 'hash_mismatch' || row.local_raw_pdf_match_status === 'multiple_local_candidates').length
  const missing = rows.filter((row) => row.local_raw_pdf_match_status === 'no_local_pdf').length
  const conflicts = rows.filter((row) => row.conflict_flag === 'true').length
  const lines = [
    '# Phase 0.6 Source Reconciliation Report',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    'Status: deterministic local output only. No source approval, source-pack creation, embeddings, article/question edits, Supabase mutation, or admin live sync occurred.',
    '',
    '## Vitruvius folder finding',
    '',
    `The full vitruvius-connection intake was scanned locally (${scannedCount} hashable PDF/Markdown/text/JSON files). The files are related as an intake corpus, but they are not automatically source-approved: 001 raw PDFs, 002 conversions, and 003 canonical Markdown have different trust levels and must be reconciled by hash and locator support before use.`,
    '',
    '## Summary',
    '',
    `- Matrix rows: ${rows.length}`,
    `- Exact official/local raw PDF hash matches: ${exact}`,
    `- Local raw hash mismatch or multiple-candidate rows: ${mismatch}`,
    `- No local PDF rows: ${missing}`,
    `- Conflict-flagged rows: ${conflicts}`,
    '- Source approval status: blocked for every row',
    '- Source-pack creation status: blocked for every row',
    '',
    '## Row results',
    '',
    '| source_family | document_code | local_raw_pdf_match_status | conversion_layer_mismatch | locator_status | conflict_type | next_action |',
    '|---|---|---:|---:|---|---|---|',
  ]
  for (const row of rows) {
    lines.push(`| ${escapeCell(row.source_family)} | ${escapeCell(row.document_code)} | ${row.local_raw_pdf_match_status} | ${row.conversion_layer_mismatch} | ${row.locator_status} | ${escapeCell(row.conflict_type)} | ${escapeCell(row.next_action)} |`)
  }
  lines.push('', '## Gate status', '', '```text', 'APPROVED_SOURCE_FILES = 0', 'VERIFIED_SOURCE_CANDIDATES = 0', 'SOURCE_PACKS_CREATED = 0', 'CHUNKS_CREATED = 0', 'EMBEDDINGS_CREATED = 0', 'SOURCE_APPROVAL = BLOCKED', 'SOURCE_PACK_CREATION = BLOCKED', 'EMBEDDINGS = BLOCKED', 'ARTICLE_REWRITING = BLOCKED', 'QUESTION_BANK_EDITING = BLOCKED', 'SUPABASE_MUTATION = BLOCKED', 'ADMIN_AI_AUDIT_LIVE_SYNC = BLOCKED', 'PHASE_1B = BLOCKED', '```')
  return lines.join('\n')
}

function escapeCell(value: string) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
