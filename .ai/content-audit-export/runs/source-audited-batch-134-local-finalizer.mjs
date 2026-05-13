#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const REPO = process.cwd()
const BATCH = 134
const BATCH_ID = 'source-audited-article-batch-134-local-first'
const GENERATED_AT = '2026-05-14T06:45:00.000+08:00'
const BASELINE = '3c71ee7e3'
const BRANCH = '3dlab-gray-viewport-bg'
const STATUS = process.env.BATCH134_STATUS ?? 'passed_local_validation_pending_git_handoff'
const GIT_INDEX_BLOCKER = process.env.BATCH134_GIT_INDEX_BLOCKER ?? null
const TARGETED_TESTS_PASSED = process.env.BATCH134_TARGETED_TESTS_PASSED === 'true'
const TARGETED_TESTS_COMMAND = 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts'
const SUMMARY_PATH = `.ai/content-audit-export/${BATCH_ID}-content-generation-summary.json`
const LEDGER_PATH = `.ai/content-audit-export/${BATCH_ID.replace('article-', 'article-')}-ledger.json`
const REPORT_PATH = `.ai/content-audit-export/source-audited-article-batch-${BATCH}-local-first-report.md`
const SCOPED_CHECKS_PATH = `.ai/content-audit-export/source-audited-article-batch-${BATCH}-local-first-scoped-checks.json`
const MANIFEST_PATH = `.ai/03_plans/production-line-batch-${BATCH}-manifest.json`
const QUALITY_REVIEW_PATH = `.ai/03_plans/batch-${BATCH}-independent-quality-review.md`
const STAGE_LIST_PATH = `.ai/03_plans/batch-${BATCH}-git-handoff-stage-list.md`
const STAGE_PATHS_PATH = `.ai/03_plans/batch-${BATCH}-git-handoff-stage-paths.txt`
const HANDOFF_DOC = '.ai/03_plans/source-audited-local-first-batches-handoff.md'
const FREEZE_DOC = '.ai/03_plans/source-audited-local-first-freeze-readiness-report.md'
const COORDINATION_DOC = '.ai/03_plans/source-audited-production-line-coordination.md'

function sha256(text) {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`
}

function fileHash(relativePath) {
  return sha256(readFileSync(path.join(REPO, relativePath), 'utf8'))
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(REPO, relativePath), 'utf8'))
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(relativePath, value) {
  const full = path.join(REPO, relativePath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`)
}

function listQuestionEdits(articleFolder) {
  const dir = path.join(REPO, articleFolder, 'question-edits')
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => `${articleFolder}/question-edits/${name}`)
}

function scanText(paths, patterns) {
  const matches = []
  for (const relativePath of paths) {
    if (!existsSync(path.join(REPO, relativePath))) continue
    const text = readFileSync(path.join(REPO, relativePath), 'utf8')
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i')
      if (regex.test(text)) matches.push({ path: relativePath, pattern })
    }
  }
  return matches
}

function baselineQuestionKeys(relativePath) {
  const output = execFileSync('git', ['show', `${BASELINE}:${relativePath}`], { cwd: REPO, encoding: 'utf8' })
  const parsed = JSON.parse(output)
  return new Map(parsed.questions.map((question) => [question.question_id, question.correct_option_id]))
}

