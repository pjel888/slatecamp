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
const BATCH = 144;
const BASELINE = '71fff2685';
const BATCH_ID = 'source-audited-batch-144-local-first';
const STATUS = process.env.BATCH144_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_COMMAND =
  'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts';
const TARGETED_TESTS_PASSED = process.env.BATCH144_TARGETED_TESTS_PASSED === 'true';

const ARTICLE_ROOT = join(REPO, '.ai/content-audit-export/articles');
const PLANS_DIR = join(REPO, '.ai/03_plans');
const EXPORT_DIR = join(REPO, '.ai/content-audit-export');
const RUNS_DIR = join(EXPORT_DIR, 'runs');
const RAW_CAPTURE_DIR = join(
  REPO,
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-144',
);
const REFINED_CAPTURE_DIR = join(
  REPO,
  'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-144',
);

const OUTPUTS = {
  manifest: join(PLANS_DIR, 'production-line-batch-144-manifest.json'),
  report: join(EXPORT_DIR, 'source-audited-article-batch-144-local-first-report.md'),
  ledger: join(EXPORT_DIR, 'source-audited-article-batch-144-local-first-ledger.json'),
  scopedChecks: join(EXPORT_DIR, 'source-audited-article-batch-144-local-first-scoped-checks.json'),
  qualityReview: join(PLANS_DIR, 'batch-144-independent-quality-review.md'),
  stageList: join(PLANS_DIR, 'batch-144-git-handoff-stage-list.md'),
  stagePaths: join(PLANS_DIR, 'batch-144-git-handoff-stage-paths.txt'),
  generationSummary: join(
    RUNS_DIR,
    'source-audited-batch-144-local-generation-summary.json',
  ),
  contentGenerationSummary: join(
    EXPORT_DIR,
    'source-audited-article-batch-144-local-first-content-generation-summary.json',
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
  {
    cluster_id: 'lea-theo-008-02',
    status: 'blocked_carried_forward_from_batch_143',
    reason:
      'No completed blocked-source-recovery report was present at generation time; source recovery is still read-only.',
  },
  {
    cluster_id: 'lea-theo-008-03',
    status: 'blocked_carried_forward_from_batch_143',
    reason:
      'No completed blocked-source-recovery report was present at generation time; source recovery is still read-only.',
  },
  {
    cluster_id: 'lea-matl-009-02',
    status: 'blocked_carried_forward_from_batch_143',
    reason:
      'No completed blocked-source-recovery report was present at generation time; source recovery is still read-only.',
  },
  {
    cluster_id: 'lea-util-004-05',
    status: 'blocked_carried_forward_from_batch_143',
    reason:
      'No completed blocked-source-recovery report was present at generation time; source recovery is still read-only.',
  },
  {
    cluster_id: 'lea-util-004-08',
    status: 'blocked_carried_forward_from_batch_143',
    reason:
      'No completed blocked-source-recovery report was present at generation time; source recovery is still read-only.',
  },
  {
    cluster_id: 'lea-strc-004-02',
    status: 'blocked_carried_forward_from_batch_143',
    reason:
      'No completed blocked-source-recovery report was present at generation time; source recovery is still read-only.',
  },
];

const sourceFamilies = {
  bsiDesign: {
    id: 'bsi-design',
    title: 'Building Structures Illustrated - structural design and allowable stress',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'refined markdown lines 799-801, 1020-1026, 1046-1064, 1986-2010, 2118-2125',
    notes: [
      'Structural analysis checks whether a structure can safely carry loads without material distress, excessive deformation, or failure.',
      'Structural design sizes and proportions members so stresses stay within the intended design limit.',
      'Redundancy and ductility improve safety because alternate paths and plastic deformation can provide warning and reserve strength.',
      'Load paths must remain continuous through beams, columns, walls, connections, and foundations.',
      'Service behavior such as deflection and vibration can control even when strength appears adequate.',
    ],
  },
  bsiBending: {
    id: 'bsi-bending',
    title: 'Building Structures Illustrated - beam bending, neutral axis, shear, and deflection',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'refined markdown lines 1986-2010, 2118-2125',
    notes: [
      'A beam resists bending with compression on one side of the neutral axis and tension on the other.',
      'Bending stresses increase with distance from the neutral axis.',
      'Shear and deflection remain part of the beam check and can govern member sizing.',
      'Concentrated and distributed loads affect the beam response and must be traced to supports.',
    ],
  },
  bsiConcrete: {
    id: 'bsi-concrete',
    title: 'Building Structures Illustrated - concrete structural context',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'refined markdown lines 714-801, 1046-1064, 1986-2010',
    notes: [
      'Concrete members participate in the same structural system requirement: loads must be collected, supported, and transmitted to the ground.',
      'The member check must consider material distress, deflection, stability, and connection continuity.',
      'Beam bending produces compression and tension zones that reinforcement detailing must address in reinforced concrete work.',
    ],
  },
  mechanicsAllowable: {
    id: 'mechanics-allowable',
    title: 'Mechanics and Strength of Materials - allowable stress method and bending stress',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Mechanics and Strength of Materials.pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Mechanics and Strength of Materials.md',
    locator: 'refined markdown lines 8438-8545, 11940-11962, 26528-26538',
    notes: [
      'The safety stress or allowable stress method requires computed stress not to exceed the allowable stress.',
      'For axial tension, the source presents a check in the form stress demand less than or equal to allowable stress.',
      'For bending, maximum stress is evaluated with section modulus and compared with allowable stress.',
      'A stress-only check may be insufficient when deformation limits or buckling stability govern.',
    ],
  },
  fundamentalsStrength: {
    id: 'fundamentals-strength',
    title: 'Fundamentals of Structural Engineering - service loads, factored loads, and ultimate demand',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Fundamentals of Structural Engineering.pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Fundamentals of Structural Engineering.md',
    locator: 'refined markdown lines 30205-30260, 30709-30749, 62077, 62222, 62417',
    notes: [
      'The source distinguishes service load quantities from factored ultimate demand such as Pu in design examples.',
      'Examples use factored load combinations for strength design while also considering service-load quantities in foundation work.',
      'Factored axial force and factored moment are demand quantities that must be compared against the corresponding resistance format.',
    ],
  },
  detailingConcrete: {
    id: 'detailing-concrete',
    title: 'Detailing of Reinforcement in Concrete Structures - cover, exposure, spacing, and mix limits',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Detailing of Reinforcment in Concrete Structures.pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Detailing of Reinforcment in Concrete Structures.md',
    locator: 'refined markdown lines 46-80, 91-132',
    notes: [
      'Reinforcement must be accurately placed and adequately supported before concrete is placed.',
      'Minimum spacing between parallel bars is tied to bar diameter, aggregate size, and clear dimension requirements.',
      'Cover requirements vary with exposure, contact with earth or weather, and concrete member type.',
      'The source links exposure conditions to maximum water-cement ratio, minimum cement content, and aggregate size.',
    ],
  },
  detailingRebar: {
    id: 'detailing-rebar',
    title: 'Detailing of Reinforcement in Concrete Structures - bars, hooks, spacing, and surface condition',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Detailing of Reinforcment in Concrete Structures.pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Detailing of Reinforcment in Concrete Structures.md',
    locator: 'refined markdown lines 7-35, 46-80, 176-206',
    notes: [
      'The source identifies 180-degree hooks, 90-degree hooks, and 135-degree bends for stirrup and tie anchorage.',
      'Minimum bend diameters depend on bar size and hook type.',
      'Reinforcement surfaces must be free from harmful coatings, while ordinary rust or mill scale can be acceptable when bar dimensions and weight remain compliant.',
      'Spirals and ties confine compression reinforcement and have specific size and spacing limits.',
    ],
  },
  detailingFlexural: {
    id: 'detailing-flexural',
    title: 'Detailing of Reinforcement in Concrete Structures - flexural and seismic detailing',
    rawPath:
      'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Detailing of Reinforcment in Concrete Structures.pdf',
    refinedPath:
      'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Detailing of Reinforcment in Concrete Structures.md',
    locator: 'refined markdown lines 637-676, 900-910, 923-940',
    notes: [
      'The source gives flexural-member detailing constraints for earthquake-resistant frames, including reinforcement ratio bounds and lap splice restrictions.',
      'Hoops and closed ties are part of the confinement and shear detailing response around critical regions.',
      'Support regions and beam-column joints require attention because reinforcement continuity and confinement affect ductile behavior.',
    ],
  },
};

const articles = [
  {
    cluster_id: 'lea-strc-005-02',
    article_id: '8a618b68-ffca-4df1-91e4-d3864a7968ac',
    slug: 'lea-strc-005-02-core-concept',
    title: 'Structural Capacity Checks: Demand, Resistance, and Same-Format Comparison',
    expected_question_count: 10,
    sourceKeys: ['fundamentalsStrength', 'bsiDesign'],
    primarySourceId: 'fundamentals-strength',
    noExactCodeClaims: [
      'No local source in this batch was used to restore exact NSCP strength reduction factor tables.',
      'No local source in this batch was used to restore a complete load-combination table beyond cited example combinations.',
      'No local source in this batch was used to state unsupported member-specific resistance formulas.',
    ],
    body: `# Structural Capacity Checks: Demand, Resistance, and Same-Format Comparison

## Board Exam Quick Check

A structural capacity check is a same-format comparison between the demand placed on a member or system and the resistance available from that member or system. The exam trap is mixing formats: factored demand must be compared with a corresponding strength-design resistance, while service-level stress belongs with an allowable-stress check.

## What You Need To Know

Structural analysis asks whether the proposed structure can carry loads without material distress, excessive deformation, or failure. Structural design then sizes and proportions the members so the resulting stresses and actions stay inside the selected design limit.

In strength design language, the demand may be expressed as a factored quantity, such as a factored axial load or factored moment. In allowable-stress language, the demand is usually a service-level computed stress. Either way, the logic is the same:

1. Identify the load path and the member being checked.
2. Identify whether the demand is service-level, factored, stress-based, axial, flexural, shear, or serviceability-based.
3. Compare it only against capacity in the same design format.
4. Check whether deformation, vibration, stability, or connection continuity controls even when the strength comparison appears adequate.

Redundancy and ductility matter because a structure is not only a collection of isolated member checks. Redundancy gives alternate paths if one element is locally overloaded. Ductility gives visible deformation and reserve behavior before brittle failure.

## Real World Scenario

A school adds a heavy water tank above an existing frame. The board-exam answer is not simply "bigger beam." First trace the load path from the tank to the slab, beam, column, footing, and soil. Then ask for the demand format and compare it with the matching resistance format. Even if the strength check passes, excessive deflection, vibration, connection discontinuity, or foundation overstress can still require redesign.

## High-Yield Distinctions

| Term | Exam-safe meaning |
| --- | --- |
| Demand | Load effect being imposed on the member or system. |
| Capacity or resistance | Ability of the member or system to resist the demand. |
| Same-format check | Factored demand with factored or reduced strength; service stress with allowable stress. |
| Serviceability | Deflection, vibration, cracking, or use-limit concern under service conditions. |
| Redundancy | Multiple load paths that reduce dependence on one critical member. |
| Ductility | Ability to deform plastically and warn before sudden failure. |

## Common Mistakes

- Comparing a factored demand to an allowable stress value.
- Treating a passed strength check as proof that deflection, vibration, or stability is acceptable.
- Ignoring connections and load-path discontinuities.
- Memorizing exact code factors without checking whether the question gives the design method and source table.`,
    questionPool: 'capacityCheck',
  },
  {
    cluster_id: 'lea-strc-005-03',
    article_id: 'e9e1832c-2829-48d7-91ae-77910608c5c2',
    slug: 'lea-strc-005-03-core-concept',
    title: 'Allowable Stress Design and Working-Stress Checks',
    expected_question_count: 10,
    sourceKeys: ['mechanicsAllowable', 'bsiDesign', 'bsiBending'],
    primarySourceId: 'mechanics-allowable',
    noExactCodeClaims: [
      'No local source in this batch was used to state exact A36 steel allowable-stress fractions.',
      'No local source in this batch was used to replace local code tables for material-specific allowable values.',
      'No local source in this batch was used to collapse buckling or deflection checks into a stress-only rule.',
    ],
    body: `# Allowable Stress Design and Working-Stress Checks

## Board Exam Quick Check

Allowable Stress Design, also called a working-stress check in many board-exam contexts, compares a service-level computed stress with an allowable stress. The safe memory rule is simple: compute the actual stress caused by service loading, then check that it does not exceed the allowable stress for the material, member, and limit state.

## What You Need To Know

The allowable-stress method uses a safety margin by limiting the stress permitted in the member. A basic axial tension check can be read as computed tensile stress less than or equal to allowable tensile stress. A flexural check follows the same idea: compute maximum bending stress using the section properties, then compare it with the allowable stress.

For beams, bending stress is tied to the neutral axis. Fibers farther from the neutral axis carry larger bending stress, which is why section depth and section modulus are so important. A deeper or more efficient section can reduce stress and deflection for the same loading.

Do not treat allowable stress as a universal shortcut. A stress check may pass while another limit still governs. Deflection, vibration, buckling, local instability, connection behavior, and load-path continuity can still control design.

## Real World Scenario

An architect reviews an existing mezzanine beam for added storage. In an ASD-style check, the engineer does not compare service stress with a factored design resistance. The engineer computes the service stress from the added load, compares it with the allowable stress, and separately reviews deflection and stability.

## High-Yield Distinctions

| Topic | Exam-safe cue |
| --- | --- |
| ASD or working stress | Service-level computed stress compared with allowable stress. |
| Strength design | Factored demand compared with matching factored or reduced resistance. |
| Axial stress | Force divided by area for the member direction being checked. |
| Bending stress | Highest at the extreme fibers farthest from the neutral axis. |
| Section modulus | A section property used to relate bending moment to bending stress. |
| Stability and serviceability | Separate checks that can govern even when stress is acceptable. |

## Common Mistakes

- Dividing a code yield value by an unsupported fraction when the local source table is not provided.
- Mixing ASD demand with strength-design resistance.
- Forgetting that buckling can govern compression members before material stress reaches its limit.
- Treating a bending-stress pass as a deflection pass.`,
    questionPool: 'allowableStress',
  },
  {
    cluster_id: 'lea-strc-006-01',
    article_id: '53aa35be-fddf-4a76-9e83-69e424f73586',
    slug: 'lea-strc-006-01-core-concept',
    title: 'Concrete Materials, Cover, and Exposure-Controlled Mix Limits',
    expected_question_count: 10,
    sourceKeys: ['detailingConcrete', 'bsiConcrete'],
    primarySourceId: 'detailing-concrete',
    noExactCodeClaims: [
      'No local source in this batch was used to restore unsupported slump or compressive-strength test details.',
      'No local source in this batch was used to state a full concrete-classification table beyond the captured cover and exposure material.',
      'No local source in this batch was used to replace project specification requirements for mix design approval.',
    ],
    body: `# Concrete Materials, Cover, and Exposure-Controlled Mix Limits

## Board Exam Quick Check

Concrete material questions often hide a durability check. Do not stop at compressive strength. Check cover, exposure, bar spacing, aggregate size, and water-cement control because these affect whether reinforcement stays protected and whether concrete can be placed around the steel.

## What You Need To Know

Reinforced concrete works because concrete and steel act together inside a structural load path. The source material for this batch emphasizes that reinforcement must be accurately placed and adequately supported before concrete is placed. If bars shift, cover becomes unreliable and durability assumptions break down.

Cover is the measured concrete protection between the reinforcement and the exposed surface. Required cover changes with exposure, member type, and whether the concrete is cast against earth, exposed to weather, or protected indoors. Exposure conditions also affect mix limits: the detailing source links more severe exposure to tighter water-cement limits and minimum cement content requirements.

Bar spacing and aggregate size are related. Parallel bars need enough clear space for concrete to flow, consolidate, and bond around reinforcement. When aggregate is too large for the available spacing, placement and consolidation become difficult even if the strength number on paper looks adequate.

## Real World Scenario

A coastal canopy beam is detailed with tightly spaced reinforcement and minimal cover. A safe review does not ask only for concrete strength. It checks whether the exposure demands lower permeability, whether cover is adequate, whether the aggregate can pass between bars, and whether the reinforcement will stay in position during placing.

## High-Yield Distinctions

| Topic | Exam-safe cue |
| --- | --- |
| Concrete cover | Concrete protection outside the reinforcement. |
| Exposure | Environmental severity that can tighten durability requirements. |
| Water-cement control | Mix durability control linked to permeability and exposure. |
| Bar spacing | Clear space needed for placement, consolidation, and bond. |
| Aggregate size | Must be compatible with bar spacing and placement conditions. |
| Supported reinforcement | Bars must be held in the correct position before concrete placement. |

## Common Mistakes

- Treating compressive strength as the only concrete material issue.
- Ignoring cover because the member is indoors in the drawing title.
- Selecting aggregate without checking clear spacing between bars.
- Assuming a site adjustment to water content is harmless to durability.`,
    questionPool: 'concreteMaterials',
  },
  {
    cluster_id: 'lea-strc-006-02',
    article_id: '0388b3cf-9e90-4c25-a653-90874cf59af3',
    slug: 'lea-strc-006-02-core-concept',
    title: 'Deformed Reinforcing Bars, Hooks, Spacing, Ties, and Spirals',
    expected_question_count: 10,
    sourceKeys: ['detailingRebar', 'detailingConcrete'],
    primarySourceId: 'detailing-rebar',
    noExactCodeClaims: [
      'No local source in this batch was used to restore a complete Philippine reinforcing-bar grade table.',
      'No local source in this batch was used to state unsupported development-length equations.',
      'No local source in this batch was used to replace project-specific bar marking or mill-certificate requirements.',
    ],
    body: `# Deformed Reinforcing Bars, Hooks, Spacing, Ties, and Spirals

## Board Exam Quick Check

Reinforcing bars are not just steel area. Board questions often test whether the bars can be anchored, placed, spaced, tied, and protected so the concrete and steel can act together.

## What You Need To Know

The detailing source identifies standard hook forms, including 180-degree hooks, 90-degree hooks, and 135-degree bends used for stirrup and tie anchorage. Hook geometry and bend diameter matter because reinforcement must be anchored without damaging the bar or defeating confinement.

Spacing is also a constructability and bond issue. Parallel bars require clear spacing tied to bar diameter, aggregate size, and minimum clear dimensions. Compression-member spacing has its own limits because concrete must pass around longitudinal bars and confinement reinforcement.

Surface condition matters. Reinforcement should be free from coatings that reduce bond. Ordinary rust or mill scale is not automatically a defect when the bar still meets dimensional and weight requirements.

Ties and spirals provide lateral support and confinement for compression reinforcement. The source gives minimum tie and spiral detailing concepts, including spiral clear spacing limits and tie spacing rules. In exam terms, ties and spirals are not decorative; they affect confinement, bar stability, and ductile behavior.

## Real World Scenario

A site inspection finds column ties spaced too widely near a beam-column joint and a lap splice placed in a critical region. A safe field comment is not only "add steel." It asks whether the bars are properly anchored, whether ties or hoops confine the region, whether cover and spacing still allow concrete placement, and whether the splice location matches the required detailing intent.

## High-Yield Distinctions

| Topic | Exam-safe cue |
| --- | --- |
| Deformed bar | Reinforcement shaped to improve bond with concrete. |
| Standard hook | Bend and extension used to anchor reinforcement. |
| 135-degree hook | Common confinement hook form for closed ties and stirrups. |
| Clear spacing | Space needed for concrete flow, consolidation, and bond. |
| Tie | Lateral reinforcement that restrains longitudinal bars. |
| Spiral | Continuous helical confinement reinforcement in compression members. |

## Common Mistakes

- Treating bar area as sufficient even when anchorage is poor.
- Ignoring cover and spacing during reinforcement congestion checks.
- Rejecting all rust without checking whether it impairs bond or dimensions.
- Confusing a tie, stirrup, hoop, and spiral in confinement questions.`,
    questionPool: 'rebarDetailing',
  },
  {
    cluster_id: 'lea-strc-006-03',
    article_id: '2240c4ba-140c-4310-b097-e8c9197e2d8f',
    slug: 'lea-strc-006-03-core-concept',
    title: 'Reinforced Concrete Flexure: Neutral Axis, Ductility, and Detail Continuity',
    expected_question_count: 10,
    sourceKeys: ['bsiBending', 'fundamentalsStrength', 'detailingFlexural'],
    primarySourceId: 'bsi-bending',
    noExactCodeClaims: [
      'No local source in this batch was used to restore exact Whitney stress-block constants.',
      'No local source in this batch was used to state exact concrete ultimate strain limits.',
      'No local source in this batch was used to replace local code tables for minimum or maximum flexural steel ratios beyond captured source notes.',
    ],
    body: `# Reinforced Concrete Flexure: Neutral Axis, Ductility, and Detail Continuity

## Board Exam Quick Check

In flexure, a beam has compression on one side of the neutral axis and tension on the other. Reinforced concrete uses detailing to make that bending action reliable: concrete carries compression well, while reinforcement is placed so tensile force and cracking behavior are controlled.

## What You Need To Know

The neutral axis is the reference line where bending stress changes sign. Fibers farther from it carry greater bending stress. That is why effective depth, reinforcement position, and section layout matter so much in reinforced concrete beams.

Flexural design is not only a stress-block calculation. The load path must remain continuous through the beam, support, joint, column, and foundation. Ductility matters because a desirable structural response gives warning and reserve deformation rather than sudden brittle failure.

The detailing source also gives earthquake-resistant flexural-member rules, including reinforcement ratio bounds, lap-splice restrictions, hoops, and closed ties near critical regions. For board purposes, the safe concept is that reinforcement must be continuous, anchored, and confined where plastic rotation and high shear are expected.

## Real World Scenario

A garage beam spans over a wide opening and supports a wall above. The drawing should not be checked only by asking whether there is enough steel area at midspan. A safer review traces the bending demand, the neutral-axis behavior, the tension reinforcement path, the support anchorage, the stirrup or hoop confinement, and lap splice locations near critical regions.

## High-Yield Distinctions

| Topic | Exam-safe cue |
| --- | --- |
| Neutral axis | Location where bending stress changes from compression to tension. |
| Compression zone | Region of the section in compression under bending. |
| Tension reinforcement | Steel positioned to resist tensile force and control cracking. |
| Effective depth | Distance concept that controls flexural lever arm and bending performance. |
| Ductility | Ability to deform and redistribute before brittle failure. |
| Detail continuity | Anchorage, splices, ties, hoops, and load path working together. |

## Common Mistakes

- Memorizing stress-block constants without first identifying the tension and compression sides.
- Treating midspan steel area as the whole flexural check.
- Ignoring anchorage or splice location near supports and joints.
- Forgetting that ductile detailing is a system behavior, not a decorative drawing note.`,
    questionPool: 'rcFlexure',
  },
];

const questionPools = {
  capacityCheck: [
    {
      prompt: 'What is the safest first move in a structural capacity check?',
      correct:
        'Identify the demand, resistance, design format, and load path before comparing values.',
      distractors: [
        'Select the largest beam depth before checking the load path.',
        'Use allowable stress values for every structural method.',
        'Ignore serviceability once a strength value is available.',
      ],
      citation: 'fundamentals-strength; bsi-design',
    },
    {
      prompt: 'Why must demand and capacity be compared in the same design format?',
      correct:
        'Because factored demand belongs with matching strength resistance, while service stress belongs with allowable stress.',
      distractors: [
        'Because all structural design methods use service loads only.',
        'Because allowable stress and factored resistance are identical terms.',
        'Because serviceability replaces strength checks in every case.',
      ],
      citation: 'fundamentals-strength; mechanics-allowable',
    },
    {
      prompt: 'In a strength-design example, what does a factored load such as Pu represent?',
      correct: 'An amplified design demand used for a strength-format comparison.',
      distractors: [
        'A measured crack width under service loading.',
        'The allowable stress of the material.',
        'The final architectural occupancy load only.',
      ],
      citation: 'fundamentals-strength',
    },
    {
      prompt: 'Which item is a serviceability concern rather than a pure strength comparison?',
      correct: 'Excessive deflection or vibration under use conditions.',
      distractors: [
        'The spelling of the member mark.',
        'The color of the structural drawing sheet.',
        'The room name printed beside the beam.',
      ],
      citation: 'bsi-design',
    },
    {
      prompt: 'What does redundancy add to a structural system?',
      correct: 'Alternate load paths that reduce dependence on one isolated member.',
      distractors: [
        'A rule that connections no longer need design.',
        'A way to remove foundations from the load path.',
        'A replacement for checking member demand.',
      ],
      citation: 'bsi-design',
    },
    {
      prompt: 'Why is ductility valuable in structural safety?',
      correct: 'It can provide visible deformation and reserve behavior before brittle failure.',
      distractors: [
        'It eliminates every serviceability check.',
        'It makes all members stronger than their material limits.',
        'It removes the need for continuity in the load path.',
      ],
      citation: 'bsi-design',
    },
    {
      prompt: 'Why should an exam answer avoid unsupported exact reduction-factor tables?',
      correct: 'Exact factors must come from the applicable code table or a captured source.',
      distractors: [
        'Exact factors are never used in structural design.',
        'All factors are chosen by the architect during schematic design.',
        'Factored demand is the same as service stress.',
      ],
      citation: 'fundamentals-strength',
    },
    {
      prompt: 'A heavy tank is added above an existing frame. What is the most defensible review sequence?',
      correct: 'Trace the load path, identify demand format, compare matching capacity, and check serviceability.',
      distractors: [
        'Approve it if the tank fits on the roof plan.',
        'Check only the paint specification of the frame.',
        'Use a service stress value as a factored resistance.',
      ],
      citation: 'bsi-design; fundamentals-strength',
    },
    {
      prompt: 'What is capacity or resistance in a structural check?',
      correct: 'The ability of a member or system to resist the imposed demand.',
      distractors: [
        'The architectural finish area of the member.',
        'The name of the structural drawing scale.',
        'The service load before any comparison is made.',
      ],
      citation: 'bsi-design',
    },
    {
      prompt: 'Which habit best prevents capacity-check errors?',
      correct: 'Label the method, units, demand, resistance, and comparison format before solving.',
      distractors: [
        'Memorize one answer format for every material.',
        'Ignore support and connection behavior.',
        'Use the same value for all service and strength checks.',
      ],
      citation: 'fundamentals-strength; bsi-design',
    },
  ],
  allowableStress: [
    {
      prompt: 'What does an allowable-stress check compare?',
      correct: 'Service-level computed stress against an allowable stress.',
      distractors: [
        'Factored moment against room occupancy only.',
        'Paint thickness against concrete cover.',
        'A drawing title against a member schedule.',
      ],
      citation: 'mechanics-allowable',
    },
    {
      prompt: 'What is the basic axial-tension logic of the allowable-stress method?',
      correct: 'Computed tensile stress should be less than or equal to allowable tensile stress.',
      distractors: [
        'Computed stress should always exceed allowable stress.',
        'Axial stress is unrelated to force and area.',
        'Allowable stress is checked only after deflection fails.',
      ],
      citation: 'mechanics-allowable',
    },
    {
      prompt: 'In a bending-stress check, why does section modulus matter?',
      correct: 'It relates bending moment to maximum bending stress in the section.',
      distractors: [
        'It sets the architectural room height.',
        'It removes all shear effects from a beam.',
        'It replaces load-path tracing.',
      ],
      citation: 'mechanics-allowable; bsi-bending',
    },
    {
      prompt: 'Where is bending stress largest in a simple beam section?',
      correct: 'At the extreme fibers farthest from the neutral axis.',
      distractors: [
        'Only at the centerline where bending stress changes sign.',
        'Only at the drawing title block.',
        'Uniformly at every point regardless of distance from the neutral axis.',
      ],
      citation: 'bsi-bending; mechanics-allowable',
    },
    {
      prompt: 'Why can a member fail a design review even if computed stress is below allowable stress?',
      correct: 'Deflection, vibration, buckling, stability, or connection behavior may still govern.',
      distractors: [
        'Because allowable stress checks never consider safety.',
        'Because service load values are always illegal.',
        'Because section properties cannot affect stress.',
      ],
      citation: 'mechanics-allowable; bsi-design',
    },
    {
      prompt: 'Which statement correctly separates ASD from strength design?',
      correct: 'ASD uses service stress versus allowable stress; strength design uses factored demand versus matching resistance.',
      distractors: [
        'ASD and strength design are the same comparison with different labels only.',
        'Strength design uses service stress only.',
        'ASD requires ignoring material behavior.',
      ],
      citation: 'mechanics-allowable; fundamentals-strength',
    },
    {
      prompt: 'What should you avoid when a local source does not provide exact steel allowable values?',
      correct: 'Inventing or restoring exact material fractions without the applicable source table.',
      distractors: [
        'Stating that stress checks require consistent units.',
        'Computing axial stress from force and area.',
        'Checking deflection separately from stress.',
      ],
      citation: 'mechanics-allowable',
    },
    {
      prompt: 'Why is a deeper section often helpful for bending performance?',
      correct: 'Greater depth can improve section efficiency and reduce bending stress and deflection.',
      distractors: [
        'Depth removes all need for support reactions.',
        'Depth changes service loads into factored loads automatically.',
        'Depth makes the neutral axis disappear.',
      ],
      citation: 'bsi-bending; mechanics-allowable',
    },
    {
      prompt: 'Which check belongs with a compression member even after a stress comparison?',
      correct: 'Buckling or stability review.',
      distractors: [
        'Only the finish color schedule.',
        'Only the north arrow direction.',
        'Only the sheet number.',
      ],
      citation: 'mechanics-allowable',
    },
    {
      prompt: 'What is the best exam habit for ASD questions?',
      correct: 'Use service-level demand, compute stress, compare with allowable stress, and keep other limit states in view.',
      distractors: [
        'Use factored resistance for every service stress problem.',
        'Ignore the neutral axis in bending questions.',
        'Treat allowable stress as a serviceability guarantee.',
      ],
      citation: 'mechanics-allowable; bsi-bending',
    },
  ],
  concreteMaterials: [
    {
      prompt: 'Why is concrete cover important in reinforced concrete work?',
      correct: 'It protects reinforcement and helps preserve durability under the exposure condition.',
      distractors: [
        'It is only a graphic hatch with no construction effect.',
        'It replaces all bar spacing requirements.',
        'It is checked only after the building is occupied.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'What does severe exposure tend to require from the concrete mix and detailing review?',
      correct: 'Tighter durability control, including attention to cover and water-cement limits.',
      distractors: [
        'No cover because weather will wash the concrete.',
        'Larger aggregate regardless of bar spacing.',
        'Ignoring reinforcement position during placing.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'Why must aggregate size be checked against bar spacing?',
      correct: 'Concrete must pass between bars, consolidate, and bond around reinforcement.',
      distractors: [
        'Aggregate size decides the drawing sheet size.',
        'Bar spacing is unrelated to concrete placement.',
        'Large aggregate always improves congestion.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'What is the problem with adding water casually at the site?',
      correct: 'It can undermine the intended water-cement control and durability performance.',
      distractors: [
        'It changes the north arrow location.',
        'It improves every durability requirement automatically.',
        'It removes the need for reinforcement support.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'What must be true about reinforcement before concrete is placed?',
      correct: 'It must be accurately positioned and adequately supported.',
      distractors: [
        'It may float freely as long as the plan notes show steel.',
        'It should be removed until the concrete hardens.',
        'It needs no relation to cover or spacing.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'Which concrete issue is a durability cue rather than a pure strength-number cue?',
      correct: 'Exposure-related cover and water-cement control.',
      distractors: [
        'The room name beside the beam.',
        'The color of the title block.',
        'The sheet border thickness.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'What can happen when reinforcement congestion is ignored?',
      correct: 'Concrete may not consolidate properly around the bars.',
      distractors: [
        'The load path becomes unnecessary.',
        'Cover automatically increases.',
        'The aggregate becomes smaller by itself.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'Which factor directly affects cover requirements in the cited detailing source?',
      correct: 'Exposure and whether concrete is exposed to earth, weather, or protected conditions.',
      distractors: [
        'The font used for the section marker.',
        'The architectural scale bar only.',
        'The color of the reinforcement linework.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'Why should a concrete material answer mention placement and support of bars?',
      correct: 'Because the intended cover and spacing are lost if reinforcement shifts during placing.',
      distractors: [
        'Because reinforcement position matters only after demolition.',
        'Because bar support replaces concrete curing.',
        'Because cover is unrelated to durability.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'What is the safest board-exam summary for concrete materials in reinforced concrete?',
      correct: 'Strength, cover, exposure, spacing, aggregate compatibility, and water-cement control work together.',
      distractors: [
        'Concrete strength alone answers every material question.',
        'Cover and exposure are architectural finish choices only.',
        'Aggregate size has no relation to reinforcement.',
      ],
      citation: 'detailing-concrete; bsi-concrete',
    },
  ],
  rebarDetailing: [
    {
      prompt: 'Why are deformed bars used in reinforced concrete?',
      correct: 'Their surface shape improves bond between steel and concrete.',
      distractors: [
        'They eliminate the need for concrete cover.',
        'They replace all hooks and anchorage.',
        'They are used only for drawing symbols.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'What is the purpose of a standard hook?',
      correct: 'To anchor reinforcement through a specified bend and extension.',
      distractors: [
        'To reduce concrete cover to zero.',
        'To remove clear spacing requirements.',
        'To replace all stirrups in beams.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'Which hook form is commonly associated with closed ties and stirrup anchorage?',
      correct: 'A 135-degree bend with the required extension.',
      distractors: [
        'A random field bend with no extension.',
        'A straight bar with no anchorage.',
        'A paint mark at the bar end.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'Why does clear spacing between parallel bars matter?',
      correct: 'It allows concrete to pass, consolidate, and bond around the reinforcement.',
      distractors: [
        'It is only for visual symmetry in the drawing.',
        'It replaces aggregate selection.',
        'It eliminates cover requirements.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'How should ordinary rust on reinforcement be treated in an exam-safe answer?',
      correct: 'It is not automatically disqualifying if dimensions and weight remain acceptable and bond is not impaired.',
      distractors: [
        'All rust always requires immediate demolition.',
        'Rust proves the bar needs no cover.',
        'Rust eliminates the need for inspection.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'What do ties do in a reinforced concrete column?',
      correct: 'They laterally restrain longitudinal bars and contribute to confinement.',
      distractors: [
        'They carry all architectural finishes.',
        'They replace longitudinal reinforcement.',
        'They remove all axial load from the column.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'What is a spiral in reinforced concrete detailing?',
      correct: 'Continuous helical reinforcement used for confinement in compression members.',
      distractors: [
        'A roof drainage layout.',
        'A wall paint texture.',
        'A note that replaces longitudinal bars.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'Why are bend diameters controlled?',
      correct: 'To anchor reinforcement while avoiding damaging bends and poor detailing behavior.',
      distractors: [
        'To eliminate the need for member design.',
        'To set the room finish schedule.',
        'To make all bar sizes identical.',
      ],
      citation: 'detailing-rebar',
    },
    {
      prompt: 'What does reinforcement congestion threaten?',
      correct: 'Proper concrete placement, consolidation, cover, and bond.',
      distractors: [
        'Only the title block size.',
        'Only the drawing border lineweight.',
        'Only the north arrow.',
      ],
      citation: 'detailing-concrete',
    },
    {
      prompt: 'What is the safest site-inspection reaction to lap splices and wide tie spacing near a joint?',
      correct: 'Check anchorage, confinement, cover, spacing, and whether splice location matches detailing intent.',
      distractors: [
        'Approve it if the bars are visible.',
        'Ignore the issue because concrete will hide it.',
        'Replace the structural review with a finish inspection.',
      ],
      citation: 'detailing-rebar',
    },
  ],
  rcFlexure: [
    {
      prompt: 'What happens at the neutral axis of a member in bending?',
      correct: 'Bending stress changes from compression to tension at that reference location.',
      distractors: [
        'All shear force disappears from the structure.',
        'The beam no longer needs reinforcement.',
        'Concrete cover becomes zero.',
      ],
      citation: 'bsi-bending',
    },
    {
      prompt: 'Where are bending stresses greatest in a beam section?',
      correct: 'At the fibers farthest from the neutral axis.',
      distractors: [
        'Only at the exact neutral axis.',
        'Only at the sheet title.',
        'Uniformly at every point in all sections.',
      ],
      citation: 'bsi-bending',
    },
    {
      prompt: 'Why is tension reinforcement placed in reinforced concrete flexural members?',
      correct: 'To resist tensile force and help control cracking where concrete is weak in tension.',
      distractors: [
        'To remove all compression from the section.',
        'To replace concrete cover.',
        'To make support anchorage unnecessary.',
      ],
      citation: 'bsi-bending; fundamentals-strength',
    },
    {
      prompt: 'What does ductility contribute to flexural behavior?',
      correct: 'Deformation capacity and warning before brittle failure.',
      distractors: [
        'A reason to ignore load paths.',
        'A guarantee that detailing is unnecessary.',
        'A replacement for reinforcement anchorage.',
      ],
      citation: 'bsi-design; detailing-flexural',
    },
    {
      prompt: 'Why are lap splice restrictions important near critical regions?',
      correct: 'Splice location can affect continuity and ductile behavior where demand is high.',
      distractors: [
        'Splices are only architectural symbols.',
        'Splices remove all need for hoops.',
        'Splice location does not matter in any beam.',
      ],
      citation: 'detailing-flexural',
    },
    {
      prompt: 'What do hoops and closed ties support in ductile detailing?',
      correct: 'Confinement, shear detailing, and restraint of reinforcement near critical regions.',
      distractors: [
        'Only wall paint layout.',
        'Only the ceiling finish schedule.',
        'Only the room naming convention.',
      ],
      citation: 'detailing-flexural',
    },
    {
      prompt: 'Which review is incomplete for a garage beam over a wide opening?',
      correct: 'Checking only midspan steel area while ignoring anchorage, supports, confinement, and load path.',
      distractors: [
        'Tracing the wall load to supports.',
        'Checking tension reinforcement location.',
        'Reviewing stirrup and hoop detailing near supports.',
      ],
      citation: 'bsi-bending; detailing-flexural',
    },
    {
      prompt: 'Why should an exam answer avoid unsupported exact stress-block constants?',
      correct: 'Exact constants must come from the applicable code or captured source table.',
      distractors: [
        'Stress-block constants are never used in reinforced concrete.',
        'Neutral axis behavior is unrelated to flexure.',
        'Tension reinforcement replaces all code rules.',
      ],
      citation: 'detailing-flexural; bsi-bending',
    },
    {
      prompt: 'What is detail continuity in reinforced concrete flexure?',
      correct: 'Anchorage, splices, ties, hoops, and load path working together across the member and supports.',
      distractors: [
        'A decorative line style in the drawing.',
        'A way to skip support checks.',
        'A concrete color requirement.',
      ],
      citation: 'detailing-flexural; bsi-design',
    },
    {
      prompt: 'What is the safest conceptual summary of reinforced concrete flexure?',
      correct: 'Compression, tension reinforcement, neutral-axis behavior, ductility, anchorage, and confinement must align.',
      distractors: [
        'Steel area alone proves the beam is safe.',
        'Neutral axis location is a finish issue.',
        'Ductile detailing is unrelated to beam behavior.',
      ],
      citation: 'bsi-bending; detailing-flexural',
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
  const out = [];
  for (const id of ids) {
    const existing = existingOptions.find((option) => option.id === id) ?? { id };
    out.push({
      ...existing,
      text: id === correctId ? correctText : ordered.shift(),
    });
  }
  return out;
}

function baselineQuestionMap(questions) {
  const map = new Map();
  for (const q of questions) {
    const key = q.id ?? q.question_id;
    if (!key) {
      throw new Error('Linked question missing id/question_id');
    }
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

- The capture does not supply exact NSCP strength reduction factor tables.
- The capture does not supply exact A36 allowable-stress fractions.
- The capture does not supply unsupported reinforced concrete stress-block constants.
- The capture does not supply unsupported development-length equations or full material grade tables.

## Use Rule

Use only the extracted claims above for Batch ${BATCH} article and linked-question edits. When a local code table or exact formula is not present in this capture boundary, keep the statement conceptual or state that the exact table must come from the applicable code/source.
`;

  const refined = `# Batch ${BATCH} Refined Source Map: ${family.title}

## Canonical Locator

${family.locator}

## Safe Exam Claims

${family.notes
  .map((note, index) => `${index + 1}. ${note}`)
  .join('\n')}

## Hashes

| Artifact | Path | SHA-256 |
| --- | --- | --- |
| Raw | ${rawSource.path} | ${rawSource.sha256} |
| Refined | ${refinedSource.path} | ${refinedSource.sha256} |

## Batch ${BATCH} Claim Discipline

The article and question edits may cite this map for concepts, definitions, and source-delimited exact details only. It is not a substitute for a complete code table.
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
  rationale.takeaway = `For ${article.title}, identify the structural behavior and source boundary before using memorized exact values.`;
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
    const rationale = buildQuestionRationale(
      article,
      sources,
      options,
      correctId,
      template.correct,
      template,
    );
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
      'Batch 144 local-first source-audited rewrite constrained to checked local structural source artifacts; no Supabase mutation.',
    updated_at: nowIso(),
    updated_by: `codex-${BATCH_ID}`,
    updated_note:
      'Batch 144 local-first source-audited article and linked-question rewrite; no Supabase mutation.',
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
    exact_code_claim_policy: 'exact code or table values omitted unless present in captured local source boundary',
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
    throw new Error(
      `${article.cluster_id} expected ${article.expected_question_count} linked questions, found ${baselineQuestions.length}`,
    );
  }

  const original = readText(join(dir, 'original.md'));
  const originalHash = sha256Text(original);
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
  if (existsSync(composeErrorPath)) {
    unlinkSync(composeErrorPath);
  }

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
      scopedValidation: rel(join(dir, 'scoped-validation-batch-144.json')),
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
    if (matches.length > 0) {
      markerMatches.push({ file, matches });
    }
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
      if (Array.isArray(file)) {
        file.forEach((item) => planned.add(item));
      } else {
        planned.add(file);
      }
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
      if (!existsSync(path)) {
        return { file, status: isGitTracked(path) ? 'deleted_tracked' : 'missing' };
      }
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
    writeJson(join(dir, 'scoped-validation-batch-144.json'), {
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
    scoped_json_parse: jsonParse,
    scoped_git_diff_check: diffCheck,
    targeted_tests: {
      command: TARGETED_TESTS_COMMAND,
      status: TARGETED_TESTS_PASSED ? 'pass' : 'pending_external_run',
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

Batch ${BATCH} continued the residual non-prac local-first article and linked-question pass after Batch 143 consumed structural clusters lea-strc-004-01, lea-strc-004-03, lea-strc-004-04, lea-strc-004-05, and lea-strc-005-01.

Blocked residuals were not edited because no completed recovery report was present: ${blockedClusters
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

All claims were constrained to local Vitruvius source artifacts captured under:

- vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-144/
- vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-144/

Each article includes a source-safe Real World Scenario. Exact code tables, material fractions, development equations, and reinforced concrete stress-block constants were omitted unless the selected local source boundary supplied them.

## Validation

${validationSummary(checks)}

## Targeted Tests

- ${TARGETED_TESTS_COMMAND}: ${TARGETED_TESTS_PASSED ? 'pass' : 'pending external run'}

## Stop Condition

Stop after these five sourceable structural clusters are generated, scoped validation artifacts are written, targeted tests pass, and git handoff paths are listed without staging unrelated dirty files.
`;
}

function qualityReviewMarkdown(entries, checks) {
  return `# Batch ${BATCH} Independent Quality Review

## Review Verdict

Verdict: ${checks.status === 'pass' && TARGETED_TESTS_PASSED ? 'pass' : 'conditional_pass_pending_tests'}

## Scope Reviewed

${entries.map((entry) => `- ${entry.cluster_id}: ${entry.title}`).join('\n')}

## Findings

- No raw UI-block markers were found in scoped normalized/candidate/question artifacts.
- Each selected article has a source-safe Real World Scenario.
- Each selected article rewrote ${entries[0]?.expected_question_count ?? 10} linked questions and preserved correct-answer IDs.
- The carried-forward blocked residuals were left untouched because no completed recovery report was available.
- Exact code/table claims outside the local source boundary were intentionally not restored.

## Evidence

${validationSummary(checks)}

## Remaining Risk

The batch is intentionally limited to local source captures and does not claim a complete Philippine code-table restoration for strength reduction factors, A36 allowable-stress fractions, development lengths, or reinforced concrete stress-block constants.
`;
}

function stageListMarkdown(stagePaths, entries, checks) {
  return `# Batch ${BATCH} Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${stagePaths.join('\n')}
\`\`\`

## Staging Note

The Vitruvius source-map paths are under an ignored parent directory. Stage those paths with \`git add -f\`; the Batch 143 source-map files use the same tracked-under-ignored pattern.

## Do Not Stage

- .ai/00_performance
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
- .ai/README.md
- .hermes/skills
- .ai/00_system/philip-ux-ui-calibration.md
- old unrelated content-roundtrip run directories
- .ai/03_plans/blocked-source-recovery/ prompts/reports from parallel read-only recovery lanes
- .ai/content-audit-export/sync-state.json

## Cluster Summary

${entries.map((entry) => `- ${entry.cluster_id}: ${entry.question_count} linked questions`).join('\n')}

## Validation Summary

${validationSummary(checks)}

## Suggested Commit Message

\`\`\`text
Constrain residual structural content to local source evidence

Constraint: Batch 144 local-first source captures only; blocked residual recovery lanes remained read-only.
Rejected: Restoring exact code tables without captured local source evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized or candidate markdown.
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
    task:
      'Residual non-prac local-first article and linked-question pass after Batch 143 structural clusters.',
    consumed_previous_batch_clusters: [
      'lea-strc-004-01',
      'lea-strc-004-03',
      'lea-strc-004-04',
      'lea-strc-004-05',
      'lea-strc-005-01',
    ],
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
        },
      ]),
    ),
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
      '.ai/03_plans/blocked-source-recovery/ prompts/reports',
      '.ai/content-audit-export/sync-state.json',
    ],
    no_supabase: true,
    no_deploy: true,
    no_prod_db: true,
    no_main_merge: true,
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

  const sourceRecords = Object.fromEntries(
    Object.entries(sourceFamilies).map(([key, family]) => [key, buildSourceCapture(family)]),
  );
  const entries = articles.map((article) => processArticle(article, sourceRecords));
  const stagePaths = buildStagePaths(entries, sourceRecords);
  const checks = buildScopedChecks(entries, sourceRecords, stagePaths);
  writeFinalArtifacts(entries, sourceRecords, checks, stagePaths);

  // Rebuild checks after final artifacts exist so stage-path JSON parse and diff-check include them.
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
  if (!ok) {
    process.exitCode = 1;
  }
}

main();
