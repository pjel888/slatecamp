# Phase 0.5D Source-Pack Build Plan — Planning Only

**Generated:** 2026-05-05T15:48:50Z
**Status:** Build plan only. No source packs, chunks, embeddings, or source approvals are created.
**Gate:** Source-pack implementation remains blocked until at least one verification packet is human/SME-approved and governance decisions are resolved or explicitly deferred.

## 1. Inputs

| Input | Current evidence | Build impact |
| --- | --- | --- |
| `source-pack-schema-readiness.md` | Defines required source-pack and chunk schema | Use as target schema |
| `10-source-pack-and-grounding-plan.md` | Defines source-grounding doctrine and required high-risk source families | Use as scope anchor |
| `source-verification-packet-schema.md` | Defines packet fields and approval gate | No pack without approved packet |
| `source-pack-governance-decision-register.md` | 12 governance decisions open; embeddings blocked | Build implementation blocked |
| Phase 0.5B outputs | 85 evidence rows; 3 Lawphil Rank 5 archive rows; zero official issuing-body confirmations | No verified source candidate yet |
| `local-source-file-hashes.json` | 2,551 local files hashed | Integrity inventory exists |
| `source-bundle-map.generated.json` | 1,528 source bundles; all `DISCOVERY_ONLY` and unverified | Bundle map exists but no approved source |

## 2. Current gate verdict

```txt
SOURCE_PACK_BUILD_PLAN = READY_AS_PLAN
SOURCE_PACK_BUILD_IMPLEMENTATION = BLOCKED
APPROVED_VERIFICATION_PACKETS = 0
VERIFIED_SOURCE_CANDIDATES = 0
SOURCE_PACK_FILES_CREATED = 0
CHUNKS_CREATED = 0
EMBEDDINGS_CREATED = 0
```

## 3. Minimum unblock requirements

A first source-pack build may begin only after all of these are true:

1. One verification packet has a human/SME decision approving `GROUNDING_CANDIDATE` or stricter.
2. The packet identifies retained local primary source file(s) with SHA-256 hashes.
3. The packet records official-source evidence or a documented expert-review exception.
4. Locator support is assessed and meets risk-tier requirements.
5. Extraction quality is assessed as usable.
6. SPG-001 storage location is decided.
7. SPG-003 copyright model is decided or source classified as allowed for local processing only.
8. SPG-004 provider boundary is decided.
9. SPG-005 chunk strategy is decided.
10. SPG-006 locator policy is decided.
11. SPG-007 versioning policy is decided.
12. Embeddings remain disabled unless SPG-009 is later approved.

## 4. Recommended storage default for first pilot, pending Philip approval

Recommended conservative default:

```txt
.ai/16_source_packs/
  README.md
  manifests/
  packs/
  packets/
  validation/
```

Rationale:

- Keeps source packs separate from `.ai/content-audit-export/`, which is an export/work artifact surface.
- Keeps primary files in `vitruvius-connection/`; source packs reference hashes and excerpts but do not relocate the raw USB/source intake.
- Allows versioning and validation artifacts without confusing source intake with generated packs.

This is only a recommendation. Do not create this folder until SPG-001 is approved.

## 5. Proposed source-pack ID convention

Pattern:

```txt
{document-code-slug}-{document-family-or-version}-{year}-v{semver}
```

Examples:

- `pd1216-open-space-1977-v0.1.0`
- `ra11201-dhsud-act-2019-v0.1.0`
- `ra11285-energy-efficiency-2019-v0.1.0`
- `pd1096-nbc-irr-2004-v0.1.0`

Rules:

- Never use `current` in IDs.
- Include document code and year where known.
- Use `v0.1.0` for pilot/pre-production packs.
- Increment version when source text, chunk boundaries, locators, or verification status changes.

## 6. Proposed chunking strategy

For legal/code/statute text:

| Source structure | Primary chunk boundary | Secondary locator |
| --- | --- | --- |
| Law or decree sections | One section per chunk | paragraph identifier if long |
| IRR rules | Rule + section per chunk | subsection/paragraph |
| Tables | One table per chunk, with row/column metadata | page + section |
| Formulas | One formula per chunk, with variables separated | page + section |
| Definitions | One definition or grouped related definitions | section/paragraph |

Pilot default:

