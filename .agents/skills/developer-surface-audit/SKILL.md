---
name: developer-surface-audit
description: Audit the /developer internal tooling surface for observability and truth quality
---

Use when:
- the task touches `/developer` or internal tooling/docs surfaces

Do not use when:
- the task is unrelated to internal tooling or developer docs

Required inputs:
- target `/developer` route or topic

Read first:
- `src/app/developer/AGENTS.md`
- `.ai/02_audits/DEVELOPER_SURFACE_AUDIT.md`
- `.ai/03_plans/DEVELOPER_SURFACE_PLAN.md`

Expected outputs:
- real vs mock/runtime distinction
- observability gaps
- documentation gaps
- next-step plan guidance

Evidence requirement:
- cite route files and the concrete data providers behind them
