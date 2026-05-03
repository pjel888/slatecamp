## What You Need to Know for the LEA

Column ties provide transverse confinement to longitudinal bars and prevent buckling during compression. The LEA tests your mastery of _three independent spacing criteria_ and how to select the most restrictive, plus seismic special requirements for SMRF columns. Critical values: normal ties use smallest of (16_db_, 48×tie_dia, least column dimension); seismic confinement length = max(column dim, L/6, 450mm).

## Core Concept

Column ties serve two purposes: (1) hold longitudinal bars in position during construction and concrete placement, and (2) confine concrete and prevent bar buckling. Tie spacing is controlled by the most restrictive of three criteria, each addressing a different failure mode:

1. _16_db_: limits longitudinal bar buckling (bar diameter-based)
2. _48×tie_dia_: ensures adequate confinement density (tie strength-based)
3. _Least column dimension_: limits bar migration perpendicular to tie plane

Seismic design adds critical requirements for SMRF columns: confined zones at member ends and mid-height, 135° seismic hooks, and tighter hoop spacing near plastic hinge regions.

## Key Provisions

### Column Tie Spacing — Non-Seismic (NSCP 7.10.9.1)

| **Criterion** | **Formula** | **Controls** | **Notes** |
|---|---|---|---|
| Bar buckling | 16_db_ (db = long bar diameter) | Longitudinal bar slenderness | For 20mm bars: 16×20 = 320mm |
| Tie confinement strength | 48×_t_tie (t_tie = tie diameter) | Confining stress; hoop effectiveness | For 10mm ties: 48×10 = 480mm |
| Column geometry | Least column dimension | Physical constraint; bar position | For 300mm × 400mm: 300mm minimum |
| **Maximum spacing** | **Smallest of three above** | **Most restrictive governs** | **Select the minimum value** |

**Example:** 300mm × 400mm column with 20mm longitudinal bars and 10mm ties:
- 16_db_ = 320mm
- 48×tie_dia = 480mm
- Least dimension = 300mm
- **Maximum spacing = 300mm** (governs)

### Tie Diameter and Size Requirements (NSCP 7.10.9.2)

| **Longitudinal Bar Size** | **Minimum Tie Diameter** | **Spacing Limit if Exceeded** |
|---|---|---|
| ≤ 32mm | 10mm | Standard spacing applies |
| 36mm or larger | 12mm | Standard spacing applies |
| Bundled bars (any) | 12mm | Standard spacing applies |

**Rule:** No longitudinal bar shall be more than 150mm clear distance from a laterally supported bar (by tie or spiral) in any direction.

### Seismic Column Confinement — SMRF (NSCP 12.13.5)

Seismic-resistant moment-resisting frames require enhanced confinement near plastic hinge zones:

| **Seismic Requirement** | **Specification** | **Application** |
|---|---|---|
| Confinement zone length | max(member dimension, L/6, 450mm) | At each end of column; mid-height not required for regular frames |
| Hoop spacing in zone | min(b/4, 6_db_long, 150mm) | Tightest spacing to confine plastic hinging |
| Hoop angle | 135° bend angle (not 90°) | Seismic hooks required (ERR-STRC-014) |
| Hook extension | 6_db_ min 75mm | Ensures closure and anchorage |
| Outside confinement zone | Standard NSCP 7.10.9 spacing applies | Relaxed spacing farther from ends |

**Example:** 500mm × 500mm column, h_column = 4 m, 8 × 28mm bars, 12mm hoops:

- Confinement zone = max(500, 4000/6, 450) = max(500, 667, 450) = **667mm at each end**
- Hoop spacing in zone = min(500/4, 6×28, 150) = min(125, 168, 150) = **125mm**
- Hoop angle = **135°** with 6×12 = 72mm extension, min 75mm → **75mm extension**
- Outside zone = smallest of (16×28=448, 48×12=576, 500) = **448mm**

## Philippine Practice Context

Standard 300mm × 400mm building columns with 12 bars of 20mm and 10mm ties are ubiquitous in residential construction. Contractors often space ties at 400mm or 500mm without checking the three-criteria rule, leading to under-confinement and potential failure during lateral shaking. SMRF columns in high-seismic zones (Zones 4–5, Metro Manila, Baguio) require strict seismic hook detailing; many engineers specify 90° hooks in error (ERR-STRC-014), which the LEA frequently tests.

## How It's Tested

1. **Direct calculation:** "A 400mm × 400mm square column contains 20mm bars with 10mm ties. Calculate maximum tie spacing." (Answer: smallest of 320mm, 480mm, 400mm = 320mm; difficulty 0.3)

2. **Three-criteria scenario:** "A column is 300mm × 500mm with 28mm bars and 12mm ties. What is the maximum tie spacing?" (Answer: smallest of 448mm, 576mm, 300mm = 300mm; difficulty 0.5)

3. **Seismic confinement zone:** "An SMRF column is 600mm × 600mm, 5 m tall, with 12mm hoops. What is the confinement zone length and hoop spacing within the zone?" (Answer: zone = max(600, 833, 450) = 833mm; spacing = min(150, 72mm, 150) = 72mm if 36mm bars; difficulty 0.7)

4. **Hook angle error detection:** "A column detail shows 90° hooks for seismic confinement. Is this compliant?" (Answer: No; seismic requires 135° hooks (ERR-STRC-014); difficulty 0.5)

<Tip>
Three-criteria rule: _smallest_ of (16_db_, 48×_t_tie_, least dim). Always calculate all three; choose the smallest. Seismic hook = 135° (not 90°), with min 75mm extension. Confinement zone = max(dim, L/6, 450mm). Inside zone: spacing = min(b/4, 6_db_, 150mm) (tight). Outside zone: standard spacing applies (relaxed).
</Tip>

## Common Mistakes

<WikiMistakeList mistakes={[ "Only 16_db_ controls tie spacing — WRONG. All three criteria must be checked; the smallest governs (ERR-STRC-023).", "Tie spacing = 48 × bar diameter (confusing bar and tie size) — WRONG. Formula is 48 × tie_dia, not bar dia.", "Seismic hoop = 90° — WRONG. Seismic requires 135° bend angle (ERR-STRC-014).", "Minimum tie diameter always 10mm — WRONG. 36mm or larger bars and bundles require 12mm ties (ERR-STRC-026).", "Seismic hoop extension = 6_db_ only (no 75mm minimum) — WRONG. Must satisfy 6_db_ AND min 75mm (largest).", "No confinement required outside seismic zone — WRONG. Standard NSCP 7.10.9 spacing applies outside confinement length; it is relaxed but still required." ]} />