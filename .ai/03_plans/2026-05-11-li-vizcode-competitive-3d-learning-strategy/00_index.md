# 00 — Index: LI Mode + VizCode Competitive 3D Learning Strategy

**Date generated**: 2026-05-11
**Status**: Planning only — no production code modified.
**Cross-reference**: `.ai/03_plans/2026-05-11-3d-lab-li-learning-interactivity-mode/` (LI technical architecture)
**Competitive evidence**: `.ai/13_research/vizcodeph-comprehensive-audit-2026-05-07/` (VizCode PH audit)

---

## Purpose

This planning package defines how SlateCamp's 3D Lab LI (Learning Interactivity) mode can match and exceed EVERYTHING VizCode PH offers, turning LI from a simple "layer toggle" mode into a comprehensive competitive 3D learning platform.

The standard is not to copy VizCode. The standard is: if VizCode gives a learner a diagram, mode, library page, comparison, game prompt, or AI affordance, SlateCamp must decide whether to **match it**, **improve it**, **replace it with a better 3D-native interaction**, or **intentionally skip it**.

## Relationship to Other Planning Packages

| Package | Location | Role |
|---------|----------|------|
| **This package** | `.ai/03_plans/2026-05-11-li-vizcode-competitive-3d-learning-strategy/` | Competitive strategy + combined LI/VizCode feature plan |
| LI technical architecture | `.ai/03_plans/2026-05-11-3d-lab-li-learning-interactivity-mode/` | How LI mode is built (types, components, routing, viewport) |
| VizCode comprehensive audit | `.ai/13_research/vizcodeph-comprehensive-audit-2026-05-07/` | What VizCode has (530+ pages, 780+ files of evidence) |
| SlateCamp planning readiness | `.ai/13_research/vizcodeph-comprehensive-audit-2026-05-07/39_slatecamp_planning_readiness_docs/` | Product readiness, source verification, governance |

## Document Inventory

| # | Document | Purpose |
|---|----------|---------|
| 00 | `00_index.md` | This index |
| 01 | `01_executive-competitive-strategy.md` | How LI beats VizCode: strategy, positioning, decisions |
| 02 | `02_vizcode-what-we-must-match-and-beat.md` | Exact VizCode features mapped to LI equivalents |
| 03 | `03_li-mode-learner-job-mapping.md` | **SUPERSEDED**: learner jobs now fulfilled by hotspot types (info/quiz/comparison). See doc 20. |
| 04 | `04_competitive-scene-template-catalog.md` | 20 reusable 3D scene templates for full code-family coverage |
| 05 | `05_content-coverage-roadmap-by-priority.md` | P0/P1/P2 content roadmap: 233 topics, 90 P0, prioritized |
| 06 | `06_li-mode-sub-modes-architecture.md` | **SUPERSEDED**: sub-mode tab architecture replaced by hotspot-centered model. See doc 20. |
| 07 | `07_competitive-ux-comparison.md` | UX comparison: VizCode vs PI vs LI. Layout mockups pre-hotspot revision; competitive data valid. |
| 08 | `08_dashboard-and-discovery-strategy.md` | How learners discover LI modules, coverage view, filtering |
| 09 | `09_pricing-entitlement-competitive-positioning.md` | How LI fits into SlateCamp pricing vs VizCode pricing |
| 10 | `10_testing-qa-competitive-validation.md` | Validating LI beats VizCode on quality, accuracy, UX |
| 11 | `11_implementation-phasing-roadmap.md` | **REVISED**: hotspot-centered 4-phase roadmap. Replaces sub-mode-based original. |
| 12 | `12_blast-radius-risk-li-plus-vizcode.md` | Combined risk analysis for LI + competitive scope (sub-mode risk entries noted) |
| 13 | `13_open-questions-and-decisions.md` | Strategic decisions; sub-mode architecture decisions superseded by hotspot revision |
| 14 | `14_cross-reference-to-existing-planning.md` | How this package connects to existing plans |
| 15 | `15_appendix-vizcode-feature-gap-analysis.md` | Complete feature gap: what VizCode has vs what LI will have |
| 16 | `16_vitruvius-taxonomy-reconciliation.md` | Maps vitruvius-connection taxonomy to 3D Lab categories; concept-to-template mapping |
| 17 | `17_source-card-id-system.md` | Source card ID resolution chain: LI layer → vitruvius concept → regulatory basis → raw PDF |
| 18 | `18_content-authoring-pipeline.md` | End-to-end pipeline: from canonical knowledge to deployed LI module config |
| 19 | `19_li-comparative-analysis-strategy.md` | Cross-code comparison in LI: toggle vs side-by-side vs overlay; PI/LI division of labor |
| 20 | `20_li-hotspot-architecture-revised.md` | **Revised LI architecture**: hotspot-centered interaction replaces sub-mode tabs; reuses existing HotspotAnnotation/Card/Question |
| 21 | `21_li-module-content-ideas.md` | 7 LI-specific module ideas with hotspot layouts; 18 ready source cards from truth handoff |
| 22 | `22_comprehensive-blast-radius-feasibility.md` | **Codebase-specific blast radius**: files touched, HotspotQuestion gap, GeometryInstruction verification, switch statement analysis |
| 23 | `23_ux-research-synthesis-hotspot-design.md` | **UX research synthesis**: Mayer's Coherence, 4-layer IA, persona-based flows, cognitive load budget, VizCode UX failures exploited |
| 24 | `24_vizcode-vs-slatecamp-coverage-comparison.md` | **Concrete comparison table**: VizCode 267 topics vs SlateCamp 210 registry modules, gap analysis, coverage density map |

