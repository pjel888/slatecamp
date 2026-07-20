# Council Remediation 2026-07-20 — lea-prac-law-002 (Agent W)

**Bundle:** lea-prac-law-002 — Scope of Practice: What Architecture Covers and What It Does Not
**Article ID:** `7e511a5d-edb1-4622-8f0f-29c1a631c145`
**Auditing agent:** Agent W (lea-prac-svc + lea-prac-law streams)
**Governing source:** RA 9266 IRR Section 3 (Definitions, including scope of practice at §3(4)).

## Summary of review

All ten linked questions were checked against the IRR Section 3 enumeration of architectural scope. The bundle's article body correctly states that "Section 3(4) then lists ten service categories, lettered (a) through (j)." The IRR enumeration confirms ten categories: (a) planning; (b) consultation; (c) appraisal; (d) structural conceptualization; (e) architectural interiors; (f) site development and utility layouting; (g) building administration; (h) construction supervision; (i) project management; (j) all other works requiring the professional competence of an architect.

One question in this bundle was both structurally malformed and substantively wrong, and the prior Batch 094 edit failed to repair either problem.

## Agent W confirmed errors and remediation

### 1. `ae2dd470-af9a-49d3-b2ae-03968c51a4a1` — CONFIRMED_ERROR (structural + substantive)

- **Question:** "According to Section 20 of the IRR, how many primary service categories does architectural practice encompass?" (Original referenced the wrong section, Section 20, which is unrelated to scope of practice.)
- **Marked-correct option:** `c` — "9 categories".
- **Structural corruption in the source JSON:**
  - The third option object is missing its `id` field (should be `id: "c"`).
  - The third option object carries an inline `correct_option_id: "b"` key, which collides with the question-level `correct_option_id: "c"` and creates an ambiguous answer key.
  - The option list omits any "10 categories" choice, even though the marked-correct rationale itself states "exactly ten primary categories."
- **Substantive error:** The correct count under RA 9266 IRR §3(4) is **ten lettered categories (a)-(j)**, not nine. The original question's own `takeaway` admits "ten categories" while its marked-correct answer says nine — an internal contradiction.
- **Why the prior Batch 094 edit was insufficient:** The 2026-05-12 Batch 094 edit for `ae2dd470` only updated the question text to "According to RA 9266 IRR Section 3(4), how many lettered service categories are listed under the scope of the practice of architecture?" plus metadata. It did not touch the malformed `options` array, did not fix the duplicate `correct_option_id`, and did not add a "10 categories" option, so the structural corruption and the wrong answer persisted.
- **Remediation:** Rewrote the options array to `7 / 9 / 10 / 12`, marked `c` (10 categories) correct, restored all option `id` fields, removed the inline duplicate `correct_option_id`, and rewrote the rationale to enumerate all ten categories (a)-(j) per §3(4).
- **Remediation file:** `question-edits/ae2dd470-af9a-49d3-b2ae-03968c51a4a1.json`
- **Approved by:** `agent-W-council-remediation-2026-07-20`
- **Source citation:** RA 9266 IRR Section 3(4), verified at:
  - https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html
  - https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.2-04_IRR_RA9266%20coded.pdf
- **jq validation:** `jq empty` passes.

## Items reviewed and confirmed OK

- `64f87401` Statutory scope vs contractual scope distinction — source-safe, two-tier boundary reasoning is correct.
- `08a1c4ca` "Architectural Documents" definition — matches IRR §3.
- `470f33bb` AoR vs AiCC authority — matches IRR definitions.
- `5799550f` Seventh category (housing, community architecture) — consistent with IRR §3(4)(a)/(f) planning scope.
- `c47a6715` Structural Conceptualization vs structural design documents — source-safe, matches IRR §3.
- `c7d3979b` Sixth category NOT including physical construction — consistent with IRR scope enumeration.
- `cfc6c973` Written service agreement basis — RA 9266 §3 defines service agreement; Art 1723 of Civil Code is correct cross-citation for civil liability.
- `7d7ae21c` Second category (consultation, advice, expert testimony) — matches IRR §3(4)(b).
- `d64a8825` Tenth catch-all category (j) — source-safe, matches IRR §3(4)(j).

## Files touched

- `question-edits/ae2dd470-af9a-49d3-b2ae-03968c51a4a1.json` (rewritten by Agent W)
- `council-remediation-2026-07-20.md` (this file, added by Agent W)

## Constraint compliance

- Branch unchanged (`fact-check/article-question-remediation`).
- No commits, pushes, or branch switches.
- No primary content files modified — only `question-edits/*.json` and this per-bundle report.
- Every correction cites RA section and source URL.
