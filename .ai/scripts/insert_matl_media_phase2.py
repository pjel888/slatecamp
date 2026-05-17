#!/usr/bin/env python3
"""
Phase 2: Fix second insertions for lea-matl-* articles.
Uses corrected markers based on actual article content.
"""
import os
import re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# Corrected second insertions - using section headings that actually exist
SECOND_INSERTIONS = {
    # === Wood ===
    "lea-matl-001-04-core-concept": {
        "after": "## Wood Drying Methods",
        "id": "media-wood-drying-chart",
        "alt": "Comparison of kiln drying and air drying methods showing moisture content reduction, duration, and wood quality outcomes",
        "caption": "Future chart: wood drying methods comparison — kiln drying vs. air drying",
        "suggestedAsset": "Comparison table or process diagram for wood drying methods",
        "placementIntent": "Helps learners understand wood moisture management and its effect on preservation"
    },
    "lea-matl-001-05-core-concept": {
        "after": "## Philippine Lumber Standards and Grading Groups",
        "id": "media-ph-timber-species-chart",
        "alt": "Reference chart of Philippine timber species: narra, molave, yakal, apitong, mahogany, ipil with strength group, density, and common architectural applications",
        "caption": "Future chart: Philippine timber species by strength group, density, and application",
        "suggestedAsset": "Material property comparison table with species identification photos",
        "placementIntent": "Provides reference for selecting Philippine timber species for construction"
    },

    # === Masonry ===
    "lea-matl-002-04-core-concept": {
        "after": "## Stone Types and Properties",
        "id": "media-stone-property-chart",
        "alt": "Comparison chart of natural stone properties: granite, marble, limestone, sandstone, slate with compressive strength, porosity, hardness, and architectural applications",
        "caption": "Future chart: natural stone property comparison — strength, porosity, and applications",
        "suggestedAsset": "Material property comparison chart with application photos",
        "placementIntent": "Helps learners select stone types by physical properties"
    },
    "lea-matl-002-05-core-concept": {
        "after": "## Curing Methods: Moist Curing (Moisture Retention)",
        "id": "media-cement-curing-methods",
        "alt": "Comparison diagram of concrete curing methods: ponding, sprinkling, wet coverings, membrane compounds, and steam curing with effectiveness and application",
        "caption": "Future diagram: concrete curing methods comparison — effectiveness and application",
        "suggestedAsset": "Process illustration or comparison chart of curing methods",
        "placementIntent": "Visualizes proper curing techniques for concrete strength development"
    },
    "lea-matl-002-06-core-concept": {
        "after": "## ASTM C494 Chemical Admixtures for Concrete",
        "id": "media-admixture-application-chart",
        "alt": "Application matrix for concrete admixtures showing which admixture types are suitable for different concrete conditions: hot weather, cold weather, high strength, underwater, and pumped concrete",
        "caption": "Future chart: concrete admixture application matrix by project conditions",
        "suggestedAsset": "Selection matrix or decision chart for admixture specification",
        "placementIntent": "Guides selection of admixtures based on concrete placement conditions"
    },

    # === Metals & Glass ===
    "lea-matl-003-04-core-concept": {
        "after": "## Galvanic Corrosion",
        "id": "media-galvanic-series-chart",
        "alt": "Galvanic series chart ranking metals from anodic to cathodic with examples of compatible and incompatible metal pairs for construction",
        "caption": "Future chart: galvanic series — metal compatibility for architectural assemblies",
        "suggestedAsset": "Galvanic series infographic or compatibility table",
        "placementIntent": "Helps learners prevent galvanic corrosion when specifying dissimilar metals"
    },
    "lea-matl-003-05-core-concept": {
        "after": "## Key Provisions",
        "id": "media-glass-manufacturing-process",
        "alt": "Process flow diagram showing float glass manufacturing from raw materials through melting, forming, annealing, cutting, and processing into tempered, laminated, and insulated glass",
        "caption": "Future diagram: glass manufacturing process — float glass production and secondary processing",
        "suggestedAsset": "Process flow diagram of glass manufacturing and fabrication",
        "placementIntent": "Visualizes how different glass types are manufactured from base float glass"
    },

    # === Construction Systems ===
    "lea-matl-004-07-core-concept": {
        "after": "### Connection Types",
        "id": "media-steel-connection-types",
        "alt": "Detail drawings of bolted and welded steel connections: shear connections, moment connections, and braced frame connections with gusset plates",
        "caption": "Future diagram: steel connection types — shear, moment, and braced frame connections",
        "suggestedAsset": "Cross-section and isometric detail drawings of steel connections",
        "placementIntent": "Shows different steel connection configurations in building frames"
    },
    "lea-matl-004-08-core-concept": {
        "after": "### Pre-Construction Phase",
        "id": "media-formwork-design-diagram",
        "alt": "Cross-section of formwork design showing form facing, studs, wales, ties, and bracing with lateral pressure distribution arrows",
        "caption": "Future diagram: formwork design cross-section — facing, studs, wales, ties, and bracing",
        "suggestedAsset": "Cross-section detail of formwork assembly with pressure distribution",
        "placementIntent": "Visualizes formwork component design and lateral pressure management"
    },
    "lea-matl-004-09-core-concept": {
        "after": "### Earthmoving Equipment",
        "id": "media-equipment-application-chart",
        "alt": "Comparison chart of construction equipment types with excavation volume, lifting capacity, reach, and site application suitability",
        "caption": "Future chart: construction equipment comparison — capacity, reach, and site application",
        "suggestedAsset": "Equipment selection matrix or comparison infographic",
        "placementIntent": "Helps learners match equipment types to construction tasks"
    },
    "lea-matl-004-10-core-concept": {
        "after": "### Prefabrication and Modular Construction",
        "id": "media-prefabrication-comparison",
        "alt": "Comparison diagram of prefabrication, modular construction, 3D printing, ICF, and SIPs showing construction speed, quality, and cost factors",
        "caption": "Future chart: modern construction methods comparison — prefabrication, modular, 3D printing, ICF, SIPs",
        "suggestedAsset": "Comparison matrix of alternative construction methods",
        "placementIntent": "Helps learners compare modern construction methods for appropriate selection"
    },

    # === Sustainability ===
    "lea-matl-005-05-core-concept": {
        "after": "### Stripping Time (ACI 347)",
        "id": "media-stripping-time-table",
        "alt": "Reference table showing minimum formwork stripping times for slabs, beams, walls, and columns per NSCP 2015 with temperature adjustment factors",
        "caption": "Future table: formwork stripping time requirements — NSCP 2015 minimums by member type",
        "suggestedAsset": "Reference table or chart of stripping times and strength requirements",
        "placementIntent": "Provides quick reference for formwork stripping timing"
    },
    "lea-matl-005-07-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-embodied-carbon-strategies",
        "alt": "Infographic showing strategies to reduce embodied carbon: material substitution, low-carbon alternatives, recycled content, local sourcing, and design optimization",
        "caption": "Future infographic: embodied carbon reduction strategies for building materials",
        "suggestedAsset": "Comparative infographic of carbon reduction strategies",
        "placementIntent": "Visualizes practical strategies for reducing building carbon footprint"
    },
    "lea-matl-005-08-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-vernacular-design-principles",
        "alt": "Cross-section diagrams of vernacular building assemblies using bamboo, nipa, cogon, rattan, adobe, and stabilized earth blocks",
        "caption": "Future diagram: vernacular building assembly details — bamboo, nipa, adobe, and earth block",
        "suggestedAsset": "Cross-section and elevation drawings of traditional construction",
        "placementIntent": "Shows how traditional Philippine materials are assembled into building systems"
    },
    "lea-matl-005-09-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-lca-certification-flow",
        "alt": "Flowchart showing how LCA results inform BERDE, LEED, and EDGE certification credits across material selection, energy, and waste categories",
        "caption": "Future diagram: LCA to green certification — BERDE, LEED, and EDGE credit pathways",
        "suggestedAsset": "Process flow diagram of LCA data into certification systems",
        "placementIntent": "Connects LCA methodology to practical green building certification"
    },
    "lea-matl-005-10-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-green-material-selection",
        "alt": "Decision diagram for selecting green materials based on VOC limits, recycled content, regional sourcing, and certified wood requirements under BERDE and LEED",
        "caption": "Future diagram: green material selection criteria — VOC, recycled content, regional sourcing, certified wood",
        "suggestedAsset": "Decision flowchart for green building material specification",
        "placementIntent": "Guides material selection for green building certification compliance"
    },

    # === Roofing ===
    "lea-matl-006-01-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-roof-slope-comparison",
        "alt": "Comparison diagram showing roof slope requirements for different roofing materials: GI sheets, clay tiles, concrete tiles, asphalt shingles, standing seam, and green roofs",
        "caption": "Future chart: roof slope requirements by roofing material type",
        "suggestedAsset": "Comparison diagram or chart of minimum slopes per material",
        "placementIntent": "Helps learners match roofing materials to roof slope requirements"
    },
    "lea-matl-006-02-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-roof-ventilation-diagram",
        "alt": "Cross-section of roof assembly showing ventilation paths: soffit intake vents, ridge vents, and turbine vents with air flow arrows",
        "caption": "Future diagram: roof ventilation — soffit intake, ridge vent, and turbine vent air flow",
        "suggestedAsset": "Cross-section diagram of roof ventilation system",
        "placementIntent": "Shows proper roof ventilation design for tropical climate"
    },

    # === Waterproofing & Insulation ===
    "lea-matl-006-03-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-waterproofing-application-detail",
        "alt": "Cross-section details of waterproofing application at below-grade walls, wet areas, and roof decks showing membrane placement and flashing",
        "caption": "Future diagram: waterproofing application details — below-grade, wet area, and roof deck",
        "suggestedAsset": "Cross-section detail drawings of waterproofing installations",
        "placementIntent": "Visualizes critical waterproofing details in different building locations"
    },
    "lea-matl-006-04-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-insulation-placement-diagram",
        "alt": "Cross-section of building envelope showing insulation placement: roof, walls, and floor with R-value labels and thermal bridge identification",
        "caption": "Future diagram: insulation placement in building envelope — R-values and thermal bridge avoidance",
        "suggestedAsset": "Building section diagram with insulation placement callouts",
        "placementIntent": "Shows where insulation is placed in the building envelope"
    },
    "lea-matl-006-05-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-sealant-application-detail",
        "alt": "Cross-section detail of sealant joint design: backer rod, bond breaker tape, sealant shape factor, tooling, and proper joint dimensions",
        "caption": "Future diagram: sealant joint design — backer rod, bond breaker, shape factor, and tooling",
        "suggestedAsset": "Cross-section detail drawings of proper sealant joints",
        "placementIntent": "Shows correct sealant application for movement joints"
    },

    # === Finishes ===
    "lea-matl-007-01-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-flooring-installation-diagram",
        "alt": "Cross-section of different floor finish installations: tile on mortar bed, hardwood on joists, vinyl on slab, and polished concrete",
        "caption": "Future diagram: floor finish installation cross-sections — tile, hardwood, vinyl, concrete",
        "suggestedAsset": "Cross-section detail drawings of floor finish assemblies",
        "placementIntent": "Visualizes proper floor finish installation methods"
    },
    "lea-matl-007-02-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-wall-finish-assembly",
        "alt": "Cross-section of wall finish assemblies: paint on gypsum board, tile on cement board, stone cladding with anchors, and metal panel with sub-girt system",
        "caption": "Future diagram: wall finish assembly cross-sections — paint, tile, stone, and metal panel",
        "suggestedAsset": "Cross-section detail drawings of wall finish installations",
        "placementIntent": "Visualizes installation methods for different wall finishes"
    },
    "lea-matl-007-03-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-ceiling-system-comparison",
        "alt": "Comparison of ceiling systems: suspended acoustic tile, gypsum board on furring, metal pan, open plenum, and wood strip with system components",
        "caption": "Future diagram: ceiling system comparison — suspended, gypsum, metal pan, open plenum, wood strip",
        "suggestedAsset": "Cross-section comparison of ceiling system types",
        "placementIntent": "Helps learners select ceiling systems by performance requirements"
    },
    "lea-matl-007-04-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-paint-system-layers",
        "alt": "Cross-section showing paint system layers: primer, intermediate coat, and finish coat on wood, metal, masonry, and gypsum substrates",
        "caption": "Future diagram: paint system layers by substrate — wood, metal, masonry, and gypsum",
        "suggestedAsset": "Cross-section detail of coating build-up on each substrate type",
        "placementIntent": "Visualizes proper paint system specification for different substrates"
    },
    "lea-matl-007-05-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-finish-schedule-template",
        "alt": "Template of a finish schedule showing room-by-room entries for floor, wall, ceiling, and base finishes with material codes and installation notes",
        "caption": "Future diagram: finish schedule template — room-by-room material specification",
        "suggestedAsset": "Template or example finish schedule document",
        "placementIntent": "Provides practical template for finish schedule creation"
    },
    "lea-matl-007-06-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-countertop-selection-matrix",
        "alt": "Selection matrix for countertop materials: granite, marble, quartz, solid surface, laminate, stainless steel, concrete, wood, and tile with rating icons for durability, stain resistance, heat resistance, and maintenance",
        "caption": "Future chart: countertop material selection matrix — durability, stain, heat, and maintenance ratings",
        "suggestedAsset": "Decision matrix or comparison chart for countertop selection",
        "placementIntent": "Helps learners select countertop materials by application requirements"
    },

    # === Fasteners & Hardware ===
    "lea-matl-008-01-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-hardware-fire-rating-chart",
        "alt": "Reference chart showing fire-rating requirements for door hardware by occupancy type, door location, and fire-protection rating",
        "caption": "Future chart: door hardware fire-rating requirements by occupancy and location",
        "suggestedAsset": "Reference table with fire-rating requirements for door assemblies",
        "placementIntent": "Provides quick reference for hardware selection in fire-rated assemblies"
    },
    "lea-matl-008-02-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-window-hardware-selection",
        "alt": "Comparison chart of window hardware by window type: casement, sliding, awning, jalousie, pivot, and projected with operation, security, and weather-tightness ratings",
        "caption": "Future chart: window hardware selection matrix by window configuration",
        "suggestedAsset": "Selection matrix for window hardware by window type",
        "placementIntent": "Helps select appropriate hardware for each window type"
    },
    "lea-matl-008-03-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-fastener-load-chart",
        "alt": "Comparison chart of fastener load capacities: nails, screws, bolts, anchors, rivets, and adhesives in shear and tension with substrate compatibility",
        "caption": "Future chart: fastener load capacity comparison — shear, tension, and substrate compatibility",
        "suggestedAsset": "Reference chart or infographic of fastener load capacities",
        "placementIntent": "Provides reference for fastener selection based on load requirements"
    },
    "lea-matl-008-04-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-joint-location-diagram",
        "alt": "Building section diagram showing typical expansion joint locations in a structure: between wings, at changes in height, at building separations, and at regular intervals",
        "caption": "Future diagram: expansion joint locations in building — typical placement at structural transitions",
        "suggestedAsset": "Building section with expansion joint location callouts",
        "placementIntent": "Shows where to place expansion joints in building design"
    },
    "lea-matl-008-05-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-adhesive-application-chart",
        "alt": "Application matrix for adhesive systems showing recommended adhesives for bonding different materials: wood, metal, glass, concrete, plastic, and tile",
        "caption": "Future chart: adhesive application matrix — recommended adhesive by substrate pair",
        "suggestedAsset": "Material bonding matrix or reference chart",
        "placementIntent": "Guides adhesive selection for different material combinations"
    },

    # === Specifications ===
    "lea-matl-009-01-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-contract-documents-hierarchy",
        "alt": "Hierarchy diagram of construction contract documents showing order of precedence: contract agreement, general conditions, supplementary conditions, drawings, and specifications",
        "caption": "Future diagram: contract document hierarchy — order of precedence in construction",
        "suggestedAsset": "Hierarchy diagram or pyramid of contract document precedence",
        "placementIntent": "Clarifies where specifications fit in the contract document hierarchy"
    },
    "lea-matl-009-02-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-masterformat-navigation-guide",
        "alt": "Navigation guide for CSI MasterFormat showing how to find the correct division by material category with example materials mapped to division numbers",
        "caption": "Future chart: CSI MasterFormat navigation guide — materials mapped to division numbers",
        "suggestedAsset": "Reference chart or decision tree for MasterFormat division lookup",
        "placementIntent": "Helps learners locate specification sections for any material"
    },
    "lea-matl-009-03-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-spec-section-annotated",
        "alt": "Annotated specification section showing Part 1 General, Part 2 Products, and Part 3 Execution with explanatory callouts for each information type",
        "caption": "Future diagram: annotated specification section — three-part format with explanatory callouts",
        "suggestedAsset": "Annotated excerpt from a real specification section",
        "placementIntent": "Provides visual example of three-part spec section structure"
    },
    "lea-matl-009-04-core-concept": {
        "after": "## Philippine Construction Context",
        "id": "media-spec-type-selection-flow",
        "alt": "Decision flowchart for selecting specification type: prescriptive, performance, proprietary, or reference standard based on project goals, procurement rules, and design control needs",
        "caption": "Future diagram: specification type selection flowchart — prescriptive, performance, proprietary, or reference standard",
        "suggestedAsset": "Decision tree for specification type selection",
        "placementIntent": "Guides practical selection of specification approach for project requirements"
    },

    # === Quantity Estimation ===
    "lea-matl-010-01-core-concept": {
        "after": "## Worked Examples",
        "id": "media-concrete-estimation-example",
        "alt": "Step-by-step worked example of concrete volume calculation and mix proportioning for a slab, beam, and column with formulas and results",
        "caption": "Future diagram: concrete estimation worked example — slab, beam, and column calculation",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of concrete quantity estimation"
    },
    "lea-matl-010-02-core-concept": {
        "after": "## Worked Examples",
        "id": "media-chb-estimation-example",
        "alt": "Step-by-step CHB quantity estimation example showing wall area calculation, opening deduction, block count, mortar volume, and steel reinforcement",
        "caption": "Future diagram: CHB estimation worked example — wall area, openings, block count, and reinforcement",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of masonry quantity estimation"
    },
    "lea-matl-010-03-core-concept": {
        "after": "## Worked Examples",
        "id": "media-rebar-estimation-example",
        "alt": "Step-by-step rebar estimation example showing bar sizing, weight conversion, spacing, lap splice, and total tonnage calculation for a reinforced concrete beam",
        "caption": "Future diagram: rebar estimation worked example — sizing, weight, spacing, and lap splice",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of rebar quantity estimation"
    },
    "lea-matl-010-04-core-concept": {
        "after": "## Worked Examples",
        "id": "media-board-foot-example",
        "alt": "Step-by-step board foot estimation example showing lumber dimension conversion, quantity calculation per member, and total board feet for a framing plan",
        "caption": "Future diagram: board foot estimation worked example — lumber takeoff from framing plan",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of lumber quantity estimation"
    },
    "lea-matl-010-05-core-concept": {
        "after": "## Worked Examples",
        "id": "media-paint-estimation-example",
        "alt": "Step-by-step paint estimation example showing surface area calculation, number of coats, coverage rate, and total liters needed for a room",
        "caption": "Future diagram: paint estimation worked example — surface area, coats, and coverage calculation",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of paint quantity estimation"
    },
    "lea-matl-010-06-core-concept": {
        "after": "## Worked Examples",
        "id": "media-tile-estimation-example",
        "alt": "Step-by-step tile estimation example showing area calculation, tile count, waste factor, trim requirements, and grout quantity for a floor installation",
        "caption": "Future diagram: tile estimation worked example — area, tile count, waste, and grout",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of tile quantity estimation"
    },
    "lea-matl-010-07-core-concept": {
        "after": "## Worked Examples",
        "id": "media-steel-estimation-example",
        "alt": "Step-by-step structural steel estimation example showing beam and column weight calculations, section property lookup, and total tonnage for a steel frame",
        "caption": "Future diagram: steel tonnage estimation worked example — section weights and frame takeoff",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of steel quantity estimation"
    },
    "lea-matl-010-08-core-concept": {
        "after": "## Worked Examples",
        "id": "media-roofing-estimation-example",
        "alt": "Step-by-step roofing estimation example showing roof area, GI sheet coverage with end and side laps, ridge length, and fastener count",
        "caption": "Future diagram: roofing estimation worked example — sheet coverage, laps, ridge, and fasteners",
        "suggestedAsset": "Step-by-step illustrated calculation example",
        "placementIntent": "Provides practical example of roofing material estimation"
    },
}

