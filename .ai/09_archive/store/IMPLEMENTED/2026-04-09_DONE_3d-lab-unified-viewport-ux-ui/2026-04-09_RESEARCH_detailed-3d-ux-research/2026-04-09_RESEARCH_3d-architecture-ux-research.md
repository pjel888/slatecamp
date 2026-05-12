# UX & UI Design Research for 3D Architecture Software

**Research Scope:** Professional 3D architecture tools (Revit, ArchiCAD, SketchUp, Rhino, Blender) benchmarked and translated to educational/interactive 3D contexts (web-based WebGL/Three.js/React Three Fiber)
**Platform Focus:** Web-based 3D (WebGL/Three.js browser constraints)
**Personas:** ALE Architecture Student + Professional Architect
**Date:** 2026-04-09
**For:** SlateCamp 3D Lab

---

## Table of Contents

1. [Must-Have UI Components](#1-must-have-ui-components)
2. [Must-Have UX Elements & Patterns](#2-must-have-ux-elements--patterns)
3. [UX Behavioral Studies & Cognitive Science](#3-ux-behavioral-studies--cognitive-science)
4. [Happy Paths](#4-happy-paths)
5. [UX Trails (Interaction Sequences)](#5-ux-trails)
6. [User Journey Maps](#6-user-journey-maps)
7. [Information Architecture](#7-information-architecture)
8. [Accessibility in 3D Interfaces](#8-accessibility-in-3d-interfaces)
9. [Mobile & Touch UX for Web-Based 3D](#9-mobile--touch-ux)
10. [Design System Patterns for 3D Software](#10-design-system-patterns)

---

## 1. Must-Have UI Components

### 1.1 Viewport Controls — The Non-Negotiable Foundation

Every 3D architecture application must provide visible, persistent camera navigation. This is the single most critical UI element. Without it, users cannot orient themselves in 3D space, and all other features become unreachable.

**Required viewport controls (always visible):**

| Control | Function | Benchmark Source | Implementation |
|---------|----------|-----------------|----------------|
| Orbit | Free-rotate camera around target | Every 3D tool | One-finger drag (mobile), left-click drag (desktop) |
| Pan | Translate camera laterally | Every 3D tool | Two-finger drag (mobile), middle-click drag (desktop) |
| Zoom | Move camera closer/farther | Every 3D tool | Pinch (mobile), scroll wheel (desktop) |
| Front View | Snap to front elevation | Revit, SketchUp, Blender | Button + keyboard shortcut |
| Top/Plan View | Snap to top-down plan | Revit, SketchUp, Blender | Button + keyboard shortcut |
| Isometric View | Snap to 3/4 axonometric | SketchUp, Rhino, Blender | Button + keyboard shortcut |
| Reset Camera | Return to default view | All professional tools | Button + keyboard shortcut |
| Zoom-to-Fit | Frame all/selected objects | Revit (ZF), Blender (Home), SketchUp (Shift+Z) | Button |

**View Cube / Orientation Gizmo:** A persistent 3D orientation indicator in the viewport corner. Benchmarked from Autodesk products (Revit, AutoCAD, Fusion 360), also present in Blender as the axis gizmo. Purpose: prevents the "lost in hyperspace" problem by giving users a constant reference for which direction they're facing. In web-based 3D, this can be implemented as an interactive SVG overlay or a small Three.js sub-scene.

**Camera Projection Toggle:** Perspective vs. Orthographic. Professional tools separate these clearly: SketchUp defaults to perspective with a "Parallel Projection" menu option; Revit uses dedicated view types (3D vs. Plan/Section); Blender uses Numpad 5 toggle. For educational tools, both modes are essential — perspective for spatial understanding, orthographic for accurate measurement reading.

### 1.2 Toolbar & Tool Palette

**Industry standard layout pattern (benchmarked across 15+ CAD/3D tools):**

The dominant layout across all professional 3D architecture software converges on a consistent spatial arrangement:

- **Top strip:** Primary menu bar (File, Edit, View, Tools) + contextual ribbon/toolbar
- **Left strip (vertical):** Tool palette for creation/editing tools (draw, push/pull, move, rotate, scale, measure)
- **Right strip (vertical) or panel:** Properties inspector, object hierarchy, layers
- **Bottom strip:** Status bar, coordinate readout, command line/input, timeline
- **Center:** Viewport (maximum screen real estate)

**SketchUp Pattern (Simplicity-First):** Minimal top toolbar with large, clearly labeled icons. "Getting Started" toolbar shows only 8 essential tools. Additional toolbars opt-in. The Measurements Box (bottom-right) accepts typed numeric input after any tool action — this is SketchUp's "hidden power user" feature and a critical pattern for parametric educational tools.

**Blender Pattern (Power-User):** Header bar per editor type, T-panel (tools) on left, N-panel (properties) on right, both toggleable. F3 search command palette for discoverability. Pie menus on key press for fast access. This pattern is too complex for educational tools but the search/command palette concept is universally valuable.

**Revit Pattern (BIM-Heavy):** Microsoft Office-style ribbon with contextual tabs that change based on selected element type. Properties palette always visible on left. Project Browser (hierarchy) below it. This pattern works well for data-rich parametric tools where context matters.

**For web-based educational 3D tools, the recommended synthesis:**
- Floating toolbar (top-left): Scene controls (grid, dimensions, screenshot, fullscreen, x-ray)
- Right sidebar (collapsible): Parameters + code compliance panel
- Left sidebar (collapsible, optional): Input controls for complex modules
- Bottom-center: Camera navigation bar
- No top ribbon (too heavy for web; use the sidebar for all controls)

### 1.3 Property Panel / Inspector Panel

Every object in a 3D scene has properties. The property panel is how users read and modify them.

**Required elements within a property panel:**

| Element | Purpose | Benchmark |
|---------|---------|-----------|
| Section headers with collapse | Organize properties by category | Blender N-panel, Revit Properties |
| Slider + numeric input combo | Continuous values with precision override | Every parametric tool |
| Dropdown selects | Enumerated options (material, type, classification) | Revit Type Selector, SketchUp Component Options |
| Toggle switches | Boolean properties (visible, locked, mirrored) | Blender property checkboxes |
| Color pickers | Material/zone color assignment | All 3D tools |
| Code compliance badges | Pass/fail/warning indicators per parameter | **SlateCamp-specific** — not in professional tools |
| Linked code references | Tap to see the relevant building code section | **SlateCamp-specific** |
| Preset cards | Quick-apply common configurations | Enscape presets, Twinmotion presets |

**Key UX principle for property panels:** Progressive disclosure. Show the most-used parameters first, collapse advanced options. Blender does this with subsection toggles. Revit does this with the "Edit Type" button that opens a deeper dialog only when needed.

### 1.4 Layer / Object Hierarchy Panel

Controls visibility and organization of scene elements.

**Benchmarked patterns:**
- **Blender Outliner:** Tree hierarchy with eye icon (visibility), camera icon (renderability), lock icon (selectability) per object. Drag-and-drop reordering.
- **Revit View Control Bar:** Dropdown for discipline visibility (Architecture, Structure, MEP), plus "Visibility/Graphics Overrides" for fine control.
- **SketchUp Layers/Tags:** Simple named layers with visibility toggles and active layer selector.
- **Photoshop Layers:** The most widely understood layer mental model — stacked, toggleable, with opacity.

**For educational 3D (SlateCamp):** Layer toggles for showing/hiding building code overlay zones (setbacks, AMBF, PSO, TOSL, BHL envelope, floors, RROW). Simple toggle switches, not a full tree hierarchy. Color-coded to match 3D visualization colors.

### 1.5 Measurement & Dimension Tools

Architecture is about precise dimensions. Every 3D architecture tool must show real-world measurements.

**Required measurement UI elements:**
- **Dimension lines in-scene:** Lines connecting two points with a numeric label showing distance. End caps (arrows or dots). Offset from the measured edge to avoid overlap. Color-coded: blue for compliant, red for violations.
- **Coordinate readout:** Current cursor position in world coordinates. Displayed in status bar.
- **Unit system selector:** Metric (mm, m) vs. Imperial (in, ft). Critical for Philippine context: always metric (mm default, m for site scale).
- **Snapping indicators:** Visual feedback when cursor snaps to grid, endpoint, midpoint, or edge. Green highlight or tooltip showing snap type.

**SketchUp's Measurements Box pattern:** After any action (draw line, move object, rotate), the measurements box in the bottom-right shows the current value and accepts typed overrides. User draws a line → reads "3,500mm" → types "4,000" → Enter → line adjusts. This direct-input-after-action pattern is extremely powerful for parametric controls.

### 1.6 Annotation & Markup Tools

**Text labels in 3D space:** Leader lines connecting a text annotation to a 3D point. Must remain readable regardless of camera angle (billboard behavior — always face the camera). Implemented in R3F using `<Html>` from drei with `distanceFactor` for consistent screen-space sizing.

**Hotspot markers:** Clickable dots anchored to 3D positions. Categories color-coded (requirement=blue, dimension=gold, violation=red, info=gray). Maximum 6 visible simultaneously to manage cognitive load (per Mayer's Coherence Principle).

### 1.7 Section / Clipping Plane Controls

Reveals internal structure by cutting through geometry.

**Benchmarked patterns:**
- **Revit Section Box:** A bounding box with 6 adjustable planes that clips the model. Drag handles on each face. Toggle on/off.
- **Blender Clipping:** Camera near/far clipping planes, or Boolean modifier for visual cuts.
- **SketchUp Section Planes:** Place a section plane anywhere, rotate it, toggle visibility. "Section Cut" fills the cut face with a solid color.

**For educational 3D:** Clipping planes are essential for wall assemblies (showing internal layers), building sections (floor-to-floor), and MEP cutaways. Implement as a single movable plane per axis (X, Y, Z) with a slider control.

### 1.8 Context Menus

Right-click menus provide contextual actions based on what's selected or hovered.

**Essential context menu items for 3D architecture:**
- Object-level: Hide, Isolate, Select Similar, Properties, Reset
- Viewport-level: Frame Selection, Set Camera Target, Toggle Grid, Toggle Dimensions
- Parameter-level: Reset to Default, Copy Value, Link to Code Reference

**Web-based consideration:** Long-press on mobile replaces right-click. Must be discoverable through other means (three-dot menu, swipe gesture).

### 1.9 Status Bar & Feedback Indicators

**Bottom-of-viewport status bar showing:**
- Current tool/mode name
- Coordinate position of cursor
- Snapping status (on/off, snap type)
- Performance metrics (FPS counter, draw calls — dev mode only)
- Module-specific KPI metrics (TLA, AMBF, PSO, TOSL, BHL for DevControls)

### 1.10 Search / Command Palette

The universal discoverability escape hatch.

**Benchmarked patterns:**
- **Blender F3:** Search any command by name, execute immediately. Shows keyboard shortcut alongside.
- **SketchUp Search:** Top-right search bar finds tools, components, and help articles.
- **VS Code Cmd+K:** The standard command palette pattern (type to filter, select to execute).
- **Figma Cmd+/:** Same pattern, deeply loved by designers.

**For educational 3D:** A command palette that searches modules, building codes, parameters, and help content. Especially valuable for the 186-module 3D Lab — users need a way to find the right module without browsing a full catalog.

### 1.11 Undo/Redo & History Panel

**Required:** Cmd+Z / Cmd+Shift+Z (or Ctrl on Windows) with visual feedback (toast notification showing undone action). Minimum 50-step undo stack.

**History panel (optional, power-user):** Blender's undo history shows a list of actions that can be jumped to. Revit's warning dialog before destructive actions. For educational tools, undo is essential because students experiment — they need the safety net to try things without fear.

### 1.12 Heads-Up Display (HUD) Overlays

Persistent floating information overlays on the viewport that update in real-time.

**Required HUD elements for architectural 3D:**
- **KPI metrics bar:** Key compliance values displayed as pills/badges (e.g., TLA: 300m², AMBF: 180m², PSO: 60%, BHL: 15m). Color-coded pass/fail.
- **Camera info:** Current view name (Perspective / Plan / Front / Iso NE)
- **Dimension readout:** Active measurement value
- **Code violation alert:** Floating badge when a parameter exceeds code limits

**Glass morphism styling:** Dark semi-transparent background (black at 60% opacity) with backdrop blur. This is the industry standard for viewport overlays in 3D software — it ensures readability against any 3D background (light sky, dark interior) while not blocking the scene.

---

## 2. Must-Have UX Elements & Patterns

### 2.1 Direct Manipulation vs. Parametric Input

Two fundamental paradigms exist in 3D architecture software:

**Direct Manipulation (SketchUp model):** User draws, pushes, pulls, and moves geometry directly. The mouse IS the tool. Actions are spatial — drag this face 3 meters, rotate this wall 45 degrees. Intuitive for beginners. Poor for precision compliance checking.

**Parametric Input (Revit/Grasshopper model):** User sets parameters (width=12m, stories=3, setback=2m) and the system generates geometry. Controls are numeric — sliders, input fields, dropdowns. Less intuitive initially but superior for code compliance visualization because every parameter maps to a building code requirement.

**For educational architecture tools:** The parametric model is superior because it directly maps to ALE exam content. A student adjusts "riser height" from 180mm to 210mm and immediately sees the code violation flag turn red with the citation "PD 1096 §804: Max 200mm." This cause-effect loop is the learning mechanism. Direct manipulation is reserved for spatial placement tasks (drag ISA/USA zones, position building footprint on lot).

### 2.2 Progressive Disclosure in Complex 3D Interfaces

Complex 3D tools have hundreds of parameters. Showing them all at once causes cognitive overload (Sweller's Cognitive Load Theory, 1988). The solution is progressive disclosure:

**Level 1 — Essential (always visible):** Primary geometry parameters (dimensions, type). These are the parameters the student needs for the ALE exam.

**Level 2 — Advanced (collapsed by default):** Material properties, construction details, tolerance settings. Revealed via "Advanced" section toggle or "Show More."

**Level 3 — Expert (behind settings):** Performance tuning, rendering options, export settings. Only accessible via settings gear icon.

**Benchmarks:**
- SketchUp shows 8 tools in the Getting Started toolbar, 40+ in extended toolbars
- Revit uses contextual ribbon tabs — tools appear only when relevant
- Blender uses N-panel sections that remember their collapsed/expanded state per user

### 2.3 Contextual Tool Switching

The active tool should change based on what the user selects or hovers over.

**SketchUp example:** When hovering over a face, the Push/Pull tool becomes available. When hovering over an edge, the Move tool snaps to that edge. The cursor icon changes to indicate the available action.

**Revit example:** Selecting a wall activates the wall-specific ribbon tab with "Edit Profile," "Attach Top," "Wall Joins" tools. Selecting a door shows "Flip Direction," "Edit Family," "Type Properties."

**For parametric educational tools:** When the user selects a stairway riser, the sidebar scrolls to "Riser Height" parameter and highlights it. When the user taps a setback zone in the 3D scene, the sidebar jumps to "Setback Dimensions" section.

### 2.4 Constraint-Based Interaction

3D architecture tools use constraints to enforce design rules:

- **Snapping:** Cursor snaps to grid intersections, endpoints, midpoints, edges, faces, and custom guide points. Visual feedback: green circle at snap point, tooltip showing snap type ("Endpoint," "Midpoint," "On Edge").
- **Alignment Guides:** Temporary lines showing alignment with other objects. SketchUp's inference engine is the gold standard — red/green/blue axis lines appear when moving along an axis, magenta when parallel to an edge.
- **Code Bounds:** Parameters have minimum and maximum values defined by building codes. Slider tracks show code bounds as colored zones (green=compliant range, red=violation range). The slider can move into the red zone (for learning purposes — students need to see what a violation looks like) but triggers a warning.

### 2.5 Selection Paradigms

How users select objects in 3D space:

| Method | Action | Use Case | Benchmark |
|--------|--------|----------|-----------|
| Click Select | Single click on object | Select one element | Universal |
| Box Select | Click-drag rectangle | Select multiple visible objects | Blender (B key), Revit |
| Lasso Select | Freehand draw selection area | Irregular selection groups | Blender, Photoshop |
| Hierarchy Select | Click parent, all children selected | Select building + all floors | Revit, Blender Outliner |
| Component Select | Double-click to enter component, single-click to select whole | Nested editing | SketchUp |

**For educational 3D:** Click-select is sufficient for most interactions. Students select a stairway to inspect it, a wall to configure it, a zone to understand it. No need for multi-select or complex selection tools.

### 2.6 Gizmo / Handle Design for 3D Manipulation

When an object is selected and needs to be moved, rotated, or scaled, visual handles appear:

**Universal color convention (established by Maya, adopted by all):**
- **Red** = X axis
- **Green** = Y axis
- **Blue** = Z axis
- **Yellow/White** = Free/all axes

**Handle shapes:**
- **Arrows** = Translation (move)
- **Circles/Arcs** = Rotation
- **Cubes** = Scale
- **Plane squares** = Translate on a 2D plane (XY, XZ, YZ)

### 2.7 Camera Control UX

Camera behavior is the most critical UX element in any 3D application. Poor camera controls cause disorientation, nausea, and abandonment.

**Orbit Behavior:**
- **Turntable (Y-up locked):** Camera orbits around a vertical axis. Cannot flip upside down. Used by SketchUp, most architecture tools. Matches human spatial intuition for buildings (gravity is always down).
- **Trackball (free rotation):** Camera can rotate freely in all directions. Used by Blender (optional). Disorienting for architecture — buildings should not appear upside down.
- **Recommendation for educational tools:** Turntable with polar angle limits (minPolarAngle=0.2, maxPolarAngle=π/2). Prevents going below the ground plane or fully top-down (which loses 3D context).

**Zoom Behavior:**
- **Dolly zoom (translate forward/back):** Camera moves closer/farther. Natural for perspective views. Used by most tools.
- **Field-of-view zoom:** Camera stays in place, FOV narrows/widens. Creates telephoto/wide-angle effect. Rarely used as primary zoom.
- **Scroll wheel zoom:** Should zoom toward cursor position, not screen center. This is a common source of frustration when implemented wrong.

**Camera Transitions:**
- Animated transitions between camera presets (600ms ease-out). Instant snaps are disorienting — the user loses spatial context.
- Lerp (linear interpolation) for position, slerp (spherical linear interpolation) for rotation.
- During transition, disable user input to prevent conflicts.

### 2.8 Feedback Loops

Every user action in a 3D interface must produce immediate visual feedback:

| Action | Feedback | Timing |
|--------|----------|--------|
| Hover over interactive element | Highlight outline, cursor change | <16ms (same frame) |
| Click on element | Selection outline (blue), properties panel updates | <50ms |
| Drag slider | Geometry updates in real-time, dimension labels update | <16ms (every frame) |
| Enter violation range | Red highlight on geometry, warning badge, code reference appears | <50ms |
| Complete an action | Brief confirmation (subtle color flash or checkmark) | <100ms, 300ms duration |
| Error (invalid operation) | Red flash, shake animation, error tooltip | <100ms |

**Ghost/Preview pattern:** When the user is about to make a change (hovering a slider, about to click), show a transparent preview of the result. SketchUp does this brilliantly — when using the Move tool, a translucent copy of the object follows the cursor before the user commits.

### 2.9 Error States in 3D

**Geometry violations:** When a parameter creates a code-non-compliant condition, the 3D geometry should show it visually:
- Red-tinted material on the non-compliant element
- Pulsing red outline (not animation — just a thicker red edge line)
- Dimension line turns red with dashed pattern
- Violation badge appears at the violation point in 3D space

**Loading states:** Progressive loading is essential for web-based 3D:
- Skeleton screen for sidebar while module loads
- Low-poly placeholder geometry that refines to high-detail (LOD transition)
- Loading spinner centered in viewport during initial scene setup
- Progress bar for large model downloads

### 2.10 Onboarding & Discoverability

**First-time user onboarding for 3D software:**

| Strategy | Description | Benchmark |
|----------|-------------|-----------|
| Guided Tour | Step-by-step walkthrough highlighting UI elements | Figma, Canva |
| Interactive Tutorial | "Try orbiting the camera" with success detection | SketchUp's initial tutorial |
| Tooltip Hints | Non-blocking tooltips on key UI elements, shown once | Most modern web apps |
| Coach Marks | Spotlight overlay highlighting one element at a time | Mobile apps |
| Template/Preset Start | Don't start with an empty scene — show a pre-configured example | Twinmotion, Enscape |

**For educational 3D:** The guided tour pattern is essential. Each 3D Lab module has 5-6 tour stops that introduce the concept, walk through the controls, and end with a "now explore on your own" moment. The tour is the primary learning mechanism — it structures the cognitive sequence.

### 2.11 Keyboard Shortcuts

**Universal 3D shortcuts (users expect these):**

| Key | Action | Standard Source |
|-----|--------|----------------|
| 1, 2, 3, 4 | Camera presets (perspective, plan, front, iso) | Blender Numpad |
| G | Toggle grid | Multiple tools |
| D | Toggle dimensions | SlateCamp convention |
| X | Toggle x-ray/wireframe | Blender |
| R | Reset camera | Common convention |
| F | Fullscreen / Frame selection | Blender (Numpad .), SketchUp (Shift+Z) |
| Space | Play/pause animation | Universal |
| Esc | Cancel current action / deselect | Universal |
| [ / ] | Toggle left/right panels | SlateCamp convention |
| Ctrl+Z | Undo | Universal |
| Ctrl+Shift+Z | Redo | Universal |

**Discoverability:** Show shortcuts in tooltips (e.g., "Toggle Grid (G)"), in the command palette results, and in a keyboard shortcuts help panel (accessible via "?" key).

### 2.12 Multi-Viewport Layouts

Professional tools often split the screen into multiple synchronized viewports:

- **Revit:** Plan + Section + 3D Perspective in a 2x2 or 1+2 layout
- **Blender:** Custom layouts with any number of viewports, each with independent camera
- **AutoCAD:** Model space + Layout space (paper space)

**For web-based educational tools:** Multi-viewport is not recommended due to mobile constraints and cognitive load. Instead, use camera presets that switch a single viewport between Plan, Front, and 3D views. The bottom camera bar (Orbit / Plan / Front / Iso) serves this purpose.

---

## 3. UX Behavioral Studies & Cognitive Science

### 3.1 Spatial Cognition in 3D Interfaces

Spatial cognition refers to the human ability to perceive, process, and mentally manipulate spatial information. In 3D architecture interfaces, three types of spatial knowledge are relevant (Siegel & White, 1975):

**Landmark Knowledge:** Recognizing specific objects or features. ("That's the stairway module." "The red zone is the setback.") This is the first level of spatial understanding and develops quickly.

**Route Knowledge:** Understanding sequences of movements. ("To see the wall layers, I orbit to the side, then enable cross-section.") This develops through repeated interaction.

**Survey Knowledge (Cognitive Map):** A holistic mental model of the entire space and its relationships. ("The setback zone wraps around the building footprint, and the AMBF is the lot area minus all setbacks.") This is the deepest level and the hardest to achieve. Research shows 3D interactive models significantly improve survey knowledge acquisition compared to 2D static representations (Verghote et al., 2019; findings showed 3D models improved wayfinding success rates for users with low spatial cognition).

**Design implication:** Each 3D Lab module should build spatial understanding progressively — landmarks first (hotspot labels on key elements), then routes (guided tour walking through the model), then survey knowledge (sandbox mode where students manipulate parameters and observe the whole-system effects).

### 3.2 Cognitive Load Management

Sweller's Cognitive Load Theory (1988) identifies three types of cognitive load:

**Intrinsic Load:** The inherent complexity of the content. Building code math (AMBF = TLA - setbacks) has irreducible complexity. You can't simplify the concept, but you can chunk it into smaller steps.

**Extraneous Load:** Load imposed by poor instructional design. Cluttered UI, inconsistent controls, unlabeled icons, confusing navigation — all waste cognitive resources that should be spent on learning. This is what UX design eliminates.

**Germane Load:** The productive effort of building mental schemas. When a student manipulates a slider and watches the 3D model respond, the cognitive effort of connecting the parameter to the visual result IS the learning. This is what SlateCamp's parametric sandbox maximizes.

**Design principles derived from CLT:**

| Principle | Application in 3D Architecture UI |
|-----------|-----------------------------------|
| Split-attention effect | Place labels ON the 3D element they describe (Mayer's Spatial Contiguity) — not in a separate legend |
| Redundancy effect | Don't show the same information in sidebar AND 3D scene AND status bar simultaneously — pick one primary location |
| Modality effect | Combine visual (3D model) with text (code reference) — dual-channel processing is more effective than single-channel |
| Worked example effect | Start with a pre-configured compliant building, then let students modify it — don't start from a blank scene |
| Expertise reversal | Experts find detailed scaffolding (tour steps, tooltips) annoying — provide a "skip tour" option and let power users go directly to sandbox mode |

### 3.3 Wayfinding and Orientation in 3D Space

The "lost in hyperspace" problem is the most common usability failure in 3D interfaces. Users orbit the camera and lose track of which direction they're facing, where the ground plane is, or how the current view relates to the building's real-world orientation.

**Research findings:**
- Elevated stress and anxiety impair spatial orientation and navigation (cognitive load literature on wayfinding)
- Distinct color codes and geometric patterns establish hierarchy among visual cues and support orientation through distinctive spatial experiences that users can remember
- A "three-anchor mechanism" (district-node-landmark) helps reduce cognitive load in complex spatial environments (Zhang et al., 2026, wayfinding in transit stations)

**Anti-disorientation strategies:**

| Strategy | Implementation |
|----------|----------------|
| Persistent orientation gizmo | View cube or axis indicator in viewport corner — always visible |
| Ground plane grid | A visible grid at Y=0 that establishes "ground" — prevents upside-down confusion |
| Compass rose / North arrow | Especially for site planning modules — shows real-world orientation |
| Breadcrumb camera history | "You came from: Orbit → Plan → Front" — allows backtracking |
| Constrained orbit | Turntable mode with polar angle limits — prevents going below ground or fully overhead |
| Animated camera transitions | Smooth 600ms transitions between views — maintains spatial continuity |
| Environmental cues | Sky gradient (light blue at top = "up"), ground shadow contact, atmospheric perspective |

### 3.4 Fitts' Law in 3D Target Selection

Fitts' Law (1954) predicts movement time for target acquisition: MT = a + b × log₂(2D/W), where D is distance and W is target width. In 3D, additional complications arise:

**Key findings from 3D Fitts' Law research:**
- Target depth significantly affects movement time in 3D — deeper targets take longer to select (Cha & Myung, 2013)
- Extending Fitts' Law to 3D requires accounting for inclination angle and depth perception (Grossman & Balakrishnan, 2004 extended the 2D model to include 3D target size and movement direction)
- For finger/touch input on mobile, the "dual distribution hypothesis" (Bi & Zhai, 2016) shows finger occlusion adds a fat-finger offset that must be compensated for — minimum touch target must be 44×44px
- A CHI 2025 systematic review confirmed that Fitts' Law extensions to 3D remain an active research area with no universal model yet accepted

**Design implications for 3D architecture UX:**
- Make interactive elements large enough to select easily. Hotspot dots: minimum 20px screen-space diameter (44px touch target with padding).
- Place frequently-used buttons close together (reduce D). Camera preset bar buttons should be adjacent, not scattered.
- Floating toolbar buttons should be at least 36px wide (desktop) or 44px (mobile).
- For 3D element selection, add hover-highlight feedback before click — this is the "pre-selection" that reduces effective target acquisition time.

### 3.5 Gestalt Principles in 3D Interface Design

| Principle | Application in 3D Architecture UI |
|-----------|-----------------------------------|
| Proximity | Group related controls together in sidebar sections. Lot parameters in one section, building parameters in another. |
| Similarity | Use consistent visual treatment for same-type elements. All compliance badges use the same shape/size. All sliders have the same track style. |
| Continuity | Dimension lines connect measurement points with continuous lines — the eye follows the line to read the value. |
| Closure | Building code zones (setback volumes, AMBF) rendered as semi-transparent colored volumes — the brain "closes" the shape even when partially obscured by the building. |
| Figure-Ground | Dark glass-morphism toolbar floats OVER the 3D scene — the toolbar is "figure," the 3D content is "ground." Clear visual separation. |
| Common Fate | When a parameter changes, all affected elements animate simultaneously — elements that move/change together are perceived as related. |

### 3.6 Color Perception and Depth Cues

**Depth cues used in architectural 3D visualization:**
- **Atmospheric perspective:** Objects farther from the camera appear lighter/hazier. Three.js `fog` achieves this.
- **Shadow contact:** Contact shadows establish objects on the ground plane. Without them, objects appear to float.
- **Edge lines:** Dark outlines on geometry edges (Edges/Outlines in post-processing) enhance shape perception, especially for architectural diagrams.
- **Occlusion:** Objects in front block objects behind. The most powerful depth cue.
- **Relative size:** Known-size objects (doors, people) provide scale reference.

**Color for information encoding in 3D:**
- **Avoid red-green only coding.** 8% of males have red-green color blindness. Always pair color with a second channel: shape, pattern, or label.
- **Use colorblind-safe palettes:** Blue-orange is safe for all common color vision deficiencies.
- **Functional colors in 3D architecture tools:** Blue = code requirement / dimension, Orange/Gold = measurement / warning, Red = violation (paired with dashed line pattern), Green = compliant (paired with solid line pattern), Gray = informational / neutral.

### 3.7 Novice vs. Expert Behavior Patterns

| Dimension | Novice | Expert |
|-----------|--------|--------|
| Tool discovery | Toolbar browsing, trial-and-error | Keyboard shortcuts, command palette |
| Camera control | Orbit only, frequent disorientation | Quick preset switches, intentional views |
| Error response | Undo repeatedly, start over | Identify the specific parameter and adjust |
| Information seeking | Read tooltips, follow guided tour | Skip to the parameter they know |
| Cognitive strategy | Serial (one thing at a time) | Parallel (adjust multiple parameters mentally before committing) |
| Session duration | Short exploratory sessions (5-15 min) | Long focused sessions (30-60+ min) |
| Preferred UI density | Minimal, large controls | Dense, compact controls, multiple panels |

**Design implication:** Support both with adaptive UI. Show tooltips on first 3 visits, then fade them out. Offer both the guided tour AND direct sandbox access. Make keyboard shortcuts available but never required.

### 3.8 Dual Coding Theory & Multimedia Learning in 3D

Paivio's Dual Coding Theory (1986) states that information presented in both visual and verbal channels is better remembered than either alone. Mayer's Multimedia Learning Principles extend this:

| Mayer's Principle | Application in 3D Lab |
|-------------------|----------------------|
| Spatial Contiguity | Place labels adjacent to the 3D element they describe, not in a separate panel |
| Temporal Contiguity | When a parameter changes, show the 3D effect and the code reference simultaneously |
| Coherence | Remove decorative elements that don't serve learning (no particle effects, no unnecessary animation) |
| Signaling | Highlight the relevant 3D element when the user reads a code reference in the sidebar |
| Segmenting | Break complex concepts into tour steps (TLA → Setbacks → AMBF → BHL → TOSL → Sandbox) |
| Pre-training | Show labeled diagrams of key terms BEFORE the interactive 3D module |
| Personalization | Use conversational tone in tour narration ("Notice how the setback shrinks when you change the zone class") |

**Research on 3D vs. 2D for architectural comprehension:**
- Two-dimensional representations require more mental effort for spatial visualization than 3D representations (Wickens & Hollands, 2000)
- 3D interactive representations direct working memory resources toward germane load (productive schema building) by reducing the mental rotation needed to understand spatial relationships (Shelton, 2003)
- Students with LOW spatial ability benefit most from 3D interactive models — they show significantly improved success rates, while high-spatial-ability students perform well regardless of representation format (Verghote et al., 2019)

This last finding is critical for SlateCamp: the students who struggle most with spatial visualization on the ALE are exactly the students who benefit most from 3D interactive modules. The 3D Lab isn't a luxury — it's an equity tool.

---

## 4. Happy Paths

### 4.1 Happy Path: ALE Student — First-Time Module Exploration

**Context:** A 4th-year BSA student opens the Site Development Controls module for the first time to study PD 1096 Rule VII-VIII for the ALE.

```
STEP 1: ENTRY
├── Student taps "Site Development Controls" from 3D Lab catalog
├── Loading screen with progress bar (1-3 seconds)
├── Module loads with a preset R-1 residential lot (20m × 15m)
├── The scene shows a 3D lot with a building, setback zones, and labeled metrics
└── EMOTION: Curiosity + slight overwhelm ("What am I looking at?")

STEP 2: GUIDED TOUR BEGINS (Auto-starts for first visit)
├── Tour Step 1/6: "Welcome" — Camera animates to overhead plan view
│   ├── Spotlight on Total Lot Area (TLA) metric in KPI bar
│   ├── Tour tooltip: "This is your lot. TLA = 300 m²"
│   └── "Next" button to advance
├── Tour Step 2/6: "Setbacks" — Camera animates to front perspective
│   ├── Setback zones highlight in translucent blue
│   ├── Dimension lines appear showing front, side, rear setbacks
│   └── Tour tooltip: "Setbacks are mandatory open spaces. They vary by zone class."
├── Tour Step 3/6: "AMBF" — Camera stays, setbacks dim, AMBF zone highlights
│   ├── AMBF metric pulses in KPI bar
│   └── Tour tooltip: "AMBF = TLA - all setbacks. This is your buildable area."
├── Tour Step 4/6: "BHL" — Camera tilts to show building height
│   ├── BHL envelope appears as translucent ceiling
│   └── Tour tooltip: "Building Height Limit depends on RROW and zone class."
├── Tour Step 5/6: "TOSL" — Camera returns to plan view
│   ├── TOSL closure highlights: AMBF + ISA + USA + TOSL = TLA
│   └── Tour tooltip: "All areas must add up to TLA. This is the closure identity."
├── Tour Step 6/6: "Your Turn" — Camera returns to default orbit
│   └── Tour tooltip: "Now try changing the zone class or lot dimensions. Watch what happens!"
└── EMOTION: Confidence builds ("I understand the basic concepts now")

STEP 3: SANDBOX EXPLORATION
├── Student changes zone class from R-1 to Com-2
│   ├── All metrics recalculate instantly
│   ├── Setback zones change shape
│   ├── PSO increases, AMBF decreases
│   └── BHL increases (commercial allows taller buildings)
├── Student adjusts lot width from 20m to 12m
│   ├── Lot geometry shrinks
│   ├── AMBF decreases (less buildable area)
│   ├── If building footprint now exceeds AMBF → violation highlights in red
│   └── Compliance panel shows "AMBF VIOLATION: Proposed 72m² > Allowed 54m²"
├── Student adjusts building footprint to fit within AMBF
│   ├── Violation clears → green compliance badge
│   └── Student experiments with stories count
└── EMOTION: Mastery + satisfaction ("I can see how all these rules connect")

STEP 4: EXIT
├── Student taps back arrow to return to 3D Lab catalog
├── Tour progress saved (won't auto-start next visit)
├── Module remembers last parameter state for next visit
└── EMOTION: Confidence ("I understand site development controls now")
```

**Total time:** 8-15 minutes for first exploration.

### 4.2 Happy Path: Professional Architect — Parametric Building Configuration

**Context:** A practicing architect uses a web-based 3D parametric tool to explore building massing options for a site.

```
STEP 1: ENTRY
├── Architect opens parametric configurator, skips tour (experienced user)
├── Keyboard shortcut "2" → Plan view
├── Types lot dimensions directly into input fields (not sliders)
└── Selects zone classification from dropdown

STEP 2: CONFIGURATION
├── Adjusts building footprint using sliders with numeric override
│   ├── Types "18.5" into footprint width field → geometry updates
│   ├── Types "12" into footprint depth → geometry updates
│   └── Checks AMBF compliance → green
├── Adjusts stories to 8
│   ├── BHL violation appears → red badge + red building cap in 3D
│   ├── Reads: "BHL exceeded by 2 storeys (PD 1096 Table VII.2)"
│   └── Reduces to 6 → compliance restored
├── Toggles dimensions overlay (D key) to read exact setbacks
├── Toggles x-ray mode (X key) to see setback volumes through building
└── Captures screenshot (P key) for client presentation

STEP 3: ITERATION
├── Switches to different zone class → all metrics recalculate
├── Compares FLAR options by adjusting FLAR override slider
├── Notes the governing constraint (FLAR vs. BHL) from compliance panel
└── Saves preset for later reference

STEP 4: EXIT
├── Downloads screenshot
├── Closes module
└── EMOTION: Efficiency ("Got the answers I needed in 5 minutes")
```

**Total time:** 3-8 minutes for an experienced user.

### 4.3 Happy Path: Student Configures a Stairway

```
STEP 1: ENTRY + TOUR
├── Student opens Stairway Configurator from 3D Lab
├── Pre-configured straight stairway appears (12 risers, 185mm rise, 250mm tread)
├── Guided tour introduces riser, tread, Blondel's formula, PD 1096 limits
└── All 4 law regimes shown: PD 1096, BP 220, BP 344, RA 9514

STEP 2: EXPLORATION
├── Student drags "Riser Height" slider from 185mm → 210mm
│   ├── 3D geometry updates in real-time (risers get taller)
│   ├── Blondel comfort formula (2R+T) updates: 2(210)+250 = 670 > 650 → WARNING
│   ├── PD 1096 violation: max 200mm → RED badge
│   ├── Dimension line on riser turns red with dashed pattern
│   └── Compliance panel shows multi-law comparison table
├── Student adjusts back to 175mm → all clear
├── Student enables "Accessibility Route" toggle
│   ├── BP 344 rules activate
│   ├── Width requirement increases to 1200mm
│   ├── Dual handrail requirement appears
│   ├── 3D model shows handrails at 700mm and 900mm heights
│   └── New dimension lines appear for BP 344 requirements
├── Student toggles "Nosing Detail View"
│   ├── Camera zooms to single tread
│   ├── All other treads dim
│   ├── Nosing profile shows projection, radius, undercut
│   └── ADA/ANSI requirements displayed alongside

STEP 3: IN-CONTEXT QUIZ (if integrated)
├── Quiz question appears at tour end: "What is the maximum riser height for a required exit stairway under RA 9514?"
│   ├── Options: A) 200mm  B) 180mm  C) 190mm  D) 175mm
│   ├── Student selects A (200mm) → INCORRECT
│   ├── Correct answer highlighted: B (180mm)
│   ├── Rationale: "RA 9514 IRR Rule 10 limits exit stairway risers to 180mm, stricter than PD 1096's 200mm general limit."
│   └── The 3D model highlights the RA 9514 compliance row in the multi-law panel
└── EMOTION: "Oh! The Fire Code is stricter. I would have gotten that wrong on the exam."
```

### 4.4 Happy Path: Student Takes a Cross-Section of a Wall

```
STEP 1: Wall Configurator loads with 150mm CHB wall preset
STEP 2: Student selects "Cross-Section View" from toolbar
├── Clipping plane slices through wall at midpoint
├── Internal layers visible: plaster → CHB core → plaster → skim coat → primer → paint
├── Each layer has a label and thickness dimension
STEP 3: Student toggles "Build Sequence" animation
├── Layers add one at a time, from core outward
├── Each step narrates: "Step 1: CHB blocks laid in running bond..."
├── Student can pause, scrub back, or replay
STEP 4: Student changes wall type from CHB to Drywall
├── Cross-section updates instantly
├── Layer composition changes: gypsum board → metal stud → insulation → gypsum board
├── STC and fire rating values update in compliance panel
```

### 4.5 Happy Path: Student Switches Between 2D Plan and 3D Perspective

```
STEP 1: Student is in 3D perspective view of Site Development Controls
STEP 2: Taps "Plan" in camera preset bar (or presses "2")
├── Camera animates smoothly to overhead position (600ms ease-out)
├── View switches to orthographic projection
├── Setback zones now appear as 2D colored regions on the lot
├── Dimension lines appear showing setback distances from lot edges
├── KPI bar remains visible with same metrics
STEP 3: Student reads setback dimensions from plan view
STEP 4: Taps "Iso NE" to return to 3D perspective
├── Camera animates back (600ms)
├── Perspective projection restored
├── Student now has a mental model connecting the 2D plan to the 3D massing
```

### 4.6 Happy Path: Student Compares Compliant vs. Non-Compliant Configurations

```
STEP 1: Student loads preset "R-1 Compliant Residential" → everything green
STEP 2: Student increases building footprint beyond AMBF limit
├── PSO exceeds maximum → red badge
├── AMBF violation → building footprint highlighted red
├── Building extends into setback zones → red overlay on intruding portions
├── Compliance panel: 3 violations listed with code citations
STEP 3: Student reads each violation, understands why, adjusts back
├── Reduces footprint → PSO and AMBF clear
├── But TGFA still exceeded → need to reduce stories
├── Reduces from 4 to 3 stories → all violations clear
└── EMOTION: "I see — it's a system of interconnected constraints, not independent rules."
```

---

## 5. UX Trails (Interaction Sequences)

### 5.1 Parametric Slider Adjustment Trail

```
IDLE STATE:
  Slider at 185mm | Dimension line shows "185mm" in blue | Compliance: ✅ PASS

USER ACTION: Hover over slider thumb
  → Cursor changes to grab cursor
  → Tooltip appears: "Riser Height (PD 1096 §804: max 200mm)"

USER ACTION: Click and drag slider right
  → 190mm: Dimension line updates in real-time, still blue, still passing
  → 195mm: Approaching limit, dimension line turns amber/warning
  → 200mm: Exactly at limit, dimension line amber with "AT LIMIT" badge
  → 201mm: VIOLATION THRESHOLD
    → Dimension line turns RED with dashed pattern
    → Compliance badge flips from ✅ to ❌
    → Code reference panel highlights: "PD 1096 §804: Max riser = 200mm"
    → 3D geometry: risers tint red
    → KPI bar: violation count increments

USER ACTION: Release slider at 210mm
  → Violation state persists
  → Sidebar shows violation detail with "Fix: reduce to 200mm or less"

USER ACTION: Type "175" into numeric input field next to slider
  → Slider jumps to 175mm
  → All violation indicators clear
  → Geometry updates
  → Compliance badge: ✅ PASS
  → Blondel formula recalculates: 2(175) + 250 = 600mm → GOOD (600-650 range)
```

### 5.2 Camera Navigation Trail

```
USER STATE: Default orbit perspective view

USER ACTION: Tap "Plan" button (or press "2")
  → Camera position lerps from [18, 14, 20] to [10, 50, 7.5] over 600ms
  → OrbitControls target lerps to [10, 0, 7.5]
  → Camera projection switches to orthographic
  → Active button in camera bar highlights
  → Keyboard shortcut "2" shown in button tooltip

USER ACTION: After reading plan view, tap "Front" (or press "3")
  → Camera lerps from [10, 50, 7.5] to [10, 8, 40] over 600ms
  → View shows front elevation
  → BHL envelope visible as horizontal line at building height limit
  → Dimension lines show building height vs. BHL

USER ACTION: Press "1" (orbit/perspective)
  → Camera lerps back to default perspective position
  → Projection returns to perspective

USER ACTION: Scroll mouse wheel forward (or pinch-zoom in)
  → Camera dollies toward the model center
  → Zoom speed: fast at distance, decelerates when close (logarithmic)
  → Minimum distance constraint prevents clipping through geometry
```

### 5.3 Discovery Trail — Finding Hidden Features

```
NEW USER explores the interface:

DISCOVERY 1: Keyboard shortcuts (accidental)
  → User presses "G" while typing in another field
  → Grid toggles off/on
  → User notices the change, presses "G" again → understood!
  → From now on, uses "G" instead of finding the grid toggle button

DISCOVERY 2: Dimension labels (hover)
  → User hovers over a dimension line in the 3D scene
  → Tooltip shows: "Front setback: 3.0m (PD 1096 Table VIII.2)"
  → User clicks → sidebar scrolls to the setback parameter
  → User realizes: clicking 3D elements navigates the sidebar

DISCOVERY 3: Preset cards (scrolling)
  → User scrolls past the parameter sliders in the sidebar
  → Finds "Quick Presets" section with scenario cards
  → Clicks "Commercial Corner Lot (Com-2)"
  → All parameters update atomically — the entire scene reconfigures
  → User thinks: "Oh, I can jump between scenarios instead of adjusting every slider"

DISCOVERY 4: Compliance cross-linking
  → User sees a violation badge on the AMBF metric
  → Clicks the badge
  → Sidebar opens the AMBF compliance detail with the code citation
  → Links to the wiki article "What is AMBF?"
  → User reads the wiki, returns to the 3D module with deeper understanding
```

### 5.4 Error Recovery Trail

```
USER MAKES MISTAKE: Sets riser height to 300mm (way over limit)

IMMEDIATE FEEDBACK:
  → Multiple violations fire simultaneously
  → 3D model looks obviously wrong (stairs are dangerously steep)
  → Compliance panel: 4 violations listed
  → User realizes the error immediately (visual feedback was instant)

RECOVERY OPTION 1: Manual correction
  → User drags slider back to 185mm
  → All violations clear one by one as parameters enter compliant ranges
  → User learns the safe range through the violation boundaries they encountered

RECOVERY OPTION 2: Undo (Ctrl+Z)
  → State reverts to previous parameter values
  → All geometry and compliance states restore
  → Toast notification: "Undo: Riser Height 300mm → 185mm"

RECOVERY OPTION 3: Reset to default
  → User clicks "Reset" button on the riser height parameter
  → Value returns to default (185mm)
  → Or: user clicks "Apply Preset" → full module resets to a known-good state
```

---

## 6. User Journey Maps

### 6.1 ALE Student — 3D Lab Learning Journey

```
PHASE 1: AWARENESS (Pre-visit)
─────────────────────────────────────
Touchpoint: SlateCamp dashboard → 3D Lab catalog card
Thinking:   "What is the 3D Lab? How will this help me pass the ALE?"
Feeling:    😐 Curiosity mixed with skepticism
Action:     Clicks "Explore 3D Lab" from dashboard
Pain Point: No preview of what's inside — the catalog card needs a screenshot or animation
Opportunity: Show a 15-second preview GIF on the catalog card

PHASE 2: FIRST CONTACT (Module entry)
─────────────────────────────────────
Touchpoint: Module loading → initial 3D scene
Thinking:   "Okay, it's a 3D building on a lot. What do I do?"
Feeling:    😰 Slightly overwhelmed — unfamiliar interface
Action:     Waits for guided tour to start (or looks for "How to use" button)
Pain Point: If tour doesn't auto-start, user stares at screen not knowing what to do
Opportunity: Auto-start tour on first visit. Large "Start Tour" button if user dismissed accidentally.

PHASE 3: GUIDED LEARNING (Tour)
─────────────────────────────────────
Touchpoint: Tour stops 1-6, each highlighting one concept
Thinking:   "Oh, so THAT'S what setbacks look like in 3D. The formula makes sense now."
Feeling:    😊 Growing confidence — abstract concepts becoming tangible
Action:     Advances through tour steps, reads tooltips, watches camera animate
Pain Point: Tour too long (>6 steps causes dropout). Tour too fast (no time to read).
Opportunity: Keep tours to 5-6 stops maximum. Add "I understand, skip ahead" option.

PHASE 4: EXPLORATION (Sandbox)
─────────────────────────────────────
Touchpoint: Parameter sliders, camera controls, compliance panel
Thinking:   "What if I change the zone class? What happens to the setbacks?"
Feeling:    😄 Engaged — actively experimenting
Action:     Adjusts sliders, toggles views, creates violations to see what happens
Pain Point: Slider labels too technical without context. "PSO" means nothing to a first-time user.
Opportunity: Expandable labels: "PSO (Percentage of Site Occupancy) — how much of the lot is covered"

PHASE 5: COMPREHENSION (Mental model forming)
─────────────────────────────────────
Touchpoint: Seeing multiple parameters interact in real-time
Thinking:   "So FLAR limits total floor area, BHL limits height, and PSO limits footprint — they're all connected!"
Feeling:    🤩 Aha moment — the system clicks
Action:     Tests edge cases, creates intentional violations, reads compliance details
Pain Point: No way to save/bookmark an interesting configuration for later review
Opportunity: "Save Configuration" button → named presets student can revisit

PHASE 6: ASSESSMENT (Quiz integration)
─────────────────────────────────────
Touchpoint: In-context quiz or post-module quiz
Thinking:   "I think I know this... let me see"
Feeling:    🧐 Focused concentration
Action:     Answers quiz question while the 3D model is still visible
Pain Point: Quiz disconnected from 3D experience — if it's on a separate page, the spatial context is lost
Opportunity: In-canvas quizzing — questions overlay on the 3D scene

PHASE 7: MASTERY (Return visits)
─────────────────────────────────────
Touchpoint: Re-opening the module for review
Thinking:   "I need to practice Com-2 zone calculations before the exam"
Feeling:    😌 Confident, purpose-driven
Action:     Skips tour, goes straight to sandbox, tests specific scenarios
Pain Point: Can't remember which presets/configurations were useful last time
Opportunity: "Recent Configurations" section + "Exam Practice Mode" with timed scenarios
```

### 6.2 Professional Architect — Web 3D Parametric Tool Journey

```
PHASE 1: ENTRY
  Touchpoint: Direct URL or dashboard link
  Thinking:   "I need to check development controls for this site"
  Feeling:    😐 Task-oriented, wants speed
  Pain Point: Loading time >3 seconds = abandoned

PHASE 2: CONFIGURATION
  Touchpoint: Input fields, dropdowns
  Thinking:   "Lot is 25×18, R-3 zone, RROW 12m"
  Feeling:    ⚡ Efficient — wants direct input, not sliders
  Pain Point: Slider-only input is slow for professionals. Need type-in fields.

PHASE 3: ANALYSIS
  Touchpoint: KPI metrics, compliance panel, 3D visualization
  Thinking:   "What's my maximum buildable? What governs — FLAR or BHL?"
  Feeling:    🧐 Analytical focus
  Pain Point: Can't export the computation results for documentation

PHASE 4: ITERATION
  Touchpoint: Rapid parameter changes, preset switching
  Thinking:   "What if I adjust FLAR override? What about a corner lot?"
  Feeling:    🔄 Rapid iteration mode
  Pain Point: No side-by-side comparison of two scenarios

PHASE 5: OUTPUT
  Touchpoint: Screenshot, export, share link
  Thinking:   "I need this for the client meeting"
  Feeling:    ✅ Satisfied if export is quick; frustrated if it's not available
  Pain Point: No PDF export, no shareable link with preset state
```

### 6.3 Onboarding Journey: First Visit to Productive Use

```
DAY 0 (First Visit):
  ├── Sees 3D Lab catalog → picks a module → loads
  ├── Guided tour auto-starts → completes 5-6 steps (3-5 minutes)
  ├── Sandbox exploration → adjusts 2-3 parameters (5-10 minutes)
  ├── Encounters first violation → reads code reference → "aha!" moment
  ├── Takes in-context quiz → gets 1-2 questions right
  └── EXIT: "That was interesting. I'll come back."

DAY 1-3 (Return Visits):
  ├── Skips tour → goes straight to sandbox
  ├── Tests specific scenarios (retaker reviewing weak areas)
  ├── Discovers keyboard shortcuts by accident
  ├── Starts using camera presets to switch between plan/3D views
  └── EMOTION: Growing comfort, developing spatial muscle memory

WEEK 1-2 (Building Competence):
  ├── Knows which parameters affect which metrics
  ├── Uses presets to jump between scenarios
  ├── Reads compliance details with code citations
  ├── Cross-references with wiki articles
  └── EMOTION: Confidence — "I understand these rules"

WEEK 3-4 (Mastery):
  ├── Can predict the effect of parameter changes before making them
  ├── Uses the tool to verify exam practice question answers
  ├── Helps other students by explaining spatial concepts
  ├── Creates intentional violations to understand edge cases
  └── EMOTION: Mastery — "I can solve any site development controls problem"
```

### 6.4 Emotional Curve

```
Excitement ────────────────────────────────────────────────
                 ╱╲
                ╱  ╲         ╱──── Aha! moment (exploration)
  Curiosity ───╱    ╲       ╱
              ╱      ╲     ╱
             ╱        ╲   ╱
            ╱   OVERWHELM ╲╱ ← Trough: "This is confusing"
           ╱
──────────╱
  Entry   Tour   Lost    Discover   Explore   Quiz    Master
```

**Critical design intervention at the trough:** This is where users drop off. The guided tour must get them past the overwhelm trough before releasing them to sandbox mode. If the tour is skippable and the user skips it, they hit the trough with no scaffolding → high dropout risk.

---

## 7. Information Architecture

### 7.1 Professional Tool UI Layout Comparison

| Tool | Top | Left | Right | Bottom | Viewport Overlays |
|------|-----|------|-------|--------|-------------------|
| **Revit** | Menu + Ribbon (contextual) | Project Browser + Properties | None (or Schedule panel) | Status bar + View controls | View cube, Navigation wheel |
| **SketchUp** | Menu + Toolbar | Tool palette | Tray panels (Entity Info, Layers, Components) | Measurements box + Status bar | Axis lines, Section planes |
| **Blender** | Editor type header + menus | T-panel (tools) | N-panel (properties + item + view) | Timeline + Status bar | Gizmos, overlays, grid |
| **Rhino** | Menu + Toolbars (tabbed) | Sidebar with tool options | Properties panel + Layers | Command line + Status bar | Gizmo, grid, CPlane |
| **ArchiCAD** | Menu + Toolbox | Toolbox | Settings/Properties | Status bar + Navigation | Tracker, Guide lines |

**Common pattern:** The viewport is always center and largest. Controls are always peripheral. The left side leans toward CREATION tools, the right side leans toward INSPECTION/PROPERTIES. The bottom is always status/feedback.

### 7.2 Best Practices for Sidebar vs. Floating vs. Docked Panels

| Layout Pattern | Best For | Worst For | Benchmark |
|----------------|----------|-----------|-----------|
| **Fixed docked sidebar** | Property inspection, parameters that are always relevant | Large-viewport-priority interfaces | Revit Properties, VS Code sidebar |
| **Floating panel** | Viewport controls that need to be near the cursor | Information-heavy panels (too much content to float) | Blender tool popups, SketchUp Component Browser |
| **Collapsible sidebar** | Two-panel layouts where user wants to maximize viewport | Users who forget to re-open the panel | SlateCamp ViewportShell left/right sidebars |
| **Bottom sheet (mobile)** | Touch interfaces where sidebars don't fit | Desktop interfaces (wastes vertical space) | Google Maps, SlateCamp mobile 3D |
| **Overlay HUD** | Real-time metrics that need constant visibility | Dense information (too much text blocks the viewport) | Game HUDs, SlateCamp KPI bar |

### 7.3 Organizing Tools When User Has Both 2D and 3D Views

**Revit approach:** Separate view types. Plan views have 2D annotation tools. 3D views have camera tools. The ribbon changes based on which view is active. This is clean but fragmenting — the user loses context when switching.

**Blender approach:** Single viewport with projection toggle (Numpad 5 = perspective/ortho, Numpad 7 = top, Numpad 1 = front). Same tools work in all views. Overlay settings (grid, axes, wireframe) are per-viewport but the toolbar is shared.

**Recommended for web 3D educational tools:** Single viewport with camera preset switching (SlateCamp's CameraPresetBar). The toolbar is shared and always available. View-specific overlays (dimension lines in plan view, massing in 3D view) activate automatically based on the current camera preset.

---

## 8. Accessibility in 3D Interfaces

### 8.1 WCAG Considerations for Web 3D

| WCAG Criterion | Application to 3D |
|---------------|--------------------|
| 1.1.1 Non-text Content | All 3D interactive content must have a text alternative. Provide a "Text Description" toggle that shows a written summary of what the 3D scene shows. |
| 1.3.1 Info & Relationships | Visual hierarchy in sidebars must be programmatic (headings, labels, fieldsets). Screen readers must be able to navigate controls. |
| 1.4.1 Use of Color | Never use color alone to convey information. Pair red violation with icon, pattern, and text label. |
| 1.4.3 Contrast | 4.5:1 minimum for text on 3D overlays. Glass morphism with white text on dark backdrop achieves this. |
| 2.1.1 Keyboard | All sidebar controls keyboard-accessible. Camera presets accessible via number keys. Toolbar accessible via shortcut keys. |
| 2.4.7 Focus Visible | Visible focus indicators on all interactive elements, including 3D hotspots. |
| 2.5.1 Pointer Gestures | Complex gestures (two-finger orbit) must have single-pointer alternatives (button-based camera controls). |

### 8.2 Colorblind-Safe 3D Visualization

- Use blue-orange (not red-green) for pass/fail visualization
- Add patterns: solid lines for compliant, dashed lines for violations
- Add text labels: "PASS" / "FAIL" alongside color badges
- Test all color combinations with a colorblindness simulator

### 8.3 Keyboard-Only 3D Navigation

| Key | Action |
|-----|--------|
| Tab | Cycle through sidebar controls |
| 1/2/3/4 | Camera presets |
| Arrow keys | Orbit camera (when viewport is focused) |
| +/- | Zoom in/out |
| Enter | Activate focused element |
| Esc | Close popover, exit focused state |

### 8.4 Reduced Motion

Respect `prefers-reduced-motion` media query:
- Disable camera animations (instant snap instead of 600ms lerp)
- Disable pulsing hotspot animations
- Disable violation highlight pulsing
- Keep essential motion (slider drag → geometry update) as this is the learning mechanism

---

## 9. Mobile & Touch UX for Web-Based 3D

### 9.1 Touch Gesture Standards

| Gesture | Action | Implementation |
|---------|--------|----------------|
| One-finger drag | Orbit rotate | OrbitControls default |
| Two-finger pinch | Zoom | OrbitControls default |
| Two-finger drag | Pan | OrbitControls with enablePan |
| Single tap on element | Select / open info | onClick handler on mesh |
| Single tap on empty space | Deselect / close all | onPointerMissed on Canvas |
| Long press on element | Show detailed info | Custom 500ms timer |
| Swipe bottom sheet up | Reveal parameter controls | Native CSS transition |

### 9.2 Responsive 3D Viewport Design

| Breakpoint | Layout | Sidebar Behavior |
|------------|--------|-----------------|
| ≥1024px (Desktop) | 3-column: left sidebar + viewport + right sidebar | Collapsible docked panels |
| 768-1023px (Tablet) | Viewport + right sidebar only | Left sidebar hidden, accessible via toggle |
| <768px (Mobile) | Full-width viewport | Both sidebars → bottom sheet tabs |

### 9.3 Thumb Zone for 3D Controls

On a 6" mobile phone (SlateCamp's primary device), the bottom third of the screen is the natural thumb zone. Place the camera preset bar and primary controls in this zone. Avoid placing critical controls in the top corners (hardest to reach).

```
┌──────────────────────┐
│                      │  ← HARD ZONE (top)
│    3D Viewport       │     Only: back button, module title
│                      │
│                      │  ← STRETCH ZONE (middle)
│                      │     Floating toolbar (optional)
│                      │
│   [Camera Bar]       │  ← NATURAL ZONE (bottom)
│   [Bottom Sheet ▲]   │     Camera presets, sheet handle
└──────────────────────┘
```

### 9.4 Performance Constraints Affecting UX on Mobile

- **Maximum triangle count:** 50K-100K for mid-range Android (Snapdragon 6-series, Mali-G78)
- **Texture resolution:** 1024×1024 max for mobile GPU memory
- **Draw calls:** Target <50 per frame
- **DPR:** Set to 1.0 on mobile (not 1.5 or 2.0) — huge performance impact
- **Frameloop:** Use `demand` mode (only render when something changes) — saves battery and prevents overheating
- **Instancing:** Use InstancedMesh for repeated elements (CHB blocks, stair risers, rebar)

**UX impact of poor performance:** Frame drops below 30fps cause input lag, which users perceive as "the interface is broken." Camera orbit feels sluggish, slider adjustments don't update smoothly, and the tool feels unresponsive. Performance IS UX on mobile.

---

## 10. Design System Patterns for 3D Software

### 10.1 Dark Mode Dominance in 3D Tools

**Why every professional 3D tool uses dark UI:**
- 3D viewports display rendered content with a wide luminance range. Light UI chrome creates glare that washes out the 3D scene.
- Architects work in 3D for hours. Dark UI reduces eye strain during extended sessions.
- Dark UI makes the 3D content the "figure" and the UI the "ground" — correct visual hierarchy.

**For web-based educational 3D:** Use dark UI for the viewport (dark background, dark overlays with glass morphism), light UI for sidebars and panels. This creates a clear distinction: dark = 3D viewing space, light = reading/control space. Matches the SlateCamp Unified Viewport audit recommendation: solid panels use `bg-card`, floating viewport overlays use `bg-black/60 backdrop-blur`.

### 10.2 Icon Design for 3D Tools

- **Wireframe/outline icons** (Lucide style) for toolbar actions — they're lightweight and don't compete with the 3D content
- **Isometric mini-icons** for view presets (tiny isometric cube for "Iso," flat square for "Plan")
- **Category color dots** on icons to indicate tool group (blue dot = measurement tools, green dot = visibility tools)
- **Consistent size:** 20×20px for inline icons, 24×24px for toolbar icons, 32×32px for touch targets

### 10.3 Typography in 3D Overlays

- **Monospace font for numeric values** (DM Mono or JetBrains Mono): Ensures tabular alignment of numbers, critical for dimension readouts and KPI metrics
- **Sans-serif for labels** (Inter or system UI font): Readable at small sizes against 3D backgrounds
- **Minimum font size in 3D overlays:** 10px (with monospace) for dimension labels. Anything smaller becomes unreadable against busy 3D backgrounds.
- **Text shadow or background pill:** Always provide contrast for text rendered over 3D content. Use `bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded` for text pills, or `text-shadow: 0 1px 3px rgba(0,0,0,0.8)` for direct text.

### 10.4 Color Systems for 3D Feedback

| Function | Color | Hex | Usage |
|----------|-------|-----|-------|
| Code requirement / Dimension | Cobalt Blue | #1B3FC4 | Dimension lines, code reference badges |
| Measurement / Warning | Gold | #F5A623 | Approaching limit, measurement values |
| Violation / Error | Red | #E63329 | Non-compliant parameters, violation badges |
| Compliant / Success | Green | #22C55E | Passing compliance checks |
| Informational / Neutral | Gray | #6B7280 | General labels, disabled states |
| Interactive / Hover | Teal/Cyan | #06B6D4 | Hover highlights, active selections |
| Building code zones | Translucent fills | Various at 20-30% opacity | Setback volumes, AMBF, PSO zones |

**Material colors in 3D (zone overlays):**
Use `MeshBasicMaterial` with `transparent: true` and `opacity: 0.2-0.3` for zone volumes. Avoid `MeshStandardMaterial` for overlays — standard materials receive lighting and create confusing shadows. Zone overlays should be flat, unlit color fills.

---

## Appendix A: Key Academic References

| Author(s) | Year | Title / Topic | Relevance |
|-----------|------|---------------|-----------|
| Sweller, J. | 1988 | Cognitive Load Theory | Foundation for progressive disclosure and information chunking in 3D UI |
| Mayer, R.E. | 2009 | Multimedia Learning (2nd ed.) | 12 principles for combining visual + verbal information — directly applicable to 3D + text |
| Paivio, A. | 1986 | Dual Coding Theory | Theoretical basis for why 3D visualization improves memory vs. text alone |
| Fitts, P.M. | 1954 | Information Capacity of Human Motor System | Predicts movement time for target selection — applied to button sizing and layout |
| Wickens & Hollands | 2000 | Engineering Psychology and Human Performance | 2D representations require more mental effort than 3D for spatial tasks |
| Siegel & White | 1975 | Spatial Cognition: Landmark → Route → Survey | Framework for progressive spatial knowledge development |
| Roediger & Karpicke | 2006 | Testing Effect / Retrieval Practice | Basis for in-context quizzing during 3D exploration |
| Cha & Myung | 2013 | Extended Fitts' Law for 3D pointing | 3D target arrangement affects pointing performance |
| Grossman & Balakrishnan | 2004 | 3D Fitts' Law with depth | Extended Fitts' model for volumetric targets |
| Shelton, A.L. | 2003 | 3D reduces intrinsic cognitive load for spatial content | Direct support for interactive 3D in architecture education |
| Verghote et al. | 2019 | 3D models improve wayfinding for low-spatial-ability users | Students who struggle most benefit most from 3D interactive |

## Appendix B: Professional Tool UI Screenshots Reference

For visual reference, examine these tools' interfaces:

- **SketchUp for Web** (app.sketchup.com) — The gold standard for simple, accessible 3D architecture UI in a browser
- **Speckle Viewer** (app.speckle.systems) — WebGL-based 3D viewer with clean, minimal UI and annotation tools
- **Arkio** (arkio.is) — Collaborative 3D design tool with VR/desktop hybrid interface
- **Hypar** (hypar.io) — Parametric building design in the browser — very close to SlateCamp's paradigm
- **IFC.js / That Open Company** — Open-source BIM viewer with WebGL, Three.js-based
- **Clara.io** — Browser-based 3D modeling with traditional panel layout adapted for web

---

## Appendix C: SlateCamp-Specific Recommendations Summary

Based on this research, the following are the highest-priority UX interventions for SlateCamp's 3D Lab:

1. **Camera Navigation Bar (always visible, every module)** — The #1 usability gap. Already identified in the Unified Viewport UX Audit as Phase 0. Non-negotiable.

2. **Guided Tour as Default First Experience** — Auto-start on first visit for every module. 5-6 stops maximum. Builds landmark → route → survey knowledge progressively.

3. **Glass Morphism for Viewport Overlays** — Dark semi-transparent backgrounds for all floating UI over the 3D scene. Light theme for sidebars. Clear visual separation of "viewing space" vs. "control space."

4. **Code Violation Feedback Loop** — The parametric slider → real-time 3D update → violation highlight → code citation chain is the core learning mechanism. Every parameter must have this complete feedback loop.

5. **Progressive Disclosure in Sidebars** — Essential parameters visible by default. Advanced parameters collapsed. Expert settings behind the gear icon. Respects both novice and expert behavior patterns.

6. **In-Context Quizzing** — Questions overlaid on the 3D scene, not on a separate page. Maintains spatial context during assessment. Leverages Mayer's Spatial Contiguity Principle.

7. **Mobile-First Performance Targets** — 60fps on mid-range Android. Demand frameloop, instancing, LOD, DPR=1.0 on mobile. Performance IS UX.

8. **Keyboard Shortcuts + Command Palette** — Support power users without requiring keyboard for basic use. Show shortcuts in tooltips for discoverability.

9. **Preset-Based Starting Points** — Never start with a blank scene. Every module loads with a compliant, pre-configured example. Students modify from known-good state, not from zero.

10. **Consistent UI Chrome Across All 186 Modules** — The ViewportShell is the single layout container. Toolbar position, sidebar width, camera bar, header style are identical everywhere. Inconsistency breaks spatial memory and increases cognitive load.

---

*End of Research Document*
