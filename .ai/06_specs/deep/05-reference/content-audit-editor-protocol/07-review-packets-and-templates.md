# 07 — Review Packets and Templates

## Purpose

A content edit should be reviewable without asking the editor to reconstruct intent from a diff. Use a review packet for every non-trivial article or question change.

The packet can live in a PR description, issue comment, editor note, or temporary local note. If stored inside `.ai/content-audit-export/`, treat it as generated working data, not canonical documentation.

## Review packet minimum

```markdown
# Content Review Packet

Article: <title>
Article ID: <article_id>
Slug: <slug>
Bundle folder: .ai/content-audit-export/articles/<folder>/
Editor: <name or agent id>
Reviewer: <name or pending>
Review type: copy_cleanup | factual_correction | source_alignment | question_alignment | ui_preservation | mixed
Status: draft | ready_for_review | approved_for_dry_run | approved_for_apply | blocked

## Intent

<One paragraph describing the exact problem and intended correction.>

## Files touched

- normalized.md
- question-edits/<question_id>.json, if any

## Claims reviewed

1. Claim: <current claim>
   Verdict: supported | contradicted | partially_supported | outdated | unclear
   Evidence: <source label + section>
   Change: <no change | article wording changed | question edit created>

## Linked question impact

- No linked question impact.
- OR: question_edits/<question_id>.json created for <reason>.

## UI preservation notes

- Placeholders changed: none
- Raw UI blocks changed: none; unsupported in this milestone
- Unknown/unparseable blocks: none | present and escalated

## Commands run

```bash
bun run content-audit:compose -- --article-id <article_id> --overwrite
bun run content-audit:diff -- --article-id <article_id> --summary
bun run content-audit:validate -- --article-id <article_id> --summary
bun run content-audit:push:dry-run -- --article-id <article_id>
```

## Result

- compose-report blockers: <count>
- diff-report safe_to_push: true | false
- validation-report blockers: <count>
- push dry-run blockers: <count>
- stale_check_passed: true | false

## Reviewer decision

Decision: approve_dry_run | approve_apply | request_changes | block
Reason: <short reason>
```

## Fact-check finding template

Use one record per factual claim, especially for law/code/numeric requirements.

```json
{
  "claim_id": "claim_001",
  "article_id": "<article_id>",
  "location": "normalized.md heading or line range if known",
  "current_claim": "The article currently says ...",
  "verdict": "supported | contradicted | partially_supported | outdated | unclear",
  "source": {
    "label": "<source title>",
    "source_id": "<sources.json source_id if available>",
    "url_or_path": "<url or local path>",
    "section": "<section/rule/page/table>",
    "accessed_at": "2026-05-01"
  },
  "evidence_summary": "What the source establishes, in the editor's own words.",
  "confidence": "high | medium | low",
  "recommended_change": "Exact proposed article wording or no-change rationale.",
  "question_impact": "none | review_needed | question_edit_created:<question_id>",
  "reviewer_notes": "Anything the reviewer must double-check."
}
```

## Article change summary template

```markdown
## Article change summary

Changed sections:
- <heading or paragraph>: <what changed and why>

Not changed:
- <related section>: <why no change was made>

Source basis:
- <source label>, <section/rule/page>

Risk level:
- low: wording/grammar only
- medium: factual wording but no answer-key impact
- high: legal/code/numeric/answer-key impact
```

## Question edit template

Use this as the starting shape for `question-edits/<question_id>.json`.

```json
{
  "question_id": "<question_id>",
  "baseline_hash": "sha256:<hash>",
  "reason": "Source-backed reason for the change.",
  "approved_by": "<reviewer id>",
  "approved_at": "2026-05-01T00:00:00.000Z",
  "proposed": {
    "text": "<new question text>",
    "options": [
      { "id": "A", "text": "<option A>" },
      { "id": "B", "text": "<option B>" }
    ],
    "correct_option_id": "<id if changed>",
    "explanation": "<source-backed explanation>",
    "code_citation": "<law/code/source citation>"
  }
}
```

Remove fields that are not changing. Do not include review commentary inside `proposed`; only fields accepted by the push script belong there.

## Push approval template

```markdown
## Push approval

Article ID: <article_id>
Approved candidate hash: <sha256:...>
Approved diff-report generated_at: <timestamp>
Approved push dry-run attempted_at: <timestamp>
Reviewer: <name/id>
Decision: approved_for_apply | blocked
Apply command:

```bash
bun run content-audit:push:apply -- --article-id <article_id> --reviewer-id <reviewer_id> --note "<review note>"
```

Conditions:
- Must re-run dry-run if `normalized.md`, `ui-blocks.json`, `candidate.md`, or `diff-report.json` changes.
- Must re-export if stale check fails.
```

## Blocker escalation template

```markdown
## Content audit blocker

Article ID: <article_id>
Bundle folder: <folder>
Blocker type: stale_remote | unresolved_placeholder | ui_block_loss | unsafe_diff | source_unclear | question_answer_risk | script_error | other
Command/report that found it: <command and report path>
Summary: <one paragraph>
Required next step: re-export | source review | question review | parser/code fix | human decision | defer
```
