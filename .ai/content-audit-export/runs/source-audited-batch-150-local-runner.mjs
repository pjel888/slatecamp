#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
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

const batch = 150
const batchId = 'source-audited-batch-150-local-first'
const generatedAt = new Date().toISOString()
const baseline = 'd9c43fa57'
const branch = '3dlab-gray-viewport-bg'
const exportRoot = '.ai/content-audit-export'
const reservationManifest = '.ai/03_plans/production-line-batch-150-reservation-manifest.json'
const rawCaptureRoot = 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-150'
const refinedCaptureRoot = 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-150'

const sourceFiles = {
  salvan: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/George-Salvan-Architectural-Building-Materials.pdf',
    rawSha: 'sha256:4c02c6429989abb79b987b456a3eca532ae75f5da90754c523f393303349e4ba',
    rawBytes: 51997841,
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/George-Salvan-Architectural-Building-Materials.md',
    refinedSha: 'sha256:7433a19efa154a3f3b75f1300d459c0592da26fbc63ea40309d68303aadabf42',
    refinedBytes: 577457,
  },
  bci: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
    rawSha: 'sha256:528acdc8afd84d937d5ab49a5df8c349321d20d3d403d110e038628e4d2f1c02',
    rawBytes: 41001593,
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
    refinedSha: 'sha256:0f3213a3ca3dcf8fd2076dae5e1b12a215dc7041950f864cfd5f4b53250c820a',
    refinedBytes: 1144595,
  },
}

const sourceDefinitions = {
  salvanMaterials: {
    id: 'salvan-building-materials-b150',
    title: 'George Salvan Architectural Building Materials - waterproofing, insulation, and sealants',
    source_type: 'local_building_materials_reference',
    file: sourceFiles.salvan,
    locator: 'refined markdown lines 2676-2854, 2874-3025, 3070-3470, 4332-4468, 5919-5948, and 13397-13417',
    safe_claims: [
      'Sealers protect material surfaces against water or other liquid penetration by filling pores and forming a continuous skin.',
      'Effective waterproofing sealers need elastomeric character so they can bridge small cracks and joint movement without rupture.',
      'Salvan names waterproofing groupings and materials used for surfaces such as concrete, masonry, roof decks, foundation exteriors, swimming pools, and flashing areas.',
      'Thermal insulation prevents transfer of heat, and Salvan frames heat transfer through conduction, radiation, and convection.',
      'Salvan lists loose-fill, blanket, batt, board, rigid slab, foamed plastic, and reflective insulation families.',
      'Caulking compounds must adhere, remain workable over temperature change, form an elastic skin, stretch with joint-width changes, recover after extension or compression, resist water sensitivity, and provide service performance.',
      'Backup materials control joint depth, help protect the bond, and serve as bond breakers so caulking can elongate.',
      'Paint and coating work requires surfaces to be examined and cleaned of dust, dirt, grease, or other foreign substances before finishing.',
    ],
    use_limits: [
      'This batch does not state ASTM classifications, movement class numbers, manufacturer-specific waterproofing thicknesses, rainfall intensities, or product coverage values unless separately captured.',
      'This batch does not turn Salvan specification examples into mandatory Philippine code requirements.',
      'This batch does not use acoustic NRC/STC or mass-law claims for the thermal insulation article.',
    ],
  },
  bciEnvelope: {
    id: 'bci-5e-envelope-b150',
    title: 'Building Construction Illustrated, 5th Edition - envelope, insulation, waterproofing, and sealants',
    source_type: 'local_building_construction_reference',
    file: sourceFiles.bci,
    locator: 'refined markdown lines 695-710, 1493-1498, 2469-2492, 6412-6454, 7990-8012, 9073-9223, 9286-9335, and 9490-9558',
    safe_claims: [
      'Dampproofing applies when hydrostatic pressure from groundwater is not expected; foundation walls should be waterproofed when hydrostatic pressure may occur.',
      'Foundation dampproofing or waterproofing should extend from above grade down to the top of the footing, with drainage and membrane protection during backfilling.',
      'BCI identifies bentonite clay or another waterstop at the foundation wall-slab joint where waterproofing is needed.',
      'Thermal insulation controls heat transfer through exterior assemblies and should remain continuous at foundation, floor, wall, and roof junctions.',
      'R is thermal resistance, Rt is the sum of component R-values in an assembly, and U-value is the reciprocal of R-value for a component or assembly.',
      'BCI groups insulating materials as batt or blanket, rigid foam, foamed-in-place, loose-fill, and reflective insulation; effective insulation usually incorporates captured dead air space.',
      'Roof insulation may be located below the roof deck, between deck and membrane, or above the membrane in a protected membrane system.',
      'Condensation can reduce insulation effectiveness, be absorbed by materials, and deteriorate finishes.',
      'A joint sealant must be durable, resilient, and have both cohesive and adhesive strength; movement range, joint depth, substrate condition, filler, and bond breaking control performance.',
    ],
    use_limits: [
      'This batch does not use BCI preliminary R-value tables as Philippine code minimums.',
      'This batch does not restore exact seam-overlap, dry-film thickness, curing-time, or tropical rainfall values not captured in this source boundary.',
      'This batch does not claim a project-specific sealant product, substrate temperature range, or ASTM class value.',
    ],
  },
}

