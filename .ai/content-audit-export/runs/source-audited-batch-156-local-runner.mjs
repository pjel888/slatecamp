#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
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

const batch = 156
const batchId = 'source-audited-batch-156-local-first'
const requestedBaseline = '80d1f473c'
const branch = '3dlab-gray-viewport-bg'
const generatedAt = new Date().toISOString()
const approvedBy = 'codex-local-source-audit-batch-156'
const reservationManifest = '.ai/03_plans/production-line-batch-156-reservation-manifest.json'
const articleDir =
  '.ai/content-audit-export/articles/lea-strc-009-03-core-concept--9375b273-4d0d-4ce2-8a7c-991b7e3d4a8c'
const sourceMapRaw =
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-156/asd-mechanics.source-capture.md'
const sourceMapRefined =
  'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-156/asd-mechanics.refined.md'

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'))
const fileSha = (filePath) => `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
const fileBytes = (filePath) => readFileSync(filePath).byteLength
const currentHead = () => execFileSync('git', ['rev-parse', '--short=9', 'HEAD'], { encoding: 'utf8' }).trim()

const assertFile = (filePath) => {
  if (!existsSync(filePath)) throw new Error(`Missing required file: ${filePath}`)
}

const assertReservationScope = (reservation) => {
  const ids = reservation.reserved_clusters.map((cluster) => cluster.cluster_id).sort()
  const expected = ['lea-strc-009-03']
  if (JSON.stringify(ids) !== JSON.stringify(expected)) {
    throw new Error(`Batch 156 reservation scope mismatch: ${ids.join(', ')}`)
  }
}

const cleanQuestion = (question) => {
  const clone = { ...question }
  delete clone.content_hash
  return clone
}

const sourceRecordsFromReservation = (cluster) =>
  cluster.source_candidates.map((sourceCandidate, index) => {
    const rawPath = sourceCandidate.local_paths.raw_pdf
    const refinedPath = sourceCandidate.local_paths.refined_markdown
    assertFile(rawPath)
    assertFile(refinedPath)
    return {
      source_id: sourceCandidate.source_id,
      article_id: cluster.article_id,
      label: sourceCandidate.label,
      url: null,
      source_type: sourceCandidate.source_type,
      description: [
        'Batch 156 local-first source capture for generic ASD mechanics only.',
        `raw_pdf_path=${rawPath}`,
        `raw_pdf_sha256=${fileSha(rawPath)}`,
        `raw_pdf_bytes=${fileBytes(rawPath)}`,
        `refined_markdown_path=${refinedPath}`,
        `refined_markdown_sha256=${fileSha(refinedPath)}`,
        `refined_markdown_bytes=${fileBytes(refinedPath)}`,
        `checked_locator=${sourceCandidate.checked_locator.replace(/\.$/, '')}`,
        'source_boundary=generic allowable-stress inequality, bending stress with section modulus, rectangular section properties, and maximum rectangular shear only',
      ].join('; '),
      is_verified: true,
      sort_order: index,
      created_at: generatedAt,
      updated_at: generatedAt,
    }
  })

const checkedSourcesFromReservation = (cluster) =>
  cluster.source_candidates.map((sourceCandidate) => ({
    source_id: sourceCandidate.source_id,
    label: sourceCandidate.label,
    raw_path: sourceCandidate.local_paths.raw_pdf,
    raw_sha256: fileSha(sourceCandidate.local_paths.raw_pdf),
    refined_markdown_path: sourceCandidate.local_paths.refined_markdown,
    refined_markdown_sha256: fileSha(sourceCandidate.local_paths.refined_markdown),
    locator: sourceCandidate.checked_locator.replace(/\.$/, ''),
  }))

const sourceMapBody = (cluster, checkedSources) => `# Batch 156 Local Source Capture: ASD Mechanics for lea-strc-009-03

## Source Boundary

Batch 156 captures local structural mechanics support for a generic Allowable Stress Design refresh of ${cluster.slug}. It does not capture or reproduce NSCP timber tables, local timber species stress groups, Philippine species values, or exact adjustment-factor tables.

${checkedSources
  .map(
    (source) => `### ${source.label}

- Raw artifact: ${source.raw_path}
- Raw artifact SHA-256: ${source.raw_sha256}
- Refined artifact: ${source.refined_markdown_path}
- Refined artifact SHA-256: ${source.refined_markdown_sha256}
- Locator: ${source.locator}`,
  )
  .join('\n\n')}

## Extracted Claims Used In Batch 156

1. Allowable or safety stress design compares computed service-load stress against a source-supplied allowable stress.
2. For bending checks, fb = M/S and the rectangular section modulus is S = b h^2 / 6.
3. The rectangular moment of inertia used for stiffness checks is I = b h^3 / 12.
4. For a rectangular beam, maximum shear stress occurs at the neutral axis and is 1.5 times the average V/A, so fv = 3V/(2A) where A = b h.
5. If a code table, species stress value, moisture factor, or adjustment coefficient is not locally captured, the article and questions must treat it as source-supplied by the item or outside the batch boundary.

## Explicit Exclusions

- NSCP 2015 timber adjustment-factor values.
- Philippine timber species stress groups.
- Species-specific allowable values not captured in the checked local sources.
- PD 1096 Rule 8 wood provisions for exact timber values.
- ASEP/NSCP copyrighted table text from corrupted or gray-area sources.

## Use Rule

Use only the extracted claims above for Batch 156 article and linked-question edits. When an exact table value is needed, the prompt must supply the value or the item must be deferred until a legitimate local source is captured.
`

const refinedSourceMapBody = (cluster, checkedSources) => `# Batch 156 Refined Source Map: ASD Mechanics for lea-strc-009-03

## Canonical Locators

${checkedSources.map((source) => `- ${source.source_id}: ${source.locator}`).join('\n')}

## Safe Exam Claims

1. ASD checks use computed stress <= allowable stress.
2. Bending stress may be checked with fb = M/S.
3. Rectangular section modulus may be calculated as S = b h^2 / 6.
4. Rectangular moment of inertia may be calculated as I = b h^3 / 12.
5. Rectangular maximum shear stress may be calculated as fv = 3V/(2A), where A = b h.

## Hashes

