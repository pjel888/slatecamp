## What You Need to Know for the LEA

## Learning Goal

By the end of this article, you will be able to:

- Define basic wind speed (V) as a 3-second gust at 10 m in Exposure C
- State the return period (50-year, 0.02 annual probability)
- Classify a building as open, enclosed, or partially enclosed
- Classify a building as low-rise and determine if flexible structure provisions apply
- Identify Exposure A, B, and C terrain categories

---
## Core Concept
Wind load provisions begin with establishing a baseline wind hazard and then classifying the specific building that experiences it. The _basic wind speed V_ is defined as a 3-second peak gust speed measured 10 meters above the ground in Exposure C terrain. This speed has a 0.02 annual probability of exceedance, corresponding to a 50-year mean recurrence interval—the standard hazard level for Philippine structural design codes.

The exposure category depends on the roughness and obstructions surrounding the site. _Exposure A_ applies to smooth terrain with scattered obstructions (harbors, flat agricultural land); _Exposure B_ to suburban or light industrial areas with moderate surface roughness; and _Exposure C_ to open terrain with occasional obstructions (grassland, scattered trees, undeveloped land). The exposure classification affects how wind speed is adjusted upward or downward as a function of height.

Buildings are further classified by how wind can enter or escape. An _open building_ has all external walls at least 80% open (allowing free passage of wind through the structure). An _enclosed building_ has all external walls less than 80% open and negligible volume of air enclosed (effectively impermeable). A _partially enclosed building_ has some walls that are at least 80% open but not all. This classification changes internal pressure coefficients and therefore the overall wind force magnitude.

Finally, the structural system itself is classified. A _low-rise building_ has a mean roof height not exceeding 18 meters AND a mean roof height not exceeding the least horizontal dimension of the building plan. Structures taller or more slender than this are subject to stricter dynamic analysis provisions. A _flexible structure_ has a fundamental natural frequency less than 1 Hz or a height exceeding 4 times the least horizontal dimension—criteria that require consideration of wind-induced resonance.

## Key Provisions

| Parameter | Definition | Application |
|---|---|---|
| Basic Wind Speed (V) | 3-second gust at 10 m in Exposure C | Reference hazard; adjusted by exposure category and height |
| Annual Probability | 0.02 (1 in 50 year) | Risk level for standard design |
| Exposure A | Smooth terrain, scattered obstructions | Harbors, flat agricultural areas |
| Exposure B | Moderate surface roughness | Suburban, light industrial |
| Exposure C | Open terrain, occasional obstructions | Grassland, scattered trees, undeveloped |
| Open Building | ≥80% of all walls open | All wind faces allow interior wind flow |
| Enclosed Building | &lt;80% walls open, negligible enclosed air | No interior pressure buildup |
| Partially Enclosed | Some walls ≥80% open, others &lt;80% | Mixed interior pressure behavior |
| Low-Rise Building (height condition) | Mean roof height ≤ 18 m | Simpler wind load procedure applies |
| Low-Rise Building (plan condition) | Mean roof height ≤ least horizontal dimension | Avoids slender structure effects |
| Flexible Structure (frequency) | Fundamental natural frequency < 1 Hz | Resonance analysis required |
| Flexible Structure (height) | Height > 4 × least horizontal dimension | Geometry-based flexibility indicator |

## Philippine Practice Context
The Philippines lies in a typhoon belt where wind speeds regularly exceed 200 km/h. The National Building Code adopts a 50-year recurrence interval (0.02 annual probability) for basic wind speed, aligning with international practice but acknowledging the extreme nature of Philippine cyclone exposure. Engineers must verify that their site exposure classification reflects actual terrain roughness—terrain change from open shoreline to dense urban development significantly reduces design wind speed. Typhoon surge and rain-driven load combinations are addressed in separate provisions.

## How It's Tested
**Question Type 1:** Recognize the exact definition of basic wind speed and its return period.
**Question Type 2:** Classify a site or building scenario as Exposure A, B, or C; identify open, enclosed, or partially enclosed classification.
**Question Type 3:** Determine whether a given building qualifies as low-rise and whether it must be treated as flexible.

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: _Basic Wind Speed_ = 3-sec gust at 10m, Exposure C baseline. If you cannot state this in one sentence, you will fail the exam. The 0.02 probability is non-negotiable; it defines the entire hazard level.




[/SLATECAMP_UI_BLOCK]


## Related Articles

See also: **Load Types** (lea-strc-001-02) for wind load as a load category, **Required Strength** (lea-strc-005-01) for wind load combinations, and **Base Shear** (lea-strc-004-03) for comparison with seismic lateral loads.

## Common Mistakes
[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing basic wind speed with locally measured gusts; basic wind speed is a standardized 3-second gust at 10 m in Exposure C, not an arbitrary field measurement.\",\"Assuming open buildings (≥80% walls open) automatically experience less wind load; interior pressurization still occurs if the building encloses significant air volume.\",\"Forgetting that flexible structure thresholds (frequency < 1 Hz or height > 4 × least dimension) trigger dynamic wind analysis, not static procedures.\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]