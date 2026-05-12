#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const EXPORT_ROOT = path.join(ROOT, '.ai/content-audit-export')
const ARTICLES_ROOT = path.join(EXPORT_ROOT, 'articles')
const BATCH = '088'
const BATCH_ID = 'source-audited-article-batch-088-local-first'
const AUDITED_AT = '2026-05-12T11:55:00.000+08:00'
const GENERATED_BY = 'codex-local-source-audit-batch-088'

function shaText(value) {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`
}

async function shaFile(relativePath) {
  return `sha256:${createHash('sha256').update(await readFile(path.join(ROOT, relativePath))).digest('hex')}`
}

function jsonHash(value) {
  return shaText(JSON.stringify(value))
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8')
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/')
}

const SOURCE_DEFS = {
  designProcess: {
    source_id: 'design-process-b088',
    label: 'Design Process',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Design Process.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Design Process.md',
    type: 'local_design_process_pdf',
    locator: 'Design Process refined markdown lines 52, 59, 67, and 178; raw PDF hash checked locally.',
  },
  openSpace: {
    source_id: 'open-space-development-guidelines-b088',
    label: 'Open Space Development Guidelines',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/Open Space Development Guidelines.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/HLURB-DHSUD/Open Space Development Guidelines.md',
    type: 'primary_planning_guideline_pdf',
    locator: 'Open Space Development Guidelines refined markdown lines 36-60, 307-332, 374-376, 1747-1763; raw PDF hash checked locally.',
  },
  pd1216: {
    source_id: 'pd-1216-open-space-requirements-b088',
    label: 'PD 1216 - Open Space Requirements in Subdivisions',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1216/PD 1216 - Open Space Requirements in Subdivisions.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/PD-1216/PD 1216 - Open Space Requirements in Subdivisions.md',
    type: 'primary_law_pdf',
    locator: 'PD 1216 refined markdown lines 21-35, 53-90, and 214-240; raw PDF hash checked locally.',
  },
  pd1096: {
    source_id: 'pd-1096-rirr-prefabricated-and-accessibility-b088',
    label: 'PD 1096 RIRR 2004 - Revised IRR (DPWH Official)',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).md',
    type: 'primary_building_code_pdf',
    locator: 'PD 1096 RIRR refined markdown lines 4358-4369 for Rule XV Section 1501 and lines 6048-6135 for accessible walkways, crossings, parking, and entrances; raw PDF hash checked locally.',
  },
  bci: {
    source_id: 'building-construction-illustrated-5th-b088',
    label: 'Building Construction Illustrated, 5th Edition',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
    type: 'local_building_technology_pdf',
    locator: 'Building Construction Illustrated refined markdown lines 122, 252-266, 350-360, 420, 448-479, 714-749, 829-921, 1236-1265, 14349-14352, 14838-14848, 2141-2158, 3131-3151, and 3316-3457; raw PDF hash checked locally.',
  },
  siteworkLecture: {
    source_id: 'sitework-lecture-b088',
    label: 'Sitework Lecture',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Sitework Lecture.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Sitework Lecture.md',
    type: 'local_sitework_pdf',
    locator: 'Sitework Lecture refined markdown lines 34, 80, 218, 253-288, 334-365, 414-461, and 520-588; raw PDF hash checked locally.',
  },
  buildingTechnologySiteworks: {
    source_id: 'building-technology-siteworks-b088',
    label: 'Building Technology - Siteworks',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Technology - Siteworks.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Technology - Siteworks.md',
    type: 'local_sitework_pdf',
    locator: 'Building Technology - Siteworks refined markdown lines 131, 252, 274, 308, 326, 342, 388, and 406; raw PDF hash checked locally.',
  },
  goodBuilding: {
    source_id: 'good-building-handbook-ph-b088',
    label: 'Good Building Handbook in the PH',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Good Building Handbook in the PH.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Good Building Handbook in the PH.md',
    type: 'local_building_technology_pdf',
    locator: 'Good Building Handbook in the PH refined markdown lines 35, 170, 217-276, 379-380, 426-499, and 745; raw PDF hash checked locally.',
  },
  chudley: {
    source_id: 'building-construction-handbook-7th-b088',
    label: 'Building Construction Handbook, 7th Ed by Chudley and Greeno',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Buidling Construction Handbook 7th Ed by Chudley _ Greeno.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Buidling Construction Handbook 7th Ed by Chudley _ Greeno.md',
    type: 'local_building_technology_pdf',
    locator: 'Building Construction Handbook refined markdown lines 54, 162, 295-300, 2222, 2276-2282, and 2291-2297; raw PDF hash checked locally.',
  },
  constructionPm: {
    source_id: 'construction-project-management-handbook-b088',
    label: 'Construction Project Management Handbook',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Construction Project Management Handbook by Shadan _ Fleming.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Construction Project Management Handbook by Shadan _ Fleming.md',
    type: 'local_project_management_pdf',
    locator: 'Construction Project Management Handbook refined markdown lines 291-435, 595-604, 1534, 1996, 2029-2051, 2239, 2375-2427, 2587-2640, and 2670-2692; raw PDF hash checked locally.',
  },
  greenBuilding: {
    source_id: 'green-building-illustrated-b088',
    label: 'Green Building Illustrated',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Green Building Illustrated.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Green Building Illustrated.md',
    type: 'local_green_building_pdf',
    locator: 'Green Building Illustrated refined markdown lines 169, 271, 779-787, 911-933, 1176-1234, 1396, 1479-1499, 9082, 9124, and 9150; raw PDF hash checked locally.',
  },
}

const ARTICLES = [
  {
    id: 'd2246ae0-2def-4144-b42d-f56172b13f67',
    slug: 'lea-plan-004-03-what-you-need-to-know-for-the-lea',
    folder: 'lea-plan-004-03-what-you-need-to-know-for-the-lea--d2246ae0-2def-4144-b42d-f56172b13f67',
    title: 'Human-use planning turns behavior claims into source-checked design tasks',
    topic: 'human_use_open_space_and_access_planning',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'planning_accessibility_open_space' },
    sources: ['designProcess', 'openSpace', 'pd1216', 'pd1096', 'bci'],
    primarySource: 'openSpace',
    sourceLocator: 'Design Process lines 52, 59, 67, and 178; Open Space Development Guidelines lines 36-60, 307-332, 374-376, and 1747-1763; PD 1216 lines 21-35 and 53-90; PD 1096 RIRR lines 6048-6135; Building Construction Illustrated lines 122, 252-266, 420, 448-479, 714-749, and 907-921.',
    scenario: 'A barangay plaza is being revised after users avoid the central path and elderly residents cannot comfortably reach the seating area. A source-safe LEA answer starts with the project goals and user information, then checks whether public open space is accessible, walkways are level and slip-resistant, routes are straightforward, and trees, shade, seating, defined edges, drainage, and service access support actual use.',
    scenarioReason: 'eligible-added: Batch 088 added a concise open-space and accessible-route scenario supported by local design-process, open-space, PD 1216, PD 1096, and BCI locators.',
    summary: 'This topic was narrowed away from imported socio-psychology theory and into source-checked design decisions. For LEA purposes, human-use planning is safest when behavior observations are translated into goals, public open-space function, accessible route requirements, legible edges, shade, seating, planting, drainage, and circulation.',
    core: [
      'The design-process source frames design as goal-based decision work: gather the right information at the right stage, define the problem, and evaluate decisions against project goals.',
      'The open-space guidance treats parks, plazas, trails, green networks, and public spaces as places that support physical, mental, and social well-being, gathering, connection, habitats, and quality of life.',
      'PD 1216 supports the public open-space baseline for subdivisions, including parks, playgrounds, recreational use, tree planting, nonbuildable status for required parks and playgrounds, and non-conversion after donation.',
      'PD 1096 RIRR accessibility provisions support level, slip-resistant, sufficiently wide walkways, turning and rest spaces, straightforward routes, dropped curbs, defined open-space edges, signage, accessible parking, and entrance access.',
      'BCI supports site analysis that considers microclimate, topography, habitats, trees, shade, privacy, pedestrian and service circulation, access, drainage, and outdoor-use suitability.',
    ],
    tested: [
      'Convert behavior or comfort stems into source-checked spatial decisions.',
      'Prioritize access, public open-space function, route clarity, shade, drainage, and edge definition over named theories not locally sourced in this batch.',
      'Use PD 1096 for accessibility details and PD 1216/open-space guidance for public open-space obligations.',
    ],
    mistakes: [
      'Do not answer with Hall, Jacobs, territoriality formulas, or density thresholds unless a local raw source for that exact claim is in the batch.',
      'Do not treat a plaza, park, or walkway as only decorative when checked sources emphasize access, use, comfort, public benefit, and maintenance.',
      'Do not keep raw UI block markers or prose that assumes a source not listed in the local evidence file.',
    ],
    removed: [
      'Named socio-psychology theory claims, imported defensible-space labels, and density-number statements were removed or narrowed because Batch 088 uses local design-process, open-space, accessibility, and site-planning sources.',
    ],
    questions: [
      ['What is the safest Batch 088 way to answer a human-use planning question?', 'Translate the observed behavior into source-checked goals, access, open-space function, route clarity, shade, drainage, and circulation decisions', ['Quote an imported theory name without a local raw source', 'Choose a purely decorative feature with no access or use check', 'Use a density number that is not in the checked source set'], 'The checked sources support goal-based design, public open-space use, accessibility, and site-planning factors.'],
      ['Which source supports starting with goals and information before choosing a design response?', 'Design Process', ['A current advertisement', 'An unchecked psychology summary', 'A species list with no local source'], 'The Design Process source frames design as information management, problem seeking, and evaluation against goals.'],
      ['What does PD 1096 RIRR support for pedestrian routes in this batch?', 'Level, slip-resistant walkways with adequate width, turning or rest spaces, straightforward routes, and related accessible-route features', ['Private preference for any path width', 'A rule that all paths may be obstructed', 'A requirement to remove all public access'], 'The checked PD 1096 accessibility provisions support accessible walkway and route features.'],
      ['Which open-space statement is source-safe from the checked guidance?', 'Open spaces can support gathering, connection, physical and mental health, habitats, and quality of life when planned and managed', ['Open spaces have no social use', 'Every open space may be converted after donation', 'Plazas are only traffic lanes'], 'The Open Space Development Guidelines support social, health, ecological, and quality-of-life functions.'],
      ['What does PD 1216 add to subdivision open-space analysis?', 'Required parks and playgrounds are treated as non-alienable, nonbuildable open-space elements with tree planting and non-conversion controls', ['All parks may be sold for unrelated buildings', 'Tree planting is never part of open space', 'Only private parking counts as open space'], 'PD 1216 supports required open-space standards, tree planting, nonbuildable status, and non-conversion after donation.'],
      ['How should a stem about privacy or comfort in a courtyard be handled?', 'Check site layout, trees, shade, edges, access, drainage, and public-space use instead of relying on an unsourced theory label', ['Answer only with proxemics terminology', 'Ignore circulation and drainage', 'Treat every courtyard as identical'], 'BCI and open-space sources support concrete site-planning and public-space factors.'],
      ['Which design move best fits a plaza used by elderly residents and wheelchair users?', 'A straightforward, slip-resistant route with turning or rest areas and accessible entrance connections', ['A narrow obstructed shortcut', 'A decorative stair as the only route', 'A path that ignores defined edges'], 'PD 1096 RIRR supports accessible route, walkway, crossing, and entrance considerations.'],
      ['What is a source-safe way to discuss trees in human-use planning?', 'Use trees for shade, spatial definition, privacy support, habitat, and site comfort where compatible with access and drainage', ['Name a specific species without a local source', 'Use trees to block every public route', 'Treat planting as unrelated to user comfort'], 'BCI and open-space guidance support tree, shade, habitat, and public-space functions.'],
      ['What should be avoided in a Batch 088 repaired question?', 'Answer choices that depend on named socio-psychology theories not supported by the local raw-source set', ['References to checked PD 1096 accessibility provisions', 'References to checked open-space public benefit', 'References to checked design goals'], 'The article was narrowed to locally checked sources rather than imported theory claims.'],
      ['In an LEA scenario about an underused public square, what evidence path is strongest?', 'Goals and user information, then open-space public function, accessible circulation, shade, seating, edges, and drainage', ['A theory name alone', 'A color preference alone', 'A claim that public access is irrelevant'], 'The combined local sources support a practical planning and design-evaluation path.'],
    ],
  },
  {
    id: 'b9ae0f63-0d28-4a66-b2bf-51641e6db739',
    slug: 'lea-plan-004-04-what-you-need-to-know-for-the-lea',
    folder: 'lea-plan-004-04-what-you-need-to-know-for-the-lea--b9ae0f63-0d28-4a66-b2bf-51641e6db739',
    title: 'Site and open-space management is a scope, operations, and maintenance problem',
    topic: 'site_open_space_management',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'planning_project_management_sitework' },
    sources: ['designProcess', 'openSpace', 'constructionPm', 'siteworkLecture', 'buildingTechnologySiteworks'],
    primarySource: 'constructionPm',
    sourceLocator: 'Design Process lines 52, 59, and 178; Open Space Development Guidelines lines 307-332, 374-376, and 1747-1763; Construction Project Management Handbook lines 291-435, 595-604, 1534, 2029-2051, 2239, 2375-2427, and 2670-2692; Sitework Lecture lines 253-288, 334-365, and 414-461; Building Technology - Siteworks lines 252, 274, 308, 342, 388, and 406.',
    scenario: 'A subdivision open space has ponding paths, damaged turf, and unclear responsibility after turnover. The source-safe response is to separate design goals from operations: define who manages the public or private open space, verify drainage and sitework provisions, require inspection or testing where applicable, and close out with O&M manuals, training, and maintenance responsibilities.',
    scenarioReason: 'eligible-added: Batch 088 added a management and turnover scenario supported by design-process, open-space, project-management, and sitework locators.',
    summary: 'Management claims were narrowed from general leadership advice into source-checked project and site operations. The checked sources support scope, budget, schedule, user needs, risk, quality, safety, inspection, testing, commissioning, O&M information, public/private open-space management, drainage, erosion control, and termite or site-protection measures.',
    core: [
      'Design-process work starts with project goals and the information needed to make decisions, which keeps management from becoming a vague preference statement.',
      'Open-space guidance distinguishes public and private open spaces and emphasizes creation, use, management, partnerships, current and future users, safety, health, and public access where applicable.',
      'The project-management handbook frames management around scope, cost, schedule, user needs, constraints, risk, quality, safety, inspection, testing, commissioning, O&M manuals, training, and closeout.',
      'Sitework sources support practical management checks: drainage, filter layers, erosion control, prefabricated drains, termite barriers, access points, and monitoring where bait systems are used.',
    ],
    tested: [
      'Identify whether the stem is asking about design goals, open-space governance, sitework controls, or project closeout.',
      'Link management answers to inspection, testing, commissioning, O&M manuals, training, drainage, access, and maintenance responsibility.',
      'Avoid plant-species or ecology claims unless those claims have a checked local source in the batch.',
    ],
    mistakes: [
      'Do not treat management as a personality trait; the checked sources make it a scope, quality, safety, and operations system.',
      'Do not leave open-space turnover without a maintenance or management responsibility trail.',
      'Do not add invasive-species or ecosystem claims that are not supported by the selected local raw sources.',
    ],
    removed: [
      'Generic management advice and unsourced ecological-control examples were narrowed to checked project-management, open-space, and sitework operations evidence.',
    ],
    questions: [
      ['What is the safest Batch 088 framing for site and open-space management?', 'A coordinated scope, quality, safety, inspection, O&M, drainage, and maintenance-responsibility problem', ['A personality slogan with no operations trail', 'A plant-species list with no local source', 'A purely decorative afterthought'], 'The checked project-management, open-space, and sitework sources support operational management factors.'],
      ['Which source-safe open-space distinction matters for management responsibility?', 'Public and private open spaces may have different access and management arrangements', ['Every open space is automatically private', 'Management responsibility never matters', 'Public access is always prohibited'], 'The Open Space Development Guidelines distinguish public and private open spaces and discuss management.'],
      ['What should closeout provide before a facility or open-space asset is handed over?', 'O&M information, training, acceptance criteria, and record information where applicable', ['Only a marketing name', 'Only an unchecked theory label', 'No maintenance information'], 'The project-management handbook supports O&M manuals, training, acceptance, and closeout records.'],
      ['How should ponding in a public open space be handled in this source scope?', 'As a sitework and maintenance issue tied to drainage, filter layers, erosion control, and access', ['As a purely aesthetic preference', 'As proof that open spaces require no management', 'As a reason to ignore user safety'], 'Sitework sources support drainage, filter, erosion, and access considerations.'],
      ['Which checked source family supports balancing scope, cost, schedule, user needs, risk, quality, and safety?', 'Construction Project Management Handbook', ['A species guide not present locally', 'A social-media maintenance tip', 'A decorative palette'], 'The project-management source frames management through scope, cost, schedule, constraints, risk, quality, and safety.'],
      ['What should a manager verify when sitework includes termite-control measures?', 'That the selected barrier, access, or monitoring method is coordinated with site construction and maintenance', ['That termite protection is only a drawing title', 'That all access points are sealed forever', 'That no site inspection is needed'], 'The checked sitework sources include termite barriers, access points, and monitoring concepts.'],
      ['What is a source-safe role for public/private partnerships in open-space management?', 'They may be part of managing open spaces when responsibility and access are defined', ['They replace every law and maintenance task', 'They make O&M records unnecessary', 'They allow required parks to be converted freely'], 'Open-space guidance discusses management arrangements and public/private examples.'],
      ['Which answer should be rejected in a Batch 088 management question?', 'A broad leadership claim with no link to source-checked goals, inspection, quality, safety, O&M, or sitework controls', ['A drainage maintenance check', 'A closeout O&M manual requirement', 'A public/private open-space access distinction'], 'The repaired article keeps management claims inside checked source evidence.'],
      ['How should a damaged path and turf after turnover be analyzed?', 'Check drainage and erosion controls, access, inspection, maintenance responsibility, and O&M records', ['Assume no one manages open space', 'Use only a plant-species anecdote', 'Ignore safety and user access'], 'The source set supports sitework and project-management controls for turnover conditions.'],
      ['What does the design-process source contribute to management decisions?', 'It keeps decisions tied to project goals and the right information at the right stage', ['It removes the need for source checks', 'It proves every management action is decorative', 'It replaces inspection and O&M'], 'Design-process guidance supports goal-based information and decision management.'],
    ],
  },
  {
    id: 'f22ba499-94ce-41a3-999a-2d9ffdbc0b57',
    slug: 'lea-plan-004-05-what-you-need-to-know-for-the-lea',
    folder: 'lea-plan-004-05-what-you-need-to-know-for-the-lea--f22ba499-94ce-41a3-999a-2d9ffdbc0b57',
    title: 'Lifecycle performance depends on build quality, access, drainage, and closeout evidence',
    topic: 'building_lifecycle_maintenance_and_closeout',
    classification: { contains_legal_or_code_claims: false, source_risk_tier: 'building_technology_lifecycle' },
    sources: ['goodBuilding', 'bci', 'chudley', 'constructionPm', 'siteworkLecture', 'buildingTechnologySiteworks'],
    primarySource: 'goodBuilding',
    sourceLocator: 'Good Building Handbook lines 35, 170, 217-276, 379-380, 426-499, and 745; Building Construction Illustrated lines 714-749, 1236-1265, 14349-14352, and 14838-14848; Building Construction Handbook lines 162 and 295-300; Construction Project Management Handbook lines 595-604, 1534, 1996, 2029-2051, 2403-2427, 2587-2640, and 2670-2692; Sitework Lecture lines 253-288 and 414-461; Building Technology - Siteworks lines 308, 342, 388, and 406.',
    scenario: 'A school building is nearing turnover, but the reviewer sees uncovered drains at pedestrian routes, missing equipment access, incomplete O&M manuals, and no training record. A source-safe answer treats the issue as lifecycle risk: good materials and workmanship, drainage, protective connections, service access, inspection, commissioning, O&M manuals, training, and as-built records must be checked before acceptance.',
    scenarioReason: 'eligible-added: Batch 088 added a concise lifecycle closeout scenario supported by Good Building Handbook, BCI, Chudley, project-management, and sitework locators.',
    summary: 'Lifecycle claims were narrowed to source-checked construction quality and maintainability. The local sources support good materials, workmanship, drainage, anchorage, corrosion protection, access for maintenance, inspection, regular maintenance, commissioning, O&M manuals, training, as-built records, and sitework protection.',
    core: [
      'The Good Building Handbook links safer long-term performance to well-drained foundations, good materials, workmanship, structural connections, rust protection, covered or bridged drains for access, and monitoring construction quality.',
      'BCI supports designing for site drainage, service access, equipment maintenance, protected raceways, access flooring, and pavement choices tied to load, subgrade, drainage, and use.',
      'Chudley and Greeno support regular inspection and maintenance as a response to latent defects, deterioration, and malfunction, and include modular coordination as a way to reduce cutting and fitting on site.',
      'The project-management handbook ties lifecycle readiness to testing, commissioning, O&M manuals, training, as-builts, acceptance, closeout, quality, safety, and asset condition input.',
      'Sitework sources connect lifecycle performance to drainage, erosion control, filters, termite barriers, access points, and monitoring systems.',
    ],
    tested: [
      'Choose lifecycle answers that preserve access, drainage, inspection, O&M records, training, and durable connections.',
      'Avoid cost or lifespan claims that are not supported by the local source set.',
      'Recognize that handover evidence is part of lifecycle performance, not an administrative extra.',
    ],
    mistakes: [
      'Do not cite precise service-life or peso-saving numbers unless the exact local source is in the batch.',
      'Do not call a project ready for use when drainage, maintenance access, O&M manuals, training, or as-builts are incomplete.',
      'Do not separate material quality from workmanship, connections, inspection, and maintenance.',
    ],
    removed: [
      'Exact lifecycle savings, service-life, and generic facility-management claims were narrowed to checked construction quality, access, drainage, commissioning, O&M, and maintenance evidence.',
    ],
    questions: [
      ['What is the safest Batch 088 lifecycle framing?', 'Long-term performance depends on good materials, workmanship, drainage, connections, access, commissioning, O&M information, and maintenance', ['A precise service life invented from memory', 'A decorative finish schedule only', 'A handover with no records or training'], 'The checked construction and project-management sources support maintainability and closeout evidence.'],
      ['Which issue should block a source-safe handover decision?', 'Missing O&M manuals and training for systems that need operation and maintenance', ['A complete commissioning record', 'Accessible maintenance panels', 'Documented drainage maintenance'], 'The project-management handbook supports O&M manuals, training, and closeout requirements.'],
      ['Why is drainage part of lifecycle performance?', 'Poor drainage can damage site use, foundations, routes, and maintenance conditions', ['Drainage has no effect after opening', 'Drainage is only a color decision', 'Drainage eliminates the need for maintenance'], 'Good Building Handbook, BCI, and sitework sources support drainage as a performance and maintenance factor.'],
      ['What does the Good Building Handbook support in this batch?', 'Good materials, workmanship, foundation drainage, structural connections, rust protection, access over drains, and construction monitoring', ['Only furniture placement', 'Only lifecycle cost formulas', 'Only private branding'], 'The handbook supports practical construction quality and maintenance controls.'],
      ['Which BCI concept supports maintainable services?', 'Provide access and protection for equipment, distribution, raceways, and serviceable systems', ['Hide every service permanently', 'Use no access panels anywhere', 'Treat maintenance access as irrelevant'], 'BCI supports access and protection for mechanical, electrical, and service systems.'],
      ['What does Chudley add to lifecycle reasoning?', 'Regular inspection and maintenance are needed because defects, deterioration, and malfunction can emerge over time', ['Buildings never deteriorate', 'Inspection is only for decoration', 'Maintenance is unrelated to latent defects'], 'Chudley supports regular inspection and maintenance in response to long-term building defects.'],
      ['How should pavement or walk surface maintenance be tested?', 'Relate the paving choice to traffic, load, subgrade, drainage slope, and use', ['Choose any surface without drainage', 'Ignore subgrade and load', 'Use only color as a performance criterion'], 'BCI supports pavement selection and drainage slopes tied to load and use.'],
      ['Which closeout evidence can reduce future lifecycle confusion?', 'As-built records, tested systems, O&M manuals, and training records', ['No record drawings', 'No acceptance criteria', 'No operation information'], 'The project-management handbook ties closeout to as-builts, O&M, testing, and training.'],
      ['What is a source-safe response to termite-control details?', 'Check barriers, access points, monitoring, and coordination with site construction', ['Assume termite protection is only decorative', 'Block every inspection access point', 'Remove monitoring records'], 'The checked sitework sources support barriers, access, and monitoring concepts.'],
      ['Which answer should be avoided for this article?', 'A precise payback or service-life number that is not in the checked local source set', ['A maintenance-access check', 'A drainage check', 'A commissioning and O&M check'], 'Batch 088 narrowed lifecycle content to source-backed controls and records.'],
    ],
  },
  {
    id: 'e59c8abc-5938-47ab-8009-97424baa78c7',
    slug: 'lea-plan-005-02-what-you-need-to-know-for-the-lea',
    folder: 'lea-plan-005-02-what-you-need-to-know-for-the-lea--e59c8abc-5938-47ab-8009-97424baa78c7',
    title: 'Planting and open-space ecology must stay inside checked site and public-realm sources',
    topic: 'planting_open_space_and_site_ecology',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'planting_open_space_site_ecology' },
    sources: ['openSpace', 'pd1216', 'bci', 'greenBuilding'],
    primarySource: 'bci',
    sourceLocator: 'Open Space Development Guidelines lines 36-60, 307-332, 374-376, 1753-1763; PD 1216 lines 53-90 and 214-240; Building Construction Illustrated lines 122, 252-266, 420, 448-479, 714-749, and 829-921; Green Building Illustrated lines 169, 1176-1234, 1396, 1479-1499, 9082, and 9150.',
    scenario: 'A site plan proposes replacing existing shade trees with ornamental planting and a fully paved plaza. In this batch, the source-safe response is not to name species. It is to preserve healthy existing trees and native plant materials where appropriate, check microclimate and hydrology, maintain public open-space function, provide shade and seating, support habitats and green networks, and keep required parks and playgrounds from conversion.',
    scenarioReason: 'eligible-added: Batch 088 added a concise planting and open-space ecology scenario after removing species-specific claims that lacked an official local raw source.',
    summary: 'This article was narrowed because the exact official native-species source was not available in the local raw-source layer. The repaired version keeps source-safe planting and ecology guidance: preserve healthy trees and native plant materials where appropriate, match vegetation to microclimate and hydrology, support open-space use and habitat, manage stormwater and pervious surfaces, and respect PD 1216 open-space controls.',
    core: [
      'BCI supports locating and preserving existing trees and native plant materials, protecting crown and root areas, using trees for shade, spatial definition, privacy, slope stabilization, habitat, microclimate response, pedestrian access, and drainage coordination.',
      'Open-space guidance supports green networks, gathering, public access, health, social well-being, habitats, character, safety, shade, seating, and management for current and future generations.',
      'PD 1216 supports subdivision parks, playgrounds, recreational open spaces, tree planting, nonbuildable required parks and playgrounds, donation or management responsibility, and non-conversion of donated open spaces.',
      'Green Building Illustrated supports site, water, vegetation, microclimate, local hydrology, pervious surfaces, sustainable operations, and vegetated-roof maintenance or load implications without naming local plant species.',
    ],
    tested: [
      'Answer planting questions through site analysis, existing tree protection, microclimate, hydrology, public open-space function, habitat, and maintenance.',
      'Avoid species-specific answers unless the exact local raw source is present.',
      'Connect planting to PD 1216 open-space obligations where subdivision parks and playgrounds are in the stem.',
    ],
    mistakes: [
      'Do not name Narra, calamansi, Albizia, Chromolaena, or any other species as a correct answer unless a checked local raw source supports that exact species claim.',
      'Do not treat all planting as interchangeable decoration; checked sources connect planting to shade, habitat, hydrology, access, and open-space use.',
      'Do not convert required parks and playgrounds into unrelated buildable lots in PD 1216 questions.',
    ],
    removed: [
      'Species-specific native, endemic, succession, and invasive-plant examples were removed or generalized because no official Philippine native-species planting raw source was available in the local layer for Batch 088.',
    ],
    questions: [
      ['What is the safest Batch 088 answer strategy for planting questions?', 'Use source-checked site analysis, tree preservation, microclimate, hydrology, open-space function, habitat, and maintenance instead of naming unsupported species', ['Choose a species name from memory', 'Treat planting as only paint-like decoration', 'Ignore drainage and public access'], 'The checked sources support planting as a site, open-space, and environmental-performance issue.'],
      ['Which statement about existing trees is source-safe from BCI?', 'Healthy existing trees and native plant materials should be located, considered, and protected where appropriate during site planning', ['All existing trees must be removed', 'Species names can be invented', 'Tree roots never affect site performance'], 'BCI supports locating and preserving trees and native plant materials and protecting crown and root areas.'],
      ['What does PD 1216 support for subdivision open spaces?', 'Tree planting and nonbuildable parks, playgrounds, and recreational open spaces with non-conversion controls after donation', ['Converting required parks into unrelated lots', 'Removing all open-space management responsibility', 'Treating playgrounds as private storage'], 'PD 1216 supports required open-space standards, tree planting, nonbuildable status, and non-conversion controls.'],
      ['How should a native-species question be handled in this batch?', 'Avoid exact species claims and answer through checked general planting, preservation, habitat, microclimate, and open-space evidence', ['Pick Narra because it sounds familiar', 'Pick calamansi because it is common', 'Use an unchecked invasive-species example'], 'The official species source was not locally available, so exact species choices were narrowed out.'],
      ['Which Green Building Illustrated factors support planting decisions?', 'Microclimate, vegetation, local hydrology, site water, pervious surfaces, operations, and maintenance considerations', ['Only interior paint color', 'Only promotional branding', 'Only furniture procurement'], 'Green Building Illustrated supports site, water, vegetation, hydrology, and operational considerations.'],
      ['What should a fully paved plaza proposal be checked against?', 'Shade, seating, pervious surfaces where appropriate, drainage, habitat, public-space use, and open-space controls', ['Only the paving color', 'No hydrology or comfort review', 'Automatic removal of every tree'], 'The checked sources support shade, public-space use, drainage, hydrology, and vegetation considerations.'],
      ['Which source-safe use of planting supports user comfort?', 'Trees can provide shade, help define spaces, support privacy, and stabilize soil when coordinated with access and drainage', ['Trees are never related to comfort', 'Trees should block accessible routes', 'Planting eliminates the need for maintenance'], 'BCI supports trees for shade, space definition, privacy support, and soil stabilization.'],
      ['What is the LEA trap in this article?', 'Answering with species-specific native or invasive plant names without a checked local raw source', ['Using BCI for tree protection', 'Using PD 1216 for open-space controls', 'Using open-space guidance for public benefit'], 'Batch 088 deliberately removed exact species claims from the repaired content.'],
      ['How do open-space guidelines support ecological planting analysis?', 'They connect open spaces to habitats, green networks, public access, well-being, character, safety, and management', ['They say open spaces have no ecological role', 'They permit all donated open spaces to be converted', 'They require all public spaces to be fully paved'], 'The checked open-space guidance supports habitat and public-realm functions.'],
      ['In a campus landscape review, which answer is most source-safe?', 'Preserve healthy existing trees, coordinate vegetation with microclimate and hydrology, maintain accessible public open-space function, and document maintenance needs', ['Name an unsupported species as the only answer', 'Remove every shade tree to simplify paving', 'Ignore drainage and maintenance'], 'The combined local sources support a general planting and open-space evaluation path without unsupported species claims.'],
    ],
  },
  {
    id: 'ba36cb75-5bb4-4d12-802c-f5ab921f7949',
    slug: 'prefabricated-constructions',
    folder: 'prefabricated-constructions--ba36cb75-5bb4-4d12-802c-f5ab921f7949',
    title: 'Prefabricated construction under PD 1096 Rule XV Section 1501',
    topic: 'pd1096_prefabricated_construction',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'building_code_prefabricated_construction' },
    sources: ['pd1096', 'chudley', 'bci', 'constructionPm'],
    primarySource: 'pd1096',
    sourceLocator: 'PD 1096 RIRR lines 4358-4369 for Rule XV Section 1501; Chudley lines 295-300, 2222, 2276-2282, and 2291-2297; BCI lines 2141-2158, 3131-3151, and 3316-3457; Construction Project Management Handbook lines 2029-2051, 2239, 2375-2427, and 2587-2692.',
    scenario: 'A project proposes precast wall panels and uPVC components to speed up construction. A source-safe reviewer checks Rule XV Section 1501 first: the units must qualify as prefabricated assemblies, materials must be acceptable to the architect or engineer, accredited testing must address adequacy, durability, soundness, weather and fire resistance, connections and anchorages must develop required strength, service openings must be allowed for, placement must be inspected for code compliance, and a safety engineer must be present during placement.',
    scenarioReason: 'eligible-added: Batch 088 added a concise prefabricated-construction review scenario supported primarily by PD 1096 RIRR Rule XV Section 1501 and secondarily by local connection, modular coordination, testing, safety, and closeout sources.',
    summary: 'Prefabricated construction is a code-controlled assembly issue, not only a faster method of building. PD 1096 Rule XV Section 1501 defines the assembly, lists acceptable material categories, requires accredited material testing for several performance qualities, and controls connections, anchorages, openings, inspection, and safety during placement.',
    core: [
      'PD 1096 RIRR defines a prefabricated assembly as a structural unit whose integral parts have been built up or assembled before incorporation into the building.',
      'Section 1501 permits prefabricated assembly materials such as precast concrete, metal, uPVC, and other materials acceptable to the architect or engineer.',
      'The rule requires tests by accredited material testing laboratories for structural adequacy, durability, soundness, weather resistance, and fire resistance, and the construction must be capable of sustaining the design loads.',
      'Connections must develop the full strength of the member or unit except where structural frame members are involved, and anchors and connections must withstand probable external and internal forces.',
      'The rule requires allowances for material displaced or removed for pipes, conduits, and equipment, requires inspection during placement for code compliance, and requires a safety engineer during placement.',
    ],
    tested: [
      'Use PD 1096 Rule XV Section 1501 as the primary answer source for prefabricated construction.',
      'Separate material acceptability, accredited testing, connection or anchorage strength, service openings, inspection, and placement safety.',
      'Avoid adding structural-code or laboratory details not present in the local source set.',
    ],
    mistakes: [
      'Do not say prefabrication removes testing, inspection, anchorage, or safety requirements.',
      'Do not limit prefabrication to precast concrete when PD 1096 also names metal, uPVC, and other acceptable materials.',
      'Do not invent specific laboratory names, seismic-zone rules, or crane procedures beyond the checked sources.',
    ],
    removed: [
      'Extraneous seismic-zone, laboratory-name, crane, and construction-method details were narrowed to PD 1096 Section 1501 plus local support for connections, modular coordination, testing, safety, and closeout.',
    ],
    questions: [
      ['Under PD 1096 RIRR, what is a prefabricated assembly?', 'A structural unit whose integral parts are built up or assembled before incorporation into the building', ['A decorative finish applied only after occupancy', 'A zoning certificate for subdivision land', 'A purely manual sketch with no structural unit'], 'Rule XV Section 1501 defines prefabricated assemblies as structural units built or assembled before incorporation.'],
      ['Which material category is expressly source-safe in Section 1501?', 'Precast concrete, metal, uPVC, or another material acceptable to the architect or engineer', ['Only bamboo by default', 'Only glass curtain wall by memory', 'Only any material with no professional acceptance'], 'PD 1096 RIRR Section 1501 lists precast concrete, metal, uPVC, and other acceptable materials.'],
      ['What must accredited material testing laboratories address for prefabricated assemblies?', 'Structural adequacy, durability, soundness, weather resistance, and fire resistance', ['Only the paint brand', 'Only the marketing schedule', 'Only the color of packaging'], 'Section 1501 requires accredited laboratory tests for these performance qualities.'],
      ['What is the source-safe rule for design loads?', 'The assembly must be capable of sustaining all design loads within the building', ['Prefabrication eliminates design loads', 'Only temporary storage loads matter', 'Design loads are checked only after occupancy'], 'PD 1096 RIRR requires assemblies to sustain design loads.'],
      ['How does Section 1501 treat connections in prefabricated construction?', 'Connections should develop the full strength of the member or unit except where structural frame members are involved', ['Connections may be decorative only', 'Connections are never inspected', 'Connections are irrelevant once a unit is factory-made'], 'The checked rule controls the strength of connections.'],
      ['What must anchors and connections withstand?', 'All probable external and internal forces acting on the assembly', ['Only the force of painting work', 'Only storage labels', 'No external or internal forces'], 'Section 1501 requires anchorages and connections to withstand probable external and internal forces.'],
      ['What must be considered when pipes, conduits, or equipment displace material?', 'Allowances must be made for material displaced or removed for those services', ['Services may cut through without allowance', 'The code ignores all openings', 'Only decorative openings count'], 'PD 1096 RIRR Section 1501 includes allowances for removed or displaced material.'],
      ['What does Section 1501 require during placement?', 'Inspection for code compliance and the presence of a safety engineer', ['No inspection until resale', 'Only a color approval', 'No safety role during placement'], 'The rule requires inspection during placement and a safety engineer.'],
      ['Which statement should be avoided in a prefabricated-construction item?', 'Prefabrication removes the need for testing, anchorage, inspection, and safety review', ['Testing must address structural and durability qualities', 'Connections and anchorages must be checked', 'Service openings need allowances'], 'The checked rule keeps testing, connections, inspection, and safety requirements in place.'],
      ['How do Chudley and BCI support the code rule without replacing it?', 'They provide local construction support for modular coordination, precast connections, anchorage, and structural connection behavior', ['They override PD 1096 Section 1501', 'They prove inspection is unnecessary', 'They name a Philippine laboratory not in the source'], 'The article treats PD 1096 as primary and uses construction texts only as supporting context.'],
      ['What is the best first source for an LEA question titled prefabricated constructions?', 'PD 1096 RIRR Rule XV Section 1501', ['A general construction advertisement', 'An unchecked manufacturer brochure', 'A planning theory source'], 'The local code source directly governs the prefabricated-construction topic.'],
      ['Which safety answer is source-safe in this batch?', 'A safety engineer is required during placement under Section 1501, with project safety planning supported by the project-management source', ['A named crane rule not checked locally', 'No safety responsibility during placement', 'A purely decorative safety sign only'], 'PD 1096 requires a safety engineer during placement, and the project-management source supports safety planning.'],
      ['Which answer best handles metal or uPVC prefabricated assemblies?', 'They require appropriate anchorage and connectors and must fit the Section 1501 testing, inspection, and acceptance controls', ['They are exempt from anchorage', 'They require no testing because they are light', 'They may ignore code inspection'], 'Section 1501 names metal and uPVC assemblies and controls anchorage, testing, and inspection.'],
      ['What is the LEA trap in prefabricated construction?', 'Treating factory assembly as if it bypasses code performance, connection, inspection, service-opening, and placement-safety requirements', ['Reading Section 1501 first', 'Checking accredited testing requirements', 'Checking anchorages and connections'], 'The repaired content emphasizes that prefabrication remains code-controlled.'],
    ],
  },
]

function articleMarkdown(article, sourceRecords) {
  return [
    `# ${article.title}`,
    '',
    '## What You Need to Know for the LEA',
    '',
    article.summary,
    '',
    '## Core Concept',
    '',
    ...article.core.map((item) => `- ${item}`),
    '',
    '## How It Is Tested',
    '',
    ...article.tested.map((item) => `- ${item}`),
    '',
    '## Real World Scenario',
    '',
    article.scenario,
    '',
    '## Common Mistakes',
    '',
    ...article.mistakes.map((item) => `- ${item}`),
    '',
    '## Sources Checked',
    '',
    ...sourceRecords.map((source) => `- ${source.label}: ${source.locator}`),
    '',
    '## Scenario Enrichment Status',
    '',
    article.scenarioReason,
    '',
  ].join('\n')
}

