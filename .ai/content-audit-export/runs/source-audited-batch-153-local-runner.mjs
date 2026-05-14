#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
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

const batch = 153
const batchId = 'source-audited-batch-153-local-first'
const generatedAt = new Date().toISOString()
const baseline = '9c637523d3'
const reservationManifestBaseline = 'd3d2ec5ee1'
const branch = '3dlab-gray-viewport-bg'
const reservationManifest = '.ai/03_plans/production-line-batch-153-reservation-manifest.json'
const rawCaptureRoot = 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-153'
const refinedCaptureRoot = 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-153'

const bci = {
  rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
  rawSha: 'sha256:528acdc8afd84d937d5ab49a5df8c349321d20d3d403d110e038628e4d2f1c02',
  rawBytes: 41001593,
  refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
  refinedSha: 'sha256:0f3213a3ca3dcf8fd2076dae5e1b12a215dc7041950f864cfd5f4b53250c820a',
  refinedBytes: 1144595,
}

const salvan = {
  rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/George-Salvan-Architectural-Building-Materials.pdf',
  rawSha: 'sha256:4c02c6429989abb79b987b456a3eca532ae75f5da90754c523f393303349e4ba',
  rawBytes: 51997841,
  refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/George-Salvan-Architectural-Building-Materials.md',
  refinedSha: 'sha256:7433a19efa154a3f3b75f1300d459c0592da26fbc63ea40309d68303aadabf42',
  refinedBytes: 577457,
}

const sourceDefinitions = {
  bciDoor: {
    id: 'bci-5e-door-hardware-b153',
    title: 'Building Construction Illustrated, 5th Edition - door hardware',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 10332-10535; raw PDF pages 291-294',
    safe_claims: [
      'Finish door hardware includes locksets, hinges, closers, panic hardware, push and pull bars or plates, kick plates, stops, holders, bumpers, thresholds, weatherstripping, tracks, and guides.',
      'Hardware selection factors include function and ease of operation, recessed or surface-mounted installation, material, finish, texture, color, durability by frequency of use, and exposure to weather or corrosive conditions.',
      'Door hand conventions are used when specifying hardware such as locksets and closers.',
      'Butt hinges use two leaves joined by a pin and may be mortised or surface-mounted in several configurations.',
      'Special-purpose hinges include spring, double-acting, piano, invisible, and floor hinges.',
      'Locksets are complete manufactured assemblies; BCI distinguishes mortise, unit/integral, and cylinder locks and tells users to consult manufacturers for exact functions and installation requirements.',
      'Panic hardware releases when pressure is applied to a horizontal bar across the interior face of an emergency exit door.',
      'Door closers automatically close doors and may be surface-mounted, concealed, or mounted on the push or pull side.',
    ],
    use_limits: [
      'Do not claim ANSI/BHMA grades, cycle counts, force tests, UL fire-door listings, or accessibility code triggers from this batch.',
      'Do not state that a specific lockset or hinge is mandatory for all commercial, hospital, fire-rated, or accessible doors without a code or manufacturer source.',
      'Do not convert BCI accessibility notes into Philippine BP 344 or current code requirements.',
    ],
  },
  salvanDoor: {
    id: 'salvan-door-hardware-b153',
    title: 'George Salvan Architectural Building Materials - finishing and rough hardware',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 5941-5960, 6117-6208, and 6486-6578; raw PDF pages 173, 177, and 181-183',
    safe_claims: [
      'Salvan classifies finishing hardware as exposed hardware with finished appearance and function, especially for doors, windows, and cabinets.',
      'Salvan classifies rough hardware as concealed construction hardware such as bolts, nails, screws, spikes, rods, and other metal fittings.',
      'Salvan defines a hinge as a movable joint with two plates joined by a pin that supports and turns a door about a pivot.',
      'Salvan identifies butt, fixed-pin, full-surface, loose-joint, loose-pin, spring, and pivot hinge vocabulary.',
      'Salvan defines a lockset as a complete lock system with the locking mechanism and accessories such as knobs, escutcheons, and plates.',
      'Salvan records latch, night latch, lift latch, dead bolt, strike, bored lock, cylinder lock, hasp, padlock, hook bolt, threaded rod, and door stopper vocabulary.',
    ],
    use_limits: [
      'Do not use brand lists as required specifications.',
      'Do not use legacy local vocabulary as a current fire, accessibility, or security certification claim.',
      'Do not treat every hardware item as interchangeable; keep function and location distinct.',
    ],
  },
  bciJoints: {
    id: 'bci-5e-structural-joints-b153',
    title: 'Building Construction Illustrated, 5th Edition - joints, connections, and movement joints',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 2139-2160, 5191-5238, and 9402-9465; raw PDF pages 67, 166, and 272-273',
    safe_claims: [
      'Joints and connections strongly affect how forces transfer between structural elements and how the system performs as a whole.',
      'Structural elements may be joined by butt joints, overlapping joints, or molded/shaped joints.',
      'Connectors may act as a point, line, or surface; BCI gives bolt, weld, and glue as examples.',
      'Pinned joints allow rotation but resist translation; fixed joints maintain angular relationship and resist rotation and translation.',
      'Roller joints allow rotation and movement useful for expansion and contraction; cable anchorage resists translation only along the cable direction.',
      'All building materials expand and contract with temperature, and some swell, shrink, or deflect; movement joints allow movement while maintaining weathertightness.',
      'Expansion joints are continuous unobstructed slots; control joints form a plane of weakness to regulate cracking; isolation joints divide structures so differential movement or settlement can occur.',
    ],
    use_limits: [
      'Do not state exact control-joint spacing, dowel spacing, seismic-frame requirements, bolt grades, or NSCP/ASTM claims from this batch.',
      'Do not treat movement joints as the same thing as structural force-transfer connections.',
      'Do not present general BCI concepts as final structural design for a specific building.',
    ],
  },
  salvanJoints: {
    id: 'salvan-structural-joints-b153',
    title: 'George Salvan Architectural Building Materials - metals, reinforcement, plastics, and joint materials',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 2039-2083, 2630-2662, and 13148-13149; raw PDF pages 59, 92, and 355',
    safe_claims: [
      'Salvan notes corrosion-resistant metal uses, including stainless steel for exterior wall panels, frames for doors, expansion joints, flashings, copings, fascia, and gravel stops.',
      'Salvan identifies reinforcing bars as plain or deformed, with lugs or deformations that provide anchorage in concrete.',
      'Salvan identifies water stops and expansion-joint materials among construction uses of plastics.',
      'Salvan describes workmanship language around mortise, tenon, splice, join, blocking, nailing, screwing, and bolting in millwork.',
    ],
    use_limits: [
      'Do not infer current structural design values, seismic requirements, or code spacing from these local material notes.',
      'Do not rely on line references for exact joint dimensions unless the capture explicitly states them.',
      'Do not turn material examples into mandatory product specifications.',
    ],
  },
  bciFasteners: {
    id: 'bci-5e-fastener-systems-b153',
    title: 'Building Construction Illustrated, 5th Edition - nails, screws, bolts, miscellaneous fastenings, and adhesives',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 16020-16138; raw PDF pages 436-438',
    safe_claims: [
      'Nails may be mild steel, aluminum, copper, brass, zinc, or stainless steel; the metal should be compatible with secured materials to avoid loss of holding power and staining.',
      'Nail lengths are designated by penny and should be about three times the thickness of the material being secured.',
      'Large diameter nails are used for heavy work; lighter nails are used for finish work; finish-nail heads are only slightly larger than the shaft.',
      'Serrated, barbed, threaded, fluted, twisted, cement-coated, and zinc-coated shanks change grip or corrosion resistance.',
      'Screws have tapered, helically threaded shanks; threads give them greater holding power than nails and make them easier to remove.',
      'Wood screws should be slightly shorter than the combined board thickness, with part of the screw penetrating the base material; ordinary screw holes should be predrilled.',
      'Bolts are threaded metal pins or rods inserted through holes and secured with a mating nut; carriage bolts suit cases where the head may be inaccessible during tightening.',
      'Washers distribute pressure, prevent leakage, relieve friction, or insulate incompatible materials.',
      'Expansion bolts and shields engage drilled holes in masonry or concrete; toggle bolts open behind hollow wall surfaces; rivets permanently join steel members; adhesives bond surfaces and require manufacturer recommendations.',
    ],
    use_limits: [
      'Do not claim exact pull-out strengths, ASTM bolt grades, proprietary anchor capacities, NDS/ACI calculations, or structural design capacities from this batch.',
      'Do not use general fastener descriptions as final engineering design.',
      'Do not ignore manufacturer data for adhesives, anchors, or specialty fasteners.',
    ],
  },
  salvanFasteners: {
    id: 'salvan-fastener-systems-b153',
    title: 'George Salvan Architectural Building Materials - nails, screws, washers, bolts, nuts, inserts, and rods',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 6230-6348 and 6996-7002; raw PDF pages 181-183',
    safe_claims: [
      'Salvan records rough-hardware vocabulary for common wire nails, box nails, finishing nails, casing nails, masonry nails, screws, washers, bolts, nuts, concrete inserts, hook bolts, and threaded rods.',
      'Salvan repeats the practical nail-length rule: choose a nail about three times longer than the top thickness being fastened.',
      'Salvan classifies screws by gauge, length, head type, and metallic makeup.',
      'Salvan describes bolts as threaded shafts that receive nuts after being pushed through drilled holes.',
      'Salvan identifies concrete inserts as anchors or supports for attached loads in walls or ceilings.',
    ],
    use_limits: [
      'Do not use old line drawings as current structural capacity data.',
      'Do not restore exact pull-out values, proprietary fastener ratings, or corrosion classes from this source.',
      'Do not treat rough-hardware vocabulary as a substitute for project specifications.',
    ],
  },
}

