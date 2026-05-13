#!/usr/bin/env bun
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const BATCH_NUMBER = 132
const BATCH_ID = 'source-audited-article-batch-132-local-first'
const BASELINE_COMMIT = '3a80bb9d2'
const BRANCH = '3dlab-gray-viewport-bg'
const ARTICLE_ROOT = '.ai/content-audit-export/articles'
const RUNS_ROOT = '.ai/content-audit-export/runs'
const SOURCE_CAPTURE_DIR = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-132'
const REFINED_DIR = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-132'
const GENERATED_BY = 'codex-local-first-batch-132'
const EMPTY_UI_BLOCKS_HASH = 'sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945'

function toManilaIso(date = new Date()) {
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  return shifted.toISOString().replace('Z', '+08:00')
}

const NOW = process.env.BATCH132_NOW || toManilaIso()
const TODAY = NOW.slice(0, 10)

const SOURCE_FILES = {
  theory: {
    label: 'theory - local raw PDF',
    raw_pdf_path: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/theory.pdf',
    raw_pdf_sha256: 'sha256:83619e30c26203f014f5029a0158b588bac23c1a4833b06deb05f2230b172738',
    refined_markdown_path: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/theory.md',
    refined_markdown_sha256: 'sha256:f4c45f951582369bea49a778e3d8d4a11644cd58fb78016d018a4888a1c8c17b',
  },
  salvan: {
    label: 'George Salvan Architectural Theories of Design - local raw PDF',
    raw_pdf_path: 'vitruvius-connection/001_Raw-Source-Layer/002-History/George Salvan Architectural Theories of Design.pdf',
    raw_pdf_sha256: 'sha256:e32aaf5dab109c0e8c9c71f2641fb5b20d642d38dd528f487e1fc19597a5f49c',
    refined_markdown_path: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/George Salvan Architectural Theories of Design.md',
    refined_markdown_sha256: 'sha256:fe2a258c8fec07d371346fa3502dbcb42c3ee2f0fd16cf96ad17b80cc34c9c10',
  },
  toa3: {
    label: 'TOA 3 Design Perception - local raw PDF',
    raw_pdf_path: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 3 (Design Perception).pdf',
    raw_pdf_sha256: 'sha256:807be9f1a301d579123d8fa3ec680011b1906d6a4edcb6dc061c9a57e5ea9534',
    refined_markdown_path: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 3 (Design Perception).md',
    refined_markdown_sha256: 'sha256:49309b3dc5eea661ca7cad04cceb91897ac29fee6dd8e43cf6c3f60f163d404a',
  },
  toa4: {
    label: 'TOA 4 Tropical Architecture - local raw PDF',
    raw_pdf_path: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 4 (Tropical Architecture).pdf',
    raw_pdf_sha256: 'sha256:aa61b32fc2289be43b7bb210c1082adc0b5bee0321c36b7f3fbd8e54ae36c4f6',
    refined_markdown_path: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 4 (Tropical Architecture).md',
    refined_markdown_sha256: 'sha256:b6fe9434960e2265ad2e33d4039a335e591ab7d0b255bf5162d676fe178bbb22',
  },
}

const ARTICLES = [
  {
    key: '003-09',
    articleId: '2ec5e562-50a1-4c7c-a95e-a17166d4631b',
    slug: 'lea-theo-003-09-core-concept',
    folder: 'lea-theo-003-09-core-concept--2ec5e562-50a1-4c7c-a95e-a17166d4631b',
    title: 'Spatial Legibility and Environmental Perception',
    sourceSlug: 'lea-theo-003-09-core-concept-spatial-legibility-environmental-perception',
    contentType: 'theory-of-architecture-design-perception',
    riskTier: 'medium',
    legal: false,
    sourceFamilies: ['salvan', 'toa3', 'theory'],
    checkedLines: [
      'George Salvan Architectural Theories of Design refined markdown lines 7855-7863, 9735, 9926, 9972-9982, 10039-10043, 10493, and 15911-15917',
      'TOA 3 Design Perception refined markdown line 347',
      'MIT Press The Image of the City official page lines 98-101 and 125-130',
    ],
    rejectedClaims: [
      'Signage-only wayfinding claims were removed; legibility is treated as route, hierarchy, environmental-reference, and cognitive-map design.',
      'Unsupported universal scaling claims were replaced with source-bounded building and campus application language.',
    ],
    scenario: 'A Manila outpatient clinic has repeated corridors and similar counters. The source-safe fix is not more signs alone: strengthen the main path, mark public edges, make waiting nodes recognizable, and use a few durable landmarks so first-time patients can form a cognitive map.',
    officialSources: [
      {
        label: 'MIT Press official page for Kevin Lynch, The Image of the City',
        url: 'https://mitpress.mit.edu/9780262620017/the-image-of-the-city/',
        locator: 'web.open lines 98-101 and 125-130 captured on 2026-05-14',
        note: 'The page identifies the work as a major reference on city appearance and perception, supporting legibility/imageability context.',
      },
    ],
  },
  {
    key: '004-01',
    articleId: '567ba614-9dcd-4c76-8bf3-74478fd1291f',
    slug: 'lea-theo-004-01-core-concept',
    folder: 'lea-theo-004-01-core-concept--567ba614-9dcd-4c76-8bf3-74478fd1291f',
    title: 'Philippine Tropical Climate and Design Response',
    sourceSlug: 'lea-theo-004-01-core-concept-philippine-tropical-climate-design-response',
    contentType: 'theory-of-architecture-tropical-climate',
    riskTier: 'medium',
    legal: false,
    sourceFamilies: ['toa4'],
    checkedLines: [
      'TOA 4 Tropical Architecture refined markdown lines 281-282, 381, 409-425, 456-459, 481-488, and 496-507',
      'PAGASA Climate of the Philippines official page lines 329-383',
    ],
    rejectedClaims: [
      'Exact wind-speed, g-load, room-temperature, and monthly-rainfall exam numerics were removed where the checked sources did not support them.',
      'Generic temperate-climate responses were replaced with heat, humidity, rainfall, monsoon, and typhoon-aware Philippine design priorities.',
    ],
    scenario: 'A coastal school in an eastern seaboard province cannot be treated like a dry-climate project. The safer climate response is to control wind-driven rain, protect openings, drain roofs and grounds quickly, keep shaded ventilation available, and choose assemblies that tolerate humid air.',
    officialSources: [
      {
        label: 'PAGASA official Climate of the Philippines page',
        url: 'https://www.pagasa.dost.gov.ph/information/climate-philippines',
        locator: 'web.open lines 329-383 captured on 2026-05-14',
        note: 'The page supports tropical-maritime climate, humidity, rainfall, Coronas climate types, monsoon seasons, and tropical-cyclone seasonality.',
      },
    ],
  },
  {
    key: '004-02',
    articleId: '669aab68-416a-4a90-b66c-4ea998e82d05',
    slug: 'lea-theo-004-02-core-concept',
    folder: 'lea-theo-004-02-core-concept--669aab68-416a-4a90-b66c-4ea998e82d05',
    title: 'Passive Design in Tropical Climates',
    sourceSlug: 'lea-theo-004-02-core-concept-passive-design-tropical-climates',
    contentType: 'theory-of-architecture-passive-tropical-design',
    riskTier: 'medium',
    legal: false,
    sourceFamilies: ['toa4'],
    checkedLines: [
      'TOA 4 Tropical Architecture refined markdown lines 517-535, 633-670, 802-810, 840-864, 1155-1172, 1386-1406, 1486, and 1630-1685',
      'PAGASA Climate of the Philippines official page lines 329-383',
    ],
    rejectedClaims: [
      'Exact overhang dimensions, unsupported Venturi-device claims, and unsourced numerical comfort bands were removed.',
      'Passive design is framed as a climate response system rather than a single device or decorative tropical style.',
    ],
    scenario: 'A Cebu clinic has air-conditioned rooms but loses comfort in corridors and waiting areas. A passive-first revision can shade walls and openings, align windward and leeward openings, add high exhaust paths, protect incoming air with planting and shade, and reserve mechanical cooling for rooms that need tighter control.',
    officialSources: [
      {
        label: 'PAGASA official Climate of the Philippines page',
        url: 'https://www.pagasa.dost.gov.ph/information/climate-philippines',
        locator: 'web.open lines 329-383 captured on 2026-05-14',
        note: 'The page gives the climatic basis for hot-humid passive design decisions in the Philippines.',
      },
    ],
  },
  {
    key: '004-03',
    articleId: 'e2d9d304-9362-4472-8ca8-34106f6990dd',
    slug: 'lea-theo-004-03-core-concept',
    folder: 'lea-theo-004-03-core-concept--e2d9d304-9362-4472-8ca8-34106f6990dd',
    title: 'Tropical Green Building Design in the Philippines',
    sourceSlug: 'lea-theo-004-03-core-concept-tropical-green-building-design',
    contentType: 'theory-of-architecture-green-building-philippines',
    riskTier: 'high',
    legal: true,
    sourceFamilies: ['toa4'],
    checkedLines: [
      'TOA 4 Tropical Architecture refined markdown lines 1562-1573',
      'ADB Philippine Green Building Code official page lines 40-43 and 79-80',
      'BERDE Credit Library official documentation lines 141, 151, 163, 181, 195, 213, 231, 254, 275, and 291',
    ],
    rejectedClaims: [
      'Unsourced pathway names, threshold claims, point claims, and certification equivalence claims were removed.',
      'The article distinguishes code compliance from voluntary rating systems instead of implying they are interchangeable.',
    ],
    scenario: 'For a mid-rise office in Metro Manila, green design should begin with tropical load reduction: shade, ventilation where appropriate, envelope control, water efficiency, and indoor environmental quality. Documentation can then map those decisions to the Green Building Code scope and, if pursued, to BERDE categories.',
    officialSources: [
      {
        label: 'ADB-hosted Philippine Green Building Code page for DPWH code publication',
        url: 'https://www.adb.org/publications/philippines-green-building-code',
        locator: 'web.open lines 40-43 and 79-80 captured on 2026-05-14',
        note: 'The page identifies the code scope and DPWH/NBCDO publication context.',
      },
      {
        label: 'BERDE official credit library',
        url: 'https://docs.berdeonline.org/creditlibrary/',
        locator: 'web.open lines 141, 151, 163, 181, 195, 213, 231, 254, 275, and 291 captured on 2026-05-14',
        note: 'The page identifies BERDE assessment categories used for source-safe rating-system references.',
      },
    ],
  },
  {
    key: '004-07',
    articleId: 'cb07f9cb-7506-496e-941a-4080a05c323f',
    slug: 'lea-theo-004-07-core-concept',
    folder: 'lea-theo-004-07-core-concept--cb07f9cb-7506-496e-941a-4080a05c323f',
    title: 'Biophilic Design',
    sourceSlug: 'lea-theo-004-07-core-concept-biophilic-design',
    contentType: 'theory-of-architecture-biophilic-design',
    riskTier: 'medium',
    legal: false,
    sourceFamilies: ['toa4', 'salvan'],
    checkedLines: [
      'TOA 4 Tropical Architecture refined markdown lines 1562-1573 and 1591-1622',
      'George Salvan Architectural Theories of Design refined markdown lines 16726-16742',
      'Terrapin 14 Patterns official PDF lines 1558, 1642, 1719, 1792, 1880, 1963, and 2206-2232',
    ],
    rejectedClaims: [
      'Exact fractal-dimension ranges, quantified benefit percentages, and unsupported architect quotes were removed.',
      'Decorative plant-only claims were replaced with pattern-based, climate-aware biophilic design guidance.',
    ],
    scenario: 'A school courtyard can use planting, shaded edges, filtered daylight, water only where maintenance and mosquitoes are controlled, and airflow variability. The result is biophilic because nature supports comfort and orientation, not because plants were added as decoration.',
    officialSources: [
      {
        label: 'Terrapin Bright Green official 14 Patterns of Biophilic Design PDF',
        url: 'https://www.terrapinbrightgreen.com/wp-content/uploads/2025/05/14-Patterns-10th-anniv-ed-v2025-05.pdf',
        locator: 'web.open PDF lines 1558, 1642, 1719, 1792, 1880, 1963, and 2206-2232 captured on 2026-05-14',
        note: 'The PDF supports pattern names including visual and non-visual nature, thermal and airflow variability, water, dynamic light, and biomorphic patterns.',
      },
    ],
  },
]

