# 22 — 3D Lab Bundle / Config Loading Remediation

Generated: 2026-04-27T00:26:34.554Z

## Hypothesis

The 3D Lab hub route was importing through the broad components barrel. That barrel exports ModuleViewer, canvas shells, and rendering components, so the hub could see viewer/R3F symbols it should not need. The full registry still imports all module config files, but removing the broad component barrel is a smaller reversible first cut.

## Change made

| File | Change |
| --- | --- |
| `src/app/dashboard/3d-lab/page.tsx` | Replaced broad barrel import with direct imports for `LabBrowser` and `LabBrowserShell`. |
| `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | Replaced broad barrel import with direct `ModuleViewer` import. |
| `src/features/3d-lab/components/ModuleViewer.tsx` | Replaced internal broad barrel import with direct component/shell imports. |

## Build manifest before/after

Before values come from the read-only static audit over the previous `.next` build. After values come from `.ai/00_performance/results/3d_lab_bundle_after_direct_imports.json` after `bun run perf:build`.

| Route | Metric | Before | After | Delta |
| --- | --- | ---: | ---: | ---: |
| `/dashboard/3d-lab` | 3D/R3F signal module entries | 52 | 8 | -44 (-84.6%) |
| `/dashboard/3d-lab` | Unique chunks | 33 | 27 | -6 (-18.2%) |
| `/dashboard/3d-lab` | Raw chunk bytes | 3419.7 KiB | 2120.8 KiB | -1298.9 KiB (-38.0%) |
| `/dashboard/3d-lab` | Gzip chunk bytes | 930.1 KiB | 592.7 KiB | -337.4 KiB (-36.3%) |
| `/dashboard/3d-lab/[moduleId]` | 3D/R3F signal module entries | 52 | 6 | -46 (-88.5%) |
| `/dashboard/3d-lab/[moduleId]` | Unique chunks | 33 | 36 | 3 (9.1%) |
| `/dashboard/3d-lab/[moduleId]` | Raw chunk bytes | 3419.7 KiB | 3359.4 KiB | -60.3 KiB (-1.8%) |
| `/dashboard/3d-lab/[moduleId]` | Gzip chunk bytes | 930.1 KiB | 921.5 KiB | -8.5 KiB (-0.9%) |

## Success checks

- Hub manifest has `ModuleViewer`: no
- Hub manifest has `LabViewportFrame`: no
- Hub manifest has `@react-three/fiber`: no
- Hub manifest has `@react-three/drei`: no

## What remains

- The registry still directly imports 209 module config files (about 1.43 MiB source from the read-only audit). The metadata/full-config split remains the larger next remediation.
- `src/features/3d-lab/config/module-paths.ts` still imports `ALL_MODULES`, so dynamic config import remains coupled to registry metadata.
- The working tree already had unrelated 3D Lab edits before this pass; this report only claims the direct-import cleanup above.
- The dev-server Playwright run emitted a Node heap out-of-memory fatal message while measuring `/dashboard/3d-lab`; built-app route manifest improved, but route runtime memory still needs a focused 3D profiling loop.

## Verification

| Command | Exit | Log |
| --- | ---: | --- |
| `bun run perf:build` | 0 | `.ai/00_performance/logs/remediation-perf-build-after-3d-api-cron.log` |
| `bun run type-check` after related edits | 0 | `.ai/00_performance/logs/remediation-type-check-after-cron.log` |

## Rollback plan

Restore route and `ModuleViewer` imports to the broad components barrel. This is a small import-only rollback.

## Final verification blocker update — 2026-04-27T00:39Z

The final exact `bun run perf:frontend` run did not complete. It passed 13 route tests, then the Next dev server logged a memory-threshold restart while measuring `/dashboard/3d-lab`; Playwright timed out after 180 seconds and the browser context closed.

Evidence:
- Log: `.ai/00_performance/logs/final-perf-frontend.log`
- Failure JSON: `.ai/00_performance/results/final_frontend_failure.json`
- Partial route data: `.ai/00_performance/results/final_frontend_failed_partial.json`

This does not invalidate the direct-import bundle improvement, but it means 3D Lab remains the highest-priority frontend runtime blocker. Next measurement should isolate this route with `PLAYWRIGHT_USE_BUILT_APP=true`, explicit heap profiling, and route-focused repetitions before further optimization claims.
