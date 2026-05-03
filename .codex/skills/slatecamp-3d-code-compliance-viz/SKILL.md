---
name: slatecamp-3d-code-compliance-viz
description: >
  SlateCamp's Code Compliance Visualization Architect — translates Philippine building laws
  into interactive 2D/3D compliance diagrams students can manipulate and learn from.
  Activate for: setback diagrams, TGFA/AMBF/PSO computation overlays, floor area ratio
  massing, fire egress travel distance paths (RA 9514), occupant load calculations, exit
  width computations, parking requirements (PD 1096), accessible path routing (BP 344),
  light and ventilation wells, building height envelopes, zoning density, easement zones
  (PD 1067), fire zone classifications, development controls calculators.
  Trigger on: "setback", "TGFA", "AMBF", "PSO", "floor area ratio", "lot coverage",
  "parking computation", "occupant load", "travel distance", "exit width", "fire egress",
  "accessible path", "development controls", "Area C computations".
---

# SlateCamp — Code Compliance Visualization Guide

## The Compliance Visualization Mandate

The #1 cause of LEA Area C failure is NOT bad design — it is wrong development controls.
Students who miscalculate AMBF, miscopy setbacks, or forget BP 344 requirements lose
points on items that are purely computational, not creative. These are the most teachable,
most visualizable, and most preventable failure modes.

**The governing insight:** Every code requirement is a spatial constraint. Setbacks define
a buildable envelope. TGFA defines a volume. Travel distance defines a path. Occupant
load defines a number. All of these become MORE understandable when students can SEE
them on a lot, on a floor plan, or on a building massing — and MANIPULATE the parameters
to see when violations occur.

