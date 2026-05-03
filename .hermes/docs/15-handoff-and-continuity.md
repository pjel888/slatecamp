# Handoff and Continuity

Use this file when ending a long session or preparing another agent to continue.

## Handoff content

- Goal of the session.
- Files inspected.
- Files changed.
- Commands run and results.
- Key decisions.
- Current risks.
- Exact next step.

## Good handoff example

```text
Goal: Implement X.
Inspected: paths...
Changed: paths...
Verified: command => pass/fail.
Risk: Y remains untested because Z.
Next: Add test for A, then run B.
```

## Rule

A handoff should let another agent resume without re-discovering obvious facts, but it should not hide uncertainty.
