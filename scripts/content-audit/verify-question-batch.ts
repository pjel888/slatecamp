#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import * as path from 'node:path'

const batchId = process.argv[2]
if (!batchId) throw new Error('Usage: bun scripts/content-audit/verify-question-batch.ts <question-batch-id>')
const root = process.cwd()
const batchDir = path.join(root, '.ai/18_question_improvement/production_batches', batchId)
const ready = JSON.parse(readFileSync(path.join(batchDir, 'question-batch-publish-ready.generated.json'), 'utf8'))
const genericLeak = /\b(which is not accurate|not accurate|misconception|misunderstanding|not related|separate concept|oversimplification|misrepresents|historically inaccurate|ensuring all aspects|focusing on|allowing the architect|providing a formal directive|formal directive|outdated|trap|ALE|different concept|another subject|commonly tested|review center|exam trick|obviously|all of the above|none of the above|not valid|incorrect because|wrong because)\b/i
const profPractice = /\b(architect ownership|client rights?|copyright|contract(?:s|ual)?|SPP|standard of professional practice|RA\s*9266|PRC|PRBoA|professional liability|civil code|article\s*1723|fee(?:s)?|certificate(?:s)?|building official|occupancy permit|fire safety|accessibility|BP\s*344|PD\s*1096|RA\s*9514|permit(?:s)?|setback(?:s)?|egress|ramp(?:s)?|toilet(?:s)?|elevator(?:s)?|corridor(?:s)?|stair(?:s)?|parking|sanitation|rule|section|table|numbered provision|\d+(?:\.\d+)?\s*(?:mm|cm|m|sqm|sq\.?\s*m|%|percent|pesos?|php|₱|feet|ft|days?|months?|years?|km|kilometers?))\b/i
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
  if (profPractice.test(blob) && !text([q.code_citation, q.source_verification, q.sources, q.citation, q.reference]).trim()) problems.push(`${row.question_id}: professional_practice_or_dimensional_source_gap`)
  const editPath = path.join(root, row.article_dir, 'question-edits', `${row.question_id}.json`)
  if (!existsSync(editPath)) problems.push(`${row.question_id}: missing_edit_file`)
}
console.log(JSON.stringify({ ok: problems.length === 0, batch: batchId, checked: ready.length, problems }, null, 2))
if (problems.length) process.exit(1)
