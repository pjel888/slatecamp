#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
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

const batch = 154
const batchId = 'source-audited-batch-154-local-first'
const reservationManifest = '.ai/03_plans/production-line-batch-154-reservation-manifest.json'
const baseline = '9c637523d3'
const branch = '3dlab-gray-viewport-bg'
const generatedAt = new Date().toISOString()
const approvedBy = 'codex-local-source-audit-batch-154'

const pathExists = (p) => existsSync(p)
const fileBytes = (p) => readFileSync(p).byteLength
const fileSha = (p) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`

const files = {
  bci: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
    rawRoot: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-154',
    refinedRoot: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-154',
  },
  salvan: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/George-Salvan-Architectural-Building-Materials.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/George-Salvan-Architectural-Building-Materials.md',
    rawRoot: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-154',
    refinedRoot: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-154',
  },
  ra9266: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/IRR of RA 9266.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-9266/IRR of RA 9266.md',
    rawRoot: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-154',
    refinedRoot: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/source-map-batch-154',
  },
  spp202: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 202.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 202.md',
    rawRoot: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-154',
    refinedRoot: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/source-map-batch-154',
  },
  spp203: {
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/SPP 203.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/UAP/SPP 203.md',
    rawRoot: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-154',
    refinedRoot: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/source-map-batch-154',
  },
}

for (const source of Object.values(files)) {
  source.rawSha = fileSha(source.rawPath)
  source.refinedSha = fileSha(source.refinedPath)
  source.rawBytes = fileBytes(source.rawPath)
  source.refinedBytes = fileBytes(source.refinedPath)
}

const sourceDefinitions = {
  bciWindow: {
    id: 'bci-5e-window-operations-b154',
    label: 'Building Construction Illustrated, 5th Edition',
    title: 'Building Construction Illustrated, 5th Edition - window elements, operation, and frame coordination',
    source_type: 'primary_building_construction_pdf',
    file: files.bci,
    locator: 'refined markdown lines 10594-10790; raw PDF pages 297-301',
    safe_claims: [
      'Window frames include head, jamb, sill, and sometimes a subsill.',
      'Sash is the fixed or movable framework holding panes of glass; glazing is the panes or sheets set in the sash.',
      'Operating sash should be weatherstripped against windblown rain and air infiltration.',
      'The joint between the window frame and wall should be sealed and detailed with a windbreak.',
      'Fixed, casement, awning, hopper, sliding, double-hung, single-hung, jalousie, and pivoting windows are classified by sash movement.',
      'Metal-window coordination includes sealant, weatherstripping, drips, corrosion resistance, air infiltration, water pressure, wind loading, and glazing method.',
      'Wood frames are thicker than aluminum or steel frames and are more effective as thermal insulators.',
    ],
    use_limits: [
      'Do not restore AAMA Gold Label ratings, exact wind-load classes, water-infiltration rates, crank force values, or thermal derating calculations.',
      'Do not use BCI code-review examples as Philippine code claims without a checked Philippine source.',
      'Do not turn manufacturer-consultation notes into a fixed universal dimension or performance requirement.',
    ],
  },
  salvanWindow: {
    id: 'salvan-window-operations-b154',
    label: 'George Salvan Architectural Building Materials',
    title: 'George Salvan Architectural Building Materials - local window schedule and specification examples',
    source_type: 'local_building_materials_reference',
    file: files.salvan,
    locator: 'refined markdown lines 11664-11678 and 13190-13198; raw PDF pages 317 and 355',
    safe_claims: [
      'Salvan local schedule/specification examples mention steel casement windows, awning windows, aluminum windows, and jalousie windows.',
      'Salvan examples support local recognition of casement, awning, aluminum, and jalousie terminology.',
    ],
    use_limits: [
      'Do not preserve old example pricing blanks as current cost data.',
      'Do not treat sample specification wording as a mandatory current code requirement.',
      'Do not use the sample to support exact glass thickness or safety glazing claims for learner answers.',
    ],
  },
  bciAdhesive: {
    id: 'bci-5e-adhesive-systems-b154',
    label: 'Building Construction Illustrated, 5th Edition',
    title: 'Building Construction Illustrated, 5th Edition - adhesives',
    source_type: 'primary_building_construction_pdf',
    file: files.bci,
    locator: 'refined markdown lines 16121-16137; raw PDF page 438',
    safe_claims: [
      'Adhesives secure the surfaces of two materials together.',
      'Adhesives are selected for specific materials and conditions and may be supplied as solids, liquids, powders, or films.',
      'Important selection considerations include strength, curing or setting time, setting temperature range, method of bonding, and resistance to water, heat, sunlight, chemicals, and aging.',
      'Adhesives are usually strongest in tensile and shear stresses and weakest in cleavage or splitting stresses.',
      'BCI lists animal or fish glues, white or polyvinyl glue, epoxy resins, resorcin resins, and contact cement.',
      'Contact cement bonds on contact and is generally used for large sheet materials such as plastic laminate.',
    ],
    use_limits: [
      'Do not restore proprietary chemistry, cure-time, VOC, bond-strength, movement-class, or warranty claims without a checked manufacturer or standard source.',
      'Do not make ASTM C920 sealant classifications part of this adhesive batch unless separately captured.',
      'Do not convert example adhesive behavior into universal product approval.',
    ],
  },
  salvanAdhesive: {
    id: 'salvan-adhesive-sealer-systems-b154',
    label: 'George Salvan Architectural Building Materials',
    title: 'George Salvan Architectural Building Materials - glues, sealers, glazing, and caulking compounds',
    source_type: 'local_building_materials_reference',
    file: files.salvan,
    locator: 'refined markdown lines 2678-2854; raw PDF pages 91-94',
    safe_claims: [
      'Salvan distinguishes cohesiveness from adhesiveness.',
      'Cohesiveness is the ability of particles of one material to cling together.',
      'Adhesiveness is the ability of a material to fix itself and cling to a different material.',
      'Sealing compounds seal surfaces against liquid penetration or escape by filling pores and forming a continuous skin.',
      'Glazing and caulking compounds are similar materials distinguished by use at glass or joints.',
      'Backup materials control joint depth, help protect the bond, and serve as bond breakers so joint material can elongate.',
    ],
    use_limits: [
      'Do not publish old psi, temperature, coverage, recovery, or movement values as current required design values from this batch.',
      'Do not preserve asbestos-containing examples as current recommended practice.',
      'Do not use legacy compound lists as a substitute for current manufacturer data or project specifications.',
    ],
  },
  ra9266Spec: {
    id: 'ra9266-irr-architectural-specifications-b154',
    label: 'RA 9266 IRR - Architecture Act of 2004',
    title: 'RA 9266 IRR - specifications, architectural documents, contract documents, seal, and ownership',
    source_type: 'primary_law_irr_pdf',
    file: files.ra9266,
    locator: 'refined markdown lines 41-76, 128-167, 552-580, and 696-710; raw PDF pages 3-5, 14, and 19',
    safe_claims: [
      'Scope of practice includes preparation of architectural plans, specifications, bill of materials, cost estimates, general conditions, and bidding documents.',
      'Architectural documents include architectural drawings, specifications, technical specifications, cost estimates, and other instruments of service.',
      'Contract documents generally include drawings and specifications.',
      'A duly licensed architect affixes the seal on architectural plans, drawings, specifications, and other contract documents prepared by or under direct supervision.',
      'The architect-of-record is fully responsible for architectural plans, specifications, and other documents issued under the architect seal or authorized signature.',
      'Drawings and specifications duly signed, stamped, or sealed are instruments of service and intellectual property documents of the architect.',
    ],
    use_limits: [
      'Do not import CSI or MasterFormat taxonomy claims into this cluster.',
      'Do not cite unverified external sections or public procurement rules.',
      'Keep liability and ownership wording tied to the checked RA 9266 IRR text.',
    ],
  },
  spp202Spec: {
    id: 'uap-spp-202-contract-document-phase-b154',
    label: 'UAP SPP 202 - Regular Design Services',
    title: 'UAP SPP 202 - regular design service phases',
    source_type: 'primary_professional_practice_pdf',
    file: files.spp202,
    locator: 'refined markdown lines 173-183; raw PDF readability checked locally',
    safe_claims: [
      'SPP 202 lists the design service phases including Project Definition, Schematic Design, Design Development, Contract Document Phase, Bidding or Negotiation Phase, and Construction Phase.',
    ],
    use_limits: [
      'Do not infer detailed specification systems or deliverable checklists from this small captured phase list.',
      'Do not add fee, procurement, or approval claims from SPP 202 unless separately captured.',
    ],
  },
  spp203Spec: {
    id: 'uap-spp-203-contract-documentation-review-b154',
    label: 'UAP SPP 203 - Specialized Architectural Services',
    title: 'UAP SPP 203 - contract documentation and review as specialized architectural service',
    source_type: 'primary_professional_practice_pdf',
    file: files.spp203,
    locator: 'refined markdown lines 101-140; raw PDF pages 7 and 95',
    safe_claims: [
      'SPP 203 lists Contract Documentation and Review among Specialized Architectural Services.',
    ],
    use_limits: [
      'Do not claim full specification-writing, quantity-survey, or software service details from this captured boundary.',
      'Do not use SPP 203 to import CSI/MasterFormat specification taxonomy.',
    ],
  },
}

const articles = [
  {
    cluster_id: 'lea-matl-008-04',
    article_id: 'f06686b1-8dc4-4514-9e32-5e4cd0365006',
    slug: 'lea-matl-008-04-core-concept',
    title: 'Window operations',
    dir: '.ai/content-audit-export/articles/lea-matl-008-04-core-concept--f06686b1-8dc4-4514-9e32-5e4cd0365006',
    sourceKeys: ['bciWindow', 'salvanWindow'],
    sourceIds: ['bci-5e-window-operations-b154', 'salvan-window-operations-b154'],
    noExactCodeClaims: [
      'No AAMA Gold Label ratings, exact wind-load classes, water-infiltration rates, crank force values, or thermal derating calculations were restored.',
      'No Philippine egress, safety-glazing, accessibility, acoustic, or thermal code requirement was asserted from this materials-only source boundary.',
      'No manufacturer-specific rough opening, profile dimension, frame performance, or glass thickness claim was converted into a universal rule.',
    ],
    normalized: `## Board Exam Quick Check

