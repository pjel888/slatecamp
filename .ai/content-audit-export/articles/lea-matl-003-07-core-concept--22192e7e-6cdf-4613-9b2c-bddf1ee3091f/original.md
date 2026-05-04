## What You Need to Know for the LEA
## Learning Goal

Classify structural bolt types (A325, A490, A307) by grade, installation method (snug-tight, pretensioned, slip-critical), and application, and identify nut and washer specifications for steel-to-steel connections per NSCP 2015.
## Core Concept

Structural bolts join steel members through frictional force (slip-critical connections) or bearing stress (bearing connections).
The bolt preload (tension) is critical to connection performance. Under-tensioned bolts slip under load, increasing deformation and risking connection failure.
Over-tensioned bolts risk bolt rupture. Proper installation methods ensure consistent, predictable preload.

### Bolt Grades and Material Properties

_ASTM A307_ — The entry-level structural bolt specification.
Provides minimum tensile strength of 60 ksi (410 MPa) for Grade A. Yield strength is not uniformly specified across A307 grades;
Grade A is intended for general-purpose applications. Consult ASTM A307 or ASTM F1554 (modern replacement for Grade C anchor bolts) for specific grade properties.
Used for low-stress connections (gust bracing, light service conditions) where cost minimization is critical.
Not suitable for primary load-carrying connections in buildings or bridges.

_ASTM A325_ — The standard structural bolt for high-strength connections.
Provides 120 ksi (830 MPa) minimum tensile strength for 1/2" to 1" diameter, 105 ksi (724 MPa) for 1-1/8" to 1-1/2" diameter;
92 ksi (635 MPa) minimum yield strength for 1/2" to 1" diameter, 81 ksi (559 MPa) for 1-1/8" to 1-1/2" diameter.
The 1.25 multiplier (ratio of proof load to yield) permits tension-control (TC) installation without risk of premature bolt rupture.
A325 is compatible with hot-dip galvanizing (ASTM A153), making it ideal for bridge work, outdoor structures, and corrosion-sensitive environments.
The 3/4" (19 mm) and 7/8" (22 mm) diameters are most common in Philippine construction.
_ASTM A490_ — Premium high-strength bolt. Provides 150–170 ksi (1035–1172 MPa) tensile strength range, 130 ksi (895 MPa) minimum yield strength.
Used when maximum joint stiffness, minimum member deformation, or compact connection geometry is critical (tall buildings, long-span bridges).
A490 bolts MUST NOT be galvanized or electroplated; hydrogen embrittlement risk creates brittle failure.
A490 is reserved for protected environments or where stainless alternatives are economically justified.
_ASTM F3125_ (Consolidated Standard) — Combines A325, A325M, A490, A490M, F1852, and F2280 specifications.
F1852 (120 ksi TC bolts) and F2280 (150 ksi TC bolts) are the modern tension-control equivalents to A325 and A490.

### Installation Methods

_Snug-Tight Installation_ — The bolt is tightened until all visible slack is removed.
Snug-tight provides minimal preload (typically 25% of final pretension required). Used for light connections, lightly stressed members, or temporary bracing.
Snug-tight is simple but provides minimal friction and is inappropriate for primary load-carrying connections.
_Turn-of-Nut Installation_ — A calibrated wrench tightens the bolt to achieve a known reference tension, then the nut is rotated an additional 1/3 to 1/2 turn (depending on specification) to achieve final pretension of approximately 70% of the bolt's proof load per AISC specification.
This method is labor-intensive and requires careful calibration but was historically standard.
_Calibrated Wrench Installation_ — A hydraulic or pneumatic wrench is calibrated to rotate the nut to a predetermined torque value that produces the desired bolt tension.
The method is faster than turn-of-nut and more consistent if wrench calibration is maintained.
Wind or operator inconsistency can introduce variation.

_Tension-Control (TC) Installation_ — Modern, high-precision method using a pneumatic or electric "TC gun" (shear wrench).
The bolt's splined end breaks off when the predetermined tension is reached, providing visual confirmation of proper preload without requiring wrench re-calibration.
TC bolts are designed (ASTM F1852 for 120 ksi, F2280 for 150 ksi) so the spline breaks at approximately 90% of proof load (approximately 70–80% of ultimate tensile strength), ensuring consistent, safe preload.
Installations are 3–4 times faster than calibrated wrench, eliminating wrench drift and operator error.
TC is increasingly standard in Philippine fabrication shops and high-volume projects.

### Bearing vs. Slip-Critical Connections

