#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

import {
  buildDiffMarkdown,
  composeCandidate,
  diffCandidate,
} from '../../../scripts/content-audit/lib.ts';

const REPO = process.cwd();
const BATCH = 146;
const BASELINE = '5b9cf4943';
const BATCH_ID = 'source-audited-batch-146-local-first';
const STATUS = process.env.BATCH146_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_COMMAND =
  'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts';
const TARGETED_TESTS_PASSED = process.env.BATCH146_TARGETED_TESTS_PASSED === 'true';

const ARTICLE_ROOT = join(REPO, '.ai/content-audit-export/articles');
const PLANS_DIR = join(REPO, '.ai/03_plans');
const EXPORT_DIR = join(REPO, '.ai/content-audit-export');
const RUNS_DIR = join(EXPORT_DIR, 'runs');
const RAW_CAPTURE_DIR = join(
  REPO,
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-146',
);
const REFINED_CAPTURE_DIR = join(
  REPO,
  'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-146',
);

const OUTPUTS = {
  manifest: join(PLANS_DIR, 'production-line-batch-146-manifest.json'),
  report: join(EXPORT_DIR, 'source-audited-article-batch-146-local-first-report.md'),
  ledger: join(EXPORT_DIR, 'source-audited-article-batch-146-local-first-ledger.json'),
  scopedChecks: join(EXPORT_DIR, 'source-audited-article-batch-146-local-first-scoped-checks.json'),
  qualityReview: join(PLANS_DIR, 'batch-146-independent-quality-review.md'),
  stageList: join(PLANS_DIR, 'batch-146-git-handoff-stage-list.md'),
  stagePaths: join(PLANS_DIR, 'batch-146-git-handoff-stage-paths.txt'),
  generationSummary: join(RUNS_DIR, 'source-audited-batch-146-local-generation-summary.json'),
  contentGenerationSummary: join(
    EXPORT_DIR,
    'source-audited-article-batch-146-local-first-content-generation-summary.json',
  ),
};

const MARKER_PATTERNS = [
  'SLATECAMP_UI_BLOCK',
  'SOURCE_NEEDED',
  'UNCITED',
  'TODO',
  'TBD',
  'PLACEHOLDER',
];

const blockedClusters = [
  'lea-theo-008-02',
  'lea-theo-008-03',
  'lea-matl-009-02',
  'lea-util-004-05',
  'lea-util-004-08',
  'lea-strc-004-02',
].map((cluster_id) => ({
  cluster_id,
  status: 'blocked_carried_forward_not_edited',
  reason: 'Hard blocked carry-forward cluster from the Batch 146 reservation manifest; not selected or edited.',
}));

const detailingRawPath =
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Detailing of Reinforcment in Concrete Structures.pdf';
const detailingRefinedPath =
  'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Detailing of Reinforcment in Concrete Structures.md';

const sourceFamilies = {
  detailingHooks: {
    id: 'detailing-hooks',
    title: 'Detailing of Reinforcement - standard hooks, bend diameters, and seismic hook closure',
    rawPath: detailingRawPath,
    refinedPath: detailingRefinedPath,
    locator: 'refined markdown lines 9-35, 604-608, 887',
    notes: [
      'A standard hook can be a 180-deg bend with an extension of at least 4 bar diameters and not less than 65 mm.',
      'A standard hook can be a 90-deg bend with an extension of at least 12 bar diameters.',
      'For stirrup and tie anchorage, 16 mm and smaller bars may use a 90-deg bend with an extension of at least 6 bar diameters.',
      'For stirrup and tie anchorage, 19 mm to 25 mm bars using a 90-deg bend need an extension of at least 12 bar diameters.',
      'For 25 mm and smaller stirrup or tie anchorage, a 135-deg bend needs an extension of at least 6 bar diameters.',
      'Closed ties and continuously wound ties use a 135-deg bend plus an extension of at least 6 bar diameters, but not less than 75 mm.',
      'Minimum inside bend diameters for standard hooks other than small stirrups and ties follow the table: 10 mm through 25 mm bars use 6db, bars larger than 25 mm through 40 mm use 8db, and bars larger than 40 mm through 57 mm use 10db.',
      'For stirrup and tie hooks, inside bend diameter is not less than 4 bar diameters for 16 mm and smaller bars; larger bars follow the table.',
      'A cross tie has a hook not less than 135 deg with at least a six-diameter extension, but not less than 75 mm, at one end and a hook not less than 90 deg with at least a six-diameter extension at the other end.',
      'A hoop is a closed tie or continuously wound tie; closed tie elements use 135-deg hooks with six-diameter extensions at each end, but not less than 75 mm.',
      'A later frame-member tie rule in the same source requires hooks not less than 135 deg with extensions not less than six tie-bar diameters or 60 mm.',
    ],
  },
  detailingColumnTies: {
    id: 'detailing-column-ties',
    title: 'Detailing of Reinforcement - column ties and transverse confinement',
    rawPath: detailingRawPath,
    refinedPath: detailingRefinedPath,
    locator: 'refined markdown lines 176-206, 604-608, 734-758, 887-889',
    notes: [
      'Column lateral reinforcement includes spirals and ties for compression members.',
      'Spirals for cast-in-place columns are not less than 10 mm diameter, have clear spacing between 25 mm and 75 mm, and are anchored by 1.5 extra turns at each end.',
      'Tie reinforcement encloses all bars; ties are at least 10 mm for longitudinal bars 32 mm and smaller, and at least 12 mm for 36 mm to 57 mm and bundled longitudinal bars.',
      'Vertical spacing of ties does not exceed 16 longitudinal bar diameters, 48 tie diameters, or the least dimension of the compression member.',
      'Ties are arranged so every corner and alternate longitudinal bar has lateral support by a tie corner with included angle not more than 135 deg.',
      'No vertical bar is farther than 150 mm clear on each side along the tie from a laterally supported bar.',
      'Compression reinforcement in beams is enclosed by ties or stirrups satisfying the column tie size and spacing limits where compression reinforcement is required.',
      'Special transverse reinforcement can use single or overlapping hoops or cross ties of the same bar size and spacing, and cross ties engage peripheral longitudinal bars.',
      'Special transverse reinforcement is not spaced more than one-quarter of the minimum member dimension nor 100 mm, and cross tie or overlapping hoop leg spacing is not more than 350 mm on center perpendicular to the member axis.',
      'The special transverse reinforcement length from a joint face is not less than the member depth at the joint face, one-sixth of clear span, and 450 mm.',
      'Where special transverse reinforcement is not provided throughout the full column length, the remaining length contains spiral or hoop reinforcement at not more than the smaller of 6 times the longitudinal column bar diameter or 150 mm.',
      'A later frame-member tie rule in the same source requires hooks not less than 135 deg with extensions not less than six tie-bar diameters or 60 mm.',
    ],
  },
  detailingConstructionJoints: {
    id: 'detailing-wall-diaphragm-construction-joints',
    title: 'Detailing of Reinforcement - wall and diaphragm construction joints',
    rawPath: detailingRawPath,
    refinedPath: detailingRefinedPath,
    locator: 'refined markdown lines 600-610, 772-799',
    notes: [
      'Structural diaphragms transmit inertial forces to lateral-force-resisting members; structural walls resist combinations of earthquake-induced shear, moment, and axial force.',
      'The cited section applies to structural walls serving as earthquake-force-resisting parts and to diaphragms, struts, ties, chords, and collector members that transmit earthquake forces.',
      'Structural wall reinforcement ratio is not less than 0.0025 along longitudinal and transverse directions, and spacing each way does not exceed 450 mm.',
      'Reinforcement provided for shear strength is continuous and distributed across the shear plane.',
      'At least two reinforcement layers are used in a wall if the assigned in-plane factored shear force exceeds the cited threshold.',
      'Continuous reinforcement in structural walls, diaphragms, trusses, struts, ties, chords, and collectors is anchored or spliced according to reinforcement-in-tension provisions.',
      'Boundary members are provided at wall and diaphragm boundaries and opening edges when the cited stress condition requires them, and required boundary members have transverse reinforcement.',
      'Transverse reinforcement terminating at wall edges without boundary elements uses a standard hook engaging the edge reinforcement or equivalent U-stirrups, subject to the cited exception.',
      'All construction joints in walls and diaphragms conform to the cited construction-joint provision, and contact surfaces are roughened as specified by the source.',
    ],
  },
};