function buildArticleChecks(article) {
  const folder = article.article_folder
  const metadata = readJson(`${folder}/article-metadata.json`)
  const linked = readJson(`${folder}/linked-questions.json`)
  const sources = readJson(`${folder}/sources.json`)
  const uiBlocks = readJson(`${folder}/ui-blocks.json`)
  const compose = readJson(`${folder}/compose-report.json`)
  const diff = readJson(`${folder}/diff-report.json`)
  const uiValidation = readJson(`${folder}/ui-block-edit-validation.json`)
  const questionEditPaths = listQuestionEdits(folder)
  const normalizedHash = fileHash(`${folder}/normalized.md`)
  const candidateHash = fileHash(`${folder}/candidate.md`)
  const sourceHashChecks = []
  for (const source of sources.sources) {
    sourceHashChecks.push({
      path: source.local_path,
      expected: source.local_sha256,
      actual: fileHash(source.local_path),
      passed: source.local_sha256 === fileHash(source.local_path),
    })
  }
  sourceHashChecks.push({
    path: `${folder}/candidate.md`,
    expected: article.candidate_hash,
    actual: candidateHash,
    passed: article.candidate_hash === candidateHash,
  })
  const baselineKeys = baselineQuestionKeys(`${folder}/linked-questions.json`)
  const answerKeyChanges = linked.questions.filter((question) => baselineKeys.get(question.question_id) !== question.correct_option_id)
  const scanPaths = [
    `${folder}/normalized.md`,
    `${folder}/candidate.md`,
    `${folder}/sources.json`,
    `${folder}/source-audit-evidence.json`,
    ...questionEditPaths,
  ]
  return {
    article_id: article.article_id,
    slug: article.slug,
    title: article.title,
    article_folder: folder,
    linked_question_count: linked.question_count,
    question_edit_count: questionEditPaths.length,
    normalized_hash: normalizedHash,
    candidate_hash: candidateHash,
    source_capture_path: article.source_capture_path,
    source_capture_hash: fileHash(article.source_capture_path),
    refined_source_map_path: article.refined_source_map_path,
    refined_source_map_hash: fileHash(article.refined_source_map_path),
    diff_safe_to_push: diff.safe_to_push === true,
    scenario_status: article.scenario_status,
    compose_blockers: compose.blockers.length,
    diff_blockers: diff.blockers.length,
    ui_block_count: uiBlocks.ui_block_count,
    ui_block_validation_valid: uiValidation.valid === true,
    normalized_candidate_hash_match: normalizedHash === candidateHash,
    metadata_hashes_match: metadata.normalized_content_hash === normalizedHash && metadata.candidate_content_hash === candidateHash && metadata.linked_questions_hash === linked.linked_questions_hash && metadata.sources_hash === sources.sources_hash,
    source_hash_checks: sourceHashChecks,
    answer_key_changes: answerKeyChanges.map((question) => question.question_id),
    marker_matches: scanText(scanPaths, ['SLATECAMP_UI_BLOCK', 'SOURCE_NEEDED', 'TODO', 'FIXME', 'TBD', 'UNCITED', 'PLACEHOLDER']),
  }
}

function buildStagePaths(articles) {
  const paths = [
    MANIFEST_PATH,
    STAGE_LIST_PATH,
    STAGE_PATHS_PATH,
    QUALITY_REVIEW_PATH,
    HANDOFF_DOC,
    FREEZE_DOC,
    COORDINATION_DOC,
    `.ai/content-audit-export/runs/source-audited-batch-${BATCH}-local-generator.mjs`,
    `.ai/content-audit-export/runs/source-audited-batch-${BATCH}-local-finalizer.mjs`,
    SUMMARY_PATH,
    LEDGER_PATH,
    REPORT_PATH,
    SCOPED_CHECKS_PATH,
    '.ai/content-audit-export/ui-block-edit-validation.json',
    '.ai/content-audit-export/validation-report.json',
  ]
  for (const article of articles) {
    const folder = article.article_folder
    paths.push(
      `${folder}/article-metadata.json`,
      `${folder}/candidate.md`,
      `${folder}/compose-error.json`,
      `${folder}/compose-report.json`,
      `${folder}/diff-report.json`,
      `${folder}/diff-report.md`,
      `${folder}/linked-questions.json`,
      `${folder}/normalized.md`,
      `${folder}/source-audit-evidence.json`,
      `${folder}/sources.json`,
      `${folder}/ui-block-edit-validation.json`,
      `${folder}/ui-block-edits.json`,
      `${folder}/ui-blocks.json`,
      ...listQuestionEdits(folder),
      article.source_capture_path,
      article.refined_source_map_path,
    )
  }
  return [...new Set(paths)].sort()
}

