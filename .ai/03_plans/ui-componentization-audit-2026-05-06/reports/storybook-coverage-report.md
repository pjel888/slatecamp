# Storybook Coverage Report

## Batch 1

Added:

- `src/components/auth/AuthErrorAlert.stories.tsx`

Covered states:

- Default auth error
- OAuth callback failure
- Long provider error copy

Validation:

- `bun run check:storybook`: passed.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.

## Batch 2

Added:

- `src/components/marketing/PricingCard.stories.tsx`
- `src/storybook/mocks/next-font-google.ts` plus `.storybook/main.ts` alias

Covered states:

- Free tier
- Highlighted tier
- Enterprise/contact-sales tier

Validation:

- `bun run check:storybook`: passed, 102 stories.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.

Known caveat:

- Storybook font mock maps Next font exports to `font-serif`; this is sufficient for component rendering but not exact font metrics.

## Batch 3

Added:

- `src/components/sidebar/MobileTopBar.stories.tsx`
- `src/components/sidebar/MobileDrawer.stories.tsx`
- `src/storybook/mocks/quiz-v2-actions.ts` plus `.storybook/main.ts` alias

Covered states:

- Mobile top bar default
- Mobile drawer open
- Mobile drawer closed/offscreen state

Validation:

- `bun run check:storybook`: passed, 104 stories.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.
- Runtime Playwright screenshots passed after adding the quiz-v2 server-action Storybook mock.

## Batch 4

Added:

- `src/components/developer/EndpointCard.stories.tsx`

Covered states:

- Expandable endpoint card
- Static endpoint card

Validation:

- `bun run check:storybook`: passed, 105 stories.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.
- Runtime Playwright screenshots passed for collapsed and expanded states.

## Batch 5

Added:

- `src/components/dashboard/ModeCard.stories.tsx`

Covered states:

- Default
- Active session
- Disabled

Validation:

- `bun run check:storybook`: passed.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.

## Batch 6

Added:

- `src/components/admin/AssetList.stories.tsx`

Covered states:

- Default asset grid
- Empty asset grid

Validation:

- `bun run check:storybook`: passed.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.
