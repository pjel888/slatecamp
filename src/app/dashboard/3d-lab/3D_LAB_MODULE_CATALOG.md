# 3D Lab — Module Catalog

_Generated: 2026-03-31 | Source: `_config/moduleRegistry.ts` · 187 modules across 15 subject areas_

---

## Template Type Legend

| Symbol | Template Type | Description |
|--------|--------------|-------------|
| `⚙` | `parametric` | Slider-driven procedural geometry, real-time compliance feedback |
| `💥` | `exploded` | Animated part explosion, interactive assembly breakdown |
| `✂` | `cutaway` | Cross-section visualization with layer fade control |
| `▶` | `animated` | Step-by-step fade-in construction/process sequence |
| `🗺` | `floorplan` | 2D floor plan in 3D space with egress/circulation overlays |

---

## Quick Stats

| Subject Area | Count |
|---|---|
| History of Architecture | 33 |
| PD 1096 — National Building Code | 28 |
| RA 9514 — Fire Code | 18 |
| NSCP — Structural Code | 16 |
| BP 344 — Accessibility | 14 |
| NPCP — Plumbing Code | 14 |
| Construction Assemblies | 15 |
| Building Materials | 12 |
| PEC — Electrical Code | 10 |
| Urban Planning & Design | 9 |
| PMEC — Mechanical Code | 8 |
| Housing Laws (PD 957 / BP 220) | 4 |
| Specifications | 2 |
| Estimating | 2 |
| Professional Practice | 2 |
| **Total** | **187** |

---

## Top 10 Priority Modules

These are the highest-priority modules with full LEA question sets and multi-phase support.

| # | Title | ID | Type | Subject | Code Ref |
|---|-------|-----|------|---------|----------|
| 1 | Stairway Configurator | `stairway-configurator` | ⚙ parametric | PD 1096 | PD 1096 Rule VIII |
| 2 | Fire Travel Distance | `fire-travel-distance` | 🗺 floorplan | RA 9514 | RA 9514 Rule 10 |
| 3 | Ramp & Accessible Toilet | `ramp-accessible-toilet` | ⚙ parametric | BP 344 | BP 344 |
| 4 | Classical Orders Comparison | `classical-orders-comparison` | 💥 exploded | History | — |
| 5 | NBCP Building Envelope | `nbcp-envelope` | ⚙ parametric | PD 1096 | PD 1096 Rule VII |
| 6 | Structural Load Path | `structural-load-path` | ▶ animated | NSCP | NSCP |
| 7 | Plumbing Fixture Cutaway | `plumbing-fixture-cutaway` | ✂ cutaway | NPCP | NPCP |
| 8 | Seismic Parameter Map | `seismic-parameter-map` | ⚙ parametric | NSCP | NSCP Chapter 2 |
| 9 | Bahay na Bato | `bahay-na-bato` | 💥 exploded | History | — |
| 10 | Construction Sequence: Foundation | `construction-sequence-foundation` | ▶ animated | Materials | — |

---

## 1. PD 1096 — National Building Code (28 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Stairway Configurator ★ | `stairway-configurator` | ⚙ | PD 1096 Rule VIII | Configure stair geometry and verify code compliance for rise, run, headroom, and handrails. |
| NBCP Building Envelope ★ | `nbcp-envelope` | ⚙ | PD 1096 Rule VII | Interactive building envelope with FAR, setbacks, BHL, and firewall effects. |
| Occupancy Classification | `occupancy-classification` | ⚙ | PD 1096 Rule V | Interactive occupancy type selector showing allowed building uses and mixed occupancy rules. |
| Corridor Width Calculator | `corridor-width-calculator` | ⚙ | PD 1096 Rule VIII | Parametric corridor showing minimum widths based on occupant load. |
| Light & Ventilation Openings | `light-ventilation-openings` | ⚙ | PD 1096 Rule VIII | Room configurator validating window-to-floor area ratios. |
| Parking Layout | `parking-layout` | 🗺 | PD 1096 Rule VIII | Floor plan with parking stall dimensions and aisle widths. |
| Ceiling Height Configurator | `ceiling-height-configurator` | ⚙ | PD 1096 Rule VIII | Room ceiling heights: natural vent 2.70m, artificial 2.40m, multi-storey mode. |
| Development Controls: PSO / TGFA / AMBF | `development-controls-pso` | ⚙ | PD 1096 Rule VII | PSO/TGFA/AMBF lot calculator with zoning input. |
| Court Requirements | `court-requirements` | ⚙ | PD 1096 Rule VIII | Court dimensions: 2.00m min, +300mm per storey above 2nd. |
| Vent Shaft Dimensions | `vent-shaft-dimensions` | ⚙ | PD 1096 Rule VIII | 0.10 sq.m/m height, 600mm min dimension vent shaft requirements. |
| Mezzanine Clearances | `mezzanine-clearances` | ✂ | PD 1096 Rule VIII | 1.80m clear above and below mezzanine. |
| Firewall Construction | `firewall-construction` | ✂ | PD 1096 Rule VII | 2-hour rating firewall extending 400mm above roof. |
| Construction Types Comparison | `construction-types-comparison` | 💥 | PD 1096 Rule V | Types I–V fire resistance ratings comparison. |
| Parking Slot Dimensions | `parking-slot-dimensions` | ⚙ | PD 1096 Rule VIII | Car 2.50×5.00m, parallel 2.15×6.00m, truck 3.60×12.00m, PWD 3.70×5.00m. |
| Handrail Requirements | `handrail-requirements` | ⚙ | PD 1096 Rule VIII | 800–900mm height, 38mm wall clearance, intermediate rails. |
| Room Size Minimums | `room-size-minimums` | ⚙ | PD 1096 Rule VIII | Habitable 6.00sqm (2.00m min), kitchen 3.00sqm, bath 1.20sqm. |
| Building Height Limits | `building-height-limits` | ⚙ | PD 1096 Rule VII | Height limits by construction type and zoning classification. |
| Fire Resistance Ratings | `fire-resistance-ratings` | ⚙ | PD 1096 Rule V | Bearing wall/frame/floor/roof ratings by construction type. |
| Mixed Occupancy Separator | `mixed-occupancy-separator` | ✂ | PD 1096 Rule V | Separation requirements between different occupancy classifications. |
| Natural Ventilation Rules | `natural-ventilation-rules` | ⚙ | PD 1096 Rule VIII | Opening sizes and placement for natural ventilation. |
| Carport Abutment Rules | `carport-abutment-rules` | ⚙ | PD 1096 Rule VII | Max 3.20m high, perforated blocks above 1.50m. |
| Open Space Requirements | `open-space-requirements` | ⚙ | PD 1096 Rule VII | TOSL 15–50% by zoning classification. |
| Exit Width Calculator | `exit-width-calculator` | ⚙ | PD 1096 Rule VIII | Exit width calculation by occupant load. |
| Ramp Gradient (Building Code) | `ramp-gradient-building` | ⚙ | PD 1096 Rule VIII | Building code ramp gradient requirements. |
| Skylight Requirements | `skylight-requirements` | ⚙ | PD 1096 Rule VIII | Skylight area and placement rules. |
| Attic Requirements | `attic-requirements` | ⚙ | PD 1096 Rule VIII | Attic access, height, and structural requirements. |
| Garage Ventilation | `garage-ventilation` | ⚙ | PD 1096 Rule VIII | Mechanical ventilation requirements for parking garages. |
| Balcony Guardrail | `balcony-guardrail` | ⚙ | PD 1096 Rule VIII | Guard rail height and spacing requirements. |

