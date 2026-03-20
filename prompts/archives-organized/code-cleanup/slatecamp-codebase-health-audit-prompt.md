# SlateCamp — Codebase Health Audit
## Read Every File. Change Nothing. Report Everything.

---

## ROLE

You are a Senior Code Reviewer performing a full codebase audit. You READ and ANALYZE only — you do NOT modify, delete, rename, or create any files. Your output is a single comprehensive markdown report saved to `/mnt/user-data/outputs/slatecamp-codebase-audit.md`.

---

## CONSTRAINTS

- **READ-ONLY.** Do not edit, delete, move, or create any source files. The ONLY file you create is the final report.
- **No opinions about business logic.** You are auditing CODE QUALITY, not product decisions.
- **No opinions about the database schema.** That's been audited separately.
- **Be specific.** Every finding must include the exact file path and line number(s). "Some components seem unused" is worthless. "`src/components/ui/legacy-card.tsx` — 0 imports found across codebase" is useful.

---

## PHASE 1: Map the Entire Codebase

Run ALL of these. Capture the output mentally — you'll reference it throughout the audit.

```bash
# ─── STRUCTURE ───────────────────────────────────────────────

# 1. Full directory tree (exclude node_modules, .next, .git)
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.json" \) | sort | head -300

# 2. Directory structure (folders only, 3 levels)
find src/ -type d | sort

# 3. Count files by type
echo "=== FILE COUNTS ==="
find src/ -name "*.tsx" | wc -l
find src/ -name "*.ts" | wc -l
find src/ -name "*.css" | wc -l
find src/ -name "*.js" | wc -l

# 4. App Router page structure
find src/app -name "page.tsx" -o -name "layout.tsx" -o -name "loading.tsx" -o -name "error.tsx" -o -name "not-found.tsx" | sort

# 5. Total lines of code (rough)
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1

# ─── DEPENDENCIES ────────────────────────────────────────────

# 6. Package.json dependencies
cat package.json | grep -A 200 '"dependencies"' | head -60
cat package.json | grep -A 200 '"devDependencies"' | head -40

# 7. Check for lockfile type
ls -la package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null

# ─── CONFIGURATION ───────────────────────────────────────────

# 8. TypeScript config
cat tsconfig.json

# 9. Tailwind config
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null

# 10. Next.js config
cat next.config.ts 2>/dev/null || cat next.config.js 2>/dev/null || cat next.config.mjs 2>/dev/null

# 11. ESLint config
cat .eslintrc.json 2>/dev/null || cat .eslintrc.js 2>/dev/null || cat eslint.config.mjs 2>/dev/null

# 12. Environment variables template
cat .env.example 2>/dev/null || cat .env.local.example 2>/dev/null
```

---

## PHASE 2: Dead Code Detection

### 2a. Unused Exports — Components

For EVERY `.tsx` file in `src/components/`:

```bash
# List all component files
find src/components -name "*.tsx" | sort
```

For each file, check if it's imported ANYWHERE in the codebase:

```bash
# For each component file, extract the export name and search for imports
# Example pattern — run for EVERY component:
grep -rn "from.*['\"]@/components/[path]" src/ --include="*.ts" --include="*.tsx" | head -5

# Bulk approach: find all exports, then check imports
grep -rn "export " src/components/ --include="*.tsx" -l | while read f; do
  basename="${f##*/}"
  name="${basename%.tsx}"
  count=$(grep -rn "$name" src/ --include="*.ts" --include="*.tsx" | grep -v "^$f:" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "UNUSED: $f (0 imports)"
  fi
done
```

### 2b. Unused Exports — Utility Functions

```bash
# List all utility/lib files
find src/lib -name "*.ts" -o -name "*.tsx" | sort

# For each exported function, check if it's imported anywhere
grep -rn "export function\|export async function\|export const" src/lib/ --include="*.ts" | while IFS=: read file line content; do
  funcname=$(echo "$content" | sed 's/export \(async \)\?function \([a-zA-Z_]*\).*/\2/' | sed 's/export const \([a-zA-Z_]*\).*/\1/')
  count=$(grep -rn "$funcname" src/ --include="*.ts" --include="*.tsx" | grep -v "^$file:" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "UNUSED EXPORT: $file:$line — $funcname (0 references)"
  fi
done
```

### 2c. Unused Dependencies (package.json)

