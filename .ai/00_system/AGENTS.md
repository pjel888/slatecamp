<!-- Parent: ../../AGENTS.md -->

# .ai/00_system

## Scope

This file governs `.ai/00_system/`.

## Responsibility

This subtree is the policy, structure, and routing layer for `.ai`.
It defines where things belong; it should not become a dumping ground for operational state or deep feature docs.

## Edit rules

- Keep governance docs authoritative, concise, and aligned with live repo reality.
- When canonical routing changes, update `ai-folder-canonical-map.md` and related `.ai` guidance together.
- Do not introduce duplicate policy docs elsewhere if this subtree should own them.

## Dependencies

- `.ai/AGENTS.md`
- `.ai/README.md`
- `.ai/06_specs/`
- `.ai/06_specs/deep/`

## Anti-loop rule

- Generated audit artifacts do not recursively expand scope.
- Audit/planning runs stop at documentation and planning artifacts; remediation requires a later implementation-approved run.
