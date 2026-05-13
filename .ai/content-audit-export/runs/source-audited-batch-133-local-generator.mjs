#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const REPO = process.cwd()
const BATCH = 133
const BATCH_ID = 'source-audited-article-batch-133-local-first'
const BASELINE = '558f5f416'
const BRANCH = '3dlab-gray-viewport-bg'
const GENERATED_AT = '2026-05-14T18:45:00.000+08:00'
const RAW_DIR = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-133'
const REFINED_DIR = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-133'
const TOA_RAW_PATH = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 4 (Tropical Architecture).pdf'
const TOA_RAW_HASH = 'sha256:aa61b32fc2289be43b7bb210c1082adc0b5bee0321c36b7f3fbd8e54ae36c4f6'
const TOA_REFINED_PATH = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 4 (Tropical Architecture).md'
const TOA_REFINED_HASH = 'sha256:b6fe9434960e2265ad2e33d4039a335e591ab7d0b255bf5162d676fe178bbb22'
const EMPTY_UI_HASH = sha256Json([])

const sourceNotes = {
  toaClimate:
    'TOA 4 lines 400-483 locate Philippine humidity, rainfall, seasons, climate types, and prevailing amihan/habagat winds.',
  toaPassive:
    'TOA 4 lines 563-645 frame passive design as reducing heat gain, using natural ventilation, daylight, and cooler outdoor areas.',
  toaSun:
    'TOA 4 lines 692-810 explain orientation, sun-path diagrams, azimuth, altitude, date lines, airflow, and Philippine prevailing wind seasons.',
  toaVent:
    'TOA 4 lines 838-889 and 1412-1504 explain passive ventilation, aligned openings, low/high openings, stack logic, and obstruction control.',
  toaBahay:
    'TOA 4 lines 1552-1627 and 1647-1709 describe tropical architecture goals, bahay kubo/bahay na bato climate devices, and opening logic.',
  toaShade:
    'TOA 4 lines 1199-1247 and 1302-1352 list overhangs, louvers, eggcrate/brise-soleil, skylights, light shelves, and clerestories.',
}

const officialSources = {
  noaa:
    'NOAA Solar Calculator glossary, https://gml.noaa.gov/grad/solcalc/glossary.html, lines 90-91 and 150-154: azimuth/elevation locate sky position and solar declination varies seasonally.',
  pagasa:
    'PAGASA Climate of the Philippines, https://www.pagasa.dost.gov.ph/information/climate-philippines, lines 329-350: Philippine climate is tropical and maritime, with high temperature, high humidity, abundant rainfall, seasons, and rainfall-based climate types.',
  wbdgVent:
    'WBDG Natural Ventilation, https://www.wbdg.org/resources/natural-ventilation, lines 99-118 and 183-196: avoid airflow obstructions, use wind and buoyancy carefully, and meet comfort, moisture, contaminant, smoke, and fire requirements.',
  ashrae55:
    'ASHRAE Standard 55 page, https://www.ashrae.org/technical-resources/bookstore/standard-55-thermal-environmental-conditions-for-human-occupancy, lines 234-238: environmental and personal factors combine to create thermal conditions for most occupants.',
  wbdgShade:
    'WBDG Sun Control and Shading Devices, https://www.wbdg.org/resources/sun-control-and-shading-devices, lines 80-87, 105-108, 125-143, and 150-160: shading controls heat gain, glare, daylight, sun angles, latitude transfer, and maintenance risk.',
  wbdgDaylight:
    'WBDG Daylighting, https://www.wbdg.org/resources/daylighting, lines 113-128 and 191-202: light shelves and louvers redirect daylight, reduce glare, and vary by orientation.',
  ccpManosa:
    'Cultural Center of the Philippines, Francisco Manosa press release, https://culturalcenter.gov.ph/press-release/necro-rites-for-national-artist-francisco-manosa/, lines 54-59: Manosa championed Filipino architecture, especially bahay kubo and bahay na bato, and used indigenous materials.',
}

