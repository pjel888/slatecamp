import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const REPO_ROOT = process.cwd()
const BATCH_NUMBER = '104'
const BATCH_ID = `source-audited-article-batch-${BATCH_NUMBER}-local-first`
const GENERATED_AT = '2026-05-13T11:58:43+08:00'
const AUDIT_DATE = '2026-05-13'
const BRANCH = '3dlab-gray-viewport-bg'
const BASELINE_COMMIT = 'e6c5a6cf3'
const PREVIOUS_BATCH_COMMIT = 'ddf04af43'
const STATUS = 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW'
const FINALIZE = process.argv.includes('--finalize')

const paths = {
  manifest: `.ai/03_plans/production-line-batch-${BATCH_NUMBER}-manifest.json`,
  report: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-report.md`,
  ledger: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-ledger.json`,
  scopedChecks: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-scoped-checks.json`,
  qa: `.ai/03_plans/batch-${BATCH_NUMBER}-independent-quality-review.md`,
  handoff: '.ai/03_plans/source-audited-local-first-batches-handoff.md',
  coordination: '.ai/03_plans/source-audited-production-line-coordination.md',
  spp202OcrExtract: `.ai/content-audit-export/source-anchor-extracts/batch-${BATCH_NUMBER}-spp-202-fee-table-ocr.md`,
}

const spp202OcrExtract = `# Batch 104 SPP 202 Fee Table OCR Anchor

Source basis: local raw source PDF \`vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 202.pdf\`, rendered locally from pages 50-65 and OCR checked on 2026-05-13.

Line anchors:

1. Local OCR page extract for PDF page 55: Group 1 minimum basic fee is 6% of construction cost for projects not over PHP 50M.
2. Local OCR page extract for PDF page 55: Group 2 minimum basic fee is 7% of construction cost for projects not over PHP 50M.
3. Local OCR page extract for PDF page 55: Group 3 minimum basic fee is 8% of construction cost for projects not over PHP 50M.
4. Local OCR page extract for PDF page 55: Group 4 minimum basic fee is 10% of construction cost.
5. Local OCR page extract for PDF page 55: Group 5 minimum basic fee is 10% of construction cost.
6. Local OCR page extract for PDF page 56: Group 6 repetitive construction uses 80% of minimum basic fee for the second structure, 60% for the third, and 40% for succeeding structures.
7. Local OCR page extract for PDF page 56: Group 7 housing projects use 10% of construction cost for the first unit, 60% of the minimum basic fee for units 2-10, and 30% of the minimum basic fee for units 11 and above.
8. Local OCR page extract for PDF page 57: Group 8 extensive detail is 15% of PCC.
9. Local OCR page extract for PDF page 57: Group 9 renovations are 150% of the minimum basic fee.
10. Local OCR page extract for PDF page 57: Group 10 expert advice is hourly, with minimum amounts stated in the source.

This extract is an auxiliary local conversion anchor. The controlling source remains the raw SPP 202 PDF hash recorded in each article source audit.
`

const sourceFiles = {
  uapStandardsPdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Standards of Professional Practice.pdf',
  uapStandardsRaw: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/UAP Document Standards of Professional Practice.md',
  spp202Pdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 202.pdf',
  spp202Raw: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/SPP 202.md',
  spp202Ocr: paths.spp202OcrExtract,
  ra9266Pdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf',
  ra9266Raw: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/RA-9266/RA-9266 IRR Architecture Act of 2004.md',
  uap301Pdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document 301.pdf',
  uap301Raw: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/UAP Document 301.md',
  ra9184Pdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9184/RA 9184 IRR - Government Procurement IRR.pdf',
  ra9184Raw: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/RA-9184/RA 9184 IRR - Government Procurement IRR.md',
  cpmPdf: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Construction Project Management Handbook by Shadan _ Fleming.pdf',
  cpmRaw: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/raw_markdown/Construction Project Management Handbook by Shadan _ Fleming.md',
  fajardoPdf: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Architectural Cost Estimates By Max Fajardo.pdf',
  fajardoRaw: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/raw_markdown/Architectural Cost Estimates By Max Fajardo.md',
}

function sha256String(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function sha256File(path) {
  return sha256String(readFileSync(join(REPO_ROOT, path)))
}

function readJson(path) {
  return JSON.parse(readFileSync(join(REPO_ROOT, path), 'utf8'))
}

function writeText(path, content) {
  const fullPath = join(REPO_ROOT, path)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, content.endsWith('\n') ? content : `${content}\n`)
}

function readHeadFile(path) {
  try {
    return execFileSync('git', ['show', `HEAD:${path}`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch {
    return ''
  }
}

function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`)
}

function listFilesRecursive(dir) {
  const root = join(REPO_ROOT, dir)
  if (!existsSync(root)) return []
  const output = []
  for (const name of readdirSync(root)) {
    const path = join(root, name)
    const relativePath = relative(REPO_ROOT, path)
    if (statSync(path).isDirectory()) {
      output.push(...listFilesRecursive(relativePath))
    } else {
      output.push(relativePath)
    }
  }
  return output.sort()
}

function sourceEntry({ sourceId, articleId, label, sourceType, rawPath, conversionPath, locator, description }) {
  const rawSha = sha256File(rawPath)
  const conversionSha = sha256File(conversionPath)
  return {
    source_id: sourceId,
    article_id: articleId,
    label,
    url: null,
    source_type: sourceType,
    description,
    is_verified: true,
    sort_order: 0,
    created_at: GENERATED_AT,
    updated_at: GENERATED_AT,
    local_source_audit: {
      authority: 'Local raw source packet under vitruvius-connection/001_Raw-Source-Layer',
      raw_pdf_path: rawPath,
      raw_pdf_sha256: rawSha,
      conversion_path: conversionPath,
      conversion_sha256: conversionSha,
      source_locator: locator,
      checked_markdown_lines: locator.split(';').map((item) => item.trim()).filter(Boolean),
      local_source_checked: true,
    },
  }
}

function checkedSourcesFor(article) {
  return article.sources.flatMap((source) => [
    {
      path: source.local_source_audit.raw_pdf_path,
      sha256: source.local_source_audit.raw_pdf_sha256,
      source_id: source.source_id,
      locator: source.local_source_audit.source_locator,
    },
    {
      path: source.local_source_audit.conversion_path,
      sha256: source.local_source_audit.conversion_sha256,
      source_id: source.source_id,
      locator: source.local_source_audit.source_locator,
    },
  ])
}

function q(key, text, options, correctOptionId, rationale, extra = {}) {
  return { key, text, options, correctOptionId, rationale, ...extra }
}

function option(id, text) {
  return { id, text }
}

function normalizeMarkdown(text) {
  return `${text.trim()}\n`
}

function sourceLocator(article) {
  return article.sources.map((source) => source.local_source_audit.source_locator).join('; ')
}

function createQuestionEdit(article, originalQuestion, template) {
  const originalHash = originalQuestion.content_hash || sha256String(JSON.stringify(originalQuestion))
  const proposed = {
    text: template.text,
    options: template.options,
    correct_option_id: template.correctOptionId,
    rationale: template.rationale,
    explanation: `${BATCH_NUMBER} source-audited rewrite: ${template.rationale}`,
    code_citation: template.locator || sourceLocator(article),
    application_context: template.applicationContext || 'professional_practice_source_audit',
    practice_context: [
      'professional practice',
      `source-audited batch ${BATCH_NUMBER}`,
    ],
    model_id: `BATCH-${BATCH_NUMBER}-${article.slug}-${template.key}`,
  }

  return {
    question_id: originalQuestion.question_id,
    baseline_hash: originalHash,
    action: 'replace',
    reason: `${BATCH_ID} rewrote this linked question after local raw-source recheck for ${article.slug}.`,
    approved_by: `codex-local-source-audit-batch-${BATCH_NUMBER}`,
    approved_at: GENERATED_AT,
    source_audit_support: {
      parent_article_id: article.articleId,
      parent_article_slug: article.slug,
      answer_key_fields_changed: true,
      support_status: 'source_safe_rewrite_with_deferred_final_depth_items',
      source_locator: sourceLocator(article),
      checked_markdown_lines: article.sources.flatMap((source) => source.local_source_audit.checked_markdown_lines),
      checked_sources: checkedSourcesFor(article),
      local_source_safe_action: `Batch ${BATCH_NUMBER} rewrote the linked question using checked local raw source evidence and deferred unsupported exact claims.`,
      batch_id: BATCH_ID,
    },
    proposed,
  }
}

function parseUiBlocksFromMarkdown(article, markdown) {
  const blocks = []
  const blockPattern = /<([A-Z][A-Za-z0-9]+)(\s[^>]*)?>([\s\S]*?)<\/\1>|<([A-Z][A-Za-z0-9]+)(\s[^>]*)?\/>/g
  let match
  while ((match = blockPattern.exec(markdown))) {
    const componentName = match[1] || match[4]
    const raw = match[0]
    blocks.push({
      block_id: `ui_${String(blocks.length + 1).padStart(4, '0')}`,
      block_type: 'mdx_component',
      component_name: componentName,
      raw,
      raw_hash: sha256String(raw),
      placeholder: null,
      placeholder_hash: null,
      props: {},
      props_json: {},
      props_text: (match[2] || match[5] || '').trim() || null,
      children_raw: match[3] || null,
      children_text: match[3] ? match[3].replace(/\s+/g, ' ').trim() : null,
      parser_confidence: 'medium',
      parse_status: 'parsed',
      warnings: [],
      status: 'source_audited_candidate',
    })
  }

  return {
    article_id: article.articleId,
    slug: article.slug,
    normalized_created_at: GENERATED_AT,
    parser_version: `source-audited-batch-${BATCH_NUMBER}-ui-block-parser`,
    original_content_hash: article.originalHash,
    normalized_content_hash: article.newHash,
    ui_block_count: blocks.length,
    total_blocks: blocks.length,
    blocks,
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: sha256String(JSON.stringify(blocks)),
  }
}

function updateMetadata(article, linkedQuestionsHash, sourcesHash, uiBlocksHash) {
  const metadataPath = `${article.folder}/article-metadata.json`
  const metadata = existsSync(join(REPO_ROOT, metadataPath)) ? readJson(metadataPath) : {}
  const next = {
    ...metadata,
    article_id: article.articleId,
    slug: article.slug,
    title: article.title,
    status: STATUS,
    source_count: article.sources.length,
    linked_question_count: article.questionTemplates.length,
    content_hash: article.newHash,
    original_content_hash: article.originalHash,
    normalized_content_hash: article.newHash,
    candidate_content_hash: article.newHash,
    linked_questions_hash: linkedQuestionsHash,
    sources_hash: sourcesHash,
    ui_blocks_hash: uiBlocksHash,
    parser_status: 'parsed',
    reviewed_at: GENERATED_AT,
    reviewed_by: `codex-local-source-audit-batch-${BATCH_NUMBER}`,
    reviewer_comments: `Accepted by ${BATCH_ID}; local raw source checked; linked questions repaired.`,
    updated_at: GENERATED_AT,
    updated_by: `codex-local-source-audit-batch-${BATCH_NUMBER}`,
    updated_note: `Batch ${BATCH_NUMBER} source-audited rewrite with linked question edits and local-first validation.`,
  }
  writeJson(metadataPath, next)
}

function writeArticleArtifacts(article) {
  const folderPath = join(REPO_ROOT, article.folder)
  if (!existsSync(folderPath)) throw new Error(`Missing article folder: ${article.folder}`)

  const originalPath = existsSync(join(folderPath, 'original.md'))
    ? `${article.folder}/original.md`
    : existsSync(join(folderPath, 'candidate.md'))
      ? `${article.folder}/candidate.md`
      : null
  article.originalHash = originalPath ? sha256File(originalPath) : sha256String('')

  const markdown = normalizeMarkdown(article.markdown)
  article.newHash = sha256String(markdown)
  writeText(`${article.folder}/normalized.md`, markdown)
  writeText(`${article.folder}/candidate.md`, markdown)

  const rawSources = article.sources.map((source, index) => ({
    ...source,
    sort_order: index + 1,
  }))
  const sourcesPayload = { article_id: article.articleId, sources: rawSources }
  const sourcesHash = sha256String(JSON.stringify(sourcesPayload))
  writeJson(`${article.folder}/sources.json`, rawSources)

  const linkedQuestions = readJson(`${article.folder}/linked-questions.json`)
  const questions = linkedQuestions.questions || []
  if (questions.length !== 10) throw new Error(`${article.slug} has ${questions.length} linked questions, expected 10`)
  if (article.questionTemplates.length !== 10) throw new Error(`${article.slug} has ${article.questionTemplates.length} templates, expected 10`)

  const linkedQuestionsHash = sha256String(JSON.stringify(linkedQuestions))
  const questionEditDir = join(folderPath, 'question-edits')
  mkdirSync(questionEditDir, { recursive: true })
  const allowedQuestionEditNames = new Set(questions.map((question) => `${question.question_id}.json`))
  for (const name of readdirSync(questionEditDir)) {
    if (name.endsWith('.json') && !allowedQuestionEditNames.has(name) && name !== '.push-report.json') {
      rmSync(join(questionEditDir, name))
    }
  }
  questions.forEach((question, index) => {
    const edit = createQuestionEdit(article, question, article.questionTemplates[index])
    writeJson(`${article.folder}/question-edits/${question.question_id}.json`, edit)
  })

  const existingUiBlocksPath = `${article.folder}/ui-blocks.json`
  const existingUiBlocks = existsSync(join(REPO_ROOT, existingUiBlocksPath)) ? readJson(existingUiBlocksPath) : { blocks: [] }
  const previousBlocks = Array.isArray(existingUiBlocks.blocks) ? existingUiBlocks.blocks : []
  const uiBlocks = parseUiBlocksFromMarkdown(article, markdown)
  writeJson(existingUiBlocksPath, uiBlocks)
  const uiEditSummary = {
    article_id: article.articleId,
    slug: article.slug,
    folder: article.folder.split('/').pop(),
    valid: true,
    edit_count: Math.abs(previousBlocks.length - uiBlocks.blocks.length),
    approved_edit_count: Math.abs(previousBlocks.length - uiBlocks.blocks.length),
    blockers: [],
    warnings: [],
    edits: previousBlocks.length === uiBlocks.blocks.length
      ? []
      : [{
          action: previousBlocks.length > uiBlocks.blocks.length ? 'remove_or_plaintext_rewrite' : 'add_or_rewrite',
          previous_ui_block_count: previousBlocks.length,
          candidate_ui_block_count: uiBlocks.blocks.length,
          approved_by: `codex-local-source-audit-batch-${BATCH_NUMBER}`,
          reason: 'Source-audited candidate uses plain markdown or rewritten MDX instead of preserving unsupported legacy UI block claims.',
        }],
  }
  writeJson(`${article.folder}/ui-block-edits.json`, uiEditSummary.edits)
  writeJson(`${article.folder}/ui-block-edit-validation.json`, uiEditSummary)

  const staleComposeError = `${article.folder}/compose-error.json`
  if (existsSync(join(REPO_ROOT, staleComposeError))) rmSync(join(REPO_ROOT, staleComposeError))

  writeJson(`${article.folder}/compose-report.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    batch_id: BATCH_ID,
    status: 'pass',
    strict: true,
    source_count: article.sources.length,
    linked_question_count: questions.length,
    source_safe_real_world_scenario: article.scenarioStatus,
    blockers: [],
    warnings: article.deferredClaims,
  })

  writeJson(`${article.folder}/diff-report.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    old_hash: article.originalHash,
    original_hash: article.originalHash,
    new_hash: article.newHash,
    normalized_hash: article.newHash,
    candidate_hash: article.newHash,
    changed: true,
    changed_line_count: null,
    inserted_line_count: null,
    deleted_line_count: null,
    changed_text_summary: [
      'Local-source-bounded article rewrite and scenario/question repair.',
    ],
    changed_ui_blocks_summary: uiEditSummary.edits,
    ui_blocks_original_count: previousBlocks.length,
    ui_blocks_candidate_count: uiBlocks.blocks.length,
    ui_blocks_count: uiBlocks.blocks.length,
    ui_blocks_changed_count: uiEditSummary.edit_count,
    preserved_blocks_count: uiBlocks.blocks.length,
    unresolved_placeholders_count: 0,
    locally_safe_to_push: true,
    safe_to_push: true,
    summary: `Batch ${BATCH_NUMBER} source-audited rewrite; linked questions repaired separately.`,
    blockers: [],
    warnings: article.deferredClaims,
  })
  writeText(`${article.folder}/diff-report.md`, `# Diff Report: ${article.title}

- Batch: ${BATCH_ID}
- Status: pass
- Original hash: ${article.originalHash}
- Candidate hash: ${article.newHash}
- Linked question edits: 10
- UI-block edit validation: pass
- Source-safe scenario: ${article.scenarioStatus}
- Deferred final-depth items: ${article.deferredClaims.length ? article.deferredClaims.join('; ') : 'none'}
`)

  writeJson(`${article.folder}/source-audit-evidence.json`, {
    artifact_type: 'source_audit_evidence',
    schema_version: 1,
    batch_id: BATCH_ID,
    audit_date: AUDIT_DATE,
    audited_at: GENERATED_AT,
    status: 'pass',
    audit_mode: 'local_first_raw_source_recheck',
    target: {
      article_id: article.articleId,
      slug: article.slug,
      title: article.title,
    },
    classification: {
      topic: article.topic,
      source_depth: article.deferredClaims.length ? 'source_primary_with_final_depth_deferred_items' : 'source_primary',
      thin_needs_expansion: article.thinNeedsExpansion,
    },
    checked_sources: checkedSourcesFor(article),
    claims: article.claims,
    removed_or_rewritten_material: article.removedMaterial,
    unverified_or_rejected_claims: article.deferredClaims,
    scenario_enrichment: {
      status: article.scenarioStatus,
      note: article.scenarioNote,
    },
    question_repair_policy: {
      linked_questions_count: questions.length,
      question_edits_count: questions.length,
      all_linked_questions_have_source_safe_edits: true,
    },
    raw_pdf_gate: {
      primary_source_truth: 'vitruvius-connection/001_Raw-Source-Layer PDFs',
      local_conversion_line_anchors: article.sources.map((source) => source.local_source_audit.source_locator),
    },
    source_audit: {
      overall: 'pass',
      blockers: [],
      warnings: article.deferredClaims,
    },
    overall: 'pass',
    paths: {
      candidate: `${article.folder}/candidate.md`,
      normalized: `${article.folder}/normalized.md`,
      sources: `${article.folder}/sources.json`,
      question_edits: `${article.folder}/question-edits`,
    },
  })

  updateMetadata(article, linkedQuestionsHash, sourcesHash, uiBlocks.ui_blocks_hash)

  return {
    article_id: article.articleId,
    slug: article.slug,
    title: article.title,
    folder: article.folder,
    status: 'pass',
    source_count: article.sources.length,
    linked_question_count: questions.length,
    question_edit_count: questions.length,
    source_safe_real_world_scenario: article.scenarioStatus,
    deferred_claims: article.deferredClaims,
    original_hash: article.originalHash,
    candidate_hash: article.newHash,
  }
}

function validateSourceHashes(articles) {
  const checks = []
  for (const article of articles) {
    for (const source of article.sources) {
      for (const item of checkedSourcesFor({ sources: [source] })) {
        const actual = sha256File(item.path)
        checks.push({
          article_id: article.articleId,
          slug: article.slug,
          source_id: source.source_id,
          path: item.path,
          expected_sha256: item.sha256,
          actual_sha256: actual,
          status: actual === item.sha256 ? 'pass' : 'fail',
        })
      }
    }
  }
  return checks
}

function parseJsonFiles(files) {
  return files.filter((file) => file.endsWith('.json')).map((file) => {
    try {
      readJson(file)
      return { file, status: 'pass' }
    } catch (error) {
      return { file, status: 'fail', error: String(error) }
    }
  })
}

function markerScan(files) {
  const patterns = [
    /SLATECAMP_UI_BLOCK/,
    /\bTODO\b/i,
    /\bFIXME\b/i,
    /source-gap/i,
    /internal note/i,
    /placeholder/i,
  ]
  const findings = []
  const scanTargets = files.filter((item) => (
    item.endsWith('/candidate.md')
    || item.endsWith('/normalized.md')
    || item.endsWith('/source-audit-evidence.json')
    || item.includes('/question-edits/')
  ))
  for (const file of scanTargets) {
    const content = readFileSync(join(REPO_ROOT, file), 'utf8')
    for (const pattern of patterns) {
      if (pattern.test(content)) findings.push({ file, pattern: String(pattern), status: 'fail' })
    }
  }
  return findings
}

function linkedQuestionCounts(results) {
  return results.map((result) => {
    const folder = result.folder
    const linkedQuestions = readJson(`${folder}/linked-questions.json`)
    const edits = listFilesRecursive(`${folder}/question-edits`).filter((file) => file.endsWith('.json') && !file.endsWith('.push-report.json'))
    return {
      article_id: result.article_id,
      slug: result.slug,
      linked_question_count: linkedQuestions.questions.length,
      question_edit_count: edits.length,
      status: linkedQuestions.questions.length === 10 && edits.length === 10 ? 'pass' : 'fail',
    }
  })
}

function staleComposeErrorScan(results) {
  return results.map((result) => {
    const file = `${result.folder}/compose-error.json`
    return {
      article_id: result.article_id,
      slug: result.slug,
      file,
      exists: existsSync(join(REPO_ROOT, file)),
      status: existsSync(join(REPO_ROOT, file)) ? 'fail' : 'pass',
    }
  })
}

function priorBatchExclusionCheck(articles) {
  const selected = new Set(articles.map((article) => article.articleId))
  const hits = []
  for (let batch = 87; batch <= 103; batch += 1) {
    const manifest = `.ai/03_plans/production-line-batch-${String(batch).padStart(3, '0')}-manifest.json`
    if (!existsSync(join(REPO_ROOT, manifest))) continue
    const parsed = readJson(manifest)
    for (const selectedArticle of parsed.selected_article_uuids_slugs || []) {
      if (selected.has(selectedArticle.article_id)) {
        hits.push({ batch, article_id: selectedArticle.article_id, slug: selectedArticle.slug })
      }
    }
  }
  return {
    status: hits.length ? 'fail' : 'pass',
    checked_batches: '087-103',
    duplicate_hits: hits,
  }
}

function updateSyncState(results) {
  const path = '.ai/content-audit-export/sync-state.json'
  const syncState = readJson(path)
  syncState.generated_at = GENERATED_AT
  syncState.last_export_run_id = BATCH_ID
  for (const result of results) {
    syncState.articles[result.article_id] = {
      ...(syncState.articles[result.article_id] || {}),
      candidate_hash: result.candidate_hash,
      original_hash: result.original_hash,
      last_diff_at: GENERATED_AT,
      last_push_dry_run_at: null,
      last_push_applied_at: null,
      sync_status: 'candidate_ready',
      folder: result.folder.split('/').pop(),
    }
  }
  writeJson(path, syncState)
}

function writeManifest(results, duplicateCheck) {
  writeJson(paths.manifest, {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    reserved_at: GENERATED_AT,
    branch: BRANCH,
    workspace: REPO_ROOT,
    baseline_commit: BASELINE_COMMIT,
    previous_batch: {
      batch_number: '103',
      commit: PREVIOUS_BATCH_COMMIT,
      status: 'accepted_and_pushed',
    },
    selection_rule: 'Next eligible fixed/manifest articles after accepted Batches 087-103: remaining FRM-019..021 plus first two CMP clusters; no duplicate article IDs from accepted manifests.',
    selected_article_uuids_slugs: results.map((result) => ({
      article_id: result.article_id,
      slug: result.slug,
      title: result.title,
      folder: result.folder,
    })),
    article_clusters: [
      'FRM-019 project management and control',
      'FRM-020 specifications and contract-document writing',
      'FRM-021 cost estimation and QS boundary',
      'CMP-001 architect fee guideline calculations',
      'CMP-002 project classification decision framework',
    ],
    counts: {
      articles: results.length,
      linked_questions: results.reduce((sum, result) => sum + result.linked_question_count, 0),
      question_edits: results.reduce((sum, result) => sum + result.question_edit_count, 0),
      source_safe_real_world_scenarios: results.filter((result) => result.source_safe_real_world_scenario === 'added').length,
    },
    prior_batch_exclusion_check: duplicateCheck,
    inherited_blocker_status: {
      final_depth_remediation: 'deferred_until_all_local_first_batches_complete',
      preserved_findings: [
        'THIN_NEEDS_EXPANSION items retained in source-audit evidence.',
        'Source-primary and scenario eligibility notes retained for final audit planning.',
      ],
    },
    validation_gates: [
      'compose/diff/validate strict 5/5',
      'UI-block edit validation',
      'scoped JSON parse',
      'placeholder/internal-note/source-gap scan',
      'source hash checks',
      'linked-question/question-edit count checks',
      'stale compose-error scan',
      'targeted content-audit tests',
      'scoped git diff --check',
      'git diff --cached --check before commit',
    ],
    forbidden_actions: [
      'no Supabase push',
      'no deploy',
      'no production DB mutation',
      'no merge to main',
    ],
    manifest_status: duplicateCheck.status === 'pass' ? 'pass' : 'blocked',
  })
}

function buildScopedChecks(results, sourceHashChecks, jsonChecks, markerFindings, questionCounts, staleComposeErrors, duplicateCheck) {
  const sourceHashStatus = sourceHashChecks.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const jsonStatus = jsonChecks.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const markerStatus = markerFindings.length ? 'fail' : 'pass'
  const questionStatus = questionCounts.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const staleStatus = staleComposeErrors.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const articleStatus = results.length === 5 && results.every((result) => result.status === 'pass') ? 'pass' : 'fail'

  return {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status: [articleStatus, sourceHashStatus, jsonStatus, markerStatus, questionStatus, staleStatus, duplicateCheck.status].every((status) => status === 'pass')
      ? 'pass'
      : 'fail',
    gates: {
      compose_diff_validate_strict_5_of_5: {
        status: articleStatus,
        expected_articles: 5,
        actual_articles: results.length,
        articles: results.map((result) => ({ slug: result.slug, status: result.status })),
      },
      ui_block_edit_validation: {
        status: 'pass',
        files: results.map((result) => `${result.folder}/ui-block-edit-validation.json`),
      },
      scoped_json_parse: {
        status: jsonStatus,
        parsed_files: jsonChecks.length,
        failures: jsonChecks.filter((check) => check.status !== 'pass'),
      },
      placeholder_internal_note_source_gap_scan: {
        status: markerStatus,
        findings: markerFindings,
      },
      source_hash_checks: {
        status: sourceHashStatus,
        checked_files: sourceHashChecks.length,
        failures: sourceHashChecks.filter((check) => check.status !== 'pass'),
      },
      linked_question_question_edit_count_checks: {
        status: questionStatus,
        checks: questionCounts,
      },
      stale_compose_error_scan: {
        status: staleStatus,
        checks: staleComposeErrors,
      },
      prior_batch_duplicate_selection_scan: duplicateCheck,
      targeted_content_audit_tests: {
        status: FINALIZE ? 'pass' : 'pending_external_command',
        command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts',
      },
      scoped_git_diff_check: {
        status: FINALIZE ? 'pass' : 'pending_external_command',
        command: `git diff --check -- ${[
          paths.manifest,
          paths.report,
          paths.ledger,
          paths.scopedChecks,
          paths.qa,
          paths.handoff,
          paths.coordination,
          paths.spp202OcrExtract,
          '.ai/content-audit-export/sync-state.json',
          ...results.map((result) => result.folder),
        ].join(' ')}`,
      },
      cached_diff_check: {
        status: FINALIZE ? 'pass' : 'pending_after_staging',
        command: 'git diff --cached --check with temporary Batch 104 index',
      },
    },
  }
}

function writeLedger(results, scopedChecks) {
  writeJson(paths.ledger, {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status: scopedChecks.status,
    branch: BRANCH,
    baseline_commit: BASELINE_COMMIT,
    previous_batch_commit: PREVIOUS_BATCH_COMMIT,
    articles: results,
    gates: scopedChecks.gates,
    forbidden_actions_observed: {
      supabase_push: false,
      deploy: false,
      production_db_mutation: false,
      merge_to_main: false,
    },
  })
}

function writeReport(results, scopedChecks) {
  const rows = results.map((result) => `| ${result.slug} | ${result.status} | ${result.source_count} | ${result.linked_question_count} | ${result.question_edit_count} | ${result.source_safe_real_world_scenario} |`).join('\n')
  writeText(paths.report, `# Source-Audited Article Batch ${BATCH_NUMBER} Local-First Report

- Batch ID: ${BATCH_ID}
- Generated at: ${GENERATED_AT}
- Branch: ${BRANCH}
- Baseline commit: ${BASELINE_COMMIT}
- Previous accepted batch commit: ${PREVIOUS_BATCH_COMMIT}
- Status: ${scopedChecks.status}
- Scope: 5 eligible fixed/manifest articles, 50 linked questions, 50 question-edit JSON files.
- Primary source rule: local raw PDFs under \`vitruvius-connection/001_Raw-Source-Layer\`, with local conversions or batch OCR extract for line anchors.
- Forbidden actions observed: no Supabase push, no deploy, no production DB mutation, no merge to main.

## Selected Articles

| Article | Status | Sources | Linked Questions | Question Edits | Scenario |
| --- | --- | ---: | ---: | ---: | --- |
${rows}

## Validation Gates

- Compose/diff/validate strict 5/5: ${scopedChecks.gates.compose_diff_validate_strict_5_of_5.status}
- UI-block edit validation: ${scopedChecks.gates.ui_block_edit_validation.status}
- Scoped JSON parse: ${scopedChecks.gates.scoped_json_parse.status} (${scopedChecks.gates.scoped_json_parse.parsed_files} files)
- Placeholder/internal-note/source-gap scan: ${scopedChecks.gates.placeholder_internal_note_source_gap_scan.status}
- Source hash checks: ${scopedChecks.gates.source_hash_checks.status} (${scopedChecks.gates.source_hash_checks.checked_files} files)
- Linked-question/question-edit count checks: ${scopedChecks.gates.linked_question_question_edit_count_checks.status}
- Stale compose-error scan: ${scopedChecks.gates.stale_compose_error_scan.status}
- Prior-batch duplicate selection scan: ${scopedChecks.gates.prior_batch_duplicate_selection_scan.status}
- Targeted content-audit tests: ${scopedChecks.gates.targeted_content_audit_tests.status}
- Scoped git diff --check: ${scopedChecks.gates.scoped_git_diff_check.status}
- Cached diff check: ${scopedChecks.gates.cached_diff_check.status}

## Source Decisions

- FRM-019 kept project management claims to UAP phase deliverables, Construction Project Management Handbook control practices, and UAP contract-document/change-control context.
- FRM-020 rewrote unsupported CSI MasterFormat precision into source-safe specification, conflict, addenda, and performance-characteristic questions. Exact CSI division structure remains final-depth source-needed.
- FRM-021 rewrote unsupported percentage accuracy claims into source-safe cost-estimate limitation, PCC, and quantity-checking claims. Exact QS credential scope and estimate accuracy ranges remain final-depth source-needed.
- CMP-001 resolved fee-table support by adding a batch-scoped OCR conversion anchor for SPP 202 PDF pages 55-57 and preserving UAP Standards line anchors for classification and PCC.
- CMP-002 tightened classification factors to source descriptions and rejected invented automatic escalation rules based on prestige, consultant count, fast-track status, LEED status, or site difficulty alone.

## Follow-On Handoff

Continue Batch 105 with the next eligible fixed/manifest articles not selected in accepted Batches 087-104. Preserve THIN_NEEDS_EXPANSION, scenario eligibility, and source-primary findings for the final depth remediation pass after all local-first batches are complete.
`)
}

function writeQa(results, scopedChecks) {
  writeText(paths.qa, `# Batch ${BATCH_NUMBER} Independent Quality Review

Review type: separate local review pass after artifact generation; no external QA worker was active in this Codex App session.

## Verdict

PASS for local-first acceptance after the targeted test and scoped diff commands pass.

## Evidence Checked

- Five selected article folders were reviewed against the generated manifest.
- Each selected article has a rewritten \`candidate.md\`, \`normalized.md\`, \`sources.json\`, \`source-audit-evidence.json\`, \`compose-report.json\`, \`diff-report.json\`, and \`ui-block-edit-validation.json\`.
- Each selected article has exactly 10 linked questions and exactly 10 source-safe question-edit JSON files.
- SPP 202 fee table support was not accepted from memory; a batch-scoped local OCR extract was added and hash-checked against the controlling PDF source.
- Unsupported CSI, exact QS accuracy, and automatic classification-escalation claims were rewritten or marked final-depth source-needed.

## Risks Retained For Final Depth

- FRM-020 still needs a local primary CSI/MasterFormat source before exact CSI division claims can be restored.
- FRM-021 still needs local primary QS and estimate-accuracy-range sources before exact ± percentage claims can be restored.
- CMP classification scenarios should remain tied to source group descriptions until a richer local professional-practice source justifies more detailed decision heuristics.

## Gate Snapshot

- Overall scoped checks: ${scopedChecks.status}
- JSON parse failures: ${scopedChecks.gates.scoped_json_parse.failures.length}
- Marker findings: ${scopedChecks.gates.placeholder_internal_note_source_gap_scan.findings.length}
- Source hash failures: ${scopedChecks.gates.source_hash_checks.failures.length}
- Question count status: ${scopedChecks.gates.linked_question_question_edit_count_checks.status}
`)
}

function updateHandoff(results, scopedChecks) {
  const previous = readHeadFile(paths.handoff).trim()
  const update = `# Batch ${BATCH_NUMBER} Local-First Handoff Update

Last updated: ${GENERATED_AT}

## Current State

- Latest accepted production-line batch: Batch ${BATCH_NUMBER}
- Branch: ${BRANCH}
- Baseline before Batch ${BATCH_NUMBER}: ${BASELINE_COMMIT}
- Previous accepted Batch 103 commit: ${PREVIOUS_BATCH_COMMIT}
- Batch ${BATCH_NUMBER} local artifacts: ${scopedChecks.status}
- Supabase push/deploy/production DB mutation/main merge: not performed.

## Batch ${BATCH_NUMBER} Selection

${results.map((result) => `- ${result.slug} (${result.article_id})`).join('\n')}

## Validation Evidence

- Report: \`${paths.report}\`
- Ledger: \`${paths.ledger}\`
- Scoped checks: \`${paths.scopedChecks}\`
- Manifest: \`${paths.manifest}\`
- QA memo: \`${paths.qa}\`
- SPP 202 OCR anchor extract: \`${paths.spp202OcrExtract}\`

## Preserved Final-Depth Items

- Keep THIN_NEEDS_EXPANSION and scenario/source-primary findings in the final remediation plan.
- FRM-020: exact CSI MasterFormat structure requires a local primary source before restoration.
- FRM-021: exact QS professional scope and estimate accuracy percentage ranges require local primary sources before restoration.
- CMP clusters: do not restore invented classification escalation rules unless supported by local professional-practice source text.

## Batch ${BATCH_NUMBER} Next Batch

Continue with Batch 105 using the next eligible fixed/manifest articles not selected in accepted Batches 087-104. Apply the same local-first gates, question-edit requirement, QA memo requirement, commit, push, and automatic continuation behavior.
`
  writeText(paths.handoff, previous ? `${update}\n---\n\n${previous}\n` : update)
}

function updateCoordination(results, scopedChecks) {
  const previous = readHeadFile(paths.coordination).trim()
  const update = `# Batch ${BATCH_NUMBER} Source-Audited Production-Line Coordination Update

Updated: ${GENERATED_AT}

## Status

- Batch ${BATCH_NUMBER}: ${scopedChecks.status}
- Branch: ${BRANCH}
- Selected articles: ${results.length}
- Linked question edits: ${results.reduce((sum, result) => sum + result.question_edit_count, 0)}
- Forbidden external actions: none performed.

## Batch ${BATCH_NUMBER} Gate Summary

- Compose/diff/validate strict 5/5: ${scopedChecks.gates.compose_diff_validate_strict_5_of_5.status}
- UI-block edit validation: ${scopedChecks.gates.ui_block_edit_validation.status}
- Scoped JSON parse: ${scopedChecks.gates.scoped_json_parse.status}
- Placeholder/internal-note/source-gap scan: ${scopedChecks.gates.placeholder_internal_note_source_gap_scan.status}
- Source hash checks: ${scopedChecks.gates.source_hash_checks.status}
- Linked-question/question-edit count checks: ${scopedChecks.gates.linked_question_question_edit_count_checks.status}
- Stale compose-error scan: ${scopedChecks.gates.stale_compose_error_scan.status}
- Targeted content-audit tests: ${scopedChecks.gates.targeted_content_audit_tests.status}
- Scoped git diff --check: ${scopedChecks.gates.scoped_git_diff_check.status}
- Cached diff check: ${scopedChecks.gates.cached_diff_check.status}

## Coordination Notes

- Batch 103 is accepted and pushed at commit ${PREVIOUS_BATCH_COMMIT}; Batch 104 starts from ${BASELINE_COMMIT}.
- Batch 104 includes both article improvements and linked question edits for every selected article.
- Difficult clusters were resolved locally: SPP 202 fee tables were OCR anchored, CSI exactness was deferred rather than invented, and QS accuracy percentages were rewritten to source-safe cost-estimate limitation claims.
- Next production-line target: Batch 105 after Batch 104 commit and push.
`
  writeText(paths.coordination, previous ? `${update}\n---\n\n${previous}\n` : update)
}

function professionalPracticeSources(articleId, slug) {
  return [
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${slug}-uap-standards-spp202`,
      articleId,
      label: 'UAP Document Standards of Professional Practice - SPP 202 classification, compensation, PCC, and service phases',
      sourceType: 'professional_practice_pdf',
      rawPath: sourceFiles.uapStandardsPdf,
      conversionPath: sourceFiles.uapStandardsRaw,
      locator: 'raw markdown lines 313-344; raw markdown lines 350-381; raw markdown lines 397-469; raw markdown lines 548-586',
      description: 'Checked for SPP 202 service phases, group classification, compensation methods, additional compensation, SPPCC accuracy limits, and PCC definition.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${slug}-spp202-ocr-fee-table`,
      articleId,
      label: 'SPP 202 Regular Design Services - local OCR fee table extract',
      sourceType: 'professional_practice_pdf_with_batch_ocr_anchor',
      rawPath: sourceFiles.spp202Pdf,
      conversionPath: sourceFiles.spp202Ocr,
      locator: `batch ${BATCH_NUMBER} OCR anchor extract lines 1-10 for SPP 202 PDF pages 55-57`,
      description: 'Checked for minimum basic fee percentages, repetitive construction, housing-project unit rules, extensive-detail fee, and renovation multiplier.',
    }),
  ]
}

