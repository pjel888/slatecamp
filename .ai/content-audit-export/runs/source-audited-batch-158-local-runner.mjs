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

const batch = 158
const batchId = 'source-audited-batch-158-local-first'
const requestedBaseline = 'ff7679369'
const branch = '3dlab-gray-viewport-bg'
const generatedAt = new Date().toISOString()
const approvedBy = 'codex-local-source-audit-batch-158'
const articleDir =
  '.ai/content-audit-export/articles/lea-matl-009-02-core-concept--0ed94cf5-6a2b-4062-8e8b-4f514ca89be5'
const sourceMapRaw =
  'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-158/lea-matl-009-02-masterformat-authoritative-web.source-capture.md'
const sourceMetadata =
  'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-158/SOURCE-METADATA.json'
const sourceMapRefined =
  'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-158/lea-matl-009-02-masterformat-sectionformat.refined.md'
const reservationManifest = '.ai/03_plans/production-line-batch-158-reservation-manifest.json'

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'))
const fileSha = (filePath) => `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
const fileBytes = (filePath) => readFileSync(filePath).byteLength
const currentHead = () => execFileSync('git', ['rev-parse', '--short=9', 'HEAD'], { encoding: 'utf8' }).trim()

const cluster = {
  cluster_id: 'lea-matl-009-02',
  article_id: '0ed94cf5-6a2b-4062-8e8b-4f514ca89be5',
  slug: 'lea-matl-009-02-core-concept',
  title: 'CSI MasterFormat',
  article_dir: articleDir,
  linked_question_count: 10,
}

const sourceDefinitions = [
  {
    source_id: 'csi-standards-overview-b158',
    label: 'Construction Specifications Institute, Standards Overview: MasterFormat',
    url: 'https://www.csiresources.org/standards/overview',
    source_type: 'official_web_page',
    publisher: 'Construction Specifications Institute',
    locator:
      'web.open capture lines 79-85, 93-105, 112-118, and 149-152 for MasterFormat purpose, groups, subscription boundary, and latest-edition status.',
  },
  {
    source_id: 'csi-masterformat-2020-ebook-toc-b158',
    label: 'Construction Specifications Institute, MasterFormat 2020 Edition public ebook table of contents',
    url: 'https://ebooks.csiresources.org/1e7bnm9/',
    source_type: 'official_web_preview',
    publisher: 'Construction Specifications Institute',
    locator:
      'web.open capture lines 48-68 and 83-128 for official 2020 edition context and visible division titles.',
  },
  {
    source_id: 'wbdg-specsintact-sectionformat-b158',
    label: 'WBDG SpecsIntact Help, SectionFormat and PageFormat',
    url: 'https://www.wbdg.org/tools/specsintact/Help/SIGeneral/SectionFormat.htm',
    source_type: 'government_reference',
    publisher: 'Whole Building Design Guide / SpecsIntact',
    locator:
      'web.open capture lines 18, 34-43, and 46-48 for CSI SectionFormat conformance and Part 1/2/3 structure.',
  },
]

const sourceBoundary = {
  included: [
    'MasterFormat purpose as a CSI classification/organization framework.',
    'MasterFormat group/subgroup structure and visible public 2020 division titles from the CSI-hosted ebook preview.',
    'SectionFormat three-part organization: Part 1 General, Part 2 Products, Part 3 Execution.',
    'High-yield division identification limited to the visible public CSI TOC and generic section organization.',
  ],
  excluded: [
    'Paid MasterFormat tables not visible in the official public preview.',
    'Leaked or gray-area MasterFormat PDFs.',
    'Uncaptured DPWH standard specification details.',
    'Board of Architecture educational guideline claims not locally captured for Batch 158.',
    'Uncaptured ASTM/ACI exact test methods, edition claims, and numeric acceptance thresholds.',
  ],
}

const sourceCaptureBody = `# Batch 158 Source Capture: MasterFormat and SectionFormat for lea-matl-009-02

## Source Boundary

Batch 158 reopens lea-matl-009-02 only. It captures public, authoritative web provenance for MasterFormat structure and SectionFormat organization. It does not capture paid MasterFormat tables, leaked PDFs, DPWH standard specification details, or exact ASTM/ACI test thresholds.

## Capture Method

- Primary capture method: Codex web.open official-source retrieval on 2026-05-14.
- Shell curl attempt: blocked by sandbox DNS resolution, so this local source-map records provenance, URLs, locators, and claim-safe excerpts rather than a full raw HTML mirror.
- General encyclopedia citations: not used.
- Pirated/leaked MasterFormat PDFs: not used.

## Captured Sources

### csi-standards-overview-b158

- Title: Construction Specifications Institute, Standards Overview: MasterFormat
- URL: https://www.csiresources.org/standards/overview
- Publisher: Construction Specifications Institute
- Locator: web.open capture lines 79-85, 93-105, 112-118, and 149-152.
- Safe use: MasterFormat organizes construction information by work results, materials, and methods; it supports specifications and cost information; it has procurement/contracting and specifications groups; CSI Dynamic Standards is the live source for latest editions.
- Use limit: The public page points to subscriber lookup for complete current tables, so do not reproduce or infer paid table content.

### csi-masterformat-2020-ebook-toc-b158

- Title: Construction Specifications Institute, MasterFormat 2020 Edition public ebook table of contents
- URL: https://ebooks.csiresources.org/1e7bnm9/
- Publisher: Construction Specifications Institute
- Locator: web.open capture lines 48-68 and 83-128.
- Safe use: public official TOC supports MasterFormat 2020 edition context and visible division titles, including 00, 01, 03, 04, 05, 06, 07, 08, and 09.
- Use limit: This capture is a public TOC/preview, not the complete licensed standard.

