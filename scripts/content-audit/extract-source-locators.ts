#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  GENERATED_AT,
  PLAN_DIR,
  assertNoPromotionStatusValues,
  findCandidates,
  readJson,
  scanVitruviusFiles,
  writeCsv,
  writeJson,
  writeText,
  type LocalFile,
  type MatrixRow,
} from './source-reconciliation-utils'

type LocatorStatus = 'locator_supported' | 'locator_partial' | 'locator_missing' | 'locator_not_checked' | 'extraction_blocked' | 'unknown'
type LocatorConfidence = 'high' | 'medium' | 'low' | 'none' | 'unknown'
type ExtractionQualityStatus = 'usable_for_review' | 'needs_spot_check' | 'poor_extraction' | 'extraction_not_available' | 'not_checked' | 'unknown'

type LocatorEvidenceRow = {
  source_family: string
  bundle_id_if_applicable: string
  document_code: string
  document_title: string
  risk_tier: string
  source_file_path: string
  source_file_hash: string
  source_file_type: string
  official_pdf_hash: string
  local_raw_pdf_match_status: string
  local_derived_text_path: string
  derived_text_match_status: string
  locator_status: LocatorStatus
  page_locator_available: string
  section_locator_available: string
  rule_locator_available: string
  table_locator_available: string
  formula_locator_available: string
  detected_locator_examples: string
  locator_confidence: LocatorConfidence
  extraction_method: string
  extraction_quality_status: ExtractionQualityStatus
  extraction_blockers: string
  human_review_required: string
  sme_review_required: string
  conflict_flag: string
  conflict_type: string
  source_approval_status: 'blocked'
  source_pack_creation_status: 'blocked'
  next_action: string
  notes: string
}

type PatternScan = {
  page: string[]
  section: string[]
  rule: string[]
  table: string[]
  formula: string[]
  documentIdentifier: string[]
}

const matrixPath = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.json')
const jsonOutput = path.join(PLAN_DIR, 'source-locator-evidence.generated.json')
const csvOutput = path.join(PLAN_DIR, 'source-locator-evidence.generated.csv')
const reportOutput = path.join(PLAN_DIR, 'source-locator-extraction-report.md')

const fields = [
  'source_family','bundle_id_if_applicable','document_code','document_title','risk_tier','source_file_path','source_file_hash','source_file_type','official_pdf_hash','local_raw_pdf_match_status','local_derived_text_path','derived_text_match_status','locator_status','page_locator_available','section_locator_available','rule_locator_available','table_locator_available','formula_locator_available','detected_locator_examples','locator_confidence','extraction_method','extraction_quality_status','extraction_blockers','human_review_required','sme_review_required','conflict_flag','conflict_type','source_approval_status','source_pack_creation_status','next_action','notes',
]

async function main() {
  const matrix = readJson<{ rows?: MatrixRow[] }>(matrixPath, {})
  const rows = matrix.rows ?? []
  if (!rows.length) throw new Error('Missing source-reconciliation-matrix.generated.json rows. Run Phase 0.6 reconciliation first.')
  const files = scanVitruviusFiles()
  const evidenceRows = rows.map((row) => buildLocatorEvidence(row, files))
  assertNoPromotionStatusValues(evidenceRows as unknown as Record<string, unknown>[])
  await writeCsv(csvOutput, evidenceRows as unknown as Record<string, unknown>[], fields)
  await writeJson(jsonOutput, {
    generated_at: GENERATED_AT,
    source: path.relative(process.cwd(), matrixPath),
    allowed_use: 'discovery_only',
    evidence_status: 'FALLBACK_REVIEW_ONLY',
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    pdf_extraction_dependency_status: 'not_available_no_heavy_dependency_added',
    row_count: evidenceRows.length,
    rows: evidenceRows,
  })
  await writeText(reportOutput, renderReport(evidenceRows))
  console.log(JSON.stringify({ ok: true, rows: evidenceRows.length, outputs: [csvOutput, jsonOutput, reportOutput] }, null, 2))
}

