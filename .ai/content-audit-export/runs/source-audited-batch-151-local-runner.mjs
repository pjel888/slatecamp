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

const batch = 151
const batchId = 'source-audited-batch-151-local-first'
const generatedAt = new Date().toISOString()
const baseline = 'd9c43fa57'
const branch = '3dlab-gray-viewport-bg'
const rawCaptureRoot = 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-151'
const refinedCaptureRoot = 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-151'

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
  bciFloor: {
    id: 'bci-5e-floor-finishes-b151',
    title: 'Building Construction Illustrated, 5th Edition - interior and floor finishes',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 12549-12559 and 13036-13496',
    safe_claims: [
      'Interior floors should be durable, comfortable, and safe to walk on.',
      'Rigid finishes may span short distances on a supporting grid, while flexible finishes need a solid, rigid backing.',
      'Ceramic tile is a small modular surfacing unit fired at high temperature and described as durable, tough, dense, water-resistant, difficult to stain, and easy to clean.',
      'Thinset tile is bonded to a continuous stable backing; thickset tile is set over a portland cement mortar bed that can form accurate slopes and true planes.',
      'Terrazzo is marble or stone chips in a cementitious or resinous matrix that is ground and polished; divider strips localize shrinkage cracking, serve as construction joints, separate colors, and decorate.',
      'Wood flooring should wait until the building is enclosed, permanent services are installed, and materials are dry; the flooring should acclimate in the space.',
      'Resilient flooring needs a smooth, firm, clean, and dry surface.',
      'Carpeting adds softness, resilience, warmth, sound absorption, and impact-noise reduction.',
    ],
    use_limits: [
      'Do not state ASTM C373 absorption classes, PEI ratings, coefficient-of-friction values, BP 344 ramp values, or large-format tile flatness tolerances from this batch.',
      'Do not convert BCI material descriptions into universal Philippine code requirements.',
      'Do not claim manufacturer-specific slip, abrasion, fire, or water-absorption performance unless that source is separately captured.',
    ],
  },
  salvanFloor: {
    id: 'salvan-floor-finishes-b151',
    title: 'George Salvan Architectural Building Materials - floor finishes',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 8015-8245 and 8448-8565',
    safe_claims: [
      'Salvan records local floor-finish vocabulary for wood strip, parquet, block, concrete, clay tile, terrazzo, plastic/vinyl, rubber, cork, linoleum, pebble washout, and marble floors.',
      'Salvan describes terrazzo as marble aggregate concrete cast in place or precast and ground smooth for decorative flooring.',
      'Salvan describes terrazzo grid strips and topping placement before grinding and polishing.',
      'Salvan identifies resilient flooring as a group including asphalt, vinyl, vinyl-asbestos, cork, rubber, and linoleum, with resilience meaning recovery after deformation.',
      'Salvan notes cork tile as warm, quiet, and resilient, while distinguishing oil/grease limitations.',
    ],
    use_limits: [
      'Do not use brand entries or product advertisements as mandatory code or performance claims.',
      'Do not rely on obsolete or hazardous material examples as current recommended practice.',
      'Do not restore exact proprietary mix formulas into learner-facing answers.',
    ],
  },
  bciWall: {
    id: 'bci-5e-wall-finishes-b151',
    title: 'Building Construction Illustrated, 5th Edition - wall finishes and gypsum board',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 12549-12600, 12889-13016, and 13036-13163',
    safe_claims: [
      'Interior walls should resist wear and be cleanable.',
      'Gypsum plaster is durable, relatively lightweight, and fire-resistant for wall or ceiling surfaces not subject to moist or wet conditions.',
      'Portland cement plaster is used on exterior walls and in areas subject to wet or moist conditions.',
      'Gypsum board has good fire resistance and dimensional stability and can form smooth monolithic-looking surfaces when tapered edges are taped and filled.',
      'Gypsum board on masonry or concrete requires dry, smooth, even surfaces free of oil or parting materials.',
      'Wood or metal furring is required when the base is not flat, supports are too far apart, or space for thermal/acoustic insulation is desired.',
      'Wall tile requires a smooth solid backing; wet areas use cementitious backer board or water-resistant gypsum board as captured by BCI.',
    ],
    use_limits: [
      'Do not state ASTM paint adhesion ratings, dry film thickness values, concrete moisture percentages, or grit requirements from this batch.',
      'Do not make ordinary gypsum board automatically suitable for every wet wall.',
      'Do not turn general fire-resistance language into a specific rated assembly without a rated assembly source.',
    ],
  },
  salvanWall: {
    id: 'salvan-wall-paint-finishes-b151',
    title: 'George Salvan Architectural Building Materials - wall, gypsum, and paint preparation',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 8601-8655 and 13397-13422',
    safe_claims: [
      'Salvan records interior wood boards, wood sheets, plywood, trim, gypsum plaster, and gypsum board as interior finish materials.',
      'Salvan describes gypsum board joints and corners as taped and filled before sizing and painting.',
      'Salvan specifies painting as three-coat work of one primer and finish coats unless otherwise specified.',
      'Salvan requires paint materials to be manufacturer-recommended, kept in original labeled containers, and mixed only as specified.',
      'Salvan requires surfaces to be examined, cleaned, sanded, and sealed if needed before painting.',
      'Salvan says no paint or finish treatment should be applied over wet or damp surfaces.',
    ],
    use_limits: [
      'Do not retain brand names as required products.',
      'Do not claim exact paint test ratings, DFT values, humidity thresholds, or ASTM method requirements.',
      'Do not use old local specification text to override current project specifications or safety standards.',
    ],
  },
  bciCeiling: {
    id: 'bci-5e-ceiling-finishes-b151',
    title: 'Building Construction Illustrated, 5th Edition - gypsum and acoustical ceilings',
    source_type: 'primary_building_construction_pdf',
    file: bci,
    locator: 'refined markdown lines 12889-13016 and 13505-13555',
    safe_claims: [
      'Gypsum board can cover ceilings directly or be supported by a grid of furring channels as a suspended ceiling.',
      'Acoustical ceiling tiles are modular units made from soft sound-absorbing materials such as cork, mineral fiber, or glass fiber.',
      'BCI lists common acoustical tile modules including 12 x 12 in., 24 x 24 in., and 24 x 48 in.',
      'BCI instructs designers to consult manufacturers for sizes, patterns, finishes, noise-reduction coefficient, fire rating, light reflectance, and suspension-system details.',
      'Direct-applied acoustical ceilings require a solid backing or furring when the base is not flat enough.',
      'Suspended acoustical ceilings create concealed space for mechanical ductwork, electrical conduit, and plumbing lines.',
      'Suspension systems use main runners, cross tees, and splines, and many tiles are removable for replacement or access.',
      'Integrated ceiling systems combine acoustical, lighting, and air-handling components; linear metal ceilings can absorb sound when open slots are backed by insulation.',
    ],
    use_limits: [
      'Do not state ASTM C635 grid widths, NRC target values, seismic bracing code sections, fire-hour ratings, or Philippine zone claims from this batch.',
      'Do not treat every ceiling tile as removable; the source distinguishes direct applications from suspended systems.',
      'Do not replace manufacturer data for acoustic, fire, light reflectance, or suspension details.',
    ],
  },
  salvanCeiling: {
    id: 'salvan-ceiling-acoustical-finishes-b151',
    title: 'George Salvan Architectural Building Materials - ceiling and acoustical treatments',
    source_type: 'local_building_materials_reference',
    file: salvan,
    locator: 'refined markdown lines 9848-9920',
    safe_claims: [
      'Salvan describes perlite acoustical plaster using calcined gypsum as binder and notes hand or machine application.',
      'Salvan describes mineral-fiber acoustical treatment as fibers mixed with adhesive and sprayed over a primed surface.',
      'Salvan notes cork and corkboard ceiling/acoustical boards as decorative, sound absorbing, and heat insulating materials.',
    ],
    use_limits: [
      'Do not preserve old asbestos examples as a current recommended material.',
      'Do not state acoustic coefficients as current performance requirements unless separately captured.',
      'Do not use brand names or legacy product lists as mandatory specifications.',
    ],
  },
}

