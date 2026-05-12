# 22 — Comprehensive Blast Radius & Feasibility Study

## Purpose

Codebase-specific blast radius analysis for adding LI (Learning Interactivity) mode with hotspot-centered architecture. Based on actual source code analysis of `useTemplateContent`, `GeometrySwitch`, `HotspotQuestion`, `HotspotCard`, `DOMOverlayLayer`, `useOverlayStore`, and all template type switch statements.

## Findings Summary

### Critical: HotspotQuestion Integration Gap

`HotspotQuestion` is a **PLANNED scaffold with zero consumers**. It has:
- No imports anywhere in the codebase (only defined in its own file)
- No useOverlayStore integration
- No useWorldToScreen integration
- No barrel export
- Zero tests
- Pure local state with `useState`

**To wire it into the LI hotspot system**, three things must change:

| Change | File | Impact |
|--------|------|--------|
| Extend `HotspotPayload` with quiz fields | `stores/useOverlayStore.ts` | Backward-compatible — optional fields on existing interface |
| Modify `HotspotCard` to render `<HotspotQuestion>` when quiz data present | `components/overlays/HotspotCard.tsx` | Minimal — add conditional rendering |
| Wire answer handling | `useOverlayStore.ts` or new store method | New: `submitHotspotAnswer(id, selectedId)` |

### Confirmed: GeometryInstruction System Fully Supports LI

All 9 `GeometryType` values are implemented. Key confirmations:

| LI Requirement | Status | Evidence |
|---------------|--------|----------|
| Multiple independent meshes | ✅ Core pattern | `ParametricSceneRenderer` maps `GeometryInstruction[]` → multiple `<InstructionMesh>` |
| Transparent/ghost meshes | ✅ Native | Set `opacity: 0.3` on `GeometryInstruction`; auto-enables `transparent` |
| Edges/Outlines (drei) | ✅ Available, compatible | `ArchMass.tsx` uses `<Edges>` + `<Outlines>`; works with any geometry from GeometrySwitch |
| Comparison overlay (fade non-selected) | ✅ Proven | `ExplodedAssemblyScene` uses `opacity: 0.2` for non-selected parts |
| Instanced meshes for bulk | ✅ Available | `InstancedMesh.tsx` using drei `<Instances>`
| Extruded profiles | ✅ Implemented | Uses `THREE.Shape` + `THREE.ExtrudeGeometry` |

**Performance caveat**: Each `InstructionMesh` is a draw call. LI modules with 50+ individual meshes should use `InstancedMesh` for repeated elements. Typical LI module (8 hotspots × ~3 meshes per layer) ≈ 24 draw calls — well within budget.

### Confirmed: Adding 'learning' TemplateType Has Controlled Blast Radius

**Files that MUST change** (compile-time breaks):

| # | File | Change | Risk |
|---|------|--------|------|
| 1 | `types/templates.ts` | Add `'learning'` to `TemplateType` union (line 26) | **Medium** — forces all switch/Record to handle new variant |
| 2 | `types/templates.ts` | Add `'learning'` to `TEMPLATE_SHELL_DEFAULTS` Record | **Compile error if missing** — Record exhaustiveness |
| 3 | `components/ModuleCard.tsx` | Add `'learning'` to `TEMPLATE_META` Record | **Compile error if missing** — Record exhaustiveness |

