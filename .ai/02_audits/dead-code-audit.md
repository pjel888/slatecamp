# Dead Code Audit

## Confirmed dead candidates

Implementation note (2026-04-17):
- `L1-C001` completed
- `L1-C002` completed

### `L1-C001` — wiki wrapper alias files
- `src/components/wiki/blocks/AlertBox.tsx`
- `src/components/wiki/blocks/AuthorityContent.tsx`
- `src/components/wiki/blocks/WikiCallout.tsx`

Why confirmed:
- each file is only a thin re-export
- canonical implementations already live inside `src/components/wiki/blocks/Callout.tsx`
- wiki barrel exports point to `Callout`, not to these wrappers

### `L1-C002` — wiki `*Practice` alias files
- `src/components/wiki/widgets/bp344/RecallPractice.tsx`
- `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx`
- `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx`
- `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx`

Why confirmed:
- runtime widget registry imports only canonical `*Drill` components
- alias files are one-line forwards
- older repo audit history already identified them as duplicate aliases

## Likely dead candidates

Implementation note (2026-04-17):
- implemented from this section:
  - `L1-L003`
  - `L1-L004`
  - `L1-L005`
  - `L1-L006`
  - `L1-L008`
  - `L1-L007`
  - part of `L1-L010` (`src/data/patch.json`)
  - part of `L1-L010` (`src/data/sample-lots.ts`)
  - part of `L1-L010` (`src/data/mock-questions.json`)
  - part of `L1-L009` (`src/lib/readiness/churn.ts`, `src/lib/signals/compute.ts`)
  - part of `L1-L009` (`src/lib/outcomes/prepopulate.ts`, `src/lib/proof-simulation/gate.ts`)

- `L1-L003` — superseded quiz review files:
  - `src/components/quiz-v2/review/ReviewMode.tsx`
  - `src/components/quiz-v2/review/QuestionHistory.tsx`
- `L1-L004` — unused quiz mode picker:
  - `src/components/quiz-v2/setup/ModeSelector.tsx`
- `L1-L005` — duplicate/shared UI stragglers:
  - `src/components/score/skeletons/ScoreRingSkeleton.tsx`
  - `src/components/shared/content-sidebar.tsx`
  - `src/components/trail/TrailDayCard.tsx`
  - `src/components/trail/skeletons/TrailDayCardSkeleton.tsx`
- `L1-L006` — likely orphan shared hooks:
  - `src/hooks/useComplianceCheck.ts`
  - `src/hooks/useGuidedSequence.ts`
  - `src/hooks/useKeyboardShortcuts.ts`
  - `src/hooks/useQuizFocusManager.ts`
- `L1-L007` — low-blast-radius leaf helpers:
  - `src/lib/audio/feedbackSounds.ts`
  - `src/lib/constants/developer.ts`
  - `src/lib/hooks/useExperiment.ts`
  - `src/lib/hooks/useUserRole.ts`
  - `src/lib/quiz/offline/sync.ts`
  - `src/lib/quiz/should-interleave.ts`
- `L1-L008` — stale parallel wiki action namespace:
  - `src/lib/wiki/wiki-actions.ts`
- `L1-L009` — duplicated/stale business-logic helpers:
  - `src/lib/readiness/churn.ts`
  - `src/lib/signals/compute.ts`
  - `src/lib/outcomes/prepopulate.ts`
  - `src/lib/proof-simulation/gate.ts`
- `L1-L010` — ambiguous data stubs:
  - `src/data/patch.json`
  - `src/data/sample-lots.ts`
  - `src/data/mock-questions.json`

## Needs manual validation

- `L1-U011` — `src/components/wiki/blocks/PrequestionGate.tsx`
- `L1-U012` — `src/hooks/useDeviceSensors.ts`; `src/hooks/useGestureSignalCapture.ts`; `src/lib/signals/extractFeatures.ts`
- `L1-U013` — `src/types/module-blueprint.ts`; `src/types/supabase.ts`
- `L1-U014` — `src/data/seed/models_3d.json`; `src/data/seed/questions.json`; `src/data/seed/taxonomy.json`

## High-risk false-positive classes

- route files, handlers, metadata conventions
- story files and docs-only components
- registry-driven wiki and 3D widgets
- barrel `index.ts` files
- generated or external-contract types
- doc-linked seed assets and manual-ops data files

## Linked findings and plans

- findings: `CLN-001`, `CLN-002`
- plans: `../03_plans/legacy-removal-plan.md`, `../03_plans/cleanup-safety-validation-plan.md`
