# 11 — Data Model & Type Plan

## Current Types (Relevant to LI)

### ModuleRegistryEntry
**File**: `src/features/3d-lab/types/templates.ts` (lines 600+)

```typescript
export type TemplateType =
  | 'parametric' | 'exploded' | 'floorplan'
  | 'cutaway' | 'animated' | 'calculator' | 'wall-configurator'

export interface ModuleRegistryEntry {
  id: string
  title: string
  templateType: TemplateType
  subject: string
  categoryId?: CategoryKey
  launchPhase?: LaunchPhase
  codeRef?: string
  priority?: number
  status: ModuleStatus
  description?: string
  thumbnail?: string
  contextScenario?: string
  leaQuestionCount?: number
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  assets?: { models?: string[]; textures?: string[] }
}
```

### ModuleConfig (discriminated union)
```typescript
export type ModuleConfig =
  | ({ templateType: 'parametric' } & ParametricSceneConfig)
  | ({ templateType: 'exploded' } & ExplodedAssemblyConfig)
  | ({ templateType: 'floorplan' } & FloorPlanConfig)
  | ({ templateType: 'cutaway' } & CutawaySectionConfig)
  | ({ templateType: 'animated' } & AnimatedSequenceConfig)
  | ({ templateType: 'calculator' } & CalculatorConfig)
  | ({ templateType: 'wall-configurator' } & ParametricSceneConfig)
```

### Template Shell Defaults
```typescript
export const TEMPLATE_SHELL_DEFAULTS: Record<TemplateType, { shell, capabilities }>
```

### Legacy ModuleConfig (in `src/types/3d-lab.ts`)
```typescript
export interface ModuleConfig {
  slug: string
  title: string
  codeReference: string
  subject: string
  // ...
}
```
**Note**: This is a different `ModuleConfig` than the one in `templates.ts`. The `ModuleViewer` constructs one of these from the template config.

## Proposed Changes

### 1. TemplateType Addition

**File**: `src/features/3d-lab/types/templates.ts`

```typescript
export type TemplateType =
  | 'parametric' | 'exploded' | 'floorplan'
  | 'cutaway' | 'animated' | 'calculator' | 'wall-configurator'
  | 'learning'  // NEW
```

### 2. Interaction Mode Type

```typescript
export type InteractionMode = 'PI' | 'LI'
```

### 3. ModuleRegistryEntry Extension

```typescript
export interface ModuleRegistryEntry {
  // ...all existing fields...

  /** Interaction mode: PI (Parametric) or LI (Learning). Defaults to 'PI'. */
  mode?: InteractionMode
}
```

### 4. New Learning Types

```typescript
/** Defines a toggleable layer for LI modules */
export interface LearningLayerDef {
  /** Unique layer identifier */
  id: string
  /** Display label in toggle UI */
  label: string
  /** Optional description shown below label */
  description?: string
  /** Geometry rendered when layer is visible */
  geometry: GeometryInstruction
  /** Initially visible. Default: true */
  defaultVisible?: boolean
  /** Group label for section headers in toggle list */
  group?: string
  /** Code reference citation */
  codeCitation?: string
}

/** Config for a Learning Interactivity module */
export interface LearningSceneConfig {
  id: string
  title: string
  description: string
  subject: string
  /** Layers that can be toggled on/off */
  layers: LearningLayerDef[]
  /** Camera configuration */
  camera?: CameraConfig
  /** Uniform scale factor */
  scale?: number
  /** Show human scale reference */
  showHumanScale?: boolean
  /** 2-sentence professional scenario */
  contextScenario?: string
}
```

### 5. ModuleConfig Union Extension

```typescript
export type ModuleConfig =
  | ({ templateType: 'parametric' } & ParametricSceneConfig)
  | ({ templateType: 'exploded' } & ExplodedAssemblyConfig)
  | ({ templateType: 'floorplan' } & FloorPlanConfig)
  | ({ templateType: 'cutaway' } & CutawaySectionConfig)
  | ({ templateType: 'animated' } & AnimatedSequenceConfig)
  | ({ templateType: 'calculator' } & CalculatorConfig)
  | ({ templateType: 'wall-configurator' } & ParametricSceneConfig)
  | ({ templateType: 'learning' } & LearningSceneConfig)  // NEW
```

