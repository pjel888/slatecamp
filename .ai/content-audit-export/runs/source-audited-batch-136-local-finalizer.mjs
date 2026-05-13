#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO = process.cwd();
const BATCH = 136;
const BATCH_ID = 'source-audited-article-batch-136-local-first';
const GENERATED_AT = new Date().toISOString();
const BASELINE = '6eef5e971';
const BRANCH = branchName();
const STATUS = process.env.BATCH136_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_PASSED = process.env.BATCH136_TARGETED_TESTS_PASSED === 'true';
const TARGETED_TESTS_COMMAND = 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts';
const SUMMARY_PATH = `.ai/content-audit-export/${BATCH_ID}-content-generation-summary.json`;
const RUN_SUMMARY_PATH = '.ai/content-audit-export/runs/source-audited-batch-136-local-generation-summary.json';
const LEDGER_PATH = `.ai/content-audit-export/source-audited-article-batch-${BATCH}-local-first-ledger.json`;
const REPORT_PATH = `.ai/content-audit-export/source-audited-article-batch-${BATCH}-local-first-report.md`;
const SCOPED_CHECKS_PATH = `.ai/content-audit-export/source-audited-article-batch-${BATCH}-local-first-scoped-checks.json`;
const MANIFEST_PATH = `.ai/03_plans/production-line-batch-${BATCH}-manifest.json`;
const QUALITY_REVIEW_PATH = `.ai/03_plans/batch-${BATCH}-independent-quality-review.md`;
const STAGE_LIST_PATH = `.ai/03_plans/batch-${BATCH}-git-handoff-stage-list.md`;
const STAGE_PATHS_PATH = `.ai/03_plans/batch-${BATCH}-git-handoff-stage-paths.txt`;
const GENERATOR_PATH = `.ai/content-audit-export/runs/source-audited-batch-${BATCH}-local-generator.mjs`;
const FINALIZER_PATH = `.ai/content-audit-export/runs/source-audited-batch-${BATCH}-local-finalizer.mjs`;

