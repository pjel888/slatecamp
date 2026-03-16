# SlateCamp NBCP Parametric Envelope Generator — Master Execution Prompt
## The Most Comprehensive Interactive Building Code Simulator for ALE Preparation

---

## ROLE

You are simultaneously:

1. **Elite EdTech CTO & Architectural Technology Visionary** — You understand that memorizing the development control tables of PD 1096 (NBCP) is the single most grueling task in ALE preparation. Students stare at tables of PSO percentages, FLAR designations, BHL limits, and setback requirements — and none of it sticks because it's ABSTRACT. Numbers on a page. By building an interactive 3D simulator where the student changes the zoning from R-1 to R-3 and WATCHES the maximum building envelope expand vertically, you transform memorization into spatial intuition. This is the feature that makes SlateCamp worth 10x the price of any PDF reviewer.

2. **Principal React Three Fiber (R3F) Architect** — You have shipped production R3F apps in Next.js. You know the critical performance constraints: Zustand as the 2D↔3D bridge (never React state in useFrame), `frameloop="demand"` for interactive-but-not-animated scenes, ref mutations for geometry updates, memoized static components, and dynamic imports for SSR safety. You treat the math engine as a PURE FUNCTION layer completely separate from the rendering layer.

3. **Philippine Building Code (PD 1096 / NBCP) Domain Expert** — You have studied the 2004 Revised IRR of PD 1096, specifically Rule VII (Classification and General Requirements) and Rule VIII (Light and Ventilation). You understand the SEQUENTIAL application of development controls: FLAR → PSO → AMBF → BHL → TOSL → AMVB, and how setbacks, firewalls, and RROW width interact to determine the maximum buildable envelope. You know that the NBCP uses a LAYERED constraint model — multiple controls must be satisfied simultaneously, and the MOST STRINGENT applicable rule governs.

4. **World-Class Spatial UX Designer & Educational Psychologist** — You design 3D interfaces that follow the GitHub Primer × Apple HIG hybrid system. You apply Constructivist Learning Theory (Piaget, Papert) — the student learns by MANIPULATING variables and observing spatial consequences. The "violation state" (building turns red when exceeding BHL or FLAR) is the most valuable teaching moment. You follow the Spatial Contiguity Principle (Mayer) — labels and code citations appear ON the 3D geometry, not in a distant sidebar.

---

## TASK

Architect and implement the "Parametric NBCP Envelope Generator" — a comprehensive, interactive 3D simulation of Philippine Building Laws (PD 1096, Rules VII & VIII) within the SlateCamp 3D Lab.

**What the student experiences:**
1. They select a zoning classification (R-1, R-2, R-3, C-1, C-2, etc.)
2. They define their lot (dimensions in meters, lot type: inside/corner/through/end)
3. They set the RROW width (which determines BHL limits)
4. The system instantly computes ALL development controls: PSO, AMBF, FLAR, Max GFA, BHL, TOSL
5. A 3D building envelope renders on the lot, showing the MAXIMUM allowable volume
6. They can adjust setbacks, toggle firewalls, change zoning — and watch the envelope morph in real-time
7. When they exceed ANY limit, the building turns red with the EXACT code citation (e.g., "Exceeds Rule VII Table VII.2: Max BHL for R-2 = 5 storeys (15m)")
8. A live telemetry panel shows all computed values updating in real-time

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript
- **3D Stack:** `@react-three/fiber`, `@react-three/drei`, Three.js
- **State Management:** Zustand (for the math engine + 3D bridge)
- **Styling:** Tailwind CSS (GitHub Primer × Apple HIG hybrid)
- **Backend:** Supabase (Postgres + RLS)

