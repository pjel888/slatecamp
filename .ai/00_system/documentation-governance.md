# Documentation Governance

**Last Updated:** 2026-04-17

## Canonical surface roles

### `README.md`
- Repository entrypoint for humans and agents landing at the repo root
- Owns onboarding, repo shape, major surfaces, real script surface, and pointer links into deeper docs

### `docs/`
- Bridge surface for root-level human navigation
- Should summarize and point; it is not the full operational or deep-reference corpus

### `.ai/00_system/`
- Owns policy, routing, authority mapping, validation, environment, and Codex-enablement guidance

### `.ai/02_audits/`, `.ai/03_plans/`, `.ai/10_state/`
- Own operational audits, remediation plans, and current human-readable state

### `.ai/06_specs/`
- Owns short bridge specs that summarize live code reality

### `.ai/06_specs/deep/`
- Owns deep reference material, preserved spec history, and lineage docs
- `deep/00-meta/` is preserved lineage, not current operational authority

### `.agents/skills/`
- Codex-discoverable shared skill surface
- Skills should point back into canonical `.ai` docs instead of duplicating repo truth

## Duplication policy

Duplication is acceptable only when roles are different:
- `README.md` = entrypoint
- `.ai/00_system/` = operating contract and routing
- `.ai/06_specs/` = short live bridge docs
- `.ai/06_specs/deep/` = deep reference and preserved lineage
- `.ai/02_audits`, `.ai/03_plans`, `.ai/10_state` = current operational truth
- `.agents/skills/` = reusable workflow instructions

If a topic appears in more than one place:
1. pick the canonical owner
2. demote or label the supporting copy
3. update the pointer copy when the canonical one changes

## Drift management rules

1. Time-sensitive claims must be dated or omitted.
2. Commands must match `package.json` or executable scripts.
3. Volatile counts must be remeasured before reuse.
4. If structure or ownership changes, update the nearest `AGENTS.md` and the canonical owner doc in the same change.
5. Historical docs should stay preserved, but must not read like active authority.
