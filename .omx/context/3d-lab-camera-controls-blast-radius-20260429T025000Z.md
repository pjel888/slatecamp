# Blast Radius: 3D Lab Camera Controls

## GitNexus status
The repo-level AGENTS contract requires GitNexus impact analysis before symbol edits, but GitNexus MCP tools were unavailable through tool discovery and `npx gitnexus --help` hung until killed. Fallback impact analysis used local import/reference inspection plus targeted tests.

## Candidate modified symbols and local impact
- `DEFAULT_ISO_PRESET` / new default view constant in `src/features/3d-lab/utils/camera-presets.ts`
  - Referenced by `useCameraSnap.ts` and `camera-presets.test.ts`.
  - Risk: LOW. Utility-only constants.
- `getSelectedCameraPresetAfterCommand`, `getProjectionModeAfterCommand`, `shouldClearManualOrbitForCommand`
  - Referenced by `useViewportShellStore.ts`, `camera-presets.test.ts`.
  - Risk: MEDIUM because all toolbar/shortcut camera commands pass through the store.
- `DEFAULTS`, `snapToPreset`, `reset` in `src/features/3d-lab/stores/useViewportShellStore.ts`
  - Used by `CameraNavigationBar`, `SceneToolbar`, `ViewportShell`, `SharedToolbarBridge`, `useCameraSnap`, tests.
  - Risk: MEDIUM. Shared 3D Lab UI state, but contained to 3D Lab.
- `resolveScenePresetTarget`, `resolveSceneZoomToFitTarget`, `useCameraSnap` in `src/features/3d-lab/hooks/useCameraSnap.ts`
  - Mounted from `CanvasWrapper` / shared 3D scene path.
  - Risk: MEDIUM-HIGH inside 3D Lab because all shared camera commands execute here; no backend/global app effect.
- `SceneConfig` camera selection in `src/features/3d-lab/components/rendering/SceneConfig.tsx`
  - Shared R3F scene config for 3D Lab modules.
  - Risk: MEDIUM-HIGH inside 3D Lab because perspective/orthographic camera swap happens here.

## Expected affected surfaces
- All `/dashboard/3d-lab/*` modules using shared `ViewportShell -> LabViewportFrame -> CanvasWrapper -> SceneConfig`.
- Site Development Controls via `SharedToolbarBridge` and shared shell.
- Calculator-template 3D slots through shared cameraControls.

## Not affected
- Database/backend.
- Auth/routes outside 3D Lab.
- Unrelated landing/marketing dirty work must not be touched.