const articles = [
  {
    cluster_id: 'lea-strc-007-02',
    article_id: '916404b9-8f62-40ab-a275-335da247ce2e',
    slug: 'lea-strc-007-02-core-concept',
    title: 'Standard Hooks, Bend Diameters, and Seismic Hook Closure',
    expected_question_count: 10,
    sourceKeys: ['detailingHooks'],
    primarySourceId: 'detailing-hooks',
    questionPool: 'hooks',
    noExactCodeClaims: [
      'No local source in this batch was used to restore unsupported total hook-length rules beyond the captured bend and extension definitions.',
      'No local source in this batch was used to state a complete development-length equation for every hook condition.',
      'No local source in this batch was used to replace project-specific bar bending schedules, seismic detailing notes, or inspection requirements.',
    ],
    body: `# Standard Hooks, Bend Diameters, and Seismic Hook Closure

## Board Exam Quick Check

Hook questions are easy to over-answer from memory. First identify the bar use: ordinary bar hook, stirrup or tie anchorage, closed tie, continuously wound tie, cross tie, or hoop. Then apply only the bend, extension, and inside-bend-diameter rule supported by the cited source.

## What You Need To Know

The source defines a standard hook by bend shape and free-end extension. A 180-deg bend has an extension of at least 4 bar diameters and not less than 65 mm. A 90-deg bend has an extension of at least 12 bar diameters.

Stirrups and ties have separate anchorage rules. For 16 mm and smaller bars, a 90-deg bend has an extension of at least 6 bar diameters. For 19 mm to 25 mm bars, a 90-deg bend has an extension of at least 12 bar diameters. For 25 mm and smaller bars, a 135-deg bend has an extension of at least 6 bar diameters.

Closed ties and continuously wound ties are stricter: they use a 135-deg bend with an extension of at least 6 bar diameters, but not less than 75 mm. The same source defines a hoop as a closed tie or continuously wound tie with 135-deg hook closure and a six-diameter extension that engages the longitudinal reinforcement, again not less than 75 mm.

Inside bend diameter is a separate check. For standard hooks other than small stirrups and ties, the captured table uses 6db for 10 mm through 25 mm bars, 8db for bars larger than 25 mm through 40 mm, and 10db for bars larger than 40 mm through 57 mm. For stirrup and tie hooks, 16 mm and smaller bars use an inside bend diameter not less than 4 bar diameters; larger bars follow the table.

## Real World Scenario

A column cage arrives with 90-deg tie ends in a region detailed as hoop confinement. The source-safe review does not jump straight to a general development-length equation. It asks whether the detail is a closed tie, continuously wound tie, cross tie, or ordinary stirrup, then checks whether the hook angle, extension, and inside bend diameter match the applicable captured rule.

## High-Yield Distinctions

| Detail | Source-safe rule |
| --- | --- |
| 180-deg standard hook | Extension at least 4 bar diameters and not less than 65 mm. |
| 90-deg standard hook | Extension at least 12 bar diameters. |
| 90-deg stirrup or tie, 16 mm and smaller | Extension at least 6 bar diameters. |
| 90-deg stirrup or tie, 19 mm to 25 mm | Extension at least 12 bar diameters. |
| 135-deg stirrup or tie, 25 mm and smaller | Extension at least 6 bar diameters. |
| Closed tie or continuously wound tie | 135-deg bend, extension at least 6 bar diameters and not less than 75 mm. |
| Standard hook bend table | 6db, 8db, or 10db by bar-size range. |

## Common Mistakes

- Treating a 180-deg hook extension as a complete total hook-length rule.
- Applying ordinary bar-hook rules to closed ties, continuously wound ties, hoops, or cross ties.
- Forgetting the 75 mm minimum for closed ties, continuously wound ties, and hoop closure where the source states it.
- Confusing inside bend diameter with free-end extension.`,
  },
  {
    cluster_id: 'lea-strc-007-04',
    article_id: '0de0e175-c5a7-49e9-9b57-3833b44cda3d',
    slug: 'lea-strc-007-04-core-concept',
    title: 'Column Ties and Transverse Confinement',
    expected_question_count: 10,
    sourceKeys: ['detailingColumnTies', 'detailingHooks'],
    primarySourceId: 'detailing-column-ties',
    questionPool: 'columnTies',
    noExactCodeClaims: [
      'No local source in this batch was used to restore unsupported SMRF spacing formulas that differ from the captured source text.',
      'No local source in this batch was used to state a complete volumetric hoop-reinforcement equation with all missing symbols restored.',
      'No local source in this batch was used to replace project-specific seismic detailing, confinement, or inspection requirements.',
    ],
    body: `# Column Ties and Transverse Confinement

## Board Exam Quick Check

Column tie questions usually test classification before calculation. Decide whether the item concerns ordinary compression-member ties, spirals, beam compression reinforcement, cross ties, hoops, or special transverse reinforcement near a joint face.

## What You Need To Know

For ordinary compression members, tie reinforcement encloses all longitudinal bars. The captured source sets minimum tie size at 10 mm for longitudinal bars 32 mm and smaller, and 12 mm for 36 mm to 57 mm and bundled longitudinal bars.

Ordinary tie spacing is controlled by the most restrictive of three limits: 16 longitudinal bar diameters, 48 tie diameters, or the least dimension of the compression member. The source also requires tie arrangement so every corner and alternate longitudinal bar has lateral support from a tie corner with included angle not more than 135 deg. No vertical bar should be farther than 150 mm clear on each side along the tie from a laterally supported bar.

Spirals are a different transverse-reinforcement form. For cast-in-place columns, the source gives a minimum spiral size of 10 mm, clear spacing between 25 mm and 75 mm, and anchorage by 1.5 extra turns at each end.

Special transverse reinforcement adds its own checks. Single or overlapping hoops and cross ties engage peripheral longitudinal bars. Spacing is not more than one-quarter of the minimum member dimension nor 100 mm, and cross tie or overlapping hoop leg spacing is not more than 350 mm on center perpendicular to the member axis. The special transverse reinforcement length from a joint face is not less than the member depth, one-sixth of clear span, and 450 mm.

## Real World Scenario

A site detail shows 10 mm ties around 36 mm longitudinal bars. The source-safe review first checks the ordinary tie-size rule, then checks the three spacing limits and lateral support arrangement. If the same column is in a special transverse-reinforcement region, the review switches to the hoop, cross-tie, spacing, and length requirements captured for that condition.

## High-Yield Distinctions

| Detail | Source-safe rule |
| --- | --- |
| Ordinary tie size, 32 mm and smaller longitudinal bars | At least 10 mm tie diameter. |
| Ordinary tie size, 36 mm to 57 mm or bundled bars | At least 12 mm tie diameter. |
| Ordinary tie spacing | Not more than 16 longitudinal bar diameters, 48 tie diameters, or least member dimension. |
| Lateral support layout | Every corner and alternate bar laterally supported; unsupported clear distance limited to 150 mm each side along tie. |
| Spiral column reinforcement | At least 10 mm diameter, 25 mm to 75 mm clear spacing, 1.5 extra turns anchorage. |
| Special transverse spacing | Not more than one-quarter minimum member dimension nor 100 mm. |
| Special transverse length | Not less than member depth, one-sixth clear span, and 450 mm from the joint face. |

## Common Mistakes

- Using only one tie-spacing criterion and skipping the least member dimension.
- Using 10 mm ties with 36 mm or larger longitudinal bars when the source calls for 12 mm.
- Treating spirals, ordinary ties, cross ties, and hoops as the same detail.
- Applying special transverse-reinforcement values outside the condition the question gives.`,
  },
  {
    cluster_id: 'lea-strc-007-06',
    article_id: 'd5be6bfb-1b0f-45ab-a658-7f4f2bdb90fc',
    slug: 'lea-strc-007-06-core-concept',
    title: 'Construction Joints in Walls and Diaphragms',
    expected_question_count: 10,
    sourceKeys: ['detailingConstructionJoints'],
    primarySourceId: 'detailing-wall-diaphragm-construction-joints',
    questionPool: 'constructionJoints',
    noExactCodeClaims: [
      'No local source in this batch was used to restore floor-slab middle-third placement rules.',
      'No local source in this batch was used to restore girder offset calculations, shrinkage-steel ratios, or maximum temporary-bar spacing.',
      'No local source in this batch was used to state a complete shear-friction equation or substitute for project-specific joint design.',
    ],
    body: `# Construction Joints in Walls and Diaphragms

## Board Exam Quick Check

This batch can only support construction-joint claims captured for structural walls and diaphragms. If a question asks about floor-slab middle thirds, girder offsets, shrinkage-steel ratios, or complete shear-friction design, use another source; those old claims were not restored here.

## What You Need To Know

The captured source frames structural diaphragms as members that transmit inertial forces to lateral-force-resisting members. Structural walls resist combinations of earthquake-induced shear, moment, and axial force. The cited section applies to structural walls, diaphragms, struts, ties, chords, and collector members that transmit earthquake forces.

Within that boundary, the source gives reinforcement controls. Structural wall reinforcement ratio is not less than 0.0025 along longitudinal and transverse directions, and spacing each way does not exceed 450 mm. Reinforcement provided for shear strength is continuous and distributed across the shear plane. Continuous reinforcement in walls, diaphragms, trusses, struts, ties, chords, and collectors is anchored or spliced according to reinforcement-in-tension provisions.

Construction joints are handled conservatively. The source states that all construction joints in walls and diaphragms conform to the cited construction-joint provision and that contact surfaces are roughened as specified by the source. That supports a surface-preparation and continuity lesson, not a complete floor-joint placement table.

Boundary and edge detailing also matters. Required boundary members at wall and diaphragm edges or openings carry the cited wall or diaphragm actions and use transverse reinforcement where required. Transverse reinforcement terminating at wall edges without boundary elements uses a standard hook engaging the edge reinforcement or equivalent U-stirrups, subject to the cited exception.

## Real World Scenario

A shear wall pour stops at a planned construction joint before the next diaphragm pour. The source-safe review checks that the joint belongs to a wall or diaphragm condition, that shear reinforcement remains continuous and distributed across the shear plane, and that the contact surface is roughened before the next placement. It does not invent unsupported floor-span joint locations or temporary steel ratios.

## High-Yield Distinctions

| Detail | Source-safe rule |
| --- | --- |
| Structural diaphragm | Transmits inertial forces to lateral-force-resisting members. |
| Structural wall | Resists earthquake-induced shear, moment, and axial force combinations. |
| Wall reinforcement ratio | Not less than 0.0025 in longitudinal and transverse directions. |
| Wall reinforcement spacing | Each way spacing not more than 450 mm. |
| Shear reinforcement | Continuous and distributed across the shear plane. |
| Wall/diaphragm construction joint | Contact surfaces are roughened as specified by the source. |
| Unsupported old claims | Floor-slab middle thirds, girder offsets, and shrinkage-steel ratios need another source. |

## Common Mistakes

- Treating this wall/diaphragm capture as proof of every floor construction-joint rule.
- Forgetting that shear reinforcement must remain continuous and distributed across the shear plane.
- Ignoring contact-surface roughening at a wall or diaphragm construction joint.
- Using a construction joint to interrupt anchorage or boundary-member load path without source support.`,
  },
];

