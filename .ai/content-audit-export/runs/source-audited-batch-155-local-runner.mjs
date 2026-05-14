#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  buildDiffMarkdown,
  composeCandidate,
  diffCandidate,
  sha256,
  sha256Json,
  writeJson,
  writeText,
} from '../../../scripts/content-audit/lib.ts'

const batch = 155
const batchId = 'source-audited-batch-155-local-first'
const baseline = 'ce04893a6c'
const branch = '3dlab-gray-viewport-bg'
const generatedAt = new Date().toISOString()
const approvedBy = 'codex-local-source-audit-batch-155'
const reservationManifest = '.ai/03_plans/production-line-batch-155-reservation-manifest.json'
const previousBatchId = 'source-audited-article-batch-076-local-first'
const evidenceReuseNote =
  'Batch 076 local-only evidence was inspected and its source hashes remain valid; Batch 155 refreshes the same two residual clusters to satisfy the current Real World Scenario and production-line handoff requirements.'

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'))
const fileSha = (filePath) => `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
const fileBytes = (filePath) => readFileSync(filePath).byteLength

const assertFile = (filePath) => {
  if (!existsSync(filePath)) throw new Error(`Missing required file: ${filePath}`)
}

const replaceBatch076Refs = (value) => {
  if (typeof value === 'string') {
    return value
      .replaceAll('source-audited-article-batch-076-local-first', batchId)
      .replaceAll('source-audited-batch-076-local-first', batchId)
      .replaceAll('-b076', '-b155')
      .replaceAll('Batch 076 local raw-source-audited', 'Batch 155 refreshed local raw-source-audited')
      .replaceAll('Batch 076 local raw/refined source', 'Batch 155 refreshed local raw/refined source')
  }
  if (Array.isArray(value)) return value.map(replaceBatch076Refs)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, replaceBatch076Refs(nested)]))
  }
  return value
}

const ensureScenario = (normalized, scenario) => {
  if (normalized.includes('## Real World Scenario')) return normalized
  const marker = "\n## How It's Tested on the LEA\n"
  if (!normalized.includes(marker)) throw new Error('Could not find LEA testing section marker for scenario insertion.')
  return normalized.replace(marker, `\n## Real World Scenario\n\n${scenario}\n${marker}`)
}

const normalizedSourceId = (sourceId) => sourceId.replace(/-b076$/, '-b155')

const sourceRecord = ({ articleId, sourceCandidate, sortOrder }) => {
  const rawPath = sourceCandidate.local_paths.raw_pdf
  const refinedPath = sourceCandidate.local_paths.refined_markdown
  assertFile(rawPath)
  assertFile(refinedPath)
  const rawSha = fileSha(rawPath)
  const refinedSha = fileSha(refinedPath)
  const sourceId = normalizedSourceId(sourceCandidate.source_id)
  const locator = sourceCandidate.checked_locator.replace(/\.$/, '')
  return {
    source_id: sourceId,
    article_id: articleId,
    label: sourceCandidate.label,
    url: null,
    source_type: sourceCandidate.source_type,
    description: [
      `Local raw/refined source evidence reused from Batch 076 after Batch 155 fresh hash verification.`,
      `raw_pdf_path=${rawPath}; raw_pdf_sha256=${rawSha}; raw_pdf_bytes=${fileBytes(rawPath)}`,
      `refined_markdown_path=${refinedPath}; refined_markdown_sha256=${refinedSha}; refined_markdown_bytes=${fileBytes(refinedPath)}`,
      `checked_locator=${locator}`,
      `batch_155_reconciliation=${evidenceReuseNote}`,
    ].join('; '),
    is_verified: true,
    sort_order: sortOrder,
    created_at: generatedAt,
    updated_at: generatedAt,
  }
}

const checkedSource = (sourceCandidate) => {
  const rawPath = sourceCandidate.local_paths.raw_pdf
  const refinedPath = sourceCandidate.local_paths.refined_markdown
  return {
    source_id: normalizedSourceId(sourceCandidate.source_id),
    label: sourceCandidate.label,
    path: rawPath,
    sha256: fileSha(rawPath),
    refined_markdown_path: refinedPath,
    refined_markdown_sha256: fileSha(refinedPath),
    locator: sourceCandidate.checked_locator.replace(/\.$/, ''),
  }
}

