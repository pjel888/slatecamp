# Comprehensive UX/UI Research: 3D Architecture Software
### Benchmarked from Professional Tools · Applied to Web-Based Educational 3D (WebGL / Three.js / R3F)
**Slatecamp 3D Lab — Reference Document · April 2026**

***

## Executive Summary

This research synthesizes UX and UI design evidence across professional 3D architecture tools (Revit, SketchUp, Rhino, ArchiCAD) and maps validated patterns into the web-based educational context of Slatecamp's 3D Lab modules. It covers must-have UI components, behavioral heuristics, spatial interaction design, compliance visualization patterns, happy paths, UX trails, and full user journey maps for two primary personas — the ALE Architecture Student and the Professional Architect. All findings are grounded in Slatecamp's own blueprint files (Site Dev Controls, Stairway Configurator, Unified Wall Configurator, Viewport UX Audit) as the empirical baseline, cross-validated with industry benchmarks and UX research literature.

***

## Part I — Professional Tool Benchmarks

### Revit (Autodesk)

Revit's UI is organized around a **ribbon interface** — tabbed toolbar at the top grouping tools by discipline and workflow phase — with each tab activating contextual sub-panels when specific element types are selected. The core chrome consists of: (1) Quick Access Toolbar (QAT) at the top left for user-pinned high-frequency commands; (2) the Ribbon itself for task-oriented tool discovery; (3) a **Properties Palette** — floating, dockable, and dynamically updating whenever the selection changes; (4) the Project Browser providing a hierarchical tree of all views and sheets; and (5) a View Control Bar in the drawing area for scale, detail level, and visual style.[^1][^2][^3]

Revit's workflow is highly sequential and phase-gated: **Setup → Model Development → Detailing → Documentation → Collaboration → Visualization → Revisions**. This mirrors the architecture design lifecycle but imposes significant cognitive overhead on first-time users due to its "BIM-first" philosophy — every drawn element carries structured data, not just geometry. The Ribbon's breadth is a frequent usability criticism: it is comprehensive but not immediately scannable, requiring training before productivity.[^4]

**Key UX Lessons from Revit:**
- Contextual tabs (appearing only when an element is selected) reduce toolbar noise without hiding functionality permanently
- A dockable, dynamically updating Properties panel eliminates modal dialogs for property editing
- The QAT solves the discoverability/efficiency tradeoff — let users pin their own frequent actions
- Phase-locked workflows work well for professionals but create a steep entry barrier for education

### SketchUp

SketchUp's founding UX philosophy — *"3D for the rest of us"* — remains the strongest consumer-facing UX principle in architecture software. Its language policy is explicit: use self-descriptive compound words (*"Endpoint"* not *"Vertex"*; *"Face"* not *"Polygon"*) to minimize jargon overhead. The undo stack is treated as sacred: every user action maps to exactly one undo step, and no silent model changes occur without user intent.[^5][^6]

SketchUp's toolbar footprint is minimal — push/pull, line, rectangle, orbit, zoom are the five essential tools and remain visible by default. Section cuts and walk-through animations support client presentations directly from the modeling environment. The **3D Warehouse** serves as a component library, solving the cold-start problem for furnishings and context models.[^7]

**Key UX Lessons from SketchUp:**
- Domain-language that maps to the physical world reduces learning curve dramatically
- A true 1:1 undo/redo stack is non-negotiable for exploratory design tools
- Minimal core toolset + extensible plugin ecosystem is a valid design model for progressive complexity
- Contextual inference (faces and edges, not objects) reduces modal switching

### Rhino + Grasshopper

Rhino's core viewport UX is standard multi-view 3D: four synchronized perspective and orthographic viewports, orbit/pan/zoom via mouse buttons, snap system for precision. Its strength is modeling fidelity without parametric constraints — pure push/pull freedom. **Grasshopper** adds a visual programming canvas alongside the 3D viewport: users wire *components* (nodes) together with *wires* (data flow) to define parametric relationships. The canvas is infinitely pannable/zoomable and fully nonlinear — users can place nodes anywhere and connect them in any order.[^8]

The key UX innovation in Grasshopper is **real-time preview**: changing any slider or input immediately updates the 3D geometry in Rhino's viewport. The canvas and viewport are synchronized but independent — a designer can focus on wiring logic without visually losing the 3D result. The **Remote Panel** (published to Rhino's native UI) allows end-users to interact with a simplified control set without seeing the full Grasshopper graph.[^9][^8]

**Key UX Lessons from Rhino/Grasshopper:**
- Separating "logic editor" (Grasshopper canvas) from "result viewer" (3D viewport) is a valid architecture for complex parametric tools
- Real-time 3D preview from every parameter change is the gold standard for parametric interaction
- A simplified "remote panel" is the equivalent of Slatecamp's left sidebar — exposing only the controls the user needs, abstracting the engine behind them
- Wires as explicit data flow connectors are highly readable for computation-aware users but have a steep entry curve

### ArchiCAD

ArchiCAD's central UX concept is **smart building objects**: walls, slabs, windows, doors behave architecturally, not just geometrically — they know their layers, openings, and material composites. Its **hybrid 2D/3D workflow** allows seamless switching between plan view and 3D view of the same model, with changes synchronized bidirectionally. IFC interoperability, DWG support, and automated schedules make it closer to Revit in complexity but lighter in onboarding barrier.[^7]

**Key UX Lessons from ArchiCAD:**
- Domain-intelligent objects (walls that snap, windows that cut) reduce error and increase creative freedom
- Bidirectional plan/3D sync eliminates the "modeling vs. drafting" split
- Automated takeoff and schedule generation from the model is the killer professional workflow

***

## Part II — Must-Have UI Components

### 2.1 The Viewport

The 3D viewport is the primary workspace and must be treated as a first-class citizen in layout architecture. It should fill the majority of screen real estate with floating controls overlaid using glass morphism rather than occupying permanent chrome space.[^10][^11]

