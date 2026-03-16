# SlateCamp 3D Lab / Spatial Learning Engine — Master Execution Prompt

---

## ROLE

You are simultaneously:

1. **Elite EdTech CTO & Spatial Learning Visionary** — You understand that architecture is inherently spatial — teaching volumetric concepts (Floor Area Ratio, building massing, setbacks, structural systems) through 2D text and static images creates a massive cognitive bottleneck. The 3D Lab is not a gimmick or a demo — it is a pedagogical breakthrough. Students who can MANIPULATE a building's zoning envelope and watch it physically respond develop embodied understanding that survives exam pressure. This is the feature that makes SlateCamp irreplaceable for architecture students. No competitor has this.

2. **Principal React Three Fiber (R3F) Architect** — You have shipped production R3F applications in Next.js. You understand the critical performance constraints: each mesh is a draw call (aim for <100 per frame), state mutations happen in `useFrame` via refs (NOT React state), on-demand rendering (`frameloop="demand"`) saves battery on mobile, Drei's `<Html>` component bridges 3D coordinates to 2D UI, and Suspense boundaries are mandatory for asset loading. You know that 3D code is EXTREMELY token-heavy — you plan the architecture and state management BEFORE rendering any geometry. You use basic primitives (Box, Cylinder, Sphere) to perfect interaction logic first, then swap in production models later.

3. **World-Class Spatial UX Designer** — You design 3D interfaces that obey the same design system as the rest of the platform (GitHub Primer borders + Apple HIG typography). The 3D canvas is immersive but the overlay controls (sliders, info panels, tooltips) are crisp, readable, and familiar. You understand that the biggest UX failure in educational 3D is forcing the user's eyes to dart between the 3D scene and a distant sidebar — you solve this with Spatial Contiguity (anchoring information to the relevant 3D location using `<Html>` annotations).

4. **Educational Psychologist specializing in Constructivism & Spatial Cognition** — You are deeply versed in Constructivist Learning Theory (Piaget, Papert), Spatial Contiguity Principle (Mayer, 2001), Embodied Cognition (Barsalou, 2008), and Active Learning research (Freeman et al., 2014). You design 3D experiences where students LEARN BY BREAKING — they push sliders past legal limits and watch the building turn red with the exact code citation. The failure state IS the teaching moment.

---

## TASK

Architect and implement the SlateCamp "3D Lab / Spatial Learning Engine" — an interactive 3D learning playground integrated with the platform's Wiki taxonomy. The engine must support two primary pedagogical modes:

### Mode 1: Parametric Playgrounds ("Learn by Breaking")
Students manipulate real-world architectural variables via sliders and watch 3D geometry respond in real-time. When they exceed legal limits, the model visually "breaks" (turns red, shows violation indicator) with the exact building code citation.

**Example scene — Zoning & FAR Calculator:**
- Student adjusts: Lot Area, Floor Area Ratio multiplier, Building Height Limit, Required Setbacks
- 3D response: A building massing (Box geometry) scales dynamically. Exceeding FAR makes it red with "Exceeds PD 1096 §708: Max FAR = 4.0" annotation. Exceeding BHL triggers a height line with violation marker.
- The student develops EMBODIED understanding: "Oh, THIS is what FAR 4.0 physically looks like on a 500sqm lot."

### Mode 2: Anatomy Inspectors ("Spatial Contiguity")
Students explore architectural elements with clickable hotspots anchored to specific 3D coordinates. Clicking a hotspot reveals educational content — definitions, code references, related Wiki articles — WITHOUT leaving the 3D context.

**Example scene — Classical Orders:**
- 3D model: A Doric column built from stacked primitives (Base → Shaft with entasis → Capital)
- Hotspots: Clickable annotation points at Base, Shaft (showing entasis taper), Abacus, Echinus, each expanding into a rich tooltip with definition + Wiki link
- The student learns spatial relationships: "The echinus sits BETWEEN the abacus and the shaft — I can see the transition."

### Integration Requirements:
- Routes map to Wiki taxonomy: `/3d-lab/[subject]/[scene]`
- Every 3D hotspot can link back to the corresponding Wiki article
- Quiz integration: In-canvas questions ("Which part bears the load of the entablature?" → click the correct hotspot)
- All interactions feed the global analytics engine (time in 3D Lab, hotspots clicked, quiz answers)

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript
- **3D Stack:** `@react-three/fiber`, `@react-three/drei`, Three.js
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Postgres + RLS)
- **State Management:** Verify via codebase (likely Zustand — ideal for R3F bridge)
- **Design System:** GitHub Primer × Apple HIG hybrid (from previous overhaul)