function buildLocatorEvidence(row: MatrixRow, files: LocalFile[]): LocatorEvidenceRow {
  const candidates = sourceCandidatesForRow(row, files)
  const preferred = choosePreferredCandidate(row, candidates)
  const textCandidate = preferred && isTextLike(preferred) ? preferred : choosePreferredCandidate(row, candidates.filter(isTextLike))
  if (textCandidate) return fromTextCandidate(row, textCandidate)
  if (preferred && preferred.extension === '.pdf') return fromPdfCandidate(row, preferred)
  return fromMissingCandidate(row)
}

function sourceCandidatesForRow(row: MatrixRow, files: LocalFile[]): LocalFile[] {
  const direct: LocalFile[] = []
  for (const rel of [row.local_derived_text_path, row.local_raw_pdf_path].filter(Boolean)) {
    const found = files.find((file) => file.relative_path === rel)
    if (found) direct.push(found)
  }
  const lead = {
    source_family: row.source_family,
    document_code: row.document_code,
    document_title: row.document_title,
    pdf_hash_if_downloaded: row.official_pdf_hash,
    local_file_hash_if_known: row.local_raw_pdf_hash,
  }
  return uniqueFiles([...direct, ...findCandidates(lead, files)])
}

function choosePreferredCandidate(row: MatrixRow, candidates: LocalFile[]): LocalFile | undefined {
  if (!candidates.length) return undefined
  const exactDerived = candidates.find((file) => file.relative_path === row.local_derived_text_path)
  if (exactDerived) return exactDerived
  const exactRaw = candidates.find((file) => file.relative_path === row.local_raw_pdf_path)
  if (exactRaw) return exactRaw
  return candidates[0]
}

function fromTextCandidate(row: MatrixRow, file: LocalFile): LocatorEvidenceRow {
  const text = safeReadText(file.path)
  const scan = scanTextForLocators(text)
  const counts = locatorCounts(scan)
  const positiveKinds = Object.values(counts).filter((count) => count > 0).length
  const locatorStatus: LocatorStatus = positiveKinds >= 2 ? 'locator_supported' : positiveKinds === 1 ? 'locator_partial' : 'locator_missing'
  const locatorConfidence: LocatorConfidence = positiveKinds >= 3 ? 'high' : positiveKinds === 2 ? 'medium' : positiveKinds === 1 ? 'low' : 'none'
  const examples = [...scan.page, ...scan.section, ...scan.rule, ...scan.table, ...scan.formula, ...scan.documentIdentifier].slice(0, 16)
  const extractionQuality: ExtractionQualityStatus = text.length > 500 && positiveKinds >= 2 ? 'usable_for_review' : text.length > 0 ? 'needs_spot_check' : 'poor_extraction'
  return baseRow(row, file, {
    locator_status: locatorStatus,
    page_locator_available: boolAvailability(counts.page),
    section_locator_available: boolAvailability(counts.section),
    rule_locator_available: boolAvailability(counts.rule),
    table_locator_available: boolAvailability(counts.table),
    formula_locator_available: boolAvailability(counts.formula),
    detected_locator_examples: examples.join(' | '),
    locator_confidence: locatorConfidence,
    extraction_method: 'local_text_or_markdown_regex_scan',
    extraction_quality_status: extractionQuality,
    extraction_blockers: extractionQuality === 'needs_spot_check' ? 'Text/Markdown is derivative; human spot-check against raw PDF required.' : '',
    notes: `text_chars_scanned=${text.length}; derivative_text_not_original_source_truth`,
  })
}

function fromPdfCandidate(row: MatrixRow, file: LocalFile): LocatorEvidenceRow {
  return baseRow(row, file, {
    locator_status: 'extraction_blocked',
    page_locator_available: row.page_locator_available === 'partial' ? 'partial' : 'not_checked',
    section_locator_available: row.section_locator_available === 'partial' ? 'partial' : 'not_checked',
    rule_locator_available: 'not_checked',
    table_locator_available: row.table_locator_available === 'partial' ? 'partial' : 'not_checked',
    formula_locator_available: 'not_checked',
    detected_locator_examples: '',
    locator_confidence: 'unknown',
    extraction_method: 'pdf_metadata_hash_only_no_local_pdf_text_extractor',
    extraction_quality_status: 'extraction_not_available',
    extraction_blockers: 'No existing local PDF text extraction dependency/CLI detected; no heavy dependency added in Phase 0.7.',
    notes: 'Raw PDF retained as primary local source candidate; locator extraction requires local PDF extractor or human PDF review.',
  })
}

