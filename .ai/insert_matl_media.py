#!/usr/bin/env python3
"""
Insert ArticleMedia placeholders into lea-matl-* articles.
1-2 per article, type="image", focusing on:
  - Material property comparison charts
  - Cross-section diagrams
  - Manufacturing process illustrations
  - Application detail drawings
  - Material selection decision diagrams
"""
import json
import os
import re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# Define media insertions per article: (slug, [list of (insert_after_text, media_block)])
# Each media block is a dict with key fields
INSERTIONS = {
    # === lea-matl-001: Wood & Timber Products ===
    "lea-matl-001-03-core-concept": [
        {
            "insert_after": "## Traditional Wood Joinery",
            "id": "media-wood-joint-cross-sections",
            "alt": "Cross-section illustrations of mortise-and-tenon, dovetail, lap, dado, rabbet, and butt joints showing interlocking geometry",
            "caption": "Future diagram: cross-section views of common wood joinery types",
            "suggestedAsset": "Annotated cross-section diagram showing six wood joint types",
            "placementIntent": "Helps learners visualize joint geometry described in the text"
        },
        {
            "insert_after": "### Split Ring Connectors",
            "id": "media-timber-connector-details",
            "alt": "Detail drawings of split ring and shear plate timber connectors showing installation in wood members",
            "caption": "Future diagram: timber connector types — split rings, shear plates, joist hangers",
            "suggestedAsset": "Cross-section and isometric detail drawings of timber connectors",
            "placementIntent": "Shows how mechanical timber connectors transfer load in structural applications"
        }
    ],

    "lea-matl-001-04-core-concept": [
        {
            "insert_after": "## Preservative Types and Standards",
            "id": "media-wood-preservation-process",
            "alt": "Illustration of pressure treatment cycle showing vacuum, pressure, and preservative penetration phases",
            "caption": "Future diagram: pressure treatment process — vacuum and pressure cycle",
            "suggestedAsset": "Process flow diagram showing the pressure treatment cycle",
            "placementIntent": "Visualizes the industrial wood preservation process described in the article"
        },
        {
            "insert_after": "### Fire-Retardant Treatment",
            "id": "media-fire-retardant-application",
            "alt": "Cross-section of fire-retardant treated wood showing penetration depth and protective zone",
            "caption": "Future diagram: fire-retardant treatment penetration in timber",
            "suggestedAsset": "Cross-section illustration showing FR treatment penetration",
            "placementIntent": "Clarifies how fire-retardant chemicals protect wood internally"
        }
    ],

    "lea-matl-001-05-core-concept": [
        {
            "insert_after": "## Board Foot Formula",
            "id": "media-lumber-measurement-diagram",
            "alt": "Diagram showing board foot measurement: thickness (T), width (W), and length (L) dimensions on a lumber piece",
            "caption": "Future diagram: board foot measurement dimensions",
            "suggestedAsset": "Annotated 3D diagram of lumber with T×W×L callouts",
            "placementIntent": "Helps learners understand the physical meaning of the board foot formula"
        },
        {
            "insert_after": "## Philippine Timber Species",
            "id": "media-timber-species-chart",
            "alt": "Comparison chart of Philippine timber species: narra, molave, yakal, mahogany, ipil — showing density, strength group, and common uses",
            "caption": "Future chart: Philippine timber species comparison — density, strength, and applications",
            "suggestedAsset": "Material property comparison chart or table infographic",
            "placementIntent": "Provides visual reference for timber species selection"
        }
    ],

    # === lea-matl-002: Masonry & Concrete Materials ===
    "lea-matl-002-03-core-concept": [
        {
            "insert_after": "## Concrete Hollow Block (CHB): Overview",
            "id": "media-chb-dimensions-diagram",
            "alt": "Annotated drawing of a standard 8×8×16 inch concrete hollow block showing face shell, web, and core dimensions",
            "caption": "Future diagram: CHB dimensional standards — face shell, web, and core void geometry",
            "suggestedAsset": "Cross-section and isometric drawing of CHB with standard dimensions",
            "placementIntent": "Visualizes CHB geometry and terminology described in the article"
        },
        {
            "insert_after": "## Clay Bricks: ASTM C62",
            "id": "media-clay-brick-vs-chb",
            "alt": "Side-by-side comparison illustration of clay brick and concrete hollow block showing size, texture, and cross-section differences",
            "caption": "Future diagram: clay brick vs. concrete hollow block — physical comparison",
            "suggestedAsset": "Comparative illustration with callouts for key differences",
            "placementIntent": "Helps learners distinguish between masonry unit types"
        }
    ],

    "lea-matl-002-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-natural-stone-types-compare",
            "alt": "Visual comparison chart showing granite, marble, limestone, sandstone, and slate with key physical properties and textures",
            "caption": "Future chart: natural stone types — geological origin, hardness, porosity, and architectural applications",
            "suggestedAsset": "Material property comparison chart with stone texture samples",
            "placementIntent": "Provides visual reference for stone identification and selection"
        },
        {
            "insert_after": "## Philippine Natural Stone Sources",
            "id": "media-stone-application-details",
            "alt": "Detail drawings showing stone application in cladding, flooring, and countertop installations with anchorage and joint details",
            "caption": "Future diagram: stone installation details — cladding anchorage, flooring joints, countertop edge profiles",
            "suggestedAsset": "Architectural detail drawings of stone assembly connections",
            "placementIntent": "Illustrates proper stone installation methods for architectural applications"
        }
    ],

    "lea-matl-002-05-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-cement-types-comparison",
            "alt": "Comparison table and illustrations showing ASTM C150 cement Types I through V with chemical composition, strength gain curves, and applications",
            "caption": "Future chart: cement types I–V comparison — composition, strength gain, and appropriate use",
            "suggestedAsset": "Infographic comparing cement types with heat of hydration and strength curves",
            "placementIntent": "Helps learners distinguish cement types by properties and applications"
        },
        {
            "insert_after": "## Philippine Cement Market",
            "id": "media-cement-application-guide",
            "alt": "Decision diagram for selecting cement type based on project conditions: sulfate exposure, mass concrete, rapid strength needs",
            "caption": "Future diagram: cement type selection decision flowchart",
            "suggestedAsset": "Decision tree or flowchart for cement type selection",
            "placementIntent": "Guides practical selection of appropriate cement type for project conditions"
        }
    ],

    "lea-matl-002-06-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-admixture-categories-chart",
            "alt": "Classification chart of concrete admixtures showing water reducers, retarders, accelerators, superplasticizers, air-entraining, and pozzolans with function icons",
            "caption": "Future chart: concrete admixture classification by function and effect",
            "suggestedAsset": "Organizational chart or infographic of admixture types",
            "placementIntent": "Provides visual taxonomy of admixture categories"
        },
        {
            "insert_after": "## Superplasticizers",
            "id": "media-admixture-effect-diagram",
            "alt": "Illustration showing how different admixtures modify fresh concrete properties: slump, setting time, air content, workability",
            "caption": "Future diagram: admixture effects on fresh and hardened concrete properties",
            "suggestedAsset": "Comparative illustration of concrete with and without each admixture type",
            "placementIntent": "Visualizes how admixtures change concrete behavior"
        }
    ],

    # === lea-matl-003: Metals, Glass & Glazing ===
    "lea-matl-003-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-steel-section-cross-sections",
            "alt": "Cross-section profiles of standard structural steel sections: W-shape, channel (C), angle (L), HSS rectangular, HSS round, and plate with dimension callouts",
            "caption": "Future diagram: structural steel section profiles — W-shape, channel, angle, HSS, and plate",
            "suggestedAsset": "Cross-section drawing set with standard designations and nominal dimensions",
            "placementIntent": "Helps learners recognize steel section types by cross-section geometry"
        },
        {
            "insert_after": "## Standard Steel Grades",
            "id": "media-steel-grade-comparison",
            "alt": "Comparison chart of A36 and A572 Grade 50 steel showing yield strength, tensile strength, weldability, and common applications",
            "caption": "Future chart: structural steel grades — A36 vs. A572 Grade 50 properties comparison",
            "suggestedAsset": "Material property comparison table with application notes",
            "placementIntent": "Clarifies when to specify each steel grade"
        }
    ],

    "lea-matl-003-05-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-glass-type-cross-sections",
            "alt": "Cross-section illustrations of annealed, tempered, laminated, insulated (IGU), heat-strengthened, and wired glass showing layer construction",
            "caption": "Future diagram: glass types cross-section — layer construction and manufacturing characteristics",
            "suggestedAsset": "Cross-section diagram set showing each glass type's internal structure",
            "placementIntent": "Visualizes glass manufacturing differences and lamination/ tempering structure"
        },
        {
            "insert_after": "## Glass Selection for Philippine Buildings",
            "id": "media-glass-selection-guide",
            "alt": "Decision diagram for selecting glass type by application: wind load, safety glazing, thermal performance, hurricane resistance",
            "caption": "Future diagram: glass type selection flowchart for Philippine building enclosures",
            "suggestedAsset": "Selection decision tree or matrix for glass specification",
            "placementIntent": "Guides glass selection based on project requirements and Philippine conditions"
        }
    ],

    "lea-matl-003-07-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-bolt-grade-comparison",
            "alt": "Comparison diagram of A325, A490, and A307 bolts showing head markings, strength ratings, and typical applications",
            "caption": "Future chart: structural bolt grades — A325, A490, A307 comparison with head marking identification",
            "suggestedAsset": "Bolt identification chart with head marking callouts and strength specifications",
            "placementIntent": "Helps learners identify bolt grades by visual inspection and understand strength differences"
        },
        {
            "insert_after": "## Installation Methods",
            "id": "media-bolt-installation-details",
            "alt": "Cross-section detail drawings of snug-tight, pretensioned, and slip-critical bolted connections showing bolt, nut, washer placement",
            "caption": "Future diagram: bolted connection installation methods — snug-tight, pretensioned, slip-critical",
            "suggestedAsset": "Cross-section and isometric detail drawings of bolted connections",
            "placementIntent": "Visualizes correct bolt installation for different connection types"
        }
    ],

    # === lea-matl-004: Construction Systems & Methods ===
    "lea-matl-004-06-core-concept": [
        {
            "insert_after": "### Cast-In-Place (CIP) Concrete Construction",
            "id": "media-rc-section-diagram",
            "alt": "Cross-section of a reinforced concrete beam showing rebar placement, cover, stirrups, and concrete zones in compression and tension",
            "caption": "Future diagram: reinforced concrete beam cross-section — rebar layout, cover, and stress distribution",
            "suggestedAsset": "Annotated cross-section of RC beam with compression/tension zones",
            "placementIntent": "Visualizes how steel and concrete work compositely"
        },
        {
            "insert_after": "### Precast Concrete Construction",
            "id": "media-precast-connection-details",
            "alt": "Detail drawings of precast connections: bolted, grouted, welded, and socket connections for beams, columns, and wall panels",
            "caption": "Future diagram: precast concrete connection details — wet and dry connection types",
            "suggestedAsset": "Architectural detail drawings of precast connections",
            "placementIntent": "Shows how precast elements connect in the field"
        }
    ],

    "lea-matl-004-07-core-concept": [
        {
            "insert_after": "### Moment Frames",
            "id": "media-steel-frame-systems",
            "alt": "Isometric diagrams of structural steel framing systems: moment frame, braced frame, and composite steel-concrete construction",
            "caption": "Future diagram: structural steel framing systems — moment frame, braced frame, composite construction",
            "suggestedAsset": "Isometric structural system diagrams with connection callouts",
            "placementIntent": "Helps learners distinguish steel framing systems by structural behavior"
        },
        {
            "insert_after": "### Bolted Connections",
            "id": "media-steel-connection-details",
            "alt": "Detail drawings of bolted and welded steel connections in moment and braced frames showing gusset plates, stiffeners, and bolt patterns",
            "caption": "Future diagram: steel connection details — bolted and welded joint types",
            "suggestedAsset": "Architectural/structural detail drawings of steel connections",
            "placementIntent": "Visualizes typical steel connection configurations"
        }
    ],

    "lea-matl-004-08-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-formwork-type-illustrations",
            "alt": "Cross-section diagrams of conventional timber formwork, prefabricated panel formwork, slip form, climbing form, and tunnel form systems",
            "caption": "Future diagram: formwork system types — timber, panel, slip, climbing, and tunnel forms",
            "suggestedAsset": "Cross-section and isometric illustrations of each formwork type",
            "placementIntent": "Visualizes how each formwork type supports fresh concrete"
        },
        {
            "insert_after": "## Lateral Pressure on Formwork",
            "id": "media-formwork-pressure-diagram",
            "alt": "Diagram showing lateral concrete pressure distribution on formwork walls with maximum pressure zone and bracing points",
            "caption": "Future diagram: lateral pressure distribution on formwork — NSCP 2015 limits",
            "suggestedAsset": "Pressure distribution diagram with bracing and deflection callouts",
            "placementIntent": "Illustrates the lateral pressure concept critical for formwork design"
        }
    ],

    "lea-matl-004-09-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-construction-equipment-chart",
            "alt": "Comparison chart of construction equipment — excavators, cranes, concrete pumps, compactors — with lifting capacity, reach, and application",
            "caption": "Future chart: construction equipment types — capacity, reach, and site application",
            "suggestedAsset": "Equipment comparison chart with silhouette illustrations",
            "placementIntent": "Helps learners select appropriate equipment for construction tasks"
        },
        {
            "insert_after": "## Site Logistics",
            "id": "media-site-logistics-diagram",
            "alt": "Site plan diagram showing crane placement, material staging, equipment access routes, and concrete pump positioning",
            "caption": "Future diagram: construction site logistics — equipment placement and material flow",
            "suggestedAsset": "Site plan layout drawing with equipment and material zones",
            "placementIntent": "Visualizes construction sequencing and site organization"
        }
    ],

    "lea-matl-004-10-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-site-investigation-flow",
            "alt": "Flowchart showing preconstruction activities sequence: site investigation, soil testing, survey/staking, and temporary facilities",
            "caption": "Future diagram: preconstruction activity workflow — site investigation through temporary facilities",
            "suggestedAsset": "Process flowchart of preconstruction activities",
            "placementIntent": "Shows the logical sequence of preconstruction activities"
        },
        {
            "insert_after": "## Soil Testing Methods",
            "id": "media-soil-test-diagram",
            "alt": "Cross-section diagrams of SPT (Standard Penetration Test), plate load test, and compaction test setups on site",
            "caption": "Future diagram: soil testing methods — SPT, plate load, and compaction test",
            "suggestedAsset": "Cross-section illustrations of soil test procedures",
            "placementIntent": "Visualizes common soil testing methods for foundation design"
        }
    ],

    # === lea-matl-005: Sustainability & Special Topics ===
    "lea-matl-005-05-core-concept": [
        {
            "insert_after": "### Formwork Types",
            "id": "media-stripping-time-chart",
            "alt": "Chart showing formwork stripping time requirements per NSCP 2015 for slabs, beams, walls, and columns with temperature dependency curves",
            "caption": "Future chart: formwork stripping time requirements by member type and concrete strength",
            "suggestedAsset": "Chart or table of minimum curing periods before form removal",
            "placementIntent": "Provides quick reference for stripping time requirements under different conditions"
        },
        {
            "insert_after": "### Concrete Strength Gain and Temperature",
            "id": "media-strength-gain-curves",
            "alt": "Graph showing concrete compressive strength gain over time at different temperatures, with 28-day design strength reference line",
            "caption": "Future diagram: concrete strength gain curves at varying temperatures",
            "suggestedAsset": "Strength vs. time graph with temperature series",
            "placementIntent": "Visualizes how temperature affects concrete curing and stripping time"
        }
    ],

    "lea-matl-005-07-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-embodied-carbon-infographic",
            "alt": "Infographic showing embodied carbon breakdown across building material lifecycle: extraction, manufacturing, transportation, construction, and end-of-life",
            "caption": "Future infographic: embodied carbon lifecycle stages and material contributions",
            "suggestedAsset": "Infographic or Sankey diagram showing carbon flow in building materials",
            "placementIntent": "Visualizes the total carbon footprint concept across material lifecycle"
        },
        {
            "insert_after": "## Embodied Carbon Reduction Strategies",
            "id": "media-carbon-reduction-chart",
            "alt": "Comparison chart of embodied carbon reduction strategies showing relative impact: material substitution, low-carbon concrete, recycled content, and local sourcing",
            "caption": "Future chart: embodied carbon reduction strategies — relative impact comparison",
            "suggestedAsset": "Bar chart or comparative infographic of reduction strategies",
            "placementIntent": "Helps learners compare effectiveness of different carbon reduction approaches"
        }
    ],

    "lea-matl-005-08-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-vernacular-materials-chart",
            "alt": "Comparison chart of vernacular building materials: bamboo, nipa, cogon, rattan, adobe, and stabilized earth blocks with property data",
            "caption": "Future chart: vernacular and sustainable materials — properties and applications",
            "suggestedAsset": "Material property comparison chart with construction detail examples",
            "placementIntent": "Provides visual reference for traditional Philippine building materials"
        },
        {
            "insert_after": "## Construction Methods",
            "id": "media-vernacular-construction-details",
            "alt": "Section and elevation details of traditional Philippine construction methods using bamboo, nipa, and adobe wall systems",
            "caption": "Future diagram: traditional Philippine construction details — bamboo frame, nipa roof, adobe wall",
            "suggestedAsset": "Cross-section and assembly drawings of vernacular construction",
            "placementIntent": "Shows how traditional materials are assembled in construction"
        }
    ],

    "lea-matl-005-09-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-lca-stages-diagram",
            "alt": "Diagram showing the five life cycle assessment stages: raw material extraction, manufacturing, construction, use/maintenance, and end-of-life",
            "caption": "Future diagram: life cycle assessment (LCA) stages — cradle to grave",
            "suggestedAsset": "Process diagram or circular lifecycle diagram with stage descriptions",
            "placementIntent": "Visualizes the LCA framework for evaluating environmental impacts"
        },
        {
            "insert_after": "## LCA in Green Building Certifications",
            "id": "media-lca-berde-leed-edge",
            "alt": "Comparison diagram showing how LCA results feed into BERDE, LEED, and EDGE green building certification credit systems",
            "caption": "Future diagram: LCA inputs to green building certifications — BERDE, LEED, and EDGE",
            "suggestedAsset": "Process flow showing LCA data flow into certification credits",
            "placementIntent": "Shows how LCA methodology connects to real-world certification"
        }
    ],

    "lea-matl-005-10-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-voc-limits-chart",
            "alt": "Comparison chart of VOC limits for interior finishes under BERDE and LEED standards, with common material categories",
            "caption": "Future chart: VOC limits for interior finishes — BERDE and LEED requirements",
            "suggestedAsset": "Table or infographic showing VOC limits by finish type",
            "placementIntent": "Provides reference for acceptable VOC levels in green building"
        },
        {
            "insert_after": "## Recycled Content and Regional Sourcing",
            "id": "media-recycled-content-diagram",
            "alt": "Diagram showing recycled content requirements, regional sourcing zones, and certified wood chain-of-custody under green building ratings",
            "caption": "Future diagram: green material requirements — recycled content, regional sourcing, and certified wood",
            "suggestedAsset": "Infographic or decision diagram for green material specification",
            "placementIntent": "Helps learners understand multiple green material criteria"
        }
    ],

    # === lea-matl-006: Roofing & Envelope ===
    "lea-matl-006-01-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-roofing-material-chart",
            "alt": "Comparison chart of roofing materials: corrugated GI sheets, clay tiles, concrete tiles, asphalt shingles, standing seam metal, and green roofs with slope, weather resistance, fire rating, and service life data",
            "caption": "Future chart: roofing material comparison — slope requirements, weather resistance, fire rating, and service life",
            "suggestedAsset": "Material property comparison table with application photos or icons",
            "placementIntent": "Helps learners select appropriate roofing material for Philippine climate"
        },
        {
            "insert_after": "## Metal Roofing Profiles",
            "id": "media-roofing-profile-cross-sections",
            "alt": "Cross-section profiles of corrugated GI, trapezoidal, and standing seam metal roofing showing rib geometry and fastening methods",
            "caption": "Future diagram: metal roofing profile cross-sections — corrugated, trapezoidal, and standing seam",
            "suggestedAsset": "Cross-section drawings of metal roofing profiles",
            "placementIntent": "Visualizes how different metal roofing profiles achieve structural performance"
        }
    ],

    "lea-matl-006-02-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-roof-assembly-sections",
            "alt": "Cross-section of a complete roof assembly showing underlayment, flashings, valleys, ridges, eaves, gutters, and vents in sequence",
            "caption": "Future diagram: roof assembly cross-section — component layering from deck to finish",
            "suggestedAsset": "Annotated cross-section of roof assembly with component callouts",
            "placementIntent": "Shows how all roofing components work together for weather-tightness"
        },
        {
            "insert_after": "## Flashing Details",
            "id": "media-roof-flashing-details",
            "alt": "Detail drawings of roof flashings at valley, ridge, eave, chimney, and wall intersection showing step flashing, counter-flashing, and sealant placement",
            "caption": "Future diagram: roof flashing details — valley, ridge, eave, chimney, and wall intersections",
            "suggestedAsset": "Architectural detail drawings of roof flashing conditions",
            "placementIntent": "Visualizes critical waterproofing details at roof transitions"
        }
    ],

    "lea-matl-006-03-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-waterproofing-system-chart",
            "alt": "Comparison chart of waterproofing systems: sheet membranes, liquid-applied, cementitious, and bentonite with application method, thickness, and water exposure rating",
            "caption": "Future chart: waterproofing vs damp-proofing — system types, materials, and applications",
            "suggestedAsset": "Material comparison chart with application illustrations",
            "placementIntent": "Helps learners distinguish waterproofing from damp-proofing and select appropriate system"
        },
        {
            "insert_after": "## Below-Grade Application Details",
            "id": "media-below-grade-waterproofing",
            "alt": "Cross-section detail of below-grade wall waterproofing showing foundation wall, drainage board, waterproofing membrane, and protection board",
            "caption": "Future diagram: below-grade waterproofing system — wall and slab detail cross-section",
            "suggestedAsset": "Cross-section detail drawing of below-grade waterproofing assembly",
            "placementIntent": "Visualizes proper waterproofing installation below grade"
        }
    ],

    "lea-matl-006-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-insulation-material-chart",
            "alt": "Comparison chart of thermal insulation materials: fiberglass, mineral wool, EPS, XPS, polyurethane foam, and reflective foil with R-value per inch, fire rating, and moisture resistance",
            "caption": "Future chart: thermal insulation material comparison — R-value, fire rating, and moisture resistance",
            "suggestedAsset": "Material property comparison chart with application photos",
            "placementIntent": "Helps learners select insulation materials by thermal and safety properties"
        },
        {
            "insert_after": "## R-Value Calculations",
            "id": "media-insulation-rvalue-diagram",
            "alt": "Diagram showing R-value calculation for a wall assembly with multiple insulation layers, thermal bridging illustration, and NBCP energy code minimums",
            "caption": "Future diagram: R-value calculation for wall assemblies — thermal bridging and code minimums",
            "suggestedAsset": "Cross-section of wall assembly with R-value callouts and thermal bridge paths",
            "placementIntent": "Visualizes how R-values are calculated for composite assemblies"
        }
    ],

    "lea-matl-006-05-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-sealant-comparison-chart",
            "alt": "Comparison chart of sealant types: silicone, polyurethane, polysulfide, acrylic, and butyl with movement capability, adhesion, weathering resistance, and applications",
            "caption": "Future chart: sealant and caulk comparison — movement capability, adhesion, and weathering",
            "suggestedAsset": "Material comparison table with joint application illustrations",
            "placementIntent": "Provides reference for sealant selection by joint type and substrate"
        },
        {
            "insert_after": "## Joint Design and Sealant Application",
            "id": "media-sealant-joint-details",
            "alt": "Cross-section detail drawings of proper sealant joint design showing backer rod, bond breaker tape, sealant shape factor, and tooling",
            "caption": "Future diagram: sealant joint design — backer rod, bond breaker, shape factor, and tooling details",
            "suggestedAsset": "Cross-section detail drawings of sealed joints",
            "placementIntent": "Shows correct sealant application for movement joints"
        }
    ],

    # === lea-matl-007: Finishes ===
    "lea-matl-007-01-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-floor-finish-comparison",
            "alt": "Comparison chart of floor finishes: ceramic tile, porcelain, hardwood, engineered wood, vinyl, linoleum, carpet, terrazzo, polished concrete, and rubber with durability, maintenance, and moisture resistance ratings",
            "caption": "Future chart: floor finish comparison — durability, maintenance, moisture resistance, and room suitability",
            "suggestedAsset": "Material selection chart with application matrix",
            "placementIntent": "Helps learners select appropriate floor finish by room type and performance requirements"
        },
        {
            "insert_after": "## Tile Flooring Installation",
            "id": "media-tile-flooring-sections",
            "alt": "Cross-section of tile flooring installation showing substrate, mortar bed, tile, and grout layers with expansion joint placement",
            "caption": "Future diagram: tile flooring installation cross-section — substrate through grout layers",
            "suggestedAsset": "Cross-section detail of tile flooring assembly",
            "placementIntent": "Visualizes proper tile installation and substrate preparation"
        }
    ],

    "lea-matl-007-02-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-wall-finish-comparison",
            "alt": "Comparison chart of wall finishes: paint, wallpaper, gypsum board, plywood paneling, tile, stone cladding, fabric, metal panel, and glass with aesthetic, durability, and fire-resistance ratings",
            "caption": "Future chart: wall finish comparison — aesthetic effect, durability, installation method, and fire rating",
            "suggestedAsset": "Material selection matrix with finish application photos",
            "placementIntent": "Provides comprehensive reference for wall finish selection"
        },
        {
            "insert_after": "## Installation Methods",
            "id": "media-wall-finish-installation",
            "alt": "Cross-section detail drawings of wall finish installations: gypsum board on furring, tile on cement board, stone cladding with anchors, and metal panel with sub-girt",
            "caption": "Future diagram: wall finish installation details — furring, adhesive, mechanical anchor methods",
            "suggestedAsset": "Architectural detail cross-sections of wall finish assemblies",
            "placementIntent": "Visualizes proper installation methods for different wall finishes"
        }
    ],

    "lea-matl-007-03-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-ceiling-finish-comparison",
            "alt": "Comparison chart of ceiling finishes: suspended acoustic tile, gypsum board, metal pan, open plenum, wood strip, and stretched fabric with acoustic, fire rating, and access ratings",
            "caption": "Future chart: ceiling finish comparison — acoustic performance, fire rating, access, and aesthetics",
            "suggestedAsset": "Material comparison chart with ceiling system illustrations",
            "placementIntent": "Helps learners select ceiling systems by occupancy requirements"
        },
        {
            "insert_after": "## Suspended Ceiling Systems",
            "id": "media-ceiling-system-sections",
            "alt": "Cross-section of suspended ceiling system showing grid, hanger wires, acoustic tiles, edge trim, and light fixture integration",
            "caption": "Future diagram: suspended ceiling system — grid, hangers, tiles, and MEP integration",
            "suggestedAsset": "Cross-section detail drawing of suspended ceiling assembly",
            "placementIntent": "Visualizes suspended ceiling components and installation"
        }
    ],

    "lea-matl-007-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-paint-coating-comparison",
            "alt": "Comparison chart of paint and coating systems: latex, oil-based, epoxy, polyurethane, stain, varnish, enamel, and textured with binder type, durability, sheen, and substrate compatibility",
            "caption": "Future chart: paint and coating systems comparison — binder type, sheen, durability, and substrate",
            "suggestedAsset": "Material selection chart with finish sample illustrations",
            "placementIntent": "Provides reference for coating selection by application and substrate"
        },
        {
            "insert_after": "## Surface Preparation",
            "id": "media-paint-application-details",
            "alt": "Cross-section diagrams showing proper paint application layers: primer, intermediate coats, and finish coat on different substrates (wood, metal, masonry, gypsum)",
            "caption": "Future diagram: paint application — surface preparation and coating layers for different substrates",
            "suggestedAsset": "Cross-section details showing coating build-up on various substrates",
            "placementIntent": "Visualizes proper paint system application for durability"
        }
    ],

    "lea-matl-007-05-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-finish-schedule-example",
            "alt": "Example finish schedule showing room-by-room matrix of floor, wall, and ceiling finishes with material codes, locations, and installation notes",
            "caption": "Future diagram: sample finish schedule — room-by-room matrix with material codes and installation notes",
            "suggestedAsset": "Table or matrix template showing finish schedule format",
            "placementIntent": "Provides visual example of finish schedule document structure"
        },
        {
            "insert_after": "## Finish Schedule Structure",
            "id": "media-finish-schedule-room-diagram",
            "alt": "Floor plan with finish callout bubbles showing how finish schedule entries reference specific room locations",
            "caption": "Future diagram: finish schedule referencing — room plan with finish callout annotations",
            "suggestedAsset": "Plan view diagram with finish schedule coordination callouts",
            "placementIntent": "Shows how finish schedules coordinate with floor plans"
        }
    ],

    "lea-matl-007-06-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-countertop-material-chart",
            "alt": "Comparison chart of countertop materials: granite, marble, quartz, solid surface, laminate, stainless steel, concrete, wood, and tile with durability, stain resistance, heat resistance, and maintenance ratings",
            "caption": "Future chart: countertop material comparison — durability, stain resistance, heat resistance, and maintenance",
            "suggestedAsset": "Material selection chart with application suitability matrix",
            "placementIntent": "Helps learners select countertop materials by use and performance requirements"
        },
        {
            "insert_after": "## Edge Profiles and Installation",
            "id": "media-countertop-edge-profiles",
            "alt": "Cross-section profiles of countertop edge treatments: eased, bullnose, beveled, ogee, and waterfall with installation support details",
            "caption": "Future diagram: countertop edge profile types and installation support details",
            "suggestedAsset": "Edge profile cross-section drawings with installation details",
            "placementIntent": "Visualizes countertop edge treatment options and mounting methods"
        }
    ],

    # === lea-matl-008: Fasteners & Hardware ===
    "lea-matl-008-01-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-door-hardware-comparison",
            "alt": "Comparison chart of door hardware types: hinges, locksets, closers, panic devices, and exit hardware with ANSI grade, function, and fire-rating information",
            "caption": "Future chart: door hardware comparison — hinges, locksets, closers, panic devices, and exit hardware",
            "suggestedAsset": "Hardware identification chart with ANSI grade callouts",
            "placementIntent": "Provides visual reference for door hardware selection by occupancy"
        },
        {
            "insert_after": "## Hinge Types and Applications",
            "id": "media-door-hinge-details",
            "alt": "Detail drawings of butt hinges, continuous hinges, pivot hinges, spring hinges, and concealed hinges showing mounting and operation",
            "caption": "Future diagram: hinge types — butt, continuous, pivot, spring, and concealed hinge details",
            "suggestedAsset": "Cross-section and elevation details of hinge installations",
            "placementIntent": "Visualizes hinge selection and installation for different door types"
        }
    ],

    "lea-matl-008-02-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-window-hardware-chart",
            "alt": "Comparison chart of window hardware: casement operators, sliding locks, awning cranks, jalousie mechanisms, pivot hinges, and projected window hardware with operation and security ratings",
            "caption": "Future chart: window hardware types — operation, security, and weather-tightness comparison",
            "suggestedAsset": "Hardware identification chart with window type illustrations",
            "placementIntent": "Provides reference for window hardware selection by window configuration"
        },
        {
            "insert_after": "## Window Types and Hardware Compatibility",
            "id": "media-window-section-details",
            "alt": "Cross-section details of different window types showing hardware placement: casement, sliding, awning, jalousie, pivot, and projected windows",
            "caption": "Future diagram: window hardware installation — cross-section details by window type",
            "suggestedAsset": "Window cross-section drawings with hardware callouts",
            "placementIntent": "Shows how hardware integrates with different window frame configurations"
        }
    ],

    "lea-matl-008-03-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-fastener-comparison-chart",
            "alt": "Comparison chart of fastener systems: nails, screws, bolts, anchors, rivets, welding, and adhesives with load capacity, substrate compatibility, and installation method",
            "caption": "Future chart: fastener system comparison — load capacity, substrate, and installation method",
            "suggestedAsset": "Fastener selection matrix with application illustrations",
            "placementIntent": "Helps learners select appropriate fasteners by connection requirements"
        },
        {
            "insert_after": "## Anchor Types",
            "id": "media-fastener-anchor-details",
            "alt": "Cross-section detail drawings of mechanical and adhesive anchor types: expansion anchors, undercut anchors, epoxy anchors, and screw anchors in concrete and masonry substrates",
            "caption": "Future diagram: anchor types — expansion, undercut, epoxy, and screw anchor installation in concrete/masonry",
            "suggestedAsset": "Cross-section detail drawings of anchor installations",
            "placementIntent": "Visualizes proper anchor selection and installation for structural connections"
        }
    ],

    "lea-matl-008-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-expansion-joint-types",
            "alt": "Comparison chart and cross-section diagrams of structural, thermal, seismic, and construction joints showing movement direction and treatment",
            "caption": "Future diagram: expansion joint types — structural, thermal, seismic, and construction joints with movement indication",
            "suggestedAsset": "Cross-section diagrams of each joint type with movement arrows",
            "placementIntent": "Helps learners distinguish joint types by their movement accommodation function"
        },
        {
            "insert_after": "## Joint Sealant and Cover Systems",
            "id": "media-expansion-joint-details",
            "alt": "Detail drawings of expansion joint cover assemblies for floors, walls, and roofs showing sealant, cover plate, and fire barrier placement",
            "caption": "Future diagram: expansion joint cover systems — floor, wall, and roof assemblies",
            "suggestedAsset": "Architectural detail drawings of expansion joint assemblies",
            "placementIntent": "Visualizes how expansion joints maintain continuity of fire rating and weather-tightness"
        }
    ],

    "lea-matl-008-05-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-adhesive-selection-chart",
            "alt": "Comparison chart of adhesive systems: construction adhesive, epoxy, contact cement, PVA glue, polyurethane, silicone, and acrylic with bonding strength, setting time, and substrate compatibility",
            "caption": "Future chart: adhesive system comparison — bonding strength, setting time, and substrate compatibility",
            "suggestedAsset": "Adhesive selection matrix with application illustrations",
            "placementIntent": "Provides reference for adhesive selection by bonding requirements"
        },
        {
            "insert_after": "## Structural Adhesive Bonds",
            "id": "media-adhesive-bond-details",
            "alt": "Cross-section detail drawings of structural, semi-structural, and non-structural adhesive bonds showing joint geometry, bond line thickness, and stress distribution",
            "caption": "Future diagram: adhesive bond types — structural, semi-structural, and non-structural joint details",
            "suggestedAsset": "Cross-section detail drawings of adhesive bond configurations",
            "placementIntent": "Visualizes proper adhesive joint design for different load levels"
        }
    ],

    # === lea-matl-009: Specifications ===
    "lea-matl-009-01-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-spec-vs-drawings",
            "alt": "Diagram showing complementary roles of specifications and drawings: drawings show what and where, specifications show how and to what standard",
            "caption": "Future diagram: specifications vs. drawings — complementary roles in defining design intent",
            "suggestedAsset": "Venn diagram or side-by-side comparison infographic",
            "placementIntent": "Clarifies the distinct roles of specifications and drawings in contract documents"
        },
        {
            "insert_after": "## Legal Role of Specifications",
            "id": "media-spec-legal-framework",
            "alt": "Diagram showing how specifications fit into the contract document hierarchy: contract agreement, conditions, drawings, and specifications",
            "caption": "Future diagram: specification role in contract documents — hierarchy and legal precedence",
            "suggestedAsset": "Hierarchy diagram of construction contract document layers",
            "placementIntent": "Shows the legal standing of specifications in the contract"
        }
    ],

    "lea-matl-009-02-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-masterformat-divisions-chart",
            "alt": "Chart showing all 50 CSI MasterFormat divisions with numbers, titles, and representative work sections for each division",
            "caption": "Future chart: CSI MasterFormat divisions 01–50 — numbers, titles, and sample work sections",
            "suggestedAsset": "Reference chart or table of MasterFormat divisions with section examples",
            "placementIntent": "Provides navigation reference for locating specification sections"
        },
        {
            "insert_after": "## Finding the Correct Division",
            "id": "media-masterformat-navigation-flow",
            "alt": "Decision flowchart for assigning materials and work to correct MasterFormat division number",
            "caption": "Future diagram: MasterFormat navigation — decision flowchart for division assignment",
            "suggestedAsset": "Flowchart or decision tree for MasterFormat division lookup",
            "placementIntent": "Helps learners find the correct MasterFormat division for any material"
        }
    ],

    "lea-matl-009-03-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-three-part-format-diagram",
            "alt": "Diagram showing the three-part specification section format: Part 1 General, Part 2 Products, Part 3 Execution with information type summaries",
            "caption": "Future diagram: three-part specification format — Part 1 General, Part 2 Products, Part 3 Execution",
            "suggestedAsset": "Annotated diagram or template showing each part's contents",
            "placementIntent": "Visualizes the structure of a specification section"
        },
        {
            "insert_after": "## Part 2: Products",
            "id": "media-spec-section-example",
            "alt": "Annotated sample specification section showing real content in Part 1, Part 2, and Part 3 formats with section-specific requirements",
            "caption": "Future diagram: sample specification section — annotated three-part format example",
            "suggestedAsset": "Annotated excerpt from a real specification section",
            "placementIntent": "Provides concrete example of three-part format in practice"
        }
    ],

    "lea-matl-009-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-spec-type-comparison",
            "alt": "Comparison chart of specification types: prescriptive, performance, proprietary, and reference standard with definitions, when-used, advantages, and disadvantages",
            "caption": "Future chart: specification type comparison — prescriptive, performance, proprietary, and reference standard",
            "suggestedAsset": "Comparison matrix with example language for each spec type",
            "placementIntent": "Helps learners distinguish specification types and choose appropriate approach"
        },
        {
            "insert_after": "## Performance Specifications",
            "id": "media-spec-selection-decision",
            "alt": "Decision diagram for selecting specification type based on project goals, procurement rules, and design control requirements",
            "caption": "Future diagram: specification type selection — decision flowchart by project requirements",
            "suggestedAsset": "Decision tree for specification type selection",
            "placementIntent": "Guides practical selection of specification approach"
        }
    ],

    # === lea-matl-010: Quantity Estimation ===
    "lea-matl-010-01-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-concrete-volume-diagram",
            "alt": "Diagram showing concrete volume calculation: length × width × height on a building element with mix proportion conversion example",
            "caption": "Future diagram: concrete volume calculation and mix proportion conversion",
            "suggestedAsset": "Illustration of volume measurement with mix proportion workflow",
            "placementIntent": "Visualizes the concrete quantity estimation process"
        },
        {
            "insert_after": "## Mix Design Proportioning",
            "id": "media-mix-design-proportions",
            "alt": "Comparison chart showing concrete mix design proportions for common strength grades (21, 24, 28, 35 MPa) with cement, sand, gravel, and water quantities",
            "caption": "Future chart: concrete mix design proportions — cement, sand, gravel per cubic meter by strength grade",
            "suggestedAsset": "Reference table with ACI 211.1 proportioning method illustration",
            "placementIntent": "Provides quick reference for concrete mix proportioning"
        }
    ],

    "lea-matl-010-02-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-chb-estimation-diagram",
            "alt": "Diagram showing CHB wall area calculation, opening deductions, and block layout with bond pattern illustration",
            "caption": "Future diagram: CHB quantity estimation — wall area, openings, bond pattern, and layout",
            "suggestedAsset": "Wall elevation diagram with block count calculation steps",
            "placementIntent": "Visualizes CHB estimation methodology"
        },
        {
            "insert_after": "## Mortar Volume Calculation",
            "id": "media-chb-rebar-estimation",
            "alt": "Illustration showing vertical and horizontal reinforcement placement in CHB walls with rebar spacing and quantity calculation",
            "caption": "Future diagram: CHB reinforcement estimation — vertical and horizontal rebar placement and quantities",
            "suggestedAsset": "Wall section diagram with rebar layout and quantity callouts",
            "placementIntent": "Shows how to estimate rebar quantities for reinforced masonry"
        }
    ],

    "lea-matl-010-03-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-rebar-weight-chart",
            "alt": "Reference chart showing rebar sizes (10mm through 40mm or #3 through #14) with nominal diameter, area, and weight per linear meter",
            "caption": "Future chart: rebar size reference — diameter, cross-sectional area, and weight per linear meter",
            "suggestedAsset": "Reference table with rebar size cross-section illustrations",
            "placementIntent": "Provides quick reference for rebar weight conversion"
        },
        {
            "insert_after": "## Rebar Quantity Calculation",
            "id": "media-rebar-estimation-sections",
            "alt": "Cross-section of a reinforced concrete beam and column showing rebar layout, spacing, and lap splice lengths for quantity takeoff",
            "caption": "Future diagram: rebar quantity estimation — beam and column reinforcement with lap splice lengths",
            "suggestedAsset": "Cross-section detail with rebar schedule callouts",
            "placementIntent": "Visualizes how to take off rebar quantities from structural drawings"
        }
    ],

    "lea-matl-010-04-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-board-foot-diagram",
            "alt": "Diagram showing board foot calculation: T × W × L / 12 with annotated lumber dimensions and calculation example",
            "caption": "Future diagram: board foot measurement — formula illustration with dimensional lumber example",
            "suggestedAsset": "3D lumber diagram with dimension callouts and formula",
            "placementIntent": "Visualizes the board foot formula for lumber estimation"
        },
        {
            "insert_after": "## Framing Quantity Estimation",
            "id": "media-lumber-framing-plan",
            "alt": "Floor framing plan showing joist layout, spacing, blocking, and headers with board foot quantity calculation per member",
            "caption": "Future diagram: lumber quantity estimation — floor framing plan with board foot takeoff",
            "suggestedAsset": "Framing plan with member quantity callout labels",
            "placementIntent": "Shows practical lumber estimation from framing layout"
        }
    ],

    "lea-matl-010-05-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-paint-coverage-diagram",
            "alt": "Diagram showing paint coverage calculation: surface area measurement, number of coats, and coverage rate per liter with waste factor",
            "caption": "Future diagram: paint coverage calculation — surface area, coats, and coverage rate",
            "suggestedAsset": "Wall elevation with area measurement callouts and calculation",
            "placementIntent": "Visualizes paint estimation methodology"
        },
        {
            "insert_after": "## Substrate Porosity Adjustment",
            "id": "media-paint-porosity-chart",
            "alt": "Comparison chart of paint coverage rates on different substrates: gypsum board, concrete, plywood, metal, and masonry with porosity adjustments",
            "caption": "Future chart: paint coverage by substrate type — porosity adjustment factors",
            "suggestedAsset": "Table or bar chart showing coverage rates per substrate",
            "placementIntent": "Helps learners adjust paint estimates for different surface conditions"
        }
    ],

    "lea-matl-010-06-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-tile-quantity-diagram",
            "alt": "Diagram showing tile quantity calculation: floor/wall area, trim, thresholds, and waste factor for different tile sizes and layouts",
            "caption": "Future diagram: tile quantity estimation — area, trim, thresholds, and waste factor calculation",
            "suggestedAsset": "Floor plan with tile layout grid and quantity callouts",
            "placementIntent": "Visualizes tile estimation process including waste and trim"
        },
        {
            "insert_after": "## Grout and Adhesive Estimation",
            "id": "media-tile-grout-calculator",
            "alt": "Reference chart showing grout and adhesive coverage by tile size and joint width, with working example calculation",
            "caption": "Future chart: tile grout and adhesive estimation — coverage by tile size and joint width",
            "suggestedAsset": "Reference table with grout quantity calculation example",
            "placementIntent": "Provides quick reference for estimating grout and adhesive quantities"
        }
    ],

    "lea-matl-010-07-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-steel-weight-chart",
            "alt": "Reference chart showing W-shape section properties with weight per meter, depth, flange width, and typical uses with calculation formula",
            "caption": "Future chart: structural steel weight reference — W-shape properties and weight per meter",
            "suggestedAsset": "Reference table with section property callouts and formula",
            "placementIntent": "Provides quick reference for steel weight estimation"
        },
        {
            "insert_after": "## Plate Weight Calculation",
            "id": "media-steel-frame-takeoff",
            "alt": "Steel frame layout diagram with member callouts showing how to calculate total tonnage from individual section weights and lengths",
            "caption": "Future diagram: structural steel tonnage estimation — frame layout with member takeoff",
            "suggestedAsset": "Steel frame elevation with member weight callouts",
            "placementIntent": "Shows practical steel quantity takeoff from framing plan"
        }
    ],

    "lea-matl-010-08-core-concept": [
        {
            "insert_after": "## Core Concept",
            "id": "media-roofing-quantity-diagram",
            "alt": "Diagram showing corrugated GI sheet coverage calculation with side lap, end lap, and slope allowance on a roof plan",
            "caption": "Future diagram: roofing quantity estimation — GI sheet coverage, laps, and slope allowance",
            "suggestedAsset": "Roof plan with sheet layout and lap allowance callouts",
            "placementIntent": "Visualizes roofing material quantity estimation"
        },
        {
            "insert_after": "## Ridge, Fascia, and Gutter Estimation",
            "id": "media-roofing-accessories-chart",
            "alt": "Reference diagram showing ridge length, fascia/gutter lengths, and fastener count estimation for corrugated roofing systems",
            "caption": "Future diagram: roofing accessory quantities — ridge, fascia, gutter, and fastener estimation",
            "suggestedAsset": "Roof elevation and plan with accessory quantity callouts",
            "placementIntent": "Provides complete roofing quantity estimation reference"
        }
    ],
}

