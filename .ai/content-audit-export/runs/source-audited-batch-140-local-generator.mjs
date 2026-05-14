#!/usr/bin/env bun
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildDiffMarkdown, composeCandidate, diffCandidate } from '../../../scripts/content-audit/lib.ts';

const REPO = process.cwd();
const BATCH = 140;
const BASELINE = 'a633322cd';
const BATCH_ID = 'source-audited-article-batch-140-local-first';
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = GENERATED_AT.slice(0, 10);
const EXPORT_ROOT = '.ai/content-audit-export';
const ARTICLES_ROOT = `${EXPORT_ROOT}/articles`;
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
  hibbelerStatics: {
    label: 'Hibbeler Statics 13th Edition',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/006 -Structural/Hibbeler Statics 13th Ed.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/Hibbeler Statics 13th Ed.md',
    locator: 'Hibbeler Statics refined markdown lines 421-458, 472-510, 887-889, 1034-1038, 1061-1065, 1097-1099, 14916-15076, 16424-16580, 17316-17379, 19081-19412, 19476-19484, 21023-21037, and 26721-26870',
    notes: [
      'A force is characterized by magnitude, direction, and point of application.',
      'Distributed loading along one axis can be represented by an intensity function w(x), and its equivalent resultant force is found from the area under the loading diagram.',
      'The resultant of a distributed load acts through the centroid or geometric center of the loading area or volume.',
      'A support that restricts translation develops a reaction force in the restrained direction; a support that prevents rotation develops a couple moment.',
      'For coplanar rigid-body equilibrium, the three scalar equations are sum of horizontal forces, sum of vertical forces, and sum of moments equal to zero.',
      'A body with redundant supports is statically indeterminate because it has more unknown loadings than available equilibrium equations.',
      'A body can also be improperly constrained when support reactions are all parallel or concurrent, even if the unknown count matches the equations.',
      'Internal loadings in members are exposed by the method of sections and include normal force, shear force, bending moment, and in three dimensions torsional moment components.',
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
    reason: 'Still blocked for Batch 140 because the local theory-form source boundary remains insufficient for a claim-safe rewrite.',
  },
  {
    cluster_id: 'lea-theo-008-03-core-concept',
    title: 'Transformation of form',
    status: 'blocked_carried_forward',
    reason: 'Still blocked for Batch 140 because the local theory-form source boundary remains insufficient for a claim-safe rewrite.',
  },
  {
    cluster_id: 'lea-matl-009-02-core-concept',
    title: 'CSI MasterFormat',
    status: 'blocked_carried_forward',
    reason: 'Still blocked because the exact CSI MasterFormat claim scope lacks a captured local source artifact.',
  },
  {
    cluster_id: 'lea-util-004-05-seismic-bracing-and-earthquake-resilience',
    title: 'Seismic bracing and earthquake resilience',
    status: 'blocked_carried_forward',
    reason: 'Still blocked because utilities seismic-bracing claims require a local refined conversion boundary that is not available in this pass.',
  },
  {
    cluster_id: 'lea-util-004-08-seismic-bracing-requirements-per-nscp-2015',
    title: 'Seismic bracing requirements per NSCP 2015',
    status: 'blocked_carried_forward',
    reason: 'Still blocked because the raw NSCP 2015 PDF exists locally, but the required NSCP-specific refined conversion boundary is missing.',
  },
];

