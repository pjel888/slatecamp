# Readiness Audit — Parking Lot Requirements

Current verdict: `NO_GO FOR IMPLEMENTATION` / `PLANNING ONLY`

Reason: there is enough evidence to scope the module, but not enough verified source-card evidence to encode learner-visible compliance rules.

## Repo readiness findings

| Area | Finding | Readiness |
|---|---|---|
| Existing module scaffolding | `parking-layout.ts` and `parking-slot-dimensions.ts` exist under `16-site-dev`. They are useful references but not source-gated. | Partial |
| Registry | `cat-16.ts` already lists `parking-layout` and `parking-slot-dimensions` as ready. New compliance tool should not inherit this status automatically. | Needs correction plan during implementation |
| Dashboard visibility | Current dashboard visible IDs do not include parking modules. | Good for hidden-first plan |
| Source system | `vitruvius-source-reference.md` identifies raw PDFs for PD 1096, BP 344, BP 220, PD 957, RA 9514. | Good starting point |
| Compliance precedent | BP 344 ramp and stairway modules establish fail-closed/source-pending behavior. | Strong pattern |
| Formula tests | No parking-specific source-backed formula tests identified yet. | Missing |
| 3D geometry | Existing parking modules use simple procedural geometry, but geometry is not tied to approved source rules. | Reusable only after rewrite |

## Source readiness findings

| Rule group | Source status | Risk |
|---|---|---|
| Standard stall dimensions | Leads exist in BP 220 converted text and existing code; PD 1096 locator still needed. | Medium/high until exact raw PDF locator found |
| Parallel stall dimensions | Lead exists in BP 220 converted text. | Medium until raw PDF verified |
| Accessible parking quantities | BP 344 converted text has Table A.6.1 lead. | Medium until raw PDF page/table verified |
| Accessible parking stall geometry | Existing code says 3.70m x 5.00m; BP 344 registry description says 4000mm x 5000mm. This conflict must be resolved from raw PDF. | High blocker |
| Off-site parking distance | BP 220 lead says 100m; PD 957 illustrated material suggests 100m residential / 200m commercial. Must separate source family/applicability. | High blocker |
| Drive aisle widths | Existing code uses 6.0m, 5.5m, 3.5m. Source locator not yet verified. | High blocker |
| Truck/bus stall dimensions | Existing code uses 3.6m x 12.0m. Source locator not verified. | High blocker |
| Fire code interface | RA 9514 source exists but specific parking-garage rules not yet located. | High blocker |
| LGU overlays | Local source folder exists but no selected ordinance matrix yet. | Deferred blocker for LGU mode |

## UX readiness findings

Strengths:
- Parking is inherently spatial and suitable for 3D/floorplan teaching.
- Existing stairway UX lessons are directly applicable: minimal controls, compact law cards, universal failure red.
- Learners can understand code conflicts visually.

Risks:
- Too many rule families can make the first-load UI noisy.
- Parking ratios/counts can become spreadsheet-like if not tied to geometry.
- Accessibility cannot be reduced to stall width alone.
- Local ordinance overlays can mislead if presented as universal.

## Required readiness gates before code

1. Source locator workbook completed for MVP rules.
2. Conflict register resolves BP 344 accessible stall dimension discrepancy.
3. Formula testcase seeds filled for every MVP rule.
4. UX brief approved for first-load control set and right-panel law-card grouping.
5. Implementation plan decides whether to replace existing `parking-layout`/`parking-slot-dimensions` or create a new hidden module ID.
6. Independent planning review signs off on source gating and UX scope.

## MVP source scope for conditional implementation GO

Minimum viable hidden QA implementation may start only if these are source-locator-ready:
- Standard perpendicular/diagonal stall size.
- Parallel stall size.
- Accessible parking quantity table/bands.
- Accessible stall/access aisle geometry.
- Basic on-site/off-site parking distance for one chosen residential/housing context.
- One drive aisle requirement or explicitly source-pending/no-check if not verified.

## Current verdict

`NO_GO FOR CODE IMPLEMENTATION` now.

`CONDITIONAL_GO` can be granted after source locator and formula seeds are complete for the MVP scope above. Conditional GO means hidden QA only, not learner release.