def find_insertion_point(content, marker):
    """Find a section heading or marker text and return its end position."""
    # Try exact text match first
    idx = content.find(marker)
    if idx >= 0:
        # Find end of that paragraph/section
        rest = content[idx:]
        # If marker ends with ##, find next ## or end
        if marker.startswith("##") or marker.startswith("###"):
            next_section = _find_next_section(rest, idx)
            return next_section
        else:
            # Find end of paragraph (next double newline)
            para_end = rest.find("\n\n", len(marker))
            if para_end >= 0:
                return idx + para_end
            return idx + len(rest)
    return None

def _find_next_section(text, offset):
    """Find the end of the current section (before next ## heading or end)."""
    search_from = len(text)
    # Look for next heading of same or higher level
    rest = text
    for heading in ["## ", "### ", "#### "]:
        pos = rest.find(f"\n{heading}")
        if pos >= 0:
            search_from = min(search_from, pos)
    return offset + search_from

def build_media_block(data):
    """Build an ArticleMedia MDX component string."""
    return (
        f'<ArticleMedia id="{data["id"]}" layout="single" type="image" status="placeholder"\n'
        f'  alt="{data["alt"]}"\n'
        f'  caption="{data["caption"]}"\n'
        f'  suggestedAsset="{data["suggestedAsset"]}"\n'
        f'  placementIntent="{data["placementIntent"]}" />'
    )