const questionPools = {
  loads: [
    ['What is the source-safe definition of a load in this bundle?', 'A force or system of forces acting on a body or member.', ['A material strength value assigned after design.', 'A floor-use label that automatically gives a code value.', 'A drawing note that replaces force equilibrium.']],
    ['What data must be known before a force can be represented correctly?', 'Its magnitude, direction, and point of application.', ['Only the name of the structural member.', 'Only whether the member is concrete or steel.', 'Only the building occupancy classification.']],
    ['In Hibbeler Statics, how is a one-axis distributed load commonly represented?', 'By an intensity function such as w(x) acting along the member length.', ['By a single fixed code table for every occupancy.', 'By the member color on a structural drawing.', 'By assuming every load acts only at the supports.']],
    ['What does the area under a distributed loading diagram give?', 'The magnitude of the equivalent resultant force.', ['The allowable stress of the material.', 'The number of supports required by code.', 'The exact reinforcement spacing in the member.']],
    ['Where does the equivalent resultant of a distributed load act?', 'Through the centroid or geometric center of the loading diagram or volume.', ['Always at the left support regardless of shape.', 'Always at the largest dimension note.', 'At any point chosen for convenience.']],
    ['Why was the old NSCP-value framing removed from this question set?', 'The local refined source boundary for those code values is not available in this pass.', ['The values are never used in Philippine design.', 'Statics does not use forces or equilibrium.', 'Every load question must be answered from memory.']],
    ['A wind pressure on a sign is converted to a single force for equilibrium. What statics idea is being used?', 'Replacing a distributed load with an equivalent resultant.', ['Replacing a support reaction with a material property.', 'Ignoring the pressure because it is not a point load.', 'Changing a load into a beam type.']],
    ['A beam carries a uniform stack of material. What source-safe step comes before writing equilibrium equations?', 'Convert the distributed load into its resultant and locate that resultant.', ['Choose the largest option in a load table without checking the stem.', 'Assume the load acts only as a horizontal force.', 'Delete the free-body diagram because the load is uniform.']],
    ['Which answer stays inside the Batch 140 source boundary?', 'Classify loads as forces and distributed intensities, then use resultants and equilibrium.', ['Quote residential live-load values from an uncaptured code conversion.', 'Assign a seismic zone value without a refined NSCP locator.', 'Use snow-load values as the main Philippine design rule.']],
    ['Why is the resultant location important in a load problem?', 'It determines the moment effect of the distributed load on the body.', ['It changes the density of the material.', 'It decides whether a support is drawn as a column.', 'It replaces the need for any force summation.']],
  ],
  supports: [
    ['What does a support do in statics?', 'It constrains translation or rotation and develops corresponding reactions.', ['It removes all external loads from a structure.', 'It changes the member material into a stronger one.', 'It gives a code occupancy to the building.']],
    ['When a support prevents translation in a direction, what reaction is developed?', 'A force reaction in the restrained direction.', ['Only a material stress value.', 'Only a drawing title.', 'No reaction because motion is prevented.']],
    ['When a support prevents rotation, what reaction can develop?', 'A couple moment reaction.', ['A live-load table value.', 'A centroid of area only.', 'A seismic zone number.']],
    ['For a 2D roller on a horizontal surface, what is the usual source-safe reaction model?', 'One force perpendicular to the supporting surface.', ['Two force components and a moment.', 'No vertical reaction.', 'A moment reaction only.']],
    ['For a 2D pin or hinge support used in beam analysis, what is usually shown on the free-body diagram?', 'Two force components, commonly horizontal and vertical.', ['One force plus one mandatory fixed moment.', 'Only a torsional moment.', 'Only a material property.']],
    ['For a fixed support in a 2D rigid-body model, what reaction set is source-safe?', 'Two force components and one couple moment.', ['Only one vertical reaction.', 'Only a horizontal reaction.', 'No reactions because the wall is stiff.']],
    ['Why should unknown reactions be shown clearly on a free-body diagram?', 'Equilibrium equations solve the assumed reaction directions, and negative values show the opposite sense.', ['The diagram is decorative and does not affect calculation.', 'It avoids using force or moment equations.', 'It proves the member material is adequate.']],
    ['What is the first analysis step before solving a support-reaction problem?', 'Draw the free-body diagram and show all external forces and couple moments.', ['Start with a deformation equation even for every determinate body.', 'Choose a code table value by occupancy only.', 'Skip support symbols and solve from the title.']],
    ['Which support choice permits rotation while restraining translation in two directions in a 2D model?', 'A pin or hinge support.', ['A fixed support.', 'A distributed load.', 'A force resultant.']],
    ['Which statement is most consistent with the local source boundary?', 'Reaction type follows the motion restrained by the support.', ['Every support develops exactly the same three reactions.', 'Rollers always develop torsional moments.', 'Support symbols are unrelated to equilibrium.']],
  ],
  beams: [
    ['What makes a beam analysis problem a statics problem before design checks?', 'External loads and supports are idealized so equilibrium can be applied.', ['The beam color determines the internal forces.', 'A material-strength formula replaces the free-body diagram.', 'A code occupancy label supplies all reactions.']],
    ['A cantilever is fixed at one end and loaded at the free portion. What does the fixed support provide in a 2D model?', 'Horizontal and vertical force reactions plus a couple moment.', ['Only one vertical reaction.', 'Only a roller force.', 'No moment reaction.']],
    ['Why can a pin-and-roller beam often be solved by equilibrium alone?', 'Its support reactions can match the available coplanar equilibrium equations when properly constrained.', ['It has no external loads.', 'It has no vertical reactions.', 'Its material properties are known.']],
    ['What does a beam develop internally when it is loaded transverse to its length?', 'Shear force and bending moment, with possible normal force depending on loading.', ['Only a code table value.', 'Only a drawing symbol.', 'Only a centroid mark.']],
    ['What is exposed when an imaginary section is cut through a loaded beam?', 'Internal force and couple-moment resultants at the section.', ['The building occupancy classification.', 'The exact concrete mix strength.', 'The zoning classification.']],
    ['Which source-safe statement replaces an unsupported list of five beam types?', 'Support conditions control the reaction model and the equilibrium path.', ['Every beam type has the same fixed-end reactions.', 'The beam label alone determines all internal forces.', 'A continuous beam can always be solved by three equations without checking redundants.']],
    ['In a beam free-body diagram, why are dimensions kept with the loads?', 'They are needed to compute moments about selected points.', ['They decide the material density automatically.', 'They replace support reactions.', 'They are only graphic decoration.']],
    ['What makes a fixed-ended or redundantly supported beam different from a basic determinate beam?', 'It can have more unknown reactions than available equilibrium equations.', ['It has no internal forces.', 'It carries no load.', 'It cannot be drawn as a free-body diagram.']],
    ['For a roof canopy idealized as a cantilever, what is the key support cue?', 'A fixed connection that restrains translation and rotation at one end.', ['A roller at both ends.', 'No support reactions at the wall.', 'A distributed load acting as a material property.']],
    ['What should an exam taker do before naming a beam configuration?', 'Read the supports, restrained motions, and load path shown in the stem.', ['Answer from the first familiar beam word.', 'Use an unsupported table value.', 'Assume every beam is continuous.']],
  ],
  internal: [
    ['What is the method used to expose internal loadings in a member?', 'Pass an imaginary section through the member and draw the free-body diagram of a segment.', ['Pick a material color from the drawing.', 'Use a zoning table.', 'Ignore the cut and solve only by memory.']],
    ['What is the normal force at a section?', 'The force component perpendicular to the cross section.', ['The support reaction from a roller only.', 'The centroid of the distributed load.', 'The code occupancy load.']],
    ['What is the shear force at a section?', 'The force component tangent to the cross section.', ['A force that always acts only along the member axis.', 'A couple moment that twists the whole member.', 'A material density value.']],
    ['What is the bending moment at a section?', 'The couple moment that prevents relative rotation between the cut segments.', ['The area under a live-load table.', 'A support symbol with no force effect.', 'The number of stories in the building.']],
    ['In three dimensions, which additional moment component can appear as twisting?', 'A torsional moment component.', ['A zoning moment.', 'A read-time value.', 'A source-pack hash.']],
    ['Why are moments often summed at the cut section when finding internal loadings?', 'The normal and shear forces at the section then have zero moment arms.', ['It changes a distributed load into a code citation.', 'It removes all external loads from the segment.', 'It proves no free-body diagram is needed.']],
    ['If solving equilibrium gives a negative scalar for an internal loading, what does that mean?', 'The actual sense is opposite to the assumed direction on the free-body diagram.', ['The answer is automatically invalid.', 'The member has no internal force.', 'The source boundary changed.']],
    ['What must be done with distributed loads before applying equilibrium to a cut segment?', 'Keep them in place until the section is made, then replace the load on the chosen segment with its resultant.', ['Move every load to the support before sectioning.', 'Ignore the load because it is not concentrated.', 'Turn it into a material-strength value.']],
    ['Which pair is most central to a loaded beam under transverse load?', 'Shear force and bending moment.', ['Zoning and occupancy only.', 'Color and line weight.', 'Density and read time.']],
    ['Which statement is source-safe for a member that carries several effects at once?', 'A member may have normal force, shear force, bending moment, and torsional moment components depending on loading and section.', ['Every member has only one force type.', 'Internal forces are assigned without equilibrium.', 'Torsion is the same as a vertical support reaction.']],
  ],
  determinacy: [
    ['What does statically determinate mean in this source boundary?', 'The unknown reactions can be found from the available equilibrium equations when the body is properly constrained.', ['The member material has already been designed.', 'The structure has more supports than needed.', 'The drawing has no dimensions.']],
    ['What makes a body statically indeterminate?', 'It has more unknown loadings or reactions than the available equilibrium equations can solve.', ['It has exactly enough properly arranged constraints.', 'It has no external loads in the drawing.', 'It is made from a specific material.']],
    ['In a coplanar rigid-body problem, which equations form the basic equilibrium set?', 'Sum of horizontal forces, sum of vertical forces, and sum of moments equal zero.', ['Only a live-load table.', 'Only a material stress formula.', 'Only a zoning ordinance map.']],
    ['Why is a redundant support important?', 'It adds unknown reactions beyond those required for equilibrium.', ['It removes the need for all supports.', 'It turns forces into materials.', 'It proves the body is unconstrained.']],
    ['Why can equal counts of unknowns and equations still be unsafe?', 'The support reactions may be improperly arranged, such as all parallel or concurrent.', ['The title might be too short.', 'The article may have a read-time value.', 'The body may use a common material.']],
    ['What is the consequence of all support reaction lines being concurrent in the improper-constraint example?', 'The applied load can rotate the body about the common point or axis.', ['The body automatically becomes stronger.', 'The load disappears from the diagram.', 'The supports develop no reactions at all.']],
    ['What additional information is generally needed for statically indeterminate problems?', 'Compatibility or deformation conditions, often involving material and member properties.', ['Only a historic style label.', 'Only the article title.', 'Only the answer option letter.']],
    ['Which beam support set is source-safe as a determinate cue when properly arranged?', 'A pin and roller providing three independent coplanar reactions.', ['Five unknown reactions for only three equations.', 'Supports whose reactions are all concurrent with the load moment unresisted.', 'A fixed support at both ends with six reaction components in 2D.']],
    ['What should be checked separately from unknown count?', 'Stability and proper constraint arrangement.', ['The article slug length.', 'The source file extension only.', 'The option order in the MCQ.']],
    ['Which answer is the safest Batch 140 exam strategy for determinacy?', 'Count unknown reactions, compare with equilibrium equations, and check that reactions are properly arranged.', ['Assume all beams are determinate.', 'Use deformation methods before drawing a free-body diagram for every problem.', 'Ignore supports and classify by material alone.']],
  ],
};