| Component | Requirement | Behavioral Spec |
|---|---|---|
| Ground grid | Always on by default | Infinite-feel, fade at edges, major/minor lines; toggle via `G` key |
| Axis gizmo | Bottom-right corner | 48×48px XYZ indicator; X=red, Y=green, Z=blue; non-interactive |
| Sky gradient | Scene background | Subtle top-blue to horizon-white; communicates "up is up" subconsciously |
| Contact shadows | Default on | Grounds geometry on the grid; togglable via settings |
| Camera | Scene-appropriate default | Position, FOV, near/far clipping tuned per module |
| Demand frameloop | Always | Only render on scene change (`frameloop="demand"`); critical for WebGL performance |
| DPR cap | 1.0–1.5 | Device pixel ratio capped at 1.5 for mobile/GPU headroom |
| Lighting rig | Per-module, shared pattern | Ambient (0.35) + directional key (1.2, warm) + fill (0.4, cool) + hemisphere tint |

### 2.2 Floating Scene Toolbar (Top-Left, MANDATORY)

Every 3D module must render a persistent `SceneToolbar` in the top-left viewport corner. This pattern is validated by the Site Dev Controls module as the gold standard and must be applied universally.

| Icon | Action | Keyboard | Type | State |
|---|---|---|---|---|
| Grid3x3 | Toggle ground grid | `G` | Toggle | Filled when active |
| Ruler | Toggle dimension labels | `D` | Toggle | Filled when active |
| Eye | Toggle X-ray mode | `X` | Toggle | Filled when active |
| Layers | Toggle layers panel | `L` | Toggle | Filled when active |
| — | Divider | — | — | — |
| Camera | Screenshot (PNG) | `P` | Action | 200ms flash |
| Maximize2 | Toggle fullscreen | `F` | Action | 200ms flash |

**Visual spec:** `bg: oklch(0,0,0,0.6)`, `backdrop-blur-sm`, `rounded-lg`, `p-1` — dark glass morphism. Active state: `bg: oklch(100,0,0,0.2)` text-white, inactive: `oklch(100,0,0,0.7)` text-white with hover.

### 2.3 Camera Navigation Bar (Bottom-Center, MANDATORY)

A persistent `CameraNavigationBar` must appear at the bottom-center of every viewport. Camera controls are the #1 user frustration source in 3D tools when absent — they constitute broken UX.

| Button | Action | Keyboard | Behavior |
|---|---|---|---|
| Rotate3D (Orbit) | Free orbit camera | `1` | Mode button — stays active |
| Hand (Pan) | Pan camera | `2` | Mode button — stays active |
| PanelTop (Front) | Snap to front elevation | `3` | One-shot snap — 200ms flash |
| CircleDot (Top/Plan) | Snap to plan view | — | One-shot snap — 200ms flash |
| Box (Iso) | Snap to isometric | `4` | Cycles NE→NW→SE→SW |
| RotateCcw (Reset) | Reset to module default | `R` | One-shot — 200ms flash |

**Cursor behavior:** Orbit mode → `cursor-grab` (dragging: `cursor-grabbing`); Pan mode → `cursor-move`. The cursor change is the primary micro-interaction communicating active navigation mode.

**Camera transitions:** All snap presets animate to target position in 600ms ease-out.

### 2.4 Sidebar System

Based on measured minimum content widths from Slatecamp's production modules, the following width standards apply:

| Module Type | Left Panel | Right Panel | Rationale |
|---|---|---|---|
| Complex 2-panel | 340px | 320px | Label+slider+value: 240px min + 32px padding = 320px; round up to 340px |
| Simple right-only | — | 300px | Parts list, navigator, status badges fit at 280px; 300px adds breathing room |
| DevControls (split layout) | 480px | 300px | Bespoke split-column layout: controls left, info right within single panel |
| Compliance-heavy | 320px | 320px | Code citations need 300px min for readable text |

The left sidebar contains **input controls** (sliders, dropdowns, toggles, presets) and the right sidebar contains **output/compliance info** (scorecards, computation displays, code references). These are distinct cognitive modes and must not be merged.

**Mobile handling:** Below 768px, sidebars collapse to a bottom sheet using tab navigation (Controls / Compliance).

### 2.5 Parameter Controls

| Control Type | Use Case | UX Requirements |
|---|---|---|
| Slider with inline input | Continuous numeric parameters | Label + track + value input; step defined per parameter; warning state when near limits |
| Dropdown | Categorical selection | Options labeled in plain language (e.g., "R-1 Low-Density Residential" not code-only) |
| Toggle | Boolean feature flags | Visually distinct active/inactive; affects 3D immediately |
| Preset card strip | Scenario loading | Card grid with name + category badge; click applies batch parameters atomically[^12] |
| Display group | Read-only computed values | Right column, card variant, no interaction affordances — distinguishes input from output |
| Custom component | Domain-specific panels | FirewallPanel, BOMPanel, SetbackInfoPanel — contextual within their section |

**Fundamental UX rule:** Every parameter change must trigger an immediate 3D update with no perceptible lag. On WebGL/R3F, this requires `invalidate()` calls via the R3F bridge after every store update.

### 2.6 Compliance Visualization UI

Autodesk Research's study of architectural designers identifies two primary visualization strategies that support working with building codes: (1) **available-space indication** (showing what is permitted) and (2) **violation linting** (highlighting what is non-compliant) — analogous to a spell-checker for design rules. Both strategies must co-exist.

**Color semantic system (Slatecamp Law Color Scheme):**

| Law | Color | Hex | Severity |
|---|---|---|---|
| RA 9514 (Fire Code) | Red | `#E74C3C` | Highest — overrides all |
| BP 344 (Accessibility) | Blue | `#3498DB` | High |
| PD 1096 (Building Code) | Slate | `#4A7FAD` | Medium |
| BP 220 (Socialized Housing) | Amber | `#F5A623` | Medium |
| Pass / Compliant | Green | `#2ECC71` | — |
| Info / Reference | Default gray | `#A1A1AA` | — |



