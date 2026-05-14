# Source-Audited Article Batch 156 Local-First Report

## Result

Status: passed_local_validation_git_handoff_ready

Batch 156 used only the reservation manifest .ai/03_plans/production-line-batch-156-reservation-manifest.json and edited the single reserved cluster: lea-strc-009-03.

## Baseline Note

The user-stated content baseline is 80d1f473c. The branch currently includes the committed blocked-source recovery record 460938766, which was used only as read-only recovery evidence and was not modified by this batch.

## Selected Cluster

- lea-strc-009-03: Allowable Stress Design (ASD) (10/10 linked questions refreshed)

## Source Discipline

All article, scenario, and question-edit claims are constrained to local Vitruvius structural mechanics sources captured in Batch 156 source maps:

- vitruvius-connection/001_Raw-Source-Layer/006 -Structural/source-map-batch-156/asd-mechanics.source-capture.md
- vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/source-map-batch-156/asd-mechanics.refined.md

No internet source was used. Wikipedia was not used. Exact NSCP timber tables, species stress groups, Philippine species values, and uncaptured adjustment factors remain outside this batch.

## THIN_NEEDS_EXPANSION, Scenario, Question Alignment, Source-Primary Findings

- THIN_NEEDS_EXPANSION: resolved and preserved in the article text.
- Scenario: included as a source-safe roof-beam ASD review using supplied Fb/Fv values.
- Question alignment: 10 linked questions are bounded to ASD inequality, unit conversion, section modulus, moment of inertia, maximum rectangular shear, and supplied-factor arithmetic.
- Source-primary finding: Mechanics and Strength of Materials supports allowable stress and section modulus checks; Applied Strength of Materials supports rectangular maximum shear.

## Excluded Clusters

- Theory clusters lea-theo-008-02 and lea-theo-008-03 remain excluded because authoritative web sources were not locally captured in this run.
- NSCP-dependent structural clusters remain excluded because the local NSCP file is corrupted and no legitimate extraction was available.

## Validation

- compose_diff_validate: pass
- ui_block_validation: pass
- json_parse: pass
- placeholder_internal_note_source_gap_scan: pass
- unsupported_exact_claim_scan: pass
- source_hash_checks: pass
- question_edit_count: pass
- linked_question_question_edit_parity: pass
- answer_key_change_review: pass_no_answer_key_changes
- stale_compose_error_scan: pass
- targeted_content_audit_tests: pass
- scoped_git_diff_check: pass

## Validation Boundary

Scoped validation covers the generated Batch 156 article, source-map, source, question, QA, and handoff paths directly. Root aggregate files such as sync-state.json, validation-report.json, and ui-block-edit-validation.json are not staging targets for this batch.

## Stop Condition

Stop after the single reserved structural cluster is source-audited, scoped validation artifacts are written, independent QA passes with zero blockers, and exact git handoff paths are listed without staging unrelated dirty files.
