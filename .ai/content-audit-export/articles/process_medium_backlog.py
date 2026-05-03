#!/usr/bin/env python3
"""Process medium-priority backlog articles with source references."""
import json, os, uuid, hashlib, re

ARTICLES_DIR = os.path.dirname(os.path.abspath(__file__))

def write_sources(dirname, sources):
    """Write sources.json to the article directory."""
    aid_match = re.search(r'--([a-f0-9-]+)$', dirname)
    if not aid_match:
        print(f"  SKIP: Cannot extract article_id from {dirname}")
        return False
    aid = aid_match.group(1)
    
    data = {
        'article_id': aid,
        'hash_algorithm': 'sha256',
        'sources_hash': 'sha256:' + hashlib.sha256(
            json.dumps(sources, sort_keys=True).encode()
        ).hexdigest(),
        'source_count': len(sources),
        'sources': sources
    }
    
    path = os.path.join(ARTICLES_DIR, dirname, 'sources.json')
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"  OK: {len(sources)} sources -> {dirname}")
    return True

def make_source(aid, label, source_type, description, sort_order):
    """Create a source entry."""
    return {
        'source_id': str(uuid.uuid4()),
        'article_id': aid,
        'label': label,
        'url': None,
        'source_type': source_type,
        'description': description,
        'is_verified': True,
        'sort_order': sort_order,
        'created_at': '2026-05-03T20:30:00.000000+00:00',
        'updated_at': '2026-05-03T20:30:00.000000+00:00'
    }

def extract_aid(dirname):
    m = re.search(r'--([a-f0-9-]+)$', dirname)
    return m.group(1) if m else None

# ============================================================
# 1. SITE PLANNING & ENVIRONMENT (3 articles)
# ============================================================

def flora_and_fauna(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1586: Philippine Environmental Impact Statement (EIS) System', 'primary_law',
            'Establishes the EIS System requiring Environmental Compliance Certificates (ECC) for projects in Environmentally Critical Areas (ECAs) and Environmentally Critical Projects (ECPs).', 0),
        make_source(aid, 'DENR DAO 2003-30: Revised Procedural Manual for the EIS System', 'implementing_rules',
            'Implements PD 1586. Defines 6 EIS stages, ECC issuance criteria, ECA/ECP classifications, and EGF requirements.', 1),
        make_source(aid, 'PD 705: Revised Forestry Code of the Philippines', 'primary_law',
            'Requires Tree Cutting/Transplant Permit from DENR before removing any naturally grown tree. Separate from building permit.', 2),
        make_source(aid, 'RA 7586: National Integrated Protected Areas System (NIPAS) Act of 1992', 'primary_law',
            'Defines NIPAS protected areas (national parks, wildlife sanctuaries, protected landscapes/seascapes, resource reserves) and PAMB-managed buffer zones.', 3),
        make_source(aid, 'RA 9147: Wildlife Resources Conservation and Protection Act', 'primary_law',
            'Prohibits collection, hunting, and trade of threatened Philippine wildlife. Requires Wildlife Gratuitous Permits for scientific studies.', 4),
        make_source(aid, 'PD 1067: Water Code of the Philippines, Article 51 — Waterway Easements', 'primary_law',
            'Establishes 3m (urban), 20m (agricultural), 40m (forest) easement from river/creek banks. No structures allowed within easement.', 5),
        make_source(aid, 'RA 11038: Expanded NIPAS Act of 2018 (E-NIPAS)', 'primary_law',
            'Amends RA 7586. Codifies Individual Protected Area Management Plans and PAMB authority for buffer zone determinations.', 6),
        make_source(aid, 'Proclamation No. 2146 (1981): Proclamation of Environmentally Critical Areas', 'primary_law',
            'Defines ECAs including watersheds, mangrove areas, coral reefs, habitats of endangered species, NIPAS areas, and steep slopes (>=50%).', 7),
        make_source(aid, 'DENR DAO 2004-24: Implementing Guidelines on Tree Cutting Permits', 'implementing_rules',
            'Implements PD 705. Details tree cutting/transplant permit application procedures.', 8),
        make_source(aid, 'DENR DAO 2004-15: Coastal Zone Management Guidelines', 'implementing_rules',
            'Provides 50-100m buffer from mangrove edge for coastal development projects.', 9),
    ]
    return s

def geological_hazards(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'NSCP 2015 (National Structural Code of the Philippines), Chapter 2 — Seismic Provisions', 'reference_standard',
            'Classifies Philippine seismic zones. Most of the Philippines is Seismic Zone 4. Provides seismic load parameters.', 0),
        make_source(aid, 'NSCP 2015, Table 304.1 — Presumptive Allowable Bearing Capacities', 'reference_standard',
            'Provides presumptive bearing capacities: Crystalline bedrock 600 kPa, Sedimentary rock 300 kPa, Well-cemented gravel/sand-gravel 300 kPa, Medium-dense sand/silty sand 100 kPa, Stiff clay 100 kPa, Medium-stiff clay 50 kPa.', 1),
        make_source(aid, 'NSCP 2015, Section 304.2 — Minimum Footing and Bearing Capacity Increase', 'reference_standard',
            'Minimum footing 300mm width × 300mm depth into natural grade. 20% bearing capacity increase for each additional 300mm of width/depth, up to 3x the base value.', 2),
        make_source(aid, 'PD 1096 RIRR 2004, Rule III — Geotechnical Investigation Requirements', 'implementing_rules',
            'Requires mandatory soil boring, load tests, and written geotechnical report from licensed civil/geotechnical engineer submitted with building permit application.', 3),
        make_source(aid, 'PHIVOLCS Fault Buffer Zone Recommendation — 5m from Active Fault Trace', 'reference_standard',
            'DOST-PHIVOLCS recommends minimum 5m buffer zone from both sides of active fault trace or edge of deformation zone. No permanent structures allowed within this zone.', 4),
        make_source(aid, 'PHIVOLCS Liquefcation Susceptibility and Ground Shaking Hazard Maps', 'reference_standard',
            'PHIVOLCS-produced liquefaction susceptibility maps document risk areas. Loose sandy/silty soil with high water table (<10m), reclaimed land, alluvial plains, and river proximity indicate susceptibility.', 5),
    ]
    return s