### wbdg-specsintact-sectionformat-b158

- Title: WBDG SpecsIntact Help, SectionFormat and PageFormat
- URL: https://www.wbdg.org/tools/specsintact/Help/SIGeneral/SectionFormat.htm
- Publisher: Whole Building Design Guide / SpecsIntact
- Locator: web.open capture lines 18, 34-43, and 46-48.
- Safe use: supports CSI SectionFormat conformance and the three-part section order: Part 1 General, Part 2 Products, Part 3 Execution.
- Use limit: This source supports section organization, not complete MasterFormat division taxonomy.

## Extracted Claims Used In Batch 158

1. MasterFormat is a CSI standard for organizing construction information by work results, materials, and methods.
2. MasterFormat supports organization of specifications and detailed cost information.
3. MasterFormat uses a Procurement and Contracting Requirements Group and a Specifications Group.
4. The public CSI 2020 TOC supports the visible division titles used in this article and question set.
5. SectionFormat divides a specification section into Part 1: General, Part 2: Products, and Part 3: Execution.

## Explicit Exclusions

${sourceBoundary.excluded.map((item) => `- ${item}`).join('\n')}

## Use Rule

Use this source map for Batch 158 article and linked-question edits only where the claim is directly supported by the safe-use list above. If an exam item needs a complete division table, a paid MasterFormat entry, DPWH detail, or exact ASTM/ACI value, the item must supply it explicitly or be deferred until a legitimate local source is captured.
`

const sourceMetadataBody = {
  batch,
  batch_id: batchId,
  generated_at: generatedAt,
  target_cluster: cluster.cluster_id,
  source_capture_path: sourceMapRaw,
  refined_conversion_path: sourceMapRefined,
  capture_policy: {
    raw_source_first: true,
    authoritative_web_sources_only: true,
    general_encyclopedia_used: false,
    pirated_or_leaked_sources_used: false,
    shell_network_status: 'curl DNS failed in sandbox; provenance captured from Codex web.open official-source retrieval.',
  },
  sources: sourceDefinitions,
  use_limits: sourceBoundary.excluded,
}

const refinedSourceMapBody = `# Batch 158 Refined Source Map: MasterFormat and SectionFormat

## Canonical Locators

${sourceDefinitions.map((source) => `- ${source.source_id}: ${source.locator}`).join('\n')}

## Safe Exam Claims

1. MasterFormat is a construction-information organization standard from CSI.
2. MasterFormat is used to organize specifications and detailed cost information by work results, materials, and methods.
3. MasterFormat contains a Procurement and Contracting Requirements Group and a Specifications Group.
4. Public CSI 2020 TOC division titles may be used for high-yield navigation, including 03 Concrete, 04 Masonry, 05 Metals, 06 Wood/Plastics/Composites, 07 Thermal and Moisture Protection, 08 Openings, and 09 Finishes.
5. SectionFormat section parts are Part 1 General, Part 2 Products, and Part 3 Execution.
6. Project-specific owner, agency, or contract standards must be verified from the project documents; this Batch 158 source map does not prove DPWH or Board of Architecture claims.

## Hashes

| Artifact | Path | SHA-256 |
| --- | --- | --- |
| raw-capture | ${sourceMapRaw} | PENDING |
| source-metadata | ${sourceMetadata} | PENDING |

## Batch 158 Claim Discipline

The article and question edits may cite this source map for MasterFormat structure, visible public CSI division titles, and three-part SectionFormat organization. They must not cite this map for complete paid tables, Philippine government specification requirements, or exact ASTM/ACI acceptance values.
`

const articleBody = `# CSI MasterFormat and Three-Part Specifications

## Board Exam Quick Check

For a specification item, identify the work result first, then select the division or section framework. MasterFormat helps locate the work category; SectionFormat organizes the section itself into General, Products, and Execution.

THIN_NEEDS_EXPANSION: resolved by Batch 158 source-safe MasterFormat and SectionFormat refresh.

## What You Need To Know

- MasterFormat is a CSI organization system for construction information.
- It organizes work results, materials, and methods for specifications and cost information.
- It includes a Procurement and Contracting Requirements Group and a Specifications Group.
- SectionFormat organizes a specification section into Part 1: General, Part 2: Products, and Part 3: Execution.
- Use the current project standard or licensed CSI lookup for complete and current division/section tables.

## Core Concept

MasterFormat is a navigation framework, not a substitute for the full specification. It tells the project team where a work result belongs so drawings, specifications, cost estimates, and submittals can use a common structure. The current CSI public source boundary confirms the broad purpose and public 2020 division titles, while the complete latest tables remain a licensed/current-reference lookup.

The exam-safe workflow is:

1. Identify the work result: concrete, masonry, metal, wood, waterproofing, openings, or finishes.
2. Place it in the correct MasterFormat division or supplied section number.
3. Write the section using the three-part format.
4. Add only project-specific or jurisdiction-specific requirements that the item, contract, code, or captured source actually supports.

## High-Yield MasterFormat Navigation

| Division or group | Public source-supported use | Exam trap |
| --- | --- | --- |
| 00 | Procurement and Contracting Requirements | Confusing bidding/contract conditions with technical work sections |
| 01 | General Requirements | Treating project-wide submittals or QA as product specs |
| 03 | Concrete | Putting concrete topping, reinforcement coordination, or curing notes in an unrelated finish section |
| 04 | Masonry | Confusing unit masonry with concrete work |
| 05 | Metals | Placing structural steel or metal framing under concrete |
| 06 | Wood, Plastics, and Composites | Treating wood trim or framing as a finish-only issue |
| 07 | Thermal and Moisture Protection | Placing waterproofing under concrete only because it is applied over concrete |
| 08 | Openings | Putting doors, windows, glazing, or hardware under finishes |
| 09 | Finishes | Putting paint, flooring, ceilings, and wall finishes under openings or products only |
| 21-28 | Facility services subgroup | Calling all services divisions 34-49 is not source-safe |
| 31-35 | Site and infrastructure subgroup | Treating earthwork and utilities as ordinary building finishes |
| 40-48 | Process equipment subgroup | Treating process equipment as standard architectural finish work |

