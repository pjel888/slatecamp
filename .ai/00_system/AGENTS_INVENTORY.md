# AGENTS_INVENTORY

## Purpose

Make the repo’s AGENTS counts reproducible and distinguish tracked files from local overlays.

## Current count method

- `git-tracked AGENTS.md` count:
  - `git ls-files '*AGENTS.md' | wc -l`
- current observed value on 2026-04-17:
  - `122`

- workspace AGENTS count excluding `.omx/`:
  - `find . -path './.git' -prune -o -path './node_modules' -prune -o -path './.omx' -prune -o -name 'AGENTS.md' -print | wc -l`
- current observed value on 2026-04-17:
  - `126`

## Buckets

### Git-tracked canonical inventory

- root `AGENTS.md`
- tracked subtree `AGENTS.md`
- tracked mirror/workspace docs such as `.codex/AGENTS.md`

### Workspace-local but untracked

- local overlays such as `.omx/AGENTS.md`

### Runtime-generated

- session-scoped `.omx/state/.../AGENTS.md`

## Rule

When high-authority docs say “the repo tracks X AGENTS files,” use the git-tracked count, not the broader workspace-local count.
