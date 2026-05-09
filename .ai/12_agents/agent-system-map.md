# Agent System Map

**Last Updated:** 2026-05-09

## Enforcement surfaces

- `AGENTS.md` files are the scoped rule surface
- `.ai/12_agents/` explains the governance model
- `.ai/00_system/` owns Codex enablement, authority, validation, provider routing, and the developer AI bench policy
- `.agents/skills/` is the repo-shared Codex workflow surface
- `.ai/10_state/` records current human-readable operating truth

## Current hierarchy shape

- Root `AGENTS.md` governs the whole repo
- `.ai/AGENTS.md` governs the operational intelligence subtree
- Nested `AGENTS.md` files under `src/`, `supabase/`, `scripts/`, and route/domain subtrees narrow scope further
- Current tracked count: `122`

## Practical model

1. Root contract sets repo-wide safety and validation rules.
2. Subtree `AGENTS.md` files explain local reality and local validation expectations.
3. `.ai/` docs should explain the repo and point to current authority, not silently diverge from live code.
4. Skills should reuse canonical docs instead of becoming a second truth surface.
5. The developer AI bench is coordinated through Hermes: Codex is the primary builder; OpenCode/OpenCode Go, Command Code, and Kimi are external worker lanes; OpenRouter is the first-class provider/model bench for Hermes sessions, one-shot workers, and delegated subagents.
