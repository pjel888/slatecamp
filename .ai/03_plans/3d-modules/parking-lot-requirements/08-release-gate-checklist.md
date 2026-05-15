# Release Gate Checklist — Parking Lot Requirements

## Gate 1 — Planning complete

- [ ] PRD approved.
- [ ] Source research plan approved.
- [ ] Readiness audit updated from `NO_GO` to `CONDITIONAL_GO` only after source-locator MVP is complete.
- [ ] UX/3D authoring brief approved.
- [ ] Implementation path chosen: new module vs rewrite existing parking modules.

## Gate 2 — Source locator ready

- [ ] Every MVP rule has raw source path.
- [ ] Every raw source has SHA256.
- [ ] Every value has page/section/table/figure locator.
- [ ] Every value has extracted quote.
- [ ] BP 344 accessible stall geometry conflict resolved.
- [ ] PD 1096 parking stall/aisle locators verified.
- [ ] BP 220/PD 957 housing/off-site applicability separated.
- [ ] RA 9514 parking garage scope either sourced or explicitly deferred.
- [ ] LGU overlays not active unless a specific ordinance is sourced.

## Gate 3 — Formula and source-card ready

- [ ] Formula testcase seeds converted to tests.
- [ ] Boundary cases pass.
- [ ] Source-pending labels tested.
- [ ] No `COMPLIANT` / `VIOLATION` leakage while source status is pending.
- [ ] Rule IDs resolve to source cards.
- [ ] Missing source card causes fail-closed behavior.

## Gate 4 — Hidden QA implementation ready

- [ ] Built on isolated branch/worktree.
- [ ] Typecheck passes.
- [ ] Targeted tests pass.
- [ ] Lint passes or unrelated baseline warnings documented.
- [ ] `git diff --check` passes.
- [ ] Browser route loads direct hidden route.
- [ ] Canvas renders with WebGL available.
- [ ] Forced WebGL fallback renders acceptable state if Canvas code changes.
- [ ] Console has no module errors after route settles.
- [ ] Independent review memo completed.

## Gate 5 — Dashboard QA preview

- [ ] Module card says `QA Preview`, not `Available`.
- [ ] Browser list counts separate available modules from QA preview modules.
- [ ] Right panel shows `SOURCE_PENDING` clearly if not approved.
- [ ] No learner-release wording.
- [ ] QA packet saved under `.ai/05_logs/`.

## Gate 6 — Learner release

- [ ] SME/source reviewer approves every source rule.
- [ ] Source status moved to `SOURCE_READY` only for approved rules.
- [ ] Learner-facing labels may use source-backed compliance language only after approval.
- [ ] Wiki/Quiz deep-links use stable preset IDs.
- [ ] Accessibility and keyboard interactions pass QA.
- [ ] Performance budget acceptable on MacBook-class device.
- [ ] Philip approves release.

Current gate: Gate 1 in progress. Gates 2–6 blocked.