### Critical R3F Performance Rules (Non-Negotiable)

These are verified best practices from the R3F documentation and Three.js performance guides. Violating ANY of these will cause stuttering, battery drain, or crashes on mobile:

**1. Never set React state in `useFrame`.**
```tsx
// ❌ BAD — triggers React re-render 60x/sec
const [rotation, setRotation] = useState(0)
useFrame(() => setRotation(r => r + 0.01))

// ✅ GOOD — direct ref mutation, zero re-renders
const meshRef = useRef<THREE.Mesh>(null)
useFrame(() => { meshRef.current!.rotation.x += 0.01 })
```

**2. Use `frameloop="demand"` for educational scenes.**
Most 3D Lab scenes are NOT continuously animated — they respond to user input (slider changes, clicks). Use on-demand rendering to save battery:
```tsx
<Canvas frameloop="demand">
```
When the user changes a slider, call `invalidate()` to trigger a re-render.

**3. Keep draw calls under 100.**
Each `<mesh>` is a draw call. For repeating elements, use instancing (`<Instances>` from Drei). Monitor with `r3f-perf` or SpectorJS.

**4. Reuse objects — never create in useFrame.**
```tsx
// ❌ BAD — allocates every frame
useFrame(() => { mesh.position.copy(new THREE.Vector3(1, 2, 3)) })

// ✅ GOOD — allocate once, reuse
const target = useMemo(() => new THREE.Vector3(1, 2, 3), [])
useFrame(() => { mesh.position.copy(target) })
```

**5. Suspense boundaries are mandatory for asset loading.**
```tsx
<Suspense fallback={<LoadingPlaceholder />}>
  <ModelComponent />
</Suspense>
```

**6. Use `<Html>` from Drei for 3D-anchored UI.**
This places React DOM elements at exact 3D coordinates — perfect for Spatial Contiguity annotations.
```tsx
import { Html } from '@react-three/drei'
<Html position={[0, 2, 0]} distanceFactor={10}>
  <div className="rounded-md border border-gray-300 bg-white p-3 shadow-lg">
    <h3>Capital</h3>
    <p>The topmost member of a column...</p>
  </div>
</Html>
```

**7. Memoize components that don't change.**
```tsx
const Floor = memo(() => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color="#f0f0f0" />
  </mesh>
))
```

**8. Dynamic imports for the Canvas.**
The entire R3F canvas should be dynamically imported to avoid SSR issues in Next.js:
```tsx
const Scene = dynamic(() => import('./Scene'), { ssr: false })
```

### Tools You MUST Use
- **Supabase MCP** — Query the Wiki/Subject taxonomy schema. The 3D Lab routing must mirror the taxonomy structure. Check for: subjects, topics, any existing 3D-related tables, content linking structure.
- **File System Tools** — Read the current project structure, especially: existing 3D Lab directory (if any), Wiki/content component patterns, shared UI components, state management setup, routing patterns.
- **`.claude/docs`, `.claude/skills`, `.claude/agents`** — Check and use.

---

## THE PEDAGOGICAL MANDATE

### 1. Constructivist Learning Theory (Piaget, 1954; Papert, 1980)
Knowledge is not transmitted — it is CONSTRUCTED by the learner through active manipulation of their environment. In traditional architecture education, students read about FAR in a textbook. In SlateCamp's 3D Lab, they BUILD a building, push it past the FAR limit, and FEEL the constraint.

**Practical implications:**
- Every parametric playground must have at least one "breakable" constraint — a threshold the student can exceed to see what happens
- The violation state is NOT an error — it is the most valuable teaching moment. Design it clearly: color change + code citation + explanation
- Students should be able to "undo" violations instantly (slide back below the limit) — the learning happens in the CONTRAST between legal and illegal states
- Never prevent the student from breaking things. The sandbox must be truly free.

### 2. Spatial Contiguity Principle (Mayer, 2001)
Students learn better when corresponding words and pictures are presented near each other rather than far apart on the page or screen.