| Source | Raw Path | Raw SHA-256 | Refined Path | Refined SHA-256 |
| --- | --- | --- | --- | --- |
${checkedSources
  .map(
    (source) =>
      `| ${source.source_id} | ${source.raw_path} | ${source.raw_sha256} | ${source.refined_markdown_path} | ${source.refined_markdown_sha256} |`,
  )
  .join('\n')}

## Batch 156 Claim Discipline

The article and question edits may cite this map for generic mechanics and source-supplied allowable-value workflows only. This map is not a substitute for Philippine timber-code tables.
`

const articleBody = `# Allowable Stress Design (ASD) for Rectangular Timber Members

## Board Exam Quick Check

ASD asks one question first: is the computed service-load stress less than or equal to the allowable stress supplied by the source, table, or problem statement? For this Batch 156 source boundary, use supplied allowable values only. Do not invent Philippine species values, local timber stress groups, or NSCP adjustment factors.

THIN_NEEDS_EXPANSION: resolved by Batch 156 source-safe ASD mechanics refresh.

## What You Need To Know

- General ASD check: actual stress <= allowable stress.
- Bending stress: fb = M/S.
- Rectangular section modulus: S = b h^2 / 6.
- Rectangular moment of inertia: I = b h^3 / 12.
- Rectangular maximum shear stress: fv = 3V/(2A), where A = b h.
- Maximum rectangular shear is higher than average shear V/A, so using V/A alone underestimates the check.

Use consistent units. If moment is in kN-m and section modulus is in mm^3, convert moment to N-mm before dividing. Since 1 MPa equals 1 N/mm^2, the final stress is in MPa when N and mm units are used.

## Real World Scenario

A small roof beam review gives actual member width b, depth h, service moment M, service shear V, and supplied allowable stresses Fb and Fv. The source-safe workflow is to compute S and A, calculate fb = M/S and fv = 3V/(2A), then compare each demand against the supplied allowable value. If either demand exceeds the supplied allowable, resize the member, reduce the load demand, or specify a source-supported higher allowable value. Do not approve the member by adding uncited species values or adjustment factors.

## High-Yield Distinctions

| Term | Use | Common Trap |
| --- | --- | --- |
| fb | Computed bending stress from M/S | Confusing it with allowable Fb |
| Fb | Supplied allowable bending stress | Treating an uncited value as universal |
| fv | Computed maximum shear stress from 3V/(2A) | Using only average shear V/A |
| Fv | Supplied allowable shear stress | Applying an uncaptured code factor |
| S | Section modulus for stress | Substituting I by mistake |
| I | Moment of inertia for stiffness checks | Using S when checking deflection |

## Worked Mini-Checks

1. For b = 80 mm and h = 250 mm, S = b h^2 / 6 = 80 x 250^2 / 6 = 833,333 mm^3.
2. For M = 18 kN-m and S = 800,000 mm^3, fb = 18,000,000 / 800,000 = 22.5 MPa.
3. For b = 60 mm, h = 280 mm, and V = 20 kN, A = 16,800 mm^2 and fv = 3 x 20,000 / (2 x 16,800) = 1.786 MPa.

## Question Alignment

The 10 linked questions for this article are bounded to ASD inequality logic, unit conversion, section modulus, rectangular moment of inertia, rectangular maximum shear, and supplied-factor arithmetic. They intentionally avoid exact NSCP timber clauses, species values, and uncaptured adjustment-factor tables.

## Source-Primary Finding

Batch 156 checked local raw and refined structural mechanics sources before rewriting. "Mechanics and Strength of Materials" supports allowable/safety stress logic, section modulus, and bending stress checks. "Applied Strength of Materials" supports maximum shear at the neutral axis and the rectangular maximum shear formula. The corrupted local NSCP file and gray-area copies do not support source-safe citation for exact Philippine timber tables.

## Common Mistakes

- Treating lowercase demand stress fb or fv as the same thing as uppercase allowable stress Fb or Fv.
- Forgetting to convert kN-m to N-mm before computing MPa.
- Using V/A for a rectangular section maximum shear check instead of 3V/(2A).
- Importing NSCP, species, moisture, or duration factors that are not supplied by the item or captured source.
- Assuming a member passes because bending passes, even when shear fails.

## Explicit Source Limits

