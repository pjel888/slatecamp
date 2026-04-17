# The Ultimate Codebase & Business Audit Protocol

**Version 2.0 — The Definitive Edition**

> Copy everything inside the blockquote below into your AI assistant (Cursor, Cline, Windsurf, Claude, or any agentic coding tool with terminal + filesystem access).

---

## Why This Exists

No AI can ingest a full repository in a single context window without hallucinating, skimming, or inventing findings. The original "5-phase audit" prompt was a good start, but it had critical gaps:

- It didn't audit **security** (RLS, auth, env vars, injection surface)
- It didn't audit **performance** (bundle size, query N+1, render waterfalls)
- It didn't audit **the database layer** (schema design, missing indexes, migration hygiene)
- It didn't audit **error handling** (do errors crash or degrade gracefully?)
- It didn't audit **the business model** against what the code actually ships
- It didn't measure anything — no counts, no metrics, just vibes

This version fixes all of that. It turns the AI into a **metered, autonomous auditing agent** that produces hard numbers, not impressions.

---

## The Prompt

> ---
>
> ## ROLE ASSIGNMENT — MULTI-DISCIPLINARY DUE DILIGENCE TASK FORCE
>
> You are an elite, multi-disciplinary Tech & Product Due Diligence Task Force. You operate with the combined expertise of:
>
> 1. **A Principal Software Architect** — Expert in Next.js App Router, React Server Components, TypeScript, Supabase/PostgreSQL, state management, and modern fullstack architecture. Obsessed with eliminating unnecessary complexity.
> 2. **A Security & Infrastructure Engineer** — Focused on authentication, Row Level Security, environment variable hygiene, injection surfaces, dependency vulnerabilities, and data leakage vectors.
> 3. **A Performance Engineer** — Focused on Core Web Vitals, bundle analysis, render waterfalls, database query performance, N+1 problems, and lighthouse-grade optimization.
> 4. **A Startup CTO & Business Strategist** — Evaluating code as a business asset: shipping velocity, feature completeness relative to market positioning, technical risks to fundraising/acquisition, and cost of technical debt in engineering-hours.
> 5. **A Principal UX/UI Designer & Cognitive Psychologist** — Evaluating the frontend for design system consistency, cognitive load, accessibility (WCAG 2.1 AA), empty/error/loading state coverage, and behavioral friction.
> 6. **A Database Architect** — Evaluating schema design, RLS policy coverage, indexing strategy, migration hygiene, query patterns, and data integrity.
>
> ---
>
> ## PROJECT OBJECTIVE
>
> Conduct a merciless, comprehensive, full-scale audit of this entire codebase. You will analyze its Git history, infrastructure, security posture, performance characteristics, database layer, feature completeness, UX consistency, and business alignment.
>
> The final deliverable: **`GLOBAL-CODEBASE-AUDIT-REPORT.md`** — a definitive document that could be handed to an investor, an incoming CTO, or a principal engineer on Day 1 and give them complete understanding of where this codebase stands.
>
> ---
>
> ## THE EXECUTION PROTOCOL
>
> ### Critical Rules
>
> 1. **Sequential execution only.** Complete each phase fully before moving to the next. Do NOT write the final report until Phase 10.
> 2. **Terminal-first.** Use `bash`, `grep`, `find`, `wc`, `git log`, `cat`, and filesystem tools to gather real data. Never guess file contents — read them.
> 3. **Numbers, not impressions.** Every finding must include a count, a file path, or a concrete example. "The codebase has some technical debt" is worthless. "47 files use `any` types, concentrated in `src/lib/queries/`" is useful.
> 4. **Stop after each phase.** Output raw findings. Wait for my `PROCEED` command before the next phase.
> 5. **Acknowledge uncertainty.** If you cannot determine something from the code alone, say so explicitly. Never fabricate findings.
>
> ---
>
> ## PHASE 1: THE MACRO CRAWL — Infrastructure & Git Archaeology
>
> **Goal:** Understand what this project IS before judging it.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Directory structure (2 levels deep, ignore noise)
> find . -maxdepth 3 -type d \
>   ! -path '*/node_modules/*' \
>   ! -path '*/.next/*' \
>   ! -path '*/.git/*' \
>   ! -path '*/dist/*' \
>   | sort
>
> # 2. Tech stack fingerprint
> cat package.json | head -80
> cat tsconfig.json 2>/dev/null | head -40
> cat next.config.* 2>/dev/null
> cat tailwind.config.* 2>/dev/null | head -60
>
> # 3. Dependency audit
> cat package.json | grep -A 200 '"dependencies"' | head -100
> cat package.json | grep -A 200 '"devDependencies"' | head -80
>
> # 4. Git velocity — last 60 commits
> git log --oneline --since="6 months ago" | wc -l
> git log --format="%ai %s" -n 40
>
> # 5. Commit frequency by week (shipping momentum)
> git log --since="3 months ago" --format="%ai" | cut -d' ' -f1 | cut -d'-' -f1,2,3 | uniq -c | sort -rn | head -20
>
> # 6. Hotspot analysis — most-changed files (churn = risk)
> git log --since="3 months ago" --pretty=format: --name-only | sort | uniq -c | sort -rn | head -30
>
> # 7. File count by type
> echo "=== TypeScript ===" && find src/ -name "*.ts" -o -name "*.tsx" | wc -l
> echo "=== CSS/Tailwind ===" && find src/ -name "*.css" | wc -l
> echo "=== Test files ===" && find . -name "*.test.*" -o -name "*.spec.*" | wc -l
> echo "=== Total src files ===" && find src/ -type f | wc -l
>
> # 8. Environment variable surface
> grep -r "process.env" src/ --include="*.ts" --include="*.tsx" -l | sort
> cat .env.example 2>/dev/null || cat .env.local.example 2>/dev/null || echo "No .env example file found"
>
> # 9. README and docs existence
> ls -la README* CONTRIBUTING* CHANGELOG* docs/ 2>/dev/null
> ```
>
> ### Phase 1 Output Requirements
>
> Produce a structured summary covering:
>
> | Section | What to Report |
> |---------|---------------|
> | **Tech Stack** | Framework, language, database, auth, UI library, state management, deployment target |
> | **Dependency Health** | Total deps, any known-vulnerable or deeply outdated packages, unnecessary deps |
> | **Git Velocity** | Commits/week over last 3 months, trend (accelerating/decelerating/stalled) |
> | **Churn Hotspots** | Top 10 most-changed files — these are where bugs hide and refactoring is needed |
> | **Codebase Scale** | Total files, lines of code (approximate), test coverage existence |
> | **Env Var Surface** | How many env vars, are secrets properly separated from public vars |
> | **Documentation** | Does README exist? Is it useful? Any other docs? |
> | **First Impression** | 3-sentence gut check from the CTO lens |
>
> **STOP. Output Phase 1 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 2: ROUTING & FEATURE EXTRACTION — What Does This Product Actually Do?
>
> **Goal:** Map every user-facing feature. Categorize from a business standpoint.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Full route map (Next.js App Router)
> find src/app -name "page.tsx" -o -name "page.ts" | sort
> find src/app -name "layout.tsx" | sort
> find src/app -name "route.ts" -o -name "route.tsx" | sort
> find src/app -name "loading.tsx" | sort
> find src/app -name "error.tsx" | sort
> find src/app -name "not-found.tsx" | sort
>
> # 2. Middleware (auth gates, redirects)
> cat src/middleware.ts 2>/dev/null || cat middleware.ts 2>/dev/null || echo "No middleware"
>
> # 3. Server Actions inventory
> grep -r "'use server'" src/ --include="*.ts" --include="*.tsx" -l | sort
>
> # 4. API route handlers
> find src/app/api -type f 2>/dev/null | sort
>
> # 5. Feature-level component directories
> ls -la src/components/ 2>/dev/null
> find src/components -maxdepth 1 -type d | sort
>
> # 6. Read the 5 most important page files to understand core features
> # (read the actual page.tsx files for dashboard, quiz, main flows)
> ```
>
> ### Phase 2 Output Requirements
>
> Produce a **Feature Roster** table:
>
> | Feature | Route(s) | Category | Completeness | Notes |
> |---------|----------|----------|-------------|-------|
> | *e.g. Dashboard* | `/dashboard` | Core Value Driver | 80% | Missing empty state |
>
> **Categories:**
> - **Core Value Driver** — Directly delivers the product's promise (the thing users pay for)
> - **Activation/Onboarding** — Gets users from signup to first value moment
> - **Retention/Engagement** — Brings users back (notifications, streaks, progress tracking)
> - **Monetization** — Paywall, billing, upgrade flows
> - **Supporting System** — Auth, settings, profile, admin
> - **Incomplete/Orphaned** — Started but abandoned, or no clear purpose
>
> Also report:
> - **Route coverage gaps:** Which Next.js conventions are missing? (loading.tsx, error.tsx, not-found.tsx)
> - **API surface:** How many API routes? What do they do? Any that look unused?
> - **Middleware:** Is auth properly gated? Are protected routes actually protected?
>
> **STOP. Output Phase 2 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 3: ARCHITECTURE DEEP DIVE — Next.js & React Patterns
>
> **Goal:** Find every architectural anti-pattern that will cost engineering hours later.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Client vs Server component ratio
> echo "=== 'use client' files ===" && grep -r "'use client'" src/ --include="*.tsx" --include="*.ts" -l | wc -l
> echo "=== Total component files ===" && find src/components -name "*.tsx" | wc -l
>
> # 2. Find components that might not need 'use client'
> # (files with 'use client' but no hooks, no event handlers, no browser APIs)
> grep -r "'use client'" src/ --include="*.tsx" -l | while read f; do
>   if ! grep -qE "useState|useEffect|useRef|useCallback|useMemo|useReducer|onClick|onChange|onSubmit|window\.|document\.|navigator\." "$f"; then
>     echo "SUSPECT: $f"
>   fi
> done
>
> # 3. Inline components in routing files (anti-pattern)
> for f in $(find src/app -name "page.tsx" -o -name "layout.tsx"); do
>   count=$(grep -c "^const \|^function " "$f" 2>/dev/null)
>   if [ "$count" -gt 1 ]; then
>     echo "INLINE COMPONENTS ($count definitions): $f"
>   fi
> done
>
> # 4. Data fetching patterns
> grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" -l | head -20
> grep -r "supabase" src/ --include="*.ts" --include="*.tsx" -l | head -30
>
> # 5. Direct Supabase calls outside query layer (anti-pattern)
> grep -r "supabase\.\(from\|rpc\|storage\)" src/app/ --include="*.tsx" --include="*.ts" -l
> grep -r "supabase\.\(from\|rpc\|storage\)" src/components/ --include="*.tsx" --include="*.ts" -l
>
> # 6. select('*') queries (anti-pattern — overfetching)
> grep -rn "select('\*')" src/ --include="*.ts" --include="*.tsx"
>
> # 7. Parallel vs waterfall data fetching in pages
> grep -rn "Promise.all\|Promise.allSettled" src/app/ --include="*.tsx"
>
> # 8. State management audit
> grep -r "zustand\|create(" src/ --include="*.ts" -l
> grep -r "useContext\|createContext" src/ --include="*.tsx" --include="*.ts" -l
> grep -r "jotai\|recoil\|redux" src/ --include="*.ts" --include="*.tsx" -l
>
> # 9. Import hygiene — barrel files
> find src/ -name "index.ts" -o -name "index.tsx" | head -20
>
> # 10. Prop drilling detection — components with >6 props
> grep -rn "interface.*Props" src/ --include="*.tsx" --include="*.ts" | head -30
> ```
>
> ### Phase 3 Output Requirements
>
> Score each category (🟢 Clean / 🟡 Needs Work / 🔴 Critical):
>
> | Category | Score | Finding Count | Details |
> |----------|-------|--------------|---------|
> | Server/Client boundary | | | |
> | Data fetching architecture | | | |
> | Query layer discipline | | | |
> | State management | | | |
> | Import hygiene | | | |
> | Routing file cleanliness | | | |
> | Parallel data loading | | | |
>
> List the **Top 5 Architectural Bottlenecks** threatening scalability, with exact file paths and line numbers.
>
> **STOP. Output Phase 3 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 4: DATABASE & SECURITY AUDIT
>
> **Goal:** Find every data leak, missing RLS policy, unindexed query, and auth vulnerability.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Schema files / migrations
> find . -path "*/migrations/*" -o -path "*/schema/*" | sort
> find . -name "database.ts" -path "*/types/*" | head -5
>
> # 2. RLS policy files
> grep -r "ENABLE ROW LEVEL SECURITY\|CREATE POLICY" . --include="*.sql" -l
>
> # 3. Supabase client setup files
> find src/ -path "*supabase*" -type f | sort
>
> # 4. Auth pattern — how is the user retrieved?
> grep -rn "auth.getUser\|auth.getSession\|getUser()\|getSession()" src/ --include="*.ts" --include="*.tsx" | head -20
>
> # 5. Service role key usage (should be server-only)
> grep -rn "SUPABASE_SERVICE_ROLE\|service_role" src/ --include="*.ts" --include="*.tsx"
>
> # 6. Unscoped queries (missing user_id filter — data leakage risk)
> grep -r "\.from(" src/lib/ --include="*.ts" -A 5 | grep -v "user_id\|auth" | head -40
>
> # 7. Input validation — Zod or similar
> grep -r "z\.\|zod\|yup\|joi" src/ --include="*.ts" --include="*.tsx" -l | wc -l
> grep -r "safeParse\|validate\|parse(" src/lib/actions/ --include="*.ts" -l 2>/dev/null
>
> # 8. Environment variable exposure
> grep -r "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx" -l | wc -l
> grep -rn "SUPABASE_SERVICE_ROLE\|SECRET\|PRIVATE" .env* 2>/dev/null
>
> # 9. Soft delete compliance (if applicable)
> grep -rn "\.delete()" src/ --include="*.ts" --include="*.tsx"
>
> # 10. Error handling in server actions
> grep -r "'use server'" src/ --include="*.ts" -l | while read f; do
>   if ! grep -q "try\|catch\|error" "$f"; then
>     echo "NO ERROR HANDLING: $f"
>   fi
> done
> ```
>
> ### Phase 4 Output Requirements
>
> **Security Scorecard:**
>
> | Vector | Status | Details |
> |--------|--------|---------|
> | RLS on all user tables | 🟢/🟡/🔴 | |
> | Auth check on all protected routes | | |
> | Input validation on all mutations | | |
> | Service role key isolation | | |
> | No `select('*')` queries | | |
> | All queries scoped to user_id | | |
> | Env var hygiene | | |
> | Soft delete compliance | | |
> | Error handling coverage | | |
>
> List every **Critical Security Finding** with file path, line number, and recommended fix.
>
> **STOP. Output Phase 4 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 5: PERFORMANCE AUDIT
>
> **Goal:** Identify render waterfalls, bundle bloat, missing optimizations, and database query inefficiency.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Bundle analysis prep
> cat next.config.* | grep -i "bundle\|analyzer\|webpack\|swc\|turbo"
>
> # 2. Image optimization
> grep -r "next/image\|<img " src/ --include="*.tsx" | head -20
> find public/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | head -20
> find public/ -name "*.png" -o -name "*.jpg" -exec du -h {} + 2>/dev/null | sort -rh | head -10
>
> # 3. Dynamic imports (code splitting)
> grep -r "next/dynamic\|React.lazy\|import(" src/ --include="*.tsx" --include="*.ts" | head -20
>
> # 4. Suspense boundaries
> grep -r "<Suspense" src/ --include="*.tsx" | wc -l
> grep -r "<Suspense" src/ --include="*.tsx" | head -15
>
> # 5. Loading states coverage
> echo "=== Pages with loading.tsx ===" && find src/app -name "loading.tsx" | wc -l
> echo "=== Total page routes ===" && find src/app -name "page.tsx" | wc -l
>
> # 6. Skeleton components
> find src/ -name "*skeleton*" -o -name "*Skeleton*" | sort
>
> # 7. Render waterfall detection — sequential awaits in pages
> for f in $(find src/app -name "page.tsx"); do
>   awaits=$(grep -c "await " "$f" 2>/dev/null)
>   if [ "$awaits" -gt 2 ]; then
>     has_parallel=$(grep -c "Promise.all\|Promise.allSettled" "$f" 2>/dev/null)
>     if [ "$has_parallel" -eq 0 ]; then
>       echo "WATERFALL RISK ($awaits sequential awaits): $f"
>     fi
>   fi
> done
>
> # 8. Console.log pollution
> grep -rn "console.log\|console.warn\|console.error" src/ --include="*.ts" --include="*.tsx" | wc -l
>
> # 9. Unused exports detection (approximate)
> grep -r "export function\|export const\|export default" src/lib/ --include="*.ts" | wc -l
>
> # 10. Heavy dependency check
> cat package.json | grep -E "moment|lodash[^/]|axios|jquery|chart.js|d3"
>
> # 11. Font loading strategy
> grep -r "next/font\|@font-face\|google.*font" src/ --include="*.tsx" --include="*.ts" --include="*.css" | head -10
> ```
>
> ### Phase 5 Output Requirements
>
> **Performance Scorecard:**
>
> | Category | Score | Details |
> |----------|-------|---------|
> | Image optimization | 🟢/🟡/🔴 | Using next/image? WebP? Lazy loading? |
> | Code splitting | | Dynamic imports in use? |
> | Suspense coverage | | X Suspense boundaries vs Y page routes |
> | Loading state coverage | | X loading.tsx vs Y page routes |
> | Data fetching efficiency | | Sequential waterfalls found? |
> | Bundle hygiene | | Heavy/unnecessary deps? |
> | Console pollution | | Count of console.* statements |
> | Font loading | | Strategy and impact |
>
> **STOP. Output Phase 5 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 6: TYPESCRIPT & CODE QUALITY AUDIT
>
> **Goal:** Measure type safety, code hygiene, and maintainability debt.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. TypeScript strictness
> cat tsconfig.json | grep -E "strict|noImplicit|noUnused"
>
> # 2. 'any' type count (the debt metric)
> grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.tsx" | wc -l
> grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.tsx" | head -20
>
> # 3. @ts-ignore / @ts-expect-error / @ts-nocheck
> grep -rn "@ts-ignore\|@ts-expect-error\|@ts-nocheck" src/ --include="*.ts" --include="*.tsx"
>
> # 4. Missing return types on exported functions
> grep -rn "export.*function\|export.*const.*=.*(" src/lib/ --include="*.ts" | grep -v ":" | head -20
>
> # 5. Props interface discipline
> grep -rn "interface.*Props\|type.*Props" src/ --include="*.tsx" | wc -l
> echo "vs components:" && find src/components -name "*.tsx" | wc -l
>
> # 6. Unused imports (approximate — check for common patterns)
> grep -rn "^import" src/ --include="*.tsx" --include="*.ts" | grep -c "{ }" 2>/dev/null
>
> # 7. Relative imports (should be @/ absolute)
> grep -rn "from '\.\./\.\." src/ --include="*.ts" --include="*.tsx" | wc -l
>
> # 8. Consistent naming patterns
> find src/components -name "*.tsx" | xargs -I{} basename {} | sort | head -30
> find src/lib -name "*.ts" | xargs -I{} basename {} | sort | head -30
>
> # 9. TODO/FIXME/HACK comments (acknowledged debt)
> grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP\|WORKAROUND" src/ --include="*.ts" --include="*.tsx"
>
> # 10. Duplicate utility functions
> grep -rn "function format\|function parse\|function transform\|function convert" src/ --include="*.ts" --include="*.tsx" | head -20
>
> # 11. Test coverage
> find . -name "*.test.*" -o -name "*.spec.*" | wc -l
> cat jest.config.* 2>/dev/null || cat vitest.config.* 2>/dev/null || echo "No test config found"
> ```
>
> ### Phase 6 Output Requirements
>
> **Code Quality Scorecard:**
>
> | Metric | Count | Target | Status |
> |--------|-------|--------|--------|
> | `any` types | X | 0 | 🟢/🟡/🔴 |
> | `@ts-ignore` directives | X | 0 | |
> | Relative imports (`../..`) | X | 0 | |
> | TODO/FIXME comments | X | — | |
> | Test files | X | >0 | |
> | Props interfaces vs components | X/Y | 1:1 | |
>
> **STOP. Output Phase 6 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 7: UX, UI & DESIGN SYSTEM AUDIT
>
> **Goal:** Evaluate visual consistency, component reusability, accessibility, and cognitive load.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Component library structure
> find src/components/ui -type f 2>/dev/null | sort
>
> # 2. Button implementations (should be ONE)
> grep -rn "<button\|<Button" src/ --include="*.tsx" | grep -v "node_modules\|ui/button" | wc -l
>
> # 3. Inconsistent color usage (hardcoded hex vs tokens)
> grep -rn "bg-\[#\|text-\[#\|border-\[#" src/ --include="*.tsx" | wc -l
> grep -rn "bg-\[#\|text-\[#\|border-\[#" src/ --include="*.tsx" | head -15
>
> # 4. Empty state coverage
> grep -r "empty\|no data\|no results\|nothing here\|get started" src/components/ --include="*.tsx" -l | wc -l
>
> # 5. Error state coverage
> grep -r "error\|something went wrong\|try again" src/components/ --include="*.tsx" -l | wc -l
>
> # 6. Skeleton / loading component coverage
> find src/ -iname "*skeleton*" -o -iname "*loading*" | wc -l
>
> # 7. Accessibility basics
> grep -rn "aria-label\|aria-describedby\|aria-live\|role=" src/ --include="*.tsx" | wc -l
> grep -rn "alt=" src/ --include="*.tsx" | wc -l
>
> # 8. Touch target compliance (interactive elements without sizing)
> grep -rn "<button\|<a " src/components/ --include="*.tsx" | grep -v "p-\|px-\|py-\|h-\|w-\|min-h\|min-w" | head -10
>
> # 9. Tooltip coverage on non-obvious UI elements
> grep -r "Tooltip\|tooltip" src/ --include="*.tsx" | wc -l
>
> # 10. Dark mode support
> grep -r "dark:" src/ --include="*.tsx" | wc -l
>
> # 11. Responsive design
> grep -r "sm:\|md:\|lg:\|xl:" src/ --include="*.tsx" | wc -l
>
> # 12. Font consistency
> grep -r "font-\[" src/ --include="*.tsx" | head -10
> grep -r "text-\[" src/ --include="*.tsx" | grep -v "text-\[#" | head -10
> ```
>
> ### Phase 7 Output Requirements
>
> **Design System Health:**
>
> | Dimension | Score | Finding |
> |-----------|-------|---------|
> | Component reusability | 🟢/🟡/🔴 | How many button/card/modal variants exist? |
> | Color token discipline | | Hardcoded hex vs design tokens ratio |
> | Empty state coverage | | X components with empty states vs total |
> | Error state coverage | | |
> | Loading/skeleton coverage | | |
> | Accessibility (ARIA) | | ARIA attribute count, alt text coverage |
> | Dark mode coverage | | Count of dark: utilities |
> | Responsive coverage | | Count of breakpoint utilities |
> | Cognitive load | | Screens with >1 primary CTA? |
>
> **STOP. Output Phase 7 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 8: DEAD CODE & DEPENDENCY WASTE AUDIT
>
> **Goal:** Find every file, export, dependency, and route that costs money to maintain but delivers zero value.
>
> ### Terminal Commands to Execute
> ```bash
> # 1. Orphan component detection — components not imported anywhere
> for f in $(find src/components -name "*.tsx" | grep -v "ui/"); do
>   component_name=$(basename "$f" .tsx)
>   imports=$(grep -r "$component_name" src/ --include="*.tsx" --include="*.ts" -l | grep -v "$f" | wc -l)
>   if [ "$imports" -eq 0 ]; then
>     echo "ORPHAN: $f"
>   fi
> done
>
> # 2. Unused dependencies (approximate)
> for dep in $(cat package.json | grep -oP '"[a-z@][a-z0-9@/.-]*"(?=:)' | tr -d '"' | grep -v "^@types"); do
>   short_name=$(echo "$dep" | sed 's/@.*\///' | sed 's/-/_/g')
>   found=$(grep -r "$dep\|$short_name" src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l)
>   if [ "$found" -eq 0 ]; then
>     echo "UNUSED DEP: $dep"
>   fi
> done
>
> # 3. Unused exports from lib/
> for f in $(find src/lib -name "*.ts"); do
>   exports=$(grep -oP "export (function|const|type|interface) \K\w+" "$f" 2>/dev/null)
>   for ex in $exports; do
>     imports=$(grep -r "$ex" src/ --include="*.ts" --include="*.tsx" -l | grep -v "$f" | wc -l)
>     if [ "$imports" -eq 0 ]; then
>       echo "UNUSED EXPORT: $ex in $f"
>     fi
>   done
> done 2>/dev/null | head -30
>
> # 4. Empty or near-empty files
> find src/ -name "*.ts" -o -name "*.tsx" | while read f; do
>   lines=$(wc -l < "$f")
>   if [ "$lines" -lt 5 ]; then
>     echo "NEAR-EMPTY ($lines lines): $f"
>   fi
> done
>
> # 5. Commented-out code blocks
> grep -rn "// .*function\|// .*const\|// .*return\|/\*" src/ --include="*.ts" --include="*.tsx" | grep -v "TODO\|FIXME\|NOTE\|http" | wc -l
> ```
>
> ### Phase 8 Output Requirements
>
> | Waste Category | Count | Impact |
> |---------------|-------|--------|
> | Orphan components | X files | Bundle bloat, maintenance confusion |
> | Unused dependencies | X packages | Install time, supply chain risk |
> | Unused exports | X functions | Dead code, misleading API surface |
> | Empty/stub files | X files | Noise |
> | Commented-out code | ~X blocks | Technical debt signal |
>
> **STOP. Output Phase 8 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 9: BUSINESS & STRATEGIC AUDIT
>
> **Goal:** Bridge the gap between code and business. What does the codebase say about the company's trajectory?
>
> ### Analysis Framework (No Terminal — This Is Synthesis)
>
> Using ALL data from Phases 1-8, answer these questions:
>
> **Product-Market Fit Signals:**
> 1. What percentage of the codebase supports the core value proposition vs. supporting systems?
> 2. Are the most-changed files (git churn) aligned with the core product, or is engineering time leaking to peripheral features?
> 3. Is the onboarding flow complete enough that a new user can reach the "aha moment" without hitting dead ends?
>
> **Technical Risk to the Business:**
> 4. If an investor or acquirer did technical due diligence, what would concern them most?
> 5. How many engineering-weeks would it take to remediate the critical findings from Phases 3-6?
> 6. Is the architecture ready for 10x users without a rewrite?
>
> **Velocity & Team Health:**
> 7. Based on git history, is this a solo-developer codebase or a team? (commit authors, patterns)
> 8. Is commit velocity increasing or decreasing? What does that mean?
> 9. Are features being shipped to completion, or is there a pattern of starting-but-not-finishing?
>
> **Monetization Readiness:**
> 10. Is there a paywall/billing system in the code? How complete is it?
> 11. What is the gap between "current features" and "features needed to charge money"?
>
> ### Phase 9 Output Requirements
>
> Write this as a **narrative memo** (not a table) addressed to the founder/CEO. Be direct. Be honest. Use the data from previous phases as evidence.
>
> **STOP. Output Phase 9 findings and wait for PROCEED.**
>
> ---
>
> ## PHASE 10: MASTER DOCUMENT GENERATION
>
> **Goal:** Synthesize ALL findings from Phases 1-9 into the definitive audit report.
>
> ### Document Structure
>
> ```
> # GLOBAL CODEBASE AUDIT REPORT
> ## [Project Name] — [Date]
>
> ---
>
> ### 1. EXECUTIVE SUMMARY (The 60-Second Brief)
> - 3-4 sentences: what this codebase is, its current state, and the #1 thing to fix
> - Overall health grade: A/B/C/D/F with one-line justification
>
> ### 2. TECH STACK & INFRASTRUCTURE
> - Stack overview table
> - Dependency health
> - Environment variable hygiene
>
> ### 3. GIT ARCHAEOLOGY & SHIPPING VELOCITY
> - Commit velocity chart (weekly, last 3 months)
> - Churn hotspot analysis
> - Shipping pattern narrative
>
> ### 4. FEATURE ROSTER & BUSINESS ALIGNMENT
> - Complete feature table with categories and completeness
> - Gap analysis: what's missing to charge money
> - Orphaned/incomplete features costing maintenance
>
> ### 5. ARCHITECTURE REVIEW
> - Server/Client boundary analysis
> - Data fetching patterns
> - State management assessment
> - Top architectural bottlenecks
>
> ### 6. DATABASE & SECURITY AUDIT
> - Security scorecard
> - RLS coverage
> - Auth pattern assessment
> - Critical vulnerabilities (if any)
>
> ### 7. PERFORMANCE ASSESSMENT
> - Performance scorecard
> - Render waterfall analysis
> - Bundle and image optimization
> - Loading state coverage
>
> ### 8. CODE QUALITY & TYPE SAFETY
> - Code quality scorecard
> - TypeScript strictness
> - Test coverage (or lack thereof)
> - Dead code / waste inventory
>
> ### 9. UX/UI & DESIGN SYSTEM
> - Design system health scorecard
> - Component consistency
> - Accessibility assessment
> - Cognitive load analysis
>
> ### 10. BUSINESS & STRATEGIC ASSESSMENT
> - CTO memo (from Phase 9)
> - Technical risks to the business
> - Scalability readiness
>
> ### 11. THE REMEDIATION ROADMAP
>
> Priority-ordered action items in 3 tiers:
>
> **TIER 1 — Fix This Week (Critical / Security / Data Loss Risk)**
> - [ ] Item with file path and specific action
>
> **TIER 2 — Fix This Month (Architecture / Performance / DX)**
> - [ ] Item with file path and specific action
>
> **TIER 3 — Fix This Quarter (Quality / Polish / Scale Prep)**
> - [ ] Item with file path and specific action
>
> ### 12. APPENDIX
> - Full orphan file list
> - Full unused dependency list
> - Full `any` type location list
> - Full TODO/FIXME inventory
> ```
>
> ### Document Quality Requirements
> - Every finding has a file path or command output as evidence
> - Every recommendation has a clear action verb ("Remove X", "Add Y to Z", "Refactor A into B")
> - Scorecards use 🟢/🟡/🔴 consistently
> - The roadmap is ordered by impact × effort — highest impact, lowest effort first
> - No filler sentences. No "in conclusion." No "as we can see." Dense, useful prose only.
>
> **Generate the complete `GLOBAL-CODEBASE-AUDIT-REPORT.md` file now.**
>
> ---
>
> ## YOUR INITIAL COMMAND
>
> 1. Acknowledge your multi-disciplinary role and the strict 10-phase protocol
> 2. Confirm you understand that reading too many files at once causes context degradation and hallucination
> 3. Confirm you will produce hard numbers and file paths, not impressions
> 4. Execute **Phase 1 ONLY** using your Terminal and File System tools
> 5. Output your Phase 1 findings, stop, and wait for my PROCEED command
>
> ---

---

## How to Use This Prompt

### Option A: Paste directly into an agentic AI tool
If you're using Cursor, Cline, Windsurf, or Claude with computer use — paste the entire blockquote above. The AI will begin Phase 1 autonomously.

### Option B: Pre-generate data for non-agentic tools
If your AI doesn't have terminal access, run this script locally first, then paste the output along with the prompt:

```bash
#!/bin/bash
# pre-audit-data.sh — Run this in your project root
# Pipe output to a file: ./pre-audit-data.sh > audit-data.txt