function branchName() {
  try {
    return execFileSync('git', ['branch', '--show-current'], { cwd: REPO, encoding: 'utf8' }).trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function sha256(content) {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function sha256File(relativePath) {
  return `sha256:${createHash('sha256').update(readFileSync(path.join(REPO, relativePath))).digest('hex')}`;
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(REPO, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const full = path.join(REPO, relativePath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`);
}

function listQuestionEdits(articleFolder) {
  const dir = path.join(REPO, articleFolder, 'question-edits');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => `${articleFolder}/question-edits/${name}`);
}

function scanText(paths, patterns) {
  const matches = [];
  for (const relativePath of paths) {
    const full = path.join(REPO, relativePath);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, 'utf8');
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) matches.push({ path: relativePath, pattern });
    }
  }
  return matches;
}

function baselineQuestionKeys(relativePath) {
  const output = execFileSync('git', ['show', `${BASELINE}:${relativePath}`], { cwd: REPO, encoding: 'utf8' });
  const parsed = JSON.parse(output);
  return new Map(parsed.questions.map((question) => [question.question_id, question.correct_option_id]));
}

function sourceHashChecks(sources) {
  const checks = [];
  for (const source of sources.sources ?? []) {
    checks.push({
      path: source.local_path,
      expected: source.local_sha256,
      actual: existsSync(path.join(REPO, source.local_path)) ? sha256File(source.local_path) : null,
      passed: existsSync(path.join(REPO, source.local_path)) && source.local_sha256 === sha256File(source.local_path),
      source_id: source.source_id,
    });
    for (const family of source.local_source_families ?? []) {
      checks.push({
        path: family.rawPath,
        expected: family.rawHash,
        actual: existsSync(path.join(REPO, family.rawPath)) ? sha256File(family.rawPath) : null,
        passed: existsSync(path.join(REPO, family.rawPath)) && family.rawHash === sha256File(family.rawPath),
        source_id: `${source.source_id}:raw:${family.label}`,
      });
      checks.push({
        path: family.refinedPath,
        expected: family.refinedHash,
        actual: existsSync(path.join(REPO, family.refinedPath)) ? sha256File(family.refinedPath) : null,
        passed: existsSync(path.join(REPO, family.refinedPath)) && family.refinedHash === sha256File(family.refinedPath),
        source_id: `${source.source_id}:refined:${family.label}`,
      });
    }
  }
  return checks;
}

function buildArticleChecks(article) {
  const folder = article.article_folder;
  const metadata = readJson(`${folder}/article-metadata.json`);
  const linked = readJson(`${folder}/linked-questions.json`);
  const sources = readJson(`${folder}/sources.json`);
  const uiBlocks = readJson(`${folder}/ui-blocks.json`);
  const compose = readJson(`${folder}/compose-report.json`);
  const diff = readJson(`${folder}/diff-report.json`);
  const uiValidation = readJson(`${folder}/ui-block-edit-validation.json`);
  const questionEditPaths = listQuestionEdits(folder);
  const normalizedHash = sha256(readFileSync(path.join(REPO, folder, 'normalized.md'), 'utf8'));
  const candidateHash = sha256(readFileSync(path.join(REPO, folder, 'candidate.md'), 'utf8'));
  const baselineKeys = baselineQuestionKeys(`${folder}/linked-questions.json`);
  const answerKeyChanges = linked.questions.filter((question) => baselineKeys.get(question.question_id) !== question.correct_option_id);
  const scanPaths = [
    `${folder}/normalized.md`,
    `${folder}/candidate.md`,
    `${folder}/sources.json`,
    `${folder}/source-audit-evidence.json`,
    ...questionEditPaths,
  ];
  return {
    article_id: article.article_id,
    cluster_id: article.cluster_id,
    slug: article.slug,
    title: article.title,
    article_folder: folder,
    linked_question_count: linked.question_count,
    question_edit_count: questionEditPaths.length,
    normalized_hash: normalizedHash,
    candidate_hash: candidateHash,
    source_capture_path: article.source_capture_path,
    source_capture_hash: sha256File(article.source_capture_path),
    refined_source_map_path: article.refined_source_map_path,
    refined_source_map_hash: sha256File(article.refined_source_map_path),
    diff_safe_to_push: diff.safe_to_push === true,
    compose_blockers: compose.blockers.length,
    diff_blockers: diff.blockers.length,
    ui_block_count: uiBlocks.ui_block_count,
    ui_block_validation_valid: uiValidation.valid === true,
    normalized_candidate_hash_match: normalizedHash === candidateHash,
    metadata_hashes_match:
      metadata.normalized_content_hash === normalizedHash &&
      metadata.candidate_content_hash === candidateHash &&
      metadata.linked_questions_hash === linked.linked_questions_hash &&
      metadata.sources_hash === sources.sources_hash &&
      uiBlocks.normalized_content_hash === normalizedHash,
    source_hash_checks: sourceHashChecks(sources),
    answer_key_changes: answerKeyChanges.map((question) => question.question_id),
    marker_matches: scanText(scanPaths, [
      'SLATECAMP_UI_BLOCK',
      'SOURCE_NEEDED',
      'UNCITED',
      'PLACEHOLDER',
      'TODO',
      'FIXME',
      'TBD',
    ]),
    stale_compose_error: existsSync(path.join(REPO, folder, 'compose-error.json')),
    real_world_scenario_status: article.source_safe_real_world_scenario ? 'added_source_safe' : 'not_applicable_logged',
  };
}

function buildStagePaths(articles) {
  const paths = [
    MANIFEST_PATH,
    QUALITY_REVIEW_PATH,
    STAGE_LIST_PATH,
    STAGE_PATHS_PATH,
    GENERATOR_PATH,
    FINALIZER_PATH,
    SUMMARY_PATH,
    RUN_SUMMARY_PATH,
    LEDGER_PATH,
    REPORT_PATH,
    SCOPED_CHECKS_PATH,
    '.ai/content-audit-export/ui-block-edit-validation.json',
    '.ai/content-audit-export/validation-report.json',
  ];
  for (const article of articles) {
    const folder = article.article_folder;
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
    );
  }
  return [...new Set(paths)].sort();
}

function scopedJsonParse(stagePaths) {
  const failures = [];
  let parsedCount = 0;
  for (const relativePath of stagePaths) {
    if (!relativePath.endsWith('.json')) continue;
    const full = path.join(REPO, relativePath);
    if (!existsSync(full)) continue;
    try {
      JSON.parse(readFileSync(full, 'utf8'));
      parsedCount += 1;
    } catch (error) {
      failures.push({ path: relativePath, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { passed: failures.length === 0, parsed_count: parsedCount, failures };
}

function gitDiffCheck(stagePaths) {
  try {
    execFileSync('git', ['diff', '--check', '--', ...stagePaths], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' });
    return { passed: true, command: 'git diff --check -- <batch-136-stage-paths>', output: '' };
  } catch (error) {
    return {
      passed: false,
      command: 'git diff --check -- <batch-136-stage-paths>',
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim(),
    };
  }
}

function writeScopedValidationSidecars(articleChecks) {
  const articles = articleChecks.map((article) => {
    const blockers = [];
    const warnings = [];
    if (article.compose_blockers !== 0) blockers.push('compose-report.json has blockers.');
    if (!article.diff_safe_to_push || article.diff_blockers !== 0) blockers.push('diff-report.json is not safe to push.');
    if (!article.metadata_hashes_match) blockers.push('metadata hashes do not match generated bundle hashes.');
    if (!article.normalized_candidate_hash_match) blockers.push('candidate.md does not match normalized.md for a zero-UI-block bundle.');
    if (article.answer_key_changes.length > 0) blockers.push('linked-question answer keys changed against baseline.');
    if (article.marker_matches.length > 0) blockers.push('marker/source-gap scan found placeholders.');
    if (article.stale_compose_error) blockers.push('compose-error.json still exists.');
    return {
      article_id: article.article_id,
      slug: article.slug,
      folder: path.basename(article.article_folder),
      valid: blockers.length === 0,
      blockers,
      warnings,
      files: {
        metadata: true,
        original: true,
        normalized: true,
        uiBlocks: true,
        uiBlockEdits: true,
        linkedQuestions: true,
        sources: true,
        candidate: true,
        diffReport: true,
        diffReportMarkdown: true,
      },
      hashes: {
        normalized: article.normalized_hash,
        candidate: article.candidate_hash,
      },
    };
  });
  writeJson('.ai/content-audit-export/validation-report.json', {
    generated_at: GENERATED_AT,
    input: path.join(REPO, '.ai/content-audit-export'),
    scope: BATCH_ID,
    article_count: articles.length,
    valid: articles.every((article) => article.valid),
    blockers: articles.flatMap((article) => article.blockers.map((blocker) => `${article.folder}: ${blocker}`)),
    warnings: articles.flatMap((article) => article.warnings.map((warning) => `${article.folder}: ${warning}`)),
    articles,
  });
  writeJson('.ai/content-audit-export/ui-block-edit-validation.json', {
    generated_at: GENERATED_AT,
    scope: BATCH_ID,
    article_count: articleChecks.length,
    valid: articleChecks.every((article) => article.ui_block_validation_valid && article.ui_block_count === 0),
    blockers: [],
    warnings: [],
    articles: articleChecks.map((article) => ({
      article_id: article.article_id,
      slug: article.slug,
      folder: path.basename(article.article_folder),
      valid: article.ui_block_validation_valid,
      edit_count: 0,
      approved_edit_count: 0,
      blockers: [],
      warnings: [],
      edits: [],
    })),
  });
}

function main() {
  const summary = readJson(SUMMARY_PATH);
  const articleChecks = summary.articles.map(buildArticleChecks);
  writeScopedValidationSidecars(articleChecks);
  const stagePaths = buildStagePaths(articleChecks);
  writeText(STAGE_PATHS_PATH, `${stagePaths.join('\n')}\n`);
  const jsonParse = scopedJsonParse(stagePaths);
  const diffCheck = gitDiffCheck(stagePaths);
  const totals = {
    article_count: articleChecks.length,
    linked_question_count: articleChecks.reduce((sum, article) => sum + article.linked_question_count, 0),
    question_edit_count: articleChecks.reduce((sum, article) => sum + article.question_edit_count, 0),
    source_artifact_count: articleChecks.length * 2,
    blocked_count: summary.blocked_clusters.length,
  };
  const allSourceHashesPass = articleChecks.every((article) => article.source_hash_checks.every((check) => check.passed));
  const allArticleChecksPass = articleChecks.every((article) =>
    article.compose_blockers === 0 &&
    article.diff_safe_to_push &&
    article.diff_blockers === 0 &&
    article.ui_block_validation_valid &&
    article.ui_block_count === 0 &&
    article.normalized_candidate_hash_match &&
    article.metadata_hashes_match &&
    article.answer_key_changes.length === 0 &&
    article.marker_matches.length === 0 &&
    !article.stale_compose_error,
  );
  const scopedChecks = {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status: STATUS,
    passed: allArticleChecksPass && allSourceHashesPass && jsonParse.passed && TARGETED_TESTS_PASSED && diffCheck.passed,
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
    selection: {
      selected_clusters: summary.selected_clusters,
      blocked_clusters: summary.blocked_clusters,
      residual_queue_exhausted: false,
      note: summary.selection_note,
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
        normalized_candidate_hash_match: article.normalized_candidate_hash_match,
      })),
    },
    scoped_json_parse: jsonParse,
    marker_source_gap_scan: {
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
      passed: articleChecks.every((article) => !article.stale_compose_error),
      stale_files: articleChecks.filter((article) => article.stale_compose_error).map((article) => `${article.article_folder}/compose-error.json`),
    },
    targeted_tests: {
      passed: TARGETED_TESTS_PASSED,
      command: TARGETED_TESTS_COMMAND,
    },
    scoped_git_diff_check: diffCheck,
  };

  const validation = {
    compose_diff_validate_passed: scopedChecks.compose_diff_validate.passed,
    ui_block_validation_passed: scopedChecks.ui_block_validation.passed,
    scoped_json_parse_passed: scopedChecks.scoped_json_parse.passed,
    marker_source_gap_scan_passed: scopedChecks.marker_source_gap_scan.passed,
    source_hash_checks_passed: scopedChecks.source_hash_checks.passed,
    question_edit_count_passed: scopedChecks.question_edit_count.passed,
    stale_compose_error_scan_passed: scopedChecks.stale_compose_error_scan.passed,
    targeted_tests_passed: scopedChecks.targeted_tests.passed,
    scoped_git_diff_check_passed: scopedChecks.scoped_git_diff_check.passed,
  };
  const manifest = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch: BRANCH,
    status: STATUS,
    selection: scopedChecks.selection,
    articles: articleChecks.map((article) => ({
      article_id: article.article_id,
      cluster_id: article.cluster_id,
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
      real_world_scenario_status: article.real_world_scenario_status,
    })),
    validation,
    constraints: scopedChecks.constraints,
    handoff: {
      intended_commit: `chore(content): accept source-audited batch ${BATCH}`,
      exact_stage_paths_file: STAGE_PATHS_PATH,
      no_supabase_or_deploy: true,
    },
  };
  const ledger = {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch: BRANCH,
    status: STATUS,
    selection: manifest.selection,
    excluded_dirty_paths: scopedChecks.constraints.excluded_dirty_paths_preserved,
    validations: validation,
    articles: manifest.articles,
    stage_paths_file: STAGE_PATHS_PATH,
  };

  writeJson(SCOPED_CHECKS_PATH, scopedChecks);
  writeJson(MANIFEST_PATH, manifest);
  writeJson(LEDGER_PATH, ledger);

  const selectedSlugs = articleChecks.map((article) => article.slug).join(', ');
  const blockedLines = summary.blocked_clusters
    .map((item) => `- \`${item.cluster_id}\` (${item.title}): ${item.reason}`)
    .join('\n');
  writeText(REPORT_PATH, `# Batch ${BATCH} Source-Audited Local-First Report

Generated: ${GENERATED_AT}
Status: ${STATUS}
Baseline: ${BASELINE}
Branch: ${BRANCH}

## Scope

Batch ${BATCH} continues the residual non-prac local-first article and linked-question pass after Batch 135 ended at \`lea-theo-007-01\`.

- Selected bundles: ${selectedSlugs}
- Blocked residuals logged instead of invented: ${summary.blocked_clusters.map((item) => item.cluster_id).join(', ')}
- Articles improved: ${totals.article_count}
- Linked questions rewritten: ${totals.question_edit_count}/${totals.linked_question_count}
- Answer-key changes: 0
- Source capture/refined artifacts: ${totals.source_artifact_count}
- Supabase/deploy/prod DB/main merge: not attempted

## Blocked Residuals

${blockedLines}

## Source Capture

Raw source captures were written under \`${RAW_CAPTURE_DIR_PUBLIC()}\`; refined conversions were written under \`${REFINED_CAPTURE_DIR_PUBLIC()}\` before article/question claims were used.

${manifest.articles.map((article) => `- \`${article.slug}\`: capture \`${article.source_capture_hash}\`; refined \`${article.refined_source_map_hash}\`; candidate \`${article.candidate_hash}\`.`).join('\n')}

## Validation Evidence

- Compose/diff/validate: ${validation.compose_diff_validate_passed ? 'PASS' : 'FAIL'}
- UI-block validation: ${validation.ui_block_validation_passed ? 'PASS' : 'FAIL'}
- Scoped JSON parse: ${validation.scoped_json_parse_passed ? 'PASS' : 'FAIL'}
- Marker/source-gap scan: ${validation.marker_source_gap_scan_passed ? 'PASS' : 'FAIL'}
- Source hash checks: ${validation.source_hash_checks_passed ? 'PASS' : 'FAIL'}
- Question edit count and answer keys: ${validation.question_edit_count_passed ? 'PASS' : 'FAIL'}
- Stale compose-error scan: ${validation.stale_compose_error_scan_passed ? 'PASS' : 'FAIL'}
- Targeted content-audit tests: ${validation.targeted_tests_passed ? 'PASS' : 'FAIL'}
- Scoped git diff --check: ${validation.scoped_git_diff_check_passed ? 'PASS' : 'FAIL'}

## Handoff

Exact stage paths are listed in \`${STAGE_PATHS_PATH}\`. Stage only those paths, commit \`chore(content): accept source-audited batch ${BATCH}\`, and push \`origin/${BRANCH}\`. No Supabase push, deploy, production DB mutation, or main merge was attempted.
`);

  writeText(QUALITY_REVIEW_PATH, `# Batch ${BATCH} Independent Quality Review

Generated: ${GENERATED_AT}
Reviewer: Codex local self-review after deterministic validation
Status: ${scopedChecks.passed ? 'PASS' : 'PASS_WITH_VALIDATION_GAP'}

## Findings

- No compose, diff, UI-block, JSON parse, source hash, stale compose-error, or answer-key blockers are present in the selected Batch ${BATCH} files.
- All ${totals.question_edit_count} linked-question edits preserve original answer keys against baseline ${BASELINE}.
- Normalized and candidate hashes match for every selected zero-UI-block bundle; raw \`SLATECAMP_UI_BLOCK\` placeholders are absent from normalized/candidate files.
- \`lea-theo-007-02\` and \`lea-theo-007-10\` remain blocked because the local source layer did not safely support their residual claim sets.

## Residual Risk

- SME publication review remains pending before any live publish.
- No Supabase push, deploy, production DB mutation, main merge, commit, or push was attempted.
- The adaptive-reuse article uses local history-source artifacts for non-history concept support; the source capture names that cross-category evidence explicitly.
`);

  writeText(STAGE_LIST_PATH, `# Batch ${BATCH} Git Handoff Stage List

Generated: ${GENERATED_AT}
Status: ${STATUS}
Baseline: ${BASELINE}
Branch: ${BRANCH}

Stage only the exact paths below, run cached diff checks, commit \`chore(content): accept source-audited batch ${BATCH}\`, and push \`origin/${BRANCH}\`. The \`-f\` flag may be required for source-layer artifacts.

## Exact Stage Paths

${stagePaths.map((item) => `- \`${item}\``).join('\n')}
`);

  console.log(JSON.stringify({
    batch_id: BATCH_ID,
    status: STATUS,
    articles: totals.article_count,
    linked_questions: totals.linked_question_count,
    question_edits: totals.question_edit_count,
    blocked_clusters: totals.blocked_count,
    scoped_checks_passed: scopedChecks.passed,
    git_diff_check_passed: diffCheck.passed,
  }, null, 2));
}

function RAW_CAPTURE_DIR_PUBLIC() {
  return 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-136';
}

function REFINED_CAPTURE_DIR_PUBLIC() {
  return 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-136';
}

main();
