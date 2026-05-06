#!/usr/bin/env bun
import path from 'node:path'
import {
  GENERATED_AT,
  PLAN_DIR,
  assertNoPromotionStatusValues,
  readJson,
  writeJson,
  writeText,
  type MatrixRow,
} from './source-reconciliation-utils'

type LocatorEvidenceRow = Record<string, string>
type PacketRecommendation = 'needs_more_evidence' | 'ready_for_human_packet_review' | 'conflict_requires_sme' | 'reject_do_not_use'

type PacketPrep = {
  source_family: string
  bundle_id_if_applicable: string
  document_code: string
  document_title: string
  risk_tier: string
  current_status: PacketRecommendation
  official_evidence_summary: string
  local_raw_hash_summary: string
  derived_conversion_mismatch_summary: string
  locator_evidence_summary: string
  conflict_summary: string
  human_review_questions: string[]
  sme_review_questions: string[]
  required_decision_values: PacketRecommendation[]
  blocked_actions: string[]
  recommended_next_action: string
  human_review_required: 'true' | 'false'
  sme_review_required: 'true' | 'false'
  source_approval_status: 'blocked'
  source_pack_creation_status: 'blocked'
}

const matrixPath = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.json')
const locatorPath = path.join(PLAN_DIR, 'source-locator-evidence.generated.json')
const jsonOutput = path.join(PLAN_DIR, 'source-human-sme-packet-prep.generated.json')
const mdOutput = path.join(PLAN_DIR, 'source-human-sme-packet-prep.generated.md')
const humanQueueOutput = path.join(PLAN_DIR, 'source-human-sme-review-queue.generated.md')
const conflictQueueOutput = path.join(PLAN_DIR, 'source-human-sme-conflict-queue.generated.md')

async function main() {
  const matrix = readJson<{ rows?: MatrixRow[] }>(matrixPath, {})
  const locator = readJson<{ rows?: LocatorEvidenceRow[] }>(locatorPath, {})
  const rows = matrix.rows ?? []
  const locatorRows = locator.rows ?? []
  if (!rows.length) throw new Error('Missing source-reconciliation-matrix.generated.json rows.')
  if (!locatorRows.length) throw new Error('Missing source-locator-evidence.generated.json rows. Run extract-source-locators.ts first.')
  const packets = rows.map((row) => buildPacket(row, locatorRows.find((candidate) => candidate.source_family === row.source_family)))
  assertNoPromotionStatusValues(packets as unknown as Record<string, unknown>[])
  await writeJson(jsonOutput, {
    generated_at: GENERATED_AT,
    allowed_use: 'discovery_only',
    evidence_status: 'FALLBACK_REVIEW_ONLY',
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    packet_count: packets.length,
    packets,
  })
  await writeText(mdOutput, renderPacketPrep(packets))
  await writeText(humanQueueOutput, renderHumanQueue(packets))
  await writeText(conflictQueueOutput, renderConflictQueue(packets))
  console.log(JSON.stringify({ ok: true, packets: packets.length, outputs: [mdOutput, jsonOutput, humanQueueOutput, conflictQueueOutput] }, null, 2))
}

function buildPacket(row: MatrixRow, locator?: LocatorEvidenceRow): PacketPrep {
  const recommendation = recommendationFor(row, locator)
  const humanQuestions = [
    `Does the selected local candidate correspond to ${row.document_code || row.source_family}?`,
    `Are the locator examples sufficient to navigate the raw source file?`,
    'Are official-source access/provenance blockers accurately described?',
  ]
  const smeQuestions = [
    'Does the source version/effective date align with current LEA review needs?',
    'Do source conflicts affect legal/code instruction or exam preparation risk?',
  ]
  if (row.conversion_layer_mismatch === 'true') smeQuestions.push('Does the raw official-matching PDF override the derivative conversion-layer mismatch for future packet use?')
  if (row.local_raw_pdf_match_status !== 'exact_hash_match') smeQuestions.push('Which local candidate, if any, should be retained for future review?')
  return {
    source_family: row.source_family,
    bundle_id_if_applicable: row.bundle_id_if_applicable,
    document_code: row.document_code,
    document_title: row.document_title,
    risk_tier: row.risk_tier,
    current_status: recommendation,
    official_evidence_summary: row.official_pdf_hash ? `official_hash=${row.official_pdf_hash}; url=${row.official_pdf_url || 'not_recorded'}` : `official_hash_missing; url=${row.official_pdf_url || 'not_recorded'}`,
    local_raw_hash_summary: `match_status=${row.local_raw_pdf_match_status}; local_raw=${row.local_raw_pdf_path || 'none'}; local_hash=${row.local_raw_pdf_hash || 'none'}`,
    derived_conversion_mismatch_summary: `derived=${row.local_derived_text_path || 'none'}; derived_status=${row.derived_text_match_status}; conversion_layer_mismatch=${row.conversion_layer_mismatch}`,
    locator_evidence_summary: locator ? `locator_status=${locator.locator_status}; confidence=${locator.locator_confidence}; examples=${locator.detected_locator_examples || 'none'}; blockers=${locator.extraction_blockers || 'none'}` : 'locator evidence missing',
    conflict_summary: `conflict_flag=${row.conflict_flag}; conflict_type=${row.conflict_type}`,
    human_review_questions: humanQuestions,
    sme_review_questions: row.sme_review_required === 'true' ? smeQuestions : ['Confirm this logistics/non-law source is not being treated as legal/code truth.'],
    required_decision_values: ['needs_more_evidence', 'ready_for_human_packet_review', 'conflict_requires_sme', 'reject_do_not_use'],
    blocked_actions: ['source_approval', 'source_pack_creation', 'chunking', 'embeddings', 'article_rewriting', 'question_editing', 'supabase_mutation', 'admin_live_sync'],
    recommended_next_action: nextAction(row, locator, recommendation),
    human_review_required: row.human_review_required === 'true' ? 'true' : 'false',
    sme_review_required: row.sme_review_required === 'true' ? 'true' : 'false',
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
  }
}

