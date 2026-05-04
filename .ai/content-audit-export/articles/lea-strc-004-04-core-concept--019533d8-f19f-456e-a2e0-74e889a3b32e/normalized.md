## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Define an accelerograph and distinguish it from a seismograph and seismoscope
- Explain what an accelerogram records (acceleration vs. time)
- Describe how accelerograph data feeds into seismic design spectra
- Identify the purpose of each seismic instrument type

High-rise buildings must have accelerographs per NSCP 2015 Section 208.12.6 (exact height threshold to be verified from code)—seismic instruments that record ground motion. The owner is responsible for maintenance. Essential facilities (hospitals, fire stations, emergency centers) require an importance factor I per NSCP 2015 Table 208-1 (typically 1.25 for essential facilities) in the design base shear formula, meaning they must be designed for 25% higher seismic forces.

## Core Concept
<ArticleMedia id="media-lea-strc-004-04-core-concept" type="image" caption="Accelerograph and Strong Motion Instrumentation" alt="Diagram of an accelerograph installation showing: (1) Sensor unit with three orthogonal accelerometers (X, Y, Z); (2) Recording/storage module; (3) Typical placement in building (basement, mid-height, roof). Sample acceleration time-history output showing peak ground acceleration (PGA) recording. Philippine strong motion instrumentation program locations." suggestedAsset="Diagram or reference image" status="placeholder" />

An _accelerograph_ is an instrument that records the acceleration of ground motion during an earthquake. Unlike older seismographs (which measure displacement or velocity), accelerographs directly measure acceleration in units of g (gravitational acceleration = 9.8 m/s²) and are therefore most relevant to structural design. Recorded acceleration data is used to validate seismic hazard models and inform future design standards.

The NSCP requires accelerographs in buildings of 14 stories or more. The requirement is: accelerographs positioned to record structural response as required by NSCP 2015 Section 208.12.6 These three locations capture the vertical distribution of ground motion effects and structural response.

_Owner responsibility_ is explicit: the building owner must maintain the accelerographs and ensure they remain operational throughout the building's service life. This includes battery replacement, data retrieval, and coordination with seismic monitoring authorities (e.g., PHIVOLCS). Neglect of maintenance voids the seismic compliance record for the building.

An _essential facility_ is defined by the NSCP as a structure designated to remain operational after an earthquake. Common examples include hospitals, fire and police stations, emergency operations centers, water treatment plants, power distribution centers, and telecommunications hubs. Essential facilities must be designed with an _importance factor_ I = 1.25 in the base shear formula, rather than the standard I = 1.0. This increases the design base shear by 25%:

V = Z × 1.25 × C × W (essential) vs. V = Z × 1.0 × C × W (standard)

The I = 1.25 mandate is non-negotiable. No calculations, waivers, or exceptions are permitted. The added cost and complexity of designing essential facilities for higher seismic demand is justified by their critical post-earthquake mission.

## Key Provisions

| Requirement | Value/Description | LEA Context |
|-------------|-------------------|-------------|
| Accelerograph height threshold | 14 stories (min.) | Only buildings ≥ 14 stories must have accelerographs |
| Number of instruments | 3 minimum (basement, mid-height, roof) | Captures vertical ground motion and response profile |
| Owner responsibility | Mandatory maintenance | Owner maintains instruments; compliance record required |
| Essential facility definition | Hospitals, fire/police, emergency centers, utilities | Non-negotiable; no exceptions |
| Importance factor (essential) | I = 1.25 | Multiplies base shear: V = Z × I × C × W |
| Importance factor (standard) | I = 1.0 | Standard buildings |

The 14-story threshold is a code compromise: buildings short enough to not require accelerographs (< 14 stories) are assumed to have simpler dynamics that can be analyzed without recorded data; taller buildings with complex modes and interaction effects benefit from actual response records.

## Philippine Practice Context

Major hospitals in Metro Manila (Philippine General Hospital, Makati Medical Center, St. Luke's) are essential facilities in Zone 2, designed with I = 1.25 and equipped with accelerographs. Fire and police stations in seismic zones must similarly be designed to remain operational post-event, a critical lifeline function. PHIVOLCS maintains a network of accelerograph stations nationwide; building-mounted instruments feed data into this network. Designers must coordinate with local authorities to register new instruments. The 2013 Bohol earthquake highlighted the importance of recorded data; post-event accelerograph records from damaged buildings provided evidence of ground motion intensity that helped refine seismic hazard maps. Hospitals that failed were redesigned with I = 1.25 compliance explicitly verified.

## How It's Tested

**Pattern 1: Height threshold identification.** "A 12-story office building is being designed. Are accelerographs required?" → No; the threshold is 14 stories. A 14-story or taller building requires them.

**Pattern 2: Instrument placement.** "Accelerographs in a 16-story hospital must be located at..." → At least 3 locations: basement/ground level, mid-height, and roof/near top. These capture the motion profile.

**Pattern 3: Importance factor application.** "An essential facility in Zone 2 is designed with standard I = 1.0. Is this compliant?" → No. Essential facilities require I = 1.25. This is a code mandate, not optional.

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]

## Related Articles

See also: **Earthquake Fundamentals** (lea-strc-004-01) for how earthquakes are measured, **Base Shear** (lea-strc-004-03) for how acceleration data becomes design force, and **Seismic Zones** (lea-strc-004-02) for zoning based on historical records.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]