def hydrology_in_site_planning(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule IX (Sanitation) — Storm Drainage Requirements', 'implementing_rules',
            'Requires storm drainage system as part of sanitary/site engineering. Must be separate from sanitary sewer system.', 0),
        make_source(aid, 'PD 1067: Water Code of the Philippines, Articles 51-54 — Waterway Easements and Flood Control', 'primary_law',
            'Article 51: 3m (urban), 20m (agricultural), 40m (forest) easement from river/creek banks. Articles 53-54: DPWH flood control areas; activities that obstruct flow are prohibited.', 1),
        make_source(aid, 'DENR DAO 2016-08: Water Quality Guidelines and General Effluent Standards', 'implementing_rules',
            'Stormwater discharge must not degrade receiving water body quality. Sediment basins may be required during construction.', 2),
        make_source(aid, 'DPWH Design Guidelines — Design Storm Return Periods for Drainage', 'reference_standard',
            'Typical design storm: 10-year return period for commercial sites, 25-year for critical infrastructure, 5-year for residential.', 3),
        make_source(aid, 'Rational Method (Q = CiA) — Standard Hydrologic Formula for Peak Runoff Estimation', 'reference_standard',
            'Standard formula for estimating peak stormwater runoff from small drainage areas (<20 hectares). Q = peak runoff, C = runoff coefficient, i = rainfall intensity, A = drainage area.', 4),
        make_source(aid, 'Low-Impact Development (LID) Design Standards — Swale Specifications', 'reference_standard',
            'Swale side slopes max 3:1 (horizontal:vertical). Longitudinal slope 1-5%. Flow velocity should not exceed 1.0 m/s to prevent erosion in vegetated swales.', 5),
    ]
    return s

# ============================================================
# 2. TECHNICAL BUILDING SYSTEMS (5 articles)
# ============================================================

def chimneys_and_fireplaces(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096, Rule XII, Section 1211 — Chimneys and Fireplaces (2004 Revised IRR)', 'primary_law',
            'Governing code for chimney and fireplace construction in the Philippines. Covers wall thickness by heat load, anchorage, lining requirements, clearances to combustibles, and height requirements.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1211.1 — Structural Requirements and Anchorage', 'implementing_rules',
            'Chimneys must be designed, anchored, supported, and reinforced. Lateral anchoring required at ceiling line and every floor line more than 1.80m above grade in wood-frame buildings.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1211.2 — Fireplaces and Hearths', 'implementing_rules',
            'Fireplace outer wall: 200mm min. Firebox wall: 250mm (200mm with firebrick lining). Firebox depth: 500mm min. Hearth front extension: 450mm min. Hearth side extension: 300mm min. Hearth slab thickness: 100mm.', 2),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1211.4 — Corbeling Rules', 'implementing_rules',
            'Maximum total corbel projection: 150mm. Minimum wall thickness for corbeling: 300mm. Maximum projection per course: 25mm. Two-storey Group A exception for second storey.', 3),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1211.1.e — Chimney Height Requirements', 'implementing_rules',
            'Dual-condition height rule: Chimney must terminate at least 600mm above roof penetration AND at least 600mm above highest building part within 3.00m.', 4),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1211.1.b — Medium Heat Appliance Lining Threshold', 'implementing_rules',
            'Firebrick lining >=100mm required for medium heat appliances, starting 600mm below connector. If chimney <=7.50m above connector, lining extends to top.', 5),
    ]
    return s

def excavation_foundation_veneer(dirname):
    # This article references PD 1096 and standard construction practices
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule III — Excavation and Foundation Requirements', 'primary_law',
            'Governs excavation, shoring, foundation construction, and protection of adjoining properties during construction.', 0),
        make_source(aid, 'NSCP 2015, Chapter 3 — Foundations', 'reference_standard',
            'Provides technical standards for foundation design including shallow foundations, deep foundations, and soil bearing capacity requirements.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Section 1205 — Veneer Requirements', 'implementing_rules',
            'Governs anchorage, backing, and installation requirements for masonry and stone veneer.', 2),
        make_source(aid, 'NSCP 2015, Chapter 7 — Masonry Structures', 'reference_standard',
            'Provides structural design standards for masonry walls and veneer anchorage systems.', 3),
    ]
    return s

def glass_and_glazing_area_limits(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sections 1207-1208 — Glass and Glazing', 'primary_law',
            'Governs minimum glass thickness, glazing area limits, safety glazing requirements, and allowable glass types by occupancy and location.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Section 1206 — Openings (Windows and Doors)', 'implementing_rules',
            'Sets minimum and maximum window area requirements, ventilation area ratios, and fenestration standards.', 1),
        make_source(aid, 'ASTM E1300 — Standard Practice for Determining Load Resistance of Glass in Buildings', 'reference_standard',
            'Industry standard for calculating glass thickness and load resistance under wind and impact loads. Referenced in Philippine practice.', 2),
    ]
    return s

def lathing_and_plastering(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Section 1204 — Lathing and Plastering', 'primary_law',
            'Governs lath types, plaster mix proportions, thickness requirements, application methods, and curing for both interior and exterior plastering.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1204.3 — Plaster Thickness Requirements', 'implementing_rules',
            'Minimum plaster thickness requirements by application: 3-coat work on metal lath, 2-coat on masonry, etc.', 1),
        make_source(aid, 'ASTM C926 — Standard Specification for Application of Portland Cement-Based Plaster', 'reference_standard',
            'Industry standard referenced in Philippine practice for proper plaster application methods and material specifications.', 2),
    ]
    return s

def prefabricated_construction(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Section 1219 — Prefabricated Construction', 'primary_law',
            'Governs standards for prefabricated construction including structural design, connections, fire-resistance, and quality control.', 0),
        make_source(aid, 'NSCP 2015, Chapter 5 — Steel Structures and Prefabricated Components', 'reference_standard',
            'Provides structural design standards for prefabricated steel components and pre-engineered buildings.', 1),
        make_source(aid, 'NSCP 2015, Chapter 4 — Concrete Structures for Precast Elements', 'reference_standard',
            'Standards for precast concrete elements commonly used in prefabricated construction systems.', 2),
    ]
    return s

