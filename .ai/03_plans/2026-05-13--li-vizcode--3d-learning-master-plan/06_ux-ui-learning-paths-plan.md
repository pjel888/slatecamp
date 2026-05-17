# 06 - UX/UI Learning Paths Plan

## Learning Path Strategy

LI modules should support different study situations without adding separate mode tabs. The same hotspot system can produce different paths by changing default ordering, hotspot emphasis, and entry route context.

## Information Layers

| Layer | Purpose | LI behavior |
| --- | --- | --- |
| Layer 0: Model | Establish spatial context. | Clean model always visible. |
| Layer 1: Orientation | Name the major elements. | 0-2 labels on load. |
| Layer 2: Exploration | Reveal clickable learning points. | 6-8 hotspots on meaningful model regions. |
| Layer 3: Deep knowledge | Source, rationale, Wiki, quiz. | Revealed on demand only. |

## Persona Paths

### Path A - First-Time Learner

Goal: reduce anxiety and build spatial memory.

Flow:

1. Dashboard card with Learning badge.
2. Module opens with clean model and short objective.
3. Two priority hotspots appear.
4. Student clicks an info hotspot.
5. Student sees dimension callout and source card.
6. More hotspots appear after interaction.
7. Optional quiz hotspot appears after 3+ hotspots explored.
8. End state: progress count and "review again / continue" action.

UX requirements:

- No forced quiz on first load.
- No dense source text by default.
- No more than four cognitive chunks visible at once.

### Path B - Retaker Targeted Review

Goal: fix a known weak topic quickly.

Flow:

1. Weak topic from heatmap/quiz links to module with hotspot target.
2. Relevant hotspots are highlighted.
3. Student reviews info hotspot and then quiz hotspot.
4. Incorrect answer highlights the related source/info hotspot.
5. Short mini-drill confirms recovery.

Future route shape:

- `/dashboard/3d-lab/bp344-ramp-hotspots?hotspot=ramp-slope-quiz&source=weak-topic`

UX requirements:

- Deep linking to hotspot ID.
- Highlighted priority hotspots.
- Fast access to quiz/rationale.

### Path C - Undergrad Exploration

Goal: curiosity and early conceptual learning.

Flow:

1. Student opens Learning module from 3D Lab.
2. All safe exploration controls are available.
3. Hotspot list encourages completion.
4. Quiz is optional and not high-pressure.
5. Wiki links support deeper reading.

UX requirements:

- Exploration-first copy.
- No punitive scoring.
- Encouraging but not game-heavy completion state.

### Path D - Working Professional Short Session

Goal: high-yield review in 10-15 minutes.

Flow:

1. Module opens with "critical hotspots" list.
2. Student completes 3 required hotspots.
3. Student answers 2-3 checkpoint questions.
4. End state summarizes the rules reviewed.

UX requirements:

- Minimal scrolling.
- Prioritized hotspot sequence.
- Clear session completion.

## Module Learning Paths

### BP 344 Ramp

Path order:

1. Ramp surface width/slope.
2. Landing platform.
3. Handrail heights.
4. Edge curb.
5. Tactile warning.
6. Vehicular traffic condition.
7. Slope quiz.
8. Handrail comparison.

Key board traps:

- confusing general ramp slope with special cases,
- forgetting terminal/intermediate landings,
- missing dual handrail heights,
- missing tactile warning placement,
- treating accessible route as isolated ramp only.

### BP 344 Toilet

Path order:

1. Turning circle/clear floor space.
2. Water closet location.
3. Side grab bar.
4. Rear grab bar.
5. Door swing quiz.
6. Lavatory clearance.
7. Accessories.
8. Source summary.

Key board traps:

- door swing direction,
- centerline versus clear space,
- grab bar length and mounting height,
- knee clearance dimensions,
- confusing toilet compartment and room-level turning space.

### Egress Stair

Path order:

1. Stair width comparison.
2. Riser comparison.
3. Tread comparison.
4. Handrail comparison.
5. Landing.
6. Guardrail.
7. Exit door.
8. Width quiz.

Key board traps:

- mixing PD 1096 and RA 9514 stair dimensions,
- applying accessible route dimensions to all stairs,
- confusing clear width and nominal width,
- missing occupant-load influence on egress width.

## Learning Completion States

MVP:

- explored count,
- quiz answered state,
- review source action.

Phase 2:

- weak-topic repair badge,
- "mastered this hotspot" state,
- mini-drill completion,
- heatmap update integration.

Phase 3:

- Camp Trail lesson step,
- spaced review prompt,
- content author analytics on difficult hotspots.

## Learning Path Acceptance Criteria

- Each module has a documented default path.
- Each hotspot maps to one learning objective.
- Each quiz maps back to at least one info/source hotspot.
- Each module can be completed in under 15 minutes.
- Each module can be reviewed in under 5 minutes through priority hotspots.
