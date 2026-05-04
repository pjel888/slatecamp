## What You Need to Know for the LEA
Fire egress calculations determine exit count, width, and travel distance—all based on occupancy. 
## Learning Goal

Calculate occupant load using RA 9514 load factors per use type, determine required exit count and aggregate width (OL × 7.6 mm/person), verify travel distance limits (45m/60m) and dead-end corridor lengths (6m/12m), and ensure each exit meets the 900mm minimum clear width.

## Core Concept
Fire egress is determined by three sequential calculations:

1. **Occupant Load (OL)** from floor area
   - Formula: OL = Floor area ÷ Occupant load factor
   - Load factors by use (RA 9514 2019 IRR Table 10.1.1.1):
     - Assembly (standing): 0.65 sqm/person
     - Assembly (seated, movable): 1.1 sqm/person
     - Assembly (seated, fixed): count seats
     - Classroom: 2.0 sqm/person
     -- Office/Business: 9.3 sqm/person     - Retail (ground): 2.8 sqm/person
     - Retail (upper): 5.6 sqm/person
     - Restaurant/Dining: 1.4 sqm/person
     - Residential: 9.3 sqm/person
     - Industrial: 9.3 sqm/person
     - Storage: 46.5 sqm/person

2. **Number of Exits** required by occupancy
   - OL < 50: **1 exit** (max 49 per exit)
   - OL 50–499: **2 exits**
   - OL 500–999: **3 exits**
   - OL 1,000+: **4 exits**

3. **Exit Width** (door or stair)
   - Formula: **Exit width (mm) = OL × 7.6 mm/person** (NOT 5mm—ERR-DSGN-019)
   - Minimum per exit: **915mm clear width** (general means of egress minimum per RA 9514 Section 10.2.5.2 para (F))
   - Distribute exit width across all required exits; each must be ≥ 900mm

4. **Travel Distance** to exit
   - **Unsprinklered**: Max 45m from any point to exit
   - **Sprinklered**: Max 60m from any point to exit
   - (NOT 30m—ERR-DSGN-020)

5. **Dead-End Corridor** length
   - **Unsprinklered**: Max 6m dead-end (from corridor to exit) (NOT 10m—ERR-DSGN-024)
   - **Sprinklered**: Max 12m dead-end
   - A dead-end is a corridor segment where you can only exit in one direction

6. **Corridor Width**
   - Minimum: **1,100mm** (same as stair minimum)

### Worked Example: Restaurant Fire Egress Calculation

**Given:**
- Total floor area: 450 sqm
- Layout: Dining area (150 sqm), kitchen (300 sqm)
- Building is sprinklered

**Step 1: Calculate occupant loads by space type**
```
Dining area: 150 sqm ÷ 1.4 sqm/person = 107 persons
Kitchen: 300 sqm ÷ 9.3 sqm/person = 32 persons
Total Occupant Load (OL) = 107 + 32 = 139 persons
```

**Step 2: Determine number of exits**
```
OL = 139 persons (falls in 50–499 range)
Required exits = 2
```

**Step 3: Calculate total exit width**
```
Required width = 139 × 7.6 mm/person = 1,056 mm total
Distribute across 2 exits: 1,056 ÷ 2 = 528 mm each

BUT minimum per exit = 900 mm (single leaf)
Solution: Use two exits of 900mm each (total = 1,800mm ≥ 1,056mm ✓)
OR: Use two exits of 528mm each (violates 900mm minimum—NOT ALLOWED)
Conclusion: Each exit must be ≥ 900mm, so 2 × 900mm is the minimum compliant configuration
```

**Step 4: Verify travel distance (sprinklered)**
```
Max travel distance = 60m (sprinklered)
If kitchen is 300 sqm = approx 15m × 20m
Farthest point from exit ≈ 10m (less than 60m ✓)
```

**Step 5: Check dead-end corridors (sprinklered)**
```
Max dead-end = 12m (sprinklered)
If service corridor leads from kitchen to dining, max length 12m ✓
```

**Final Egress Design:**
- 2 exits, each 900mm wide (1 serves dining, 1 serves kitchen + shared)
- Total exit width: 1,800mm (exceeds required 1,056mm)
- Travel distance: ≤10m to exits (well within 60m)
- Dead-end: ≤12m acceptable
- Corridor width: 1,100mm minimum
<ArticleMedia id="media-lea-dsgn-008-01-core-concept" type="image" caption="Fire Egress Calculation — Occupant Load, Exit Width, and Travel Distance" description="Multi-panel diagram showing: (1) occupant load calculation table per RA 9514 load factors, (2) exit width computation (OL × 7.6 mm/person), (3) travel distance limits (45m unsprinklered, 60m sprinklered), (4) dead-end corridor limits (6m/12m)." suggestedAsset="Diagram or reference image" status="placeholder" />

