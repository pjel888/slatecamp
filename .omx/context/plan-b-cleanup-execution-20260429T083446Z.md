# Plan B Cleanup Execution Context

**Timestamp:** 20260429T083446Z

## Task statement
Execute Plan B pre-launch cleanup for SlateCamp while preserving launch-critical learner/admin flows and not overwriting dirty-tree user work.

## Desired outcome
- Smaller canonical launch surface; legacy/stubbed/duplicate/non-launch surfaces removed or isolated.
- Documentation synchronized to post-cleanup codebase.
- Verification commands pass or failures documented with evidence.

## Known facts/evidence
- Prior docs/readiness audits documented 114 page routes, 13 API handlers, 27 features, 76 schema tables, 92 migrations, 89 test/spec files, 106 Storybook stories.
- Recommended cleanup path is Plan B.
- Current repo has pre-existing dirty source changes; must document before source edits and avoid overwriting user work.

## Constraints
- Do not commit.
- Do not reset/stash/discard dirty work.
- Do not expose secrets.
- Do not destructively remove DB schema/migrations without explicit safe evidence.
- Use Bun scripts and verify.

## Unknowns/open questions
- Exact ownership/provenance of existing dirty source changes.
- Whether payment/AI are launch scope; default is defer from public launch unless clearly required.

## Likely codebase touchpoints
- README.md, .ai/* current docs, route shims, nav constants, LemonSqueezy/payment docs/code, 3D compatibility shims, Storybook-only primitives, tests referencing removed routes.