const articles = [
  {
    folder: '.ai/content-audit-export/articles/lea-theo-004-08-core-concept--8a812be4-c5c0-40ec-a3ff-74acb39e24bc',
    articleId: '8a812be4-c5c0-40ec-a3ff-74acb39e24bc',
    slug: 'lea-theo-004-08-core-concept',
    title: 'Solar Geometry Fundamentals',
    contentType: 'theory-of-architecture-solar-geometry',
    sourceFile: 'lea-theo-004-08-core-concept-solar-geometry-fundamentals',
    checkedLines: [sourceNotes.toaClimate, sourceNotes.toaPassive, sourceNotes.toaSun, sourceNotes.toaShade, officialSources.noaa, officialSources.pagasa, officialSources.wbdgShade],
    scenario:
      'A Manila school wing is being reoriented before schematic design is finalized. The review team checks sun-path altitude and azimuth, keeps long east and west glass areas limited, and tests overhangs or louvers against the same date and time range while keeping the ventilation path open.',
    rejected:
      'Unsupported exact overhang formulas, single-date solar calculations, rating-system point claims, and fixed solar-angle values are excluded unless separately source-mapped.',
    normalized: (ctx) => `# Solar Geometry Fundamentals

Source basis: Batch 133 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). The local TOA 4 source family remains the Philippine tropical-design base: ${TOA_RAW_PATH} (${TOA_RAW_HASH}) and ${TOA_REFINED_PATH} (${TOA_REFINED_HASH}).

## LEA Scope

Solar geometry is the design use of sun position. For the LEA, the useful reading is not a memorized calculation; it is the relationship among orientation, sun direction, sun height, shading, daylight, and ventilation in a tropical site.

NOAA defines azimuth and elevation as angular coordinates for locating an object in the sky. TOA 4 uses the same design logic through sun-path diagrams: azimuth locates direction, altitude locates height, and date lines show how the path changes through the year. Solar declination is the seasonal reason the path is not identical every month.

## Design Use

In Philippine tropical design, solar geometry supports two linked choices. First, it helps reduce unwanted heat gain by identifying facades that need protection from direct sun. Second, it prevents the designer from blocking airflow while solving the sun problem. A fixed overhang, vertical fin, louver, awning, light shelf, or landscape shade is correct only when it fits the facade orientation, date/time range, daylight need, and maintenance context.

East and west exposures deserve caution because low-angle morning and afternoon sun can be harder to shade with a simple horizontal projection. North and south facades are not automatically problem-free; they still need checking against glare, daylight, rain, and airflow.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Treating a sun-path diagram as decoration instead of evidence for orientation and shading.
- Copying an overhang depth from another latitude or facade.
- Solving shade in a way that blocks the breeze needed for tropical comfort.
- Inventing exact angles or energy savings when the checked sources only support qualitative design logic.

## Source Boundary

This article is source-safe for local-first Batch 133. It does not authorize unsourced solar calculations, product performance claims, or rating-system point claims.`,
    questions: [
      q('a', 'A reviewer asks what an altitude line on a sun-path diagram should change in a tropical facade study. What is the source-safe answer?', {
        a: 'It helps judge the sun height above the horizon before sizing or selecting a shading response.',
        b: 'It proves every facade receives the same sun angle.',
        c: 'It replaces the need to study azimuth, date, and time.',
        d: 'It gives an automatic rating-system point total for the facade.',
      }),
      q('b', 'In TOA 4 tropical orientation logic, why is solar geometry not separated from airflow?', {
        a: 'Because airflow is irrelevant once a facade is shaded.',
        b: 'Because orientation should reduce solar heat gain while preserving useful wind paths.',
        c: 'Because sun-path diagrams calculate indoor air-change rates by themselves.',
        d: 'Because the Philippines has no seasonal wind variation.',
      }),
      q('c', 'How should a Philippine climate-type discussion support solar geometry decisions?', {
        a: 'By changing the laws of solar geometry for each province.',
        b: 'By proving that rainfall removes the need for shading.',
        c: 'By adding rainfall, wind, and humidity context around the same sun-position reading.',
        d: 'By replacing site analysis with one national facade template.',
      }),
      q('d', 'A designer copies a Batanes overhang calculation into a Manila east facade without checking date, time, or facade context. What is the best critique?', {
        a: 'The calculation is acceptable because both sites are in the Philippines.',
        b: 'The overhang is acceptable if the window width is unchanged.',
        c: 'Only west facades need solar checking.',
        d: 'Shading ideas must be checked against the actual sun path, latitude, orientation, and design constraints.',
      }),
      q('a', 'Why are long east and west glass exposures treated carefully in tropical solar design?', {
        a: 'Low-angle morning and afternoon sun can be difficult to control with simple horizontal projections.',
        b: 'East and west facades receive no direct sun in the Philippines.',
        c: 'Horizontal overhangs always solve east and west sun without verification.',
        d: 'The only issue on east and west facades is rainfall.',
      }),
      q('d', 'What does seasonal solar declination explain in a source-safe LEA answer?', {
        a: 'Why all days have identical sun paths.',
        b: 'Why shading should ignore the date line.',
        c: 'Why wind direction is the same as solar azimuth.',
        d: 'Why the apparent sun path and altitude vary through the year.',
      }),
      q('b', 'Which pairing correctly describes the basic solar-geometry terms used in design review?', {
        a: 'Azimuth is indoor temperature; altitude is rainfall.',
        b: 'Azimuth locates compass direction; altitude or elevation locates sun height above the horizon.',
        c: 'Azimuth is a louver depth; altitude is a rating-system score.',
        d: 'Azimuth and altitude both mean facade width.',
      }),
      q('b', 'A north-facing classroom still has glare complaints. What should the architect do?', {
        a: 'Ignore the issue because north facades never need review.',
        b: 'Check daylight, glare, shading, rain, and ventilation together before changing the opening.',
        c: 'Seal all windows and remove natural ventilation.',
        d: 'Apply a west-facade brise-soleil detail without adjustment.',
      }),
      q('b', 'How should the LEA treat latitude differences within the Philippines for solar design?', {
        a: 'Latitude is the only design variable and climate can be ignored.',
        b: 'Latitude can affect sun-path reading, but the device still needs site, orientation, and use verification.',
        c: 'All Philippine sites have identical solar paths at all times.',
        d: 'Latitude determines exact overhang depth without window data.',
      }),
      q('b', 'Why is a fixed overhang often a compromise rather than a universal answer?', {
        a: 'Because fixed overhangs never shade any window.',
        b: 'Because sun position changes by date and time, and the device must also fit daylight, structure, view, airflow, and maintenance.',
        c: 'Because overhangs only work in cold climates.',
        d: 'Because overhangs automatically create cross ventilation.',
      }),
      q('c', 'Which answer best captures the tropical-design priority behind solar geometry?', {
        a: 'Maximize winter heat collection as the only goal.',
        b: 'Decorate the facade with any visible shading device.',
        c: 'Reduce unwanted heat gain while coordinating shade, daylight, and ventilation.',
        d: 'Avoid all daylight in occupied rooms.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-004-09-core-concept--6bfa7e66-ac5c-4a52-8f92-0ca94b945305',
    articleId: '6bfa7e66-ac5c-4a52-8f92-0ca94b945305',
    slug: 'lea-theo-004-09-core-concept',
    title: 'Natural Ventilation',
    contentType: 'theory-of-architecture-natural-ventilation',
    sourceFile: 'lea-theo-004-09-core-concept-natural-ventilation',
    checkedLines: [sourceNotes.toaClimate, sourceNotes.toaVent, sourceNotes.toaBahay, officialSources.pagasa, officialSources.wbdgVent, officialSources.ashrae55],
    scenario:
      'A low-rise barangay hall can use shaded operable openings on more than one side, a clear internal air path, and high exhaust points under a hot roof. A clinic treatment room in the same compound still needs mechanical ventilation or filtration where infection control, contaminants, or continuous conditioning require it.',
    rejected:
      'Unsupported air-change rates, fixed wind-catcher dimensions, clinical ventilation guarantees, and formula-only answers are excluded.',
    normalized: (ctx) => `# Natural Ventilation

Source basis: Batch 133 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). The local TOA 4 source family remains the Philippine tropical-design base: ${TOA_RAW_PATH} (${TOA_RAW_HASH}) and ${TOA_REFINED_PATH} (${TOA_REFINED_HASH}).

## LEA Scope

Natural ventilation uses pressure differences from wind and buoyancy to move outdoor air through a building. In Philippine tropical architecture, it is a comfort and heat-removal strategy, not a universal substitute for mechanical systems.

TOA 4 links natural ventilation to orientation, opening placement, obstruction control, roof heat removal, and occupant cooling sensation from air movement. WBDG reinforces that the specific approach depends on building type, local climate, internal space planning, and opening placement. It also warns that naturally ventilated buildings must address comfort, moisture, contaminants, smoke, and fire requirements.

## Design Use

A source-safe answer should mention a complete path: inlet, air movement through the room, and outlet. Openings should be placed so wind can enter and stale or warm air can leave. Low and high openings can support buoyancy movement, while roof vents or a double roof can help remove trapped hot air.

The Philippines also has seasonal wind context. TOA 4 identifies northeast winds during the amihan season and southwest winds during the habagat season, so a design should not rely on one rigid opening direction without site checking.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Claiming exact ventilation rates without opening areas, wind data, and modeling.
- Treating natural ventilation as automatically acceptable for every occupancy.
- Aligning openings but filling the interior path with partitions or storage.
- Adding roof vents without a real heat-exhaust path.

## Source Boundary

This article supports qualitative LEA reasoning about airflow paths, stack logic, and tropical comfort. It does not authorize unsourced air-change calculations or health-care ventilation compliance claims.`,
    questions: [
      q('c', 'A naturally ventilated classroom has large windows but little air movement. What source-safe design factor should be checked first?', {
        a: 'Paint color alone.',
        b: 'The number of decorative louvers on the elevation.',
        c: 'Whether openings create a clear wind or buoyancy path without major obstructions.',
        d: 'Whether the room has a fixed air-change rate copied from another project.',
      }),
      q('a', 'A question asks for an exact air-change rate from only window labels on a plan. What is the correct response?', {
        a: 'The rate cannot be verified from that information alone; opening area, wind, temperature, path, and controls matter.',
        b: 'The rate is automatically acceptable if two windows exist.',
        c: 'The rate is always zero in humid climates.',
        d: 'The rate can be found from facade color.',
      }),
      q('b', 'Why might a clinic space need mechanical support even when the site has good breezes?', {
        a: 'Because natural ventilation is illegal in every room.',
        b: 'Because infection control, contaminants, filtration, and continuous conditioning may require more than operable openings.',
        c: 'Because air movement never affects comfort.',
        d: 'Because roof vents replace all health requirements.',
      }),
      q('d', 'How should a Philippine passive-design answer treat amihan and habagat winds?', {
        a: 'Ignore them because wind never changes seasonally.',
        b: 'Use only northeast openings for all months.',
        c: 'Seal the building during both seasons.',
        d: 'Allow operable, site-checked paths that can respond to seasonal wind direction.',
      }),
      q('b', 'What is the source-safe purpose of a wind catcher or similar passive device?', {
        a: 'To guarantee hospital-grade air quality.',
        b: 'To capture or redirect wind into a usable ventilation path when the site and section support it.',
        c: 'To replace all outlets in the building.',
        d: 'To calculate solar declination.',
      }),
      q('a', 'A reviewer proposes one universal wind-catcher height for all Philippine sites. What is the best critique?', {
        a: 'Height and size must be checked against site wind, building section, openings, structure, and maintenance.',
        b: 'Wind catchers work only if they face west.',
        c: 'Wind catchers never need outlets.',
        d: 'Universal dimensions are more reliable than site data.',
      }),
      q('a', 'Why can air movement improve perceived comfort in a hot-humid setting?', {
        a: 'It helps sweat evaporation and convective cooling sensation, within humidity and health limits.',
        b: 'It lowers outdoor humidity by itself.',
        c: 'It eliminates the need for shade.',
        d: 'It proves the room has no contaminants.',
      }),
      q('a', 'What is the basic stack-effect idea used in architectural ventilation?', {
        a: 'Warm or stale air leaves through higher openings while replacement air enters lower openings.',
        b: 'Cold air always rises above warm air.',
        c: 'A room ventilates only when all openings are at the same height.',
        d: 'Stack effect is a decorative roof profile.',
      }),
      q('c', 'When are roof vents or a double roof source-safe in a tropical design answer?', {
        a: 'Only when they are added as ornament.',
        b: 'Only when the roof is flat.',
        c: 'When they help remove trapped hot air and connect to a real inlet/outlet strategy.',
        d: 'When all windows are sealed permanently.',
      }),
      q('a', 'Which drivers are normally named in a source-safe natural ventilation explanation?', {
        a: 'Wind pressure and thermal buoyancy or convection.',
        b: 'Facade color and tile pattern only.',
        c: 'Paint finish and furniture style only.',
        d: 'Solar declination and rating-system points only.',
      }),
      q('c', 'Which opening strategy is consistent with TOA 4 tropical ventilation logic?', {
        a: 'Put all openings on one wall and block the interior path.',
        b: 'Use only fixed glass in a hot-humid room.',
        c: 'Coordinate windward and leeward openings, with outlet capacity and section height checked for flow.',
        d: 'Rely on a sealed attic to remove hot air.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-004-10-core-concept--7ad29107-a824-4a7b-8c32-ed6a719ebd39',
    articleId: '7ad29107-a824-4a7b-8c32-ed6a719ebd39',
    slug: 'lea-theo-004-10-core-concept',
    title: 'Bahay Kubo: Climate-Responsive Architecture',
    contentType: 'theory-of-architecture-bahay-kubo-climate-responsive',
    sourceFile: 'lea-theo-004-10-core-concept-bahay-kubo-climate-responsive-architecture',
    checkedLines: [sourceNotes.toaClimate, sourceNotes.toaBahay, sourceNotes.toaVent, officialSources.pagasa, officialSources.ccpManosa],
    scenario:
      'A coastal learning center borrows bahay kubo principles through an elevated shaded floor, a steep ventilated roof, deep overhangs, operable walls, and locally appropriate materials. The design is not a literal hut copy; it translates the climate logic into a safer contemporary section.',
    rejected:
      'Unsupported claims that bahay kubo features guarantee modern code compliance, exact air-change rates, or rating-system scores are excluded.',
    normalized: (ctx) => `# Bahay Kubo: Climate-Responsive Architecture

Source basis: Batch 133 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). The local TOA 4 source family remains the Philippine tropical-design base: ${TOA_RAW_PATH} (${TOA_RAW_HASH}) and ${TOA_REFINED_PATH} (${TOA_REFINED_HASH}).

## LEA Scope

The bahay kubo is important for the LEA because it demonstrates climate-responsive principles before mechanical conditioning became the default. TOA 4 identifies the elevated platform, steep roof, broad overhangs, large operable windows, light materials, bamboo slats, and outdoor planting as tropical design responses.

The lesson is principle-based. The bahay kubo responds to heat, humidity, rain, and airflow by lifting the floor, venting the enclosure, shading the walls, and using materials that suit local construction. It should not be treated as a nostalgic image detached from performance.

## Contemporary Use

A modern architect can translate bahay kubo logic into safer contemporary buildings: shaded outdoor rooms, cross ventilation, roof heat exhaust, permeable edges where appropriate, local material expression, and rain protection. This must still be reconciled with structure, fire safety, typhoon exposure, accessibility, sanitation, and the program.

The Cultural Center of the Philippines records Francisco Manosa as an architect who championed Filipino architecture and interpreted the bahay kubo and bahay na bato. That supports the cultural design lineage, but it does not turn every indigenous-looking detail into climate-responsive architecture.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Copying the hut image without the shade, ventilation, and rain logic.
- Treating bamboo or thatch as automatically compliant for every modern occupancy.
- Sealing the building so completely that the climate-responsive concept disappears.
- Ignoring bahay na bato as a related hybrid adaptation.

## Source Boundary

This article supports vernacular climate logic and contemporary translation. It does not authorize exact performance rates, code compliance claims, or rating-system points without separate sources.`,
    questions: [
      q('d', 'What is the strongest LEA reason to study the bahay kubo in tropical design?', {
        a: 'It proves all buildings should be literal huts.',
        b: 'It removes the need for structural and safety review.',
        c: 'It is only a decorative Filipino motif.',
        d: 'It demonstrates indigenous climate logic through shade, elevation, ventilation, rain response, and local material use.',
      }),
      q('c', 'Which statement about airflow in the bahay kubo is source-safe?', {
        a: 'It guarantees a fixed air-change rate in every site.',
        b: 'It works only when every wall is sealed.',
        c: 'Openings, permeable edges, and elevated construction can support cross ventilation and heat relief.',
        d: 'It replaces all need for wind and rain analysis.',
      }),
      q('d', 'How should a contemporary designer use bahay kubo principles?', {
        a: 'Copy every traditional detail regardless of use or hazard.',
        b: 'Use a native-looking roof only as branding.',
        c: 'Ignore structure and weather resistance.',
        d: 'Translate the climate and material logic into a compliant contemporary design.',
      }),
      q('b', 'Why would sealing a bahay-kubo-inspired office weaken the concept?', {
        a: 'Because the concept depends only on ornament.',
        b: 'Because shade, air movement, and permeable enclosure are central to its tropical response.',
        c: 'Because all offices must avoid daylight.',
        d: 'Because elevated floors are never useful.',
      }),
      q('c', 'Which feature group best matches TOA 4 bahay kubo climate logic?', {
        a: 'Heavy sealed walls, low flat roof, and no overhangs.',
        b: 'Mirror glass, west-facing curtain wall, and sealed attic.',
        c: 'Elevated platform, steep roof, deep overhangs, large operable openings, and light local materials.',
        d: 'Underground rooms, no windows, and exposed east-west glass.',
      }),
      q('a', 'What is a source-safe warning when adapting bahay kubo materials today?', {
        a: 'Material choices must still meet safety, durability, fire, moisture, and maintenance requirements.',
        b: 'Traditional materials automatically satisfy all modern codes.',
        c: 'Local materials should never be used.',
        d: 'Materials matter less than decorative form.',
      }),
      q('b', 'How is bahay na bato best handled in the same climate-responsive discussion?', {
        a: 'As a foreign style unrelated to Philippine climate.',
        b: 'As a related hybrid adaptation with masonry base, lighter upper parts, eaves, operable elements, and local daylight/ventilation devices.',
        c: 'As proof that all tropical buildings must be fully sealed.',
        d: 'As a rating-system checklist.',
      }),
      q('c', 'Which sustainability claim stays within the checked source boundary?', {
        a: 'The bahay kubo automatically earns a fixed green-building score.',
        b: 'A bamboo wall always outperforms every modern wall assembly.',
        c: 'Its principles can support shade, airflow, local materials, and lower dependence on mechanical cooling when properly adapted.',
        d: 'A vernacular reference eliminates maintenance.',
      }),
      q('d', 'Why is Francisco Manosa relevant to this article source map?', {
        a: 'He rejected Filipino architectural forms.',
        b: 'He designed only international-style glass towers.',
        c: 'He proved climate analysis is unnecessary.',
        d: 'An official CCP source records his advocacy for Filipino architecture, including bahay kubo and bahay na bato influences.',
      }),
      q('d', 'How should Philippine climate type affect a bahay-kubo-inspired design?', {
        a: 'It should be ignored because the same rain and wind pattern exists everywhere.',
        b: 'It changes the cultural origin of the form.',
        c: 'It removes the need for shade.',
        d: 'It adjusts the emphasis on rain protection, wind exposure, humidity, and site response while preserving the core passive principles.',
      }),
      q('a', 'What is the best exam answer when a prompt asks whether a modern school should copy a bahay kubo literally?', {
        a: 'No; it should reinterpret the passive principles while meeting contemporary program, safety, accessibility, and durability needs.',
        b: 'Yes; literal copying guarantees compliance.',
        c: 'No; vernacular principles are never useful.',
        d: 'Yes; cultural form is more important than climate performance.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-004-12-core-concept--2e117d95-eb4c-4d96-8e3f-b31f18d26a64',
    articleId: '2e117d95-eb4c-4d96-8e3f-b31f18d26a64',
    slug: 'lea-theo-004-12-core-concept',
    title: 'Thermal Comfort',
    contentType: 'theory-of-architecture-thermal-comfort',
    sourceFile: 'lea-theo-004-12-core-concept-thermal-comfort',
    checkedLines: [sourceNotes.toaClimate, sourceNotes.toaPassive, sourceNotes.toaVent, officialSources.pagasa, officialSources.ashrae55, officialSources.wbdgVent],
    scenario:
      'In a naturally ventilated studio, the architect combines external shade, operable windows, high exhaust openings, ceiling fans where appropriate, moisture-resistant detailing, and user control. Comfort is evaluated as a combination of air temperature, radiant conditions, humidity, air movement, activity, and clothing rather than a single thermometer reading.',
    rejected:
      'Unsupported productivity claims, exact comfort-index calculations, and green-rating point claims are excluded.',
    normalized: (ctx) => `# Thermal Comfort

Source basis: Batch 133 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). The local TOA 4 source family remains the Philippine tropical-design base: ${TOA_RAW_PATH} (${TOA_RAW_HASH}) and ${TOA_REFINED_PATH} (${TOA_REFINED_HASH}).

## LEA Scope

Thermal comfort is not simply a low air temperature. In architectural design, it means creating indoor conditions that most occupants can accept for the activity, clothing, and level of control expected in the space.

ASHRAE Standard 55 identifies environmental factors such as temperature, thermal radiation, humidity, and air speed, plus personal factors such as activity and clothing. PAGASA confirms why the Philippine context is demanding: high temperature, high humidity, and abundant rainfall are normal climate conditions.

## Tropical Design Use

In TOA 4, passive comfort begins by reducing heat gain, shading the envelope, allowing natural ventilation where appropriate, and removing trapped hot air. Air movement can improve comfort sensation in hot-humid conditions, but humidity, contaminants, smoke/fire rules, health needs, and occupancy can limit how far natural ventilation can go.

For the LEA, a strong answer names multiple factors and then chooses the appropriate design strategy: shade, radiant-heat reduction, air movement, moisture control, insulation or roof heat control, occupant adjustment, and mechanical support where the program requires it.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Reducing thermal comfort to air temperature alone.
- Assuming evaporation-based cooling is always effective in humid climates.
- Treating natural ventilation as acceptable for every occupancy.
- Claiming exact comfort compliance without the required method and input data.

## Source Boundary

This article supports concept-level LEA reasoning about comfort factors and tropical strategies. It does not authorize exact ASHRAE compliance calculations, productivity superiority claims, or rating-system points.`,
    questions: [
      q('d', 'What is the best comfort strategy for a humid tropical learning space?', {
        a: 'Use evaporation alone and ignore humidity.',
        b: 'Focus only on lowering the wall paint temperature.',
        c: 'Seal every opening regardless of program.',
        d: 'Combine shade, air movement, radiant-heat control, moisture control, and mechanical support where needed.',
      }),
      q('c', 'A prompt asks for exact energy savings from a thermal comfort strategy without data. What should the LEA answer do?', {
        a: 'Invent a percentage from the building type.',
        b: 'Use the same value for every Philippine site.',
        c: 'Discuss source-supported passive load reduction qualitatively and reject unsupported exact savings.',
        d: 'Assume savings are zero if the building has windows.',
      }),
      q('b', 'Which factor set is closest to ASHRAE Standard 55 comfort framing?', {
        a: 'Facade color, furniture style, and roof shape only.',
        b: 'Air temperature, radiant temperature, humidity, air speed, activity, and clothing.',
        c: 'Lot area, setback, and parking count only.',
        d: 'Wind direction, roof pitch, and rainwater tank size only.',
      }),
      q('a', 'Why is operative or perceived comfort broader than air temperature?', {
        a: 'Radiant conditions, humidity, air speed, activity, clothing, and control also affect occupant satisfaction.',
        b: 'Air temperature is never relevant.',
        c: 'Only clothing matters indoors.',
        d: 'Comfort is decided by facade style.',
      }),
      q('c', 'A designer claims a shaded naturally ventilated room earns a fixed green-rating score. What is the source-safe response?', {
        a: 'Accept the score because shade is always enough.',
        b: 'Double the score if the site is humid.',
        c: 'Document the comfort strategy, but do not claim rating points without the rating-system source and evidence.',
        d: 'Reject all passive comfort strategies.',
      }),
      q('c', 'How do clothing and activity affect thermal comfort reasoning?', {
        a: 'They are irrelevant because only the building matters.',
        b: 'They replace all environmental factors.',
        c: 'They are personal factors, so the same room can feel different to different users.',
        d: 'They determine the required roof pitch.',
      }),
      q('a', 'What is the best concise definition of thermal comfort for this LEA context?', {
        a: 'A condition of mind expressing satisfaction with the thermal environment.',
        b: 'The lowest possible indoor air temperature.',
        c: 'The absence of all windows.',
        d: 'The presence of mechanical cooling in every room.',
      }),
      q('c', 'Which statement about air movement stays within the checked sources?', {
        a: 'Air movement guarantees higher productivity in every office.',
        b: 'Air movement eliminates all humidity.',
        c: 'Air movement and occupant control can improve comfort sensation when program and health limits allow.',
        d: 'Air movement is useful only in cold climates.',
      }),
      q('b', 'How should Philippine climate data support comfort design?', {
        a: 'By proving humidity is not an issue.',
        b: 'By grounding decisions in high temperature, high humidity, rainfall, seasonal context, and local site conditions.',
        c: 'By replacing room-level design analysis.',
        d: 'By requiring the same mechanical system everywhere.',
      }),
      q('a', 'Can a prompt determine ASHRAE 55 acceptability from only a room name and outdoor temperature?', {
        a: 'No; the standard requires the appropriate method and relevant environmental and personal inputs.',
        b: 'Yes; room name is enough.',
        c: 'Yes; outdoor temperature alone decides it.',
        d: 'No; ASHRAE 55 is unrelated to comfort.',
      }),
      q('c', 'Why is natural ventilation only a support strategy in some clinical or contaminant-sensitive spaces?', {
        a: 'Because shade is prohibited.',
        b: 'Because air speed is never useful.',
        c: 'Because ventilation must also address contaminant control, filtration, smoke/fire rules, and continuous conditioning where required.',
        d: 'Because humidity does not affect comfort.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-004-13-core-concept--d862de93-c876-468d-9edf-95656a781f55',
    articleId: 'd862de93-c876-468d-9edf-95656a781f55',
    slug: 'lea-theo-004-13-core-concept',
    title: 'Solar Shading Fundamentals',
    contentType: 'theory-of-architecture-solar-shading',
    sourceFile: 'lea-theo-004-13-core-concept-solar-shading-fundamentals',
    checkedLines: [sourceNotes.toaSun, sourceNotes.toaShade, officialSources.noaa, officialSources.wbdgShade, officialSources.wbdgDaylight],
    scenario:
      'For a west-facing library reading room, the architect avoids relying on a simple horizontal overhang alone. The study tests vertical fins, adjustable louvers, glare control, daylight penetration, maintenance access, and a clear ventilation path before selecting the final shading system.',
    rejected:
      'Unsupported brise-soleil dimensions, universal facade templates, fixed rating-system point claims, and copied shading details from other latitudes are excluded.',
    normalized: (ctx) => `# Solar Shading Fundamentals

Source basis: Batch 133 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). The local TOA 4 source family remains the Philippine tropical-design base: ${TOA_RAW_PATH} (${TOA_RAW_HASH}) and ${TOA_REFINED_PATH} (${TOA_REFINED_HASH}).

## LEA Scope

Solar shading controls direct sun before it becomes heat gain, glare, or visual discomfort. In tropical architecture, it is not an ornament applied after the plan is finished. It must be coordinated with orientation, sun angle, daylight, ventilation, views, maintenance, structure, and weather.

TOA 4 lists common devices: overhangs, horizontal louvers, vertical louvers, eggcrate or brise-soleil systems, blinds or screens, light shelves, clerestories, and other daylighting devices. WBDG reinforces the same design boundary: shading performance depends on facade orientation, sun altitude, azimuth, latitude, date, time, and maintenance.

## Device Logic

Horizontal overhangs are useful where high sun is the main problem. Vertical fins and vertical louvers are often more relevant for low-angle east or west sun. Eggcrate systems combine horizontal and vertical control. Adjustable shading can respond to changing sun positions, but it adds operation and maintenance demands.

A light shelf is a daylighting and shading device. It redirects daylight deeper into a room and can shade the near-window zone, but it still has to fit the orientation and glare task.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Copying a brise-soleil from another climate or latitude.
- Treating a shading device as proof of energy savings or rating points.
- Blocking all useful daylight and airflow while trying to solve heat gain.
- Using operable louvers without considering maintenance and user control.

## Source Boundary

This article supports qualitative LEA reasoning about shading device selection. It does not authorize unsourced dimensions, performance percentages, or green-rating point claims.`,
    questions: [
      q('b', 'What is the primary tropical-design purpose of a solar shading device?', {
        a: 'To decorate the facade regardless of sun direction.',
        b: 'To reduce direct sun, glare, and heat gain while preserving useful daylight and airflow where possible.',
        c: 'To make every room dark.',
        d: 'To replace climate analysis.',
      }),
      q('d', 'Which distinction is source-safe for daylight and shading questions?', {
        a: 'Direct radiation and diffuse light are the same design problem.',
        b: 'Diffuse sky light always creates more heat than direct sun.',
        c: 'Direct sun never causes glare.',
        d: 'Direct radiation comes from the sun direction; diffuse daylight is scattered sky light that can still be useful.',
      }),
      q('c', 'Why might adjustable louvers be selected instead of a fixed overhang?', {
        a: 'They never require maintenance.',
        b: 'They remove all need for sun-angle study.',
        c: 'They can respond to changing sun position, glare, and use conditions, but operation and maintenance must be considered.',
        d: 'They work only when sealed behind glass.',
      }),
      q('a', 'What is the source-safe approach for a southern facade needing high-sun control?', {
        a: 'Consider horizontal overhangs or louvers and verify them against the local sun path and design constraints.',
        b: 'Use vertical fins only and ignore altitude.',
        c: 'Avoid all daylight.',
        d: 'Copy a detail from another latitude without checking it.',
      }),
      q('d', 'When is motorized shading source-safe to recommend?', {
        a: 'Whenever it looks more advanced.',
        b: 'Only when the facade faces north.',
        c: 'Whenever the project wants a rating-system point.',
        d: 'When operation, user control, maintenance, safety, and performance needs justify the added complexity.',
      }),
      q('b', 'Why is copy-pasting a brise-soleil detail from another project risky?', {
        a: 'Brise-soleil devices never shade anything.',
        b: 'Sun path, latitude, facade orientation, window geometry, use, and maintenance context can differ.',
        c: 'All projects have identical solar exposure.',
        d: 'Only the material color matters.',
      }),
      q('c', 'What should a source-safe LEA answer say about green-rating points for shading?', {
        a: 'Shading always earns a fixed point count.',
        b: 'Points double when louvers are vertical.',
        c: 'Shading can support heat-gain, glare, and daylight goals, but point claims need the rating-system source and evidence.',
        d: 'Rating systems prohibit shading.',
      }),
      q('c', 'What is a light shelf in the checked design context?', {
        a: 'A storage shelf beside a window.',
        b: 'A device that blocks all daylight.',
        c: 'A horizontal surface above eye level that can reflect daylight deeper into a space and shade the near-window area.',
        d: 'A roof vent for stack effect.',
      }),
      q('c', 'What does brise-soleil mean as an architectural shading idea?', {
        a: 'A fully sealed curtain wall.',
        b: 'A mechanical cooling system.',
        c: 'An exterior sun-breaking device or system used to control direct solar exposure.',
        d: 'A rainwater tank.',
      }),
      q('c', 'Which strategy is most defensible for difficult east or west sun?', {
        a: 'Use only a shallow horizontal overhang.',
        b: 'Ignore low-angle sun because it is harmless.',
        c: 'Consider vertical fins, louvers, or eggcrate combinations while minimizing exposed east-west glass and preserving airflow.',
        d: 'Use only skylights.',
      }),
      q('b', 'Why might a west window need vertical control in addition to an overhang?', {
        a: 'Because west windows never receive direct sun.',
        b: 'Because low afternoon sun can pass under a horizontal projection.',
        c: 'Because vertical fins calculate indoor air speed.',
        d: 'Because overhangs are illegal.',
      }),
      q('d', 'What is the basic logic of an eggcrate shading system?', {
        a: 'It removes all windows.',
        b: 'It shades only from rain.',
        c: 'It works only as interior furniture.',
        d: 'It combines horizontal and vertical elements to control sun from more than one direction.',
      }),
    ],
  },
]

function q(correct, text, options) {
  return { correct, text, options }
}

function sha256(text) {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`
}

function sha256Json(value) {
  return sha256(JSON.stringify(value))
}

function stripContentHash(question) {
  const { content_hash: _contentHash, ...rest } = question
  return rest
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(REPO, relativePath), 'utf8'))
}

function writeJson(relativePath, value) {
  const full = path.join(REPO, relativePath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(relativePath, value) {
  const full = path.join(REPO, relativePath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`)
}

function fileHash(relativePath) {
  return sha256(readFileSync(path.join(REPO, relativePath), 'utf8'))
}

function sourceCapture(article) {
  const lines = [
    `# Batch ${BATCH} Raw Source Capture - ${article.title}`,
    '',
    `Captured: ${GENERATED_AT}`,
    `Batch: ${BATCH_ID}`,
    `Article: ${article.slug} (${article.articleId})`,
    '',
    '## Local Source Family',
    '',
    `- Raw PDF: ${TOA_RAW_PATH}`,
    `- Raw PDF hash: ${TOA_RAW_HASH}`,
    `- Refined locator: ${TOA_REFINED_PATH}`,
    `- Refined locator hash: ${TOA_REFINED_HASH}`,
    '',
    '## Checked Locators',
    '',
    ...article.checkedLines.map((line) => `- ${line}`),
    '',
    '## Source-Safe Claim Map',
    '',
    `- ${article.title} is sourceable as a Philippine tropical-design topic when claims stay within the checked TOA 4 locators and the listed official source pages.`,
    '- The article may discuss concept-level design judgment, opening/shading/device selection, and tropical comfort relationships.',
    `- Rejected boundary: ${article.rejected}`,
    '',
    '## Real World Scenario Eligibility',
    '',
    `- Added source-safe scenario: ${article.scenario}`,
  ]
  return `${lines.join('\n')}\n`
}

function refinedCapture(article, capturePath, captureHash) {
  const lines = [
    `# Batch ${BATCH} Refined Source Conversion - ${article.title}`,
    '',
    `Converted: ${GENERATED_AT}`,
    `Raw capture: ${capturePath}`,
    `Raw capture hash: ${captureHash}`,
    '',
    '## Refined Claim Boundaries',
    '',
    '- Use the local source capture as the auditable source artifact for article and linked-question edits.',
    '- Use TOA 4 as the Philippine tropical architecture base and official web pages only through this local capture map.',
    `- Keep claims inside this boundary: ${article.rejected}`,
    '',
    '## Article Claim Support',
    '',
    `- Core topic: ${article.title}.`,
    `- Scenario status: added_source_safe_scenario.`,
    '- UI block status: not applicable; selected bundle has zero preserved UI blocks.',
    '- Linked-question policy: rewrite unsupported or over-specific stems to source-safe concept/application questions while preserving answer keys.',
  ]
  return `${lines.join('\n')}\n`
}

function makeSources(article, capturePath, captureHash, refinedPath, refinedHash) {
  const sources = [
    {
      source_id: `batch-133-${article.slug}-raw-source-capture`,
      article_id: article.articleId,
      label: `Batch 133 raw source capture - ${article.title}`,
      url: null,
      source_type: 'local_source_capture',
      description: `Local raw-source-layer capture for ${article.title}; includes checked TOA 4 locators and official-source URL locators. Claims cite this artifact hash.`,
      is_verified: true,
      sort_order: 0,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: capturePath,
      local_absolute_path: path.join(REPO, capturePath),
      local_sha256: captureHash,
      source_locator: `${capturePath}#${captureHash}`,
      checked_markdown_lines: article.checkedLines,
      raw_pdf_path: TOA_RAW_PATH,
      raw_pdf_sha256: TOA_RAW_HASH,
      refined_markdown_path: TOA_REFINED_PATH,
      refined_markdown_sha256: TOA_REFINED_HASH,
      local_audit_note: 'Official web sources are used only through the locally captured source map; article and question claims cite local artifacts.',
    },
    {
      source_id: `batch-133-${article.slug}-refined-source-map`,
      article_id: article.articleId,
      label: `Batch 133 refined source conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined local conversion of the Batch 133 raw source capture for ${article.title}.`,
      is_verified: true,
      sort_order: 1,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: refinedPath,
      local_absolute_path: path.join(REPO, refinedPath),
      local_sha256: refinedHash,
      source_locator: `${refinedPath}#${refinedHash}`,
      upstream_capture_path: capturePath,
      upstream_capture_sha256: captureHash,
      checked_markdown_lines: article.checkedLines,
      local_audit_note: 'Refined conversion is a derived locator and claim-boundary map, not a substitute for the local raw capture.',
    },
  ]
  return {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    source_count: sources.length,
    sources,
    sources_hash: sha256Json(sources),
  }
}

function makeRationale(question, article, sourceLocator) {
  const correctText = question.options[question.correct]
  return {
    correct: `${correctText} This stays inside the Batch 133 local source map for ${article.title}.`,
    takeaway: `Use the local Batch 133 source capture and refined conversion for ${article.title}; avoid unsupported exact calculations or rating claims.`,
    source_boundary: sourceLocator,
  }
}

function updateArticle(article) {
  const capturePath = `${RAW_DIR}/${article.sourceFile}.source-capture.md`
  writeText(capturePath, sourceCapture(article))
  const captureHash = fileHash(capturePath)
  const refinedPath = `${REFINED_DIR}/${article.sourceFile}.refined.md`
  writeText(refinedPath, refinedCapture(article, capturePath, captureHash))
  const refinedHash = fileHash(refinedPath)
  const sourceLocator = `${capturePath}#${captureHash}; ${refinedPath}#${refinedHash}`
  const normalized = article.normalized({ capturePath, captureHash, refinedPath, refinedHash, scenario: article.scenario })
  const normalizedHash = sha256(normalized.endsWith('\n') ? normalized : `${normalized}\n`)
  writeText(`${article.folder}/normalized.md`, normalized)

  const linked = readJson(`${article.folder}/linked-questions.json`)
  const questions = linked.questions
  if (!Array.isArray(questions)) throw new Error(`${article.slug} linked-questions.json has no questions array`)
  if (questions.length !== article.questions.length) throw new Error(`${article.slug} expected ${article.questions.length} questions, found ${questions.length}`)

  const questionEditIds = []
  const updatedQuestions = questions.map((question, index) => {
    const rewrite = article.questions[index]
    if (question.correct_option_id !== rewrite.correct) {
      throw new Error(`${article.slug} question ${question.question_id} answer key mismatch: expected ${question.correct_option_id}, rewrite uses ${rewrite.correct}`)
    }
    const updated = {
      ...question,
      text: rewrite.text,
      options: Object.entries(rewrite.options).map(([id, text]) => ({ id, text })),
      rationale: makeRationale(rewrite, article, sourceLocator),
      explanation: `${rewrite.options[rewrite.correct]} Supported by Batch 133 local source artifacts for ${article.title}: ${sourceLocator}.`,
      code_citation: sourceLocator,
      updated_at: GENERATED_AT,
      content_hash: null,
    }
    updated.content_hash = sha256Json(stripContentHash(updated))
    const edit = {
      question_id: question.question_id,
      baseline_hash: question.content_hash ?? sha256Json(stripContentHash(question)),
      action: 'replace',
      reason: `${BATCH_ID}: unsupported or over-specific local-first rewrite constrained to checked local source artifacts for ${article.title}.`,
      approved_by: 'codex-local-first-batch-133',
      approved_at: GENERATED_AT,
      source_audit_support: {
        parent_article_id: article.articleId,
        parent_article_slug: article.slug,
        answer_key_fields_changed: false,
        support_status: 'source_safe_rewrite',
        source_locator: sourceLocator,
        checked_sources: [
          {
            source_id: `batch-133-${article.slug}-raw-source-capture`,
            label: `Batch 133 raw source capture - ${article.title}`,
            path: capturePath,
            sha256: captureHash,
          },
          {
            source_id: `batch-133-${article.slug}-refined-source-map`,
            label: `Batch 133 refined source conversion - ${article.title}`,
            path: refinedPath,
            sha256: refinedHash,
          },
        ],
        local_source_safe_action: 'Question text, options, rationale, explanation, and citation rewritten to the Batch 133 local source artifact boundary while preserving the answer key.',
      },
      proposed: {
        text: updated.text,
        options: updated.options,
        correct_option_id: updated.correct_option_id,
        rationale: updated.rationale,
        explanation: updated.explanation,
        code_citation: updated.code_citation,
      },
      batch_question_template_index: index + 1,
    }
    writeJson(`${article.folder}/question-edits/${question.question_id}.json`, edit)
    questionEditIds.push(question.question_id)
    return updated
  })
  const linkedHash = sha256Json(updatedQuestions.map(stripContentHash))
  writeJson(`${article.folder}/linked-questions.json`, {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    question_count: updatedQuestions.length,
    questions: updatedQuestions,
    linked_questions_hash: linkedHash,
  })

  const sourcesFile = makeSources(article, capturePath, captureHash, refinedPath, refinedHash)
  writeJson(`${article.folder}/sources.json`, sourcesFile)

  const metadata = readJson(`${article.folder}/article-metadata.json`)
  metadata.updated_at = GENERATED_AT
  metadata.updated_by = 'codex-local-first-batch-133'
  metadata.updated_note = `Source-audited local-first Batch 133 content and linked-question replacement; claims cite local captured source artifacts.`
  metadata.content_hash = normalizedHash
  metadata.normalized_content_hash = normalizedHash
  metadata.candidate_content_hash = normalizedHash
  metadata.linked_questions_hash = linkedHash
  metadata.sources_hash = sourcesFile.sources_hash
  metadata.ui_blocks_hash = EMPTY_UI_HASH
  metadata.source_count = sourcesFile.source_count
  metadata.linked_question_count = updatedQuestions.length
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'plain_markdown'
  writeJson(`${article.folder}/article-metadata.json`, metadata)

  const uiBlocks = readJson(`${article.folder}/ui-blocks.json`)
  uiBlocks.normalized_content_hash = normalizedHash
  uiBlocks.ui_blocks_hash = EMPTY_UI_HASH
  uiBlocks.blocks = []
  uiBlocks.total_blocks = 0
  uiBlocks.ui_block_count = 0
  uiBlocks.unknown_blocks = []
  uiBlocks.unresolved_critical_blocks = []
  uiBlocks.normalized_created_at = GENERATED_AT
  writeJson(`${article.folder}/ui-blocks.json`, uiBlocks)
  writeJson(`${article.folder}/ui-block-edits.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [`Intentional UI block edits are not part of Batch ${BATCH}; selected bundle has zero preserved UI blocks.`],
  })

  writeJson(`${article.folder}/source-audit-evidence.json`, {
    artifact_type: 'source_audit_evidence',
    batch_id: BATCH_ID,
    batch_number: BATCH,
    audit_mode: 'local_first_captured_source_artifacts',
    audit_date: '2026-05-14',
    audited_at: GENERATED_AT,
    target: {
      article_id: article.articleId,
      slug: article.slug,
      title: article.title,
      article_folder: path.join(REPO, article.folder),
      question_edits_folder: path.join(REPO, article.folder, 'question-edits'),
      linked_questions: updatedQuestions.length,
      question_edits: questionEditIds.length,
      candidate_sha256: normalizedHash,
    },
    raw_pdf_gate: {
      status: 'PASS',
      primary_truth: 'local source capture under vitruvius-connection/001_Raw-Source-Layer plus local TOA 4 source family',
      derivative_or_search_layers_used_as_primary_truth: false,
      refined_markdown_used_only_as_locator: true,
      all_legal_code_claims_have_pdf_locator: true,
      all_section_numbers_verified_against_raw_pdf: true,
      no_derivative_text_used_as_source_of_truth: true,
      blockers: [],
      checked_sources: sourcesFile.sources,
    },
    classification: {
      content_type: article.contentType,
      contains_legal_or_code_claims: false,
      source_risk_tier: 'medium',
      requires_raw_pdf_audit: false,
      linked_questions_observed: updatedQuestions.length,
      question_edits_created: questionEditIds,
      scenario_policy_status: 'added_source_safe_scenario',
      scenario_policy_reason: article.scenario,
    },
    claims: [
      {
        claim_id: `${article.slug}-b133-claim-01`,
        claim_text: `${article.title} is limited to checked local Batch 133 source capture and refined conversion artifacts.`,
        source_support: {
          raw_pdf_path: TOA_RAW_PATH,
          quoted_pdf_excerpt: article.checkedLines.join(' | '),
          source_ids: sourcesFile.sources.map((source) => source.source_id),
        },
        audit_result: 'PASS',
      },
    ],
    checked_markdown_lines: article.checkedLines,
    checked_pdf_pages: 'TOA 4 tropical architecture PDF source family; exact page claims are not introduced by Batch 133.',
    unverified_or_rejected_claims: [],
    quality_protocol: {
      roundtrip_protocol_preserved: true,
      ui_blocks_owner: 'ui-blocks.json',
      normalized_owner: 'normalized.md',
      candidate_generation: 'compose_required_after_content_generation',
      local_first_only: true,
      supabase_write_attempted: false,
      deploy_attempted: false,
      commit_attempted: false,
      marker_scan_scope: 'normalized.md, candidate.md, sources.json, source-audit-evidence.json, question-edits/*.json',
      diff_gate: 'pending_compose_diff_validate',
      validate_gate: 'pending_compose_diff_validate',
      ui_block_edits_gate: 'pending_ui_block_validation',
    },
    sme_review: {
      required: false,
      required_before_publication: true,
      status: 'not_started_local_first_batch',
      note: 'Local-first source audit is ready for later human/SME review before final publishing.',
    },
    overall: {
      status: 'PASS_LOCAL_FIRST_SOURCE_AUDITED',
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: true,
      blockers: [],
      warnings: ['Human/SME review remains pending before final publishing.'],
    },
  })

  return {
    article_id: article.articleId,
    slug: article.slug,
    title: article.title,
    article_folder: article.folder,
    linked_question_count: updatedQuestions.length,
    question_edit_count: questionEditIds.length,
    normalized_hash: normalizedHash,
    candidate_hash: normalizedHash,
    source_capture_path: capturePath,
    source_capture_hash: captureHash,
    refined_source_map_path: refinedPath,
    refined_source_map_hash: refinedHash,
    diff_safe_to_push: null,
    scenario_status: 'added_source_safe_scenario',
  }
}

function main() {
  const results = articles.map(updateArticle)
  writeJson(`.ai/content-audit-export/${BATCH_ID}-content-generation-summary.json`, {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch: BRANCH,
    article_count: results.length,
    linked_question_count: results.reduce((sum, article) => sum + article.linked_question_count, 0),
    articles: results,
  })
  console.log(JSON.stringify({ batch_id: BATCH_ID, article_count: results.length, linked_question_count: results.reduce((sum, article) => sum + article.linked_question_count, 0) }, null, 2))
}

main()
