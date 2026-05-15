# Parking Lot Requirements Compliance Tool — Planning Pack

Working module ID: `parking-lot-requirements`

Current verdict: `PLANNING / NO CODE YET`

Proposed product shape: a source-gated 3D Lab compliance workbench for parking stall dimensions, accessible parking quantities, access aisles, drive aisles, vehicle circulation, off-site/on-site parking rules, and law conflicts across Philippine source families.

This is not a replacement for professional code consultation or LGU review. For SlateCamp, it is an LEA learning and code-comprehension tool.

## Why this needs its own planning folder

Parking requirements are split across multiple rule families:
- PD 1096 / NBCP: baseline building-code parking and occupancy context.
- BP 344 2024 Revised IRR: accessible parking quantity, location, accessible route, transfer space, signage/symbols, and route safety.
- BP 220: economic/socialized housing parking slot ratios and parking stall sizes for housing contexts.
- PD 957: subdivision/condominium circulation, open space, off-site/on-site parking references, and NBCP conformity.
- RA 9514: fire/life safety implications for parking garages, drive aisles, access, hazard classification, fire protection, and egress interfaces.
- LGU zoning ordinances: may impose stricter parking ratios and operational requirements.
- International/local standards references: useful for comparison and geometry vocabulary, but not Philippine legal truth unless adopted by local law/project standard.

## Existing repo signals inspected

Current code already has draft/legacy modules:
- `src/features/3d-lab/config/modules/16-site-dev/parking-layout.ts`
- `src/features/3d-lab/config/modules/16-site-dev/parking-slot-dimensions.ts`
- `src/features/3d-lab/config/registry/cat-16.ts`

Planning implication: do not blindly expand those existing modules. They contain useful scaffolding but several cited values need source-card verification and may need replacement by a new source-gated module or a full rewrite.

## Deliverables in this folder

- `01-prd.md`
- `02-source-research-plan.md`
- `03-readiness-audit.md`
- `04-preparation-plan.md`
- `05-source-locator-workbook.csv`
- `06-formula-testcase-seeds.csv`
- `07-ux-3d-authoring-brief.md`
- `08-release-gate-checklist.md`
- `09-conflict-register.md`
- `10-source-card-schema-and-approval.md`
- `11-mvp-v0-scope.md`
- `12-ux-study-happy-paths-and-layout.md`

## Immediate next gate

Complete source locator workbook from raw PDFs under `vitruvius-connection/001_Raw-Source-Layer/` and official web captures where local source is missing. Do not implement compliance logic until every learner-visible rule has locator evidence.
