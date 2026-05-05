# Cost, Budget, and Throughput Plan

## Objective

Prevent a 500+ article, 7,000+ question pipeline from becoming an unbounded model-cost or runtime problem.

## Required measurements during pilot

For each pass record:

- model/provider role
- input tokens
- output tokens
- cost
- wall-clock duration
- retries
- parse failures
- validation failures
- human review minutes

## Budget dimensions

- Cost per article.
- Cost per linked question.
- Cost per full pipeline run.
- Cost per accepted edit.
- Cost per human-review packet.
- Cost by risk tier.

## Throughput dimensions

- Articles per hour per pass.
- Questions per hour per pass.
- Validator runtime per article.
- Human review queue depth.
- Admin sync runtime.

## Pilot budget policy

The pilot may use stronger models first. Cheaper models may replace a role only after they match safety/quality metrics on the same pilot set.

## Cost controls

- Token caps per article and per question batch.
- Hard maximum source-pack excerpt size per prompt.
- Batch size limits by risk tier.
- Retry caps for malformed JSON.
- Abort threshold when validation failure rate exceeds target.

## Required output

Create `pilot-cost-throughput-report.md` after the pilot with:

- per-pass cost table,
- per-risk-tier cost,
- projected full-corpus cost,
- bottleneck analysis,
- model substitution candidates,
- scale recommendation.
