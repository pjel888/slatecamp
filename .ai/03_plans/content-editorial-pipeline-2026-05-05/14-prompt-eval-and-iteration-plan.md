# Prompt Evaluation and Iteration Plan

## Objective

Treat prompts as versioned, testable artifacts. Do not assume first-draft prompts are production-ready.

## Prompt versioning

Each prompt template must have:

- prompt ID
- semantic version
- intended model role
- input schema
- output schema
- known failure modes
- benchmark results

## Golden eval set

Use the pilot articles plus adversarial fixtures:

- article with correct but dense legal content,
- article with wrong dimensional claim,
- article with empty sources,
- article with many UI placeholders,
- article with conflicting linked question,
- question with wrong answer key,
- question with multiple plausible correct options.

## Evaluation metrics

- JSON validity rate.
- Schema validity rate.
- Unsupported claim detection rate.
- False unsupported-claim rate.
- Component hallucination rate.
- Source-needed recall.
- Human usefulness rating.

## Iteration loop

1. Run prompt on eval set.
2. Validate output schema.
3. Compare against expected findings.
4. Record failure modes.
5. Revise prompt.
6. Re-run exact eval set.
7. Lock prompt version only when metrics pass.

## Model swap testing

A cheaper model may replace a role only if:

- same prompt version,
- same eval set,
- equal or better safety metrics,
- no increase in unsupported claims,
- acceptable cost/runtime gain.

## Required outputs

- `prompt-registry.md`
- `prompt-eval-results.json`
- `prompt-change-log.md`
