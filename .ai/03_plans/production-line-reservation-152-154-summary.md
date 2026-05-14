# Production-Line Reservation Summary: Batches 152-154

Generated: 2026-05-14T12:22:52+08:00
Baseline: `d3d2ec5ee1`
Branch: `3dlab-gray-viewport-bg`
Role: reservation only

## Scope

Create fixed non-overlapping reservations for the next sourceable residual non-prac local-first content batches after accepted Batch 151. This coordinator did not reserve `lea-prac`, did not edit article folders, source folders, question-edits, code files, package files, or git state, and did not stage, commit, push, deploy, run Supabase, touch DB state, or merge main.

## Reservation Manifests

| Batch | Manifest | Reserved clusters | Selection note |
| --- | --- | --- | --- |
| 152 | `.ai/03_plans/production-line-batch-152-reservation-manifest.json` | `lea-matl-007-04`, `lea-matl-007-05`, `lea-matl-007-06` | Continues from the known next candidate and completes the remaining locally sourceable finishes/materials `007-*` residuals. |
| 153 | `.ai/03_plans/production-line-batch-153-reservation-manifest.json` | `lea-matl-008-01`, `lea-matl-008-02`, `lea-matl-008-03` | Continues into locally sourceable hardware, joint, and fastener clusters with verified BCI/Salvan source records. |
| 154 | `.ai/03_plans/production-line-batch-154-reservation-manifest.json` | `lea-matl-008-04`, `lea-matl-008-05`, `lea-matl-009-01` | Completes the locally sourceable `008-*` residuals and reserves `009-01`; skips hard-blocked `009-02`. |

Each manifest records `cluster_id`, `slug`, `article_id`, `article_dir`, `title`, `linked_question_count`, source candidates/local paths, sourceability basis, known risks, and explicit non-overlap proof.

## Non-Overlap Proof

Accepted artifacts scanned:

```text
.ai/03_plans/production-line-batch-{087..151}-manifest.json
.ai/content-audit-export/source-audited-article-batch-{087..151}-local-first-*.json
.ai/content-audit-export/source-audited-article-batch-{087..151}-local-first-report.md
```

Normalization used: selected slugs were compared as base cluster ids after stripping trailing `-core-concept`.

Reserved ids checked:

```text
lea-matl-007-04
lea-matl-007-05
lea-matl-007-06
lea-matl-008-01
lea-matl-008-02
lea-matl-008-03
lea-matl-008-04
lea-matl-008-05
lea-matl-009-01
```

Result: none of the reserved ids appeared in accepted Batch 087-151 selected-cluster scans, none overlap internally across Batches 152-154, none are in the consumed Batch 149-151 list, and none are in the hard-blocked carry-forward list.

## Hard-Blocked Clusters Not Reserved

No completed recovery report was found under `.ai/03_plans/blocked-source-recovery/`; only prompt files were present. These carry-forward clusters remain excluded:

```text
lea-theo-008-02
lea-theo-008-03
lea-matl-009-02
lea-util-004-05
lea-util-004-08
lea-strc-004-02
```

## Additional Deferrals And Exclusions

| Cluster | Status | Reason |
| --- | --- | --- |
| `lea-strc-007-03` | Not reserved | Exact NSCP deflection/thickness table support remains undiscovered in readable local sources. |
| `lea-strc-007-05` | Not reserved | Exact embedded-conduit limit support remains undiscovered in readable local structural sources. |
| `lea-strc-009-01` | Not reserved | Timber durability/species support remains weaker than required for exact local claims. |
| `lea-strc-009-02` | Not reserved | Timber stress-group/species-table support remains weaker than required for exact local claims. |
| `lea-strc-009-03` | Not reserved | Timber allowable-stress/species/group claims still need better exact local support. |
| `lea-strc-012-01` | Not reserved | Wind load provisions rely on exact NSCP/ASCE/IBC-style code support; no completed readable local capture was found for a claim-safe reservation. |
| `lea-matl-009-02` | Hard-blocked | CSI MasterFormat remains carry-forward blocked unless a completed recovery/source path exists. |
| `lea-matl-009-03` | Sourceable residual not reserved | Likely sourceable from local RA 9266, PD 1096, and UAP SPP records; deferred by Batch 154 size cap. |
| `lea-matl-009-04` | Sourceable residual not reserved | Likely sourceable from local PD 1096, RA 9266, UAP SPP, and Design Process records; deferred by Batch 154 size cap. |

## Sourceability Basis

- `lea-matl-007-04` through `lea-matl-008-05` carry verified local BCI 5e and Salvan source records in their article `sources.json` files and have existing local raw/refined Vitruvius paths.
- `lea-matl-009-01` carries verified local RA 9266 IRR, UAP SPP 202, and UAP SPP 203 source records and has existing local raw/refined Vitruvius paths.
- Internet discovery was not needed for these reservations.

## Exhaustion Evidence

Enough eligible clusters existed for exactly three 3-cluster manifests. No smaller exhaustion or freeze manifest was needed. The next known residuals after this reservation set are `lea-matl-009-03` and `lea-matl-009-04`, while `lea-matl-009-02` remains hard-blocked.

## Validation Evidence

- `jq empty` over the three reservation manifests: PASS.
- Duplicate scan across the three reserved manifests: PASS, 9 unique reserved cluster ids.
- Accepted-manifest/report/ledger overlap scan across Batches 087-151: PASS, 279 accepted artifacts scanned, no reserved ids found.
- Hard-blocked intersection scan: PASS, no hard-blocked ids reserved.
- Source-path candidate existence scan for every manifest source candidate and article directory: PASS, no missing paths.
- Manifest metadata cross-check against article `article-metadata.json`: PASS.
- Forbidden-scope status scan over article folders, source folders, `src`, and package/lock files: WARN, one pre-existing deletion remains at `.ai/content-audit-export/articles/lea-strc-011-03-core-concept--d7de9bc9-ea50-46d1-8079-2dd3cc0378e7/compose-error.json`; no reservation task files were outside `.ai/03_plans`.
- `git diff --check` over only reservation files: PASS, no whitespace warnings.
