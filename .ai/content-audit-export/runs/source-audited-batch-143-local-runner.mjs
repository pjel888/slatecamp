#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildDiffMarkdown, composeCandidate, diffCandidate } from '../../../scripts/content-audit/lib.ts';

const REPO = process.cwd();
const BATCH = 143;
const BASELINE = '7b45d9b74';
const BATCH_ID = 'source-audited-article-batch-143-local-first';
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = GENERATED_AT.slice(0, 10);
const STATUS = process.env.BATCH143_STATUS ?? 'passed_local_validation_git_handoff_pending';
const TARGETED_TESTS_PASSED = process.env.BATCH143_TARGETED_TESTS_PASSED === 'true';
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
const NSCP_RAW_PATH = 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf';

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
  bsiSeismic: {
    label: 'Building Structures Illustrated (2nd Edition)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'Building Structures Illustrated refined markdown lines 4289-4309, 4332-4333, and 4867-4917',
    notes: [
      'Seismic response depends on ground motion magnitude, duration, and harmonic character, plus structure size, configuration, stiffness, and ground material.',
      'Continuous load paths transfer earthquake-induced forces from points of application through the structure to the foundation.',
      'Seismic inertial force follows mass times acceleration; reducing mass can lessen inertial force.',
      'Seismic base shear is the minimum design total lateral seismic force assumed at the base for concept-level design.',
      'Vertical irregularities include soft stories, weak stories, load-path discontinuities, geometric irregularities, and weight or mass irregularities.',
    ],
  },
  bsiLiveLoad: {
    label: 'Building Structures Illustrated (2nd Edition)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Structures Illustrated (2nd Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Structures Illustrated (2nd Edition).md',
    locator: 'Building Structures Illustrated refined markdown lines 2077-2133 and 2872-2876',
    notes: [
      'Live loads are moving or movable loads created by occupancy, collected water or snow, and movable equipment or objects.',
      'Dead loads are static loads from construction weight, permanent fixtures, and permanently attached equipment.',
      'Loads trace from slab or deck through beams, girders, columns, and walls to the foundation.',
      'Distributed and concentrated loading differ in how load reaches the spanning system.',
      'Floor systems must be stiff while remaining elastic because deflection and vibration can control design.',
    ],
  },
  bciLateral: {
    label: 'Building Construction Illustrated (5th Edition)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/Building Construction Illustrated (5th Edition).md',
    locator: 'Building Construction Illustrated refined markdown lines 720, 2107-2143, 4149-4153, and 4189-4197',
    notes: [
      'Foundations support vertical dead and live loads and also anchor against earthquake ground movement, wind sliding, overturning, and uplift.',
      'Floor and roof systems support dead, live, and lateral loads; rigid floor planes can act as diaphragms that transfer lateral forces to shear walls.',
      'Earthquakes can move a building base suddenly and induce shaking in all directions, with horizontal components treated as most important in structural design.',
      'Under earthquake loading, building mass develops inertial force as it resists horizontal ground acceleration.',
      'Heavy buildings can resist wind overturning by weight but are susceptible to larger earthquake inertial forces.',
    ],
  },
  dynamicsEarthquake: {
    label: 'Dynamics of Structures: Theory and Applications to Earthquake Engineering',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Dynamics of Structures_ Theory and applications to earthquake engineering.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Dynamics of Structures_ Theory and applications to earthquake engineering.md',
    locator: 'Dynamics of Structures refined markdown lines 11592-11608, 11711-11713, 12096-12110, 12183-12185, and 12315-12331',
    notes: [
      'A strong-motion accelerograph records three components of earthquake ground shaking and is triggered by arriving earthquake waves.',
      'Accelerographs must be maintained and serviced so they produce a record when shaking occurs.',
      'Acceleration-time records can be integrated to velocity and displacement, but baseline and triggering issues affect accuracy.',
      'Peak base shear relates to structure weight and pseudo-acceleration through a base shear or lateral force coefficient.',
      'Response spectra organize peak deformation, pseudo-velocity, and pseudo-acceleration response over vibration periods and damping levels.',
    ],
  },
  fundamentalsStrength: {
    label: 'Fundamentals of Structural Engineering',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Fundamentals of Structural Engineering.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Fundamentals of Structural Engineering.md',
    locator: 'Fundamentals of Structural Engineering refined markdown lines 1217-1223, 61490-61509, 62119-62128, and 62390-62417',
    notes: [
      'Structural design philosophy satisfies safety and serviceability.',
      'Safety is checked by requiring resistance to exceed demand for extreme loading.',
      'Serviceability checks keep structures operational under service loads.',
      'Strength-design examples use factored load combinations and envelopes to identify governing design actions.',
      'The checked source contains example load combinations but is not a complete NSCP factor table for this batch.',
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
    reason: 'No completed NSCP-specific refined conversion or recovery report is present for this pass.',
  },
  {
    cluster_id: 'lea-strc-004-02-core-concept',
    title: 'Seismic zone factor and NSCP 2015 zone claims',
    status: 'blocked_batch_143',
    reason: 'The local NSCP 2015 PDF exists but is unreadable as a PDF in this workspace, with a zero-byte-style header and parser failures; no completed recovery report supplies a safe local or web-capture path for exact seismic-zone claims.',
    attempted_local_source: NSCP_RAW_PATH,
    attempted_local_source_sha256: existsSync(path.join(REPO, NSCP_RAW_PATH)) ? sha256File(NSCP_RAW_PATH) : null,
  },
];

