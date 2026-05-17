# Conflict Register - Lighting Room Simulator

Purpose: record value conflicts before implementation so the module does not teach or display contradictory law/source claims.

## Conflict Status Legend

| Status | Meaning |
|---|---|
| `OPEN` | Needs source lookup or product decision. |
| `RESOLVED_FOR_V0` | v0 has a safe display/implementation decision. |
| `DEFERRED` | Excluded from v0 and must not appear as a default learner-facing claim. |

## Conflicts

### LRS-CONFLICT-001 - Standard Office preset lux mismatch

Status: `RESOLVED_FOR_V0`
Conflict:
- Existing PRD labels Standard Office as 400 lux in one place and 300 lux in another.
- Existing preset values list 1800 lm in a 16m2 room, which computes to 112.5 lux under `lux = lumens / area`.

Decision:
- v0 Standard Office target is 300 lux until source card says otherwise.
- Standard Office uses 4800 lm in a 16m2 room under the simplified average-lux model.
- If later source approval chooses 400 lux as default, the preset must become 6400 lm for 16m2.

Display rule:
- Show "Target met in simplified model" until legal source approval; do not show "Compliant" from this alone.

### LRS-CONFLICT-002 - Drafting Studio preset cannot pass current lumens range

Status: `RESOLVED_FOR_V0`
Conflict:
- Current PRD max lumens is 4000 lm.
- Drafting at 750 lux in 16m2 needs 12000 lm under the simplified model.

Decision:
- Increase lumens range to 200-12000 lm.
- Drafting Studio preset uses 12000 lm and 120 W at 100 lm/W.

Display rule:
- Label as "Drafting target" until source card approves law family and wording.

### LRS-CONFLICT-003 - PEC vs DOE vs IES ownership of lux targets

Status: `RESOLVED_FOR_V0`
Conflict:
- Existing modules cite office/drafting/corridor lux values to PEC Rule 9.50.4.
- Planning docs also name DOE Energy Code and IES/standard references.
- The PRD caveat already says PD 1096 does not own lux targets.

Decision:
- DOE Table 3.1 owns the v0 illuminance source family for office, drawing/drafting, reading/proofreading, and corridor/circulation target cards.
- PEC rows remain `CONFLICT` in `05-source-locator-workbook.csv` because no primary PEC locator was found in this pass.
- v0 must not show PEC as a source-backed law card unless a primary PEC locator is added and approved.

V0 safe rule:
- Use source family badges:
  - `LOCATED, pending SME` for located but unapproved legal values.
  - `TEACHING MODEL` for formula values.
  - `SOURCE APPROVED` only after SME approval.

### LRS-CONFLICT-004 - Emergency illumination 10.7 vs 10.8 lux

Status: `RESOLVED_FOR_V0`
Conflict:
- PRD lists 10.7 lux.
- Existing code modules list 10.8 lux.

Decision:
- `SRC-RA9514-EGRESS-001` resolves the v0 source row to 10.7 lux at floor level using RA 9514 2019 RIRR Rule 10, Division 5, Section 10.2.5.11 A.3.
- Existing modules that still show 10.8 lux are legacy/out-of-scope for this docs pass and must not be copied into the Lighting Room Simulator.

V0 safe rule:
- Do not include emergency egress as a default pass/fail check in the single-room lighting simulator.
- If shown, display as a contextual `LOCATED, pending SME` card only.

### LRS-CONFLICT-005 - Simplified average lux vs inverse-square visual falloff

Status: `RESOLVED_FOR_V0`
Conflict:
- `lux = lumens / area` gives a single average value.
- The 3D scene will show distance and beam angle effects visually.

Decision:
- v0 has two separate models:
  - average-lux teaching model for values and target checks
  - approximate visual model for scene brightness and beam spread

Display rule:
- Info popover must say: "This is a simplified average for learning. It is not a professional photometric calculation."

### LRS-CONFLICT-006 - LPD threshold 10.8 vs 12 W/m2

Status: `RESOLVED_FOR_V0`
Conflict:
- PRD cites Green Building Code office max 10.8 W/m2.
- An earlier violation-rule draft used a 12 W/m2 comparison.

Decision:
- `SRC-PGBC-LPD-001` locates the office LPD source family as Philippine Green Building Code Table 11, Business: Office, 10.80 W/m2.
- The draft 12 W/m2 threshold is retired from active v0 legal/status logic.

V0 safe rule:
- Use 10.8 W/m2 only as `LOCATED, pending SME` until approval.
- Do not use 12 W/m2 as a legal threshold.

### LRS-CONFLICT-007 - Red overlay before source approval

Status: `RESOLVED_FOR_V0`
Conflict:
- PRD asks for red failing surfaces whenever a violation is active.
- Design system reserves destructive red for real errors/critical states.
- Source-pending rules cannot be called violations.

Decision:
- Source-pending under-target states use warning/review styling.
- Approved non-compliance may use destructive red in compact, functional amounts.
- The 3D scene should dim and show a subtle overlay, while the right panel carries the authoritative text.

### LRS-CONFLICT-008 - Single fixture realism

Status: `RESOLVED_FOR_V0`
Conflict:
- A single ceiling fixture producing 12000 lm for drafting may look unrealistic.
- Multi-fixture layouts are excluded from v0.

Decision:
- Treat high-lumen presets as teaching setups.
- Add copy: "In practice this may require multiple luminaires; v0 uses one fixture so the relationship is easier to see."
- Multi-fixture layout becomes v1.

## Required Closeout Before Implementation

- `OPEN` P0 conflicts must be resolved or moved out of learner-facing scope before implementation handoff.
- Every source-backed conflict must point to a source workbook row.
- Every product decision must be reflected in PRD, MVP scope, formula seeds, and release gate.