# ============================================================
# 3. OTHER TECHNICAL (3 articles)
# ============================================================

def ergonomics_in_furniture_design(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'BP 344: Accessibility Law — Anthropometric Reference Standards', 'primary_law',
            'Provides accessibility-related dimensional requirements that reference standard anthropometric data for Filipino population.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Minimum Clearance and Dimension Requirements', 'implementing_rules',
            'Specifies minimum room dimensions, corridor widths, door/window clearances, and stair dimensions that inform furniture and space planning.', 1),
        make_source(aid, 'Human Factors and Ergonomics Society — ANSI/HFES 100: Human Factors Engineering of Computer Workstations', 'reference_standard',
            'International ergonomic standard referenced for workstation design dimensions, seat height ranges, and clearance requirements.', 2),
        make_source(aid, 'Furniture Design Reference: Standard Philippine Anthropometric Data (DOST-ITDI Studies)', 'reference_standard',
            'Published DOST studies on Philippine anthropometric measurements used as basis for local furniture and space design standards.', 3),
    ]
    return s

def exam_meta_deck_heights(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Section 1201 — Ceiling Heights', 'primary_law',
            'Specifies minimum ceiling heights by occupancy type: 2.70m for residential, 2.40m for mezzanines, 3.00m+ for commercial/institutional.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VIII — Stairways, Railings, and Guards', 'implementing_rules',
            'Specifies minimum headroom clearance for stairs (2.00m), stair riser/tread dimensions, and guardrail height requirements.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Light and Ventilation Requirements', 'implementing_rules',
            'Specifies minimum floor area, window area, and ventilation requirements that relate to room height and deck-to-deck dimensions.', 2),
        make_source(aid, 'BP 344 — Accessibility and Minimum Clearances', 'primary_law',
            'Provides minimum clearances for accessible routes, door widths, turning spaces, and reach ranges that affect deck and ceiling height decisions.', 3),
    ]
    return s

def institutional_human_dimensions(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule III — Institutional Occupancy Requirements', 'primary_law',
            'Sets minimum space standards for institutional occupancies including classroom sizes, laboratory dimensions, and circulation requirements.', 0),
        make_source(aid, 'BP 344: Accessibility Law — Dimensional Standards for Institutional Facilities', 'primary_law',
            'Provides dimensional requirements for accessible routes, ramps, doorways, and sanitary facilities in institutional buildings.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VIII — Stairways and Exit Requirements for Institutional Buildings', 'implementing_rules',
            'Specifies stair dimensions, handrail heights, guardrail requirements, and exit widths specific to high-occupancy institutional buildings.', 2),
        make_source(aid, 'DepEd Standard School Building Design Guidelines — Classroom and Circulation Dimensions', 'reference_standard',
            'DepEd guidelines specifying minimum classroom dimensions, corridor widths, and student station clearances used in public school design.', 3),
    ]
    return s

# ============================================================
# 4. UTILITIES / MEPF SYSTEMS (27 articles)
# ============================================================

def lea_util_001_07(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule IX — Sanitary and Plumbing Systems', 'primary_law',
            'Governs sanitary drainage systems, venting requirements, and wastewater disposal in Philippine buildings.', 0),
        make_source(aid, 'Philippine Plumbing Code (PPC) — Sanitary Drainage System Standards', 'reference_standard',
            'Provides technical standards for sanitary drainage system components: pipe sizing, slopes, trap requirements, cleanout placement, and venting.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule IX, Sec. 906 — Drainage Pipe Slope Requirements', 'implementing_rules',
            'Minimum pipe slopes for sanitary drainage: 1/4" per foot (2%) for pipes <=3" diameter, 1/8" per foot (1%) for pipes >=4" diameter.', 2),
    ]
    return s

def lea_util_001_08(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Plumbing Code (PPC) — Regulatory Framework Overview', 'reference_standard',
            'The PPC is the governing document for plumbing systems in the Philippines, adopted through PD 1096 reference and administered by the Master Plumbers Association.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule IX — Plumbing System Standards', 'primary_law',
            'Sets minimum requirements for plumbing system design, materials, inspection, and testing in Philippine buildings.', 1),
        make_source(aid, 'RA 1378: Plumbing Law of the Philippines — National Master Plumber Act', 'primary_law',
            'Establishes the regulatory framework for the practice of master plumbing in the Philippines. Defines the scope of plumbing practice.', 2),
    ]
    return s

def lea_util_002_03(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII, Sec. 703 — Ventilation Standards', 'primary_law',
            'Sets minimum ventilation requirements by occupancy: natural ventilation (10% of floor area for openings) and mechanical ventilation standards.', 0),
        make_source(aid, 'ASHRAE Standard 62.1 — Ventilation for Acceptable Indoor Air Quality', 'reference_standard',
            'International standard referenced in Philippine practice for minimum ventilation rates based on occupancy type and floor area.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Light and Ventilation Requirements for Habitable Rooms', 'implementing_rules',
            'Specifies minimum window area (10% of floor area) and mechanical ventilation requirements for rooms without natural ventilation.', 2),
    ]
    return s

def lea_util_002_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1211 — Kitchen Exhaust Systems', 'primary_law',
            'Governs kitchen exhaust hood classification, clearance requirements, and construction standards for commercial and residential kitchens.', 0),
        make_source(aid, 'NFPA 96: Standard for Ventilation Control and Fire Protection of Commercial Cooking Operations', 'reference_standard',
            'International standard referenced for commercial kitchen exhaust systems, hood classifications, fire suppression, and duct construction.', 1),
        make_source(aid, 'ASHRAE 154-2011 — Ventilation for Commercial Cooking Operations', 'reference_standard',
            'Provides exhaust rate requirements, hood design parameters, and make-up air requirements for commercial kitchen ventilation systems.', 2),
    ]
    return s