**Practical implications:**
- NEVER put educational content in a sidebar while the 3D model is in the center. Use Drei's `<Html>` to anchor annotations directly to 3D coordinates.
- Hotspot tooltips should appear AT the relevant geometry, not in a panel elsewhere
- When a slider changes a building dimension, the numerical value should appear ON the building face, not just in the slider UI
- The connection between "what I'm reading" and "what I'm seeing" must be SPATIALLY obvious

### 3. Embodied Cognition (Barsalou, 2008; Wilson, 2002)
Understanding is grounded in bodily experience. When students physically manipulate (drag, rotate, zoom) a 3D model, they form stronger mental representations than when passively viewing a diagram.

**Practical implications:**
- OrbitControls must be smooth and responsive — the student should feel like they're holding the building
- Touch/drag interactions on mobile must feel natural
- Camera transitions between hotspots should be smooth (use Drei's `<CameraControls>` or lerped camera movement)
- Allow students to rotate the model WHILE reading annotations — don't lock the camera during info display

### 4. Active Learning & "Desirable Difficulties" (Bjork, 1994; Freeman et al., 2014)
Active engagement with material produces stronger learning than passive observation. The 3D Lab should include "in-canvas quizzing" — questions that the student answers by interacting with the 3D scene.

**Practical implications:**
- Quiz integration: "Click the part that bears the load of the entablature" → student must click the correct column component
- Feedback is immediate and spatial: correct click = green highlight + explanation; incorrect = gentle "Not quite — that's the shaft. The capital is above it."
- These interactions feed the platform's analytics engine — quiz performance in 3D Lab contributes to the Readiness Score

---

## THE 3D-TO-2D BRIDGE (Critical Architecture Decision)

The hardest engineering challenge in this feature is the **bidirectional state bridge** between React (2D UI: sliders, panels, buttons) and R3F (3D canvas: geometries, materials, cameras).

### The Problem
R3F runs inside a `<Canvas>` which is a separate React reconciler. React state changes outside the Canvas DON'T automatically propagate inside it without careful architecture. Naive approaches (lifting state to a parent, using Context) cause the ENTIRE Canvas to re-render on every slider change — destroying performance.

### The Solution: Zustand Store as the Bridge
Zustand stores live OUTSIDE the React tree. Both 2D UI components and 3D R3F components can subscribe to the same store without coupling their render cycles.

```tsx
// stores/labStore.ts
import { create } from 'zustand'

interface LabStore {
  // Parametric Playground State
  lotArea: number
  far: number
  bhl: number
  setbacks: { front: number; side: number; rear: number }

  // Actions
  setLotArea: (v: number) => void
  setFar: (v: number) => void
  setBhl: (v: number) => void
  setSetback: (side: string, v: number) => void

  // Derived state
  maxFloorArea: () => number
  isViolation: () => boolean
}
```

**In 2D UI (slider):**
```tsx
const lotArea = useLabStore(s => s.lotArea)
const setLotArea = useLabStore(s => s.setLotArea)
// Slider onChange → setLotArea(value)
```

**In 3D scene (building geometry):**
```tsx
// Inside useFrame — subscribe via Zustand's getState() to avoid re-renders
useFrame(() => {
  const { lotArea, far, bhl } = useLabStore.getState()
  const buildingHeight = (lotArea * far) / lotArea // simplified
  meshRef.current!.scale.y = buildingHeight
  // Change color if violation
  const isViolation = buildingHeight > bhl
  materialRef.current!.color.set(isViolation ? '#ef4444' : '#3b82f6')
  invalidate() // trigger re-render since frameloop="demand"
})
```

This pattern gives us:
- ✅ No React re-renders when sliders change (only Zustand store updates)
- ✅ 3D geometry updates via refs in useFrame (60fps capable)
- ✅ 2D UI stays reactive via Zustand selectors
- ✅ Clean separation of concerns

**The AI MUST implement this pattern.** Any other approach will cause performance issues.

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

**CRITICAL: 3D code is the most token-expensive code in the entire platform. A single R3F scene with lighting, controls, geometry, materials, and annotations can be 200+ lines. You MUST be disciplined.**

1. **Architecture FIRST, geometry LAST.** Phases 1-3 establish routing, state management, and component shells BEFORE any 3D rendering code. This is non-negotiable.
2. **Use primitives, not models.** All scenes use basic Three.js geometries (Box, Cylinder, Sphere, Plane) during initial implementation. Production GLTF/GLB models are a Phase 6+ concern.
3. **No verbose explanations.** Read files, present findings in tables. Execute code directly.
4. **Batch related operations.** Read multiple files in succession without analysis paragraphs between each.
5. **Share code via abstractions.** Create shared hooks (`useParametricScene`, `useHotspotAnnotation`) instead of duplicating scene setup code across scenes.
6. **Minimize material/geometry code.** Define materials once, reuse via refs or shared constants.
7. **One scene at a time.** Build the Zoning Playground completely before starting the Anatomy Inspector. Don't attempt both in the same phase.
8. **No shaders, no post-processing, no physics.** These are optimization and polish concerns for later phases. Get the core interaction model working first.

---

## PHASED EXECUTION PLAN

Follow strictly. Each phase builds on verified outputs. **Do NOT skip. Do NOT render 3D until Phase 3 at earliest.**

---

### PHASE 1: Taxonomy Audit & 3D Infrastructure Architecture

**Objective:** Map the database taxonomy that drives 3D Lab routing, design the state management bridge, and establish the file structure.

**Step 1.1 — Database Taxonomy Audit**
Use Supabase MCP to inspect:
- Wiki subject/topic taxonomy tables — what are the top-level subjects? These become `/3d-lab/[subject]` routes
- Any existing 3D-related tables or columns (model paths, scene configurations)
- Content linking structure — how do Wiki articles reference topics? (We need to link hotspots back to articles)
- Quiz/question tables — are questions tagged to topics? (For in-canvas quizzing)

**Step 1.2 — Codebase Audit**
Read:
- Project directory structure (does `/src/app/3d-lab/` exist?)
- State management setup (Zustand store location, patterns)
- Wiki/content component patterns (how are articles structured?)
- Existing shared UI components
- `package.json` — verify `@react-three/fiber` and `@react-three/drei` are installed
- Any `.claude/docs`, `.claude/skills`, `.claude/agents`

**Step 1.3 — Output: Infrastructure Plan**

```
## TAXONOMY → ROUTING MAP
| Subject | Route | Possible Scenes | Scene Type |
|---------|-------|-----------------|------------|
| Zoning & Building Codes | /3d-lab/zoning | FAR Calculator, BHL Visualizer, Setback Explorer | Parametric |
| Structural Systems | /3d-lab/structural | Beam Loading, Column Types, Truss Anatomy | Mixed |
| History of Architecture | /3d-lab/history | Classical Orders, Gothic Vault, Arch Types | Anatomy |
| ... | ... | ... | ... |

## STATE MANAGEMENT ARCHITECTURE
- Store: Zustand (location, interface definition)
- Bridge pattern: [describe the 2D↔3D communication approach]
- Performance safeguards: [frameloop, invalidation strategy]

## FILE STRUCTURE PLAN
src/
  app/
    3d-lab/
      page.tsx — Scene gallery/index
      [subject]/
        page.tsx — Subject scene selector
        [scene]/
          page.tsx — Individual 3D scene
      _components/
        CanvasWrapper.tsx — Shared Canvas setup with lights, controls, Suspense
        ControlPanel.tsx — Floating slider/toggle panel (2D overlay)
        InfoDrawer.tsx — Expandable educational content panel
        HotspotAnnotation.tsx — Reusable 3D-anchored tooltip
        ViolationIndicator.tsx — Code violation display
      _stores/
        labStore.ts — Zustand store for parametric state
      _hooks/
        useParametricScene.ts — Shared scene setup logic
        useInvalidateOnChange.ts — Trigger re-render on store changes

## COMPONENT ARCHITECTURE
[Define the component tree for both Parametric and Anatomy modes]

## PERFORMANCE BUDGET
- Target: 60fps on modern phones, 30fps minimum on low-end
- Max draw calls: 50 per scene
- Max triangles: 10,000 per scene (primitives only)
- frameloop: "demand" for all scenes
- Assets: No textures, no GLTF models in initial phases
```

**STOP HERE.** Output the infrastructure plan and say:
> "Phase 1 Complete. I have the taxonomy routing map, state management architecture, and file structure plan. Reply 'Proceed' to generate the Spatial UX Blueprint in Phase 2."

---

### PHASE 2: Spatial UX & Canvas Blueprint

**Objective:** Design the exact layout, interaction model, and visual language for the 3D Lab experience.

**Step 2.1 — Screen Layout Architecture**

Define the spatial arrangement for both modes:

**Parametric Mode Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Lab]    Zoning & FAR Calculator    [? Help]     │  ← Header (2D overlay, bg-white/80 backdrop-blur)
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                   ┌───────────┐                              │
│                   │           │ ← Building massing           │
│                   │  3D BOX   │    (scales with sliders)     │
│           ┌───────┤           ├──── "FAR: 3.2"              │  ← 3D Canvas (edge-to-edge)
│           │ LOT   │           │     (3D-anchored label)      │
│           │ PLANE │           │                              │
│           └───────┴───────────┘                              │
│    ┌─── BHL Reference Line (red if exceeded) ───────────┐   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Control Panel (floating, bottom-left) ────────────────┐ │
│  │  Lot Area     ═══════════●═══  500 sqm                 │ │  ← 2D overlay (GitHub card style)
│  │  FAR          ═══●═══════════  2.5                     │ │
│  │  BHL          ═════════●═════  15m                     │ │
│  │  Front Setback ══●══════════   3m                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Anatomy Mode Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Lab]    Classical Orders: Doric    [? Help]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                        ● ← Hotspot (clickable)               │
│                    ┌───────┐                                  │
│                    │CAPITAL│ ←── Expanded tooltip:            │
│                    ├───────┤     "The abacus is the flat     │
│                    │       │      slab at the very top..."   │
│                    │ SHAFT │     [Read Wiki Article →]        │
│                    │  with │                                  │
│                    │entasis│ ● ← Hotspot: "Entasis: the      │
│                    │       │     subtle convex curve..."      │
│                    ├───────┤                                  │
│                    │ BASE  │                                  │
│                    └───────┘                                  │
│              ═══════════════════ Ground Plane                 │
│                                                              │
│  ┌─ Info Panel (expandable, bottom) ──────────────────────┐ │
│  │  Part: Capital — Abacus                                 │ │
│  │  "A flat slab forming the uppermost member..."          │ │
│  │  [Read Full Article →]  [Quiz: Test Your Knowledge →]   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Step 2.2 — Design System for 3D Overlays**
All 2D overlay elements inside the 3D Lab must match the platform design system:
- Cards: `rounded-md border border-[#d0d7de] bg-white/90 backdrop-blur-sm shadow-lg`
- Text: Platform typography scale (11px labels, 13px body, 14px titles)
- Sliders: Custom styled to match platform (blue track, gray rail)
- Buttons: Platform button variants
- Transitions: 150-200ms ease for panel open/close
- **3D-specific:** `<Html>` annotations use the same card styling but with slightly reduced padding (`p-2`)

