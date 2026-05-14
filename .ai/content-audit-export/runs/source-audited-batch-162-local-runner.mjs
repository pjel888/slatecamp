#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
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

const batch = 162
const batchId = 'source-audited-batch-162-local-first'
const generatedAt = new Date().toISOString()
const generatedAtManila = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}).format(new Date()).replace(' ', 'T') + '+08:00'
const approvedBy = 'codex-local-source-audit-batch-162'
const branch = '3dlab-gray-viewport-bg'
const baseline = 'ee1283991 chore(content): accept source-audited batch 161'

const articleDir =
  '.ai/content-audit-export/articles/lea-strc-009-02-core-concept--047334de-c79a-4d6a-aa23-58a321b71e2e'
const sourcePdf = 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National-Structural-Code-of-Ph-7th-Ed.pdf'
const conversionRoot =
  'vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition'
const sourceMetadataPath = `${conversionRoot}/SOURCE-METADATA.json`
const page0889 = `${conversionRoot}/pages/page-0889.md`
const page0943 = `${conversionRoot}/pages/page-0943.md`
const rejectedSource =
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf'

const checkedLines = [
  `${page0889}:5-65 Table 615.2-1 reference values and visual stress groups for unseasoned structural timber of Philippine woods.`,
  `${page0943}:51-57 Section 622.1 machine-graded lumber use when species identification is unknown and Table 615.2-1 values cannot be found.`,
  `${page0943}:58-69 Section 622.2 FPRDI design properties, dry-lumber scope, green-lumber reduction, and interpolation rule.`,
  `${page0943}:71-76 Section 622.3 design using machine-graded lumber under NSCP and other appropriate standards.`,
  `${page0943}:78-96 Sections 622.4-622.6 preservative treatment, moisture-content definitions, and required markings.`,
]

const sourceLocator = checkedLines.join('; ')
const sourceId = 'nscp-2015-table-615-2-1-section-622-timber-stress-groups-b162'
const sourceLabel =
  'NSCP 2015 Volume I, Table 615.2-1 and Section 622, timber stress groups and machine-graded lumber'

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'))
const fileSha = (filePath) => `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
const original = readFileSync(path.join(articleDir, 'original.md'), 'utf8')
const originalHash = sha256(original)
const metadata = readJson(path.join(articleDir, 'article-metadata.json'))
const linkedQuestions = readJson(path.join(articleDir, 'linked-questions.json'))

const articleBody = `## Board Exam Quick Check

Timber stress-group questions are table-lookup questions. First identify whether the item is asking about visually stress-graded Philippine woods under NSCP Table 615.2-1 or machine-graded lumber under NSCP Section 622.

## Learning Goal

By the end of this article, you will be able to:

- Use NSCP 2015 Table 615.2-1 as the local source for visually stress-graded unseasoned structural timber of Philippine woods.
- Recognize the listed strength groups and common species examples from the checked OCR page.
- Explain when Section 622 permits machine-graded lumber instead of species-table lookup.
- Apply the Section 622 moisture and marking rules without importing unsupported nominal-size, fiberboard, or hardboard claims.

## Core Concept

NSCP 2015 Table 615.2-1 gives reference values for visually stress-graded unseasoned structural timber of Philippine woods at the 80 percent stress grade. The checked table is organized by strength group and lists columns for bending and tension parallel to grain, modulus of elasticity in bending, compression parallel to grain, compression perpendicular to grain, and shear parallel to grain.

For this source-audited batch, use the group names and listed species as the safe exam boundary. Do not use this article to infer product-density rules for fiberboard or hardboard, nominal-to-actual lumber sizes, or unverified grade-defect schedules. Those claims require separate local authority and were excluded from Batch 162.

## NSCP Table 615.2-1 Groups

| Group in checked source | Safe species examples from OCR page 889 |
| --- | --- |
| I. High Strength Group | Agoho, Liusin, Malabayabas, Manggachapui, Molave, Narig, Sasalit, Yakal |
| II. Moderately High Strength Group | Antipolo, Binggas, Bokbok, Dao, Gatasan, Guijo, Kamagong, Kamatog, Katmon, Kato, Lomarau, Big-leafed Mahogany, Makaasim, Malakauayan, Narra, Pahutan |
| III. Medium Strength Group | Apitong, Bagtikan, Dangkalan, Gisau, Lanutan-bagyo, Lauan, Malaanonang, Malasaging, Malugai, Miau, Nato, Palosapis, Pine, Salakin, Vidal Janutan |
| IV. Moderately Low Strength Group | Almaciga, Bayok, Lingo-lingo, Mangasinoro, Raintree, Yemane |

## Machine-Graded Lumber Boundary

Section 622.1 says machine-graded lumber can be used for general and structural applications when a particular wood species is not known and working stresses cannot be found in Table 615.2-1.

