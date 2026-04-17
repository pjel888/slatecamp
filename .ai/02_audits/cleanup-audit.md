# Cleanup Audit

## Executive synthesis

SlateCamp’s cleanup opportunity is real, but it is not a “delete unused files” problem. The repository has three cleanup layers:

1. **confirmed low-risk removals** — mostly alias wrappers and obviously dead leaf packages
2. **legacy consolidation** — admin aliases, quiz/testing/drills route families, and 3D-lab migration scaffolding
3. **structural cleanup blocked by validation** — admin editor monoliths, knowledge flow duplication, notes/controller duplication, and auth/entitlement compatibility retirement

## Highest-value cleanup opportunities

1. remove confirmed wiki alias wrappers and widget alias files (`L1-C001`, `L1-C002`)
2. collapse admin legacy alias routes around `/admin/knowledge*` (`L2-ADM-001`)
3. rationalize testing/quiz/drills route families (`L2-QUIZ-002`)
4. decompose admin unified editor/controller surfaces (`L3-C03`, `L3-C04`)
5. reduce wiki client work and duplicated sidebar hydration (`L3-C01`, `L3-C02`)
6. reduce 3D-lab migration/shim debt and split 3D hotspot files (`L2-3DLAB-004`, `L2-3DLAB-005`, `L3-C06`)
7. remove likely dead leaf dependencies and retire the dual lockfile split (`DEP-01` through `DEP-05`, `TOOL-01`)

## Highest-risk false-positive areas

- App Router file-convention routes and handlers
- Storybook story files and docs-only components
- registry-driven wiki/3D components
- generated or documentation-backed type contracts
- migrations and Supabase helper branches
- developer/operator-only DB scripts

## Recommended sequence

1. **Wave 1** — confirmed dead alias files and low-risk leaf dependency removals
2. **Wave 2** — route/namespace/legacy-surface consolidation planning and explicit compatibility inventory
3. **Wave 3** — admin/wiki/notes component and boundary cleanup
4. **Wave 4** — dependency/tooling rationalization and validation hardening
5. **Wave 5** — auth/entitlement/Supabase compatibility retirement after stronger safety gates are in place

## Linked detailed audits

- `dead-code-audit.md`
- `legacy-code-audit.md`
- `component-optimization-audit.md`
- `dependency-rationalization-audit.md`
- `client-server-boundary-audit.md`
- `scripts-and-supabase-cleanup-audit.md`

## Linked control docs

- `../10_state/cleanup-candidate-index.md`
- `../10_state/cleanup-findings-register.md`
- `../10_state/cleanup-coverage-matrix.md`