**Violation UI Components:**
- **3D material override:** Violating geometry receives law-color material in real-time
- **Ghost overlays:** Translucent planes show permitted zones (setbacks, AMBF, TOSL) — available space, not just violations
- **Scorecard grid:** 9-item grid of pass/fail checks with code citation per item
- **Cross-law conflict badges:** Distinct warning badges for cases where one law passes but another fails on the same dimension
- **KPI bar metrics:** Key computed values (TLA, AMBF, PSO, BHL) surfaced at the bottom HUD with highlight condition on violations
- **AMBF three-way check display:** Side-by-side computation of three binding methods with GOVERNS tag on the strictest
- **Area closure identity visualization:** Stacked bar showing AMBF+ISA+USA=TLA with color blocks and numeric validation

### 2.7 Header Component

The module header must transition from dark (`bg-camp-black`) to light (`bg-card` with `border-border`) to avoid a visual break between the viewport and chrome:

| Element | Before (Current) | After (Target) |
|---|---|---|
| Background | `bg-camp-black` (pure black) | `bg-card` (white/light) |
| Title text | `text-white90` | `text-foreground` |
| Back button | `text-white40` with arrow | `text-muted-foreground` + Lucide ArrowLeft |
| Code reference | `text-white30` | `text-muted-foreground` at 60% opacity |
| Settings icon | Missing | Lucide Settings on rightmost side |
| Height | `h-9` (36px) | `h-10` (40px) for better breathing room |



### 2.8 View Mode System

Complex modules require distinct viewport presentation modes beyond the default 3D view:

| Mode | Trigger | Geometry Effect |
|---|---|---|
| Overview | Default | All layers at computed positions, full opacity |
| Section Cut | `key:2` | Finish layers at 0.4 opacity; structure fully opaque — reveals internal composition |
| Exploded | `key:3` + slider | Finish layers offset in Z-axis by `explodeAmount × 0.15m × layerIndex`; labels appear at >30% |
| Build Sequence | `key:4` + step slider | Geometry filtered to visible IDs at current step; progressive construction reveal |
| Compare | `key:5` | Side-by-side metric comparison dashboard in right panel |



### 2.9 Guided Tour System

A structured guided tour is essential for educational 3D modules. The Site Dev Controls module demonstrates the gold standard with 6-stop narrated tour:

| Stop | Title | Teaching Focus | Visual Highlight |
|---|---|---|---|
| 1 | Read the Lot | TLA definition | Lot boundary |
| 2 | Carve the Margins | Setbacks | Setback zones |
| 3 | Find the Footprint | AMBF | AMBF footprint |
| 4 | Rise Within Limits | BHL | Height limit |
| 5 | Give Back the Ground | TOSL/ISA/USA | Open space overlays |
| 6 | Test Your Limits | Sandbox exploration | Free interaction |

**Design requirements for tours:**
- Skippable at any step
- Each stop narrates a single concept (one cognitive chunk)
- Camera position should ideally update per stop for best-angle viewing of the highlighted concept
- Tour step counter shows progress (e.g., "3 of 6")
- After tour completion, module enters full sandbox mode

***

## Part III — UX Behavioral Studies

### 3.1 Spatial Cognition in 3D Tools

Designing for 3D interaction requires understanding how humans build spatial mental models. Key findings from interaction design research:

**Spatial orientation anchors** — users build mental models around consistent reference points. A permanent ground grid, sky gradient, and XYZ gizmo provide three independent orientation cues so users never lose spatial context. When these cues are absent (e.g., a pure-black void viewport), the brain lacks anchor points and navigation feels disorienting.

**Camera sovereignty** — the user must always control camera movement. The IxDF spatial UI guidelines explicitly state: "The user should always control the camera movement. Let them drive. Don't shake the camera, purposely lock rotation, or turn the user's camera for them." Programmatic camera animations (tour step transitions, snap transitions) must be smooth and short (≤600ms) to remain in the user's perceived control rather than feeling system-imposed.

**Depth and layering** — interface elements overlaid on 3D space must maintain clear Z-layer hierarchy. Glass morphism for floating tools (translucent, dark) visually separates them from solid chrome panels. Too many overlapping transparent layers cause visual fatigue — the `--viewport-overlay-bg` CSS variable at 60% opacity is the calibrated sweet spot.

**Direct manipulation** — 3D objects and spatial zones should respond to direct drag interaction where appropriate (e.g., draggable ISA/USA placement zones in Site Dev Controls). Dragging a zone provides immediate spatial feedback that no slider can replicate.

### 3.2 Cognitive Load Theory Applied to 3D Architecture Tools

Cognitive load research shows that complex software generates three load types:
- **Intrinsic load** — complexity inherent to the domain (building code computation, parametric geometry)
- **Extraneous load** — unnecessary complexity added by poor design (hidden features, inconsistent layouts)
- **Germane load** — productive cognitive effort that builds understanding (learning from violations, understanding formula derivations)

A usability study of architecture students using SketchUp confirmed that 3D CAD tools impose measurable cognitive load comparable to physical model-making. The UX designer's task is to minimize extraneous load while maximizing germane load.

**Tactics for load reduction:**
- **Progressive disclosure:** Begin with defaults, expose advanced options in collapsible sections[^12]
- **Chunking:** Group related controls into labeled sections; maximum 5–7 items per section before needing collapse
- **Spatial memory:** Consistent component positions across modules build procedural memory. A user who learns the toolbar position in Site Dev Controls should not relearn it in the Stairway Configurator
- **Offloading computation:** Show computed results (KPI bar, scorecard) without requiring the user to derive them mentally
- **Recognition over recall:** Keep all major actions visible via toolbar; keyboard shortcuts are an efficiency layer for power users, not the primary access path