**Files that SHOULD change** (functional but won't break):

| # | File | Change | Risk |
|---|------|--------|------|
| 4 | `types/templates.ts` | Add `LearningSceneConfig` interface + `ModuleConfig` union variant | Low |
| 5 | `hooks/useTemplateContent.tsx` | Add `case 'learning'` to switch | **Medium** — central dispatch; bug here breaks LI |
| 6 | `components/LabViewport.tsx` | Add `case 'learning'` to `TemplateModuleWrapper` | Low — default returns null |
| 7 | `components/wiki/widgets/Lab3DWidget.tsx` | Add `case 'learning'` (optional) | Low — default shows "Unsupported" |

**Files NOT touched**:

| File | Reason |
|------|--------|
| `shell/LabViewportFrame.tsx` | Canvas host — shared, no LI changes |
| `shell/ViewportShell.tsx` | Config-driven layout — `shellConfig: { leftSidebar: false }` handles LI |
| `components/CanvasWrapper.tsx` | Scene config — shared, no LI changes |
| `components/ModuleViewer.tsx` | Handles all template types — no changes |
| `components/shell/*` (most) | Toolbar, camera, header — all shared |
| `app/dashboard/3d-lab/*` | Route pages — no route changes needed |
| `config/registry/index.ts` | Registry — LI entries added to category files only |
| All PI module configs (187 files) | Zero changes |
| All PI scene renderers | Zero changes |

### Three Switch Statements — Blast Radius

| # | File | Cases | Default | Impact of adding 'learning' |
|---|------|-------|---------|---------------------------|
| 1 | `useTemplateContent.tsx:202` | All 7 | `return null` | Falls through to null — no scene renders. **Must add case.** |
| 2 | `LabViewport.tsx:102` | All 7 | `return null` | Falls through to null — no scene renders. **Should add case.** |
| 3 | `Lab3DWidget.tsx:110` | 5 of 7 | "Unsupported" message | Falls through to unsupported message. **Optional — Wiki widget not MVP.** |

None of these use TypeScript `never` exhaustiveness checks. Adding `'learning'` won't cause compile errors in switches — only in the two `Record<TemplateType, ...>` maps.

## Component Dependency Graph

```
LearningSceneRenderer (NEW ~80 lines)
├── GeometryElement (existing) — renders geometry from GeometryInstruction
├── InstructionMesh (existing) — full mesh with material + transforms
├── HotspotAnnotation (existing) — emits to useOverlayStore
├── DOMOverlayLayer (existing) — projects 3D → 2D
├── HotspotCard (existing, enhanced) — info modal
│   └── HotspotQuestion (existing, wired) — quiz modal
└── CanvasWrapper (existing) — R3F portal wrapper

useOverlayStore (existing, enhanced)
├── upsertItem — unchanged
├── openHotspot — unchanged
├── closeHotspot — unchanged
├── closeAllHotspots — unchanged
└── submitHotspotAnswer (NEW) — records quiz answer

HotspotPayload (existing, extended)
├── title: string — unchanged
├── body: string — unchanged
├── codeRef?: string — unchanged
├── isOpen: boolean — unchanged
├── hotspotType?: 'info' | 'quiz' | 'comparison' (NEW)
├── quizData?: { questionText, options, correctOptionId, codeCitation } (NEW)
└── comparisonData?: { codes: Array<{codeLabel, requirement, sourceCardId}> } (NEW)
```

## Files Created (Phase 1 MVP)

| # | File | Lines (est.) | Purpose |
|---|------|-------------|---------|
| 1 | `components/learning/LearningSceneRenderer.tsx` | ~80 | Renders geometry + HotspotAnnotations |
| 2 | `components/learning/LearningHotspotList.tsx` | ~60 | Right sidebar hotspot navigation panel |
| 3 | `config/modules/02-accessibility/bp344-ramp-hotspots.ts` | ~120 | BP344 ramp config: 8 hotspots, geometry, camera |
| 4 | `config/modules/02-accessibility/bp344-toilet-hotspots.ts` | ~120 | BP344 toilet config: 8 hotspots |
| 5 | `config/modules/01-building-code/egress-stair-hotspots.ts` | ~120 | Egress stair config: 8 hotspots |

**Total new code**: ~500 lines (configs are data, not logic)

## Files Modified (Phase 1 MVP)

| # | File | Lines Changed (est.) | Change |
|---|------|---------------------|--------|
| 1 | `types/templates.ts` | +60 | TemplateType union, LearningSceneConfig, LearningHotspot, TEMPLATE_SHELL_DEFAULTS, ModuleConfig |
| 2 | `hooks/useTemplateContent.tsx` | +30 | `case 'learning'` + lazy import + defaults |
| 3 | `components/ModuleCard.tsx` | +5 | TEMPLATE_META entry |
| 4 | `components/LabBrowser.tsx` | +15 | Mode filter chips |
| 5 | `components/overlays/HotspotCard.tsx` | +25 | Conditional HotspotQuestion rendering |
| 6 | `stores/useOverlayStore.ts` | +15 | Extended HotspotPayload, submitHotspotAnswer |
| 7 | `components/LabViewport.tsx` | +5 | `case 'learning'` in TemplateModuleWrapper |
| 8 | `config/registry/cat-02.ts` | +10 | LI module entries |
| 9 | `config/registry/cat-01.ts` | +5 | LI module entry |
| 10 | `config/dashboard-visibility.ts` | +3 | LI module IDs |

**Total modified**: ~173 lines across 10 files

## Hotspot Card Enhancement — Detailed Impact

### Current HotspotCard Structure

```tsx
// HotspotCard.tsx — current state
export const HotspotCard = ({ id, style, payload }: HotspotCardProps) => {
  return (
    <div style={style}>
      <button onClick={toggle}> {/* trigger dot */} </button>
      {payload.isOpen && (
        <div> {/* hardcoded info card */}
          <span>{payload.title}</span>
          <p>{payload.body}</p>
          {payload.codeRef && <span>{payload.codeRef}</span>}
        </div>
      )}
    </div>
  )
}
```

### Required Enhancement

```tsx
// HotspotCard.tsx — enhanced for LI
export const HotspotCard = ({ id, style, payload }: HotspotCardProps) => {
  const [quizState, setQuizState] = useState<'info' | 'quiz' | 'result'>('info')

  return (
    <div style={style}>
      <button onClick={toggle}> {/* trigger dot — color based on hotspotType */} </button>
      {payload.isOpen && (
        <div>
          {payload.hotspotType === 'quiz' && quizState === 'info' && (
            <>
              <span>{payload.title}</span>
              <p>{payload.body}</p>
              <button onClick={() => setQuizState('quiz')}>Test Yourself</button>
            </>
          )}
          {payload.hotspotType === 'quiz' && quizState === 'quiz' && payload.quizData && (
            <HotspotQuestion
              questionText={payload.quizData.questionText}
              options={payload.quizData.options}
              correctOptionId={payload.quizData.correctOptionId}
              codeCitation={payload.quizData.codeCitation}
              onAnswer={(selectedId, isCorrect) => {
                // Record answer
                setQuizState('result')
              }}
            />
          )}
          {payload.hotspotType === 'comparison' && payload.comparisonData && (
            <ComparisonTable codes={payload.comparisonData.codes} />
          )}
          {(!payload.hotspotType || payload.hotspotType === 'info') && (
            <>
              <span>{payload.title}</span>
              <p>{payload.body}</p>
              {payload.codeRef && <span>{payload.codeRef}</span>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

**Risk assessment**: This change is backward-compatible. Existing hotspots (no `hotspotType` field) render identically to current behavior. New LI hotspots with `hotspotType: 'quiz'` get the enhanced rendering.

## Overlay System — Hotspot + Layer Toggle Coexistence

### Current Architecture

```
LabViewportFrame (R3F Canvas)
├── <Canvas> (full viewport)
├── <SceneTunnel.Out> (ported scene content)
├── <DOMOverlayLayer> (positioned absolutely over Canvas)
│   └── Projects 3D positions → 2D screen coords
│   └── Renders: HotspotCard, LabelOverlay, ViolationBadge, DimensionLabel
└── Children div (pointer-events: none)
```

### LI Coexistence

```
LabViewportFrame (R3F Canvas)
├── <Canvas>
├── <SceneTunnel.Out>
│   └── LearningSceneRenderer
│       ├── InstructionMesh (layer geometry) ← toggles visibility
│       └── HotspotAnnotation (emits to useOverlayStore) ← click targets
├── <DOMOverlayLayer>
│   ├── HotspotCard (info) ← positioned at hotspot 3D coords
│   ├── HotspotCard (quiz) ← positioned at quiz hotspot 3D coords
│   └── HotspotCard (comparison) ← positioned at comparison hotspot 3D coords
└── Children div (right sidebar overlay)
```

**No z-index conflict**: HotspotCard has `zIndex: 50` (inside tooltip). Sidebar is normal DOM flow. Canvas is behind DOM overlay. Hotspot toggles don't affect the overlay layer.

**Layer toggle + hotspot coexistence**: When a layer is hidden, the hotspot attached to that layer should also hide. This requires the hotspot to check layer visibility before emitting to the store. Implementation: pass `isActive` based on layer state to `HotspotAnnotation`.

## createModuleStore — LI State Shape

```typescript
// Defaults for LI module store
const defaults: Record<string, any> = {
  // Layer visibility (if layers are present)
  'layer:ramp-surface': true,
  'layer:handrail': true,
  // ...
  // Hotspot state
  'hotspot:explored': {},  // { [hotspotId]: boolean }
  'hotspot:activeQuiz': null,  // currently active quiz hotspot ID
  // Quiz results
  'quiz:results': {},  // { [hotspotId]: { correct: boolean, selectedOptionId: string } }
}
```

Lightweight. No sub-mode state. No adaptive panel logic.

## Performance Impact — Detailed

| Concern | Impact | Mitigation |
|---------|--------|------------|
| Adding `'learning'` to TemplateType | **None** — type-level change only | N/A |
| `case 'learning'` in useTemplateContent | **Negligible** — one extra switch case | N/A |
| 8-10 HotspotAnnotations per scene | **Low** — each is a `useEffect` + store `upsertItem` call | Already proven in existing scenes |
| DOMOverlayLayer projecting 8-10 positions | **Low** — vector math, no DOM until hotspot is open | Only active during camera movement |
| Multiple InstructionMesh instances | **Low** — 20-30 draw calls typical for LI module | Well within budget; use InstancedMesh for repeats |
| HotspotCard with embedded HotspotQuestion | **Low** — renders only when hotspot is open | Conditional rendering |

**Verdict**: LI has negligible performance impact. Hotspot-centered architecture is lighter than parametric (no geometry regeneration on slider changes).

## Existing Tests That Must Continue Passing

| Test File | Concern |
|-----------|---------|
| `config/registry/index.test.ts` | Must pass with LI entries added |
| `config/module-paths.test.ts` | Must resolve LI module paths |
| `components/onboarding/state.test.ts` | LI onboarding overlay state |
| `stores/useViewportShellStore.test.ts` | ViewportShell unchanged |
| `utils/isometric-camera-fit.test.ts` | Camera utilities unchanged |
| `utils/camera-presets.test.ts` | Camera presets unchanged |
| `e2e/authenticated-demo-3d-lab.spec.ts` | Must still reach PI modules |
| All 15 existing PI test files | Must pass unchanged |

## Regression Risk Matrix

| Area | Files | Risk | Why |
|------|-------|------|-----|
| TemplateType union | `types/templates.ts` | **Medium** | Adding variant forces Record updates; switches have defaults so won't break at runtime |
| TEMPLATE_SHELL_DEFAULTS | `types/templates.ts` | **Low** | Compile error if missing — caught before runtime |
| TEMPLATE_META | `ModuleCard.tsx` | **Low** | Compile error if missing — caught before runtime |
| useTemplateContent switch | `useTemplateContent.tsx` | **Medium** | Central dispatch; missing case = LI doesn't render (but PI unaffected) |
| HotspotPayload extension | `useOverlayStore.ts` | **Low** | Backward-compatible — optional fields |
| HotspotCard enhancement | `HotspotCard.tsx` | **Low** | Existing hotspots unchanged; new types get enhanced rendering |
| LabViewport switch | `LabViewport.tsx` | **Low** | Default returns null — no scene renders for unknown types |
| PI module configs | 187 files | **None** | Zero changes |
| PI scene renderers | 7+ files | **None** | Zero changes |
| ViewportShell | 1 file | **None** | Config-driven — LI passes different shellConfig |

## Implementation Safety Checklist

Before any LI code is committed:
- [ ] `bun run type-check` passes with `'learning'` added to TemplateType
- [ ] All 15 existing PI tests pass
- [ ] `bun run lint` passes
- [ ] PI module dashboard cards render identically
- [ ] PI module viewport renders identically (spot-check stairway-configurator, site-development-controls)
- [ ] HotspotCard renders existing hotspots unchanged (spot-check any scene with hotspots)
- [ ] FEATURE FLAG gates all LI code paths (`NEXT_PUBLIC_ENABLE_LI_MODE !== 'true'` → LI path returns null)
