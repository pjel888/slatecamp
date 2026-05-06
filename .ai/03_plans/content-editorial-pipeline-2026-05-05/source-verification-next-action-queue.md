# Source Verification Next Action Queue — Phase 0.7

Evidence-only queue. No source approval, source-pack creation, embeddings, article/question edits, Supabase mutation, or admin live sync.

Current control artifacts:

- `source-reconciliation-matrix.generated.csv/json`
- `source-locator-evidence.generated.csv/json`
- `source-human-sme-packet-prep.generated.md/json`
- `source-human-sme-review-queue.generated.md`
- `source-human-sme-conflict-queue.generated.md`

1. PD 1216 — Locator evidence exists from local derivative scan, but official OG/Senate capture remains blocked. Keep in conflict/human queue until official body/PDF capture and hash comparison are resolved.
2. RA 11201 — 001 raw matches Official Gazette hash, but conversion-layer mismatch remains. Use locator examples only as navigation aids; SME/human must disposition raw-vs-derived conflict before any future source-pack work.
3. RA 11285 statute — Locator evidence exists and exact hash match remains. Queue for human packet review only; do not approve.
4. DOE DC2019-11-0014 — Treat as separate IRR packet-prep item from RA 11285 statute. Locate/add raw official DOE PDF and compare hash `700816d6b0c8222ecb505fed36404978eadbd960920a18a80a4c396426413821`; do not merge into statute approval.
5. BP 344 2024 Revised IRR — Locator evidence exists from local candidate, but local webpage-print/export vs official NCDA downloadable PDF conflict remains. SME/human conflict disposition required.
6. PD 1096 / NBCP IRR — Locator evidence exists from local candidate, but local DPWH Official PDF differs from current DPWH 432-page official PDF hash. Compare all local PD1096 variants before any packet review.
7. RA 9514 RIRR — Locator evidence exists from local candidate, but BFP/OG official-host capture remains unresolved. Keep provenance blocker explicit.
8. RA 9266 / IRR — Locator evidence exists from local candidate, but PRC/PRBoA/OG/Senate official host/provenance remains unresolved. Keep provenance blocker explicit.
9. PRC ALE/LEA program — Locator evidence can support exam-scope/logistics metadata only. Never treat as legal/code source truth; do not source-pack as law/code grounding.

Next safe implementation options:

1. Add fixture tests for source reconciliation and locator scripts.
2. Add stricter forbidden-label/status-union regression tests.
3. Improve admin dry-run payload validation.
4. Run an approved local-only PDF extraction spike without uploading local source files externally.

Blocked next actions:

- source approval
- source-pack creation
- chunking
- embeddings
- article rewriting
- question editing
- Supabase mutation
- admin live sync
- Phase 1B
