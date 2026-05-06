# Phase 0.5B.5 — Three Packet Status Update

CLAUDE_REVIEW_STATUS = CLAUDE_UNAVAILABLE_TOKEN_LIMIT
CLAUDE_REVIEW_PENDING = true

| bundle_id | document | Phase 0.5B.5 decision | reason |
|---|---|---|---|
| bundle-000017 | PD 1216 | needs_more_evidence | Senate LRB/Official Gazette access still security-gated; no official PDF/body captured in this runtime. |
| bundle-000018 | RA 11201 | ready_for_human_packet_review | Official Gazette PDF hash and SC E-Library citation carried forward from Phase 0.5B.4; local file/hash/text/locator matching still required. |
| bundle-000019 | RA 11285 | ready_for_human_packet_review | RA Official Gazette PDF and SC E-Library citation carried forward; DOE IRR official page lead improved but detailed DOE PDF/date capture still incomplete. |

No packet is source-pack-ready. No source status was promoted.


## Fallback review correction note

DeepSeek fallback review required stable row IDs/run IDs, explicit DISCOVERY_ONLY row use, local hash comparison notes, locator-status notes, and expanded conflict-register coverage. Those fields/notes were added in Phase 0.5B.5 corrections. RA 11201 now carries a hash-mismatch review flag because the local OCR PDF hash differs from the Official Gazette PDF hash.

## Phase 0.5B.6 reconciliation note

Claude tokens were renewed and Claude human-style review completed after retry. Hermes reconciled Claude findings with newly added `vitruvius-connection/001_Raw-Source-Layer` PDFs. Key updates: RA 11201 001 raw PDF matches Official Gazette hash but older 002 OCR/conversion hash differs (`conflict_requires_sme`); RA 11285 001 raw PDF matches Official Gazette hash; DOE DC2019-11-0014 official legacy DOE PDF was captured and hashed; PRC 2026 schedule/program was captured as logistics-only evidence. All source approval/source-pack/embedding/article/question/Supabase gates remain blocked.
