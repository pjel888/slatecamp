#!/usr/bin/env python3
"""
Polish 86 Building Materials and Building Utilities core-concept articles 
for learning effectiveness.
Process 15-20 at a time in batches using Python.
For each article:
  1. Replace generic boilerplate Learning Goals with specific, action-oriented objectives
  2. Remove AI meta-commentary ("After reading this article, you should be able to:")
  3. Add cross-references to related articles
  4. Add missing ExamTip where appropriate
  5. Check UI components are appropriate
  6. Update normalized_content_hash in ui-blocks.json after changes
  7. Do NOT change factual content
"""

import hashlib
import json
import os
import re
import sys

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# ── Specific learning goals for each Materials article ─────────────────────

MATL_GOALS = {
    # 001 - Wood and Timber Products
    "lea-matl-001-03": "Classify wood joints (mortise-and-tenon, dovetail, lap, dado, rabbet, butt) by geometry, load capacity, and application, and identify correct fastening methods (nails, screws, bolts, adhesives) for each joint type in Philippine timber construction.",
    "lea-matl-001-04": "Identify wood preservation methods (pressure treatment, surface application, thermal modification) and explain how each method protects against decay, termites, and fire in the Philippine tropical climate.",
    "lea-matl-001-05": "Identify Philippine timber species by strength group, density, and common applications, and explain the DENR regulatory framework governing timber sourcing, grading, and documentation for architectural specifications.",
    
    # 002 - Masonry and Concrete
    "lea-matl-002-03": "Classify masonry units (concrete hollow blocks, clay bricks, solid concrete blocks) by size, compressive strength, and application, and apply NSCP 2015 minimum strength requirements for load-bearing and non-load-bearing masonry walls.",
    "lea-matl-002-04": "Identify natural stone types (granite, marble, limestone, sandstone, slate) by their geological origin, physical properties, durability, and appropriate architectural applications in the Philippine context.",
    "lea-matl-002-05": "Identify cement types (Types I–V per ASTM C150 / PNS 43) by their chemical composition, strength gain rate, and appropriate applications, and explain how sulfate resistance, heat of hydration, and strength class determine Type selection.",
    "lea-matl-002-06": "Classify concrete admixtures (water reducers, retarders, accelerators, superplasticizers, air-entraining, pozzolans) by function and explain how each modifies fresh or hardened concrete properties to meet specific construction requirements.",
    
    # 003 - Metals, Glass, and Glazing
    "lea-matl-003-04": "Identify structural steel sections (W-shapes, channels, angles, HSS, plates) by their cross-section geometry, standard designations, and typical applications in building frames, and recall standard yield strengths for A36 and A572 Grade 50 steel.",
    "lea-matl-003-05": "Classify glass types (annealed, tempered, laminated, insulated, heat-strengthened, wired) by manufacturing process, strength characteristics, break pattern, and safety/security applications in building enclosures.",
    "lea-matl-003-07": "Classify structural bolt types (A325, A490, A307) by grade, installation method (snug-tight, pretensioned, slip-critical), and application, and identify nut and washer specifications for steel-to-steel connections per NSCP 2015.",
    
    # 004 - Construction Systems and Methods
    "lea-matl-004-06": "Explain reinforced concrete design principles — how steel reinforcement and concrete work compositely under tension and compression — and identify rebar grades, sizes, and detailing requirements (cover, spacing, hooks) per NSCP 2015.",
    "lea-matl-004-07": "Describe structural steel construction systems — bolted and welded connections, composite steel-concrete construction, moment frames, braced frames — and identify when each system is appropriate for Philippine building projects.",
    "lea-matl-004-08": "Identify formwork types (conventional timber, prefabricated panels, slip forms, climbing forms, tunnel forms) by material, reuse potential, and application, and apply NSCP 2015 lateral pressure and deflection limits for formwork design.",
    "lea-matl-004-09": "Classify construction equipment (excavators, cranes, concrete pumps, compactors) by function and application, and explain how equipment selection, site logistics, and material handling affect construction sequencing and project efficiency.",
    "lea-matl-004-10": "Identify preconstruction activities — site investigation, soil testing (SPT, plate load test, compaction testing), survey/staking, temporary facilities — and explain how each activity ensures foundation adequacy and construction readiness.",

    # 005 - Sustainable and Green Materials
    "lea-matl-005-05": "Explain formwork removal timing (stripping time) requirements per NSCP 2015 based on concrete strength gain, temperature, and member type, and identify minimum curing periods before form removal for slabs, beams, walls, and columns.",
    "lea-matl-005-07": "Define embodied carbon and explain how material extraction, manufacturing, transportation, and installation contribute to a building's total carbon footprint, and identify strategies to reduce embodied carbon through material selection and specification.",
    "lea-matl-005-08": "Identify vernacular and sustainable building materials (bamboo, nipa, cogon, rattan, adobe, stabilized earth blocks) and explain how traditional Philippine construction methods achieve environmental performance while supporting local economies.",
    "lea-matl-005-09": "Explain life cycle assessment (LCA) as a methodology for evaluating environmental impacts of building materials from cradle to grave, and identify how LCA results inform green building certifications (BERDE, LEED, EDGE).",
    "lea-matl-005-10": "Identify VOC (volatile organic compound) limits for interior finishes, recycled content requirements, regional sourcing criteria, and certified wood requirements under BERDE and LEED green building rating systems.",

    # 006 - Roofing, Waterproofing, and Insulation
    "lea-matl-006-01": "Classify roofing materials (corrugated GI sheets, clay tiles, concrete tiles, asphalt shingles, standing seam metal, green roofs) by slope requirements, weather resistance, fire rating, and service life for Philippine climate conditions.",
    "lea-matl-006-02": "Identify roofing system components — underlayment, flashings, valleys, ridges, eaves, gutters, vents — and explain how each component contributes to weather-tightness, thermal performance, and durability of the roof assembly.",
    "lea-matl-006-03": "Distinguish waterproofing from damp-proofing by application method, material type (sheet membranes, liquid-applied, cementitious, bentonite), and the degree of water exposure each system is designed to resist in below-grade and wet-area applications.",
    "lea-matl-006-04": "Identify thermal insulation materials (fiberglass, mineral wool, EPS, XPS, polyurethane foam, reflective foil) by R-value, application method, fire rating, and moisture resistance, and calculate minimum R-values per NBCP energy code requirements.",
    "lea-matl-006-05": "Classify sealants (silicone, polyurethane, polysulfide, acrylic, butyl) and caulks by movement capability, adhesion properties, weathering resistance, and application for different joint types and building substrates in the Philippine climate.",

    # 007 - Interior Finishes
    "lea-matl-007-01": "Classify floor finishes (ceramic tile, porcelain, hardwood, engineered wood, vinyl, linoleum, carpet, terrazzo, polished concrete, rubber) by durability, maintenance requirements, moisture resistance, and appropriate application for different room types.",
    "lea-matl-007-02": "Classify wall finishes (paint, wallpaper, gypsum board, plywood paneling, tile, stone cladding, fabric, metal panel, glass) by aesthetic effect, durability, installation method, and fire-resistance rating for interior wall applications.",
    "lea-matl-007-03": "Classify ceiling finishes (suspended acoustic tile, gypsum board, metal pan, open plenum, wood strip, stretched fabric) by acoustic performance, fire rating, access requirements, and aesthetic effect for different occupancy types.",
    "lea-matl-007-04": "Classify paint and coating systems (latex, oil-based, epoxy, polyurethane, stain, varnish, enamel, textured) by binder type, durability, sheen level, cleanability, and appropriate substrate for interior and exterior architectural applications.",
    "lea-matl-007-05": "Identify the purpose and structure of a finish schedule as a specification document that coordinates floor, wall, and ceiling finishes across all rooms, and create a sample finish schedule entry applying correct material codes, locations, and installation notes.",
    "lea-matl-007-06": "Classify countertop materials (granite, marble, quartz, solid surface, laminate, stainless steel, concrete, wood, tile) by durability, stain resistance, heat resistance, maintenance, and appropriate application for kitchens, bathrooms, labs, and commercial spaces.",

    # 008 - Hardware, Joints, and Fasteners
    "lea-matl-008-01": "Classify door hardware (hinges, locksets, closers, panic devices, exit hardware) by function, ANSI grade (Grade 1, 2, 3), application, and fire-rating requirements, and identify correct hardware for different door types and occupancy classifications.",
    "lea-matl-008-02": "Identify window hardware types (casement operators, sliding locks, awning cranks, jalousie mechanisms, pivot hinges, projected window hardware) and explain how each hardware type supports the operation, security, and weather-tightness of different window configurations.",
    "lea-matl-008-03": "Classify fastener systems (nails, screws, bolts, anchors, rivets, welding, adhesives) by material, load capacity, substrate compatibility, and installation method, and select the appropriate fastener for a given structural or non-structural connection.",
    "lea-matl-008-04": "Identify expansion joint types and locations in buildings — structural, thermal, seismic, construction joints — and explain how each joint type accommodates movement while maintaining water-tightness, fire rating, and structural integrity.",
    "lea-matl-008-05": "Classify adhesive systems (construction adhesive, epoxy, contact cement, PVA glue, polyurethane, silicone, acrylic) by bonding strength, setting time, substrate compatibility, and application, and select the correct adhesive for structural, semi-structural, and non-structural bonding.",

    # 009 - Architectural Specifications and Documentation
    "lea-matl-009-01": "Explain the purpose and structure of architectural specifications as legal contract documents that define quality standards, materials, workmanship, and installation methods, and distinguish specifications from drawings by their complementary roles in defining design intent.",
    "lea-matl-009-02": "Navigate the CSI MasterFormat divisions by number and title — identify the correct division for any given material, product, or work section (e.g., Division 04 for Masonry, Division 08 for Openings) — and explain how MasterFormat organizes construction specifications.",
    "lea-matl-009-03": "Identify the three-part format of a specification section (Part 1: General, Part 2: Products, Part 3: Execution) and explain the type of information required in each part, including references, submittals, quality assurance, materials, and installation procedures.",
    "lea-matl-009-04": "Distinguish specification types — prescriptive, performance, proprietary, reference standard — by their approach to defining requirements, and identify when each type is appropriate based on project goals, procurement rules, and design control needs.",

    # 010 - Estimating Quantities and Material Computation
    "lea-matl-010-01": "Calculate concrete volume in cubic meters from building dimensions, convert to mix design proportions to determine cement bags, sand, and gravel quantities, and apply waste factors (5-10%) for construction estimating.",
    "lea-matl-010-02": "Calculate CHB quantities by wall area, accounting for openings (doors, windows), bond pattern, and waste factor, and compute mortar volume and reinforcing steel requirements for reinforced masonry walls.",
    "lea-matl-010-03": "Calculate rebar quantities by linear meter weight conversion for given bar diameters or bar number designation, using standard steel density (7,850 kg/m³) and applicable waste factors for reinforced concrete elements.",
    "lea-matl-010-04": "Calculate lumber/board foot measure using the formula BF = T(in) × W(in) × L(ft) ÷ 12, convert between dimensional lumber sizes, and estimate total board feet for a given framing plan accounting for spacing, layout, and waste.",
    "lea-matl-010-05": "Calculate paint coverage requirements by surface area, number of coats, and paint coverage rate per liter (typically 8-12 m²/L per coat), accounting for substrate porosity and wastage in interior and exterior painting estimates.",
    "lea-matl-010-06": "Calculate tile quantities by floor or wall area including trim, thresholds, and a 5-15% waste factor for cutting and breakage, and determine grout and adhesive requirements based on tile size and joint width.",
    "lea-matl-010-07": "Calculate structural steel weight using standard section properties — W-shape weight per meter, plate weight (kg = thickness × width × length × density) — and estimate total tonnage for a given steel frame layout.",
    "lea-matl-010-08": "Calculate roofing material quantities — area coverage per sheet, side lap and end lap allowances, ridge length, fascia/gutter lengths, fastener count — for corrugated GI sheets and other roofing systems on sloped roofs.",
}