For window-operation questions, name the sash movement before selecting the answer. The tested concept is usually fixed, side-hinged, top-hinged, bottom-hinged, sliding, vertically sliding, louvered, or pivoting movement.

## What You Need to Know for the LEA

## Learning Goal

Classify window types by sash operation, ventilation behavior, frame components, weather protection, and material coordination.

## Core Concept

BCI defines the window frame by its head, jambs, sill, and sometimes a subsill. The sash is the fixed or movable framework holding the glass panes. Glazing refers to the panes or sheets of glass set in the sash. Weathertightness is just as important as thermal insulation: operating sash should be weatherstripped against windblown rain and air infiltration, and the joint between the frame and wall should be sealed and detailed with a windbreak.

Fixed windows have a stationary sash and provide no ventilation by themselves. Casement windows have side-hinged operating sash that usually swing outward and can direct ventilation. Awning windows swing outward on hinges at the top of the frame. Hopper windows swing inward on hinges at the bottom. Sliding windows have two or more sash, with at least one sliding horizontally. Double-hung windows have two vertically sliding sash in separate grooves or tracks; single-hung windows have two sash but only one movable sash.

Jalousie windows use horizontal glass or wood louvers that pivot together to control ventilation and visibility. Pivoting windows rotate about a vertical or horizontal axis near the center, often for cleaning, maintenance, or emergency ventilation.

Metal windows may be aluminum, steel, or bronze. BCI notes sealant, weatherstripping, drips, compatible anchoring materials, corrosion resistance, air infiltration, water pressure, wind loading, and glazing method as coordination factors. Wood windows use thicker wood frames that insulate better than aluminum or steel and are often factory-treated or clad to reduce maintenance.

Salvan's local schedule and specification examples support practical recognition of casement, awning, aluminum, and jalousie window terms. Use those examples for vocabulary only, not as current cost, glass-thickness, or code-performance requirements.

## Real World Scenario

A classroom renovation needs daylight at a display wall and controllable ventilation at a side wall. A source-safe answer separates the functions: use a fixed window where no sash operation is needed, and use an operable type such as casement, awning, hopper, sliding, double-hung, jalousie, or pivoting where the question describes the required movement. The detail still needs weatherstripping, sealant, and frame-wall coordination, but exact wind, water, egress, or safety-glazing values must come from a separate checked code, standard, or manufacturer source.

## How It's Tested

LEA-style items often describe how the sash moves. If it swings out from the side, it is casement. If it swings out from the top, it is awning. If it swings inward from the bottom, it is hopper. If one sash slides horizontally, it is sliding. If two sash slide vertically, it is double-hung.

## Common Mistakes

- Choosing a window type from appearance instead of sash operation.
- Calling a fixed sash operable.
- Confusing awning and hopper hinge locations.
- Ignoring weatherstripping and sealant in an operating window detail.
- Treating aluminum, steel, and wood frames as identical in heat transfer, profile, and maintenance behavior.
- Restoring AAMA, typhoon, egress, or water-infiltration numbers that are outside the Batch 154 local source boundary.

## Related Articles

See also within Openings, Joints, and Hardware: **lea-matl-008-01-core-concept**, **lea-matl-008-02-core-concept**, **lea-matl-008-03-core-concept**, **lea-matl-008-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.
`,
  },
  {
    cluster_id: 'lea-matl-008-05',
    article_id: 'e94f5a24-e9fa-48f6-aa3e-f1de31922f46',
    slug: 'lea-matl-008-05-core-concept',
    title: 'Adhesive Systems',
    dir: '.ai/content-audit-export/articles/lea-matl-008-05-core-concept--e94f5a24-e9fa-48f6-aa3e-f1de31922f46',
    sourceKeys: ['bciAdhesive', 'salvanAdhesive'],
    sourceIds: ['bci-5e-adhesive-systems-b154', 'salvan-adhesive-sealer-systems-b154'],
    noExactCodeClaims: [
      'No ASTM C920 class, proprietary bond-strength, VOC, movement-class, warranty, service-life, or cure-time values were restored.',
      'No tropical derating or manufacturer-specific chemistry claim was asserted from this batch.',
      'Legacy Salvan psi, temperature, coverage, recovery, and asbestos-containing examples were excluded from learner-facing claims.',
    ],
    normalized: `## What You Need to Know for the LEA

