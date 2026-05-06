#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import * as path from 'node:path'

const batchId = process.argv[2]
if (!batchId) throw new Error('Usage: bun scripts/content-audit/verify-question-batch.ts <question-batch-id>')
const root = process.cwd()
const batchDir = path.join(root, '.ai/18_question_improvement/production_batches', batchId)
const ready = JSON.parse(readFileSync(path.join(batchDir, 'question-batch-publish-ready.generated.json'), 'utf8'))
const genericLeak = /\b(which is not accurate|not accurate|misconception|misunderstanding|not related|separate concept|oversimplification|misrepresents|historically inaccurate|ensuring all aspects|focusing on|allowing the architect|providing a formal directive|formal directive|outdated|trap|ALE|different concept|another subject|commonly tested|review center|exam trick|obviously|all of the above|none of the above|not valid|incorrect because|wrong because|this option is incorrect|review the correct answer above|correct answer above)\b/i
const legalOrPracticeOrDimensional = /\b(architect ownership|client rights?|copyright|contract(?:s|ual)?|SPP|standard of professional practice|RA\s*\d{3,5}|PD\s*\d{3,5}|BP\s*\d{3,5}|IRR|PRC|PRBoA|professional liability|civil code|article\s*\d+|fee(?:s)?|certificate(?:s)?|building official|occupancy permit|fire safety|accessibility|permit(?:s)?|setback(?:s)?|egress|ramp(?:s)?|toilet(?:s)?|washroom|elevator(?:s)?|corridor(?:s)?|stair(?:s)?|parking|sanitation|rule\s+(?:\d+|[IVXLC]+)|section\s+\d+|table\s+\d+|numbered provision|NHCP|IAPOA|UAP|PTR|architect[- ]of[- ]record|ownership|liability|\d+(?:\.\d+)?\s*(?:mm|cm|m|sqm|sq\.?\s*m|%|percent|pesos?|php|₱|feet|ft|days?|months?|years?|km|kilometers?))\b/i
function hasItemLevelOfficialEvidence(q: any): boolean {
  const blob = text([q.source_verification, q.source_evidence, q.source_locator, q.source_chunk_id, q.official_source_url, q.official_url, q.official_pdf, q.sources, q.citation, q.reference, q.metadata])
  const official = /\b(official\s+gazette|lawphil|supreme\s+court|e-?library|PRC|PRBoA|DPWH|NBCDO|NCDA|BFP|DOE|DHSUD|UAP|IAPOA|government|\.gov\.ph|official\s+pdf|source\s+pack|chunk\s*id|verified\s+local\s+source)\b/i.test(blob)
  const locator = /\b(section\s+\d+(?:\.\d+)*|sec\.\s*\d+|rule\s+(?:\d+|[IVXLC]+)|table\s+\d+|article\s+\d+|page\s+\d+|p\.\s*\d+|clause\s+\d+|chapter\s+\d+|\b(?:RA|PD|BP)\s*\d{3,5}\b|IRR|SPP\s*\d+|document\s+code|locator)\b/i.test(blob)
  const url = /https?:\/\/[^\s)]+/i.test(blob)
  return (official && locator) || (url && locator && /\b(official|gov\.ph|lawphil|prc|dpwh|ncda|bfp|dhsud|uap|pdf)\b/i.test(blob))
}
function text(v: unknown): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(text).join(' ')
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).map(text).join(' ')
  return String(v)
}
const problems: string[] = []
for (const row of ready) {
  const q = row.baseline || {}
  const options = Array.isArray(q.options) ? q.options : []
  const optText = options.map((o: any) => String(o.text || ''))
  const blob = [q.text, q.rationale, q.explanation, optText.join(' ')].map(text).join(' ')
  if (genericLeak.test(blob)) problems.push(`${row.question_id}: generic_meta_distractor_leakage`)
  if (text(q.explanation).trim() && !/^(|null|n\/a|none|tbd|to be added|placeholder|same as rationale|see rationale|refer to rationale)$/i.test(text(q.explanation).trim())) problems.push(`${row.question_id}: existing_explanation_overwrite`)
  if (row.proposed && Object.keys(row.proposed).join(',') !== 'explanation') problems.push(`${row.question_id}: proposed_non_explanation_field`)
  if (!q.correct_option_id) problems.push(`${row.question_id}: missing_correct_option_id`)
  const ids = new Set(optText.map(s => s.trim().toLowerCase()))
  if (ids.size !== optText.length) problems.push(`${row.question_id}: duplicate_option_text`)
  if (legalOrPracticeOrDimensional.test(blob) && !hasItemLevelOfficialEvidence(q)) problems.push(`${row.question_id}: item_level_official_source_gap`)
  const editPath = path.join(root, row.article_dir, 'question-edits', `${row.question_id}.json`)
  if (!existsSync(editPath)) problems.push(`${row.question_id}: missing_edit_file`)
}
console.log(JSON.stringify({ ok: problems.length === 0, batch: batchId, checked: ready.length, problems }, null, 2))
if (problems.length) process.exit(1)
