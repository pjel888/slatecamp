#!/usr/bin/env python3
"""
Batch add ## Learning Goal sections to articles missing them.
REVISED: Uses LEA prefix first for reliable matching, content matching for non-LEA articles.
"""

import json
import hashlib
import os
import re
import sys

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# ─── Learning objectives by LEA prefix ────────────────────────────────────

LEA_GOALS = {
    "lea-util": [
        "Identify building utility systems — plumbing, electrical, mechanical ventilation, fire protection, and vertical transportation — and their code requirements.",
        "Apply code provisions for utility system design: plumbing fixture counts, electrical load calculations, ventilation rates, and fire suppression coverage.",
        "Explain the architect's coordination role in integrating utility systems with architectural design — shaft sizing, ceiling plenum coordination, and equipment room placement."
    ],
    "lea-strc": [
        "Identify structural systems — moment frames, braced frames, shear walls, trusses, arches, and shells — and their load paths.",
        "Apply basic structural principles: load types (dead, live, wind, seismic), force distribution, and deflection criteria.",
        "Explain the role of the architect in structural design — coordinating with structural engineers, sizing preliminary members, and understanding structural behavior."
    ],
    "lea-matl": [
        "Identify the physical and mechanical properties of common construction materials — concrete, steel, wood, masonry, glass, and composites.",
        "Apply material selection criteria based on strength, durability, cost, sustainability, and code compliance.",
        "Explain proper material installation methods and the relationship between material properties and structural behavior."
    ],
    "lea-theo": [
        "Identify major architectural periods, styles, and movements tested on the ALE — from ancient through contemporary.",
        "Recognize key architectural works and their architects by period, location, and stylistic characteristics.",
        "Apply theoretical concepts — form, function, space, order, proportion — to design analysis and historical comparison questions."
    ],
    "lea-hist": [
        "Identify major architectural periods, styles, and movements from ancient through contemporary tested on the ALE.",
        "Recognize key architectural works and their architects by period, location, and stylistic characteristics.",
        "Apply historical and theoretical concepts to design analysis and exam comparison questions."
    ],
    "lea-plan": [
        "Identify site planning and urban design principles: zoning, land use, circulation, open space, and infrastructure coordination.",
        "Apply site analysis techniques: climate, topography, access, utilities, and regulatory constraints.",
        "Explain the relationship between site planning and building design — orientation, setbacks, parking, landscaping, and stormwater management."
    ],
    "lea-dsgn": [
        "Identify the phases of the design process — pre-design, schematic design, design development, and contract documents — and their deliverables.",
        "Apply design principles — proportion, scale, balance, rhythm, hierarchy — to architectural composition and space planning problems.",
        "Explain the integration of building systems, code compliance, and human factors into the design process."
    ],
    "lea-prac-law": [
        "Identify and explain key legal provisions under RA 9266 and related laws tested on the ALE.",
        "Apply statutory definitions, qualifications, and procedural rules to exam scenarios.",
        "Distinguish between the roles, powers, and liabilities of different actors in architectural practice."
    ],
    "lea-prac-ctr": [
        "Identify the key provisions of the standard owner-architect agreement — scope, phases, compensation, and termination.",
        "Apply fee computation methods and contract administration procedures to exam scenarios.",
        "Explain the rights, obligations, and remedies of parties in architectural contracts."
    ],
    "lea-prac-cmp": [
        "Identify the key provisions of the standard owner-architect agreement — scope, phases, compensation, and termination.",
        "Apply fee computation methods (percentage of PCC, MDPE, lump sum) to exam scenarios.",
        "Explain the rights, obligations, and remedies of parties in architectural contracts and compensation structures."
    ],
    "lea-prac-svc": [
        "Identify the six phases of architectural services and their deliverables under the SPP Doc 202 framework.",
        "Distinguish between basic services and additional services for fee computation and scope definition.",
        "Apply the correct service phase to given project scenarios and identify phase-specific deliverables."
    ],
    "lea-prac-frm": [
        "Identify the different practice frameworks available to architects — sole proprietorship, partnership, corporation, and joint venture.",
        "Explain the legal and procedural requirements for each practice framework under Philippine law.",
        "Apply practice framework selection criteria to given professional scenarios for exam questions."
    ],
    "lea-prac-eth": [
        "Identify the Code of Ethical Conduct provisions governing architect-client, architect-contractor, and architect-architect relationships.",
        "Apply ethical principles to practice scenarios — conflicts of interest, confidentiality, competence, and professional integrity.",
        "Explain the disciplinary process and sanctions for ethical violations under RA 9266."
    ],
}

