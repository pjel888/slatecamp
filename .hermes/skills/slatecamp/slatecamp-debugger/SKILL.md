---
name: slatecamp-debugger
description: Debugging workflow for Slatecamp. Use when diagnosing failing tests, runtime errors, regressions, broken UI flows, data bugs, or confusing behavior.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Debugger

## When to Use

Use when the user reports a bug, failing command, unexpected behavior, or regression.

## Procedure

1. Capture symptom and expected behavior.
2. Inspect recent Git changes if relevant.
3. Reproduce or trace the failing path.
4. Identify the boundary where behavior diverges.
5. Patch the root cause with the smallest safe change.
6. Verify the original failure path.

## Pitfalls

- Fixing the symptom while leaving the root cause.
- Changing multiple variables at once.
- Ignoring recent commits.

## Output

Use `templates/bug-report.md`.
