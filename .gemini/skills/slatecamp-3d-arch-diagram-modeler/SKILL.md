---
name: slatecamp-3d-arch-diagram-modeler
description: >
  SlateCamp's Architectural Diagram Modeler — translates 2D construction details, wall
  sections, structural connections, MEP systems, and building assemblies into interactive
  3D WebGL models. Activate for: wall section details, foundation details, roof-to-wall
  connections, floor slab assemblies, column-beam joints, CHB wall construction, MEP
  coordination cutaways, plumbing/electrical/HVAC systems, rebar placement, waterproofing
  layers, progressive build animations, material layering, Philippine construction methods
  (RCC frame + CHB infill). Trigger on: "wall section", "construction detail", "foundation",
  "CHB wall", "rebar", "MEP cutaway", "plumbing detail", "structural connection",
  "material layers", "isometric", "building assembly", "how is this built".
---

# SlateCamp — Architectural Diagram Modeler Guide

## The Modeling Philosophy

Traditional architectural education teaches construction through 2D section drawings.
Students must mentally reconstruct 3D assemblies from orthographic projections — a spatial
cognition skill that many struggle with. SlateCamp's 3D construction diagrams eliminate
this translation step: students SEE how materials layer, connect, and relate in space.

**The dual-coding advantage:** A 2D wall section drawing (verbal/symbolic encoding) paired
with an interactive 3D model of the same assembly (spatial encoding) produces 65% better
retention than either alone (Mayer, 2001). Every 3D construction diagram should be paired
with its corresponding Wiki article showing the 2D drawing.

**The governing question:** "Would a 2D section drawing be equally clear?" If YES — build
the 2D diagram. If the student needs to see behind, inside, around, or through the
assembly to understand it — build the 3D model.

---

## Architectural Drawing Type → 3D Model Type Matrix

| Drawing Type | 2D Purpose | 3D Model Type | Interaction |
|---|---|---|---|
| Wall section | Show material layers vertically | Exploded layer assembly | Explode slider |
| Foundation detail | Show footing-to-wall connection | Cross-section cutaway | Clip plane |
| Roof-to-wall junction | Show weatherproofing layers | Exploded + annotated | Explode + hotspots |
| Floor slab assembly | Show structural layers | Cross-section | Clip plane + hotspots |
| Column-beam joint | Show reinforcement connection | Transparent overlay | Opacity toggle |
| CHB wall construction | Show block coursing + rebar | Progressive build | Step-through animation |
| MEP coordination | Show system spatial relationships | Toggle-layer cutaway | System on/off toggles |
| Plumbing trap | Show water seal geometry | Parametric + cutaway | Slider + clip plane |
| Structural framing | Show member relationships | Axonometric wireframe | Highlight + dimension |
| Stairway detail | Show rise/run/landing geometry | Parametric sandbox | Slider controls |

---

## Construction Assembly Modeling Patterns

### Pattern 1: Layered Assembly (Wall Sections, Floor Slabs, Roof Assemblies)

The most common SlateCamp diagram type. Material layers are modeled as separate meshes
that can be exploded apart to reveal construction sequence.