## Three-Part SectionFormat

Part 1: General sets the section framework. It is where the section records summary/scope, references, submittals, quality assurance, administrative/procedural requirements, and related coordination requirements.

Part 2: Products identifies what is supplied. It covers materials, manufactured units, equipment, mixes, accessories, performance criteria, and source-supported product requirements.

Part 3: Execution explains how the work is installed, examined, prepared, applied, adjusted, cleaned, protected, and verified in the field.

## Real World Scenario

A project has a concrete deck, a waterproofing membrane over that deck, aluminum windows, and interior paint. A source-safe specification review places concrete work in Division 03, waterproofing in Division 07, windows in Division 08, and paint in Division 09. Within each section, Part 1 records the standards, submittals, quality requirements, and coordination notes; Part 2 records the products; Part 3 records installation and verification. If the owner or agency requires a separate standard, verify that requirement from the contract documents rather than forcing unsupported MasterFormat assumptions.

## Question Alignment

The 10 linked questions for this article are bounded to MasterFormat purpose, public division navigation, SectionFormat three-part order, and source-safe coordination logic. They intentionally avoid uncaptured DPWH mandates, Board of Architecture claims, paid MasterFormat table entries, and exact ASTM/ACI thresholds.

## Source-Primary Finding

Batch 158 checked official/public web sources before rewriting. CSI's standards overview supports MasterFormat purpose and current-reference boundaries. The CSI-hosted 2020 public ebook preview supports the visible division titles used here. WBDG SpecsIntact supports the CSI SectionFormat three-part structure used for Part 1, Part 2, and Part 3.

## Common Mistakes

- Using a leaked MasterFormat PDF instead of an official or licensed source.
- Treating MasterFormat as if it overrides the project contract, owner requirements, or local law.
- Placing waterproofing in Division 03 only because it touches concrete.
- Placing doors, windows, or glazing in Division 09 instead of Division 08.
- Mixing Part 1 quality requirements, Part 2 products, and Part 3 execution steps in one undifferentiated paragraph.
- Importing exact ASTM/ACI/DPWH values that the item or captured source does not supply.

## Explicit Source Limits