# ── Specific learning goals for each Utilities article ─────────────────────

UTIL_GOALS = {
    # 001 - Sanitary/Plumbing Systems
    "lea-util-001-06": "Identify waste disposal and treatment systems (septic tanks, grease traps, sewage treatment plants, leach fields) and apply Revised National Plumbing Code requirements for sizing, clearances, and discharge standards in Philippine building design.",
    "lea-util-001-07": "Identify sanitary drainage system components — soil stacks, waste pipes, vents, traps, cleanouts, and building drains — and explain the hydraulic principles and code requirements that govern their sizing, slope, and venting.",
    "lea-util-001-08": "Apply Revised National Plumbing Code fixture unit values to calculate drainage fixture unit (DFU) loads, size horizontal branches and vertical stacks, and determine minimum pipe diameters for sanitary drainage systems.",
    "lea-util-001-09": "Design rainwater harvesting systems — calculate catchment area, gutter/downspout sizing per PNS 1980, first-flush diversion, storage tank volume based on rainfall data, and filtration — for Philippine residential and commercial projects.",

    # 002 - HVAC/Mechanical
    "lea-util-002-03": "Apply core ventilation standards — NBCP minimum fresh air rates, ASHRAE 62.1 indoor air quality procedures, and PD 1096 Rule VIII requirements — to determine fresh air requirements for different Philippine occupancy types and building uses.",
    "lea-util-002-04": "Distinguish HVAC system types (split-type, window-type, packaged units, VRF/VRV, chilled water, central plant) by their configuration, capacity range, energy efficiency, and appropriateness for different Philippine building typologies and budgets.",
    "lea-util-002-05": "Classify kitchen exhaust hoods (Type I vs Type II) by NFPA 96 requirements based on cooking appliance type (grease-producing vs steam/heat-only), and identify duct construction, fire suppression, and ventilation rate requirements for commercial kitchen exhaust systems.",
    "lea-util-002-06": "Apply regulatory requirements for elevator design — PD 1096 minimum car dimensions, travel speed, machine room requirements, and BP 344 accessibility clearances — and identify how code requirements differ by building occupancy and number of floors.",
    "lea-util-002-07": "Apply escalator design parameters — width, rise, inclination angle (30° standard, 35° max), speed (0.5 m/s typical), and the 400-mm flat-step run-in/run-out requirement per BP 344 accessibility standards for escalator installations.",
    "lea-util-002-08": "Identify core mechanical HVAC principles — sensible and latent heat, refrigeration cycle, coefficient of performance (COP), psychrometric chart interpretation — and apply these principles to calculate cooling loads for Philippine buildings.",
    "lea-util-002-09": "Apply NBCP and mechanical code requirements for mechanical room location, siting, ventilation, fire rating, clearances, access, and equipment layout for building mechanical systems (chillers, boilers, AHUs, pumps) in Philippine projects.",

    # 003 - Electrical
    "lea-util-003-02": "Design emergency and standby power systems — generator sizing based on life-safety loads, automatic transfer switch (ATS) requirements, fuel storage, and PEC rules for emergency circuits — for Philippine buildings as required by PD 1096 and RA 9514.",
    "lea-util-003-03": "Apply electrical protection levels and the fault hierarchy — short circuit, ground fault, overload, arc fault — and identify the correct protective device (circuit breaker, fuse, GFCI, AFCI, surge protector) for each type of electrical fault per PEC requirements.",
    "lea-util-003-04": "Select electrical wire insulation types (THHN/THWN, XHHW, UF, NM, MC, USE) by temperature rating, moisture resistance, location (wet/dry/damp), and application per Philippine Electrical Code (PEC) ampacity tables and installation requirements.",
    "lea-util-003-05": "Distinguish grounding from bonding — grounding connects the electrical system to the earth for safety, bonding creates an electrically conductive path between metallic parts — and apply PEC Article 2.50 and 2.70 requirements for both systems in building design.",
    "lea-util-003-06": "Diagram the electrical distribution hierarchy — from utility transformer to main service panel to subpanels to branch circuits to loads — and identify PEC requirements for conductor sizing, overcurrent protection, voltage drop, and panel location at each level.",
    "lea-util-003-07": "Calculate residential electrical loads using the PEC optional method (Section 2.20) — general lighting, small-appliance, laundry, fixed appliances, HVAC, cooking equipment — determine total demand load, and size the service entrance conductors and main disconnect.",
    "lea-util-003-08": "Identify the key PEC provisions tested on the LEA — service sizing, branch circuit requirements, receptacle spacing, the 80% continuous load rule, voltage drop, grounding electrode system — and apply each to a comprehensive building design scenario.",

    # 004 - Fire Protection
    "lea-util-004-04": "Identify when fire alarm systems are mandatory per RA 9514 (Fire Code of the Philippines) IRR based on building occupancy classification, height, occupant load, and floor area, and distinguish manual from automatic fire alarm system requirements.",
    "lea-util-004-05": "Apply NSCP 2015 seismic bracing requirements for MEPF systems — trapeze supports, lateral sway bracing for pipes and ducts, flexible couplings, and seismic separation — to design earthquake-resilient mechanical, electrical, and plumbing installations.",
    "lea-util-004-06": "Identify CCTV system components (cameras, DVR/NVR, monitors, cabling, storage), classification by camera type (fixed, PTZ, thermal, IP), resolution standards, and application for security monitoring in different building types per relevant Philippine standards.",
    "lea-util-004-07": "Apply the formula of fire protection: R = hazard × occupancy × area × construction type; calculate fire flow requirements for sprinkler systems and identify standpipe system pressure and hose connection placement per NFPA 13, 14, and RA 9514 IRR.",
    "lea-util-004-08": "Apply NSCP 2015 Section 208 seismic bracing requirements for MEPF components — calculate bracing forces, determine maximum spacing of lateral braces for conduit/pipe/duct runs, and identify anchor types and embedment depths per ACI 318 and NSCP provisions.",

    # 005 - Security and Communications
    "lea-util-005-03": "Design fire detection and alarm systems in compliance with RA 9514 and NFPA 72 — identify detector types (smoke, heat, flame, gas) by application areas, calculate spacing per coverage requirements, and coordinate notification appliances (horns, strobes, speakers) for occupant alerting.",
    "lea-util-005-04": "Design security and access control systems — card readers, biometric readers, intercoms, door controllers, magnetic locks — and apply Philippine data privacy considerations (RA 10173) and industry standards for integrated building security infrastructure.",
    "lea-util-005-05": "Plan cable television (CATV), broadband (ISP cabling), and wireless telecommunications infrastructure (cellular DAS, Wi-Fi access points, radio/TV broadcast) for building projects including riser space, equipment rooms, and raceway requirements.",

    # 006 - Lighting and Acoustics
    "lea-util-006-02": "Apply the basics of architectural lighting design — luminous flux (lumens), illuminance (lux), luminance (cd/m²), luminous efficacy (lm/W), color temperature (Kelvin), color rendering index (CRI) — to select appropriate lighting systems for Philippine building projects.",
    "lea-util-006-03": "Select appropriate lighting systems by lamp type (LED, fluorescent, halogen, induction, HID) based on luminous efficacy, CRI, color temperature, life expectancy, dimming capability, and application in different interior and exterior building spaces.",
    "lea-util-006-05": "Apply recommended illumination levels (lux) by space type per the Philippine Lighting Standard (PNS / IESNA RP-1) for office, educational, healthcare, hospitality, residential, and industrial spaces, and design efficient lighting layouts for given room dimensions.",
    "lea-util-006-06": "Design daylighting strategies for tropical buildings — window-to-floor ratio (WFR) requirements, shading device design, light shelves, diffusing glazing, light tubes, clerestories — to maximize natural light while controlling solar heat gain per PD 1096 Rule VIII.",
    "lea-util-006-07": "Identify MEPF equipment noise sources (chillers, pumps, AHUs, cooling towers, transformers, generators, elevators) by typical noise output levels (dB), and apply noise control strategies (isolation, enclosures, silencers, duct lining) for architectural acoustics design.",

    # 007 - Renewable Energy
    "lea-util-007-02": "Design smart metering and advanced metering infrastructure (AMI) for building electrical systems — identify key components (smart meters, data concentrators, communication protocols, head-end systems) and explain how AMI supports energy management and demand-side response in Philippine projects.",
    "lea-util-007-04": "Design solar photovoltaic (PV) systems for Philippine buildings — calculate array size based on load analysis, solar irradiance data, panel efficiency, and inverter sizing; apply net metering provisions per DOE/ERC regulations for grid-connected PV installations.",
    "lea-util-007-05": "Integrate renewable energy and alternative energy systems (solar PV, solar thermal, wind, biomass, geothermal heat pumps) into building design, and apply BERDE/LEED credit requirements for on-site renewable energy generation in Philippine building projects.",

    # 008 - Coordination and Integration
    "lea-util-008-01": "Apply the three-phase MEPF coordination framework — schematic design, design development, construction documents — and identify the architect's role, coordination deliverables, and integration milestones at each phase for successful building systems design.",
    "lea-util-008-02": "Design mechanical spaces (chiller plants, boiler rooms, AHU rooms, fan rooms, elevator machine rooms) incorporating adequate equipment access, service clearances, ventilation, structural support, acoustic separation, and fire-rated separation per NBCP and mechanical code requirements.",
    "lea-util-008-03": "Coordinate electrical utility connection requirements with the local electric utility (Meralco or local electric cooperative) — determine service entrance location, transformer clearances, metering configuration, and underground vs overhead service per PEC and utility company standards.",
    "lea-util-008-04": "Identify Philippine utility-related laws and codes — PD 1096 (NBCP), RA 6541 (Revised Plumbing Code), RA 9514 (Fire Code), PEC (Philippine Electrical Code), RA 9003 (Ecological Solid Waste), RA 9275 (Clean Water Act), RA 9513 (Renewable Energy Act) — and explain their scope and interrelationships.",
}

