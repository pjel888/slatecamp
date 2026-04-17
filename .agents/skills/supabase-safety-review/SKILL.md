---
name: supabase-safety-review
description: Review Supabase, auth, env, and data-boundary safety surfaces
---

Use when:
- the task touches Supabase, auth, payments, env, or route/data boundaries

Do not use when:
- the task is isolated to presentation-only UI with no data/auth boundary implications

Required inputs:
- target data/auth/payment surface

Read first:
- `supabase/AGENTS.md`
- `src/lib/AGENTS.md`
- `.ai/00_system/ENVIRONMENT_CONTRACT.md`
- `.ai/00_system/DATA_BOUNDARY_MAP.md`

Expected outputs:
- env/runtime boundary summary
- risky assumptions
- validation guidance
- doc or plan updates needed

Evidence requirement:
- cite exact env usage sites, Supabase helpers, route handlers, or migrations
