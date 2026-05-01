<!-- Parent: ../AGENTS.md -->

# .codex

## Scope

This file governs `.codex/`.

## Responsibility

This subtree is a tracked tool-specific mirror of agent and skill payloads.
It is not the canonical policy layer.

## Companion AI CLI guidance

Kimi Code CLI is available locally and should be used opportunistically when it materially improves quality, speed, or independent verification.

Verified on 2026-04-25:
- binary: `/Users/philiplewis/.local/bin/kimi`
- version check: `kimi info` reports `kimi-cli version: 1.37.0`
- health check: `kimi --quiet -p 'Health check only. Reply exactly: KIMI_CODE_OK'`

Preferred uses:
- read-only second opinions on broad plans, audits, migrations, and risky implementation strategies
- bounded code-review or UX-review passes
- test strategy and edge-case brainstorming
- product-claim and copy tightening

Guardrails:
- Codex owns final edits, verification, and user-facing claims.
- Do not send secrets, credentials, service-role keys, private env values, or production data to Kimi.
- Do not make simple local work depend on Kimi when direct inspection and tests are enough.
- Keep this mirror aligned with `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md`.

## Edit rules

- Do not make one-off edits here without a documented parity decision for the other mirror trees.
- Keep mirror governance aligned with `.ai/12_agents/`, `.ai/11_skills/`, and `.ai/00_system/ai-folder-canonical-map.md`.

## Anti-loop rule

- Generated audit artifacts do not recursively expand scope.
- Remediation requires a later implementation-approved run.
