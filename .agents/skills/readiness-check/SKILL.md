---
name: readiness-check
description: Decide whether a surface is ready for implementation or release work
---

Use when:
- a surface needs a go/no-go readiness decision

Do not use when:
- the task is pure feature implementation without readiness framing

Required inputs:
- target surface

Read first:
- `.ai/00_system/VALIDATION_MATRIX.md`
- `.ai/10_state/current-state.md`
- `.ai/10_state/findings-register.md`

Expected outputs:
- readiness verdict
- blockers
- required validations
- next plan reference

Evidence requirement:
- cite commands, docs, and implementation files used for the verdict