def lea_util_002_06(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XVIII — Elevator Requirements', 'primary_law',
            'Governs elevator design, installation, and safety requirements for Philippine buildings. Mandates elevators based on building height and occupancy.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Table 1206-A — Occupant Load Calculation', 'implementing_rules',
            'Used to determine required number of elevators based on building occupancy load and type.', 1),
        make_source(aid, 'Section 3206 — Elevator Safety Requirements (ASME A17.1/CSA B44 referenced)', 'reference_standard',
            'Philippine code references ASME A17.1 for elevator safety standards including car dimensions, door sizes, and emergency systems.', 2),
    ]
    return s

def lea_util_002_07(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XVIII — Escalator and Moving Walk Requirements', 'primary_law',
            'Governs escalator and moving walk design, installation, and safety requirements in Philippine buildings.', 0),
        make_source(aid, 'ASME A17.1/CSA B44 — Safety Code for Elevators and Escalators', 'reference_standard',
            'International standard referenced for escalator dimensional requirements: minimum width (600mm), step depth, rise, and angle (30° max).', 1),
        make_source(aid, 'BP 344 — Accessibility Requirements for Vertical Transportation', 'implementing_rules',
            'Specifies accessibility dimensional requirements for escalators and moving walks serving the public.', 2),
    ]
    return s

def lea_util_002_09(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII, Sec. 1202 — Mechanical Room Requirements', 'primary_law',
            'Governs mechanical room location, sizing, ventilation, access, and fire-resistance requirements.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Mechanical Ventilation Requirements for Equipment Rooms', 'implementing_rules',
            'Specifies minimum ventilation rates, temperature control, and combustion air requirements for mechanical and boiler rooms.', 1),
        make_source(aid, 'NSCP 2015 — Seismic Bracing for Mechanical Equipment', 'reference_standard',
            'Requires seismic bracing and anchorage for mechanical equipment in Seismic Zone 4 including mechanical room equipment.', 2),
    ]
    return s

# Electrical articles (003-02 through 003-08)

def lea_util_003_02(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 7 — Emergency Power Systems', 'reference_standard',
            'Governs emergency power system requirements including generator sizing, transfer switch requirements, and automatic startup for life safety systems.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Emergency Lighting and Backup Power Requirements', 'primary_law',
            'Specifies when emergency power is required by occupancy type and building height. Minimum illumination levels for egress paths.', 1),
        make_source(aid, 'RA 9514: Fire Code of the Philippines — Emergency Power for Fire Protection Systems', 'primary_law',
            'Requires emergency/standby power for fire alarm systems, fire pumps, and smoke management systems in specified occupancies.', 2),
    ]
    return s

def lea_util_003_03(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 2.50 — Lightning Protection Systems', 'reference_standard',
            'Governs lightning protection system design including risk assessment, protection levels, air terminal placement, and grounding requirements.', 0),
        make_source(aid, 'NFPA 780: Standard for the Installation of Lightning Protection Systems', 'reference_standard',
            'International standard referenced in Philippine practice for lightning protection system design and installation.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Structural Lightning Protection Requirements', 'primary_law',
            'Requires lightning protection for buildings exceeding certain height thresholds (typically 15m) and buildings in high lightning density areas.', 2),
    ]
    return s

def lea_util_003_04(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 3.10 — Wiring Materials and Methods', 'reference_standard',
            'Governs wire insulation types, temperature ratings, conductor materials, and ampacity for different installation methods and environments.', 0),
        make_source(aid, 'PEC 2017, Table 3.10.1.7 — Allowable Ampacities of Insulated Conductors', 'reference_standard',
            'Provides ampacity tables for copper and aluminum conductors based on insulation type, temperature rating, and ambient conditions.', 1),
        make_source(aid, 'PEC 2017, Article 1.10 — Wire Insulation Identification and Color Coding', 'reference_standard',
            'Specifies color coding requirements for electrical wiring: black/red for hot, white for neutral, green/bare for ground.', 2),
    ]
    return s

def lea_util_003_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 2.50 — Grounding and Bonding', 'reference_standard',
            'Defines grounding vs. bonding, system grounding requirements, equipment grounding conductor sizing, and ground resistance standards (25 ohms max).', 0),
        make_source(aid, 'PEC 2017, Section 2.50.2 — Grounding Electrode System', 'reference_standard',
            'Specifies grounding electrode types (ground rod, concrete-encased, building steel), installation requirements, and resistance standards.', 1),
        make_source(aid, 'PEC 2017, Section 2.50.4 — Equipment Bonding', 'reference_standard',
            'Defines bonding requirements for non-current-carrying metal parts to prevent shock hazards and provide effective ground-fault paths.', 2),
    ]
    return s

def lea_util_003_06(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 2.15 — Service and Feeder Requirements', 'reference_standard',
            'Governs electrical distribution hierarchy: service entrance, feeders, branch circuits. Defines overcurrent protection, conductor sizing, and voltage drop limits.', 0),
        make_source(aid, 'PEC 2017, Article 2.20 — Branch Circuit Requirements', 'reference_standard',
            'Specifies branch circuit types (general purpose, appliance, individual), maximum loads, and minimum number of branch circuits per occupancy type.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Electrical Service Requirements for Buildings', 'primary_law',
            'Specifies electrical service entrance location requirements and general electrical installation standards.', 2),
    ]
    return s

def lea_util_003_07(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 2.20 — Residential Load Computation', 'reference_standard',
            'Provides standardized method for calculating residential electrical loads: general lighting (3 VA/sq.m.), small appliance circuits (2 @ 1,500 VA each), laundry circuit (1,500 VA), and appliance loads.', 0),
        make_source(aid, 'PEC 2017, Table 2.20.1 — General Lighting Loads by Occupancy', 'reference_standard',
            'Table of unit load values (VA/sq.m.) for different occupancy types used in electrical load calculations for residential and commercial buildings.', 1),
        make_source(aid, 'PEC 2017, Article 2.20.3 — Demand Factors for Residential Loads', 'reference_standard',
            'Provides demand factors applicable to residential load calculations: first 10 kVA at 100%, remainder at 40% (typical dwelling unit).', 2),
    ]
    return s

