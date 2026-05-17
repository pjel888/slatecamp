# Lighting Room Simulator — Planning Pack

Working module ID: `lighting-room-simulator`

Current verdict: `CONDITIONAL_GO_FOR_HIDDEN_QA_DOCS` (source locator P0 rows are populated or deferred, architecture bridge is accepted, learner release remains blocked until SME approval)

Proposed product shape: A true 3D room simulator (cutaway view like The Sims) where learners manipulate lighting parameters — lumens, wattage, fixture type, beam angle, color temperature — and see the visual result on the room surfaces in real-time. The ceiling light illuminates the floor and visible walls, with the light intensity and spread updating as parameters change.

This is a **fundamentally new module type** for SlateCamp: the first module where Three.js scene lighting (PointLight, SpotLight intensity/color/angle) is the primary instructional mechanism, not just scene decoration.

## Why this differs from existing lighting modules

Existing `illumination-levels` and `lighting-layout` modules are 2D floor plans showing room layouts with lux targets. This module is a **3D light laboratory** — the room IS the visualization.

- Existing: 2D floor plan, sliders control numbers on a plan
- This: 3D cutaway room, sliders change what you SEE (light intensity, beam spread, color)

## Learning domain

Building Utilities — Electrical / Illumination (Philippine Electrical Code, PEC Rule 9.50.4). Also cross-references LEA topics on:
- Lighting design fundamentals
- Lamp types and efficacy (lumens per watt)
- Illuminance calculation (lux = lumens / m²)
- Lighting power density (LPD)
- Room cavity ratio and coefficient of utilization
- Color temperature and CRI
- PD 1096 natural light/ventilation requirements

## Deliverables in this folder

| # | Document | Status |
|---|----------|--------|
| 1 | `README.md` | ✅ Done |
| 2 | `01-prd.md` | ✅ Done — includes LEA research, parameters, presets, violations, scene design |
| 3 | `02-source-research-plan.md` | ✅ Done — source families identified, locator priorities set |
| 4 | `03-readiness-audit.md` | ✅ Done — no-go blockers and go criteria |
| 5 | `04-preparation-plan.md` | ✅ Done — RALPLAN-DR plan and staffing guidance |
| 6 | `05-source-locator-workbook.csv` | ✅ Seeded — source rows still need locator evidence |
| 7 | `06-formula-testcase-seeds.csv` | ✅ Revised — preset math, learner scenarios, source status |
| 8 | `07-ux-3d-authoring-brief.md` | ✅ Revised — learner flow, source-aware UI, architecture caveats |
| 9 | `08-release-gate-checklist.md` | ✅ Done — hidden QA and learner release gates |
| 10 | `09-conflict-register.md` | ✅ Done — known value/source conflicts |
| 11 | `10-source-card-schema-and-approval.md` | ✅ Done — source display contract |
| 12 | `11-mvp-v0-scope.md` | ✅ Revised — split technical spike vs source-backed release |
| 13 | `12-learner-ux-blueprint.md` | ✅ Done — personas, learning flow, microcopy |
| 14 | `13-implementation-handoff-spec.md` | ✅ Done — later build contract |
| 15 | `14-lighting-architecture-bridge.md` | ✅ Done — renderer/light contract decision |
| 16 | `15-formula-contract.md` | ✅ Done — canonical formulas and preset math |
| 17 | `16-p0-source-locator-and-architecture-closeout.md` | ✅ Done — hidden-QA source/architecture gate closeout |

## Immediate next gate

Hidden QA implementation may start from this planning pack if the build keeps all legal/source checks fail-closed. Learner release remains blocked until SME approval turns applicable source cards from `LOCATED` to `APPROVED`.
