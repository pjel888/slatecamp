---
name: admin-flow-audit
description: Audit admin workflows, permissions, and operational fragility
---

Use when:
- the task touches `/admin` or admin workflows

Do not use when:
- the task is unrelated to admin routes or admin actions

Required inputs:
- admin area or workflow

Read first:
- `src/app/admin/AGENTS.md`
- `.ai/02_audits/ADMIN_SURFACE_AUDIT.md`
- `.ai/03_plans/ADMIN_SURFACE_PLAN.md`

Expected outputs:
- workflow map
- permission assumptions
- documentation gaps
- validation guidance

Evidence requirement:
- cite admin route files plus supporting `src/lib` or component dependencies