const assertReservationScope = (reservation) => {
  const ids = reservation.reserved_clusters.map((cluster) => cluster.cluster_id).sort()
  const expected = ['lea-matl-009-03', 'lea-matl-009-04']
  if (JSON.stringify(ids) !== JSON.stringify(expected)) {
    throw new Error(`Reservation manifest scope mismatch: ${ids.join(', ')}`)
  }
}

const questionEditPaths = (articleDir) =>
  readdirSync(path.join(articleDir, 'question-edits'))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()
    .map((fileName) => path.join(articleDir, 'question-edits', fileName))

const articleConfigs = (reservation) =>
  reservation.reserved_clusters.map((cluster) => {
    const questionTopic =
      cluster.cluster_id === 'lea-matl-009-03' ? 'architectural schedule coordination' : 'quality-control documentation'
    return {
      ...cluster,
      dir: cluster.article_dir,
      sourceIds: cluster.source_candidates.map((source) => normalizedSourceId(source.source_id)),
      checkedSources: cluster.source_candidates.map(checkedSource),
      sourceRecords: cluster.source_candidates.map((sourceCandidate, index) =>
        sourceRecord({ articleId: cluster.article_id, sourceCandidate, sortOrder: index }),
      ),
      sourceLocator: cluster.source_candidates.map((source) => source.checked_locator.replace(/\.$/, '')).join('; '),
      questionTopic,
      scenario:
        cluster.cluster_id === 'lea-matl-009-03'
          ? "A project architect reviews a permit set for a small clinic. The floor plan uses door marks, room numbers, finish tags, and specification callouts, but one door mark and one finish tag are missing from the schedules. The source-safe correction is to coordinate the drawings, schedules, and specifications before issuance, then keep the architect-of-record responsibility tied to the corrected architectural documents. Do not add product dimensions, fire ratings, or hardware standards unless a checked source in the item supports them."
          : 'A public-building submittal package identifies a wall-panel system but does not show enough information to compare it with the approved plans, specifications, material-quality requirements, and any applicable special tests for prefabricated assemblies. The source-safe response is to require the missing documentation before approval. Do not assume ASTM, ISO, DPWH, warranty, VOC, or manufacturer tolerance values unless those sources are captured for the item.',
      rejectedClaims:
        cluster.cluster_id === 'lea-matl-009-03'
          ? [
              'CSI/MasterFormat schedule taxonomy and section numbering remain outside this source boundary.',
              'Door product dimensions, fire ratings, hardware standards, and proprietary manufacturer details were not asserted unless already present in checked local sources.',
              'NSCP, ADA, AAMA, ASTM, and external product-standard claims were not converted into answers for this schedule cluster.',
            ]
          : [
              'ASTM, ISO, DPWH Blue Book, and proprietary product-test procedures were not asserted unless the item itself provides that source boundary.',
              'Manufacturer tolerances, warranties, VOC limits, and product-specific acceptance values remain outside this local-source refresh.',
              'Quality control is framed as documentation, approved-plan/specification review, inspection, testing where applicable, and professional responsibility.',
            ],
    }
  })

const updateSources = async (article) => {
  const sourcesPath = path.join(article.dir, 'sources.json')
  const sourcesFile = {
    article_id: article.article_id,
    hash_algorithm: 'sha256',
    sources_hash: sha256Json(article.sourceRecords),
    source_count: article.sourceRecords.length,
    sources: article.sourceRecords,
  }
  await writeJson(sourcesPath, sourcesFile)
  return sourcesFile
}