### 6. Template Shell Defaults

```typescript
export const TEMPLATE_SHELL_DEFAULTS: Record<TemplateType, ...> = {
  // ...existing entries...

  learning: {
    shell: {
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
  },
}
```

## State Model

### LI Module Store (via createModuleStore)

```typescript
// Defaults built from LearningSceneConfig
const defaults: Record<string, boolean> = {}
config.layers.forEach(layer => {
  defaults[layer.id] = layer.defaultVisible ?? true
})

const useStore = createModuleStore(defaults)
```

Store values are `Record<string, boolean>` keyed by layer ID. Toggle action switches the boolean.

## Asset Representation

LI modules use the existing `GeometryInstruction` system — no GLB/GLTF assets required for MVP. If GLB models are needed later, the existing `ModuleRegistryEntry.assets` field supports model paths.

## Educational Content

LI layers carry educational metadata:
- `label`: Display name
- `description`: Educational description
- `codeCitation`: Reference to building code section
- `group`: Organization in toggle UI

## Migration / Backward Compatibility

### Strategy: Additive Only

All changes are additive:
1. Add `mode?: InteractionMode` to `ModuleRegistryEntry` (optional)
2. Add `'learning'` to `TemplateType` union (adds new variant)
3. Add `LearningSceneConfig` to `ModuleConfig` union (adds new variant)
4. Add `'learning'` to `TEMPLATE_SHELL_DEFAULTS` (adds new entry)

No existing types are modified beyond making them wider.

### Default Resolution

All consumers that read `mode` should use `mode ?? 'PI'`:
```typescript
const mode = entry.mode ?? 'PI'
```

### Type Safety

TypeScript will enforce:
- `useTemplateContent` switch covers all `TemplateType` variants (including `'learning'`)
- `ModuleConfig` discriminates correctly on `templateType: 'learning'`
- `TEMPLATE_SHELL_DEFAULTS` covers all variants

## Validation Strategy

### At Build Time
- TypeScript ensures switch exhaustiveness in `useTemplateContent`
- TypeScript ensures `TEMPLATE_SHELL_DEFAULTS` covers all `TemplateType` variants
- TypeScript ensures `TEMPLATE_META` covers all `TemplateType` variants

### At Runtime (Dev)
- Console warning if `mode` doesn't match `templateType` expectations
- Console warning if `templateType: 'learning'` but config doesn't have `layers`

### In Tests
- Registry test ensures all LI modules have required fields
- Config test validates `LearningSceneConfig` structure

## Content Authoring Guidelines (for future reference)

An LI module config author needs:
1. Module ID (must match filename)
2. Title and description
3. Subject and category
4. Layers array with geometry, labels, descriptions
5. Camera configuration
6. Register the module in the appropriate `cat-XX.ts` file

Example structure (pseudocode):
```typescript
// src/features/3d-lab/config/modules/02-accessibility/bp344-ramp-layers.ts
export const bp344RampLayers: LearningSceneConfig = {
  id: 'bp344-ramp-layers',
  title: 'BP 344 Accessible Ramp Components',
  description: 'Explore the required components of an accessible ramp per BP 344.',
  subject: 'Accessibility',
  layers: [
    { id: 'ramp-surface', label: 'Ramp Surface', defaultVisible: true, geometry: { ... } },
    { id: 'handrail', label: 'Handrail', defaultVisible: true, geometry: { ... } },
    { id: 'curb', label: 'Edge Curb', defaultVisible: false, geometry: { ... } },
    { id: 'landing', label: 'Landing Platform', defaultVisible: true, geometry: { ... } },
  ],
  camera: { position: [4, 3, 4], target: [0, 0.5, 0], fov: 45 },
}
```
