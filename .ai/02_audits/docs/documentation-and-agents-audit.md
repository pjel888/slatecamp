# Documentation And Agents Audit

## Scope

- Root Markdown and governance docs
- `docs/`
- `.ai/`
- `.ai/06_specs/deep/`
- Baseline Markdown inventory
- Baseline `AGENTS.md` inventory

## Linked findings

- `DOC-001`
- `DOC-002`
- `DOC-003`
- `DOC-004`
- `AGT-001`
- `META-001`
- `META-003`

## Observed

- Documentation volume is high, but authority boundaries are weak
- Historical material is preserved well, but demotion/supersession language is inconsistent
- `AGENTS.md` coverage is broad in product code and thinner in documentation governance surfaces

## Baseline disposition summary

- `verified current, no change needed`: 296 baseline Markdown files
- `updated`: 11 baseline Markdown files
- `marked legacy / superseded`: 408 baseline Markdown files
- `linked to canonical source-of-truth`: 180 baseline Markdown files

## Material findings

### `DOC-001` Unsafe legacy PRD authority

`.ai/06_specs/deep/00-meta/prd-legacy.md` still claims authority while containing stale route, migration, and command guidance.

### `DOC-002` Superseded `.ai/06_specs/deep` workspace protocol remains too actionable

Historical meta docs still describe removed or renamed `.ai` artifacts as if they remain current.

### `DOC-003` Count drift in high-authority docs

Observed drift between live T0 counts and values embedded in:
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/10_state/current-state.md`

### `AGT-001` Missing documentation-governance AGENTS boundaries

High-value missing local agent surfaces at T0 include:
- `docs/AGENTS.md`
- `.ai/06_specs/deep/AGENTS.md`
- `.ai/09_archive/AGENTS.md`
- `.ai/12_agents/AGENTS.md`

## Disposition register

Per-file baseline Markdown disposition tracking is maintained in:
- [documentation-baseline-dispositions.md](/Users/philiplewis/slatecamp/.ai/02_audits/documentation-baseline-dispositions.md)

Method:
- the register is generated from the frozen T0 baseline inventory
- files updated in this run are explicitly marked `updated`
- historical/archive and superseded protocol surfaces are marked `marked legacy / superseded`
- preserved mirrors and preserved non-entrypoint stores are marked `linked to canonical source-of-truth`

## Unknown

- Which historical docs are still operationally consumed by humans, prompts, or mirror tools outside the tracked repo