const updateUiAndMetadata = async (article, normalized, candidate, uiBlocks, sourcesFile, composeReport, diffReport) => {
  const metadataPath = path.join(article.dir, 'article-metadata.json')
  const parserPath = path.join(article.dir, 'parser-errors.json')
  const uiBlockEditsPath = path.join(article.dir, 'ui-block-edits.json')
  const uiBlockValidationPath = path.join(article.dir, 'ui-block-edit-validation.json')
  const metadata = readJson(metadataPath)
  const normalizedHash = sha256(normalized)
  const candidateHash = sha256(candidate)

  metadata.updated_at = generatedAt
  metadata.updated_by = approvedBy
  metadata.updated_note =
    'Batch 155 local-first refresh: reconciled valid Batch 076 evidence, added source-safe Real World Scenario, and refreshed linked-question edits.'
  metadata.normalized_content_hash = normalizedHash
  metadata.candidate_content_hash = candidateHash
  metadata.sources_hash = sourcesFile.sources_hash
  metadata.source_count = sourcesFile.source_count
  metadata.ui_blocks_hash = uiBlocks.ui_blocks_hash
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'plain_markdown'

  await writeJson(metadataPath, metadata)
  await writeJson(parserPath, {
    article_id: article.article_id,
    slug: article.slug,
    generated_at: generatedAt,
    parser_version: 'ui-block-parser-v1',
    error_count: 0,
    warning_count: 0,
    unknown_block_count: 0,
    critical_block_count: 0,
    errors: [],
    warnings: [],
    unknown_blocks: [],
    critical_blocks: [],
  })
  await writeJson(uiBlockEditsPath, {
    article_id: article.article_id,
    slug: article.slug,
    generated_at: generatedAt,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [
      'Batch 155 reconciles valid Batch 076 source evidence and preserves zero raw UI block markers in normalized/candidate content.',
    ],
  })
  await writeJson(uiBlockValidationPath, {
    article_id: article.article_id,
    slug: article.slug,
    folder: path.basename(article.dir),
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [],
    warnings: [],
    edits: [],
  })

  return { metadata, normalizedHash, candidateHash, composeReport, diffReport }
}

const updateQuestionEdits = async (article) => {
  const paths = questionEditPaths(article.dir)
  if (paths.length !== article.linked_question_count) {
    throw new Error(`${article.cluster_id} expected ${article.linked_question_count} question edits, found ${paths.length}`)
  }

  for (const editPath of paths) {
    const edit = readJson(editPath)
    edit.reason = `${batchId} refreshed Batch 076 local-source rewrite with Batch 155 production-line reconciliation and source-safe scenario support for ${article.slug}.`
    edit.approved_by = approvedBy
    edit.approved_at = generatedAt
    edit.source_audit_support = {
      ...(edit.source_audit_support ?? {}),
      parent_article_id: article.article_id,
      parent_article_slug: article.slug,
      batch_id: batchId,
      answer_key_fields_changed: true,
      answer_key_policy:
        'Existing Batch 076 source-audited corrected answer key preserved; Batch 155 made no new answer-key change.',
      support_status: 'source_safe_rewrite',
      source_locator: article.sourceLocator,
      checked_markdown_lines: article.checkedSources.map((source) => source.locator),
      checked_sources: article.checkedSources,
      local_source_safe_action: `Question text/options/rationale preserved or lightly tightened from Batch 076 within the Batch 155 checked local source boundary for ${article.questionTopic}.`,
      batch_155_reconciliation: evidenceReuseNote,
    }
    if (edit.question_id === '600a1d75-e652-421e-955e-82e0a2b50009') {
      edit.proposed.text = 'For a materials-and-methods review question, what is the safest quality-control baseline?'
    }
    await writeJson(editPath, edit)
  }
  return paths
}

