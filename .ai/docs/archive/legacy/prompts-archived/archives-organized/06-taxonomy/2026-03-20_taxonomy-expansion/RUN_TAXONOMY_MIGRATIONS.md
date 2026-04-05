# Task: Run Taxonomy Expansion Migrations

All files are in `prompts/taxonomy-expansion/`.

---

## Files in This Folder

```
00_preflight_verification.sql       ← run this first, verify all checks pass
migration_ale_hist_expansion.sql
migration_ale_theo_expansion.sql
migration_ale_plan_expansion.sql
migration_ale_prac_expansion.sql
migration_ale_strc_expansion.sql
migration_ale_matl_expansion.sql
migration_ale_util_expansion.sql
migration_ale_dsgn_expansion.sql
migration_ale_laws_expansion.sql    ← run this last
99_post_migration_verification.sql  ← run after all migrations complete
```

---

## Rules Before You Start

1. **Do not modify any SQL file.** Run them as-is.
2. **`migration_ale_laws_expansion.sql` must run last.** Every other subject migration can run in any order, but LAWS is last.
3. **`00_preflight_verification.sql` must pass completely before any migration runs.**
4. **If any migration raises an EXCEPTION and aborts, stop.** Do not continue to the next file. Report the error.
5. All files are idempotent — safe to re-run if interrupted.

---

## Step 1 — Run `00_preflight_verification.sql`

Run the entire file in the Supabase SQL editor.

Read the output. Every check must pass. If any check fails or raises a WARNING, stop and report it before continuing.

---

## Step 2 — Run the 8 Subject Migrations (Any Order)

Run each of these files in the Supabase SQL editor, one at a time:

```
migration_ale_hist_expansion.sql
migration_ale_theo_expansion.sql
migration_ale_plan_expansion.sql
migration_ale_prac_expansion.sql
migration_ale_strc_expansion.sql
migration_ale_matl_expansion.sql
migration_ale_util_expansion.sql
migration_ale_dsgn_expansion.sql
```

After each file, confirm the SQL editor shows no red errors before running the next one.

---

## Step 3 — Run `migration_ale_laws_expansion.sql`

This file replaces the old ALE-LAWS subtopics (2-digit suffix) with the new ones (3-digit suffix). It runs last because it has safety checks that verify the other migrations completed cleanly.

Run in the Supabase SQL editor.

Expected output in the Notices panel:
```
NOTICE:  Prereq checks passed. Proceeding with ALE-LAWS replacement.
```

If it raises an EXCEPTION, do not retry. Report the full error.

---

## Step 4 — Run `99_post_migration_verification.sql`

Run in the Supabase SQL editor after all 9 migration files have completed.

Read every result. If any verification check shows unexpected numbers, report them.

---

## Step 5 — One Code Fix

After all migrations succeed, apply this change in `src/lib/actions/wiki-actions.ts` inside the `getBreadcrumbTrail` function.

**Find:**
```typescript
const { data: startNode } = await supabase
  .from("taxonomy_tree")
  .select("discipline_id")
  .eq("node_id", nodeId)
  .single();
```

**Replace with:**
```typescript
const { data: startNode } = await supabase
  .from("taxonomy_tree")
  .select("discipline_id, is_cross_ref_only")
  .eq("node_id", nodeId)
  .single();
```

**Then find the `allNodes` query in the same function. Find:**
```typescript
.eq("is_cross_ref_only", false)
```

**Replace with:**
```typescript
.eq("is_cross_ref_only", startNode.is_cross_ref_only)
```

---

## Done

Run order: `00_preflight` → 8 subject files (any order) → `migration_ale_laws_expansion` → `99_post_migration`.
