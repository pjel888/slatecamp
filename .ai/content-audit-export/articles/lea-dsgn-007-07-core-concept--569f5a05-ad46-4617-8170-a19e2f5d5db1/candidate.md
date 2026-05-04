## What You Need to Know for the LEA

## Learning Goal
Develop space programs from client requirements, calculate net-to-gross area ratios, organize adjacencies and circulation patterns, and apply anthropometric clearances to room layouts.

Development control calculations determine how much gross floor area (GFA) you can build on a given lot. These calculations bind your design decisions from the earliest stages and are routinely tested in the Licensure Examination for Architects (LEA) through worked problems.

## Core Concept

Development control calculations translate three primary inputs—total lot area (TLA), permitted site occupancy (PSO), and height limits (BHL)—into a buildable gross floor area. The calculation requires understanding four key metrics:

1.  **Allowable Maximum Building Footprint (AMBF)**: The maximum portion of the lot that may be occupied by the building at grade level.
    - Formula: \( AMBF = TLA \times PSO\% \)
    - _Note: PSO varies by local zoning ordinance. Typical values used in review settings: R-1 ≈ 50%, R-2 ≈ 65%, R-3 ≈ 70–75%, C-3 ≈ 80%._

2.  **Total Gross Floor Area (TGFA)**: The total enclosed floor area of the building across all floors.
    - Formula: \( TGFA = AMBF \times \text{number of floors} \)
    - Floors are initially estimated from the Building Height Limit (BHL) and assumed floor-to-floor height.

3.  **Floor Area Ratio (FLAR)**: A binding constraint that limits the total GFA relative to the lot size.
    - Formula: \( FLAR = TGFA \div TLA \)
    - _Note: Your design must satisfy both BHL and FLAR limits; the more restrictive one governs._

4.  **Open Space Calculations (Rule VIII)**:
    - **ISA (Impervious Surface Area)**: Paved open spaces (driveways, courts).
    - **USA (Unpaved Surface Area)**: Unpaved, landscaped, or grassy areas.
    - **TOSL (Total Open Space within Lot)**: The sum of ISA and USA, also expressed as \( TOSL = TLA - AMBF \).
<ArticleMedia id="media-lea-dsgn-007-07-core-concept" a type="image" caption="Space Programming Workflow — From Client Requirements to Net-to-Gross Ratios" description="Diagram showing the space programming process: program requirements → space adjacency matrix → bubble diagram → net area calculation → net-to-gross ratio → gross floor area. Annotated with typical N/G ratios for different building types." suggestedAsset="Diagram or reference image" status="placeholder" />

---

### Worked Example: R-2 Residential Building

**Given:**

- Total Lot Area (TLA) = 600 sqm  
- Zone = R-2 (Medium-Density Residential)  
- **Zoning Parameters (for this problem):** PSO = 65%, BHL = 15.0 m, FLAR limit = 2.5  
- **Assumptions:** Floor-to-floor height = 3.0 m; ISA = 10% of TLA.

**Step 1: Calculate potential floors from BHL**

- \( \text{Floors} = BHL \div 3.0 \text{ m} = 15.0 \div 3.0 = 5 \text{ floors} \)

**Step 2: Calculate AMBF**

- \( AMBF = 600 \text{ sqm} \times 0.65 = 390 \text{ sqm} \)

**Step 3: Calculate TGFA based on BHL height**

- \( TGFA = 390 \text{ sqm} \times 5 \text{ floors} = 1{,}950 \text{ sqm} \)

**Step 4: Check against FLAR constraint**

- \( FLAR = 1{,}950 \div 600 = 3.25 \)  
- Maximum FLAR allowed = 2.5  
- **RESULT:** \( 3.25 > 2.5 \) → **EXCEEDS LIMIT**. The BHL-based height is not permissible under this FLAR.

**Step 5: Recalculate floors from FLAR constraint**