---

## 2. RA 9514 — Fire Code (18 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Fire Travel Distance ★ | `fire-travel-distance` | 🗺 | RA 9514 Rule 10 | Visualize maximum travel distances to exits with animated egress paths. |
| Fire Exit Layout | `fire-exit-layout` | 🗺 | RA 9514 Rule 10 | Floor plan showing exit placement, width, and remoteness requirements. |
| Fire Zone Classification | `fire-zone-classification` | 🗺 | RA 9514 Rule 7 | Interactive fire zone map with allowable areas and construction types. |
| Sprinkler System Layout | `sprinkler-layout` | 🗺 | RA 9514 Rule 11 | Sprinkler coverage plan showing spacing, coverage area, and pipe sizing. |
| Occupant Load Calculator | `occupant-load-calculator` | 🗺 | RA 9514 Rule 10 | OLF by use type: assembly 0.65sqm, office 9.30sqm, etc. |
| Exit Door Mechanics | `exit-door-mechanics` | ▶ | RA 9514 Rule 10 | Min 710mm clear width, swing direction, and panic hardware. |
| Stairwell Enclosure | `stairwell-enclosure` | ✂ | RA 9514 Rule 10 | 1-hour ≤3 storeys, 2-hour 4+, self-closing doors. |
| Fire Suppression Overview | `fire-suppression-overview` | ✂ | RA 9514 Rule 11 | Sprinkler/standpipe building section overview. |
| Smoke Control Systems | `smoke-control-systems` | ▶ | RA 9514 Rule 11 | Stairwell pressurization, 91.5 m/min downdraft. |
| Fire Detection Layout | `fire-detection-layout` | 🗺 | RA 9514 Rule 11 | Smoke/heat detector placement and spacing. |
| Standpipe Classes | `standpipe-classes` | ✂ | RA 9514 Rule 11 | Class I (2½"), II (1½"), III combined comparison. |
| Fire Alarm System | `fire-alarm-system` | 🗺 | RA 9514 Rule 11 | Pull station, horn/strobe layout. |
| Fire Extinguisher Placement | `fire-extinguisher-placement` | 🗺 | RA 9514 Rule 11 | Travel distance requirements for fire extinguisher placement. |
| Emergency Lighting Layout | `emergency-lighting-layout` | 🗺 | RA 9514 Rule 10 | Emergency illumination placement. |
| Refuge Area Design | `refuge-area-design` | 🗺 | RA 9514 Rule 10 | Area of refuge dimensions and placement. |
| Smoke Partition Requirements | `smoke-partition-requirements` | ✂ | RA 9514 Rule 11 | Smoke barrier construction details. |
| Fire Door Ratings | `fire-door-ratings` | ✂ | RA 9514 Rule 10 | 20min/45min/1hr/1.5hr/3hr fire door comparison. |
| Horizontal Exit Design | `horizontal-exit-design` | 🗺 | RA 9514 Rule 10 | Horizontal exit requirements. |

---

## 3. BP 344 — Accessibility (14 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Ramp & Accessible Toilet ★ | `ramp-accessible-toilet` | ⚙ | BP 344 | Configure accessible ramp slope and toilet clearances per BP 344. |
| Accessible Parking | `accessible-parking` | 🗺 | BP 344 | Accessible parking stall layout with access aisle and signage placement. |
| Accessible Elevator | `elevator-dimensions` | ⚙ | BP 344 | Elevator car dimensions and door clearances per accessibility standards. |
| Wheelchair Maneuvering | `wheelchair-maneuvering` | ⚙ | BP 344 §4 | 1500mm turning circle, 1800mm turnabout, corridor widths. |
| Accessible Toilet (Detailed) | `accessible-toilet-detailed` | ✂ | BP 344 §6 | 1800×1800mm cubicle, grab bars, 450mm seat height. |
| Tactile Block Types | `tactile-block-types` | 💥 | BP 344 §5 | Directional (4 bars), warning (5×5 domes), positional (staggered). |
| Accessible Door Clearances | `accessible-door-clearances` | ⚙ | BP 344 §5 | Door approach clearances by door type. |
| Accessible Elevator Cab | `accessible-elevator-cab` | ⚙ | BP 344 §7 | 1200×1400mm clear, 900mm door, controls 900–1200mm. |
| Ramp Tactile Warnings | `ramp-tactile-warnings` | ⚙ | BP 344 §5 | 600mm tactile blocks, 300mm from ramp ends. |
| Accessible Signage | `accessible-signage` | ⚙ | BP 344 §8 | Height, size, and Braille placement requirements. |
| Accessible Counter Heights | `accessible-counter-heights` | ⚙ | BP 344 §6 | Service counter dimensions for wheelchair users. |
| Accessible Corridor Widths | `accessible-corridor-widths` | ⚙ | BP 344 §5 | 1500mm single+ambulant, 1800mm two wheelchairs. |
| Accessible Bathing | `accessible-bathing` | ✂ | BP 344 §6 | Roll-in shower and tub clearances. |
| Accessible Stair Handrails | `accessible-stair-handrails` | ⚙ | BP 344 §5 | Nosing contrast, dual handrails, extensions. |

