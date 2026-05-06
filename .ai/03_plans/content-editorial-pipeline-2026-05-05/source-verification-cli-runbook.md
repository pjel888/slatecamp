# Source Verification CLI Runbook

Status: local-only / dry-run / non-mutating.

## Safety boundary

These commands may read local files under `vitruvius-connection/` and write generated evidence artifacts under this plan folder. They must not approve sources, create source packs, create chunks, create embeddings, edit articles/questions, mutate Supabase, apply migrations, or sync admin live data.

Claude review status for this loop: `CLAUDE_UNAVAILABLE_LIMIT`; fallback review is via Command Code/subagents.

## Standard command order

```bash
bun scripts/content-audit/build-source-reconciliation-matrix.ts
bun scripts/content-audit/validate-source-packet-readiness.ts
bun scripts/content-audit/extract-source-locators.ts
bun scripts/content-audit/build-human-sme-packet-prep.ts
bun scripts/content-audit/validate-locator-packet-readiness.ts
bun scripts/content-audit/validate-admin-ai-audit-schema.ts
bun scripts/content-audit/build-source-verification-admin-payload.ts
bun scripts/content-audit/validate-admin-source-payload.ts
bun scripts/content-audit/run-source-verification-smoke.ts
bun test scripts/content-audit/source-verification-invariants.test.ts
```

Optional governed local PDF spike:

```bash
bun scripts/content-audit/extract-local-pdf-text.ts
bun scripts/content-audit/validate-pdf-extraction-output.ts
```

Global validation:

```bash
bun run type-check
bun run lint
bun test scripts/content-audit/source-verification-invariants.test.ts
git diff --check
```

## Package aliases

```bash
bun run content-audit:source-reconcile
bun run content-audit:source-readiness
bun run content-audit:source-locators
bun run content-audit:source-packet-prep
bun run content-audit:source-locator-readiness
bun run content-audit:admin-schema-probe
bun run content-audit:admin-source-payload
bun run content-audit:admin-payload-validate
bun run content-audit:source-verification-smoke
bun run content-audit:pdf-extraction-spike
bun run content-audit:pdf-extraction-validate
bun run test:source-verification
```

## Expected outputs

- `source-reconciliation-matrix.generated.csv/json`
- `source-locator-evidence.generated.csv/json`
- `source-human-sme-packet-prep.generated.md/json`
- `source-human-sme-review-queue.generated.md`
- `source-human-sme-conflict-queue.generated.md`
- `source-locator-packet-readiness-validation.md/json`
- `admin-ai-audit-source-payload.dry-run.json`
- `admin-ai-audit-source-payload-schema-validation.md/json`
- `source-verification-smoke-test-report.md/json`
- `pdf-extraction-spike-report.md`
- `pdf-extraction-validation.md/json`

## Troubleshooting

- If `vitruvius-connection/` is missing or empty, rerun local source intake before reconciliation.
- If PDF extraction reports `unavailable`, confirm local Python modules `fitz` or `pypdf`; do not upload PDFs externally.
- If a validation detects forbidden promotion labels, inspect status/recommendation fields and keep all source gates blocked.
- If admin schema probe reports `DB_SCHEMA_PROBE_SKIPPED_NO_ENV`, that is safe; no DB read was attempted.
- If lint shows existing unrelated warnings, confirm there are 0 errors and no new warning from touched files.

## Still blocked

- source approval
- source-pack creation
- chunking
- embeddings
- article rewriting
- question editing
- Supabase mutation
- migrations
- admin live sync
- Phase 1B