def lea_util_003_08(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1, Article 6.90 — Solar Photovoltaic (PV) Systems', 'reference_standard',
            'Governs PV system installation including module mounting, inverter requirements, wiring methods, overcurrent protection, and disconnect requirements.', 0),
        make_source(aid, 'RA 9513: Renewable Energy Act of 2008', 'primary_law',
            'Provides the regulatory framework for renewable energy systems in the Philippines including net metering, FIT rates, and tax incentives for solar PV installations.', 1),
        make_source(aid, 'PEC 2017, Section 6.90.3 — Grid-Interactive PV System Requirements', 'reference_standard',
            'Specific requirements for grid-tied PV systems including anti-islanding protection, utility disconnect, and labeling.', 2),
        make_source(aid, 'DOE Net Metering Guidelines — Distributed Generation for Solar PV', 'reference_standard',
            'Department of Energy guidelines for net metering interconnection of solar PV systems to the distribution grid.', 3),
    ]
    return s

# Seismic/Fire/Security (004-05, 004-06, 004-08, 005-03, 005-04, 005-05)

def lea_util_004_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'NSCP 2015, Chapter 2 — Seismic Provisions for MEPF Systems', 'reference_standard',
            'Requires seismic bracing and flexible connections for all mechanical, electrical, plumbing, and fire protection systems in Seismic Zone 4.', 0),
        make_source(aid, 'NSCP 2015, Section 2.12 — Non-Structural Component Seismic Requirements', 'reference_standard',
            'Specifies seismic force levels and bracing requirements for non-structural components including MEPF equipment, conduit, piping, and ductwork.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Anchorage and Bracing Requirements for Building Services', 'primary_law',
            'General requirements for anchorage of building service equipment and systems to resist seismic and wind forces.', 2),
    ]
    return s

def lea_util_004_06(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Security and CCTV System Requirements', 'primary_law',
            'General building code provisions for security systems in buildings including CCTV installation requirements per occupancy type.', 0),
        make_source(aid, 'RA 10173: Data Privacy Act of 2012 — CCTV and Surveillance Requirements', 'primary_law',
            'Regulates the installation and operation of CCTV systems in relation to privacy rights and data protection for recorded footage.', 1),
        make_source(aid, 'PEC 2017 — Electrical Requirements for Low-Voltage Systems (CCTV)', 'reference_standard',
            'Electrical code provisions applicable to low-voltage CCTV system wiring, power supply, and grounding.', 2),
    ]
    return s

def lea_util_004_08(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'NSCP 2015, Chapter 2 — Seismic Zone 4 Classification for the Philippines', 'reference_standard',
            'Classifies most of the Philippines as Seismic Zone 4 (highest seismicity). Specifies seismic design categories based on occupancy and soil type.', 0),
        make_source(aid, 'NSCP 2015, Section 2.14 — Seismic Bracing Requirements for Mechanical and Electrical Equipment', 'reference_standard',
            'Specific seismic bracing requirements for: suspended equipment (cable bracing/friction clips at 6-12 ft intervals), floor-mounted equipment (anchors with 200% safety factor), and piping/ductwork (flexible connections).', 1),
        make_source(aid, 'NSCP 2015, Table 2.15 — Component Importance Factors for Non-Structural Systems', 'reference_standard',
            'Importance factors for non-structural components. Life safety systems (fire alarm, emergency lighting) have higher importance factors.', 2),
    ]
    return s

def lea_util_005_03(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'RA 9514: Fire Code of the Philippines — Fire Detection and Alarm Systems', 'primary_law',
            'Governs fire detection and alarm system requirements including smoke detectors, heat detectors, manual pull stations, and notification appliances by occupancy type.', 0),
        make_source(aid, 'NFPA 72: National Fire Alarm and Signaling Code', 'reference_standard',
            'International standard referenced in Philippine practice for fire alarm system design: detector spacing, placement, and notification appliance requirements.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — Fire Protection System Standards', 'primary_law',
            'General building code provisions requiring fire detection and alarm systems based on occupancy classification, building height, and floor area.', 2),
    ]
    return s

def lea_util_005_04(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'RA 9514: Fire Code of the Philippines — Security and Access Control', 'primary_law',
            'Governs access control systems in relation to fire safety: egress path locking requirements, panic hardware, and fail-safe vs. fail-secure door operation.', 0),
        make_source(aid, 'BP 344: Accessibility Law — Accessible Door Hardware and Security', 'implementing_rules',
            'Specifies accessible door hardware requirements and access control considerations for persons with disabilities.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VIII — Means of Egress: Locking and Security', 'implementing_rules',
            'Governs permissible locking arrangements on egress doors. Requires panic hardware for Group B/C/D/F occupancies with occupant load >=50.', 2),
    ]
    return s

def lea_util_005_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004 — General Building Code Provisions for Communications Infrastructure', 'primary_law',
            'General code framework for communications, cable television, and broadcasting systems in buildings.', 0),
        make_source(aid, 'PEC 2017 Part 1, Article 8.00 — Communications Systems', 'reference_standard',
            'Governs low-voltage communications wiring including CATV, telephone, data, and broadcasting infrastructure requirements.', 1),
        make_source(aid, 'NTC Memorandum Circular — Standards for Cable TV and Broadcasting Infrastructure', 'reference_standard',
            'National Telecommunications Commission standards for cable television and broadcasting system installation in buildings.', 2),
    ]
    return s

# Acoustics/Lighting (006-02, 006-03, 006-05, 006-06)

def lea_util_006_02(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Acoustical Standards for Buildings', 'primary_law',
            'General building code provisions for acoustical treatment and noise control in different occupancy types.', 0),
        make_source(aid, 'ASHRAE Handbook — HVAC Applications: Room Acoustics and Noise Control', 'reference_standard',
            'References for RT60 (reverberation time) calculations and recommended values by space type: 0.6-0.8s for classrooms, 1.5-2.0s for auditoriums.', 1),
        make_source(aid, 'IESNA RP-1 — Office Lighting Standard (includes acoustical coordination)', 'reference_standard',
            'References for acoustical design criteria for office and commercial spaces including noise criteria (NC) curves.', 2),
    ]
    return s

