# 12 — Blast Radius & Risk: LI + VizCode Competitive Scope

## Combined Risk Assessment

This document combines risks from:
1. The LI technical architecture (from `.ai/03_plans/2026-05-11-3d-lab-li-learning-interactivity-mode/15_blast-radius-risk-analysis.md`)
2. The competitive scope expansion (sub-modes, scene templates, coverage view)

## Risk Level Definitions

| Level | Description |
|-------|-------------|
| **Critical** | Could block launch or break existing PI functionality |
| **High** | Significant implementation challenge; needs careful mitigation |
| **Medium** | Manageable with good practices |
| **Low** | Minor concern; standard development risks |

## Technical Risks

| Risk | Level | Why | Mitigation | Rollback |
|------|-------|-----|------------|----------|
| **PI regression from type changes** | High | TemplateType union change impacts all switch statements | Add default cases; exhaustive testing; feature flag isolates LI path | Revert type changes |
| **Sub-mode state complexity** | High | 6 sub-modes with different state shapes could create spaghetti | Strict state isolation per sub-mode; each sub-mode has own state namespace in module store | Simplify to fewer sub-modes |
| **useTemplateContent growing too large** | Medium | Adding `case 'learning'` with sub-mode dispatch makes the hook unwieldy | Extract `buildLearningContent()` function; keep hook focused | Revert to simpler LI without sub-modes |
| **Coverage View performance** | Low | Filtering/tabulating 50+ modules on a single page | Use memo; virtualize if needed; paginate by code family | Simplify coverage view |
| **Sub-mode scene renderer bundle size** | Low | 6 sub-mode scene files could increase bundle | All dynamically imported (`ssr: false`); only active sub-mode loaded | Lazy-load aggressively |
| **Canvas demand-loop invalidation** | Low | R3F `frameloop="demand"` may not re-render on sub-mode state change | Explicit `invalidate()` calls in sub-mode state setters | Use `frameloop="always"` temporarily |

## Content Risks

| Risk | Level | Why | Mitigation | Rollback |
|------|-------|-----|------------|----------|
| **Source card verification bottleneck** | Critical | Every LI module requires verified source cards; verification is slow | Build source card pipeline first; parallelize across modules; don't ship without verification | Ship modules with "Source Pending" badge |
| **50+ modules too ambitious** | High | Content production may not keep pace with engineering | Phase content rollout; 3 MVP modules first, then scale | Reduce scope; fewer modules |
| **Dimension accuracy errors** | High | Wrong dimensions in 3D scenes damage credibility | Automated dimension checks against source register; SME review per module | Fix and redeploy |
| **Board trap quality varies** | Medium | Mistake Hunt and Board Drill need well-crafted educational content | Content team + SME collaboration; template-driven trap creation | Ship without Mistake Hunt initially |
| **Content copied from VizCode** | Critical | Legal/ethical risk if content inadvertently matches VizCode | All content from official sources only; never reference VizCode during authoring | Audit and replace |

## UX Risks

| Risk | Level | Why | Mitigation | Rollback |
|------|-------|-----|------------|----------|
| **LI feels like "broken PI"** | Medium | Single sidebar vs dual could look like something is missing | Purpose-built LI layout; clear "Learning" branding; sub-mode tabs communicate intentional design | Redesign LI layout |
| **Sub-mode tabs confusing** | Medium | 6 tabs could overwhelm users | Only show supported sub-modes; progressive disclosure (start with 2 tabs) | Simplify to fewer tabs |
| **PI/LI distinction unclear to users** | Low | Users may not understand when to use which mode | Dashboard filter + badges; tooltip explaining difference; different visual identity | Add explanatory copy |
| **Mobile sub-mode experience degraded** | Low | Sub-mode tabs on small screens need different UX | Horizontal scroll tabs or dropdown for mobile; bottom sheet adapts per sub-mode | Simplify mobile to Focus-only |

## File Impact Summary

### Files Modified (from LI technical plan + competitive additions)