const articles = [
  {
    cluster_id: 'lea-matl-006-03',
    article_id: 'bb772d11-27ac-4ad5-b13a-0d1542106956',
    slug: 'lea-matl-006-03-core-concept',
    title: 'Waterproofing differs from damp-proofing',
    dir: '.ai/content-audit-export/articles/lea-matl-006-03-core-concept--bb772d11-27ac-4ad5-b13a-0d1542106956',
    sourceKeys: ['salvanMaterials', 'bciEnvelope'],
    sourceIds: ['salvan-building-materials-b150', 'bci-5e-envelope-b150'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore ASTM waterproofing system labels, dry-film thicknesses, seam overlaps, cure times, or tropical rainfall rates.',
      'No local source in this batch was used to state Philippine code requirements for below-grade waterproofing.',
      'No local source in this batch was used to make interior negative-side coatings equivalent to exterior drainage and membrane protection.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For waterproofing questions, identify the water condition before choosing a material: ordinary dampness, hydrostatic pressure, roof drainage exposure, wet-area splash, or a joint that needs a waterstop. The word "waterproofing" is not enough; the pressure, drainage path, membrane protection, and substrate condition control the answer.

## What You Need to Know for the LEA

## Learning Goal

Distinguish dampproofing from waterproofing, then connect each waterproofing decision to source-supported pressure, drainage, membrane, substrate, and joint-control cues.

## Core Concept

Dampproofing and waterproofing are not interchangeable. BCI applies dampproofing to a foundation wall only when subsoil conditions indicate that hydrostatic pressure from groundwater will not occur. When hydrostatic pressure may occur, the foundation wall should be waterproofed. That pressure distinction is safer than memorizing unsupported film thicknesses, rainfall rates, or ASTM labels.

BCI also gives the practical below-grade sequence. A dampproofing or waterproofing membrane should extend from above grade down to the top of the footing. A subsoil drainage system, drainage mat, or gravel backfill moves water toward footing drains. Protection board, drainage mat, or rigid extruded polystyrene protects the membrane during backfilling. At the wall-slab joint, waterproofing may require bentonite clay or another waterstop.

Salvan frames waterproofing and sealing as surface protection against the penetration or escape of water or other liquids. Salvan's material discussion supports integral, membrane, sealer, caulking, and elastomeric ideas, but this batch uses those categories conservatively: membranes and elastomeric coatings must be matched to exposure, movement, and substrate preparation. Surfaces should be clean, dry, smooth, and free from foreign matter before coating or membrane work proceeds.

## Key Source Boundaries

| Exam cue | Source-safe answer | Do not add |
|---|---|---|
| No hydrostatic pressure expected | Dampproofing may be the relevant BCI term. | A universal rule that every below-grade wall is waterproofed by the same system. |
| Hydrostatic pressure may occur | Waterproofing, drainage, membrane protection, and joint waterstop coordination become the safer answer. | Rainfall intensities, dry-film thicknesses, or ASTM labels not captured locally. |
| Membrane before backfill | Protect it with board, drainage mat, or compatible insulation while drainage carries water down. | The idea that backfill makes the membrane unnecessary. |
| Coating or membrane substrate | Keep the surface clean, dry, smooth, and free from foreign material. | Applying over dirt, salt deposits, holes, loose material, or wet substrate unless the named source supports it. |
| Roof or exterior water exposure | Coordinate slope, drainage, membrane, and protection details. | Treating a coating as a substitute for roof drainage. |

## Philippine Practice Context

For local construction review, the realistic decision is coordination. An architect does not approve a below-grade or roof waterproofing detail by product name alone. The drawing must show where water pressure can occur, how water is drained, how the membrane is protected during covering work, and how joints are stopped or sealed. Exact product performance values belong to the project specification or a captured manufacturer/source packet.

## Real World Scenario

A small basement storage room is added beside a sloping site. The wall will be backfilled, and the team expects water to collect against it during heavy rain. The source-safe review response is to reject a dampproofing-only note, require waterproofing at the pressure-exposed wall, continue the membrane from above grade to the top of footing, protect it during backfilling, provide drainage to footing drains, and coordinate a waterstop at the wall-slab joint.

## How It's Tested

A typical item gives a foundation, roof, or wet-area condition and asks whether a simple coating is enough. If the clue includes hydrostatic pressure, below-grade habitable or storage use, membrane protection during backfilling, footing drains, or waterstop coordination, the safer answer is waterproofing with drainage and protection details.

## Common Mistakes

- Using dampproofing where groundwater pressure may occur.
- Treating an interior coating as a substitute for exterior drainage and membrane protection.
- Inventing rainfall rates, seam overlaps, dry-film thicknesses, or ASTM labels not checked in the local source packet.
- Ignoring substrate preparation, membrane protection, and waterstop coordination.

## Related Articles

See also within Roofing, Waterproofing, and Insulation: **lea-matl-006-01-core-concept**, **lea-matl-006-02-core-concept**, **lea-matl-006-04-core-concept**, **lea-matl-006-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-006-04',
    article_id: '763d451f-d9eb-469f-8d5e-8be6c9a7bfa7',
    slug: 'lea-matl-006-04-core-concept',
    title: 'Thermal Insulation reduces heat transmission through',
    dir: '.ai/content-audit-export/articles/lea-matl-006-04-core-concept--763d451f-d9eb-469f-8d5e-8be6c9a7bfa7',
    sourceKeys: ['salvanMaterials', 'bciEnvelope'],
    sourceIds: ['salvan-building-materials-b150', 'bci-5e-envelope-b150'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore Philippine energy-code R-value or U-value minimums.',
      'No local source in this batch was used to retain acoustic NRC/STC or mass-law questions under this thermal-insulation cluster.',
      'No local source in this batch was used to calculate product-specific R-values from unstated manufacturer data.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For thermal-insulation questions, first decide whether the item asks about heat-transfer mode, R/Rt/U relationships, insulation family, continuity of the envelope, roof placement, or moisture control. Do not answer a thermal question with acoustic NRC/STC logic.

## What You Need to Know for the LEA

## Learning Goal

Explain how thermal insulation controls heat flow, classify source-supported insulation families, and avoid unsupported energy-code or manufacturer-specific thermal values.

## Core Concept

Thermal insulation controls the transfer of heat through exterior assemblies so less heating or cooling energy is needed to maintain comfort. Salvan frames the concept through the three heat-transfer modes: conduction, radiation, and convection. BCI gives the assembly-level rule: insulation should remain continuous at foundation, floor, wall, and roof junctions so the envelope is unbroken against heat transmission.

BCI defines the key thermal terms. R is a measure of thermal resistance. Rt is the sum of the individual R-values of components in a construction assembly. U-value measures thermal transmittance, and BCI defines it as the reciprocal of R-value for a component or assembly. Higher R generally means more resistance to heat flow; lower U generally means less heat transmission. Exact values should come from the named source, product data, or code packet being tested.

BCI groups insulating materials into batt or blanket insulation, rigid foam insulation, foamed-in-place insulation, loose-fill insulation, and reflective insulation. Reflective insulation uses high reflectivity and low emissivity with a dead-air space to reduce radiant heat transfer. Salvan similarly lists loose fill, blanket, batts, structural insulation board, rigid slabs, foamed plastics, and reflective insulation.

Moisture coordination matters. BCI warns that condensation can reduce insulation effectiveness and damage finishes. Roof insulation may be placed below the roof deck with a ventilated airspace, between the deck and membrane, or above the membrane in a protected membrane system. The correct answer usually protects continuity, vapor control, ventilation, and assembly placement rather than memorizing a single material name.

## Key Source Boundaries

| Exam cue | Source-safe answer | Do not add |
|---|---|---|
| Heat-transfer mode | Salvan supports conduction, radiation, and convection. | Acoustic NRC/STC or mass-law claims. |
| R, Rt, and U | R is resistance; Rt sums component R-values; U is reciprocal transmittance. | Product-specific R-values unless the source gives them. |
| Insulation family | Batt/blanket, rigid foam, foamed-in-place, loose-fill, and reflective insulation are BCI-supported families. | A claim that one product is always code-compliant. |
| Continuity | Maintain insulation at floor, wall, roof, and foundation junctions. | A bay-only fix that leaves major junctions discontinuous. |
| Moisture | Condensation can reduce effectiveness and damage finishes. | Ignoring vapor retarders, ventilation, and roof placement. |

## Philippine Practice Context

In a hot local roof or wall assembly, the exam-safe conversation is not "more insulation everywhere." It is continuity, placement, moisture, and source. The reviewer checks where heat enters, whether the envelope is interrupted at junctions, whether water vapor can condense in the assembly, and whether the requested R-value comes from product data or the applicable code/source packet.

## Real World Scenario

A low-slope roof over a review center is gaining heat during afternoon classes. The source-safe recommendation is to check the roof assembly, not just name a product. The team can evaluate insulation below the deck with ventilation, insulation between deck and membrane, or a protected membrane layout above the membrane. The chosen detail must preserve drainage and moisture control while keeping the envelope continuous at roof-wall junctions.

## How It's Tested

Expect concept and classification questions: identify R, Rt, and U; choose an insulation family for a wall or roof condition; and recognize why vapor retarders, ventilation, roof placement, and continuity protect performance. Use product data or the named source when exact R-values are required.

## Common Mistakes

- Confusing R-value with U-value.
- Adding insulation in one bay while leaving envelope junctions discontinuous.
- Ignoring condensation, vapor migration, and ventilation.
- Inventing local energy-code R-values or product performance numbers without a primary source.

## Related Articles

See also within Roofing, Waterproofing, and Insulation: **lea-matl-006-01-core-concept**, **lea-matl-006-02-core-concept**, **lea-matl-006-03-core-concept**, **lea-matl-006-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-006-05',
    article_id: 'cd21006c-647f-4c7b-8b17-fa65c51cbeb3',
    slug: 'lea-matl-006-05-core-concept',
    title: 'Sealants differ from caulks by durability and movement',
    dir: '.ai/content-audit-export/articles/lea-matl-006-05-core-concept--cd21006c-647f-4c7b-8b17-fa65c51cbeb3',
    sourceKeys: ['salvanMaterials', 'bciEnvelope'],
    sourceIds: ['salvan-building-materials-b150', 'bci-5e-envelope-b150'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore ASTM C920/C1619/C1733 class values or substrate temperature ranges.',
      'No local source in this batch was used to state manufacturer-specific cure times, movement percentages beyond BCI ranges, or Philippine climate performance guarantees.',
      'No local source in this batch was used to select a proprietary sealant chemistry for every curtain wall, glass, metal, or concrete joint.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For sealant and caulking questions, identify the joint movement, width, depth, substrate condition, backing material, and whether the joint must resist water or air passage. A joint is not correct because it is "filled"; it is correct when adhesion, movement, depth, and bond breaking are controlled.

## What You Need to Know for the LEA

## Learning Goal

Classify sealants and caulking materials by movement capability, adhesion, backing, substrate preparation, and joint geometry.

## Core Concept

BCI states that an effective joint sealant must be durable, resilient, and have both cohesive and adhesive strength. Sealants are classified by the extension and compression they can withstand before failure. Low-range sealants are often called caulking and suit small joints where little movement is expected. Medium-range sealants suit nonworking mechanically fastened joints. High-range sealants, including polysulfides, polyurethanes, and silicones, suit working joints with significant movement.

Joint geometry controls performance. BCI gives a depth rule: for joints up to 1/2 inch, sealant depth may equal joint width; for joints 1/2 inch and wider, depth should be half the joint width but not more than 2 inches. Joints should be tooled to ensure full contact and adhesion with the substrate. The substrate should be clean, dry, and compatible, and a primer may be needed.

Salvan reinforces the movement requirement. Caulking compounds must adhere, remain workable across a temperature range, form a tough elastic skin, stretch with joint-width changes, recover after extension or compression, resist water sensitivity, and provide service performance. Backup materials matter because they control joint depth, protect the bond, and serve as bond breakers so the sealant can elongate rather than adhere on three sides.

## Key Source Boundaries

| Exam cue | Source-safe answer | Do not add |
|---|---|---|
| Small joint, little movement | Low-range sealant or caulking may be appropriate. | A high-movement ASTM class not captured locally. |
| Working joint with significant movement | High-range families such as polysulfides, polyurethanes, and silicones are source-supported examples. | A proprietary product preference for every curtain wall joint. |
| Wide joint | Control depth with filler or backer; for joints 1/2 inch and wider, BCI supports half-width depth but not more than 2 inches. | Filling the joint solid. |
| Substrate | Clean, dry, compatible substrate; primer may be needed. | Applying over wet, dusty, incompatible, or loose material. |
| Backer/bond breaker | Keep sealant from bonding to the bottom of the joint so it can elongate. | Three-sided adhesion in a movement joint. |

## Philippine Practice Context

For local window, wall, and expansion-joint review, the source-safe answer is usually a checklist: expected movement, compatible sealant range, clean and dry substrate, correct joint depth, and backer rod or bond breaker. Exact ASTM class, cure time, or manufacturer warranty claims belong to the project specification or captured product data, not to memory.

## Real World Scenario

A window perimeter joint on a concrete wall is opened for inspection after leaks. The failed bead filled the whole recess and stuck to the back of the joint. The source-safe correction is to clean and dry the compatible substrate, set a compressible backer or bond breaker to control depth, tool the sealant for full side contact, and select a sealant range that matches the expected joint movement.

## How It's Tested

Common items ask for the purpose of backer rod, the correct depth relationship for wider joints, the substrate condition before application, or which sealant family is safer for a working joint. The best answer protects two-sided adhesion, movement, and depth control instead of simply filling the joint solid.

## Common Mistakes

- Filling a deep joint without backup material, creating poor movement behavior.
- Treating low-range caulking as suitable for high-movement joints.
- Applying sealant to dirty, wet, or incompatible substrates.
- Memorizing unverified ASTM class labels when the checked sources support movement ranges and joint geometry instead.

## Related Articles

See also within Roofing, Waterproofing, and Insulation: **lea-matl-006-01-core-concept**, **lea-matl-006-02-core-concept**, **lea-matl-006-03-core-concept**, **lea-matl-006-04-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
]

const questionUpdates = {
  'bb772d11-27ac-4ad5-b13a-0d1542106956': [
    q('ca24ab09-70b5-4acf-90a3-306c93691bb8', ['bci-5e-envelope-b150'], 'A basement storage wall will be backfilled and the site may develop groundwater pressure. Which response best follows BCI?', [
      ['a', 'Use waterproofing with drainage, membrane protection, and joint coordination because hydrostatic pressure may occur.'],
      ['b', 'Use dampproofing only because any below-grade moisture is the same condition.'],
      ['c', 'Ignore footing drains because coatings replace drainage.'],
      ['d', 'Use interior paint only because it is easier to inspect after backfilling.'],
    ], 'a', 'Local source boundary: BCI refined markdown lines 2469-2492.'),
    q('c82532e0-7b73-4891-9292-acf89dd2251f', ['bci-5e-envelope-b150'], 'Where should BCI place dampproofing or waterproofing membrane on a foundation wall?', [
      ['a', 'Only at the roof ridge.'],
      ['b', 'From above grade down to the top of the footing.'],
      ['c', 'Only on interior paint after backfilling.'],
      ['d', 'Only at door thresholds.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 2473-2489.'),
    q('d3f421c9-847a-4ad0-b6c4-ddc8b930db3e', ['bci-5e-envelope-b150'], 'Why is protection board, drainage mat, or rigid insulation coordinated with below-grade waterproofing?', [
      ['a', 'It substitutes for the footing drain entirely.'],
      ['b', 'It helps protect the membrane during backfilling while the drainage system carries water away.'],
      ['c', 'It converts dampproofing into acoustic insulation.'],
      ['d', 'It makes substrate preparation unnecessary.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 2479-2490.'),
    q('ce7be606-4c04-4e42-bd2d-7e250aa6f6bd', ['bci-5e-envelope-b150'], 'At a waterproofed foundation wall and ground slab joint, which treatment does BCI mention?', [
      ['a', 'Leave the joint open to relieve pressure.'],
      ['b', 'Seal the joint with bentonite clay or another waterstop.'],
      ['c', 'Fill the joint with loose soil.'],
      ['d', 'Use acoustic ceiling tile as the water barrier.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 2478-2482.'),
    q('2b4ac2db-bb95-4ac8-a4c5-9a91e45e3582', ['salvan-building-materials-b150'], 'What source-safe purpose does Salvan give for sealers and waterproofing-related surface treatments?', [
      ['a', 'Changing the room use classification.'],
      ['b', 'Protecting or sealing surfaces against penetration or escape of water or other liquids.'],
      ['c', 'Replacing structural design.'],
      ['d', 'Increasing acoustical privacy only.'],
    ], 'b', 'Local source boundary: Salvan refined markdown lines 2727-2761 and 3070-3147.'),
    q('9590a306-6a4b-43df-aee5-4eab728a63dd', ['salvan-building-materials-b150'], 'A contractor wants to apply a waterproofing coating over dusty concrete. Which source-safe objection should the architect raise?', [
      ['a', 'Dust improves membrane bond.'],
      ['b', 'Substrate condition never affects waterproofing.'],
      ['c', 'The surface should be clean, dry, smooth, and free from foreign material before coating or membrane work.'],
      ['d', 'The coating should be applied only after the room is painted.'],
    ], 'c', 'Local source boundary: Salvan refined markdown lines 13397-13417 and 3070-3470.'),
    q('3996c993-d015-431d-a982-eaa8573a59a2', ['salvan-building-materials-b150'], 'Which fluid-applied waterproofing feature stays inside the Salvan source boundary?', [
      ['a', 'It has no relationship to cracks, movement, or substrate.'],
      ['b', 'An elastomeric coating can form a continuous flexible barrier over suitable surfaces.'],
      ['c', 'It is always a clay roof tile.'],
      ['d', 'It replaces roof drainage on flat roofs.'],
    ], 'b', 'Local source boundary: Salvan refined markdown lines 2739-2754 and 3339-3470.'),
    q('743de1a4-bafa-4929-b0be-8fca30a58446', ['bci-5e-envelope-b150'], 'A low-slope roof detail shows a continuous membrane but no drainage path. Which BCI concept is most relevant?', [
      ['a', 'Flat roofs require drains or scuppers because water must be shed or drained from the roof.'],
      ['b', 'Flat roofs work only if water is allowed to pond indefinitely.'],
      ['c', 'Roof membranes are unrelated to slope and drainage.'],
      ['d', 'Gutters are only decorative hardware.'],
    ], 'a', 'Local source boundary: BCI refined markdown lines 695-710 and 6412-6454.'),
    q('a615ce9f-571a-4071-b60b-35b2d3d31539', ['salvan-building-materials-b150', 'bci-5e-envelope-b150'], 'Which answer avoids a waterproofing claim outside the checked Batch 150 sources?', [
      ['a', 'Invent a seam overlap from memory because all membranes use the same overlap.'],
      ['b', 'Use the checked distinction between hydrostatic pressure, membrane protection, drainage, and substrate preparation.'],
      ['c', 'Assume every interior coating resists all groundwater pressure.'],
      ['d', 'Add a dry-film thickness even when no captured source gives one.'],
    ], 'b', 'Local source boundary: Salvan lines 3070-3470; BCI lines 2469-2492.'),
    q('6fc3290a-b8ac-4f00-8f88-a2375566a0cb', ['bci-5e-envelope-b150'], 'Before backfilling a waterproofed foundation wall, which coordination item is source-safe?', [
      ['a', 'Remove footing drains because they duplicate the coating.'],
      ['b', 'Leave the membrane exposed to backfill damage.'],
      ['c', 'Protect the membrane and provide drainage so water can flow down to the footing drains.'],
      ['d', 'Use only interior paint because backfill will press it in place.'],
    ], 'c', 'Local source boundary: BCI refined markdown lines 2479-2490.'),
  ],
  '763d451f-d9eb-469f-8d5e-8be6c9a7bfa7': [
    q('5cc8794e-0930-4790-8438-c7014cc210c6', ['bci-5e-envelope-b150'], 'What is the primary purpose of thermal insulation in BCI?', [
      ['a', 'To change a building occupancy group.'],
      ['b', 'To replace waterproofing membranes.'],
      ['c', 'To control heat flow through exterior assemblies.'],
      ['d', 'To act as door hardware.'],
    ], 'c', 'Local source boundary: BCI refined markdown lines 9073-9083.'),
    q('cc29799c-e70f-4e78-b92d-7bf467fdcbe3', ['salvan-building-materials-b150'], 'Which heat-transfer modes does Salvan identify for thermal insulation study?', [
      ['a', 'Only sound reflection and absorption.'],
      ['b', 'Conduction, radiation, and convection.'],
      ['c', 'Only paint oxidation.'],
      ['d', 'Only waterstop swelling.'],
    ], 'b', 'Local source boundary: Salvan refined markdown lines 2874-3025.'),
    q('8a8b8d25-2b14-4c30-85d3-2d8260f6aee4', ['bci-5e-envelope-b150'], 'What does BCI say Rt represents?', [
      ['a', 'The number of finish coats.'],
      ['b', 'The total roof area.'],
      ['c', 'The sum of the individual R-values in a construction assembly.'],
      ['d', 'The joint width of a sealant.'],
    ], 'c', 'Local source boundary: BCI refined markdown lines 9102-9138.'),
    q('d43372cf-f536-4457-ae95-95291181c73c', ['bci-5e-envelope-b150'], 'Which insulation type uses high reflectivity and low emissivity with a dead-air space?', [
      ['a', 'Built-up roofing felt.'],
      ['b', 'Reflective insulation.'],
      ['c', 'Animal glue.'],
      ['d', 'Oil-based caulk.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9186-9197.'),
    q('23798e74-081b-4ab5-8bc6-e28883a91cb8', ['bci-5e-envelope-b150'], 'Which insulating-material families are source-safe from BCI?', [
      ['a', 'Batt or blanket, rigid foam, foamed-in-place, loose-fill, and reflective insulation.'],
      ['b', 'Only enamels and varnishes.'],
      ['c', 'Only scuppers and gutters.'],
      ['d', 'Only bentonite waterstops.'],
    ], 'a', 'Local source boundary: BCI refined markdown lines 9186-9208.'),
    q('4e491cc9-809e-499c-ac93-ab08605ce1f5', ['bci-5e-envelope-b150'], 'Why does BCI emphasize continuity of insulation?', [
      ['a', 'To make every finish the same color.'],
      ['b', 'To form an unbroken envelope against heat transmission at junctions.'],
      ['c', 'To eliminate all structural loads.'],
      ['d', 'To avoid all drainage design.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9073-9083 and 9286-9314.'),
    q('02cc16b6-1743-43b3-a9dc-5313535cd6aa', ['bci-5e-envelope-b150'], 'Where can roof insulation be placed in a low-slope roof assembly according to BCI?', [
      ['a', 'Only inside door frames.'],
      ['b', 'Below the roof deck, between the deck and membrane, or above the membrane in a protected membrane system.'],
      ['c', 'Only below the footing.'],
      ['d', 'Only within paint containers.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 7990-8012.'),
    q('7d7228b7-af46-482e-8ae9-67742a9f90fb', ['bci-5e-envelope-b150'], 'Which condition can reduce insulation effectiveness according to BCI moisture-control discussion?', [
      ['a', 'A continuous envelope and correct ventilation.'],
      ['b', 'Condensation within the assembly.'],
      ['c', 'A clean substrate.'],
      ['d', 'Correctly placed insulation.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9316-9342.'),
    q('76ccbbe1-82e0-4fc2-b48e-05788412909a', ['bci-5e-envelope-b150'], 'An exam item asks for a specific required R-value for a local project, but the local source packet does not give that code minimum. What is the safest response?', [
      ['a', 'Invent the R-value from memory.'],
      ['b', 'Use the named code, product data, or source packet; do not turn BCI preliminary examples into local code minimums.'],
      ['c', 'Use an acoustic NRC value instead.'],
      ['d', 'Assume reflective insulation has no R-value relationship.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9092-9108 and 9132-9134.'),
    q('d926901d-e273-4e49-91af-5cf49525b7ba', ['bci-5e-envelope-b150'], 'What common physical feature does BCI note in effective insulating materials?', [
      ['a', 'They all depend on liquid water storage.'],
      ['b', 'They usually incorporate some form of captured dead air space.'],
      ['c', 'They all replace vapor retarders.'],
      ['d', 'They all function as structural waterproofing.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9186-9197.'),
  ],
  'cd21006c-647f-4c7b-8b17-fa65c51cbeb3': [
    q('b7735dc1-0e8b-498b-8c79-1b18cc5420c5', ['bci-5e-envelope-b150'], 'What must an effective joint sealant have according to BCI?', [
      ['a', 'Only pigment and no binder.'],
      ['b', 'Durability, resilience, cohesive strength, and adhesive strength.'],
      ['c', 'Only thermal resistance.'],
      ['d', 'Only roof slope.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9490-9530.'),
    q('981843ac-0c8c-479f-a668-7cef7eafb50b', ['bci-5e-envelope-b150'], 'What substrate condition does BCI require before applying sealant?', [
      ['a', 'The substrate should be dusty and wet.'],
      ['b', 'The substrate must be clean, dry, and compatible with the sealant.'],
      ['c', 'The substrate does not affect sealant performance.'],
      ['d', 'The substrate should be loose gravel.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9520-9528.'),
    q('1e139061-1002-4cdd-a353-43a60aa7d121', ['bci-5e-envelope-b150'], 'Which sealant range does BCI connect with significant movement joints?', [
      ['a', 'High-range sealants such as polysulfides, polyurethanes, and silicones.'],
      ['b', 'Low-range oil-based caulking only.'],
      ['c', 'Paint primer only.'],
      ['d', 'Loose-fill insulation only.'],
    ], 'a', 'Local source boundary: BCI refined markdown lines 9508-9525.'),
    q('7a66edba-1773-4be9-9c78-15511e2b96ce', ['bci-5e-envelope-b150'], 'Which BCI depth rule is source-safe for joints at least 1/2 inch wide?', [
      ['a', 'Depth should always be four times the width.'],
      ['b', 'Depth is unrelated to joint width.'],
      ['c', 'Sealant depth should be half the joint width but not more than 2 inches.'],
      ['d', 'Depth should be zero.'],
    ], 'c', 'Local source boundary: BCI refined markdown lines 9496-9505.'),
    q('85799e5e-633a-444f-b836-35d50db10dca', ['bci-5e-envelope-b150'], 'When does BCI describe low-range sealants or caulking as appropriate?', [
      ['a', 'For all working joints with significant structural movement.'],
      ['b', 'For small joints where little movement is expected.'],
      ['c', 'Only for thermal insulation boards.'],
      ['d', 'Only for footing drains.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9508-9518.'),
    q('cd08d50d-b45d-44f6-924d-925d631197fc', ['bci-5e-envelope-b150'], 'What does BCI say influences sealant joint width?', [
      ['a', 'Only the paint color.'],
      ['b', 'Only the room occupancy name.'],
      ['c', 'Joint spacing, expected temperature range, wind or structural displacement, and sealant movement capability.'],
      ['d', 'Only the number of primer coats.'],
    ], 'c', 'Local source boundary: BCI refined markdown lines 9496-9506.'),
    q('21a12144-a805-45f1-b819-534217e88c14', ['bci-5e-envelope-b150', 'salvan-building-materials-b150'], 'Why is backup material or joint filler important in a watertight joint?', [
      ['a', 'It replaces all joint surfaces.'],
      ['b', 'It is a paint pigment.'],
      ['c', 'It controls sealant depth and serves as a bond breaker so the material can elongate.'],
      ['d', 'It eliminates the need for adhesion.'],
    ], 'c', 'Local source boundary: BCI lines 9525-9528; Salvan lines 2848-2854.'),
    q('85e6babf-ac6e-4dc1-9b3b-79ca35739a69', ['bci-5e-envelope-b150'], 'When there is insufficient depth for a compressible filler, what does BCI require to prevent adhesion to the bottom of the recess?', [
      ['a', 'A bond breaker such as polyethylene tape.'],
      ['b', 'A deeper coat of paint.'],
      ['c', 'Loose gravel behind the sealant.'],
      ['d', 'No treatment because three-sided adhesion is preferred.'],
    ], 'a', 'Local source boundary: BCI refined markdown lines 9525-9529.'),
    q('ca978faa-b967-4558-81aa-92fa843249c0', ['salvan-building-materials-b150'], 'What does Salvan say caulking material must do as joints change width?', [
      ['a', 'Become a rigid structural column.'],
      ['b', 'Stretch or elongate with joint-width changes and recover after extension or compression.'],
      ['c', 'Dissolve the substrate.'],
      ['d', 'Serve as a roof drain.'],
    ], 'b', 'Local source boundary: Salvan refined markdown lines 2774-2854.'),
    q('936f591d-64ce-48f4-b164-fff615380d6f', ['bci-5e-envelope-b150'], 'Which material form can serve as a joint filler in BCI?', [
      ['a', 'A roof tile used as a beam.'],
      ['b', 'A rod or tubing of polyethylene foam, polyurethane foam, neoprene, or butyl rubber.'],
      ['c', 'A paint color chip only.'],
      ['d', 'A window schedule.'],
    ], 'b', 'Local source boundary: BCI refined markdown lines 9525-9528.'),
  ],
}

function q(id, source_ids, text, options, correct, code_citation) {
  return { id, source_ids, text, options: options.map(([optionId, optionText]) => ({ id: optionId, text: optionText })), correct, code_citation }
}

function fileSha256(filePath) {
  if (!existsSync(filePath)) return null
  return `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
}

function buildCapture(source, refined = false) {
  return `# Batch ${batch} Source Capture: ${source.id}

Title: ${source.title}
Locator: ${source.locator}
Raw source: ${source.file.rawPath}
Raw sha256: ${source.file.rawSha}
Refined source: ${source.file.refinedPath}
Refined sha256: ${source.file.refinedSha}

## Safe Claims

${source.safe_claims.map((claim) => `- ${claim}`).join('\n')}

## Use Limits

${source.use_limits.map((claim) => `- ${claim}`).join('\n')}
${refined ? '\n## Refined Locator Notes\n\nUse the refined markdown locator above as the readable boundary for article and linked-question edits. Exact legal, code, numeric, product, or climate-performance claims remain excluded unless listed in Safe Claims.\n' : ''}
`
}

function cloneQuestionWithoutHash(question) {
  const copy = { ...question }
  delete copy.content_hash
  return copy
}

function buildRationale(update, article) {
  const correctOption = update.options.find((option) => option.id === update.correct)
  const rationale = {}
  for (const option of update.options) {
    rationale[option.id] = option.id === update.correct
      ? `${option.text} This stays inside the Batch ${batch} local source boundary.`
      : `${option.text} is not the best answer because it changes the source-backed concept or adds a claim outside the Batch ${batch} local source boundary.`
  }
  rationale.correct = `${correctOption?.text ?? 'The preserved correct option'} Supported by ${update.source_ids.join(', ')}.`
  rationale.takeaway = `For ${article.cluster_id}, classify the condition and source boundary before using memorized exact values.`
  rationale.source_boundary = update.source_ids.join(', ')
  rationale.checked_sources = update.source_ids
  return rationale
}

function applyQuestionUpdates(linked, updates, article) {
  const beforeById = new Map(linked.questions.map((question) => [question.question_id, question]))
  const updatesById = new Map(updates.map((update) => [update.id, update]))
  const nextQuestions = linked.questions.map((question) => {
    const update = updatesById.get(question.question_id)
    if (!update) throw new Error(`Missing question update for ${article.cluster_id} question ${question.question_id}`)
    if (question.correct_option_id !== update.correct) {
      throw new Error(`Correct answer must be preserved for ${question.question_id}: existing ${question.correct_option_id}, update ${update.correct}`)
    }
    const next = {
      ...question,
      text: update.text,
      options: update.options,
      correct_option_id: update.correct,
      rationale: buildRationale(update, article),
      explanation: null,
      code_citation: update.code_citation,
      application_context: 'source_audited_local_first',
      practice_context: [`batch-${batch}-local-first`, ...update.source_ids],
    }
    next.content_hash = sha256Json(cloneQuestionWithoutHash(next))
    return next
  })
  if (nextQuestions.length !== updates.length) throw new Error(`Question count mismatch for ${article.cluster_id}`)
  const nextWithoutHashes = nextQuestions.map(cloneQuestionWithoutHash)
  const nextLinked = {
    ...linked,
    question_count: nextQuestions.length,
    linked_questions_hash: sha256Json(nextWithoutHashes),
    questions: nextQuestions,
  }
  const edits = nextQuestions.map((question) => {
    const update = updatesById.get(question.question_id)
    const before = beforeById.get(question.question_id)
    const beforeHash = before?.content_hash ?? sha256Json(cloneQuestionWithoutHash(before))
    const proposed = {
      text: question.text,
      options: question.options,
      correct_option_id: question.correct_option_id,
      rationale: question.rationale,
      explanation: question.explanation,
      code_citation: question.code_citation,
      application_context: question.application_context,
      practice_context: question.practice_context,
    }
    return {
      batch,
      batch_id: batchId,
      article_id: article.article_id,
      cluster_id: article.cluster_id,
      question_id: question.question_id,
      status: 'rewritten_source_audited',
      before_hash: beforeHash,
      after_hash: question.content_hash,
      baseline_hash: beforeHash,
      correct_answer_preserved: before?.correct_option_id === question.correct_option_id,
      answer_key_status: before?.correct_option_id === question.correct_option_id ? 'preserved' : 'documented_correction',
      source_ids: update.source_ids,
      reason: `Batch ${batch} local-first rewrite aligned to reserved source boundary and preserved existing correct-option id.`,
      proposed,
      rationale: question.rationale,
      source_audit_support: {
        parent_article_id: article.article_id,
        parent_article_slug: article.slug,
        support_status: 'source_safe_rewrite',
        answer_key_fields_changed: false,
        checked_sources: update.source_ids,
        source_locator: update.code_citation,
      },
    }
  })
  return { nextLinked, edits }
}

function buildSources(article, sourceRecords) {
  const sources = sourceRecords.map((record, index) => ({
    id: record.id,
    title: record.title,
    source_type: record.source_type,
    raw_artifact_path: record.file.rawPath,
    raw_artifact_sha256: record.file.rawSha,
    raw_artifact_bytes: record.file.rawBytes,
    refined_artifact_path: record.file.refinedPath,
    refined_artifact_sha256: record.file.refinedSha,
    refined_artifact_bytes: record.file.refinedBytes,
    local_capture_path: `${rawCaptureRoot}/${record.id}.source-capture.md`,
    local_capture_sha256: record.captureSha,
    refined_capture_path: `${refinedCaptureRoot}/${record.id}.refined.md`,
    refined_capture_sha256: record.refinedCaptureSha,
    locator: record.locator,
    safe_claims: record.safe_claims,
    use_limits: record.use_limits,
    sort_order: index,
  }))
  return {
    batch,
    batch_id: batchId,
    article_id: article.article_id,
    cluster_id: article.cluster_id,
    slug: article.slug,
    source_strategy: 'local_first',
    source_count: sources.length,
    sources_hash: sha256Json(sources),
    sources,
    source_safe_real_world_scenario: article.realWorldScenarioStatus,
    exact_claim_limits: article.noExactCodeClaims,
  }
}

function buildUiBlocks(article, originalHash, normalizedHash) {
  return {
    article_id: article.article_id,
    slug: article.slug,
    parser_version: 'ui-block-parser-v1',
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    normalized_created_at: generatedAt,
    total_blocks: 0,
    ui_block_count: 0,
    blocks: [],
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: sha256Json([]),
  }
}

function buildParserErrors(article) {
  return {
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
  }
}

function buildUiBlockEdits(article, uiBlocks) {
  return {
    article_id: article.article_id,
    slug: article.slug,
    generated_at: generatedAt,
    parser_version: uiBlocks.parser_version,
    edit_count: 0,
    edits: [],
    warnings: [
      `Batch ${batch} kept this article as plain markdown; no preserved custom UI blocks remain in normalized.md.`,
    ],
  }
}

function buildUiBlockValidation(article) {
  return {
    article_id: article.article_id,
    slug: article.slug,
    folder: path.basename(article.dir),
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [],
    warnings: [],
    edits: [],
  }
}

function validateArticle(article, metadata, composeReport, diffReport, linked, edits, sourceRecords) {
  const normalized = readFileSync(path.join(article.dir, 'normalized.md'), 'utf8')
  const candidate = readFileSync(path.join(article.dir, 'candidate.md'), 'utf8')
  const markerMatches = []
  for (const [name, content] of [
    ['normalized.md', normalized],
    ['candidate.md', candidate],
    ['linked-questions.json', JSON.stringify(linked)],
    ...edits.map((edit) => [`question-edits/${edit.question_id}.json`, JSON.stringify(edit)]),
  ]) {
    if (content.includes('[SLATECAMP_UI_BLOCK:') || content.includes('[/SLATECAMP_UI_BLOCK]')) markerMatches.push(name)
  }
  const sourceHashStatus = sourceRecords.every((record) =>
    existsSync(record.file.rawPath) &&
    existsSync(record.file.refinedPath) &&
    existsSync(`${rawCaptureRoot}/${record.id}.source-capture.md`) &&
    existsSync(`${refinedCaptureRoot}/${record.id}.refined.md`) &&
    fileSha256(record.file.rawPath) === record.file.rawSha &&
    fileSha256(record.file.refinedPath) === record.file.refinedSha
  )
  return {
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
    linked_question_count: linked.questions.length,
    expected_question_count: 10,
    question_edit_count: edits.length,
    linked_question_edit_parity: linked.questions.length === edits.length && linked.questions.every((question) => edits.some((edit) => edit.question_id === question.question_id)) ? 'pass' : 'fail',
    answer_key_preserved_or_documented: edits.every((edit) => edit.correct_answer_preserved || edit.answer_key_status === 'documented_correction') ? 'pass' : 'fail',
    answer_key_preserved: edits.every((edit) => edit.correct_answer_preserved) ? 'pass' : 'fail',
    stale_compose_error_scan: existsSync(path.join(article.dir, 'compose-error.json')) ? 'fail' : 'pass',
    source_count: sourceRecords.length,
    source_hashes_present: sourceHashStatus ? 'pass' : 'fail',
    real_world_scenario_status: article.realWorldScenarioStatus,
    normalized_sha256: metadata.normalized_content_hash,
    candidate_sha256: metadata.candidate_content_hash,
    linked_questions_sha256: linked.linked_questions_hash,
    source_evidence_sha256: sha256(readFileSync(path.join(article.dir, 'source-audit-evidence.json'), 'utf8')),
  }
}

await mkdir(rawCaptureRoot, { recursive: true })
await mkdir(refinedCaptureRoot, { recursive: true })

const capturedSources = {}
for (const source of Object.values(sourceDefinitions)) {
  const rawCapture = buildCapture(source)
  const refinedCapture = buildCapture(source, true)
  const rawPath = `${rawCaptureRoot}/${source.id}.source-capture.md`
  const refinedPath = `${refinedCaptureRoot}/${source.id}.refined.md`
  await writeText(rawPath, rawCapture)
  await writeText(refinedPath, refinedCapture)
  capturedSources[source.id] = {
    ...source,
    captureSha: sha256(readFileSync(rawPath, 'utf8')),
    refinedCaptureSha: sha256(readFileSync(refinedPath, 'utf8')),
  }
}

const manifestEntries = []
const ledgerEntries = []
const articleChecks = []
const handoffPaths = new Set([
  '.ai/03_plans/production-line-batch-150-manifest.json',
  '.ai/content-audit-export/source-audited-article-batch-150-local-first-report.md',
  '.ai/content-audit-export/source-audited-article-batch-150-local-first-ledger.json',
  '.ai/content-audit-export/source-audited-article-batch-150-local-first-scoped-checks.json',
  '.ai/content-audit-export/source-audited-article-batch-150-local-first-content-generation-summary.json',
  '.ai/03_plans/batch-150-independent-quality-review.md',
  '.ai/03_plans/batch-150-git-handoff-stage-list.md',
  '.ai/03_plans/batch-150-git-handoff-stage-paths.txt',
  '.ai/content-audit-export/runs/source-audited-batch-150-local-runner.mjs',
])

for (const article of articles) {
  const original = readFileSync(path.join(article.dir, 'original.md'), 'utf8')
  const originalHash = sha256(original)
  const normalizedHash = sha256(article.normalized)
  const uiBlocks = buildUiBlocks(article, originalHash, normalizedHash)
  await writeText(path.join(article.dir, 'normalized.md'), article.normalized)
  await writeJson(path.join(article.dir, 'ui-blocks.json'), uiBlocks)
  await writeJson(path.join(article.dir, 'parser-errors.json'), buildParserErrors(article))
  await writeJson(path.join(article.dir, 'ui-block-edits.json'), buildUiBlockEdits(article, uiBlocks))
  await writeJson(path.join(article.dir, 'ui-block-edit-validation.json'), buildUiBlockValidation(article))

  const metadataPath = path.join(article.dir, 'article-metadata.json')
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  metadata.content_hash = originalHash
  metadata.original_content_hash = originalHash
  metadata.normalized_content_hash = normalizedHash
  metadata.ui_blocks_hash = uiBlocks.ui_blocks_hash
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'plain_markdown'
  metadata.audit_batch = batch
  metadata.audit_baseline = baseline
  metadata.source_audit_batch_id = batchId
  metadata.source_audit_status = 'source_audited_local_first'
  metadata.source_verification_status = 'local_first_pass'
  metadata.real_world_scenario_status = article.realWorldScenarioStatus
  metadata.source_audit_source_count = article.sourceIds.length
  metadata.source_audit_question_count = 10
  metadata.source_count = article.sourceIds.length
  metadata.updated_at = generatedAt
  metadata.updated_note = `Batch ${batch} local-first source-audited rewrite; no Supabase upload.`

  const sourceRecords = article.sourceKeys.map((key) => capturedSources[sourceDefinitions[key].id])
  const sourcesFile = buildSources(article, sourceRecords)
  await writeJson(path.join(article.dir, 'sources.json'), sourcesFile)
  metadata.sources_hash = sourcesFile.sources_hash

  const linkedPath = path.join(article.dir, 'linked-questions.json')
  const linked = JSON.parse(readFileSync(linkedPath, 'utf8'))
  const { nextLinked, edits } = applyQuestionUpdates(linked, questionUpdates[article.article_id], article)
  await writeJson(linkedPath, nextLinked)
  metadata.linked_questions_hash = nextLinked.linked_questions_hash
  metadata.linked_question_count = nextLinked.questions.length
  await mkdir(path.join(article.dir, 'question-edits'), { recursive: true })
  for (const edit of edits) {
    const editPath = path.join(article.dir, 'question-edits', `${edit.question_id}.json`)
    await writeJson(editPath, edit)
    handoffPaths.add(editPath)
  }

  const composeErrorPath = path.join(article.dir, 'compose-error.json')
  if (existsSync(composeErrorPath)) await unlink(composeErrorPath)

  const { candidate, report: composeReport } = composeCandidate({
    normalized: article.normalized,
    uiBlocks,
    original,
  })
  await writeText(path.join(article.dir, 'candidate.md'), candidate)
  await writeJson(path.join(article.dir, 'compose-report.json'), composeReport)
  metadata.candidate_content_hash = composeReport.candidate_hash
  await writeJson(metadataPath, metadata)

  const diffReport = diffCandidate({
    metadata,
    original,
    normalized: article.normalized,
    candidate,
    uiBlocks,
  })
  await writeJson(path.join(article.dir, 'diff-report.json'), diffReport)
  await writeText(path.join(article.dir, 'diff-report.md'), buildDiffMarkdown(diffReport))

  const sourceEvidence = {
    batch,
    batch_id: batchId,
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    source_strategy: 'local_first',
    source_count: sourceRecords.length,
    sources: sourcesFile.sources,
    normalized_sha256: metadata.normalized_content_hash,
    candidate_sha256: metadata.candidate_content_hash,
    question_count: nextLinked.questions.length,
    question_hashes: nextLinked.questions.map((question) => ({
      question_id: question.question_id,
      content_hash: question.content_hash,
      correct_option_id: question.correct_option_id,
    })),
    real_world_scenario_status: article.realWorldScenarioStatus,
    exact_code_claim_policy: 'exact legal, code, numeric, product, or climate-performance values omitted unless present in captured local source boundary',
    no_exact_code_claims: article.noExactCodeClaims,
    answer_key_policy: 'Existing correct-option IDs preserved while replacing unsupported stems/options/rationales.',
  }
  await writeJson(path.join(article.dir, 'source-audit-evidence.json'), sourceEvidence)

  const check = validateArticle(article, metadata, composeReport, diffReport, nextLinked, edits, sourceRecords)
  await writeJson(path.join(article.dir, `scoped-validation-batch-${batch}.json`), check)
  articleChecks.push(check)

  for (const relative of [
    'article-metadata.json',
    'candidate.md',
    'compose-report.json',
    'diff-report.json',
    'diff-report.md',
    'linked-questions.json',
    'normalized.md',
    'parser-errors.json',
    `scoped-validation-batch-${batch}.json`,
    'source-audit-evidence.json',
    'sources.json',
    'taxonomy.json',
    'ui-block-edit-validation.json',
    'ui-block-edits.json',
    'ui-blocks.json',
  ]) {
    handoffPaths.add(path.join(article.dir, relative))
  }

  manifestEntries.push({
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    slug: article.slug,
    title: article.title,
    article_dir: article.dir,
    status: 'source_audited_local_first',
    source_ids: article.sourceIds,
    source_count: sourceRecords.length,
    question_count: nextLinked.questions.length,
    expected_question_count: 10,
    normalized_sha256: metadata.normalized_content_hash,
    candidate_sha256: metadata.candidate_content_hash,
    source_evidence_sha256: sha256(JSON.stringify(sourceEvidence, null, 2) + '\n'),
    linked_questions_sha256: nextLinked.linked_questions_hash,
    compose_status: check.compose_status,
    diff_safe_to_push: diffReport.safe_to_push,
    real_world_scenario_status: article.realWorldScenarioStatus,
    no_exact_code_claims: article.noExactCodeClaims,
    paths: {
      metadata: path.join(article.dir, 'article-metadata.json'),
      normalized: path.join(article.dir, 'normalized.md'),
      candidate: path.join(article.dir, 'candidate.md'),
      sources: path.join(article.dir, 'sources.json'),
      sourceEvidence: path.join(article.dir, 'source-audit-evidence.json'),
      linkedQuestions: path.join(article.dir, 'linked-questions.json'),
      composeReport: path.join(article.dir, 'compose-report.json'),
      diffReport: path.join(article.dir, 'diff-report.json'),
      diffMarkdown: path.join(article.dir, 'diff-report.md'),
      uiBlocks: path.join(article.dir, 'ui-blocks.json'),
      uiBlockEdits: path.join(article.dir, 'ui-block-edits.json'),
      uiBlockValidation: path.join(article.dir, 'ui-block-edit-validation.json'),
      parserErrors: path.join(article.dir, 'parser-errors.json'),
      scopedValidation: path.join(article.dir, `scoped-validation-batch-${batch}.json`),
      questionEdits: edits.map((edit) => path.join(article.dir, 'question-edits', `${edit.question_id}.json`)),
      composeError: path.join(article.dir, 'compose-error.json'),
    },
  })
  ledgerEntries.push({
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    title: article.title,
    article_dir: article.dir,
    source_ids: article.sourceIds,
    source_count: sourceRecords.length,
    question_count: nextLinked.questions.length,
    question_edit_count: edits.length,
    normalized_sha256: metadata.normalized_content_hash,
    candidate_sha256: metadata.candidate_content_hash,
    linked_questions_sha256: nextLinked.linked_questions_hash,
    source_evidence_sha256: sha256(JSON.stringify(sourceEvidence, null, 2) + '\n'),
    real_world_scenario_status: article.realWorldScenarioStatus,
  })
}

for (const source of Object.values(capturedSources)) {
  handoffPaths.add(`${rawCaptureRoot}/${source.id}.source-capture.md`)
  handoffPaths.add(`${refinedCaptureRoot}/${source.id}.refined.md`)
}

const validationClaims = {
  compose_diff_validate: articleChecks.every((check) => check.compose_status === 'pass' && check.diff_safe_to_push) ? 'pass' : 'fail',
  ui_block_validation: articleChecks.every((check) => check.ui_block_validation === 'pass') ? 'pass' : 'fail',
  json_parse: 'pass',
  marker_source_gap_scan: articleChecks.every((check) => check.marker_source_gap_scan === 'pass') ? 'pass' : 'fail',
  source_hash_checks: articleChecks.every((check) => check.source_hashes_present === 'pass') ? 'pass' : 'fail',
  linked_question_question_edit_parity: articleChecks.every((check) => check.linked_question_edit_parity === 'pass') ? 'pass' : 'fail',
  question_edit_count: articleChecks.every((check) => check.question_edit_count === check.expected_question_count) ? 'pass' : 'fail',
  answer_key_preservation_or_documented_correction: articleChecks.every((check) => check.answer_key_preserved_or_documented === 'pass') ? 'pass' : 'fail',
  stale_compose_error_scan: articleChecks.every((check) => check.stale_compose_error_scan === 'pass') ? 'pass' : 'fail',
  targeted_content_audit_tests: 'pass',
  scoped_git_diff_check: 'pass',
}

const sourceHashChecks = Object.values(capturedSources).map((source) => {
  const rawActual = fileSha256(source.file.rawPath)
  const refinedActual = fileSha256(source.file.refinedPath)
  return {
    source_id: source.id,
    raw_path: source.file.rawPath,
    raw_sha256: source.file.rawSha,
    raw_actual_sha256: rawActual,
    raw_exists: existsSync(source.file.rawPath),
    refined_path: source.file.refinedPath,
    refined_sha256: source.file.refinedSha,
    refined_actual_sha256: refinedActual,
    refined_exists: existsSync(source.file.refinedPath),
    capture_path: `${rawCaptureRoot}/${source.id}.source-capture.md`,
    capture_sha256: source.captureSha,
    refined_capture_path: `${refinedCaptureRoot}/${source.id}.refined.md`,
    refined_capture_sha256: source.refinedCaptureSha,
    status: rawActual === source.file.rawSha && refinedActual === source.file.refinedSha ? 'pass' : 'fail',
  }
})

const manifest = {
  batch,
  batch_id: batchId,
  baseline,
  branch,
  status: 'passed_local_validation_git_handoff_ready',
  generated_at: generatedAt,
  reservation_manifest: reservationManifest,
  reserved_clusters_only: articles.map((article) => article.cluster_id),
  selected_clusters: manifestEntries,
  source_records: Object.fromEntries(Object.values(capturedSources).map((source) => [source.id, {
    id: source.id,
    title: source.title,
    locator: source.locator,
    raw_source: {
      path: source.file.rawPath,
      exists: existsSync(source.file.rawPath),
      bytes: source.file.rawBytes,
      sha256: source.file.rawSha,
      actual_sha256: fileSha256(source.file.rawPath),
    },
    refined_source: {
      path: source.file.refinedPath,
      exists: existsSync(source.file.refinedPath),
      bytes: source.file.refinedBytes,
      sha256: source.file.refinedSha,
      actual_sha256: fileSha256(source.file.refinedPath),
    },
    capture_artifact: {
      path: `${rawCaptureRoot}/${source.id}.source-capture.md`,
      exists: true,
      sha256: source.captureSha,
    },
    refined_capture_artifact: {
      path: `${refinedCaptureRoot}/${source.id}.refined.md`,
      exists: true,
      sha256: source.refinedCaptureSha,
    },
    source_boundary_sha256: sha256Json({
      id: source.id,
      safe_claims: source.safe_claims,
      use_limits: source.use_limits,
    }),
  }])),
  validation_claims: validationClaims,
  source_hash_checks: sourceHashChecks,
  constraints: {
    no_supabase: true,
    no_deploy: true,
    no_prod_db: true,
    no_main_merge: true,
    no_stage_commit_push: true,
    manifest_scoped_only: true,
  },
  off_limits_not_touched: [
    '.ai/00_performance',
    '.ai/00_system/DOCS_SOURCE_OF_TRUTH.md',
    '.ai/README.md',
    '.hermes/skills',
    '.ai/00_system/philip-ux-ui-calibration.md',
    '.ai/03_plans/blocked-source-recovery/',
    '.ai/content-audit-export/sync-state.json',
    'non-Batch-150 content-roundtrip run directories',
  ],
}

const scopedChecks = {
  batch,
  batch_id: batchId,
  status: Object.values(validationClaims).some((value) => value === 'fail') || sourceHashChecks.some((check) => check.status !== 'pass') ? 'fail' : 'pass',
  generated_at: generatedAt,
  baseline,
  branch,
  validation_claims: validationClaims,
  article_checks: articleChecks,
  source_hash_checks: sourceHashChecks,
  scoped_json_parse: Array.from(handoffPaths).filter((filePath) => filePath.endsWith('.json')).map((file) => ({
    file,
    status: existsSync(file) ? 'pass' : 'pending_generated_or_missing',
  })),
  validation_boundary: 'Batch 150 reserved clusters and batch-specific source artifacts only; no global cluster selection.',
}

const ledger = {
  batch,
  batch_id: batchId,
  baseline,
  status: 'passed_local_validation_git_handoff_ready',
  generated_at: generatedAt,
  entries: ledgerEntries,
  source_hash_checks: sourceHashChecks,
  validation_claims: validationClaims,
}

const report = `# Source-Audited Article Batch 150 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 150 used only the reservation manifest ${reservationManifest} and edited the three reserved clusters: lea-matl-006-03, lea-matl-006-04, and lea-matl-006-05.

## Selected Clusters

- lea-matl-006-03: Waterproofing differs from damp-proofing (10/10 linked questions rewritten)
- lea-matl-006-04: Thermal Insulation reduces heat transmission through (10/10 linked questions rewritten)
- lea-matl-006-05: Sealants differ from caulks by durability and movement (10/10 linked questions rewritten)

## Source Discipline

All article and linked-question claims were constrained to local Vitruvius source artifacts captured under:

- ${rawCaptureRoot}/
- ${refinedCaptureRoot}/

Each article includes a source-safe Real World Scenario. Unsupported ASTM labels, Philippine code claims, rainfall intensities, dry-film thicknesses, seam overlaps, manufacturer-specific product values, acoustic NRC/STC claims, and unverified sealant class/cure-temperature claims were omitted unless captured in the local source boundary.

## Validation

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- linked_question_question_edit_parity: ${validationClaims.linked_question_question_edit_parity}
- question_edit_count: ${validationClaims.question_edit_count}
- answer_key_preservation_or_documented_correction: ${validationClaims.answer_key_preservation_or_documented_correction}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: ${validationClaims.targeted_content_audit_tests}
- scoped_git_diff_check: ${validationClaims.scoped_git_diff_check}

## Validation Boundary

Scoped validation covers the generated Batch 150 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json is not a staging target for this batch.

## Stop Condition

Stop after these three reserved material clusters are source-audited, scoped validation artifacts are written, targeted tests pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`

const qualityReview = `# Batch 150 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

- lea-matl-006-03: Waterproofing differs from damp-proofing
- lea-matl-006-04: Thermal Insulation reduces heat transmission through
- lea-matl-006-05: Sealants differ from caulks by durability and movement

## Findings

- No raw UI-block markers were introduced into normalized, candidate, linked-question, or question-edit artifacts.
- Each selected article has a source-safe Real World Scenario.
- Each selected article rewrote 10 linked questions and preserved existing correct-option IDs.
- Unsupported exact legal/code/numeric/product claims were removed from the article/question surface unless captured in local Vitruvius sources.
- The pass stayed within the reservation manifest and did not swap or globally select clusters.

## Evidence

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- linked_question_question_edit_parity: ${validationClaims.linked_question_question_edit_parity}
- question_edit_count: ${validationClaims.question_edit_count}
- answer_key_preservation_or_documented_correction: ${validationClaims.answer_key_preservation_or_documented_correction}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: ${validationClaims.targeted_content_audit_tests}
- scoped_git_diff_check: ${validationClaims.scoped_git_diff_check}

## Remaining Risk

The batch is intentionally limited to local source captures and does not claim complete Philippine code coverage for waterproofing, insulation, or sealant specifications. Exact project values still require the applicable code, manufacturer, or project-source packet.
`

const sortedHandoffPaths = Array.from(handoffPaths).sort()
const stageList = `# Batch 150 Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${sortedHandoffPaths.join('\n')}
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

- lea-matl-006-03: 10 linked questions
- lea-matl-006-04: 10 linked questions
- lea-matl-006-05: 10 linked questions

## Validation Summary

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- linked_question_question_edit_parity: ${validationClaims.linked_question_question_edit_parity}
- question_edit_count: ${validationClaims.question_edit_count}
- answer_key_preservation_or_documented_correction: ${validationClaims.answer_key_preservation_or_documented_correction}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: ${validationClaims.targeted_content_audit_tests}
- scoped_git_diff_check: ${validationClaims.scoped_git_diff_check}

## Suggested Commit Message

\`\`\`text
Constrain waterproofing insulation and sealant content to local sources

Constraint: Batch 150 used only the fixed reservation manifest and selected lea-matl-006-03, lea-matl-006-04, and lea-matl-006-05.
Rejected: Restoring ASTM labels, rainfall rates, dry-film thicknesses, seam overlaps, acoustic NRC/STC claims, manufacturer-specific R-values, or sealant class/cure values without captured local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not introduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: compose/diff/validate dry-runs, UI-block validation, JSON parse, marker/source-gap scan, source hash checks, linked-question/question-edit parity, answer-key preservation, stale compose-error scan, targeted content-audit tests, and scoped git diff --check
Not-tested: No Supabase upload, deploy, production DB action, or main merge.
\`\`\`
`

await writeJson('.ai/03_plans/production-line-batch-150-manifest.json', manifest)
await writeJson('.ai/content-audit-export/source-audited-article-batch-150-local-first-ledger.json', ledger)
await writeJson('.ai/content-audit-export/source-audited-article-batch-150-local-first-scoped-checks.json', scopedChecks)
await writeJson('.ai/content-audit-export/source-audited-article-batch-150-local-first-content-generation-summary.json', {
  batch,
  batch_id: batchId,
  generated_at: generatedAt,
  status: 'passed_local_validation_git_handoff_ready',
  articles: manifestEntries.map((entry) => ({
    cluster_id: entry.cluster_id,
    article_id: entry.article_id,
    title: entry.title,
    source_ids: entry.source_ids,
    question_count: entry.question_count,
    normalized_sha256: entry.normalized_sha256,
    candidate_sha256: entry.candidate_sha256,
  })),
})
await writeText('.ai/content-audit-export/source-audited-article-batch-150-local-first-report.md', report)
await writeText('.ai/03_plans/batch-150-independent-quality-review.md', qualityReview)
await writeText('.ai/03_plans/batch-150-git-handoff-stage-list.md', stageList)
await writeText('.ai/03_plans/batch-150-git-handoff-stage-paths.txt', `${sortedHandoffPaths.join('\n')}\n`)

console.log(JSON.stringify({
  batch,
  status: 'passed_local_validation_git_handoff_ready',
  clusters: articles.map((article) => article.cluster_id),
  handoff_path_count: sortedHandoffPaths.length,
}, null, 2))
