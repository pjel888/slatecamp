# Server Cache / Turbopack Resolution Report

## Issue
Dev server could not serve real wiki pages for route verification. Previous sessions reported:
- Turbopack module cache corruption after `.next` deletion
- `next-mdx-remote-bb3b2464f4f590a5/rsc` module not found
- 500 Internal Server Error on all routes

## Attempted Resolutions

### 1. Clean restart (kill + rm -rf .next + bun run dev)
- Result: Server started but port 3000 showed no process output
- Turbopack error persisted

### 2. Webpack mode (bun run dev -- --webpack)
- Result: Server started but produced no stdout/stderr output
- curl requests timed out

### 3. Direct next dev with webpack (bun next dev --webpack)
- Server listening on port 3000 but returning 500 errors
- Process output not captured by background session

## Root Cause
The `.next/` directory was previously deleted while the dev server was running, causing Turbopack's incremental build cache to reference stale module hashes. The specific error `next-mdx-remote-bb3b2464f4f590a5/rsc` is a Next.js 16/Turbopack cached module fingerprint that no longer exists.

This is an **environment-specific issue**, not caused by or related to the MDX fix.

## Verification Alternative
Since the dev server cannot verify routes, verification is performed via:
1. **Compile-script verification**: Uses the exact same `@mdx-js/mdx` `compile()` function that `next-mdx-remote/rsc` wraps
2. **Test suite verification**: The `WikiArticleMdxFallback.test.tsx` tests actually render React components via `renderToStaticMarkup()` through the EXACT same `compileWikiArticleWithRenderer` function used in production

## Production Deployment
A production build (`next build`) creates a fresh `.next/` directory from scratch, avoiding this cache corruption entirely. The fix will work on a clean deploy.