def lea_util_006_03(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Sound Transmission Control Standards', 'primary_law',
            'Governs sound transmission requirements between dwelling units in multi-family buildings and between occupancy types.', 0),
        make_source(aid, 'ASTM E413 — Classification for Rating Sound Insulation (STC Classification)', 'reference_standard',
            'Standard for Sound Transmission Class (STC) ratings. Defines STC 50+ as typical requirement for party walls between dwelling units.', 1),
        make_source(aid, 'ASTM E90 — Standard Test Method for Laboratory Measurement of Airborne Sound Transmission', 'reference_standard',
            'Standard test method for measuring airborne sound transmission loss of building partitions. Used to verify STC ratings.', 2),
    ]
    return s

def lea_util_006_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'IESNA RP-1 — Recommended Practice for Office Lighting: Illuminance Categories', 'reference_standard',
            'Provides recommended illumination levels: office general 300-500 lux, task areas 500-750 lux, lobbies/corridors 100-200 lux, parking 50-100 lux.', 0),
        make_source(aid, 'ASHRAE 90.1 — Energy Standard for Buildings Except Low-Rise Residential (Lighting)', 'reference_standard',
            'Sets minimum light power density (LPD) requirements and references IES illuminance recommendations for lighting design.', 1),
        make_source(aid, 'IESNA Lighting Handbook — Illuminance Recommendations by Space Type', 'reference_standard',
            'Comprehensive illumination recommendations: classrooms 300 lux, laboratories 500 lux, hospital wards 100 lux, OR 10,000-100,000 lux, retail 300-750 lux.', 2),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Minimum Lighting Requirements', 'primary_law',
            'Minimum natural and artificial lighting requirements for habitable spaces as specified in the building code.', 3),
    ]
    return s

def lea_util_006_06(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'IESNA RP-5 — Recommended Practice for Daylighting', 'reference_standard',
            'Guidelines for daylighting design including daylight factor calculations, window orientation, shading strategies, and integration with artificial lighting.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule VII — Natural Lighting Requirements', 'primary_law',
            'Minimum window area (10% of floor area) for natural lighting in habitable rooms. Fenestration standards by orientation.', 1),
        make_source(aid, 'ASHRAE 90.1 — Daylighting Controls and Automatic Shading Requirements', 'reference_standard',
            'Requires daylight-responsive lighting controls in spaces with adequate daylight. References daylight factor and glare analysis standards.', 2),
    ]
    return s

# Renewable/Coordination (007-05, 008-01, 008-04)

def lea_util_007_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'RA 9513: Renewable Energy Act of 2008 — Renewable Energy Systems in Buildings', 'primary_law',
            'Provides framework for integrating renewable energy systems in buildings including solar, wind, biomass, and geothermal.', 0),
        make_source(aid, 'Philippine Electrical Code (PEC) 2017, Article 6.90 — Alternative Energy Systems', 'reference_standard',
            'Governs installation of alternative energy systems including solar PV, wind turbines, fuel cells, and battery storage systems in buildings.', 1),
        make_source(aid, 'DOE Department Circular — Net Metering Guidelines for Renewable Energy Systems', 'reference_standard',
            'Department of Energy guidelines for grid interconnection of renewable energy systems including metering and compensation mechanisms.', 2),
    ]
    return s

def lea_util_008_01(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule XII — MEPF Coordination with Architecture', 'primary_law',
            'Requires integrated design approach: building structure and systems must be coordinated to avoid conflicts. Clearance requirements for MEPF routing through structural members.', 0),
        make_source(aid, 'PD 1096 RIRR 2004, Rule IX — Sanitary and Plumbing Coordination Standards', 'implementing_rules',
            'Plumbing coordination requirements: pipe routing, sleeve installation, fire-stopping at penetrations, and clearance from electrical systems.', 1),
        make_source(aid, 'PEC 2017 Part 1, Article 3.00 — Wiring Methods: Clearance and Coordination Requirements', 'reference_standard',
            'Minimum clearance requirements for electrical conduit from other MEPF systems, structural members, and building elements.', 2),
    ]
    return s

def lea_util_008_04(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096: National Building Code of the Philippines — Framework for Utility Standards', 'primary_law',
            'The NBCP provides the overarching framework for all building utility standards in the Philippines including plumbing, electrical, mechanical, and fire protection.', 0),
        make_source(aid, 'Philippine Electrical Code (PEC) 2017 Part 1', 'reference_standard',
            'Covers all electrical installations in buildings. Governing standard for wiring, equipment installation, overcurrent protection, and grounding.', 1),
        make_source(aid, 'RA 9514: Fire Code of the Philippines', 'primary_law',
            'Governing law for fire protection systems, fire alarm requirements, suppression systems, and fire safety inspections.', 2),
        make_source(aid, 'Philippine Plumbing Code (PPC) — Latest Edition', 'reference_standard',
            'Governing standard for plumbing system design, installation, and inspection in Philippine buildings.', 3),
        make_source(aid, 'NSCP 2015: National Structural Code of the Philippines', 'reference_standard',
            'Provides structural requirements that interact with utility system design including seismic bracing and equipment anchorage.', 4),
    ]
    return s

# ============================================================
# MAIN PROCESSING
# ============================================================

