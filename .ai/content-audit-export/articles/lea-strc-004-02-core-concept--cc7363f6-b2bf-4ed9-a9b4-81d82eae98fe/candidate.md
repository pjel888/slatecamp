## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Name the two seismic zones in the Philippines per NSCP 2015
- State the seismic zone value Z for Zone 1 and Zone 2
- Identify which provinces are in Zone 1 (lower risk)
- Explain how seismic zoning affects base shear calculation

The Philippines uses a 2-zone seismic system. Zone 1 is low-hazard (Z = 0.2); Zone 2 is high-hazard (Z = 0.4). The LEA tests zone lists, Z factors, and why they matter for base shear calculation.

## Core Concept
<ArticleMedia id="media-lea-strc-004-02-core-concept" type="image" caption="Philippine Seismic Hazard Map — NSCP 2015 Zones" alt="Map of the Philippines color-coded by NSCP 2015 seismic zone: Zone 1 (Z=0.2) in green — Palawan, Tawi-Tawi, Sulu; Zone 2 (Z=0.4) in red — all other provinces. Major active faults (Philippine Fault Zone, Valley Fault System) and historical earthquake M6+ events shown. Base shear formula inset showing Z coefficient application." suggestedAsset="Diagram or reference image" status="placeholder" />

The NSCP 2015 divides the Philippines into two seismic zones based on historical earthquake frequency and hazard. Each zone is assigned a seismic zone coefficient _Z_, which multiplies the design base shear directly.

_Zone 1_ (Z = 0.2) covers the low-hazard periphery: Palawan, Tawi-Tawi, and Sulu. These three provinces are geologically separated from the main Pacific Ring of Fire corridor; seismic activity is lower.

_Zone 2_ (Z = 0.4) covers all other locations in the Philippines—including Batanes, the entire central and eastern spine where the Philippine Fault, subduction interfaces, and active faults dominate. This is the MOST SEVERE zone and applies to Metro Manila, Visayas, Mindanao's populated centers, Batanes, and Luzon's western regions. Z = 0.4 is the most common design case in practice.

The design base shear formula is V = Z × I × C × W, where Z is the zone coefficient, I is the importance factor (1.0 or 1.25), C is the seismic response coefficient, and W is the effective weight. Doubling Z doubles the design force; this is why zone assignment is critical.

**NSCP 2015 Update Note:** The 2015 edition introduced spectral acceleration maps (Ss and S1 at various return periods) to replace the older zone system. However, the LEA still tests the 2-zone system as it appears in most training materials and prior exams. In practice, designers should verify which approach applies to their jurisdiction, but the 2-zone Z factors are the basis of the curriculum.

## Key Provisions

| Zone | Z Factor | Primary Locations | Seismic Character |
|------|----------|-------------------|-------------------|
| Zone 1 | 0.2 | Palawan, Tawi-Tawi, Sulu | Low-hazard periphery; separated from main Ring of Fire |
| Zone 2 | 0.4 | All other Philippines (Metro Manila, Visayas, Mindanao central, Luzon spine) | High-hazard; active faults, subduction zones; MOST SEVERE |

The Z factor scales the base shear directly: V = Z × I × C × W. A designer in Zone 2 uses Z = 0.4; a designer in Zone 1 uses Z = 0.2. The difference in design forces is 100%.

Zone 2 design is more stringent. Nearly all commercial and institutional buildings in the Philippines are in Zone 2 because Zone 1 covers only remote island provinces.

## Philippine Practice Context

Metro Manila, Cebu, Davao, and Iloilo (major population and commercial centers) are all in Zone 2, Z = 0.4. The 1990 Luzon earthquake, 2013 Bohol earthquake, and 1645 Makati event all occurred in Zone 2 regions, validating the higher seismic hazard assignment. Structural engineers in the Philippines routinely apply Z = 0.4 as the baseline for design unless the project is specifically in Palawan or the southernmost island groups. Building code compliance requires verification of zone location before establishing design parameters.

## How It's Tested

**Pattern 1: Zone location identification.** "A structure is being designed in Cebu City. Which seismic zone applies, and what is the Z factor?" → Zone 2, Z = 0.4 (all locations except Palawan, Tawi-Tawi, Sulu).

**Pattern 2: Z factor scaling.** "Compare the design base shear for an identical building in Zone 1 versus Zone 2, holding all other parameters constant." → V(Zone 2) = 2 × V(Zone 1) because Z doubles.

**Pattern 3: Exception identification.** "Which Philippine province is assigned Zone 1 (Z = 0.2)?" → Palawan, Tawi-Tawi, or Sulu (only three provinces; all others — including Batanes — are Zone 2).

<Tip>Think of it as core vs. periphery. The center of the Philippines (where most people and buildings are) is Zone 2, Z = 0.4. Only three provinces far from the main fault systems are Zone 1, Z = 0.2: Palawan, Tawi-Tawi, Sulu. Zone 1 is the exception, not the rule. Batanes is in Zone 2 despite being peripheral — its proximity to Taiwan's seismic zone drives higher hazard.</Tip>

## Related Articles

See also: **Earthquake Fundamentals** (lea-strc-004-01) for basic seismology, **Base Shear** (lea-strc-004-03) for how zone values enter design formulas, and **Live Load** (lea-strc-004-05) for how occupancy affects seismic mass.

## Common Mistakes

<Warn>These are frequently tested traps. Memorize them to avoid losing easy points on exam day.</Warn>

<WikiMistakeList mistakes={["Confusing Zone 1 and Zone 2 as having equal hazard. Zone 2 is TWICE as hazardous (Z = 0.4 vs. 0.2) and covers nearly all of the Philippines.","Thinking Batanes is in Zone 1 because it is a peripheral province. Batanes is in Zone 2 (Z = 0.4) due to proximity to Taiwan's seismic zone. Only THREE provinces are Zone 1: Palawan, Tawi-Tawi, Sulu.","Using Z = 0.3 or 0.5. The NSCP specifies only Z = 0.2 (Zone 1) and Z = 0.4 (Zone 2). No intermediate values.","Assuming the location's population size determines the zone. Zone is determined by seismic hazard, not city importance. Palawan is Zone 1 even though it has populated centers.","Treating spectral accelerations (Ss, S1) as equivleant to Z factors. NSCP 2015 introduced hazard maps, but the LEA tests the 2-zone system with Z = 0.2 and 0.4."]} />