# 18 — Migration & Backward Compatibility Plan

## Migration Needs Assessment

### Do Existing 3D Lab Data Need Migration?

**No.** The 3D Lab module system is entirely file-based (TypeScript config files in `src/features/3d-lab/config/`). There is no database migration needed. No Supabase tables need modification. No API changes needed.

However, the **type system** changes are effectively a "migration" — we're widening types. This document covers that.

## Cards Without Mode

### Current State
All 187 modules in `ALL_MODULES` have no `mode` field.

### Recommended Treatment
Add `mode` as an **optional** field to `ModuleRegistryEntry`. All resolvers default to `'PI'`:

```typescript
// In every consumer that reads mode:
const mode = entry.mode ?? 'PI'
```

Places that need to resolve mode:
1. `LabBrowser.tsx` — filter logic
2. `ModuleCard.tsx` — badge display
3. `ModuleViewer.tsx` — pass to useTemplateContent (but templateType is the actual dispatch key)
4. `useTemplateContent.tsx` — mode is informational; templateType drives the switch

### Default Mode: PI

All existing modules are PI in practice. Setting `mode` default to `'PI'` makes this explicit:
- No existing module needs `mode` field added retroactively
- All existing modules behave identically
- Only NEW modules that are LI need `mode: 'LI'`

## How Old Links Remain Working

| Link Type | Current URL | After LI | Status |
|-----------|------------|----------|--------|
| PI module | `/dashboard/3d-lab/stairway-configurator` | Same | ✅ Unchanged |
| Dashboard | `/dashboard/3d-lab` | Same | ✅ Unchanged |
| Category drill-down | `/dashboard/3d-lab?category=BUILDING_CODE` | Same | ✅ Unchanged |
| Bookmarked PI module | Any `/dashboard/3d-lab/[moduleId]` | Same | ✅ Unchanged |
| Admin links | Any | Same | ✅ Unchanged |

**Zero route changes = zero broken links.**

## How to Avoid Breaking Imports

| Import | Risk | Resolution |
|--------|------|------------|
| `import { TemplateType } from '...types/templates'` | None — type is widened | Union gets wider, all existing values remain valid |
| `import { TEMPLATE_META } from '...ModuleCard'` | None — Record gets wider | Existing entries unchanged |
| `import { TEMPLATE_SHELL_DEFAULTS } from '...types/templates'` | None — Record gets wider | Existing entries unchanged |
| `import { ModuleConfig } from '...types/templates'` | None — union gets wider | Existing discriminants unchanged |
| `import { ALL_MODULES } from '...config/registry'` | None — array type gets wider | Existing entries unchanged |

All imports continue to work because all changes are **additive** (widening unions, adding optional fields, adding entries to records).

## How to Avoid Breaking Tests

| Test Category | Risk | Resolution |
|---------------|------|------------|
| Tests that explicitly type-check TemplateType | Low | Ensure tests don't assert on union exhaustiveness in a way that breaks on new variants |
| Tests that iterate ALL_MODULES | None | Existing entries unchanged |
| Tests that assert on TEMPLATE_META keys | Low | Tests checking `Object.keys(TEMPLATE_META)` may see new key — use specific key checks, not iteration |
| Snapshot tests | Low | Snapshots may need updating if they include template types |

### Precaution
Run full test suite after Phase 1 (types). If any test breaks, fix the test to be resilient to new union variants before adding LI functionality.

## How to Avoid Breaking Current Dashboard

| Concern | Resolution |
|---------|-----------|
| Dashboard shows LI badges on PI cards | Only when `mode: 'LI'` is set — existing modules default to PI |
| Dashboard layout changes | Filter chips only appear when LI modules exist AND feature flag is on |
| Dashboard performance | Additional `mode` field read is negligible |
| Card appearance | No visual change to PI cards (existing TEMPLATE_META entries unchanged) |

## Versioning Strategy

No versioning needed. The migration is additive and backward-compatible:
- Current state: modules have no `mode` field → default to PI
- Future state: modules MAY have `mode: 'LI'` → render as LI
- Module config version is tracked by TypeScript compilation, not runtime version

If a future breaking change to module configs is needed:
1. Add a `configVersion: number` field to `ModuleRegistryEntry`
2. Handle migration in `importModuleConfig` or `useTemplateContent`
3. Not needed for LI MVP

## Step-by-Step Migration Plan

### Step 1: Widen Types (No Behavior Change)
1. Add `InteractionMode` type
2. Add `mode?: InteractionMode` to `ModuleRegistryEntry`
3. Add `'learning'` to `TemplateType`
4. Add `LearningLayerDef`, `LearningSceneConfig`
5. Add to `ModuleConfig` union
6. Run `bun run type-check` — should pass
7. Run full test suite — should pass

### Step 2: Add Defaults (No Behavior Change)
1. Add `'learning'` entry to `TEMPLATE_SHELL_DEFAULTS`
2. Add `'learning'` entry to `TEMPLATE_META`
3. Run tests — should pass (no LI modules in registry yet)

### Step 3: Add LI Components (Behind Feature Flag)
1. Create LI components
2. Add `case 'learning'` to `useTemplateContent` (behind feature flag)
3. Test in dev environment with feature flag on

### Step 4: Add First LI Module
1. Create module config
2. Register in category file
3. Add to DASHBOARD_VISIBLE_IDS (behind feature flag initially)

### Step 5: Enable and Verify
1. Turn feature flag on in staging
2. Run QA
3. Deploy to production with flag on

## Rollback Plan

### Per-Phase Rollback

| Phase | Rollback Action |
|-------|----------------|
| Types only | Revert commit; types are additive — no behavioral change to rollback |
| Dashboard | Remove filter chips; badges are harmless (no LI modules exist) |
| Components | Delete LI component files; remove `case 'learning'` from switch |
| First module | Remove module from registry + DASHBOARD_VISIBLE_IDS + delete config file |

### Emergency Full Rollback
1. Set `NEXT_PUBLIC_ENABLE_LI_MODE=false` — disables LI branch in all switches
2. All existing behavior continues (PI modules unaffected)
3. LI module cards still show on dashboard but navigating shows error/fallback
4. Schedule proper rollback PR to remove `'learning'` from unions

### Data Safety
- No database changes → no data migration to reverse
- All module configs are in git → revert is a git operation
- No user-generated data in LI (MVP) → no data loss risk

## Checklist Before Enabling in Production

- [ ] All PI modules tested and working identically
- [ ] PI E2E tests pass
- [ ] LI module tested end-to-end
- [ ] Performance benchmarks show no PI regression
- [ ] Feature flag mechanism tested (on/off toggles work)
- [ ] Rollback procedure verified (flag off → PI still works)
- [ ] Documentation updated
- [ ] Team informed of new mode and content authoring capability