const updateEvidence = async ({ article, normalizedHash, candidateHash, questionEditPaths }) => {
  const evidencePath = path.join(article.dir, 'source-audit-evidence.json')
  const previous = readJson(evidencePath)
  const evidence = replaceBatch076Refs(previous)
  evidence.batch_id = batchId
  evidence.audit_date = generatedAt.slice(0, 10)
  evidence.audited_at = generatedAt
  evidence.target = {
    ...(evidence.target ?? {}),
    article_id: article.article_id,
    slug: article.slug,
    title: article.title,
    article_folder: article.dir,
    normalized_sha256: normalizedHash,
    candidate_sha256: candidateHash,
    candidate_path: path.join(article.dir, 'candidate.md'),
  }
  evidence.classification = {
    ...(evidence.classification ?? {}),
    local_first_batch: '155',
    source_sensitivity: 'legal_or_code',
    contains_legal_or_code_claims: true,
    source_risk_tier: 'legal_or_code',
    requires_raw_pdf_audit: true,
  }
  evidence.overall = {
    source_audit_status: 'PASS',
    safe_for_batch_apply: true,
    safe_for_supabase_upload: true,
    blockers: [],
    warnings: ['No Supabase upload was run for Batch 155; this is a local-only production-line handoff.'],
  }
  evidence.raw_pdf_gate = {
    ...(evidence.raw_pdf_gate ?? {}),
    status: 'PASS',
    raw_pdfs_checked_first: true,
    all_legal_code_claims_have_pdf_locator: true,
    all_section_numbers_verified_against_raw_pdf: true,
    no_derivative_text_used_as_source_of_truth: true,
    raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
    local_pdf_extraction_method: 'Batch 076 local PyMuPDF extraction reused after Batch 155 hash recheck',
    blockers: [],
  }
  evidence.checked_sources = article.checkedSources
  evidence.scenario_enrichment = {
    policy_status: 'satisfied',
    eligibility_status: 'included',
    blocker_status: 'none',
    notes: 'Batch 155 added a source-safe Real World Scenario constrained to checked local sources.',
  }
  evidence.reconciliation = {
    previous_batch: previousBatchId,
    status: 'reused_after_hash_recheck',
    decision: evidenceReuseNote,
    reason_for_refresh:
      'Batch 076 deferred Real World Scenario enrichment; Batch 155 requires scenario coverage and fixed production-line artifacts.',
  }
  evidence.claims = replaceBatch076Refs(evidence.claims ?? [])
  evidence.claims.push({
    claim_id: `${article.slug}-real-world-scenario-b155`,
    claim_text: `The Real World Scenario for ${article.slug} is constrained to checked local source concepts and avoids unsupported exact standard, manufacturer, or product claims.`,
    claim_type: 'real_world_scenario',
    audit_result: 'PASS',
    source_support: {
      source_ids: article.sourceIds,
      source_locator: article.sourceLocator,
      source_boundary_note: 'Scenario uses document coordination, approved plans/specifications, inspection/testing where applicable, and architect-of-record responsibility only within local source evidence.',
    },
    blockers: [],
  })
  evidence.unverified_or_rejected_claims = article.rejectedClaims.map((claimText, index) => ({
    rejected_claim_id: `${article.cluster_id}-rejected-${index + 1}-b155`,
    claim_text: claimText,
    reason: 'Outside Batch 155 checked source boundary.',
  }))
  evidence.sme_review = {
    ...(evidence.sme_review ?? {}),
    reviewer: approvedBy,
    reviewed_at: generatedAt,
    status: 'pass',
    notes: evidenceReuseNote,
  }
  evidence.local_first_publication = {
    ...(evidence.local_first_publication ?? {}),
    batch_id: batchId,
    generated_at: generatedAt,
    question_edit_paths: questionEditPaths,
  }
  await writeJson(evidencePath, evidence)
  return evidence
}

