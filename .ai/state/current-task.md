# Current Task: First-Time User Experience (FTUX) Audit & Hardening <!-- updated: 2026-04-10 -->

**STATUS:** AUDIT COMPLETE — EXECUTION STARTING
**DATE:** 2026-04-10

## Active Project: First-Time User Experience (FTUX) Improvements

**Audit Plan:** `.ai/plans/2026-04-10-First-Time-User-UXUI-Audit.md` (v1.0)

### Phase 1 — Redirection & Guards (High Priority) — COMPLETE
- [x] 1.1: Fix Register Redirect — Update `RegisterForm.tsx` to pass `next=/onboarding` <!-- completed: 2026-04-10 -->
- [x] 1.2: Add Dashboard Onboarding Guard — Update `DashboardLayoutContent.tsx` to check `onboarding_completed_at` <!-- completed: 2026-04-10 -->
- [x] 1.3: Update Register Page Copy — Align "Continue to see your score" with new user context <!-- completed: 2026-04-10 -->

### Phase 2 — Dashboard Arrival & Empty States — COMPLETE
- [x] 2.1: Onboarding Calibration UI — Visual feedback during the 3-step setup <!-- completed: 2026-04-10 -->
- [x] 2.2: Dashboard Welcome State — Conditional "First Step" cards for 0-score users <!-- completed: 2026-04-10 -->
- [x] 2.3: Skeleton to Helpful State Transition — Replace empty graphs with educational placeholders <!-- completed: 2026-04-10 -->

### Phase 3 — Verification & Analytics — COMPLETE
- [x] 3.1: Verify end-to-end signup-to-onboarding-to-dashboard path <!-- completed: 2026-04-10 -->
- [x] 3.2: Add analytics events for onboarding drop-off points <!-- completed: 2026-04-10 -->

## Previous Project: First-Time User Experience (FTUX) Audit & Hardening — COMPLETE

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