# ─── Content-based patterns for non-LEA articles (technical/building code) ───

CONTENT_GOALS = {
    "accessible seating in assembly areas": [
        "Calculate the required number of accessible seating spaces for assembly occupancies under BP 344.",
        "Identify correct placement, sightlines, and companion seating requirements for accessible wheelchair locations.",
        "Apply dimensional standards for accessible seating — width, depth, armrest clearance, and adjacent companion space."
    ],
    "allowable floor area": [
        "Calculate maximum allowable floor area and permissible increases for different occupancy types under the National Building Code.",
        "Distinguish between FAR (Floor Area Ratio) limits, lot coverage, and the floor-area increase multipliers.",
        "Apply the NBCP provisions on allowable floor area increases based on open space, fire protection, and frontage."
    ],
    "american colonial era": [
        "Identify key characteristics of American Colonial architecture in the Philippines — neoclassical civic buildings, the City Beautiful movement, and Daniel Burnham's influence.",
        "Recognize Philippine American-period landmarks: the Manila Hotel, Legislative Building, and their architectural significance.",
        "Compare American Colonial architecture with Spanish Colonial and later Art Deco styles in the Philippine context."
    ],
    "bp-344 accessible washrooms": [
        "Apply BP 344 dimensional standards for accessible washrooms: clear floor space, grab bar placement, and toilet stall dimensions.",
        "Identify the minimum number of accessible water closets required per occupancy type under the Accessibility Law.",
        "Distinguish between ambulatory and wheelchair-accessible toilet stall configurations and their respective dimensional requirements."
    ],
    "bp-344 elevator dimensions": [
        "State the minimum elevator car dimensions required by BP 344 — door width, cab size, and control panel height.",
        "Identify the correct placement and height of elevator call buttons, handrails, and visual/auditory signals.",
        "Calculate the number of accessible elevators required based on building type, floor count, and occupancy load."
    ],
    "bp-344 ramp slope tiers": [
        "Apply the maximum slope ratios for ramps under BP 344: 1:12 (8.33%) for exterior, 1:10 (10%) for short rises.",
        "Calculate ramp run lengths given a known vertical rise and the applicable slope ratio.",
        "Identify handrail, landing, and guardrail requirements at ramp runs including extensions and intermediate landings."
    ],
    "bp-344 tactile and visual": [
        "Identify the requirements for tactile warning surfaces and visual/auditory alarm systems under BP 344.",
        "Apply standards for tactile ground surface indicators at ramps, stairs, and pedestrian crossings.",
        "Distinguish between visual strobe requirements, audible alarm characteristics, and installation locations per accessibility code."
    ],
    "conflict bp-344": [
        "Resolve conflicts between BP 344 (Accessibility Law) and PD 1096 using the principle that the stricter standard prevails.",
        "Identify specific dimensional conflicts — door widths, ramp slopes, toilet clearances — and which code governs each.",
        "Apply the correct code hierarchy: BP 344 minimums become NBCP minimums where BP 344 is more stringent."
    ],
    "brutalism": [
        "Identify the defining characteristics of Brutalist architecture: exposed concrete, geometric massing, monochromatic materiality, and sculptural form.",
        "Recognize key Brutalist architects — Le Corbusier, Paul Rudolph, Louis Kahn — and notable Philippine Brutalist examples.",
        "Explain Brutalism's philosophical position: the expression of materials and structure as authentic architectural truth."
    ],
    "building permit process": [
        "Trace the complete building permit application process under PD 1096: pre-application, document submission, plan review, and permit issuance.",
        "Identify the required documents for a building permit — architectural plans, structural calculations, specifications, and lot plan.",
        "Explain the roles of the Building Official, the plan review committee, and the applicant in the permit issuance timeline."
    ],
    "case study hospital mall school": [
        "Apply dimensional and code standards from the National Building Code to design briefs for schools, hospitals, and malls.",
        "Calculate required exiting capacity, toilet fixtures, parking spaces, and accessible features for each building typology.",
        "Identify typology-specific requirements — hospital emergency department access, classroom acoustics, and mall circulation and fire zone separation."
    ],
    "ceiling heights and room sizes": [
        "State the minimum ceiling heights for different room types under PD 1096: habitable rooms, mezzanines, bathrooms, and corridors.",
        "Apply the dimensional exceptions for air-conditioned spaces, attic spaces, and mezzanines where reduced ceiling heights are permitted.",
        "Calculate habitable room adequacy using ceiling height in combination with minimum window area and volume requirements."
    ],
    "certificate of occupancy": [
        "Explain the purpose, required documents, and process for obtaining a Certificate of Occupancy under PD 1096, Section 301.",
        "Distinguish between a Building Permit (authorization to construct) and a Certificate of Occupancy (authorization to use).",
        "Identify the consequences of occupying without a Certificate of Occupancy and conditions for a Temporary CO."
    ],
    "change of use and occupancy": [
        "Define 'change of use' and 'change of occupancy' under the National Building Code and when a new permit is required.",
        "Apply the higher-of-the-two rule: when use changes, the more stringent code requirements govern.",
        "Identify when a Certificate of Occupancy amendment is required and the structural/accessibility upgrades triggered by reclassification."
    ],
    "chimneys and fireplaces": [
        "Identify minimum clearance, flue sizing, and spark arrestor requirements for chimneys and fireplaces under the building and fire codes.",
        "Apply clearance-to-combustibles standards for fireplaces: hearth extension depth, wall clearances, and chimney separation from wood framing.",
        "Calculate required flue cross-sectional area relative to fireplace opening dimensions per NBCP and NFPA standards."
    ],
    "colonial european": [
        "Identify major European colonial architectural influences in the Philippines: Spanish Baroque, Renaissance, and Neoclassical.",
        "Recognize Philippine colonial landmarks — San Agustin Church, Intramuros, and provincial Baroque churches.",
        "Compare colonial-era characteristics across Spanish, American, and indigenous vernacular influences."
    ],
    "commercial clearances": [
        "Apply minimum commercial clearance standards for circulation paths, aisle widths, and egress routes in retail and commercial occupancies.",
        "Calculate required clear widths for checkout lanes, display corridors, and service counters per code and accessibility standards.",
        "Identify the BP 344 clear-width requirements for commercial spaces: 36-inch accessible route, 48-inch corridors, and 60-inch passing spaces."
    ],
    "comprehensive signage package": [
        "Identify the components of a comprehensive signage package: directional, informational, identification, and regulatory signs.",
        "Apply standards for signage visibility, letter height-to-distance ratio, color contrast, and pictogram requirements.",
        "Explain the architect's role in coordinating signage design with wayfinding strategy, brand identity, and code compliance."
    ],
    "conflict matrix stairs guards": [
        "Identify dimensional conflicts between PD 1096, BP 344, and the Fire Code for stairs, guards, and elevator hoistways.",
        "Apply the correct dimensional standards when multiple codes prescribe different values — stricter standard governs.",
        "Calculate stair riser/tread combinations, guard height requirements, and elevator pit clearances where code provisions overlap."
    ],
    "dangerous and ruinous buildings": [
        "Define dangerous and ruinous buildings under PD 1096 and identify the Building Official's authority to order demolition or repair.",
        "Explain the notice, hearing, and appeal process before a building can be declared dangerous.",
        "Identify the architect's professional obligations when assessing a potentially dangerous building."
    ],
    "electrical and mechanical regulations": [
        "Apply minimum electrical code requirements for architectural design: receptacle spacing, circuit loading, and panel locations.",
        "Identify mechanical code ventilation rates for different occupancy types under the NBCP.",
        "Coordinate architectural plans with electrical and mechanical requirements — ceiling plenum space, equipment access, and shaft locations."
    ],
    "ergonomics in furniture design": [
        "Apply anthropometric data to furniture design: seat height, depth, armrest height, and backrest angle.",
        "Calculate minimum clearances for workstation design: desk area, leg clearance, reach zones, and display ergonomics.",
        "Identify ergonomic standards from ANSI/HFES 100 and Philippine references for accessible and universal furniture design."
    ],
    "exam-meta deck heights": [
        "Calculate deck-to-deck heights and floor-to-floor heights from given section data for exam problems.",
        "Identify the relationship between finished floor elevation, structural depth, ceiling height, and plenum space.",
        "Apply dimensional standards for minimum habitable room height measured from finished floor to finished ceiling."
    ],
    "excavation foundation veneer": [
        "Identify foundation system types — shallow, deep, mat, pile — and their appropriate applications based on soil conditions.",
        "Apply excavation safety requirements: shoring, sloping, and protective systems per construction safety standards.",
        "Explain masonry veneer attachment requirements: tie spacing, cavity width, flashing, and weep hole placement."
    ],
    "fire extinguishing systems": [
        "Identify occupations requiring automatic fire sprinkler systems under RA 9514 (Fire Code of the Philippines).",
        "Apply sprinkler head spacing, temperature rating, and coverage area requirements for different hazard classifications.",
        "Explain coordination between architectural ceiling design and sprinkler system layout — head placement, obstructions, and concealment."
    ],
    "fire resistive construction": [
        "Identify fire-resistive ratings required for structural elements based on building type, height, and occupancy.",
        "Apply the correct fire-resistive construction classification (Types I through V) under PD 1096.",
        "Calculate required fire-resistive protection for structural members — columns, beams, floor/roof assemblies."
    ],
    "fire zones and existing buildings": [
        "Define fire zones under PD 1096 and identify permitted construction types within each zone.",
        "Apply stricter fire-resistive requirements when constructing adjacent to property lines and within higher fire zones.",
        "Identify when existing building non-conformities may be grandfathered versus requiring upgrades."
    ],
    "fixtures and small items": [
        "Identify requirements for fixtures in common areas: drinking fountains, telephones, mailboxes, and directory boards.",
        "Apply accessible-height and clear-floor-space standards for fixtures in public corridors and lobbies.",
        "Calculate minimum number of fixtures required based on occupancy load for common areas."
    ],
    "flora and fauna": [
        "Identify the role of flora and fauna in site planning: preservation of existing vegetation, habitat conservation, and ecological mitigation.",
        "Apply site analysis techniques for assessing existing trees, drainage patterns, and wildlife corridors.",
        "Explain how to protect significant vegetation during construction — tree protection zones, root-zone preservation, and replanting."
    ],
    "glass and glazing": [
        "Calculate maximum allowable glazing area as a percentage of wall area per occupancy type under the NBC.",
        "Apply safety glazing requirements in hazardous locations — doors, sidelights, shower enclosures.",
        "Identify exceptions to glazing area limits and alternative compliance through engineered glass systems."
    ],
    "hydrology in site": [
        "Apply hydrologic principles to site planning: watershed delineation, runoff calculations, and stormwater management.",
        "Calculate peak runoff using the Rational Method formula (Q = CiA) for site drainage design.",
        "Identify site planning strategies for flood mitigation: retention basins, permeable pavement, bioswales, and building elevation."
    ],
    "inca architecture ashlar": [
        "Identify characteristics of Inca architecture: ashlar masonry, trapezoidal openings, and cyclopean stonework.",
        "Recognize Inca architectural achievements — Machu Picchu, Sacsayhuamán — and their construction techniques.",
        "Explain the engineering principles behind Inca dry-stone masonry: precise fitting, earthquake resistance, and batter wall design."
    ],
    "institutional human dimensions": [
        "Apply human dimension standards to institutional building design: clearances in corridors, door widths, and vertical circulation.",
        "Calculate required egress width based on occupant load for institutional occupancies.",
        "Identify special dimensional requirements for institutional furniture and equipment."
    ],
    "law-qa deck": [
        "Identify key provisions of RA 7277 (Magna Carta for Disabled Persons), RA 9442, and RA 10754.",
        "Apply accessibility requirements and privileges granted to persons with disabilities — parking, discounts, and priority lanes.",
        "Explain the architect's legal obligation to incorporate universal design features as mandated by these laws."
    ],
    "lathing and plastering": [
        "Identify lathing systems — metal lath, gypsum lath, wire mesh — and their applications for plaster finishes.",
        "Apply proper installation standards: lath spacing, fastening, corner beads, control joints, and coat thickness.",
        "Explain moisture and vapor barrier requirements behind lath and plaster in exterior and wet-area applications."
    ],
    "le corbusier five": [
        "Identify Le Corbusier's Five Points of Architecture: pilotis, roof garden, free plan, horizontal window, free facade.",
        "Recognize Le Corbusier's major works — Villa Savoye, Unité d'Habitation, Ronchamp — and their characteristics.",
        "Explain how the Five Points influenced Modernist architecture and their adaptation in tropical design."
    ],
    "location on property and exterior walls": [
        "Apply setback and yard requirements under PD 1096 based on building height, occupancy type, and fire zone.",
        "Calculate minimum distance from property lines to exterior walls for light and ventilation access.",
        "Identify fire-resistive construction and opening protection requirements for exterior walls at varying property-line distances."
    ],
    "mies van der rohe": [
        "Identify Mies van der Rohe's architectural philosophy: 'less is more,' universal space, and honest expression of materials.",
        "Recognize Mies's major works — Barcelona Pavilion, Farnsworth House, and Seagram Building.",
        "Explain Mies's influence on corporate architecture, the International Style, and curtain-wall construction systems."
    ],
    "masters of the golden age": [
        "Identify works of High Renaissance masters: Bramante, Michelangelo, Raphael, and Palladio.",
        "Recognize 16th-century achievements: St. Peter's Basilica, Villa Rotonda, and Palazzo del Te.",
        "Explain how classical orders and proportion systems shaped Renaissance architectural theory."
    ],
    "north american indigenous": [
        "Identify architectural traditions of North American Indigenous peoples: pueblos, plank houses, longhouses, and tipis.",
        "Recognize how climate, materials, and culture shaped distinct indigenous building forms across regions.",
        "Explain the cosmological and ceremonial significance of indigenous architectural forms."
    ],
    "penthouses and roof structures": [
        "Apply NBCP dimensional and area limitations for penthouses: maximum floor area, setbacks, and height restrictions.",
        "Identify roof structures exempt from height and FAR calculations — elevator overruns, stair bulkheads, water tanks.",
        "Calculate allowable penthouse area as a percentage of roof floor area."
    ],
    "post-modernism": [
        "Identify defining characteristics of Postmodern architecture: historical reference, ornament, color, irony, and contextualism.",
        "Recognize Postmodern architects — Robert Venturi, Michael Graves, Charles Moore — and their major works.",
        "Explain Postmodernism's critique of Modernist orthodoxy and its influence on architectural theory."
    ],
    "pre-colonial vernacular": [
        "Identify Philippine pre-colonial vernacular architecture: bahay kubo, torogan, bale, and regional variations.",
        "Explain how indigenous forms respond to climate — elevated floor, steep roof, wide eaves, permeable walls.",
        "Recognize cultural dimensions of vernacular architecture: spatial hierarchy, community building, and material sourcing."
    ],
    "pre-columbian mesoamerica": [
        "Identify architectural achievements of Pre-Columbian Mesoamerica: Maya pyramids, Aztec temples, and Teotihuacán.",
        "Recognize urban planning principles — astronomical alignment, plaza-and-platform organization, talud-tablero construction.",
        "Explain architectural symbolism: temple-pyramids as cosmic mountains, cenotes as underworld entrances."
    ],
    "public service counters and atms": [
        "Apply accessible design standards for public service counters and ATMs: counter height, knee clearance, and reach range.",
        "Identify BP 344 requirements for service counters — a portion must be accessible to wheelchair users.",
        "Calculate required number of accessible transaction stations based on total teller positions or ATM machines."
    ],
    "signs design and construction": [
        "Apply NBCP sign regulations: area limitations, height restrictions, projection limits, and structural requirements.",
        "Identify permit requirements for different sign types — wall, projecting, roof, and ground signs.",
        "Calculate maximum sign area based on building frontage and apply wind load requirements for sign structures."
    ],
    "stages and platforms": [
        "Identify dimensional standards for stages and performance spaces: stage depth, wing space, fly loft height.",
        "Apply exiting requirements for performance spaces: seating row spacing, aisle width, and egress from stage areas.",
        "Calculate stage dimensions based on occupancy type and performance requirements under the NBCP."
    ],
    "standard human body dimensions": [
        "Identify standard anthropometric measurements for architectural design: eye height, reach zones, and seated dimensions.",
        "Apply the 5th-to-95th percentile principle for accommodating the widest range of users.",
        "Calculate minimum clearances for circulation, workstations, and fixtures based on human body data."
    ],
    "topography and slope": [
        "Apply topographic analysis to site planning: contour interpretation, slope calculation, and landform classification.",
        "Calculate slope percentages from contour maps and identify appropriate land uses for different slopes.",
        "Explain how slope analysis informs building placement, road alignment, drainage, and cut/fill calculations."
    ],
    "typology checklists and plan checking": [
        "Apply typology-specific plan checking checklists to ensure code compliance for different building types.",
        "Identify critical code review items for each occupancy — residential, commercial, institutional, and assembly.",
        "Explain the architect's role in self-review before submission and responding to plan reviewer comments."
    ],
    "vertical openings": [
        "Identify fire-resistive protection requirements for vertical openings — stair enclosures, elevator shafts, and chases under PD 1096.",
        "Apply correct floor and roof construction types and their minimum fire-resistive ratings.",
        "Calculate required fire-resistive rating for floor/roof assemblies based on building height and occupancy."
    ],
    "wheelchair maneuvering": [
        "Identify minimum dimensions for accessible parking slots under BP 344: width, access aisle, slope, and signage.",
        "Calculate required number of accessible parking spaces based on total parking capacity.",
        "Apply dimensional standards for wheelchair maneuvering: 180-degree turning space, approach width, and T-turn dimensions."
    ],
    "21st century movements": [
        "Identify key 21st-century movements: parametricism, digital fabrication, sustainable design, and adaptive reuse.",
        "Recognize contemporary architects — Zaha Hadid, Norman Foster, Shigeru Ban, Bjarke Ingels — and their approaches.",
        "Explain how BIM, parametric modeling, and computational design have transformed architectural practice."
    ],
    "widths slopes": [
        "Apply minimum width requirements for corridors, aisles, ramps, and stairways under the National Building Code.",
        "Calculate minimum egress width based on occupant load using the capacity factor method.",
        "Identify maximum slope requirements for accessible routes, driveways, and pedestrian walkways."
    ],
    "african vernacular earth": [
        "Identify African earth-building traditions: adobe, rammed earth, wattle-and-daub, and compressed earth block.",
        "Explain how earth architecture provides passive thermal performance in hot-arid and tropical regions.",
        "Recognize major African vernacular types: Dogon cliff dwellings, Sudano-Sahelian mosques, and Zulu beehive huts."
    ],
}

