# Pilot Study and Benchmark Plan

## Objective

Prove the pipeline works on a representative pilot set before scaling to 500+ articles. The original 20-article target is a minimum smoke pilot; the recommended high-confidence pilot is 30–35 articles so each high-risk content cluster has enough coverage.

## Pilot set composition

### Minimum smoke pilot: 20 articles

Use only for first end-to-end validation of artifact schemas, prompts, validators, and review packets.

### Recommended benchmark pilot: 30–35 articles

Select enough articles to include at least 5 examples from each high/critical cluster:

1. 5 PD 1096 legal/code articles.
2. 5 BP 344 accessibility articles.
3. 5 RA 9266 professional practice articles.
4. 5 RA 9514 fire/life safety articles.
5. 3 contract/SPP/professional documents articles.
6. 3 design/theory/history articles.
7. 2 technical utilities/structures articles.
8. 2 articles with many UI placeholders.
9. 2 articles with zero UI placeholders.
10. 2 articles with many linked questions.
11. 3+ articles with known factual flags.

A single article may satisfy multiple non-domain criteria, but high-risk domain coverage should not be collapsed below 5 per cluster.

## Benchmark metrics

### Safety metrics
- Unsupported new claims: target 0.
- Unlisted factual changes: target 0.
- Broken MDX compile: target 0.
- Unknown components: target 0.
- Broken placeholders: target 0.
- Direct edits to `original.md`: target 0.
- Direct edits to `linked-questions.json`: target 0.

### Accuracy metrics
- Fact preservation score: target at least 0.98.
- High-risk claims with source evidence: target 100%.
- Numerical/code/section claims source-backed: target 100%.
- Answer-key changes with source proof: target 100%.

### Learning metrics
- Learning goal present and specific: target 100%.
- Board-exam angle present: target 100%.
- Retrieval practice present or explicitly justified absent: target 90%+.
- Common mistake/trap present for legal/code articles: target 90%+.
- Human editor acceptance: target 85%+.

### Operational metrics
- Average total cost per article.
- Average runtime per article.
- Retry rate per pass.
- Human review minutes per article.
- Validator false-positive rate.
- Validator false-negative discoveries during manual review.

## Study design

1. Freeze selected pilot bundle baselines.
2. Run read-only diagnosis and claim extraction.
3. Run rewrite proposal on a subset only.
4. Apply only approved low-risk proposals locally.
5. Compose and dry-run.
6. Run fact-checker and pedagogy checker after local application.
7. Prepare review packet.
8. Human review accepts, rejects, or edits.
9. Record metrics.
10. Decide scale/no-scale.

## Required pilot report

Create `pilot-20-benchmark-report.md` with:

- selected articles
- initial diagnosis
- proposed actions
- accepted edits
- rejected edits
- validator results
- human review results
- cost/runtime
- lessons learned
- scale recommendation

## Scale decision rule

Do not process the full corpus unless:

- safety targets pass
- unsupported claims are zero
- component and MDX validity are perfect
- high-risk review flow is clear
- human acceptance is at least 85%
- rollback procedure is documented and tested