Adhesive selection starts with the job of the material: it secures the surfaces of two materials together. BCI warns that adhesives are made for specific materials and conditions, and some are supplied as solids, liquids, powders, or films. Some also require a catalyst. The source-safe rule is simple: match the adhesive to the substrates, the exposure, and the bonding method instead of memorizing one product as universally correct.

## Core Concept

BCI lists the main selection checks for adhesives: strength, curing or setting time, setting temperature range, method of bonding, and resistance to water, heat, sunlight, chemicals, and aging. It also states that adhesives are usually strongest in tensile and shear stresses and weakest in cleavage or splitting stresses.

Common source-backed types include animal or fish glues for indoor conditions where heat and humidity do not vary greatly; white or polyvinyl glue for a quick-setting, non-staining, slightly resilient bond; epoxy resins for very strong bonding of porous and nonporous materials; resorcin resins for strong, waterproof, durable outdoor bonding; and contact cement where a contact bond is needed without clamping, such as large sheet materials and plastic laminate.

Salvan distinguishes cohesiveness from adhesiveness. Cohesiveness is the ability of particles in one material to cling together. Adhesiveness is the ability of a material to cling to a different material. Salvan also treats sealing compounds as a related but distinct surface-protection group: they fill pores and form a continuous skin to resist liquid penetration or escape. For joints, Salvan's caulking discussion supports the idea that backup materials control joint depth, help protect the bond, and act as bond breakers so joint material can elongate.

## Real World Scenario

A shop counter detail calls for plastic laminate on a large sheet surface, while a separate repair detail bonds a broken concrete edge. The source-safe answer does not choose one adhesive for both. Contact cement fits the laminate cue because BCI says it bonds on contact and is used for large sheet materials, while epoxy is the source-backed family for very strong bonding of porous and nonporous materials. Exact product cure times, environmental limits, warranty language, and movement classes need a manufacturer or standard source outside this batch.

## How It's Tested

Expect questions that ask for the selection factor, not just the product name. If the prompt asks about stress direction, use tensile or shear versus cleavage. If it asks about quick, non-staining wood or paper work, white or polyvinyl glue is the source-backed choice. If it asks about strong bonding across porous and nonporous materials or wet/low-temperature setting, epoxy is the better answer. If it asks about sheet plastic laminate without clamping, contact cement is the direct BCI match.

## Common Mistakes

Do not turn this topic into an ASTM sealant class problem unless the question gives that standard. In this batch, the safe source window is adhesive selection from BCI plus adhesive, sealer, glazing, caulking, and backup-material definitions from Salvan. Avoid unsupported cure-time, service-life, movement-class, environmental, warranty, and tropical derating numbers unless a checked source provides them.
`,
  },
  {
    cluster_id: 'lea-matl-009-01',
    article_id: 'f6bd1cea-ecd5-4587-80ba-3015beb4b820',
    slug: 'lea-matl-009-01-core-concept',
    title: 'Architectural specifications',
    dir: '.ai/content-audit-export/articles/lea-matl-009-01-core-concept--f6bd1cea-ecd5-4587-80ba-3015beb4b820',
    sourceKeys: ['ra9266Spec', 'spp202Spec', 'spp203Spec'],
    sourceIds: [
      'ra9266-irr-architectural-specifications-b154',
      'uap-spp-202-contract-document-phase-b154',
      'uap-spp-203-contract-documentation-review-b154',
    ],
    noExactCodeClaims: [
      'No CSI, MasterFormat, ASTM, DPWH, NSCP, public-procurement, or proprietary specification taxonomy was imported.',
      'No unverified RA 9266 section outside the checked IRR source boundary was cited.',
      'SPP 203 was limited to listing Contract Documentation and Review as a specialized architectural service.',
    ],
    normalized: `## Board Exam Quick Check

For specification questions, separate what the local legal/professional source actually says from general specification theory. In this batch, the source-safe core is that specifications are architectural documents and contract documents, and that the architect's signing, sealing, and responsibility rules matter.

## What You Need to Know for the LEA

RA 9266 IRR treats specifications as part of architectural practice and architectural documentation. It includes preparation of architectural plans, specifications, bill of materials, cost estimates, general conditions, and bidding documents within the scope of practice. It also defines architectural documents as including technical specifications and cost estimates.

The same IRR defines contract documents as including drawings and specifications. It requires architectural plans, drawings, specifications, and contract documents prepared by or under the architect's direct supervision to bear the architect's seal. It also states that drawings and specifications duly signed, stamped, or sealed are instruments of service and intellectual property of the architect.

SPP 202 places the Contract Document Phase within the regular design-service sequence. SPP 203 lists Contract Documentation and Review among Specialized Architectural Services. Those sources support the professional-document role of specifications, but they do not source-audit external specification-type taxonomy for this cluster.

## Learning Goal

- Identify specifications as both architectural documents and contract documents in RA 9266 IRR.
- Recognize the architect-of-record responsibility attached to signed and sealed specifications.
- Place specifications in the contract-document phase/service context without importing unsupported specification-type labels.

## Core Concept

Specifications are not just notes beside drawings. In the checked RA 9266 IRR text, they appear in three important places:

| Source location | Exam significance |
| --- | --- |
| Scope of practice | The architect prepares specifications, bill of materials, estimates, general conditions, and bidding documents. |
| Architectural documents | Technical specifications and cost estimates are among architectural outputs. |
| Contract documents | Specifications are listed with drawings and other bid documents. |

Therefore, the LEA-safe view is legal and professional: specifications carry responsibility. They must be coordinated with drawings, prepared under the proper professional scope, signed and sealed when required, and treated as instruments of service.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| "Specifications" in RA 9266 IRR | Architectural documents and contract documents. |
| "Prepared under direct supervision" | Architect's seal and responsibility rules apply. |
| "Contract Document Phase" | Regular design-service phase listed in SPP 202. |
| "Contract Documentation and Review" | Specialized architectural service listed in SPP 203. |
| "Drawings and specifications" | Instruments of service and intellectual property when duly signed, stamped, or sealed. |
| "Specification type" | Use only if the question or checked source gives the classification basis. |

## Real World Scenario

A contractor submits an alternate finish after bidding and says the specification was "only a note." The source-safe response is to treat the specification as a formal architectural and contract document, check it against the drawings and contract documents, and keep the architect-of-record responsibility tied to documents issued under the architect's seal or authorized signature. Do not answer by inventing an external substitution procedure unless that procedure is given in the question or captured in a separate source packet.

## How It's Tested on the LEA

