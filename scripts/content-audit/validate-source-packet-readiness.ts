#!/usr/bin/env bun
import path from 'node:path'
import {
  GENERATED_AT,
  PLAN_DIR,
  assertNoPromotionStatusValues,
  readJson,
  readinessForRow,
  writeJson,
  writeText,
  type MatrixRow,
} from './source-reconciliation-utils'

const matrixPath = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.json')
const mdOutput = path.join(PLAN_DIR, 'source-packet-readiness-check.generated.md')
const jsonOutput = path.join(PLAN_DIR, 'source-packet-readiness-check.generated.json')

type ReadinessState =
  | 'blocked_missing_official_evidence'
  | 'blocked_hash_mismatch'
  | 'blocked_conversion_mismatch'
  | 'blocked_missing_locators'
  | 'blocked_needs_sme_review'
  | 'eligible_for_future_human_review'
  | 'insufficient_evidence'

async function main() {
  const matrix = readJson<{ rows?: MatrixRow[] }>(matrixPath, {})
  const rows = matrix.rows ?? []
  if (!rows.length) throw new Error(`Matrix missing or empty. Run build-source-reconciliation-matrix.ts first: ${matrixPath}`)
  const checks = rows.map((row) => {
    const readiness_state = readinessForRow(row) as ReadinessState
    const blockers = blockersFor(row, readiness_state)
    return {
      source_family: row.source_family,
      bundle_id_if_applicable: row.bundle_id_if_applicable,
      document_code: row.document_code,
      risk_tier: row.risk_tier,
      readiness_state,
      blockers,
      human_review_required: 'true',
      sme_review_required: row.sme_review_required,
      source_approval_status: 'blocked',
      source_pack_creation_status: 'blocked',
      next_action: row.next_action,
    }
  })
  assertNoPromotionStatusValues(checks as unknown as Record<string, unknown>[])
  await writeJson(jsonOutput, {
    generated_at: GENERATED_AT,
    allowed_use: 'discovery_only',
    evidence_status: 'FALLBACK_REVIEW_ONLY',
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    check_count: checks.length,
    checks,
  })
  await writeText(mdOutput, render(checks))
  console.log(JSON.stringify({ ok: true, checks: checks.length, outputs: [mdOutput, jsonOutput] }, null, 2))
}

function blockersFor(row: MatrixRow, readiness: ReadinessState): string[] {
  const blockers: string[] = []
  if (readiness === 'eligible_for_future_human_review') {
    blockers.push('Future human review still required; script does not approve sources.')
    if (row.risk_tier.toUpperCase() === 'HIGH' || row.risk_tier.toUpperCase() === 'CRITICAL') blockers.push('SME review required for high-risk law/code/policy material.')
    return blockers
  }
  if (!row.official_pdf_hash && !row.official_pdf_url) blockers.push('Missing opened official PDF/hash evidence.')
  if (row.local_raw_pdf_match_status === 'hash_mismatch') blockers.push('Local raw PDF hash differs from official PDF hash.')
  if (row.local_raw_pdf_match_status === 'multiple_local_candidates') blockers.push('Multiple local candidates require human selection before packet use.')
  if (row.local_raw_pdf_match_status === 'no_local_pdf') blockers.push('No local raw PDF candidate found.')
  if (row.conversion_layer_mismatch === 'true') blockers.push('Derived/OCR/conversion layer mismatch requires disposition against raw PDF.')
  if (row.locator_status !== 'locator_supported') blockers.push('Page/section/table locators are missing, partial, or not checked.')
  if (row.sme_review_required === 'true') blockers.push('SME review required before any future promotion.')
  if (!blockers.length) blockers.push('Insufficient evidence for deterministic readiness classification.')
  return blockers
}

function render(checks: Array<{ source_family: string; document_code: string; readiness_state: string; blockers: string[]; next_action: string }>) {
  const counts = checks.reduce<Record<string, number>>((acc, check) => {
    acc[check.readiness_state] = (acc[check.readiness_state] ?? 0) + 1
    return acc
  }, {})
  const lines = [
    '# Phase 0.6 Source Packet Readiness Check',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    'This is a future-approval eligibility screen only. It does not approve sources, create source packs, create embeddings, edit articles/questions, mutate Supabase, or sync live admin audit data.',
    '',
    '## Counts',
    '',
    ...Object.entries(counts).sort().map(([state, count]) => `- ${state}: ${count}`),
    '',
    '## Checks',
    '',
    '| source_family | document_code | readiness_state | blockers | next_action |',
    '|---|---|---|---|---|',
  ]
  for (const check of checks) {
    lines.push(`| ${cell(check.source_family)} | ${cell(check.document_code)} | ${check.readiness_state} | ${cell(check.blockers.join('; '))} | ${cell(check.next_action)} |`)
  }
  return lines.join('\n')
}

function cell(value: string) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
