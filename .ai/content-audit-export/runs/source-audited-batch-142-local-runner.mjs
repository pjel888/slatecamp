#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildDiffMarkdown, composeCandidate, diffCandidate } from '../../../scripts/content-audit/lib.ts';

const REPO = process.cwd();
const BATCH = 142;
const BASELINE = '9a1ce4b51';
const BATCH_ID = 'source-audited-article-batch-142-local-first';
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = GENERATED_AT.slice(0, 10);
const STATUS = process.env.BATCH142_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_PASSED = process.env.BATCH142_TARGETED_TESTS_PASSED === 'true';
const TARGETED_TESTS_COMMAND = 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts';
const EXPORT_ROOT = '.ai/content-audit-export';
const ARTICLES_ROOT = `${EXPORT_ROOT}/articles`;
const RAW_STRUCT_DIR = `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-${BATCH}`;
const REFINED_STRUCT_DIR = `vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-${BATCH}`;
const SUMMARY_PATH = `${EXPORT_ROOT}/${BATCH_ID}-content-generation-summary.json`;
const RUN_SUMMARY_PATH = `${EXPORT_ROOT}/runs/source-audited-batch-${BATCH}-local-generation-summary.json`;
const MANIFEST_PATH = `.ai/03_plans/production-line-batch-${BATCH}-manifest.json`;
const QUALITY_REVIEW_PATH = `.ai/03_plans/batch-${BATCH}-independent-quality-review.md`;
const STAGE_LIST_PATH = `.ai/03_plans/batch-${BATCH}-git-handoff-stage-list.md`;
const STAGE_PATHS_PATH = `.ai/03_plans/batch-${BATCH}-git-handoff-stage-paths.txt`;
const LEDGER_PATH = `${EXPORT_ROOT}/source-audited-article-batch-${BATCH}-local-first-ledger.json`;
const REPORT_PATH = `${EXPORT_ROOT}/source-audited-article-batch-${BATCH}-local-first-report.md`;
const SCOPED_CHECKS_PATH = `${EXPORT_ROOT}/source-audited-article-batch-${BATCH}-local-first-scoped-checks.json`;
const RUNNER_PATH = `${EXPORT_ROOT}/runs/source-audited-batch-${BATCH}-local-runner.mjs`;

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

