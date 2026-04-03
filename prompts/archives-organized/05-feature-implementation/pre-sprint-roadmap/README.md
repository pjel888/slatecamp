# SlateCamp — Implementation Support Documents
## 9 Documents Required Before Feature Implementation
### 2026-03-26

---

## What This Is

These 9 documents fill the gap between *what to build* (your existing Product Roadmap, Five Critical Features, and Unimplemented Features Analysis) and *how to build it safely*. They were generated from cross-referencing the three source documents, the DB Architect skill, Supabase Backend skill, Next.js Frontend skill, Codebase Steward skill, and Design System Engineer skill.

---

## Documents

| # | Document | What It Answers | Priority |
|---|---|---|---|
| 01 | **Database Schema Reference** | What tables exist? What columns? What types? What's broken? | 🔴 CRITICAL — blocks everything |
| 02 | **Server Actions & Query Inventory** | What functions exist? What do they call? Where's the SRS bug? | 🔴 CRITICAL — blocks Phase 1 |
| 03 | **Environment & Services Map** | What APIs are configured? What needs provisioning? | 🟡 HIGH — blocks Phase 1 Contact form |
| 04 | **RLS Policy Patterns** | How do we secure new tables? What patterns exist? | 🟡 HIGH — blocks any new table |
| 05 | **Feature Flag & Rollout Strategy** | How do we ship to production safely? | 🟡 HIGH — blocks Phase 2+ |
| 06 | **Migration Runbook** | How do we apply 17 migrations without breaking production? | 🟡 HIGH — blocks Phase 1 |
| 07 | **Testing Strategy** | What gets tested? How? When is a feature "done"? | 🟡 HIGH — prevents shipping bugs |
| 08 | **Copy & Content Source-of-Truth** | What do the words say? What words are forbidden? | 🟢 MEDIUM — blocks Feature 2, 5 |
| 09 | **Component Architecture Map** | Where do new files go? What shared components exist? | 🟢 MEDIUM — prevents structural drift |

---

## Important Caveats

These documents were generated from **documentation and skill files**, not from reading the live codebase. Several fields are marked with:

- **⚠️ Verify** — column/table may or may not exist; check against live DB
- **🔮 PLANNED** — does not exist yet; described from roadmap
- **🔴 BROKEN** — known bug from audit
- **TBD** — decision needed before implementation

Before starting Phase 1, run the verification commands in Documents 01 and 02 against the actual codebase to confirm the schema and function signatures match what's documented here.

---

## Reading Order

1. **01-DATABASE-SCHEMA-REFERENCE.md** — read fully, run verification queries
2. **02-SERVER-ACTIONS-QUERY-INVENTORY.md** — read fully, trace the quiz session call chain
3. **04-RLS-POLICY-PATTERNS.md** — read Pattern templates, skim existing catalog
4. **06-MIGRATION-RUNBOOK.md** — read the risk assessment table
5. **03-ENVIRONMENT-SERVICES-MAP.md** — make the email provider decision
6. **05-FEATURE-FLAG-ROLLOUT-STRATEGY.md** — set up the flag infrastructure
7. **07-TESTING-STRATEGY.md** — read Definition of Done
8. **08-COPY-CONTENT-SOURCE-OF-TRUTH.md** — reference as needed during implementation
9. **09-COMPONENT-ARCHITECTURE-MAP.md** — reference when creating new files

---

*Generated 2026-03-26 · SlateCamp Codebase Steward*
