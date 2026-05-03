# Testing and QA Strategy

## Testing principle

Tests should protect behavior, not implementation trivia. Add or adjust tests where the change creates real regression risk.

## Test selection

- Logic change: unit test.
- API/data change: integration test or contract test.
- UI behavior: component or end-to-end test.
- Auth/security: negative-path tests.
- Migration/data model: migration rehearsal or rollback plan.

## Minimum QA for any feature

1. Happy path.
2. Empty/loading/error states.
3. Invalid input.
4. Permission boundary if applicable.
5. Mobile/responsive behavior if UI-facing.
6. Regression check for adjacent flow.

## When tests are missing

Do not fake confidence. State what was manually checked and recommend the smallest useful test to add.