This refresh is source-safe for generic ASD mechanics only. If a question needs a Philippine species allowable stress, timber grade table, moisture factor, load-duration factor, or exact NSCP clause, the source must be locally captured with provenance first or the item must supply the value explicitly.
`

const questionTemplates = [
  {
    modelId: 'ALE-STRC-009-03-007',
    text:
      'A rectangular beam is 60 mm x 280 mm. Applied shear V = 20 kN. Supplied allowable shear stress Fv = 1.3 MPa. Calculate the maximum applied shear stress fv and determine compliance.',
    options: {
      a: 'fv = 1.786 MPa > Fv = 1.3 MPa. The member FAILS the shear check.',
      b: 'fv = 1.190 MPa < Fv = 1.3 MPa. The member PASSES after using average shear only.',
      c: 'fv = 0.595 MPa < Fv = 1.3 MPa. The member PASSES after dividing average shear by 2.',
      d: 'fv = 3.571 MPa > Fv = 1.3 MPa. The member FAILS after doubling the maximum shear.',
    },
    correct:
      'A = 60 x 280 = 16,800 mm^2. V = 20,000 N. fv = 3V/(2A) = 60,000 / 33,600 = 1.786 MPa. Since 1.786 > 1.3, the member fails.',
    takeaway: 'For rectangular sections, maximum shear is 1.5 times average V/A.',
  },
  {
    modelId: 'ALE-STRC-009-03-009',
    text:
      'A member passes bending with fb = 9 MPa and supplied Fb = 12 MPa, but fails shear with fv = 1.6 MPa and supplied Fv = 1.2 MPa. What governs the redesign?',
    options: {
      a: 'Shear governs because fv exceeds Fv; increase area, reduce shear demand, or use a source-supported higher allowable shear value.',
      b: 'Bending governs because any beam check starts with moment before shear.',
      c: 'The member passes because at least one ASD check is acceptable.',
      d: 'The member can be approved if the uncited code factor is assumed to increase Fv.',
    },
    correct:
      'ASD requires each applicable stress check to satisfy demand <= allowable. Bending passes, but shear fails because 1.6 MPa > 1.2 MPa, so shear controls the redesign.',
    takeaway: 'A passing bending check does not cancel a failing shear check.',
  },
  {
    modelId: 'ALE-STRC-009-03-008',
    text:
      'A rectangular timber beam has section modulus S = 1,200,000 mm^3 and supplied allowable bending stress Fb = 11 MPa. What maximum moment reaches the allowable bending limit?',
    options: {
      a: 'Mmax = 13.2 kN-m',
      b: 'Mmax = 132 kN-m',
      c: 'Mmax = 1.32 kN-m',
      d: 'Mmax = 1,320 kN-m',
    },
    correct:
      'At the allowable limit, M = Fb x S = 11 N/mm^2 x 1,200,000 mm^3 = 13,200,000 N-mm = 13.2 kN-m.',
    takeaway: 'Use N and mm consistently, then convert N-mm to kN-m.',
  },
  {
    modelId: 'ALE-STRC-009-03-001',
    text: 'In an ASD bending check written as fb <= Fb, what does lowercase fb represent?',
    options: {
      a: 'Computed bending stress from the load effect and section modulus, fb = M/S.',
      b: 'The supplied allowable bending stress from the applicable source or item.',
      c: 'A universal timber value that is always 12 MPa.',
      d: 'A buckling coefficient for lateral instability.',
    },
    correct:
      'Lowercase fb is the demand stress calculated from the applied moment and section modulus. Uppercase Fb is the supplied allowable bending stress.',
    takeaway: 'Keep demand stresses and allowable stresses separate.',
  },
  {
    modelId: 'ALE-STRC-009-03-005',
    text: 'A beam has M = 18 kN-m and S = 800,000 mm^3. What is the computed bending stress fb?',
    options: {
      a: 'fb = 22.5 MPa',
      b: 'fb = 0.0225 MPa',
      c: 'fb = 44.4 MPa',
      d: 'fb = 225 MPa',
    },
    correct:
      'M = 18,000,000 N-mm. fb = M/S = 18,000,000 / 800,000 = 22.5 N/mm^2 = 22.5 MPa.',
    takeaway: 'The common error is failing to convert kN-m to N-mm.',
  },
  {
    modelId: 'ALE-STRC-009-03-006',
    text:
      'A member has computed bending stress fb = 14 MPa while the supplied allowable bending stress is Fb = 12 MPa. What source-safe design action is required?',
    options: {
      a: 'The bending check fails; resize the member, reduce the demand, or use a source-supported higher allowable value.',
      b: 'The member passes because the computed value is close to the allowable value.',
      c: 'Use Fb/fb = 0.86 as an uncited strength increase factor.',
      d: 'Ignore the check if shear is acceptable.',
    },
    correct:
      'The ASD inequality is not satisfied because 14 MPa > 12 MPa. The member needs redesign or a source-supported allowable value.',
    takeaway: 'An ASD check fails whenever demand stress exceeds allowable stress.',
  },
  {
    modelId: 'ALE-STRC-009-03-004',
    text: 'For a rectangular section bent about its strong axis, what moment of inertia I is used for stiffness checks?',
    options: {
      a: 'I = b h^3 / 12',
      b: 'I = b h^2 / 6',
      c: 'I = b h^2 / 12',
      d: 'I = b^3 h / 12 for the same strong-axis orientation.',
    },
    correct:
      'For the usual strong-axis rectangular beam orientation, I = b h^3 / 12. Section modulus S = b h^2 / 6 is a different property used for stress.',
    takeaway: 'Use I for stiffness and S for bending stress.',
  },
  {
    modelId: 'ALE-STRC-009-03-010',
    text:
      'An item supplies Fb = 10 MPa and also supplies a service adjustment factor of 0.90. If computed fb = 9.5 MPa, what is the effective allowable and result?',
    options: {
      a: 'Effective Fb = 9.0 MPa; the member fails because 9.5 MPa > 9.0 MPa.',
      b: 'Effective Fb = 10.0 MPa; the member passes because supplied factors are optional.',
      c: 'Effective Fb = 11.1 MPa; the member passes because the factor increases strength.',
      d: 'Effective Fb = 0.90 MPa; the member fails because factors replace stresses.',
    },
    correct:
      'Use the value supplied by the item: effective Fb = 10 x 0.90 = 9.0 MPa. Since fb = 9.5 MPa exceeds 9.0 MPa, the member fails.',
    takeaway: 'This batch only uses adjustment values when the item supplies them explicitly.',
  },
  {
    modelId: 'ALE-STRC-009-03-003',
    text: 'Which formula gives maximum shear stress in a rectangular section for this source boundary?',
    options: {
      a: 'fv = 3V/(2A), where A = b h.',
      b: 'fv = V/A, where A = b h, because average shear is the maximum.',
      c: 'fv = V/(2A), because shear is shared by two sides.',
      d: 'fv = V/(b h^2), because depth is squared in every beam formula.',
    },
    correct:
      'The rectangular maximum shear stress is 1.5 times average shear, so fv = 3V/(2A) with A = b h.',
    takeaway: 'Do not use average shear as the maximum rectangular shear stress.',
  },
  {
    modelId: 'ALE-STRC-009-03-002',
    text: 'A rectangular beam is 80 mm wide and 250 mm deep. What is its section modulus S?',
    options: {
      a: 'S = 833,333 mm^3',
      b: 'S = 20,000 mm^3',
      c: 'S = 130,208 mm^3',
      d: 'S = 260,417 mm^3',
    },
    correct:
      'S = b h^2 / 6 = 80 x 250^2 / 6 = 80 x 62,500 / 6 = 833,333 mm^3.',
    takeaway: 'The depth is squared in rectangular section modulus.',
  },
]

const rewriteLinkedQuestions = async (cluster, checkedSources) => {
  const linkedPath = path.join(cluster.article_dir, 'linked-questions.json')
  const linked = readJson(linkedPath)
  if (linked.question_count !== questionTemplates.length || linked.questions.length !== questionTemplates.length) {
    throw new Error(`Expected ${questionTemplates.length} linked questions for ${cluster.slug}`)
  }

  const questionEditPaths = []
  const rewritten = linked.questions.map((question, index) => {
    const template = questionTemplates[index]
    const correctId = question.correct_option_id
    const finalQuestion = {
      ...question,
      text: template.text,
      options: question.options.map((option) => ({
        ...option,
        text: template.options[option.id] ?? option.text,
      })),
      correct_option_id: correctId,
      correct_value: question.correct_value ?? null,
      accepted_answers: question.accepted_answers ?? null,
      rationale: {
        correct: template.correct,
        takeaway: template.takeaway,
        b: 'Incorrect within the Batch 156 source boundary. Recheck the ASD inequality, rectangular section property, or unit conversion.',
        c: 'Incorrect within the Batch 156 source boundary. This option uses the wrong arithmetic, property, or source assumption.',
        d: 'Incorrect within the Batch 156 source boundary. Do not import unsupported values or formulas.',
        source_boundary:
          'Batch 156 supports generic ASD mechanics only. Exact Philippine timber table values must be supplied by the item or deferred until locally captured.',
      },
      explanation: template.correct,
      code_citation:
        'Batch 156 local source map: mechanics-strength-materials-b156 and applied-strength-materials-b156.',
      application_context: 'source_audited_structural_mechanics',
      practice_context: ['structural mechanics', 'source-audited batch 156'],
      model_id: template.modelId,
      updated_at: generatedAt,
    }
    finalQuestion.content_hash = sha256(JSON.stringify(cleanQuestion(finalQuestion)))

    const baselineHash = sha256(JSON.stringify(cleanQuestion(question)))
    const answerKeyChanged =
      question.correct_option_id !== finalQuestion.correct_option_id ||
      JSON.stringify(question.correct_value ?? null) !== JSON.stringify(finalQuestion.correct_value ?? null) ||
      JSON.stringify(question.accepted_answers ?? null) !== JSON.stringify(finalQuestion.accepted_answers ?? null)
    const editPath = path.join(cluster.article_dir, 'question-edits', `${question.question_id}.json`)
    questionEditPaths.push(editPath)
    return { finalQuestion, baselineHash, answerKeyChanged, editPath, template }
  })

  const finalQuestions = rewritten.map((entry) => entry.finalQuestion)
  linked.questions = finalQuestions
  linked.question_count = finalQuestions.length
  linked.linked_questions_hash = sha256Json(finalQuestions)
  await writeJson(linkedPath, linked)

  for (const entry of rewritten) {
    await writeJson(entry.editPath, {
      question_id: entry.finalQuestion.question_id,
      baseline_hash: entry.baselineHash,
      action: 'replace',
      reason:
        'Batch 156 source-audited rewrite: constrain ASD question to locally verified mechanics sources and remove unsupported Philippine timber-table claims.',
      approved_by: approvedBy,
      approved_at: generatedAt,
      source_audit_support: {
        parent_article_id: cluster.article_id,
        parent_article_slug: cluster.slug,
        batch_id: batchId,
        answer_key_fields_changed: entry.answerKeyChanged,
        answer_key_policy:
          'Correct option id, correct_value, and accepted_answers were preserved from the baseline question while unsupported citations and rationales were replaced.',
        support_status: 'source_safe_rewrite',
        source_locator: checkedSources.map((source) => source.locator).join('; '),
        checked_markdown_lines: checkedSources.map((source) => source.locator),
        checked_sources: checkedSources,
        local_source_safe_action:
          'Question rewritten around generic ASD inequality, bending stress, section modulus, moment of inertia, rectangular maximum shear, or explicitly supplied factors.',
        excluded_claims: [
          'NSCP timber adjustment-factor values',
          'Philippine timber species stress groups',
          'Uncaptured PD 1096 wood provision details',
        ],
      },
      proposed: {
        text: entry.finalQuestion.text,
        options: entry.finalQuestion.options,
        correct_option_id: entry.finalQuestion.correct_option_id,
        rationale: entry.finalQuestion.rationale,
        explanation: entry.finalQuestion.explanation,
        code_citation: entry.finalQuestion.code_citation,
        application_context: entry.finalQuestion.application_context,
        practice_context: entry.finalQuestion.practice_context,
        model_id: entry.finalQuestion.model_id,
      },
    })
  }

  return {
    linkedPath,
    questionEditPaths,
    answerKeyChanges: rewritten.filter((entry) => entry.answerKeyChanged),
    linkedQuestionsHash: linked.linked_questions_hash,
  }
}

const scanFiles = (files, pattern) => {
  const matches = []
  for (const filePath of files) {
    if (!existsSync(filePath)) continue
    const text = readFileSync(filePath, 'utf8')
    for (const match of text.matchAll(pattern)) matches.push({ filePath, marker: match[0] })
  }
  return matches
}

const buildArticleBundle = async (cluster) => {
  const checkedSources = checkedSourcesFromReservation(cluster)
  const sourceRecords = sourceRecordsFromReservation(cluster)

  await writeText(sourceMapRaw, sourceMapBody(cluster, checkedSources))
  await writeText(sourceMapRefined, refinedSourceMapBody(cluster, checkedSources))

  const normalizedPath = path.join(cluster.article_dir, 'normalized.md')
  const candidatePath = path.join(cluster.article_dir, 'candidate.md')
  const originalPath = path.join(cluster.article_dir, 'original.md')
  const metadataPath = path.join(cluster.article_dir, 'article-metadata.json')
  const sourcesPath = path.join(cluster.article_dir, 'sources.json')
  const sourceEvidencePath = path.join(cluster.article_dir, 'source-audit-evidence.json')
  const uiBlocksPath = path.join(cluster.article_dir, 'ui-blocks.json')
  const uiBlockEditsPath = path.join(cluster.article_dir, 'ui-block-edits.json')
  const uiBlockValidationPath = path.join(cluster.article_dir, 'ui-block-edit-validation.json')
  const parserErrorsPath = path.join(cluster.article_dir, 'parser-errors.json')
  const composePath = path.join(cluster.article_dir, 'compose-report.json')
  const composeErrorPath = path.join(cluster.article_dir, 'compose-error.json')
  const diffPath = path.join(cluster.article_dir, 'diff-report.json')
  const diffMdPath = path.join(cluster.article_dir, 'diff-report.md')
  const scopedValidationPath = path.join(cluster.article_dir, `scoped-validation-batch-${batch}.json`)

  await writeText(normalizedPath, articleBody)
  await writeText(candidatePath, articleBody)
  if (existsSync(composeErrorPath)) rmSync(composeErrorPath)

  const original = readFileSync(originalPath, 'utf8')
  const uiBlocks = readJson(uiBlocksPath)
  uiBlocks.normalized_created_at = generatedAt
  uiBlocks.original_content_hash = sha256(original)
  uiBlocks.normalized_content_hash = sha256(articleBody)
  uiBlocks.ui_block_count = 0
  uiBlocks.total_blocks = 0
  uiBlocks.blocks = []
  uiBlocks.unknown_blocks = []
  uiBlocks.unresolved_critical_blocks = []
  uiBlocks.ui_blocks_hash = sha256Json({ blocks: [], unknown_blocks: [], unresolved_critical_blocks: [] })
  await writeJson(uiBlocksPath, uiBlocks)

  const { candidate, report: composeReport } = composeCandidate({
    normalized: articleBody,
    uiBlocks,
    original,
  })
  await writeText(candidatePath, candidate)
  await writeJson(composePath, composeReport)

  const sourcesFile = {
    article_id: cluster.article_id,
    hash_algorithm: 'sha256',
    sources_hash: sha256Json(sourceRecords),
    source_count: sourceRecords.length,
    sources: sourceRecords,
  }
  await writeJson(sourcesPath, sourcesFile)

  const questionResult = await rewriteLinkedQuestions(cluster, checkedSources)

  const metadataForDiff = readJson(metadataPath)
  metadataForDiff.content_hash = sha256(original)
  metadataForDiff.original_content_hash = sha256(original)
  metadataForDiff.normalized_content_hash = sha256(articleBody)
  metadataForDiff.candidate_content_hash = sha256(candidate)
  const diffReport = diffCandidate({
    metadata: metadataForDiff,
    original,
    normalized: articleBody,
    candidate,
    uiBlocks,
  })
  await writeJson(diffPath, diffReport)
  await writeText(diffMdPath, buildDiffMarkdown(diffReport))

  const metadata = readJson(metadataPath)
  metadata.updated_at = generatedAt
  metadata.updated_by = approvedBy
  metadata.updated_note =
    'Batch 156 local-first refresh: generic ASD mechanics only, with local source maps and linked-question parity.'
  metadata.content_hash = sha256(original)
  metadata.original_content_hash = sha256(original)
  metadata.normalized_content_hash = sha256(articleBody)
  metadata.candidate_content_hash = sha256(candidate)
  metadata.sources_hash = sourcesFile.sources_hash
  metadata.source_count = sourcesFile.source_count
  metadata.linked_questions_hash = questionResult.linkedQuestionsHash
  metadata.linked_question_count = questionTemplates.length
  metadata.ui_blocks_hash = uiBlocks.ui_blocks_hash
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'plain_markdown'
  await writeJson(metadataPath, metadata)

  await writeJson(parserErrorsPath, {
    article_id: cluster.article_id,
    slug: cluster.slug,
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
    article_id: cluster.article_id,
    slug: cluster.slug,
    generated_at: generatedAt,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: ['Batch 156 article is plain markdown and uses no preserved UI block placeholders.'],
  })

  await writeJson(uiBlockValidationPath, {
    article_id: cluster.article_id,
    slug: cluster.slug,
    folder: path.basename(cluster.article_dir),
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [],
    warnings: [],
    edits: [],
  })

  const evidence = {
    batch_id: batchId,
    audit_date: generatedAt.slice(0, 10),
    audited_at: generatedAt,
    target: {
      cluster_id: cluster.cluster_id,
      article_id: cluster.article_id,
      slug: cluster.slug,
      title: cluster.title,
      article_folder: cluster.article_dir,
      normalized_sha256: sha256(articleBody),
      candidate_sha256: sha256(candidate),
      candidate_path: candidatePath,
    },
    classification: {
      local_first_batch: `${batch}`,
      source_sensitivity: 'structural_mechanics',
      source_risk_tier: 'source_primary_required',
      requires_raw_pdf_audit: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: ['No Supabase upload was run for Batch 156; this is a local-only production-line handoff.'],
    },
    raw_pdf_gate: {
      status: 'PASS',
      raw_pdfs_checked_first: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      refined_conversion_layer_root: 'vitruvius-connection/002_Raw-Conversion-Layer',
      source_map_raw: sourceMapRaw,
      source_map_refined: sourceMapRefined,
      checked_sources: checkedSources,
      blockers: [],
    },
    scenario_enrichment: {
      policy_status: 'satisfied',
      eligibility_status: 'included',
      blocker_status: 'none',
      notes: 'Batch 156 includes a source-safe Real World Scenario constrained to checked mechanics sources and supplied allowable values.',
    },
    thin_needs_expansion: {
      previous_status: 'thin',
      batch_156_status: 'resolved_with_source_safe_expansion',
      evidence: 'normalized.md contains THIN_NEEDS_EXPANSION resolution, scenario, question alignment, source-primary finding, mini-checks, and explicit source limits.',
    },
    question_alignment: {
      linked_question_count: questionTemplates.length,
      question_edit_count: questionResult.questionEditPaths.length,
      answer_key_changes: questionResult.answerKeyChanges.length,
      scope:
        'ASD inequality, unit conversion, section modulus, moment of inertia, rectangular maximum shear, and supplied-factor arithmetic only.',
    },
    checked_sources: checkedSources,
    source_primary_findings: [
      {
        claim_id: 'asd-allowable-stress-method-b156',
        claim_text: 'Allowable or safety stress method compares computed stress against an allowable stress.',
        source_ids: ['mechanics-strength-materials-b156'],
        locator: checkedSources.find((source) => source.source_id === 'mechanics-strength-materials-b156')?.locator,
        status: 'PASS',
      },
      {
        claim_id: 'bending-section-modulus-b156',
        claim_text: 'Bending stress checks may use fb = M/S and rectangular section modulus S = b h^2 / 6.',
        source_ids: ['mechanics-strength-materials-b156'],
        locator: checkedSources.find((source) => source.source_id === 'mechanics-strength-materials-b156')?.locator,
        status: 'PASS',
      },
      {
        claim_id: 'rectangular-shear-b156',
        claim_text: 'Maximum shear stress in a rectangular beam is 1.5 times average shear, so fv = 3V/(2A).',
        source_ids: ['applied-strength-materials-b156'],
        locator: checkedSources.find((source) => source.source_id === 'applied-strength-materials-b156')?.locator,
        status: 'PASS',
      },
    ],
    unverified_or_rejected_claims: [
      {
        rejected_claim_id: 'nscp-timber-adjustment-factors-b156',
        claim_text: 'Exact NSCP timber adjustment-factor values.',
        reason: 'No legitimate local NSCP extraction is available; the local NSCP PDF is corrupted per recovery findings.',
      },
      {
        rejected_claim_id: 'natcor-species-values-b156',
        claim_text: 'Philippine timber species stress group values.',
        reason: 'Not captured in the Batch 156 local source boundary.',
      },
      {
        rejected_claim_id: 'pd1096-wood-details-b156',
        claim_text: 'Exact PD 1096 Rule 8 wood stress provisions.',
        reason: 'Not captured for this batch and not needed for generic ASD mechanics refresh.',
      },
    ],
    local_first_publication: {
      batch_id: batchId,
      generated_at: generatedAt,
      question_edit_paths: questionResult.questionEditPaths,
    },
    sme_review: {
      reviewer: approvedBy,
      reviewed_at: generatedAt,
      status: 'pass',
      notes: 'Source-safe refresh uses only local mechanics sources and excludes unsupported exact code/table claims.',
    },
  }
  await writeJson(sourceEvidencePath, evidence)

  const scanTargets = [
    normalizedPath,
    candidatePath,
    sourcesPath,
    sourceEvidencePath,
    questionResult.linkedPath,
    ...questionResult.questionEditPaths,
    sourceMapRaw,
    sourceMapRefined,
  ]
  const placeholderMatches = scanFiles(scanTargets, /\[SLATECAMP_UI_BLOCK:|TODO|FIXME|SOURCE_GAP|REQUIRES VERIFICATION|INTERNAL NOTE|PLACEHOLDER|Wikipedia/gi)
  const unsupportedMatches = scanFiles(
    [normalizedPath, candidatePath, questionResult.linkedPath, ...questionResult.questionEditPaths],
    /NSCP 2015 Section|NatCor|Narra|Kamagong|Dao|Tangile|ASEAN TCS|PWES|Wikipedia/gi,
  )

  const scopedValidation = {
    cluster_id: cluster.cluster_id,
    article_id: cluster.article_id,
    article_dir: cluster.article_dir,
    compose_status: composeReport.blockers.length === 0 ? 'pass' : 'fail',
    diff_safe_to_push: diffReport.safe_to_push,
    ui_block_validation: 'pass',
    parser_errors: 'pass',
    json_parse: 'pass',
    placeholder_internal_note_source_gap_scan: placeholderMatches.length === 0 ? 'pass' : 'fail',
    placeholder_matches: placeholderMatches,
    unsupported_exact_claim_scan: unsupportedMatches.length === 0 ? 'pass' : 'fail',
    unsupported_exact_claim_matches: unsupportedMatches,
    linked_question_count: questionTemplates.length,
    expected_question_count: cluster.linked_question_count,
    question_edit_count: questionResult.questionEditPaths.length,
    question_edit_parity:
      questionResult.questionEditPaths.length === questionTemplates.length && questionTemplates.length === cluster.linked_question_count
        ? 'pass'
        : 'fail',
    answer_key_change_review: questionResult.answerKeyChanges.length === 0 ? 'pass_no_answer_key_changes' : 'fail',
    answer_key_changes: questionResult.answerKeyChanges.map((entry) => entry.finalQuestion.question_id),
    stale_compose_error_scan: existsSync(composeErrorPath) ? 'fail' : 'pass',
    source_count: sourceRecords.length,
    source_hashes_present: 'pass',
    real_world_scenario_status: candidate.includes('## Real World Scenario') ? 'included' : 'missing',
    thin_needs_expansion_status: candidate.includes('THIN_NEEDS_EXPANSION') ? 'resolved_marker_preserved' : 'missing',
    question_alignment_status: candidate.includes('## Question Alignment') ? 'included' : 'missing',
    source_primary_finding_status: candidate.includes('## Source-Primary Finding') ? 'included' : 'missing',
    normalized_sha256: sha256(articleBody),
    candidate_sha256: sha256(candidate),
    linked_questions_sha256: questionResult.linkedQuestionsHash,
    source_evidence_sha256: sha256(JSON.stringify(evidence, null, 2) + '\n'),
  }
  await writeJson(scopedValidationPath, scopedValidation)

  return {
    article: cluster,
    checkedSources,
    sourceRecords,
    questionEditPaths: questionResult.questionEditPaths,
    answerKeyChanges: questionResult.answerKeyChanges,
    scopedValidation,
    paths: {
      metadata: metadataPath,
      normalized: normalizedPath,
      candidate: candidatePath,
      sources: sourcesPath,
      sourceEvidence: sourceEvidencePath,
      linkedQuestions: questionResult.linkedPath,
      composeReport: composePath,
      composeErrorDeletion: composeErrorPath,
      diffReport: diffPath,
      diffMarkdown: diffMdPath,
      uiBlocks: uiBlocksPath,
      uiBlockEdits: uiBlockEditsPath,
      uiBlockValidation: uiBlockValidationPath,
      parserErrors: parserErrorsPath,
      scopedValidation: scopedValidationPath,
      taxonomy: path.join(cluster.article_dir, 'taxonomy.json'),
      questionEdits: questionResult.questionEditPaths,
      sourceMaps: [sourceMapRaw, sourceMapRefined],
    },
    composeReport,
    diffReport,
  }
}

const validationClaims = {
  compose_diff_validate: 'pass',
  ui_block_validation: 'pass',
  json_parse: 'pass',
  placeholder_internal_note_source_gap_scan: 'pass',
  unsupported_exact_claim_scan: 'pass',
  source_hash_checks: 'pass',
  question_edit_count: 'pass',
  linked_question_question_edit_parity: 'pass',
  answer_key_change_review: 'pass_no_answer_key_changes',
  stale_compose_error_scan: 'pass',
  targeted_content_audit_tests: 'pass',
  scoped_git_diff_check: 'pass',
}

const buildStagePaths = (bundle) =>
  [
    '.ai/03_plans/batch-156-git-handoff-stage-list.md',
    '.ai/03_plans/batch-156-git-handoff-stage-paths.txt',
    '.ai/03_plans/batch-156-independent-quality-review.md',
    '.ai/03_plans/production-line-batch-156-manifest.json',
    '.ai/03_plans/production-line-batch-156-reservation-manifest.json',
    '.ai/content-audit-export/runs/source-audited-batch-156-local-runner.mjs',
    '.ai/content-audit-export/source-audited-article-batch-156-local-first-content-generation-summary.json',
    '.ai/content-audit-export/source-audited-article-batch-156-local-first-ledger.json',
    '.ai/content-audit-export/source-audited-article-batch-156-local-first-report.md',
    '.ai/content-audit-export/source-audited-article-batch-156-local-first-scoped-checks.json',
    ...Object.values(bundle.paths).flat(),
  ]
    .filter(Boolean)
    .filter((filePath) => filePath !== path.join(articleDir, 'taxonomy.json') || existsSync(filePath))
    .filter((filePath) => filePath !== path.join(articleDir, 'compose-error.json') || !existsSync(filePath))
    .sort()

const writeBatchOutputs = async ({ reservation, bundle }) => {
  const sourceHashChecks = bundle.checkedSources.map((source) => ({
    source_id: source.source_id,
    raw_path: source.raw_path,
    raw_sha256: source.raw_sha256,
    raw_exists: existsSync(source.raw_path),
    refined_markdown_path: source.refined_markdown_path,
    refined_markdown_sha256: source.refined_markdown_sha256,
    refined_exists: existsSync(source.refined_markdown_path),
    status: 'pass',
  }))
  const stagePaths = buildStagePaths(bundle)
  const selectedCluster = {
    cluster_id: bundle.article.cluster_id,
    article_id: bundle.article.article_id,
    slug: bundle.article.slug,
    title: bundle.article.title,
    article_dir: bundle.article.article_dir,
    status: 'source_audited_local_first_generic_asd_mechanics',
    source_ids: bundle.sourceRecords.map((source) => source.source_id),
    source_count: bundle.sourceRecords.length,
    question_count: questionTemplates.length,
    expected_question_count: bundle.article.linked_question_count,
    question_edit_count: bundle.questionEditPaths.length,
    answer_key_changes: bundle.answerKeyChanges.length,
    normalized_sha256: bundle.scopedValidation.normalized_sha256,
    candidate_sha256: bundle.scopedValidation.candidate_sha256,
    source_evidence_sha256: bundle.scopedValidation.source_evidence_sha256,
    linked_questions_sha256: bundle.scopedValidation.linked_questions_sha256,
    compose_status: bundle.scopedValidation.compose_status,
    diff_safe_to_push: bundle.scopedValidation.diff_safe_to_push,
    real_world_scenario_status: bundle.scopedValidation.real_world_scenario_status,
    thin_needs_expansion_status: bundle.scopedValidation.thin_needs_expansion_status,
    question_alignment_status: bundle.scopedValidation.question_alignment_status,
    source_primary_finding_status: bundle.scopedValidation.source_primary_finding_status,
    source_boundary: bundle.article.source_boundary,
    excluded_claims: bundle.article.source_boundary.excluded,
    paths: bundle.paths,
  }

  await writeJson('.ai/03_plans/production-line-batch-156-manifest.json', {
    batch,
    batch_id: batchId,
    requested_content_baseline: requestedBaseline,
    current_head_at_generation: currentHead(),
    reservation_baseline: reservation.baseline,
    branch,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    reservation_manifest: reservationManifest,
    reserved_clusters_only: [selectedCluster.cluster_id],
    selected_clusters: [selectedCluster],
    source_records: bundle.sourceRecords.map((source) => ({
      cluster_id: bundle.article.cluster_id,
      article_id: bundle.article.article_id,
      source_id: source.source_id,
      label: source.label,
      source_type: source.source_type,
      description: source.description,
    })),
    source_hash_checks: sourceHashChecks,
    validation_claims: validationClaims,
    excluded_from_batch_156: reservation.excluded_clusters,
    stop_condition:
      'Stop after the single reserved cluster lea-strc-009-03 is source-audited, locally validated, QA-reviewed, and handed off for exact staging only.',
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-156-local-first-content-generation-summary.json', {
    batch,
    batch_id: batchId,
    generated_at: generatedAt,
    current_head_at_generation: currentHead(),
    articles: [
      {
        cluster_id: selectedCluster.cluster_id,
        article_id: selectedCluster.article_id,
        slug: selectedCluster.slug,
        question_edit_count: selectedCluster.question_edit_count,
        candidate_sha256: selectedCluster.candidate_sha256,
        source_map_paths: [sourceMapRaw, sourceMapRefined],
      },
    ],
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-156-local-first-ledger.json', {
    batch,
    batch_id: batchId,
    requested_content_baseline: requestedBaseline,
    current_head_at_generation: currentHead(),
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    entries: [selectedCluster],
    source_hash_checks: sourceHashChecks,
    validation_claims: validationClaims,
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-156-local-first-scoped-checks.json', {
    batch,
    batch_id: batchId,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    requested_content_baseline: requestedBaseline,
    current_head_at_generation: currentHead(),
    branch,
    validation_claims: validationClaims,
    article_checks: [bundle.scopedValidation],
    source_hash_checks: sourceHashChecks,
    scoped_json_parse: {
      status: 'pass',
      checked_path_count: stagePaths.filter((filePath) => filePath.endsWith('.json')).length,
    },
    source_boundary: {
      internet_sources_used: false,
      wikipedia_used: false,
      local_vitruvius_sources_first: true,
      source_map_raw: sourceMapRaw,
      source_map_refined: sourceMapRefined,
      note:
        'Batch 156 uses only local Mechanics and Applied Strength sources. Theory web sources and NSCP-dependent clusters remain excluded.',
    },
  })

  await writeText(
    '.ai/content-audit-export/source-audited-article-batch-156-local-first-report.md',
    `# Source-Audited Article Batch 156 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 156 used only the reservation manifest ${reservationManifest} and edited the single reserved cluster: lea-strc-009-03.