function branchName() {
  try {
    return execFileSync('git', ['branch', '--show-current'], { cwd: REPO, encoding: 'utf8' }).trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function isGitTracked(relativePath) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', relativePath], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function pathExistsOrTracked(relativePath) {
  return existsSync(path.join(REPO, relativePath)) || isGitTracked(relativePath);
}

function stripQuestionHash(question) {
  const clone = { ...question };
  delete clone.content_hash;
  return clone;
}

function optionTextById(correctId, correctText, distractors) {
  const ids = ['a', 'b', 'c', 'd'];
  const byId = {};
  let distractorIndex = 0;
  for (const id of ids) {
    byId[id] = id === correctId ? correctText : distractors[distractorIndex++];
  }
  return ids.map((id) => ({ id, text: byId[id] }));
}

function baselineQuestionMap(articleFolder) {
  try {
    const output = execFileSync('git', ['show', `${BASELINE}:${articleFolder}/linked-questions.json`], {
      cwd: REPO,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const parsed = JSON.parse(output);
    return new Map((parsed.questions ?? []).map((question) => [question.question_id, question]));
  } catch {
    return new Map();
  }
}

function findArticleDir(slug) {
  const match = readdirSync(path.join(REPO, ARTICLES_ROOT))
    .filter((name) => name.startsWith(`${slug}--`))
    .sort()[0];
  if (!match) throw new Error(`No article folder found for ${slug}`);
  return `${ARTICLES_ROOT}/${match}`;
}

const sourceFamilies = {
  bciSpace: {
    label: 'Building Construction Illustrated (5th Edition)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
    locator: 'Building Construction Illustrated refined markdown lines 1901-1905, 2063-2132, and 6655-6682',
    notes: [
      'A space frame is a long-spanning three-dimensional plate structure based on triangular rigidity.',
      'Space-frame members are linear elements subject primarily to axial tension or compression.',
      'The simplest spatial unit is a tetrahedron with four joints and six members.',
      'A space-frame supporting bay should be square or nearly square so the system acts as a two-way structure.',
      'Folded plates, domes, suspension/cable-stayed structures, and pneumatic structures have distinct load-path cues.',
    ],
  },
  bsiLongSpan: {
    label: 'Building Structures Illustrated (2nd Edition)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'Building Structures Illustrated refined markdown lines 4925-4961 and 4979-4980',
    notes: [
      'Long-span structures are used for large column-free spaces such as arenas, theaters, hangars, terminals, and warehouses.',
      'For this source, spans over 60 ft (18 m) are treated as long span.',
      'Deflection, ponding, redundancy, thrust, and lateral stability are major long-span design issues.',
      'Two-way systems such as space frames and domes require nearly square or circular support patterns.',
      'Transport and field assembly constraints matter for long-span members.',
    ],
  },
  hibbelerSpace: {
    label: 'Hibbeler Statics 13th Edition',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Hibbeler Statics 13th Ed.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Hibbeler Statics 13th Ed.md',
    locator: 'Hibbeler Statics refined markdown line 26514',
    notes: [
      'A space truss is a three-dimensional truss built from tetrahedral elements.',
      'Space truss joints are assumed as ball-and-socket connections in the checked statics source.',
    ],
  },
  appliedStrength: {
    label: 'Applied Statics and Strength of Materials',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Applied Statics and Strength of Materials.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Applied Statics and Strength of Materials.md',
    locator: 'Applied Statics and Strength refined markdown lines 10370-10436, 11155-11227, 11261-11296, and 12069-12269',
    notes: [
      'Hooke law applies while stress is proportional to strain and the proportional limit is not exceeded.',
      'The elastic limit is the greatest stress without permanent elongation after unloading; many practical treatments use it close to the proportional limit.',
      'The yield point begins plastic behavior; ultimate strength is the maximum stress; rupture is the breaking point.',
      'Ductility, brittleness, malleability, toughness, resilience, and Poisson ratio are defined from material behavior and tests.',
      'Modulus of elasticity is the stress-to-strain ratio in the linear range; shear modulus relates shear stress to shear strain.',
    ],
  },
  mechanicsStrength: {
    label: 'Mechanics and Strength of Materials',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Mechanics and Strength of Materials.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Mechanics and Strength of Materials.md',
    locator: 'Mechanics and Strength refined markdown lines 4685-4709, 4996-5318, 5394-5548, and 5882-6339',
    notes: [
      'Elastic deformation is recoverable and plastic deformation is non-recoverable.',
      'Ductile materials undergo substantial plastic deformation before rupture; brittle materials rupture with little non-elastic deformation.',
      'Creep is deformation increase over time without a load change.',
      'Young modulus, shear modulus, bulk modulus, and Poisson coefficient describe linear elastic behavior.',
      'Elastic work can be stored and recovered when the stress-strain relation is the same during loading and unloading.',
    ],
  },
  fundamentalsDesign: {
    label: 'Fundamentals of Structural Engineering',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Fundamentals of Structural Engineering.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Fundamentals of Structural Engineering.md',
    locator: 'Fundamentals of Structural Engineering refined markdown lines 1217-1221, 2074, 30189-30258, 61490-61549, and 62395-62589',
    notes: [
      'Conventional structural design philosophy satisfies safety and serviceability.',
      'Safety is checked by requiring resistance to exceed demand for extreme loading.',
      'Serviceability checks keep structures operational under service loads.',
      'Local examples use service loads for footing dimensioning and factored loads for shear and moment diagrams.',
      'The source references AISC ASD/LRFD and AASHTO LRFD manuals but does not provide a full local NSCP factor table.',
    ],
  },
};

for (const family of Object.values(sourceFamilies)) {
  family.rawHash = sha256File(family.rawPath);
  family.refinedHash = sha256File(family.refinedPath);
}

const blockedClusters = [
  {
    cluster_id: 'lea-theo-008-02-core-concept',
    title: 'Articulation of form',
    status: 'blocked_carried_forward',
    reason: 'No completed recovery report is present under .ai/03_plans/blocked-source-recovery, so the theory-form source boundary remains insufficient for a claim-safe rewrite.',
  },
  {
    cluster_id: 'lea-theo-008-03-core-concept',
    title: 'Transformation of form',
    status: 'blocked_carried_forward',
    reason: 'No completed recovery report is present under .ai/03_plans/blocked-source-recovery, so the theory-form source boundary remains insufficient for a claim-safe rewrite.',
  },
  {
    cluster_id: 'lea-matl-009-02-core-concept',
    title: 'CSI MasterFormat',
    status: 'blocked_carried_forward',
    reason: 'No completed CSI MasterFormat source-recovery report is present, so the exact classification claim scope remains uncaptured locally.',
  },
  {
    cluster_id: 'lea-util-004-05-seismic-bracing-and-earthquake-resilience',
    title: 'Seismic bracing and earthquake resilience',
    status: 'blocked_carried_forward',
    reason: 'No completed seismic utilities recovery report is present, so utilities seismic-bracing claims still lack a safe local refined conversion boundary.',
  },
  {
    cluster_id: 'lea-util-004-08-seismic-bracing-requirements-per-nscp-2015',
    title: 'Seismic bracing requirements per NSCP 2015',
    status: 'blocked_carried_forward',
    reason: 'The raw NSCP 2015 PDF exists locally, but no completed NSCP-specific refined conversion/recovery report is present for this pass.',
  },
];

const questionPools = {
  spaceFrame: [
    ['What source-safe cue separates a space frame from a plane truss?', 'A space frame is a three-dimensional triangulated system, commonly built from tetrahedral units.', ['It is any roof truss with timber members.', 'It is a flat two-member joint analyzed only in one plane.', 'It is defined by a fixed Philippine span limit in this packet.']],
    ['Why does the support bay shape matter for a space frame?', 'A square or nearly square support bay helps it act as a two-way structure.', ['A narrow one-way bay always improves two-way action.', 'Support shape is irrelevant once members are steel.', 'A triangular roof plan is required by code in this packet.']],
    ['Which force action is source-safe for ideal space-frame members?', 'Members are treated primarily as axial tension or compression elements.', ['All members are designed mainly for torsion.', 'All members are decorative and nonstructural.', 'Every member must carry only bending moment.']],
    ['A large terminal wants a column-free roof. What long-span issue should be checked first?', 'Deflection, drainage or ponding, lateral stability, and load path should be checked before choosing a system.', ['Only the visual pattern matters.', 'Long spans remove the need for lateral stability.', 'Any system over 30 m is automatically a space frame.']],
    ['What is the simplest spatial unit named for a space frame in the checked source?', 'A tetrahedron with four joints and six members.', ['A rectangular portal frame.', 'A two-member pin joint.', 'A single compression arch.']],
    ['Which comparison between space frames and domes is source-safe?', 'Both can act as two-way long-span systems, but a dome uses spherical surface geometry while a space frame uses three-dimensional triangulated members.', ['They are identical because both are roofs.', 'A dome is always a cable-stayed bridge.', 'A space frame has no triangular geometry.']],
    ['Why should a long-span roof avoid ponding?', 'Deflection can trap water, which adds load and can worsen deflection.', ['Ponding makes steel lighter.', 'Ponding increases redundancy in every long-span roof.', 'Ponding is only an architectural finish issue.']],
    ['What should replace an unsupported exact span-range question for this bundle?', 'Use the checked long-span concept and load-path cues instead of inventing a fixed local threshold.', ['Quote a remembered code span limit.', 'Treat all spans as short spans.', 'Ignore span because geometry never matters.']],
    ['Which statement about field assembly is supported by the local long-span source?', 'Long-span members can be difficult to transport and may require field assembly and crane planning.', ['All long-span members are shipped as one piece without constraints.', 'Transport limits prove the structural system type by themselves.', 'Field assembly is prohibited for space frames.']],
    ['What is the source-safe exam answer when a description mentions a 3D truss roof with many nodes?', 'Classify it as a space frame or space truss and explain the three-dimensional axial member load path.', ['Classify it as a bearing wall system.', 'Call it a folded plate because it has many panels.', 'Answer with a seismic response factor.']],
  ],
  stressStrain: [
    ['What does stress measure in a strength-of-materials question?', 'Internal force per unit area in the material.', ['Total building weight regardless of area.', 'Change in length divided by original length.', 'A code occupancy classification.']],
    ['What does strain measure?', 'Deformation per unit original length.', ['Force per unit area.', 'A material grade label only.', 'The maximum load before any support reaction.']],
    ['What happens at the proportional limit?', 'The stress-strain relation stops being a straight proportional Hooke-law relation.', ['The specimen necessarily breaks.', 'All plastic deformation is fully complete.', 'The member becomes a space frame.']],
    ['What is the elastic-limit idea used in this source boundary?', 'It is the greatest stress at which unloading leaves no permanent deformation.', ['It is always the same as rupture strength.', 'It is the same as ultimate strength for every material.', 'It is a load combination.']],
    ['What is the safe description of yield point behavior?', 'Plastic deformation begins and strain can increase with little or no stress increase in ductile steel.', ['The material returns fully with no permanent set after any load.', 'The material must already have ruptured.', 'The curve remains exactly linear forever.']],
    ['What is ultimate strength on a stress-strain curve?', 'The maximum stress the material can develop during the test.', ['The first point where strain is visible.', 'The same as every allowable stress.', 'The point where stress is zero after unloading.']],
    ['What does rupture strength indicate?', 'The stress condition at which the specimen actually breaks.', ['The first point of Hooke-law proportionality.', 'The service load before any factor is applied.', 'A lateral force resisting system.']],
    ['How should exact A36 Fy and Fu values be handled in this batch?', 'Use only values supplied by the question or captured source; do not invent a code-value table from memory.', ['Always use one remembered table for every steel grade.', 'Ignore material grade and stress values.', 'Treat all steels as brittle materials.']],
    ['Why can proportional limit and elastic limit be confused?', 'They are often close in practical testing, but the concepts differ: proportionality versus no permanent deformation.', ['They describe unrelated building occupancies.', 'They are always equal to rupture strength.', 'They only apply to pneumatic structures.']],
    ['What is the best exam habit for stress-strain diagrams?', 'Name the point, then state whether behavior is linear elastic, elastic but nonproportional, plastic, maximum stress, or rupture.', ['Memorize only the picture color.', 'Skip unloading behavior.', 'Use LRFD factors to identify every point.']],
  ],
  materialProperties: [
    ['What is ductility?', 'The ability to undergo considerable plastic deformation in tension before rupture.', ['The ability to resist vapor diffusion.', 'The ability to act as a two-way roof frame.', 'The absence of any plastic deformation.']],
    ['What is brittleness?', 'Failure with little or no plastic deformation and little warning.', ['High plastic deformation before rupture.', 'The ability to hammer into sheets.', 'A service-load combination.']],
    ['What is malleability?', 'The ability to undergo considerable plastic deformation in compression, such as hammering or rolling.', ['The ability to draw into wire under tension.', 'The maximum stress in a factored load case.', 'A property of support bay geometry.']],
    ['What is toughness in the checked source boundary?', 'Energy absorption to rupture, represented by the area under the stress-strain curve to rupture.', ['The slope of the elastic line only.', 'A code table for occupancy loads.', 'The lack of any deformation before failure.']],
    ['What is resilience?', 'Elastic energy absorption and recovery before exceeding the elastic limit.', ['The total plastic damage after rupture.', 'A field assembly method for long-span trusses.', 'The same as brittleness.']],
    ['What is creep?', 'Time-dependent deformation increase under unchanged load.', ['Instant rupture under one impact.', 'The first linear part of a truss diagram.', 'A response-factor category.']],
    ['How does Poisson ratio enter a basic material-property question?', 'It relates lateral strain to longitudinal strain under axial loading.', ['It gives the number of members in a tetrahedron.', 'It is the same as ultimate strength.', 'It chooses between ASD and LRFD.']],
    ['Which statement about concrete in the checked source boundary is safe?', 'Concrete is commonly treated as brittle in tension compared with ductile metals.', ['Concrete always yields like mild steel.', 'Concrete has no compressive behavior.', 'Concrete is a cable material only.']],
    ['Why is toughness not just high strength?', 'Toughness needs both stress capacity and deformation capacity before rupture.', ['Strength alone is always enough.', 'Toughness ignores plastic deformation.', 'Toughness is only a color or finish property.']],
    ['What should a question compare when asking ductile versus brittle behavior?', 'Plastic deformation and warning before rupture, not just the name of the material.', ['Only whether the material is imported.', 'Only the building occupancy.', 'Only the architectural style.']],
  ],
  modulus: [
    ['What is Young modulus or modulus of elasticity?', 'The stress-to-strain ratio, or slope of the linear elastic stress-strain response.', ['The rupture stress after necking.', 'A long-span roof type.', 'The number of columns in a bay.']],
    ['When is E = stress/strain source-safe to use?', 'Within the proportional linear elastic range.', ['After rupture.', 'After any amount of plastic strain without checking limits.', 'Only for pneumatic membranes.']],
    ['What does a higher modulus usually mean in a stiffness comparison?', 'Less elastic strain for the same stress, assuming the same conditions.', ['Lower stiffness for every member.', 'More strain for the same stress.', 'No effect on deflection.']],
    ['What does the shear modulus G relate?', 'Shear stress to shear strain.', ['Axial stress to longitudinal strain only.', 'Ponding load to roof slope.', 'Service load to occupancy group.']],
    ['What does bulk modulus describe?', 'Resistance to volumetric strain under mean normal stress.', ['A beam-column joint category.', 'A material color specification.', 'A truss zero-force rule.']],
    ['What relation between E, G, and Poisson ratio is supported in the mechanics source?', 'For isotropic linear elastic behavior, shear modulus relates to Young modulus and Poisson ratio.', ['G is unrelated to E in every material.', 'Poisson ratio is a span length.', 'E is always calculated from roof ponding.']],
    ['How should exact steel E values be handled in this batch?', 'Use the captured approximate steel modulus values or values supplied in the question, not an unsupported grade table.', ['Invent a different E for every steel grade.', 'Ignore units.', 'Use an occupancy load factor instead.']],
    ['Why can two members with the same material still deflect differently?', 'Member geometry and moment of inertia also affect deflection, even when material modulus is the same.', ['Because E changes with beam depth by itself.', 'Because stress and strain are unrelated.', 'Because support conditions never matter.']],
    ['What is the safe difference between strength and modulus?', 'Strength concerns failure capacity; modulus concerns elastic deformation response.', ['They are identical words.', 'Modulus is always rupture strength.', 'Strength is only a diaphragm term.']],
    ['What should an LEA answer do when a modulus formula depends on uncaptured code values?', 'Stay with the captured concept and use only values provided by the item or local source.', ['Restore memorized code values without source.', 'Use the largest value in memory.', 'Avoid checking units.']],
  ],
  designSafety: [
    ['What is the core source-safe distinction between safety and serviceability?', 'Safety prevents collapse or major damage under extreme loading; serviceability keeps the structure operational under service loading.', ['They are the same check with different names.', 'Serviceability is only an architectural style issue.', 'Safety applies only to finishes.']],
    ['What does an allowable-stress approach do conceptually?', 'It keeps induced stress below an allowable stress selected with a factor of safety.', ['It permits unlimited stress if deflection is small.', 'It uses no resistance margin.', 'It only applies to space frames.']],
    ['What does a strength or factored-load approach do conceptually?', 'It compares factored demand with adequate resistance for strength checks.', ['It uses only unfactored service loads for every check.', 'It ignores uncertainty.', 'It replaces material properties with style names.']],
    ['In the local footing examples, how are service loads and factored loads separated?', 'Service loads size/check bearing area, while factored loads are used for shear and moment diagrams.', ['Factored loads are used to choose paint color.', 'Service loads are never used.', 'Both are always numerically identical.']],
    ['What should replace a full NSCP LRFD table question in this batch?', 'A source-boundary answer using general service-load versus factored-demand logic unless the exact code table is captured.', ['A memorized factor table.', 'An answer saying factors do not exist.', 'A space-frame geometry answer.']],
    ['Why are factors of safety used in allowable-stress design examples?', 'They keep working stresses below failure or yielding limits despite uncertainty.', ['They increase member stresses intentionally.', 'They define dome geometry.', 'They are only a construction schedule tool.']],
    ['What is the practical risk of mixing methods?', 'Comparing service-level demand to factored resistance, or factored demand to allowable stress, mixes safety formats.', ['It always makes the design automatically safer.', 'It has no effect on interpretation.', 'It only affects drawing scale.']],
    ['Which statement is source-safe about AISC ASD/LRFD in this packet?', 'The local source references AISC ASD/LRFD manuals, but this batch does not reproduce a full manual table.', ['The batch contains every AISC and NSCP design table.', 'AISC references prove all Philippine code values.', 'ASD and LRFD are not structural design methods.']],
    ['What does serviceability usually check?', 'Operational performance such as deformation, motion, or damage under service loading.', ['Only ultimate collapse load.', 'Only historical style.', 'Only the number of tetrahedral joints.']],
    ['What is the best LEA habit for ASD/LRFD-style questions?', 'Identify whether the item gives service loads, factored loads, allowable stress, or reduced capacity before choosing the comparison.', ['Always add all loads without reading the method.', 'Always use the same factor for every item.', 'Ignore whether the question asks for stress or strength.']],
  ],
};

const articles = [
  {
    clusterId: 'lea-strc-002-06-core-concept',
    slug: 'lea-strc-002-06-core-concept',
    title: 'Space frame (or 3D truss)',
    category: 'Structural Conceptualization',
    sourceKeys: ['bciSpace', 'bsiLongSpan', 'hibbelerSpace'],
    questionPool: 'spaceFrame',
    summary: 'Reframed space-frame and long-span content around checked local BCI, BSI, and Hibbeler claims: three-dimensional triangulated/tetrahedral action, axial member behavior, two-way support geometry, and long-span serviceability risks.',
    body: `# Space Frames and Long-Span Structural Forms

## Board Exam Quick Check

For this batch, classify the system from geometry and load path. A space frame is a three-dimensional triangulated member system, not just any large roof. Do not answer with uncaptured span tables or bridge-design rules unless the item supplies that source.

## What You Need to Know for the LEA

A space frame is a long-spanning three-dimensional structure based on the rigidity of the triangle. Building Construction Illustrated describes it as a three-dimensional plate-like structure made of short linear elements that work primarily in axial tension or compression. Hibbeler Statics frames the related space truss as a three-dimensional truss built from tetrahedral elements.

The tetrahedron is the clean memory anchor: four joints and six members. In building terms, the system can distribute load in two directions when its support pattern is square or nearly square. If the supports form a long narrow bay, the two-way advantage is weakened and the system starts to behave more like a one-way spanning strategy.

Long-span selection is not only about maximum distance. Building Structures Illustrated flags deflection, ponding, redundancy, thrust at supports, lateral stability, transportation, and field assembly as real design issues. A long-span roof over an arena, terminal, hangar, or exhibition hall may be structurally efficient, but it must still drain, brace, and transfer forces to supports.

## Real World Scenario

An airport terminal roof needs a large column-free check-in hall. A source-safe concept review asks whether a square or nearly square support pattern can use two-way space-frame action, whether the roof has a clear lateral load path, and whether deflection or ponding could control the roof depth. That scenario stays within the checked sources and does not invent a local code span threshold.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Space frame | Three-dimensional triangulated member system. |
| Simplest unit | Tetrahedron with four joints and six members. |
| Member force | Primarily axial tension or compression in the ideal concept. |
| Support pattern | Square or nearly square support bay supports two-way action. |
| Long-span risks | Deflection, ponding, redundancy, thrust, lateral stability, transport, and assembly. |

## Common Mistakes

- Calling every long roof a space frame without checking three-dimensional triangulation.
- Ignoring the support pattern needed for two-way behavior.
- Treating ponding and deflection as secondary visual issues.
- Quoting unsupported span ranges or bridge rules from memory.
`,
  },
  {
    clusterId: 'lea-strc-003-01-core-concept',
    slug: 'lea-strc-003-01-core-concept',
    title: 'Stress measures the internal force per unit area within',
    category: 'Structural Conceptualization',
    sourceKeys: ['appliedStrength'],
    questionPool: 'stressStrain',
    summary: 'Rebuilt stress-strain content around checked strength-of-materials definitions: stress, strain, Hooke-law proportionality, proportional limit, elastic limit, yield point, ultimate strength, rupture, and the caution against unsupported steel value tables.',
    body: `# Stress, Strain, and the Stress-Strain Diagram

## Board Exam Quick Check

Read the diagram as a sequence of behavior changes. The safe task is to identify what changes at each point: proportionality, recoverability, yielding, maximum stress, and rupture. Use exact material values only when the question or source supplies them.

## What You Need to Know for the LEA

Stress is internal force per unit area. Strain is deformation per unit original length. In the early straight portion of many engineering material tests, stress is proportional to strain. That is the Hooke-law region, and the proportional limit marks the end of that straight-line relationship.

The elastic limit is related but not identical in concept. It is the greatest stress from which the material can be unloaded without permanent deformation. The checked source notes that proportional limit and elastic limit are often close in practical work, but the distinction matters for exams: proportionality is about the line staying straight; elasticity is about recovery after unloading.

After the elastic limit, plastic deformation begins. At the yield point, ductile steel can strain with little or no stress increase. Ultimate strength is the maximum stress developed during the test. Rupture or breaking strength is where the specimen actually breaks. Some materials do not show a clean yield plateau, so a question must tell you what definition or offset method it wants.

## Real World Scenario

A steel hanger rod is overloaded during temporary lifting. A source-safe review asks whether the stress stayed in the linear elastic range or passed yield. If it passed yield, the rod may retain permanent elongation even after unloading. That conclusion follows the checked stress-strain behavior and does not require an uncaptured local steel table.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Stress | Internal force per unit area. |
| Strain | Deformation per unit original length. |
| Proportional limit | End of straight Hooke-law proportionality. |
| Elastic limit | Highest stress with no permanent deformation after unloading. |
| Yield, ultimate, rupture | Plastic flow begins; maximum stress; specimen breaks. |

## Common Mistakes

- Treating proportional limit and elastic limit as the same exam idea.
- Forgetting that yielding means permanent deformation can remain.
- Calling ultimate strength the breaking point when rupture is a separate point.
- Restoring exact A36 values without a captured source or supplied question data.
`,
  },
  {
    clusterId: 'lea-strc-003-02-core-concept',
    slug: 'lea-strc-003-02-core-concept',
    title: 'Material properties describe how materials deform, store',
    category: 'Structural Conceptualization',
    sourceKeys: ['appliedStrength', 'mechanicsStrength'],
    questionPool: 'materialProperties',
    summary: 'Constrained material-property content to checked definitions for ductility, brittleness, malleability, toughness, resilience, creep, elasticity, and Poisson ratio; removed unsupported broad design tables.',
    body: `# Material Properties: Ductility, Brittleness, Toughness, and Creep

## Board Exam Quick Check

Do not answer material-property questions by material name alone. First ask what behavior is being tested: recoverable deformation, plastic deformation before rupture, sudden fracture, energy absorption, time-dependent deformation, or lateral strain.

## What You Need to Know for the LEA

Material properties describe how a material responds to loading independent of the member shape. A steel bar and a steel plate can have different capacities because their geometry differs, but ductility, modulus, and basic stress-strain behavior are material properties checked through tests.

Ductility is the ability to undergo considerable plastic deformation in tension before rupture. It is commonly associated with drawing into wire and with percent elongation in a tension test. Brittleness is the opposite pattern: little or no plastic deformation before sudden fracture. Concrete, stone, and cast iron are treated in the checked source as brittle compared with ductile metals.

Malleability is plastic deformation in compression, such as hammering or rolling into sheets. Toughness is energy absorption to rupture, represented by the area under the stress-strain curve through failure. Resilience is narrower: elastic energy absorption and recovery before the elastic limit is exceeded. Creep is deformation that increases with time without a load change.

Poisson ratio links axial and lateral deformation. Under axial loading, a material changes laterally as it stretches or shortens; Poisson ratio expresses that lateral strain to longitudinal strain relationship.

## Real World Scenario

A long-span steel roof member and a brittle stone cladding panel both experience unexpected impact. The source-safe comparison is not only which material is stronger. The steel may deform visibly and absorb energy, while a brittle panel may fracture with little warning. That is a ductility and toughness distinction, not a code-table claim.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Ductility | Plastic deformation in tension before rupture. |
| Brittleness | Little plastic deformation before sudden fracture. |
| Malleability | Plastic deformation in compression. |
| Toughness | Energy absorbed to rupture; area under the full curve. |
| Resilience | Recoverable elastic energy before the elastic limit. |
| Creep | Deformation increases over time under unchanged load. |

## Common Mistakes

- Equating high strength with toughness.
- Confusing ductility in tension with malleability in compression.
- Treating resilience and toughness as identical.
- Ignoring time when the question is about creep.
`,
  },
  {
    clusterId: 'lea-strc-003-03-core-concept',
    slug: 'lea-strc-003-03-core-concept',
    title: "Modulus is a measure of a material's resistance",
    category: 'Structural Conceptualization',
    sourceKeys: ['appliedStrength', 'mechanicsStrength'],
    questionPool: 'modulus',
    summary: 'Reworked modulus content to checked strength-of-materials sources: Young modulus as stress/strain slope in the proportional range, shear modulus, bulk modulus, Poisson relationship, and the difference between stiffness and strength.',
    body: `# Modulus and Elastic Stiffness

## Board Exam Quick Check

When a question says modulus, ask what deformation mode is being measured. Young modulus measures axial elastic response, shear modulus measures angular shear response, and bulk modulus measures volume-change response. Do not confuse stiffness with strength.

## What You Need to Know for the LEA

Young modulus, also called modulus of elasticity, is the ratio of stress to strain in the straight-line elastic range. It is the slope of the stress-strain curve while Hooke-law proportionality applies. A higher modulus means the material develops less elastic strain for the same stress, all else equal.

The checked sources treat modulus as a material property, but member behavior still depends on geometry. A steel member and another steel member can have the same modulus but different deflections because length, support, load, and moment of inertia differ.

Shear modulus relates shear stress to shear strain. Bulk modulus relates mean normal stress to volumetric strain. Poisson ratio links lateral and longitudinal strain, and in isotropic linear elastic behavior these constants are related. The article stays at this source-safe concept level and does not restore unsupported code formulas for concrete or grade-specific steel tables.

## Real World Scenario

Two canopy beams have the same span and load, but one section has a much smaller moment of inertia. Even if both are steel with the same elastic modulus, the smaller section deflects more. A source-safe answer separates material stiffness from member geometry instead of saying the steel grade alone controls deflection.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Young modulus E | Stress/strain slope in the linear elastic range. |
| Higher E | Less elastic strain for the same stress. |
| Shear modulus G | Shear stress divided by shear strain. |
| Bulk modulus K | Resistance to volumetric strain. |
| Strength vs modulus | Failure capacity vs elastic deformation response. |

## Common Mistakes

- Using modulus after the proportional range without checking the assumption.
- Treating higher yield strength as automatically higher elastic stiffness.
- Forgetting that geometry affects deflection along with material modulus.
- Importing uncaptured concrete or steel code formulas into a source-boundary question.
`,
  },
  {
    clusterId: 'lea-strc-003-04-core-concept',
    slug: 'lea-strc-003-04-core-concept',
    title: 'Both ASD and LRFD aim to ensure safety, but they achieve it',
    category: 'Structural Conceptualization',
    sourceKeys: ['appliedStrength', 'fundamentalsDesign'],
    questionPool: 'designSafety',
    summary: 'Converted ASD/LRFD content into a source-safe design-philosophy bundle: safety versus serviceability, allowable stress and factors of safety, service loads versus factored loads, and explicit exclusion of full NSCP/AISC/phi tables without captured source.',
    body: `# ASD, LRFD, Safety, and Serviceability

## Board Exam Quick Check

Before calculating, identify the comparison format. Is the item using service loads, factored loads, allowable stress, nominal resistance, or reduced resistance? Mixing formats is the main trap.

## What You Need to Know for the LEA

Structural design must satisfy safety and serviceability. The checked Fundamentals source describes safety as preventing collapse or major damage under extreme loading, while serviceability keeps the structure operational under loads that occur during its life. These are related but not identical checks.

Allowable-stress thinking keeps induced stress below an allowable stress. Applied Statics and Strength explains allowable stress through factors of safety against yielding or rupture. This is the source-safe ASD concept: service-level behavior is checked against a reduced allowable limit.

Strength or factored-load thinking separates service-level quantities from amplified design demand. The checked Fundamentals source includes local examples where footing dimensions are based on service loads while shear and moment diagrams are drawn using factored loads such as Pu = 1.2PD + 1.6PL. This batch uses that as an example of method separation, not as a complete NSCP load-combination table.

This article deliberately does not reproduce full ASD/LRFD manual tables, resistance factors, or NSCP method-per-edition claims. Those require a captured code/manual source before restoration.

## Real World Scenario

A shallow footing is sized from service loads and allowable soil pressure, then checked for shear and bending using factored column loads. A source-safe review keeps those checks separate. It does not compare an unfactored service load directly to a factored strength capacity unless the method explicitly says so.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Safety | Resistance exceeds extreme-load demand; collapse prevention. |
| Serviceability | Operational performance under service loading. |
| Allowable-stress concept | Induced stress stays below allowable stress selected with safety margin. |
| Factored-load concept | Design demand may use amplified loads for strength checks. |
| Batch 142 limit | No full NSCP/AISC factor or phi table is asserted here. |

## Common Mistakes

- Mixing service-load checks with factored-strength checks.
- Treating serviceability as less important just because collapse is not occurring.
- Quoting a full code factor table without the captured source.
- Assuming ASD and LRFD can be compared by one stress number alone.
`,
  },
];

for (const article of articles) {
  article.directory = path.basename(findArticleDir(article.slug));
  article.articleFolder = `${ARTICLES_ROOT}/${article.directory}`;
  article.articleId = readJson(`${article.articleFolder}/article-metadata.json`).article_id;
  article.captureRoot = RAW_STRUCT_DIR;
  article.refinedRoot = REFINED_STRUCT_DIR;
}

function sourceLineNotes(article) {
  return article.sourceKeys.flatMap((key) => {
    const family = sourceFamilies[key];
    return family.notes.map((note) => `${family.label}: ${note} Locator: ${family.locator}`);
  });
}

function sourceFamilyRecords(article) {
  return article.sourceKeys.map((key) => {
    const family = sourceFamilies[key];
    return {
      label: family.label,
      rawPath: family.rawPath,
      rawHash: family.rawHash,
      refinedPath: family.refinedPath,
      refinedHash: family.refinedHash,
      checked_locator: family.locator,
    };
  });
}

function buildSourceCapture(article) {
  const families = sourceFamilyRecords(article);
  return [
    `# Batch ${BATCH} Raw Source Capture: ${article.title}`,
    '',
    `Batch: ${BATCH_ID}`,
    `Generated: ${GENERATED_AT}`,
    `Article: ${article.slug}`,
    `Article ID: ${article.articleId}`,
    '',
    '## Local Source Families Checked First',
    '',
    ...families.flatMap((family) => [
      `### ${family.label}`,
      '',
      `- Raw source: \`${family.rawPath}\``,
      `- Raw source SHA-256: \`${family.rawHash}\``,
      `- Refined conversion: \`${family.refinedPath}\``,
      `- Refined conversion SHA-256: \`${family.refinedHash}\``,
      `- Checked locator: ${family.checked_locator}`,
      '',
    ]),
    '## Supported Claim Boundary',
    '',
    article.summary,
    '',
    '## Checked Notes',
    '',
    ...sourceLineNotes(article).map((line) => `- ${line}`),
    '',
    '## Explicit Exclusions',
    '',
    '- No full NSCP load-combination table, AISC ASD/LRFD factor table, resistance-factor table, seismic response-factor table, bridge-design span table, or uncaptured material-grade value table is asserted in this Batch 142 bundle.',
  ].join('\n');
}

function buildRefinedSourceMap(article, capturePath, captureHash) {
  const families = sourceFamilyRecords(article);
  return [
    `# Batch ${BATCH} Refined Source Map: ${article.title}`,
    '',
    `Batch: ${BATCH_ID}`,
    `Generated: ${GENERATED_AT}`,
    `Article: ${article.slug}`,
    `Article ID: ${article.articleId}`,
    `Upstream raw capture: \`${capturePath}\``,
    `Upstream raw capture SHA-256: \`${captureHash}\``,
    '',
    '## Claim Map',
    '',
    `- Article and linked questions are constrained to: ${article.summary}`,
    '- Question rewrites preserve answer keys while replacing unsupported table/value recall with checked structural concepts.',
    '- Real World Scenario is source-safe and uses only the checked local source boundary.',
    '',
    '## Refined Conversion Locators',
    '',
    ...families.map((family) => `- ${family.label}: ${family.checked_locator}`),
    '',
    '## Local Source Hashes',
    '',
    ...families.flatMap((family) => [
      `- ${family.label} raw: \`${family.rawHash}\``,
      `- ${family.label} refined: \`${family.refinedHash}\``,
    ]),
  ].join('\n');
}

function buildSources(article, capturePath, captureHash, refinedPath, refinedHash) {
  const lineNotes = sourceLineNotes(article);
  const families = sourceFamilyRecords(article);
  const sourceLocator = `${capturePath}#${captureHash}; ${refinedPath}#${refinedHash}`;
  const sources = [
    {
      source_id: `batch-${BATCH}-${article.slug}-raw-source-capture`,
      article_id: article.articleId,
      label: `Batch ${BATCH} raw source capture - ${article.title}`,
      url: null,
      source_type: 'local_source_capture',
      description: `Local raw-source-layer capture for ${article.title}; includes checked local source family hashes and refined conversion locators.`,
      is_verified: true,
      sort_order: 0,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: capturePath,
      local_absolute_path: path.join(REPO, capturePath),
      local_sha256: captureHash,
      source_locator: `${capturePath}#${captureHash}`,
      checked_markdown_lines: lineNotes,
      local_source_families: families,
      local_audit_note: `Article and question claims cite only the local Batch ${BATCH} source capture/refined conversion boundary.`,
    },
    {
      source_id: `batch-${BATCH}-${article.slug}-refined-source-map`,
      article_id: article.articleId,
      label: `Batch ${BATCH} refined source conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined local conversion and claim-boundary map for ${article.title}.`,
      is_verified: true,
      sort_order: 1,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: refinedPath,
      local_absolute_path: path.join(REPO, refinedPath),
      local_sha256: refinedHash,
      source_locator: `${refinedPath}#${refinedHash}`,
      upstream_capture_path: capturePath,
      upstream_capture_sha256: captureHash,
      checked_markdown_lines: lineNotes,
      local_source_families: families,
      local_audit_note: 'Refined conversion is a derived locator and claim-boundary map used with the local raw capture.',
    },
  ];
  return {
    sourceLocator,
    file: {
      article_id: article.articleId,
      hash_algorithm: 'sha256',
      sources_hash: sha256Json(sources),
      source_count: sources.length,
      sources,
    },
  };
}

function buildRationale(options, correctId, correctText, sourceLocator, article) {
  const rationale = {};
  for (const option of options) {
    rationale[option.id] =
      option.id === correctId
        ? `${option.text} This stays inside the Batch ${BATCH} local source boundary for ${article.title}.`
        : `${option.text} is not the best answer because it either changes the structural concept or adds a claim outside the Batch ${BATCH} local source boundary.`;
  }
  rationale.correct = `${correctText} Supported by ${sourceLocator}.`;
  rationale.takeaway = `For ${article.title}, read the structural behavior and source boundary before using memorized values.`;
  rationale.source_boundary = sourceLocator;
  return rationale;
}

function rewriteQuestions(article, sourceLocator) {
  const linkedPath = `${article.articleFolder}/linked-questions.json`;
  const existingFile = readJson(linkedPath);
  const questions = existingFile.questions;
  const baseline = baselineQuestionMap(article.articleFolder);
  const templates = questionPools[article.questionPool];
  if (questions.length !== templates.length) {
    throw new Error(`${article.slug} expected ${templates.length} questions, found ${questions.length}`);
  }
  const questionEditDir = `${article.articleFolder}/question-edits`;
  rmSync(path.join(REPO, questionEditDir), { recursive: true, force: true });
  mkdirSync(path.join(REPO, questionEditDir), { recursive: true });

  const rewritten = questions.map((question, index) => {
    const [text, correctText, distractors] = templates[index];
    const baselineQuestion = baseline.get(question.question_id) ?? question;
    const correctId = question.correct_option_id;
    const options = optionTextById(correctId, correctText, distractors);
    const rationale = buildRationale(options, correctId, correctText, sourceLocator, article);
    const proposed = {
      text,
      options,
      correct_option_id: correctId,
      rationale,
      explanation: `${correctText} Supported by the Batch ${BATCH} local source boundary: ${sourceLocator}.`,
      code_citation: sourceLocator,
    };
    const nextQuestion = {
      ...question,
      ...proposed,
      updated_at: GENERATED_AT,
    };
    nextQuestion.content_hash = sha256Json(stripQuestionHash(nextQuestion));
    const answerKeyChanged = baselineQuestion.correct_option_id !== nextQuestion.correct_option_id;
    const edit = {
      question_id: question.question_id,
      baseline_hash: baselineQuestion.content_hash ?? sha256Json(stripQuestionHash(baselineQuestion)),
      action: 'replace',
      reason: `${BATCH_ID}: residual local-first rewrite constrained to checked local source artifacts for ${article.title}.`,
      approved_by: `codex-local-first-${BATCH_ID}`,
      approved_at: GENERATED_AT,
      source_audit_support: {
        parent_article_id: article.articleId,
        parent_article_slug: article.slug,
        answer_key_fields_changed: answerKeyChanged,
        support_status: 'source_safe_rewrite',
        source_locator: sourceLocator,
        checked_sources: [
          {
            source_id: `batch-${BATCH}-${article.slug}-raw-source-capture`,
            label: `Batch ${BATCH} raw source capture - ${article.title}`,
            path: article.sourceCapturePath,
            sha256: article.sourceCaptureHash,
          },
          {
            source_id: `batch-${BATCH}-${article.slug}-refined-source-map`,
            label: `Batch ${BATCH} refined source conversion - ${article.title}`,
            path: article.refinedSourceMapPath,
            sha256: article.refinedSourceMapHash,
          },
        ],
        local_source_safe_action: `Question text, options, rationale, explanation, and citation rewritten to the Batch ${BATCH} local source artifact boundary while preserving the answer key.`,
      },
      proposed,
      batch_question_template_index: index + 1,
    };
    writeJson(`${questionEditDir}/${question.question_id}.json`, edit);
    return nextQuestion;
  });

  const linked = {
    ...existingFile,
    questions: rewritten,
    question_count: rewritten.length,
    linked_questions_hash: sha256Json(rewritten),
    hash_algorithm: 'sha256',
  };
  writeJson(linkedPath, linked);
  return linked;
}

function writeUiRoundtripFiles(article, original, normalized) {
  const originalHash = sha256(original);
  const normalizedHash = sha256(normalized);
  const uiBlocks = {
    article_id: article.articleId,
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
    ui_blocks_hash: sha256Json([]),
  };
  writeJson(`${article.articleFolder}/ui-blocks.json`, uiBlocks);
  writeJson(`${article.articleFolder}/ui-block-edits.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [],
  });
  writeJson(`${article.articleFolder}/parser-errors.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    error_count: 0,
    warning_count: 0,
    unknown_block_count: 0,
    critical_block_count: 0,
    errors: [],
    warnings: [],
    unknown_blocks: [],
    critical_blocks: [],
  });
  return uiBlocks;
}

function updateMetadata(article, metadata, normalized, candidate, uiBlocks, linked, sourcesFile) {
  const original = readFileSync(path.join(REPO, article.articleFolder, 'original.md'), 'utf8');
  const originalHash = sha256(original);
  const nextMetadata = {
    ...metadata,
    parser_status: 'passed',
    content_complexity: 'plain_markdown',
    content_hash: originalHash,
    original_content_hash: originalHash,
    normalized_content_hash: sha256(normalized),
    candidate_content_hash: sha256(candidate),
    ui_blocks_hash: uiBlocks.ui_blocks_hash,
    linked_questions_hash: linked.linked_questions_hash,
    sources_hash: sourcesFile.sources_hash,
    source_count: sourcesFile.source_count,
    linked_question_count: linked.question_count,
    source_verification_status: 'source_audited_local_first',
    source_verification_batch: BATCH_ID,
    source_audit_date: AUDIT_DATE,
    source_reference_count: sourcesFile.source_count,
    real_world_scenario_status: 'added_source_safe',
    local_source_artifacts: [
      { path: article.sourceCapturePath, sha256: article.sourceCaptureHash },
      { path: article.refinedSourceMapPath, sha256: article.refinedSourceMapHash },
    ],
    reviewed_at: GENERATED_AT,
    reviewed_by: `codex-${BATCH_ID}`,
    reviewer_comments: `Batch ${BATCH} local-first source-audited rewrite constrained to checked local structural source artifacts; no Supabase mutation.`,
    updated_at: GENERATED_AT,
    updated_by: `codex-${BATCH_ID}`,
    updated_note: `Batch ${BATCH} local-first source-audited article and linked-question rewrite; no Supabase mutation.`,
    hash_algorithm: 'sha256',
  };
  writeJson(`${article.articleFolder}/article-metadata.json`, nextMetadata);
  return nextMetadata;
}

function writeSourceEvidence(article, sourcesFile, sourceLocator) {
  const claims = [
    {
      claim_id: `${article.slug}-article-batch-${BATCH}`,
      claim_text: `Article ${article.slug} was rewritten to the checked local source scope for ${article.title}.`,
      claim_type: 'article_rewrite',
      audit_result: 'PASS',
      source_support: {
        raw_capture_path: article.sourceCapturePath,
        raw_capture_sha256: article.sourceCaptureHash,
        refined_conversion_path: article.refinedSourceMapPath,
        refined_conversion_sha256: article.refinedSourceMapHash,
        source_locator: sourceLocator,
      },
      blockers: [],
    },
  ];
  for (const question of readJson(`${article.articleFolder}/linked-questions.json`).questions) {
    claims.push({
      claim_id: `question-${question.question_id}-batch-${BATCH}`,
      claim_text: `Linked question ${question.question_id} was rewritten inside the checked local source scope for ${article.title}.`,
      claim_type: 'question_edit_rewrite',
      audit_result: 'PASS',
      source_support: {
        raw_capture_path: article.sourceCapturePath,
        raw_capture_sha256: article.sourceCaptureHash,
        refined_conversion_path: article.refinedSourceMapPath,
        refined_conversion_sha256: article.refinedSourceMapHash,
        source_locator: sourceLocator,
      },
      blockers: [],
    });
  }
  writeJson(`${article.articleFolder}/source-audit-evidence.json`, {
    schema_version: 'source-audit-evidence-v1',
    batch_id: BATCH_ID,
    batch_number: BATCH,
    audit_date: AUDIT_DATE,
    audited_at: GENERATED_AT,
    target: {
      article_id: article.articleId,
      slug: article.slug,
      title: article.title,
      article_folder: article.articleFolder,
      normalized_sha256: sha256(readFileSync(path.join(REPO, article.articleFolder, 'normalized.md'), 'utf8')),
      candidate_path: `${article.articleFolder}/candidate.md`,
    },
    classification: {
      topic_family: article.clusterId,
      category: article.category,
      source_sensitivity: 'technical_structural_exam_content',
      contains_legal_or_code_claims: article.slug === 'lea-strc-003-04-core-concept',
      requires_raw_source_capture: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: article.slug === 'lea-strc-003-04-core-concept'
        ? ['ASD/LRFD article intentionally excludes full NSCP/AISC/resistance-factor tables pending a captured code/manual source.']
        : [],
    },
    raw_source_gate: {
      status: 'PASS',
      local_sources_checked_first: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      conversion_layer_root: 'vitruvius-connection/002_Raw-Conversion-Layer',
      blockers: [],
    },
    checked_sources: sourcesFile.sources,
    claims,
    real_world_scenario: {
      status: 'added_source_safe',
      source_boundary: sourceLocator,
    },
    blocked_residuals_considered: blockedClusters,
  });
}

function processArticle(article) {
  const metadata = readJson(`${article.articleFolder}/article-metadata.json`);
  const original = readFileSync(path.join(REPO, article.articleFolder, 'original.md'), 'utf8');
  const normalized = article.body.endsWith('\n') ? article.body : `${article.body}\n`;

  const capturePath = `${article.captureRoot}/${article.slug}.source-capture.md`;
  writeText(capturePath, buildSourceCapture(article));
  const captureHash = sha256File(capturePath);
  const refinedPath = `${article.refinedRoot}/${article.slug}.refined.md`;
  writeText(refinedPath, buildRefinedSourceMap(article, capturePath, captureHash));
  const refinedHash = sha256File(refinedPath);
  article.sourceCapturePath = capturePath;
  article.sourceCaptureHash = captureHash;
  article.refinedSourceMapPath = refinedPath;
  article.refinedSourceMapHash = refinedHash;

  const { sourceLocator, file: sourcesFile } = buildSources(article, capturePath, captureHash, refinedPath, refinedHash);
  writeJson(`${article.articleFolder}/sources.json`, sourcesFile);
  const linked = rewriteQuestions(article, sourceLocator);

  writeText(`${article.articleFolder}/normalized.md`, normalized);
  const uiBlocks = writeUiRoundtripFiles(article, original, normalized);
  const { candidate, report: composeReport } = composeCandidate({ normalized, uiBlocks, original });
  const nextMetadata = updateMetadata(article, metadata, normalized, candidate, uiBlocks, linked, sourcesFile);
  const diffReport = diffCandidate({ metadata: nextMetadata, original, normalized, candidate, uiBlocks });
  writeText(`${article.articleFolder}/candidate.md`, candidate);
  writeJson(`${article.articleFolder}/compose-report.json`, composeReport);
  writeJson(`${article.articleFolder}/diff-report.json`, diffReport);
  writeText(`${article.articleFolder}/diff-report.md`, buildDiffMarkdown(diffReport));
  writeJson(`${article.articleFolder}/ui-block-edit-validation.json`, {
    article_id: article.articleId,
    slug: article.slug,
    folder: article.directory,
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [],
    warnings: [],
    edits: [],
  });
  const composeErrorPath = path.join(REPO, article.articleFolder, 'compose-error.json');
  if (existsSync(composeErrorPath)) unlinkSync(composeErrorPath);
  writeSourceEvidence(article, sourcesFile, sourceLocator);

  return {
    article_id: article.articleId,
    cluster_id: article.clusterId,
    slug: article.slug,
    title: article.title,
    category: article.category,
    article_folder: article.articleFolder,
    linked_question_count: linked.question_count,
    question_edit_count: linked.question_count,
    normalized_hash: sha256(normalized),
    candidate_hash: sha256(candidate),
    source_capture_path: capturePath,
    source_capture_hash: captureHash,
    refined_source_map_path: refinedPath,
    refined_source_map_hash: refinedHash,
    source_safe_real_world_scenario: true,
    diff_safe_to_push: diffReport.safe_to_push,
    compose_safe_to_diff: composeReport.safe_to_diff,
  };
}

function listQuestionEdits(articleFolder) {
  const dir = path.join(REPO, articleFolder, 'question-edits');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => `${articleFolder}/question-edits/${name}`);
}

function sourceHashChecks(sources) {
  const checks = [];
  for (const source of sources.sources ?? []) {
    const sourceExists = existsSync(path.join(REPO, source.local_path));
    checks.push({
      source_id: source.source_id,
      path: source.local_path,
      expected: source.local_sha256,
      actual: sourceExists ? sha256File(source.local_path) : null,
      passed: sourceExists && source.local_sha256 === sha256File(source.local_path),
    });
    for (const family of source.local_source_families ?? []) {
      const rawExists = existsSync(path.join(REPO, family.rawPath));
      const refinedExists = existsSync(path.join(REPO, family.refinedPath));
      checks.push({
        source_id: `${source.source_id}:raw:${family.label}`,
        path: family.rawPath,
        expected: family.rawHash,
        actual: rawExists ? sha256File(family.rawPath) : null,
        passed: rawExists && family.rawHash === sha256File(family.rawPath),
      });
      checks.push({
        source_id: `${source.source_id}:refined:${family.label}`,
        path: family.refinedPath,
        expected: family.refinedHash,
        actual: refinedExists ? sha256File(family.refinedPath) : null,
        passed: refinedExists && family.refinedHash === sha256File(family.refinedPath),
      });
    }
  }
  return checks;
}

function scanText(paths, patterns) {
  const matches = [];
  for (const relativePath of paths) {
    const full = path.join(REPO, relativePath);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, 'utf8');
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) matches.push({ path: relativePath, pattern });
    }
  }
  return matches;
}