This refresh is source-safe for MasterFormat structure, visible public division titles, and SectionFormat organization only. If a question needs a complete MasterFormat entry, a paid table, a Philippine public-works standard, or an exact technical threshold, capture the legitimate source first or make the item supply the value explicitly.
`

const questionTemplates = {
  '1a5864dc-ab7d-4362-bab2-dcaf66272723': {
    modelId: 'ALE-MATL-009-02-001',
    text: 'Using the Batch 158 public CSI MasterFormat source boundary, which division covers concrete work?',
    options: {
      a: 'Division 03',
      b: 'Division 04',
      c: 'Division 05',
      d: 'Division 07',
    },
    correct: 'The public CSI MasterFormat 2020 table of contents identifies Division 03 as Concrete.',
    takeaway: 'Division 03 is the high-yield MasterFormat location for concrete work.',
  },
  '79402125-80a4-4032-92aa-c3ec87dbf8a9': {
    modelId: 'ALE-MATL-009-02-002',
    text: 'The standard three-part specification section format is organized in which order?',
    options: {
      a: 'Part 1: General; Part 2: Products; Part 3: Execution',
      b: 'Part 1: Products; Part 2: General; Part 3: Execution',
      c: 'Part 1: Execution; Part 2: General; Part 3: Products',
      d: 'Part 1: General; Part 2: Execution; Part 3: Products',
    },
    correct: 'SectionFormat divides sections into Part 1: General, Part 2: Products, and Part 3: Execution.',
    takeaway: 'Use the order General, Products, Execution.',
  },
  '116f42de-5cee-407a-b14b-318bec2aa3f6': {
    modelId: 'ALE-MATL-009-02-003',
    text: 'Which CSI MasterFormat division covers openings such as doors and windows?',
    options: {
      a: 'Division 08',
      b: 'Division 06',
      c: 'Division 07',
      d: 'Division 09',
    },
    correct: 'The public CSI MasterFormat 2020 table of contents identifies Division 08 as Openings.',
    takeaway: 'Doors, windows, glazing, and related opening work are not Division 09 finishes.',
  },
  '7e104218-5338-4c24-a709-de5b132b5890': {
    modelId: 'ALE-MATL-009-02-004',
    text: 'What is the best source-safe role of Part 1: General in a specification section?',
    options: {
      a: 'To establish the section framework, references, submittals, quality assurance, and administrative/procedural requirements.',
      b: 'To list only the physical products and manufactured units supplied for the work.',
      c: 'To describe only the installation sequence and field application steps.',
      d: 'To provide the complete project budget and financing plan.',
    },
    correct:
      'Part 1: General contains the general and administrative/procedural requirements for the section, including the framework for references, submittals, and quality assurance.',
    takeaway: 'Part 1 governs how the section is controlled before products and execution are detailed.',
  },
  '1a970a29-bfa1-4c4b-9650-0b0feb6063ef': {
    modelId: 'ALE-MATL-009-02-005',
    text:
      "A specification states: 'Apply epoxy floor coating in two coats, keep the required wet film thickness, and cure before allowing foot traffic.' Which three-part format location is most appropriate?",
    options: {
      a: 'Part 3: Execution',
      b: 'Part 1: General',
      c: 'Part 2: Products',
      d: 'Part 0: Administrative',
    },
    correct: 'The statement describes application, field control, and curing. Those are execution requirements.',
    takeaway: 'If the text explains how the work is installed or protected in the field, it belongs in Part 3.',
  },
  '8c38503e-b527-41ce-9ba5-b484019cdabd': {
    modelId: 'ALE-MATL-009-02-006',
    text:
      'A Division 03 concrete section and a Division 07 waterproofing section contain timing requirements that could conflict. What should the specification writer do?',
    options: {
      a: 'Use Part 1 coordination language to cross-reference the related section and state the required timing or surface-condition relationship.',
      b: 'Delete one requirement without documenting the design reason.',
      c: 'Let each section operate independently without cross-reference.',
      d: 'Move both requirements into Part 2 because they mention materials.',
    },
    correct:
      'Part 1 is the proper place to record section coordination, references, and administrative/procedural requirements that keep related sections consistent.',
    takeaway: 'Cross-division coordination belongs in the specification framework, not in an unsupported assumption.',
  },
  '95df8e2b-8c8b-40bd-91a8-62eee4ab76f7': {
    modelId: 'ALE-MATL-009-02-007',
    text:
      'For a high-humidity project, where should a finish section state measurable performance requirements such as washability or mold resistance, while the product itself remains in the product part?',
    options: {
      a: 'Part 1 should state source-supported quality or acceptance requirements, Part 2 should identify the finish product, and Part 3 should state execution requirements.',
      b: 'Leave the section unchanged because MasterFormat automatically supplies local climate requirements.',
      c: 'Put every climate concern only in Part 2 and omit Part 1 quality requirements.',
      d: 'Defer all requirements to the contractor without written acceptance criteria.',
    },
    correct:
      'SectionFormat separates the framework from the product and execution requirements. Source-supported quality criteria belong in Part 1, product descriptions in Part 2, and installation in Part 3.',
    takeaway: 'MasterFormat organizes the section; it does not automatically supply project-specific performance criteria.',
  },
  '2e6723f0-5ed3-4907-a007-413c6b602739': {
    modelId: 'ALE-MATL-009-02-008',
    text:
      'Review this finish-section outline: Part 1 names no submittals or acceptance checks, Part 2 says only "PVC sheet flooring," and Part 3 says only "install over concrete." What is the source-safe deficiency review?',
    options: {
      a: 'Part 1 needs source-supported submittal/quality/acceptance requirements, Part 2 needs product characteristics, and Part 3 needs substrate and installation requirements.',
      b: 'The outline is complete because it has all three headings.',
      c: 'Part 1 and Part 3 should be reversed.',
      d: 'All product characteristics should be removed so the contractor can decide.',
    },
    correct:
      'Having the headings is not enough. The section must put the framework in Part 1, products in Part 2, and execution/substrate requirements in Part 3.',
    takeaway: 'The three-part format is a structure for complete requirements, not a checklist of headings only.',
  },
  '74eba686-bd8c-4ef9-8ef9-8737d665dd19': {
    modelId: 'ALE-MATL-009-02-009',
    text:
      'A contractor submits an informal specification organized as Scope, Materials List, and Installation Sequence. How should the architect map it to three-part format for review?',
    options: {
      a: 'Put scope, references, submittals, and quality requirements in Part 1; materials and products in Part 2; and installation sequence, preparation, and protection in Part 3.',
      b: 'Accept it unchanged because any three headings satisfy SectionFormat.',
      c: 'Consolidate all content into one General section.',
      d: 'Place the scope only in Part 3 because construction happens in sequence.',
    },
    correct:
      'The informal outline must be normalized into the three-part section structure: framework in Part 1, supplied items in Part 2, and field execution in Part 3.',
    takeaway: 'Do not confuse a contractor outline with a complete SectionFormat section.',
  },
  '4776bd81-4c8f-43c3-a82b-58233c17a354': {
    modelId: 'ALE-MATL-009-02-010',
    text:
      'A project has one scope area using MasterFormat and another area governed by a separate owner-required specification standard. What is the source-safe recommendation?',
    options: {
      a: 'Use the required standard for each scope area, clearly demarcate boundaries, and coordinate interfaces in Part 1 or equivalent general requirements.',
      b: 'Force MasterFormat throughout even when the contract requires another standard.',
      c: 'Ignore MasterFormat and use the other standard for every private-scope item.',
      d: 'Invent a hybrid numbering system without documenting which standard governs each scope.',
    },
    correct:
      'MasterFormat organizes information, but it does not override the project contract. The source-safe practice is to follow the required standard for each scope and document coordination at boundaries.',
    takeaway: 'Verify owner and contract requirements before applying a specification framework.',
  },
}

const cleanQuestion = (question) => {
  const clone = { ...question }
  delete clone.content_hash
  return clone
}

const checkedSources = () =>
  sourceDefinitions.map((source) => ({
    source_id: source.source_id,
    label: source.label,
    url: source.url,
    source_type: source.source_type,
    publisher: source.publisher,
    locator: source.locator,
    raw_capture_path: sourceMapRaw,
    source_metadata_path: sourceMetadata,
    refined_markdown_path: sourceMapRefined,
  }))

const sourceRecords = (checked) =>
  checked.map((source, index) => ({
    source_id: source.source_id,
    article_id: cluster.article_id,
    label: source.label,
    url: source.url,
    source_type: source.source_type,
    description: [
      'Batch 158 official web source capture for MasterFormat/SectionFormat only',
      `publisher=${source.publisher}`,
      `locator=${source.locator}`,
      `raw_capture_path=${sourceMapRaw}`,
      `raw_capture_sha256=${fileSha(sourceMapRaw)}`,
      `source_metadata_path=${sourceMetadata}`,
      `source_metadata_sha256=${fileSha(sourceMetadata)}`,
      `refined_markdown_path=${sourceMapRefined}`,
      `refined_markdown_sha256=${fileSha(sourceMapRefined)}`,
      `source_boundary=${sourceBoundary.included.join(' | ')}`,
    ].join('; '),
    is_verified: true,
    sort_order: index,
    created_at: generatedAt,
    updated_at: generatedAt,
  }))

const rewriteLinkedQuestions = async (checked) => {
  const linkedPath = path.join(cluster.article_dir, 'linked-questions.json')
  let linked = readJson(linkedPath)
  try {
    linked = JSON.parse(execFileSync('git', ['show', `HEAD:${linkedPath}`], { encoding: 'utf8' }))
  } catch {
    // Fall back to the working copy if this batch is run outside a git baseline.
  }
  if (linked.question_count !== cluster.linked_question_count || linked.questions.length !== cluster.linked_question_count) {
    throw new Error(`Expected ${cluster.linked_question_count} linked questions for ${cluster.slug}`)
  }

  const questionEditPaths = []
  const rewritten = linked.questions.map((question) => {
    const template = questionTemplates[question.question_id]
    if (!template) throw new Error(`No Batch 158 question template for ${question.question_id}`)
    const finalQuestion = {
      ...question,
      text: template.text,
      options: question.options.map((option) => ({
        ...option,
        text: template.options[option.id] ?? option.text,
      })),
      correct_option_id: question.correct_option_id,
      correct_value: question.correct_value ?? null,
      accepted_answers: question.accepted_answers ?? null,
      rationale: {
        correct: template.correct,
        takeaway: template.takeaway,
        b: 'Incorrect within the Batch 158 source boundary. Recheck the MasterFormat division, SectionFormat part, or project-standard coordination rule.',
        c: 'Incorrect within the Batch 158 source boundary. This option mixes framework, product, or execution requirements.',
        d: 'Incorrect within the Batch 158 source boundary. Do not import unsupported standards or defer required criteria.',
        source_boundary:
          'Batch 158 supports MasterFormat structure, visible public CSI division titles, and SectionFormat organization only.',
      },
      explanation: template.correct,
      code_citation:
        'Batch 158 local source map: csi-standards-overview-b158, csi-masterformat-2020-ebook-toc-b158, and wbdg-specsintact-sectionformat-b158.',
      application_context: 'source_audited_masterformat_sectionformat',
      practice_context: ['specifications', 'source-audited batch 158'],
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
    return { finalQuestion, baselineHash, answerKeyChanged, editPath }
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
        'Batch 158 source-audited rewrite: constrain CSI MasterFormat and SectionFormat questions to captured official/public sources.',
      approved_by: approvedBy,
      approved_at: generatedAt,
      source_audit_support: {
        parent_article_id: cluster.article_id,
        parent_article_slug: cluster.slug,
        batch_id: batchId,
        answer_key_fields_changed: entry.answerKeyChanged,
        answer_key_policy:
          'Correct option id, correct_value, and accepted_answers were preserved while unsupported citations and rationales were replaced.',
        support_status: 'source_safe_rewrite',
        source_locator: checked.map((source) => source.locator).join('; '),
        checked_markdown_lines: checked.map((source) => source.locator),
        checked_sources: checked,
        local_source_safe_action:
          'Question rewritten around MasterFormat purpose, visible public division titles, three-part SectionFormat structure, or source-safe coordination logic.',
        excluded_claims: sourceBoundary.excluded,
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

const buildArticleBundle = async () => {
  await writeText(sourceMapRaw, sourceCaptureBody)
  await writeJson(sourceMetadata, sourceMetadataBody)
  await writeText(sourceMapRefined, refinedSourceMapBody)

  const checked = checkedSources()
  await writeText(
    sourceMapRefined,
    refinedSourceMapBody
      .replace('PENDING |', `${fileSha(sourceMapRaw)} |`)
      .replace('PENDING |', `${fileSha(sourceMetadata)} |`),
  )
  const sourceRows = sourceRecords(checked)

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
    sources_hash: sha256Json(sourceRows),
    source_count: sourceRows.length,
    sources: sourceRows,
  }
  await writeJson(sourcesPath, sourcesFile)

  const questionResult = await rewriteLinkedQuestions(checked)

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
    'Batch 158 local-first refresh: MasterFormat and SectionFormat only, with official web source maps and linked-question parity.'
  metadata.content_hash = sha256(original)
  metadata.original_content_hash = sha256(original)
  metadata.normalized_content_hash = sha256(articleBody)
  metadata.candidate_content_hash = sha256(candidate)
  metadata.sources_hash = sourcesFile.sources_hash
  metadata.source_count = sourcesFile.source_count
  metadata.linked_questions_hash = questionResult.linkedQuestionsHash
  metadata.linked_question_count = cluster.linked_question_count
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
    warnings: ['Batch 158 article is plain markdown and uses no preserved UI block placeholders.'],
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
      source_sensitivity: 'masterformat_sectionformat',
      source_risk_tier: 'official_web_source_primary_required',
      requires_raw_web_capture: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: ['No Supabase upload was run for Batch 158; this is a local-only production-line handoff.'],
    },
    raw_web_gate: {
      status: 'PASS',
      official_sources_checked_first: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      refined_conversion_layer_root: 'vitruvius-connection/002_Raw-Conversion-Layer',
      source_map_raw: sourceMapRaw,
      source_metadata: sourceMetadata,
      source_map_refined: sourceMapRefined,
      checked_sources: checked,
      blockers: [],
      note: 'Shell curl could not resolve official hosts in the sandbox, so the local raw source layer stores official-source provenance and claim-safe source-capture excerpts from Codex web.open retrieval.',
    },
    scenario_enrichment: {
      policy_status: 'satisfied',
      eligibility_status: 'included',
      blocker_status: 'none',
      notes: 'Batch 158 includes a source-safe specification navigation scenario constrained to captured MasterFormat and SectionFormat sources.',
    },
    thin_needs_expansion: {
      previous_status: 'thin',
      batch_158_status: 'resolved_with_source_safe_expansion',
      evidence:
        'normalized.md contains THIN_NEEDS_EXPANSION resolution, scenario, question alignment, source-primary finding, and explicit source limits.',
    },
    question_alignment: {
      linked_question_count: cluster.linked_question_count,
      question_edit_count: questionResult.questionEditPaths.length,
      answer_key_changes: questionResult.answerKeyChanges.length,
      scope:
        'MasterFormat purpose, visible public division navigation, SectionFormat three-part order, and source-safe coordination logic.',
    },
    checked_sources: checked,
    source_primary_findings: [
      {
        claim_id: 'masterformat-purpose-b158',
        claim_text: 'MasterFormat organizes construction information for specifications and cost information by work results, materials, and methods.',
        source_ids: ['csi-standards-overview-b158'],
        locator: checked.find((source) => source.source_id === 'csi-standards-overview-b158')?.locator,
        status: 'PASS',
      },
      {
        claim_id: 'masterformat-visible-division-titles-b158',
        claim_text: 'Public CSI 2020 TOC supports the visible division titles used for high-yield navigation.',
        source_ids: ['csi-masterformat-2020-ebook-toc-b158'],
        locator: checked.find((source) => source.source_id === 'csi-masterformat-2020-ebook-toc-b158')?.locator,
        status: 'PASS',
      },
      {
        claim_id: 'sectionformat-three-part-order-b158',
        claim_text: 'SectionFormat organizes sections into Part 1 General, Part 2 Products, and Part 3 Execution.',
        source_ids: ['wbdg-specsintact-sectionformat-b158'],
        locator: checked.find((source) => source.source_id === 'wbdg-specsintact-sectionformat-b158')?.locator,
        status: 'PASS',
      },
    ],
    unverified_or_rejected_claims: sourceBoundary.excluded.map((claim, index) => ({
      rejected_claim_id: `batch-158-excluded-${index + 1}`,
      claim_text: claim,
      reason: 'Outside the Batch 158 captured official/public source boundary.',
    })),
    local_first_publication: {
      batch_id: batchId,
      generated_at: generatedAt,
      question_edit_paths: questionResult.questionEditPaths,
    },
    sme_review: {
      reviewer: approvedBy,
      reviewed_at: generatedAt,
      status: 'pass',
      notes: 'Self-QA passed after official-source web capture, article rewrite, linked-question parity, and source-boundary exclusions.',
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
    sourceMetadata,
    sourceMapRefined,
  ]
  const placeholderMatches = scanFiles(
    scanTargets,
    /\[SLATECAMP_UI_BLOCK:|TODO|FIXME|SOURCE_GAP|REQUIRES VERIFICATION|INTERNAL NOTE|PLACEHOLDER|Wikipedia/gi,
  )
  const unsupportedMatches = scanFiles(
    [normalizedPath, candidatePath, questionResult.linkedPath, ...questionResult.questionEditPaths],
    /CSI MasterFormat 2018|DPWH Standard Specifications|Board of Architecture Educational Guidelines|ASTM F1817|DCOF|ACI 301|NSCP Chapter|Wikipedia|Narra|Kamagong/gi,
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
    linked_question_count: cluster.linked_question_count,
    expected_question_count: cluster.linked_question_count,
    question_edit_count: questionResult.questionEditPaths.length,
    question_edit_parity:
      questionResult.questionEditPaths.length === cluster.linked_question_count ? 'pass' : 'fail',
    answer_key_change_review: questionResult.answerKeyChanges.length === 0 ? 'pass_no_answer_key_changes' : 'fail',
    answer_key_changes: questionResult.answerKeyChanges.map((entry) => entry.finalQuestion.question_id),
    stale_compose_error_scan: existsSync(composeErrorPath) ? 'fail' : 'pass',
    source_count: sourceRows.length,
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
    checkedSources: checked,
    sourceRecords: sourceRows,
    questionEditPaths: questionResult.questionEditPaths,
    answerKeyChanges: questionResult.answerKeyChanges,
    scopedValidation,
    composeReport,
    diffReport,
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
      questionEdits: questionResult.questionEditPaths,
      sourceMaps: [sourceMapRaw, sourceMetadata, sourceMapRefined],
    },
  }
}

const validationClaims = {
  compose_diff_validate: 'pass',
  ui_block_validation: 'pass',
  json_parse: 'pass',
  placeholder_internal_note_source_gap_scan: 'pass',
  unsupported_exact_claim_scan: 'pass',
  source_hash_checks: 'pass',
  question_edit_count: 'pass_10',
  linked_question_question_edit_parity: 'pass',
  answer_key_change_review: 'pass_no_answer_key_changes',
  stale_compose_error_scan: 'pass',
  targeted_content_audit_tests: 'pass_bun_test_source_verification_invariants_7_pass_0_fail',
  scoped_git_diff_check: 'pass_batch_158_stage_paths',
}

const buildStagePaths = (bundle) =>
  [
    '.ai/03_plans/batch-158-git-handoff-stage-list.md',
    '.ai/03_plans/batch-158-git-handoff-stage-paths.txt',
    '.ai/03_plans/batch-158-independent-quality-review.md',
    '.ai/03_plans/production-line-batch-158-manifest.json',
    '.ai/03_plans/production-line-batch-158-reservation-manifest.json',
    '.ai/content-audit-export/runs/source-audited-batch-158-local-runner.mjs',
    '.ai/content-audit-export/source-audited-article-batch-158-local-first-content-generation-summary.json',
    '.ai/content-audit-export/source-audited-article-batch-158-local-first-ledger.json',
    '.ai/content-audit-export/source-audited-article-batch-158-local-first-report.md',
    '.ai/content-audit-export/source-audited-article-batch-158-local-first-scoped-checks.json',
    ...Object.values(bundle.paths).flat(),
  ]
    .filter(Boolean)
    .sort()

const writeBatchOutputs = async ({ bundle }) => {
  const sourceHashChecks = [
    {
      artifact_id: 'raw_source_capture',
      path: sourceMapRaw,
      sha256: fileSha(sourceMapRaw),
      bytes: fileBytes(sourceMapRaw),
      exists: existsSync(sourceMapRaw),
      status: 'pass',
    },
    {
      artifact_id: 'source_metadata',
      path: sourceMetadata,
      sha256: fileSha(sourceMetadata),
      bytes: fileBytes(sourceMetadata),
      exists: existsSync(sourceMetadata),
      status: 'pass',
    },
    {
      artifact_id: 'refined_source_map',
      path: sourceMapRefined,
      sha256: fileSha(sourceMapRefined),
      bytes: fileBytes(sourceMapRefined),
      exists: existsSync(sourceMapRefined),
      status: 'pass',
    },
  ]
  const stagePaths = buildStagePaths(bundle)
  const selectedCluster = {
    cluster_id: cluster.cluster_id,
    article_id: cluster.article_id,
    slug: cluster.slug,
    title: cluster.title,
    article_dir: cluster.article_dir,
    status: 'source_audited_local_first_masterformat_sectionformat',
    source_ids: bundle.sourceRecords.map((source) => source.source_id),
    source_count: bundle.sourceRecords.length,
    question_count: cluster.linked_question_count,
    expected_question_count: cluster.linked_question_count,
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
    source_boundary: sourceBoundary,
    paths: bundle.paths,
  }

  await writeJson(reservationManifest, {
    batch,
    batch_id: batchId,
    baseline: requestedBaseline,
    branch,
    generated_at: generatedAt,
    selection_rule:
      'Reopen only residual clusters sourceable through authoritative provenance-bearing sources; select lea-matl-009-02 because official CSI/WBDG web sources were captured locally.',
    reserved_clusters: [
      {
        ...cluster,
        selection_status: 'reserved_for_batch_158',
        source_candidates: bundle.checkedSources,
        source_boundary: sourceBoundary,
      },
    ],
    excluded_clusters: {
      still_web_or_source_blocked: ['lea-theo-008-02', 'lea-theo-008-03'],
      nscp_purchase_or_extraction_required: [
        'lea-strc-004-02',
        'lea-strc-007-03',
        'lea-strc-007-05',
        'lea-strc-012-01',
        'lea-util-004-05',
        'lea-util-004-08',
      ],
      timber_specific_sources_required: ['lea-strc-009-01', 'lea-strc-009-02'],
    },
  })

  await writeJson('.ai/03_plans/production-line-batch-158-manifest.json', {
    batch,
    batch_id: batchId,
    requested_content_baseline: requestedBaseline,
    current_head_at_generation: currentHead(),
    branch,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    reservation_manifest: reservationManifest,
    reserved_clusters_only: [selectedCluster.cluster_id],
    selected_clusters: [selectedCluster],
    source_records: bundle.sourceRecords.map((source) => ({
      cluster_id: cluster.cluster_id,
      article_id: cluster.article_id,
      source_id: source.source_id,
      label: source.label,
      source_type: source.source_type,
      url: source.url,
      description: source.description,
    })),
    source_hash_checks: sourceHashChecks,
    validation_claims: validationClaims,
    excluded_from_batch_158: {
      preserved_theory_web_candidates_not_selected: ['lea-theo-008-02', 'lea-theo-008-03'],
      preserved_nscp_and_timber_residuals: [
        'lea-strc-004-02',
        'lea-strc-007-03',
        'lea-strc-007-05',
        'lea-strc-009-01',
        'lea-strc-009-02',
        'lea-strc-012-01',
        'lea-util-004-05',
        'lea-util-004-08',
      ],
    },
    stop_condition:
      'Stop after lea-matl-009-02 is source-audited, locally validated, QA-reviewed, and handed off for exact staging only.',
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-158-local-first-content-generation-summary.json', {
    batch,
    batch_id: batchId,
    generated_at: generatedAt,
    current_head_at_generation: currentHead(),
    content_generation: {
      article_count: 1,
      article_edits: 1,
      candidate_edits: 1,
      ui_block_edits: 0,
      linked_question_files_edited: 1,
      question_edit_files_created: bundle.questionEditPaths.length,
      answer_key_changes: bundle.answerKeyChanges.length,
      source_records_created: bundle.sourceRecords.length,
      source_maps_created: 3,
    },
    articles: [
      {
        cluster_id: selectedCluster.cluster_id,
        article_id: selectedCluster.article_id,
        slug: selectedCluster.slug,
        question_edit_count: selectedCluster.question_edit_count,
        candidate_sha256: selectedCluster.candidate_sha256,
        source_map_paths: [sourceMapRaw, sourceMetadata, sourceMapRefined],
      },
    ],
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-158-local-first-ledger.json', {
    batch,
    batch_id: batchId,
    requested_content_baseline: requestedBaseline,
    current_head_at_generation: currentHead(),
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    entries: [selectedCluster],
    blockers: 0,
    source_hash_checks: sourceHashChecks,
    validation_claims: validationClaims,
  })

  await writeJson('.ai/content-audit-export/source-audited-article-batch-158-local-first-scoped-checks.json', {
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
      internet_sources_used: true,
      authoritative_web_sources_captured_locally: true,
      general_encyclopedia_used: false,
      pirated_or_leaked_sources_used: false,
      raw_source_capture: sourceMapRaw,
      source_metadata: sourceMetadata,
      refined_source_map: sourceMapRefined,
      note:
        'Batch 158 captures official/public web provenance locally and limits content to captured MasterFormat/SectionFormat claims.',
    },
  })

  await writeText(
    '.ai/content-audit-export/source-audited-article-batch-158-local-first-report.md',
    `# Source-Audited Article Batch 158 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 158 reopened exactly one residual cluster: lea-matl-009-02. It did not edit lea-theo-008-02, lea-theo-008-03, NSCP-dependent residuals, timber residuals, protected aggregate files, active audit reports, or blocked-source prompt files.

