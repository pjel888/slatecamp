# AI Meta-System Audit

## Scope

- `.ai`
- `.claude`
- `.codex`
- `.cursor`
- `.gemini`
- `.omx`
- MCP and runtime overlay surfaces

## Linked findings

- `META-001`
- `META-002`
- `META-003`
- `META-004`
- `META-005`
- `META-006`
- `AGT-001`
- `TOOL-005`

## Observed

- `.ai` has a numbered-only top-level taxonomy, but some numbered folders now contain both governance docs and large preserved payload stores
- `.claude`, `.codex`, `.cursor`, and `.gemini` are tracked mirror trees
- `.omx` is local runtime state and is gitignored

## Material findings

### `META-001` Numbered taxonomy is not yet the real operating surface

Observed volume mismatch:
- `.ai/11_skills/payloads` materially outweighs `.ai/11_skills`
- `.ai/06_specs/deep` materially outweighs `.ai/06_specs`
- `.ai/09_archive/store` materially outweighs `.ai/09_archive`

Impact:
- future content placement remains ambiguous even when the numbered tree is documented

### `META-003` State authority split

Observed competing authority surfaces:
- `10_state/legacy-state*`
- `10_state/` current state docs
- `.omx/state/*`

Impact:
- direct hierarchy conflict and anti-loop risk

### `META-004` Mirror trees without generator contract

Observed:
- tracked copies across `.ai`, `.claude`, `.codex`, `.cursor`, `.gemini`
- no declared checked-in generator/parity source

Impact:
- any future edit can desynchronize tool behavior

### `META-005` OMX cleanup residue

Observed:
- stale active-mode and temp runtime traces in `.omx`

Impact:
- future runtime sessions can inherit misleading state

### `META-006` Skill portability defects

Observed:
- several `.ai/11_skills/payloads/*/SKILL.md` files reference missing `slatecamp-tech-stack`
- `.ai/11_skills/payloads/supabase-postgres-best-practices.bak/README.md` conflicts with the repo's Bun-first toolchain

Impact:
- meta-tooling guidance can fail at runtime or point operators at contradictory practices

## Recommended canonical direction

- `.ai/00_system`: only policy/router layer
- `.ai/10_state`: only human-readable repo state
- `.ai/06_specs/deep/`: deep reference corpus
- `.ai/09_archive`: only archive index/policy layer
- `.ai/08_prompts`: only active prompt library
- `.ai/11_skills` and `.ai/12_agents`: contract/index surfaces; payload source must be singular
- `.omx`: runtime only, never canonical repo truth
