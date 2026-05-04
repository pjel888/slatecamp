## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- Define a masonry unit and distinguish between concrete blocks, clay bricks, and stone
- Identify CHB (concrete hollow block) standard dimensions and grades
- Explain the role of mortar in bonding units and accommodating movement
- Describe the difference between load-bearing and non-load-bearing masonry units

---
Masonry units are classified as hollow or solid based on the ratio of void area to gross cross-sectional area. Understanding these classifications, area definitions (gross, net, bedded), and how they affect design and construction is critical for specifying materials, calculating masonry strength, and meeting code requirements.

## Core Concept
<ArticleMedia id="media-lea-strc-010-02-core-concept" a type="image" caption="Masonry Unit Types — Concrete Block, Clay Brick, and Structural Clay Tile" description="Comparative illustration of masonry units: (1) Concrete masonry unit (CMU) — hollow and solid types, nominal sizes (4'', 6'', 8''), web/shell thickness; (2) Clay brick — modular (8×4×2.67''), Norman, Roman, Jumbo sizes; (3) Structural clay tile — load-bearing partition and floor tiles. Compressive strength grades per ASTM/NSCP shown for each unit type." suggestedAsset="Diagram or reference image" status="placeholder" />

A **masonry unit** is an individual element (brick, concrete block, stone) used to construct masonry walls. The internal structure—whether the unit contains voids (hollow) or is completely solid—determines its classification and structural behavior.

**Hollow masonry units** contain enclosed voids or cells. The classification threshold is determined by comparing net area (solid material area) to gross cross-sectional area (the total bounding envelope). A masonry unit is classified as **hollow** if its net area is _less than_ 75% of the gross cross-sectional area. Conversely, a unit is classified as **solid** if its net area is _greater than or equal to_ 75% of the gross area.

**Gross area** is the overall cross-sectional area of the unit as measured at the bed face (the face that contacts mortar). It is the total bounding rectangle, including voids.

**Net area** is the cross-sectional area of solid material only, excluding all voids. Net area is determined by subtracting the area of all cells, cores, or holes from the gross area.

**Bedded area** (sometimes called bedding area or contact area) is the area of the unit that actually contacts mortar in the bed joint. For concrete hollow blocks with cells running perpendicular to the bed joint, the bedded area is typically 50–60% of the gross area (only the solid "shells" of the unit contact mortar). This distinction is essential in grouted masonry design because grout in cells does not develop the same bond strength as solid masonry.

### Concrete Hollow Block (CHB) Standard Dimensions

Concrete hollow blocks are the dominant masonry unit in the Philippines. Standard sizes include:

| _Designation_ | _Thickness (D)_ | _Height (H)_ | _Length (L)_ | _Typical Cell Count_ |
|---|---|---|---|---|
| 4-inch CHB | 100 mm | 200 mm | 400 mm | 2–3 cells |
| 5-inch CHB | 125 mm | 200 mm | 400 mm | 2–3 cells |
| 6-inch CHB | 150 mm | 200 mm | 400 mm | 2–3 cells |

A standard 6-inch CHB with gross area = 0.150 m × 0.400 m = 0.060 m² and typical net area ≈ 0.030 m² (50%) is classified as **hollow** because 0.030 ÷ 0.060 = 50% < 75%.

### Design Implications

In **unreinforced masonry**, hollow units transfer compressive loads through the solid material (webs and shells); the hollow cells provide no structural contribution. In **grouted reinforced masonry**, grout fills designated cells, enabling vertical reinforcement to transfer load and providing confinement. However, grouted cells do not develop the same lateral bond strength as solid material; this is accounted for in allowable stress calculations.

The **bedded area** concept is critical: the bearing strength of masonry (compression perpendicular to the bed joint) is calculated as stress = load ÷ bedded area, not gross area. Because bedded area of hollow units is much smaller than gross area (typically 50–60%), the bearing stress is proportionally higher, and local crushing is a common failure mode in masonry.

## Key Provisions

| _Unit Classification_ | _Net Area / Gross Area_ | _Cell Void Condition_ | _Structural Behavior_ |
|---|---|---|---|
| Hollow | < 75% | Enclosed voids; may be empty or grouted | Load transfers through solid shells; grouted cells confine reinforcement |
| Solid | ≥ 75% | Minimal voids or solid throughout | Load transfers uniformly through unit; higher bearing capacity |

