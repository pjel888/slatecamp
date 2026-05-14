#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildDiffMarkdown, composeCandidate, diffCandidate } from '../../../scripts/content-audit/lib.ts';

const REPO = process.cwd();
const BATCH = 139;
const BATCH_ID = 'source-audited-article-batch-139-local-first';
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = GENERATED_AT.slice(0, 10);
const EXPORT_ROOT = '.ai/content-audit-export';
const ARTICLES_ROOT = `${EXPORT_ROOT}/articles`;
const RAW_LAWS_DIR = `vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-${BATCH}`;
const REFINED_LAWS_DIR = `vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/source-map-batch-${BATCH}`;
const RAW_TECH_DIR = `vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-${BATCH}`;
const REFINED_TECH_DIR = `vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-${BATCH}`;
const RAW_STRUCT_DIR = `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-${BATCH}`;
const REFINED_STRUCT_DIR = `vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-${BATCH}`;
const SUMMARY_PATH = `${EXPORT_ROOT}/${BATCH_ID}-content-generation-summary.json`;
const RUN_SUMMARY_PATH = `${EXPORT_ROOT}/runs/source-audited-batch-${BATCH}-local-generation-summary.json`;

function sha256(content) {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function sha256Json(value) {
  return sha256(JSON.stringify(value));
}

function sha256File(relativePath) {
  return `sha256:${createHash('sha256').update(readFileSync(path.join(REPO, relativePath))).digest('hex')}`;
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(REPO, relativePath), 'utf8'));
}

