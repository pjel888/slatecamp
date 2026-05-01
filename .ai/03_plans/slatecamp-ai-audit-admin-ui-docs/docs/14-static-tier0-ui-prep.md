# Tier 0 Static Check Preparation

Tier 0 static checks are future cheap checks that require no AI. The UI should be ready to show them.

## Future Tier 0 checks

Potential checks:

- Article has at least one source.
- Article has linked taxonomy.
- Article has linked questions.
- Question has an answer key.
- Question has complete options.
- Question has rationale/explanation if required.
- Source URL exists.
- Content hash has changed since last audit.

## MVP behavior

For now, the UI can show Tier 0 as:

```text
not_started
manual_passed
manual_flagged
```

Or simply treat Tier 0 as a phase in status cache.

## Future static check result format

```json
{
  "target_type": "wiki_article",
  "target_id": "...",
  "phase": "tier0_static_check",
  "status": "flagged",
  "checks": {
    "has_sources": false,
    "has_taxonomy": true,
    "has_linked_questions": true
  },
  "findings": [
    {
      "risk_type": "missing_sources",
      "severity": "medium",
      "summary": "Article has no linked source rows."
    }
  ]
}
```

Do not implement the automated static checker unless it is trivial and requested. The current priority is the UI/logging foundation.