_Bearing Connections_ rely on bolt tension to maintain joint integrity during installation.
Once connected, bolts transfer load through bearing (compression) on the bolt shank against the plate material. Friction plays no role.
The bolt may slip slightly under load, increasing deformation. Bearing connections are economical and used for most primary structural connections (floor beams to columns, diagonal bracing).
_Slip-Critical Connections_ rely entirely on friction between connected surfaces to transfer load.
The connection must not slip under any service load. High preload is maintained throughout the member's life.
Slip-critical is required when:

- Connections must remain rigid under load (connections in seismic frames, suspension systems)
- Bolt slippage would trigger vibration or fatigue failure (crane runway girders, bridge expansion joints)
- Service loads approach or exceed friction capacity

Slip-critical design requires Class A or Class B surface conditions (per AISC/AWS) to ensure consistent friction coefficients.
Galvanizing, paint, or rust can reduce friction. Slip-critical bolts are more expensive than bearing bolts due to higher preload and stricter surface preparation.

## Key Provisions

| Bolt Grade | Tensile Strength (Min.)                                                  | Yield Strength (Min.)                                                  | Typical Application                | Galvanizing                  | Preload (% Proof Load) |
| ---------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------- | ---------------------------- | ---------------------- |
| A307       | 60 ksi (410 MPa)                                                         | 36 ksi (250 MPa)                                                       | Light connections, ancillary       | Allowed                      | ~40% (Snug only)       |
| A325       | 120 ksi (830 MPa) [1/2"–1" dia.]; 105 ksi (724 MPa) [1-1/8"–1-1/2" dia.] | 92 ksi (635 MPa) [1/2"–1" dia.]; 81 ksi (559 MPa) [1-1/8"–1-1/2" dia.] | Primary structural work, bridges   | Allowed (A153)               | ~70%                   |
| A490       | 150 ksi (1035 MPa)                                                       | 130 ksi (895 MPa)                                                      | High-stiffness, compact geometry   | PROHIBITED (H-embrittlement) | ~70%                   |
| F1852 (TC) | 120 ksi (830 MPa)                                                        | 92 ksi (635 MPa)                                                       | Tension-control primary structural | Allowed                      | ~90% (auto-set)        |
| F2280 (TC) | 150 ksi (1035 MPa)                                                       | 130 ksi (895 MPa)                                                      | Tension-control premium            | PROHIBITED                   | ~90% (auto-set)        |

| Installation Method  | Preload Consistency (on Proof Load) | Speed  | Skill Required | Cost           | Field Suitability   |
| -------------------- | ----------------------------------- | ------ | -------------- | -------------- | ------------------- |
| Snug-Tight           | Low (25%)                           | Fast   | Low            | Minimum        | Temporary/light     |
| Turn-of-Nut          | Moderate (70%)                      | Slow   | High           | Moderate       | Declining use       |
| Calibrated Wrench    | Moderate–High (70%)                 | Medium | High           | Moderate       | Good                |
| Tension-Control (TC) | Very High (90%)                     | Fast   | Low–Medium     | Higher upfront | Excellent, standard |

| Connection Type | Load Transfer         | Friction Role | Slip Under Load | Typical Use                  | Cost   |
| --------------- | --------------------- | ------------- | --------------- | ---------------------------- | ------ |
| Bearing         | Bolt bearing on plate | Minimal       | Minor           | Floor beams, bracing         | Lower  |
| Slip-Critical   | Friction only         | Critical      | None            | Seismic frames, rigid joints | Higher |

## Philippine Construction Context

Philippine structural steel fabricators comply with NSCP 2015 Chapter 5, which references AISC Specification for Structural Joints Using ASTM A325 or A490 Bolts (RCSC Specification).
The 2015 NSCP adopts load-and-resistance-factor-design (LRFD) philosophy and mirror RCSC requirements closely.
A325 bolts dominate Philippine construction due to cost and galvanizing compatibility.
High-rise residential and commercial buildings in Metro Manila, Cebu, and Davao use A325 slip-critical connections for moment-resisting frames and A325 bearing connections for floor systems.
For bridges, A325 with hot-dip galvanizing (ASTM A153) ensures durability in salt-spray coastal environments.
A490 bolts appear in specialized applications: premium office towers where floor-to-floor height is minimized, long-span bridges with strict deflection limits, and tension members in suspension systems.
The prohibition on galvanizing limits A490 use in outdoor or corrosive environments unless stainless equivalents are specified.
Tension-control (TC) fasteners are increasingly adopted by Philippine fabricators (particularly those in Vleanzuela and surrounding industrial zones) for efficiency.
TC bolts reduce on-site installation labor, eliminate wrench calibration drift, and provide visual confirmation of proper preload—critical for quality assurance on high-rise projects.
NSCP 2015 Chapter 5 explicitly permits TC fasteners when fabricators have demonstrated competency.
Philippine bolts are locally sourced through steel distributors such as SteelAsia, Metal Exponents, and other regional suppliers that maintain ASTM A325 and A490 certifications.
Rivets are historically obsolete in new construction. They appear only in renovation/rehabilitation of heritage structures.
Modern construction exclusively employs bolts or welding.