Research from Nielsen Norman Group confirms that real-time inline validation — the equivalent of live compliance checking in 3D — significantly reduces errors and correction time. The Slatecamp violation color system operationalizes this principle in 3D space.

### 3.3 Micro-Interactions in 3D Architecture Contexts

Micro-interactions are the atomic moments that define perceived quality. In 3D architecture tools, every parameter change must produce an immediate, legible response:

| Trigger | System Response | Feedback Type |
|---|---|---|
| Slider moved | 3D geometry updates | Visual: geometry change |
| Toggle activated | 3D layer shows/hides | Visual: geometry + icon fill state |
| Violation triggered | 3D material → law color | Visual: color change on geometry |
| Camera mode changed | Cursor style changes | Visual: cursor shape |
| Snap preset clicked | Camera animates to preset | Visual: 200ms flash → camera move |
| Screenshot triggered | Canvas capture | Visual: 200ms flash → download |
| Preset card selected | All parameters update atomically | Visual: 3D full refresh |
| Tour step advanced | Narration + highlight | Visual: highlight overlay + text |



**The micro-interaction design rule for Slatecamp:** No user action should produce a "silent" result. Every interaction must have an immediate visual response in the 3D viewport, sidebar, or HUD. Latency above 100ms is perceptible as a "hang".

### 3.4 Error States and Recovery

Based on Nielsen Norman Group's heuristic analysis for complex applications, 3D architecture tools must design for:

**Violation states (non-blocking errors):**
- Violations should never block workflow — the user must always be able to continue adjusting parameters
- Violations communicate what is wrong and why via code citations
- Severity hierarchy: Error (non-compliant, red border) → Warning (cross-law conflict, amber badge) → Info (reference/guidance, default)
- Recovery path: Show the offending value, show the required limit, let the user adjust the parameter directly to fix it

**Cross-law conflicts (gray areas):**
- When one law passes but another fails, use warning badges rather than violation colors
- Badge text must explain the jurisdictional context (e.g., "Valid only for qualifying BP 220 housing projects")

**Floating-point tolerance errors:**
- Area closure identity is validated within 0.01 sqm tolerance to avoid false violations from floating-point arithmetic
- Arithmetic-level errors must never surface to the user as design violations

***

## Part IV — UX Trails and Interaction Flows

### 4.1 UX Trail Map: Site Development Controls (Professional Architect)

```
[Module Entry]
     │
     ▼
[Select Zoning Class]    ← Dropdown; triggers full recompute
     │
     ▼
[View 3D Lot + Setbacks] ← Setback overlays appear automatically
     │
     ├──► [Adjust Lot Width/Depth] ← Sliders; TLA updates in real-time; HUD KPIs update
     │         │
     │         ▼
     │    [Check AMBF Envelope] ← Blue footprint overlay updates
     │
     ├──► [Set RROW Width] ← Affects BHL and commercial setbacks
     │         │
     │         ▼
     │    [View BHL Change] ← Building height cap updates in scene
     │
     ├──► [Configure Proposed Building]
     │         │
     │         ▼
     │    [Watch Compliance Scorecard] ← Pass/fail grid updates per check
     │         │
     │         ├──► [All Green → Compliant State]
     │         │         └──► [Screenshot] → Export PNG
     │         │
     │         └──► [Red Violation] → [Adjust to resolve] → [All Green]
     │
     ├──► [Toggle Layers] ← Show/hide setbacks, AMBF, TOSL, floors
     │
     ├──► [X-Ray Mode] ← See through building to interior constraints
     │
     └──► [Camera Presets] ← Orbit / Plan / Front / Iso for presentation angles
```



### 4.2 UX Trail Map: Stairway Configurator (Multi-Law Compliance)

```
[Module Entry]
     │
     ▼
[Select Project Type] ← Activates applicable law regime
     │
     ├──► General Residential → PD 1096 baseline rules
     ├──► BP 220 Socialized → Relaxed riser/tread/width thresholds
     ├──► Commercial → PD 1096 commercial width tier
     └──► Accessible Route → Activates BP 344 ghost handrails
          + Exit Stair → Activates RA 9514 overlay
     │
     ▼
[Configure Stair Geometry]
     │
     ├──► Riser Height slider    → Color override on risers if violation
     ├──► Tread Depth slider     → Color override on treads if violation
     ├──► Stair Width slider     → Width deficit planes appear if violation
     ├──► Headroom slider        → Headroom plane color changes
     ├──► Handrail Height slider → Handrail color override
     └──► Number of Risers       → Total rise check, landing flag
     │
     ▼
[View Compliance Panel]
     │
     ├──► Active Violations list (grouped by law, color-coded)
     ├──► Cross-Law Conflicts (warning badges)
     ├──► Blondel Comfort formula (2R+T = 600–650mm zone)
     └──► Geometry Summary (total rise, run, stringer length, pitch)
     │
     ▼
[Resolve Violations] ← Adjust sliders to clear all violations
     │
     ▼
[Optional: Tolerance Mode] ← Per-step riser variation; uniformity check
     │
     ▼
[Optional: IBC Comparison] ← Ghost international overlay for reference
```



### 4.3 UX Trail Map: Unified Wall Configurator (Material Exploration)