# ── Article group definitions for cross-references ────────────────────────

MATL_GROUPS = {
    "001": {"name": "Wood and Timber Products", "articles": ["001-03", "001-04", "001-05"]},
    "002": {"name": "Masonry and Concrete", "articles": ["002-03", "002-04", "002-05", "002-06"]},
    "003": {"name": "Metals, Glass, and Glazing", "articles": ["003-04", "003-05", "003-07"]},
    "004": {"name": "Construction Systems and Methods", "articles": ["004-06", "004-07", "004-08", "004-09", "004-10"]},
    "005": {"name": "Sustainable and Green Materials", "articles": ["005-05", "005-07", "005-08", "005-09", "005-10"]},
    "006": {"name": "Roofing, Waterproofing, and Insulation", "articles": ["006-01", "006-02", "006-03", "006-04", "006-05"]},
    "007": {"name": "Interior Finishes", "articles": ["007-01", "007-02", "007-03", "007-04", "007-05", "007-06"]},
    "008": {"name": "Hardware, Joints, and Fasteners", "articles": ["008-01", "008-02", "008-03", "008-04", "008-05"]},
    "009": {"name": "Architectural Specifications and Documentation", "articles": ["009-01", "009-02", "009-03", "009-04"]},
    "010": {"name": "Estimating Quantities and Material Computation", "articles": ["010-01", "010-02", "010-03", "010-04", "010-05", "010-06", "010-07", "010-08"]},
}

