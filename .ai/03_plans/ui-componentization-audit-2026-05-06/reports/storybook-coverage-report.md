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
