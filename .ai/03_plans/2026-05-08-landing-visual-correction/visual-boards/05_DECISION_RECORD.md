# Decision Record — Visual Board Direction

Date: 2026-05-08
Status: decision note, no implementation

## Decision

Approve the **Board 2-led editorial atlas direction**.

The selected relationship is:

- **Board 2 leads** the hero, message, typography, section rhythm, and first-impression brand posture.
- **Board 1 supports** as atmospheric depth behind the editorial system: dotted grid, faint resolving points, measured arcs, slow parallax, and optional low-risk spatial motion.
- **Board 3 owns** the product-proof sections: Find / Check / See / Revisit, expressed as sectional path fields, not cards.

This reverses the prior Board 1-led recommendation. The correction is intentional.

## Why Board 2 leads

Board 2 is already SlateCamp's strongest brand continuity.

Across SlateCamp's other brand/planning documents, the established DNA is editorial and typographic:

- Syne-scale headlines
- DM Mono coordinates and eyebrows
- indexed/numbered sections
- dark ink hero fields
- dotted grid
- cobalt/gold accents
- architecture-publication tone

The landing should extend that system instead of introducing a new cinematic/WebGL-first register that may not match the dashboard or the rest of the product universe.

## Risk logic after the failed redesign

The previous failure was a tech-led hero swallowing the message: a 3D showpiece inside a card tried to do communication work and failed.

Board 1 can repeat that failure in a different costume if the atmospheric field becomes the protagonist. A WebGL-first hero can look like a foreign portfolio template and still fail to explain SlateCamp to an anxious 5th-year architecture student in five seconds.

Board 2 is the lower-volatility direction:

- works in static SSR
- fails gracefully if motion is reduced or WebGL is unavailable
- forces the page to commit to language first
- reads faster as a reliable field guide / architecture reference
- matches SlateCamp's current editorial universe

## Where Board 1 belongs

Do not discard Board 1. Demote it.

Board 1 becomes the atmospheric layer behind Board 2:

- dotted field
- faint resolving points
- slow parallax
- measured arcs
- architectural grid traces
- quiet depth behind the headline

The big editorial type is the spatial object. The atmospheric field is depth, not the protagonist.

Board 1 can graduate to lead only when the team can ship a Three.js scene at the level of the reference sites. That is a future capability threshold, not the default near-term direction.

## Where Board 3 belongs

Board 3 remains exactly where it belongs: middle-page product proof.

It explains the real product paths:

- **Find** — Wiki / atlas lookup
- **Check** — Practice
- **See** — visual tools where available
- **Revisit** — readiness and weak-topic signals

The 3D Lab entitlement caveat belongs here in copy. It should not be hidden in a card or overstated in the hero.

## Practical interpretation

Use this relationship:

> Board 2 is the voice and structure. Board 1 is the atmosphere. Board 3 is the proof.

Or more concretely:

- **Hero lead:** Board 2 editorial atlas index.
- **Hero background/depth:** Board 1 full-field atlas atmosphere.
- **Below-fold product explanation:** Board 3 product-truth paths.

## Headline decision still open

Before composition, decide whether the hero lands closer to:

- `Find where it fits.` — calmer, atlas/editorial, more brand-led.
- `Know what to revisit. Find it faster.` — more direct/utility-led.
- A combined direction: `Find where it fits. Know what to revisit.`

This headline choice affects the density and hierarchy of the editorial layer more than the board choice itself.

## Rejection rules

Reject any future mockup if:

- the hero becomes WebGL-first instead of message-first
- the field overwhelms the headline
- the hero has a rounded visual container
- the hero returns to text-left / 3D-card-right
- the 3D scene becomes a labelled product module
- fake dashboard/product screenshots appear as first impression
- product proof becomes bento cards
- copy leads with SRS, active recall, algorithms, or quizzing methods instead of assurance and clarity

## Implementation status

No implementation is authorized by this decision record. The next artifact should still be a static composition pass under `.ai/`, not production code.
