# Parking Lot Requirements — Source + Implementation Closeout (2026-05-14)

## BP 220 ratio extraction

Raw source:

- `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf`
- SHA256 already recorded in `05-source-locator-workbook.csv`: `7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614`
- Locator: PDF p.39, Section D.3(g) Parking Requirements, amended per Board Resolution No. 824, Series of 2008.

Extracted quote:

> For multi-family dwellings and condominiums, the parking requirement shall be one (1) parking slot per eight (8) living units. The size of an average automobile (car) parking slot must be computed at 2.5 meters by 5.0 meters for perpendicular or diagonal parking and at 2.15 meters by 6.0 meters for parallel parking.

Normalized implementation rule:

- BP 220 multi-family dwellings and condominiums require 1 parking slot per 8 living units.
- Formula encoded as `Math.ceil(livingUnits / 8)`.
- UI wording remains `CALC OK`, `SHORT N`, and `REVIEW` posture because the module-level source gate is still `SOURCE_PENDING` pending SME approval and PD957 comparison.

Workbook update:

- `PARK-BP220-RATIO` changed from `PARTIAL_LOCATED_TABLE_NEEDS_EXTRACTION` to `LOCATED_NEEDS_SME_REVIEW`.
- Prior "Table 3" wording is treated as a false lead for this specific extracted clause; the raw page uses Section D.3(g) text.

## PD 1096 aisle-width hunt

Raw source searched:

- `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf`
- Focused search output saved in `17-pd1096-aisle-source-hunt.md`.

Result:

- Rule VIII Section 804 item 4(b), PDF p.97, confirms stall dimensions:
  - perpendicular/diagonal car slot: 2.50 m x 5.00 m;
  - parallel car slot: 2.15 m x 6.00 m.
- No reliable raw-text source was found for a 90-degree drive aisle width threshold.
- `PARK-PD1096-AISLE-90` stays `SOURCE_PENDING_FAIL_CLOSED`.
- UI continues to show the drive aisle as visualization only with `SOURCE PENDING`; no pass/fail threshold is encoded.

## Code changes

Updated:

- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.ts`
  - Added `requiredBp220ParkingSlots(livingUnits)`.
  - Added `livingUnits` parameter.
  - Added `requiredBp220` and `bp220ParkingShortfall` to `evaluateParkingChecks`.
  - Replaced old always-warning BP220 rule with `bp220-parking-ratio-shortfall`, warning-only and review-gated.
  - Updated source card text/status for `PARK-BP220-RATIO`.
- `src/features/3d-lab/components/templates/ParkingLotRequirementsPanels.tsx`
  - Added BP220 living-units control in the Lot tab.
  - Added BP220 required-slots and shortfall display.
  - Added BP220 fix text.
- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.test.ts`
  - Added boundary tests for 1:8 BP220 formula and source status.

## Verification

Passed:

- `bun test src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.test.ts src/features/3d-lab/config/module-paths.test.ts src/features/3d-lab/config/registry/index.test.ts`
  - 15 pass, 0 fail, 3504 expect calls.
- `bun run type-check`
  - exit 0.
- `bunx eslint src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.ts src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements.test.ts src/features/3d-lab/components/templates/ParkingLotRequirementsPanels.tsx src/features/3d-lab/hooks/useTemplateContent.tsx src/features/3d-lab/config/registry/cat-16.ts`
  - exit 0.
- Browser QA via Playwright using system Chrome:
  - 1280x800: title visible, BP220 visible, SOURCE PENDING visible, no horizontal overflow, sidebars 384px.
  - 1440x900: title visible, BP220 visible, SOURCE PENDING visible, no horizontal overflow, sidebars 384px.
  - 1920x1080: title visible, BP220 visible, SOURCE PENDING visible, no horizontal overflow, sidebars 384px.

## Remaining source gates

- PD 1096 drive aisle width remains fail-closed.
- LGU overlay remains optional and not selected.
- BP220/PD957 interaction remains SME-review territory before learner-safe legal compliance wording.