```tsx
'use client'

import { useLabStore } from '@/stores/useLabStore'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

// Material layer definition — one per construction material
interface MaterialLayer {
  id: string
  name: string               // "CHB 150mm"
  material: string           // "Concrete Hollow Block"
  thickness: number          // meters
  color: string              // hex for visualization
  opacity: number            // 1.0 default, < 1.0 for transparency mode
  hatchPattern?: string      // architectural hatch reference
  codeReference?: string     // "PD 1096 Sec 7.03"
  description: string        // "150mm CHB laid in running bond with..."
}

// Philippine CHB Wall Section — typical residential construction
const CHB_WALL_LAYERS: MaterialLayer[] = [
  {
    id: 'ext-plaster',
    name: 'Exterior Cement Plaster',
    material: 'Cement-sand plaster 1:4',
    thickness: 0.020,
    color: '#C4BAA5',
    opacity: 1.0,
    description: '20mm cement-sand plaster, trowel finish. Applied in two coats: scratch coat (12mm) + finish coat (8mm).',
  },
  {
    id: 'chb-block',
    name: 'CHB 150mm',
    material: 'Concrete Hollow Block — Class B (load-bearing)',
    thickness: 0.150,
    color: '#9A9A8E',
    opacity: 1.0,
    codeReference: 'PD 1096 Sec 7.03 / NSCP 2015 Ch 7',
    description: '150mm CHB laid in running bond. Vertical rebar at 600mm o.c. in grouted cells. Horizontal joint reinforcement every 3rd course.',
  },
  {
    id: 'int-plaster',
    name: 'Interior Cement Plaster',
    material: 'Cement-sand plaster 1:4',
    thickness: 0.015,
    color: '#D4CFC5',
    opacity: 1.0,
    description: '15mm interior plaster, smooth trowel finish. Skim coat applied before paint.',
  },
  {
    id: 'paint',
    name: 'Latex Paint',
    material: 'Acrylic latex paint',
    thickness: 0.001,
    color: '#F2F0EB',
    opacity: 1.0,
    description: '2 coats acrylic latex paint over primer. Interior walls only.',
  },
]

export function WallSectionAssembly() {
  const explodeAmount = useLabStore(s => s.explodeAmount)
  const activeLayer = useLabStore(s => s.activeLayer)
  const setActiveLayer = useLabStore(s => s.setActiveLayer)
  const invalidate = useThree(s => s.invalidate)

  // Build layer positions based on thickness and explode amount
  const layerPositions = useMemo(() => {
    let runningX = 0
    return CHB_WALL_LAYERS.map((layer, i) => {
      const baseX = runningX + layer.thickness / 2
      runningX += layer.thickness
      const explodeOffset = explodeAmount * (i - CHB_WALL_LAYERS.length / 2) * 0.15
      return baseX + explodeOffset
    })
  }, [explodeAmount])

  useEffect(() => invalidate(), [explodeAmount, activeLayer, invalidate])

  return (
    <group>
      {CHB_WALL_LAYERS.map((layer, i) => (
        <group key={layer.id}>
          {/* Layer geometry */}
          <mesh
            position={[layerPositions[i], 0.5, 0]}
            onClick={() => setActiveLayer(layer.id)}
          >
            <boxGeometry args={[layer.thickness, 1.0, 0.6]} />
            <meshStandardMaterial
              color={layer.color}
              transparent={activeLayer !== null && activeLayer !== layer.id}
              opacity={activeLayer !== null && activeLayer !== layer.id ? 0.3 : layer.opacity}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Layer label (visible when exploded) */}
          {explodeAmount > 0.2 && (
            <Html position={[layerPositions[i], 1.1, 0]} center>
              <div className="font-mono text-[9px] font-medium text-center whitespace-nowrap
                            bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200
                            shadow-sm">
                <div className="text-gray-900">{layer.name}</div>
                <div className="text-gray-400">{(layer.thickness * 1000).toFixed(0)}mm</div>
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Total wall thickness dimension */}
      <DimensionAnnotation
        label={`Total: ${(CHB_WALL_LAYERS.reduce((sum, l) => sum + l.thickness, 0) * 1000).toFixed(0)}mm`}
        position={[0.1, -0.15, 0]}
      />
    </group>
  )
}
```

### Pattern 2: Progressive Build Animation (Construction Sequence)

Shows how a building element is assembled step by step — like watching a time-lapse of construction.

```tsx
interface BuildStep {
  id: string
  label: string           // "Step 1: Footing Excavation"
  meshNames: string[]     // Which meshes become visible at this step
  description: string     // What's happening in this step
  codeReference?: string
  duration: number        // Suggested viewing time in seconds
}

const CHB_WALL_BUILD_STEPS: BuildStep[] = [
  {
    id: 'step-1',
    label: 'Foundation',
    meshNames: ['footing', 'foundation_wall'],
    description: 'Strip footing poured first. Foundation wall built on top with dowel bars projecting for wall connection.',
    codeReference: 'NSCP 2015 Sec 1808',
    duration: 5,
  },
  {
    id: 'step-2',
    label: 'First Course CHB',
    meshNames: ['chb_course_1', 'mortar_bed_1'],
    description: 'First course of CHB laid on mortar bed. Level checked. Vertical rebar cells aligned with dowels from foundation.',
    duration: 4,
  },
  {
    id: 'step-3',
    label: 'Vertical Reinforcement',
    meshNames: ['vertical_rebar'],
    description: 'Vertical rebar inserted through hollow cores at 600mm o.c. Rebar lapped with foundation dowels per NSCP.',
    codeReference: 'NSCP 2015 Sec 2106',
    duration: 4,
  },
  {
    id: 'step-4',
    label: 'Remaining Courses',
    meshNames: ['chb_courses_2_to_12'],
    description: 'Remaining CHB courses laid in running bond. Horizontal joint reinforcement every 3rd course. Cores grouted at rebar locations.',
    duration: 5,
  },
  {
    id: 'step-5',
    label: 'Lintel Beam',
    meshNames: ['lintel_beam', 'lintel_rebar'],
    description: 'Reinforced concrete lintel beam at door/window openings. Minimum bearing of 200mm on each side.',
    codeReference: 'PD 1096 Wall Openings',
    duration: 4,
  },
  {
    id: 'step-6',
    label: 'Plastering',
    meshNames: ['exterior_plaster', 'interior_plaster'],
    description: 'Cement-sand plaster applied. Scratch coat first (12mm), cured, then finish coat (8mm). Interior plaster 15mm with skim coat.',
    duration: 4,
  },
]

export function ProgressiveBuildController({ scene }: { scene: THREE.Group }) {
  const currentStep = useLabStore(s => s.buildStep)

  useEffect(() => {
    // Show only meshes up to and including current step
    const visibleMeshes = new Set<string>()
    for (let i = 0; i <= currentStep; i++) {
      CHB_WALL_BUILD_STEPS[i]?.meshNames.forEach(name => visibleMeshes.add(name))
    }

    scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        child.visible = visibleMeshes.has(child.name)
      }
    })
  }, [currentStep, scene])

  return null
}
```