---

## 4. History of Architecture (33 modules)

### Classical Orders

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Classical Orders Comparison ★ | `classical-orders-comparison` | 💥 | Exploded view comparing Doric, Ionic, and Corinthian column orders. |
| Tuscan Order | `tuscan-order` | 💥 | 1:7 column ratio with smooth unfluted shaft, simple echinus and abacus capital, and plain frieze. |
| Doric Order | `doric-order` | 💥 | 1:8 column ratio with 20 sharp-arris flutes, triglyphs and metopes in the frieze, and mutules in the cornice. |
| Ionic Order | `ionic-order` | 💥 | 1:9 column ratio with 24 flutes separated by fillets, distinctive volute scroll capital, and dentils in the cornice. |
| Corinthian Order | `corinthian-order` | 💥 | 1:10 column ratio with two rows of acanthus leaves and caulicoli, dentils and modillions in the entablature. |
| Composite Order | `composite-order` | 💥 | 1:10 column ratio combining Ionic volute scrolls with Corinthian acanthus leaf capital ornamentation. |
| Superposition of Orders | `superposition-demo` | ▶ | Colosseum-style stacking: Doric on ground storey, Ionic on second, Corinthian on third. |
| Colossal Order (Giant Order) | `colossal-order` | 💥 | Multi-storey column spanning two or more floors, as used by Michelangelo at St. Peter's. |

### Structural Evolution Timeline

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Egyptian Post-and-Lintel System | `egyptian-post-lintel` | ✂ | Hypostyle hall with dense papyrus and lotus capitals, massive load-bearing columns, and monumental stone pylons. |
| Greek Peristyle Temple | `greek-peristyle-temple` | 💥 | Peristyle colonnade with entasis column swelling, curved stylobate, and optical refinements. |
| Roman Arch and Vault Systems | `roman-arch-vault` | ✂ | Progression from semicircular arch to barrel vault, groin vault, and hemispherical dome using Roman concrete. |
| Byzantine Pendentive System | `byzantine-pendentive` | ✂ | Triangular spherical pendentives transitioning a square floor plan to a circular drum for dome support. |
| Romanesque Barrel Vault | `romanesque-barrel-vault` | ✂ | Continuous semicircular barrel vault requiring massive load-bearing walls and limiting window openings. |
| Gothic Structural System | `gothic-structural-system` | ✂ | Pointed arch, ribbed vault, and flying buttress working together to redirect lateral thrust and enable large windows. |
| Gothic Ribbed Vault | `gothic-ribbed-vault` | 💥 | Exploded view of Gothic ribbed vault showing ribs, webbing, and keystone. |
| Renaissance Double-Shell Dome | `renaissance-dome-construction` | ✂ | Brunelleschi's double-shell self-supporting dome with herringbone brickwork and tension rings. |
| Le Corbusier's Five Points of Architecture | `modernism-five-points` | 💥 | Pilotis, free plan, free facade, horizontal ribbon windows, and roof garden. |
| Contemporary Parametric Architecture | `contemporary-parametric` | ✂ | Parametric geometry generation, digital fabrication workflows, and complex non-standard structural forms. |

### World Landmark Structures

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Roman Pantheon | `pantheon-cutaway` | ✂ | 43.3m unreinforced concrete dome with coffered interior, oculus skylight, and varying aggregate density. |
| Hagia Sophia Structural Section | `hagia-sophia-section` | ✂ | 32m main dome at 55m height supported by pendentives, with 40 base windows creating a ring of light. |
| Notre-Dame de Paris Section | `notre-dame-section` | ✂ | Flying buttresses transferring roof vault thrust outward, enabling thinner walls and expansive stained glass. |
| Florence Cathedral Dome (Duomo) | `florence-cathedral-dome` | ✂ | 42m span dome with 8 major and 16 minor stone ribs, herringbone brickwork, no exterior centering. |
| Guggenheim Museum Bilbao | `guggenheim-bilbao` | ✂ | Steel structural frame with CATIA-modeled titanium cladding panels demonstrating parametric digital design. |

### Philippine Heritage

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Bahay na Bato ★ | `bahay-na-bato` | 💥 | Exploded assembly of the traditional Filipino stone house showing structural layers. |
| Bahay Kubo | `bahay-kubo` | 💥 | Exploded assembly of the traditional nipa hut structural system. |
| Earthquake Baroque Church (Paoay) | `earthquake-baroque-church` | ✂ | Massive stepped side buttresses, lower proportions, and thickened walls for Philippine seismic resistance. |
| Vigan Heritage House | `vigan-heritage-house` | 💥 | Coral stone variant of Bahay na Bato with Ilocano details: capiz shell windows, zaguan, and camarin. |
| Manila Art Deco Architecture | `art-deco-manila` | ✂ | Tropical Art Deco detailing on Manila landmarks including Metropolitan Theater and FEU campus buildings. |
| Cultural Center of the Philippines (Locsin) | `locsin-cultural-center` | ✂ | Leandro Locsin's CCP: brutalist floating volume on a recessed base expressing a platform hovering above ground. |
| Manila Cathedral Section | `manila-cathedral-section` | ✂ | Neo-Romanesque and Byzantine revival cathedral, eighth reconstruction after earthquake and war damage. |
| Ifugao Fale (Traditional House) | `ifugao-house` | 💥 | Cordillera elevated house with steep thatched pyramid roof, four posts with rat guards (payong). |
| Ivatan Stone House (Batanes) | `ivatan-stone-house` | 💥 | Typhoon-resistant Batanes vernacular: massive limestone walls, thick cogon thatch, and low-profile form. |
| San Agustin Church (Intramuros) | `san-agustin-church` | ✂ | Oldest stone church in the Philippines: Baroque facade, massive lateral buttresses, and trompe-l'oeil interior. |

---

