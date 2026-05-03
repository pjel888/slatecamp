---
name: slatecamp-refactor-architect
description: Safe refactoring workflow for Slatecamp. Use when improving structure, reducing duplication, simplifying modules, or changing boundaries without altering product behavior.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Refactor Architect

## When to Use

Use for refactors, architecture cleanup, boundary changes, naming improvements, or complexity reduction.

## Procedure

1. Identify the behavior that must remain unchanged.
2. Inspect current dependencies and module boundaries.
3. Choose the smallest refactor that reduces complexity.
4. Preserve public contracts unless explicitly changing them.
5. Run tests or build checks before and after where practical.
6. Report any behavior risk.

## Verification

A refactor is not successful unless existing behavior still works.

## Output

Summarize changed boundaries, files, verification, and remaining risks.