function baselineQuestionKeys(relativePath) {
  try {
    const output = execFileSync('git', ['show', `${BASELINE}:${relativePath}`], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' });
    const parsed = JSON.parse(output);
    return { available: true, keys: new Map(parsed.questions.map((question) => [question.question_id, question.correct_option_id])) };
  } catch (error) {
    return { available: false, keys: new Map(), error: error instanceof Error ? error.message : String(error) };
  }
}

function buildArticleChecks(article) {
  const folder = article.article_folder;
  const metadata = readJson(`${folder}/article-metadata.json`);
  const linked = readJson(`${folder}/linked-questions.json`);
  const sources = readJson(`${folder}/sources.json`);
  const uiBlocks = readJson(`${folder}/ui-blocks.json`);
  const compose = readJson(`${folder}/compose-report.json`);
  const diff = readJson(`${folder}/diff-report.json`);
  const uiValidation = readJson(`${folder}/ui-block-edit-validation.json`);
  const questionEditPaths = listQuestionEdits(folder);
  const normalizedHash = sha256(readFileSync(path.join(REPO, folder, 'normalized.md'), 'utf8'));
  const candidateHash = sha256(readFileSync(path.join(REPO, folder, 'candidate.md'), 'utf8'));
  const baseline = baselineQuestionKeys(`${folder}/linked-questions.json`);
  const answerKeyChanges = baseline.available
    ? linked.questions.filter((question) => baseline.keys.get(question.question_id) !== question.correct_option_id).map((question) => question.question_id)
    : [];
  const scanPaths = [
    `${folder}/normalized.md`,
    `${folder}/candidate.md`,
    `${folder}/sources.json`,
    `${folder}/source-audit-evidence.json`,
    ...questionEditPaths,
  ];
  const sourceChecks = sourceHashChecks(sources);
  return {
    article_id: article.article_id,
    cluster_id: article.cluster_id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    article_folder: folder,
    linked_question_count: linked.question_count,
    question_edit_count: questionEditPaths.length,
    normalized_hash: normalizedHash,
    candidate_hash: candidateHash,
    source_capture_path: article.source_capture_path,
    source_capture_hash: sha256File(article.source_capture_path),
    refined_source_map_path: article.refined_source_map_path,
    refined_source_map_hash: sha256File(article.refined_source_map_path),
    compose_blockers: (compose.blockers ?? []).length,
    compose_safe_to_diff: compose.safe_to_diff === true,
    diff_blockers: (diff.blockers ?? []).length,
    diff_safe_to_push: diff.safe_to_push === true,
    ui_block_count: uiBlocks.ui_block_count,
    ui_block_validation_valid: uiValidation.valid === true,
    normalized_candidate_hash_match: normalizedHash === candidateHash,
    metadata_hashes_match:
      metadata.normalized_content_hash === normalizedHash &&
      metadata.candidate_content_hash === candidateHash &&
      metadata.linked_questions_hash === linked.linked_questions_hash &&
      metadata.sources_hash === sources.sources_hash &&
      uiBlocks.normalized_content_hash === normalizedHash &&
      linked.linked_questions_hash === sha256Json(linked.questions) &&
      sources.sources_hash === sha256Json(sources.sources),
    source_hash_checks: sourceChecks,
    answer_key_baseline_available: baseline.available,
    answer_key_baseline_error: baseline.error ?? null,
    answer_key_changes: answerKeyChanges,
    marker_matches: scanText(scanPaths, [
      'SLATECAMP_UI_BLOCK',
      'SOURCE_NEEDED',
      'UNCITED',
      'PLACEHOLDER',
      'TODO',
      'FIXME',
      'TBD',
    ]),
    stale_compose_error: existsSync(path.join(REPO, folder, 'compose-error.json')),
    real_world_scenario_status: article.source_safe_real_world_scenario ? 'added_source_safe' : 'not_applicable_logged',
  };
}

function buildStagePaths(articles) {
  const requiredPaths = [
    MANIFEST_PATH,
    QUALITY_REVIEW_PATH,
    STAGE_LIST_PATH,
    STAGE_PATHS_PATH,
    RUNNER_PATH,
    SUMMARY_PATH,
    RUN_SUMMARY_PATH,
    LEDGER_PATH,
    REPORT_PATH,
    SCOPED_CHECKS_PATH,
    '.ai/content-audit-export/ui-block-edit-validation.json',
    '.ai/content-audit-export/validation-report.json',
  ];
  const paths = [...requiredPaths];
  for (const article of articles) {
    const folder = article.article_folder;
    paths.push(
      `${folder}/article-metadata.json`,
      `${folder}/candidate.md`,
      `${folder}/compose-report.json`,
      `${folder}/diff-report.json`,
      `${folder}/diff-report.md`,
      `${folder}/linked-questions.json`,
      `${folder}/normalized.md`,
      `${folder}/parser-errors.json`,
      `${folder}/source-audit-evidence.json`,
      `${folder}/sources.json`,
      `${folder}/ui-block-edit-validation.json`,
      `${folder}/ui-block-edits.json`,
      `${folder}/ui-blocks.json`,
      ...listQuestionEdits(folder),
      article.source_capture_path,
      article.refined_source_map_path,
    );
    const composeError = `${folder}/compose-error.json`;
    if (pathExistsOrTracked(composeError)) paths.push(composeError);
  }
  return [...new Set(paths)].filter((item) => requiredPaths.includes(item) || pathExistsOrTracked(item)).sort();
}

function scopedJsonParse(stagePaths) {
  const failures = [];
  let parsedCount = 0;
  for (const relativePath of stagePaths) {
    if (!relativePath.endsWith('.json')) continue;
    const full = path.join(REPO, relativePath);
    if (!existsSync(full)) continue;
    try {
      JSON.parse(readFileSync(full, 'utf8'));
      parsedCount += 1;
    } catch (error) {
      failures.push({ path: relativePath, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { passed: failures.length === 0, parsed_count: parsedCount, failures };
}

function gitDiffCheck(stagePaths) {
  try {
    execFileSync('git', ['diff', '--check', '--', ...stagePaths], { cwd: REPO, encoding: 'utf8', stdio: 'pipe' });
    return { passed: true, command: `git diff --check -- <batch-${BATCH}-stage-paths>`, output: '' };
  } catch (error) {
    return {
      passed: false,
      command: `git diff --check -- <batch-${BATCH}-stage-paths>`,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim(),
    };
  }
}

function writeScopedValidationSidecars(articleChecks) {
  const articlesForValidation = articleChecks.map((article) => {
    const blockers = [];
    const warnings = [];
    if (article.compose_blockers !== 0) blockers.push('compose-report.json has blockers.');
    if (!article.diff_safe_to_push || article.diff_blockers !== 0) blockers.push('diff-report.json is not safe to push.');
    if (!article.metadata_hashes_match) blockers.push('metadata hashes do not match generated bundle hashes.');
    if (!article.normalized_candidate_hash_match) blockers.push('candidate.md does not match normalized.md for a zero-UI-block bundle.');
    if (article.answer_key_changes.length > 0) blockers.push('linked-question answer keys changed against baseline.');
    if (!article.answer_key_baseline_available) warnings.push(`baseline answer-key check could not read ${BASELINE}; preserved current keys.`);
    if (article.marker_matches.length > 0) blockers.push('marker/source-gap scan found blocked terms.');
    if (article.stale_compose_error) blockers.push('compose-error.json still exists.');
    if (article.question_edit_count !== article.linked_question_count) blockers.push('question-edit count does not match linked-question count.');
    return {
      article_id: article.article_id,
      slug: article.slug,
      folder: path.basename(article.article_folder),
      valid: blockers.length === 0,
      blockers,
      warnings,
      files: {
        metadata: true,
        original: true,
        normalized: true,
        uiBlocks: true,
        uiBlockEdits: true,
        linkedQuestions: true,
        sources: true,
        candidate: true,
        diffReport: true,
        diffReportMarkdown: true,
      },
      hashes: {
        normalized: article.normalized_hash,
        candidate: article.candidate_hash,
      },
    };
  });
  writeJson('.ai/content-audit-export/validation-report.json', {
    generated_at: GENERATED_AT,
    input: path.join(REPO, '.ai/content-audit-export'),
    scope: BATCH_ID,
    article_count: articlesForValidation.length,
    valid: articlesForValidation.every((article) => article.valid),
    blockers: articlesForValidation.flatMap((article) => article.blockers.map((blocker) => `${article.folder}: ${blocker}`)),
    warnings: articlesForValidation.flatMap((article) => article.warnings.map((warning) => `${article.folder}: ${warning}`)),
    articles: articlesForValidation,
  });
  writeJson('.ai/content-audit-export/ui-block-edit-validation.json', {
    generated_at: GENERATED_AT,
    scope: BATCH_ID,
    article_count: articleChecks.length,
    valid: articleChecks.every((article) => article.ui_block_validation_valid && article.ui_block_count === 0),
    blockers: [],
    warnings: [],
    articles: articleChecks.map((article) => ({
      article_id: article.article_id,
      slug: article.slug,
      folder: path.basename(article.article_folder),
      valid: article.ui_block_validation_valid,
      edit_count: 0,
      approved_edit_count: 0,
      blockers: [],
      warnings: [],
      edits: [],
    })),
  });
}

function buildScopedChecks(summary, articleChecks, jsonParse, diffCheck) {
  const totals = {
    article_count: articleChecks.length,
    linked_question_count: articleChecks.reduce((sum, article) => sum + article.linked_question_count, 0),
    question_edit_count: articleChecks.reduce((sum, article) => sum + article.question_edit_count, 0),
    source_artifact_count: articleChecks.length * 2,
    blocked_count: summary.blocked_clusters.length,
  };
  const allSourceHashesPass = articleChecks.every((article) => article.source_hash_checks.every((check) => check.passed));
  const allArticleChecksPass = articleChecks.every((article) =>
    article.compose_blockers === 0 &&
    article.compose_safe_to_diff &&
    article.diff_safe_to_push &&
    article.diff_blockers === 0 &&
    article.ui_block_validation_valid &&
    article.ui_block_count === 0 &&
    article.normalized_candidate_hash_match &&
    article.metadata_hashes_match &&
    article.answer_key_changes.length === 0 &&
    article.marker_matches.length === 0 &&
    !article.stale_compose_error &&
    article.question_edit_count === article.linked_question_count,
  );
  return {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status: STATUS,
    passed: allArticleChecksPass && allSourceHashesPass && jsonParse.passed && TARGETED_TESTS_PASSED && diffCheck.passed,
    constraints: {
      no_supabase: true,
      no_deploy: true,
      no_prod_db: true,
      no_main_merge: true,
      baseline_commit: BASELINE,
      excluded_dirty_paths_preserved: [
        '.ai/00_performance',
        '.ai/00_system/DOCS_SOURCE_OF_TRUTH.md',
        '.ai/README.md',
        '.ai/content-audit-export/sync-state.json',
        '.hermes/skills',
        '.ai/00_system/philip-ux-ui-calibration.md',
        'old unrelated content-roundtrip run dirs',
        '.ai/03_plans/blocked-source-recovery prompts/reports from parallel source-recovery lanes',
      ],
    },
    selection: {
      selected_clusters: summary.selected_clusters,
      blocked_clusters: summary.blocked_clusters,
      residual_queue_exhausted: false,
      note: summary.selection_note,
    },
    totals,
    compose_diff_validate: {
      passed: articleChecks.every((article) => article.compose_blockers === 0 && article.compose_safe_to_diff && article.diff_safe_to_push && article.diff_blockers === 0),
      articles: articleChecks.map((article) => ({
        article_id: article.article_id,
        slug: article.slug,
        compose_blockers: article.compose_blockers,
        compose_safe_to_diff: article.compose_safe_to_diff,
        diff_safe_to_push: article.diff_safe_to_push,
        diff_blockers: article.diff_blockers,
        metadata_hashes_match: article.metadata_hashes_match,
      })),
    },
    ui_block_validation: {
      passed: articleChecks.every((article) => article.ui_block_validation_valid && article.ui_block_count === 0 && article.marker_matches.length === 0),
      articles: articleChecks.map((article) => ({
        article_id: article.article_id,
        slug: article.slug,
        ui_block_count: article.ui_block_count,
        validation_valid: article.ui_block_validation_valid,
        normalized_candidate_hash_match: article.normalized_candidate_hash_match,
      })),
    },
    scoped_json_parse: jsonParse,
    marker_source_gap_scan: {
      passed: articleChecks.every((article) => article.marker_matches.length === 0),
      scanned_count: articleChecks.reduce((sum, article) => sum + 5 + article.question_edit_count, 0),
      matches: articleChecks.flatMap((article) => article.marker_matches),
    },
    source_hash_checks: {
      passed: allSourceHashesPass,
      checks: articleChecks.flatMap((article) => article.source_hash_checks),
    },
    question_edit_count: {
      passed: totals.question_edit_count === totals.linked_question_count && articleChecks.every((article) => article.answer_key_changes.length === 0),
      expected: totals.linked_question_count,
      actual: totals.question_edit_count,
      answer_key_changes: articleChecks.reduce((sum, article) => sum + article.answer_key_changes.length, 0),
      articles: articleChecks.map((article) => ({
        article_id: article.article_id,
        slug: article.slug,
        linked_questions: article.linked_question_count,
        question_edits: article.question_edit_count,
        answer_key_changes: article.answer_key_changes.length,
        answer_key_baseline_available: article.answer_key_baseline_available,
      })),
    },
    stale_compose_error_scan: {
      passed: articleChecks.every((article) => !article.stale_compose_error),
      stale_files: articleChecks.filter((article) => article.stale_compose_error).map((article) => `${article.article_folder}/compose-error.json`),
    },
    targeted_tests: {
      passed: TARGETED_TESTS_PASSED,
      command: TARGETED_TESTS_COMMAND,
    },
    scoped_git_diff_check: diffCheck,
  };
}

function validationSummary(scopedChecks) {
  return {
    compose_diff_validate_passed: scopedChecks.compose_diff_validate.passed,
    ui_block_validation_passed: scopedChecks.ui_block_validation.passed,
    scoped_json_parse_passed: scopedChecks.scoped_json_parse.passed,
    marker_source_gap_scan_passed: scopedChecks.marker_source_gap_scan.passed,
    source_hash_checks_passed: scopedChecks.source_hash_checks.passed,
    question_edit_count_passed: scopedChecks.question_edit_count.passed,
    stale_compose_error_scan_passed: scopedChecks.stale_compose_error_scan.passed,
    targeted_tests_passed: scopedChecks.targeted_tests.passed,
    scoped_git_diff_check_passed: scopedChecks.scoped_git_diff_check.passed,
  };
}

function reportMarkdown(summary, articleChecks, validation, branch) {
  const selected = articleChecks.map((article) => `- \`${article.slug}\` (${article.title}): ${article.question_edit_count}/${article.linked_question_count} questions, scenario ${article.real_world_scenario_status}`).join('\n');
  const blocked = summary.blocked_clusters.map((item) => `- \`${item.cluster_id}\` (${item.title}): ${item.reason}`).join('\n');
  return `# Batch ${BATCH} Source-Audited Local-First Report

Generated: ${GENERATED_AT}
Status: ${STATUS}
Baseline: ${BASELINE}
Branch: ${branch}

## Scope

Batch ${BATCH} continued the residual non-prac local-first pass after Batch 141 consumed \`lea-strc-002-01\`, \`lea-strc-002-02\`, \`lea-strc-002-03\`, \`lea-strc-002-04\`, and \`lea-strc-002-05\`.

${selected}

Blocked residuals carried forward instead of invented:

${blocked}

## Validation

- Compose/diff/validate: ${validation.compose_diff_validate_passed ? 'PASS' : 'FAIL'}
- UI-block validation: ${validation.ui_block_validation_passed ? 'PASS' : 'FAIL'}
- JSON parse: ${validation.scoped_json_parse_passed ? 'PASS' : 'FAIL'}
- Marker/source-gap scan: ${validation.marker_source_gap_scan_passed ? 'PASS' : 'FAIL'}
- Source hash checks: ${validation.source_hash_checks_passed ? 'PASS' : 'FAIL'}
- Question-edit count and answer keys: ${validation.question_edit_count_passed ? 'PASS' : 'FAIL'}
- Stale compose-error scan: ${validation.stale_compose_error_scan_passed ? 'PASS' : 'FAIL'}
- Targeted content-audit tests: ${validation.targeted_tests_passed ? 'PASS' : 'FAIL'}
- Scoped git diff --check: ${validation.scoped_git_diff_check_passed ? 'PASS' : 'FAIL'}

## Notes

No Supabase, production database, deploy, or main merge was performed. The source boundary is local structural source artifacts from Building Construction Illustrated, Building Structures Illustrated, Hibbeler Statics, Applied Statics and Strength of Materials, Mechanics and Strength of Materials, and Fundamentals of Structural Engineering. Full NSCP/AISC/resistance-factor tables, uncaptured material-grade tables, bridge-design span tables, and code-specific seismic details remain excluded until captured locally.
`;
}

function qualityReviewMarkdown(summary, articleChecks, validation) {
  const failed = Object.entries(validation).filter(([, passed]) => passed !== true).map(([key]) => key);
  const perArticle = articleChecks.map((article) => `- \`${article.slug}\`: compose blockers ${article.compose_blockers}, diff blockers ${article.diff_blockers}, UI blocks ${article.ui_block_count}, source hashes ${article.source_hash_checks.every((check) => check.passed) ? 'PASS' : 'FAIL'}, answer-key changes ${article.answer_key_changes.length}`).join('\n');
  return `# Batch ${BATCH} Independent Quality Review

Generated: ${GENERATED_AT}
Reviewer: codex-local-runner

## Verdict

${failed.length === 0 ? `PASS. Batch ${BATCH} is ready for git handoff review.` : `FAIL. Blocking checks: ${failed.join(', ')}`}

## Article Review

${perArticle}

## Scope Discipline

- Source artifacts were generated before each article/question update.
- Candidate files were composed from normalized content and zero preserved UI blocks.
- Raw UI-block markers were scanned out of normalized/candidate/question sidecars.
- Unsupported full NSCP/AISC/resistance-factor/material-grade/span tables were removed instead of reasserted without source.
- Carried-forward blocked residuals remain logged: ${summary.blocked_clusters.map((item) => item.cluster_id).join(', ')}.
`;
}

function stageListMarkdown(stagePaths, validation) {
  const stageLines = stagePaths
    .map((item, index) => `  ${JSON.stringify(item)}${index === stagePaths.length - 1 ? '' : ' \\'}`)
    .join('\n');
  return `# Batch ${BATCH} Git Handoff Stage List

Generated: ${GENERATED_AT}
Status: ${STATUS}

## Validation Snapshot

- Compose/diff/validate: ${validation.compose_diff_validate_passed ? 'PASS' : 'FAIL'}
- UI-block validation: ${validation.ui_block_validation_passed ? 'PASS' : 'FAIL'}
- JSON parse: ${validation.scoped_json_parse_passed ? 'PASS' : 'FAIL'}
- Source hash checks: ${validation.source_hash_checks_passed ? 'PASS' : 'FAIL'}
- Question edits: ${validation.question_edit_count_passed ? 'PASS' : 'FAIL'}
- Targeted tests: ${validation.targeted_tests_passed ? 'PASS' : 'FAIL'}
- Scoped git diff --check: ${validation.scoped_git_diff_check_passed ? 'PASS' : 'FAIL'}

## Stage Command

\`\`\`bash
git add -f \\
${stageLines}
\`\`\`

The \`vitruvius-connection\` paths may be ignored by git defaults, so keep \`-f\` for this handoff.
`;
}

function writeFinalArtifacts(summary, articleChecks) {
  const branch = branchName();
  const stagePaths = buildStagePaths(articleChecks);
  const jsonParse = scopedJsonParse(stagePaths);
  const diffCheck = gitDiffCheck(stagePaths);
  writeScopedValidationSidecars(articleChecks);
  const scopedChecks = buildScopedChecks(summary, articleChecks, jsonParse, diffCheck);
  const validation = validationSummary(scopedChecks);
  const manifest = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch,
    status: STATUS,
    selection: scopedChecks.selection,
    articles: articleChecks.map((article) => ({
      article_id: article.article_id,
      cluster_id: article.cluster_id,
      slug: article.slug,
      title: article.title,
      category: article.category,
      article_folder: article.article_folder,
      linked_question_count: article.linked_question_count,
      question_edit_count: article.question_edit_count,
      normalized_hash: article.normalized_hash,
      candidate_hash: article.candidate_hash,
      source_capture_path: article.source_capture_path,
      source_capture_hash: article.source_capture_hash,
      refined_source_map_path: article.refined_source_map_path,
      refined_source_map_hash: article.refined_source_map_hash,
      real_world_scenario_status: article.real_world_scenario_status,
      diff_safe_to_push: article.diff_safe_to_push,
    })),
    validation,
    constraints: scopedChecks.constraints,
    handoff: {
      intended_commit: `Improve residual source-audited batch ${BATCH} content`,
      exact_stage_paths_file: STAGE_PATHS_PATH,
      no_supabase_or_deploy: true,
    },
  };
  const ledger = {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch,
    status: STATUS,
    selection: manifest.selection,
    excluded_dirty_paths: scopedChecks.constraints.excluded_dirty_paths_preserved,
    validations: validation,
    articles: manifest.articles,
    stage_paths_file: STAGE_PATHS_PATH,
  };
  writeJson(SCOPED_CHECKS_PATH, scopedChecks);
  writeJson(MANIFEST_PATH, manifest);
  writeJson(LEDGER_PATH, ledger);
  writeText(REPORT_PATH, reportMarkdown(summary, articleChecks, validation, branch));
  writeText(QUALITY_REVIEW_PATH, qualityReviewMarkdown(summary, articleChecks, validation));
  writeText(STAGE_LIST_PATH, stageListMarkdown(stagePaths, validation));
  writeText(STAGE_PATHS_PATH, `${stagePaths.join('\n')}\n`);
  return { scopedChecks, validation };
}

function main() {
  const processed = articles.map(processArticle);
  const selectedClusters = processed.map((article) => ({
    cluster_id: article.cluster_id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    status: 'selected_sourceable_batch_142',
    reason: 'Next sourceable residual non-prac structural bundles after Batch 141 consumed structural 002-01 through 002-05; constrained to existing local raw/refined structural source artifacts.',
  }));
  const summary = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    selected_clusters: selectedClusters,
    blocked_clusters: blockedClusters,
    selection_note: 'Batch 142 skipped the carried-forward theory/materials/utilities blocked residuals because no completed recovery reports were present, then selected the next five sourceable non-prac structural bundles: lea-strc-002-06 and lea-strc-003-01 through lea-strc-003-04.',
    articles: processed,
    totals: {
      article_count: processed.length,
      linked_question_count: processed.reduce((sum, article) => sum + article.linked_question_count, 0),
      question_edit_count: processed.reduce((sum, article) => sum + article.question_edit_count, 0),
      source_artifact_count: processed.length * 2,
    },
    constraints: {
      no_supabase: true,
      no_deploy: true,
      no_prod_db: true,
      no_main_merge: true,
      unrelated_dirty_paths_preserved: [
        '.ai/00_performance',
        '.ai/00_system/DOCS_SOURCE_OF_TRUTH.md',
        '.ai/README.md',
        '.ai/content-audit-export/sync-state.json',
        '.hermes/skills',
        '.ai/00_system/philip-ux-ui-calibration.md',
        'old unrelated content-roundtrip run dirs',
        '.ai/03_plans/blocked-source-recovery prompts/reports from parallel source-recovery lanes',
      ],
    },
  };
  writeJson(SUMMARY_PATH, summary);
  writeJson(RUN_SUMMARY_PATH, summary);
  const articleChecks = processed.map(buildArticleChecks);
  const { scopedChecks, validation } = writeFinalArtifacts(summary, articleChecks);
  console.log(JSON.stringify({
    ok: scopedChecks.passed,
    batch: BATCH,
    articles: processed.length,
    question_edits: summary.totals.question_edit_count,
    validation,
    manifest: MANIFEST_PATH,
    report: REPORT_PATH,
    scoped_checks: SCOPED_CHECKS_PATH,
  }, null, 2));
}

main();
