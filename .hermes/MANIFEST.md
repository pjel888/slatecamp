# Manifest

## Global Hermes files

- `SOUL.md` — global Slatecamp-focused agent identity.
- `config.yaml` — safe baseline configuration; merge with existing config if present.
- `.env.example` — example secret placeholders only.
- `.gitignore` — prevents secrets, logs, sessions, caches, and checkpoints from being committed.
- `memories/MEMORY.md` — bounded agent memory seed.
- `memories/USER.md` — bounded user preference seed.

## Knowledge library

- `docs/` — operating model, architecture, security, testing, performance, deployment, and session protocols.
- `guardrails/` — non-negotiable safety boundaries.
- `checklists/` — preflight, commit, release, security, UI, and migration checks.
- `templates/` — reusable Markdown outputs.
- `prompts/` — copyable prompts for recurring work.
- `cron/` — scheduled-task prompt examples.
- `maintenance/` — backup and upkeep guidance.

## Skills

- `slatecamp-orientation`
- `slatecamp-feature-planner`
- `slatecamp-code-reviewer`
- `slatecamp-debugger`
- `slatecamp-refactor-architect`
- `slatecamp-test-engineer`
- `slatecamp-ui-design-critic`
- `slatecamp-performance-auditor`
- `slatecamp-security-auditor`
- `slatecamp-release-operator`
- `slatecamp-docs-curator`

## Project context

- `project-context/slatecamp/.hermes.md` — copy to Slatecamp repo root.
- `project-context/slatecamp/AGENTS.md` — optional compatibility file for other agents.
