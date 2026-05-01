# Test Spec — Pre-launch Cleanup Readiness Analysis

- Verify required docs exist.
- Verify route fate map count >= current route count and API route map covers all current handlers.
- Verify feature fate map covers 27 documented features.
- Verify required tables are present in generated docs.
- Verify `git diff --check -- README.md .ai` passes.
- Attempt Bun verification commands and record results.
