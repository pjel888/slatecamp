# Data Governance and Provider Boundary Plan

## Objective

Define what content can be sent to AI providers, what must remain local, and how outputs are retained.

## Data categories

### Allowed with normal caution
- Public learner-facing article prose.
- Public-style question text.
- Non-secret metadata.
- Source excerpts from public laws/codes.

### Restricted
- Service-role keys.
- `.env` files.
- private user data.
- student progress records.
- payment or billing data.
- unpublished proprietary content if licensing is unclear.

### Review required
- copyrighted textbook excerpts,
- licensed review materials,
- large chunks of non-public references,
- raw database dumps that include user fields.

## Provider selection requirements

For each provider/model role record:

- provider name,
- data retention terms if known,
- whether prompts/outputs may be used for training,
- max context and cost profile,
- allowed data categories,
- prohibited data categories.

## Prompt hygiene

- Never include secrets.
- Include only source excerpts needed for the task.
- Avoid sending full corpora when section excerpts suffice.
- Strip unrelated metadata before provider calls.

## Retention decisions needed

Decide how long to keep:

- raw prompts,
- raw model outputs,
- source excerpts in prompts,
- validation reports,
- review packets,
- failed outputs.

## Acceptance gate

No provider-backed run should scale beyond the pilot until this boundary is accepted.
