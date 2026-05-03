#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  createContentAuditSupabaseClient,
  discoverArticleDirs,
  nowIso,
  parseArgs,
  resolveExportRoot,
  sha256Json,
  writeJson,
} from './lib'

const QUESTION_SELECT = 'question_id,article_id,topic_id,text,options,correct_option_id,correct_value,accepted_answers,value_tolerance,question_type,rationale,explanation,code_citation,bloom_level,application_context,practice_context,difficulty,difficulty_rating,discrimination_rating,is_assessment,model_id,prompt_image_url,created_at,updated_at'
const ALLOWED_UPDATE_FIELDS = new Set([
  'topic_id',
  'text',
  'options',
  'correct_option_id',
  'correct_value',
  'accepted_answers',
  'value_tolerance',
  'question_type',
  'rationale',
  'explanation',
  'code_citation',
  'bloom_level',
  'application_context',
  'practice_context',
  'difficulty',
  'difficulty_rating',
  'discrimination_rating',
  'is_assessment',
  'model_id',
  'prompt_image_url',
])

type JsonRecord = Record<string, unknown>

interface QuestionEditFile {
  question_id?: string
  baseline_hash?: string
  reason?: string
  approved_by?: string
  approved_at?: string
  proposed?: JsonRecord
  update?: JsonRecord
  fields?: JsonRecord
  status?: string
}

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const questionId = options.questionId
  if (!questionId) throw new Error('Question push requires --question-id or --question.')
  const dryRun = options.dryRun === true || options.apply !== true
  const report: JsonRecord = {
    question_id: questionId,
    attempted_at: nowIso(),
    dry_run: dryRun,
    apply: options.apply === true,
    pushed: false,
    blockers: [] as string[],
    warnings: [] as string[],
    updated_rows_count: 0,
  }

  const located = await findExportedQuestion(root, questionId)
  if (!located) {
    ;(report.blockers as string[]).push('Exported question was not found in linked-questions.json. Re-export the article bundle first.')
    await writeQuestionReports(root, questionId, null, report)
    console.log(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  report.article_id = located.articleId
  report.article_folder = path.relative(path.join(root, 'articles'), located.articleDir)
  report.exported_hash = located.exportedQuestion.content_hash ?? sha256Json(located.exportedQuestion)

  const editPath = path.join(located.articleDir, 'question-edits', `${questionId}.json`)
  if (!existsSync(editPath)) {
    ;(report.blockers as string[]).push(`Question edit file missing: ${path.relative(root, editPath)}`)
    ;(report.warnings as string[]).push('Create question-edits/<question_id>.json with proposed fields before pushing a question edit.')
    await writeQuestionReports(root, questionId, located.articleDir, report)
    console.log(JSON.stringify(report, null, 2))
    process.exit(options.strict ? 1 : 0)
  }

  const edit = JSON.parse(await readFile(editPath, 'utf-8')) as QuestionEditFile
  if (edit.question_id && edit.question_id !== questionId) (report.blockers as string[]).push('question-edits file question_id does not match requested question.')
  if (!edit.reason) (report.warnings as string[]).push('question edit has no reason field.')
  if (!edit.approved_by || !edit.approved_at) (report.warnings as string[]).push('question edit is missing approved_by/approved_at review metadata.')
  if (edit.status === 'duplicate') {
    ;(report.warnings as string[]).push('Question is flagged as duplicate; skipping push to Supabase.')
    await writeQuestionReports(root, questionId, located.articleDir, report)
    console.log(JSON.stringify(report, null, 2))
    return
  }

  const proposed = sanitizeQuestionUpdate(edit.proposed ?? edit.update ?? edit.fields ?? {})
  if (Object.keys(proposed).length === 0) (report.blockers as string[]).push('Question edit has no allowed proposed fields to update.')
  report.proposed_field_names = Object.keys(proposed).sort()

  const supabase = createContentAuditSupabaseClient()
  const { data: remote, error } = await supabase
    .from('questions')
    .select(QUESTION_SELECT)
    .eq('question_id', questionId)
    .maybeSingle()
  if (error) throw new Error(`Failed to fetch current remote question: ${error.message}`)
  if (!remote) (report.blockers as string[]).push('Remote question not found.')

  if (remote) {
    const remoteHash = sha256Json(remote)
    const expectedHash = edit.baseline_hash ?? String(report.exported_hash)
    report.remote_hash_before = remoteHash
    report.expected_baseline_hash = expectedHash
    report.stale_check_passed = remoteHash === expectedHash
    if (remoteHash !== expectedHash) (report.blockers as string[]).push('Remote question differs from exported/edit baseline; refusing stale push.')
  }

  if ((report.blockers as string[]).length === 0 && options.apply === true && !dryRun && remote) {
    const updatePayload = {
      ...proposed,
      updated_at: nowIso(),
    }
    const { data: updated, error: updateError } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('question_id', questionId)
      .eq('updated_at', remote.updated_at)
      .select('question_id,updated_at')
    if (updateError) throw new Error(`Failed to update question: ${updateError.message}`)
    const updatedRows = updated ?? []
    if (updatedRows.length !== 1) {
      ;(report.blockers as string[]).push(`Stale-safe question update affected ${updatedRows.length} rows; expected exactly 1.`)
    } else {
      report.pushed = true
      report.updated_rows_count = updatedRows.length
      report.updated_at_after = updatedRows[0]?.updated_at ?? null
    }
  }

  if (!options.apply) (report.warnings as string[]).push('Dry-run mode: no question mutation was performed.')
  await writeQuestionReports(root, questionId, located.articleDir, report)
  console.log(JSON.stringify(report, null, 2))
  if ((report.blockers as string[]).length > 0) process.exit(1)
}

async function findExportedQuestion(root: string, questionId: string) {
  for (const articleDir of discoverArticleDirs(root)) {
    const linkedQuestionsPath = path.join(articleDir, 'linked-questions.json')
    if (!existsSync(linkedQuestionsPath)) continue
    const linked = JSON.parse(await readFile(linkedQuestionsPath, 'utf-8')) as { article_id?: string; questions?: JsonRecord[] }
    const question = linked.questions?.find((item) => item.question_id === questionId)
    if (question) return { articleDir, articleId: linked.article_id ?? question.article_id, exportedQuestion: question }
  }
  return null
}

function sanitizeQuestionUpdate(raw: JsonRecord) {
  const update: JsonRecord = {}
  for (const [key, value] of Object.entries(raw)) {
    if (ALLOWED_UPDATE_FIELDS.has(key)) update[key] = value
  }
  return update
}

async function writeQuestionReports(root: string, questionId: string, articleDir: string | null, report: JsonRecord) {
  await writeJson(path.join(root, 'question-push-report.json'), report)
  if (!articleDir) return
  const editsRoot = path.join(articleDir, 'question-edits')
  await mkdir(editsRoot, { recursive: true })
  await writeJson(path.join(editsRoot, `${questionId}.push-report.json`), report)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
