# 3D Lab Regression Checklist

**Purpose:** Manual verification after each implementation phase.
**Created:** 2026-04-08

---

## Template-Based Modules

### Parametric Scene
- [ ] Sliders drive geometry changes in real-time
- [ ] Camera position matches config
- [ ] Violation indicators appear when rules are broken
- [ ] Compliance panel shows/hides based on multi-law detection
- [ ] Presets apply correctly

### Exploded Assembly
- [ ] Explode slider separates parts with smooth lerp animation
- [ ] Clicking a part highlights it and fades others
- [ ] Part tooltip shows label, description, code citation
- [ ] Comparison mode renders side-by-side groups
- [ ] Animation settles (no infinite micro-corrections)

### Floor Plan Walkthrough
- [ ] Rooms render as colored planes with labels
- [ ] Paths render as lines with distance labels
- [ ] Violation annotations appear when rules are broken
- [ ] Dead-end zones highlight in red
- [ ] Fixtures (exits, sprinklers) render correctly
- [ ] Sprinkler toggle works via parameter

### Cutaway Section
- [ ] Cut slider reveals/hides layers with fade animation
- [ ] Cut plane indicator renders at correct position
- [ ] Layer annotations show material and citation info
- [ ] Active annotation highlights layer
- [ ] Layers fully hidden when cut position passes them

### Animated Sequence
- [ ] Steps appear sequentially via currentStep parameter
- [ ] New step geometries fade in
- [ ] Labels render via Html overlay
- [ ] Previous steps remain visible

### Calculator Template (4 tools)
- [ ] Flooring: room dimensions → 3D tile preview
- [ ] Paint: room dimensions → 3D wall preview
- [ ] Drywall: wall dimensions → 3D partition preview
- [ ] CHB: wall dimensions → 3D block wall preview
- [ ] Camera preset switching works (perspective/ortho)
- [ ] Input version changes trigger scene re-render
- [ ] Result panel updates in real-time
- [ ] Net/Buy toggle switches result display

### Wall Configurator
- [ ] Config panel changes wall parameters
- [ ] BOM panel shows material calculations
- [ ] Camera position is front-facing

## Standalone Scenes

### NBCP Envelope
- [ ] Camera auto-adjusts based on lot size
- [ ] Orbit controls work (capped polar angle)
- [ ] Control panel updates scene geometry
- [ ] Telemetry panel displays data

### FAR Playground
- [ ] Zoning parameter controls update geometry
- [ ] Violations display when rules broken
- [ ] Camera orbit works

### Classical Orders
- [ ] Part click shows info panel
- [ ] Different orders render correctly
- [ ] Camera position allows viewing all orders

### DevControls Module (MUST BE UNCHANGED)
- [ ] Independent Canvas renders
- [ ] Layer visibility toggles work
- [ ] Dimension lines show/hide
- [ ] Camera presets switch (perspective/ortho)
- [ ] Lot ground renders
- [ ] RROW and firewall markers render
- [ ] PerformanceMonitor adapts DPR
- [ ] Pointer-missed clears selection

## Cross-Cutting Concerns

- [ ] `bun run type-check` passes
- [ ] `bun run build` succeeds
- [ ] No console errors on any 3D page
- [ ] Loading overlay shows while scene initializes
- [ ] `frameloop="demand"` — zero GPU when idle (verify in Chrome DevTools Performance tab)
- [ ] Module navigation between 3+ modules doesn't crash
- [ ] SlideToSubmit identity lock intact (verify per identity_preservation_lock.md)