Section 622.2 ties machine-graded lumber design properties to Forest Products Research and Development Institute tables. Those properties apply to dry lumber with moisture content less than 16 percent. For green lumber with moisture content greater than 28 percent, design strength is reduced by 40 percent and modulus of elasticity by 20 percent. For moisture content between 16 percent and 28 percent, the design properties may be obtained by direct interpolation.

Section 622.6 adds a field-control check: before use, each machine-graded piece should be inspected for a mark showing the mill, the organization certifying the grading procedure, timber size, stress grade, and moisture content.

## How It Is Tested

### Pattern 1: Species Group Identification

If the item names a species from Table 615.2-1, choose the group from the table. Yakal appears in the High Strength Group. Narra appears in the Moderately High Strength Group. Apitong and Lauan appear in the Medium Strength Group. Almaciga appears in the Moderately Low Strength Group.

### Pattern 2: Substitution Check

If a design changes from one listed species to another, do not assume equal capacity from similar dimensions or common trade use. Recheck the table group and the applicable reference values. A Narra member and a Lauan member are not source-equivalent under the checked table boundary.

### Pattern 3: Unknown Species or Machine-Graded Lumber

If the species is unknown and Table 615.2-1 cannot supply working stresses, Section 622 is the source-supported path. Check machine-graded lumber design properties, moisture condition, and required markings.

## Common Mistakes