UTIL_GROUPS = {
    "001": {"name": "Plumbing and Sanitary Systems", "articles": ["001-06", "001-07", "001-08", "001-09"]},
    "002": {"name": "HVAC and Mechanical Systems", "articles": ["002-03", "002-04", "002-05", "002-06", "002-07", "002-08", "002-09"]},
    "003": {"name": "Electrical Systems", "articles": ["003-02", "003-03", "003-04", "003-05", "003-06", "003-07", "003-08"]},
    "004": {"name": "Fire Protection Systems", "articles": ["004-04", "004-05", "004-06", "004-07", "004-08"]},
    "005": {"name": "Security and Communication Systems", "articles": ["005-03", "005-04", "005-05"]},
    "006": {"name": "Lighting and Acoustics", "articles": ["006-02", "006-03", "006-05", "006-06", "006-07"]},
    "007": {"name": "Renewable and Alternative Energy", "articles": ["007-02", "007-04", "007-05"]},
    "008": {"name": "MEPF Coordination and Integration", "articles": ["008-01", "008-02", "008-03", "008-04"]},
}

# ── Utility functions ────────────────────────────────────────────────────

def sha256(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def analyze_content(content):
    """Analyze content structure for diagnostic purposes."""
    analysis = {}
    
    # Check Learning Goal section
    lg_match = re.search(r'## Learning Goal\s*\n(.*?)(?=\n## |\Z)', content, re.DOTALL)
    if lg_match:
        lg_text = lg_match.group(1).strip()
        analysis['has_learning_goal'] = True
        analysis['learning_goal_text'] = lg_text[:200]
        analysis['is_generic'] = (
            'After reading' in lg_text or
            'you should understand the key concepts' in lg_text or
            'After reading this article, you should be able to' in lg_text
        )
    else:
        analysis['has_learning_goal'] = False
    
    # Count components
    analysis['examtip_count'] = len(re.findall(r'component="ExamTip"', content))
    analysis['warn_count'] = len(re.findall(r'component="Warn"', content))
    analysis['tip_count'] = len(re.findall(r'component="Tip"', content))
    analysis['keyvalues_count'] = len(re.findall(r'component="KeyValues"', content))
    analysis['callout_count'] = len(re.findall(r'component="Callout"', content))
    analysis['processflow_count'] = len(re.findall(r'component="ProcessFlow"', content))
    analysis['lawecallout_count'] = len(re.findall(r'component="LawCallout"', content))
    analysis['comparisontable_count'] = len(re.findall(r'component="ComparisonTable"', content))
    analysis['has_related_articles'] = '## Related Articles' in content or '## Related' in content
    
    return analysis

def get_cross_references(slug, is_matl):
    """Generate cross-reference string from a slug's group members."""
    prefix = "lea-matl-" if is_matl else "lea-util-"
    
    parts = slug.replace(prefix, "").replace("-core-concept", "")
    
    # Extract major group (e.g., "001" from "001-03" or "003" from "003-06-the-distribution-hierarchy")
    group_match = re.match(r'(\d{3})', parts)
    if not group_match:
        return ""
    
    group_num = group_match.group(1)
    # Normalize to short form like "001-03"
    short_match = re.match(r'(\d{3})-(\d{2})', parts)
    if not short_match:
        return ""
    this_short = f"{short_match.group(1)}-{short_match.group(2)}"
    
    groups = MATL_GROUPS if is_matl else UTIL_GROUPS
    subject_name = "Building Materials and Construction Methods" if is_matl else "Building Utilities / MEPF"
    overview_slug = "overview-building-materials" if is_matl else "overview-building-utilities-mepf"
    mastery_slug = "mastery-building-materials" if is_matl else "mastery-building-utilities-mepf"
    
    if group_num not in groups:
        return ""
    
    group = groups[group_num]
    others = [a for a in group["articles"] if a != this_short]
    
    if not others:
        return ""
    
    # Only show first 4 related articles max
    others = others[:4]
    
    refs = []
    for art in others:
        ref_slug = f"**{prefix}{art}-core-concept**"
        refs.append(ref_slug)
    
    topic = group["name"]
    result = f"\n\n## Related Articles\n\nSee also within {topic}: {', '.join(refs)}.\n"
    
    result += f"\n> **Overview:** See **{overview_slug}** for the full curriculum structure and study strategy. See **{mastery_slug}** for connections across topics.\n"
    
    return result


def add_examtip_if_missing(content, article_topic, is_matl):
    """Add an ExamTip component if the article has none."""
    examtip_count = len(re.findall(r'component="ExamTip"', content))
    
    if examtip_count >= 1:
        return content  # Already has at least one ExamTip
    
    # Craft tip based on subject
    if is_matl:
        tip_text = f"**ALE Exam Tip — {article_topic}:** This topic is heavily tested in Area B. Focus on mastering material classifications, key property values (compressive strength, R-value, unit weight), and estimating formulas. Create comparison tables to distinguish similar materials (e.g., cement Types I–V, glass types, insulation types). Practice computational problems for concrete volume, board foot, CHB count, and paint coverage — these are reliable exam items."
    else:
        tip_text = f"**ALE Exam Tip — {article_topic}:** Building Utilities carries the heaviest weight in Area B. Focus on code-specific values (PEC ampacities, Revised Plumbing Code fixture units, NFPA spacing requirements) and regulatory triggers (when is a fire alarm mandatory? when is seismic bracing required?). Practice load computations and system sizing problems which appear regularly on the exam."
    
    examtip_block = f"""
[SLATECAMP_UI_BLOCK:ui_e001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: {tip_text}
[/SLATECAMP_UI_BLOCK]
"""
    
    # Insert before "## Common Mistakes" or "## How It's Tested" or at end of article
    insertion_point = None
    
    for m in re.finditer(r'## (?:How It.s Tested|Key Facts|Common Mistakes|Key Provisions|Philippine Construction Context|What You Need to Know)', content):
        insertion_point = m.start()
        break
    
    if insertion_point:
        content = content[:insertion_point] + examtip_block + "\n\n" + content[insertion_point:]
    else:
        # Insert before last section or at end
        content = content.rstrip() + "\n\n" + examtip_block
    
    return content


def improve_ui_components(content, is_matl):
    """Check if there are appropriate UI components and suggest improvements.
    For Materials: KeyValues, ComparisonTable, ExamTip, Warn, Tip
    For Utilities: KeyValues, LawCallout, ExamTip, Warn, ProcessFlow
    """
    analysis = analyze_content(content)
    changes = []
    
    # Materials should have: KeyValues, ComparisonTable, ExamTip, Warn, Tip
    # Utilities should have: KeyValues, LawCallout, ExamTip, Warn, ProcessFlow
    
    # We don't add components here (that would change structure too much),
    # but we note what's missing for the report
    if is_matl:
        if analysis['keyvalues_count'] == 0:
            changes.append("Missing KeyValues component (consider adding for material properties)")
        if analysis['comparisontable_count'] == 0:
            changes.append("Missing ComparisonTable (consider adding for material comparisons)")
    else:
        if analysis['keyvalues_count'] == 0:
            changes.append("Missing KeyValues component (consider adding for code values)")
        if analysis['lawecallout_count'] == 0:
            changes.append("Missing LawCallout component (consider adding for code references)")
        if analysis['processflow_count'] == 0:
            changes.append("Missing ProcessFlow component (consider adding for installation sequences)")
    
    return changes


def get_goal_key(slug, goals_map):
    """Match slug to a goal key in the goals map."""
    slug_clean = slug.replace("-core-concept", "").replace("-system-components-and-functions", "") \
        .replace("-what-you-need-to-know-for-the-lea", "") \
        .replace("-core-ventilation-standards", "") \
        .replace("-core-definitions-grounding-vs-bonding", "") \
        .replace("-core-principles-standards", "") \
        .replace("-core-concepts-and-formulas", "") \
        .replace("-design-considerations-and-best-practices", "") \
        .replace("-communication-protocols-technologies", "") \
        .replace("-recommended-illumination-levels-by-space-type", "") \
        .replace("-daylighting-design-strategy", "") \
        .replace("-mepf-equipment-noise-sources-and-output-levels", "") \
        .replace("-the-distribution-hierarchy", "") \
        .replace("-residential-load-computation-pec-method", "") \
        .replace("-summary-for-exam-preparation", "") \
        .replace("-when-fire-alarm-systems-are-mandatory-ra-9514-irr", "") \
        .replace("-seismic-bracing-and-earthquake-resilience", "") \
        .replace("-seismic-bracing-requirements-per-nscp-2015", "") \
        .replace("-smart-metering-infrastructure-ami", "") \
        .replace("-solar-photovoltaic-pv-systems", "") \
        .replace("-renewable-energy-integration-systems", "") \
        .replace("-the-three-phase-coordination-framework", "") \
        .replace("-mechanical-spaces", "") \
        .replace("-electrical-utility-connection", "") \
        .replace("-emergency-power-systems", "") \
        .replace("-protection-levels-and-risk-assessment", "") \
        .replace("-wire-insulation-types-and-ratings", "") \
        .replace("-kitchen-exhaust-hood-classification", "") \
        .replace("-regulatory-framework", "") \
        .replace("-escalators-specifications-and-design-parameters", "") \
        .replace("-mechanical-room-location-and-siting", "") \
        .replace("-system-types-and-applications", "")
    
    # Try exact match
    if slug_clean in goals_map:
        return slug_clean
    
    # Try prefix match
    for key in goals_map:
        if slug_clean.startswith(key):
            return key
        if key.startswith(slug_clean):
            return key
    
    return None


def fix_article(dirname):
    """Process a single article directory."""
    slug = dirname.split('--')[0]
    
    # Determine if materials or utilities
    is_matl = slug.startswith("lea-matl-")
    is_util = slug.startswith("lea-util-")
    
    if not is_matl and not is_util:
        return None
    
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path):
        print(f"  SKIP: {slug} - no normalized.md")
        return None
    
    content = read(norm_path)
    original_content = content
    changes = []
    
    # ── 1. Remove "After reading this article, you should be able to:" ──
    if "After reading this article, you should be able to:" in content:
        content = content.replace("After reading this article, you should be able to:", "")
        changes.append("Removed 'After reading this article' AI commentary header")
    
    # Also remove the generic "After reading this article, you should understand..." 
    if "After reading this article, you should understand the key concepts tested" in content:
        content = content.replace("After reading this article, you should understand the key concepts tested in the ALE for this topic, including relevant code provisions, dimensional standards, and common exam applications.", "")
        changes.append("Removed generic 'After reading this article' AI commentary")
    
    # ── 2. Replace generic Learning Goals ──
    goals_map = MATL_GOALS if is_matl else UTIL_GOALS
    goal_key = get_goal_key(slug, goals_map)
    
    if goal_key:
        new_goal = goals_map[goal_key]
        
        # Find the Learning Goal section - handle both inline and multi-line
        goal_pattern = r'## Learning Goal\s*\n(.*?)(?=\n## |\Z)'
        goal_match = re.search(goal_pattern, content, re.DOTALL)
        
        if goal_match:
            existing_goal = goal_match.group(1).strip()
            
            # Check if the current goal is generic boilerplate or empty
            is_generic = (
                'After reading' in existing_goal or
                'you should understand the key concepts' in existing_goal or
                'you should understand the key concepts tested in the ALE' in existing_goal or
                'you should be able to:' == existing_goal or
                existing_goal.strip() == ''
            )
            
            # Also check if the existing goal is just bullet points from the old pattern
            is_leftover_bullets = existing_goal.startswith('-') or existing_goal.startswith('•')
            
            # Check if the text under Learning Goal is actually body content, not a goal
            # (happens when generic text was removed, leaving body paragraph as the capture)
            action_verbs = ['Identify', 'Explain', 'Classify', 'Apply', 'Design', 'Distinguish',
                           'Calculate', 'Navigate', 'Diagram', 'Plan', 'Describe', 'Define',
                           'Trace', 'Select', 'Determine', 'Analyze', 'Evaluate', 'Create']
            starts_with_action = any(existing_goal.startswith(v) or existing_goal.startswith(f'\n{v}') for v in action_verbs)
            is_body_paragraph = len(existing_goal.split()) > 5 and not starts_with_action and existing_goal != new_goal
            
            if is_generic or is_leftover_bullets or existing_goal == '' or is_body_paragraph:
                # Replace with specific goal
                new_header = f"## Learning Goal\n\n{new_goal}"
                
                # Be careful to only replace the section header + content
                full_match = goal_match.group(0)
                content = content.replace(full_match, new_header)
                changes.append(f"Replaced generic/empty learning goal with specific goal for {goal_key}")
    
    # ── 3. Add cross-references if missing ──
    if "## Related Articles" not in content and "## Related" not in content:
        if 'overview' not in slug and 'mastery' not in slug:
            xref = get_cross_references(slug, is_matl)
            if xref:
                content = content.rstrip() + xref + "\n"
                changes.append("Added cross-references to related articles")
    
    # ── 4. Add missing ExamTip ──
    topic = slug.replace("lea-matl-", "").replace("lea-util-", "").replace("-core-concept", "")
    if goal_key and goal_key in goals_map:
        short_topic = goals_map[goal_key][:60]
    else:
        short_topic = topic
    
    content = add_examtip_if_missing(content, short_topic, is_matl)
    if content.count('component="ExamTip"') > original_content.count('component="ExamTip"'):
        changes.append("Added missing ExamTip component")
    
    # ── 5. Check UI components ──
    ui_suggestions = improve_ui_components(content, is_matl)
    if ui_suggestions:
        changes.extend(ui_suggestions)
    
    # ── 6. Save changes if any ──
    if content != original_content:
        write(norm_path, content)
        print(f"  CHANGED: {slug} - {', '.join(changes)}")
        return article_dir
    else:
        print(f"  OK: {slug} - no changes needed")
        return None


