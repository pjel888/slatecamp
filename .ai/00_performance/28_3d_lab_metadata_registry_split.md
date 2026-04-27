# 28 — 3D Lab Metadata Registry Split

Generated: 2026-04-27T02:14:57.747Z

## Hypothesis
The previous direct-import cleanup removed viewer/R3F symbols from the hub, but `ALL_MODULES` still pulled all category registry files, and those category files imported 209 full module config files. Making the registry metadata-only should reduce hub chunk bytes and browser heap while preserving detail pages through `importModuleConfig(moduleId)`.

## Change made
- Rewrote `src/features/3d-lab/config/registry/cat-01.ts` through `cat-16.ts` as metadata-only literal registries.
- Preserved public registry API: `ALL_MODULES`, `getModuleById`, `getModulesByCategory`, `getModulesByTemplate`, `getModulesByPhase`.
- Added `src/features/3d-lab/config/registry/index.test.ts` static guard so category files cannot import `config/modules` again.
- Extended `src/features/3d-lab/config/module-paths.test.ts` to prove dashboard-visible modules still load full configs dynamically and match metadata.
- Added `.ai/00_performance/scripts/3d-lab-chunk-profile.mjs`.

## Chunk profile before/after
| Route | Metric | Before | After | Delta |
| --- | --- | ---: | ---: | ---: |
| Hub | Raw bytes | 2120.8 KiB | 1146.2 KiB | -974.5 KiB |
| Hub | Gzip bytes | 592.7 KiB | 341.6 KiB | -251.1 KiB |
| Hub | Unique chunks | 27 | 24 | -3 |
| Hub | Signal modules | 4 | 4 | 0 |
| Detail | Raw bytes | 3359.4 KiB | 2409.2 KiB | -950.2 KiB |
| Detail | Gzip bytes | 921.5 KiB | 677.2 KiB | -244.3 KiB |
| Registry source | Direct config imports | 209 | 0 | -209 |

## Runtime before/after
| Mode | Metric | Before | After |
| --- | --- | ---: | ---: |
| Dev isolated | Cold p50 | 2566 ms | 2486 ms |
| Dev isolated | Cold p95 | 20513 ms | 26058 ms |
| Dev isolated | Warm p50 | 2199 ms | 2071 ms |
| Dev isolated | Warm p95 | 3584 ms | 3098 ms |
| Dev isolated | Transfer p50 | 5676.6 KiB | 4791.6 KiB |
| Built isolated redirect | Cold p95 | 1413 ms | 1408 ms |

## Interpretation
- The metadata split materially reduced hub and detail chunk bytes and lowered median dev transfer/heap pressure.
- Dev cold p95 remains noisy and worsened in this three-run sample because one cold run had a long server/compile wait. The reliable proof is chunk-shape/heap reduction, not a stable p95 win yet.
- Built-app isolated route remains a login redirect, so its timing is not authenticated 3D Lab content.
- No isolated dev-server memory restart occurred after the split, but full-suite status still requires the final full run.

## Verification
- `bun test src/features/3d-lab/config/registry/index.test.ts src/features/3d-lab/config/module-paths.test.ts` passed.
- `bun run type-check` passed.
- `bun run lint` passed.
- `bun run perf:build` passed.
- Isolated dev and built 3D route measurements passed.

## Rollback plan
Revert `cat-01.ts` through `cat-16.ts` to config-importing registry files and remove the registry static guard test. This restores prior behavior while keeping route/filter harness changes independent.

## Evidence files
- `.ai/00_performance/results/3d_lab_chunk_profile_before_corrected.json`
- `.ai/00_performance/results/3d_lab_chunk_profile_after.json`
- `.ai/00_performance/results/3d_lab_runtime_after_metadata_split.json`
- `.ai/00_performance/results/3d_lab_runtime_after_metadata_split_dev.json`
- `.ai/00_performance/results/3d_lab_runtime_after_metadata_split_built.json`