**Step 2.3 — Interaction Specifications**

| Interaction | Parametric Mode | Anatomy Mode |
|------------|----------------|--------------|
| Orbit (drag) | ✅ OrbitControls, constrained vertical | ✅ OrbitControls, full rotation |
| Zoom (scroll/pinch) | ✅ Bounded min/max | ✅ Bounded min/max |
| Slider change | Building geometry updates in real-time | N/A |
| Click hotspot | N/A | Expands annotation tooltip, highlights part |
| Violation trigger | Color change + annotation + code citation | N/A |
| Camera reset | Button in control panel | Button in control panel |
| Quiz mode | Slider challenge ("Set FAR to match max for Zone R-3") | Click challenge ("Click the echinus") |

**Step 2.4 — Mobile Considerations**
- Control panel collapses to a bottom sheet on mobile
- Hotspot annotations scale appropriately (Drei `distanceFactor`)
- Touch controls: two-finger orbit, pinch zoom, single-tap hotspot
- Canvas must be GPU-budget-conscious on mobile (reduce shadow quality, limit antialiasing)

**Step 2.5 — Loading & Empty States**
- Scene loading: Show skeleton Canvas with spinning loader + "Loading Zoning Calculator..."
- First-time user: Brief tooltip overlay explaining controls ("Drag to rotate, scroll to zoom, adjust sliders below")
- Error state: Graceful fallback if WebGL not supported ("Your browser doesn't support 3D. Here's the 2D diagram instead.")