---

## Key Provisions

| Parameter | Requirement | Notes |
|-----------|-------------|-------|
| **Occupant Load** | OL = Area ÷ Load Factor | Varies by use type |
| **Load Factor (Dining)** | 1.4 sqm/person | Higher density |
| **Load Factor (Office)** | 9.3 sqm/person | Lower density |
| **Load Factor (Retail Ground)** | 2.8 sqm/person | Medium density |
| **Exit Count 50–499** | 2 exits | Minimum for this range |
| **Exit Count 500–999** | 3 exits | — |
| **Exit Count 1,000+** | 4 exits | — |
| **Exit Width** | OL × 7.6 mm/person | NOT 5mm (ERR-DSGN-019) |
| **Min Exit Door** | 900mm (single), 1,100mm (double) | Each exit must meet minimum |
| **Travel Distance (unsprinklered)** | 45m max | NOT 30m (ERR-DSGN-020) |
| **Travel Distance (sprinklered)** | 60m max | — |
| **Dead-End (unsprinklered)** | 6m max | NOT 10m (ERR-DSGN-024) |
| **Dead-End (sprinklered)** | 12m max | — |
| **Corridor Width** | 1,100mm min | Same as stair |

**Critical Error Registry for Fire Egress:**
- **ERR-DSGN-019**: Exit width ≠ 5mm/person (correct = 7.6mm/person)
- **ERR-DSGN-020**: Travel distance ≠ 30m (correct = 45m/60m)
- **ERR-DSGN-021**: 1 exit max ≠ 100 persons (correct = 49 persons)
- **ERR-DSGN-024**: Dead-end ≠ 10m (correct = 6m/12m)

## Philippine Practice Context
In the Philippines, fire egress calculation errors are among the most-cited by fire safety inspectors and BFP (Bureau of Fire Protection). Common violations include under-sized exits (using calculated width without the 900mm minimum per exit), using 30m instead of 45m travel distance, and placing fire stairs within dead-end corridors. The 7.6 mm/person formula (not 5mm—ERR-DSGN-019) is frequently misremembered. High-rise residential condominiums routinely fail egress reviews because developers under-estimate occupancy (using residential load factors when common areas should use higher factors) or cluster all exits on one side, leaving dead-end zones beyond maximum distance. Early coordination with BFP is recommended to verify egress layouts during design, not after construction.

## How It's Tested
1. **Load calculation**: Given floor area and use type, calculate OL and determine exit count.
2. **Exit width verification**: Calculate required width and check against minimum per exit.
3. **Travel distance check**: Measure farthest point from exit and verify against limit (45m or 60m).
4. **Multi-space egress**: Design egress for a mixed-use floor (office + break room + stair); verify all requirements.
5. **Dead-end analysis**: Identify dead-end corridors and verify length limits.

<Tip>
**"Exit width = OL × 7.6, then distribute across required exits, each ≥ 900mm."** Never under-size an individual exit. If calculated width doesn't distribute evenly, round up and provide larger exits.
</Tip>

**Exam Tip — ERR-DSGN-009:** Exit width = occupant load × 7.6 mm/person (minimum 900mm per exit). Do NOT use 5.0 mm/person (assembly) or 5.6 mm/person (educational) unless the occupancy-specific factor is provided.
<ArticleMedia id="media-lea-dsgn-008-01-core-concept" type="image" caption="Egress Component Diagram — Exit Access, Exit, and Exit Discharge" description="Floor plan diagram showing the three egress components per RA 9514: exit access (travel path from any point to an exit), exit (enclosed stairway or door), and exit discharge (path to public way). Minimum widths, travel distances (45m/60m), and dead-end corridor limits (6m/12m) annotated." suggestedAsset="Diagram or reference image" status="placeholder" />

## Cross-References

See **LEA-DSGN-008-02** (Fire Separation) for compartmentation requirements, **LEA-DSGN-008-03** (Sprinkler Systems) for travel distance adjustments, and **LEA-DSGN-007-10** (Code Compliance) for holistic code application.

## Common Mistakes
<WikiMistakeList mistakes={["ERR-DSGN-019: Using 5mm per person instead of 7.6mm for exit width","ERR-DSGN-020: Using 30m travel distance instead of 45m (unsprinklered) or 60m (sprinklered)","ERR-DSGN-021: Assuming 1 exit serves 100 persons; correct max is 49 persons","ERR-DSGN-024: Using 10m dead-end limit instead of 6m (unsprinklered) or 12m (sprinklered)","Calculating exit width but forgetting 900mm minimum per exit","Not separating occupancy loads by use type (e.g., treating dining + kitchen as one load)","Placing all exits on one side of floor; far side becomes dead-end beyond limit","Using wrong load factors (e.g., assembly 9.3 instead of 0.65-1.1)"]} />