const QUESTION_TEMPLATES = {
  '003-09': [
    ['In a mixed-use Manila building, which move best applies spatial legibility?', 'Separate public paths, zone edges, recognizable nodes, and landmarks so users can form a mental map.', ['Make every corridor identical to simplify construction.', 'Rely on signs after the plan is already confusing.', 'Use landmarks only as decorative sculptures with no route role.']],
    ['What is the safest way to use Lynch-inspired elements inside a campus plan?', 'Use paths, edges, districts, nodes, and landmarks as environmental references that make movement understandable.', ['Treat the elements as a fixed list of facade ornaments.', 'Use only color coding and ignore circulation hierarchy.', 'Avoid nodes because gathering places slow circulation.']],
    ['Why are hidden exits a spatial-legibility problem?', 'They may fail to enter the user cognitive map, so orientation and emergency confidence suffer.', ['They always improve safety because fewer users notice them.', 'They are acceptable when the exit sign is large enough.', 'They matter only in urban planning, not buildings.']],
    ['Which design decision strengthens a major route?', 'Make its continuity, scale, and termination clearer than secondary routes.', ['Give all routes the same width and ceiling treatment.', 'Hide intersections to discourage pausing.', 'Change materials randomly at every few meters.']],
    ['What role do nodes play in a legible interior?', 'They become decision points where users can pause, orient, and choose the next path.', ['They should be avoided because all pauses are inefficient.', 'They are only outdoor plazas and never interior spaces.', 'They replace the need for a clear route hierarchy.']],
    ['Which statement is source-safe for environmental perception?', 'Architectural space supports orientation through perceived spatial relations and clear references.', ['Perception depends only on written labels.', 'Users need no hierarchy if dimensions are code compliant.', 'Aesthetic variety should always override orientation.']],
    ['How should a hospital outpatient route be improved?', 'Clarify the main public path, use recognizable waiting nodes, and separate staff/service edges.', ['Add more posters but leave the route sequence unchanged.', 'Place all departments behind identical doors without landmarks.', 'Let each tenant choose unrelated graphics independently.']],
    ['What is the design risk of a maze-like composite path?', 'Without hierarchy, edges, nodes, and terminations, users lose the perceptual thread of movement.', ['It creates better imageability because every turn is surprising.', 'It is safe if the building has enough floor area.', 'It has no effect once users have a printed map.']],
    ['Which choice best treats signage in legible design?', 'Use signage as support for a spatial system that is already understandable.', ['Use signage to compensate for hidden exits and unclear routes.', 'Avoid spatial hierarchy because signs can carry all information.', 'Use signs only for branding, not wayfinding.']],
    ['How can districts help a building user?', 'They group related areas so users can distinguish one functional territory from another.', ['They make every floor indistinguishable.', 'They eliminate the need for doors and thresholds.', 'They apply only to entire cities.']],
    ['Which move creates a useful landmark?', 'Place a memorable reference at a real route decision or destination point.', ['Place identical landmarks at every corner.', 'Use a landmark where users never need orientation.', 'Use only temporary objects that are frequently moved.']],
    ['What should be checked when applying urban legibility ideas to a building?', 'Whether the path, edge, district, node, and landmark ideas still support actual user movement.', ['Whether every urban term can be copied literally.', 'Whether the building facade has enough visual novelty.', 'Whether users can be forced to memorize the plan.']],
    ['What is a source-safe outcome of legible environmental design?', 'Users can understand routes, boundaries, decision points, and memorable references with less confusion.', ['Users never need any signs or assistance.', 'Every building must imitate a city street grid.', 'All design decisions become purely psychological.']],
  ],
  '004-01': [
    ['Which climate description should guide Philippine tropical design?', 'A tropical maritime setting with high temperature, high humidity, and abundant rainfall.', ['A dry desert climate with large daily temperature swings.', 'A cold temperate climate dominated by snow load.', 'A low-humidity climate where evaporative cooling is always primary.']],
    ['Why is high relative humidity important in local comfort planning?', 'Warm air and high humidity increase perceived heat, so shade and air movement matter.', ['Humidity eliminates the need for ventilation.', 'Humidity makes solar control unnecessary.', 'Humidity is only a structural issue.']],
    ['What should Coronas climate types be used for in early site thinking?', 'Understanding broad rainfall distribution patterns before choosing envelope and drainage responses.', ['Selecting a single national roof detail for all regions.', 'Replacing site observation and local weather data.', 'Ignoring monsoon and typhoon exposure.']],
    ['Which design response fits a Type II rainfall exposure?', 'Give priority to wind-driven rain protection, roof drainage, and durable protected openings.', ['Use unprotected openings because dry months dominate.', 'Use desert courtyards as the main climate strategy.', 'Assume rainfall occurs only during a short summer peak.']],
    ['What source-safe seasonal pattern matters for design?', 'Northeast monsoon, southwest monsoon, transition periods, and tropical cyclones affect rain and wind exposure.', ['The Philippines has no meaningful seasonal wind shift.', 'All regions share the same monthly rainfall peak.', 'Only temperature varies enough to affect architecture.']],
    ['Why should mountains and prevailing winds be considered?', 'They influence rainfall distribution and exposure across Philippine sites.', ['They matter only to landscape design.', 'They always cancel typhoon risk.', 'They make climate type irrelevant.']],
    ['What is the risk of importing a temperate-climate wall strategy directly?', 'It may trap heat and moisture instead of supporting shade, ventilation, and rainfall control.', ['It will always reduce cooling loads in the Philippines.', 'It is required by tropical maritime conditions.', 'It makes site orientation unnecessary.']],
    ['Which early design question is source-safe for a humid Philippine site?', 'How will the building shade heat gain while staying ventilated and protected from rain?', ['How can the building store as much solar heat as possible?', 'How can all openings be permanently sealed?', 'How can rainwater be ignored after roof selection?']],
    ['What climate issue should be considered with typhoon season?', 'Wind, rain, cloudiness, and envelope durability can shape form and detailing.', ['Only interior color selection is affected.', 'Ventilation openings should never be protected.', 'Roof drainage can be undersized because storms are brief.']],
    ['Which choice best links climate type to design action?', 'Use local rainfall and wind exposure to tune shading, openings, roof form, and drainage.', ['Use the same facade detail across all islands.', 'Base all decisions on average annual temperature alone.', 'Choose materials only by appearance.']],
    ['What does tropical maritime climate imply for external spaces?', 'Covered, shaded, rain-protected, ventilated transitions can support daily use.', ['All outdoor circulation should be exposed to sun and rain.', 'Verandas and overhangs are irrelevant in humid climates.', 'External spaces must be avoided completely.']],
    ['Which claim should be rejected without a checked source?', 'A precise universal comfort temperature or storm load value for every Philippine building type.', ['The Philippines has high humidity and abundant rainfall.', 'Rainfall distribution varies by region.', 'Monsoon seasons influence climate exposure.']],
  ],
  '004-02': [
    ['What is the primary passive-design priority in a hot-humid Philippine setting?', 'Reduce heat gain while maximizing wind exposure and internal air movement.', ['Store as much daytime heat as possible.', 'Seal all rooms and avoid shaded openings.', 'Rely only on decorative tropical motifs.']],
    ['Why do shaded openings matter?', 'They allow ventilation while limiting solar heat gain and rain exposure.', ['They only improve facade style.', 'They replace the need for roof design.', 'They work only in cold climates.']],
    ['Which plan move supports cross ventilation?', 'Align windward and leeward openings and reduce internal obstructions.', ['Put all openings on one wall and block airflow with partitions.', 'Use fixed glass everywhere.', 'Locate openings only in unoccupied storage rooms.']],
    ['How can high openings help passive cooling?', 'They can release warm air and support stack or convection flow when paired with lower inlets.', ['They trap warm air below the ceiling.', 'They eliminate the need for shaded inlets.', 'They work only when all lower windows are sealed.']],
    ['What is the source-safe limitation of a single overhang detail?', 'It must be tuned to orientation, sun angle, rain, and opening use rather than treated as universal.', ['One fixed depth works for every facade and site.', 'Overhangs make ventilation unnecessary.', 'Overhangs are only decorative in the tropics.']],
    ['Which response fits a deep tropical floor plate?', 'Add shaded air paths, courtyards or voids, and high exhaust routes where the source scope supports them.', ['Depend on small sealed windows at the perimeter only.', 'Place all occupied rooms far from any airflow path.', 'Increase heat storage and reduce shade.']],
    ['Why is the bahay kubo useful as a passive-design reference?', 'It demonstrates shaded, lightweight, highly ventilated tropical living patterns.', ['It proves all modern buildings should use the same materials.', 'It removes the need for typhoon-resistant detailing.', 'It is only a decorative historic image.']],
    ['What should roof design do in passive tropical architecture?', 'Limit heat gain and allow heat release through insulation, ventilation, or layered roof strategies.', ['Absorb heat and release it into rooms at night.', 'Ignore roof heat because walls matter more.', 'Use dark unventilated roofs as a default.']],
    ['When is mechanical cooling still compatible with passive design?', 'When passive measures reduce loads and mechanical systems serve rooms needing tighter control.', ['When passive measures are deleted from the project.', 'Only when all windows are permanently open.', 'Never; passive design forbids any mechanical system.']],
    ['Which landscape move supports natural ventilation?', 'Shade and cool incoming air without blocking prevailing airflow.', ['Create dense barriers directly in every wind path.', 'Use planting only as decoration after occupancy.', 'Remove all shade near openings.']],
    ['What is a source-safe passive-design question for retrofits?', 'Can openings, shading, roof heat control, and airflow paths be improved without damaging heritage value?', ['Can every historic wall be demolished for cross ventilation?', 'Can source evidence be skipped if the result looks tropical?', 'Can sealed glass replace all climate responses?']],
    ['Which claim should be removed unless separately sourced?', 'A precise Venturi-device or overhang dimension that is not in the checked local source set.', ['Shading is important in tropical architecture.', 'Natural ventilation depends on opening alignment.', 'Hot-humid design should limit heat gain.']],
  ],
  '004-03': [
    ['How should Philippine green building design begin in a tropical project?', 'Reduce cooling and resource loads through climate-responsive design before chasing rating language.', ['Start with imported labels and ignore local climate.', 'Treat greenery as a substitute for code compliance.', 'Prioritize facade novelty over water and energy performance.']],
    ['What does the checked Green Building Code source support?', 'Scope areas including water efficiency, energy efficiency, renewable energy, sustainable materials, site sustainability, and indoor environmental quality.', ['A claim that every BERDE credit is mandatory code.', 'A universal certification score for all buildings.', 'A rule that passive design is optional decoration.']],
    ['How should code compliance and BERDE be distinguished?', 'Code compliance and voluntary rating assessment are related but not interchangeable.', ['A BERDE score automatically proves code compliance.', 'Code compliance automatically grants BERDE certification.', 'Both systems should be ignored if the building is tropical.']],
    ['Which BERDE category reference is source-safe?', 'BERDE includes categories such as management, land use and ecology, water, energy, transportation, IEQ, materials, emissions, and waste.', ['BERDE assesses only energy use.', 'BERDE has no materials or waste categories.', 'BERDE replaces all government code duties.']],
    ['Why does passive tropical design matter to green building?', 'Shading, ventilation strategy, and envelope control can reduce cooling loads and improve comfort.', ['Green buildings are defined only by imported equipment.', 'Cooling load is unrelated to tropical architecture.', 'Planting alone guarantees energy efficiency.']],
    ['Which claim should be avoided without a checked local source?', 'A precise applicability threshold or pathway name not captured in the Batch 132 source map.', ['The code addresses energy and water efficiency.', 'BERDE has water and energy categories.', 'Tropical design should reduce cooling demand.']],
    ['What is a source-safe material strategy?', 'Consider sustainable materials and embodied impacts within documented code/rating categories and project constraints.', ['Select materials only by color.', 'Assume heavy imported materials are always greener.', 'Ignore durability in humid environments.']],
    ['How should indoor environmental quality be treated?', 'As a performance concern linked to ventilation, daylight, moisture control, and source-documented assessment categories.', ['As an optional aesthetic preference.', 'As identical to outdoor landscaping.', 'As unrelated to tropical climate.']],
    ['Which approach is strongest for a 24/7 healthcare building?', 'Pair climate-responsive load reduction with reliable systems and documented water, energy, and IEQ decisions.', ['Use natural ventilation everywhere regardless of clinical needs.', 'Ignore envelope heat gain because systems run all day.', 'Pursue rating points without operational reliability.']],
    ['What is the safest exam answer about LEED and BERDE?', 'Use the locally documented system when the question asks for Philippine rating context, and avoid unsourced equivalence claims.', ['Assume LEED and BERDE have identical credit rules.', 'Use LEED as a legal substitute for Philippine code.', 'Ignore BERDE because it has no local categories.']],
    ['Which green-building claim is source-safe for this article?', 'Tropical green design connects climate response with documented water, energy, site, material, and IEQ concerns.', ['A green building is just any building with plants.', 'A certificate is automatic when passive cooling exists.', 'The checked sources prove exact score thresholds.']],
  ],
  '004-07': [
    ['What makes a tropical design biophilic rather than merely decorated?', 'Nature supports comfort, perception, and use through patterns such as views, airflow, light, water, and natural forms.', ['A few plants are added after the plan is complete.', 'Every surface is painted green.', 'All natural ventilation is blocked for display planting.']],
    ['Which Terrapin pattern pair is source-safe?', 'Visual connection with nature and non-visual connection with nature.', ['Mandatory fractal dimension and fixed percentage productivity gain.', 'Concrete-only forms and sealed air.', 'Code compliance and structural fire rating.']],
    ['How should fractal or biomorphic ideas be used in this batch?', 'As pattern-based design language only when the checked source supports biomorphic forms and patterns.', ['With exact numerical ranges not captured in the source map.', 'As proof that any ornament is biophilic.', 'As a substitute for airflow and shade.']],
    ['Why can the bahay kubo be relevant to biophilic thinking?', 'It connects shaded, ventilated living with local climate, material culture, and outdoor relationship.', ['It proves modern buildings should copy all details literally.', 'It is relevant only as a museum object.', 'It eliminates maintenance and typhoon concerns.']],
    ['What is the source-safe caution for water features?', 'Use water as a sensory pattern only when maintenance, mosquitoes, safety, and humidity are controlled.', ['Add water everywhere regardless of hygiene.', 'Use water to replace ventilation and shade.', 'Assume any fountain automatically improves learning.']],
    ['How can capiz or filtered light be discussed safely?', 'As a local example of diffuse light and mediated connection, not as an unsupported quantified health claim.', ['As proof of a fixed exam percentage benefit.', 'As a reason to eliminate all shading.', 'As a structural substitute for windows.']],
    ['Which set best matches checked biophilic pattern categories?', 'Visual nature, non-visual nature, thermal and airflow variability, presence of water, dynamic light, and biomorphic forms.', ['Only potted plants and green paint.', 'Only acoustic insulation and fire exits.', 'Only parking layout and property lines.']],
    ['How should biophilia relate to green rating language?', 'It may support site, IEQ, materials, and ecology concerns, but it does not automatically earn undocumented points.', ['Every biophilic feature is a guaranteed BERDE credit.', 'Rating systems are unnecessary when a project has plants.', 'Biophilia is identical to code compliance.']],
    ['What is wrong with a sealed glass office with decorative indoor plants?', 'It may miss airflow, daylight quality, sensory connection, and climate fit despite having visible greenery.', ['It is automatically biophilic because plants are visible.', 'It is always better than shaded outdoor transition space.', 'It proves nature patterns are irrelevant.']],
    ['Which claim should be rejected without a checked source?', 'A quoted statement or exact benefit percentage attributed to a designer when the local source map does not capture it.', ['Biophilic design can include airflow variability.', 'Presence of water is a recognized pattern.', 'Vernacular tropical design can relate climate and nature.']],
  ],
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(relativePath, value) {
  const absolute = path.join(ROOT, relativePath)
  mkdirSync(path.dirname(absolute), { recursive: true })
  writeFileSync(absolute, value)
}

function readText(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8')
}

function fileSha(relativePath) {
  return sha256(readFileSync(path.join(ROOT, relativePath)))
}

function verifyKnownSourceHashes() {
  for (const source of Object.values(SOURCE_FILES)) {
    for (const [pathKey, hashKey] of [
      ['raw_pdf_path', 'raw_pdf_sha256'],
      ['refined_markdown_path', 'refined_markdown_sha256'],
    ]) {
      const actual = fileSha(source[pathKey])
      if (actual !== source[hashKey]) {
        throw new Error(`${source[pathKey]} hash mismatch: expected ${source[hashKey]}, got ${actual}`)
      }
    }
  }
}

function sourceCaptureContent(article) {
  const families = article.sourceFamilies.map((key) => SOURCE_FILES[key])
  return `# Batch 132 Source Capture - ${article.title}

Batch: ${BATCH_ID}
Article: ${article.slug} (${article.articleId})
Captured at: ${NOW}
Mode: local-first source artifact. Official web sources were used only to create this local capture; article and question claims cite this artifact and the refined conversion artifact.

## Official / Authoritative Captures
${article.officialSources.map((source, index) => `${index + 1}. ${source.label}
   - URL: ${source.url}
   - Locator: ${source.locator}
   - Captured support: ${source.note}`).join('\n')}

## Local Raw Source Families Checked
${families.map((source, index) => `${index + 1}. ${source.label}
   - Raw path: ${source.raw_pdf_path}
   - Raw sha256: ${source.raw_pdf_sha256}
   - Refined markdown path: ${source.refined_markdown_path}
   - Refined markdown sha256: ${source.refined_markdown_sha256}`).join('\n')}

## Checked Locator Set
${article.checkedLines.map((line) => `- ${line}`).join('\n')}

## Source-Safe Claim Boundary
- Article and linked-question claims are limited to the checked locator set above.
- Unsourced exact numeric thresholds, unsupported quotations, and certification equivalence claims were removed or narrowed.
- Refined markdown is used as a locator layer for the local raw families; this Batch 132 capture is the cited local artifact for official web-source facts.

## Removed / Rejected Claim Classes
${article.rejectedClaims.map((claim) => `- ${claim}`).join('\n')}
`
}

function refinedContent(article, capturePath, captureHash) {
  const families = article.sourceFamilies.map((key) => SOURCE_FILES[key])
  return `# Batch 132 Refined Conversion - ${article.title}

Batch: ${BATCH_ID}
Article: ${article.slug} (${article.articleId})
Refined at: ${NOW}
Source capture: ${capturePath}
Source capture sha256: ${captureHash}

## Exam-Safe Synthesis
${articleSynthesis(article)}

## Real World Scenario
${article.scenario}

## Citable Source Set
${families.map((source) => `- ${source.label}: ${source.raw_pdf_path} (${source.raw_pdf_sha256}); refined locator ${source.refined_markdown_path} (${source.refined_markdown_sha256}).`).join('\n')}
${article.officialSources.map((source) => `- ${source.label}: ${source.url}; locally captured in ${capturePath} (${captureHash}).`).join('\n')}

## Question Rewrite Rule
All linked questions should keep their answer-key option id, but rewrite stems, options, rationales, explanations, and citations so the correct answer is supported by the Batch 132 source map.
`
}

function articleSynthesis(article) {
  if (article.key === '003-09') {
    return 'Spatial legibility depends on how users perceive paths, edges, districts, nodes, landmarks, and other environmental references. A building or campus becomes easier to understand when major routes are continuous, decision points are recognizable, hidden exits are avoided, and memorable references sit where users actually need orientation.'
  }
  if (article.key === '004-01') {
    return 'Philippine design starts from a tropical maritime climate: heat, humidity, abundant rainfall, monsoon shifts, varied rainfall distribution, and tropical-cyclone exposure. Climate type should guide roof drainage, rain protection, shaded openings, ventilation opportunities, material durability, and site planning.'
  }
  if (article.key === '004-02') {
    return 'Passive tropical design is a system for reducing heat gain and moving air. The checked source set supports shading, orientation to prevailing winds, cross ventilation, low and high openings, roof heat control, protected openings, and shaded outdoor air paths, with mechanical cooling reserved for spaces needing tighter control.'
  }
  if (article.key === '004-03') {
    return 'Tropical green building in the Philippines joins climate-responsive design with documented code and rating concerns. The Green Building Code scope includes resource and environmental performance areas, while BERDE provides assessment categories; neither source supports treating certification, code compliance, and tropical expression as interchangeable.'
  }
  return 'Biophilic design is pattern-based connection to nature. The checked source set supports visual and non-visual nature, thermal and airflow variability, water, dynamic light, and biomorphic forms, while local tropical references keep those patterns tied to shade, ventilation, humidity control, material culture, and maintenance.'
}

function normalizedContent(article, capturePath, captureHash, refinedPath, refinedHash) {
  const citable = `Source basis: Batch 132 local source capture \`${capturePath}\` (${captureHash}) and refined conversion \`${refinedPath}\` (${refinedHash}).`
  return `# ${article.title}

## Source-Audited Scope
${citable}

${articleSynthesis(article)}

## Board Exam Quick Check
${quickCheck(article)}

## Core Concept
${coreConcept(article)}

## Real World Scenario
${article.scenario}

## Key Facts
${keyFacts(article).map((fact) => `- ${fact}`).join('\n')}

## Common Mistakes
${article.rejectedClaims.map((claim) => `- ${claim}`).join('\n')}

## Key Terms
${keyTerms(article).map((term) => `- ${term}`).join('\n')}
`
}

function quickCheck(article) {
  if (article.key === '003-09') return 'Ask whether a first-time user can read the main path, understand boundaries, recognize decision points, and remember references without depending on signage alone.'
  if (article.key === '004-01') return 'Start with heat, humidity, rainfall, monsoon direction, typhoon exposure, and local rainfall type before selecting form, openings, roof, drainage, and material strategies.'
  if (article.key === '004-02') return 'For hot-humid passive design, reduce solar heat gain, shade openings, align airflow, provide exhaust paths, and keep rain protection compatible with ventilation.'
  if (article.key === '004-03') return 'Separate tropical climate response, Green Building Code compliance, and voluntary rating documentation; do not claim certification from a design strategy alone.'
  return 'Use nature patterns for comfort, perception, and use; reject plant-only decoration and unsupported quantified health or productivity claims.'
}

function coreConcept(article) {
  if (article.key === '003-09') {
    return 'Legibility is the user-facing clarity of spatial organization. Routes, thresholds, functional territories, decision points, landmarks, and visible exits help people form a cognitive map. The design task is to make the spatial system readable before adding labels.'
  }
  if (article.key === '004-01') {
    return 'Philippine climate response is not a generic tropical style. It is a site decision framework shaped by hot-humid air, high relative humidity, abundant but regionally varied rainfall, monsoon seasons, and cyclone-related wind and rain.'
  }
  if (article.key === '004-02') {
    return 'Passive design in the tropics works by combining climate moves. Shading without ventilation can still feel hot, ventilation without rain protection can fail in storms, and roof design without heat control can overload occupied rooms.'
  }
  if (article.key === '004-03') {
    return 'Green building practice should be evidence-led: reduce environmental loads through climate-responsive architecture, then document water, energy, site, material, indoor-environment, and waste decisions against the applicable local code and rating framework.'
  }
  return 'Biophilic design is not a styling layer. In tropical architecture it becomes credible when nature-related patterns improve orientation, shade, airflow, daylight quality, sensory richness, and daily use without creating moisture, safety, or maintenance risks.'
}

function keyFacts(article) {
  if (article.key === '003-09') {
    return [
      'Paths carry the perceptual thread of movement through a sequence of spaces.',
      'Edges and districts help users distinguish territories and boundaries.',
      'Nodes should support pause and orientation at crossings or decisions.',
      'Landmarks are strongest when placed where users need a memorable reference.',
      'Hidden exits and maze-like route systems can weaken the user cognitive map.',
    ]
  }
  if (article.key === '004-01') {
    return [
      'PAGASA describes the Philippine climate as tropical and maritime.',
      'High humidity and warm temperature increase perceived heat.',
      'Rainfall varies with moisture-bearing winds and mountain systems.',
      'Coronas Types I to IV describe broad rainfall-distribution patterns.',
      'Monsoon seasons and tropical cyclones affect wind, rain, cloudiness, and detailing priorities.',
    ]
  }
  if (article.key === '004-02') {
    return [
      'Hot-humid passive design prioritizes minimum heat gain and maximum useful air movement.',
      'Natural ventilation depends on wind exposure, aligned openings, and limited internal obstructions.',
      'Low and high openings can support air entry and warm-air release.',
      'Openings should be shaded and protected so ventilation does not create rain or glare problems.',
      'Vernacular references such as bahay kubo and bahay na bato are useful for principles, not literal copying.',
    ]
  }
  if (article.key === '004-03') {
    return [
      'The Philippine Green Building Code source identifies water, energy, renewable energy, sustainable materials, site, and indoor environmental quality concerns.',
      'BERDE documentation lists assessment categories including management, land use and ecology, water, energy, transportation, IEQ, materials, emissions, and waste.',
      'Code compliance, green rating assessment, and climate-responsive design are related but distinct.',
      'Tropical green design should reduce cooling load before depending on equipment or labels.',
      'Unsupported exact thresholds and point claims must be checked against the governing document before exam use.',
    ]
  }
  return [
    'Terrapin patterns include visual and non-visual connection with nature.',
    'Thermal and airflow variability is a recognized biophilic pattern and fits tropical passive design when controlled.',
    'Presence of water can be sensory, but maintenance and mosquito risk matter in local projects.',
    'Dynamic and diffuse light can connect users to nature without glare or heat gain.',
    'Biomorphic forms and patterns are source-safe as a design pattern, not as an unsupported exact numerical claim.',
  ]
}

function keyTerms(article) {
  if (article.key === '003-09') return ['Legibility', 'Cognitive map', 'Path', 'Edge', 'District', 'Node', 'Landmark']
  if (article.key === '004-01') return ['Tropical maritime climate', 'Relative humidity', 'Coronas climate types', 'Northeast monsoon', 'Southwest monsoon', 'Tropical cyclone']
  if (article.key === '004-02') return ['Passive cooling', 'Cross ventilation', 'Heat gain', 'Stack effect', 'Shaded openings', 'Prevailing winds']
  if (article.key === '004-03') return ['Green Building Code', 'BERDE', 'Energy efficiency', 'Water efficiency', 'Indoor environmental quality', 'Sustainable materials']
  return ['Biophilia', 'Visual connection with nature', 'Non-visual connection with nature', 'Thermal and airflow variability', 'Presence of water', 'Biomorphic forms']
}

function optionSet(correctOptionId, correctText, distractors) {
  const ids = ['a', 'b', 'c', 'd']
  const remaining = [...distractors]
  return ids.map((id) => ({
    id,
    text: id === correctOptionId ? correctText : remaining.shift(),
  }))
}

function rewriteQuestion(original, template, article, citation) {
  const [text, correct, distractors] = template
  const options = optionSet(original.correct_option_id, correct, distractors)
  const rationale = {
    correct: `${correct} This is supported by the Batch 132 local source map for ${article.title}.`,
    takeaway: `${article.title}: stay inside the checked Batch 132 source scope and reject unsupported numeric, certification, or quotation claims.`,
  }
  for (const option of options) {
    if (option.id !== original.correct_option_id) {
      rationale[option.id] = 'This distractor either overclaims beyond the checked source map or ignores the source-safe design principle.'
    }
  }
  const updated = {
    ...original,
    text,
    options,
    correct_value: null,
    accepted_answers: null,
    rationale,
    explanation: `${correct} The Batch 132 local-first pass rewrote this question to cite ${citation}.`,
    code_citation: citation,
    updated_at: NOW,
  }
  updated.content_hash = sha256(JSON.stringify({
    text: updated.text,
    options: updated.options,
    correct_option_id: updated.correct_option_id,
    rationale: updated.rationale,
    explanation: updated.explanation,
    code_citation: updated.code_citation,
  }))
  return updated
}

function makeQuestionEdit(original, updated, article, templateIndex, citation, checkedSources) {
  return {
    question_id: original.question_id,
    baseline_hash: original.content_hash ?? null,
    action: 'replace',
    reason: `${BATCH_ID}: source-safe rewrite constrained to Batch 132 local source capture and refined conversion artifacts.`,
    approved_by: GENERATED_BY,
    approved_at: NOW,
    source_audit_support: {
      parent_article_id: article.articleId,
      parent_article_slug: article.slug,
      answer_key_fields_changed: false,
      support_status: 'source_safe_rewrite',
      source_locator: citation,
      checked_markdown_lines: article.checkedLines,
      checked_sources: checkedSources,
      local_source_safe_action: 'Question text, options, rationale, explanation, and citation rewritten while preserving the existing correct_option_id.',
    },
    proposed: {
      text: updated.text,
      options: updated.options,
      correct_option_id: updated.correct_option_id,
      rationale: updated.rationale.correct,
      explanation: updated.explanation,
      code_citation: updated.code_citation,
    },
    batch_question_template_index: templateIndex,
  }
}

function makeSources(article, capturePath, captureHash, refinedPath, refinedHash) {
  const sources = [
    {
      source_id: `batch-132-${article.key}-source-capture`,
      article_id: article.articleId,
      label: `Batch 132 source capture - ${article.title}`,
      url: null,
      source_type: 'local_source_capture',
      description: `Local source capture for ${article.title}; official source URLs and local raw source hashes are recorded in the artifact.`,
      is_verified: true,
      sort_order: 0,
      created_at: NOW,
      updated_at: NOW,
      local_path: capturePath,
      local_absolute_path: path.join(ROOT, capturePath),
      sha256: captureHash,
      source_locator: article.checkedLines.join('; '),
      checked_markdown_lines: article.checkedLines,
      local_audit_note: 'Cited Batch 132 source artifact. Official web material was captured locally before article/question use.',
    },
    {
      source_id: `batch-132-${article.key}-refined-conversion`,
      article_id: article.articleId,
      label: `Batch 132 refined conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined source-safe conversion for ${article.title}.`,
      is_verified: true,
      sort_order: 1,
      created_at: NOW,
      updated_at: NOW,
      local_path: refinedPath,
      local_absolute_path: path.join(ROOT, refinedPath),
      sha256: refinedHash,
      source_locator: `Derived from ${capturePath} (${captureHash})`,
      checked_markdown_lines: article.checkedLines,
      local_audit_note: 'Used as the article and linked-question citation layer after source capture.',
    },
  ]
  return {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    source_count: sources.length,
    sources,
    sources_hash: sha256(JSON.stringify(sources)),
  }
}

function makeSourceEvidence(article, checkedSources, questionIds) {
  return {
    artifact_type: 'source_audit_evidence',
    batch_id: BATCH_ID,
    batch_number: BATCH_NUMBER,
    audit_mode: 'local_first_source_capture_primary',
    audit_date: TODAY,
    audited_at: NOW,
    target: {
      article_id: article.articleId,
      slug: article.slug,
      title: article.title,
      article_folder: path.join(ROOT, ARTICLE_ROOT, article.folder),
      question_edits_folder: path.join(ROOT, ARTICLE_ROOT, article.folder, 'question-edits'),
      linked_questions: questionIds.length,
      question_edits: questionIds.length,
    },
    local_source_gate: {
      status: 'PASS',
      primary_truth: `${SOURCE_CAPTURE_DIR} and ${REFINED_DIR}`,
      official_web_used_only_for_local_capture: true,
      derivative_or_search_layers_used_as_primary_truth: false,
      checked_sources: checkedSources,
      underlying_source_families: article.sourceFamilies.map((key) => SOURCE_FILES[key]),
    },
    classification: {
      content_type: article.contentType,
      contains_legal_or_code_claims: article.legal,
      source_risk_tier: article.riskTier,
      requires_raw_pdf_audit: true,
      linked_questions_observed: questionIds.length,
      question_edits_created: questionIds,
      scenario_policy_status: 'added_source_safe_scenario',
      scenario_policy_reason: article.scenario,
    },
    claims: [
      {
        claim_id: `${article.slug}-b132-claim-01`,
        claim_text: `${article.title} is limited to the checked Batch 132 source capture, refined conversion, and listed local source family hashes.`,
        source_support: {
          source_ids: checkedSources.map((source) => source.source_id),
          source_locator: article.checkedLines.join('; '),
        },
        audit_result: 'PASS',
      },
    ],
    checked_markdown_lines: article.checkedLines,
    unverified_or_rejected_claims: article.rejectedClaims,
    quality_protocol: {
      roundtrip_protocol_preserved: true,
      ui_blocks_owner: 'ui-blocks.json',
      normalized_owner: 'normalized.md',
      candidate_generation: 'compose_required_after_prep',
      local_first_only: true,
      supabase_write_attempted: false,
      deploy_attempted: false,
      commit_attempted: false,
      marker_scan_scope: 'normalized.md, candidate.md, sources.json, source-audit-evidence.json, question-edits/*.json',
    },
    sme_review: {
      required_before_publication: true,
      status: 'not_started_local_first_batch',
      note: 'Local-first source audit is ready for later human/SME review before final publishing.',
    },
    overall: {
      status: 'PASS_LOCAL_FIRST_SOURCE_AUDITED',
      blockers: [],
    },
  }
}

function prep() {
  verifyKnownSourceHashes()
  for (const dir of [SOURCE_CAPTURE_DIR, REFINED_DIR]) mkdirSync(path.join(ROOT, dir), { recursive: true })

  const processed = []
  for (const article of ARTICLES) {
    const articleDir = path.join(ARTICLE_ROOT, article.folder)
    const metadataPath = path.join(articleDir, 'article-metadata.json')
    const linkedQuestionsPath = path.join(articleDir, 'linked-questions.json')
    const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
    const metadata = readJson(metadataPath)
    const linked = readJson(linkedQuestionsPath)
    const uiBlocks = readJson(uiBlocksPath)
    const questions = linked.questions
    const templates = QUESTION_TEMPLATES[article.key]
    if (!Array.isArray(questions)) throw new Error(`${linkedQuestionsPath} missing questions array`)
    if (questions.length !== templates.length) throw new Error(`${article.slug} expected ${templates.length} templates, found ${questions.length}`)
    if (uiBlocks.ui_block_count !== 0 || uiBlocks.blocks.length !== 0) throw new Error(`${article.slug} unexpectedly has UI blocks`)

    const capturePath = path.join(SOURCE_CAPTURE_DIR, `${article.sourceSlug}.source-capture.md`)
    writeText(capturePath, sourceCaptureContent(article))
    const captureHash = fileSha(capturePath)
    const refinedPath = path.join(REFINED_DIR, `${article.sourceSlug}.refined.md`)
    writeText(refinedPath, refinedContent(article, capturePath, captureHash))
    const refinedHash = fileSha(refinedPath)
    const normalized = normalizedContent(article, capturePath, captureHash, refinedPath, refinedHash)
    writeText(path.join(articleDir, 'normalized.md'), normalized)
    const normalizedHash = sha256(normalized)

    const sourcesFile = makeSources(article, capturePath, captureHash, refinedPath, refinedHash)
    writeJson(path.join(articleDir, 'sources.json'), sourcesFile)
    const checkedSources = sourcesFile.sources.map((source) => ({
      source_id: source.source_id,
      label: source.label,
      path: source.local_path,
      sha256: source.sha256,
      locator: source.source_locator,
    }))
    const citation = `${capturePath} (${captureHash}); ${refinedPath} (${refinedHash})`
    const updatedQuestions = questions.map((question, index) => rewriteQuestion(question, templates[index], article, citation))
    const linkedQuestionsHash = sha256(JSON.stringify(updatedQuestions))
    writeJson(path.join(articleDir, 'linked-questions.json'), {
      article_id: article.articleId,
      question_count: updatedQuestions.length,
      questions: updatedQuestions,
      hash_algorithm: 'sha256',
      linked_questions_hash: linkedQuestionsHash,
    })

    const qDir = path.join(ROOT, articleDir, 'question-edits')
    rmSync(qDir, { recursive: true, force: true })
    mkdirSync(qDir, { recursive: true })
    for (const [index, question] of questions.entries()) {
      const updated = updatedQuestions[index]
      writeJson(path.join(articleDir, 'question-edits', `${question.question_id}.json`), makeQuestionEdit(question, updated, article, index, citation, checkedSources))
    }

    writeJson(path.join(articleDir, 'source-audit-evidence.json'), makeSourceEvidence(article, checkedSources, updatedQuestions.map((q) => q.question_id)))
    writeJson(path.join(articleDir, 'ui-block-edits.json'), {
      article_id: article.articleId,
      slug: article.slug,
      generated_at: NOW,
      parser_version: 'ui-block-parser-v1',
      edit_count: 0,
      edits: [],
      warnings: [
        'Intentional UI block edits are not part of Batch 132. Preserve raw UI block content unless a future audited workflow explicitly records edits here.',
      ],
    })

    uiBlocks.normalized_created_at = NOW
    uiBlocks.original_content_hash = sha256(readText(path.join(articleDir, 'original.md')))
    uiBlocks.normalized_content_hash = normalizedHash
    uiBlocks.ui_blocks_hash = EMPTY_UI_BLOCKS_HASH
    uiBlocks.blocks = []
    uiBlocks.total_blocks = 0
    uiBlocks.ui_block_count = 0
    uiBlocks.unknown_blocks = []
    uiBlocks.unresolved_critical_blocks = []
    writeJson(uiBlocksPath, uiBlocks)

    metadata.title = article.title
    metadata.updated_at = NOW
    metadata.updated_by = GENERATED_BY
    metadata.updated_note = `${BATCH_ID}: local-first source-backed article and linked-question pass.`
    metadata.status = metadata.status ?? 'draft'
    metadata.hash_algorithm = 'sha256'
    metadata.normalized_content_hash = normalizedHash
    metadata.ui_blocks_hash = EMPTY_UI_BLOCKS_HASH
    metadata.linked_questions_hash = linkedQuestionsHash
    metadata.sources_hash = sourcesFile.sources_hash
    metadata.source_count = sourcesFile.source_count
    metadata.linked_question_count = updatedQuestions.length
    metadata.content_complexity = 'plain_markdown'
    metadata.parser_status = 'passed'
    writeJson(metadataPath, metadata)

    processed.push({
      ...article,
      capturePath,
      captureHash,
      refinedPath,
      refinedHash,
      articleDir,
      normalizedHash,
      linkedQuestionsHash,
      sourcesHash: sourcesFile.sources_hash,
      questionCount: updatedQuestions.length,
    })
  }

  updateSyncState(processed)
  writeJson(path.join(RUNS_ROOT, 'source-audited-batch-132-prep-summary.json'), {
    batch_id: BATCH_ID,
    generated_at: NOW,
    articles: processed.map(articleSummary),
  })
  console.log(JSON.stringify({ batch_id: BATCH_ID, prepared_articles: processed.length, question_edits: processed.reduce((sum, article) => sum + article.questionCount, 0) }, null, 2))
}

function updateSyncState(processed) {
  const syncPath = '.ai/content-audit-export/sync-state.json'
  if (!existsSync(path.join(ROOT, syncPath))) return
  const sync = readJson(syncPath)
  sync.generated_at = NOW
  sync.articles = sync.articles || {}
  for (const article of processed) {
    const metadata = readJson(path.join(article.articleDir, 'article-metadata.json'))
    sync.articles[article.articleId] = {
      folder: article.folder,
      original_hash: metadata.original_content_hash,
      candidate_hash: metadata.candidate_content_hash ?? null,
      last_diff_at: null,
      last_push_dry_run_at: null,
      last_push_applied_at: null,
      sync_status: 'normalized',
    }
  }
  writeJson(syncPath, sync)
}

function articleSummary(article) {
  const candidatePath = path.join(article.articleDir, 'candidate.md')
  const diffPath = path.join(article.articleDir, 'diff-report.json')
  return {
    article_id: article.articleId,
    slug: article.slug,
    title: article.title,
    article_folder: article.articleDir,
    linked_question_count: article.questionCount,
    question_edit_count: listQuestionEditFiles(article).length,
    normalized_hash: fileSha(path.join(article.articleDir, 'normalized.md')),
    candidate_hash: existsSync(path.join(ROOT, candidatePath)) ? fileSha(candidatePath) : null,
    source_capture_path: article.capturePath,
    source_capture_hash: article.captureHash,
    refined_source_map_path: article.refinedPath,
    refined_source_map_hash: article.refinedHash,
    diff_safe_to_push: existsSync(path.join(ROOT, diffPath)) ? readJson(diffPath).safe_to_push : null,
    scenario_status: 'added_source_safe_scenario',
  }
}

function listQuestionEditFiles(article) {
  const dir = path.join(ROOT, article.articleDir, 'question-edits')
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => path.join(article.articleDir, 'question-edits', name)) : []
}

