# Readiness Audit - Lighting Room Simulator

Audit date: 2026-05-15
Scope: `.ai/03_plans/3d-modules/lighting-room-simulator` planning pack
Reference UI: `http://localhost:3000/dashboard/3d-lab/stairway-code-compliance` returned `200 OK`; browser automation was unavailable from this surface, so preserved stairway screenshots and live source files were used as reference evidence.

## Verdict

Original audit verdict: `CONDITIONAL_GO_FOR_DOCS_ONLY`

Current gate status after `16-p0-source-locator-and-architecture-closeout.md`: `CONDITIONAL_GO_FOR_HIDDEN_QA_DOCS`

The module idea is strong enough to preserve and improve. The original P0 source and architecture blockers are now superseded by the P0 closeout: hidden QA implementation may start if source labels fail closed. Learner-facing legal pass/fail still requires SME approval.

## Evidence Reviewed

| Evidence | Path |
|---|---|
| Planning pack README | `.ai/03_plans/3d-modules/lighting-room-simulator/README.md` |
| PRD | `.ai/03_plans/3d-modules/lighting-room-simulator/01-prd.md` |
| Source research plan | `.ai/03_plans/3d-modules/lighting-room-simulator/02-source-research-plan.md` |
| Formula seeds | `.ai/03_plans/3d-modules/lighting-room-simulator/06-formula-testcase-seeds.csv` |
| UX/3D authoring brief | `.ai/03_plans/3d-modules/lighting-room-simulator/07-ux-3d-authoring-brief.md` |
| MVP scope | `.ai/03_plans/3d-modules/lighting-room-simulator/11-mvp-v0-scope.md` |
| Stairway left panel pattern | `src/features/3d-lab/components/templates/StairwayWorkbenchPanels.tsx` |
| Stairway shell registration | `src/features/3d-lab/hooks/useTemplateContent.tsx` |
| Stairway UI screenshot | `.ai/03_plans/stairway-workbench-prototypes/implemented-stairway-workbench-ui-rescue-final-1440x820.png` |
| Existing lighting modules | `src/features/3d-lab/config/modules/06-electrical/illumination-levels.ts`, `src/features/3d-lab/config/modules/06-electrical/lighting-layout.ts` |
| Design contract | `DESIGN.md`, `src/app/globals.css` |

## What Is Already Strong

1. The module has a clear differentiator: the 3D room itself teaches lighting, unlike the existing 2D `illumination-levels` and `lighting-layout` modules.
2. The docs correctly identify the main pedagogical concept: learners should see that lumens, not watts, control brightness.
3. The planned UI aligns with the stairway special-path approach for shell density and side-panel structure, but needs a lighting-specific right panel and explicit scene-lighting bridge.
4. The source plan already recognizes that PD 1096 does not directly own lux targets. This is critical legal/source hygiene.
5. The MVP excludes expensive or misleading professional-lighting features such as IES files, global illumination, daylight simulation, and multi-fixture layouts.

## P0 Findings

### LRS-AUD-001 - Preset math contradicts the stated learning claims

Severity: `BLOCKER`
Current closeout status: `RESOLVED_FOR_HIDDEN_QA`
Evidence:
- `01-prd.md` says the Standard Office preset is 1800 lumens in a 4m x 4m room and labels it "400 lux".
- `06-formula-testcase-seeds.csv` correctly says `lumens=1200, area=16` yields `75 lux`.
- With the PRD formula `lux = lumens / roomArea`, a 16m2 room needs 4800 lm for 300 lux, 6400 lm for 400 lux, and 12000 lm for 750 lux.

Impact:
- A later implementation would ship a "passing" office that the module's own formula marks as severely under-lit.
- Learners would learn the opposite of the intended concept.

Required fix:
- Update presets, lumens range, and formula tests so every preset's label matches its computed state.
- Add a test that fails if any preset name includes a lux target that does not match the computed target.

Closeout:
- Presets and formula seeds now use 4800 lm for 300 lux, 12000 lm for 750 lux, and source-gated target checks.

