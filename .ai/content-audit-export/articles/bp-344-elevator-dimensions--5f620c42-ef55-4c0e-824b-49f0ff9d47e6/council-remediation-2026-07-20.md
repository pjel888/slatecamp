# Council Remediation — bp-344-elevator-dimensions (5f620c42)

Remediation date: 2026-07-20
Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation`
Status: VERIFIED — numeric claims correct; section-cite cleanup already accomplished by prior batch (no commits, no branch switch, no Supabase writes)

## Governing source

- `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Agent C finding for this bundle

"Section-cite cleanup only, numeric claims verified correct. Core dimensions CONFIRMED; cite cleanup needed (decimal secs 8.7.c etc.)."

## Status: APPLIED (via prior batch) + VERIFIED by Agent H

### Numeric claims — VERIFIED CORRECT, no changes

Agent H confirmed the 11 question-edit files (`approved_by: codex-local-source-audit-batch-032`) contain source-correct values:
- **Elevator car: 1400 mm depth x 1200 mm width** — source verbatim (lines 1339-1340, PDF p.41): "Accessible elevator cars shall have a minimum clear dimension of 1400 mm in depth and 1200 mm in width, with a clear door opening of not less than 900 mm."
- **Clear door opening: not less than 900 mm** ✓
- **Elevator lobby clear space: 1800 mm x 1800 mm** ✓
- **Car operating panel: 900 mm on center** ✓
- **Braille floor indicators: 1200 mm AFF** ✓

### Section-citation cleanup — ALREADY APPLIED by prior batch-032

The 11 question-edit files already removed the invented decimal subsection citations ("Sec 8.4", "Sec 8.5", "Sec 8.6", "Sec 8.6.d", "Sec 8.7.a/b/c", "Sec 8.8.b", "Sec 8.9", "Sec 8.10", "Sec 8.11", "Sec 8.12") that appear in the original `linked-questions.json`. Agent H confirmed: `grep "Sec [0-9]\." question-edits/*.json` returns 0 matches. Proposed citations now use source-grounded locators with full provenance.

### Agent H decision: no further edit applied

Same rationale as bundle bp-344-accessible-washrooms: the prior batch-032 edits already solve the documented citation problem using valid, source-grounded, topically-aligned rewrites with verified-correct numbers. The one Agent-C "UNSOURCED" note ("updated from 1100 mm") is a historical-comparison claim, not an active numeric error in the proposed edits.

## Files modified by Agent H

- `council-remediation-2026-07-20.md` — this file (created).

No other files in this bundle were edited. The 11 `question-edits/*.json` files were inspected and verified; NOT modified by Agent H.
