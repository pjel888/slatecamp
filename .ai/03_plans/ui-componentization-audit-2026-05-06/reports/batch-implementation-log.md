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

## Batch 3: Mobile sidebar controls normalization

Date/time: 2026-05-06T18:17:42
Queue IDs: UIA-DSS-0003, UIA-DSS-0004

### What changed

- Migrated `MobileTopBar` hamburger raw button to shared `Button` icon primitive.
- Migrated `MobileDrawer` close raw button to shared `Button` icon primitive.
- Added `MobileTopBar` and `MobileDrawer` Storybook stories.
- Added Storybook-only `@/lib/actions/quiz-v2` mock/alias so the drawer story does not bundle server actions through the quiz store.

### Validation

- `bun run lint`: passed with same 10 baseline warnings.
- `bun run check:storybook`: passed, 104 story files scanned.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.
- `bun run type-check`: blocked by same pre-existing missing `openai` module in `scripts/normalize-distractors.ts`.
- Playwright mobile screenshots captured at 390×844 for topbar and drawer stories.
- Vision inspection passed for both screenshots.

### Risk

Low. The Storybook quiz-v2 action alias is intentionally broad within Storybook; it should be maintained as additional quiz-v2 action exports are needed by stories.

## Batch 4: Developer EndpointCard Button migration

Date/time: 2026-05-06T18:28:55
Queue ID: UIA-DEV-0005

### What changed

- Moved `EndpointCard` implementation to `src/components/developer/EndpointCard.tsx` so Storybook and the developer route share the same component without restricted app-internal imports.
- Updated `/developer/api-reference` to import `@/components/developer/EndpointCard`.
- Kept a compatibility re-export at `src/app/developer/_components/EndpointCard.tsx`.
- Migrated the expandable row trigger from raw `<button>` to shared `Button` with `type="button"`, `variant="ghost"`, and preserved compact row spacing.
- Added `src/components/developer/EndpointCard.stories.tsx`.

### Validation

- `bun run lint`: passed with same 10 baseline warnings.
- `bun run check:storybook`: passed, 105 story files scanned.
- `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`: passed.
- `bun run type-check`: blocked by same pre-existing missing `openai` module in `scripts/normalize-distractors.ts`.
- Playwright screenshot inspection covered collapsed and expanded states.

### Risk

Low. Moving the component into `src/components/developer` improves Storybook compatibility and avoids a restricted import, but route import path changed. Existing app-internal path remains as a compatibility re-export.
