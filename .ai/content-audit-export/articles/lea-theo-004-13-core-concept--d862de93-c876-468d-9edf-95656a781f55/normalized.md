## What You Need to Know for the LEA

## Learning Goal

Design sun shading devices for tropical buildings — horizontal overhangs, vertical fins, egg-crate screens, louver systems — and calculate how each device type reduces solar heat gain by 40-70% while maintaining adequate daylighting.
## Core Concept

### Solar Shading Fundamentals

<ArticleMedia id="media-lea-theo-004-13-core-concept" type="image" caption="Sun Shading Device Typology — Horizontal, Vertical, Egg-Crate, Light Shelves" alt="Four-panel reference diagram: (1) Horizontal Overhangs/Louvers — fixed or angled shelves above windows, effective for south facades at high sun angles, with formula Depth = Window Height × tan(solar altitude); (2) Vertical Fins — perpendicular elements blocking low-angle morning/afternoon sun, essential for east/west facades; (3) Egg-Crate Screens — three-dimensional grid combining horizontal and vertical elements for full shading, with Le Corbusier's Chandigarh example; (4) Light Shelves — reflective horizontal surfaces bouncing daylight to ceiling and deep interior (12-15m penetration). Each panel shows: geometric diagram, solar angle interaction, heat gain reduction percentage (40-70%), and architectural example." suggestedAsset="Diagram or reference image" status="placeholder" />

### Solar Shading Fundamentals

Solar shading controls **direct radiation** (energy arriving straight from sun disk) while admitting **diffuse radiation** (scattered by atmosphere). In tropical climates, direct radiation accounts for 60–75% of solar heat gain; blocking this while maintaining diffuse light is the central optimization challenge.

