<!-- Parent: ../../AGENTS.md -->

# .ai/06_specs/deep

## Scope

This file governs `.ai/06_specs/deep/` and its children unless a deeper `AGENTS.md` overrides it.

## Responsibility

`.ai/06_specs/deep/` is the deep reference and specification corpus.
It may contain active reference docs and preserved historical material, but it is not the operational state or planning registry.

## What may and may not be edited

- You may update deep reference docs, indexes, and status banners here.
- Do not place active audit logs, active plans, or current state summaries here when `.ai/02_audits`, `.ai/03_plans`, or `.ai/10_state` are the better fit.
- Preserve history with explicit legacy/superseded markers instead of destructive cleanup.

## Dependencies and adjacent systems

- `.ai/00_system/ai-folder-canonical-map.md`
- `.ai/06_specs/`
- root `docs/`
- live code in `src/`, `scripts/`, and `supabase/`

## Source-of-truth rules

- Deep reference lives here.
- Operational routing and governance live in `.ai/00_system/`.
- Current operational truth does not live here.

## Audit and planning expectations

- Verify live code before asserting behavior.
- Generated audit artifacts do not recursively expand scope.
- Remediation requires a later implementation-approved run.

## Precedence

- Root `AGENTS.md` applies first.
- `.ai/AGENTS.md` applies second.
- This file refines `.ai/06_specs/deep/`.
