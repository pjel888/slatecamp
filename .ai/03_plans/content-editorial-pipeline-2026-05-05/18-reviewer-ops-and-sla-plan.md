# Reviewer Operations and SLA Plan

## Objective

Make human review operationally realistic. A high-risk gate is meaningless unless reviewer capacity, authority, and decisions are defined.

## Reviewer roles

- Content editor: clarity, tone, structure.
- Source verifier: checks source excerpts and citations.
- Subject-matter reviewer: legal/code/factual correctness.
- Question reviewer: answer keys, distractors, rationale quality.
- Publisher/approver: approves final push after gates pass.

## Queue rules

- Low risk: automated validation + spot check.
- Medium risk: content editor review.
- High risk: source verifier or subject-matter reviewer.
- Critical risk: subject-matter reviewer plus publisher approval.

## SLA planning questions

- How many high/critical items can be reviewed per day?
- Who can approve answer-key changes?
- Who can accept unresolved source gaps?
- What happens when reviewers disagree?
- What is the max queue depth before batch processing pauses?

## Decision taxonomy

- approve
- reject
- request_source
- request_rewrite
- defer
- accept_risk
- escalate

## Review packet requirements

Every review packet must show:

- claim/change summary,
- source excerpt,
- article diff summary,
- question impacts,
- validator results,
- AI confidence only as secondary information,
- explicit reviewer decision area.

## Acceptance gate

The pilot cannot scale until reviewer queue handling is tested on real high/critical items.