## 5. NSCP — Structural Code (16 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Structural Load Path ★ | `structural-load-path` | ▶ | NSCP | Animated sequence showing gravity and lateral load paths through a structure. |
| Seismic Parameter Map ★ | `seismic-parameter-map` | ⚙ | NSCP Chapter 2 | Interactive seismic zone map with base shear parameter visualization. |
| Beam Stress Diagram | `beam-stress-diagram` | ⚙ | NSCP | Interactive beam showing shear and moment diagrams under various loading. |
| Column Interaction Diagram | `column-interaction-diagram` | ⚙ | NSCP | P-M interaction diagram for reinforced concrete column design. |
| LRFD Load Combinations | `lrfd-load-combinations` | ▶ | NSCP §203 | 7 LRFD combinations as stacked visual overlays with colored force arrows. |
| Dead & Live Load Toggles | `dead-live-load-toggles` | ⚙ | NSCP §205 | Load values by occupancy: residential 1.9kPa, office 2.4kPa, retail 4.8kPa. |
| Soil Profile Cutaway | `soil-profile-cutaway` | ✂ | NSCP §208 | SA hard rock through SF soft soil with Vs values. |
| Wind Load Analysis | `wind-load-analysis` | ⚙ | NSCP §207 | 200–280kph basic wind speed, exposure B/C/D, pressure distribution. |
| RC Cover Requirements | `rc-cover-requirements` | ✂ | NSCP §407 | 75mm earth-cast, 50mm weather-exposed, 40mm beam/column, 20mm slab. |
| Rebar Sizes Catalog | `rebar-sizes-catalog` | 💥 | NSCP §403 | Philippine standard 10mm (0.617kg/m) through 32mm (6.313kg/m). |
| Steel Connections | `steel-connections` | 💥 | NSCP §510 | Bolted vs welded, moment vs shear connections comparison. |
| Structural Systems Comparison | `structural-systems-comparison` | ⚙ | NSCP §208 | R-factor: Special SMRF 8.5, Ordinary MRF 3.5, Bearing wall 4.5–6.5. |
| Concrete Density Values | `concrete-density-values` | ⚙ | NSCP §204 | RC 23.6kN/m³, steel 77.0kN/m³, material densities for dead load. |
| Near-Source Factors | `near-source-factors` | ⚙ | NSCP §208 | Na and Nv as distance rings from fault lines. |
| Seismic Zone Map | `seismic-zone-map` | ⚙ | NSCP §208 | Zone 2 (Z=0.20) vs Zone 4 (Z=0.40) Philippine map. |
| Base Shear Calculator | `base-shear-calculator` | ⚙ | NSCP §208 | V = CvI·W/(R·T) seismic base shear calculation. |

---

## 6. NPCP — Plumbing Code (14 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Plumbing Fixture Cutaway ★ | `plumbing-fixture-cutaway` | ✂ | NPCP | Cutaway section of plumbing fixtures showing trap, vent, and drain connections. |
| Drainage System Cutaway | `drainage-system-cutaway` | ✂ | NPCP | Cutaway of building drainage showing soil, waste, and vent stacks. |
| Water Supply Riser | `water-supply-riser` | ✂ | NPCP | Cutaway of water supply riser system showing pipe sizing and pressure zones. |
| Pipe Slope Visualization | `pipe-slope-visualization` | ✂ | NPCP §7 | Pipes ≥100mm at 1% slope, ≤75mm at 2% slope. |
| Septic Tank Design | `septic-tank-design` | ⚙ | NPCP §11 | Bedroom-count slider: 1–2 BR→2.84m³, 3 BR→3.79m³. |
| Backflow Prevention | `backflow-prevention` | 💥 | NPCP §6 | Air gaps, vacuum breakers, check valves, RPZ devices. |
| Fixture Unit Values | `fixture-unit-values` | ⚙ | NPCP §7 | WC 4 DFU, lavatory 1 DFU, kitchen sink 2 DFU by type. |
| Trap Seal Depth | `trap-seal-depth` | ✂ | NPCP §7 | 51–102mm seal range, trap sizes by fixture (32mm–76mm). |
| Vent Pipe Routing | `vent-pipe-routing` | ✂ | NPCP §9 | Diameter ≥ half drain, max 1/3 horizontal, graded to drip back. |
| Grease Trap Detail | `grease-trap-detail` | ✂ | NPCP §10 | Commercial kitchen grease interceptor with baffles. |
| Water Meter Assembly | `water-meter-assembly` | 💥 | NPCP §6 | Service pipe to meter to main distribution connection. |
| Building Sewer Minimum | `building-sewer-minimum` | ✂ | NPCP §11 | 150mm minimum diameter building sewer. |
| Hot Water System | `hot-water-system` | ✂ | NPCP §6 | Water heater, expansion tank, tempering valve, recirculation. |
| Storm Drainage System | `storm-drainage-system` | ✂ | NPCP §11 | Roof drain, leader, storm sewer sizing. |

---

## 7. Construction Assemblies (15 modules)

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Construction Sequence: Foundation ★ | `construction-sequence-foundation` | ▶ | Step-by-step animated construction sequence from excavation to foundation completion. |
| Wall Types Comparison | `wall-types-comparison` | ✂ | Solid CHB, cavity wall, veneer wall, curtain wall, and drywall in section. |
| Foundation Types | `foundation-types` | 💥 | Isolated, combined, strip, mat/raft, driven pile, and bored pile foundations. |
| Roof Truss — Fink (W-Web) | `roof-truss-fink` | 💥 | Fink/W-web truss for residential spans to 10m with purlin details. |
| Roof Truss — Pratt | `roof-truss-pratt` | 💥 | Pratt truss with diagonals in tension toward the center. |
| Roof Truss — Howe | `roof-truss-howe` | 💥 | Howe truss with diagonals in compression away from center. |
| Roof Truss — Warren | `roof-truss-warren` | 💥 | Warren truss with equilateral triangles, no vertical members. |
| Roof Truss — King Post | `roof-truss-king-post` | 💥 | King post truss for short spans up to 8m. |
| Roof Truss — Queen Post | `roof-truss-queen-post` | 💥 | Queen post truss for medium spans 8–12m. |
| Column Construction Sequence | `column-construction-sequence` | ▶ | Vertical bars → lateral ties → formwork → pour → cure → strip at 21 days. |
| Beam Construction Sequence | `beam-construction-sequence` | ▶ | Shoring → stringers → formwork → rebar placement → pour → cure. |
| Slab Construction Sequence | `slab-construction-sequence` | ▶ | Shoring → formply → bottom rebar → bar chairs → top rebar → MEP sleeves → pour → cure. |
| CHB Wall Construction Sequence | `chb-wall-construction` | ▶ | Layout → dry first course → mortar bed → running bond → rebar → grout every 5 layers → lintels. |
| Formwork Assembly | `formwork-assembly` | 💥 | Formply 18mm panels, props, stringers, and walers assembly. |
| Plastering Layers | `plastering-layers` | ✂ | Scratch coat and finish coat layers, 12–16mm per side. |
| Lintel Over Opening | `lintel-over-opening` | ✂ | Reinforced concrete lintel detail showing rebar, bearing length over door/window openings. |

