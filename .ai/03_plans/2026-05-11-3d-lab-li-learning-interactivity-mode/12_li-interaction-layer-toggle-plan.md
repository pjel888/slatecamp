# 12 — LI Interaction & Layer Toggle Plan

## LI Interaction Goals

1. Allow students to toggle individual layers/components of a 3D model on/off
2. Provide a clear, simple control interface that doesn't overwhelm
3. Give immediate visual feedback when toggling layers
4. Support educational exploration through progressive reveal
5. Keep the 3D viewport as the primary focus, not the controls

## MVP Interaction Model

### Primary Interaction: Checkbox Toggles

A list of checkboxes, one per layer. Each toggle controls the visibility of one mesh/geometry group in the 3D scene.

```
┌─ Layers ────────────────────┐
│                             │
│ ☑ Ramp Surface              │
│ ☑ Handrail                  │
│ ☐ Edge Curb                 │
│ ☑ Landing Platform          │
│ ☑ Wall Connection           │
│                             │
└─────────────────────────────┘
```

### Interaction Details

| Behavior | Description |
|----------|-------------|
| Toggle action | Click checkbox or press Space/Enter when focused |
| Visual feedback | Mesh appears/disappears immediately in viewport |
| State persistence | Within session only (resets on page leave) |
| Default state | Defined per layer in config (`defaultVisible`) |
| Multi-select | All layers can be toggled independently |
| Reset | "Show All" / "Hide All" buttons or individual reset |
| Keyboard | Tab between toggles, Space/Enter to toggle |
| Grouping | Optional section headers for related layers |

## Layer Toggle Behavior

### What "toggling a layer" means

A layer is a named group of `GeometryInstruction` objects. When visible, the geometry renders in the 3D scene. When hidden, it's removed from the scene graph.

### Mesh Visibility Strategy

**Option A: Conditional rendering** (Recommended for MVP)
```tsx
{visibleLayers[layer.id] && <GeometryElement instruction={layer.geometry} />}
```
- Simple, reliable
- No invisible geometry eating GPU memory
- Works with R3F demand-loop rendering
- Follows existing `GeometryMesh` pattern

**Option B: `visible` prop**
```tsx
<mesh visible={visibleLayers[layer.id]}>
```
- Keeps geometry in scene graph (memory cost)
- Slightly faster toggle (no React reconciliation)
- Less clean for demand-loop

**Recommendation: Option A** for MVP. Simpler, more idiomatic React, memory-efficient.

### State Toggle Behavior

Each toggle maps to a boolean in the module store:
```typescript
// Store state shape
Record<string, boolean>
// Example:
{ "ramp-surface": true, "handrail": true, "edge-curb": false }
```

Toggle action updates the store:
```typescript
const toggleLayer = (layerId: string) => {
  useStore.setState(state => ({
    ...state,
    [layerId]: !state[layerId]
  }))
}
```

The scene renderer subscribes to the store and conditionally renders geometry.

### Does Not Affect (MVP Scope)

- Camera position (toggling layers doesn't change camera)
- Other layers (toggles are independent)
- Material properties (only visibility)
- Annotations (none in MVP)

## Recommended State Shape

### In createModuleStore
```typescript
const defaults: Record<string, boolean> = {}
config.layers.forEach(layer => {
  defaults[layer.id] = layer.defaultVisible ?? true
})
const useStore = createModuleStore(defaults)
```

### In LearningSceneRenderer
```typescript
const layerStates = useStore()
// layerStates is Record<string, boolean>
```

### In LearningLayerToggles
```typescript
const layerStates = useStore()
const toggleLayer = (id: string) => {
  useStore.setState(s => ({ ...s, [id]: !s[id] }))
}
```

## UI Placement

For MVP: Right sidebar (280px), below header, scrollable list.

```
┌─ Layers ────────────────────┐
│ [Show All] [Hide All]       │  ← Optional bulk actions
├─────────────────────────────┤
│ Surface Elements            │  ← Group header (optional)
│ ☑ Ramp Surface              │
│   Non-slip finish, 1:12 max │  ← Description
│   BP 344 §4.01              │  ← Code citation
├─────────────────────────────┤
│ Safety Elements             │
│ ☑ Handrail                  │
│ ☐ Edge Curb                 │
│ ☑ Landing Platform          │
├─────────────────────────────┤
│ Structural                  │
│ ☑ Wall Connection           │
│ ☑ Foundation Support        │
└─────────────────────────────┘
```

Also mirrored in the `LayersPanel` floating overlay (shared with SceneToolbar) so students can toggle layers without opening the sidebar.

## Default State Behavior

| Scenario | Behavior |
|----------|----------|
| First visit | Layers render with `defaultVisible` values from config |
| Page refresh | State resets to defaults (no persistence in MVP) |
| "Show All" | Sets all layers to visible (available as button action) |
| "Hide All" | Hides all layers except maybe a "base" layer |
| Module change | State resets when navigating to new module (handled by ModuleViewer's resetSession) |

## Accessibility for Toggles

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | Tab through toggles, Space/Enter to toggle |
| Focus indicators | Visible focus ring on focused toggle |
| Screen reader | `aria-label` or associated `<label>` with `htmlFor` |
| Color independence | Checkbox shows checked state, not just color change |
| Reduced motion | Instant show/hide (no animation) when `prefers-reduced-motion` |

## Model Authoring Requirements

To create an LI module, a content author needs:
1. `id` for each layer
2. `label` (display name)
3. `description` (educational text)
4. `geometry` (GeometryInstruction for rendering)
5. `defaultVisible` (initial state)
6. Optional: `group`, `codeCitation`

Geometry can be generated programmatically via the existing `GeometryInstruction` system or loaded from GLB/GLTF models.

## Error Handling

| Scenario | Handling |
|----------|----------|
| Layer ID mismatch between config and store | Console warning; skip rendering |
| Layer geometry fails to render | SceneErrorBoundary catches; shows fallback |
| Toggle action on unknown layer ID | No-op; console warning |
| All layers hidden | Show message "All layers hidden. Use Show All to reveal." |

## Reset Behavior

- **Individual reset**: Each toggle resets only itself — no "reset to default" per layer in MVP
- **Show All**: Sets all visible. Available via button in toggle panel
- **Module reset**: Navigating away and back resets to defaults (via ModuleViewer cleanup)

## Future Enhancements (Deferred Post-MVP)

| Enhancement | Description |
|-------------|-------------|
| Guided steps | Sequenced reveal of layers with next/prev navigation |
| Annotations | Clickable hotspots with educational info |
| Hotspot labels | 3D-positioned labels on layer geometry |
| Quizzes | In-panel questions about layers |
| Narrated sequences | Auto-playing layer reveal with audio/text |
| Animation timeline | Fade-in/out transitions for layer visibility |
| Compare states | Side-by-side comparison of different layer configs |
| Saved views | Save and restore layer visibility presets |
| Solo mode | "Show only this layer" toggle |
| Color coding | Layer colors match toggle indicator colors |