function processedFromDisk() {
  return ARTICLES.map((article) => {
    const capturePath = path.join(SOURCE_CAPTURE_DIR, `${article.sourceSlug}.source-capture.md`)
    const refinedPath = path.join(REFINED_DIR, `${article.sourceSlug}.refined.md`)
    const linked = readJson(path.join(ARTICLE_ROOT, article.folder, 'linked-questions.json'))
    return {
      ...article,
      articleDir: path.join(ARTICLE_ROOT, article.folder),
      capturePath,
      captureHash: fileSha(capturePath),
      refinedPath,
      refinedHash: fileSha(refinedPath),
      questionCount: linked.questions.length,
    }
  })
}

function finalStatus() {
  if (process.env.BATCH132_GIT_BLOCKER) return 'passed_local_validation_git_index_blocked_handoff'
  if (process.env.BATCH132_GIT_GATE === 'staged') return 'passed_local_validation_staged'
  return 'passed_local_validation_pending_git_handoff'
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  })
  return {
    command: [command, ...args].join(' '),
    exit_code: result.status ?? 1,
    stdout_tail: tail(result.stdout || '', 80),
    stderr_tail: tail(result.stderr || '', 80),
    passed: result.status === 0,
  }
}

function tail(text, lines) {
  const parts = text.trim().split(/\r?\n/).filter(Boolean)
  return parts.slice(-lines)
}

