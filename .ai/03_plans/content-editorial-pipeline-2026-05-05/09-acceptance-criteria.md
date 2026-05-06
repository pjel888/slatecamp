# Acceptance Criteria

## Phase 0 accepted when

- Existing active plan folders are archived, not deleted.
- This new plan folder exists and is indexed from `.ai/03_plans/README.md`.
- Readiness audit has exact counts from local files.
- Existing scripts and admin routes are mapped.

## Phase 1 accepted when

- Artifact schemas are documented.
- Fixture artifacts validate for at least 3 articles.
- Schema versioning is present in every artifact.

## Phase 2 accepted when

- Deterministic validators exist before any AI edit application.
- Validators catch unknown components, broken placeholders, unsupported fact changes, and malformed question edits.
- Tests exist for validator failure cases.

## Phase 3 accepted when

- AI analysis passes are read-only.
- Outputs are structured JSON.
- No article/question files are changed.
- Invalid model output is rejected.

## Phase 4 accepted when

- AI rewrite output is a proposal, not a direct full-file overwrite.
- Proposed fact changes are explicitly listed.
- Proposed new facts without sources are marked `source_needed`.
- Component proposals use only valid SlateCamp components.

## Phase 5 accepted when

- Approved local edits touch only `normalized.md`, `question-edits/`, and required derived metadata/hashes.
- `original.md` remains unchanged.
- `linked-questions.json` remains unchanged.
- `candidate.md` is generated, not hand-written.

## Phase 6 accepted when

- Fact-check report runs after local application.
- Pedagogy report runs after local application.
- High and critical items generate review packets.

## Phase 7 accepted when

- `/admin/ai-audit` shows pipeline run metadata.
- Pilot findings are visible in the admin audit surface.
- Admin review state can be tracked without publishing content.

## Phase 8 accepted when

- 20-article benchmark report exists.
- Unsupported new claims are zero.
- Component validity is 100%.
- MDX compile validity is 100%.
- Human editor acceptance is at least 85%.
- Scale/no-scale decision is documented.

## Completion definition

This plan pack is complete only when the 20-article pilot proves safety, accuracy, learning value, and operational feasibility. Full-corpus scale-up requires a separate execution plan after pilot acceptance.
