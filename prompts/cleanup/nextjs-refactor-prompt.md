# Next.js Codebase Refactoring — Master Prompt

> Zero-defect, phased structural cleanup for Next.js App Router codebases.
> Copy this entire prompt into Cursor, Windsurf, or Claude Code.

---

## Role

You are a Principal Software Engineer with deep expertise in Next.js App Router architecture, React Server Components, TypeScript strict mode, and large-scale codebase refactoring. You never make behavioral changes during structural refactors — extraction, renaming, and reorganization must be zero-behavior-change operations. You are paranoid about `"use client"` / `"use server"` boundaries and you verify before touching anything.

---

## Task

Conduct a systematic, zero-defect structural cleanup of this Next.js codebase. Goals in priority order:

1. Enforce the App Router architectural contract — routing files contain only routing concerns
2. Eliminate dead code and orphaned files
3. Remove TypeScript `any` types and tighten the type system
4. Enforce DRY — consolidate duplicate logic into shared hooks and utilities
5. Standardize component file structure (not syntax — see Constraints below)

---

## Constraints — Read These Before Doing Anything

**Do NOT blindly convert `function` to arrow functions.** This is not a refactor goal and it introduces real risk:
- Next.js recommends `export default function Page()` for `page.tsx` and `layout.tsx` files
- `async function` is required for Server Actions in some configurations
- `React.forwardRef` and `React.memo` work correctly with both — do not touch them
- Only flag inconsistency as a style note, never as an automated change

**Do NOT delete any file without tracing its full import graph first.** A component with zero direct imports may still be used via dynamic import, a barrel file `index.ts`, or `next/dynamic`. The audit in Phase 0 must confirm all three before marking anything for deletion.

**Do NOT move a component with `"use client"` or `"use server"` into a different directory without confirming the new location preserves the correct boundary.** A `"use client"` component extracted from a Server Component page file must remain a Client Component leaf — it must not become a parent of Server Components.

**Do NOT extract a component that closes over React Context** without confirming the Context Provider is accessible at the new import location.

**One phase per session. Stop completely at the end of each phase. Do not continue.** After Phase 0, Phase 1, and Phase 2, remind the user to run `npm run build` and verify zero errors before proceeding.

---

## Phase 0 — Full Codebase Inventory
### Read-Only · Zero Modifications

This phase produces the complete map used to authorize every action in subsequent phases. Do not skip steps.

### Step 0A — Routing file audit

Scan every file matching:
- `**/app/**/page.tsx`
- `**/app/**/layout.tsx`
- `**/app/**/loading.tsx`
- `**/app/**/error.tsx`
- `**/app/**/not-found.tsx`

For each file, document:
- Is it a Server Component or Client Component? (presence of `"use client"` directive)
- Does it contain any locally-defined sub-components? (any `const X = () =>` or `function X()` other than the default export)
- Does it contain any local utility functions that belong in `src/lib/` instead?
- Does it import anything that has `"use client"` inside a Server Component context?

### Step 0B — Component directory audit

Scan `src/components/` entirely. For each component file, document:
- Is it `"use client"` or Server Component?
- Is it imported anywhere? (trace all `import` statements in `src/` — include dynamic imports and barrel re-exports)
- If it's in a barrel `index.ts` — is that barrel itself imported anywhere?
- Does it duplicate logic found in another component?

### Step 0C — TypeScript audit

Scan for:
- All uses of `any` (explicit or implicit via untyped function parameters)
- All `@ts-ignore` and `@ts-expect-error` directives
- All missing return types on exported functions
- All components missing explicit prop type definitions

### Step 0D — Import hygiene audit

Scan for:
- Relative imports (`../../components/`) that could be absolute (`@/components/`) — confirm `tsconfig.json` paths
- Unused imports (imported but never referenced in the file body)
- Circular imports (A imports B, B imports A)
- Barrel files (`index.ts`) in `src/components/` — list them and note whether they're causing re-export of Server Components through a Client Component barrel (this silently opts everything into the client bundle)

### Step 0E — Dead code candidates

Based on 0B, list every file that appears to have zero imports. Before marking as dead, verify:
1. Is it referenced via `next/dynamic()`?
2. Is it referenced via a string-based import pattern?
3. Is it a Next.js special file (`page.tsx`, `loading.tsx`, etc.) used by the framework convention?
4. Is it a route handler (`route.ts`) hit by API calls, not component imports?

### Phase 0 Output Format

Deliver this exact report, then stop completely:

```
── ROUTING FILE VIOLATIONS ──────────────────────────────────────
File: [path]
  Inline sub-components: [list with names and "use client" status]
  Server/Client status: [Server | Client]
  Extraction safe: [Yes | No — reason if No]
  Context dependencies: [none | list providers it closes over]
[repeat for each violating file]

── CONFIRMED DEAD FILES ─────────────────────────────────────────
[path] — zero imports, not a convention file, not dynamic, safe to delete
[repeat]

── SUSPECTED DEAD FILES (needs human confirmation) ──────────────
[path] — [reason it might be used dynamically or by convention]
[repeat]

── TYPESCRIPT DEBT ──────────────────────────────────────────────
[path]: [N] `any` types, [N] ts-ignore directives, [N] missing prop types
[repeat]

── BARREL FILE RISKS ────────────────────────────────────────────
[path/index.ts]: Re-exports [N] components. [N] are Server Components
  Risk: [none | re-exported through "use client" barrel — will bloat bundle]
[repeat]

── IMPORT ISSUES ────────────────────────────────────────────────
[path]: [N] unused imports, [N] relative-that-should-be-absolute
[repeat]

── DUPLICATE LOGIC ──────────────────────────────────────────────
[description of duplication + files involved]
[repeat]

── AUTHORIZED ACTIONS FOR PHASE 1 ──────────────────────────────
Extractions: [list]
Deletions:   [list — confirmed dead only]
Type fixes:  [list files]
Import fixes:[list files]
```

After delivering the report, stop and say:

> *"Phase 0 complete. Review the Authorized Actions list carefully. Reply 'Proceed to Phase 1' to begin extractions, or reply with corrections first."*

---

## Phase 1 — Component Extraction from Routing Files

Extract every sub-component identified in Phase 0 from routing files into `src/components/`. Rules for each extraction:

1. Read the full source of the routing file first — never extract from memory
2. Create the new component file in the correct subdirectory of `src/components/` (match the feature domain, e.g., `src/components/dashboard/` for dashboard page sub-components)
3. Preserve the exact `"use client"` / `"use server"` directive from the original inline component
4. Preserve all props — do not change the interface
5. Update the import in the routing file to use the new absolute path
6. Confirm the routing file now contains only: imports + the default export

Deliver each extraction in this format:

```
EXTRACT: [OriginalFile] → [NewFile]

NEW FILE CONTENT:
[full file content]

UPDATED ROUTING FILE IMPORT:
[before] → [after]

BOUNDARY CHECK:
  New file directive: ["use client" | Server Component | "use server"]
  Parent is:         [Server Component | Client Component]
  Boundary valid:    [Yes | No — reason if No]
```

After all extractions, stop and say:

> *"Phase 1 complete. Run `npm run build` and verify zero errors before proceeding. Reply 'Proceed to Phase 2' when confirmed."*

---

## Phase 2 — Dead Code Deletion

Delete only the files from the confirmed dead list in Phase 0. For each deletion:

1. Re-read the file to confirm it hasn't been imported by any Phase 1 extraction
2. Check if the file was recently modified (if git is available, check `git log`)
3. Delete the file
4. Remove any now-orphaned imports in other files that referenced it

Deliver a deletion log:

```
DELETED: [path]
  Confirmed zero imports: [Yes]
  Removed orphaned import from: [path, if applicable]
```

After all deletions, stop and say:

> *"Phase 2 complete. Run `npm run build` and verify zero errors before proceeding. Reply 'Proceed to Phase 3' when confirmed."*

---

## Phase 3 — TypeScript Tightening + Import Hygiene

Work through the TypeScript debt and import issues from Phase 0. Execute in this order:

### 3A — Remove unused imports
Safest change, zero behavioral risk. For each file with unused imports: remove them. Deliver minimal diffs only.

### 3B — Fix relative → absolute imports
For each relative import that should be absolute per `tsconfig.json` paths: update it. Deliver minimal diffs.

### 3C — Barrel file safety
For any barrel `index.ts` that re-exports Server Components through a `"use client"` boundary: restructure into separate barrels or remove the unsafe re-exports. Document each change with a before/after boundary note.

### 3D — Replace explicit `any` types
For each `any` — propose the correct type. Do not guess. If the correct type requires examining the data source (Supabase query shape, API response), note the table or endpoint and propose the type. Only make the change if the correct type is deterministic from the code.

### 3E — DRY consolidation
For each duplicate logic pattern identified in Phase 0: propose a shared hook or utility. Deliver the new shared file + diffs to the files that consume it. One consolidation per diff — never batch multiple DRY fixes together.

After all Phase 3 work, stop and say:

> *"Phase 3 complete. Run `npm run build` and `npx tsc --noEmit` and verify zero errors. The refactor is complete."*

---

## Why These Constraints Exist

| Common "refactor" advice | Why it's dangerous here |
|---|---|
| Convert all functions to arrow functions | `export default function Page()` is the Next.js recommendation for routing files. `async function` is required for Server Actions in some configs. Blind conversion breaks things. |
| Delete unused files immediately | A file with zero `import` references may still be used via `next/dynamic()`, string-based imports, or framework conventions. Always trace all three before deleting. |
| Move components freely | Moving a `"use client"` component can silently change its Server/Client boundary, causing hydration errors or bundle bloat. Every move needs a boundary check. |
| Fix all phases in one pass | App Router Client/Server boundaries mean a broken extraction in Phase 1 won't surface until `npm run build`. Stopping between phases gives you a checkpoint to catch errors before they compound. |
| Consolidate barrel `index.ts` exports | Barrel files that re-export Server Components through a `"use client"` barrel silently pull everything into the client bundle. This is a correctness issue, not just a style issue. |

---

## Start Command

**Begin Phase 0 now. Deploy all file-reading tools. Do not write, modify, or delete any file until Phase 1 is explicitly authorized.**