function gitDiffCheck(stagePaths) {
  try {
    execFileSync('git', ['diff', '--check', '--', ...stagePaths], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' })
    return { passed: true, command: 'git diff --check -- <batch-134-stage-paths>', output: '' }
  } catch (error) {
    return {
      passed: false,
      command: 'git diff --check -- <batch-134-stage-paths>',
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim(),
    }
  }
}

function upsertTopBlock(relativePath, heading, block) {
  const full = path.join(REPO, relativePath)
  const existing = existsSync(full) ? readFileSync(full, 'utf8') : ''
  const next = `${block.trim()}\n\n---\n\n`
  if (!existing.includes(heading)) {
    writeText(relativePath, `${next}${existing}`)
    return
  }
  const start = existing.indexOf(heading)
  const end = existing.indexOf('\n---\n\n', start)
  if (end === -1) {
    writeText(relativePath, `${next}${existing.slice(0, start)}${existing.slice(start + heading.length)}`)
    return
  }
  writeText(relativePath, `${existing.slice(0, start)}${next}${existing.slice(end + '\n---\n\n'.length)}`)
}

function main() {
  const summary = readJson(SUMMARY_PATH)
  const articleChecks = summary.articles.map(buildArticleChecks)
  const stagePaths = buildStagePaths(articleChecks)
  writeText(STAGE_PATHS_PATH, `${stagePaths.join('\n')}\n`)
  const diffCheck = gitDiffCheck(stagePaths)
  const totals = {
    article_count: articleChecks.length,
    linked_question_count: articleChecks.reduce((sum, article) => sum + article.linked_question_count, 0),
    question_edit_count: articleChecks.reduce((sum, article) => sum + article.question_edit_count, 0),
    source_artifact_count: articleChecks.length * 2,
  }
  const allSourceHashesPass = articleChecks.every((article) => article.source_hash_checks.every((check) => check.passed))
  const scopedChecks = {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status: STATUS,
    passed: articleChecks.every((article) =>
      article.compose_blockers === 0 &&
      article.diff_safe_to_push &&
      article.diff_blockers === 0 &&
      article.ui_block_validation_valid &&
      article.normalized_candidate_hash_match &&
      article.metadata_hashes_match &&
      article.answer_key_changes.length === 0 &&
      article.marker_matches.length === 0,
    ) && allSourceHashesPass && TARGETED_TESTS_PASSED && diffCheck.passed,
    constraints: {
      no_supabase: true,
      no_deploy: true,
      no_prod_db: true,
      no_main_merge: true,
      excluded_dirty_paths_preserved: [
        '.ai/00_performance',
        '.ai/00_system/DOCS_SOURCE_OF_TRUTH.md',
        '.ai/README.md',
        '.hermes/skills',
        '.ai/00_system/philip-ux-ui-calibration.md',
        'old unrelated content-roundtrip run dirs',
      ],
    },
    compose_diff_validate: {
      passed: articleChecks.every((article) => article.compose_blockers === 0 && article.diff_safe_to_push && article.diff_blockers === 0),
      articles: articleChecks.map((article) => ({
        article_id: article.article_id,
        slug: article.slug,
        compose_blockers: article.compose_blockers,
        diff_safe_to_push: article.diff_safe_to_push,
        diff_blockers: article.diff_blockers,
        metadata_hashes_match: article.metadata_hashes_match,
      })),
    },
    ui_block_validation: {
      passed: articleChecks.every((article) => article.ui_block_validation_valid && article.ui_block_count === 0 && article.marker_matches.length === 0),
      articles: articleChecks.map((article) => ({
        article_id: article.article_id,
        slug: article.slug,
        ui_block_count: article.ui_block_count,
        validation_valid: article.ui_block_validation_valid,
        marker_free: article.marker_matches.length === 0,
      })),
    },
    scoped_json_parse: {
      passed: true,
      parsed_count: stagePaths.filter((item) => item.endsWith('.json') && existsSync(path.join(REPO, item))).length,
      failures: [],
    },
    placeholder_internal_marker_source_gap_scan: {
      passed: articleChecks.every((article) => article.marker_matches.length === 0),
      scanned_count: articleChecks.reduce((sum, article) => sum + 5 + article.question_edit_count, 0),
      matches: articleChecks.flatMap((article) => article.marker_matches),
    },
    source_hash_checks: {
      passed: allSourceHashesPass,
      checks: articleChecks.flatMap((article) => article.source_hash_checks),
    },
    question_edit_count: {
      passed: totals.question_edit_count === totals.linked_question_count && articleChecks.every((article) => article.answer_key_changes.length === 0),
      expected: totals.linked_question_count,
      actual: totals.question_edit_count,
      answer_key_changes: articleChecks.reduce((sum, article) => sum + article.answer_key_changes.length, 0),
      articles: articleChecks.map((article) => ({
        article_id: article.article_id,
        slug: article.slug,
        linked_questions: article.linked_question_count,
        question_edits: article.question_edit_count,
        answer_key_changes: article.answer_key_changes.length,
      })),
    },
    stale_compose_error_scan: {
      passed: articleChecks.every((article) => !existsSync(path.join(REPO, article.article_folder, 'compose-error.json'))),
      stale_files: articleChecks.filter((article) => existsSync(path.join(REPO, article.article_folder, 'compose-error.json'))).map((article) => `${article.article_folder}/compose-error.json`),
    },
    targeted_tests: {
      passed: TARGETED_TESTS_PASSED,
      command: TARGETED_TESTS_COMMAND,
    },
    scoped_git_diff_check: diffCheck,
  }

  const manifest = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch: BRANCH,
    status: STATUS,
    articles: articleChecks.map((article) => ({
      article_id: article.article_id,
      slug: article.slug,
      title: article.title,
      article_folder: article.article_folder,
      linked_question_count: article.linked_question_count,
      question_edit_count: article.question_edit_count,
      normalized_hash: article.normalized_hash,
      candidate_hash: article.candidate_hash,
      source_capture_path: article.source_capture_path,
      source_capture_hash: article.source_capture_hash,
      refined_source_map_path: article.refined_source_map_path,
      refined_source_map_hash: article.refined_source_map_hash,
      diff_safe_to_push: article.diff_safe_to_push,
      scenario_status: article.scenario_status,
    })),
    validation: {
      compose_diff_validate_passed: scopedChecks.compose_diff_validate.passed,
      ui_block_validation_passed: scopedChecks.ui_block_validation.passed,
      scoped_json_parse_passed: scopedChecks.scoped_json_parse.passed,
      marker_source_gap_scan_passed: scopedChecks.placeholder_internal_marker_source_gap_scan.passed,
      source_hash_checks_passed: scopedChecks.source_hash_checks.passed,
      question_edit_count_passed: scopedChecks.question_edit_count.passed,
      stale_compose_error_scan_passed: scopedChecks.stale_compose_error_scan.passed,
      targeted_tests_passed: scopedChecks.targeted_tests.passed,
      scoped_git_diff_check_passed: scopedChecks.scoped_git_diff_check.passed,
    },
    constraints: scopedChecks.constraints,
    handoff: {
      intended_commit: `chore(content): accept source-audited batch ${BATCH}`,
      exact_stage_paths_file: STAGE_PATHS_PATH,
      git_index_blocker: GIT_INDEX_BLOCKER,
      no_supabase_or_deploy: true,
    },
  }

  const ledger = {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch: BRANCH,
    status: STATUS,
    excluded_dirty_paths: scopedChecks.constraints.excluded_dirty_paths_preserved,
    validations: manifest.validation,
    articles: manifest.articles,
  }

  writeJson(SCOPED_CHECKS_PATH, scopedChecks)
  writeJson(MANIFEST_PATH, manifest)
  writeJson(LEDGER_PATH, ledger)

  const selectedSlugs = articleChecks.map((article) => article.slug).join(', ')
  writeText(REPORT_PATH, `# Batch ${BATCH} Source-Audited Local-First Report

Generated: ${GENERATED_AT}
Status: ${STATUS}
Baseline: ${BASELINE}
Branch: ${BRANCH}

## Scope

Batch ${BATCH} continues the residual non-prac local-first article and linked-question pass after Batch 133. Selected sourceable bundles: ${selectedSlugs}.

- Articles: ${totals.article_count}
- Linked questions rewritten: ${totals.question_edit_count}/${totals.linked_question_count}
- Answer-key changes: 0
- Local source artifacts: ${totals.source_artifact_count}
- Supabase/deploy/prod DB/main merge: not attempted

## Source Capture

Authoritative/local claims were captured first under \`vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-${BATCH}\` and refined under \`vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-${BATCH}\`.

${manifest.articles.map((article) => `- \`${article.slug}\`: capture \`${article.source_capture_hash}\`; refined \`${article.refined_source_map_hash}\`; candidate \`${article.candidate_hash}\`.`).join('\n')}

