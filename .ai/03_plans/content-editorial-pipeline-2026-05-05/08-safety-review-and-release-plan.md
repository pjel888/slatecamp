# Safety, Review, and Release Plan

## Safety doctrine

No source, no new fact. No dry-run, no apply. No human approval, no high-risk publish.

## Risk tiers

### Low risk
Examples:
- spelling
- grammar
- heading cleanup
- non-factual summary cleanup
- typo fixes

Review:
- automated validation plus spot check

### Medium risk
Examples:
- improved examples
- restructured explanation
- added mnemonic
- added board-exam study tip

Review:
- editor review

### High risk
Examples:
- law/code interpretations
- dimensional standards
- section references
- professional practice duties
- source citation changes

Review:
- subject-matter review required

### Critical risk
Examples:
- answer keys
- numerical calculations
- legal penalties
- formulas
- direct contradictions with source PDFs

Review:
- expert review required before push

## Release gates

### Gate 1 — Read-only analysis gate
Passes only if diagnosis and fact-ledger outputs validate against schema.

### Gate 2 — Proposal gate
Passes only if proposed edits contain no unsupported facts and no invalid components.

### Gate 3 — Local apply gate
Passes only if deterministic patch application changes allowed files only.

### Gate 4 — Compose gate
Passes only if `candidate.md` is generated and contains no unresolved placeholders.

### Gate 5 — Dry-run gate
Passes only if content-audit push dry-run reports safe changes.

### Gate 6 — Human review gate
Passes only if required review level is completed and recorded.

### Gate 7 — Apply gate
Passes only after explicit approval for apply. This plan does not authorize apply by default.

## Review packet requirements

Each high or critical article needs:
- article identity
- summary of proposed changes
- fact changes list
- source evidence list
- unsupported claims list
- question changes list
- component changes list
- validation report
- diff summary
- reviewer decision area

## Rollback requirements

Before any apply:
- backup current Supabase content
- record original hash
- record candidate hash
- record applied run ID
- verify remote content after apply

## Secret protection

Never print or commit:
- Supabase service role key
- provider API keys
- `.env` contents
- tokens
- database passwords

## Final release posture

The first milestone ends with a human-review-ready pilot package, not a full-corpus push.
