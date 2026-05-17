# Analytics Dashboard Redesign — Planning Package

> **Reality refresh**: 2026-05-16
> **Status**: Relevance-first planning update added after the first dense-tab implementation pass
> **Target**: `/dashboard/analytics` and `/dashboard/analytics/advanced`
> **Decision**: Use lean, intent-based physical tabs and remove the analytics page from the narrow centered content pattern.

## Executive Summary

The current analytics surface is not a document page or a BI console. It is a learner decision surface inside a quiz-prep product.

The first redesign plan correctly moved analytics toward active server-rendered tabs and full dashboard width. Product review added a sharper requirement: **the user should not see every analytics chart by default**. For a quiz-taking surface, too much diagnostic data creates interpretation work instead of helping the learner choose the next quiz or review topic.

The current planning direction is therefore:

- Use physical browser/notebook-style tabs, not segmented pills.
- Default to 4 learner tabs: `Ready`, `Focus`, `Practice`, `Habits`.
- Show about 12 primary panels by default, not all 34 sections.
- Keep the remaining sections accounted for as secondary diagnostics fetched only on demand.
- Enforce the hard no-scroll desktop gate at `1440x900`, `1512x982`, and `1920x1080`.

## Readiness Update

The prior source-readiness triad was completed on 2026-05-16 for the 6-tab implementation pass. That evidence is now stale for the next relevance-first implementation because the intended source diff changes tab ids, section visibility, diagnostics access, and E2E assertions.

- Re-run GitNexus before editing source.
- Re-run code-review-graph against the intended analytics files.
- Re-run ChunkHound targeted searches for tab ids, panel registry, and secondary diagnostics.
- `DataLayout` is the main shared-risk symbol. Any implementation must keep analytics full-width/full-height behavior route-scoped unless a later pass intentionally updates its six non-analytics dashboard callers.
- The working tree already contains unrelated pricing, 3D lab, `AGENTS.md`, and `CLAUDE.md` changes. Do not revert or mix those into the analytics implementation.

## Document Index

| # | Document | Purpose | Implementation value |
|---|---|---|---|
| 01 | [PRD](./01-prd.md) | Requirements, acceptance criteria, constraints | Source of truth for what must be built |
| 02 | [Current State Audit](./02-current-state-audit.md) | Route, layout, data, and risk evidence | Prevents implementors from optimizing the wrong scroll container |
| 03 | [Data Visualization Matrix](./03-data-visualization-matrix.md) | Inventory of all 34 sections | Prevents accidental chart loss |
| 04 | [UX/UI Analysis](./04-ux-analysis.md) | Product and usability critique | Defines the density and tabbing rationale |
| 05 | [NPM Package Research](./05-npm-package-research.md) | Dependency decision record | Confirms no new chart package is needed |
| 06 | [Tab Architecture Proposal](./06-tab-architecture-proposal.md) | Resolved tab taxonomy and implementation shape | Tab model and sequencing input |
| 07 | [Git History & Evolution](./07-git-history-evolution.md) | Historical context | Explains why the surface accreted |
| 08 | [Scroll Depth Analysis](./08-scroll-depth-analysis.md) | Runtime and source-based scroll measurements | Defines viewport-fit budgets |
| 09 | [Component Inventory](./09-component-inventory.md) | File/component inventory and risk | Defines likely touchpoints and validation |
| 10 | [Implementation Blueprint](./10-implementation-blueprint.md) | Row budgets, source touchpoints, and acceptance checks | Primary source implementation brief |
| 11 | [Relevance-First Tab And Data Plan](./11-relevance-first-tab-and-data-plan.md) | Superseding product direction for tab UI and data trimming | Current source of truth for the next implementation |

## Non-Negotiables For Implementation

1. Do not keep the analytics dashboard in a `max-w-5xl mx-auto` centered body.
2. Do not solve this with a back-to-top button, table of contents, or sticky anchor nav. Those are scroll mitigations; the product direction is tabs.
3. Do not render all tab contents behind a client-only tab switcher. Only the active tab should fetch/render by default.
4. Do not show all 34 sections by default. Account for them, but move secondary diagnostics behind an intentional detail layer.
5. Keep source behavior out of this planning pass. Implementation belongs to a later approved execution run.
6. Prove desktop no-scroll at `1440x900`, `1512x982`, and `1920x1080`: `document`, `body`, dashboard `<main>`, and the active tab sheet must have no vertical scroll delta over `8px`.
7. The next implementation should follow [11 - Relevance-First Tab And Data Plan](./11-relevance-first-tab-and-data-plan.md) when it conflicts with earlier 6-tab/all-section language.

## Recommended Next Step

Use [11-relevance-first-tab-and-data-plan.md](./11-relevance-first-tab-and-data-plan.md) as the current implementation brief, with [10-implementation-blueprint.md](./10-implementation-blueprint.md) retained for the prior viewport-fit and source-readiness evidence. Rerun the triad if the commit changes, the implementation touches files outside the listed analytics scope, or `DataLayout` behavior becomes global rather than route-scoped.
