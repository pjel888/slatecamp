#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { createHash } from 'crypto'

const apply = process.argv.includes('--apply')
const root = process.cwd()
const articleId = '9a7f7bde-20a6-44b5-9b13-6a69e20b5f88'
const slug = 'door-hinges-and-architectural-hardware'
const title = 'Door Hinges and Architectural Hardware'
const nodeId = 'c3996fe0-682a-43b0-adba-b829bb78b40e'
const articlePath = join(root, '.ai/03_plans/articles/door-hinges-and-architectural-hardware-upgraded.md')
const qPackPath = join(root, '.ai/03_plans/articles/door-hinges-and-architectural-hardware-question-pack/linked-questions-add-new.json')
const reportPath = join(root, `.ai/20_content_publish/reports/door-hinges-article-${apply ? 'apply' : 'dry-run'}-report.json`)
mkdirSync(dirname(reportPath), { recursive: true })

const content = readFileSync(articlePath, 'utf8')
const qPack = JSON.parse(readFileSync(qPackPath, 'utf8'))
const questions = qPack.questions.map((q: any) => ({
  question_id: q.question_id,
  topic_id: nodeId,
  text: q.proposed.text,
  options: q.proposed.options,
  correct_option_id: q.proposed.correct_option_id,
  rationale: q.proposed.rationale,
  difficulty: q.proposed.difficulty,
  explanation: q.proposed.explanation,
  code_citation: q.proposed.code_citation,
  is_assessment: false,
  application_context: null,
  practice_context: q.proposed.practice_context ?? ['door_hardware','building_materials_and_construction','lea_board_review'],
  bloom_level: q.proposed.bloom_level,
  question_type: 'mcq',
  value_tolerance: 0,
  accepted_answers: null,
  correct_value: null,
}))

const articleRow = {
  article_id: articleId,
  title,
  slug,
  content,
  status: 'published',
  subject_label: 'LEA-MATL · Building Materials and Construction',
  difficulty_label: 'Intermediate',
  read_time: '~22 min',
  reviewer_comments: 'New source-bounded SlateCamp article with embedded DoorHinge3D study canvases and 12 linked MCQs. Sources: Salvan Architectural Building Materials and Ching Building Construction Illustrated; not a Philippine legal/code mandate article.',
  updated_note: 'new-article-door-hinges-and-architectural-hardware: article plus 12 linked questions prepared and published by controlled apply.',
}

function sha256(s: string) { return createHash('sha256').update(s).digest('hex') }
function fail(msg: string): never { throw new Error(msg) }