function fromMissingCandidate(row: MatrixRow): LocatorEvidenceRow {
  return baseRow(row, undefined, {
    locator_status: 'locator_missing',
    page_locator_available: 'false',
    section_locator_available: 'false',
    rule_locator_available: 'false',
    table_locator_available: 'false',
    formula_locator_available: 'false',
    detected_locator_examples: '',
    locator_confidence: 'none',
    extraction_method: 'no_local_candidate',
    extraction_quality_status: 'extraction_not_available',
    extraction_blockers: 'No local raw/derived source candidate selected by reconciliation matrix.',
    notes: 'Official/local source evidence still required before packet review.',
  })
}

function baseRow(row: MatrixRow, file: LocalFile | undefined, extra: Pick<LocatorEvidenceRow, 'locator_status' | 'page_locator_available' | 'section_locator_available' | 'rule_locator_available' | 'table_locator_available' | 'formula_locator_available' | 'detected_locator_examples' | 'locator_confidence' | 'extraction_method' | 'extraction_quality_status' | 'extraction_blockers' | 'notes'>): LocatorEvidenceRow {
  return {
    source_family: row.source_family,
    bundle_id_if_applicable: row.bundle_id_if_applicable,
    document_code: row.document_code,
    document_title: row.document_title,
    risk_tier: row.risk_tier,
    source_file_path: file ? file.relative_path : '',
    source_file_hash: file ? file.sha256 : '',
    source_file_type: file ? file.extension.replace(/^\./, '') : 'none',
    official_pdf_hash: row.official_pdf_hash,
    local_raw_pdf_match_status: row.local_raw_pdf_match_status,
    local_derived_text_path: row.local_derived_text_path,
    derived_text_match_status: row.derived_text_match_status,
    ...extra,
    human_review_required: 'true',
    sme_review_required: row.risk_tier.toUpperCase() === 'HIGH' || row.risk_tier.toUpperCase() === 'CRITICAL' ? 'true' : row.sme_review_required,
    conflict_flag: row.conflict_flag,
    conflict_type: row.conflict_type,
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    next_action: nextActionFor(row, extra.locator_status),
    notes: [extra.notes, row.notes].filter(Boolean).join(' | '),
  }
}

function nextActionFor(row: MatrixRow, locatorStatus: LocatorStatus): string {
  if (row.local_raw_pdf_match_status === 'hash_mismatch' || row.local_raw_pdf_match_status === 'multiple_local_candidates') return 'Resolve hash/local-candidate conflict and spot-check locators before human/SME packet review.'
  if (row.conversion_layer_mismatch === 'true') return 'SME/human disposition required for conversion-layer mismatch; spot-check locator examples against raw PDF.'
  if (locatorStatus === 'locator_supported' || locatorStatus === 'locator_partial') return 'Prepare human/SME packet using locator examples as review aids only; do not approve source.'
  if (locatorStatus === 'extraction_blocked') return 'Use local PDF viewer/manual extraction or add approved lightweight local PDF extractor before packet review.'
  return row.next_action || 'Collect locator support and official evidence before packet review.'
}

function scanTextForLocators(text: string): PatternScan {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return {
    page: findExamples(lines, /\b(page|p\.)\s*(no\.?\s*)?\d+\b|^\s*[-–—]?\s*\d+\s*[-–—]?\s*$/i),
    section: findExamples(lines, /\b(sec\.?|section)\s+[\dA-Za-z][\dA-Za-z.\-]*(\s*\([a-z0-9]+\))?/i),
    rule: findExamples(lines, /\b(rule)\s+[IVXLCDM\d]+\b/i),
    table: findExamples(lines, /\b(table|schedule)\s+[\dA-Za-z][\dA-Za-z.\-]*/i),
    formula: findExamples(lines, /\b(formula|equation)\b|[A-Z]\s*=\s*[^\n]{1,80}/i),
    documentIdentifier: findExamples(lines, /\b(RA|R\.A\.|PD|P\.D\.|BP|B\.P\.|IRR|NBCP|Fire Code|Architecture Act)\b/i),
  }
}