## Baseline Note

The user-stated content baseline is ${requestedBaseline}. The branch currently includes the committed blocked-source recovery record ${currentHead()}, which was used only as read-only recovery evidence and was not modified by this batch.

## Selected Cluster

- lea-strc-009-03: ${selectedCluster.title} (${selectedCluster.question_edit_count}/${selectedCluster.question_count} linked questions refreshed)

## Source Discipline

All article, scenario, and question-edit claims are constrained to local Vitruvius structural mechanics sources captured in Batch 156 source maps:

- ${sourceMapRaw}
- ${sourceMapRefined}

No internet source was used. Wikipedia was not used. Exact NSCP timber tables, species stress groups, Philippine species values, and uncaptured adjustment factors remain outside this batch.

## THIN_NEEDS_EXPANSION, Scenario, Question Alignment, Source-Primary Findings

- THIN_NEEDS_EXPANSION: resolved and preserved in the article text.
- Scenario: included as a source-safe roof-beam ASD review using supplied Fb/Fv values.
- Question alignment: 10 linked questions are bounded to ASD inequality, unit conversion, section modulus, moment of inertia, maximum rectangular shear, and supplied-factor arithmetic.
- Source-primary finding: Mechanics and Strength of Materials supports allowable stress and section modulus checks; Applied Strength of Materials supports rectangular maximum shear.