### Pattern 3: MEP Coordination Cutaway (System Toggle)

The most spatially educational model in the 3D Lab — shows how MEP systems coexist in a building section.

```tsx
interface MEPSystem {
  id: string
  label: string
  color: string
  meshPrefix: string      // All meshes starting with this prefix belong to this system
  icon: string            // Emoji for toggle button
  defaultVisible: boolean
}

const MEP_SYSTEMS: MEPSystem[] = [
  { id: 'structural', label: 'Structural Frame', color: '#6B7280', meshPrefix: 'str_', icon: '🏗️', defaultVisible: true },
  { id: 'plumbing', label: 'Plumbing', color: '#3B82F6', meshPrefix: 'plm_', icon: '🔵', defaultVisible: false },
  { id: 'electrical', label: 'Electrical', color: '#EAB308', meshPrefix: 'elc_', icon: '⚡', defaultVisible: false },
  { id: 'hvac', label: 'HVAC Ductwork', color: '#10B981', meshPrefix: 'hvac_', icon: '🌀', defaultVisible: false },
  { id: 'fire', label: 'Fire Protection', color: '#EF4444', meshPrefix: 'fire_', icon: '🔴', defaultVisible: false },
]

export function MEPTogglePanel() {
  const visibleSystems = useLabStore(s => s.visibleSystems)
  const toggleSystem = useLabStore(s => s.toggleSystem)

  return (
    <div className="space-y-1.5">
      <p className="font-mono text-[9px] font-medium uppercase tracking-widest
                    text-muted-foreground mb-2">
        Building Systems
      </p>
      {MEP_SYSTEMS.map(system => (
        <button
          key={system.id}
          onClick={() => toggleSystem(system.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs
                     font-sans transition-all border
                     ${visibleSystems.includes(system.id)
                       ? 'bg-white border-gray-300 shadow-sm'
                       : 'bg-gray-50 border-gray-100 opacity-50'
                     }`}
        >
          <span>{system.icon}</span>
          <span className="flex-1 text-left">{system.label}</span>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: visibleSystems.includes(system.id) ? system.color : '#D1D5DB' }}
          />
        </button>
      ))}
    </div>
  )
}
```

---

## Philippine Construction Method Catalog

The 3D Lab prioritizes construction methods used in Philippine practice:

### Structural Systems
| System | Prevalence | LEA Relevance | 3D Module Priority |
|---|---|---|---|
| RCC frame + CHB infill | Dominant (80%+ of projects) | Very high | P1 |
| Structural steel frame | Commercial/industrial | High | P2 |
| Load-bearing CHB walls | Low-rise residential | Medium | P2 |
| Pre-stressed concrete | Bridges, large spans | Low in LEA | P3 |
| Timber frame (traditional) | Provincial, heritage | History questions | P3 |

### Wall Systems
| Assembly | Components to Model | Typical Dimensions |
|---|---|---|
| CHB wall (standard) | CHB + mortar + plaster + paint | 150mm CHB + 20mm ext + 15mm int |
| CHB wall (waterproofed) | Above + waterproofing membrane + drainage mat | + 5mm membrane |
| Curtain wall | Aluminum mullion + glass + spandrel + sealant | 100-200mm depth |
| Drywall partition | Metal studs + gypsum board (both sides) | 92mm total (typical) |

### Connection Details (High LEA Frequency)
| Detail | Code Reference | Why It's Tested |
|---|---|---|
| Column-to-footing | NSCP 2015 Sec 1808 | Reinforcement development length |
| Beam-column joint | NSCP 2015 Sec 2106 | Seismic confinement requirements |
| Slab-to-beam | NSCP 2015 Sec 1905 | Negative moment reinforcement |
| Wall-to-slab | PD 1096 Sec 7 | Fire rating continuity |
| Roof-to-wall | PD 1096 Sec 12 | Weatherproofing responsibility |

---

## Material Visualization Standards

### Material Colors (Consistent Across All Models)

```typescript
const MATERIAL_PALETTE = {
  concrete: { color: '#B8B4A8', roughness: 0.9 },
  rebar: { color: '#555555', roughness: 0.3, metalness: 0.8 },
  chb: { color: '#9A9A8E', roughness: 0.85 },
  mortar: { color: '#A8A298', roughness: 0.95 },
  cementPlaster: { color: '#C4BAA5', roughness: 0.85 },
  waterproofing: { color: '#1A1A2E', roughness: 0.6 },
  insulation: { color: '#F5D68A', roughness: 0.95 },
  glass: { color: '#E8EDF2', roughness: 0.05, transmission: 0.9 },
  steel: { color: '#8A8A8A', roughness: 0.2, metalness: 0.9 },
  timber: { color: '#C49B6A', roughness: 0.8 },
  soil: { color: '#8B7355', roughness: 1.0 },
  gravel: { color: '#A09080', roughness: 1.0 },
  paint: { color: '#F2F0EB', roughness: 0.4 },
  pipe_water: { color: '#3B82F6', roughness: 0.3, metalness: 0.6 },
  pipe_drain: { color: '#6B7280', roughness: 0.3, metalness: 0.6 },
  duct_hvac: { color: '#C4C4C4', roughness: 0.25, metalness: 0.7 },
  conduit_elec: { color: '#EAB308', roughness: 0.3, metalness: 0.5 },
  pipe_fire: { color: '#EF4444', roughness: 0.3, metalness: 0.6 },
} as const
```

### Material Transparency for X-Ray Mode

When a student activates "x-ray" or "transparent" mode:
- Structural elements: 30% opacity (visible skeleton)
- Selected system: 100% opacity (highlighted)
- All other systems: 15% opacity (ghost)
- Labels remain 100% opacity always

---

## Blender Modeling Standards for Construction Details

### Naming Convention for Meshes

```
[system]_[element]_[qualifier]
str_column_01          Structural column, first instance
str_beam_main          Structural main beam
str_rebar_vert_01      Vertical reinforcement bar
chb_course_01          CHB wall course 1
chb_mortar_bed_01      Mortar bed between courses
plm_pipe_supply_01     Plumbing supply pipe
plm_trap_p             Plumbing P-trap
elc_conduit_main       Electrical main conduit
hvac_duct_supply_01    HVAC supply duct
fire_sprinkler_head_01 Fire sprinkler head
```

### Mesh Grouping (Blender Collections → glTF Nodes)

```
Collection: Construction_Detail
├── Collection: Structural
│   ├── str_footing
│   ├── str_column_01
│   └── str_beam_main
├── Collection: Walls
│   ├── chb_course_01 ... chb_course_12
│   ├── chb_mortar_bed_01 ... chb_mortar_bed_11
│   └── ext_plaster, int_plaster
├── Collection: MEP_Plumbing
│   ├── plm_pipe_supply_01
│   └── plm_trap_p
└── Collection: Annotations
    ├── hotspot_rebar_detail
    └── hotspot_waterproofing
