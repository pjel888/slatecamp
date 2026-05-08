# SlateCamp Landing Visual Correction — Research Pack

Date: 2026-05-08
Status: research/brief only
Implementation status: frozen

## Why this pack exists

The current landing redesign failed the intended art direction. It passed technical checks, but it did not pass Philip's visual/taste requirements.

The core failure was not only copy or QA. The landing became a familiar SaaS/edtech composition: a headline beside a framed 3D card, followed by more preview cards. That is specifically not the direction. The reference standard is high-end Three.js / interactive websites where the visual field behaves like an authored world, atmosphere, or spatial identity system.

## Non-negotiable freeze

No implementation changes are authorized by this pack. Do not edit source files from this research pass until Philip explicitly unfreezes implementation.

Allowed:
- research
- critique
- visual correction briefs
- product-truth audits
- copy direction
- acceptance criteria
- implementation planning documents

Not allowed:
- editing `src/`
- patching hero components
- changing landing sections
- adding new Three.js scenes
- changing copy in code
- running another redesign pass without explicit approval

## Documents in this pack

1. `01_FAILURE_ANALYSIS.md`
   - What went wrong with the current landing direction.
   - Why the hero card was unacceptable.
   - Why the problem extends beyond the hero.

2. `02_EXTERNAL_REFERENCE_RESEARCH.md`
   - Research from Awwwards, FWA/CSSDA-style references, Godly-style curated examples, and direct site inspection.
   - Specific reference patterns from high-end Three.js/WebGL sites.

3. `03_PRODUCT_TRUTH_AUDIT.md`
   - What the real SlateCamp dashboard, wiki, quiz, analytics, and 3D Lab actually do.
   - Which current marketing previews are fake/misaligned.
   - What the landing may truthfully reference.

4. `04_AUDIENCE_COPY_RESEARCH.md`
   - What Filipino architecture/ALE users care about.
   - Language to use and avoid.
   - Why SRS/active recall/quizzing jargon should not lead the marketing.

5. `05_VISUAL_CORRECTION_BRIEF.md`
   - The new non-cheesy art-direction brief.
   - Design principles, section rhythm, and acceptance criteria.
   - Explicit anti-patterns.

6. `06_NEXT_DESIGN_DECISION_CHECKLIST.md`
   - What must be decided before any implementation is allowed.
   - How to judge future concepts before code.

## Executive conclusion

The usable parts of the current direction are:

- the dotted/grid background language
- the background image/texture direction
- the idea of SlateCamp as an architecture knowledge atlas / resource field guide
- the copy insight that users want assurance, comfort, reliable knowledge, and a clearer next step

The failed parts are:

- the 3D hero inside a rounded card
- floating label pills and UI-card clutter
- fake preview modules that do not behave like the real app
- sections that look like generic SaaS feature blocks
- 3D being represented as a screenshot/mockup instead of a spatial experience
- copy that still sometimes describes mechanisms or aspirational product states instead of the user's felt problem

The correction must begin with taste, reference, and product truth — not code.
