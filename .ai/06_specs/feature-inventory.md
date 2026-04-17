# Feature Inventory

**Last Updated:** 2026-04-17

## Core product features

- adaptive quiz and testing flows (`quiz-v2`, testing hub, sessions, debrief, simulations)
- wiki and article reading with taxonomy-linked content
- learner notes and study-writing surfaces
- analytics dashboards and readiness visualization
- 3D Lab and wall-configurator learning features
- camp trails, pods, score reveal, exam outcome, cram card, and flash flows
- admin content, question, taxonomy, review, search, pipeline, and preview tooling
- developer architecture, API, logs, DB, and test-data surfaces
- protected CEO analytics, financial, insight, and team views

## Current runtime anchors

- `src/components/`: `716` files
- `src/features/`: `551` files
- `src/lib/`: `396` files
- `src/lib/actions/`: `156` files
- `src/lib/queries/`: `19` files
- `src/hooks/`: `16` files
- `src/stores/`: `5` files

## Major feature modules

- `src/features/3d-lab/`
- `src/features/wall-configurator/`

## Mature vs fragile

| Surface | Maturity | Notes |
| --- | --- | --- |
| Quiz/testing | High | Deep action/store infrastructure |
| Wiki/content | High | Broad article/taxonomy tooling, with some fallback complexity |
| Admin CRUD | Medium-high | Broad but coordination-heavy |
| 3D Lab | Medium | High-value and performance-sensitive |
| Developer tools | Medium | Useful but operationally sensitive |
| CEO views | Medium | Smaller surface, still business-critical |

## Notes

- The main product surface is broad and mature enough that documentation drift is more dangerous than feature absence.
- `3d-lab` and admin authoring remain the highest-signal feature hotspots for future cleanup and verification.
