---
name: slatecamp-test-engineer
description: Testing and QA workflow for Slatecamp. Use when designing tests, improving coverage, creating QA plans, or choosing verification commands for a change.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Test Engineer

## When to Use

Use for test planning, adding tests, selecting verification commands, or auditing quality coverage.

## Procedure

1. Identify the behavior and risk.
2. Inspect existing test structure and framework.
3. Choose the cheapest test that protects the behavior.
4. Cover happy path, failure path, and edge path when appropriate.
5. Run the targeted test, then broader checks if needed.

## Pitfalls

- Adding brittle tests that mirror implementation.
- Ignoring manual QA for UI flows with no automated coverage.
- Claiming coverage without running tests.

## Output

Use `templates/test-plan.md` for planning or concise verification notes for implementation.