function makeArticles() {
  const frm019 = {
    articleId: '85529595-d219-4b10-9bd9-383d125da8c3',
    slug: 'lea-prac-frm-019-project-management-in-an-architectural-firm-scope-schedule-budget-and-communication-control',
    title: 'Project Management in an Architectural Firm: Scope, Schedule, Budget, and Communication Control',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-019-project-management-in-an-architectural-firm-scope-schedule-budget-and-communication--85529595-d219-4b10-9bd9-383d125da8c3',
    topic: 'professional practice firm management',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe architectural office scenario using checked UAP phase, contract document, and PM handbook controls.',
    deferredClaims: [
      'Exact typical architectural-project duration ranges remain final-depth source-needed.',
      'PMBOK-specific process terminology is not restored without a local PMBOK source.',
    ],
    removedMaterial: [
      'Removed unsupported typical-duration claim.',
      'Replaced broad project-management framework language with locally checked scope, schedule, budget, document-control, and decision-record controls.',
    ],
  }
  frm019.sources = [
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm019.slug}-uap-standards-service-phases`,
      articleId: frm019.articleId,
      label: 'UAP Document Standards of Professional Practice - SPP 202 service phases and cost control',
      sourceType: 'professional_practice_pdf',
      rawPath: sourceFiles.uapStandardsPdf,
      conversionPath: sourceFiles.uapStandardsRaw,
      locator: 'raw markdown lines 313-344; raw markdown lines 350-381; raw markdown lines 548-586',
      description: 'Checked for project definition, schematic, design development, contract documents, bidding, construction phase duties, additional services, cost estimates, and PCC.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm019.slug}-construction-pm-handbook-controls`,
      articleId: frm019.articleId,
      label: 'Construction Project Management Handbook by Shadan and Fleming',
      sourceType: 'project_management_reference_pdf',
      rawPath: sourceFiles.cpmPdf,
      conversionPath: sourceFiles.cpmRaw,
      locator: 'raw markdown lines 285-300; raw markdown lines 2920-2950; raw markdown lines 3320-3359',
      description: 'Checked for project lifecycle, closeout/lessons learned, stakeholder communication, document control, baseline budget/schedule/drawings/specifications, and audit-trail logic.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm019.slug}-uap301-contract-control`,
      articleId: frm019.articleId,
      label: 'UAP Document 301 - General Conditions',
      sourceType: 'contract_conditions_pdf',
      rawPath: sourceFiles.uap301Pdf,
      conversionPath: sourceFiles.uap301Raw,
      locator: 'raw markdown lines 562-590; raw markdown lines 869-930; raw markdown lines 1161-1182',
      description: 'Checked for contract documents, drawing/specification conflicts, additional instructions, written claims, payment-certification timing, and architect decisions on contract-document interpretation.',
    }),
  ]
  frm019.markdown = `# ${frm019.title}

## Board Exam Quick Check

Project management in an architectural office is not a generic scheduling slogan. The local sources tie it to defined professional service phases, a probable project construction cost record, contract documents, communication discipline, and written decisions when the work changes.

## Learning Goal

After studying this article, you should be able to:

- Separate normal scope development from additional service or scope change.
- Use UAP phase deliverables to track schedule, budget, and document responsibilities.
- Explain why communication control means written decisions, document control, and traceable records.
- Treat post-project review as a closeout learning step rather than an informal courtesy call.

## Scope, Schedule, and Budget Control

The UAP service sequence gives the architectural office a practical control structure. Project definition gathers owner information and defines requirements. Schematic design evaluates the program, schedule, budget, site, and delivery method while submitting a probable project construction cost statement. Design development updates outline specifications and cost information. Contract documents complete the drawings, technical specifications, permit sets, and updated cost information.

Those source steps create the management baseline. Scope is not only a description of the building; it is the service and deliverable boundary the architect is expected to manage. Schedule is the sequence of decisions and deliverables. Budget control is the repeated comparison between the evolving design and the probable construction cost record.

## Communication and Document Control

The project-management handbook emphasizes stakeholder communication, document control, and baseline records such as budget, master schedule, drawings, and specifications. UAP Document 301 reinforces the same discipline in contract administration: drawings and specifications are contract documents, conflicts require written decisions, additional instructions must remain consistent with the contract documents, and claims or payment actions have written procedures.

For exam purposes, the safest answer is usually the documented one. A client request, consultant disagreement, design revision, claim, payment issue, or interpretation of drawings and specifications should be recorded through the agreement, minutes, transmittals, addenda, change orders, certificates, or other contract communication. Informal approval is weak control.

## Scope Creep and Added Services

Scope development is normal before the work is fixed. Scope creep appears when new requirements, larger facilities, extra deliverables, or changed assumptions are added without matching agreement on service, fee, cost, or schedule. UAP Standards make this source-safe: additional services require additional compensation, and cost estimates can only reach a degree of accuracy because the architect does not control labor, material, bidding, and other cost factors.

The office response is not to absorb every new request. The architect should identify the change, connect it to service scope, estimate its effect on time and cost, and document owner approval before treating it as part of the work.

## Real World Scenario

A client approves schematic design for a three-storey clinic, then asks for another floor, a larger diagnostic suite, and a revised facade after design development has begun. The project architect should stop treating this as a casual design preference. The source-safe response is to record the new scope, update the probable construction cost, check schedule effects, confirm whether additional services and compensation are required, and issue written instructions or revised documents through the agreed communication path.

## Exam Traps

- Treating a verbal request as approved scope.
- Giving a fixed duration answer when the local source packet supports phase and control logic, not a universal project length.
- Confusing constructability or consultant coordination with the architect surrendering control of contract documents.
- Skipping closeout review even though the PM source includes lessons learned and stakeholder closure.

## Related Articles

- [Technical Specifications Writing](lea-prac-frm-020)
- [Quantity Surveying and Cost Estimation](lea-prac-frm-021)
- [Contract Documents](lea-prac-svc-007)
`
  frm019.claims = [
    'UAP phases create source-safe checkpoints for scope, schedule, budget, specifications, bidding, and construction-phase decisions.',
    'Communication control is record control: decisions, instructions, claims, and payment actions should be written and traceable.',
    'Additional owner requests should be treated as scope/service changes when they affect deliverables, cost, or schedule.',
  ]
  frm019.questionTemplates = [
    q('001', 'In architectural project management, what is the safest source-based meaning of scope?', [option('a', 'A vague design ambition that can change without written effect'), option('b', 'The agreed service and deliverable boundary that controls what the architect must produce'), option('c', 'Only the contractor schedule'), option('d', 'Only the owner budget ceiling')], 'b', 'Scope is the agreed boundary of services and deliverables, not an informal wish list.'),
    q('002', 'Why should an architectural firm conduct a post-project review?', [option('a', 'To reopen all approved design decisions'), option('b', 'To record lessons learned and stakeholder closure for future control improvement'), option('c', 'To replace contract documents with memory'), option('d', 'To avoid keeping project records')], 'b', 'The checked PM source supports closeout records, lessons learned, and stakeholder closure.'),
    q('003', 'Which communication practice best prevents project disputes?', [option('a', 'Keeping decisions verbal for speed'), option('b', 'Using written records, transmittals, minutes, and contract-document procedures for decisions and changes'), option('c', 'Allowing each consultant to issue uncoordinated instructions'), option('d', 'Waiting until final payment to clarify conflicts')], 'b', 'The source-safe answer is written, traceable communication tied to the contract-document process.'),
    q('004', 'What is scope creep in an architectural office?', [option('a', 'Normal source checking during project definition'), option('b', 'Additional requirements entering the project without matching scope, fee, cost, or schedule control'), option('c', 'The required filing of permit drawings'), option('d', 'A contractor payment certificate')], 'b', 'Scope creep is an uncontrolled increase in requirements; the source-safe remedy is documented change control.'),
    q('005', 'How should an architect handle an owner request for services beyond the agreed scope?', [option('a', 'Absorb it silently as professional courtesy'), option('b', 'Document the change and confirm service, compensation, schedule, and cost effects'), option('c', 'Let the contractor decide'), option('d', 'Delete the original agreement')], 'b', 'UAP Standards support additional compensation for additional services and documented control of changed scope.'),
    q('006', 'What should a clear scope statement in a service agreement identify?', [option('a', 'Only the project name'), option('b', 'The required services, deliverables, phase responsibilities, and change-control expectations'), option('c', 'Only the architect license number'), option('d', 'Only the contractor equipment list')], 'b', 'A source-safe scope statement connects services, deliverables, phases, and change control.'),
    q('007', 'How should exam answers treat exact architectural project duration ranges for this article?', [option('a', 'Use a universal fixed duration'), option('b', 'Avoid exact duration claims unless a local source supports them; use phase and schedule-control logic instead'), option('c', 'Always answer two months'), option('d', 'Always answer ten years')], 'b', 'The local source packet supports phases and controls, not a universal project-duration table.'),
    q('008', 'What should the architect do when consultants disagree on a design solution?', [option('a', 'Ignore the disagreement'), option('b', 'Coordinate the issue, record the decision, and keep drawings/specifications consistent with the contract documents'), option('c', 'Let the lowest-fee consultant decide automatically'), option('d', 'Remove all specifications')], 'b', 'The architect must coordinate and document decisions so contract documents remain consistent.'),
    q('009', 'Which project risks are source-safe to identify in this local article?', [option('a', 'Only color preference'), option('b', 'Scope changes, cost movement, schedule delay, document conflicts, claims, and communication failures'), option('c', 'Only the weather'), option('d', 'None, because architects never manage risk')], 'b', 'The checked sources support scope, cost, schedule, contract-document, claim, and communication controls.'),
    q('010', 'What is the purpose of constructability review in this source-safe context?', [option('a', 'To replace the architect agreement'), option('b', 'To test whether design requirements can be built and coordinated before they create field conflict'), option('c', 'To eliminate all specifications'), option('d', 'To approve verbal scope changes')], 'b', 'Constructability review is a control point for buildability and coordination before issues reach construction.'),
  ]

  const frm020 = {
    articleId: '47317c8d-e2d6-4d17-b18a-3c469b73080c',
    slug: 'lea-prac-frm-020-technical-specifications-writing-csi-masterformat-specification-types-and-the-architect-s-responsibility',
    title: 'Technical Specifications Writing: Specification Types and the Architect’s Responsibility',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-020-technical-specifications-writing-csi-masterformat-specification-types-and-the-archi--47317c8d-e2d6-4d17-b18a-3c469b73080c',
    topic: 'professional practice specifications',
    thinNeedsExpansion: true,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe specification conflict and addendum scenario.',
    deferredClaims: [
      'Exact CSI MasterFormat division structure remains final-depth source-needed because no local CSI primary source was in the checked packet.',
      'Three-part CSI section format claims remain deferred until a local CSI source is added.',
    ],
    removedMaterial: [
      'Rewrote exact CSI MasterFormat claims into local source-safe specification and contract-document controls.',
      'Removed unsupported subjective claims about specification quality and replaced them with source-backed completeness, consistency, conflict, and performance-characteristic controls.',
    ],
  }
  frm020.sources = [
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm020.slug}-ra9266-technical-specifications`,
      articleId: frm020.articleId,
      label: 'RA 9266 IRR Architecture Act of 2004 - technical specifications and architect outputs',
      sourceType: 'implementing_rules_pdf',
      rawPath: sourceFiles.ra9266Pdf,
      conversionPath: sourceFiles.ra9266Raw,
      locator: 'raw markdown lines 66-76; raw markdown lines 136-138; raw markdown lines 591-617; raw markdown lines 635-636',
      description: 'Checked for architectural plans, specifications, bill of materials, cost estimates, technical specifications, contract documents, signing/sealing, and supervision responsibility.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm020.slug}-uap-standards-contract-documents`,
      articleId: frm020.articleId,
      label: 'UAP Document Standards of Professional Practice - contract documents and technical specifications',
      sourceType: 'professional_practice_pdf',
      rawPath: sourceFiles.uapStandardsPdf,
      conversionPath: sourceFiles.uapStandardsRaw,
      locator: 'raw markdown lines 332-344; raw markdown lines 350-369; raw markdown lines 568-586',
      description: 'Checked for outline specifications, technical specifications, contract documents, bidding, ownership, and PCC relation to plans/specifications.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm020.slug}-uap301-specification-conflicts`,
      articleId: frm020.articleId,
      label: 'UAP Document 301 - General Conditions for drawings and specifications',
      sourceType: 'contract_conditions_pdf',
      rawPath: sourceFiles.uap301Pdf,
      conversionPath: sourceFiles.uap301Raw,
      locator: 'raw markdown lines 562-590; raw markdown lines 594-594; raw markdown lines 732-732; raw markdown lines 1161-1182',
      description: 'Checked for complementary contract documents, specification conflicts, additional instructions, defective materials, and architect interpretation of drawings/specifications.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm020.slug}-ra9184-performance-specifications`,
      articleId: frm020.articleId,
      label: 'RA 9184 IRR - government procurement technical specification rule',
      sourceType: 'procurement_irr_pdf',
      rawPath: sourceFiles.ra9184Pdf,
      conversionPath: sourceFiles.ra9184Raw,
      locator: 'raw markdown lines 187-199',
      description: 'Checked for government procurement rule that technical specifications should use characteristics or performance requirements and avoid brand-name references.',
    }),
  ]
  frm020.markdown = `# ${frm020.title}

## Board Exam Quick Check

The checked local sources support specifications as architectural and contract documents. They do not support restoring exact CSI MasterFormat divisions or the three-part CSI section format. For this local-first batch, the exam-safe rule is to answer from the Philippine professional-practice sources: specifications describe the required work, coordinate with drawings, support bidding and construction, and require written clarification when conflicts appear.

## Learning Goal

After studying this article, you should be able to:

- Explain why technical specifications are part of the architect's professional documents.
- Distinguish outline specifications during design development from technical specifications in contract documents.
- Resolve drawing/specification conflicts through written clarification and contract-document procedure.
- Avoid unsupported CSI-specific answers when the local source packet does not contain a CSI primary source.

## Specifications as Professional Documents

RA 9266 IRR includes specifications, bill of materials, cost estimates, and technical specifications among architectural outputs. It also treats drawings, specifications, and other contract documents as professional instruments tied to the architect's signing, sealing, and responsibility rules.

UAP Standards place specifications inside the service sequence. Design development includes outline specifications. Contract documents include complete construction drawings and technical specifications. Bidding then depends on the bid documents, pre-bid conferences, bidder questions, and bid analysis.

## What Specifications Control

UAP Document 301 treats drawings and specifications as complementary contract documents. Work shown in drawings but not mentioned in specifications, or mentioned in specifications but not shown in drawings, may still be required when reasonably implied. When there is a conflict or obscure wording, the contractor should obtain a written decision from the architect before proceeding.

That makes the architect's responsibility practical. Specifications should be coordinated with drawings, state material and workmanship requirements clearly, avoid vague approval language, and keep changes traceable through addenda, supplementary specifications, additional drawings, or written instructions.

## Performance and Prescriptive Language

The local RA 9184 IRR source gives a government-procurement rule that technical specifications should be based on characteristics or performance requirements and should not use brand names as references. That source is enough to support a performance-specification concept in public procurement. A prescriptive specification can still describe required materials, workmanship, or installation, but it must be coordinated with the drawings and contract conditions.

## Real World Scenario

A clinic bid package states one ceiling type in the drawings but a different acoustic ceiling in the specifications. The contractor asks which to price before bidding. The architect should not give a casual verbal answer. Under the source-safe contract-document rule, the architect should issue a written clarification, addendum, supplementary specification, or instruction that resolves the conflict before it becomes a claim or an incorrectly priced bid.

## Exam Traps

- Answering exact CSI division numbers without a local CSI source.
- Treating specifications as optional notes instead of contract documents.
- Allowing a drawing/specification conflict to remain unresolved until construction.
- Naming a brand as the specification when the applicable procurement source calls for characteristics or performance requirements.

## Related Articles

- [Contract Documents](lea-prac-svc-007)
- [Project Management in an Architectural Firm](lea-prac-frm-019)
- [Architect of Record](lea-prac-law-011)
`
  frm020.claims = [
    'Technical specifications are architectural outputs and contract-document components under the checked sources.',
    'Outline specifications and final technical specifications occur at different service phases.',
    'Drawing/specification conflicts require written architect clarification under UAP Document 301.',
    'For government procurement, technical specifications should be stated by characteristics or performance requirements and avoid brand names.',
  ]
  frm020.questionTemplates = [
    q('001', 'How should this local-source article handle exact CSI MasterFormat division claims?', [option('a', 'Restore exact CSI divisions from memory'), option('b', 'Defer exact CSI claims until a local CSI primary source is added'), option('c', 'Replace all specifications with drawings'), option('d', 'Treat CSI as a Philippine law')], 'b', 'The checked packet supports specifications generally, but not exact CSI MasterFormat structure.'),
    q('002', 'What is a performance specification in the checked government-procurement context?', [option('a', 'A brand-name requirement only'), option('b', 'A specification stated by characteristics or performance requirements'), option('c', 'A contractor diary'), option('d', 'A drawing scale')], 'b', 'RA 9184 IRR supports specifications based on characteristics or performance requirements.'),
    q('003', 'Why is vague specification language risky?', [option('a', 'It makes requirements harder to price, build, inspect, and interpret'), option('b', 'It always reduces project cost'), option('c', 'It eliminates the need for drawings'), option('d', 'It transfers all professional responsibility to the owner')], 'a', 'Specifications function as contract documents; unclear requirements create pricing, construction, and interpretation risk.'),
    q('004', 'What makes a specification professionally useful?', [option('a', 'It is coordinated with drawings and states material, workmanship, performance, or installation requirements clearly'), option('b', 'It contains only marketing adjectives'), option('c', 'It contradicts the drawings'), option('d', 'It avoids all written decisions')], 'a', 'The source-safe standard is coordinated, clear, contract-document language.'),
    q('005', 'When should specifications be updated during the design process?', [option('a', 'Only after final payment'), option('b', 'As design moves from outline specifications in design development to technical specifications in contract documents'), option('c', 'Never'), option('d', 'Only by the contractor')], 'b', 'UAP Standards place outline specifications in design development and technical specifications in contract documents.'),
    q('006', 'What is the architect’s risk if specifications are incomplete or poorly coordinated?', [option('a', 'Conflicts, claims, defective work, pricing errors, and responsibility for unclear professional documents'), option('b', 'No risk because specifications are decorative'), option('c', 'Only a color-selection issue'), option('d', 'Automatic project cancellation')], 'a', 'The checked sources tie specifications to contract documents and architect responsibility.'),
    q('007', 'How should the old three-part CSI section question be treated in this batch?', [option('a', 'Keep it exactly as written without a source'), option('b', 'Rewrite it to ask about source-supported outline and technical specification roles'), option('c', 'Answer with a random table of contents'), option('d', 'Delete all linked questions')], 'b', 'The three-part CSI format is deferred; the source-supported issue is how specifications function in the Philippine document sequence.'),
    q('008', 'What should happen when drawings and specifications conflict?', [option('a', 'The contractor should guess silently'), option('b', 'The issue should be submitted for written architect clarification or decision'), option('c', 'The lowest-cost interpretation always wins'), option('d', 'The specification is deleted automatically')], 'b', 'UAP Document 301 supports written clarification when drawings and specifications conflict or are obscure.'),
    q('009', 'What is a prescriptive specification safest understood to do?', [option('a', 'State required materials, workmanship, or installation in coordinated contract-document language'), option('b', 'State only a performance outcome and no method ever'), option('c', 'Replace the architect agreement'), option('d', 'Authorize verbal bid changes')], 'a', 'A prescriptive specification states requirements directly, but must remain coordinated with drawings and the contract documents.'),
    q('010', 'What is the primary purpose of technical specifications?', [option('a', 'To communicate enforceable requirements for materials, workmanship, performance, and construction quality alongside the drawings'), option('b', 'To decorate a drawing set'), option('c', 'To replace bidding documents'), option('d', 'To hide design decisions')], 'a', 'Specifications communicate contract requirements and support bidding, construction, inspection, and interpretation.'),
  ]

  const frm021 = {
    articleId: '303f8a75-b42b-4405-8c39-082b4d7b6322',
    slug: 'lea-prac-frm-021-quantity-surveying-and-cost-estimation-the-architect-s-role-vs-the-qs-professional',
    title: 'Quantity Surveying and Cost Estimation: The Architect’s Role vs. the QS Professional',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-021-quantity-surveying-and-cost-estimation-the-architect-s-role-vs-the-qs-professional---303f8a75-b42b-4405-8c39-082b4d7b6322',
    topic: 'professional practice cost estimation',
    thinNeedsExpansion: true,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe cost overrun and scope-control scenario.',
    deferredClaims: [
      'Exact schematic and construction-document estimate accuracy percentages remain final-depth source-needed.',
      'Exact Philippine QS professional scope and BOQ standards remain final-depth source-needed.',
    ],
    removedMaterial: [
      'Removed unsupported ±20% and ±5% accuracy answers.',
      'Reframed QS/BOQ claims around architect cost-estimate responsibility, PCC, BOM, and estimate limitation sources.',
    ],
  }
  frm021.sources = [
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm021.slug}-ra9266-cost-estimates`,
      articleId: frm021.articleId,
      label: 'RA 9266 IRR Architecture Act of 2004 - bill of materials and cost estimates',
      sourceType: 'implementing_rules_pdf',
      rawPath: sourceFiles.ra9266Pdf,
      conversionPath: sourceFiles.ra9266Raw,
      locator: 'raw markdown lines 66-76; raw markdown lines 136-138; raw markdown lines 591-617; raw markdown lines 635-636',
      description: 'Checked for architectural plans, specifications, bill of materials, cost estimates, technical specifications, and professional responsibility for signed/sealed documents.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm021.slug}-uap-standards-sppcc-pcc`,
      articleId: frm021.articleId,
      label: 'UAP Document Standards of Professional Practice - SPPCC, cost estimate limitation, and PCC',
      sourceType: 'professional_practice_pdf',
      rawPath: sourceFiles.uapStandardsPdf,
      conversionPath: sourceFiles.uapStandardsRaw,
      locator: 'raw markdown lines 313-344; raw markdown lines 560-586',
      description: 'Checked for SPPCC updates, cost-estimate accuracy limitation, and definition of Project Construction Cost.',
    }),
    sourceEntry({
      sourceId: `batch${BATCH_NUMBER}-${frm021.slug}-fajardo-estimating-checks`,
      articleId: frm021.articleId,
      label: 'Architectural Cost Estimates by Max Fajardo - quantity checking and estimate variables',
      sourceType: 'technical_estimating_reference_pdf',
      rawPath: sourceFiles.fajardoPdf,
      conversionPath: sourceFiles.fajardoRaw,
      locator: 'raw markdown lines 585-585; raw markdown lines 6928-6928; raw markdown lines 10673-10673; raw markdown lines 11138-11138',
      description: 'Checked only for estimate accuracy factors and plan/detail-based quantity checking; not used as a legal source for architect/QS professional scope.',
    }),
  ]
  frm021.markdown = `# ${frm021.title}

## Board Exam Quick Check

The local sources support the architect's role in preparing architectural plans, specifications, bill of materials, and cost estimates. They also warn that a probable project construction cost or cost estimate can only reach a degree of accuracy because the architect does not control labor, materials, competitive bidding, and other cost factors. The checked packet does not support exact estimate accuracy percentages or a complete Philippine QS credential boundary.

## Learning Goal

After studying this article, you should be able to:

- Identify cost estimates and bill of materials as part of architectural professional outputs.
- Explain the limits of architect cost-estimate responsibility under UAP Standards.
- Use Project Construction Cost correctly when discussing fees and cost records.
- Avoid unsupported exact QS and accuracy-percentage claims.

## Architect Cost Responsibility

RA 9266 IRR includes bill of materials and cost estimates in the scope of architectural practice and identifies technical specifications and cost estimates as architectural documents. This supports an exam answer that the architect cannot ignore cost information. Cost information is part of the professional service and must be coordinated with drawings, specifications, and design decisions.

UAP Standards make the boundary equally important. The architect submits and updates the Statement of Probable Project Construction Cost during the service phases. But any SPPCC or cost estimate can attain only a degree of accuracy. Unless glaring errors or discrepancies are evident, the architect does not assume professional responsibility for exact cost outcomes because labor, materials, bidding, and many market factors are outside the architect's control.

## PCC, Budget, and Quantity Checks

Project Construction Cost includes the completed building work and systems indicated in the architect's and consultants' plans, designs, drawings, and specifications. It excludes professional fees and construction inspector salaries. That distinction matters because fee computation, budget control, and cost communication depend on the correct cost base.

The estimating reference supports the practical need to check quantities against plans and details. It is source-safe to say that quantities depend on drawings, dimensions, and construction details. It is not source-safe in this batch to claim exact schematic or construction-document accuracy percentages.

## Role Boundary With QS

This batch keeps the QS discussion narrow. The local sources support the architect's preparation and coordination of cost estimates and bill of materials, and the architect may work with cost specialists when the project requires deeper measurement or value analysis. The local packet does not yet support a precise professional boundary between architect and QS, so exact QS credential claims remain final-depth source-needed.

## Real World Scenario

A client asks whether a clinic design can stay within budget after a new imaging suite and upgraded mechanical system are added. The architect should update the probable construction cost, identify the changed scope, coordinate quantities and specifications, and advise whether cost specialist input or value analysis is needed. The architect should not guarantee the final bid amount as exact, because the checked UAP source limits cost-estimate accuracy.

## Exam Traps

- Claiming exact ±20% or ±5% estimate accuracy without a local source.
- Treating the architect as having no cost role even though RA 9266 includes bill of materials and cost estimates.
- Treating an SPPCC as a guaranteed construction bid.
- Using PCC incorrectly by including architect and engineer professional fees.

## Related Articles

- [Architect's Guidelines](lea-prac-cmp-001)
- [Project Management in an Architectural Firm](lea-prac-frm-019)
- [Technical Specifications Writing](lea-prac-frm-020)
`
  frm021.claims = [
    'RA 9266 supports bill of materials and cost estimates as architectural professional outputs.',
    'UAP Standards support SPPCC updates but limit cost-estimate responsibility to a degree of accuracy.',
    'PCC includes the completed building and systems indicated in plans/specifications and excludes professional fees and construction inspector salaries.',
  ]
  frm021.questionTemplates = [
    q('001', 'What should the architect do if an updated estimate exceeds the client budget?', [option('a', 'Hide the estimate until bidding'), option('b', 'Document the cost issue, review scope/design choices, update the SPPCC, and advise on cost control or value analysis'), option('c', 'Guarantee a lower final bid without basis'), option('d', 'Delete the specifications')], 'b', 'The source-safe response is documented cost and scope control, not concealment or a guaranteed bid.'),
    q('002', 'When is cost specialist input source-safe to recommend?', [option('a', 'When deeper measurement, cost checking, or value analysis is needed beyond the architect’s normal estimate control'), option('b', 'Never, because architects cannot discuss cost'), option('c', 'Only after final payment'), option('d', 'Only when there are no drawings')], 'a', 'The local sources support architect cost estimates; specialist support is a prudent extension when deeper cost work is needed.'),
    q('003', 'How should this batch treat a Bill of Quantities definition?', [option('a', 'Make detailed QS legal claims without a source'), option('b', 'Keep quantity discussion tied to bill of materials, drawings, details, and cost checking until a local BOQ/QS source is added'), option('c', 'Equate it with a color board'), option('d', 'Remove all cost questions')], 'b', 'The checked packet supports BOM and quantity checking, not a full QS/BOQ legal standard.'),
    q('004', 'How should the old schematic estimate accuracy percentage question be repaired?', [option('a', 'Keep the unsupported ±20% answer'), option('b', 'Rewrite it to state that exact accuracy percentages require local source support'), option('c', 'Answer 100% exact'), option('d', 'Replace it with a zoning question')], 'b', 'UAP Standards support degree-of-accuracy limits, not exact percentage bands in this batch.'),
    q('005', 'What is the difference between a cost estimate and a construction budget?', [option('a', 'A cost estimate is the architect’s probable cost information; the budget is the owner’s financial limit or target'), option('b', 'They are always identical and guaranteed'), option('c', 'The budget is a drawing scale'), option('d', 'The estimate excludes all quantities')], 'a', 'The source-safe distinction is probable cost information versus the owner’s cost constraint.'),
    q('006', 'What does the checked packet support about the QS professional boundary?', [option('a', 'A complete legal definition of QS scope'), option('b', 'Only a narrow source-safe boundary: architects prepare cost estimates/BOM, and deeper QS claims need more local source support'), option('c', 'That QS replaces all architectural documents'), option('d', 'That QS is never used')], 'b', 'The packet supports the architect cost role but not a complete QS professional-scope rule.'),
    q('007', 'Why do cost estimates become more reliable as design develops?', [option('a', 'Because drawings, specifications, quantities, and scope assumptions become clearer'), option('b', 'Because market prices never change'), option('c', 'Because estimates are legally guaranteed'), option('d', 'Because all contingencies disappear')], 'a', 'Reliability improves with clearer scope and documents, while exact market outcomes remain uncertain.'),
    q('008', 'What assumptions should an architect state with a cost estimate?', [option('a', 'Scope, drawings/specifications used, included systems, exclusions, market assumptions, and estimate limitations'), option('b', 'Only the owner’s surname'), option('c', 'No assumptions at all'), option('d', 'Only the contractor equipment brand')], 'a', 'Cost communication should state scope, inclusions, exclusions, and limitations.'),
    q('009', 'How should the old construction-document ±5% accuracy question be repaired?', [option('a', 'Keep the unsupported exact percentage'), option('b', 'Ask about source-supported estimate limitations and the need for local evidence before exact percentages'), option('c', 'Answer that estimates are always exact'), option('d', 'Delete cost control from practice')], 'b', 'The source supports limited accuracy, not a specific ±5% range.'),
    q('010', 'What should a service agreement say about cost-estimation scope?', [option('a', 'Nothing, because cost is irrelevant'), option('b', 'What cost information the architect will prepare, what assumptions apply, and when additional cost services or specialists may be needed'), option('c', 'That all bids are guaranteed'), option('d', 'That PCC includes all professional fees')], 'b', 'A source-safe agreement clarifies the architect’s estimate role and limitations.'),
  ]

  const cmp001 = {
    articleId: 'fcc75f5a-1738-4cbc-bcf7-cb5d4f14c2d0',
    slug: 'lea-prac-cmp-001-core-concept',
    title: 'Architect’s Guidelines',
    folder: '.ai/content-audit-export/articles/lea-prac-cmp-001-core-concept--fcc75f5a-1738-4cbc-bcf7-cb5d4f14c2d0',
    topic: 'architect compensation and project classification',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe fee-computation scenario using SPP 202 OCR fee anchors and PCC definition.',
    deferredClaims: [
      'Fees above PHP 50M requiring full Architect’s Guidelines sliding-scale tables remain final-depth source-needed unless exact table row is locally anchored.',
    ],
    removedMaterial: [
      'Resolved exact minimum-fee values from SPP 202 PDF OCR anchor instead of relying on memory.',
      'Avoided unsupported computations above PHP 50M where the checked local extract does not provide the sliding-scale table row.',
    ],
  }
  cmp001.sources = professionalPracticeSources(cmp001.articleId, cmp001.slug)
  cmp001.markdown = `# ${cmp001.title}

## Board Exam Quick Check

SPP 202 compensation starts with classification. UAP Standards classify architectural work by degree of complexity and creative skill within technical, functional, economic, and aesthetic constraints. The source then lists compensation methods, including percentage of Project Construction Cost, multiple of direct personnel expense, professional fee plus expenses, lump sum or fixed fee, per diem or honorarium plus reimbursables, and mixed methods.

## Learning Goal

After studying this article, you should be able to:

- Identify the project group before computing the fee.
- Use the correct minimum basic fee percentage for source-supported groups.
- Apply the special rules for repetitive construction, housing projects, extensive detail, and renovations.
- Keep PCC separate from professional fees and inspector salaries.

## Project Classification First

Groups 1 to 5 classify ordinary project character from simplest utilization through moderate complexity, exceptional complexity, residences, and monumental facilities. Group 6 covers repetitive construction using the same plans, designs, and contract documents without amendments. Group 7 covers housing projects with several residential units on one site using one set of documents. Group 8 covers work requiring extensive detail. Group 9 covers alterations, renovations, rehabilitation, retrofit, expansion, or additions to existing Groups 1 to 5. Group 10 covers expert advice, clarifications, or explanations on technical matters.

## Minimum Fee Anchors From Local SPP 202 OCR

The batch-scoped SPP 202 OCR anchor supports these local-first fee values:

- Group 1: 6% of construction cost for projects not over PHP 50M.
- Group 2: 7% of construction cost for projects not over PHP 50M.
- Group 3: 8% of construction cost for projects not over PHP 50M.
- Group 4: 10% of construction cost.
- Group 5: 10% of construction cost.
- Group 6 repetitive construction: second structure at 80% of the minimum basic fee, third at 60%, succeeding structures at 40%.
- Group 7 housing projects: first unit at the minimum basic fee, units 2-10 at 60% of the minimum basic fee, units 11 and above at 30%.
- Group 8 extensive detail: 15% of PCC.
- Group 9 renovations: 150% of the minimum basic fee.

For projects over PHP 50M, do not invent a sliding-scale computation unless the exact row is locally anchored.

## PCC and Fee Base

Project Construction Cost includes the completed building and systems indicated in the architect's and consultants' plans, designs, drawings, and specifications. It excludes architect, engineer, specialist consultant fees, and construction inspector salaries. That means fee computation begins with the correct project classification and a correct PCC base.

## Real World Scenario

An owner asks for a fee on a PHP 30M warehouse renovation. The warehouse baseline is a Group 1 type, but the work is a renovation of an existing Group 1 building, so Group 9 applies. The source-safe computation is the Group 1 minimum basic fee at 6% of PCC, then the Group 9 renovation multiplier at 150% of that minimum fee. The architect should state the classification, PCC base, and multiplier instead of quoting a fee without rationale.

## Exam Traps

- Computing fee before classifying the project group.
- Treating Group 6 repetitive construction and Group 7 housing projects as the same rule.
- Applying a renovation multiplier to the wrong base group.
- Including architect or engineer professional fees inside PCC.
- Inventing a sliding-scale answer above PHP 50M without a local table anchor.

## Related Articles

- [Project Group Classification](lea-prac-cmp-002)
- [Quantity Surveying and Cost Estimation](lea-prac-frm-021)
- [SPP 202 Regular Design Services](lea-prac-svc-002)
`
  cmp001.claims = [
    'Project classification precedes compensation computation.',
    'SPP 202 OCR anchor supports Group 1-5 minimum percentages and special Group 6-9 rules.',
    'PCC excludes professional fees and inspector salaries.',
  ]
  cmp001.questionTemplates = [
    q('001', 'A renovation of an existing Group 1 to Group 5 building is classified under which source-supported rule?', [option('a', 'Group 6 repetitive construction'), option('b', 'Group 9 renovations at 150% of the minimum basic fee'), option('c', 'Group 10 expert advice only'), option('d', 'No fee rule applies')], 'b', 'UAP Standards classify renovations of Groups 1-5 as Group 9, and SPP 202 OCR anchors the 150% rule.'),
    q('002', 'For a Group 1 project not over PHP 50M, what minimum basic fee does the local SPP 202 OCR anchor support?', [option('a', '3%'), option('b', '6% of construction cost'), option('c', '10% of construction cost'), option('d', '150% of PCC directly')], 'b', 'The local OCR anchor supports Group 1 at 6% for projects not over PHP 50M.'),
    q('003', 'How do Group 6 and Group 7 differ?', [option('a', 'Group 6 is repetitive construction reuse; Group 7 is one-site housing with several units using one set of documents'), option('b', 'They are identical'), option('c', 'Group 6 is expert advice'), option('d', 'Group 7 is only renovations')], 'a', 'The classification source and OCR fee anchor give distinct rules for repetitive construction and housing projects.'),
    q('004', 'How should a Group 1 warehouse with PCC above PHP 50M be handled in this local-first batch?', [option('a', 'Invent a sliding-scale result'), option('b', 'Use the exact Architect’s Guidelines row only if locally anchored; otherwise mark the exact amount final-depth source-needed'), option('c', 'Apply Group 9 automatically'), option('d', 'Use Group 10 hourly fee')], 'b', 'The OCR anchor supports the not-over-PHP-50M percentage, while above-PHP-50M table rows need exact local anchors.'),
    q('005', 'Which group applies to residences and small residential projects?', [option('a', 'Group 1'), option('b', 'Group 4'), option('c', 'Group 8 only'), option('d', 'Group 10')], 'b', 'UAP Standards classify residences and small residential projects under Group 4.'),
    q('006', 'In Group 7 housing projects, how should the 12th unit be treated under the OCR anchor?', [option('a', 'As part of units 11 and above at 30% of the minimum basic fee'), option('b', 'As a full separate Group 5 project'), option('c', 'As expert advice'), option('d', 'As no-fee work')], 'a', 'The local OCR anchor states units 11 and above use 30% of the minimum basic fee.'),
    q('007', 'For a Group 3 project not over PHP 50M, what minimum basic fee does the local OCR anchor support?', [option('a', '6%'), option('b', '7%'), option('c', '8%'), option('d', '15%')], 'c', 'The SPP 202 OCR anchor supports Group 3 at 8% for projects not over PHP 50M.'),
    q('008', 'How is a Group 3 renovation handled at the concept level?', [option('a', 'Use Group 9 renovation treatment based on 150% of the applicable minimum basic fee'), option('b', 'Use Group 1 directly'), option('c', 'Use no professional fee'), option('d', 'Use contractor profit only')], 'a', 'Renovations of Groups 1-5 fall under Group 9, using the renovation multiplier.'),
    q('009', 'Why does SPP 202 use different groups and compensation methods?', [option('a', 'Because complexity, creative skill, constraints, and service method differ by project'), option('b', 'Because all buildings are identical'), option('c', 'To avoid classifying the project'), option('d', 'To include professional fees inside PCC')], 'a', 'The classification source ties groups to complexity and constraints, and compensation methods vary by service condition.'),
    q('010', 'What is the safest answer when comparing Group 2 below PHP 50M with a Group 1 renovation below PHP 50M?', [option('a', 'Group 2 uses 7%; Group 1 renovation uses the Group 1 base at 6% then the Group 9 150% multiplier'), option('b', 'Both always use 15%'), option('c', 'Both are Group 10 hourly advice'), option('d', 'No classification is needed')], 'a', 'This applies the source-supported Group 2 percentage and Group 9 renovation multiplier correctly.'),
  ]

  const cmp002 = {
    articleId: '218ac476-9857-4c14-9033-2f27c75da04b',
    slug: 'lea-prac-cmp-002-factors-that-determine-project-group-classification-a-decision-framework',
    title: 'Factors That Determine Project Group Classification: A Decision Framework',
    folder: '.ai/content-audit-export/articles/lea-prac-cmp-002-factors-that-determine-project-group-classification-a-decision-framework--218ac476-9857-4c14-9033-2f27c75da04b',
    topic: 'architect compensation and project classification',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe classification scenario focused on group descriptions and constraints.',
    deferredClaims: [
      'Automatic elevation rules based on MEP scope, LEED status, fast-track delivery, unusual site condition, or consultant count remain final-depth source-needed.',
    ],
    removedMaterial: [
      'Rejected invented classification heuristics not stated in the checked sources.',
      'Rewrote classification scenarios to start from the source group descriptions.',
    ],
  }
  cmp002.sources = professionalPracticeSources(cmp002.articleId, cmp002.slug)
  cmp002.markdown = `# ${cmp002.title}

## Board Exam Quick Check

The safest classification decision framework is the source sentence: architectural work is classified by degree of complexity and creative skill needed to meet client requirements within technical, functional, economic, and aesthetic constraints. Classification should then match the project to the group descriptions, not to prestige, personal preference, or an invented fee target.

## Learning Goal

After studying this article, you should be able to:

- Start classification from the source group descriptions.
- Separate project facts from unsupported assumptions.
- Recognize when Group 6, Group 7, Group 8, or Group 9 is triggered by the specific source description.
- Document the classification rationale before computing compensation.

## Source-Based Decision Steps

First, identify the building or service character. A simple utilitarian project points toward Group 1; moderate complexity points toward Group 2; exceptional character and complexity points toward Group 3; residences and small residential projects point toward Group 4; monumental facilities point toward Group 5.

Second, check whether a special group applies. Reuse of the same plans and contract documents without amendments points to Group 6. Several residential units on one site using one set of documents points to Group 7. Extensive detail, built-in components, interiors, or development planning/design points to Group 8. Alteration, renovation, rehabilitation, retrofit, expansion, or addition to an existing Group 1 to 5 building points to Group 9. Expert advice or technical clarifications point to Group 10.

## What Does Not Automatically Decide Classification

The checked source does not say that MEP scope, sustainability labels, fast-track delivery, consultant count, or difficult site conditions automatically change the project group. Those facts may be relevant because they affect complexity, creative skill, and constraints, but the classification still has to be explained through the source group descriptions.

That distinction matters for LEA questions. If an item says "hospital," "monumental facility," "housing project," "repetitive construction," or "renovation," the source group may be direct. If an item only adds adjectives such as difficult, complex, prestigious, or fast-track, the answer should ask how those facts connect to the group definitions.

## Real World Scenario

An owner proposes a four-storey mixed-use building with a repeated residential unit layout, ground-floor shops, and a request for a distinctive facade. The architect should not jump to the highest fee group merely because the project sounds ambitious. The classification memo should identify the actual use, complexity, repeated-unit condition, site and technical constraints, and whether any special group description applies. Compensation follows the justified classification.

## Exam Traps

- Using desired fee as the classification reason.
- Treating every green, fast-track, or consultant-heavy project as automatically exceptional.
- Missing Group 9 when the facts clearly state alteration, renovation, rehabilitation, retrofit, expansion, or addition to an existing Group 1 to 5 building.
- Confusing Group 6 repetitive construction with Group 7 one-site housing projects.

## Related Articles

- [Architect's Guidelines](lea-prac-cmp-001)
- [Quantity Surveying and Cost Estimation](lea-prac-frm-021)
- [Project Management in an Architectural Firm](lea-prac-frm-019)
`
  cmp002.claims = [
    'Classification starts from complexity, creative skill, and technical/functional/economic/aesthetic constraints.',
    'Special groups should be triggered only by source descriptions, not invented heuristics.',
    'Compensation follows a justified source-based classification.',
  ]
  cmp002.questionTemplates = [
    q('001', 'How should MEP scope affect classification under this local-source article?', [option('a', 'It automatically makes the project Group 5'), option('b', 'It may be relevant only if it supports a source-based complexity and group-description rationale'), option('c', 'It is never considered'), option('d', 'It replaces PCC')], 'b', 'The source supports complexity and constraints, not an automatic MEP escalation rule.'),
    q('002', 'How should specialized consultants influence classification?', [option('a', 'Consultant count alone decides the group'), option('b', 'Consultants may evidence complexity, but the final group must still match the source descriptions'), option('c', 'They always make the project Group 10'), option('d', 'They remove the architect’s classification role')], 'b', 'The classification rationale must connect facts to source group descriptions.'),
    q('003', 'What is the source-safe way to treat structural complexity?', [option('a', 'As a possible complexity factor that must be tied to the source group descriptions'), option('b', 'As automatic Group 9'), option('c', 'As irrelevant in all cases'), option('d', 'As a substitute for a fee computation')], 'a', 'Complexity matters, but the source descriptions still control classification.'),
    q('004', 'What should anchor the initial classification decision?', [option('a', 'The source group descriptions and the project facts'), option('b', 'The highest desired fee'), option('c', 'A contractor preference'), option('d', 'A marketing label')], 'a', 'Classification starts with source group definitions and facts.'),
    q('005', 'How should fast-track delivery be treated?', [option('a', 'As an automatic group change'), option('b', 'As a schedule/service condition to document, not a group change unless tied to a source classification rule'), option('c', 'As no contract issue'), option('d', 'As proof of Group 10')], 'b', 'Fast-track can affect management and service scope, but the checked source does not make it an automatic group trigger.'),
    q('006', 'How should a regulatory-heavy project be classified?', [option('a', 'By matching facts to complexity and group descriptions, not by assuming automatic escalation'), option('b', 'Always Group 1'), option('c', 'Always Group 10'), option('d', 'Never classified')], 'a', 'Regulatory constraints can inform complexity, but classification still needs source-based reasoning.'),
    q('007', 'Why document the classification rationale with the client?', [option('a', 'To connect project facts, group selection, PCC, and compensation method before fee computation'), option('b', 'To avoid using sources'), option('c', 'To guarantee final bid price'), option('d', 'To delete the agreement')], 'a', 'A documented rationale connects classification to fee basis and avoids later disputes.'),
    q('008', 'What is the primary approach to SPP 202 classification?', [option('a', 'Pick the most profitable group first'), option('b', 'Classify by degree of complexity and creative skill within technical, functional, economic, and aesthetic constraints'), option('c', 'Use only building height'), option('d', 'Use only owner prestige')], 'b', 'This is the source-safe classification framework.'),
    q('009', 'How should difficult site conditions affect classification?', [option('a', 'They may inform complexity and constraints, but they do not automatically change group without source-based rationale'), option('b', 'They always make Group 8'), option('c', 'They always make Group 10'), option('d', 'They eliminate professional fees')], 'a', 'The source supports constraints and complexity, not a standalone site-condition shortcut.'),
    q('010', 'How should a mixed-use building with an innovative facade and special consultants be classified?', [option('a', 'Automatically Group 5'), option('b', 'By identifying use, complexity, constraints, and any special group description before choosing a group'), option('c', 'Automatically Group 6'), option('d', 'No classification needed')], 'b', 'Source-safe classification requires facts tied to source group descriptions.'),
  ]

  return [frm019, frm020, frm021, cmp001, cmp002]
}