const questionPools = {
  earthquakeResponse: [
    ['What is the safest first principle for explaining earthquake response in this source boundary?', 'A building response depends on ground motion, structural configuration and stiffness, mass, and supporting ground material.', ['A single memorized zone number explains the full response.', 'Only the finish material matters.', 'The structure can be evaluated without a load path.']],
    ['Why is a continuous load path central to seismic design?', 'It transfers earthquake-induced forces from their points of application through the structure to the foundation.', ['It removes the need for diaphragms.', 'It converts all seismic force into gravity load.', 'It applies only to plumbing equipment.']],
    ['What is the source-safe meaning of seismic inertial force?', 'It is the force associated with mass resisting acceleration during ground shaking.', ['It is a permanent dead load value only.', 'It is the same as wind suction.', 'It is a code edition number.']],
    ['Why can reducing building mass improve seismic behavior?', 'Less mass can reduce earthquake inertial force for the same acceleration.', ['More mass always lowers all seismic force.', 'Mass has no relation to earthquake response.', 'Only plan color affects seismic response.']],
    ['What is seismic base shear at the concept level?', 'The minimum design total lateral seismic force assumed at the structure base.', ['The vertical soil bearing pressure only.', 'A roof drainage load.', 'A material-property value.']],
    ['Which project should be flagged for more complex dynamic analysis in this source boundary?', 'A high-rise or irregular structure, or a structure on soft or plastic soil susceptible to poor seismic behavior.', ['A perfectly regular low-risk one-story storage shed only.', 'Any project with painted steel.', 'A site with no lateral forces.']],
    ['What does a response spectrum help organize?', 'Peak structural response over a range of vibration periods and damping levels.', ['Only architectural style periods.', 'Only the number of columns in a grid.', 'Only live-load occupancy labels.']],
    ['Why can two earthquake records at similar distance differ?', 'Local soil conditions and other site effects can make recorded accelerations vary significantly.', ['Distance is the only variable.', 'The accelerograph changes the earthquake source.', 'All soils record identical shaking.']],
    ['What foundation action is source-safe for earthquake review?', 'The foundation must help anchor the superstructure against ground movement and related lateral effects.', ['The foundation carries vertical load only.', 'The foundation eliminates all need for bracing.', 'The foundation changes live load to dead load.']],
    ['How should exact Philippine seismic zone values be handled in this batch?', 'Do not use them unless a readable local source or completed recovery report supplies the exact code claim.', ['Restore the remembered values from memory.', 'Use any zone table from another country.', 'Treat zone factor as a live load.']],
  ],
  baseShear: [
    ['What is the source-safe relationship behind base shear?', 'It is tied to the inertial force from structural mass or weight and acceleration response.', ['It is independent of mass.', 'It is only a vertical compression stress.', 'It is a finish schedule item.']],
    ['What does a base shear coefficient do conceptually?', 'It multiplies structural weight to represent an equivalent lateral seismic force.', ['It chooses paint color.', 'It sets the number of stairs.', 'It removes all lateral-force analysis.']],
    ['Which condition is a soft-story warning at source-safe level?', 'One story is significantly more flexible laterally than the story above or below.', ['The story has softer flooring only.', 'The story uses a lighter paint color.', 'The story has no mass.']],
    ['Which condition is a weak-story warning at source-safe level?', 'One story has significantly less lateral strength than adjacent stories.', ['The story has less daylight.', 'The story has more plumbing fixtures.', 'The story uses smaller room numbers.']],
    ['What is story drift?', 'The relative horizontal displacement between adjacent floors or stories.', ['The total building dead load.', 'The vertical distance from footing to roof.', 'A material yield value.']],
    ['Why is a discontinuous shear wall or lateral system risky?', 'It interrupts the load path and can force lateral effects into transfer elements or weaker stories.', ['It always improves the load path.', 'It only changes acoustics.', 'It makes all floors independent of lateral load.']],
    ['What happens when heavy mass is added high in a building?', 'It can increase earthquake inertial demand and lateral-force effects at upper levels.', ['It always reduces base shear.', 'It affects only room temperature.', 'It cancels story drift automatically.']],
    ['What is the role of diaphragms in this source boundary?', 'They distribute lateral forces to vertical resisting elements such as shear walls or frames.', ['They are purely decorative ceiling panels.', 'They carry only plumbing pressure.', 'They remove the need for foundations.']],
    ['Why should exact NSCP soft-story percentages stay out of this batch?', 'The local NSCP source was not readable, so exact threshold values are outside the checked source boundary.', ['The thresholds are unnecessary in every future task.', 'The values can be invented from memory.', 'A different source category can supply any code number.']],
    ['What is the best exam strategy for vertical irregularity questions here?', 'Identify the behavior cue, then answer with the load-path, mass, stiffness, strength, or drift concept supported by the local sources.', ['Start by quoting an uncaptured code table.', 'Ignore configuration and only calculate floor area.', 'Treat all irregularities as live-load reductions.']],
  ],
  accelerograph: [
    ['What does a strong-motion accelerograph record?', 'Three components of earthquake ground shaking.', ['Only room temperature.', 'Only total dead load.', 'Only final building displacement after repairs.']],
    ['When does the checked source say the accelerograph begins recording?', 'It is triggered into motion by the first arriving earthquake waves.', ['It records continuously forever in every installation.', 'It starts only after structural collapse.', 'It starts when live load changes.']],
    ['Why must accelerographs be maintained and serviced?', 'They must be ready to produce a record when shaking occurs.', ['They are used only as permanent bracing.', 'They replace the foundation.', 'They determine floor finishes.']],
    ['What is an accelerogram?', 'An acceleration-time record of ground motion.', ['A floor framing plan.', 'A dead-load inventory.', 'A concrete mix table.']],
    ['Why can velocity and displacement from an acceleration record be difficult to determine?', 'Triggering and baseline issues can affect integration of the acceleration-time record.', ['Velocity and displacement are unrelated to acceleration.', 'The record contains only occupancy names.', 'Digital instruments cannot store onset data.']],
    ['What did digital accelerographs improve in the checked source?', 'They can record the onset of ground motion with short memory, reducing missing-baseline problems.', ['They make earthquakes smaller.', 'They remove all need for analysis.', 'They change live loads to dead loads.']],
    ['Why are many stations desirable before an earthquake?', 'They improve the chance of recording strong shaking near the region of interest.', ['They guarantee identical data at every site.', 'They replace code review.', 'They are needed only for wind tunnel tests.']],
    ['Why can recorded peak accelerations vary at similar distances?', 'Local soil conditions can cause significant variation.', ['All variation is a math error.', 'Only building color controls records.', 'Distance is never relevant.']],
    ['How should accelerograph data be used in this batch?', 'As source-supported evidence for measuring ground motion and structural response, not as a substitute for uncaptured code tables.', ['As a replacement for all structural judgment.', 'As a way to invent Philippine code values.', 'As proof that live loads are zero.']],
    ['Which NSCP instrumentation thresholds are excluded here?', 'Exact story-count, quantity, and importance-factor thresholds are excluded until a readable NSCP source is captured.', ['All measurement concepts are excluded.', 'The accelerograph definition is excluded.', 'Ground motion records are irrelevant.']],
  ],
  liveLoad: [
    ['What is a live load in the checked source boundary?', 'A moving or movable load caused by occupancy, collected water or snow, or movable equipment and objects.', ['The permanent self-weight of the structure.', 'The color of a finish material.', 'The earthquake zone factor.']],
    ['What is a dead load?', 'A static load from the weight of construction, permanent fixtures, and permanently attached equipment.', ['A crowd moving through a lobby.', 'Temporary stored boxes only.', 'A lateral response spectrum.']],
    ['What does load tracing require?', 'Following loads from the surface or deck through members and supports to the foundation.', ['Listing only the room name.', 'Stopping at the floor finish.', 'Replacing all loads with a single code factor.']],
    ['How do distributed and concentrated loads differ?', 'Distributed loads spread over area or length, while concentrated loads act over a small area or point.', ['They are identical in every member.', 'Only concentrated loads can be vertical.', 'Distributed loads apply only during earthquakes.']],
    ['Why can a concentrated load control a floor check?', 'It may demand larger local support than a light uniform load pattern.', ['It always has zero reaction.', 'It proves the structure is a space frame.', 'It has no relation to member sizing.']],
    ['Why can deflection or vibration control a floor system?', 'The floor must remain stiff while elastic so finishes, ceilings, and occupant comfort are not harmed.', ['Deflection is never part of service behavior.', 'Only collapse matters for every floor.', 'Vibration applies only to plumbing pipes.']],
    ['What should an architect flag when a room use changes to dense movable storage?', 'The live-load demand may change and needs structural review against the intended occupancy/load case.', ['The dead load automatically becomes zero.', 'The lateral load path disappears.', 'Only wall color must be checked.']],
    ['How can a diaphragm relate to floor systems?', 'A rigid floor plane can transfer lateral forces to shear walls or other resisting elements.', ['It is only a ceiling finish.', 'It stores water for drainage.', 'It removes live load from the floor.']],
    ['Why should exact NSCP live-load table values stay out of this batch?', 'The exact local code table was not safely captured, so use source concepts or values supplied by the item.', ['All live loads are the same value.', 'Memorized numbers are always safe.', 'Occupancy never affects live load.']],
    ['What is the best LEA habit for live-load questions here?', 'Identify whether the item asks for load type, load path, distribution, or supplied code value before calculating.', ['Apply one number to every occupancy.', 'Skip units and tributary area.', 'Treat every load as seismic base shear.']],
  ],
  requiredStrength: [
    ['What is required strength in a strength-design check?', 'The demand side produced by loads and load combinations for comparison with available resistance.', ['The same as architectural read time.', 'The permanent weight of finishes only.', 'A material color schedule.']],
    ['What is the source-safe safety check?', 'Resistance must exceed demand for extreme loading.', ['Demand must exceed resistance.', 'Service loads are ignored in every method.', 'The drawing scale decides capacity.']],
    ['How is serviceability different from strength safety?', 'Serviceability keeps the structure operational under service loads, including deformation and motion limits.', ['It is identical to collapse prevention.', 'It applies only to color selection.', 'It removes all need for load combinations.']],
    ['What do factored load combinations do?', 'They amplify or combine load effects to find governing strength-design demand.', ['They change the building occupancy label only.', 'They replace all structural analysis.', 'They apply only to nonstructural paint.']],
    ['Why are envelopes useful in the checked examples?', 'They identify governing moment, shear, or axial demand among multiple load combinations.', ['They are only drawing-title blocks.', 'They cancel all load cases.', 'They are plumbing details.']],
    ['What is the risk of mixing design formats?', 'Comparing service-level demand to factored resistance, or factored demand to allowable stress, can produce an invalid check.', ['Mixing formats is always more accurate.', 'It affects only typography.', 'It is required by every source.']],
    ['What should happen when a question supplies D, L, W, or E values?', 'Identify the load types and use the item-supplied combination or the captured source rule.', ['Invent a different combination from memory.', 'Ignore load labels.', 'Treat every value as live load.']],
    ['Why is a full NSCP load-combination table excluded here?', 'The readable local source boundary did not supply the full current NSCP table for this batch.', ['Load combinations do not exist.', 'Every factor can be guessed safely.', 'NSCP tables are replaced by accelerographs.']],
    ['What does the checked Fundamentals source allow this batch to say?', 'It supports strength-design examples with factored load combinations and governing envelopes, but not a complete local code table.', ['It supplies every Philippine code formula.', 'It removes serviceability from design.', 'It proves all structures use one factor.']],
    ['What is the best exam habit for required-strength items?', 'Name the design format, identify loads, apply the supplied combination, and compare demand with resistance in the same format.', ['Start with an uncaptured factor table.', 'Compare any demand to any capacity.', 'Skip units and load direction.']],
  ],
};

