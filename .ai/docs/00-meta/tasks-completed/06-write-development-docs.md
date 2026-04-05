# Task 06: Write Development Documentation

**Status:** pending  
**Created:** 2026-04-06  
**Objective:** Write all `04-development/` documents sourced from `package.json` and `CLAUDE.md`

---

## Steps

### 6.1 Write `04-development/001-getting-started.md`

**Source:** `README.md`, `CLAUDE.md`

Content:
- Prerequisites (Bun installed)
- Clone and install: `bun install`
- Environment setup (`.env.local` creation)
- Start dev server: `bun run dev`
- Dev scripts available: `dev:turbo`, `dev:webpack`
- Validation commands: `lint`, `type-check`, `test`, `build`
- First-time setup notes

### 6.2 Write `04-development/002-tech-stack.md`

**Source:** `package.json`

Content:
- Complete dependency list with versions
- Grouped by category (framework, styling, database, state, 3d, ui, icons, etc.)
- Package manager: Bun
- Key version numbers verified against `package.json`

### 6.3 Write `04-development/003-scripts-reference.md`

**Source:** `package.json` (scripts section)

Content:
- All npm/bun scripts documented
- Purpose of each script
- Usage examples
- Platform notes (Windows vs Unix differences)

### 6.4 Write `04-development/004-coding-standards.md`

**Source:** `CLAUDE.md`, `AGENTS.md`

Content:
- Arrow functions only (no `function` declarations)
- Server Components by default
- Design tokens over hardcoded values
- Supabase auth via middleware
- IRT 2PL model for mastery calculations
- No generic gamification
- Font: Inter (body), Syne (display), DM Mono (code)
- Minimum text size: 8px

### 6.5 Write `04-development/005-testing-guide.md`

**Source:** `package.json`, `src/__tests__/` (if exists)

Content:
- Test runner: Bun test
- Test file patterns
- Running tests: `bun test`
- Current test status (as of 2026-04-05: failing assertion in `src/lib/quiz/mode-presets.test.ts`)
- Coverage expectations

### 6.6 Write `04-development/006-deployment.md`

**Source:** `vercel.json`, `CLAUDE.md`

Content:
- Deploy to Vercel
- Cron jobs configuration
- Environment variables required
- Build command: `bun run build`
- Current build status (as of 2026-04-05: fails with missing `.next/required-server-files.json`)

---

## Verification

- [ ] All dependencies from `package.json` listed with exact versions
- [ ] All scripts match `package.json` exactly
- [ ] Coding standards match `CLAUDE.md` constraints
- [ ] No references to npm/yarn/pnpm (Bun only)
- [ ] Test status accurate
- [ ] Build status accurate

## Notes

- Tech stack doc is critical — many legacy docs have wrong version numbers
- Verify `package.json` sections directly, don't rely on memory
