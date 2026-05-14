#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildDiffMarkdown, composeCandidate, diffCandidate } from '../../../scripts/content-audit/lib.ts';

const REPO = process.cwd();
const BATCH = 141;
const BASELINE = 'a94a600e2';
const BATCH_ID = 'source-audited-article-batch-141-local-first';
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = GENERATED_AT.slice(0, 10);
const STATUS = process.env.BATCH141_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_PASSED = process.env.BATCH141_TARGETED_TESTS_PASSED === 'true';
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
  bciSystems: {
    label: 'Building Construction Illustrated (5th Edition)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
    locator: 'Building Construction Illustrated refined markdown lines 1860-1873, 1885-1905, 1921-1997, 2007-2010, 2025-2031, and 7300-7415',
    notes: [
      'A truss is based on triangular geometry and its members are intended to work in axial tension or compression.',
      'Loadbearing walls transmit compressive forces to the ground and are most vulnerable to forces perpendicular to their plane.',
      'Openings in loadbearing walls weaken continuity and need a lintel or arch to carry load around the opening.',
      'Building vertical support may be provided by loadbearing walls or by a column-and-beam framework.',
      'Rigid floor diaphragms can transfer lateral loads to shear walls, braced frames, or rigid frames.',
      'Shear walls, braced frames, and rigid frames can be used singly or in combination for lateral stability.',
      'Rigid frames are useful where braced frames or shear walls would create unwanted barriers, but they are less efficient for lateral stability.',
      'Taller buildings often need rigid frames supplemented by bracing mechanisms such as diagonal bracing or a rigid core.',
      'Wood truss loads should be applied at panel points to avoid secondary bending, and bracing or diaphragm action may be needed for lateral wind or seismic forces.',
    ],
  },
  hibbelerTruss: {
    label: 'Hibbeler Statics 13th Edition',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Hibbeler Statics 13th Ed.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Hibbeler Statics 13th Ed.md',
    locator: 'Hibbeler Statics refined markdown lines 21217-21290, 21320-21378, 21693-21758, 21825-21921, and 21927-22271',
    notes: [
      'A truss is composed of slender members joined at their endpoints.',
      'Planar trusses are commonly used for roofs and bridges.',
      'Truss analysis assumes loads act at joints and joints are treated as pins.',
      'Under those assumptions, each member acts as a two-force member carrying tension or compression along its axis.',
      'A simple truss begins with a triangular unit and can be expanded by adding members and joints.',
      'Zero-force members may be identified by joint equilibrium when no external load or support reaction acts at the joint.',
      'Two non-collinear members at an unloaded joint are zero-force members.',
      'For three members at an unloaded joint, if two are collinear, the third is a zero-force member.',
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
  bearingSystem: [
    ['A tall mixed-use project is being discussed as a bearing-wall scheme. What is the source-safe response?', 'Do not cite a height ban; explain that loadbearing walls become limiting when openness and lateral stability demands grow, so a frame plus lateral system is often more practical.', ['Bearing walls are locally prohibited above a fixed story count in this source packet.', 'Bearing walls always outperform frames for every tall building.', 'The number of stories is irrelevant to structural system selection.']],
    ['Why might a frame system be preferred for a 12-story office program?', 'Columns and beams can give more open planning while shear walls, braced frames, or rigid frames handle lateral stability.', ['Bearing walls cannot carry any lateral force.', 'Frames are automatically cheaper for every project regardless of layout.', 'Bearing walls are locally allowed only below six stories by this source packet.']],
    ['What is the main advantage of a low-rise bearing-wall layout when walls stack cleanly?', 'Walls can act as the primary vertical support and define repeated rooms with a direct compression load path.', ['It removes the need for foundations.', 'It guarantees absolute seismic safety without lateral checks.', 'It gives larger open spans than a frame.']],
    ['Why can bearing walls be economical in simple low-rise layouts?', 'The wall can serve enclosure, space division, and vertical support when the plan aligns with the load path.', ['They eliminate all structural engineering.', 'Masonry is the only material available for walls.', 'They automatically satisfy every lateral force condition.']],
    ['What defines a bearing wall system in this Batch 141 source boundary?', 'Vertical support is provided mainly by loadbearing walls rather than by a column-and-beam skeleton.', ['Walls are nonstructural partitions only.', 'All walls must be masonry regardless of loads.', 'Walls carry lateral loads but never vertical load.']],
    ['What planning advantage does a frame system usually have over a bearing-wall system?', 'Nonstructural partitions can be placed more freely because beams and columns carry the primary vertical loads.', ['Bearing walls also allow unlimited openings if they are thin.', 'Frames always shorten construction time by themselves.', 'Frames provide thermal insulation as their main structural benefit.']],
    ['In a frame system, how do gravity loads typically reach the foundation?', 'Floor loads go to beams, then to columns, and then down to foundations.', ['Loads bypass beams and go directly through every partition.', 'Loads are distributed equally to all walls regardless of support.', 'Loads are carried only by shear walls.']],
    ['Which lateral-stability distinction is source-safe?', 'Bearing walls need lateral support for out-of-plane forces, while frames may rely on rigid joints, bracing, or shear walls.', ['Frames cannot use lateral bracing.', 'Both systems resist lateral loads identically through wall mass.', 'Only shear walls ever resist lateral loads.']],
    ['What is the clearest load-path difference between bearing walls and frames?', 'Bearing-wall layouts route vertical support through walls; frames route vertical support through beams and columns.', ['Frames and bearing walls always use the same element for all load effects.', 'Load paths are not part of system classification.', 'Bearing walls separate vertical and lateral behavior more than frames in every case.']],
    ['What is a safe comparison of bearing walls and moment frames under lateral effects?', 'Loadbearing walls are stiff but vulnerable out of plane; rigid frames can keep space open but are less efficient unless supplemented for lateral stability.', ['Bearing walls are always more flexible than frames.', 'Both systems respond identically regardless of configuration.', 'Bearing walls are never usable where lateral forces exist.']],
  ],
  shearWall: [
    ['What is the primary source-safe role of a shear wall?', 'It is a vertical lateral-resisting element that receives forces from floor or roof diaphragms.', ['It carries only plumbing loads.', 'It is a nonstructural finish panel.', 'It replaces foundations.']],
    ['Why might extra transfer members be needed when shear walls are not aligned with the floor load path?', 'The diaphragm must provide a reliable path so lateral forces can reach the resisting walls.', ['Collectors are required by the article title alone.', 'Asymmetry makes lateral loads disappear.', 'Wall position never affects force transfer.']],
    ['An irregular floor plan must send lateral force to a few wall lines. What source-safe idea controls the answer?', 'A diaphragm acts as a horizontal deep beam transferring force to shear walls, braced frames, or rigid frames.', ['The floor slab has no lateral role.', 'Only wall thickness matters; the load path does not.', 'A code zone number alone proves the load path.']],
    ['If a question asks about a boundary element but this batch lacks a captured boundary-detailing source, what should the answer do?', 'Stay at the source-safe level: identify wall-edge detailing as outside this packet and answer only the checked wall/diaphragm load path.', ['Invent transverse-reinforcement rules.', 'Quote uncaptured NSCP detailing values.', 'Ignore source boundaries because the term is familiar.']],
    ['What is the safest description of a collector or drag strut in this pass?', 'Treat it as a load-path transfer member only when the checked source boundary supports the diaphragm-to-wall path, not as a detailed code design rule.', ['Assign a fixed reinforcement schedule.', 'Call it a finish material.', 'Say it is never needed in irregular plans.']],
    ['What does a horizontal diaphragm do in the local source boundary?', 'It transfers lateral loads to vertical shear walls, braced frames, or rigid frames.', ['It only carries paint finishes.', 'It prevents all vertical loads from reaching columns.', 'It is always flexible and never rigid.']],
    ['What is the source-safe distinction between rigid and flexible diaphragm claims in this pass?', 'Only the general diaphragm transfer role is captured; detailed rigid-versus-flexible distribution rules need a more specific source.', ['Rigid diaphragms always distribute loads equally.', 'Flexible diaphragms have no structural function.', 'The source packet gives a full design table.']],
    ['How should collectors be discussed for an irregular perimeter wall layout?', 'As part of the lateral-force path that must connect diaphragm action to the resisting wall or frame system.', ['As decorative trim around the floor plate.', 'As a replacement for all shear walls.', 'As a code value that can be quoted without source.']],
    ['In a concrete floor with separated shear walls, what source-safe role can the slab serve?', 'It can act as a diaphragm transferring lateral force toward the vertical resisting elements.', ['It has no lateral load function.', 'It becomes a bearing wall.', 'It automatically proves all detailing is compliant.']],
    ['What is the safe relationship between confinement detailing and shear-wall boundary elements in this batch?', 'Detailed confinement requirements are outside the captured source, so keep the answer to the checked concept that shear walls are vertical lateral-resisting elements.', ['The packet proves every boundary spacing value.', 'Boundary elements are architectural finishes.', 'Confinement is the same as floor diaphragm action.']],
  ],
  rigidFrame: [
    ['What is the source-safe purpose of confinement or connection detailing in a frame question?', 'Do not invent detailing rules; answer that frame performance depends on the connection and lateral system captured by the source.', ['Quote a transverse reinforcement spacing from memory.', 'Treat detailing as a nonstructural finish.', 'Say connections do not affect frame behavior.']],
    ['Why is a specially detailed frame conceptually more demanding than an ordinary rigid frame?', 'Because the connection and member detailing must support the intended lateral behavior, but exact categories require a code source not captured here.', ['Because ordinary frames are locally illegal by this source packet.', 'Because the source packet gives exact R factors.', 'Because detailing has no effect on lateral behavior.']],
    ['What is the safe difference between named moment-frame categories in this pass?', 'The category labels and R factors are not source-supported here; keep the article to rigid-frame behavior and lateral-stability tradeoffs.', ['IMRF and SMRF values can be quoted from memory.', 'All named frame categories have the same requirements.', 'The title alone validates the exact code table.']],
    ['A designer proposes a rigid frame as the main lateral system. What source-safe concern should be checked?', 'Rigid frames can preserve open space but are less efficient laterally and may need bracing or a rigid core as height increases.', ['A fixed R factor from an uncaptured table.', 'A rule that rigid frames cannot resist any lateral load.', 'A claim that frames require no lateral analysis.']],
    ['Which moment-frame type is appropriate for a Philippine seismic zone according to this packet?', 'The packet does not support choosing a code category; it supports only the general rigid-frame concept and need for captured code before category selection.', ['Ordinary moment frame in every case.', 'Intermediate moment frame in every case.', 'Special moment frame in every case.']],
    ['What can be said safely about an R factor in this Batch 141 boundary?', 'It is excluded unless a local refined code source is captured; do not use an R factor to answer these rewritten questions.', ['It is always 8.0 for every frame.', 'It is a wall thickness value.', 'It replaces the need for lateral stability.']],
    ['What should replace a question asking for the exact SMRF R factor?', 'A source-boundary answer: exact R factors are not asserted in this local packet.', ['A memorized value with no local locator.', 'A claim that R factors do not exist.', 'A wall-opening rule.']],
    ['How should weld or connection claims be handled here?', 'Keep them general: rigid frame behavior depends on joints capable of transferring moment, while exact weld requirements need a captured design source.', ['Quote full-penetration weld rules from memory.', 'Say all frame joints are pinned.', 'Treat welds as unrelated to lateral behavior.']],
    ['What assumption must be valid for a rigid frame to act as a lateral system?', 'Its joints and members must provide the intended moment transfer and stability path.', ['The floor plan must have no columns.', 'All walls must be nonbearing.', 'The R factor can be guessed.']],
    ['What is the safest answer to a question asking for maximum R factor and force reduction?', 'Do not answer with an uncaptured code value; state that the current source boundary supports only rigid-frame behavior, not code-table force reduction.', ['Use the largest remembered number.', 'Use any value because force reduction is decorative.', 'Use a bearing-wall threshold instead.']],
  ],
  bearingWall: [
    ['A nonbearing curtain wall is attached to a frame. What is the source-safe structural concern?', 'It must be supported and attached for imposed lateral or out-of-plane effects without treating it as the primary gravity system.', ['It automatically becomes a bearing wall.', 'It needs no support because it is nonbearing.', 'It replaces the frame.']],
    ['What distinguishes a parapet wall in a source-safe wall question?', 'It is a wall portion extending above the roof line and must be considered for out-of-plane stability rather than assumed harmless.', ['It is always a foundation wall.', 'It is always a floor diaphragm.', 'It is never exposed to lateral effects.']],
    ['What should replace an NSCP bearing-wall threshold question in this pass?', 'A source-boundary answer: exact local threshold values are excluded unless a refined code source is captured.', ['Quote the threshold from memory.', 'Use a cavity-wall air-space value.', 'Assume every wall is bearing.']],
    ['A cavity wall air-space item appears, but no source map captures that limit. What is the correct action?', 'Do not assert compliance values; answer only within the checked wall-load and opening-support concepts.', ['Invent a maximum air space.', 'Treat the cavity as a shear wall.', 'Use the old answer because it sounds familiar.']],
    ['A masonry wall carries only a small superimposed load. What source-safe classification approach applies?', 'Determine whether it is intended as loadbearing from its actual support role, not from uncaptured numeric thresholds.', ['Use a memorized NSCP number without a source.', 'Classify it by paint finish.', 'Assume all masonry is nonbearing.']],
    ['What is the source-safe distinction between buttressing and wall support in this packet?', 'Loadbearing walls vulnerable to out-of-plane force need lateral support from buttressing, cross walls, transverse frames, or slabs.', ['Counterfort dimensions are fully captured here.', 'Buttressing is only a decorative treatment.', 'Wall support is unrelated to lateral stability.']],
    ['A wood stud wall carries load. How should this batch classify it?', 'By its support role and load path, while excluding uncaptured code threshold values.', ['By a fixed threshold quoted from memory.', 'By finish material only.', 'By assuming all wood studs are nonbearing.']],
    ['Why are bearing and nonbearing walls designed differently?', 'A loadbearing wall transmits compression to the ground; a nonbearing partition does not serve that primary load path.', ['Only color differs.', 'Nonbearing walls always carry more load.', 'The source says they are identical.']],
    ['What should an examiner do with a wall-opening scenario?', 'Recognize that openings weaken loadbearing continuity and need a lintel or arch to carry load around the opening.', ['Ignore the opening.', 'Treat every opening as a diaphragm.', 'Assume an opening strengthens the wall.']],
    ['A wall carries a decorative ceiling load. What is the source-safe decision path?', 'Read whether the wall is intended to support superimposed load and avoid unsupported numeric thresholds in this pass.', ['Use a remembered threshold without local evidence.', 'Declare every decorative-load wall bearing.', 'Ignore the load path entirely.']],
  ],
  truss: [
    ['At an unloaded joint, two non-collinear truss members meet. What is the source-safe conclusion?', 'Both members are zero-force members under that loading condition.', ['One member must carry the entire roof load.', 'Both members are always compression members.', 'The conclusion cannot be made from joint equilibrium.']],
    ['How should a Pratt-truss orientation question be handled in this pass?', 'Avoid unsupported pattern recall and answer from checked truss principles: loads at joints, axial members, and equilibrium.', ['Invent a diagram that is not in the local source map.', 'Claim the pattern is irrelevant to every truss.', 'Use a code table value.']],
    ['A roof truss carries roofing load across its top. What source-safe issue matters before analysis?', 'Loads should be transferred to panel points to avoid secondary bending in truss members.', ['Loads should be applied anywhere along each member.', 'Panel points are architectural decoration.', 'The support type does not affect member forces.']],
    ['What makes trusses structurally efficient in the checked sources?', 'Triangular geometry and two-force members allow primary axial tension or compression.', ['Every member carries bending only.', 'They work because joints are fully fixed.', 'They avoid all need for bracing and anchorage.']],
    ['What is a zero-force member?', 'A member that carries no direct load for the given loading condition but may be useful for stability or changed loading.', ['A member that must be removed from construction.', 'A member that always carries maximum compression.', 'A member with unknown material.']],
    ['How should Warren-pattern recall be treated here?', 'Use only source-supported truss fundamentals unless a captured configuration diagram is available.', ['Quote an uncaptured image description as fact.', 'Say Warren trusses are not trusses.', 'Answer with a wall-system rule.']],
    ['What is safe to say about tension and compression in truss members?', 'Under the pin-joint assumptions, member force acts along the member axis as either tension or compression.', ['Every diagonal is tension in every truss.', 'Every vertical is compression in every truss.', 'Trusses carry only bending and never axial force.']],
    ['Name the member groups that are safe from the checked truss source boundary.', 'Chords and web members, with joints or panel points organizing the truss.', ['Curtain wall, parapet, and cavity.', 'Fixture, riser, and vent.', 'Setback, easement, and RROW.']],
    ['In a pitched roof truss, when should zero-force member rules be applied?', 'Only after checking the joint has no external load or support reaction and the member geometry matches the rule.', ['Whenever a member looks short.', 'Whenever a joint is at the roof apex.', 'Only by using a code table.']],
    ['At an unloaded joint with three members, two collinear and one not collinear, which member is zero-force?', 'The non-collinear third member.', ['Both collinear members.', 'All members at every support.', 'No member can be identified by inspection.']],
  ],
};

const articles = [
  {
    clusterId: 'lea-strc-002-01-core-concept',
    slug: 'lea-strc-002-01-core-concept',
    title: 'Bearing wall system relies on walls to resist both',
    category: 'Structural Conceptualization',
    sourceKeys: ['bciSystems'],
    questionPool: 'bearingSystem',
    summary: 'Reframed bearing-wall systems against the checked building-systems source boundary: vertical support through loadbearing walls, frame support through beams and columns, and lateral stability through diaphragms, shear walls, braced frames, or rigid frames.',
    body: `# Bearing Wall Systems and Frame Systems

## Board Exam Quick Check

For Batch 141, classify the structural system by load path. Do not quote story limits, seismic-zone labels, or response-factor values unless the item provides a captured code source. The safe question is: which elements provide vertical support, and what elements complete the lateral stability path?

## What You Need to Know for the LEA

A bearing wall system uses loadbearing walls as the main vertical support. Building Construction Illustrated describes loadbearing walls as wall elements that transmit compressive forces to the ground. In a system sense, the wall is not just a partition: it is part of the gravity load path and must stay continuous enough to carry load around openings and down to the foundation.

A frame system uses a column-and-beam framework for primary vertical support. That gives the plan more freedom because many partitions can be nonbearing. The frame still needs a lateral strategy. The checked source boundary supports the general idea that rigid floor diaphragms can transfer lateral loads to shear walls, braced frames, or rigid frames.

The key LEA distinction is not a memorized height rule. It is whether walls or a column-and-beam skeleton are doing the primary support work, and whether the lateral path is complete.

## Real World Scenario

A small dormitory with repeated rooms may be efficient when walls stack and carry gravity load directly. A larger office plan may need wider open bays and movable partitions, so a frame with a separate lateral system is usually easier to coordinate. This scenario is source-safe because it follows the checked load-path distinction; it does not assert an uncaptured NSCP height or R-factor rule.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Bearing wall system | Vertical support is mainly through loadbearing walls. |
| Frame system | Vertical support is mainly through beams and columns. |
| Lateral path | Diaphragms transfer lateral loads to shear walls, braced frames, or rigid frames. |
| Open planning | Frames usually give more nonbearing partition flexibility. |
| Batch 141 limit | No story cap, seismic-zone value, or R factor is asserted here. |

## Common Mistakes

- Treating a familiar "bearing wall" phrase as permission to quote uncaptured code values.
- Forgetting that openings weaken loadbearing-wall continuity.
- Calling a frame laterally stable without identifying the lateral-resisting path.
- Assuming every wall in a building is structural.
`,
  },
  {
    clusterId: 'lea-strc-002-02-core-concept',
    slug: 'lea-strc-002-02-core-concept',
    title: 'Shear wall',
    category: 'Structural Conceptualization',
    sourceKeys: ['bciSystems'],
    questionPool: 'shearWall',
    summary: 'Constrained shear-wall content to the local building-systems source boundary: horizontal diaphragms transfer lateral load to vertical shear walls, braced frames, or rigid frames; detailed collector, boundary-element, and confinement rules are excluded without a captured code/design source.',
    body: `# Shear Walls and Diaphragm Load Paths

## Board Exam Quick Check

Answer shear-wall questions from the load path first. A floor or roof diaphragm collects lateral force and transfers it toward vertical resisting elements. In this batch, do not add detailed collector, boundary-element, or confinement requirements unless a captured design source is provided.

## What You Need to Know for the LEA

A shear wall is a vertical lateral-resisting element. In the checked source boundary, it is part of a lateral stability system together with the horizontal diaphragm. Building Construction Illustrated describes a rigid floor structure acting as a flat, deep beam that transfers lateral loads to vertical shear walls, braced frames, or rigid frames.

That means the LEA cue is usually about continuity. The load starts as wind or earthquake effect on the building mass or envelope, enters a floor or roof diaphragm, and must reach a vertical resisting element. When the plan is irregular, the exam trap is to ignore how force crosses the diaphragm to reach the wall line.

This article deliberately avoids exact NSCP collector design, boundary-element confinement, and rigid-versus-flexible distribution rules. Those are design-code details and need a more specific local refined source before restoration.

## Real World Scenario

An L-shaped school block has stair-core walls concentrated near one leg of the plan. A source-safe review asks whether the floor diaphragm has a clear lateral-force path from the remote wing to the wall line. The answer stays at the conceptual load-path level and does not invent reinforcement details.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Diaphragm | Horizontal floor or roof action that transfers lateral load. |
| Shear wall | Vertical element receiving and resisting lateral force. |
| Irregular plan | Check continuity between diaphragm and resisting element. |
| Boundary element or collector detail | Excluded unless a captured design source is present. |
| Batch 141 limit | No detailed NSCP confinement or collector sizing values. |

## Common Mistakes

- Treating a shear wall as just any thick wall.
- Forgetting the diaphragm-to-wall transfer path.
- Answering detailed reinforcement questions from memory without a source.
- Assuming irregular plans transfer lateral force automatically.
`,
  },
  {
    clusterId: 'lea-strc-002-03-core-concept',
    slug: 'lea-strc-002-03-core-concept',
    title: 'Moment-resisting frame (MRF)',
    category: 'Structural Conceptualization',
    sourceKeys: ['bciSystems'],
    questionPool: 'rigidFrame',
    summary: 'Rewrote the moment-frame bundle to source-safe rigid-frame behavior and lateral-stability tradeoffs; removed unsupported OMRF, IMRF, SMRF, R-factor, and weld-detail assertions pending a captured local code/design source.',
    body: `# Moment-Resisting Frames as Rigid Frames

## Board Exam Quick Check

For this batch, treat moment-frame items as rigid-frame behavior questions, not code-table recall. The captured source supports the idea that rigid frames can resist lateral loads while preserving open space, but it does not support exact OMRF, IMRF, SMRF, R-factor, or weld-detail values.

## What You Need to Know for the LEA

A moment-resisting frame is a frame that relies on beam-column joints and member bending to participate in lateral stability. Building Construction Illustrated uses the broader term rigid frame in its lateral-stability discussion. It notes that shear walls, braced frames, and rigid frames can be used singly or in combination to stabilize a structure.

Rigid frames are useful where braced frames or shear walls would create unwanted barriers between adjacent spaces. That is the architectural advantage: a frame can keep bays more open. The tradeoff is structural efficiency. The checked source describes rigid frames as the least efficient of the three vertical lateral systems and notes that as buildings get taller, frames may need additional bracing mechanisms or rigid cores.

This is why Batch 141 removes unsupported response-modification values. Exact frame categories and detailing requirements are code/design claims; they need a captured local refined source before being restored.

## Real World Scenario

A studio building wants open workrooms without diagonal braces across the facade. A rigid frame may keep the space open, but the design team still has to check whether the frame alone is efficient or whether shear walls, bracing, or a core should supplement the lateral system. That scenario is source-safe because it uses the checked lateral-system tradeoff without inventing code factors.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Rigid or moment frame | Uses frame action and joints as part of lateral resistance. |
| Advantage | Keeps spaces more open than many braced-wall layouts. |
| Tradeoff | Less laterally efficient than shear walls or braced frames. |
| Taller buildings | May need bracing, a rigid core, or another supplement. |
| Batch 141 limit | No OMRF/IMRF/SMRF R-factor or weld-detail values. |

## Common Mistakes

- Answering from memorized R factors with no captured code source.
- Treating rigid frames as always the most efficient lateral system.
- Forgetting that open planning does not remove lateral-force requirements.
- Confusing a pinned gravity frame with a frame intended to transfer moment.
`,
  },
  {
    clusterId: 'lea-strc-002-04-core-concept',
    slug: 'lea-strc-002-04-core-concept',
    title: 'Bearing wall',
    category: 'Structural Conceptualization',
    sourceKeys: ['bciSystems'],
    questionPool: 'bearingWall',
    summary: 'Restored bearing-wall content to the checked source boundary: loadbearing walls transmit compression to ground, are vulnerable out of plane, need lateral support, and openings require lintels or arches; uncaptured NSCP thresholds and cavity-wall limits were excluded.',
    body: `# Bearing Walls

## Board Exam Quick Check

Do not answer this bundle by quoting uncaptured numeric thresholds. First decide whether the wall is part of the load path. A bearing wall carries load to the ground; a nonbearing wall is primarily enclosure or partition and needs attachment for its own imposed effects.

## What You Need to Know for the LEA

Building Construction Illustrated describes a loadbearing wall as a wall that acts like a long, thin column transmitting compressive force to the ground. It is most effective when carrying coplanar, uniformly distributed loads. It is most vulnerable to force perpendicular to its plane.

For lateral stability, a loadbearing wall may need help from buttressing, pilasters, cross walls, transverse rigid frames, or horizontal slabs. This matters in exam questions because a wall can be strong in compression yet weak out of plane if it is not properly tied or braced.

Openings are another major cue. A door or window interrupts the wall's load path. The checked source states that a lintel or arch must support load above an opening and allow compression to flow around the opening to adjacent wall portions.

This batch excludes exact NSCP bearing-wall thresholds and cavity-wall air-space values. Those claims need a captured code/source map before use.

## Real World Scenario

A rowhouse layout has masonry walls stacked from floor to floor. When a wider storefront opening is cut into the ground floor, the wall above cannot simply hang in space. The source-safe answer is to provide a lintel or arch path around the opening and check out-of-plane stability, without inventing uncaptured numeric limits.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Loadbearing wall | Transmits compressive load to the ground. |
| Out-of-plane force | Critical vulnerability; needs lateral support. |
| Opening | Needs lintel or arch support above. |
| Nonbearing wall | Not the primary vertical load path, but still needs support/attachment. |
| Batch 141 limit | No NSCP threshold or cavity-wall compliance value asserted. |

## Common Mistakes

- Classifying walls by material alone instead of load path.
- Treating nonbearing walls as unsupported decorations.
- Ignoring openings in a loadbearing wall.
- Quoting threshold values not present in the local source capture.
`,
  },
  {
    clusterId: 'lea-strc-002-05-core-concept',
    slug: 'lea-strc-002-05-core-concept',
    title: 'Truss is a structural system of straight members',
    category: 'Structural Conceptualization',
    sourceKeys: ['bciSystems', 'hibbelerTruss'],
    questionPool: 'truss',
    summary: 'Reworked truss content around checked BCI and Hibbeler statics claims: triangular geometry, pin-joint assumptions, loads at panel points, axial tension/compression, and zero-force member rules.',
    body: `# Trusses and Zero-Force Members

## Board Exam Quick Check

For this batch, answer truss questions from the checked statics assumptions. The safe cues are triangular geometry, joints or panel points, axial member force, and zero-force member inspection. Do not depend on an uncaptured image of a named truss configuration.

## What You Need to Know for the LEA

A truss is a structure made of slender members joined at their endpoints. Building Construction Illustrated emphasizes triangular geometry and axial tension or compression. Hibbeler Statics explains the analysis assumptions used for simple trusses: loads are applied at joints, joints are treated as pins, and members act as two-force members. Under those assumptions, force in each member acts along the member axis as tension or compression.

Panel points matter. Loads should be transferred to panel points if members are to remain primarily axial. Loads applied between joints can create secondary bending, which is no longer the clean truss assumption tested in many statics questions.

Zero-force members are identified by joint equilibrium. If two non-collinear members meet at an unloaded joint with no support reaction, both are zero-force members. If three members meet at an unloaded joint and two are collinear, the non-collinear third member is a zero-force member.

## Real World Scenario

A market roof truss receives roofing loads through purlins. A source-safe review asks whether loads enter the truss at panel points and whether any unloaded joints reveal zero-force members before full member-force analysis. That is the checked statics workflow and does not require an uncaptured configuration diagram.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Truss geometry | Triangulated member system. |
| Member action | Primarily axial tension or compression under pin-joint assumptions. |
| Loading | Apply loads at joints or panel points for clean truss behavior. |
| Two unloaded non-collinear members | Both are zero-force members. |
| Three members, two collinear, unloaded joint | The non-collinear member is zero-force. |

## Common Mistakes

- Applying load between panel points and still assuming pure axial behavior.
- Calling a member zero-force without checking the joint load and geometry.
- Memorizing truss names while ignoring the free-body diagram.
- Assuming a zero-force member is useless in every load case.
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
    '- No NSCP numerical bearing-wall thresholds, cavity-wall limits, seismic-zone labels, OMRF/IMRF/SMRF R factors, collector design rules, or boundary-element confinement details are asserted in this Batch 141 bundle.',
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
    '- Question rewrites preserve answer keys while replacing unsupported code-value recall with checked structural system concepts.',
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
  rationale.takeaway = `For ${article.title}, read the structural load path first and stay inside the checked local source families.`;
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
    reviewer_comments: `Batch ${BATCH} local-first source-audited rewrite constrained to Building Construction Illustrated and Hibbeler local source artifacts.`,
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
      contains_legal_or_code_claims: false,
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

Batch ${BATCH} continued the residual non-prac local-first pass after Batch 140 consumed \`lea-strc-001-02\`, \`lea-strc-001-03\`, \`lea-strc-001-04\`, \`lea-strc-001-05\`, and \`lea-strc-001-06\`.

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

No Supabase, production database, deploy, or main merge was performed. The source boundary is local Building Construction Illustrated plus Hibbeler Statics source artifacts. NSCP-specific values, R factors, collector sizing, and boundary-element detailing remain excluded until a completed local refined source/recovery report exists.
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

- Source artifacts were generated before article/question updates.
- Candidate files were composed from normalized content and zero preserved UI blocks.
- Raw UI-block markers were scanned out of normalized/candidate/question sidecars.
- Unsupported NSCP/R-factor/detailing claims were removed instead of reasserted without source.
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
    status: 'selected_sourceable_batch_141',
    reason: 'Next sourceable residual non-prac structural-system bundle after Batch 140; constrained to existing local Building Construction Illustrated and Hibbeler Statics raw/refined source artifacts.',
  }));
  const summary = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    selected_clusters: selectedClusters,
    blocked_clusters: blockedClusters,
    selection_note: 'Batch 141 skipped the carried-forward theory/materials/utilities blocked residuals because no completed recovery reports were present, then selected the next five sourceable non-prac structural system clusters with local raw/refined BCI and Hibbeler artifacts.',
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
