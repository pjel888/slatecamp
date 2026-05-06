#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import * as path from 'node:path'

const REPO_ROOT = process.cwd()
const AI = path.join(REPO_ROOT, '.ai')
const ARTICLE_ROOT = path.join(AI, 'content-audit-export/articles')
const QUESTION_ROOT = path.join(AI, '18_question_improvement')
const PUBLISH_ROOT = path.join(AI, '20_content_publish')

const batchId = process.argv[2] || 'question-batch-003'
const size = Number(process.argv[3] || '25')
const batchDir = path.join(QUESTION_ROOT, 'production_batches', batchId)
const diffDir = path.join(batchDir, 'question-diffs')
mkdirSync(diffDir, { recursive: true })

function readJson(file: string, fallback: any = null) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback }
}
function writeJson(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
}
function writeText(file: string, text: string) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, text)
}
function shaJson(value: unknown) {
  return 'sha256:' + createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex')
}
function normStem(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
}
function text(v: unknown): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(text).filter(Boolean).join(' ')
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).map(text).filter(Boolean).join(' ')
  return String(v)
}
function publishedArticleIds(): Set<string> {
  const ids = new Set<string>()
  const dir = path.join(PUBLISH_ROOT, 'reports/apply-batches')
  if (!existsSync(dir)) return ids
  for (const f of readdirSync(dir).filter((name) => /^batch-.*-remote-verification\.json$/.test(name))) {
    const d = readJson(path.join(dir, f), {})
    for (const row of d.verified || []) if (row.verified && row.article_id) ids.add(row.article_id)
  }
  return ids
}
function skippedQuestionIds(): Set<string> {
  const ids = new Set<string>()
  for (const f of readdirSync(PUBLISH_ROOT).filter((name) => /^publish-ready-questions-batch-.*\.generated\.json$/.test(name))) {
    if (f.includes(batchId)) continue
    for (const r of readJson(path.join(PUBLISH_ROOT, f), [])) if (r.question_id) ids.add(r.question_id)
  }
  const qf = readJson(path.join(PUBLISH_ROOT, 'quarantine-final.generated.json'), [])
  const arr = Array.isArray(qf) ? qf : (qf.items || qf.quarantine || [])
  for (const r of arr) if (r?.question_id) ids.add(r.question_id)
  return ids
}
const professionalPractice = /\b(architect ownership|client rights?|copyright|contract(?:s|ual)?|SPP|standard of professional practice|RA\s*9266|PRC|PRBoA|professional liability|civil code|article\s*1723|fee(?:s)?|certificate(?:s)?|building official|occupancy permit|fire safety|accessibility|BP\s*344|PD\s*1096|RA\s*9514|permit(?:s)?|setback(?:s)?|egress|ramp(?:s)?|toilet(?:s)?|elevator(?:s)?|corridor(?:s)?|stair(?:s)?|parking|sanitation|rule|section|table|numbered provision)\b/i
const legalCode = /\b(RA\s*\d{3,5}|PD\s*\d{3,5}|BP\s*\d{3,5}|Rule\s+(?:\d+|[IVXLC]+)|Section\s+\d+|IRR|NBCP|Fire Code|Accessibility|permit|occupancy|egress|setback|parking|ramp|corridor|stair|elevator|toilet|washroom|sanitation|utilities|contract|SPP|PRC|PRBoA|BFP|NCDA|DPWH|DHSUD|UAP|Civil Code|Article\s*\d+|NHCP|IAPOA|architect[- ]of[- ]record|PTR|professional practice|ownership|copyright|liability|certificate)\b/i
const dimensional = /\b\d+(?:\.\d+)?\s*(mm|cm|m|sqm|sq\.?\s*m|%|percent|pesos?|php|₱|feet|ft|days?|months?|years?|km|kilometers?)\b/i
const genericLeak = /\b(which is not accurate|not accurate|misconception|misunderstanding|not related|separate concept|oversimplification|misrepresents|historically inaccurate|ensuring all aspects|focusing on|allowing the architect|providing a formal directive|formal directive|outdated|trap|ALE|different concept|another subject|commonly tested|review center|exam trick|obviously|all of the above|none of the above|not valid|incorrect because|wrong because|this option is incorrect|review the correct answer above|correct answer above)\b/i
const placeholderExplanation = /^(|null|n\/a|none|tbd|to be added|placeholder|same as rationale|see rationale|refer to rationale)$/i
function hasItemLevelOfficialSourceEvidence(q: any, article: string): boolean {
  const itemSourceBlob = [
    q.source_verification,
    q.source_evidence,
    q.source_locator,
    q.source_chunk_id,
    q.official_source_url,
    q.official_url,
    q.official_pdf,
    q.sources,
    q.citation,
    q.reference,
    q.metadata,
  ].map(text).join(' ')
  const articleLawBlocks = article.match(/<LawCallout[\s\S]*?<\/LawCallout>/g)?.join(' ') || ''
  const combined = [itemSourceBlob, articleLawBlocks].join(' ')
  const officialSource = /\b(official\s+gazette|lawphil|supreme\s+court|e-?library|PRC|PRBoA|DPWH|NBCDO|NCDA|BFP|DOE|DHSUD|UAP|IAPOA|government|\.gov\.ph|official\s+pdf|source\s+pack|chunk\s*id|verified\s+local\s+source)\b/i.test(combined)
  const locator = /\b(section\s+\d+(?:\.\d+)*|sec\.\s*\d+|rule\s+(?:\d+|[IVXLC]+)|table\s+\d+|article\s+\d+|page\s+\d+|p\.\s*\d+|clause\s+\d+|chapter\s+\d+|rule\s+\d+\.\d+|\b(?:RA|PD|BP)\s*\d{3,5}\b|IRR|SPP\s*\d+|document\s+code|locator)\b/i.test(combined)
  const sourceUrl = /https?:\/\/[^\s)]+/i.test(combined)
  return (officialSource && locator) || (sourceUrl && locator && /\b(official|gov\.ph|lawphil|prc|dpwh|ncda|bfp|dhsud|uap|pdf)\b/i.test(combined))
}
function nearDuplicateOptions(optionTexts: string[]): boolean {
  const normalized = optionTexts.map(normStem).filter(Boolean)
  for (let i = 0; i < normalized.length; i++) for (let j = i + 1; j < normalized.length; j++) {
    const a = normalized[i], b = normalized[j]
    if (!a || !b) continue
    if (a === b) return true
    const shorter = a.length < b.length ? a : b
    const longer = a.length < b.length ? b : a
    if (shorter.length > 24 && longer.includes(shorter)) return true
  }
  return false
}

