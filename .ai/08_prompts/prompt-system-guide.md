# Prompt System Guide

**Last Updated:** 2026-05-09

## Content-production prompt rule

Every active prompt that asks an AI worker to produce, rewrite, polish, review for publication, or remediate SlateCamp learning content must begin with:

> Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` before producing any content artifact.

This rule applies to article, question, rationale, source-ledger, exemplar, and worker-brief prompts. Historical/archive prompts do not need retroactive edits unless they are reused.



## Source-layer rule for content prompts

Any prompt that produces or edits learner-facing article/question content must point workers to:

- `.ai/00_system/vitruvius-source-reference.md`
- `vitruvius-connection/001_Raw-Source-Layer/` for raw source truth
- `vitruvius-connection/002_Raw-Conversion-Layer/` for search/OCR only
- `vitruvius-connection/003_Canonical-Knowledge-Layer/` for discovery only

Prompt workers must name the exact raw source file(s) before drafting and must produce or update a source/claim ledger with raw path, SHA256, Rule/Section/Table/Page locator, claim class, extraction status, and SME release status.

## Two prompt layers
1. **Raw prompt pack** — numbered/specialist prompts preserved for history and direct orchestration.
2. **Normalized prompt library** — stable filenames for recurring audit/plan/validation/state/governance tasks.

## Use the raw prompt pack when
- you want the original orchestrator/specialist prompt text
- you are replaying or refining the 2026-04-16 repo-intelligence initiative

## Use the normalized prompt library when
- you want a stable file name for repeatable workflows
- you are updating a stable `.ai` surface instead of producing one-off output

## Mapping
- master orchestrator -> `master-audit-prompt.md`
- architecture specialist -> `architecture-audit-prompt.md`
- performance specialist -> `performance-audit-prompt.md`
- AGENTS governance -> `agents-update-prompt.md`
- roadmap/docs state refresh -> `master-state-refresh-prompt.md` / `roadmap-refresh-prompt.md`
- UX audit -> `ui-ux-audit-prompt.md`