## How It's Tested

The LEA evaluates bolts and fastener knowledge through:

1. _Bolt grade selection_ — Given a connection requirement (e.g., "floor beam to column bearing connection"), specify appropriate bolt grade and justify based on strength, corrosion environment, and cost.
2. _Installation method specification_ — Select and justify installation method (snug-tight, turn-of-nut, calibrated wrench, or TC) based on connection criticality and fabrication constraints.
3. _Bearing vs. slip-critical distinction_ — Identify when slip-critical is required and specify appropriate preload, surface preparation, and inspection methods.
4. _Defect recognition_ — Identify over-tensioned bolts (visible spline breakoff on TC bolts, bent fastener), under-tensioned bolts (visible gaps, slip marks on surfaces), and improper washers or lockwashers.
5. _Philippine standards alignment_ — Confirm bolt selection and installation procedures against NSCP 2015 Chapter 5 and relevant fabricator certifications.
   <Tip>
     A325 is the workhorse bolt for Philippine primary structural connections.
     Default to A325 unless the question emphasizes maximum stiffness/compact
     geometry (A490), corrosion in a protective environment (A490 stainless), or
     light connections (A307). For tension-control questions, remember that TC
     bolts break the spline automatically at approximately 90% of proof load—no
     wrench calibration or skill required. Modern high-volume fabrication in the
     Philippines increasingly specifies TC to ensure consistency and speed. For
     welding of bolted connections, see LEA-MATL-003-05.
   </Tip>

## Common Mistakes

<WikiMistakeCard
  title='Specifying A490 Without Accounting for Galvanizing Prohibition'
  body='A designer specifies A490 bolts for a bridge expecting hot-dip galvanizing for corrosion protection. A490 cannot be galvanized; hydrogen embrittlement causes brittle failure. The fabricator must either abandon galvanizing (risking rust in a marine environment) or substitute stainless bolts (tripling cost). Always verify that A490 can be used ungalvanized, or default to A325 with galvanizing for outdoor work.'
/>

<WikiMistakeCard
  title='Under-Tensioning Bolts by Specifying Snug-Tight for Primary Connections'
  body='A floor system connection specifies snug-tight installation to reduce costs. Snug-tight provides only ~25% preload, yielding minimal friction and allowing slip under load. This increases deformation, vibration, and fatigue risk. Primary connections require calibrated wrench (70% preload) or TC installation (90% preload) per NSCP 2015.'
/>

<WikiMistakeList
  items={[
    'Assuming turn-of-nut and calibrated wrench installation are equally reliable—turn-of-nut requires expert judgment and frequent wrench re-calibration; calibrated wrench relies on mechanical torque consistency; TC eliminates both concerns through automatic spline breakoff.',
    'Omitting inspection of bolt preload—under-tensioned bolts show visible gaps or slip marks on mating surfaces; over-tensioned TC bolts show incomplete spline breakoff. Visual inspection is critical and inexpensive.',
    'Mixing bolt grades in a single connection (e.g., A325 and A490)—this complicates design verification and introduces risk of preferential overload on the weaker bolts. Specify uniform bolt grade throughout.',
    'Failing to account for galvanizing availability when selecting A325 vs. A490—A325 is galvanizing-compatible (ideal for bridges, coastal work); A490 prohibits galvanizing. For outdoor/corrosive environments, A325 is the pragmatic choice.',
    "Specifying over-tensioned bolts expecting to increase connection capacity—excessive tension causes premature bolt rupture under load and does not increase capacity beyond the bolt's yield strength. Proper tension (per code) is optimum; higher preload provides no benefit and increases failure risk.",
  ]}
/>

## Related Articles

See also within Metals, Glass, and Glazing: **lea-matl-003-04-core-concept**, **lea-matl-003-05-core-concept**.

> **Overview:** See **overview-building-materials** for the full curriculum structure and study strategy. See **mastery-building-materials** for connections across topics.

