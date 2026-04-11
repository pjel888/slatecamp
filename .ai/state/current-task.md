# Current Task: Error Logging Audit — v4 FOURTH-PASS PRECISION CLEANUP COMPLETE <!-- updated: 2026-04-11 -->

**STATUS:** AUDIT COMPLETE — FOURTH-PASS PRECISION CLEANUP DELIVERED (v4)
**DATE:** 2026-04-11

## Active Project: Error Logging Audit — Fourth-Pass Precision Cleanup v4

**Audit Deliverable:** `.ai/plans/2026-04-11-Error-Logging-Audit.md` (v4, 24 sections + 5 appendices)

### Fourth-Pass Precision Cleanup Changes (v4)

**PRECISION IMPROVEMENTS:**
- **Exact count substitutions:** Replaced approximate `~20` (queries) with `17`, `~12` (supabase) with `6`, and `~11` (api) with `11`.
- **Wording narrowed:** All exhaustive surface claims now cite exact file counts instead of approximations.
- **File-count versus occurrence-count corrections:** Clearly distinguished between unique files containing a pattern and total occurrences of that pattern across all sections.
- **Pattern Proof Table Audit:** Added "Occurrence count" attribute to all high-volume pattern tables for forensic exactness.
- **Verified Ledger alignment:** Synchronized all summary counts with fresh grep-derived evidence.
- **Typo verification:** Confirmed absence of forensic-weakening typos (SAMLED, SAMOLED).

### Numeric Corrections from v4 Cleanup
| Claim | v3.1 | v4 (Verified Fresh Grep) |
|-------|------|---------------------------|
| Files with throw new Error | 42 | 47 (128 occurrences) |
| Files with if (error) | 40 | 71 (149 occurrences) |
| Files with console.error | 50 | 87 (176 occurrences) |
| Queries files | ~20 | 17 |
| Supabase files | ~12 | 6 |
| API Routes | ~11 | 11 |

### Five Urgent Findings (Verified)
1. Server Actions throw generic Error (47 files) — CRITICAL
2. 137 server action files exist with inconsistent error handling — CRITICAL
3. Middleware session refresh failures are silent (middleware.ts:56) — HIGH
4. Admin content mutations lack audit trail beyond 3 tables — HIGH
5. Payment webhook handlers have minimal error handling — HIGH

### Three Next Moves (Unchanged)
1. Standardize server action error responses (typed { success, error } returns)
2. Add logging to top 10 high-value server actions (submit-answer, payments, admin)
3. Create shared logger abstraction (Supabase audit + external monitoring)

### Audit Findings Summary

- **Current Maturity:** AD-HOC — reactive error handling exists but no systematic logging
- **Architectural Readiness:** NOT READY — no shared logger interface, no correlation IDs
- **Supabase Role:** INSUFFICIENT ALONE — needs hybrid architecture (Supabase for audit + external for engineering)

### Five Urgent Findings
1. Server Actions throw generic Error (crashes UI, no visibility) — CRITICAL
2. 116 server action files with NO consistent error logging — CRITICAL
3. Middleware session refresh failures are silent — HIGH
4. Admin content mutations lack audit trail beyond 3 tables — HIGH
5. Payment webhook handlers have minimal error handling — HIGH

### Three Next Moves
1. Standardize server action error responses (typed { success, error } returns)
2. Add logging to top 10 high-value server actions (submit-answer, payments, admin)
3. Create shared logger abstraction (Supabase audit + external monitoring)

---

## Previous Project: First-Time User Experience (FTUX) Audit & Hardening — COMPLETE

## Previous Project: Admin CMS Audit Implementation — ALL PHASES COMPLETE

### Tasks Complete
- Role Matrix Verification (Unit tested)
- Editor Save Flow Hardening (Unit tested)
- Publish Revalidation + Cache Invalidation (Fixed missing revalidateTag)
- Offline Save Detection (Implemented in SaveAllBar)
- Consolidate updateQuestion exports (Consolidated in questions.ts)
- Preview select(*) replacement (Explicit columns added)
- Link cleanup (Removed legacyBehavior)

## Previous Project: Stairway Configurator v2 — ALL PHASES COMPLETE

### Phases 1-3 Complete (28/28 tasks)
- Phase 1 (11/11): Foundation — types, constants, computation, geometry refactor
- Phase 2 (8/8): Depth — GeometryType unification, extruded-profile, comparison mode
- Phase 3 (9/9): Flagship — L/U-shape geometry, egress calculator, materials
- Phase 4 (8/8): 3D rendering + unit tests

### Key Commits
- `3abdcb38` — Phase 4: wire 3D rendering + unit tests
- `9c4f8af0` — Phase 3: L/U-shape geometry, egress calculator, children's safety, materials
- `9366fb25` — fix: ModuleViewer useTemplateContent moved before early returns

## Stairway Backlog (Phase 5+)
- Winder stairs, spiral stairs, guided tour system, drei Instances for evacuation