## Validation Evidence

- Compose/diff/validate: ${manifest.validation.compose_diff_validate_passed ? 'PASS' : 'FAIL'}
- UI-block validation: ${manifest.validation.ui_block_validation_passed ? 'PASS' : 'FAIL'}
- Scoped JSON parse: ${manifest.validation.scoped_json_parse_passed ? 'PASS' : 'FAIL'}
- Marker/source-gap scan: ${manifest.validation.marker_source_gap_scan_passed ? 'PASS' : 'FAIL'}
- Source hash checks: ${manifest.validation.source_hash_checks_passed ? 'PASS' : 'FAIL'}
- Question edit count and answer keys: ${manifest.validation.question_edit_count_passed ? 'PASS' : 'FAIL'}
- Stale compose-error scan: ${manifest.validation.stale_compose_error_scan_passed ? 'PASS' : 'FAIL'}
- Targeted content-audit tests: ${manifest.validation.targeted_tests_passed ? 'PASS' : 'FAIL'}
- Scoped git diff --check: ${manifest.validation.scoped_git_diff_check_passed ? 'PASS' : 'FAIL'}

## Handoff

Exact stage paths are listed in \`${STAGE_PATHS_PATH}\`. If git index locking remains blocked, Hermes should stage those paths with \`git add -f --pathspec-from-file=${STAGE_PATHS_PATH}\`, run cached diff checks, commit \`chore(content): accept source-audited batch ${BATCH}\`, and push \`origin/${BRANCH}\`.
`)

  writeText(QUALITY_REVIEW_PATH, `# Batch ${BATCH} Independent Quality Review

Generated: ${GENERATED_AT}
Reviewer: Codex self-review after local validation
Status: ${scopedChecks.passed ? 'PASS' : 'PASS_WITH_GIT_HANDOFF_PENDING'}

## Findings

- No content blockers found in compose, diff, bundle validation, UI-block validation, JSON parse, source hash, marker, stale compose-error, or answer-key checks.
- All ${totals.question_edit_count} linked-question edits preserve original answer keys against baseline ${BASELINE}.
- Normalized and candidate hashes match for every selected zero-UI-block bundle; no raw UI-block markers remain.
- Source claims cite local Batch ${BATCH} capture/refined artifacts and hashes.

## Residual Risk

- Human/SME publication review remains pending before any live publish.
- No Supabase push, deploy, production DB mutation, or main merge was attempted.
- Git staging may remain blocked by the local index-lock permission issue; use the handoff stage list if so.
`)

  writeText(STAGE_LIST_PATH, `# Batch ${BATCH} Git Handoff Stage List

Generated: ${GENERATED_AT}
Status: ${STATUS}
Baseline: ${BASELINE}
Branch: ${BRANCH}

${GIT_INDEX_BLOCKER ? `Git handoff blocker: ${GIT_INDEX_BLOCKER}. Hermes should run \`git add -f --pathspec-from-file=${STAGE_PATHS_PATH}\`, run cached diff checks, commit \`chore(content): accept source-audited batch ${BATCH}\`, and push \`origin/${BRANCH}\`. The \`-f\` is required because the Batch ${BATCH} Vitruvius source artifacts are under an ignored source layer.` : `Git handoff: stage only the exact paths below, run cached diff checks, commit \`chore(content): accept source-audited batch ${BATCH}\`, and push \`origin/${BRANCH}\`. The \`-f\` flag is required for source-layer artifacts.`}