```
[Module Entry]
     │
     ▼
[Select Core Type via Card Strip]
     │
     ├──► CHB → Masonry parameters (rebar, bond beam, block size)
     ├──► Drywall → Framing parameters (stud spacing/depth, gypsum layers)
     ├──► Brick → Masonry pattern + 705.2 height check
     ├──► Plywood → Budget partition (immediate fire-rating warning)
     ├──► Cement Board → Exterior moisture-resistant framing
     ├──► Solid Concrete → High-performance structural
     └──► Existing Wall → Renovation/repaint scenario
     │
     ▼
[Configure Parameters]
     │
     ├──► Wall Length/Height sliders → Area + BOM recalculates
     ├──► Side treatment → 1 Side / Both Sides
     ├──► Structural toggles (CHB: rebar/bond beams; Drywall: insulation/bridging)
     └──► Finish Layer toggles: Plaster → Skim → Primer → Paint
     │
     ▼
[View Mode Selection]
     │
     ├──► Overview → Default complete assembly
     ├──► Section Cut → Internal structure visible through finish layers
     ├──► Exploded → Layer-by-layer Z separation with labels
     ├──► Build Sequence → Progressive step-by-step construction (1–8 steps)
     └──► Compare → Side-by-side performance dashboard (two wall types)
     │
     ▼
[Performance Dashboard]
     │
     ├──► Fire Rating (minutes, color-coded: ≥120 green, 60 warning, <60 danger)
     ├──► STC Acoustic rating (≥50 green, 35 warning, <35 danger)
     ├──► Cost/sqm PHP (≤2000 green, ≤3500 warning, >3500 danger)
     └──► Thermal R-value (≥3.0 green, 1.5 warning, <1.5 danger)
     │
     ▼
[BOM Panel] ← Grouped material table with PHP costs
     │
     ▼
[Export / Screenshot]
```



***

## Part V — User Journey Maps

### 5.1 Persona A: ALE Architecture Student

**Name:** Maria Santos (Fictional)
**Background:** 3rd-year architecture student, University of Santo Tomas, Quezon City. Preparing for ALE (Architect Licensure Examination). Studies PD 1096 building code. Has used SketchUp for 3D modeling but is new to parametric code compliance tools.
**Goal:** Understand PD 1096 site development controls and apply them independently for the ALE exam.
**Device:** Laptop (Chrome/Edge), occasionally tablet.
**Mental model:** Spatial/visual thinker; learns by doing and experimenting; gets anxious when errors are unexplained.

***

#### Journey Phase 1: Discovery & Entry
| Aspect | Detail |
|---|---|
| **Touchpoint** | Slatecamp 3D Lab module list |
| **Action** | Clicks "Site Development Controls" module |
| **Thought** | "I hope this explains it better than the textbook diagrams" |
| **Emotion** | Curious + slightly anxious |
| **Pain Point** | Module list order and naming may not communicate learning path |
| **Opportunity** | Module cards should show Bloom level and prerequisite badges |

#### Journey Phase 2: First Contact with 3D Viewport
| Aspect | Detail |
|---|---|
| **Touchpoint** | Module loads; 3D lot appears with setback overlays |
| **Action** | Immediately tries to rotate the camera (instinctive mouse drag) |
| **Thought** | "OK it's 3D, I can orbit it" |
| **Emotion** | Relieved — it works; growing confidence |
| **Pain Point (CRITICAL)** | If camera navigation bar is absent, user doesn't know how to use Plan view or Iso — core learning views |
| **Opportunity** | Camera nav bar (Orbit/Plan/Front/Iso) ensures student can switch to plan view for setback study |

**Happy Path:** Camera navigation is visible → student clicks "Plan" → sees top-down lot with setback margins → "Oh! That's how setbacks work spatially!"

#### Journey Phase 3: Guided Tour (First Use)
| Aspect | Detail |
|---|---|
| **Touchpoint** | Tour overlay initiates automatically (or via prompt) |
| **Action** | Reads narration, clicks "Next" through 6 stops |
| **Thought** | "TLA = lot width × depth. Makes sense. Now AMBF..." |
| **Emotion** | Engaged; each stop reveals one new concept (manageable) |
| **Pain Point** | Tour doesn't snap camera to best angle per stop |
| **Opportunity** | Per-stop camera position would dramatically improve concept clarity |

**UX Trail — Tour Happy Path:**
1. Tour launches with Stop 1 (TLA) → lot boundary highlighted
2. Student reads narration, notes TLA in KPI bar
3. Clicks Next → Stop 2 (Setbacks) → red overlay zones highlight
4. Clicks Next → Stop 3 (AMBF) → blue AMBF footprint appears
5. Clicks Next → Stop 4 (BHL) → 3D building rises to height limit
6. Clicks Next → Stop 5 (TOSL/ISA/USA) → green open space overlays
7. Clicks Next → Stop 6 → "Now explore in Sandbox mode"
8. Tour completes → module fully interactive

#### Journey Phase 4: Sandbox Exploration
| Aspect | Detail |
|---|---|
| **Touchpoint** | Full module access after tour |
| **Action** | Adjusts lot width slider; watches AMBF change |
| **Thought** | "Wait, if I make it narrower, the AMBF shrinks? Let me try..." |
| **Emotion** | Engaged, experimenting — "aha moments" |
| **Pain Point** | Slider labels may use code jargon without plain-language tooltip |
| **Opportunity** | Tooltip on each control citing the specific rule it affects |

**UX Trail — Violation Discovery:**
1. Student increases proposed storeys slider
2. Compliance scorecard flips BHL check to red
3. 3D building turns violation color
4. Student sees "Building Height: 5F exceeds BHL: 3F" in scorecard
5. Student reduces storeys until check turns green
6. Student understands: BHL governs maximum height, not desired height

#### Journey Phase 5: Knowledge Verification
| Aspect | Detail |
|---|---|
| **Touchpoint** | Post-tour in-situ quiz (if implemented) |
| **Action** | Quiz prompt appears while 3D is visible |
| **Thought** | "I can see the answer right there in the model..." |
| **Emotion** | Confident; reinforced by visual evidence |
| **Pain Point** | Quiz integration gap in current implementation |
| **Opportunity** | In-situ quiz while viewing the model reinforces spatial-declarative memory linkage |

#### Journey Phase 6: Review & Re-attempt
| Aspect | Detail |
|---|---|
| **Touchpoint** | Applies a preset (e.g., "Narrow Lot Violation") |
| **Action** | Preset loads with deliberate violations; student diagnoses them |
| **Thought** | "OK, setback is breached. Footprint too wide. I need to reduce building.proposedFootprintWidth." |
| **Emotion** | Problem-solving mode; high engagement |
| **Opportunity** | Violation preset library is a high-value ALE exam prep tool |

