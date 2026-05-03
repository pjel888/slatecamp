## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define required strength (U) as the factored load combination for member design
- Identify the load combinations for both older NSCP and NSCP 2015 editions
- State the individual load factors for each edition
- Determine which load combination governs (produces the largest U)
- Explain why the earthquake factor differs between editions (1.87 vs. 1.0)

Load factors reflect the uncertainty in design loads and material strength. The NSCP specifies different load factor combinations depending on which loads act on the structure—gravity, wind, or earthquake. You must know both the older NSCP edition and NSCP 2015 load factors, as the LEA tests both.

## Core Concept

The required strength _U_ is the factored load combination that a structural member must be designed to resist. It combines multiple load types—dead load (D), live load (L), wind load (W), earthquake load (E), and earth/water pressure (H)—each multiplied by a load factor that accounts for variability and uncertainty.

The NSCP uses _load factor design_ (LRFD method), where safety comes from multiplying design loads by factors greater than 1. Different load combinations apply to different situations. The designer must calculate _U_ for each relevant load combination and then design the member to safely support the controlling (largest) value of _U_.

Load factors differ significantly between the older NSCP edition and NSCP 2015. The older NSCP uses higher individual load factors (DL = 1.40, LL = 1.70, WL = 1.70, E = 1.87) but applies a 0.75 reduction factor when multiple load types act together (wind or earthquake with gravity loads). NSCP 2015 uses lower factors (DL = 1.2, LL = 1.6) and does not reduce combined load combinations in the same way. The earthquake load factor in NSCP 2015 is 1.0 because the earthquake demand value _E_ already incorporates uncertainties; in the older NSCP, the earthquake effect must be multiplied by 1.87 within the combined formula.

A critical design task is identifying which load combination governs—produces the largest required strength. For example, when wind or earthquake acts, sometimes the combination with wind or earthquake governs (larger _U_), and sometimes the basic gravity combination governs instead. A thorough design must test all applicable combinations.

## Key Provisions

### Older NSCP Edition Load Combinations

| Load Combination | Required Strength Formula |
|---|---|
| Basic gravity | U = 1.4D + 1.7L |
| Gravity with wind (both assessed) | U = 0.75(1.4D + 1.7L + 1.7W) |
| Gravity with earthquake (both assessed) | U = 0.75(1.4D + 1.7L + 1.87E) |
| Wind governs (reduces gravity) | U = 0.9D + 1.7W |
| Earthquake governs (reduces gravity) | U = 0.9D + 1.87E |
| With earth/hydrostatic pressure | U = 1.4D + 1.7L + 1.7H |
| Temperature/shrinkage/creep combined | U = 0.75(1.4D + 1.4T) |
| Minimum with temperature alone | U = 1.4(D + T) |

**Individual Load Factors (Older NSCP):** Dead = 1.40, Live = 1.70, Wind = 1.70, Earthquake = 1.87, Earth/Water Pressure = 1.70, Temperature = 1.40

### NSCP 2015 Load Combinations

| Load Combination | Required Strength Formula |
|---|---|
| Basic gravity | U = 1.2D + 1.6L |
| Gravity with wind (both assessed) | U = 1.2D + 1.0W + 0.5L |
| Wind governs (reduces gravity) | U = 0.9D + 1.0W |
| Gravity with earthquake (both assessed) | U = 1.2D + 1.0E + 0.5L |
| Earthquake governs (reduces gravity) | U = 0.9D + 1.0E |
| With earth/hydrostatic pressure | U = 1.2D + 1.6L + 1.6H |

**Individual Load Factors (NSCP 2015):** Dead = 1.2, Live = 1.6, Wind = 1.0, Earthquake = 1.0, Earth/Water Pressure = 1.6

### Earthquake Load Factor Special Case

- **Older NSCP:** Earthquake appears as 1.87_E_ inside the combined formula, multiplied by 0.75: U = 0.75(1.4D + 1.7L + 1.87_E_). This yields an effective factor of 0.75 × 1.87 = 1.40 for earthquake.
- **NSCP 2015:** Earthquake appears as 1.0_E_ with no further reduction. The value _E_ from seismic analysis already includes design uncertainties; therefore, 1.0_E_ is correct.

This reflects a major shift in seismic philosophy between editions.

## Philippine Practice Context

The Philippines sits in a high-seismic region, making earthquake load combinations critical. Most design offices in Metro Manila, Cebu, and Davao now use NSCP 2015 because it aligns with International Building Code (IBC) practice and is more transparent about earthquake uncertainties. However, legacy designs and some conservative engineers still apply the older NSCP formulas. During code reviews, always clarify which edition applies. The Building Safety and Zoning Divisions in city governments increasingly require NSCP 2015 compliance for new permits.

## How It's Tested

**Pattern 1:** Given loads (dead, live, wind) and asking for the governing required strength under the older NSCP. The question specifies "older NSCP edition" in the stem. The answer requires testing multiple combinations and identifying which produces the largest _U_.

**Pattern 2:** Same loads but under NSCP 2015. The stem explicitly says "NSCP 2015." The answers differ because load factors and combination logic differ.

**Pattern 3:** A statement about an individual load factor or a combination formula, with false options that confuse the two editions or swap factors. The correct answer must match the specified edition and load type.

<Tip>
**Memorize the edition split:**

_Older NSCP:_ (1) DL = 1.4, LL = 1.7, WL = 1.7, E = 1.87. (2) Combined wind/earthquake: 0.75(1.4D + 1.7L + 1.7/1.87load). (3) Reduces gravity: 0.9D + 1.7W or 0.9D + 1.87E.

_NSCP 2015:_ (1) DL = 1.2, LL = 1.6, W = 1.0, E = 1.0. (2) Combined: 1.2D + 1.0W/E + L. (3) Reduces gravity: 0.9D + 1.0W or 0.9D + 1.0E.

Always flag which edition the question asks about before calculating.
</Tip>


## Related Articles

See also: **ASD vs LRFD** (lea-strc-003-04) for the design philosophy behind factored loads, **Structural Design Capacity** (lea-strc-005-02) for how required strength is checked against capacity, and **Load Types** (lea-strc-001-02) for the loads that enter the combinations.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing DL factor 1.4 (older NSCP) with 1.2 (NSCP 2015); state the edition first.", "Forgetting the 0.75 reduction factor in older NSCP wind/earthquake combined formulas; this yields effective factors like 0.75 × 1.7 = 1.275 for wind in combination, not 1.7 alone.", "Treating earthquake factor as 1.87 in NSCP 2015; NSCP 2015 uses 1.0 because E already incorporates design uncertainty.", "Failing to test all load combinations; always calculate U for gravity, wind, and earthquake separately, then identify which governs.", "Mixing older and NSCP 2015 factors in the same calculation; pick one edition and stay consistent."]} />