**Step 2.6 — Output: Full Spatial UX Blueprint**

**STOP HERE.** Output the blueprint and say:
> "Phase 2 Complete. The Spatial UX Blueprint is ready. Reply 'Proceed' to build the Core Canvas Infrastructure in Phase 3."

---

### PHASE 3: Core Canvas Infrastructure & Shared Components

**Objective:** Build the reusable infrastructure that ALL 3D Lab scenes share. No scene-specific content yet — just the wrapper, lighting, controls, overlay shells, and the Zustand bridge.

**Build these components:**

1. **`CanvasWrapper.tsx`** — The shared Canvas setup:
   - `<Canvas>` with `frameloop="demand"`, proper camera defaults, `dpr` clamping
   - Standard lighting rig (ambient + directional, no heavy shadows yet)
   - OrbitControls from Drei with configurable constraints
   - Suspense boundary with loading fallback
   - `r3f-perf` monitor (dev only)
   - Dynamic import wrapper for Next.js SSR safety

2. **`ControlPanel.tsx`** — The floating 2D control panel:
   - Positioned absolutely over the Canvas
   - Design system compliant (GitHub card styling with backdrop blur)
   - Accepts a `controls` prop array defining sliders/toggles
   - Each slider dispatches to the Zustand store
   - Collapsible on mobile (bottom sheet pattern)

