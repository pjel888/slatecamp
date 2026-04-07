<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# 3d-lab

## Purpose

React Three Fiber (R3F) spatial learning components for interactive 3D module exploration. Coordinates camera, hotspots, info panels, quiz modes, and guided sequences. Target: 60 FPS performance. All components use `useLabStore` (Zustand) for state management (active hotspot, panel mode, explore mode, quiz results).

## Key Files

| File | Description |
|------|-------------|
| `LabOrchestrator.tsx` | Single entry point composing all 3D Lab components. Routes config → LabViewer, HotspotGroup, InfoPanel, QuizMode, ExitSummary. |
| `LabViewer.tsx` | Container for LabCanvas + camera controls + module-specific content. |
| `LabCanvas.tsx` | R3F Canvas setup: OrbitControls, lighting (ambient + directional), contact shadows, environment. Configurable camera position & orbit. |
| `HotspotGroup.tsx` | Renders Html-overlaid hotspot dots using @react-three/drei. Filters visible hotspots by guided vs. free explore mode. |
| `HotspotDot.tsx` | Individual hotspot visual: 3D position → 2D screen dot, labels, styling by hotspot type (exam-critical, guidance, etc.). |
| `InfoPanel.tsx` | Right-side info drawer: displays selected hotspot details (title, body, references). Integrates with panelMode store state. |
| `GuidedSequencer.tsx` | Manages sequence order in guided explore mode. Next/prev buttons, progress indicator, prevents skipping hotspots. |
| `FreeExploreToggle.tsx` | Button to switch between guided and free explore modes. Updates exploreMode store state. |
| `ParameterPanel.tsx` | Editable parameter controls (sliders, toggles) for dimensional configurations. Syncs to store. |
| `PresetViewButtons.tsx` | Camera preset shortcuts (plan/section/3d views). Updates camera position on click. |
| `ToolPalette.tsx` | Tool selection: cross-section, exploded view, measurement. Manages active tool state. |
| `ExplodedView.tsx` | Animates model parts outward for anatomical visualization. Respects prefers-reduced-motion. |
| `CrossSectionPlane.tsx` | Plane-cutting visualization. Responds to ParameterPanel inputs. |
| `DisorientationDetector.tsx` | Monitors camera spin/rotation speed. Shows "You are disoriented" warning if exceeds threshold. |
| `LabTopBar.tsx` | Header bar: back button, module title, help icon, toolbar. |
| `ModuleContextCard.tsx` | Shows learning objective, code reference, estimated time. Appears pre-onboarding. |
| `OnboardingFlow.tsx` | First-time user walkthrough. Shows purpose, hotspot tutorial, controls explainer. |
| `LabLoadingState.tsx` | Skeleton/placeholder while model GLB loads. Shows estimated KB + timing. |
| `LabEmptyState.tsx` | Shown when no module config provided or invalid slug. |
| `LabErrorState.tsx` | GLB model failed to load, Supabase fetch failed, etc. Displays error message + retry. |
| `ComplianceStatus.tsx` | Sidebar showing pass/fail status for exam-critical hotspots. |
| `ExitSummary.tsx` | Quiz results screen: score, breakdown by hotspot category, "review" vs "master" tags. |
| `QuizMode.tsx` | Switches to quiz state: hotspots become multiple-choice questions, tracks correctness. |
| `QuestionPanel.tsx` | Question renderer for quiz mode: MCQ display, option selection, rationale reveal. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `modules/` | Feature-complete 3D learning modules. Each has a `{module}.config.ts` (ModuleConfig), `{Module}Model.tsx` (geometry), `{Module}Hotspots.tsx` (hotspot definitions), optional `{Module}Controls.tsx`. |
| `modules/AccessibleToilet/` | BP 344 §6.3 accessible toilet room: door clear width, turning circle, grab bar placement. Includes model, hotspots, toilet.config.ts. |
| `modules/StairwayConfigurator/` | Building code stairway design: rise, run, handrail height, guard requirements. Parametric model + StairwayControls.tsx. |
| `modules/registry.ts` | Module loader registry. Maps slug → lazy-loaded ModuleConfig. Add entries here as modules are migrated. |

