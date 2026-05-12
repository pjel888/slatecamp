# 08 — Shared Viewport Component Strategy

## Current Viewport Component Analysis

### LabViewportFrame — The Canvas Host

**File**: `src/features/3d-lab/components/shell/LabViewportFrame.tsx`

This is THE single R3F Canvas for all 3D Lab modules. Architecture:
- Renders `<Canvas>` from `@react-three/fiber`
- Uses `SceneTunnel.Out` to receive portaled scene content
- Already designed for multi-module use (not PI-specific)
- Generic WebGL lifecycle: detection, recovery, performance monitoring
- Mobile-aware: adaptive DPR, touch-action handling

### CanvasWrapper — Per-Module Scene Config

**File**: `src/features/3d-lab/components/CanvasWrapper.tsx`

Wraps module scene content with:
- `SceneTunnel.In` for portal composition
- `SceneConfig` for camera, controls, lighting
- `CameraSync` for camera state
- `SceneGround` for grid/gizmos
- `CanvasLoadingOverlay` for loading states
- `InvalidateRegistrar` for demand-loop invalidation

Already designed to be used by any module type. Takes `sceneConfig` props.

### ViewportShell — Universal Layout Container

**File**: `src/features/3d-lab/components/shell/ViewportShell.tsx`

CSS Grid layout with collapsible sidebars. Slot-based content injection via `ViewportShellContent`:
- `canvasContent`: R3F scene (required)
- `leftSidebarContent`: Optional left panel
- `rightSidebarContent`: Optional right panel
- `statusBarContent`: Optional footer
- `layersPanelContent`: Optional layers menu items
- `toolbarExtras`: Optional toolbar additions

Already designed to adapt to any module config. Sidebars show/hide based on `shellConfig`.

## What Is Generic (Safe to Share)

| Component | Generic Aspect |
|-----------|---------------|
| LabViewportFrame | Canvas lifecycle, SceneTunnel.Out, WebGL, performance monitoring |
| CanvasWrapper | SceneTunnel.In, SceneConfig, CameraSync, loading overlay |
| ViewportShell | CSS Grid, slot injection, sidebar collapse, mobile layout |
| SceneToolbar | Grid/Dim/Xray toggles (shared by all modules) |
| LayersPanel | Generic layers section; module layers injected via children |
| CameraNavigationBar | Camera preset navigation |
| ViewportHeader | Title, code ref, back button, progress |
| ViewportStatusBar | Configurable status bar |
| SceneGround | Ground grid + gizmos |

## What Is PI-Specific (Not Directly Shared)

| Component | PI Coupling |
|-----------|------------|
| GenericControlPanel | Contains ParameterDef-based slider/dropdown/toggle UI |
| ComplianceReportPanel | Violation list with code citations |
| SourceCompliancePanel | Source truth display |
| ParametricSceneRenderer | Regenerates geometry from parameter values |

## Recommended Shared Viewport Primitive Shape

The existing architecture already provides the right primitives. No extraction is needed — the components are already shared. LI simply uses them with different config.

### Conceptual Usage for LI

```
LearningSceneRenderer
    ↓ renders inside
CanvasWrapper (sceneConfig: { cameraPosition, cameraTarget, showGround: false })
    ↓ portals via SceneTunnel.In
LabViewportFrame (single R3F Canvas)

ViewportShell
    ← shellConfig: { leftSidebar: false, rightSidebar: { width: 280, title: 'Layers' }, statusBar: true }
    ← content: {
        canvasContent: <LabViewportFrame><CanvasWrapper><LearningSceneRenderer /></CanvasWrapper></LabViewportFrame>
        rightSidebarContent: <LearningLayerToggles />
    }
```

## Recommended PI Wrapper Shape (No Changes Needed)

PI continues to use the existing pattern through `useTemplateContent`:
- `CanvasWrapper` → `ParametricSceneRenderer` (or other scene renderer)
- `ViewportShell` with dual sidebars
- `GenericControlPanel` in left sidebar
- `ComplianceReportPanel` in right sidebar

No changes needed to any PI components. The PI path through `useTemplateContent` is preserved exactly.

## Recommended LI Wrapper Shape

New case in `useTemplateContent` switch:

```typescript
case 'learning': {
  const cfg = config as LearningSceneConfig
  return {
    shellConfig: {
      rightSidebar: { width: 280, title: 'Layers', mobileTabLabel: 'Layers' },
      leftSidebar: false,
      statusBar: true,
    },
    capabilities: {
      cameraPresets: true,
      viewModes: ['perspective', 'isometric'],
      resetCamera: true,
      cameraPresetBar: true,
      floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
    content: {
      canvasContent: canvasWrapper(
        <LearningSceneRenderer config={cfg} useStore={useStore} />,
      ),
      rightSidebarContent: (
        <LearningLayerToggles config={cfg} useStore={useStore} />
      ),
    },
  }
}
```

## Prop / Interface Recommendations

### LearningLayerDef (new type)
```typescript
export interface LearningLayerDef {
  id: string
  label: string
  description?: string
  /** Geometry for this layer when visible */
  geometry: GeometryInstruction
  /** Initially visible? (default: true) */
  defaultVisible?: boolean
  /** Group label for section headers in toggle UI */
  group?: string
  /** Code reference citation */
  codeCitation?: string
}
```

### LearningSceneConfig (new type)
```typescript
export interface LearningSceneConfig {
  id: string
  title: string
  description: string
  subject: string
  layers: LearningLayerDef[]
  camera?: CameraConfig
  scale?: number
  showHumanScale?: boolean
  contextScenario?: string
}
```

## Model Loading Strategy

LI can use both approaches already available:
1. **Programmatic geometry**: Use the existing `GeometryInstruction` system (box, cylinder, plane, extruded-profile, etc.) — no GLB/GLTF needed
2. **GLB/GLTF models**: Use `useGLTF` from drei for pre-built models

For MVP, programmatic geometry is recommended — it's simpler, has no asset dependency, and matches the existing module config pattern. The `GeometryInstruction` type already supports all needed primitives.

## Camera / Control Strategy

LI inherits the shared camera system:
- `OrbitControls` configured via `SceneConfig` in `CanvasWrapper`
- Camera presets via `CameraNavigationBar`
- `CameraSync` for state synchronization
- Default camera position from module config

No new camera code needed for LI.

## Scene / Lights Strategy

LI uses the same `CanvasWrapper` → `SceneConfig` pipeline:
- Default `StudioLighting` from rendering components
- Optional per-module overrides via `sceneConfig`
- Grid/Gizmo via `SceneGround`

## Layer Visibility Strategy

LI layer visibility uses a simple per-module Zustand store:

```typescript
// Created via createModuleStore with defaults:
const defaults: Record<string, boolean> = {}
cfg.layers.forEach(layer => {
  defaults[layer.id] = layer.defaultVisible ?? true
})

// In LearningSceneRenderer:
const visibleLayers = useStore(s => s) // subscribe to all values
cfg.layers.forEach(layer => {
  if (visibleLayers[layer.id]) {
    // render geometry
  }
})
```

State shape: `Record<string, boolean>` keyed by `layer.id`.

## Annotation / Overlay Strategy (Deferred)

LI MVP does NOT include annotations or hotspots. Future LI versions could use the existing `DOMOverlayLayer` + `HotspotCard` components, but this is out of scope.

## Cleanup / Disposal Strategy

LI follows existing patterns:
- `useDisposeOnUnmount` from `src/components/r3f/useDisposeOnUnmount.ts`
- Scene cleanup on unmount in useEffect return
- Module store cleanup via `resetSession`

## Risks of Over-Abstracting

Extracting a generic "ModeRenderer" or "Mode" abstraction is unnecessary for MVP. The existing `useTemplateContent` switch with a new case is the correct pattern. Adding a mode abstraction layer would:
- Create indirection without benefit
- Complicate the type system unnecessarily
- Make the codebase harder to understand
- Be premature if only 2 modes exist

## Risks of Duplicating

Duplicating `LabViewportFrame` or `CanvasWrapper` for LI would:
- Create two Canvas instances (performance regression)
- Multiply WebGL context management complexity
- Diverge behavior between PI and LI
- Increase maintenance burden

**Strong recommendation**: Do NOT duplicate the Canvas infrastructure.

## Recommended Incremental Plan

No extraction needed — the components are already shared. Implementation order:

1. Add `'learning'` to `TemplateType` union
2. Add `LearningLayerDef` and `LearningSceneConfig` types
3. Add `mode` field to `ModuleRegistryEntry`
4. Add `'learning'` entry to `TEMPLATE_SHELL_DEFAULTS`
5. Add `'learning'` entry to `TEMPLATE_META` in `ModuleCard`
6. Add `case 'learning'` to `useTemplateContent` switch
7. Create `LearningSceneRenderer` component
8. Create `LearningLayerToggles` component
9. Create first LI module config