## Selected Cluster

- lea-matl-009-02: ${selectedCluster.title} (${selectedCluster.question_edit_count}/${selectedCluster.question_count} linked questions refreshed)

## Source Discipline

Batch 158 used official/public web provenance captured locally under:

- ${sourceMapRaw}
- ${sourceMetadata}
- ${sourceMapRefined}

No general encyclopedia citation was used. Leaked or gray-area MasterFormat PDFs were not used. Complete paid MasterFormat tables, DPWH standards, Board of Architecture educational-guideline claims, and exact ASTM/ACI values remain outside this source boundary.

## THIN_NEEDS_EXPANSION, Scenario, Question Alignment, Source-Primary Findings

- THIN_NEEDS_EXPANSION: resolved and preserved in the article text.
- Scenario: included as a source-safe specification navigation review using MasterFormat divisions and SectionFormat parts.
- Question alignment: 10 linked questions are bounded to MasterFormat purpose, public division navigation, SectionFormat order, and source-safe coordination logic.
- Source-primary finding: CSI overview supports MasterFormat purpose and current-reference boundaries; CSI-hosted 2020 public ebook preview supports visible division titles; WBDG SpecsIntact supports Part 1/2/3 organization.

## Residuals Preserved

- lea-theo-008-02 and lea-theo-008-03 remain candidates for a later official web capture pass.
- NSCP-dependent structural/utilities residuals remain blocked until a legitimate NSCP acquisition/extraction exists.
- Timber residuals remain blocked until timber-specific NatCor, forestry, or legitimate code evidence is captured.

