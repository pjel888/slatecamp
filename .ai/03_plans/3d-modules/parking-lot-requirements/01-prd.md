# PRD — Parking Lot Requirements Compliance Tool

## Goal

Build a 3D Lab module that teaches parking lot requirements through a manipulable, source-gated compliance scene. Learners should see how stall size, accessible parking, access aisles, drive aisles, parking angle, vehicle type, residential/commercial context, and local-law overlays affect a parking layout.

## Non-goals

- No production code in this planning phase.
- No Supabase write, migration, or remote source-pack mutation.
- No claim that SlateCamp is an official compliance certifier.
- No learner-facing `COMPLIANT` / `VIOLATION` labels until source rules are human-approved.
- No reliance on existing `parking-layout.ts` or `parking-slot-dimensions.ts` constants without source-card verification.
- No imported/downloaded vehicle model treated as dimensional truth.

## Primary users

1. LEA examinees learning site development, planning, and code application.
2. Reviewers/educators preparing rule explanation and comparison material.
3. Internal SlateCamp QA/SME reviewers validating source-rule behavior before learner release.

## Learning outcomes

A learner can:
- Distinguish standard, parallel, truck/bus, and accessible parking geometry.
- Explain why an accessible stall is more than a wider parking rectangle: route, transfer, signage, location, and safety matter.
- Compare parking quantity rules by project type and law family.
- Recognize when LGU/zoning requirements may override a baseline national minimum.
- Understand why a layout can pass one rule family but fail another.
- Convert a text rule into a measurable plan/3D condition.

## Proposed module identity

- Module ID: `parking-lot-requirements`
- Title: `Parking Lot Requirements`
- Category: likely `SITE_DEV`, with cross-links to `ACCESSIBILITY` and `BUILDING_CODE`
- Template direction: custom parametric workbench, not a generic floorplan-only module
- Visibility: hidden route first; dashboard QA preview only after source-locator pass
- Learner release: blocked until source approval and formula tests pass

## Core scenarios

### Scenario A — Standard passenger parking bay

Controls:
- Stall width
- Stall length
- Stall angle: 90°, 60°, 45°, parallel
- Drive aisle width
- One-way/two-way circulation
- Number of stalls

Scene should show:
- Painted stalls
- Vehicles as simple neutral grey massing, not photoreal proof
- Measurement overlays for stall width/depth and aisle width
- Turning/circulation arrows
- Failure highlight on the exact physical dimension that fails

### Scenario B — Accessible parking row

Controls:
- Total parking spaces
- Accessible stall count
- Accessible stall width
- Access aisle width
- Route-to-entrance distance/continuity
- Curb ramp/drop-off adjacency

Scene should show:
- Accessible stalls and access aisles as distinct zones
- Transfer path from vehicle to wheelchair to accessible route
- Route hazards and slope/level-change warnings only if source rules are locator-ready
- Source-pending labels until human-approved

### Scenario C — Housing / subdivision context

Controls:
- Project type: BP 220 economic/socialized, PD 957 condominium/subdivision, generic NBCP
- Unit count
- On-site/off-site parking distance
- Road/driveway interface

Scene should show:
- Required slot count calculator
- Off-site parking distance line
- Entry/loading setback if applicable
- Conflict notes where PD 957/BP 220 refers back to NBCP or LGU requirements

### Scenario D — Parking garage/fire-code interface

Controls:
- Open parking garage vs enclosed/repair garage context
- Fire access/egress overlays
- Pedestrian route and stair/exit connection

Scene should show:
- Fire/life safety panel only after RA 9514 source cards are found
- Occupancy/hazard classification as context, not as a standalone pass/fail until verified

## Compliance model requirements

Each rule must be represented as a source-backed row:
- `source_rule_id`
- `source_card_id`
- raw source path
- SHA256
- law family
- section/table/figure locator
- extracted quote
- normalized parameter
- unit
- formula/threshold
- applicability condition
- release status

Runtime labels while source is pending:
- `CALCULATION OK` if formula is internally satisfied but source not approved
- `FORMULA ISSUE` if user input fails a pending formula
- `REVIEW` for ambiguous/local-ordinance-dependent cases
- Never `COMPLIANT`, `VIOLATION`, or `AT LIMIT` until approved

## UX acceptance criteria

- First load uses a calm passing baseline.
- Left sidebar remains minimal: project context, stall geometry, accessible parking, count/distance.
- Right sidebar shows compact rule cards by source family: PD 1096, BP 344, BP 220/PD 957, RA 9514/LGU.
- No-scroll or minimal-scroll behavior at 13-inch MacBook-class heights.
- Universal red for failing dimensions across sliders, labels, and affected 3D geometry.
- Source status always visible in DOM, not hidden in the canvas.
- Detailed law explanation opens in modal/popover, not inside the default sidebar.

## Technical acceptance criteria for future implementation

- Pure calculation functions with deterministic tests before 3D rendering.
- Geometry instruction generation has tests for IDs, finite dimensions, no duplicate IDs, no coplanar opaque overlap where avoidable.
- Shared source/compliance panel receives rule results from the same computation used by the geometry.
- Stable preset IDs exist before Wiki/Quiz links are allowed.
- Browser QA captures at least default, failing standard stall, failing accessible count, and source-pending route states.

## Release posture

Implementation may proceed only as hidden QA after `03-readiness-audit.md` reaches `CONDITIONAL_GO`. Learner release requires `SOURCE_READY` and SME approval for every displayed compliance rule.