### LRS-AUD-002 - Source status is not precise enough for learner-facing law cards

Severity: `BLOCKER`
Current closeout status: `RESOLVED_FOR_HIDDEN_QA`
Evidence:
- `02-source-research-plan.md` marks PEC, DOE, RA 9514, Green Building Code, and PD 1096 as "Needs sourcing".
- `01-prd.md` still drafts violation messages that read as definitive law claims.
- Existing modules currently cite several values directly to PEC, but the planning pack itself has not source-approved them.

Impact:
- Implementation could accidentally render `COMPLIANT` or `VIOLATION` for values not yet approved.
- Learners may trust a wrong code attribution.

Required fix:
- Use the source-card approval model in `10-source-card-schema-and-approval.md`.
- Right panel must fail closed: `SOURCE PENDING` / `REVIEW` until a source card is approved.

Closeout:
- `05-source-locator-workbook.csv` now marks DOE, PGB Code, and RA 9514 P0 rows as `LOCATED`; PEC rows are `CONFLICT` and deferred from v0 display.
- `LOCATED` still cannot render learner-facing legal pass/fail.

### LRS-AUD-003 - The learner flow is underspecified

Severity: `HIGH`
Current closeout status: `RESOLVED_FOR_HIDDEN_QA`
Evidence:
- `07-ux-3d-authoring-brief.md` describes components, camera presets, and interaction states.
- It does not define a first-time learner sequence, misconception ladder, challenge mode rubric, recovery copy, or what the learner should understand after 60 seconds.

Impact:
- Builders may produce a technically correct simulator that feels like a lighting calculator, not a learning instrument.

Required fix:
- Implement the learner blueprint in `12-learner-ux-blueprint.md`.
- First load must teach one insight before exposing all controls: "same lumens, different watts" or "target lux requires enough total lumens for the room area."

Closeout:
- `12-learner-ux-blueprint.md` is accepted as the learner-flow source of truth for hidden QA implementation.

### LRS-AUD-004 - The simplified photometry model needs explicit boundaries

Severity: `HIGH`
Current closeout status: `RESOLVED_FOR_HIDDEN_QA`
Evidence:
- `01-prd.md` says no professional lighting design tool, but later asks for inverse-square and beam feedback.
- `11-mvp-v0-scope.md` says v0 excludes Room Cavity Ratio, CU, LLF, and lumen method, but the PRD still lists them as learning domain topics.

Impact:
- Without a boundary, the implementation may mix simplified average lux, inverse-square visual falloff, and code compliance in a way that implies professional precision.

Required fix:
- Separate three layers:
  - `teaching model`: simplified average lux, efficacy, LPD.
  - `visual model`: approximate Three.js light intensity and beam spread for perception.
  - `source model`: law/source cards and legal status.
- Never claim the visual lighting gradient is a measured lux map in v0.

Closeout:
- `15-formula-contract.md` and `14-lighting-architecture-bridge.md` split teaching math, visual light calibration, and source status ownership.

### LRS-AUD-005 - Current 3D Lab renderer cannot implement live lights from geometry alone

Severity: `BLOCKER`
Current closeout status: `RESOLVED_FOR_HIDDEN_QA`
Evidence:
- `src/features/3d-lab/types/templates.ts` defines `GeometryInstruction` for meshes, lines, cones, and instancing, but no light instruction.
- `src/features/3d-lab/templates/ParametricSceneRenderer.tsx` maps geometry instructions to `InstructionMesh` or `InstancedMesh`; it does not render `PointLight` or `SpotLight`.
- `StudioLighting` `clinical` preset adds high ambient/key/fill light, so it does not avoid competing with the module light.

Impact:
- Treating this as a config-only parametric module would fail the core product promise: "change lighting parameters, see the room light change."

Required fix:
- Use `14-lighting-architecture-bridge.md` before implementation.
- Preferred v0 path: module-specific `LightingRoomScene` inside a special path with `disableLighting: true`.

Closeout:
- `14-lighting-architecture-bridge.md` is accepted for v0 Option A: a module-specific `LightingRoomScene` mounted through the `useTemplateContent.tsx` special path with `disableLighting: true`.

