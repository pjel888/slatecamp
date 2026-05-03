#!/usr/bin/env bun
/**
 * Batch-add 2-4 UI components to content-audit-export articles.
 * For each article, reads normalized.md and ui-blocks.json,
 * adds article-specific components, inserts placeholders,
 * updates the hash, and runs content-audit:compose verification.
 */

import { createHash } from 'node:crypto'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const ARTICLES_ROOT = '/Users/philiplewis/slatecamp/.ai/content-audit-export/articles'
const SLATECAMP_ROOT = '/Users/philiplewis/slatecamp'

function sha256(text) {
  return 'sha256:' + createHash('sha256').update(text, 'utf-8').digest('hex')
}

function nextBlockId(blocks) {
  const nums = blocks.map(b => {
    const m = b.block_id.match(/ui_(\d+)/)
    return m ? parseInt(m[1], 10) : 0
  })
  return `ui_${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`
}

function makePlaceholder(blockId, name, propsText, childrenText) {
  let p = `[SLATECAMP_UI_BLOCK:${blockId} component="${name}" status="preserved"]\nExtracted summary:\n`
  p += `- Props: ${propsText || '(none)'}\n`
  p += `- Text: ${childrenText}\n`
  p += `[/SLATECAMP_UI_BLOCK]`
  return p
}

