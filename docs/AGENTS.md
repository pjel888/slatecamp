<!-- Parent: ../AGENTS.md -->

# docs

## Scope

This file governs `docs/` and its children.

## Responsibility

`docs/` is the root bridge surface.
It should point readers to canonical docs elsewhere; it should not become a second deep documentation corpus.

## What may and may not be edited

- You may update pointers, indexes, and bridge summaries here.
- Do not duplicate full deep specs that belong in `.ai/06_specs/deep/`.
- Do not let `docs/` compete with `README.md` or `.ai/`.

## Dependencies and adjacent systems

- `README.md` is the repo entrypoint
- `.ai/` is the operational intelligence layer
- `.ai/06_specs/deep/` is the deep reference corpus

## Source-of-truth rules

- `docs/` points
- `README.md` or `.ai` own

## Audit and planning expectations

- Verify every path you point to.
- Generated audit artifacts do not recursively expand audit scope.
- Documentation-only audit runs stop at documentation and planning artifacts; remediation requires a later implementation-approved run.

## Precedence

- Root `AGENTS.md` applies first.
- This file refines `docs/`.
