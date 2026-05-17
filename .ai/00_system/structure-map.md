# Legacy-to-Target Structure Map

**Last Updated:** 2026-04-17

This file maps former top-level `.ai` roots to their current numbered homes.

Current authoritative routing map:
- `.ai/00_system/ai-folder-canonical-map.md`

This file remains useful as a historical overlay explanation, but the canonical map above should be used for current placement decisions.

| Former Top-Level Path | Current Numbered Home | Notes |
| --- | --- | --- |
| `.ai/docs/` | `.ai/06_specs/deep/` | Deep reference corpus now lives under numbered ownership |
| `.ai/archive/` | `.ai/09_archive/store/` | Preserved historical content store |
| `.ai/plans/` | `.ai/03_plans/preserved/` | Preserved plan folders |
| `.ai/agents/` | `.ai/12_agents/payloads/` | Live agent payload store |
| `.ai/skills/` | `.ai/11_skills/payloads/` | Live skill payload store |
| `.ai/state/` | `.ai/10_state/legacy-state/` and `.ai/10_state/legacy-state-root/` | Preserved state notes and hidden residue |
| `.ai/ralph/` | `.ai/10_state/legacy-runtime/ralph/` | Preserved runtime residue |
| `.ai/logs/` | `.ai/05_logs/` | Human-readable logs plus preserved legacy changelog |
| `.ai/prompts/` | `.ai/08_prompts/legacy/` | Preserved prompt artifacts |
| `.ai/rules/` | `.ai/00_system/legacy-rules/` | Preserved rule docs |

## Important note

The numbered folders are the canonical organizational structure. Legacy paths from before the 2026-05-17 org pass may no longer be valid. Most former `.ai/` root-level files have been moved into numbered folders with updated names per the naming conventions in `naming-conventions.md`. See `ai-folder-canonical-map.md` for current routing.