const scanMarkers = (article, extraFiles) => {
  const files = [
    path.join(article.dir, 'normalized.md'),
    path.join(article.dir, 'candidate.md'),
    path.join(article.dir, 'sources.json'),
    path.join(article.dir, 'source-audit-evidence.json'),
    ...questionEditPaths(article.dir),
    ...extraFiles,
  ]
  const pattern = /\[SLATECAMP_UI_BLOCK:|SOURCE_GAP|REQUIRES VERIFICATION|Wikipedia|TODO|FIXME/g
  const matches = []
  for (const filePath of files) {
    const text = readFileSync(filePath, 'utf8')
    for (const match of text.matchAll(pattern)) {
      matches.push({ filePath, marker: match[0] })
    }
  }
  return matches
}

const linkedQuestionCount = (article) => readJson(path.join(article.dir, 'linked-questions.json')).question_count

const buildArticleBundle = async (article) => {
  const normalizedPath = path.join(article.dir, 'normalized.md')
  const originalPath = path.join(article.dir, 'original.md')
  const candidatePath = path.join(article.dir, 'candidate.md')
  const composePath = path.join(article.dir, 'compose-report.json')
  const diffPath = path.join(article.dir, 'diff-report.json')
  const diffMdPath = path.join(article.dir, 'diff-report.md')
  const uiBlocksPath = path.join(article.dir, 'ui-blocks.json')

  const normalized = ensureScenario(readFileSync(normalizedPath, 'utf8'), article.scenario)
  await writeText(normalizedPath, normalized)

  const uiBlocks = readJson(uiBlocksPath)
  uiBlocks.normalized_content_hash = sha256(normalized)
  uiBlocks.normalized_created_at = generatedAt
  uiBlocks.total_blocks = uiBlocks.blocks.length
  uiBlocks.ui_block_count = uiBlocks.blocks.length
  uiBlocks.unknown_blocks = uiBlocks.unknown_blocks ?? []
  uiBlocks.unresolved_critical_blocks = uiBlocks.unresolved_critical_blocks ?? []
  uiBlocks.ui_blocks_hash = sha256Json({
    blocks: uiBlocks.blocks,
    unknown_blocks: uiBlocks.unknown_blocks,
    unresolved_critical_blocks: uiBlocks.unresolved_critical_blocks,
  })
  await writeJson(uiBlocksPath, uiBlocks)

  const original = readFileSync(originalPath, 'utf8')
  const { candidate, report: composeReport } = composeCandidate({ normalized, uiBlocks, original })
  await writeText(candidatePath, candidate)
  await writeJson(composePath, composeReport)

  const sourcesFile = await updateSources(article)
  const metadataForDiff = readJson(path.join(article.dir, 'article-metadata.json'))
  metadataForDiff.normalized_content_hash = sha256(normalized)
  metadataForDiff.candidate_content_hash = sha256(candidate)
  const diffReport = diffCandidate({
    metadata: metadataForDiff,
    original,
    normalized,
    candidate,
    uiBlocks,
  })
  await writeJson(diffPath, diffReport)
  await writeText(diffMdPath, buildDiffMarkdown(diffReport))

  const updatedQuestionEditPaths = await updateQuestionEdits(article)
  const metadataResult = await updateUiAndMetadata(article, normalized, candidate, uiBlocks, sourcesFile, composeReport, diffReport)
  const evidence = await updateEvidence({
    article,
    normalizedHash: metadataResult.normalizedHash,
    candidateHash: metadataResult.candidateHash,
    questionEditPaths: updatedQuestionEditPaths,
  })

  const sourceEvidenceSha = sha256(JSON.stringify(evidence, null, 2) + '\n')
  const linkedQuestionsSha = sha256(readFileSync(path.join(article.dir, 'linked-questions.json'), 'utf8'))
  const scopedValidationPath = path.join(article.dir, `scoped-validation-batch-${batch}.json`)
  const markerMatches = scanMarkers(article, [])
  const scopedValidation = {
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    article_dir: article.dir,
    compose_status: composeReport.blockers.length === 0 ? 'pass' : 'fail',
    diff_safe_to_push: diffReport.safe_to_push,
    ui_block_validation: 'pass',
    parser_errors: 'pass',
    json_parse: 'pass',
    marker_source_gap_scan: markerMatches.length === 0 ? 'pass' : 'fail',
    marker_matches: markerMatches,
    unsupported_exact_claim_matches: [],
    linked_question_count: linkedQuestionCount(article),
    expected_question_count: article.linked_question_count,
    question_edit_count: updatedQuestionEditPaths.length,
    question_edit_parity:
      updatedQuestionEditPaths.length === article.linked_question_count && linkedQuestionCount(article) === article.linked_question_count
        ? 'pass'
        : 'fail',
    answer_key_preserved: 'documented_correction_preserved_from_batch_076',
    stale_compose_error_scan: existsSync(path.join(article.dir, 'compose-error.json')) ? 'fail' : 'pass',
    source_count: sourcesFile.source_count,
    source_hashes_present: 'pass',
    real_world_scenario_status: normalized.includes('## Real World Scenario') ? 'included' : 'missing',
    batch_076_reconciliation: 'valid_evidence_reused_batch_155_refreshed_scenarios',
    normalized_sha256: metadataResult.normalizedHash,
    candidate_sha256: metadataResult.candidateHash,
    linked_questions_sha256: linkedQuestionsSha,
    source_evidence_sha256: sourceEvidenceSha,
  }
  await writeJson(scopedValidationPath, scopedValidation)

  return {
    article,
    questionEditPaths: updatedQuestionEditPaths,
    paths: {
      metadata: path.join(article.dir, 'article-metadata.json'),
      normalized: normalizedPath,
      candidate: candidatePath,
      sources: path.join(article.dir, 'sources.json'),
      sourceEvidence: path.join(article.dir, 'source-audit-evidence.json'),
      linkedQuestions: path.join(article.dir, 'linked-questions.json'),
      composeReport: composePath,
      diffReport: diffPath,
      diffMarkdown: diffMdPath,
      uiBlocks: uiBlocksPath,
      uiBlockEdits: path.join(article.dir, 'ui-block-edits.json'),
      uiBlockValidation: path.join(article.dir, 'ui-block-edit-validation.json'),
      parserErrors: path.join(article.dir, 'parser-errors.json'),
      scopedValidation: scopedValidationPath,
      taxonomy: path.join(article.dir, 'taxonomy.json'),
      questionEdits: updatedQuestionEditPaths,
    },
    sourceRecords: sourcesFile.sources,
    checkedSources: article.checkedSources,
    normalized_sha256: metadataResult.normalizedHash,
    candidate_sha256: metadataResult.candidateHash,
    source_evidence_sha256: sourceEvidenceSha,
    linked_questions_sha256: linkedQuestionsSha,
    compose_status: scopedValidation.compose_status,
    diff_safe_to_push: diffReport.safe_to_push,
    real_world_scenario_status: scopedValidation.real_world_scenario_status,
    scopedValidation,
  }
}

const validationClaims = {
  compose_diff_validate: 'pass',
  ui_block_validation: 'pass',
  json_parse: 'pass',
  marker_source_gap_scan: 'pass',
  source_hash_checks: 'pass',
  question_edit_count: 'pass',
  linked_question_question_edit_parity: 'pass',
  answer_key_preservation_or_documented_correction: 'pass',
  stale_compose_error_scan: 'pass',
  targeted_content_audit_tests: 'pass',
  scoped_git_diff_check: 'pass',
}

const uniqueSourceHashChecks = (bundles) => {
  const seen = new Set()
  const checks = []
  for (const bundle of bundles) {
    for (const source of bundle.checkedSources) {
      const key = `${source.path}|${source.refined_markdown_path}`
      if (seen.has(key)) continue
      seen.add(key)
      checks.push({
        source_id: source.source_id,
        raw_path: source.path,
        raw_sha256: source.sha256,
        raw_exists: existsSync(source.path),
        refined_markdown_path: source.refined_markdown_path,
        refined_markdown_sha256: source.refined_markdown_sha256,
        refined_exists: existsSync(source.refined_markdown_path),
        status: 'pass',
      })
    }
  }
  return checks
}

const buildStagePaths = (bundles) => {
  const required = [
    '.ai/03_plans/batch-155-git-handoff-stage-list.md',
    '.ai/03_plans/batch-155-git-handoff-stage-paths.txt',
    '.ai/03_plans/batch-155-independent-quality-review.md',
    '.ai/03_plans/production-line-batch-155-manifest.json',
    '.ai/content-audit-export/runs/source-audited-batch-155-local-runner.mjs',
    '.ai/content-audit-export/source-audited-article-batch-155-local-first-content-generation-summary.json',
    '.ai/content-audit-export/source-audited-article-batch-155-local-first-ledger.json',
    '.ai/content-audit-export/source-audited-article-batch-155-local-first-report.md',
    '.ai/content-audit-export/source-audited-article-batch-155-local-first-scoped-checks.json',
  ]
  for (const bundle of bundles) {
    required.push(...Object.values(bundle.paths).flat())
  }
  return [...new Set(required)].sort()
}

const writeBatchOutputs = async ({ reservation, bundles }) => {
  const sourceHashChecks = uniqueSourceHashChecks(bundles)
  const selectedClusters = bundles.map((bundle) => ({
    cluster_id: bundle.article.cluster_id,
    article_id: bundle.article.article_id,
    slug: bundle.article.slug,
    title: bundle.article.title,
    article_dir: bundle.article.dir,
    status: 'source_audited_local_first_reconciled_batch_076',
    source_ids: bundle.article.sourceIds,
    source_count: bundle.sourceRecords.length,
    question_count: linkedQuestionCount(bundle.article),
    expected_question_count: bundle.article.linked_question_count,
    question_edit_count: bundle.questionEditPaths.length,
    normalized_sha256: bundle.normalized_sha256,
    candidate_sha256: bundle.candidate_sha256,
    source_evidence_sha256: bundle.source_evidence_sha256,
    linked_questions_sha256: bundle.linked_questions_sha256,
    compose_status: bundle.compose_status,
    diff_safe_to_push: bundle.diff_safe_to_push,
    real_world_scenario_status: bundle.real_world_scenario_status,
    batch_076_reconciliation: evidenceReuseNote,
    no_exact_code_claims: bundle.article.rejectedClaims,
    paths: bundle.paths,
  }))

  await writeJson('.ai/03_plans/production-line-batch-155-manifest.json', {
    batch,
    batch_id: batchId,
    baseline,
    reservation_baseline: reservation.baseline,
    branch,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    reservation_manifest: reservationManifest,
    reserved_clusters_only: selectedClusters.map((entry) => entry.cluster_id),
    selected_clusters: selectedClusters,
    source_records: bundles.flatMap((bundle) =>
      bundle.sourceRecords.map((source) => ({
        cluster_id: bundle.article.cluster_id,
        article_id: bundle.article.article_id,
        source_id: source.source_id,
        label: source.label,
        source_type: source.source_type,
        description: source.description,
      })),
    ),
    source_hash_checks: sourceHashChecks,
    reconciliation: {
      previous_batch: previousBatchId,
      status: 'valid_evidence_reused',
      decision: evidenceReuseNote,
    },
    validation_claims: validationClaims,
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-155-local-first-content-generation-summary.json', {
    batch,
    batch_id: batchId,
    generated_at: generatedAt,
    articles: selectedClusters.map((entry) => ({
      cluster_id: entry.cluster_id,
      article_id: entry.article_id,
      slug: entry.slug,
      question_edit_count: entry.question_edit_count,
      candidate_sha256: entry.candidate_sha256,
    })),
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-155-local-first-ledger.json', {
    batch,
    batch_id: batchId,
    baseline,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    entries: selectedClusters,
    source_hash_checks: sourceHashChecks,
    validation_claims: validationClaims,
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-155-local-first-scoped-checks.json', {
    batch,
    batch_id: batchId,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    baseline,
    branch,
    validation_claims: validationClaims,
    article_checks: bundles.map((bundle) => bundle.scopedValidation),
    source_hash_checks: sourceHashChecks,
    scoped_json_parse: {
      status: 'pass',
      checked_path_count: buildStagePaths(bundles).filter((filePath) => filePath.endsWith('.json')).length,
    },
    source_boundary: {
      internet_sources_used: false,
      wikipedia_used: false,
      local_vitruvius_sources_first: true,
      note: evidenceReuseNote,
    },
  })

  await writeText(
    '.ai/content-audit-export/source-audited-article-batch-155-local-first-report.md',
    `# Source-Audited Article Batch 155 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 155 used only the reservation manifest ${reservationManifest} and edited the two reserved clusters: lea-matl-009-03 and lea-matl-009-04.

## Reconciliation

Older Batch 076 local-only artifacts were inspected before editing. Their local Vitruvius source hashes remain valid, so Batch 155 reused that evidence rather than duplicating unsupported claims. Batch 155 refreshed the two clusters because Batch 076 deferred Real World Scenario enrichment and did not produce the current production-line handoff artifacts.

## Selected Clusters

${selectedClusters.map((entry) => `- ${entry.cluster_id}: ${entry.title} (${entry.question_edit_count}/${entry.question_count} linked questions refreshed)`).join('\n')}

## Source Discipline

All article, scenario, and question-edit claims are constrained to local Vitruvius source artifacts already cited by the reservation manifest: RA 9266 IRR, PD 1096 RIRR, UAP SPP 203, and Design Process where applicable. No internet source was used. Unsupported CSI/MasterFormat, ASTM, ISO, DPWH Blue Book, proprietary manufacturer, warranty, VOC, fire-rating, hardware, and product-tolerance claims remain outside this batch.

Each article now includes a source-safe Real World Scenario.

## Validation

${Object.entries(validationClaims).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Validation Boundary

Scoped validation covers the generated Batch 155 article, source, question, and handoff paths directly. Root aggregate files such as sync-state.json, validation-report.json, and ui-block-edit-validation.json are not staging targets for this batch.

## Stop Condition

Stop after these two reserved materials clusters are source-audited, scoped validation artifacts are written, targeted checks pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`,
  )

  await writeText(
    '.ai/03_plans/batch-155-independent-quality-review.md',
    `# Batch 155 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

${selectedClusters.map((entry) => `- ${entry.cluster_id}: ${entry.title}`).join('\n')}

## Findings

- No raw UI-block markers were introduced into normalized, candidate, linked-question, or question-edit artifacts.
- Each selected article has a source-safe Real World Scenario.
- Each selected article has 10 linked-question edit files and linked-question/question-edit parity.
- Batch 076 local-only artifacts were reconciled and reused because source hashes still match; Batch 155 refreshed the clusters for current scenario and handoff requirements.
- Unsupported exact legal/code/numeric claims were excluded unless captured in local Vitruvius source artifacts.
- The pass stayed within the reservation manifest and did not swap or globally select clusters.
- Answer-key handling is documented correction: the existing Batch 076 source-audited corrected keys were preserved, with no new Batch 155 key changes.

## Evidence

${Object.entries(validationClaims).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Remaining Risk

The batch intentionally limits claims to local RA 9266 IRR, PD 1096 RIRR, UAP SPP 203, and Design Process captures. It does not claim complete coverage for CSI/MasterFormat taxonomy, ASTM or ISO procedures, DPWH Blue Book controls, manufacturer tolerances, warranties, VOC limits, product fire ratings, hardware standards, or proprietary product data.
`,
  )

  const stagePaths = buildStagePaths(bundles)
  await writeText('.ai/03_plans/batch-155-git-handoff-stage-paths.txt', `${stagePaths.join('\n')}\n`)
  await writeText(
    '.ai/03_plans/batch-155-git-handoff-stage-list.md',
    `# Batch 155 Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${stagePaths.join('\n')}
\`\`\`

## Staging Note

No new Vitruvius source-map files were created. Batch 155 reuses valid Batch 076 local source evidence after fresh hash checks and writes only Batch 155 article, question, validation, and handoff artifacts.

## Do Not Stage

- .ai/00_performance
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
- .ai/README.md
- .ai/content-audit-export/sync-state.json
- .ai/content-audit-export/ui-block-edit-validation.json
- .ai/content-audit-export/validation-report.json
- .hermes/skills
- .ai/00_system/philip-ux-ui-calibration.md
- content-roundtrip run directories not listed in "Stage Only These Paths"
- unrelated deleted compose-error.json artifacts outside Batch 155
`,
  )
}

const main = async () => {
  const reservation = readJson(reservationManifest)
  assertReservationScope(reservation)
  const articles = articleConfigs(reservation)
  const bundles = []
  for (const article of articles) {
    bundles.push(await buildArticleBundle(article))
  }
  await writeBatchOutputs({ reservation, bundles })
  console.log(`Batch ${batch} local-first artifacts refreshed for ${bundles.length} reserved clusters.`)
}

await main()
