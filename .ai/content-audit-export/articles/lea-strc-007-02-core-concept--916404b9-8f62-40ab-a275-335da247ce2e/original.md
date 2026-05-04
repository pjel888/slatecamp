## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define a hook and explain its purpose in reinforcing bar anchorage
- Distinguish between standard hooks (90°, 180°) and seismic hooks (135°)
- State minimum hook dimensions and extension lengths
- Identify hooks in stirrups, ties, and main reinforcement

Standard hooks anchor reinforcement at supports and splices. The LEA tests your exact knowledge of hook geometry—bend angle, extension length, and minimum diameter—across three contexts: longitudinal bars, stirrups, and seismic confinement. Critical values: 180° hook = 4_db_ (min 65mm), 90° hook = 12_db_, seismic 135° = 6_db_ (min 75mm).

## Core Concept
<ArticleMedia id="media-lea-strc-007-02-core-concept" type="image" caption="Rebar Hook Types — 90°, 180°, Stirrup, and Seismic Hooks" description="Dimensioned diagram of standard rebar hooks: (1) 90° hook — 12db extension for standard, 6db for seismic; (2) 180° hook — 4db minimum bend diameter, 12db extension; (3) Standard stirrup hook — 90° or 135° on closed stirrups; (4) Seismic hook — 135° bend with 6db extension (min 75mm). Bend diameter requirements per ACI/NSCP for different bar sizes." suggestedAsset="Diagram or reference image" status="placeholder" />

A hook is a bend at the end of a reinforcing bar or stirrup that provides anchorage by mechanical interlock with concrete. Hook design balances two requirements: the bend must be sharp enough to develop anchorage (controlled by _db_, the inside diameter of the bend) and long enough to provide sufficient embedment (controlled by extension length, measured from the inside of the bend).

Standard hooks follow precise geometry defined by NSCP/ACI to ensure reproducible, reliable anchorage. Different applications—longitudinal bars, stirrups, seismic confinement—require different hook profiles. The _db_ limits (6_db_, 8_db_, 10_db_) prevent concrete crushing on the inside of the bend; the extension lengths (4_db_, 6_db_, 12_db_) guarantee sufficient bearing length.

## Key Provisions

### Standard Hook Geometry (NSCP 7.1.1, ACI 318 Section 25.3)

| **Hook Type** | **Bend Angle** | **Inside Diameter (db)** | **Extension Length** | **Minimum Total Length** | **Typical Use** |
|---|---|---|---|---|---|
| 180° (U-hook, longitudinal) | 180° | 4_db_ (min 65mm) | 4_db_ (min 65mm) | 12_db_ (min 150mm) | Bar ends at interior supports |
| 90° (L-hook, longitudinal) | 90° | 12_db_ | 12_db_ | 24_db_ | Bar ends at beam faces |
| 90° (stirrup/tie, ≤16mm) | 90° | 4_db_ | 6_db_ | 10_db_ | Standard stirrup hooks |
| 90° (stirrup/tie, 20–25mm) | 90° | 6_db_ (inside) | 12_db_ | 18_db_ | Large stirrups |
| 135° (alternate, ≤25mm) | 135° | 6_db_ (inside) | 6_db_ | 12_db_ | Seismic or congested regions |
| 135° (seismic hoop, SMRF) | 135° | 6_db_ (inside) | 6_db_ min 75mm | 12_db_ + 75mm min | Seismic column confinement |

### Minimum Bend Diameters for Hooks and Stirrups (NSCP 7.1.2, ACI 318 Section 25.2)

These limits control the crushing stress on the inside of the bend:

| **Bar/Tie Size** | **Application** | **Minimum Inside Diameter (db)** |
|---|---|---|
| 10–16mm | Longitudinal bars, hooks | 6_db_ |
| 16–25mm | Stirrups and ties (≤16mm) | 4_db_ |
| 20–25mm | Stirrups and ties (20–25mm) | 6_db_ |
| 28mm | Longitudinal bars, hooks | 8_db_ |
| 32mm | Longitudinal bars, hooks | 8_db_ |
| 36mm | Longitudinal bars, hooks | 10_db_ |

### Seismic Hooks — Special Requirements (NSCP 2015 Section 7.1 & Chapter 12 Seismic Design)

Seismic lateral confinement hoops in Intermediate Moment Frames (IMF) and Special Moment Frames (SMF) must use _special seismic hooks_ to prevent bar buckling and lateral instability:

- **Bend angle:** 135° (NOT 90°) for hoops; crossties may alternate 90° and 135° hooks per ACI 318-19 Section 25.3.5
- **Inside diameter:** 6_db_
- **Extension:** 6_db_ minimum **75mm** (take the larger value)
- **Hook placement:** Corner hoops and leg hoops must close the loop; alternating legs may use 135° hooks

## Philippine Practice Context

Standard 180° hooks are most common in Philippine construction for negative moment anchorage at intermediate supports of continuous beams. Stirrup hooks (90°, 6_db_) are ubiquitous in building frames. Seismic hook requirements (135°, min 75mm extension) apply strictly in MRF design in high-seismic zones or for irregular buildings, but many designers incorrectly use 90° hooks in seismic details, triggering ERR-STRC-014.

## How It's Tested

1. **Hook geometry recall:** "A 180° standard hook on a 20mm bar must have a minimum inside bend diameter of __db. What is db in mm?" (Answer: 4_db_ = 80mm; difficulty 0.3)

2. **Stirrup hook extension:** "Stirrups with 16mm diameter ties need 90° hooks. What is the minimum extension length from the inside of the bend?" (Answer: 6_db_ = 96mm; difficulty 0.5)

3. **Seismic confinement scenario:** "Seismic column hoops in an SMRF require special hooks. What is the bend angle, and what is the minimum extension?" (Answer: 135° with 6_db_ min 75mm extension; difficulty 0.7)

4. **Bend diameter selection:** "Design a 90° hook for a 36mm longitudinal bar. What is the minimum inside bend diameter?" (Answer: 10_db_ = 360mm; difficulty 0.7)

<Tip>
Hook memory: 180° = 4_db_ min 65mm (small bend, short extension). 90° longitudinal = 12_db_ (wide bend, long extension). Stirrup 90° ≤16mm = 4_db_ inside (tight bend). Seismic 135° = 6_db_ with min 75mm extension (mandatory minimum). Bend diameter increases with bar size: 6_db_ (10–25mm), 8_db_ (28–32mm), 10_db_ (36mm).
</Tip>

## Related Articles

See also: **Concrete Cover** (lea-strc-007-01) for how hooks relate to cover requirements, **Deformed Bars** (lea-strc-006-02) for the bar sizes used with hooks, and **Column Ties** (lea-strc-007-04) for seismic hook requirements in columns.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

