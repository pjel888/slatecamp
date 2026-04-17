---
name: docs-sync
description: Keep docs and AGENTS aligned with structure/workflow changes
---

Use when:
- structure, ownership, workflow, or canonical references change

Do not use when:
- no documentation-facing contract changed

Required inputs:
- changed scope
- affected canonical docs

Read first:
- `.ai/00_system/DOCS_SOURCE_OF_TRUTH.md`
- `.ai/03_plans/DOCS_AND_AGENTS_HARDENING_PLAN.md`

Expected outputs:
- updated canonical docs
- updated local AGENTS where needed
- note of preserved historical docs if superseded

Evidence requirement:
- list updated docs and the live paths that triggered the sync
