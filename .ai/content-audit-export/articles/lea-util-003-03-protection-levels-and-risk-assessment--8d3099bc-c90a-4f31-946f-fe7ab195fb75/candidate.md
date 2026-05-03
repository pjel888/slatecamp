## What You Need to Know for the LEA

## Learning Goal

Apply electrical protection levels and the fault hierarchy — short circuit, ground fault, overload, arc fault — and identify the correct protective device (circuit breaker, fuse, GFCI, AFCI, surge protector) for each type of electrical fault per PEC requirements.
## Protection Levels and Risk Assessment

Lightning protection systems are designed to one of four protection levels defined in IEC 62305 and adopted in the Philippine Electrical Code (PEC):

| Protection Level | Risk Reduction | Primary Use | Effectiveness |
|---|---|---|---|
| Level I (Highest) | 99% | High-value assets, hospitals, data centers | r = 20 m radius |
| Level II | 97% | Commercial buildings, industrial plants | r = 30 m radius |
| Level III | 91% | Residential structures, small facilities | r = 45 m radius |
| Level IV (Lowest) | 84% | Low-risk areas, storage facilities | r = 60 m radius |

_Source: IEC 62305-1:2010, adopted by PEC Part 2_

Protection level selection depends on:
- **Structure height** and exposure
- **Content value** and occupancy type
- **Lightning frequency** (isokeraunic level)
- **Consequence of failure** (loss of life, economic impact)

The Rolling Sphere Method (RSM) is the primary design approach for determining protection zones in the Philippines.

## Rolling Sphere Method (RSM)

The RSM involves "rolling" an imaginary sphere of specific radius across the structure. Any point touched by the sphere is protected; points outside are unprotected.

### Protection Radii by Level

<WikiCalloutBox title="Rolling Sphere Radii (IEC 62305-3)" variant="info">Each protection level has a defined radius: **Level I = 20 m**, **Level II = 30 m**, **Level III = 45 m**, **Level IV = 60 m**. These radii determine the maximum distance from air terminals at which protection extends. In the Philippines, Level II and III systems are most common for commercial and residential buildings.</WikiCalloutBox>

**Practical Application:**

1. Position air terminals (lightning rods) on structure edges and high points
2. Roll the sphere of appropriate radius across all surfaces
3. Surfaces touched by the sphere are protected
4. Surfaces untouched require additional air terminals or design modification

### Example 1: Protecting a Commercial Building

**Given:**
- Rectangular commercial building: 40 m long × 25 m wide × 18 m high
- Located in metro Manila (isokeraunic level: 48 thunderstorm days/year)
- Risk assessment indicates Level II protection required

**Solution:**

For Level II protection, r = 30 m (IEC 62305-3, PEC Part 2).

1. Place air terminals at roof corners: spacing no more than 2 × r = 60 m apart (PEC Article 2.90)
2. Rolling the 30 m sphere across the 18 m high roof shows:
   - Corners and edges: protected (sphere touches)
   - Roof center: check protection angle

3. Protection angle (cone angle) from vertical:
   - Level II: α = 35° from vertical (IEC 62305-3)
   - At 18 m height: cone base radius = 18 × tan(35°) = 12.6 m
   - Central roof area within 12.6 m of vertical centerline: protected

4. **Result:** One air terminal at each of the four corners covers the entire 40 × 25 m roof under Level II protection with RSM.

**Down Conductor Sizing:**
- Minimum conductor: 35 mm² copper or 50 mm² aluminum (Class I main conductors per Table 2.90.3.4); 14 mm² copper minimum for bonding (PEC Article 2.50)
- Route conductors along building edges at ≤25 m spacing
- Four corner conductors serve this building

**Grounding:**
- Resistance target: low resistance per good engineering practice (NFPA 780); PEC does not specify numerical value
- Rod depth: 2.5–3 m minimum in Manila clay soil (typical 100–150 ohms·m resistivity)
- Install two parallel 16 mm rods with interconnecting strap to achieve ≤10 ohms

