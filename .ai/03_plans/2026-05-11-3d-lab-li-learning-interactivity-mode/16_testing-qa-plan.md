# 16 — Testing & QA Plan

## Existing Test Setup Audit

### Unit / Component Tests
| Framework | Location | Pattern |
|-----------|----------|---------|
| Vitest 4.1.5 | `src/features/3d-lab/**/*.test.ts` | Co-located with source |
| Vitest config | `vitest.config.ts` | DOM environment |

15 existing 3D Lab test files covering:
- Module configs (stairway geometry, stairway computation, stairway click targets, bp344 ramp)
- Config paths and registry
- Utilities (isometric-camera-fit, nbcpCalculator, camera-presets)
- Stores (useViewportShellStore, useDevControlsStore)
- Components (onboarding state)
- Constants (nbcp, scene-colors)

### E2E Tests
| Framework | Location | Tests |
|-----------|----------|-------|
| Playwright 1.59.1 | `e2e/authenticated-demo-3d-lab.spec.ts` | 3 tests |
| Playwright config | `playwright.config.ts` | Standard config |

E2E test coverage:
- Can reach `/dashboard/3d-lab`
- Can reach stairway-configurator module
- Invalid slug shows not-found

### Performance Tests
Scripts in `.ai/00_performance/scripts/`:
- `3d-lab-built-auth-repeat.mjs`
- `3d-lab-gate-check.mjs`
- `3d-lab-layout-controls-audit.mjs`
- `3d-lab-chunk-profile.mjs`

### Storybook
- Storybook 8.6.17 configured
- Existing stories: `LabBrowser.stories.tsx`, `ModuleCard.stories.tsx`, `CategoryGrid.stories.tsx`

## Recommended Automated Tests

### Unit Tests

| Test | File | What It Tests |
|------|------|---------------|
| LearningLayerToggles renders all layers | `components/learning/LearningLayerToggles.test.ts` | Component renders correct number of checkboxes |
| LearningLayerToggles calls toggle on click | Same | Checkbox click updates store |
| LearningLayerToggles respects defaultVisible | Same | Checkbox checked state matches config |
| LearningSceneRenderer renders visible layers | `components/learning/LearningSceneRenderer.test.ts` | Mesh renders when layer visible |
| LearningSceneRenderer hides invisible layers | Same | Mesh doesn't render when layer hidden |
| createModuleStore with layer defaults | `stores/createModuleStore.test.ts` (extend existing) | Store initializes with layer visibility booleans |
| ModuleRegistryEntry with mode field | `config/registry/index.test.ts` (extend existing) | New field is optional, defaults to PI |
| LearningSceneConfig type validation | `config/modules/[category]/[li-module-id].test.ts` | Config matches expected shape |

### Component Tests

| Test | What It Tests |
|------|---------------|
| ModuleCard with LI module | Renders "Learning" badge instead of template type badge |
| ModuleCard with PI module | Renders existing template type badge (unchanged) |
| LabBrowser with LI modules | Shows mode filter chips |
| LabBrowser mode filter "Learning" | Filters to only LI modules |
| LabBrowser mode filter "All" | Shows all modules |
| useTemplateContent with 'learning' | Returns correct shell config and content |

### Integration Tests

| Test | What It Tests |
|------|---------------|
| LI module page renders | Full integration: route → ModuleViewer → ViewportShell → Canvas |
| Layer toggle updates viewport | Click toggle → mesh disappears in Canvas |
| LI module back navigation | Back button returns to dashboard with correct filter state |
| PI module still works after LI addition | Visit stairway-configurator → renders correctly |
| LI module deep link | Direct URL navigation loads LI module |

### E2E Tests (Playwright)

Extend `e2e/authenticated-demo-3d-lab.spec.ts`:

| Test | Description |
|------|-------------|
| "can reach LI module from dashboard" | Navigate dashboard → click LI card → LI module loads |
| "LI module shows layer toggles" | Verify layer toggle checkboxes visible |
| "can toggle a layer on/off" | Click layer checkbox → verify visual change |
| "LI module has correct layout" | Verify only right sidebar, no left sidebar |
| "PI modules unchanged after LI addition" | Visit PI module → verify dual sidebars |
| "dashboard shows PI and LI badges" | Verify both badge types on cards |
| "mode filter chips work" | Click filter → verify filtered cards |

## Visual Regression Testing

Not currently set up in the project. For LI:
- Manual comparison screenshots of PI modules before/after LI addition
- Manual comparison of LI layout vs. mockups
- Future: Consider Percy or Chromatic if visual regression becomes a priority

## Accessibility Tests

| Test | Tool/Method |
|------|------------|
| Layer toggles keyboard-navigable | Manual: Tab through toggles, Space to toggle |
| Focus indicators visible | Manual: Tab navigation, verify focus ring |
| Screen reader announces toggle state | Manual: VoiceOver/NVDA on toggle |
| Color contrast on "Learning" badge | Automated: axe DevTools or Lighthouse |
| Canvas has fallback for no-WebGL | Manual: Disable WebGL, verify fallback message |

