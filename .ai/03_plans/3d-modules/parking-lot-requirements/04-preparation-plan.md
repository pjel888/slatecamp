# Preparation Plan — Parking Lot Requirements

> Planning only. Do not execute production implementation from this document until the readiness audit changes to `CONDITIONAL_GO`.

## Phase 0 — Preserve planning boundaries

1. Keep all work in `.ai/03_plans/3d-modules/parking-lot-requirements/`.
2. Do not edit `src/` module code yet.
3. Do not change dashboard visibility yet.
4. Do not create Supabase migrations or source packs yet.
5. Keep existing user-facing modules untouched until source review tells us whether to replace or deprecate them.

## Phase 1 — Source inventory

1. List raw source files under:
   - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/`
   - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/`
   - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/`
   - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-957/`
   - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/`
   - `vitruvius-connection/001_Raw-Source-Layer/001-Laws/LGU/`
2. Hash each selected file and record it in the workbook.
3. Extract page text around parking hits using raw PDFs.
4. Mark each extracted rule `FOUND`, `PARTIAL`, `CONFLICT`, or `NOT_FOUND`.

## Phase 2 — Source locator workbook completion

1. Fill `05-source-locator-workbook.csv` rows for every MVP rule.
2. Add exact section/table/page/figure locator.
3. Add exact quote or normalized quote.
4. Add applicability condition.
5. Identify conflicts, especially:
   - accessible stall width/depth
   - access aisle width
   - standard stall dimensions by law family
   - off-site parking distance by project type
   - aisle width by angle and circulation direction
6. Produce a separate conflict memo if any legal values disagree.

## Phase 3 — Formula testcase seeds

1. Convert every source rule into at least three tests:
   - below minimum / insufficient count
   - exact limit
   - above minimum / sufficient count
2. Add applicability tests:
   - rule does not run when project type does not match
   - local overlay can be stricter but not weaker
   - source-pending state suppresses `COMPLIANT` / `VIOLATION`
3. Fill `06-formula-testcase-seeds.csv`.

## Phase 4 — UX and model authoring prep

1. Finalize first-load passing baseline.
2. Finalize the minimal left sidebar controls:
   - Project context
   - Stall geometry
   - Accessible parking count/geometry
   - Aisle/circulation width
   - Off-site/on-site distance if source-ready
3. Finalize right sidebar law-card grouping.
4. Define geometry node/instruction IDs:
   - standard stalls
   - accessible stalls
   - access aisle
   - drive aisle
   - pedestrian accessible route
   - building entrance
   - off-site distance line
   - signage/symbol marker
5. Decide whether to use procedural geometry only for MVP. Recommended: procedural MVP first; imported vehicle GLB only later as decorative/provenance-reviewed asset.

## Phase 5 — Implementation handoff plan, still no code

After Phases 1–4:
1. Update `03-readiness-audit.md` verdict.
2. Write a code implementation plan with exact files, tests, and commands.
3. Decide module path:
   - Preferred: new hidden module `parking-lot-requirements` under `16-site-dev`.
   - Alternative: source-gated rewrite of `parking-slot-dimensions` and `parking-layout`.
4. Require independent review before implementation starts.

## Future implementation sketch

Likely files, if approved later:
- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.ts`
- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements-source.ts`
- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements-computation.ts`
- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.test.ts`
- `src/features/3d-lab/components/parking/ParkingLotWorkbenchPanels.tsx`
- registry entry in `src/features/3d-lab/config/registry/cat-16.ts`
- module import path tests if resolver behavior changes

Do not execute this sketch until source readiness is approved.
