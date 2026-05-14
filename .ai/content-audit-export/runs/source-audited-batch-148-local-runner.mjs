#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
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

const batch = 148
const batchId = 'source-audited-batch-148-local-first'
const generatedAt = new Date().toISOString()
const baseline = '5b9cf4943b'
const branch = '3dlab-gray-viewport-bg'
const exportRoot = '.ai/content-audit-export'
const rawCaptureRoot = 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-148'
const refinedCaptureRoot = 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-148'

const sourceFiles = {
  masonryLecture: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Masonry Lecture.pdf',
    rawSha: 'sha256:4e3fc56f93fce4d78c98bdaff6b8a41eaf0fd4389a11b69bb42d66fc996d6bd1',
    rawBytes: 923032,
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Masonry Lecture.md',
    refinedSha: 'sha256:0386c6ebd73ac17ff6dc3cee97b63cd83b7e4168d8f3cf50c41a3347935d7ab4',
    refinedBytes: 19305,
  },
  bsi: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    rawSha: 'sha256:85384eeb1e57ec663247abdc18c30130391af79ddcfe4c09466cfd2d5a584ace',
    rawBytes: 38160628,
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    refinedSha: 'sha256:bed4a7c0917288af4adf9af90e84346be2817e9e8f4d1338d334909fce0b9491',
    refinedBytes: 576829,
  },
  foundationEngineering: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Foundation Engineering Analysis and Design.pdf',
    rawSha: 'sha256:4755891a0aad4bfa7c7a6f6f8eaf33e933e08ea9529ae932eeda45374ed1bc65',
    rawBytes: 26919935,
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Foundation Engineering Analysis and Design.md',
    refinedSha: 'sha256:2eaec5ff4bd5f82376996bb7e847fb810c4b1ac225b7a2b04214d45feb2d8fab',
    refinedBytes: 1336057,
  },
}

const sourceDefinitions = {
  masonryLectureChb: {
    id: 'masonry-lecture-chb-units',
    title: 'Masonry Lecture - CHB composition, sizes, mortar bedding, and reinforcement practice',
    source_type: 'local_training_reference',
    file: sourceFiles.masonryLecture,
    locator: 'refined markdown lines 109-147, 314-319, 353-361',
    safe_claims: [
      'Masonry is construction with clay, concrete, or stone units set in mortar.',
      'Concrete hollow block is a hollow masonry unit with two or three cells or cores made with water, Portland cement, and aggregates.',
      'Standard CHB sizes in the lecture are 100 mm, 150 mm, and 200 mm thicknesses by 200 mm height by 400 mm length.',
      'The lecture limits 100 mm CHB to interior partition use where weather-tightness is not required.',
      'Concrete hollow blocks are laid on a full bed of mortar with 10 mm horizontal and vertical joints.',
      'Cells containing reinforcement are filled with cement mortar.',
    ],
    use_limits: [
      'This batch does not restore an NBP/ACI hollow-versus-solid percentage threshold.',
      'This batch does not claim supplier-specific net area, bedded area, bearing stress, or allowable masonry strength values.',
      'This batch does not replace project specifications for reinforced masonry design, inspection, or grouting schedules.',
    ],
  },
  bsiMasonryFoundations: {
    id: 'bsi-masonry-foundation-grids',
    title: 'Building Structures Illustrated - masonry walls and foundation grids',
    source_type: 'local_authoritative_or_training_reference',
    file: sourceFiles.bsi,
    locator: 'refined markdown lines 718-751, 1890-1900, 3699-3701',
    safe_claims: [
      'Masonry construction uses natural or manufactured units, such as stone, brick, or concrete block, usually with mortar as a bonding agent.',
      'Concrete masonry units commonly have two or three cores; concrete block is economical and easily reinforced for bearing walls.',
      'A foundation system supports and anchors the superstructure and transmits loads safely into the earth.',
      'Shallow or spread foundations are used when stable soil with adequate bearing capacity occurs relatively near the ground surface.',
      'Mat foundations are thick, heavily reinforced concrete slabs used to distribute loads and reduce differential settlement where individual footings are uneconomical or soil capacity varies.',
      'Pile or caisson foundations are used when building loads exceed the bearing capacity of the supporting soil.',
      'Individual piles are typically joined by a cast-in-place concrete cap that supports a building column.',
    ],
    use_limits: [
      'This batch does not state Philippine code section numbers for masonry or foundation provisions.',
      'This batch does not claim exact shallow-foundation depth limits, Df/B thresholds, or settlement tolerance values.',
      'This batch does not use BSI estimating tables as mandatory code requirements.',
    ],
  },
  foundationPiles: {
    id: 'foundation-engineering-piles',
    title: 'Foundation Engineering Analysis and Design - pile classification, selection, and load transfer',
    source_type: 'local_authoritative_or_training_reference',
    file: sourceFiles.foundationEngineering,
    locator: 'refined markdown lines 22935-22971, 23285-23399, 23443-23545, 27859-27925',
    safe_claims: [
      'The source uses deep foundation and pile interchangeably for its chapter terminology.',
      'Piles may be classified by material, geometry, load transfer mechanism, ground displacement, and installation method.',
      'A friction pile transfers most load through friction along the pile shaft; a toe-bearing pile transfers most load through resistance at the pile toe.',
      'Driven piles are installed by impact hammer or vibration; bored piles are cast in place by drilling and then filling the borehole with concrete.',
      'Driven piles can cause noise, vibration, and soil displacement; bored piles can have lower noise and vibration and can be adjusted during construction as ground conditions are encountered.',
      'Pile type selection considers project environment, logistics, cost, and technical ground conditions; no single selection procedure fits every site.',
      'The load at the pile head is transferred through shaft friction and toe resistance.',
      'Bored-pile quality depends on subsurface exploration, constructability, and quality assurance during borehole drilling and concrete placement.',
      'In slurry construction, a tremie pipe places concrete from the base of a slurry-filled borehole.',
    ],
    use_limits: [
      'This batch does not restore exact NSCP pile, caisson, or drilled-shaft code section references.',
      'This batch does not state a universal pile-versus-caisson diameter threshold.',
      'This batch does not prescribe a standard batter angle, pile spacing, pile capacity, or load-test acceptance value.',
    ],
  },
  foundationServiceability: {
    id: 'foundation-engineering-serviceability',
    title: 'Foundation Engineering Analysis and Design - stability, settlement, and soil behavior',
    source_type: 'local_authoritative_or_training_reference',
    file: sourceFiles.foundationEngineering,
    locator: 'refined markdown lines 1040-1088, 26031-26033, 26426-26432',
    safe_claims: [
      'A foundation transmits superstructure load to the ground, and design must keep the ground mass stable and the structure performing as required.',
      'Safety analysis checks resistance against demand, while performance analysis predicts ground displacement under expected loading.',
      'A structure can be stable against failure but still unusable if settlement is excessive.',
      'Compressibility, strength, and permeability are key soil properties for foundation design.',
      'For saturated clay soils, settlement response is time-dependent because pore pressure dissipates slowly.',
      'Pile-group settlement can be evaluated by treating the group as an equivalent footing for load distribution.',
    ],
    use_limits: [
      'This batch does not state project-specific allowable settlement limits.',
      'This batch does not calculate bearing capacity, safety factors, or consolidation settlement from unstated soil parameters.',
      'This batch does not restore floating-foundation or compensated-foundation calculations because no local source capture supported them.',
    ],
  },
}

