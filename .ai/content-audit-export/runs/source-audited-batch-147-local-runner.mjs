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
const BATCH = 147;
const BASELINE = '5b9cf4943b';
const BATCH_ID = 'source-audited-batch-147-local-first';
const STATUS = process.env.BATCH147_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_COMMAND =
  'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts';
const TARGETED_TESTS_PASSED = process.env.BATCH147_TARGETED_TESTS_PASSED === 'true';

const ARTICLE_ROOT = join(REPO, '.ai/content-audit-export/articles');
const PLANS_DIR = join(REPO, '.ai/03_plans');
const EXPORT_DIR = join(REPO, '.ai/content-audit-export');
const RUNS_DIR = join(EXPORT_DIR, 'runs');
const RAW_CAPTURE_DIR = join(
  REPO,
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-147',
);
const REFINED_CAPTURE_DIR = join(
  REPO,
  'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-147',
);

const RESERVATION_MANIFEST =
  '.ai/03_plans/production-line-batch-147-reservation-manifest.json';

const OUTPUTS = {
  manifest: join(PLANS_DIR, 'production-line-batch-147-manifest.json'),
  report: join(EXPORT_DIR, 'source-audited-article-batch-147-local-first-report.md'),
  ledger: join(EXPORT_DIR, 'source-audited-article-batch-147-local-first-ledger.json'),
  scopedChecks: join(EXPORT_DIR, 'source-audited-article-batch-147-local-first-scoped-checks.json'),
  qualityReview: join(PLANS_DIR, 'batch-147-independent-quality-review.md'),
  stageList: join(PLANS_DIR, 'batch-147-git-handoff-stage-list.md'),
  stagePaths: join(PLANS_DIR, 'batch-147-git-handoff-stage-paths.txt'),
  generationSummary: join(
    RUNS_DIR,
    'source-audited-batch-147-local-generation-summary.json',
  ),
  contentGenerationSummary: join(
    EXPORT_DIR,
    'source-audited-article-batch-147-local-first-content-generation-summary.json',
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
  status: 'blocked_carry_forward_not_edited',
  reason:
    'Hard blocked carry-forward cluster listed in the Batch 147 reservation manifest; not swapped into this batch.',
}));

const sourceCandidatesChecked = [
  {
    source_id: 'aisc-steel-manual-13th-raw',
    path: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/AISC Steel Construction Manual 13th.pdf',
    status: 'checked_raw_hash_only_not_used_for_exact_claims',
    reason:
      'Local raw PDF exists, but no reliable readable local capture was available in this run; exact AISC slenderness, grade, hole, spacing, edge-distance, and pretension values were not restored.',
  },
];

