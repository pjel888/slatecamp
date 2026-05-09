# BP344 SME Review Handoff Bundle

This folder packages the current dashboard-QA source review handoff for the BP 344 Accessible Route Ramp module.

Decision: PASS for dashboard QA preview only; NO-GO for learner/public release.

Files:

- `release-gate-source-sme-review-packet.md` — release-gate evidence and blocker summary
- `sme-source-review-checklist.md` — per-rule SME approval/correction checklist
- `bp344-accessible-route-ramp-source.ts` — exact source-truth contract used by the app
- `bp344-source-rules.json` — extracted source-rule list for review tooling/spreadsheets
- `raw-pdf-text-verification.generated.md` — deterministic text-search summary against the located raw PDF
- `raw-pdf-text-verification.generated.json` — machine-readable rule-by-rule text-search evidence
- `raw-pdf-extracted-text.generated.txt` — extracted PDF text by PyMuPDF page for reviewer convenience

Current blocker:

- The raw BP 344 PDF is now located and hash-matched.
- Human/SME approval is still required before any source rule can be marked approved.
- Do not treat deterministic text-search evidence as source approval.

Located raw PDF:

`/Users/philiplewis/slatecamp/vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf`

Expected/source-contract SHA-256:

`63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`

Verified SHA-256:

`63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`
