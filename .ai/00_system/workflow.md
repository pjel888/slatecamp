# .ai Standard Workflow

**Last Updated:** 2026-04-17

## Default operational loop

```text
orientation → live scan → evidence capture → truth repair → state/audit update → plan or handoff → validation → demote superseded docs if needed
```

## Documentation-only loop

1. Read the canonical owner docs first.
2. Re-measure volatile counts from the live repo.
3. Refresh misleading active bridge docs before creating new summary layers.
4. Update current state, findings, or audit references when the truth surface changes.
5. Demote preserved historical docs if they still look operationally current.

## Implementation-approved loop

1. Use `.ai/00_system/` and scoped `AGENTS.md` files to orient.
2. Audit the live code/config/schema surface first.
3. Update plans and state before broad changes when the task requires it.
4. Validate with real commands from `VALIDATION_MATRIX.md`.
5. Reflect structural or workflow drift in docs before closing the task.

## Guardrails

- Freeze baseline scope before broad audits.
- New audit docs are deliverables, not new audit scope.
- Prefer evidence-backed demotion over “leave it because it’s historical.”
- Never invent commands, setup files, or validation entrypoints that do not exist.
