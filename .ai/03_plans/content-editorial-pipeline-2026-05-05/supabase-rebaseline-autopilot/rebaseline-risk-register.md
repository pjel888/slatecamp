# Rebaseline Risk Register

| Risk | Severity | Mitigation |
|---|---:|---|
| Speculative migration repair hides real production schema drift | Critical | Do not repair 214 remote-only rows without backup/staging proof |
| Snapshot migration loses historical intent | High | Label as rebaseline snapshot, not recovered lineage |
| Admin audit schema applied to production before lineage fixed | High | Block production apply until dry-run and staging pass |
| Secrets leaked in CLI outputs | High | Scoped secret scan before commit |
| Local-only evidence mistaken for staging proof | Medium | Reports must label local/staging separately |