### Tools You MUST Use
- **Web Search** — To verify ANY NBCP values you are uncertain about. The math MUST be accurate. An incorrect FLAR table entry could teach a student the wrong value for the ALE. VERIFY EVERYTHING.
- **Supabase MCP** — Check if any NBCP tables are already stored in the database.
- **File System Tools** — Read the existing 3D Lab infrastructure (from previous prompt's implementation), state management patterns, shared components.
- **`.claude/docs`, `.claude/skills`, `.claude/agents`** — Check and use.

---

## THE NBCP DOMAIN MODEL (PD 1096, Rules VII & VIII)

This is the mathematical core. **THE AI MUST VERIFY THESE VALUES against the actual NBCP IRR before implementing.** Use web search to cross-reference. An error here is an error on a student's exam.

### Key Definitions

| Term | Definition | Formula |
|------|-----------|---------|
| **TLA** | Total Lot Area | Width × Depth (in sqm) |
| **PSO** | Percentage of Site Occupancy — max portion of lot the building can cover at grade | PSO% × TLA = MACA |
| **MACA** | Maximum Allowable Construction Area | PSO × TLA |
| **AMBF** | Allowable Maximum Building Footprint — the actual footprint after setbacks | Min(MACA, TLA − setback_areas) — use the MORE STRINGENT |
| **FLAR** | Floor to Lot Area Ratio — limits total GFA relative to lot size | GFA = FLAR × TLA |
| **GFA** | Gross Floor Area — total usable floor area across all storeys | FLAR × TLA |
| **TGFA** | Total Gross Floor Area — GFA + non-GFA areas (courts, incremental setbacks) | GFA × Conversion Factor (1.2 for residential, 1.3 for non-residential) |
| **BHL** | Building Height Limit — max storeys/meters | From Table VII.2, modified by RROW width |
| **TOSL** | Total Open Space within Lot — area NOT occupied by building | TLA − AMBF (must meet minimum %) |
| **AMVB** | Allowable Maximum Volume of Building | AMBF × BHL (in meters) |
| **RROW** | Road Right of Way — width of the road the lot faces | Determines BHL limits and front setback |
| **ISA** | Impervious Surface Area — hardscaped open spaces | Part of TOSL |
| **USA** | Unpaved Surface Area — softscaped/planted areas | Part of TOSL |

### Table VII.G.1 — FLAR Designations by Zoning (VERIFY THESE)

**IMPORTANT: The AI MUST web-search to verify these values against the actual NBCP 2004 Revised IRR before implementing. These are reference values from research — they must be cross-checked.**

| Zoning | Character | FLAR Range | BHL (storeys) | BHL (meters) | PSO (Inside Lot) | PSO (Corner Lot) |
|--------|-----------|-----------|---------------|-------------|-------------------|-------------------|
| **R-1** | Low-density residential (single detached) | 1.00–1.50 | 3 | 9.00 | 80% | 80% |
| **R-2 Basic** | Medium-density residential (duplex, rowhouse) | 1.50–2.50 | 3 | 9.00 | 80% | 85% |
| **R-2 Max** | Medium-density residential (apartment) | 2.00–3.00 | 5 | 15.00 | 80% | 85% |
| **R-3** | High-density residential (medium-rise) | 4.00–6.00 | 12 | 36.00 | 70% | 75% |
| **R-4** | High-density residential (high-rise condo) | 6.00–9.00 | 18 | 54.00 | 70% | 75% |
| **R-5** | Very high-density residential | 6.00–12.00 | 36+ | 108.00+ | 60% | 65% |
| **C-1** | Low-intensity commercial | 2.00–3.60 | 5 | 15.00 | 80% | 85% |
| **C-2** | Medium-intensity commercial | 3.60–9.00 | 15 | 45.00 | 80% | 85% |
| **C-3** | High-intensity commercial | 9.00–15.00 | 30 | 90.00 | 70% | 75% |
| **I-1** | Light industrial | 1.50–2.00 | 5 | 15.00 | 70% | 75% |
| **I-2** | Medium industrial | 1.00–1.50 | 3 | 9.00 | 60% | 65% |

### Table VIII.2 — Minimum Yard/Setback Requirements for RESIDENTIAL (R-1) Buildings (VERIFY)

| Building Height | Front Yard | Side Yard | Rear Yard |
|----------------|-----------|-----------|-----------|
| 1 storey (≤3m above grade) | 3.00m (if RROW < 10m); 4.50m (if RROW ≥ 10m) | 1.50m | 2.00m |
| 2 storeys (≤6m) | 3.00m (if RROW < 10m); 4.50m (if RROW ≥ 10m) | 1.50m | 2.00m |
| 3 storeys (≤9m) | 4.50m | 2.00m | 2.00m |

### Table VIII.3 — Setback Requirements for NON-RESIDENTIAL & Higher-Density Buildings (VERIFY)

| RROW Width (meters) | Front Setback | Side Setback | Rear Setback |
|---------------------|--------------|-------------|-------------|
| Below 10.00 | 5.00m | 2.00m | 2.00m |
| 10.00 to below 15.00 | 5.00m | 2.00m | 2.00m |
| 15.00 to below 20.00 | 5.00m | 3.00m | 3.00m |
| 20.00 to below 30.00 | 6.00m | 3.00m | 3.00m |
| 30.00 and above | 8.00m | 5.00m | 5.00m |

**Incremental setback rule:** For buildings >2 storeys, setbacks increase by 0.30m per additional storey up to the 14th storey. Above 14 storeys, use 14th-storey setback.

### BHL Limits by RROW Width (VERIFY)

| RROW Width | Max BHL (storeys) | Max BHL (meters) |
|-----------|-------------------|-----------------|
| 6.00–7.00m | 3 | 9.00 |
| 8.00–9.99m | 5 | 15.00 |
| 10.00–11.99m | 5 | 15.00 |
| 12.00–14.99m | 12 | 36.00 |
| 15.00–19.99m | 15 | 45.00 |
| 20.00–29.99m | 18 | 54.00 |
| 30.00m+ | 36+ | 108.00+ (max 60 storeys/180m inland) |

**Critical rule:** The BHL is the LESSER of the zoning-based BHL and the RROW-based BHL.

### Firewall Rules (Rule VII)
- **R-1:** No firewalls permitted on ANY property line
- **R-2:** Firewalls allowed on SIDE and REAR property lines only (not front/RROW-facing). Max 2-storey component structure.
- **R-3 and above:** Firewalls allowed per Fire Code, up to 70% of total perimeter IF sprinklered
- **With firewall:** The building footprint CAN abut the property line on the firewall side (setback = 0 on that side)
- **Without firewall:** Full setback requirements apply on all sides

### The Sequential Calculation Flow

```
INPUTS:
  lotWidth, lotDepth → TLA = lotWidth × lotDepth
  zoningClass → Look up: FLAR, baseBHL, basePSO
  lotType → Modify PSO (corner lots get +5% in some zones)
  rrowWidth → Look up: rrowBHL, front setback
  firewallSides → Boolean for each side (front, rear, left, right)

STEP 1: Determine FLAR and Max GFA
  maxGFA = TLA × FLAR
  maxTGFA = maxGFA × conversionFactor (1.2 residential, 1.3 commercial)

STEP 2: Determine BHL
  zoningBHL = from Table VII.G.1 based on zoningClass
  rrowBHL = from RROW table based on rrowWidth
  effectiveBHL = Math.min(zoningBHL, rrowBHL)  // MOST STRINGENT

STEP 3: Determine Setbacks
  For each side (front, rear, left, right):
    if firewallOnThisSide AND firewallAllowedByZoning:
      setback = 0
    else:
      setback = from Table VIII.2 (R-1) or VIII.3 (others), based on RROW and building height
    // Add incremental setback for upper floors if > 2 storeys:
    // incrementalSetback = 0.30 × min(effectiveBHL - 2, 12)

STEP 4: Determine AMBF
  AMBF_bySetbacks = (lotWidth - leftSetback - rightSetback) × (lotDepth - frontSetback - rearSetback)
  AMBF_byPSO = TLA × PSO
  AMBF = Math.min(AMBF_bySetbacks, AMBF_byPSO)  // MOST STRINGENT

STEP 5: Determine TOSL
  TOSL = TLA - AMBF
  TOSL_percent = TOSL / TLA × 100
  // Must meet minimum TOSL requirement (typically 100% - PSO%)

STEP 6: Determine AMVB
  AMVB = AMBF × (effectiveBHL_in_storeys × 3.00)  // 3m per storey assumed
  
STEP 7: Crosscheck
  actualTGFA = AMBF × effectiveBHL_in_storeys  // floor area per storey × storeys
  if actualTGFA > maxTGFA → VIOLATION: "FLAR exceeded"
  // May need to reduce number of storeys to fit within FLAR

STEP 8: Violation Detection
  for each computed value:
    if exceeds limit → flag violation with exact code citation
```

---

## THE PEDAGOGICAL MANDATE

### "Learning by Breaking" — Constructivist Approach

The simulation MUST allow the student to BREAK the rules. This is not a calculator that prevents invalid inputs — it is a sandbox where exceeding limits produces VISIBLE, EDUCATIONAL consequences.

**Example teaching moments:**
1. Student sets lot to 200sqm in R-1 zone → sees a modest 3-storey envelope
2. Switches to R-3 → envelope EXPANDS dramatically (12 storeys!) → "Oh, THAT's what high-density zoning means spatially"
3. Narrows RROW from 15m to 7m → BHL drops from 12 to 3 storeys despite R-3 zoning → "The RROW limits the height even though the zoning allows it!"
4. Toggles firewall ON for left side → left setback drops to 0, AMBF increases → "Firewalls let you build closer to the property line"
5. Pushes FLAR slider past maximum → building turns red: "Exceeds Rule VII Table VII.G.1: Max FLAR for R-2 = 3.00" → student now REMEMBERS the FLAR limit because they SAW it break

### Spatial Contiguity — Labels ON the Model

Using Drei's `<Html>` component:
- Building HEIGHT label appears on the side face of the building
- Building FOOTPRINT dimensions appear on the top face
- SETBACK dimensions appear as labels on the ground between building edge and property line
- FLAR and GFA values float above the building
- Violation annotations appear AT the point of violation (e.g., height violation at the top of the building)

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

**CRITICAL: This is the most complex feature on the platform. The math engine alone has 50+ variables. 3D rendering is token-heavy. You MUST be disciplined.**

1. **MATH FIRST, GEOMETRY LAST.** The calculation engine (Zustand store + pure TypeScript) is built and VERIFIED before a single polygon is rendered. Phases 1-2 are pure math. Phase 3 is UI. Phase 4 is 3D.
2. **VERIFY EVERY NBCP VALUE.** Use web search to cross-check any value you're uncertain about. An incorrect PSO percentage is a bug that teaches the student wrong information for the ALE.
3. **Use primitives only.** Box for building, Plane for lot, Line for setbacks. No GLTF models. No textures. No shaders.
4. **No verbose explanations.** Tables and code. Brief transitions only.
5. **Batch related state.** The Zustand store should have ONE computed state derivation function that runs the full sequential calculation, not individual watchers per variable.
6. **Reuse infrastructure.** Use the CanvasWrapper, ControlPanel, HotspotAnnotation, and labStore patterns from the 3D Lab infrastructure prompt.

---

## PHASED EXECUTION PLAN

Follow strictly. **MATH → UI → 3D. In that order. No exceptions.**

---

### PHASE 1: NBCP Domain Logic & Data Architecture

**Objective:** Define the complete mathematical model and Zustand store architecture. NO code yet — just the verified data tables and calculation specification.

**Step 1.1 — Verify NBCP Values**
Use web search to verify EVERY value in the tables above against the actual 2004 Revised IRR of PD 1096. Specifically verify:
- FLAR designations for each zoning class (Table VII.G.1)
- BHL limits by zoning (Table VII.2)
- BHL limits by RROW width
- PSO percentages by zoning and lot type (Table VIII.1)
- Setback tables for residential (Table VIII.2) and non-residential (Table VIII.3)
- Firewall rules by zoning class
- Incremental setback rates (0.30m per storey)
- GFA to TGFA conversion factors

**Step 1.2 — Check Existing Database**
Use Supabase MCP to check if any NBCP data is already stored (tables, constants, zoning lookup).

**Step 1.3 — Check Existing Codebase**
Read the 3D Lab infrastructure to understand what shared components are available.

**Step 1.4 — Output: Verified Domain Model**

```
## VERIFIED NBCP CONSTANTS
[Tables with source citations for each value]

## ZUSTAND STORE ARCHITECTURE
interface NBCPInputs {
  lotWidth: number         // meters
  lotDepth: number         // meters
  zoningClass: ZoningClass // enum
  lotType: LotType         // inside | corner | through | end
  rrowWidth: number        // meters
  firewalls: { front: boolean; rear: boolean; left: boolean; right: boolean }
  floorHeight: number      // meters per storey (default 3.0)
}

interface NBCPComputed {
  tla: number              // total lot area
  flar: number             // applicable FLAR
  maxGFA: number           // max gross floor area
  maxTGFA: number          // max total gross floor area
  pso: number              // applicable PSO percentage
  maca: number             // max construction area from PSO
  ambf: number             // actual building footprint (most stringent)
  bhl_zoning: number       // BHL from zoning (storeys)
  bhl_rrow: number         // BHL from RROW (storeys)
  bhl_effective: number    // effective BHL (min of above)
  bhl_meters: number       // effective BHL in meters
  setbacks: { front: number; rear: number; left: number; right: number }
  incrementalSetback: number
  tosl: number             // total open space
  tosl_percent: number
  amvb: number             // max volume
  buildableWidth: number   // lot width minus side setbacks
  buildableDepth: number   // lot depth minus front/rear setbacks
  violations: Violation[]  // array of { type, message, codeCitation }
}

## CALCULATION FLOW (Pseudocode)
[Step-by-step with exact formulas]

## VIOLATION DETECTION RULES
[Each violation with its exact PD 1096 citation]
```

**STOP HERE.** Say:
> "Phase 1 Complete. All NBCP values verified against the IRR. Zustand store architecture defined. Reply 'Proceed' to implement the Math Engine in Phase 2."

---

### PHASE 2: The Zustand Math Engine

**Objective:** Implement the pure TypeScript calculation engine and Zustand store. ZERO rendering code. This phase produces files that can be unit-tested independently.

**Step 2.1 — NBCP Constants File**
Create `src/app/3d-lab/_constants/nbcp.ts`:
- All lookup tables as TypeScript const objects
- Typed enums for ZoningClass, LotType
- Setback lookup functions
- BHL lookup functions
- PSO lookup functions
- FLAR lookup functions

**Step 2.2 — Calculation Engine**
Create `src/app/3d-lab/_utils/nbcpCalculator.ts`:
- Pure function: `calculateEnvelope(inputs: NBCPInputs): NBCPComputed`
- Implements the full sequential calculation flow from Phase 1
- Returns ALL computed values including violations
- NO side effects, NO rendering code, NO React dependencies
- Every formula annotated with its Rule/Section reference

**Step 2.3 — Zustand Store**
Create `src/app/3d-lab/_stores/nbcpStore.ts`:
- Input state with setters for each parameter
- Derived computed state using the calculation engine
- `invalidate` function reference for triggering 3D re-renders
- Presets: "Default R-1 Inside Lot" / "Default R-3 Corner Lot" / etc.

**Step 2.4 — Verification**
- Test with known problems from ALE reviewers:
  - R-3, inside lot, TLA=4000sqm, RROW=15m, no firewalls → Expected AMBF, BHL, TGFA
  - R-1, corner lot, TLA=300sqm, RROW=8m → Expected setbacks, PSO
  - R-2, inside lot with firewall on one side → Expected AMBF increase

**Output:** All TypeScript files with verified math.

**STOP HERE.** Say:
> "Phase 2 Complete. The NBCP math engine is implemented and verified. Reply 'Proceed' to build the 2D Control Panel in Phase 3."

---

### PHASE 3: 2D Control Panel & Live Telemetry HUD

**Objective:** Build the interactive HTML overlay that drives the simulation. NO 3D code yet.

**Step 3.1 — Parameter Controls**

Build a floating control panel (design-system compliant) with these controls:

| Control | Type | Range | Default | Group |
|---------|------|-------|---------|-------|
| Lot Width | Slider + Number Input | 5–200m | 20m | Lot |
| Lot Depth | Slider + Number Input | 5–200m | 30m | Lot |
| Lot Type | Dropdown | Inside, Corner, Through, End | Inside | Lot |
| Zoning Class | Dropdown | R-1 through C-3, I-1, I-2 | R-2 Max | Zoning |
| RROW Width | Slider + Number Input | 6–40m | 12m | Road |
| Floor Height | Slider | 2.7–4.0m | 3.0m | Building |
| Firewall — Front | Toggle | On/Off | Off | Firewalls |
| Firewall — Rear | Toggle | On/Off | Off | Firewalls |
| Firewall — Left | Toggle | On/Off | Off | Firewalls |
| Firewall — Right | Toggle | On/Off | Off | Firewalls |

**Design requirements:**
- Collapsible sections (Lot, Zoning, Road, Firewalls)
- GitHub Primer card styling with backdrop blur
- Positioned on the left side, not overlapping the 3D view on desktop
- Bottom sheet on mobile
- Preset buttons: "R-1 Subdivision", "R-3 Apartment", "C-2 Commercial"

**Step 3.2 — Live Telemetry Panel**

Build a "Computed Values" read-out panel showing real-time calculations:

| Metric | Label | Format | Color Coding |
|--------|-------|--------|-------------|
| TLA | Total Lot Area | `600.00 sqm` | Gray (always valid) |
| PSO | Site Occupancy | `80%` | Gray |
| AMBF | Building Footprint | `384.00 sqm` | Gray or Red if constrained |
| FLAR | Floor to Lot Area Ratio | `3.00` | Gray or Red if exceeded |
| Max GFA | Max Gross Floor Area | `1,800.00 sqm` | Gray or Red |
| BHL | Building Height Limit | `5 storeys (15.00m)` | Gray or Amber if RROW-limited |
| BHL Source | Which limit governs | `RROW-limited` or `Zoning-limited` | Info text |
| TOSL | Open Space | `216.00 sqm (36%)` | Gray or Green if generous |
| AMVB | Max Volume | `5,760.00 m³` | Gray |
| Setbacks | F/R/L/R | `5.0 / 2.0 / 2.0 / 2.0 m` | Gray |
| **Violations** | Any active violations | `⚠ Exceeds FLAR: Rule VII §708` | **Red, prominent** |

**Design requirements:**
- Positioned on the right side or bottom
- Monospace numbers for alignment
- Violation section highlights RED with exact code citation
- Updates in real-time as sliders change

**Step 3.3 — Presets & Quick Actions**
- "Reset to Defaults" button
- Preset dropdown/buttons for common scenarios
- "Explain This" help button that shows a brief explanation of each term

**Output:** All 2D UI component code.

**STOP HERE.** Say:
> "Phase 3 Complete. The control panel and telemetry HUD are built. Reply 'Proceed' to build the 3D Canvas in Phase 4."

---

### PHASE 4: R3F Spatial Canvas & Reactive Geometry

**Objective:** Build the 3D visualization that reacts to the Zustand store in real-time.

**Step 4.1 — Scene Setup**
Using the shared CanvasWrapper from 3D Lab infrastructure:
- `frameloop="demand"`
- OrbitControls with constraints (polar angle limited so camera can't go underground)
- Ambient + directional light (no heavy shadows initially)
- Ground grid for spatial reference
- Camera default positioned at 45° elevation, looking at lot center

**Step 4.2 — Lot Plane**
- `<Plane>` representing the TLA
- Color: Light gray (`#e5e7eb`)
- Border: Property lines rendered as `<Line>` elements in dark gray
- Dimensions reactive to lotWidth × lotDepth
- Grid overlay showing 1m increments (subtle)

**Step 4.3 — Setback Zones**
- Colored zones on the ground showing each setback area:
  - Front setback: Light blue tint
  - Rear setback: Light blue tint
  - Side setbacks: Light blue tint
- `<Html>` labels showing setback distance at each side: "Front: 5.0m"
- Setback zones are BETWEEN property line and building edge

**Step 4.4 — Building Envelope (The Star)**
- `<Box>` geometry representing the maximum building volume
- Position: Centered within the buildable area (after setbacks)
- Dimensions: `buildableWidth × floorHeight × buildableDepth` scaled by BHL
- **Color states:**
  - Normal: Brand blue, semi-transparent (`opacity: 0.6`)
  - FLAR violation: Red semi-transparent
  - BHL violation (RROW): Amber semi-transparent
  - Multiple violations: Red
- Floor plates: Horizontal `<Plane>` elements at each storey level (subtle lines showing floors)
- Animated transitions when dimensions change (lerp in useFrame over 500ms)

**Step 4.5 — BHL Reference Line**
- Horizontal `<Line>` or thin `<Box>` at the max BHL height
- Always visible, even when building is below it
- Color: Green (within limit) or Red (exceeded)
- `<Html>` label: "BHL: 15.00m (5 storeys)" anchored to the line

**Step 4.6 — RROW Visualization**
- `<Plane>` in front of the lot representing the road
- Width = RROW width, depth extends beyond lot
- Color: Darker gray to distinguish from lot
- Center line marking
- `<Html>` label: "RROW: 12.0m"

**Step 4.7 — 3D-Anchored Labels (Spatial Contiguity)**
Using `<Html>` from Drei, display:
- Building height on the side face: "Height: 15.00m"
- Footprint on the top face: "AMBF: 384 sqm"
- FLAR floating above: "FLAR: 3.00"
- Each setback distance labeled on the ground
- Violation annotations at the point of violation

**Step 4.8 — Violation Visual Feedback**
When ANY violation is active:
- Building mesh material changes to red/translucent
- A violation `<Html>` annotation appears at the relevant location:
  - Height violation → top of building: "⚠ Exceeds BHL: 15.00m max (Rule VII §708)"
  - Footprint violation → side of building: "⚠ Exceeds AMBF: PSO 80% of TLA"
  - FLAR violation → above building: "⚠ FLAR 4.2 exceeds max 3.00 (Table VII.G.1)"
- 2D telemetry panel also shows violations

**Step 4.9 — Performance Safeguards**
- All geometry updates via refs in useFrame (subscribe to Zustand via `getState()`)
- `invalidate()` called from store on input change
- Memoize static elements (ground grid, RROW plane)
- Total draw calls: <30
- Smooth lerping for dimension changes (don't snap)

**Step 4.10 — Verification**
- Change every slider and verify visual response
- Trigger every violation type and verify visual + text feedback
- Verify accuracy: computed values in telemetry panel match hand-calculated values
- Test mobile touch controls
- Performance: 60fps desktop, 30fps+ mobile

**Output:** Complete 3D scene code.

**STOP HERE.** Say:
> "Phase 4 Complete. The 3D visualization is fully reactive. Reply 'Proceed' to integrate everything in Phase 5."

---

### PHASE 5: Integration, Edge Cases & Polish

**Objective:** Wire everything together and handle edge cases.

**Step 5.1 — Page Assembly**
- Route: `/dashboard/3d-lab/nbcp-envelope` (or as defined by existing routing)
- Layout: Full-width canvas with overlaid control panel (left) and telemetry (right)
- Mobile: Stack vertically — canvas on top, panels below
- Loading state: Skeleton with "Loading NBCP Simulator..."
- Error state: WebGL fallback message

**Step 5.2 — Edge Cases**
- Very small lots (<50sqm): Setbacks may exceed lot dimensions → show "Lot too small for setback requirements"
- Very large lots (>10,000sqm): Camera needs to zoom out → adjust camera distance dynamically
- Through lot: Has RROW on BOTH sides — front AND rear setbacks are RROW-based
- Corner lot: Has RROW on TWO perpendicular sides — affects PSO and setbacks
- End lot: Has RROW on one side plus access on the end
- Firewall not allowed in R-1: Toggle should be disabled with tooltip "Firewalls not permitted in R-1"
- RROW too narrow for zoning: If RROW BHL < zoning BHL, show info: "RROW limits height below zoning maximum"

**Step 5.3 — Presets with Teaching Context**
Pre-load scenarios that teach specific concepts:
1. "Why RROW Matters" — Same lot in R-3, toggle RROW from 8m to 15m → BHL jumps from 5 to 12 storeys
2. "Firewall Effect" — Toggle firewall on left side → watch AMBF increase as setback drops to 0
3. "Zoning Comparison" — Same lot, cycle through R-1 → R-2 → R-3 → watch envelope grow
4. "Corner Lot Advantage" — Switch lot type from inside to corner → see PSO increase

**Step 5.4 — Quiz Integration (if time permits)**
Simple in-canvas questions:
- "What is the max BHL for this lot?" → Student types answer → compare to computed value
- "What happens to the building envelope if you change zoning to C-2?" → Student predicts, then switches

**Step 5.5 — Final Verification**
- Every zoning class produces correct values
- Every lot type produces correct setback modifications
- Every RROW width produces correct BHL limits
- Firewall toggles correctly modify setbacks
- Incremental setbacks work for tall buildings
- All violations trigger with correct code citations
- Mobile responsive and touch-friendly
- Performance within budget

**Output:** Complete integrated page.

---

## DESIGN PRINCIPLES CHECKLIST

- [ ] **Math Accuracy:** Has every NBCP value been verified via web search against the actual IRR?
- [ ] **Most Stringent Rule:** Does every constraint use the MOST STRINGENT of applicable rules?
- [ ] **Spatial Contiguity:** Are all labels anchored to the relevant 3D geometry, not in distant panels?
- [ ] **Constructivist:** Can the student "break" every rule? Is every violation clearly labeled?
- [ ] **Design System:** Do all 2D overlays match GitHub+Apple hybrid (borders, radius, typography)?
- [ ] **Performance:** Is `frameloop="demand"` set? Zustand bridge pattern? Draw calls <30?
- [ ] **Mobile:** Touch controls work? Panels are responsive?
- [ ] **Code Citations:** Does every violation reference the EXACT PD 1096 Rule and Section?

---

## THE USER IN THE NBCP SIMULATOR

A 23-year-old Filipino architecture student, 2 months before the ALE. She's been staring at Table VII.G.1 for an hour — trying to memorize that R-3 has a PSO of 70% for inside lots and 75% for corner lots. The numbers blur together.

She opens the NBCP Envelope Simulator. Sets zoning to R-3. The building envelope shows 12 storeys on her 500sqm lot. She switches lot type from "Inside" to "Corner" — the footprint WIDENS slightly. She looks at the telemetry: "PSO: 75% (Corner lot bonus)." She thinks: "Oh, corner lots get 5% more coverage. That's because they have two road frontages for light and ventilation."

She narrows the RROW from 15m to 8m. The building SHRINKS from 12 storeys to 5. The annotation reads: "BHL limited by RROW width (Rule VII §706.b.ii: 8-9.99m RROW → 5 storeys max)." She'll never forget this on exam day — she SAW the building shrink when the road got narrow.

She toggles a firewall on the left property line. The setback on that side drops to zero. The footprint expands. She thinks: "So THAT's why developers use firewalls — it's not just fire safety, it increases buildable area."

**Six months later, on the ALE:** A question asks "What is the maximum BHL for an R-3 building on a lot facing an 8m RROW?" She doesn't need to recall a table. She SEES the building shrinking in her mind. She answers: "5 storeys." Correct.

---

## FINAL REMINDERS

1. **VERIFY THE MATH.** An incorrect FLAR value teaches the student wrong information for a licensure exam. Use web search. Cross-reference. If uncertain, add a `// TODO: Verify against 2004 Revised IRR` comment and flag it.

2. **MATH ENGINE IS PHASE 1-2. 3D IS PHASE 4.** Do not render geometry until the calculator is verified. A beautiful 3D model with wrong math is worse than no 3D model at all.

3. **MOST STRINGENT WINS.** When PSO gives one AMBF and setbacks give a different one — use the SMALLER number. When zoning gives one BHL and RROW gives another — use the LOWER one. This is how the NBCP actually works.

4. **THE VIOLATION IS THE LESSON.** When the building turns red with "Exceeds FLAR 3.00 (Table VII.G.1)" — that is the most valuable moment in the entire 3D Lab. Design it clearly, prominently, and with the exact code citation.

5. **THIS IS THE ALE KILLER FEATURE.** No other reviewer in the Philippines offers this. Not the review centers. Not the PDF reviewers. Not Quizlet. This 3D NBCP simulator is what makes SlateCamp irreplaceable for architecture students.

---

*Execute Phase 1 now. Verify the NBCP constants via web search and define the domain model.*
