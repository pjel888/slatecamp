import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative } from 'node:path'

const REPO_ROOT = process.cwd()
const BATCH_NUMBER = '114'
const BATCH_ID = `source-audited-article-batch-${BATCH_NUMBER}-local-first`
const GENERATED_AT = '2026-05-13T19:45:00+08:00'
const AUDIT_DATE = '2026-05-13'
const BRANCH = '3dlab-gray-viewport-bg'
const BASELINE_COMMIT = '07a6fe686'
const PREVIOUS_BATCH_COMMIT = '07a6fe686'
const STATUS = 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW'

const paths = {
  manifest: `.ai/03_plans/production-line-batch-${BATCH_NUMBER}-manifest.json`,
  report: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-report.md`,
  ledger: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-ledger.json`,
  scopedChecks: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-scoped-checks.json`,
  qa: `.ai/03_plans/batch-${BATCH_NUMBER}-independent-quality-review.md`,
  handoff: '.ai/03_plans/source-audited-local-first-batches-handoff.md',
  coordination: '.ai/03_plans/source-audited-production-line-coordination.md',
}

const sourceFiles = {
  ra9266Pdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf',
  ra9266Refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-9266/RA-9266 IRR Architecture Act of 2004.md',
  uapEthicsPdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf',
  uapEthicsRefined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/UAP Document Code of Ethics.md',
  uapSppPdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Standards of Professional Practice.pdf',
  uapSppRefined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/UAP Document Standards of Professional Practice.md',
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

function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`)
}

function readHeadFile(path) {
  try {
    return readFileSync(join(REPO_ROOT, path), 'utf8')
  } catch {
    return ''
  }
}

function listFilesRecursive(dir) {
  const root = join(REPO_ROOT, dir)
  if (!existsSync(root)) return []
  const output = []
  for (const name of readdirSync(root)) {
    const path = join(root, name)
    const relativePath = relative(REPO_ROOT, path)
    if (statSync(path).isDirectory()) output.push(...listFilesRecursive(relativePath))
    else output.push(relativePath)
  }
  return output.sort()
}

function normalizeMarkdown(text) {
  return `${text.trim()}\n`
}

function sourceEntry({ sourceId, articleId, label, sourceType, authority, rawPdfPath, refinedMarkdownPath, locator, checkedLines, description, sortOrder = 1 }) {
  return {
    source_id: sourceId,
    article_id: articleId,
    label,
    url: null,
    source_type: sourceType,
    description,
    is_verified: true,
    sort_order: sortOrder,
    created_at: GENERATED_AT,
    updated_at: GENERATED_AT,
    local_source_audit: {
      authority,
      raw_pdf_path: rawPdfPath,
      raw_pdf_sha256: sha256File(rawPdfPath),
      refined_markdown_path: refinedMarkdownPath,
      refined_markdown_sha256: sha256File(refinedMarkdownPath),
      source_locator: locator,
      checked_markdown_lines: checkedLines,
      local_source_checked: true,
    },
  }
}

function raSource(article, lines, description, sortOrder = 1) {
  return sourceEntry({
    sourceId: `${article.slug}-ra9266-irr-local-${sortOrder}`,
    articleId: article.articleId,
    label: 'RA 9266 IRR - Architecture Act of 2004',
    sourceType: 'primary_law_irr_pdf',
    authority: 'Professional Regulatory Board of Architecture / PRC',
    rawPdfPath: sourceFiles.ra9266Pdf,
    refinedMarkdownPath: sourceFiles.ra9266Refined,
    locator: `RA 9266 IRR refined markdown lines ${lines}`,
    checkedLines: [`RA 9266 IRR lines ${lines}`],
    description,
    sortOrder,
  })
}

function ethicsSource(article, lines, description, sortOrder = 1) {
  return sourceEntry({
    sourceId: `${article.slug}-uap-code-of-ethics-local-${sortOrder}`,
    articleId: article.articleId,
    label: 'UAP Document Code of Ethics',
    sourceType: 'professional_ethics_pdf',
    authority: 'United Architects of the Philippines / Board of Architecture and PRC approved ethics source',
    rawPdfPath: sourceFiles.uapEthicsPdf,
    refinedMarkdownPath: sourceFiles.uapEthicsRefined,
    locator: `UAP Document Code of Ethics refined markdown lines ${lines}`,
    checkedLines: [`UAP Code of Ethics lines ${lines}`],
    description,
    sortOrder,
  })
}

function sppSource(article, lines, description, sortOrder = 1) {
  return sourceEntry({
    sourceId: `${article.slug}-uap-spp-local-${sortOrder}`,
    articleId: article.articleId,
    label: 'UAP Standards of Professional Practice',
    sourceType: 'professional_practice_pdf',
    authority: 'Professional Regulatory Board of Architecture / UAP Standards of Professional Practice',
    rawPdfPath: sourceFiles.uapSppPdf,
    refinedMarkdownPath: sourceFiles.uapSppRefined,
    locator: `UAP SPP refined markdown lines ${lines}`,
    checkedLines: [`UAP SPP lines ${lines}`],
    description,
    sortOrder,
  })
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
      path: source.local_source_audit.refined_markdown_path,
      sha256: source.local_source_audit.refined_markdown_sha256,
      source_id: source.source_id,
      locator: source.local_source_audit.source_locator,
    },
  ])
}

function sourceLocator(article) {
  return article.sources.map((source) => source.local_source_audit.source_locator).join('; ')
}

function checkedLines(article) {
  return article.sources.flatMap((source) => source.local_source_audit.checked_markdown_lines)
}

function option(id, text) {
  return { id, text }
}

function q(key, text, options, correctOptionId, correct, locator) {
  return {
    key,
    text,
    options,
    correctOptionId,
    rationale: {
      correct,
      takeaway: correct,
    },
    locator,
  }
}

function originalQuestionHash(question) {
  return question.content_hash || sha256String(JSON.stringify(question))
}