echo "=== DIRECTORY STRUCTURE ==="
find . -maxdepth 3 -type d ! -path '*/node_modules/*' ! -path '*/.next/*' ! -path '*/.git/*' | sort

echo -e "\n=== PACKAGE.JSON ==="
cat package.json

echo -e "\n=== TSCONFIG ==="
cat tsconfig.json 2>/dev/null

echo -e "\n=== GIT LOG (last 40 commits) ==="
git log --format="%ai %s" -n 40

echo -e "\n=== CHURN HOTSPOTS ==="
git log --since="3 months ago" --pretty=format: --name-only | sort | uniq -c | sort -rn | head -30

echo -e "\n=== FILE COUNTS ==="
echo "TypeScript:" && find src/ -name "*.ts" -o -name "*.tsx" | wc -l
echo "Tests:" && find . -name "*.test.*" -o -name "*.spec.*" | wc -l

echo -e "\n=== ROUTE MAP ==="
find src/app -name "page.tsx" 2>/dev/null | sort

echo -e "\n=== USE CLIENT FILES ==="
grep -r "'use client'" src/ --include="*.tsx" -l 2>/dev/null

echo -e "\n=== ANY TYPES ==="
grep -rn ": any\|as any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null

echo -e "\n=== ENV VARS ==="
grep -r "process.env" src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | sort
```

### What Changed From Version 1.0

| V1.0 (Original) | V2.0 (This Version) |
|---|---|
| 5 phases | 10 phases — each phase has a single clear focus |
| No security audit | Full security phase: RLS, auth, env vars, input validation |
| No performance audit | Full performance phase: waterfalls, bundle, images, Suspense |
| No database audit | Full database phase: schema, indexes, migrations, query patterns |
| No code quality metrics | TypeScript strictness, `any` counts, test coverage, TODO inventory |
| No dead code detection | Full waste audit: orphan components, unused deps, unused exports |
| No business synthesis | Strategic memo phase connecting code to business trajectory |
| "Vibes-based" findings | Every finding requires a count, file path, or command output |
| Single report structure | 12-section report with scorecards, appendix, and tiered roadmap |
| No pre-generation script | Includes bash script for non-agentic AI tools |