def build_media_block(data):
    return (
        f'\n\n<ArticleMedia id="{data["id"]}" layout="single" type="image" status="placeholder"\n'
        f'  alt="{data["alt"]}"\n'
        f'  caption="{data["caption"]}"\n'
        f'  suggestedAsset="{data["suggestedAsset"]}"\n'
        f'  placementIntent="{data["placementIntent"]}" />'
    )

def main():
    total_second = 0
    total_failed = 0
    
    for article_dir in sorted(os.listdir(BASE)):
        full_path = os.path.join(BASE, article_dir)
        if not os.path.isdir(full_path):
            continue
        if not article_dir.startswith("lea-matl-"):
            continue
        
        slug = article_dir.split("--")[0]
        if slug not in SECOND_INSERTIONS:
            continue
        
        norm_path = os.path.join(full_path, "normalized.md")
        with open(norm_path, "r") as f:
            content = f.read()
        
        # Check if already has this media block
        ins = SECOND_INSERTIONS[slug]
        if f'id="{ins["id"]}"' in content:
            print(f"{slug}: ⚠️ Already has {ins['id']}")
            continue
        
        # Find marker
        marker = ins["after"]
        idx = content.find(f"\n{marker}")
        if idx < 0:
            idx = content.find(marker)
        if idx < 0:
            print(f"{slug}: ❌ Marker not found: '{marker}'")
            total_failed += 1
            continue
        
        # Insert after the marker paragraph (before the next heading)
        rest = content[idx + len(marker):]
        next_heading = -1
        for h in ["\n## ", "\n### "]:
            p = rest.find(h)
            if p >= 0 and (next_heading < 0 or p < next_heading):
                next_heading = p
        
        if next_heading >= 0:
            insert_pos = idx + len(marker) + next_heading
        else:
            insert_pos = len(content)
        
        media_block = build_media_block(ins)
        content = content[:insert_pos] + media_block + content[insert_pos:]
        
        with open(norm_path, "w") as f:
            f.write(content)
        
        print(f"{slug}: ✅ Inserted {ins['id']} after '{marker}'")
        total_second += 1
    
    print(f"\n=== Summary ===")
    print(f"Second insertions completed: {total_second}")
    print(f"Failed: {total_failed}")

if __name__ == "__main__":
    main()