# Order matters for content matching — more specific patterns first
CONTENT_KEYS = sorted(CONTENT_GOALS.keys(), key=lambda k: -len(k))


def sha256_file(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return None


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def get_lea_id(dirname):
    """Extract LEA ID from directory name like lea-util-004-06-cctv-systems."""
    slug = dirname.split('--')[0]
    # Try to match major LEA prefixes
    for prefix in sorted(LEA_GOALS.keys(), key=lambda k: -len(k)):
        if slug.startswith(prefix):
            return prefix
    return None


def match_content_goals(normalized):
    """Match non-LEA article content to the best topic pattern."""
    text = normalized.lower()[:2000]  # First ~2000 chars
    
    for key in CONTENT_KEYS:
        pattern_lower = key.lower()
        # Count how many significant words from the pattern appear in the text
        words = pattern_lower.split()
        matches = sum(1 for w in words if len(w) > 3 and w in text)
        # Full phrase match is strong signal
        if pattern_lower in text:
            return CONTENT_GOALS[key]
        # If 80%+ of significant words match, use it
        if len(words) > 1 and matches >= max(2, int(len(words) * 0.7)):
            return CONTENT_GOALS[key]
    
    return None


def extract_title(normalized):
    """Extract the title (first heading line)."""
    for line in normalized.split('\n'):
        line_stripped = line.strip()
        if line_stripped.startswith('## ') and 'Learning Goal' not in line_stripped:
            return line_stripped.replace('## ', '', 1).strip()
    return "Untitled"


def process_article(dirname):
    """Process a single article directory."""
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_blocks_path = os.path.join(article_dir, "ui-blocks.json")
    
    normalized = read_file(norm_path)
    if normalized is None:
        return False, "normalized.md not found"
    
    # Check if Learning Goal already exists
    if re.search(r'^## Learning Goal', normalized, re.MULTILINE):
        return False, "already has ## Learning Goal"
    if re.search(r'^### Learning Goal', normalized, re.MULTILINE):
        return False, "already has ### Learning Goal"
    
    title = extract_title(normalized)
    
    # Match learning objectives: first try LEA prefix, then content matching
    lea_id = get_lea_id(dirname)
    if lea_id:
        objectives = LEA_GOALS[lea_id]
        match_source = f"LEA prefix: {lea_id}"
    else:
        objectives = match_content_goals(normalized)
        if objectives:
            match_source = "content match"
        else:
            # Ultimate fallback: generic
            objectives = [
                "Identify the key concepts, standards, and code provisions relevant to this topic for the ALE.",
                "Apply dimensional standards and regulatory requirements to exam calculation and scenario problems.",
                "Explain the practical application of these standards in architectural design and practice."
            ]
            match_source = "generic fallback"
    
    # Build the Learning Goal section
    goal_lines = ["## Learning Goal", ""]
    goal_lines.append("After reading this article, you should be able to:")
    goal_lines.append("")
    for obj in objectives:
        goal_lines.append(f"- {obj}")
    goal_lines.append("")
    
    goal_text = "\n".join(goal_lines)
    
    # Find insertion point: after the first ## title
    lines = normalized.split('\n')
    
    # Find the first ## heading (the title)
    insert_pos = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('## ') and 'Learning Goal' not in stripped:
            insert_pos = i + 1
            break
    
    # Build new content: title + Learning Goal + separator + rest
    new_lines = lines[:insert_pos] + [''] + goal_text.split('\n') + [''] + ['---'] + [''] + lines[insert_pos:]
    new_normalized = '\n'.join(new_lines)
    
    # Read ui-blocks.json
    ui_blocks_raw = read_file(ui_blocks_path)
    if ui_blocks_raw is None:
        article_id = dirname.split('--')[-1] if '--' in dirname else dirname
        ui_blocks = {
            "article_id": article_id,
            "slug": dirname.split('--')[0],
            "normalized_created_at": "2026-05-01T13:33:44.000Z",
            "parser_version": "ui-block-parser-v1",
            "original_content_hash": f"sha256:{sha256_file(new_normalized)}",
            "normalized_content_hash": f"sha256:{sha256_file(new_normalized)}",
            "ui_block_count": 0,
            "total_blocks": 0,
            "blocks": [],
            "unknown_blocks": [],
            "unresolved_critical_blocks": [],
            "ui_blocks_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
    else:
        ui_blocks = json.loads(ui_blocks_raw)
    
    # Update hash
    new_hash = sha256_file(new_normalized)
    ui_blocks["normalized_content_hash"] = f"sha256:{new_hash}"
    
    # Recalculate ui_blocks_hash from blocks
    blocks_json = json.dumps(ui_blocks.get("blocks", []), sort_keys=True)
    ui_blocks["ui_blocks_hash"] = f"sha256:{hashlib.sha256(blocks_json.encode()).hexdigest()}"
    
    # Write files
    write_file(norm_path, new_normalized)
    write_file(ui_blocks_path, json.dumps(ui_blocks, indent=2) + "\n")
    
    return True, f"[{match_source}] {title[:60]}"


def main():
    articles = sorted([d for d in os.listdir(BASE) 
                       if os.path.isdir(os.path.join(BASE, d)) 
                       and not d.startswith('.')])
    
    print(f"Scanning {len(articles)} article directories...")
    
    # Identify which need Learning Goals
    needs_goal = []
    for dirname in articles:
        norm_path = os.path.join(BASE, dirname, "normalized.md")
        if not os.path.exists(norm_path):
            continue
        content = read_file(norm_path)
        if content is None:
            continue
        if re.search(r'^## Learning Goal', content, re.MULTILINE):
            continue
        if re.search(r'^### Learning Goal', content, re.MULTILINE):
            continue
        needs_goal.append(dirname)
    
    print(f"Found {len(needs_goal)} articles missing Learning Goal")
    
    target = 40
    if len(sys.argv) > 1:
        target = int(sys.argv[1])
    
    count = 0
    error_count = 0
    
    for dirname in needs_goal:
        if count >= target:
            break
        
        success, message = process_article(dirname)
        if success:
            count += 1
            print(f"  [{count}/{target}] {message}")
        else:
            error_count += 1
            if error_count <= 5:
                print(f"  SKIP: {dirname[:60]} — {message}")
    
    print(f"\n{'='*60}")
    print(f"COMPLETE: Added Learning Goals to {count} articles")
    if error_count:
        print(f"Skipped: {error_count}")


if __name__ == "__main__":
    main()