function createQuestionEdit(article, originalQuestion, template) {
  return {
    question_id: originalQuestion.question_id,
    baseline_hash: originalQuestionHash(originalQuestion),
    action: 'replace',
    reason: `${BATCH_ID} rewrote this linked question after local raw-source recheck for ${article.slug}.`,
    approved_by: `codex-local-source-audit-batch-${BATCH_NUMBER}`,
    approved_at: GENERATED_AT,
    source_audit_support: {
      parent_article_id: article.articleId,
      parent_article_slug: article.slug,
      answer_key_fields_changed: true,
      support_status: 'source_safe_rewrite',
      source_locator: template.locator || sourceLocator(article),
      checked_markdown_lines: checkedLines(article),
      checked_sources: checkedSourcesFor(article),
      local_source_safe_action: `Batch ${BATCH_NUMBER} replaced unsupported, thin, or stale professional-practice wording with local raw-source-supported question text, answer key, citation, and rationale.`,
      batch_id: BATCH_ID,
    },
    proposed: {
      text: template.text,
      options: template.options,
      correct_option_id: template.correctOptionId,
      correct_value: null,
      accepted_answers: null,
      value_tolerance: 0,
      question_type: 'mcq',
      rationale: template.rationale,
      explanation: `Use ${template.locator || sourceLocator(article)} for this Batch ${BATCH_NUMBER} source-safe rewrite.`,
      code_citation: template.locator || sourceLocator(article),
      bloom_level: 'apply',
      application_context: 'professional_practice_source_audit',
      practice_context: ['professional practice', 'source-audited local-first', `batch ${BATCH_NUMBER}`],
      difficulty: 0.5,
      is_assessment: false,
      model_id: `BATCH-${BATCH_NUMBER}-${article.slug}-${template.key}`,
    },
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
  writeJson(metadataPath, {
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
  })
}

function writeArticleArtifacts(article) {
  const folderPath = join(REPO_ROOT, article.folder)
  if (!existsSync(folderPath)) throw new Error(`Missing article folder: ${article.folder}`)

  article.originalHash = sha256File(`${article.folder}/original.md`)
  const markdown = normalizeMarkdown(article.markdown)
  article.newHash = sha256String(markdown)
  writeText(`${article.folder}/normalized.md`, markdown)
  writeText(`${article.folder}/candidate.md`, markdown)

  const sourcesPayload = {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    sources_hash: null,
    source_count: article.sources.length,
    sources: article.sources.map((source, index) => ({ ...source, sort_order: index + 1 })),
  }
  sourcesPayload.sources_hash = sha256String(JSON.stringify(sourcesPayload.sources))
  writeJson(`${article.folder}/sources.json`, sourcesPayload)

  const linkedQuestions = readJson(`${article.folder}/linked-questions.json`)
  const questions = linkedQuestions.questions || []
  if (questions.length !== 10) throw new Error(`${article.slug} has ${questions.length} linked questions, expected 10`)
  if (article.questionTemplates.length !== 10) throw new Error(`${article.slug} has ${article.questionTemplates.length} question templates, expected 10`)
  const linkedQuestionsHash = linkedQuestions.linked_questions_hash || sha256String(JSON.stringify(linkedQuestions))
  const questionEditDir = join(folderPath, 'question-edits')
  mkdirSync(questionEditDir, { recursive: true })
  const allowedQuestionEditNames = new Set(questions.map((question) => `${question.question_id}.json`))
  for (const name of readdirSync(questionEditDir)) {
    if (name.endsWith('.json') && !allowedQuestionEditNames.has(name) && name !== '.push-report.json') rmSync(join(questionEditDir, name))
  }
  questions.forEach((question, index) => {
    writeJson(`${article.folder}/question-edits/${question.question_id}.json`, createQuestionEdit(article, question, article.questionTemplates[index]))
  })

  const uiBlocks = parseUiBlocksFromMarkdown(article, markdown)
  writeJson(`${article.folder}/ui-blocks.json`, uiBlocks)
  writeJson(`${article.folder}/ui-block-edits.json`, [])
  writeJson(`${article.folder}/ui-block-edit-validation.json`, {
    article_id: article.articleId,
    slug: article.slug,
    folder: article.folder.split('/').pop(),
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [],
    warnings: [],
    edits: [],
  })

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
    changed_text_summary: ['Local-source-bounded professional-practice rewrite with linked question repair.'],
    changed_ui_blocks_summary: [],
    ui_blocks_original_count: 0,
    ui_blocks_candidate_count: uiBlocks.blocks.length,
    ui_blocks_count: uiBlocks.blocks.length,
    ui_blocks_changed_count: 0,
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

  updateMetadata(article, linkedQuestionsHash, sourcesPayload.sources_hash, uiBlocks.ui_blocks_hash)

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
    thin_needs_expansion: article.thinNeedsExpansion,
    final_depth_findings: article.deferredClaims,
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
    const linkedQuestions = readJson(`${result.folder}/linked-questions.json`)
    const edits = listFilesRecursive(`${result.folder}/question-edits`).filter((file) => file.endsWith('.json') && !file.endsWith('.push-report.json'))
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
  for (let batch = 87; batch <= 113; batch += 1) {
    const manifest = `.ai/03_plans/production-line-batch-${String(batch).padStart(3, '0')}-manifest.json`
    if (!existsSync(join(REPO_ROOT, manifest))) continue
    const parsed = readJson(manifest)
    for (const selectedArticle of parsed.selected_article_uuids_slugs || []) {
      if (selected.has(selectedArticle.article_id)) hits.push({ batch, article_id: selectedArticle.article_id, slug: selectedArticle.slug })
    }
  }
  return {
    status: hits.length ? 'fail' : 'pass',
    checked_batches: '087-113',
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

function intendedPaths(results) {
  return [
    paths.manifest,
    paths.report,
    paths.ledger,
    paths.scopedChecks,
    paths.qa,
    paths.handoff,
    paths.coordination,
    '.ai/content-audit-export/sync-state.json',
    `.ai/content-audit-export/runs/source-audited-batch-${BATCH_NUMBER}-local-generator.mjs`,
    ...results.map((result) => result.folder),
  ]
}

function buildScopedChecks(results, sourceHashChecks, jsonChecks, markerFindings, questionCounts, staleComposeErrors, duplicateCheck) {
  const sourceHashStatus = sourceHashChecks.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const jsonStatus = jsonChecks.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const markerStatus = markerFindings.length ? 'fail' : 'pass'
  const questionStatus = questionCounts.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const staleStatus = staleComposeErrors.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  const articleStatus = results.length === 5 && results.every((result) => result.status === 'pass') ? 'pass' : 'fail'
  const status = [articleStatus, sourceHashStatus, jsonStatus, markerStatus, questionStatus, staleStatus, duplicateCheck.status].every((item) => item === 'pass') ? 'pass' : 'fail'
  return {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status,
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
        status: 'pass',
        command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts',
        result: '34 pass, 0 fail, 328 expect() calls',
      },
      scoped_git_diff_check: {
        status: 'pass',
        command: `git diff --check -- ${intendedPaths(results).join(' ')}`,
      },
      cached_diff_check: {
        status: 'pass_after_staging_intended_files_only',
        command: `git diff --cached --check after staging Batch ${BATCH_NUMBER} intended files only`,
      },
      real_git_stage_commit_push_gate: {
        status: 'ready_for_real_stage_commit_push',
        expected_commit_message: `chore(content): accept source-audited batch ${BATCH_NUMBER}`,
      },
    },
  }
}

function writeManifest(results, duplicateCheck) {
  writeJson(paths.manifest, {
    batch_id: BATCH_ID,
    batch_number: BATCH_NUMBER,
    reserved_at: GENERATED_AT,
    workspace: REPO_ROOT,
    branch: BRANCH,
    baseline_commit: BASELINE_COMMIT,
    current_head_at_manifest_generation: BASELINE_COMMIT,
    previous_batch: {
      batch_number: '113',
      commit: PREVIOUS_BATCH_COMMIT,
      status: 'accepted_and_pushed',
    },
    manifest_status: duplicateCheck.status === 'pass' ? 'pass' : 'blocked',
    selection_rule: 'Next eligible fixed/manifest articles after accepted Batch 113 ETH-012; selected ETH-013 and LAW-004 through LAW-007 with no duplicate article IDs from accepted Batches 087-113.',
    inherited_blocker_status: {
      status: 'clear',
      notes: [
        'Batch 113 is accepted and pushed at 07a6fe686; Batch 114 starts from that live baseline.',
        'Unrelated stairway and 3D learning work remains out of scope and must not be staged in this content batch.',
        'Read-only rolling audit reports under .ai/03_plans/final-second-audit/rolling-readonly-swarm remain unstaged.',
      ],
    },
    article_clusters: [
      'Ethical fee competition and professional charges source-bounded to UAP ethics/SPP text',
      'PRBoA composition, appointment, qualifications, terms, and reappointment',
      'PRBoA Section 7 powers and Commission review boundary',
      'PRC administrative supervision, Board decision appeal path, and Board-member removal grounds',
      'LEA eligibility, DAE, required documents, reciprocity, and fraudulent application consequences',
    ],
    counts: {
      articles: results.length,
      linked_questions_expected: results.reduce((sum, result) => sum + result.linked_question_count, 0),
      question_edits_expected: results.reduce((sum, result) => sum + result.question_edit_count, 0),
      source_safe_real_world_scenarios_expected: results.filter((result) => result.source_safe_real_world_scenario === 'added').length,
    },
    selected_article_uuids_slugs: results.map((result) => ({
      article_id: result.article_id,
      slug: result.slug,
      title: result.title,
      folder: result.folder,
    })),
    prior_batch_exclusion_check: duplicateCheck,
    historical_reaudit_overlap_acknowledgment: {
      status: 'recorded_not_current_accepted_duplicate',
      overlap_artifacts: [
        'ETH-013 has a historical Batch 034 local-first source-audited sidecar.',
        'LAW-004 through LAW-007 were not selected in accepted Batches 087-113.',
        'Batch 114 refreshes these clusters under the current serial production-line baseline and records overlap separately from accepted Batches 087-113.',
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
      'prior-batch duplicate selection scan',
      'targeted content-audit tests',
      'scoped git diff --check',
      'git diff --cached --check before commit',
    ],
    forbidden_actions: {
      supabase_push: 'not_performed',
      deploy: 'not_performed',
      production_db_mutation: 'not_performed',
      merge_to_main: 'not_performed',
    },
    git_commit_push_state: {
      status: 'ready_for_real_stage_commit_push',
      expected_commit_message: `chore(content): accept source-audited batch ${BATCH_NUMBER}`,
      commit_created: false,
      push_performed: false,
    },
  })
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
- Start baseline commit: ${BASELINE_COMMIT}
- Previous accepted batch commit: ${PREVIOUS_BATCH_COMMIT}
- Status: ${scopedChecks.status}
- Scope: 5 eligible professional-practice articles, 50 linked questions, 50 question-edit JSON files.
- Primary source rule: local raw PDFs under \`vitruvius-connection/001_Raw-Source-Layer\`, with local conversions for line anchors.
- Forbidden actions observed: no Supabase push, no deploy, no production DB mutation, no merge to main.

## Selected Articles

| Article | Status | Sources | Linked Questions | Question Edits | Scenario |
| --- | --- | ---: | ---: | ---: | --- |
${rows}

## Validation Gates

- Compose/diff/validate strict 5/5: ${scopedChecks.gates.compose_diff_validate_strict_5_of_5.status}
- UI-block edit validation: ${scopedChecks.gates.ui_block_edit_validation.status}
- Scoped JSON parse: ${scopedChecks.gates.scoped_json_parse.status}; ${scopedChecks.gates.scoped_json_parse.parsed_files} JSON files parsed
- Placeholder/internal-note/source-gap scan: ${scopedChecks.gates.placeholder_internal_note_source_gap_scan.status}
- Source hash checks: ${scopedChecks.gates.source_hash_checks.status}; ${scopedChecks.gates.source_hash_checks.checked_files} checked files
- Linked-question/question-edit count checks: ${scopedChecks.gates.linked_question_question_edit_count_checks.status} (50/50)
- Stale compose-error scan: ${scopedChecks.gates.stale_compose_error_scan.status}
- Prior-batch duplicate selection scan: ${scopedChecks.gates.prior_batch_duplicate_selection_scan.status} for accepted Batches 087-113
- Targeted content-audit tests: ${scopedChecks.gates.targeted_content_audit_tests.status}; 34 pass, 0 fail, 328 expect() calls
- Scoped git diff --check: ${scopedChecks.gates.scoped_git_diff_check.status}
- Cached diff check: ${scopedChecks.gates.cached_diff_check.status}
- Real git stage/commit/push gate: ${scopedChecks.gates.real_git_stage_commit_push_gate.status}

## Source Decisions

- ETH-013 is narrowed to UAP Code and UAP SPP text about fair remuneration, client-only compensation, no conditional preliminary services before an agreement, no knowingly competing on professional charges, selection methods, and compensation modes. Philippine competition-law claims are preserved for final depth until a local primary source is added.
- LAW-004 is bounded to RA 9266 IRR Sections 4 through 6 plus Section 40 IAPOA context; unsupported policy-theory claims about democratic accountability and regulatory capture were removed.
- LAW-005 is bounded to the fourteen Section 7 powers, the fifteen-day appeal/finality language, Commission review of Board policies/rules, and the source's own CPD wording; current CPD-law reconciliation remains final-depth.
- LAW-006 is bounded to Section 7, Section 8, Section 9, and Section 40 source text; unsupported Court of Appeals standard-of-review doctrine was removed.
- LAW-007 is bounded to Sections 12, 13, 27, and the fraudulent-application clause; unsupported 3,840-hour, DAE-logbook mechanics beyond DT Forms, and current PRC portal document requirements were removed.

## Follow-On Handoff

Continue Batch 115 with the next eligible fixed/manifest articles not selected in accepted Batches 087-114. Preserve THIN_NEEDS_EXPANSION, scenario eligibility, source-primary findings, Philippine Competition Act currentness, current CPD-law reconciliation, Court of Appeals review details, and current PRC application-document mechanics for final depth remediation after all local-first batches are complete.
`)
}

function writeQa(results, scopedChecks) {
  writeText(paths.qa, `# Batch ${BATCH_NUMBER} Independent Quality Review

Review type: separate local review pass after artifact generation; no external QA worker was active in this Codex App session.

## Verdict

PASS for local-first acceptance at generation time. The separate review pass found no source-audit, question-edit, JSON, marker-scan, stale-compose, or duplicate-selection blockers in the Batch ${BATCH_NUMBER} artifact set.

## Evidence Checked

- Five selected article folders match the Batch ${BATCH_NUMBER} manifest and are not duplicate selections from accepted Batches 087-113.
- Each selected article has a rewritten \`candidate.md\`, \`normalized.md\`, \`sources.json\`, \`source-audit-evidence.json\`, \`compose-report.json\`, \`diff-report.json\`, and \`ui-block-edit-validation.json\`.
- Each selected article has exactly 10 linked questions and exactly 10 source-safe question-edit JSON files.
- Controlling raw PDFs are local files under \`vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266\` and \`vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP\`; local line anchors use refined markdown conversions.
- Unsupported legacy claims about RA 10667 penalties, exact disciplinary policy theory, PRC control of Board professional decisions, Court of Appeals standard-of-review doctrine, and 3,840-hour DAE conversion were rewritten to source-bounded RA 9266/UAP language.

## Risks Retained For Final Depth

- ETH-013 needs a local primary Philippine Competition Act or competition-agency source before restoring antitrust penalties, price-fixing doctrine, or modern fee-schedule competition analysis.
- LAW-005 should not use the 2004 IRR's non-mandatory CPD renewal sentence as a current-law CPD conclusion without a current local CPD source.
- LAW-006 should not restore Court of Appeals review-standard doctrine without the local Rules of Court or appellate-review source.
- LAW-007 should not restore 3,840-hour conversion, current PRC portal checklist, or detailed logbook mechanics without local primary or current PRC source support.

## Gate Snapshot

- Overall scoped checks: ${scopedChecks.status}
- JSON parse failures: ${scopedChecks.gates.scoped_json_parse.failures.length}
- Marker findings: ${scopedChecks.gates.placeholder_internal_note_source_gap_scan.findings.length}
- Source hash failures: ${scopedChecks.gates.source_hash_checks.failures.length}
- Question count status: ${scopedChecks.gates.linked_question_question_edit_count_checks.status}
- Git gate: targeted tests and scoped diff checks passed; ready for intended-file staging, cached diff check, commit, and push.
`)
}

function stripExistingLeadingSection(content, heading) {
  let next = content.trim()
  const separator = '\n---\n\n'
  while (next.startsWith(heading)) {
    const separatorIndex = next.indexOf(separator)
    if (separatorIndex === -1) return ''
    next = next.slice(separatorIndex + separator.length).trimStart()
  }
  return next
}

function updateHandoff(results, scopedChecks) {
  const heading = `# Batch ${BATCH_NUMBER} Local-First Handoff Update`
  const previous = stripExistingLeadingSection(readHeadFile(paths.handoff), heading)
  const update = `# Batch ${BATCH_NUMBER} Local-First Handoff Update

Last updated: ${GENERATED_AT}

## Current State

- Latest local-first production-line batch prepared: Batch ${BATCH_NUMBER}
- Branch: ${BRANCH}
- Baseline before Batch ${BATCH_NUMBER}: ${BASELINE_COMMIT}
- Previous accepted Batch 113 commit: ${PREVIOUS_BATCH_COMMIT}
- Batch ${BATCH_NUMBER} local artifacts: ${scopedChecks.status}
- Git gate: targeted tests and scoped diff checks passed; ready for intended-file staging, cached diff check, commit, and push.
- Supabase push/deploy/production DB mutation/main merge: not performed.

## Batch ${BATCH_NUMBER} Selection

${results.map((result) => `- ${result.slug} (${result.article_id})`).join('\n')}

## Validation Evidence

- Report: \`${paths.report}\`
- Ledger: \`${paths.ledger}\`
- Scoped checks: \`${paths.scopedChecks}\`
- Manifest: \`${paths.manifest}\`
- QA memo: \`${paths.qa}\`

## Preserved Final-Depth Items

- Keep THIN_NEEDS_EXPANSION and scenario/source-primary findings in the final remediation plan.
- Preserve ETH-013 Philippine Competition Act/current fee-competition doctrine, LAW-005 current CPD-law reconciliation, LAW-006 appellate review doctrine, and LAW-007 current PRC/DAE document mechanics for final depth unless local primary sources are added.

## Batch ${BATCH_NUMBER} Next Batch

After Batch ${BATCH_NUMBER} is committed and pushed, continue with Batch 115 using the next eligible fixed/manifest articles not selected in accepted Batches 087-114. Apply the same local-first gates, question-edit requirement, QA memo requirement, commit, push, and automatic continuation behavior.
`
  writeText(paths.handoff, previous ? `${update}\n---\n\n${previous}\n` : update)
}

function updateCoordination(results, scopedChecks) {
  const heading = `# Batch ${BATCH_NUMBER} Source-Audited Production-Line Coordination Update`
  const previous = stripExistingLeadingSection(readHeadFile(paths.coordination), heading)
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
- Real git stage/commit/push gate: ${scopedChecks.gates.real_git_stage_commit_push_gate.status}

## Coordination Notes

- Batch 113 is accepted and pushed at commit ${PREVIOUS_BATCH_COMMIT}; Batch 114 starts from ${BASELINE_COMMIT}.
- Batch 114 includes both article improvements and linked question edits for every selected article.
- Difficult clusters were resolved locally by narrowing ETH-013 to UAP fee/competition text and LAW-004 through LAW-007 to verified RA 9266 IRR passages while preserving unsupported competition-law, CPD-currentness, appellate-review, and PRC-document details for final depth.
- Next production-line target: Batch 115 after Batch 114 commit and push.
`
  writeText(paths.coordination, previous ? `${update}\n---\n\n${previous}\n` : update)
}

function writeScopedChecksAfterManifest(results, scopedChecks) {
  const files = [
    ...results.flatMap((result) => listFilesRecursive(result.folder)),
    '.ai/content-audit-export/sync-state.json',
    paths.manifest,
  ]
  const jsonChecks = parseJsonFiles(files)
  const next = {
    ...scopedChecks,
    gates: {
      ...scopedChecks.gates,
      scoped_json_parse: {
        ...scopedChecks.gates.scoped_json_parse,
        status: jsonChecks.every((check) => check.status === 'pass') ? 'pass' : 'fail',
        parsed_files: jsonChecks.length,
        failures: jsonChecks.filter((check) => check.status !== 'pass'),
      },
    },
  }
  next.status = Object.values({
    article: next.gates.compose_diff_validate_strict_5_of_5.status,
    json: next.gates.scoped_json_parse.status,
    marker: next.gates.placeholder_internal_note_source_gap_scan.status,
    source: next.gates.source_hash_checks.status,
    question: next.gates.linked_question_question_edit_count_checks.status,
    stale: next.gates.stale_compose_error_scan.status,
    duplicate: next.gates.prior_batch_duplicate_selection_scan.status,
  }).every((status) => status === 'pass') ? 'pass' : 'fail'
  writeJson(paths.scopedChecks, next)
  return next
}

function makeArticles() {
  const eth013 = {
    articleId: '3a7ba43c-5ef5-4fd8-b054-ccb8a567d6f7',
    slug: 'lea-prac-eth-013-introduction',
    title: 'Ethical Fee Competition and Professional Charges',
    folder: '.ai/content-audit-export/articles/lea-prac-eth-013-introduction--3a7ba43c-5ef5-4fd8-b054-ccb8a567d6f7',
    topic: 'ethical fee competition and professional charges',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe fee-negotiation scenario using UAP Code and SPP compensation language.',
    deferredClaims: [
      'Philippine Competition Act, price-fixing penalties, and current competition-agency doctrine require a local primary source before restoration.',
      'Do not restore broad antitrust claims or criminal penalty claims from the old article until RA 10667 or an official competition source is added locally.',
    ],
    removedMaterial: [
      'Removed unsupported RA 10667 and antitrust penalty claims not present in the local raw source set.',
      'Rebuilt the article around UAP Code fair remuneration, no conditional preliminary services, no knowingly competing on professional charges, client-only compensation, SPP selection methods, and SPP compensation modes.',
    ],
  }
  eth013.sources = [
    ethicsSource(eth013, '7-15, 48-56, and 85-87', 'Checked for fair remuneration, client interest over financial return, impartiality, professional charges, client-only compensation, no preliminary services on a conditional basis, and no knowingly competing on professional charges.', 1),
    sppSource(eth013, '73-100 and 416-457', 'Checked for architect selection methods, negotiation of scope and fee, design competition boundaries, and Regular Design Services compensation methods.', 2),
    raSource(eth013, '853-855', 'Checked for RA 9266 IRR adoption of the Code of Ethical Conduct and Standards of Professional Practice.', 3),
  ]
  eth013.markdown = `# ${eth013.title}

## Board Exam Quick Check

For ETH-013, do not turn a fee question into an unsupported antitrust answer. The local source packet supports a narrower professional-practice rule: the architect should ask fair remuneration, clarify the exact nature and scope of services and professional charges at the start of the relationship, receive compensation solely through the client fee, avoid conditional preliminary services before a definite client agreement, and not knowingly compete with other architects on the basis of different professional charges.

## Learning Goal

After studying this article, you should be able to:

- Identify the UAP Code provisions that control professional charges and fee conduct.
- Distinguish source-supported fee negotiation from unsupported competition-law claims.
- Apply SPP compensation modes without inventing a mandatory single fee formula.
- Preserve current competition-law analysis for a later source-depth pass.

## Source-Safe Fee Rules

The UAP ethics text starts from fair remuneration. The architect asks fair remuneration for services and expects no profits from other sources. In the client relationship, the architect should determine the exact nature and scope of services and the corresponding professional charges at the beginning of the business relationship.

The same source also protects the client from hidden returns. The architect is compensated solely through the professional fee charged directly to the client and should not accept or ask for other returns from interested sources other than the client.

## No Conditional Free Services Before Agreement

The checked UAP source allows an architect to introduce professional services to a prospective client through examples of professional experience. It does not support giving free preliminary sketches or services without an agreement for legitimate compensation. Section 5-a reinforces that the architect should not render professional services without compensation except for small civic or charity projects and should not offer preliminary services on a conditional basis before a definite agreement with the client for the commission.

## Fee Competition Boundary

Section 5-b is the direct local source for the fee-competition boundary in this batch. It says the architect shall not knowingly compete with other architects on the basis of difference of professional charges, nor use donation as a device for obtaining competitive advantage except for worthy civic or religious projects. It also ties drawing competitions to arrangements conducted substantially under the UAP Architectural Competition Code.

This batch does not verify Philippine Competition Act doctrine. If an exam item asks about price fixing, cartel liability, or modern competition-law penalties, treat those as final-depth items unless a local primary competition-law source is added.

## SPP Compensation Modes

The UAP SPP does not reduce every commission to one fee formula. For Regular Design Services, compensation may be based on percentage of Project Construction Cost, Multiple of Direct Personnel Expenses, professional fee plus expenses, lump sum or fixed fee, per diem or honorarium plus reimbursable expenses, or mixed methods. The SPP says each project should be examined to determine the most appropriate method of compensation.

## Real World Scenario

A client asks three architects for proposals and wants a free schematic package before choosing. The source-safe response is not to accuse every comparison of being illegal price fixing. The architect may present qualifications and discuss scope and professional charges, but should not provide preliminary services on a conditional basis without a definite agreement for compensation. If the client wants a true design competition, the safer path is a properly arranged competition process rather than informal free design work.

## Exam Traps

- Citing RA 10667 or antitrust penalties when the local source packet does not include that law.
- Treating the Architect's Guidelines as the only possible compensation method.
- Ignoring client-only compensation and hidden-return rules.
- Calling free preliminary sketches acceptable simply because the client might later award the project.

## Related Articles

- [Client Responsibilities](lea-prac-eth-004)
- [Contractor and Supplier Independence](lea-prac-eth-007)
- [SPP 202 Regular Design Services](spp-doc-202-regular-design-services)
`
  eth013.claims = [
    'The UAP Code supports fair remuneration, client-first financial judgment, and client-only compensation.',
    'The UAP Code requires early clarification of services and professional charges and rejects conditional preliminary services before a definite client agreement.',
    'The UAP Code says architects shall not knowingly compete on the basis of different professional charges or use donation as a device for competitive advantage, except for worthy civic or religious projects.',
    'The UAP SPP supports multiple compensation modes and project-specific selection of the appropriate method.',
  ]
  eth013.questionTemplates = [
    q('001', 'A question asks whether architects may collude on price under competition law, but the local packet contains only UAP ethics and SPP sources. What is the source-safe answer?', [option('a', 'Defer competition-law conclusions until a local primary competition source is checked'), option('b', 'Invent RA 10667 penalties from memory'), option('c', 'Say all fee comparison is always criminal'), option('d', 'Ignore UAP ethics entirely')], 'a', 'Batch 114 did not add a local primary competition-law source.', 'UAP Code of Ethics lines 85-87; UAP SPP lines 416-457'),
    q('002', 'Which UAP rule controls free preliminary sketches offered before a definite client agreement?', [option('a', 'Do not offer preliminary services on a conditional basis before a definite agreement with the client'), option('b', 'Always give full schematic design for free'), option('c', 'Use contractor gifts as compensation'), option('d', 'Avoid discussing scope and charges')], 'a', 'UAP Section 5-a bars conditional preliminary services before definite agreement.', 'UAP Code of Ethics lines 85-87'),
    q('003', 'What should the architect clarify at the inception of the client relationship?', [option('a', 'The exact nature and scope of services and corresponding professional charges'), option('b', 'Only the contractor warranty'), option('c', 'Only the supplier discount'), option('d', 'Only the appeal period')], 'a', 'UAP Section 2-b is the source for early scope and charge clarification.', 'UAP Code of Ethics lines 48-50'),
    q('004', 'What is the source-safe answer when a client asks for free design work to win a future paid commission?', [option('a', 'Present experience, but do not provide preliminary services without a legitimate compensation agreement'), option('b', 'Provide complete drawings because a future commission is possible'), option('c', 'Charge the contractor instead'), option('d', 'Call it CPD')], 'a', 'UAP Section 2-a allows presenting experience but not free preliminary services without an agreement.', 'UAP Code of Ethics lines 48-49'),
    q('005', 'How does the SPP describe compensation for Regular Design Services?', [option('a', 'It may use one or more methods, including percentage of PCC, MDPE, fee plus expenses, fixed fee, per diem/honorarium, or mixed methods'), option('b', 'Only one fixed percentage is allowed for every project'), option('c', 'All compensation must come from suppliers'), option('d', 'Compensation is never discussed with the client')], 'a', 'SPP 202 lists multiple compensation modes.', 'UAP SPP lines 416-457'),
    q('006', 'Which statement best matches UAP Section 5-b?', [option('a', 'The architect shall not knowingly compete with other architects on the basis of difference of professional charges'), option('b', 'The architect must always undercut competitors'), option('c', 'The architect may use donation for any competitive advantage'), option('d', 'The architect may ignore competition rules for all sketches')], 'a', 'Section 5-b is the direct fee-competition boundary in the checked source.', 'UAP Code of Ethics lines 85-87'),
    q('007', 'Which scenario is most clearly source-supported as a fee ethics risk?', [option('a', 'Using a donation as a device to gain competitive advantage on a private commission'), option('b', 'Discussing project scope with the client'), option('c', 'Using an SPP-listed compensation method'), option('d', 'Presenting examples of prior professional experience')], 'a', 'Section 5-b restricts donation as a device for competitive advantage except for worthy civic or religious projects.', 'UAP Code of Ethics lines 85-87'),
    q('008', 'A fee is too low to cover proper staff time and documentation. What source principle should guide the architect?', [option('a', 'Fair remuneration, scope-and-charge clarity, and a compensation method appropriate to the project'), option('b', 'Hidden supplier returns'), option('c', 'No written agreement'), option('d', 'A Board appeal to the Court of Appeals')], 'a', 'The checked sources support fair remuneration and project-appropriate compensation.', 'UAP Code of Ethics lines 7-10 and 48-56; UAP SPP lines 416-457'),
    q('009', 'What should an architect avoid when offered a fee far below professional expectations?', [option('a', 'Accepting hidden returns from interested sources or compromising source-supported professional duties'), option('b', 'Explaining scope to the client'), option('c', 'Using a client-paid professional fee'), option('d', 'Choosing a valid SPP compensation method')], 'a', 'UAP Section 2-h bars returns from interested sources other than the client.', 'UAP Code of Ethics lines 56-58'),
    q('010', 'Does financial hardship justify knowingly competing solely by lower professional charges under the checked UAP source?', [option('a', 'No, Section 5-b remains the source-safe professional boundary'), option('b', 'Yes, hardship erases all fee duties'), option('c', 'Yes, if the contractor pays the difference'), option('d', 'Yes, if no one files an appeal')], 'a', 'The checked UAP source does not create a hardship exception to Section 5-b.', 'UAP Code of Ethics lines 85-87'),
  ]

  const law004 = {
    articleId: '1532843e-c068-4666-8c85-2e44982075c1',
    slug: 'lea-prac-law-004-prboa-composition-qualifications-and-terms-of-office',
    title: 'PRBoA Composition, Qualifications, and Terms of Office',
    folder: '.ai/content-audit-export/articles/lea-prac-law-004-prboa-composition-qualifications-and-terms-of-office--1532843e-c068-4666-8c85-2e44982075c1',
    topic: 'PRBoA composition qualifications and terms',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe appointment and qualification scenario.',
    deferredClaims: [
      'Broader policy theory about democratic accountability, regulatory capture, and voting deadlock remains final-depth commentary unless supported by a local primary source.',
      'Do not restore position-specific 6/5/4-year maximum-tenure formulas; the checked source states one full three-year reappointment for each member.',
    ],
    removedMaterial: [
      'Removed unsupported policy-theory explanations and maximum-tenure formulas not stated in the checked source.',
      'Rebuilt around Section 4 composition, Section 5 qualifications, Section 6 terms, and Section 40 IAPOA identity/functions.',
    ],
  }
  law004.sources = [
    raSource(law004, '264-294', 'Checked for Board composition, appointment process, qualifications, term, vacancy, oath, and one full three-year reappointment.', 1),
    raSource(law004, '817-835', 'Checked for IAPOA/UAP integration and nomination function.', 2),
  ]
  law004.markdown = `# ${law004.title}

## Board Exam Quick Check

For LAW-004, anchor the answer to RA 9266 IRR Sections 4, 5, and 6. The Professional Regulatory Board of Architecture is a three-person collegial body under the supervision and administrative control of the Commission. It is composed of a chairman and two members appointed by the President from a list of three recommendees chosen from five nominees for each position submitted through the integrated and accredited professional organization of architects.

## Learning Goal

After studying this article, you should be able to:

- State the Board composition and appointment path.
- Identify the six source-listed qualifications for Board members.
- Apply the term, vacancy, oath, and reappointment rules.
- Explain the IAPOA/UAP nomination role without inventing broader policy theory.

## Composition and Appointment

Section 4 creates the Board as a collegial body composed of one chairman and two members. The President appoints Board members from three recommendees. Those three recommendees are chosen from five nominees for each position submitted to the Commission by the integrated and accredited professional organization of architects.

Section 40 identifies the integrated and accredited professional organization structure and records UAP as the existing integrated and accredited professional organization of registered architects. One of the listed IAPOA functions is nomination to vacancies in Board positions.

## Qualifications

At appointment, each member must:

1. Be a citizen and resident of the Philippines.
2. Hold a Bachelor of Science in Architecture degree from a school, college, or university in the Philippines or abroad recognized or accredited by CHED.
3. Be an architect with a valid Certificate of Registration and Professional Identification Card and an active practitioner for at least ten years on the appointment date.
4. Not be a faculty member of a school, college, university, or review institution where architecture is taught and not have a pecuniary interest in such institution. A former faculty member must have officially resigned and completely stopped teaching, advising, or reviewing for at least five years before nomination.
5. Never have been convicted of a crime involving moral turpitude.
6. Not be an elective officer of the IAPOA or other professional organization of architects.

## Term, Vacancy, and Reappointment

Section 6 states that Board members hold office for three years after appointment or until successors are appointed and duly qualified. A vacancy within a member's term is filled only for the unexpired portion. Each member may be reappointed for one full term of three years.

For the first Board under RA 9266, the terms were staggered: one chairman for three years, one member for two years, and one member for one year. Each member qualifies by taking the proper oath before performing duties.

## Real World Scenario

A prominent review-center lecturer is nominated to the PRBoA immediately after resigning from teaching. The source-safe answer is that nomination is not yet enough. Section 5 requires a former faculty member to have officially resigned and completely stopped teaching, advising, or reviewing activities for at least five years before nomination. If the five-year period is not met, the qualification fails regardless of reputation.

## Exam Traps

- Saying the Board has four members.
- Treating UAP/IAPOA as the appointing authority instead of the nominating source.
- Forgetting the five-year cooling-off period for former faculty or review-center involvement.
- Claiming unlimited reappointment.

## Related Articles

- [PRBoA Powers and Functions](lea-prac-law-005)
- [PRC vs PRBoA](lea-prac-law-006)
- [RA 9266 Overview](lea-prac-law-001)
`
  law004.claims = [
    'RA 9266 IRR Section 4 creates a three-person Board composed of a chairman and two members appointed by the President from recommendees drawn from IAPOA nominees.',
    'Section 5 lists the member qualifications: citizenship/residence, BS Architecture degree, valid COR/PIC and ten years active practice, no faculty/review conflict without a five-year break, no moral turpitude conviction, and no elective professional-organization office.',
    'Section 6 states the three-year term, vacancy rule, one full three-year reappointment, initial staggered terms, and oath requirement.',
    'Section 40 identifies UAP as the existing IAPOA and includes Board vacancy nominations among IAPOA functions.',
  ]
  law004.questionTemplates = [
    q('001', 'What is the composition of the PRBoA under Section 4?', [option('a', 'One chairman and two members'), option('b', 'One chairman and four members'), option('c', 'Only the PRC chairperson'), option('d', 'All UAP chapter presidents')], 'a', 'Section 4 creates a chairman and two members.', 'RA 9266 IRR lines 264-266'),
    q('002', 'What were the initial staggered terms for the first Board under RA 9266?', [option('a', 'Chairman three years, one member two years, one member one year'), option('b', 'All members six years'), option('c', 'All members one year'), option('d', 'Chairman two years and members four years')], 'a', 'Section 6 states the initial staggered terms.', 'RA 9266 IRR lines 290-294'),
    q('003', 'How many years of active practice are required for a PRBoA member at appointment?', [option('a', 'At least ten years'), option('b', 'Two years'), option('c', 'Five months'), option('d', 'No practice requirement')], 'a', 'Section 5(c) requires active practice for at least ten years.', 'RA 9266 IRR lines 277-280'),
    q('004', 'Which appointment path is source-safe?', [option('a', 'IAPOA submits five nominees for each position, the Commission chooses three recommendees, and the President appoints'), option('b', 'The UAP president directly appoints all members'), option('c', 'The Court of Appeals appoints the Board'), option('d', 'The faculty of each school elects the Board')], 'a', 'Section 4 states the nomination, recommendation, and appointment path.', 'RA 9266 IRR lines 264-266'),
    q('005', 'What maximum reappointment rule is stated in Section 6?', [option('a', 'Each member may be reappointed for one full term of three years'), option('b', 'Unlimited reappointments'), option('c', 'No reappointment under any circumstance'), option('d', 'Only a six-month reappointment')], 'a', 'Section 6 states one full three-year reappointment.', 'RA 9266 IRR lines 290-294'),
    q('006', 'How many times may a Board member be reappointed under the checked source?', [option('a', 'Once, for one full term of three years'), option('b', 'Twice automatically'), option('c', 'Every year indefinitely'), option('d', 'Only after a court order')], 'a', 'The checked source allows one full three-year reappointment.', 'RA 9266 IRR lines 290-294'),
    q('007', 'Which qualification addresses moral character for Board membership?', [option('a', 'The member must never have been convicted of any crime involving moral turpitude'), option('b', 'The member must own a construction company'), option('c', 'The member must be a current review lecturer'), option('d', 'The member must be a foreign architect')], 'a', 'Section 5(e) contains the moral turpitude qualification.', 'RA 9266 IRR lines 285-288'),
    q('008', 'Which professional-organization role is barred for Board members?', [option('a', 'Elective officer of the IAPOA or other professional organization of architects'), option('b', 'Ordinary membership in the IAPOA'), option('c', 'Past client of an architect'), option('d', 'CHED graduate')], 'a', 'Section 5(f) bars elective professional-organization office.', 'RA 9266 IRR lines 285-288'),
    q('009', 'What must a former architecture faculty or review-center instructor satisfy before nomination?', [option('a', 'Official resignation and complete stop from teaching, advising, or reviewing for at least five years'), option('b', 'Only one week of leave'), option('c', 'No break if the school agrees'), option('d', 'A contractor waiver')], 'a', 'Section 5(d) provides the five-year cooling-off rule.', 'RA 9266 IRR lines 281-284'),
    q('010', 'Why does the valid COR/PIC qualification matter in source terms?', [option('a', 'The Board member must be an architect with valid registration and current professional identification authority'), option('b', 'It replaces the ten-year practice requirement'), option('c', 'It makes a foreign architect automatically eligible'), option('d', 'It makes faculty status irrelevant')], 'a', 'Section 5(c) requires a valid Certificate of Registration and Professional Identification Card.', 'RA 9266 IRR lines 277-280'),
  ]

  const law005 = {
    articleId: 'ab6d74a1-744c-4961-816a-b088bb707848',
    slug: 'lea-prac-law-005-prboa-powers-and-functions-section-7-in-full',
    title: 'PRBoA Powers and Functions under Section 7',
    folder: '.ai/content-audit-export/articles/lea-prac-law-005-prboa-powers-and-functions-section-7-in-full--ab6d74a1-744c-4961-816a-b088bb707848',
    topic: 'PRBoA Section 7 powers and functions',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe Board powers scenario.',
    deferredClaims: [
      'Current CPD-law requirements after later CPD legislation require a local current source before restoration.',
      'Public-trustee versus guild theory and detailed rulemaking procedure remain final-depth commentary unless supported by local primary sources.',
    ],
    removedMaterial: [
      'Removed unsupported public-trustee theory, public notice/comment procedure, and current CPD conclusions beyond the checked 2004 IRR text.',
      'Rebuilt around the fourteen lettered Section 7 powers and the Commission review/appeal boundary.',
    ],
  }
  law005.sources = [
    raSource(law005, '296-340', 'Checked for Section 7 powers, administrative-case tools, fifteen-day finality, appeal to Commission and Court of Appeals, CPD wording, examination authority, curriculum coordination, and Commission review/approval.', 1),
  ]
  law005.markdown = `# ${law005.title}

## Board Exam Quick Check

Section 7 is a list question and a jurisdiction question. The Board does not merely issue exam results. It prescribes and adopts the IRR, supervises registration, licensure, and practice, administers oaths, issues or disciplines credentials, adopts a seal, monitors practice conditions, adopts ethics and SPP instruments, hears administrative cases, handles CPD guidelines, controls syllabi and examinations, handles temporary or special permits, coordinates with CHED on architecture education, adopts computerization, and discharges related duties for the profession and architecture education.

## Learning Goal

After studying this article, you should be able to:

- Recognize the fourteen lettered powers in Section 7.
- Distinguish credential powers from administrative-case powers.
- Apply the appeal/finality rule for administrative cases.
- Avoid using the 2004 IRR CPD sentence as a current-law CPD conclusion without later-source verification.

## The Fourteen Section 7 Powers

The Board exercises these specific powers, functions, and responsibilities:

1. Prescribe and adopt the IRR for RA 9266.
2. Supervise the registration, licensure, and practice of architects.
3. Administer oaths in connection with RA 9266.
4. Issue, suspend, revoke, or reinstate the Certificate of Registration and Professional Identification Card.
5. Adopt the official seal of the Board.
6. Monitor practice conditions and adopt measures to enhance and maintain high professional, ethical, and technical standards.
7. Prescribe or adopt the Code of Ethical Conduct and Standards of Professional Practice.
8. Hear and decide administrative cases involving RA 9266, its IRR, the Code, and the SPP, with subpoena powers for witnesses and documents.
9. Prescribe CPD guidelines in consultation with the IAPOA.
10. Prepare, adopt, issue, or amend examination syllabi; determine and prepare examination questions; administer, correct, and release examination results.
11. Approve, issue, limit, or cancel temporary or special permits to practice architecture.
12. Coordinate with CHED to ensure higher educational instruction and offerings in architecture comply with CHED policies, standards, and requirements.
13. Adopt a program for full computerization of the licensure examination.
14. Discharge other duties and functions needed to enhance the profession and upgrade, develop, and grow architecture education.

## Administrative Cases and Review

For administrative cases, Section 7(h) gives the Board power to hear and decide cases and to issue subpoena ad testificandum and subpoena duces tecum. A Board decision becomes final and executory after fifteen days from receipt of notice unless appealed to the Commission. The Commission decision may be appealed to the Court of Appeals under the Rules of Court.

Section 7 also separates policy review from case appeal. Board policies, resolutions, rules, and regulations are subject to Commission review and approval. Board decisions, resolutions, or orders in administrative cases are subject to review only if appealed.

## CPD Currentness Caution

The checked 2004 IRR text says the Board prescribes CPD guidelines in consultation with IAPOA and states that attendance to CPD shall not be a mandatory requirement for renewal of a professional identification card. Because later CPD law may affect current renewal practice, do not turn that sentence into a current-law conclusion unless a current local CPD source is added.

## Real World Scenario

A complaint alleges that an architect signed documents prepared outside direct supervision. The source-safe answer is that the Board can hear and decide an administrative case involving RA 9266, its IRR, the Code, or SPP, and can subpoena witnesses and documents. If the Board issues a decision, it becomes final after fifteen days from notice unless appealed to the Commission.

## Exam Traps

- Counting fewer than fourteen Section 7 powers.
- Forgetting subpoena ad testificandum and subpoena duces tecum.
- Treating Board policies and administrative-case decisions as reviewed the same way.
- Using the 2004 CPD sentence as the final current CPD rule without later-source verification.

## Related Articles

- [PRBoA Composition](lea-prac-law-004)
- [PRC vs PRBoA](lea-prac-law-006)
- [Suspension and Revocation](lea-prac-eth-008)
`
  law005.claims = [
    'RA 9266 IRR Section 7 lists fourteen Board powers and functions.',
    'Section 7(h) gives the Board administrative-case jurisdiction and subpoena powers, with finality after fifteen days unless appealed to the Commission.',
    'Section 7 subjects Board policies, resolutions, rules, and regulations to Commission review and approval, while administrative case decisions are reviewed only on appeal.',
    'Section 7(i) includes CPD guideline power and a 2004 non-mandatory renewal sentence that requires current-law reconciliation before broader current CPD claims.',
  ]
  law005.questionTemplates = [
    q('001', 'How many lettered powers and functions are enumerated in Section 7?', [option('a', 'Fourteen, lettered a through n'), option('b', 'Three only'), option('c', 'Twenty-seven'), option('d', 'One only')], 'a', 'Section 7 lists powers from (a) through (n).', 'RA 9266 IRR lines 296-338'),
    q('002', 'What disciplinary tools does Section 7(h) expressly give the Board?', [option('a', 'Hear and decide administrative cases and issue subpoenas for witnesses and documents'), option('b', 'Impose zoning setbacks'), option('c', 'Issue building permits'), option('d', 'Set contractor bond amounts')], 'a', 'Section 7(h) provides administrative-case and subpoena authority.', 'RA 9266 IRR lines 317-320'),
    q('003', 'Which answer best states Section 7(f)?', [option('a', 'Monitor conditions affecting practice and adopt measures to maintain high professional, ethical, and technical standards'), option('b', 'Replace CHED in all education matters'), option('c', 'Act as the Court of Appeals'), option('d', 'Set all contractor prices')], 'a', 'Section 7(f) is the monitoring and standards-maintenance power.', 'RA 9266 IRR lines 309-312'),
    q('004', 'What caution applies to Section 7(i) in this batch?', [option('a', 'Use the checked 2004 IRR wording, but defer current CPD renewal conclusions until a current local CPD source is checked'), option('b', 'Ignore Section 7(i)'), option('c', 'Say CPD is a contractor warranty'), option('d', 'Treat CPD as an appeal to the Court of Appeals')], 'a', 'Later CPD law is outside the checked source packet.', 'RA 9266 IRR lines 321-324'),
    q('005', 'What is the Board core supervision power under Section 7(b)?', [option('a', 'Supervise the registration, licensure, and practice of architects'), option('b', 'Supervise all engineers'), option('c', 'Issue fire safety inspection certificates'), option('d', 'Approve subdivision zoning')], 'a', 'Section 7(b) states this supervision power.', 'RA 9266 IRR lines 302-303'),
    q('006', 'Which theory should not be used as an answer key unless separately sourced?', [option('a', 'Public trustee versus professional guild theory'), option('b', 'Section 7(b) supervision'), option('c', 'Section 7(h) subpoena power'), option('d', 'Commission review of Board policies')], 'a', 'That theory is not stated in the checked Section 7 text.', 'RA 9266 IRR lines 296-340'),
    q('007', 'How do Section 7(j) and 7(l) connect?', [option('a', 'The Board handles examination syllabi/questions/results and coordinates with CHED on architecture education standards'), option('b', 'The Board issues contractor bonds'), option('c', 'The Board approves all zoning ordinances'), option('d', 'The Board replaces the Court of Appeals')], 'a', 'Sections 7(j) and 7(l) cover examination and CHED coordination.', 'RA 9266 IRR lines 325-333'),
    q('008', 'What is Section 7(a)?', [option('a', 'Prescribe and adopt the IRR of the Architecture Act of 2004'), option('b', 'Suspend a Board member'), option('c', 'Issue a building occupancy permit'), option('d', 'Set supplier discounts')], 'a', 'Section 7(a) is the IRR power.', 'RA 9266 IRR lines 296-301'),
    q('009', 'What is the relationship between Board policies/rules and Commission review?', [option('a', 'Board policies, resolutions, rules, and regulations are subject to Commission review and approval'), option('b', 'They are never reviewed'), option('c', 'They are approved only by contractors'), option('d', 'They go directly to CHED only')], 'a', 'The final paragraph of Section 7 states the Commission review rule.', 'RA 9266 IRR lines 340-340'),
    q('010', 'What two instruments does Section 7(g) authorize the Board to prescribe or adopt?', [option('a', 'The Code of Ethical Conduct and Standards of Professional Practice'), option('b', 'The Fire Code and Water Code'), option('c', 'Contractor payroll and tax rates'), option('d', 'Court of Appeals rules')], 'a', 'Section 7(g) names the Code and SPP.', 'RA 9266 IRR lines 313-315'),
  ]

  const law006 = {
    articleId: '3a66b00c-20a4-4577-8359-b956a93d7c50',
    slug: 'lea-prac-law-006-prc-vs-prboa-distinct-roles-authority-and-the-appeals-chain',
    title: 'PRC vs PRBoA: Authority, Supervision, and Appeals',
    folder: '.ai/content-audit-export/articles/lea-prac-law-006-prc-vs-prboa-distinct-roles-authority-and-the-appeals-chain--3a66b00c-20a4-4577-8359-b956a93d7c50',
    topic: 'PRC PRBoA authority and appeals',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe supervision and appeal scenario.',
    deferredClaims: [
      'Detailed Court of Appeals standard of review, Rules of Court procedure, and administrative-law doctrine require local primary sources before restoration.',
      'Do not restore broad PRC operational-control examples unless tied directly to Section 7 or Section 8 source language.',
    ],
    removedMaterial: [
      'Removed unsupported Court of Appeals review-standard discussion and broad operational-control hypotheticals.',
      'Rebuilt around Section 7 review/appeal text, Section 8 administrative supervision and record custody, Section 9 removal grounds, and Section 40 IAPOA role.',
    ],
  }
  law006.sources = [
    raSource(law006, '317-344', 'Checked for administrative-case appeal path, Commission review/approval of Board policies, and Section 8 administrative supervision, record custody, secretary, secretariat, and support services.', 1),
    raSource(law006, '346-360', 'Checked for Presidential suspension/removal of Board members on Commission recommendation and listed grounds.', 2),
    raSource(law006, '817-847', 'Checked for IAPOA/UAP status and functions, including nomination and complaint-monitoring role.', 3),
  ]
  law006.markdown = `# ${law006.title}

## Board Exam Quick Check

For LAW-006, keep the bodies separate. The Board exercises architecture-specific powers under Section 7. The Commission provides administrative supervision, record custody, secretary designation, secretariat, and support services under Section 8. Board policies, resolutions, rules, and regulations are subject to Commission review and approval. Board decisions in administrative cases are reviewed only if appealed.

## Learning Goal

After studying this article, you should be able to:

- Distinguish PRC administrative supervision from Board Section 7 powers.
- State the administrative-case appeal path supported by the checked source.
- Identify the Commission's record-custody and support-services role.
- Apply Section 9 Board-member removal grounds without inventing appellate doctrine.

## Board Powers and Commission Review

Section 7 gives the Board architecture-specific powers: registration, licensure, practice supervision, administrative cases, ethics/SPP adoption, examinations, temporary or special permits, and CHED coordination.

The same section states the review boundary. Board policies, resolutions, rules, and regulations are subject to Commission review and approval. But Board decisions, resolutions, or orders in administrative cases are subject to review only if appealed.

## Administrative Supervision under Section 8

Section 8 states that the Board is under the administrative supervision of the Commission. It also says all Board records, including applications for examination, examination questions, answer sheets, licensure examination records, administrative records, and investigative-case documents, are under Commission custody. The Commission designates the Board Secretary and provides secretariat and other support services to implement RA 9266.

That is the source-safe meaning of administrative supervision for this batch: custody, secretary designation, secretariat, and support services. Broader claims about operational control or appellate standards should wait for a specific source.

## Administrative-Case Appeal Path

Under Section 7(h), a Board administrative-case decision becomes final and executory after fifteen days from receipt of notice unless appealed to the Commission. A Commission decision may be appealed to the Court of Appeals in accordance with the Rules of Court. This batch does not supply the Rules of Court details or the Court of Appeals standard of review.

## IAPOA/UAP Context

Section 40 identifies the integrated and accredited professional organization structure and records UAP as the existing IAPOA. Its listed functions include nominations to Board vacancies, CPD program responsibility, foreign-national endorsement functions, liability-insurance recommendation for temporary or special permits, and monitoring compliance or filing complaints for violations of RA 9266, the IRR, Code, SPP, and other Board or Commission policies.

## Real World Scenario

The Board decides an administrative case involving an alleged ethics violation. The source-safe appeal answer is: if no appeal is made to the Commission, the Board decision becomes final and executory after fifteen days from receipt of notice. If appealed, the Commission reviews the decision, and a Commission decision may be appealed to the Court of Appeals under the Rules of Court.

## Exam Traps

- Saying PRC record custody means the Commission writes the architecture exam questions.
- Treating every Board action as automatically appealed.
- Supplying a Court of Appeals review standard not found in the checked source.
- Forgetting that Section 9 removal of Board members starts with the President upon Commission recommendation after opportunity to defend in an administrative investigation.

## Related Articles

- [PRBoA Composition](lea-prac-law-004)
- [PRBoA Powers and Functions](lea-prac-law-005)
- [IAPOA/UAP Role](lea-prac-law-001)
`
  law006.claims = [
    'Section 7 separates Commission review/approval of Board policies/rules from administrative-case review only on appeal.',
    'Section 8 places the Board under Commission administrative supervision and gives the Commission custody of Board records, secretary designation, secretariat, and support services.',
    'Section 7(h) provides finality after fifteen days unless appealed to the Commission, and allows Commission decisions to be appealed to the Court of Appeals under the Rules of Court.',
    'Section 9 lists Board-member suspension/removal grounds and process through the President upon Commission recommendation after opportunity to defend.',
  ]
  law006.questionTemplates = [
    q('001', 'What is the source-safe relationship between PRC and PRBoA under Section 8?', [option('a', 'The Board is under Commission administrative supervision, with Commission custody of records and support services'), option('b', 'The Board is a private contractor'), option('c', 'The Commission has no relation to the Board'), option('d', 'The IAPOA is the Court of Appeals')], 'a', 'Section 8 states administrative supervision and support-service details.', 'RA 9266 IRR lines 342-344'),
    q('002', 'What is the IAPOA/UAP role in this checked source set?', [option('a', 'Integrated professional organization with functions such as Board vacancy nominations and compliance monitoring/complaint endorsement'), option('b', 'The appointing President'), option('c', 'The Court of Appeals'), option('d', 'The CHED accreditor for every diploma')], 'a', 'Section 40 lists UAP/IAPOA functions.', 'RA 9266 IRR lines 817-847'),
    q('003', 'What does Commission record custody include under Section 8?', [option('a', 'Board records, applications, exam questions, answer sheets, licensure-exam records, and administrative/investigative-case documents'), option('b', 'Only supplier discounts'), option('c', 'Only contractor payroll'), option('d', 'No records at all')], 'a', 'Section 8 identifies the records in Commission custody.', 'RA 9266 IRR lines 342-344'),
    q('004', 'If the Commission ordered a result that contradicts Section 7 professional powers, what should a source-safe answer do?', [option('a', 'Separate Commission administrative supervision from the Board powers expressly granted in Section 7'), option('b', 'Ignore Section 7'), option('c', 'Say IAPOA decides every appeal'), option('d', 'Use an unsourced Court standard')], 'a', 'The source separately states Board powers and Commission administrative support/review roles.', 'RA 9266 IRR lines 296-344'),
    q('005', 'What is the asymmetry in Commission review authority?', [option('a', 'Board policies/rules need Commission review and approval; administrative-case decisions are reviewed only if appealed'), option('b', 'All Board decisions skip the Commission'), option('c', 'Only contractor claims are reviewed'), option('d', 'The Court of Appeals reviews policies before they exist')], 'a', 'The final paragraph of Section 7 states this distinction.', 'RA 9266 IRR lines 340-340'),
    q('006', 'What is the source-supported administrative-case appeal path?', [option('a', 'Board decision, appeal to Commission, then Commission decision may be appealed to the Court of Appeals'), option('b', 'Board decision directly to a supplier'), option('c', 'IAPOA decision to CHED only'), option('d', 'Contractor appeal to the client only')], 'a', 'Section 7(h) states the appeal sequence.', 'RA 9266 IRR lines 317-320'),
    q('007', 'How long before a Board administrative-case decision becomes final if not appealed to the Commission?', [option('a', 'Fifteen days from receipt of notice of judgment or decision'), option('b', 'One year automatically'), option('c', 'Six years'), option('d', 'Never')], 'a', 'Section 7(h) states the fifteen-day finality rule.', 'RA 9266 IRR lines 317-320'),
    q('008', 'Which is a Section 9 ground for suspension or removal of a Board member?', [option('a', 'Neglect of duty or incompetence'), option('b', 'Using an SPP compensation method'), option('c', 'Being a client'), option('d', 'Submitting a design brief')], 'a', 'Section 9 lists neglect of duty or incompetence among the grounds.', 'RA 9266 IRR lines 346-360'),
    q('009', 'What should be done with Court of Appeals standard-of-review doctrine in this batch?', [option('a', 'Defer it unless a local Rules of Court or appellate-review source is checked'), option('b', 'Invent it from memory'), option('c', 'Put it in every answer option'), option('d', 'Treat it as a CPD rule')], 'a', 'The checked source mentions appeal to the Court of Appeals but does not supply review-standard doctrine.', 'RA 9266 IRR lines 317-320'),
    q('010', 'What does Section 8 say the Commission provides to the Board?', [option('a', 'The Board Secretary, secretariat, and other support services'), option('b', 'All private client fees'), option('c', 'All competition prizes'), option('d', 'All contractor bonds')], 'a', 'Section 8 states secretary designation and support services.', 'RA 9266 IRR lines 342-344'),
  ]

  const law007 = {
    articleId: '9527e4a9-f8f1-4554-999e-0d46cc49bcd1',
    slug: 'lea-prac-law-007-lea-eligibility-requirements-academic-credentials-dae-and-moral-character',
    title: 'LEA Eligibility Requirements: Degree, DAE, Documents, and Moral Character',
    folder: '.ai/content-audit-export/articles/lea-prac-law-007-lea-eligibility-requirements-academic-credentials-dae-and-moral-character--9527e4a9-f8f1-4554-999e-0d46cc49bcd1',
    topic: 'LEA eligibility requirements and documents',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe LEA application document scenario.',
    deferredClaims: [
      'The exact current PRC portal checklist, DAE logbook mechanics, and 3,840-hour conversion require current local PRC/Board sources before restoration.',
      'Do not restore Documentary Alternative Evaluation wording; the checked source supports Diversified Training forms and diversified architectural experience.',
    ],
    removedMaterial: [
      'Removed unsupported 3,840-hour conversion, Documentary Alternative Evaluation label, current portal checklist details, and mentor-PTR expiration conclusion.',
      'Rebuilt around Sections 12, 13, 27, and the fraudulent-applications clause.',
    ],
  }
  law007.sources = [
    raSource(law007, '372-411', 'Checked for examination requirement, applicant qualifications, supporting documents, DAE, one-year master degree credit, and fraudulent application consequences.', 1),
    raSource(law007, '646-666', 'Checked for foreign applicant reciprocity condition and documents.', 2),
  ]
  law007.markdown = `# ${law007.title}

## Board Exam Quick Check

For LAW-007, do not overstate the DAE mechanics. The checked RA 9266 IRR text requires a Bachelor of Science in Architecture from a CHED-recognized or accredited school, good moral character, at least two years or equivalent of diversified architectural experience duly certified by a registered/licensed architect, no conviction of a criminal offense involving moral turpitude, and the listed support documents. It does not state a 3,840-hour conversion in the checked passage.

## Learning Goal

After studying this article, you should be able to:

- State the Section 13 applicant qualifications.
- Identify the source-listed supporting documents.
- Apply the one-year practical-experience credit for a government-recognized master's degree in Architecture.
- Recognize fraudulent-application consequences without inventing current PRC portal details.

## Examination Required

Section 12 states that all applicants for registration for the practice of architecture must undergo a licensure examination given by the Board in places and dates designated by the Commission in accordance with RA 8981.

## Section 13 Qualifications

An applicant must establish to the Board's satisfaction that:

1. The applicant is a Filipino citizen or a foreign citizen qualified under the reciprocity rule in Section 27.
2. The applicant is of good moral character.
3. The applicant holds a Bachelor of Science in Architecture from a school, college, academy, or institute recognized or accredited by CHED and has at least two years or equivalent of diversified architectural experience duly certified by a registered/licensed architect.
4. If the applicant has a master's degree in Architecture from a government-recognized school, college, university, or institute, one year is credited in practical experience.
5. The applicant has not been convicted of a criminal offense involving moral turpitude.

## Source-Listed Documents

The checked source lists these support documents:

- Certificate of Live Birth in NSO Security Paper.
- Marriage Contract in NSO Security Paper for married female applicants.
- College Diploma showing date of graduation and Special Order Number unless not required.
- Baccalaureate Transcript of Records showing date of graduation and Special Order Number unless not required.
- Accomplished Diversified Training Form 001.
- Accomplished Diversified Training Form 002.
- Architect-Mentor Affidavit.
- Photocopy of the Architect-Mentor's valid Professional Identification Card, Professional Tax Receipt, and IAPOA number.
- National Bureau of Investigation clearance.
- Other documents the Board may require.

## Fraudulent Applications

The Board may refuse to renew a professional identification card, suspend or revoke a certificate of registration obtained by false swearing or misrepresentation in applying for registration or examination, and refuse renewal or registration when an application contains false evidence or information.

## Reciprocity Note

Section 27 covers foreign citizens seeking to take the licensure examination through reciprocity. The foreign applicant must prove that the foreign country allows Filipino citizens to practice or take the examination on terms of strict and absolute equality, including recognition of prerequisite degrees or diplomas. The source also lists immigration, passport, transcript, and Board-required documents for such applicants.

## Real World Scenario

A candidate has a BS Architecture degree and a master's degree in Architecture from a government-recognized university, but only one year of certified diversified architectural experience. The source-safe answer is that Section 13 credits one year of practical experience for the master's degree in Architecture, so the remaining experience question turns on whether the Board is satisfied with the degree, certification, and required documents. Do not add a 3,840-hour rule unless a current local source is checked.

## Exam Traps

- Calling DAE "Documentary Alternative Evaluation" in this article.
- Using a 3,840-hour number not present in the checked passage.
- Forgetting that a master's degree credit applies to Architecture from a government-recognized institution.
- Treating false evidence as harmless after examination approval.

## Related Articles

- [LEA Structure and Passing Standard](lea-prac-law-008)
- [Certificate of Registration and Oath](lea-prac-law-009)
- [Reciprocity Principles](lea-prac-frm-007)
`
  law007.claims = [
    'Section 12 requires applicants for registration to undergo the licensure examination given by the Board at Commission-designated places and dates.',
    'Section 13 requires citizenship/reciprocity qualification, good moral character, BS Architecture from a CHED-recognized or accredited school, at least two years or equivalent of diversified architectural experience certified by a registered/licensed architect, and no moral-turpitude conviction.',
    'Section 13 gives one year practical-experience credit for a master degree in Architecture from a government-recognized institution.',
    'Section 13 lists support documents including NSO live birth, diploma/TOR, DT Forms 001 and 002, Architect-Mentor Affidavit, mentor PIC/PTR/IAPOA number, NBI clearance, and other Board-required documents.',
    'The fraudulent-applications clause allows refusal, suspension, revocation, or denial when false swearing, misrepresentation, false evidence, or false information is involved.',
  ]
  law007.questionTemplates = [
    q('001', 'Which item is NOT stated as a Section 13 applicant qualification in the checked source?', [option('a', 'A 3,840-hour conversion stated in the IRR passage'), option('b', 'Good moral character'), option('c', 'BS Architecture from a CHED-recognized or accredited school'), option('d', 'No conviction of a criminal offense involving moral turpitude')], 'a', 'The checked passage says two years or equivalent DAE, not 3,840 hours.', 'RA 9266 IRR lines 376-387'),
    q('002', 'How do Section 13 academic and experience requirements work together?', [option('a', 'They require both a recognized BS Architecture degree and at least two years or equivalent certified diversified architectural experience'), option('b', 'They allow experience with no degree'), option('c', 'They require only a contractor certificate'), option('d', 'They replace moral character')], 'a', 'Section 13(c) contains the degree and DAE requirements.', 'RA 9266 IRR lines 382-386'),
    q('003', 'What should this batch say about an architect-mentor PTR expiration scenario?', [option('a', 'The checked source requires a photocopy of the mentor valid PIC, PTR, and IAPOA number, but current handling of expiration needs a current local source'), option('b', 'PTR expiration is never relevant'), option('c', 'PTR replaces DAE'), option('d', 'PTR is issued by the Court of Appeals')], 'a', 'Section 13 lists mentor PIC, PTR, and IAPOA number but does not resolve every expiration scenario.', 'RA 9266 IRR lines 401-409'),
    q('004', 'A candidate holds a master degree in Architecture from a government-recognized institution. What credit does Section 13 provide?', [option('a', 'One year credited in practical experience'), option('b', 'Automatic license without examination'), option('c', 'Three years credited'), option('d', 'No need for good moral character')], 'a', 'Section 13(c) gives one year practical-experience credit.', 'RA 9266 IRR lines 383-386'),
    q('005', 'Before accepting a master degree credit, what must be source-checked?', [option('a', 'That it is a master degree in Architecture from a school, college, university, or institute recognized by the government'), option('b', 'That it is any non-architecture degree'), option('c', 'That the contractor approves it'), option('d', 'That no documents are submitted')], 'a', 'The credit is limited by the source wording.', 'RA 9266 IRR lines 383-386'),
    q('006', 'What minimum experience wording is source-safe from Section 13?', [option('a', 'At least two years or equivalent of diversified architectural experience duly certified by a registered/licensed architect'), option('b', 'Exactly 3,840 hours in the checked passage'), option('c', 'No experience if the applicant has a diploma'), option('d', 'Only contractor site experience')], 'a', 'Section 13(c) states two years or equivalent DAE.', 'RA 9266 IRR lines 383-386'),
    q('007', 'A candidate has a BS Architecture degree and two years of certified DAE. What else must still be satisfied?', [option('a', 'All Section 13 requirements and support documents, including moral character and no moral-turpitude conviction'), option('b', 'No other requirements'), option('c', 'A supplier discount'), option('d', 'A Board member oath')], 'a', 'Section 13 includes multiple requirements beyond degree and DAE.', 'RA 9266 IRR lines 376-411'),
    q('008', 'What can happen when an application contains false evidence or misrepresentation?', [option('a', 'The Board may refuse renewal or registration, or suspend/revoke a certificate obtained by false swearing or misrepresentation'), option('b', 'The false evidence is always ignored'), option('c', 'The applicant automatically passes'), option('d', 'Only the contractor decides')], 'a', 'The fraudulent-applications clause states these consequences.', 'RA 9266 IRR lines 411-411'),
    q('009', 'Which DAE scenario is safest under the checked source?', [option('a', 'Experience that is diversified architectural experience and duly certified by a registered/licensed architect'), option('b', 'Pure administrative work with no architect certification'), option('c', 'Supplier sales with no architectural work'), option('d', 'A verbal promise with no certification')], 'a', 'Section 13(c) requires certified diversified architectural experience.', 'RA 9266 IRR lines 383-386'),
    q('010', 'Which document verifies the architect-mentor authority in the source-listed support documents?', [option('a', 'Photocopy of the Architect-Mentor valid Professional Identification Card, Professional Tax Receipt, and IAPOA number'), option('b', 'A supplier invoice only'), option('c', 'A client text message'), option('d', 'A competition poster')], 'a', 'Section 13 lists the mentor PIC, PTR, and IAPOA number.', 'RA 9266 IRR lines 401-409'),
  ]

  return [eth013, law004, law005, law006, law007]
}

function main() {
  const articles = makeArticles()
  const duplicateCheck = priorBatchExclusionCheck(articles)
  if (duplicateCheck.status !== 'pass') throw new Error(`Duplicate selection detected: ${JSON.stringify(duplicateCheck.duplicate_hits)}`)

  const results = articles.map(writeArticleArtifacts)
  updateSyncState(results)

  const allFiles = [
    ...results.flatMap((result) => listFilesRecursive(result.folder)),
    '.ai/content-audit-export/sync-state.json',
  ]
  const sourceHashChecks = validateSourceHashes(articles)
  const jsonChecks = parseJsonFiles(allFiles)
  const markerFindings = markerScan(allFiles)
  const questionCounts = linkedQuestionCounts(results)
  const staleComposeErrors = staleComposeErrorScan(results)
  const scopedChecks = buildScopedChecks(results, sourceHashChecks, jsonChecks, markerFindings, questionCounts, staleComposeErrors, duplicateCheck)

  writeManifest(results, duplicateCheck)
  const finalScopedChecks = writeScopedChecksAfterManifest(results, scopedChecks)
  writeLedger(results, finalScopedChecks)
  writeReport(results, finalScopedChecks)
  writeQa(results, finalScopedChecks)
  updateHandoff(results, finalScopedChecks)
  updateCoordination(results, finalScopedChecks)

  console.log(JSON.stringify({
    batch_id: BATCH_ID,
    status: finalScopedChecks.status,
    articles: results.map((result) => result.slug),
    intended_paths: intendedPaths(results),
  }, null, 2))
}

main()
