# Conflict Register — Parking Lot Requirements

Purpose: track rule/value conflicts before implementation. This file is mandatory because parking requirements span multiple law families and existing code already has unverified or conflicting numbers.

Current status: `OPEN / SOURCE_PENDING`

## Conflict status labels

- `OPEN`: unresolved, blocks source-ready implementation for affected rule.
- `RESOLVED_SOURCE_READY`: raw source locator and reviewer approval resolve the conflict.
- `DEFERRED`: excluded from MVP and not evaluated in the module.
- `LOCAL_ONLY`: allowed only under a selected LGU/local overlay.
- `COMPARATIVE_ONLY`: may appear in teaching comparison, not compliance logic.

## Known conflicts and ambiguities

| Conflict ID | Topic | Competing values/interpretations | Affected rule IDs | Current status | Required resolution |
|---|---|---|---|---|---|
| PARK-CONFLICT-001 | BP 344 accessible parking stall geometry | Existing code uses `3.70m x 5.00m`; registry description says `4000mm x 5000mm`; source text may define stall + transfer/access aisle differently. | PARK-BP344-ACCESSIBLE-GEOM | OPEN | Extract raw BP 344 2024 IRR parking section/table/figure; separate vehicle bay, transfer space, access aisle, and total clear width. |
| PARK-CONFLICT-002 | Standard stall dimensions source family | Existing code uses `2.50m x 5.00m`; BP 220 converted text supports this for average automobile in housing context; PD 1096 locator not yet proven. | PARK-PD1096-STD-STALL, PARK-BP220-STALL | OPEN | Verify PD 1096 Rule XIX or applicable table; do not generalize BP 220 housing text to all project types unless NBCP confirms. |
| PARK-CONFLICT-003 | Parallel stall dimensions | BP 220 converted text lead: `2.15m x 6.00m`; PD 1096 source locator unknown. | PARK-PD1096-PARALLEL, PARK-BP220-STALL | OPEN | Verify exact raw source and applicability; determine if this is national baseline or BP 220-specific. |
| PARK-CONFLICT-004 | Drive aisle width by angle/direction | Existing code uses `6.0m` for 90°, `5.5m` for 60°, `3.5m` for parallel/street; no locator yet. | PARK-PD1096-AISLE-90 | OPEN | Source table by parking angle, one-way/two-way flow, and vehicle class. If not found, omit from MVP compliance and show as source-pending guide only. |
| PARK-CONFLICT-005 | Off-site parking distance | BP 220 converted text lead says off-site parking not `100m` away from condominium project; PD 957 converted/illustrated leads may include `100m` residential and `200m` commercial. | PARK-BP220-OFFSITE, PARK-PD957-OFFSITE | OPEN | Separate BP 220 vs PD 957 and residential vs commercial applicability. Resolve inclusive/exclusive wording. |
| PARK-CONFLICT-006 | Parking count rounding | `1 parking slot per 8 living units` may require ceiling behavior but source wording/administrative interpretation must confirm. | PARK-BP220-RATIO | OPEN | Verify raw text and any examples/administrative guidance; if absent, mark fractional cases as `REVIEW` not pass/fail. |
| PARK-CONFLICT-007 | International standards vs Philippine compliance | ADA/ITE/AASHTO/ISO may contain different dimensions and quantities. | All comparative rows | COMPARATIVE_ONLY | Keep international values in comparison notes only unless law/local ordinance adopts them. |
| PARK-CONFLICT-008 | LGU stricter overlays | LGUs may require more parking than national baseline. | PARK-LGU-OVERLAY | OPEN | Select specific LGU ordinance(s), source-card each value, and make overlay opt-in/visible. |

## Precedence model draft

Do not implement until source review approves this model.

1. `SOURCE_PENDING` always overrides pass/fail wording. Output is `CALCULATION OK`, `FORMULA ISSUE`, or `REVIEW` only.
2. Project-type law applies before generic baseline:
   - BP 220 only for economic/socialized housing contexts covered by BP 220.
   - PD 957 only for covered subdivision/condominium contexts.
   - Generic PD 1096/NBCP baseline applies where no special project-type rule is selected or where special law refers back to NBCP.
3. BP 344 accessibility overlay applies wherever accessible parking is triggered and may add requirements independent of generic stall rules.
4. RA 9514 fire/life-safety overlay applies only to scoped garage/fire context and never invents parking geometry values.
5. LGU overlay can be stricter than national baseline only when a specific sourced ordinance is selected.
6. If two applicable rules conflict and no precedence is source-approved, result must be `REVIEW`, not pass/fail.

## Interpretation checklist

For each numeric rule, record:
- Is the limit minimum, maximum, average, recommended, or illustrative?
- Is boundary inclusive or exclusive?
- Is count rounded up, rounded down, or handled by bands?
- Is the value per slot, per bay, per access aisle, per row, or per project?
- Does the value depend on vehicle class, angle, circulation direction, or project type?
- Does a figure/table carry binding force or only illustration?
