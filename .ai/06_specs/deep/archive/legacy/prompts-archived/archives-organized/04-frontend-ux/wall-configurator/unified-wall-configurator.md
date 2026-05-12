# Unified Wall Configurator Logic

This document consolidates CHB, drywall, and paint estimation into one professional wall-configurator workflow using Philippine code context, standard finishing sequences, and engineering-style quantity logic. The National Building Code of the Philippines establishes that buildings must conform to minimum standards for construction quality and materials, and it explicitly recognizes plastering and gypsum wall board installation as regulated construction activities within the code framework. [web:1][page:1]

## 1. Technical Research: Wall Finishing Sequences

### CHB wall
A CHB wall is typically treated as a **masonry core** that may receive plastering, skim/putty correction, primer, and paint depending on the target finish level. The referenced project technical specifications for Philippine works state CHB wall masonry uses mortar by volume at 1 cement : 3 sand for laying, while plastering uses 1 cement : 2 sand, with minimum plaster thickness of 1/2 inch and cement-finish workmanship. [page:4]

A professional CHB finishing sequence for an interior or exterior painted wall is commonly:
1. CHB core wall.
2. Cement-sand plaster (“palitada”), per side as specified.
3. Surface correction, skim or putty only if finish tolerance requires it.
4. Primer/sealer.
5. Topcoat paint system.

For configurator purposes, the CHB option should therefore expose additive layers rather than assume paint-only, because plastering is often the substrate-building layer that makes the wall paint-ready. The same technical specifications also require openings to receive lintel treatment and plaster to be cured, which supports handling the wall as a net-finishable area after deduction of door and window voids. [page:4]

### Drywall wall
Drywall is treated as a **board-and-joint system** rather than a wet plaster substrate. The National Building Code recognizes gypsum wall board as part of fire-resistive wall construction assemblies, while Boysen’s drywall guidance states that drywall finishing typically requires mesh tape and gypsum joint compound for overjoints and terminations before primer and water-based topcoat. [web:4][page:2][page:3]

A professional drywall finishing sequence is commonly:
1. Metal or wood stud frame with gypsum boards.
2. Joint tape at seams and corners.
3. Joint compound over seams, screw heads, and repairs.
4. Sanding and surface equalization.
5. Primer.
6. Water-based topcoat paint.

Because drywall already provides a smooth panel surface, the estimator should compute board quantities from gross board coverage, then compute finishing materials from the treated face area plus seam-related consumables. Boysen’s gypsum joint compound is packaged in 4 L and 16 L cans and has a theoretical coverage of 12 linear meters per liter, which is useful for seam-based estimation logic inside the configurator. [page:2]

### Painted surface only
A painted surface is not a structural wall type by itself; it is a **finish pathway** applied over an existing substrate such as CHB plaster, concrete, skim-coated wall, or finished drywall. Boysen’s drywall guide recommends primer followed by any water-based topcoat for interior drywall, and the SLSU technical specification describes concrete and masonry walls as receiving latex paint over skim-coat finish. [page:3][page:4]

For a unified estimator, “Paint” should therefore behave as a finish package attached to a selected substrate rather than an isolated calculator. The layer logic should support at minimum: substrate check, patching or skim decision, primer, and topcoat, with user control for painting one side or both sides. [page:3][page:4]

## 2. Configurator Logic & Workflow

### Core selection flow
The cleanest unified UI logic is:
1. **Select Core**: CHB, Drywall, Existing Finished Wall.
2. **Enter Geometry**: length, height, quantity of similar walls.
3. **Enter Openings**: doors, windows, louvers, service openings.
4. **Choose Sides**: one side or both sides.
5. **Select Treatment**: plastering, waterproofing, skim/putty, jointing, none.
6. **Select Finish**: primer, paint coats, specialty coating.
7. **View Bill of Materials**: material quantities, packaged quantities, wastage, and assumptions.

This sequence is better than separate calculators because the same net-area engine can drive all surface-dependent layers while core-specific modules handle CHB blocks, drywall boards, plaster, and seam compounds. It also satisfies the requirement that openings are deducted before finish quantities are calculated. [page:4]

### Net and gross logic
The computation engine should maintain two distinct area states:
- **Gross wall area** = wall length × wall height × number of wall instances.
- **Opening area** = sum of each opening width × height × quantity.
- **Net wall area** = gross wall area − opening area.

For side-dependent treatments, define:
- **Net finish area, one side** = net wall area.
- **Net finish area, both sides** = 2 × net wall area.

This distinction is critical because a 10 sqm wall core remains 10 sqm of plan wall area, but plastering and painting may apply to one face only or to both faces. Openings must be deducted before board, plaster, skim, primer, and paint calculations whenever the finish does not exist across the void. [page:4]

