# Council Remediation — accessible-seating-in-assembly-areas (571e1d4f)

Remediation date: 2026-07-20
Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation`
Status: APPLIED (no commits, no branch switch, no Supabase writes)

## Governing source

- `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`
- Agent C verified assembly seating is under **Appendix E** (Auditoriums, Arenas, Theaters, and Other Assembly Areas — PDF p.64-65).

## Finding applied (status: APPLIED)

### Appendix D → Appendix E (uniform citation-letter correction) — APPLIED

The bundle's 11 questions cited "Appendix D" throughout. Source places assembly seating under **Appendix E**. Source verbatim (BP 344 2024 Revised IRR, PDF p.64, supplementary text line 2062): "1. Auditoriums, Arenas, Theaters, and Other Assembly Areas" followed by (line 2064): "Three percent (3%) of the total seating capacity of auditoriums, arenas, theaters, and other assembly areas shall be wheelchair parking accommodations." and (PDF p.65): "Accessible seating shall be provided with handrails 750 mm high at the front and sides."

Mechanical find/replace applied: every "Appendix D" → "Appendix E".

## Files modified by Agent H

- `linked-questions.json` — 24 occurrences of "Appendix D" replaced with "Appendix E" (all questions now cite Appendix E). jq-validated.
- `council-remediation-2026-07-20.md` — this file (created).

## NOT edited by Agent H

- `normalized.md` / `candidate.md` — contained NO "Appendix D" citations (they cite "BP 344" generically); no edit needed.
- `original.md` — export snapshot, contains 4 "Appendix D" references; NOT touched.
- `question-edits/*.json` — contained NO "Appendix D"; no edit needed.

## What remains a PROPOSAL (not applied by Agent H)

- Agent C flagged 2 UNSOURCED claims in this bundle for orchestrator review (not numeric errors):
  1. The "old IRR tiered table" comparison (one question rationale references the prior IRR's tiered seating table).
  2. The "5% priority seat 18.2.b.iii" claim — the decimal subsection "18.2.b.iii" does not exist in the source (source uses simple numbered items). This is part of the systemic invented-decimal-citation issue.
- These are conceptual/citation-hygiene items; Agent H did not modify question content for them since they are not CONFIRMED numeric errors. The Appendix-letter correction above was the verified, in-scope fix. The decimal-subsection normalization (e.g., "Sec. 4.2", "Sec. 3.3.a", "Sec. 18.2.b.iii") across this bundle's questions remains a recommended follow-up for the orchestrator.
