# 19 — LI Comparative Analysis Strategy: Cross-Code Learning in 3D

## Critical Finding: PI/LI Boundary Clarification

Reading the production implementation docs for BP344 ramp (folder 44) and the Blender MCP authoring briefs (folder 41) revealed a fundamental clarification:

**PI (Parametric Interactivity) handles interactive compliance checking.** The BP344 ramp, egress stair cross-code, occupant load comparator, and site-lot comparator are all locked as `parametric` template type. These modules have sliders, violation indicators, compliance panels, and source truth schemas.

**LI (Learning Interactivity) handles guided educational exploration.** LI modules use layer toggles, pre-built comparison states, and sub-modes. They do NOT have parametric sliders or live compliance checking.

**This means**: The question of "how does LI show that different codes have different minimums" is a genuine LI question, separate from how PI handles it. PI shows it with sliders + violation indicators. LI needs its own comparative pedagogy.

## The Educational Problem

Different Philippine building codes specify different minimums for the same building element:

| Element | PD 1096 (NBCP) | BP 344 (Accessibility) | RA 9514 (Fire) | BP 220 (Housing) |
|---------|---------------|----------------------|----------------|-----------------|
| Stair riser max | 200mm (dwellings) | 150mm (accessible) | 180mm | 190mm |
| Stair width min | 750mm (dwellings) | 1200mm (accessible route) | 900mm (egress) | 750mm |
| Corridor width | 1000mm | 1500mm | Variable by OL | 1500mm |
| Door clear width | 800mm | 900mm | 900mm | 800mm |
| Ramp slope max | 1:8 | 1:12 (general) / 1:20 (preferred) | 1:8 (egress) | — |
| Handrail height | 800-900mm | 700-900mm (dual) | 800-1000mm | 800mm |
| Min room area | 6.00m² (habitable) | — | — | 18.00m² (BP 220) |

**The ALE board exam tests exactly these differences.** Students frequently confuse which code applies when. A 3D comparative view that makes these differences spatial and visible is a powerful learning tool.

## Comparative Analysis in LI vs PI

| Aspect | PI (Parametric) | LI (Learning) |
|--------|----------------|---------------|
| **How comparison works** | Slider adjusts a dimension; violation indicator shows which codes pass/fail at that value | Pre-built comparison states show the dimensional difference between code requirements |
| **Learner action** | Adjust parameters, observe compliance changes | Toggle between code states, see the spatial difference |
| **Best for** | "What happens if I make the stair 900mm wide?" | "Why does BP 344 require 1200mm but PD 1096 only requires 750mm?" |
| **Cognitive load** | Higher (manipulation + interpretation) | Lower (observation + comparison) |
| **Exam relevance** | Understanding compliance boundaries | Memorizing which code requires what |

**Both are needed.** PI for engineering exploration. LI for educational comparison. They serve different learner jobs.

## LI Comparative View: Design Options

### Option A: Single Viewport — Toggle Between Code Presets (RECOMMENDED for MVP)

```
┌─ Compare: Stair Width ──────────────────────────────────┐
│                                                          │
│  Code: [PD 1096 ▼]  vs  [BP 344 ▼]                      │
│                                                          │
│  ┌──────────────────────────────────┐                   │
│  │                                  │                   │
│  │     3D Stair Model               │                   │
│  │     Showing PD 1096 minimum      │                   │
│  │     Width: 750mm                 │                   │
│  │                                  │                   │
│  └──────────────────────────────────┘                   │
│                                                          │
│  Swipe/toggle: ◄───●───► BP 344: 1200mm                 │
│                                                          │
│  Difference: +450mm wider for accessibility              │
│                                                          │
│  Source: PD 1096 §1207  │  BP 344 §4.03                 │
└──────────────────────────────────────────────────────────┘
```

**How it works**:
- Single 3D stair model in viewport
- Toggle/slider switches between code presets
- Model dimensions change to show each code's minimum
- Difference indicator shows the delta
- Source cards show the governing sections
- Color coding: PD 1096 = blue overlay, BP 344 = green overlay, difference = red highlight

**Implementation**: One GeometryInstruction set per code preset. Toggle updates visible geometry. Camera stays fixed so spatial difference is clear.

### Option B: Side-by-Side Viewport

```
┌─ Compare: Stair Width ──────────────────────────────────┐
│                                                          │
│  PD 1096: 750mm          │  BP 344: 1200mm              │
│  ┌──────────────────┐    │  ┌──────────────────┐        │
│  │  3D Stair        │    │  │  3D Stair        │        │
│  │  (narrow)        │    │  │  (wider)         │        │
│  │  750mm           │    │  │  1200mm          │        │
│  │                  │    │  │                  │        │
│  └──────────────────┘    │  └──────────────────┘        │
│                                                          │
│  Difference: +450mm (BP 344 = 60% wider)                │
└──────────────────────────────────────────────────────────┘
```

