# Context Snapshot — Landing Hero “Know you'll win” Redesign

## Task statement
User remains dissatisfied with landing hero. Non-negotiable: hero headline is “Know you'll win”. User supplied voxel/isometric map references with bright low-poly terrain, water, city/island/map feel.

## Desired outcome
Rework SlateCamp landing above-the-fold to preserve the “Know you'll win” core promise and make the R3F voxel background feel closer to bright isometric terrain/city-map references while staying SlateCamp-specific, calm, premium, and performance-safe.

## Reference image observations
- Bright voxel terrain, not gloomy dark game map.
- Isometric high-angle composition.
- Gridded/stepped land parcels, waterways, trees, small built forms.
- Premium illustration feel: clear silhouettes, soft daylight, warm/cool balance, spacious map scale.
- Avoid player controls, waypoint cards, or unexplained interactive UI.

## Constraints
- Use Bun.
- Impact check before editing symbols.
- Follow SlateCamp design system and Next.js frontend guidance.
- No new dependencies.
- Verify with browser screenshots, type-check, lint, build, diff check, GitNexus detect-changes.

## Likely touchpoints
- src/components/landing/CampLandingPage.tsx
- src/components/landing/HeroCampScene.tsx
- src/components/landing/CampSceneCanvas.tsx
- maybe src/components/marketing/MarketingNav.tsx
