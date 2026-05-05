# Data Artifact Schema Plan

## Objective

Define durable local artifacts for the editorial pipeline before implementing workers.

## Artifact location

Each article bundle may receive an `editorial/` subfolder:

```text
.ai/content-audit-export/articles/<article-folder>/editorial/
  editorial-diagnosis.json
  fact-ledger.json
  rewrite-plan.json
  proposed-edits.json
  fact-check-report.json
  pedagogy-report.json
  component-validation.json
  question-validation.json
  review-packet.md
```

## Shared metadata fields

Every JSON artifact should include:

```json
{
  "schema_version": "2026-05-05.v1",
  "article_id": "uuid-or-id",
  "slug": "article-slug",
  "export_id": "from manifest/run-log when available",
  "created_at": "ISO timestamp",
  "created_by": "script-or-agent-name",
  "input_hashes": {
    "normalized_md": "sha256 hex",
    "ui_blocks_json": "sha256 hex",
    "linked_questions_json": "sha256 hex",
    "sources_json": "sha256 hex"
  }
}
```

## `editorial-diagnosis.json`

Purpose: Triage before editing.

Required fields:
- `accuracy_risk`
- `structure_quality_score`
- `writing_quality_score`
- `exam_relevance_score`
- `source_sufficiency`
- `component_usage_assessment`
- `linked_question_risk`
- `recommended_action`
- `review_level`
- `rationale`

## `fact-ledger.json`

Purpose: Atomic claim inventory and source mapping.

Required fields per claim:
- `claim_id`
- `claim_text`
- `claim_type`: definition, dimension, legal_section, penalty, formula, process, date, classification, interpretation, example
- `risk`: low, medium, high, critical
- `source_status`: original_article, source_verified, source_needed, unsupported, contradiction
- `source_refs`
- `must_preserve`
- `notes`

## `rewrite-plan.json`

Purpose: Learning design plan before edit proposal.

Required fields:
- `target_reader`
- `learning_objectives`
- `recommended_outline`
- `sections_to_keep`
- `sections_to_reorder`
- `sections_to_delete`
- `missing_sections`
- `component_recommendations`
- `question_recommendations`
- `risk_notes`

## `proposed-edits.json`

Purpose: Machine-applicable patch plan, not full uncontrolled rewrite.

Required fields:
- `prose_edits`
- `component_edits`
- `question_edits`
- `source_needed`
- `fact_changes`
- `new_claims`
- `human_review_required`

## `fact-check-report.json`

Purpose: Strict post-edit review.

Required fields:
- `unsupported_claims`
- `changed_facts`
- `dangerous_overgeneralizations`
- `citation_gaps`
- `answer_key_risks`
- `verdict`: pass, pass_with_warnings, needs_human_review, fail

## `pedagogy-report.json`

Purpose: Teaching-quality review only.

Required fields:
- `has_specific_learning_objective`
- `has_board_exam_angle`
- `has_worked_example`
- `has_common_mistake`
- `has_retrieval_practice`
- `cognitive_load_issues`
- `recommendations`

## `component-validation.json`

Purpose: Deterministic component validation.

Required fields:
- `unknown_components`
- `invalid_props`
- `invalid_nesting`
- `broken_placeholders`
- `unresolved_placeholders`
- `mdx_compile_status`
- `verdict`

## `question-validation.json`

Purpose: Linked question and proposed question edit validation.

Required fields:
- `questions_checked`
- `answer_key_risks`
- `missing_correct_option_id`
- `duplicate_options`
- `length_parity_issues`
- `article_alignment_issues`
- `proposed_question_edits_valid`
- `verdict`
