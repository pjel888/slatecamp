# Repo Priority Map

**Last Updated:** 2026-05-07

## Priority order
1. **Landing implementation next** — the final messaging gate is now a conditional GO at `.ai/03_plans/2026-05-07-landing-page-final-messaging-gate.md`. Implement the homepage so SlateCamp feels like a premium architecture learning platform/study companion with four clear pillars: Knowledge Resources, Quizzes, 3D Lab, and Free Tools. Use Philippine specificity as proof/scope/SEO, not as the hero’s first prestige cue, and follow the CTA route/scope guardrails in the gate.
2. **MVP Core Effectiveness** — absolute priority on building the best, most accurate product for launch; zero legacy accommodation.
3. **Operational truth first** — keep `.ai`, `README.md`, `CLAUDE.md`, and `AGENTS.md` aligned with the launch MVP goal.
4. **Boundary hardening** — ensure clean data boundaries, legal-safe educational-resource positioning, and state management for MVP stability.
5. **Performance-sensitive surfaces** — ensure the 3D Lab and quiz shells meet launch performance standards.
6. **Data-flow reliability** — prioritize the reliability of core MVP flows (auth, quiz sessions, content/reference surfaces).

## Current priority zones by area
| Area | Priority | Why |
| --- | --- | --- |
| `.ai` / docs / prompts | Immediate | User task is landing/platform positioning, Reddit sentiment synthesis, and roadmap refresh |
| `src/components/landing` + `src/components/marketing` + `src/app/page.tsx` | Immediate | Landing rewrite must make four pillars clear before implementation |
| `src/app/tools` + calculator registry | High | Free tools are now a strategic acquisition surface, not a buried utility family |
| `src/app/dashboard` + `src/lib/actions/quiz-v2` | High | Hardened & Unified. Architecture is pro-grade. |
| `src/features/3d-lab` + `src/hooks` | High | Performance-sensitive and central to the platform differentiation |
| `src/app/dashboard/wiki` + knowledge/content system | High | Knowledge resources are now a primary public pillar |
| `src/app/admin` + `src/lib/actions/admin` | High | Broad CRUD surface, workflow integrity risk |
| `src/lib/supabase` + migrations + auth | High | Central runtime/data contract |
| Developer/CEO surfaces | Medium | Important but less central than student/admin flows |

## De-prioritized for this pass
- random UI polish without evidence
- feature refactors not required for truthful docs
- destructive archive cleanup
- generic architecture portal expansion beyond the landing-positioning plan
- public partnership, official-source, pass-guarantee, or professional-advice claims without verification
