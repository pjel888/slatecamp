# Council Remediation — bp-344-ramp-slope-tiers (5a8ca807)

Remediation date: 2026-07-20
Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation`
Status: VERIFIED CORRECT — NO FIX NEEDED (no commits, no branch switch, no Supabase writes)

## Governing source

- `/Users/philiplewis/slatecamp/.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json`
- `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Tracker reversal: 170 mm handrail trigger is CONFIRMED CORRECT (status: APPLIED = verification recorded)

The prior audit tracker flagged the "170 mm change in grade triggers handrail" claim as "not in source". That flag is itself an ERROR. Agent H independently re-verified against both authoritative sources:

- **chunks.generated.json** chunk-0002 (PDF p.7, section_locator "Appendix A / Handrails and Grab Bars"), verbatim: "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm."
- **Supplementary verbatim text** line 196: "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm."

### Where the claim appears in this bundle

- `linked-questions.json`, question `0a31a28e-0935-4565-a118-60b76c0a2c0c` ("What are the dual handrail heights required on accessible ramps under the 2024 BP 344 IRR, and at what change in grade are handrails triggered?"), option text: "...required when change in grade exceeds 170 mm". This is verbatim-supported and CORRECT.
- The 170 mm figure does NOT appear in `normalized.md` or `candidate.md` (those cover slope tiers 1:20 / 1:15 and landing dimensions).

## Verdict

No edit applied. The article body and the question are correct. The prior tracker's "170 mm not in source" flag is hereby reversed and should be disregarded.

## Other systemic note (not applied — orchestrator follow-up)

Agent C noted this bundle (like all BP 344 bundles) contains invented decimal subsection citations in its questions (e.g., references to granular sub-sections that do not exist in the source). Normalizing those to "Appendix A, item N (topic)" form is a recommended citation-hygiene follow-up but was NOT applied by Agent H because (a) it is not a CONFIRMED numeric error, and (b) the 170 mm handrail trigger — the only Agent-C finding specific to this bundle — was verified correct.

## Files modified by Agent H

- `council-remediation-2026-07-20.md` — this file (created).

No other files in this bundle were edited.
