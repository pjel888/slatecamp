# SlateCamp 3D Calculator Suite — Final Consolidated Roadmap

**Document type:** Product spec + formula reference + business plan
**Date:** April 2026
**Status:** Single source of truth

---

## What We Already Have

| Tool | Status | Notes |
|---|---|---|
| **Site Development Controls Visualizer** | Built (3D Lab module) | PD 1096 Rules VII & VIII — AMBF, PSO, TOSL, ISA, USA, MACA, BHL, TGFA, TLA, FAR, RROW. Full Zustand store, Bloom's Taxonomy alignment, hotspots, quiz, Design Challenge Mode. |
| **Staircase Calculator** | Built (3D Lab module) | PD 1096 stair standards, riser/tread computation, code compliance indicators. |

These two tools are already part of the 3D Lab's educational module system. The new Calculator Suite is a **separate product surface** — free-access tools designed for traffic acquisition, sponsor revenue, and ALE exam funnel. The existing 3D Lab modules stay behind the SlateCamp Pro paywall.

---

## The Calculator Suite: 11 New Tools, 5 Phases

### Phase 1 — The Launch Trio

Ship first. Highest marketability, lowest complexity, clearest sponsor fit. Each covers a different surface type (floor, wall finish, wall system).

### Phase 2 — The Masonry Pair

Fast follow. Highest demand in PH market among practicing architects. Slightly more estimation variance from mortar/plaster assumptions.

### Phase 3 — Ceiling + Roof

High utility, moderate geometry complexity. Managed by constraining to flat ceilings and simple roof types.

### Phase 4 — Code-Adjacent Tools

High ALE exam value. Visualize building code requirements spatially. Ramp calculator + window compliance checker.

### Phase 5 — Site + Specialty

Professional-tier expansion. Perimeter fence, concrete mix, lumber board feet.

---

## Release Matrix

| # | Tool | Phase | Ship order | Sponsor category | Complexity | Revenue model |
|---|---|---|---|---|---|---|
| 1 | Flooring / Tile Visualizer | 1 | First | Tile manufacturer | Medium | Sponsor + freemium |
| 2 | Paint Visualizer | 1 | Second | Paint brand | Low | Sponsor + freemium |
| 3 | Drywall Partition Estimator | 1 | Third | Board/framing supplier | Medium | Sponsor + freemium |
| 4 | CHB Wall Builder | 2 | Fourth | Cement/CHB supplier | Medium-High | Sponsor + freemium |
| 5 | Plastering & Skim Coat Calculator | 2 | Fifth | Skim coat/mortar brand | Low-Medium | Sponsor |
| 6 | Flat Ceiling Grid Calculator | 3 | Sixth | Ceiling system supplier | Medium | Sponsor |
| 7 | Roof Sheet Estimator | 3 | Seventh | Roofing manufacturer | High | Sponsor + premium |
| 8 | PWD Accessibility Ramp Calculator | 4 | Eighth | Accessibility products | Medium | Pro integration |
| 9 | Window-to-Floor Area Checker | 4 | Ninth | Window manufacturer | Low | Pro integration |
| 10 | Perimeter Fence/Wall Estimator | 5 | Tenth | CHB/cement (shared) | Medium | Pro + B2B |
| 11 | Concrete Volume & Mix Calculator | 5 | Eleventh | Cement/ready-mix | Low | Pro + B2B |

**Removed from original 25:** Skirting/cornice, cabinet/countertop, closet/wardrobe, scaffolding, waterproofing (→ paint extension), door/window schedule (→ BIM territory), gutter/downspout (→ engineering territory), floor finish comparator (→ design not estimation), landscape hardscape (→ low reliability), formwork (→ PE territory risk), CHB comparator (→ 3D Lab educational module), dropped/cove ceiling (→ geometry too complex), lot setback visualizer (→ already built), staircase (→ already built), board feet lumber (→ low sponsor fit, add later if demand).

---

## Shared Product Rules (All Tools)

### Units and display
- Internal computation: millimeters and square meters
- Display: user toggle between metric (mm/m/sq.m.) and imperial (in/ft/sq.ft.)
- Default: metric first (Philippine standard)