## Performance Tests

| Test | Method |
|------|--------|
| LI module initial load time | Browser DevTools Performance tab |
| Layer toggle latency | Manual: measure time from click to visual change |
| Frame rate during orbit | FPS counter; should maintain 60fps |
| Bundle size comparison | `bun run build` + analyze bundle before/after |
| Memory usage | Chrome DevTools Memory tab; check for leaks on repeated toggle |

## Manual QA Checklist

### PI Regression Checklist
- [ ] Dashboard loads with current modules
- [ ] All PI module cards show correct template badges
- [ ] Clicking PI card navigates to module
- [ ] PI module viewport loads correctly
- [ ] PI dual sidebars render
- [ ] PI parametric controls work
- [ ] PI compliance panels work
- [ ] PI camera controls work
- [ ] PI presets work
- [ ] PI back button returns to dashboard
- [ ] PI deep links work
- [ ] PI entitlement gate works
- [ ] PI loading states show
- [ ] PI error states show
- [ ] All 5 current dashboard modules work

### LI Checklist
- [ ] LI module card shows "Learning" badge on dashboard
- [ ] Dashboard filter chips appear (if LI modules exist)
- [ ] Filter "Learning" shows only LI modules
- [ ] Filter "All" shows both PI and LI
- [ ] Clicking LI card navigates to LI module
- [ ] LI module page loads without errors
- [ ] LI layout: viewport + right sidebar only (no left sidebar)
- [ ] LI right sidebar shows "Layers" header
- [ ] LI layer toggles render for each configured layer
- [ ] Checkbox state matches `defaultVisible` from config
- [ ] Toggling checkbox shows/hides corresponding mesh
- [ ] "Show All" button sets all layers visible (if implemented)
- [ ] Camera orbit/pan/zoom works in LI viewport
- [ ] Camera reset button works
- [ ] Grid toggle works (G key or toolbar)
- [ ] Dimensions toggle works (D key)
- [ ] X-ray toggle works
- [ ] LayersPanel overlay works (L key)
- [ ] Back button returns to dashboard
- [ ] Deep link to LI module works
- [ ] LI module handles invalid layer gracefully
- [ ] LI module loading state shows
- [ ] LI module error state shows

### Dashboard Checklist
- [ ] Mode filter chips show correct counts
- [ ] Filter persistence: navigating to module and back preserves filter
- [ ] No filter: shows all modules
- [ ] PI badge on PI cards matches current appearance
- [ ] LI badge on LI cards is visually distinct
- [ ] Card layout is consistent between PI and LI cards

### Route / Deep Link Checklist
- [ ] `/dashboard/3d-lab` loads dashboard
- [ ] `/dashboard/3d-lab/stairway-configurator` loads PI module
- [ ] `/dashboard/3d-lab/[li-module-id]` loads LI module
- [ ] Invalid module ID shows 404 or error
- [ ] Browser back/forward works correctly

### 3D Viewport Checklist
- [ ] Single Canvas renders (no duplicate WebGL contexts)
- [ ] OrbitControls work in LI
- [ ] Pan works in LI
- [ ] Zoom works in LI
- [ ] Adaptive DPR works (check on mobile viewport)
- [ ] WebGL fallback works (test with disabled WebGL)

### Layer Toggle Checklist
- [ ] Each layer toggle responds to click
- [ ] Toggle state is visually clear (checked/unchecked)
- [ ] Toggling off removes mesh from scene
- [ ] Toggling on adds mesh back to scene
- [ ] Toggling multiple layers works independently
- [ ] No z-fighting between layers
- [ ] Layers render in correct position/scale
- [ ] Layer colors are visually distinguishable

### Responsive Checklist
- [ ] Desktop (1920px): viewport + right sidebar
- [ ] Tablet (1024px): viewport + right sidebar (collapsible)
- [ ] Mobile (375px): canvas + bottom sheet with "Layers" tab
- [ ] Touch orbit/zoom works on mobile
- [ ] Bottom sheet toggles work on mobile

### Error State Checklist
- [ ] Invalid module ID shows not-found
- [ ] Failed config import shows error state
- [ ] WebGL unavailable shows fallback
- [ ] Slow scene load shows loading message
- [ ] All layers hidden shows appropriate state

## Accessibility Tests (Automated + Manual)

| Test | Method | Pass Criteria |
|------|--------|---------------|
| axe DevTools scan on LI module | Automated | 0 critical violations |
| Lighthouse accessibility score | Automated | ≥90 |
| Keyboard navigation through toggles | Manual | All toggles reachable and operable |
| Screen reader toggle announcement | Manual | "Checked" / "Not checked" announced on toggle |
| Color contrast on Learning badge | Automated | ≥4.5:1 contrast ratio |
| Focus order logical | Manual | Header → Sidebar → Canvas |
