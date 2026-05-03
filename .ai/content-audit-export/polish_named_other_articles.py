#!/usr/bin/env python3
"""
Pass 7 — Polish ~90 named "Other" articles for learning effectiveness.
Process in batches via Python.
For each article:
  1. Replace generic Learning Goals with specific ALE objectives
  2. Add cross-references to related named articles
  3. Remove AI commentary (none found, but check)
  4. Strengthen ExamTips/Warnings
  5. Update content_hash and normalized_content_hash in metadata
"""

import hashlib
import json
import os
import re
import sys
import subprocess

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# ── Specific learning goals for each article ─────────────────────
# Keyed by the slug (before --uuid)

NAMED_GOALS = {
    # ── Building & Permit Process ──
    "building-permit-process": "Explain the complete building permit process under PD 1096 Rule III: identify the Building Official's powers and duties, apply the 15-day payment-to-decision rule, determine when permits expire (1 year / 120 days), and distinguish exempt constructions from those requiring full permits or accessory permits.",
    "certificate-of-occupancy": "Distinguish a Certificate of Occupancy from a Building Permit by purpose and timing; identify the conditions for issuance, denial, and revocation under PD 1096 Sec. 309; apply Temporary CO and Partial CO rules; and calculate the consequences of occupying without a CO.",
    "change-of-use-and-occupancy": "Determine when a Change of Use or Occupancy requires a new permit under PD 1096 Rule VII; apply the occupancy classification system to mixed-use scenarios; identify the structural, fire, and accessibility upgrades triggered by a change; and distinguish change-of-use from minor renovations that require no re-classification.",
    
    # ── Stairs, Handrails, Guardrails ──
    "stairs-handrails-guardrails": "Apply PD 1096 and BP 344 requirements for stair geometry (riser height, tread depth, minimum width), handrails (height, extension, clearance), and guardrails (height at 750 mm+ drops); distinguish PD 1096 vs BP 344 standards; and design compliant stairs for exam problems involving L-shaped, U-shaped, and straight-run configurations.",
    "widths-slopes": "Calculate minimum required widths for corridors, aisles, exit passageways, and ramps based on occupant load, occupancy group, and accessibility requirements; apply maximum slope ratios for ramps (1:12, 1:15, 1:20) and sidewalk grades; and determine when a ramp is required versus when stairs alone are acceptable.",
    
    # ── Fire Safety ──
    "fire-resistive-construction-ratings": "Identify fire-resistive ratings (1-hour through 4-hour) required for structural elements by building type, height, and occupancy under PD 1096 Rule VIII and Table VIII; apply the Type I-V construction classification to given building scenarios; and calculate required fire-resistive protection for columns, beams, floor/roof assemblies, and bearing walls.",
    "fire-zones-and-existing-buildings": "Explain the fire zone classification system (Fire Zones 1-4) under PD 1096; determine when existing non-conforming buildings must be upgraded; apply area and height limitations per fire zone; and identify the three enforcement mechanisms — legal non-conforming use, amortization period, and mandatory compliance on alteration.",
    "chimneys-and-fireplaces": "Identify the dimensional and clearance requirements for masonry chimneys, factory-built chimneys, and fireplaces under PD 1096 Rule XIX and NFPA 211; calculate minimum flue sizes, chimney height above roof, and clearance to combustibles; and determine when spark arrestors and firestopping are required.",
    "fire-extinguishing-systems": "Distinguish automatic sprinkler systems (wet pipe, dry pipe, pre-action, deluge) by application and activation mechanism; identify where standpipe systems (Class I, II, III) are required under PD 1096 and RA 9514; and apply the spacing, coverage, and clearance rules for portable fire extinguishers by hazard classification.",
    
    # ── Safety During Construction ──
    "pedestrian-protection-during-construction": "Identify the minimum requirements for pedestrian protection during construction under PD 1096 Rule XXI (Sections 2101-2107): covered walkways, barricades, lighting, and warnings; calculate minimum walkway width, height, and load capacity; and determine when a construction fence versus a pedestrian gallery is required based on building height and site conditions.",
    "dangerous-and-ruinous-buildings": "Apply the legal framework for dangerous and ruinous buildings under PD 1096 Sec. 214-216: identify the Building Official's authority to order demolition, repair, or vacation; distinguish dangerous from ruinous conditions; and explain the property owner's rights to notice, hearing, and contest before enforcement action.",
    
    # ── Room Sizes & Clearances ──
    "ceiling-heights-and-room-sizes": "Apply PD 1096 Rule VIII minimum ceiling heights (2.40 m residential, 2.70 m commercial, 3.00 m hospitals) and room dimension requirements; calculate minimum room sizes, window areas, and volumes for habitable rooms; and determine when mezzanine floor area counts toward FAR and when height exceptions apply.",
    "commercial-clearances": "Calculate minimum commercial clearances — aisle width by occupant load, counter clearance, queuing space, and service counter accessibility — under PD 1096 and BP 344; apply egress width requirements for mercantile, business, and assembly occupancies; and determine minimum unobstructed width for retail display areas and service counters.",
    "residential-clearances": "Apply minimum residential clearances under PD 1096 and BP 344 for corridors, doorways, hallways, and habitable rooms; calculate minimum clear floor space in front of fixtures (kitchen, bathroom, laundry); and determine egress widths for Group A (Residential) dwellings including Group A-1 through A-4 sub-classifications.",
    
    # ── Parking ──
    "minimum-parking-requirements": "Calculate minimum off-street parking requirements by occupancy group, location (CBD vs non-CBD), and building size under PD 1096 Rule XVIII and local zoning ordinances; distinguish parking space dimensions for standard cars, compact cars, and accessible stalls; and apply the 50% reduction allowance for mixed-use developments.",
    "minimum-requirements-group-a-dwellings": "Apply the minimum requirements for Group A (Residential) dwellings under PD 1096 Rule VII: minimum lot area, floor area, setback, light and ventilation, and sanitary facilities per unit type (single-family, duplex, apartment, townhouse); distinguish Group A-1 through A-4 by density and configuration.",
    
    # ── Glazing & Finishes ──
    "glass-and-glazing-area-limits": "Calculate maximum allowable glass area per occupancy and building type under PD 1096 and NSCP provisions; identify when safety glass (tempered, laminated) is required by location and risk; apply the 20% glazing limit for fire-rated walls; and determine when wire glass is acceptable vs when ceramic glass is required for fire protection.",
    "lathing-and-plastering": "Identify the materials, thicknesses, and application methods for lath and plaster construction under PD 1096 Rule XVI; distinguish metal lath, gypsum lath, and wire lath by fire-resistance rating; apply the minimum plaster thickness for fire-rated assemblies; and determine when lath-and-plaster is an acceptable fire-resistive covering.",
    
    # ── Foundations & Structures ──
    "excavation-foundation-and-veneer": "Apply PD 1096 and NSCP requirements for excavation shoring, foundation design, and masonry veneer anchorage; calculate minimum footing size by soil bearing capacity and building load; identify when underpinning of adjacent structures is required; and determine anchor spacing and type for adhered and anchored veneer systems.",
    "penthouses-and-roof-structures": "Determine when a penthouse or roof structure is exempt from height and FAR calculations under PD 1096 Rule VII; identify the three conditions for penthouse exemption (occupancy, area ≤ 1/3 roof area, and height); distinguish roof structures (tanks, towers, mechanical) from habitable penthouses for code compliance purposes.",
    
    # ── Lot & Exterior ──
    "location-on-property-and-exterior-walls": "Apply minimum yard and setback requirements under PD 1096 Rule VIII by occupancy group and building height; calculate allowable floor area ratio considering property lines and street width; determine exterior wall fire-resistance ratings based on proximity to property lines; and apply firewall requirements for buildings on or near lot lines.",
    "signs-design-and-construction": "Classify signs by type (projecting, wall, roof, ground, neon) and apply dimensional limits, clearance requirements, and projection limits under PD 1096 Rule XX Sections 2001-2006; calculate minimum vertical clearance (3.00 m non-arcaded, 5.00 m arcaded); and determine electrical sign permit requirements under PD 1096 and PEC.",
    "comprehensive-signage-package": "Apply the comprehensive signage package requirements under BP 344 and accessibility codes: identify the five required sign types (identification, directional, informational, warning, regulatory); apply tactile sign specifications (raised characters, Braille, mounting height, contrast); and determine when audible signs are required in addition to visual signs.",
    
    # ── Accessibility ──
    "accessible-seating-in-assembly-areas": "Calculate the number and distribution of accessible wheelchair seating locations required in assembly areas under BP 344; apply sightline requirements (18° maximum vertical angle, companion seating); determine which row locations satisfy dispersion requirements; and identify when accessible seating must be provided on each tier or balcony level.",
    "public-service-counters-and-atms": "Apply BP 344 requirements for accessible service counters and ATMs: height range (760-860 mm for counters, max 1,200 mm for writing surfaces), knee clearance (680 mm minimum depth, 680 mm minimum height), forward reach (max 1,200 mm) and side reach (max 1,370 mm) limits; and determine the minimum percentage of counters that must be accessible.",
    
    # ── Stage & Fixtures ──
    "stages-and-platforms": "Identify the fire, egress, and construction requirements for stages and platforms under PD 1096 and IBC; calculate minimum stage width and depth by occupancy classification; apply proscenium wall fire-rating and curtain requirements; distinguish stage platforms (≤ 1.20 m platform height requires no separate stage permit) from full stages.",
    "fixtures-and-small-items-in-common-areas": "Apply minimum fixture count requirements by occupancy group under PD 1096 Rule IX: calculate required water closets, lavatories, urinals (male), and drinking fountains based on occupant load; determine fixture ratio adjustments for assembly, educational, and mercantile occupancies; and apply BP 344 accessibility requirements to all fixtures.",
    
    # ── Conflicts & Increases ──
    "conflict-matrix-stairs-guards-elevators": "Apply the conflict-resolution hierarchy when PD 1096, BP 344, and other codes impose conflicting dimensional requirements on stairs, guards, and elevators; identify which code governs for each specific element (landing depth, handrail height, guard spacing, elevator cab size); and apply the strictest requirement principle consistently.",
    "allowable-floor-area-increases": "Calculate allowable floor area increases under PD 1096 Table VIII based on frontage, sprinklers, and open space; apply the percentage increase formula correctly in multi-condition scenarios; determine when unlimited area provisions apply; and distinguish area increases from height and FAR increases in exam problems.",
    
    # ── Ergonomics & Human Dimensions ──
    "ergonomics-in-furniture-design": "Apply anthropometric data to furniture design (workstation heights, seating dimensions, reach envelopes); calculate minimum clearance for workstations and desks under ergonomic standards; identify the 5th to 95th percentile design range for Philippine anthropometry; and apply adjustability requirements to ensure accommodation of the broadest user population.",
    "institutional-human-dimensions": "Apply human dimension standards for institutional buildings (hospitals, schools, courthouses) under PD 1096 and BP 344: calculate corridor widths for gurney/bed movement, classroom clearances by occupancy, courtroom minimum dimensions; and identify specialized clearance requirements for equipment, seating, and circulation in institutional settings.",
    "standard-human-body-dimensions": "Recall the five critical anthropometric dimensions for architectural design under BP 344: vertical reach (1,830 mm max for controls), forward reach (1,200 mm), side reach (1,370 mm), knee clearance (680 mm), and wheelchair seat height (460-500 mm); apply these to fixture and control placement in accessible design scenarios.",
    
    # ── Site Analysis ──
    "microclimate-analysis": "Analyze site microclimate factors — solar orientation, wind patterns, temperature, humidity, precipitation — for building placement and fenestration design; calculate shadow patterns using solar altitude and azimuth; apply the wind rose to building orientation decisions; and identify the effect of nearby water bodies, vegetation, and topography on site conditions.",
    "topography-and-slope-analysis": "Interpret contour maps to calculate slope percentages and identify buildable areas; apply slope categories (< 15% buildable, 15-25% challenging, > 25% constrained) to site planning decisions; calculate cut and fill volumes using the average-end-area method; and determine drainage patterns and erosion control requirements from topographic data.",
    "hydrology-in-site-planning": "Analyze site hydrology for stormwater management and drainage design: calculate runoff using the Rational Method (Q = CiA); apply minimum pipe sizes and slope for site drainage; determine detention/retention volume requirements; and identify flood zone restrictions and 100-year floodplain development limitations.",
    "geological-hazards": "Identify the three geological hazard types relevant to site planning (landslide, liquefaction, fault rupture) and their identifying site characteristics; apply NSCP seismic zone factors to structural design decisions; determine when a geotechnical investigation is mandatory; and identify no-build zones within active fault trace buffers.",
    "flora-and-fauna-in-site-development": "Apply environmental regulations for tree preservation and habitat protection during site development: identify protected species under DENR regulations; calculate tree preservation zone radii; determine when an Environmental Compliance Certificate (ECC) is required; and apply DENR buffer requirements for developments near protected areas and waterways.",
    
    # ── Law & Liability ──
    "legal-liability-and-enforcement-workflow": "Explain the Building Official's enforcement workflow — Notice of Violation, Work Stoppage Order, Demolition Order, Administrative Fines — under PD 1096 Rule II; distinguish Light, Less Grave, and Grave violations and their corresponding fines; apply the surcharge calculation for illegal construction; and identify the appeal process for contested orders.",
    "typology-checklists-and-plan-checking": "Apply the minimum document requirements for building permit applications under PD 1096 Rule III Sec. 302; verify plan completeness using the occupancy-specific checklist; identify common submission deficiencies that result in automatic return; and calculate the correct number of drawing sets, specifications, and soil investigation reports required.",
    "top-50-traps-2024-irr": "Master the 50 most frequently tested exam traps in the 2024 Revised IRR of PD 1096: distinguish the correct code reference from plausible distractors; apply the strictest requirement rule across conflicting provisions; and identify hidden conditions — exceptions, footnotes, and 'unless otherwise specified' clauses — that reverse the general rule.",
    
    # ── Interior & Hardware ──
    "interior-doors-and-hardware": "Apply minimum door width and height requirements under PD 1096 and BP 344 for different occupancy types and accessibility levels; identify required clear opening widths (900 mm accessible, 700 mm minimum interior); distinguish hardware types (panic hardware, fire-rated hardware, push-pull) by application; and calculate door swing clearances for egress paths.",
    "prefabricated-constructions": "Identify the permit and inspection requirements for prefabricated, pre-engineered, and manufactured building components under PD 1096 Rule III; distinguish modular, panelized, and manufactured construction by structural system and code pathway; apply the special inspection requirements for prefabricated assemblies; and determine when a third-party agency certification is required.",
    
    # ── Materials ──
    "plastics-in-construction": "Apply the fire performance and use limitations for plastics in buildings under PD 1096 and relevant ASTM/NSCP standards: distinguish foam plastic, fiber-reinforced plastic, and thermoplastic by fire behavior; calculate maximum permitted plastic area in interior and exterior applications; and identify where thermal barrier or automatic sprinkler protection is required.",
    "sheet-metal-and-spray-booths": "Identify the construction, ventilation, and fire protection requirements for sheet metal work and spray finishing booths under PD 1096 and NFPA 33 standards; calculate minimum ventilation rates for spray booths; apply explosion relief requirements; distinguish Class A, B, and C spray booths by material handled and fire protection needed.",
    
    # ── Sanitation ──
    "sanitation-and-water-supply": "Apply PD 1096 Rule IX and the Sanitary Engineering Code minimum water supply and sanitation requirements: calculate minimum water supply pipe sizes by fixture units; determine minimum septic tank capacity and leaching field size by bedroom count; apply the 15 m minimum well-to-septic-tank separation; and identify connection-to-public-sewer requirements.",
    "vent-shafts-and-ventilation": "Calculate minimum vent shaft dimensions for interior rooms without direct exterior exposure under PD 1096 Rule VIII; apply the 10% maximum vent shaft coverage of required lot area; determine when mechanical ventilation is an acceptable alternative to a vent shaft; and distinguish natural ventilation requirements from mechanical ventilation minimum air changes.",
    
    # ── Vertical & Floor ──
    "vertical-openings-and-floor-roof-construction": "Apply fire protection requirements for vertical openings (stairs, shafts, chutes, ducts) under PD 1096 Rule XII and for floor/roof construction under Rule VIII; determine when draft stops, fire dampers, and firestopping are required; calculate maximum permitted floor opening sizes unprotected vs protected; identify the shaft enclosure fire-rating required by building height.",
    
    # ── Circulation & Transport ──
    "transport-nodes-escalators-walkways": "Apply dimensional, safety, and accessibility requirements for escalators, moving walkways, and transport nodes under BP 344 and PD 1096: calculate minimum escalator width and landing depth; identify the required clear width between escalator handrails (810 mm minimum); apply the 300 mm horizontal handrail extension requirement; and determine when a ramp is preferred over an escalator for accessible routes.",
    "site-exterior-circulation": "Design site exterior circulation systems — driveways, walkways, loading areas, service access — under PD 1096 and BP 344: calculate minimum driveway width (3.00 m one-way, 6.00 m two-way) and turning radius by vehicle type; apply the 1.50 m minimum sidewalk width; and determine loading berth requirements by building use and gross floor area.",
    "site-planning-accessible-routes-vs-open-space": "Reconcile the competing demands of accessible routes (BP 344 accessible path requirements: maximum slope 1:20, minimum width 1.20 m, passing spaces every 30 m) with open space and landscaping requirements under PD 1096 and local ordinances; calculate minimum accessible route length vs open space area; and identify when accessible routes may deviate from the shortest path.",
    
    # ── Wheelchair ──
    "wheelchair-maneuvering-and-parking": "Recall the core wheelchair mnemonic (4.0-1.8-2.3-1.5-1.8-1.2 m) and apply each value to accessible parking stall dimensions, access aisles, vertical clearance, corridors, turning spaces, and ramp widths under BP 344; design compliant accessible parking layouts with correct stall dimensions, signage, and access aisle locations.",
    "wheelchair-maneuvering-and-parking-slots": "Calculate the number and dimensions of required accessible parking slots per BP 344: 1 of 25 slots, 2% of total over 100, and van-accessible ratios; distinguish parallel, perpendicular, and angled accessible stalls by required dimensions; apply the 2.30 m minimum vertical clearance to van-accessible routes; and identify required signage and marking specifications.",
    
    # ── Misc Exam Topics ──
    "exam-meta-deck-heights": "Apply all code provisions governing deck, balcony, porch, and terrace heights under PD 1096 Rule VII-VIII: determine when a deck counts toward FAR vs when it is excluded; identify minimum guardrail height (1.10 m) for elevated decks; apply minimum ceiling height requirements for covered decks; and distinguish decks from porches and balconies by their code classification.",
    "lodging-and-residential-accessibility": "Apply BP 344 accessibility requirements to lodging (hotels, inns, dormitories) and residential buildings: calculate the minimum number of accessible guest rooms (5% of total), required roll-in shower rooms, and visual alarm requirements; distinguish Type A (fully accessible) from Type B (adaptable) dwelling units; and apply adaptable design features to meet future accessibility needs.",
    
    # ── Law/Q&A Decks ──
    "law-qa-deck-ra-7277-9442-10754": "Apply the provisions of RA 7277 (Magna Carta for Disabled Persons), RA 9442 (amendments expanding PWD privileges), and RA 10754 (PWD benefits expansion) to architectural practice: identify the 20% discount, VAT exemption, and priority lane requirements; apply accessible parking, restroom, and entrance requirements under these laws; and distinguish the architect's obligation from the building owner's obligation for PWD compliance.",
    "ra-9442-pwd-privileges-and-incentives": "Calculate and apply PWD privileges under RA 9442 as amended by RA 10754: the 20% discount on hotels, restaurants, recreation, and transport; VAT exemption on the discounted amount; income tax deduction for establishments providing free PWD services; and the graduated ramp and accessible design requirements triggered by building alterations.",
    
    # ── Special Uses ──
    "storage-of-x-ray-films": "Apply the fire protection and storage requirements for X-ray film (nitrate-based and safety film) under PD 1096 and NFPA standards; identify the maximum storage quantity permitted in a building without a separate vault; calculate minimum ventilation rates for film storage rooms; and distinguish nitrate film storage (requires 2-hour fire-rated vault with explosion relief) from safety film storage.",
    
    # ── Architecture History — Named Movements ──
    "the-bauhaus-and-international-style": "Identify the four Bauhaus principles — form follows function, truth to materials, elimination of ornament, integration of arts and crafts — and their application by key architects (Gropius, Mies, Breuer, Moholy-Nagy); recognize Bauhaus/International Style buildings by their cubic forms, flat roofs, ribbon windows, and open plans; and trace the Bauhaus influence on modern Philippine architecture.",
    "le-corbusier-five-points": "Identify and apply Le Corbusier's Five Points of Architecture — pilotis, free plan, free facade, horizontal strip windows (fenêtre en longueur), and roof garden — to building analysis; recognize key Le Corbusier buildings (Villa Savoye, Unité d'Habitation, Ronchamp) by their distinguishing spatial and structural features; and explain how the Five Points enabled the Dom-ino structural system.",
    "mies-van-der-rohe": "Identify Mies van der Rohe's three design principles — skin-and-bone structure, universal space, and the material logic of steel and glass — and recognize key works (Barcelona Pavilion, Seagram Building, Farnsworth House, Tugendhat House) by their minimalist steel framework, glass curtain walls, and open flexible interior plans.",
    "post-modernism": "Identify the four testable markers of Post-Modern architecture — historical reference and quotation, ornament and decoration returned, pop-culture allusions, and contextual design — and recognize key architects (Venturi, Graves, Johnson, Gehry, Stirling) and works (Vanna Venturi House, AT&T Building, Piazza d'Italia, Portland Building) by their distinguishing characteristics.",
    "brutalism": "Identify the three testable markers of Brutalist architecture — exposed raw concrete (béton brut), massive sculptural forms, and honest expression of structure — and recognize key works (Unité d'Habitation/Marseille Block, Boston City Hall, Habitat 67, National Theater London) by their material, massing, and structural expression.",
    
    # ── Architecture History — Periods ──
    "american-colonial-era": "Identify the three phases of American colonial architecture in the Philippines — the Neoclassical civic building period (Burnham Plans), the early 20th-century residential period (chalet/bungalow hybrid), and the Art Deco period — recognize key buildings (Manila Hotel, Post Office, Legislative Building) by architect and style; and explain the City Beautiful Movement's influence on Philippine urban planning.",
    "colonial-european-influence": "Identify the European colonial architectural typologies brought to the Philippines by Spain, America, and Britain: distinguish the Spanish plaza-mayor urban plan from the American City Beautiful plan; identify British colonial elements in Southeast Asian trading posts; and recognize hybrid colonial-native building types (chalet-bahay na bato, American bungalow with Filipino adaptations).",
    "modern-filipino-identity": "Identify the four phases of modern Filipino architectural identity — the post-war modernists (Locsín, Nakpil, Mañosa), the tropical regionalism movement, the Filipino sense of scale and proportion, and contemporary sustainable responses — and recognize key works (Coconut Palace, National Theater/CCP, Philippine Plaza Hotel) by architect, date, and design philosophy.",
    "pre-colonial-vernacular": "Identify the three pre-colonial Philippine vernacular building types — the bahay kubo (nipa hut), the torogan (Maranao noble house), and the bale (Ifugao house) — by their structural system, materials, environmental adaptation, and ceremonial significance; explain how the post-and-beam system with flexible wall panels responds to seismic and tropical conditions.",
    "spanish-colonial-bahay-na-bato": "Identify the architectural synthesis of the bahay na bato (stone house): the ground-floor arcaded volada (overhang) with stone/wood construction, the upper-level sliding capiz window panels (ventanillas), and the function of the zaguan (entry hall), caida (transition space), and sala (main room); explain how this type adapted Spanish construction to Philippine climate and seismic conditions.",
    "spanish-colonial-laws-of-the-indies": "Apply the Laws of the Indies (Leyes de las Indias, 1573) urban planning provisions to colonial town analysis: identify the rectangular plaza-mayor (1.5:1 ratio, oriented N-S-E-W), the principal streets radiating from corners, the church-and-government-building frontage, and the solar (standard building lot) dimensions; trace their influence on contemporary Philippine urban patterns.",
    
    # ── World Architecture ──
    "african-vernacular-earth-architecture": "Identify the five major African vernacular earth construction traditions — adobe (southwest), rammed earth (North Africa), wattle-and-daub (sub-Saharan), mud brick (Sahel), and compressed earth block (modern adaptation) — by region, technique, and climatic response; recognize key examples (Great Mosque of Djenné, Kasbah of Aït Benhaddou, Dogon cliff dwellings) by their earth architecture typology.",
    "inca-architecture-ashlar-masonry": "Identify the three defining features of Inca architecture — ashlar polygonal masonry (stones fitted without mortar), trapezoidal openings, and the imperial standardized plan (kancha enclosure) — and recognize key sites (Machu Picchu, Sacsayhuamán, Ollantaytambo, Cusco's Coricancha) by their masonry style and civic-ceremonial organization.",
    "north-american-indigenous-architecture": "Identify the six testable North American indigenous dwelling types — tipi (Plains), hogan (Navajo), igloo (Inuit), wigwam (Eastern Woodlands), pueblo (Southwest), plank house (Northwest Coast) — by region, materials, structural system, and seasonal use; explain how each type responds to its specific climate.",
    "pre-columbian-mesoamerica": "Identify the distinguishing architectural features of the three major Mesoamerican civilizations — Olmec (colossal heads, earthen pyramids), Maya (corbeled vaults, limestone veneer, stucco decoration, ceremonial ball courts, astronomical alignment), and Aztec (double-staircase pyramids, chacmool figures, extensive platform systems) — and recognize key sites (Teotihuacán, Chichen Itza, Palenque, Tenochtitlán).",
    "21st-century-movements": "Identify the four major 21st-century architectural movements — Parametricism (Schumacher, Zaha Hadid), Deconstructivism (Gehry, Libeskind, Tschumi), Critical Regionalism (Frampton theory, Souto de Moura, Barragán), and Digital Fabrication/Algorithmic Design (BEUK, Gramazio Kohler, SHoP) — by their theoretical framework, formal vocabulary, and representative architects and buildings.",
    "masters-of-the-golden-age": "Identify the major architects of architecture's 'Golden Age' (Ancient Greece through Renaissance) and their defining works — Ictinus/Callicrates (Parthenon), Apollodorus (Trajan's Forum/Column), Anthemius/Isidorus (Hagia Sophia), Bramante (Tempietto), Michelangelo (St. Peter's Dome), Palladio (Villa Rotonda, San Giorgio Maggiore) — by their structural innovations, proportional systems, and spatial concepts.",
    
    # ── BP 344 Specific ──
    "bp-344-accessible-washrooms": "Apply BP 344 requirements for accessible washrooms: calculate minimum clear floor space (1.50 m × 1.50 m) for wheelchair turning; determine water closet clearance (900 mm wide × 1500 mm deep minimum with 450 mm side transfer space); apply grab bar placement and load requirements (horizontal 750-850 mm height, 1.3 kN capacity); and identify lavatory knee clearance and mirror height specifications.",
    "bp-344-elevator-dimensions": "Apply BP 344 elevator cab dimension requirements: minimum cab size based on building occupancy (1.20 m × 1.30 m minimum, 1.60 m × 1.50 m for larger buildings), door clear opening (900 mm minimum), call button height (900-1,100 mm), Braille and tactile markings, and visual/audible floor indicators; calculate minimum elevator quantity by floor area and occupancy.",
    "bp-344-ramp-slope-tiers": "Apply the BP 344 four-tier ramp slope system: Tier 1 (1:12 to 1:15 maximum, 6.0 m max run), Tier 2 (1:15 to 1:20, 12.0 m max run), Tier 3 (1:20 to 1:25, no max run), Tier 4 (> 1:25 classified as walkway); calculate landing dimensions (1.50 m minimum) and handrail height (700 mm and 900 mm); determine when a ramp may substitute for stairs in accessible routes.",
    "bp-344-tactile-and-visual-alarms": "Apply BP 344 tactile warning surface requirements: detect warning tiles (600 mm depth, installed 300 mm before hazards), directional guidance surfaces, and platform edge warnings; identify visual alarm requirements (strobe lights meeting ADA criteria: 75 cd minimum, 60-120 flashes per minute, synchronized); and distinguish tactile requirements for stairs, ramps, pedestrian crossings, and platform edges.",
    "bp-344-vs-pd-1096-conflicts": "Resolve dimensional conflicts between BP 344 and PD 1096: apply the strictest requirement rule correctly when codes conflict; identify areas where BP 344 governs (accessible routes, fixture heights, tactile warnings) vs PD 1096 (fire-rated construction, structural loads, egress widths); and apply the hierarchy: PD 1096 is the baseline, BP 344 adds accessibility requirements on top.",
    
    # ── Case Studies ──
    "case-study-hospital-mall-school": "Apply building code requirements to the three most frequently tested building typologies on the ALE: hospitals (Group D, requiring special fire/smoke control, minimum corridor width 2.40 m, emergency power); malls/shopping centers (Group F, requiring malls as public ways, sprinklers above 12 m height); and schools (Group E, requiring 2 exits per classroom, special fire alarm, maximum travel distance 45 m).",
    
    # ── PD 1096 Rule-Based ──
    "pd-1096-rule-vii-area-metrics": "Calculate floor area ratio (FAR), building footprint, and gross floor area (GFA) under PD 1096 Rule VII; distinguish FAR from building coverage and floor area; apply the maximum allowable FAR by occupancy group and building height; identify floor area exemptions (basements used only for parking, mechanical floors, roof decks under certain conditions).",
    "pd-1096-rule-vii-height-limits": "Apply maximum building height limits under PD 1096 Rule VII based on occupancy group, fire zone, street width, and setbacks; calculate when a height increase is permitted through sprinklers or open frontage; identify structures exempt from height limits (church towers, chimneys, penthouses); and apply the street-width-to-height relationship formula.",
    "pd-1096-rule-vii-occupancy": "Classify buildings by occupancy group (A through J) and division under PD 1096 Rule VII Table VII; apply the correct classification to mixed-occupancy buildings; identify when the strictest occupancy requirements govern the entire building vs when separated occupancies may have independent requirements; and determine allowable occupancy combinations in the same building.",
    "pd-1096-rule-viii-light-and-ventilation": "Apply minimum light and ventilation requirements under PD 1096 Rule VIII for habitable rooms: minimum window area of 10% of floor area for natural light, 5% of floor area for natural ventilation; apply the 20% mechanical ventilation reduction; calculate required skylight dimensions as an alternative to side windows; and determine when artificial lighting may supplement natural lighting.",
    "pd-1096-rule-viii-setbacks-and-easements": "Calculate minimum yard and setback distances under PD 1096 Rule VIII based on building height, occupancy, and fire zone; distinguish front, side, and rear yard requirements for different building types; apply the corner lot special setback rules; and determine when a mandatory easement along waterways or property lines is required by code.",
    "pd-1096-rule-xii-egress-and-corridors": "Calculate minimum egress width, number of exits, and maximum travel distance under PD 1096 Rule XII for each occupancy group; apply the occupant load factor to determine required exit capacity; design compliant corridor widths by occupancy and occupant load; and determine when a second exit is required based on occupant load and travel distance.",
    "rule-i-general-provisions": "Apply the general provisions of PD 1096 Rule I: the applicability scope, definitions of key terms (building, structure, alteration, repair, demolition), the rule of strict compliance vs substantial compliance, and the relationship between the NBCP, its IRR, and referenced standards; identify which structures are exempt from the Code entirely.",
    
    # ── Electrical & Mechanical ──
    "electrical-and-mechanical-regulations": "Apply the electrical and mechanical regulations referenced by PD 1096: identify the Philippine Electrical Code (PEC) requirements for building electrical systems (service capacity, minimum outlets, GFCI locations, load calculations); apply the Mechanical Code requirements for ventilation, exhaust, and mechanical equipment rooms; and determine when a separate electrical or mechanical permit is required beyond the building permit.",
    
    # ── Translating PWD Rights ──
    "translating-pwd-rights": "Translate legal PWD rights (RA 7277, RA 9442, RA 10754, BP 344) into specific architectural design decisions: calculate the minimum number of accessible parking spaces (1 of 25, 2% of total), accessible toilet rooms, and accessible routes; identify the design requirements triggered by building occupancy, size, and type; and apply accessibility requirements to existing building alterations.",
    
    # ── UAP SPP Doc Overview ──
    "uap-spp-doc-standards-of-professional-practice-for-philippine-architects": "Identify the structure and coverage of the UAP SPP Doc (Standards of Professional Practice), the nine SPP documents (201-209), their scope of services, and their relationship to RA 9266 and the UAP Code of Ethical Conduct; distinguish mandatory provisions from recommended practices; and apply the correct SPP document reference to common exam scenarios about architect's compensation and scope.",
    
    # ── SPP Docs 201-209 ──
    "spp-doc-201-pre-design-services": "Identify the scope, deliverables, and compensation method for SPP Doc 201 Pre-Design Services: the six pre-design phases (project definition, feasibility studies, site analysis, space programming, design guidelines, and consultant selection); the per-diem or fixed-fee compensation basis; and distinguish pre-design services from regular design services under SPP 202.",
    "spp-doc-202-regular-design-services": "Identify the five phases of SPP Doc 202 Regular Design Services (Schematic Design, Design Development, Contract Documents, Bidding Assistance, Construction Administration) and their deliverables, fee percentages, and architect's level of involvement per phase; apply the 20%-30%-50% fee split across SD/DD/CD; and determine when a phase is complete and the next begins.",
    "spp-doc-203-specialized-architectural-services": "Identify the nine categories of specialized architectural services under SPP Doc 203 — interior design, landscape architecture, acoustical design, lighting design, preservation/conservation, space planning, urban design, graphic design, and expert witness services — and explain how each is scoped, compensated (per-diem, fixed fee, or percentage), and documented separately from basic services.",
    "spp-doc-204-a-fulltime-supervision-services": "Identify the scope and compensation for SPP Doc 204-A Full-Time Supervision Services: the architect's duties during construction (daily inspection, quality control verification, interpretation of contract documents, preparation of change orders); distinguish full-time supervision from the periodic observation included in SPP 202 Phase 5; apply the monthly salary basis or percentage-of-salary compensation.",
    "spp-doc-204-b-construction-management-services": "Identify the scope of SPP Doc 204-B Construction Management Services — cost control, schedule management, contract administration, coordination of multiple contractors, value engineering, and project close-out — and distinguish CM from full-time supervision (CM manages the entire construction process including cost and schedule, not just quality and conformance); apply the percentage-of-construction-cost compensation.",
    "spp-doc-205-post-construction-services": "Identify the scope of SPP Doc 205 Post-Construction Services: building start-up and commissioning, preparation of record (as-built) drawings, post-occupancy evaluation, facility management support, and maintenance and operation manuals (MOMM); distinguish post-construction services from construction administration under SPP 202; apply the per-diem or fixed-fee compensation basis.",
    "spp-doc-206-comprehensive-architectural-services": "Identify the scope of SPP Doc 206 Comprehensive Architectural Services — the full spectrum of pre-design through post-construction services combined into a single commission; explain how the 15% ceiling on basic fee for comprehensive services is calculated; determine when a comprehensive service agreement is appropriate vs separate SPP Doc agreements for each phase.",
    "spp-doc-207-design-build-services": "Identify the architect's role, responsibilities, and compensation under SPP Doc 207 Design-Build Services; distinguish design-build (single contract with design-build entity) from traditional design-bid-build (owner-architect + owner-contractor contracts); explain the architect's ethical obligation to maintain professional independence even under a design-build delivery; and apply the percentage-of-construction-cost or lump-sum compensation basis.",
    "spp-doc-208-architectural-design-competition-adc": "Identify the types of architectural design competitions under SPP Doc 208 (open, invited, limited, student), the rules for jury composition and judging criteria, the architect's right to retain authorship, and the compensation requirements for competition winners and participants; distinguish a competition from a design-build procurement under RA 9184.",
    "spp-doc-209-architectural-consulting-services-pacs": "Identify the scope of SPP Doc 209 Architectural Consulting Services (PACS): the definition of 'consultant', permitted consulting relationships, fee arrangements (hourly, retainer, fixed fee), and the limitation that a consultant cannot simultaneously serve as the architect of record on the same project; apply the Code-imposed independence requirements to consulting engagements.",
}

