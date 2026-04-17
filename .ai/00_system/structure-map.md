# Legacy-to-Target Structure Map

**Last Updated:** 2026-04-16

This file maps the preserved legacy `.ai` structure to the new numbered operational taxonomy.

| Preserved Path | Current Role | Numbered Overlay Reference |
| --- | --- | --- |
| `.ai/agents/` | Existing agent instruction files | `.ai/12_agents/` |
| `.ai/archive/` | Historical and superseded material | `.ai/09_archive/` |
| `.ai/docs/` | Active documentation corpus and archived reference sets | `.ai/06_specs/`, `.ai/13_research/`, `.ai/00_system/` |
| `.ai/logs/` | Existing changelog history | `.ai/05_logs/` |
| `.ai/plans/` | Existing implementation planning folders | `.ai/03_plans/` |
| `.ai/prompts/` | Existing prompt artifacts | `.ai/08_prompts/` |
| `.ai/rules/` | Governance and implementation rules | `.ai/00_system/` |
| `.ai/skills/` | Skill library and playbooks | `.ai/11_skills/` |
| `.ai/state/` | Current task and memory artifacts | `.ai/10_state/` |
| `.ai/ralph/` | Runtime-specific state | `.ai/10_state/` |
| `.ai/mcp.json` | MCP/system config | `.ai/00_system/` |
| `.ai/settings.json` | Workspace config | `.ai/00_system/` |

## Important note

The numbered folders are an **organizational overlay**, not a destructive migration. The legacy/source paths remain valid until a future human-approved consolidation decides otherwise.
