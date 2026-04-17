# CODEX_ENABLEMENT_AUDIT

## Summary

SlateCamp already gives Codex a better-than-average starting point: a real `README.md`, a deep `AGENTS.md` hierarchy, a rich `.ai` layer, a numbered-only `.ai` top level, and major product surfaces that are easy to name.

What still makes Codex work harder than it should is not lack of docs, but lack of deterministic contracts:
- no committed env contract artifact
- no root test command
- mixed mock vs runtime truth in `/developer`
- broad admin workflow surface without one concise operational map
- preserved deep lineage docs that can still be mistaken for current authority unless clearly demoted

## What currently helps Codex

- root contract stack is real and repo-specific
- route and subsystem boundaries are clear at the directory level
- `.ai` now has a coherent numbered top level
- `/developer` exists as an internal support surface
- Supabase truth has both a schema snapshot and migration history

## What currently hurts Codex

- environment setup is inferred, not declared
- validation is real but scattered
- `/developer` is not yet a fully trusted runtime truth layer
- admin workflow docs are weaker than admin code complexity
- preserved deep-doc lineage can still compete with current authority when poorly marked

## Top findings

- `CEX-ENV-001`
- `CEX-VAL-001`
- `CEX-DEV-001`
- `CEX-ADM-001`
- `CEX-DATA-001`
- `CEX-SKILL-001`
- `CEX-DOC-002`

## Minimum high-leverage improvements

1. environment contract
2. validation matrix
3. route surface map
4. data boundary map
5. `/admin` and `/developer` focused audits/plans
6. repo-shared `.agents/skills`
