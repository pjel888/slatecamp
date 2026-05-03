## What You Need to Know for the LEA
Timber structural design under Allowable Stress Design (ASD) requires bending, shear, and compression checks using fundamental formulas. Each check compares an applied stress to an allowable stress; compliance means stress ≤ allowable at all points.

## Core Concept
Allowable Stress Design (ASD) is a working stress method in which a timber member is checked by comparing the maximum stress induced by loads to a pre-established allowable stress determined by species, grade, moisture, and load duration. The three critical checks in timber ASD design are: (1) _bending stress_ (fb vs. Fb), (2) _horizontal shear stress_ (fv vs. Fv), and (3) _compression parallel to grain_ (fc vs. Fc). Bending stress is computed as fb = M/S, where M is the maximum moment and S is the section modulus. For a rectangular section, S = bh²/6, derived from the elastic theory of pure bending. Horizontal shear stress is computed as fv = 3V/(2A), not the simplified fv = V/A; the 3/2 factor accounts for the parabolic shear distribution across a rectangular section, with maximum shear occurring at the neutral axis. Here, V is the maximum shear force and A = bh is the cross-sectional area. Section modulus S and moment of inertia I are geometric properties: I = bh³/12. Allowable stresses (Fb, Fv, Fc) are tabulated by species, grade, and condition; they are _never_ calculated—they are looked up from design tables. The design inequality is always _applied stress ≤ allowable stress_. If any check fails, the member is undersized and must be redesigned (larger dimensions, higher grade, or structural reinforcement). A timber element is not "over-designed" if all stresses are below allowable; this is safe reserve capacity and is acceptable. ASD is conservative and widely used in Philippine building practice, though Limit State Design (LSD) is increasingly recognized in modern codes. For the LEA, ASD formulas and checks are the primary focus.

## Key Provisions

### Bending Stress Check
**Formula:** fb = M/S

Where:
- fb = applied bending stress (MPa)
- M = maximum bending moment (N·mm or kN·m, consistent units)
- S = section modulus (mm³ or m⁴ depending on units)

**For a rectangular section:**
S = bh²/6

Where:
- b = width (mm)
- h = depth (mm)
- Note: The 2 exponent is critical; depth squared dominates bending capacity.

**Compliance:** fb ≤ Fb (allowable bending stress from design tables)

### Horizontal Shear Stress Check
**Formula:** fv = 3V/(2A)

Where:
- fv = applied horizontal shear stress (MPa)
- V = maximum shear force (N or kN, consistent units)
- A = cross-sectional area = bh (mm²)

**Why 3/2?** Shear stress in a rectangular section is not uniform. Maximum shear occurs at the neutral axis and equals 3/2 times the average shear stress V/A.

**Compliance:** fv ≤ Fv (allowable shear stress from design tables)

### Section Properties

<WikiExamTable headers={["Property", "Formula", "Unit", "Use"]} rows={[ ["Section Modulus", "S = bh²/6", "mm³", "Bending: fb = M/S"], ["Moment of Inertia", "I = bh³/12", "mm⁴", "Deflection and combined stress"], ["Cross-sectional Area", "A = bh", "mm²", "Shear: fv = 3V/(2A)"], ["Radius of Gyration", "r = h/√12", "mm", "Compression (secondary)"] ]} />

### Worked Example: Bending Stress Check

**Given:**
- Rectangular timber: b = 50 mm, h = 200 mm
- Allowable bending stress: Fb = 12 MPa (Narra Group II)
- Applied moment: M = 12 kN·m = 12 × 10⁶ N·mm

**Calculate:**
1. S = bh²/6 = 50 × 200² / 6 = 50 × 40,000 / 6 = 333,333 mm³
2. fb = M/S = 12 × 10⁶ / 333,333 = 36 N/mm² = 36 MPa
3. Check: fb = 36 MPa > Fb = 12 MPa → FAIL

**Design Action:** Member is undersized. Increase h (depth has greatest impact due to h² term), specify higher grade, or select stiffer species.

### Worked Example: Horizontal Shear Stress Check

**Given:**
- Same timber: b = 50 mm, h = 200 mm
- Allowable shear stress: Fv = 1.2 MPa (typical for Group II)
- Applied shear: V = 15 kN = 15,000 N

**Calculate:**
1. A = bh = 50 × 200 = 10,000 mm²
2. fv = 3V/(2A) = 3 × 15,000 / (2 × 10,000) = 45,000 / 20,000 = 2.25 N/mm² = 2.25 MPa
3. Check: fv = 2.25 MPa > Fv = 1.2 MPa → FAIL

**Design Action:** Horizontal shear governs this member (more stringent than bending). Increase width (b) or height (h), or reduce span.

## Philippine Practice Context
Philippine structural designers routinely apply ASD checks to timber beams and columns. The three checks (bending, shear, compression) are performed in sequence; the most restrictive check determines sizing. For simply supported beams under uniformly distributed load, bending typically governs; for short, heavily loaded beams, shear may govern. Tabulated allowable stresses from NatCor or Philippine timber design manuals are mandatory; field engineers must always reference official sources, not rule-of-thumb values. Deflection checks (L/Δ limits) are performed separately using moment of inertia (I) and are beyond ASD stress checks but are equally important for serviceability.

## How It's Tested

### Pattern 1: Section Modulus Calculation
"A rectangular beam is 75 mm wide × 300 mm deep. Calculate section modulus S. Is the 2 in the h² term required?"
- Answer: S = bh²/6 = 75 × 300² / 6 = 1,125,000 mm³. Yes, h² is critical; using h (not h²) gives wrong capacity.
- Takeaway: Depth dominates bending. Increasing depth is more efficient than increasing width.

### Pattern 2: Bending vs. Shear Governance
"A timber beam has sufficient bending capacity but fails the shear check at fb = 8 MPa (OK) but fv = 2.5 MPa (exceeds Fv = 1.5 MPa). What design action resolves this?"
- Answer: Increase width (b) or height (h), or reduce span to lower shear force V. Bending capacity is not the limiting factor.
- Takeaway: Multiple checks must all pass. The most restrictive governs.

### Pattern 3: Unit Consistency
"A moment is given as 8 kN·m. Convert to N·mm for use in S (in mm³). Does dimensional analysis confirm the division M/S yields stress?"
- Answer: 8 kN·m = 8,000,000 N·mm. Stress = (N·mm) / (mm³) = N/mm² = MPa. Yes, units match.
- Takeaway: Always verify unit consistency before dividing. Mixing mm and m is a common source of errors.

<Tip>The 3/2 factor in fv = 3V/(2A) is non-negotiable for rectangular timber. Forgetting it gives half the actual maximum shear stress and is unsafe.</Tip>

## Common Mistakes

<WikiMistakeList mistakes={[ "Using fv = V/A instead of fv = 3V/(2A). The 3/2 factor is mandatory for rectangular sections and accounts for non-uniform shear distribution.", "Computing S = bh/6 instead of S = bh²/6. Missing the exponent on h loses the dimension entirely and gives wrong results by orders of magnitude.", "Confusing I (moment of inertia, in mm⁴) with S (section modulus, in mm³). I is for deflection; S is for bending stress.", "Applying nominal dimensions in S calculation instead of actual dimensions. Nominal 2×4 is 1.5×3.5 actual; mismatch invalidates results.", "Forgetting that allowable stresses (Fb, Fv, Fc) are tabulated, not calculated. Never derive Fb from other parameters; always look it up from a design table.", "Checking one stress (e.g., bending) and ignoring others (shear, compression). All three must pass simultaneously." ]} />