- Prefer section-level chunks.
- Split chunks over ~1,200 words by paragraph while preserving shared section label.
- Do not chunk from OCR text without extraction-quality flag.
- Every chunk must have `text_hash`.
- High-risk legal/code chunks must have page or section locator before use.

This remains a planning default until SPG-005/SPG-006 are approved.

## 7. First-pack build sequence after approval

1. Select one approved verification packet.
2. Create a source-pack work branch/worktree.
3. Create source-pack folder and manifest skeleton.
4. Copy/derive only approved excerpts or normalized text references; do not move/delete raw files.
5. Generate chunks deterministically from approved text.
6. Compute chunk hashes and source-pack hash.
7. Validate schema and hash stability.
8. Run locator spot-check report.
9. Create `claim-linkage-smoke.md` for 3–5 pilot article claims, no article edits.
10. Submit for human/SME review.
11. Only after approval, mark pack as pilot-ready.

## 8. Source-pack validation rules

A generated source pack must fail validation if:

- `source_pack_id` is missing or non-unique.
- `raw_file_hash` is missing for local primary-source based pack.
- `source_pack_hash` is missing or unstable.
- Any chunk lacks `chunk_id`, `text`, `text_hash`, or locator fields.
- Any legal/code chunk lacks structured `legal_citation.law_code` where applicable.
- `verification_status` is stronger than the source verification packet decision.
- `provider_boundary_classification` is missing.
- A Rank 5 statute archive is treated as official issuing-body confirmation.
- Any article/question edit is generated as part of source-pack creation.

## 9. Provider and embedding boundary

Until SPG-004 and SPG-009 are approved:

- No local PDFs uploaded to external providers.
- No extracted copyrighted/textbook material uploaded to external providers.
- No embeddings generated.
- Source-pack chunking may be local-only and deterministic.
- AI may inspect only approved excerpts if provider boundary allows it later.

## 10. Admin AI audit linkage after source-pack approval

After a source pack is approved, admin audit may display:

- Source pack ID.
- Verification packet ID.
- Bundle ID.
- Source-pack version/hash.
- Review decision.
- Open findings or conflicts.

Admin audit must not become the source of truth for source text. It is a review/status surface; source packs remain the source-grounding artifact.

## 11. Phase 0.5D future implementation tasks

| Task | Output | Blocked by |
| --- | --- | --- |
| Decide storage location | SPG-001 decision update | Philip/admin |
| Decide provider boundary | SPG-004 decision update | legal/admin |
| Decide chunking/locator policy | SPG-005/SPG-006 decision update | editorial/SME |
| Create source-pack schema validator | future script | implementation approval |
| Create first pack skeleton | future `.ai/16_source_packs/...` file | approved verification packet |
| Create chunk hash validator | future script | implementation approval |
| Create claim-linkage smoke report | future report | approved pack candidate |

## 12. Recommended first candidates

Current Phase 0.5B evidence does not approve any candidate. If human/SME review later approves them, the three Rank 5 Lawphil packet drafts are low-complexity candidates for testing the schema, but they are not ideal high-coverage ALE source packs:

| Bundle | Evidence status | Strength | Limitation |
| --- | --- | --- | --- |
| `bundle-000017` PD 1216 | `NEEDS_HUMAN_VERIFICATION` | Short legal text; simple section chunking | Rank 5 archive only; Official Gazette unresolved |
| `bundle-000018` RA 11201 | `NEEDS_HUMAN_VERIFICATION` | Statute text; urban planning relevance | Rank 5 archive only; not core high-coverage code pack |
| `bundle-000019` RA 11285 | `NEEDS_HUMAN_VERIFICATION` | Statute text; sustainability relevance | Rank 5 archive only; not primary ALE code source |

For high-coverage ALE source grounding, future official-source verification should still prioritize PD 1096 IRR, BP 344 IRR, RA 9514/RIRR, RA 9266/IRR, PD 957, BP 220, and SPP documents.

## 13. Final Phase 0.5D verdict

```txt
PHASE_0_5D_SOURCE_PACK_BUILD_PLAN = COMPLETE_AS_PLAN
FIRST_SOURCE_PACK_IMPLEMENTATION = BLOCKED
SOURCE_PACK_VALIDATOR_IMPLEMENTATION = BLOCKED_UNTIL_APPROVED
SOURCE_PACK_STORAGE_LOCATION = OPEN
EMBEDDINGS = BLOCKED
PHASE_1B = BLOCKED
```