```bash
# For each dependency, check if it's imported anywhere in src/
cat package.json | grep -oP '"(@?[a-z][a-z0-9._/-]*)":' | tr -d '"' | tr -d ':' | while read dep; do
  count=$(grep -rn "from ['\"]$dep" src/ --include="*.ts" --include="*.tsx" --include="*.js" | wc -l)
  count2=$(grep -rn "require(['\"]$dep" src/ --include="*.ts" --include="*.tsx" --include="*.js" | wc -l)
  total=$((count + count2))
  if [ "$total" -eq 0 ]; then
    echo "UNUSED DEP: $dep (0 imports in src/)"
  fi
done
```

### 2d. Unused CSS Classes

```bash
# Find all CSS/Tailwind files
find src/ -name "*.css" | sort

# Check for custom CSS classes defined but never referenced
grep -oP '\.[a-zA-Z_-][a-zA-Z0-9_-]*\s*\{' src/**/*.css 2>/dev/null | while IFS=: read file class; do
  classname=$(echo "$class" | tr -d '.{' | tr -d ' ')
  count=$(grep -rn "$classname" src/ --include="*.tsx" --include="*.ts" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "UNUSED CSS CLASS: $file — .$classname"
  fi
done
```

### 2e. Orphaned Files

```bash
# Files in src/ that are never imported by anything
find src/ -name "*.ts" -o -name "*.tsx" | grep -v "page.tsx\|layout.tsx\|loading.tsx\|error.tsx\|not-found.tsx\|middleware\|globals.css\|tailwind" | while read f; do
  relpath=$(echo "$f" | sed 's|^src/||' | sed 's|\.tsx\?$||' | sed 's|/index$||')
  basename="${f##*/}"
  name="${basename%.*}"
  count=$(grep -rn "$name\|$relpath" src/ --include="*.ts" --include="*.tsx" | grep -v "^$f:" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "ORPHAN: $f (never imported)"
  fi
done
```

---

## PHASE 3: Naming & Organization Audit

### 3a. File Naming Consistency

```bash
# Check naming conventions across the codebase
echo "=== COMPONENT FILES ==="
find src/components -name "*.tsx" -printf "%f\n" | sort

echo "=== LIB FILES ==="
find src/lib -name "*.ts" -printf "%f\n" | sort

echo "=== PAGE FILES ==="
find src/app -name "page.tsx" | sort

echo "=== ACTION FILES ==="
find src/ -name "actions.ts" -o -name "actions.tsx" | sort

# Check for mixed naming conventions
echo "=== POTENTIAL NAMING ISSUES ==="
# PascalCase files (React components — expected in components/)
find src/ -name "[A-Z]*.tsx" | sort
# camelCase files
find src/ -name "[a-z]*[A-Z]*.ts" -not -name "*.d.ts" | sort
# kebab-case files
find src/ -name "*-*.ts" -o -name "*-*.tsx" | sort
# snake_case files
find src/ -name "*_*.ts" -o -name "*_*.tsx" | sort
```

### 3b. Component Organization

```bash
# Components directory structure
find src/components -type d | sort

# Check for flat vs nested structure
echo "=== FILES PER COMPONENT DIRECTORY ==="
for dir in $(find src/components -type d); do
  count=$(find "$dir" -maxdepth 1 -name "*.tsx" | wc -l)
  if [ "$count" -gt 0 ]; then
    echo "$dir: $count files"
  fi
done
```

### 3c. Import Path Consistency

```bash
# Check for mixed import styles
echo "=== RELATIVE IMPORTS (should prefer @/ alias) ==="
grep -rn "from ['\"]\.\./" src/ --include="*.ts" --include="*.tsx" | head -30

echo "=== ALIAS IMPORTS ==="
grep -rn "from ['\"]@/" src/ --include="*.ts" --include="*.tsx" | head -5 | wc -l

echo "=== RELATIVE vs ALIAS RATIO ==="
relative=$(grep -rn "from ['\"]\.\./" src/ --include="*.ts" --include="*.tsx" | wc -l)
alias=$(grep -rn "from ['\"]@/" src/ --include="*.ts" --include="*.tsx" | wc -l)
echo "Relative: $relative | Alias: $alias"
```

---

## PHASE 4: Code Quality Analysis

### 4a. TypeScript Strictness