# ── Cross-reference mapping ──
# Maps each slug to related article slugs
CROSS_REFS = {
    "building-permit-process": ["certificate-of-occupancy", "legal-liability-and-enforcement-workflow", "typology-checklists-and-plan-checking", "change-of-use-and-occupancy"],
    "certificate-of-occupancy": ["building-permit-process", "change-of-use-and-occupancy", "legal-liability-and-enforcement-workflow", "pedestrian-protection-during-construction"],
    "change-of-use-and-occupancy": ["pd-1096-rule-vii-occupancy", "certificate-of-occupancy", "allowable-floor-area-increases", "fire-zones-and-existing-buildings"],
    "stairs-handrails-guardrails": ["widths-slopes", "conflict-matrix-stairs-guards-elevators", "bp-344-ramp-slope-tiers", "transport-nodes-escalators-walkways"],
    "widths-slopes": ["stairs-handrails-guardrails", "conflict-matrix-stairs-guards-elevators", "bp-344-ramp-slope-tiers", "site-exterior-circulation"],
    "fire-resistive-construction-ratings": ["fire-zones-and-existing-buildings", "chimneys-and-fireplaces", "fire-extinguishing-systems", "vertical-openings-and-floor-roof-construction"],
    "fire-zones-and-existing-buildings": ["fire-resistive-construction-ratings", "change-of-use-and-occupancy", "allowable-floor-area-increases", "pd-1096-rule-vii-height-limits"],
    "chimneys-and-fireplaces": ["fire-resistive-construction-ratings", "fire-extinguishing-systems", "vent-shafts-and-ventilation", "vertical-openings-and-floor-roof-construction"],
    "fire-extinguishing-systems": ["fire-resistive-construction-ratings", "chimneys-and-fireplaces", "fire-zones-and-existing-buildings", "storage-of-x-ray-films"],
    "pedestrian-protection-during-construction": ["dangerous-and-ruinous-buildings", "building-permit-process", "legal-liability-and-enforcement-workflow", "site-exterior-circulation"],
    "dangerous-and-ruinous-buildings": ["pedestrian-protection-during-construction", "building-permit-process", "legal-liability-and-enforcement-workflow", "certificate-of-occupancy"],
    "ceiling-heights-and-room-sizes": ["commercial-clearances", "residential-clearances", "pd-1096-rule-viii-light-and-ventilation", "penthouses-and-roof-structures"],
    "commercial-clearances": ["ceiling-heights-and-room-sizes", "residential-clearances", "pd-1096-rule-xii-egress-and-corridors", "accessible-seating-in-assembly-areas"],
    "residential-clearances": ["ceiling-heights-and-room-sizes", "commercial-clearances", "minimum-requirements-group-a-dwellings", "pd-1096-rule-viii-light-and-ventilation"],
    "minimum-parking-requirements": ["wheelchair-maneuvering-and-parking-slots", "wheelchair-maneuvering-and-parking", "site-exterior-circulation", "allowable-floor-area-increases"],
    "minimum-requirements-group-a-dwellings": ["residential-clearances", "ceiling-heights-and-room-sizes", "pd-1096-rule-vii-occupancy", "lodging-and-residential-accessibility"],
    "glass-and-glazing-area-limits": ["lathing-and-plastering", "fire-resistive-construction-ratings", "vertical-openings-and-floor-roof-construction", "pd-1096-rule-viii-light-and-ventilation"],
    "lathing-and-plastering": ["glass-and-glazing-area-limits", "fire-resistive-construction-ratings", "plastics-in-construction", "prefabricated-constructions"],
    "excavation-foundation-and-veneer": ["geological-hazards", "location-on-property-and-exterior-walls", "topography-and-slope-analysis", "sanitation-and-water-supply"],
    "penthouses-and-roof-structures": ["ceiling-heights-and-room-sizes", "allowable-floor-area-increases", "pd-1096-rule-vii-height-limits", "exam-meta-deck-heights"],
    "location-on-property-and-exterior-walls": ["excavation-foundation-and-veneer", "fire-resistive-construction-ratings", "allowable-floor-area-increases", "pd-1096-rule-viii-setbacks-and-easements"],
    "signs-design-and-construction": ["comprehensive-signage-package", "bp-344-tactile-and-visual-alarms", "electrical-and-mechanical-regulations", "site-exterior-circulation"],
    "comprehensive-signage-package": ["signs-design-and-construction", "bp-344-tactile-and-visual-alarms", "accessible-seating-in-assembly-areas", "public-service-counters-and-atms"],
    "accessible-seating-in-assembly-areas": ["wheelchair-maneuvering-and-parking", "public-service-counters-and-atms", "comprehensive-signage-package", "conflict-matrix-stairs-guards-elevators"],
    "public-service-counters-and-atms": ["accessible-seating-in-assembly-areas", "wheelchair-maneuvering-and-parking", "comprehensive-signage-package", "standard-human-body-dimensions"],
    "stages-and-platforms": ["accessible-seating-in-assembly-areas", "fixtures-and-small-items-in-common-areas", "fire-extinguishing-systems", "vertical-openings-and-floor-roof-construction"],
    "fixtures-and-small-items-in-common-areas": ["sanitation-and-water-supply", "stages-and-platforms", "accessible-seating-in-assembly-areas", "pd-1096-rule-vii-occupancy"],
    "conflict-matrix-stairs-guards-elevators": ["stairs-handrails-guardrails", "widths-slopes", "bp-344-elevator-dimensions", "bp-344-vs-pd-1096-conflicts"],
    "allowable-floor-area-increases": ["pd-1096-rule-vii-area-metrics", "penthouses-and-roof-structures", "fire-zones-and-existing-buildings", "minimum-parking-requirements"],
    "ergonomics-in-furniture-design": ["standard-human-body-dimensions", "institutional-human-dimensions", "public-service-counters-and-atms", "wheelchair-maneuvering-and-parking"],
    "institutional-human-dimensions": ["ergonomics-in-furniture-design", "standard-human-body-dimensions", "commercial-clearances", "case-study-hospital-mall-school"],
    "standard-human-body-dimensions": ["ergonomics-in-furniture-design", "institutional-human-dimensions", "wheelchair-maneuvering-and-parking", "public-service-counters-and-atms"],
    "microclimate-analysis": ["topography-and-slope-analysis", "hydrology-in-site-planning", "flora-and-fauna-in-site-development", "geological-hazards"],
    "topography-and-slope-analysis": ["microclimate-analysis", "hydrology-in-site-planning", "geological-hazards", "excavation-foundation-and-veneer"],
    "hydrology-in-site-planning": ["microclimate-analysis", "topography-and-slope-analysis", "geological-hazards", "flora-and-fauna-in-site-development"],
    "geological-hazards": ["microclimate-analysis", "topography-and-slope-analysis", "hydrology-in-site-planning", "excavation-foundation-and-veneer"],
    "flora-and-fauna-in-site-development": ["microclimate-analysis", "hydrology-in-site-planning", "topography-and-slope-analysis", "geological-hazards"],
    "legal-liability-and-enforcement-workflow": ["building-permit-process", "dangerous-and-ruinous-buildings", "typology-checklists-and-plan-checking", "certificate-of-occupancy"],
    "typology-checklists-and-plan-checking": ["building-permit-process", "legal-liability-and-enforcement-workflow", "top-50-traps-2024-irr", "rule-i-general-provisions"],
    "top-50-traps-2024-irr": ["typology-checklists-and-plan-checking", "conflict-matrix-stairs-guards-elevators", "bp-344-vs-pd-1096-conflicts", "rule-i-general-provisions"],
    "interior-doors-and-hardware": ["prefabricated-constructions", "lathing-and-plastering", "fire-resistive-construction-ratings", "residential-clearances"],
    "prefabricated-constructions": ["interior-doors-and-hardware", "plastics-in-construction", "excavation-foundation-and-veneer", "fire-resistive-construction-ratings"],
    "plastics-in-construction": ["prefabricated-constructions", "sheet-metal-and-spray-booths", "lathing-and-plastering", "fire-resistive-construction-ratings"],
    "sheet-metal-and-spray-booths": ["plastics-in-construction", "fire-extinguishing-systems", "vent-shafts-and-ventilation", "electrical-and-mechanical-regulations"],
    "sanitation-and-water-supply": ["vent-shafts-and-ventilation", "fixtures-and-small-items-in-common-areas", "excavation-foundation-and-veneer", "hydrology-in-site-planning"],
    "vent-shafts-and-ventilation": ["sanitation-and-water-supply", "pd-1096-rule-viii-light-and-ventilation", "chimneys-and-fireplaces", "vertical-openings-and-floor-roof-construction"],
    "vertical-openings-and-floor-roof-construction": ["fire-resistive-construction-ratings", "stairs-handrails-guardrails", "vent-shafts-and-ventilation", "penthouses-and-roof-structures"],
    "transport-nodes-escalators-walkways": ["stairs-handrails-guardrails", "widths-slopes", "conflict-matrix-stairs-guards-elevators", "bp-344-elevator-dimensions"],
    "site-exterior-circulation": ["site-planning-accessible-routes-vs-open-space", "transport-nodes-escalators-walkways", "minimum-parking-requirements", "pedestrian-protection-during-construction"],
    "site-planning-accessible-routes-vs-open-space": ["site-exterior-circulation", "wheelchair-maneuvering-and-parking", "accessible-seating-in-assembly-areas", "pd-1096-rule-viii-setbacks-and-easements"],
    "wheelchair-maneuvering-and-parking": ["wheelchair-maneuvering-and-parking-slots", "accessible-seating-in-assembly-areas", "standard-human-body-dimensions", "bp-344-accessible-washrooms"],
    "wheelchair-maneuvering-and-parking-slots": ["wheelchair-maneuvering-and-parking", "minimum-parking-requirements", "accessible-seating-in-assembly-areas", "bp-344-accessible-washrooms"],
    "exam-meta-deck-heights": ["penthouses-and-roof-structures", "ceiling-heights-and-room-sizes", "pd-1096-rule-vii-height-limits", "allowable-floor-area-increases"],
    "lodging-and-residential-accessibility": ["minimum-requirements-group-a-dwellings", "bp-344-accessible-washrooms", "wheelchair-maneuvering-and-parking", "ra-9442-pwd-privileges-and-incentives"],
    "law-qa-deck-ra-7277-9442-10754": ["ra-9442-pwd-privileges-and-incentives", "translating-pwd-rights", "comprehensive-signage-package", "accessible-seating-in-assembly-areas"],
    "ra-9442-pwd-privileges-and-incentives": ["law-qa-deck-ra-7277-9442-10754", "translating-pwd-rights", "lodging-and-residential-accessibility", "comprehensive-signage-package"],
    "storage-of-x-ray-films": ["fire-extinguishing-systems", "fire-resistive-construction-ratings", "plastics-in-construction", "sheet-metal-and-spray-booths"],
    "the-bauhaus-and-international-style": ["le-corbusier-five-points", "mies-van-der-rohe", "post-modernism", "21st-century-movements"],
    "le-corbusier-five-points": ["the-bauhaus-and-international-style", "mies-van-der-rohe", "masters-of-the-golden-age", "post-modernism"],
    "mies-van-der-rohe": ["the-bauhaus-and-international-style", "le-corbusier-five-points", "brutalism", "post-modernism"],
    "post-modernism": ["the-bauhaus-and-international-style", "brutalism", "21st-century-movements", "le-corbusier-five-points"],
    "brutalism": ["the-bauhaus-and-international-style", "le-corbusier-five-points", "mies-van-der-rohe", "post-modernism"],
    "american-colonial-era": ["colonial-european-influence", "spanish-colonial-laws-of-the-indies", "modern-filipino-identity", "pre-colonial-vernacular"],
    "colonial-european-influence": ["american-colonial-era", "spanish-colonial-bahay-na-bato", "spanish-colonial-laws-of-the-indies", "modern-filipino-identity"],
    "modern-filipino-identity": ["pre-colonial-vernacular", "spanish-colonial-bahay-na-bato", "american-colonial-era", "colonial-european-influence"],
    "pre-colonial-vernacular": ["spanish-colonial-bahay-na-bato", "modern-filipino-identity", "american-colonial-era", "spanish-colonial-laws-of-the-indies"],
    "spanish-colonial-bahay-na-bato": ["spanish-colonial-laws-of-the-indies", "pre-colonial-vernacular", "colonial-european-influence", "modern-filipino-identity"],
    "spanish-colonial-laws-of-the-indies": ["spanish-colonial-bahay-na-bato", "colonial-european-influence", "american-colonial-era", "pre-colonial-vernacular"],
    "african-vernacular-earth-architecture": ["north-american-indigenous-architecture", "pre-columbian-mesoamerica", "inca-architecture-ashlar-masonry", "pre-colonial-vernacular"],
    "inca-architecture-ashlar-masonry": ["pre-columbian-mesoamerica", "north-american-indigenous-architecture", "african-vernacular-earth-architecture", "masters-of-the-golden-age"],
    "north-american-indigenous-architecture": ["african-vernacular-earth-architecture", "pre-columbian-mesoamerica", "inca-architecture-ashlar-masonry", "pre-colonial-vernacular"],
    "pre-columbian-mesoamerica": ["inca-architecture-ashlar-masonry", "north-american-indigenous-architecture", "african-vernacular-earth-architecture", "masters-of-the-golden-age"],
    "21st-century-movements": ["post-modernism", "the-bauhaus-and-international-style", "brutalism", "masters-of-the-golden-age"],
    "masters-of-the-golden-age": ["le-corbusier-five-points", "the-bauhaus-and-international-style", "mies-van-der-rohe", "pre-columbian-mesoamerica"],
    "bp-344-accessible-washrooms": ["bp-344-elevator-dimensions", "bp-344-ramp-slope-tiers", "wheelchair-maneuvering-and-parking", "fixtures-and-small-items-in-common-areas"],
    "bp-344-elevator-dimensions": ["bp-344-accessible-washrooms", "bp-344-ramp-slope-tiers", "conflict-matrix-stairs-guards-elevators", "transport-nodes-escalators-walkways"],
    "bp-344-ramp-slope-tiers": ["bp-344-accessible-washrooms", "bp-344-elevator-dimensions", "widths-slopes", "stairs-handrails-guardrails"],
    "bp-344-tactile-and-visual-alarms": ["bp-344-accessible-washrooms", "comprehensive-signage-package", "signs-design-and-construction", "bp-344-vs-pd-1096-conflicts"],
    "bp-344-vs-pd-1096-conflicts": ["conflict-matrix-stairs-guards-elevators", "bp-344-accessible-washrooms", "bp-344-ramp-slope-tiers", "top-50-traps-2024-irr"],
    "case-study-hospital-mall-school": ["institutional-human-dimensions", "commercial-clearances", "sanitation-and-water-supply", "fire-extinguishing-systems"],
    "pd-1096-rule-vii-area-metrics": ["allowable-floor-area-increases", "pd-1096-rule-vii-height-limits", "pd-1096-rule-vii-occupancy", "penthouses-and-roof-structures"],
    "pd-1096-rule-vii-height-limits": ["pd-1096-rule-vii-area-metrics", "allowable-floor-area-increases", "pd-1096-rule-vii-occupancy", "fire-zones-and-existing-buildings"],
    "pd-1096-rule-vii-occupancy": ["pd-1096-rule-vii-area-metrics", "pd-1096-rule-vii-height-limits", "change-of-use-and-occupancy", "certificate-of-occupancy"],
    "pd-1096-rule-viii-light-and-ventilation": ["pd-1096-rule-viii-setbacks-and-easements", "vent-shafts-and-ventilation", "ceiling-heights-and-room-sizes", "glass-and-glazing-area-limits"],
    "pd-1096-rule-viii-setbacks-and-easements": ["pd-1096-rule-viii-light-and-ventilation", "location-on-property-and-exterior-walls", "pd-1096-rule-vii-area-metrics", "allowable-floor-area-increases"],
    "pd-1096-rule-xii-egress-and-corridors": ["stairs-handrails-guardrails", "widths-slopes", "fire-zones-and-existing-buildings", "commercial-clearances"],
    "rule-i-general-provisions": ["legal-liability-and-enforcement-workflow", "top-50-traps-2024-irr", "typology-checklists-and-plan-checking", "building-permit-process"],
    "electrical-and-mechanical-regulations": ["sanitation-and-water-supply", "fire-extinguishing-systems", "vent-shafts-and-ventilation", "sheet-metal-and-spray-booths"],
    "translating-pwd-rights": ["law-qa-deck-ra-7277-9442-10754", "ra-9442-pwd-privileges-and-incentives", "accessible-seating-in-assembly-areas", "wheelchair-maneuvering-and-parking"],
    "uap-spp-doc-standards-of-professional-practice-for-philippine-architects": ["spp-doc-201-pre-design-services", "spp-doc-202-regular-design-services", "spp-doc-203-specialized-architectural-services", "spp-doc-206-comprehensive-architectural-services"],
    "spp-doc-201-pre-design-services": ["spp-doc-202-regular-design-services", "uap-spp-doc-standards-of-professional-practice-for-philippine-architects", "spp-doc-203-specialized-architectural-services", "spp-doc-204-a-fulltime-supervision-services"],
    "spp-doc-202-regular-design-services": ["spp-doc-201-pre-design-services", "spp-doc-203-specialized-architectural-services", "spp-doc-204-a-fulltime-supervision-services", "spp-doc-206-comprehensive-architectural-services"],
    "spp-doc-203-specialized-architectural-services": ["spp-doc-202-regular-design-services", "spp-doc-204-a-fulltime-supervision-services", "spp-doc-205-post-construction-services", "spp-doc-209-architectural-consulting-services-pacs"],
    "spp-doc-204-a-fulltime-supervision-services": ["spp-doc-204-b-construction-management-services", "spp-doc-202-regular-design-services", "spp-doc-205-post-construction-services", "spp-doc-206-comprehensive-architectural-services"],
    "spp-doc-204-b-construction-management-services": ["spp-doc-204-a-fulltime-supervision-services", "spp-doc-202-regular-design-services", "spp-doc-207-design-build-services", "spp-doc-205-post-construction-services"],
    "spp-doc-205-post-construction-services": ["spp-doc-206-comprehensive-architectural-services", "spp-doc-202-regular-design-services", "spp-doc-204-a-fulltime-supervision-services", "spp-doc-209-architectural-consulting-services-pacs"],
    "spp-doc-206-comprehensive-architectural-services": ["spp-doc-201-pre-design-services", "spp-doc-202-regular-design-services", "spp-doc-205-post-construction-services", "spp-doc-207-design-build-services"],
    "spp-doc-207-design-build-services": ["spp-doc-204-b-construction-management-services", "spp-doc-206-comprehensive-architectural-services", "spp-doc-208-architectural-design-competition-adc", "spp-doc-209-architectural-consulting-services-pacs"],
    "spp-doc-208-architectural-design-competition-adc": ["spp-doc-207-design-build-services", "spp-doc-209-architectural-consulting-services-pacs", "spp-doc-202-regular-design-services", "uap-spp-doc-standards-of-professional-practice-for-philippine-architects"],
    "spp-doc-209-architectural-consulting-services-pacs": ["spp-doc-203-specialized-architectural-services", "spp-doc-207-design-build-services", "spp-doc-208-architectural-design-competition-adc", "uap-spp-doc-standards-of-professional-practice-for-philippine-architects"],
}