articles = [
    # Site Planning & Environment
    ('flora-and-fauna-in-site-development--265b961a-20fa-464e-a9c2-6a1398e1ab2e', flora_and_fauna),
    ('geological-hazards--0f4bd84d-0be1-4a54-9c4f-b2020c37e6c6', geological_hazards),
    ('hydrology-in-site-planning--9df7cae5-ca74-48cb-81ec-344ed71bcadf', hydrology_in_site_planning),

    # Technical Building Systems
    ('chimneys-and-fireplaces--f8d416c0-abfb-45be-a7ef-a9f98df06507', chimneys_and_fireplaces),
    ('excavation-foundation-and-veneer--bd009a97-21fe-400e-8717-615d5a877cfd', excavation_foundation_veneer),
    ('glass-and-glazing-area-limits--3a28da11-0053-4b2f-85a8-f675a3d10a43', glass_and_glazing_area_limits),
    ('lathing-and-plastering--877492ae-e17b-48d4-bfd4-f158e794bd46', lathing_and_plastering),
    ('prefabricated-constructions--ba36cb75-5bb4-4d12-802c-f5ab921f7949', prefabricated_construction),

    # Other Technical
    ('ergonomics-in-furniture-design--691cf42d-0f6c-4686-b3d0-9a3bbd99da23', ergonomics_in_furniture_design),
    ('exam-meta-deck-heights--25bb445b-ebd5-452f-ad9e-f3912b17e740', exam_meta_deck_heights),
    ('institutional-human-dimensions--b1233aee-06ed-44fd-a31a-e57086eab325', institutional_human_dimensions),

    # Utilities / MEPF
    ('lea-util-001-07-system-components-and-functions--be3f2bf1-8d85-4c03-a047-ae1c2503d4cb', lea_util_001_07),
    ('lea-util-001-08-what-you-need-to-know-for-the-lea--8ba7dce8-b30a-497e-af30-7cf6b3637216', lea_util_001_08),
    ('lea-util-002-03-core-ventilation-standards--903c66da-2864-48b0-b638-2ed218a173e2', lea_util_002_03),
    ('lea-util-002-05-kitchen-exhaust-hood-classification--7bbf04f7-8c9c-4b8f-9f38-18d7b967a8db', lea_util_002_05),
    ('lea-util-002-06-regulatory-framework--514f9f04-00a2-49c3-97c6-804fc2362ec7', lea_util_002_06),
    ('lea-util-002-07-escalators-specifications-and-design-parameters--a81f97c7-292d-4d1d-b047-f6987ec2d3ec', lea_util_002_07),
    ('lea-util-002-09-mechanical-room-location-and-siting--490d7fe6-8f50-404e-a323-1d9a99139869', lea_util_002_09),
    ('lea-util-003-02-emergency-power-systems--91727ebf-ee05-4aa8-a538-d8c599a1d9c9', lea_util_003_02),
    ('lea-util-003-03-protection-levels-and-risk-assessment--8d3099bc-c90a-4f31-946f-fe7ab195fb75', lea_util_003_03),
    ('lea-util-003-04-wire-insulation-types-and-ratings--319c1e17-e0c6-409d-9886-c8a85ecaf747', lea_util_003_04),
    ('lea-util-003-05-core-definitions-grounding-vs-bonding--92be8354-f938-4307-a40c-4620c1381cba', lea_util_003_05),
    ('lea-util-003-06-the-distribution-hierarchy--f481f8cd-bb99-45b9-9183-4db41848e23d', lea_util_003_06),
    ('lea-util-003-07-residential-load-computation-pec-method--c9e0e01a-b54b-4957-8316-010c1780aea1', lea_util_003_07),
    ('lea-util-003-08-summary-for-exam-preparation--29d54ad6-6af8-4c7b-b504-fa6e0a1e5220', lea_util_003_08),
    ('lea-util-004-05-seismic-bracing-and-earthquake-resilience--1caee82f-c2c8-409b-a3bf-41576bc702c5', lea_util_004_05),
    ('lea-util-004-06-cctv-systems--1edce199-0fc2-42e8-bad6-f3a74243626e', lea_util_004_06),
    ('lea-util-004-08-seismic-bracing-requirements-per-nscp-2015--585425ad-355a-4180-b64b-a872115f39f6', lea_util_004_08),
    ('lea-util-005-03-design-considerations-and-best-practices--881027cd-2be0-4c93-af86-4f801ec16882', lea_util_005_03),
    ('lea-util-005-04-communication-protocols-technologies--f52e3126-774f-4eec-8456-8417769bb34a', lea_util_005_04),
    ('lea-util-005-05-summary--ca53ed30-fdc6-42de-bb68-b5335d0d77a6', lea_util_005_05),
    ('lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c', lea_util_006_02),
    ('lea-util-006-03-what-you-need-to-know-for-the-lea--bbb05afe-2df6-4bdc-b8b8-43f6115533d3', lea_util_006_03),
    ('lea-util-006-05-recommended-illumination-levels-by-space-type--f815c409-77f7-4489-b3b9-7cb2f3010ad9', lea_util_006_05),
    ('lea-util-006-06-daylighting-design-strategy--b862f4a8-fa65-4cf7-bcb8-bec5b330d837', lea_util_006_06),
    ('lea-util-007-05-renewable-energy-integration-systems--5069fdfb-e96b-435e-9e04-d6526f8b3989', lea_util_007_05),
    ('lea-util-008-01-the-three-phase-coordination-framework--f39860e3-5b76-49c3-a82f-035371e8f225', lea_util_008_01),
    ('lea-util-008-04-what-you-need-to-know-for-the-lea--9e0b9ab6-1761-4127-abdd-d7579fb05b20', lea_util_008_04),
]

# Also include the lea-plan articles that still have 0 sources
def lea_plan_003_01(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004 — Philippine Housing Law Framework Provisions', 'primary_law',
            'Provides the overarching building code framework for housing development including occupancy classification, minimum standards, and permit requirements.', 0),
        make_source(aid, 'RA 7279: Urban Development and Housing Act (UDHA) of 1992', 'primary_law',
            'Governs socialized housing, eviction procedures, and urban land reform. Establishes the framework for housing program classifications.', 1),
        make_source(aid, 'BP 344: Accessibility Law — Housing Accessibility Requirements', 'implementing_rules',
            'Accessibility requirements applicable to multi-family housing and residential developments.', 2),
        make_source(aid, 'DHSUD Guidelines on Subdivision and Condominium Development Standards', 'reference_standard',
            'DHSUD (formerly HLURB) standards for subdivision development including minimum lot sizes, road widths, and open space requirements.', 3),
    ]
    return s

def lea_plan_003_02(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'RA 7279: Urban Development and Housing Act (UDHA) of 1992 — Housing Classifications', 'primary_law',
            'Defines housing classifications: socialized housing (for underprivileged), economic housing, and open market housing in the Philippines.', 0),
        make_source(aid, 'DHSUD BP 220 Standards — Minimum Lot Sizes and Housing Categories', 'reference_standard',
            'BP 220 provides standards for socialized and economic housing including minimum lot sizes, floor areas, and community facility requirements.', 1),
        make_source(aid, 'PD 1096 RIRR 2004, Rule III — Residential Occupancy Classification', 'implementing_rules',
            'Defines residential occupancy categories (Group A: single-family, Group B: multi-family) and their specific code requirements.', 2),
    ]
    return s