```bash
# Check for 'any' usage
echo "=== 'any' TYPE USAGE ==="
grep -rn ": any\b\|as any\b\|<any>" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|.d.ts" | head -30

# Count
any_count=$(grep -rn ": any\b\|as any\b\|<any>" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|.d.ts" | wc -l)
echo "Total 'any' occurrences: $any_count"

# Check for @ts-ignore / @ts-expect-error
echo "=== TS SUPPRESSIONS ==="
grep -rn "@ts-ignore\|@ts-expect-error\|@ts-nocheck" src/ --include="*.ts" --include="*.tsx" | head -20
```

### 4b. Console Statements

```bash
echo "=== CONSOLE.LOG STATEMENTS ==="
grep -rn "console\.log\|console\.warn\|console\.error\|console\.debug" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | head -30

log_count=$(grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | wc -l)
echo "Total console.log: $log_count"
```

### 4c. Hardcoded Values

```bash
# Hardcoded colors (should use design tokens)
echo "=== HARDCODED COLORS ==="
grep -rn "'#[0-9A-Fa-f]\{3,8\}'" src/ --include="*.tsx" | grep -v "tailwind\|globals\|design-token\|\.css" | head -20

# Hardcoded URLs
echo "=== HARDCODED URLS ==="
grep -rn "http://\|https://" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|package\|README\|comment\|//" | head -20

# Hardcoded strings that should be constants
echo "=== MAGIC NUMBERS ==="
grep -rn "[^a-zA-Z_]=[[:space:]]*[0-9]\{3,\}" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|\.css\|tailwind\|height\|width\|size\|port\|1000\|DEFAULT" | head -20
```

### 4d. Error Handling

```bash
# Empty catch blocks
echo "=== EMPTY CATCH BLOCKS ==="
grep -rn -A1 "catch" src/ --include="*.ts" --include="*.tsx" | grep -B1 "^[[:space:]]*}" | head -20

# Unhandled promises (missing await)
echo "=== POTENTIAL UNHANDLED PROMISES ==="
grep -rn "\.then(\|\.catch(" src/ --include="*.ts" --include="*.tsx" | head -15
```

### 4e. Client/Server Boundary

```bash
# 'use client' directives
echo "=== CLIENT COMPONENTS ==="
grep -rn "'use client'" src/ --include="*.tsx" --include="*.ts" | head -30
client_count=$(grep -rn "'use client'" src/ --include="*.tsx" --include="*.ts" | wc -l)
echo "Total 'use client' files: $client_count"

# Check for useEffect usage (should be minimal per SlateCamp constraints)
echo "=== useEffect USAGE ==="
grep -rn "useEffect" src/ --include="*.tsx" --include="*.ts" | head -20
effect_count=$(grep -rn "useEffect" src/ --include="*.tsx" --include="*.ts" | wc -l)
echo "Total useEffect: $effect_count"

# Check for client-side Supabase writes (violation of SlateCamp constraint)
echo "=== CLIENT-SIDE SUPABASE WRITES (VIOLATION) ==="
grep -rn "supabase.*\.insert\|supabase.*\.update\|supabase.*\.delete\|supabase.*\.upsert" src/ --include="*.tsx" | grep -v "actions\|server\|api" | head -10
```

### 4f. Large Files

```bash
# Files over 300 lines (candidates for splitting)
echo "=== LARGE FILES (>300 lines) ==="
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | head -20

# Files over 500 lines (definitely should be split)
echo "=== VERY LARGE FILES (>500 lines) ==="
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | awk '$1 > 500' | sort -rn
```

### 4g. Duplicate Code Patterns

```bash
# Find similar function signatures across files (potential duplication)
echo "=== DUPLICATE FUNCTION NAMES ==="
grep -rn "export function\|export async function\|export const.*=.*=>" src/ --include="*.ts" --include="*.tsx" | sed 's/.*export \(async \)\?function \([a-zA-Z_]*\).*/\2/' | sed 's/.*export const \([a-zA-Z_]*\).*/\1/' | sort | uniq -c | sort -rn | awk '$1 > 1' | head -15

# Find repeated Supabase query patterns
echo "=== REPEATED SUPABASE QUERIES ==="
grep -rn "\.from(" src/ --include="*.ts" --include="*.tsx" | sed "s/.*\.from(['\"]//;s/['\"])//" | sort | uniq -c | sort -rn | head -15
```