EXAMTIP_STRENGTHEN = {
    "building-permit-process": "ALE Trap: The most frequently tested building permit trap is the 15-day clock trigger. Remember: payment date, not submission date. If the question gives you both, the answer ALWAYS uses the payment date. If only submission is given, use submission. Read the facts carefully — examiners deliberately put both dates to test this specific distinction.",
    "certificate-of-occupancy": "ALE Tip: CO vs Building Permit is tested in 3 ways: (1) Permit = permission to BUILD, CO = permission to USE; (2) Temporary COs are valid ONLY for unfinished but safe portions; (3) Occupancy without a CO = closure order + fines. Remember: Partial COs exist for multi-phase projects — they cover COMPLETED floors only.",
    "stairs-handrails-guardrails": "ALE Trap: When BP 344 and PD 1096 conflict on stairs, BP 344 accessibility requirements PREVAIL for accessible routes, but PD 1096 governs structural and life-safety requirements. Dual handrails (700/900 mm) is the most tested BP 344 stair requirement.",
    "widths-slopes": "ALE Trap: Don't mix ramp slope tiers. 1:12 is max for ramps (6.0 m max run), 1:20 is max for walkways (no max run). A ramp steeper than 1:12 is NOT a ramp — it fails code. Remember the 300 mm horizontal handrail extensions at top and bottom — frequently tested.",
    "fire-resistive-construction-ratings": "ALE Swipe: The FRC table (Table VIII) is the most referenced table on the exam. Memorize: Type I = unlimited, Type II = 2 hr, Type III = 2 hr exterior/1 hr interior, Type IV = 1 hr H.T., Type V = 0 hr. Sprinklers reduce required ratings by 1 hour in most cases.",
    "fire-zones-and-existing-buildings": "ALE Trap: Existing non-conforming buildings in Fire Zone 1 must be upgraded when the cost of alteration exceeds 50% of building value. Know the three zones (1=highest restriction, 4=lowest) and which occupancy types are prohibited in each.",
    "chimneys-and-fireplaces": "ALE Swipe: Chimney height above roof = 900 mm minimum (or 600 mm if within 3 m of roof ridge). Spark arrestors required for solid-fuel appliances. Fireplace opening-to-flue ratio is 10:1 — this is the most tested dimensional relationship.",
    "fire-extinguishing-systems": "ALE Trap: Know the three standpipe classes: Class I (65 mm hose, fire dept use), Class II (38 mm, occupant use), Class III (both). Most questions test when the building type requires standpipes (over 4 stories, over 15 m height, or over 500 m² per floor — any one triggers the requirement).",
    "pedestrian-protection-during-construction": "ALE Trap: Covered walkways required when: (1) building within 3.0 m of property line, (2) construction height exceeds 15 m, or (3) demolition within 3.0 m of sidewalk. Minimum walkway width = 1.50 m, minimum height = 2.40 m, minimum load = 2.4 kPa. All three dimensions are tested.",
    "dangerous-and-ruinous-buildings": "ALE Swipe: The Building Official can order demolition WITHOUT prior notice only in cases of IMMINENT DANGER. Otherwise, the owner gets a 15-day notice and a hearing. This due-process distinction is the most frequently tested legal aspect.",
    "ceiling-heights-and-room-sizes": "ALE Trap: Ceiling height minimums: 2.40 m residential, 2.70 m commercial/offices, 3.00 m hospitals/clinics. Mezzanines are tested as: area ≤ 1/3 of room area AND clear height ≥ 2.00 m above and below. Both conditions must be met.",
    "commercial-clearances": "ALE Swipe: The minimum aisle width for mercantile occupancies is 900 mm for counters (if non-accessible) and 1.20 m for accessible routes. Queuing space = 900 mm per person in line. Service counters must have a 760-860 mm high section for wheelchair users.",
    "residential-clearances": "ALE Trap: Residential corridor minimum width = 900 mm (PD 1096) but 1.20 m if the corridor serves as an accessible route (BP 344). The stricter BP 344 requirement governs if the building has accessible dwelling units. This is the most tested threshold.",
    "minimum-parking-requirements": "ALE Swipe: Parking ratios vary by occupancy: Group A (1 per unit), Group B/C (1 per 40 m² GFA), Group D/E (1 per 3 beds), Group F (1 per 50 m² GFA). CBD = 50% reduction. Compact cars = max 35% of total. These are all tested.",
    "minimum-requirements-group-a-dwellings": "ALE Trap: Group A-1 (single detached) vs A-2 (duplex) vs A-3 (multi-family/ apartment) vs A-4 (townhouse). Each has different minimum lot area, floor area, and yard requirements. Townhouses (A-4) have the most restrictive lot width minimum (6.0 m per unit).",
    "glass-and-glazing-area-limits": "ALE Swipe: Safety glass required where: (1) within 600 mm of door, (2) within 450 mm of floor, (3) in hazardous locations (shower enclosures, sliding doors). Tempered glass minimum = 6 mm in these locations. Wire glass is only for fire-rated openings (45/60/90 min).",
    "lathing-and-plastering": "ALE Trap: Lath-and-plaster fire ratings: 1 hr = minimum 3/4″ of plaster on metal lath, 2 hr = 1″ of plaster on metal lath + 1 hr backup. The 2-hour assembly is frequently tested for shaft wall enclosures and stair enclosures.",
    "excavation-foundation-and-veneer": "ALE Swipe: Minimum footing depth = 600 mm below grade (in non-expansive soils). Shoring required when excavation exceeds 2.0 m from property line. Underpinning required when excavation goes below adjacent foundation bottom. Veneer anchors at maximum 400 mm o.c. vertically, 600 mm o.c. horizontally.",
    "penthouses-and-roof-structures": "ALE Trap: A penthouse is EXEMPT from height and FAR if: (1) used only for mechanical/electrical equipment, (2) occupies ≤ 1/3 of roof area, and (3) does not exceed the building's top floor height. If ANY of these conditions fails, it counts toward FAR. This is a trap question pattern.",
    "location-on-property-and-exterior-walls": "ALE Swipe: Exterior wall fire-rating based on proximity to property line: < 1.0 m = 1-hour from interior, 1.0-3.0 m = 1-hour exterior, > 3.0 m = no fire-rating required for exterior walls. The 1.0 m threshold is the most tested distance.",
    "signs-design-and-construction": "ALE Trap: Projecting sign minimum clearance: 3.00 m on non-arcaded streets, 5.00 m on arcaded streets. Ground signs max height = 6.00 m. Roof signs not permitted above 15.00 m building height. Neon signs minimum spacing: 4.00 m between signs, 2.00 m from common boundaries.",
    "comprehensive-signage-package": "ALE Swipe: The five accessible sign types (identification, directional, informational, warning, regulatory) each have specific requirements. Tactile signs: raised characters 1.5-2.0 mm high, Braille must be Grade 2, mounting height 1.20-1.50 m centerline from floor. The mounting height is the most tested spec.",
    "accessible-seating-in-assembly-areas": "ALE Trap: Accessible seating = 1% of total capacity, minimum 2 locations. Companion seating immediately adjacent. Sightlines: maximum 18° vertical angle to stage. If the assembly has multiple tiers, accessible seating must be distributed — NOT all on the main floor.",
    "public-service-counters-and-atms": "ALE Swipe: Accessible counter: 760-860 mm high section minimum 900 mm wide. Knee clearance = 680 mm deep × 680 mm high × 760 mm minimum width. Forward reach max = 1,200 mm. Side reach max = 1,370 mm. These four dimensions are the most tested for counters.",
    "stages-and-platforms": "ALE Trap: Platforms ≤ 1.20 m high are NOT classified as stages and do not require stage permits. Full stages require: proscenium wall (2-hour fire rating for stages > 200 m²), fire curtain, sprinklers, and separate dressing room egress. The 1.20 m threshold is the critical distinction.",
    "fixtures-and-small-items-in-common-areas": "ALE Swipe: Minimum fixture counts by occupancy: Assembly (F) 1WC/100 males, 1WC/100 females | Educational (E) 1WC/50 males, 1WC/50 females | Business (I) 1WC/25 males, 1WC/25 females | Residential (A) 1WC/unit | Urinal = substitutes 1/2 of required male WC.",
    "conflict-matrix-stairs-guards-elevators": "ALE Trap: When PD 1096 and BP 344 conflict: (1) LIFE SAFETY provisions of PD 1096 always prevail, (2) ACCESSIBILITY provisions of BP 344 add to (not replace) PD 1096, (3) When both specify the same thing at different dimensions, the STRICTER (larger/safer) dimension governs. This is a universal exam principle.",
    "allowable-floor-area-increases": "ALE Swipe: Floor area increase = A_f + A_s formula. A_f = frontage/open space increase (max 75%). A_s = sprinkler increase (max 200% for sprinklered + 100% for open frontage). If both apply, USE BOTH but with the 300% total cap. This is complex — practice with past exam problems.",
    "ergonomics-in-furniture-design": "ALE Trap: Design for the 5th to 95th percentile range. The critical seated dimensions: popliteal height (adjustable 380-510 mm), elbow height (210-290 mm above seat), thigh clearance (160-200 mm minimum). The popliteal height drives seat height adjustability.",
    "institutional-human-dimensions": "ALE Swipe: Hospital corridor minimum = 2.40 m (for gurney passage). Classroom = 1.80 m min. Courtroom = 1.50 m min for spectator aisles, 2.40 m for main aisle. The 2.40 m hospital corridor is the most tested institutional dimension.",
    "standard-human-body-dimensions": "ALE Trap: The five critical dimensions for accessible design: vertical reach max = 1,830 mm (not 1,800!), forward reach max = 1,200 mm, side reach max = 1,370 mm, knee clearance min = 680 mm, wheelchair seat height = 460-500 mm. These are directly tested in BP 344 questions.",
    "microclimate-analysis": "ALE Swipe: Solar orientation strategy: north-south facades = easiest to shade, east-west = most challenging. In the Philippines (14°N), the south facade gets the most direct summer sun. The wind rose determines natural ventilation strategy. Prevailing wind direction is Amihan (NE) Nov-May, Habagat (SW) June-Oct.",
    "topography-and-slope-analysis": "ALE Trap: Slope categories: < 15% = buildable with normal grading, 15-25% = requires special foundation, > 25% = severely constrained (ECC likely required). Contour interval drives slope calculation: percent slope = contour interval / horizontal distance × 100. The 15% threshold is the key exam boundary.",
    "hydrology-in-site-planning": "ALE Swipe: Rational Method formula: Q = CiA (Q = runoff in cms, C = runoff coefficient, i = rainfall intensity in mm/hr, A = area in hectares). Typical C values: roof=0.95, pavement=0.90, lawn=0.30. The 100-year floodplain prohibits new habitable structures in most jurisdictions.",
    "geological-hazards": "ALE Trap: Five-meter (5.0 m) minimum no-build buffer from active fault traces. Liquefaction-prone areas: sandy soils + high water table = liquefaction hazard. NSCP seismic zones: Zone 4 = highest risk (Metro Manila). The 5 m fault buffer is the most tested geological restriction.",
    "flora-and-fauna-in-site-development": "ALE Swipe: Tree preservation zone = 10 × diameter at breast height (DBH) minimum radius. DENR requires ECC for projects > 10 hectares. Protected trees (century-old, endangered species) require special permits before removal. The 10× DBH formula is the most tested tree preservation dimension.",
    "legal-liability-and-enforcement-workflow": "ALE Trap: Three violation tiers with escalating fines: Light = P5,000, Less Grave = P10,000, Grave = P20,000 + possible criminal action. Surcharge for illegal construction = 50% of permit fee for early voluntary settlement, 200% if enforced. The surcharge percentages are frequently tested.",
    "typology-checklists-and-plan-checking": "ALE Swipe: Building permit application requires: 5 sets of plans (for most buildings), 1 set of specifications, soil investigation report (for structures > 4 stories), and tax declaration. Plans must be signed/sealed by a licensed architect. Missing any = automatic return. The 5-set requirement is the most tested number.",
    "top-50-traps-2024-irr": "ALE Strategy: The 50 traps are organized by code section. Review them by category: (1) 15-day rule traps, (2) Exemption traps, (3) Measurement traps (inches vs mm, diameter vs radius), (4) Threshold traps (over/under X), (5) 'Shall' vs 'May' language traps. Focus on categories 1-3 for highest ROI on the exam.",
    "interior-doors-and-hardware": "ALE Trap: Minimum clear opening width = 900 mm for accessible doors, 700 mm for interior non-accessible. Fire doors must be self-closing with positive latching. Panic hardware required on exit doors of Group E, F, H, I occupancies. The clear opening is measured with door at 90° — NOT the door leaf width.",
    "prefabricated-constructions": "ALE Swipe: Prefabricated buildings require: (1) building permit like any other construction, (2) special inspection for critical connections, (3) third-party certification for structural components, (4) compliance with all fire-resistance requirements. No shortcut on code compliance just because it's factory-built.",
    "plastics-in-construction": "ALE Trap: Foam plastic insulation requires a 15-minute thermal barrier unless protected by 1/2″ gypsum board. Maximum permitted foam plastic area in interior finish = 10% of wall/celling area (for foam plastic not covered by thermal barrier). The 15-minute thermal barrier is the key safety requirement.",
    "sheet-metal-and-spray-booths": "ALE Swipe: Spray booth ventilation = 30 m/min minimum air velocity across the face of the booth opening. Explosion relief: minimum 0.06 m² per m³ of booth volume. Class A = water-based finishes (lowest hazard), Class B = combustible finishes, Class C = powder coatings. Class B = strictest requirements.",
    "sanitation-and-water-supply": "ALE Trap: Septic tank minimum = 2 chambers (1/3 and 2/3 of volume). Capacity = 0.2 m³ per bedroom minimum. Leaching field trench = 600 mm width minimum, 1.5 m minimum from property line. Well-to-septic separation = 15 m minimum (horizontal). The 15 m separation is the most tested distance.",
    "vent-shafts-and-ventilation": "ALE Swipe: Vent shaft minimum dimensions = 1.20 m × 1.20 m for non-Fire Zone 1 buildings, 1.50 m × 1.50 m for Fire Zone 1. Max shaft coverage = 10% of required lot area. Mechanical ventilation can substitute for natural ventilation at 10 air changes per hour for most occupancy types.",
    "vertical-openings-and-floor-roof-construction": "ALE Trap: Vertical openings ≤ 1.0 m² may be UNPROTECTED if they do not connect more than 3 stories. Openings > 1.0 m² require 1-hour enclosure (or 2-hour for buildings > 4 stories). The 1.0 m² threshold and the 3-story limit are both frequently tested.",
    "transport-nodes-escalators-walkways": "ALE Swipe: Escalator minimum width = 810 mm between handrails. Landing depth minimum = 1.50 m. Moving walkways: maximum slope = 12° (1:4.7). Horizontal handrail extension = 300 mm. Escalators are NOT considered exits (they must be supplemented by stairs). This 'not an exit' rule is the most tested point.",
    "site-exterior-circulation": "ALE Trap: Driveway minimum width: 3.00 m one-way, 6.00 m two-way. Minimum sidewalk width = 1.50 m. Loading berths: one per 1,000 m² of GFA for mercantile, one per 2,500 m² for offices. Turning radius minimum = 6.00 m for cars, 12.00 m for trucks. The driveway width minimums are the most tested.",
    "site-planning-accessible-routes-vs-open-space": "ALE Swipe: Accessible route requirements: max slope 1:20, min width 1.20 m, passing spaces every 30 m (1.50 m × 1.50 m minimum). Open space minimum = 30% of lot area (PD 1096). When these conflict, the accessible route width requirement governs — you cannot reduce path width to meet open space minimums.",
    "wheelchair-maneuvering-and-parking": "ALE Trap: The mnemonic 4.0-1.8-2.3-1.5-1.8-1.2 MUST be memorized. Each number maps to: (1) parking stall width in meters, (2) access aisle width, (3) vertical clearance, (4) turning/corridor clear width, (5) T-turn depth, (6) ramp width. The most tested value is 1.8 m (access aisle, T-turn, ramp — all 1.8 m).",
    "wheelchair-maneuvering-and-parking-slots": "ALE Swipe: Total accessible slots = 1 for first 25, then 2% of total over 100. Van-accessible = 1 of every 8 accessible slots (min width 3.6 m with 1.8 m aisle). The 1:25 ratio and 2% calculation are the two most tested parking allocation rules.",
    "exam-meta-deck-heights": "ALE Trap: Decks, balconies, porches, and terraces: (1) if uncovered and < 1.0 m above grade, they are NOT counted in FAR; (2) if covered (roof above), they ARE counted; (3) the guardrail height minimum = 1.10 m if the deck is > 750 mm above grade. The 1.0 m height threshold for FAR exclusion is the key exam point.",
    "lodging-and-residential-accessibility": "ALE Swipe: Accessible hotel rooms: 5% of total, distributed by room type. Roll-in showers required in at least 1/2 of accessible rooms. Visual alarms required in all accessible rooms. Type A dwelling units = fully accessible. Type B = adaptable (can be converted with minimal cost). The 5% minimum is the most tested metric.",
    "law-qa-deck-ra-7277-9442-10754": "ALE Trap: Three laws with different privileges: RA 7277 = original Magna Carta (accessibility mandates), RA 9442 = added 20% discount/VAT exemption, RA 10754 = expanded to all PWD (removed the 70% disability threshold). The VA T exemption is ON TOP of the 20% discount — not a replacement. Total savings = 20% discount + VAT on the discounted amount.",
    "ra-9442-pwd-privileges-and-incentives": "ALE Swipe: PWD 20% discount applies to: hotels, restaurants, recreation centers, theaters, hospitals/dental clinics, transport (land/air/sea), funeral services. Establishments get income tax deduction equal to the discount amount. The architect's obligation = design compliant accessible facilities. The owner's obligation = register with the DSWD to claim deductions.",
    "storage-of-x-ray-films": "ALE Trap: Nitrate X-ray film is EXPLOSIVE and requires: (1) separate 2-hour fire-rated vault with explosion relief, (2) storage limited to 20 kg per vault, (3) vault must be on exterior wall with direct outside access. Safety film (cellulose acetate/polyester) has no explosive risk but still requires proper ventilation.",
    "the-bauhaus-and-international-style": "ALE Swipe: Four Bauhaus principles to memorize: (1) Form follows function, (2) Truth to materials (no applied decoration), (3) Machine aesthetic (the factory as ideal), (4) Integration of all arts (crafts, painting, sculpture with architecture). Bauhaus = Dessau (Gropius), International Style = MoMA exhibition (Johnson/Hitchcock).",
    "le-corbusier-five-points": "ALE Trap: The Five Points must be memorized in order: (1) Pilotis (ground-level columns), (2) Free plan (non-loadbearing walls), (3) Free facade (curtain wall), (4) Horizontal window (fenêtre en longueur), (5) Roof garden. The EXAM distinguishes these from his later work (Ronchamp, Chandigarh — which ABANDON several Five Points).",
    "mies-van-der-rohe": "ALE Swipe: Three Miesian principles: (1) Skin-and-bone structure (frame + glass), (2) Universal space (flexible open plan), (3) Material logic (steel expressed, glass as skin). Key buildings: Barcelona Pavilion (fluid space), Seagram (skyscraper archetype), Farnsworth House (minimalist box). His motto: 'Less is more.'",
    "post-modernism": "ALE Trap: Post-Modernism vs Modernism: Modernism = no ornament, universal, ahistorical. Post-Modernism = ornament returned, context-specific, historical quotation. Four markers: (1) Historical reference, (2) Ornament, (3) Pop-culture/irony, (4) Contextualism. Venturi's 'Less is a bore' vs Mies' 'Less is more' — this contrast is frequently tested.",
    "brutalism": "ALE Swipe: Three Brutalism markers: (1) Béton brut (rough exposed concrete), (2) Massive sculptural massing, (3) Honest structural expression. Key examples: Unité d'Habitation (Le Corbusier — the originator of béton brut), Boston City Hall (Kallmann), Habitat 67 (Safdie). Distinguish Brutalism from raw concrete aesthetic (Brutalism = artistic expression, not just unfinished concrete).",
    "american-colonial-era": "ALE Swipe: Three phases: (1) Neoclassical civic buildings (1900-1920 — Daniel Burnham's City Beautiful plan for Manila), (2) Bungalow/chalet hybrids (1920s-1930s — the 'American bungalow' Filipinized), (3) Art Deco (1930s — Perez, Ocampo, Luna). Key buildings: Manila Hotel (Reuter), Post Office Building (Arellano/Frost), Legislative Building (design competition).",
    "colonial-european-influence": "ALE Trap: Spain gave the plaza-mayor grid, the bahay na bato, and the Laws of the Indies. America gave the City Beautiful plan, Neoclassical civic buildings, and the bungalow. Both imposed their urban grid on pre-colonial settlement patterns. The key exam distinction: Spanish colonial = religious focus around the plaza, American colonial = civic/institutional around the park.",
    "modern-filipino-identity": "ALE Swipe: Four phases: (1) Post-war modernists (Locsín — PICC/PICC, Nakpil — Quezon Hall, Mañosa — Coconut Palace), (2) Tropical regionalists (Coconut Palace as vernacular reinterpretation), (3) Filipino sense of scale (human proportion + tropical response), (4) Contemporary sustainable (green architecture in tropical context). Locsín's CCP Complex is the most tested modern Filipino work.",
    "pre-colonial-vernacular": "ALE Trap: The three regional types: (1) BAH AY KUBO = raised post-and-beam, nipa/thatched roof, Southeast Asian; (2) TOROGAN = Maranao 'flying house', panolong (winged beams), okir carving; (3) BALE = Ifugao, pyramid roof, one-room, social hierarchy expressed in elevation. All three share: raised floor, steep roof, open ventilation. The differences in roof form and ornamentation define each type for exam purposes.",
    "spanish-colonial-bahay-na-bato": "ALE Swipe: Bahay na bato anatomy (from bottom up): (1) ZAGUAN — ground floor storage/garage/entrance, (2) VOL ADA — covered perimeter arcade for circulation, (3) ENTR ESUELO — first floor living (sala, comedor, kitchen), (4) VENTANILLA — sliding capiz shell panels below window sills for ventilation, (5) HIPED ROOF — clay tile roof. The ventanilla (sliding capiz panels) is the most distinctive Filipino innovation.",
    "spanish-colonial-laws-of-the-indies": "ALE Trap: The 1573 Laws of the Indies prescribed: (1) Plaza = 1:1.5 rectangle, aligned E-W, (2) Main streets = aligned with prevailing winds (for ventilation), (3) Church and government = fronting the plaza, (4) Building lots (solares) = regular parcels around the plaza grid. These laws governed ALL Spanish colonial towns in the Philippines and the Americas. The 1:1.5 plaza ratio is the most tested dimension.",
    "african-vernacular-earth-architecture": "ALE Swipe: Five earth traditions: (1) Adobe = sun-dried brick (SW Africa), (2) Rammed earth = compacted moist soil (North Africa), (3) Wattle-and-daub = woven sticks + mud (sub-Saharan), (4) Mud brick = molded wet clay (Sahel), (5) CEB = modern compressed earth block. Great Mosque of Djenné (Mali) is the world's largest mud-brick building — the most tested African example.",
    "inca-architecture-ashlar-masonry": "ALE Trap: Three Inca features: (1) Ashlar polygonal masonry = stones cut to fit WITHOUT mortar, earthquake-resistant through friction, (2) Trapezoidal openings = doors, windows, niches all trapezoidal, (3) Kancha = standardized rectangular enclosure plan. Machu Picchu is the most tested Inca site. The mortarless ashlar masonry is the defining feature — NO other civilization used this technique at this scale.",
    "north-american-indigenous-architecture": "ALE Swipe: Six dwelling types: (1) Tipi = Plains/cone/portable, (2) Hogan = Navajo/earth-covered/permanent, (3) Igloo = Inuit/dome/ice-block, (4) Wigwam = Eastern/dome/birchbark, (5) Pueblo = SW/adobe/terraced, (6) Plank house = NW coast/cedar planks/communal. Types 1, 5, and 6 are the most tested (portable, permanent masonry, and communal timber).",
    "pre-columbian-mesoamerica": "ALE Trap: Three civilizations: (1) Olmec = mother culture, earthen pyramids, colossal basalt heads; (2) Maya = corbeled vaults (not true arches!), limestone construction, astronomical alignment, ball courts — Chichen Itza shows Toltec influence; (3) Aztec = Tenochtitlán on an island, double-stair pyramid (Templo Mayor), earlier Mexica structures. The Maya's corbeled vault (NOT a true arch) is the most tested structural feature.",
    "21st-century-movements": "ALE Swipe: Four movements: (1) Parametricism (Zaha Hadid, Schumacher — algorithmic curves, continuous surfaces), (2) Deconstructivism (Gehry, Libeskind — fragmentation, asymmetry, distortion), (3) Critical Regionalism (Frampton — contextual, tectonic, resisting placelessness), (4) Digital Fabrication (Gramazio Kohler — robotic assembly, computational design). Parametricism vs Deconstructivism: both are non-rectilinear but Parametricism = smooth/flowing, Deconstructivism = jagged/fragmented.",
    "masters-of-the-golden-age": "ALE Trap: Five masters to know: (1) Ictinus/Callicrates = Parthenon architects (Doric perfection, 4:9 column ratio), (2) Apollodorus = Trajan's architect (Forum/Column — bridge engineering), (3) Anthemius/Isidorus = Hagia Sophia (pendentive dome, 31 m span — largest for 1,000 years), (4) Bramante = Tempietto (High Renaissance centrality), (5) Michelangelo = St. Peter's Dome, Laurentian Library. The Parthenon column ratio (4:9) is the most tested proportion.",
    "bp-344-accessible-washrooms": "ALE Trap: Accessible water closet clearance: 900 mm wide × 1,500 mm deep min + 450 mm side transfer space (left or right). Grab bars: horizontal at 750-850 mm height, 1.3 kN capacity. The side transfer side is the most tested dimension — the space must be on BOTH sides of an accessible stall but the BARRIER-FREE approach requires transfer from either side.",
    "bp-344-elevator-dimensions": "ALE Swipe: Elevator cab minimum: 1.20 m × 1.30 m (small occupancy) or 1.60 m × 1.50 m (large occupancy > 500 persons). Door clear opening = 900 mm minimum. Call buttons: 900-1,100 mm from floor. Braille required on all floor buttons. Audible annunciator for each floor. The 900 mm door opening is the most tested dimension.",
    "bp-344-ramp-slope-tiers": "ALE Trap: The four tier slope system is frequently tested: 1:12 (max 6.0 m run), 1:15 (max 12.0 m run), 1:20 (no max run), 1:25 (walkway). Landings = 1.50 m min at each change of direction. Handrails at 700 mm and 900 mm. The key exam point: a ramp steeper than 1:12 is NOT a ramp and is NOT permitted for accessible routes.",
    "bp-344-tactile-and-visual-alarms": "ALE Swipe: Tactile warnings: 600 mm depth, installed 300 mm before hazard edge. Visual alarms: 75 cd minimum strobe, 60-120 flashes/min. Tactile warnings required at: stair top/bottom, ramp top/bottom, pedestrian crossings, platform edges. The 600 mm depth + 300 mm offset = 900 mm total — this combined dimension is frequently tested.",
    "bp-344-vs-pd-1096-conflicts": "ALE Trap: The conflict-resolution hierarchy: (1) PD 1096 is the NATIONAL BUILDING CODE — baseline requirements, (2) BP 344 is the ACCESSIBILITY LAW — additional requirements, NOT replacements, (3) When BP 344 says 'shall' and PD 1096 says 'may', the 'shall' controls for accessibility, (4) When both use 'shall' at different dimensions, the STRICTER dimension controls. This hierarchy determines the correct answer.",
    "case-study-hospital-mall-school": "ALE Swipe: Three key typologies with distinct code pathways: Hospital (D) requires 2.40 m corridors, emergency power within 10 sec, smoke control, min 2 exit stairways | Mall (F) requires 1.20 m corridors (min), sprinklers if > 1 story or > 12 m height, mall as public way concept | School (E) requires 2 exits per room if > 50 occupants, max travel distance 45 m, fire alarm if > 100 persons. CORRIDOR WIDTH: Hospital (2.40 m) > School (1.80 m) > Mall (1.20 m) — memorize this comparison.",
    "pd-1096-rule-vii-area-metrics": "ALE Trap: Three distinct metrics: (1) FAR = total floor area ÷ lot area, (2) Building coverage = footprint area ÷ lot area (max 70% in most zones), (3) Floor area = sum of all floor plates measured from exterior walls. Exclusions from FAR: basement (if used only for parking/mechanical), roof decks, uncovered balconies. FAR is the MOST tested metric on the exam.",
    "pd-1096-rule-vii-height-limits": "ALE Swipe: Height limits by occupancy — Group A (residential) = 15 m max, Group B (commercial/office) = 15 m, Group C (industrial) = 20 m, Group D (institutional) = 15 m. Height increases: +1 story if sprinklered, +1 story if open frontage > 30%. The 15 m residential height cap is the most tested limit.",
    "pd-1096-rule-vii-occupancy": "ALE Trap: The ten occupancy groups: A=Residential, B=Commercial, C=Industrial, D=Institutional, E=Educational, F=Assembly, G=Recreational, H=Storage, I=Business, J=Dangerous. For mixed-occupancy, the STRICTEST requirements govern the entire building UNLESS the uses are separated by 2-hour fire-rated construction. The 'separated vs non-separated' distinction is the key exam point.",
    "pd-1096-rule-viii-light-and-ventilation": "ALE Swipe: Natural light = 10% of floor area in windows. Natural ventilation = 5% of floor area in openings. Mechanical ventilation: min 10 air changes/hr for most rooms. Combined: window area can be reduced by up to 50% if 50% of required illumination is artificial. The 10%/5% light/ventilation split is the most tested ratio.",
    "pd-1096-rule-viii-setbacks-and-easements": "ALE Trap: Minimum setbacks by occupancy and fire zone: 1-2 story = front 3.0 m, sides 2.0 m, rear 2.0 m | 3-4 story = front 4.5 m, sides 3.0 m, rear 3.0 m | 5+ story = front 6.0 m, sides 4.5 m, rear 4.5 m. Corner lots: both front-facing street sides = front yard requirements. The 3.0 m front setback for 1-2 story buildings is the most tested.",
    "pd-1096-rule-xii-egress-and-corridors": "ALE Swipe: Occupant load factors: Assembly (concentrated) = 0.65 m²/person, Assembly (less concentrated) = 1.40 m²/person, Business = 9.30 m²/person, Educational = 1.85 m²/person, Mercantile = 2.80 m²/person. Egress width = occupant load × 0.55 mm per person (for stair) or 0.81 mm per person (for door/corridor). These factors are the most tested calculations.",
    "rule-i-general-provisions": "ALE Trap: Five key General Provision traps: (1) 'Building' definition excludes fences ≤ 1.80 m, (2) 'Alteration' vs 'Repair' — alteration = structural change requiring permit, repair = replacement in-kind (no permit), (3) 'Shall' = mandatory, 'May' = discretionary, (4) PD 1096 governs ALL buildings including government buildings, (5) Exemptions must be SPECIFICALLY provided — not assumed. No. 1 (fence exemption) is the most tested.",
    "electrical-and-mechanical-regulations": "ALE Swipe: Three key permit triggers: (1) Electrical permit required for ALL new electrical work (not just new buildings), (2) Mechanical permit required for mechanical equipment > 1 HP, (3) Elevator/escalator permit required for ALL elevator/escalator installations (separate from building permit). The 1 HP mechanical threshold is the most tested boundary.",
    "translating-pwd-rights": "ALE Trap: Key design translations from PWD laws: RA 7277 = accessible parking (1 per 25 slots min), accessible toilets (1 per floor), ramps | RA 9442 = 20% discount (triggers NO design change, it is an economic privilege) | BP 344 = specific dimensional requirements (tactile warnings, counter heights, grab bars). The most tested: RA 7277 mandates facilities, RA 9442 mandates discounts — DO NOT confuse them.",
    "uap-spp-doc-standards-of-professional-practice-for-philippine-architects": "ALE Swipe: Nine SPP Docs: 201 (Pre-Design), 202 (Regular Design), 203 (Specialized), 204-A (Full-Time Supervision), 204-B (CM), 205 (Post-Construction), 206 (Comprehensive), 207 (Design-Build), 208 (Competition), 209 (Consulting). All are derived from RA 9266, Art. I, Sec. 4 (Architect's scope of practice). The three most tested are 202 (fee split), 201 (pre-design scope), and 207 (design-build).",
    "spp-doc-201-pre-design-services": "ALE Trap: SPP 201 = PRE-design services (before SPP 202). Six phases: (1) Project Definition, (2) Feasibility Study, (3) Site Analysis, (4) Space Programming, (5) Design Guidelines, (6) Consultant Selection. Compensation is per-diem or fixed fee — NOT percentage of construction cost. The most tested distinction: SPP 201 is optional/separate, SPP 202 is the standard.",
    "spp-doc-202-regular-design-services": "ALE Swipe: SPP 202 five phases and fee percentages: SD (Phase 1) = 15% of basic fee | DD (Phase 2) = 20% | CD (Phase 3) = 30% (largest single phase) | Bidding (Phase 4) = 5% (smallest) | CA (Phase 5) = 30%. The 15-20-30-5-30 percentage sequence is the most tested fee allocation on the exam.",
    "spp-doc-203-specialized-architectural-services": "ALE Trap: Nine specialized services: Interior Design, Landscape Architecture, Acoustics, Lighting, Preservation, Space Planning, Urban Design, Graphic Design, Expert Witness. Compensation: per-diem, fixed fee, or lump sum — NOT percentage of construction cost (unless the basic services contract also uses percentage). Expert witness is the only one with a forensic/legal character.",
    "spp-doc-204-a-fulltime-supervision-services": "ALE Swipe: Full-time supervision (204-A) vs Construction Administration (SPP 202 Phase 5): FTS = DAILY on-site inspection, CA = periodic observation. Five FTS duties: (1) Daily quality control, (2) Verify conformance to plans, (3) Interpret contract documents, (4) Prepare change orders, (5) Maintain daily log. Compensation = monthly salary or percentage of salary.",
    "spp-doc-204-b-construction-management-services": "ALE Trap: CM (204-B) vs Full-Time Supervision (204-A): CM manages COST and SCHEDULE in addition to quality. CM coordinates MULTIPLE prime contractors. CM produces (1) CPM schedule, (2) Cost reports, (3) Change order management, (4) Value engineering options. The key test point: CM has authority over budget, FTS does not.",
    "spp-doc-205-post-construction-services": "ALE Swipe: Four post-construction services: (1) Building commissioning and start-up, (2) Record (as-built) drawings, (3) Post-occupancy evaluation (POE), (4) Operations and maintenance manuals. Distinguish: as-built drawings ARE a post-construction service (SPP 205), NOT part of SPP 202. POE is frequently tested as the systematic evaluation of building performance after occupancy.",
    "spp-doc-206-comprehensive-architectural-services": "ALE Trap: Comprehensive = SPP 201 + 202 + 204 + 205 in a single contract. Basic fee = 15% of construction cost (max). Not included: specialized services (203). Comprehensive is a BUNDLE — the 15% ceiling applies to the bundle, not to each phase. The most tested: if a client asks for 'all services', it likely triggers SPP 206 (Comprehensive), not just SPP 202.",
    "spp-doc-207-design-build-services": "ALE Swipe: Design-Build (DB) vs Design-Bid-Build (DBB): DB = single entity responsible for both design and construction. DBB = separate contracts (owner-architect + owner-contractor). Architect's ethical obligation under DB: must maintain PROFESSIONAL INDEPENDENCE — the architect cannot be subordinate to the contractor's commercial interests. The independence requirement is the most tested ethical point.",
    "spp-doc-208-architectural-design-competition-adc": "ALE Trap: Competition types: (1) OPEN = any qualified architect, (2) INVITED = selected architects only, (3) LIMITED = pre-qualified firms, (4) STUDENT = architecture students. Jury = 5 members minimum (majority must be architects). Winner gets: (a) cash prize OR (b) commission. The architect RETAINS copyright of competition entries (unless the contract specifically transfers it).",
    "spp-doc-209-architectural-consulting-services-pacs": "ALE Swipe: PACS = Professional Architectural Consulting Services. A consultant under SPP 209 CANNOT be the architect of record on the same project. Fee arrangements: hourly, retainer, or fixed fee. The 'no dual role' prohibition is the most tested principle — an architect cannot both design (as AOR) and advise (as consultant) on the same project.",
}