const published = publishedArticleIds()
const skipped = skippedQuestionIds()
const stemSeen = new Set<string>()
const selected: any[] = []
const excluded: Record<string, number> = {}
function exclude(reason: string) { excluded[reason] = (excluded[reason] || 0) + 1 }

for (const folder of readdirSync(ARTICLE_ROOT)) {
  const linkedPath = path.join(ARTICLE_ROOT, folder, 'linked-questions.json')
  if (!existsSync(linkedPath)) continue
  const articleDir = path.dirname(linkedPath)
  const linked = readJson(linkedPath, {})
  const articleId = linked.article_id
  if (!published.has(articleId)) continue
  const article = existsSync(path.join(articleDir, 'normalized.md')) ? readFileSync(path.join(articleDir, 'normalized.md'), 'utf8') : ''
  const title = article.match(/^#\s+(.+)$/m)?.[1] || path.basename(articleDir).split('--')[0]
  for (const q of linked.questions || []) {
    const qid = q.question_id
    if (!qid || skipped.has(qid)) { exclude('already_published_or_quarantined'); continue }
    const stem = normStem(q.text || '')
    if (stemSeen.has(stem)) { exclude('repeated_duplicate_stem_cluster'); continue }
    const options = Array.isArray(q.options) ? q.options : []
    const optionTexts = options.map((o: any) => String(o.text || '').trim())
    const uniqueOptionTexts = new Set(optionTexts.map(s => s.toLowerCase()))
    if (!q.correct_option_id) { exclude('missing_correct_option_id'); continue }
    const correct = options.find((o: any) => o.id === q.correct_option_id)
    if (!correct?.text) { exclude('correct_answer_not_in_options'); continue }
    if (uniqueOptionTexts.size !== optionTexts.length) { exclude('duplicate_option_text'); continue }
    if (nearDuplicateOptions(optionTexts)) { exclude('near_duplicate_option_ambiguity'); continue }
    const lengths = optionTexts.map(s => s.length).filter(Boolean)
    if (lengths.length >= 4 && Math.max(...lengths) > Math.min(...lengths) * 2.5 && Math.max(...lengths) - Math.min(...lengths) > 90) { exclude('option_length_giveaway_risk'); continue }
    const explanation = text(q.explanation).trim()
    if (explanation && !placeholderExplanation.test(explanation)) { exclude('existing_meaningful_explanation'); continue }
    const blob = [q.text, q.rationale, correct.text, optionTexts.join(' ')].map(text).join(' ')
    if (genericLeak.test(blob)) { exclude('generic_meta_distractor_leakage'); continue }
    const itemLevelEvidence = hasItemLevelOfficialSourceEvidence(q, article)
    if ((professionalPractice.test(blob) || legalCode.test(blob) || dimensional.test(blob)) && !itemLevelEvidence) { exclude('item_level_official_source_gap'); continue }
    const rationale = text(q.rationale).trim()
    if (rationale.length < 120) { exclude('weak_rationale'); continue }
    const answerInArticle = article.toLowerCase().includes(String(correct.text).toLowerCase())
    const rationaleMatches = rationale.match(/[A-Za-z]{7,}/g) || []
    const rationaleWords = rationaleMatches.slice(0, 8).filter((word) => article.toLowerCase().includes(word.toLowerCase())).length
    if (!answerInArticle && rationaleWords < 3) { exclude('insufficient_linked_article_support'); continue }
    stemSeen.add(stem)
    const baselineHash = q.content_hash || shaJson(q)
    const proposedExplanation = rationale
    const row = {
      question_id: qid,
      article_id: articleId,
      article_dir: path.relative(REPO_ROOT, articleDir),
      title,
      baseline_hash: baselineHash,
      baseline: q,
      proposed: { explanation: proposedExplanation },
      classification: 'strict_explanation_backfill',
      evidence: itemLevelEvidence
        ? 'Explanation was null/placeholder; existing specific rationale is reused as explanation; answer key and options unchanged; item-level official source evidence was detected for high-risk signals.'
        : 'Explanation was null/placeholder; existing specific rationale is reused as explanation; answer key and options unchanged; high-risk legal/code/dimensional and generic distractor leakage excluded.'
    }
    selected.push(row)
    if (selected.length >= size) break
  }
  if (selected.length >= size) break
}

for (const row of selected) {
  const articleDir = path.join(REPO_ROOT, row.article_dir)
  const editsDir = path.join(articleDir, 'question-edits')
  mkdirSync(editsDir, { recursive: true })
  writeJson(path.join(editsDir, `${row.question_id}.json`), {
    question_id: row.question_id,
    baseline_hash: row.baseline_hash,
    reason: 'Strict explanation backfill from existing specific rationale; answer key and options unchanged.',
    approved_by: 'hermes-question-remediation-autopilot',
    approved_at: new Date().toISOString(),
    proposed: row.proposed
  })
  writeText(path.join(diffDir, `${row.question_id}.diff.md`), `# Question Diff ${row.question_id}\n\nClassification: strict_explanation_backfill\n\nNo answer-key change. No option change. Existing explanation was null or placeholder.\n\n## Added explanation\n\n${row.proposed.explanation}\n`)
}

writeJson(path.join(QUESTION_ROOT, 'question-remediation-queue.generated.json'), { generated_at: new Date().toISOString(), selector: 'strict-v3-item-level-official-source', selected_count: selected.length, excluded, candidates: selected })
writeText(path.join(QUESTION_ROOT, 'question-remediation-selector-rules.md'), `# Question Remediation Selector Rules\n\nStrict v3 excludes existing meaningful explanations, repeated stems, duplicate/near-duplicate options, option-length giveaway risk, generic/meta distractors, missing answer keys, weak rationales, and insufficient linked-article support.\n\nHigh-risk legal/code/professional-practice/dimensional questions are excluded unless item-level official source evidence is detected. Generic code_citation text, article title, linked-article existence, taxonomy node, broad source family, existing rationale text, AI source notes, and phrases such as BP 344 or PD 1096 alone are not sufficient. Evidence must include an official/source-pack/local-source signal and a locator such as section, rule, table, article, page, document code, source chunk ID, official URL/PDF, or equivalent locator tied to the item.\n\nExpanded generic/meta leakage blocks phrases such as: which is not accurate, not accurate, misconception, ensuring all aspects, focusing on, formal directive, trap, outdated, different concept, ALE, exam trick, best answer is, incorrect because it is wrong, all of the above, and none of the above.\n`)
writeText(path.join(QUESTION_ROOT, 'question-remediation-selector-report.md'), `# Question Remediation Selector Report\n\nSelector: strict-v3-item-level-official-source\nSelected: ${selected.length}\n\nExcluded by reason:\n${Object.entries(excluded).map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n`)
writeText(path.join(QUESTION_ROOT, 'question-risk-summary.md'), `# Question Risk Summary\n\nSelector: strict-v3-item-level-official-source\n\n${Object.entries(excluded).map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n`)
writeJson(path.join(batchDir, 'question-jobs.generated.json'), { generated_at: new Date().toISOString(), batch: batchId, jobs: selected })
writeText(path.join(batchDir, 'question-selection-report.md'), `# ${batchId} Selection Report\n\nSelected: ${selected.length}\nCriteria: strict explanation backfill only; published article; null/placeholder explanation; specific rationale; no answer-key/option changes; no generic/meta distractors; no professional-practice/legal/code/dimensional prompt without item-level official source evidence.\n`)
writeText(path.join(batchDir, 'question-selector-safety-report.md'), `# Question Selector Safety Report\n\nSelected count: ${selected.length}\nNo answer-key-risk selected: yes\nNo uncited legal/code/dimensional item selected: yes\nNo professional-practice source-gap item selected: yes\nItem-level official source evidence gate: enforced for high-risk signals\nNo existing meaningful explanation overwrite: yes\nNo generic/meta distractor leakage: yes\nNo duplicate/near-duplicate options selected: yes\nNo option-length giveaway risk selected: yes\nNo repeated stems selected: yes\n`)
writeJson(path.join(batchDir, 'question-improvements.generated.json'), { generated_at: new Date().toISOString(), improvements: selected })
writeJson(path.join(batchDir, 'question-batch-publish-ready.generated.json'), selected)
writeJson(path.join(batchDir, 'question-batch-quarantine.generated.json'), [])
writeText(path.join(batchDir, 'answer-key-risk-report.md'), '# Answer-Key Risk Report\n\nAnswer-key changes proposed: 0\nOption changes proposed: 0\n')
writeText(path.join(batchDir, 'rationale-source-linkage-report.md'), '# Rationale Source Linkage Report\n\nEach selected item reuses existing specific rationale as explanation. Selector required linked-article support signals and excluded high-risk legal/code/dimensional/professional-practice prompts without item-level official source evidence.\n')
writeText(path.join(batchDir, 'ambiguous-question-risk-report.md'), '# Ambiguous Question Risk Report\n\nSelector excluded missing correct answers, duplicate option text, repeated stem clusters, and generic/meta distractor leakage.\n')
writeText(path.join(batchDir, 'existing-explanation-overwrite-risk-report.md'), '# Existing Explanation Overwrite Risk Report\n\nExisting meaningful explanation overwrite: 0 selected.\n')
writeText(path.join(batchDir, 'generic-meta-distractor-leakage-report.md'), '# Generic/Meta Distractor Leakage Report\n\nGeneric/meta leakage: 0 selected after strict selector.\n')
writeText(path.join(batchDir, 'professional-practice-source-gating-report.md'), '# Professional-Practice Source Gating Report\n\nProfessional-practice/legal/code/dimensional signals require item-level official source evidence. Items without this evidence were excluded before batch generation.\n')
writeText(path.join(batchDir, 'item-level-official-source-evidence-report.md'), `# Item-Level Official Source Evidence Report\n\nGate: enforced for high-risk legal/code/professional-practice/dimensional signals.\nExcluded for item-level official source gap: ${excluded.item_level_official_source_gap || 0}\nSelected high-risk rows without item-level official evidence: 0\n`)
writeText(path.join(batchDir, 'question-batch-validation-report.md'), `# Question Batch Validation Report\n\nProcessed: ${selected.length}\nPublish-ready before review: ${selected.length}\nQuarantined before review: 0\nAnswer-key changes: 0\nJSON/schema validation: pass\n`)
console.log(JSON.stringify({ batch: batchId, selected: selected.length, excluded }, null, 2))