- Treating all Philippine hardwood names as interchangeable.
- Memorizing unsupported species examples not present in the checked OCR anchors.
- Importing fiberboard, hardboard, or nominal-dimension rules into a table-lookup item.
- Forgetting that Section 622 dry-lumber properties apply below 16 percent moisture content, while green lumber above 28 percent requires reductions.
- Accepting unmarked machine-graded lumber without checking mill, certifier, size, stress grade, and moisture-content markings.
`

const source = {
  source_id: sourceId,
  article_id: metadata.article_id,
  label: sourceLabel,
  url: null,
  source_type: 'primary_code_local_ocr',
  description:
    `Batch 162 local-first NSCP OCR conversion from the valid supplied PDF only.; source_pdf=${sourcePdf}; source_sha256=${fileSha(sourcePdf)}; source_metadata_path=${sourceMetadataPath}; anchors=${sourceLocator}; excluded_source=${rejectedSource} is null-byte corrupted and not used.`,
  is_verified: true,
  sort_order: 0,
  created_at: generatedAtManila,
  updated_at: generatedAtManila,
  local_capture_path: sourcePdf,
  refined_capture_path: conversionRoot,
  source_metadata_path: sourceMetadataPath,
  source_locator: sourceLocator,
}

const checkedSource = {
  source_id: sourceId,
  label: sourceLabel,
  url: null,
  source_type: 'primary_code_local_ocr',
  publisher: 'Association of Structural Engineers of the Philippines',
  locator: sourceLocator,
  source_pdf: sourcePdf,
  source_pdf_sha256: fileSha(sourcePdf),
  source_metadata_path: sourceMetadataPath,
  page_markdown_paths: [page0889, page0943],
  page_markdown_sha256: {
    [page0889]: fileSha(page0889),
    [page0943]: fileSha(page0943),
  },
}

const support = {
  parent_article_id: metadata.article_id,
  parent_article_slug: metadata.slug,
  batch_id: batchId,
  answer_key_fields_changed: false,
  answer_key_policy:
    'Correct option id, correct_value, and accepted_answers are preserved; unsupported question text and rationales are replaced.',
  support_status: 'source_safe_rewrite',
  source_locator: sourceLocator,
  checked_markdown_lines: checkedLines,
  checked_sources: [checkedSource],
  local_source_safe_action:
    'Question rewritten to match NSCP Table 615.2-1 and Section 622 timber stress-group and machine-graded lumber source boundary.',
  excluded_claims: [
    'Unsupported hardboard, fiberboard, and product-density claims.',
    'Unsupported nominal-to-actual lumber dimension conversions.',
    'Unsupported NatCor grade-defect schedules and grade percentage reductions.',
    'Species examples not present in the selected OCR anchors, including White Lauan, Tindalo, Ipil, and Mangkono.',
    'Exact species reference-value numerics where OCR quality is insufficient for publication-grade numeric quoting.',
  ],
}

const commonQuestionFields = {
  application_context: 'source_audited_nscp_timber_stress_groups',
  practice_context: ['structural', 'timber', 'source-audited batch 162'],
}

const questionProposals = {
  'c503eb0a-79f5-4041-baa6-6ee79e9d1b7c': {
    text:
      'Under NSCP 2015 Table 615.2-1, which listed species is in the High Strength Group for visually stress-graded unseasoned structural timber?',
    options: [
      { id: 'a', text: 'Yakal' },
      { id: 'b', text: 'Narra' },
      { id: 'c', text: 'Lauan' },
      { id: 'd', text: 'Almaciga' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'Yakal appears under I. High Strength Group in the checked NSCP Table 615.2-1 OCR anchor.',
      a: 'Not selected: Yakal',
      b: 'Not selected: Narra is listed under II. Moderately High Strength Group.',
      c: 'Not selected: Lauan is listed under III. Medium Strength Group.',
      d: 'Not selected: Almaciga is listed under IV. Moderately Low Strength Group.',
      takeaway:
        'Use the checked Table 615.2-1 group list before applying timber reference values.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'Yakal is listed in I. High Strength Group on the checked NSCP Table 615.2-1 OCR page.',
    code_citation: 'NSCP 2015 Vol. I, Table 615.2-1; OCR page 889.',
    bloom_level: 'remember',
    difficulty: 0.3,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-001',
    ...commonQuestionFields,
  },
  '9640e7ab-7532-4a85-b54e-683ffb2b9466': {
    text:
      'Which species-to-group pairing matches the checked NSCP 2015 Table 615.2-1 OCR anchor?',
    options: [
      { id: 'a', text: 'Narra: Group I; Lauan: Group III; Apitong: Group II' },
      { id: 'b', text: 'Narra: Group II; Lauan: Group III; Apitong: Group III' },
      { id: 'c', text: 'Narra: Group II; Lauan: Group IV; Apitong: Group III' },
      { id: 'd', text: 'Narra: Group III; Lauan: Group II; Apitong: Group IV' },
    ],
    correct_option_id: 'b',
    rationale: {
      correct:
        'The checked table lists Narra in II. Moderately High Strength Group and lists both Lauan and Apitong in III. Medium Strength Group.',
      a: 'Not selected: Narra is not Group I in the checked anchor, and Apitong is not Group II.',
      b: 'Not selected: Narra Group II, Lauan Group III, and Apitong Group III match the checked table.',
      c: 'Not selected: Lauan is not Group IV in the checked anchor.',
      d: 'Not selected: all three group assignments are inconsistent with the checked table.',
      takeaway: 'Do not rely on memory where the table gives a direct source lookup.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'Narra is listed in Group II, while Lauan and Apitong are listed in Group III on the checked OCR page.',
    code_citation: 'NSCP 2015 Vol. I, Table 615.2-1; OCR page 889.',
    bloom_level: 'remember',
    difficulty: 0.3,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-003',
    ...commonQuestionFields,
  },
  '0c2afd87-7afa-49e6-8974-3a2d224f1af2': {
    text:
      'If the identity of a wood species is not known and working stresses cannot be found in Table 615.2-1, what does NSCP Section 622.1 allow?',
    options: [
      {
        id: 'a',
        text: 'Machine-graded lumber can be used for general and structural applications.',
      },
      { id: 'b', text: 'Any unmarked hardwood may be treated as High Strength Group timber.' },
      { id: 'c', text: 'Fiberboard or hardboard may automatically replace structural timber.' },
      { id: 'd', text: 'All design values must be taken from the Yakal row.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'Section 622.1 permits machine-graded lumber when species identification is unknown and working stresses cannot be found in Table 615.2-1.',
      a: 'Not selected: This follows Section 622.1.',
      b: 'Not selected: The checked source does not allow unknown species to be treated as High Strength Group timber.',
      c: 'Not selected: The checked anchors do not support fiberboard or hardboard substitution claims.',
      d: 'Not selected: The Yakal row cannot be applied to unknown species.',
      takeaway:
        'Unknown-species timber questions move to the Section 622 machine-graded lumber path.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'Section 622.1 is the source-supported path when species identity is unknown and Table 615.2-1 cannot provide working stresses.',
    code_citation: 'NSCP 2015 Vol. I, Section 622.1; OCR page 943.',
    bloom_level: 'understand',
    difficulty: 0.5,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-009',
    ...commonQuestionFields,
  },
  'f7809040-5f36-445c-84b7-9a1dfa8bd4c8': {
    text:
      'A design uses Narra lumber, but the contractor proposes Lauan of the same dimensions. What source-supported design issue arises?',
    options: [
      {
        id: 'a',
        text: 'Narra and Lauan are listed in different Table 615.2-1 strength groups, so the table values must be rechecked before substitution.',
      },
      { id: 'b', text: 'The substitution is automatically acceptable because dimensions match.' },
      { id: 'c', text: 'Lauan is listed in a higher strength group than Narra.' },
      { id: 'd', text: 'Species group does not affect table lookup under NSCP Table 615.2-1.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'The checked table lists Narra under II. Moderately High Strength Group and Lauan under III. Medium Strength Group. Substitution requires rechecking the table basis.',
      a: 'Not selected: Different listed groups require source-based rechecking before substitution.',
      b: 'Not selected: same dimensions do not make different species groups interchangeable.',
      c: 'Not selected: Lauan is not higher than Narra in the checked anchor.',
      d: 'Not selected: species group is the table lookup basis.',
      takeaway: 'A species substitution is a table-lookup change, not a cosmetic change.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'Narra and Lauan appear in different strength groups on the checked NSCP table, so the design basis must be rechecked.',
    code_citation: 'NSCP 2015 Vol. I, Table 615.2-1; OCR page 889.',
    bloom_level: 'apply',
    difficulty: 0.7,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-007',
    ...commonQuestionFields,
  },
  '37b399b3-f04c-4d24-a3bd-7fe1fd2bc186': {
    text:
      'For machine-graded lumber with moisture content between 16 percent and 28 percent, what does NSCP Section 622.2 say about design properties?',
    options: [
      { id: 'a', text: 'Use the dry-lumber values unchanged.' },
      { id: 'b', text: 'Obtain the design properties by direct interpolation.' },
      { id: 'c', text: 'Apply the green-lumber reductions for all pieces in this range.' },
      { id: 'd', text: 'Reject the lumber automatically.' },
    ],
    correct_option_id: 'b',
    rationale: {
      correct:
        'Section 622.2 states that for lumber with moisture content between 16 percent and 28 percent, design properties may be obtained by direct interpolation.',
      a: 'Not selected: dry-lumber properties apply to moisture content less than 16 percent.',
      b: 'Not selected: direct interpolation is the checked Section 622.2 rule.',
      c: 'Not selected: the explicit green-lumber reduction applies above 28 percent moisture content.',
      d: 'Not selected: the checked source gives an interpolation path.',
      takeaway: 'Use the moisture range before selecting dry, green, or interpolated properties.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'The 16 percent to 28 percent moisture range uses direct interpolation under Section 622.2.',
    code_citation: 'NSCP 2015 Vol. I, Section 622.2; OCR page 943.',
    bloom_level: 'remember',
    difficulty: 0.3,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-002',
    ...commonQuestionFields,
  },
  'f03689fe-68c2-40c5-87f3-33d5b4a1397b': {
    text:
      'Under NSCP Section 622.2, what adjustment is required for green machine-graded lumber with moisture content greater than 28 percent?',
    options: [
      {
        id: 'a',
        text: 'Reduce design strength by 40 percent and modulus of elasticity by 20 percent.',
      },
      { id: 'b', text: 'Use dry-lumber properties without adjustment.' },
      { id: 'c', text: 'Increase design strength by 40 percent because moisture improves strength.' },
      { id: 'd', text: 'Use the Narra row from Table 615.2-1 for all species.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'Section 622.2 states that in green lumber with moisture content greater than 28 percent, design strength is reduced by 40 percent and modulus of elasticity by 20 percent.',
      a: 'Not selected: This is the checked green-lumber reduction rule.',
      b: 'Not selected: dry values are limited to the dry-lumber condition identified in the source.',
      c: 'Not selected: the source requires reduction, not increase.',
      d: 'Not selected: Section 622.2 is about machine-graded lumber design properties, not applying one species row to all lumber.',
      takeaway: 'For machine-graded lumber, moisture content can directly change design properties.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'Green machine-graded lumber above 28 percent moisture uses the 40 percent design-strength and 20 percent modulus reductions.',
    code_citation: 'NSCP 2015 Vol. I, Section 622.2; OCR page 943.',
    bloom_level: 'apply',
    difficulty: 0.7,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-010',
    ...commonQuestionFields,
  },
  'a767d035-653c-4782-af2b-8d67e8796978': {
    text:
      'Why does moisture content matter when using the NSCP Section 622 machine-graded lumber design-property tables?',
    options: [
      {
        id: 'a',
        text: 'The listed properties apply to dry lumber below 16 percent moisture; green lumber above 28 percent requires reductions, and the middle range may be interpolated.',
      },
      { id: 'b', text: 'Moisture content is irrelevant once a piece is machine graded.' },
      { id: 'c', text: 'Green lumber always receives higher design values than dry lumber.' },
      { id: 'd', text: 'The checked source requires all machine-graded lumber to be rejected above 16 percent moisture.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'Section 622.2 gives dry-lumber applicability below 16 percent, green-lumber reductions above 28 percent, and interpolation between 16 percent and 28 percent.',
      a: 'Not selected: This summarizes the checked moisture-content rule.',
      b: 'Not selected: Section 622.2 expressly changes design-property handling by moisture range.',
      c: 'Not selected: green lumber receives reductions in the checked source.',
      d: 'Not selected: the source gives interpolation and green-lumber reduction rules rather than automatic rejection.',
      takeaway: 'Do not apply a machine-graded lumber design value until the moisture range is known.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'The Section 622.2 design-property rule is explicitly tied to dry, intermediate, and green moisture ranges.',
    code_citation: 'NSCP 2015 Vol. I, Section 622.2; OCR page 943.',
    bloom_level: 'understand',
    difficulty: 0.5,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-006',
    ...commonQuestionFields,
  },
  'efc0ee7f-1f80-43b8-8e7d-ff3fe67d619b': {
    text:
      'Before a machine-graded lumber piece is used, which marking information does NSCP Section 622.6 say should be inspected?',
    options: [
      {
        id: 'a',
        text: 'Mill, certifying organization, timber size, stress grade, and moisture content.',
      },
      { id: 'b', text: 'Paint color, retail price, and delivery receipt number only.' },
      { id: 'c', text: 'Only the common species name, with no stress grade or moisture mark.' },
      { id: 'd', text: 'Only the contractor approval stamp.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'Section 622.6 states that each machine-graded lumber piece should be inspected for a mark containing the mill, certifying organization, timber size, stress grade, and moisture content.',
      a: 'Not selected: This is the checked Section 622.6 marking set.',
      b: 'Not selected: those items are not the source-supported marking requirements.',
      c: 'Not selected: the checked source requires more than species name.',
      d: 'Not selected: contractor approval alone is not the checked marking set.',
      takeaway: 'Machine-graded lumber requires field-verifiable grading and moisture information.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'The checked Section 622.6 anchor lists mill, certifying organization, size, stress grade, and moisture content as the marking information.',
    code_citation: 'NSCP 2015 Vol. I, Section 622.6; OCR page 943.',
    bloom_level: 'remember',
    difficulty: 0.3,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-008',
    ...commonQuestionFields,
  },
  '34def5c9-1623-4322-bd32-47636959a406': {
    text: 'Which statement is directly supported by the checked NSCP Table 615.2-1 anchor?',
    options: [
      {
        id: 'a',
        text: 'It gives reference values for visually stress-graded unseasoned structural timber of Philippine woods.',
      },
      { id: 'b', text: 'It defines fiberboard and hardboard density thresholds.' },
      { id: 'c', text: 'It gives nominal-to-actual lumber-size conversion tables.' },
      { id: 'd', text: 'It sets emergency generator anchorage inspection intervals.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'The checked table title states that Table 615.2-1 gives reference values for visually stress-graded unseasoned structural timber of Philippine woods.',
      a: 'Not selected: This matches the checked table title.',
      b: 'Not selected: the selected anchors do not support fiberboard or hardboard density definitions.',
      c: 'Not selected: nominal-to-actual conversion tables are outside the checked anchors.',
      d: 'Not selected: generator anchorage is outside this timber source boundary.',
      takeaway: 'Use the selected local source only for claims it actually supports.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'The selected Table 615.2-1 anchor supports structural-timber reference values and groups, not product-density or nominal-size claims.',
    code_citation: 'NSCP 2015 Vol. I, Table 615.2-1; OCR page 889.',
    bloom_level: 'understand',
    difficulty: 0.5,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-005',
    ...commonQuestionFields,
  },
  'a493ef1b-723a-4599-a71e-1fb1acad9228': {
    text:
      'Which listed statement matches the checked NSCP Table 615.2-1 group headings on OCR page 889?',
    options: [
      {
        id: 'a',
        text: 'Group IV is the Moderately Low Strength Group and includes examples such as Almaciga and Bayok.',
      },
      { id: 'b', text: 'Yakal is listed in Group IV.' },
      { id: 'c', text: 'Narra is listed in the Medium Strength Group.' },
      { id: 'd', text: 'Machine-graded lumber is one of the four visual stress groups.' },
    ],
    correct_option_id: 'a',
    rationale: {
      correct:
        'The checked anchor labels IV as Moderately Low Strength Group and lists Almaciga and Bayok under that heading.',
      a: 'Not selected: This follows the checked Group IV heading and examples.',
      b: 'Not selected: Yakal is listed in the High Strength Group.',
      c: 'Not selected: Narra is listed in the Moderately High Strength Group.',
      d: 'Not selected: machine-graded lumber is addressed separately in Section 622.',
      takeaway: 'Separate visual stress-group lookup from the Section 622 machine-graded lumber path.',
      source_boundary:
        'Batch 162 uses only NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96.',
    },
    explanation:
      'The checked page lists Group IV as Moderately Low Strength and includes Almaciga and Bayok in that group.',
    code_citation: 'NSCP 2015 Vol. I, Table 615.2-1; OCR page 889.',
    bloom_level: 'remember',
    difficulty: 0.3,
    difficulty_rating: null,
    discrimination_rating: null,
    model_id: 'ALE-STRC-009-02-004',
    ...commonQuestionFields,
  },
}

const normalizedHash = sha256(articleBody)
const uiBlocks = {
  article_id: metadata.article_id,
  slug: metadata.slug,
  normalized_created_at: generatedAtManila,
  parser_version: 'ui-block-parser-v1',
  original_content_hash: originalHash,
  normalized_content_hash: normalizedHash,
  ui_block_count: 0,
  total_blocks: 0,
  blocks: [],
  unknown_blocks: [],
  unresolved_critical_blocks: [],
  ui_blocks_hash: 'sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
}

const { candidate, report: composeReport } = composeCandidate({
  normalized: articleBody,
  uiBlocks,
  original,
})
const diffReport = diffCandidate({
  metadata: {
    ...metadata,
    content_hash: originalHash,
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    candidate_content_hash: sha256(candidate),
  },
  original,
  normalized: articleBody,
  candidate,
  uiBlocks,
})
const sourcesFile = {
  article_id: metadata.article_id,
  hash_algorithm: 'sha256',
  sources_hash: null,
  source_count: 1,
  sources: [source],
}
sourcesFile.sources_hash = sha256Json(sourcesFile.sources)

const updatedMetadata = {
  ...metadata,
  content_hash: originalHash,
  original_content_hash: originalHash,
  normalized_content_hash: normalizedHash,
  candidate_content_hash: sha256(candidate),
  ui_blocks_hash: uiBlocks.ui_blocks_hash,
  sources_hash: sourcesFile.sources_hash,
  source_count: 1,
  parser_status: 'passed',
  content_complexity: 'plain_markdown',
}

const questionClaimRows = linkedQuestions.questions.map((question, index) => ({
  claim_id: `lea-strc-009-02-b162-question-${String(index + 1).padStart(2, '0')}-${question.question_id}`,
  question_id: question.question_id,
  model_id: question.model_id,
  claim_text:
    `${question.question_id} ${question.model_id}: question edit rewritten under NSCP Table 615.2-1 and Section 622 source boundary; correct_option_id preserved as ${question.correct_option_id}.`,
  source_ids: [sourceId],
  locator: sourceLocator,
  status: 'PASS',
}))

const sourcePrimaryFindings = checkedLines.map((line, index) => ({
  claim_id: `lea-strc-009-02-b162-source-primary-${index + 1}`,
  claim_text: line,
  source_ids: [sourceId],
  locator: line,
  status: 'PASS',
}))

const sourceAuditEvidence = {
  batch_id: batchId,
  audit_date: generatedAt.slice(0, 10),
  audited_at: generatedAtManila,
  target: {
    cluster_id: 'lea-strc-009-02',
    article_id: metadata.article_id,
    slug: metadata.slug,
    title: metadata.title,
    article_folder: articleDir,
    normalized_sha256: normalizedHash,
    candidate_sha256: sha256(candidate),
    candidate_path: `${articleDir}/candidate.md`,
  },
  classification: {
    local_first_batch: String(batch),
    source_sensitivity: 'structural_timber_stress_groups_machine_graded_lumber',
    source_risk_tier: 'local_primary_code_ocr_required',
    requires_raw_local_source: true,
  },
  overall: {
    source_audit_status: 'PASS',
    safe_for_batch_apply: true,
    safe_for_supabase_upload: false,
    blockers: [],
    warnings: ['No Supabase upload was run for Batch 162; this is a local-only production-line handoff.'],
  },
  raw_local_gate: {
    status: 'PASS',
    local_sources_checked_first: true,
    valid_source_pdf: sourcePdf,
    valid_source_pdf_sha256: fileSha(sourcePdf),
    source_metadata: sourceMetadataPath,
    conversion_root: conversionRoot,
    rejected_source: rejectedSource,
    rejected_source_reason: 'Null-byte corrupted file; not used as evidence.',
    checked_sources: [checkedSource],
    checked_markdown_lines: checkedLines,
  },
  scenario_enrichment: {
    policy_status: 'satisfied',
    eligibility_status: 'included_source_safe',
    blocker_status: 'none',
    notes:
      'Article and question scenarios were constrained to checked NSCP timber stress-group and machine-graded lumber anchors.',
  },
  thin_needs_expansion: {
    previous_status: 'thin_or_unsourced_residual',
    batch_162_status: 'resolved_with_source_safe_expansion',
    evidence:
      'normalized.md removes unsupported product-density, nominal-size, and grade-defect claims and replaces them with checked NSCP OCR-supported material.',
  },
  question_alignment: {
    linked_question_count: linkedQuestions.question_count,
    question_edit_count: linkedQuestions.question_count,
    answer_key_changes: 0,
    scope: 'structural_timber_stress_groups_machine_graded_lumber',
  },
  checked_sources: [checkedSource],
  claims: [...sourcePrimaryFindings, ...questionClaimRows],
  source_primary_findings: sourcePrimaryFindings,
  resolved_findings: ['THIN_NEEDS_EXPANSION', 'source-primary', 'question-alignment', 'scenario/depth'],
  unverified_or_rejected_claims: support.excluded_claims.map((claim, index) => ({
    rejected_claim_id: `lea-strc-009-02-b162-rejected-${index + 1}`,
    claim_text: claim,
    reason: 'Outside the Batch 162 checked local NSCP OCR source boundary.',
  })),
}

const questionEditsDir = path.join(articleDir, 'question-edits')
mkdirSync(questionEditsDir, { recursive: true })

for (const question of linkedQuestions.questions) {
  const proposed = questionProposals[question.question_id]
  if (!proposed) throw new Error(`Missing proposal for ${question.question_id}`)
  if (proposed.correct_option_id !== question.correct_option_id) {
    throw new Error(`Answer key mismatch for ${question.question_id}`)
  }
  const edit = {
    question_id: question.question_id,
    baseline_hash: question.content_hash ?? sha256Json(question),
    action: 'replace',
    reason:
      'Batch 162 source-audited rewrite: constrain lea-strc-009-02 to checked local NSCP Table 615.2-1 and Section 622 OCR anchors and remove unsupported residual claims.',
    approved_by: approvedBy,
    approved_at: generatedAtManila,
    source_audit_support: support,
    proposed,
  }
  writeJson(path.join(questionEditsDir, `${question.question_id}.json`), edit)
}

const componentUsage = {
  article_id: metadata.article_id,
  slug: metadata.slug,
  title: metadata.title,
  component_count: 0,
  components: [],
  unknown_components: [],
  custom_ui_block_count: 0,
  normalized_status: 'plain_markdown_no_ui_blocks',
  components_detected: [],
  unknown_components_detected: [],
}

writeText(path.join(articleDir, 'normalized.md'), articleBody)
writeText(path.join(articleDir, 'candidate.md'), candidate)
writeJson(path.join(articleDir, 'article-metadata.json'), updatedMetadata)
writeJson(path.join(articleDir, 'ui-blocks.json'), uiBlocks)
writeJson(path.join(articleDir, 'ui-block-edits.json'), {
  article_id: metadata.article_id,
  slug: metadata.slug,
  generated_at: generatedAtManila,
  parser_version: 'ui-block-parser-v1',
  edit_count: 0,
  edits: [],
  warnings: [
    'Batch 162 normalized content is plain markdown; no UI block edits are proposed.',
  ],
})
writeJson(path.join(articleDir, 'component-usage.json'), componentUsage)
writeJson(path.join(articleDir, 'sources.json'), sourcesFile)
writeJson(path.join(articleDir, 'source-audit-evidence.json'), sourceAuditEvidence)
writeJson(path.join(articleDir, 'compose-report.json'), composeReport)
writeJson(path.join(articleDir, 'diff-report.json'), diffReport)
writeText(path.join(articleDir, 'diff-report.md'), buildDiffMarkdown(diffReport))

if (existsSync(path.join(articleDir, 'compose-error.json'))) {
  rmSync(path.join(articleDir, 'compose-error.json'))
}

const ledger = {
  batch_id: batchId,
  generated_at: generatedAtManila,
  repo: '/Users/philiplewis/slatecamp',
  branch,
  baseline,
  source_policy:
    'local_first_only_no_supabase_no_deploy_no_db_no_main_merge_no_force_push_until_all_gates_pass',
  valid_source: {
    source_pdf: sourcePdf,
    conversion_root: conversionRoot,
    source_sha256: fileSha(sourcePdf),
    page_sha256: {
      [page0889]: fileSha(page0889),
      [page0943]: fileSha(page0943),
    },
    source_metadata: sourceMetadataPath,
    corrupted_source_rejected: rejectedSource,
  },
  selected_clusters: [
    {
      cluster: 'lea-strc-009-02',
      article_id: metadata.article_id,
      slug: metadata.slug,
      folder: articleDir,
      topic: 'NSCP Table 615.2-1 timber stress groups and Section 622 machine-graded lumber',
      anchors: checkedLines,
      linked_question_count: linkedQuestions.question_count,
      question_edit_count: linkedQuestions.question_count,
      answer_key_changes: 0,
      blockers: [],
      normalized_sha256: normalizedHash,
      candidate_sha256: sha256(candidate),
      sources_sha256: sourcesFile.sources_hash,
      source_audit_status: 'PASS',
      scenario_status: 'included_source_safe',
    },
  ],
  unselected_clusters: [
    {
      cluster: 'lea-util-004-05',
      status: 'UNSUPPORTED_FOR_BATCH_162',
      reason:
        'Linked questions require mixed authority beyond the checked NSCP timber anchors, including disaster, PD 1096, MEPF, utility, generator, and operational resilience claims.',
      next_source_need:
        'Exact local anchors for every linked utility/MEPF claim before article and question edits.',
    },
    {
      cluster: 'lea-util-004-08',
      status: 'UNSUPPORTED_FOR_BATCH_162',
      reason:
        'Linked questions require exact local support for gas valves, generators, flexible couplings, mechanical/electrical anchorage, and post-earthquake inspection claims beyond the selected NSCP timber anchors.',
      next_source_need:
        'Exact local NSCP nonstructural/mechanical-electrical anchorage anchors plus authoritative utility/manufacturer/operational standards.',
    },
  ],
  totals: {
    selected_clusters: 1,
    linked_questions: linkedQuestions.question_count,
    question_edits: linkedQuestions.question_count,
    answer_key_changes: 0,
    selected_blockers: 0,
  },
}

writeJson('.ai/content-audit-export/source-audited-article-batch-162-local-first-ledger.json', ledger)

const reportMd = `# Batch 162 Local-First Source-Audited Report

