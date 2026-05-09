# Reviewer Memo - RA 9514 Means of Egress: Width, Count, and Illumination

## Verdict

`PASS_FOR_CALIBRATION`, `HOLD_FOR_DIRECT_PUBLICATION`.

This is a gold-standard calibration artifact, not a publishable Supabase bundle.

## Why it passes for calibration

- It starts from a learner task, not from a generic topic introduction.
- It cites the local source file and PDF page for every governing factual cluster.
- It explains the most likely exam trap instead of merely listing values.
- It makes distractors plausible and diagnoses why each wrong option fails.
- It avoids generic AI phrases, unsupported certainty, and motivational filler.

## Before and after calibration

Weak draft excerpt:

> Means of egress should be wide enough and properly illuminated for safety.

Gold-standard direction:

> Given a Fire Code egress stem, decide whether the issue is exit sufficiency, minimum egress width, number of means of egress, or illumination.

## Question-quality check

- Correct answer is source-linked.
- Distractors are plausible and tied to real confusion patterns.
- Rationale explains why wrong answers fail.
- Takeaway is a memory rule, not encouragement.
- No answer key changes are proposed for live Supabase rows.

## Roundtrip note

If this exemplar becomes a live SlateCamp article, create or update an article bundle under `.ai/content-audit-export/articles/`, preserve `original.md`, edit `normalized.md`, maintain `ui-blocks.json`, generate `candidate.md`, and push only after dry-run and review gates pass.

## Remaining risks

- LLM council SME review is complete for calibration; licensed-human SME review is still required before learner-facing release.
- Local PDF extraction can contain OCR noise. Use the page locator and PDF visual check during final SME review.
- This pack does not update Supabase, linked live article metadata, or existing question rows.


## SME council review update

- Status: `LLM_COUNCIL_COMPLETE_FOR_CALIBRATION` on 2026-05-09.
- Council files: `council-reviews/2026-05-09-sme-risk-review/`.
- Applied decision: LLM council accepted the Fire Code values for calibration. Official-source blockage / prior source-pack integrity risk remains a direct-publication blocker.
- Direct-publication boundary: `HOLD_FOR_DIRECT_PUBLICATION`; this is not licensed-human SME release approval and not a Supabase push bundle.
