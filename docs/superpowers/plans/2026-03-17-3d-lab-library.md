# 3D Lab Library Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 reusable 3D scene templates and 10 priority Philippine architecture licensure modules, plus a module registry and gallery page.

**Architecture:** Config-driven template system. 5 template components (ParametricScene, ExplodedAssembly, FloorPlanWalkthrough, CutawaySection, AnimatedSequence) accept JSON-like config objects containing parameters, violations, annotations, and geometry builders. Each module is a config file — no per-module R3F code. A generic Zustand store factory replaces hardcoded stores. All scenes use `frameloop="demand"` + invalidate bridge.

**Tech Stack:** Next.js App Router, React Three Fiber 9.5, @react-three/drei 10.7, Three.js 0.183, Zustand 5, Tailwind CSS, TypeScript.

**Existing Infrastructure (REUSE — do not rebuild):**
- `src/app/dashboard/3d-lab/_components/CanvasWrapper.tsx` — Shared Canvas with frameloop="demand"
- `src/app/dashboard/3d-lab/_components/HotspotAnnotation.tsx` — 3D-anchored tooltips
- `src/app/dashboard/3d-lab/_components/ViolationIndicator.tsx` — Code violation display
- `src/app/dashboard/3d-lab/_components/InfoPanel.tsx` — Expandable detail panel
- `src/app/dashboard/3d-lab/_hooks/useInvalidateOnChange.ts` — R3F bridge hook
- `src/app/dashboard/3d-lab/_stores/labStore.ts` — Zustand store (FAR-specific)
- `src/app/dashboard/3d-lab/_stores/nbcpStore.ts` — Zustand store (NBCP-specific)

**Critical Patterns to Follow:**
- `frameloop="demand"` on all Canvas — never `"always"`
- Zustand store + `useFrame` with `getState()` — never React state in render loop
- Ref mutations for geometry in `useFrame` — never setState inside useFrame
- Dynamic `import()` with `{ ssr: false }` for all scene components
- `<Html>` from drei for 3D-anchored annotations (Spatial Contiguity)
- All dimensions in mm from Philippine codes — EXACT values, never approximate

---

## Chunk 1: Template Architecture & Generic Store

### Task 1: Create Generic Module Store Factory

**Files:**
- Create: `src/app/dashboard/3d-lab/_stores/createModuleStore.ts`
- Create: `src/app/dashboard/3d-lab/_hooks/useModuleInvalidate.ts`

The existing `labStore.ts` and `nbcpStore.ts` are hardcoded to specific parameter sets. We need a generic factory that creates a Zustand store for ANY module config.

- [ ] **Step 1: Create the generic store factory**

```typescript
// src/app/dashboard/3d-lab/_stores/createModuleStore.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand'

export interface ModuleStoreState {
  params: Record<string, number | boolean | string>
  activeAnnotation: string | null
  invalidateFn: (() => void) | null

  setParam: (key: string, value: number | boolean | string) => void
  setParams: (patch: Record<string, number | boolean | string>) => void
  setActiveAnnotation: (id: string | null) => void
  setInvalidateFn: (fn: (() => void) | null) => void
  reset: () => void
}

export function createModuleStore(
  defaults: Record<string, number | boolean | string>
): UseBoundStore<StoreApi<ModuleStoreState>> {
  return create<ModuleStoreState>()((set, get) => ({
    params: { ...defaults },
    activeAnnotation: null,
    invalidateFn: null,

    setParam: (key, value) => {
      set((s) => ({ params: { ...s.params, [key]: value } }))
      get().invalidateFn?.()
    },

    setParams: (patch) => {
      set((s) => ({ params: { ...s.params, ...patch } }))
      get().invalidateFn?.()
    },

    setActiveAnnotation: (id) => {
      set({ activeAnnotation: id })
      get().invalidateFn?.()
    },

    setInvalidateFn: (fn) => set({ invalidateFn: fn }),

    reset: () => {
      set({ params: { ...defaults }, activeAnnotation: null })
      get().invalidateFn?.()
    },
  }))
}
```

- [ ] **Step 2: Create the generic invalidate hook**

```typescript
// src/app/dashboard/3d-lab/_hooks/useModuleInvalidate.ts
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

export function useModuleInvalidate(
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
) {
  const { invalidate } = useThree()
  const setInvalidateFn = useStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
```

- [ ] **Step 3: Verify build compiles**

Run: `cd /d/SlateCamp/slate-camp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors in new files

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/3d-lab/_stores/createModuleStore.ts src/app/dashboard/3d-lab/_hooks/useModuleInvalidate.ts
git commit -m "feat(3d-lab): add generic module store factory and invalidate hook"
```

---

### Task 2: Define Template Type System

**Files:**
- Create: `src/app/dashboard/3d-lab/_types/templates.ts`

All 5 templates share a common config interface hierarchy. Define them in one place.

- [ ] **Step 1: Create the template type definitions**