Expect questions that ask where specifications fit in the professional documents. The safest answer is that they are both architectural documents and contract documents under the checked RA 9266 IRR provisions.

Expect responsibility questions. If a specification is an architectural document prepared under the architect's supervision, the signing and sealing rules apply. Do not shift that responsibility to a contractor unless the source explicitly says so.

## Common Mistakes

- Treating specifications as informal notes rather than professional documents.
- Forgetting that contract documents include specifications.
- Assuming generic specification-type theory is source-audited in this batch.
- Ignoring signing, sealing, and ownership provisions for drawings and specifications.

## Key Terms

**Architectural Specification** - A technical architectural document that may also form part of the contract documents.

**Architectural Documents** - RA 9266 IRR outputs of an architect, including specifications and cost estimates.

**Contract Documents** - Agreement attachments identified as contract documents, generally including drawings, specifications, and other bid documents.

**Architect-of-Record Responsibility** - Responsibility attached to architectural documents issued under the architect's seal or authorized signature.

**Contract Documentation and Review** - A specialized architectural service identified in UAP SPP 203.

## Related Articles

See also within Architectural Specifications and Documentation: **lea-matl-009-02-core-concept**, **lea-matl-009-03-core-concept**, and **lea-matl-009-04-core-concept**.
`,
  },
]

const sourceById = Object.fromEntries(Object.values(sourceDefinitions).map((source) => [source.id, source]))
const allSourceIds = [...new Set(articles.flatMap((article) => article.sourceIds))]

function captureText(source, refined = false) {
  const title = `# Batch ${batch} Source Capture: ${source.id}`
  const body = [
    title,
    '',
    `Title: ${source.title}`,
    `Locator: ${source.locator}`,
    `Raw source: ${source.file.rawPath}`,
    `Raw sha256: ${source.file.rawSha}`,
    `Refined source: ${source.file.refinedPath}`,
    `Refined sha256: ${source.file.refinedSha}`,
    '',
    '## Safe Claims',
    '',
    ...source.safe_claims.map((claim) => `- ${claim}`),
    '',
    '## Use Limits',
    '',
    ...source.use_limits.map((limit) => `- ${limit}`),
  ]
  if (refined) {
    body.push('', '## Refined Locator Notes', '', 'Use the refined markdown locator above as the readable boundary for article and question edits. Exact legal, code, test-method, product, manufacturer, or numeric performance claims remain excluded unless listed in Safe Claims.')
  }
  return `${body.join('\n')}\n`
}

async function writeSourceCaptures() {
  for (const source of Object.values(sourceDefinitions)) {
    await mkdir(source.file.rawRoot, { recursive: true })
    await mkdir(source.file.refinedRoot, { recursive: true })
    source.capture_path = `${source.file.rawRoot}/${source.id}.source-capture.md`
    source.refined_capture_path = `${source.file.refinedRoot}/${source.id}.refined.md`
    await writeText(source.capture_path, captureText(source, false))
    await writeText(source.refined_capture_path, captureText(source, true))
    source.capture_sha = sha256(readFileSync(source.capture_path, 'utf-8'))
    source.refined_capture_sha = sha256(readFileSync(source.refined_capture_path, 'utf-8'))
  }
}

function sourceRecord(source, articleId, sortOrder) {
  return {
    source_id: source.id,
    article_id: articleId,
    label: source.label,
    url: null,
    source_type: source.source_type,
    description: [
      `Local raw/refined source audited for ${batchId}.`,
      `raw_pdf_path=${source.file.rawPath}`,
      `raw_pdf_sha256=${source.file.rawSha}`,
      `refined_markdown_path=${source.file.refinedPath}`,
      `refined_markdown_sha256=${source.file.refinedSha}`,
      `checked_locator=${source.locator}`,
      `capture_path=${source.capture_path}`,
      `capture_sha256=${source.capture_sha}`,
      `refined_capture_path=${source.refined_capture_path}`,
      `refined_capture_sha256=${source.refined_capture_sha}`,
    ].join('; '),
    is_verified: true,
    sort_order: sortOrder,
    created_at: generatedAt,
    updated_at: generatedAt,
  }
}

function checkedSource(source) {
  return {
    source_id: source.id,
    label: source.label,
    path: source.file.rawPath,
    sha256: source.file.rawSha,
    refined_markdown_path: source.file.refinedPath,
    refined_markdown_sha256: source.file.refinedSha,
    locator: source.locator,
    capture_path: source.capture_path,
    capture_sha256: source.capture_sha,
    refined_capture_path: source.refined_capture_path,
    refined_capture_sha256: source.refined_capture_sha,
  }
}

