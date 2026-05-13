# 01 - Goals and Intent Synthesis

## Executive Summary

The source documents share one intent: turn VizCode PH's visible product signal into a better SlateCamp-native 3D learning system. The goal is not to clone VizCode. The goal is to match the learner jobs VizCode proves are valuable, then exceed them with source-grounded 3D, board-exam practice, trust, and remediation.

## What the Source Folders Were Trying To Do

### VizCode comprehensive audit

The audit gathered a visible-surface map of VizCode PH: product pages, screenshots, public states, category panels, review modes, pricing/support surfaces, and public assets. Its intent was to answer: what does VizCode give LEA learners that SlateCamp must notice?

Important evidence:

- 532 planned public URLs captured, with no missing planned URLs in the consolidated pass.
- 233 canonical competitor topic/page surfaces after removing non-product/site/blog surfaces.
- Strong coverage signals across PD 1096, BP 344, BP 220/PD 957, RA 9514, GBC, code-library pages, and review-mode pages.
- Public signals for isolation, comparison, game/review, AI/QUBI, category navigation, pricing, community, correction/support, and media/visual explanations.

Boundary: the audit only proves visible product surface behavior. It does not prove backend logic, AI quality, private account flows, payment reliability, or legal accuracy.

### LI technical architecture plan

This folder planned LI as a second 3D Lab interaction mode beside the existing PI mode. Its intent was to add simpler educational modules without breaking existing parametric modules.

Durable decisions:

- Data-driven mode resolution.
- No new route.
- Optional `mode?: 'PI' | 'LI'` on registry entries.
- New `templateType: 'learning'`.
- Shared `LabViewportFrame`, `CanvasWrapper`, `ViewportShell`, camera controls, and module registry.
- Existing modules default to PI.
- No database migration for LI MVP.

### LI + VizCode competitive strategy plan

This folder converted competitive findings into a broader SlateCamp product strategy. Its key correction was that LI should not be a complex tabbed sub-mode system. LI should be hotspot-centered: students click meaningful locations on the 3D model to learn, compare, answer, and verify.

Durable decisions:

- Hotspots are primary.
- Layer toggles are secondary.
- Source cards are mandatory.
- PI handles "what if I change the value?"
- LI handles "what does this element mean and why does the code require it?"
- First LI modules: BP 344 ramp, BP 344 toilet, egress stair comparison.

## Canonical Product Intent

SlateCamp LI should become the board-exam learning layer of the 3D Lab:

- It teaches spatial concepts through 3D models.
- It attaches every code claim to a source card.
- It turns visual exploration into recall through quizzes.
- It routes weak quiz topics back to specific 3D hotspots.
- It gives students a calmer, simpler alternative to parametric controls.
- It gives content authors a reusable module format for source-grounded 3D lessons.

## Resolved Contradictions

| Conflict | Resolution |
| --- | --- |
| Early docs define six LI sub-mode tabs. | Superseded. Preserve learner jobs, not tabs. |
| Early PRD says hotspots/quizzes are deferred. | Revised. MVP should support at least info and quiz hotspot data contracts, while implementation can stage UI wiring safely. |
| Some docs frame BP 344 ramp as PI only. | It can exist in both modes with different learner jobs: PI for parametric compliance, LI for source-grounded explanation and recall. |
| Some docs suggest broad coverage view first. | Defer broad coverage view until P0 LI module loop is proven. Keep coverage as Phase 2 unless implementation capacity allows a read-only shell. |
| Some docs mention source-card authority but also use competitor coverage. | Competitor evidence is planning signal only. Student-facing claims require SlateCamp source packs. |

## Goals

1. Ship a small, excellent LI MVP inside 3D Lab.
2. Use LI to beat VizCode's static diagrams with source-grounded interactive 3D.
3. Preserve PI behavior, routes, and performance.
4. Establish a repeatable module authoring path.
5. Create clear UX for three hotspot types: info, quiz, comparison.
6. Connect LI to Wiki, quiz remediation, and future coverage maps through typed IDs.
7. Prevent unverified legal/code claims from reaching learners.

## Non-Goals

- Do not copy VizCode text, diagrams, media, or product language into SlateCamp.
- Do not rebuild the 3D Lab shell.
- Do not create a separate LI route or top-level nav item for MVP.
- Do not add database migrations for LI MVP unless implementation discovers an unavoidable need.
- Do not make AI/QUBI-style chat part of the first LI release.
- Do not launch GBC compliance modules until official GBC source cards exist.

## Success Definition

The plan is successful when a later implementation run can build and verify the first LI module without needing to reconcile conflicting source folders. The source folders become archive evidence, and this folder becomes the active implementation reference.
