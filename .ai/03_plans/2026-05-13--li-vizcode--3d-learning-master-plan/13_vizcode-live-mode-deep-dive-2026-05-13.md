# 13 - VizCode Live Mode Deep Dive

Date: 2026-05-13
Status: active competitive research addendum

## Purpose

Study VizCode's public mode architecture more carefully and translate the learner jobs into SlateCamp-native product decisions. This addendum updates the consolidated plan with live website evidence gathered after the 2026-05-08 audit pack.

## Evidence Used

Live public pages checked:

- `https://vizcodeph.com/`
- `https://vizcodeph.com/review-modes/`
- `https://vizcodeph.com/how-it-works/`
- `https://vizcodeph.com/code-library/`
- `https://vizcodeph.com/frequently-asked-questions/`
- `https://vizcodeph.com/about-us/`

Archived rendered-state evidence checked:

- `13_all_product_url_surface_capture/states/surface-004-review-modes-tab-isolation-mode__3f3ed7fe.json`
- `13_all_product_url_surface_capture/states/surface-005-review-modes-tab-comparative-mode__6b12c5ac.json`
- `13_all_product_url_surface_capture/states/surface-006-review-modes-tab-game-mode__48d3de7c.json`
- `13_all_product_url_surface_capture/states/surface-033-bp-220-pd-957-ratio-between-saleable-and-none-saleable-lots-gamemode-on__c0773545.json`
- `13_all_product_url_surface_capture/screenshots/surface-033-bp-220-pd-957-ratio-between-saleable-and-none-saleable-lots-gamemode-on__c0773545.png`
- `13_all_product_url_surface_capture/screenshots/surface-255-comparison__cc0e1b0a.png`
- `13_all_product_url_surface_capture/screenshots/surface-248-bp-344-wheelchair-gamemode-on__71db8ac2.png`

Boundary: no login, checkout, Discord join, AI prompt, private content mutation, or protected answer-quality testing was performed in this addendum.

## Updated Interpretation

VizCode's competitive advantage is not any one mode. It is the combination of:

- a wide code-topic atlas,
- public/free code library entry,
- paid visual modes,
- side-by-side comparison,
- quiz layer,
- AI/QUBI promise,
- partner/topnotcher/community proof,
- low-price duration plans.

SlateCamp should not answer this with a clone. SlateCamp should answer by making every interaction measurably better for LEA preparation: spatial, source-cited, board-style, adaptive, and remediation-linked.

## Mode Breakdown

### Code Library

What VizCode appears to do:

- Free access to digitized reference text by code family.
- Main families: PD 1096, RA 9514, BP 344, BP 220, PD 957, and Philippine Green Building Code.
- The library works as an acquisition and trust layer before paid modes.

Why it works:

- It lets students believe there is a complete code universe behind the paywall.
- It creates a low-friction reason to revisit the site.

SlateCamp response:

- Improve, not copy.
- Public or free sample pages should combine official source card, board relevance, one visual explanation, one sample drill, and a clear correction/update policy.
- The paid value should be live readiness, 3D interaction, remediation, and guided pathing, not raw access to code text.

### Isolation Mode

What VizCode appears to do:

- Focuses the learner on one topic or code family.
- Review Modes page exposes code-family entries for PD 1096, RA 9514, BP 344, BP 220, PD 957, and GBC.
- In rendered captured states, topic pages have a category/sidebar panel and a right-side topic/variation list.
- It is primarily a focused visual-review surface, not an adaptive learning system.

Why it works:

- It reduces overwhelm.
- It lets students drill one weak code family.
- It makes the diagram feel less like a PDF and more like a navigable atlas.

Weakness:

- The student still has to decide what to study next.
- Source trust and interpretation boundaries are not the center of the UI.
- The mode can still be static if the diagram is only viewed, not manipulated.

SlateCamp response:

- Replace the mode label with Focus Path inside LI.
- Use source-backed info hotspots, progressive disclosure, and optional layer toggles.
- Default entry should come from the student's weak topic, not a generic list.

Acceptance target:

- A student arrives from a weak quiz/taxonomy node and sees exactly 3-6 relevant hotspots, not an entire code family.

### Comparative Mode

What VizCode appears to do:

- Presents multiple standards side by side.
- The public page describes fast cross-referencing across standards.
- Captured examples show a multi-column comparison layout, including all-code columns and BP 220 versus PD 957 comparison variants.
- Their how-it-works page explains that empty baseplates mean no provision is stated for that section.

Why it works:

- LEA candidates confuse similar provisions across PD 1096, RA 9514, BP 344, BP 220, and PD 957.
- Side-by-side visual memory is powerful for board recall.

Weakness:

- Empty states can be ambiguous unless the learner understands what absence means.
- Side-by-side panels can become too wide and passive.
- It helps recognition, but not necessarily rule application.

SlateCamp response:

- Improve with Comparison Hotspots first.
- Use side-by-side viewport only after the simpler comparison hotspot pattern proves useful.
- Every row/value must carry source-card IDs and an explicit "no provision found in this source" state where applicable.

Acceptance target:

- A comparison hotspot answers: "Which law applies here, what is the value, what is the trap, and what board-style mistake would I make?"

### Game Mode

What VizCode appears to do:

- It is a quiz/active-recall layer, not a separate game world.
- Review Modes links use `gameMode=on` query states.
- Captured pages show multiple-choice answer buttons and a `Check` action over the same visual/comparison content.
- FAQ positions it as competitive, time-bound, pressure-based recall with points.
- Public testimonials mention using Game Mode for recalling reviewed code topics.

Why it works:

- Passive diagrams become active recall.
- It gives a quick "do I know this?" loop.
- It is easy to understand commercially: visuals plus quizzes.

Weakness:

- Answer quality, explanation depth, scoring, and remediation path were not validated.
- A button quiz on a static diagram does not force spatial reasoning.
- If feedback is shallow, it becomes memorization rather than mastery.

SlateCamp response:

- Improve as Board Drill and Mistake Hunt hotspot states.
- Wrong answers must route to the exact source card, info hotspot, and short repair drill.
- Add a timed mode later, but do not make speed the first value proposition.
- Score the concept, not only the click.

Acceptance target:

- Every quiz hotspot has: prompt, choices, correct answer, rationale, source card, related info hotspot, misconception tag, and next repair action.

## Competitive Threat Ranking

| Threat | Severity | Why it matters | SlateCamp response |
| --- | --- | --- | --- |
| Visual code atlas breadth | High | They already look comprehensive. | Build coverage matrix, but launch fewer deeper modules. |
| Game Mode active recall | High | Easy to market and easy for students to feel value. | Board Drill + Mistake Hunt with source-cited repair. |
| Comparative Mode | High | Solves real cross-code confusion. | Comparison hotspots with no-provision states and board traps. |
| Partner/topnotcher proof | High | Social proof reduces purchase anxiety. | Build source/trust authority plus passer outcomes over time. |
| QUBI/AI positioning | Medium | Strong promise, but quality unknown. | Defer until source-card guardrails exist; then be safer. |
| Low-price plans | Medium | Accessible to students. | Keep SlateCamp value tied to readiness engine, not content access alone. |

## Must-Win Product Moves

### P0: Beat Game Mode With Repair

Build the first LI quiz loop so that it does more than check an answer:

1. Student clicks quiz hotspot.
2. Student answers.
3. If wrong, UI identifies the misconception.
4. UI highlights the related 3D region.
5. UI opens the source card.
6. Student completes a one-question repair drill.

This is the core way to beat VizCode's game layer.

### P0: Beat Isolation Mode With Weak-Topic Entry

Do not make students browse a library first. Open the relevant LI module from:

- taxonomy heatmap,
- missed quiz question,
- Camp Trail recommendation,
- search result,
- Wiki/source card.

The mode should feel like "SlateCamp brought me exactly where I was weak."

### P1: Beat Comparative Mode With Source-Grounded Traps

Comparison should not be just columns. The SlateCamp version should explicitly name:

- applicable source,
- non-applicable source,
- exact locator,
- board-style confusion,
- memory anchor,
- practice question.

### P1: Beat Static Diagrams With Parametric 3D

Where VizCode shows a fixed value, SlateCamp should let the student manipulate dimensions or toggle compliant/non-compliant states when the code concept benefits from spatial inspection.

## Plan Changes

This addendum strengthens the existing plan in these ways:

- Treat Board Drill and Mistake Hunt as the primary competitive response to Game Mode.
- Treat weak-topic deep links as the primary competitive response to Isolation Mode.
- Treat comparison hotspots with explicit no-provision states as the primary competitive response to Comparative Mode.
- Keep the earlier decision: no separate mode tabs for LI MVP.
- Keep the earlier decision: source cards before AI.

## Implementation Implications

Add or preserve these requirements in the LI implementation run:

- `hotspotType: "info" | "quiz" | "comparison"`
- misconception tags on quiz choices,
- `relatedHotspotIds` for repair routing,
- `sourceCardIds` on all legal/code claims,
- deep links to `?hotspot=...&source=weak-topic`,
- explicit no-provision state for comparison rows,
- progress events for `viewed_hotspot`, `answered_hotspot_quiz`, `completed_repair_drill`, and `opened_source_card`.

## Stop Rules

- Do not copy VizCode naming, diagrams, text, or visual assets.
- Do not claim parity with Game Mode until SlateCamp has answer feedback and repair routing.
- Do not claim superiority to Comparative Mode until no-provision states and source-card-backed comparison rows exist.
- Do not build AI/QUBI response before source cards, uncertainty labels, and citation policy are implemented.
