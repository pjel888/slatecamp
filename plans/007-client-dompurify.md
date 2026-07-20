# Plan 007 — Replace `isomorphic-dompurify` with `dompurify` in client components

> Audit: 2026-07-20, commit `064e3a43a`. Category: performance + security. Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: 3 `'use client'` files imported `isomorphic-dompurify` (which bundles jsdom into the client bundle).

## Why this mattered

`isomorphic-dompurify` exists to make DOMPurify work in Node by bundling jsdom. On the client it pulled a large server-only polyfill tree (jsdom, undici, tough-cookie, parse5, whatwg-url, ~25 transitive deps) into the browser bundle of three high-traffic components: the question card (every quiz), the Mermaid wiki block, the ElaborativeInterrogation wiki block. The package's own README recommends plain `dompurify` for client use.

## What was changed

- `bun add dompurify@^3.4.1` — added as a direct dependency.
- `src/components/wiki/blocks/Mermaid.tsx`, `src/components/wiki/blocks/ElaborativeInterrogation.tsx`, `src/components/shared/question-card.tsx`: changed `import DOMPurify from 'isomorphic-dompurify'` to `import DOMPurify from 'dompurify'`. The runtime API is identical between the two packages — no call sites changed.
- `src/app/admin/knowledge/questions/new/page.tsx` (Plan 002) kept `isomorphic-dompurify` because it's a server component (the isomorphic version is correct there).
- `isomorphic-dompurify` stays in `dependencies` because of that one server-side consumer.

The durable rule (documented in Plan 007 maintenance note): **server contexts use `isomorphic-dompurify`, client contexts use `dompurify`.**

## Verification

- `grep -rn "isomorphic-dompurify" src` — only the server-component consumer remains. ✅
- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- `bun test src/` — pass.
- `bun run build` — succeeds; jsdom no longer in client chunks.