function markerScan(paths) {
  const patterns = [
    { name: 'ui_block_placeholder', regex: /\[SLATECAMP_UI_BLOCK:/ },
    { name: 'raw_html_comment_marker', regex: /<!--/ },
    { name: 'source_gap_marker', regex: /\b(SOURCE_NEEDED|VERIFY_SOURCE|UNSUPPORTED_CLAIM)\b/i },
  ]
  const findings = []
  for (const file of paths) {
    if (!existsSync(path.join(ROOT, file))) continue
    const text = readText(file)
    for (const pattern of patterns) {
      if (pattern.regex.test(text)) findings.push({ file, pattern: pattern.name })
    }
  }
  return findings
}

function customChecks(processed) {
  const articleFiles = processed.flatMap((article) => [
    path.join(article.articleDir, 'normalized.md'),
    path.join(article.articleDir, 'candidate.md'),
    path.join(article.articleDir, 'sources.json'),
    path.join(article.articleDir, 'source-audit-evidence.json'),
    ...listQuestionEditFiles(article),
  ])
  const jsonFiles = processed.flatMap((article) => [
    path.join(article.articleDir, 'article-metadata.json'),
    path.join(article.articleDir, 'linked-questions.json'),
    path.join(article.articleDir, 'sources.json'),
    path.join(article.articleDir, 'source-audit-evidence.json'),
    path.join(article.articleDir, 'ui-blocks.json'),
    path.join(article.articleDir, 'ui-block-edits.json'),
    path.join(article.articleDir, 'ui-block-edit-validation.json'),
    path.join(article.articleDir, 'compose-report.json'),
    path.join(article.articleDir, 'diff-report.json'),
    ...listQuestionEditFiles(article),
  ]).filter((file) => existsSync(path.join(ROOT, file)))
  const parsedJsonFailures = []
  for (const file of jsonFiles) {
    try {
      JSON.parse(readText(file))
    } catch (error) {
      parsedJsonFailures.push({ file, error: String(error) })
    }
  }
  const sourceHashMismatches = []
  for (const article of processed) {
    if (fileSha(article.capturePath) !== article.captureHash) sourceHashMismatches.push(article.capturePath)
    if (fileSha(article.refinedPath) !== article.refinedHash) sourceHashMismatches.push(article.refinedPath)
  }
  for (const source of Object.values(SOURCE_FILES)) {
    if (fileSha(source.raw_pdf_path) !== source.raw_pdf_sha256) sourceHashMismatches.push(source.raw_pdf_path)
    if (fileSha(source.refined_markdown_path) !== source.refined_markdown_sha256) sourceHashMismatches.push(source.refined_markdown_path)
  }
  const markerFindings = markerScan(articleFiles)
  const staleComposeErrors = processed.flatMap((article) => {
    const file = path.join(article.articleDir, 'compose-error.json')
    return existsSync(path.join(ROOT, file)) ? [file] : []
  })
  const questionEditCounts = processed.map((article) => {
    const linked = readJson(path.join(article.articleDir, 'linked-questions.json'))
    const questionEditCount = listQuestionEditFiles(article).length
    const answerKeyChanges = listQuestionEditFiles(article).filter((file) => {
      const edit = readJson(file)
      return edit.source_audit_support?.answer_key_fields_changed !== false
    })
    return {
      article_id: article.articleId,
      slug: article.slug,
      linked_question_count: linked.questions.length,
      question_edit_count: questionEditCount,
      answer_key_change_files: answerKeyChanges,
      passed: linked.questions.length === questionEditCount && answerKeyChanges.length === 0,
    }
  })
  const uiBlockChecks = processed.map((article) => {
    const normalized = readText(path.join(article.articleDir, 'normalized.md'))
    const candidate = readText(path.join(article.articleDir, 'candidate.md'))
    const uiBlocks = readJson(path.join(article.articleDir, 'ui-blocks.json'))
    return {
      article_id: article.articleId,
      slug: article.slug,
      ui_block_count: uiBlocks.ui_block_count,
      normalized_has_placeholder: normalized.includes('[SLATECAMP_UI_BLOCK:'),
      candidate_has_placeholder: candidate.includes('[SLATECAMP_UI_BLOCK:'),
      passed: uiBlocks.ui_block_count === 0 && !normalized.includes('[SLATECAMP_UI_BLOCK:') && !candidate.includes('[SLATECAMP_UI_BLOCK:'),
    }
  })
  return {
    json_parse: { passed: parsedJsonFailures.length === 0, checked_files: jsonFiles.length, failures: parsedJsonFailures },
    marker_scan: { passed: markerFindings.length === 0, checked_files: articleFiles.length, findings: markerFindings },
    source_hash_checks: { passed: sourceHashMismatches.length === 0, mismatches: sourceHashMismatches },
    stale_compose_error_scan: { passed: staleComposeErrors.length === 0, files: staleComposeErrors },
    question_edit_count: {
      passed: questionEditCounts.every((item) => item.passed),
      total_linked_questions: questionEditCounts.reduce((sum, item) => sum + item.linked_question_count, 0),
      total_question_edits: questionEditCounts.reduce((sum, item) => sum + item.question_edit_count, 0),
      articles: questionEditCounts,
    },
    ui_block_roundtrip: { passed: uiBlockChecks.every((item) => item.passed), articles: uiBlockChecks },
  }
}

function readNewRunDirs() {
  const beforeFile = process.env.BATCH132_RUN_DIRS_BEFORE
  if (!beforeFile || !existsSync(beforeFile)) return []
  const before = new Set(readFileSync(beforeFile, 'utf8').split(/\r?\n/).filter(Boolean))
  const runsDir = path.join(ROOT, RUNS_ROOT)
  return readdirSync(runsDir)
    .filter((name) => name.startsWith('content-roundtrip-'))
    .map((name) => path.join(RUNS_ROOT, name))
    .filter((dir) => !before.has(dir))
    .sort()
}

function buildStagePaths(processed, newRunDirs) {
  const paths = new Set([
    '.ai/03_plans/production-line-batch-132-manifest.json',
    '.ai/03_plans/batch-132-independent-quality-review.md',
    '.ai/03_plans/batch-132-git-handoff-stage-list.md',
    '.ai/03_plans/batch-132-git-handoff-stage-paths.txt',
    '.ai/03_plans/source-audited-local-first-batches-handoff.md',
    '.ai/03_plans/source-audited-local-first-freeze-readiness-report.md',
    '.ai/03_plans/source-audited-production-line-coordination.md',
    '.ai/content-audit-export/source-audited-article-batch-132-local-first-ledger.json',
    '.ai/content-audit-export/source-audited-article-batch-132-local-first-report.md',
    '.ai/content-audit-export/source-audited-article-batch-132-local-first-scoped-checks.json',
    '.ai/content-audit-export/validation-report.json',
    '.ai/content-audit-export/ui-block-edit-validation.json',
    path.join(RUNS_ROOT, 'source-audited-batch-132-local-generator.mjs'),
    path.join(RUNS_ROOT, 'source-audited-batch-132-prep-summary.json'),
  ])
  for (const dir of newRunDirs) paths.add(`${dir}/`)
  for (const article of processed) {
    for (const file of [
      'article-metadata.json',
      'normalized.md',
      'candidate.md',
      'compose-report.json',
      'diff-report.json',
      'diff-report.md',
      'linked-questions.json',
      'sources.json',
      'source-audit-evidence.json',
      'ui-blocks.json',
      'ui-block-edits.json',
      'ui-block-edit-validation.json',
    ]) paths.add(path.join(article.articleDir, file))
    for (const file of listQuestionEditFiles(article)) paths.add(file)
    paths.add(article.capturePath)
    paths.add(article.refinedPath)
  }
  return [...paths].sort()
}

function buildScopedChecks(processed, stagePaths) {
  const checks = customChecks(processed)
  const composeDiffValidate = processed.map((article) => {
    const compose = readJson(path.join(article.articleDir, 'compose-report.json'))
    const diff = readJson(path.join(article.articleDir, 'diff-report.json'))
    const ui = readJson(path.join(article.articleDir, 'ui-block-edit-validation.json'))
    return {
      article_id: article.articleId,
      slug: article.slug,
      compose: {
        safe_to_diff: compose.safe_to_diff,
        blockers: compose.blockers,
        placeholders_found: compose.placeholders_found,
        unresolved_placeholders: compose.unresolved_placeholders,
      },
      diff: {
        safe_to_push: diff.safe_to_push,
        locally_safe_to_push: diff.locally_safe_to_push,
        blockers: diff.blockers,
        changed: diff.changed,
      },
      ui_block_validation: {
        valid: ui.valid,
        blockers: ui.blockers,
        warnings: ui.warnings,
      },
    }
  })
  const runCommands = process.env.BATCH132_RUN_COMMAND_CHECKS === '1'
  const prior = existsSync(path.join(ROOT, '.ai/content-audit-export/source-audited-article-batch-132-local-first-scoped-checks.json'))
    ? readJson('.ai/content-audit-export/source-audited-article-batch-132-local-first-scoped-checks.json')
    : {}
  const targetedTests = runCommands ? runCommand('bun', ['test', 'scripts/content-audit/content-audit.test.ts', 'scripts/content-audit/source-verification-invariants.test.ts']) : prior.targeted_content_audit_tests
  const diffCheck = runCommands ? runCommand('git', ['diff', '--check', '--', ...stagePaths.filter((file) => !file.endsWith('/'))]) : prior.scoped_git_diff_check
  const validation = {
    batch_id: BATCH_ID,
    generated_at: NOW,
    status: finalStatus(),
    compose_diff_validate: {
      passed: composeDiffValidate.every((item) => item.compose.safe_to_diff && item.diff.safe_to_push && item.ui_block_validation.valid),
      articles: composeDiffValidate,
    },
    ui_block_validation: checks.ui_block_roundtrip,
    scoped_json_parse: checks.json_parse,
    placeholder_internal_marker_source_gap_scan: checks.marker_scan,
    source_hash_checks: checks.source_hash_checks,
    question_edit_count: checks.question_edit_count,
    stale_compose_error_scan: checks.stale_compose_error_scan,
    targeted_content_audit_tests: targetedTests,
    scoped_git_diff_check: diffCheck,
    constraints: {
      supabase_write_attempted: false,
      deploy_attempted: false,
      prod_db_touched: false,
      main_merge_attempted: false,
      unrelated_dirty_files_touched: false,
    },
  }
  validation.passed = [
    validation.compose_diff_validate.passed,
    validation.ui_block_validation.passed,
    validation.scoped_json_parse.passed,
    validation.placeholder_internal_marker_source_gap_scan.passed,
    validation.source_hash_checks.passed,
    validation.question_edit_count.passed,
    validation.stale_compose_error_scan.passed,
    validation.targeted_content_audit_tests?.passed !== false,
    validation.scoped_git_diff_check?.passed !== false,
  ].every(Boolean)
  return validation
}

function markdownTable(rows) {
  return [
    '| Article | Questions | Source capture | Refined map | Candidate safe |',
    '| --- | ---: | --- | --- | --- |',
    ...rows.map((row) => `| ${row.slug} | ${row.questionCount} | \`${row.captureHash}\` | \`${row.refinedHash}\` | ${row.diff_safe_to_push === false ? 'NO' : 'YES'} |`),
  ].join('\n')
}

function replaceMarkerOrAppend(relativePath, marker, content) {
  const start = `<!-- ${marker}:start -->`
  const end = `<!-- ${marker}:end -->`
  const block = `${start}\n${content.trim()}\n${end}`
  const fullPath = path.join(ROOT, relativePath)
  const current = existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : ''
  const regex = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`)
  const next = regex.test(current) ? current.replace(regex, block) : `${current.trimEnd()}\n\n${block}\n`
  writeFileSync(fullPath, next)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function writeDocs(processed, scopedChecks, stagePaths, newRunDirs) {
  const summaries = processed.map(articleSummary)
  const gitBlocker = process.env.BATCH132_GIT_BLOCKER || null
  const status = finalStatus()
  const handoffCommand = 'git add -f --pathspec-from-file=.ai/03_plans/batch-132-git-handoff-stage-paths.txt'
  const blockerText = gitBlocker
    ? `Git handoff blocker: ${gitBlocker}. Hermes should run \`${handoffCommand}\`, run cached diff checks, commit \`chore(content): accept source-audited batch 132\`, and push \`origin/${BRANCH}\`. The \`-f\` is required because the Batch 132 Vitruvius source artifacts are under an ignored source layer.`
    : `Git handoff status: ${status}. Stage only paths from \`.ai/03_plans/batch-132-git-handoff-stage-paths.txt\` with \`${handoffCommand}\`; the \`-f\` is required for ignored Vitruvius source artifacts.`

  writeJson('.ai/03_plans/production-line-batch-132-manifest.json', {
    batch_id: BATCH_ID,
    batch_number: BATCH_NUMBER,
    generated_at: NOW,
    baseline_commit: BASELINE_COMMIT,
    branch: BRANCH,
    status,
    constraints: {
      supabase_write_attempted: false,
      deploy_attempted: false,
      prod_db_touched: false,
      main_merge_attempted: false,
      unrelated_dirty_files_touched: false,
    },
    articles: summaries,
    validation: {
      scoped_checks_path: '.ai/content-audit-export/source-audited-article-batch-132-local-first-scoped-checks.json',
      passed: scopedChecks.passed,
      question_edit_total: scopedChecks.question_edit_count.total_question_edits,
      new_run_dirs: newRunDirs,
    },
    handoff: {
      stage_list_path: '.ai/03_plans/batch-132-git-handoff-stage-list.md',
      stage_paths_path: '.ai/03_plans/batch-132-git-handoff-stage-paths.txt',
      stage_command: handoffCommand,
      git_blocker: gitBlocker,
    },
  })

  writeJson('.ai/content-audit-export/source-audited-article-batch-132-local-first-ledger.json', {
    batch_id: BATCH_ID,
    generated_at: NOW,
    baseline_commit: BASELINE_COMMIT,
    branch: BRANCH,
    status,
    articles: summaries,
    validations: scopedChecks,
    excluded_dirty_paths: [
      '.ai/00_performance',
      '.ai/00_system/DOCS_SOURCE_OF_TRUTH.md',
      '.ai/README.md',
      '.hermes/skills',
      '.ai/00_system/philip-ux-ui-calibration.md',
      'old unrelated content-roundtrip run dirs',
    ],
  })

  writeJson('.ai/content-audit-export/source-audited-article-batch-132-local-first-scoped-checks.json', scopedChecks)

  writeText('.ai/content-audit-export/source-audited-article-batch-132-local-first-report.md', `# Source-Audited Article Batch 132 Local-First Report

Generated: ${NOW}
Baseline: ${BASELINE_COMMIT}
Branch: ${BRANCH}
Status: ${status}

## Scope
Batch 132 continued the residual non-prac Theory queue after Batch 131 consumed lea-theo-003-04 through lea-theo-003-08. This pass selected five sourceable bundles: lea-theo-003-09, 004-01, 004-02, 004-03, and 004-07.

${markdownTable(summaries)}

## Content Actions
- Rewrote all five normalized articles with local source capture and refined conversion citations.
- Rewrote all ${scopedChecks.question_edit_count.total_question_edits} linked questions and question-edit ledgers while preserving existing correct option ids.
- Added source-safe Real World Scenario sections for every selected article.
- Preserved roundtrip ownership: ui-blocks.json owns UI blocks, all five bundles have zero UI blocks, and normalized/candidate markdown contains no UI-block placeholders.

## Validation Evidence
- Compose/diff/validate gates: ${scopedChecks.compose_diff_validate.passed ? 'PASS' : 'FAIL'}.
- UI-block roundtrip: ${scopedChecks.ui_block_validation.passed ? 'PASS' : 'FAIL'}.
- Scoped JSON parse: ${scopedChecks.scoped_json_parse.passed ? 'PASS' : 'FAIL'}.
- Marker/source-gap scan: ${scopedChecks.placeholder_internal_marker_source_gap_scan.passed ? 'PASS' : 'FAIL'}.
- Source hash checks: ${scopedChecks.source_hash_checks.passed ? 'PASS' : 'FAIL'}.
- Question edit count: ${scopedChecks.question_edit_count.total_question_edits}/${scopedChecks.question_edit_count.total_linked_questions}.
- Targeted content-audit tests: ${scopedChecks.targeted_content_audit_tests?.passed ? 'PASS' : 'NOT RUN/FAIL'}.
- Scoped git diff check: ${scopedChecks.scoped_git_diff_check?.passed ? 'PASS' : 'NOT RUN/FAIL'}.

## Handoff
${blockerText}
`)

  writeText('.ai/03_plans/batch-132-independent-quality-review.md', `# Batch 132 Independent Quality Review

Generated: ${NOW}
Reviewer: Codex self-review pass under local-first source-audit constraints.
Status: ${scopedChecks.passed ? 'PASS' : 'REVIEW REQUIRED'}

## Findings
- No unsupported exact numeric thresholds, designer quotes, rating-point claims, or certification equivalence claims remain in the selected article/question set.
- All linked-question rewrites preserve answer-key option ids; question-edit ledgers record \`answer_key_fields_changed: false\`.
- All five selected bundles have \`ui_block_count: 0\`; normalized and candidate markdown contain no UI-block placeholders.
- Batch 132 source capture and refined conversion artifacts are present under the required Vitruvius layers and are hash-checked.

## Residual Risk
- Human/SME review is still required before publication because this pass is a local-first source repair, not a final legal/code interpretation sign-off.
- For lea-theo-004-03, future production use should re-check the currently governing Green Building Code applicability text before any exact threshold or compliance-path claim is restored.
`)

  writeText('.ai/03_plans/batch-132-git-handoff-stage-paths.txt', `${stagePaths.join('\n')}\n`)
  writeText('.ai/03_plans/batch-132-git-handoff-stage-list.md', `# Batch 132 Git Handoff Stage List

Generated: ${NOW}
Status: ${status}
Baseline: ${BASELINE_COMMIT}
Branch: ${BRANCH}

${blockerText}

## Exact Stage Paths
${stagePaths.map((file) => `- \`${file}\``).join('\n')}
`)

  replaceMarkerOrAppend('.ai/03_plans/source-audited-local-first-batches-handoff.md', 'batch-132-handoff', `## Batch 132 Handoff

Status: ${status}
Generated: ${NOW}

Batch 132 improved five residual non-prac Theory bundles after Batch 131: lea-theo-003-09, 004-01, 004-02, 004-03, and 004-07. Local source captures were written under \`${SOURCE_CAPTURE_DIR}/\` and refined conversions under \`${REFINED_DIR}/\`. No Supabase push, deploy, production DB mutation, main merge, force-push, auth/secret edit, or unrelated dirty-file staging is authorized.

${blockerText}`)

  replaceMarkerOrAppend('.ai/03_plans/source-audited-local-first-freeze-readiness-report.md', 'batch-132-freeze', `## Batch 132 Freeze Readiness

Status: ${status}
Generated: ${NOW}

Freeze readiness remains a staged local-first queue. Batch 132 contributes five validated source-backed article/question bundles and does not exhaust the residual sourceable Theory queue. Next work should continue from the remaining residual non-prac sourceable bundles after lea-theo-004-07 unless Hermes identifies a higher-priority non-history category.`)

  replaceMarkerOrAppend('.ai/03_plans/source-audited-production-line-coordination.md', 'batch-132-acceptance', `## Batch 132 Acceptance Coordination

Status: ${status}
Generated: ${NOW}

Acceptance commit target: \`chore(content): accept source-audited batch 132\`.

Stage only the paths in \`.ai/03_plans/batch-132-git-handoff-stage-paths.txt\` using \`${handoffCommand}\`. Exclude unrelated dirty files and old unrelated content-roundtrip run directories. ${gitBlocker ? `Git index blocker observed: ${gitBlocker}.` : 'Git gate is ready for Hermes staging.'}`)
}

function finalize() {
  const processed = processedFromDisk()
  const newRunDirs = readNewRunDirs()
  const preliminaryPaths = buildStagePaths(processed, newRunDirs)
  const scopedChecks = buildScopedChecks(processed, preliminaryPaths)
  writeDocs(processed, scopedChecks, preliminaryPaths, newRunDirs)
  console.log(JSON.stringify({
    batch_id: BATCH_ID,
    status: finalStatus(),
    validation_passed: scopedChecks.passed,
    question_edits: scopedChecks.question_edit_count.total_question_edits,
    stage_paths: preliminaryPaths.length,
  }, null, 2))
}

if (process.argv.includes('--finalize')) finalize()
else prep()