**How it works**:
- Two viewports sharing one R3F Canvas (via viewport scissor or two scenes)
- Each shows the same model at different dimensions
- Or: the existing Compare View toggle with "A/B" states
- Difference computed and displayed

**Implementation complexity**: Higher. Requires two scene instances or viewport splitting. R3F Canvas currently supports one scene. Two scenes = two Canvas instances = more WebGL memory.

### Option C: Layered Overlay

```
┌─ Compare: Stair Width ──────────────────────────────────┐
│                                                          │
│  ┌──────────────────────────────────┐                   │
│  │  3D Stair at BP 344: 1200mm     │                   │
│  │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │                   │
│  │   PD 1096 ghost: 750mm          │                   │
│  │  │  (dashed outline)           │  │                   │
│  │  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │                   │
│  └──────────────────────────────────┘                   │
│                                                          │
│  ☑ Show BP 344 (1200mm)                                 │
│  ☑ Show PD 1096 ghost (750mm)                           │
│  ☐ Show RA 9514 ghost (900mm)                           │
└──────────────────────────────────────────────────────────┘
```

**How it works**:
- Base model at one code's dimensions
- Transparent "ghost" outlines show other codes' dimensions
- Checkboxes toggle which ghosts are visible
- This is naturally a layer-toggle pattern — fits LI's architecture perfectly

**Implementation**: Each code variant is a separate layer with opacity 0.3 and `Edges` / `Outlines` from drei. The base layer is the currently "active" code. Ghost layers are togglable.

### Option D: Code-Family Layer Groups

```
┌─ Stair Components ──────────────────────────────────────┐
│                                                          │
│  ┌─ PD 1096 (NBCP) ──────────────────────────────────┐  │
│  │ ☑ Stair width: 750mm                               │  │
│  │ ☑ Riser: 200mm max                                 │  │
│  │ ☑ Handrail: 800-900mm                              │  │
│  │ ☐ Guard: 1000mm                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ BP 344 (Accessibility) ───────────────────────────┐  │
│  │ ☑ Stair width: 1200mm                              │  │
│  │ ☑ Riser: 150mm max                                 │  │
│  │ ☑ Handrail: 700-900mm (dual)                       │  │
│  │ ☑ Edge protection: 100mm                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ RA 9514 (Fire Code) ──────────────────────────────┐  │
│  │ ☑ Stair width: 900mm                               │  │
│  │ ☑ Exit width: per occupant load                    │  │
│  │ ☑ Fire rating: 1-2 hours                           │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**How it works**:
- Layers are grouped by code family
- Each code family has its own dimension variant for the same building element
- Toggle a code family's group on/off to see its requirement
- Multiple code families can be visible simultaneously for overlay comparison
- This is Layer Toggle + Compare View combined

**Implementation**: Each code family's variant is a separate set of layers. The group toggle shows/hides all layers for that code. Multiple groups can be active simultaneously.

## Educational Effectiveness Analysis

Research on comparative learning and spatial cognition suggests:

| Comparison Method | Best For | Cognitive Load | Implementation |
|-------------------|----------|---------------|----------------|
| **Toggle (Option A)** | Understanding magnitude of difference | **Low** — sequential processing | Simplest |
| **Side-by-Side (Option B)** | Spotting specific differences | **Medium** — requires visual scanning | Most complex |
| **Overlay/Ghost (Option C)** | Seeing exactly WHERE codes differ | **Medium** — spatial interpretation | Medium |
| **Layer Groups (Option D)** | Systematic comparison of multiple codes | **Higher** — managing multiple toggles | Medium |

### Recommended Educational Approach

**For LI MVP (Phase 1-2)**: Use **Option D (Layer Groups)** as the primary pattern, with **Option A (Toggle)** as a simplified preset for quick comparison.

**Rationale**:
1. Layer groups fit LI's existing architecture — layers are already the core interaction model
2. It allows comparing 3-4 code families simultaneously (which Option A and B don't)
3. Students can "stack" requirements to see the most restrictive code
4. It maps naturally to the ALE study pattern: "Let me check what each code says about stairs"
5. Toggle preset (Option A) provides a simpler entry point for first-time users

### Example: LI Stair Width Comparison Module

```
Module ID: stair-width-code-comparison
Template: learning
Sub-modes: Focus, Compare, Source

Layers (grouped by code family):

