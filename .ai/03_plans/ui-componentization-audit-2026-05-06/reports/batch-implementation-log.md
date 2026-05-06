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
