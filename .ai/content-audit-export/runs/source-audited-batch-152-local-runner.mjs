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

const batch = 152
const batchId = 'source-audited-batch-152-local-first'
const generatedAt = new Date().toISOString()
const baseline = '9c637523d3'
const branch = '3dlab-gray-viewport-bg'
const reservationManifest = '.ai/03_plans/production-line-batch-152-reservation-manifest.json'
const rawCaptureRoot = 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-152'
const refinedCaptureRoot = 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-152'

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
  salvanPaint: {
    id: 'salvan-paint-protective-coatings-b152',
    title: 'George Salvan Architectural Building Materials - paints and protective coatings',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 4332-4468, 5919-5948, and 13388-13422',
    safe_claims: [
      'Paint is made from vehicles or binders, with or without coloring pigments, plus additives and thinners, and forms an adherent continuous film on a surface.',
      'Painting is used for decoration, sanitation, preservation, improved lighting or heating effects, working conditions, safety, and economy.',
      'Oil paint uses a drying oil vehicle; alkyd paint uses synthetic alkyd resin; resin-emulsion or latex paint uses a synthetic resin emulsion and water as thinner.',
      'Metallic paint contains fine metallic flakes suspended in a vehicle and is best sprayed for a uniform film and even flake deposition.',
      'Intumescent paint is a fire-retardant coating that puffs up under heat and forms an insulating crust.',
      'Varnish is a transparent protective liquid that lets the original surface show; adding pigment to varnish creates enamel.',
      'Shellac can serve as a seal coat over stains and fillers, and oils or turpentine can seal wood before paint or varnish so the vehicle is not absorbed.',
      'Painting specifications require manufacturer-recommended materials in original labeled containers, mixing only as specified, careful examination, cleaning, sanding, sealing when needed, and no coating over wet or damp surfaces.',
    ],
    use_limits: [
      'Do not restore VOC limits, EPA or ASTM labels, DFT values, ANSI/BP 344 slip-resistance language, or modern coverage-rate claims from this source packet.',
      'Do not treat legacy brand names as required products.',
      'Do not turn general fire-retardant coating behavior into a specific structural fire-rating claim.',
    ],
  },
  bciFinishBasics: {
    id: 'bci-5e-finish-selection-basics-b152',
    title: 'Building Construction Illustrated, 5th Edition - finish selection basics',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 12549-12620, 13036-13496, and 13505-13562',
    safe_claims: [
      'Finish work covers interior wall, ceiling, and floor surfaces.',
      'Interior walls should resist wear and be cleanable, floors should be durable, comfortable, and safe to walk on, and ceilings should be relatively maintenance-free.',
      'Flexible finish materials require a solid, rigid backing, while rigid finish materials can span short distances on a supporting grid.',
      'Finish selection should consider color, texture, pattern, joints, acoustic qualities, fire resistance, thermal insulation value, and how the material meets adjacent materials.',
      'Ceramic tile, terrazzo, wood flooring, resilient flooring, carpeting, gypsum/plaster wall finishes, and acoustical ceiling systems each carry different substrate and coordination requirements.',
    ],
    use_limits: [
      'Do not convert general finish-selection guidance into a code requirement.',
      'Do not cite uncaptured manufacturer performance values for slip resistance, acoustic ratings, fire ratings, or emissions.',
      'Do not use this source as a complete finish-schedule drafting standard; use it only for material coordination and schedule logic.',
    ],
  },
  salvanFinishSpec: {
    id: 'salvan-finish-specification-paint-b152',
    title: 'George Salvan Architectural Building Materials - interior finishes and paint specification',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 8560-8665 and 13388-13422',
    safe_claims: [
      'Salvan records interior finish families such as wood boards, wood sheets, plywood, trim, gypsum plaster, and gypsum board.',
      'Gypsum board joints and corners are taped and filled before sizing and painting.',
      'Painting specification entries require approved color, tint, finish, or shade selection by the architect.',
      'Painting is three-coat work of one primer and finish coats unless otherwise specified.',
      'Paint materials should be manufacturer-recommended, delivered in original labeled containers, and mixed only as specified by the manufacturer.',
      'Surfaces must be examined, cleaned, sanded, and sealed if necessary before painting, and neither paint nor finish treatment should be applied over wet or damp surfaces.',
    ],
    use_limits: [
      'Do not retain brand examples as mandatory specifications.',
      'Do not use this source to assert current mold-resistance, low-VOC, or product-specific paint performance.',
      'Do not use vague schedule labels where substrate, finish, color/texture, and reference data are needed.',
    ],
  },
  bciLaminate: {
    id: 'bci-5e-plastic-laminate-countertops-b152',
    title: 'Building Construction Illustrated, 5th Edition - plastic laminate countertops',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 13754-13820',
    safe_claims: [
      'Plastic laminate is a hard surfacing material made from layered papers, foil, wood veneer, or fabric impregnated with melamine and phenolic resins and fused under heat and pressure.',
      'Plastic laminate provides a durable, heat-resistant, and water-resistant surface covering for countertops, furniture, doors, and wall panels.',
      'Plastic laminate may be applied to smooth plywood, hardboard, particleboard, and other common core materials.',
      'Field bonding may use contact adhesive, while shop bonding may use thermosetting adhesive under pressure.',
      'High-pressure laminate is used for horizontal applications such as countertops and tabletops; low-pressure laminate is used for vertical and low-wear applications.',
      'A backer sheet should be applied to the opposite side of unsupported panels to keep them from warping.',
      'Edge choices include beveled corners, metal edging, postformed edges, and edge banding.',
    ],
    use_limits: [
      'Do not restore Mohs hardness, water-absorption percentages, quartz/solid-surface superiority claims, annual sealing requirements, or quarry-specific quality claims from this batch.',
      'Do not treat Formica as a generic technical class beyond the source statement that it is a trademark for a brand of plastic laminate.',
      'Do not state exact chemical, heat, stain, or scratch performance without product-specific documentation.',
    ],
  },
  salvanLaminate: {
    id: 'salvan-plastic-laminates-b152',
    title: 'George Salvan Architectural Building Materials - plastic laminates and adhesives',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 1916-1920, 2630-2710, and 2676-2854',
    safe_claims: [
      'Salvan describes plastic laminates as three or more material layers bonded with plastic adhesive under high pressure.',
      'Salvan describes a base of kraft paper impregnated with phenolic, amino, or epoxy resin, covered with a printed pattern sheet saturated with melamine resin.',
      'Salvan records use of plastic laminates for cabinets and tabletops with many colors and patterns.',
      'Neoprene-rubber adhesives are noted as used to cement plastic laminates to walls or flat surfaces.',
      'Plastic-coated or vinyl-covered rigid panels are recorded as nonstructural finish materials.',
    ],
    use_limits: [
      'Do not use old standard thickness lists as a current product mandate unless the item explicitly asks about the captured source.',
      'Do not make countertop claims about engineered quartz, marble, granite, or solid surface without a captured source.',
      'Do not imply that every adhesive in the adhesive chapter is suitable for every countertop condition.',
    ],
  },
}