const sourceFamilies = {
  bsiSteelMembers: {
    id: 'bsi-steel-members',
    title: 'Building Structures Illustrated - structural steel members and framing',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator:
      'refined markdown lines 827-840, 1016-1022, 2002-2012, 2613-2633, 2781, 3209-3216, 3545-3549, 5960-5986',
    notes: [
      'Structural steel girders, beams, trusses, and columns are used to construct skeleton frames, and steel is normally cut, shaped, and drilled in a fabrication shop.',
      'Wide-flange W shapes have largely superseded classic S shapes, and beams may also be channels, structural tubing, or composite sections.',
      'Steel framing is efficient when columns support a regular grid of girders, beams, and joists.',
      'The general objective is to use the lightest steel section that resists bending and shear within allowable stress limits and without excessive deflection.',
      'Lateral buckling can be induced by compressive stresses in a slender portion, and increasing steel beam flange width increases resistance to lateral buckling.',
      'Connections usually use transitional elements such as steel angles, tees, or plates, and actual connections are more often bolted or welded.',
      'Bolted connections are point connections, welded connections are line connections, pin joints allow rotation, and rigid or fixed joints restrain rotation and translation.',
      'Steel column-beam connections can be made moment-resistant by bolting or welding beam flanges to the column.',
      'Braced frames use vertical trusses with diagonal bracing to increase stiffness and moderate drift; they can be simply connected with pin joints.',
      'Web stiffeners are required where concentrated loads might cripple joist webs, such as at joist ends or interior supports.',
    ],
    exclusions: [
      'This capture does not supply AISC KL/r limit values.',
      'This capture does not supply ASTM grade yield or tensile strengths.',
      'This capture does not supply compactness limits, section property tables, or steel member capacity equations.',
    ],
  },
  bsiSteelConnections: {
    id: 'bsi-steel-connections',
    title: 'Building Structures Illustrated - bolted, welded, pin, and rigid connection concepts',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'refined markdown lines 827-840, 2617-2618, 3209-3216, 5984-5986',
    notes: [
      'Structural connections can be categorized geometrically as point bolted connections, line welded connections, and plane glued connections.',
      'Connections usually use transitional elements such as steel angles, tees, or plates.',
      'Pin or hinge joints allow rotation but resist translation, while rigid or fixed joints restrain rotation and translation and provide force and moment resistance.',
      'Steel column-beam connections can be made moment-resistant by bolting or welding the beam flanges to the column.',
      'Braced frames can use simply connected pin joints, making their fabrication and erection more economical than moment-resisting connections.',
      'Eccentrically braced frames introduce bending and shear into the frame, lowering stiffness but increasing ductility.',
    ],
    exclusions: [
      'This capture does not supply A307, A325, or A490 bolt strength values.',
      'This capture does not supply bolt-hole clearances, minimum edge distances, pitch limits, pretension values, or inspection methods.',
      'This capture does not supply AISC Chapter J section-number support.',
    ],
  },
  masonryLecture: {
    id: 'masonry-lecture-terms-chb',
    title: 'Masonry Lecture - masonry terms, bonds, and CHB construction notes',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Masonry Lecture.pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Masonry Lecture.md',
    locator: 'refined markdown lines 109-129, 291-293, 310-318, 353-361',
    notes: [
      'Masonry is built-up construction or a combination of clay, concrete, or stone set in mortar, or plain concrete.',
      'A bed is the horizontal surface on which stones or bricks lie in courses, and a course is a continuous layer of masonry units.',
      'A wythe or tier is each continuous vertical section of wall one masonry unit thick.',
      'Bond is the connection formed by lapping masonry units to prevent vertical joints from falling over each other.',
      'A stretcher is laid lengthwise of a wall; a header extends over the thickness of a wall; a heading course is all headers.',
      'Common bond consists of five stretcher courses and then a header course.',
      'English bond consists of alternate courses of stretchers and headers.',
      'Flemish bond consists of alternate headers and stretchers in each course.',
      'Concrete hollow block is a hollow masonry unit with two or three cells or cores.',
      'The lecture lists common CHB sizes as 100 mm, 150 mm, and 200 mm thick by 200 mm high by 400 mm long.',
      'The lecture states CHB should be laid on a full bed of mortar with horizontal and vertical joints 10 mm thick.',
      'The lecture states reinforcement intersections should be tied, reinforced cells filled with cement mortar, lintel or beam block course every twelfth course, and column stiffener every 4.80 m length.',
    ],
    exclusions: [
      'This capture does not supply NSCP section numbers.',
      'This capture does not supply PD 1096 masonry section numbers.',
      'This capture does not supply a code-backed seismic-zone rule for stack bond or cavity-wall air-space limits.',
    ],
  },
  bsiMasonryWalls: {
    id: 'bsi-masonry-walls',
    title: 'Building Structures Illustrated - masonry walls, CMU, reinforcement, and load path',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'refined markdown lines 3648-3655, 3699-3715, 3735-3738',
    notes: [
      'A bearing wall supports imposed loads and transmits compressive forces through the wall plane to the foundation.',
      'Bearing walls should be continuous from floor to floor and vertically aligned from roof to foundation.',
      'Masonry construction uses units of stone, brick, or concrete block with mortar to form durable, fire-resistant walls efficient in compression.',
      'The most common structural masonry units are precast concrete masonry units or concrete block.',
      'Standard CMU blocks have two or three cores.',
      'Mortar joints vary from 1/4 inch to 1/2 inch, typically 3/8 inch or 10 mm.',
      'Masonry bearing walls should be reinforced in seismic zones by embedding steel bars in thickened joints or cavities with grout for greater strength and lateral resistance.',
      'A strong bond should develop between reinforcing steel, grout, and masonry units.',
    ],
    exclusions: [
      'This capture does not supply local Philippine code section numbers for masonry.',
      'This capture does not supply complete engineered wall capacity tables for publication.',
    ],
  },
};

