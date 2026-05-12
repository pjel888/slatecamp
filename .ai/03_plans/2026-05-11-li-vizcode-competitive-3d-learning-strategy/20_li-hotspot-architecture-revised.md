# 20 — LI Architecture Revised: Hotspot-Centered Interaction Model

## The Correction

The original LI planning (documents 03, 06, 07) designed a complex sub-mode architecture with tabs, adaptive sidebars, and 6 sub-modes. The user corrected this: **LI should be simpler, with 3D model hotspots as the primary interaction.**

This is the right call. The hotspot infrastructure already exists in the 3D Lab codebase. LI should use it.

## Existing Hotspot Infrastructure

The 3D Lab already has a complete hotspot system spread across these files:

| Component | File | Purpose |
|-----------|------|---------|
| `HotspotAnnotation` | `components/templates/HotspotAnnotation.tsx` | Places a clickable hotspot in 3D space. Emits to `useOverlayStore`. |
| `HotspotCard` | `components/overlays/HotspotCard.tsx` | Renders clickable dot → expands to info card with title, body, codeRef |
| `HotspotQuestion` | `components/templates/HotspotQuestion.tsx` | MCQ modal with code citation reveal — **PLANNED but not yet wired to any scene** |
| `DOMOverlayLayer` | `components/overlays/DOMOverlayLayer.tsx` | Projects 3D world positions → 2D screen coordinates |
| `useOverlayStore` | `stores/useOverlayStore.ts` | Zustand store: `upsertItem`, `removeItem`, `openHotspot`, `closeHotspot`, `closeAllHotspots` |
| `useWorldToScreen` | `hooks/useWorldToScreen.ts` | Projects `Vector3` → screen `{x, y, visible}` |

**None of these need to be modified for LI.** They're already reusable.

## LI Hotspot-Centered Architecture

### The Model

```
┌──────────────────────────────────────────────────────────┐
│ ViewportHeader (title · code ref · back)                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│             3D Model with Hotspots                        │
│                                                          │
│         ● ← click: info modal                            │
│    ●         ●                                            │
│         ● ← click: quiz modal                             │
│    ●    ●    ●                                            │
│                                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Status Bar: "3 hotspots explored / 8 total"              │
└──────────────────────────────────────────────────────────┘
```

### The Interaction

1. **Student sees a 3D model** — e.g., an accessible ramp or stairway
2. **Hotspots appear as pulsing dots** on key elements (ramp surface, handrail, landing, edge curb)
3. **Student clicks a hotspot** → modal appears:
   - **Info modal**: Label, description, source card reference, "Learn More" link to Wiki
   - **Quiz modal**: MCQ question about that element, answer → code citation reveal
4. **Student explores at their own pace** — no forced sequence, no complex sidebar
5. **Status bar tracks progress**: "3 of 8 hotspots explored"

### No Sub-Mode Tabs Needed

The original design had 6 sub-mode tabs (Focus, Compare, Mistake Hunt, Board Drill, Source View, Repair Path). With hotspots, these collapse into:

| Original Sub-Mode | Hotspot Equivalent |
|-------------------|-------------------|
| Focus View (layer toggles) | Optional: simple layer toggle panel in right sidebar |
| Compare View | Hotspots reveal comparison info (e.g., "PD 1096: 750mm | BP 344: 1200mm") |
| Mistake Hunt | Hotspot quiz: "Is this element compliant? Yes/No" |
| Board Drill | Hotspot quiz: MCQ with code citation reveal |
| Source View | Every hotspot modal includes `codeRef` and source card link |
| Repair Path | Wrong quiz answer → linked hotspot(s) highlighted |

### Simplified Right Sidebar

```
┌─ Ramp Components ───────────┐
│                              │
│ Explore this model by        │
│ clicking the highlighted     │
│ dots on the ramp.            │
│                              │
│ ┌─ Hotspots ──────────────┐  │
│ │ ● Ramp Surface    ✓     │  │
│ │ ● Handrail        ✓     │  │
│ │ ○ Edge Curb             │  │
│ │ ● Landing         ✓     │  │
│ │ ○ Tactile Warning       │  │
│ │ ○ Foundation             │  │
│ └─────────────────────────┘  │
│                              │
│ Progress: 3 of 6 explored    │
│                              │
│ [Show All Layers]            │
│ ☑ Ramp Surface               │
│ ☑ Handrails                  │
│ ☐ Edge Curb                  │
│ ☑ Landing Platform           │
│ ☐ Tactile Warning            │
│ ☐ Foundation                 │
└──────────────────────────────┘
```

The sidebar is optional — the hotspots on the model are the primary UI.

### Layer Toggles Are Secondary

Layer toggles become a secondary feature, not the primary interaction:
- Default: all layers visible, hotspots active
- Student can hide a layer to see what's behind it
- Hotspot for hidden layer becomes inactive (or shows ghost state)
- "Show All" restores all layers

