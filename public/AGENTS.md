<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# public

## Scope
This file governs `public/` and all static assets in it.

## Current subtree reality
`public/` currently contains 9 tracked files and no tracked nested directories.

Live assets include:
- `SlateCampLogoMark.svg`
- `SlateCamp_Logo.png`
- `noise.png`
- `file.svg`, `globe.svg`, `window.svg`
- `next.svg`, `vercel.svg`

## Rules
- Everything here is public and URL-addressable.
- Never place secrets, internal-only data, or misleading “temporary” private artifacts here.
- Verify actual filenames and consuming references before documenting asset usage.

## Validation expectations
- confirm asset paths exist
- confirm any documented consuming path/import matches the live source
- no build/test requirement unless source code using the asset also changes

## Anti-laziness rule
Do not assume old asset inventories are still accurate. Check the actual filenames in `public/`.