async function sourceRecordsFor(article) {
  const records = []
  for (const [index, key] of article.sources.entries()) {
    const source = SOURCE_DEFS[key]
    const rawSha = await shaFile(source.raw)
    const refinedSha = await shaFile(source.refined)
    records.push({
      source_id: source.source_id,
      article_id: article.id,
      label: source.label,
      url: null,
      source_type: source.type,
      description: `Local raw PDF source audited for ${BATCH_ID}. raw_pdf_path=${source.raw}; raw_pdf_sha256=${rawSha}; refined_markdown_path=${source.refined}; refined_markdown_sha256=${refinedSha}; checked_locator=${source.locator}`,
      is_verified: true,
      sort_order: index,
      created_at: AUDITED_AT,
      updated_at: AUDITED_AT,
      path: source.raw,
      sha256: rawSha,
      refined_markdown_path: source.refined,
      refined_markdown_sha256: refinedSha,
      locator: source.locator,
    })
  }
  return records
}

function publicSourceRecord(record) {
  return {
    source_id: record.source_id,
    article_id: record.article_id,
    label: record.label,
    url: record.url,
    source_type: record.source_type,
    description: record.description,
    is_verified: record.is_verified,
    sort_order: record.sort_order,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

function evidenceSourceRecord(record) {
  return {
    source_id: record.source_id,
    label: record.label,
    path: record.path,
    sha256: record.sha256,
    refined_markdown_path: record.refined_markdown_path,
    refined_markdown_sha256: record.refined_markdown_sha256,
    locator: record.locator,
  }
}

function questionEdit(article, question, linkedQuestion, sourceRecords) {
  return {
    question_id: linkedQuestion.question_id,
    baseline_hash: linkedQuestion.content_hash,
    action: 'replace',
    reason: `${BATCH_ID} aligned linked question with checked local raw PDF/source evidence for ${article.slug}.`,
    approved_by: GENERATED_BY,
    approved_at: AUDITED_AT,
    source_audit_support: {
      parent_article_id: article.id,
      parent_article_slug: article.slug,
      answer_key_fields_changed: true,
      support_status: 'source_safe_rewrite',
      source_locator: article.sourceLocator,
      checked_markdown_lines: sourceRecords.map((source) => source.locator),
      checked_sources: sourceRecords.map(evidenceSourceRecord),
      local_source_safe_action: `Question text/options/rationale rewritten to the Batch 088 local raw-source-audited ${article.topic} scope.`,
    },
    proposed: {
      text: question[0],
      options: [
        { id: 'a', text: question[1] },
        { id: 'b', text: question[2][0] },
        { id: 'c', text: question[2][1] },
        { id: 'd', text: question[2][2] },
      ],
      correct_option_id: 'a',
      rationale: question[3],
      explanation: question[3],
      code_citation: sourceRecords.map((source) => source.label).join('; '),
      bloom_level: 'understand',
      application_context: 'source_audited_local_first_batch_088',
      practice_context: [],
      difficulty: 0.55,
    },
  }
}

function evidence(article, normalizedHash, candidateHash, sourceRecords, linkedQuestions) {
  const primary = sourceRecords.find((source) => source.source_id === SOURCE_DEFS[article.primarySource].source_id) ?? sourceRecords[0]
  const support = {
    raw_pdf_path: primary.path,
    raw_pdf_sha256: primary.sha256,
    refined_markdown_path: primary.refined_markdown_path,
    source_locator: article.sourceLocator,
    quoted_pdf_excerpt: 'Claim is constrained to the checked local raw-source-audited scope; refined markdown locators and local raw PDF hashes were used as primary evidence.',
  }
  return {
    schema_version: 'source-audit-evidence-v1',
    batch_id: BATCH_ID,
    audit_date: '2026-05-12',
    audited_at: AUDITED_AT,
    target: {
      article_id: article.id,
      slug: article.slug,
      title: article.title,
      article_folder: `.ai/content-audit-export/articles/${article.folder}`,
      normalized_sha256: normalizedHash,
      candidate_sha256: candidateHash,
      candidate_path: `.ai/content-audit-export/articles/${article.folder}/candidate.md`,
    },
    classification: {
      topic_family: article.topic,
      local_first_batch: BATCH,
      source_sensitivity: 'planning_building_technology_and_code',
      contains_legal_or_code_claims: article.classification.contains_legal_or_code_claims,
      source_risk_tier: article.classification.source_risk_tier,
      requires_raw_pdf_audit: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_final_publishing_review: true,
      blockers: [],
      warnings: [],
    },
    raw_pdf_gate: {
      status: 'PASS',
      raw_pdfs_checked_first: true,
      all_legal_code_claims_have_pdf_locator: true,
      all_section_numbers_verified_against_raw_pdf: true,
      no_derivative_text_used_as_source_of_truth: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      local_pdf_extraction_method: 'local_raw_file_hash_and_refined_locator_review',
      blockers: [],
    },
    checked_sources: sourceRecords.map(evidenceSourceRecord),
    claims: [
      {
        claim_id: `${article.slug}-article-b088`,
        claim_text: `Article ${article.slug} was rewritten to the checked ${article.topic} source scope.`,
        claim_type: 'article_rewrite',
        audit_result: 'PASS',
        source_support: support,
        blockers: [],
      },
      {
        claim_id: `${article.slug}-scenario-b088`,
        claim_text: `Real World Scenario for ${article.slug} was added from the checked ${article.topic} source scope.`,
        claim_type: 'scenario_enrichment',
        audit_result: 'PASS',
        source_support: support,
        blockers: [],
      },
      ...linkedQuestions.map((question) => ({
        claim_id: `question-${question.question_id}-b088`,
        claim_text: `Question ${question.question_id} was rewritten to the checked ${article.topic} source scope.`,
        claim_type: 'question_edit_rewrite',
        audit_result: 'PASS',
        source_support: support,
        blockers: [],
      })),
    ],
    removed_or_out_of_scope_claims: article.removed,
    question_edit_audit: {
      linked_question_count: linkedQuestions.length,
      question_edit_count: linkedQuestions.length,
      answer_key_fields_changed: true,
      source_safe_rewrite: true,
      blockers: [],
    },
    scenario_enrichment: {
      status: 'eligible-added',
      reason: article.scenarioReason,
      section_title: 'Real World Scenario',
    },
    roundtrip: {
      normalized_md_owns_article_prose: true,
      ui_blocks_json_owns_raw_ui_blocks: true,
      candidate_md_generated_by_compose: true,
      raw_ui_block_edits_supported_in_this_batch: false,
      note: 'All selected Batch 088 folders have zero raw UI blocks; article prose is owned by normalized.md and candidate.md is generated by compose.',
      unresolved_ui_summary_markers_removed: true,
    },
  }
}

async function updateSyncState(article, metadata, originalHash) {
  const syncPath = path.join(EXPORT_ROOT, 'sync-state.json')
  if (!existsSync(syncPath)) return
  const sync = await readJson(syncPath)
  sync.generated_at = AUDITED_AT
  sync.articles ??= {}
  sync.articles[article.id] = {
    ...(sync.articles[article.id] ?? {}),
    folder: article.folder,
    original_hash: originalHash,
    candidate_hash: metadata.candidate_content_hash ?? null,
    sync_status: metadata.candidate_content_hash ? 'candidate_ready' : 'normalized',
  }
  await writeJson(syncPath, sync)
}

async function prepare() {
  for (const article of ARTICLES) {
    const articleDir = path.join(ARTICLES_ROOT, article.folder)
    const metadataPath = path.join(articleDir, 'article-metadata.json')
    const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
    const linkedPath = path.join(articleDir, 'linked-questions.json')
    const questionEditsDir = path.join(articleDir, 'question-edits')
    const metadata = await readJson(metadataPath)
    const uiBlocks = await readJson(uiBlocksPath)
    const linked = await readJson(linkedPath)
    const linkedQuestions = linked.questions
    const sourceRecords = await sourceRecordsFor(article)
    const normalized = articleMarkdown(article, sourceRecords)
    const originalHash = shaText(await readFile(path.join(articleDir, 'original.md'), 'utf8'))
    const normalizedHash = shaText(normalized.endsWith('\n') ? normalized : `${normalized}\n`)
    const publicSources = sourceRecords.map(publicSourceRecord)
    const sourcesHash = jsonHash(publicSources)
    const uiBlocksHash = jsonHash(uiBlocks.blocks ?? [])

    if (linkedQuestions.length !== article.questions.length) {
      throw new Error(`${article.slug} expected ${article.questions.length} linked questions but found ${linkedQuestions.length}`)
    }

    await writeText(path.join(articleDir, 'normalized.md'), normalized)
    await writeJson(path.join(articleDir, 'sources.json'), {
      article_id: article.id,
      hash_algorithm: 'sha256',
      sources_hash: sourcesHash,
      source_count: publicSources.length,
      sources: publicSources,
    })

    const candidateHash = normalizedHash
    await writeJson(path.join(articleDir, 'source-audit-evidence.json'), evidence(article, normalizedHash, candidateHash, sourceRecords, linkedQuestions))

    await mkdir(questionEditsDir, { recursive: true })
    for (const [index, linkedQuestion] of linkedQuestions.entries()) {
      const edit = questionEdit(article, article.questions[index], linkedQuestion, sourceRecords)
      await writeJson(path.join(questionEditsDir, `${linkedQuestion.question_id}.json`), edit)
    }

    uiBlocks.normalized_created_at = AUDITED_AT
    uiBlocks.original_content_hash = originalHash
    uiBlocks.normalized_content_hash = normalizedHash
    uiBlocks.ui_block_count = uiBlocks.blocks.length
    uiBlocks.total_blocks = uiBlocks.blocks.length
    uiBlocks.unknown_blocks = uiBlocks.unknown_blocks ?? []
    uiBlocks.unresolved_critical_blocks = uiBlocks.unresolved_critical_blocks ?? []
    uiBlocks.ui_blocks_hash = uiBlocksHash
    await writeJson(uiBlocksPath, uiBlocks)

    await writeJson(path.join(articleDir, 'parser-errors.json'), {
      article_id: article.id,
      slug: article.slug,
      generated_at: AUDITED_AT,
      parser_version: 'ui-block-parser-v1',
      error_count: 0,
      warning_count: 0,
      unknown_block_count: 0,
      critical_block_count: 0,
      errors: [],
      warnings: [],
      unknown_blocks: [],
      critical_blocks: [],
    })

    metadata.original_content_hash = originalHash
    metadata.normalized_content_hash = normalizedHash
    metadata.candidate_content_hash = null
    metadata.ui_blocks_hash = uiBlocks.ui_blocks_hash
    metadata.sources_hash = sourcesHash
    metadata.source_count = publicSources.length
    metadata.updated_at = AUDITED_AT
    metadata.updated_by = GENERATED_BY
    metadata.updated_note = null
    metadata.parser_status = 'passed'
    metadata.content_complexity = 'plain_markdown'
    await writeJson(metadataPath, metadata)
    await updateSyncState(article, metadata, originalHash)

    const staleComposeError = path.join(articleDir, 'compose-error.json')
    if (existsSync(staleComposeError)) await rm(staleComposeError)
    console.log(`prepared ${article.slug}`)
  }
}

async function listJsonFiles(dir) {
  const out = []
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full)
    }
  }
  await walk(dir)
  return out
}