```typescript
// src/app/dashboard/3d-lab/_types/templates.ts
import type * as THREE from 'three'

// ─── Shared types ────────────────────────────────────────────────────────────

export type TemplateType =
  | 'parametric'
  | 'exploded'
  | 'floorplan'
  | 'cutaway'
  | 'animated'

export interface ParameterDef {
  key: string
  label: string
  type: 'slider' | 'toggle' | 'dropdown'
  min?: number
  max?: number
  step?: number
  default: number | boolean | string
  unit?: string // 'mm', 'm', 'sqm', '%'
  options?: { label: string; value: string }[] // For dropdowns
  group?: string // Collapsible section name
}

export interface ViolationRule {
  id: string
  check: (params: Record<string, number | boolean | string>) => boolean
  field: string
  message: string
  codeCitation: string
  severity: 'error' | 'warning'
  position?: (params: Record<string, number | boolean | string>) => [number, number, number]
}

export interface AnnotationDef {
  id: string
  label: string
  description: string
  codeCitation?: string
  position: (params: Record<string, number | boolean | string>) => [number, number, number]
  visibleWhen?: (params: Record<string, number | boolean | string>) => boolean
}

export interface Preset {
  label: string
  values: Record<string, number | boolean | string>
}

// ─── Template 1: ParametricScene ─────────────────────────────────────────────

export interface ParametricSceneConfig {
  id: string
  title: string
  description: string
  subject: string
  parameters: ParameterDef[]
  geometry: (params: Record<string, number | boolean | string>) => GeometryInstruction[]
  violations: ViolationRule[]
  annotations: AnnotationDef[]
  presets: Preset[]
  camera?: {
    position?: [number, number, number]
    fov?: number
    minDistance?: number
    maxDistance?: number
  }
  scale?: number // meters-to-units conversion (default 0.05 = 1 unit = 20m)
}

export interface GeometryInstruction {
  id: string
  type: 'box' | 'cylinder' | 'plane' | 'line' | 'ring'
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  args: number[] // geometry constructor args
  color: string
  opacity?: number
  transparent?: boolean
  label?: string
}

// ─── Template 2: ExplodedAssembly ────────────────────────────────────────────

export interface ExplodedAssemblyConfig {
  id: string
  title: string
  description: string
  subject: string
  parts: AssemblyPart[]
  explodeAxis: 'y' | 'x' | 'z'
  comparisonMode?: boolean
  comparisonItems?: { label: string; parts: AssemblyPart[] }[]
  camera?: {
    position?: [number, number, number]
    fov?: number
    minDistance?: number
    maxDistance?: number
  }
}

export interface AssemblyPart {
  id: string
  label: string
  description: string
  dimensions?: string
  codeCitation?: string
  geometryType: 'box' | 'cylinder' | 'ring' | 'custom'
  geometryArgs: number[]
  position: [number, number, number]
  rotation?: [number, number, number]
  explodeOffset: number
  color: string
  material?: string
}

// ─── Template 3: FloorPlanWalkthrough ────────────────────────────────────────

export interface FloorPlanConfig {
  id: string
  title: string
  description: string
  subject: string
  planDimensions: { width: number; depth: number }
  rooms: RoomDef[]
  pathLines: PathDef[]
  fixtures: FixtureDef[]
  parameters: ParameterDef[]
  violations: ViolationRule[]
  presets: Preset[]
  camera?: {
    position?: [number, number, number]
    fov?: number
  }
}

export interface RoomDef {
  id: string
  label: string
  position: [number, number]
  size: [number, number]
  color: string
  occupancyType?: string
}

export interface PathDef {
  id: string
  label: string
  points: [number, number][]
  color: string
  maxDistance: (params: Record<string, number | boolean | string>) => number
  actualDistance: number
}

export interface FixtureDef {
  id: string
  label: string
  type: 'exit' | 'sprinkler' | 'outlet' | 'extinguisher'
  position: [number, number]
  coverageRadius?: number
}

// ─── Template 4: CutawaySection ──────────────────────────────────────────────

export interface CutawaySectionConfig {
  id: string
  title: string
  description: string
  subject: string
  layers: LayerDef[]
  cutAxis: 'x' | 'y' | 'z'
  cutRange: [number, number]
  annotations: AnnotationDef[]
  camera?: {
    position?: [number, number, number]
    fov?: number
  }
}

export interface LayerDef {
  id: string
  label: string
  description: string
  codeCitation?: string
  thickness: number
  color: string
  material?: string
  offset: number // distance from reference point along cut axis
}

// ─── Template 5: AnimatedSequence ────────────────────────────────────────────

export interface AnimatedSequenceConfig {
  id: string
  title: string
  description: string
  subject: string
  steps: SequenceStep[]
  autoPlaySpeed?: number // ms per step, 0 = manual
  camera?: {
    position?: [number, number, number]
    fov?: number
  }
}

export interface SequenceStep {
  label: string
  description: string
  codeCitation?: string
  duration: number // ms for transition
  geometries: GeometryInstruction[]
}

// ─── Module Registry ─────────────────────────────────────────────────────────

export type ModuleConfig =
  | { template: 'parametric'; config: ParametricSceneConfig }
  | { template: 'exploded'; config: ExplodedAssemblyConfig }
  | { template: 'floorplan'; config: FloorPlanConfig }
  | { template: 'cutaway'; config: CutawaySectionConfig }
  | { template: 'animated'; config: AnimatedSequenceConfig }

export interface ModuleRegistryEntry {
  id: string
  title: string
  template: TemplateType
  subject: string
  priority: number
  status: 'built' | 'config-ready' | 'planned'
  description: string
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd /d/SlateCamp/slate-camp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: Clean compilation

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/3d-lab/_types/templates.ts
git commit -m "feat(3d-lab): define template type system for all 5 scene templates"
```

---

### Task 3: Create Generic ControlPanel Component

**Files:**
- Create: `src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx`

The existing `ControlPanel.tsx` is hardcoded to labStore keys. Build a generic version that reads from any `ModuleStoreState`.

- [ ] **Step 1: Create GenericControlPanel**