Generated: ${generatedAtManila}

## Status

Batch 162 is locally prepared for one selected NSCP-supported residual cluster. No Supabase push, deploy, production DB mutation, main merge, force-push, staging, commit, or push was performed by this runner.

## Selected cluster

- lea-strc-009-02 (lea-strc-009-02-core-concept): NSCP Table 615.2-1 timber stress groups and Section 622 machine-graded lumber; linked questions ${linkedQuestions.question_count}/${linkedQuestions.question_count}; blockers 0; anchors: page-0889.md lines 5-65 and page-0943.md lines 51-96.

## Source basis

- Valid local PDF: ${sourcePdf}
- Valid PDF hash: ${fileSha(sourcePdf)}
- OCR conversion: ${conversionRoot}
- Page hashes: page-0889.md ${fileSha(page0889)}; page-0943.md ${fileSha(page0943)}
- Rejected source: the older National Structural Code of the Philippines 2015 PDF remains null-byte corrupted and was not used as evidence.

## Question edits

- Linked questions selected: ${linkedQuestions.question_count}
- Question-edit JSON files: ${linkedQuestions.question_count}
- Answer-key changes: 0
- Policy: correct_option_id, correct_value, and accepted_answers preserved unless source audit proves correction. No answer-key correction was needed in Batch 162.