**This skill is complementary to:**
- `slatecamp-3d-arch-diagram-modeler` → construction details (how it's built)
- `slatecamp-3d-parametric-engine` → component geometry (stairways, ramps)
- THIS SKILL → regulatory compliance (what's ALLOWED to be built)

---

## Compliance Diagram Taxonomy

### Tier 1: Site-Level Compliance (Before Design Begins)

These diagrams answer: "What can I build on this lot?"

| Diagram Type | Codes Involved | Visualization |
|---|---|---|
| Setback envelope | PD 1096 IRR Rule VII | 2D lot plan with setback lines → 3D buildable volume |
| Lot coverage (AMBF) | PD 1096 IRR Rule VIII | Floor plan overlay showing maximum building footprint |
| Open space (PSO) | PD 1096 IRR Rule VIII | Lot plan showing required unpaved/unbuilt area |
| Total gross floor area | PD 1096 IRR Rule VIII | Stacked floor plans → total area vs. maximum allowable |
| Building height limit | LGU zoning + CAAP OLS | 3D massing showing max height envelope |
| Easement zones | PD 1067 (waterways) | Lot plan with non-buildable easement bands |
| Parking requirement | PD 1096 Rule XIX | Floor plan/basement showing required slots |

### Tier 2: Building-Level Compliance (During Design)

These diagrams answer: "Does my design comply?"

| Diagram Type | Codes Involved | Visualization |
|---|---|---|
| Fire egress travel distance | RA 9514 IRR | Floor plan with distance paths traced from farthest point to exit |
| Exit width computation | RA 9514 IRR | Floor plan with occupant load → required exit width highlighted |
| Accessible path routing | BP 344 2024 IRR | Floor plan with continuous accessible path from parking to all public areas |
| Light & ventilation wells | PD 1096 Rule VIII | Section showing window-to-floor ratio + light well sizing |
| Stairway compliance | PD 1096 Sec 4.08 | Section detail (handled by parametric engine skill) |
| Ramp compliance | BP 344 2024 IRR | Section detail (handled by parametric engine skill) |
| Fire zone / sprinkler threshold | RA 9514 IRR | Floor plan with area computation → sprinkler required Y/N |

### Tier 3: Computation Overlays (Area C Exam Tools)

These aren't standalone models — they're overlays ON a floor plan or site plan:

| Overlay | Computation | Display |
|---|---|---|
| AMBF computation | lot_area × max_building_footprint_ratio | Shaded footprint area vs. allowed |
| PSO computation | lot_area × min_open_space_ratio | Unshaded area highlighted |
| TGFA computation | Σ(floor_areas) vs. FAR × lot_area | Running total with limit bar |
| Occupant load | floor_area / OLF per occupancy | Number badges per room |
| Exit capacity | occupant_load / exit_width_factor | Width annotations at exits |
| Parking count | function(use, floor_area) | Slot count vs. required |

---

## Development Controls Calculator — Interactive Module

The highest-value compliance module for LEA preparation. Students input lot data
and building parameters → the system computes and visualizes all development controls.

### Architecture

```
DevControlsModule
├── InputPanel (lot dimensions, occupancy, zoning)
│   ├── LotDimensionsInput
│   ├── OccupancySelector (PD 1096 Table)
│   └── ZoningParameters (FAR, height limit, setbacks)
├── ComputationEngine (pure functions, no side effects)
│   ├── computeAMBF()
│   ├── computePSO()
│   ├── computeTGFA()
│   ├── computeOccupantLoad()
│   ├── computeParkingRequired()
│   └── computeExitWidths()
├── Visualization (2D plan view + 3D massing)
│   ├── LotPlanOverlay (2D — setbacks, AMBF, PSO)
│   ├── MassingModel (3D — buildable envelope)
│   └── ComplianceScorecard (pass/fail per requirement)
└── QuizIntegration
    ├── "Given this lot, what is the maximum AMBF?"
    └── "How many parking slots are required?"
```

### Computation Functions

```typescript
// ══════════════════════════════════════════════════════
// Development Controls — PD 1096 IRR Rule VIII
// ══════════════════════════════════════════════════════

interface LotData {
  width: number          // meters
  depth: number          // meters
  area: number           // sq.m. (width × depth for rectangular lots)
  frontage: string       // 'road' | 'alley'
  adjacentUse: string    // for firewall setback determination
}

interface ZoningData {
  zone: string           // LGU zoning classification
  maxFAR: number         // Floor Area Ratio (e.g., 4.0 for C-2)
  maxBuildingHeight: number  // meters
  maxLotCoverage: number     // percentage (e.g., 0.90 for commercial)
  minOpenSpace: number       // percentage (e.g., 0.10)
}

interface SetbackRequirements {
  front: number          // meters
  rear: number           // meters
  left: number           // meters
  right: number          // meters
}

// PD 1096 IRR Rule VII — Setback Requirements
function computeSetbacks(lot: LotData, occupancy: string): SetbackRequirements {
  // Residential (Group A)
  if (occupancy.startsWith('A')) {
    if (lot.area <= 200) {
      return { front: 2.0, rear: 2.0, left: 1.5, right: 1.5 }
    }
    return { front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }
  }
  // Commercial (Group C/D)
  if (occupancy.startsWith('C') || occupancy.startsWith('D')) {
    return { front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }
  }
  // Industrial (Group F)
  if (occupancy.startsWith('F')) {
    return { front: 8.0, rear: 3.0, left: 3.0, right: 3.0 }
  }
  // Default — conservative
  return { front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }
}

// Allowable Maximum Building Footprint
function computeAMBF(lot: LotData, zoning: ZoningData, setbacks: SetbackRequirements): {
  maxFootprint: number   // sq.m.
  buildableWidth: number // meters
  buildableDepth: number // meters
  lotCoverage: number    // ratio
} {
  const buildableWidth = lot.width - setbacks.left - setbacks.right
  const buildableDepth = lot.depth - setbacks.front - setbacks.rear
  const maxBySetback = buildableWidth * buildableDepth
  const maxByZoning = lot.area * zoning.maxLotCoverage
  const maxFootprint = Math.min(maxBySetback, maxByZoning)

  return {
    maxFootprint,
    buildableWidth,
    buildableDepth,
    lotCoverage: maxFootprint / lot.area,
  }
}

// Percentage of Site Occupancy (Open Space)
function computePSO(lot: LotData, zoning: ZoningData, buildingFootprint: number): {
  openSpaceRequired: number  // sq.m.
  openSpaceProvided: number  // sq.m.
  isCompliant: boolean
} {
  const openSpaceRequired = lot.area * zoning.minOpenSpace
  const openSpaceProvided = lot.area - buildingFootprint

  return {
    openSpaceRequired,
    openSpaceProvided,
    isCompliant: openSpaceProvided >= openSpaceRequired,
  }
}

// Total Gross Floor Area
function computeTGFA(
  floorAreas: number[],  // sq.m. per floor
  lot: LotData,
  zoning: ZoningData
): {
  totalGFA: number
  maxAllowable: number   // FAR × lot area
  isCompliant: boolean
  remainingAllowable: number
} {
  const totalGFA = floorAreas.reduce((sum, a) => sum + a, 0)
  const maxAllowable = zoning.maxFAR * lot.area

  return {
    totalGFA,
    maxAllowable,
    isCompliant: totalGFA <= maxAllowable,
    remainingAllowable: Math.max(0, maxAllowable - totalGFA),
  }
}

// RA 9514 — Occupant Load Factor
function computeOccupantLoad(rooms: { area: number; use: string }[]): {
  totalOccupants: number
  roomBreakdown: { use: string; area: number; olf: number; occupants: number }[]
} {
  const OLF_TABLE: Record<string, number> = {
    'assembly_concentrated': 0.65,    // sq.m. per person
    'assembly_unconcentrated': 1.40,
    'business': 9.30,
    'educational': 1.90,
    'institutional': 11.15,
    'mercantile_street': 2.80,
    'mercantile_mall': 5.60,
    'residential': 18.60,
    'storage': 27.90,
    'industrial': 9.30,
    'kitchen': 9.30,
    'parking': 18.60,
    'mechanical': 27.90,
  }

  const breakdown = rooms.map(room => {
    const olf = OLF_TABLE[room.use] || 9.30
    return {
      use: room.use,
      area: room.area,
      olf,
      occupants: Math.ceil(room.area / olf),
    }
  })

  return {
    totalOccupants: breakdown.reduce((sum, r) => sum + r.occupants, 0),
    roomBreakdown: breakdown,
  }
}

// PD 1096 Rule XIX — Parking Requirements
function computeParkingRequired(
  occupancy: string,
  totalFloorArea: number,
  numDwellingUnits?: number
): {
  regularSlots: number
  accessibleSlots: number  // BP 344
  totalSlots: number
} {
  let regularSlots = 0

  // Simplified — actual table is per LGU zoning ordinance
  switch (occupancy) {
    case 'residential_condo':
      regularSlots = Math.ceil((numDwellingUnits || 0) * 1.0)  // 1 per unit typical
      break
    case 'office':
      regularSlots = Math.ceil(totalFloorArea / 90)   // 1 per 90 sq.m.
      break
    case 'commercial':
      regularSlots = Math.ceil(totalFloorArea / 60)   // 1 per 60 sq.m.
      break
    case 'school':
      regularSlots = Math.ceil(totalFloorArea / 200)  // 1 per 200 sq.m.
      break
    default:
      regularSlots = Math.ceil(totalFloorArea / 100)
  }

  // BP 344 — Accessible parking
  // 1 per 50 regular slots (min 1 if public building)
  const accessibleSlots = Math.max(1, Math.ceil(regularSlots / 50))

  return {
    regularSlots,
    accessibleSlots,
    totalSlots: regularSlots + accessibleSlots,
  }
}
```

---

## Visualization Patterns

### Pattern 1: Setback Diagram (2D → 3D)

The most tested compliance diagram in Area C.

```tsx
// 2D Plan View — SVG overlay on lot plan
function SetbackOverlay({ lot, setbacks }: SetbackOverlayProps) {
  const scale = 20  // pixels per meter

  return (
    <svg viewBox={`0 0 ${lot.width * scale} ${lot.depth * scale}`}>
      {/* Lot boundary */}
      <rect
        width={lot.width * scale}
        height={lot.depth * scale}
        fill="none"
        stroke="#1B3FC4"
        strokeWidth={2}
      />

      {/* Setback lines — dashed */}
      <rect
        x={setbacks.left * scale}
        y={setbacks.front * scale}
        width={(lot.width - setbacks.left - setbacks.right) * scale}
        height={(lot.depth - setbacks.front - setbacks.rear) * scale}
        fill="rgba(27, 63, 196, 0.08)"
        stroke="#1B3FC4"
        strokeWidth={1}
        strokeDasharray="6 3"
      />

      {/* Buildable area label */}
      <text
        x={(lot.width / 2) * scale}
        y={(lot.depth / 2) * scale}
        textAnchor="middle"
        className="font-mono text-xs fill-primary"
      >
        Buildable Area
      </text>

      {/* Setback dimension annotations */}
      {/* Front setback */}
      <DimAnnotation
        from={[0, 0]}
        to={[0, setbacks.front]}
        label={`${setbacks.front}m`}
        side="left"
        scale={scale}
      />
      {/* ... repeat for rear, left, right */}
    </svg>
  )
}
```

### Pattern 2: Fire Egress Travel Distance (Floor Plan Path)

```tsx
function TravelDistanceOverlay({ floorPlan, exits }: TravelDistanceProps) {
  const farthestPoint = computeFarthestPoint(floorPlan)
  const maxDistance = getMaxTravelDistance(floorPlan.occupancy, floorPlan.hasSparklers)

  // Find shortest path from farthest point to nearest exit
  const path = findShortestExitPath(farthestPoint, exits, floorPlan.obstacles)
  const actualDistance = computePathLength(path)
  const isCompliant = actualDistance <= maxDistance

  return (
    <group>
      {/* Path line on floor plan */}
      <Line
        points={path.map(p => [p.x, 0.01, p.z])}
        color={isCompliant ? '#1B7A3C' : '#E63329'}
        lineWidth={3}
        dashed={!isCompliant}
      />

      {/* Distance label at midpoint */}
      <Html position={[path[Math.floor(path.length / 2)].x, 0.5, path[Math.floor(path.length / 2)].z]}>
        <div className={`font-mono text-xs px-2 py-1 rounded
          ${isCompliant ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
          {actualDistance.toFixed(1)}m / {maxDistance}m max
        </div>
      </Html>

      {/* Exit markers */}
      {exits.map(exit => (
        <Html key={exit.id} position={[exit.x, 0.3, exit.z]}>
          <div className="w-6 h-6 bg-[#1B7A3C] rounded-full flex items-center justify-center text-white text-[9px] font-mono font-bold">
            EXIT
          </div>
        </Html>
      ))}
    </group>
  )
}
```

### Pattern 3: BP 344 Accessible Path Routing

```tsx
function AccessiblePathOverlay({ floorPlan }: AccessiblePathProps) {
  // Trace continuous accessible path: parking → entrance → elevator → all public areas
  const pathSegments = computeAccessiblePath(floorPlan)

  // Check compliance at each segment
  const violations = pathSegments.filter(seg => !seg.isAccessible)

  return (
    <group>
      {pathSegments.map(segment => (
        <Line
          key={segment.id}
          points={segment.points.map(p => [p.x, 0.01, p.z])}
          color={segment.isAccessible ? '#1B3FC4' : '#E63329'}
          lineWidth={4}
        />
      ))}

      {/* Violation markers */}
      {violations.map(v => (
        <Html key={v.id} position={[v.violationPoint.x, 0.4, v.violationPoint.z]}>
          <div className="bg-red-50 border border-red-200 rounded px-2 py-1">
            <span className="font-mono text-[9px] text-red-900">
              ✗ {v.violationReason}
            </span>
          </div>
        </Html>
      ))}

      {/* Checklist overlay */}
      <BP344Checklist
        items={[
          { label: 'Accessible parking → entrance', status: checkAccessibleParking(floorPlan) },
          { label: 'Level entrance or ramp ≤ 1:12', status: checkEntrance(floorPlan) },
          { label: 'Door width ≥ 900mm', status: checkDoorWidths(floorPlan) },
          { label: 'Accessible toilet provided', status: checkAccessibleToilet(floorPlan) },
          { label: 'Elevator (if multi-story)', status: checkElevator(floorPlan) },
          { label: 'Signage with Braille', status: checkSignage(floorPlan) },
        ]}
      />
    </group>
  )
}
```

### Pattern 4: 3D Buildable Envelope (Massing)

Shows the maximum building volume allowed on a lot:

```tsx
function BuildableEnvelope({ lot, setbacks, zoning }: EnvelopeProps) {
  const ambf = computeAMBF(lot, zoning, setbacks)

  return (
    <group>
      {/* Lot ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lot.width / 2, 0, lot.depth / 2]}>
        <planeGeometry args={[lot.width, lot.depth]} />
        <meshStandardMaterial color="#E8E4DB" side={THREE.DoubleSide} />
      </mesh>

      {/* Buildable volume — transparent blue */}
      <mesh position={[
        setbacks.left + ambf.buildableWidth / 2,
        zoning.maxBuildingHeight / 2,
        setbacks.front + ambf.buildableDepth / 2,
      ]}>
        <boxGeometry args={[ambf.buildableWidth, zoning.maxBuildingHeight, ambf.buildableDepth]} />
        <meshStandardMaterial
          color="#1B3FC4"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Setback zone — red tint on ground */}
      {/* Front setback */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lot.width / 2, 0.005, setbacks.front / 2]}>
        <planeGeometry args={[lot.width, setbacks.front]} />
        <meshStandardMaterial color="#E63329" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* ... repeat for rear, left, right */}

      {/* Height limit plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lot.width / 2, zoning.maxBuildingHeight, lot.depth / 2]}
      >
        <planeGeometry args={[lot.width * 1.2, lot.depth * 1.2]} />
        <meshStandardMaterial color="#E63329" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
```

---

## LEA Area C — Quick Reference Tables

### RA 9514 Travel Distance Limits (meters)

| Occupancy | Sprinklered | Unsprinklered |
|---|---|---|
| Assembly | 75 | 45 |
| Business | 90 | 60 |
| Educational | 75 | 45 |
| Industrial (low hazard) | 90 | 60 |
| Industrial (high hazard) | 23 | 23 |
| Mercantile | 90 | 60 |
| Residential | 60 | 45 |
| Institutional | 60 | 30 |

### PD 1096 Occupancy Groups

| Group | Description | Examples |
|---|---|---|
| A | Residential | Dwellings, apartments, hotels |
| B | Educational | Schools, training centers |
| C | Institutional | Hospitals, correctional |
| D | Business/Mercantile | Offices, shops, malls |
| E | Industrial | Factories, workshops |
| F | Storage | Warehouses |
| G | Assembly | Churches, theaters, gyms |
| H | Accessory | Garages, fences, utility |
| I | Agricultural | Farm buildings |

### BP 344 (2024 IRR) Key Dimensions

| Element | Requirement |
|---|---|
| Accessible parking slot | 3,700mm × 5,000mm (3.7m × 5.0m) |
| Accessible aisle width | 1,525mm minimum |
| Ramp max slope | 1:12 |
| Door clear width | 900mm minimum |
| Accessible toilet | 1,500mm × 1,500mm minimum |
| Wheelchair turning radius | 1,500mm |
| Elevator min interior | 1,100mm × 1,400mm |
| Tactile guide strip width | 300mm |
| Handrail height | 800–900mm |
| Grab bar height | 800–900mm |

---

## Compliance Scorecard Component

Every compliance module ends with a scorecard:

```tsx
interface ComplianceItem {
  label: string
  codeRef: string
  status: 'pass' | 'fail' | 'warning'
  value: string        // "14.2m (max 15m)"
  detail: string
}

function ComplianceScorecard({ items }: { items: ComplianceItem[] }) {
  const passCount = items.filter(i => i.status === 'pass').length

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
        Compliance Check
      </p>
      <p className="font-sans text-sm font-medium mb-3">
        {passCount}/{items.length} requirements met
      </p>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-start gap-2">
            <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5
              ${item.status === 'pass' ? 'bg-[#1B7A3C]' :
                item.status === 'fail' ? 'bg-[#E63329]' : 'bg-[#F5A623]'}`}
            />
            <div>
              <p className="font-sans text-xs font-medium text-gray-900">{item.label}</p>
              <p className="font-mono text-[10px] text-gray-500">{item.value}</p>
              <p className="font-mono text-[9px] text-gray-400">{item.codeRef}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Reference Files

| File | When to Read |
|---|---|
| `references/pd1096-development-controls.md` | Complete PD 1096 IRR Rule VII & VIII tables for setbacks, AMBF, PSO, TGFA |
| `references/ra9514-fire-egress-tables.md` | Travel distance, exit width, occupant load factor tables |
| `references/bp344-2024-checklist.md` | Full BP 344 2024 IRR compliance checklist with dimensions |
| `references/lgu-zoning-matrices.md` | Common LGU zoning parameters (Manila, Makati, Cebu, Davao) |
| `references/area-c-computation-templates.md` | Step-by-step computation templates for LEA Area C |
| `references/parking-tables.md` | Parking requirement tables by occupancy and LGU |