## For AI Agents

### Working In This Directory

1. **Read ModuleConfig type first.** Check `@/types/3d-lab` for the shape of module configurations (hotspots, camera, presetViews, etc.).

2. **Understand useLabStore.** All state mutations (openHotspot, closePanel, selectOption, etc.) flow through `@/stores/useLabStore`. Read the store hooks used in LabOrchestrator to understand the state contract.

3. **R3F patterns:**
   - Use `Html` from @react-three/drei to overlay 2D (hotspot dots, labels) on 3D scene.
   - Camera positioning: store target and position separately; use `useThree()` if direct Three.js access needed.
   - Keep materials/geometries in separate files for reusability (e.g., `toilet.model.tsx`).
   - All Canvas children are suspended; wrap with Suspense boundary.

4. **Performance targets:**
   - Aim for 60 FPS. Monitor draw calls, geometry complexity.
   - Lazy-load GLB models (use Suspense + LabLoadingState).
   - Debounce camera/parameter changes to avoid excessive re-renders.

5. **Hotspot design:**
   - Each hotspot has `id`, `position` (3D coords), `type` (exam-critical, guidance, etc.), `sequenceOrder`.
   - In guided mode, only show hotspots up to currentSequenceIndex + 1.
   - In free explore, show all (up to MAX_PER_CATEGORY per category).

6. **No custom styling in R3F components.** Use Slatecamp tokens via Tailwind classes on Html overlays. Keep Three.js materials simple and purposeful.

### Common Patterns

**Loading a module config:**
```tsx
const { config } = LabOrchestrator.props
// config contains: slug, title, modelUrl, hotspots[], presetViews, cameraDefaults
```

**Opening a hotspot from user click:**
```tsx
const openHotspot = useLabStore((s) => s.openHotspot)
const handleHotspotClick = (id: string) => {
  openHotspot(id)
  // Store updates activeHotspotId → InfoPanel re-renders
}
```

**Respecting prefers-reduced-motion in ExplodedView:**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const duration = prefersReducedMotion ? 0 : 300
```

**Camera preset view:**
```tsx
const cameraTarget = config.presetViews.plan // [0, 6, 0.001]
// Set camera position to preset; OrbitControls.target to center
```

**Quiz mode state machine:**
```tsx
const quizModeActive = useLabStore((s) => s.quizModeActive)
const selectedOptionId = useLabStore((s) => s.selectedOptionId)
if (quizModeActive) {
  // Show QuestionPanel instead of InfoPanel
  // Track selectOption calls → store checks correctness
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/stores/useLabStore` | Zustand store: activeHotspotId, panelMode, exploreMode, quizResults, action creators |
| `@/types/3d-lab` | ModuleConfig, HotspotData, LabQuestion, QuizResult types |
| `@/components/ui/*` | Button, Card, Dialog (used in InfoPanel, ExitSummary) |
| `@/components/shared` | NavigationProgress, info tooltips (InfoTooltip) |
| `@/lib/lab-analytics` | labEvents() for telemetry tracking |
| `@/hooks/useLabTelemetry` | Telemetry hook for quiz, exploration actions |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@react-three/fiber** | R3F Canvas abstraction | ^9.5.0 |
| **@react-three/drei** | Html, OrbitControls, ContactShadows, Environment | ^10.7.7 |
| **three** | 3D graphics engine, Material/Geometry base | ^0.183.2 |
| **zustand** | useLabStore state management | ^5.0.12 |
| **react** | Hooks (useState, useCallback, useMemo) | ^19.2.4 |
| **next** | useRouter, usePathname for navigation | 16.1.6 |

<!-- MANUAL: -->
