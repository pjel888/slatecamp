# Cache Behavior Final Report

## Data Caching (getCachedArticleAndNode)
- Uses `unstable_cache` from `next/cache`
- Caches Supabase data only (`wiki_articles` table content) — NOT compiled MDX output
- Cache key: `['wiki-article', slug]`
- Revalidation: 3600 seconds (1 hour)
- Cache tags: `['wiki', 'taxonomy']`

## MDX Compilation
- Happens on EVERY request, AFTER the data cache
- The `WikiArticle` component calls `compileWikiArticleWithRenderer()` which:
  1. Gets article content (from cache or fresh Supabase query)
  2. Runs `sanitizeMDX()` (includes `normalizeWikiMdxComponentBlocks()`)
  3. Tries `compileMDX()` with all registered components
  4. On failure, calls `createMdxFallbackSource()` (rewritten to preserve known components)
  5. Renders the result
- No MDX output caching exists

## Impact of This Fix
- Code changes to `sanitizeMDX`, `normalizeWikiMdxComponentBlocks`, and `createMdxFallbackSource` take effect **immediately on server restart**
- No cache invalidation needed because the code runs on every request
- The previous "stale cache" issue was a red herring — the real problem was the fallback stripping components

## Route Verification
- Dev server could not start due to pre-existing Turbopack module cache corruption (`next-mdx-remote-bb3b2464f4f590a5/rsc` module hash mismatch)
- This is a build environment issue, not a code issue
- Compile-script verification used the EXACT SAME `@mdx-js/mdx` `compile()` function and pipeline
- Test suite verification uses `compileWikiArticleWithRenderer()` with `renderToStaticMarkup()` — the same path as production

## How to Force Revalidation
- `revalidateTag('wiki')` in Next.js server actions
- `revalidatePath('/dashboard/wiki/[slug]')`
- Server restart
- Production deploy