---

### Example 2: Protecting a Residential High-Rise Tower

**Given:**
- Residential tower: 20 m × 20 m footprint, 60 m tall (20 stories)
- Located in Cebu (isokeraunic level: 55 thunderstorm days/year)
- Level II protection required due to occupancy and height

**Solution:**

For Level II: r = 30 m, protection angle α = 35°

1. **Air Terminal Placement:**
   - Minimum spacing: 2 × r = 60 m
   - Building footprint 20 m: single air terminal at geometric center insufficient (sphere 30 m radius cannot be rolled across all roof edges without overhang)
   - Solution: place air terminals at all four roof corners + one center (total 5 terminals)

2. **Verification with RSM:**
   - Sphere 30 m radius centered at each corner touches roof edge points 21.2 m away along edges
   - Center terminal at (10 m, 10 m) covers interior points >15 m from edges
   - Entire 20 × 20 roof: protected

3. **Down Conductor Network:**
   - Four perimeter conductors at each corner
   - Center conductor from center terminal
   - Horizontal roof conductor mesh spacing ≤25 m (forms structural cage)
   - Total: 5 down conductors to independent grounding electrodes

4. **Grounding:**
   - Five independent ground rods, each 3 m deep, in Cebu volcanic soil (estimated 80–120 ohms·m)
   - Each rod: R ≈ (resistivity / length) = 100 / 3 ≈ 33 ohms (single rod unacceptable)
   - Solution: at each location, use two parallel rods with interconnect:
     - R_parallel = R_single / 2 = 16.5 ohms (still >10 ohms target)
   - At corner: use two rods parallel + horizontal strap to adjacent corner rod clusters
   - Ring conductor around building base connects all electrode clusters
   - Measured system resistance: 6–8 ohms (meets PEC requirement)

5. **Internal Bonding:**
   - All metal roof equipment (HVAC units, satellite dishes, elevator penthouse frame) bonded to down conductor system
   - Metal water/gas lines inside tower bonded to grounding network at entry points

---

## Protection Angle Method (Alternative)

For simpler structures, the protection angle method may be used. An air terminal at height h protects a cone-shaped zone below it:

**Protection Angle α by Level:**
- Level I: α = 25°
- Level II: α = 35°
- Level III: α = 45°
- Level IV: α = 60°

_Source: IEC 62305-3, PEC Part 2_

At ground level, protection radius = h × tan(α)

**Example:** 12 m tall air terminal (Level III, α = 45°)
- Protected radius at ground = 12 × tan(45°) = 12 m diameter circle
- Effective only for structures ≤12 m height

This method is less accurate for irregular surfaces; RSM is preferred in Philippine practice.

## Mesh Method

For large roof areas, a protective mesh of conductors can be laid directly on the surface:

- **Conductor material:** 16 mm² copper or 25 mm² aluminum minimum
- **Mesh spacing:** 5 m × 5 m for Level I; 10 m × 10 m for Levels II–IV
- **Purpose:** Creates redundant current paths; if one air terminal fails, others carry strike current
- **Common use:** Industrial plants, data centers, hospital roofs

All mesh conductors must bond to down conductor network at multiple points.

## System Components

### 1. Air Terminals (Lightning Rods)

**Design per PEC Article 2.50:**
- Minimum length: 10 inches (0.25 m) minimum per PEC Table 2.90.3.4 above highest point of protected structure
- Sharp point preferred over ball terminal (contested; IEC 62305 allows both)
- 35 mm² copper or equivalent per Table 2.90.3.4
- Spacing: ≤2 × radius (Level II: ≤60 m apart)

**Material Options:**
- Copper: preferred (durability, conductivity)
- Aluminum: acceptable per PEC (lighter, corrosion risk in coastal areas)
- Stainless steel: acceptable (lower conductivity than copper, 1.5× cross-section required)