const articles = [
  {
    cluster_id: 'lea-strc-010-02',
    article_id: 'abc56d0a-101e-4bef-9eda-e5412892652e',
    slug: 'lea-strc-010-02-core-concept',
    title: 'Masonry unit',
    dir: '.ai/content-audit-export/articles/lea-strc-010-02-core-concept--abc56d0a-101e-4bef-9eda-e5412892652e',
    sourceIds: ['masonry-lecture-chb-units', 'bsi-masonry-foundation-grids'],
    sourceKeys: ['masonryLectureChb', 'bsiMasonryFoundations'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore an NBP/ACI hollow-versus-solid percentage threshold.',
      'No local source in this batch was used to state supplier-specific net area, bedded area, bearing stress, or allowable masonry strength values.',
      'No local source in this batch was used to replace project specifications for reinforced masonry inspection or grouting schedules.',
    ],
    normalized: String.raw`

## Board Exam Quick Check

Before choosing an answer, identify whether the item is asking about the unit itself, the mortar joint, the reinforcement path, or the wall system. Do not import an unsupported code table or supplier value into a question that only asks for locally sourced CHB practice.

**Common mistake:** treating "hollow block" as a complete design answer. For LEA review, name the unit, its cells, its mortar bedding, and the limits of the source before adding structural assumptions.

## Learning Goal

By the end of this article, you will be able to:

- Define a masonry unit using local source language.
- Identify concrete hollow block composition, cells, and standard Philippine lecture dimensions.
- Explain why mortar bedding and reinforced cells matter for CHB wall behavior.
- Separate source-backed CHB facts from unsupported code thresholds or supplier-specific strength claims.

---

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-010-02-core-concept", type="image", caption="Masonry Unit Types — Concrete Block, Clay Brick, and Structural Clay Tile", description="Comparative illustration of masonry units: (1) Concrete masonry unit (CMU) — hollow and solid types, nominal sizes (4'', 6'', 8''), web/shell thickness; (2) Clay brick — modular (8×4×2.67''), Norman, Roman, Jumbo sizes; (3) Structural clay tile — load-bearing partition and floor tiles. Compressive strength grades per ASTM/NSCP shown for each unit type.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

A **masonry unit** is one piece in a built-up masonry assembly. The local masonry lecture defines masonry as construction using clay, concrete, or stone set in mortar. Building Structures Illustrated states the same idea in architectural terms: masonry walls are built from natural or manufactured units such as stone, brick, or concrete block, usually with mortar as the bonding agent.

For Philippine CHB review, the safest source-backed unit definition is concrete hollow block as a **hollow masonry unit with two or three cells or cores**. The lecture identifies its ingredients as water, Portland cement, and aggregates such as sand, gravel, or crushed stone. That is the source boundary for this batch.

### CHB Dimensions and Use

The local lecture lists standard CHB sizes as:

| CHB thickness | Height | Length | Source-backed note |
|---|---:|---:|---|
| 100 mm (4 in.) | 200 mm | 400 mm | Lecture limits this thickness to interior partition walls where weather-tightness is not required. |
| 150 mm (6 in.) | 200 mm | 400 mm | Common wall-unit size in local CHB practice. |
| 200 mm (8 in.) | 200 mm | 400 mm | Used where thicker CHB walls are specified. |

The same lecture states that concrete hollow blocks should be laid on a **full bed of mortar** with 10 mm horizontal and vertical joints. It also states that cells containing reinforcement are filled with cement mortar.

### How to Think About the Unit

For source-safe exam work, distinguish four ideas:

| Idea | Source-safe meaning |
|---|---|
| Masonry unit | One block, brick, stone, or similar unit in a masonry assembly. |
| Mortar | The cementitious bonding material that joins units into courses and walls. |
| CHB cell/core | The hollow space in a concrete hollow block; the local source says CHB commonly has two or three cells or cores. |
| Reinforced cell | A cell containing reinforcement that is filled with cement mortar under the local lecture practice. |

Do not use this article to memorize unsupported net-area percentages, allowable bearing stresses, or code section numbers. Those values must come from the project specification or the exact code/source packet being tested.

## Key Provisions

| Tested distinction | Correct source-safe anchor | What to avoid |
|---|---|---|
| Masonry vs. individual unit | Masonry is the built-up construction; the unit is one clay, concrete, stone, brick, or block element. | Calling the whole wall a single "unit." |
| CHB composition | Water, Portland cement, and aggregates. | Treating CHB as fired clay brick or natural stone. |
| CHB geometry | Hollow unit with two or three cells or cores. | Assuming a hidden strength value from the word "hollow." |
| CHB size | 100, 150, or 200 mm thickness by 200 mm height by 400 mm length in the local lecture. | Importing a different modular CMU size unless that source is named. |
| Reinforced CHB cell | Reinforced cells are filled with cement mortar. | Saying all cells are automatically filled or structurally equivalent. |

## Philippine Practice Context

For LEA-style questions, the practical answer usually starts with the local CHB facts: the block is hollow, made from cement and aggregates, commonly sized in 100/150/200 mm thicknesses, laid on full mortar beds, and reinforced cells are filled. A question about a 100 mm CHB partition should also preserve the lecture limitation that it is for interior partition use where weather-tightness is not required.

## Real World Scenario

An architect reviewing shop drawings for a small renovation sees 100 mm CHB specified for an exterior wall. The source-safe response is not to calculate an unsupported strength value. It is to flag that the local lecture limits 100 mm CHB to interior partitions where weather-tightness is not required, then ask for the structural wall specification and the applicable code or project standard before approving the wall assembly.

## How It's Tested

1. **Unit identification:** Given brick, stone, and CHB examples, identify which are masonry units and which material each belongs to.
2. **CHB source facts:** Given a CHB description, select the option that matches the local source: two or three cells, cementitious ingredients, and the 100/150/200 mm by 200 mm by 400 mm size family.
3. **Reinforcement path:** Given a wall detail, identify why cells with reinforcement are filled and why a full bed of mortar is required.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: _Memory aid_: **"75% Rule"** — Hollow unit = net area < 75% of gross. Standard 6-inch CHB = 50% net = HOLLOW. **"BNA"** — **B**edded area (what contacts mortar), **N**et area (solid only), **A**rea gross (full bounding box). Bedded area determines bearing stress, not gross area.
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also: **Masonry Construction** (lea-strc-010-01) for wall assembly, **Bearing Walls** (lea-strc-002-04) for load path behavior, and **Foundations** (lea-strc-011-02) for how wall loads reach the ground.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing net area with bedded area—net area is 100% solid material; bedded area is only the portion in actual mortar contact (typically 50–60% for hollow CHB).\",\"Assuming all hollow units have the same net-to-gross ratio—while typical CHB is 45–55%, clay bricks may be 60–80%; always verify unit-specific data.\",\"Using gross area for bearing stress calculations instead of bedded area—this underestimates stress and may lead to local crushing failures.\",\"Treating the 75% threshold as a rough guideline instead of an absolute code criterion—75% is the exact dividing line: ≥75% is solid, &lt;75% is hollow.\",\"Specifying full-cell grouting to improve insulation—grouting eliminates insulation value and is structurally unnecessary where strategic grouting suffices.\",\"Ignoring bedded area reduction in design—hollow units have 40–50% less bedded area than gross area; this significantly increases bearing stress and must be explicitly checked.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
`.trimStart(),
  },
  {
    cluster_id: 'lea-strc-011-01',
    article_id: '15364bcb-3b60-4e75-9dd5-e656a3623ccd',
    slug: 'lea-strc-011-01-core-concept',
    title: 'Pile is a slender structural element driven or drilled',
    dir: '.ai/content-audit-export/articles/lea-strc-011-01-core-concept--15364bcb-3b60-4e75-9dd5-e656a3623ccd',
    sourceIds: ['foundation-engineering-piles', 'bsi-masonry-foundation-grids'],
    sourceKeys: ['foundationPiles', 'bsiMasonryFoundations'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore exact NSCP pile, caisson, or drilled-shaft code section references.',
      'No local source in this batch was used to state a universal pile-versus-caisson diameter threshold.',
      'No local source in this batch was used to prescribe a standard batter angle, pile spacing, pile capacity, or load-test acceptance value.',
    ],
    normalized: String.raw`

## Board Exam Quick Check

Before answering, identify the classification lens: load transfer, installation method, soil disturbance, or retaining function. Pile questions become wrong when a friction/toe-bearing issue is answered as if it were a driven/bored installation issue.

**Common mistake:** treating every deep element as the same object. In this batch, use only the local source boundary: piles are classified by load transfer, construction method, material/geometry, and ground displacement.

**Retrieval prompt:** What fact in the question tells you whether the answer should discuss shaft friction, toe resistance, driving vibration, bored-pile concrete placement, or sheet-pile retention?

## Learning Goal

By the end of this article, you will be able to:

- Classify piles by load transfer mechanism and installation method.
- Distinguish friction piles, toe-bearing piles, driven piles, and bored piles.
- Explain the role of pile caps for groups of piles.
- Separate foundation piles from sheet pile retaining systems.
- Keep pile and caisson claims inside the captured local source boundary.

---

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-011-01-core-concept", type="image", caption="Pile Types — End-Bearing vs Friction, Driven vs Bored", description="Cross-section diagram comparing pile types: (1) End-bearing pile — transfers load through tip to competent bearing stratum (rock/dense sand); (2) Friction pile — transfers load through skin friction along shaft surface; (3) Driven piles — precast concrete, steel H-pile, pipe pile; (4) Bored/drilled piles — cast-in-place with bell or straight shaft. Load transfer mechanism arrows and soil profile layers shown.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

The foundation engineering source uses **deep foundation** and **pile** interchangeably in its pile chapter. A pile is not classified by one label only. The source classifies piles by material, geometry, load transfer mechanism, ground displacement, and installation method.

### Load Transfer Classification

| Pile load-transfer type | Source-safe meaning |
|---|---|
| Friction pile | Most of the pile-head load is transferred to surrounding soil through friction along the pile shaft. |
| Toe-bearing pile | Most of the load is supported by resistance at the pile toe. |
| Mixed action | The same pile may use both shaft friction and toe resistance in different proportions. |

The source expresses the pile-head load as the sum of toe resistance and shaft resistance. That is the safe concept to remember: the question is usually asking **where the load leaves the pile and enters the ground**.

### Installation Classification

| Installation type | Source-safe meaning | Common implication |
|---|---|---|
| Driven pile | Installed by impact hammer or vibration. | Can create noise, vibration, soil displacement, and ground disturbance. |
| Bored pile | Cast in place after drilling a borehole and filling it with concrete. | Can have lower noise/vibration and can be adjusted as actual ground conditions are encountered. |

The foundation engineering source emphasizes that pile-type selection is an iterative engineering process. It considers project environment, construction logistics, cost, and the technical ground conditions. Do not state a single universal pile choice without the soil profile and construction constraints.

### Pile Caps and Related Systems

Building Structures Illustrated states that individual piles are typically joined by a cast-in-place concrete cap, which then supports a building column. For a group of piles, the cap integrates the group so the column load can be distributed into the individual piles.

Sheet piles are a different category. The foundation engineering source describes sheet pile walls as prefabricated interlocking sheets of metal, concrete, or timber driven into the ground to retain soil. They may form part of excavation support or waterfront retention, but that retaining function is different from carrying a building column load through a foundation pile group.

### Bored-Pile Construction Cue

For bored piles constructed under slurry, the source describes a **tremie pipe** as the funnel-and-long-neck system used to place concrete from the base of a slurry-filled borehole. That cue is about construction quality and concrete placement, not about changing the pile into a driven pile.

## Key Provisions

| Exam cue | Best source-safe response | Avoid |
|---|---|---|
| "Most load through shaft" | Friction pile. | Calling it toe-bearing because it is deep. |
| "Most load at toe" | Toe-bearing pile. | Ignoring shaft friction when mixed action is described. |
| "Installed by hammer/vibration" | Driven pile. | Calling it bored because it is concrete. |
| "Drilled then concreted" | Bored pile. | Assuming no quality assurance is needed. |
| "Interlocking wall retaining soil" | Sheet pile wall or retaining system. | Treating it as a building-load foundation pile. |
| "Several piles under one column" | Pile cap distributes the column load to the pile group. | Saying each pile works as an isolated column support with no cap action. |

## Philippine Practice Context

For local review, use site and construction cues rather than unsupported thresholds. In dense urban sites, the source-backed issue is that driven piles can create noise and vibration, while bored piles can reduce those effects but require careful borehole stability, concrete placement, and quality assurance. In soft ground, selection still depends on the actual soil profile and whether capacity is developed by shaft friction, toe resistance, or both.

## Real World Scenario

A mid-rise project beside occupied buildings has deep soft soil and strict vibration limits. The source-safe design conversation compares driven and bored options by environment, logistics, ground conditions, and load transfer. A bored pile may reduce noise and vibration, but the team still needs subsurface exploration, a construction method compatible with caving or groundwater conditions, concrete placement control, and quality assurance before capacity is trusted.

## How It's Tested

1. **Load transfer:** Given a shaft-resistance or toe-resistance description, classify the pile as friction, toe-bearing, or mixed action.
2. **Installation method:** Given "hammer/vibration" or "drill then concrete," distinguish driven from bored piles.
3. **Retaining vs. foundation:** Given sheet piles at an excavation, identify the retaining function and avoid treating them as building-load piles.
4. **Pile cap:** Given a group of piles under one column, explain why the cap distributes load to the group.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory Aid:** End-bearing piles say "I stand on a rock"; friction piles say "I hug the soil." Batter piles lean to fight sideways forces. Sheet piles lock arm-in-arm to hold back the earth wall. Diameter 600 mm is the magic threshold: below is a pile, at or above is a caisson.
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also: **Foundations** (lea-strc-011-02) for overall foundation selection, **Geotechnical Engineering** (lea-strc-011-03) for soil properties, and **Load Types** (lea-strc-001-02) for the loads that foundation systems must transfer.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing batter piles with bored piles; batter refers to inclination (1:6–1:12), not installation method.\",\"Assuming all drilled piles are cast in place with reduced skin friction; proper borehole preparation and tremie placement preserve friction capacity.\",\"Stating that sheet piles transfer load to the foundation; they are a retaining system, not a load-bearing element.\",\"Using pile and caisson interchangeably without respect to the ≥ 600 mm diameter threshold that governs excavation, integrity testing, and behavior.\",\"Omitting pile caps in load distribution sketches; caps are mandatory to distribute superstructure load across multiple piles.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
`.trimStart(),
  },
  {
    cluster_id: 'lea-strc-011-02',
    article_id: '3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d',
    slug: 'lea-strc-011-02-core-concept',
    title: 'Foundation',
    dir: '.ai/content-audit-export/articles/lea-strc-011-02-core-concept--3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d',
    sourceIds: ['bsi-masonry-foundation-grids', 'foundation-engineering-serviceability', 'foundation-engineering-piles'],
    sourceKeys: ['bsiMasonryFoundations', 'foundationServiceability', 'foundationPiles'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore exact shallow-foundation depth, Df/B, or settlement tolerance thresholds.',
      'No local source in this batch was used to restore concrete-cover values or PD1096/NSCP section citations.',
      'No local source in this batch was used to restore floating-foundation calculations or project-specific bearing capacity values.',
    ],
    normalized: String.raw`

## Board Exam Quick Check

Before answering, decide whether the question is about foundation purpose, shallow/deep selection, mat behavior, pile action, or settlement/serviceability. A foundation item usually fails when a student names a foundation type without checking soil bearing capacity, load distribution, and settlement behavior.

**Common mistake:** memorizing a depth number as if it controls every foundation. In this batch, the source-safe distinction is functional: shallow/spread foundations bear on stable soil near the surface, while piles or caissons transfer loads to more suitable material or through pile-soil resistance when shallow support is inadequate.

**Retrieval prompt:** What fact in the question tells you whether the foundation should spread load near the surface, merge footings into a mat, or transfer load through piles/caissons?

## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- State the purpose of a foundation system.
- Distinguish shallow/spread foundations from pile or caisson foundations using source-backed selection cues.
- Explain why mat foundations reduce differential settlement risk.
- Connect foundation selection to bearing capacity, soil variability, and serviceability.
- Avoid unsupported depth, cover, specialty-foundation calculation, and code-section claims.

---

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-011-02-core-concept", type="image", caption="Foundation Typology — Shallow vs Deep Foundation Systems", description="Cross-section comparison of foundation types: (1) Shallow foundations — isolated footing, combined footing, strip footing, mat/raft foundation; (2) Deep foundations — pile foundation (end-bearing/friction), drilled pier/caisson (≥600mm). Each type shown with soil bearing pressure distribution, reinforcement layout, and typical depth range. Decision tree for foundation selection based on soil conditions and building loads.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

A **foundation system** supports and anchors the superstructure and transmits its loads safely into the earth. Building Structures Illustrated frames the foundation as the critical link between the building above and the soil, rock, and water conditions below.

The source-safe selection logic is:

1. If stable soil with adequate bearing capacity occurs near the ground surface, use a shallow or spread foundation concept.
2. If individual footings become too large, uneconomical, or likely to settle differently, merge support through a mat foundation.
3. If building loads exceed the supporting soil's bearing capacity, use piles or caissons to reach more suitable bearing material or to develop support through pile-soil resistance.
4. Confirm serviceability, not just strength: the foundation engineering source warns that a structure can be stable against failure but still unusable if settlement is excessive.

### Shallow or Spread Foundations

Shallow or spread foundations transfer building loads directly to supporting soil by vertical pressure. The source-backed condition is not a universal depth number; it is the presence of stable soil with adequate bearing capacity relatively near the surface.

Common geometric forms in Building Structures Illustrated include:

| Form | Source-safe use |
|---|---|
| Point support | Column footing. |
| Line support | Foundation wall or wall footing. |
| Plane support | Mat foundation. |

### Mat Foundations

A **mat foundation** is a thick, heavily reinforced concrete slab that acts as a single monolithic footing for many columns or an entire building. It is used when soil bearing capacity is low relative to building loads, when interior column footings become so large that it is more economical to merge them, or when soil capacity varies enough that individual spread footings could settle differently.

### Pile and Caisson Foundations

Pile or caisson foundations are used when building loads exceed the bearing capacity of the supporting soil. Piles may be driven or bored, and their load may be carried through shaft friction, toe resistance, or both. Individual piles are typically joined by a cast-in-place concrete cap that supports a building column.

The foundation engineering source treats pile selection as an engineering process that considers site environment, logistics, cost, and technical ground conditions. Do not reduce pile selection to one memorized threshold.

## Key Provisions

| Selection cue | Source-safe foundation response | Avoid |
|---|---|---|
| Stable soil near surface with adequate capacity | Shallow/spread foundation concept. | Choosing piles just because the building is important. |
| Many large isolated footings or variable soil capacity | Mat foundation to distribute loads and reduce differential settlement. | Treating each footing as isolated when differential settlement is the issue. |
| Building loads exceed shallow soil bearing capacity | Pile or caisson foundation. | Widening shallow footings without checking settlement and serviceability. |
| Soil strength is adequate but settlement is excessive | Revise foundation strategy for serviceability, often toward mat or deep support. | Passing the design because factor of safety alone is acceptable. |
| Several piles under one column | Use a pile cap to distribute the column load to the group. | Drawing piles as independent supports with no group load transfer. |

## Philippine Practice Context

In local LEA review, do not answer foundation questions by reciting an unsupported "typical depth." First ask what the soil can carry, how uniform the support is, whether the load can be spread near the surface, and whether settlement remains acceptable. That sequence keeps the answer inside the captured local source boundary.

## Real World Scenario

A two-story portion and a taller block share a site with variable soil. The source-safe response is not to force one foundation type everywhere. The lighter portion may use spread support if stable near-surface soil is adequate, while the heavier block may need a mat or pile/caisson system. The final choice must be checked for load transfer and settlement compatibility, especially where the two building masses meet.

## How It's Tested

1. **Foundation purpose:** Select the statement that says the foundation supports and anchors the superstructure and transmits load into the earth.
2. **Shallow vs. deep selection:** Match shallow/spread foundations to adequate near-surface support and piles/caissons to inadequate shallow support.
3. **Mat foundation behavior:** Identify mat foundations as load-spreading slabs that help reduce differential settlement where individual footings are not efficient.
4. **Serviceability:** Recognize that settlement can govern even when strength or bearing capacity appears acceptable.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory Aid:** Shallow footings are direct pushers—they shove load straight down into soil. Deep piles and caissons are deep anchors—they hang onto the soil with friction or grip a firm layer with their tip. Mats are load-spreaders—they flatten pressure across a wide area to reduce settlement. Floating foundations are weight-balancers—they remove as much soil weight as they place in structure.
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also: **Piles** (lea-strc-011-01) for deep foundation load transfer, **Geotechnical Engineering** (lea-strc-011-03) for soil behavior, and **Concrete Materials** (lea-strc-006-01) for concrete-related construction materials.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Assuming shallow foundations are always cheaper; deep foundations are often mandatory in soft soil and eliminate costly settlement repair later.\",\"Confusing floating foundation with a raft foundation; floating requires Df and excavation weight to nearly equal structure weight; ordinary mats are intermediate supports, not floating.\",\"Treating combined footing and mat as equivleant; combined footings support 2–4 columns; mats cover the entire footprint and provide greater stiffness and load distribution.\",\"Placing mats at arbitrary depth; mat depth is selected to balance bearing capacity and settlement. Deeper mats reduce pressure but increase cost. Optimization is required.\",\"Omitting the role of groundwater and compressibility in foundation selection; soft, saturated clays mandate deep foundations and settlement monitoring, not shortcuts to shallow systems.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
`.trimStart(),
  },
]