---

## 8. Building Materials (12 modules)

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Concrete Mix Proportions | `concrete-mix-proportions` | ⚙ | Interactive concrete mix design showing aggregate, cement, water ratios. |
| Wall Section Assembly | `wall-section-assembly` | 💥 | Exploded wall section showing layers from exterior finish to interior. |
| CHB Block Types | `chb-block-types` | 💥 | 4" (100×200×400mm), 5" (125mm), 6" (150mm), 8" (200mm) at actual scale, 12.5 pcs/sqm. |
| Bond Pattern Comparison | `bond-pattern-comparison` | 💥 | Running, stack, Flemish, and English bond patterns side by side. |
| Standard Material Sheets | `standard-material-sheets` | 💥 | Plywood 1220×2440mm at 6/9/12/18mm; gypsum board at 9.5/12.5/16mm. |
| Rebar Catalog | `rebar-catalog` | 💥 | 8mm (0.395kg/m) through 36mm (7.990kg/m) deformed bars at 6.0m lengths. |
| Steel Sections Catalog | `steel-sections-catalog` | 💥 | Wide flange W150×14 to W460×74, C-channels, angle bars, C-purlins. |
| Lumber Sizes | `lumber-sizes` | 💥 | Standard Philippine lumber dimensions and grades, nominal vs actual. |
| Waterproofing Systems | `waterproofing-systems` | ✂ | Membrane (torch-applied), cementitious, crystalline, and liquid-applied layers. |
| Mortar Joint Types | `mortar-joint-types` | ✂ | Concave, V-joint, flush, raked, and struck mortar joint profiles in CHB wall. |
| Concrete Aggregate Visualizer | `concrete-aggregate-visualizer` | ⚙ | Aggregate, cement, and water proportional volumes by concrete class. |
| Concrete Density Values | `concrete-density-values` | ⚙ | RC 23.6kN/m³, steel 77.0kN/m³, material densities for dead load. |

---

## 9. PEC — Electrical Code (10 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Panel Board Layout | `panel-board-layout` | ✂ | PEC | Cutaway of electrical panel showing breaker arrangement and wire sizing. |
| Lighting Layout | `lighting-layout` | 🗺 | PEC | Floor plan showing lighting fixture placement and lux level calculations. |
| Grounding System | `grounding-system` | ✂ | PEC | Cutaway showing grounding electrode system and bonding connections. |
| Outlet Spacing in Room | `outlet-spacing-room` | 🗺 | PEC §2.10 | No point >1.8m from outlet, coverage rings, ≥600mm wall rule. |
| Mounting Heights | `mounting-heights` | ⚙ | PEC §2.10 | Outlet 300mm, switch 1200mm, panel max 1980mm. |
| Circuit Conductor Sizing | `circuit-conductor-sizing` | ✂ | PEC §2.10 | 15A/2.0mm², 20A/3.5mm², 30A/5.5mm², voltage drop ≤3%. |
| Illumination Levels | `illumination-levels` | 🗺 | PEC §4 | Office 300–500 lux, classroom 300–500, corridor 100–200, OR 300–1000. |
| GFCI Protection Zones | `gfci-protection-zones` | 🗺 | PEC §2.10 | Kitchen, bathroom, outdoor, garage, laundry GFCI zones. |
| Emergency Power System | `emergency-power-system` | 🗺 | PEC §7 | Generator, ATS, emergency circuit layout. |
| Electrical Room Context | `electrical-room-context` | ⚙ | PEC §2.10 | Full room showing outlet/switch/panel placement. |

---

## 10. Urban Planning & Design (9 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Zoning Setback Overlay | `zoning-setback-overlay` | 🗺 | — | Site plan overlay showing setback lines, easements, and buildable area. |
| Site Circulation Analysis | `site-circulation-analysis` | 🗺 | — | Site plan with vehicular and pedestrian circulation paths and conflict points. |
| CLUP Zoning Overlay | `clup-zoning-overlay` | 🗺 | — | Comprehensive land use plan zones and permitted uses. |
| Subdivision Layout — PD 957 | `subdivision-layout-pd957` | 🗺 | PD 957 | Open market: 120sqm min lot, 10m major road ROW, open space allocation. |
| Subdivision Layout — BP 220 | `subdivision-layout-bp220` | 🗺 | BP 220 | Socialized housing: 64sqm min lot, 8m major road ROW, open space allocation. |
| PD 957 vs. BP 220 Comparison | `pd957-vs-bp220-comparison` | 🗺 | PD 957 / BP 220 | Side-by-side lot sizes, road widths, and open space requirements. |
| Building Typology — Residential | `building-typology-residential` | ⚙ | — | Residential spatial program: living, sleeping, and service zones. |
| Building Typology — Commercial | `building-typology-commercial` | ⚙ | — | Commercial area allocation: retail, storage, circulation, services. |
| Building Typology — Institutional | `building-typology-institutional` | ⚙ | — | Institutional program: classrooms, clinic, admin, assembly. |

---

## 11. PMEC — Mechanical Code (8 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| HVAC Duct Layout | `hvac-duct-layout` | 🗺 | PMEC | Duct routing plan showing supply, return, and exhaust duct sizing. |
| Split AC Unit Cutaway | `split-ac-cutaway` | ✂ | PMEC | Cutaway of split-type air conditioning showing refrigerant cycle components. |
| Air Changes Per Hour | `air-changes-per-hour` | ▶ | PMEC §4 | Office 3 ACH, kitchen 10 ACH, OR 15–25 ACH with airflow particles. |
| Elevator Hoistway | `elevator-hoistway` | ✂ | PMEC §8 | Min 1100mm cab width, 610mm pit clearance, fire-resistant walls. |
| Escalator Section | `escalator-section` | ✂ | PMEC §8 | Max 30° inclination, 300mm draft curtain, sprinkler spacing. |
| Machine Room Layout | `machine-room-layout` | 🗺 | PMEC §8 | Equipment placement, clearances, ventilation requirements. |
| Cross-Ventilation Analysis | `cross-ventilation-analysis` | ▶ | PMEC §4 | Natural airflow patterns through building openings. |
| Refrigeration Cycle | `refrigeration-cycle` | ▶ | PMEC §5 | Compressor, condenser, expansion valve, evaporator cycle. |