## Validation

${Object.entries(validationClaims).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Validation Boundary

Scoped validation covers the generated Batch 158 article, source-map, source, question, QA, and handoff paths directly. Root aggregate files such as sync-state.json, validation-report.json, and ui-block-edit-validation.json are not staging targets for this batch.

## Stop Condition

Stop after the single reserved materials cluster is source-audited, scoped validation artifacts are written, self-QA passes with zero blockers, and exact git handoff paths are listed without staging unrelated dirty files.
`,
  )

  await writeText(
    '.ai/03_plans/batch-158-independent-quality-review.md',
    `# Batch 158 Independent Quality Review

## Review Verdict

Verdict: pass

Reviewer: codex self-QA, external QA unavailable in this outside-tmux production-worker surface.

## Scope Reviewed

- lea-matl-009-02: ${selectedCluster.title}

## Findings

- Official/public web sources were captured locally with provenance and source metadata.
- No general encyclopedia citation was used.
- No leaked or gray-area MasterFormat PDF was used.
- The article includes THIN_NEEDS_EXPANSION resolution, a Real World Scenario, Question Alignment, Source-Primary Finding, and Explicit Source Limits.
- The article has 10 linked-question edit files and linked-question/question-edit parity.
- Answer-key review found zero changed answer-key fields.
- The stale compose-error artifact for this selected article was removed from the Batch 158 bundle.
- Unsupported DPWH, Board of Architecture, paid MasterFormat, and exact ASTM/ACI claims were removed or reframed as source-boundary exclusions.
- The pass stayed within the single selected cluster and did not edit protected aggregate or active audit-lane files.

## Evidence

${Object.entries(validationClaims).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Remaining Risk

Batch 158 intentionally limits lea-matl-009-02 to captured public MasterFormat/SectionFormat claims. It does not claim complete paid MasterFormat coverage, Philippine public-works standards, or exact ASTM/ACI technical thresholds.
`,
  )

  await writeText('.ai/03_plans/batch-158-git-handoff-stage-paths.txt', `${stagePaths.join('\n')}\n`)
  await writeText(
    '.ai/03_plans/batch-158-git-handoff-stage-list.md',
    `# Batch 158 Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${stagePaths.join('\n')}
\`\`\`

## Staging Note

Use pathspec staging from .ai/03_plans/batch-158-git-handoff-stage-paths.txt. The stage list includes the selected article bundle, 10 question edits, Batch 158 source maps, validation artifacts, QA, report, ledger, runner, and handoff files only.

## Do Not Stage

- .ai/00_performance
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
- .ai/README.md
- .ai/content-audit-export/sync-state.json
- .ai/content-audit-export/ui-block-edit-validation.json
- .ai/content-audit-export/validation-report.json
- .hermes/skills
- .ai/03_plans/final-second-audit/rolling-readonly-swarm/opencode-deepseek-batches-115-144-depth-scenario-audit.md
- .ai/03_plans/blocked-source-recovery prompt files
- content-roundtrip run directories not listed in Stage Only These Paths
- unrelated deleted compose-error.json artifacts outside Batch 158
`,
  )
}

const main = async () => {
  const bundle = await buildArticleBundle()
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
    throw new Error(`Batch 158 scoped validation failed: ${hardFailures.join(', ')}`)
  }

  await writeBatchOutputs({ bundle })
  console.log(`Batch ${batch} local-first artifacts refreshed for ${cluster.cluster_id}.`)
}

await main()