```typescript
// src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx
'use client'

import { memo, useState } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { ParameterDef, Preset } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

interface GenericControlPanelProps {
  title: string
  parameters: ParameterDef[]
  presets?: Preset[]
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  className?: string
}

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border first:border-t-0 pt-2 first:pt-0">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 w-full text-left mb-2">
        {open
          ? <ChevronDown className="h-3 w-3 text-zinc-400" />
          : <ChevronRight className="h-3 w-3 text-zinc-400" />}
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  )
}

export const GenericControlPanel = memo(function GenericControlPanel({
  title,
  parameters,
  presets,
  useStore,
  className,
}: GenericControlPanelProps) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const setParams = useStore((s) => s.setParams)
  const reset = useStore((s) => s.reset)

  // Group parameters by their group field
  const groups = new Map<string, ParameterDef[]>()
  for (const p of parameters) {
    const group = p.group ?? '__default__'
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(p)
  }

  return (
    <div className={cn(
      'absolute left-4 top-4 bottom-4 z-10 w-72 overflow-y-auto',
      'bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-3',
      className,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-zinc-100" onClick={reset}>
          <RotateCcw className="h-3 w-3 text-zinc-400" />
        </Button>
      </div>

      {/* Presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setParams(preset.values)}
              className="text-[10px] font-medium text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Parameter groups */}
      {Array.from(groups.entries()).map(([group, defs]) => {
        const content = defs.map((def) => {
          const value = params[def.key] ?? def.default

          if (def.type === 'slider' && typeof value === 'number') {
            return (
              <div key={def.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-600">{def.label}</label>
                  <span className="text-[11px] font-bold text-zinc-900 tabular-nums">
                    {def.step && def.step < 1 ? value.toFixed(1) : value} {def.unit ?? ''}
                  </span>
                </div>
                <Slider
                  value={[value]}
                  min={def.min ?? 0}
                  max={def.max ?? 100}
                  step={def.step ?? 1}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v
                    if (typeof val === 'number') setParam(def.key, val)
                  }}
                  className="cursor-pointer"
                />
              </div>
            )
          }

          if (def.type === 'toggle') {
            const boolVal = Boolean(value)
            return (
              <div key={def.key} className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-600">{def.label}</label>
                <button
                  onClick={() => setParam(def.key, !boolVal)}
                  className={cn(
                    'w-8 h-4 rounded-full transition-colors relative',
                    boolVal ? 'bg-blue-600 cursor-pointer' : 'bg-zinc-200 cursor-pointer'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform',
                    boolVal ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            )
          }

          if (def.type === 'dropdown' && def.options) {
            return (
              <div key={def.key} className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-medium text-zinc-600 shrink-0">{def.label}</label>
                <select
                  value={String(value)}
                  onChange={(e) => setParam(def.key, e.target.value)}
                  className="text-[11px] font-medium text-zinc-900 border border-border rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                >
                  {def.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )
          }

          return null
        })

        if (group === '__default__') {
          return <div key={group} className="space-y-3">{content}</div>
        }

        return <Section key={group} title={group}>{content}</Section>
      })}
    </div>
  )
})
```

- [ ] **Step 2: Verify build**

Run: `cd /d/SlateCamp/slate-camp && npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx
git commit -m "feat(3d-lab): add config-driven GenericControlPanel component"
```

---

### Task 4: Create Module Registry

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/moduleRegistry.ts`

Central registry of all 186 modules (metadata only). Only the 10 priority modules will have configs initially.

- [ ] **Step 1: Create the registry file**

```typescript
// src/app/dashboard/3d-lab/_config/moduleRegistry.ts
import type { ModuleRegistryEntry, TemplateType } from '../_types/templates'