---

## 12. Housing Laws — PD 957 / BP 220 (4 modules)

| Title | ID | Type | Code Ref | Description |
|-------|-----|------|----------|-------------|
| Water Code Easements | `water-code-easements` | 🗺 | PD 1067 | Urban 3m, agricultural 20m, forest 40m waterway setbacks. |
| Shoreline Setback | `shoreline-setback` | 🗺 | PD 1067 | 20m easement from high-water mark on coastal site plan. |
| Fault Line Setback | `fault-line-setback` | 🗺 | PHIVOLCS Guidelines | Minimum 5m buffer zone on either side of active fault line. |
| Housing Open Space Requirements | `housing-open-space` | ⚙ | PD 957 | 3.5–9.0% open space by gross area, +1% per 10 lots above 225. |

---

## 13. Specifications (2 modules)

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| CSI MasterFormat Explorer | `csi-masterformat-explorer` | ⚙ | Interactive CSI division explorer with section detail drill-down. |
| Door Schedule Configurator | `door-schedule-configurator` | ⚙ | Door type selector showing hardware sets, fire ratings, and clearances. |

---

## 14. Estimating (2 modules)

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Quantity Takeoff: Room | `quantity-takeoff-room` | ⚙ | Room configurator computing material quantities for walls, floor, and ceiling. |
| Earthwork Volume Calculator | `earthwork-volume` | ⚙ | Cut-and-fill volume calculator with prismoidal correction. |

---

## 15. Professional Practice (2 modules)

| Title | ID | Type | Description |
|-------|-----|------|-------------|
| Project Delivery Methods | `project-delivery-methods` | ▶ | Animated comparison of Design-Bid-Build, Design-Build, and CM-at-Risk timelines. |
| Contract Document Hierarchy | `contract-document-hierarchy` | 💥 | Exploded view of contract document precedence from agreement to addenda. |

---

## Full Alphabetical Index

