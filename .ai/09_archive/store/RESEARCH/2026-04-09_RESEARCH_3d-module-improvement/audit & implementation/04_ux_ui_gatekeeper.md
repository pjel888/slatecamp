# 04 — UX/UI Gatekeeper (Verification Gates)

**Purpose:** Mandatory checklist that MUST pass before advancing to the next phase. The AI cannot proceed without running these checks.
**Rule:** After completing each phase, execute EVERY gate item. If ANY fails, fix before proceeding. Update `02_phase_tracker.md` with results.

---

## Universal Gates (Run After EVERY Phase)

```bash
# 1. Type check
bun run type-check
# Must exit 0 with no errors

# 2. Build
bun run build
# Must succeed — all 3D routes compile

# 3. DevControls untouched
git diff --name-only -- src/features/3d-lab/DevControlsModule/
# Must return EMPTY (zero changes)

# 4. SlideToSubmit identity lock
git diff --name-only -- src/components/quiz-v2/SlideToSubmit.tsx src/components/quiz-v2/GestureCaptureZone.tsx src/lib/quiz/haptics.ts
# Must return EMPTY (zero changes)

# 5. Module configs untouched (during architecture phases only)
git diff --name-only -- src/features/3d-lab/config/modules/ src/features/3d-lab/config/registry/ src/features/3d-lab/config/taxonomy.ts
# Must return EMPTY during P0-P9. Allowed during Waves + Regulatory track.
```

---

## Phase-Specific Gates

### Phase 0 Gate
- [ ] `bun run type-check` — passes (record output as baseline)
- [ ] `bun run build` — succeeds
- [ ] `gl.info.memory` baseline recorded for 3 module switches
- [ ] Regression checklist created

### Phase 1 Gate
- [ ] Universal gates pass
- [ ] Every template renders with correct camera position/FOV (compare against P0 baseline screenshots)
- [ ] PerformanceMonitor visible in React DevTools when LabViewportFrame is mounted
- [ ] `grep -rn 'CanvasWrapperProps' src/features/3d-lab/` — interface has ONLY `children` + `sceneConfig`
- [ ] `ls src/features/3d-lab/components/templates/CanvasWrapper.tsx` — file DOES NOT EXIST (deleted)
- [ ] `ls src/features/3d-lab/components/templates/GlobalCanvasPortal.tsx` — file DOES NOT EXIST (deleted)

### Phase 2 Gate
- [ ] Universal gates pass
- [ ] `grep -rn 'WebGLErrorBoundary' src/features/3d-lab/components/shell/LabViewportFrame.tsx` — found (Canvas wrapped)
- [ ] `grep -rn 'useDisposeOnUnmount' src/features/3d-lab/` — found in all 13 scene files
- [ ] `gl.info.memory.geometries` stays bounded across 10 rapid module switches (no monotonic growth)
- [ ] Simulate context loss: `gl.getExtension('WEBGL_lose_context').loseContext()` — error boundary shows retry UI

### Phase 3 Gate (CRITICAL — DOM-Only Enforcement)
- [ ] Universal gates pass

**Zero in-canvas text verification:**
```bash
# This MUST return zero results (excluding comments and this gatekeeper doc)
grep -rn '<Html\|<Text' src/features/3d-lab/templates/ src/features/3d-lab/components/
# EXPECTED: 0 matches

# Verify drei Html is not imported anywhere in 3d-lab (except DevControls which is untouched)
grep -rn "from '@react-three/drei'" src/features/3d-lab/ --include="*.tsx" --include="*.ts" | grep -i html
# EXPECTED: 0 matches (DevControls excluded from architecture phases)
```

- [ ] All annotations render as browser-native DOM text (inspectable in Chrome DevTools Elements tab)
- [ ] Overlay labels track 3D positions when camera orbits (visual check)
- [ ] `CameraSync.tsx` is the ONLY new component mounted inside `<Canvas>`
- [ ] `useOverlayStore` has items populated by at least one scene
- [ ] Labels accessible to screen readers (check with Lighthouse accessibility audit)

**Color token verification:**
```bash
# Hardcoded hex only allowed in scene-colors.ts
grep -rn '#[0-9a-fA-F]\{6\}' src/features/3d-lab/templates/ src/features/3d-lab/components/ | grep -v scene-colors
# EXPECTED: 0 matches
```

- [ ] `GroundPlane.tsx` used in all scenes that previously had inline ground meshes

### Phase 4 Gate
- [ ] Universal gates pass
- [ ] `StudioLighting` with NO props produces identical rendering to pre-Phase-4 (screenshot compare)
- [ ] `preset="flat"` produces output matching current `CalculatorLighting.tsx`
- [ ] `CalculatorLighting.tsx` is deleted or deprecated

### Phase 5 Gate
- [ ] Universal gates pass
- [ ] Navigate between 5 modules rapidly — no stale state, no VRAM growth
- [ ] `useLabStore` re-export works (all existing consumers compile and function)
- [ ] `useInvalidateOnChange.ts` — verified or deleted (see Appendix B.2 in master doc)
- [ ] `setActiveAnnotation` no longer calls `invalidateFn()` (profile: no Canvas re-render on annotation click)

### Phase 6 Gate
- [ ] Universal gates pass
- [ ] Modules with no asset manifest show spinner loading (backward compatible)
- [ ] DRACO decoder path configured globally

### Phase 7 Gate
- [ ] Universal gates pass
- [ ] React DevTools profiler: useFrame callbacks STOP after animations settle
- [ ] `frameloop="demand"` returns to zero GPU when scene is static (Chrome Performance tab)

