# 09 - Testing, QA, and Release Gates

## Testing Principle

LI must prove two things at the same time:

1. LI works as a learning interaction.
2. PI did not regress.
3. The shared 3D Lab viewport/shell contract still holds.

No completion claim should be made without fresh verification evidence from the current implementation run.

## Required Test Layers

### Unit and Component Tests

Targets:

- learning type/config validation,
- hotspot payload rendering,
- quiz answer feedback,
- comparison payload rendering,
- layer toggle state,
- dashboard mode filtering,
- registry/module path loading,
- source-card ID presence for source-sensitive hotspots.

Candidate commands:

- `bun test src/features/3d-lab/config/registry/index.test.ts`
- `bun test src/features/3d-lab/config/module-paths.test.ts`
- focused new LI component/config tests added by implementation

### Type and Lint

Commands:

- `bun run type-check`
- `bun run lint` when source/style/workflow changes require it

### Playwright / E2E

Commands:

- `bun run test:e2e:auth-demo:3d-lab`
- add or extend focused 3D Lab spec for LI dashboard card, route load, hotspot open, quiz answer, layer toggle, and PI module smoke.

### 3D Performance / Smoke

Use current 3D performance scripts when implementation reaches release-candidate state:

- `bun run perf:3d:layout-audit`
- `bun run perf:3d:controls-audit`
- `bun run perf:3d:smoke`
- `bun run perf:3d:mobile`
- `bun run perf:3d:gates`

Select the smallest script that proves the claim for the current PR.

## Manual QA Checklist

For shared viewport/shell regression:

- Each tested LI and PI route has one shell/header/viewport/status structure.
- No LI route mounts a second R3F canvas for the same module surface.
- Shared orbit/pan/zoom/reset controls still work.
- WebGL unavailable, context-loss, and slow-scene fallback surfaces remain reachable.
- Mobile bottom sheet contains the expected LI/PI sidebar content without overlap.

For each LI module:

- Dashboard card appears with Learning badge.
- Card opens correct route.
- Model is not blank on desktop.
- Model is not blank on mobile.
- Camera orbit/pan/zoom still works.
- Hotspots are visible and clickable/tappable.
- Hotspot content fits without overflow.
- Quiz can be answered and shows rationale.
- Comparison table fits and cites sources.
- Layer toggle hides/shows correct geometry and attached hotspots.
- Static fallback exists or is explicitly not release-ready.
- Source-card/correction link is present where required.

For PI regression:

- Existing PI cards still render.
- Existing visible PI modules open.
- PI sliders/controls still work.
- PI compliance panels still render.
- No new route redirects.
- No duplicate canvas/WebGL context caused by LI.

## Release Gates

### Implementation-Ready

- source cards mapped,
- hotspot contract drafted,
- config schema planned,
- tests planned,
- blast-radius tooling run for source edits,
- GitNexus freshness restored or its unavailability explicitly documented,
- code-review-graph impact reviewed for shared 3D Lab files,
- ChunkHound search/research run or its lock/unavailability explicitly documented.

### PR-Ready

- focused tests pass,
- `bun run type-check` passes,
- relevant 3D Lab Playwright check passes or documented blocker exists,
- `git diff --check` passes,
- docs updated for changed structure/surface.

### Public-Release Ready

- all PR-ready gates pass,
- static fallback verified,
- QA screenshots captured,
- source/reviewer memo attached,
- no source-card gaps,
- no third-party asset/license gaps,
- no PI regression,
- no unresolved P0/P1 accessibility issues.

## No-Go Conditions

Block release if:

- source values disagree across card, overlay, and config,
- model geometry is used as legal truth without source card,
- LI changes fork `ViewportShell`, `LabViewportFrame`, or `CanvasWrapper` without explicit architecture approval and full 3D performance evidence,
- GBC compliance is claimed without official source,
- WebGL canvas is blank on common viewport,
- mobile hotspot content cannot be used,
- PI regression is observed,
- Playwright 3D Lab smoke is red without an accepted blocker.
