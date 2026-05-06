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