| File | Change | Risk |
|------|--------|------|
| `types/templates.ts` | Type additions (LearningSubMode, modeConfigs, etc.) | Medium |
| `hooks/useTemplateContent.tsx` | `case 'learning'` with sub-mode dispatch | Medium |
| `components/ModuleCard.tsx` | TEMPLATE_META for 'learning' | Low |
| `components/LabBrowser.tsx` | Mode filter chips | Low |
| `config/registry/cat-*.ts` | LI module entries (additive) | Low |
| `config/dashboard-visibility.ts` | LI module IDs (additive) | None |

### Files Created (New)

| File | Purpose | Risk |
|------|---------|------|
| `components/learning/LearningSceneRenderer.tsx` | Main scene dispatcher | Medium |
| `components/learning/LearningSubModeTabs.tsx` | Tab bar | Low |
| `components/learning/scenes/FocusViewScene.tsx` | Focus sub-mode | Medium |
| `components/learning/scenes/CompareViewScene.tsx` | Compare sub-mode | Medium |
| `components/learning/scenes/MistakeHuntScene.tsx` | Mistake sub-mode | Medium |
| `components/learning/scenes/BoardDrillScene.tsx` | Drill sub-mode | Medium |
| `components/learning/scenes/SourceViewScene.tsx` | Source sub-mode | Low |
| `components/learning/panels/*.tsx` | 5 panel components | Low |
| `config/modules/*/li-*.ts` | 3-50 module configs | Low (per config) |
| Coverage View component | Atlas/discovery view | Medium |

### Files NOT Modified (Safe)

| File | Why Safe |
|------|----------|
| `shell/LabViewportFrame.tsx` | Canvas host — shared, no changes |
| `shell/ViewportShell.tsx` | Layout shell — config-driven, no changes |
| `components/CanvasWrapper.tsx` | Scene config — shared, no changes |
| `components/ModuleViewer.tsx` | Module orchestrator — handles all types, no changes |
| `app/dashboard/3d-lab/page.tsx` | Route page — no changes |
| `app/dashboard/3d-lab/[moduleId]/page.tsx` | Module route — no changes |
| `lib/routes.ts` | Route constants — no changes |
| All PI module configs | 187 existing configs — untouched |
| All PI scene renderers | Parametric, exploded, cutaway, etc. — untouched |

## Risk Mitigation Matrix

| Risk | Prevention | Detection | Response |
|------|-----------|-----------|----------|
| PI regression | No changes to PI code paths | Full test suite per commit | Revert commit |
| Source card bottleneck | Build pipeline early | Coverage view shows gaps | Ship with "Source Pending" |
| Sub-mode complexity | Start with 2 sub-modes (MVP) | Code review | Reduce to fewer |
| Content quality | SME review per module | Dimension accuracy tests | Fix and redeploy |
| UX confusion | User testing | Analytics on mode usage | Add onboarding |
| Bundle bloat | Dynamic imports | Bundle size monitoring | More aggressive splitting |

## Rollback Strategy by Phase

| Phase | Rollback Method | Impact |
|-------|----------------|--------|
| Types only | Revert type widening | No behavioral change to undo |
| MVP LI | Set `LI_MODE_ENABLED=false` | LI modules hidden; dashboard reverts to PI-only |
| Compare + Mistake | Set `LI_COMPARE=false`, `LI_MISTAKE=false` | Sub-modes hidden; LI reverts to Focus+Source only |
| Drill + Repair | Set `LI_DRILL=false`, `LI_REPAIR=false` | Higher sub-modes hidden |
| Full coverage | Remove LI modules from registry | Modules hidden; can re-add later |

## Top 5 Mitigation Priorities

1. **Source card pipeline** — Start building verified source cards immediately. This is the primary bottleneck for all LI content.
2. **Feature flag architecture** — Ensure every LI sub-mode can be independently toggled off without affecting other sub-modes.
3. **PI regression suite** — Run full PI test suite before every LI merge. Automate if possible.
4. **Sub-mode isolation** — Design sub-mode state as independent namespaces in the module store. Don't let sub-mode state leak across modes.
5. **Content quality gate** — No LI module ships without: verified source cards, dimension accuracy check, and SME review for board traps.