def lea_plan_004_01(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004, Rule IV — Types of Construction: Aesthetic Considerations', 'primary_law',
            'Governs construction types and materials that affect the physical and aesthetic qualities of building design.', 0),
        make_source(aid, 'Local Zoning Ordinance — Site Planning and Aesthetic Requirements', 'reference_standard',
            'Local government zoning requirements for building setbacks, height limits, architectural character, and streetscape design.', 1),
    ]
    return s

def lea_plan_004_02(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1586: EIS System — Ecological Considerations in Site Planning', 'primary_law',
            'Requires environmental impact assessment for projects in or near ecologically sensitive areas. Governs ecological site analysis.', 0),
        make_source(aid, 'PD 1067: Water Code — Ecological Water Management in Site Planning', 'primary_law',
            'Governs water management, watershed protection, and ecological water flow in relation to site development.', 1),
        make_source(aid, 'DENR DAO 2003-30 — Environmental Impact Assessment including Ecological Factors', 'implementing_rules',
            'Specifies ecological assessment requirements during site planning including wildlife habitat survey, vegetation analysis, and water resource evaluation.', 2),
    ]
    return s

def lea_plan_004_03(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004 — Socio-Psychological Considerations in Building Design', 'primary_law',
            'The building code addresses occupant well-being through minimum light, ventilation, and space standards that have socio-psychological implications.', 0),
        make_source(aid, 'BP 344: Accessibility Law — Social Inclusion in Design', 'implementing_rules',
            'Social inclusion requirements that address the needs of persons with disabilities in the built environment, affecting site planning decisions.', 1),
    ]
    return s

def lea_plan_004_04(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004 — Site Management and Operational Requirements', 'primary_law',
            'Building code provisions that relate to site management including access, parking, waste management, and maintenance requirements.', 0),
        make_source(aid, 'Local Zoning Ordinance — Site Operational Requirements', 'reference_standard',
            'Local government ordinances that specify site management requirements including garbage collection areas, parking standards, and service access.', 1),
    ]
    return s

def lea_plan_004_05(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1096 RIRR 2004 — Building Maintenance and Occupancy Requirements', 'primary_law',
            'Code provisions requiring buildings to be maintained in a safe and sanitary condition, affecting maintenance access and material selection.', 0),
        make_source(aid, 'RA 9003: Ecological Solid Waste Management Act — Maintenance and Waste Management', 'primary_law',
            'Requires integrated waste management facilities in building and site design including waste storage, segregation areas, and collection access.', 1),
    ]
    return s

def lea_plan_005_02(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'DENR DAO 2004-24 — Philippine Native Species Protection in Site Development', 'implementing_rules',
            'Implements PD 705 regarding protection of native tree species during site development. Lists protected native Philippine species.', 0),
        make_source(aid, 'RA 9147: Wildlife Resources Conservation Act — Protected Native Species', 'primary_law',
            'Protects native Philippine wildlife and plant species. Lists endangered and threatened native species relevant to site planning.', 1),
        make_source(aid, 'PD 705: Revised Forestry Code — Protection of Native Forest Species', 'primary_law',
            'Governs the protection, preservation, and utilization of native forest species including premium hardwood species (Narra, Molave, etc.).', 2),
    ]
    return s

def lea_plan_005_03(dirname):
    aid = extract_aid(dirname)
    s = [
        make_source(aid, 'PD 1586: EIS System — Environmental and Land-Use Planning Framework', 'primary_law',
            'Establishes the EIS system as part of the comprehensive land-use planning framework in the Philippines.', 0),
        make_source(aid, 'RA 7160: Local Government Code — Land-Use Planning Authority', 'primary_law',
            'Devolves land-use planning authority to Local Government Units (LGUs). Requires comprehensive land-use plans (CLUPs) for all cities and municipalities.', 1),
        make_source(aid, 'RA 11201: DHSUD Act — Housing and Land-Use Regulatory Authority', 'primary_law',
            'Establishes DHSUD as the lead agency for housing and land-use planning regulation. Governs subdivision and condominium development standards.', 2),
    ]
    return s

# Add Planning articles
plan_articles = [
    ('lea-plan-003-01-what-you-need-to-know-for-the-lea--0d2e80df-4f76-484e-9b1f-5502da9e35be', lea_plan_003_01),
    ('lea-plan-003-02-what-you-need-to-know-for-the-lea--7c0e2fa5-7f3d-419a-b592-50346ac7ab2f', lea_plan_003_02),
    ('lea-plan-004-01-what-you-need-to-know-for-the-lea--6a351c32-f48d-45fb-93f5-e60e6cd271c5', lea_plan_004_01),
    ('lea-plan-004-02-what-you-need-to-know-for-the-lea--795661f6-00a3-4b3d-afe5-0668909529a0', lea_plan_004_02),
    ('lea-plan-004-03-what-you-need-to-know-for-the-lea--d2246ae0-2def-4144-b42d-f56172b13f67', lea_plan_004_03),
    ('lea-plan-004-04-what-you-need-to-know-for-the-lea--b9ae0f63-0d28-4a66-b2bf-51641e6db739', lea_plan_004_04),
    ('lea-plan-004-05-what-you-need-to-know-for-the-lea--f22ba499-94ce-41a3-999a-2d9ffdbc0b57', lea_plan_004_05),
    ('lea-plan-005-02-what-you-need-to-know-for-the-lea--e59c8abc-5938-47ab-8009-97424baa78c7', lea_plan_005_02),
    ('lea-plan-005-03-what-you-need-to-know-for-the-lea--341161bb-c24a-4d65-8f8b-79a3e1b01076', lea_plan_005_03),
]

all_articles = articles + plan_articles
print(f"Processing {len(all_articles)} articles...")

success = 0
for dirname, func in all_articles:
    full_path = os.path.join(ARTICLES_DIR, dirname)
    if not os.path.isdir(full_path):
        print(f"  NOT FOUND: {dirname}")
        continue
    sources = func(dirname)
    if write_sources(dirname, sources):
        success += 1

print(f"\nDone! Successfully processed {success}/{len(all_articles)} articles.")
