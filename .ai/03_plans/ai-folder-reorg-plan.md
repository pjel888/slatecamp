# AI Folder Reorganization Plan

## Objective

Finish `.ai` normalization so the top-level tree is numbered-only while preserved legacy material stays recoverable under numbered parents.

## Linked findings

- `META-001`
- `META-003`
- `META-004`
- `META-005`
- `DOC-004`
- `AGT-001`

## Scope

- `.ai` top-level folder topology
- `.ai` state hierarchy
- routing of preserved archive, plan, payload, prompt, rule, and runtime material under numbered parents
- relationship between `.ai`, `06_specs/deep`, root `docs`, and `.omx`

## Non-goals

- No destructive folder moves in this run
- No payload rewrites or tool-mirror generation changes in this run
- No runtime `.omx` mutation beyond documentation and cleanup planning

## Current problems

- Active docs were still describing pre-normalized unnumbered roots after the filesystem moves
- `10_state`, preserved legacy state notes, and `.omx/state` still require clearer role boundaries
- `06_specs` now holds both operational summaries and the deep corpus, so documentation must describe that split explicitly
- Skills and agents still have contract folders plus large payload subtrees that need a later source/generator decision

## Implementation status

Implemented in the current cleanup run:
- low-volume legacy state docs moved into `10_state/legacy-state/`
- low-volume legacy logs, prompts, and rules moved under numbered canonical ownership
- former top-level `docs`, `archive`, `plans`, `agents`, `skills`, `ralph`, `state`, `logs`, `prompts`, and `rules` roots were removed
- preserved large stores were rehomed under numbered parents

Still deferred:
- payload source/generator strategy for tool mirrors
- deeper cleanup of legacy runtime residue under `10_state/legacy-runtime/`

## Target canonical structure

- `.ai/00_system`: only governance/router layer
- `.ai/02_audits`: only active audit registry
- `.ai/03_plans`: only active planning registry
- `.ai/05_logs`: only permanent human-readable logs
- `.ai/08_prompts`: only active prompt entrypoint
- `.ai/09_archive`: only archive index/policy entrypoint
- `.ai/10_state`: only human-readable repo state
- `.ai/06_specs/deep`: deep reference corpus
- `.omx`: runtime-only local state, explicitly non-canonical

## Exact legacy-to-canonical mapping

- former `agents` root -> `12_agents/payloads/`
- former `archive` root -> `09_archive/store/`
- former `docs` root -> `06_specs/deep/`
- former `plans` root -> `03_plans/preserved/`
- former `skills` root -> `11_skills/payloads/`
- former `ralph` root -> `10_state/legacy-runtime/ralph/`
- former `state` root -> `10_state/legacy-state/` plus `10_state/legacy-state-root/`

## Sequencing

### Phase 1: top-level normalization

- remove unnumbered top-level `.ai` roots
- rehome preserved content under numbered parents
- update active governance docs to match the new paths

### Phase 2: state hierarchy repair

- define `.omx` as runtime-only in docs and AGENTS
- align `.ai/10_state` as the only human-readable state surface
- keep preserved state/runtime residue under `10_state/legacy-*`

### Phase 3: payload source strategy

- choose one source for agent and skill payloads
- define generation/parity checks for `.claude/.codex/.cursor/.gemini`

## Transition approach

- preserve legacy material under numbered parents
- keep historical traceability through README/index docs
- defer only the mirror-payload source strategy, not the top-level folder normalization

## Risks and mitigations

- Risk: breaking historical links
- Mitigation: canonical-plus-shim model and preserved content stores

- Risk: mirror tools diverge during transition
- Mitigation: freeze payload editing policy until generator contract is approved

- Risk: state confusion persists
- Mitigation: keep `10_state/legacy-*` and `.omx/state` roles explicit in AGENTS and README surfaces

## Dependencies

- `documentation-repair-plan.md`
- `agents-governance-plan.md`
- human decision on payload-source strategy

## Human approval decisions required

- Whether skill and agent payloads stay under `11_skills/payloads` and `12_agents/payloads` or move to a generated source later
- Whether `06_specs/deep` remains permanent or is eventually split again

## Acceptance criteria

- `.ai` top level is numbered-only
- one entrypoint exists for each function: audits, plans, logs, state, prompts, archive index, governance, deep reference
- `.omx` is documented as runtime-only and non-canonical

## Rollback and containment

- rollback is limited to restoring prior paths from git history if needed
- remaining future work is documentation and payload-governance cleanup, not top-level folder normalization

## Open questions

- Should `06_specs/deep` remain the permanent deep-corpus home?
- Should `11_skills/payloads` and `12_agents/payloads` remain manual payload stores or become generated?
