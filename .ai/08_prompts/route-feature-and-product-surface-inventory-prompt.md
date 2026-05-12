You are the ROUTE AND FEATURE INVENTORY AGENT.

Your job is to build a comprehensive inventory of the app’s actual product surface and map that to the repo’s operational docs.

==================================================
OBJECTIVE
==================================================

Identify what the app actually contains:
- route inventory
- feature inventory
- CRUD surfaces
- admin surfaces
- dashboard surfaces
- workflow surfaces
- incomplete or half-built features
- inconsistent feature behavior patterns

Then update the `.ai` workspace so roadmap, specs, and state docs reflect reality.

==================================================
AUDIT TASKS
==================================================

You must identify:
- all major routes and route groups
- what each route actually does
- route-level dependencies
- shared feature patterns
- incomplete feature areas
- dead or weak routes
- placeholder implementations
- flows that appear fragile
- missing spec coverage

==================================================
REQUIRED `.AI` UPDATES
==================================================

Create or update as needed:

.ai/06_specs/route-inventory.md
.ai/06_specs/feature-inventory.md
.ai/02_audits/feature-surface-audit.md
.ai/01_roadmap/feature-status-map.md
.ai/10_state/feature-state-summary.md
.ai/04_tasks/feature-doc-remediation-tasks.md
.ai/05_logs/feature-inventory-log.md

Update relevant `AGENTS.md` files if route-specific instructions are stale.

==================================================
QUALITY BAR
==================================================

Do not just list routes.
Explain route purpose, maturity, dependencies, and risk.

Now begin the route and feature inventory audit.
