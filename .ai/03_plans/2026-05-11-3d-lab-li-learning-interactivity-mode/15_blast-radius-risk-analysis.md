# 15 — Blast Radius & Risk Analysis

## Files Likely to Change During Implementation

### Type Changes (Low Risk)

| File | Change | Risk |
|------|--------|------|
| `src/features/3d-lab/types/templates.ts` | Add `'learning'` to `TemplateType`, add `mode` field, add `LearningLayerDef`, `LearningSceneConfig`, add to `ModuleConfig` union, add `'learning'` to `TEMPLATE_SHELL_DEFAULTS` | Medium |
| `src/types/3d-lab.ts` | No changes needed (LI doesn't use legacy ModuleConfig) | None |

### Config / Registry Changes (Low-Medium Risk)

| File | Change | Risk |
|------|--------|------|
| `src/features/3d-lab/config/registry/index.ts` | No changes needed (LI modules added to existing cat files) | None |
| `src/features/3d-lab/config/registry/cat-0X.ts` (one category) | Add first LI module entry | Low |
| `src/features/3d-lab/config/module-paths.ts` | No changes needed (dynamic import path resolution unchanged) | None |
| `src/features/3d-lab/config/dashboard-visibility.ts` | Add LI module ID to DASHBOARD_VISIBLE_IDS | None |
| `src/features/3d-lab/config/taxonomy.ts` | No changes needed | None |

### Component Changes (Low-Medium Risk)

| File | Change | Risk |
|------|--------|------|
| `src/features/3d-lab/components/ModuleCard.tsx` | Add `'learning'` to `TEMPLATE_META` | Low |
| `src/features/3d-lab/components/LabBrowser.tsx` | Add mode filter chips | Low |
| `src/features/3d-lab/hooks/useTemplateContent.tsx` | Add `case 'learning'` to switch | Medium |
| `src/features/3d-lab/components/ModuleViewer.tsx` | No changes needed (mode resolved automatically) | None |
| `src/features/3d-lab/components/shell/ViewportShell.tsx` | No changes needed | None |
| `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | No changes needed | None |
| `src/features/3d-lab/components/CanvasWrapper.tsx` | No changes needed | None |

### New Files (Medium Risk — New Code)

| File | Purpose | Risk |
|------|---------|------|
| `src/features/3d-lab/components/learning/LearningSceneRenderer.tsx` | LI scene renderer | Medium |
| `src/features/3d-lab/components/learning/LearningLayerToggles.tsx` | Layer toggle UI | Low |
| `src/features/3d-lab/components/learning/index.ts` | Barrel export | None |
| `src/features/3d-lab/config/modules/[category]/[li-module-id].ts` | First LI module config | Low |

### Route Changes (None)

| File | Change | Risk |
|------|--------|------|
| `src/app/dashboard/3d-lab/page.tsx` | No changes needed | None |
| `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | No changes needed | None |
| `src/app/dashboard/3d-lab/layout.tsx` | No changes needed | None |
| `src/lib/routes.ts` | No changes needed | None |

### Test Changes (Low Risk)

| Area | Change |
|------|--------|
| New test files for LI components | `src/features/3d-lab/components/learning/*.test.ts` |
| New test for registry including LI modules | Extend `config/registry/index.test.ts` |
| New E2E test for LI module | Extend `e2e/authenticated-demo-3d-lab.spec.ts` |
| Existing PI tests | Must pass unchanged |

### Documentation Changes (Low Risk)

| File | Change |
|------|--------|
| `src/features/3d-lab/AGENTS.md` | Update with LI documentation |
| `src/app/dashboard/3d-lab/AGENTS.md` | Update with LI routing note |
| `src/app/dashboard/3d-lab/3D_LAB_ARCHITECTURE.md` | Update with LI section |
| `src/app/dashboard/3d-lab/3D_LAB_MODULE_CATALOG.md` | Add LI module entry |

## Risk Level Table

| Area | Files/Paths | Risk Level | Why It Matters | Mitigation | Rollback |
|------|-----------|------------|----------------|------------|----------|
| TemplateType union | `types/templates.ts` | **Medium** | Adding variant forces all switch statements to handle it (TypeScript exhaustiveness) | Ensure all switches have default cases; test all template types | Remove `'learning'` from union; remove LI case from switches |
| ModuleRegistryEntry | `types/templates.ts` | **Low** | Adding optional `mode` field is backward compatible | Default `'PI'` everywhere; all existing modules work unchanged | Remove field (optional anyway) |
| TEMPLATE_SHELL_DEFAULTS | `types/templates.ts` | **Low** | Record must cover all TemplateType variants | Add before LI case in useTemplateContent | Remove entry |
| useTemplateContent | `hooks/useTemplateContent.tsx` | **Medium** | Central dispatch for all module types; bug here affects everything | Test all existing template types + LI; use feature flag | Remove `case 'learning'` |
| ModuleCard | `components/ModuleCard.tsx` | **Low** | New TEMPLATE_META entry only affects LI cards | Test existing cards still render correctly | Remove `'learning'` entry |
| LabBrowser | `components/LabBrowser.tsx` | **Low** | Filter chips only appear when LI modules exist | Feature-flag the filter UI; test with 0 LI modules | Remove filter chips code |
| LearningSceneRenderer | `components/learning/` | **Medium** | New R3F component — could have WebGL bugs | Wrap in SceneErrorBoundary; test on multiple devices | Delete file (dynamically imported) |
| ViewportShell | `components/shell/ViewportShell.tsx` | **None** | No changes needed | N/A | N/A |
| LabViewportFrame | `components/shell/LabViewportFrame.tsx` | **None** | No changes needed | N/A | N/A |
| Existing PI modules | `config/modules/*/` | **None** | No changes to any PI config | Regression test suite | N/A |
| E2E tests | `e2e/*.spec.ts` | **Low** | Adding LI test cases | Ensure PI E2E still passes | Remove LI test cases |

## PI Regression Risks

| Risk | Scenario | Prevention |
|------|----------|------------|
| TemplateType switch breaks PI rendering | `useTemplateContent` change introduces bug in existing cases | No changes to existing cases; only add new case |
| TypeScript errors in PI configs | ModuleConfig union change breaks existing config type inference | Test compile all existing config types |
| Sidebar collapse logic changes | ViewportShell changes affect PI sidebar behavior | No ViewportShell changes |
| Canvas behavior changes | LabViewportFrame changes affect PI rendering | No LabViewportFrame changes |
| Module card breaks PI display | TEMPLATE_META changes affect existing entries | No changes to existing entries |
| Dashboard filter hides PI modules | Default filter is "All" | Explicit default |
| Entitlement gate breaks | No entitlement changes | N/A |

## LI-Specific Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LI feels like "broken PI" | Medium | User confusion | Purpose-built layout (not just hidden sidebars); distinct "Learning" branding |
| Layer toggle doesn't work with R3F demand loop | Low | Layers don't show/hide | Test immediately; invalidate() on toggle |
| Layer geometry overlaps causing z-fighting | Low | Visual artifacts | Use different z-positions for layers |
| Too many layers hurts performance | Low | Frame drops | Limit to <20 layers per module |
| Config mismatch between registry and module config | Low | 404 or rendering failure | Runtime validation; console warnings |

## Mitigation Strategies

### Per Risk:
1. **Type changes**: Add before implementing any components; run `bun run type-check` after each type change
2. **useTemplateContent changes**: Add `case 'learning'` with feature flag; test all existing cases first
3. **New components**: Build in isolation; test with mock data before integrating
4. **Dashboard changes**: Feature-flag filter UI; test with current dashboard modules

### Global:
- **Feature flag**: `ENABLE_LI_MODE` env/config flag to disable LI during development
- **Branch strategy**: Implement on feature branch; no PI changes on branch
- **Test gate**: Full PI test suite must pass before merge
- **Review gate**: Diff review must confirm zero PI file modifications

## Rollback Strategy

| Scope | Rollback Method |
|-------|----------------|
| Per-component | Remove LI case from switch; React tree skips LI path |
| Full rollback | Revert merge commit; all LI additions are additive |
| Emergency | Remove `'learning'` from TemplateType; TypeScript errors on remaining LI code ensure nothing runs |

## Feature Flag Strategy

```typescript
// src/features/3d-lab/config/li-mode.ts (new file)
export const LI_MODE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LI_MODE === 'true'

// In useTemplateContent:
case 'learning': {
  if (!LI_MODE_ENABLED) return null  // fall through to error
  // ...LI content
}

// In LabBrowser:
const showModeFilter = LI_MODE_ENABLED && dashboardModules?.some(m => m.mode === 'LI')
```

Feature flag is off by default, on in development, and can be toggled independently from deployment.

## Incremental Rollout Strategy

1. **Phase 0**: Type changes merged (no behavioral impact)
2. **Phase 1**: Feature flag on in dev; LI components built behind flag
3. **Phase 2**: First LI module added behind flag; internal testing
4. **Phase 3**: Feature flag on in staging; QA testing
5. **Phase 4**: Feature flag on in production; monitor for PI regressions
6. **Phase 5**: Flag removed; LI is permanent feature

## Dependency Risks

| Dependency | Current Version | Risk |
|------------|----------------|------|
| `@react-three/fiber` | Latest | None — LI uses same R3F patterns |
| `@react-three/drei` | Latest | None |
| `three` | Latest | None |
| `zustand` | Latest | None |
| No new dependencies needed | — | Zero dependency risk |
