# Source Bundle Reconciliation Report — Phase 0.5A.3

**Generated:** 2026-05-05T15:21:16Z
**Status:** Evidence/planning only. No source approval. No source-pack creation. No article/question edits. No Supabase mutation.

## Summary

- Input files reconciled: 2551
- Source bundles generated: 1528
- Files assigned to exactly one bundle: 2551
- Unassigned physical files: 0
- Allowed use: `DISCOVERY_ONLY` for every bundle
- Verification status: `unverified` for every bundle
- Duplicate hash groups detected: 11 groups / 24 physical files. This is byte-identity evidence only and must not be double-counted as independent source authority.

## Bundle Status Counts

| bundle_status | count |
| --- | --- |
| BUNDLED_UNVERIFIED | 854 |
| BUNDLED_DERIVED_ONLY | 629 |
| BUNDLED_WITH_PDF | 45 |

## Risk Counts

| risk_tier | bundle_count |
| --- | --- |
| MEDIUM | 1164 |
| LOW | 319 |
| HIGH | 45 |

## Risk by Source Family

| risk_tier | source_family | bundle_count |
| --- | --- | --- |
| HIGH | building_technology_reference | 4 |
| HIGH | history_theory_reference | 2 |
| HIGH | law_code_policy | 28 |
| HIGH | structural_reference | 8 |
| HIGH | utilities_reference | 3 |
| LOW | building_technology_reference | 38 |
| LOW | history_theory_reference | 35 |
| LOW | law_code_policy | 174 |
| LOW | structural_reference | 46 |
| LOW | utilities_reference | 26 |
| MEDIUM | building_technology_reference | 156 |
| MEDIUM | history_theory_reference | 487 |
| MEDIUM | law_code_policy | 424 |
| MEDIUM | structural_reference | 54 |
| MEDIUM | utilities_reference | 43 |

## Source Family Counts

| source_family | bundle_count |
| --- | --- |
| law_code_policy | 626 |
| history_theory_reference | 524 |
| building_technology_reference | 198 |
| structural_reference | 108 |
| utilities_reference | 72 |

## PDF/Text Pair Confidence

| pdf_text_pair_confidence | bundle_count |
| --- | --- |
| unknown | 854 |
| derived_only | 629 |
| direct_extraction | 45 |

## Review Requirement Counts

| review_required | bundle_count |
| --- | --- |
| ADMIN | 1181 |
| ADMIN_OPTIONAL | 319 |
| SME_ADMIN | 28 |

## Column Interpretation Warnings

- `identity_match_confidence` is heuristic confidence from filename/path/source_id grouping signals. It is not official-source verification confidence.
- `risk_tier` is inherited from the file-level intake heuristic and is not a final legal/content risk ruling.
- `title_quality` and `needs_human_triage` flag noisy or short titles that need human cleanup before packet assembly.

## Key Findings

1. The reconciliation pass produced 1528 conservative bundles from 2551 physical files.
2. 45 bundles contain at least one retained PDF candidate.
3. 629 bundles are derived-only or metadata-only and cannot become source-pack grounding material without parent-source verification.
4. 28 of the 45 High-risk bundles are law-code-policy bundles requiring official-web and SME/admin review first; the remaining High-risk bundles are non-law/reference families and still remain unverified.
5. 1496 bundles need pairing/identity/title triage before packet assembly; see `source-bundle-unpaired-files.md` for a representative Markdown sample and the CSV/JSON for exhaustive rows.

## Gate Verdict

```txt
PHASE_0_5A_3_SOURCE_BUNDLE_RECONCILIATION = COMPLETE_FOR_PLANNING_EVIDENCE
SOURCE_PACK_CREATION = BLOCKED
ARTICLE_REWRITING = BLOCKED
QUESTION_BANK_EDITING = BLOCKED
SUPABASE_MUTATION = BLOCKED
ALL_BUNDLES_ALLOWED_USE = DISCOVERY_ONLY
ALL_BUNDLES_VERIFICATION_STATUS = unverified
```

## Next Planning Gate

Proceed to Phase 0.5B candidate official-source URL discovery planning and Phase 0.5B.1 draft verification packet preparation. These are still pre-implementation/planning gates and do not approve sources.
