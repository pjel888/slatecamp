#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, assertNoPromotionStatusValues, readJson, writeJson, writeText } from './source-reconciliation-utils'

const payloadPath = path.join(PLAN_DIR, 'admin-ai-audit-source-payload.dry-run.json')
const jsonOutput = path.join(PLAN_DIR, 'admin-ai-audit-source-payload-schema-validation.json')
const mdOutput = path.join(PLAN_DIR, 'admin-ai-audit-source-payload-schema-validation.md')

type Check = { name: string; status: 'PASS' | 'FAIL'; details: string }

function check(name: string, condition: boolean, details = condition ? 'ok' : 'failed'): Check {
  return { name, status: condition ? 'PASS' : 'FAIL', details }
}

async function main() {
  const payload = readJson<Record<string, any>>(payloadPath, {})
  const records: Record<string, unknown>[] = []
  for (const key of ['items', 'findings', 'proposals', 'locator_evidence', 'human_sme_packet_prep']) {
    if (Array.isArray(payload[key])) records.push(...payload[key])
  }
  let promotionScan = true
  let promotionError = ''
  try {
    assertNoPromotionStatusValues(records)
  } catch (error) {
    promotionScan = false
    promotionError = error instanceof Error ? error.message : String(error)
  }

  const proposalTypes = new Set((payload.proposals ?? []).map((proposal: any) => String(proposal.proposal_type ?? '')))
  const checks: Check[] = [
    check('payload_json_parses', Boolean(payload.generated_at)),
    check('dry_run_true', payload.dry_run === true),
    check('db_write_attempted_false', payload.db_write_attempted === false),
    check('no_apply_mode', payload.apply_mode !== true && payload.mode !== 'apply'),
    check('items_present', Array.isArray(payload.items) && payload.items.length > 0),
    check('findings_present', Array.isArray(payload.findings) && payload.findings.length > 0),
    check('proposals_present', Array.isArray(payload.proposals) && payload.proposals.length > 0),
    check('proposals_blocked', (payload.proposals ?? []).every((proposal: any) => proposal.proposal_status === 'blocked')),
    check('no_approval_proposals', !proposalTypes.has('source_approval')),
    check('no_source_pack_proposals', !proposalTypes.has('source_pack_creation')),
    check('no_embedding_proposals', !proposalTypes.has('embedding_creation')),
    check('no_article_proposals', !proposalTypes.has('article_edit') && !proposalTypes.has('article_rewrite')),
    check('no_question_proposals', !proposalTypes.has('question_edit') && !proposalTypes.has('question_rewrite')),
    check('allowed_use_not_promoted', (payload.proposals ?? []).every((proposal: any) => proposal.allowed_use_change === 'none')),
    check('source_approval_not_promoted', (payload.proposals ?? []).every((proposal: any) => proposal.source_approval_change === 'none')),
    check('article_question_not_changed', (payload.proposals ?? []).every((proposal: any) => proposal.article_content_change === 'none' && proposal.question_content_change === 'none')),
    check('locator_evidence_count_matches', Array.isArray(payload.locator_evidence) && payload.locator_evidence_count === payload.locator_evidence.length),
    check('human_packet_count_matches', Array.isArray(payload.human_sme_packet_prep) && payload.human_sme_packet_prep_count === payload.human_sme_packet_prep.length),
    check('promotion_scan_passes', promotionScan, promotionError || 'ok'),
  ]
  const ok = checks.every((item) => item.status === 'PASS')
  const result = { generated_at: new Date().toISOString(), ok, check_count: checks.length, checks, payload_path: payloadPath }
  await writeJson(jsonOutput, result)
  await writeText(mdOutput, ['# Admin AI Audit Source Payload Schema Validation', '', `Result: ${ok ? 'PASS' : 'FAIL'}`, '', ...checks.map((item) => `- ${item.status}: ${item.name} — ${item.details}`), ''].join('\n'))
  console.log(JSON.stringify({ ok, checks: checks.length, outputs: [mdOutput, jsonOutput] }, null, 2))
  if (!ok) process.exit(1)
}

main().catch((error) => { console.error(error); process.exit(1) })
