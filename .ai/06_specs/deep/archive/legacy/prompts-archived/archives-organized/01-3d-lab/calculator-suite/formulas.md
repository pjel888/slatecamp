Yes — below is a build-ready product spec for the first three calculators: flooring/tile, paint, and drywall. I’m keeping the formulas auditable, the inputs constrained, and the 3D behavior limited to geometry that directly affects estimation, which fits your accuracy-first approach and your Three.js / React Three Fiber limits. [benjaminmoore](https://www.benjaminmoore.com/en-us/paint-calculator)

## Shared rules

All three calculators should follow one common product standard. Existing paint, tile, and framing calculators consistently expose dimensions, deductions, coverage or spacing assumptions, and rounding rules, so your app should do the same instead of hiding “smart” logic behind the UI. [readycalculator](https://readycalculator.com/cs/paint-calculator)

Use these shared rules:
- Units: metric first, with internal normalization to millimeters and square meters.
- Every result shows: gross quantity, deductions, net quantity, waste or adjustment, rounded procurement quantity.
- Every sponsor value is editable.
- Every tool has two result modes: “Net Quantity” and “Buy Quantity.”
- Every tool labels results as preliminary estimation only, not final BOQ or code-certified output. [lowes](https://www.lowes.com/n/calculators/paint-calculator)

## Flooring spec

This should be the most visual calculator, because layout and cut behavior are part of the estimate. Tile tools commonly estimate from area, module size including grout, pattern-driven waste, and box rounding, and some also show a layout preview, which matches your 3D advantage well. [cosmomath](https://cosmomath.com/construction/tile-layout-waste-calculator/)

### Inputs

| Field | Type | Required | Notes |
|---|---|---:|---|
| roomMode | enum | Yes | `rectangle` or `polygon-simple` |
| roomLengthMm | number | If rectangle | Internal base unit mm |
| roomWidthMm | number | If rectangle | Internal base unit mm |
| floorPolygonPoints | point[] | If polygon-simple | Flat 2D footprint only |
| exclusions | rect[] or poly[] | No | Columns, floor openings, fixed islands |
| tileLengthMm | number | Yes | Sponsor SKU default allowed |
| tileWidthMm | number | Yes | Sponsor SKU default allowed |
| groutJointMm | number | Yes | Default from sponsor or user |
| pattern | enum | Yes | `straight`, `brick`, `diagonal`, `herringbone-lite` |
| wastePercent | number | Yes | User-editable |
| boxCoverageSqm | number | No | For procurement rounding |
| orientationDeg | number | No | Usually 0 or 90; diagonal can be derived |
| includeSparePercent | number | No | Optional extra spare stock |

### Formula logic

Gross area should come from room geometry, then subtract exclusions, then convert to net floor area. Area-based tile estimators typically divide total area by effective tile coverage and then add waste, while pattern complexity increases waste because of cuts. [calculatorjar](https://calculatorjar.com/construction/tile-calculator)

Use this formula set:
- Gross floor area:
  - Rectangle mode: \(A_g = \dfrac{L \times W}{1{,}000{,}000}\)
  - Polygon mode: use polygon area in square millimeters, then divide by 1,000,000.
- Exclusion area:
  - \(A_e = \sum \text{all exclusion areas in sqm}\)
- Net floor area:
  - \(A_n = A_g - A_e\)
- Effective tile module area:
  - \(A_m = \dfrac{(T_l + J) \times (T_w + J)}{1{,}000{,}000}\)
  - where \(T_l\) = tile length mm, \(T_w\) = tile width mm, \(J\) = grout joint mm.
- Raw tile count:
  - \(N_r = \dfrac{A_n}{A_m}\)
- Adjusted tile count:
  - \(N_a = N_r \times (1 + W + S)\)
  - where \(W\) = waste fraction, \(S\) = optional spare fraction.
- Buy tile count:
  - round up \(N_a\) to whole tiles.
- Boxes to buy:
  - if box coverage is used: \(B = \left\lceil \dfrac{A_n \times (1 + W + S)}{\text{boxCoverageSqm}} \right\rceil\) [homeprojectcalculator](https://homeprojectcalculator.com/tile-calculator/)

### Pattern presets

Pattern should mostly affect waste and preview logic, not your base geometry engine. Many tile calculators treat pattern as a waste adjustment rather than a full fabrication solver, which is a good fit for MVP. [cosmomath](https://cosmomath.com/construction/tile-layout-waste-calculator/)

Suggested defaults:
- Straight: 5% to 10% waste.
- Brick: 8% to 12% waste.
- Diagonal: 10% to 15% waste.
- Herringbone-lite: 12% to 18% waste. [calculatorjar](https://calculatorjar.com/construction/tile-calculator)

### 3D behavior

The 3D scene should show only:
- Floor surface.
- Exclusion zones.
- Tile grid.
- Cut tiles highlighted differently.
- Pattern orientation arrow.

Do not model grout thickness, adhesives, or edge trims in 3D for MVP. The preview’s job is to explain counted full tiles versus cut tiles, not simulate installation.

### Output schema

```ts
type FlooringEstimateResult = {
  grossAreaSqm: number
  exclusionAreaSqm: number
  netAreaSqm: number
  effectiveModuleAreaSqm: number
  rawTileCount: number
  adjustedTileCount: number
  roundedTileCount: number
  wastePercentApplied: number
  sparePercentApplied: number
  boxCoverageSqm?: number
  boxesToBuy?: number
  cutTileCountApprox?: number
  assumptions: string[]
}
```

### Out of scope

- Curved rooms.
- Multi-room projects in one estimate.
- Stair treads and risers.
- Complex mosaics.
- True fabrication nesting.
- Adhesive, grout bag, or trim calculations in V1.

## Paint spec

This should be the cleanest and fastest tool. Existing paint calculators are very consistent: compute wall area, subtract windows and doors, optionally include ceilings, multiply by coats, then divide by product coverage. [greenhauspainting](https://greenhauspainting.com/paint-calculator/)

### Inputs

| Field | Type | Required | Notes |
|---|---|---:|---|
| inputMode | enum | Yes | `room` or `wall-by-wall` |
| roomLengthMm | number | If room | |
| roomWidthMm | number | If room | |
| wallHeightMm | number | If room | |
| wallSegments | wall[] | If wall-by-wall | Supports irregular but flat rooms |
| openings | opening[] | No | Doors and windows with width and height |
| includeCeiling | boolean | Yes | |
| ceilingAreaOverrideSqm | number | No | For non-rectangular ceiling override |
| coatsPrimer | number | No | Usually 0 or 1 |
| coatsTopcoat | number | Yes | Usually 1 to 3 |
| productCoverageSqmPerLiter | number | Yes | Sponsor default, user-editable |
| primerCoverageSqmPerLiter | number | No | If separate product |
| wastePercent | number | Yes | Small allowance for touch-ups / variation |
| substrateType | enum | No | `new-drywall`, `repaint`, `masonry-smooth`, `masonry-rough` |

### Formula logic

The core logic should follow standard paint calculator behavior: compute wall area, subtract opening areas, optionally add ceiling area, then multiply by coats and divide by coverage rate. Paint references also show that door/window deductions and coat counts materially affect results, so those must be visible. [decoratly](https://www.decoratly.com/tools/paint-calculator)

Use this formula set:
- For room mode, gross wall area:
  - \(A_w = \dfrac{2(L + W) \times H}{1{,}000{,}000}\)
- For wall-by-wall mode:
  - \(A_w = \sum \dfrac{\text{wallLengthMm} \times \text{wallHeightMm}}{1{,}000{,}000}\)
- Opening area:
  - \(A_o = \sum \dfrac{\text{openingWidthMm} \times \text{openingHeightMm}}{1{,}000{,}000}\)
- Net wall paint area:
  - \(A_{nw} = A_w - A_o\)
- Ceiling area:
  - rectangle mode: \(A_c = \dfrac{L \times W}{1{,}000{,}000}\)
  - or use override if supplied.
- Base paintable area:
  - \(A_b = A_{nw} + A_c\) if ceiling included, else \(A_b = A_{nw}\)
- Adjusted topcoat area:
  - \(A_t = A_b \times (1 + W) \times C_t\)
  - where \(W\) = waste fraction, \(C_t\) = topcoat coats.
- Topcoat liters:
  - \(L_t = \dfrac{A_t}{\text{topcoatCoverageSqmPerLiter}}\)
- Primer area:
  - \(A_p = A_b \times C_p\)
- Primer liters:
  - \(L_p = \dfrac{A_p}{\text{primerCoverageSqmPerLiter}}\) [readycalculator](https://readycalculator.com/cs/paint-calculator)

### Product behavior

Since sponsors matter here, the tool should support product presets:
- Coverage rate.
- Available can sizes.
- Suggested primer.
- Suggested coats.
- Finish type, such as flat, eggshell, semi-gloss.

But every one of those values must remain editable, because real coverage varies by surface and application method. [myboysen](https://www.myboysen.com/estimate-the-amount-of-paint/)

### 3D behavior

The 3D scene should show:
- Room shell.
- Doors and windows as deducted openings.
- Color-coded surfaces:
  - paintable wall,
  - excluded opening,
  - optional ceiling.
- Real-time surface highlighting when the user hovers result rows.

Do not attempt roller-stroke simulation, texture absorption simulation, or lighting-based finish realism in MVP.

### Output schema

```ts
type PaintEstimateResult = {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  ceilingAreaSqm: number
  basePaintableAreaSqm: number
  topcoatCoats: number
  primerCoats: number
  adjustedTopcoatAreaSqm: number
  topcoatLiters: number
  primerLiters?: number
  topcoatCanSuggestion?: { sizeLiters: number; quantity: number }[]
  primerCanSuggestion?: { sizeLiters: number; quantity: number }[]
  wastePercentApplied: number
  assumptions: string[]
}
```

### Out of scope

- Exterior facades.
- Curved walls.
- Decorative finishes like textures or faux finishes.
- Labor, scaffold, or access costs.
- Compliance claims about VOC, fire, or code unless explicitly sourced from sponsor product data.

## Drywall spec

This tool should estimate a simple non-loadbearing partition assembly. Framing calculators commonly rely on wall length, stud spacing, and rounding logic, and drywall estimates then layer board counts, opening deductions, and track lengths on top. [ls-usa](https://ls-usa.com/framing-calculator)

### Inputs

| Field | Type | Required | Notes |
|---|---|---:|---|
| wallLengthMm | number | Yes | One wall run only in V1 |
| wallHeightMm | number | Yes | |
| openings | opening[] | No | Door/window width and height |
| studSpacingMm | number | Yes | Presets like 400 or 600 mm |
| boardLengthMm | number | Yes | Sponsor preset |
| boardWidthMm | number | Yes | Sponsor preset |
| boardLayersPerSide | number | Yes | Usually 1 or 2 |
| sidesBoarded | enum | Yes | `one-side` or `two-side` |
| boardOrientation | enum | Yes | `vertical` or `horizontal` |
| wastePercent | number | Yes | |
| includeCornerStudAllowance | boolean | Yes | Default true |
| cornerStudExtraCount | number | No | Usually 0 to 2 |
| includeOpeningFramingAllowance | boolean | Yes | Default true |
| openingFramingFactor | number | No | Simple allowance factor |
| trackStockLengthMm | number | No | For procurement rounding |

### Formula logic

The base wall surface is straightforward: wall area minus openings, multiplied by boarded faces and board layers. Framing references also show the basic stud count formula as wall length divided by spacing plus one, rounded up, with end and corner logic added after. [inchcalculator](https://www.inchcalculator.com/framing-calculator/)

Use this formula set:
- Gross wall face area:
  - \(A_g = \dfrac{L \times H}{1{,}000{,}000}\)
- Opening area:
  - \(A_o = \sum \dfrac{\text{openingWidthMm} \times \text{openingHeightMm}}{1{,}000{,}000}\)
- Net wall face area:
  - \(A_n = A_g - A_o\)
- Boarded face multiplier:
  - one side = 1, two side = 2
- Total boarded area:
  - \(A_b = A_n \times F \times \text{boardLayersPerSide}\)
- Board area:
  - \(A_{sheet} = \dfrac{\text{boardLengthMm} \times \text{boardWidthMm}}{1{,}000{,}000}\)
- Raw board count:
  - \(N_b = \dfrac{A_b}{A_{sheet}}\)
- Adjusted board count:
  - \(N_{ba} = N_b \times (1 + W)\)

Stud logic:
- Base stud count:
  - \(N_s = \left\lceil \dfrac{L}{S} \right\rceil + 1\)
  - where \(S\) = stud spacing. [miniwebtool](https://miniwebtool.com/stud-wall-framing-calculator/)
- Add end/corner allowance:
  - \(N_{sc} = N_s + C\)
- Add opening framing allowance:
  - simple MVP method: per opening add a user-editable number of extra studs, default 2 to 4 depending on opening type.
- Final stud count:
  - \(N_{sf} = N_{sc} + N_{openingsExtra}\)

Track logic:
- Base track length:
  - \(T = 2L\) for top and bottom track.
- Track buy quantity:
  - \(N_t = \left\lceil \dfrac{2L}{\text{trackStockLengthMm}} \right\rceil\)

Optional accessory estimates:
- Screws, tape, and compound should be phase 2 only unless you have sponsor data you trust.

### Orientation logic

Board orientation should affect preview and sheet optimization, but not require a complex cutting solver in V1. Use a simple heuristic:
- Vertical orientation favors board height matching wall height.
- Horizontal orientation favors stacked rows across length.
- If wall height exceeds board length, show additional joint row.

That is enough for a useful preview without building a full nesting engine.

### 3D behavior

The 3D scene should show:
- Simplified stud lines at chosen spacing.
- Top and bottom tracks.
- Opening voids.
- Board panels overlaid as sheets on selected faces.
- Toggle between frame-only and boarded view.

Do not render screws, joint compound, corner beads, or realistic section depth unless needed for clarity.

### Output schema

```ts
type DrywallEstimateResult = {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  boardedFaceCount: number
  boardLayersPerSide: number
  totalBoardedAreaSqm: number
  boardAreaSqm: number
  rawBoardCount: number
  adjustedBoardCount: number
  roundedBoardCount: number
  studSpacingMm: number
  baseStudCount: number
  cornerAllowanceCount: number
  openingExtraStudCount: number
  finalStudCount: number
  trackLengthMm: number
  trackStockLengthMm?: number
  trackPiecesToBuy?: number
  wastePercentApplied: number
  assumptions: string[]
}
```

### Out of scope

- Curved partitions.
- Acoustic rating certification.
- Fire-rating compliance claims.
- Load-bearing walls.
- Complex bulkheads, soffits, and ceiling transitions.
- Full hardware, screw, tape, and compound procurement in V1.

## UX structure

All three tools should use the same UI pattern so the product feels like one system. Consistent calculators are easier to trust and easier to sponsor.

Use this structure:
1. Inputs panel on the left.
2. 3D preview center.
3. Result breakdown on the right.
4. “Assumptions” accordion under results.
5. Sponsor product card below inputs.
6. Toggle for:
- Net quantity.
- Buy quantity.
- Show deductions.
- Show waste.
- Show sponsor defaults.

## Release recommendation

The best implementation order is still flooring first, then paint, then drywall. Flooring best showcases the 3D value, paint is the fastest to make reliable, and drywall is the most technical of the three but still manageable with a strict one-wall-run scope. [benjaminmoore](https://www.benjaminmoore.com/en-us/paint-calculator)

Would you like me to convert this next into TypeScript interfaces plus a normalized calculation engine structure for React and Zustand?
