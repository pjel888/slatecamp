# Plan 003 — Stored XSS in learner Omnibar snippet rendering

> Audit: 2026-07-20, commit `064e3a43a`. Category: security. Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/components/shared/Omnibar.tsx:232` (raw) and `:311` (regex-stripped).

## Why this mattered

The Omnibar (Ctrl-K, mounted on every authenticated page) rendered two `dangerouslySetInnerHTML` paths for `ts_headline` snippets over `wiki_articles.content`. One had no sanitizer at all; the other used a regex tag-stripper (the textbook naive-sanitizer anti-pattern that DOMPurify explicitly warns against). Same trust boundary as Plan 002 but the impact radius was every authenticated learner, not just admins.

## What was changed

In `src/components/shared/Omnibar.tsx`:
- Added `import DOMPurify from 'dompurify'` (this is a client component — plain `dompurify`, per Plan 007).
- Added a `sanitizeSnippet` helper: `DOMPurify.sanitize(snippet, { ALLOWED_TAGS: ['mark'], ALLOWED_ATTR: [] })`. Only `<mark>` highlight tags survive; everything else (scripts, images, attribute-based payloads) is stripped.
- Both `dangerouslySetInnerHTML` sites now route through `sanitizeSnippet`. The regex tag-stripper at the second site was removed.

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- Manual: Ctrl-K search-result list and preview pane still highlight the matched term with `<mark>`.

## Maintenance note

All wiki-content rendering must sanitize. Plan 002 (admin pane) and this plan close the two unsanitized sinks; the existing sanitized sites in `Mermaid.tsx`, `ElaborativeInterrogation.tsx`, `question-card.tsx` are unchanged.
