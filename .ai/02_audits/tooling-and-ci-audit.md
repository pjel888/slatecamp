# Tooling And CI Audit

## Scope

- `package.json`
- `bun.lock`
- `.github/`
- root configs and MCP wiring
- `scripts/`

## Linked findings

- `TOOL-001`
- `TOOL-002`
- `TOOL-003`
- `TOOL-004`
- `TOOL-005`
- `SEC-001`

## Observed

- Bun is the documented package manager and the stray npm lockfile has now been retired
- Bun bootstrap was previously broken but the live manifest has since been repaired
- CI only builds Storybook
- MCP server definitions are split between root and `.ai`

## Material findings

### `TOOL-001` Missing ultrawork routing reference

Observed:
- `/Users/philiplewis/.codex/skills/ultrawork/SKILL.md` requires `docs/shared/agent-tiers.md`
- that path is absent in this repo

Impact:
- parallel delegation guidance is incomplete for future runs

### `TOOL-002` Broken Bun bootstrap

Observed:
- `bun install --frozen-lockfile` failed on `@lemonsqueezy/lemonsqueezy.js@^1.3.0`

Impact:
- documented bootstrap path was not dependable until the LemonSqueezy version pin was repaired

### `TOOL-003` Lockfile drift

Observed:
- the repo previously carried both `bun.lock` and `package-lock.json`
- the npm lockfile has since been retired so `bun.lock` is now the sole active root lockfile

Impact:
- install reproducibility and automation parity improve once the Bun-only contract is explicit

### `TOOL-004` Storybook-only CI

Observed in `.github/workflows/storybook.yml`:
- no app-wide build/lint/type-check gates

Impact:
- core app regressions can merge without enforced validation

### `TOOL-005` Split MCP contract

Observed:
- root `.mcp.json` defines portable servers
- `.ai/mcp.json` defines a partial Windows-specific override

Impact:
- consumers can lose servers or fail cross-platform if they read the wrong file

## Unknown

- Whether teams intentionally use different install tools in different environments
