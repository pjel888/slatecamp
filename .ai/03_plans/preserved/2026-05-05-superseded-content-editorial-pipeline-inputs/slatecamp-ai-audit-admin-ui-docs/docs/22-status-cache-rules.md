# Status Cache Rules

`ai_audit_status_cache` exists so the admin tables are fast and simple.

## Missing row

If a target has no cache row:

```text
latest_phase = not_started
latest_status = not_checked
findings_count = 0
open_findings_count = 0
```

Do not seed 7,000+ rows unless needed.

## Recompute triggers

The MVP can recompute status cache in application code after mutations.

Future improvement: database function or trigger.

## Highest severity

Severity order:

```text
critical > high > medium > low
```

Highest severity should consider open and confirmed findings.

## Flags

Set:

```text
needs_source_check = true
```

if any open/confirmed finding has risk type:

```text
missing_sources
unsupported_claim
needs_source_check
outdated_requirement
source_conflict
```

Set:

```text
needs_correction = true
```

if any open/confirmed finding has risk type:

```text
confirmed_wrong
likely_wrong
answer_key_mismatch
multiple_correct_answers
no_valid_answer
stem_inaccurate
option_inaccurate
rationale_inaccurate
```

Set:

```text
needs_human_review = true
```

if any open/confirmed finding exists, or status is `needs_human_review`.

## Status derivation suggestion

```text
if confirmed critical/high finding → confirmed_wrong
else if open high/critical finding → likely_wrong
else if open medium finding → needs_source_check
else if reviewed and no open findings → passed
else → not_checked
```

Admins can override with explicit review decisions.
