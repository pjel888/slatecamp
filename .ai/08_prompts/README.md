# 08_prompts

This folder now has **four layers**:

1. **Frontier planning & workflow suite** — SOTA Plan Pack lifecycle, applicability gates, multi-agent execution directive, and grounded Git commit workflow (2026-07-20). This is the canonical entry for any Plan Pack work.
2. **Original prompt pack** — numbered/specialist prompts used for the 2026-04-16 repo-intelligence initiative
3. **Normalized prompt library** — stable filenames for recurring audit, validation, roadmap, state, architecture, UX, performance, and AGENTS-governance work
4. **Legacy prompt artifacts** — preserved materials migrated out of the old `.ai/prompts/` entrypoint

## Frontier planning & workflow suite (canonical for Plan Pack work)

Use only for explicitly requested planning or Plan Pack work. Ordinary
implementation uses the Direct or Brief lane from `AGENTS.md`. See
`000_Planning Prompts/README.md` for the authority/load order and progressive
load router.

- `000_Planning Prompts/Frontier-Planning-Kernel.md` — authority, Task Contract, lanes, pre-launch decisions, capability policy, verification, completion.
- `000_Planning Prompts/Frontier-Applicability-Gates.md` — triggered-only gates adapted to SlateCamp (Supabase, Next.js 16, RLS/RPC, entitlements, pedagogical logic).
- `000_Planning Prompts/Multi-Agent-Execution-Directive.md` — canonical orchestration, assignment, handoff, retry, completion contract.
- `000_Planning Prompts/Plan-Pack-Schema.md` — lean manifest schema with stable ID prefixes.
- `000_Planning Prompts/Creating-Plan-Prompt.md` — create the smallest executable pack.
- `000_Planning Prompts/Create-Implementation-Prompt.md` — compile a canonical implementation plan.
- `000_Planning Prompts/Executing-Plan-Prompt.md` — execute, integrate, verify, archive.
- `000_Planning Prompts/Improve-Plan-Prompt.md` — shrink/repair a pack without changing the outcome.
- `000_Planning Prompts/Prompt-Evaluation-Suite.md` — ten workflow simulations + hard fails.
- `000_Git Commit Prompt/Git-Commit-Prompt.md` — grounded commit workflow (Conventional Commits, GitNexus `detect_changes`, slatecamp-specific stop conditions).

## Original prompt pack
- `master-orchestrator-prompt.md`
- `architecture-and-system-boundaries-prompt.md`
- `route-feature-and-product-surface-inventory-prompt.md`
- `performance-loading-and-responsiveness-prompt.md`
- `data-layer-backend-schema-and-flow-integrity-prompt.md`
- `state-management-client-prompt.md`
- `documentation-roadmap-and-ai-reconciliation-prompt.md`
- `agents-governance-and-hierarchy-prompt.md`
- `repo-wide-prompt-system-upgrade-prompt.md`
- `ux-consistency-and-design-system-audit.md`

## Stable prompt-library files
- `master-audit-prompt.md`
- `master-implementation-plan-prompt.md`
- `master-validation-prompt.md`
- `master-state-refresh-prompt.md`
- `agents-update-prompt.md`
- `architecture-audit-prompt.md`
- `ui-ux-audit-prompt.md`
- `performance-audit-prompt.md`
- `roadmap-refresh-prompt.md`
- `prompt-system-guide.md`

## Legacy prompt artifacts
- `legacy/`

Rule:
- active prompts belong in `08_prompts/`
- `.ai/prompts/` is now a shim only