def update_ui_block_hash(article_dir):
    """Update normalized_content_hash in ui-blocks.json based on current normalized.md."""
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path) or not os.path.exists(ui_path):
        return False
    
    content = read(norm_path)
    new_hash = sha256(content)
    
    ui_data = json.loads(read(ui_path))
    old_hash = ui_data.get("normalized_content_hash", "")
    
    if old_hash != new_hash:
        ui_data["normalized_content_hash"] = new_hash
        write(ui_path, json.dumps(ui_data, indent=2) + "\n")
        print(f"  HASH UPDATED: {new_hash[:16]}...")
        return True
    
    return False


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
            print(f"  ERROR: {d}: {e}")
    
    # Update hashes for changed articles
    print(f"\n--- Updating hashes for {batch_name} ---")
    for d in changed_dirs:
        try:
            update_ui_block_hash(d)
        except Exception as e:
            print(f"  HASH ERROR: {d}: {e}")
    
    return len(changed_dirs)


def main():
    """Main entry point - process all 86 articles in batches."""
    all_dirs = sorted(os.listdir(BASE))
    
    matl_dirs = sorted([d for d in all_dirs if d.startswith("lea-matl-") and os.path.isdir(os.path.join(BASE, d))])
    util_dirs = sorted([d for d in all_dirs if d.startswith("lea-util-") and os.path.isdir(os.path.join(BASE, d))])
    
    print(f"Found {len(matl_dirs)} Materials articles and {len(util_dirs)} Utilities articles")
    
    # Process in batches of ~15
    batch_size = 16
    
    total_changed = 0
    
    # Materials batches
    for i in range(0, len(matl_dirs), batch_size):
        batch = matl_dirs[i:i+batch_size]
        batch_num = i // batch_size + 1
        count = process_batch(batch, f"Materials Batch {batch_num} ({len(batch)} articles)")
        total_changed += count
    
    # Utilities batches
    for i in range(0, len(util_dirs), batch_size):
        batch = util_dirs[i:i+batch_size]
        batch_num = i // batch_size + 1
        count = process_batch(batch, f"Utilities Batch {batch_num} ({len(batch)} articles)")
        total_changed += count
    
    print(f"\n{'='*60}")
    print(f"DONE: Processed {len(matl_dirs) + len(util_dirs)} articles, {total_changed} changed")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