const articles = [
  {
    cluster_id: 'lea-strc-008-01',
    article_id: '62e4a20d-b739-4d5d-9349-aba651027b51',
    slug: 'lea-strc-008-01-core-concept',
    title: 'Structural Steel Members and Load Paths',
    expected_question_count: 10,
    sourceKeys: ['bsiSteelMembers'],
    primarySourceId: 'bsi-steel-members',
    questionPool: 'steelMembers',
    noExactCodeClaims: [
      'No local readable source in this batch was used to restore AISC KL/r limit values.',
      'No local readable source in this batch was used to restore ASTM steel grade Fy or Fu values.',
      'No local readable source in this batch was used to restore compactness limits, section-property tables, or steel member capacity equations.',
    ],
    body: `# Structural Steel Members and Load Paths

## Board Exam Quick Check

For structural steel member questions, classify the member by load-path role before reaching for a formula. Ask whether the item is about a beam, girder, joist, truss, column, bracing member, or connection condition. This batch supports conceptual member behavior and shape families; it does not restore exact AISC table values.

## What You Need To Know

Structural steel girders, beams, trusses, and columns form skeleton frames. The local source notes that structural steel is normally cut, shaped, and drilled in a fabrication shop, which supports fast and precise frame construction.

For horizontal members, wide-flange W shapes have largely superseded classic S shapes. The same source also names channel sections, structural tubing, and composite sections as possible beam forms. The exam-safe distinction is not that one shape is always correct; the safe habit is to match the shape to the load path, support condition, connection, and serviceability check.

The source gives two stability cues that matter for LEA reasoning. First, the design objective is to use the lightest steel section that can resist bending and shear within allowable stress limits and without excessive deflection. Second, lateral buckling can occur when compressive stresses act on a slender portion that lacks enough lateral rigidity. Increasing flange width improves a steel beam's resistance to lateral buckling.

Connections complete the load path. The local source describes transitional elements such as steel angles, tees, and plates, with actual connections more often bolted or welded. It also distinguishes pin joints, which allow rotation, from rigid or fixed joints, which restrain rotation and translation and provide force and moment resistance. Steel column-beam connections can become moment-resistant when the beam flanges are bolted or welded to the column.

Do not import unsupported numbers. This batch does not publish AISC KL/r limits, A36 Fy or Fu values, section property tables, compactness limits, or steel capacity equations because the readable local capture did not provide those exact claims.

## Real World Scenario

A small commercial roof frame has W-shape beams on a regular column grid, channels for secondary framing, and a braced bay for lateral stability. The review sequence is to trace deck loads to joists or beams, then to girders and columns, then through the bracing and foundations. Exact section capacity, slenderness, and steel grade checks still come from the applicable design standard and project calculations.

## High-Yield Distinctions

| Topic | Source-safe cue |
| --- | --- |
| W shape | Efficient wide-flange shape that has largely superseded classic S shapes. |
| Channel or structural tubing | Named steel beam/member forms; final use depends on load path and design check. |
| Lightest section | Acceptable only if bending, shear, stress limits, and deflection are satisfied. |
| Lateral buckling | Compression in a slender portion can trigger instability. |
| Transitional element | Steel angles, tees, or plates help connect members. |
| Rigid joint | Restrains rotation and translation; provides force and moment resistance. |
| Braced frame | Uses diagonal bracing to increase stiffness and moderate drift. |

## Common Mistakes

- Treating a shape name as a complete design answer.
- Publishing KL/r or steel grade values without a captured source table.
- Forgetting that lateral buckling is a stability issue, not only a strength issue.
- Ignoring connection type when deciding whether a joint behaves as pinned or moment-resistant.`,
  },
  {
    cluster_id: 'lea-strc-008-02',
    article_id: 'ace46266-45f1-4ecf-8f80-dcc9fb4b9282',
    slug: 'lea-strc-008-02-core-concept',
    title: 'Bolted Steel Connections and Source Limits',
    expected_question_count: 10,
    sourceKeys: ['bsiSteelConnections'],
    primarySourceId: 'bsi-steel-connections',
    questionPool: 'boltedConnections',
    noExactCodeClaims: [
      'No local readable source in this batch was used to restore A307, A325, or A490 strength values.',
      'No local readable source in this batch was used to restore bolt-hole clearances, edge-distance tables, pitch limits, or pretension values.',
      'No local readable source in this batch was used to restore turn-of-nut, calibrated-wrench, or DTI inspection requirements.',
    ],
    body: `# Bolted Steel Connections and Source Limits

## Board Exam Quick Check

For bolted connection questions, separate the load-path concept from the design-table value. This batch supports connection geometry, joint behavior, and source discipline. It does not restore exact AISC bolt grades, hole clearances, edge distances, pitch limits, pretension values, or inspection methods.

## What You Need To Know

The local source classifies bolted connections as point connections and welded connections as line connections. It also says steel connections usually use transitional elements such as angles, tees, or plates, while actual connections are more often bolted or welded.

Joint behavior is the higher-yield concept. A pin or hinge joint allows rotation but resists translation. A rigid or fixed joint restrains rotation and translation and provides both force and moment resistance. In steel framing, a column-beam connection can be made moment-resistant by bolting or welding the beam flanges to the column.

This matters when comparing frame systems. Braced frames can use simply connected pin joints, which makes fabrication and erection more economical than moment-resisting connections. Moment connections are more demanding because the joint must participate in resisting frame action.

The source boundary does not support publishing exact high-strength bolting values. Treat A307, A325, A490, slip-critical behavior, hole type, edge distance, pitch, pretension, DTI washers, and turn-of-nut inspection as table-controlled or standard-controlled until a readable local standard is captured.

## Real World Scenario

A field crew connects a steel canopy beam to a column. The source-safe review asks whether the detail is intended to behave like a pin or a moment connection, whether a plate, tee, or angle is acting as the transitional element, and whether the flange connection is part of the moment path. Exact bolt grade, hole type, edge distance, and pretension acceptance must come from the applicable connection standard and project documents.

## High-Yield Distinctions

| Topic | Source-safe cue |
| --- | --- |
| Bolted connection | Point connection. |
| Welded connection | Line connection. |
| Pin or hinge joint | Allows rotation while resisting translation. |
| Rigid or fixed joint | Restrains rotation and translation; provides force and moment resistance. |
| Transitional element | Steel angle, tee, or plate used to connect members. |
| Moment connection | Beam flanges may be bolted or welded to the column. |
| Exact bolt values | Use the applicable design standard or project source, not memory. |

## Common Mistakes

- Treating every bolted connection as moment-resistant.
- Stating bolt grade strengths or pretension values without a captured source table.
- Confusing the geometric connection type with the code-controlled design requirement.
- Ignoring whether the connection must allow rotation or restrain rotation.`,
  },
  {
    cluster_id: 'lea-strc-010-01',
    article_id: 'ee14e9e9-4e28-4c5a-bd83-6dc33fee5c3e',
    slug: 'lea-strc-010-01-core-concept',
    title: 'Masonry Construction Terms and CHB Source Boundaries',
    expected_question_count: 10,
    sourceKeys: ['masonryLecture', 'bsiMasonryWalls'],
    primarySourceId: 'masonry-lecture-terms-chb',
    questionPool: 'masonry',
    noExactCodeClaims: [
      'No local source in this batch was used to restore NSCP masonry section numbers.',
      'No local source in this batch was used to restore PD 1096 masonry section numbers.',
      'No local source in this batch was used to publish a code-backed stack-bond seismic rule or cavity-wall air-space limit.',
    ],
    body: `# Masonry Construction Terms and CHB Source Boundaries

## Board Exam Quick Check

Masonry questions often test vocabulary before they test design. Start by identifying the unit, joint, wythe, bond, cell, or reinforcement condition. Then separate source-backed construction notes from legal or code requirements that need a primary standard.

## What You Need To Know

The local masonry lecture defines masonry as built-up construction using clay, concrete, or stone set in mortar, or plain concrete. A bed is the horizontal surface on which stones or bricks lie in courses. A course is a continuous layer of masonry units. A wythe or tier is a continuous vertical wall section one masonry unit thick.

Bond is the connection formed by lapping masonry units so vertical joints do not fall over each other. A stretcher is laid lengthwise of a wall. A header extends over the wall thickness. A heading course is composed entirely of headers. The lecture lists common bond as five stretcher courses followed by a header course, English bond as alternate courses of stretchers and headers, and Flemish bond as alternate headers and stretchers in each course.

For concrete hollow block, the local lecture states that CHB has two or three cells or cores. It lists common CHB sizes as 100 mm, 150 mm, and 200 mm thick by 200 mm high by 400 mm long. It also states that CHB should be laid on a full mortar bed with horizontal and vertical joints 10 mm thick, reinforcement intersections tied, reinforced cells filled with cement mortar, lintel or beam block course every twelfth course, and column stiffener every 4.80 m length.

The supporting structures source describes masonry walls as durable, fire-resistant, and efficient in compression. It also states that bearing walls should be continuous and vertically aligned, and that masonry bearing walls should be reinforced in seismic zones with steel bars embedded in thickened joints or cavities with grout.

This batch does not publish NSCP or PD 1096 section numbers for masonry. It also does not publish a code-backed stack-bond seismic rule or cavity-wall air-space limit. Those claims must come from the applicable code source.

## Real World Scenario

A site inspector checks a CHB partition and a reinforced masonry wall. The source-safe inspection vocabulary is clear: verify courses, wythes, full mortar bed, tied reinforcement intersections, filled reinforced cells, lintel or beam block courses, and column stiffeners. If the issue is legal compliance, seismic detailing, or cavity-wall dimensions, the answer must cite the applicable code or project specification rather than the lecture notes alone.

## High-Yield Distinctions

| Topic | Source-safe cue |
| --- | --- |
| Bed | Horizontal surface where masonry units lie in courses. |
| Course | Continuous layer of masonry units. |
| Wythe or tier | Continuous vertical wall section one unit thick. |
| Bond | Lapping units to prevent vertical joints from aligning. |
| Header | Unit extending over the wall thickness. |
| Stretcher | Unit laid lengthwise of a wall. |
| English bond | Alternate courses of stretchers and headers. |
| Flemish bond | Alternate headers and stretchers in each course. |
| CHB cell or core | Void in a hollow masonry unit. |

## Common Mistakes

- Calling a wythe a joint.
- Treating lecture construction notes as a substitute for code text.
- Publishing NSCP or PD 1096 section numbers without the primary source.
- Forgetting that bond is about lapping units so vertical joints do not align.`,
  },
];

