# UI Componentization Audit Plan — 2026-05-06

Status: PLANNING ONLY. No implementation has been authorized from this plan yet.

Goal: create a safe, testable, visually verified program to componentize repeated SlateCamp UI, increase usage of `src/components/ui`, expand primitives where real product needs are missing, update Storybook, and prevent regressions.

Primary plan: `implementation-plan.md`

Key blocker before implementation:
- Current branch observed: `redesign/quiz-mode-hub`
- Current worktree is dirty with many unrelated changes.
- Implementation should start only in a clean isolated branch/worktree unless Philip explicitly approves continuing on the dirty branch.

Core gates:
- Inventory first, no code changes.
- Small batches, no mechanical rewrites.
- Shared primitive edits isolated from domain migrations.
- Storybook updates required for touched primitives/patterns.
- Browser visual inspection required for affected routes/states.
- Typecheck/lint/tests required after every batch.

Files in this plan pack:
- `implementation-plan.md`
- `inventory-template.json`
- `agent-prompts.md`
- `route-visual-matrix.md`
- `validation-matrix.md`
- `UI_COMPONENTIZATION_STATE.json`
