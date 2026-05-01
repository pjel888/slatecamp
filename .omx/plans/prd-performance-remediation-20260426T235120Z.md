# PRD — Performance Remediation Loop

## Problem
The local performance audit established a broad baseline and repeatable harness, but production-like frontend behavior, credentialed/live measurements, and top bottleneck remediation remain incomplete.

## Goals
1. Preserve the existing baseline as a versioned ledger.
2. Add a production-like built-app frontend baseline and comparison to the dev-server baseline.
3. Define safe fixture/readiness paths for credential-gated flows without storing secrets.
4. Remediate confirmed top bottlenecks with minimal reversible changes and before/after evidence.
5. Add comparison/history support so future runs can detect trends.

## Non-goals
- No speculative optimizations without baseline evidence and follow-up measurement.
- No destructive database operations.
- No live paid provider calls during perf tests unless explicitly configured outside committed files.
- No hard CI failure gates until at least three comparable baselines exist.

## Acceptance criteria
- New reports 17 through 26 exist where applicable.
- Stabilization commands are logged under `.ai/00_performance/logs`.
- Built-app baseline is measured or a specific blocker is documented.
- Dashboard/Supabase/3D/admin/API/cron remediation reports contain evidence, code locations, risk, rollback, and remaining work.
- Final required verification commands are run, fixed, or blocker-documented.