function recommendationFor(row: MatrixRow, locator?: LocatorEvidenceRow): PacketRecommendation {
  if (row.local_raw_pdf_match_status === 'hash_mismatch' || row.local_raw_pdf_match_status === 'multiple_local_candidates' || row.conversion_layer_mismatch === 'true') return 'conflict_requires_sme'
  if (/do_not_use|logistics_only_not_law_source/i.test(row.conflict_type)) return row.document_code.toLowerCase().includes('prc') ? 'needs_more_evidence' : 'reject_do_not_use'
  if (!row.official_pdf_hash && !row.official_pdf_url) return 'needs_more_evidence'
  if (!locator || ['locator_missing', 'extraction_blocked', 'locator_not_checked', 'unknown'].includes(locator.locator_status)) return 'needs_more_evidence'
  return 'ready_for_human_packet_review'
}

function nextAction(row: MatrixRow, locator: LocatorEvidenceRow | undefined, recommendation: PacketRecommendation): string {
  if (recommendation === 'conflict_requires_sme') return 'Prepare conflict packet for human/SME disposition; do not approve or package source.'
  if (recommendation === 'ready_for_human_packet_review') return 'Queue for future human packet review using locator evidence as navigation aid only.'
  if (locator?.locator_status === 'extraction_blocked') return 'Use manual PDF review or approved local PDF extractor to collect locators before packet review.'
  return row.next_action || 'Collect additional official evidence and locators before review.'
}

function renderPacketPrep(packets: PacketPrep[]): string {
  return [
    '# Phase 0.7 Human/SME Packet Preparation',
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    'Status: preparation only. No source approval, source-pack creation, embeddings, article/question edits, Supabase mutation, or admin live sync occurred.',
    '',
    ...packets.flatMap((packet) => [
      `## ${packet.source_family}`,
      '',
      `- Current status: \`${packet.current_status}\``,
      `- Risk tier: ${packet.risk_tier}`,
      `- Official evidence: ${packet.official_evidence_summary}`,
      `- Local raw hash: ${packet.local_raw_hash_summary}`,
      `- Derived/conversion: ${packet.derived_conversion_mismatch_summary}`,
      `- Locator evidence: ${packet.locator_evidence_summary}`,
      `- Conflict: ${packet.conflict_summary}`,
      `- Required decision values: ${packet.required_decision_values.map((value) => `\`${value}\``).join(', ')}`,
      `- Blocked actions: ${packet.blocked_actions.join(', ')}`,
      `- Recommended next action: ${packet.recommended_next_action}`,
      '',
      'Human review questions:',
      ...packet.human_review_questions.map((q) => `- ${q}`),
      '',
      'SME review questions:',
      ...packet.sme_review_questions.map((q) => `- ${q}`),
      '',
    ]),
  ].join('\n')
}

function renderHumanQueue(packets: PacketPrep[]): string {
  const queued = packets.filter((packet) => ['ready_for_human_packet_review', 'conflict_requires_sme', 'needs_more_evidence'].includes(packet.current_status))
  return ['# Source Human/SME Review Queue', '', `Generated: ${GENERATED_AT}`, '', ...queued.map((packet) => `- ${packet.source_family}: \`${packet.current_status}\` — ${packet.recommended_next_action}`), ''].join('\n')
}

function renderConflictQueue(packets: PacketPrep[]): string {
  const conflicts = packets.filter((packet) => packet.current_status === 'conflict_requires_sme' || packet.conflict_summary.includes('true'))
  return ['# Source Human/SME Conflict Queue', '', `Generated: ${GENERATED_AT}`, '', ...conflicts.map((packet) => `- ${packet.source_family}: ${packet.conflict_summary}; ${packet.recommended_next_action}`), ''].join('\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