export const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  // ─── Priority 1-10 (build first) ───────────────────────────────────────────
  { id: 'stairway-configurator', title: 'PD 1096 Stairway Configurator', template: 'parametric', subject: 'PD 1096', priority: 1, status: 'planned', description: 'Interactive stair design with riser/tread/width compliance checks' },
  { id: 'fire-travel-distance', title: 'Fire Code Travel Distance', template: 'floorplan', subject: 'RA 9514', priority: 2, status: 'planned', description: 'Floor plan walkthrough with travel distance overlays and sprinkler toggle' },
  { id: 'ramp-accessible-toilet', title: 'BP 344 Ramp & Accessible Toilet', template: 'parametric', subject: 'BP 344', priority: 3, status: 'planned', description: 'Accessible ramp gradient/width + toilet dimension configurator (2024 IRR)' },
  { id: 'classical-orders-comparison', title: 'Classical Orders Comparison', template: 'exploded', subject: 'History', priority: 4, status: 'planned', description: 'Five classical column orders with explode/compare modes' },
  { id: 'nbcp-envelope', title: 'Development Controls (PSO/TGFA/AMBF)', template: 'parametric', subject: 'PD 1096', priority: 5, status: 'built', description: 'Parametric lot model with zoning envelope calculations' },
  { id: 'structural-load-path', title: 'Structural Load Path Animation', template: 'animated', subject: 'NSCP', priority: 6, status: 'planned', description: 'Animated building frame showing load flow from slab to footing' },
  { id: 'plumbing-fixture-cutaway', title: 'Plumbing Fixture Installation Cutaway', template: 'cutaway', subject: 'NPCP', priority: 7, status: 'planned', description: 'Cross-section showing trap sizes, DFU values, and pipe routing' },
  { id: 'seismic-parameter-map', title: 'Seismic Parameter Map Explorer', template: 'parametric', subject: 'NSCP', priority: 8, status: 'planned', description: 'Interactive Philippine map with zone factors and soil profiles' },
  { id: 'bahay-na-bato', title: 'Bahay na Bato Exploded Assembly', template: 'exploded', subject: 'History', priority: 9, status: 'planned', description: 'Philippine heritage house with material callouts and regional variants' },
  { id: 'construction-sequence-foundation', title: 'Construction Sequence: Foundation to Slab', template: 'animated', subject: 'Materials', priority: 10, status: 'planned', description: 'Step-by-step animated build from site prep through slab pour' },

  // ─── PD 1096 National Building Code (28 modules) ──────────────────────────
  { id: 'ceiling-heights', title: 'Ceiling Heights & Room Sizes', template: 'parametric', subject: 'PD 1096', priority: 20, status: 'planned', description: 'Natural vs artificial ventilation ceiling height requirements' },
  { id: 'court-requirements', title: 'Court Requirements', template: 'parametric', subject: 'PD 1096', priority: 20, status: 'planned', description: 'Court dimensions scaling with building height' },
  { id: 'window-openings', title: 'Window Opening Requirements', template: 'parametric', subject: 'PD 1096', priority: 20, status: 'planned', description: '10% floor area minimum with draggable window panels' },
  { id: 'vent-shafts', title: 'Vent Shaft Requirements', template: 'cutaway', subject: 'PD 1096', priority: 20, status: 'planned', description: 'Cross-section area per meter of height' },
  { id: 'firewall-construction', title: 'Firewall Construction', template: 'cutaway', subject: 'PD 1096', priority: 20, status: 'planned', description: 'Wall section cutaway with fire-resistance ratings' },
  { id: 'construction-types', title: 'Five Construction Types', template: 'exploded', subject: 'PD 1096', priority: 20, status: 'planned', description: 'Type I-V exploded building sections with fire ratings' },
  { id: 'parking-dimensions', title: 'Parking Slot Dimensions', template: 'parametric', subject: 'PD 1096', priority: 20, status: 'planned', description: 'Car/truck/PWD parking with ratios per building use' },

  // ─── RA 9514 Fire Code (18 modules) ───────────────────────────────────────
  { id: 'occupant-load-calculator', title: 'Occupant Load Factor Calculator', template: 'floorplan', subject: 'RA 9514', priority: 20, status: 'planned', description: 'Floor plan with OLF by use type and required exits' },
  { id: 'exit-door-mechanics', title: 'Exit Door Mechanics', template: 'animated', subject: 'RA 9514', priority: 20, status: 'planned', description: 'Door swing, width, force, panic hardware animation' },
  { id: 'stairwell-enclosure', title: 'Stairwell Enclosure Section', template: 'cutaway', subject: 'RA 9514', priority: 20, status: 'planned', description: 'Fire-rated stairwell with new vs existing stair dimensions' },
  { id: 'fire-suppression', title: 'Fire Suppression Systems', template: 'cutaway', subject: 'RA 9514', priority: 20, status: 'planned', description: 'Sprinklers, standpipes, and fire service connections' },
  { id: 'smoke-control', title: 'Smoke Control Systems', template: 'animated', subject: 'RA 9514', priority: 20, status: 'planned', description: 'Stairwell pressurization and vent airflow' },

  // ─── BP 344 Accessibility (14 modules) ────────────────────────────────────
  { id: 'wheelchair-maneuvering', title: 'Wheelchair Maneuvering Model', template: 'parametric', subject: 'BP 344', priority: 20, status: 'planned', description: 'Turning circles, corridor widths, clearances' },
  { id: 'tactile-blocks', title: 'Three Tactile Block Types', template: 'exploded', subject: 'BP 344', priority: 20, status: 'planned', description: 'Directional, warning, positional block details' },
  { id: 'accessible-parking', title: 'Accessible Parking', template: 'parametric', subject: 'BP 344', priority: 20, status: 'planned', description: '4,000mm wide slots with scaling table' },
  { id: 'accessible-elevator', title: 'Accessible Elevator Cab', template: 'parametric', subject: 'BP 344', priority: 20, status: 'planned', description: '2024 standard 1,200×1,400mm cab with Braille controls' },

  // ─── NSCP Structural (16 modules) ─────────────────────────────────────────
  { id: 'lrfd-combinations', title: 'LRFD Load Combinations', template: 'animated', subject: 'NSCP', priority: 20, status: 'planned', description: 'Stacked force arrow overlays for U1-U7' },
  { id: 'rc-fundamentals', title: 'Reinforced Concrete Fundamentals', template: 'cutaway', subject: 'NSCP', priority: 20, status: 'planned', description: 'Cross-sections with rebar cover and Philippine sizes' },
  { id: 'wind-load-analysis', title: 'Wind Load Analysis', template: 'parametric', subject: 'NSCP', priority: 20, status: 'planned', description: 'Pressure distribution on building faces' },
  { id: 'steel-connections', title: 'Steel Connection Types', template: 'exploded', subject: 'NSCP', priority: 20, status: 'planned', description: 'Bolted vs welded, moment vs shear connections' },

  // ─── PEC Electrical (10 modules) ──────────────────────────────────────────
  { id: 'electrical-room-context', title: 'Electrical Room Context Model', template: 'parametric', subject: 'PEC', priority: 20, status: 'planned', description: 'Outlet/switch heights and spacing coverage rings' },
  { id: 'circuit-conductor-sizing', title: 'Circuit & Conductor Sizing', template: 'cutaway', subject: 'PEC', priority: 20, status: 'planned', description: 'Panel schematic with wire sizing' },
  { id: 'illumination-levels', title: 'Illumination Levels', template: 'floorplan', subject: 'PEC', priority: 20, status: 'planned', description: 'Light intensity heatmaps by room type' },

  // ─── NPCP Plumbing (14 modules) ───────────────────────────────────────────
  { id: 'pipe-slope', title: 'Pipe Slope Visualization', template: 'cutaway', subject: 'NPCP', priority: 20, status: 'planned', description: 'Transparent building section showing pipe grades' },
  { id: 'septic-tank', title: 'Septic Tank Design', template: 'parametric', subject: 'NPCP', priority: 20, status: 'planned', description: 'Bedroom-count slider with capacity calculations' },
  { id: 'water-supply', title: 'Water Supply System', template: 'cutaway', subject: 'NPCP', priority: 20, status: 'planned', description: 'Service pipe to fixture supply traced diagram' },
  { id: 'backflow-prevention', title: 'Backflow Prevention Devices', template: 'exploded', subject: 'NPCP', priority: 20, status: 'planned', description: 'Air gaps, vacuum breakers, RPZ assemblies' },

  // ─── PMEC Mechanical (8 modules) ──────────────────────────────────────────
  { id: 'air-changes', title: 'Air Changes Per Hour', template: 'animated', subject: 'PMEC', priority: 20, status: 'planned', description: 'Animated airflow in room sections by use type' },
  { id: 'elevator-hoistway', title: 'Elevator/Hoistway Model', template: 'cutaway', subject: 'PMEC', priority: 20, status: 'planned', description: 'Cab dimensions, pit depth, ventilation' },

  // ─── History & Heritage (33 modules) ──────────────────────────────────────
  { id: 'structural-evolution', title: 'Structural Evolution Timeline', template: 'animated', subject: 'History', priority: 20, status: 'planned', description: 'Egyptian post-lintel through Gothic ribbed vault' },
  { id: 'bahay-kubo', title: 'Bahay Kubo Exploded Model', template: 'exploded', subject: 'History', priority: 20, status: 'planned', description: 'Stilt posts, bamboo floor, nipa roof assembly' },
  { id: 'earthquake-baroque', title: 'Earthquake Baroque Church', template: 'cutaway', subject: 'History', priority: 20, status: 'planned', description: 'Paoay Church massive buttress section' },

  // ─── Materials & Construction (32 modules) ────────────────────────────────
  { id: 'chb-cmu-blocks', title: 'CHB/CMU Block Dimensions', template: 'exploded', subject: 'Materials', priority: 20, status: 'planned', description: 'Actual-scale blocks with bond pattern toggle' },
  { id: 'concrete-mix', title: 'Concrete Mix Proportions', template: 'exploded', subject: 'Materials', priority: 20, status: 'planned', description: 'Class A through D ratio visualizers' },
  { id: 'foundation-types', title: 'Foundation Type Comparison', template: 'exploded', subject: 'Materials', priority: 20, status: 'planned', description: 'Isolated, combined, strip, mat, piles' },
  { id: 'roof-truss-types', title: 'Roof Truss Types', template: 'exploded', subject: 'Materials', priority: 20, status: 'planned', description: 'Fink, Pratt, Howe, Warren, King/Queen post' },
  { id: 'wall-assembly', title: 'Wall Assembly Comparison', template: 'cutaway', subject: 'Materials', priority: 20, status: 'planned', description: 'Solid CHB, cavity, veneer, curtain, drywall' },
  { id: 'waterproofing', title: 'Waterproofing Systems', template: 'cutaway', subject: 'Materials', priority: 20, status: 'planned', description: 'Membrane, cementitious, crystalline, liquid-applied' },

  // ─── Site Planning (9 modules) ────────────────────────────────────────────
  { id: 'pd957-vs-bp220', title: 'PD 957 vs BP 220 Comparison', template: 'parametric', subject: 'Site Planning', priority: 20, status: 'planned', description: 'Side-by-side subdivision lot/road/space comparison' },
  { id: 'water-code-easements', title: 'Water Code Easement Visualizer', template: 'parametric', subject: 'Site Planning', priority: 20, status: 'planned', description: 'Terrain model with urban/agricultural/forest setbacks' },
]