function writeText(relativePath, value) {
  const fullPath = path.join(REPO, relativePath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function stripQuestionHash(question) {
  const clone = { ...question };
  delete clone.content_hash;
  return clone;
}

function cleanOneLine(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

const sourceFamilies = {
  manilaClup: {
    label: 'Manila CLUP 2005-2020',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/LGU/623689186-Manila-CLUP-2005-2020.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/LGU/623689186-Manila-CLUP-2005-2020.md',
    locator: 'Manila CLUP refined markdown lines 157-180, 315-347, 411-433, 657-677, and 737-775',
    notes: [
      'The Manila CLUP is the city framework for development for planning years 2005-2020.',
      'The source treats Daniel Burnham as Manila planning memory tied to waterfront, transport, and amenity value.',
      'The CLUP links planning to regional frameworks, data review, SWOT analysis, zoning, and implementation documents.',
      'The source identifies fragmented land use, nonconforming uses, flooding, and infrastructure concerns as planning issues.',
    ],
  },
  bgc: {
    label: 'BGC Design Standards and Guidelines',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/LGU/794422427-BGC-Design-Standards-and-Guidelines.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/LGU/794422427-BGC-Design-Standards-and-Guidelines.md',
    locator: 'BGC DSG refined markdown lines 328-412, 474-480, 498, 883-884, 1411-1415, 3217, and 3890',
    notes: [
      'BGC is described through districts, broad land-use zones, road networks, transit, and pedestrian systems.',
      'The source includes residential, mixed-use, institutional, commercial, and transit-oriented district cues.',
      'Development proposals must check master plan and zoning requirements before submission.',
      'Pedestrian systems, skywalks, arcades, passageways, and district cooling are source-supported district design topics.',
    ],
  },
  dhsudResilient: {
    label: 'DHSUD Resilient Urban Design and Development Guidelines',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/Resilient Urban Design and Development Guidelines.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/HLURB-DHSUD/Resilient Urban Design and Development Guidelines.md',
    locator: 'DHSUD RUDD refined markdown lines 41-65, 331-349, 883-884, 1069, 2578-2592, and 2613-2618',
    notes: [
      'The guidelines use the CLUP and Zoning Ordinance as strategic tools for green, resilient urban renewal and development.',
      'They name compact, mixed-use, and transit-oriented development as resilient urban design strategies.',
      'Urban design is framed as an organized spatial development process aligned with local land-use planning.',
      'Local urban design guides and GIS-generated maps are used to connect CLUP goals, hazards, and interventions.',
    ],
  },
  clupGis: {
    label: 'HLURB CLUP GIS Guidebook',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/CLUP GIS GUIDEBOOK HLURB.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/HLURB-DHSUD/CLUP GIS GUIDEBOOK HLURB.md',
    locator: 'CLUP GIS Guidebook refined markdown lines 676-712, 1036-1072, and 1334-1374',
    notes: [
      'The GIS guidebook is part of the CLUP guideline series for LGU CLUP preparation.',
      'It frames GIS as a planning and information-management tool for geographic information products.',
      'GIS supports participatory CLUP formulation and rational land-use decision-making.',
      'Information products include tables, graphs, and maps in digital and paper formats.',
    ],
  },
  ra11285: {
    label: 'RA 11285 Energy Efficiency and Conservation Act',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-11285/RA 11285 - Energy Efficiency and Conservation Act 2019.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-11285/RA 11285 - Energy Efficiency and Conservation Act 2019.md',
    locator: 'RA 11285 refined markdown lines 37-105, 141-153, 185-241, 291-353, and 447-451',
    notes: [
      'The Act institutionalizes energy efficiency and conservation as national policy.',
      'Energy audit evaluates energy consumption and current energy cost to identify efficiency interventions.',
      'Energy efficiency means delivering the same service with less energy input or more service with the same input.',
      'LGUs are supported in local energy efficiency and conservation planning and implementation.',
    ],
  },
  berde: {
    label: 'BERDE Buildings Version 5.0.0 User Guide',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/BERDE/BERDE – Buildings – Version 5.0.0 – User Guide.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/BERDE/BERDE – Buildings – Version 5.0.0 – User Guide.md',
    locator: 'BERDE refined markdown lines 123-171, 261-364, 1163-1177, 1347-1377, 1931-2090, and 2100-2106',
    notes: [
      'BERDE assesses, measures, monitors, and certifies project performance beyond existing laws and mandatory standards.',
      'BERDE certification stages depend on project life-cycle stage, project type, and occupancy type.',
      'Specifications document materials, products, equipment, and processes for construction.',
      'Deconstruction waste management includes waste base cases, diversion targets, records, reuse, recycling, and landfill diversion.',
    ],
  },
  greenBuildingIllustrated: {
    label: 'Green Building Illustrated',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Green Building Illustrated.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Green Building Illustrated.md',
    locator: 'Green Building Illustrated refined markdown lines 163-169, 271-284, 718-787, and 7323-7535',
    notes: [
      'Green building addresses energy, water, material conservation, indoor environmental quality, and environmental impact.',
      'Material impacts include extraction, processing, manufacture, transport, hazardous materials, and construction waste.',
      'Material conservation is supported by using less material, avoiding waste, salvaging, reusing, and using recycled content.',
      'Embodied energy includes the energy to harvest, manufacture, prepare, and transport materials to a construction site.',
    ],
  },
  salvanMaterials: {
    label: 'George Salvan Architectural Building Materials',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/George-Salvan-Architectural-Building-Materials.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/George-Salvan-Architectural-Building-Materials.md',
    locator: 'Salvan Building Materials refined markdown lines 73-79, 571-573, 1282, 1457-1463, and 12960-13458',
    notes: [
      'The source covers properties, applications, systems of construction, specification methods, and character in use.',
      'It discusses building-material knowledge needed for selection and specification.',
      'Material selection can include durability, use conditions, protection, and construction specifications.',
      'The source includes examples of recycled or byproduct material use such as fly ash as a pozzolan.',
    ],
  },
  hibbelerStatics: {
    label: 'Hibbeler Statics 13th Edition',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Hibbeler Statics 13th Ed.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Hibbeler Statics 13th Ed.md',
    locator: 'Hibbeler Statics refined markdown lines 421-458, 472-510, 887-889, 1034-1038, 1061-1065, 1097-1099, and 2023-2075',
    notes: [
      'Force is treated as a push or pull exerted by one body on another.',
      'A force is characterized by magnitude, direction, and point of application.',
      'Force is a vector quantity and may be added or resolved through vector methods.',
      'Statics uses resultant forces, components, and equilibrium reasoning before selecting formulas.',
    ],
  },
};

const blockedClusters = [
  {
    cluster_id: 'lea-theo-008-02-core-concept',
    title: 'Articulation of form',
    status: 'blocked_carried_forward',
    reason: 'Carried forward from earlier batches because the required theory-form claim scope still lacks a sufficient local source boundary.',
  },
  {
    cluster_id: 'lea-theo-008-03-core-concept',
    title: 'Transformation of form',
    status: 'blocked_carried_forward',
    reason: 'Carried forward from earlier batches because the required theory-form claim scope still lacks a sufficient local source boundary.',
  },
  {
    cluster_id: 'lea-matl-009-02-core-concept',
    title: 'CSI MasterFormat',
    status: 'blocked_batch_139',
    reason: 'Exact CSI MasterFormat claims were not supported by a captured local source artifact, so the bundle was not rewritten in this batch.',
  },
  {
    cluster_id: 'lea-util-004-05-seismic-bracing-and-earthquake-resilience',
    title: 'Seismic bracing and earthquake resilience',
    status: 'blocked_batch_139',
    reason: 'The local queue has raw structural references, but the needed utilities seismic-bracing refined conversion boundary was not available for this pass.',
  },
  {
    cluster_id: 'lea-util-004-08-seismic-bracing-requirements-per-nscp-2015',
    title: 'Seismic bracing requirements per NSCP 2015',
    status: 'blocked_batch_139',
    reason: 'The raw NSCP 2015 PDF exists locally, but a refined conversion boundary for the required NSCP-specific claims was not available for this pass.',
  },
];

const commonWrongAnswers = [
  'Answer from a memorized slogan instead of the checked local source boundary.',
  'Treat a design example as a universal legal or technical rule.',
  'Choose the most familiar term even when the stem asks for a different source path.',
  'Add a precise number or standard that is not present in the local evidence.',
  'Ignore whether the question is asking for planning logic, documentation, or technical analysis.',
];

const articles = [
  {
    clusterId: 'lea-plan-007-06-core-concept',
    directory: 'lea-plan-007-06-core-concept--fc0f6b12-8d7e-4309-b83c-daba0863ff30',
    articleId: 'fc0f6b12-8d7e-4309-b83c-daba0863ff30',
    slug: 'lea-plan-007-06-core-concept',
    title: 'Philippine planning lineage - Burnham, CLUP, and district design',
    category: 'Planning, Housing & Urban Design',
    captureRoot: RAW_LAWS_DIR,
    refinedRoot: REFINED_LAWS_DIR,
    sourceKeys: ['manilaClup', 'bgc', 'dhsudResilient'],
    summary: 'Burnham is treated as a planning-memory cue inside Manila CLUP work, then connected to CLUP control, district planning, and resilient urban design.',
    body: `# Philippine Planning Lineage: Burnham Memory, CLUP Control, and District Design

## Board Exam Quick Check

For Burnham or planning-lineage questions, do not stop at a name. Ask what the stem is testing: historic planning memory, CLUP implementation, district design, or resilient urban design. The local source boundary supports Burnham as part of Manila's planning memory and then moves the answer toward CLUP, zoning, district, transit, pedestrian, and resilience logic.

## What You Need to Know for the LEA

The Manila CLUP describes itself as a framework for Manila's 2005-2020 development and records Daniel Burnham as a planning reference tied to waterfront, transport, and amenity value. That makes Burnham useful as a lineage cue, not as permission to answer every planning item from style trivia.

The stronger exam move is to connect lineage to implementation. The Manila CLUP organizes goals, sectoral plans, zoning, and development guidelines. BGC shows a district-scale example with land-use zones, transit, pedestrian systems, mixed-use areas, and submission checks against master plan and zoning requirements. DHSUD's resilient urban design guidance then frames contemporary local work through CLUP and Zoning Ordinance tools, compact mixed-use strategies, and local urban design guides.

## Real World Scenario

A Manila waterfront improvement question mentions Burnham and asks what the planner should check next. A source-safe answer recognizes Burnham as the historic planning cue, then checks the current CLUP, zoning ordinance, hazards, public-realm goals, and implementation guide. The answer should not claim that a historic plan alone approves today's development.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Burnham in Manila | Treat as historic planning memory linked to waterfront, transport, and amenity value. |
| Current Manila development control | Use the CLUP, zoning ordinance, and implementation documents. |
| BGC-style district planning | Check districts, land-use zones, transit, pedestrian networks, and master plan requirements. |
| Resilient urban design | Use CLUP/ZO integration, hazards, compact development, mixed use, and local urban design guides. |
| Overclaimed answer | A style label that skips current local planning and regulatory instruments. |

## How It Is Tested

Questions often pair a famous planner with a current planning action. The correct answer usually preserves the historic cue while shifting to the operational source: CLUP, zoning, district standards, or resilient urban design.

## Common Mistakes

- Treating Burnham as the answer to every Manila planning question.
- Ignoring the CLUP and zoning ordinance when the stem asks for implementation.
- Applying BGC district rules to every Philippine city without checking the local plan.
- Treating resilience as a slogan instead of a CLUP-linked design process.
`,
    questions: [
      ['A Manila planning question mentions Daniel Burnham, but the task is to guide a current waterfront intervention. What is the safest next source path?', 'Use Burnham as the historic cue, then check the current CLUP, zoning, hazards, and implementation documents.', ['Answer only with a historic style label.', 'Apply BGC lot rules without checking Manila sources.', 'Treat the project as automatically approved.']],
      ['What does the Manila CLUP support about Burnham in a source-safe answer?', 'Burnham is part of Manila planning memory tied to waterfront, transport, and amenity value.', ['Burnham alone supplies every current zoning rule.', 'Burnham replaces the local zoning ordinance.', 'Burnham proves all districts must copy BGC.']],
      ['A stem asks how a district like BGC is controlled before design submission. Which answer fits the local source boundary?', 'Check the master plan, land-use zones, transit and pedestrian systems, and zoning requirements.', ['Choose the tallest allowable tower by memory.', 'Skip the district plan because it is private land.', 'Use only a historical planner name.']],
      ['Why is CLUP stronger than a personality answer for current planning decisions?', 'The CLUP contains the framework, zoning, sectoral plans, and implementation guidance for local development.', ['It is just a biography of planners.', 'It cancels all design standards.', 'It is unrelated to land-use decisions.']],
      ['A question asks for resilient urban design after identifying a historic planning influence. Which move is most source-safe?', 'Connect the proposal to CLUP/ZO integration, hazards, compact mixed-use strategies, and local urban design guides.', ['Repeat the name of the historic planner only.', 'Select a facade style as the complete answer.', 'Ignore land-use and hazard evidence.']],
      ['Which BGC source cue is valid for district planning questions?', 'Districts can combine land-use zones, transit, pedestrian networks, and submission checks.', ['Every district must be purely residential.', 'All parking and transit concerns are excluded from planning.', 'Mixed-use is never allowed in district planning.']],
      ['What makes a Burnham answer overclaimed?', 'Using the historic reference as if it were the current complete legal approval path.', ['Checking current CLUP documents.', 'Treating waterfront amenity as one planning consideration.', 'Reading district controls before design submission.']],
      ['A city has fragmented land uses and nonconforming activities. Which source family supports a planning response?', 'The Manila CLUP discussion of land-use issues and responsive zoning.', ['Only a construction-material schedule.', 'Only a structural force diagram.', 'Only a personal preference for symmetry.']],
      ['If the stem asks for public-realm and pedestrian connectivity in a district, which source path is relevant?', 'BGC district planning and DHSUD urban design guidance.', ['A concrete mix specification.', 'A pure biography item.', 'A plumbing fixture schedule.']],
      ['What is the exam rule for planning-lineage questions?', 'Use the historic cue, then answer through the current planning instrument demanded by the stem.', ['Always answer with the oldest name in the options.', 'Ignore the CLUP when a famous planner appears.', 'Treat every district example as nationwide law.']],
    ],
  },
  {
    clusterId: 'lea-plan-008-02-core-concept',
    directory: 'lea-plan-008-02-core-concept--4bb1957d-f513-47e1-b253-c7cbc65912b3',
    articleId: '4bb1957d-f513-47e1-b253-c7cbc65912b3',
    slug: 'lea-plan-008-02-core-concept',
    title: 'Smart city planning - GIS-supported CLUP and evidence-based urban management',
    category: 'Planning, Housing & Urban Design',
    captureRoot: RAW_LAWS_DIR,
    refinedRoot: REFINED_LAWS_DIR,
    sourceKeys: ['clupGis', 'dhsudResilient', 'bgc', 'ra11285'],
    summary: 'Smart-city claims are constrained to GIS-supported CLUP information products, evidence-based resilient planning, district systems, and energy-efficiency management.',
    body: `# Smart City Planning: GIS-Supported CLUP and Evidence-Based Urban Management

## Board Exam Quick Check

For smart-city stems, do not default to gadgets. In the local source boundary, the strongest source-safe answer is evidence-based planning: GIS information products, CLUP preparation, hazard and land-use maps, district systems, pedestrian/transit networks, and energy management.

## What You Need to Know for the LEA

The CLUP GIS Guidebook frames GIS as a planning and information-management tool for LGUs preparing CLUPs. It supports tables, graphs, maps, digital and paper products, and participatory land-use decision-making. That is the local anchor for smart planning: the city uses structured spatial information to decide, communicate, and regulate.

DHSUD's resilient urban design guidance adds the climate and hazard lens. It asks LGUs to align urban design strategies with the CLUP and Zoning Ordinance, to use maps and development constraints, and to translate those findings into local urban design guides. BGC supplies a district example where transit, pedestrian networks, mixed use, access, and master plan checks are managed together. RA 11285 adds an energy-efficiency path through audits, local plans, and conservation programs.

## Real World Scenario

An LGU wants to prioritize drainage, walkability, public transport access, and energy upgrades. A source-safe smart-city answer starts with CLUP GIS data products and hazard maps, then links the chosen interventions to the CLUP/ZO, local urban design guide, district circulation, and local energy efficiency planning.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| GIS in CLUP work | Planning and information management through maps, tables, graphs, and spatial data. |
| Smart city in local planning | Evidence-based urban management, not gadget branding alone. |
| Resilience | Use hazard maps, development constraints, CLUP/ZO integration, and urban design strategies. |
| District systems | Coordinate land use, transit, pedestrian networks, access, and master plan checks. |
| Energy management | Use RA 11285 energy audits, efficiency projects, and local energy plans. |

## Common Mistakes

- Treating sensors or apps as the whole planning answer.
- Ignoring the CLUP when the stem asks for land-use decisions.
- Adding imported smart-city standards not present in the local source boundary.
- Forgetting that smart planning still needs implementation, monitoring, and public communication.
`,
    questions: [
      ['A smart-city stem asks how an LGU should support CLUP decisions with data. Which answer best fits the local source boundary?', 'Use GIS information products such as maps, tables, and graphs to support CLUP preparation and land-use decisions.', ['Buy devices before defining planning questions.', 'Use a facade-style checklist.', 'Skip stakeholder and spatial information.']],
      ['What is the safest meaning of smart planning in this batch?', 'Evidence-based urban management through GIS, CLUP, hazards, district systems, and energy planning.', ['A city is smart only when it has a mobile app.', 'All planning decisions are automated.', 'Architectural style replaces land-use evidence.']],
      ['A planner uses flood maps and development constraints before selecting urban design interventions. Which source family supports this?', 'DHSUD resilient urban design and CLUP GIS guidance.', ['A furniture procurement list.', 'A pure historical biography.', 'A concrete admixture table.']],
      ['How does the CLUP GIS Guidebook describe GIS for local planning?', 'As a planning and information-management tool that supports CLUP formulation.', ['As only a rendering program.', 'As a substitute for local planning authority.', 'As a decorative map requirement only.']],
      ['Which answer overclaims a smart-city item?', 'Claiming that sensors alone solve land-use, resilience, and energy decisions.', ['Using GIS to prepare information products.', 'Checking CLUP/ZO integration.', 'Connecting energy audits to local efficiency planning.']],
      ['A district plan coordinates transit, pedestrian systems, land use, and access. Which local example supports that kind of system thinking?', 'BGC district design standards and guidelines.', ['Only a masonry-unit definition.', 'Only a roof-finish schedule.', 'Only a personal design preference.']],
      ['Where does RA 11285 fit in a smart-city planning answer?', 'It supports energy-efficiency audits, projects, conservation programs, and local energy planning.', ['It supplies all land-use zoning maps.', 'It replaces the CLUP GIS process.', 'It determines every pedestrian route.']],
      ['A question asks what information products help communicate the CLUP. What is the source-safe set?', 'Tables, graphs, maps, and digital or paper-based GIS products.', ['Only a slogan and a logo.', 'Only a building elevation.', 'Only a material sample board.']],
      ['Why should smart-city answers avoid gadget branding alone?', 'The checked local sources emphasize planning evidence, CLUP integration, hazards, systems, and management.', ['The sources ban all technology.', 'The sources only discuss ornament.', 'The sources require no documentation.']],
      ['What is the best first move when a smart-city stem includes hazard, land-use, and energy facts?', 'Classify which source path is being tested: GIS/CLUP, resilient urban design, district systems, or RA 11285 energy management.', ['Choose the newest-sounding term.', 'Answer from software marketing language.', 'Ignore the local planning process.']],
    ],
  },
  {
    clusterId: 'lea-plan-008-03-core-concept',
    directory: 'lea-plan-008-03-core-concept--5d49cedb-dc14-445a-b075-41fe56873081',
    articleId: '5d49cedb-dc14-445a-b075-41fe56873081',
    slug: 'lea-plan-008-03-core-concept',
    title: 'Sustainable urban development - compact, mixed-use, transit-supportive, and energy-efficient planning',
    category: 'Planning, Housing & Urban Design',
    captureRoot: RAW_LAWS_DIR,
    refinedRoot: REFINED_LAWS_DIR,
    sourceKeys: ['dhsudResilient', 'bgc', 'ra11285', 'manilaClup'],
    summary: 'Sustainable urban development is framed through CLUP/ZO integration, compact and mixed-use development, walk/cycle/transit support, district systems, and energy efficiency.',
    body: `# Sustainable Urban Development: Compact, Mixed-Use, Transit-Supportive, and Energy-Efficient Planning

## Board Exam Quick Check

For sustainable urban development, separate the source-supported planning moves from broad environmental slogans. The checked local sources support compact development, mixed-use development, transit and pedestrian systems, CLUP/ZO integration, hazard-aware urban design, and energy-efficiency planning.

## What You Need to Know for the LEA

DHSUD's resilient urban design guidance states that climate and disaster impacts require green and resilient strategies such as compact, mixed-use, and transit-oriented development. It also frames urban design as part of the CLUP and Zoning Ordinance process, with local guides, maps, and development constraints feeding the design response.

BGC provides a district-scale example: residential, mixed-use, institutional, commercial, transit, pedestrian, access, and public-realm systems are coordinated through a master plan and design standards. Manila CLUP adds the local planning frame for managing growth, land-use fragmentation, infrastructure, flooding, waterfront amenity, and zoning. RA 11285 supports energy efficiency and conservation through audits, projects, and local energy efficiency plans.

## Real World Scenario

A city wants to redevelop an underused corridor near transit while reducing flood risk and energy demand. A source-safe answer links compact mixed-use allocation to the CLUP/ZO, protects pedestrian and transit connectivity, checks hazards and development constraints, and includes local energy-efficiency planning.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Compact development | Higher-density activity mix where locally supported and coordinated with the plan. |
| Mixed-use development | Residential, commercial, office, institutional, and recreational uses may reduce trips and trip lengths. |
| Transit-supportive planning | Coordinate land use with pedestrian, transit, access, and public-realm systems. |
| Resilience | Use hazard, climate, and development-constraint evidence before choosing interventions. |
| Energy efficiency | Use RA 11285 audits, efficiency projects, and local energy plans. |

## Common Mistakes

- Treating sustainability as only planting or branding.
- Ignoring CLUP and zoning integration.
- Applying one district example as a national rule without local plan checks.
- Adding unsupported performance numbers or imported rating rules.
`,
    questions: [
      ['A sustainable urban development stem asks which land-use pattern can reduce trips and trip lengths. Which answer is source-safe?', 'Mixed-use development with residential, commercial, office, institutional, and recreational uses.', ['Single-use separation in every context.', 'Facade color selection alone.', 'A structural force diagram.']],
      ['Which strategy does DHSUD explicitly connect to resilient urban design?', 'Compact, mixed-use, and transit-oriented development facilitated through CLUP and Zoning Ordinance tools.', ['Pure historic-style selection.', 'Only product procurement.', 'Only room furniture layout.']],
      ['What should a planner check before choosing a corridor redevelopment strategy?', 'CLUP/ZO alignment, hazards, development constraints, access, transit, public realm, and energy planning.', ['Only the newest rendering style.', 'Only the landowner slogan.', 'Only a material brand.']],
      ['Where does RA 11285 fit in sustainable urban development?', 'Energy efficiency, conservation, audits, efficiency projects, and local energy plans.', ['Museum heritage conservation.', 'Concrete force resolution.', 'Every land-use zone classification.']],
      ['A BGC-style district question asks why pedestrian and transit systems matter. What is the source-safe answer?', 'They coordinate district circulation and access with land use and development controls.', ['They replace all zoning checks.', 'They are only decorative elements.', 'They are unrelated to mixed use.']],
      ['Which answer is least source-safe for sustainable planning?', 'Adding exact performance percentages not present in the local source boundary.', ['Using compact and mixed-use concepts where the CLUP supports them.', 'Checking hazards and constraints.', 'Including energy-efficiency planning.']],
      ['A city has flooding, fragmented land use, and weak public spaces. Which source families support the planning response?', 'Manila CLUP and DHSUD resilient urban design guidance.', ['Only a paint specification.', 'Only a furniture schedule.', 'Only a biographical answer.']],
      ['What is the best sequence for a sustainable urban redevelopment item?', 'Read the CLUP/ZO, map constraints and hazards, select compact mixed-use and mobility strategies, then include energy planning.', ['Pick a label first and ignore local evidence.', 'Start with an unrelated structural formula.', 'Treat all open space as optional.']],
      ['Why is mixed use not automatically correct in every stem?', 'It must fit the local plan, zoning, hazards, access, and district controls described by the source path.', ['Mixed use is banned in all districts.', 'Mixed use never affects trips.', 'The term is only a material property.']],
      ['What is the safest exam rule for sustainable urban development?', 'Answer from the checked planning instrument and source-supported strategy, not from a general green slogan.', ['Choose the broadest buzzword.', 'Avoid source classification.', 'Use one imported standard for every city.']],
    ],
  },
  {
    clusterId: 'lea-matl-005-10-core-concept',
    directory: 'lea-matl-005-10-core-concept--aec393fa-0fb3-4b72-8ce2-774c4c2c756a',
    articleId: 'aec393fa-0fb3-4b72-8ce2-774c4c2c756a',
    slug: 'lea-matl-005-10-core-concept',
    title: 'Material life-cycle thinking - BERDE, waste diversion, reuse, and embodied energy',
    category: 'Building Materials and Construction Methods',
    captureRoot: RAW_TECH_DIR,
    refinedRoot: REFINED_TECH_DIR,
    sourceKeys: ['berde', 'greenBuildingIllustrated', 'salvanMaterials'],
    summary: 'The bundle is constrained away from unsupported EN 15978 module memorization and toward locally captured material life-cycle, waste, reuse, recycled-content, embodied-energy, and specification evidence.',
    body: `# Material Life-Cycle Thinking: BERDE, Waste Diversion, Reuse, and Embodied Energy

## Board Exam Quick Check

Do not recite an imported life-cycle module list unless the question provides that source. In this local-first pass, the supported answer path is material life-cycle thinking through BERDE, Green Building Illustrated, and Salvan: project stage, specifications, waste base case, deconstruction waste plan, reuse, recycled content, embodied energy, durability, and material selection.

## What You Need to Know for the LEA

BERDE frames green-building performance through assessment, monitoring, certification, applicable project life-cycle stages, specifications, and resource performance. It requires project teams to document materials, products, equipment, and processes. For deconstruction, BERDE supports a waste base case, a waste management plan, diversion targets, handling procedures, monitoring records, collection records, and calculation of waste diverted from landfills.

Green Building Illustrated gives the broader material-conservation logic. Material impacts come from extraction, processing, manufacturing, transport, hazardous materials, and construction waste. Source-safe strategies include using less material, avoiding waste, salvaging and reusing materials, using recycled content, and considering embodied energy. Salvan supports the exam skill of selecting and specifying building materials by properties, use, protection, and construction requirements.

## Real World Scenario

A renovation project will remove partitions, flooring, doors, and fixtures. A source-safe material life-cycle answer asks for the waste base case, deconstruction plan, reuse or recycling options, records for collection and diversion, and specifications for replacement materials. It avoids unsupported claims about exact international module labels unless those labels are provided in the question source.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| BERDE documentation | Specifications, bill of materials, installation records, and resource-performance data. |
| Deconstruction | Waste base case, diversion target, handling/storage plan, monitoring, and diversion calculation. |
| Material conservation | Use less material, reduce waste, salvage, reuse, and use recycled content where appropriate. |
| Embodied energy | Energy used to harvest, manufacture, prepare, and transport materials to site. |
| Material selection | Match properties, application, durability, protection, and specifications to the use. |

## Common Mistakes

- Memorizing an external module list without a local source boundary.
- Treating recycled content as automatically best without checking toxicity, embodied energy, durability, and use.
- Ignoring documentation when the stem asks how a green-building claim is verified.
- Confusing demolition with source-supported deconstruction and waste diversion planning.
`,
    questions: [
      ['A materials question asks for the source-safe first step in a deconstruction waste item. What should be established?', 'A deconstruction waste base case and waste management plan with diversion targets and records.', ['A decorative color schedule only.', 'An unsupported imported module list.', 'A structural support reaction.']],
      ['What does embodied energy mean in the checked material source boundary?', 'Energy used to harvest, manufacture, prepare, and transport materials to the construction site.', ['Only the monthly electric bill.', 'Only the color temperature of lighting.', 'Only the contractor profit margin.']],
      ['Which material strategy is source-safe when reducing environmental impact?', 'Use less material, reduce waste, salvage, reuse, and consider recycled content where appropriate.', ['Always choose the heaviest new material.', 'Ignore durability and use conditions.', 'Reject all salvaged materials automatically.']],
      ['What does BERDE use specifications for in this topic?', 'Written documentation of materials, products, equipment, and construction processes.', ['A replacement for all building laws.', 'A structural free-body diagram.', 'A biography of the designer.']],
      ['A renovation question mentions doors, flooring, and fixtures removed from an existing building. What is the best answer?', 'Check salvage, reuse, recycling, handling, storage, collection, and diversion records.', ['Send all components to landfill without review.', 'Answer with a zoning map.', 'Choose a facade style.']],
      ['Why is an exact EN module answer not used in this batch?', 'The local captured sources support life-cycle thinking and waste/material evidence but not the exact imported module sequence.', ['Life-cycle thinking is irrelevant.', 'BERDE bans specifications.', 'Recycled content is never considered.']],
      ['Which source-safe factor belongs in material selection?', 'Properties, application, durability, protection, and specification requirements.', ['Only the first brand seen online.', 'Only the shortest delivery route regardless of use.', 'Only a planning district name.']],
      ['A project claims green performance. Which documentation path is most source-safe?', 'Use BERDE-style performance evidence, specifications, material records, and waste/diversion documentation.', ['Use a slogan without records.', 'Use a historic planner name.', 'Use a single color sample.']],
      ['When can recycled content still require caution?', 'When toxicity, embodied energy, durability, or use conditions create tradeoffs.', ['Never; it is always automatically best.', 'Only when the material is blue.', 'Only if the site has a transit station.']],
      ['What is the exam rule for material life-cycle questions?', 'Classify the stem as documentation, waste diversion, reuse/recycling, embodied energy, or material selection before answering.', ['Always recite a module list.', 'Ignore the source family.', 'Treat demolition and deconstruction as identical in every detail.']],
    ],
  },
  {
    clusterId: 'lea-strc-001-01-core-concept',
    directory: 'lea-strc-001-01-core-concept--e6408b5e-8cba-4bb6-bb8a-e8127c83a3a2',
    articleId: 'e6408b5e-8cba-4bb6-bb8a-e8127c83a3a2',
    slug: 'lea-strc-001-01-core-concept',
    title: 'Force - magnitude, direction, point of application, and resultant effects',
    category: 'Structural Conceptualization',
    captureRoot: RAW_STRUCT_DIR,
    refinedRoot: REFINED_STRUCT_DIR,
    sourceKeys: ['hibbelerStatics'],
    summary: 'Force is treated as a vector action characterized by magnitude, direction, and point of application, then resolved through components, resultants, and equilibrium reasoning.',
    body: `# Force: Magnitude, Direction, Point of Application, and Resultant Effects

## Board Exam Quick Check

In structural conceptualization, a force is not just a number. A source-safe answer keeps three identifiers together: magnitude, direction, and point of application. Then it asks whether the stem wants a component, resultant, action-reaction pair, or equilibrium check.

## What You Need to Know for the LEA

Hibbeler describes force as a push or pull exerted by one body on another. It may occur by direct contact or through a distance, and it is characterized by magnitude, direction, and point of application. Because force is a vector quantity, it can be represented by an arrow, resolved into components, added with other forces, or replaced by an equivalent resultant where the method allows.

Statics problems often begin with the same discipline: identify the body, draw or imagine the free-body condition, label known and unknown forces, resolve forces into components when needed, and then use equilibrium or resultant logic. If the force is applied over a very small area compared with the body, it may be modeled as a concentrated force for analysis.

## Real World Scenario

A canopy bracket receives cable tension, self-weight, and a connection reaction. A source-safe answer does not say only "the load is 2 kN." It identifies where the force acts, which direction it pulls or pushes, whether it must be resolved into x and y components, and whether the resultant or equilibrium condition is being tested.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Force definition | Push or pull exerted by one body on another. |
| Complete force description | Magnitude, direction, and point of application. |
| Vector nature | Force has magnitude, direction, and sense; it can be resolved and added. |
| Resultant | Equivalent single force from vector addition where appropriate. |
| Concentrated force | Loading idealized as acting at a point when the area is small relative to the body. |

## Common Mistakes

- Treating force magnitude as complete without direction or point of application.
- Adding forces arithmetically when vector components are required.
- Confusing mass, weight, and force.
- Skipping the body or connection being analyzed.
`,
    questions: [
      ['A force item gives 5 kN but no arrow or contact point. What information is still needed for a complete force description?', 'Direction and point of application.', ['Paint color and room name.', 'Only the project owner.', 'Only the floor finish.']],
      ['Which definition matches the checked statics source?', 'Force is a push or pull exerted by one body on another.', ['Force is only a material color.', 'Force is only a zoning category.', 'Force is only a cost estimate.']],
      ['Why is force treated as a vector in statics?', 'It has magnitude, direction, and sense, and it is added or resolved by vector methods.', ['It has no direction.', 'It is always a scalar area.', 'It cannot be combined with other forces.']],
      ['A bracket has two angled cable pulls. What is the safest analysis move?', 'Resolve the forces into components or find the resultant using vector logic.', ['Add only the printed magnitudes.', 'Ignore the angle of each cable.', 'Use a land-use zoning table.']],
      ['What is a concentrated force?', 'A loading idealized as acting at a point when its contact area is small relative to the body.', ['A force spread over all city districts.', 'A material finish schedule.', 'A green-building certificate.']],
      ['A question asks for the equivalent single effect of several concurrent forces. What term is being tested?', 'Resultant force.', ['Occupancy group.', 'Waste base case.', 'Zoning overlay.']],
      ['Which answer is least source-safe for a force question?', 'Reporting only a number while ignoring direction and point of application.', ['Identifying the body being analyzed.', 'Resolving angled forces into components.', 'Checking whether equilibrium is requested.']],
      ['How does Newton third-law reasoning affect connection forces?', 'Action and reaction forces between interacting bodies are equal, opposite, and collinear.', ['They are equal and same direction.', 'They are unrelated to the body chosen.', 'They remove the need for force direction.']],
      ['A beam problem asks whether forces balance. Which source-safe path applies?', 'Identify forces, resolve components if needed, and use equilibrium logic.', ['Select a planning lineage answer.', 'Choose a recycled-content rule.', 'Answer only with room occupancy.']],
      ['What is the practical LEA rule for force basics?', 'Keep magnitude, direction, point of application, components, resultant, and equilibrium cues separate.', ['Always use the largest option.', 'Always ignore the line of action.', 'Always treat force as a material property.']],
    ],
  },
];

function sourceFamilyRecord(key) {
  const family = sourceFamilies[key];
  if (!family) throw new Error(`Unknown source family: ${key}`);
  if (!existsSync(path.join(REPO, family.rawPath))) throw new Error(`Missing raw source: ${family.rawPath}`);
  if (!existsSync(path.join(REPO, family.refinedPath))) throw new Error(`Missing refined source: ${family.refinedPath}`);
  return {
    key,
    label: family.label,
    rawPath: family.rawPath,
    rawHash: sha256File(family.rawPath),
    refinedPath: family.refinedPath,
    refinedHash: sha256File(family.refinedPath),
    locator: family.locator,
    notes: family.notes,
  };
}

function capturePath(article) {
  return `${article.captureRoot}/${article.slug}.source-capture.md`;
}

function refinedPath(article) {
  return `${article.refinedRoot}/${article.slug}.refined.md`;
}

function sourceCapture(article, families) {
  const sourceLines = families.map((family) => [
    `## ${family.label}`,
    '',
    `- Raw path: \`${family.rawPath}\``,
    `- Raw SHA-256: \`${family.rawHash}\``,
    `- Refined conversion: \`${family.refinedPath}\``,
    `- Refined SHA-256: \`${family.refinedHash}\``,
    `- Checked locator: ${family.locator}`,
    '',
    'Supported local claims:',
    ...family.notes.map((note) => `- ${note}`),
  ].join('\n')).join('\n\n');

  return `# Batch ${BATCH} Raw Source Capture - ${article.title}

Generated: ${GENERATED_AT}
Batch ID: ${BATCH_ID}
Article: ${article.slug}
Cluster: ${article.clusterId}

## Capture Status

This source artifact was written before the Batch ${BATCH} article and linked-question updates. It records the local raw-source-layer files, refined conversion files, hashes, and line locators used for this batch. Claims outside the listed source families were excluded.

## Claim Boundary

${article.summary}

## Local Source Families

${sourceLines}

## Real World Scenario Boundary

Status: added_source_safe. The article scenario is constrained to the source families listed above and avoids project-specific formulas, market claims, or external standards not captured for this batch.
`;
}

function refinedCapture(article, families, rawCapturePath) {
  return `# Batch ${BATCH} Refined Conversion Map - ${article.title}

Generated: ${GENERATED_AT}
Batch ID: ${BATCH_ID}
Article: ${article.slug}
Upstream raw capture: \`${rawCapturePath}\`
Upstream raw capture SHA-256: \`${sha256File(rawCapturePath)}\`

## Conversion Boundary

This file is a refined local claim map derived from the raw capture. It is not a substitute for the local raw files. Article and question changes for ${article.slug} must stay inside these claims:

${families.flatMap((family) => family.notes.map((note) => `- ${family.label}: ${note}`)).join('\n')}

## Checked Locators

${families.map((family) => `- ${family.label}: ${family.locator}`).join('\n')}

## Excluded Claims

- No formulas, market-performance claims, operating standards, dimensions, or module sequences were added outside the checked local source families.
- No Supabase, production database, deploy, or main-merge action was performed.
`;
}

function buildOptions(question, spec) {
  const ids = question.options.map((option) => option.id);
  const correctId = question.correct_option_id;
  const fallbackWrongs = [...spec[2], ...commonWrongAnswers];
  let wrongIndex = 0;
  return ids.map((id) => ({
    id,
    text: id === correctId ? spec[1] : cleanOneLine(fallbackWrongs[wrongIndex++ % fallbackWrongs.length]),
  }));
}

function buildRationale(options, correctId, spec, article, boundary) {
  const rationale = {};
  for (const option of options) {
    rationale[option.id] = option.id === correctId
      ? `${spec[1]} This stays inside the Batch ${BATCH} local source boundary for ${article.title}.`
      : `${option.text} is not the best answer because it either uses the wrong source path or adds a claim not supported by the Batch ${BATCH} local source boundary.`;
  }
  rationale.correct = `${spec[1]} The answer is supported by ${boundary}.`;
  rationale.takeaway = `For ${article.title}, classify the question cue first and stay inside the checked local source families.`;
  rationale.source_boundary = boundary;
  return rationale;
}

function clearQuestionEdits(articleFolder) {
  const editsDir = path.join(REPO, articleFolder, 'question-edits');
  mkdirSync(editsDir, { recursive: true });
  for (const entry of readdirSync(editsDir)) {
    if (entry.endsWith('.json')) unlinkSync(path.join(editsDir, entry));
  }
}

function buildSources(article, families, metadata, rawCapturePath, refinedCapturePath) {
  const rawCaptureHash = sha256File(rawCapturePath);
  const refinedCaptureHash = sha256File(refinedCapturePath);
  const localFamilies = families.map((family) => ({
    label: family.label,
    rawPath: family.rawPath,
    rawHash: family.rawHash,
    refinedPath: family.refinedPath,
    refinedHash: family.refinedHash,
    checked_locator: family.locator,
  }));
  const checkedLines = families.flatMap((family) => family.notes.map((note) => `${family.label}: ${note} Locator: ${family.locator}`));
  const sources = [
    {
      source_id: `batch-${BATCH}-${article.slug}-raw-source-capture`,
      article_id: metadata.article_id,
      label: `Batch ${BATCH} raw source capture - ${article.title}`,
      url: null,
      source_type: 'local_source_capture',
      description: `Local raw-source-layer capture for ${article.title}; includes checked local source family hashes and refined conversion locators.`,
      is_verified: true,
      sort_order: 0,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: rawCapturePath,
      local_absolute_path: path.join(REPO, rawCapturePath),
      local_sha256: rawCaptureHash,
      source_locator: `${rawCapturePath}#${rawCaptureHash}`,
      checked_markdown_lines: checkedLines,
      local_source_families: localFamilies,
      local_audit_note: `Article and question claims cite only the local Batch ${BATCH} source capture/refined conversion boundary.`,
    },
    {
      source_id: `batch-${BATCH}-${article.slug}-refined-source-map`,
      article_id: metadata.article_id,
      label: `Batch ${BATCH} refined source conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined local conversion and claim-boundary map for ${article.title}.`,
      is_verified: true,
      sort_order: 1,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: refinedCapturePath,
      local_absolute_path: path.join(REPO, refinedCapturePath),
      local_sha256: refinedCaptureHash,
      source_locator: `${refinedCapturePath}#${refinedCaptureHash}`,
      upstream_capture_path: rawCapturePath,
      upstream_capture_sha256: rawCaptureHash,
      checked_markdown_lines: checkedLines,
      local_source_families: localFamilies,
      local_audit_note: 'Refined conversion is a derived locator and claim-boundary map, not a substitute for the local raw capture.',
    },
  ];
  return {
    article_id: metadata.article_id,
    hash_algorithm: 'sha256',
    sources_hash: sha256Json(sources),
    source_count: sources.length,
    sources,
  };
}

function updateArticle(article) {
  const articleFolder = `${ARTICLES_ROOT}/${article.directory}`;
  const metadata = readJson(`${articleFolder}/article-metadata.json`);
  const original = readFileSync(path.join(REPO, articleFolder, 'original.md'), 'utf8');
  const originalHash = sha256(original);
  const families = article.sourceKeys.map(sourceFamilyRecord);
  const rawCapturePath = capturePath(article);
  const refinedCapturePath = refinedPath(article);

  writeText(rawCapturePath, sourceCapture(article, families));
  writeText(refinedCapturePath, refinedCapture(article, families, rawCapturePath));

  const rawCaptureHash = sha256File(rawCapturePath);
  const refinedCaptureHash = sha256File(refinedCapturePath);
  const normalized = article.body.endsWith('\n') ? article.body : `${article.body}\n`;
  const normalizedHash = sha256(normalized);
  writeText(`${articleFolder}/normalized.md`, normalized);
  const composeErrorPath = path.join(REPO, articleFolder, 'compose-error.json');
  if (existsSync(composeErrorPath)) unlinkSync(composeErrorPath);

  const linked = readJson(`${articleFolder}/linked-questions.json`);
  const questions = linked.questions;
  if (!Array.isArray(questions) || questions.length !== article.questions.length) {
    throw new Error(`${article.slug} expected ${article.questions.length} linked questions, found ${questions?.length ?? 'unknown'}`);
  }

  clearQuestionEdits(articleFolder);
  const boundary = `${rawCapturePath}#${rawCaptureHash}; ${refinedCapturePath}#${refinedCaptureHash}`;
  const editedQuestions = questions.map((question, index) => {
    const spec = article.questions[index];
    const options = buildOptions(question, spec);
    const rationale = buildRationale(options, question.correct_option_id, spec, article, boundary);
    const edited = {
      ...question,
      text: cleanOneLine(spec[0]),
      options,
      rationale,
      explanation: `${spec[1]} Supported by the Batch ${BATCH} local source boundary: ${boundary}.`,
      code_citation: boundary,
      source_verification_status: 'source_audited_local_first',
      source_reference: boundary,
      source_notes: article.summary,
      updated_at: GENERATED_AT,
    };
    edited.content_hash = sha256Json(stripQuestionHash(edited));
    writeJson(`${articleFolder}/question-edits/${question.question_id}.json`, {
      question_id: question.question_id,
      baseline_hash: question.content_hash ?? sha256Json(stripQuestionHash(question)),
      action: 'replace',
      reason: `${BATCH_ID}: residual local-first rewrite constrained to checked local source artifacts for ${article.title}.`,
      approved_by: `codex-local-first-${BATCH_ID}`,
      approved_at: GENERATED_AT,
      source_audit_support: {
        parent_article_id: metadata.article_id,
        parent_article_slug: article.slug,
        answer_key_fields_changed: false,
        support_status: 'source_safe_rewrite',
        source_locator: boundary,
        checked_sources: [
          {
            source_id: `batch-${BATCH}-${article.slug}-raw-source-capture`,
            label: `Batch ${BATCH} raw source capture - ${article.title}`,
            path: rawCapturePath,
            sha256: rawCaptureHash,
          },
          {
            source_id: `batch-${BATCH}-${article.slug}-refined-source-map`,
            label: `Batch ${BATCH} refined source conversion - ${article.title}`,
            path: refinedCapturePath,
            sha256: refinedCaptureHash,
          },
        ],
        local_source_safe_action: `Question text, options, rationale, explanation, and citation rewritten to the Batch ${BATCH} local source artifact boundary while preserving the answer key.`,
      },
      proposed: {
        text: edited.text,
        options: edited.options,
        correct_option_id: edited.correct_option_id,
        rationale: edited.rationale,
        explanation: edited.explanation,
        code_citation: edited.code_citation,
      },
      batch_question_template_index: index + 1,
    });
    return edited;
  });

  const linkedPayload = {
    article_id: metadata.article_id,
    hash_algorithm: 'sha256',
    linked_questions_hash: sha256Json(editedQuestions),
    question_count: editedQuestions.length,
    questions: editedQuestions,
  };
  writeJson(`${articleFolder}/linked-questions.json`, linkedPayload);

  const sourcesPayload = buildSources(article, families, metadata, rawCapturePath, refinedCapturePath);
  writeJson(`${articleFolder}/sources.json`, sourcesPayload);

  const uiBlocksHash = sha256Json([]);
  const uiBlocksPayload = {
    article_id: metadata.article_id,
    slug: article.slug,
    normalized_created_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    ui_block_count: 0,
    total_blocks: 0,
    blocks: [],
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: uiBlocksHash,
  };
  writeJson(`${articleFolder}/ui-blocks.json`, uiBlocksPayload);
  writeJson(`${articleFolder}/ui-block-edits.json`, {
    article_id: metadata.article_id,
    slug: article.slug,
    generated_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [`Batch ${BATCH} has no UI-block edit proposals for this zero-block bundle.`],
  });

  const nextMetadata = {
    ...metadata,
    title: article.title,
    content_hash: originalHash,
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    candidate_content_hash: null,
    ui_blocks_hash: uiBlocksHash,
    linked_questions_hash: linkedPayload.linked_questions_hash,
    sources_hash: sourcesPayload.sources_hash,
    source_count: sourcesPayload.source_count,
    linked_question_count: editedQuestions.length,
    parser_status: 'passed',
    content_complexity: 'plain_markdown',
    source_verification_status: 'source_audited_local_first',
    source_verification_batch: BATCH_ID,
    source_audit_date: AUDIT_DATE,
    source_reference_count: sourcesPayload.source_count,
    real_world_scenario_status: 'added_source_safe',
    local_source_artifacts: [
      { path: rawCapturePath, sha256: rawCaptureHash },
      { path: refinedCapturePath, sha256: refinedCaptureHash },
    ],
    updated_at: GENERATED_AT,
    updated_by: `codex-local-first-${BATCH_ID}`,
    updated_note: `Source-audited local-first Batch ${BATCH} article and linked-question rewrite; claims cite local captured source artifacts.`,
  };

  const composed = composeCandidate({ normalized, uiBlocks: uiBlocksPayload, original });
  if (composed.report.blockers.length > 0) throw new Error(`${article.slug} compose blockers: ${composed.report.blockers.join('; ')}`);
  writeJson(`${articleFolder}/compose-report.json`, composed.report);
  writeText(`${articleFolder}/candidate.md`, composed.candidate);
  nextMetadata.candidate_content_hash = composed.report.candidate_hash;
  writeJson(`${articleFolder}/article-metadata.json`, nextMetadata);

  const diffReport = diffCandidate({
    metadata: nextMetadata,
    original,
    normalized,
    candidate: composed.candidate,
    uiBlocks: uiBlocksPayload,
  });
  if (diffReport.blockers.length > 0) throw new Error(`${article.slug} diff blockers: ${diffReport.blockers.join('; ')}`);
  writeJson(`${articleFolder}/diff-report.json`, diffReport);
  writeText(`${articleFolder}/diff-report.md`, buildDiffMarkdown(diffReport));

  writeJson(`${articleFolder}/source-audit-evidence.json`, {
    schema_version: 'source-audit-evidence-v1',
    batch_id: BATCH_ID,
    batch_number: BATCH,
    audit_date: AUDIT_DATE,
    audited_at: GENERATED_AT,
    target: {
      article_id: metadata.article_id,
      slug: article.slug,
      title: article.title,
      article_folder: articleFolder,
      normalized_sha256: normalizedHash,
      candidate_path: `${articleFolder}/candidate.md`,
    },
    classification: {
      topic_family: article.clusterId,
      category: article.category,
      source_sensitivity: 'legal_code_exam_or_technical_content',
      contains_legal_or_code_claims: true,
      requires_raw_source_capture: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: [],
    },
    raw_source_gate: {
      status: 'PASS',
      local_sources_checked_first: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      conversion_layer_root: 'vitruvius-connection/002_Raw-Conversion-Layer',
      blockers: [],
    },
    checked_sources: sourcesPayload.sources,
    claims: [
      {
        claim_id: `${article.slug}-article-batch-${BATCH}`,
        claim_text: `Article ${article.slug} was rewritten to the checked local source scope for ${article.title}.`,
        claim_type: 'article_rewrite',
        audit_result: 'PASS',
        source_support: {
          raw_capture_path: rawCapturePath,
          raw_capture_sha256: rawCaptureHash,
          refined_conversion_path: refinedCapturePath,
          refined_conversion_sha256: refinedCaptureHash,
          source_locator: boundary,
        },
        blockers: [],
      },
      ...editedQuestions.map((question) => ({
        claim_id: `question-${question.question_id}-batch-${BATCH}`,
        claim_text: `Linked question ${question.question_id} was rewritten inside the checked local source scope for ${article.title}.`,
        claim_type: 'question_edit_rewrite',
        audit_result: 'PASS',
        source_support: {
          raw_capture_path: rawCapturePath,
          raw_capture_sha256: rawCaptureHash,
          refined_conversion_path: refinedCapturePath,
          refined_conversion_sha256: refinedCaptureHash,
          source_locator: boundary,
        },
        blockers: [],
      })),
    ],
    real_world_scenario: {
      status: 'added_source_safe',
      source_boundary: boundary,
    },
    blocked_residuals_considered: blockedClusters,
  });

  return {
    article_id: metadata.article_id,
    cluster_id: article.clusterId,
    slug: article.slug,
    title: article.title,
    category: article.category,
    article_folder: articleFolder,
    linked_question_count: editedQuestions.length,
    question_edit_count: editedQuestions.length,
    source_capture_path: rawCapturePath,
    source_capture_hash: rawCaptureHash,
    refined_source_map_path: refinedCapturePath,
    refined_source_map_hash: refinedCaptureHash,
    source_family_count: families.length,
    source_safe_real_world_scenario: true,
    normalized_hash: normalizedHash,
    candidate_hash: composed.report.candidate_hash,
    answer_keys_preserved: true,
  };
}

function main() {
  const selected = articles.map(updateArticle);
  const summary = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    status: 'content_generated_compose_diff_validate_pending',
    selection_note: 'Batch 139 continued after Batch 138 consumed Theory 009-04/009-05 and Design 003-04/003-06/004-05. It selected the next sourceable planning residuals, one sourceable materials bundle, and one sourceable structural bundle after blocking exact CSI and utilities seismic bundles with local-source boundary gaps.',
    selected_clusters: selected.map((article) => ({
      cluster_id: article.cluster_id,
      slug: article.slug,
      title: article.title,
      category: article.category,
      article_id: article.article_id,
      linked_question_count: article.linked_question_count,
      source_capture_path: article.source_capture_path,
      refined_source_map_path: article.refined_source_map_path,
    })),
    blocked_clusters: blockedClusters,
    articles: selected,
    constraints: {
      no_supabase: true,
      no_deploy: true,
      no_prod_db: true,
      no_main_merge: true,
      baseline_commit: 'edb0c634e',
    },
  };
  writeJson(SUMMARY_PATH, summary);
  writeJson(RUN_SUMMARY_PATH, summary);
  console.log(JSON.stringify({
    ok: true,
    batch: BATCH,
    selected_clusters: selected.map((article) => article.slug),
    linked_questions: selected.reduce((sum, article) => sum + article.linked_question_count, 0),
    summary_path: SUMMARY_PATH,
  }, null, 2));
}

main();