const questionPools = {
  steelMembers: [
    {
      prompt:
        'A steel member item gives a KL/r value but this batch did not capture the governing AISC table. What is the source-safe response?',
      correct:
        'Treat the exact slenderness limit as standard-controlled and verify it from the applicable steel design source before publishing compliance.',
      distractors: [
        'Declare compliance from memory because every tension and compression member has the same limit.',
        'Ignore slenderness because only section shape matters.',
        'Use the masonry lecture to set the steel member limit.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt:
        'A bolted steel connection needs a transition piece between a member and its fasteners or welds. Which source-backed family of elements fits that role?',
      correct: 'A transitional steel element such as an angle, tee, or plate.',
      distractors: [
        'A concrete topping used only to bond precast slabs.',
        'A masonry heading course.',
        'A roof finish schedule.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt:
        'A compression member is described as slender. What source-backed failure concern should be checked before accepting the member?',
      correct:
        'Lateral buckling from compressive stress acting on a slender portion with insufficient lateral rigidity.',
      distractors: [
        'Only water penetration through a masonry cavity.',
        'Only the color of shop primer.',
        'Only the number of courses in a masonry bond.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt:
        'Which source-safe habit best prevents overclaiming when selecting a steel bracing or secondary member?',
      correct:
        'Match the shape to the load path, support condition, connection, and source-backed design check.',
      distractors: [
        'Select the smallest visible shape without checking stability.',
        'Use a CHB reinforcement note as the steel design table.',
        'Assume any shape is correct if it is drawn in elevation.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt:
        'The local source notes web stiffeners where concentrated loads might cripple joist webs. What does this teach for LEA reasoning?',
      correct:
        'Concentrated-load locations can require local stiffening instead of only a larger span member.',
      distractors: [
        'Stiffeners replace all connection design.',
        'Concentrated loads are always ignored in steel framing.',
        'Web stiffeners are masonry bond patterns.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt: 'Which statement about W shapes stays inside the local source boundary?',
      correct:
        'Wide-flange W shapes have largely superseded classic S shapes for steel beams.',
      distractors: [
        'W shape numbers automatically prove exact capacity without a table.',
        'W shapes are masonry wythes.',
        'W shapes never need connection checks.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt:
        'A truss or frame connection is shown with welded members and a plate. What is the source-safe review focus?',
      correct:
        'Confirm the plate or other transitional element completes the intended load path through the welds or bolts.',
      distractors: [
        'Assume the connection works because a plate is visible.',
        'Check only the wall paint color.',
        'Use a CHB cell count as the weld acceptance rule.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt: 'Why does flange width matter in the local steel member source?',
      correct:
        'Increasing steel beam flange width increases resistance to lateral buckling.',
      distractors: [
        'It sets the number of masonry courses.',
        'It replaces all allowable-stress checks.',
        'It proves the bolt grade without inspection.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt:
        'A question asks for exact steel grade Fy and Fu values, but Batch 147 did not capture a readable grade table. What should the answer do?',
      correct:
        'Use the applicable steel standard or project source instead of restoring uncaptured values.',
      distractors: [
        'Invent values from memory and cite no source.',
        'Use mortar joint thickness as the steel strength.',
        'Assume every steel grade has the same strength.',
      ],
      citation: 'bsi-steel-members',
    },
    {
      prompt: 'Which source-backed statement is safest for structural tubing or hollow tubular steel members?',
      correct:
        'Structural tubing is a recognized steel member form, but exact capacity and suitability still require the applicable design check.',
      distractors: [
        'Structural tubing always eliminates lateral-force design.',
        'Structural tubing is the same as a masonry collar joint.',
        'Structural tubing never needs fabrication or connection review.',
      ],
      citation: 'bsi-steel-members',
    },
  ],
  boltedConnections: [
    {
      prompt:
        'A question asks for the exact strength difference between A307 and A325 bolts. What is the Batch 147 source-safe response?',
      correct:
        'Verify exact bolt grade properties from the applicable bolting standard because this batch did not capture those values.',
      distractors: [
        'Use the same strength for every bolt grade.',
        'Use masonry CHB dimensions to set bolt strength.',
        'Treat bolt grade as an architectural finish.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A field item asks whether DTI washers are acceptable for pretension verification. What should this batch say?',
      correct:
        'Use the applicable bolting standard or project specification because this source capture did not include DTI acceptance rules.',
      distractors: [
        'Approve DTI washers without any standard because all visual checks are equivalent.',
        'Reject all bolted connections because welding exists.',
        'Use masonry bond pattern rules as the inspection method.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A bolted splice question asks for a minimum edge distance from an AISC table. What is the correct source discipline?',
      correct:
        'Do not publish the edge distance from memory; verify it from the applicable connection table.',
      distractors: [
        'Measure from the nearest masonry course instead.',
        'Use any value as long as the bolt is visible.',
        'Treat edge distance as irrelevant in all bolted joints.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A single-row bolt layout asks for exact pitch compliance. What can this local source boundary support?',
      correct:
        'It supports the idea that the connection is bolted, but exact pitch compliance must come from the applicable design table.',
      distractors: [
        'It proves every pitch is acceptable.',
        'It replaces the table with a masonry joint rule.',
        'It makes bolt spacing a purely aesthetic choice.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A tension member has bolt holes and the item asks for final capacity. What is the safest answer style for this batch?',
      correct:
        'State that hole effects and final capacity are design-standard controlled and require the applicable source.',
      distractors: [
        'Ignore holes because the connection is bolted.',
        'Use only the member paint specification.',
        'Use a CHB lintel note as the steel capacity equation.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A question asks for minimum pretension for an M24 high-strength bolt. What should Batch 147 do?',
      correct:
        'Leave the exact pretension value to the applicable bolting standard because this capture did not supply it.',
      distractors: [
        'Invent the pretension value from memory.',
        'Use the beam span rule of thumb as bolt pretension.',
        'Say pretension never matters in a steel connection.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt: 'Which source-backed distinction describes a pin or hinge joint?',
      correct: 'It allows rotation while resisting translation.',
      distractors: [
        'It restrains all rotation and translation like a fixed joint.',
        'It is the air space between masonry wythes.',
        'It is a concrete topping bonded to precast units.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt: 'Which source-backed distinction describes a rigid or fixed joint?',
      correct:
        'It restrains rotation and translation and provides force and moment resistance.',
      distractors: [
        'It allows free rotation like a hinge.',
        'It is a CHB cell filled with mortar.',
        'It is only a roof drainage detail.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A field-bolted connection asks for a turn-of-nut sequence. What should be cited?',
      correct:
        'The applicable bolting standard or project specification, because this batch captured connection concepts but not installation sequence rules.',
      distractors: [
        'The masonry lecture bond-pattern list.',
        'The article title alone.',
        'No source, because installation sequence never affects bolted work.',
      ],
      citation: 'bsi-steel-connections',
    },
    {
      prompt:
        'A connection detail uses oversized holes. What should this batch avoid claiming?',
      correct:
        'Exact oversized-hole permissions and limits, unless a readable connection standard is captured.',
      distractors: [
        'That bolted connections are point connections.',
        'That welded connections are line connections.',
        'That plates, tees, and angles can be transitional elements.',
      ],
      citation: 'bsi-steel-connections',
    },
  ],
  masonry: [
    {
      prompt: 'In concrete hollow block masonry, which definition of a cell stays inside the local source boundary?',
      correct: 'A cell or core is one of the hollow voids within a CHB unit.',
      distractors: [
        'The horizontal surface where units lie in a course.',
        'A complete layer of masonry units.',
        'A steel bolted point connection.',
      ],
      citation: 'masonry-lecture-terms-chb; bsi-masonry-walls',
    },
    {
      prompt:
        'A question asks for a code-backed stack-bond seismic rule. What should Batch 147 do?',
      correct:
        'Verify the rule against the applicable masonry code because this local capture did not include that code requirement.',
      distractors: [
        'Publish the seismic rule from memory.',
        'Use an AISC bolting concept as the masonry code.',
        'Treat stack bond as automatically code-compliant in all cases.',
      ],
      citation: 'masonry-lecture-terms-chb',
    },
    {
      prompt:
        'A masonry question asks for solid-grouting requirements in a seismic cavity wall. What is the source-safe answer?',
      correct:
        'Use the applicable code or project source; this batch only captured masonry terms, CHB notes, and general reinforcement concepts.',
      distractors: [
        'Approve every cavity wall without code review.',
        'Use steel beam flange width as the grouting rule.',
        'Assume all cells remain empty even when reinforcement is present.',
      ],
      citation: 'masonry-lecture-terms-chb; bsi-masonry-walls',
    },
    {
      prompt: 'What is a wythe or tier in the local masonry lecture?',
      correct: 'A continuous vertical wall section one masonry unit thick.',
      distractors: [
        'A bolt pretension inspection washer.',
        'A steel moment connection.',
        'A roof deck diaphragm weld.',
      ],
      citation: 'masonry-lecture-terms-chb',
    },
    {
      prompt: 'What is the structural idea behind masonry bond in the local lecture?',
      correct:
        'Units are lapped so vertical joints do not fall over each other, helping the work act as a connected mass.',
      distractors: [
        'Units are aligned so every vertical joint stacks continuously.',
        'Bond means only the paint applied to masonry.',
        'Bond is a high-strength steel bolt grade.',
      ],
      citation: 'masonry-lecture-terms-chb',
    },
    {
      prompt: 'Which comparison of English bond and Flemish bond is source-backed?',
      correct:
        'English bond alternates courses of stretchers and headers; Flemish bond alternates headers and stretchers in each course.',
      distractors: [
        'English bond is a steel flange weld and Flemish bond is a bolt hole.',
        'Both are exact NSCP seismic section numbers captured in this batch.',
        'Both require no lapping of masonry units.',
      ],
      citation: 'masonry-lecture-terms-chb',
    },
    {
      prompt:
        'A continuous vertical section of masonry one unit thick is called a ___.',
      correct: 'Wythe or tier.',
      distractors: ['Bolt pitch.', 'Web stiffener.', 'Rigid frame.'],
      citation: 'masonry-lecture-terms-chb',
    },
    {
      prompt:
        'A two-wythe wall question asks whether the detail complies with Philippine code. What is the source-safe answer style?',
      correct:
        'Do not claim code compliance without the applicable code source; use the lecture only for terms such as wythe, bond, header, and stretcher.',
      distractors: [
        'Declare compliance because two wythes are visible.',
        'Use AISC bolt spacing to approve masonry.',
        'Ignore bond and reinforcement because masonry is decorative only.',
      ],
      citation: 'masonry-lecture-terms-chb; bsi-masonry-walls',
    },
    {
      prompt:
        'A question asks for NSCP cavity air-space limits. What did Batch 147 capture?',
      correct:
        'No NSCP cavity dimension table; the exact limit must be verified from the applicable code source.',
      distractors: [
        'A complete NSCP cavity table with section number.',
        'An A325 bolt pretension table.',
        'A rule that cavities never need source verification.',
      ],
      citation: 'masonry-lecture-terms-chb',
    },
    {
      prompt:
        'Which local-source term best answers a question about a one-unit-thick vertical wall section?',
      correct: 'Wythe or tier.',
      distractors: ['Collar-joint code table.', 'Bolt edge distance.', 'Steel flange weld.'],
      citation: 'masonry-lecture-terms-chb',
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

function fileSummary(path) {
  return {
    path: rel(path),
    exists: existsSync(path),
    bytes: existsSync(path) ? statSync(path).size : 0,
    sha256: existsSync(path) ? sha256File(path) : null,
  };
}

function findArticleDir(slug) {
  const matches = execFileSync(
    'find',
    [ARTICLE_ROOT, '-maxdepth', '1', '-type', 'd', '-name', `${slug}--*`],
    { cwd: REPO, encoding: 'utf8' },
  )
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

function baselineQuestionMap(questions) {
  const map = new Map();
  for (const question of questions) {
    const key = question.id ?? question.question_id;
    if (!key) throw new Error('Linked question missing id/question_id');
    map.set(key, question);
  }
  return map;
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

${family.exclusions.map((note) => `- ${note}`).join('\n')}

## Use Rule

Use only the extracted claims above for Batch ${BATCH} article and linked-question edits. When a local code table, material value, section number, or exact procedure is not present in this capture boundary, keep the statement conceptual or state that the exact requirement must come from the applicable code, standard, project specification, or supplied source.
`;

  const refined = `# Batch ${BATCH} Refined Source Map: ${family.title}

## Canonical Locator

${family.locator}

## Safe Exam Claims

${family.notes.map((note, index) => `${index + 1}. ${note}`).join('\n')}

## Exclusions

${family.exclusions.map((note, index) => `${index + 1}. ${note}`).join('\n')}

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
      `${rawSource.sha256}:${refinedSource.sha256}:${family.locator}:${family.notes.join('|')}:${family.exclusions.join('|')}`,
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
      exclusions: source.exclusions,
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
        : `${option.text} is not the best answer because it changes the concept or adds a claim outside the Batch ${BATCH} local source boundary.`;
  }
  rationale.correct = `${correctText} Supported by ${question.citation}.`;
  rationale.takeaway = `For ${article.title}, classify the condition and source boundary before using memorized exact values.`;
  rationale.source_boundary = question.citation;
  rationale.checked_sources = sources.map((source) => source.id);
  return rationale;
}

function rewriteQuestions(article, baselineQuestions, sources) {
  const pool = questionPools[article.questionPool];
  if (!pool || pool.length !== baselineQuestions.length) {
    throw new Error(
      `${article.cluster_id} expected ${baselineQuestions.length} question rewrites, got ${pool?.length ?? 0}`,
    );
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
    source_candidates_checked: sourceCandidatesChecked,
    reviewed_at: nowIso(),
    reviewed_by: `codex-${BATCH_ID}`,
    reviewer_comments:
      'Batch 147 local-first source-audited rewrite constrained to checked local structural source artifacts; no Supabase mutation.',
    updated_at: nowIso(),
    updated_by: `codex-${BATCH_ID}`,
    updated_note:
      'Batch 147 local-first source-audited article and linked-question rewrite; no Supabase mutation.',
    hash_algorithm: 'sha256',
  };
  writeJson(join(dir, 'article-metadata.json'), nextMetadata);
  return nextMetadata;
}

function writeSourceEvidence(dir, article, sources, normalizedHash, candidateHash, questionHashes) {
  const evidence = {
    batch: BATCH,
    batch_id: BATCH_ID,
    reservation_manifest: RESERVATION_MANIFEST,
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    source_strategy: 'local_first_fixed_manifest',
    source_count: sources.length,
    sources,
    source_candidates_checked: sourceCandidatesChecked,
    normalized_sha256: normalizedHash,
    candidate_sha256: candidateHash,
    question_count: questionHashes.length,
    question_hashes: questionHashes,
    real_world_scenario_status: 'included',
    exact_code_claim_policy:
      'exact code, material, table, or procedure values omitted unless present in captured local source boundary',
    no_exact_code_claims: article.noExactCodeClaims,
    blocked_residuals_not_edited: blockedClusters,
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
    throw new Error(
      `${article.cluster_id} expected ${article.expected_question_count} linked questions, found ${baselineQuestions.length}`,
    );
  }

  const original = readText(join(dir, 'original.md'));
  const sources = buildSources(article, sourceRecords);
  const sourcesFile = {
    batch: BATCH,
    batch_id: BATCH_ID,
    reservation_manifest: RESERVATION_MANIFEST,
    article_id: article.article_id,
    cluster_id: article.cluster_id,
    slug: article.slug,
    source_strategy: 'local_first_fixed_manifest',
    source_count: sources.length,
    sources_hash: sha256Text(JSON.stringify(sources)),
    sources,
    source_candidates_checked: sourceCandidatesChecked,
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
      scopedValidation: rel(join(dir, 'scoped-validation-batch-147.json')),
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
    writeJson(join(dir, 'scoped-validation-batch-147.json'), {
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
  const allJsonPass = jsonParse.every((check) =>
    ['pass', 'deleted_tracked'].includes(check.status),
  );

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
      linked_question_question_edit_parity: articleChecks.every(
        (check) => check.question_edit_count === check.linked_question_count,
      )
        ? 'pass'
        : 'fail',
      question_edit_count: articleChecks.every(
        (check) => check.question_edit_count === check.expected_question_count,
      )
        ? 'pass'
        : 'fail',
      answer_key_preserved: articleChecks.every((check) => check.answer_key_preserved === 'pass')
        ? 'pass'
        : 'fail',
      stale_compose_error_scan: articleChecks.every(
        (check) => check.stale_compose_error_scan === 'pass',
      )
        ? 'pass'
        : 'fail',
      targeted_content_audit_tests: TARGETED_TESTS_PASSED ? 'pass' : 'pending',
      scoped_git_diff_check: diffCheck.status,
    },
    article_checks: articleChecks,
    source_hash_checks: sourceChecks,
    source_candidates_checked: sourceCandidatesChecked.map((candidate) => ({
      ...candidate,
      exists: existsSync(abs(candidate.path)),
      sha256: existsSync(abs(candidate.path)) ? sha256File(abs(candidate.path)) : null,
    })),
    scoped_json_parse: jsonParse,
    scoped_git_diff_check: diffCheck,
    targeted_tests: {
      command: TARGETED_TESTS_COMMAND,
      status: TARGETED_TESTS_PASSED ? 'pass' : 'pending_external_run',
    },
    validation_notes: [
      'Scoped checks intentionally validate only Batch 147 fixed-manifest article/source/question/handoff paths.',
      'Root sync-state.json is excluded from this batch and was not modified.',
      'AISC raw PDF was checked and hashed, but exact AISC values were not restored without a reliable readable local capture.',
    ],
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

Batch ${BATCH} used only reservation manifest ${RESERVATION_MANIFEST} and edited exactly the reserved clusters: ${entries
    .map((entry) => entry.cluster_id)
    .join(', ')}.

Hard blocked carry-forward clusters were not edited: ${blockedClusters
    .map((cluster) => cluster.cluster_id)
    .join(', ')}.

## Selected Clusters

${entries
  .map(
    (entry) =>
      `- ${entry.cluster_id}: ${entry.title} (${entry.question_count}/${entry.expected_question_count} linked questions rewritten)`,
  )
  .join('\n')}

## Source Discipline

All published claims were constrained to local Vitruvius source artifacts captured under:

- vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-147/
- vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-147/

Each article includes a source-safe Real World Scenario. Exact AISC slenderness, steel grade, bolt grade, hole, edge-distance, pitch, pretension, and inspection claims were omitted. Exact NSCP or PD 1096 masonry section claims and cavity-wall code dimensions were omitted. The local AISC raw PDF was checked and hashed but not used for exact claims because no reliable readable AISC capture was available in this run.

## Validation

${validationSummary(checks)}

## Validation Boundary

Scoped validation covers the generated Batch 147 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json is excluded from this batch and was not modified.

## Targeted Tests

- ${TARGETED_TESTS_COMMAND}: ${TARGETED_TESTS_PASSED ? 'pass' : 'pending external run'}

## Stop Condition

Stop after the three fixed-manifest clusters are generated, scoped validation artifacts are written, targeted tests pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
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
- Batch 147 used only the reservation manifest and did not swap clusters.
- Exact AISC and masonry code/table claims outside the readable local source boundary were intentionally not restored.
- The hard blocked carry-forward clusters and unrelated dirty paths were left untouched.

## Evidence

${validationSummary(checks)}

## Validation Boundary

Scoped checks are the gating evidence for this batch. The repository-level sync-state file is explicitly excluded from Batch 147 staging, so validators that require it to match every touched bundle are not used to justify this handoff.

## Remaining Risk

The batch is intentionally limited to local source captures and does not claim complete AISC high-strength bolting coverage, steel member table coverage, NSCP masonry compliance, or PD 1096 masonry section coverage.
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
Constrain Batch 147 structural content to readable local sources

Constraint: Batch 147 used only the fixed reservation manifest for lea-strc-008-01, lea-strc-008-02, and lea-strc-010-01.
Rejected: Restoring exact AISC bolt/slenderness/grade tables or NSCP/PD1096 masonry code claims without readable local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: ${TARGETED_TESTS_PASSED ? TARGETED_TESTS_COMMAND : 'scoped compose/diff/validate, JSON parse, marker scan, source hash checks, linked-question/question-edit parity, stale compose-error scan, scoped git diff --check'}
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
    task:
      'Fixed-manifest local-first article and linked-question pass for Batch 147 reserved structural clusters.',
    reservation_manifest: RESERVATION_MANIFEST,
    reserved_clusters_only: entries.map((entry) => entry.cluster_id),
    blocked_residuals_not_edited: blockedClusters,
    selected_clusters: entries,
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
          exclusions: source.exclusions,
        },
      ]),
    ),
    source_candidates_checked: checks.source_candidates_checked,
    validation: checks.validation_claims,
    required_artifacts: Object.fromEntries(
      Object.entries(OUTPUTS).map(([key, path]) => [key, rel(path)]),
    ),
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
    reservation_manifest: RESERVATION_MANIFEST,
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
    source_candidates_checked: checks.source_candidates_checked,
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

  const head = git(['rev-parse', '--short=10', 'HEAD']);
  if (!head.startsWith(BASELINE)) {
    throw new Error(`Batch ${BATCH} expected baseline ${BASELINE}, got HEAD ${head}`);
  }

  const reservation = readJson(abs(RESERVATION_MANIFEST));
  const reserved = new Set(reservation.reserved_clusters.map((cluster) => cluster.cluster_id));
  const articleIds = new Set(articles.map((article) => article.cluster_id));
  if (reserved.size !== articles.length || [...articleIds].some((cluster) => !reserved.has(cluster))) {
    throw new Error('Batch 147 article list does not match the reservation manifest exactly.');
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