- Maximum allowable \( TGFA = TLA \times \text{max FLAR} = 600 \times 2.5 = 1{,}500 \text{ sqm} \)
- \( \text{New Floor Count} = 1{,}500 \div 390 = 3.84 \)  
- **Final Count:** Round down to **3 floors**.  
- Final \( TGFA = 390 \times 3 = 1{,}170 \text{ sqm} \)  
- Final \( FLAR = 1{,}170 \div 600 = 1.95 \) (within limit ✓)

**Step 6: Calculate Open Space (Rule VIII)**

- \( ISA = 600 \times 10\% = 60 \text{ sqm} \)  
- \( TOSL = TLA - AMBF = 600 - 390 = 210 \text{ sqm} \)  
- \( USA = TOSL - ISA = 210 - 60 = 150 \text{ sqm} \)

**Key Finding**: Although the BHL allowed for 5 floors, the FLAR restricted the building to 3 floors. In dense urban zoning, FLAR is often the primary bottleneck.

---

## Key Provisions Reference Table

| Metric           | Formula                               | Notes                                                     |
| :--------------- | :------------------------------------ | :-------------------------------------------------------- |
| **AMBF**         | \( TLA \times PSO\% \)                | Limit of building footprint at grade                      |
| **TGFA**         | \( AMBF \times \text{floors} \)       | Sum of all floor areas                                    |
| **FLAR**         | \( TGFA \div TLA \)                   | Density limit set by zoning ordinance                     |
| **ISA**          | \( TLA \times ISA\% \)                | Paved/impervious open space                               |
| **USA**          | \( TOSL - ISA \)                      | Landscaped/unpaved open space                             |
| **Floor Height** | 3.0 m                                 | Typical exam assumption (unless otherwise specified)      |
| **BHL Floors**   | \( BHL \div \text{Floor Height} \)    | Always round down to the nearest whole floor              |

### Typical Zoning Values (LGU-dependent)

- **R-1**: PSO ≈ 50% \| FLAR ≈ 1.0–1.5  
- **R-2**: PSO ≈ 65% \| FLAR ≈ 1.5–2.5  
- **R-3**: PSO ≈ 70–75% \| FLAR ≈ 2.0–3.0  
- **C-3**: PSO ≈ 80% \| FLAR can reach high values (e.g., 9.0 and above in dense CBDs)

Exact PSO and FLAR values are always taken from the specific LGU zoning ordinance or comprehensive land use plan (CLUP) cited in the problem.

## Philippine Practice Context

In the Philippines, development controls are a hybrid of the **National Building Code (PD 1096)** and **local zoning ordinances**. PD 1096 and its IRR provide general safety, light, and ventilation standards (notably Rule VII and Rule VIII), while the intensity-of-use controls (PSO, FLAR, BHL) come from the LGU’s zoning regulations or CLUP. For practice and in the LEA, candidates must read the problem carefully to use the given zoning parameters, even when they differ from “typical” values they have memorized.

Most design failures in the LEA occur because candidates focus on height (BHL) and forget that the Floor Area Ratio (FLAR) often forces a reduction in the number of floors. Another frequent error is confusing AMBF- and TLA-based calculations, which leads to incorrect TGFA and FLAR values.
<ArticleMedia id="media-lea-dsgn-007-07-core-concept" a type="image" caption="Space Programming Matrix — Adjacency, Area, and Net-to-Gross Ratios" description="Space planning bubble diagram with adjacency matrix overlay for a typical building program. Shows: functional bubbles with area labels, desired adjacency weights (essential, desirable, neutral, negative), and net-to-gross ratio calculation (65-75% net for typical office)." suggestedAsset="Diagram or reference image" status="placeholder" />

## Cross-References

See **LEA-DSGN-007-08** (Human Factors) for anthropometric space standards, **LEA-DSGN-011-01** (Floor Plans) for program documentation, and **LEA-DSGN-007-04** (Design Process) for programming methodology.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0001 component="WikiMistakeList" status="preserved"]