| _Area Type_ | _Definition_ | _Used In_ | _Example (6-inch CHB)_ |
|---|---|---|---|
| Gross area | Total bounding cross-section, including all voids | Calculating unit dimensions, initial specifications | 150 mm × 400 mm = 60,000 mm² |
| Net area | Solid material only; voids excluded | Classifying unit as hollow or solid (75% threshold) | 30,000 mm² (50% of gross = hollow) |
| Bedded area | Area actually contacting mortar in bed joint | Calculating bearing stress, lateral bond strength | 30,000–36,000 mm² (50–60% of gross) |

## Philippine Practice Context

In the Philippines, concrete hollow blocks (CHB) are the standard unit for masonry construction, with net-to-gross ratios typically 45–55% (solidly in the hollow classification). The BCP (Building Code of the Philippines, now incorporated into the NBP 2020) recognizes hollow units and specifies grouting schedules and reinforcement placement accordingly. Structural designers must account for bedded area when calculating bearing stresses and ensuring local crushing does not occur. The widespread use of 6-inch CHB reflects the balance between cost, availability, and structural adequacy for typical residential and low-rise commercial construction.

## How It's Tested

**Pattern 1 — Classification Threshold:**
_A concrete block has a gross area of 150,000 mm² and a net area of 105,000 mm². Is this unit classified as hollow or solid?_
- Correct answer: Solid. Net area ÷ gross area = 105,000 ÷ 150,000 = 70% > 75%? No, 70% < 75%, so the unit is hollow. (Recheck: 105,000 / 150,000 = 0.70 = 70%, which is less than 75%, so HOLLOW.)
- Test variation: Apply the threshold to hypothetical units with varying void percentages.

**Pattern 2 — Bedded Area Application:**
_A 150 mm thick concrete hollow block wall carries a factored axial load of 300 kN per unit width. The bedded area is 55% of the gross area (150 mm × 400 mm). Calculate the bearing stress and determine if the unit is adequate if the design bearing strength is 5 MPa._
- Correct answer: Gross area = 0.150 × 0.400 = 0.060 m² per meter of wall; bedded area = 0.055 × 0.060 = 0.033 m² per unit; bearing stress = 300 kN ÷ 0.033 m² = 9.1 MPa > 5 MPa (INADEQUATE—local crushing risk).
- Test variation: Vary load, bedded area percentage, and allowable stress.

**Pattern 3 — Grouting Strategy in Hollow Units:**
_In a four-story hollow CHB building with Design Category D seismic loading, grouted cells are specified at 1200 mm intervals horizontally and in all courses at specified vertical reinforcement locations. Why is full grouting of all cells not required?_
- Correct answer: Full grouting is economically wasteful and structurally unnecessary; strategic grouting around reinforcement and at specified intervals provides required lateral confinement and vertical load paths at lower cost. Ungrouted cells maintain thermal insulation value.
- Test variation: Recognize the balance between structural performance and constructability.

<Tip>
_Memory aid_: **"75% Rule"** — Hollow unit = net area < 75% of gross. Standard 6-inch CHB = 50% net = HOLLOW. **"BNA"** — **B**edded area (what contacts mortar), **N**et area (solid only), **A**rea gross (full bounding box). Bedded area determines bearing stress, not gross area.
</Tip>

## Related Articles

See also: **Masonry Construction** (lea-strc-010-01) for how units are assembled into walls, **Bearing Walls** (lea-strc-002-04) for load-bearing masonry applications, and **Concrete Materials** (lea-strc-006-01) for the concrete in blocks and mortar.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing net area with bedded area—net area is 100% solid material; bedded area is only the portion in actual mortar contact (typically 50–60% for hollow CHB).","Assuming all hollow units have the same net-to-gross ratio—while typical CHB is 45–55%, clay bricks may be 60–80%; always verify unit-specific data.","Using gross area for bearing stress calculations instead of bedded area—this underestimates stress and may lead to local crushing failures.","Treating the 75% threshold as a rough guideline instead of an absolute code criterion—75% is the exact dividing line: ≥75% is solid, &lt;75% is hollow.","Specifying full-cell grouting to improve insulation—grouting eliminates insulation value and is structurally unnecessary where strategic grouting suffices.","Ignoring bedded area reduction in design—hollow units have 40–50% less bedded area than gross area; this significantly increases bearing stress and must be explicitly checked."]} />