### Additive layer model
A robust full-stack implementation should model each layer as a reusable component with its own unit basis:
- **Area-based layers**: plaster, waterproofing, skim coat, primer, paint.
- **Panel-based layers**: gypsum board, cement board.
- **Linear-based layers**: tape, corner bead, joint compound by seam length.
- **Piece-based layers**: CHB units, screws, anchors.

A practical data schema is:
```ts
WallConfig {
  coreType: 'chb' | 'drywall' | 'existing-wall';
  grossAreaSqm: number;
  openingAreaSqm: number;
  netAreaSqm: number;
  sides: 1 | 2;
  layers: Layer[];
}

Layer {
  code: string;
  basis: 'area' | 'linear' | 'piece' | 'panel';
  applyToSides: boolean;
  wasteFactor: number;
  packaging?: { unit: string; size: number };
}
```
This structure keeps the workflow modular and allows plastering, waterproofing, priming, and painting to be stacked without duplicating formulas across calculators. The use of commercial package sizes such as 4'×8' boards and 16 L paint pails should occur at the final packaging conversion layer, not inside the geometry engine. [page:2]

## 3. Computation Engine

### Base geometry formulas
Let:
- \(L\) = wall length in meters.
- \(H\) = wall height in meters.
- \(n\) = number of identical walls.
- \(A_o\) = total opening area in square meters.
- \(s\) = number of treated sides, either 1 or 2.

Then:
\[
A_g = L \times H \times n
\]
\[
A_n = A_g - A_o
\]
\[
A_f = A_n \times s
\]
Where \(A_g\) is gross wall area, \(A_n\) is net wall area after opening deductions, and \(A_f\) is finish area for layers applied by side.

### CHB unit formula
Using the common Philippine CHB face size of 0.40 m × 0.20 m, one block covers about 0.08 sqm of wall face, equivalent to about 12.5 blocks/sqm before waste. That commercial size is reflected in local estimation references for CHB dimensions. [web:6]

Formula:
\[
\text{CHB pcs} = \frac{A_n}{0.40 \times 0.20} \times (1 + w_{chb})
\]
If using a 5% wastage factor, then \(w_{chb} = 0.05\).

### Drywall board formula
A standard 4'×8' gypsum board has area:
\[
1.2192 \times 2.4384 = 2.973 \text{ sqm per board}
\]
Therefore:
\[
\text{Boards} = \frac{A_n \times s}{2.973} \times (1 + w_{board})
\]
For cutting loss on partitions, a practical professional allowance is 5% to 10% depending on layout complexity; 5% is reasonable for a simple reference wall.

### Palitada formula
From the cited technical specification, plastering mortar is 1 cement : 2 sand by volume and minimum thickness is 1/2 inch, or 12.7 mm. [page:4]

Let:
- \(t_p\) = plaster thickness in meters.
- \(A_f\) = plastered area based on one side or both sides.
- \(V_w\) = wet plaster volume.
- \(k\) = dry-volume factor to account for bulking, voids, and handling.

Use:
\[
V_w = A_f \times t_p
\]
A standard engineering allowance is to convert wet mortar to dry ingredients using approximately 1.33 multiplier. Under a 1:2 cement-sand mix, cement is 1/3 of dry volume and sand is 2/3 of dry volume.

So:
\[
V_d = V_w \times 1.33
\]
\[
V_c = \frac{1}{3}V_d
\]
\[
V_s = \frac{2}{3}V_d
\]
Where:
- \(V_c\) = loose cement volume in cubic meters.
- \(V_s\) = sand volume in cubic meters.

Converting cement volume to 40 kg bags, use cement bulk density around 1,440 kg/m³ and 40 kg/bag:
\[
\text{Cement bags} = \frac{V_c \times 1440}{40}
\]
If desired, apply plaster wastage factor after material conversion:
\[
\text{Adjusted quantity} = \text{Base quantity} \times (1 + w_p)
\]
A practical plaster wastage factor is 5% for straightforward walls.

### Paint formula
For paint estimation, use finish area after opening deduction and after side selection. Because exact spread rate varies by substrate roughness and product line, a professional estimator should keep coverage editable, but a standard engineering default for acrylic wall paint is about 25 to 30 sqm per 4 L per coat, equivalent to about 6.25 to 7.5 sqm/L/coat. This document adopts **7 sqm/L/coat** as a configurable engineering constant for reference computation. That is consistent with the user instruction permitting established engineering constants when exact manufacturer rates are not embedded in the prompt.

Let:
- \(C\) = coverage in sqm/L/coat.
- \(N\) = number of coats.
- \(A_f\) = paintable area.

Formula:
\[
\text{Paint liters} = \frac{A_f \times N}{C}
\]
With wastage factor \(w_{pt}\):
\[
\text{Adjusted paint liters} = \frac{A_f \times N}{C} \times (1 + w_{pt})
\]
For packaging conversion:
\[
\text{16 L pails} = \left\lceil \frac{\text{Adjusted paint liters}}{16} \right\rceil
\]
The same logic can be used for primer, using its own coverage constant and package size.