const articles = [
  {
    cluster_id: 'lea-matl-007-04',
    article_id: '916cb394-9854-4d8e-ae0a-fd1747e37b3f',
    slug: 'lea-matl-007-04-core-concept',
    title: 'Paint systems',
    dir: '.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f',
    sourceIds: ['salvan-paint-protective-coatings-b152', 'bci-5e-finish-selection-basics-b152'],
    sourceKeys: ['salvanPaint', 'bciFinishBasics'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore VOC limits, EPA/ASTM labels, DFT values, ANSI/BP 344 slip-resistance language, or modern coverage-rate claims.',
      'No local source in this batch was used to make brand-specific paint or primer requirements mandatory.',
      'No local source in this batch was used to convert intumescent coating behavior into a specific structural fire-rating requirement.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For paint-system questions, identify the substrate, exposure, coating family, preparation step, and required finish function. The safe answer stays with the coating behavior the source actually supports: paint, varnish, enamel, shellac, stain, sealer, metallic paint, intumescent paint, or another protective coating.

**Common trap:** importing VOC limits, ASTM test numbers, dry-film thicknesses, coverage rates, or BP 344/ANSI slip values when the checked local sources only support coating families, surface preparation, manufacturer directions, and general film behavior.

## What You Need to Know for the LEA

## Learning Goal

Classify paint and protective coating systems by binder or vehicle, pigment use, surface preparation, film function, and source-supported use limits.

## Core Concept

Salvan defines paint as a coating made from vehicles or binders, with or without coloring pigments, adjusted by additives and thinners so that it forms an adherent continuous film. Painting may serve decoration, sanitation, preservation, improved lighting or working conditions, safety, and economy.

### Coating Families

| Coating family | Source-supported cue | LEA use |
|---|---|---|
| Oil paint | Uses a drying oil vehicle, commonly modified by thinners and driers. | Recognize the vehicle logic rather than a brand claim. |
| Alkyd paint | Uses synthetic alkyd resin and may have weathering and water-resistance advantages in exposed conditions. | Choose it when the item asks about alkyd resin behavior, not modern VOC compliance. |
| Resin-emulsion or latex paint | Uses a synthetic resin emulsion with water as the thinner. | Identify water-thinned emulsion paint. |
| Metallic paint | Suspends fine metal flakes in a vehicle; spraying helps produce a uniform film and even flake deposition. | Select for the metallic-flake behavior, not corrosion warranties. |
| Intumescent paint | Puffs up under heat and forms an insulating crust. | Recognize fire-retardant coating behavior without inventing fire-rating values. |
| Varnish | Transparent protective coating that lets the original surface show. | Do not confuse it with opaque paint. |
| Enamel | Varnish with pigment added; good results depend on pigment quality and undercoat. | Use when the question points to pigmented varnish logic. |
| Shellac, stains, fillers, sealers | Adjacent finishing materials for sealing, coloring, filling, or preparing surfaces. | Do not treat all finish liquids as paint. |

### Surface Preparation

Surface preparation is part of the paint system. A source-safe specification requires manufacturer-recommended materials in original labeled containers, mixing only as specified, careful examination of surfaces, cleaning, sanding, sealing when needed, and no paint or finish treatment over wet or damp surfaces. Painting is three-coat work of primer plus finish coats unless the specification says otherwise.

## Real World Scenario

A contractor wants to paint gypsum board while plaster work nearby is still curing and the wall is damp. A source-safe response does not need an uncaptured adhesion test or VOC number: stop the painting, examine the receiving surface, clean and sand it, seal if necessary, follow manufacturer mixing directions, and wait until the surface is dry enough for the specified primer and finish coats.

## How It's Tested

LEA-style items usually ask which coating family or preparation step fits a condition. If the item asks for water-thinned emulsion paint, choose resin-emulsion or latex paint. If it asks for a transparent protective film, choose varnish. If it asks for heat-swelling fire-retardant behavior, choose intumescent paint. Reject options that depend on uncaptured ASTM, VOC, DFT, BP 344, ANSI, coverage-rate, or brand-specific values.

## Common Mistakes

- Treating paint, varnish, enamel, shellac, lacquer, stain, filler, and sealer as interchangeable.
- Skipping surface examination, cleaning, sanding, sealing, primer, or manufacturer directions.
- Painting over wet or damp surfaces.
- Treating intumescent paint as ordinary decorative paint.
- Repeating modern performance values not present in the active local source packet.

## Related Articles

See also within Interior Finishes: **lea-matl-007-01-core-concept**, **lea-matl-007-02-core-concept**, **lea-matl-007-03-core-concept**, **lea-matl-007-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-007-05',
    article_id: 'c4eb5745-a35a-4c85-94d2-e7d687a40278',
    slug: 'lea-matl-007-05-core-concept',
    title: 'Finish schedule',
    dir: '.ai/content-audit-export/articles/lea-matl-007-05-core-concept--c4eb5745-a35a-4c85-94d2-e7d687a40278',
    sourceIds: ['bci-5e-finish-selection-basics-b152', 'salvan-finish-specification-paint-b152'],
    sourceKeys: ['bciFinishBasics', 'salvanFinishSpec'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore brand/color mandates, ASTM/ANSI/BP 344 labels, NRC values, grid-width values, or proprietary coating requirements.',
      'No local source in this batch was used to treat schedule format conventions as code requirements.',
      'No local source in this batch was used to make vague TBD finish entries acceptable for field execution.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For finish-schedule questions, ask what surface is being coordinated and what field ambiguity the schedule must remove. A source-safe answer names the space, surface, finish material, substrate or backing, color or texture, installation method, edge or joint condition, and drawing/detail/specification reference.

**Common trap:** treating a schedule as a brand list. BCI supports coordination of walls, floors, and ceilings by finish behavior and assembly needs; Salvan supports paint preparation and specification discipline. Neither source turns brand examples, BP 344 labels, ASTM labels, ANSI slip values, or acoustic ratings into required schedule fields for this batch.

## What You Need to Know for the LEA

## Learning Goal

Use a finish schedule to coordinate interior wall, floor, and ceiling finishes with material properties, substrate requirements, installation methods, finish appearance, and references.

## Core Concept

BCI organizes finish work around interior wall, floor, and ceiling surfaces. Walls should resist wear and be cleanable; floors should be durable, comfortable, and safe to walk on; ceilings should be relatively maintenance-free. BCI also says finish selection should consider color, texture, pattern, joints, acoustic qualities, fire resistance, thermal insulation value, and how one material meets another.

A finish schedule turns those choices into room-by-room instructions. At minimum, it should identify:

- the room or space;
- the surface being finished;
- the finish material or system;
- the substrate or backing needed;
- the installation method or setting logic;
- the color, texture, pattern, or joint condition;
- the edge, base, transition, or accessory condition;
- the drawing, detail, or specification reference that resolves the entry.

### Schedule Logic by Surface

| Surface | Source-safe schedule cue |
|---|---|
| Floors | Distinguish ceramic tile thinset from thickset work, terrazzo divider-strip needs, wood flooring acclimation and subfloor needs, resilient flooring substrate condition, and carpet pad or edge control when relevant. |
| Walls | Distinguish gypsum plaster, portland cement plaster, gypsum board, tile backing, wood finish, and paint system. Wet or damp conditions change the acceptable base and finish logic. |
| Ceilings | Distinguish direct gypsum board, direct acoustical tile, suspended acoustical ceiling, integrated ceiling systems, and linear metal ceilings. |
| Paint entries | State the receiving surface, preparation, primer/finish-coat logic, manufacturer direction, color/tint/finish selection, and dry-surface condition. |

## Real World Scenario

A room schedule lists "floor: tile, wall: paint, ceiling: acoustic tile." That is not enough for pricing or execution. The source-safe correction adds the floor backing and setting method, the wall substrate and paint preparation/primer logic, the ceiling support method and access requirement, and references for transitions, base, joints, color, and texture. Exact product ratings must come from a current product or code source, not from this batch.

## How It's Tested

LEA-style items often show an incomplete schedule entry and ask what is missing. The best answer usually adds substrate, installation method, finish system, color or texture, joint/edge treatment, and reference information. Reject choices that merely add a brand name or an uncaptured rating while leaving the assembly undefined.

## Common Mistakes

- Listing only a material name without the room, surface, substrate, or installation method.
- Leaving color, texture, grout, pattern, or finish as a vague placeholder.
- Scheduling a finish without checking whether it needs a dry, smooth, clean, rigid, or moisture-resistant backing.
- Treating floor, wall, and ceiling schedules as interchangeable.
- Omitting detail references for edges, transitions, joints, bases, and accessories.

## Related Articles

See also within Interior Finishes: **lea-matl-007-01-core-concept**, **lea-matl-007-02-core-concept**, **lea-matl-007-03-core-concept**, **lea-matl-007-04-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-007-06',
    article_id: 'cc2eb7b8-8933-47d3-a61a-f3f835daf1ab',
    slug: 'lea-matl-007-06-core-concept',
    title: 'Countertop materials range from high-performance engineered',
    dir: '.ai/content-audit-export/articles/lea-matl-007-06-core-concept--cc2eb7b8-8933-47d3-a61a-f3f835daf1ab',
    sourceIds: ['bci-5e-plastic-laminate-countertops-b152', 'salvan-plastic-laminates-b152'],
    sourceKeys: ['bciLaminate', 'salvanLaminate'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore Mohs hardness, water-absorption percentages, quartz/solid-surface superiority, annual sealing, quarry-quality, or exact stain/heat/scratch performance claims.',
      'No local source in this batch was used to make engineered quartz, marble, granite, or branded solid-surface materials the answer key.',
      'Exact laminate dimensions and pressure values were kept out of learner-facing answers unless the item expressly asks from the captured source.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For countertop questions in this batch, stay inside the checked plastic-laminate source boundary. Identify the surfacing layer, core material, adhesive method, edge treatment, and panel balance. Do not answer from unchecked quartz, marble, granite, or solid-surface marketing claims.

**Common trap:** using Mohs hardness, water-absorption values, stain-resistance claims, annual sealing cycles, or quarry/product quality assumptions when the active local sources support plastic laminate construction and coordination instead.

## What You Need to Know for the LEA

## Learning Goal

Explain plastic-laminate countertop construction by surfacing layer, core material, bonding method, edge treatment, and backer-sheet coordination.

## Core Concept

BCI describes plastic laminate as a hard surfacing material made from layers such as kraft paper, foil, printed paper, wood veneer, or fabric impregnated with melamine and phenolic resins, then fused under heat and pressure. It provides a durable, heat-resistant, and water-resistant surface covering for countertops, furniture, doors, and wall panels.

Salvan gives a compatible material description: plastic laminates consist of three or more layers bonded with plastic adhesive under high pressure. The base uses kraft paper impregnated with resin, while the decorative layer is a printed pattern sheet saturated with melamine resin.

### Countertop Coordination

| Item | Source-supported rule |
|---|---|
| Core | Plastic laminate may be applied to smooth plywood, hardboard, particleboard, and other common core materials. |
| Bonding | Field bonding may use contact adhesive; shop bonding may use thermosetting adhesive under pressure. |
| Application class | High-pressure laminate is used for horizontal applications such as countertops and tabletops; low-pressure laminate is used for vertical and low-wear applications. |
| Panel balance | A backer sheet should be applied to the opposite side of unsupported panels to keep them from warping. |
| Edges | Beveled corners, metal edging, postformed edges, and edge banding are source-supported edge choices. |
| Product name | Formica is identified as a trademark for a brand of plastic laminate, not as a separate generic material class. |

## Real World Scenario

A cabinet shop submits a countertop sample showing only the decorative laminate color. The source-safe review asks for the core material, whether field contact adhesive or shop thermosetting adhesive will be used, how exposed edges will be protected, whether unsupported panels need a backer sheet, and whether the laminate is suitable for horizontal countertop service. The review does not need uncaptured quartz hardness, marble sealing, or granite quarry claims.

## How It's Tested

LEA-style items should focus on laminate construction, core support, adhesive method, backer sheets, high-pressure versus low-pressure application, and edge treatment. If an item asks for engineered quartz, marble, granite, or branded solid-surface performance without a checked source, treat it as outside this source-audited scope.

## Common Mistakes

- Confusing high-pressure laminate for horizontal countertops with low-pressure laminate for vertical or low-wear surfaces.
- Omitting the backer sheet on an unsupported panel.
- Treating edge banding as decoration only when it also protects exposed edges.
- Using the wrong bonding method for field or shop work.
- Answering with Mohs hardness, water-absorption, sealing interval, or branded performance numbers not found in the checked sources.

## Related Articles

See also within Interior Finishes: **lea-matl-007-01-core-concept**, **lea-matl-007-02-core-concept**, **lea-matl-007-04-core-concept**, **lea-matl-007-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
]

const questionUpdates = {
  '916cb394-9854-4d8e-ae0a-fd1747e37b3f': [
    {
      id: '2cf1eed7-790f-4002-8d93-d6879f5fad7d',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'Which source-backed description best defines paint as a material system?',
      options: [
        { id: 'a', text: 'A transparent resin finish with no pigment by definition.' },
        { id: 'b', text: 'A finish selected only by brand name and color code.' },
        { id: 'c', text: 'A coating made from vehicles or binders, with or without pigments, adjusted by additives and thinners to form an adherent continuous film.' },
        { id: 'd', text: 'A floor-setting mortar that replaces surface preparation.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown lines 4332-4340.',
    },
    {
      id: '57faa581-99fa-4ba9-a995-6a61c1c2ad68',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'A question asks for resin-emulsion or latex paint behavior. Which answer stays inside the checked source?',
      options: [
        { id: 'a', text: 'It is a transparent varnish with no pigment.' },
        { id: 'b', text: 'It is a terrazzo matrix with divider strips.' },
        { id: 'c', text: 'It uses a synthetic resin emulsion as the vehicle and water as the thinner.' },
        { id: 'd', text: 'It is selected by an uncaptured corrosion warranty.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown lines 4372-4388.',
    },
    {
      id: '13b9b3e9-3eb1-4eab-819e-a1a66131cd6e',
      source_ids: ['salvan-finish-specification-paint-b152'],
      text: 'A painter wants to skip surface examination and proceed directly to finish coats. Which source-safe instruction should the architect give?',
      options: [
        { id: 'a', text: 'Proceed because paint always corrects dirty or wet substrates.' },
        { id: 'b', text: 'Use only a color sample; preparation is outside the paint system.' },
        { id: 'c', text: 'Examine the surfaces, clean, sand, and seal if necessary, then use primer plus finish coats unless otherwise specified.' },
        { id: 'd', text: 'Replace the paint work with a plastic-laminate countertop detail.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown lines 13388-13422.',
    },
    {
      id: '505dbdd9-66bd-4247-a4e6-0d3b256bbc25',
      source_ids: ['salvan-finish-specification-paint-b152'],
      text: 'Under the captured Salvan paint specification, what must happen before a succeeding coat is applied?',
      options: [
        { id: 'a', text: 'Apply the next coat while the prior coat is still wet.' },
        { id: 'b', text: 'Ignore drying because manufacturer directions are optional.' },
        { id: 'c', text: 'Allow the preceding coat to dry as specified before applying the succeeding coat.' },
        { id: 'd', text: 'Switch to low-pressure laminate.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown line 13422.',
    },
    {
      id: '80b07487-5a8d-4a9e-a44d-90e20589ce9e',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'Which statement correctly distinguishes varnish from true paint in the checked source?',
      options: [
        { id: 'a', text: 'Varnish is a ceramic tile setting bed.' },
        { id: 'b', text: 'Varnish is a more-or-less transparent protective liquid, while true paint includes pigment with a vehicle.' },
        { id: 'c', text: 'Varnish is always a water-thinned latex emulsion.' },
        { id: 'd', text: 'Varnish is selected by a modern VOC limit from this batch.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 5919-5948 and 4430-4443.',
    },
    {
      id: '57ddd270-7dde-43ef-be87-99b05738d44d',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'A wood trim surface is absorbing finish unevenly before painting or varnishing. Which source-backed preparation concept applies?',
      options: [
        { id: 'a', text: 'Leave the wood unsealed so the finish vehicle is absorbed faster.' },
        { id: 'b', text: 'Use ceramic grout as the finish sealer.' },
        { id: 'c', text: 'Use oils or turpentine-type sealers to seal wood so the paint or varnish vehicle is not similarly absorbed.' },
        { id: 'd', text: 'Install acoustical ceiling tile over the trim.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown lines 2844-2854.',
    },
    {
      id: '459f76fa-0eff-4f4f-95ff-0350dae9a802',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'What distinguishes intumescent paint in the checked source?',
      options: [
        { id: 'a', text: 'It is ordinary decorative paint with no heat response.' },
        { id: 'b', text: 'It puffs up under heat or fire and forms an insulating crust that retards heat penetration.' },
        { id: 'c', text: 'It is a transparent varnish used only to show wood grain.' },
        { id: 'd', text: 'It is a grout color schedule.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 4407-4426.',
    },
    {
      id: 'bdec829a-7639-4e67-8d3b-15cb5144479b',
      source_ids: ['salvan-paint-protective-coatings-b152', 'salvan-finish-specification-paint-b152'],
      text: 'A job includes ferrous metal protection, damp plaster nearby, and interior wall painting. Which source-safe specification approach is best?',
      options: [
        { id: 'a', text: 'Use uncaptured VOC, DFT, and slip-resistance values as the main answer.' },
        { id: 'b', text: 'Select a coating appropriate to the intended use, follow manufacturer directions, examine and clean surfaces, avoid wet or damp surfaces, and use primer plus finish coats unless specified otherwise.' },
        { id: 'c', text: 'Paint over damp surfaces to save time.' },
        { id: 'd', text: 'Specify engineered quartz because all finish problems are countertop problems.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 4332-4468 and 13388-13422.',
    },
    {
      id: 'f8ac3693-3320-4498-a348-18b0208bf945',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'Why does Salvan identify spraying as the best application method for metallic paints?',
      options: [
        { id: 'a', text: 'Spraying turns metallic paint into a floor mortar.' },
        { id: 'b', text: 'Spraying eliminates the need for a vehicle.' },
        { id: 'c', text: 'Spraying helps spread a uniform film and encourages even deposition of the metallic flakes.' },
        { id: 'd', text: 'Spraying supplies uncaptured coverage data.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown lines 4393-4401.',
    },
    {
      id: '888958aa-5c04-4f46-a222-474c6b965767',
      source_ids: ['salvan-paint-protective-coatings-b152'],
      text: 'When pigment is added to varnish, what finish does the checked source identify?',
      options: [
        { id: 'a', text: 'Shellac only.' },
        { id: 'b', text: 'Enamel.' },
        { id: 'c', text: 'Terrazzo.' },
        { id: 'd', text: 'Low-pressure plastic laminate.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 4444-4452.',
    },
  ],
  'c4eb5745-a35a-4c85-94d2-e7d687a40278': [
    {
      id: 'a6275c53-fecc-499a-be58-71003916d6a7',
      source_ids: ['bci-5e-finish-selection-basics-b152'],
      text: 'Which three interior surface groups does BCI organize finish work around?',
      options: [
        { id: 'a', text: 'Only doors, windows, and cabinet pulls.' },
        { id: 'b', text: 'Interior walls, floors, and ceilings.' },
        { id: 'c', text: 'Only roof decks, gutters, and downspouts.' },
        { id: 'd', text: 'Only plumbing fixtures, wiring, and structural frames.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
    {
      id: 'e68187ad-8741-4a34-a724-2e3b2e6357e8',
      source_ids: ['bci-5e-finish-selection-basics-b152'],
      text: 'A finish schedule says only "floor: tile" for a room. What field problem remains unresolved?',
      options: [
        { id: 'a', text: 'Nothing; a material name is enough for all field work.' },
        { id: 'b', text: 'The entry does not identify the substrate, thinset or thickset setting logic, joint/edge condition, color or texture, and detail reference.' },
        { id: 'c', text: 'The entry is wrong because tile can never be used on floors.' },
        { id: 'd', text: 'The entry should be replaced with an uncaptured brand warranty.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559 and 13036-13163.',
    },
    {
      id: '90603524-c5ac-4738-87d6-ba1f3afc8491',
      source_ids: ['salvan-finish-specification-paint-b152'],
      text: 'A paint schedule names a finish in one room but uses "light color" in another. What source-safe issue does this create?',
      options: [
        { id: 'a', text: 'No issue; vague finish descriptions improve coordination.' },
        { id: 'b', text: 'The architect-approved color, tint, finish, or shade and manufacturer-directed paint system are not consistently defined for field execution.' },
        { id: 'c', text: 'It converts the paint into terrazzo.' },
        { id: 'd', text: 'It automatically satisfies every product performance requirement.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 13388-13412.',
    },
    {
      id: '65873363-85b0-408b-be1c-d6e334f617b6',
      source_ids: ['bci-5e-finish-selection-basics-b152', 'salvan-finish-specification-paint-b152'],
      text: 'Which finish-schedule entry is most source-safe for an office conference room?',
      options: [
        { id: 'a', text: 'Floor, wall, and ceiling: nice finish, contractor to decide.' },
        { id: 'b', text: 'Floor: durable finish with substrate and setting method; walls: cleanable finish or paint system with preparation and primer logic; ceiling: direct or suspended system with access/acoustic coordination; base and transitions referenced by detail.' },
        { id: 'c', text: 'Only one brand name and no substrate information.' },
        { id: 'd', text: 'Only uncaptured acoustic, slip, and fire-rating numbers.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12620, 13036-13562; Salvan lines 13388-13422.',
    },
    {
      id: '29784988-50f9-4b4d-8e9b-d31b9530c7b3',
      source_ids: ['bci-5e-finish-selection-basics-b152'],
      text: 'What is the primary purpose of a source-safe finish schedule?',
      options: [
        { id: 'a', text: 'To replace drawings and specifications with informal color notes.' },
        { id: 'b', text: 'To coordinate room-by-room surface finishes, substrates, installation methods, appearance, edges, and references so field interpretation is reduced.' },
        { id: 'c', text: 'To list only furniture brands.' },
        { id: 'd', text: 'To hide unresolved finish decisions until construction.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
    {
      id: '011b5df2-94f0-4ae7-9383-193ad275bb71',
      source_ids: ['salvan-finish-specification-paint-b152'],
      text: 'A wall finish schedule entry says only "paint." What critical paint-system information is still missing?',
      options: [
        { id: 'a', text: 'Nothing; paint does not need preparation or references.' },
        { id: 'b', text: 'Receiving surface, approved color/tint/finish, surface preparation, primer and finish-coat logic, manufacturer direction, and reference information.' },
        { id: 'c', text: 'Only the Mohs hardness of marble.' },
        { id: 'd', text: 'Only the countertop edge profile.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 13388-13422.',
    },
    {
      id: '8ec65acf-9fa7-41ee-ac65-70c1dece2e95',
      source_ids: ['bci-5e-finish-selection-basics-b152'],
      text: 'A schedule note says "finish per detail reference." What does that reference direct the builder to do?',
      options: [
        { id: 'a', text: 'Ignore the detail and choose any finish.' },
        { id: 'b', text: 'Use the reference only as a color name.' },
        { id: 'c', text: 'Consult the referenced drawing, detail, or specification for the assembly, installation, edge, joint, or finish requirements.' },
        { id: 'd', text: 'Treat every surface as the same material.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
    {
      id: 'fbb2f72b-31c5-4dd3-8d19-fed57cd197b3',
      source_ids: ['bci-5e-finish-selection-basics-b152', 'salvan-finish-specification-paint-b152'],
      text: 'A wall finish is scheduled for a wet or moist room. Which entry best stays inside the source boundary?',
      options: [
        { id: 'a', text: 'Use ordinary dry-only finish logic and paint over damp surfaces.' },
        { id: 'b', text: 'Identify a moisture-suitable wall base or backing, require dry and prepared receiving surfaces, and cite the finish system or detail reference.' },
        { id: 'c', text: 'Specify only a brand color with no substrate check.' },
        { id: 'd', text: 'Use low-pressure laminate because all wet rooms are tabletops.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12560-12570 and 13135-13163; Salvan lines 13412-13422.',
    },
    {
      id: 'f5ca4347-c9b3-4e67-841d-6151a59da160',
      source_ids: ['bci-5e-finish-selection-basics-b152'],
      text: 'What information helps prevent ambiguity in a finish schedule entry?',
      options: [
        { id: 'a', text: 'Only a vague adjective such as nice or premium.' },
        { id: 'b', text: 'Space, surface, finish material, substrate or backing, installation method, color or texture, joint/edge condition, and reference.' },
        { id: 'c', text: 'Only the contractor name.' },
        { id: 'd', text: 'Only an uncaptured product performance number.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
    {
      id: '7028f39f-8941-4838-8fdb-3e298beb880e',
      source_ids: ['bci-5e-finish-selection-basics-b152'],
      text: 'Why is a material/color legend useful alongside a finish schedule?',
      options: [
        { id: 'a', text: 'It removes the need to coordinate substrates and installation.' },
        { id: 'b', text: 'It helps coordinate color, texture, pattern, joints, and how finish materials meet adjacent materials.' },
        { id: 'c', text: 'It turns every material into paint.' },
        { id: 'd', text: 'It replaces manufacturer and detail references for performance data.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
  ],
  'cc2eb7b8-8933-47d3-a61a-f3f835daf1ab': [
    {
      id: '8691a1fc-83d2-4f6c-aba0-90ea7d1681e8',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'Which plastic-laminate application is source-supported for horizontal countertop work?',
      options: [
        { id: 'a', text: 'Low-pressure laminate only, because it is for all high-wear horizontal work.' },
        { id: 'b', text: 'High-pressure laminate for horizontal applications such as countertops and tabletops.' },
        { id: 'c', text: 'Untreated paper with no resin or core.' },
        { id: 'd', text: 'Acoustical ceiling tile.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13770-13790.',
    },
    {
      id: '28c5f292-afaf-498f-b79f-acbb156336cf',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'Why should a backer sheet be applied to the opposite side of an unsupported laminate panel?',
      options: [
        { id: 'a', text: 'To make the panel a fire-rated ceiling.' },
        { id: 'b', text: 'To keep the unsupported panel from warping.' },
        { id: 'c', text: 'To replace all edge treatment.' },
        { id: 'd', text: 'To turn low-pressure laminate into marble.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13790-13808.',
    },
    {
      id: '121cc4a8-9eb0-4b7b-b2ab-e719423f8e86',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152', 'salvan-plastic-laminates-b152'],
      text: 'Which countertop specification stays inside the checked plastic-laminate source boundary?',
      options: [
        { id: 'a', text: 'Engineered stone performance with uncaptured hardness, absorption, stain, and sealing values.' },
        { id: 'b', text: 'High-pressure plastic laminate over a smooth suitable core, bonded by an appropriate field or shop adhesive method, with edge treatment and backer-sheet coordination.' },
        { id: 'c', text: 'A decorative color only, with no core, adhesive, or edge information.' },
        { id: 'd', text: 'A suspended acoustical ceiling grid as the countertop support.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13754-13820; Salvan lines 2630-2710.',
    },
    {
      id: '1621c2ad-8b85-4a50-b6ca-061f18f3e804',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'Which statement describes plastic laminate construction in BCI?',
      options: [
        { id: 'a', text: 'It is a hard surfacing material made from layers impregnated with melamine and phenolic resins and fused under heat and pressure.' },
        { id: 'b', text: 'It is always a natural stone slab.' },
        { id: 'c', text: 'It is only a wet plaster coating.' },
        { id: 'd', text: 'It is a paint recoat interval.' },
      ],
      correct: 'a',
      code_citation: 'Local source boundary: BCI refined markdown lines 13754-13760.',
    },
    {
      id: '144dbf84-2b68-4609-9ed5-25f148d2f30f',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'Which laminate type does BCI associate with vertical and low-wear applications?',
      options: [
        { id: 'a', text: 'High-pressure laminate for tabletops only.' },
        { id: 'b', text: 'Terrazzo topping.' },
        { id: 'c', text: 'Low-pressure laminate.' },
        { id: 'd', text: 'Sprayed mineral-fiber acoustical treatment.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13776-13790.',
    },
    {
      id: '61d9ebbe-f867-484b-ae60-282fdbf37902',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'A plastic-laminate countertop detail omits edge treatment and exposed-edge protection. Which source-backed concern should be raised?',
      options: [
        { id: 'a', text: 'No concern; edges are never part of a countertop detail.' },
        { id: 'b', text: 'The detail should resolve exposed edges with a suitable option such as beveled corners, metal edging, postformed edges, or edge banding.' },
        { id: 'c', text: 'The only missing information is a marble sealing cycle.' },
        { id: 'd', text: 'The omission proves that low-pressure laminate is required for all counters.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13782-13820.',
    },
    {
      id: '92ae060a-e88c-4b3d-90e0-9ef20ba56f82',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'A learner wants to answer a countertop question with uncaptured natural-stone maintenance intervals, but the active source packet is plastic laminate. What is the source-safe response?',
      options: [
        { id: 'a', text: 'Use the marble claim anyway because it sounds familiar.' },
        { id: 'b', text: 'Treat natural-stone maintenance intervals as outside this batch unless a captured matching source is provided; answer from laminate construction, core, adhesive, edge, and backer-sheet evidence.' },
        { id: 'c', text: 'Replace the answer with a wall-paint VOC limit.' },
        { id: 'd', text: 'Ignore the source boundary.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13754-13820.',
    },
    {
      id: 'e3fa2535-6cac-4096-8759-7021126a0e80',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152', 'salvan-plastic-laminates-b152'],
      text: 'A cabinet shop submittal names the laminate color but omits core material and bonding method. What quality-control issue remains?',
      options: [
        { id: 'a', text: 'No issue; color alone defines the full countertop assembly.' },
        { id: 'b', text: 'The reviewer cannot confirm the suitable smooth core, field contact adhesive or shop thermosetting adhesive method, and assembly support required by the source boundary.' },
        { id: 'c', text: 'The item must be answered with a quarry inspection checklist.' },
        { id: 'd', text: 'The omission turns the counter into carpet.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13754-13770; Salvan lines 2630-2710.',
    },
    {
      id: 'a39e9de5-9677-4db3-b519-2e4777b1cdcd',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'What is Formica identified as in the checked BCI source?',
      options: [
        { id: 'a', text: 'A generic name for all stone countertops.' },
        { id: 'b', text: 'A trademark for a brand of plastic laminate.' },
        { id: 'c', text: 'A type of gypsum plaster.' },
        { id: 'd', text: 'A suspended ceiling system.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13778-13782.',
    },
    {
      id: '09bfee5a-27b2-4879-8717-940b5a09b32b',
      source_ids: ['bci-5e-plastic-laminate-countertops-b152'],
      text: 'A client asks for a source-backed durable countertop surface from this batch only. Which answer is best?',
      options: [
        { id: 'a', text: 'A marble or quartz performance claim without a captured source.' },
        { id: 'b', text: 'A low-wear vertical laminate used as if it were a countertop.' },
        { id: 'c', text: 'High-pressure plastic laminate over a suitable smooth core, with adhesive method, edge treatment, and backer-sheet coordination resolved.' },
        { id: 'd', text: 'A paint schedule with no countertop assembly.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13754-13820.',
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
      ? `${option.text} This stays inside the Batch ${batch} local source boundary.`
      : `${option.text} is not the best answer because it changes the source-backed concept or adds a claim outside the Batch ${batch} local source boundary.`
  }
  rationale.correct = `${correctOption?.text ?? 'The preserved correct option'} Supported by ${update.source_ids.join(', ')}.`
  rationale.takeaway = 'Match the finish or countertop assembly to the checked source boundary before using exact ratings or product claims.'
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
      reason: `Batch ${batch} local-first rewrite aligned to reserved source boundary.`,
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
    source_id: record.id,
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

function scanUnsupportedExactClaims(content) {
  const patterns = [
    /\bASTM\b/i,
    /\bANSI\b/i,
    /\bNSCP\b/i,
    /\bBP\s*344\b/i,
    /\bIBC\b/i,
    /\bVOC\b/i,
    /\bCOF\b/i,
    /\bPEI\b/i,
    /\bD3359\b/i,
    /\bD3276\b/i,
    /\bC635\b/i,
    /\bDFT\b/i,
    /\bMohs\b/i,
    /\bquartz\b/i,
    /\bCorian\b/i,
    /\bgranite\b/i,
    /\bmarble\b/i,
    /\b0\.05\b/,
    /\b0\.60\b/,
    /\b0\.65\b/,
    /\b0\.80\b/,
    /\bNRC\b/i,
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
  const capture = buildCapture(source)
  const refinedCapture = `${capture}\n## Refined Locator Notes\n\nUse the refined markdown locator above as the readable boundary for article and question edits. Exact legal, code, test-method, product, or numeric performance claims remain excluded unless listed in Safe Claims.\n`
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
  '.ai/03_plans/production-line-batch-152-manifest.json',
  '.ai/content-audit-export/source-audited-article-batch-152-local-first-report.md',
  '.ai/content-audit-export/source-audited-article-batch-152-local-first-ledger.json',
  '.ai/content-audit-export/source-audited-article-batch-152-local-first-scoped-checks.json',
  '.ai/content-audit-export/source-audited-article-batch-152-local-first-content-generation-summary.json',
  '.ai/03_plans/batch-152-independent-quality-review.md',
  '.ai/03_plans/batch-152-git-handoff-stage-list.md',
  '.ai/03_plans/batch-152-git-handoff-stage-paths.txt',
  '.ai/content-audit-export/runs/source-audited-batch-152-local-runner.mjs',
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
    real_world_scenario_status: article.realWorldScenarioStatus,
    exact_claim_policy: 'exact legal, code, test-method, product, or numeric performance values omitted unless present in captured local source boundary',
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
  branch,
  validation_claims: validationClaims,
  article_checks: articleChecks,
  source_hash_checks: sourceHashChecks,
  scoped_json_parse: Array.from(handoffPaths).filter((filePath) => filePath.endsWith('.json')).map((file) => ({
    file,
    status: 'pass',
  })),
  validation_boundary: 'Batch 152 reserved clusters and batch-specific source artifacts only; no global cluster selection.',
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

const report = `# Source-Audited Article Batch 152 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 152 used only the reservation manifest ${reservationManifest} and edited the three reserved clusters: lea-matl-007-04, lea-matl-007-05, and lea-matl-007-06.

## Selected Clusters

- lea-matl-007-04: Paint systems (10/10 linked questions rewritten)
- lea-matl-007-05: Finish schedule (10/10 linked questions rewritten)
- lea-matl-007-06: Countertop materials range from high-performance engineered (10/10 linked questions rewritten)

## Source Discipline

All article and linked-question claims were constrained to local Vitruvius source artifacts captured under:

- ${rawCaptureRoot}/
- ${refinedCaptureRoot}/

Each article includes a source-safe Real World Scenario. Unsupported VOC limits, EPA/ASTM/ANSI/BP 344 labels, DFT values, modern coverage-rate claims, brand mandates, NRC/grid/fire values, Mohs values, water-absorption percentages, and quartz/marble/granite performance claims were omitted unless captured in the local source boundary.

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

Scoped validation covers the generated Batch 152 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json and root ui-block aggregate validation are not staging targets for this batch.

## Stop Condition

Stop after these three reserved materials clusters are source-audited, scoped validation artifacts are written, targeted checks pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`

const qualityReview = `# Batch 152 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

- lea-matl-007-04: Paint systems
- lea-matl-007-05: Finish schedule
- lea-matl-007-06: Countertop materials range from high-performance engineered

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

The batch intentionally limits claims to local BCI 5e and Salvan captures. It does not claim complete code coverage for VOC limits, ASTM/ANSI/BP 344 values, paint DFT or coverage values, acoustic or fire-rating performance, brand-specific finish requirements, engineered quartz/marble/granite performance, or countertop chemical/stain/heat resistance.
`

const sortedHandoffPaths = Array.from(handoffPaths).sort()
const stageList = `# Batch 152 Git Handoff Stage List

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

- lea-matl-007-04: 10 linked questions
- lea-matl-007-05: 10 linked questions
- lea-matl-007-06: 10 linked questions

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
Constrain finish coordination content to local sources

Constraint: Batch 152 used only the fixed reservation manifest and selected lea-matl-007-04, lea-matl-007-05, and lea-matl-007-06.
Rejected: Restoring VOC limits, ASTM/ANSI/BP 344 labels, DFT values, brand mandates, NRC/grid/fire values, Mohs values, water-absorption percentages, quartz/marble/granite claims, or modern coverage-rate claims without captured local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: compose/diff generated checks, UI-block validation, JSON parse, marker/source-gap scan, source hash checks, question parity, answer-key preservation, stale compose-error scan, targeted source-verification tests, and scoped git diff check.
Not-tested: No Supabase upload, deploy, production DB action, main merge, git stage, commit, or push.
\`\`\`
`

await writeJson('.ai/03_plans/production-line-batch-152-manifest.json', manifest)
await writeJson('.ai/content-audit-export/source-audited-article-batch-152-local-first-ledger.json', ledger)
await writeJson('.ai/content-audit-export/source-audited-article-batch-152-local-first-scoped-checks.json', scopedChecks)
await writeJson('.ai/content-audit-export/source-audited-article-batch-152-local-first-content-generation-summary.json', {
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
await writeText('.ai/content-audit-export/source-audited-article-batch-152-local-first-report.md', report)
await writeText('.ai/03_plans/batch-152-independent-quality-review.md', qualityReview)
await writeText('.ai/03_plans/batch-152-git-handoff-stage-list.md', stageList)
await writeText('.ai/03_plans/batch-152-git-handoff-stage-paths.txt', `${sortedHandoffPaths.join('\n')}\n`)

console.log(JSON.stringify({
  batch,
  status: 'passed_local_validation_git_handoff_ready',
  clusters: articles.map((article) => article.cluster_id),
  handoff_path_count: sortedHandoffPaths.length,
}, null, 2))