def process_article(article_dir, insertions):
    """Process a single article directory with its media insertions."""
    slug = os.path.basename(article_dir).split("--")[0]
    norm_path = os.path.join(article_dir, "normalized.md")
    
    with open(norm_path, "r") as f:
        content = f.read()
    
    changes = []
    for ins in insertions:
        marker = ins["insert_after"]
        media_block = build_media_block(ins)
        
        # Find insertion point
        # Find the marker text
        idx = content.find(marker)
        if idx < 0:
            changes.append(f"  ⚠️ Marker not found: '{marker}'")
            continue
        
        # Find end of that section (next heading or double newline)
        rest = content[idx + len(marker):]
        
        # For headings, find next heading
        if marker.startswith("##") or marker.startswith("###"):
            next_heading_pos = -1
            for h in ["\n## ", "\n### ", "\n#### "]:
                p = rest.find(h)
                if p >= 0:
                    if next_heading_pos < 0 or p < next_heading_pos:
                        next_heading_pos = p
            if next_heading_pos >= 0:
                insert_pos = idx + len(marker) + next_heading_pos
            else:
                insert_pos = len(content)
        else:
            # For non-heading markers, find end of paragraph
            para_end = rest.find("\n\n")
            if para_end >= 0:
                insert_pos = idx + len(marker) + para_end
            else:
                insert_pos = len(content)
        
        # Insert the media block
        insertion_text = f"\n\n{media_block}\n"
        content = content[:insert_pos] + insertion_text + content[insert_pos:]
        
        # Check if already has an ArticleMedia block with this id
        if f'id="{ins["id"]}"' in content:
            changes.append(f"  ⚠️ Already exists: {ins['id']}")
            continue
        
        changes.append(f"  ✅ Inserted: {ins['id']}")
    
    # Write back
    with open(norm_path, "w") as f:
        f.write(content)
    
    return changes

