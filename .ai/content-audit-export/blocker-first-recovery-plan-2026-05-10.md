# Blocker-First Content Recovery Plan

Date: 2026-05-10
Mode: execution pivot — stop forward batching until parked/blocking causes are resolved

## Decision

Do not continue source-audited article batches by skipping parked articles. The batch lane is now gated by a blocker-first rule: if a batch parks items for systemic reasons, the next work must resolve those blockers before selecting a new batch.

## Why

Batches 002 and 003 exposed repeat systemic blockers rather than isolated article failures:

1. Legacy unresolved UI placeholders in `normalized.md` and stale bundle hashes.
2. Empty or missing `sources.json` in legal/professional articles.
3. Unsupported or conflicting legal/code claims that require raw-PDF correction before article/question improvement.
4. Remote dry-run fetch failures that prevent confidence in apply-readiness.

Continuing to Batch 004 would create a growing parked backlog instead of improving the corpus.

## Immediate Rule Change

### Previous behavior

- Park failed articles.
- Continue to the next controlled batch.

### New behavior

- Park only as a temporary quarantine state.
- Stop forward batch selection when parked count indicates a systemic blocker.
- Resolve the blocker class iteratively.
- Re-run the same parked articles until they PASS or are proven permanently ineligible.
- Only graduate to the next batch when the current blocker class is closed or reduced to hard source-unavailable cases.

## Recovery Lanes

### Lane A — Placeholder and bundle repair foundation

Goal: restore compose/validate eligibility for parked articles.

Tasks:

1. Inventory all parked articles with unresolved `ui_000N` placeholders.
2. Compare each affected `normalized.md`, `ui-blocks.json`, `candidate.md`, `compose-report.json`, and live pulled content.
3. Determine whether placeholders can be remapped from `ui-blocks.json` or must be regenerated from live content.
4. Build a repair script or manual protocol that fixes one article first.
5. Verify roundtrip:
   - compose passes
   - no raw `[SLATECAMP_UI_BLOCK:...]` leaks after candidate generation
   - validate passes
   - MDX compiles
6. Apply to the same blocker family only after the pilot passes.

Initial target articles:

- Project Construction Cost PCC Definition Inclusions
- Schedule of Payments Phase Percentages
- Multiple of Direct Personnel Expense MDPE the Formula Components
- MDPE Multipliers Overhead Profit Non Technical Factors
- Lump Sum Fixed Fee Scope Discipline Risk Allocation

### Lane B — Source-row and source-audit reconstruction

Goal: create reliable source-audit evidence before content edits.

Tasks:

1. For each parked article, identify required source family from title, taxonomy, and claims.
2. Pull primary raw PDFs only from `vitruvius-connection/001_Raw-Source-Layer/`.
3. Extract exact page/section evidence.
4. Replace unsupported claims with source-supported claims in `normalized.md`.
5. Create valid `source-audit-evidence.json` only after candidate hash is known.
6. If no primary source supports a claim, remove or rewrite the claim; do not preserve it as exam content.

Initial target blockers:

- MDPE multiplier/range claims
- Schedule-of-payment percentage conflicts
- PCC scope/inclusion claims
- RA 9266 compensation locator misuse
- PD 1096 occupancy/parking/fire-separation locator errors

### Lane C — Question repair tied to article evidence

Goal: repair linked questions only when the parent article source audit covers the claim.

Tasks:

1. For each repaired article, inspect linked questions.
2. Identify questions with same unsupported claim family.
3. Create `question-edits/<question_id>.json` only when answer key, choices, and explanation are source-supported.
4. Dry-run question apply.
5. Apply in small batches only after duplicate checks and live verification.

### Lane D — Remote dry-run/apply reliability

Goal: eliminate false blockers from Supabase remote fetch failures.

Tasks:

1. Reproduce the dry-run fetch failure independently.
2. Confirm environment variables and Supabase endpoint resolution without exposing secrets.
3. Compare working verification scripts against dry-run script client setup.
4. Fix or document the exact network/tooling blocker.
5. Do not classify an article as content-blocked solely because dry-run remote fetch failed.

## Gate Before Any New Batch

A new source-audited batch may start only when:

- Batch 002 articles have either PASS evidence or specific irreducible source blockers.
- Batch 003 systemic blockers have a repair protocol or have been reclassified individually.
- Supabase dry-run remote fetch failure is resolved or isolated from content gates.
- The current parked backlog is not growing due to the same repeated blocker.

## Next Concrete Execution Step

Start with Lane A on Batch 002 compensation/cost articles, because they show the clearest recurring placeholder/source problem.

Pilot article:

- Project Construction Cost PCC Definition Inclusions

Definition of done for pilot:

- `normalized.md` placeholders are repaired or regenerated safely.
- `sources.json`/source-audit evidence is reconstructed from raw PDFs.
- `candidate.md` composes.
- validation passes.
- article dry-run reaches content/source gates without placeholder failure.
- linked question claims are inventoried for later repair.

No new article batch starts until this pilot is resolved.
