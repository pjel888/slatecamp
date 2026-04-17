# Repo Priority Map

**Last Updated:** 2026-04-16

## Priority order
1. **Operational truth first** — keep `.ai`, `README.md`, `CLAUDE.md`, and `AGENTS.md` aligned with live code.
2. **Boundary hardening** — reduce client-heavy drift, action inconsistencies, and stale route assumptions.
3. **Performance-sensitive surfaces** — 3D Lab, analytics, admin tables/editors, and quiz session shells.
4. **Data-flow reliability** — server actions, RPC dependencies, admin CRUD, entitlements, and webhook/cron paths.
5. **Prompt + agent infrastructure** — normalize reusable prompts and keep governance docs current.

## Current priority zones by area
| Area | Priority | Why |
| --- | --- | --- |
| `.ai` / docs / prompts | Immediate | User task is repo-intelligence implementation |
| `src/app/dashboard` + `src/lib/actions/quiz-v2` | High | Core learning flow, large route surface |
| `src/features/3d-lab` + `src/hooks` | High | Performance-sensitive, client-heavy |
| `src/app/admin` + `src/lib/actions/admin` | High | Broad CRUD surface, workflow integrity risk |
| `src/lib/supabase` + migrations + auth | High | Central runtime/data contract |
| Developer/CEO surfaces | Medium | Important but less central than student/admin flows |

## De-prioritized for this pass
- random UI polish without evidence
- feature refactors not required for truthful docs
- destructive archive cleanup
