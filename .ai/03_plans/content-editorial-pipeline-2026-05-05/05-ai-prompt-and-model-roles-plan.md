# AI Prompt and Model Roles Plan

## Objective

Define AI roles by pipeline stage. The architecture must remain provider-agnostic.

## Model role map

### Cheap triage model

Use for:
- article diagnosis
- source sufficiency hints
- question pattern scanning
- low-risk classification

Output must be structured JSON.

### Claim extraction model

Use for:
- extracting atomic claims
- classifying risk
- identifying source-needed claims

The model does not verify truth by itself. It only prepares a ledger for source verification.

### Strong writer model

Use for:
- rewrite plans
- pedagogical restructuring
- examples and clearer explanations
- component recommendations

The writer must not directly apply edits. It returns a proposed patch plan.

### Strict fact-check model

Use for:
- comparing proposed output against fact ledger and source pack
- detecting unsupported claims
- detecting changed facts
- detecting overgeneralizations

This role should be more conservative than the writer.

### Pedagogy checker model

Use for:
- learning objective quality
- board exam relevance
- retrieval practice
- cognitive load
- clarity and sequence

This role must not make factual claims.

## Prompt rules for all AI roles

1. Return only valid structured JSON when the script expects JSON.
2. Do not invent facts, citations, sections, dimensions, or answer keys.
3. If source support is missing, write `source_needed`.
4. Distinguish clarity edits from factual edits.
5. Use only SlateCamp-valid components supplied in the registry context.
6. Do not modify or output existing `[SLATECAMP_UI_BLOCK:...]` placeholders unless the task explicitly concerns placeholder validation.
7. Do not produce direct Supabase mutations.
8. Do not claim verification unless source excerpts were provided.

## Prompt files

Initial prompt templates live in:

- `prompts/01-article-diagnosis.md`
- `prompts/02-claim-extraction.md`
- `prompts/03-rewrite-proposal.md`
- `prompts/04-fact-checker.md`
- `prompts/05-pedagogy-checker.md`

## Provider configuration principle

Use config names, not hard-coded vendor dependencies:

```json
{
  "triage_model": "configured-cheap-model",
  "claim_model": "configured-structured-output-model",
  "writer_model": "configured-strong-writing-model",
  "fact_checker_model": "configured-strong-reasoning-model",
  "pedagogy_model": "configured-learning-design-model"
}
```

## Evaluation before cost optimization

First optimize for correctness. Only move a stage to a cheaper model after the pilot benchmark proves equivalent safety and quality.
