# Board Comparison and Recommendation

Status: visual decision support, no implementation

## Quick comparison

### Board 1 — Full-Field Atlas

Best for:

- correcting the failed carded hero
- matching high-end Three.js reference behavior
- giving SlateCamp a memorable first impression
- preserving the dotted/atmospheric background direction

Weakness:

- needs taste-sensitive implementation
- can become an empty tech demo if copy/category clarity is weak

Verdict:

- Best atmospheric depth layer, not the approved lead direction.

### Board 2 — Editorial Atlas Index

Best for:

- mature architecture/publication tone
- lower implementation risk
- strong section rhythm
- avoiding cheesy 3D spectacle

Weakness:

- may feel too dry if the atmosphere is not strong
- less obviously Three.js/world-class-interactive

Verdict:

- Approved lead direction: best hero communication, section rhythm, and typography system.

### Board 3 — Product-Truth Paths

Best for:

- accurate product explanation
- legal/trust safety
- reflecting the real dashboard/wiki/quiz/3D Lab
- preventing fake UI claims

Weakness:

- not strong enough as the primary visual identity
- can regress into cards if mishandled

Verdict:

- Best product-proof layer after the hero.

## Approved combined direction

Use the **Board 2-led editorial atlas direction**.

The practical relationship is:

> Board 2 is the voice and structure. Board 1 is the atmosphere. Board 3 is the proof.

### Hero / first impression

Use Board 2 as the lead.

- Oversized Syne/editorial headline as the primary spatial object.
- DM Mono coordinates, eyebrows, section numbers, and marginal metadata.
- Dark ink hero field with dotted grid, cobalt/gold accents, and architecture-publication restraint.
- Category clarity must land in five seconds.
- Static SSR/reduced-motion state must still feel complete.

### Hero atmospheric depth

Use Board 1 only as support.

- Dotted field and background texture survive.
- Faint resolving points, measured arcs, and slow parallax may sit behind the typography.
- No WebGL-first spectacle.
- No carded 3D module.
- No right-side product frame.
- The field is depth, not the protagonist.

### Product proof

Use Board 3.

- Product paths based on actual app behavior.
- No fake screenshots as proof.
- Entitlement/access caveats for 3D Lab.
- Readiness/analytics framed as signals, not guarantees.
- Sectional path fields only; no bento/card regression.

## Why this combination is strongest

It separates the jobs correctly:

- Board 2 preserves SlateCamp's existing editorial brand DNA and forces message-first communication.
- Board 1 gives the page atmosphere without letting WebGL swallow the message.
- Board 3 keeps claims honest and useful.

The previous failure happened because one visual device — carded product preview — tried to do everything. The corrected direction makes typography the lead, atmosphere the support, and product truth the proof.

## Decision status

Approved direction:

1. **B — Board 2-led editorial atlas direction**
   - Hero lead / message / typography: Board 2.
   - Hero atmospheric depth: Board 1.
   - Product proof: Board 3.

Rejected as lead directions:

2. **A — Board 1-led direction**
   - More memorable only if executed at reference-site level.
   - Too taste-sensitive after the failed redesign.
   - Retained as background/depth support.

3. **C — Board 3 alone**
   - Product-accurate but not a sufficient visual identity.

## Rejection rules for all future mockups

Reject immediately if:

- the hero has a rounded visual container
- the hero is split into text-left / 3D-card-right
- the 3D scene is a labelled product module
- the first section after hero is a generic feature-card grid
- product screenshots are fake or misleading
- copy leads with study methods instead of user assurance
- the 3D Lab is described as fully/free available without entitlement accuracy

## Proposed next non-code artifact

If Philip approves the recommended path, the next artifact should be a static composition pass:

- desktop hero frame
- mobile hero frame
- one below-fold problem section
- one product-path section
- one trust/boundary section

This can be HTML/SVG under `.ai/`, still not production code.