| Title | ID | Subject | Type |
|-------|-----|---------|------|
| Accessible Bathing | `accessible-bathing` | BP 344 | ✂ |
| Accessible Corridor Widths | `accessible-corridor-widths` | BP 344 | ⚙ |
| Accessible Counter Heights | `accessible-counter-heights` | BP 344 | ⚙ |
| Accessible Door Clearances | `accessible-door-clearances` | BP 344 | ⚙ |
| Accessible Elevator | `elevator-dimensions` | BP 344 | ⚙ |
| Accessible Elevator Cab | `accessible-elevator-cab` | BP 344 | ⚙ |
| Accessible Parking | `accessible-parking` | BP 344 | 🗺 |
| Accessible Signage | `accessible-signage` | BP 344 | ⚙ |
| Accessible Stair Handrails | `accessible-stair-handrails` | BP 344 | ⚙ |
| Accessible Toilet (Detailed) | `accessible-toilet-detailed` | BP 344 | ✂ |
| Air Changes Per Hour | `air-changes-per-hour` | PMEC | ▶ |
| Attic Requirements | `attic-requirements` | PD 1096 | ⚙ |
| Backflow Prevention | `backflow-prevention` | NPCP | 💥 |
| Bahay Kubo | `bahay-kubo` | History | 💥 |
| Bahay na Bato | `bahay-na-bato` | History | 💥 |
| Balcony Guardrail | `balcony-guardrail` | PD 1096 | ⚙ |
| Base Shear Calculator | `base-shear-calculator` | NSCP | ⚙ |
| Beam Construction Sequence | `beam-construction-sequence` | Construction | ▶ |
| Beam Stress Diagram | `beam-stress-diagram` | NSCP | ⚙ |
| Bond Pattern Comparison | `bond-pattern-comparison` | Materials | 💥 |
| Building Height Limits | `building-height-limits` | PD 1096 | ⚙ |
| Building Sewer Minimum | `building-sewer-minimum` | NPCP | ✂ |
| Building Typology — Commercial | `building-typology-commercial` | Planning | ⚙ |
| Building Typology — Institutional | `building-typology-institutional` | Planning | ⚙ |
| Building Typology — Residential | `building-typology-residential` | Planning | ⚙ |
| Byzantine Pendentive System | `byzantine-pendentive` | History | ✂ |
| Carport Abutment Rules | `carport-abutment-rules` | PD 1096 | ⚙ |
| Ceiling Height Configurator | `ceiling-height-configurator` | PD 1096 | ⚙ |
| CHB Block Types | `chb-block-types` | Materials | 💥 |
| CHB Wall Construction Sequence | `chb-wall-construction` | Construction | ▶ |
| Circuit Conductor Sizing | `circuit-conductor-sizing` | PEC | ✂ |
| Classical Orders Comparison | `classical-orders-comparison` | History | 💥 |
| CLUP Zoning Overlay | `clup-zoning-overlay` | Planning | 🗺 |
| Colossal Order (Giant Order) | `colossal-order` | History | 💥 |
| Column Construction Sequence | `column-construction-sequence` | Construction | ▶ |
| Column Interaction Diagram | `column-interaction-diagram` | NSCP | ⚙ |
| Composite Order | `composite-order` | History | 💥 |
| Concrete Aggregate Visualizer | `concrete-aggregate-visualizer` | Materials | ⚙ |
| Concrete Density Values | `concrete-density-values` | NSCP / Materials | ⚙ |
| Concrete Mix Proportions | `concrete-mix-proportions` | Materials | ⚙ |
| Construction Sequence: Foundation | `construction-sequence-foundation` | Materials | ▶ |
| Construction Types Comparison | `construction-types-comparison` | PD 1096 | 💥 |
| Contemporary Parametric Architecture | `contemporary-parametric` | History | ✂ |
| Contract Document Hierarchy | `contract-document-hierarchy` | Prof. Practice | 💥 |
| Corinthian Order | `corinthian-order` | History | 💥 |
| Corridor Width Calculator | `corridor-width-calculator` | PD 1096 | ⚙ |
| Court Requirements | `court-requirements` | PD 1096 | ⚙ |
| Cross-Ventilation Analysis | `cross-ventilation-analysis` | PMEC | ▶ |
| CSI MasterFormat Explorer | `csi-masterformat-explorer` | Specs | ⚙ |
| Cultural Center of the Philippines (Locsin) | `locsin-cultural-center` | History | ✂ |
| Dead & Live Load Toggles | `dead-live-load-toggles` | NSCP | ⚙ |
| Development Controls: PSO / TGFA / AMBF | `development-controls-pso` | PD 1096 | ⚙ |
| Door Schedule Configurator | `door-schedule-configurator` | Specs | ⚙ |
| Doric Order | `doric-order` | History | 💥 |
| Drainage System Cutaway | `drainage-system-cutaway` | NPCP | ✂ |
| Earthquake Baroque Church (Paoay) | `earthquake-baroque-church` | History | ✂ |
| Earthwork Volume Calculator | `earthwork-volume` | Estimating | ⚙ |
| Egyptian Post-and-Lintel System | `egyptian-post-lintel` | History | ✂ |
| Electrical Room Context | `electrical-room-context` | PEC | ⚙ |
| Emergency Lighting Layout | `emergency-lighting-layout` | RA 9514 | 🗺 |
| Emergency Power System | `emergency-power-system` | PEC | 🗺 |
| Escalator Section | `escalator-section` | PMEC | ✂ |
| Exit Door Mechanics | `exit-door-mechanics` | RA 9514 | ▶ |
| Exit Width Calculator | `exit-width-calculator` | PD 1096 | ⚙ |
| Fault Line Setback | `fault-line-setback` | Housing | 🗺 |
| Fire Alarm System | `fire-alarm-system` | RA 9514 | 🗺 |
| Fire Detection Layout | `fire-detection-layout` | RA 9514 | 🗺 |
| Fire Door Ratings | `fire-door-ratings` | RA 9514 | ✂ |
| Fire Exit Layout | `fire-exit-layout` | RA 9514 | 🗺 |
| Fire Extinguisher Placement | `fire-extinguisher-placement` | RA 9514 | 🗺 |
| Fire Resistance Ratings | `fire-resistance-ratings` | PD 1096 | ⚙ |
| Fire Suppression Overview | `fire-suppression-overview` | RA 9514 | ✂ |
| Fire Travel Distance | `fire-travel-distance` | RA 9514 | 🗺 |
| Fire Zone Classification | `fire-zone-classification` | RA 9514 | 🗺 |
| Firewall Construction | `firewall-construction` | PD 1096 | ✂ |
| Fixture Unit Values | `fixture-unit-values` | NPCP | ⚙ |
| Florence Cathedral Dome (Duomo) | `florence-cathedral-dome` | History | ✂ |
| Formwork Assembly | `formwork-assembly` | Construction | 💥 |
| Foundation Types | `foundation-types` | Construction | 💥 |
| Garage Ventilation | `garage-ventilation` | PD 1096 | ⚙ |
| GFCI Protection Zones | `gfci-protection-zones` | PEC | 🗺 |
| Gothic Ribbed Vault | `gothic-ribbed-vault` | History | 💥 |
| Gothic Structural System | `gothic-structural-system` | History | ✂ |
| Grease Trap Detail | `grease-trap-detail` | NPCP | ✂ |
| Greek Peristyle Temple | `greek-peristyle-temple` | History | 💥 |
| Grounding System | `grounding-system` | PEC | ✂ |
| Guggenheim Museum Bilbao | `guggenheim-bilbao` | History | ✂ |
| Hagia Sophia Structural Section | `hagia-sophia-section` | History | ✂ |
| Handrail Requirements | `handrail-requirements` | PD 1096 | ⚙ |
| Horizontal Exit Design | `horizontal-exit-design` | RA 9514 | 🗺 |
| Hot Water System | `hot-water-system` | NPCP | ✂ |
| Housing Open Space Requirements | `housing-open-space` | Housing | ⚙ |
| HVAC Duct Layout | `hvac-duct-layout` | PMEC | 🗺 |
| Ifugao Fale (Traditional House) | `ifugao-house` | History | 💥 |
| Illumination Levels | `illumination-levels` | PEC | 🗺 |
| Ionic Order | `ionic-order` | History | 💥 |
| Ivatan Stone House (Batanes) | `ivatan-stone-house` | History | 💥 |
| Le Corbusier's Five Points of Architecture | `modernism-five-points` | History | 💥 |
| Light & Ventilation Openings | `light-ventilation-openings` | PD 1096 | ⚙ |
| Lighting Layout | `lighting-layout` | PEC | 🗺 |
| Lintel Over Opening | `lintel-over-opening` | Construction | ✂ |
| LRFD Load Combinations | `lrfd-load-combinations` | NSCP | ▶ |
| Lumber Sizes | `lumber-sizes` | Materials | 💥 |
| Machine Room Layout | `machine-room-layout` | PMEC | 🗺 |
| Manila Art Deco Architecture | `art-deco-manila` | History | ✂ |
| Manila Cathedral Section | `manila-cathedral-section` | History | ✂ |
| Mezzanine Clearances | `mezzanine-clearances` | PD 1096 | ✂ |
| Mixed Occupancy Separator | `mixed-occupancy-separator` | PD 1096 | ✂ |
| Mortar Joint Types | `mortar-joint-types` | Materials | ✂ |
| Mounting Heights | `mounting-heights` | PEC | ⚙ |
| Natural Ventilation Rules | `natural-ventilation-rules` | PD 1096 | ⚙ |
| NBCP Building Envelope | `nbcp-envelope` | PD 1096 | ⚙ |
| Near-Source Factors | `near-source-factors` | NSCP | ⚙ |
| Notre-Dame de Paris Section | `notre-dame-section` | History | ✂ |
| Occupancy Classification | `occupancy-classification` | PD 1096 | ⚙ |
| Occupant Load Calculator | `occupant-load-calculator` | RA 9514 | 🗺 |
| Open Space Requirements | `open-space-requirements` | PD 1096 | ⚙ |
| Outlet Spacing in Room | `outlet-spacing-room` | PEC | 🗺 |
| Panel Board Layout | `panel-board-layout` | PEC | ✂ |
| Parking Layout | `parking-layout` | PD 1096 | 🗺 |
| Parking Slot Dimensions | `parking-slot-dimensions` | PD 1096 | ⚙ |
| PD 957 vs. BP 220 Comparison | `pd957-vs-bp220-comparison` | Planning | 🗺 |
| Pipe Slope Visualization | `pipe-slope-visualization` | NPCP | ✂ |
| Plastering Layers | `plastering-layers` | Construction | ✂ |
| Plumbing Fixture Cutaway | `plumbing-fixture-cutaway` | NPCP | ✂ |
| Project Delivery Methods | `project-delivery-methods` | Prof. Practice | ▶ |
| Quantity Takeoff: Room | `quantity-takeoff-room` | Estimating | ⚙ |
| Ramp & Accessible Toilet | `ramp-accessible-toilet` | BP 344 | ⚙ |
| Ramp Gradient (Building Code) | `ramp-gradient-building` | PD 1096 | ⚙ |
| Ramp Tactile Warnings | `ramp-tactile-warnings` | BP 344 | ⚙ |
| RC Cover Requirements | `rc-cover-requirements` | NSCP | ✂ |
| Rebar Catalog | `rebar-catalog` | Materials | 💥 |
| Rebar Sizes Catalog | `rebar-sizes-catalog` | NSCP | 💥 |
| Refrigeration Cycle | `refrigeration-cycle` | PMEC | ▶ |
| Refuge Area Design | `refuge-area-design` | RA 9514 | 🗺 |
| Renaissance Double-Shell Dome | `renaissance-dome-construction` | History | ✂ |
| Roman Arch and Vault Systems | `roman-arch-vault` | History | ✂ |
| Romanesque Barrel Vault | `romanesque-barrel-vault` | History | ✂ |
| Roman Pantheon | `pantheon-cutaway` | History | ✂ |
| Roof Truss — Fink (W-Web) | `roof-truss-fink` | Construction | 💥 |
| Roof Truss — Howe | `roof-truss-howe` | Construction | 💥 |
| Roof Truss — King Post | `roof-truss-king-post` | Construction | 💥 |
| Roof Truss — Pratt | `roof-truss-pratt` | Construction | 💥 |
| Roof Truss — Queen Post | `roof-truss-queen-post` | Construction | 💥 |
| Roof Truss — Warren | `roof-truss-warren` | Construction | 💥 |
| Room Size Minimums | `room-size-minimums` | PD 1096 | ⚙ |
| San Agustin Church (Intramuros) | `san-agustin-church` | History | ✂ |
| Seismic Parameter Map | `seismic-parameter-map` | NSCP | ⚙ |
| Seismic Zone Map | `seismic-zone-map` | NSCP | ⚙ |
| Septic Tank Design | `septic-tank-design` | NPCP | ⚙ |
| Shoreline Setback | `shoreline-setback` | Housing | 🗺 |
| Site Circulation Analysis | `site-circulation-analysis` | Planning | 🗺 |
| Skylight Requirements | `skylight-requirements` | PD 1096 | ⚙ |
| Slab Construction Sequence | `slab-construction-sequence` | Construction | ▶ |
| Smoke Control Systems | `smoke-control-systems` | RA 9514 | ▶ |
| Smoke Partition Requirements | `smoke-partition-requirements` | RA 9514 | ✂ |
| Soil Profile Cutaway | `soil-profile-cutaway` | NSCP | ✂ |
| Split AC Unit Cutaway | `split-ac-cutaway` | PMEC | ✂ |
| Sprinkler System Layout | `sprinkler-layout` | RA 9514 | 🗺 |
| Stairway Configurator | `stairway-configurator` | PD 1096 | ⚙ |
| Stairwell Enclosure | `stairwell-enclosure` | RA 9514 | ✂ |
| Standard Material Sheets | `standard-material-sheets` | Materials | 💥 |
| Standpipe Classes | `standpipe-classes` | RA 9514 | ✂ |
| Steel Connections | `steel-connections` | NSCP | 💥 |
| Steel Sections Catalog | `steel-sections-catalog` | Materials | 💥 |
| Storm Drainage System | `storm-drainage-system` | NPCP | ✂ |
| Structural Load Path | `structural-load-path` | NSCP | ▶ |
| Structural Systems Comparison | `structural-systems-comparison` | NSCP | ⚙ |
| Subdivision Layout — BP 220 | `subdivision-layout-bp220` | Planning | 🗺 |
| Subdivision Layout — PD 957 | `subdivision-layout-pd957` | Planning | 🗺 |
| Superposition of Orders | `superposition-demo` | History | ▶ |
| Tactile Block Types | `tactile-block-types` | BP 344 | 💥 |
| Trap Seal Depth | `trap-seal-depth` | NPCP | ✂ |
| Tuscan Order | `tuscan-order` | History | 💥 |
| Vent Pipe Routing | `vent-pipe-routing` | NPCP | ✂ |
| Vent Shaft Dimensions | `vent-shaft-dimensions` | PD 1096 | ⚙ |
| Vigan Heritage House | `vigan-heritage-house` | History | 💥 |
| Wall Section Assembly | `wall-section-assembly` | Materials | 💥 |
| Wall Types Comparison | `wall-types-comparison` | Construction | ✂ |
| Water Code Easements | `water-code-easements` | Housing | 🗺 |
| Water Meter Assembly | `water-meter-assembly` | NPCP | 💥 |
| Water Supply Riser | `water-supply-riser` | NPCP | ✂ |
| Waterproofing Systems | `waterproofing-systems` | Materials | ✂ |
| Wheelchair Maneuvering | `wheelchair-maneuvering` | BP 344 | ⚙ |
| Wind Load Analysis | `wind-load-analysis` | NSCP | ⚙ |
| Zoning Setback Overlay | `zoning-setback-overlay` | Planning | 🗺 |

---

_★ = Top-10 priority module with full LEA question set and multi-phase support_

_End of catalog. Total: **187 modules**._