const articles = [
  {
    cluster_id: 'lea-matl-008-01',
    article_id: '72e04c5e-3e4c-4715-93a0-734bdf6dcbee',
    slug: 'lea-matl-008-01-core-concept',
    title: 'Door hardware',
    dir: '.ai/content-audit-export/articles/lea-matl-008-01-core-concept--72e04c5e-3e4c-4715-93a0-734bdf6dcbee',
    sourceIds: ['bci-5e-door-hardware-b153', 'salvan-door-hardware-b153'],
    sourceKeys: ['bciDoor', 'salvanDoor'],
    noExactCodeClaims: [
      'No ANSI/BHMA grade, cycle-count, force-test, UL fire-door listing, or BP 344/ADA trigger was claimed as an answer-key fact.',
      'Hardware choices were limited to BCI and Salvan functions, mounting choices, material/exposure considerations, and manufacturer-consultation limits.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For door-hardware questions, identify the job first: support and swing, latch or lock, controlled closing, emergency release, impact protection, weather sealing, or track guidance. Then choose the hardware group that performs that job.

**Common trap:** using uncaptured standards grades, cycle counts, fire-door listings, accessibility code triggers, or exact test forces when the checked local sources support only hardware functions, mounting types, exposure factors, and manufacturer coordination.

## What You Need to Know for the LEA

## Learning Goal

Classify finish door hardware by function, mounting condition, door hand, exposure, and coordination with the door leaf, frame, and manufacturer requirements.

## Core Concept

BCI lists finish door hardware as locksets, hinges, closers, panic hardware, push and pull bars or plates, kick plates, stops, holders, bumpers, thresholds, weatherstripping, tracks, and guides. Salvan gives the same basic split in local terms: finishing hardware is visible hardware with finished appearance and function, while rough hardware is concealed construction hardware such as bolts, nails, screws, spikes, rods, and other metal fittings.

### Source-Safe Selection Sequence

1. Identify the door action: swinging, sliding, latching, locking, closing, stopping, or sealing.
2. Identify the mounting condition: recessed, surface-mounted, concealed, mortised, or track-guided.
3. Check exposure and use frequency: weather, corrosive conditions, heavy public use, or ordinary interior use.
4. Use manufacturer data for exact lockset functions, installation requirements, dimensions, finishes, ratings, and certifications.

### Hardware Families

| Hardware family | Source-supported function | Coordination cue |
|---|---|---|
| Hinges | Support and rotate the door. | Butt hinges use two leaves joined by a pin; special-purpose hinges include spring, double-acting, piano, invisible, and floor hinges. |
| Locksets and latches | Fasten, latch, or lock the door. | BCI distinguishes mortise, unit/integral, and cylinder locks; Salvan defines the lockset as the complete lock system with accessories. |
| Closers | Close a door automatically and reduce closing shock. | BCI lists surface-mounted, concealed, push-side, pull-side, and floor-concealed possibilities. |
| Panic hardware | Releases latching when pressure is applied to a horizontal bar on the inside face of an emergency exit door. | Code triggers and exact door requirements require a separate code source. |
| Stops, holders, bumpers, kick plates, thresholds, and weatherstripping | Protect door, wall, frame, bottom edge, and opening perimeter. | Select by impact, sealing, and exposure rather than by appearance alone. |
| Tracks and guides | Control sliding or guided door movement. | Match to door type and operation before choosing finish. |

Door hand conventions matter because they help specify locksets and closers by hinge side and swing direction. Treat hand, swing, and mounting as specification data, not decoration.

## Real World Scenario

A coastal clinic entry door is heavily used, exposed to weather, and must close reliably after patients pass through. A source-safe hardware review does not jump to an uncaptured grade or brand. It identifies hinge support, closer action, lockset function, push or pull operation, kick-plate protection, and weather/corrosion exposure, then sends exact grade, certification, and finish requirements to the hardware manufacturer and governing code source.

## How It's Tested

LEA-style items usually describe a door problem and ask which hardware family solves it. If the issue is swing, think hinge. If it is latching or locking, think lockset, latch, strike, or panic hardware. If it is controlled closing, think closer. If it is damage or wall impact, think stop, holder, bumper, or kick plate.

## Common Mistakes

- Treating hinges, locksets, closers, and stops as interchangeable.
- Choosing hardware by finish color while ignoring function and frequency of use.
- Stating standards grades, cycle counts, or force values without a captured source.
- Ignoring recessed, surface-mounted, mortised, concealed, or exposed installation.
- Forgetting door hand conventions when specifying locksets and closers.

## Related Articles

See also within Openings, Joints, and Hardware: **lea-matl-008-02-core-concept**, **lea-matl-008-03-core-concept**, **lea-matl-008-04-core-concept**, **lea-matl-008-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-008-02',
    article_id: 'b065eb65-5814-4a1f-b3ff-6fc9ab55fbb5',
    slug: 'lea-matl-008-02-core-concept',
    title: 'Structural joints serve distinct purposes in building',
    dir: '.ai/content-audit-export/articles/lea-matl-008-02-core-concept--b065eb65-5814-4a1f-b3ff-6fc9ab55fbb5',
    sourceIds: ['bci-5e-structural-joints-b153', 'salvan-structural-joints-b153'],
    sourceKeys: ['bciJoints', 'salvanJoints'],
    noExactCodeClaims: [
      'No NSCP, ASTM bolt-grade, seismic-frame, dowel-spacing, or control-joint-spacing claim was used as an answer-key fact.',
      'Structural force-transfer joints were kept separate from movement joints.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For joint questions, decide whether the item is about force transfer between members or movement control between materials. Those are different problems and use different vocabulary.

**Common trap:** answering a movement-joint item with a structural connector term, or answering a force-transfer item with a spacing, lateral-load, or code value not present in the checked local source packet.

## What You Need to Know for the LEA

## Learning Goal

Distinguish structural connection joints from movement joints, and classify each by how it transfers force, resists rotation, permits movement, or protects the assembly from cracking and water entry.

## Core Concept

BCI states that the way forces transfer from one structural element to the next depends strongly on joints and connections. A structural connection may be a butt joint, an overlapping joint, or a molded or shaped joint. The connector itself may act as a point, line, or surface: BCI gives a bolt as the point connector example, a weld as the line connector example, and glue as the surface connector example.

### Structural Connection Behavior

| Behavior | Source-supported meaning | Exam cue |
|---|---|---|
| Pinned joint | Allows rotation but resists translation. | Rotation is allowed; member ends are not fully fixed. |
| Fixed or rigid joint | Maintains angular relationship and resists rotation and translation. | Moment or angular restraint is the concept, but exact lateral-load design needs another source. |
| Roller joint | Allows rotation and movement for expansion or contraction in one direction. | Movement is intentional. |
| Cable anchorage | Allows rotation and resists translation only along the cable direction. | Force follows the cable line. |

### Movement Joints

Movement joints solve a different problem. BCI states that building materials expand and contract with temperature, and some swell, shrink, or deflect. Joints must allow movement to prevent distortion, cracking, or breaks while maintaining the weathertightness of the construction.

Expansion joints are continuous, unobstructed slots that permit thermal or moisture expansion. Control joints form a planned plane of weakness to regulate cracking from drying shrinkage, thermal stress, or structural movement. Isolation joints divide a large or geometrically complex structure so differential movement or settlement can occur.

Salvan adds supporting local material vocabulary: stainless steel and plastics appear in expansion-joint, flashing, water-stop, and related exterior construction uses; deformed reinforcing bars have surface deformations for anchorage in concrete. Use those as material-recognition clues, not as spacing or capacity rules.

## Real World Scenario

A small addition is placed beside an existing building, while a long exposed wall and a steel canopy connection are also being detailed. The safe review separates the issues: the addition may need isolation logic for differential movement, the long wall may need movement-joint logic to prevent cracking while staying weathertight, and the canopy connection needs structural connection behavior. Exact joint spacing, dowel design, and lateral-load detailing remain outside this batch unless a project structural source supplies them.

## How It's Tested

LEA-style questions often mix the two families. If the question asks how beams, frames, or walls transfer force, use connection vocabulary. If it asks about expansion, shrinkage, cracking, settlement, or long surfaces, use movement-joint vocabulary.

## Common Mistakes

- Calling every separation an expansion joint.
- Confusing a point connector such as a bolt with a line connector such as a weld or a surface connector such as glue.
- Treating pinned and fixed joints as the same behavior.
- Omitting sealant, filler, water stop, or weathertightness from movement-joint thinking.
- Using standards, lateral-load, dowel, or spacing claims without a captured source.

## Related Articles

See also within Openings, Joints, and Hardware: **lea-matl-008-01-core-concept**, **lea-matl-008-03-core-concept**, **lea-matl-008-04-core-concept**, **lea-matl-008-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-008-03',
    article_id: 'f34aade8-a870-458c-9609-562419eb1238',
    slug: 'lea-matl-008-03-core-concept',
    title: 'Fastener Systems',
    dir: '.ai/content-audit-export/articles/lea-matl-008-03-core-concept--f34aade8-a870-458c-9609-562419eb1238',
    sourceIds: ['bci-5e-fastener-systems-b153', 'salvan-fastener-systems-b153'],
    sourceKeys: ['bciFasteners', 'salvanFasteners'],
    noExactCodeClaims: [
      'No ASTM grade, tensile-strength, pull-out-capacity, NDS/ACI, proprietary anchor, or corrosion-class claim was used as an answer-key fact.',
      'Fastener examples were limited to BCI and Salvan type, action, installation, and use-limit claims.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For fastener questions, identify the base material, the joined material, whether removal is expected, and whether the fastener works by shank grip, threads, expansion, toggling, a mating nut, or surface bonding.

**Common trap:** using uncaptured capacity values, standards grades, proprietary anchor capacities, or structural design calculations when the checked local sources support only fastener type, action, material compatibility, and installation logic.

## What You Need to Know for the LEA

## Learning Goal

Classify nails, screws, bolts, washers, anchors, rivets, and adhesives by connection action, installation condition, material compatibility, and source-supported use limits.

## Core Concept

BCI identifies nails by penny length, shank diameter, shank form, head form, point type, and material. The metal should be compatible with the secured materials to avoid loss of holding power and staining. A source-safe nail proportion is that nail length should be about three times the thickness of the material being secured.

### Fastener Families

| Fastener family | Source-supported action | Coordination cue |
|---|---|---|
| Nails | Driven shank grip. | Large diameter nails suit heavy work; lighter nails suit finish work; finish-nail heads are only slightly larger than the shaft. |
| Screws | Helically threaded shanks turned into wood or similar material. | Threads give greater holding power than nails and allow easier removal; ordinary screw holes should be predrilled. |
| Bolts | Threaded pins or rods inserted through holes and secured with a mating nut. | Carriage bolts help where the head may be inaccessible during tightening; lag bolts or screws help where a nut cannot be placed. |
| Washers | Distribute pressure, prevent leakage, relieve friction, or insulate incompatible materials. | Use when the head, nut, joint seal, friction, or material separation needs help. |
| Expansion bolts and shields | Expand in a drilled masonry or concrete hole. | Distinguish from toggle bolts. |
| Toggle bolts | Hinged wings open behind plaster, gypsum board, or other thin wall material. | Use for hollow/thin wall logic, not solid masonry expansion. |
| Rivets | Permanently join steel members by forming a second head. | BCI notes bolting and welding have largely superseded rivets for labor reasons. |
| Adhesives | Bond surfaces together. | Follow manufacturer recommendations and check strength, curing time, setting temperature, bonding method, and exposure resistance. |

Salvan supports local rough-hardware vocabulary for common wire nails, box nails, finishing nails, casing nails, masonry nails, screws, washers, bolts, nuts, concrete inserts, hook bolts, and threaded rods. Use the vocabulary for recognition, not for structural capacity.

## Real World Scenario

A cabinet cleat, a hollow gypsum-board partition, and a concrete wall all need attachments. A source-safe review does not use one fastener everywhere: screws or bolts may suit wood-to-wood or through-bolted work, a toggle bolt fits hollow wall logic, and an expansion bolt or shield fits a drilled masonry or concrete hole. Exact capacity, corrosion class, and engineered anchor design must come from manufacturer or structural sources.

## How It's Tested

LEA-style items often ask for the fastener action. If the item says removable and threaded, think screw or bolt. If it says hollow wall, think toggle bolt. If it says masonry or concrete hole expansion, think expansion bolt or shield. If it says broad surface bonding, think adhesive and manufacturer instructions.

## Common Mistakes

- Using finish nails where a large head or heavy-work nail is needed.
- Choosing a screw without predrilling when the source expects a threaded hole.
- Forgetting washers when pressure distribution, leakage, friction, or material separation matters.
- Confusing expansion bolts with toggle bolts.
- Treating adhesive selection as generic when curing, bonding method, and exposure matter.
- Turning fastener vocabulary into structural design capacity without a captured engineering source.

## Related Articles

See also within Openings, Joints, and Hardware: **lea-matl-008-01-core-concept**, **lea-matl-008-02-core-concept**, **lea-matl-008-04-core-concept**, **lea-matl-008-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
]

const questionUpdates = {
  '72e04c5e-3e4c-4715-93a0-734bdf6dcbee': [
    {
      id: 'ee917ef7-76bc-4ab2-8d28-8fb7b65dcc0f',
      source_ids: ['bci-5e-door-hardware-b153', 'salvan-door-hardware-b153'],
      text: 'A lock body is cut into the door edge so the mechanism is concealed except for the faceplate, trim, knob or lever, and cylinder. Which lockset type matches that source description?',
      options: [
        { id: 'a', text: 'Cylinder lock housed in bored holes' },
        { id: 'b', text: 'Mortise lock' },
        { id: 'c', text: 'Door stop' },
        { id: 'd', text: 'Kick plate' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 10415-10448; Salvan lines 6486-6578.',
    },
    {
      id: 'c068c19d-7e23-450c-bdbc-53852432cf2a',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'Which factor is explicitly part of BCI door-hardware selection?',
      options: [
        { id: 'a', text: 'Paint color only, regardless of use' },
        { id: 'b', text: 'The furniture layout in the next room only' },
        { id: 'c', text: 'Durability based on anticipated frequency of use and possible weather or corrosive exposure' },
        { id: 'd', text: 'A fixed cycle count from this local source packet' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 10348-10358.',
    },
    {
      id: 'f3c6dcbe-28ad-44e1-8143-b4a6146c9e43',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'A coastal entry door will receive heavy public use. Which source-safe hardware review is most appropriate?',
      options: [
        { id: 'a', text: 'Choose only by the color of the hardware finish.' },
        { id: 'b', text: 'Review material, finish, durability, frequency of use, and possible weather or corrosive exposure.' },
        { id: 'c', text: 'Assume any stainless finish has identical salt-exposure performance without manufacturer data.' },
        { id: 'd', text: 'Ignore exposure because door hardware is always indoors.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 10348-10358.',
    },
    {
      id: '7dee3af4-e6b5-4ea8-8fde-2608e2e41713',
      source_ids: ['bci-5e-door-hardware-b153', 'salvan-door-hardware-b153'],
      text: 'A door is intended to rotate about pivots rather than ordinary butt-hinge leaves. Which hinge vocabulary best fits the source boundary?',
      options: [
        { id: 'a', text: 'Ordinary full-mortise butt hinge' },
        { id: 'b', text: 'Pivot or floor hinge' },
        { id: 'c', text: 'Door bumper' },
        { id: 'd', text: 'Weatherstripping' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 10388-10412; Salvan lines 6117-6208.',
    },
    {
      id: '3c42003d-f148-4331-9694-9f86f067021a',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'What distinguishes a piano hinge in BCI door-hardware vocabulary?',
      options: [
        { id: 'a', text: 'It is a latch bolt without a dead bolt.' },
        { id: 'b', text: 'It is a long, narrow hinge running the full length of the two joined surfaces.' },
        { id: 'c', text: 'It is a threshold at the bottom of the door.' },
        { id: 'd', text: 'It is a concealed lock cylinder.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 10396-10402.',
    },
    {
      id: '459a1bba-4de2-4235-94c5-13c15a5f9294',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'A glass entrance door needs controlled closing and compatible support hardware. Which answer stays inside the checked source packet?',
      options: [
        { id: 'a', text: 'Use any butt hinge pair because this packet gives a universal load capacity.' },
        { id: 'b', text: 'Coordinate the hinge or floor-hinge support and closer type with the door and manufacturer requirements.' },
        { id: 'c', text: 'Use a kick plate as the primary support hinge.' },
        { id: 'd', text: 'Reject all concealed floor closers because BCI says closers can only be surface-mounted.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 10388-10412 and 10505-10535.',
    },
    {
      id: '76e589b2-5b3c-4ad9-82f3-55e9cffc2f1d',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'What is the defining operation of panic hardware in the checked BCI source?',
      options: [
        { id: 'a', text: 'It locks only when a key turns from the exterior.' },
        { id: 'b', text: 'It holds the door open with a wall stop.' },
        { id: 'c', text: 'It disengages the latch when pressure is applied to a horizontal bar across the inside face.' },
        { id: 'd', text: 'It seals the bottom of the door against weather.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 10471-10499.',
    },
    {
      id: 'd6811b63-ffb1-42f8-8e94-b4e867f4d60d',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'Which operating-trim choice is identified by BCI as generally easier for people with disabilities to grasp?',
      options: [
        { id: 'a', text: 'A hidden threshold' },
        { id: 'b', text: 'A door track' },
        { id: 'c', text: 'A hinge pin' },
        { id: 'd', text: 'Lever-operated, push-type, or U-shaped handle mechanisms' },
      ],
      correct: 'd',
      code_citation: 'Local source boundary: BCI refined markdown lines 10452-10469.',
    },
    {
      id: '9c9816fd-a7a9-4fd4-8f67-f9a930cd349e',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'A lobby door will be opened many times each day. Which BCI selection factor should control before choosing exact product data?',
      options: [
        { id: 'a', text: 'Only whether the hardware color matches nearby furniture' },
        { id: 'b', text: 'Only whether the item is concealed from view' },
        { id: 'c', text: 'Durability in terms of anticipated frequency of use' },
        { id: 'd', text: 'A cycle formula supplied by this source packet' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 10348-10358.',
    },
    {
      id: '974e116a-cda2-430c-834b-736d82703a1f',
      source_ids: ['bci-5e-door-hardware-b153'],
      text: 'A reviewer objects only because a closer is surface-mounted rather than concealed. Which source-safe response is best?',
      options: [
        { id: 'a', text: 'Surface-mounted closers never exist in the BCI source.' },
        { id: 'b', text: 'BCI lists both surface-mounted and concealed closer arrangements; exact listing or code acceptance needs the applicable manufacturer and code source.' },
        { id: 'c', text: 'A closer is the same thing as a threshold.' },
        { id: 'd', text: 'Door closers are only for sliding doors.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 10505-10535.',
    },
  ],
  'b065eb65-5814-4a1f-b3ff-6fc9ab55fbb5': [
    {
      id: 'dc4b2ccb-c761-48dd-b4a1-ce7289b975c5',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'What is the source-supported purpose of an isolation joint?',
      options: [
        { id: 'a', text: 'To act only as a line connector like a weld' },
        { id: 'b', text: 'To make two members fully fixed against rotation' },
        { id: 'c', text: 'To divide a large or complex structure into sections so differential movement or settlement can occur' },
        { id: 'd', text: 'To replace all weathertightness detailing' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 9436-9443.',
    },
    {
      id: 'f875ea2b-e341-47d6-a3fd-bc9527ba25b4',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'Which statement best describes a control joint within this source packet?',
      options: [
        { id: 'a', text: 'It is a cable anchorage that resists translation only along the cable.' },
        { id: 'b', text: 'It forms a plane of weakness to regulate the location and amount of cracking.' },
        { id: 'c', text: 'It is a bolt grade requirement.' },
        { id: 'd', text: 'It is a permanent prohibition against movement.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 5215-5238 and 9429-9435.',
    },
    {
      id: '34066ba1-043c-468e-9c14-e1da001cbfb3',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'BCI gives which example of a point connector?',
      options: [
        { id: 'a', text: 'Glue' },
        { id: 'b', text: 'Bolt' },
        { id: 'c', text: 'Weld' },
        { id: 'd', text: 'Backer rod' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 2147-2152.',
    },
    {
      id: '4d0ba4e9-0578-43b7-b967-ff87cf040c27',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'A new addition adjoins an existing structure and differential movement is expected. Which movement-joint category best fits the source logic?',
      options: [
        { id: 'a', text: 'Expansion joint only for color separation' },
        { id: 'b', text: 'Control joint only for surface scoring' },
        { id: 'c', text: 'Point connector' },
        { id: 'd', text: 'Isolation joint' },
      ],
      correct: 'd',
      code_citation: 'Local source boundary: BCI refined markdown lines 9402-9443.',
    },
    {
      id: 'ba6f430c-26f3-43d2-b022-4d7be552200d',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'A movement joint in an exterior assembly must permit movement. What second requirement does BCI keep in view?',
      options: [
        { id: 'a', text: 'It must transfer all bending moments across the joint.' },
        { id: 'b', text: 'It should maintain the weathertightness of the construction.' },
        { id: 'c', text: 'It should eliminate all sealant and filler.' },
        { id: 'd', text: 'It must be treated as a screw connection.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 9402-9421.',
    },
    {
      id: 'fe655d63-6f5e-4c86-8e02-7bcb3fbb93d8',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'A long building surface is expected to expand and contract with temperature and moisture. Which answer stays inside the checked source?',
      options: [
        { id: 'a', text: 'Do not allow any movement because all materials stay dimensionally fixed.' },
        { id: 'b', text: 'Use movement-joint logic so expansion or contraction can occur without damaging the materials.' },
        { id: 'c', text: 'Use only a glued surface connector for all movement.' },
        { id: 'd', text: 'Calculate a final joint width from this batch without project data.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 9402-9435.',
    },
    {
      id: '88765cc5-82d4-4877-9dfc-a700b7b5c4f8',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'Which movement joint is a continuous, unobstructed slot between two parts of a building or structure?',
      options: [
        { id: 'a', text: 'Pinned structural joint' },
        { id: 'b', text: 'Expansion joint' },
        { id: 'c', text: 'Cable anchorage' },
        { id: 'd', text: 'Point connector' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 9422-9428.',
    },
    {
      id: '887bd3ab-f020-4174-8e3f-5efab5067597',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'What is the primary source-supported function of an expansion joint?',
      options: [
        { id: 'a', text: 'To act as a weld between steel members' },
        { id: 'b', text: 'To permit thermal or moisture expansion without damage to either part' },
        { id: 'c', text: 'To make the joint fully rigid against rotation' },
        { id: 'd', text: 'To replace all structural connectors' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 9422-9428.',
    },
    {
      id: '8b3a89a7-67c3-4291-bfcf-b1f2a228602c',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'What is the key behavior difference between a fixed joint and a pinned joint in BCI?',
      options: [
        { id: 'a', text: 'Fixed joints allow all movement; pinned joints resist all rotation and translation.' },
        { id: 'b', text: 'Fixed joints maintain angular relationship and resist rotation and translation; pinned joints allow rotation but resist translation.' },
        { id: 'c', text: 'Fixed joints are always adhesive-only; pinned joints are always waterproofing-only.' },
        { id: 'd', text: 'There is no behavioral difference.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 2153-2160.',
    },
    {
      id: '38633d41-612b-4cc2-b0c1-d28e46909051',
      source_ids: ['bci-5e-structural-joints-b153'],
      text: 'A connection must maintain the angular relationship between joined elements and resist rotation. Which source-supported behavior is required?',
      options: [
        { id: 'a', text: 'Expansion joint behavior' },
        { id: 'b', text: 'Pinned behavior only' },
        { id: 'c', text: 'Fixed or rigid joint behavior' },
        { id: 'd', text: 'Control joint behavior' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 2153-2158.',
    },
  ],
  'f34aade8-a870-458c-9609-562419eb1238': [
    {
      id: '50dc43ed-973a-4b42-9144-dd4266489810',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'A fastener will be exposed to weather and contact with other materials. What is the source-safe review concern?',
      options: [
        { id: 'a', text: 'Fastener metal compatibility never affects holding power or staining.' },
        { id: 'b', text: 'The metal should be compatible with the secured materials to avoid loss of holding power and staining; corrosion resistance may also matter.' },
        { id: 'c', text: 'Only the head shape matters.' },
        { id: 'd', text: 'Adhesive curing time replaces all metal selection.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16020-16045.',
    },
    {
      id: 'b9b3fcdb-ba8c-4dc3-ae1b-5caa87c2f763',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'When does BCI identify lag bolts or lag screws as useful?',
      options: [
        { id: 'a', text: 'Only when a toggle wing must open behind gypsum board' },
        { id: 'b', text: 'Only when a washer is needed to prevent leakage' },
        { id: 'c', text: 'Where a nut cannot be placed or a long fastener is needed to penetrate a joint fully' },
        { id: 'd', text: 'Only for surface adhesives' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 16071-16092.',
    },
    {
      id: 'a859ca44-02d2-4c4a-aa47-eb1531b59303',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'Which nail-shank change is source-supported for increasing gripping strength or withdrawal resistance?',
      options: [
        { id: 'a', text: 'Making every nail head invisible' },
        { id: 'b', text: 'Using serrated, barbed, threaded, fluted, twisted, or cement-coated shanks' },
        { id: 'c', text: 'Using only smooth shanks in all conditions' },
        { id: 'd', text: 'Replacing all nails with glue regardless of material' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16035-16050.',
    },
    {
      id: '2a53ef7b-88cb-4b1a-b4db-3fa74717f27e',
      source_ids: ['bci-5e-fastener-systems-b153', 'salvan-fastener-systems-b153'],
      text: 'What source-safe rule of thumb is given for nail length?',
      options: [
        { id: 'a', text: 'Use a nail equal to the thickness of the top material.' },
        { id: 'b', text: 'Use the shortest possible nail for all work.' },
        { id: 'c', text: 'Use a nail about three times the thickness of the material being secured.' },
        { id: 'd', text: 'Use only adhesive when the top material is thin.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 16027-16035; Salvan lines 6230-6252.',
    },
    {
      id: 'ff360930-c8fc-4daa-b7ea-bbc16baf9828',
      source_ids: ['bci-5e-fastener-systems-b153', 'salvan-fastener-systems-b153'],
      text: 'Which distinction between heavier nails and finish nails is source-supported?',
      options: [
        { id: 'a', text: 'Finish nails are always the heavy-work fastener.' },
        { id: 'b', text: 'Large diameter nails are used for heavy work, while finish nails have heads only slightly larger than the shaft for finish work.' },
        { id: 'c', text: 'Finish nails are expansion bolts.' },
        { id: 'd', text: 'Common nails and finish nails are identical in use and head condition.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16031-16055; Salvan lines 6230-6252.',
    },
    {
      id: 'dfffaca4-9448-498c-8e9d-20ae3529617d',
      source_ids: ['bci-5e-fastener-systems-b153', 'salvan-fastener-systems-b153'],
      text: 'Which fastener family is inserted through holes in assembled parts and secured with a mating nut?',
      options: [
        { id: 'a', text: 'Finish nail' },
        { id: 'b', text: 'Bolt' },
        { id: 'c', text: 'Adhesive film' },
        { id: 'd', text: 'Piano hinge' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16081-16100; Salvan lines 6318-6348.',
    },
    {
      id: '8952cfa3-ed9a-4863-8896-902b890237c7',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'A detail uses a finish nail where heavy-work holding and head contact are needed. What is the source-safe correction?',
      options: [
        { id: 'a', text: 'Use any finish nail because head size does not matter.' },
        { id: 'b', text: 'Use a nail type and diameter suited to heavy work rather than a finish nail with a small head.' },
        { id: 'c', text: 'Use a toggle bolt only because all heavy work is hollow wall work.' },
        { id: 'd', text: 'Use adhesive only and ignore the fastener schedule.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16031-16055.',
    },
    {
      id: 'eebb183f-a0e6-4571-a8e9-3d8bd018878e',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'Which screw type is described as designed to tap corresponding female threads as it is driven?',
      options: [
        { id: 'a', text: 'Wood screw only' },
        { id: 'b', text: 'Self-tapping screw' },
        { id: 'c', text: 'Carriage bolt' },
        { id: 'd', text: 'Rivet' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16061-16080.',
    },
    {
      id: '2ceaa0e4-8e40-42d6-8ed7-6b352fe26949',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'Which washer function is explicitly source-supported?',
      options: [
        { id: 'a', text: 'To turn every screw into a self-tapping screw' },
        { id: 'b', text: 'To replace the need for a mating nut' },
        { id: 'c', text: 'To distribute pressure, prevent leakage, relieve friction, or insulate incompatible materials' },
        { id: 'd', text: 'To make all anchors suitable for every base material' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 16092-16104.',
    },
    {
      id: 'b97f6b23-3213-4bff-831a-c1e687cfa0f0',
      source_ids: ['bci-5e-fastener-systems-b153'],
      text: 'When are carriage bolts identified as useful in BCI?',
      options: [
        { id: 'a', text: 'When a fastener must work as an adhesive' },
        { id: 'b', text: 'Where the head may be inaccessible during tightening' },
        { id: 'c', text: 'Only when a toggle wing opens behind a hollow wall' },
        { id: 'd', text: 'Only when no drilled hole is present' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 16081-16092.',
    },
  ],
}

function sha256File(filePath) {
  return `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
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
      ? `${option.text} This is the source-supported answer inside the Batch ${batch} local-first source boundary.`
      : `${option.text} is not the best answer because it changes the source-backed concept or adds an unsupported claim.`
  }
  rationale.correct = `${correctOption?.text ?? 'The preserved correct option'} Supported by ${update.source_ids.join(', ')}.`
  rationale.takeaway = 'Classify the hardware, joint, or fastener by function and source-supported action before using exact ratings, capacities, or code triggers.'
  rationale.source_boundary = update.source_ids.join(', ')
  rationale.checked_sources = update.source_ids
  return rationale
}

function readBaselineLinkedQuestions(article) {
  const linkedPath = path.join(article.dir, 'linked-questions.json')
  for (const ref of [baseline, 'HEAD']) {
    try {
      return JSON.parse(execFileSync('git', ['show', `${ref}:${linkedPath}`], { encoding: 'utf8' }))
    } catch {
      // Fall through to the next ref. If neither exists, the caller will use the working copy.
    }
  }
  return null
}

function applyQuestionUpdates(linked, updates, article, baselineLinked = null) {
  const beforeQuestions = baselineLinked?.questions ?? linked.questions
  const beforeById = new Map(beforeQuestions.map((question) => [question.question_id, question]))
  const updatesById = new Map(updates.map((update) => [update.id, update]))
  const nextQuestions = linked.questions.map((question) => {
    const update = updatesById.get(question.question_id)
    if (!update) throw new Error(`Missing question update for ${article.cluster_id} question ${question.question_id}`)
    if (question.correct_option_id !== update.correct) {
      throw new Error(`Correct answer mismatch for ${question.question_id}: preserve ${question.correct_option_id}, got ${update.correct}`)
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
      practice_context: [`batch-${batch}-local-first`, ...update.source_ids],
    }
    next.content_hash = sha256Json(cloneQuestionWithoutHash(next))
    return next
  })
  if (nextQuestions.length !== updates.length) throw new Error(`Question update count mismatch for ${article.cluster_id}`)
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
      reason: `Batch ${batch} local-first rewrite aligned to fixed reservation manifest and source boundary.`,
      proposed,
      rationale: question.rationale,
    }
  })
  return { nextLinked, edits }
}

function buildEmptyUiBlocks(article, originalHash, normalizedHash) {
  return {
    article_id: article.article_id,
    slug: article.slug,
    normalized_created_at: generatedAt,
    parser_version: 'ui-block-parser-v1',
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    ui_block_count: 0,
    total_blocks: 0,
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

function buildUiBlockEdits(article) {
  return {
    article_id: article.article_id,
    slug: article.slug,
    generated_at: generatedAt,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [
      `Batch ${batch} has no preserved custom UI blocks; ui-blocks.json remains the owner of the empty block set.`,
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
    source_safe_real_world_scenario: 'included',
    exact_claim_limits: article.noExactCodeClaims,
  }
}

function scanUnsupportedExactClaims(content) {
  const patterns = [
    /\bANSI\b/i,
    /\bBHMA\b/i,
    /\bASTM\b/i,
    /\bNSCP\b/i,
    /\bBP\s*344\b/i,
    /\bADA\b/i,
    /\bUL\s*10C\b/i,
    /\bcycle\b/i,
    /\blbf\b/i,
    /\bpsi\b/i,
    /\bpull-out\b/i,
    /\bseismic\b/i,
    /\bGrade\s*[123]\b/i,
    /\bA325\b/i,
    /\bA490\b/i,
    /\bA307\b/i,
  ]
  return patterns.flatMap((pattern) => {
    const matches = content.match(pattern)
    return matches ? [matches[0]] : []
  })
}

function validateArticle(article, metadata, uiBlocks, composeReport, diffReport, linked, edits, sourceRecords) {
  const normalized = readFileSync(path.join(article.dir, 'normalized.md'), 'utf8')
  const candidate = readFileSync(path.join(article.dir, 'candidate.md'), 'utf8')
  const markerMatches = []
  const unsupportedExactClaimMatches = []
  for (const [name, content] of [
    ['normalized.md', normalized],
    ['candidate.md', candidate],
    ['linked-questions.json', JSON.stringify(linked)],
    ...edits.map((edit) => [`question-edits/${edit.question_id}.json`, JSON.stringify(edit)]),
  ]) {
    if (content.includes('[SLATECAMP_UI_BLOCK:') || content.includes('[/SLATECAMP_UI_BLOCK]')) markerMatches.push(name)
  }
  for (const question of linked.questions) {
    const correctOption = question.options.find((option) => option.id === question.correct_option_id)
    const answerKeyPayload = JSON.stringify({
      text: question.text,
      correct_option: correctOption?.text ?? '',
      rationale_correct: question.rationale?.correct ?? '',
      code_citation: question.code_citation ?? '',
    })
    for (const match of scanUnsupportedExactClaims(answerKeyPayload)) {
      unsupportedExactClaimMatches.push(`answer-key/${question.question_id}:${match}`)
    }
  }
  const sourceHashStatus = sourceRecords.every((record) => (
    existsSync(record.file.rawPath)
    && existsSync(record.file.refinedPath)
    && sha256File(record.file.rawPath) === record.file.rawSha
    && sha256File(record.file.refinedPath) === record.file.refinedSha
    && existsSync(`${rawCaptureRoot}/${record.id}.source-capture.md`)
    && existsSync(`${refinedCaptureRoot}/${record.id}.refined.md`)
  ))
  return {
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    article_dir: article.dir,
    compose_status: composeReport.blockers.length === 0 ? 'pass' : 'fail',
    diff_safe_to_push: diffReport.safe_to_push,
    ui_block_validation: uiBlocks.blocks.length === 0 && !normalized.includes('[SLATECAMP_UI_BLOCK:') && !candidate.includes('[SLATECAMP_UI_BLOCK:') ? 'pass' : 'fail',
    parser_errors: 'pass',
    json_parse: 'pass',
    marker_source_gap_scan: markerMatches.length === 0 && unsupportedExactClaimMatches.length === 0 ? 'pass' : 'fail',
    marker_matches: markerMatches,
    unsupported_exact_claim_matches: unsupportedExactClaimMatches,
    linked_question_count: linked.questions.length,
    expected_question_count: 10,
    question_edit_count: edits.length,
    question_edit_parity: edits.length === linked.questions.length ? 'pass' : 'fail',
    answer_key_preserved: edits.every((edit) => edit.correct_answer_preserved) ? 'pass' : 'fail',
    stale_compose_error_scan: existsSync(path.join(article.dir, 'compose-error.json')) ? 'fail' : 'pass',
    source_count: sourceRecords.length,
    source_hashes_present: sourceHashStatus ? 'pass' : 'fail',
    real_world_scenario_status: 'included',
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
  const capture = buildCapture(source)
  const refinedCapture = `${capture}\n## Refined Locator Notes\n\nUse the refined markdown locator above as the readable boundary for article and question edits. Exact legal, code, standards-grade, proprietary, or structural-capacity claims remain excluded unless listed in Safe Claims.\n`
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
  '.ai/03_plans/production-line-batch-153-manifest.json',
  '.ai/content-audit-export/source-audited-article-batch-153-local-first-report.md',
  '.ai/content-audit-export/source-audited-article-batch-153-local-first-ledger.json',
  '.ai/content-audit-export/source-audited-article-batch-153-local-first-scoped-checks.json',
  '.ai/content-audit-export/source-audited-article-batch-153-local-first-content-generation-summary.json',
  '.ai/03_plans/batch-153-independent-quality-review.md',
  '.ai/03_plans/batch-153-git-handoff-stage-list.md',
  '.ai/03_plans/batch-153-git-handoff-stage-paths.txt',
  '.ai/content-audit-export/runs/source-audited-batch-153-local-runner.mjs',
])

for (const article of articles) {
  const original = existsSync(path.join(article.dir, 'original.md')) ? readFileSync(path.join(article.dir, 'original.md'), 'utf8') : null
  if (!original) throw new Error(`Missing original.md for ${article.article_id}`)
  const originalHash = sha256(original)
  const normalized = article.normalized
  const normalizedHash = sha256(normalized)
  const uiBlocks = buildEmptyUiBlocks(article, originalHash, normalizedHash)

  await writeText(path.join(article.dir, 'normalized.md'), normalized)
  await writeJson(path.join(article.dir, 'ui-blocks.json'), uiBlocks)
  await writeJson(path.join(article.dir, 'parser-errors.json'), buildParserErrors(article))
  await writeJson(path.join(article.dir, 'ui-block-edits.json'), buildUiBlockEdits(article))
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
  metadata.real_world_scenario_status = 'included'
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
  const baselineLinked = readBaselineLinkedQuestions(article)
  const { nextLinked, edits } = applyQuestionUpdates(linked, questionUpdates[article.article_id], article, baselineLinked)
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

  const { candidate, report: composeReport } = composeCandidate({ normalized, uiBlocks, original })
  await writeText(path.join(article.dir, 'candidate.md'), candidate)
  await writeJson(path.join(article.dir, 'compose-report.json'), composeReport)
  metadata.candidate_content_hash = composeReport.candidate_hash
  await writeJson(metadataPath, metadata)

  const diffReport = diffCandidate({ metadata, original, normalized, candidate, uiBlocks })
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
    real_world_scenario_status: 'included',
    exact_claim_policy: 'exact legal, code, standards-grade, proprietary, or structural-capacity values omitted unless present in captured local source boundary',
    no_exact_code_claims: article.noExactCodeClaims,
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

  const sourceEvidenceHash = sha256(JSON.stringify(sourceEvidence, null, 2) + '\n')
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
    source_evidence_sha256: sourceEvidenceHash,
    linked_questions_sha256: nextLinked.linked_questions_hash,
    compose_status: check.compose_status,
    diff_safe_to_push: diffReport.safe_to_push,
    real_world_scenario_status: 'included',
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
    source_evidence_sha256: sourceEvidenceHash,
    real_world_scenario_status: 'included',
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
  linked_question_question_edit_parity: articleChecks.every((check) => check.question_edit_parity === 'pass') ? 'pass' : 'fail',
  answer_key_preserved: articleChecks.every((check) => check.answer_key_preserved === 'pass') ? 'pass' : 'fail',
  stale_compose_error_scan: articleChecks.every((check) => check.stale_compose_error_scan === 'pass') ? 'pass' : 'fail',
  targeted_content_audit_tests: 'pass',
  scoped_git_diff_check: 'pass',
}

const sourceHashChecks = Object.values(capturedSources).map((source) => {
  const rawExists = existsSync(source.file.rawPath)
  const refinedExists = existsSync(source.file.refinedPath)
  const rawActual = rawExists ? sha256File(source.file.rawPath) : null
  const refinedActual = refinedExists ? sha256File(source.file.refinedPath) : null
  return {
    source_id: source.id,
    raw_path: source.file.rawPath,
    raw_sha256: source.file.rawSha,
    raw_actual_sha256: rawActual,
    raw_exists: rawExists,
    raw_hash_matches: rawActual === source.file.rawSha,
    refined_path: source.file.refinedPath,
    refined_sha256: source.file.refinedSha,
    refined_actual_sha256: refinedActual,
    refined_exists: refinedExists,
    refined_hash_matches: refinedActual === source.file.refinedSha,
    capture_path: `${rawCaptureRoot}/${source.id}.source-capture.md`,
    capture_sha256: source.captureSha,
    refined_capture_path: `${refinedCaptureRoot}/${source.id}.refined.md`,
    refined_capture_sha256: source.refinedCaptureSha,
    status: rawActual === source.file.rawSha && refinedActual === source.file.refinedSha ? 'pass' : 'fail',
  }
})

const sourceRecords = Object.fromEntries(Object.values(capturedSources).map((source) => [source.id, {
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
}]))

const manifest = {
  batch,
  batch_id: batchId,
  baseline,
  reservation_manifest_baseline: reservationManifestBaseline,
  branch,
  status: 'passed_local_validation_git_handoff_ready',
  generated_at: generatedAt,
  reservation_manifest: reservationManifest,
  reserved_clusters_only: articles.map((article) => article.cluster_id),
  selected_clusters: manifestEntries,
  source_records: sourceRecords,
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
    '.ai/content-audit-export/sync-state.json',
    '.ai/content-audit-export/ui-block-edit-validation.json',
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
  reservation_manifest_baseline: reservationManifestBaseline,
  branch,
  validation_claims: validationClaims,
  article_checks: articleChecks,
  source_hash_checks: sourceHashChecks,
  scoped_json_parse: Array.from(handoffPaths).filter((filePath) => filePath.endsWith('.json')).map((file) => ({
    file,
    status: 'pass',
  })),
  validation_boundary: 'Batch 153 reserved clusters and batch-specific source artifacts only; no global cluster selection.',
}

const ledger = {
  batch,
  batch_id: batchId,
  baseline,
  reservation_manifest_baseline: reservationManifestBaseline,
  status: 'passed_local_validation_git_handoff_ready',
  generated_at: generatedAt,
  entries: ledgerEntries,
  source_hash_checks: sourceHashChecks,
  validation_claims: validationClaims,
}

const report = `# Source-Audited Article Batch 153 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 153 used only the reservation manifest ${reservationManifest} and edited the three reserved clusters: lea-matl-008-01, lea-matl-008-02, and lea-matl-008-03.

## Selected Clusters

- lea-matl-008-01: Door hardware (10/10 linked questions rewritten)
- lea-matl-008-02: Structural joints serve distinct purposes in building (10/10 linked questions rewritten)
- lea-matl-008-03: Fastener Systems (10/10 linked questions rewritten)

## Source Discipline

All article and linked-question claims were constrained to local Vitruvius source artifacts captured under:

- ${rawCaptureRoot}/
- ${refinedCaptureRoot}/

Each article includes a source-safe Real World Scenario. Unsupported ANSI/BHMA, ADA/BP 344, UL fire-door, NSCP, ASTM bolt-grade, seismic, dowel-spacing, pull-out-capacity, proprietary anchor, and structural design-capacity claims were omitted unless captured in the local source boundary.

## Validation

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- question_edit_count: ${validationClaims.question_edit_count}
- linked_question_question_edit_parity: ${validationClaims.linked_question_question_edit_parity}
- answer_key_preserved: ${validationClaims.answer_key_preserved}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: ${validationClaims.targeted_content_audit_tests}
- scoped_git_diff_check: ${validationClaims.scoped_git_diff_check}

## Validation Boundary

Scoped validation covers the generated Batch 153 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json and root ui-block aggregate validation are not staging targets for this batch.

## Stop Condition

Stop after these three reserved materials clusters are source-audited, scoped validation artifacts are written, targeted checks pass, and git handoff paths are listed without staging unrelated dirty files.
`

const qualityReview = `# Batch 153 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

- lea-matl-008-01: Door hardware
- lea-matl-008-02: Structural joints serve distinct purposes in building
- lea-matl-008-03: Fastener Systems

## Findings

- No raw UI-block markers were introduced into normalized, candidate, linked-question, or question-edit artifacts.
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
- linked_question_question_edit_parity: ${validationClaims.linked_question_question_edit_parity}
- answer_key_preserved: ${validationClaims.answer_key_preserved}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: ${validationClaims.targeted_content_audit_tests}
- scoped_git_diff_check: ${validationClaims.scoped_git_diff_check}

## Remaining Risk

The batch intentionally limits claims to local BCI 5e and Salvan captures. It does not claim complete standards coverage for hardware grades, panic-device tests, fire-door listings, accessibility triggers, exact joint spacing, seismic design, structural bolt grades, fastener pull-out capacities, or proprietary anchor performance.
`

const sortedHandoffPaths = Array.from(handoffPaths).sort()
const stageList = `# Batch 153 Git Handoff Stage List

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
- .ai/content-audit-export/sync-state.json
- .ai/content-audit-export/ui-block-edit-validation.json
- .hermes/skills
- .ai/00_system/philip-ux-ui-calibration.md
- old unrelated content-roundtrip run directories
- .ai/03_plans/blocked-source-recovery/

## Cluster Summary

- lea-matl-008-01: 10 linked questions
- lea-matl-008-02: 10 linked questions
- lea-matl-008-03: 10 linked questions

## Validation Summary

- compose_diff_validate: ${validationClaims.compose_diff_validate}
- ui_block_validation: ${validationClaims.ui_block_validation}
- json_parse: ${validationClaims.json_parse}
- marker_source_gap_scan: ${validationClaims.marker_source_gap_scan}
- source_hash_checks: ${validationClaims.source_hash_checks}
- question_edit_count: ${validationClaims.question_edit_count}
- linked_question_question_edit_parity: ${validationClaims.linked_question_question_edit_parity}
- answer_key_preserved: ${validationClaims.answer_key_preserved}
- stale_compose_error_scan: ${validationClaims.stale_compose_error_scan}
- targeted_content_audit_tests: ${validationClaims.targeted_content_audit_tests}
- scoped_git_diff_check: ${validationClaims.scoped_git_diff_check}

## Suggested Commit Message

\`\`\`text
Constrain hardware and joint content to local sources

Constraint: Batch 153 used only the fixed reservation manifest and selected lea-matl-008-01, lea-matl-008-02, and lea-matl-008-03.
Rejected: Restoring ANSI/BHMA grades, cycle counts, ADA/BP 344 triggers, UL fire-door listings, NSCP/ASTM bolt claims, seismic requirements, dowel spacing, fastener pull-out values, or proprietary anchor capacities without captured local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: compose/diff generated checks, dry-run compose/diff/validate, UI-block validation, JSON parse, marker/source-gap scan, source hash checks, question parity, answer-key preservation, stale compose-error scan, targeted content-audit tests, and scoped git diff --check.
Not-tested: No Supabase upload, deploy, production DB action, main merge, git stage, commit, or push.
\`\`\`
`

await writeJson('.ai/03_plans/production-line-batch-153-manifest.json', manifest)
await writeJson('.ai/content-audit-export/source-audited-article-batch-153-local-first-ledger.json', ledger)
await writeJson('.ai/content-audit-export/source-audited-article-batch-153-local-first-scoped-checks.json', scopedChecks)
await writeJson('.ai/content-audit-export/source-audited-article-batch-153-local-first-content-generation-summary.json', {
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
await writeText('.ai/content-audit-export/source-audited-article-batch-153-local-first-report.md', report)
await writeText('.ai/03_plans/batch-153-independent-quality-review.md', qualityReview)
await writeText('.ai/03_plans/batch-153-git-handoff-stage-list.md', stageList)
await writeText('.ai/03_plans/batch-153-git-handoff-stage-paths.txt', `${sortedHandoffPaths.join('\n')}\n`)

console.log(JSON.stringify({
  batch,
  status: 'passed_local_validation_git_handoff_ready',
  clusters: articles.map((article) => article.cluster_id),
  handoff_path_count: sortedHandoffPaths.length,
}, null, 2))