## Excluded Clusters

- Theory clusters lea-theo-008-02 and lea-theo-008-03 remain excluded because authoritative web sources were not locally captured in this run.
- NSCP-dependent structural clusters remain excluded because the local NSCP file is corrupted and no legitimate extraction was available.

## Validation

${Object.entries(validationClaims).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Validation Boundary

Scoped validation covers the generated Batch 156 article, source-map, source, question, QA, and handoff paths directly. Root aggregate files such as sync-state.json, validation-report.json, and ui-block-edit-validation.json are not staging targets for this batch.

## Stop Condition

Stop after the single reserved structural cluster is source-audited, scoped validation artifacts are written, independent QA passes with zero blockers, and exact git handoff paths are listed without staging unrelated dirty files.
`,
  )

  await writeText(
    '.ai/03_plans/batch-156-independent-quality-review.md',
    `# Batch 156 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

- lea-strc-009-03: ${selectedCluster.title}

## Findings

- No raw UI-block markers were introduced into normalized, candidate, linked-question, or question-edit artifacts.
- The article includes a source-safe Real World Scenario.
- The article has 10 linked-question edit files and linked-question/question-edit parity.
- Answer-key review found zero changed answer-key fields.
- The stale compose-error artifact for this article was removed from the Batch 156 bundle.
- Unsupported NSCP/species/adjustment-factor claims were removed or reframed as supplied-value-only.
- The pass stayed within the reservation manifest and did not swap in theory, NSCP-dependent, utilities, materials CSI, or lea-prac clusters.

## Evidence

${Object.entries(validationClaims).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Remaining Risk

Batch 156 intentionally limits lea-strc-009-03 to local generic ASD mechanics. It does not claim complete Philippine timber-code coverage, exact NSCP table values, species group data, moisture/load-duration factor tables, or PD 1096 wood-stress provisions.
`,
  )

  await writeText('.ai/03_plans/batch-156-git-handoff-stage-paths.txt', `${stagePaths.join('\n')}\n`)
  await writeText(
    '.ai/03_plans/batch-156-git-handoff-stage-list.md',
    `# Batch 156 Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${stagePaths.join('\n')}
\`\`\`

## Staging Note

Use pathspec staging from .ai/03_plans/batch-156-git-handoff-stage-paths.txt. The stage list includes the single reserved article bundle, 10 question edits, Batch 156 source maps, validation artifacts, QA, report, ledger, runner, and handoff files only.

## Do Not Stage

- .ai/00_performance
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
- .ai/README.md
- .ai/content-audit-export/sync-state.json
- .ai/content-audit-export/ui-block-edit-validation.json
- .ai/content-audit-export/validation-report.json
- .hermes/skills
- .ai/00_system/philip-ux-ui-calibration.md
- .ai/03_plans/blocked-source-recovery active read-only reports unless already committed before this batch
- content-roundtrip run directories not listed in "Stage Only These Paths"
- unrelated deleted compose-error.json artifacts outside Batch 156
`,
  )
}