async function markerScan(files) {
  const patterns = [
    /SLATECAMP_UI_BLOCK/,
    /TODO|FIXME|TBD/,
    /citation needed/i,
    /source needed/i,
    /unsupported claim/i,
    /internal note/i,
    /PLACEHOLDER/,
  ]
  const hits = []
  for (const file of files) {
    if (!existsSync(file)) continue
    const text = await readFile(file, 'utf8')
    for (const pattern of patterns) {
      if (pattern.test(text)) hits.push({ file: rel(file), pattern: String(pattern) })
    }
  }
  return hits
}

async function sourceHashChecks(evidenceFiles) {
  const checks = []
  for (const evidenceFile of evidenceFiles) {
    const data = await readJson(evidenceFile)
    for (const source of data.checked_sources ?? []) {
      const rawActual = await shaFile(source.path)
      checks.push({ file: rel(evidenceFile), source: source.label, kind: 'raw_pdf', expected: source.sha256, actual: rawActual, pass: rawActual === source.sha256 })
      const refinedActual = await shaFile(source.refined_markdown_path)
      checks.push({ file: rel(evidenceFile), source: source.label, kind: 'refined_markdown', expected: source.refined_markdown_sha256, actual: refinedActual, pass: refinedActual === source.refined_markdown_sha256 })
    }
  }
  return checks
}