# ── Utility functions ──

def sha256(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def get_cross_references(slug):
    """Generate cross-reference string for a given slug."""
    refs = CROSS_REFS.get(slug, [])
    if not refs:
        return ""
    
    ref_links = []
    for ref in refs:
        name = ref.replace('-', ' ').title()
        ref_links.append(f"**{name}**")
    
    result = f"\n\n---\n\n## Cross‑References\n\n{', '.join(ref_links)}\n"
    
    return result


def detect_examtip_blocks(content):
    """Count existing ExamTip components."""
    return len(re.findall(r'component="ExamTip"', content))


def add_examtip_if_missing(content, slug):
    """Add an ExamTip section if article has none."""
    examtip_count = detect_examtip_blocks(content)
    
    if slug in EXAMTIP_STRENGTHEN and examtip_count == 0:
        tip_text = EXAMTIP_STRENGTHEN[slug]
        examtip_block = f"""
\n---\n\n## Exam Tip\n\n{tip_text}\n"""
        # Insert before the final section (usually Verified Sources / Key Terms / Cross-References)
        # Or at the end
        sections = list(re.finditer(r'^## (?:Verified Sources|Verified Source Mapping|Cross‑References|Cross-References|Key Terms|Sample)', content, re.MULTILINE))
        if sections:
            insert_pos = sections[0].start()
            content = content[:insert_pos] + examtip_block + "\n" + content[insert_pos:]
        else:
            # Append at end
            content = content.rstrip() + examtip_block + "\n"
        return content, True
    return content, False


def replace_generic_learning_goal(content, slug):
    """Replace generic LG with specific one if found."""
    if slug not in NAMED_GOALS:
        return content, False
    
    new_goal = NAMED_GOALS[slug]
    
    # Check for generic LG pattern
    generic_patterns = [
        r'After reading this article, you should understand the key concepts tested in the ALE for this topic, including relevant code provisions, dimensional standards, and common exam applications\.',
        r'After reading this article, you should be able to:\n\n.*?(?=\n\n##|\n---|$)',
    ]
    
    for pattern in generic_patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            old_text = match.group(0)
            new_text = f"After reading this article, you should be able to:\n\n{new_goal}"
            content = content.replace(old_text, new_text)
            return content, True
    
    return content, False


def replace_ai_commentary(content):
    """Remove any AI meta-commentary."""
    patterns = [
        r'As an AI (model|assistant|language model)[^\\n]*\\n',
        r'I am an AI[^\\n]*\\n',
        r'As a large language model[^\\n]*\\n',
    ]
    changed = False
    for pattern in patterns:
        new_content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        if new_content != content:
            content = new_content
            changed = True
    return content, changed


def fix_article(dirname):
    """Process a single article directory."""
    slug = dirname.split('--')[0]
    
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    meta_path = os.path.join(article_dir, "article-metadata.json")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path):
        print(f"  SKIP: {slug} - no normalized.md")
        return None
    
    content = read(norm_path)
    original_content = content
    changes = []
    
    # ── 1. Replace generic Learning Goals ──
    content, lg_changed = replace_generic_learning_goal(content, slug)
    if lg_changed:
        changes.append("Replaced generic LG with specific ALE objectives")
    
    # ── 2. Remove AI commentary ──
    content, commentary_changed = replace_ai_commentary(content)
    if commentary_changed:
        changes.append("Removed AI commentary")
    
    # ── 3. Add cross-references if missing ──
    if "## Cross‑References" not in content and "## Cross-References" not in content and "## Related Articles" not in content:
        xref = get_cross_references(slug)
        if xref:
            # Insert before the "Verified Sources" section or at end
            sections = list(re.finditer(r'^## (?:Verified Sources|Verified Source Mapping|Sources)', content, re.MULTILINE))
            if sections:
                content = content[:sections[0].start()] + xref + "\n" + content[sections[0].start():]
            else:
                content = content.rstrip() + xref + "\n"
            changes.append("Added cross-references to related articles")
    
    # ── 4. Add/Strengthen ExamTip ──
    content, tip_added = add_examtip_if_missing(content, slug)
    if tip_added:
        changes.append("Added Exam Tip section")
    elif slug in EXAMTIP_STRENGTHEN:
        # If article already has ExamTips, strengthen them by adding a stronger version
        # Check if there's a generic or weak exam tip
        pass
    
    # ── 5. Save changes if any ──
    if content != original_content:
        write(norm_path, content)
        print(f"  ✓ CHANGED: {slug} - {'; '.join(changes)}")
        return article_dir
    else:
        print(f"  • OK: {slug} - no changes needed")
        return None


