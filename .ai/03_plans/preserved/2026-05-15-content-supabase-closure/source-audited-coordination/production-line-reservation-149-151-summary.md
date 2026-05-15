# Production-Line Reservation Summary: Batches 149-151

Generated: 2026-05-14T11:30:56+08:00
Baseline: `6fb4fcb0f5`
Branch: `3dlab-gray-viewport-bg`
Role: reservation only

## Scope

Create fixed non-overlapping reservations for the next sourceable residual non-prac local-first content batches after accepted Batch 148. This coordinator did not reserve `lea-prac`, did not edit article folders, source folders, question-edits, package files, or code files, and did not stage, commit, push, deploy, run Supabase, touch DB state, or merge main.

## Reservation Manifests

| Batch | Manifest | Reserved clusters | Selection note |
| --- | --- | --- | --- |
| 149 | `.ai/03_plans/production-line-batch-149-reservation-manifest.json` | `lea-strc-011-03`, `lea-matl-006-01`, `lea-matl-006-02` | Consumes the remaining locally sourceable geotechnical structures residual, skips exact wind-code cluster `lea-strc-012-01`, then moves to sourceable roofing/materials clusters. |
| 150 | `.ai/03_plans/production-line-batch-150-reservation-manifest.json` | `lea-matl-006-03`, `lea-matl-006-04`, `lea-matl-006-05` | Continues sourceable materials envelope clusters with verified local Salvan and BCI source records. |
| 151 | `.ai/03_plans/production-line-batch-151-reservation-manifest.json` | `lea-matl-007-01`, `lea-matl-007-02`, `lea-matl-007-03` | Continues sourceable finishes clusters with verified local BCI 5e and Salvan source records. |

Each manifest records `cluster_id`, `slug`, `article_id`, `article_dir`, `title`, `linked_question_count`, source-path candidates, why the cluster is sourceable, known risks, and explicit non-overlap proof.

## Non-Overlap Proof

Accepted artifacts scanned:

```text
.ai/03_plans/production-line-batch-{087..148}-manifest.json
.ai/content-audit-export/source-audited-article-batch-{087..148}-local-first-*.json
.ai/content-audit-export/source-audited-article-batch-{087..148}-local-first-report.md
```

Normalization used: selected slugs were compared as base cluster ids after stripping trailing `-core-concept`.

Reserved ids checked:

```text
lea-strc-011-03
lea-matl-006-01
lea-matl-006-02
lea-matl-006-03
lea-matl-006-04
lea-matl-006-05
lea-matl-007-01
lea-matl-007-02
lea-matl-007-03
```

Result: none of the reserved ids appeared in accepted Batch 087-148 selected-cluster scans, none overlap Batches 149-151 internally, none are in the recently consumed Batch 146-148 list, and none are in the hard-blocked carry-forward list.

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
| `lea-matl-007-04` | Sourceable residual not reserved | Likely sourceable paint-systems residual, deferred by the Batch 151 size cap. Candidate for Batch 152. |

## Sourceability Basis

- `lea-strc-011-03` is sourceable through existing local Foundation Engineering raw/refined paths plus BSI supporting text already proven in Batch 148.
- `lea-matl-006-01` through `lea-matl-006-05` carry verified local Salvan and BCI source records in their article `sources.json` files and have existing local raw/refined source paths.
- `lea-matl-007-01` through `lea-matl-007-03` carry verified local BCI 5e and Salvan source records in their article `sources.json` files and have existing local raw/refined source paths.

## Exhaustion Evidence

Enough eligible clusters existed for exactly three 3-cluster manifests. No smaller exhaustion or freeze manifest was needed. The next known sourceable residual after this reservation set is `lea-matl-007-04`, pending Batch 152 or later.

## Validation Evidence

- `jq empty` over the three reservation manifests: PASS.
- Duplicate scan across the three reserved manifests: PASS, 9 unique reserved cluster ids.
- Accepted-manifest/report/ledger overlap scan across Batches 087-148: PASS, 264 accepted artifacts scanned, no reserved ids found.
- Hard-blocked intersection scan: PASS, no hard-blocked ids reserved.
- Source-path candidate existence scan for every manifest source candidate and article directory: PASS, no missing paths.
- Forbidden-scope status scan over article folders, source folders, `src`, and package/lock files: PASS, no output.
- `git diff --check --no-index /dev/null <file>` over the three manifests and this summary: PASS.
