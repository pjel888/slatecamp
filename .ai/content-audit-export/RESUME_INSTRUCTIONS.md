# Autonomous UI Upgrade — Resume Instructions

**Generated:** 2026-05-04
**State File:** `/Users/philiplewis/slatecamp/.ai/content-audit-export/AUTONOMOUS_UI_UPGRADE_STATE.json`

## How to Resume

1. Read the state file to see current phase and progress
2. Run the batch system:
   ```bash
   cd /Users/philiplewis/slatecamp/.ai/content-audit-export/scripts
   python batch_upgrade.py --resume
   ```
3. If validation fails, fix the article manually and re-run

## Pipeline

1. **Validate** — `python validate_article.py <article_dir>`
2. **Edit** — Add appropriate components to `normalized.md`
3. **Validate** — Run validator again
4. **Compose** — `bun run content-audit:compose -- --article-id <id> --overwrite`
5. **Diff** — `bun run content-audit:diff -- --article-id <id>`
6. **Push** — `bun run content-audit:push:apply -- --article-id <id>`
7. **Verify** — Re-read from Supabase

## Critical Rules

- NEVER remove `[SLATECAMP_UI_BLOCK:...]` placeholders
- NEVER use components not in `wiki-component-whitelist.json`
- ALWAYS validate before and after editing
- ALWAYS backup before pushing
- ALWAYS run dry-run before apply

## Hard Blocker Handling

If a true hard blocker occurs:
1. Stop processing
2. Write to `HARD_BLOCKER_REPORT.md`
3. Do not push risky changes

## Component Whitelist

See `/Users/philiplewis/slatecamp/.ai/content-audit-export/wiki-component-whitelist.json`

Safe always: `Note`, `Tip`, `Warn`, `Example`, `ExamTip`, `Callout`
Safe when content fits: `KeyValues`, `SubjectSnapshot`, `WikiMistakeCard`, `ComparisonTable`, `ProcessFlow`
Requires specific content: `LawCallout`, `FormulaBlock`, `WikiExamTable`, `WikiPartHeader`
Requires client JS: `Tabs`, `Accordion`, `InlineQuiz`, `ElaborativeInterrogation`, `TeachBackPrompt`
