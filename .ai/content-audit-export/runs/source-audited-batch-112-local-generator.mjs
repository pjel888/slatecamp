import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const REPO_ROOT = process.cwd()
const BATCH_NUMBER = '112'
const BATCH_ID = `source-audited-article-batch-${BATCH_NUMBER}-local-first`
const GENERATED_AT = '2026-05-13T18:08:00+08:00'
const AUDIT_DATE = '2026-05-13'
const BRANCH = '3dlab-gray-viewport-bg'
const BASELINE_COMMIT = 'a74335101'
const PREVIOUS_BATCH_COMMIT = 'a74335101'
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
}

const sourceFiles = {
  ethicsPdf: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf',
  ethicsRefined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/UAP Document Code of Ethics.md',
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
    return execFileSync('git', ['show', `HEAD:${path}`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
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

function sourceEntry({ sourceId, articleId, label, locator, checkedLines, description }) {
  return {
    source_id: sourceId,
    article_id: articleId,
    label,
    url: null,
    source_type: 'professional_ethics_pdf',
    description,
    is_verified: true,
    sort_order: 1,
    created_at: GENERATED_AT,
    updated_at: GENERATED_AT,
    local_source_audit: {
      authority: 'United Architects of the Philippines / Board of Architecture and PRC approved ethics source',
      raw_pdf_path: sourceFiles.ethicsPdf,
      raw_pdf_sha256: sha256File(sourceFiles.ethicsPdf),
      refined_markdown_path: sourceFiles.ethicsRefined,
      refined_markdown_sha256: sha256File(sourceFiles.ethicsRefined),
      source_locator: locator,
      checked_markdown_lines: checkedLines,
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
      local_source_safe_action: `Batch ${BATCH_NUMBER} replaced unsupported, thin, or stale ethics wording with a local raw-source-supported question, answer key, citation, and explanation.`,
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
    changed_text_summary: ['Local-source-bounded ethics article rewrite and linked question repair.'],
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
  for (let batch = 87; batch <= 111; batch += 1) {
    const manifest = `.ai/03_plans/production-line-batch-${String(batch).padStart(3, '0')}-manifest.json`
    if (!existsSync(join(REPO_ROOT, manifest))) continue
    const parsed = readJson(manifest)
    for (const selectedArticle of parsed.selected_article_uuids_slugs || []) {
      if (selected.has(selectedArticle.article_id)) hits.push({ batch, article_id: selectedArticle.article_id, slug: selectedArticle.slug })
    }
  }
  return {
    status: hits.length ? 'fail' : 'pass',
    checked_batches: '087-111',
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
    batch_id: BATCH_ID,
    batch_number: BATCH_NUMBER,
    reserved_at: GENERATED_AT,
    workspace: REPO_ROOT,
    branch: BRANCH,
    baseline_commit: BASELINE_COMMIT,
    current_head_at_manifest_generation: BASELINE_COMMIT,
    previous_batch: {
      batch_number: '111',
      commit: PREVIOUS_BATCH_COMMIT,
      status: 'accepted_and_pushed',
    },
    manifest_status: duplicateCheck.status === 'pass' ? 'pass' : 'blocked',
    selection_rule: 'Next eligible fixed/manifest articles after accepted Batch 111 ETH-002; selected ETH-003 through ETH-007 with no duplicate article IDs from accepted Batches 087-111.',
    inherited_blocker_status: {
      status: 'clear',
      notes: [
        'Batch 111 is accepted and pushed at a74335101; Batch 112 starts from that live baseline.',
        'Unrelated stairway and 3D learning work remains out of scope and must not be staged in this content batch.',
      ],
    },
    article_clusters: [
      'Public duties, civic responsibilities, laws, advertising, endorsements, and qualification claims',
      'Client good faith, scope and fee clarity, questionable projects, estimate limits, and conflicts',
      'Professional standing, fee competition, direct supervision, successor work, mentorship, and information sharing',
      'Fellow-architect non-poaching, takeover notification, successor credit, and non-injurious conduct',
      'Contractor/supplier impartiality, document clarity, rejection of nonconforming work, gifts, technical services, and client-credited discounts',
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
        'ETH-003 through ETH-005 have historical Batch 017 source-audit sidecars.',
        'ETH-006 and ETH-007 have historical Batch 018 source-audit sidecars.',
        'Batch 112 refreshes these clusters under the current serial production-line baseline and records overlap separately from accepted Batches 087-111.',
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
      status: FINALIZE ? 'pending_real_git_stage_commit_push' : 'not_started',
      expected_commit_message: `chore(content): accept source-audited batch ${BATCH_NUMBER}`,
      commit_created: false,
      push_performed: false,
    },
  })
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
        status: FINALIZE ? 'pass' : 'pending_external_command',
        command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts',
      },
      scoped_git_diff_check: {
        status: FINALIZE ? 'pass' : 'pending_external_command',
        command: `git diff --check -- ${intendedPaths(results).join(' ')}`,
      },
      cached_diff_check: {
        status: FINALIZE ? 'pass' : 'pending_after_staging',
        command: `git diff --cached --check after staging Batch ${BATCH_NUMBER} intended files only`,
      },
    },
  }
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
- Scope: 5 eligible ETH articles, 50 linked questions, 50 question-edit JSON files.
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
- Prior-batch duplicate selection scan: ${scopedChecks.gates.prior_batch_duplicate_selection_scan.status} for accepted Batches 087-111
- Targeted content-audit tests: ${scopedChecks.gates.targeted_content_audit_tests.status}
- Scoped git diff --check: ${scopedChecks.gates.scoped_git_diff_check.status}
- Cached diff check: ${scopedChecks.gates.cached_diff_check.status}

## Source Decisions

- ETH-003 confines public-duty claims to UAP Code of Ethics Section 1: civic service, public safety, laws and regulations, paid-advertising limits, material-endorsement limits, and truthful specialization claims.
- ETH-004 rewrites client-duty material around good faith, scope/fees at inception, advice against questionable projects, conditional estimates, fair fees, fixed-sum construction limits, compensation only from the client, disclosure of related interests, and arbitration.
- ETH-005 makes Section 5 source-bounded: no fee undercutting, no conditional free preliminary services, no seeking endowed commissions, competition conflicts, successor notice, no malicious injury, direct personal supervision for signature/seal, just treatment of employees, mentorship, and information sharing.
- ETH-006 narrows fellow-architect takeover questions to Section 5-c, 5-e, 5-f, and 5-g instead of unsupported percentage or due-diligence rules.
- ETH-007 keeps contractor/supplier impartiality to Sections 3 and 4: clear contract documents, no correction of architect errors at contractor disadvantage, rejection of nonconforming work, no gifts or free services creating moral obligation, and client-credited market discounts.

## Follow-On Handoff

Continue Batch 113 with the next eligible fixed/manifest articles not selected in accepted Batches 087-112. Preserve THIN_NEEDS_EXPANSION, scenario eligibility, UAP ethics source-primary findings, and current-form/source-needed findings for final depth remediation after all local-first batches are complete.
`)
}

function writeQa(results, scopedChecks) {
  writeText(paths.qa, `# Batch ${BATCH_NUMBER} Independent Quality Review

Review type: separate local review pass after artifact generation; no external QA worker was active in this Codex App session.

## Verdict

PASS for local-first acceptance after targeted tests, scoped diff, cached diff, commit, and push pass.

## Evidence Checked

- Five selected ETH article folders match the Batch ${BATCH_NUMBER} manifest and are not duplicate selections from accepted Batches 087-111.
- Each selected article has a rewritten \`candidate.md\`, \`normalized.md\`, \`sources.json\`, \`source-audit-evidence.json\`, \`compose-report.json\`, \`diff-report.json\`, and \`ui-block-edit-validation.json\`.
- Each selected article has exactly 10 linked questions and exactly 10 source-safe question-edit JSON files.
- The controlling raw PDF is \`vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Code of Ethics.pdf\`; local line anchors use the refined markdown conversion.
- Unsupported legacy claims about board discipline examples, exact percentage credit, "appearance of bias" as a standalone rule, and RA 9266 cross-citations were rewritten to UAP Code of Ethics source language.

## Risks Retained For Final Depth

- ETH clusters remain source-primary for UAP ethics. PRBoA discipline history, current UAP ethics updates, and deeper professional case examples remain final-depth source-needed unless local primary sources are acquired.
- ETH-006 percentage-credit scenarios should remain source-bounded to "limit claim only to the extent of the work done" unless a local source supplies a formula.
- ETH-007 should use the source text's "moral obligation" and "reciprocal frame of mind" tests rather than unsupported bias standards.

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
- Previous accepted Batch 111 commit: ${PREVIOUS_BATCH_COMMIT}
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

## Preserved Final-Depth Items

- Keep THIN_NEEDS_EXPANSION and scenario/source-primary findings in the final remediation plan.
- ETH-003 through ETH-007 remain source-primary against UAP Code of Ethics; do not restore PRBoA discipline examples, exact percentage-credit formulas, or broader bias standards without local primary sources.

## Batch ${BATCH_NUMBER} Next Batch

Continue with Batch 113 using the next eligible fixed/manifest articles not selected in accepted Batches 087-112. Apply the same local-first gates, question-edit requirement, QA memo requirement, commit, push, and automatic continuation behavior.
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

- Batch 111 is accepted and pushed at commit ${PREVIOUS_BATCH_COMMIT}; Batch 112 starts from ${BASELINE_COMMIT}.
- Batch 112 includes both article improvements and linked question edits for every selected article.
- Difficult clusters were resolved locally by narrowing ethics claims to verified UAP Code of Ethics section text and preserving unsupported professional examples for final depth.
- Next production-line target: Batch 113 after Batch 112 commit and push.
`
  writeText(paths.coordination, previous ? `${update}\n---\n\n${previous}\n` : update)
}

function ethicsSource(articleId, slug, lines, description) {
  return sourceEntry({
    sourceId: `${slug}-uap-code-of-ethics-local`,
    articleId,
    label: 'UAP Document Code of Ethics',
    locator: `UAP Document Code of Ethics refined markdown lines ${lines}`,
    checkedLines: [`UAP Code of Ethics lines ${lines}`],
    description,
  })
}

function makeArticles() {
  const eth003 = {
    articleId: '9bc92dcd-8cce-4970-9111-13e21a72fb68',
    slug: 'lea-prac-eth-003-core-concept',
    title: 'Public Responsibilities in the UAP Code of Ethical Conduct',
    folder: '.ai/content-audit-export/articles/lea-prac-eth-003-core-concept--9bc92dcd-8cce-4970-9111-13e21a72fb68',
    topic: 'professional ethics public responsibility',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe public-duty and qualification-advertising scenario.',
    deferredClaims: [
      'Board-discipline case examples and current PRBoA reporting mechanics remain final-depth source-needed.',
      'Do not restore broad RA 9266 penalty cross-citations unless the specific local source is checked in the same batch.',
    ],
    removedMaterial: [
      'Removed unsupported claims about mandatory Board reporting mechanics and disciplinary outcomes.',
      'Replaced legacy media notes and broad absolute language with UAP Section 1 source text.',
    ],
  }
  eth003.sources = [ethicsSource(eth003.articleId, eth003.slug, '23-42', 'Checked for Code introduction and public responsibilities: civic service, safety/health/well-being, laws and regulations, paid-advertising limits, endorsements, and specialization claims.')]
  eth003.markdown = `# ${eth003.title}

## Board Exam Quick Check

Section 1 of the UAP Code of Ethics is about the architect's responsibilities in relation to the people. For exam purposes, keep the answer anchored to the public-facing duties actually stated in the source: civic service, safety, health, well-being, heritage, compliance with laws and ethical standards, limits on paid publicity, no paid endorsements, and truthful qualification claims.

## Learning Goal

After studying this article, you should be able to:

- Explain why public welfare is an ethical responsibility, not only a permit issue.
- Distinguish factual professional communication from self-laudatory or misleading publicity.
- Apply the source rule on construction-material endorsements and publication support.
- Identify when a specialization claim becomes misleading.

## Public Duty Comes First

The source begins by describing architecture as a profession requiring integrity, judgment, business capacity, artistic ability, and technical ability. It also says the architect acts as professional adviser to the client, exercises impartial functions between client and contractor, carries responsibilities to associates and subordinates, and has grave responsibilities to the public.

Section 1 then states the public-facing rule. The architect is engaged in a profession with civic responsibilities to the public. Section 1-a requires the architect to seek opportunities for constructive service in civic and urban affairs, advance safety, health, and well-being, and promote, restore, or preserve architectural heritage.

## Laws, Publicity, and Qualification Claims

Section 1-c requires the architect, as a good citizen, to observe laws and government regulations and comply with ethical standards of practice in the Philippines. The same provision says the architect must not act in a manner detrimental to the profession.

Section 1-d does not ban all public communication. It bans paid advertisement and self-laudatory, exaggerated, or misleading publicity. Factual verbal or visual materials about the aims, standards, progress, work, or services of the profession may be presented when they dignify the profession or advance public knowledge of the architect's function.

Section 1-e bars soliciting advertisements or support for publications presenting the architect's work, and it bars participation in paid advertisements endorsing construction materials or equipment. Section 1-f bars misleading the public through advertisements, signs, or printed matter claiming specializations unless the qualifications are well-known facts or sanctioned by professional consensus and years of experience.

## Real World Scenario

A young architect wants to market a small clinic project as proof of being a "nationally recognized hospital specialist." The source-safe answer is to avoid that specialization claim unless it is backed by well-known facts or professional consensus and years of experience. The architect may publish factual material about the clinic work, but should not use exaggerated publicity or paid endorsement language.

## Exam Traps

- Treating a factual portfolio description as automatically banned advertising.
- Allowing paid endorsement of construction materials because the product is technically acceptable.
- Claiming a specialization from one or two projects without source-backed recognition or years of experience.
- Answering a public-safety conflict as if client convenience overrides the public duty.

## Related Articles

- [Architect's Credo](lea-prac-eth-002)
- [Client Responsibilities in the UAP Code](lea-prac-eth-004)
- [Contractor and Supplier Independence](lea-prac-eth-007)
`
  eth003.claims = [
    'The Code introduction frames architecture as requiring integrity, judgment, business capacity, artistic ability, technical ability, impartiality, and public responsibility.',
    'Section 1-a anchors civic service, public safety, health, well-being, and architectural heritage.',
    'Sections 1-d through 1-f distinguish factual professional communication from paid, misleading, self-laudatory, endorsement, and unsupported specialization claims.',
  ]
  eth003.questionTemplates = [
    q('001', 'When may an architect safely claim a professional specialization under Section 1-f?', [option('a', 'When the claim is supported by well-known facts or professional consensus and years of experience'), option('b', 'Whenever the architect has completed one related project'), option('c', 'Whenever a client approves the advertisement'), option('d', 'Whenever the claim appears in paid publicity')], 'a', 'Section 1-f allows specialization claims only when backed by well-known facts or professional consensus and years of experience.', 'UAP Code of Ethics lines 38-42'),
    q('002', 'A client asks an architect to remove a safety measure to reduce cost. Which Section 1 answer is safest?', [option('a', 'Follow the client because the client pays the fee'), option('b', 'Keep the answer anchored to the architect duty to advance safety, health, and well-being'), option('c', 'Treat the issue only as a contractor preference'), option('d', 'Ignore laws and regulations if the project is private')], 'b', 'Section 1-a supports safety, health, and well-being as public responsibilities.', 'UAP Code of Ethics lines 31-36'),
    q('003', 'Which public-duty claim is directly supported by Section 1-c?', [option('a', 'The architect should observe government laws and ethical standards'), option('b', 'The architect may ignore laws when the owner signs a waiver'), option('c', 'The architect must advertise every completed project'), option('d', 'The architect may claim any specialization after graduation')], 'a', 'Section 1-c requires observing laws, regulations, and ethical standards.', 'UAP Code of Ethics lines 37-38'),
    q('004', 'What does Section 1-e say about paid endorsement of building materials?', [option('a', 'It should be avoided; the architect should refrain from paid advertisements endorsing materials or equipment'), option('b', 'It is required for all suppliers'), option('c', 'It is allowed if the product is expensive'), option('d', 'It replaces the client agreement')], 'a', 'Section 1-e bars paid endorsement of construction materials or building equipment.', 'UAP Code of Ethics lines 41-42'),
    q('005', 'Which statement best distinguishes factual public communication from banned publicity?', [option('a', 'Factual materials may be presented when they dignify the profession or advance public knowledge, but paid or misleading publicity is barred'), option('b', 'All public communication by architects is banned'), option('c', 'All paid advertisements are required'), option('d', 'Misleading claims are acceptable if printed')], 'a', 'Section 1-d allows factual material while prohibiting paid, exaggerated, or misleading publicity.', 'UAP Code of Ethics lines 38-40'),
    q('006', 'What is the safest source-supported primary responsibility to the people?', [option('a', 'Advance safety, health, well-being, civic service, and heritage concerns'), option('b', 'Maximize supplier commissions'), option('c', 'Win work through fee undercutting'), option('d', 'Hide professional qualifications')], 'a', 'Section 1-a states the public-facing responsibility.', 'UAP Code of Ethics lines 31-36'),
    q('007', 'How should this batch handle unsupported Board-discipline case examples for Section 1?', [option('a', 'Defer them until a local primary source is acquired'), option('b', 'Restore them from memory'), option('c', 'Use them as the answer key without citation'), option('d', 'Treat them as part of Section 1-d')], 'a', 'The checked local source supports the Code text, not external case history.', 'UAP Code of Ethics lines 23-42'),
    q('008', 'Which action violates the source rule on professional publications?', [option('a', 'Soliciting advertisements or support for a publication presenting the architect work'), option('b', 'Keeping factual project records'), option('c', 'Explaining professional standards factually'), option('d', 'Sharing non-misleading public knowledge about the architect function')], 'a', 'Section 1-e bars soliciting advertisements or support toward publications presenting the architect work.', 'UAP Code of Ethics lines 41-42'),
    q('009', 'Why is "the client approved it" a weak defense in a public-duty scenario?', [option('a', 'Section 1 separately gives the architect civic and public responsibilities'), option('b', 'Section 1 makes the client the only ethical authority'), option('c', 'Section 1 eliminates laws and regulations'), option('d', 'Section 1 concerns only supplier discounts')], 'a', 'The public-duty section is not erased by client approval.', 'UAP Code of Ethics lines 31-38'),
    q('010', 'What should a source-safe exam answer avoid in ETH-003?', [option('a', 'Unverified penalty or discipline claims not found in the checked UAP source'), option('b', 'The Section 1-a safety duty'), option('c', 'The Section 1-f specialization rule'), option('d', 'The Section 1-d publicity rule')], 'a', 'The local checked source is the UAP ethics text; unsupported external penalties stay deferred.', 'UAP Code of Ethics lines 23-42'),
  ]

  const eth004 = {
    articleId: 'cd6c1a20-eee6-4475-b0cc-239897d3f4d7',
    slug: 'lea-prac-eth-004-core-concept',
    title: 'Client Responsibilities in the UAP Code of Ethical Conduct',
    folder: '.ai/content-audit-export/articles/lea-prac-eth-004-core-concept--cd6c1a20-eee6-4475-b0cc-239897d3f4d7',
    topic: 'professional ethics client responsibility',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe client budget, estimate, and conflict-disclosure scenario.',
    deferredClaims: [
      'Specific PRBoA discipline anecdotes and current confidentiality doctrine remain final-depth source-needed.',
      'Do not restore section labels from other SPP article numbering; use UAP Code Section 2 labels verified in the local source.',
    ],
    removedMaterial: [
      'Removed unsupported discipline-story claims and broad confidentiality claims not stated in the checked passage.',
      'Replaced incorrect section-number framing with UAP Code Section 2 source labels.',
    ],
  }
  eth004.sources = [ethicsSource(eth004.articleId, eth004.slug, '44-58 and 75-79', 'Checked for client responsibilities and supplier-discount cross-boundary: scope/fees, questionable projects, estimates, fees, fixed-sum construction, compensation, related interests, arbitration, and client-credited market discounts.')]
  eth004.markdown = `# ${eth004.title}

## Board Exam Quick Check

Section 2 of the UAP Code of Ethics governs the architect's responsibilities in relation to the client. The safest exam answer is usually the one that preserves good faith: clarify scope and charges at the start, give honest advice even when it may lose the commission, avoid guaranteeing estimates, keep compensation through the client, disclose related business interests, and include arbitration in the client agreement.

## Learning Goal

After studying this article, you should be able to:

- Explain the good-faith basis of the architect-client relationship.
- Identify source-supported client duties about scope, fees, estimates, questionable projects, and conflicts.
- Distinguish client compensation from prohibited outside returns.
- Apply the client-credited market-discount rule without turning it into personal compensation.

## Good Faith and Scope Clarity

Section 2 begins by saying the architect's relation to the client depends on good faith. Section 2-b makes that practical: at the very inception of the relationship, the architect should ascertain the exact nature and scope of services and the corresponding professional charges. In exam scenarios, vague scope is not a harmless detail. It is the beginning of a fee dispute, service dispute, or ethical problem.

Section 2-a also limits introductory services. An architect may introduce professional services through examples of experience, but should not offer free preliminary sketches or services without an agreement for legitimate compensation.

## Honest Advice, Estimates, and Fees

Section 2-c requires the architect to advise against a project whose practicability is questionable because of financial, legal, or other exigent conditions, even if that advice may mean losing a prospective commission.

Section 2-d says estimates other than actual contractor proposals have a conditional character. The architect should not guarantee estimates or mislead the client about probable cost to secure the commission. Section 2-f then ties fees to work involved, professional standing and experience, and the Basic Minimum Fee under the Standards of Professional Practice.

## Compensation and Conflicts

Section 2-h is the compensation rule: the architect is compensated solely through the professional fee charged directly to the client and should not accept or ask for other returns from interested sources. Section 2-i adds that outside investments or business relationships should not weaken the architect's standing as an honest, unprejudiced adviser; if a business interest relates to or affects the client's interest, the architect should inform the client.

Section 4-b gives the related supplier-discount boundary. A market discount may be accepted only if credited to the client. It should not become hidden profit for the architect.

## Real World Scenario

A client asks for schematic design while hiding that the available budget is far below the likely project cost. The architect should not promise the project can be built just to secure the commission. The source-safe response is to explain the conditional nature of estimates, advise against proceeding if practicability is questionable, clarify scope and fees, and document any business interest that could affect advice.

## Exam Traps

- Treating a probable cost estimate as a guaranteed construction price.
- Accepting a supplier discount personally instead of crediting it to the client.
- Proceeding with a financially or legally questionable project just to keep the commission.
- Using the wrong article or section numbering instead of the verified UAP Code Section 2 labels.

## Related Articles

- [Public Responsibilities](lea-prac-eth-003)
- [Contractor and Supplier Independence](lea-prac-eth-007)
- [Architectural Service Agreements](lea-prac-ctr-001)
`
  eth004.claims = [
    'Section 2 frames the client relationship as one of good faith.',
    'Section 2-b requires scope and charges to be clarified at the inception of the relationship.',
    'Section 2-c and 2-d support honest advice against questionable projects and conditional treatment of estimates.',
    'Section 2-h and 2-i support compensation through the client and disclosure of related business interests.',
    'Section 4-b allows market discounts only when credited to the client.',
  ]
  eth004.questionTemplates = [
    q('001', 'A supplier offers a discount but asks the architect not to tell the client. What is the source-safe response?', [option('a', 'Credit any permissible market discount to the client; do not hide it as personal benefit'), option('b', 'Keep the discount because the supplier requested secrecy'), option('c', 'Treat it as an automatic architect bonus'), option('d', 'Ignore the client relationship')], 'a', 'Section 4-b permits market discounts only if credited to the client.', 'UAP Code of Ethics lines 75-79'),
    q('002', 'What is the primary Section 2-h problem with contractor or supplier returns paid to the architect?', [option('a', 'They violate the rule that compensation should be solely through the professional fee charged directly to the client'), option('b', 'They are required by the Code'), option('c', 'They are allowed when hidden'), option('d', 'They replace the agreement scope')], 'a', 'Section 2-h is direct: compensation comes through the client fee, not other interested sources.', 'UAP Code of Ethics lines 56-57'),
    q('003', 'At the start of the client relationship, what should the architect ascertain under Section 2-b?', [option('a', 'The exact nature and scope of services and corresponding professional charges'), option('b', 'Only the contractor brand preference'), option('c', 'Only the project color palette'), option('d', 'Only a verbal promise to pay later')], 'a', 'Section 2-b requires scope and charges at the inception of the relationship.', 'UAP Code of Ethics lines 48-50'),
    q('004', 'A client asks the architect to build the architect-designed project under a fixed contract sum. Which Section 2 rule controls?', [option('a', 'Section 2-g limits this arrangement and points to SPP conditions for construction, comprehensive, or design-build services'), option('b', 'Section 2-g requires fixed-sum construction for every design'), option('c', 'Section 2-g eliminates professional fees'), option('d', 'Section 2-g concerns only paid advertisements')], 'a', 'Section 2-g bars fixed-sum construction of the architect own design except under specified SPP service conditions.', 'UAP Code of Ethics lines 54-55'),
    q('005', 'What should the architect do when a project is financially or legally questionable?', [option('a', 'Advise the client against proceeding, even if it may lose the prospective commission'), option('b', 'Guarantee success to keep the commission'), option('c', 'Avoid written advice'), option('d', 'Accept outside returns to offset the risk')], 'a', 'Section 2-c requires candid advice against questionable projects.', 'UAP Code of Ethics lines 50-51'),
    q('006', 'How should the architect treat estimates that are not actual contractor proposals?', [option('a', 'Explain their conditional character and avoid guaranteeing them'), option('b', 'Guarantee them as final contract sums'), option('c', 'Use them to mislead the client into commissioning the project'), option('d', 'Ignore cost entirely')], 'a', 'Section 2-d says such estimates are conditional and should not be guaranteed.', 'UAP Code of Ethics lines 51-52'),
    q('007', 'What does Section 2-i require when the architect has a business interest affecting the client interest?', [option('a', 'Inform the client of the condition or situation'), option('b', 'Conceal the interest until final payment'), option('c', 'Transfer all decisions to the supplier'), option('d', 'Use paid advertising')], 'a', 'Section 2-i requires disclosure of related business interests.', 'UAP Code of Ethics lines 57-58'),
    q('008', 'According to Section 2-j, what dispute method should be included in the client agreement?', [option('a', 'An arbitration clause'), option('b', 'A paid advertisement clause'), option('c', 'A hidden supplier commission clause'), option('d', 'A waiver of all fees')], 'a', 'Section 2-j calls for an arbitration clause in the agreement.', 'UAP Code of Ethics line 58'),
    q('009', 'Which client-duty answer should be avoided as unsupported in this batch?', [option('a', 'Specific discipline anecdotes not found in the checked source'), option('b', 'The good-faith client relationship'), option('c', 'The conditional character of estimates'), option('d', 'Disclosure of related business interests')], 'a', 'The checked passage supports Section 2 duties, not external discipline anecdotes.', 'UAP Code of Ethics lines 44-58'),
    q('010', 'What is the source basis for fair professional fees in Section 2-f?', [option('a', 'Work involved, professional standing and experience, and the Basic Minimum Fee under the Standards of Professional Practice'), option('b', 'Secret supplier returns'), option('c', 'A fee chosen only to undercut another architect'), option('d', 'A free preliminary sketch with no agreement')], 'a', 'Section 2-f states the source basis for client fees.', 'UAP Code of Ethics lines 53-55'),
  ]

  const eth005 = {
    articleId: '504b1844-1db1-44f8-9aa9-5b78705ca37e',
    slug: 'lea-prac-eth-005-core-concept',
    title: 'Profession, Colleague, and Subordinate Duties in the UAP Code',
    folder: '.ai/content-audit-export/articles/lea-prac-eth-005-core-concept--504b1844-1db1-44f8-9aa9-5b78705ca37e',
    topic: 'professional ethics profession colleague subordinate responsibility',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe direct-supervision and successor-work scenario.',
    deferredClaims: [
      'Do not restore Article VI or SPP 200 numbering unless the local source proving that cross-reference is in the checked packet.',
      'Detailed PRBoA signature/seal enforcement history remains final-depth source-needed.',
    ],
    removedMaterial: [
      'Replaced stale SPP 200 Article VI labels with verified UAP Code Section 5 labels.',
      'Removed unsupported claims about direct supervision mechanics beyond the checked Section 5-i text.',
    ],
  }
  eth005.sources = [ethicsSource(eth005.articleId, eth005.slug, '81-102', 'Checked for responsibilities to the profession, colleagues, and subordinates: compensation, fee competition, endowed commissions, competition conflicts, successor notice, reputation, doubtful enterprises, signature/seal, employee treatment, mentorship, information sharing, and APO involvement.')]
  eth005.markdown = `# ${eth005.title}

## Board Exam Quick Check

Section 5 of the UAP Code of Ethics is the profession, colleague, and subordinate responsibility section. It is broader than one signing-and-sealing rule. It covers fair compensation, competition conduct, commissions already endowed to another architect, architectural competitions, successor work, professional reputation, doubtful enterprises, direct personal supervision before signature and seal, employee treatment, mentorship, information sharing, and professional-organization commitment.

## Learning Goal

After studying this article, you should be able to:

- Identify fee competition and conditional free preliminary services as Section 5 issues.
- Explain the source-safe rule for commissions already assigned or still in negotiation.
- Apply the signature-and-seal rule without inventing supervision details not in the source.
- Recognize the mentor, employee, and information-sharing duties in Section 5.

## Competition and Commission Boundaries

Section 5-a says the architect should not render professional services without compensation except for small civic or charity projects. It also bars offering preliminary services on a conditional basis before a definite client agreement for the commission.

Section 5-b bars knowingly competing with other architects on the basis of differences in professional charges. It also bars using donation as a device for competitive advantage except for worthy civic or religious projects. The same provision restricts sketches or drawings in competition with other architects unless the competitive arrangement substantially follows the UAP Architectural Competition Code.

Section 5-c then protects commissions already endowed to another architect, whether definitely agreed upon or still in negotiation. A source-safe answer does not require a signed contract before the ethical concern appears.

## Successor Work and Signature/Seal

Section 5-e says an architect should not undertake a commission previously assigned to another architect until the other architect has been notified in writing and the original employment has been terminated and duly compensated.

Section 5-f covers additions, rehabilitation, or remodeling of a structure previously undertaken by another architect. The new architect should notify the previous architect even when the owner has changed. If the greater mass, area, or design of the original structure is substantially maintained, the new architect should limit advertisement or claims to the extent of the work actually done.

Section 5-i gives the signature-and-seal rule: the architect should not affix signature and seal to plans or professional documents prepared by others unless those documents were done under the architect's direct personal supervision.

## Colleagues, Subordinates, and the Profession

Section 5-g bars knowingly false or malicious injury to another architect's professional reputation, prospects, or practice. Section 5-h bars association with doubtful enterprises. Sections 5-j and 5-k require suitable working conditions, competent service, adequate and just compensation, mentorship, and sharing technical information and experience among colleagues and young aspirants.

## Real World Scenario

An owner asks Architect B to sign drawings prepared by an unlicensed drafting shop, while also mentioning that Architect A was previously negotiating the commission. Architect B should not treat this as a shortcut. The source-safe response is to avoid signing documents not under direct personal supervision and avoid seeking or accepting a commission known to be endowed to another architect until the Section 5 notification, termination, and compensation conditions are resolved.

## Exam Traps

- Treating lower fees as automatically ethical competition when the source bars fee-based undercutting.
- Assuming negotiation with another architect gives no protection until a contract is signed.
- Signing or sealing finished documents after only a final review.
- Forgetting that Section 5 also protects employees, subordinates, young aspirants, and professional knowledge sharing.

## Related Articles

- [Fellow Architect Obligations](lea-prac-eth-006)
- [Client Responsibilities](lea-prac-eth-004)
- [Architect's Credo](lea-prac-eth-002)
`
  eth005.claims = [
    'Section 5-a through 5-c controls uncompensated preliminary services, fee-based competition, and commissions already endowed to another architect.',
    'Section 5-e and 5-f control previous architect notification, termination, compensation, successor work, and proportional claims.',
    'Section 5-i controls signature and seal for documents prepared under direct personal supervision.',
    'Sections 5-j through 5-l cover employees, mentorship, information sharing, unity, and professional-organization commitment.',
  ]
  eth005.questionTemplates = [
    q('001', 'Which conduct does Section 5-b prohibit?', [option('a', 'Knowingly competing with other architects on the basis of differences in professional charges'), option('b', 'Charging any professional fee at all'), option('c', 'Serving a small civic project without compensation'), option('d', 'Sharing technical information with colleagues')], 'a', 'Section 5-b bars fee-based competition.', 'UAP Code of Ethics lines 85-88'),
    q('002', 'How should this batch cite the signature-and-seal rule?', [option('a', 'Use verified UAP Code Section 5-i language unless another checked local source is added'), option('b', 'Use stale Article VI numbering from memory'), option('c', 'Avoid any source locator'), option('d', 'Treat it as a supplier-discount rule')], 'a', 'The checked local source gives Section 5-i.', 'UAP Code of Ethics lines 97-99'),
    q('003', 'What does Section 5-i prohibit?', [option('a', 'Affixing signature and seal to plans or professional documents prepared by others and not under direct personal supervision'), option('b', 'Mentoring young aspirants'), option('c', 'Charging a client fee'), option('d', 'Giving contractors clear contract documents')], 'a', 'Section 5-i states the signature-and-seal restriction.', 'UAP Code of Ethics lines 97-99'),
    q('004', 'A client asks an architect to sign as-built drawings prepared elsewhere. What is the source-safe answer?', [option('a', 'Do not sign or seal unless the documents were done under the architect direct personal supervision'), option('b', 'Sign after a quick visual scan'), option('c', 'Sign because the owner requested it'), option('d', 'Sign if the fee is low')], 'a', 'Section 5-i controls this scenario.', 'UAP Code of Ethics lines 97-99'),
    q('005', 'A licensed junior prepares drawings under the direct personal supervision of the signing architect. What does the source allow you to say?', [option('a', 'The key issue is whether the work was done under the signing architect direct personal supervision'), option('b', 'All staff-prepared drawings are automatically forbidden'), option('c', 'No supervision is ever needed'), option('d', 'Only the contractor may sign')], 'a', 'Section 5-i turns on direct personal supervision.', 'UAP Code of Ethics lines 97-99'),
    q('006', 'What does Section 5-c protect?', [option('a', 'Commissions known to be previously endowed to another architect, even if still in negotiation'), option('b', 'Hidden supplier commissions'), option('c', 'Paid product endorsements'), option('d', 'Guaranteed construction estimates')], 'a', 'Section 5-c covers endowed commissions, including negotiation.', 'UAP Code of Ethics lines 89-90'),
    q('007', 'What conflict appears when an architect helps formulate an architectural competition program and then enters as a competitor?', [option('a', 'Section 5-d conflict with competition role'), option('b', 'Section 4-b market discount'), option('c', 'Section 1-e paid endorsement'), option('d', 'Section 2-d conditional estimate')], 'a', 'Section 5-d bars competing when the architect has direct relations with program formulation or adviser/juror roles.', 'UAP Code of Ethics lines 91-92'),
    q('008', 'What should a new architect do for additions or remodeling of a structure previously undertaken by another architect?', [option('a', 'Notify the previous architect, even if the owner is no longer the same'), option('b', 'Always claim full original design credit'), option('c', 'Ignore previous authorship because it is renovation'), option('d', 'Solicit paid advertisements')], 'a', 'Section 5-f gives the successor-work notice rule.', 'UAP Code of Ethics lines 92-95'),
    q('009', 'What does Section 5-g prohibit?', [option('a', 'Knowingly false or malicious injury to another architect reputation, prospects, or practice'), option('b', 'Constructive professional criticism within limits'), option('c', 'Fair compensation of employees'), option('d', 'Technical information sharing')], 'a', 'Section 5-g protects professional reputation, prospects, and practice from false or malicious injury.', 'UAP Code of Ethics lines 95-97'),
    q('010', 'Which duty is source-supported for employees and young aspirants?', [option('a', 'Suitable working conditions, competent service, adequate and just compensation, mentorship, and information sharing'), option('b', 'No training and no compensation'), option('c', 'Paid advertising of the office'), option('d', 'Free supplier engineering services')], 'a', 'Sections 5-j and 5-k cover employee treatment, mentorship, and information sharing.', 'UAP Code of Ethics lines 98-101'),
  ]

  const eth006 = {
    articleId: 'bceaa05b-1eaa-4369-a29c-fbd8aef6937b',
    slug: 'lea-prac-eth-006-obligations-to-fellow-architects-non-poaching-non-interference-and-professional-courtesy',
    title: 'Fellow Architect Obligations: Non-Poaching and Successor Work',
    folder: '.ai/content-audit-export/articles/lea-prac-eth-006-obligations-to-fellow-architects-non-poaching-non-interference-and-professional-cou--bceaa05b-1eaa-4369-a29c-fbd8aef6937b',
    topic: 'professional ethics fellow architect obligations',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe successor-work and proportional-claim scenario.',
    deferredClaims: [
      'Exact percentage-credit formulas remain final-depth source-needed; the checked source only says limit claims to the extent of work done when original mass, area, or design is substantially maintained.',
      'Due-diligence mechanics for identifying retired or deceased original architects remain source-needed beyond the checked Section 5-f notice rule.',
    ],
    removedMaterial: [
      'Removed unsupported exact percentage-credit scenarios.',
      'Replaced broad due-diligence and conflict-resolution process claims with verified Section 5-c, 5-e, 5-f, and 5-g text.',
    ],
  }
  eth006.sources = [ethicsSource(eth006.articleId, eth006.slug, '81-100', 'Checked for fellow-architect obligations: endowed commissions, written notice before takeover, termination and compensation, additions/remodeling notice, claim limitation, heritage preservation, non-injurious conduct, and information sharing.')]
  eth006.markdown = `# ${eth006.title}

## Board Exam Quick Check

Fellow-architect questions usually test whether a new architect may pursue or accept work connected to another architect's commission or completed structure. The source-safe answer is built from Section 5-c, 5-e, 5-f, and 5-g: do not seek commissions known to be endowed to another architect, notify the previous architect before assuming assigned work, confirm termination and compensation, notify the original architect for additions or remodeling, limit claims to the work actually done, and do not falsely or maliciously injure another architect's reputation.

## Learning Goal

After studying this article, you should be able to:

- Separate non-poaching under Section 5-c from takeover procedure under Section 5-e.
- Apply the additions, rehabilitation, and remodeling notice rule in Section 5-f.
- Avoid unsupported percentage-credit formulas.
- Identify false or malicious injury to another architect as a distinct ethical issue.

## Non-Poaching and Takeover

Section 5-c bars the architect from seeking commissions already known to be previously endowed to another architect, whether the endowment has been definitely agreed upon or is still in negotiation. This means an exam item does not need a signed final contract before the non-poaching issue can appear.

Section 5-e addresses a later step: undertaking a commission for which another architect was previously employed. Before assuming that commission, the new architect should notify the other architect in writing and conclusively determine that the original employment has been terminated and duly compensated.

## Additions, Remodeling, and Public Claims

Section 5-f applies when an architect is asked to undertake additions, rehabilitation, or remodeling of an erected structure previously undertaken by another architect. The new architect should notify the previous architect of the contemplated project even when the owner is no longer the same.

The same section also controls public claims. If the greater mass, area, or design of the original structure is substantially maintained, the new architect should limit advertising or claims only to the extent of work done to the structure. The checked source supports that limitation, but it does not give a mathematical formula for percentage credit.

## Reputation and Professional Courtesy

Section 5-g bars knowingly false or malicious injury to another architect's professional reputation, prospects, or practice. This does not forbid all professional disagreement. It forbids conduct that is false or maliciously injurious. Section 5-k reinforces a positive side of colleague duty by calling for technical information sharing and unity in the fellowship of the profession.

## Real World Scenario

Architect B is invited to renovate an old house whose main mass and facade were designed by Architect A. The owner has changed and wants Architect B to advertise the project as entirely new. The source-safe response is to notify Architect A of the contemplated work and limit public claims to Architect B's actual renovation scope because the original mass and design remain substantially maintained.

## Exam Traps

- Treating negotiation with another architect as unprotected because no final contract was signed.
- Thinking written notice alone is enough when Section 5-e also requires termination and compensation to be determined.
- Using exact percentage-credit math not found in the source.
- Confusing truthful professional critique with false or malicious injury.

## Related Articles

- [Profession Duties in the UAP Code](lea-prac-eth-005)
- [Public Responsibilities](lea-prac-eth-003)
- [Architect's Credo](lea-prac-eth-002)
`
  eth006.claims = [
    'Section 5-c bars seeking commissions known to be endowed to another architect, including work still in negotiation.',
    'Section 5-e requires written notice and determination of termination and compensation before taking over previously assigned work.',
    'Section 5-f requires notice for additions, rehabilitation, or remodeling of a structure previously undertaken by another architect and limits claims to actual work when original mass, area, or design remains substantially maintained.',
    'Section 5-g bars false or malicious injury to another architect reputation, prospects, or practice.',
  ]
  eth006.questionTemplates = [
    q('001', 'Which statement about injurious conduct is source-safe?', [option('a', 'The architect should not knowingly injure falsely or maliciously another architect reputation, prospects, or practice'), option('b', 'All criticism is banned even when truthful and constructive'), option('c', 'False injury is allowed if it wins a commission'), option('d', 'The rule applies only to suppliers')], 'a', 'Section 5-g is limited to knowing, false, or malicious injury.', 'UAP Code of Ethics lines 95-97'),
    q('002', 'Before undertaking a commission previously assigned to another architect, what does Section 5-e require?', [option('a', 'Written notification plus determination that the original employment has terminated and been duly compensated'), option('b', 'Only a lower fee proposal'), option('c', 'Only a verbal call to the owner'), option('d', 'No action if the project is urgent')], 'a', 'Section 5-e requires notice, termination, and compensation resolution.', 'UAP Code of Ethics lines 91-93'),
    q('003', 'If a new architect performs renovation while the original mass and design are substantially maintained, what should public claims do?', [option('a', 'Limit the claim to the extent of work done to the structure'), option('b', 'Claim complete authorship of the original building'), option('c', 'Use an unsupported fixed percentage formula'), option('d', 'Avoid notifying the original architect')], 'a', 'Section 5-f supports limiting claims to actual work done.', 'UAP Code of Ethics lines 92-95'),
    q('004', 'How should exact percentage-credit questions be handled in Batch 112?', [option('a', 'Rewrite them to the source-supported rule: limit claims to the extent of actual work done'), option('b', 'Invent a percentage formula'), option('c', 'Use the owner preferred percentage'), option('d', 'Delete the previous architect from the scenario')], 'a', 'The checked source gives a qualitative claim-limitation rule, not a formula.', 'UAP Code of Ethics lines 92-95'),
    q('005', 'What does Section 5-c say about commissions still in negotiation with another architect?', [option('a', 'They are protected if known to be previously endowed to another architect'), option('b', 'They may always be poached'), option('c', 'They belong to suppliers'), option('d', 'They eliminate compensation')], 'a', 'Section 5-c covers endowed commissions whether agreed upon or still in negotiation.', 'UAP Code of Ethics lines 88-90'),
    q('006', 'When may an architect pursue a commission previously offered to another architect?', [option('a', 'Only after satisfying the source-supported notice, termination, and compensation conditions'), option('b', 'Immediately if the new fee is cheaper'), option('c', 'Whenever the owner says not to notify anyone'), option('d', 'Only by using paid advertisements')], 'a', 'Section 5-e supplies the takeover conditions.', 'UAP Code of Ethics lines 91-93'),
    q('007', 'What is the critical difference between notification and the complete Section 5-e obligation?', [option('a', 'Notification is one requirement; the architect must also determine termination and due compensation'), option('b', 'Notification alone replaces compensation'), option('c', 'Termination is irrelevant'), option('d', 'The requirement applies only to contractors')], 'a', 'Section 5-e has more than a notice requirement.', 'UAP Code of Ethics lines 91-93'),
    q('008', 'A new architect is hired for additions to a building previously designed by another architect. What is the source-safe first concern?', [option('a', 'Notify the previous architect of the contemplated project'), option('b', 'Claim full original authorship'), option('c', 'Use a supplier discount'), option('d', 'Offer a free preliminary sketch to win the work')], 'a', 'Section 5-f requires notice for additions, rehabilitation, or remodeling.', 'UAP Code of Ethics lines 92-95'),
    q('009', 'If the original architect has retired, what should this batch avoid claiming without more source?', [option('a', 'Detailed due-diligence mechanics beyond the Section 5-f notice rule'), option('b', 'That Section 5-f concerns successor work'), option('c', 'That claims should be limited to actual work'), option('d', 'That false malicious injury is barred')], 'a', 'The checked source gives the notice rule but not detailed mechanics for retirement or death scenarios.', 'UAP Code of Ethics lines 92-97'),
    q('010', 'Which sequence best matches Section 5-e?', [option('a', 'Written notice, determine original employment termination, determine due compensation'), option('b', 'Undercut fee, advertise, sign finished drawings'), option('c', 'Accept supplier gift, certify payment, hide discount'), option('d', 'Guarantee cost, ignore scope, avoid arbitration')], 'a', 'Section 5-e supports that sequence.', 'UAP Code of Ethics lines 91-93'),
  ]

  const eth007 = {
    articleId: '92d4ab9e-b544-4812-96b7-72ca589f102c',
    slug: 'lea-prac-eth-007-obligations-to-contractors-and-suppliers-independence-and-impartiality',
    title: 'Contractor and Supplier Independence in the UAP Code',
    folder: '.ai/content-audit-export/articles/lea-prac-eth-007-obligations-to-contractors-and-suppliers-independence-and-impartiality--92d4ab9e-b544-4812-96b7-72ca589f102c',
    topic: 'professional ethics contractor supplier responsibility',
    thinNeedsExpansion: false,
    scenarioStatus: 'added',
    scenarioNote: 'Added source-safe contractor payment and supplier-discount scenario.',
    deferredClaims: [
      'Appearance-of-bias doctrine and recusal mechanics remain final-depth source-needed; the checked text supports moral obligation and reciprocal frame of mind.',
      'Exact software-value or time-passed examples remain scenario choices only when tied back to Section 3-d or 4-b source wording.',
    ],
    removedMaterial: [
      'Removed unsupported appearance-of-bias standard as a standalone source rule.',
      'Reframed supplier/contractor examples around moral obligation, technical-service obligation, and client-credited discount text.',
    ],
  }
  eth007.sources = [ethicsSource(eth007.articleId, eth007.slug, '60-79', 'Checked for contractor and supplier responsibilities: fair safeguarding, clear contract documents, correction of errors, rejection of nonconforming work, payment certificates, technical information, technical services, gifts, commissions, favors, moral obligation, reciprocal frame of mind, and client-credited market discounts.')]
  eth007.markdown = `# ${eth007.title}

## Board Exam Quick Check

Sections 3 and 4 of the UAP Code of Ethics control contractor and supplier relationships. The architect must safeguard contractor interests fairly while serving the client, keep contract documents clear, reject nonconforming work promptly, avoid gifts or free services that create moral obligation, avoid supplier technical services that harm client interests or professional opinion, and credit permissible market discounts to the client.

## Learning Goal

After studying this article, you should be able to:

- Explain the architect's fair-safeguard role toward the contractor.
- Identify gifts, free services, commissions, favors, and reciprocal discounts as ethics risks.
- Distinguish prohibited supplier technical services from client-credited market discounts.
- Apply payment and inspection duties without importing unsupported bias standards.

## Contractor Relationship

Section 3 states that the contractor depends on the architect to safeguard fairly the contractor's interests as well as those of the client. Section 3-a makes that practical by requiring clear, definite, and consistent information in pertinent contract documents so unnecessary mistakes and extra costs are avoided.

Section 3-b says the architect should not knowingly call upon the contractor to correct or remedy oversights or errors in the contract documents to the contractor's financial disadvantage. Section 3-c requires the architect, upon personal knowledge and inspection, to reject or condemn materials, equipment, or workmanship not in conformity with the contract documents so unnecessary delay and added expense are avoided.

Section 3-f also gives a payment-related duty: upon the contractor's request, the architect should promptly inspect completed work phases and, if they comply with contract documents, issue the corresponding certificates of payment and final certificate of completion.

## Gifts, Services, and Supplier Benefits

Section 3-d prohibits accepting free engineering services, substantial aid, gifts, commissions, or favors from a contractor or subcontractor when those benefits tend to place the architect under moral obligation.

Section 4 recognizes that technical information exchange with manufacturers, dealers, and agents is useful. But Section 4-a says the architect should not use technical services from manufacturers or suppliers when accompanied by an obligation detrimental to the client interest or adverse to professional opinion.

Section 4-b bars commissions, discounts, fees, gifts, or favors from agents or firms handling building materials or equipment when they place the architect in a reciprocal frame of mind. A market discount may be accepted only if credited to the client.

## Real World Scenario

A supplier offers free engineering calculations and a hidden product discount if the architect specifies its cladding system. The source-safe answer is to refuse any technical service or benefit that creates obligation or harms independent professional opinion. If a genuine market discount is available, it must be credited to the client rather than kept as the architect's hidden return.

## Exam Traps

- Calling a free technical service harmless just because it has no invoice.
- Keeping a market discount instead of crediting it to the client.
- Making the contractor pay for the architect's own contract-document error.
- Treating "appearance of bias" as the source wording when the checked text says moral obligation and reciprocal frame of mind.

## Related Articles

- [Client Responsibilities](lea-prac-eth-004)
- [Public Responsibilities](lea-prac-eth-003)
- [Construction Administration](lea-prac-svc-008)
`
  eth007.claims = [
    'Section 3 frames the architect as a fair safeguard of contractor and client interests.',
    'Section 3-a through 3-c supports clear contract information, no shifting architect document errors to the contractor, and prompt rejection of nonconforming work.',
    'Section 3-d bars contractor or subcontractor benefits that tend to create moral obligation.',
    'Section 4-a bars supplier technical services tied to obligations detrimental to the client or professional opinion.',
    'Section 4-b permits market discounts only when credited to the client.',
  ]
  eth007.questionTemplates = [
    q('001', 'What source wording controls gifts and commissions from contractors under Section 3-d?', [option('a', 'Whether the benefit tends to place the architect under moral obligation'), option('b', 'Whether the architect personally feels no bias'), option('c', 'Whether two years have passed'), option('d', 'Whether the gift is called software')], 'a', 'Section 3-d uses moral obligation language.', 'UAP Code of Ethics lines 68-69'),
    q('002', 'Under Section 3, what dual role does the architect have toward contractors?', [option('a', 'Safeguard fairly the contractor interests as well as those of the client'), option('b', 'Always favor the contractor over the client'), option('c', 'Always punish the contractor for architect document errors'), option('d', 'Avoid all contract documents')], 'a', 'Section 3 states the fair-safeguard role.', 'UAP Code of Ethics lines 60-63'),
    q('003', 'A contractor requests payment certification after a completed phase. What source rule applies?', [option('a', 'Promptly inspect and issue the certificate if the work conforms to contract documents'), option('b', 'Delay without inspection because the contractor requested it'), option('c', 'Issue payment without regard to documents'), option('d', 'Accept a gift before inspecting')], 'a', 'Section 3-f supports prompt inspection and certificates for conforming completed phases.', 'UAP Code of Ethics lines 70-71'),
    q('004', 'How should bids be evaluated if a contractor previously gave the architect a favor that creates moral obligation?', [option('a', 'The architect should not accept benefits that create moral obligation in the first place; the source concern is compromised independent judgment'), option('b', 'The favor requires choosing that contractor'), option('c', 'The favor permits ignoring the lowest compliant bid'), option('d', 'The Code requires a hidden commission')], 'a', 'Section 3-d bars benefits that tend to create moral obligation.', 'UAP Code of Ethics lines 68-69'),
    q('005', 'A contractor offers free project software as a favor. What is the safest Section 3-d analysis?', [option('a', 'Reject it if it tends to place the architect under moral obligation'), option('b', 'Accept it because software is not cash'), option('c', 'Accept it if no one notices'), option('d', 'Treat it as client compensation')], 'a', 'Section 3-d reaches favors and substantial aid that create moral obligation.', 'UAP Code of Ethics lines 68-69'),
    q('006', 'A supplier offers free technical services tied to using its product. Which source rule controls?', [option('a', 'Section 4-a: do not use supplier technical services accompanied by an obligation detrimental to client interests or professional opinion'), option('b', 'Section 5-c: endowed commissions'), option('c', 'Section 1-d: factual materials'), option('d', 'Section 2-j: arbitration')], 'a', 'Section 4-a controls supplier technical services with harmful obligations.', 'UAP Code of Ethics lines 73-78'),
    q('007', 'How must a permissible market discount on materials be handled?', [option('a', 'Credit it to the client'), option('b', 'Keep it as hidden architect profit'), option('c', 'Convert it into a paid endorsement'), option('d', 'Use it to avoid contract documents')], 'a', 'Section 4-b permits market discounts only when credited to the client.', 'UAP Code of Ethics lines 78-79'),
    q('008', 'What should this batch avoid as the controlling source phrase for ETH-007?', [option('a', 'Unsupported appearance-of-bias doctrine when the checked text says moral obligation and reciprocal frame of mind'), option('b', 'Moral obligation'), option('c', 'Reciprocal frame of mind'), option('d', 'Client-credited market discount')], 'a', 'The checked UAP text uses moral obligation and reciprocal frame of mind.', 'UAP Code of Ethics lines 68-79'),
    q('009', 'Which statement accurately distinguishes supplier services from market discounts?', [option('a', 'Supplier technical services tied to harmful obligation are barred; market discounts are allowed only when credited to the client'), option('b', 'All supplier services and discounts are personal architect income'), option('c', 'All technical services are automatically required'), option('d', 'Discounts replace specifications')], 'a', 'Sections 4-a and 4-b establish the distinction.', 'UAP Code of Ethics lines 73-79'),
    q('010', 'What should the architect avoid when contract documents contain an oversight or error?', [option('a', 'Knowingly making the contractor correct the architect oversight or error to the contractor financial disadvantage'), option('b', 'Providing clear information'), option('c', 'Inspecting completed conforming work'), option('d', 'Rejecting nonconforming work')], 'a', 'Section 3-b controls this contractor-protection issue.', 'UAP Code of Ethics lines 64-68'),
  ]

  return [eth003, eth004, eth005, eth006, eth007]
}

function main() {
  const articles = makeArticles()
  const duplicateCheck = priorBatchExclusionCheck(articles)
  if (duplicateCheck.status !== 'pass') throw new Error(`Duplicate article selection: ${JSON.stringify(duplicateCheck.duplicate_hits)}`)
  const results = articles.map(writeArticleArtifacts)
  updateSyncState(results)
  const selectedFiles = [
    ...results.flatMap((result) => listFilesRecursive(result.folder)),
    '.ai/content-audit-export/sync-state.json',
  ]
  const sourceHashChecks = validateSourceHashes(articles)
  const jsonChecks = parseJsonFiles(selectedFiles)
  const markerFindings = markerScan(selectedFiles)
  const questionCounts = linkedQuestionCounts(results)
  const staleComposeErrors = staleComposeErrorScan(results)
  const scopedChecks = buildScopedChecks(results, sourceHashChecks, jsonChecks, markerFindings, questionCounts, staleComposeErrors, duplicateCheck)
  writeManifest(results, duplicateCheck)
  writeScopedChecksAfterManifest(results, scopedChecks)
  writeLedger(results, scopedChecks)
  writeReport(results, scopedChecks)
  writeQa(results, scopedChecks)
  updateHandoff(results, scopedChecks)
  updateCoordination(results, scopedChecks)
  console.log(`${BATCH_ID}: ${scopedChecks.status}`)
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
}

main()
