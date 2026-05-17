# Release Gate Checklist - Lighting Room Simulator

This checklist gates future implementation. It is intentionally stricter than a normal hidden QA module because lighting values can be misread as legal/code truth.

Current planning status: `16-p0-source-locator-and-architecture-closeout.md` clears Gate 0 for hidden QA implementation. Gate 1 still blocks learner-facing legal pass/fail until SME approval.

## Gate 0 - Planning Pack

- [ ] `03-readiness-audit.md` P0 blockers are resolved or superseded by `16-p0-source-locator-and-architecture-closeout.md`.
- [ ] `04-preparation-plan.md` is attached to the implementation task.
- [ ] `05-source-locator-workbook.csv` has P0 rows filled or explicitly deferred with rationale.
- [ ] `09-conflict-register.md` has a resolution for every learner-visible value conflict.
- [ ] `10-source-card-schema-and-approval.md` is followed for source statuses.
- [ ] `12-learner-ux-blueprint.md` is the learner-flow source of truth.
- [ ] `13-implementation-handoff-spec.md` is used as the build spec.
- [ ] `14-lighting-architecture-bridge.md` has an accepted v0 renderer/light decision.
- [ ] `15-formula-contract.md` is reflected in formula seeds and implementation tickets.

## Gate 1 - Source Truth

- [ ] No learner-facing law card renders `PASS`, `FAIL`, `COMPLIANT`, or `VIOLATION` from a `SOURCE_PENDING` or `LOCATED` source card.
- [ ] Every source-backed threshold has source id, law family, section/table, page or locator, quote/excerpt, reviewer, and approval date.
- [ ] PD 1096 is not used as the source for artificial lux targets unless the source card proves it.
- [ ] Emergency lighting uses 10.7 lux if displayed and remains `LOCATED, pending SME` until approved.
- [ ] Office target uses DOE Table 3.1 selected 300 lux teaching lower bound and remains `LOCATED, pending SME` until approved.
- [ ] Drafting target uses DOE Table 3.1 drawing-office row, not PEC, until PEC primary text is located.
- [ ] LPD limit uses Philippine Green Building Code Table 11 office 10.8 W/m2 and remains `LOCATED, pending SME` until approved.

## Gate 2 - Calculation Contract

- [ ] `computeLightingState()` is pure and has no React, DOM, R3F, or Zustand dependency.
- [ ] The renderer path is not assumed to be config-only; live lights are handled by `LightingRoomScene` or a typed light instruction extension.
- [ ] Formula tests cover:
  - average lux
  - LPD
  - efficacy
  - beam floor coverage
  - room area
  - preset targets
  - target checks
  - fail-closed source status
- [ ] Default Standard Office computes to its displayed target.
- [ ] Drafting Studio computes to its displayed target.
- [ ] Violation Demo computes below the office target.
- [ ] Same lumens with different wattage produces the same average lux but different efficacy/LPD.
- [ ] Visual light intensity calibration is tested through smoke/visual QA, not claimed as measured lux.

## Gate 3 - UX/UI

- [ ] Desktop 1440x820 has no document scroll.
- [ ] Desktop 1280x800 has no document scroll; internal panel scroll is allowed only if unavoidable.
- [ ] Left sidebar uses the stairway inspector pattern: compact sections, computed values first, controls below.
- [ ] Right sidebar default view is checks/status, not raw sources.
- [ ] Source details open behind a secondary affordance.
- [ ] First load teaches one concept, not every lighting topic at once.
- [ ] Under-target language is corrective and actionable.
- [ ] Source-pending states use review/warning styling, not destructive red.
- [ ] Destructive red appears only for approved functional non-compliance states.
- [ ] Sliders and dropdowns have accessible labels and keyboard support.
- [ ] Color temperature is indicated by text and numeric Kelvin, not color alone.

## Gate 4 - 3D Scene

- [ ] Room cutaway is readable from the default `iso-nw` view.
- [ ] Floor, back wall, left wall, ceiling, and fixture are visually distinct.
- [ ] Fixture position changes with room dimensions and mounting height.
- [ ] Beam cone toggle is optional and does not obscure the core room.
- [ ] Scene distinguishes:
  - brightness change
  - beam spread change
  - color temperature change
  - source/compliance status
- [ ] Grid and human scale are optional and do not compete with light visualization.
- [ ] Camera presets use current preset keys: `iso-nw`, `front`, `top`, and optional `perspective`.
- [ ] Camera reset returns to the same orientation used in QA screenshots.

## Gate 5 - Required QA Screenshots

Capture these before hidden QA release:

| State | Required evidence |
|---|---|
| Default Office | target-met simplified model, neutral 4000K light, no source-overclaim |
| Same Lumens Comparison | incandescent and LED look equally bright but differ in W and lm/W |
| Under Target | room visibly dimmer, right panel shows review/fail state based on source status |
| Drafting Studio | high target value, higher lumens, no math contradiction |
| Beam Angle | narrow beam shows smaller floor coverage than wide beam |
| Color Temperature | warm and cool states have text and numeric Kelvin |
| Source Pending | right panel fails closed and avoids compliant/violation language |
| Mobile | bottom sheet/tabs preserve scene and primary values |

## Gate 6 - Learner Release

- [ ] SME signs off all law/source cards.
- [ ] Product signs off the simplified teaching-model disclaimer.
- [ ] UX signs off first-run journey and microcopy.
- [ ] Engineering signs off performance and no-console-error smoke.
- [ ] QA confirms screenshot states above.

## Release Labels

| Label | Meaning |
|---|---|
| `DOC_READY` | Planning pack complete; no code started. |
| `HIDDEN_QA_READY` | Code implemented for internal QA only; source-pending states fail closed. |
| `SOURCE_READY` | Source cards approved for learner-facing legal language. |
| `LEARNER_READY` | Source, UX, QA, and performance gates passed. |
