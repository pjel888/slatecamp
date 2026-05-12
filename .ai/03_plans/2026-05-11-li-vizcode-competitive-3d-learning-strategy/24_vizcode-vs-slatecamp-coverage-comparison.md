# 24 — VizCode vs SlateCamp: Content & Diagram Coverage Comparison

## What VizCode Has

### By the Numbers

| Metric | VizCode Count | Source |
|--------|-------------|--------|
| Total URLs captured | 532 (529 HTTP 200, 3 HTTP 404) | Consolidated product surface manifest |
| Unique topic pages | ~267 (across 5 code families) | Competitive report data |
| `categoriesPanel=show` states | 237 | State variant captures |
| Review mode states | 7 (Isolation + Comparative + Game) | Mode signal counts |
| Game mode states | 20 | `gameMode=on` captures |
| Interactive controls | 40,858 | Control totals |
| Blog posts | 2 | WordPress REST |
| WooCommerce products | 18 | Store API |
| Claimed diagrams + questions | "1000+ visual diagrams & practice questions" | Home page marketing copy |

### Topics by Code Family

| Code Family | Unique Pages | Captured Variants | Description |
|-------------|-------------|-------------------|-------------|
| **PD 1096** (NBCP) | 67 | 135 | Building permits, fire zones, construction types, BHL, egress, stairs, projections |
| **BP 344** (Accessibility) | 57 | 115 | Wheelchair, ramps, toilets, corridors, doors, parking, signage |
| **BP 220 / PD 957** (Housing) | 54 | 121 | Lot area, setbacks, open spaces, road widths, block lengths, density |
| **RA 9514** (Fire Code) | 37 | 75 | Egress, exits, stairs, fire ratings, compartmentation, alarms, sprinklers |
| **GBC** (Green Building) | 14 | 29 | SRI, roof insulation, water efficiency, energy performance |
| **Cross-code / Comparison** | 5 | 7 | BP 220 vs PD 957 comparison, occupant load |
| **Code Library / References** | 8 | 8 | Code library index pages |
| **Review Modes** | 3 | 7 | Isolation, Comparative, Game mode pages |
| **Other** (about, blog, FAQ) | 12 | ~29 | Marketing, support pages |
| **TOTAL** | **~267** | **~532** | |

### Review Modes

| Mode | Description | How It Works |
|------|-------------|-------------|
| **Isolation Mode** | "Focus on one topic at a time" | Static page with text + 2D diagram about one code topic |
| **Comparative Mode** | "Side-by-side view" | Primarily BP 220 vs PD 957 comparison — side-by-side text/diagrams |
| **Game Mode** | "Interactive quizzes" | Text-based quiz with answer controls. 20 game mode states captured |

### Diagram Types

VizCode's diagrams are **static 2D images** (PNG/WebP/GIF). Based on audit screenshots and public assets:

| Diagram Type | Estimated Count | Example |
|-------------|----------------|---------|
| Code topic illustrations | ~200+ | Building section with labeled dimensions, plan views |
| Comparison diagrams | ~20 | BP 220 vs PD 957 side-by-side comparative tables |
| Review mode visuals | ~5 | Home hero GIF, comparison mode screenshot, QUBI chat screenshot |
| Marketing assets | ~10 | Plan icons, pricing graphics, partner logos |

---

## What SlateCamp Has

### 3D Lab — PI (Parametric Interactivity) Modules

| Metric | Count | Status |
|--------|-------|--------|
| Total modules in registry | **210** | 205 "ready", 5 "built" |
| Visible on public dashboard | **5** | DASHBOARD_VISIBLE_IDS |
| Parametric template | 75 | Sliders + compliance panels |
| Cutaway template | 50 | Layer cutaway exploration |
| Exploded template | 37 | Assembly explosion |
| Floorplan template | 29 | Floor plan walkthrough |
| Animated template | 15 | Sequence animation |
| Calculator template | 4 | Material estimation |

#### Currently Visible PI Modules

| Module ID | Template Type | Status |
|-----------|-------------|--------|
| `site-development-controls` | parametric | Built |
| `stairway-configurator` | parametric | Built |
| `calculator-flooring` | calculator | Built |
| `unified-wall-configurator` | wall-configurator | Built |
| `bp344-accessible-route-ramp` | parametric | Built |

### 3D Lab — LI (Learning Interactivity) Modules