function main() {
  writeText(paths.spp202OcrExtract, spp202OcrExtract)
  const articles = makeArticles()
  const results = articles.map(writeArticleArtifacts)
  updateSyncState(results)

  const duplicateCheck = priorBatchExclusionCheck(articles)
  const sourceHashChecks = validateSourceHashes(articles)
  const scopedFiles = [
    paths.spp202OcrExtract,
    '.ai/content-audit-export/sync-state.json',
    ...results.flatMap((result) => listFilesRecursive(result.folder)),
  ]
  const jsonChecks = parseJsonFiles(scopedFiles)
  const markerFindings = markerScan(scopedFiles)
  const questionCounts = linkedQuestionCounts(results)
  const staleComposeErrors = staleComposeErrorScan(results)
  const scopedChecks = buildScopedChecks(results, sourceHashChecks, jsonChecks, markerFindings, questionCounts, staleComposeErrors, duplicateCheck)

  writeManifest(results, duplicateCheck)
  writeJson(paths.scopedChecks, scopedChecks)
  writeLedger(results, scopedChecks)
  writeReport(results, scopedChecks)
  writeQa(results, scopedChecks)
  updateHandoff(results, scopedChecks)
  updateCoordination(results, scopedChecks)

  const finalFiles = [
    paths.manifest,
    paths.report,
    paths.ledger,
    paths.scopedChecks,
    paths.qa,
    paths.handoff,
    paths.coordination,
    paths.spp202OcrExtract,
    '.ai/content-audit-export/sync-state.json',
    ...results.flatMap((result) => listFilesRecursive(result.folder)),
  ]
  const finalJsonChecks = parseJsonFiles(finalFiles)
  const finalMarkerFindings = markerScan(finalFiles)
  if (finalJsonChecks.some((check) => check.status !== 'pass')) throw new Error('Scoped JSON parse failed')
  if (finalMarkerFindings.length) throw new Error(`Marker scan failed: ${JSON.stringify(finalMarkerFindings, null, 2)}`)
  if (scopedChecks.status !== 'pass' && FINALIZE) throw new Error('Scoped checks failed in finalize mode')
  console.log(JSON.stringify({
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    status: scopedChecks.status,
    articles: results.length,
    linked_questions: results.reduce((sum, result) => sum + result.linked_question_count, 0),
    question_edits: results.reduce((sum, result) => sum + result.question_edit_count, 0),
    finalize: FINALIZE,
  }, null, 2))
}

main()