function makeBlock(blockId, spec) {
  const propsEntries = Object.entries(spec.props || {})
  const propsText = propsEntries.length > 0 ? propsEntries.map(([k, v]) => `${k}="${v}"`).join(' ') : null
  const childrenText = spec.children_raw.replace(/\*{1,2}/g, '').replace(/\n+/g, ' ').trim()
  const placeholder = makePlaceholder(blockId, spec.component_name, propsText, spec.children_raw.replace(/\n+/g, ' ').trim().substring(0, 200))

  return {
    block_id: blockId,
    block_type: 'mdx_component',
    component_name: spec.component_name,
    raw: spec.raw,
    raw_hash: sha256(spec.raw),
    placeholder,
    placeholder_hash: sha256(placeholder),
    props: spec.props || {},
    props_json: spec.props || {},
    props_text: propsText,
    children_raw: spec.children_raw,
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

// Article-specific component specs keyed by article_id
const ARTICLE_SPECS = {
  // === 0-block articles ===

  '4a8c01ab-5515-44f5-aaf7-c1274d8c8dce': [ // African Vernacular
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Aid: "E-M-Z = Easy Materials Zone."** Earth (Sahel adobe thermal mass), Mali (Sudano-Sahelian torons for ventilation + crépissage maintenance), Zimbabwe (dry-stone curvilinear walls for seismic resilience). All three translate to Philippine conditions: passive cooling, community-based maintenance, earthquake resistance.`,
      raw: `<Tip>\n\n**Memory Aid: "E-M-Z = Easy Materials Zone."** Earth (Sahel adobe thermal mass), Mali (Sudano-Sahelian torons for ventilation + crépissage maintenance), Zimbabwe (dry-stone curvilinear walls for seismic resilience). All three translate to Philippine conditions: passive cooling, community-based maintenance, earthquake resistance.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Philippine Application:** CSEB (Cement-Stabilized Compressed Earth Blocks) are gaining traction in Palawan and Siargao eco-resorts. Like Sahelian adobe, CSEB provides thermal mass and humidity buffering. Unlike traditional adobe, CSEB meets NSCP compressive strength standards when properly engineered — bridging vernacular wisdom with modern code compliance.`,
      raw: `<Example>\n\n**Philippine Application:** CSEB (Cement-Stabilized Compressed Earth Blocks) are gaining traction in Palawan and Siargao eco-resorts. Like Sahelian adobe, CSEB provides thermal mass and humidity buffering. Unlike traditional adobe, CSEB meets NSCP compressive strength standards when properly engineered — bridging vernacular wisdom with modern code compliance.\n\n</Example>`,
      insertion_marker: '**Philippine Link:** Earth = thermal mass against tropical heat;',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** The exam may test Great Zimbabwe's contribution to Philippine seismic design. The correct answer is curvilinear dry-stone geometry (flexes under lateral loads like modern base isolation). Distractor: "conical tower structural system." Torons from Mali mosques serve dual scaffolding + ventilation functions — both must be cited for full credit.`,
      raw: `<ExamTip>\n\n**ALE Trap:** The exam may test Great Zimbabwe's contribution to Philippine seismic design. The correct answer is curvilinear dry-stone geometry (flexes under lateral loads like modern base isolation). Distractor: "conical tower structural system." Torons from Mali mosques serve dual scaffolding + ventilation functions — both must be cited for full credit.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps and Common Mistakes',
    },
  ],

  '7d26e59b-efc4-4ced-890b-6ec1dfee8254': [ // American Colonial
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "B-P-A = Burnham, Parsons, Arellano."** Burnham wrote the plan (1905 Manila + Baguio), Parsons built the plan (Gabaldon schools, Manila Hotel), Arellano evolved beyond the plan (Art Deco — Metropolitan Theater, Manila Post Office). This chain: Planner → Implementer → Evolver is a classic exam thread.`,
      raw: `<Tip>\n\n**Memory Anchor: "B-P-A = Burnham, Parsons, Arellano."** Burnham wrote the plan (1905 Manila + Baguio), Parsons built the plan (Gabaldon schools, Manila Hotel), Arellano evolved beyond the plan (Art Deco — Metropolitan Theater, Manila Post Office). This chain: Planner → Implementer → Evolver is a classic exam thread.\n\n</Tip>`,
      insertion_marker: '## Core Concepts',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**Key Distinction:** The Philippine Capitol Building was PLANNED by Burnham (1905) but NEVER BUILT. The Legislative Building (now National Museum) by Arellano was BUILT and served a similar function. Also: pensionado universities matter — Toledo = Ohio State (Neoclassical), Arellano = Drexel (Art Deco), Mapua = Cornell (first registered architect).`,
      raw: `<ExamTip>\n\n**Key Distinction:** The Philippine Capitol Building was PLANNED by Burnham (1905) but NEVER BUILT. The Legislative Building (now National Museum) by Arellano was BUILT and served a similar function. Also: pensionado universities matter — Toledo = Ohio State (Neoclassical), Arellano = Drexel (Art Deco), Mapua = Cornell (first registered architect).\n\n</ExamTip>`,
      insertion_marker: '### Burnham Plan of Manila and Baguio (1905)',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Gabaldon Schoolhouses** (1907–1915): Standardized template design with elevated floors (flood protection, underfloor airflow), huge capiz-shell windows (natural light + ventilation without glass import costs), and classroom-to-hallway-to-outdoor connections. Named after Assemblyman Isauro Gabaldon, these were the Philippines' first mass-produced public school buildings and a textbook application of City Beautiful ideals to rural education.`,
      raw: `<Example>\n\n**Gabaldon Schoolhouses** (1907–1915): Standardized template design with elevated floors (flood protection, underfloor airflow), huge capiz-shell windows (natural light + ventilation without glass import costs), and classroom-to-hallway-to-outdoor connections. Named after Assemblyman Isauro Gabaldon, these were the Philippines' first mass-produced public school buildings and a textbook application of City Beautiful ideals to rural education.\n\n</Example>`,
      insertion_marker: '### William E. Parsons — Key Works',
    },
  ],

  'c39cc1e8-90fb-4c47-95f2-6bb4b370c6d7': [ // Brutalism — has 1 block, add 3
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "BRUT = Bold Raw Unfinished Truth."** Also remember the chain: Le Corbusier supplied béton brut (Unité d'Habitation, 1952), Smithsons named New Brutalism (Hunstanton School, 1954), Locsin adapted to Philippines (CCP, 1969). The Philippine twist: tropical Brutalism adds deep overhangs + reflecting pools for passive cooling.`,
      raw: `<Tip>\n\n**Memory Anchor: "BRUT = Bold Raw Unfinished Truth."** Also remember the chain: Le Corbusier supplied béton brut (Unité d'Habitation, 1952), Smithsons named New Brutalism (Hunstanton School, 1954), Locsin adapted to Philippines (CCP, 1969). The Philippine twist: tropical Brutalism adds deep overhangs + reflecting pools for passive cooling.\n\n</Tip>`,
      insertion_marker: '## Core Concepts',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Brutalism is named for its harsh, brutal appearance" is a classic FALSE distractor. The term derives from béton brut (raw concrete). Similarly: "Brutalism and Deconstructivism are the same" is FALSE. Brutalism celebrates structural honesty; Deconstructivism deliberately fractures form. If the exam shows a building proudly expressing its materials → Brutalism. If fragments and destabilizes → Deconstructivism.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Brutalism is named for its harsh, brutal appearance" is a classic FALSE distractor. The term derives from béton brut (raw concrete). Similarly: "Brutalism and Deconstructivism are the same" is FALSE. Brutalism celebrates structural honesty; Deconstructivism deliberately fractures form. If the exam shows a building proudly expressing its materials → Brutalism. If fragments and destabilizes → Deconstructivism.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps and Common Mistakes',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**CCP (Leandro Locsin, 1969):** The Cultural Center of the Philippines is a defining example of tropical Brutalism. Key features: cantilevered concrete form "floating" above a reflecting pool (water cools intake air via natural convection), massive concrete surfaces for thermal mass, deep overhangs for monsoon protection. This fusion of Brutalist honesty + Philippine passive design strategies is exactly what the ALE tests.`,
      raw: `<Example>\n\n**CCP (Leandro Locsin, 1969):** The Cultural Center of the Philippines is a defining example of tropical Brutalism. Key features: cantilevered concrete form "floating" above a reflecting pool (water cools intake air via natural convection), massive concrete surfaces for thermal mass, deep overhangs for monsoon protection. This fusion of Brutalist honesty + Philippine passive design strategies is exactly what the ALE tests.\n\n</Example>`,
      insertion_marker: '| Leandro Locsin | Cultural Center of the Philippines (CCP)',
    },
  ],

  'fc6f1ca7-340b-4188-8fc0-036e4e9d4498': [ // Case Study Hospital Mall School
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "H-M-S = Hospital, Mall, School."** Three building types, three distinct code emphasis areas. Hospitals = BP 344 + DOH (wide corridors >= 1800 mm, smoke-proof enclosures, emergency power). Malls = BP 344 + high-occupancy egress (occupant load determines exit width). Schools = PD 1096 + DepEd (classroom size, lab ventilation). On exam, first identify which building type governs the specific requirement.`,
      raw: `<Tip>\n\n**Memory Anchor: "H-M-S = Hospital, Mall, School."** Three building types, three distinct code emphasis areas. Hospitals = BP 344 + DOH (wide corridors >= 1800 mm, smoke-proof enclosures, emergency power). Malls = BP 344 + high-occupancy egress (occupant load determines exit width). Schools = PD 1096 + DepEd (classroom size, lab ventilation). On exam, first identify which building type governs the specific requirement.\n\n</Tip>`,
      insertion_marker: '## Learning Goal',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Mistake:** Applying hospital corridor width requirements (1800 mm minimum in patient areas) to schools or malls. Schools use standard egress width based on occupant load per PD 1096 — not the hospital's wider clinical corridor standard. Over-specifying widths wastes floor area; under-specifying fails inspection. Always check the building occupancy classification first.`,
      raw: `<Warn>\n\n**Common Mistake:** Applying hospital corridor width requirements (1800 mm minimum in patient areas) to schools or malls. Schools use standard egress width based on occupant load per PD 1096 — not the hospital's wider clinical corridor standard. Over-specifying widths wastes floor area; under-specifying fails inspection. Always check the building occupancy classification first.\n\n</Warn>`,
      insertion_marker: '## 1. Hospital Module',
    },
    {
      component_name: 'LawCallout',
      props: { code: 'bp344' },
      children_raw: `BP 344 accessible route requirements apply equally to hospitals, malls, and schools — all are "public buildings" under the law. Minimum 900 mm clear width, max 1:12 ramp slope, accessible toilets at 1 per gender per floor. However, hospitals are also governed by DOH reference standards which may require 1800 mm corridors in patient areas — exceeding BP 344's baseline but maintaining the same accessible route principles.`,
      raw: `<LawCallout code="bp344">\n\nBP 344 accessible route requirements apply equally to hospitals, malls, and schools — all are "public buildings" under the law. Minimum 900 mm clear width, max 1:12 ramp slope, accessible toilets at 1 per gender per floor. However, hospitals are also governed by DOH reference standards which may require 1800 mm corridors in patient areas — exceeding BP 344's baseline but maintaining the same accessible route principles.\n\n</LawCallout>`,
      insertion_marker: '## 1.1 Built Features',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** The exam may present a scenario mixing building types — e.g., "a school with a hospital wing." When types overlap, the MORE RESTRICTIVE provision governs the overlapping area. Hospital wing corridors = 1800 mm (DOH). School classroom corridors = based on occupant load (PD 1096). The hospital wing does NOT force the entire school to 1800 mm corridors — only the clinical area.`,
      raw: `<ExamTip>\n\n**ALE Trap:** The exam may present a scenario mixing building types — e.g., "a school with a hospital wing." When types overlap, the MORE RESTRICTIVE provision governs the overlapping area. Hospital wing corridors = 1800 mm (DOH). School classroom corridors = based on occupant load (PD 1096). The hospital wing does NOT force the entire school to 1800 mm corridors — only the clinical area.\n\n</ExamTip>`,
      insertion_marker: '## 2. Mall / Mixed‑Use Module',
    },
  ],

  '25bb445b-ebd5-452f-ad9e-f3912b17e740': [ // Exam Meta Deck Heights
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Meta-Strategy: The "Deck Height" Framework.** Every ALE topic boils down to three questions: (1) What's the rule? (e.g., minimum deck height = 2100 mm), (2) When does it apply? (e.g., accessible routes, not storage), (3) What's the exception? (e.g., doors can be 2030 mm). Master these three per topic and you've covered 80% of exam questions.`,
      raw: `<Tip>\n\n**Meta-Strategy: The "Deck Height" Framework.** Every ALE topic boils down to three questions: (1) What's the rule? (e.g., minimum deck height = 2100 mm), (2) When does it apply? (e.g., accessible routes, not storage), (3) What's the exception? (e.g., doors can be 2030 mm). Master these three per topic and you've covered 80% of exam questions.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Exam Meta-Tip:** Deck height questions often hide in scenario problems. A ramp with 2100 mm headroom might be code-compliant, but if it passes under a mechanical duct that drops to 1950 mm — that section fails. ALWAYS check the full path for obstructions, not just the starting clearance. The ALE loves "obstruction" traps in deck height scenarios.`,
      raw: `<ExamTip>\n\n**ALE Exam Meta-Tip:** Deck height questions often hide in scenario problems. A ramp with 2100 mm headroom might be code-compliant, but if it passes under a mechanical duct that drops to 1950 mm — that section fails. ALWAYS check the full path for obstructions, not just the starting clearance. The ALE loves "obstruction" traps in deck height scenarios.\n\n</ExamTip>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'Note',
      props: {},
      children_raw: `**Study Note:** Deck heights are among the most frequently tested dimensional standards on the ALE. The magic numbers: 2100 mm (accessible route headroom, PD 1096), 2030 mm (door height minimum), 2000 mm (stair headroom), 2400 mm (mezzanine floor-to-ceiling for credit as a story). Memorize these four as baseline and you'll nail 90% of clearance questions.`,
      raw: `<Note>\n\n**Study Note:** Deck heights are among the most frequently tested dimensional standards on the ALE. The magic numbers: 2100 mm (accessible route headroom, PD 1096), 2030 mm (door height minimum), 2000 mm (stair headroom), 2400 mm (mezzanine floor-to-ceiling for credit as a story). Memorize these four as baseline and you'll nail 90% of clearance questions.\n\n</Note>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '265b961a-20fa-464e-a9c2-6a1398e1ab2e': [ // Flora and Fauna
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "F-F-S = Flora, Fauna, Site."** Site planning requires simultaneous consideration of three dimensions: Flora (native vegetation preservation, tree preservation orders, root zone protection), Fauna (wildlife corridors, habitat connectivity, nesting seasons), and Site (drainage patterns, soil stability, slope). Change one and you affect all three — the ALE tests integrated thinking.`,
      raw: `<Tip>\n\n**Memory Anchor: "F-F-S = Flora, Fauna, Site."** Site planning requires simultaneous consideration of three dimensions: Flora (native vegetation preservation, tree preservation orders, root zone protection), Fauna (wildlife corridors, habitat connectivity, nesting seasons), and Site (drainage patterns, soil stability, slope). Change one and you affect all three — the ALE tests integrated thinking.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Mistake:** Designing site drainage that channels runoff through protected habitat zones. This is a double violation — it erodes soil stability (PD 1096 geotechnical requirements) AND disturbs protected flora/fauna (DENR regulations). Always route drainage AWAY from conservation areas and use bioswales or rain gardens for treatment.`,
      raw: `<Warn>\n\n**Common Mistake:** Designing site drainage that channels runoff through protected habitat zones. This is a double violation — it erodes soil stability (PD 1096 geotechnical requirements) AND disturbs protected flora/fauna (DENR regulations). Always route drainage AWAY from conservation areas and use bioswales or rain gardens for treatment.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Tree preservation is purely an aesthetic concern" — FALSE. PD 1096 and local ordinances require tree preservation for erosion control, shade provision, and stormwater management. Removing protected trees without a permit is a code violation that can block CO issuance. Know the difference between tree preservation orders (absolute protection) and tree replacement ratios (e.g., 1:3 replacement for removed trees).`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Tree preservation is purely an aesthetic concern" — FALSE. PD 1096 and local ordinances require tree preservation for erosion control, shade provision, and stormwater management. Removing protected trees without a permit is a code violation that can block CO issuance. Know the difference between tree preservation orders (absolute protection) and tree replacement ratios (e.g., 1:3 replacement for removed trees).\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '0f4bd84d-0be1-4a54-9c4f-b2020c37e6c6': [ // Geological Hazards — has 1 block
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "G-E-O = Ground, Earthquake, Overload."** The three geological hazard categories tested on the ALE: Ground (expansive soil, liquefaction-prone areas — geotechnical report required per PD 1096), Earthquake (seismic design categories per NSCP — occupancy category determines design level), Overload (bearing capacity failure — soil investigation before foundation design).`,
      raw: `<Tip>\n\n**Memory Anchor: "G-E-O = Ground, Earthquake, Overload."** The three geological hazard categories tested on the ALE: Ground (expansive soil, liquefaction-prone areas — geotechnical report required per PD 1096), Earthquake (seismic design categories per NSCP — occupancy category determines design level), Overload (bearing capacity failure — soil investigation before foundation design).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Critical Warning:** Building on expansive clay without proper soil treatment is a structural failure waiting to happen. PD 1096 requires a geotechnical investigation BEFORE foundation design. The NSCP provides the technical standards for bearing capacity, but PD 1096 is the legal framework that mandates the investigation. Both work together — neither replaces the other.`,
      raw: `<Warn>\n\n**Critical Warning:** Building on expansive clay without proper soil treatment is a structural failure waiting to happen. PD 1096 requires a geotechnical investigation BEFORE foundation design. The NSCP provides the technical standards for bearing capacity, but PD 1096 is the legal framework that mandates the investigation. Both work together — neither replaces the other.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** A question may test whether PD 1096 or NSCP governs geotechnical requirements. The correct answer: PD 1096 mandates the geotechnical report (legal framework), NSCP provides the engineering standards (technical framework). Trap answer: "Only the NSCP applies because it has the numbers" — WRONG. PD 1096 is the enabling law; NSCP is the reference standard. Both are needed.`,
      raw: `<ExamTip>\n\n**ALE Trap:** A question may test whether PD 1096 or NSCP governs geotechnical requirements. The correct answer: PD 1096 mandates the geotechnical report (legal framework), NSCP provides the engineering standards (technical framework). Trap answer: "Only the NSCP applies because it has the numbers" — WRONG. PD 1096 is the enabling law; NSCP is the reference standard. Both are needed.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '9df7cae5-ca74-48cb-81ec-344ed71bcadf': [ // Hydrology
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "R-U-N = Runoff, Underground, Natural."** Three hydrology dimensions tested on the ALE: Runoff (stormwater management — peak discharge must not increase post-development), Underground (groundwater recharge — permeable surfaces protect aquifer recharge), Natural (water body preservation — easements, buffer zones, no-build areas along waterways).`,
      raw: `<Tip>\n\n**Memory Anchor: "R-U-N = Runoff, Underground, Natural."** Three hydrology dimensions tested on the ALE: Runoff (stormwater management — peak discharge must not increase post-development), Underground (groundwater recharge — permeable surfaces protect aquifer recharge), Natural (water body preservation — easements, buffer zones, no-build areas along waterways).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Code Violation:** Connecting storm drainage to the sanitary sewer system is absolutely prohibited per PD 1096, Rule IX, Sec. 904(1). This prohibition is non-negotiable regardless of sewer capacity or city engineer approval. Stormwater must discharge to a separate storm drainage system. This is a common exam scenario — the illegal cross-connection prevents CO issuance.`,
      raw: `<Warn>\n\n**Code Violation:** Connecting storm drainage to the sanitary sewer system is absolutely prohibited per PD 1096, Rule IX, Sec. 904(1). This prohibition is non-negotiable regardless of sewer capacity or city engineer approval. Stormwater must discharge to a separate storm drainage system. This is a common exam scenario — the illegal cross-connection prevents CO issuance.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Bioswale Design Example:** A 500 sq.m parking lot in Quezon City. Required: treat the first 25 mm of rainfall (12.5 cu.m stormwater volume). A bioswale 1.0 m deep, 2.0 m wide, and 30 m long provides 60 cu.m treatment capacity — well above the minimum. The swale is planted with native grasses (vetiver grass for filtration) and lined with 300 mm of engineered soil mix. This meets both stormwater management and landscaping requirements.`,
      raw: `<Example>\n\n**Bioswale Design Example:** A 500 sq.m parking lot in Quezon City. Required: treat the first 25 mm of rainfall (12.5 cu.m stormwater volume). A bioswale 1.0 m deep, 2.0 m wide, and 30 m long provides 60 cu.m treatment capacity — well above the minimum. The swale is planted with native grasses (vetiver grass for filtration) and lined with 300 mm of engineered soil mix. This meets both stormwater management and landscaping requirements.\n\n</Example>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'fe7216ee-46ed-41b3-88ef-accb3f912a4c': [ // Inca Architecture
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Aid: "I-S-M = Inca Stone Magic."** Three principles: Interlocking (ashlar masonry with trapezoidal joints — no mortar needed), Shaping (stones shaped by hammering/pecking, not cutting — the "Inca puzzle"), S (Seismic resilience — trapezoidal doors/windows and battered walls distribute earthquake forces). All three translate directly to Philippine seismic design principles.`,
      raw: `<Tip>\n\n**Memory Aid: "I-S-M = Inca Stone Magic."** Three principles: Interlocking (ashlar masonry with trapezoidal joints — no mortar needed), Shaping (stones shaped by hammering/pecking, not cutting — the "Inca puzzle"), S (Seismic resilience — trapezoidal doors/windows and battered walls distribute earthquake forces). All three translate directly to Philippine seismic design principles.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Sacsayhuamán (Cusco, Peru):** A zigzag fortress wall with stones weighing up to 300 tons each. The stones are so precisely fitted that a knife blade cannot fit between them — and this without mortar. The wall's zigzag plan provides seismic resistance in multiple directions: each jamb acts as a buttress against lateral forces. This is the ALE's favorite Inca example for seismic adaptation questions.`,
      raw: `<Example>\n\n**Sacsayhuamán (Cusco, Peru):** A zigzag fortress wall with stones weighing up to 300 tons each. The stones are so precisely fitted that a knife blade cannot fit between them — and this without mortar. The wall's zigzag plan provides seismic resistance in multiple directions: each jamb acts as a buttress against lateral forces. This is the ALE's favorite Inca example for seismic adaptation questions.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Inca stone walls used mortar to hold stones together" — FALSE. Inca ashlar masonry is dry-stone (no mortar). The precise fitting was achieved through trial-and-error pecking and hammering, not cutting. Also: "Trapezoidal doorways were purely decorative" — FALSE. Trapezoidal openings are seismically advantageous: the angled sides distribute stress more evenly than rectangular openings during earthquakes.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Inca stone walls used mortar to hold stones together" — FALSE. Inca ashlar masonry is dry-stone (no mortar). The precise fitting was achieved through trial-and-error pecking and hammering, not cutting. Also: "Trapezoidal doorways were purely decorative" — FALSE. Trapezoidal openings are seismically advantageous: the angled sides distribute stress more evenly than rectangular openings during earthquakes.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '390affb2-c4ca-4ae7-a4b4-93d88107913b': [ // Le Corbusier Five Points
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Aid: "P-R-F-R-G = Pilotis, Roof Garden, Free Plan, Ribbon Window, Garden Facade."** The Five Points of Architecture (1927). Mnemonic: "People Really Love Free Roof Gardens." Each point enabled by the Dom-Ino frame system (reinforced concrete columns = load-bearing; walls are free). Villa Savoye (Poissy, 1929) demonstrates all five simultaneously.`,
      raw: `<Tip>\n\n**Memory Aid: "P-R-F-R-G = Pilotis, Roof Garden, Free Plan, Ribbon Window, Garden Facade."** The Five Points of Architecture (1927). Mnemonic: "People Really Love Free Roof Gardens." Each point enabled by the Dom-Ino frame system (reinforced concrete columns = load-bearing; walls are free). Villa Savoye (Poissy, 1929) demonstrates all five simultaneously.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Villa Savoye (1929) — The Five Points in One Building:** (1) Pilotis — slim concrete columns raise the mass off the ground. (2) Roof garden — flat roof as usable outdoor space replacing the ground taken by the building. (3) Free plan — interior walls are non-load-bearing, allowing fluid open spaces. (4) Ribbon window — horizontal window spans the entire facade for equal light. (5) Free facade — the facade is a non-structural skin, independent of the frame. This is the single most important case study for Five Points questions.`,
      raw: `<Example>\n\n**Villa Savoye (1929) — The Five Points in One Building:** (1) Pilotis — slim concrete columns raise the mass off the ground. (2) Roof garden — flat roof as usable outdoor space replacing the ground taken by the building. (3) Free plan — interior walls are non-load-bearing, allowing fluid open spaces. (4) Ribbon window — horizontal window spans the entire facade for equal light. (5) Free facade — the facade is a non-structural skin, independent of the frame. This is the single most important case study for Five Points questions.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Le Corbusier's Five Points were developed for the Villa Savoye" — FALSE. The Five Points were published in 1927 (Vers une Architecture ideas plus the Citrohan House). Villa Savoye (1929) DEMONSTRATED them, but they were conceived earlier. Also: know that the Dom-Ino frame (1914) was the technological prerequisite — without reinforced concrete columns, free plans and ribbon windows were impossible.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Le Corbusier's Five Points were developed for the Villa Savoye" — FALSE. The Five Points were published in 1927 (Vers une Architecture ideas plus the Citrohan House). Villa Savoye (1929) DEMONSTRATED them, but they were conceived earlier. Also: know that the Dom-Ino frame (1914) was the technological prerequisite — without reinforced concrete columns, free plans and ribbon windows were impossible.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '146e1210-2b6a-42fb-85c2-3e1b1fd082c2': [ // Masters of the Golden Age
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "F-L-L-W = Frank Lloyd Wright (Organic Architecture, Fallingwater), Corbusier (Five Points, Villa Savoye), Le (Mies — Less is More, Barcelona Pavilion), Gropius/Walter (Bauhaus founder, Fagus Factory)." The four pillars of Modern Architecture. When a question asks about any of them, first identify their KEY PRINCIPLE word: Wright = Organic, Corbusier = Machine, Mies = Minimal, Gropius = Functional.`,
      raw: `<Tip>\n\n**Memory Anchor: "F-L-L-W = Frank Lloyd Wright (Organic Architecture, Fallingwater), Corbusier (Five Points, Villa Savoye), Le (Mies — Less is More, Barcelona Pavilion), Gropius/Walter (Bauhaus founder, Fagus Factory)." The four pillars of Modern Architecture. When a question asks about any of them, first identify their KEY PRINCIPLE word: Wright = Organic, Corbusier = Machine, Mies = Minimal, Gropius = Functional.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Fallingwater (Frank Lloyd Wright, 1935):** The defining example of Organic Architecture. Wright cantilevered the structure directly over a waterfall, integrating building and site as one inseparable entity. The horizontal lines echo the rock ledges; the materials (local sandstone, reinforced concrete) blend with the forest. Key exam point: Fallingwater is simultaneously the masterpiece of Organic Architecture AND a pioneering cantilever engineering feat.`,
      raw: `<Example>\n\n**Fallingwater (Frank Lloyd Wright, 1935):** The defining example of Organic Architecture. Wright cantilevered the structure directly over a waterfall, integrating building and site as one inseparable entity. The horizontal lines echo the rock ledges; the materials (local sandstone, reinforced concrete) blend with the forest. Key exam point: Fallingwater is simultaneously the masterpiece of Organic Architecture AND a pioneering cantilever engineering feat.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Frank Lloyd Wright invented the International Style" — FALSE. Wright's Organic Architecture is distinct from the International Style (Hitchcock & Johnson, 1932). Wright rejected the International Style as too rigid. His work emphasizes horizontality, natural materials, and site integration — the opposite of the International Style's abstract, white, cubic forms. Know which architects belong to which movement, not just their names.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Frank Lloyd Wright invented the International Style" — FALSE. Wright's Organic Architecture is distinct from the International Style (Hitchcock & Johnson, 1932). Wright rejected the International Style as too rigid. His work emphasizes horizontality, natural materials, and site integration — the opposite of the International Style's abstract, white, cubic forms. Know which architects belong to which movement, not just their names.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'a81062b3-5724-4bdc-8f70-dcfd9ef51e46': [ // Microclimate
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "S-W-W = Sun, Wind, Water."** The three microclimate factors that site design can actively modify: Sun (orientation, shading devices, building massing for solar heat gain control), Wind (building placement for natural ventilation cross-flow, windbreaks against prevailing winds), Water (evaporative cooling from pools/fountains, stormwater management and its thermal effects).`,
      raw: `<Tip>\n\n**Memory Anchor: "S-W-W = Sun, Wind, Water."** The three microclimate factors that site design can actively modify: Sun (orientation, shading devices, building massing for solar heat gain control), Wind (building placement for natural ventilation cross-flow, windbreaks against prevailing winds), Water (evaporative cooling from pools/fountains, stormwater management and its thermal effects).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Design Warning:** A building's own shadow can create unintended microclimate problems. A tall building north of a public plaza may cast a permanent shadow, reducing the plaza's usability in winter (or creating a welcome cool zone in tropical climates). Conversely, reflective glass facades can concentrate solar radiation onto adjacent properties — creating hot spots that damage neighboring plants or increase AC loads. Always model solar access.`,
      raw: `<Warn>\n\n**Design Warning:** A building's own shadow can create unintended microclimate problems. A tall building north of a public plaza may cast a permanent shadow, reducing the plaza's usability in winter (or creating a welcome cool zone in tropical climates). Conversely, reflective glass facades can concentrate solar radiation onto adjacent properties — creating hot spots that damage neighboring plants or increase AC loads. Always model solar access.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Natural Ventilation Strategy (Philippine Context):** Orient buildings with long facades facing prevailing wind direction (usually NE-SW in Metro Manila). Place lower openings on the windward side (intake at low level) and higher openings on the leeward side (exhaust at high level) — this creates stack-effect ventilation driven by wind pressure AND temperature difference. Cross-ventilation path must be unobstructed by internal partitions.`,
      raw: `<Example>\n\n**Natural Ventilation Strategy (Philippine Context):** Orient buildings with long facades facing prevailing wind direction (usually NE-SW in Metro Manila). Place lower openings on the windward side (intake at low level) and higher openings on the leeward side (exhaust at high level) — this creates stack-effect ventilation driven by wind pressure AND temperature difference. Cross-ventilation path must be unobstructed by internal partitions.\n\n</Example>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'fc84f5df-3b67-4891-bf56-596177e774fb': [ // Mies van der Rohe
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "L-I-G-H-T = Less Is More, God is in the Details, Horizontal, Transparency."** Mies' philosophy in four words: Less is More (minimalism as design principle), God is in the Details (flawless craftsmanship of every joint), Horizontal (the universal space, flowing open plans), Transparency (glass walls dissolving the boundary between inside and outside). Barcelona Pavilion (1929) = Mies' complete manifesto in one building.`,
      raw: `<Tip>\n\n**Memory Anchor: "L-I-G-H-T = Less Is More, God is in the Details, Horizontal, Transparency."** Mies' philosophy in four words: Less is More (minimalism as design principle), God is in the Details (flawless craftsmanship of every joint), Horizontal (the universal space, flowing open plans), Transparency (glass walls dissolving the boundary between inside and outside). Barcelona Pavilion (1929) = Mies' complete manifesto in one building.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Barcelona Pavilion (1929):** The single most important Mies building for exam purposes. Key features: (1) Cruciform steel columns — chrome-plated, non-load-bearing appearance despite carrying the roof. (2) Floating roof plane — thin, cantilevered roof slab giving the illusion of weightlessness. (3) Free-flowing space — interior walls are freestanding planes of marble, onyx, and glass that define space without enclosing it. (4) Reflecting pool — water features extend the spatial experience outdoors. (5) The famous Barcelona Chair — designed specifically for this pavilion.`,
      raw: `<Example>\n\n**Barcelona Pavilion (1929):** The single most important Mies building for exam purposes. Key features: (1) Cruciform steel columns — chrome-plated, non-load-bearing appearance despite carrying the roof. (2) Floating roof plane — thin, cantilevered roof slab giving the illusion of weightlessness. (3) Free-flowing space — interior walls are freestanding planes of marble, onyx, and glass that define space without enclosing it. (4) Reflecting pool — water features extend the spatial experience outdoors. (5) The famous Barcelona Chair — designed specifically for this pavilion.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Mies van der Rohe designed the first glass curtain wall" — FALSE. The Seagram Building (1958) popularized the glass curtain wall, but Mies' earlier attempts (Friedrichstrasse Office Tower project, 1921) and his Farnsworth House (1951) were more influential as pure expressions of the idea. Also: "Less is More" is Mies; "Less is a Bore" is Robert Venturi (Post-Modernist response). Don't mix them up.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Mies van der Rohe designed the first glass curtain wall" — FALSE. The Seagram Building (1958) popularized the glass curtain wall, but Mies' earlier attempts (Friedrichstrasse Office Tower project, 1921) and his Farnsworth House (1951) were more influential as pure expressions of the idea. Also: "Less is More" is Mies; "Less is a Bore" is Robert Venturi (Post-Modernist response). Don't mix them up.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '5fd2842e-ca3e-4e6d-bb87-65067d23a482': [ // North American Indigenous
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Aid: "T-P-L = Tipi, Pueblo, Longhouse."** Three distinct North American indigenous typologies: Tipi (Plains tribes — conical, portable, smoke-hole oriented to prevailing wind), Pueblo (Southwest — adobe multi-story, south-facing passive solar, kiva ceremonial chambers), Longhouse (Iroquois/Northeast — communal bark-covered hall, clan-based multiple families under one roof). Each responds to its specific climate and culture.`,
      raw: `<Tip>\n\n**Memory Aid: "T-P-L = Tipi, Pueblo, Longhouse."** Three distinct North American indigenous typologies: Tipi (Plains tribes — conical, portable, smoke-hole oriented to prevailing wind), Pueblo (Southwest — adobe multi-story, south-facing passive solar, kiva ceremonial chambers), Longhouse (Iroquois/Northeast — communal bark-covered hall, clan-based multiple families under one roof). Each responds to its specific climate and culture.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Taos Pueblo (New Mexico, continuously inhabited for 1000+ years):** Multi-story adobe complex with thick earth walls (thermal mass), south-facing orientation for passive solar heating in winter, and north-facing minimal openings to block cold winds. The tiered design — upper stories set back — provides shade for lower levels in summer while capturing low winter sun. This is the ALE's key case study for indigenous passive solar design.`,
      raw: `<Example>\n\n**Taos Pueblo (New Mexico, continuously inhabited for 1000+ years):** Multi-story adobe complex with thick earth walls (thermal mass), south-facing orientation for passive solar heating in winter, and north-facing minimal openings to block cold winds. The tiered design — upper stories set back — provides shade for lower levels in summer while capturing low winter sun. This is the ALE's key case study for indigenous passive solar design.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Indigenous North American architecture was primitive and unsophisticated" — FALSE. Tipi engineering includes adjustable smoke flaps that use the Venturi effect to draw smoke upward; Pueblo adobe achieves 8-10°C interior temperature stability through thermal mass alone; Iroquois longhouses were designed for modular expansion as clans grew. The ALE expects respect for indigenous engineering sophistication.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Indigenous North American architecture was primitive and unsophisticated" — FALSE. Tipi engineering includes adjustable smoke flaps that use the Venturi effect to draw smoke upward; Pueblo adobe achieves 8-10°C interior temperature stability through thermal mass alone; Iroquois longhouses were designed for modular expansion as clans grew. The ALE expects respect for indigenous engineering sophistication.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'ae17af26-de0c-448e-a6d2-d64748f904fe': [ // Post-Modernism
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "P-M = Post-Modernism = Pluralism + Metaphor."** Two defining characteristics: Pluralism (rejects the single "correct" style of Modernism — mixes historical references, ornament, color, irony) and Metaphor (buildings communicate meaning through form — e.g., Venturi's "decorated shed" vs. "duck"). Philip Johnson's AT&T Building (Chippendale top) and Michael Graves' Portland Building (keystone, garland, color) are textbook examples.`,
      raw: `<Tip>\n\n**Memory Anchor: "P-M = Post-Modernism = Pluralism + Metaphor."** Two defining characteristics: Pluralism (rejects the single "correct" style of Modernism — mixes historical references, ornament, color, irony) and Metaphor (buildings communicate meaning through form — e.g., Venturi's "decorated shed" vs. "duck"). Philip Johnson's AT&T Building (Chippendale top) and Michael Graves' Portland Building (keystone, garland, color) are textbook examples.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Vanna Venturi House (Robert Venturi, 1964):** The first built manifesto of Post-Modernism. Features: (1) Monumental gable facade — a "house-shaped" front that is purely symbolic, not structural. (2) Broken pediment — a reference to Classical architecture, but fragmented and ironic. (3) Oversized arch — the front door is framed by a giant arch that cuts through the gable. (4) "Decorated shed" concept — the building is a simple box, but the facade is a decorated surface that communicates "house." This building explicitly rejects Mies' "Less is More."`,
      raw: `<Example>\n\n**Vanna Venturi House (Robert Venturi, 1964):** The first built manifesto of Post-Modernism. Features: (1) Monumental gable facade — a "house-shaped" front that is purely symbolic, not structural. (2) Broken pediment — a reference to Classical architecture, but fragmented and ironic. (3) Oversized arch — the front door is framed by a giant arch that cuts through the gable. (4) "Decorated shed" concept — the building is a simple box, but the facade is a decorated surface that communicates "house." This building explicitly rejects Mies' "Less is More."\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "Post-Modernism means 'after Modernism' chronologically" — PARTIALLY TRUE but incomplete. Post-Modernism is a specific architectural movement defined by Venturi's Complexity and Contradiction in Architecture (1966) and Learning from Las Vegas (1972). It explicitly REJECTS Modernist dogma (ornament is crime, form follows function, truth to materials). Not everything built after 1970 is Post-Modern — it must show historical reference, irony, or symbolism.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "Post-Modernism means 'after Modernism' chronologically" — PARTIALLY TRUE but incomplete. Post-Modernism is a specific architectural movement defined by Venturi's Complexity and Contradiction in Architecture (1966) and Learning from Las Vegas (1972). It explicitly REJECTS Modernist dogma (ornament is crime, form follows function, truth to materials). Not everything built after 1970 is Post-Modern — it must show historical reference, irony, or symbolism.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'efb82628-9bf4-4bde-9561-8b784384c32c': [ // Pre-Columbian Mesoamerica
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Aid: "M-A-T = Maya, Aztec, Teotihuacan."** The three great Mesoamerican civilizations tested on the ALE: Maya (Tikal, Palenque — corbel arches, step pyramids, astronomical alignment), Aztec/Tenochtitlan (twin-temple pyramids, chinampas floating gardens, causeways), Teotihuacan (Pyramid of the Sun/Moon — talud-tablero profile, Avenue of the Dead, city grid). Know which features belong to which civilization.`,
      raw: `<Tip>\n\n**Memory Aid: "M-A-T = Maya, Aztec, Teotihuacan."** The three great Mesoamerican civilizations tested on the ALE: Maya (Tikal, Palenque — corbel arches, step pyramids, astronomical alignment), Aztec/Tenochtitlan (twin-temple pyramids, chinampas floating gardens, causeways), Teotihuacan (Pyramid of the Sun/Moon — talud-tablero profile, Avenue of the Dead, city grid). Know which features belong to which civilization.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Talud-Tablero (Teotihuacan):** A distinctive architectural profile where sloping panels (talud) alternate with vertical panels framed by projecting cornices (tablero). This was the defining feature of Teotihuacan construction, seen on the Pyramid of the Sun and Pyramid of the Moon. It provides visual rhythm AND structural stability — the sloping base distributes loads more efficiently than a purely vertical wall. Mesoamerica's most influential architectural innovation.`,
      raw: `<Example>\n\n**Talud-Tablero (Teotihuacan):** A distinctive architectural profile where sloping panels (talud) alternate with vertical panels framed by projecting cornices (tablero). This was the defining feature of Teotihuacan construction, seen on the Pyramid of the Sun and Pyramid of the Moon. It provides visual rhythm AND structural stability — the sloping base distributes loads more efficiently than a purely vertical wall. Mesoamerica's most influential architectural innovation.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "The Maya used the true arch" — FALSE. Maya architecture used the corbel arch (false arch), where stones progressively overlap until they meet at the top. True arches (voussoir/keystone) were NOT used in Pre-Columbian America. Also: "Teotihuacan was built by the Aztecs" — FALSE. Teotihuacan predates the Aztecs by centuries (abandoned ~600 CE; Aztec Empire rose ~1325 CE). The Aztecs named it but did not build it.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "The Maya used the true arch" — FALSE. Maya architecture used the corbel arch (false arch), where stones progressively overlap until they meet at the top. True arches (voussoir/keystone) were NOT used in Pre-Columbian America. Also: "Teotihuacan was built by the Aztecs" — FALSE. Teotihuacan predates the Aztecs by centuries (abandoned ~600 CE; Aztec Empire rose ~1325 CE). The Aztecs named it but did not build it.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'd6015c96-3954-4780-ad92-64507a2959d1': [ // Sheet Metal and Spray Booths
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "S-S-F = Sheet metal, Spray booth, Fire safety."** Three code dimensions: Sheet metal (corrosion-resistant, proper fasteners — PD 1096 Rule XII Section 1210), Spray booth (explosion-proof construction, ventilation rates, fire suppression — NFPA 33 adopted by reference), Fire safety (fire-rated separation from other occupancies, 2-hour minimum for spray booth rooms).`,
      raw: `<Tip>\n\n**Memory Anchor: "S-S-F = Sheet metal, Spray booth, Fire safety."** Three code dimensions: Sheet metal (corrosion-resistant, proper fasteners — PD 1096 Rule XII Section 1210), Spray booth (explosion-proof construction, ventilation rates, fire suppression — NFPA 33 adopted by reference), Fire safety (fire-rated separation from other occupancies, 2-hour minimum for spray booth rooms).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Critical Safety Warning:** Spray booths require explosion-proof electrical fittings and proper ventilation (minimum 100 fpm air velocity across the booth face per NFPA 33). Using standard electrical fixtures in a spray booth is a direct fire code violation. The LEA expects you to know that spray booths are classified as hazardous locations — Group D, Division 1 or 2 depending on proximity to the spray area.`,
      raw: `<Warn>\n\n**Critical Safety Warning:** Spray booths require explosion-proof electrical fittings and proper ventilation (minimum 100 fpm air velocity across the booth face per NFPA 33). Using standard electrical fixtures in a spray booth is a direct fire code violation. The LEA expects you to know that spray booths are classified as hazardous locations — Group D, Division 1 or 2 depending on proximity to the spray area.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'LawCallout',
      props: { code: 'nbcp' },
      children_raw: `Per PD 1096 Rule XII Section 1210: Sheet metal work must be corrosion-resistant (galvanized or equivalent) and securely fastened. Joints must be designed to accommodate thermal expansion. For spray booths, PD 1096 references NFPA 33 — which requires: (1) 100 fpm minimum ventilation velocity, (2) automatic fire suppression, (3) explosion relief panels, (4) 2-hour fire-rated enclosure. These are among the most code-intensive ALE exam topics.`,
      raw: `<LawCallout code="nbcp">\n\nPer PD 1096 Rule XII Section 1210: Sheet metal work must be corrosion-resistant (galvanized or equivalent) and securely fastened. Joints must be designed to accommodate thermal expansion. For spray booths, PD 1096 references NFPA 33 — which requires: (1) 100 fpm minimum ventilation velocity, (2) automatic fire suppression, (3) explosion relief panels, (4) 2-hour fire-rated enclosure. These are among the most code-intensive ALE exam topics.\n\n</LawCallout>`,
      insertion_marker: '## Legal Foundation',
    },
  ],

  '31fff533-f6b9-44dc-8d46-996e5413a587': [ // Spanish Colonial Laws of the Indies
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Aid: "P-L-A-Z-A = Plaza, Layout, Arcade, Zoning, Alignment."** The Laws of the Indies (1573) established five urban principles still visible in every Philippine colonial town: Plaza (central square as civic + religious heart), Layout (gridiron streets radiating from plaza), Arcade (portales/arcades for pedestrian shade), Zoning (administrative, religious, commercial zones around plaza), Alignment (buildings facing plaza, church at one end, government at another).`,
      raw: `<Tip>\n\n**Memory Aid: "P-L-A-Z-A = Plaza, Layout, Arcade, Zoning, Alignment."** The Laws of the Indies (1573) established five urban principles still visible in every Philippine colonial town: Plaza (central square as civic + religious heart), Layout (gridiron streets radiating from plaza), Arcade (portales/arcades for pedestrian shade), Zoning (administrative, religious, commercial zones around plaza), Alignment (buildings facing plaza, church at one end, government at another).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Intramuros (Manila, 1571):** The textbook application of the Laws of the Indies in the Philippines. Features: Plaza Mayor (Plaza de Armas, now Plaza Roma) as the central square, Manila Cathedral on one side, Palacio del Gobernador on another (the "dos poderes" — church and state). Gridiron street layout (calles running N-S and E-W). Thick stone fortification walls (muralla) enclosing the entire settlement. The plaza-oriented urban form remains the template for every Philippine town center today.`,
      raw: `<Example>\n\n**Intramuros (Manila, 1571):** The textbook application of the Laws of the Indies in the Philippines. Features: Plaza Mayor (Plaza de Armas, now Plaza Roma) as the central square, Manila Cathedral on one side, Palacio del Gobernador on another (the "dos poderes" — church and state). Gridiron street layout (calles running N-S and E-W). Thick stone fortification walls (muralla) enclosing the entire settlement. The plaza-oriented urban form remains the template for every Philippine town center today.\n\n</Example>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "The Laws of the Indies were applied uniformly across all Spanish colonies" — FALSE. While the 1573 Ordenanzas were the legal framework, local conditions forced adaptations: Philippine versions had thinner walls (earthquake adaptation), wider arcades (tropical sun/rain), and churches oriented differently than the strict E-W rule when site conditions demanded. The ALE tests whether you know the principle AND its local modification.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "The Laws of the Indies were applied uniformly across all Spanish colonies" — FALSE. While the 1573 Ordenanzas were the legal framework, local conditions forced adaptations: Philippine versions had thinner walls (earthquake adaptation), wider arcades (tropical sun/rain), and churches oriented differently than the strict E-W rule when site conditions demanded. The ALE tests whether you know the principle AND its local modification.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '6e84b3e6-5dd9-4557-8202-5085d24a3708': [ // Top 50 Traps 2024 IRR
    {
      component_name: 'LawCallout',
      props: { code: 'bp344' },
      children_raw: `The 2024 IRR of BP 344 introduces several critical changes tested in the Top 50 Traps: (1) Flat 3% rule replaces old tiered table for assembly seating, (2) 2% flat rate replaces 1/50 formula for lodging, (3) Handrail heights harmonized at 750-900 mm dual-height standard. These are the most frequently tested changes — if a question mentions "2024 IRR," the answer almost always involves one of these three updates.`,
      raw: `<LawCallout code="bp344">\n\nThe 2024 IRR of BP 344 introduces several critical changes tested in the Top 50 Traps: (1) Flat 3% rule replaces old tiered table for assembly seating, (2) 2% flat rate replaces 1/50 formula for lodging, (3) Handrail heights harmonized at 750-900 mm dual-height standard. These are the most frequently tested changes — if a question mentions "2024 IRR," the answer almost always involves one of these three updates.\n\n</LawCallout>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**🚨 TOP TRAP: Rounding direction.** When calculating accessible counts, ALWAYS round UP. 3% of 750 seats = 22.5 → 23 (not 22). 2% of 75 rooms = 1.5 → 2 (not 1). Never round down — the law requires the minimum number, and rounding down provides fewer than required. This is the single most common calculation error on the ALE.`,
      raw: `<Warn>\n\n**🚨 TOP TRAP: Rounding direction.** When calculating accessible counts, ALWAYS round UP. 3% of 750 seats = 22.5 → 23 (not 22). 2% of 75 rooms = 1.5 → 2 (not 1). Never round down — the law requires the minimum number, and rounding down provides fewer than required. This is the single most common calculation error on the ALE.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Meta-Trap:** The exam loves "old vs. new" comparison questions. If a building was designed in 2005 (old IRR), the old tiered table may apply. If designed today (2024 IRR), the new percentages apply. The question will specify which regime governs — read carefully. If both years are given without specifying which applies, use the more restrictive (current code, i.e., 2024 IRR).`,
      raw: `<ExamTip>\n\n**ALE Meta-Trap:** The exam loves "old vs. new" comparison questions. If a building was designed in 2005 (old IRR), the old tiered table may apply. If designed today (2024 IRR), the new percentages apply. The question will specify which regime governs — read carefully. If both years are given without specifying which applies, use the more restrictive (current code, i.e., 2024 IRR).\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '790c43e4-4bd1-4ca1-ac43-1923bab8e6fd': [ // Topography and Slope Analysis
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "S-L-O-P-E = Steepness, Landform, Orientation, Profile, Elevation."** Five topographic factors that govern site planning decisions: Steepness (% slope determines developable area — >15% usually requires special foundation), Landform (ridge, valley, slope — each has different drainage/microclimate), Orientation (south-facing = warmer/drier, north-facing = cooler/wetter), Profile (concave/convex — affects water concentration), Elevation (flood risk, view potential, temperature gradient).`,
      raw: `<Tip>\n\n**Memory Anchor: "S-L-O-P-E = Steepness, Landform, Orientation, Profile, Elevation."** Five topographic factors that govern site planning decisions: Steepness (% slope determines developable area — >15% usually requires special foundation), Landform (ridge, valley, slope — each has different drainage/microclimate), Orientation (south-facing = warmer/drier, north-facing = cooler/wetter), Profile (concave/convex — affects water concentration), Elevation (flood risk, view potential, temperature gradient).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Critical Warning:** Building on slopes >15% without geotechnical analysis is a PD 1096 violation. Steep slopes require: (1) Geotechnical investigation to assess soil stability and bearing capacity, (2) Engineered retaining walls if cut/fill exceeds 1.2 m height, (3) Proper drainage to prevent erosion and slope failure. The LEA loves testing whether you know the slope threshold that triggers special foundation requirements.`,
      raw: `<Warn>\n\n**Critical Warning:** Building on slopes >15% without geotechnical analysis is a PD 1096 violation. Steep slopes require: (1) Geotechnical investigation to assess soil stability and bearing capacity, (2) Engineered retaining walls if cut/fill exceeds 1.2 m height, (3) Proper drainage to prevent erosion and slope failure. The LEA loves testing whether you know the slope threshold that triggers special foundation requirements.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "A 10% slope is too steep for any development" — FALSE. 10% slopes (approx. 6°) are generally developable with standard foundation techniques. The key thresholds: 0-5% = ideal for development; 5-10% = requires moderate grading; 10-15% = requires stepped foundations/retaining walls; >15% = special geotechnical design required. Know these thresholds and what construction technique applies at each range.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "A 10% slope is too steep for any development" — FALSE. 10% slopes (approx. 6°) are generally developable with standard foundation techniques. The key thresholds: 0-5% = ideal for development; 5-10% = requires moderate grading; 10-15% = requires stepped foundations/retaining walls; >15% = special geotechnical design required. Know these thresholds and what construction technique applies at each range.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  // === 1-block articles ===
  // === 2-block articles ===
  '162054b5-5f86-4a99-ab8b-f7991bbab899': [ // Modern Filipino Identity — has 2 blocks
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "F-C-C = Filipino Values, Climate, Craft."** Mañosa's Three Pillars of Filipino Architecture: Filipino values (family, community, bayanihan), Climate response (tropical passive strategies), Craft/indigenous materials (bamboo, coconut, capiz, rattan). If a building design is missing any one of these three, it's not truly Filipino architecture in the Mañosa tradition.`,
      raw: `<Tip>\n\n**Memory Anchor: "F-C-C = Filipino Values, Climate, Craft."** Mañosa's Three Pillars of Filipino Architecture: Filipino values (family, community, bayanihan), Climate response (tropical passive strategies), Craft/indigenous materials (bamboo, coconut, capiz, rattan). If a building design is missing any one of these three, it's not truly Filipino architecture in the Mañosa tradition.\n\n</Tip>`,
      insertion_marker: '## Core Concepts',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Trap:** "Tropical Regionalism and Critical Regionalism are the same thing" — FALSE. Tropical Regionalism (Locsin, Mañosa) is specifically about climate-responsive design in the tropics. Critical Regionalism (Kenneth Frampton's theory) is a broader philosophical resistance to placeless globalization. They overlap in their emphasis on local context, but the LEA uses "Critical Regionalism" as a distractor — the correct answer for Philippine architecture is Tropical Regionalism.`,
      raw: `<Warn>\n\n**Common Trap:** "Tropical Regionalism and Critical Regionalism are the same thing" — FALSE. Tropical Regionalism (Locsin, Mañosa) is specifically about climate-responsive design in the tropics. Critical Regionalism (Kenneth Frampton's theory) is a broader philosophical resistance to placeless globalization. They overlap in their emphasis on local context, but the LEA uses "Critical Regionalism" as a distractor — the correct answer for Philippine architecture is Tropical Regionalism.\n\n</Warn>`,
      insertion_marker: '## LEA Exam Traps',
    },
    {
      component_name: 'Example',
      props: {},
      children_raw: `**Coconut Palace (Francisco Mañosa, 1981):** The flagship example of Neo-Vernacular architecture. Features: (1) Exterior shell-like form inspired by the coconut — the national fruit. (2) Extensive use of indigenous materials — coconut shell panels, capiz-shell windows, bamboo, rattan, and local hardwood. (3) Passive cooling via cross-ventilation with operable windows on all sides. (4) Open interior spaces with minimal partitions (borrowed from the bahay kubo's bulwagan concept). Built for the 1981 IMF-World Bank meetings as a showcase of Filipino design capability.`,
      raw: `<Example>\n\n**Coconut Palace (Francisco Mañosa, 1981):** The flagship example of Neo-Vernacular architecture. Features: (1) Exterior shell-like form inspired by the coconut — the national fruit. (2) Extensive use of indigenous materials — coconut shell panels, capiz-shell windows, bamboo, rattan, and local hardwood. (3) Passive cooling via cross-ventilation with operable windows on all sides. (4) Open interior spaces with minimal partitions (borrowed from the bahay kubo's bulwagan concept). Built for the 1981 IMF-World Bank meetings as a showcase of Filipino design capability.\n\n</Example>`,
      insertion_marker: '| **Second Wave: Neo-Vernacular**',
    },
  ],

  // === 3-block articles (add 1-2 more) ===
  '2862e34d-02fd-4f95-a2a2-5119a355bdf8': [ // Colonial European — has 3 blocks
    {
      component_name: 'Note',
      props: {},
      children_raw: `**C-A-A Cheat Sheet:** When facing any colonial architecture question on the ALE, run the framework: Climate (tropical = verandas, raised floors; cold = thick walls, central heat), Available Materials (adobe vs. coral stone vs. brick vs. timber), Adapted Forms (Churrigueresque in Mexico vs. Federation in Australia vs. Bahay na Bato in the Philippines). The C-A-A framework turns memorization into reasoning.`,
      raw: `<Note>\n\n**C-A-A Cheat Sheet:** When facing any colonial architecture question on the ALE, run the framework: Climate (tropical = verandas, raised floors; cold = thick walls, central heat), Available Materials (adobe vs. coral stone vs. brick vs. timber), Adapted Forms (Churrigueresque in Mexico vs. Federation in Australia vs. Bahay na Bato in the Philippines). The C-A-A framework turns memorization into reasoning.\n\n</Note>`,
      insertion_marker: '## The Hard Data (Cheat Sheet)',
    },
    {
      component_name: 'KeyValues',
      props: {},
      children_raw: `**Key Colonial Styles at a Glance:** Spanish Americas (Churrigueresque Baroque) = adobe/volcanic stone, ornate facades, fortified churches. English North - Northern (Georgian/Federal) = brick, small windows, central chimneys for cold. English North - Southern (Plantation) = raised floors, wrap-around verandas, elevated for flood/heat. British Australia (Federation) = bull-nosed verandas, cast-iron lacework, red brick + terracotta. Philippine (Bahay na Bato) = coral stone ground, wood upper, capiz windows.`,
      raw: `<KeyValues>\n\n**Key Colonial Styles at a Glance:**\n- Spanish Americas (Churrigueresque Baroque): adobe/volcanic stone, ornate facades, fortified churches\n- English North - Northern (Georgian/Federal): brick, small windows, central chimneys for cold\n- English North - Southern (Plantation): raised floors, wrap-around verandas, elevated for flood/heat\n- British Australia (Federation): bull-nosed verandas, cast-iron lacework, red brick + terracotta\n- Philippine (Bahay na Bato): coral stone ground, wood upper, capiz windows\n\n</KeyValues>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '41447adf-185f-4a10-a0e9-16febe7b6168': [ // Pre-Colonial Vernacular — has 3 blocks
    {
      component_name: 'Note',
      props: {},
      children_raw: `**Exam Note:** The bahay kubo structural sequence is tested as a labeling/diagram question. From bottom to top: Haligi (posts) → Batangan (joists) → Sahig (floor) → Dingding (walls) → Bubong (roof). The LEA may show a cross-section diagram and ask you to identify parts. Know the terms AND their English equivalents.`,
      raw: `<Note>\n\n**Exam Note:** The bahay kubo structural sequence is tested as a labeling/diagram question. From bottom to top: Haligi (posts) → Batangan (joists) → Sahig (floor) → Dingding (walls) → Bubong (roof). The LEA may show a cross-section diagram and ask you to identify parts. Know the terms AND their English equivalents.\n\n</Note>`,
      insertion_marker: '### Joinery Techniques',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Trap:** "The silong of the bahay kubo is the same as the zaguan of the bahay na bato" — FALSE. Silong = open space under the raised bahay kubo (unenclosed, for storage/livestock). Zaguan = enclosed stone ground floor of the bahay na bato (for carriages, processional floats). The material, enclosure, and function are completely different. This is one of the LEA's favorite architectural history distinctions.`,
      raw: `<Warn>\n\n**Common Trap:** "The silong of the bahay kubo is the same as the zaguan of the bahay na bato" — FALSE. Silong = open space under the raised bahay kubo (unenclosed, for storage/livestock). Zaguan = enclosed stone ground floor of the bahay na bato (for carriages, processional floats). The material, enclosure, and function are completely different. This is one of the LEA's favorite architectural history distinctions.\n\n</Warn>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  'e5cd1de8-d1e5-4173-9dd2-985eda1562a9': [ // Sanitation and Water Supply — has 3 blocks
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "W-S-D = Water, Sewer, Drainage."** Three separate systems the LEA tests: Water supply (potable water — minimum pressure, pipe sizing, backflow prevention per PD 1096 Rule IX), Sewer (sanitary sewer connection vs. septic tank — minimum slope 1:50 for 100 mm pipes), Drainage (stormwater — ABSOLUTELY SEPARATE from sanitary, zero exceptions per Sec. 904). The most common exam error is conflating sewer and drainage.`,
      raw: `<Tip>\n\n**Memory Anchor: "W-S-D = Water, Sewer, Drainage."** Three separate systems the LEA tests: Water supply (potable water — minimum pressure, pipe sizing, backflow prevention per PD 1096 Rule IX), Sewer (sanitary sewer connection vs. septic tank — minimum slope 1:50 for 100 mm pipes), Drainage (stormwater — ABSOLUTELY SEPARATE from sanitary, zero exceptions per Sec. 904). The most common exam error is conflating sewer and drainage.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'LawCallout',
      props: { code: 'nbcp' },
      children_raw: `PD 1096 Rule IX Sec. 904: "Rainwater drainage shall NOT discharge to the sanitary sewer system." This prohibition is absolute — no exceptions for sewer capacity, city engineer approval, or any other factor. A building with this cross-connection cannot receive a Certificate of Occupancy. The correct remedy is rerouting roof drainage to a separate storm drainage system. This is the MOST frequently tested sanitation code provision on the ALE.`,
      raw: `<LawCallout code="nbcp">\n\nPD 1096 Rule IX Sec. 904: "Rainwater drainage shall NOT discharge to the sanitary sewer system." This prohibition is absolute — no exceptions for sewer capacity, city engineer approval, or any other factor. A building with this cross-connection cannot receive a Certificate of Occupancy. The correct remedy is rerouting roof drainage to a separate storm drainage system. This is the MOST frequently tested sanitation code provision on the ALE.\n\n</LawCallout>`,
      insertion_marker: '## Legal Framework',
    },
  ],

  'af2b1d22-cbc5-46bf-9b22-408e32f08f91': [ // Spanish Colonial Bahay na Bato — has 3 blocks
    {
      component_name: 'Note',
      props: {},
      children_raw: `**Exam Note:** The ZEScuVA mnemonic covers the six vertical layers from bottom to top: Zaguan (ground-floor carriage entrance) → Entresuelo (mezzanine) → Sala (main living floor) → Cuartos (bedrooms) → Volada (cantilevered balcony) → Azotea (open terrace/roof). A related term: ventanilla = the capiz-shell sliding window panel BELOW the main window, used for ventilation even when the main window is closed.`,
      raw: `<Note>\n\n**Exam Note:** The ZEScuVA mnemonic covers the six vertical layers from bottom to top: Zaguan (ground-floor carriage entrance) → Entresuelo (mezzanine) → Sala (main living floor) → Cuartos (bedrooms) → Volada (cantilevered balcony) → Azotea (open terrace/roof). A related term: ventanilla = the capiz-shell sliding window panel BELOW the main window, used for ventilation even when the main window is closed.\n\n</Note>`,
      insertion_marker: '### Scale and Structure',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Mistake:** Confusing the bahay na bato's zaguan with the bahay kubo's silong. Zaguan = ENCLOSED stone ground floor (for carriages, processional floats). Silong = OPEN space under the raised bahay kubo (for storage, livestock). The bahay na bato's stone ground floor is fireproof and secure; the bahay kubo's raised floor is open and ventilated. They represent opposite solutions to ground-level space.`,
      raw: `<Warn>\n\n**Common Mistake:** Confusing the bahay na bato's zaguan with the bahay kubo's silong. Zaguan = ENCLOSED stone ground floor (for carriages, processional floats). Silong = OPEN space under the raised bahay kubo (for storage, livestock). The bahay na bato's stone ground floor is fireproof and secure; the bahay kubo's raised floor is open and ventilated. They represent opposite solutions to ground-level space.\n\n</Warn>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '1a46c0de-3c18-45bc-874e-6dce4f13f5fe': [ // Stages and Platforms — has 3 blocks
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "S-P-V = Stage, Platform, Ventilation."** Three code dimensions: Stage (defined per PD 1096 Rule XII — any platform > 1.0 m above floor with proscenium, regardless of use), Platform (elevated area < 1.0 m — fewer code requirements if not used for theatrical performance), Ventilation (stage ventilation area >= 5% of stage floor area within stage walls, excluding flyloft/rigging areas).`,
      raw: `<Tip>\n\n**Memory Anchor: "S-P-V = Stage, Platform, Ventilation."** Three code dimensions: Stage (defined per PD 1096 Rule XII — any platform > 1.0 m above floor with proscenium, regardless of use), Platform (elevated area < 1.0 m — fewer code requirements if not used for theatrical performance), Ventilation (stage ventilation area >= 5% of stage floor area within stage walls, excluding flyloft/rigging areas).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** The stage ventilation calculation tests whether you know the 5% rule applies within the STAGE WALLS only (enclosed stage area), NOT including the flyloft or rigging areas above. If a stage is 240 sq.m within the walls, ventilation required = 12 sq.m (5% of 240). Distractors use 3.33% (too low, for different building types) or round numbers near the correct answer.`,
      raw: `<ExamTip>\n\n**ALE Trap:** The stage ventilation calculation tests whether you know the 5% rule applies within the STAGE WALLS only (enclosed stage area), NOT including the flyloft or rigging areas above. If a stage is 240 sq.m within the walls, ventilation required = 12 sq.m (5% of 240). Distractors use 3.33% (too low, for different building types) or round numbers near the correct answer.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '36f5bf84-00c5-4534-a716-a05371ac8d23': [ // Standard Human Body Dimensions — has 3 blocks
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "E-R-W = Ergonomic Range + Wheelchair + Clearances."** Three anthropometric dimensions the ALE tests most: Ergonomic reach ranges (shelf height 400-1800 mm AFF, counter height 750-900 mm), Wheelchair dimensions (750-800 mm seat height, 1200 mm turning diameter, 900 mm forward reach), Clearances (door width 800 mm min, corridor 900 mm accessible minimum, 2100 mm headroom).`,
      raw: `<Tip>\n\n**Memory Anchor: "E-R-W = Ergonomic Range + Wheelchair + Clearances."** Three anthropometric dimensions the ALE tests most: Ergonomic reach ranges (shelf height 400-1800 mm AFF, counter height 750-900 mm), Wheelchair dimensions (750-800 mm seat height, 1200 mm turning diameter, 900 mm forward reach), Clearances (door width 800 mm min, corridor 900 mm accessible minimum, 2100 mm headroom).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Key Warning:** Human body dimension questions often disguise as "design reasoning" questions. The ALE may ask: "Why are countertops recommended at 750-900 mm height?" The correct answer references the 5th-95th percentile reach range of the Philippine adult population, not aesthetics or tradition. Always tie dimension questions back to anthropometric data — the code follows the human body, not the other way around.`,
      raw: `<Warn>\n\n**Key Warning:** Human body dimension questions often disguise as "design reasoning" questions. The ALE may ask: "Why are countertops recommended at 750-900 mm height?" The correct answer references the 5th-95th percentile reach range of the Philippine adult population, not aesthetics or tradition. Always tie dimension questions back to anthropometric data — the code follows the human body, not the other way around.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
  ],

  '5f1e960c-b72a-483d-a04b-03860d27b07b': [ // Bauhaus/International Style — has 3 blocks
    {
      component_name: 'Note',
      props: {},
      children_raw: `**Exam Note:** The Bauhaus was founded 1919 (Weimar), moved to Dessau 1925, closed under Nazi pressure 1933. Three directors: Walter Gropius (1919-1928, founder — "art and technology, a new unity"), Hannes Meyer (1928-1930, more leftist/functionalist), Ludwig Mies van der Rohe (1930-1933, shifted to architecture focus). The International Style was CODIFIED in the 1932 MoMA exhibition by Henry-Russell Hitchcock and Philip Johnson — distinct from the Bauhaus but deeply influenced by it.`,
      raw: `<Note>\n\n**Exam Note:** The Bauhaus was founded 1919 (Weimar), moved to Dessau 1925, closed under Nazi pressure 1933. Three directors: Walter Gropius (1919-1928, founder — "art and technology, a new unity"), Hannes Meyer (1928-1930, more leftist/functionalist), Ludwig Mies van der Rohe (1930-1933, shifted to architecture focus). The International Style was CODIFIED in the 1932 MoMA exhibition by Henry-Russell Hitchcock and Philip Johnson — distinct from the Bauhaus but deeply influenced by it.\n\n</Note>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'ExamTip',
      props: {},
      children_raw: `**ALE Trap:** "The Bauhaus and the International Style are the same thing" — FALSE. The Bauhaus was a GERMAN SCHOOL (1919-1933) that taught all arts and crafts. The International Style is a STYLE CLASSIFICATION (codified 1932 by Hitchcock and Johnson for a MoMA exhibition). The Bauhaus influenced the International Style, but they are not synonymous — Gropius, Breuer, and Mies were Bauhaus figures who later practiced International Style, but many International Style architects (e.g., Le Corbusier) had no Bauhaus connection.`,
      raw: `<ExamTip>\n\n**ALE Trap:** "The Bauhaus and the International Style are the same thing" — FALSE. The Bauhaus was a GERMAN SCHOOL (1919-1933) that taught all arts and crafts. The International Style is a STYLE CLASSIFICATION (codified 1932 by Hitchcock and Johnson for a MoMA exhibition). The Bauhaus influenced the International Style, but they are not synonymous — Gropius, Breuer, and Mies were Bauhaus figures who later practiced International Style, but many International Style architects (e.g., Le Corbusier) had no Bauhaus connection.\n\n</ExamTip>`,
      insertion_marker: '## LEA Exam Traps',
    },
  ],

  '4aa53e66-6e93-44c1-804b-59f5e19bfda6': [ // Vent Shafts — has 3 blocks
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "S-M-D = Shaft, Minimum, Dimension."** Three code requirements for ventilation shafts per PD 1096 Sec. 809-a: Shaft area = 0.10 sq.m × building height in meters (the formula), Minimum area of 1.00 sq.m (if formula result is lower), Minimum least Dimension of 600 mm (absolute minimum side dimension, regardless of area). The formula governs only when its result exceeds the absolute minimum of 1.00 sq.m.`,
      raw: `<Tip>\n\n**Memory Anchor: "S-M-D = Shaft, Minimum, Dimension."** Three code requirements for ventilation shafts per PD 1096 Sec. 809-a: Shaft area = 0.10 sq.m × building height in meters (the formula), Minimum area of 1.00 sq.m (if formula result is lower), Minimum least Dimension of 600 mm (absolute minimum side dimension, regardless of area). The formula governs only when its result exceeds the absolute minimum of 1.00 sq.m.\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Mistake:** Using the horizontal air duct minimum dimension (300 mm) for a vertical ventilation shaft. These are different code provisions: vertical shafts = minimum 600 mm least dimension per Sec. 809-a; horizontal air ducts = minimum 300 mm least dimension per a different provision. Applying the wrong minimum is a classic exam distractor. Ventilation shaft area formula: 0.10 sq.m × building height (m), minimum 1.00 sq.m absolute.`,
      raw: `<Warn>\n\n**Common Mistake:** Using the horizontal air duct minimum dimension (300 mm) for a vertical ventilation shaft. These are different code provisions: vertical shafts = minimum 600 mm least dimension per Sec. 809-a; horizontal air ducts = minimum 300 mm least dimension per a different provision. Applying the wrong minimum is a classic exam distractor. Ventilation shaft area formula: 0.10 sq.m × building height (m), minimum 1.00 sq.m absolute.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
  ],

  // === 1-block articles ===
  '66b5fe8b-8fda-4483-aa77-37d52adec286': [ // Vertical Openings — has 1 block
    {
      component_name: 'Tip',
      props: {},
      children_raw: `**Memory Anchor: "S-F-W = Shaft, Floor opening, Wall opening."** Three categories of vertical openings regulated by PD 1096 Rule XII: Shafts (ventilation shafts, elevator shafts — fire-rated enclosure required), Floor openings (atriums, stairwells — require fire-rated shaft or 1-hour enclosure), Wall openings (windows, doors in fire-rated walls — limited to 25% of wall length for 3-hour walls, max 10 sq.m per opening).`,
      raw: `<Tip>\n\n**Memory Anchor: "S-F-W = Shaft, Floor opening, Wall opening."** Three categories of vertical openings regulated by PD 1096 Rule XII: Shafts (ventilation shafts, elevator shafts — fire-rated enclosure required), Floor openings (atriums, stairwells — require fire-rated shaft or 1-hour enclosure), Wall openings (windows, doors in fire-rated walls — limited to 25% of wall length for 3-hour walls, max 10 sq.m per opening).\n\n</Tip>`,
      insertion_marker: '## Core Concepts and Memory Aid',
    },
    {
      component_name: 'Warn',
      props: {},
      children_raw: `**Common Mistake:** Confusing the 25% limit on openings in 3-hour fire walls. The 25% is measured by LENGTH of the wall (not area). If a wall is 20 m long, aggregate openings must not exceed 5 m of that length. Additionally, no single opening may exceed 10 sq.m. A 12 sq.m double door violates the single-opening maximum even if the aggregate length is under 25%. Both limits must be checked independently.`,
      raw: `<Warn>\n\n**Common Mistake:** Confusing the 25% limit on openings in 3-hour fire walls. The 25% is measured by LENGTH of the wall (not area). If a wall is 20 m long, aggregate openings must not exceed 5 m of that length. Additionally, no single opening may exceed 10 sq.m. A 12 sq.m double door violates the single-opening maximum even if the aggregate length is under 25%. Both limits must be checked independently.\n\n</Warn>`,
      insertion_marker: '## The Hard Data',
    },
    {
      component_name: 'LawCallout',
      props: { code: 'nbcp' },
      children_raw: `Per PD 1096 Sec. 809-a: Ventilation shaft cross-sectional area = 0.10 sq.m × (building height in meters), with an absolute minimum of 1.00 sq.m. Minimum least dimension = 600 mm. For a 16.50 m building: area = 1.65 sq.m (> 1.00 sq.m minimum, so the formula governs). This is the most common exam calculation for vertical openings — memorize the formula and the minimums.`,
      raw: `<LawCallout code="nbcp">\n\nPer PD 1096 Sec. 809-a: Ventilation shaft cross-sectional area = 0.10 sq.m × (building height in meters), with an absolute minimum of 1.00 sq.m. Minimum least dimension = 600 mm. For a 16.50 m building: area = 1.65 sq.m (> 1.00 sq.m minimum, so the formula governs). This is the most common exam calculation for vertical openings — memorize the formula and the minimums.\n\n</LawCallout>`,
      insertion_marker: '## Legal Foundation',
    },
  ],
}

async function processArticle(articleDir) {
  const dirName = path.basename(articleDir)
  const articleId = dirName.match(/--([a-f0-9-]+)$/)?.[1]
  if (!articleId) return console.log(`✗ Could not extract ID from ${dirName}`)

  const normalizedPath = path.join(articleDir, 'normalized.md')
  const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
  if (!existsSync(normalizedPath)) return console.log(`✗ Missing normalized.md in ${dirName}`)
  if (!existsSync(uiBlocksPath)) return console.log(`✗ Missing ui-blocks.json in ${dirName}`)

  const normalized = await readFile(normalizedPath, 'utf-8')
  const uiBlocks = JSON.parse(await readFile(uiBlocksPath, 'utf-8'))

  const specs = ARTICLE_SPECS[articleId]
  if (!specs) return console.log(`○ No specs for ${dirName}, skipping`)

  let updatedNormalized = normalized
  const updatedBlocks = [...uiBlocks.blocks]

  for (const spec of specs) {
    const blockId = nextBlockId(updatedBlocks)
    const block = makeBlock(blockId, spec)
    updatedBlocks.push(block)

    // Find insertion point in normalized.md
    const marker = spec.insertion_marker
    const idx = updatedNormalized.indexOf(marker)
    if (idx !== -1) {
      // Insert after the marker line's newline
      const afterNewline = updatedNormalized.indexOf('\n', idx)
      const insertAt = afterNewline !== -1 ? afterNewline + 1 : updatedNormalized.length
      const before = updatedNormalized.substring(0, insertAt)
      const after = updatedNormalized.substring(insertAt)
      updatedNormalized = before + '\n' + block.placeholder + '\n\n' + after
    } else {
      // Fallback: append before the last --- separator
      const sepIdx = updatedNormalized.lastIndexOf('\n---\n')
      if (sepIdx !== -1) {
        const before = updatedNormalized.substring(0, sepIdx)
        const after = updatedNormalized.substring(sepIdx)
        updatedNormalized = before + '\n\n' + block.placeholder + '\n' + after
      } else {
        updatedNormalized = updatedNormalized + '\n\n---\n\n' + block.placeholder + '\n'
      }
    }
  }

  // Update hashes
  const newHash = sha256(updatedNormalized).replace('sha256:', '')
  const uiBlocksHash = sha256(JSON.stringify(updatedBlocks))

  uiBlocks.normalized_content_hash = newHash
  uiBlocks.blocks = updatedBlocks
  uiBlocks.ui_block_count = updatedBlocks.length
  uiBlocks.total_blocks = updatedBlocks.length
  uiBlocks.ui_blocks_hash = uiBlocksHash

  await writeFile(normalizedPath, updatedNormalized, 'utf-8')
  await writeFile(uiBlocksPath, JSON.stringify(uiBlocks, null, 2), 'utf-8')

  console.log(`✓ ${dirName}: ${uiBlocks.blocks.length} → ${updatedBlocks.length} blocks`)

  // Run compose verification
  try {
    const out = execSync(
      `bun run content-audit:compose -- --article-id ${articleId} --overwrite`,
      { cwd: SLATECAMP_ROOT, encoding: 'utf-8', timeout: 60000 }
    )
    const lastLine = out.trim().split('\n').filter(l => l.trim()).slice(-1)[0]
    console.log(`  → Compose: ${lastLine}`)
  } catch (err) {
    const msg = err.stdout || err.message || String(err)
    console.error(`  → Compose ERROR: ${msg.substring(0, 200)}`)
  }
}

async function main() {
  const entries = await readdir(ARTICLES_ROOT, { withFileTypes: true })

  // Articles with 7+ blocks already have sufficient coverage; skip those
  const skipIds = ['571e1d4f', 'dc69faa6', '7a3b0ff7', '3a2cd639']

  let processed = 0
  let skipped = 0

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const articleId = entry.name.match(/--([a-f0-9-]+)$/)?.[1]
    if (!articleId) continue

    if (skipIds.some(s => articleId.startsWith(s))) {
      console.log(`○ Already sufficient: ${entry.name}`)
      skipped++
      continue
    }

    const fullPath = path.join(ARTICLES_ROOT, entry.name)
    try {
      await processArticle(fullPath)
      processed++
    } catch (err) {
      console.error(`✗ Failed ${entry.name}: ${err.message}`)
    }
  }

  console.log(`\n=== Done: ${processed} processed, ${skipped} skipped ===`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
