#!/usr/bin/env bun
import path from 'node:path'
import {
  GENERATED_AT,
  PLAN_DIR,
  assertNoPromotionStatusValues,
  createRunId,
  readJson,
  writeJson,
  writeText,
  type MatrixRow,
} from './source-reconciliation-utils'

const matrixPath = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.json')
const leadsPath = path.join(PLAN_DIR, 'phase05b6-claude-reconciled-source-leads.generated.json')
const locatorPath = path.join(PLAN_DIR, 'source-locator-evidence.generated.json')
const packetPrepPath = path.join(PLAN_DIR, 'source-human-sme-packet-prep.generated.json')
const jsonOutput = path.join(PLAN_DIR, 'admin-ai-audit-source-payload.dry-run.json')
const validationOutput = path.join(PLAN_DIR, 'admin-ai-audit-source-payload-validation.md')

async function main() {
  const matrix = readJson<{ rows?: MatrixRow[] }>(matrixPath, {})
  const leads = readJson<Record<string, string>[]>(leadsPath, [])
  const rows = matrix.rows ?? []
  const locatorEvidence = readJson<{ rows?: Record<string, string>[] }>(locatorPath, {}).rows ?? []
  const packetPrep = readJson<{ packets?: Record<string, unknown>[] }>(packetPrepPath, {}).packets ?? []
  if (!rows.length) throw new Error('Missing source-reconciliation-matrix.generated.json rows. Run build-source-reconciliation-matrix.ts first.')
  const runId = createRunId()
  const run = {
    run_id: runId,
    run_type: 'source_reconciliation_dry_run',
    generated_at: GENERATED_AT,
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    supabase_mutation_status: 'blocked',
    admin_live_sync_status: 'blocked',
    allowed_use: 'discovery_only',
    evidence_status: 'FALLBACK_REVIEW_ONLY',
  }
  const items = rows.map((row, index) => ({
    item_id: `${runId}-item-${String(index + 1).padStart(3, '0')}`,
    run_id: runId,
    source_family: row.source_family,
    bundle_id_if_applicable: row.bundle_id_if_applicable,
    document_code: row.document_code,
    risk_tier: row.risk_tier,
    local_raw_pdf_match_status: row.local_raw_pdf_match_status,
    locator_status: row.locator_status,
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
  }))
  const findings = rows.flatMap((row, index) => findingsFor(row, `${runId}-item-${String(index + 1).padStart(3, '0')}`))
  const proposals = rows.map((row, index) => ({
    proposal_id: `${runId}-proposal-${String(index + 1).padStart(3, '0')}`,
    item_id: `${runId}-item-${String(index + 1).padStart(3, '0')}`,
    proposal_type: 'maintain_blocked_gate_and_collect_evidence',
    proposal_status: 'blocked',
    allowed_use_change: 'none',
    source_approval_change: 'none',
    article_content_change: 'none',
    question_content_change: 'none',
    proposed_next_action: row.next_action,
  }))

  const payload = {
    dry_run: true,
    db_write_attempted: false,
    generated_at: GENERATED_AT,
    source_files: [path.relative(process.cwd(), matrixPath), path.relative(process.cwd(), leadsPath), path.relative(process.cwd(), locatorPath), path.relative(process.cwd(), packetPrepPath)],
    lead_count: leads.length,
    locator_evidence_count: locatorEvidence.length,
    human_sme_packet_prep_count: packetPrep.length,
    run,
    items,
    locator_evidence: locatorEvidence.map((row) => ({
      source_family: row.source_family,
      locator_status: row.locator_status,
      locator_confidence: row.locator_confidence,
      extraction_quality_status: row.extraction_quality_status,
      source_approval_status: 'blocked',
      source_pack_creation_status: 'blocked',
    })),
    human_sme_packet_prep: packetPrep.map((packet) => ({
      source_family: String(packet.source_family ?? ''),
      current_status: String(packet.current_status ?? ''),
      recommended_next_action: String(packet.recommended_next_action ?? ''),
      source_approval_status: 'blocked',
      source_pack_creation_status: 'blocked',
    })),
    findings,
    proposals,
  }
  assertNoPromotionStatusValues([run, ...items, ...findings, ...proposals] as unknown as Record<string, unknown>[])
  validatePayload(payload)
  await writeJson(jsonOutput, payload)
  await writeText(validationOutput, renderValidation(payload))
  console.log(JSON.stringify({ ok: true, items: items.length, findings: findings.length, proposals: proposals.length, outputs: [jsonOutput, validationOutput] }, null, 2))
}

function findingsFor(row: MatrixRow, itemId: string) {
  const findings: Array<Record<string, string>> = []
  if (!row.official_pdf_hash && !row.official_pdf_url) findings.push(finding(itemId, 'missing_official_evidence', 'Missing official PDF hash/URL evidence.'))
  if (row.local_raw_pdf_match_status === 'hash_mismatch' || row.local_raw_pdf_match_status === 'multiple_local_candidates') findings.push(finding(itemId, 'local_hash_conflict', row.conflict_type))
  if (row.local_raw_pdf_match_status === 'no_local_pdf') findings.push(finding(itemId, 'missing_local_raw_pdf', 'No local raw PDF candidate found.'))
  if (row.locator_status !== 'locator_supported') findings.push(finding(itemId, 'missing_or_partial_locators', `locator_status=${row.locator_status}`))
  if (row.sme_review_required === 'true') findings.push(finding(itemId, 'sme_review_required', 'High-risk law/code/policy row requires SME review.'))
  if (row.conversion_layer_mismatch === 'true') findings.push(finding(itemId, 'conversion_layer_mismatch', row.conflict_type))
  if (!findings.length) findings.push(finding(itemId, 'future_human_review_required', 'Human review still required; dry-run does not approve.'))
  return findings
}

function finding(itemId: string, findingType: string, message: string) {
  return {
    finding_id: `${itemId}-${findingType}`,
    item_id: itemId,
    finding_type: findingType,
    severity: 'review_required',
    message,
    source_approval_status: 'blocked',
  }
}

function validatePayload(payload: { dry_run: boolean; db_write_attempted: boolean; proposals: Array<Record<string, string>> }) {
  if (!payload.dry_run) throw new Error('Payload must remain dry_run=true.')
  if (payload.db_write_attempted) throw new Error('Payload must not attempt DB writes.')
  for (const proposal of payload.proposals) {
    if (proposal.allowed_use_change !== 'none') throw new Error('Proposal attempted allowed_use change.')
    if (proposal.source_approval_change !== 'none') throw new Error('Proposal attempted source approval change.')
    if (proposal.article_content_change !== 'none') throw new Error('Proposal attempted article content change.')
    if (proposal.question_content_change !== 'none') throw new Error('Proposal attempted question content change.')
  }
}

function renderValidation(payload: { items: unknown[]; findings: unknown[]; proposals: unknown[] }) {
  return [
    '# Admin AI Audit Source Payload Validation',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    'Result: PASS',
    '',
    `- Items: ${payload.items.length}`,
    `- Findings: ${payload.findings.length}`,
    `- Proposals: ${payload.proposals.length}`,
    '- dry_run: true',
    '- db_write_attempted: false',
    '- allowed_use changes: none',
    '- source approval changes: none',
    '- locator evidence included when generated: dry-run summary only',
    '- human/SME packet prep included when generated: dry-run summary only',
    '- article/question content changes: none',
    '- Supabase mutation: none',
  ].join('\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
