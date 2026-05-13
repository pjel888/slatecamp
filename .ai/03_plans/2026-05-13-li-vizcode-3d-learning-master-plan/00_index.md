# 00 - Index: LI + VizCode 3D Learning Master Plan

Date generated: 2026-05-13
Status: active consolidated planning package; no production code modified.
Archive target: `.ai/09_archive/store/2026-05-13-li-vizcode-3d-learning-consolidation-inputs/`

## Purpose

This folder is the single active planning entrypoint for SlateCamp's LI, or Learning Interactivity, 3D Lab strategy after consolidating these three source folders:

- `.ai/13_research/vizcodeph-comprehensive-audit-2026-05-07/`
- `.ai/03_plans/2026-05-11-li-vizcode-competitive-3d-learning-strategy/`
- `.ai/03_plans/2026-05-11-3d-lab-li-learning-interactivity-mode/`

The source folders are valuable evidence, but they should no longer be used as competing active plans. This package preserves their decisions, resolves conflicts, and creates implementation-ready planning artifacts. The original input folders are archived under `.ai/09_archive/store/2026-05-13-li-vizcode-3d-learning-consolidation-inputs/`.

## Canonical Decisions

1. LI is hotspot-centered, not sub-mode-tab-centered.
2. PI and LI are complementary: PI is parametric compliance exploration; LI is guided spatial learning and recall.
3. Keep the existing `/dashboard/3d-lab/[moduleId]` route. Mode is data-driven through module config.
4. The first LI MVP modules are `bp344-ramp-hotspots`, `bp344-toilet-hotspots`, and `egress-stair-hotspots`.
5. Every student-facing code claim must resolve to a source card, locator, formula/test seed where applicable, and review evidence.
6. VizCode PH is a competitive product signal only. It is not a source of legal, code, or educational truth.
7. The active product surface starts inside 3D Lab, including a future coverage view, not a new top-level navigation item.

## Document Inventory

| File | Role |
| --- | --- |
| `00_index.md` | Entry point and canonical decisions |
| `01_goals-intent-synthesis.md` | What the source docs were trying to accomplish |
| `02_master-prd.md` | Combined product requirements for LI as a SlateCamp 3D learning system |
| `03_competitive-response-prd.md` | VizCode response plan: match, improve, replace, or skip |
| `04_technical-implementation-plan.md` | Engineering implementation sequence and file touchpoints |
| `05_comprehensive-ux-ui-implementation-plan.md` | Dashboard, viewport, hotspot, responsive, and accessibility UX/UI plan |
| `06_ux-ui-learning-paths-plan.md` | Persona-based learning paths and learner journeys |
| `07_content-authoring-source-truth-plan.md` | Source-card, truthfulness, authoring, and no-go plan |
| `08_module-roadmap-and-priority-backlog.md` | P0/P1/P2 module roadmap and backlog |
| `09_testing-qa-release-gates.md` | Test, QA, release, and regression gates |
| `10_risk-register-open-decisions.md` | Risks, decisions, open questions, and default answers |
| `11_source-ledger-and-archive-map.md` | Evidence ledger plus original-to-archive path map |
| `12_agent-execution-handoff.md` | Handoff instructions for the later implementation run |
| `13_vizcode-live-mode-deep-dive-2026-05-13.md` | Live VizCode mode study and SlateCamp counter-plan |
| `14_vizcode-member-mode-audit-2026-05-13.md` | Logged-in VizCode mode/sidebar audit and implementation updates |
| `15_3d_lab_pi_li_blast_radius_and_shared_viewport_optimization.md` | Live 3D Lab PI inventory, blast-radius result, and shared viewport LI optimization |

## Reading Order

Start with:

1. `01_goals-intent-synthesis.md`
2. `02_master-prd.md`
3. `04_technical-implementation-plan.md`
4. `05_comprehensive-ux-ui-implementation-plan.md`
5. `09_testing-qa-release-gates.md`

Use the remaining files for competitive, content, learning-path, source-truth, risk, and execution details.

## What This Supersedes

This package supersedes the active use of both May 11 plan folders and the May 7 VizCode audit as planning entrypoints. It does not delete their evidence. The original source folders are preserved in archive for traceability.

## Implementation Boundary

This package authorizes planning only. A later implementation run must:

- re-read nearest in-scope `AGENTS.md` files,
- inspect live 3D Lab source code before editing,
- run required blast-radius tooling before source edits,
- write tests before or alongside implementation,
- run `bun run type-check`, relevant `bun test ...`, relevant Playwright 3D checks, and `git diff --check`,
- keep all code changes scoped to the implementation plan approved for that run.
