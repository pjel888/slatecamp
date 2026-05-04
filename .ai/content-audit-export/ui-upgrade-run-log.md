# UI Upgrade Run Log

Started: 2026-05-03T22:57:00Z
Processor: Hermes (DeepSeek / OpenCode Go)

## Run Parameters

- Target: 579 articles in /Users/philiplewis/slatecamp/.ai/content-audit-export/articles/
- Components available: Callout (6 variants), LawCallout, Note, Warn, Tip, Example, ExamTip, AuthorityContent, WikiExamTable, WikiMistakeCard, WikiMistakeList, KeyValues, SubjectSnapshot, Tabs/Tab, Accordion/AccordionItem, FormulaBlock, InlineQuiz, ProcessFlow, ComparisonTable, ElaborativeInterrogation, WikiPartHeader
- Pipeline: edit normalized.md → compose candidate → validate → push to Supabase (wiki_articles.content)

## Batch Progress

| Batch | Articles | Status | Pushed | Notes |
|-------|----------|--------|--------|-------|
| 1 | Inca Architecture Ashlar Masonry | upgraded | yes | Added Tip, Note, Warn, Example, Callout, ExamTip |
| 1 | Post-Modernism | upgraded | yes | Added Callout, KeyValues, Example, ExamTip, Warn, Tip |
| 1 | Colonial European Influence | upgraded | yes | Added Callout, Tip, 2x WikiMistakeCard, Example |
| 2 | Reciprocity Principles | upgraded | yes | Added Note, Tip, ExamTip, Warn |
| 3 | SPP Doc 202 Overview (6-Phase Framework) | upgraded | yes | Added 2x ExamTip, Tip, Warn |
| 3 | CCTV Systems | upgraded | yes | Added ComparisonTable, KeyValues, Note, Tip, Example |
| 3 | Owner Smoke Article | upgraded | yes | Added Callout, Tip, Warn, WikiMistakeCard |

## Key Learnings

1. Subagents must NOT replace [SLATECAMP_UI_BLOCK:...] placeholders with raw MDX. Leave placeholders intact; the compose pipeline handles replacement.
2. For NEW components, insert raw MDX directly into normalized.md (e.g., `<Tip>text</Tip>`) — no placeholder needed.
3. Subagents sometimes hallucinate component names (DefinitionList, FormulaCard, KeyTakeaway, Checklist). Must explicitly restrict to valid components.
4. After edit → compose → diff → push.
5. If stale check fails, re-export first with --overwrite true.
6. Subagent efficiency: ~80s per 3 articles when instructions are precise.

## Remaining

120 articles with 0 components remaining to process (out of 579 total).
