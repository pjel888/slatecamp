# Plan 005 — Dynamic-import Mermaid in wiki article tree

> Audit: 2026-07-20, commit `064e3a43a`. Category: performance (bundle weight). Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/components/wiki/blocks/Mermaid.tsx:4` static import; registered in `src/components/wiki/article/WikiArticle.tsx:195`.

## Why this mattered

Mermaid (~600 KB minified) was statically imported at the top of `Mermaid.tsx` (a `'use client'` component), which is registered in the `WikiArticle.tsx` components map consumed by `compileMDX` for every wiki article. Every article page (including high-traffic `/dashboard/wiki/[articleId]`) shipped the entire Mermaid runtime to the browser even when the article had zero diagrams.

## What was changed

In `src/components/wiki/article/WikiArticle.tsx`:
- Added `import dynamic from 'next/dynamic'`.
- Removed `import { Mermaid } from '../blocks/Mermaid'`.
- Replaced with `const Mermaid = dynamic(() => import('../blocks/Mermaid').then(m => ({ default: m.Mermaid })), { loading: () => <skeleton/> })`.
- **CRITICAL: did NOT pass `ssr: false`.** `WikiArticle.tsx` is a Server Component (uses `next-mdx-remote/rsc`'s `compileMDX`); Next.js forbids `ssr: false` in `next/dynamic` from Server Components. The loaded `Mermaid` block is itself `'use client'`, so it only runs in the browser regardless — the dynamic import still gives the code-split.
- The `Mermaid,` entry in the components map is unchanged (the variable name now refers to the dynamic wrapper, which is a valid React component).

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- `bun run build` — succeeds; Mermaid is split into a separate chunk (no longer in the wiki-route first-load bundle).

## Lesson learned (recorded for future executors)

The initial attempt used `ssr: false`, which the build rejected with `ssr: false is not allowed with next/dynamic in Server Components`. Caught by `bun run build` during validation. Plans 005 and 006 both document this constraint inline.
