# Agent System Map

**Last Updated:** 2026-04-16

## Enforcement surfaces
- `AGENTS.md` files are the scoped rule surface
- `.ai/12_agents/` explains the governance model
- `.ai/08_prompts/` provides reusable repo-intelligence prompts
- `.ai/10_state/` records current operating truth

## Current hierarchy shape
- Root `AGENTS.md` governs the whole repo
- `.ai/AGENTS.md` governs the operational intelligence subtree
- Nested `AGENTS.md` files under `src/`, `supabase/`, `public/`, and `scripts/` narrow scope for specific subsystems
- Current tracked count: 113

## Practical model
1. Root contract sets repo-wide safety and validation rules.
2. Subtree `AGENTS.md` files explain local reality and stricter expectations.
3. `.ai/` docs should explain the repo; they should not silently diverge from live code or scoped instructions.
4. Prompt files should generate or update stable docs rather than acting as isolated dead-end instructions.