**Installation Height:**
In the Philippines, air terminals must extend above:
- Building roof line by ≥0.5 m
- Antennas, microwave dishes, flagpoles
- Tree canopy (if trees nearby)

<Tip message="In tropical regions, inspect air terminal connections annually for corrosion at copper-aluminum interfaces. Use bimetallic washers and anti-oxidant compound." />

### 2. Down Conductors

**Minimum Conductor Size (PEC Part 2):**
- Copper: 16 mm² (≈4 mm diameter)
- Aluminum: 25 mm² (≈5.5 mm diameter)
- Steel: 50 mm² (higher resistivity)

**Routing:**
- Run along exterior of building (shorter, more direct path to ground)
- Secure every 1 m with non-corrosive clips
- Avoid sharp bends (radius >0.2 m preferred per NFPA 780)
- Maintain at least 1.8 m clearance from windows and doors
- Never run inside occupied spaces (safety: voltage rise during strike)

**Bonding:**
- Bond all large metal objects to down conductor system:
  - Metal roof panels, gutters, downspouts
  - Metal door/window frames
  - HVAC housings, antenna masts
  - Satellite dishes, solar panel frames
- Use ≥16 mm² copper straps or wire, bonded within 2 m of object

**Number of Down Conductors:**
- Minimum: 2 (redundancy)
- Preferred: one per corner of rectangular building
- Large structures: use mesh or multiple equally-spaced conductors (≤25 m spacing)

### 3. Grounding Electrodes

**Ground Resistance Target (PEC, NFPA 780):**
- ≤10 ohms maximum for safety and current distribution

**Design Approach for Philippine Soil Conditions:**

The Philippines has diverse soil resistivity:
- Metro Manila: clay, 100–150 ohms·m
- Cebu / Visayas: volcanic soil, 80–150 ohms·m
- Northern Luzon: loamy, 50–100 ohms·m
- Davao region: volcanic/alluvial, 60–120 ohms·m

For a single 3 m driven rod:
- R = resistivity / length ≈ 100 / 3 ≈ 33 ohms (unacceptable alone)

**Common Solutions:**

1. **Parallel Rod Array**
   - Two parallel 3 m rods with interconnecting strap
   - Reduced resistance: R ≈ R_single / 1.5 ≈ 22 ohms (still marginal)

2. **Deep Rod + Shallow Rods** (Preferred in Philippines)
   - One 4–5 m deep rod (reaches wetter soil layers) = ~20 ohms
   - Two 3 m rods in parallel near surface = ~16 ohms
   - Interconnect both clusters with horizontal strap
   - Effective: R ≈ 8–10 ohms

3. **Ring Electrode**
   - Horizontal loop of 16 mm² copper buried 0.8 m deep around building perimeter
   - Provides better voltage distribution
   - Practical for buildings with accessible surroundings
   - Typical cost-benefit for mid-sized structures

4. **Concrete-Embedded Electrode** (Modern approach)
   - Rod embedded in building's structural concrete foundation
   - Concrete acts as moisture reservoir (reduces resistivity effect)
   - Effective in dry-season regions
   - Requires design planning at construction phase

**Installation Standards:**
- Rod diameter: 16 mm copper or 12.7 mm steel (PEC minimum)
- Depth: minimum 2.5 m (often 3–4 m in Philippines)
- Spacing (if multiple rods): ≥1.5 × rod length (3 m rod = 4.5 m minimum spacing)
- Test ground resistance after installation with clamp-on earth tester

<Example title="Ground Resistance Calculation">
**Scenario:** Metro Manila building with clay soil (resistivity 120 ohms·m), requires ≤10 ohms.

**Rod specification:** Two 3.5 m deep copper rods, 16 mm diameter, spaced 5.5 m apart (1.5× length rule).