if (!content.includes('<DoorHinge3D type="butt"')) fail('Article missing DoorHinge3D butt embed')
if ((content.match(/<DoorHinge3D /g) ?? []).length !== 9) fail('Expected exactly 9 DoorHinge3D embeds')
if (questions.length < 10) fail('Expected at least 10 linked questions')
if (questions.some((q: any) => q.topic_id !== nodeId)) fail('Question topic_id mismatch')
if (questions.some((q: any) => !q.text || !q.correct_option_id || !Array.isArray(q.options) || q.options.length !== 4)) fail('Malformed question row')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) fail('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const report: any = {
    generated_at: new Date().toISOString(),
    mode: apply ? 'apply' : 'dry-run',
    article_id: articleId,
    slug,
    title,
    taxonomy_node_id: nodeId,
    content_sha256: sha256(content),
    door_hinge_embeds: (content.match(/<DoorHinge3D /g) ?? []).length,
    question_count: questions.length,
    checks: [],
  }

  const { data: existingArticle, error: existingArticleError } = await supabase
    .from('wiki_articles').select('article_id, slug, title').eq('slug', slug).maybeSingle()
  if (existingArticleError) fail(`Existing article lookup failed: ${existingArticleError.message}`)
  report.existing_article = existingArticle ?? null
  if (existingArticle && existingArticle.article_id !== articleId) fail(`Slug already exists for different article_id: ${existingArticle.article_id}`)

  const { data: node, error: nodeError } = await supabase
    .from('taxonomy_tree').select('node_id, name, subject_area, slug').eq('node_id', nodeId).single()
  if (nodeError) fail(`Taxonomy lookup failed: ${nodeError.message}`)
  report.taxonomy_node = node

  const { data: existingQuestions, error: existingQuestionsError } = await supabase
    .from('questions').select('question_id').in('question_id', questions.map((q: any) => q.question_id))
  if (existingQuestionsError) fail(`Existing questions lookup failed: ${existingQuestionsError.message}`)
  report.existing_question_ids = existingQuestions ?? []
  if ((existingQuestions ?? []).length) fail('One or more generated question_ids already exist remotely')

  const { data: existingTax, error: existingTaxError } = await supabase
    .from('wiki_article_taxonomy').select('article_id,node_id').eq('article_id', articleId).eq('node_id', nodeId)
  if (existingTaxError) fail(`Existing taxonomy link lookup failed: ${existingTaxError.message}`)
  report.existing_taxonomy_link = existingTax ?? []

  if (!apply) {
    report.result = 'DRY_RUN_PASS_NO_REMOTE_MUTATION'
    writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ ok: true, mode: 'dry-run', reportPath, articleId, questionCount: questions.length }, null, 2))
    return
  }

  const { error: articleError } = await supabase.from('wiki_articles').upsert(articleRow, { onConflict: 'article_id' })
  if (articleError) fail(`Article upsert failed: ${articleError.message}`)

  const { data: sortRows, error: sortError } = await supabase
    .from('wiki_article_taxonomy').select('sort_order').eq('node_id', nodeId).order('sort_order', { ascending: false }).limit(1)
  if (sortError) fail(`Sort lookup failed: ${sortError.message}`)
  const nextSort = ((sortRows?.[0]?.sort_order as number | undefined) ?? 0) + 1
  const { error: taxError } = await supabase.from('wiki_article_taxonomy').upsert({ article_id: articleId, node_id: nodeId, is_primary: true, sort_order: nextSort }, { onConflict: 'article_id,node_id' })
  if (taxError) fail(`Taxonomy upsert failed: ${taxError.message}`)

  const { error: questionError } = await supabase.from('questions').insert(questions)
  if (questionError) fail(`Question insert failed: ${questionError.message}`)

  const { data: readArticle, error: readArticleError } = await supabase.from('wiki_articles').select('article_id,slug,title,content,status').eq('article_id', articleId).single()
  if (readArticleError) fail(`Article readback failed: ${readArticleError.message}`)
  const { data: readTax, error: readTaxError } = await supabase.from('wiki_article_taxonomy').select('article_id,node_id,is_primary,sort_order').eq('article_id', articleId).eq('node_id', nodeId).single()
  if (readTaxError) fail(`Taxonomy readback failed: ${readTaxError.message}`)
  const { data: readQuestions, error: readQuestionsError } = await supabase.from('questions').select('question_id,topic_id,text,correct_option_id').in('question_id', questions.map((q: any) => q.question_id))
  if (readQuestionsError) fail(`Questions readback failed: ${readQuestionsError.message}`)

  report.readback = {
    article_match: readArticle?.content === content,
    article_status: readArticle?.status,
    raw_ui_placeholders: (readArticle?.content?.match(/\[SLATECAMP_UI_BLOCK:/g) ?? []).length,
    door_hinge_embeds: (readArticle?.content?.match(/<DoorHinge3D /g) ?? []).length,
    taxonomy_link: readTax,
    questions_readback_count: readQuestions?.length ?? 0,
    question_topic_mismatches: (readQuestions ?? []).filter((q: any) => q.topic_id !== nodeId).map((q: any) => q.question_id),
  }
  if (!report.readback.article_match) fail('Article content readback mismatch')
  if (report.readback.raw_ui_placeholders !== 0) fail('Remote article has raw UI placeholders')
  if (report.readback.door_hinge_embeds !== 9) fail('Remote article DoorHinge3D embed count mismatch')
  if (report.readback.questions_readback_count !== questions.length) fail('Question readback count mismatch')
  if (report.readback.question_topic_mismatches.length) fail('Question topic mismatch on readback')

  report.result = 'APPLY_PASS_REMOTE_READBACK_MATCH'
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ ok: true, mode: 'apply', reportPath, articleId, questionCount: questions.length, readback: report.readback }, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
})
