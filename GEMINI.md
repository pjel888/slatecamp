# GEMINI.md

Gemini users in this repository should treat the following files as the current instruction stack:

- `README.md` for repository orientation and commands
- `CLAUDE.md` for the policy-heavy repository contract
- `AGENTS.md` for repo-wide and subtree-local operating rules
- `.ai/00_system/repo-map.md` for the current repository map
- `.ai/00_system/ai-folder-canonical-map.md` for `.ai` routing and authority
- `.ai/02_audits/master-audit.md` for the current audit summary

Repository rules:

- Follow live code, config, schema, and scripts over stale docs.
- Use Bun and validate commands against `package.json`.
- Do not treat `.omx/` runtime state as canonical repository truth.
- Generated audit artifacts do not recursively expand audit scope.
- Audit/planning runs stop at documentation and planning artifacts; remediation requires a later implementation-approved run.