**Calculation:**
- Single rod: R = ρ / L = 120 / 3.5 ≈ 34 ohms
- Two rods in parallel (approximate): R_parallel ≈ 34 / 2 = 17 ohms (overestimate; actual lower due to spacing reduction factor)
- With spacing factor k ≈ 0.6: R ≈ 17 × 0.6 ≈ 10.2 ohms (marginal)

**Improvement:** Add horizontal strap or ring conductor buried 1 m deep around rod cluster.
- Ring adds ~5 ohms capacitance (parallel path)
- Final system: R ≈ (10.2 × 5) / (10.2 + 5) ≈ 3.4 ohms (well below 10 ohm target)

**Test:** Verify with clamp-on tester at three points on system perimeter; all ≤10 ohms confirms compliance.
</Example>

## Zone of Protection

The protected zone is the volume surrounding an air terminal where strike current is intercepted.

**Key Parameters:**

1. **Height of Air Terminal (h)**
   - Extends ≥0.5 m above highest part of protected structure (PEC)

2. **Protection Radius (varies by method)**
   - RSM: r = sphere radius (20–60 m by level)
   - Protection angle: radius = h × tan(α) at ground level

3. **Lateral Extent**
   - At apex of cone, protection radius = r (RSM) or h × tan(α) (angle method)
   - Decreases linearly toward ground for certain structures
   - "Shadow zones" behind chimneys, protrusions unprotected until secondary air terminal added

<WikiCalloutBox title="PD 1096 Requirements for Tall Buildings (UK Standard, Reference)" variant="warning">PD 1096 does not specify LPS; PEC references NFPA 780 (45m RSM radius) for all structures. For tall residential towers and commercial buildings exceeding 50 m in Philippine cities, use RSM with Level II protection minimum. Mesh conductor spacing ≤10 m required on roofs of structures >50 m to ensure comprehensive coverage and current distribution redundancy.</WikiCalloutBox>

### Calculating Unprotected Areas

For irregular roof shapes (L-shaped, multi-level buildings), identify unprotected zones and either:
1. Add secondary air terminals
2. Install mesh conductors in shadow zones
3. Accept risk if zone is non-critical (e.g., storage shed attached to main structure)

**Rule of Thumb:** If a zone cannot be reached by RSM from any single air terminal, add a dedicated terminal or extend mesh.

## Bonding and Interconnection

All metal components within or on the structure must be bonded to the LPS network:

**Mandatory Bonding:**
- Metal roof panels and decking
- Gutters and downspouts
- Metal door and window frames (exterior, ≥1 m² area)
- HVAC casings, ductwork
- Satellite dishes, antennas, flagpoles
- Solar panel mounting frames
- Metal railings and balustrades
- Elevator guide rails (if metal, bond to down conductor at building entry)

**Bonding Method:**
- Direct connection: ≥16 mm² copper wire or ≥25 mm² aluminum within 2 m of metal object
- Minimum length requirement: as short as practicable
- Bonding conductor must have same conductivity class as down conductor (no undersizing)

**Surge Protection Device (SPD) Coordination:**
- SPDs at service entry and distribution boards
- Coordinate with grounding system (same ground electrode preferred)
- Per PEC Part 2, Article 2.50: ≤1 kV coordination voltage recommended for LPS + SPD system
- Separation distance from LPS: ≥0.5 m in open air, or in conduit with 50 mm solid insulation

## Maintenance and Testing

<Warn message="Lightning protection systems deteriorate over time. Annual inspection and 5-year comprehensive testing are mandatory in the Philippines per PEC guidelines." />

**Annual Inspection Checklist:**
- Visual inspection of all air terminals (corrosion, damage, secure mounting)
- Down conductor connections secure, no looseness at termination points
- Bonding straps intact, connections tight (use torque wrench: ≥5 N·m for M8 bolts)
- Grounding electrode area clear of obstruction (mounding, paving interferes with moisture)
- Check for vegetation or structures creating new "shadow zones" near air terminals