[SLATECAMP_UI_BLOCK:ui_0002 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Testable hierarchy for Philippine shading priority: (1) West facade is worst (600–800 W/m², afternoon peak when outside temperature is highest), (2) East facade is second-worst (600–800 W/m², early morning but duration is shorter), (3) South facade is least critical (300–450 W/m², high sun angle reduces penetration depth). Shading design should allocate deepest overhangs to west, adequate-but-less-deep to east, minimal-adequate to south. This priority order is frequently tested.

#### Why Shading is Critical in Tropical Architecture

In the **Philippine climate**, solar radiation intensity peaks at:
- **Exterior horizontal surface**: 850–950 W/m² (clear-sky noon, Apr–May in Coronas Type I)
- **South vertical facade (14.6°N latitude)**: 300–450 W/m² (due to high solar altitude; low-latitude sun angles minimize vertical facade exposure)
- **East/West vertical facades**: 600–800 W/m² (peak at 6–9 AM east; 3–6 PM west)

[SLATECAMP_UI_BLOCK:ui_0003 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: The 3,600W calculation (10 m² east window, 600 W/m² incident, 60% transmission) assumes clear-sky conditions. During monsoon (Type I habagat, May–Oct), cloud cover reduces direct radiation 20–40%, making shading less critical. This variation is rarely highlighted but affects BERDE energy modeling—Type III areas with pronounced dry season benefit from seasonal adjustable shading; Type II/IV with perpetual cloud require less aggressive shading to maintain daylighting.

Unshaded glass windows transmit 50–70% of this radiation as heat. A 10 m² east-facing window receives:
- 6 AM radiation: 600 W/m² × 10 m² × 0.6 transmission = **3,600 W** (equivalent to 1 ton air conditioning)

**Shading effect**: Reducing solar transmission from 60% to 15% eliminates 4,050 W of heat gain—equivalent to operating 1 ton of AC unit continuously. For an office building with 200 m² of glazing, effective shading saves 40–80 kW of instantaneous cooling demand.

### Brise-Soleil (Sun Breaker)

The **brise-soleil** is a fixed or adjustable external screen creating shadow patterns that evolve as solar position changes throughout the day and year.

#### Le Corbusier's Chandigarh Approach

In the **Capitol Complex, Chandigarh** (1951–1965), Le Corbusier developed brise-soleil as an integrated facade strategy:

**Geometric Principles**:
- **Thick concrete shelves** (0.5–1.5 m) projecting from vertical surfaces
- **Egg-crate patterns**: Three-dimensional grid combining horizontal and vertical elements
- **Dynamic shadows**: Shadow patterns change every hour, creating visual interest while controlling heat
- **Material expression**: Massive concrete reveals architectural intent and weather-induced patina

**Solar Performance**:
- Summer noon sun (high altitude) creates deep shadows under horizontal elements; minimal penetration
- Winter sun (lower altitude) penetrates more but at longer angles; horizontal shelves still block upper portions
- East/west facades receive aggressive vertical fins that block morning/afternoon sun while admitting diffuse light

**Architectural Effect**:
The brise-soleil is not hidden mechanical element but **expressed facade feature**—geometric patterns define building identity. Photography reveals shadow movement across day; the building becomes a "sundial."

#### Designing Brise-Soleil for Philippine Latitudes

Philippine latitude (5°N–20°N) differs critically from Chandigarh (31°N):

**Winter Solstice Solar Altitude** (Dec 21, noon):
- Chandigarh (31°N): 36°
- Manila (14.6°N): 59.5°
- Davao (~7°N): 67°

This **23° altitude difference** means Philippine winter sun is still steep. Brise-soleil effective at Chandigarh would be ineffective in Manila—a deep 1.5 m overhang adequate for 36° sun angle is excessive for 59.5° altitude.

[SLATECAMP_UI_BLOCK:ui_0004 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Do not directly apply Chandigarh-derived brise-soleil dimensions to Philippine buildings. The 23° latitude difference means Philippine solar altitudes are much steeper year-round. A shading device designed for 31°N will be grossly oversized at 14.6°N. Always recalculate overhang depth using local solar altitude angles—the LEA tests whether you can distinguish climate-specific design from universal application.

**Philippine Brise-Soleil Sizing**:

For a **south-facing window** (2.0 m height) in **Manila**:

Winter overhang depth = Window height × tan(solar altitude) = 2.0 × tan(59.5°) = 2.0 × 1.6 = **3.2 m**

This impractical depth suggests **horizontal louver angles** (60–70° from horizontal) rather than cantilever overhangs. Angled louvers block winter sun while admitting diffuse light through louver gaps.

For an **east-facing window** (1.5 m height) in **Manila**:

8:00 AM solar altitude (summer): 28°
Overhang depth = 1.5 × tan(28°) = 1.5 × 0.53 = **0.8 m** (practical)

9:00 AM solar altitude: 40°
Overhang depth = 1.5 × tan(40°) = 1.5 × 0.84 = **1.3 m**

East facades require **1.0–1.5 m overhangs** plus **vertical fins** angled to block low morning sun while permitting upper-window diffuse light.

### Specific Shading Device Types

#### Horizontal Louvers (Brise-Soleil Shelves)

**Application**: Primarily south-facing; effective for blocking high-altitude summer sun while admitting winter diffuse light.

**Design Parameters**:
- **Spacing**: 0.3–0.6 m vertical spacing between louvers
- **Angle**: 45–70° from horizontal (tilted to optimize winter penetration)
- **Depth**: 0.5–1.2 m protrusion (varies with latitude)
- **Material**: Aluminum (lightweight, adjustable), concrete (massive, expressive), timber (sustainable, weather-patina)

**Performance** (south-facing, Manila):
- Summer noon: Blocks 85–95% of direct radiation
- Winter noon: Admits 30–50% (louver gaps allow diffuse penetration)
- Overall cooling load reduction: 40–50%

**Integration with Philippine Vernacular**:
Horizontal louvers echo the bahay kubo roof overhang principle—steep pitch creates natural louver effect, shedding rain while channeling cross-ventilation.

#### Vertical Fins (East-West Facade Shading)

**Application**: East and west facades; most critical in Philippine climate where east/west exposure is solar liability.

**Design Parameters**:
- **Width**: 0.3–0.8 m per fin
- **Spacing**: 0.5–1.5 m center-to-center (depends on acceptable summer noon heat gain)
- **Depth**: 0.3–0.6 m protrusion
- **Angle**: Perpendicular to facade (0°) for maximum shading consistency; can angle toward south to reduce winter-solstice penetration

**Performance** (west-facing, Manila, 5:00 PM, summer):
- Solar altitude: 18° (very low, nearly horizontal rays)
- Vertical fin shades: 70–90% of direct radiation
- Overall cooling load reduction: 50–70% (west facade is most critical)

**Fin Geometry Optimization**:
Vertical fin spacing depends on acceptable direct-sun penetration into building. A spacing of 1.0 m accommodates:
- **Summer solstice (79.5° noon altitude)**: Nearly complete shading
- **Winter solstice (59.5° noon altitude)**: Occasional penetration acceptable (diffuse gain is modest)
- **East/west early morning or late afternoon (18–30° altitude)**: Partial shading; occupant comfort maintained by air movement and lighter clothing

#### Egg-Crate Screens (Three-Dimensional Louvers)

**Application**: High-solar-gain facades (especially east/west); provides both horizontal and vertical shading simultaneously.

**Design Parameters**:
- **Cell dimensions**: 0.4–1.0 m² typical
- **Depth**: 0.2–0.4 m (cells protrude from facade)
- **Material**: Aluminum frames with infill (concrete, wood, metal mesh, or open)

**Performance**:
- Blocks sun from both high angles (horizontal elements) and low angles (vertical elements)
- Daylighting penetration: 20–40% (higher transparency than full brise-soleil)
- Cooling load reduction: 50–70%
- Aesthetic impact: Dramatic geometric pattern; similar to Le Corbusier's Chandigarh approach

**Philippine Example**: Egg-crate screens on a Manila high-rise reduce midday heat gain by 60% while admitting sufficient diffuse light for offices without electric lighting 60–70% of work hours.

#### Light Shelves (Reflective Shelves)

**Application**: Daylighting optimization combined with glare control; especially valuable in deep floor-plate office buildings.

**Design Parameters**:
- **Shelf depth**: 0.5–1.5 m extending inward from window
- **Surface finish**: Highly reflective (90%+ reflectance) white or metallic paint
- **Angle**: Tilted 45° to bounce light toward ceiling/deep interior

**Performance**:
- **Daylight transmission depth**: Increases penetration from 5–8 m (window only) to 12–15 m (with light shelf)
- **Glare reduction**: Upper portion of window shaded; lower window portion provides view without direct glare
- **Cooling benefit**: Upper-window solar gain blocked; lower-window diffuse light admitted

**Mechanism**:
Light reflects off shelf onto ceiling; ceiling reflects light deeper into space. This creates "uniform" illumination without bright window source causing glare or excessive cooling demand.

#### Deep Overhangs

**Application**: Simple, effective solution for south-facing facades; widely used in Philippine vernacular (bahay kubo, bahay na bato).

**Design Parameters**:
- **Depth**: 0.8–2.0 m (depends on latitude, window height, and seasonal needs)
- **Angle**: Horizontal (perpendicular to facade) or sloped

**Performance** (south-facing, Manila):
- **Summer (June–Sept)**: Blocks 70–85% of solar radiation
- **Winter (Dec–Feb)**: Admits 40–60% (moderate penetration acceptable)
- **Cooling load reduction**: 35–50%
- **Operational benefit**: Reduces glare; provides weather protection for facades; extends usable exterior spaces (gallery shading)

**Vernacular Alignment**:
The bahay na bato's deep ground-floor galleries and upper-story shaded verandas serve as overhangs—providing climate control, social spaces, and transitional zones between interior and exterior. Modern design can replicate this model: colonnaded galleries with living spaces set back 3–4 meters, naturally shaded and ventilated.

### Integration with BERDE and Philippine Green Building Code

Sun shading devices earn **BERDE points** in multiple categories:

**Passive Design** (≥3 points):
- Shaded windows reduce cooling load by 30–50%
- Buildings achieving 15–20 kW cooling/1,000 m² (vs. 25–30 kW unshaded) qualify for passive design credit

**Daylighting** (≥2 points):
- Well-designed shading admits 40–60% of daylight while blocking direct heat
- Daylight autonomy ≥55% (adequate lighting ≥300 lux for 55% of work hours) supported by thoughtful shading geometry

**Thermal Comfort** (≥2 points):
- Operative temperature reduction of 2–4 K through shading enhances ASHRAE 55 compliance without mechanical cooling

**Total BERDE points achievable through shading design**: ≥7 points (roughly 10% of total certification threshold)

### Dynamic and Adjustable Shading Systems

**Fixed shading** (brise-soleil, permanent louvers) is cost-effective but inflexible. **Adjustable systems** offer greater optimization:

#### Motorized Louver Systems

- Automatically angle louvers based on solar position, occupancy, and thermal sensors
- Summer: Closed fully for maximum shading
- Winter: Open during daytime to admit solar gain (winter heating benefit in Coronas Type III/IV climates)
- **Philippine application**: Most valuable in transitional seasons (Oct–Nov, Feb–Mar) when solar orientation shifts rapidly; moderate cost-benefit in perpetually hot Type I/II climates

#### Switchable Glazing (Electrochromic/Thermochromic)

- Windows that darken in response to electric current or temperature
- Transmittance range: 60% (clear) to 2% (dark)
- **Advantage**: No moving parts; elegant appearance
- **Disadvantage**: High cost (~200–300 USD/m²); ongoing electrical consumption; photochromic alternatives avoid electricity but can't be user-controlled
- **Philippine use**: Premium office buildings; cost-benefit marginal in climates where permanent dark tint (≥2% transmittance) is always optimal

#### Manual Roller Shades / Curtains

- Lowest-cost option; occupant-controlled
- **Advantage**: Zero operational cost; user preference accommodation
- **Disadvantage**: Occupant behavior unpredictable; office workers often fail to close shades despite discomfort (psychological reluctance to darken view)
- **Philippine context**: Effective in schools and public buildings with active facilities management; less reliable in private offices

### Solar Penetration Calculation and Design Workflow

**Step-by-Step Overhang Design**:

1. **Identify facade orientation** (N/S/E/W)
2. **Determine critical solar altitude** (summer max for E/W; winter max for N/S)
3. **Select window height** (floor-to-sill to ceiling)
4. **Calculate overhang depth**: Depth = Window Height × tan(solar altitude)
5. **Adjust for practical constraints** (structural, aesthetic, cost)
6. **Verify seasonal performance** (check winter and equinox penetration)
7. **Integrate with ventilation** (ensure louvers don't block stack effect exhaust)

**Example: East Facade Office Window, Manila**:
- Summer 6:00 AM altitude: 28°
- Window height (sill to lintel): 1.2 m
- Required overhang: 1.2 × tan(28°) = **0.64 m**
- Practical depth: 0.75 m (rounds up for full shading buffer)
- Result: 6:00 AM sun blocked until 7:30 AM; 75% heat gain reduction

## Key Facts and Testable Items

ExamTip" status="preserved"]
<Note>
1. **Overhang Design Calculation**: Design south-facing windows for a Batanes building (20°N latitude). Winter solstice noon altitude = 53.5°. Window height = 2.5 m. Calculate required overhang depth to prevent direct penetration. Verify summer (79°) and equinox (69°) penetration is acceptable (diffuse only).
</Note>

[SLATECAMP_UI_BLOCK:ui_0007 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: 2. **East-West Facade Shading Strategy**: A 14-story Manila office building has 40% of its facade area facing east and west (solar liability). Design a comprehensive shading strategy combining vertical fins, horizontal shelves, and glazing selection. Calculate cooling load reduction percentage. Specify material, spacing, and angle.

[SLATECAMP_UI_BLOCK:ui_0008 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: 3. **Brise-Soleil Geometric Design**: Using Le Corbusier's Chandigarh Capitol Complex as model, design a brise-soleil facade for a Manila institutional building (library, museum, or court). Specify: (a) horizontal and vertical element spacing, (b) protrusion depth, (c) material, (d) shadow pattern evolution (sketch 4 positions: 8 AM, 12 PM, 4 PM, winter solstice), (e) cooling load reduction estimate.

[SLATECAMP_UI_BLOCK:ui_0009 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: 4. **Light Shelf Optimization**: A 18-meter-deep office floor plate requires daylighting to 15 meters depth. Design a light shelf system: (a) shelf depth and angle, (b) reflectance and surface finish, (c) integration with mechanical ventilation louvers (ensure no conflict), (d) maintenance protocol, (e) daylight autonomy impact.

[SLATECAMP_UI_BLOCK:ui_0010 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: 5. **Shading Device Specification for BERDE Certification**: Select shading devices for a mixed-use building (ground retail, upper residential) in a Coronas Type IV climate (year-round rain, perpetual cloud cover, diffuse light dominant). Justify device choices for thermal control while maximizing daylighting (required for occupant well-being despite limited direct sun). Calculate achievable BERDE points.

[SLATECAMP_UI_BLOCK:ui_0001 component="Callout" status="preserved"]
Extracted summary:
- Props: 
- Text: Sun shading devices reduce solar heat gain by 40–70% without sacrificing daylighting; they are essential tropical architecture elements. The **brise-soleil** (sun breaker) and related devices—horizont

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0011 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Over-Designing Overhangs for Tropical Latitude", correction="Using temperate-zone logic (2.0–3.0 m overhangs for 40°N latitude) in Philippine 14.6°N. Result: Excessive overhang blocking winter diffuse light and compromising roof/structural aesthetics.", context="Philippine winter sun (59.5° altitude) requires shallower depths or angled louvers."
- Text: (none detected)

[SLATECAMP_UI_BLOCK:ui_0012 component="WikiMistakeCard" status="preserved"]
Extracted summary:
- Props: mistake="Ignoring East-West Exposure", correction="Focusing on south-facing facade shading while neglecting east and west—where solar heat gain is actually greater.", context="Unshaded east/west windows undermine overall thermal performance."
- Text: (none detected)

[SLATECAMP_UI_BLOCK:ui_0013 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{["Blocking Stack Effect Exhaust. Placing horizontal louvers across roof-level exhaust vents or clerestories, impeding buoyancy-driven ventilation. Natural ventilation effectiveness drops by 40–50%. Always ensure louvers don't block vertical airflow paths.", "Over-Reliance on Motorized Systems. Installing expensive motorized louvers without fixing fundamental design flaws (oversized windows, poor orientation). The building still overheats during electrical failures or sensor malfunctions.", "Inadequate Winter Daylighting. Designing overhangs that block winter diffuse light, forcing daytime electric lighting. Type II/IV climates (perpetual cloud cover) suffer more; Type I (dry season) benefits from deeper shading year-round.", "Misaligned Brise-Soleil Geometry. Copying Chandigarh egg-crate spacing (0.5–0.7 m cells, appropriate for 31°N) in Manila (14.6°N). Result: Oversized cells; insufficient shading for high-altitude tropical sun; poor aesthetic integration."]}"
- Text: (none detected)

## Key Terms

**Brise-Soleil** — French term for "sun breaker"; fixed external shading screen creating shadow patterns that evolve daily and seasonally.

**Egg-Crate Screen** — Three-dimensional louver system combining horizontal and vertical elements; provides shading from both high and low solar angles simultaneously.

**Solar Altitude** — Angle of sun above horizon (0° = horizon, 90° = zenith); determines required overhang depth via tangent function.

**Direct Radiation** — Solar energy arriving straight from sun disk; blocked by external shading; primary source of solar heat gain.

**Diffuse Radiation** — Solar energy scattered by atmosphere and clouds; can pass around shading devices; increases during monsoon/cloudy periods.

**Overhang (Cantilever)** — Horizontal projection above window; depth calculated as Window Height × tan(solar altitude); simple, cost-effective shading.

**Vertical Fin (Solar Screen)** — Narrow, tall shading element perpendicular to facade; blocks low-angle morning/afternoon sun; most critical for east-west facades.

**Light Shelf** — Horizontal reflective surface at window height; bounces light toward ceiling and deep interior; provides daylighting ≥12 m from window.

**Louver Angle** — Tilt of horizontal shading element from perpendicular (0°) to nearly horizontal (80°); affects seasonal sun penetration variation.

**Switchable Glazing** — Window material that darkens electrically (electrochromic) or thermally; dynamic but expensive; limited tropical application.

**Motorized Louver System** — Automatically adjusting shading based on solar sensors; optimizes seasonal performance but adds cost and maintenance complexity.

**BERDE Passive Design Credit** — Green building points awarded for fixed shading reducing cooling load ≥30%; integral to Philippine certification pathway.

## Related Articles

See also within Tropical Architecture & Climate: **lea-theo-004-01-core-concept**, **lea-theo-004-02-core-concept**, **lea-theo-004-03-core-concept**, **lea-theo-004-07-core-concept**.

> **Overview:** overview-theory-of-architecture for the full curriculum structure and study strategy for Theory of Architecture.

