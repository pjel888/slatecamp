# Council Remediation — bp-344-vs-pd-1096-conflicts (ee1f8beb)

Remediation date: 2026-07-20
Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation`
Status: VERIFIED — framework article clean; section-cite cleanup already accomplished by prior batch (no commits, no branch switch, no Supabase writes)

## Governing source

- `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`
- PD 1096 (National Building Code) — framework source for permit/building-official context.

## Agent C finding for this bundle

"Framework article; clean. 0 CONFIRMED_ERROR, 0 SECTION_MISMATCH, 0 UNSOURCED."

## Status: APPLIED (via prior batch) + VERIFIED by Agent H

### Content — VERIFIED CORRECT (framework/conceptual), no changes

Agent H confirmed the 11 question-edit files (`approved_by: codex-local-source-audit-batch-032`) contain source-aligned framework content distinguishing BP 344 (specific accessibility minimums) from PD 1096 (permit/building-code framework, Building Official enforcement). Sample verified concepts:
- PD 1096 supplies the permit framework; BP 344 supplies specific accessibility dimensions.
- The Building Official processes permits/certificates under PD 1096.
- Allied professional/government agency codes approved by DPWH serve as referral codes where applicable and consistent.
- PD 1096 permit requirements include accessibility facilities (accessible lifts/elevators; accessible audio-visual and automatic alarm systems).

### Section-citation cleanup — ALREADY APPLIED by prior batch-032

The original `linked-questions.json` contains invented decimal citations ("Sec 1.2.a", "Sec 1.2.f", "Sec 6.3", "Sec 8.8.b"). The 11 question-edit files already removed these. Agent H confirmed: `grep "Sec [0-9]\." question-edits/*.json` returns 0 matches.

### Agent H decision: no further edit applied

The prior batch-032 edits already solve the documented citation problem. Agent C found no numeric or conceptual errors in this bundle.

## Files modified by Agent H

- `council-remediation-2026-07-20.md` — this file (created).

No other files in this bundle were edited. The 11 `question-edits/*.json` files were inspected and verified; NOT modified by Agent H.