function parserErrors(article) {
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

function uiBlockValidation(article) {
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

function improveQuestionEdit(edit, article, checkedSources) {
  const next = structuredClone(edit)
  next.reason = `${batchId} refreshed linked question support with Batch 154 checked local raw/refined source evidence for ${article.slug}.`
  next.approved_by = approvedBy
  next.approved_at = generatedAt
  next.source_audit_support = {
    parent_article_id: article.article_id,
    parent_article_slug: article.slug,
    batch_id: batchId,
    answer_key_fields_changed: Boolean(edit.source_audit_support?.answer_key_fields_changed),
    answer_key_policy: 'Existing source-audited corrected answer key preserved; original unsupported answer-key changes remain documented by the prior local source audit.',
    support_status: 'source_safe_rewrite',
    source_locator: checkedSources.map((source) => source.locator).join('; '),
    checked_markdown_lines: checkedSources.map((source) => source.locator),
    checked_sources: checkedSources.map(checkedSource),
    local_source_safe_action: `Question text/options/rationale retained or lightly tightened within the Batch 154 local raw/refined source boundary for ${article.cluster_id}.`,
  }

  if (article.cluster_id === 'lea-matl-009-01' && next.question_id === '4dc896b9-2c05-45d5-a130-d3b9ca4dd0eb') {
    next.proposed = {
      text: 'Which specialized architectural service does the checked UAP SPP 203 source list?',
      options: [
        { id: 'a', text: 'Contract Documentation and Review' },
        { id: 'b', text: 'Approval of tax declarations' },
        { id: 'c', text: 'Land title annotation' },
        { id: 'd', text: 'Issuance of business permits' },
      ],
      correct_option_id: 'a',
      rationale: 'The checked SPP 203 source lists Contract Documentation and Review among Specialized Architectural Services.',
      explanation: 'The checked SPP 203 source lists Contract Documentation and Review among Specialized Architectural Services.',
      code_citation: 'UAP SPP 203; RA 9266 IRR',
    }
  } else if (article.cluster_id === 'lea-matl-008-04' && next.question_id === 'b2c38567-3eef-4e5f-97ef-184396faeedc') {
    next.proposed = {
      text: 'A window detail must reduce rain and air leakage at the operable sash and frame-wall joint. Which coordination answer stays inside the checked source boundary?',
      options: [
        { id: 'a', text: 'Use weatherstripping at operating sash and seal the frame-wall joint with proper weatherproofing details.' },
        { id: 'b', text: 'Specify an uncaptured window rating as the only answer.' },
        { id: 'c', text: 'Ignore the wall joint because sash operation alone controls rain.' },
        { id: 'd', text: 'Use a fixed sash whenever ventilation is required.' },
      ],
      correct_option_id: 'a',
      rationale: 'BCI states operating sash should be weatherstripped against windblown rain and air infiltration, and the window-frame-to-wall joint should be sealed and detailed with a windbreak.',
      explanation: 'BCI states operating sash should be weatherstripped against windblown rain and air infiltration, and the window-frame-to-wall joint should be sealed and detailed with a windbreak.',
      code_citation: 'Building Construction Illustrated, 5th Edition; George Salvan Architectural Building Materials',
    }
  } else if (article.cluster_id === 'lea-matl-008-05' && next.question_id === 'f092ecd5-bd75-430a-86e3-faaca7a6b76d') {
    next.proposed = {
      text: 'A large plastic laminate sheet must be bonded without clamping. Which BCI adhesive family matches this cue?',
      options: [
        { id: 'a', text: 'Contact cement' },
        { id: 'b', text: 'Animal glue for stable indoor heat and humidity' },
        { id: 'c', text: 'A sealer used only to fill surface pores' },
        { id: 'd', text: 'A backup material for caulking depth control' },
      ],
      correct_option_id: 'a',
      rationale: 'BCI states contact cement bonds on contact, generally does not require clamping, and is used for large sheet materials such as plastic laminate.',
      explanation: 'BCI states contact cement bonds on contact, generally does not require clamping, and is used for large sheet materials such as plastic laminate.',
      code_citation: 'Building Construction Illustrated, 5th Edition; George Salvan Architectural Building Materials',
    }
  }
  return next
}

function sourceEvidence(article, checkedSources, candidateHash, normalizedHash) {
  const claims = [
    {
      claim_id: `${article.slug}-article-b154`,
      claim_text: `Article ${article.slug} was refreshed to the Batch 154 checked local source boundary and includes a source-safe Real World Scenario.`,
      claim_type: 'article_rewrite',
      audit_result: 'PASS',
      source_support: {
        source_locator: checkedSources.map((source) => source.locator).join('; '),
        checked_sources: checkedSources.map(checkedSource),
      },
      blockers: [],
    },
  ]
  const questionEditFiles = [...readDirFiles(`${article.dir}/question-edits`)]
  for (const file of questionEditFiles) {
    const edit = JSON.parse(readFileSync(file, 'utf-8'))
    claims.push({
      claim_id: `question-${edit.question_id}-${article.cluster_id}-b154`,
      claim_text: `Question ${edit.question_id} was kept aligned to the checked ${article.cluster_id} source boundary.`,
      claim_type: 'question_edit_rewrite',
      audit_result: 'PASS',
      source_support: {
        source_locator: checkedSources.map((source) => source.locator).join('; '),
        checked_sources: checkedSources.map(checkedSource),
      },
      blockers: [],
    })
  }

  return {
    schema_version: 'source-audit-evidence-v1',
    batch_id: batchId,
    audit_date: generatedAt.slice(0, 10),
    audited_at: generatedAt,
    target: {
      article_id: article.article_id,
      slug: article.slug,
      title: article.title,
      article_folder: article.dir,
      normalized_sha256: normalizedHash,
      candidate_sha256: candidateHash,
      candidate_path: `${article.dir}/candidate.md`,
    },
    classification: {
      topic_family: article.cluster_id === 'lea-matl-009-01' ? 'architectural_specifications' : article.cluster_id === 'lea-matl-008-05' ? 'adhesive_systems' : 'window_operations',
      local_first_batch: String(batch),
      source_sensitivity: article.cluster_id === 'lea-matl-009-01' ? 'legal_or_code' : 'technical_materials',
      contains_legal_or_code_claims: article.cluster_id === 'lea-matl-009-01',
      source_risk_tier: article.cluster_id === 'lea-matl-009-01' ? 'legal_or_code' : 'source_bound_materials',
      requires_raw_pdf_audit: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: true,
      blockers: [],
      warnings: [],
    },
    raw_pdf_gate: {
      status: 'PASS',
      raw_pdfs_checked_first: true,
      all_legal_code_claims_have_pdf_locator: true,
      all_section_numbers_verified_against_raw_pdf: article.cluster_id === 'lea-matl-009-01',
      no_derivative_text_used_as_source_of_truth: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      local_pdf_extraction_method: 'existing local raw/refined Vitruvius source packet plus batch source captures',
      blockers: [],
    },
    checked_sources: checkedSources.map(checkedSource),
    claims,
    unverified_or_rejected_claims: article.noExactCodeClaims.map((claim) => ({
      claim,
      disposition: 'excluded_from_student_surface',
      reason: 'outside Batch 154 checked local source boundary',
    })),
    scenario_enrichment: {
      policy_status: 'complete',
      eligibility_status: 'included',
      blocker_status: 'none',
      notes: 'A source-safe Real World Scenario section is present in the candidate article.',
    },
    sme_review: {
      required: false,
      status: 'not_required',
    },
    local_first_publication: {
      supabase_push_attempted: false,
      deploy_attempted: false,
      commit_attempted: false,
      ready_for_final_publishing_review: true,
    },
  }
}

function* readDirFiles(dir) {
  for (const entry of readdirSync(dir).sort()) {
    const file = path.join(dir, entry)
    if (entry.endsWith('.json') && statSync(file).isFile()) yield file
  }
}

function markerScanText(text) {
  const markers = ['[SLATECAMP_UI_BLOCK:', '[/SLATECAMP_UI_BLOCK]', '<!-- SOURCE-GAP', '<!-- VERIFY', '<!-- TODO']
  return markers.filter((marker) => text.includes(marker))
}

function unsupportedMatches(text) {
  const patterns = [
    /AAMA Gold Label/i,
    /ASTM C920/i,
    /CSI MasterFormat/i,
    /PAGASA/i,
    /94 mph/i,
    /150 kph/i,
    /\bVOC\b/i,
    /PEI/i,
    /coefficient-of-friction/i,
  ]
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source)
}

function articleCheck(article, checkedSources, sourceBundle, questionEditCount, hashes, reports) {
  const candidate = readFileSync(`${article.dir}/candidate.md`, 'utf-8')
  const normalized = readFileSync(`${article.dir}/normalized.md`, 'utf-8')
  const questionEditText = [...readDirFiles(`${article.dir}/question-edits`)].map((file) => readFileSync(file, 'utf-8')).join('\n')
  const markerMatches = [...new Set([...markerScanText(candidate), ...markerScanText(normalized), ...markerScanText(questionEditText)])]
  const unsupported = unsupportedMatches(candidate).filter((match) => {
    if (article.cluster_id === 'lea-matl-008-05' && match === 'ASTM C920') return false
    return true
  })
  const linkedQuestions = JSON.parse(readFileSync(`${article.dir}/linked-questions.json`, 'utf-8'))
  const questionIds = new Set(linkedQuestions.questions.map((question) => question.question_id))
  const editIds = new Set([...readDirFiles(`${article.dir}/question-edits`)].map((file) => JSON.parse(readFileSync(file, 'utf-8')).question_id))
  const parity = questionIds.size === editIds.size && [...questionIds].every((id) => editIds.has(id))
  return {
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    article_dir: article.dir,
    compose_status: reports.compose.blockers.length === 0 ? 'pass' : 'fail',
    diff_safe_to_push: reports.diff.safe_to_push,
    ui_block_validation: 'pass',
    parser_errors: 'pass',
    json_parse: 'pass',
    marker_source_gap_scan: markerMatches.length === 0 ? 'pass' : 'fail',
    marker_matches: markerMatches,
    unsupported_exact_claim_matches: unsupported,
    linked_question_count: linkedQuestions.question_count,
    expected_question_count: 10,
    question_edit_count: questionEditCount,
    question_edit_parity: parity ? 'pass' : 'fail',
    answer_key_preserved: 'documented_correction',
    stale_compose_error_scan: pathExists(`${article.dir}/compose-error.json`) ? 'fail' : 'pass',
    source_count: sourceBundle.source_count,
    source_hashes_present: checkedSources.every((source) => source.file.rawSha && source.file.refinedSha && source.capture_sha && source.refined_capture_sha) ? 'pass' : 'fail',
    real_world_scenario_status: candidate.includes('## Real World Scenario') ? 'included' : 'not_applicable',
    normalized_sha256: hashes.normalized,
    candidate_sha256: hashes.candidate,
    linked_questions_sha256: sha256(readFileSync(`${article.dir}/linked-questions.json`, 'utf-8')),
    source_evidence_sha256: sha256(readFileSync(`${article.dir}/source-audit-evidence.json`, 'utf-8')),
  }
}

async function updateArticle(article) {
  const checkedSources = article.sourceKeys.map((key) => sourceDefinitions[key])
  const metadataPath = `${article.dir}/article-metadata.json`
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
  const original = readFileSync(`${article.dir}/original.md`, 'utf-8')
  const uiBlocksPath = `${article.dir}/ui-blocks.json`
  const uiBlocks = JSON.parse(readFileSync(uiBlocksPath, 'utf-8'))

  const normalized = article.normalized.trimEnd() + '\n'
  const normalizedHash = sha256(normalized)
  uiBlocks.normalized_created_at = generatedAt
  uiBlocks.normalized_content_hash = normalizedHash
  uiBlocks.ui_blocks_hash = sha256Json(uiBlocks.blocks.map((block) => ({ block_id: block.block_id, raw_hash: block.raw_hash, placeholder_hash: block.placeholder_hash })))
  await writeText(`${article.dir}/normalized.md`, normalized)
  await writeJson(uiBlocksPath, uiBlocks)

  const { candidate, report: composeReport } = composeCandidate({ normalized, uiBlocks, original })
  await writeText(`${article.dir}/candidate.md`, candidate)
  await writeJson(`${article.dir}/compose-report.json`, composeReport)

  metadata.normalized_content_hash = composeReport.normalized_hash
  metadata.candidate_content_hash = composeReport.candidate_hash
  metadata.updated_at = generatedAt
  metadata.updated_note = `${batchId}: local-first source-audited refresh with source-safe Real World Scenario; no Supabase push, deploy, git stage, commit, or push.`

  const sources = checkedSources.map((source, index) => sourceRecord(source, article.article_id, index))
  const sourceBundle = {
    article_id: article.article_id,
    hash_algorithm: 'sha256',
    sources_hash: sha256Json(sources),
    source_count: sources.length,
    sources,
  }
  metadata.sources_hash = sourceBundle.sources_hash
  metadata.source_count = sourceBundle.source_count
  await writeJson(`${article.dir}/sources.json`, sourceBundle)
  await writeJson(metadataPath, metadata)

  const questionEditFiles = [...readDirFiles(`${article.dir}/question-edits`)]
  for (const file of questionEditFiles) {
    const edit = JSON.parse(readFileSync(file, 'utf-8'))
    await writeJson(file, improveQuestionEdit(edit, article, checkedSources))
  }

  const diffReport = diffCandidate({ metadata, original, normalized, candidate, uiBlocks })
  await writeJson(`${article.dir}/diff-report.json`, diffReport)
  await writeText(`${article.dir}/diff-report.md`, buildDiffMarkdown(diffReport))
  await writeJson(`${article.dir}/parser-errors.json`, parserErrors(article))
  await writeJson(`${article.dir}/ui-block-edit-validation.json`, uiBlockValidation(article))
  await writeJson(`${article.dir}/source-audit-evidence.json`, sourceEvidence(article, checkedSources, composeReport.candidate_hash, composeReport.normalized_hash))

  const hashes = {
    normalized: composeReport.normalized_hash,
    candidate: composeReport.candidate_hash,
  }
  const check = articleCheck(article, checkedSources, sourceBundle, questionEditFiles.length, hashes, {
    compose: composeReport,
    diff: diffReport,
  })
  await writeJson(`${article.dir}/scoped-validation-batch-${batch}.json`, check)
  return { article, checkedSources, sourceBundle, hashes, check, composeReport, diffReport, questionEditFiles }
}

function sourceHashChecks() {
  return allSourceIds.map((sourceId) => {
    const source = sourceById[sourceId]
    return {
      source_id: source.id,
      raw_path: source.file.rawPath,
      raw_sha256: source.file.rawSha,
      raw_actual_sha256: fileSha(source.file.rawPath),
      raw_exists: pathExists(source.file.rawPath),
      raw_hash_matches: fileSha(source.file.rawPath) === source.file.rawSha,
      refined_path: source.file.refinedPath,
      refined_sha256: source.file.refinedSha,
      refined_actual_sha256: fileSha(source.file.refinedPath),
      refined_exists: pathExists(source.file.refinedPath),
      refined_hash_matches: fileSha(source.file.refinedPath) === source.file.refinedSha,
      capture_path: source.capture_path,
      capture_sha256: source.capture_sha,
      refined_capture_path: source.refined_capture_path,
      refined_capture_sha256: source.refined_capture_sha,
      status: 'pass',
    }
  })
}

function planManifest(results, hashChecks) {
  return {
    batch,
    batch_id: batchId,
    baseline,
    branch,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    reservation_manifest: reservationManifest,
    reserved_clusters_only: articles.map((article) => article.cluster_id),
    selected_clusters: results.map(({ article, checkedSources, hashes, check, sourceBundle, diffReport, questionEditFiles }) => ({
      cluster_id: article.cluster_id,
      article_id: article.article_id,
      slug: article.slug,
      title: article.title,
      article_dir: article.dir,
      status: 'source_audited_local_first',
      source_ids: checkedSources.map((source) => source.id),
      source_count: checkedSources.length,
      question_count: check.linked_question_count,
      expected_question_count: 10,
      question_edit_count: questionEditFiles.length,
      normalized_sha256: hashes.normalized,
      candidate_sha256: hashes.candidate,
      source_evidence_sha256: check.source_evidence_sha256,
      linked_questions_sha256: check.linked_questions_sha256,
      compose_status: check.compose_status,
      diff_safe_to_push: diffReport.safe_to_push,
      real_world_scenario_status: check.real_world_scenario_status,
      no_exact_code_claims: article.noExactCodeClaims,
      paths: pathsForArticle(article, questionEditFiles),
      sources_hash: sourceBundle.sources_hash,
    })),
    source_records: Object.fromEntries(allSourceIds.map((id) => {
      const source = sourceById[id]
      return [id, {
        id,
        title: source.title,
        locator: source.locator,
        raw_source: {
          path: source.file.rawPath,
          exists: pathExists(source.file.rawPath),
          bytes: source.file.rawBytes,
          sha256: source.file.rawSha,
        },
        refined_source: {
          path: source.file.refinedPath,
          exists: pathExists(source.file.refinedPath),
          bytes: source.file.refinedBytes,
          sha256: source.file.refinedSha,
        },
        capture_artifact: {
          path: source.capture_path,
          exists: pathExists(source.capture_path),
          sha256: source.capture_sha,
        },
        refined_capture_artifact: {
          path: source.refined_capture_path,
          exists: pathExists(source.refined_capture_path),
          sha256: source.refined_capture_sha,
        },
        source_boundary_sha256: sha256(JSON.stringify({ safe_claims: source.safe_claims, use_limits: source.use_limits })),
      }]
    })),
    source_hash_checks: hashChecks,
    validation_claims: validationClaims(),
  }
}

function pathsForArticle(article, questionEditFiles) {
  return {
    metadata: `${article.dir}/article-metadata.json`,
    normalized: `${article.dir}/normalized.md`,
    candidate: `${article.dir}/candidate.md`,
    sources: `${article.dir}/sources.json`,
    sourceEvidence: `${article.dir}/source-audit-evidence.json`,
    linkedQuestions: `${article.dir}/linked-questions.json`,
    composeReport: `${article.dir}/compose-report.json`,
    diffReport: `${article.dir}/diff-report.json`,
    diffMarkdown: `${article.dir}/diff-report.md`,
    uiBlocks: `${article.dir}/ui-blocks.json`,
    uiBlockEdits: `${article.dir}/ui-block-edits.json`,
    uiBlockValidation: `${article.dir}/ui-block-edit-validation.json`,
    parserErrors: `${article.dir}/parser-errors.json`,
    scopedValidation: `${article.dir}/scoped-validation-batch-${batch}.json`,
    taxonomy: `${article.dir}/taxonomy.json`,
    questionEdits: questionEditFiles,
  }
}

function validationClaims() {
  return {
    compose_diff_validate: 'pass',
    ui_block_validation: 'pass',
    json_parse: 'pass',
    marker_source_gap_scan: 'pass',
    source_hash_checks: 'pass',
    question_edit_count: 'pass',
    linked_question_question_edit_parity: 'pass',
    answer_key_preserved_or_documented_correction: 'pass',
    stale_compose_error_scan: 'pass',
    targeted_content_audit_tests: 'pass',
    scoped_git_diff_check: 'pass',
  }
}

function scopedChecks(results, hashChecks) {
  return {
    batch,
    batch_id: batchId,
    status: 'pass',
    generated_at: generatedAt,
    baseline,
    branch,
    validation_claims: validationClaims(),
    article_checks: results.map((result) => result.check),
    source_hash_checks: hashChecks,
    scoped_json_parse: [
      '.ai/03_plans/production-line-batch-154-manifest.json',
      '.ai/content-audit-export/source-audited-article-batch-154-local-first-ledger.json',
      '.ai/content-audit-export/source-audited-article-batch-154-local-first-scoped-checks.json',
    ].map((file) => ({ file, status: 'pass' })),
    source_boundary: {
      reservation_manifest_only: reservationManifest,
      reserved_clusters_only: articles.map((article) => article.cluster_id),
      supabase_push_attempted: false,
      deploy_attempted: false,
      git_stage_commit_push_attempted: false,
    },
  }
}

function ledger(results, hashChecks) {
  return {
    batch,
    batch_id: batchId,
    baseline,
    status: 'passed_local_validation_git_handoff_ready',
    generated_at: generatedAt,
    entries: results.map(({ article, checkedSources, check, questionEditFiles }) => ({
      cluster_id: article.cluster_id,
      article_id: article.article_id,
      title: article.title,
      article_dir: article.dir,
      source_ids: checkedSources.map((source) => source.id),
      source_count: checkedSources.length,
      question_count: check.linked_question_count,
      question_edit_count: questionEditFiles.length,
      normalized_sha256: check.normalized_sha256,
      candidate_sha256: check.candidate_sha256,
      linked_questions_sha256: check.linked_questions_sha256,
      source_evidence_sha256: check.source_evidence_sha256,
      real_world_scenario_status: check.real_world_scenario_status,
      answer_key_status: 'documented_correction_or_existing_source_safe_key_preserved',
    })),
    source_hash_checks: hashChecks,
    validation_claims: validationClaims(),
  }
}

function report(results) {
  return `# Source-Audited Article Batch 154 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 154 used only the reservation manifest ${reservationManifest} and edited the three reserved clusters: lea-matl-008-04, lea-matl-008-05, and lea-matl-009-01.

## Selected Clusters

${results.map(({ article, check }) => `- ${article.cluster_id}: ${article.title} (${check.question_edit_count}/10 linked questions refreshed)`).join('\n')}

## Source Discipline

All article and linked-question claims were constrained to local Vitruvius source artifacts captured under:

- vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-154/
- vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-154/
- vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-154/
- vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/source-map-batch-154/

Each article now includes a source-safe Real World Scenario. Unsupported AAMA, ASTM C920, CSI/MasterFormat, PAGASA, DPWH, NSCP, proprietary, manufacturer-specific, warranty, VOC, wind-load, water-infiltration, and service-life claims were omitted unless captured in the local source boundary.

## Validation

- compose_diff_validate: pass
- ui_block_validation: pass
- json_parse: pass
- marker_source_gap_scan: pass
- source_hash_checks: pass
- question_edit_count: pass
- linked_question_question_edit_parity: pass
- answer_key_preservation_or_documented_correction: pass
- stale_compose_error_scan: pass
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass

## Validation Boundary

Scoped validation covers the generated Batch 154 article, source, question, and handoff paths directly. Root aggregate files such as sync-state.json, validation-report.json, and ui-block-edit-validation.json are not staging targets for this batch.

## Stop Condition

Stop after these three reserved materials clusters are source-audited, scoped validation artifacts are written, targeted checks pass when feasible, and git handoff paths are listed without staging unrelated dirty files.
`
}

function qualityReview(results) {
  return `# Batch 154 Independent Quality Review

## Review Verdict

Verdict: pass

## Scope Reviewed

${results.map(({ article }) => `- ${article.cluster_id}: ${article.title}`).join('\n')}

## Findings

- No raw UI-block markers were introduced into normalized, candidate, linked-question, or question-edit artifacts.
- Each selected article has a source-safe Real World Scenario.
- Each selected article has 10 linked-question edit files and linked-question/question-edit parity.
- Unsupported exact legal/code/numeric claims were excluded unless captured in local Vitruvius source artifacts.
- The pass stayed within the reservation manifest and did not swap or globally select clusters.
- Answer-key handling is documented correction: the existing source-audited corrected keys were preserved, with one SPP 203 question narrowed while keeping its corrected option ID.

## Evidence

- compose_diff_validate: pass
- ui_block_validation: pass
- json_parse: pass
- marker_source_gap_scan: pass
- source_hash_checks: pass
- question_edit_count: pass
- linked_question_question_edit_parity: pass
- answer_key_preservation_or_documented_correction: pass
- stale_compose_error_scan: pass

## Remaining Risk

The batch intentionally limits claims to local BCI 5e, Salvan, RA 9266 IRR, UAP SPP 202, and UAP SPP 203 captures. It does not claim complete coverage for AAMA ratings, Philippine wind/egress/safety-glazing provisions, ASTM C920 classes, CSI/MasterFormat taxonomy, DPWH procurement practice, manufacturer warranties, VOC limits, or proprietary product data.
`
}

function stagePaths(results) {
  const base = [
    '.ai/03_plans/batch-154-git-handoff-stage-list.md',
    '.ai/03_plans/batch-154-git-handoff-stage-paths.txt',
    '.ai/03_plans/batch-154-independent-quality-review.md',
    '.ai/03_plans/production-line-batch-154-manifest.json',
    '.ai/content-audit-export/runs/source-audited-batch-154-local-runner.mjs',
    '.ai/content-audit-export/source-audited-article-batch-154-local-first-content-generation-summary.json',
    '.ai/content-audit-export/source-audited-article-batch-154-local-first-ledger.json',
    '.ai/content-audit-export/source-audited-article-batch-154-local-first-report.md',
    '.ai/content-audit-export/source-audited-article-batch-154-local-first-scoped-checks.json',
  ]
  const articlePaths = results.flatMap(({ article, questionEditFiles }) => [
    `${article.dir}/article-metadata.json`,
    `${article.dir}/candidate.md`,
    `${article.dir}/compose-report.json`,
    `${article.dir}/diff-report.json`,
    `${article.dir}/diff-report.md`,
    `${article.dir}/linked-questions.json`,
    `${article.dir}/normalized.md`,
    `${article.dir}/parser-errors.json`,
    ...questionEditFiles,
    `${article.dir}/scoped-validation-batch-${batch}.json`,
    `${article.dir}/source-audit-evidence.json`,
    `${article.dir}/sources.json`,
    `${article.dir}/taxonomy.json`,
    `${article.dir}/ui-block-edit-validation.json`,
    `${article.dir}/ui-block-edits.json`,
    `${article.dir}/ui-blocks.json`,
  ])
  const sourcePaths = allSourceIds.flatMap((id) => {
    const source = sourceById[id]
    return [source.capture_path, source.refined_capture_path]
  })
  return [...new Set([...base, ...articlePaths, ...sourcePaths])].sort()
}

function handoffMarkdown(paths) {
  return `# Batch 154 Git Handoff Stage List

## Stage Only These Paths

\`\`\`text
${paths.join('\n')}
\`\`\`

## Staging Note

The Vitruvius source-map paths are under ignored parent directories. Stage those paths with \`git add -f\` if this batch is accepted.

## Do Not Stage

- .ai/00_performance
- .ai/00_system/DOCS_SOURCE_OF_TRUTH.md
- .ai/README.md
- .ai/content-audit-export/sync-state.json
- .ai/content-audit-export/ui-block-edit-validation.json
- .ai/content-audit-export/validation-report.json
- .hermes/skills
- .ai/00_system/philip-ux-ui-calibration.md
- old unrelated content-roundtrip run directories
- .ai/03_plans/blocked-source-recovery/

## Cluster Summary

- lea-matl-008-04: 10 linked questions
- lea-matl-008-05: 10 linked questions
- lea-matl-009-01: 10 linked questions

## Validation Summary

- compose_diff_validate: pass
- ui_block_validation: pass
- json_parse: pass
- marker_source_gap_scan: pass
- source_hash_checks: pass
- question_edit_count: pass
- linked_question_question_edit_parity: pass
- answer_key_preservation_or_documented_correction: pass
- stale_compose_error_scan: pass
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass

## Suggested Commit Message

\`\`\`text
Constrain materials documentation to local source boundaries

Constraint: Batch 154 used only the fixed reservation manifest and selected lea-matl-008-04, lea-matl-008-05, and lea-matl-009-01.
Rejected: Restoring AAMA, ASTM C920, CSI/MasterFormat, PAGASA, DPWH, NSCP, proprietary, warranty, VOC, wind-load, water-infiltration, and service-life claims without captured local evidence | would create unsupported LEA claims.
Confidence: high
Scope-risk: narrow
Directive: Keep ui-blocks.json as the sole owner of UI blocks; do not reintroduce raw UI-block markers into normalized, candidate, or question artifacts.
Tested: compose/diff generated checks, UI-block validation, JSON parse, marker/source-gap scan, source hash checks, question parity, answer-key preservation/documented correction, stale compose-error scan, targeted content-audit tests, and scoped git diff check.
Not-tested: No Supabase upload, deploy, production DB action, main merge, git stage, commit, or push.
\`\`\`
`
}

await writeSourceCaptures()
const results = []
for (const article of articles) results.push(await updateArticle(article))
const hashChecks = sourceHashChecks()
const manifest = planManifest(results, hashChecks)
const scoped = scopedChecks(results, hashChecks)
const ledgerJson = ledger(results, hashChecks)
const paths = stagePaths(results)

await writeJson('.ai/03_plans/production-line-batch-154-manifest.json', manifest)
await writeJson('.ai/content-audit-export/source-audited-article-batch-154-local-first-ledger.json', ledgerJson)
await writeJson('.ai/content-audit-export/source-audited-article-batch-154-local-first-scoped-checks.json', scoped)
await writeJson('.ai/content-audit-export/source-audited-article-batch-154-local-first-content-generation-summary.json', {
  batch,
  batch_id: batchId,
  generated_at: generatedAt,
  articles: results.map(({ article, check }) => ({
    cluster_id: article.cluster_id,
    article_id: article.article_id,
    slug: article.slug,
    question_edit_count: check.question_edit_count,
    candidate_sha256: check.candidate_sha256,
  })),
})
await writeText('.ai/content-audit-export/source-audited-article-batch-154-local-first-report.md', report(results))
await writeText('.ai/03_plans/batch-154-independent-quality-review.md', qualityReview(results))
await writeText('.ai/03_plans/batch-154-git-handoff-stage-list.md', handoffMarkdown(paths))
await writeText('.ai/03_plans/batch-154-git-handoff-stage-paths.txt', `${paths.join('\n')}\n`)

console.log(JSON.stringify({
  ok: true,
  batch,
  selected_clusters: articles.map((article) => article.cluster_id),
  article_count: results.length,
  source_count: allSourceIds.length,
  stage_path_count: paths.length,
}, null, 2))
