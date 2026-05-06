# Subagent Phase 0.8 Invariant Review

Result: PASS_WITH_HARDENING_NOTES_APPLIED

Subagent findings:
- Targeted invariant test passed: 7 tests, 228 assertions at review time.
- Generated artifacts parsed and maintained blocked gates.
- Package script `test:source-verification` is safe/local.

Hardening requested and applied:
- Included `test:source-verification` and `content-audit:admin-schema-probe` in package-script safety assertions.
- Added actual filesystem checks for source-pack/embedding directories in tests.
- Smoke runner now records actual source-pack/embedding directory existence instead of hardcoded false.
- Forbidden-label scan was clarified to status/recommendation/proposal-type fields to avoid false positives in explanatory next-action text.

Final result after hardening:
- PASS, 7 tests, 243 assertions.