def main():
    all_results = {}
    total_articles = 0
    total_media = 0
    errors = []
    
    for article_dir in sorted(os.listdir(BASE)):
        full_path = os.path.join(BASE, article_dir)
        if not os.path.isdir(full_path):
            continue
        if not article_dir.startswith("lea-matl-"):
            continue
        
        slug = article_dir.split("--")[0]
        total_articles += 1
        
        if slug in INSERTIONS:
            insertions = INSERTIONS[slug]
            changes = process_article(full_path, insertions)
            inserted = sum(1 for c in changes if "✅" in c)
            total_media += inserted
            all_results[slug] = changes
        else:
            errors.append(f"  ❌ No insertions defined for {slug}")
    
    # Report
    print("=" * 60)
    print(f"ArticleMedia Insertion Report — lea-matl-*")
    print(f"Articles processed: {total_articles}")
    print(f"Total media blocks inserted: {total_media}")
    print("=" * 60)
    
    for slug, changes in sorted(all_results.items()):
        print(f"\n{slug}:")
        for c in changes:
            print(c)
    
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for e in errors:
            print(e)
    
    # Generate manifest entry
    manifest = {
        "batch": "lea-matl-materials-articles",
        "date": "2026-05-04",
        "articles_processed": total_articles,
        "media_inserted": total_media,
        "categories": "wood, masonry, metals, glass, concrete, formwork, roofing, finishes, hardware, fasteners, specifications, quantity estimation"
    }
    manifest_path = os.path.join(os.path.dirname(BASE), "media-placeholder-manifest.json")
    try:
        with open(manifest_path, "r") as f:
            existing = json.load(f)
        existing["entries"].append(manifest)
        existing["total_articles_processed"] += total_articles
        existing["total_media_blocks"] += total_media
        with open(manifest_path, "w") as f:
            json.dump(existing, f, indent=2)
        print(f"\n✅ Manifest updated: {manifest_path}")
    except Exception as e:
        print(f"\n⚠️ Could not update manifest: {e}")

if __name__ == "__main__":
    main()
