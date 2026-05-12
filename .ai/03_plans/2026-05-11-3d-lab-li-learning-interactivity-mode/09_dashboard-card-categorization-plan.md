# 09 — Dashboard Card Categorization Plan

## Current Dashboard / Card Architecture

### Dashboard Page
- **File**: `src/app/dashboard/3d-lab/page.tsx`
- Renders `LabBrowser` inside `LabBrowserShell`
- Entitlement gate using `threeDLabFull`

### LabBrowser
- **File**: `src/features/3d-lab/components/LabBrowser.tsx`
- Two modes based on `DASHBOARD_VISIBLE_IDS`:
  1. **Simplified mode** (active): flat grid from allowlisted modules
  2. **Category drill-down** (inactive): CategoryGrid → ModuleList
- Currently 5 modules visible on dashboard

### ModuleCard
- **File**: `src/features/3d-lab/components/ModuleCard.tsx`
- Displays template type badge via `TEMPLATE_META` record
- Displays status badge (Available, QA Preview, Coming Soon)
- Renders title, description, code reference
- Links to `ROUTES.lab.module(module.id)` if built

### TEMPLATE_META Record
```typescript
const TEMPLATE_META: Record<TemplateType, { label, icon, className }> = {
  parametric: { label: 'Parametric', icon: Cube, ... },
  exploded: { label: 'Exploded', icon: Stack, ... },
  floorplan: { label: 'Floor Plan', icon: MapTrifold, ... },
  cutaway: { label: 'Cutaway', icon: Scissors, ... },
  animated: { label: 'Animated', icon: Play, ... },
  calculator: { label: 'Calculator', icon: Calculator, ... },
  'wall-configurator': { label: 'Wall Configurator', icon: Wall, ... },
}
```

## How Cards Are Currently Sourced

1. `DASHBOARD_VISIBLE_IDS` Set defines visible module IDs
2. `getModuleById(id)` resolves to `ModuleRegistryEntry`
3. `ModuleCard` receives `module: ModuleRegistryEntry`

## Recommended Mode Labeling Strategy

Add a **mode badge** separate from the template type badge. Each card shows:

```
┌──────────────────────────────┐
│ [Template Type] [Mode] [Status] │  ← Badge row
│                              │
│ Module Title                 │
│ Description text...          │
│                              │
│ CODE REFERENCE               │
└──────────────────────────────┘
```

### Mode Badge Styling

| Mode | Label | Color | Icon |
|------|-------|-------|------|
| PI | Parametric | Primary/blue (same as current parametric) | Cube (existing) |
| LI | Learning | Emerald/green (new) | GraduationCap or BookOpen (new) |

Since PI is the default, existing modules keep their current template type badge. LI modules ADD a "Learning" mode badge alongside the template type badge.

**Alternative (simpler) approach**: The mode is expressed through the template type badge itself. Since LI uses `templateType: 'learning'`, the badge would say "Learning" instead of a separate mode + type distinction. This is simpler for MVP.

### MVP Recommendation: Single Badge System

Use the existing `TEMPLATE_META` pattern. Add a `'learning'` entry:

```typescript
'learning': {
  label: 'Learning',
  icon: GraduationCap,  // or BookOpen
  className: 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
}
```

This is the simplest approach — one badge per card that communicates both template type AND mode.

## Recommended Filtering / Grouping Strategy

### MVP: Filter Chips

Add mode filter chips above the module grid in the simplified dashboard view:

```
[All Modules] [Parametric] [Learning]
    5              4            1
```

Implementation:
- State: `const [modeFilter, setModeFilter] = useState<'all' | 'PI' | 'LI'>('all')`
- Filter: `dashboardModules.filter(m => modeFilter === 'all' || m.mode === modeFilter)`
- Chips use existing badge styling

### Future: Tabs + Grouped Sections

Could add tabbed view or grouped sections when LI module count grows.

## Recommended Sorting Strategy

For MVP: No sorting changes. Modules display in registry order (as current). LI modules naturally appear alongside PI modules in the same grid.

## How to Avoid Breaking Current Cards

1. **Add `mode` as optional field** with resolver defaulting to `'PI'`
2. **Existing `TEMPLATE_META` entries unchanged** — PI modules show same badges
3. **Module card link behavior unchanged** — all modules link via `ROUTES.lab.module(id)`
4. **No changes to card layout structure** — only add conditional mode badge

## Data Representation

### ModuleRegistryEntry Extension
```typescript
export interface ModuleRegistryEntry {
  // ...existing fields...
  mode?: 'PI' | 'LI'  // NEW: optional, defaults to 'PI'
}
```

### Registry Category Files
LI modules are added to existing category files alongside PI modules:
```typescript
// In cat-02.ts (Accessibility)
export const cat02Modules: ModuleRegistryEntry[] = [
  // ...existing PI modules...
  {
    id: 'bp344-ramp-layers',
    title: 'BP 344 Ramp Components',
    templateType: 'learning',
    mode: 'LI',
    categoryId: 'ACCESSIBILITY',
    // ...other fields...
  },
]
```

## Backward Compatibility

- **Cards without `mode`**: Resolve to `'PI'` in all consumers
- **Existing dashboard behavior**: Unchanged when all modules are PI (current state)
- **Dashboard visibility**: LI modules can be added to `DASHBOARD_VISIBLE_IDS` alongside PI modules
- **Filter chips**: Default to "All" so both PI and LI cards show

## Empty / Loading / Error States

- **No LI modules**: Filter chips still show, but "Learning" chip shows count 0
- **LI module config fails to load**: Same error state as PI modules (ModuleViewer error state)
- **Dashboard with only PI**: Filter chips visible but not necessary — could be hidden when LI count is 0

## UX Options Analysis

| Option | Description | MVP? |
|--------|-------------|------|
| Badge only | Learning badge on card, no filter | ❌ Too subtle |
| Tabs | Separate PI/LI tabs replace modules | ❌ Overkill for 1 LI module |
| Filter chips | All/PI/LI filter above grid | ✅ Recommended |
| Grouped sections | "Parametric Modules" / "Learning Modules" headers | ❌ Premature |
| Segmented control | iOS-style segmented toggle | ❌ Over-designed |

## Recommended MVP UI

**Filter chips above the module grid + "Learning" badge on LI cards.**

```
3D Interactive Lab
5 interactive modules available · 1 QA preview

[All (5)] [Parametric (4)] [Learning (1)]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Parametric   │ │ Parametric   │ │ Calculator   │ │ Wall Config  │ │ Learning    │
│ Available    │ │ Available    │ │ Available    │ │ Available    │ │ Available   │
│             │ │             │ │             │ │             │ │             │
│ Site Dev...  │ │ Stairway...  │ │ Flooring...  │ │ Unified...   │ │ BP 344...   │
│ Desc...      │ │ Desc...      │ │ Desc...      │ │ Desc...      │ │ Desc...     │
│ PD 1096...   │ │ PD 1096...   │ │ PD 1096...   │ │ PD 1096...   │ │ BP 344...   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Future UI Enhancements

- Tab bar with PI/LI sections when LI has 3+ modules
- Badge counts animate on filter change
- "New" indicator on recently added LI modules
- Thumbnail previews for LI modules
- Category drill-down supports mode filter
