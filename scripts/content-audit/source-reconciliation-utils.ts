import { createHash, randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import * as Papa from 'papaparse'

export const REPO_ROOT = process.cwd()
export const PLAN_DIR = path.join(REPO_ROOT, '.ai/03_plans/content-editorial-pipeline-2026-05-05')
export const VITRUVIUS_DIR = path.join(REPO_ROOT, 'vitruvius-connection')
export const RAW_SOURCE_DIR = path.join(VITRUVIUS_DIR, '001_Raw-Source-Layer')
export const GENERATED_AT = new Date().toISOString()

export const FORBIDDEN_PROMOTION_VALUES = [
  'approved',
  'verified',
  'canonical',
  'source_pack_ready',
  'source-pack-ready',
  'safe_to_rewrite',
  'ready_for_embeddings',
  'embedding-ready',
  'ready_for_rewrite',
  'ready_for_article_rewrite',
  'ready_for_question_edit',
]

export type EvidenceLead = Record<string, string>

export type LocalFile = {
  path: string
  relative_path: string
  layer: string
  extension: string
  size_bytes: number
  sha256: string
  candidate_score?: number
}

export type MatrixRow = {
  source_family: string
  bundle_id_if_applicable: string
  document_code: string
  document_title: string
  risk_tier: string
  official_pdf_hash: string
  official_pdf_url: string
  official_publisher_or_issuing_body: string
  local_raw_pdf_path: string
  local_raw_pdf_hash: string
  local_raw_pdf_match_status: 'exact_hash_match' | 'hash_mismatch' | 'no_local_pdf' | 'multiple_local_candidates' | 'unknown'
  local_derived_text_path: string
  local_derived_text_hash: string
  derived_text_match_status: 'not_checked' | 'text_spotcheck_needed' | 'text_mismatch_suspected' | 'no_derived_text' | 'unknown'
  conversion_layer_mismatch: string
  locator_status: 'locator_supported' | 'locator_partial' | 'locator_missing' | 'locator_not_checked' | 'unknown'
  page_locator_available: string
  section_locator_available: string
  table_locator_available: string
  extraction_quality_status: string
  conflict_flag: string
  conflict_type: string
  human_review_required: string
  sme_review_required: string
  source_approval_status: 'blocked'
  source_pack_creation_status: 'blocked'
  next_action: string
  notes: string
  local_candidate_count: string
  local_candidate_paths: string
}

export function sha256File(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

export function sha256Text(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export async function writeJson(filePath: string, data: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

export async function writeText(filePath: string, data: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, data.endsWith('\n') ? data : `${data}\n`)
}

export async function writeCsv(filePath: string, rows: Record<string, unknown>[], fields: string[]) {
  await mkdir(path.dirname(filePath), { recursive: true })
  const csv = Papa.unparse(rows, { columns: fields, header: true })
  await writeFile(filePath, `${csv}\n`)
}

export function readJson<T = unknown>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) return fallback
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T
}

export function readCsv(filePath: string): EvidenceLead[] {
  if (!existsSync(filePath)) return []
  const parsed = Papa.parse<Record<string, string>>(readFileSync(filePath, 'utf-8'), {
    header: true,
    skipEmptyLines: true,
  })
  if (parsed.errors.length) {
    throw new Error(`CSV parse failed for ${filePath}: ${parsed.errors.map((e) => e.message).join('; ')}`)
  }
  return parsed.data.map((row) => {
    const out: EvidenceLead = {}
    for (const [key, value] of Object.entries(row)) out[key] = value == null ? '' : String(value)
    return out
  })
}

export function scanVitruviusFiles(): LocalFile[] {
  const files: LocalFile[] = []
  if (!existsSync(VITRUVIUS_DIR)) return files
  const stack = [VITRUVIUS_DIR]
  while (stack.length) {
    const dir = stack.pop()!
    for (const entry of readdirSync(dir)) {
      if (entry === '.DS_Store') continue
      const full = path.join(dir, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) {
        stack.push(full)
        continue
      }
      const ext = path.extname(entry).toLowerCase()
      if (!['.pdf', '.md', '.markdown', '.txt', '.json'].includes(ext)) continue
      const rel = path.relative(VITRUVIUS_DIR, full)
      files.push({
        path: full,
        relative_path: rel,
        layer: rel.split(path.sep)[0] ?? 'unknown',
        extension: ext,
        size_bytes: stat.size,
        sha256: sha256File(full),
      })
    }
  }
  return files.sort((a, b) => a.relative_path.localeCompare(b.relative_path))
}

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function tokensForLead(lead: EvidenceLead): string[] {
  const joined = [lead.document_code, lead.document_title, lead.source_family, lead.pdf_filename]
    .filter(Boolean)
    .join(' ')
  const rawTokens = normalizeText(joined).split(/\s+/).filter(Boolean)
  const useful = rawTokens.filter((token) => token.length >= 3 && !['the', 'and', 'for', 'with', 'act', 'irr', 'pdf'].includes(token))
  return Array.from(new Set(useful))
}

export function findCandidates(lead: EvidenceLead, files: LocalFile[], extensionSet?: Set<string>): LocalFile[] {
  const explicitLocalAbsence = /not[_ -]?found|absent|no local/i.test(String(lead.local_pdf_available || ''))
  if (explicitLocalAbsence && (!lead.local_file_hash_if_known || String(lead.local_file_hash_if_known).trim() === '')) return []
  const officialHash = lead.pdf_hash_if_downloaded || ''
  const tokens = tokensForLead(lead)
  const code = normalizeText(lead.document_code || '')
  const scored = files
    .filter((file) => !extensionSet || extensionSet.has(file.extension))
    .map((file) => {
      const haystack = normalizeText(file.relative_path)
      let score = 0
      if (officialHash && file.sha256 === officialHash) score += 1000
      if (code && haystack.includes(code)) score += 80
      for (const token of tokens) if (haystack.includes(token)) score += token.length >= 6 ? 6 : 3
      if (file.layer.startsWith('001')) score += 10
      if (file.layer.startsWith('002')) score += 4
      return { ...file, candidate_score: score }
    })
    .filter((file) => (file.candidate_score ?? 0) > 0)
    .sort((a, b) => (b.candidate_score ?? 0) - (a.candidate_score ?? 0) || a.relative_path.localeCompare(b.relative_path))
  return scored.slice(0, 12)
}

export function boolString(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  const text = String(value ?? '').trim().toLowerCase()
  if (['true', 'yes', '1'].includes(text)) return 'true'
  if (['false', 'no', '0'].includes(text)) return 'false'
  return text || 'false'
}

export function deriveLocatorStatus(lead: EvidenceLead, derived: LocalFile[]): MatrixRow['locator_status'] {
  const evidence = String(lead.locator_evidence_found || '').toLowerCase()
  if (evidence.includes('partial')) return 'locator_partial'
  if (evidence.includes('not_yet') || evidence.includes('not yet')) return 'locator_not_checked'
  if (evidence.includes('missing') || evidence.includes('none')) return 'locator_missing'
  if (evidence.includes('found') || evidence.includes('yes')) return 'locator_supported'
  if (derived.length) return 'locator_not_checked'
  return 'locator_missing'
}

export function cleanUrl(value: string): string {
  const first = String(value || '').trim().split(/\s+/)[0] || ''
  return URL.canParse(first) ? first : ''
}

export function buildMatrixRow(lead: EvidenceLead, files: LocalFile[]): MatrixRow {
  const officialHash = lead.pdf_hash_if_downloaded || ''
  const pdfCandidates = findCandidates(lead, files, new Set(['.pdf']))
  const rawPdfCandidates = pdfCandidates.filter((file) => file.layer.startsWith('001'))
  const derivedCandidates = findCandidates(lead, files, new Set(['.md', '.markdown', '.txt', '.json'])).filter((file) => !file.layer.startsWith('001'))
  const exact = rawPdfCandidates.find((file) => officialHash && file.sha256 === officialHash)
  const selectedRaw = exact ?? rawPdfCandidates[0] ?? pdfCandidates[0]
  let matchStatus: MatrixRow['local_raw_pdf_match_status'] = 'unknown'
  if (!selectedRaw) matchStatus = 'no_local_pdf'
  else if (officialHash && selectedRaw.sha256 === officialHash) matchStatus = 'exact_hash_match'
  else if (rawPdfCandidates.length > 1 && !exact) matchStatus = 'multiple_local_candidates'
  else if (officialHash) matchStatus = 'hash_mismatch'

  const derived = derivedCandidates[0]
  const conflictType = lead.conflict_type || (matchStatus === 'hash_mismatch' ? 'local_raw_pdf_hash_mismatch' : '')
  const conversionMismatch = /conversion|ocr|derived/i.test(`${lead.local_file_hash_if_known || ''} ${conflictType}`)
  const locatorStatus = deriveLocatorStatus(lead, derivedCandidates)
  const riskTier = lead.risk_tier || 'UNKNOWN'
  const isHighLaw = ['HIGH', 'CRITICAL'].includes(riskTier.toUpperCase())

  return {
    source_family: lead.source_family || '',
    bundle_id_if_applicable: lead.bundle_id_if_applicable || '',
    document_code: lead.document_code || lead.visible_document_code || '',
    document_title: lead.document_title || lead.visible_document_title || '',
    risk_tier: riskTier,
    official_pdf_hash: officialHash,
    official_pdf_url: cleanUrl(lead.pdf_url) || cleanUrl(lead.official_gazette_link_if_any) || '',
    official_publisher_or_issuing_body: lead.publisher_or_issuing_body || '',
    local_raw_pdf_path: selectedRaw?.relative_path ?? '',
    local_raw_pdf_hash: selectedRaw?.sha256 ?? '',
    local_raw_pdf_match_status: matchStatus,
    local_derived_text_path: derived?.relative_path ?? '',
    local_derived_text_hash: derived?.sha256 ?? '',
    derived_text_match_status: derived ? (conversionMismatch ? 'text_mismatch_suspected' : 'text_spotcheck_needed') : 'no_derived_text',
    conversion_layer_mismatch: conversionMismatch ? 'true' : 'false',
    locator_status: locatorStatus,
    page_locator_available: locatorStatus === 'locator_supported' || locatorStatus === 'locator_partial' ? 'partial' : 'false',
    section_locator_available: locatorStatus === 'locator_supported' || locatorStatus === 'locator_partial' ? 'partial' : 'false',
    table_locator_available: 'not_checked',
    extraction_quality_status: derived ? 'not_checked' : 'no_derived_text',
    conflict_flag: boolString(lead.conflict_flag) === 'true' || matchStatus === 'hash_mismatch' || conversionMismatch ? 'true' : 'false',
    conflict_type: conflictType || (matchStatus === 'multiple_local_candidates' ? 'multiple_local_candidates' : 'none_detected_by_script'),
    human_review_required: 'true',
    sme_review_required: isHighLaw ? 'true' : boolString(lead.sme_review_required),
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    next_action: lead.next_action || 'Human/SME review and locator extraction remain required before any source-pack action.',
    notes: [lead.evidence_notes, selectedRaw && `selected_local_score=${selectedRaw.candidate_score}`, `all_vitruvius_files_scanned=${files.length}`]
      .filter(Boolean)
      .join(' | '),
    local_candidate_count: String(pdfCandidates.length + derivedCandidates.length),
    local_candidate_paths: [...pdfCandidates, ...derivedCandidates].slice(0, 20).map((file) => `${file.relative_path}#${file.sha256}`).join(' ; '),
  }
}

export function matrixFields(): string[] {
  return [
    'source_family','bundle_id_if_applicable','document_code','document_title','risk_tier','official_pdf_hash','official_pdf_url','official_publisher_or_issuing_body','local_raw_pdf_path','local_raw_pdf_hash','local_raw_pdf_match_status','local_derived_text_path','local_derived_text_hash','derived_text_match_status','conversion_layer_mismatch','locator_status','page_locator_available','section_locator_available','table_locator_available','extraction_quality_status','conflict_flag','conflict_type','human_review_required','sme_review_required','source_approval_status','source_pack_creation_status','next_action','notes','local_candidate_count','local_candidate_paths',
  ]
}

export function readinessForRow(row: MatrixRow): string {
  if (!row.official_pdf_hash && !row.official_pdf_url) return 'blocked_missing_official_evidence'
  if (row.local_raw_pdf_match_status === 'hash_mismatch' || row.local_raw_pdf_match_status === 'multiple_local_candidates') return 'blocked_hash_mismatch'
  if (row.conversion_layer_mismatch === 'true') return 'blocked_conversion_mismatch'
  if (row.locator_status !== 'locator_supported') return 'blocked_missing_locators'
  if (row.sme_review_required === 'true') return 'blocked_needs_sme_review'
  if (row.local_raw_pdf_match_status === 'exact_hash_match') return 'eligible_for_future_human_review'
  return 'insufficient_evidence'
}

export function assertNoPromotionStatusValues(records: Record<string, unknown>[]) {
  const offenders: string[] = []
  const statusKeyPattern = /(status|state|decision|readiness|approval|creation|match|flag|recommendation|proposal_type)$/i
  for (const [index, record] of records.entries()) {
    for (const [key, value] of Object.entries(record)) {
      if (!statusKeyPattern.test(key)) continue
      const text = String(value ?? '').toLowerCase()
      for (const forbidden of FORBIDDEN_PROMOTION_VALUES) {
        if (text.includes(forbidden)) offenders.push(`row ${index + 1} ${key}=${value}`)
      }
    }
  }
  if (offenders.length) throw new Error(`Forbidden promotion status values found:\n${offenders.join('\n')}`)
}

export function createRunId(prefix = 'phase06-source-reconciliation'): string {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`
}