## Critical Production Doc Findings (2026-05-11)

Reading the Blender MCP production docs and BP344 ramp implementation lock (folders 40-44 in the VizCode audit) revealed:

1. **The BP344 ramp is locked as parametric (PI), not LI.** Template type: `parametric`. Module ID: `bp344-accessible-route-ramp`. This has verified source rules with exact dimensions (clear_width=1200mm, max_slope=1:20, etc.).

2. **Cross-code comparison modules (egress stair, occupant load, site-lot) are also locked as parametric.** They use sliders + violation indicators for comparison, not layer toggles.

3. **PI and LI handle comparison differently:**
   - **PI**: Interactive parametric comparison — adjust slider, see which codes pass/fail
   - **LI**: Educational toggle/overlay comparison — toggle code families to see spatial differences

4. **LI's first modules should NOT duplicate the parametric modules.** LI modules should be complementary — focusing on layer-based educational exploration of what's inside building assemblies, material layers, and component systems.

## Executive Recommendation

**LI mode should be SlateCamp's competitive answer to VizCode's educational product surface** — but LI and PI are complementary, not overlapping. PI handles parametric compliance checking (the BP344 ramp, egress stair comparator, site-lot comparator). LI handles layer-based educational exploration of construction assemblies, material layers, building components, and cross-code comparison via toggle/overlay groups.

The MVP LI (single layer toggle mode) is Phase 1. But the architecture must be designed from day one to support the full sub-mode taxonomy without requiring architectural rewrites.

## Top 5 Strategic Recommendations

1. **Hotspot-centered LI, not sub-mode LI.** Reuse existing `HotspotAnnotation` + `HotspotCard` + `HotspotQuestion`. Click model elements → modal with info or quiz. Dramatically simpler architecture, better learning UX.
2. **First 3 LI modules: BP 344 Ramp, BP 344 Toilet, Egress Stair Comparison.** 18 verified source cards already exist for these. Hotspots make cross-code comparison natural (comparison hotspot shows PD 1096 vs BP 344 vs RA 9514 in a table).
3. **LI handles guided discovery; PI handles parametric exploration.** The BP344 ramp exists in BOTH modes: PI for adjusting slope/width → compliance checking, LI for clicking hotspots → learning requirements. Complementary, not duplicative.
4. **Layer toggles are secondary.** Primary interaction is hotspot clicking. Layer toggles are available but optional — useful for wall/roof/foundation assembly modules where peeling back layers teaches construction sequence.
5. **Source cards are already available.** 18 of 34 truth handoff source cards are LI-ready. Content authoring is mostly hotspot placement + quiz question writing, not source verification from scratch.

## Most Important Architecture Decision

**LI uses a hotspot-centered interaction model, not sub-mode tabs.** The 3D Lab already has `HotspotAnnotation`, `HotspotCard`, `HotspotQuestion`, `DOMOverlayLayer`, and `useOverlayStore`. LI reuses all of these. Students click hotspots on the 3D model → information modal or quiz modal appears. No sub-mode tabs, no adaptive sidebars, no complex state management. This is dramatically simpler than the original sub-mode architecture and is a better learning experience.

## Top Risks

| Risk | Severity |
|------|----------|
| Confusion between PI and LI scopes — building LI modules that duplicate parametric PI content | High |
| Vitruvius-connection enrichment bottleneck — 25 draft concepts need source verification | High |
| Over-engineering comparative view (split-viewport) before proving simpler toggle/overlay works | Medium |
| LI content not differentiated enough from PI to justify separate mode | Medium |
| Source verification pipeline not ready when LI modules are built | High |

## Top Open Questions

| Question | Default | Blocks? |
|----------|---------|---------|
| Should LI sub-modes be a single config-driven template or separate template types? | Config-driven (single `'learning'` type with `supportedModes` field) | Yes |
| Which 3 scene templates for Phase 1 MVP? | BP344 Ramp, BP344 Toilet, Egress Stair | Yes |
| Should the coverage view be Phase 1 or Phase 2? | Phase 2 | No |
| How many LI modules at launch? | 3-5 P0 modules | Yes |
| Should LI have a free preview tier? | Source View free; interactive modes paid | P1 |

## Confirmation

No production/source code was modified. All documents are new markdown files inside `.ai/03_plans/2026-05-11-li-vizcode-competitive-3d-learning-strategy/`.
