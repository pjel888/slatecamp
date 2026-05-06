# Batch Implementation Log

## Batch 1: Auth error alert normalization

Date/time: 2026-05-06T17:24:32
Commit target: `refactor(ui): normalize auth error alerts`
Queue IDs: UIA-PUBLIC-0022, UIA-PUBLIC-0023

### What changed

- Added `src/components/auth/AuthErrorAlert.tsx`.
- Added `src/components/auth/AuthErrorAlert.stories.tsx` with default, OAuth callback failure, and long provider error states.
- Replaced duplicate inline destructive auth error divs in login/register forms with `AuthErrorAlert`.

### Validation

- `bun run lint`: passed with the same 10 baseline warnings.
- `bun run check:storybook`: passed, 101 story files scanned.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed; default heap baseline OOM was resolved by documented heap increase.
- `bun run type-check`: still fails only on pre-existing baseline error: `scripts/normalize-distractors.ts(15,20): Cannot find module 'openai'`. The new Storybook import error was fixed by changing to `@storybook/react`.
- Browser visual inspection: `/login?error=auth_callback_failed` showed the destructive alert with warning icon; `/register` loaded without console errors.

### Reviewer

Independent reviewer found no blockers. All recommendations were applied.

### Risk

Low. Auth OAuth behavior, callback handling, loading, and redirects were unchanged.

## Batch 2: PricingCard CTA normalization

Date/time: 2026-05-06T17:33:53
Queue ID: UIA-PUBLIC-0021

### What changed

- Migrated `PricingCard` CTA from raw `Link` classes to shared `Button asChild`.
- Added `src/components/marketing/PricingCard.stories.tsx`.
- Added a Storybook `next/font/google` mock and alias so real marketing components using Next font exports can render in Storybook.

### Validation

- `bun run lint`: passed with same 10 baseline warnings.
- `bun run check:storybook`: passed, 102 story files scanned.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed after adding the Storybook font mock.
- `bun run type-check`: blocked by the same pre-existing baseline missing `openai` module in `scripts/normalize-distractors.ts`.
- Storybook browser inspection: `marketing-pricingcard--highlighted-tier` showed full-width primary CTA button/link, no visible regression.

### Risk

Low. Link href/name semantics are preserved through `Button asChild`; focus styling improves. Pricing page live route currently shows free-access copy, so PricingCard visual verification was done in Storybook.
