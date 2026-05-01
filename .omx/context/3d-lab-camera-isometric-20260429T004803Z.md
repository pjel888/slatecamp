# Ralph Context Snapshot - 3D Lab Camera / Isometric View

## Task statement
User invoked ultrawork + ralph + slatecamp-r3f-api-master + team and reported: the isometric view doesnt work in the 3d lab. Please check all camera functions in the 3d lab and make sure it works.

## Desired outcome
- 3D Lab isometric view works reliably.
- All camera preset commands/functions in the 3D Lab are inspected and fixed where needed.
- R3F/drei/Three camera behavior is type-safe and compatible with demand frameloop invalidation.
- Targeted tests/typecheck verify the camera behavior.

## Known facts/evidence
- Root git status before this task has pre-existing landing-page edits/deletions: src/components/landing/*, src/components/marketing/MarketingNav.tsx; avoid touching those.
- rg found camera state in src/features/3d-lab/stores/useViewportShellStore.ts and camera bridge in src/features/3d-lab/hooks/useCameraSnap.ts.
- Existing test file: src/features/3d-lab/stores/useViewportShellStore.test.ts covers command normalization and projection mode basics.
- R3F API Master guidance applies: use selective useThree selectors, no allocations in useFrame, invalidate demand frames after imperative camera/controls changes, update projection matrices when projection/zoom changes.

## Constraints
- Follow root + nearest AGENTS.md: src/features/AGENTS.md, src/features/3d-lab/AGENTS.md, route AGENTS if route files change.
- Use Bun scripts from package.json.
- Must not overwrite unrelated in-progress landing changes.
- Must run impact analysis before editing functions/classes/methods when GitNexus is available; if MCP tools unavailable, use CLI/available fallback and record evidence.
- Use omx team runtime because team was explicitly invoked.

## Unknowns/open questions
- Exact failing behavior: toolbar command never fires, preset maps to wrong coordinates, orthographic projection does not switch, OrbitControls target is stale, or tests miss commands.
- Whether failure is global 3D Lab, calculator template-specific, or module-specific.

## Likely codebase touchpoints
- src/features/3d-lab/hooks/useCameraSnap.ts
- src/features/3d-lab/stores/useViewportShellStore.ts
- src/features/3d-lab/utils/camera-presets.ts
- src/features/3d-lab/components/controls/ThreeDLabControlsProvider.tsx
- src/features/3d-lab/components/controls/*Camera* / toolbar files
- src/features/3d-lab/templates/CalculatorTemplate.tsx
- src/app/dashboard/3d-lab/** only if route-level wiring is involved

## User update - pan control
The user added that the pan camera control is also not behaving properly. Acceptance criteria now includes validating/fixing pan behavior alongside isometric/camera preset functions.

## Research note - SketchUp camera behavior
Official SketchUp Help (Viewing a Model, last updated Apr 11 2026) describes orbit/zoom/pan as always-available modeling navigation: pan moves the camera/view vertically or horizontally; Shift while Orbit is selected temporarily activates Pan; scroll-wheel zoom uses cursor as the zoom center; Camera menu includes top/bottom/left/right/front/back/iso views and Parallel Projection for orthographic scaled views. This task aligns SlateCamp 3D Lab controls with that model: no artificial polar constraint by default, middle mouse orbits, Shift+left temporarily pans, H/Pan and O/Orbit mode shortcuts, and iso/standard views switch projection correctly.