### Hotspot Types

| Type | Trigger | Appearance | Modal Content |
|------|---------|------------|---------------|
| **Info** | Click dot | Blue pulsing dot | Title, description, codeRef, Wiki link |
| **Quiz** | Click dot | Orange pulsing dot | MCQ question, answer options, code citation reveal |
| **Comparison** | Click dot | Green pulsing dot | Side-by-side code requirements (e.g., PD 1096 vs BP 344) |
| **Explored** | After click | Gray static dot | Still clickable to revisit |

## Data Model

```typescript
// Extension to LearningSceneConfig — hotspot-centered
export interface LearningSceneConfig {
  id: string
  title: string
  description: string
  subject: string

  /** 3D model layers (optional — for secondary layer toggle feature) */
  layers?: LearningLayerDef[]

  /** Hotspots placed on the 3D model */
  hotspots: LearningHotspot[]

  camera?: CameraConfig
  scale?: number
  showHumanScale?: boolean
  contextScenario?: string
}

export interface LearningHotspot {
  id: string
  /** 3D world position */
  position: [number, number, number]
  /** Display label on the dot */
  label: string
  /** Title shown in modal header */
  title: string
  /** Description / educational content */
  description: string
  /** Source card ID (vitruvius concept ID or code citation) */
  sourceCardId?: string
  /** Wiki article link */
  wikiArticleId?: string
  /** Hotspot type */
  type: 'info' | 'quiz' | 'comparison'
  /** Quiz data (only when type === 'quiz') */
  quiz?: {
    questionText: string
    options: Array<{ id: string; text: string }>
    correctOptionId: string
    codeCitation: string
    consequenceText?: string
  }
  /** Comparison data (only when type === 'comparison') */
  comparison?: {
    codes: Array<{
      codeLabel: string   // "PD 1096"
      requirement: string // "750mm minimum"
      sourceCardId: string
    }>
  }
  /** Which layer(s) this hotspot is attached to */
  attachedLayerIds?: string[]
  /** Optional: visibility condition */
  visibleWhen?: 'always' | 'layer-visible' | 'quiz-unlocked'
}
```

## Implementation Compared to Original Plan

| Aspect | Original Plan (docs 03-07) | Revised Plan (this doc) |
|--------|---------------------------|------------------------|
| Primary interaction | Right sidebar with layer checkboxes | Click hotspots on the 3D model |
| Sub-modes | 6 tab-based sub-modes | Hotspot types (info/quiz/comparison) |
| Right sidebar | Adapts per sub-mode | Simple hotspot list + optional layer toggles |
| Architecture complexity | High (sub-mode state, tabs, adaptive panels) | Low (reuse existing HotspotAnnotation + HotspotCard) |
| New components needed | 6 scene files, 5 panel files, tab bar | 0 new components (reuse existing) |
| Learning model | Structured lesson with mode switching | Free spatial exploration with guided hotspots |
| Mobile experience | Sub-mode tabs need special mobile UX | Hotspots work naturally with touch (tap to open) |

## What Gets Removed From Original Plan

| Original Component | Disposition |
|--------------------|------------|
| `LearningSubModeTabs.tsx` | **Remove** — no sub-mode tabs |
| `CompareViewScene.tsx` | **Remove** — comparison is in hotspot modal |
| `MistakeHuntScene.tsx` | **Remove** — quiz hotspots handle this |
| `BoardDrillScene.tsx` | **Remove** — quiz hotspots handle this |
| `SourceViewScene.tsx` | **Remove** — source cards are in hotspot modals |
| `ComparePresetSelector.tsx` | **Remove** — no compare presets |
| `MistakeHuntPanel.tsx` | **Remove** — no mistake panel |
| `BoardDrillPanel.tsx` | **Remove** — quiz is in modals |
| `SourceCardPanel.tsx` | **Simplify** — source card shows in hotspot modal |

## What Gets Kept

| Component | Disposition |
|-----------|------------|
| `LearningSceneRenderer.tsx` | **Keep** — simplified: renders model + HotspotAnnotations |
| `FocusViewScene.tsx` | **Rename** to `LearningSceneRenderer.tsx` — just renders model |
| `LearningLayerToggles.tsx` | **Keep as optional** — secondary feature in right sidebar |
| `HotspotAnnotation` (existing) | **Reuse directly** — no LI-specific wrapper needed |
| `HotspotCard` (existing) | **Reuse directly** |
| `HotspotQuestion` (existing) | **Wire to LI scenes** — currently planned but unused |
| `DOMOverlayLayer` (existing) | **Reuse directly** |
| `useOverlayStore` (existing) | **Reuse directly** |

## LearningSceneRenderer — Simplified

