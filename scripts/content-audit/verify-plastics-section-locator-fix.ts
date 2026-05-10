import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createContentAuditSupabaseClient, loadEnvLocal } from './lib'

const articleId = 'c712ee78-2625-434c-bb18-fa7b0f477b33'
const questionId = 'a1eaf1c8-47ba-4a12-97a4-72dbda1dd150'
const folder = join(process.cwd(), '.ai/content-audit-export/articles/plastics-in-construction--c712ee78-2625-434c-bb18-fa7b0f477b33')
const candidate = readFileSync(join(folder, 'candidate.md'), 'utf8')
const candidateHash = 'sha256:' + createHash('sha256').update(candidate).digest('hex')
loadEnvLocal()
const supabase = createContentAuditSupabaseClient()
const { data: article, error: articleError } = await supabase.from('wiki_articles').select('article_id,content,updated_at').eq('article_id', articleId).maybeSingle()
if (articleError) throw articleError
if (!article) throw new Error('article missing')
const liveHash = 'sha256:' + createHash('sha256').update(article.content ?? '').digest('hex')
const { data: question, error: questionError } = await supabase.from('questions').select('question_id,text,rationale,explanation,code_citation').eq('question_id', questionId).maybeSingle()
if (questionError) throw questionError
if (!question) throw new Error('question missing')
const result = {
  generated_at: new Date().toISOString(),
  article: {
    article_id: articleId,
    live_hash: liveHash,
    candidate_hash: candidateHash,
    matches: liveHash === candidateHash,
    raw_placeholders: ((article.content ?? '').match(/\[SLATECAMP_UI_BLOCK:/g) ?? []).length,
    contains_wrong_veneer_sec_1603: /Exterior Plastic Veneer \(Sec\. 1603|Exterior veneer.*Sec\. 1603|PD 1096 Rule XVI Sec\. 1603 — PH vs\. USA/.test(article.content ?? ''),
    contains_correct_veneer_sec_1608: /Exterior Plastic Veneer \(Sec\. 1608|PD 1096 Rule XVI Sec\. 1608 — PH vs\. USA/.test(article.content ?? ''),
    contains_correct_glazing_sec_1603: /Glazing of Openings \(Sec\. 1603/.test(article.content ?? ''),
  },
  question: {
    question_id: questionId,
    text: question.text,
    code_citation: question.code_citation,
    rationale_has_sec_1608: /Sec\. 1608/.test(question.rationale ?? ''),
    explanation_has_sec_1608: /Sec\. 1608/.test(question.explanation ?? ''),
  },
  source_evidence: {
    pd1096_rirr_dpwh_official_pdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf',
    page_230: 'SECTION 1603. Glazing of Openings',
    page_232: 'SECTION 1608. Exterior Veneer',
  }
}
writeFileSync(join(folder, 'section-locator-fix-verification.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result, null, 2))
if (!result.article.matches || result.article.raw_placeholders !== 0 || result.article.contains_wrong_veneer_sec_1603 || !result.article.contains_correct_veneer_sec_1608 || result.question.code_citation !== 'PD 1096, Rule XVI, Sec. 1608') process.exit(1)