### Result transparency
Every output shows the full calculation trail:
1. Gross quantity (before any deductions)
2. Deductions (openings, exclusions)
3. Net quantity (what you're actually covering)
4. Waste/adjustment factor applied
5. Rounded procurement quantity (what you actually buy)

### Sponsor integration
- Sponsor data prefills defaults (coverage rates, product sizes, box quantities)
- Every sponsor value is user-editable
- Sponsor card appears below inputs panel, never inside the result trail
- Tool credibility > sponsor visibility

### Result modes
- **Net Quantity:** what the project actually needs
- **Buy Quantity:** rounded up to purchasable units (boxes, cans, sheets, pieces)

### Estimation disclaimer
All results labeled: *"Preliminary estimation for budgeting purposes. Not a final bill of quantities or code-certified documentation."*

### UX structure (shared layout)
1. Inputs panel — left (mobile: top)
2. 3D preview — center (mobile: middle, full width)
3. Result breakdown — right (mobile: bottom)
4. "Assumptions" accordion — under results
5. Sponsor product card — below inputs
6. Toggles: Net/Buy quantity, Show deductions, Show waste, Show sponsor defaults

### 3D rendering rules
- Only render geometry that directly drives the formula
- Real-time feedback: every input change updates 3D + material count simultaneously
- Progressive detail: default view clean, toggles reveal layers (framing, cross-section, rebar)
- Mobile-first: 30fps target, <50 draw calls, `frameloop="demand"`, `invalidate()` on input change
- No text in canvas: material counts, labels, dimensions as DOM overlays
- Interaction: tap to select surfaces, drag to position openings, pinch to zoom, orbit to rotate

---

## PHASE 1 — DETAILED SPECS

---

### Tool 1: Flooring / Tile Layout Visualizer

**The hero tool.** Strongest 3D payoff. Pattern preview + cut optimization + waste calculation.

#### Input schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `roomMode` | enum | Yes | `rectangle` or `polygon-simple` |
| `roomLengthMm` | number | If rectangle | |
| `roomWidthMm` | number | If rectangle | |
| `floorPolygonPoints` | point[] | If polygon | Flat 2D footprint, L-shapes only in MVP |
| `exclusions` | rect[] | No | Columns, floor openings, fixed islands |
| `tileLengthMm` | number | Yes | Sponsor SKU default allowed |
| `tileWidthMm` | number | Yes | Sponsor SKU default allowed |
| `groutJointMm` | number | Yes | Default 3mm, editable |
| `pattern` | enum | Yes | `straight`, `brick`, `diagonal`, `herringbone-lite` |
| `wastePercent` | number | Yes | Auto-set by pattern, user-editable |
| `boxCoverageSqm` | number | No | For box rounding |
| `orientationDeg` | number | No | 0° or 90°; diagonal derived |
| `includeSparePercent` | number | No | Optional extra spare stock |

#### PH tile size presets

| Label | Dimensions (mm) | Common use |
|---|---|---|
| 20×20 | 200 × 200 | Budget residential floor, T&B wall |
| 30×30 | 300 × 300 | Standard residential |
| 40×40 | 400 × 400 | Mid-range residential |
| 60×60 | 600 × 600 | Premium residential, commercial |
| 30×60 | 300 × 600 | Walls, accent floors |
| 80×80 | 800 × 800 | Large-format premium |

#### Pattern waste presets

| Pattern | Default waste % | Cut complexity |
|---|---|---|
| Straight (grid) | 5–10% | Low — cuts only at edges |
| Brick (running bond) | 8–12% | Medium — offset cuts at alternating rows |
| Diagonal (45°) | 10–15% | High — angled cuts on all edges |
| Herringbone-lite | 12–18% | Highest — every edge piece is a cut |

#### Formulas

**Gross floor area:**

Rectangle mode:
```
A_gross = (roomLengthMm × roomWidthMm) / 1,000,000   [sq.m.]
```

Polygon mode:
```
A_gross = shoelace_area(floorPolygonPoints) / 1,000,000   [sq.m.]
```

**Exclusion area:**
```
A_exclusion = Σ (exclusion_width × exclusion_height) / 1,000,000   [sq.m.]
```

**Net floor area:**
```
A_net = A_gross − A_exclusion   [sq.m.]
```

**Effective tile module area** (tile + grout on two sides):
```
A_module = ((tileLengthMm + groutJointMm) × (tileWidthMm + groutJointMm)) / 1,000,000   [sq.m.]
```

**Raw tile count:**
```
N_raw = A_net / A_module
```

**Adjusted tile count** (waste + spare):
```
N_adjusted = N_raw × (1 + wastePercent/100 + sparePercent/100)
```

**Buy tile count:**
```
N_buy = ⌈N_adjusted⌉   (round up to whole tiles)
```

**Boxes to buy** (if box coverage provided):
```
B_buy = ⌈(A_net × (1 + wastePercent/100 + sparePercent/100)) / boxCoverageSqm⌉
```

#### Output schema

```ts
type FlooringResult = {
  grossAreaSqm: number
  exclusionAreaSqm: number
  netAreaSqm: number
  effectiveModuleAreaSqm: number
  rawTileCount: number
  adjustedTileCount: number
  roundedTileCount: number        // N_buy
  wastePercentApplied: number
  sparePercentApplied: number
  boxCoverageSqm?: number
  boxesToBuy?: number
  cutTileCountApprox?: number     // perimeter tiles requiring cuts
  assumptions: string[]
}
```

#### 3D behavior

Render:
- Floor plane at room dimensions
- Exclusion zones as dark cutouts
- Individual tiles at correct proportions with grout gaps
- Cut tiles along edges highlighted in contrasting color
- Pattern orientation arrow

Do NOT render: grout thickness in 3D, adhesive layer, edge trims, wall tiles

#### Sponsor fields

`SKU`, `tileSizeMm` (L×W), `finishType`, `boxCoverageSqm`, `recommendedWastePercent`, `availablePatterns`, `brandName`, `brandLogoUrl`

#### Out of scope (V1)

Curved rooms, sloped floors, custom mosaics, multi-room projects, wall tile mode, stair treads, adhesive/grout bag estimation, true fabrication nesting

---

### Tool 2: Paint Visualizer with Room Preview

**Fastest to build, most reliable formulas.** Sponsor integration is natural — coverage rates are product-specific.

#### Input schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `inputMode` | enum | Yes | `room` or `wall-by-wall` |
| `roomLengthMm` | number | If room | |
| `roomWidthMm` | number | If room | |
| `wallHeightMm` | number | If room | |
| `wallSegments` | wall[] | If wall-by-wall | Each wall: length + height |
| `openings` | opening[] | No | Each: width, height, type (door/window) |
| `includeCeiling` | boolean | Yes | |
| `ceilingAreaOverrideSqm` | number | No | For non-rectangular ceilings |
| `substrateType` | enum | No | `new-concrete`, `repaint`, `exterior` |
| `coatsTopcoat` | number | Yes | Default 2 |
| `coatsPrimer` | number | No | Default 1 for new concrete, 0 for repaint |
| `topcoatCoverageSqmPerLiter` | number | Yes | Sponsor default, editable |
| `primerCoverageSqmPerLiter` | number | No | If separate product |
| `wastePercent` | number | Yes | Default 10% |
| `canSizesAvailable` | number[] | No | e.g., [1, 4, 16] liters |

#### PH coating system presets

| Substrate | System (bottom → top) |
|---|---|
| New concrete | Neutralizer → Skim coat → Putty → Primer (1 coat) → Topcoat (2 coats) |
| Repaint | Sanding → Spot putty → Primer (1 coat) → Topcoat (2 coats) |
| Exterior | Waterproofing primer → Elastomeric topcoat (2 coats) |

#### PH paint coverage reference

| Brand | Product | Coverage (sq.m./4L) | Use |
|---|---|---|---|
| Boysen | Permacoat Latex (primer) | 25–30 | Interior primer |
| Boysen | Permacoat Latex (topcoat) | 30–35 | Interior topcoat |
| Davies | Megacryl Primer | 20–25 | Interior primer |
| Davies | Megacryl Semi-Gloss | 25–30 | Interior topcoat |
| Island | Premium Latex | 25–30 | Interior topcoat |

*Coverage = per 4L can. Per-liter = divide by 4. All values are sponsor-editable defaults.*

#### Formulas

**Gross wall area:**

Room mode:
```
A_wall_gross = (2 × (roomLengthMm + roomWidthMm) × wallHeightMm) / 1,000,000   [sq.m.]
```

Wall-by-wall mode:
```
A_wall_gross = Σ (wallLengthMm × wallHeightMm) / 1,000,000   [sq.m.]
```

**Opening deduction area:**
```
A_openings = Σ (openingWidthMm × openingHeightMm) / 1,000,000   [sq.m.]
```

**Net wall paint area:**
```
A_wall_net = A_wall_gross − A_openings   [sq.m.]
```

**Ceiling area** (if included):
```
A_ceiling = (roomLengthMm × roomWidthMm) / 1,000,000   [sq.m.]
// or use ceilingAreaOverrideSqm if provided
```

**Base paintable area:**
```
A_base = A_wall_net + (includeCeiling ? A_ceiling : 0)   [sq.m.]
```

**Adjusted topcoat area** (waste + coats):
```
A_topcoat_total = A_base × (1 + wastePercent/100) × coatsTopcoat   [sq.m.]
```

**Topcoat liters:**
```
L_topcoat = A_topcoat_total / topcoatCoverageSqmPerLiter   [liters]
```

**Primer area** (no waste factor — primer applied once, evenly):
```
A_primer_total = A_base × coatsPrimer   [sq.m.]
```

**Primer liters:**
```
L_primer = A_primer_total / primerCoverageSqmPerLiter   [liters]
```

**Can count optimization** (if can sizes provided):
```
For each product (topcoat, primer):
  Start from largest can size, fill greedily, round up final can.
  Example: 18.5L needed, cans [16, 4, 1] → 1×16L + 1×4L = 20L (nearest without under-buying)

  // Greedy algorithm:
  remaining = liters_needed
  for each canSize in canSizesAvailable (descending):
    count = ⌊remaining / canSize⌋
    remaining -= count × canSize
  if remaining > 0:
    add 1 of smallest can that covers remaining
```

#### Output schema

```ts
type PaintResult = {
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
  substrateType?: string
  coatingSystem?: string[]       // ordered layer names for cross-section
  assumptions: string[]
}
```

#### 3D behavior

Render:
- Room shell (4 walls + optional ceiling)
- Door/window cutouts as dark rectangles
- Color-coded surfaces: paintable wall (user-selected color), excluded opening (gray), ceiling (lighter shade)
- Cross-section toggle showing coating layers with labeled thickness
- Real-time surface highlighting when user hovers result rows

Do NOT render: roller-stroke simulation, texture absorption, lighting-based finish realism, exterior facades

#### Sponsor fields

`SKU`, `coverageSqmPerLiter`, `recommendedCoats`, `primerCompatibility`, `canSizesAvailable` (array), `finishType` (flat/eggshell/semi-gloss/gloss), `substrateNotes`, `brandName`, `brandLogoUrl`, `colorPalette` (hex array)

#### Out of scope (V1)

Exterior facades, curved walls, decorative texture finishes, labor/scaffold estimation, VOC/fire compliance claims, multiple rooms in one scene

---

### Tool 3: Drywall / Partition Estimator

**Most technical of the trio** but manageable with strict one-wall-run scope.

#### Input schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `wallLengthMm` | number | Yes | One wall run only in V1 |
| `wallHeightMm` | number | Yes | |
| `openings` | opening[] | No | Each: width, height, type (door/window/pass-through) |
| `studSpacingMm` | number | Yes | Presets: 400 or 600 mm O.C. |
| `boardLengthMm` | number | Yes | Default 2440 (8') — sponsor preset |
| `boardWidthMm` | number | Yes | Default 1220 (4') — sponsor preset |
| `boardLayersPerSide` | number | Yes | 1 or 2 |
| `sidesBoarded` | enum | Yes | `one-side` or `two-side` |
| `boardOrientation` | enum | Yes | `vertical` or `horizontal` |
| `wastePercent` | number | Yes | Default 10% |
| `includeCornerStudAllowance` | boolean | Yes | Default true |
| `cornerStudExtraCount` | number | No | Default 2 (one per end) |
| `includeOpeningFramingAllowance` | boolean | Yes | Default true |
| `extraStudsPerOpening` | number | No | Default 2 (king + trimmer each side = 4, but 2 already counted in base spacing) |
| `trackStockLengthMm` | number | No | For procurement rounding, default 3000mm |

#### PH board size presets

| Board type | Dimensions (mm) | Area (sq.m.) | Common use |
|---|---|---|---|
| Hardiflex 4mm | 1220 × 2440 | 2.977 | Standard interior partition |
| Hardiflex 6mm | 1220 × 2440 | 2.977 | Wet areas, higher durability |
| Gypsum board 9.5mm | 1220 × 2440 | 2.977 | Commercial interior |
| Gypsum board 12.5mm | 1220 × 2440 | 2.977 | Fire-rated partitions (label only, no compliance claim) |

#### Formulas

**Gross wall face area** (one side):
```
A_gross = (wallLengthMm × wallHeightMm) / 1,000,000   [sq.m.]
```

**Opening deduction area:**
```
A_openings = Σ (openingWidthMm × openingHeightMm) / 1,000,000   [sq.m.]
```

**Net wall face area** (one side):
```
A_net = A_gross − A_openings   [sq.m.]
```

**Face multiplier:**
```
F = (sidesBoarded === 'two-side') ? 2 : 1
```

**Total boarded area:**
```
A_boarded = A_net × F × boardLayersPerSide   [sq.m.]
```

**Board area per sheet:**
```
A_sheet = (boardLengthMm × boardWidthMm) / 1,000,000   [sq.m.]
```

**Raw board count:**
```
N_board_raw = A_boarded / A_sheet
```

**Adjusted board count:**
```
N_board_adjusted = N_board_raw × (1 + wastePercent/100)
```

**Buy board count:**
```
N_board_buy = ⌈N_board_adjusted⌉   (round up)
```

**--- Stud logic ---**

**Base stud count** (studs along wall length at spacing):
```
N_stud_base = ⌈wallLengthMm / studSpacingMm⌉ + 1
```

**Corner allowance:**
```
N_stud_corner = includeCornerStudAllowance ? cornerStudExtraCount : 0
```

**Opening framing allowance:**
```
N_stud_opening = includeOpeningFramingAllowance ? (openings.length × extraStudsPerOpening) : 0
```

**Final stud count:**
```
N_stud_final = N_stud_base + N_stud_corner + N_stud_opening
```

**--- Track logic ---**

**Top track length:**
```
T_top = wallLengthMm   [mm]
```

**Bottom track length** (deduct door openings — doors have no bottom track):
```
T_bottom = wallLengthMm − Σ (door opening widths)   [mm]
```

**Total track length:**
```
T_total = T_top + T_bottom   [mm]
```

**Track pieces to buy** (if stock length provided):
```
N_track = ⌈T_total / trackStockLengthMm⌉
```

**Header track** (over each opening):
```
T_header = Σ (openingWidthMm + 2 × studDepthMm)   [mm]
// studDepthMm ≈ 70mm for standard 70mm metal stud
```

**--- Optional accessories (Phase 2 unless sponsor data available) ---**

```
Screws per board ≈ 28–32 (for standard 4'×8' sheet at 300mm screw spacing)
Total screws ≈ N_board_buy × 30

Joint compound ≈ 0.5 kg per linear meter of board joint
Joint tape ≈ 1 linear meter per linear meter of board joint
```

#### Output schema

```ts
type DrywallResult = {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  boardedFaceCount: number          // 1 or 2
  boardLayersPerSide: number
  totalBoardedAreaSqm: number
  boardAreaSqm: number              // per sheet
  rawBoardCount: number
  adjustedBoardCount: number
  roundedBoardCount: number         // N_board_buy
  studSpacingMm: number
  baseStudCount: number
  cornerAllowanceCount: number
  openingExtraStudCount: number
  finalStudCount: number
  topTrackLengthMm: number
  bottomTrackLengthMm: number
  totalTrackLengthMm: number
  headerTrackLengthMm: number
  trackStockLengthMm?: number
  trackPiecesToBuy?: number
  wastePercentApplied: number
  assumptions: string[]
}
```

#### 3D behavior

Render:
- Metal stud lines at chosen spacing
- Top and bottom tracks as horizontal bars
- Opening voids with trimmer/king stud framing
- Board panels overlaid on selected faces with panel edges marked
- Cut boards along edges highlighted
- Toggle: frame-only view ↔ boarded view

Do NOT render: screws, joint compound, corner beads, realistic section depth, stud flanges

#### Sponsor fields

`boardSizeMm` (L×W), `boardThicknessLabel`, `studSpacingDefaults`, `trackStockLengthMm`, `recommendedWastePercent`, `screwsPerBoard`, `brandName`, `brandLogoUrl`

#### Out of scope (V1)

Curved partitions, acoustic rating certification, fire-rating compliance claims, load-bearing walls, complex bulkheads/soffits, full hardware/screw/tape/compound procurement

---

## PHASE 2 — FORMULA SPECS

---

### Tool 4: CHB Wall Builder

#### Input schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `wallLengthMm` | number | Yes | |
| `wallHeightMm` | number | Yes | |
| `chbThickness` | enum | Yes | `4inch`, `6inch`, `8inch` |
| `mortarClass` | enum | Yes | `B` (1:3), `C` (1:4), `D` (1:5) |
| `mortarJointMm` | number | Yes | Default 10mm |
| `openings` | opening[] | No | Position (x, y from bottom-left), width, height |
| `plasterInclude` | boolean | Yes | |
| `plasterFaces` | enum | If plaster | `one-side` or `both-sides` |
| `plasterThicknessMm` | number | If plaster | Default 15mm |
| `fillStrategy` | enum | No | `full-fill`, `partial-fill`, `no-fill` |
| `wastePercentCHB` | number | Yes | Default 5% |
| `wastePercentMortar` | number | Yes | Default 10% |

#### CHB dimension reference

| Thickness | Actual (mm) | Face (mm) | Blocks/sq.m. | Weight (kg) |
|---|---|---|---|---|
| 4" | 100 | 200 × 400 | 12.5 | ~7.5 |
| 6" | 150 | 200 × 400 | 12.5 | ~11 |
| 8" | 200 | 200 × 400 | 12.5 | ~15 |

#### Formulas

**Net wall area:**
```
A_net = ((wallLengthMm × wallHeightMm) − Σ(opening areas)) / 1,000,000   [sq.m.]
```

**CHB count:**
```
N_chb = A_net × 12.5 × (1 + wastePercentCHB/100)
N_chb_buy = ⌈N_chb⌉
```

**Mortar for laying** (cement bags per sq.m. of wall, Class B 1:3 mix):
```
// Class B: 0.53 bags/sq.m., Class C: 0.42 bags/sq.m., Class D: 0.35 bags/sq.m.
mortar_cement_bags = A_net × cement_factor[mortarClass] × (1 + wastePercentMortar/100)

// Sand: proportional to mix ratio
mortar_sand_cu_m = mortar_cement_bags × 0.001388 × sand_ratio[mortarClass]
// where 1 bag cement ≈ 0.001388 cu.m. (40kg bag)
```

| Mortar class | Ratio | Cement factor (bags/sq.m.) | Sand ratio |
|---|---|---|---|
| B | 1:3 | 0.53 | 3 |
| C | 1:4 | 0.42 | 4 |
| D | 1:5 | 0.35 | 5 |

**Plastering** (if included):
```
A_plaster = A_net × plasterFaceMultiplier   // 1 or 2
plaster_volume = A_plaster × plasterThicknessMm / 1000   [cu.m.]

// Class A plaster (1:2 mix) typical for finish:
plaster_cement_bags = plaster_volume × cement_per_cu_m_classA × (1 + wastePercentMortar/100)
// cement_per_cu_m_classA ≈ 12.5 bags/cu.m. (1:2 mix)

plaster_sand_cu_m = plaster_volume × 2 × cement_volume_per_bag
```

Simplified per-sq.m. factor (both-face, 15mm thick):
```
plaster_cement_bags ≈ A_net × 0.64 × plasterFaceMultiplier × (1 + wastePercentMortar/100)
plaster_sand_cu_m ≈ A_net × 0.016 × plasterFaceMultiplier
```

**Rebar:**
```
// Vertical: 10mm bar every other cell (every 400mm along wall)
N_vertical_bars = ⌈wallLengthMm / 400⌉ / 2

// Each vertical bar: wallHeightMm + 300mm (top/bottom embedment)
vertical_rebar_length = N_vertical_bars × (wallHeightMm + 300) / 1000   [meters]

// Horizontal: 10mm bar every 3 courses (every 600mm)
N_horizontal_bars = ⌈wallHeightMm / 600⌉

// Each horizontal bar: wallLengthMm + 300mm lap
horizontal_rebar_length = N_horizontal_bars × (wallLengthMm + 300) / 1000   [meters]

// Total 10mm rebar:
total_rebar_meters = vertical_rebar_length + horizontal_rebar_length
total_rebar_pieces = ⌈total_rebar_meters / 6⌉   // standard 6m bars

// Tie wire:
tie_wire_kg = (N_vertical_bars × N_horizontal_bars) × 0.05   // 0.05 kg per tie
```

#### Output schema

```ts
type CHBResult = {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  chbCount: number
  chbCountBuy: number
  mortarClass: string
  mortarCementBags: number
  mortarSandCuM: number
  plasterAreaSqm?: number
  plasterCementBags?: number
  plasterSandCuM?: number
  rebarVerticalPcs: number
  rebarHorizontalPcs: number
  rebarTotalMeters: number
  rebarTotalPieces: number       // 6m standard bars
  tieWireKg: number
  wastePercentCHB: number
  wastePercentMortar: number
  assumptions: string[]
}
```

---

### Tool 5: Plastering & Skim Coat Calculator

#### Formulas

**Plaster layers:**
```
For each layer (scratch coat, brown coat, skim coat):
  layer_volume = area × thickness / 1000   [cu.m.]
  layer_cement = layer_volume × bags_per_cu_m[mix_ratio]
  layer_sand = layer_volume × sand_multiplier[mix_ratio]
```

**Skim coat** (product-based):
```
skim_coat_bags = area / coverage_per_bag   // typically 10–12 sq.m. per 20kg bag at 1mm
```

This tool can import wall area from the CHB calculator (A_net) or accept direct area input.

---

## PHASE 3 — FORMULA SPECS

---

### Tool 6: Flat Ceiling Grid Calculator

#### Formulas

```
Board count:
  N_boards = ⌈(roomLengthMm × roomWidthMm / 1,000,000) / A_sheet⌉ × (1 + waste%)

Double furring (both directions):
  furring_count_x = ⌈roomLengthMm / furringSpacingMm⌉ + 1
  furring_count_y = ⌈roomWidthMm / furringSpacingMm⌉ + 1
  total_furring_length = (furring_count_x × roomWidthMm + furring_count_y × roomLengthMm) / 1000   [meters]

Carrying channels:
  carrying_count = ⌈roomWidthMm / 1200⌉ + 1
  carrying_length = carrying_count × roomLengthMm / 1000   [meters]

Wall angle:
  wall_angle_length = 2 × (roomLengthMm + roomWidthMm) / 1000   [meters]

W-clips:
  w_clips = furring_count × carrying_count   // intersection count

Hanger wire:
  hanger_count = carrying_count × ⌈roomLengthMm / 1200⌉
  hanger_wire_total = hanger_count × (ceilingHeightMm + 300) / 1000   [meters]

Rivets ≈ 1.5 per sq.m.
Concrete nails ≈ perimeter / 300mm spacing
```

---

### Tool 7: Roof Sheet Estimator

#### Formulas

```
Slope factor = √(1 + (rise/run)²)
  3:12 → 1.031
  4:12 → 1.054
  5:12 → 1.083
  6:12 → 1.118

Sloped area per face:
  A_slope = (rafter_length × roof_width) / 1,000,000 × slope_factor

Effective sheet width:
  corrugated: 762mm effective (914mm gross − 152mm side lap)
  rib-type: 1,000mm effective (1,092mm gross − 92mm side lap)

Sheets per slope face:
  sheets_across = ⌈roof_width / effective_width⌉
  sheets_along = ⌈rafter_length / (sheet_length − end_lap)⌉   // end_lap = 150mm
  total_per_face = sheets_across × sheets_along

Ridge roll:
  ridge_length = building_length + 150mm overlap per 2.4m piece
  ridge_pieces = ⌈ridge_length / 2400⌉

Purlins:
  purlin_count = ⌈rafter_length / purlinSpacingMm⌉ + 1   // per slope
  total_purlin_length = purlin_count × number_of_slopes × building_length / 1000   [meters]
```

---

## PHASE 4 — FORMULA SPECS

---

### Tool 8: PWD Accessibility Ramp Calculator

#### Formulas (BP 344)

```
Ramp length = rise × 12   // 1:12 max slope
Landings required = ⌈ramp_length / 6000⌉ − 1   // landing every 6m of run
Total horizontal length = ramp_length + (landings × 1500mm landing depth)
Handrail length = 2 × (total_horizontal_length + 300mm extensions top/bottom)
```

Code limits:
- Minimum width: 1,200mm
- Maximum slope: 1:12 (8.33%)
- Landing: 1,500mm × full width every 6m of run
- Handrails: dual height at 700mm and 900mm, both sides
- Edge protection: 50mm minimum curb

---

### Tool 9: Window-to-Floor Area Compliance Checker

#### Formulas (PD 1096 Rule VIII)

```
Floor area = roomLengthMm × roomWidthMm / 1,000,000   [sq.m.]
Required openable area = floor_area × 0.10   // 10% minimum

For each window:
  openable_area = window_area × openable_fraction[window_type]

Total openable area = Σ openable_areas

Compliance = total_openable_area ≥ required_openable_area
Ratio = total_openable_area / floor_area × 100   [%]
```

Window openable fractions:
| Type | Openable % |
|---|---|
| Casement | 90% |
| Sliding (2-panel) | 50% |
| Awning | 80% |
| Jalousie | 95% |
| Fixed | 0% |

---

## PHASE 5 — FORMULA SPECS

---

### Tool 10: Perimeter Fence/Wall Estimator

Reuses CHB Wall Builder formulas but adds:
```
Column count = ⌈perimeter / columnSpacingMm⌉
Column concrete volume = column_count × column_width × column_depth × wall_height / 1,000,000,000   [cu.m.]
Footing volume = column_count × footing_L × footing_W × footing_D / 1,000,000,000   [cu.m.]
Gate opening deduction from CHB wall area
```

PH lot presets: 80 sq.m. (townhouse), 120 sq.m. (economic), 150 sq.m. (mid-range), 200 sq.m. (subdivision), 300+ sq.m. (R-1)

---

### Tool 11: Concrete Volume & Mix Calculator

#### Formulas

```
Element volume:
  Slab: L × W × thickness / 1,000,000,000   [cu.m.]
  Column: width × depth × height / 1,000,000,000   [cu.m.]
  Beam: width × depth × length / 1,000,000,000   [cu.m.]
  Footing: L × W × D / 1,000,000,000   [cu.m.]

Mix proportions (per cu.m. of concrete):
  Class A (1:2:4): 9.0 bags cement, 0.50 cu.m. sand, 1.00 cu.m. gravel
  Class B (1:2.5:5): 7.5 bags cement, 0.50 cu.m. sand, 1.00 cu.m. gravel
  Class C (1:3:6): 6.0 bags cement, 0.50 cu.m. sand, 1.00 cu.m. gravel

Total materials:
  cement_bags = volume × bags_per_cu_m[class] × (1 + waste%)
  sand_cu_m = volume × sand_per_cu_m[class] × (1 + waste%)
  gravel_cu_m = volume × gravel_per_cu_m[class] × (1 + waste%)
```

*40kg bags standard. Waste default 5–10%.*

---

## Sponsor Revenue Model

### Pricing tiers

| Tier | Scope | Price range (monthly) | What sponsor gets |
|---|---|---|---|
| Solo tool | 1 calculator | ₱15,000–₱30,000 | Logo, product data integration, "Powered by [Brand]", lead sharing |
| Category | 1 phase (2–3 tools) | ₱40,000–₱80,000 | All solo benefits + featured placement across phase, co-marketing |
| Suite | All 11 tools | ₱100,000–₱200,000 | Exclusive, all benefits + white-label option + quarterly reports |

### Sponsor fit map

| Tool | Sponsor category | Top PH targets |
|---|---|---|
| Tile/Flooring | Tile manufacturer | Mariwasa, Floor Center, Niro Granite |
| Paint | Paint brand | Boysen, Davies, Island Paints |
| Drywall | Board/framing | Hardiflex/James Hardie, Knauf, USG |
| CHB Wall | Cement/CHB | Holcim, Republic Cement, Eagle Cement |
| Plastering | Skim coat/mortar | Davies Mondo, Boysen Masonry |
| Ceiling | Ceiling system | Hardiflex, Armstrong, USG |
| Roofing | Roofing steel | Union Galvasteel, Puyat Steel, DN Steel |
| Ramp | Accessibility | Tactile paver suppliers |
| Window checker | Window brand | Tostem, YKK AP, EuroDesign |
| Fence | CHB/cement (shared) | Same as CHB |
| Concrete | Cement/ready-mix | Holcim, Republic, Island Ready Mix |

### Revenue funnel

```
Free tool traffic → use calculator → see ALE exam connection →
→ "These calculations are tested in the ALE" CTA →
→ SlateCamp Pro signup funnel

Free tool traffic → save/export estimate → provide email →
→ nurture sequence → SlateCamp subscription + sponsor product offers
```

### Premium feature gates

| Feature | Free | Premium |
|---|---|---|
| Rectangular rooms | ✓ | ✓ |
| L-shape / polygon rooms | — | ✓ |
| Multiple openings (>2) | — | ✓ |
| Export to PDF BOQ | — | ✓ |
| Save projects | — | ✓ |
| Sponsor product presets | ✓ | ✓ |
| Custom product data | — | ✓ |

---

## Accuracy Guardrails (Non-Negotiable)

1. Every output shows calculation trail: gross → deductions → net → waste → rounding
2. Every sponsor default is editable
3. Results labeled "preliminary estimation"
4. No hidden auto-assumptions — if tool assumes 10mm mortar joints or 10% waste, user sees and can change it
5. No curves or slopes in V1 (rectangular geometry only per tool)
6. No structural/code claims — tools estimate quantities, not compliance
7. Phase 4 code tools show code limits, not certify compliance

---

## Implementation Architecture (Next Step)

When ready, the next deliverable is:
- Shared `CalculationEngine` module with normalized types
- Zustand store structure for calculator state
- R3F scene shell (shared Canvas wrapper, camera, lighting)
- Input panel component library
- Output panel with assumption accordion
- Sponsor slot component

---

*This document is the single source of truth for the 3D Calculator Suite. All feature decisions, scope questions, and prioritization debates reference this document.*
