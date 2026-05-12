# 08 — Dashboard and Discovery Strategy

## How Learners Discover LI Modules

### Current Discovery Path (PI Only)

```
Dashboard Sidebar
  → "3D Lab" nav item
    → /dashboard/3d-lab
      → LabBrowser (simplified mode: flat grid of visible modules)
        → ModuleCard → /dashboard/3d-lab/[moduleId]
```

### Proposed Discovery Path (PI + LI)

```
Dashboard Sidebar
  → "3D Lab" nav item
    → /dashboard/3d-lab
      → Mode filter chips: [All] [Parametric] [Learning]
        → Filtered ModuleCard grid
          → PI card → PI module page
          → LI card → LI module page
```

### Proposed Coverage View Path

```
Dashboard Sidebar
  → "3D Lab" nav item
    → /dashboard/3d-lab?view=coverage
      → Coverage View: filterable atlas of all code families + topics
        → See 3D module status per topic
        → Click to navigate to LI module
```

## Module Card Evolution

### Current Card (PI only)
```
┌──────────────────────────────┐
│ [Parametric] [Available]     │
│                              │
│ Stairway Configurator        │
│ Interactive stairway design  │
│ with code compliance...      │
│                              │
│ PD 1096 §12 • RA 9514 §10   │
└──────────────────────────────┘
```

### LI Card (New)
```
┌──────────────────────────────┐
│ [Learning] [Available]       │  ← Emerald "Learning" badge
│                              │
│ BP 344 Ramp Components       │
│ Explore accessible ramp      │
│ layers and requirements.     │
│                              │
│ BP 344 §4                    │
└──────────────────────────────┘
```

### LI Card with Sub-Mode Indicators (Future)
```
┌──────────────────────────────┐
│ [Learning] [Available]       │
│                              │
│ BP 344 Ramp Components       │
│ Explore accessible ramp      │
│ layers and requirements.     │
│                              │
│ 🔍 Focus  ⚖ Compare         │  ← Sub-mode availability icons
│ 🔎 Hunt    📝 Drill          │
│                              │
│ BP 344 §4                    │
└──────────────────────────────┘
```

## Mode Filter Chips

```
3D Interactive Lab
5 interactive modules available

[All (5)] [Parametric (4)] [Learning (1)]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Parametric   │ │ Parametric   │ │ Calculator   │ │ Wall Config  │ │ Learning    │
│ Available    │ │ Available    │ │ Available    │ │ Available    │ │ Available   │
│             │ │             │ │             │ │             │ │             │
│ Site Dev...  │ │ Stairway...  │ │ Flooring...  │ │ Unified...   │ │ BP 344...   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

Filter behavior:
- Default: "All" — shows both PI and LI modules
- "Parametric" — shows only PI modules (existing behavior)
- "Learning" — shows only LI modules
- Filter state is not persisted in URL for MVP (can add `?mode=learning` later)

## Category Drill-Down with LI

When `DASHBOARD_VISIBLE_IDS` is empty (full category drill-down mode), LI modules appear in their respective categories alongside PI modules:

```
3D Interactive Lab > Accessibility (BP 344)
[All (12)] [Parametric (8)] [Learning (4)]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Parametric   │ │ Parametric   │ │ Learning    │ │ Learning    │
│ Ramp Config  │ │ Toilet Dims  │ │ Ramp Layers  │ │ Toilet Room │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Coverage View

The Coverage View is a strategic competitive asset. It shows learners (and admins) exactly what's available.

### Learner-Facing Coverage View

```
3D Lab Coverage
Filter: [BP 344 ▼] [All Topics] [P0 Only] [Has 3D]

BP 344 / Accessibility Law — 25 P0 topics, 4 have 3D modules

┌─ Ramps ──────────────────────────────────────────────┐
│ ✅ 3D Module Available                                │
│ 🔍 Focus  ⚖ Compare  🔎 Hunt  📝 Drill  📋 Source     │
│ [Launch Module]                                       │
├─ Toilets and Baths ───────────────────────────────────┤
│ ✅ 3D Module Available                                │
│ 🔍 Focus  🔎 Hunt  📝 Drill  📋 Source                │
│ [Launch Module]                                       │
├─ Wheelchair Clearances ──────────────────────────────┤
│ ✅ 3D Module Available                                │
│ 🔍 Focus  📋 Source                                   │
│ [Launch Module]                                       │
├─ Accessible Parking ─────────────────────────────────┤
│ ⬜ 3D Module Coming Soon                              │
│ 📋 Source Cards: 3/5 verified                        │
│ [Preview Source Cards]                                │
└──────────────────────────────────────────────────────┘
```

### Admin-Facing Coverage View (at `/admin` or developer surface)

Additional internal statuses visible:
- Source-blocked (needs source verification)
- Module-hidden (exists but not on dashboard)
- Preset-missing (module exists but needs presets)
- Quiz-link-missing
- SME-review-needed

## Discovery from Quiz / Wiki

### Quiz → LI Discovery

When a student answers a quiz question about a topic that has an LI module:
- Correct answer: "Well done! Explore this topic in 3D: [View in 3D Lab →]"
- Wrong answer: Repair Path triggers LI module with relevant scene state

### Wiki → LI Discovery

Wiki articles that have linked LI modules show:
- "Explore in 3D" button/card
- Preview of the 3D scene (static thumbnail or GIF)
- Link to specific sub-mode (e.g., "Compare BP 220 vs PD 957")

## Discovery from Search

(Not in MVP scope, but planned)
- 3D Lab modules are indexed in SlateCamp search
- Search results show "3D Lab" badge for modules
- Click navigates directly to LI module

## Feature Flag Strategy for Discovery

```typescript
const showModeFilter = LI_MODE_ENABLED && dashboardModules?.some(m => m.mode === 'LI')
const showCoverageView = LI_MODE_ENABLED && view === 'coverage'
```

Filters and coverage view only appear when:
1. Feature flag is enabled
2. At least one LI module exists in the registry

### Gradual Rollout

| Phase | Flag State | Visible To |
|-------|-----------|------------|
| Development | ON | Devs only |
| Staging | ON | Internal testers |
| Production (soft launch) | ON, 3 modules | All entitled users |
| Production (full) | ON, 7+ modules | All entitled users |

## Empty States

### No LI Modules Yet
- Mode filter chips hidden
- Dashboard shows only PI modules (current behavior)
- No "Learning" section or empty state needed

### Filter Shows No Results
```
[All (5)] [Parametric (5)] [Learning (0)]

No learning modules available yet.
Check back soon for interactive 3D learning experiences.
```

### Coverage View — No Modules for a Code Family
```
GBC / Green Building Code
⬜ No 3D modules yet for this code family.
📋 Source cards in progress: 3/14 verified.
```