3. **`HotspotAnnotation.tsx`** — Reusable 3D-anchored tooltip:
   - Uses Drei's `<Html>` positioned at a 3D coordinate
   - Two states: collapsed (small dot/icon) and expanded (card with content)
   - Design system styling
   - `distanceFactor` for size scaling with camera distance
   - `occlude` option to hide behind geometry

4. **`ViolationIndicator.tsx`** — Code violation display:
   - 3D-anchored via `<Html>` OR rendered as a Reference Line in the scene
   - Shows: violation type, code citation, current vs. allowed value
   - Red accent color (semantic, not decorative)

5. **`InfoPanel.tsx`** — Expandable educational content panel:
   - Bottom-anchored 2D overlay
   - Shows detailed text, Wiki article link, quiz button
   - Animates open/closed

6. **`labStore.ts`** — The Zustand store:
   - Scene-type-agnostic base state (active scene, camera position, active hotspot)
   - Parametric extension (slider values, violation state)
   - Anatomy extension (active part, expanded annotation)
   - `invalidate` function reference for triggering re-renders

7. **`useInvalidateOnChange.ts`** — Custom hook:
   - Subscribes to Zustand store changes
   - Calls `invalidate()` from R3F when relevant state changes
   - Prevents unnecessary re-renders for non-visual state changes

8. **`3d-lab/layout.tsx`** — Route layout:
   - Full-screen layout (no sidebar, minimal chrome)
   - Back navigation to dashboard
   - Scene title in header

**Execution Rules:**
- Full TypeScript types
- Tailwind CSS for all 2D elements
- Design system compliant (GitHub+Apple hybrid from previous overhaul)
- Mobile-responsive
- Performance-conscious (memoize static components, use refs for 3D mutations)
- No scene-specific content in this phase — only shared infrastructure

**STOP HERE.** Output all infrastructure code and say:
> "Phase 3 Complete. All shared 3D Lab infrastructure is built. Reply 'Proceed' to build the Parametric FAR Playground in Phase 4."

---

### PHASE 4: The Parametric FAR Playground ("Learn by Breaking")

**Objective:** Build the first complete interactive 3D scene — the Zoning & Floor Area Ratio Calculator.

**Step 4.1 — Scene Geometry**
Build with basic primitives only:
- **Lot plane:** `<Plane>` representing the lot footprint. Scales with lotArea slider.
- **Building massing:** `<Box>` representing the buildable volume. Height = (lotArea × FAR) / footprint. Width/depth = footprint minus setbacks.
- **BHL reference line:** A thin `<Box>` or `<Line>` at the Building Height Limit elevation. Always visible. Turns red when building exceeds it.
- **Setback lines:** Transparent `<Box>` or `<Line>` on each side showing required setback distances.
- **Ground plane:** Large `<Plane>` with grid texture for spatial reference.

**Step 4.2 — Mathematical Logic**
Implement the actual zoning math:
```
footprint = lotArea - (setbacks reduce buildable area)
maxFloorArea = lotArea × FAR
maxFloors = maxFloorArea / footprint
buildingHeight = maxFloors × floorHeight (assume 3m per floor)
isFARViolation = actualFloorArea > maxFloorArea
isBHLViolation = buildingHeight > BHL
```

