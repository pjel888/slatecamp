# 00 — Index: 3D Lab LI (Learning Interactivity) Mode Planning Package

**Date generated**: 2026-05-11
**Branch context**: `3dlab-gray-viewport-bg`
**Status**: Planning only — no production code modified.

---

## Task Overview

Introduce LI (Learning Interactivity), a second interaction mode for the existing 3D Lab feature. The current mode is retroactively named PI (Parametric Interactivity). LI should be a simpler, learning-focused 3D experience with layer/state toggles instead of heavy parametric controls.

## Definitions

| Term | Full Name | Description |
|------|-----------|-------------|
| **PI** | Parametric Interactivity | The existing 3D Lab mode. Parameter sliders, dual sidebars, compliance panels, violation indicators, parametric geometry. |
| **LI** | Learning Interactivity | The new planned mode. Interactive 3D model with simple layer/state toggles. Guided educational experience. Compact controls. |

## Document Inventory

| # | Document | Purpose |
|---|----------|---------|
| 00 | `00_index.md` | This index — navigable entry point |
| 01 | `01_executive-summary.md` | Problem, solution, decision summary, complexity estimates |
| 02 | `02_codebase-tech-stack-audit.md` | Framework, dependencies, conventions with file paths |
| 03 | `03_existing-3d-lab-audit.md` | Complete 3D Lab file inventory, user flow, architecture |
| 04 | `04_current-pi-mode-analysis.md` | What PI is today, what must be preserved, regression risks |
| 05 | `05_li-feature-prd.md` | LI product requirements — user stories, MVP, acceptance criteria |
| 06 | `06_pi-li-mode-comparison.md` | Side-by-side comparison table, what's shared vs specific |
| 07 | `07_architecture-proposal.md` | Mode-aware architecture with Mermaid diagrams, options analysis |
| 08 | `08_shared-viewport-component-strategy.md` | Viewport sharing analysis, extraction plan, pseudocode types |
| 09 | `09_dashboard-card-categorization-plan.md` | PI/LI badges, filtering, backward compatibility |
| 10 | `10_routing-navigation-plan.md` | Route structure options, backward compat, deep links |
| 11 | `11_data-model-and-type-plan.md` | Type/interface designs, migration strategy |
| 12 | `12_li-interaction-layer-toggle-plan.md` | Layer toggle UX, state model, scene control |
| 13 | `13_ui-ux-layout-plan.md` | LI layout options, responsive, accessibility |
| 14 | `14_performance-optimization-plan.md` | 3D performance risks, shared canvas implications |
| 15 | `15_blast-radius-risk-analysis.md` | Files likely affected, risk levels, mitigation, rollback |
| 16 | `16_testing-qa-plan.md` | Test strategy, PI regression checklist, LI QA checklist |
| 17 | `17_implementation-roadmap.md` | Phased plan, milestones, acceptance criteria |
| 18 | `18_migration-backward-compatibility-plan.md` | Data migration, default mode, link compatibility |
| 19 | `19_open-questions-decisions.md` | Unresolved decisions, default answers, blockers |
| 20 | `20_appendix-file-inventory.md` | Comprehensive file inventory with relevance/path/risk |

---

## Executive Recommendation

**Add a `mode` field to the existing `ModuleRegistryEntry` type** (defaulting existing modules to `'PI'`), add a new `'learning'` template type that maps to an LI-specific shell config and scene renderer, reuse the shared `LabViewportFrame` canvas, and introduce dashboard PI/LI badges. No route changes needed — the mode is data-driven and resolved from the module config via the registry.

## Recommended MVP Shape

1. Add `mode: 'PI' | 'LI'` to `ModuleRegistryEntry`
2. Add `'learning'` to `TemplateType` union
3. Add LI shell defaults (compact right panel only, no dual sidebars)
4. Create LI scene renderer + layer toggle component
5. Add PI/LI badges to `ModuleCard`
6. Add one sample LI module config
7. Add dashboard filtering by mode
8. Existing modules default to PI → zero regression

## Most Important Architecture Decision

**Data-driven mode resolution (not route-level separation).** The shared R3F Canvas (`LabViewportFrame`) already uses `SceneTunnel` to compose per-module scene content. Adding LI as a template/type variant reuses all existing infrastructure without duplicating the viewport, canvas, or shell system.

## Top 5 Risks

| Risk | Severity | Document |
|------|----------|----------|
| PI regression from type/registry changes | High | 15, 18 |
| Over-abstracting viewport for LI | Medium | 08 |
| Dashboard card confusion without clear visual distinction | Low | 09 |
| Performance impact of additional template variant loading | Low | 14 |
| Scope creep — trying to add annotations/quizzes to MVP | Medium | 05 |

## Top 5 Open Questions

| Question | Default | Blocks MVP? | Document |
|----------|---------|-------------|----------|
| Should LI be a new `templateType` or a separate `mode` field? | Separate `mode` field + `'learning'` templateType | Yes | 19 |
| Should the route change? | No — data-driven resolution | Yes | 10 |
| What should the first LI module be? | BP 344 ramp layers or wall section | No | 19 |
| Should existing modules default to PI? | Yes | Yes | 18 |
| Can LI share the existing `CanvasWrapper`? | Yes — already designed for it | Yes | 08 |

## Next Step After Planning

Review this planning package, resolve open product questions, select first LI module content, then begin Phase 1 (data model + type changes) from the implementation roadmap (document 17).

---

**Confirmation**: No production/source code was modified in the creation of this planning package. All documents are new markdown files created inside `.ai/03_plans/2026-05-11-3d-lab-li-learning-interactivity-mode/`.
