# Feature Surface Audit

**Last Updated:** 2026-04-16

## Findings
- Student-facing dashboard routes cover analytics, assessment, notes, pods, testing, wiki, area-c, and 3D Lab.
- Admin routes support articles, knowledge, questions, design problems/scenarios, assets, audit, taxonomy, pipeline, preview, and settings.
- Developer routes expose architecture, status, infrastructure, tools, console, db, logs, and test data.

## Fragility signals
- Admin and dashboard breadth creates documentation drift quickly.
- Feature maturity is uneven: core learning flows are dense; some supporting surfaces depend on smaller action/helper modules.
- A stable feature-status map was missing before this pass.
