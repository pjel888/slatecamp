# Plan 002 — Stored XSS in admin "New Question" reference pane

> Audit: 2026-07-20, commit `064e3a43a`. Category: security. Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/app/admin/knowledge/questions/new/page.tsx:104`.

## Why this mattered

`/admin/knowledge/questions/new` rendered `wiki_articles.content` as raw HTML via `dangerouslySetInnerHTML` with no sanitizer — the only wiki-content render path in the codebase without `sanitizeMDX` or `DOMPurify.sanitize`. A payload stored in `wiki_articles.content` (via admin editor or CSV importer) executed in an authenticated admin session and could call `"use server"` actions under that identity — including `assignRole`, escalating an attacker-controlled userId to `super_admin`. Privilege-escalation vector (admin-only trust boundary, not anonymous).

## What was changed

In `src/app/admin/knowledge/questions/new/page.tsx`:
- Added `import DOMPurify from 'isomorphic-dompurify'` (server component — isomorphic is correct here; client components use plain `dompurify` per Plan 007).
- Wrapped the `dangerouslySetInnerHTML` payload with `DOMPurify.sanitize(...)`.
- Added a comment documenting the sanitizer choice (admin-controlled content must not execute in admin sessions).

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.

## Maintenance note

Any future `dangerouslySetInnerHTML` in admin surfaces must sanitize first. A repo-wide `<SafeHtml>` helper is the durable fix (out of scope).
