# SlateCamp landing restore: three-card hero

## Task statement
Restore the preferred SlateCamp landing hero direction after the latest full-width 3D-only redesign was rejected.

## Desired outcome
- Hero headline remains exactly: `Know you'll win`.
- Desktop hero returns to a left copy / right product preview composition.
- The right side shows exactly three visible product feature cards: Readiness Score, Quiz Checkpoint, and Interactive 3D Module.
- The 3D scene remains present, light, frosted, and interactive, but no longer dominates the whole page or pushes product UI out of view.
- Keep the current light/white/happy direction and frosted white navbar from recent user feedback.

## Known facts/evidence
- Current route is `src/app/page.tsx`; it renders `LandingPageContent` with `LandingPageFallback` in Suspense.
- Landing implementation lives in `src/components/landing/CampLandingPage.tsx`, `HeroCampScene.tsx`, and `CampSceneCanvas.tsx`.
- `src/components/landing/AGENTS.md` requires preserving WebGL fallback, reduced motion, client/server boundaries, mobile DPR caps, ALE-canonical copy, and browser viewport checks for 3D hero layout changes.
- Previous screenshot evidence for the preferred direction exists at `.omx/artifacts/landing-audit/feature-redesign-desktop.png`.
- User specifically requested the version with three cards on the right and the tagline `know youll win`.

## Constraints
- Use Bun for validation.
- Do not revert unrelated app functionality.
- Preserve SEO metadata and auth/CTA routes.
- Do not reintroduce dark navbar or dark left gradient.
- Product features must remain visible and credible.

## Unknowns/open questions
- The exact historical commit is not identified; restore by matching the described UX structure rather than doing a broad git reset.

## Likely codebase touchpoints
- `src/components/landing/CampLandingPage.tsx`
- `src/components/landing/CampSceneCanvas.tsx`
- Optional visual verification artifacts under `.omx/artifacts/landing-audit/`