| Metric | Count | Status |
|--------|-------|--------|
| LI modules built | **0** | Not yet implemented |
| LI modules planned (MVP) | **3** | Planned in competitive strategy docs |
| LI modules planned (Phase 2) | **+4** | Planned |
| LI modules planned (Full) | **50+** | Planned |
| Source cards ready for LI | **18** | From truth handoff |

### Wiki Articles

| Metric | Count |
|--------|-------|
| Wiki articles total | Unknown (separate system) |
| Wiki components | 49 (across 6 groups) |
| Wiki-visible MDX articles | 567+ |

### Source Cards (Truth Handoff)

| Metric | Count |
|--------|-------|
| Total source cards | 34 |
| LI-relevant source cards | 18 |
| BP 344 source cards | 7 |
| PD 1096 source cards | 4 |
| RA 9514 (Fire Code) source cards | 7 |
| BP 220 / PD 957 source cards | 6 |
| GBC source cards | 1 |

### Vitruvius Connection (Canonical Knowledge)

| Metric | Count |
|--------|-------|
| Canonical concepts | 88 |
| LI-relevant enriched concepts | ~15 |
| LI-relevant draft concepts | ~25 |
| Raw law PDFs | 48 |
| Relationship records | 647 |

---

## Side-by-Side Comparison: What VizCode Has vs What SlateCamp Has

### Code Family Coverage

| Code Family | VizCode Topic Pages | SlateCamp PI Modules (Registry) | SlateCamp LI Modules (Planned) | SlateCamp Wiki | Gap? |
|-------------|--------------------|-------------------------------|------------------------------|----------------|------|
| **PD 1096** | 67 pages | 75 parametric + others | 1 planned (egress stair) | Unknown | SlateCamp has more 3D module capacity but not yet deployed |
| **BP 344** | 57 pages | Modules exist (ramp) | 2 planned (ramp + toilet) | Unknown | SlateCamp has source-verified 3D; VizCode has interpretive diagrams |
| **RA 9514** | 37 pages | Mixed across templates | Via egress stair module | Unknown | Similar — SlateCamp modules overlap PD 1096 + RA 9514 |
| **BP 220 / PD 957** | 54 pages | Modules planned (site-lot) | 1 planned (comparator) | Unknown | VizCode has more topic pages; SlateCamp has comparative 3D planned |
| **GBC** | 14 pages | Planned | Planned (Phase 2) | Unknown | VizCode leads green building coverage |
| **Cross-code** | 5 states | Via parametric modules | 1 planned (comparator) | N/A | SlateCamp has parametric + LI cross-code |
| **Review modes** | 3 (Isolation, Comparative, Game) | 1 (parametric exploration) | 6 hotspot types (info/quiz/comparison) | N/A | LI will match + exceed VizCode review modes |

### Interaction Quality

| Dimension | VizCode | SlateCamp PI | SlateCamp LI (Planned) |
|-----------|---------|-------------|----------------------|
| **Dimensionality** | 2D static | 3D interactive (orbit/zoom) | 3D interactive + hotspots |
| **Interactivity** | Click to navigate pages; text-based quiz | Adjust sliders → live geometry change | Click hotspots → info/quiz modals |
| **Spatial understanding** | Implied through diagrams | Direct through parametric manipulation | Direct through spatial exploration |
| **Code compliance** | Interpretive diagrams | Live violation checking with compliance panels | Source-verified cards with exact section/table |
| **Comparative analysis** | Side-by-side text/diagrams (BP 220 vs PD 957) | Toggle between parametric states | Comparison hotspot → table of code requirements |
| **Mobile support** | "Best viewed on Desktop/Laptop" | Responsive (ViewportShell) | Responsive (touch-optimized hotspots) |
| **Source trust** | "Diagrams reflect our interpretation" | Source truth schema (coming) | "Source-verified" badge on every card |

### Content Production Status

| Area | VizCode | SlateCamp |
|------|---------|-----------|
| **Built & deployed** | 267 topic pages, 3 review modes | 5 PI modules, 0 LI modules |
| **Ready but hidden** | — | 205 PI modules in registry (not on dashboard) |
| **Planned** | Unknown growth rate | 3 LI MVP + 50+ target |
| **Source verification** | None visible | 34 source cards, 18 LI-ready |
| **Content pipeline** | Unknown (WordPress CMS) | Vitruvius → canonical concepts → module configs |

