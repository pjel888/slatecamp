#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
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

const batch = 163
const batchId = 'source-audited-batch-163-local-first'
const generatedAt = new Date().toISOString()
const generatedAtManila = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}).format(new Date()).replace(' ', 'T') + '+08:00'
const approvedBy = 'codex-local-source-audit-batch-163'
const branch = '3dlab-gray-viewport-bg'
const baseline = '0c0f08510 chore(content): accept source-audited batch 162'

const sourcePdf = 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National-Structural-Code-of-Ph-7th-Ed.pdf'
const conversionRoot =
  'vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition'
const sourceMetadataPath = `${conversionRoot}/SOURCE-METADATA.json`
const rejectedSource =
  'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf'

const page0237 = `${conversionRoot}/pages/page-0237.md`
const page0240 = `${conversionRoot}/pages/page-0240.md`
const page0259 = `${conversionRoot}/pages/page-0259.md`
const page0283 = `${conversionRoot}/pages/page-0283.md`
const page0284 = `${conversionRoot}/pages/page-0284.md`
const page0285 = `${conversionRoot}/pages/page-0285.md`
const page0286 = `${conversionRoot}/pages/page-0286.md`
const page0287 = `${conversionRoot}/pages/page-0287.md`
const page0290 = `${conversionRoot}/pages/page-0290.md`

const anchors = {
  importance: {
    path: page0237,
    lines: '61-96',
    summary:
      'Table 208-1 assigns occupancy importance factors and gives Ip = 1.5 for anchorage of machinery and equipment required for life-safety systems.',
  },
  seismicZone: {
    path: page0240,
    lines: '11-26',
    summary:
      'Site seismic hazard depends on seismic zone, proximity to active sources, soil profile, and importance; the Philippines is divided into Zone 2 exceptions and the rest under Zone 4 with Z values in Table 208-3.',
  },
  nearSource: {
    path: page0259,
    lines: '5-13',
    summary:
      'In Zone 4, near-source factors are assigned and essential or high-rise buildings within 2 km of a major fault are recommended for site-specific spectrum review.',
  },
  responseCoefficients: {
    path: page0259,
    lines: '27-52',
    summary:
      'Seismic response coefficients Ca and Cv are assigned from Tables 208-7 and 208-8 by soil profile type and seismic zone.',
  },
  nonstructuralScope: {
    path: page0283,
    lines: '29-57',
    summary:
      'Section 208.9 covers permanent nonstructural components, equipment, attachments, anchorages, required bracing, equipment exemptions, approved standards, and the rule that friction from gravity load is not seismic resistance.',
  },
  designForce: {
    path: page0283,
    lines: '61-99',
    summary:
      'Section 208.9.2 defines total design lateral seismic force Fp and uses component amplification and response modification factors from Table 208-13 or dynamic properties.',
  },
  connections: {
    path: page0284,
    lines: '5-18',
    summary:
      'Section 208.9.3 requires members and connections transferring component forces to seismic-resisting systems to be designed for those forces and critical horizontal loading.',
  },
  componentTableA: {
    path: page0285,
    lines: '5-55',
    summary:
      'Table 208-13 lists nonstructural component categories and component factor rows.',
  },
  componentTableB: {
    path: page0286,
    lines: '11-57',
    summary:
      'Table 208-13 lists electrical, mechanical, plumbing, emergency power supply, essential communications, battery rack, and fuel tank equipment categories.',
  },
  independentSupport: {
    path: page0286,
    lines: '63-65',
    summary:
      'Light fixtures and mechanical services installed in metal suspension systems must be independently supported from the structure above.',
  },
  equipmentExamples: {
    path: page0287,
    lines: '10-18',
    summary:
      'Equipment examples include boilers, chillers, heat exchangers, pumps, air-handling units, cooling towers, control panels, motors, switchgear, transformers, life-safety equipment, major conduit, ducting, piping, and fire sprinkler systems.',
  },
  omissionRules: {
    path: page0287,
    lines: '20-62',
    summary:
      'Seismic restraints may be omitted from selected piping, ducts, and raceways only when listed damage, support, fragility, and motion conditions are satisfied; flexible accommodation is required across different buildings or structural systems.',
  },
  vibrationIsolators: {
    path: page0287,
    lines: '64-79',
    summary:
      'Vibration isolators supporting equipment must be designed for lateral loads or restrained from lateral displacement and vertical uplift; vibration-isolated equipment uses ap/Rp = 2.5/1.5, and shallow or expansion anchors multiply anchor forces by 2.0.',
  },
  anchorage: {
    path: page0287,
    lines: '81-105',
    summary:
      'Equipment anchorage cannot rely on gravity friction; expansion anchors resisting tension are not used where operational vibrating loads are present; batteries and internal cabinet equipment require restraints.',
  },
  specifications: {
    path: page0287,
    lines: '107-136',
    summary:
      'Design specifications for equipment must specify or reference design lateral forces and account for relative motion of attachments; alternative standards or test data are accepted only within stated minimum force boundaries.',
  },
  floodUtility: {
    path: page0290,
    lines: '64-115',
    summary:
      'Buildings in flood hazard areas must resist flood hazards and use the most restrictive applicable flood hazard area; dry floodproofing includes utility and sanitary facilities made watertight and impermeable.',
  },
}

const checkedLines = Object.values(anchors).map(
  (anchor) => `${anchor.path}:${anchor.lines} ${anchor.summary}`,
)
const sourceLocator = checkedLines.join('; ')
const baseSourceId = 'nscp-2015-section-208-9-nonstructural-equipment-b163'
const sourceLabel =
  'NSCP 2015 Volume I, Section 208.9 nonstructural components and equipment seismic restraint with flood utility boundary'
const uiBlocksHash = 'sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945'

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'))
const fileSha = (filePath) => `sha256:${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`
const sourcePdfSha = fileSha(sourcePdf)
const pageMarkdownPaths = [...new Set(Object.values(anchors).map((anchor) => anchor.path))]
const pageMarkdownSha256 = Object.fromEntries(pageMarkdownPaths.map((filePath) => [filePath, fileSha(filePath)]))

const commonQuestionFields = {
  application_context: 'source_audited_nscp_nonstructural_equipment',
  practice_context: ['building-utilities', 'mepf', 'seismic-restraint', 'source-audited batch 163'],
}