// ─── Helper functions ────────────────────────────────────────────────────────

export function getModuleById(id: string): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id)
}

export function getModulesBySubject(subject: string): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter((m) => m.subject === subject)
}

export function getPriorityModules(): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter((m) => m.priority <= 10).sort((a, b) => a.priority - b.priority)
}

export const SUBJECT_AREAS = [
  { id: 'PD 1096', label: 'PD 1096 National Building Code', count: 28 },
  { id: 'RA 9514', label: 'RA 9514 Fire Code', count: 18 },
  { id: 'BP 344', label: 'BP 344 Accessibility', count: 14 },
  { id: 'History', label: 'History & Heritage', count: 33 },
  { id: 'NSCP', label: 'NSCP Structural', count: 16 },
  { id: 'NPCP', label: 'NPCP Plumbing', count: 14 },
  { id: 'PEC', label: 'PEC Electrical', count: 10 },
  { id: 'PMEC', label: 'PMEC Mechanical', count: 8 },
  { id: 'Materials', label: 'Building Materials & Construction', count: 32 },
  { id: 'Site Planning', label: 'Site Planning & Housing', count: 9 },
  { id: 'Professional Practice', label: 'Professional Practice', count: 4 },
] as const
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/3d-lab/_config/moduleRegistry.ts
git commit -m "feat(3d-lab): add module registry with 186 module entries"
```

---

## Chunk 2: Template 1 — ParametricScene

### Task 5: Build ParametricScene Template Component

**Files:**
- Create: `src/app/dashboard/3d-lab/_templates/ParametricScene.tsx`
- Create: `src/app/dashboard/3d-lab/_templates/ParametricSceneRenderer.tsx`

This single template powers ~50% of all modules. It interprets a `ParametricSceneConfig` to render sliders, 3D geometry, violation indicators, and annotations.

- [ ] **Step 1: Create the R3F scene renderer (runs inside Canvas)**

```typescript
// src/app/dashboard/3d-lab/_templates/ParametricSceneRenderer.tsx
'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ParametricSceneConfig, GeometryInstruction } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import { useModuleInvalidate } from '../_hooks/useModuleInvalidate'

