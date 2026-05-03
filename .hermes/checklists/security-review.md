# Security Review Checklist

- [ ] Auth boundary enforced server-side.
- [ ] Authorization checks match user roles or ownership rules.
- [ ] Sensitive values not logged or exposed.
- [ ] Inputs validated.
- [ ] Outputs safe for the context where they render.
- [ ] Dependencies are justified.
- [ ] File uploads, webhooks, and external calls are constrained if present.
- [ ] Error messages do not reveal sensitive internals.
