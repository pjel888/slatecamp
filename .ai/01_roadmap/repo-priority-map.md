# Repo Priority Map

**Last Updated:** 2026-04-18

## Priority order
1. **MVP Core Effectiveness** — absolute priority on building the best, most accurate product for launch; zero legacy accommodation.
2. **Operational truth first** — keep `.ai`, `README.md`, `CLAUDE.md`, and `AGENTS.md` aligned with the launch MVP goal.
3. **Boundary hardening** — ensure clean data boundaries and state management for MVP stability.
4. **Performance-sensitive surfaces** — ensure the 3D Lab and quiz shells meet launch performance standards.
5. **Data-flow reliability** — prioritize the reliability of core MVP flows (auth, payments, quiz sessions).

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