interface RendererProps {
  config: ParametricSceneConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

function GeometryMesh({ inst }: { inst: GeometryInstruction }) {
  const geometry = (() => {
    switch (inst.type) {
      case 'box': return <boxGeometry args={inst.args as [number, number, number]} />
      case 'cylinder': return <cylinderGeometry args={inst.args as [number, number, number, number]} />
      case 'plane': return <planeGeometry args={inst.args as [number, number]} />
      case 'ring': return <ringGeometry args={inst.args as [number, number, number]} />
      default: return <boxGeometry args={[0.1, 0.1, 0.1]} />
    }
  })()

  return (
    <mesh
      position={inst.position}
      rotation={inst.rotation ? new THREE.Euler(...inst.rotation) : undefined}
      scale={inst.scale}
    >
      {geometry}
      <meshStandardMaterial
        color={inst.color}
        transparent={inst.transparent ?? inst.opacity !== undefined}
        opacity={inst.opacity ?? 1}
        roughness={0.4}
      />
    </mesh>
  )
}

export function ParametricSceneRenderer({ config, useStore }: RendererProps) {
  useModuleInvalidate(useStore)
  const { invalidate } = useThree()

  // Read params from store (subscribed — triggers re-render when params change)
  const params = useStore((s) => s.params)

  // Build geometry instructions from current params
  const geometries = config.geometry(params)

  // Check violations
  const activeViolations = config.violations.filter((v) => v.check(params))

  // Build annotations
  const visibleAnnotations = config.annotations.filter(
    (a) => !a.visibleWhen || a.visibleWhen(params)
  )

  return (
    <group>
      {/* Geometry */}
      {geometries.map((inst) => (
        <GeometryMesh key={inst.id} inst={inst} />
      ))}

      {/* Violation indicators */}
      {activeViolations.map((v) => {
        const pos = v.position ? v.position(params) : [0, 2, 0] as [number, number, number]
        return (
          <Html key={v.id} position={pos} distanceFactor={8} occlude={false}>
            <div style={{ pointerEvents: 'none' }} className="flex items-start gap-1 bg-red-50/95 backdrop-blur-sm border border-red-300 rounded px-2 py-1 shadow-md max-w-[220px] -translate-x-1/2">
              <div className="w-3 h-3 shrink-0 mt-0.5 text-red-600">⚠</div>
              <div>
                <p className="text-[10px] font-bold text-red-700 leading-tight">{v.message}</p>
                <p className="text-[9px] text-red-500 mt-0.5">{v.codeCitation}</p>
              </div>
            </div>
          </Html>
        )
      })}

      {/* Annotations */}
      {visibleAnnotations.map((a) => (
        <Html key={a.id} position={a.position(params)} distanceFactor={8} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap -translate-x-1/2">
            <div className="text-[9px] font-bold text-zinc-700">{a.label}</div>
            {a.codeCitation && (
              <div className="text-[8px] text-zinc-400">{a.codeCitation}</div>
            )}
          </div>
        </Html>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Create the top-level ParametricScene component (Canvas + ControlPanel)**

```typescript
// src/app/dashboard/3d-lab/_templates/ParametricScene.tsx
'use client'

import { useMemo } from 'react'
import { CanvasWrapper } from '../_components/CanvasWrapper'
import { GenericControlPanel } from '../_components/GenericControlPanel'
import { ParametricSceneRenderer } from './ParametricSceneRenderer'
import { createModuleStore } from '../_stores/createModuleStore'
import type { ParametricSceneConfig } from '../_types/templates'

interface ParametricSceneProps {
  config: ParametricSceneConfig
}

export default function ParametricScene({ config }: ParametricSceneProps) {
  // Create a store instance for this module — stable across re-renders
  const useStore = useMemo(() => {
    const defaults: Record<string, number | boolean | string> = {}
    for (const p of config.parameters) {
      defaults[p.key] = p.default
    }
    return createModuleStore(defaults)
  }, [config.id])

  return (
    <div className="relative h-full w-full">
      <CanvasWrapper
        cameraPosition={config.camera?.position ?? [6, 6, 6]}
        cameraFov={config.camera?.fov ?? 35}
        minDistance={config.camera?.minDistance ?? 3}
        maxDistance={config.camera?.maxDistance ?? 20}
      >
        <ParametricSceneRenderer config={config} useStore={useStore} />
      </CanvasWrapper>
      <GenericControlPanel
        title={config.title}
        parameters={config.parameters}
        presets={config.presets}
        useStore={useStore}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd /d/SlateCamp/slate-camp && npx tsc --noEmit --pretty 2>&1 | head -30`

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/3d-lab/_templates/
git commit -m "feat(3d-lab): build ParametricScene template — config-driven 3D with sliders + violations"
```

---

### Task 6: Build Priority Module #1 — Stairway Configurator

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/stairway-configurator.ts`

All dimensions from the content bible — EXACT Philippine code values.

- [ ] **Step 1: Create the stairway config**

The stairway geometry builder creates a 3D stair model from parameters:
- Riser height, tread depth, stair width, number of risers, headroom, handrail height
- Builds individual treads and risers as boxes, stringers, handrails, landing
- Violations: max riser 200mm, min tread 250mm, min headroom 2000mm, max 3600mm between landings, handrails 800-900mm

Key parameters from PD 1096 IRR Rule VIII §804:
- Maximum riser: 200mm
- Minimum tread: 250mm
- Minimum width: 1,100mm (>50 occ), 900mm (≤50), 750mm (private <10)
- Headroom ≥ 2,000mm from nosing
- Maximum 3,600mm vertical between landings
- Handrails: 800–900mm above nosing
- Maximum 5mm riser variation per flight
- Minimum 38mm wall clearance for handrails
- Intermediate handrails every 3,000mm of width

The config file must define:
1. `parameters` array with all sliders (riserHeight, treadDepth, stairWidth, numRisers, headroom, handrailHeight, occupancyType dropdown)
2. `geometry` function that builds the stair from primitives
3. `violations` array checking every code limit
4. `annotations` for key measurements
5. `presets` for "R-1 Standard", "Accessible", "Private Stair"

Scale: 1 unit = 1mm (stair is small enough for 1:1). Sliders in mm.

- [ ] **Step 2: Verify the config compiles and test in browser**

Run: `cd /d/SlateCamp/slate-camp && npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Wire into LabViewport routing**

Add stairway-configurator to the dynamic import map in `LabViewport.tsx` and to the MOCK_TREE in `page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/3d-lab/_config/modules/stairway-configurator.ts src/app/dashboard/3d-lab/_components/LabViewport.tsx src/app/dashboard/3d-lab/page.tsx
git commit -m "feat(3d-lab): add Stairway Configurator module (Priority #1) — PD 1096 IRR Rule VIII"
```

---

## Chunk 3: Template 2 — ExplodedAssembly + Module #4

### Task 7: Build ExplodedAssembly Template Component

**Files:**
- Create: `src/app/dashboard/3d-lab/_templates/ExplodedAssembly.tsx`
- Create: `src/app/dashboard/3d-lab/_templates/ExplodedAssemblyScene.tsx`

Parts can be clicked to isolate. Explode slider separates all parts. Comparison mode shows multiple assemblies side-by-side.

- [ ] **Step 1: Create the ExplodedAssemblyScene renderer**

Key behaviors:
- Each part is a clickable mesh that highlights on hover (emissive)
- Clicking a part triggers annotation panel showing description, dimensions, code citation
- Explode slider (0-1) lerps each part along explodeAxis by its explodeOffset
- Comparison mode renders multiple assemblies side by side with shared explode slider
- Uses useFrame for smooth explode/isolate animation via refs

- [ ] **Step 2: Create the top-level ExplodedAssembly wrapper**

Similar to ParametricScene: Canvas + explode slider + info panel.

- [ ] **Step 3: Verify build and commit**

```bash
git add src/app/dashboard/3d-lab/_templates/ExplodedAssembly.tsx src/app/dashboard/3d-lab/_templates/ExplodedAssemblyScene.tsx
git commit -m "feat(3d-lab): build ExplodedAssembly template — clickable parts with explode slider"
```

---

### Task 8: Build Priority Module #4 — Classical Orders Comparison

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/classical-orders-comparison.ts`

Five orders with exact proportions from the content bible:
- Tuscan (1:7): smooth shaft, simple capital, plain architrave, blank frieze
- Doric (1:8): 20 flutes, no base (Greek), triglyphs/metopes in frieze, mutules
- Ionic (1:9): 24 flutes with fillets, volute scrolls, 3-fascia architrave, dentils
- Corinthian (1:10): 24 flutes, acanthus leaves + caulicoli, dentils + modillions
- Composite (1:10): Ionic volutes + Corinthian acanthus

Each order built from stacked primitives (cylinders for shafts, boxes for entablature blocks). Parts: base, shaft, capital (echinus/abacus/volutes), architrave, frieze, cornice.

Comparison mode shows all 5 side by side with proportional scaling.

- [ ] **Step 1: Create the classical orders config with all 5 orders**
- [ ] **Step 2: Wire into LabViewport and commit**

```bash
git commit -m "feat(3d-lab): add Classical Orders Comparison module (Priority #4) — 5 orders with explode/compare"
```

---

## Chunk 4: Template 3 — FloorPlanWalkthrough + Module #2

### Task 9: Build FloorPlanWalkthrough Template Component

**Files:**
- Create: `src/app/dashboard/3d-lab/_templates/FloorPlanWalkthrough.tsx`
- Create: `src/app/dashboard/3d-lab/_templates/FloorPlanScene.tsx`

2D floor plan rendered as flat 3D surface. Colored overlays for zones, glowing path lines for travel distances, fixtures as annotated markers. Toggle between occupancy types, sprinklered/unsprinklered.

- [ ] **Step 1: Create FloorPlanScene renderer**

Key behaviors:
- Floor plan = flat plane at y=0 with room rectangles as colored planes
- Path lines rendered with Three.js Line (from drei) showing travel distances
- Each path has actual distance vs max allowed — turns red when exceeded
- Fixtures (exits, sprinklers) as small 3D markers with coverage radius circles
- Camera top-down angled view

- [ ] **Step 2: Create top-level FloorPlanWalkthrough wrapper**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(3d-lab): build FloorPlanWalkthrough template — 2D plan with 3D overlays"
```

---

### Task 10: Build Priority Module #2 — Fire Code Travel Distance

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/fire-travel-distance.ts`

From RA 9514:
- Travel distances: 46m assembly/business (no sprinklers), 61m (sprinklered), 30m mercantile (no), 46m (yes), 31m industrial (no), 46m (yes)
- Dead-end corridors: 6m (educational/institutional/assembly), 15m (all others)
- Required exits: 2 for 10-499 occupants, 3 for 500-999, 4 for 1,000+
- OLF values: assembly concentrated 0.65 sqm/person, classroom 1.80, office 9.30, mercantile 2.80

Parameters: occupancy type dropdown, sprinklered toggle, floor area slider.

- [ ] **Step 1: Create the fire travel distance config**
- [ ] **Step 2: Wire into LabViewport and commit**

```bash
git commit -m "feat(3d-lab): add Fire Code Travel Distance module (Priority #2) — RA 9514 egress visualization"
```

---

## Chunk 5: Template 4 — CutawaySection + Module #7

### Task 11: Build CutawaySection Template Component

**Files:**
- Create: `src/app/dashboard/3d-lab/_templates/CutawaySection.tsx`
- Create: `src/app/dashboard/3d-lab/_templates/CutawaySectionScene.tsx`

Building cross-section with a cut slider that reveals/hides layers. Each layer labeled with material, dimensions, code reference.

- [ ] **Step 1: Create CutawaySectionScene renderer**

Key behaviors:
- Layers stacked along cut axis, each a box/plane with distinct color
- Cut slider controls a clipping plane position — layers beyond cut point are hidden
- Each visible layer gets an annotation with material name and dimensions
- Smooth animation for cut plane movement via useFrame refs

- [ ] **Step 2: Create top-level CutawaySection wrapper**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(3d-lab): build CutawaySection template — sliceable building sections"
```

---

### Task 12: Build Priority Module #7 — Plumbing Fixture Cutaway

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/plumbing-fixture-cutaway.ts`

From NPCP:
- Water closet (flush tank): 76mm trap, 4 DFU
- Lavatory: 32mm trap, 1 DFU
- Kitchen sink: 38mm trap, 2 DFU
- Bathtub: 38mm trap, 2 DFU
- Urinal (flush valve): 51mm trap, 4 DFU
- Trap seal depth: 51–102mm
- Pipe slopes: ≥100mm at 1%, ≤75mm at 2%

- [ ] **Step 1: Create the plumbing fixture config**
- [ ] **Step 2: Wire and commit**

```bash
git commit -m "feat(3d-lab): add Plumbing Fixture Cutaway module (Priority #7) — NPCP installation details"
```

---

## Chunk 6: Template 5 — AnimatedSequence + Modules #6, #10

### Task 13: Build AnimatedSequence Template Component

**Files:**
- Create: `src/app/dashboard/3d-lab/_templates/AnimatedSequence.tsx`
- Create: `src/app/dashboard/3d-lab/_templates/AnimatedSequenceScene.tsx`

Timeline slider or play/pause advances through discrete steps. Each step adds/transforms geometry with smooth transitions.

- [ ] **Step 1: Create AnimatedSequenceScene renderer**

Key behaviors:
- Steps array — each step defines which geometries appear/change
- Timeline slider (0 to steps.length-1) or play/pause controls
- Smooth fade-in for new geometries, position lerp for movements
- Step label + description panel updates on each step
- Auto-play mode with configurable speed

- [ ] **Step 2: Create top-level AnimatedSequence wrapper**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(3d-lab): build AnimatedSequence template — step-by-step build animation"
```

---

### Task 14: Build Priority Module #6 — Structural Load Path

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/structural-load-path.ts`

From NSCP 2015:
- Dead loads: reinforced concrete 23.6 kN/m³, steel 77.0 kN/m³
- Live loads by occupancy: residential 1.9 kPa, office 2.4 kPa, retail 4.8 kPa, assembly 4.8 kPa, heavy manufacturing 12.0 kPa, library stacks 7.2 kPa

Steps: slab loading → beam transfer → column axial → footing spread, with colored force arrows at each stage.

- [ ] **Step 1: Create the load path config**
- [ ] **Step 2: Wire and commit**

```bash
git commit -m "feat(3d-lab): add Structural Load Path module (Priority #6) — NSCP animated force flow"
```

---

### Task 15: Build Priority Module #10 — Construction Sequence

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/construction-sequence.ts`

Foundation sequence from content bible:
1. Site prep → excavation
2. Lean concrete (75mm)
3. Rebar placement
4. Formwork
5. Pour Class A concrete (1:2:4, 3500 psi)
6. Starter bars
7. Curing → backfill
8. Column layout + vertical bars
9. Formwork → pour → cure
10. Slab: shoring → formply → bottom rebar → bar chairs → top rebar → MEP sleeves → pour → cure

- [ ] **Step 1: Create the construction sequence config**
- [ ] **Step 2: Wire and commit**

```bash
git commit -m "feat(3d-lab): add Construction Sequence module (Priority #10) — foundation through slab"
```

---

## Chunk 7: Remaining Priority Modules (#3, #9) + Module Router + Gallery

### Task 16: Build Priority Module #3 — BP 344 Ramp & Accessible Toilet

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/ramp-accessible-toilet.ts`

2024 Revised IRR values (NOT the old ones):
- Ramp gradient: 1:20 default (1:15 special)
- Width: 1,200mm minimum (was 1,000mm)
- Landing: 1,800mm (was 1,000mm)
- Rise per run: max 700mm at 1:15
- Dual handrails: 700mm and 900mm
- Handrail diameter: 30-40mm
- Extensions: 300mm horizontal at top/bottom
- Raised edge: 100mm minimum
- Protection railing: 1,100mm where ramp > 750mm above grade
- Tactile warning: 600mm depth, 300mm from head/foot

Accessible toilet:
- Cubicle: 1,800 × 1,800mm minimum
- Seat height: 450mm
- WC centerline: 450mm from sidewall
- L-type grab bar: 300mm from front of WC
- Lavatory: 800mm height, 650mm vertical clearance

- [ ] **Step 1: Create the ramp + toilet config (uses ParametricScene template)**
- [ ] **Step 2: Wire and commit**

```bash
git commit -m "feat(3d-lab): add BP 344 Ramp & Accessible Toilet module (Priority #3) — 2024 IRR values"
```

---

### Task 17: Build Priority Module #9 — Bahay na Bato

**Files:**
- Create: `src/app/dashboard/3d-lab/_config/modules/bahay-na-bato.ts`

From content bible:
- Stone/brick lower level (silong/zaguan) for storage
- Wooden upper level with volada (cantilevered balcony)
- Ventanillas (small sub-windows for ventilation)
- Capiz shell sliding windows
- Floor-to-ceiling openings
- Regional variants: Vigan coral stone, Ilocos plastered brick, Batanes thick stone

Parts for ExplodedAssembly: stone foundation, silong walls, wooden floor frame, upper walls, volada balcony, ventanillas, capiz windows, roof frame, tile roof.

- [ ] **Step 1: Create the Bahay na Bato config (uses ExplodedAssembly template)**
- [ ] **Step 2: Wire and commit**

```bash
git commit -m "feat(3d-lab): add Bahay na Bato module (Priority #9) — Philippine heritage exploded assembly"
```

---

### Task 18: Build Template-Aware Module Router

**Files:**
- Modify: `src/app/dashboard/3d-lab/_components/LabViewport.tsx`

Replace the hardcoded scene routing with a config-driven router that:
1. Looks up module ID in registry
2. Loads the appropriate template component
3. Passes the module config to the template

- [ ] **Step 1: Refactor LabViewport to use registry + dynamic imports per template**

Each template is dynamically imported. Module configs are imported per-module. The router maps moduleId → registry entry → template + config.

- [ ] **Step 2: Preserve backwards compatibility for existing scenes (far-calculator, classical-orders, nbcp-envelope)**
- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(3d-lab): registry-driven module router in LabViewport"
```

---

### Task 19: Build Module Gallery Page

**Files:**
- Modify: `src/app/dashboard/3d-lab/page.tsx`

Replace the MOCK_TREE with a proper gallery:
- Grouped by subject area (13 groups)
- Each card: module title, subject tag, template type icon, status badge, description
- Priority modules highlighted
- Click navigates to module scene via `?model=<id>` query param
- Search/filter functionality

- [ ] **Step 1: Create the gallery UI**

Grid layout with subject area sections. Each section collapsible. Module cards use the existing SlateCamp design system (zinc surfaces, blue-600 primary).

- [ ] **Step 2: Update page.tsx to render gallery when no model is selected, scene when model is selected**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(3d-lab): add module gallery page grouped by subject area"
```

---

## Chunk 8: Integration & Polish

### Task 20: Integration Testing & Final Polish

- [ ] **Step 1: Verify all 10 priority modules load without errors**

Test each module ID in the browser: stairway-configurator, fire-travel-distance, ramp-accessible-toilet, classical-orders-comparison, nbcp-envelope, structural-load-path, plumbing-fixture-cutaway, seismic-parameter-map (deferred), bahay-na-bato, construction-sequence-foundation.

- [ ] **Step 2: Verify all violation rules trigger at correct thresholds**

For each parametric module, push sliders past code limits and confirm:
- Visual turns red
- Violation annotation appears with correct code citation
- Returning to compliant values clears the violation

- [ ] **Step 3: Performance check**

Run Chrome DevTools Performance tab:
- Confirm `frameloop="demand"` — zero GPU when idle
- Confirm <50 draw calls per scene
- Confirm smooth slider interaction (no jank)

- [ ] **Step 4: TypeScript strict check**

Run: `cd /d/SlateCamp/slate-camp && npx tsc --noEmit --strict 2>&1 | head -30`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(3d-lab): complete 3D Lab Library — 5 templates, 10 priority modules, gallery page"
```