**Step 4.3 — Visual Feedback**
- Normal state: Building is blue (brand color), lot is light gray
- FAR violation: Building turns `red-500`, annotation appears: "Exceeds FAR limit. PD 1096 §708"
- BHL violation: BHL reference line turns `red-500`, height annotation shows excess
- Setback violation: Building edge turns `red-500` where it encroaches

**Step 4.4 — 3D-Anchored Labels**
Using `<Html>` from Drei, display:
- Current building height (on the side face of the building)
- Current floor area (on the top face)
- FAR ratio (floating above the building)
- Violation annotations (at the violation point)

**Step 4.5 — Control Panel Wiring**
Wire the `ControlPanel` with these sliders:

| Slider | Min | Max | Default | Unit | Store Key |
|--------|-----|-----|---------|------|-----------|
| Lot Area | 100 | 2000 | 500 | sqm | lotArea |
| FAR | 0.5 | 8.0 | 2.5 | × | far |
| Building Height Limit | 6 | 60 | 15 | m | bhl |
| Front Setback | 0 | 10 | 3 | m | setbacks.front |
| Side Setback | 0 | 8 | 2 | m | setbacks.side |

**Step 4.6 — Verification**
- Sliders update geometry in real-time (no perceptible lag)
- Violation states trigger correctly with accurate math
- 3D annotations are readable and properly positioned
- Camera controls work smoothly
- Works on mobile (touch controls, responsive control panel)
- Performance: <50 draw calls, 60fps on desktop, 30fps+ on mobile

**Output:** Complete Zoning Playground scene code.

**STOP HERE.** Output the scene code and say:
> "Phase 4 Complete. The Parametric FAR Playground is fully functional. Reply 'Proceed' to build the Anatomy Inspector in Phase 5."

---

### PHASE 5: The Anatomy Inspector ("Spatial Contiguity")

**Objective:** Build the second complete scene type — the Classical Orders column explorer with clickable hotspot annotations.

**Step 5.1 — Scene Geometry**
Build a Doric column from stacked primitives:
- **Stylobate (base platform):** `<Box>` — wide, flat
- **Column base:** `<Cylinder>` — slightly wider than shaft
- **Shaft:** `<Cylinder>` with subtle taper (entasis effect via scaling or custom geometry)
- **Necking:** `<Cylinder>` — narrow ring transition
- **Capital - Echinus:** `<Cylinder>` — flared, cushion-like
- **Capital - Abacus:** `<Box>` — flat square slab
- **Entablature (partial):** `<Box>` — wide beam resting on capital

Each part should be a separate mesh with its own material (so it can be highlighted independently on hover/click).

**Step 5.2 — Hotspot Placement**
Define hotspot positions anchored to 3D coordinates:

| Part | Position (x,y,z) | Content |
|------|-----------------|---------|
| Stylobate | (0, 0.1, 0.8) | "The stepped base platform supporting the column order..." |
| Column Base | (0, 0.5, 0.8) | "The lowest part of the column, distributing loads to the stylobate..." |
| Shaft (Entasis) | (0, 2.0, 0.5) | "Entasis: the subtle convex curve of the shaft. Not straight — slightly bulges..." |
| Necking | (0, 3.5, 0.5) | "The narrow groove marking the transition between shaft and capital..." |
| Echinus | (0, 3.8, 0.8) | "The cushion-like element below the abacus. In Doric order, it has a simple convex profile..." |
| Abacus | (0, 4.1, 0.8) | "The flat slab at the very top of the capital. Bears the direct load of the entablature..." |

**Step 5.3 — Interaction Model**
- **Hover over part:** Subtle highlight (emissive increase or outline)
- **Click part:** Camera smoothly orbits/zooms to focus on the part. Hotspot annotation expands. Info Panel at bottom shows full educational content.
- **Click hotspot dot:** Same as clicking the part
- **Click away / click another part:** Previous part deselects, new part selects
- **"Read Wiki Article" button:** Links to the corresponding Wiki page (via taxonomy mapping from Phase 1)
- **Quiz mode button:** Switches to challenge mode — "Click the [part name]" prompts

**Step 5.4 — Quiz Integration**
In-canvas quiz flow:
1. Question appears in the Info Panel: "Which part bears the direct load of the entablature?"
2. All hotspot dots hide. Student must click the correct mesh.
3. Correct click: Mesh highlights green, "Correct! The abacus..." explanation appears
4. Incorrect click: Mesh flashes red gently, "Not quite — that's the echinus. Try again."
5. Result feeds to analytics (correct/incorrect, time to answer, which part was misidentified)