---

## PHASE 5: SlateCamp-Specific Checks

### 5a. Design System Compliance

```bash
# Check if design system colors are used via tokens vs hardcoded
echo "=== DESIGN TOKEN USAGE ==="
grep -rn "var(--" src/ --include="*.tsx" --include="*.css" | wc -l
echo "=== HARDCODED SLATECAMP COLORS ==="
grep -rn "#1B3FC4\|#E63329\|#1B7A3C\|#F5A623\|#E8853A\|#F2F0EB\|#F8F7F5" src/ --include="*.tsx" | wc -l

# Check font usage
echo "=== FONT REFERENCES ==="
grep -rn "font-syne\|font-dm-mono\|font-inter\|Syne\|DM.Mono\|Instrument.Serif" src/ --include="*.tsx" --include="*.css" | wc -l
```

### 5b. SlateCamp Hard Constraints

```bash
# Pure black or white (forbidden)
echo "=== PURE BLACK/WHITE (FORBIDDEN) ==="
grep -rn "'#000000'\|'#000'\|'#ffffff'\|'#fff'" src/ --include="*.tsx" | grep -v "comment\|//" | head -10
grep -rn "\"#000000\"\|\"#000\"\|\"#ffffff\"\|\"#fff\"" src/ --include="*.tsx" | head -10

# Check for emoji in system copy (forbidden)
echo "=== EMOJI IN SYSTEM COPY ==="
grep -rPn "[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F900}-\x{1F9FF}\x{2600}-\x{26FF}]" src/ --include="*.tsx" 2>/dev/null | head -10

# Check for exclamation marks in system strings (forbidden per brand voice)
echo "=== EXCLAMATION MARKS IN UI STRINGS ==="
grep -rn "!['\"]" src/ --include="*.tsx" | grep -v "!=\|!==\|!important\|!/\|\.test\|\.match" | head -15
```

### 5c. Server Action Patterns

```bash
# Find all Server Actions
echo "=== SERVER ACTIONS ==="
grep -rn "'use server'" src/ --include="*.ts" --include="*.tsx" | head -20

# Check if actions are in proper files
find src/ -name "actions.ts" -o -name "actions.tsx" | sort
```

---

## PHASE 6: Generate the Report

After completing ALL phases above, write the final report.

Create: `/mnt/user-data/outputs/slatecamp-codebase-audit.md`

The report MUST follow this exact structure:

```markdown
# SlateCamp — Codebase Health Audit
**Date:** [today]
**Auditor:** Claude Code (read-only analysis)
**Scope:** Full src/ directory
**Files analyzed:** [count]
**Total lines:** [count]

---

## Executive Summary

[3-4 sentences: overall health, biggest concern, biggest strength, one-line recommendation]

---

## 1. Codebase Statistics

| Metric | Value |
|---|---|
| Total .tsx files | X |
| Total .ts files | X |
| Total lines of code | X |
| App Router pages | X |
| Components | X |
| Utility/lib files | X |
| 'use client' files | X |
| useEffect instances | X |
| console.log instances | X |
| 'any' type instances | X |
| @ts-ignore/expect-error | X |

---

## 2. Dead Code — Unused Exports

### Unused Components (0 imports)

| File | Export | Status |
|---|---|---|
| `src/components/xxx.tsx` | ComponentName | 0 imports — safe to delete |
| ... | ... | ... |

### Unused Utility Functions (0 references)

| File:Line | Function | Status |
|---|---|---|
| `src/lib/xxx.ts:42` | functionName | 0 references — safe to delete |
| ... | ... | ... |

### Unused npm Dependencies

| Package | Imported in src/? | Recommendation |
|---|---|---|
| package-name | No | Remove from package.json |
| ... | ... | ... |

### Orphaned Files (never imported)

| File | Last Modified | Recommendation |
|---|---|---|
| `src/xxx/xxx.ts` | [date] | Review — likely dead code |
| ... | ... | ... |

---

## 3. Naming & Organization Issues

### File Naming Inconsistencies

| Issue | Files Affected | Current | Suggested |
|---|---|---|---|
| Mixed case convention | `src/components/userCard.tsx` + `src/components/quiz-modal.tsx` | camelCase + kebab | Pick one consistently |
| ... | ... | ... | ... |

### Folder Structure Issues

| Issue | Current | Suggested |
|---|---|---|
| [Description] | [Current path] | [Better organization] |
| ... | ... | ... |

### Component Naming Issues

| File | Current Export Name | Issue | Suggested |
|---|---|---|---|
| `src/components/xxx.tsx` | `Comp` | Too generic | `QuizSessionCard` |
| ... | ... | ... | ... |

---

## 4. Code Quality Findings

### TypeScript Strictness

| Category | Count | Worst Offenders |
|---|---|---|
| `any` type usage | X | `file.ts:line`, `file.ts:line` |
| @ts-ignore | X | `file.ts:line` |

### Console Statements (should be removed for production)

| File:Line | Statement | Context |
|---|---|---|
| `src/xxx.ts:42` | `console.log(...)` | Debug leftover |
| ... | ... | ... |

### Hardcoded Values (should be constants/tokens)

| File:Line | Value | Should Be |
|---|---|---|
| `src/xxx.tsx:42` | `'#1B3FC4'` | `var(--cobalt)` or Tailwind class |
| ... | ... | ... |

### Large Files (candidates for splitting)

| File | Lines | Recommendation |
|---|---|---|
| `src/xxx.tsx` | 600 | Split into [suggested components] |
| ... | ... | ... |

### Error Handling Issues

| File:Line | Issue | Recommendation |
|---|---|---|
| `src/xxx.ts:42` | Empty catch block | Add error logging or remove try/catch |
| ... | ... | ... |

---

## 5. Architecture Violations

### Client/Server Boundary Issues

| File:Line | Issue | Fix |
|---|---|---|
| `src/xxx.tsx:42` | useEffect for data fetching | Convert to RSC async |
| `src/xxx.tsx:42` | Client-side Supabase write | Move to Server Action |
| ... | ... | ... |

### SlateCamp Design Constraint Violations

| Constraint | Violations | Files |
|---|---|---|
| No pure black/white | X instances | [files] |
| No emoji in system copy | X instances | [files] |
| No useEffect for data fetching | X instances | [files] |
| No client-side Supabase writes | X instances | [files] |
| No `any` types | X instances | [files] |

---

## 6. Import Path Inconsistencies

| Issue | Count | Example |
|---|---|---|
| Relative imports (`../..`) instead of `@/` alias | X | `src/xxx.tsx:5` |
| ... | ... | ... |

---

## 7. Duplicate Code Patterns

| Pattern | Occurrences | Files | Suggested |
|---|---|---|---|
| Same Supabase query for [table] | X | [files] | Extract to shared utility |
| Duplicate function `xxx` | X | [files] | Single source of truth in `src/lib/` |
| ... | ... | ... | ... |

---

## 8. Priority Action Items

### 🔴 Fix Now (breaks production or violates hard constraints)

1. [Specific finding with file:line]
2. ...

### 🟡 Fix Soon (code quality / maintainability)

1. [Specific finding with file:line]
2. ...

### 🟢 Cleanup (nice to have)

1. [Specific finding with file:line]
2. ...

---

## 9. Dependency Audit

| Category | Count | Notes |
|---|---|---|
| Total dependencies | X | |
| Total devDependencies | X | |
| Unused dependencies | X | [list them] |
| Missing @types packages | X | [list them] |

---

## 10. Files Inventory

### All Component Files

[Complete list of every .tsx file in src/components/ with line count]

### All Lib/Utility Files

[Complete list of every .ts file in src/lib/ with line count]

### All Page Routes

[Complete list of every page.tsx in src/app/ with the URL it serves]
```

---

## WHAT NOT TO DO

- **Don't modify any file.** This is a READ-ONLY audit. The only file you create is the report.
- **Don't suggest rewriting business logic.** Focus on code hygiene, not product decisions.
- **Don't suggest database schema changes.** That's covered by separate audit documents.
- **Don't flag intentional patterns as issues.** For example, empty catch blocks in analytics functions are intentional (silent failure). Note them but mark as "intentional pattern — verify."
- **Don't run `npm install`, `npm build`, or any modification commands.**
- **Don't skip the inventory in Section 10.** The complete file list is the most useful part of the audit for future reference.
- **Don't make vague findings.** Every finding needs: exact file path, exact line number, what's wrong, and what to do about it.

---

*Start Phase 1 now. Map the codebase structure.*