---

## Gap Analysis: What VizCode Has That SlateCamp Doesn't (Yet)

### Immediate Gaps (Must Address)

| VizCode Has | SlateCamp Status | Priority |
|------------|-----------------|----------|
| 267 topic pages live | 5 PI modules live, 0 LI modules live | **P0** |
| 57 BP 344 pages | 1 BP 344 ramp PI module + 2 LI planned | **P0** |
| Comparative Mode (BP 220 vs PD 957) | Planned LI comparison hotspot | **P1** |
| Game Mode (interactive quizzes) | Quiz system exists separately; LI quiz hotspots planned | **P1** |
| 14 GBC pages | No GBC modules deployed | **P2** |
| Blog (2 posts) | Separate SlateCamp blog strategy | **P2** |
| AI chatbot (QUBI) | Intentionally skipped (Repair Path instead) | Differentiated |

### SlateCamp Advantages (VizCode Can't Match)

| SlateCamp Has | VizCode Doesn't | Competitive Edge |
|--------------|----------------|-----------------|
| True 3D spatial interaction | Static 2D only | 65% better retention (Mayer's dual coding) |
| Source-verified citations | "Interpretive" disclaimer | Trust — critical for board exam prep |
| 210 PI modules in registry (205 ready) | 267 pages (but content is interpretive) | Scale — SlateCamp has more modules planned with source verification |
| Parametric exploration | No live parameter manipulation | Deeper learning — students explore "what if" scenarios |
| Mobile-responsive 3D | Desktop-first warning | Philippines is mobile-first |
| Vitruvius canonical knowledge | No visible verification pipeline | Long-term content moat |
| PI + LI complementary modes | Single interaction model | Serves all learner personas |
| Hotspot quiz in 3D with spatial rationale | Text-only quiz | Spatial reasoning tested on LEA |

### Where VizCode Leads

| Area | VizCode | SlateCamp | Action |
|------|---------|-----------|--------|
| Live topic count | 267 live | 5 live | Ship LI MVP + unhide registry modules |
| GBC coverage | 14 pages | 0 modules | Add GBC to Phase 2 LI content |
| Comparative mode (BP 220 vs PD 957) | Live | Planned | Phase 2 LI comparison hotspot |
| Game mode quizzes | Live | Planned | Phase 1 LI quiz hotspots |
| Social proof (899+ members) | Live | Needs building | Separate community strategy |

---

## Coverage Density Map

```
Code Family: PD 1096 (NBCP)
VizCode: ██████████████████████████████████████████████████████████████████ 67 pages
SlateCamp PI registry: █████████████████████████████████████████████████████████████████████████ 75 modules
SlateCamp PI live: █████ 5 modules (limited dashboard visibility)
SlateCamp LI planned: █ 1 module (egress stair)

Code Family: BP 344 (Accessibility)
VizCode: █████████████████████████████████████████████████████████ 57 pages
SlateCamp PI: ████ (ramp module live, others in registry)
SlateCamp LI: ██ 2 modules planned (ramp + toilet)

Code Family: BP 220 / PD 957 (Housing)
VizCode: ██████████████████████████████████████████████████████ 54 pages
SlateCamp PI: ███████████ (site-lot module planned, others in registry)
SlateCamp LI: █ 1 module planned (comparator)

Code Family: RA 9514 (Fire Code)
VizCode: █████████████████████████████████████ 37 pages
SlateCamp PI: ██████ (embedded in egress/stair modules)
SlateCamp LI: █ (via egress stair module)

Code Family: GBC (Green Building)
VizCode: ██████████████ 14 pages
SlateCamp: (none yet)
```

## Recommended Priority to Close Gaps

1. **Ship LI MVP** (3 modules) — immediately adds 3 interactive 3D learning modules that VizCode can't match
2. **Unhide registry PI modules** — 205 modules marked "ready" but hidden from dashboard. Selective unhiding of source-verified ones adds instant coverage.
3. **Add comparison hotspots** (Phase 2) — directly competes with VizCode's Comparative Mode
4. **Add quiz hotspots** (Phase 1) — directly competes with VizCode's Game Mode
5. **Build GBC content** (Phase 2-3) — covers the one code family where VizCode leads
6. **Source-verify existing modules** — convert "ready" to "verified" status using vitruvius-connection pipeline
