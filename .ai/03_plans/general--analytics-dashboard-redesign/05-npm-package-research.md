# 05 — Dependency Decision Record

> **Decision date**: 2026-05-16
> **Scope**: analytics dashboard redesign dependencies
> **Decision**: Do not add a new charting package for the tab redesign.

## Current State

SlateCamp already uses Recharts for the analytics chart surface, plus custom SVG/HTML components for calendar heatmaps, cards, forms, and specialized panels. The redesign is a layout and information-architecture change, not a chart-engine migration.

Relevant installed packages:

| Package | Current role |
|---|---|
| `recharts` | Existing chart rendering library |
| `framer-motion` | Already available for motion, but not required for MVP tabbing |
| Tailwind/shadcn primitives | Existing UI/layout foundation |

## Decision

Use existing chart components and existing dependencies.

Do not add ECharts, Nivo, Visx, Chart.js, Tremor, Plotly, Highcharts, or another charting library as part of this redesign.

## Rationale

- The user pain is caused by tab taxonomy, vertical stacking, and constrained dashboard width.
- Replacing the chart engine would not solve the scroll/container problem.
- Adding a second charting stack would increase bundle, testing, and styling burden.
- Existing section/chart boundaries already isolate data fetching from client rendering.
- The MVP needs fewer layout risks, not a visualization migration.

## Allowed Use Of Existing Motion

Tab transitions may use existing CSS transitions or `framer-motion` only if they do not delay interaction and respect reduced-motion preferences. Motion is polish, not a core acceptance criterion.

## Future Research Trigger

Revisit chart dependencies only if a later chart-specific refactor proves that custom heatmaps, treemaps, or large datasets are materially blocking performance or maintainability. That should be a separate dependency evaluation with current npm/license/security evidence.

## Implementation Guardrail

Any implementation PR for this planning package should show `package.json` unchanged unless the user explicitly approves a dependency change.
