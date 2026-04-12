# Admin Audit Route Diagnostic Note

## Final diagnostic outcome
**True `audit_logs` access was not restored in this environment.**  
The environment still does not expose `public.audit_logs` in the schema cache.

## What was fixed in code
- The route no longer surfaces raw schema-cache/PostgREST failure noise.
- The route now explicitly detects the missing `audit_logs` path.
- When blocked, it switches into a **clearly-labeled degraded mode**.
- The degraded mode renders a synthesized operational history feed from:
  - `wiki_articles`
  - `questions`
  - `models_3d`
  - `taxonomy_tree`

## Final route truthfulness contract
- **Mode `real`**: use actual `audit_logs`
- **Mode `fallback`**: use synthesized operational history and explicitly say that real audit logs are unavailable

## Why this is the honest final state
- The application can harden behavior and truthfulness.
- The application cannot, by itself, force the current environment to expose `public.audit_logs` in the schema cache.
- Therefore the correct architecture here is: **degraded mode formalized, not false restoration claimed**.

## Validation
- Query-layer tests cover both real and fallback modes.
- Browser execution confirms the route now renders rows and labels itself as degraded when necessary.