```

This structure maps directly to Three.js scene graph traversal in R3F.

---

## Diagram Accuracy Validation

Before any construction diagram ships:

```
DIMENSIONAL ACCURACY
[ ] All member sizes match code-cited minimums or typical Philippine practice
[ ] Rebar sizes and spacing match NSCP provisions
[ ] CHB dimensions are standard Philippine sizes (100, 150, 200mm)
[ ] Clearances match BP 344 or applicable code
[ ] Layer thicknesses are proportionally accurate (not just symbolic)

CONSTRUCTION SEQUENCE
[ ] Layers are in correct construction order (foundation → structure → envelope → finish)
[ ] Connection details show realistic construction method
[ ] Mortar joints, rebar laps, and anchorage shown correctly
[ ] No physically impossible geometry (materials passing through each other)

MATERIAL ACCURACY
[ ] Material colors/textures are identifiable without labels
[ ] Steel is visually distinct from concrete
[ ] Waterproofing membranes are visible as a distinct layer
[ ] Glass transmission is realistic (not opaque, not invisible)

EDUCATIONAL VALUE
[ ] Exploded view reveals all layers students need to understand
[ ] Hotspots are placed on the elements they describe (spatial contiguity)
[ ] Code references are attached to the specific element they govern
[ ] The model answers a question that a 2D drawing cannot
```

---

## Reference Files

| File | When to Read |
|---|---|
| `references/ph-construction-assemblies.md` | Complete catalog of Philippine construction assemblies with layer specs |
| `references/material-hatch-to-3d.md` | Mapping from architectural hatch patterns to 3D material settings |
| `references/detail-modeling-recipes.md` | Step-by-step Blender scripts for common construction details |
| `references/mep-system-specs.md` | Pipe sizes, duct dimensions, conduit sizes for MEP models |
| `references/rebar-detailing.md` | NSCP rebar sizes, lap lengths, hook dimensions for structural models |