### Phase 8 Gate
- [ ] Universal gates pass
- [ ] Fast navigation (10 rapid module switches) — correct module shown every time
- [ ] Mobile: orbit does not cause page scroll (test iOS Safari + Chrome Android)
- [ ] `touch-action: none` present on canvas container element

### Phase 9 Gate
- [ ] Universal gates pass
- [ ] Navigate between 2 ExplodedAssembly modules — store resets (no stale explode value)
- [ ] Navigate between 2 AnimatedSequence modules — store resets (no stale step)
- [ ] Introduce intentional error in test config geometry function — SceneErrorBoundary catches, retry works
- [ ] Empty geometry array → SceneEmptyState shown (not blank canvas)
```bash
# No ESLint disables in templates
grep -rn 'eslint-disable' src/features/3d-lab/templates/
# EXPECTED: 0 matches
```

---

## Wave Gates (Run Before Advancing to Next Wave)

### Pre-Wave Gate (All Waves)
For each completed module in the wave:
- [ ] `bun run type-check` passes
- [ ] Module renders in browser (visual check)
- [ ] All `code-mandated` parametric values have `citation` field (see `03_regulatory_ledger.md`)
- [ ] Violations fire correctly at legal thresholds
- [ ] No `<Html>` or `<Text>` inside Canvas (DOM overlays only)
- [ ] Module registered in correct `config/registry/cat-{id}.ts`
- [ ] Module config imports from shared constants (not inline hardcoded values)

### Wave 1 Gate
- [ ] All 7 BUILT modules verified against new architecture
- [ ] All 6 NEW modules render and respond to parameter changes
- [ ] `bun run audit:citations` shows improvement from baseline

### Wave 2 Gate
- [ ] MOD-101 (Staircase) cross-code constraint merge works: PD 1096 + BP 344 + RA 9514 mode toggle
- [ ] MOD-202 (Ramp) auto-generates landings for runs >10.50m
- [ ] MOD-104 (Firewall) parapet extensions enforce 0.40m/0.60m/0.30m minimums
- [ ] All violations cite specific law sections

### Wave 3 Gate
- [ ] MOD-302 (Travel Distance) pathfinding works with sprinkler toggle
- [ ] MOD-201 (Wheelchair) collision cylinder detects fixture intersections
- [ ] `measurement` template evaluated — decision documented

### Wave 4 Gate
- [ ] `simulation` template created and MOD-301 + MOD-503 work
- [ ] `site-planner` template created and MOD-402 + MOD-404 work
- [ ] GPU budget respected: <100 agents for egress sim
- [ ] Memory budget respected: max 10 hectare sites for site-planner

---

## Audit Findings Checklist (25 Total)

Track resolution status. Mark [x] when the fix is verified.

### CRITICAL (3)
- [ ] **F-01** CanvasWrapper dead props → Fixed in P1
- [ ] **F-02** Zero WebGL memory cleanup → Fixed in P2
- [ ] **F-03** No WebGL error boundary → Fixed in P2

### HIGH (7)
- [ ] **F-04** In-canvas annotations (violates DOM-only rule) → Fixed in P3
- [ ] **F-05** Ground plane duplication → Fixed in P3
- [ ] **F-06** Canvas config divergence → Fixed in P1
- [ ] **F-07** Hardcoded colors → Fixed in P3
- [ ] **F-08** StudioLighting not configurable → Fixed in P4
- [ ] **F-09** Invalidation over-triggering → Fixed in P5
- [ ] **F-10** Module config loading race → Fixed in P8

### MODERATE (15)
- [ ] **F-11** Store fragmentation → P5
- [ ] **F-12** No asset preloading → P6
- [ ] **F-13** No shared PerformanceMonitor → P1
- [ ] **F-14** useFrame no completion detection → P7
- [ ] **F-15** Duplicate re-exports → P1
- [ ] **F-16** No dark mode for 3D → Deferred
- [ ] **F-17** No mobile touch optimization → P8
- [ ] **F-18** Legacy Workspace divergence → Deferred
- [ ] **F-19** No camera preset system → P8
- [ ] **F-20** No DOM overlay positioning → P3
- [ ] **F-21** Store reset bug (ExplodedAssembly) → P9
- [ ] **F-22** No template error handling → P9
- [ ] **F-23** LabPanelLayout underused → P9
- [ ] **F-24** ESLint disable on useMemo → P9
- [ ] **F-25** No loading/empty states → P9

---

## Risk Monitoring

| Risk | Phase | Watch For |
|------|-------|----------|
| Camera refactor breaks framing | P1 | Screenshot compare |
| dispose() breaks R3F refs | P2 | Only imperative objects |
| tunnel-rat desync on HMR | P1 | Test hot reload |
| useLabStore split breaks selectors | P5 | Run type-check |
| DPR oscillation | P1 | Add `flipflops={3}` |
| Ground plane visual change | P3 | Pixel compare |
| SceneConfig lost on remount | P1 | Test StrictMode |
| Selective invalidation misses geometry | P5 | Use `geometryDirty` flag |
| GLTF preloader blocks first frame | P6 | Async manifest |
| Camera presets conflict | P8 | Module config overrides |
| Store reset breaks persistent state | P9 | Audit each template |
| Legal citations fabricated | Reg | Cross-ref PDF law docs |
| Multi-code conflicts | W2 | Most restrictive wins |
| Simulation exceeds GPU | W4 | <100 agents budget |
| Site-planner exceeds memory | W4 | Max 10 hectare, LOD |
