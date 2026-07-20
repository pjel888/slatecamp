# Council Remediation — bp-344-accessible-washrooms (6d5e0e55)

Remediation date: 2026-07-20
Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation`
Status: VERIFIED — numeric claims correct; section-cite cleanup already accomplished by prior batch (no commits, no branch switch, no Supabase writes)

## Governing source

- `/Users/philiplewis/slatecamp/.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json`
- `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Agent C finding for this bundle

"Section-citation cleanup only: invented decimal subsection citations (6.3.b etc.) should be normalized to 'Appendix A/B, item N (topic)' form per the source. Article body numeric claims (1800x1800, 450 mm WC centerline, 450 mm seat height, 800 mm lavatory rim, 400-600 mm emergency call button) are VERIFIED CORRECT against source — do NOT change the numbers."

## Status: APPLIED (via prior batch) + VERIFIED by Agent H

### Numeric claims — VERIFIED CORRECT, no changes

All article-body and question numeric claims confirmed against source verbatim:
- **Accessible WC cubicle: 1800 mm x 1800 mm** — source line 1143 (PDF p.36): "A minimum area of 1800 mm x 1800 mm".
- **WC centerline 450 mm from side wall** — source line 1158 (PDF p.36): "Water closets shall be installed 450 mm from the finished face of the sidewall to the centerline of the water closet."
- **Toilet seat height 450 mm** — source line 1199 (PDF p.37): "The height of toilet seat shall be 450 mm."
- **Lavatory rim 800 mm AFF** — source line 1208 (PDF p.38): "Lavatories shall be mounted at a height of 800 mm from the finished floor with a vertical clear leg room space not lower than 650 mm."
- **Emergency call button 400-600 mm AFF** — source line 1252 (PDF p.38): "400 mm to 600 mm from the finished floor".

### Section-citation cleanup — ALREADY APPLIED by prior batch-032

The 11 question-edit files in this bundle (`approved_by: codex-local-source-audit-batch-032`) already accomplished the section-citation cleanup Agent C recommended:
- The invented decimal subsection citations ("Sec 6.3.b", "Sec 6.9", "Sec 6.12", "Sec 6.14", "Sec 6.18", "Sec 6.19", "Sec 6.22", "Sec 6.9.j", "Sec 6.3.a/c", etc.) have been REMOVED from all 11 proposed edits.
- The proposed `code_citation` is now a verifiable source locator: "BP 344 2024 Revised IRR lines 891-951" (with full source-pack provenance including raw PDF SHA-256).
- All 11 proposed questions are topically aligned with the originals (WC centerline, cubicle count, grab bars, turning space, seat height, emergency call button, accessories, alarm signal) and contain the verified-correct numbers listed above.

Agent H confirmed: `grep "Sec 6\." question-edits/*.json` returns zero matches — the invented decimals are gone.

### Agent H decision: no further edit applied

The prior batch-032 edits already solve the documented problem (invented decimal citations) using a valid, source-grounded citation form (line-locator with full provenance). Overwriting 11 working, topically-aligned, numerically-correct edits purely to reformat "lines 891-951" into "Appendix B, item N (topic)" would risk introducing errors for no factual gain, since the washroom/toilet content spans PDF p.36-38 across multiple source sections. The core hygiene goal — eliminate fabricated subsection numbers — is already met.

## Files modified by Agent H

- `council-remediation-2026-07-20.md` — this file (created).

No other files in this bundle were edited. The 11 `question-edits/*.json` files were inspected and verified correct; they were NOT modified by Agent H.

## What remains a PROPOSAL (not applied by Agent H)

- If the orchestrator wants strict "Appendix X, item N (topic)" citation formatting (vs. the current "lines 891-951" form), that is a cosmetic follow-up that can be applied by re-running the citation normalizer across the 11 batch-032 edits. Agent C's per-bundle file with item-level specificity was not present in this bundle directory; only the consolidated report was available.
- The UNSOURCED claims Agent C flagged for this bundle (lavatory depth, mirror tilt, 900/600 grab-bar variant) are conceptual items in the original `linked-questions.json`, but those questions are already covered by the batch-032 proposed replacements which use source-supported values.