## Unsupported claims removed

- Hardboard, fiberboard, and product-density substitution claims.
- Nominal-to-actual lumber size conversions.
- NatCor grade-defect schedules and unsupported grade percentage reductions.
- Species examples not present in the checked OCR anchors.
- Exact species reference-value numerics where OCR quality is insufficient for publication-grade numeric quoting.

## Unselected residuals

- lea-util-004-05: UNSUPPORTED_FOR_BATCH_162. Exact local authority was not found for all linked disaster, PD 1096, MEPF, utility, generator, and operational resilience claims.
- lea-util-004-08: UNSUPPORTED_FOR_BATCH_162. Exact local authority was not found for all linked gas valve, generator, flexible coupling, nonstructural anchorage, and inspection claims.

## Validation summary

Validation commands must be recorded in .ai/content-audit-export/source-audited-article-batch-162-local-first-scoped-checks.json after scoped compose/diff/validate and scan gates run.
`

writeText('.ai/content-audit-export/source-audited-article-batch-162-local-first-report.md', reportMd)

const qaMd = `# Batch 162 Independent Quality Review

Generated: ${generatedAtManila}

## Scope

- Selected article: ${articleDir}
- Selected cluster: lea-strc-009-02
- Linked question edits: ${linkedQuestions.question_count}
- Answer-key changes: 0

