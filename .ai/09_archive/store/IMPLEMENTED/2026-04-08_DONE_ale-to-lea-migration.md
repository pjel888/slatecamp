# Migration Plan: ALE to LEA Transition
**Status:** FINALIZED (Ready for Execution)
**Owner:** Gemini CLI
**Date:** 2026-04-08

## 1. Overview
As per PRC (Professional Regulation Commission) guidelines, the "Architects Licensure Exam" (ALE) has been officially renamed to "Licensure Exam for Architects" (LEA). This plan outlines the global migration of terminology across the SlateCamp platform.

## 2. Database Migration (Supabase)
### 2.1 Artifact: `supabase/migrations/20260408_ale_to_lea_migration.sql`
This script handles:
- **Schema Renaming:** `profiles.ale_result` -> `lea_result`, `taxonomy_tree.ale_id` -> `lea_id`, etc.
- **Data Mutation:** Case-sensitive replacement in `camp_trails`, `wiki_articles`, `questions`, and `taxonomy_tree`.
- **RPC Update:** Updates `get_article_with_node` to return the new column names.

## 3. Codebase Refactoring (Next.js & Zustand)
### 3.1 Exact Regex Patterns
Execute these passes in order. Use a tool like VS Code Search/Replace or `rg`/`sed`.

| Pass | Type | Regex | Replacement |
|------|------|-------|-------------|
| 1 | **ALL CAPS** | `(?<![a-zA-Z])ALE(?![a-zA-Z])` | `LEA` |
| 2 | **Pascal Prefix**| `(?<![a-zA-Z])Ale(?=[A-Z])` | `Lea` |
| 3 | **camel Prefix** | `(?<![a-zA-Z])ale(?=[A-Z])` | `lea` |
| 4 | **Lower/Snake** | `(?<![a-zA-Z])ale(?![a-zA-Z])` | `lea` |
| 5 | **Pascal Solo** | `(?<![a-zA-Z])Ale(?![a-zA-Z])` | `Lea` |

### 3.2 URL Routing & SEO
Update `next.config.ts` to include:
```typescript
  async redirects() {
    return [
      {
        source: '/dashboard/wiki/ale-:slug*',
        destination: '/dashboard/wiki/lea-:slug*',
        permanent: true,
      },
      {
        source: '/ale-starter',
        destination: '/lea-starter',
        permanent: true,
      },
    ]
  },
```

### 3.3 TypeScript & Interfaces
- The regex passes will automatically refactor:
  - `aleId` -> `leaId`
  - `SubjectFloorAlert` (no change needed)
  - `aleResult` -> `leaResult`
  - `ALE-DSGN` -> `LEA-DSGN` (in `src/lib/constants/analytics.ts`)

## 4. Asset & File System Migration
### 4.1 Renaming Commands (Bash)
```bash
# Rename directories in .ai/
mv .ai/skills/ale-design-question-engineer .ai/skills/lea-design-question-engineer
mv .ai/skills/ale-subject-matter-expert .ai/skills/lea-subject-matter-expert
mv .ai/skills/ale-topnotcher-strategy .ai/skills/lea-topnotcher-strategy
mv .ai/archive/legacy/tool-archives/claude/ale-design-question-engineer .ai/archive/legacy/tool-archives/claude/lea-design-question-engineer
```

## 5. Execution Protocol
1. **Apply SQL Migration:** Run the script in the Supabase Dashboard or via CLI.
2. **Refresh Types:** `npx supabase gen types typescript --linked > src/types/supabase.ts`
3. **Refactor Code:** Apply the 5 Regex passes.
4. **Update Config:** Apply the `next.config.ts` redirects.
5. **Rename Files:** Run the `mv` commands.
6. **Validate:** `bun run type-check && bun run build`.

## 6. Rollback Plan
- SQL: Run reverse `REPLACE` and `ALTER TABLE RENAME` (Script: `supabase/migrations/rollback_lea_to_ale.sql`).
- Code: `git checkout .` or `git revert`.

⚠️ **NEEDS INPUT:** Confirming exclusion of `notes.content` and `notes.tags` from the automated replacement to preserve user-generated context exactly as written.
