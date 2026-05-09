# SlateCamp Landing Visual Correction Boards

Date: 2026-05-08
Status: non-production visual direction boards only
Implementation status: frozen

## Purpose

These boards translate the correction research into concrete design directions that Philip can accept, reject, or combine before any production implementation begins.

These are not production specs. They are taste gates.

## Hard constraints for every board

- No 3D hero inside a rounded card.
- No right-side SaaS/product module as the hero.
- No fake dashboard/product screenshot as first impression.
- No floating pill-label cluster around a 3D object.
- No bento-grid feature tour as the main page rhythm.
- No SRS/active-recall/quizzing-method copy in the hero.
- No public "world-class" claim.
- No primary-review-center positioning.
- Preserve the strongest current visual DNA only where useful: dotted grid and atmospheric background texture.

## Boards included

1. `01_BOARD_FULL_FIELD_ATLAS.md`
   - Atmospheric support layer if paired behind Board 2.
   - Full-viewport atmospheric field; no product UI in hero.
   - Not the approved lead direction after the Board 2 decision.

2. `02_BOARD_EDITORIAL_ATLAS_INDEX.md`
   - Approved lead direction.
   - Stronger publication/editorial direction.
   - More typography-led and less dependent on heavy 3D.
   - Best near-term path for premium, restrained, performance-safe execution.

3. `03_BOARD_PRODUCT_TRUTH_PATHS.md`
   - Real product-path page system.
   - Strongest for legal/product accuracy.
   - Best as downstream section strategy, not necessarily hero identity.

4. `04_COMPARISON_AND_RECOMMENDATION.md`
   - Scoring, trade-offs, and recommended path.

5. `visual-board.html`
   - Static non-production HTML/SVG comparison board.
   - Meant for quick visual comparison in browser; not a production component.

## Approved high-level path

Use the **Board 2-led editorial atlas direction**.

In short:

- Hero lead / message / typography: Board 2
- Hero atmospheric depth: Board 1
- Product proof: Board 3

Board 1 is not discarded; it is demoted to the background spatial layer behind Board 2's editorial system. Read `05_DECISION_RECORD.md` before any composition or implementation work. Do not implement until Philip explicitly authorizes production changes.
