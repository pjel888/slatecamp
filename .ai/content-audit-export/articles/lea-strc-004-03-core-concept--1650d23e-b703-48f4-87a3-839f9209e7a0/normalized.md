## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define base shear (V) as the total design lateral force at the base of a structure
- Identify the variables in the base shear formula: V = (Z × I × C × W) / R
- Explain how each variable (Z, I, C, W, R) affects the design seismic force
- State the relationship between building period (T) and seismic response coefficient (C)

A soft story and a weak story are not synonyms. Soft story is a lateral stiffness deficiency (< 70% of story above); weak story is a lateral strength deficiency (< 80% of story above). Both create seismic vulnerability and are regulated by design codes. The LEA distinguishes them clearly.

## Core Concept
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-strc-004-03-core-concept", type="image", caption="Base Shear — Seismic Force Distribution", description="Building elevation diagram showing: (1) Total base shear V calculated from V=(ZIC/RW)W applied at base; (2) Vertical distribution of lateral forces (Fx) increasing from bottom to top following Fx = (Wxhx^k/ΣWihi^k)V; (3) Story drift and overturning moment diagram. Key parameters labeled: Z (zone), I (importance), C (response), R (ductility), W (weight).", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

_Base shear_ (V) is the total lateral (seismic) force at the building base, calculated as V = Z × I × C × W. It represents the maximum expected seismic demand that the foundation must resist. The base shear is distributed up the height of the building according to the code formula.

_Story drift_ (Δ) is the lateral displacement of one story relative to the story below. It is measured in the same seismic direction and is a primary check for building adequacy. Code limits story drift to no more than 0.02 × story height (sometimes 0.025 for very tall flexible buildings, but 0.02 is the standard). Excessive story drift causes non-structural damage (cracking in partitions, breaking of windows) and can initiate P-delta (second-order) effects.

A _soft story_ is one where the lateral stiffness is less than 70% of the story immediately above it. Lateral stiffness is the lateral force required to produce unit displacement (kips/inch or kN/mm). A soft story leads to disproportionate lateral displacement in that one story—the deformation concentrates there. This is a stiffness deficiency.

A _weak story_ is one where the lateral strength (shear capacity) is less than 80% of the story immediately above it. Lateral strength is measured as the shear force (in kN) that the story can resist before yielding or shear failure. A weak story is the first to fail during an earthquake. This is a strength deficiency.

Both conditions are _irregular_ in the code sense. The NSCP requires that buildings avoid these irregularities. If a soft or weak story exists, special detailing, increased member capacities, or nonlinear analysis is required.

_Collectors_ and _diaphragms_ (defined in LEA-STRC-002-02) transfer seismic forces from the lateral load-resisting system (LLRS) to the foundation. Seismic column confinement (defined in LEA-STRC-007-04) ensures ductile behavior in columns at soft or weak stories.

## Key Provisions

| Parameter | Definition | Limit/Typical Value |
|-----------|-----------|-------------------|
| Base Shear (V) | Total lateral seismic force at base | V = Z × I × C × W (calculated, not limited a priori) |
| Story Drift (Δ) | Lateral displacement of story relative to floor below | ≤ 0.02 × story height |
| Soft Story | Lateral stiffness < 70% of story above | Irregular; avoid or provide special design |
| Weak Story | Lateral strength < 80% of story above | Irregular; avoid or provide special design |

The soft/weak story check is performed for every story pair in a building. If any story fails the check, the entire building is flagged as irregular and must be analyzed with additional scrutiny or redesigned.

Story drift control prevents both non-structural damage and P-delta amplification. In a 4 m tall story, Δ must not exceed 0.02 × 4000 mm = 80 mm. If seismic demand produces 100 mm drift, the system is undersized and must be stiffened (larger columns, shear walls, bracing).

## Philippine Practice Context

Soft stories are common in Philippine commercial buildings where ground floors are designed open for retail or lobby space, and upper floors are column-grid office/residential. The transition from open ground to enclosed upper stories creates a stiffness discontinuity. Weak stories can occur where a story loses shear wall area (common when a shear wall terminates at mid-height). The 1990 Luzon and 2013 Bohol earthquakes caused significant damage to structures with soft or weak stories; post-earthquake surveys identified these irregularities as primary failure modes. Modern NSCP enforcement requires detection and mitigation at the design phase.

## How It's Tested

**Pattern 1: Definition distinction.** "A story with lateral stiffness less than 70% of the story above is called a..." → Soft story (not weak). Stiffness → soft.

**Pattern 2: Threshold identification.** "A weak story is defined as one where lateral strength is less than ___ percent of the story above." → 80% (not 70%).

**Pattern 3: Consequence analysis.** "A building has a soft story at the ground level. What is the likely effect?" → The ground story experiences disproportionately large lateral displacement; story drift concentrates at the weak stiffness point; non-structural damage and P-delta effects increase. The design is irregular and requires special attention.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: _Soft_ = stiffness (S.S. = Same Sound). _Weak_ = strength (starts with W). Soft < 70%; Weak < 80%. Remember: 70 (soft) comes before 80 (weak) numerically and alphabetically (Soft, Weak).
[/SLATECAMP_UI_BLOCK]

## Related Articles

See also: **Seismic Zones** (lea-strc-004-02) for zone factor Z, **Earthquake Fundamentals** (lea-strc-004-01) for the science behind seismic demand, and **Required Strength** (lea-strc-005-01) for how base shear combines with other loads.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Treating soft and weak as synonyms. They are distinct: soft = stiffness; weak = strength. Different definitions, different thresholds (70% vs. 80%).\",\"Using 80% for soft story threshold. Soft story threshold is 70% of story above (stiffness). Weak story is 80% (strength).\",\"Confusing story drift (displacement) with soft/weak (stiffness/strength). Drift is the lateral movement; soft/weak are structural deficiencies that can cause excessive drift.\",\"Thinking soft/weak stories only matter for tall buildings. Any building with a stiffness or strength discontinuity (e.g., ground floor retail below office) is subject to the check.\",\"Ignoring the story-pair nature of the check. A soft story is 70% of the story ABOVE, not an absolute value. Compare each story to its upper neighbor.\",\"Assuming P-delta effects are automatically accounted for. If story drift exceeds 0.02H, P-delta analysis is required because second-order effects become significant.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]