### Joint compound formula for drywall
Boysen lists gypsum joint compound theoretical coverage at 12 linear meters per liter and package sizes of 4 L and 16 L. [page:2]

If total seam length is \(M\) linear meters, then:
\[
\text{Joint compound liters} = \frac{M}{12}
\]
For a quick wall estimator when seam mapping is not manually entered, the software may derive seam length from board layout; otherwise, it should accept seam length as a user-editable field.

## 4. Sample Estimate (10 sqm Reference)

### Assumptions
The sample below uses a **10 sqm net wall area** with **no openings** so the reference stays transparent. Where finish materials are side-dependent, quantities are shown for **one side** unless noted; a second column indicates the **both sides** multiplier to avoid ambiguity.

Engineering constants used for the sample:
- CHB size: 0.40 m × 0.20 m face. [web:6]
- Drywall board: 4'×8' = 2.973 sqm/board.
- Plaster thickness: 12.7 mm minimum. [page:4]
- Plaster mix: 1:2 cement:sand by volume. [page:4]
- Dry-volume factor for mortar: 1.33.
- Cement bag: 40 kg. [page:4]
- Paint coverage default: 7 sqm/L/coat, 1 primer coat + 2 topcoats.
- Wastage: CHB 5%, drywall boards 5%, plaster 5%, paint 10%.

### 10 sqm bill of materials
| Wall type | Material breakdown for 10 sqm reference |
|---|---|
| **CHB core wall** | CHB units = \(10 / 0.08 = 125\) pcs base; with 5% waste = **132 pcs**. [web:6] |
| **CHB + palitada, one side** | Wet plaster volume = \(10 \times 0.0127 = 0.127\) m³; dry volume = **0.169 m³**; cement = **0.056 m³ = 2.02 bags**, round to **3 bags** practical purchase; sand = **0.113 m³**, round to **0.12 m³** then allow procurement to **0.15 m³**. [page:4] |
| **CHB + palitada, both sides** | Plaster area = 20 sqm; wet plaster volume = **0.254 m³**; dry volume = **0.338 m³**; cement = **4.04 bags**, round to **5 bags**; sand = **0.225 m³**, practical order about **0.24 to 0.25 m³**. [page:4] |
| **CHB + paint, one side** | Primer 1 coat = \(10/7 = 1.43\) L base, with 10% waste = **1.57 L**; topcoat 2 coats = \((10\times2)/7 = 2.86\) L base, with 10% waste = **3.14 L**; total liquid coating = **4.71 L**. Convert to packages as project standard, e.g. one 4 L plus touch-up allowance, or one 16 L pail if consolidating multiple rooms. |
| **CHB + paint, both sides** | Primer = **3.14 L**; topcoat = **6.29 L**; total = **9.43 L**. A single 16 L pail covers the package requirement for the combined primer or topcoat only if product type is the same; in practice primer and topcoat are separate SKUs, so packaging must be converted per layer. |
| **Drywall core, one side boarded** | Board requirement = \(10 / 2.973 = 3.36\) boards base; with 5% waste = **3.53 boards**, round to **4 boards**. |
| **Drywall core, both sides boarded** | Board requirement = \(20 / 2.973 = 6.73\) boards base; with 5% waste = **7.07 boards**, round to **8 boards**. |
| **Drywall joint treatment, one side reference** | If board layout uses 4 boards on one face for about 10 sqm, seam length depends on orientation; as a quick reference, assume roughly **10 to 12 lm** of joints, needing about **0.83 to 1.00 L** of compound at 12 lm/L. One 4 L can is the smallest standard package and is therefore the procurement minimum. [page:2] |
| **Drywall + paint, one side** | Same paint formula as above on 10 sqm finished face: primer **1.57 L**, topcoat **3.14 L**, total **4.71 L**. Boysen recommends primer plus water-based topcoat over finished drywall. [page:2][page:3] |
| **Paint-only existing wall, one side** | For 10 sqm already prepared wall: primer **1.57 L**, topcoat **3.14 L**, total **4.71 L**. If substrate is already primed and only repainting is specified, remove primer layer from the stack. |

## Implementation notes
The estimator should never compute finish quantities directly from gross dimensions once openings are entered; all finish layers must reference net area. Board, plaster, waterproofing, skim coat, primer, and paint should each expose a side selector so that one-face versus two-face treatment is explicit in the UI and reflected in formulas.

For professional output, the UI should present three result tiers:
1. **Theoretical quantity** from formulas.
2. **Adjusted quantity** after waste allowance.
3. **Procurement quantity** rounded to commercial sizes such as 4'×8' boards, 4 L cans, and 16 L pails. [page:2]
