# Landing interactive hero correction

## Task statement
User is dissatisfied with current SlateCamp landing page because the 3D background is not meaningfully interactive and product preview cards block the 3D view.

## Desired outcome
Improve the landing hero so the 3D scene is a visible, interactive feature-station canvas while keeping real SlateCamp product features visible and conversion-oriented.

## Known facts/evidence
- Current landing files are under `src/components/landing/`.
- Current hero shows `Know you'll win` and product cards, but screenshots show right-side preview cluster covers much of the scene.
- R3F Canvas currently has `pointerEvents: 'none'`, making it non-interactive.
- Required product features remain: Readiness Scores, Quizzing, 3D Modules, Learning Trails, Progress.
- Existing dependencies include `three`, `@react-three/fiber`, `@react-three/drei`.

## Constraints
- Preserve headline exactly: `Know you'll win`.
- Preserve SlateCamp brand tokens, logo, routes, ALE positioning.
- Do not turn the page into a game demo.
- Keep important content in HTML, not WebGL only.
- Maintain WebGL fallback and reduced-motion behavior.
- No new dependencies.

## Unknowns/open questions
- Whether a pure R3F mesh interaction or DOM-overlay hotspot layer is more robust. Use both if lightweight: clickable station meshes plus accessible DOM controls.

## Likely codebase touchpoints
- `src/components/landing/CampLandingPage.tsx`
- `src/components/landing/HeroCampScene.tsx`
- `src/components/landing/CampSceneCanvas.tsx`
- `src/components/marketing/MarketingNav.tsx` only if anchors need update.