function findExamples(lines: string[], pattern: RegExp): string[] {
  const hits: string[] = []
  for (const line of lines) {
    if (!pattern.test(line)) continue
    hits.push(line.replace(/\s+/g, ' ').slice(0, 180))
    if (hits.length >= 4) break
  }
  return Array.from(new Set(hits))
}

function locatorCounts(scan: PatternScan) {
  return { page: scan.page.length, section: scan.section.length, rule: scan.rule.length, table: scan.table.length, formula: scan.formula.length }
}

function boolAvailability(count: number): string {
  return count > 0 ? 'true' : 'false'
}

function isTextLike(file: LocalFile) {
  return ['.md', '.markdown', '.txt', '.json'].includes(file.extension)
}

function uniqueFiles(files: LocalFile[]): LocalFile[] {
  const seen = new Set<string>()
  const out: LocalFile[] = []
  for (const file of files) {
    if (seen.has(file.relative_path)) continue
    seen.add(file.relative_path)
    out.push(file)
  }
  return out
}

function safeReadText(filePath: string): string {
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8').replace(/\u0000/g, '')
}

function renderReport(rows: LocatorEvidenceRow[]): string {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.locator_status] = (acc[row.locator_status] ?? 0) + 1
    return acc
  }, {})
  const lines = [
    '# Phase 0.7 Source Locator Extraction Report',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    'Status: deterministic local output only. No source approval, source-pack creation, chunks, embeddings, article/question edits, Supabase mutation, or admin live sync occurred.',
    '',
    '## Summary',
    '',
    `- Rows: ${rows.length}`,
    `- Locator supported: ${counts.locator_supported ?? 0}`,
    `- Locator partial: ${counts.locator_partial ?? 0}`,
    `- Locator missing: ${counts.locator_missing ?? 0}`,
    `- Extraction blocked: ${counts.extraction_blocked ?? 0}`,
    `- Locator not checked: ${counts.locator_not_checked ?? 0}`,
    '',
    '## PDF extraction dependency posture',
    '',
    'No existing local PDF text extraction dependency/CLI was detected in this repo environment. Phase 0.7 did not add a heavy dependency. Raw PDFs remain primary local source candidates, while Markdown/text scans are review aids only.',
    '',
    '## Row results',
    '',
    '| source_family | source_file_type | locator_status | confidence | extraction_quality_status | conflict_type | next_action |',
    '|---|---:|---:|---:|---:|---|---|',
    ...rows.map((row) => `| ${escapePipe(row.source_family)} | ${row.source_file_type} | ${row.locator_status} | ${row.locator_confidence} | ${row.extraction_quality_status} | ${escapePipe(row.conflict_type)} | ${escapePipe(row.next_action)} |`),
    '',
    '## Gate status',
    '',
    '```text',
    'APPROVED_SOURCE_FILES = 0',
    'VERIFIED_SOURCE_CANDIDATES = 0',
    'SOURCE_PACKS_CREATED = 0',
    'CHUNKS_CREATED = 0',
    'EMBEDDINGS_CREATED = 0',
    'SOURCE_APPROVAL = BLOCKED',
    'SOURCE_PACK_CREATION = BLOCKED',
    'EMBEDDINGS = BLOCKED',
    'ARTICLE_REWRITING = BLOCKED',
    'QUESTION_BANK_EDITING = BLOCKED',
    'SUPABASE_MUTATION = BLOCKED',
    'ADMIN_AI_AUDIT_LIVE_SYNC = BLOCKED',
    'PHASE_1B = BLOCKED',
    '```',
  ]
  return lines.join('\n')
}

function escapePipe(value: string) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
