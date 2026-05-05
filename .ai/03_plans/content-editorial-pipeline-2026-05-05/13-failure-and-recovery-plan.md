# Failure and Recovery Plan

## Objective

Define predictable handling for malformed model output, stale files, partial runs, rate limits, crashes, and validation failures before any batch work.

## Failure classes

### Model output failures
- invalid JSON
- schema mismatch
- missing required fields
- unsupported claim introduced
- hallucinated component
- incomplete response

### File/pipeline failures
- stale `original.md`
- stale `normalized_content_hash`
- broken UI placeholder
- missing `ui-blocks.json`
- candidate compose failure
- dry-run blocker

### Runtime failures
- provider rate limit
- auth failure
- timeout
- interrupted process
- partial batch completion

## Recovery rules

- Invalid AI output: quarantine output, retry with stricter prompt once, then mark failed.
- Stale corpus: re-export baseline before editing; never overwrite improvements casually.
- Compose failure: create blocker record, do not push.
- Dry-run blocker: classify blocker, do not apply.
- Partial batch: resume from manifest, not from memory.

## Idempotency requirements

Every script/run must be safe to re-run by checking:

- run ID,
- article ID,
- input hashes,
- artifact hashes,
- current status,
- lock file if applicable.

## Quarantine artifacts

Failed articles should write:

```text
editorial/quarantine.json
editorial/failed-output.raw.txt
editorial/failure-summary.md
```

## Exit gate

No batch execution plan is valid until it defines retry limits, quarantine behavior, resume behavior, and idempotency checks.
