# Migration Rebaseline Risk Register

| Risk | Severity | Control |
|---|---:|---|
| Remote history rows represent real schema effects | Critical | Do not repair without schema proof |
| Snapshot migration hides lineage | High | Treat db pull as capture only, not repair |
| Admin audit direct apply bypasses migration governance | High | Use shadow/local fixtures only |
| Data loss via broad repair/revert | Critical | No repair in autopilot |