**Step 5.5 — Verification**
- All hotspots are correctly positioned and accessible
- Click/hover states work smoothly
- Camera transitions are smooth (no jumps)
- Info Panel content matches the clicked part
- Wiki links navigate correctly
- Quiz mode works end-to-end
- Mobile: hotspots are tappable (large enough touch targets)

**Output:** Complete Anatomy Inspector scene code.

---

### PHASE 6 (FUTURE): Production Polish

This phase is NOT in scope for the current prompt but is documented for planning:
- Replace primitive geometries with production GLTF/GLB models (Blender pipeline)
- Add environment maps (HDRI) for realistic lighting
- Texture the models appropriately
- Add more scenes across the taxonomy
- Implement scene gallery/index page
- Add progress tracking (which scenes visited, which hotspots explored)
- Performance optimization (LOD, texture compression, instancing)
- Accessibility: keyboard navigation for hotspots, screen reader descriptions

---

## DESIGN PRINCIPLES CHECKLIST

Before finalizing any 3D Lab component:

- [ ] **Performance:** Is `frameloop="demand"` set? Are mutations via refs, not state? Draw calls <50?
- [ ] **Spatial Contiguity:** Is educational text anchored near the relevant 3D geometry, not in a distant panel?
- [ ] **Constructivist:** Can the student "break" something? Is the violation state informative, not punitive?
- [ ] **Design System:** Do all 2D overlays match the GitHub+Apple hybrid system (borders, radius, typography)?
- [ ] **Mobile:** Do touch controls work? Is the control panel responsive? Are hotspots tappable?
- [ ] **Accessibility:** Is there a 2D fallback for no-WebGL browsers? Are annotations readable?
- [ ] **SSR Safety:** Is the Canvas dynamically imported? No server-side Three.js execution?
- [ ] **State Bridge:** Is Zustand the communication layer between 2D UI and 3D Canvas? No React state in useFrame?
- [ ] **Analytics:** Do interactions (hotspot clicks, quiz answers, time in scene) feed the global analytics engine?
- [ ] **Wiki Integration:** Can every hotspot link back to the relevant Wiki article?

---

## THE USER IN THE 3D LAB

A 23-year-old Filipino architecture student studying for the ALE. She's been reading about Floor Area Ratio in the Wiki but it's abstract — just numbers in a formula. She opens the 3D Lab, loads the Zoning Calculator.

She drags the FAR slider from 2.0 to 4.0 and watches the building GROW. She thinks, "Oh, so FAR 4.0 means the total floor area can be four times the lot." She pushes it to 6.0 — the building turns red, an annotation appears: "Exceeds PD 1096 §708. Max FAR for this zone: 4.0." She slides it back to 4.0 — it turns blue again. She now UNDERSTANDS FAR in a way that reading the code section never achieved.

She switches to the Classical Orders scene. She clicks the echinus and reads about its convex profile. She rotates the column and sees how the entasis creates a subtle bulge in the shaft. A quiz pops up: "Click the part that sits directly on the shaft." She clicks the necking — "Not quite, that's the transition groove. The echinus sits on top." She clicks the echinus — correct. She'll remember this on exam day because she SAW it and TOUCHED it.

**This is the 3D Lab's purpose: transforming abstract knowledge into spatial understanding.**

---

## FINAL REMINDERS

1. **ARCHITECTURE BEFORE GEOMETRY.** Phases 1-3 establish routing, state, and shared infrastructure. Not a single polygon is rendered until Phase 3's CanvasWrapper.

2. **ZUSTAND IS THE BRIDGE.** 2D UI and 3D Canvas communicate through Zustand. Period. No lifting state to parent components. No Context wrapping the Canvas.

3. **DEMAND RENDERING SAVES EVERYTHING.** `frameloop="demand"` + `invalidate()` on store changes. The Canvas is idle until the student interacts.

4. **PRIMITIVES FIRST, MODELS LATER.** Boxes, Cylinders, Spheres, Planes. If it can be taught with a colored cube, use a colored cube. Production models are Phase 6.

5. **THE VIOLATION IS THE LESSON.** When a student pushes past a legal limit and the building turns red with a code citation — that is the single most valuable learning moment on the entire platform. Design it with care.

---

*Execute Phase 1 now. Begin the Taxonomy Audit & Infrastructure Architecture.*
