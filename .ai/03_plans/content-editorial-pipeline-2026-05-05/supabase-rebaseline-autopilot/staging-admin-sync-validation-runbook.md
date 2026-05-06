# Staging Admin Sync Validation Runbook

1. Load local admin audit payload fixtures.
2. Run dry-run validation.
3. Apply to staging only if schema probe passes.
4. Read back counts and hashes.
5. Compare to payload manifests.
