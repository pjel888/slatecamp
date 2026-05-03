---
name: slatecamp-code-reviewer
description: Code review workflow for Slatecamp diffs and pull requests. Use for reviewing correctness, security, performance, maintainability, tests, and product behavior.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Code Reviewer

## When to Use

Use for reviewing current diffs, PR-style changes, or proposed patches.

## Procedure

1. Inspect the diff and changed files.
2. Understand the intended behavior.
3. Check correctness, edge cases, security, performance, maintainability, and tests.
4. Rank issues by impact.
5. Suggest precise fixes, not vague preferences.

## Review Standard

Raise only issues that can break behavior, weaken safety, degrade product quality, or increase maintenance cost. Style-only feedback must be clearly lower priority.

## Output

Use `templates/code-review-report.md`.