**5-Year Comprehensive Test:**
- Measure ground resistance with clamp-on tester (≤10 ohms required)
- Measure down conductor resistance (continuity check; expect &lt;1 ohm per 10 m run)
- Megger test between down conductor and earth (minimum 100 MΩ at 500 V DC confirms insulation integrity)
- Inspect air terminal and base hardware for corrosion; replace if corroded >10% of original section

**Test Equipment (Minimum for Philippine LEA Certification):**
- Digital clamp-on earth tester (range 0.01–200 ohms)
- Digital multimeter with continuity function
- Insulation tester (Megger type)

## Philippine Context: High Isokeraunic Regions

The Philippines experiences one of the world's highest thunderstorm frequencies:

- **Metro Manila / NCR:** 40–48 thunderstorm days/year (PEC reference data)
- **Cebu / Central Visayas:** 50–60 thunderstorm days/year
- **Davao / Southern Mindanao:** 45–55 thunderstorm days/year
- **Cagayan Valley / Northern Luzon:** 35–45 thunderstorm days/year
- **Mountain regions (Cordillera, southern Leyte):** 60–80 thunderstorm days/year

This high frequency makes lightning protection design critical for:
- All buildings >15 m height in high-risk zones
- Any structure with critical operations (hospitals, data centers, power substations)
- Structures containing hazardous materials

For buildings in isokeraunic zones >50 days/year (most of Philippines):
- Default to Level II protection (IEC 62305 risk analysis often recommends Level II)
- Use RSM method (more reliable than angle method for tall structures)
- Install ≥2 redundant down conductors
- Use deep grounding (4–5 m rods) to reach reliable soil layers

## Common Mistakes and Corrections

EC) Part 2, Article 2.50 mandates lightning protection systems for structures exceeding 23 m (Class II per PEC Article 2.90) or in high-risk isokeraunic zones. The design process follows IEC 62305 methodology:

**Design Steps (IEC 62305-2 Risk Analysis):**
1. Determine lightning protection level based on risk assessment (Level I–IV)
2. Calculate protection zones (RSM, angle method, or mesh method)
3. Design air terminals, down conductors, and grounding
4. Specify bonding of metal components
5. Document system with single-line schematic and material specifications

**Certification Requirements for Philippine LEA:**
- All design calculations must cite PEC or IEC 62305 standards
- Ground resistance testing (clamp-on method) required before commissioning
- Maintenance plan and annual inspection schedule mandatory
- Professional engineer (PE) stamp required on design drawings

<Callout type="info" title="Design Documentation Package">For any structure requiring LPS in the Philippines, prepare:**• Building layout with LPS component locations (plan and elevation views)• Air terminal specifications and placement rationlea (RSM verification)• Down conductor routing and bonding schedule• Grounding electrode design and soil resistivity test results• Calculated zone of protection diagram• Maintenance schedule and testing intervals• Compliance statement referencing PEC Part 2 and IEC 62305**This package becomes the basis for LEA licensing exam questions and site inspection.** </Callout>

---

## Summary

Lightning protection systems in the Philippines integrate three design methods (RSM, angle, mesh) to create safe, redundant networks intercepting strikes and dissipating current to earth. Protection levels range from Level I (20 m radius, highest safety) to Level IV (60 m radius, basic coverage). High Philippine thunderstorm frequency (40–80 days/year depending on region) necessitates robust design; Level II protection and dual down conductors are baseline minimums. Ground resistance ≤10 ohms is non-negotiable, requiring careful electrode design in Philippine soil conditions (clay, volcanic, loamy resistivity 50–150 ohms·m). Bonding all metal components ensures current distribution and eliminates dangerous side flashes. Annual inspection and 5-year comprehensive testing maintain system integrity throughout building life. Compliance with PEC Part 2 and IEC 62305-1/3 is mandatory for design and operation in the Philippine context.

## Related Articles

See also within Electrical Systems: **lea-util-003-02-core-concept**, **lea-util-003-04-core-concept**, **lea-util-003-05-core-concept**, **lea-util-003-06-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.