***

### 5.2 Persona B: Professional Architect

**Name:** Architect Rico Abad (Fictional)
**Background:** Licensed architect, 8 years experience, mid-size firm, Manila. Uses Revit for BIM documentation and SketchUp for client presentations. Looking for a quick PD 1096 compliance pre-check tool before formal submission.
**Goal:** Quickly verify site development controls for a proposed R-3 development before design development begins.
**Device:** Desktop workstation, dual monitors. High proficiency with keyboard shortcuts.
**Mental model:** Efficiency-first; impatient with guided flows; wants direct access to parameters.

***

#### Journey Phase 1: Module Entry (Efficiency Mode)
| Aspect | Detail |
|---|---|
| **Touchpoint** | Module opens with default parameters |
| **Action** | Immediately dismisses tour; wants to set real parameters |
| **Thought** | "I don't need a tour — let me just input my lot dimensions" |
| **Emotion** | Focused; slightly impatient if workflow is gated |
| **Pain Point** | If tour cannot be skipped, professional users abandon immediately |
| **Opportunity** | Tour must be skippable with a single click; default to sandbox mode for returning users |

**Happy Path:** Tour skipped → module in full sandbox mode → starts inputting real project parameters.

#### Journey Phase 2: Parameter Input
| Aspect | Detail |
|---|---|
| **Touchpoint** | Left sidebar: Lot parameters, Zoning, RROW |
| **Action** | Sets zoning to R-3 Max, lot 400sqm (20×20), RROW 10m |
| **Thought** | "Let me see what my setbacks and AMBF are for this configuration" |
| **Emotion** | Productive; getting into analysis mode |
| **Pain Point** | Parameter range may not match actual project (e.g., lot >100sqm max) |
| **Opportunity** | Expose slider ranges in the control to communicate limits clearly |

**UX Trail — Professional Configuration:**
1. Dropdown: Zoning → R-3 Maximum → full recompute triggers
2. Slider: Lot Width → 20m; Lot Depth → 20m → TLA = 400sqm in KPI bar
3. Slider: RROW Width → 10m → BHL = 5F (RROW governs)
4. Navigate to BUILD tab → Set FLAR = 3.0, BHL = 5F
5. Input proposed building: 12×12 footprint, 4 storeys

#### Journey Phase 3: Compliance Analysis
| Aspect | Detail |
|---|---|
| **Touchpoint** | Right panel: Compliance Status + AMBF Three-Way Check |
| **Action** | Reads compliance scorecard; all green; studies AMBF computation methods |
| **Thought** | "AMBF = 171 sqm by setback, 200 sqm by PSO — setback governs. Good." |
| **Emotion** | Satisfied; professional data verification complete |
| **Happy Path** | All 9 checks pass → exports screenshot for project documentation |
| **Pain Point** | No export option for the full computation data (PDF/CSV of results) |

#### Journey Phase 4: Design Iteration
| Aspect | Detail |
|---|---|
| **Touchpoint** | 3D viewport + parameter controls |
| **Action** | Tests adding a 5th floor → BHL violation triggers → adjusts floor height downward |
| **Thought** | "Floor height 2.8m × 5 floors = 14m. RROW 10m allows only 5F. Let me try BHL override." |
| **Emotion** | Problem-solving mode; using tool as a design decision aid |
| **Happy Path** | User finds optimal configuration that maximizes TGFA while respecting all limits |

#### Journey Phase 5: Documentation
| Aspect | Detail |
|---|---|
| **Touchpoint** | SceneToolbar Screenshot + Code Reference panel |
| **Action** | Screenshots Plan view + Iso view; reads Code Reference section for citation |
| **Thought** | "I'll attach these to the design brief for the client meeting" |
| **Emotion** | Productive completion; module delivered value |
| **Opportunity** | Multi-angle screenshot batch export; formatted PDF report with code citations |

***

## Part VI — Must-Have Elements Synthesis

### 6.1 Non-Negotiable UX Requirements (Phase 0 / Always Present)

The following elements are non-negotiable across every 3D module. Any module lacking these has broken UX:

1. **Camera Navigation Bar** — Orbit, Pan, Front, Top, Iso, Reset; always visible at bottom-center
2. **Scene Toolbar** — Grid, Dimensions, X-ray, Layers, Screenshot, Fullscreen; always visible at top-left
3. **Ground Grid** — Always on by default; toggleable via `G`
4. **Axis Gizmo** — XYZ orientation in bottom-right viewport corner
5. **Sky gradient** — Provides implicit up/down spatial orientation
6. **Consistent sidebar widths** — No sidebar narrower than 300px
7. **Dark glass morphism for viewport overlays** — Using design tokens, not hardcoded hex
8. **Light theme for sidebars/header** — `bg-card` + `border-border`
9. **Real-time 3D update on every parameter change** — via `invalidate()` R3F bridge
10. **Keyboard shortcuts for all major actions** — Discoverable via tooltip on hover

### 6.2 High-Impact UX Enhancers

| Feature | Impact | Priority |
|---|---|---|
| Per-tour-stop camera positioning | Dramatically improves concept teaching | High |
| In-situ quiz during module exploration | Reinforces spatial-declarative memory | High |
| Preset card library (violations + compliant) | Best ALE exam preparation feature | High |
| Cross-law conflict explanations in plain language | Reduces confusion for multi-law scenarios | High |
| Dimension annotations toggle | Connects numerical data to spatial context | High |
| Export (PNG, PDF with code citations) | Professional workflow completion | Medium |
| Drag-to-position spatial zones (ISA/USA) | Direct manipulation for spatial understanding | Medium |
| Contact shadows for grounding objects | Improves spatial perception of floor level | Medium |

### 6.3 Applied Nielsen Heuristics for Slatecamp 3D

