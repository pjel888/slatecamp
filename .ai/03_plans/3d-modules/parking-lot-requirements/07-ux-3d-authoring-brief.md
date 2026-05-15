# UX + 3D Authoring Brief — Parking Lot Requirements

## Design principle

Teach parking as measurable spatial law, not as a spreadsheet. The module should make dimensions, routes, and conflicts visible without making the learner choose among many modes first.

## Default scene

A calm passing baseline:
- small surface parking lot
- one standard row of 90-degree parking
- one accessible stall near a building entrance
- one drive aisle
- one accessible route line to entrance
- neutral vehicles as simple grey massing
- source-pending status visible in right panel

## Camera and canvas

- Isometric/default camera should frame the full stall row, access aisle, route, and entrance.
- Fit-content must ignore non-authoritative guide planes where appropriate.
- No clipping of route arrows, dimension overlays, vehicles, or labels.
- Use unlit/tone-map-safe overlays for failure red and measurement planes.
- Keep model calm: neutral grey asphalt, white/yellow striping, blue/green for accessible route/status only when not used as failure state.

## Left sidebar controls

Minimal first-load control set:
1. Project context
   - Generic NBCP
   - BP 220 housing
   - PD 957 condominium/subdivision
   - BP 344 accessible parking focus
   - LGU overlay later, disabled until source-ready
2. Stall layout
   - parking angle
   - slot width
   - slot length
   - number of slots
3. Circulation
   - drive aisle width
   - one-way/two-way selector only if source-ready
4. Accessible parking
   - total parking spaces
   - accessible spaces provided
   - accessible stall/access aisle dimensions after conflict resolution
5. Off-site/on-site distance only for housing/condo scenario after source-ready

Avoid in first load:
- scenario essays
- many law dropdowns
- decorative count badges
- multiple advanced toggles
- raw source dumps

## Right sidebar law cards

Group by source family:
- PD 1096 / NBCP parking geometry
- BP 344 accessible parking
- BP 220 / PD 957 housing-condo context
- RA 9514 fire/life safety context
- LGU overlay, if selected

Each law card should show:
- source status
- exact dimension/count being evaluated
- current input value
- pending required value
- result label: `CALCULATION OK`, `FORMULA ISSUE`, or `REVIEW` while pending
- link/button to source details modal

## 3D model components

Required procedural components:
- `lot-slab`
- `standard-stall-{index}`
- `parallel-stall-{index}` if scenario active
- `accessible-stall-{index}`
- `access-aisle-{index}`
- `drive-aisle-main`
- `vehicle-envelope-{index}`
- `wheelchair-transfer-envelope`
- `accessible-route-to-entrance`
- `building-entrance-marker`
- `offsite-distance-line`
- `dimension-overlay-{rule_id}`
- `failure-overlay-{rule_id}`

## Failure coloring

Universal red applies to failing physical dimensions:
- stall width/length failure: affected stall outline and dimension label red
- accessible count failure: accessible count card red; not all geometry red unless missing stalls are ghosted in red
- access aisle failure: access aisle zone red
- drive aisle failure: drive aisle zone red
- off-site distance failure: distance line red

Law identity colors may appear in card headers, but never replace universal red for failure.

## Source-pending copy rules

Allowed:
- `Source pending QA`
- `Calculation check only`
- `Formula issue`
- `Needs source review`

Forbidden before approval:
- `Compliant`
- `Violation`
- `Code passed`
- `Code failed`
- `Approved`
- `Legal`

## Future asset policy

Use procedural greybox vehicles for MVP. If downloaded GLB vehicles are used later:
- record license/provenance
- simplify meshes for performance
- treat as visual scale aids only
- do not infer stall dimensions from vehicle model geometry