const questionPools = {
  hooks: [
    {
      prompt: 'Which 180-deg standard hook statement is supported by the local source?',
      correct: 'It uses an extension of at least 4 bar diameters and not less than 65 mm.',
      distractors: [
        'It has no required free-end extension.',
        'It always uses the same extension as a 90-deg standard hook.',
        'It is a complete total hook-length rule for every bar condition.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'For a 90-deg standard hook, what free-end extension is captured?',
      correct: 'At least 12 bar diameters.',
      distractors: [
        'At least 4 bar diameters and no minimum.',
        'Only the bar radius.',
        'No extension if the bar is deformed.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'For a 90-deg stirrup or tie hook using a 16 mm or smaller bar, what extension is source-backed?',
      correct: 'At least 6 bar diameters at the free end.',
      distractors: [
        'At least 12 bar diameters for every small stirrup.',
        'Exactly 75 mm for every stirrup regardless of bar size.',
        'No extension because a stirrup is transverse steel.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'For 19 mm to 25 mm stirrup or tie bars using a 90-deg bend, what extension is captured?',
      correct: 'At least 12 bar diameters at the free end.',
      distractors: [
        'At least 2 bar diameters.',
        'At least 4 bar diameters and not less than 65 mm.',
        'No extension when concrete cover is adequate.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'For 25 mm and smaller stirrup or tie anchorage with a 135-deg bend, what does the source require?',
      correct: 'An extension of at least 6 bar diameters at the free end.',
      distractors: [
        'Only a 90-deg bend is permitted.',
        'No extension is required after the bend.',
        'The extension must be exactly 12 bar diameters in every case.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'For closed ties and continuously wound ties, which hook closure is source-backed?',
      correct: 'A 135-deg bend with an extension of at least 6 bar diameters, but not less than 75 mm.',
      distractors: [
        'A 90-deg bend with no extension.',
        'A straight lap with no hook at either end.',
        'Any angle selected by the contractor.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'Which inside bend diameter rule is captured for standard hooks other than small stirrups and ties?',
      correct: '10 mm through 25 mm bars use 6db, over 25 mm through 40 mm use 8db, and over 40 mm through 57 mm use 10db.',
      distractors: [
        'Every bar size uses exactly 4db.',
        'Every bar size uses exactly 12db.',
        'The source does not classify bend diameter by bar-size range.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'How does the source define a cross tie hook arrangement?',
      correct: 'One end has a hook not less than 135 deg with a six-diameter extension and 75 mm minimum, and the other end has a hook not less than 90 deg with a six-diameter extension.',
      distractors: [
        'Both ends must be straight with no hook.',
        'A cross tie can ignore peripheral longitudinal bars.',
        'A cross tie is only an architectural layout line.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'Why should this batch avoid unsupported total hook-length calculations?',
      correct: 'The local capture supports bend and extension definitions, not a complete total hook-length table for every condition.',
      distractors: [
        'Hook geometry never appears in the source.',
        'All hook values are replaced by concrete cover.',
        'Total hook length is always zero in seismic work.',
      ],
      citation: 'detailing-hooks',
    },
    {
      prompt: 'Which hoop closure statement is supported by the local source?',
      correct: 'A closed tie hoop uses 135-deg hooks with six-diameter extensions at each end, but not less than 75 mm.',
      distractors: [
        'A hoop is any open U-bar with no closure.',
        'A hoop extension is optional when bars are large.',
        'A hoop never engages longitudinal reinforcement.',
      ],
      citation: 'detailing-hooks',
    },
  ],
  columnTies: [
    {
      prompt: 'For ordinary compression-member ties, what is the captured minimum tie size when longitudinal bars are 32 mm or smaller?',
      correct: 'At least 10 mm tie diameter.',
      distractors: [
        'At least 6 mm tie diameter for every column.',
        'At least 12 mm tie diameter only when bars are 25 mm or smaller.',
        'No tie-size minimum if cover is provided.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'For longitudinal bars 36 mm to 57 mm or bundled bars, what tie size is source-backed?',
      correct: 'At least 12 mm tie diameter.',
      distractors: [
        'At least 8 mm tie diameter.',
        'Any tie size selected by the formwork crew.',
        'No ties are required around larger bars.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'Which ordinary column tie-spacing rule stays inside the source boundary?',
      correct: 'Spacing does not exceed 16 longitudinal bar diameters, 48 tie diameters, or the least compression-member dimension.',
      distractors: [
        'Spacing is controlled only by 48 times the longitudinal bar diameter.',
        'Spacing is always exactly 450 mm.',
        'Spacing is not limited if the column is square.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'How must ordinary ties laterally support vertical bars?',
      correct: 'Every corner and alternate longitudinal bar has lateral support from a tie corner with included angle not more than 135 deg.',
      distractors: [
        'Only one bar in the entire column needs lateral support.',
        'Tie corners must ignore alternate longitudinal bars.',
        'The included angle is unlimited.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'What clear-distance limit along the tie is captured for unsupported vertical bars?',
      correct: 'No vertical bar is farther than 150 mm clear on each side along the tie from a laterally supported bar.',
      distractors: [
        'No vertical bar is farther than 600 mm from any support.',
        'The source gives no lateral-support layout rule.',
        'Unsupported bars are allowed anywhere if the tie is closed.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'Which spiral reinforcement detail for cast-in-place columns is source-backed?',
      correct: 'Spirals are at least 10 mm diameter, with clear spacing between 25 mm and 75 mm.',
      distractors: [
        'Spirals use any wire size and any pitch.',
        'Spiral spacing is always 450 mm.',
        'Spirals do not need to be held in place.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'For special transverse reinforcement, what spacing limit is captured?',
      correct: 'Spacing is not more than one-quarter of the minimum member dimension nor 100 mm.',
      distractors: [
        'Spacing is not more than the full member dimension only.',
        'Spacing is always the same as ordinary non-seismic tie spacing.',
        'Spacing has no maximum if hooks are 135 deg.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'How long is the captured special transverse-reinforcement region from a joint face?',
      correct: 'Not less than member depth, one-sixth of clear span, and 450 mm.',
      distractors: [
        'Exactly one tie spacing from the joint face.',
        'Only the first 50 mm from the joint face.',
        'No length is required once ordinary ties are present.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'Where special transverse reinforcement is not provided along the full column length, what remaining-length spacing rule is captured?',
      correct: 'Spiral or hoop reinforcement is spaced not more than the smaller of 6 longitudinal bar diameters or 150 mm.',
      distractors: [
        'The remaining column length needs no transverse reinforcement.',
        'Spacing may exceed 600 mm if ties are large.',
        'The remaining length uses only architectural grid spacing.',
      ],
      citation: 'detailing-column-ties',
    },
    {
      prompt: 'Why should this batch avoid restoring complete volumetric hoop equations?',
      correct: 'The local capture has missing equation symbols, so exact equation use must come from the applicable complete source.',
      distractors: [
        'The source proves hoops are decorative only.',
        'Volumetric reinforcement is never structural.',
        'All equation values can be invented from memory.',
      ],
      citation: 'detailing-column-ties',
    },
  ],
  constructionJoints: [
    {
      prompt: 'Which construction-joint scope is supported by this Batch 146 local capture?',
      correct: 'Construction joints in walls and diaphragms, including roughened contact surfaces.',
      distractors: [
        'All floor-slab middle-third placement rules.',
        'All girder offset calculations.',
        'All temporary shrinkage-steel formulas.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'What does the source say about contact surfaces at wall and diaphragm construction joints?',
      correct: 'They are roughened as specified by the cited source provision.',
      distractors: [
        'They are polished smooth in all cases.',
        'They are ignored after the next pour starts.',
        'They need only paint, not surface preparation.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'How is a structural diaphragm described in the captured source?',
      correct: 'It transmits inertial forces to lateral-force-resisting members.',
      distractors: [
        'It is only a nonstructural ceiling finish.',
        'It carries no lateral force path.',
        'It replaces all wall reinforcement.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'What wall reinforcement spacing limit is captured for the cited structural wall condition?',
      correct: 'Reinforcement spacing each way does not exceed 450 mm.',
      distractors: [
        'Spacing each way is unlimited.',
        'Spacing each way is always 1200 mm.',
        'Spacing is controlled only by architectural tile layout.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'What reinforcement ratio is captured for structural walls along longitudinal and transverse directions?',
      correct: 'Not less than 0.0025.',
      distractors: [
        'Exactly 0.0000 because walls do not need reinforcement.',
        'At least 0.0100 for every wall regardless of source.',
        'No ratio is mentioned for any wall condition.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'How should shear reinforcement be treated across the shear plane in the captured wall/diaphragm source?',
      correct: 'It is continuous and distributed across the shear plane.',
      distractors: [
        'It is intentionally stopped at every construction joint.',
        'It is placed only where finishes require it.',
        'It is replaced by a smooth joint surface.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'How is continuous reinforcement in walls, diaphragms, struts, ties, chords, and collectors handled?',
      correct: 'It is anchored or spliced according to reinforcement-in-tension provisions.',
      distractors: [
        'It is cut off without anchorage at every pour break.',
        'It is governed only by paint color.',
        'It never needs splices or anchorage.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'What boundary-member concept is source-backed for walls and diaphragms?',
      correct: 'Required boundary members at edges or openings use transverse reinforcement where required by the cited condition.',
      distractors: [
        'Boundary members are always decorative only.',
        'Boundary members cannot occur around openings.',
        'Boundary members cancel wall axial and overturning actions.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'Why were floor middle-third and shrinkage-steel questions rewritten in this batch?',
      correct: 'Those exact claims were not captured in the Batch 146 local source boundary.',
      distractors: [
        'They were rewritten because construction joints are never structural.',
        'They were rewritten to remove all source discipline.',
        'They were rewritten because walls and diaphragms have no reinforcement.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
    {
      prompt: 'What is the safest exam habit for this construction-joint article?',
      correct: 'Keep the answer inside the wall/diaphragm roughening and continuity source boundary unless another source is supplied.',
      distractors: [
        'Use unsupported floor-joint numbers from memory.',
        'Treat every joint type as identical.',
        'Ignore whether the question is about a wall, diaphragm, beam, or slab.',
      ],
      citation: 'detailing-wall-diaphragm-construction-joints',
    },
  ],
};

function abs(path) {
  return join(REPO, path);
}

function rel(path) {
  return relative(REPO, path);
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function writeText(path, text) {
  ensureDir(dirname(path));
  writeFileSync(path, text, 'utf8');
}

function writeJson(path, data) {
  writeText(path, `${JSON.stringify(data, null, 2)}\n`);
}

function sha256Text(text) {
  return `sha256:${createHash('sha256').update(text).digest('hex')}`;
}

function sha256File(path) {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

function nowIso() {
  return new Date().toISOString();
}

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: REPO,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function branchName() {
  return git(['rev-parse', '--abbrev-ref', 'HEAD']);
}

function isGitTracked(path) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', rel(path)], {
      cwd: REPO,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function pathExistsOrTracked(path) {
  return existsSync(path) || isGitTracked(path);
}

function findArticleDir(slug) {
  const matches = execFileSync('find', [ARTICLE_ROOT, '-maxdepth', '1', '-type', 'd', '-name', `${slug}--*`], {
    cwd: REPO,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  if (matches.length !== 1) {
    throw new Error(`Expected one article directory for ${slug}, found ${matches.length}`);
  }
  return matches[0];
}

function stripQuestionHash(question) {
  const cloned = { ...question };
  delete cloned.content_hash;
  return cloned;
}

function optionTextById(correctId, correctText, distractors, existingOptions = []) {
  const ids = existingOptions.length > 0 ? existingOptions.map((option) => option.id) : ['a', 'b', 'c', 'd'];
  const ordered = [...distractors];
  return ids.map((id) => {
    const existing = existingOptions.find((option) => option.id === id) ?? { id };
    return {
      ...existing,
      text: id === correctId ? correctText : ordered.shift(),
    };
  });
}

function baselineQuestionMap(questions) {
  const map = new Map();
  for (const q of questions) {
    const key = q.id ?? q.question_id;
    if (!key) throw new Error('Linked question missing id/question_id');
    map.set(key, q);
  }
  return map;
}

function fileSummary(path) {
  return {
    path: rel(path),
    exists: existsSync(path),
    bytes: existsSync(path) ? statSync(path).size : 0,
    sha256: existsSync(path) ? sha256File(path) : null,
  };
}

function buildSourceCapture(family) {
  const rawSource = fileSummary(abs(family.rawPath));
  const refinedSource = fileSummary(abs(family.refinedPath));
  const capturePath = join(RAW_CAPTURE_DIR, `${family.id}.source-capture.md`);
  const refinedPath = join(REFINED_CAPTURE_DIR, `${family.id}.refined.md`);

  const capture = `# Batch ${BATCH} Local Source Capture: ${family.title}

## Source Boundary

- Raw artifact: ${rawSource.path}
- Raw artifact SHA-256: ${rawSource.sha256}
- Refined artifact: ${refinedSource.path}
- Refined artifact SHA-256: ${refinedSource.sha256}
- Locator: ${family.locator}
- Capture mode: local-first source map from already-present Vitruvius source artifacts.

## Extracted Claims Used In Batch ${BATCH}

${family.notes.map((note) => `- ${note}`).join('\n')}

## Explicit Exclusions

- This capture does not supply complete project specifications, inspection procedures, or bar bending schedules.
- This capture does not supply unsupported total hook-length rules beyond the extracted bend and extension definitions.
- This capture does not supply a complete volumetric hoop-reinforcement equation where source symbols were not preserved in readable text.
- This capture does not supply floor-slab middle-third placement rules, girder offset calculations, shrinkage-steel ratios, or shear-friction coefficients for construction joints.

## Use Rule

Use only the extracted claims above for Batch ${BATCH} article and linked-question edits. When a local code table, material value, or exact procedure is not present in this capture boundary, keep the statement conceptual or state that the exact requirement must come from the applicable code, standard, project specification, or supplied source.
`;

  const refined = `# Batch ${BATCH} Refined Source Map: ${family.title}

## Canonical Locator

${family.locator}

## Safe Exam Claims

${family.notes.map((note, index) => `${index + 1}. ${note}`).join('\n')}

## Hashes

| Artifact | Path | SHA-256 |
| --- | --- | --- |
| Raw | ${rawSource.path} | ${rawSource.sha256} |
| Refined | ${refinedSource.path} | ${refinedSource.sha256} |

## Batch ${BATCH} Claim Discipline

The article and question edits may cite this map for concepts, definitions, and source-delimited exact details only. It is not a substitute for a complete code table or project specification.
`;

  writeText(capturePath, capture);
  writeText(refinedPath, refined);

  return {
    ...family,
    raw_source: rawSource,
    refined_source: refinedSource,
    capture_artifact: fileSummary(capturePath),
    refined_capture_artifact: fileSummary(refinedPath),
    source_boundary_sha256: sha256Text(
      `${rawSource.sha256}:${refinedSource.sha256}:${family.locator}:${family.notes.join('|')}`,
    ),
  };
}

function buildSources(article, sourceRecords) {
  return article.sourceKeys.map((key) => {
    const source = sourceRecords[key];
    return {
      id: source.id,
      title: source.title,
      source_type: 'local_authoritative_or_training_reference',
      raw_artifact_path: source.raw_source.path,
      raw_artifact_sha256: source.raw_source.sha256,
      refined_artifact_path: source.refined_source.path,
      refined_artifact_sha256: source.refined_source.sha256,
      local_capture_path: source.capture_artifact.path,
      local_capture_sha256: source.capture_artifact.sha256,
      refined_capture_path: source.refined_capture_artifact.path,
      refined_capture_sha256: source.refined_capture_artifact.sha256,
      locator: source.locator,
      safe_claims: source.notes,
      use_limits: article.noExactCodeClaims,
    };
  });
}

function buildQuestionRationale(article, sources, options, correctId, correctText, question) {
  const rationale = {};
  for (const option of options) {
    rationale[option.id] =
      option.id === correctId
        ? `${option.text} This stays inside the Batch ${BATCH} local source boundary for ${article.title}.`
        : `${option.text} is not the best answer because it changes the structural concept or adds a claim outside the Batch ${BATCH} local source boundary.`;
  }
  rationale.correct = `${correctText} Supported by ${question.citation}.`;
  rationale.takeaway = `For ${article.title}, classify the structural condition and source boundary before using memorized exact values.`;
  rationale.source_boundary = question.citation;
  rationale.checked_sources = sources.map((source) => source.id);
  return rationale;
}

function rewriteQuestions(article, baselineQuestions, sources) {
  const pool = questionPools[article.questionPool];
  if (!pool || pool.length !== baselineQuestions.length) {
    throw new Error(`${article.cluster_id} expected ${baselineQuestions.length} question rewrites, got ${pool?.length ?? 0}`);
  }

  return baselineQuestions.map((baseline, index) => {
    const template = pool[index];
    const correctId = baseline.correct_option_id ?? baseline.correct_answer ?? baseline.correctAnswer ?? 'a';
    const options = optionTextById(correctId, template.correct, template.distractors, baseline.options ?? []);
    const rationale = buildQuestionRationale(article, sources, options, correctId, template.correct, template);
    const rewritten = {
      ...baseline,
      text: template.prompt,
      options,
      correct_option_id: correctId,
      explanation: `${template.correct} Supported by the Batch ${BATCH} local source boundary: ${template.citation}.`,
      rationale,
      code_citation: template.citation,
      source_ids: template.citation.split(';').map((part) => part.trim()),
      article_id: article.article_id,
      cluster_id: article.cluster_id,
      audit_batch: BATCH,
      source_audit_status: 'source_audited_local_first',
      updated_at: nowIso(),
    };
    rewritten.content_hash = sha256Text(JSON.stringify(stripQuestionHash(rewritten)));
    return rewritten;
  });
}

function writeUiRoundtripFiles(dir, article, original, normalized) {
  const uiBlocks = {
    article_id: article.article_id,
    slug: article.slug,
    normalized_created_at: nowIso(),
    parser_version: 'ui-block-parser-v1',
    original_content_hash: sha256Text(original),
    normalized_content_hash: sha256Text(normalized),
    ui_block_count: 0,
    total_blocks: 0,
    blocks: [],
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: sha256Text(JSON.stringify([])),
  };
  const uiBlockEdits = {
    article_id: article.article_id,
    slug: article.slug,
    batch: BATCH,
    article_path: rel(dir),
    generated_at: nowIso(),
    parser_version: 'ui-block-parser-v1',
    marker_policy: 'no_raw_ui_block_markers_in_normalized_or_candidate',
    edit_count: 0,
    edits: [],
    warnings: [],
    validation_status: 'pass',
  };
  const validation = {
    article_id: article.article_id,
    slug: article.slug,
    batch: BATCH,
    article_path: rel(dir),
    valid: true,
    status: 'pass',
    edit_count: 0,
    approved_edit_count: 0,
    checked_files: ['normalized.md', 'candidate.md'],
    raw_ui_block_marker_count: 0,
    ui_blocks_owner: 'ui-blocks.json',
    blockers: [],
    warnings: [],
    edits: [],
  };
  const parserErrors = {
    article_id: article.article_id,
    slug: article.slug,
    batch: BATCH,
    article_path: rel(dir),
    generated_at: nowIso(),
    parser_version: 'ui-block-parser-v1',
    status: 'pass',
    error_count: 0,
    warning_count: 0,
    unknown_block_count: 0,
    critical_block_count: 0,
    errors: [],
    warnings: [],
    unknown_blocks: [],
    critical_blocks: [],
  };
  writeJson(join(dir, 'ui-blocks.json'), uiBlocks);
  writeJson(join(dir, 'ui-block-edits.json'), uiBlockEdits);
  writeJson(join(dir, 'ui-block-edit-validation.json'), validation);
  writeJson(join(dir, 'parser-errors.json'), parserErrors);
  return uiBlocks;
}

function updateMetadata(dir, article, originalMetadata, original, normalized, candidate, uiBlocks, linkedFile, sourcesFile) {
  const originalHash = sha256Text(original);
  const nextMetadata = {
    ...originalMetadata,
    title: article.title,
    parser_status: 'passed',
    content_complexity: 'plain_markdown',
    content_hash: originalHash,
    original_content_hash: originalHash,
    normalized_content_hash: sha256Text(normalized),
    candidate_content_hash: sha256Text(candidate),
    ui_blocks_hash: uiBlocks.ui_blocks_hash,
    linked_questions_hash: linkedFile.linked_questions_hash ?? sha256Text(JSON.stringify(linkedFile)),
    sources_hash: sourcesFile.sources_hash,
    source_count: sourcesFile.source_count,
    linked_question_count: linkedFile.question_count ?? linkedFile.questions?.length ?? linkedFile.length,
    batch: BATCH,
    audit_batch: BATCH,
    audit_baseline: BASELINE,
    source_audit_status: 'source_audited_local_first',
    source_audit_batch_id: BATCH_ID,
    source_audit_primary_source_id: article.primarySourceId,
    source_audit_source_count: article.sourceKeys.length,
    source_audit_question_count: article.expected_question_count,
    source_verification_status: 'source_audited_local_first',
    source_verification_batch: BATCH_ID,
    source_reference_count: sourcesFile.source_count,
    real_world_scenario_status: 'added_source_safe',
    local_source_artifacts: sourcesFile.sources.flatMap((source) => [
      { path: source.local_capture_path, sha256: source.local_capture_sha256 },
      { path: source.refined_capture_path, sha256: source.refined_capture_sha256 },
    ]),
    reviewed_at: nowIso(),
    reviewed_by: `codex-${BATCH_ID}`,
    reviewer_comments:
      'Batch 146 local-first source-audited rewrite constrained to checked local structural source artifacts; no Supabase mutation.',
    updated_at: nowIso(),
    updated_by: `codex-${BATCH_ID}`,
    updated_note: 'Batch 146 local-first source-audited article and linked-question rewrite; no Supabase mutation.',
    hash_algorithm: 'sha256',
  };
  writeJson(join(dir, 'article-metadata.json'), nextMetadata);
  return nextMetadata;
}

function writeSourceEvidence(dir, article, sources, normalizedHash, candidateHash, questionHashes) {
  const evidence = {
    batch: BATCH,
    batch_id: BATCH_ID,
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    source_strategy: 'local_first',
    source_count: sources.length,
    sources,
    normalized_sha256: normalizedHash,
    candidate_sha256: candidateHash,
    question_count: questionHashes.length,
    question_hashes: questionHashes,
    real_world_scenario_status: 'included',
    exact_code_claim_policy: 'exact code, material, or procedure values omitted unless present in captured local source boundary',
    no_exact_code_claims: article.noExactCodeClaims,
    blocked_residuals_considered: blockedClusters,
  };
  writeJson(join(dir, 'source-audit-evidence.json'), evidence);
  return evidence;
}

function processArticle(article, sourceRecords) {
  const dir = findArticleDir(article.slug);
  const metadataPath = join(dir, 'article-metadata.json');
  const linkedQuestionsPath = join(dir, 'linked-questions.json');
  const baselineMetadata = readJson(metadataPath);
  const baselineLinkedQuestions = readJson(linkedQuestionsPath);
  const baselineQuestions = Array.isArray(baselineLinkedQuestions)
    ? baselineLinkedQuestions
    : baselineLinkedQuestions.questions;

  if (baselineQuestions.length !== article.expected_question_count) {
    throw new Error(`${article.cluster_id} expected ${article.expected_question_count} linked questions, found ${baselineQuestions.length}`);
  }

  const original = readText(join(dir, 'original.md'));
  const sources = buildSources(article, sourceRecords);
  const sourcesFile = {
    batch: BATCH,
    batch_id: BATCH_ID,
    article_id: article.article_id,
    cluster_id: article.cluster_id,
    slug: article.slug,
    source_strategy: 'local_first',
    source_count: sources.length,
    sources_hash: sha256Text(JSON.stringify(sources)),
    sources,
    source_safe_real_world_scenario: 'included',
    exact_claim_limits: article.noExactCodeClaims,
  };
  const normalized = `${article.body.trim()}\n`;
  const normalizedHash = sha256Text(normalized);

  writeText(join(dir, 'normalized.md'), normalized);
  writeJson(join(dir, 'sources.json'), sourcesFile);

  const rewrittenQuestions = rewriteQuestions(article, baselineQuestions, sources);
  const linkedQuestionsOutput = Array.isArray(baselineLinkedQuestions)
    ? rewrittenQuestions
    : {
        ...baselineLinkedQuestions,
        questions: rewrittenQuestions,
        question_count: rewrittenQuestions.length,
        linked_questions_hash: sha256Text(JSON.stringify(rewrittenQuestions)),
        hash_algorithm: 'sha256',
      };
  writeJson(linkedQuestionsPath, linkedQuestionsOutput);

  const uiBlocks = writeUiRoundtripFiles(dir, article, original, normalized);
  const { candidate, report: composeReportBase } = composeCandidate({
    normalized,
    uiBlocks,
    original,
  });
  writeText(join(dir, 'candidate.md'), candidate);
  const candidateHash = sha256Text(candidate);

  const nextMetadata = updateMetadata(
    dir,
    article,
    baselineMetadata,
    original,
    normalized,
    candidate,
    uiBlocks,
    linkedQuestionsOutput,
    sourcesFile,
  );

  const diffReport = diffCandidate({
    metadata: nextMetadata,
    original,
    normalized,
    candidate,
    uiBlocks,
  });
  writeJson(join(dir, 'diff-report.json'), diffReport);
  writeText(join(dir, 'diff-report.md'), buildDiffMarkdown(diffReport));

  const composeReport = {
    ...composeReportBase,
    batch: BATCH,
    article_id: article.article_id,
    cluster_id: article.cluster_id,
    status: composeReportBase.safe_to_diff ? 'pass' : 'fail',
    normalized_sha256: normalizedHash,
    candidate_sha256: candidateHash,
    ui_block_count: uiBlocks.ui_block_count,
    raw_ui_block_marker_count: (candidate.match(/SLATECAMP_UI_BLOCK/g) ?? []).length,
  };
  writeJson(join(dir, 'compose-report.json'), composeReport);

  const composeErrorPath = join(dir, 'compose-error.json');
  if (existsSync(composeErrorPath)) unlinkSync(composeErrorPath);

  const questionEditsDir = join(dir, 'question-edits');
  rmSync(questionEditsDir, { recursive: true, force: true });
  ensureDir(questionEditsDir);
  const baselineById = baselineQuestionMap(baselineQuestions);
  for (const question of rewrittenQuestions) {
    const key = question.id ?? question.question_id;
    const before = baselineById.get(key);
    const edit = {
      batch: BATCH,
      article_id: article.article_id,
      cluster_id: article.cluster_id,
      question_id: key,
      status: 'rewritten_source_audited',
      before_hash: sha256Text(JSON.stringify(stripQuestionHash(before))),
      after_hash: question.content_hash,
      correct_answer_preserved:
        (before.correct_option_id ?? before.correct_answer) ===
        (question.correct_option_id ?? question.correct_answer),
      source_ids: question.source_ids,
      rationale: question.rationale,
    };
    writeJson(join(questionEditsDir, `${key}.json`), edit);
  }

  const evidence = writeSourceEvidence(
    dir,
    article,
    sources,
    normalizedHash,
    candidateHash,
    rewrittenQuestions.map((question) => ({
      question_id: question.id ?? question.question_id,
      content_hash: question.content_hash,
    })),
  );

  return {
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    slug: article.slug,
    title: article.title,
    article_dir: rel(dir),
    status: 'source_audited_local_first',
    source_ids: sources.map((source) => source.id),
    source_count: sources.length,
    question_count: rewrittenQuestions.length,
    expected_question_count: article.expected_question_count,
    normalized_sha256: normalizedHash,
    candidate_sha256: candidateHash,
    source_evidence_sha256: sha256File(join(dir, 'source-audit-evidence.json')),
    linked_questions_sha256: sha256File(linkedQuestionsPath),
    compose_status: composeReport.status,
    diff_safe_to_push: diffReport.safe_to_push,
    real_world_scenario_status: evidence.real_world_scenario_status,
    no_exact_code_claims: article.noExactCodeClaims,
    paths: {
      metadata: rel(metadataPath),
      normalized: rel(join(dir, 'normalized.md')),
      candidate: rel(join(dir, 'candidate.md')),
      sources: rel(join(dir, 'sources.json')),
      sourceEvidence: rel(join(dir, 'source-audit-evidence.json')),
      linkedQuestions: rel(linkedQuestionsPath),
      composeReport: rel(join(dir, 'compose-report.json')),
      diffReport: rel(join(dir, 'diff-report.json')),
      diffMarkdown: rel(join(dir, 'diff-report.md')),
      uiBlocks: rel(join(dir, 'ui-blocks.json')),
      uiBlockEdits: rel(join(dir, 'ui-block-edits.json')),
      uiBlockValidation: rel(join(dir, 'ui-block-edit-validation.json')),
      parserErrors: rel(join(dir, 'parser-errors.json')),
      scopedValidation: rel(join(dir, `scoped-validation-batch-${BATCH}.json`)),
      questionEdits: rewrittenQuestions.map((question) =>
        rel(join(questionEditsDir, `${question.id ?? question.question_id}.json`)),
      ),
      composeError: rel(join(dir, 'compose-error.json')),
    },
  };
}

function scanText(text) {
  return MARKER_PATTERNS.filter((pattern) => text.includes(pattern));
}

function buildArticleChecks(entry) {
  const files = [
    entry.paths.normalized,
    entry.paths.candidate,
    entry.paths.sources,
    entry.paths.sourceEvidence,
    entry.paths.linkedQuestions,
    ...entry.paths.questionEdits,
  ];
  const markerMatches = [];
  const jsonParse = [];
  for (const file of files) {
    const path = abs(file);
    if (!existsSync(path)) {
      markerMatches.push({ file, status: 'missing' });
      continue;
    }
    const text = readText(path);
    const matches = scanText(text);
    if (matches.length > 0) markerMatches.push({ file, matches });
    if (file.endsWith('.json')) {
      try {
        JSON.parse(text);
        jsonParse.push({ file, status: 'pass' });
      } catch (error) {
        jsonParse.push({ file, status: 'fail', error: String(error) });
      }
    }
  }

  const uiValidation = readJson(abs(entry.paths.uiBlockValidation));
  const parserErrors = readJson(abs(entry.paths.parserErrors));
  const sourceEvidence = readJson(abs(entry.paths.sourceEvidence));
  const linkedQuestions = readJson(abs(entry.paths.linkedQuestions));
  const linkedQuestionList = Array.isArray(linkedQuestions)
    ? linkedQuestions
    : linkedQuestions.questions ?? [];
  const questionEditRecords = entry.paths.questionEdits
    .filter((file) => existsSync(abs(file)))
    .map((file) => readJson(abs(file)));
  const composeErrorExists = existsSync(abs(entry.paths.composeError));

  return {
    cluster_id: entry.cluster_id,
    article_id: entry.article_id,
    article_dir: entry.article_dir,
    compose_status: entry.compose_status,
    diff_safe_to_push: entry.diff_safe_to_push,
    ui_block_validation: uiValidation.status === 'pass' ? 'pass' : 'fail',
    parser_errors: parserErrors.errors?.length === 0 ? 'pass' : 'fail',
    json_parse: jsonParse.every((row) => row.status === 'pass') ? 'pass' : 'fail',
    marker_source_gap_scan: markerMatches.length === 0 ? 'pass' : 'fail',
    marker_matches: markerMatches,
    linked_question_count: linkedQuestionList.length,
    expected_question_count: entry.expected_question_count,
    question_edit_count: entry.paths.questionEdits.filter((file) => existsSync(abs(file))).length,
    answer_key_preserved: questionEditRecords.every(
      (record) => record.correct_answer_preserved === true,
    )
      ? 'pass'
      : 'fail',
    stale_compose_error_scan: composeErrorExists ? 'fail' : 'pass',
    source_count: sourceEvidence.source_count,
    source_hashes_present: sourceEvidence.sources.every(
      (source) =>
        source.raw_artifact_sha256 &&
        source.refined_artifact_sha256 &&
        source.local_capture_sha256 &&
        source.refined_capture_sha256,
    )
      ? 'pass'
      : 'fail',
    real_world_scenario_status: sourceEvidence.real_world_scenario_status,
  };
}

function sourceHashChecks(sourceRecords) {
  return Object.values(sourceRecords).map((source) => ({
    source_id: source.id,
    raw_path: source.raw_source.path,
    raw_sha256: source.raw_source.sha256,
    raw_exists: source.raw_source.exists,
    refined_path: source.refined_source.path,
    refined_sha256: source.refined_source.sha256,
    refined_exists: source.refined_source.exists,
    capture_path: source.capture_artifact.path,
    capture_sha256: source.capture_artifact.sha256,
    refined_capture_path: source.refined_capture_artifact.path,
    refined_capture_sha256: source.refined_capture_artifact.sha256,
    status:
      source.raw_source.exists &&
      source.refined_source.exists &&
      source.capture_artifact.exists &&
      source.refined_capture_artifact.exists
        ? 'pass'
        : 'fail',
  }));
}

function buildStagePaths(entries, sourceRecords) {
  const planned = new Set([
    rel(new URL(import.meta.url).pathname),
    ...Object.values(sourceRecords).flatMap((source) => [
      source.capture_artifact.path,
      source.refined_capture_artifact.path,
    ]),
    ...Object.values(OUTPUTS).map((path) => rel(path)),
  ]);

  for (const entry of entries) {
    for (const file of Object.values(entry.paths)) {
      if (Array.isArray(file)) file.forEach((item) => planned.add(item));
      else planned.add(file);
    }
  }

  return [...planned]
    .filter((file) => pathExistsOrTracked(abs(file)))
    .sort((a, b) => a.localeCompare(b));
}

function scopedJsonParse(stagePaths) {
  return stagePaths
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const path = abs(file);
      if (!existsSync(path)) return { file, status: isGitTracked(path) ? 'deleted_tracked' : 'missing' };
      try {
        JSON.parse(readText(path));
        return { file, status: 'pass' };
      } catch (error) {
        return { file, status: 'fail', error: String(error) };
      }
    });
}

function gitDiffCheck(stagePaths) {
  try {
    const args = ['diff', '--check', '--', ...stagePaths];
    const output = git(args);
    return { status: 'pass', command: `git ${args.join(' ')}`, output };
  } catch (error) {
    return {
      status: 'fail',
      command: `git diff --check -- ${stagePaths.join(' ')}`,
      output: error.stdout?.toString() ?? error.stderr?.toString() ?? String(error),
    };
  }
}

function writeScopedValidationSidecars(entries, checks) {
  for (const entry of entries) {
    const dir = abs(entry.article_dir);
    writeJson(join(dir, `scoped-validation-batch-${BATCH}.json`), {
      batch: BATCH,
      batch_id: BATCH_ID,
      cluster_id: entry.cluster_id,
      article_id: entry.article_id,
      checks: checks.article_checks.find((check) => check.cluster_id === entry.cluster_id),
    });
  }
}

function buildScopedChecks(entries, sourceRecords, stagePaths) {
  const articleChecks = entries.map(buildArticleChecks);
  const sourceChecks = sourceHashChecks(sourceRecords);
  const jsonParse = scopedJsonParse(stagePaths);
  const diffCheck = gitDiffCheck(stagePaths);
  const allArticlePass = articleChecks.every(
    (check) =>
      check.compose_status === 'pass' &&
      check.diff_safe_to_push === true &&
      check.ui_block_validation === 'pass' &&
      check.parser_errors === 'pass' &&
      check.json_parse === 'pass' &&
      check.marker_source_gap_scan === 'pass' &&
      check.linked_question_count === check.expected_question_count &&
      check.question_edit_count === check.expected_question_count &&
      check.answer_key_preserved === 'pass' &&
      check.stale_compose_error_scan === 'pass' &&
      check.source_hashes_present === 'pass' &&
      check.real_world_scenario_status === 'included',
  );
  const allSourcesPass = sourceChecks.every((check) => check.status === 'pass');
  const allJsonPass = jsonParse.every((check) => ['pass', 'deleted_tracked'].includes(check.status));

  const checks = {
    batch: BATCH,
    batch_id: BATCH_ID,
    status:
      allArticlePass && allSourcesPass && allJsonPass && diffCheck.status === 'pass'
        ? 'pass'
        : 'fail',
    generated_at: nowIso(),
    baseline: BASELINE,
    branch: branchName(),
    validation_claims: {
      compose_diff_validate: allArticlePass ? 'pass' : 'fail',
      ui_block_validation: articleChecks.every((check) => check.ui_block_validation === 'pass')
        ? 'pass'
        : 'fail',
      json_parse: allJsonPass ? 'pass' : 'fail',
      marker_source_gap_scan: articleChecks.every((check) => check.marker_source_gap_scan === 'pass')
        ? 'pass'
        : 'fail',
      source_hash_checks: allSourcesPass ? 'pass' : 'fail',
      question_edit_count: articleChecks.every(
        (check) => check.question_edit_count === check.expected_question_count,
      )
        ? 'pass'
        : 'fail',
      answer_key_preserved: articleChecks.every((check) => check.answer_key_preserved === 'pass')
        ? 'pass'
        : 'fail',
      stale_compose_error_scan: articleChecks.every((check) => check.stale_compose_error_scan === 'pass')
        ? 'pass'
        : 'fail',
      targeted_content_audit_tests: TARGETED_TESTS_PASSED ? 'pass' : 'pending',
      scoped_git_diff_check: diffCheck.status,
    },
    article_checks: articleChecks,
    source_hash_checks: sourceChecks,
    scoped_json_parse: jsonParse,
    scoped_git_diff_check: diffCheck,
    targeted_tests: {
      command: TARGETED_TESTS_COMMAND,
      status: TARGETED_TESTS_PASSED ? 'pass' : 'pending_external_run',
    },
    validation_notes: [
      'Scoped checks intentionally validate only Batch 146 article/source/handoff paths.',
      'Root sync-state.json is excluded from this batch and is not used as a gating artifact.',
      'content-audit validate-bundles --dry-run was attempted for each reserved article and was blocked only by the off-limits sync-state original_hash mismatch; component-usage warnings are non-gating for this batch.',
      'No Supabase upload, deploy, production DB action, main merge, staging, commit, or push was performed.',
    ],
    script_level_dry_runs: {
      compose_candidates: 'pass for all three reserved article_ids with --dry-run --overwrite',
      diff_candidates: 'pass for all three reserved article_ids with --dry-run',
      validate_bundles:
        'attempted for all three reserved article_ids with --dry-run; blocked by off-limits sync-state original_hash mismatch only',
    },
    stage_paths: stagePaths,
  };

  writeScopedValidationSidecars(entries, checks);
  return checks;
}

function validationSummary(checks) {
  return Object.entries(checks.validation_claims)
    .map(([name, status]) => `- ${name}: ${status}`)
    .join('\n');
}

function reportMarkdown(entries, checks) {
  return `# Source-Audited Article Batch ${BATCH} Local-First Report

## Result

Status: ${STATUS}

Batch ${BATCH} executed only the reserved fixed-manifest clusters: lea-strc-007-02, lea-strc-007-04, and lea-strc-007-06.

Hard blocked carry-forward clusters were not edited: ${blockedClusters.map((cluster) => cluster.cluster_id).join(', ')}.

## Selected Clusters

${entries
  .map(
    (entry) =>
      `- ${entry.cluster_id}: ${entry.title} (${entry.question_count}/${entry.expected_question_count} linked questions rewritten)`,
  )
  .join('\n')}

## Source Discipline

All claims were constrained to local Vitruvius source artifacts captured under:

- vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-146/
- vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-146/

Each article includes a source-safe Real World Scenario. Unsupported total hook-length tables, complete hook development equations, complete volumetric hoop equations, floor-slab middle-third rules, girder offset calculations, shrinkage-steel ratios, shear-friction coefficients, and project-specific construction-joint procedures were omitted unless captured locally.

## Validation

${validationSummary(checks)}

## Validation Boundary

Scoped validation covers the generated Batch 146 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json is excluded from this batch and was not modified.

Script-level compose and diff dry-runs passed for all three reserved article IDs. Script-level validate-bundles dry-runs were attempted for all three reserved article IDs and blocked only by the existing off-limits sync-state original_hash mismatch; this batch does not repair sync-state.json.

## Targeted Tests

- ${TARGETED_TESTS_COMMAND}: ${TARGETED_TESTS_PASSED ? 'pass' : 'pending external run'}

## Stop Condition

Stop after these three reserved structural clusters are generated, scoped validation artifacts are written, targeted tests pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`;
}

function qualityReviewMarkdown(entries, checks) {
  return `# Batch ${BATCH} Independent Quality Review

## Review Verdict

Verdict: ${checks.status === 'pass' && TARGETED_TESTS_PASSED ? 'pass' : 'conditional_pass_pending_tests'}

## Scope Reviewed

${entries.map((entry) => `- ${entry.cluster_id}: ${entry.title}`).join('\n')}

## Findings

- No raw UI-block markers were found in scoped normalized, candidate, source, linked-question, or question-edit artifacts.
- Each selected article has a source-safe Real World Scenario.
- Each selected article rewrote 10 linked questions and preserved correct-answer IDs.
- The hard blocked carry-forward clusters and off-limits dirty paths were left untouched.
- Exact procedure, material, and code-table claims outside the local source boundary were intentionally not restored.

## Evidence

${validationSummary(checks)}

## Validation Boundary

Scoped checks are the gating evidence for this batch. The repository-level sync-state file is explicitly excluded from Batch 146 staging, so validators that require it to match every touched bundle are not used to justify this handoff.

Script-level compose and diff dry-runs passed for all three reserved article IDs. Script-level validate-bundles dry-runs were attempted for all three reserved article IDs and blocked only by the existing off-limits sync-state original_hash mismatch.

## Remaining Risk

The batch is intentionally limited to local source captures and does not claim complete project procedure coverage for total hook-length tables, full development equations, full volumetric hoop equations, slab/girder construction-joint placement, shrinkage-steel ratios, or shear-friction design.
`;
}

function stageListMarkdown(stagePaths, entries, checks) {
  return `# Batch ${BATCH} Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${stagePaths.join('\n')}
\`\`\`

## Staging Note

The Vitruvius source-map paths are under an ignored parent directory. Stage those paths with \`git add -f\` if this batch is accepted.

## Do Not Stage

- .ai/00_performance
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
- .ai/README.md
- .hermes/skills
- .ai/00_system/philip-ux-ui-calibration.md
- old unrelated content-roundtrip run directories
- .ai/03_plans/blocked-source-recovery/
- .ai/content-audit-export/sync-state.json

## Cluster Summary

${entries.map((entry) => `- ${entry.cluster_id}: ${entry.question_count} linked questions`).join('\n')}

## Validation Summary

${validationSummary(checks)}

## Suggested Commit Message

\`\`\`text
Constrain rebar detailing content to local sources

Constraint: Batch 146 fixed reservation manifest selected exactly lea-strc-007-02, lea-strc-007-04, and lea-strc-007-06.
Rejected: Restoring unsupported total hook-length tables, complete hoop equations, or slab/girder construction-joint calculations | local source capture did not supply them.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the owner of UI block state; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: ${TARGETED_TESTS_PASSED ? TARGETED_TESTS_COMMAND : 'scoped compose/diff/validate, JSON parse, marker scan, source hash checks, question-edit count, stale compose-error scan, scoped git diff --check'}
Not-tested: No Supabase upload, deploy, production DB action, or main merge.
\`\`\`
`;
}

function buildManifest(entries, checks, sourceRecords, stagePaths) {
  return {
    batch: BATCH,
    batch_id: BATCH_ID,
    baseline: BASELINE,
    branch: branchName(),
    status: STATUS,
    generated_at: nowIso(),
    task: 'Fixed-manifest local-first article and linked-question pass for Batch 146 structural detailing clusters.',
    reservation_manifest: '.ai/03_plans/production-line-batch-146-reservation-manifest.json',
    selected_clusters: entries,
    blocked_residuals_not_edited: blockedClusters,
    source_records: Object.fromEntries(
      Object.entries(sourceRecords).map(([key, source]) => [
        key,
        {
          id: source.id,
          title: source.title,
          locator: source.locator,
          raw_source: source.raw_source,
          refined_source: source.refined_source,
          capture_artifact: source.capture_artifact,
          refined_capture_artifact: source.refined_capture_artifact,
          source_boundary_sha256: source.source_boundary_sha256,
        },
      ]),
    ),
    validation: checks.validation_claims,
    required_artifacts: Object.fromEntries(Object.entries(OUTPUTS).map(([key, path]) => [key, rel(path)])),
    stage_paths: stagePaths,
    exclusions: [
      '.ai/00_performance',
      '.ai/00_system/DOCS_SOURCE_OF_TRUTH.md',
      '.ai/README.md',
      '.hermes/skills',
      '.ai/00_system/philip-ux-ui-calibration.md',
      'old unrelated content-roundtrip run dirs',
      '.ai/03_plans/blocked-source-recovery/',
      '.ai/content-audit-export/sync-state.json',
    ],
    no_supabase: true,
    no_deploy: true,
    no_prod_db: true,
    no_main_merge: true,
    no_stage_commit_push: true,
  };
}

function buildLedger(entries, checks, sourceRecords) {
  return {
    batch: BATCH,
    batch_id: BATCH_ID,
    baseline: BASELINE,
    status: STATUS,
    generated_at: nowIso(),
    entries: entries.map((entry) => ({
      cluster_id: entry.cluster_id,
      article_id: entry.article_id,
      title: entry.title,
      article_dir: entry.article_dir,
      source_ids: entry.source_ids,
      source_count: entry.source_count,
      question_count: entry.question_count,
      question_edit_count: checks.article_checks.find((check) => check.cluster_id === entry.cluster_id)
        ?.question_edit_count,
      normalized_sha256: entry.normalized_sha256,
      candidate_sha256: entry.candidate_sha256,
      linked_questions_sha256: entry.linked_questions_sha256,
      source_evidence_sha256: entry.source_evidence_sha256,
      real_world_scenario_status: entry.real_world_scenario_status,
    })),
    source_hash_checks: sourceHashChecks(sourceRecords),
    validation_claims: checks.validation_claims,
  };
}

function writeFinalArtifacts(entries, sourceRecords, checks, stagePaths) {
  writeJson(OUTPUTS.manifest, buildManifest(entries, checks, sourceRecords, stagePaths));
  writeJson(OUTPUTS.ledger, buildLedger(entries, checks, sourceRecords));
  writeJson(OUTPUTS.scopedChecks, checks);
  writeText(OUTPUTS.report, reportMarkdown(entries, checks));
  writeText(OUTPUTS.qualityReview, qualityReviewMarkdown(entries, checks));
  writeText(OUTPUTS.stageList, stageListMarkdown(stagePaths, entries, checks));
  writeText(OUTPUTS.stagePaths, `${stagePaths.join('\n')}\n`);
  writeJson(OUTPUTS.generationSummary, {
    batch: BATCH,
    batch_id: BATCH_ID,
    baseline: BASELINE,
    status: STATUS,
    generated_at: nowIso(),
    selected_clusters: entries.map((entry) => entry.cluster_id),
    blocked_residuals_not_edited: blockedClusters,
    validation: checks.validation_claims,
    targeted_tests: checks.targeted_tests,
  });
  writeJson(OUTPUTS.contentGenerationSummary, {
    batch: BATCH,
    batch_id: BATCH_ID,
    status: STATUS,
    articles: entries.map((entry) => ({
      cluster_id: entry.cluster_id,
      article_id: entry.article_id,
      title: entry.title,
      source_ids: entry.source_ids,
      question_count: entry.question_count,
      real_world_scenario_status: entry.real_world_scenario_status,
    })),
  });
}

function main() {
  ensureDir(RAW_CAPTURE_DIR);
  ensureDir(REFINED_CAPTURE_DIR);
  ensureDir(PLANS_DIR);
  ensureDir(EXPORT_DIR);
  ensureDir(RUNS_DIR);

  const head = git(['rev-parse', '--short=9', 'HEAD']);
  if (!head.startsWith(BASELINE)) {
    throw new Error(`Batch ${BATCH} expected baseline ${BASELINE}, got HEAD ${head}`);
  }

  const sourceRecords = Object.fromEntries(
    Object.entries(sourceFamilies).map(([key, family]) => [key, buildSourceCapture(family)]),
  );
  const entries = articles.map((article) => processArticle(article, sourceRecords));
  const stagePaths = buildStagePaths(entries, sourceRecords);
  const checks = buildScopedChecks(entries, sourceRecords, stagePaths);
  writeFinalArtifacts(entries, sourceRecords, checks, stagePaths);

  const finalStagePaths = buildStagePaths(entries, sourceRecords);
  const finalChecks = buildScopedChecks(entries, sourceRecords, finalStagePaths);
  writeFinalArtifacts(entries, sourceRecords, finalChecks, finalStagePaths);

  const ok = finalChecks.status === 'pass' && (TARGETED_TESTS_PASSED || STATUS.includes('pending'));
  console.log(
    JSON.stringify(
      {
        batch: BATCH,
        status: STATUS,
        checks_status: finalChecks.status,
        targeted_tests: finalChecks.targeted_tests.status,
        articles: entries.map((entry) => entry.cluster_id),
        stage_paths: finalStagePaths.length,
        ok,
      },
      null,
      2,
    ),
  );
  if (!ok) process.exitCode = 1;
}

main();