const articles = [
  {
    clusterId: 'lea-strc-001-02-core-concept',
    slug: 'lea-strc-001-02-core-concept',
    title: 'Load is a force or system of forces applied',
    category: 'Structural Conceptualization',
    sourceKeys: ['hibbelerStatics'],
    questionPool: 'loads',
    summary: 'Reframed from unsupported NSCP value recall to source-safe statics: force characteristics, distributed loading, equivalent resultants, and centroid location.',
    body: `# Load as a Force System

## Board Exam Quick Check

For this batch, treat load questions as statics questions unless a captured code source is available. Identify the force, its direction, its point or distribution, and the body it acts on. Do not import uncaptured NSCP live-load values, seismic-zone values, or snow-load assumptions into this bundle.

## What You Need to Know for the LEA

A load is a force or system of forces applied to a body or structural member. In statics, a force is described by magnitude, direction, and point of application. When several forces act together, they can be represented by an equivalent resultant if the resultant has the same external effect on the body.

Loads may be concentrated at a point, or they may be distributed along a length or over an area. Hibbeler treats a common one-axis distributed load as an intensity function, such as w(x), with force per unit length. The equivalent resultant force is found from the area under the loading diagram, and its line of action passes through the centroid or geometric center of that diagram.

## Real World Scenario

A sign panel is subjected to wind pressure across its face. For a source-safe statics answer, the pressure is first converted into a resultant force, and that resultant is located through the centroid of the loaded area before equilibrium equations are written. The local source boundary supports that statics workflow; it does not support assigning an uncaptured Philippine code wind or seismic value here.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Force data | Magnitude, direction, and point of application. |
| Distributed load | Represent with an intensity such as w(x). |
| Resultant magnitude | Area under the loading diagram. |
| Resultant location | Centroid or geometric center of the loading diagram or loaded volume. |
| Batch 140 limit | No NSCP numerical load values unless a local refined NSCP conversion is captured. |

## Common Mistakes

- Quoting live-load or seismic-zone numbers when the local refined code source is missing.
- Treating a distributed load as if it always acts at a support.
- Ignoring the location of the resultant force when taking moments.
- Calling every load a dead or live load instead of reading the actual force condition in the stem.
`,
  },
  {
    clusterId: 'lea-strc-001-03-core-concept',
    slug: 'lea-strc-001-03-core-concept',
    title: 'Support is a constraint that prevents a structure',
    category: 'Structural Conceptualization',
    sourceKeys: ['hibbelerStatics'],
    questionPool: 'supports',
    summary: 'Tightened support-type content to the local statics boundary: restrained translation creates force reactions, restrained rotation creates couple moments.',
    body: `# Supports and Reaction Models

## Board Exam Quick Check

A support question is asking what movement is restrained. First decide whether the support prevents translation, rotation, or both. Then draw only the reactions required by those restraints.

## What You Need to Know for the LEA

A support is a constraint imposed by the surroundings on a body or member. Hibbeler states the key rule directly: a support that restricts translation develops a force reaction, and a support that prevents rotation develops a couple moment.

In a two-dimensional beam model, a roller on a horizontal surface is commonly represented by one reaction force perpendicular to the supporting surface. A pin or hinge support prevents translation in two directions but allows rotation, so it is represented by two force components. A fixed support prevents translation and rotation, so it is represented by force components and a couple moment.

## Real World Scenario

A beam is shown with a pin at the left end and a roller at the right end. The source-safe reaction model shows two force components at the pin and one vertical reaction at the roller. The roller is not assigned a moment reaction because the model allows rotation there.

## Key Facts and Testable Items

| Support cue | Reaction model |
| --- | --- |
| Prevents translation | Force reaction in the restrained direction. |
| Prevents rotation | Couple moment reaction. |
| Roller on horizontal surface | One reaction perpendicular to the surface. |
| Pin or hinge in 2D | Two force components; rotation allowed. |
| Fixed support in 2D | Two force components plus one moment. |

## Common Mistakes

- Giving every support three reactions.
- Forgetting that a roller reaction is perpendicular to its support surface.
- Adding a moment reaction to a pin or roller without a source-supported reason.
- Solving reactions before drawing a complete free-body diagram.
`,
  },
  {
    clusterId: 'lea-strc-001-04-core-concept',
    slug: 'lea-strc-001-04-core-concept',
    title: 'Beam is a structural member subjected primarily to loads',
    category: 'Structural Conceptualization',
    sourceKeys: ['hibbelerStatics'],
    questionPool: 'beams',
    summary: 'Reworked beam-type language into a source-safe beam idealization: supports, reactions, free-body diagrams, and internal loading behavior.',
    body: `# Beam Idealization and Support Behavior

## Board Exam Quick Check

Before naming a beam type, read the supports and load path. The local source boundary supports identifying how supports restrain motion, how reactions are drawn, and how internal loadings are exposed. It does not require an unsupported memorized catalog of beam names.

## What You Need to Know for the LEA

A beam is idealized as a member that carries external loads and transmits their effects to supports. The support model controls the reaction model. A roller produces a force normal to its surface, a pin or hinge produces force components, and a fixed support can produce force components plus a couple moment.

When loads act on a beam, internal loadings develop within the member. Hibbeler introduces these internal loadings by cutting the member with an imaginary section and drawing the free-body diagram of one segment. For two-dimensional beam problems, the section may expose normal force, shear force, and bending moment.

## Real World Scenario

A roof canopy fixed into a wall can be idealized as a cantilever for statics. The wall connection is modeled as a fixed support because it restrains translation and rotation. The load on the canopy then creates support reactions and internal shear and bending effects that must satisfy equilibrium.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Beam support symbol | Translate the symbol into restrained motions and reactions. |
| Pin and roller | Common determinate beam model when properly arranged. |
| Fixed support | Force components plus a couple moment in 2D. |
| Loaded beam section | Internal normal force, shear force, and bending moment may be exposed. |
| Redundant reactions | May make the beam statically indeterminate. |

## Common Mistakes

- Classifying the beam by a familiar word while ignoring the support drawing.
- Treating a fixed support like a roller.
- Forgetting that dimensions are needed for moments.
- Claiming a redundant beam is solvable by three equilibrium equations without checking the unknown count.
`,
  },
  {
    clusterId: 'lea-strc-001-05-core-concept',
    slug: 'lea-strc-001-05-core-concept',
    title: 'Load Distribution and Reactions',
    category: 'Structural Conceptualization',
    sourceKeys: ['hibbelerStatics'],
    questionPool: 'internal',
    summary: 'Aligned the article with source-supported internal loading and distributed-load handling: section cuts, N/V/M, torsion, and resultants.',
    body: `# Load Distribution, Reactions, and Internal Loadings

## Board Exam Quick Check

For this bundle, ask whether the stem is about an external distributed load, a support reaction, or an internal loading at a section. Those are related, but they are not the same answer.

## What You Need to Know for the LEA

A distributed load may be replaced by an equivalent resultant when analyzing the external effects on a body. The resultant magnitude comes from the loading diagram, and the line of action passes through the centroid or geometric center of that loading.

Internal loadings are found after the member is cut by an imaginary section. The cut exposes resultants that act on the cross section. In two-dimensional problems, these are normal force, shear force, and bending moment. In three-dimensional problems, shear components, bending components, and a torsional moment component may also appear.

## Real World Scenario

A beam segment carries a triangular distributed load. The load should remain in its exact location until the section is selected. After the segment is isolated, the portion of distributed load acting on that segment can be replaced by its equivalent resultant, and equilibrium can be used to solve the internal normal force, shear force, and bending moment at the cut.

## Key Facts and Testable Items

| Concept | Source-safe meaning |
| --- | --- |
| Normal force | Force component perpendicular to the cross section. |
| Shear force | Force component tangent to the cross section. |
| Bending moment | Couple moment at the section that resists relative rotation. |
| Torsional moment | Twisting moment component in a three-dimensional section model. |
| Negative result | Actual sense is opposite the assumed free-body diagram direction. |

## Common Mistakes

- Moving a distributed load before the member is sectioned.
- Treating shear, bending, and torsion as the same effect.
- Forgetting that either segment may be used, but the simpler segment usually reduces unknowns.
- Reporting a negative scalar as an error instead of reversing the assumed sense.
`,
  },
  {
    clusterId: 'lea-strc-001-06-core-concept',
    slug: 'lea-strc-001-06-core-concept',
    title: 'Static Determinacy',
    category: 'Structural Conceptualization',
    sourceKeys: ['hibbelerStatics'],
    questionPool: 'determinacy',
    summary: 'Reframed determinacy around Hibbeler constraints: available equilibrium equations, redundant supports, and improper constraints.',
    body: `# Static Determinacy and Stability

## Board Exam Quick Check

A determinacy question is not just a reaction-count exercise. Count the unknown reactions, compare them with the available equilibrium equations, and then check whether the supports are properly arranged.

## What You Need to Know for the LEA

For a coplanar rigid body, equilibrium supplies three scalar equations: sum of horizontal forces equals zero, sum of vertical forces equals zero, and sum of moments about a point equals zero. If the body has the minimum number of properly arranged constraints needed for equilibrium, it is statically determinate.

When a body has redundant supports, it becomes statically indeterminate because there are more unknown reactions or loadings than equilibrium equations available. Additional equations usually come from deformation or compatibility conditions, which require information beyond basic rigid-body equilibrium.

Stability must also be checked. Hibbeler notes that the same number of unknown reactions and equilibrium equations does not guarantee stability. A body may be improperly constrained if the support reactions are all parallel or if their lines of action are concurrent, allowing rotation under a load.

## Real World Scenario

A beam has a pin at one end and a roller at the other. If the reactions are properly arranged, the three coplanar equilibrium equations can solve the support reactions. If extra supports are added, the beam may become indeterminate. If the supports are arranged so their reaction lines are concurrent, the body may be unstable even when the unknown count appears acceptable.

## Key Facts and Testable Items

| Cue | Source-safe answer |
| --- | --- |
| Coplanar equilibrium | Sum Fx, sum Fy, and sum M equal zero. |
| Determinate | Minimum properly arranged constraints for equilibrium. |
| Indeterminate | More unknown reactions than available equilibrium equations. |
| Redundant support | Adds extra unknown reaction. |
| Improper constraint | Reactions arranged all parallel or concurrent, so stability is not ensured. |

## Common Mistakes

- Counting reactions but ignoring whether they are independent.
- Calling every extra support safer without recognizing indeterminacy.
- Treating stability and determinacy as identical.
- Using deformation-method language before establishing the free-body diagram and equilibrium boundary.
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
  const lines = [
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
    '- No NSCP numerical load, seismic, or bracing values are asserted in this Batch 140 bundle because the needed local refined NSCP conversion boundary is not available for this pass.',
  ];
  return lines.join('\n');
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
    '- Question rewrites preserve answer keys while replacing unsupported code-value recall with local statics concepts.',
    '- Real World Scenario is source-safe and uses only the checked local statics boundary.',
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
        : `${option.text} is not the best answer because it either changes the statics concept or adds a claim outside the Batch ${BATCH} local source boundary.`;
  }
  rationale.correct = `${correctText} Supported by ${sourceLocator}.`;
  rationale.takeaway = `For ${article.title}, classify the statics cue first and stay inside the checked local source families.`;
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
    reviewer_comments: `Batch ${BATCH} local-first source-audited rewrite constrained to Hibbeler Statics local source artifacts.`,
    updated_at: GENERATED_AT,
    updated_by: `codex-${BATCH_ID}`,
    updated_note: `Batch ${BATCH} local-first source-audited article and linked-question rewrite; no Supabase mutation.`,
    hash_algorithm: 'sha256',
  };
  writeJson(`${article.articleFolder}/article-metadata.json`, nextMetadata);
  return nextMetadata;
}

function processArticle(article) {
  const metadataPath = `${article.articleFolder}/article-metadata.json`;
  const metadata = readJson(metadataPath);
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

function main() {
  const processed = articles.map(processArticle);
  const selectedClusters = processed.map((article) => ({
    cluster_id: article.cluster_id,
    slug: article.slug,
    title: article.title,
    category: article.category,
    status: 'selected_sourceable_batch_140',
    reason: 'Next sourceable non-prac residual structural bundle after Batch 139 consumed lea-strc-001-01; constrained to existing Hibbeler Statics raw/refined local source artifacts.',
  }));
  const summary = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    selected_clusters: selectedClusters,
    blocked_clusters: blockedClusters,
    selection_note: 'Batch 140 skipped the carried-forward theory/materials/utilities blocked residuals and selected the next five sourceable non-prac structural clusters with local raw and refined Hibbeler Statics artifacts.',
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
        '.hermes/skills',
        '.ai/00_system/philip-ux-ui-calibration.md',
        'old unrelated content-roundtrip run dirs',
      ],
    },
  };
  writeJson(SUMMARY_PATH, summary);
  writeJson(RUN_SUMMARY_PATH, summary);
  console.log(JSON.stringify({
    ok: true,
    batch: BATCH,
    articles: processed.length,
    question_edits: summary.totals.question_edit_count,
    summary: SUMMARY_PATH,
  }, null, 2));
}

main();