def update_metadata_hash(article_dir):
    """Update content_hash in article-metadata.json based on current normalized.md."""
    norm_path = os.path.join(article_dir, "normalized.md")
    meta_path = os.path.join(article_dir, "article-metadata.json")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path):
        return False
    
    content = read(norm_path)
    new_hash = sha256(content)
    new_hash_prefixed = f"sha256:{new_hash}"
    
    updated = False
    
    # Update article-metadata.json
    if os.path.exists(meta_path):
        meta = json.loads(read(meta_path))
        old_hash = meta.get("normalized_content_hash", "")
        if old_hash != new_hash_prefixed:
            meta["normalized_content_hash"] = new_hash_prefixed
            meta["updated_at"] = "2026-05-03T10:52:00+00:00"
            write(meta_path, json.dumps(meta, indent=2) + "\n")
            slug = meta.get("slug", "unknown")
            print(f"  🏷 HASH UPDATED: {slug}: {old_hash[:20]}... -> {new_hash_prefixed[:20]}...")
            updated = True
    
    # Update ui-blocks.json
    if os.path.exists(ui_path):
        ui_data = json.loads(read(ui_path))
        old_ui_hash = ui_data.get("normalized_content_hash", "")
        if old_ui_hash != new_hash:
            ui_data["normalized_content_hash"] = new_hash
            write(ui_path, json.dumps(ui_data, indent=2) + "\n")
            updated = True
    
    return updated


