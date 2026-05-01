# 3D Lab camera pan + site-development layers emergency fix

Task: Fix constrained pan behavior in the 3D Lab and investigate why Site Development Controls layers look wrong/missing versus historical git state.
Desired outcome: SketchUp-like pan (not artificially constrained after zoom/preset changes), camera toolbar clear of footer, NE/SE/etc fit visible subject without clipping, and site-development plan layers restored/confirmed against historical implementation.
Known facts: SceneConfig owns active OrbitControls; direct controls elsewhere are forbidden except inactive NBCPEnvelope. Prior patch loosened distance/clipping and moved toolbar. User reports pan still constrained and site-development layers messed up.
Constraints: Preserve unrelated landing/marketing dirty work. Use Bun. No new deps. Root + src/features/3d-lab AGENTS apply. GitNexus MCP not available; use git history + rg fallback.
Likely touchpoints: SceneConfig.tsx, useCameraSnap.ts, useTemplateContent.tsx, DevControlsModule layers/state/canvas, audit script.
