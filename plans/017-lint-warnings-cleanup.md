# Plan 017 — Clean up the 11 baseline lint warnings

> Audit: 2026-07-20, commit `064e3a43a`. Category: DX. Severity: LOW. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Baseline was 11 warnings / 0 errors; final state is 0 problems.

## Why this mattered

Lint passed (0 errors), but 11 warnings is noise that hides real issues over time. Most were unused-variable warnings — quick mechanical deletes. One was a `next/image` opportunity flagged in a wiki quiz modal.

## What was changed

- `src/app/dashboard/camptrails/[slug]/page.tsx`: removed dead `INTENSITY_LABELS` constant and unused `totalSteps` local (verified zero callers via grep).
- `src/components/layout/HeaderHero.tsx`: removed unused `accentTextMap` constant, removed `category`/`categoryIcon`/`accentText` from the destructure (the props stay on the interface — reserved for the commented category chip).
- `src/components/wiki/article/WikiLearningJourney.tsx`: removed unused `subject`/`difficulty`/`readTime` from the destructure.
- `src/lib/actions/analytics-data.ts`: removed unused `createClient` from the import.
- `src/components/wiki/quiz/WikiQuizModal.tsx:453`: kept `<img>` (question images may be data: URLs or from hosts not in `images.remotePatterns`; modal context doesn't benefit from `next/image`) but added a scoped `// eslint-disable-next-line @next/next/no-img-element` with explanatory comment.
- `eslint.config.mjs`: added `coverage/**` to `globalIgnores` (generated test coverage output, not source — was emitting an "Unused eslint-disable directive" warning).

## Verification

- `bun run lint` — exit 0, **0 problems** (down from 11 warnings). No rule was relaxed to clear warnings.
- `bun run type-check` — exit 0.

## Maintenance note

The durable rule: 0 warnings is the target. CI runs lint (after Plan 016), so any new warning fails the build.
