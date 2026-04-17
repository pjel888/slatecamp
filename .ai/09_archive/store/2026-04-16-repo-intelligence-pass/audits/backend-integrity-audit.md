# Backend Integrity Audit

**Last Updated:** 2026-04-16

## Findings
- 146 action files indicate a broad but fragmented mutation layer.
- Admin content/actions contain compatibility writes and workflow normalization logic, which is pragmatic but increases hidden complexity.
- Wiki and dev actions still contain some broad selects / compatibility fallbacks that should remain visible in docs.
- Route handlers are comparatively few, so most business mutations live in actions rather than REST APIs.

## Risks
1. Broad action surface makes consistency auditing expensive.
2. Compatibility fallbacks can mask schema/workflow drift.
3. Missing stable backend-system docs made data-layer reasoning too prompt-dependent.