| Heuristic | Application in 3D Lab |
|---|---|
| **1. Visibility of system status** | KPI bar, scorecard status, camera mode indicator, active toolbar buttons |
| **2. Match system & real world** | Ground grid = ground floor; sky = up; setback color = caution/red; building color = neutral |
| **3. User control & freedom** | Skippable tour, undo-capable slider, reset camera button, sandbox mode |
| **4. Consistency & standards** | Identical toolbar across all modules; same color semantics for laws |
| **5. Error prevention** | Slider warnings before violation threshold; real-time compliance checking |
| **6. Recognition over recall** | Visible toolbar buttons; shortcut displayed in tooltip not just documentation |
| **7. Flexibility & efficiency** | Keyboard shortcuts (G,D,X,L,P,F,1,2,3,4,R); presets for batch-configuration |
| **8. Aesthetic & minimalist design** | Glass morphism overlays; sidebar occupies minimum necessary space |
| **9. Help diagnose & recover from errors** | Violation scorecard with exact limit vs. actual; code citation per check |
| **10. Help & documentation** | Guided tour; in-situ narration; code reference panel |



***

## Part VII — WebGL/Three.js/R3F Specific UX Constraints

Web-based 3D architecture tools operate under performance and API constraints that shape UX decisions fundamentally:

### Performance Architecture
- **Demand frameloop** (`frameloop="demand"`) is mandatory — continuous rendering at 60fps drains battery and CPU for static scenes. Only re-render when state changes
- **DPR cap at 1.5** — Higher DPR multiplies pixel count geometrically; 1.5 provides sharp rendering without GPU overload on mobile
- **Instanced geometry** for repeated elements (CHB blocks, rebar, floor plates) — critical for maintaining 60fps during heavy parametric scenes
- **Simplified body + representative section** hybrid — large-scale geometry uses simplified mesh (80–90%) with a detail-accurate section (10–20%) for visual fidelity at low geometry cost
- **Shadows disabled** for complex compliance modules — shadow maps have high GPU cost; ambient + directional lighting with hemisphere tint achieves comparable spatial quality

### R3F State Management
- **Zustand store** for all scene state — sliders/dropdowns update the store; R3F scene reads the store reactively
- **R3F invalidate bridge** — the `invalidateFn` stored in the Zustand store is called after every state mutation to trigger a single demand-mode render
- **Pure computation engine** — All compliance calculation functions (e.g., `computeDevControls`, `computeStairState`, `computeWallState`) contain zero Three.js imports; they are pure TypeScript functions that can be unit-tested without a rendering context

### Design Token System
- All overlay colors must use CSS variables (`--viewport-overlay-bg`, `--viewport-overlay-text`, `--viewport-overlay-active`) — never hardcoded hex in component files
- The `bg-card` / `border-border` / `text-foreground` token system governs sidebar/header chrome — enabling light/dark mode theming without component rewrites
- Law violation colors use a separate semantic token set tied to law identity, not generic warning/error tokens, to preserve legal traceability

***

## Part VIII — Design Principles for Slatecamp's Dual-Audience Context

Slatecamp serves two simultaneous audiences — ALE students and professional architects — from the same codebase. This requires a UX architecture that allows progressive complexity without bifurcating the application:

### Dual-Mode Design Principle

| Dimension | Student Mode | Professional Mode |
|---|---|---|
| Entry experience | Guided tour (6 stops) | Tour skippable; direct sandbox |
| Default parameters | Textbook-standard values that illustrate key concepts | Sensible defaults that reflect real site conditions |
| Information density | Narration + single-concept focus per panel | Full computation display; three-way checks; code citations |
| Interaction pacing | Tour → Explore → Preset → Sandbox | Direct parameter input → analysis → iteration |
| Quiz integration | In-situ questions during exploration | Not shown (dismissed or absent for returning users) |
| Violation handling | Plain-language explanation of what and why | Code citation + recommended fix |



### The Three-Phase Learning Progression

All educational modules should support three progression phases, selectable or auto-detected:
1. **Guided phase** — narrated tour with step-by-step concept introduction
2. **Faded phase** — scaffolding visible but not intrusive; hints available on demand
3. **Sandbox/Challenge phase** — full freedom; optional timed/scored challenge mode

This mirrors Bloom's taxonomy progression: *Remember → Understand → Apply → Analyze*. The stairway configurator, for example, targets Bloom Level 4 (Analyze — multi-law comparison) while Site Dev Controls targets Level 3 (Apply — compute for any zoning class).

### Code Compliance as the Design Grammar

Slatecamp's differentiating UX proposition — unique in architecture education software — is the treatment of **building code as the design grammar** rather than as a post-design filter. Research from Autodesk identifies this gap: most compliance tools are post-hoc checkers, not design-time guides. Slatecamp's real-time compliance feedback, available-space overlays (setback zones, AMBF footprint), and ghost geometries (BP 344 dual handrails, IBC comparison ghosts) operationalize this vision.

The UX principle: **compliance constraints should feel like spatial feedback, not error messages**. A red-highlighted setback zone says "you cannot build here" through space, not through a modal. A ghost handrail at 900mm says "this is where the code wants it" through geometry, not through text.

***

## Conclusion

A comprehensive, production-quality UX for web-based 3D architecture software requires consistency across spatial orientation, navigation, compliance feedback, and learning progression. The evidence hierarchy — drawn from industry benchmark tools (Revit, SketchUp, Rhino), peer-reviewed interaction research, and Slatecamp's own validated production module (Site Dev Controls as gold standard) — converges on a unified design philosophy: **the viewport is the learning environment, the sidebar is the interaction layer, compliance is visualized through geometry and color, and every module must feel spatially identical even when its content is entirely different**. The user journey maps for both the ALE student and the professional architect demonstrate that this unified shell serves both personas without sacrificing either depth or accessibility.

---

## References