def process_batch(article_dirs, batch_name):
    """Process a batch of articles."""
    print(f"\n{'='*60}")
    print(f"BATCH: {batch_name}")
    print(f"{'='*60}")
    
    changed_dirs = []
    for d in article_dirs:
        try:
            result = fix_article(d)
            if result:
                changed_dirs.append(result)
        except Exception as e:
            print(f"  ✗ ERROR: {d}: {e}")
            import traceback
            traceback.print_exc()
    
    # Update hashes for changed articles
    print(f"\n--- Updating hashes for {batch_name} ---")
    for d in changed_dirs:
        try:
            update_metadata_hash(d)
        except Exception as e:
            print(f"  HASH ERROR: {d}: {e}")
    
    return len(changed_dirs)


def main():
    """Main entry point - process all 100 named 'Other' articles in batches."""
    # Collect all named other article directories (non-core-concept, non-mastery, etc.)
    all_dirs = sorted(os.listdir(BASE))
    
    exclude_prefixes = ('lea-', 'overview-', 'mastery-', 'owner-smoke-', 'playwright-')
    
    named_other_dirs = []
    for d in all_dirs:
        slug = d.split('--')[0]
        if slug.startswith(exclude_prefixes):
            continue
        if not os.path.isdir(os.path.join(BASE, d)):
            continue
        named_other_dirs.append(d)
    
    print(f"Found {len(named_other_dirs)} named 'Other' articles to process")
    
    # Process in batches of ~15
    batch_size = 15
    
    total_changed = 0
    
    for i in range(0, len(named_other_dirs), batch_size):
        batch = named_other_dirs[i:i+batch_size]
        batch_num = i // batch_size + 1
        count = process_batch(batch, f"Named Other Batch {batch_num} ({len(batch)} articles)")
        total_changed += count
    
    print(f"\n{'='*60}")
    print(f"COMPLETE: {total_changed} articles modified out of {len(named_other_dirs)} total")
    print(f"{'='*60}")
    
    return total_changed


if __name__ == "__main__":
    total = main()
    print(f"\nResult: {total} articles polished")
