# Security and Privacy Rules

## Non-negotiables

- Never expose secrets, keys, tokens, session cookies, private data, or internal credentials.
- Never commit runtime secret files.
- Never weaken auth, permission checks, or validation to make a test pass.
- Never log sensitive values.
- Never add external network calls without understanding data flow and user impact.

## Review focus

- Authentication and authorization boundaries.
- Input validation and output encoding.
- Server-side enforcement, not only UI restrictions.
- Database queries and access controls.
- Webhook signature validation if webhooks exist.
- File upload constraints if uploads exist.
- Dependency and supply-chain risk.

## Safe behavior when uncertain

Pause implementation, document the risk, and inspect the relevant files. Security uncertainty is not a place for guesses.
