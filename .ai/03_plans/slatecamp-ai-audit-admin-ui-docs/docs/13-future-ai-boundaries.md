# Future AI Integration Boundaries

This document explains how the UI should be future-ready without integrating AI now.

## Future AI workers will write into these tables

- `ai_audit_runs`
- `ai_audit_items`
- `ai_audit_findings`
- `ai_change_proposals`
- `ai_audit_status_cache`

## The UI should not care which provider produced a result

Every future provider result should appear as:

```text
provider: kimi | qwen | deepseek | openai | perplexity | local_script | manual
model: string or null
prompt_version: string or null
raw_output: jsonb
```

## Future provider phases

```text
tier1_ai_flag_scan
tier2_source_verification
tier3_correction_proposal
tier4_validation
```

## Future source-backed fields

`ai_change_proposals.source_evidence` should be ready to hold:

```json
[
  {
    "source_id": "bp344_2024_irr",
    "title": "2024 Revised IRR of BP 344",
    "section": "Rule ... Section ...",
    "quote": "Short exact quote",
    "url": "https://..."
  }
]
```

## Not for MVP

Do not implement:

- provider credentials,
- model selection,
- background job queue,
- AI prompt editing,
- web search APIs,
- fact-check execution.

## UI placeholders allowed

It is acceptable to include disabled indicators:

```text
AI scan: coming soon
Source verification: coming soon
Correction proposal: coming soon
```

But disabled controls should not create false expectations that AI is already running.