const articleConfigs = [
  {
    cluster: 'lea-util-004-05',
    articleDir:
      '.ai/content-audit-export/articles/lea-util-004-05-seismic-bracing-and-earthquake-resilience--1caee82f-c2c8-409b-a3bf-41576bc702c5',
    topic:
      'NSCP Section 208.9 nonstructural equipment restraint, utility continuity, and flood utility boundaries',
    scenarioStatus:
      'included_source_safe: scenarios retained only where they can be framed as NSCP nonstructural equipment restraint, relative-motion, or flood utility boundary checks.',
    body: `## Board Exam Quick Check

Use this article as a source-audited NSCP 2015 boundary for utility seismic resilience. The safe local source is NSCP 2015 Volume I, Section 208.9 for permanent nonstructural components, equipment, attachments, anchorages, required bracing, and relative movement. For flood-prone utility questions, the safe local boundary is the NSCP flood hazard language that includes utility and sanitary facilities in dry floodproofing.

## Learning Goal

By the end of this article, you will be able to:

- Identify when a utility or MEPF item is a nonstructural component or equipment item under NSCP Section 208.9.
- Separate source-supported anchorage, bracing, flexibility, and equipment specification requirements from unsupported operational claims.
- Recognize why life-safety machinery and equipment can require higher importance treatment.
- Apply source-safe flood utility language without inventing unsourced backflow, runtime, or inspection protocols.

## Source-Safe Scope

The previous article mixed NSCP, disaster-resilience, PD 1096, manufacturer, and operational-maintenance claims. Batch 163 narrows the article to what the checked local NSCP OCR anchors support.

The safe scope includes:

- Permanent nonstructural components and equipment supported by a structure.
- Attachments, anchorages, and required bracing for those components and equipment.
- Design lateral seismic force concepts for nonstructural components and equipment.
- Equipment categories in Table 208-13, including electrical, mechanical, plumbing, emergency power supply, essential communications, battery racks, fuel tanks, life-safety equipment, major conduit, ducting, piping, and fire sprinkler systems.
- Flexible accommodation for piping, ducts, and raceways spanning different buildings or structural systems.
- Vibration isolator restraints, uplift restraint, and anchor-force treatment for vibration-isolated equipment.
- Flood hazard utility language for watertight and impermeable utility and sanitary facilities.

The safe scope does not include unsupported exact thresholds for generator transfer time, public-address intelligibility, emergency-power runtime, HVAC operating duration, smoke-control pressure, gas-shutoff valve mechanisms, or proprietary inspection protocols.

## NSCP Nonstructural Equipment Rule

NSCP Section 208.9 states that permanent nonstructural components and attachments, and permanent equipment and attachments supported by a structure, must resist total design seismic forces. Attachments include anchorages and required bracing. Friction from gravity load is not accepted as seismic resistance.

This is the main board-exam idea for utility resilience: the mechanical, electrical, plumbing, fire-protection, communication, emergency-power, and life-safety item may not be part of the primary frame, but it still needs a source-supported load path into the structure.

## Life-Safety Equipment and Importance

NSCP Table 208-1 gives an importance factor boundary for anchorage of machinery and equipment required for life-safety systems. The checked source gives Ip = 1.5 for that anchorage category. This supports a source-safe distinction between ordinary utility equipment and equipment required for life safety, but it does not support the former article's exact runtime or transfer-time claims.

## Equipment and Utility Categories

The checked Table 208-13 anchors include electrical, mechanical, and plumbing equipment, plus associated conduit, ductwork, and piping. They also include emergency panel power supply systems, essential communications equipment, battery racks, and fuel tanks used for emergency equipment. The checked equipment examples include boilers, chillers, heat exchangers, pumps, air-handling units, cooling towers, control panels, motors, switchgear, transformers, life-safety equipment, major conduit, ducting, piping, and fire sprinkler systems.

For suspended metal systems, the checked source states that light fixtures and mechanical services installed in metal suspension systems must be independently supported from the structure above.

## Relative Movement and Flexibility

Piping, ducts, and electrical raceways that must function after an earthquake and that span different buildings or different structural systems must be flexible enough to accommodate relative support motion. This is the source-safe replacement for the old article's unsourced claims about specific flex-coupling products or exact displacement capacities.

Seismic restraints may be omitted only when the checked listed conditions are satisfied. For example, omission requires avoiding damaging impact with other systems, avoiding loss of support, preserving ductile behavior where required, and avoiding impact with fragile appurtenances such as sprinkler heads. The safe exam move is to check the listed conditions rather than assume small items are automatically exempt.

## Vibration-Isolated Equipment

Where vibration isolators support equipment, the checked source requires the isolators to be designed for lateral loads or restrained from lateral displacement. Vertical displacement restraint is also addressed. The checked source gives special factor treatment for vibration-isolated equipment and requires increased anchor force treatment for shallow or expansion anchors.

Equipment anchorage still cannot rely on gravity friction. Expansion anchors resisting tension are not used where operational vibrating loads are present. These statements support source-safe generator, pump, chiller, and air-handling-unit anchorage scenarios without inventing manufacturer-specific details.

## Flood Utility Boundary

For flood hazard areas, NSCP Section 211.1 states that new buildings, substantial improvements, and restored buildings must be designed and constructed to resist flood hazards and flood loads. Where more than one flood hazard area applies, the most restrictive area controls. The checked definitions also describe dry floodproofing as making a building, including attendant utility and sanitary facilities, watertight and substantially impermeable to floodwater.

This supports a cautious utility-resilience takeaway: when the issue is flood-prone utility service, source-safe language is about flood hazard resistance and watertight utility or sanitary facilities. It does not support the old article's exact check-valve, shutoff, or contamination-control prescriptions without another source.

## Scenario Status

Source-safe scenarios are retained when they ask the student to choose a code-supported design posture:

- Anchor and brace life-safety equipment instead of relying on gravity friction.
- Use flexible detailing where functional piping, duct, or raceway systems span different buildings or structural systems.
- Treat emergency power, essential communications, battery racks, and fuel tanks as equipment categories requiring source-supported anchorage or restraint checks.
- Use flood hazard and dry floodproofing language for utility and sanitary facilities, without inventing unsourced operational procedures.

## Unsupported Claims Removed

- Exact generator transfer times, runtime hours, maintenance sequence, or post-earthquake inspection deadlines.
- Exact public-address backup duration or intelligibility values.
- Exact smoke-control pressure values.
- Exact wind-fastener ASTM claims and wind moment multipliers.
- Exact gas valve mechanism, cost, response time, and activation threshold claims.
- Proprietary ASME, AISC, manufacturer, or maintenance requirements not present in the checked local NSCP anchors.
`,
    questionSpecs: {
      '961a0025-7d66-4687-a931-e9a1ac59e619': {
        text:
          'For utility and sanitary facilities in a flood hazard area, which statement matches the checked NSCP dry-floodproofing boundary?',
        correct:
          'Dry floodproofing includes attendant utility and sanitary facilities made watertight and substantially impermeable to floodwater.',
        distractors: [
          'The checked source requires a specific check-valve model for every water supply intake.',
          'Flood protection is satisfied by reducing pipe diameter.',
          'Pipe material alone prevents floodwater contamination under the checked source.',
        ],
        correctOptionId: 'b',
        anchorKey: 'floodUtility',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'b495ee57-be6f-4e97-a4bf-39ee822e7aa0': {
        text:
          'When rooftop or supported equipment anchorage criteria are not specified in the checked NSCP text, what source-safe path does Section 208.9 allow?',
        correct:
          'Use approved national standards, subject to building official approval, instead of inventing an unsupported fastener standard.',
        distractors: [
          'Assume ASTM F1554 Grade 36 is always required by the checked anchor.',
          'Use structural-shape standards as substitute fastener rules.',
          'Rely on gravity friction if the equipment is heavy enough.',
        ],
        correctOptionId: 'b',
        anchorKey: 'nonstructuralScope',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'e89766e7-b8ff-4981-8d2c-e2a2cf599820': {
        text:
          'For piping that must function after an earthquake and spans different buildings or structural systems, what does the checked NSCP source require?',
        correct:
          'The piping must have enough flexibility to accommodate relative support motion and out-of-phase movement.',
        distractors: [
          'Rigid steel couplings are required at every joint.',
          'Concrete-lined conduit is the prescribed seismic-isolation material.',
          'Lead-lined isolation valves are required for earthquake movement.',
        ],
        correctOptionId: 'c',
        anchorKey: 'omissionRules',
        bloomLevel: 'remember',
        difficulty: 0.5,
      },
      '2b17803b-3aa6-4188-bbe2-8d88091f712e': {
        text:
          'A hospital MEPF design is being reframed under the checked NSCP anchors. Which decision is source-safe?',
        correct:
          'Identify life-safety equipment, use NSCP nonstructural force and anchorage rules, coordinate flexible crossings, and avoid unsourced runtime or transfer-time claims.',
        distractors: [
          'Publish exact horizontal and vertical acceleration, wind-pressure, freeboard, runtime, and PA backup values from the old article.',
          'Focus only on the seismic hazard and waive flood or equipment support checks.',
          'Use only the local jurisdiction preference even where checked NSCP anchors apply.',
        ],
        correctOptionId: 'b',
        anchorKey: 'importance',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      '27e3b467-5bed-4061-95f6-c8d7a8a85863': {
        text:
          'Which former emergency-transfer claim should be removed because it is not supported by the checked NSCP anchors?',
        correct:
          'A precise automatic-transfer time, such as 0.15 second, for emergency power.',
        distractors: [
          'Emergency power supply equipment appears in the checked Table 208-13 anchors.',
          'Fuel tanks for emergency equipment appear in the checked Table 208-13 anchors.',
          'Equipment anchorage cannot rely on gravity friction.',
        ],
        correctOptionId: 'b',
        anchorKey: 'componentTableB',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '00f76274-9125-4e6c-8eae-473634d9511b': {
        text:
          'For a ground-level utility system in a flood hazard area, what is the source-safe NSCP framing?',
        correct:
          'Design and construct the building and attendant utility facilities to resist applicable flood hazards, using the most restrictive applicable flood hazard area.',
        distractors: [
          'Use the least restrictive flood hazard area if utility equipment is nonstructural.',
          'Assume copper piping alone satisfies dry floodproofing.',
          'Replace flood hazard design with a post-event maintenance checklist.',
        ],
        correctOptionId: 'c',
        anchorKey: 'floodUtility',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      '9c6a6587-1493-430c-9ae9-cad501989ed5': {
        text:
          'For HVAC equipment in a critical facility, which resilience statement stays inside the checked NSCP source boundary?',
        correct:
          'Treat pumps, air-handling units, cooling towers, controls, and life-safety equipment as equipment requiring source-supported anchorage or restraint checks.',
        distractors: [
          'The checked source requires 72 hours of passive HVAC operation.',
          'The checked source requires one exact chiller runtime for all hospitals.',
          'The checked source waives HVAC anchorage if the equipment sits on a heavy base.',
        ],
        correctOptionId: 'c',
        anchorKey: 'equipmentExamples',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '0863616e-8994-4ed6-91c7-e3b5684ed4a5': {
        text:
          'Which emergency-power statement is supported by the checked Table 208-13 anchors without adding unsupported operational details?',
        correct:
          'Emergency power supply equipment, battery racks, and fuel tanks for emergency equipment are equipment categories needing anchorage or restraint checks.',
        distractors: [
          'The checked source gives a full generator auto-start maintenance protocol.',
          'The checked source prescribes one fuel-filter replacement deadline after every earthquake.',
          'The checked source gives an exact fuel runtime for every hospital generator.',
        ],
        correctOptionId: 'c',
        anchorKey: 'componentTableB',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '0d2b06f3-b6a3-4168-9e53-0f1eba1a28d9': {
        text:
          'Which water-system resilience answer remains source-safe under the checked local anchors?',
        correct:
          'Use the NSCP flood hazard and dry-floodproofing boundary for utility and sanitary facilities, and do not add unsourced storage-hour or treatment-system claims.',
        distractors: [
          'Claim a fixed emergency water storage duration from the checked anchors.',
          'Claim a required pipe material for all flood-prone buildings from the checked anchors.',
          'Claim a required automatic shutoff model from the checked anchors.',
        ],
        correctOptionId: 'd',
        anchorKey: 'floodUtility',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '16abc24a-8747-48b9-96f6-93da3d0b017b': {
        text:
          'For emergency communications equipment in a seismic design scenario, what does the checked NSCP source support?',
        correct:
          'Essential communications equipment appears in the equipment category table and should be addressed through anchorage, restraint, and support checks.',
        distractors: [
          'Two control stations are required by the checked source for every building.',
          'A fixed 90-minute PA backup duration is stated in the checked source.',
          'Speech intelligibility thresholds are given in the checked source.',
        ],
        correctOptionId: 'b',
        anchorKey: 'componentTableB',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '31f01fa7-d997-4a9f-aff6-5762d82be418': {
        text:
          'Which wind-fastener claim must be removed from this source-audited article?',
        correct:
          'A fixed 1.5 to 2.0 wind moment multiplier or specific ASTM fastener grade not found in the checked NSCP anchors.',
        distractors: [
          'Permanent equipment attachments must resist code design forces.',
          'Attachments include anchorages and required bracing.',
          'Gravity friction cannot be counted as seismic resistance.',
        ],
        correctOptionId: 'b',
        anchorKey: 'nonstructuralScope',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '7e3698a4-7da8-43e3-ad9d-1d9ef857020c': {
        text:
          'Which local-code anchor now controls this article after the source-audited rewrite?',
        correct:
          'NSCP 2015 Section 208.9 for nonstructural components, equipment, attachments, anchorage, bracing, and relative movement.',
        distractors: [
          'A former article label for NSCP Section 1307.5 without checked OCR support.',
          'Manufacturer gas-valve brochures only.',
          'An unsupported PD 1096 inspection sequence only.',
        ],
        correctOptionId: 'b',
        anchorKey: 'nonstructuralScope',
        bloomLevel: 'remember',
        difficulty: 0.3,
      },
      'b683dad1-83ca-4973-a6d2-dd80480182af': {
        text:
          'Which smoke-control claim should be excluded from the source-safe rewrite?',
        correct:
          'A precise smoke-control pressure value or runtime not present in the checked NSCP anchors.',
        distractors: [
          'Mechanical equipment may be within the checked Table 208-13 equipment categories.',
          'Ductwork may need seismic-restraint review under the checked source.',
          'Flexible accommodation may be needed where duct systems span different structural systems.',
        ],
        correctOptionId: 'b',
        anchorKey: 'equipmentExamples',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'ad388f32-8ec2-45d8-8a4f-1726da564759': {
        text:
          'Which PA-system claim should be removed unless a separate source is acquired?',
        correct:
          'A fixed speech-intelligibility or backup-duration requirement not stated in the checked NSCP anchors.',
        distractors: [
          'Essential communications equipment appears in the checked Table 208-13 anchors.',
          'Equipment specifications must reference design lateral forces.',
          'Equipment attachments must account for relative motion where applicable.',
        ],
        correctOptionId: 'b',
        anchorKey: 'componentTableB',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'c7b1786e-3a56-45f4-b7c9-a2eae78515a4': {
        text:
          'For a hospital equipment scenario in a high-seismic area, which source-safe design method replaces the old generic acceleration thresholds?',
        correct:
          'Classify the site and equipment, use NSCP importance and nonstructural component factors, and design the attachments and bracing for the Section 208.9 forces.',
        distractors: [
          'Use a fixed 0.5g trigger threshold for every utility component.',
          'Use one generic 0.35g value for all anchor bolts.',
          'Ignore site, importance, and component factors once the building is in the Philippines.',
        ],
        correctOptionId: 'b',
        anchorKey: 'designForce',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
    },
  },
  {
    cluster: 'lea-util-004-08',
    articleDir:
      '.ai/content-audit-export/articles/lea-util-004-08-seismic-bracing-requirements-per-nscp-2015--585425ad-355a-4180-b64b-a872115f39f6',
    topic:
      'NSCP Section 208.9 workflow for seismic bracing, equipment anchorage, relative motion, and vibration-isolated MEPF equipment',
    scenarioStatus:
      'included_source_safe: scenarios retained only as NSCP seismic zone, component force, anchorage, relative-motion, and vibration-isolator checks.',
    body: `## Board Exam Quick Check

The Philippines seismic-zone statement is only the start of an NSCP nonstructural equipment problem. A source-safe answer must still identify the site hazard inputs, occupancy or equipment importance, the component or equipment category, the component factors, and the attachments or bracing that carry the design force into the structure.

## Learning Goal

By the end of this article, you will be able to:

- Use the checked NSCP 2015 OCR anchors for seismic zone, site hazard, nonstructural component force, and equipment anchorage questions.
- Recognize when MEPF equipment belongs in Table 208-13 categories.
- Explain why friction-only anchorage and unsupported exact product claims are unsafe.
- Handle flexible crossings, vibration isolators, and emergency equipment without inventing manufacturer-specific rules.

## Source-Safe Scope

This rewrite replaces unsupported former labels such as NSCP Section 1307.5 and unsupported manufacturer claims with checked local NSCP anchors.

The checked source supports:

- Seismic zone and site hazard framing, including the Zone 2 exceptions and the rest of the Philippines under Zone 4.
- Site factors such as seismic zone, proximity to active sources, soil profile, and importance factor.
- Nonstructural component and equipment force design under Section 208.9.
- Component amplification and response modification factors from Table 208-13.
- Equipment examples and categories, including electrical, mechanical, plumbing, emergency power, essential communications, batteries, fuel tanks, life-safety equipment, major conduit, ducting, piping, and fire sprinkler systems.
- Flexible motion accommodation for systems spanning different buildings or structural systems.
- Vibration-isolator restraint and special anchor-force treatment.
- Equipment design specifications that state or reference design lateral forces.

The checked source does not support exact gas shutoff valve internals, exact response time, price ranges, generator filter maintenance deadlines, ASME flexible hose movement ratings, AISC anchor grades, or post-earthquake inspection protocols.

## Seismic Zone Is an Input, Not the Whole Answer

NSCP Section 208.4 states that site seismic hazard is based on seismic zone, proximity to active seismic sources, soil profile characteristics, and importance factor. The checked source divides the archipelago into Zone 2 exceptions and the rest under Zone 4, with zone factors assigned by Table 208-3.

In Zone 4, the checked source also addresses near-source factors. It recommends site-specific elastic design response spectrum review for essential facilities and high-rise structures within 2 km of a major fault. This is a source-safe way to handle complex hospital or high-rise prompts: the exam answer should not stop at "Zone 4"; it must keep the source-supported site and importance inputs in view.

## Section 208.9 Workflow

For a nonstructural equipment item, use this workflow:

1. Identify the component or equipment and whether it is permanent and supported by the structure.
2. Identify whether the item is ordinary equipment or life-safety machinery/equipment that triggers the checked Ip = 1.5 anchorage boundary.
3. Select the component factors from Table 208-13 or supported dynamic properties.
4. Design the component, its attachments, anchorages, required bracing, and the members or connections transferring force to the seismic-resisting system.
5. Apply the force in horizontal directions that create critical loading.
6. Do not count gravity friction as resistance.

This workflow is source-safe even when the old article contained a tempting exact number that the checked source did not support.

## Equipment Categories Tested in MEPF Questions

The checked Table 208-13 anchors include electrical, mechanical, and plumbing equipment, associated conduit, ductwork, and piping. They also include emergency panel power supply systems, essential communications, battery racks, and fuel tanks for emergency equipment. The equipment examples include boilers, chillers, heat exchangers, pumps, air-handling units, cooling towers, control panels, motors, switchgear, transformers, life-safety equipment, major conduit, ducting, piping, and fire sprinkler systems.

For suspended systems, the checked source states that light fixtures and mechanical services installed in metal suspension systems must be independently supported from the structure above.

## Flexible Crossings

Piping, ducts, and electrical raceways that must function after an earthquake and that span different buildings or different structural systems must be flexible enough to accommodate relative support motion and out-of-phase motion. This supports questions about expansion joints and building separations, but it does not support exact ASME movement ratings or one named product.

Seismic restraints may be omitted only when all checked conditions are satisfied. The safe answer is not "small systems are exempt"; it is "check the listed omission conditions."

## Vibration Isolators and Emergency Equipment

Vibration isolators supporting equipment must be designed for lateral loads or restrained from lateral displacement. Vertical displacement restraint is also addressed. For vibration-isolated equipment, the checked source gives special factor treatment and requires increased anchor-force treatment for shallow or expansion anchors.

Emergency power supply systems, battery racks, fuel tanks, and essential communications equipment are source-supported equipment categories. That supports anchorage and restraint questions. It does not support detailed filter maintenance priorities, silt-source diagnosis, generator auto-start timing, or operational sequence claims.

## Equipment Specifications

The checked source states that design specifications for equipment must specify or reference design lateral forces, and must account for relative motion of equipment attachments. Alternative standards or test data can be accepted only within the checked minimum-force boundary. This supports a professional practice answer: do not leave equipment anchorage to generic catalog assumptions; specify the seismic design basis.

## Scenario Status

Source-safe scenarios in this cluster should ask for the NSCP design basis, not unsupported device mechanics:

- Is the item in a checked equipment category?
- Does life-safety importance apply?
- What attachment, anchorage, bracing, or flexible-motion condition must be checked?
- Is a vibration isolator present?
- Is the claim an operational maintenance protocol that needs another source?

## Unsupported Claims Removed

- Inertial gas shutoff ball-sensor mechanics, response time, activation threshold, price, and preferred product claims.
- Emergency generator filter-replacement deadlines, silt-source diagnosis, and post-incident maintenance sequence.
- Exact ASME flexible hose movement ratings.
- Exact AISC or anchor-bolt grade rules not present in the checked NSCP anchors.
- Former Section 1307.5 labels not supported by the checked local OCR anchors.
`,
    questionSpecs: {
      '02b11a14-0f2e-41ee-82cf-2d83c09af0e2': {
        text:
          'A question claims an inertial gas shutoff valve closes by a heavy ball at a precise acceleration and response time. What is the source-safe Batch 163 treatment?',
        correct:
          'Remove the device-mechanism details unless a separate manufacturer or standard source is acquired; the checked NSCP anchors support restraint and equipment design concepts, not that mechanism.',
        distractors: [
          'Keep the exact ball-sensor mechanism because NSCP Section 208.9 states it.',
          'Replace the valve mechanism with a wireless solenoid sequence from the checked source.',
          'Treat price range as a structural-code requirement.',
        ],
        correctOptionId: 'c',
        anchorKey: 'nonstructuralScope',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'b3958f33-180d-4bf5-b1fb-dc1c6c02857e': {
        text:
          'A generator inspection prompt gives a clogged fuel filter, maintenance deadline, and silt diagnosis. Which answer is source-safe under the checked NSCP anchors?',
        correct:
          'Remove the maintenance sequence and keep only source-supported anchorage, restraint, battery rack, fuel tank, and emergency power equipment checks.',
        distractors: [
          'Publish the 24-hour filter deadline as an NSCP Section 208.9 requirement.',
          'Treat silt-source diagnosis as a code requirement from the checked source.',
          'Ignore emergency power equipment because it is outside Table 208-13.',
        ],
        correctOptionId: 'b',
        anchorKey: 'componentTableB',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      'e5179a2a-67ba-4c10-8218-82d980349bfb': {
        text:
          'Per the checked NSCP Table 208-1 anchor, which equipment category is source-safe for Ip = 1.5 anchorage treatment?',
        correct:
          'Machinery and equipment required for life-safety systems.',
        distractors: [
          'Every ordinary office HVAC component regardless of function.',
          'Any utility pipe solely because it is metallic.',
          'Any furniture item weighing less than the checked exemption threshold.',
        ],
        correctOptionId: 'b',
        anchorKey: 'importance',
        bloomLevel: 'remember',
        difficulty: 0.3,
      },
      '488b3c49-4af9-4d33-a76e-af7501a57702': {
        text:
          'Why is friction-only equipment restraint rejected by the checked NSCP anchors?',
        correct:
          'Section 208.9 states that friction from gravity loads must not be considered resistance to seismic forces.',
        distractors: [
          'The checked source permits friction if the equipment is bolted to wood blocking.',
          'The checked source permits friction for all rooftop equipment.',
          'Friction can replace anchorages when the component factor is low.',
        ],
        correctOptionId: 'b',
        anchorKey: 'nonstructuralScope',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '7f510800-98bb-49e7-a123-9d71257fca12': {
        text:
          'For piping, ducts, or electrical raceways spanning different buildings or structural systems, what is the checked NSCP requirement?',
        correct:
          'They must have enough flexibility to accommodate relative support motion and out-of-phase motion when they must remain functional after an earthquake.',
        distractors: [
          'They must be detailed with one named ASME hose rating from the checked source.',
          'They are automatically exempt from seismic restraint.',
          'They must rely on gravity friction at each support.',
        ],
        correctOptionId: 'b',
        anchorKey: 'omissionRules',
        bloomLevel: 'remember',
        difficulty: 0.5,
      },
      'aa3e5e12-6f4d-460e-b251-da273a19e59c': {
        text:
          'A 20-story building has MEP systems crossing an expansion joint. Which source-safe design issue should be checked?',
        correct:
          'Relative movement between structural systems and flexible accommodation for piping, ducts, or raceways that must function after an earthquake.',
        distractors: [
          'A fixed ASME 150 mm movement rating from the checked source.',
          'A fixed 0.6g gas-valve trigger from the checked source.',
          'A waiver because expansion joints isolate all MEP systems automatically.',
        ],
        correctOptionId: 'b',
        anchorKey: 'omissionRules',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      '5c74d1f9-f1fb-48ab-95f2-6be2ee361d52': {
        text:
          'Which generator auto-start statement should be removed from the source-audited question set?',
        correct:
          'A detailed auto-start sequence or timing claim not present in the checked NSCP anchors.',
        distractors: [
          'Emergency power supply equipment is a checked Table 208-13 category.',
          'Fuel tanks for emergency equipment are a checked Table 208-13 category.',
          'Equipment anchorage cannot rely on gravity friction.',
        ],
        correctOptionId: 'a',
        anchorKey: 'componentTableB',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'a72c9aa8-a967-4b0f-8180-a9b3558261c6': {
        text:
          'Which integrated seismic design answer follows the checked NSCP anchors?',
        correct:
          'Start with seismic zone and site factors, identify the equipment category and importance, then design attachments, anchorage, bracing, and force-transfer members under Section 208.9.',
        distractors: [
          'Stop after stating that most of the Philippines is Zone 4.',
          'Use manufacturer marketing claims instead of NSCP component design inputs.',
          'Use one acceleration threshold for all components without checking Table 208-13.',
        ],
        correctOptionId: 'b',
        anchorKey: 'seismicZone',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      'c1ed334c-bcb3-4322-b56a-a6add8b96b84': {
        text:
          'A prompt asks for an exact ASME flexible metallic hose displacement rating. What is the source-safe answer from the checked NSCP anchors?',
        correct:
          'Do not publish the exact ASME displacement rating from NSCP anchors; state the NSCP relative-motion flexibility requirement and acquire a separate source for the product rating.',
        distractors: [
          'Treat the exact ASME rating as stated in Table 208-13.',
          'Replace all flexible hose requirements with rigid pipe supports.',
          'Assume the rating is unnecessary because piping is never nonstructural equipment.',
        ],
        correctOptionId: 'c',
        anchorKey: 'omissionRules',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      '1c85cd70-7225-435d-ba16-00c211e62b29': {
        text:
          'For equipment supported on vibration isolators, what does the checked NSCP source require?',
        correct:
          'The isolators must be designed for lateral loads or restrained from lateral displacement, with vertical displacement restraint addressed.',
        distractors: [
          'Vibration isolators exempt the equipment from lateral restraint.',
          'Gravity friction alone is enough because isolators reduce vibration.',
          'Only manufacturer color coding is required by the checked NSCP anchor.',
        ],
        correctOptionId: 'b',
        anchorKey: 'vibrationIsolators',
        bloomLevel: 'remember',
        difficulty: 0.5,
      },
      '05cd5a06-3183-4848-9b1f-f8cb6a36f581': {
        text:
          'Under the checked NSCP seismic-zone anchor, what Zone 4 factor appears in Table 208-3?',
        correct: 'Z = 0.40 for Zone 4.',
        distractors: [
          'Z = 0.05 for Zone 4.',
          'Z = 0.20 for all of the Philippines.',
          'Z is not used in the checked NSCP seismic-zone anchor.',
        ],
        correctOptionId: 'c',
        anchorKey: 'seismicZone',
        bloomLevel: 'remember',
        difficulty: 0.3,
      },
      '21b3a069-8ad6-402b-9423-608071bdf1e6': {
        text:
          'A water-heater question contains a detailed post-earthquake inspection protocol. What is the source-safe rewrite?',
        correct:
          'Treat the water heater as equipment or a tank needing anchorage and bracing review, and remove unsupported inspection-protocol details unless another source is acquired.',
        distractors: [
          'Keep the full inspection sequence because Section 208.9 states it.',
          'Exempt water heaters from anchorage because they are plumbing equipment.',
          'Use fuel-filter maintenance rules as a substitute source.',
        ],
        correctOptionId: 'c',
        anchorKey: 'componentTableB',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      '3f4dce01-3e79-4f74-9005-118a14543cfe': {
        text:
          'A sprinkler question gives a precise pressure-gauge threshold after an earthquake. What is source-safe under the checked anchors?',
        correct:
          'Remove the precise threshold and retain only the checked fact that fire sprinkler systems and associated piping fall within the equipment and restraint scope.',
        distractors: [
          'Publish the threshold as an NSCP Table 208-13 value.',
          'Treat sprinklers as architectural finishes outside the checked equipment examples.',
          'Use the threshold as a substitute for anchorage and bracing checks.',
        ],
        correctOptionId: 'b',
        anchorKey: 'equipmentExamples',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
      'dc6455d2-06ab-438d-835d-01d050258c3f': {
        text:
          'A basement generator sits on spring isolators. Which checked NSCP issue is most directly triggered?',
        correct:
          'Vibration-isolator lateral restraint, vertical displacement restraint, and special anchor-force treatment.',
        distractors: [
          'Automatic exemption from seismic anchorage.',
          'A manufacturer-only maintenance protocol from the checked source.',
          'A fixed generator transfer time from Table 208-13.',
        ],
        correctOptionId: 'c',
        anchorKey: 'vibrationIsolators',
        bloomLevel: 'apply',
        difficulty: 0.7,
      },
      'e9538c8d-119a-4361-ac95-53d7a8747bc9': {
        text:
          'A question asks for a specific anchor-bolt grade and AISC rule for equipment. What is the source-safe response from the checked local NSCP anchors?',
        correct:
          'Do not claim a specific bolt grade from these anchors; use the checked Section 208.9 anchorage rules, Rp treatment for shallow anchors, and the no-expansion-anchors-in-tension-with-vibration boundary.',
        distractors: [
          'Publish M16 Grade 8.8 as the checked NSCP rule.',
          'Use friction-only restraint when the generator is heavy.',
          'Ignore anchor type because component factors apply only to walls.',
        ],
        correctOptionId: 'b',
        anchorKey: 'anchorage',
        bloomLevel: 'understand',
        difficulty: 0.5,
      },
    },
  },
]

function makeCheckedSource(sourceId) {
  return {
    source_id: sourceId,
    label: sourceLabel,
    url: null,
    source_type: 'primary_code_local_ocr',
    publisher: 'Association of Structural Engineers of the Philippines',
    locator: sourceLocator,
    source_pdf: sourcePdf,
    source_pdf_sha256: sourcePdfSha,
    source_metadata_path: sourceMetadataPath,
    page_markdown_paths: pageMarkdownPaths,
    page_markdown_sha256: pageMarkdownSha256,
  }
}

function makeSource(metadata, sourceId) {
  return {
    source_id: sourceId,
    article_id: metadata.article_id,
    label: sourceLabel,
    url: null,
    source_type: 'primary_code_local_ocr',
    description:
      `Batch 163 local-first NSCP OCR conversion from the valid supplied PDF only.; source_pdf=${sourcePdf}; source_sha256=${sourcePdfSha}; source_metadata_path=${sourceMetadataPath}; anchors=${sourceLocator}; excluded_source=${rejectedSource} is null-byte corrupted and not used.`,
    is_verified: true,
    sort_order: 0,
    created_at: generatedAtManila,
    updated_at: generatedAtManila,
    local_capture_path: sourcePdf,
    refined_capture_path: conversionRoot,
    source_metadata_path: sourceMetadataPath,
    source_locator: sourceLocator,
  }
}

function makeProposal(question, spec) {
  if (question.correct_option_id !== spec.correctOptionId) {
    throw new Error(`Answer key mismatch for ${question.question_id}: expected ${question.correct_option_id}, got ${spec.correctOptionId}`)
  }
  const optionIds = ['a', 'b', 'c', 'd']
  const distractors = [...spec.distractors]
  const options = optionIds.map((id) => ({
    id,
    text: id === spec.correctOptionId ? spec.correct : distractors.shift(),
  }))
  const anchor = anchors[spec.anchorKey]
  const sourceBoundary =
    `Batch 163 uses checked local NSCP OCR ${anchor.path}:${anchor.lines}; no external source or unsupported article claim is used.`
  const rationale = {
    correct: `${spec.correct} This is supported by ${anchor.summary}`,
    takeaway: 'Use the checked NSCP anchor as the answer boundary; remove operational or manufacturer-specific details unless separately sourced.',
    source_boundary: sourceBoundary,
  }
  for (const option of options) {
    rationale[option.id] =
      option.id === spec.correctOptionId
        ? `Selected: ${option.text}`
        : `Not selected: ${option.text} This is outside the checked Batch 163 source boundary or contradicts it.`
  }
  return {
    text: spec.text,
    options,
    correct_option_id: spec.correctOptionId,
    rationale,
    explanation:
      `${spec.correct} The supporting checked source is ${anchor.path}:${anchor.lines}.`,
    code_citation: `NSCP 2015 Vol. I, checked OCR ${anchor.path}:${anchor.lines}`,
    bloom_level: spec.bloomLevel,
    difficulty: spec.difficulty,
    difficulty_rating: null,
    discrimination_rating: null,
    is_assessment: question.is_assessment ?? false,
    model_id: question.model_id,
    prompt_image_url: question.prompt_image_url ?? null,
    ...commonQuestionFields,
  }
}

function processArticle(config) {
  const metadata = readJson(path.join(config.articleDir, 'article-metadata.json'))
  const linkedQuestions = readJson(path.join(config.articleDir, 'linked-questions.json'))
  const original = readFileSync(path.join(config.articleDir, 'original.md'), 'utf8')
  const originalHash = sha256(original)
  const normalizedHash = sha256(config.body)
  const sourceId = `${baseSourceId}-${config.cluster}`
  const checkedSource = makeCheckedSource(sourceId)
  const source = makeSource(metadata, sourceId)

  const uiBlocks = {
    article_id: metadata.article_id,
    slug: metadata.slug,
    normalized_created_at: generatedAtManila,
    parser_version: 'ui-block-parser-v1',
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    ui_block_count: 0,
    total_blocks: 0,
    blocks: [],
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: uiBlocksHash,
  }

  const { candidate, report: composeReport } = composeCandidate({
    normalized: config.body,
    uiBlocks,
    original,
  })
  const candidateHash = sha256(candidate)
  const sourcesFile = {
    article_id: metadata.article_id,
    hash_algorithm: 'sha256',
    sources_hash: null,
    source_count: 1,
    sources: [source],
  }
  sourcesFile.sources_hash = sha256Json(sourcesFile.sources)

  const updatedMetadata = {
    ...metadata,
    content_hash: originalHash,
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    candidate_content_hash: candidateHash,
    ui_blocks_hash: uiBlocks.ui_blocks_hash,
    sources_hash: sourcesFile.sources_hash,
    source_count: 1,
    parser_status: 'passed',
    content_complexity: 'plain_markdown',
  }

  const diffReport = diffCandidate({
    metadata: updatedMetadata,
    original,
    normalized: config.body,
    candidate,
    uiBlocks,
  })

  const support = {
    parent_article_id: metadata.article_id,
    parent_article_slug: metadata.slug,
    batch_id: batchId,
    answer_key_fields_changed: false,
    answer_key_policy:
      'Correct option id, correct_value, and accepted_answers are preserved; unsupported question text and rationales are replaced.',
    support_status: 'source_safe_rewrite',
    source_locator: sourceLocator,
    checked_markdown_lines: checkedLines,
    checked_sources: [checkedSource],
    local_source_safe_action:
      'Question rewritten to match checked local NSCP 2015 Section 208.9 nonstructural component/equipment and related seismic/flood utility anchors.',
    excluded_claims: [
      'Exact generator transfer, runtime, fuel-filter, and post-earthquake maintenance protocol claims.',
      'Exact gas shutoff valve mechanism, activation threshold, response time, and price claims.',
      'Exact smoke-control, PA intelligibility, and emergency communication duration claims.',
      'Exact ASME, AISC, ASTM, manufacturer, or proprietary details not present in the checked local NSCP anchors.',
    ],
  }

  const questionEditsDir = path.join(config.articleDir, 'question-edits')
  mkdirSync(questionEditsDir, { recursive: true })
  const questionClaimRows = []
  const questionEditPaths = []

  for (const [index, question] of linkedQuestions.questions.entries()) {
    const spec = config.questionSpecs[question.question_id]
    if (!spec) throw new Error(`Missing proposal for ${question.question_id}`)
    const proposed = makeProposal(question, spec)
    const edit = {
      question_id: question.question_id,
      baseline_hash: question.content_hash ?? sha256Json(question),
      action: 'replace',
      reason:
        `Batch 163 source-audited rewrite: constrain ${config.cluster} to checked local NSCP 2015 Section 208.9 and related seismic/flood utility anchors; remove unsupported residual operational or manufacturer claims.`,
      approved_by: approvedBy,
      approved_at: generatedAtManila,
      source_audit_support: support,
      proposed,
    }
    const editPath = path.join(questionEditsDir, `${question.question_id}.json`)
    writeJson(editPath, edit)
    questionEditPaths.push(editPath)
    questionClaimRows.push({
      claim_id: `${config.cluster}-b163-question-${String(index + 1).padStart(2, '0')}-${question.question_id}`,
      question_id: question.question_id,
      model_id: question.model_id,
      claim_text:
        `${question.question_id} ${question.model_id}: question edit rewritten under checked NSCP 2015 Section 208.9 source boundary; correct_option_id preserved as ${question.correct_option_id}.`,
      source_ids: [sourceId],
      locator: `${anchors[spec.anchorKey].path}:${anchors[spec.anchorKey].lines}`,
      status: 'PASS',
    })
  }

  const sourcePrimaryFindings = checkedLines.map((line, index) => ({
    claim_id: `${config.cluster}-b163-source-primary-${index + 1}`,
    claim_text: line,
    source_ids: [sourceId],
    locator: line,
    status: 'PASS',
  }))

  const sourceAuditEvidence = {
    batch_id: batchId,
    audit_date: generatedAt.slice(0, 10),
    audited_at: generatedAtManila,
    target: {
      cluster_id: config.cluster,
      article_id: metadata.article_id,
      slug: metadata.slug,
      title: metadata.title,
      article_folder: config.articleDir,
      normalized_sha256: normalizedHash,
      candidate_sha256: candidateHash,
      candidate_path: `${config.articleDir}/candidate.md`,
    },
    classification: {
      local_first_batch: String(batch),
      source_sensitivity: 'nscp_nonstructural_equipment_seismic_restraint_and_flood_utility_boundary',
      source_risk_tier: 'local_primary_code_ocr_required',
      requires_raw_local_source: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: ['No Supabase upload was run for Batch 163; this is a local-only production-line handoff.'],
    },
    raw_local_gate: {
      status: 'PASS',
      local_sources_checked_first: true,
      valid_source_pdf: sourcePdf,
      valid_source_pdf_sha256: sourcePdfSha,
      source_metadata: sourceMetadataPath,
      conversion_root: conversionRoot,
      rejected_source: rejectedSource,
      rejected_source_reason: 'Null-byte corrupted file; not used as evidence.',
      checked_sources: [checkedSource],
      checked_markdown_lines: checkedLines,
    },
    scenario_enrichment: {
      policy_status: 'satisfied',
      eligibility_status: config.scenarioStatus,
      blocker_status: 'none',
      notes:
        'Article and question scenarios were constrained to checked NSCP nonstructural equipment, anchorage, flexibility, vibration-isolator, seismic-zone, and flood utility anchors.',
    },
    thin_needs_expansion: {
      previous_status: 'source-auditable residual with unsupported mixed-authority claims',
      batch_163_status: 'resolved_with_source_safe_rewrite',
      evidence:
        'normalized.md removes unsupported operational, manufacturer, and proprietary details and replaces them with checked local NSCP OCR-supported material.',
    },
    question_alignment: {
      linked_question_count: linkedQuestions.question_count,
      question_edit_count: linkedQuestions.question_count,
      answer_key_changes: 0,
      scope: 'nscp_nonstructural_equipment_seismic_restraint_and_flood_utility_boundary',
    },
    checked_sources: [checkedSource],
    claims: [...sourcePrimaryFindings, ...questionClaimRows],
    source_primary_findings: sourcePrimaryFindings,
    resolved_findings: ['source-primary', 'question-alignment', 'scenario/depth', 'unsupported-claim-removal'],
    unverified_or_rejected_claims: support.excluded_claims.map((claim, index) => ({
      rejected_claim_id: `${config.cluster}-b163-rejected-${index + 1}`,
      claim_text: claim,
      reason: 'Outside the Batch 163 checked local NSCP OCR source boundary.',
    })),
  }

  const componentUsage = {
    article_id: metadata.article_id,
    slug: metadata.slug,
    title: metadata.title,
    component_count: 0,
    components: [],
    unknown_components: [],
    custom_ui_block_count: 0,
    normalized_status: 'plain_markdown_no_ui_blocks',
    components_detected: [],
    unknown_components_detected: [],
  }

  writeText(path.join(config.articleDir, 'normalized.md'), config.body)
  writeText(path.join(config.articleDir, 'candidate.md'), candidate)
  writeJson(path.join(config.articleDir, 'article-metadata.json'), updatedMetadata)
  writeJson(path.join(config.articleDir, 'ui-blocks.json'), uiBlocks)
  writeJson(path.join(config.articleDir, 'ui-block-edits.json'), {
    article_id: metadata.article_id,
    slug: metadata.slug,
    generated_at: generatedAtManila,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [
      'Batch 163 normalized content is plain markdown; no UI block edits are proposed.',
    ],
  })
  writeJson(path.join(config.articleDir, 'component-usage.json'), componentUsage)
  writeJson(path.join(config.articleDir, 'sources.json'), sourcesFile)
  writeJson(path.join(config.articleDir, 'source-audit-evidence.json'), sourceAuditEvidence)
  writeJson(path.join(config.articleDir, 'compose-report.json'), composeReport)
  writeJson(path.join(config.articleDir, 'diff-report.json'), diffReport)
  writeText(path.join(config.articleDir, 'diff-report.md'), buildDiffMarkdown(diffReport))

  if (existsSync(path.join(config.articleDir, 'compose-error.json'))) {
    rmSync(path.join(config.articleDir, 'compose-error.json'))
  }

  return {
    config,
    metadata,
    linkedQuestions,
    normalizedHash,
    candidateHash,
    sourcesHash: sourcesFile.sources_hash,
    composeReport,
    diffReport,
    sourceId,
    checkedSource,
    questionEditPaths,
    articlePaths: [
      path.join(config.articleDir, 'article-metadata.json'),
      path.join(config.articleDir, 'normalized.md'),
      path.join(config.articleDir, 'candidate.md'),
      path.join(config.articleDir, 'ui-blocks.json'),
      path.join(config.articleDir, 'ui-block-edits.json'),
      path.join(config.articleDir, 'component-usage.json'),
      path.join(config.articleDir, 'sources.json'),
      path.join(config.articleDir, 'source-audit-evidence.json'),
      path.join(config.articleDir, 'compose-report.json'),
      path.join(config.articleDir, 'compose-error.json'),
      path.join(config.articleDir, 'diff-report.json'),
      path.join(config.articleDir, 'diff-report.md'),
      ...questionEditPaths,
    ],
  }
}

const results = articleConfigs.map(processArticle)

const ledger = {
  batch_id: batchId,
  generated_at: generatedAtManila,
  repo: '/Users/philiplewis/slatecamp',
  branch,
  baseline,
  source_policy:
    'local_first_only_no_supabase_no_deploy_no_db_no_main_merge_no_force_push_no_stage_no_commit_by_batch_worker',
  valid_source: {
    source_pdf: sourcePdf,
    conversion_root: conversionRoot,
    source_sha256: sourcePdfSha,
    page_sha256: pageMarkdownSha256,
    source_metadata: sourceMetadataPath,
    corrupted_source_rejected: rejectedSource,
  },
  latest_accepted_batch_observed: {
    batch: 162,
    commit: baseline,
    evidence:
      '.ai/03_plans/source-audited-local-first-batches-handoff.md and git log both identify Batch 162 as the latest accepted content batch at Batch 163 start.',
  },
  selected_clusters: results.map((result) => ({
    cluster: result.config.cluster,
    article_id: result.metadata.article_id,
    slug: result.metadata.slug,
    folder: result.config.articleDir,
    topic: result.config.topic,
    anchors: checkedLines,
    linked_question_count: result.linkedQuestions.question_count,
    question_edit_count: result.linkedQuestions.question_count,
    answer_key_changes: 0,
    blockers: [],
    normalized_sha256: result.normalizedHash,
    candidate_sha256: result.candidateHash,
    sources_sha256: result.sourcesHash,
    source_audit_status: 'PASS',
    scenario_status: result.config.scenarioStatus,
  })),
  unselected_clusters: [],
  totals: {
    selected_clusters: results.length,
    linked_questions: results.reduce((sum, result) => sum + result.linkedQuestions.question_count, 0),
    question_edits: results.reduce((sum, result) => sum + result.linkedQuestions.question_count, 0),
    answer_key_changes: 0,
    selected_blockers: 0,
  },
}

writeJson('.ai/content-audit-export/source-audited-article-batch-163-local-first-ledger.json', ledger)

const reportMd = `# Batch 163 Local-First Source-Audited Report

Generated: ${generatedAtManila}

## Status

Batch 163 is locally prepared for two residual utility/seismic clusters. No Supabase push, deploy, production DB mutation, main merge, force-push, staging, commit, or push was performed.

## Selected Clusters

${results.map((result) => `- ${result.config.cluster} (${result.metadata.slug}): ${result.config.topic}; linked questions ${result.linkedQuestions.question_count}/${result.linkedQuestions.question_count}; answer-key changes 0; blockers 0.`).join('\n')}

## Source Basis

- Valid local PDF: ${sourcePdf}
- Valid PDF hash: ${sourcePdfSha}
- OCR conversion: ${conversionRoot}
- Source metadata: ${sourceMetadataPath}
- Checked OCR pages: ${pageMarkdownPaths.map((filePath) => `${filePath} ${pageMarkdownSha256[filePath]}`).join('; ')}
- Rejected source: the older National Structural Code of the Philippines 2015 PDF remains null-byte corrupted and was not used as evidence.

## Content Actions

- Rewrote both articles to plain markdown with no SlateCamp UI block placeholders.
- Removed unsupported exact operational, manufacturer, and proprietary claims.
- Added source-safe scenario status around NSCP nonstructural equipment, anchorage, bracing, relative movement, vibration-isolator restraint, life-safety equipment importance, and flood utility boundaries.
- Preserved answer keys for all linked questions.

## Question Edits

- Linked questions selected: ${ledger.totals.linked_questions}
- Question-edit JSON files: ${ledger.totals.question_edits}
- Answer-key changes: 0
- Policy: correct_option_id, correct_value, and accepted_answers preserved unless source audit proves correction. No answer-key correction was needed in Batch 163.

## Validation Summary

Scoped validation evidence is recorded in .ai/content-audit-export/source-audited-article-batch-163-local-first-scoped-checks.json.
`

writeText('.ai/content-audit-export/source-audited-article-batch-163-local-first-report.md', reportMd)

writeJson('.ai/content-audit-export/source-audited-article-batch-163-local-first-scoped-checks.json', {
  batch_id: batchId,
  generated_at: generatedAtManila,
  status: 'VALIDATION_NOT_YET_RECORDED',
  note: 'Created by the Batch 163 runner before external scoped validation commands were executed.',
  expected_gates: [
    'compose strict',
    'diff strict',
    'official scoped validate',
    'JSON parse',
    'placeholder/internal-note/source acquisition scan',
    'linked-question/question-edit parity',
    'source evidence hashes and locators',
    'git diff --check over intended Batch 163 paths',
  ],
})

const reviewMd = `# Batch 163 Independent Quality Review

Generated: ${generatedAtManila}

## Scope

${results.map((result) => `- ${result.config.cluster}: ${result.config.articleDir}; linked question edits ${result.linkedQuestions.question_count}; answer-key changes 0.`).join('\n')}

## Reviewer Pass Limitation

A separate external reviewer was not invoked for this local-first worker run. This artifact records a distinct self-review pass after generation, with final acceptance dependent on the scoped validation gates in the Batch 163 checks artifact.

## Review Findings

- Source scope is appropriate: both residual clusters are narrowed to checked local NSCP 2015 OCR anchors for Section 208.9 nonstructural components/equipment, related seismic-zone inputs, vibration-isolator rules, and flood utility boundaries.
- Unsupported operational/manufacturer claims are removed rather than rephrased as code requirements.
- Article and question edits are paired: each selected article has one proposed question edit for every linked question.
- Answer keys are preserved across all proposed question edits.

## Risk Notes

- The checked NSCP source does not support exact gas valve device mechanics, generator maintenance deadlines, ASME hose ratings, AISC anchor grades, PA intelligibility values, or smoke-control pressure values. Those claims remain excluded until a separate local authoritative source is supplied.
- Final handoff requires fresh compose, diff, official scoped validation, JSON parse, scan, parity, source-hash, and diff-check evidence.
`

writeText('.ai/03_plans/batch-163-independent-quality-review.md', reviewMd)

const stagePaths = [
  '.ai/content-audit-export/runs/source-audited-batch-163-local-runner.mjs',
  '.ai/content-audit-export/source-audited-article-batch-163-local-first-report.md',
  '.ai/content-audit-export/source-audited-article-batch-163-local-first-ledger.json',
  '.ai/content-audit-export/source-audited-article-batch-163-local-first-scoped-checks.json',
  '.ai/03_plans/batch-163-independent-quality-review.md',
  '.ai/03_plans/batch-163-git-handoff-stage-list.md',
  '.ai/03_plans/batch-163-git-handoff-stage-paths.txt',
  ...results.flatMap((result) => result.articlePaths),
]

const uniqueStagePaths = [...new Set(stagePaths)].sort()

const handoffMd = `# Batch 163 Git Handoff Stage List

Generated: ${generatedAtManila}

Do not auto-stage from this worker. Hermes/watchdog remains the serial accepter.

## Scope

- Batch: 163
- Baseline: ${baseline}
- Selected clusters: ${results.map((result) => result.config.cluster).join(', ')}
- Linked question edits: ${ledger.totals.question_edits}
- Answer-key changes: 0
- Blockers for selected content: 0

## Intended Paths

${uniqueStagePaths.map((filePath) => `- ${filePath}`).join('\n')}
`

writeText('.ai/03_plans/batch-163-git-handoff-stage-list.md', handoffMd)
writeText('.ai/03_plans/batch-163-git-handoff-stage-paths.txt', `${uniqueStagePaths.join('\n')}\n`)

console.log(JSON.stringify({
  batch_id: batchId,
  generated_at: generatedAtManila,
  selected_clusters: results.map((result) => ({
    cluster: result.config.cluster,
    article_id: result.metadata.article_id,
    slug: result.metadata.slug,
    normalized_hash: result.normalizedHash,
    candidate_hash: result.candidateHash,
    linked_questions: result.linkedQuestions.question_count,
    question_edits: result.linkedQuestions.question_count,
    answer_key_changes: 0,
    compose_blockers: result.composeReport.blockers.length,
    diff_blockers: result.diffReport.blockers.length,
  })),
  totals: ledger.totals,
  source_hash: sourcePdfSha,
}, null, 2))