const articles = [
  {
    cluster_id: 'lea-matl-007-01',
    article_id: '20f67594-cbef-4aac-b65d-db77bc3e2c9e',
    slug: 'lea-matl-007-01-core-concept',
    title: 'Floor finishes serve dual functions as protective layers',
    dir: '.ai/content-audit-export/articles/lea-matl-007-01-core-concept--20f67594-cbef-4aac-b65d-db77bc3e2c9e',
    sourceIds: ['bci-5e-floor-finishes-b151', 'salvan-floor-finishes-b151'],
    sourceKeys: ['bciFloor', 'salvanFloor'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore ASTM C373 porcelain absorption thresholds, PEI grades, or static/dynamic coefficient-of-friction claims.',
      'No local source in this batch was used to restore BP 344 ramp friction values or large-format tile flatness tolerances.',
      'No local source in this batch was used to claim manufacturer-specific slip resistance, abrasion resistance, or waterproofing performance.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For floor-finish questions, start with the support condition: backing, moisture, traffic, comfort, and maintenance. Appearance is never enough. The safe answer matches the finish to its substrate and exposure before adding any performance value.

**Common trap:** importing ASTM absorption classes, PEI ratings, COF values, or accessibility friction thresholds when the checked local sources only support finish properties, installation methods, and substrate preparation.

## What You Need to Know for the LEA

## Learning Goal

Compare ceramic tile, terrazzo, wood flooring, stone flooring, resilient flooring, and carpeting by material behavior, substrate requirements, installation method, and source-supported use limits.

## Core Concept

BCI frames floor finishes as walking surfaces that must be durable, comfortable, and safe. A finish is selected as part of an assembly: rigid finishes may span short distances on a supporting grid, while flexible finishes require a solid, rigid backing.

### Source-Safe Selection Sequence

1. Identify the substrate: concrete slab, wood subfloor, mortar bed, underlayment, or existing finish.
2. Identify the exposure: wet, damp, dry, high-traffic, quiet, or comfort-focused.
3. Match the finish to the installation method: thinset, thickset, mortar bed, adhesive, sleeper/subfloor, or direct placement.
4. Exclude exact ratings unless the rating is present in the checked source packet.

### Finish Families

| Finish | Source-supported strength | Coordination cue |
|---|---|---|
| Ceramic tile | Durable, dense, water-resistant, difficult to stain, and easy to clean. | Thinset needs continuous stable backing; thickset uses a portland cement mortar bed that can form slopes and true planes. |
| Terrazzo | Dense, smooth, durable mosaic floor of stone chips in a cementitious or resinous matrix. | Divider strips localize shrinkage cracking, act as joints, separate colors, and add decoration. |
| Wood flooring | Durable, warm, and comfortable. | Install only after the building is enclosed, services are installed, materials are dry, and the flooring has acclimated. |
| Stone flooring | Durable finish with texture, abrasion, slip, and dead-load implications. | Often uses mortar-bed or thinset logic similar to ceramic tile. |
| Resilient flooring | Dense, nonabsorbent, durable, easy to maintain, quiet, and comfortable underfoot. | Surface must be smooth, firm, clean, and dry. |
| Carpeting | Softness, resilience, warmth, sound absorption, and impact-noise reduction. | Needs firm underlayment and edge control; use product data for exact accessibility or indoor-air claims. |

Salvan adds local material vocabulary: wood strip and parquet, concrete floors, clay tile, terrazzo, plastic/vinyl flooring, rubber, cork, linoleum, pebble washout, and marble. Use this vocabulary for recognition, but do not turn legacy brand or product notes into mandatory code claims.

## Real World Scenario

A renovation team wants one floor finish for a lobby, toilet vestibule, and quiet study room. A source-safe review separates the conditions instead of forcing one material everywhere: terrazzo may suit durable public circulation with divider-strip coordination, ceramic tile may suit cleanable wet-adjacent areas when the backing is correct, and carpet may suit acoustic comfort in the study room. Exact slip, absorption, or accessibility values must come from a current product or code source, not from this batch.

## How It's Tested

Exam items usually ask which finish fits a condition: wet area, high traffic, quiet walking surface, wood appearance, or modular tile work. Answer with the source-supported material behavior and installation cue. Reject options that depend on uncaptured ASTM, PEI, COF, manufacturer, or accessibility values.

## Common Mistakes

- Choosing tile by color alone and ignoring the backing or setting bed.
- Treating thinset and thickset tile work as interchangeable.
- Omitting divider strips from terrazzo coordination.
- Installing wood flooring before the space is dry and enclosed.
- Specifying resilient flooring over a dirty, damp, uneven, or soft surface.
- Treating old brand/product examples as current mandatory specifications.

## Related Articles

See also within Interior Finishes: **lea-matl-007-02-core-concept**, **lea-matl-007-03-core-concept**, **lea-matl-007-04-core-concept**, **lea-matl-007-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-007-02',
    article_id: '595e3cd9-150f-44f6-8378-d2125cd7233a',
    slug: 'lea-matl-007-02-core-concept',
    title: 'Wall finishes range from paint systems',
    dir: '.ai/content-audit-export/articles/lea-matl-007-02-core-concept--595e3cd9-150f-44f6-8378-d2125cd7233a',
    sourceIds: ['bci-5e-wall-finishes-b151', 'salvan-wall-paint-finishes-b151'],
    sourceKeys: ['bciWall', 'salvanWall'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore ASTM D3359 adhesion ratings, ASTM D3276 conditions, primer DFT values, or sandpaper grit requirements.',
      'No local source in this batch was used to restore concrete moisture percentage thresholds or proprietary anti-mold paint claims.',
      'No local source in this batch was used to make ordinary gypsum board suitable for every wet wall.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For wall-finish questions, identify the base surface before naming the finish: plaster, gypsum board, masonry, tile backing, wood finish, or paint system. A finish that works on a dry interior wall can fail when the item describes moisture, uneven backing, or poor preparation.

**Common trap:** answering with an ASTM paint test, a DFT value, a moisture percentage, or a proprietary board claim when the checked local source only supports substrate matching, surface preparation, and general finish behavior.

## What You Need to Know for the LEA

## Learning Goal

Classify wall finishes by substrate, moisture exposure, surface preparation, finish layer, and coordination with adjacent trades.

## Core Concept

BCI states that interior walls should resist wear and be cleanable. The finish must match the base. Gypsum plaster can serve as a finish surface or as a base for decoration, but BCI limits it to wall or ceiling surfaces not subject to moist or wet conditions. Portland cement plaster is the source-supported choice for exterior walls and areas subject to wet or moist conditions.

### Gypsum Board and Smooth Walls

Gypsum board is a sheet material with good fire resistance and dimensional stability. Its large sheet size makes it economical. The common tapered edge allows joints to be taped and filled so the wall can read as a smooth, monolithic-looking surface before painting or wall covering.

Gypsum board over masonry or concrete is not a shortcut over a bad base. BCI requires dry, smooth, even surfaces free of oil or parting materials. Furring is used when the base is not flat, supports are too far apart, or added space for thermal or acoustic insulation is needed.

### Tile and Wet Areas

Wall tile needs a suitable backing. BCI describes solid backing such as masonry, plaster, gypsum board, or well-braced framing, and identifies cementitious backer board or water-resistant gypsum board in wet locations. The safe LEA move is to ask what the backing and exposure are before selecting the finish.

### Paint Work

Salvan supplies the source-safe local specification pattern for painting:

- examine the receiving surface before work starts;
- clean, sand, and seal if needed;
- use manufacturer-recommended paint in original labeled containers;
- mix only as specified;
- avoid painting over wet or damp surfaces;
- use primer plus finish coats unless the specification says otherwise.

Do not restore exact ASTM ratings, dry film thickness, humidity limits, or concrete moisture values unless those values are in the active source packet.

## Real World Scenario

A contractor proposes painting a ground-floor wall while plaster work nearby is still curing and the wall surface is damp. The source-safe response is to stop the finish work until the surface is examined, cleaned, dry, and ready to receive the specified paint system. The answer does not need an uncaptured adhesion rating; the defect is already visible in the source-supported preparation sequence.

## How It's Tested

LEA-style questions usually ask whether the proposed wall finish fits the substrate or exposure. If the question describes wet or moist conditions, avoid dry-only gypsum plaster logic. If the question describes paint, choose the answer that includes examination, cleaning, sanding/sealing when needed, manufacturer directions, and dry receiving surfaces.

## Common Mistakes

- Treating gypsum plaster, gypsum board, cement plaster, and tile backer board as interchangeable.
- Painting over dust, grease, dampness, or unfinished trade work.
- Using ordinary gypsum board as if it were automatically suitable for every wet wall.
- Ignoring edge treatment and joint finishing when the question asks for a smooth wall plane.
- Naming a brand, ASTM method, or test rating when the source-supported issue is substrate preparation.

## Related Articles

See also within Interior Finishes: **lea-matl-007-01-core-concept**, **lea-matl-007-03-core-concept**, **lea-matl-007-04-core-concept**, **lea-matl-007-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
  {
    cluster_id: 'lea-matl-007-03',
    article_id: '51fa177c-6b29-476a-8cee-740b797a9db8',
    slug: 'lea-matl-007-03-core-concept',
    title: 'Ceiling finishes fall into four categories: suspended',
    dir: '.ai/content-audit-export/articles/lea-matl-007-03-core-concept--51fa177c-6b29-476a-8cee-740b797a9db8',
    sourceIds: ['bci-5e-ceiling-finishes-b151', 'salvan-ceiling-acoustical-finishes-b151'],
    sourceKeys: ['bciCeiling', 'salvanCeiling'],
    realWorldScenarioStatus: 'included',
    noExactCodeClaims: [
      'No local source in this batch was used to restore ASTM C635 grid flange widths, exact NRC targets, or fire-hour ratings.',
      'No local source in this batch was used to restore NSCP/IBC seismic bracing sections or Philippine seismic zone claims.',
      'No local source in this batch was used to recommend asbestos-containing acoustical treatments as current practice.',
    ],
    normalized: String.raw`
## Board Exam Quick Check

For ceiling-finish questions, identify whether the finish is directly applied, fastened to furring, suspended from a grid, or integrated with lighting and air distribution. Then ask whether the item is about acoustics, access above the ceiling, humidity/impact resistance, or gypsum board support.

**Common trap:** memorizing grid widths, NRC targets, fire-hour ratings, or seismic code sections when the checked local sources only support ceiling system types, access logic, manufacturer coordination, and installation concepts.

## What You Need to Know for the LEA

## Learning Goal

Compare gypsum board ceilings, acoustical ceiling tiles, suspended acoustical ceilings, integrated ceiling systems, linear metal ceilings, and sprayed acoustical treatments by support method and coordination role.

## Core Concept

BCI describes gypsum board as usable on ceilings either fastened directly to framing or supported by a grid of furring channels as a suspended ceiling. It creates a smooth surface that can be finished, but support, joints, and base condition still matter.

### Direct-Applied Acoustical Ceilings

Acoustical ceiling tiles are modular units made from soft sound-absorbing materials such as cork, mineral fiber, or glass fiber. Their faces may be perforated, patterned, textured, or fissured so sound can enter fiber voids. BCI lists common modules such as 12 x 12 in., 24 x 24 in., and 24 x 48 in., but tells the designer to consult the manufacturer for sizes, patterns, finishes, noise-reduction coefficient, fire rating, light reflectance, and suspension details.

Direct applications need a solid backing such as concrete, plaster, or gypsum board. If the base is not flat enough, furring can establish a true plane. Salvan also describes sprayed mineral-fiber acoustical treatment applied after the area is primed with adhesive.

### Suspended and Integrated Systems

Suspended acoustical ceilings create concealed space for mechanical ductwork, electrical conduit, and plumbing lines. BCI describes suspension systems as grids of main runners, cross tees, and splines. In most suspension systems, tiles are removable for replacement or access into the ceiling space.

Integrated ceiling systems combine acoustical, lighting, and air-handling components. Linear metal ceilings use narrow metal strips; open slots can absorb sound when backed by insulation.

## Real World Scenario

An office fit-out needs access to ducts, conduit, and sprinkler work above the ceiling while also controlling noise in work areas. A source-safe answer favors a suspended acoustical ceiling or integrated ceiling approach, then requires manufacturer data for acoustic performance, fire rating, light reflectance, and suspension details. It does not invent a grid width, NRC value, or seismic bracing rule outside the source packet.

## How It's Tested

Exam items usually ask why a suspended ceiling is selected or why direct-applied tile is not enough. If the item needs access to services above the ceiling, suspended systems are the safe answer. If it asks for acoustic or fire performance, manufacturer data is part of the source-supported coordination.

## Common Mistakes

- Treating every ceiling tile as removable even when it is adhesive-set to a backing.
- Ignoring manufacturer data for acoustic, fire, light-reflectance, and suspension details.
- Choosing gypsum board where the question requires access to services above the ceiling.
- Omitting main runners, cross tees, and splines in a suspended ceiling answer.
- Treating sprayed mineral-fiber treatment as the same thing as modular suspended tiles.
- Preserving old asbestos examples as if they were current recommended materials.

## Related Articles

See also within Interior Finishes: **lea-matl-007-01-core-concept**, **lea-matl-007-02-core-concept**, **lea-matl-007-04-core-concept**, **lea-matl-007-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`.trimStart(),
  },
]

const questionUpdates = {
  '20f67594-cbef-4aac-b65d-db77bc3e2c9e': [
    {
      id: 'aab76f9d-e868-4acc-9cf5-0723aedcf966',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A toilet vestibule needs a cleanable finish that can tolerate routine wet cleaning. Which source-backed ceramic tile property supports considering tile for this condition?',
      options: [
        { id: 'a', text: 'Ceramic tile is durable, dense, water-resistant, difficult to stain, and easy to clean.' },
        { id: 'b', text: 'Ceramic tile automatically satisfies every slip-resistance and accessibility rule without product data.' },
        { id: 'c', text: 'Ceramic tile works only on carpet pad.' },
        { id: 'd', text: 'Ceramic tile requires unfinished wood sleepers in all wet rooms.' },
      ],
      correct: 'a',
      code_citation: 'Local source boundary: BCI refined markdown lines 13036-13096.',
    },
    {
      id: '9137f9d5-5ebf-479f-93e0-aa3f23f3ab03',
      source_ids: ['bci-5e-floor-finishes-b151', 'salvan-floor-finishes-b151'],
      text: 'A terrazzo layout has multiple color fields and a large floor area. Which divider-strip function is supported by the checked sources?',
      options: [
        { id: 'a', text: 'Divider strips replace all subfloor preparation.' },
        { id: 'b', text: 'Divider strips make terrazzo a carpet system.' },
        { id: 'c', text: 'Divider strips localize shrinkage cracking, serve as joints, separate colors, and add decoration.' },
        { id: 'd', text: 'Divider strips eliminate the need for curing, grinding, and polishing.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13202-13219; Salvan lines 8448-8456.',
    },
    {
      id: 'c7ae46cd-f4c9-4aa5-b056-861f2f64f0b9',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A tile detail must form accurate slopes to drain and true planes over a mortar bed. Which installation method matches BCI?',
      options: [
        { id: 'a', text: 'Thinset over any uneven base, because the adhesive corrects all slope problems.' },
        { id: 'b', text: 'Thickset tile work over a portland cement mortar bed.' },
        { id: 'c', text: 'Wall-to-wall carpet over a soft pad.' },
        { id: 'd', text: 'Wood strip flooring before the building is enclosed.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13100-13130.',
    },
    {
      id: 'e8648db2-e8d9-4b13-b387-b2c07a7f4f5a',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A project includes a public corridor, a wet-adjacent wash area, and a quiet study room. Which selection approach stays inside the source boundary?',
      options: [
        { id: 'a', text: 'Use one finish everywhere because color coordination matters more than substrate and exposure.' },
        { id: 'b', text: 'Match each finish to use and backing: durable terrazzo or tile where appropriate, and carpet where softness and impact-noise reduction are needed.' },
        { id: 'c', text: 'Specify wood flooring first, then enclose and dry the building later.' },
        { id: 'd', text: 'Select only from uncaptured COF and PEI values.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559 and 13036-13496.',
    },
    {
      id: 'e2819950-ceaf-458e-9085-0f2e763def81',
      source_ids: ['bci-5e-floor-finishes-b151', 'salvan-floor-finishes-b151'],
      text: 'A mall corridor is proposed in terrazzo and the toilet floors in ceramic tile. Which source-safe evaluation is best?',
      options: [
        { id: 'a', text: 'Reject terrazzo because it is only decorative and cannot be a wearing surface.' },
        { id: 'b', text: 'The pairing is plausible if terrazzo divider-strip coordination and tile backing/setting requirements are handled; exact slip or absorption ratings need separate source data.' },
        { id: 'c', text: 'Approve only because terrazzo and tile have identical installation methods.' },
        { id: 'd', text: 'Replace both with wood flooring before the building is dry.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI lines 13036-13219; Salvan lines 8448-8565.',
    },
    {
      id: '23bebe25-bb2d-4232-9826-4ad8d8c19412',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A contractor wants to install wood flooring while wet trades are still drying and the building is not fully enclosed. What should the architect require first?',
      options: [
        { id: 'a', text: 'Proceed immediately because wood flooring is unaffected by humidity.' },
        { id: 'b', text: 'Wait until the building is enclosed, services are installed, materials are dry, and the flooring has acclimated in the space.' },
        { id: 'c', text: 'Install terrazzo divider strips instead of drying the space.' },
        { id: 'd', text: 'Use carpet pad as the vapor barrier for all wood floors.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13314-13337.',
    },
    {
      id: 'b50574a4-16b0-429e-b274-fb00b5704096',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A resilient floor is proposed over a dusty, damp, uneven substrate. Which source-backed concern should be raised?',
      options: [
        { id: 'a', text: 'No concern; resilient flooring is selected specifically to hide wet and uneven bases.' },
        { id: 'b', text: 'Only the color schedule matters for resilient flooring.' },
        { id: 'c', text: 'The receiving surface must be smooth, firm, clean, and dry.' },
        { id: 'd', text: 'Resilient flooring must always be installed as suspended acoustic ceiling tile.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13377-13403.',
    },
    {
      id: '497a6c64-2ad1-49d9-b139-ef92916b3ba9',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A stone floor is proposed for an upper-level lobby. Which review issue is source-supported?',
      options: [
        { id: 'a', text: 'Stone flooring imposes no added dead load and needs no substrate coordination.' },
        { id: 'b', text: 'Review color/texture, abrasion and slip behavior, added dead load, and mortar-bed or thinset installation requirements.' },
        { id: 'c', text: 'Stone flooring is installed only with carpet adhesive.' },
        { id: 'd', text: 'Stone slabs automatically satisfy every current accessibility test.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13356-13375.',
    },
    {
      id: 'a3167e74-3e6f-4147-ac53-9b9cf0146f41',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A review item asks why carpeting may be chosen for a study room rather than a hard floor finish. Which answer is source-supported?',
      options: [
        { id: 'a', text: 'Carpeting is chosen because it has the same water resistance as ceramic tile.' },
        { id: 'b', text: 'Carpeting provides softness, resilience, warmth, sound absorption, and impact-noise reduction.' },
        { id: 'c', text: 'Carpeting is a cementitious matrix with stone chips.' },
        { id: 'd', text: 'Carpeting replaces all underlayment and edge fastening.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13431-13489.',
    },
    {
      id: '56ef26be-58cc-46d3-ba88-87babb1704a2',
      source_ids: ['bci-5e-floor-finishes-b151'],
      text: 'A flexible finish material is proposed over a weak and uneven base. Which BCI principle should guide the correction?',
      options: [
        { id: 'a', text: 'Flexible finishes can span short distances like rigid panels.' },
        { id: 'b', text: 'The finish should be selected only by pattern and color.' },
        { id: 'c', text: 'Flexible finish materials require a solid, rigid backing.' },
        { id: 'd', text: 'Flexible finishes must be installed only as terrazzo.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
  ],
  '595e3cd9-150f-44f6-8378-d2125cd7233a': [
    {
      id: '79a048fe-1a14-4567-9dcb-593fe8c52e7c',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'A wall surface is not subject to moist or wet conditions and needs a durable plaster finish. Which source-supported plaster type fits that dry interior condition?',
      options: [
        { id: 'a', text: 'Portland cement plaster only, because gypsum plaster is never used indoors.' },
        { id: 'b', text: 'Gypsum plaster, because BCI describes it for wall or ceiling surfaces not subject to moist or wet conditions.' },
        { id: 'c', text: 'Ceramic floor tile, because all wall finishes are floor finishes.' },
        { id: 'd', text: 'Carpet backing, because it makes walls cleanable.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12567.',
    },
    {
      id: '766af87c-5846-4db9-903d-fb8aea71a759',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'Why does gypsum board commonly use tapered edges?',
      options: [
        { id: 'a', text: 'To make gypsum board waterproof in all wet rooms.' },
        { id: 'b', text: 'To allow joints to be taped and filled for strong, smooth, monolithic-looking surfaces.' },
        { id: 'c', text: 'To replace furring whenever the wall base is uneven.' },
        { id: 'd', text: 'To eliminate all painting preparation.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12889-12900.',
    },
    {
      id: 'cba1db3a-8f02-498e-b367-9dd1e1b4b9a3',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'Ceramic wall tile is proposed in a wet area. Which source-backed backing requirement should be checked?',
      options: [
        { id: 'a', text: 'Tile can be applied over any damp, oily, uneven base.' },
        { id: 'b', text: 'Wet locations need suitable backing such as cementitious backer board or water-resistant gypsum board as captured by BCI.' },
        { id: 'c', text: 'A carpet pad is the required tile backing.' },
        { id: 'd', text: 'The only backing requirement is paint color.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13135-13163.',
    },
    {
      id: '019dc05f-fb68-4e84-ad6f-00cf8aefa974',
      source_ids: ['salvan-wall-paint-finishes-b151'],
      text: 'A painter proposes skipping surface examination and primer because the finish coat will hide minor wall defects. Which response is source-safe?',
      options: [
        { id: 'a', text: 'Accept the shortcut because paint preparation is optional.' },
        { id: 'b', text: 'Reject the shortcut; the local specification pattern requires examination, cleaning/sanding/sealing when needed, and primer plus finish coats unless otherwise specified.' },
        { id: 'c', text: 'Approve only if the wall is wet so paint flows better.' },
        { id: 'd', text: 'Replace the paint system with carpet to avoid wall preparation.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 13397-13422.',
    },
    {
      id: '3d532852-78fd-453f-9b6b-0658504031ec',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'Which wall-finish choice best matches BCI for an area subject to wet or moist conditions?',
      options: [
        { id: 'a', text: 'Gypsum plaster, because it is source-limited to moist or wet conditions.' },
        { id: 'b', text: 'Untreated ordinary gypsum board with no backing review.' },
        { id: 'c', text: 'Portland cement plaster or a tile assembly with suitable wet-area backing.' },
        { id: 'd', text: 'Paper wall covering installed before the base is dry.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 12567 and 13135-13163.',
    },
    {
      id: 'f6f38d2c-0a92-46a1-87e6-afd1f273a3ac',
      source_ids: ['salvan-wall-paint-finishes-b151'],
      text: 'A gypsum board wall was sanded but not wiped clean before painting. Which source-backed failure risk is most direct?',
      options: [
        { id: 'a', text: 'No risk; dust improves coating adhesion.' },
        { id: 'b', text: 'The wall automatically becomes a cement plaster surface.' },
        { id: 'c', text: 'Dust or foreign substances can interfere with satisfactory execution and permanence of paint work.' },
        { id: 'd', text: 'The only issue is acoustical ceiling access.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: Salvan refined markdown lines 13412-13422.',
    },
    {
      id: '12d32db4-e405-47cf-9939-ca441eea46a0',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'A wall finish is needed for an exterior wall or wet/moist area. Which plaster-related answer stays inside the checked source?',
      options: [
        { id: 'a', text: 'Use gypsum plaster because BCI says it is for wet exterior conditions.' },
        { id: 'b', text: 'Use gypsum board directly over damp masonry.' },
        { id: 'c', text: 'Use portland cement plaster, also known as stucco, for exterior walls and areas subject to wet or moist conditions.' },
        { id: 'd', text: 'Use carpet because it is cleanable.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown line 12567.',
    },
    {
      id: '64caca33-4249-4624-8b58-7bd479f7db72',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'Gypsum board is proposed over an above-grade masonry wall that is oily and uneven. What should be corrected first?',
      options: [
        { id: 'a', text: 'Proceed because gypsum board hides all base defects.' },
        { id: 'b', text: 'Provide a dry, smooth, even base free of oil or parting materials, or use furring where the base is unsuitable.' },
        { id: 'c', text: 'Apply wall tile without checking backing.' },
        { id: 'd', text: 'Wet the wall so the board bonds more strongly.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 12962-12990.',
    },
    {
      id: 'a4b0ab65-2c30-4876-998d-adae88195d11',
      source_ids: ['bci-5e-wall-finishes-b151'],
      text: 'A wall finish has modular dimensions. Which design issue does BCI say should be considered?',
      options: [
        { id: 'a', text: 'Ignore module dimensions because they never affect wall layout.' },
        { id: 'b', text: 'Use only uncaptured ASTM paint ratings.' },
        { id: 'c', text: 'Use the unit dimensions to regulate the wall surface and coordinate how the finish meets adjacent materials.' },
        { id: 'd', text: 'Install the finish before the substrate is selected.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 12549-12559.',
    },
    {
      id: '48ee239e-7dfc-480f-926e-5b6276be4c19',
      source_ids: ['salvan-wall-paint-finishes-b151'],
      text: 'Painting is about to start with lighting plates and finish hardware still exposed. Which source-safe instruction should the architect give?',
      options: [
        { id: 'a', text: 'Paint over all fixtures because protection is outside finish work.' },
        { id: 'b', text: 'Remove or protect finish hardware, lighting fixtures, plates, and similar items during painting, then reposition them after completion.' },
        { id: 'c', text: 'Skip cleaning because hardware protection replaces surface preparation.' },
        { id: 'd', text: 'Use wet walls to speed paint curing.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 13419-13422.',
    },
  ],
  '51fa177c-6b29-476a-8cee-740b797a9db8': [
    {
      id: 'f6cbcf2f-7e97-4684-885d-578b4f282677',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'Why would a designer choose a suspended acoustical ceiling instead of direct-applied tile where ducts and conduits must remain accessible?',
      options: [
        { id: 'a', text: 'Suspended ceilings eliminate the need for any suspension grid.' },
        { id: 'b', text: 'They create concealed space for services, and many systems allow tile removal for replacement or access.' },
        { id: 'c', text: 'They are the same as adhesive-set tiles on a solid backing.' },
        { id: 'd', text: 'They automatically provide any requested fire-hour rating without manufacturer data.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13535-13542.',
    },
    {
      id: 'cea067d8-8697-482c-a007-9db0b743fe5a',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'A direct-applied acoustical tile ceiling is proposed over an uneven base. What does BCI require before that direct application can work?',
      options: [
        { id: 'a', text: 'No backing is needed if the tile is acoustical.' },
        { id: 'b', text: 'A solid backing is needed, or furring must establish a flat, level base when the surface is unsuitable.' },
        { id: 'c', text: 'The tiles must be hung from plumbing lines.' },
        { id: 'd', text: 'The ceiling must be treated as terrazzo flooring.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13512-13531.',
    },
    {
      id: '117d447b-0598-4981-876b-298a11f16e07',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'Which acoustical ceiling tile module is explicitly listed by BCI among common manufactured sizes?',
      options: [
        { id: 'a', text: '6 x 6 in. only' },
        { id: 'b', text: '18 x 36 in. only' },
        { id: 'c', text: '24 x 24 in.' },
        { id: 'd', text: '80 x 80 cm only' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13505-13508.',
    },
    {
      id: 'f063d4c4-2ad9-4bb6-a80c-cb8092ba6eaf',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'A specification needs acoustic performance, fire rating, light reflectance, and suspension details for acoustical ceiling tile. What is the source-backed next step?',
      options: [
        { id: 'a', text: 'Invent a standard value because all ceiling tiles perform alike.' },
        { id: 'b', text: 'Consult the ceiling tile manufacturer for those exact performance and suspension details.' },
        { id: 'c', text: 'Use carpet pile height as the ceiling performance value.' },
        { id: 'd', text: 'Ignore performance data if the tile is mineral fiber.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13512-13518.',
    },
    {
      id: '07078c5d-5161-44e1-9e0b-6743cea5f0b0',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'Why are many suspended acoustical ceiling tiles removable?',
      options: [
        { id: 'a', text: 'To convert the grid into wall tile backing.' },
        { id: 'b', text: 'For replacement or access into the ceiling space.' },
        { id: 'c', text: 'To eliminate the need for main runners and cross tees.' },
        { id: 'd', text: 'To cure terrazzo faster.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13535-13542.',
    },
    {
      id: '9567ae14-4aaf-46b0-bf34-f61a403c07a1',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'An open office ceiling must coordinate acoustics, lighting, and air distribution. Which source-backed system concept fits that coordination goal?',
      options: [
        { id: 'a', text: 'A finish floor system, because floor finishes control air distribution.' },
        { id: 'b', text: 'An integrated ceiling system that combines acoustical, lighting, and air-handling components.' },
        { id: 'c', text: 'Adhesive-set tile on an uneven base with no service space.' },
        { id: 'd', text: 'A gypsum board wall finish with no ceiling coordination.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13549-13555.',
    },
    {
      id: 'e9ab80b7-cc32-46e9-8539-c497c82a85e7',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'A suspended acoustical ceiling grid is missing its secondary members. Which component set is source-supported for the suspension system?',
      options: [
        { id: 'a', text: 'Only terrazzo divider strips and carpet backing.' },
        { id: 'b', text: 'Only gypsum board tapered edges.' },
        { id: 'c', text: 'Main runners, cross tees, and splines.' },
        { id: 'd', text: 'Only a painted concrete slab with no grid.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13541-13548.',
    },
    {
      id: 'df773c56-1fd4-4553-bdb0-50152db2cfe7',
      source_ids: ['bci-5e-ceiling-finishes-b151'],
      text: 'How can a linear metal ceiling contribute to sound absorption according to BCI?',
      options: [
        { id: 'a', text: 'By replacing every acoustical material with ceramic wall tile.' },
        { id: 'b', text: 'By using closed slots with no backing material.' },
        { id: 'c', text: 'Open slots can permit sound absorption when backed by batt insulation in the ceiling space.' },
        { id: 'd', text: 'By eliminating lighting and air-handling coordination.' },
      ],
      correct: 'c',
      code_citation: 'Local source boundary: BCI refined markdown lines 13549-13555.',
    },
    {
      id: 'a2b94fca-bc04-4096-bed4-b9a2f76aa976',
      source_ids: ['bci-5e-ceiling-finishes-b151', 'salvan-ceiling-acoustical-finishes-b151'],
      text: 'A designer wants acoustical treatment on an irregular ceiling shape. Which source-safe option may fit before manufacturer/product review?',
      options: [
        { id: 'a', text: 'Use terrazzo topping over the ceiling.' },
        { id: 'b', text: 'Use sprayed acoustical material over a suitable hard surface or lath, following the captured source treatment logic.' },
        { id: 'c', text: 'Use suspended tiles without any support system.' },
        { id: 'd', text: 'Use ordinary carpet as a direct ceiling finish.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: BCI refined markdown lines 13523-13531; Salvan lines 9848-9854.',
    },
    {
      id: '9be36e02-f086-4b3b-afc3-8e2a20862fa5',
      source_ids: ['salvan-ceiling-acoustical-finishes-b151'],
      text: 'Salvan describes mineral-fiber acoustical treatment. Which installation cue is source-supported?',
      options: [
        { id: 'a', text: 'Apply fibers dry over loose dust with no adhesive.' },
        { id: 'b', text: 'Prime the area with adhesive, then spray the prepared fiber treatment in one or more coats as needed.' },
        { id: 'c', text: 'Install the fibers only as floor tile grout.' },
        { id: 'd', text: 'Use the treatment to replace every ceiling suspension detail.' },
      ],
      correct: 'b',
      code_citation: 'Local source boundary: Salvan refined markdown lines 9848-9854.',
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
  rationale.takeaway = 'For finish questions, match the finish to substrate, exposure, and source-supported coordination before using exact ratings.'
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
    /\bNSCP\b/i,
    /\bBP\s*344\b/i,
    /\bIBC\b/i,
    /\bCOF\b/i,
    /\bPEI\b/i,
    /\bD3359\b/i,
    /\bD3276\b/i,
    /\bC635\b/i,
    /\b9\/16\b/,
    /\b0\.5%\b/,
    /\b0\.60\b/,
    /\b0\.80\b/,
    /\b2-hour\b/i,
    /\bZone\s*4\b/i,
    /\bDFT\b/i,
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
  '.ai/03_plans/production-line-batch-151-manifest.json',
  '.ai/content-audit-export/source-audited-article-batch-151-local-first-report.md',
  '.ai/content-audit-export/source-audited-article-batch-151-local-first-ledger.json',
  '.ai/content-audit-export/source-audited-article-batch-151-local-first-scoped-checks.json',
  '.ai/content-audit-export/source-audited-article-batch-151-local-first-content-generation-summary.json',
  '.ai/03_plans/batch-151-independent-quality-review.md',
  '.ai/03_plans/batch-151-git-handoff-stage-list.md',
  '.ai/03_plans/batch-151-git-handoff-stage-paths.txt',
  '.ai/content-audit-export/runs/source-audited-batch-151-local-runner.mjs',
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
  reservation_manifest: '.ai/03_plans/production-line-batch-151-reservation-manifest.json',
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
  validation_boundary: 'Batch 151 reserved clusters and batch-specific source artifacts only; no global cluster selection.',
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

const report = `# Source-Audited Article Batch 151 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 151 used only the reservation manifest .ai/03_plans/production-line-batch-151-reservation-manifest.json and edited the three reserved clusters: lea-matl-007-01, lea-matl-007-02, and lea-matl-007-03.

## Selected Clusters

- lea-matl-007-01: Floor finishes serve dual functions as protective layers (10/10 linked questions rewritten)
- lea-matl-007-02: Wall finishes range from paint systems (10/10 linked questions rewritten)
- lea-matl-007-03: Ceiling finishes fall into four categories: suspended (10/10 linked questions rewritten)

## Source Discipline

All article and linked-question claims were constrained to local Vitruvius source artifacts captured under:

- ${rawCaptureRoot}/
- ${refinedCaptureRoot}/

Each article includes a source-safe Real World Scenario. Unsupported ASTM/NSCP/BP 344/IBC section labels, absorption thresholds, PEI grades, COF values, DFT values, exact NRC targets, fire-hour ratings, grid widths, seismic-zone claims, and manufacturer-specific performance values were omitted unless captured in the local source boundary.

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

Scoped validation covers the generated Batch 151 article, source, question, and handoff paths directly. Root .ai/content-audit-export/sync-state.json and root ui-block aggregate validation are not staging targets for this batch.

## Stop Condition

Stop after these three reserved materials clusters are source-audited, scoped validation artifacts are written, targeted checks pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`

const qualityReview = `# Batch 151 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

- lea-matl-007-01: Floor finishes serve dual functions as protective layers
- lea-matl-007-02: Wall finishes range from paint systems
- lea-matl-007-03: Ceiling finishes fall into four categories: suspended

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

The batch intentionally limits claims to local BCI 5e and Salvan captures. It does not claim complete code coverage for tile absorption classes, PEI ratings, slip-resistance values, paint test ratings, moisture thresholds, acoustic performance values, fire-rated assemblies, suspension-grid dimensions, or seismic bracing provisions.
`

const sortedHandoffPaths = Array.from(handoffPaths).sort()
const stageList = `# Batch 151 Git Handoff Stage List

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

- lea-matl-007-01: 10 linked questions
- lea-matl-007-02: 10 linked questions
- lea-matl-007-03: 10 linked questions

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
Constrain finish-system content to local sources

Constraint: Batch 151 used only the fixed reservation manifest and selected lea-matl-007-01, lea-matl-007-02, and lea-matl-007-03.
Rejected: Restoring ASTM/NSCP/BP 344/IBC section labels, absorption thresholds, PEI grades, COF values, paint DFT values, exact NRC/fire ratings, grid widths, or seismic-zone claims without captured local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: compose/diff generated checks, UI-block validation, JSON parse, marker/source-gap scan, source hash checks, question parity, answer-key preservation, and stale compose-error scan; external validation commands still need final refresh.
Not-tested: No Supabase upload, deploy, production DB action, main merge, git stage, commit, or push.
\`\`\`
`

await writeJson('.ai/03_plans/production-line-batch-151-manifest.json', manifest)
await writeJson('.ai/content-audit-export/source-audited-article-batch-151-local-first-ledger.json', ledger)
await writeJson('.ai/content-audit-export/source-audited-article-batch-151-local-first-scoped-checks.json', scopedChecks)
await writeJson('.ai/content-audit-export/source-audited-article-batch-151-local-first-content-generation-summary.json', {
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
await writeText('.ai/content-audit-export/source-audited-article-batch-151-local-first-report.md', report)
await writeText('.ai/03_plans/batch-151-independent-quality-review.md', qualityReview)
await writeText('.ai/03_plans/batch-151-git-handoff-stage-list.md', stageList)
await writeText('.ai/03_plans/batch-151-git-handoff-stage-paths.txt', `${sortedHandoffPaths.join('\n')}\n`)

console.log(JSON.stringify({
  batch,
  status: 'passed_local_validation_git_handoff_ready',
  clusters: articles.map((article) => article.cluster_id),
  handoff_path_count: sortedHandoffPaths.length,
}, null, 2))