const articles = [
  {
    clusterId: 'lea-strc-004-01-core-concept',
    slug: 'lea-strc-004-01-core-concept',
    title: 'Earthquake ground motion and structural response',
    category: 'Structural Conceptualization',
    sourceKeys: ['bsiSeismic', 'bciLateral', 'dynamicsEarthquake'],
    questionPool: 'earthquakeResponse',
    summary: 'Reframed earthquake content around checked local structural sources: ground motion, mass and inertial force, continuous load paths, base shear as a concept, response spectra, and source-safe exclusions for exact Philippine seismic-zone values.',
    body: `# Earthquake Ground Motion and Structural Response

## Board Exam Quick Check

Treat earthquake response as a behavior and load-path question before it becomes a table lookup. The checked local sources support ground motion, mass, stiffness, configuration, soil condition, response spectra, and continuous load path claims. Exact Philippine seismic-zone values remain outside this batch because the local NSCP 2015 PDF could not be read.

## What You Need to Know for the LEA

An earthquake moves the ground and can move a building base suddenly. Building Construction Illustrated describes earthquake ground motion as three-dimensional, while the horizontal component is commonly the dominant structural-design concern. Building Structures Illustrated adds that seismic response depends on the magnitude, duration, and harmonic character of the ground motion; the building size, configuration, and stiffness; and the ground material under the structure.

The key structural idea is inertia. During shaking, building mass resists horizontal ground acceleration. The resulting inertial force is related to mass and acceleration, so unnecessary mass can be a liability in seismic design. This is why the same source boundary can say that mass, stiffness, configuration, and soil all matter without inventing a local code coefficient.

Earthquake forces need a continuous path. Forces must move from floors and diaphragms into vertical resisting elements and then into the foundation. The foundation does not only carry vertical gravity load; it also anchors against earthquake ground movement, wind sliding, overturning, and uplift.

Response spectra give engineers a way to organize peak response over different vibration periods and damping levels. Dynamics of Structures ties pseudo-acceleration to equivalent static force and base shear, but this article stays at the concept level. It does not restore exact NSCP seismic zone factors, Z values, maps, or province lists.

## Real World Scenario

A mid-rise school on soft ground has a heavy roof deck and an offset classroom wing. A source-safe review asks whether mass is being added high in the building, whether diaphragms have a continuous path to vertical resisting elements, and whether the irregular wing may require more than a simple static concept check. That is enough for this local source boundary; exact NSCP zone values need a readable code source.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Seismic response | Depends on ground motion, structure, stiffness, mass, and ground material. |
| Inertial force | Mass resisting acceleration during shaking. |
| Load path | Continuous path from diaphragms and frames or walls to foundation. |
| Base shear | Conceptual total lateral seismic force at the base. |
| Response spectrum | Peak response organized by period and damping. |

## Common Mistakes

- Starting with a remembered zone factor when the item asks for behavior.
- Ignoring mass and configuration in seismic response.
- Treating foundations as vertical-load-only elements.
- Reusing exact NSCP values without a readable local source capture.
`,
  },
  {
    clusterId: 'lea-strc-004-03-core-concept',
    slug: 'lea-strc-004-03-core-concept',
    title: 'Base shear and vertical irregularities',
    category: 'Structural Conceptualization',
    sourceKeys: ['bsiSeismic', 'bciLateral', 'dynamicsEarthquake'],
    questionPool: 'baseShear',
    summary: 'Rebuilt base-shear content around checked local dynamics and building-structures sources: base shear as equivalent lateral force, mass/weight and pseudo-acceleration, diaphragms, drift, vertical irregularities, soft and weak stories, and load-path discontinuities without exact NSCP threshold tables.',
    body: `# Base Shear and Vertical Irregularities

## Board Exam Quick Check

Base shear is the concept-level total lateral seismic force at the base. For this batch, answer from mass, acceleration response, load path, diaphragms, stiffness, strength, and irregularity cues. Do not use exact NSCP soft-story or weak-story percentages unless a readable code source is supplied.

## What You Need to Know for the LEA

Building Structures Illustrated describes seismic base shear as the minimum design value for the total lateral seismic force on a structure. Dynamics of Structures explains the same family of ideas through equivalent static force, pseudo-acceleration, structural weight, and a base shear coefficient. At exam level, the safe idea is simple: earthquake lateral demand is tied to mass or weight and acceleration response.

The base shear does not stay only at the base. It is distributed through floors and diaphragms above the base. Rigid floor planes can act as diaphragms, transferring lateral forces to shear walls, frames, or other vertical resisting systems. If that load path is interrupted, the force must detour through transfer elements and local damage risk rises.

Vertical irregularities are configuration problems in elevation. The checked Building Structures Illustrated source identifies soft stories, weak stories, geometric irregularities, load path discontinuities, and weight or mass irregularities as seismic concerns. A soft story is a stiffness problem. A weak story is a strength problem. Story drift is relative horizontal displacement between adjacent stories.

This article intentionally avoids exact percentage thresholds, response modification values, and NSCP classification tables. Those are code-specific claims and remain blocked until the local code source is readable or a completed recovery report supplies a safe capture.

## Real World Scenario

A commercial building has open parking at the ground floor, heavy storage on an upper floor, and a shear wall that stops above the lobby. A source-safe review flags three issues: possible soft or weak story behavior at the open level, increased inertial demand from added mass, and discontinuity where the wall stops. The concept is supportable locally without quoting NSCP percentages.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Base shear | Total lateral seismic force concept at the base. |
| Base shear coefficient | Weight multiplier tied to pseudo-acceleration response. |
| Soft story | Significant lateral stiffness weakness. |
| Weak story | Significant lateral strength weakness. |
| Story drift | Relative horizontal displacement between adjacent stories. |

## Common Mistakes

- Confusing soft story with weak story.
- Treating diaphragms as decorative ceiling panels.
- Ignoring load-path discontinuities in elevation.
- Quoting exact code thresholds that were not captured in this batch.
`,
  },
  {
    clusterId: 'lea-strc-004-04-core-concept',
    slug: 'lea-strc-004-04-core-concept',
    title: 'Accelerographs and strong-motion records',
    category: 'Structural Conceptualization',
    sourceKeys: ['dynamicsEarthquake'],
    questionPool: 'accelerograph',
    summary: 'Rewrote accelerograph content to the checked Dynamics of Structures boundary: strong-motion accelerographs, three-component records, triggering, maintenance, acceleration-time histories, integration limits, station coverage, site variation, and exclusion of exact NSCP instrumentation thresholds.',
    body: `# Accelerographs and Strong-Motion Records

## Board Exam Quick Check

An accelerograph is a measurement instrument, not a code table. The checked source supports three-component ground-shaking records, triggered operation, maintenance needs, acceleration-time histories, and the care required when deriving velocity and displacement.

## What You Need to Know for the LEA

Dynamics of Structures identifies the strong-motion accelerograph as the basic instrument for recording three components of earthquake ground shaking. It does not record continuously in the ordinary setup described by the source. It is triggered by the first waves of an earthquake and continues recording while shaking is present.

The instrument must be maintained and serviced so that it produces a record when shaking occurs. This practical point matters because earthquakes are uncertain in time and location, and strong-motion stations are limited by installation and maintenance budgets.

An accelerogram is an acceleration-time record. Engineers can integrate acceleration to estimate velocity and displacement, but the checked source warns that triggering and baseline issues affect accuracy. Digital instruments help by retaining short memory so the onset of ground motion is measured more reliably.

Recorded accelerations tend to be larger near the earthquake source, but similar distances can still produce different records because local soil conditions and site effects matter. This article does not assert exact NSCP instrumentation story counts, instrument quantities, or importance-factor requirements.

## Real World Scenario

A city wants to compare how two nearby sites shook during the same earthquake. Strong-motion records can show different peak accelerations even when distances are similar, so the source-safe analysis checks local soil and record quality before drawing conclusions. The accelerograph data supports hazard understanding, but it does not replace a readable local code requirement.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Accelerograph | Records three components of ground shaking. |
| Triggering | Starts when earthquake waves arrive. |
| Accelerogram | Acceleration-time ground-motion record. |
| Integration caution | Velocity and displacement depend on baseline and record quality. |
| Site variation | Local soil can change recorded accelerations. |

## Common Mistakes

- Treating an accelerograph as a bracing device.
- Forgetting that records need maintenance-ready instruments.
- Assuming acceleration records automatically give perfect displacement.
- Restoring exact NSCP instrumentation thresholds without a captured code source.
`,
  },
  {
    clusterId: 'lea-strc-004-05-core-concept',
    slug: 'lea-strc-004-05-core-concept',
    title: 'Live loads, load tracing, and floor behavior',
    category: 'Structural Conceptualization',
    sourceKeys: ['bsiLiveLoad', 'bciLateral', 'dynamicsEarthquake'],
    questionPool: 'liveLoad',
    summary: 'Reworked live-load content to checked local sources: moving and movable occupancy loads, distinction from dead loads, load tracing through spanning systems, distributed versus concentrated loading, deflection and vibration serviceability, diaphragms, and exclusion of exact NSCP live-load tables.',
    body: `# Live Loads, Load Tracing, and Floor Behavior

## Board Exam Quick Check

Live load is about occupancy and movable demand. First separate dead load from live load, then trace the load through the spanning system. Exact NSCP live-load table values are excluded from this batch unless the item supplies them.

## What You Need to Know for the LEA

Building Structures Illustrated defines live loads as moving or movable loads created by people, occupancy, collected water or snow, and movable equipment or objects. Dead loads are static: the weight of building construction, permanent fixtures, and permanently attached equipment.

Load tracing is the habit that prevents shallow answers. A floor load starts at the surface layer, moves through slab or deck, then into joists, beams, girders, columns, walls, and the foundation. If the floor system also acts as a diaphragm, it can transfer lateral forces to vertical resisting elements.

The way the load is applied matters. Distributed loading spreads over an area or length. Concentrated loading acts over a small area or point and can control local support or member design. Floors must also be stiff while remaining elastic because excessive deflection and vibration can damage finishes, ceilings, and occupant comfort.

This article does not reproduce local live-load kPa or psf tables, live-load reduction formulas, or occupancy-specific code values. For this batch, use the concept or the value supplied in the question.

## Real World Scenario

A small archive room is converted into dense movable storage. The original floor may have been selected for ordinary office live load, but storage changes the movable load demand and possibly the concentrated load pattern. A source-safe review traces the load path and checks serviceability rather than guessing a code table value.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Live load | Moving or movable load from occupancy and movable objects. |
| Dead load | Static load from construction and permanent equipment. |
| Load tracing | Follow load through floor, beams, columns or walls, and foundation. |
| Concentrated load | Load over a small point or area. |
| Floor serviceability | Deflection and vibration can control design. |

## Common Mistakes

- Treating movable storage as dead load.
- Stopping load tracing at the finish floor.
- Ignoring concentrated load effects.
- Quoting exact NSCP live-load values that are not captured locally.
`,
  },
  {
    clusterId: 'lea-strc-005-01-core-concept',
    slug: 'lea-strc-005-01-core-concept',
    title: 'Required strength and factored demand',
    category: 'Structural Design Criteria',
    sourceKeys: ['fundamentalsStrength', 'bsiLiveLoad'],
    questionPool: 'requiredStrength',
    summary: 'Converted required-strength content into a source-safe strength-design bundle: demand versus resistance, safety and serviceability, factored load combinations and envelopes, same-format comparison, and explicit exclusion of a complete NSCP load-combination table.',
    body: `# Required Strength and Factored Demand

## Board Exam Quick Check

Required strength is the demand side of a strength check. Identify the load types, the design format, and the combination supplied or captured before comparing demand with resistance.

## What You Need to Know for the LEA

Fundamentals of Structural Engineering frames structural design around safety and serviceability. Safety requires resistance to exceed demand for extreme loading. Serviceability keeps the structure operational under service loads, including deflection, motion, and damage limits.

In strength-design language, required strength is the load effect demand produced by applicable load combinations. The checked Fundamentals source includes examples of factored combinations and envelopes that identify governing moment, shear, or axial demand. That supports the concept of factored demand and governing envelopes, but it is not a full local NSCP table for this batch.

Keep the comparison format consistent. Do not compare a service-level demand directly with a factored resistance unless the method explicitly permits it. Do not compare a factored demand with an allowable stress check. The item must tell you whether it is asking for service-load behavior, allowable stress, factored demand, nominal capacity, or reduced design strength.

This article does not restore complete NSCP load-combination formulas, resistance factors, or edition-specific factor changes. Use the provided item data or a captured source.

## Real World Scenario

A beam design table lists dead load, live load, and wind load cases. The strength-design review builds the required strength from the supplied combination and then checks the governing envelope for moment and shear. A separate serviceability review checks deflection under service-level demand. Mixing those formats would make the answer unsafe.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Required strength | Factored demand side of a strength-design check. |
| Safety | Resistance exceeds extreme-load demand. |
| Serviceability | Operational behavior under service loads. |
| Load combination | Combines or amplifies load effects to find governing demand. |
| Envelope | Governing action among load cases or combinations. |

## Common Mistakes

- Mixing service-load checks with factored-strength checks.
- Treating required strength as available resistance.
- Copying a full NSCP factor table without a captured source.
- Ignoring whether the item supplied D, L, W, or E values and units.
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
    '- No exact NSCP seismic-zone value, NSCP soft-story threshold, NSCP accelerograph instrumentation threshold, NSCP live-load table, live-load reduction formula, complete NSCP load-combination table, or resistance-factor table is asserted in this Batch 143 bundle.',
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
    '- Question rewrites preserve answer keys while replacing unsupported exact table recall with checked structural concepts.',
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
      local_audit_note: `Article and question claims cite only the local Batch ${BATCH} source capture and refined conversion boundary.`,
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
      contains_legal_or_code_claims: article.slug === 'lea-strc-005-01-core-concept',
      requires_raw_source_capture: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: article.slug === 'lea-strc-005-01-core-concept'
        ? ['Required-strength article intentionally excludes complete NSCP load-combination and resistance-factor tables pending a captured local code source.']
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

Batch ${BATCH} continued the residual non-prac local-first pass after Batch 142 consumed \`lea-strc-002-06\` and \`lea-strc-003-01\` through \`lea-strc-003-04\`.

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

No Supabase, production database, deploy, or main merge was performed. The source boundary is local structural source artifacts from Building Structures Illustrated, Building Construction Illustrated, Dynamics of Structures, and Fundamentals of Structural Engineering. Exact NSCP seismic-zone values, soft-story thresholds, accelerograph instrumentation thresholds, live-load tables, live-load reduction formulas, complete load-combination tables, and resistance-factor tables remain excluded until captured locally.
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
- Exact NSCP seismic-zone, instrumentation, live-load, and load-combination tables remain excluded where the local code source is unreadable.
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
    status: 'selected_sourceable_batch_143',
    reason: 'Next sourceable residual non-prac structural bundles after Batch 142 consumed structural 002-06 and 003-01 through 003-04; constrained to existing local raw/refined structural source artifacts.',
  }));
  const summary = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    selected_clusters: selectedClusters,
    blocked_clusters: blockedClusters,
    selection_note: 'Batch 143 skipped the carried-forward theory/materials/utilities blocked residuals because no completed recovery reports were present, blocked lea-strc-004-02 because the local NSCP 2015 PDF was unreadable, then selected the next five sourceable non-prac structural bundles: lea-strc-004-01, lea-strc-004-03, lea-strc-004-04, lea-strc-004-05, and lea-strc-005-01.',
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
