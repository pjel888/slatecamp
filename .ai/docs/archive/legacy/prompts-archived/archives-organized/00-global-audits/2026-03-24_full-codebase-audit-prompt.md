# Full Codebase Audit Prompt for Claude Code

Paste this into Claude Code at your project root. Replace `[PROJECT_NAME]` with your project name.

---

## The Prompt

```
Audit my entire codebase and produce a comprehensive markdown report. Save it as CODEBASE-AUDIT-[DATE].md in the project root (use today's date, e.g. CODEBASE-AUDIT-2026-03-24.md).

Be exhaustive. Read every file. I need the complete ground truth of this codebase. This report will be used by another AI to make architectural decisions, so accuracy and completeness matter more than brevity.

---

### SECTION 1: PROJECT OVERVIEW

- Project name and purpose (read package.json, README, or any docs)
- Tech stack with exact versions (from package.json / bun.lockb)
- Framework and runtime (Next.js version, Node/Bun version, React version)
- Deployment target (Vercel, AWS, self-hosted — check vercel.json, Dockerfile, etc.)
- Package manager (npm, yarn, bun — check lockfile)

### SECTION 2: DIRECTORY STRUCTURE

- Full directory tree of `src/` (3 levels deep)
- Count of files by type (.tsx, .ts, .css, .sql, .md, .json)
- Total lines of code (approximate)
- Largest files by line count (top 10)
- Any files over 500 lines that might need splitting

### SECTION 3: ROUTING & PAGES

For every route in the app:
- File path
- Server Component or Client Component
- What it renders (one-line description)
- Data dependencies (what it fetches, from where)
- Auth requirements (protected or public)
- Layouts that wrap it

Create a complete route map table:
| Route | File | Type | Auth | Description |

### SECTION 4: DATABASE SCHEMA

For every table:
- Full CREATE TABLE statement or column list with types
- Primary keys, foreign keys, unique constraints, check constraints
- Indexes (name, columns, conditions)
- RLS policies (name, operation, using/with check clause)
- Triggers and functions attached to it
- Row count estimate if available

Also report:
- All custom types/enums
- All database functions (PL/pgSQL, etc.)
- All views
- Foreign key relationship map (which tables reference which)

### SECTION 5: API LAYER

For every API route handler (route.ts files) AND server action:
- File path
- Function name and HTTP method (for routes) or export name (for actions)
- What tables it reads/writes
- Auth method (anon, authenticated, service role, API key)
- Input validation (Zod, manual, or none)
- What it returns

Group by domain (auth, content, quiz, billing, admin, etc.)

### SECTION 6: COMPONENT INVENTORY

For every component directory:
- List all components with file paths
- Mark each as Server Component or Client Component
- One-line description of what it does
- Props it accepts (just the interface/type name, not full definition)
- Notable dependencies (external libraries, contexts, stores)

Flag:
- Components over 300 lines
- Components with no imports (potentially dead code)
- Duplicate or near-duplicate components

### SECTION 7: STATE MANAGEMENT

- All Zustand stores (file path, state shape, what uses them)
- All React contexts (file path, what they provide, what uses them)
- URL state patterns (useSearchParams usage)
- Form state patterns (React Hook Form, useState, server actions)

### SECTION 8: AUTHENTICATION & AUTHORIZATION

- Auth provider and method
- Session management (cookies, JWT, etc.)
- Role system (roles, permissions, where they're defined)
- All auth guard functions (name, what they check, where they're used)
- Protected vs public routes
- Service role key usage (every file that uses it)
- Any hardcoded credentials, emails, or IDs

### SECTION 9: EXTERNAL SERVICES & INTEGRATIONS

For each external service:
- Service name and purpose
- SDK/package used
- Environment variables required
- Files that interact with it
- Error handling approach

Common ones to look for: Supabase, LemonSqueezy, PostHog, Anthropic, Vercel, email providers, file storage, CDNs.

### SECTION 10: STYLING & DESIGN SYSTEM

- CSS approach (Tailwind, CSS modules, styled-components, etc.)
- Custom Tailwind config (colors, fonts, breakpoints, plugins)
- Component library (Shadcn, Radix, MUI, etc.)
- Design tokens (colors, spacing, typography — from config)
- Dark mode implementation
- Global styles location

### SECTION 11: TESTING

- Test framework (Jest, Vitest, Playwright, Cypress)
- Test file locations and naming convention
- Test coverage (if measurable)
- Number of test files
- CI/CD test configuration
- If no tests exist, say so explicitly

### SECTION 12: BUILD & DEPLOYMENT

- Build command and output
- Environment variable list (names only, not values — grouped by public vs server)
- Middleware configuration (what it does, what routes it affects)
- Cron jobs (schedule, purpose, protection)
- Vercel/deployment config
- Bundle analysis (if next.config has analyzer)

### SECTION 13: CONFIGURATION FILES

Summarize the contents of:
- next.config.js/ts/mjs
- src/app/globals.css
- tsconfig.json (notable settings only)
- .eslintrc / eslint.config
- vercel.json
- Any other config files at root

### SECTION 14: DEPENDENCIES AUDIT

- Total dependency count (dependencies + devDependencies)
- Any deprecated packages (check for warnings)
- Any packages with known vulnerabilities (run bun audit or equivalent)
- Unused dependencies (installed but never imported — spot check the suspicious ones)
- Heavy dependencies by bundle size impact (if analyzable)

### SECTION 15: CODE QUALITY & TECHNICAL DEBT

Flag everything you find:
- TypeScript `any` usage (count and worst offenders)
- `// TODO`, `// FIXME`, `// HACK` comments (list them all with file locations)
- Console.log statements left in production code
- Inconsistent naming conventions
- Dead code (exported but never imported)
- Files that import from unexpected locations (circular dependency risk)
- Components mixing concerns (data fetching + rendering + mutations in one file)
- Missing error handling (try/catch, error boundaries)
- Hardcoded values that should be env vars or constants
- SQL injection risks or unsanitized inputs
- Missing TypeScript types (implicit any, missing return types on exports)

### SECTION 16: PERFORMANCE CONCERNS

- Large client bundles (components with 'use client' that import heavy libraries)
- Missing Suspense boundaries
- N+1 query patterns (sequential database calls that could be parallel)
- Missing indexes (queries filtering on unindexed columns)
- Unoptimized images (no next/image usage)
- Missing caching (revalidate, cache() usage)

### SECTION 17: SECURITY CONCERNS

- All places where service role key is used
- Server actions without auth checks
- API routes without auth checks
- RLS policies that might be too permissive
- Hardcoded secrets, emails, or IDs
- CORS configuration
- Input validation gaps
- Client-side mutations that should be server-side

### SECTION 18: SUMMARY & RECOMMENDATIONS

Write a prioritized list of findings:

**P0 — Fix immediately (security/data risk):**
(list items)

**P1 — Fix soon (reliability/correctness):**
(list items)

**P2 — Fix when convenient (code quality):**
(list items)

**P3 — Nice to have (optimization):**
(list items)

---

Format everything with clean markdown: headers, code blocks for schema/code, tables for inventories. Be exhaustive — I'd rather have a 2000-line report than miss something important.
```