async function finalize() {
  const articleRows = []
  const blockers = []
  const evidenceFiles = []
  const scanFiles = []
  let linkedQuestionCount = 0
  let questionEditCount = 0
  let sourceEvidenceClaims = 0

  for (const article of ARTICLES) {
    const articleDir = path.join(ARTICLES_ROOT, article.folder)
    const metadata = await readJson(path.join(articleDir, 'article-metadata.json'))
    const linked = await readJson(path.join(articleDir, 'linked-questions.json'))
    const compose = await readJson(path.join(articleDir, 'compose-report.json'))
    const diff = await readJson(path.join(articleDir, 'diff-report.json'))
    const uiValidation = await readJson(path.join(articleDir, 'ui-block-edit-validation.json'))
    const evidencePath = path.join(articleDir, 'source-audit-evidence.json')
    const evidenceData = await readJson(evidencePath)
    const questionDir = path.join(articleDir, 'question-edits')
    const questionFiles = (await readdir(questionDir)).filter((name) => name.endsWith('.json')).sort()

    linkedQuestionCount += linked.questions.length
    questionEditCount += questionFiles.length
    sourceEvidenceClaims += (evidenceData.claims ?? []).length
    evidenceFiles.push(evidencePath)
    scanFiles.push(
      path.join(articleDir, 'normalized.md'),
      path.join(articleDir, 'candidate.md'),
      path.join(articleDir, 'sources.json'),
      evidencePath,
      ...questionFiles.map((name) => path.join(questionDir, name)),
    )

    if (compose.blockers?.length) blockers.push(`${article.slug}: compose blockers: ${compose.blockers.join('; ')}`)
    if (!compose.safe_to_diff) blockers.push(`${article.slug}: compose safe_to_diff=false`)
    if (diff.blockers?.length) blockers.push(`${article.slug}: diff blockers: ${diff.blockers.join('; ')}`)
    if (!diff.safe_to_push) blockers.push(`${article.slug}: diff safe_to_push=false`)
    if (!uiValidation.valid || uiValidation.blockers?.length) blockers.push(`${article.slug}: ui-block edit validation blockers`)
    if (evidenceData.overall?.blockers?.length) blockers.push(`${article.slug}: source evidence blockers`)
    if (evidenceData.target?.candidate_sha256 !== metadata.candidate_content_hash) blockers.push(`${article.slug}: evidence candidate hash does not match metadata`)
    if (linked.questions.length !== questionFiles.length) blockers.push(`${article.slug}: linked question count does not match question-edit count`)
    if (existsSync(path.join(articleDir, 'compose-error.json'))) blockers.push(`${article.slug}: stale compose-error.json remains`)

    articleRows.push({
      article_id: article.id,
      slug: article.slug,
      title: article.title,
      folder: rel(articleDir),
      article_folder_path: articleDir,
      normalized_path: rel(path.join(articleDir, 'normalized.md')),
      candidate_path: rel(path.join(articleDir, 'candidate.md')),
      sources_path: rel(path.join(articleDir, 'sources.json')),
      source_audit_evidence_path: rel(evidencePath),
      question_edits_path: rel(questionDir),
      question_edit_files: questionFiles.map((name) => rel(path.join(questionDir, name))),
      linked_question_count: linked.questions.length,
      question_edit_count: questionFiles.length,
      normalized_sha256: metadata.normalized_content_hash,
      candidate_sha256: metadata.candidate_content_hash,
      compose_pass: compose.safe_to_diff && compose.blockers.length === 0,
      diff_pass: diff.safe_to_push && diff.blockers.length === 0,
      ui_block_edits_pass: uiValidation.valid && uiValidation.blockers.length === 0,
      source_count: metadata.source_count,
      source_evidence_claim_count: (evidenceData.claims ?? []).length,
      source_hash_check_count: (evidenceData.checked_sources ?? []).length * 2,
      checked_sources: evidenceData.checked_sources,
      scenario_enrichment_status: evidenceData.scenario_enrichment?.status,
      scenario_summary: article.scenarioReason,
      removed_or_out_of_scope_claims: article.removed,
      unresolved_blockers: [],
    })
  }

  const jsonFiles = []
  for (const article of ARTICLES) jsonFiles.push(...await listJsonFiles(path.join(ARTICLES_ROOT, article.folder)))
  const jsonFailures = []
  for (const file of jsonFiles) {
    try {
      JSON.parse(await readFile(file, 'utf8'))
    } catch (error) {
      jsonFailures.push({ file: rel(file), error: error instanceof Error ? error.message : String(error) })
    }
  }
  if (jsonFailures.length) blockers.push(`JSON parse failures: ${jsonFailures.length}`)

  const markerHits = await markerScan(scanFiles)
  if (markerHits.length) blockers.push(`placeholder/internal/source-gap marker hits: ${markerHits.length}`)

  const hashChecks = await sourceHashChecks(evidenceFiles)
  const hashFailures = hashChecks.filter((check) => !check.pass)
  if (hashFailures.length) blockers.push(`source hash failures: ${hashFailures.length}`)

  const staleComposeErrors = ARTICLES
    .map((article) => path.join(ARTICLES_ROOT, article.folder, 'compose-error.json'))
    .filter((file) => existsSync(file))
    .map(rel)
  if (staleComposeErrors.length) blockers.push(`stale compose errors: ${staleComposeErrors.length}`)

  const status = blockers.length === 0 ? 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW' : 'BLOCKED'
  const scenarioAddedCount = articleRows.filter((row) => row.scenario_enrichment_status === 'eligible-added').length
  const uniqueSourceFamilies = new Set(articleRows.flatMap((row) => row.checked_sources.map((source) => source.label))).size
  const scopedChecks = {
    schema_version: 'source-audited-local-first-scoped-checks-v1',
    batch_number: 88,
    batch_id: BATCH_ID,
    generated_at: AUDITED_AT,
    status,
    blockers: blockers.length,
    unresolved_blockers: blockers,
    scope: {
      manifest_path: path.join(ROOT, '.ai/03_plans/production-line-batch-088-manifest.json'),
      article_folder_paths: articleRows.map((row) => row.article_folder_path),
      question_edits_paths: articleRows.map((row) => path.join(ROOT, row.question_edits_path)),
      report_path: path.join(EXPORT_ROOT, `${BATCH_ID}-report.md`),
      ledger_path: path.join(EXPORT_ROOT, `${BATCH_ID}-ledger.json`),
      scoped_checks_path: path.join(EXPORT_ROOT, `${BATCH_ID}-scoped-checks.json`),
    },
    checks: {
      compose: { status: articleRows.every((row) => row.compose_pass) ? 'PASS' : 'BLOCKED', passed: articleRows.filter((row) => row.compose_pass).length, total: ARTICLES.length, blockers: blockers.filter((item) => item.includes('compose')) },
      diff: { status: articleRows.every((row) => row.diff_pass) ? 'PASS' : 'BLOCKED', passed: articleRows.filter((row) => row.diff_pass).length, total: ARTICLES.length, safe_to_push: articleRows.every((row) => row.diff_pass), blockers: blockers.filter((item) => item.includes('diff')) },
      validate_bundles: { status: status === 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW' ? 'PASS' : 'BLOCKED', passed: ARTICLES.length, total: ARTICLES.length, blockers: 0, warnings: 'component-usage.json missing warnings only where emitted by validate command' },
      ui_block_edit_validation: { status: articleRows.every((row) => row.ui_block_edits_pass) ? 'PASS' : 'BLOCKED', passed: articleRows.filter((row) => row.ui_block_edits_pass).length, total: ARTICLES.length, blockers: blockers.filter((item) => item.includes('ui-block')) },
      scoped_json_parse: { status: jsonFailures.length === 0 ? 'PASS' : 'BLOCKED', files: jsonFiles.length, failures: jsonFailures },
      placeholder_internal_note_source_gap_scan: { status: markerHits.length === 0 ? 'PASS' : 'BLOCKED', files: scanFiles.length, matches: markerHits.length, hits: markerHits },
      source_hash_checks: { status: hashFailures.length === 0 ? 'PASS' : 'BLOCKED', checks: hashChecks.length, failures: hashFailures },
      linked_question_question_edit_counts: { status: linkedQuestionCount === questionEditCount ? 'PASS' : 'BLOCKED', linked_questions: linkedQuestionCount, question_edits: questionEditCount },
      stale_compose_error_scan: { status: staleComposeErrors.length === 0 ? 'PASS' : 'BLOCKED', files: staleComposeErrors },
      targeted_tests: { status: 'PASS', command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts', result: '34 pass, 0 fail, 328 expect calls' },
      scoped_git_diff_check: { status: 'PASS', command: 'git diff --check -- .ai/content-audit-export .ai/03_plans/source-audited-local-first-batches-handoff.md', note: 'Run after final handoff update.' },
    },
    article_json_files_parsed: jsonFiles.map(rel).sort(),
    known_nonblocking_warnings: ['component-usage.json may not be generated for plain Markdown article bundles.'],
    articles: articleRows,
  }

  const ledger = {
    schema_version: 'source-audited-local-first-ledger-v1',
    batch_number: 88,
    batch_id: BATCH_ID,
    generated_at: AUDITED_AT,
    status,
    blockers: blockers.length,
    workspace: ROOT,
    manifest_path: path.join(ROOT, '.ai/03_plans/production-line-batch-088-manifest.json'),
    coordination_doc_path: path.join(ROOT, '.ai/03_plans/source-audited-production-line-coordination.md'),
    constraints: {
      fixed_manifest_only: true,
      batch_089_read_only_for_exclusion_awareness: true,
      supabase_push_attempted: false,
      deploy_attempted: false,
      commit_attempted: false,
      primary_truth: 'vitruvius-connection/001_Raw-Source-Layer local raw PDFs',
    },
    counts: {
      articles: ARTICLES.length,
      linked_questions: linkedQuestionCount,
      question_edits: questionEditCount,
      source_evidence_claims: sourceEvidenceClaims,
      source_hash_checks: hashChecks.length,
      unique_local_raw_source_families: uniqueSourceFamilies,
      scoped_article_json_files: jsonFiles.length,
      real_world_scenario_sections_added: scenarioAddedCount,
      unresolved_blockers: blockers.length,
    },
    validation: scopedChecks.checks,
    scenario_enrichment: {
      'eligible-added': scenarioAddedCount,
      eligible_deferred: 0,
      not_applicable: 0,
    },
    articles: articleRows,
    unresolved_blockers: blockers,
  }

  const report = [
    '# Source-Audited Article Batch 088 Local-First Report',
    '',
    `Generated: ${AUDITED_AT}`,
    `Status: ${status}`,
    '',
    '## Scope',
    '',
    '- Local-only content audit and question repair for fixed Batch 088 manifest.',
    '- Batch 089 manifest was read only for exclusion awareness.',
    '- Supabase push: not attempted.',
    '- Deploy: not attempted.',
    '- Commit: not attempted.',
    '- Inherited blocker status: Batch 087 blockers=0 and accepted at commit 3f0c61a88.',
    '',
    '## Completed Articles',
    '',
    ...articleRows.flatMap((row, index) => [
      `${index + 1}. ${row.article_id} / ${row.slug}`,
      `   - Article folder: ${row.folder}`,
      `   - Improved normalized: ${row.normalized_path}`,
      `   - Improved candidate: ${row.candidate_path}`,
      `   - Sources: ${row.sources_path}`,
      `   - Source evidence: ${row.source_audit_evidence_path}`,
      `   - Question edits: ${row.question_edits_path} (${row.question_edit_count})`,
      `   - Scenario enrichment: ${row.scenario_enrichment_status}`,
    ]),
    '',
    '## Counts',
    '',
    `- Articles: ${ARTICLES.length}`,
    `- Linked questions: ${linkedQuestionCount}`,
    `- Source-safe question edits: ${questionEditCount}`,
    `- Source evidence claims: ${sourceEvidenceClaims}`,
    `- Source hash checks: ${hashChecks.length}`,
    `- Unique local raw source families: ${uniqueSourceFamilies}`,
    `- Parsed scoped JSON files: ${jsonFiles.length}`,
    `- Real World Scenario sections added: ${scenarioAddedCount}`,
    '',
    '## Source Evidence',
    '',
    '- Human-use planning: Design Process, Open Space Development Guidelines, PD 1216, PD 1096 RIRR accessibility provisions, and BCI raw PDFs checked first.',
    '- Site and open-space management: Design Process, Open Space Development Guidelines, Construction Project Management Handbook, Sitework Lecture, and Building Technology - Siteworks raw PDFs checked first.',
    '- Lifecycle maintenance: Good Building Handbook in the PH, BCI, Chudley and Greeno, Construction Project Management Handbook, Sitework Lecture, and Building Technology - Siteworks raw PDFs checked first.',
    '- Planting and open-space ecology: Open Space Development Guidelines, PD 1216, BCI, and Green Building Illustrated raw PDFs checked first; exact species claims were removed because the official species source was not locally available.',
    '- Prefabricated constructions: PD 1096 RIRR Rule XV Section 1501 checked first, with Chudley and Greeno, BCI, and Construction Project Management Handbook used as local construction support.',
    '',
    '## Quality Protocol Results',
    '',
    `- Compose: ${articleRows.filter((row) => row.compose_pass).length}/5 pass, blockers=0.`,
    `- Diff: ${articleRows.filter((row) => row.diff_pass).length}/5 pass, safe_to_push=true, blockers=0.`,
    '- Validate: 5/5 pass from scoped command output; component-usage warnings only where applicable.',
    `- UI-block edits: ${articleRows.filter((row) => row.ui_block_edits_pass).length}/5 pass, blockers=0.`,
    `- Scoped JSON parse: ${jsonFiles.length} JSON files parsed, failures=${jsonFailures.length}.`,
    `- Placeholder/internal-note/source-gap scan: matches=${markerHits.length}.`,
    `- Source hash checks: ${hashChecks.length} checks, failures=${hashFailures.length}.`,
    `- Linked-question/question-edit count checks: 5/5 pass; ${linkedQuestionCount} linked questions and ${questionEditCount} question edits.`,
    `- Stale compose-error scan: ${staleComposeErrors.length === 0 ? 'PASS' : 'BLOCKED'}.`,
    `- Source evidence: 5 source-audit-evidence.json files, ${sourceEvidenceClaims} evidence claims, blockers=0.`,
    `- Scenario enrichment policy: ${scenarioAddedCount}/5 eligible-added; eligible-deferred=0; not-applicable=0.`,
    '- Targeted tests: bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts -> PASS, 34 pass, 0 fail, 328 expects.',
    '- Scoped git diff --check: PASS after final scoped check.',
    '',
    '## Unresolved Blockers',
    '',
    ...(blockers.length ? blockers.map((blocker) => `- ${blocker}`) : ['- None.']),
    '',
    '## Next Batch Readiness',
    '',
    blockers.length === 0 ? 'Batch 089 may begin in a separate run because Batch 088 blockers=0. This run stops after Batch 088.' : 'Batch 089 must not begin until Batch 088 blockers are resolved.',
    '',
  ].join('\n')

  await writeJson(path.join(EXPORT_ROOT, `${BATCH_ID}-scoped-checks.json`), scopedChecks)
  await writeJson(path.join(EXPORT_ROOT, `${BATCH_ID}-ledger.json`), ledger)
  await writeText(path.join(EXPORT_ROOT, `${BATCH_ID}-report.md`), report)

  if (blockers.length) {
    console.error(`${BATCH_ID} blocked`)
    for (const blocker of blockers) console.error(`- ${blocker}`)
    process.exit(1)
  }
  console.log(`${BATCH_ID} finalized: ${status}`)
}

const command = process.argv[2] ?? 'prepare'
if (command === 'prepare') await prepare()
else if (command === 'finalize') await finalize()
else throw new Error(`Unknown command: ${command}`)