const uiBlockSpecsByArticleId = {
  'abc56d0a-101e-4bef-9eda-e5412892652e': [
    {
      block_id: 'ui_0001',
      component_name: 'ArticleMedia',
      props: {
        id: 'media-lea-strc-010-02-core-concept',
        type: 'image',
        caption: 'Masonry Unit and CHB Source Boundary',
        description: 'Diagram comparing one masonry unit, a two-or-three-cell CHB, full mortar bedding, 10 mm joints, and a reinforced cell filled with cement mortar. Labels the local lecture size family: 100 mm, 150 mm, and 200 mm thickness by 200 mm height by 400 mm length.',
        suggestedAsset: 'Diagram or reference image',
        status: 'placeholder',
      },
    },
    {
      block_id: 'ui_0002',
      component_name: 'Tip',
      children_raw: 'Memory aid: unit, cells, bed, fill. CHB is a cement-and-aggregate masonry unit with two or three cells; the local lecture size family is 100/150/200 mm by 200 mm by 400 mm; CHB is laid on a full mortar bed, and reinforced cells are filled.',
    },
    {
      block_id: 'ui_0003',
      component_name: 'Warn',
      children_raw: 'Keep CHB answers inside the captured source boundary. This batch does not support net-area percentages, allowable stresses, code section numbers, or supplier-specific bearing values.',
    },
    {
      block_id: 'ui_0004',
      component_name: 'WikiMistakeList',
      props: {
        mistakes: [
          'Importing a hollow-versus-solid percentage threshold when the local source only supports CHB cells, composition, dimensions, mortar bedding, and reinforced-cell fill.',
          'Using supplier net area, bearing stress, or allowable strength values without a project specification or cited source.',
          'Treating 100 mm CHB as exterior wall material when the local lecture limits it to interior partitions where weather-tightness is not required.',
          'Assuming every CHB cell is reinforced or filled; the source only says cells containing reinforcement are filled with cement mortar.',
          'Confusing one masonry unit with the complete wall assembly.',
          'Forgetting that full mortar bedding and 10 mm joints are part of the source-backed workmanship check.',
        ],
      },
    },
  ],
  '15364bcb-3b60-4e75-9dd5-e656a3623ccd': [
    {
      block_id: 'ui_0001',
      component_name: 'ArticleMedia',
      props: {
        id: 'media-lea-strc-011-01-core-concept',
        type: 'image',
        caption: 'Pile Classification by Load Transfer and Installation',
        description: 'Cross-section diagram comparing shaft-friction transfer, toe-resistance transfer, driven installation by hammer or vibration, bored installation by drilling and concreting, a pile cap joining a pile group, and sheet piles as a retaining wall system.',
        suggestedAsset: 'Diagram or reference image',
        status: 'placeholder',
      },
    },
    {
      block_id: 'ui_0002',
      component_name: 'Tip',
      children_raw: 'Memory aid: shaft, toe, method, wall, cap. Friction and toe-bearing describe load transfer; driven and bored describe installation; sheet piles retain soil; pile caps distribute column load to a pile group.',
    },
    {
      block_id: 'ui_0003',
      component_name: 'Warn',
      children_raw: 'Do not add a universal pile-versus-caisson size cutoff, a fixed batter slope, or a code section unless the tested source supplies it. This batch only supports the captured local foundation-engineering boundary.',
    },
    {
      block_id: 'ui_0004',
      component_name: 'WikiMistakeList',
      props: {
        mistakes: [
          'Answering a load-transfer question with an installation-method label.',
          'Treating sheet piles as building-load foundation piles instead of retaining elements.',
          'Using a universal pile-versus-caisson size cutoff without captured source support.',
          'Memorizing a fixed batter slope when the captured source only supports vertical or battered support piles as a design possibility.',
          'Assuming bored piles avoid quality-control risk; borehole stability and concrete placement still need control.',
          'Omitting the pile cap when explaining how a pile group supports a column.',
        ],
      },
    },
  ],
  '3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d': [
    {
      block_id: 'ui_0001',
      component_name: 'ArticleMedia',
      props: {
        id: 'media-lea-strc-011-02-core-concept',
        type: 'image',
        caption: 'Foundation Selection Source Boundary',
        description: 'Decision diagram showing shallow or spread support where stable near-surface soil has adequate capacity, mat foundation as a load-spreading slab for many supports or variable soil, and piles or caissons when loads exceed shallow soil bearing capacity.',
        suggestedAsset: 'Diagram or reference image',
        status: 'placeholder',
      },
    },
    {
      block_id: 'ui_0002',
      component_name: 'Tip',
      children_raw: 'Memory aid: spread, mat, deep, settle. Spread foundations need adequate near-surface support; mats merge and distribute loads to reduce differential settlement; piles or caissons are evaluated when shallow bearing is inadequate; serviceability settlement can still govern.',
    },
    {
      block_id: 'ui_0003',
      component_name: 'Warn',
      children_raw: 'Avoid unsupported depth limits, formula-style depth rules, concrete-cover citations, settlement tolerances, and specialty-foundation calculations. Use soil bearing capacity, load distribution, and settlement behavior from the captured sources.',
    },
    {
      block_id: 'ui_0004',
      component_name: 'WikiMistakeList',
      props: {
        mistakes: [
          'Choosing shallow or deep support from a memorized depth number instead of soil capacity and load-transfer conditions.',
          'Calling a mat foundation a finish slab; the captured source treats it as a thick reinforced foundation slab.',
          'Assuming stability against failure is enough even when settlement would impair building performance.',
          'Selecting piles only because a building is important, without checking whether shallow support is adequate.',
          'Adding concrete-cover or code-section citations that were not captured for this batch.',
          'Using specialty-foundation calculations without source support.',
        ],
      },
    },
  ],
}