PD 1096 Group:
  - stair-nbcp-750mm       [box, width=0.75, color=blue-ghost]
  - riser-nbcp-200mm       [box, height=0.20, color=blue-ghost]
  - handrail-nbcp-900mm    [cylinder, height=0.90, color=blue-ghost]

BP 344 Group:
  - stair-bp344-1200mm     [box, width=1.20, color=green-ghost]
  - riser-bp344-150mm      [box, height=0.15, color=green-ghost]
  - handrail-bp344-700mm   [cylinder, height=0.70, color=green-ghost]
  - handrail-bp344-900mm   [cylinder, height=0.90, color=green-ghost]

RA 9514 Group:
  - stair-fc-900mm         [box, width=0.90, color=red-ghost]
  - riser-fc-180mm         [box, height=0.18, color=red-ghost]
  - handrail-fc-800mm      [cylinder, height=0.80, color=red-ghost]

Base Layer (always visible):
  - human-reference        [silhouette, height=1.70]
  - ground-plane           [plane]

Compare View Presets:
  - "NBCP vs BP 344" — shows PD 1096 ghost + BP 344 ghost
  - "NBCP vs Fire Code" — shows PD 1096 ghost + RA 9514 ghost
  - "All Three" — shows all three ghosts
  - "Most Restrictive" — shows only the strictest requirement for each element
```

## Comparative Analysis Data Model

```typescript
// Extension to LearningSceneConfig for comparative modules
export interface ComparativeLearningConfig extends LearningSceneConfig {
  /** Code families being compared */
  codeFamilies: CodeFamily[]

  /** Comparison groups — one per code family */
  comparisonGroups: ComparisonGroup[]
}

export interface ComparisonGroup {
  /** Code family identifier */
  codeFamilyId: string  // 'pd1096' | 'bp344' | 'ra9514' | 'bp220' | 'pd957' | 'gbc'
  /** Display label */
  label: string
  /** Color for ghost/overlay */
  color: string
  /** Layers belonging to this code family */
  layerIds: string[]
  /** Layer states for this code's compliant configuration */
  defaultVisible: boolean
}

export type CodeFamily = {
  id: string
  label: string
  /** Law abbreviation */
  law: string
}
```

## Sub-Mode Adaptation for Comparative LI

### Focus View
- Shows one code family at a time (baseline learning)
- Layer toggles for individual elements within that code

### Compare View
- Code family group toggles (toggle entire PD 1096, BP 344, etc. groups)
- Overlay mode: ghost outlines for inactive codes
- Difference panel: computed deltas between active codes

### Source View
- Source cards per code family
- Side-by-side source card display for comparison

## Implementation Priority

| Phase | Comparative Module | Approach |
|-------|-------------------|----------|
| MVP (Phase 1) | Simple layer toggles — single-element comparison via Focus View only | Option A (toggle) |
| Phase 2 | `stair-width-code-comparison` — first multi-code LI comparator | Option D (layer groups) |
| Phase 3 | Full comparative LI: habitable areas, corridor widths, door clearances | Options D + A |
| Phase 4 | Side-by-side viewport for key P0 comparisons (if educational research supports it) | Option B |

## Key Architectural Decision

**LI's Compare View should start as a layer-group toggle pattern, not a split-viewport.**

Reasons:
1. Fits LI's existing layer-based architecture
2. Single viewport = single WebGL context = no performance hit
3. Layer groups are a natural extension of the existing `LearningLayerDef.group` field
4. Side-by-side viewport (Option B) requires significant R3F infrastructure changes (two scenes, viewport splitting, or two Canvas instances)
5. Layer groups let students compare 3-4 codes simultaneously, which split-viewport can't

**When to consider split-viewport**: Only if educational testing shows that simultaneous side-by-side is significantly more effective for learning than toggle/overlay comparison. Build the simpler version first, test with students, then decide.

## PI/LI Comparative Division of Labor

| Comparative Task | Mode | Why |
|-----------------|------|-----|
| "What happens to compliance if I make the stair 900mm wide?" | **PI** | Parametric exploration — slider + live violation checking |
| "What does each code require for stair width?" | **LI** | Educational comparison — toggle code families to see differences |
| "Is this design BP 344 compliant?" | **PI** | Compliance checking — violation indicators |
| "Why is BP 344's requirement higher than PD 1096's?" | **LI** | Educational reasoning — source cards + spatial context |
| "What's the most restrictive requirement across all codes?" | **LI** | Layer stacking — enable all code groups, observe the widest/narrowest |
| "Let me practice identifying which code this dimension comes from" | **LI** | Mistake Hunt — identify the code family for a given dimension |

**Neither mode replaces the other.** Both are needed for complete ALE preparation. PI handles the engineering "what if" questions. LI handles the educational "what does each code say" questions.