1. [Chapter 1](https://catalogimages.wiley.com/images/db/pdf/9781119059882.excerpt.pdf)

2. [Help | User Interface - Autodesk product documentation](https://help.autodesk.com/cloudhelp/2026/ENU/Revit-GetStarted/files/GUID-3197A4ED-323F-4D32-91C0-BA79E794B806.htm) - Learn how to use and customize the user interface to increase productivity and simplify your workflo...

3. [Understand Revit's user interface | Revit Tips #20](https://archsupply.com/understand-revits-user-interface-revit-tips-20/) - Understanding Revit's user interface is important for all Revit users (both beginners and experience...

4. [Revit workflow: A guide to architectural design efficiency - LinkedIn](https://www.linkedin.com/posts/roubana-el-sayed-3a84ba224_bim-revit-activity-7321152527264112641-rqcw) - Mastering your workflow in Revit means designing smarter, minimizing errors, and delivering consiste...

5. [SketchUp Extension UX Guidelines](https://developer.sketchup.com/article-ux-guidelines) - Learn how to make your extensions fit nicely into SketchUp

6. [SketchUp Extensions UX Guidelines](https://sketchup.github.io/sketchup-extension-ux-guidelines/) - The purpose of these guidelines is to help developers design extensions that closer align with Sketc...

7. [The Top 10 3D Building Design Software in 2025: Best Picks for ...](https://www.snaptrude.com/blog/the-top-10-3d-building-design-software-in-2025-best-picks-for-architects-and-designers) - Explore the best 3D modeling software in 2025 for architects and designers. Compare free and paid to...

8. [Rhino Grasshopper Tutorials & Scripts - Parametric House](https://parametrichouse.com/rhino-grasshopper/) - This collection of Rhino Grasshopper tutorials is designed as a starter pack for parametric design. ...

9. [Parametric design in Rhino - Grasshopper - McNeel Forum](https://discourse.mcneel.com/t/parametric-design-in-rhino/211464) - You can Publish any grasshopper input or output to the Remote Panel, which lives in the Rhino UI alo...

10. [4. The 3D Viewport « docs45.axyz-design.com](https://docs45.axyz-design.com/article/the-3d-viewport/) - This toolbar contains all the tools needed to create or edit the scenes: [H] Select and transform to...

11. [Working with the 3D Viewport - Open 3D Engine - O3DE](https://www.docs.o3de.org/docs/user-guide/editor/viewport/) - The 3D Viewport provides several features to complete common tasks such as editing the position, rot...

12. [site-dev-controls.blueprint.ts](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/8233088/53514306-ebb1-4dc6-b89e-1037a45b97ca/site-dev-controls.blueprint.ts?AWSAccessKeyId=ASIA2F3EMEYEZVJITODU&Signature=HMPhzMRae1KxvHKO%2FLep7u4Dxgk%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEEkaCXVzLWVhc3QtMSJGMEQCIH7flGbtMqxHLeWSP4%2B9FSDgFXlgsH9xgOSaaHbFxHrZAiBW7WQifyhxclhTqg%2BQgFbtAsx9OMdHjs%2BgyCteCN%2BQ4irzBAgREAEaDDY5OTc1MzMwOTcwNSIMQIAhSTnwtfdFUamFKtAEj82GONDRDYkWOiCmmgLM4Wdo2F39j8cKqwTMZ7som2YzgrOHRDU4LFY%2B0YkkTLx0yyl%2B1yYfgYYG7LHgS5LFyglcKG5IexL757hExxM%2FThJVNuvFxskUIg8CxldzKBSgZP94NsIYtbbCfGhyNUJxSA58l59z2rpXP9zgA1vHKg9xXQQdWDUb63VmeTWV61n8IQRV6OyE8Em9jJQAMOFt%2B6CXqRQ6U%2FhxPSRlhrTDBOflZSpOneXkQdxltlamQxkGPNgSsCsHDdRomORM9fKAm%2BHvwn%2F7OjDBBXKni15sI6snkXgecORz5i%2FRWO0Ogs7zuY4EC9ClzZeXSyXtssVs5kLE9xQOfl%2FzSNwHjotSiYgsOwYc3IcwePHY30fY5FpyIvZhlLOwcqMsjLuOfMsgT6fbGkzFEYZYo4s2snBzegTX0gL8B1N9V3B8qdPLISq5Ek%2B%2BKxVHWe5GpjjGVPSnMX8lWyvU6h7804H2TAwtji2uaxBoHiuNuhfCkZz6GGqh%2BNAjkNUp1CY2wPJcTTLQBj9Fae6Jl62nenk2%2BT63XZffOUA8vAYCGvM7QPuxZIvizKyfX21VtRQ0n01iNu6sAFoXTcvihDTrdLnyA10571Oc10AzeJ3XsHbL2Ns0GonqdiShvGqVHYqRNSyGiMrs%2FrbJ%2BO7cDpquTYiCLqXkn%2FuEydw4oJDs%2FPws%2FYFY4pVSo%2FJlL0eYbjhi5G%2FAl5MgjFMFrXSw88X2bjLpog8JEDgyx5SjAY1Ch14iIv8wWLs6tdFvUaTGxwBeLcqck%2BX%2FxTCDu93OBjqZAX833EHV9sp%2Ffej%2B1pLZq8ZESSfTvE%2F4qgTlZjXYC9oF0RJlZZ%2B2KTCdRezjD2CzJUO34pyKNEDCPa5TWR2u8cudQB6v4EMO5HUfdSCW0t8kJ1ELXvwvoZcnx2Wo8iDu9u293sgZP4RZHJATuk7kx75Ym5j5X1R%2Ffg3XlYeaLFxHUtURUShFipi4qbTM8LTxBSTPAjUJ69aobw%3D%3D&Expires=1775725398) - .aidocsXX-3D-ModulesSite-Development-ControlsUI-Auditsite-dev-controls.blueprint.ts Populated from c...

