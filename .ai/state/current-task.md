# Current Task: Wall Configurator v2 Implementation Planning — COMPLETE

**STATUS:** PLANNING COMPLETE — READY FOR EXECUTION
**DATE:** 2026-04-09

## Active Project: Wall Configurator v2 Full Implementation

**Playbook:** `.ai/docs/01-product/wall-configurator-v2-implementation-playbook.md` (v1.2)
**Consensus:** Architect ITERATE → fixed → Critic APPROVE (8/9)

### Shared Infrastructure (Unblocked — Can Start Now)
- [ ] S.1: Extend GeometryType with 'instanced' variant
- [ ] S.2: ComputedWallState data channel (React context)
- [ ] S.3: Add visibleWhen to ParameterDef (target: GenericControlPanel.tsx)

### Phase 1 — Structural Fidelity (Blocked by S.1–S.3)
- [ ] 1.1: Constants extraction (wall-constants.ts, wall-constants-performance.ts)
- [ ] 1.2: Type definitions (wall-types.ts)
- [ ] 1.3: Extended CoreTypeRegistry (wall-core-registry.ts)
- [ ] 1.4: Computation engine — ComputedWallState (wall-computation.ts)
- [ ] 1.5: Shared finish layer builder (wall-geometry-layers.ts)
- [ ] 1.6: Drywall framing sub-builder (wall-geometry-drywall.ts)
- [ ] 1.7: CHB reinforcement sub-builder (wall-geometry-chb.ts)
- [ ] 1.8: Generic sub-builder (wall-geometry-generic.ts)
- [ ] 1.9: Main geometry dispatcher (wall-geometry.ts)
- [ ] 1.10: Wire up main config — replace geometry function
- [ ] 1.11: Expanded violation rules (wall-violations.ts)
- [ ] 1.12: Expanded presets (wall-presets.ts)
- [ ] 1.13: Performance dashboard — fire + STC badges

### Phase 2 — Assembly Understanding (Blocked by Phase 1)
- [ ] 2.1: Adaptive parameter visibility
- [ ] 2.2: Core type card selector
- [ ] 2.3: View mode system
- [ ] 2.4: Section cut view mode
- [ ] 2.5: Exploded layer view mode
- [ ] 2.6: Build sequence animation mode
- [ ] 2.7: BOM panel component
- [ ] 2.8: Brick sub-builder

### Phase 3 — Advanced Features (Blocked by Phase 2)
- [ ] 3.1: MEP integration layer
- [ ] 3.2: Waterproofing layers
- [ ] 3.3: Wall-to-structure connection details
- [ ] 3.4: Comparison mode + ComparisonDashboard
- [ ] 3.5: International wall type comparison

## Previous Project: Admin CMS Audit Implementation — ALL PHASES COMPLETE

### Tasks Complete
- Role Matrix Verification (Unit tested)
- Editor Save Flow Hardening (Unit tested)
- Publish Revalidation + Cache Invalidation (Fixed missing revalidateTag)
- Offline Save Detection (Implemented in SaveAllBar)
- Consolidate updateQuestion exports (Consolidated in questions.ts)
- Preview select(*) replacement (Explicit columns added)
- Link cleanup (Removed legacyBehavior)

## Previous Project: Stairway Configurator v2 — ALL PHASES COMPLETE

### Phases 1-3 Complete (28/28 tasks)
- Phase 1 (11/11): Foundation — types, constants, computation, geometry refactor
- Phase 2 (8/8): Depth — GeometryType unification, extruded-profile, comparison mode
- Phase 3 (9/9): Flagship — L/U-shape geometry, egress calculator, materials
- Phase 4 (8/8): 3D rendering + unit tests

### Key Commits
- `3abdcb38` — Phase 4: wire 3D rendering + unit tests
- `9c4f8af0` — Phase 3: L/U-shape geometry, egress calculator, children's safety, materials
- `9366fb25` — fix: ModuleViewer useTemplateContent moved before early returns

## Stairway Backlog (Phase 5+)
- Winder stairs, spiral stairs, guided tour system, drei Instances for evacuation