### LRS-AUD-006 - Generic ComplianceReportPanel is not suitable for lighting source checks

Severity: `BLOCKER`
Current closeout status: `RESOLVED_FOR_HIDDEN_QA`
Evidence:
- `ComplianceReportPanel.tsx` is built around RA 9514, BP 344, PD 1096, and BP 220 law prefixes.
- It renders active laws as compliant or violation counts, which conflicts with source-pending lighting values.

Impact:
- PEC/DOE/PGBC lighting checks would either be skipped or overclaimed.

Required fix:
- Build a source-gated lighting checks panel or extend a source-compliance panel pattern. Do not reuse the current generic stairway compliance panel as-is.

Closeout:
- The handoff now requires `LightingRoomChecksPanel`; the generic stairway compliance panel remains rejected for lighting source cards.

## P1 Findings

### LRS-AUD-007 - The right sidebar should not be a quote wall

Evidence:
- Stairway's right sidebar works because it compresses law families into scan-friendly cards.
- Parking UI study warns that sources belong behind compact cards or popovers, not default quote walls.

Required fix:
- Default right tab/panel should be `Checks`.
- Source detail must be a secondary action, drawer, popover, or later tab.

### LRS-AUD-008 - Red needs source and severity discipline

Evidence:
- `DESIGN.md` reserves destructive red for real errors/critical alerts.
- The original PRD draft used red surface overlays whenever a violation is active.

Required fix:
- Source-pending rules use warning/review styling, not destructive red.
- Destructive red can appear only for approved, functional non-compliance states.
- Low learning performance or "not enough light yet" language should stay coach-like: "Below target. Try increasing lumens or reducing room area."

Closeout:
- Current PRD and conflict rules use review/warning language for under-target located or source-pending states.

### LRS-AUD-009 - Mobile adaptation is too thin

Evidence:
- PRD mentions mobile bottom sheet, but the UX brief is desktop-dominant.

Required fix:
- Mobile plan must specify tabs, bottom sheet priority, touch targets, and the safe default order: Scene -> Key values -> Controls -> Checks.

### LRS-AUD-010 - The source locator needs conflict handling, not only extraction

Evidence:
- Existing docs mix PEC, DOE, IES, RA 9514, Green Building Code, and PD 1096.
- Some values are code-mandated, some energy/design guidance, and some pedagogical references.

Required fix:
- Track each value by law family, status, and learner display label.
- Use `09-conflict-register.md` for conflicts such as 10.7 vs 10.8 lux and 300 vs 400 lux office defaults.

Closeout:
- `05-source-locator-workbook.csv` and `09-conflict-register.md` now separate DOE, PGB Code, RA 9514, PEC-deferred, and pedagogical/internal rows.

## P2 Findings

1. The authoring brief should include example microcopy for info popovers.
2. The release gate should require screenshot evidence for default, source-pending, under-target, target-met, and comparison states.
3. The implementation plan should require a pure computation contract before 3D rendering.
4. The docs should name a "golden path" so the module does not expose too many controls at once.

## Readiness Criteria Before Code

- [x] `05-source-locator-workbook.csv` has P0 source rows with located, conflict, or internal/pedagogical status and extraction notes.
- [x] `09-conflict-register.md` has a v0 resolution for every learner-visible conflicting value.
- [x] PRD presets compute to their displayed lux labels under the v0 formula.
- [x] `06-formula-testcase-seeds.csv` covers preset math, target checks, and fail-closed source statuses.
- [x] `12-learner-ux-blueprint.md` is accepted as the learner flow source of truth.
- [x] `14-lighting-architecture-bridge.md` has an accepted v0 renderer decision.
- [x] `08-release-gate-checklist.md` is attached to the later implementation task.

## Bottom Line

The concept is worth building. The original docs would have led implementation into three predictable failures: wrong preset math, overconfident legal labels, and a simulator that is useful to engineers but too cognitively heavy for learners. The current planning pack now closes those issues for hidden QA; learner release still depends on SME source approval.