```typescript
// Conceptual — the LI scene renderer becomes much simpler
function LearningSceneRenderer({ config, useStore }: Props) {
  const layerStates = useStore()

  return (
    <group scale={config.scale ?? 1}>
      {/* Render 3D geometry for visible layers */}
      {config.layers?.map(layer => {
        if (layerStates?.[layer.id] === false) return null
        return <GeometryElement key={layer.id} instruction={layer.geometry} />
      })}

      {/* Render hotspots on the model */}
      {config.hotspots.map(hotspot => (
        <HotspotAnnotation
          key={hotspot.id}
          hotspot={{
            id: hotspot.id,
            position: hotspot.position,
            title: hotspot.title,
            description: hotspot.description,
            wikiArticleId: hotspot.wikiArticleId,
          }}
          isActive={false}  // Hotspot starts closed
          onActivate={(id) => useOverlayStore.getState().openHotspot(`hotspot-${id}`)}
          onDeactivate={() => useOverlayStore.getState().closeAllHotspots()}
        />
      ))}

      {/* Optional: human scale reference */}
      {config.showHumanScale && <HumanSilhouette />}
    </group>
  )
}
```

## HotspotCard Enhancement for LI

The existing `HotspotCard` renders title + body + codeRef. For LI, we can optionally add a quiz overlay:

```typescript
// When hotspot.type === 'quiz', HotspotCard renders:
// 1. Initial state: info card with title + description + "Take Quiz" button
// 2. Quiz state: HotspotQuestion component with MCQ
// 3. Result state: correct/incorrect + code citation + source card link
```

Or, simpler: the hotspot modal shows info by default, and if a quiz is attached, it shows a "Test Yourself" button that opens the `HotspotQuestion` component.

## Comparison Hotspot

When `hotspot.type === 'comparison'`, the modal shows a comparison table:

```
┌─ Handrail Height ──────────────────────────────┐
│                                                  │
│ Different codes require different handrail       │
│ heights for stairs and ramps:                    │
│                                                  │
│ ┌──────────┬──────────────┬───────────────────┐  │
│ │ Code     │ Requirement  │ Source            │  │
│ ├──────────┼──────────────┼───────────────────┤  │
│ │ PD 1096  │ 800-900mm    │ PD 1096 §1207     │  │
│ │ BP 344   │ 700-900mm    │ BP 344 IRR §5     │  │
│ │ RA 9514  │ 800-1000mm   │ RA 9514 §10.2.5.2 │  │
│ └──────────┴──────────────┴───────────────────┘  │
│                                                  │
│ 📐 The most restrictive: BP 344 (dual handrails  │
│    at both 700mm AND 900mm for ramps)            │
│                                                  │
│ 📋 Source cards: sc-bp344-ramp-landing-handrail- │
│    edge-2024-p2, sc-fire-stair-handrails-...     │
└──────────────────────────────────────────────────┘
```

## Benefits of Hotspot-Centered Design

1. **Dramatically simpler architecture** — no sub-mode system, no adaptive panels
2. **Reuses existing code** — `HotspotAnnotation`, `HotspotCard`, `HotspotQuestion`, `DOMOverlayLayer`, `useOverlayStore` are all already built
3. **More intuitive for students** — click what you want to learn about
4. **Better for mobile** — tap hotspots, no complex sidebar to navigate
5. **Supports progressive disclosure** — student explores at their own pace
6. **Natural comparative analysis** — comparison hotspots show code differences in modal
7. **Quiz integration is built-in** — `HotspotQuestion` component exists, just needs wiring
8. **Lower implementation risk** — fewer new components, more reuse

## What Changes in the LI Type System

The `LearningSceneConfig` changes from sub-mode-heavy to hotspot-centered:

```typescript
// BEFORE (original plan):
export interface LearningSceneConfig {
  layers: LearningLayerDef[]
  supportedModes?: LearningSubMode[]     // REMOVED
  defaultMode?: LearningSubMode          // REMOVED
  modeConfigs?: {                        // REMOVED
    focus?: FocusModeConfig
    compare?: CompareModeConfig
    mistake?: MistakeModeConfig
    drill?: DrillModeConfig
  }
}

// AFTER (revised):
export interface LearningSceneConfig {
  layers?: LearningLayerDef[]            // Optional — layer toggles are secondary
  hotspots: LearningHotspot[]            // Primary interaction
  camera?: CameraConfig
  scale?: number
  showHumanScale?: boolean
  contextScenario?: string
}
```

## Migration From Original Plan

If any LI code was built following the original sub-mode architecture:
1. `LearningSubModeTabs.tsx` → Delete
2. Sub-mode scene files → Delete (CompareViewScene, MistakeHuntScene, etc.)
3. Sub-mode panel files → Delete (ComparePresetSelector, MistakeHuntPanel, etc.)
4. `LearningSceneRenderer.tsx` → Rewrite as hotspot renderer
5. `LearningLayerToggles.tsx` → Keep as optional secondary feature
6. Type definitions → Remove `LearningSubMode`, `modeConfigs`, etc.
