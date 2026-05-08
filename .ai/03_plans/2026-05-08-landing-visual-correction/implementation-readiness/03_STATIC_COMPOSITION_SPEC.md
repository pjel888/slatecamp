# 03 — Static Composition Specification

Date: 2026-05-08
Status: implementation input, no production code

Companion artifact: `static-composition/board2-static-composition.html`

## Purpose

This spec turns the approved Board 2-led direction into a concrete composition before production code.

The artifact is not a component implementation. It is a visual contract.

## Composition hierarchy

### Hero / `00 Orientation`

Priority order:

1. editorial headline
2. architecture atlas category
3. human support copy
4. primary CTA
5. quiet secondary link
6. atmospheric field
7. metadata/marginalia

The hero must not visually read as text-left plus right-side app visual. The type and field should share one full-width editorial plane.

### Desktop hero frame

- Full-bleed dark ink field.
- Dotted grid and quiet measured arcs behind type.
- Oversized headline occupying the central-left-to-middle visual mass.
- Marginal index lines at top/right/bottom, not floating pills.
- CTA below support copy, not duplicated elsewhere in the hero.
- Small source/boundary note below CTA area.
- Atmosphere is visible but subordinate.

### Mobile hero frame

- Same editorial idea, not a collapsed card.
- Remove most metadata/marginalia.
- Preserve eyebrow, headline, support, primary CTA, and one quiet secondary action.
- Atmosphere becomes a low-contrast field behind text.
- No horizontal overflow, clipped nav, or tiny unreadable coordinates.

## Section frames

### `01 / When review feels scattered`

Purpose: user recognition.

Design:

- editorial problem statement
- sparse student-language bullets
- side marginal note with the core insight: the problem is orientation, not laziness
- no cards as the dominant structure

### `02 / The atlas model`

Purpose: explain the product model.

Design:

- a route/coordinate system, not a dashboard mockup
- topic map feel with path lines and source/update metadata
- copy explains: find → understand → check → revisit

### `03 / Product paths`

Purpose: Board 3 proof.

Design:

- four horizontal or stepped path fields
- each path has a verb, a product noun, and a truth-safe caveat
- entries are not cards; they are atlas coordinates/section rows

Path copy:

- `A / Find` — open resources, related topics, and source notes where verified
- `B / Check` — practice what stayed and review missed topics where mappings exist
- `C / See` — use available visual tools and lab modules where access supports it
- `D / Revisit` — use readiness and weak-topic signals as study guidance

### `04 / Trust boundaries`

Purpose: legal safety and confidence.

Design:

- quiet editorial note
- boundary statements in compact lines
- no scary legal wall above the fold

Required ideas:

- supplementary learning resource
- not official
- no pass guarantee
- not primary instruction
- verify current requirements with primary authorities and qualified professionals

### `05 / Start`

Purpose: truthful conversion.

Design:

- same headline logic returns
- one primary CTA
- access/caveat microcopy where route requires signup

## Visual contract

Use:

- dark ink and white/near-white type
- cobalt as primary action/accent
- restrained gold/warning accent only for weak-topic/attention cues
- dotted grid, thin measured lines, coordinates
- editorial spacing and index numbers
- source/boundary metadata

Do not use:

- right-side 3D card
- rounded hero visual box
- fake dashboard screenshot
- feature-card hero
- heavy glassmorphism
- public Pokedex language
- public mechanism jargon
- official/pass-guarantee language

## Static artifact review notes

The HTML artifact intentionally includes:

- desktop frame
- mobile frame
- below-fold section frames
- copy selected for implementation
- no production imports or app routes
- no fake screenshots
- no claim that visual lab access is universally free

If the HTML artifact feels too dark, production can lighten lower sections, but hero must preserve editorial authority and category clarity.