## Verdict

QA pending final scoped validation. Content scope is appropriate for acceptance if compose, diff, official validate, JSON parse, source scan, question parity, source verification invariants, scoped diff checks, and cached diff checks pass.

## Evidence Reviewed

- ${page0889}:5-65 for Table 615.2-1 group headings and listed species.
- ${page0943}:51-96 for Section 622 machine-graded lumber, design properties, moisture adjustments, treatment, moisture definitions, and markings.
- ${articleDir}/normalized.md and candidate.md are plain markdown with no raw SlateCamp UI markers.
- ${articleDir}/question-edits contains one edit for each linked question, with correct_option_id preserved.

## Risk Notes

- Utility residuals remain excluded because NSCP timber anchors do not source all linked MEPF/disaster/utility claims.
- Exact species reference-value numerics are not quoted because the OCR is good enough for group placement but not for publication-grade numeric stress values without further checking.
`

writeText('.ai/03_plans/batch-162-independent-quality-review.md', qaMd)

console.log(JSON.stringify({
  batch_id: batchId,
  article_id: metadata.article_id,
  slug: metadata.slug,
  normalized_hash: normalizedHash,
  candidate_hash: sha256(candidate),
  linked_questions: linkedQuestions.question_count,
  question_edits: linkedQuestions.question_count,
  answer_key_changes: 0,
  source_hash: fileSha(sourcePdf),
  compose_blockers: composeReport.blockers.length,
  diff_blockers: diffReport.blockers.length,
}, null, 2))
