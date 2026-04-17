<!-- Parent: ../../AGENTS.md -->

# .ai/12_agents

## Scope

This file governs `.ai/12_agents/`.

## Responsibility

This subtree owns the agent-system contract, hierarchy, and index docs for the repository.
It does not yet own all live payload files.

## Edit rules

- Keep contract and hierarchy docs aligned with root `AGENTS.md`, `.ai/AGENTS.md`, and mirror-tool policies.
- Do not imply `.ai/12_agents/` is the sole payload source unless the generator contract has been approved and documented.

## Dependencies

- `.ai/12_agents/payloads/`
- `.claude/`, `.codex/`, `.cursor/`, `.gemini/`
- `.ai/00_system/ai-folder-canonical-map.md`

## Anti-loop rule

- Generated audit artifacts do not recursively expand scope.
- Remediation requires a later implementation-approved run.
