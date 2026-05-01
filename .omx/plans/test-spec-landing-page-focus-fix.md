# Test Spec — Landing Page Focus Fix

## Static checks
- Search changed landing files for rejected strings: `Current waypoint`, `Pause motion`, `waypoint`, unnecessary `Play`/`Pause` button labels.
- Ensure components still type-check.

## Browser checks
- Start local dev server.
- Visit `/` at desktop and mobile sizes.
- Assert no rejected UI text is present.
- Assert there is one H1 and CTA is visible.
- Assert no horizontal overflow on mobile.
- Capture screenshots for evidence.

## Build checks
- `bun run type-check`
- `bun run lint`
- `bun run build`
- `git diff --check`
- `npx gitnexus detect-changes --repo slatecamp`