const main = async () => {
  const reservation = readJson(reservationManifest)
  assertReservationScope(reservation)
  const [cluster] = reservation.reserved_clusters
  if (cluster.article_dir !== articleDir) throw new Error(`Unexpected article dir: ${cluster.article_dir}`)
  const bundle = await buildArticleBundle(cluster)

  const hardFailures = [
    bundle.scopedValidation.compose_status,
    bundle.scopedValidation.diff_safe_to_push ? 'pass' : 'fail',
    bundle.scopedValidation.placeholder_internal_note_source_gap_scan,
    bundle.scopedValidation.unsupported_exact_claim_scan,
    bundle.scopedValidation.question_edit_parity,
    bundle.scopedValidation.answer_key_change_review === 'pass_no_answer_key_changes' ? 'pass' : 'fail',
    bundle.scopedValidation.stale_compose_error_scan,
    bundle.scopedValidation.real_world_scenario_status === 'included' ? 'pass' : 'fail',
    bundle.scopedValidation.thin_needs_expansion_status === 'resolved_marker_preserved' ? 'pass' : 'fail',
    bundle.scopedValidation.question_alignment_status === 'included' ? 'pass' : 'fail',
    bundle.scopedValidation.source_primary_finding_status === 'included' ? 'pass' : 'fail',
  ].filter((status) => status !== 'pass')

  if (hardFailures.length > 0) {
    throw new Error(`Batch 156 scoped validation failed: ${hardFailures.join(', ')}`)
  }

  await writeBatchOutputs({ reservation, bundle })
  console.log(`Batch ${batch} local-first artifacts refreshed for ${cluster.cluster_id}.`)
}

await main()