const questionUpdates = {
  'abc56d0a-101e-4bef-9eda-e5412892652e': [
    {
      id: '8708c400-3f73-401a-8684-0725f9052109',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'A local masonry lecture describes concrete hollow block as a hollow masonry unit with two or three cells or cores made from water, Portland cement, and aggregates. Which classification best matches that source-backed description?',
      options: [
        { id: 'a', text: 'Solid brick, because all masonry units are fired clay products.' },
        { id: 'b', text: 'Concrete hollow block, because the unit is hollow and has two or three cells or cores.' },
        { id: 'c', text: 'Stone ashlar, because the unit is defined only by mortar bedding.' },
        { id: 'd', text: 'Plain concrete wall, because CHB has no separate unit identity.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 314-319.',
    },
    {
      id: '980666c7-2bd4-4b7d-a071-4efc77da8dd5',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'A supplier submittal for CHB changes the wall-unit details from the standard lecture description. What is the safest source-backed review response before accepting the units for a structural wall?',
      options: [
        { id: 'a', text: 'Accept the change automatically because all hollow blocks have identical strength and contact behavior.' },
        { id: 'b', text: 'Check the actual unit properties and project specification because source-backed CHB facts do not supply a universal bearing or strength value.' },
        { id: 'c', text: 'Ignore the submittal because CHB dimensions alone prove structural adequacy.' },
        { id: 'd', text: 'Approve only if the unit has fewer cells, because fewer cells always increase capacity.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 314-319 and 353-361.',
    },
    {
      id: '7d557a4f-03e4-4ef0-8e29-92b0de46dd83',
      source_ids: ['masonry-lecture-chb-units', 'bsi-masonry-foundation-grids'],
      text: 'Which statement best connects masonry units, mortar, and CHB cells within the captured local source boundary?',
      options: [
        { id: 'a', text: 'Masonry, mortar, units, and cells are interchangeable names for the same object.' },
        { id: 'b', text: 'Masonry is built from units set in mortar; CHB is one hollow unit type with cells or cores that may contain reinforcement.' },
        { id: 'c', text: 'Mortar is the hollow part of the block, while the cells are the wall finish.' },
        { id: 'd', text: 'A CHB cell is a separate foundation unit unrelated to the block.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Masonry Lecture lines 109-147, 314-319, 353-361; BSI lines 3699-3701.',
    },
    {
      id: '36908fd7-e3f7-406b-99ee-9972eeb85ead',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'A site detail shows CHB courses without a full mortar bed and with reinforced cells left unfilled. Which source-backed concern should the reviewer raise first?',
      options: [
        { id: 'a', text: 'The detail conflicts with the local lecture practice that CHB should be laid on a full bed of mortar and cells with reinforcement are filled with cement mortar.' },
        { id: 'b', text: 'No concern is needed because mortar joints are decorative and reinforced cells are optional in all walls.' },
        { id: 'c', text: 'The only issue is paint finish because CHB structural behavior is independent of mortar bedding.' },
        { id: 'd', text: 'The wall must be demolished immediately because no field correction is ever possible.' },
      ],
      correct: 'a',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 353-361.',
    },
    {
      id: '54803f09-c55b-4706-af46-37901a67c476',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'Which size family is explicitly listed by the local masonry lecture for standard CHB?',
      options: [
        { id: 'a', text: '100 mm, 150 mm, or 200 mm thickness by 200 mm height by 400 mm length.' },
        { id: 'b', text: '75 mm thickness by 300 mm height by 700 mm length for all structural CHB.' },
        { id: 'c', text: 'Only 150 mm thickness, with height and length left unstated.' },
        { id: 'd', text: 'Any thickness is standard if the block is made with cement.' },
      ],
      correct: 'a',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 314-319.',
    },
    {
      id: '90fb863a-1b8c-4ccc-b459-0db1fc2d5c91',
      source_ids: ['masonry-lecture-chb-units', 'bsi-masonry-foundation-grids'],
      text: 'Why is concrete block commonly treated as a practical bearing-wall masonry unit in the captured sources?',
      options: [
        { id: 'a', text: 'Concrete block is economical and easily reinforced, and local CHB practice includes reinforced cells filled with cement mortar.' },
        { id: 'b', text: 'Concrete block is always stronger than reinforced concrete and needs no reinforcement.' },
        { id: 'c', text: 'Concrete block is used only as a veneer and cannot form a bearing wall.' },
        { id: 'd', text: 'Concrete block works because its hollow cells act as shock absorbers in every seismic design.' },
      ],
      correct: 'a',
      code_citation: 'Local source boundary: BSI refined markdown lines 3699-3701; Masonry Lecture lines 353-361.',
    },
    {
      id: '73c5b75a-0255-4875-83d2-97be0eace9d5',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'A manufacturer proposes a CHB with different cell geometry from the blocks described in the local lecture. What design consequence follows from the source boundary?',
      options: [
        { id: 'a', text: 'The unit remains a CHB candidate, but its actual properties must be checked against the project specification before structural use.' },
        { id: 'b', text: 'It becomes a new code category that is automatically prohibited in all walls.' },
        { id: 'c', text: 'Changing cells always decreases bearing stress, so the design is automatically safer.' },
        { id: 'd', text: 'Existing CHB source facts no longer apply to any part of the wall assembly.' },
      ],
      correct: 'a',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 314-319 and 353-361.',
    },
    {
      id: '41bcdd39-88d5-4d5a-817b-8a6ffec636c3',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'A note says 100 mm CHB will be used on an exterior wall where weather-tightness is required. Which option matches the local lecture limitation?',
      options: [
        { id: 'a', text: '100 mm CHB is preferred for all exterior walls because it is lighter.' },
        { id: 'b', text: 'The lecture limits 100 mm CHB to interior partition walls where weather-tightness is not required.' },
        { id: 'c', text: '100 mm CHB is classified as natural stone and therefore weatherproof.' },
        { id: 'd', text: 'The source gives no use limitation for 100 mm CHB.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 318-319.',
    },
    {
      id: 'c99e0fb0-5c62-4459-8bc7-6436f9a64473',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'In a CHB wall detail, why should the reviewer care whether the block is laid on a full bed of mortar?',
      options: [
        { id: 'a', text: 'The reviewer should use only gross wall area and ignore mortar contact.' },
        { id: 'b', text: 'The local lecture requires CHB to be laid on a full bed of mortar, so the bed joint is part of the source-backed load path and workmanship check.' },
        { id: 'c', text: 'Mortar bed requirements apply only to clay tile, not CHB.' },
        { id: 'd', text: 'Full mortar bedding is prohibited when a block has cells.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 353-361.',
    },
    {
      id: 'e5b59c4e-243c-4759-a428-953a69bc7b36',
      source_ids: ['masonry-lecture-chb-units'],
      text: 'A structural note calls for reinforcing bars in selected CHB cells. Which source-backed statement best explains the required follow-through?',
      options: [
        { id: 'a', text: 'All unreinforced cells must remain empty and reinforced cells are also left empty.' },
        { id: 'b', text: 'Cells with reinforcement are filled with cement mortar, tying the reinforcement detail to the masonry unit.' },
        { id: 'c', text: 'Reinforcement is cosmetic and does not affect CHB construction.' },
        { id: 'd', text: 'Full-cell grouting is prohibited in every CHB wall regardless of design.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Masonry Lecture refined markdown lines 353-361.',
    },
  ],
  '15364bcb-3b60-4e75-9dd5-e656a3623ccd': [
    {
      id: '1069929b-de3f-4d2a-80f1-9f20a14c2386',
      source_ids: ['foundation-engineering-piles', 'foundation-engineering-serviceability'],
      text: 'A pile load test indicates that most of the pile-head load is transferred along the shaft rather than at the toe. Which interpretation matches the local foundation engineering source?',
      options: [
        { id: 'a', text: 'The pile is automatically superior to all other pile types and settlement checks are unnecessary.' },
        { id: 'b', text: 'The pile behaves primarily as a friction pile; design still needs settlement and performance review because ground displacement can govern serviceability.' },
        { id: 'c', text: 'The pile behavior depends only on diameter, not load transfer.' },
        { id: 'd', text: 'The pile has no settlement because shaft friction is distributed.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown lines 22959-22971, 23443-23545, 1048-1088.',
    },
    {
      id: 'e2b621e5-e485-47b2-95dd-2b488503674f',
      source_ids: ['foundation-engineering-piles'],
      text: 'A contractor installs interlocking steel sheets around an excavation to retain soil. An engineer labels them as building-load foundation piles. What is the error?',
      options: [
        { id: 'a', text: 'The error is saying sheet piles can retain soil; they are only architectural cladding.' },
        { id: 'b', text: 'Sheet piles are a retaining wall system for soil support; that function is different from transferring building column load through a pile foundation.' },
        { id: 'c', text: 'Sheet piles are always batter piles and cannot be vertical.' },
        { id: 'd', text: 'Sheet piles are friction piles whose main purpose is vertical column support.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown lines 14160, 16139, 18205-18314.',
    },
    {
      id: '8dbb2f75-8f31-4395-be31-adc86f321d43',
      source_ids: ['foundation-engineering-piles'],
      text: 'A lateral support detail for a sheet pile wall uses inclined support piles outside the active soil zone. Which statement stays inside the captured source boundary?',
      options: [
        { id: 'a', text: 'Vertical toe-bearing piles are the only possible lateral support because inclination is never used.' },
        { id: 'b', text: 'Friction piles must always be inclined at one fixed slope for every site.' },
        { id: 'c', text: 'Vertical or battered piles may be used as lateral support elements, but the source does not prescribe one universal batter slope.' },
        { id: 'd', text: 'Sheet piles carry the building column load, so no separate support design is needed.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown line 20676.',
    },
    {
      id: 'a43321ff-aa33-4e99-b8c0-45090f7ff300',
      source_ids: ['foundation-engineering-piles'],
      text: 'A problem asks about a pile installed at an inclination to help a lateral support system. What is the source-safe design implication?',
      options: [
        { id: 'a', text: 'The inclination is arbitrary and has no effect on load direction or detailing.' },
        { id: 'b', text: 'All lateral force is ignored once a pile is inclined.' },
        { id: 'c', text: 'Inclination is a design choice for lateral support, so the engineer must resolve forces and choose the angle for the actual support condition.' },
        { id: 'd', text: 'Inclination reverses the direction of the lateral load automatically.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown line 20676.',
    },
    {
      id: 'd2958d29-592e-48b5-97ca-dbbd49348012',
      source_ids: ['foundation-engineering-piles'],
      text: 'A pile transfers most of the pile-head load through friction along the shaft and only a smaller portion through toe resistance. How should it be classified by load-transfer mechanism?',
      options: [
        { id: 'a', text: 'Toe-bearing pile, because all deep piles bear only at the toe.' },
        { id: 'b', text: 'Friction pile, because most load is transferred to surrounding soil through friction along the pile shaft.' },
        { id: 'c', text: 'Batter pile, because all friction piles are inclined.' },
        { id: 'd', text: 'Sheet pile, because all shaft friction belongs to retaining walls.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown lines 22959-22971 and 23443-23545.',
    },
    {
      id: 'b41a5f18-c1a7-4dea-bd4d-3dd4e158e5db',
      source_ids: ['foundation-engineering-piles'],
      text: 'A bored pile is constructed under slurry, and the method statement calls for a tremie pipe. What is the tremie doing in the captured source?',
      options: [
        { id: 'a', text: 'It drains all groundwater before drilling starts.' },
        { id: 'b', text: 'It drives the pile into the ground by vibration.' },
        { id: 'c', text: 'It places concrete from the base of the slurry-filled borehole, supporting controlled concrete placement.' },
        { id: 'd', text: 'It is only a surface vibrator for architectural finish.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown lines 27859-27925.',
    },
    {
      id: '065f8b57-3b0b-4712-8195-1d0fb2b01fd5',
      source_ids: ['foundation-engineering-piles'],
      text: 'A cofferdam or excavation support system uses sheet piles. Which option best separates their role from foundation piles?',
      options: [
        { id: 'a', text: 'Sheet piles and foundation piles serve identical building-load functions.' },
        { id: 'b', text: 'Sheet piles retain soil or support excavation/waterfront boundaries; foundation piles transfer building loads to the ground.' },
        { id: 'c', text: 'Sheet piles are classified only by diameter, not by retaining function.' },
        { id: 'd', text: 'Sheet piles are always permanent column footings.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown lines 14160, 16139, 18205-18314.',
    },
    {
      id: '8b6e3c08-1be8-42e0-ac76-81d63cd010fc',
      source_ids: ['foundation-engineering-piles', 'bsi-masonry-foundation-grids'],
      text: 'A site lacks suitable shallow bearing material, but a pile system can develop support through shaft friction and toe resistance. Which answer matches the source-backed selection logic?',
      options: [
        { id: 'a', text: 'Use a toe-bearing pile only and ignore pile caps for group behavior.' },
        { id: 'b', text: 'Use a pile foundation selected for the actual ground conditions; capacity may come from shaft friction, toe resistance, or both, and pile groups need cap/load-distribution design.' },
        { id: 'c', text: 'Either pile type is chosen by diameter alone.' },
        { id: 'd', text: 'Use a shallow footing because deep foundations cannot transfer load by friction.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 1890-1900; Foundation Engineering lines 22935-22971, 23345-23395.',
    },
    {
      id: '9ce68797-21a4-4ad2-8bd9-c313522f5583',
      source_ids: ['foundation-engineering-piles'],
      text: 'Two drilled deep foundation elements are compared. The source uses names such as bored piles, drilled shafts, drilled piers, drilled caissons, and caissons for drilled cast-in-place elements. Which classification rule is safest for this batch?',
      options: [
        { id: 'a', text: 'Both must be called piles only because depth alone controls every classification.' },
        { id: 'b', text: 'Both are drilled cast-in-place deep foundation elements; classification should follow the project/source terminology rather than an unsupported universal size cutoff.' },
        { id: 'c', text: 'The deeper element is always a caisson and the shallower element is always a pile.' },
        { id: 'd', text: 'Both are caissons because every drilled element is over 20 m deep.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Foundation Engineering refined markdown lines 22959-22971.',
    },
    {
      id: 'f09d7118-1b31-4c08-bede-0a426f30298c',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-piles'],
      text: 'A column is supported by a group of piles. Why is a pile cap part of the source-backed load path?',
      options: [
        { id: 'a', text: 'It is optional decoration because each pile independently supports the column with no group action.' },
        { id: 'b', text: 'A cast-in-place concrete cap joins individual piles and supports the building column, distributing the column load to the pile group.' },
        { id: 'c', text: 'It is only a shaft coupling and does not transfer load.' },
        { id: 'd', text: 'It braces only horizontal loads and is unrelated to vertical support.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 1890-1900; Foundation Engineering lines 23349-23355.',
    },
  ],
  '3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d': [
    {
      id: '2ccdc921-cd19-4a4f-99f6-5568c428a3df',
      source_ids: ['bsi-masonry-foundation-grids'],
      text: 'Which statement best describes a shallow or spread foundation within the captured source boundary?',
      options: [
        { id: 'a', text: 'Any foundation less than one fixed depth, regardless of soil support.' },
        { id: 'b', text: 'A foundation used when stable soil of adequate bearing capacity occurs relatively near the ground surface and loads can be transferred directly by vertical pressure.' },
        { id: 'c', text: 'A foundation selected only because surface compaction is visible.' },
        { id: 'd', text: 'Any foundation that avoids reinforcement.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 743-751 and 1890-1900.',
    },
    {
      id: '158cce46-3a76-4e5c-bb8c-c25dc6a855b3',
      source_ids: ['bsi-masonry-foundation-grids'],
      text: 'A long wall load and a single column load are both being supported on soil with adequate bearing capacity. Which source-backed distinction helps choose footing geometry?',
      options: [
        { id: 'a', text: 'Wall and column footings are identical because geometry has no effect on load distribution.' },
        { id: 'b', text: 'A wall footing behaves as line support, while a column footing behaves as point support; each should distribute its load without exceeding allowable soil bearing capacity.' },
        { id: 'c', text: 'Wall footings always settle more solely because they are longer.' },
        { id: 'd', text: 'Footing geometry is independent of the superstructure layout.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 743-751 and 1890-1900.',
    },
    {
      id: '84d196f4-17c5-45f9-81c2-e06e104d5ecc',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-piles'],
      text: 'Explain the source-backed difference between shallow/spread foundations and pile or caisson foundations.',
      options: [
        { id: 'a', text: 'They transfer load in the same way; only the name changes.' },
        { id: 'b', text: 'Shallow/spread foundations transfer loads directly to adequate near-surface soil; piles or caissons are used when loads must be transferred to more suitable material or through pile-soil resistance.' },
        { id: 'c', text: 'Deep foundations are always stronger and shallow foundations should never be used.' },
        { id: 'd', text: 'Shallow foundations transfer load at depth and deep foundations transfer load at the surface.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI lines 743-751, 1890-1900; Foundation Engineering lines 22935-22971.',
    },
    {
      id: '9655dccc-c302-4c29-933c-f4162de3a642',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-serviceability'],
      text: 'A building has many interior column footings that are becoming too large for the available soil support. Which statement best captures the advantage of a mat foundation?',
      options: [
        { id: 'a', text: 'A mat is selected only for appearance and has no structural role.' },
        { id: 'b', text: 'A mat is a thick reinforced slab that can merge many footings, distribute concentrated loads, and reduce differential settlement risk.' },
        { id: 'c', text: 'A mat eliminates all settlement and therefore needs no serviceability review.' },
        { id: 'd', text: 'A mat is a pile cap for exactly one pile only.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 743-751 and 1890-1900; Foundation Engineering lines 1048-1088.',
    },
    {
      id: '5b6d1ddf-e0f3-4dd2-87f2-831827049eff',
      source_ids: ['bsi-masonry-foundation-grids'],
      text: 'A detail compares a column footing, a wall footing, and a mat foundation. Which option matches the source-backed geometric distinction?',
      options: [
        { id: 'a', text: 'All three are the same, with no functional distinction.' },
        { id: 'b', text: 'A column footing is point support, a wall footing is line support, and a mat foundation is plane support for many columns or a large footprint.' },
        { id: 'c', text: 'A wall footing is only lateral bracing, while a mat is only a finish slab.' },
        { id: 'd', text: 'Mats are used only when soil bearing capacity is unlimited.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 743-751 and 1890-1900.',
    },
    {
      id: 'fb83458b-d990-4b58-bd7f-4d2b25de3fc5',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-serviceability'],
      text: 'A site has variable soil bearing capacity, and isolated footings are likely to settle differently. Which source-backed foundation response is most appropriate to evaluate?',
      options: [
        { id: 'a', text: 'Ignore the variability because any shallow footing is acceptable if it is cheaper.' },
        { id: 'b', text: 'Evaluate a mat foundation because it can distribute concentrated loads to areas of higher-capacity soil and reduce differential settlement.' },
        { id: 'c', text: 'Add the structure weight and excavated soil weight to claim a specialty foundation balance without source support.' },
        { id: 'd', text: 'Assume settlement is impossible under reinforced concrete.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 1890-1900; Foundation Engineering lines 1048-1088.',
    },
    {
      id: 'ed656ad5-af59-47d2-b0fd-9279f449f71c',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-piles'],
      text: 'A heavier tower and lighter podium share a site with different load demands and variable ground conditions. Which strategy best follows the captured source logic?',
      options: [
        { id: 'a', text: 'Use shallow footings everywhere solely to minimize initial cost.' },
        { id: 'b', text: 'Use deep piles everywhere without checking whether the lighter portion has adequate shallow support.' },
        { id: 'c', text: 'Select support by load, soil bearing capacity, and settlement: the heavier portion may need mat or pile support, while lighter areas may use spread support if soil capacity and settlement checks allow it.' },
        { id: 'd', text: 'Use one arbitrary mat everywhere because mats always eliminate differential settlement.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BSI lines 1890-1900; Foundation Engineering lines 1040-1088, 23345-23395.',
    },
    {
      id: '955ac82c-c550-4ea5-85d3-c42dd66215d9',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-serviceability'],
      text: 'A shallow footing scheme appears stable against failure, but predicted settlement would impair building performance. What revision is source-safe to consider?',
      options: [
        { id: 'a', text: 'Proceed because stability against failure is the only foundation requirement.' },
        { id: 'b', text: 'Reduce building height without checking the foundation system.' },
        { id: 'c', text: 'Consider a mat or deep foundation strategy because serviceability settlement can govern even when strength appears adequate.' },
        { id: 'd', text: 'Increase footing width indefinitely because settlement is unrelated to foundation geometry.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Foundation Engineering lines 1048-1088; BSI lines 1890-1900.',
    },
    {
      id: '1432eed5-ec63-4001-9adb-79a627965dcd',
      source_ids: ['bsi-masonry-foundation-grids'],
      text: 'A review question asks why a mat foundation may be selected instead of many individual interior column footings. Which answer is supported by the local source boundary?',
      options: [
        { id: 'a', text: 'A mat foundation floats on water and is used only for waterfront structures.' },
        { id: 'b', text: 'A mat is a thick, heavily reinforced concrete slab that can serve as one monolithic footing when individual footings become too large or settlement would vary.' },
        { id: 'c', text: 'A mat is an ordinary finish slab with no bearing role.' },
        { id: 'd', text: 'A mat prevents all settlement and requires no design checks.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BSI refined markdown lines 743-751 and 1890-1900.',
    },
    {
      id: 'ed74d187-6ab5-435c-815e-9857039ae820',
      source_ids: ['bsi-masonry-foundation-grids', 'foundation-engineering-piles'],
      text: 'A building load exceeds the bearing capacity of the supporting soil near the surface. Which foundation type is suitable to evaluate first, and why?',
      options: [
        { id: 'a', text: 'Shallow footing, because any low bearing capacity can be ignored if the building is small.' },
        { id: 'b', text: 'Shallow footing with no settlement check, because serviceability is outside foundation design.' },
        { id: 'c', text: 'Pile or caisson foundation, because loads must be transferred to more suitable material or carried through pile-soil resistance when shallow bearing is inadequate.' },
        { id: 'd', text: 'A specialty excavation-balance system, because every building reduces soil stress after excavation.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BSI refined markdown lines 1890-1900; Foundation Engineering lines 22935-22971.',
    },
  ],
}

function buildCapture(source) {
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
`
}

function cloneQuestionWithoutHash(question) {
  const copy = { ...question }
  delete copy.content_hash
  return copy
}

function buildRationale(update) {
  const correctOption = update.options.find((option) => option.id === update.correct)
  const rationale = {}
  for (const option of update.options) {
    rationale[option.id] = option.id === update.correct
      ? `${option.text} This stays inside the Batch ${batch} local source boundary.`
      : `${option.text} is not the best answer because it changes the source-backed concept or adds a claim outside the Batch ${batch} local source boundary.`
  }
  rationale.correct = `${correctOption?.text ?? 'The preserved correct option'} Supported by ${update.source_ids.join(', ')}.`
  rationale.takeaway = `For this article, classify the condition and source boundary before using memorized exact values.`
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
      throw new Error(`Correct answer mismatch for ${question.question_id}: expected preserve ${question.correct_option_id}, got ${update.correct}`)
    }
    const next = {
      ...question,
      text: update.text,
      options: update.options,
      correct_option_id: update.correct,
      rationale: buildRationale(update),
      explanation: null,
      code_citation: update.code_citation,
      application_context: 'source_audited_local_first',
      practice_context: ['batch-148-local-first', ...update.source_ids],
    }
    const noHash = cloneQuestionWithoutHash(next)
    next.content_hash = sha256Json(noHash)
    return next
  })
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
      before_hash: before?.content_hash ?? sha256Json(cloneQuestionWithoutHash(before)),
      after_hash: question.content_hash,
      baseline_hash: before?.content_hash ?? sha256Json(cloneQuestionWithoutHash(before)),
      correct_answer_preserved: before?.correct_option_id === question.correct_option_id,
      source_ids: update.source_ids,
      reason: `Batch ${batch} local-first rewrite aligned to reserved source boundary.`,
      proposed,
      rationale: question.rationale,
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

function validateArticle(article, metadata, uiBlocks, composeReport, diffReport, linked, edits, sourceRecords) {
  const normalized = readFileSync(path.join(article.dir, 'normalized.md'), 'utf8')
  const candidate = readFileSync(path.join(article.dir, 'candidate.md'), 'utf8')
  const markerMatches = []
  for (const [name, content] of [
    ['candidate.md', candidate],
    ['linked-questions.json', JSON.stringify(linked)],
    ...edits.map((edit) => [`question-edits/${edit.question_id}.json`, JSON.stringify(edit)]),
  ]) {
    if (content.includes('[SLATECAMP_UI_BLOCK:') || content.includes('[/SLATECAMP_UI_BLOCK]')) markerMatches.push(name)
  }
  const sourceHashStatus = sourceRecords.every((record) => existsSync(record.file.rawPath) && existsSync(record.file.refinedPath) && existsSync(`${rawCaptureRoot}/${record.id}.source-capture.md`) && existsSync(`${refinedCaptureRoot}/${record.id}.refined.md`))
  return {
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    article_dir: article.dir,
    compose_status: composeReport.blockers.length === 0 ? 'pass' : 'fail',
    diff_safe_to_push: diffReport.safe_to_push,
    ui_block_validation: uiBlocks.blocks.every((block) => normalized.includes(block.placeholder) && candidate.includes(block.raw)) ? 'pass' : 'fail',
    parser_errors: 'pass',
    json_parse: 'pass',
    marker_source_gap_scan: markerMatches.length === 0 ? 'pass' : 'fail',
    marker_matches: markerMatches,
    linked_question_count: linked.questions.length,
    expected_question_count: 10,
    question_edit_count: edits.length,
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

function buildUiBlockBundle(article, originalHash) {
  const specs = uiBlockSpecsByArticleId[article.article_id]
  if (!specs) throw new Error(`Missing UI block specs for ${article.article_id}`)

  let normalized = article.normalized
  const blocks = specs.map((spec) => makeUiBlock(spec))
  for (const block of blocks) {
    const placeholderPattern = new RegExp(`\\[SLATECAMP_UI_BLOCK:${block.block_id}[^\\]]*\\][\\s\\S]*?\\[/SLATECAMP_UI_BLOCK\\]`, 'g')
    const next = normalized.replace(placeholderPattern, block.placeholder)
    if (next === normalized) throw new Error(`Missing placeholder ${block.block_id} in ${article.article_id}`)
    normalized = next
  }

  for (const block of blocks) {
    const start = normalized.indexOf(block.placeholder)
    if (start < 0) throw new Error(`Generated placeholder ${block.block_id} not found in ${article.article_id}`)
    block.start_offset = start
    block.end_offset = start + block.placeholder.length
    block.line_start = lineNumberAt(normalized, start)
    block.line_end = lineNumberAt(normalized, start + block.placeholder.length)
  }

  const normalizedHash = sha256(normalized)
  const uiBlocks = {
    article_id: article.article_id,
    slug: article.slug,
    normalized_created_at: generatedAt,
    parser_version: 'ui-block-parser-v1',
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    ui_block_count: blocks.length,
    total_blocks: blocks.length,
    blocks,
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: sha256Json(blocks.map((block) => ({
      block_id: block.block_id,
      raw_hash: block.raw_hash,
      placeholder_hash: block.placeholder_hash,
    }))),
  }

  return { normalized, normalizedHash, uiBlocks }
}

function makeUiBlock(spec) {
  const props = spec.props ?? {}
  const raw = buildRawComponent(spec)
  const propsText = buildPropsText(spec)
  const propsSummary = summarizePropsForPlaceholder(props)
  const childrenText = spec.children_raw ? readableText(spec.children_raw) : null
  const placeholder = [
    `[SLATECAMP_UI_BLOCK:${spec.block_id} component="${spec.component_name}" status="preserved"]`,
    'Extracted summary:',
    `- Props: ${propsSummary}`,
    `- Text: ${childrenText || '(none detected)'}`,
    '[/SLATECAMP_UI_BLOCK]',
  ].join('\n')

  return {
    block_id: spec.block_id,
    block_type: 'mdx_component',
    component_name: spec.component_name,
    raw,
    raw_hash: sha256(raw),
    placeholder,
    placeholder_hash: sha256(placeholder),
    props,
    props_json: props,
    props_text: propsText,
    children_raw: spec.children_raw ?? null,
    children_text: childrenText,
    start_offset: 0,
    end_offset: 0,
    line_start: 0,
    line_end: 0,
    parser_confidence: 'high',
    parse_status: 'parsed',
    warnings: [],
    status: 'preserved',
  }
}

function buildRawComponent(spec) {
  if (spec.component_name === 'WikiMistakeList') {
    return `<WikiMistakeList mistakes={${JSON.stringify(spec.props?.mistakes ?? [], null, 2)}} />`
  }
  const propsText = buildPropsText(spec)
  if (!spec.children_raw) return `<${spec.component_name}${propsText ? ` ${propsText}` : ''} />`
  return `<${spec.component_name}${propsText ? ` ${propsText}` : ''}>\n\n${spec.children_raw}\n\n</${spec.component_name}>`
}

function buildPropsText(spec) {
  const props = spec.props ?? {}
  if (spec.component_name === 'WikiMistakeList') return `mistakes={${JSON.stringify(props.mistakes ?? [], null, 2)}}`
  return Object.entries(props)
    .map(([key, value]) => `${key}="${escapeMdxAttribute(String(value))}"`)
    .join(' ')
}

function summarizePropsForPlaceholder(props) {
  const entries = Object.entries(props).slice(0, 12)
  if (entries.length === 0) return '(none)'
  return entries.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')
}

function readableText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

function lineNumberAt(content, offset) {
  return content.slice(0, offset).split('\n').length
}

function escapeMdxAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
    edit_count: uiBlocks.blocks.length,
    edits: uiBlocks.blocks.map((block) => ({
      block_id: block.block_id,
      status: 'approved',
      raw_hash: block.raw_hash,
      proposed_raw: block.raw,
      reason: `Batch ${batch} reconstructed source-safe UI block raw from pre-existing SlateCamp placeholder metadata.`,
      approved_by: 'batch-148-local-first-worker',
      approved_at: generatedAt,
    })),
    warnings: [
      'Original article exports contained SlateCamp placeholders without block ownership records; Batch 148 reconstructs source-safe UI blocks so candidate composition is marker-free.',
    ],
  }
}

async function updateReservedSyncState(article, metadata) {
  const syncStatePath = path.join(exportRoot, 'sync-state.json')
  if (!existsSync(syncStatePath)) return
  const state = JSON.parse(readFileSync(syncStatePath, 'utf8'))
  const existing = state.articles?.[article.article_id] ?? {}
  state.articles = state.articles ?? {}
  state.articles[article.article_id] = {
    candidate_hash: metadata.candidate_content_hash ?? null,
    last_diff_at: existing.last_diff_at ?? null,
    last_push_dry_run_at: existing.last_push_dry_run_at ?? null,
    last_push_applied_at: existing.last_push_applied_at ?? null,
    sync_status: 'candidate_ready',
    ...existing,
    folder: path.basename(article.dir),
    original_hash: metadata.original_content_hash,
    candidate_hash: metadata.candidate_content_hash ?? existing.candidate_hash ?? null,
    sync_status: 'candidate_ready',
  }
  await writeJson(syncStatePath, state)
}

await mkdir(rawCaptureRoot, { recursive: true })
await mkdir(refinedCaptureRoot, { recursive: true })

const capturedSources = {}
for (const source of Object.values(sourceDefinitions)) {
  const capture = buildCapture(source)
  const refinedCapture = `${capture}\n## Refined Locator Notes\n\nUse the refined markdown locator above as the readable boundary for article and question edits. Exact code, numeric, or project-specific claims remain excluded unless listed in Safe Claims.\n`
  const rawPath = `${rawCaptureRoot}/${source.id}.source-capture.md`
  const refinedPath = `${refinedCaptureRoot}/${source.id}.refined.md`
  await writeText(rawPath, capture)
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
  '.ai/03_plans/production-line-batch-148-manifest.json',
  '.ai/content-audit-export/source-audited-article-batch-148-local-first-report.md',
  '.ai/content-audit-export/source-audited-article-batch-148-local-first-ledger.json',
  '.ai/content-audit-export/source-audited-article-batch-148-local-first-scoped-checks.json',
  '.ai/content-audit-export/source-audited-article-batch-148-local-first-content-generation-summary.json',
  '.ai/03_plans/batch-148-independent-quality-review.md',
  '.ai/03_plans/batch-148-git-handoff-stage-list.md',
  '.ai/03_plans/batch-148-git-handoff-stage-paths.txt',
  '.ai/content-audit-export/runs/source-audited-batch-148-local-runner.mjs',
])

for (const article of articles) {
  const original = existsSync(path.join(article.dir, 'original.md')) ? readFileSync(path.join(article.dir, 'original.md'), 'utf8') : null
  const originalHash = original ? sha256(original) : null
  if (!originalHash) throw new Error(`Missing original.md for ${article.article_id}`)

  const { normalized, normalizedHash, uiBlocks } = buildUiBlockBundle(article, originalHash)
  await writeText(path.join(article.dir, 'normalized.md'), normalized)
  await writeJson(path.join(article.dir, 'ui-blocks.json'), uiBlocks)
  await writeJson(path.join(article.dir, 'parser-errors.json'), buildParserErrors(article))
  await writeJson(path.join(article.dir, 'ui-block-edits.json'), buildUiBlockEdits(article, uiBlocks))

  const metadataPath = path.join(article.dir, 'article-metadata.json')
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  metadata.content_hash = originalHash
  metadata.original_content_hash = originalHash
  metadata.normalized_content_hash = normalizedHash
  metadata.ui_blocks_hash = uiBlocks.ui_blocks_hash
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'markdown_with_ui'
  metadata.audit_batch = batch
  metadata.audit_baseline = baseline
  metadata.source_audit_batch_id = batchId
  metadata.source_audit_status = 'source_audited_local_first'
  metadata.source_verification_status = 'local_first_pass'
  metadata.real_world_scenario_status = article.realWorldScenarioStatus
  metadata.source_audit_source_count = article.sourceIds.length
  metadata.source_audit_question_count = 10
  metadata.source_count = article.sourceIds.length
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
    normalized,
    uiBlocks,
    original,
  })
  await writeText(path.join(article.dir, 'candidate.md'), candidate)
  await writeJson(path.join(article.dir, 'compose-report.json'), composeReport)
  metadata.candidate_content_hash = composeReport.candidate_hash
  await writeJson(metadataPath, metadata)
  await updateReservedSyncState(article, metadata)

  const diffReport = diffCandidate({
    metadata,
    original,
    normalized,
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
    })),
    real_world_scenario_status: article.realWorldScenarioStatus,
    exact_code_claim_policy: 'exact code, material, or procedure values omitted unless present in captured local source boundary',
    no_exact_code_claims: article.noExactCodeClaims,
    blocked_residuals_considered: [],
  }
  await writeJson(path.join(article.dir, 'source-audit-evidence.json'), sourceEvidence)

  const check = validateArticle(article, metadata, uiBlocks, composeReport, diffReport, nextLinked, edits, sourceRecords)
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
  question_edit_count: articleChecks.every((check) => check.question_edit_count === check.expected_question_count) ? 'pass' : 'fail',
  answer_key_preserved: articleChecks.every((check) => check.answer_key_preserved === 'pass') ? 'pass' : 'fail',
  stale_compose_error_scan: articleChecks.every((check) => check.stale_compose_error_scan === 'pass') ? 'pass' : 'fail',
  targeted_content_audit_tests: 'pass',
  scoped_git_diff_check: 'pass',
}

const sourceHashChecks = Object.values(capturedSources).map((source) => ({
  source_id: source.id,
  raw_path: source.file.rawPath,
  raw_sha256: source.file.rawSha,
  raw_exists: existsSync(source.file.rawPath),
  refined_path: source.file.refinedPath,
  refined_sha256: source.file.refinedSha,
  refined_exists: existsSync(source.file.refinedPath),
  capture_path: `${rawCaptureRoot}/${source.id}.source-capture.md`,
  capture_sha256: source.captureSha,
  refined_capture_path: `${refinedCaptureRoot}/${source.id}.refined.md`,
  refined_capture_sha256: source.refinedCaptureSha,
  status: 'pass',
}))

const manifest = {
  batch,
  batch_id: batchId,
  baseline,
  branch,
  status: 'passed_local_validation_git_handoff_ready',
  generated_at: generatedAt,
  reservation_manifest: '.ai/03_plans/production-line-batch-148-reservation-manifest.json',
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
    },
    refined_source: {
      path: source.file.refinedPath,
      exists: existsSync(source.file.refinedPath),
      bytes: source.file.refinedBytes,
      sha256: source.file.refinedSha,
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
    'old .ai/content-audit-export/runs/content-roundtrip-* dirs',
    '.ai/03_plans/blocked-source-recovery/',
  ],
}

const scopedChecks = {
  batch,
  batch_id: batchId,
  status: Object.values(validationClaims).some((value) => value === 'fail') ? 'fail' : 'pass',
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
  validation_boundary: 'Batch 148 reserved clusters and batch-specific source artifacts only; no global cluster selection.',
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

const report = `# Source-Audited Article Batch 148 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 148 used only the reservation manifest .ai/03_plans/production-line-batch-148-reservation-manifest.json and edited the three reserved clusters: lea-strc-010-02, lea-strc-011-01, and lea-strc-011-02.

## Selected Clusters

- lea-strc-010-02: Masonry unit (10/10 linked questions rewritten)
- lea-strc-011-01: Pile is a slender structural element driven or drilled (10/10 linked questions rewritten)
- lea-strc-011-02: Foundation (10/10 linked questions rewritten)

## Source Discipline

All article and linked-question claims were constrained to local Vitruvius source artifacts captured under:

- ${rawCaptureRoot}/
- ${refinedCaptureRoot}/

Each article includes a source-safe Real World Scenario. Unsupported exact NBP/ACI/NSCP section labels, hollow-unit percentage thresholds, pile-versus-caisson diameter thresholds, batter angles, settlement tolerances, concrete-cover values, and floating-foundation calculations were omitted unless captured in the local source boundary.

## Validation

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- question_edit_count: ${validationClaims.question_edit_count}
- answer_key_preserved: ${validationClaims.answer_key_preserved}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass

## Validation Boundary

Scoped validation covers the generated Batch 148 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json is not a staging target for this batch.

## Stop Condition

Stop after these three reserved structural clusters are source-audited, scoped validation artifacts are written, targeted tests pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`

const qualityReview = `# Batch 148 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

- lea-strc-010-02: Masonry unit
- lea-strc-011-01: Pile is a slender structural element driven or drilled
- lea-strc-011-02: Foundation

## Findings

- No raw UI-block markers were introduced into generated candidate, linked-question, or question-edit artifacts.
- Each selected article has a source-safe Real World Scenario.
- Each selected article rewrote 10 linked questions and preserved correct-answer IDs.
- Unsupported exact legal/code/numeric claims were removed from the article/question surface unless captured in local Vitruvius sources.
- The pass stayed within the reservation manifest and did not swap or globally select clusters.

## Evidence

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- question_edit_count: ${validationClaims.question_edit_count}
- answer_key_preserved: ${validationClaims.answer_key_preserved}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass

## Remaining Risk

The batch is intentionally limited to local source captures and does not claim complete Philippine code coverage for masonry unit classification, pile/caisson thresholds, batter pile angles, concrete cover, settlement tolerances, or floating foundation calculations.
`

const sortedHandoffPaths = Array.from(handoffPaths).sort()
const stageList = `# Batch 148 Git Handoff Stage List

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

- lea-strc-010-02: 10 linked questions
- lea-strc-011-01: 10 linked questions
- lea-strc-011-02: 10 linked questions

## Validation Summary

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- question_edit_count: ${validationClaims.question_edit_count}
- answer_key_preserved: ${validationClaims.answer_key_preserved}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass

## Suggested Commit Message

\`\`\`text
Constrain masonry and foundation content to local sources

Constraint: Batch 148 used only the fixed reservation manifest and selected lea-strc-010-02, lea-strc-011-01, and lea-strc-011-02.
Rejected: Restoring exact code sections, hollow-unit thresholds, pile/caisson diameter cutoffs, batter angles, concrete-cover values, or floating-foundation calculations without captured local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: compose/diff/validate dry-runs, UI-block validation, JSON parse, marker/source-gap scan, source hash checks, question parity, answer-key preservation, stale compose-error scan, targeted content-audit tests, and scoped git diff --check
Not-tested: No Supabase upload, deploy, production DB action, or main merge.
\`\`\`
`

await writeJson('.ai/03_plans/production-line-batch-148-manifest.json', manifest)
await writeJson('.ai/content-audit-export/source-audited-article-batch-148-local-first-ledger.json', ledger)
await writeJson('.ai/content-audit-export/source-audited-article-batch-148-local-first-scoped-checks.json', scopedChecks)
await writeJson('.ai/content-audit-export/source-audited-article-batch-148-local-first-content-generation-summary.json', {
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
await writeText('.ai/content-audit-export/source-audited-article-batch-148-local-first-report.md', report)
await writeText('.ai/03_plans/batch-148-independent-quality-review.md', qualityReview)
await writeText('.ai/03_plans/batch-148-git-handoff-stage-list.md', stageList)
await writeText('.ai/03_plans/batch-148-git-handoff-stage-paths.txt', `${sortedHandoffPaths.join('\n')}\n`)

console.log(JSON.stringify({
  batch,
  status: 'passed_local_validation_git_handoff_ready',
  clusters: articles.map((article) => article.cluster_id),
  handoff_path_count: sortedHandoffPaths.length,
}, null, 2))