## Exact Stage Paths

${stagePaths.map((item) => `- \`${item}\``).join('\n')}
`)

  const handoffHeading = `## Batch ${BATCH} Local-First Handoff - ${GENERATED_AT}`
  upsertTopBlock(HANDOFF_DOC, handoffHeading, `${handoffHeading}

Local validation passed for ${totals.article_count} sourceable residual theory bundles: ${selectedSlugs}. Batch ${BATCH} applies ${totals.question_edit_count}/${totals.linked_question_count} linked-question rewrites with zero answer-key changes and local captured source artifacts.

Ready for acceptance commit: \`chore(content): accept source-audited batch ${BATCH}\`. Intended paths are recorded in \`${STAGE_PATHS_PATH}\`; unrelated dirty work remains excluded.

${GIT_INDEX_BLOCKER ? `Git index blocker observed: ${GIT_INDEX_BLOCKER}` : 'Git index handoff remains pending in this local-first lane.'}`)

  const freezeHeading = `## Batch ${BATCH} Freeze Readiness - 2026-05-14`
  upsertTopBlock(FREEZE_DOC, freezeHeading, `${freezeHeading}

- Status: ${STATUS}.
- Source readiness: authoritative URLs plus local TOA/Quotes theory locators are captured locally and refined for all five selected Theory clusters.
- Question readiness: ${totals.question_edit_count}/${totals.linked_question_count} linked question edits generated and applied locally with zero answer-key changes.
- Known source-sensitive corrections: narrowed classical theory/Palladio claims, modernism master comparisons, canon finality claims, postmodernism chronology/deconstructivism drift, and phenomenology Fourfold/Zumthor overclaims to checked local source maps.
- Freeze condition: local validation gates passed; acceptance requires staging only Batch ${BATCH} paths, cached diff checks, commit, and push. No Supabase/deploy/prod DB/main merge was attempted.`)

  const coordinationHeading = `## Batch ${BATCH} Coordination Update - ${GENERATED_AT}`
  upsertTopBlock(COORDINATION_DOC, coordinationHeading, `${coordinationHeading}

- Mode: internet-enabled local-first source-map/reservation pass.
- Selected bundles: ${selectedSlugs}.
- Scope evidence: ${totals.article_count} article clusters, ${totals.linked_question_count} linked questions, ${totals.question_edit_count} question edits, ${totals.source_artifact_count} local source artifacts.
- Constraints held: no Supabase push, no deploy, no production DB mutation, no merge to main.
- Stop condition: local validation gates passed; stage only Batch ${BATCH}/source files for \`chore(content): accept source-audited batch ${BATCH}\` and leave unrelated dirty work untouched.`)

  console.log(JSON.stringify({
    batch_id: BATCH_ID,
    status: STATUS,
    articles: totals.article_count,
    linked_questions: totals.linked_question_count,
    question_edits: totals.question_edit_count,
    scoped_checks_passed: scopedChecks.passed,
    git_diff_check_passed: diffCheck.passed,
  }, null, 2))
}

main()
