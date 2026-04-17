# Cleanup Run Log

## 2026-04-17

### Scope decisions

- frozen scope at T0 around repository-wide cleanup audit and planning only
- no application code, hooks, stores, scripts, SQL, migrations, configs, package files, or runtime behavior may be changed
- only `.ai/` Markdown artifacts may be created or updated
- new docs created during this run do not expand audit scope

### Baseline observations

- repo is large enough that cleanup false positives are a primary risk
- route files, migrations, stories, developer tooling, and registry-driven usage must be treated conservatively
- `docs/shared/agent-tiers.md` is still missing, so ultrawork model-tier guidance cannot rely on a repo-local reference

### False-positive cautions

- App Router conventions are active entrypoints even without import edges
- `supabase/migrations/` are preserved migration history, not dead code by default
- developer, Storybook, MDX, and registry/config usage can make “unused” files still meaningful

### Validation limitations

- no root `test` script exists
- no committed root `.env.example` exists
- cleanup-safety assessment must map to real commands only

### Parallel audit lane outcomes

- lane 1 (dead code / unused exports): returned 2 confirmed-dead alias groups, 12 likely candidates, and 4 manual-validation groups
- lane 2 (route / feature legacy): returned 6 major route/feature cleanup candidates centered on admin aliases, quiz/testing/drills, calculators/tools, 3D-lab shims, and developer truth surfaces
- lane 3 (client/server boundary / component optimization): returned 6 structural cleanup candidates centered on wiki, admin knowledge/editor, notes, and `ModuleViewer`
- lane 4 (dependency / scripts / tooling): returned 8 dependency/tooling candidates plus validation hardening implications
- lane 5 (data/runtime cleanup risk): returned 7 blocker-heavy candidates, mostly compatibility retirement and Supabase/auth cleanup sequencing

### Final inventory totals

- cleanup candidates: 41
- findings: 15
- candidate confidence split:
  - confirmed: 5
  - likely: 30
  - needs manual validation: 6
- finding severity split:
  - critical: 3
  - high: 6
  - medium: 6

### Implementation follow-through (first-wave subset)

- implemented:
  - `L1-C001` — removed dead wiki wrapper alias files
  - `L1-C002` — removed dead wiki `*Practice` alias files
- blocked/deferred:
  - dependency-removal subset (`DEP-01` through `DEP-05`)
  - repo-safe Bun package probe failed on the existing resolver issue:
    - `error: No version matching "^1.3.0" found for specifier "@lemonsqueezy/lemonsqueezy.js"`
    - `error: @lemonsqueezy/lemonsqueezy.js@^1.3.0 failed to resolve`
- implication:
  - first implementation wave should proceed as two tracks:
    1. confirmed code-removal subset
    2. dependency cleanup only after package-resolution contract is repaired

### Validation outcome for implementation subset

- source cleanup verification:
  - deleted alias filenames no longer appear in live `src/` code
  - remaining matches are limited to cleanup docs and preserved historical notes
- `git diff --check` passed
- `bun run check:storybook` passed
- `bun run type-check` failed in the current workspace because install/runtime deps are not available (`node_modules` missing) and the repo already has a broken Bun dependency-resolution path
- `bun run lint` failed for the same environment reason; ESLint fell back to a global installation and could not resolve the repo config from local dependencies

### Completion check

- baseline/control docs created first
- coverage, findings, and candidate inventories stayed single-sourced
- all required cleanup audit and plan docs were created
- coverage matrix now marks every baseline area complete, excluded, or inventory-only with rationale
- only `.ai/` Markdown files changed in this run
- `git diff --check` passed
