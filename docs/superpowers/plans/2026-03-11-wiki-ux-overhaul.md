# Wiki UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the wiki into a Hub-and-Spoke architecture with progressive disclosure, ⌘K search, subject-scoped article sidebar, sticky TOC, native ad cards, and proper mobile handling.

**Architecture:** The top-level `wiki/layout.tsx` becomes a minimal shared wrapper. Route groups (`(hub)`, `(subject)`, `(article)`, `(search)`) give each wiki context its own layout. The article layout is the only one that mounts the sidebar and right rail TOC. A new `(subject)/subject/[slug]` route serves as the bridge between the hub and articles.

**Tech Stack:** Next.js 16 App Router (RSC + route groups), Supabase (Postgres RPC), shadcn/ui `Command` for ⌘K palette, Tailwind CSS 4, TypeScript strict.

**Verification:** Use `npm run type-check` after every task. No Jest or Playwright installed — verification is via browser and TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-11-wiki-ux-overhaul-design.md`

---

## File Map

### Deleted
- `src/app/dashboard/wiki/page.tsx` → replaced by `(hub)/page.tsx`
- `src/app/dashboard/wiki/[slug]/page.tsx` → replaced by `(article)/[slug]/page.tsx`
- `src/app/dashboard/wiki/[slug]/` (directory) → gone after move
- `src/components/wiki/WikiSearchBar.tsx` → replaced by `WikiCommandPalette`

### Modified
- `src/app/dashboard/wiki/layout.tsx` — slim pass-through wrapper, no sidebar
- `src/lib/actions/wiki.ts` — 5 new server actions + `findAdjacentPages` helper
- `src/lib/constants/routes.ts` — add `WIKI_SUBJECT` and `WIKI_SEARCH` helpers
- `src/types/app.ts` — add `WikiSearchPaginatedResult` type
- `src/components/wiki/WikiSidebar.tsx` — auto-expand active subject only (not all subjects)
- `DATABASE_SCHEMA.sql` — new `search_wiki_paginated` RPC

### New — Routes
- `src/app/dashboard/wiki/(hub)/page.tsx` — Subject Hub home
- `src/app/dashboard/wiki/(subject)/subject/[slug]/page.tsx` — Subject Landing
- `src/app/dashboard/wiki/(article)/layout.tsx` — 3-col layout with sidebar + right rail
- `src/app/dashboard/wiki/(article)/[slug]/page.tsx` — Article Page (enhanced)
- `src/app/dashboard/wiki/(search)/search/page.tsx` — Search Results

### New — Components
- `src/components/wiki/WikiCommandPalette.tsx` — ⌘K modal (shadcn Command)
- `src/components/wiki/WikiTableOfContents.tsx` — sticky TOC with IntersectionObserver
- `src/components/wiki/ArticlePrevNext.tsx` — prev/next in-category navigation
- `src/components/wiki/SponsoredCard.tsx` — native ad card (3 variants)
- `src/components/wiki/RecentlyUpdatedStrip.tsx` — horizontal scroll strip on hub

### New — Lib
- `src/lib/constants/ads.ts` — AdSlot type + hardcoded ad content

---

## Chunk 1: Foundation — Routes, Types, and Shared Utilities

### Task 1: Add `WIKI_SUBJECT` and `WIKI_SEARCH` to routes.ts

**Files:**
- Modify: `src/lib/constants/routes.ts`

- [ ] **Step 1: Add route helpers**

In `src/lib/constants/routes.ts`, add two entries to the `ROUTES` object after `WIKI_PAGE`:

```ts
WIKI_SUBJECT: (slug: string) => `/dashboard/wiki/subject/${slug}`,
WIKI_SEARCH: (q: string, subject?: string) =>
  `/dashboard/wiki/search?q=${encodeURIComponent(q)}${subject ? `&subject=${subject}` : ''}`,
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants/routes.ts
git commit -m "feat(wiki): add WIKI_SUBJECT and WIKI_SEARCH route helpers"
```

---

### Task 2: Add `WikiSearchPaginatedResult` type

**Files:**
- Modify: `src/types/app.ts`

- [ ] **Step 1: Add type after `WikiSearchResult`**

In `src/types/app.ts`, after the `WikiSearchResult` interface (around line 527), add:

```ts
/** Returned by searchWikiPaginated — includes total_count from the RPC window function */
export interface WikiSearchPaginatedResult extends WikiSearchResult {
  total_count: number
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/types/app.ts
git commit -m "feat(wiki): add WikiSearchPaginatedResult type for paginated search RPC"
```

---

### Task 3: Set up route group directory structure

**Files:**
- Delete: `src/app/dashboard/wiki/page.tsx`
- Delete: `src/app/dashboard/wiki/[slug]/` directory
- Create: all route group directories and stub pages

- [ ] **Step 1: Create route group directories**

```bash
mkdir -p "src/app/dashboard/wiki/(hub)"
mkdir -p "src/app/dashboard/wiki/(subject)/subject/[slug]"
mkdir -p "src/app/dashboard/wiki/(article)/[slug]"
mkdir -p "src/app/dashboard/wiki/(search)/search"
```

- [ ] **Step 2: Copy article page to new location**

Copy the full contents of `src/app/dashboard/wiki/[slug]/page.tsx` into `src/app/dashboard/wiki/(article)/[slug]/page.tsx` — this preserves the existing article functionality while we enhance it in Task 13.

- [ ] **Step 3: Create stub pages for new routes**

`src/app/dashboard/wiki/(hub)/page.tsx`:
```tsx
export default function WikiHubPage() {
  return <div className="p-8">Hub — coming soon</div>
}
```

`src/app/dashboard/wiki/(subject)/subject/[slug]/page.tsx`:
```tsx
export default function SubjectLandingPage() {
  return <div className="p-8">Subject Landing — coming soon</div>
}
```

`src/app/dashboard/wiki/(search)/search/page.tsx`:
```tsx
export default function WikiSearchPage() {
  return <div className="p-8">Search — coming soon</div>
}
```

- [ ] **Step 4: Create stub article layout**

`src/app/dashboard/wiki/(article)/layout.tsx`:
```tsx
export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[calc(100vh-48px)]">{children}</div>
}
```

- [ ] **Step 5: Slim down the top-level wiki layout**

Replace all contents of `src/app/dashboard/wiki/layout.tsx` with:
```tsx
export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 6: Delete old files**

```bash
rm "src/app/dashboard/wiki/page.tsx"
rm -rf "src/app/dashboard/wiki/[slug]"
```

- [ ] **Step 7: Verify dev server starts without errors**

```bash
npm run dev
```

Navigate to:
- `/dashboard/wiki` → "Hub — coming soon"
- `/dashboard/wiki/some-article-slug` → existing article renders from `(article)/[slug]/page.tsx`
- `/dashboard/wiki/subject/any-slug` → "Subject Landing — coming soon"

- [ ] **Step 8: Commit**

```bash
git add -A src/app/dashboard/wiki/
git commit -m "feat(wiki): set up route groups for hub-and-spoke architecture"
```

---

## Chunk 2: Database & Server Actions

### Task 4: Add `search_wiki_paginated` Postgres RPC

**Files:**
- Modify: `DATABASE_SCHEMA.sql`

- [ ] **Step 1: Find the existing `search_wiki` function in `DATABASE_SCHEMA.sql`**

Locate the `CREATE OR REPLACE FUNCTION search_wiki` block. Add the following **immediately after** it:

```sql
-- Paginated, subject-filtered full-text wiki search
CREATE OR REPLACE FUNCTION search_wiki_paginated(
  search_term TEXT,
  subject_slug TEXT DEFAULT NULL,
  page_offset INT DEFAULT 0,
  page_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  headline TEXT,
  tags TEXT[],
  category_id UUID,
  is_deprecated BOOLEAN,
  is_free BOOLEAN,
  rank REAL,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tsq TSQUERY;
BEGIN
  tsq := websearch_to_tsquery('english', search_term);

  RETURN QUERY
  WITH matched AS (
    SELECT
      wp.id,
      wp.title,
      wp.slug,
      ts_headline(
        'english',
        wp.markdown_content,
        tsq,
        'MaxWords=20,MinWords=10,StartSel=<mark>,StopSel=</mark>'
      ) AS headline,
      wp.tags,
      wp.category_id,
      wp.is_deprecated,
      wp.is_free,
      ts_rank(wp.search_vector, tsq) AS rank
    FROM wiki_pages wp
    JOIN wiki_categories wc ON wc.id = wp.category_id
    LEFT JOIN wiki_categories root_cat ON (
      CASE WHEN wc.parent_id IS NULL THEN wc.id ELSE wc.parent_id END = root_cat.id
    )
    WHERE
      wp.search_vector @@ tsq
      AND (subject_slug IS NULL OR root_cat.slug = subject_slug)
    ORDER BY rank DESC
  )
  SELECT
    m.*,
    COUNT(*) OVER () AS total_count
  FROM matched m
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;
```

- [ ] **Step 2: Run this SQL in Supabase**

Open Supabase Dashboard → SQL Editor and run the new function. Confirm it executes without error.

- [ ] **Step 3: Commit schema**

```bash
git add DATABASE_SCHEMA.sql
git commit -m "feat(wiki): add search_wiki_paginated RPC with subject filter and pagination"
```

---

### Task 5: Add new server actions

**Files:**
- Modify: `src/lib/actions/wiki.ts`

- [ ] **Step 1: Append all new actions to `src/lib/actions/wiki.ts`**

Add the following to the end of the file:

```ts
// ---------------------------------------------------------------------------
// Exported pure helper (no Supabase dependency — safe to test in isolation)
// ---------------------------------------------------------------------------

type PageStub = Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'> & { order_index: number }

export function findAdjacentPages(
  pages: PageStub[],
  currentId: string
): { prev: PageStub | null; next: PageStub | null } {
  const sorted = [...pages].sort((a, b) => a.order_index - b.order_index)
  const idx = sorted.findIndex((p) => p.id === currentId)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  }
}

// ---------------------------------------------------------------------------
// New server actions
// ---------------------------------------------------------------------------

/**
 * Fetch a root-level wiki category (subject) by slug with all child categories
 * and pages grouped by category ID.
 * Returns null if the slug resolves to a sub-category (parent_id IS NOT NULL).
 */
export async function getWikiSubjectBySlug(slug: string): Promise<{
  subject: WikiCategory
  pagesByCategory: Record<string, PageStub[]>
  categoryIds: string[]
} | null> {
  const supabase = await createClient()

  const { data: subjectData, error: subjectError } = await supabase
    .from('wiki_categories')
    .select('*')
    .eq('slug', slug)
    .is('parent_id', null)
    .single()

  if (subjectError || !subjectData) return null

  const subject = subjectData as WikiCategory

  const { data: children } = await supabase
    .from('wiki_categories')
    .select('*')
    .eq('parent_id', subject.id)
    .order('order_index', { ascending: true })

  subject.children = (children ?? []) as WikiCategory[]

  const categoryIds = [subject.id, ...subject.children.map((c) => c.id)]

  const { data: pages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id, is_deprecated, order_index')
    .in('category_id', categoryIds)
    .order('order_index', { ascending: true })

  const pagesByCategory: Record<string, PageStub[]> = {}
  for (const page of (pages ?? []) as (PageStub & { category_id: string })[]) {
    if (!pagesByCategory[page.category_id]) pagesByCategory[page.category_id] = []
    pagesByCategory[page.category_id].push(page)
  }

  return { subject, pagesByCategory, categoryIds }
}

/**
 * Paginated flat list of all pages under a subject (all child categories included).
 * Sorted alphabetically by title.
 */
export async function getWikiPagesBySubject(
  subjectSlug: string,
  page = 1,
  perPage = 15
): Promise<{ pages: (WikiPage & { category_name: string })[]; totalCount: number }> {
  const supabase = await createClient()

  // Get subject category IDs
  const result = await getWikiSubjectBySlug(subjectSlug)
  if (!result) return { pages: [], totalCount: 0 }

  const { categoryIds } = result
  const offset = (page - 1) * perPage

  const { data, error, count } = await supabase
    .from('wiki_pages')
    .select('*, wiki_categories(name)', { count: 'exact' })
    .in('category_id', categoryIds)
    .order('title', { ascending: true })
    .range(offset, offset + perPage - 1)

  if (error || !data) return { pages: [], totalCount: 0 }

  return {
    pages: data.map((p: WikiPage & { wiki_categories: { name: string } | null }) => ({
      ...p,
      category_name: p.wiki_categories?.name ?? '',
    })) as (WikiPage & { category_name: string })[],
    totalCount: count ?? 0,
  }
}

/**
 * Returns the previous and next wiki pages within the same category,
 * ordered by order_index.
 */
export async function getAdjacentWikiPages(
  pageId: string,
  categoryId: string
): Promise<{ prev: Pick<WikiPage, 'id' | 'title' | 'slug'> | null; next: Pick<WikiPage, 'id' | 'title' | 'slug'> | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, order_index, is_deprecated')
    .eq('category_id', categoryId)
    .order('order_index', { ascending: true })

  if (error || !data) return { prev: null, next: null }

  return findAdjacentPages(data as PageStub[], pageId)
}

/**
 * Most recently updated wiki pages, excluding deprecated ones.
 */
export async function getRecentlyUpdatedPages(
  limit = 10
): Promise<Pick<WikiPage, 'id' | 'title' | 'slug' | 'updated_at'>[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, updated_at')
    .eq('is_deprecated', false)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as Pick<WikiPage, 'id' | 'title' | 'slug' | 'updated_at'>[]
}

/**
 * Paginated, subject-filtered full-text search using the search_wiki_paginated RPC.
 */
export async function searchWikiPaginated(
  searchTerm: string,
  subjectSlug?: string,
  page = 1,
  perPage = 10
): Promise<{ results: WikiSearchPaginatedResult[]; totalCount: number }> {
  const supabase = await createClient()
  const offset = (page - 1) * perPage

  const { data, error } = await supabase.rpc('search_wiki_paginated', {
    search_term: searchTerm,
    subject_slug: subjectSlug ?? null,
    page_offset: offset,
    page_limit: perPage,
  })

  if (error || !data || data.length === 0) return { results: [], totalCount: 0 }

  const totalCount = Number((data[0] as WikiSearchPaginatedResult).total_count)
  return { results: data as WikiSearchPaginatedResult[], totalCount }
}
```

- [ ] **Step 2: Update the import at the top of `src/lib/actions/wiki.ts`**

Add `WikiSearchPaginatedResult` to the import from `@/types/app`:

```ts
import type { WikiCategory, WikiPage, WikiSearchResult, WikiSearchPaginatedResult } from "@/types/app";
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Fix any errors before continuing.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/wiki.ts
git commit -m "feat(wiki): add server actions for subject, pagination, adjacent pages, and paginated search"
```

---

## Chunk 3: Ad System Foundation

### Task 6: Create AdSlot constants

**Files:**
- Create: `src/lib/constants/ads.ts`

- [ ] **Step 1: Create the file**

`src/lib/constants/ads.ts`:
```ts
export interface AdSlot {
  id: string
  label: string       // Always "Sponsored" — shown in UI
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
  imageUrl?: string
}

/**
 * Hardcoded initial ad content.
 * Replace with a CMS or ad server integration when ready.
 */
export const AD_SLOTS: AdSlot[] = [
  {
    id: 'kaplan-arch',
    label: 'Sponsored',
    headline: 'Kaplan Architecture Exam Prep',
    body: 'Comprehensive ARE and ALE study materials and practice exams.',
    ctaText: 'Learn More',
    ctaUrl: 'https://www.kaptest.com',
  },
]

/**
 * Picks a deterministic ad from the pool to avoid hydration mismatches.
 * Uses a string seed (e.g. page slug) to select consistently server-side.
 */
export function pickAd(seed: string): AdSlot {
  const idx = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AD_SLOTS.length
  return AD_SLOTS[idx]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/constants/ads.ts
git commit -m "feat(wiki): add AdSlot constants and pickAd helper"
```

---

### Task 7: Create SponsoredCard component

**Files:**
- Create: `src/components/wiki/SponsoredCard.tsx`

- [ ] **Step 1: Create the component**

`src/components/wiki/SponsoredCard.tsx`:
```tsx
import Link from 'next/link'
import type { AdSlot } from '@/lib/constants/ads'

interface SponsoredCardProps {
  ad: AdSlot
  /**
   * subject — same footprint as a subject card in the hub grid
   * category — same footprint as a category card in the subject landing grid
   * rail — narrow vertical card for the article right rail
   */
  variant: 'subject' | 'category' | 'rail'
}

export function SponsoredCard({ ad, variant }: SponsoredCardProps) {
  const isRail = variant === 'rail'

  return (
    <div
      className={`rounded-lg border border-border/40 bg-secondary/20 flex flex-col ${
        isRail ? 'p-3' : 'p-4'
      }`}
    >
      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide mb-2">
        {ad.label}
      </span>

      <p className={`font-medium text-foreground leading-snug mb-1 ${isRail ? 'text-xs' : 'text-sm'}`}>
        {ad.headline}
      </p>

      <p className={`text-muted-foreground flex-1 mb-3 ${isRail ? 'text-[11px]' : 'text-xs'}`}>
        {ad.body}
      </p>

      <Link
        href={ad.ctaUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-flex items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${
          isRail ? 'text-[11px] px-2 py-1' : 'text-xs px-3 py-1.5'
        }`}
      >
        {ad.ctaText}
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/wiki/SponsoredCard.tsx
git commit -m "feat(wiki): add SponsoredCard component with subject/category/rail variants"
```

---

## Chunk 4: Search System (built before hub, which imports it)

### Task 8: Install shadcn Command component and build WikiCommandPalette

**Files:**
- Create: `src/components/wiki/WikiCommandPalette.tsx`

- [ ] **Step 1: Install shadcn Command if not present**

```bash
npx shadcn@latest add command
```

If it's already installed, this is a no-op.

- [ ] **Step 2: Create WikiCommandPalette**

`src/components/wiki/WikiCommandPalette.tsx`:
```tsx
'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchWiki } from '@/lib/actions/wiki'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiSearchResult } from '@/types/app'

export function WikiCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WikiSearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Debounced live search — 200ms delay, min 2 characters
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchWiki(query, 6)
        setResults(data)
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false)
      setQuery('')
      router.push(ROUTES.WIKI_PAGE(slug))
    },
    [router]
  )

  const handleViewAll = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(ROUTES.WIKI_SEARCH(trimmed))
  }, [query, router])

  return (
    <>
      {/* Search bar trigger — visible on all wiki pages */}
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-border/40 bg-secondary/30 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="flex-1 text-left">Search wiki...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search wiki..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length >= 2 && !isPending && results.length === 0 && (
            <CommandEmpty>No results for &ldquo;{query}&rdquo;</CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Pages">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.slug}
                  onSelect={() => handleSelect(result.slug)}
                >
                  <div className="flex flex-col gap-0.5 py-0.5 w-full">
                    <span className="text-sm font-medium text-foreground">{result.title}</span>
                    <span
                      className="text-xs text-muted-foreground line-clamp-1 [&_mark]:bg-color-signal-amber/20 [&_mark]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: result.headline }}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length >= 2 && (
            <CommandGroup>
              <CommandItem onSelect={handleViewAll} value="__view_all__">
                <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-muted-foreground">
                  View all results for &ldquo;{query}&rdquo;
                </span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/wiki/WikiCommandPalette.tsx
git commit -m "feat(wiki): add WikiCommandPalette with ⌘K shortcut and live search"
```

---

### Task 9: Full Search Results Page

**Files:**
- Modify: `src/app/dashboard/wiki/(search)/search/page.tsx`

- [ ] **Step 1: Replace stub with full page**

`src/app/dashboard/wiki/(search)/search/page.tsx`:
```tsx
import Link from 'next/link'
import DOMPurify from 'isomorphic-dompurify'
import { ArrowLeft, Search } from 'lucide-react'
import { searchWikiPaginated, getWikiCategoryTree } from '@/lib/actions/wiki'
import { WikiCommandPalette } from '@/components/wiki/WikiCommandPalette'
import { ROUTES } from '@/lib/constants/routes'

interface Props {
  searchParams: Promise<{ q?: string; subject?: string; page?: string }>
}

export default async function WikiSearchPage({ searchParams }: Props) {
  const { q, subject, page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))
  const query = q?.trim() ?? ''

  const [{ results, totalCount }, tree] = await Promise.all([
    query
      ? searchWikiPaginated(query, subject, currentPage, 10)
      : Promise.resolve({ results: [], totalCount: 0 }),
    getWikiCategoryTree(),
  ])

  const totalPages = Math.ceil(totalCount / 10)

  function buildUrl(overrides: { q?: string; subject?: string | null; page?: string }) {
    const params = new URLSearchParams()
    const nextQ = overrides.q ?? query
    if (nextQ) params.set('q', nextQ)
    const nextSubject = 'subject' in overrides ? overrides.subject : subject
    if (nextSubject) params.set('subject', nextSubject)
    if (overrides.page) params.set('page', overrides.page)
    return `/dashboard/wiki/search?${params.toString()}`
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={ROUTES.WIKI}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Back to Wiki
        </Link>
        <div className="mb-4">
          <WikiCommandPalette />
        </div>
        {query && (
          <p className="text-sm text-muted-foreground">
            {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Subject filter chips */}
      {query && tree.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={buildUrl({ subject: null, page: '1' })}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !subject
                ? 'bg-foreground text-background'
                : 'border border-border/40 text-muted-foreground hover:bg-secondary'
            }`}
          >
            All
          </Link>
          {tree.map((s) => (
            <Link
              key={s.id}
              href={buildUrl({ subject: s.slug, page: '1' })}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                subject === s.slug
                  ? 'bg-foreground text-background'
                  : 'border border-border/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <div className="rounded-lg border border-border/40 p-12 text-center">
          <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground mb-4">
            No pages found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground">Try browsing a subject instead:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {tree.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href={ROUTES.WIKI_SUBJECT(s.slug)}
                className="rounded-full border border-border/40 px-3 py-1 text-xs text-muted-foreground hover:bg-secondary transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="space-y-2 mb-6">
            {results.map((result) => (
              <Link
                key={result.id}
                href={ROUTES.WIKI_PAGE(result.slug)}
                className="block rounded-lg border border-border/40 p-4 transition-colors hover:bg-secondary/40"
              >
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {result.title}
                  {result.is_deprecated && (
                    <span className="ml-2 text-[11px] font-normal text-color-signal-amber">
                      (Deprecated)
                    </span>
                  )}
                </h3>
                <p
                  className="text-xs text-muted-foreground line-clamp-2 mb-2 [&_mark]:bg-color-signal-amber/20 [&_mark]:text-foreground [&_mark]:rounded-sm [&_mark]:px-0.5"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(result.headline, {
                      ALLOWED_TAGS: ['mark'],
                      ALLOWED_ATTR: [],
                    }),
                  }}
                />
                {result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {currentPage > 1 ? (
                <Link
                  href={buildUrl({ page: String(currentPage - 1) })}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="text-muted-foreground/40">← Prev</span>
              )}
              <span className="text-muted-foreground text-xs">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl({ page: String(currentPage + 1) })}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-muted-foreground/40">Next →</span>
              )}
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Enter a search term above to find wiki pages.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Delete WikiSearchBar**

```bash
grep -r "WikiSearchBar" src/ --include="*.tsx" --include="*.ts" -l
```

If any files import it (other than the old home page already deleted), update them. Then delete:

```bash
rm src/components/wiki/WikiSearchBar.tsx
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Test search in browser**

Navigate to `/dashboard/wiki/search?q=building`. Confirm: results list, subject filter chips, pagination controls.

- [ ] **Step 5: Commit**

```bash
git add -A src/app/dashboard/wiki/\(search\)/ src/components/wiki/WikiSearchBar.tsx
git commit -m "feat(wiki): add search results page and delete WikiSearchBar"
```

---

## Chunk 5: Subject Hub

### Task 10: Build the Subject Hub home page

**Files:**
- Create: `src/components/wiki/RecentlyUpdatedStrip.tsx`
- Modify: `src/app/dashboard/wiki/(hub)/page.tsx`

- [ ] **Step 1: Create RecentlyUpdatedStrip**

`src/components/wiki/RecentlyUpdatedStrip.tsx`:
```tsx
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiPage } from '@/types/app'

interface RecentlyUpdatedStripProps {
  pages: Pick<WikiPage, 'id' | 'title' | 'slug' | 'updated_at'>[]
}

export function RecentlyUpdatedStrip({ pages }: RecentlyUpdatedStripProps) {
  if (pages.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recently Updated
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={ROUTES.WIKI_PAGE(page.slug)}
            className="flex-none rounded-full border border-border/40 px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {page.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build the Subject Hub page**

`src/app/dashboard/wiki/(hub)/page.tsx`:
```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWikiCategoryTree, getRecentlyUpdatedPages } from '@/lib/actions/wiki'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import { RecentlyUpdatedStrip } from '@/components/wiki/RecentlyUpdatedStrip'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { WikiCommandPalette } from '@/components/wiki/WikiCommandPalette'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiCategory } from '@/types/app'

export default async function WikiHubPage() {
  const supabase = await createClient()
  const tree = await getWikiCategoryTree()
  const recentPages = await getRecentlyUpdatedPages(10)

  // Tier check for ad gating
  const { data: { user } } = await supabase.auth.getUser()
  let userTier = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()
    userTier = profile?.tier ?? 'free'
  }
  const showAd = userTier === 'free' && AD_SLOTS.length > 0

  // Page counts per subject card
  const { data: allPages } = await supabase.from('wiki_pages').select('category_id')
  const pageCountByCategory: Record<string, number> = {}
  for (const row of (allPages ?? []) as { category_id: string }[]) {
    pageCountByCategory[row.category_id] = (pageCountByCategory[row.category_id] ?? 0) + 1
  }
  function totalPagesInSubject(subject: WikiCategory): number {
    let total = pageCountByCategory[subject.id] ?? 0
    for (const child of subject.children ?? []) {
      total += pageCountByCategory[child.id] ?? 0
    }
    return total
  }

  const ad = showAd ? pickAd('hub') : null

  // Build grid with ad at position index 2 (third slot)
  type GridItem = { type: 'subject'; subject: WikiCategory } | { type: 'ad' }
  const gridItems: GridItem[] = []
  tree.forEach((subject, i) => {
    if (i === 2 && ad) gridItems.push({ type: 'ad' })
    gridItems.push({ type: 'subject', subject })
  })

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 lg:py-8">
      {/* Header + Search */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1">
          Resources Wiki
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Browse reference notes by architectural subject.
        </p>
        <WikiCommandPalette />
      </div>

      {/* Subject Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gridItems.map((item, i) => {
          if (item.type === 'ad') {
            return <SponsoredCard key="ad" ad={ad!} variant="subject" />
          }
          const { subject } = item
          const Icon = WIKI_SUBJECT_ICONS[subject.slug] ?? DEFAULT_WIKI_ICON
          const total = totalPagesInSubject(subject)

          return (
            <Link
              key={subject.id}
              href={ROUTES.WIKI_SUBJECT(subject.slug)}
              className="group rounded-lg border border-border/40 p-4 transition-colors hover:border-border hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground leading-snug">
                    {subject.name}
                  </h3>
                  {subject.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  {subject.children && subject.children.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {subject.children.slice(0, 4).map((child) => (
                        <span
                          key={child.id}
                          className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5"
                        >
                          {child.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {total > 0 && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {total} {total === 1 ? 'page' : 'pages'}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <RecentlyUpdatedStrip pages={recentPages} />
    </div>
  )
}
```

- [ ] **Step 3: Run dev and verify**

Navigate to `/dashboard/wiki`. Confirm: clickable subject cards, ⌘K search bar, recently updated strip.

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/wiki/\(hub\)/ src/components/wiki/RecentlyUpdatedStrip.tsx
git commit -m "feat(wiki): build Subject Hub with clickable subject cards and recently updated strip"
```

---

## Chunk 6: Subject Landing Page

### Task 11: Build the Subject Landing Page

**Files:**
- Modify: `src/app/dashboard/wiki/(subject)/subject/[slug]/page.tsx`

- [ ] **Step 1: Replace stub with full page**

`src/app/dashboard/wiki/(subject)/subject/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWikiSubjectBySlug, getWikiPagesBySubject } from '@/lib/actions/wiki'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from '@/components/wiki/wiki-icons'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { WikiCommandPalette } from '@/components/wiki/WikiCommandPalette'
import { ROUTES } from '@/lib/constants/routes'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import type { WikiCategory } from '@/types/app'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function SubjectLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  const result = await getWikiSubjectBySlug(slug)
  if (!result) notFound()

  const { subject, pagesByCategory } = result
  const { pages: allPages, totalCount } = await getWikiPagesBySubject(slug, currentPage, 15)
  const totalPages = Math.ceil(totalCount / 15)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userTier = 'free'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
    userTier = profile?.tier ?? 'free'
  }
  const showAd = userTier === 'free' && AD_SLOTS.length > 0
  const ad = showAd ? pickAd(slug) : null

  const Icon = WIKI_SUBJECT_ICONS[subject.slug] ?? DEFAULT_WIKI_ICON
  const categories: WikiCategory[] = subject.children ?? []

  // Build category grid with ad at last position
  type GridItem = { type: 'category'; category: WikiCategory } | { type: 'ad' }
  const gridItems: GridItem[] = categories.map((cat) => ({ type: 'category', category: cat }))
  if (ad) gridItems.push({ type: 'ad' })

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 lg:py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link
          href={ROUTES.WIKI}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Wiki
        </Link>
        <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
        <span className="text-foreground">{subject.name}</span>
      </nav>

      {/* Subject Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {subject.name}
          </h1>
          {subject.description && (
            <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {totalCount} pages · {categories.length} categories
          </p>
        </div>
      </div>

      {/* Subject-scoped search */}
      <div className="mb-8">
        <WikiCommandPalette />
      </div>

      {/* Category Cards Grid */}
      {gridItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Categories
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {gridItems.map((item, i) => {
              if (item.type === 'ad') {
                return <SponsoredCard key="ad" ad={ad!} variant="category" />
              }
              const { category } = item
              const catPages = pagesByCategory[category.id] ?? []
              const previewPages = catPages.slice(0, 3)
              const remaining = catPages.length - previewPages.length

              return (
                <div key={category.id} className="rounded-lg border border-border/40 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {catPages.length} {catPages.length === 1 ? 'page' : 'pages'}
                  </p>
                  <div className="space-y-1.5">
                    {previewPages.map((page) => (
                      <Link
                        key={page.id}
                        href={ROUTES.WIKI_PAGE(page.slug)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <FileText className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{page.title}</span>
                      </Link>
                    ))}
                    {remaining > 0 && (
                      <p className="text-xs text-muted-foreground">+ {remaining} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Paginated Page List */}
      {allPages.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            All Pages
          </h2>
          <div className="space-y-1 mb-6">
            {allPages.map((page) => (
              <Link
                key={page.id}
                href={ROUTES.WIKI_PAGE(page.slug)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary/40 min-h-[44px]"
              >
                <span className="flex-1 text-foreground truncate">{page.title}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">{page.category_name}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(page.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {currentPage > 1 ? (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 px-3"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="text-muted-foreground/40 py-2 px-3">← Prev</span>
              )}
              <span className="text-muted-foreground text-xs">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 px-3"
                >
                  Next →
                </Link>
              ) : (
                <span className="text-muted-foreground/40 py-2 px-3">Next →</span>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run dev and verify**

Navigate to `/dashboard/wiki/subject/[any-subject-slug]`. Confirm: breadcrumb, subject header, search bar, category cards (with ad at end for free users), paginated page list.

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/wiki/\(subject\)/
git commit -m "feat(wiki): build Subject Landing Page with category grid and paginated page list"
```

---

## Chunk 7: Article Page Enhancements

### Task 12: WikiTableOfContents component

**Files:**
- Create: `src/components/wiki/WikiTableOfContents.tsx`

- [ ] **Step 1: Create the component**

`src/components/wiki/WikiTableOfContents.tsx`:
```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Exported pure helper — extracts h2 and h3 headings from markdown source text.
 * Headings are identified by leading ## or ### syntax (not inside code blocks).
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split('\n')
  const headings: TocHeading[] = []

  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/)
    const h3 = line.match(/^### (.+)$/)
    if (h2) {
      const text = h2[1].trim()
      headings.push({ id: slugify(text), text, level: 2 })
    } else if (h3) {
      const text = h3[1].trim()
      headings.push({ id: slugify(text), text, level: 3 })
    }
  }

  return headings
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

interface WikiTableOfContentsProps {
  headings: TocHeading[]
}

export function WikiTableOfContents({ headings }: WikiTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0% -60% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs font-medium text-foreground mb-3">On this page</p>
      <ul className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: level === 3 ? '12px' : '0' }}>
            <a
              href={`#${id}`}
              className={`block text-xs py-0.5 transition-colors leading-snug ${
                activeId === id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/wiki/WikiTableOfContents.tsx
git commit -m "feat(wiki): add WikiTableOfContents with IntersectionObserver active-section tracking"
```

---

### Task 13: ArticlePrevNext component

**Files:**
- Create: `src/components/wiki/ArticlePrevNext.tsx`

- [ ] **Step 1: Create the component**

`src/components/wiki/ArticlePrevNext.tsx`:
```tsx
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiPage } from '@/types/app'

interface ArticlePrevNextProps {
  prev: Pick<WikiPage, 'title' | 'slug'> | null
  next: Pick<WikiPage, 'title' | 'slug'> | null
}

export function ArticlePrevNext({ prev, next }: ArticlePrevNextProps) {
  if (!prev && !next) return null

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40 gap-4">
      {prev ? (
        <Link
          href={ROUTES.WIKI_PAGE(prev.slug)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={ROUTES.WIKI_PAGE(next.slug)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right max-w-[45%]"
        >
          <span className="truncate">{next.title}</span>
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/wiki/ArticlePrevNext.tsx
git commit -m "feat(wiki): add ArticlePrevNext in-category navigation component"
```

---

### Task 14: Update WikiSidebar to auto-expand only active subject

**Files:**
- Modify: `src/components/wiki/WikiSidebar.tsx`

The sidebar currently defaults `expanded = true` for ALL root-level categories (`depth === 0`). This means all 8 subjects are always expanded — showing all their pages at once. We change this so only the subject containing the active page auto-expands.

- [ ] **Step 1: Update CategoryNode to accept an `activeRootId` prop**

Replace the full contents of `src/components/wiki/WikiSidebar.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, FileText, FolderOpen, AlertTriangle } from 'lucide-react'
import { WIKI_SUBJECT_ICONS, DEFAULT_WIKI_ICON } from './wiki-icons'
import type { WikiCategory, WikiPage } from '@/types/app'

interface WikiSidebarProps {
  tree: WikiCategory[]
  pagesByCategory: Record<string, Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'>[]>
}

function CategoryNode({
  category,
  pagesByCategory,
  pathname,
  depth = 0,
  activeRootId,
}: {
  category: WikiCategory
  pagesByCategory: WikiSidebarProps['pagesByCategory']
  pathname: string
  depth?: number
  activeRootId?: string
}) {
  // Auto-expand only the subject that contains the active page; collapse all others
  const defaultExpanded = depth === 0 ? category.id === activeRootId : false
  const [expanded, setExpanded] = useState(defaultExpanded)
  const pages = pagesByCategory[category.id] ?? []
  const hasChildren = (category.children?.length ?? 0) > 0 || pages.length > 0
  const isRoot = depth === 0

  const SubjectIcon = isRoot
    ? (WIKI_SUBJECT_ICONS[category.slug] ?? DEFAULT_WIKI_ICON)
    : FolderOpen

  const totalPages = isRoot
    ? pages.length +
      (category.children ?? []).reduce(
        (sum, child) => sum + (pagesByCategory[child.id]?.length ?? 0),
        0
      )
    : 0

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-secondary/60 ${
          isRoot ? 'font-medium text-foreground' : 'text-muted-foreground'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            strokeWidth={1.5}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <SubjectIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="truncate flex-1">{category.name}</span>
        {isRoot && totalPages > 0 && (
          <span className="text-[10px] text-muted-foreground tabular-nums">{totalPages}</span>
        )}
      </button>

      {expanded && (
        <div>
          {category.children?.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              pagesByCategory={pagesByCategory}
              pathname={pathname}
              depth={depth + 1}
              activeRootId={activeRootId}
            />
          ))}
          {pages.map((page) => {
            const href = `/dashboard/wiki/${page.slug}`
            const isActive = pathname === href
            return (
              <Link
                key={page.id}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                } ${page.is_deprecated ? 'opacity-60' : ''}`}
                style={{ paddingLeft: `${20 + (depth + 1) * 12}px` }}
              >
                {page.is_deprecated ? (
                  <AlertTriangle
                    className="h-3.5 w-3.5 shrink-0 text-color-signal-amber"
                    strokeWidth={1.5}
                  />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                )}
                <span className="truncate">{page.title}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function WikiSidebar({ tree, pagesByCategory }: WikiSidebarProps) {
  const pathname = usePathname()

  // Determine which root subject contains the active page
  const activeRootId = tree.find((root) => {
    const rootPageSlugs = (pagesByCategory[root.id] ?? []).map((p) => `/dashboard/wiki/${p.slug}`)
    if (rootPageSlugs.includes(pathname)) return true
    return (root.children ?? []).some((child) =>
      (pagesByCategory[child.id] ?? []).some((p) => `/dashboard/wiki/${p.slug}` === pathname)
    )
  })?.id

  return (
    <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border/40 overflow-y-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Subjects</h2>
      </div>
      <nav className="p-2 space-y-0.5">
        {tree.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            pagesByCategory={pagesByCategory}
            pathname={pathname}
            activeRootId={activeRootId}
          />
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Run dev and navigate to an article**

The sidebar should show all subjects collapsed except the one containing the current article, which auto-expands.

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/wiki/WikiSidebar.tsx
git commit -m "feat(wiki): sidebar auto-expands only the active subject, others start collapsed"
```

---

### Task 15: Build the article layout and enhance the article page

**Files:**
- Modify: `src/app/dashboard/wiki/(article)/layout.tsx`
- Modify: `src/app/dashboard/wiki/(article)/[slug]/page.tsx`

- [ ] **Step 1: Build the full article layout**

Replace stub in `src/app/dashboard/wiki/(article)/layout.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { isAdminByEmail } from '@/lib/admin/is-admin'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { WikiDevPanel } from '@/components/wiki/WikiDevPanel'
import { getWikiCategoryTree } from '@/lib/actions/wiki'
import type { WikiPage } from '@/types/app'

export default async function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const tree = await getWikiCategoryTree()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDevMode = user ? isAdminByEmail(user.email ?? undefined) : false

  const { data: allPages } = await supabase
    .from('wiki_pages')
    .select('id, title, slug, category_id, is_deprecated, order_index')
    .order('order_index', { ascending: true })

  const allPagesList = (allPages ?? []) as {
    id: string
    title: string
    slug: string
    category_id: string
    is_deprecated: boolean
    order_index: number
  }[]

  const pagesByCategory: Record<
    string,
    Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'>[]
  > = {}
  for (const page of allPagesList) {
    if (!pagesByCategory[page.category_id]) pagesByCategory[page.category_id] = []
    pagesByCategory[page.category_id].push({
      id: page.id,
      title: page.title,
      slug: page.slug,
      is_deprecated: page.is_deprecated,
    })
  }

  return (
    <div className="flex -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 min-h-[calc(100vh-48px)]">
      <WikiSidebar tree={tree} pagesByCategory={pagesByCategory} />
      <div className="flex-1 min-w-0 p-4 lg:p-8">{children}</div>
      <WikiDevPanel tree={tree} allPagesStubs={allPagesList} isDevMode={isDevMode} />
    </div>
  )
}
```

- [ ] **Step 2: Enhance the article page**

Replace full contents of `src/app/dashboard/wiki/(article)/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft, Calendar, Tag, AlertTriangle, Link2, ArrowUpRight, ChevronRight,
} from 'lucide-react'
import {
  getWikiPageBySlug,
  getWikiBacklinks,
  getWikiForwardLinks,
  getWikiCategoryBreadcrumb,
  getAdjacentWikiPages,
} from '@/lib/actions/wiki'
import { Badge } from '@/components/ui/badge'
import { WikiTableOfContents, extractHeadings } from '@/components/wiki/WikiTableOfContents'
import { ArticlePrevNext } from '@/components/wiki/ArticlePrevNext'
import { SponsoredCard } from '@/components/wiki/SponsoredCard'
import { createClient } from '@/lib/supabase/server'
import { pickAd, AD_SLOTS } from '@/lib/constants/ads'
import { ROUTES } from '@/lib/constants/routes'

interface WikiPageProps {
  params: Promise<{ slug: string }>
}

export default async function WikiPageRoute({ params }: WikiPageProps) {
  const { slug } = await params
  const page = await getWikiPageBySlug(slug)
  if (!page) notFound()

  const [backlinks, forwardLinks, breadcrumb, adjacent] = await Promise.all([
    getWikiBacklinks(page.id),
    getWikiForwardLinks(page.id),
    getWikiCategoryBreadcrumb(page.category_id),
    getAdjacentWikiPages(page.id, page.category_id),
  ])

  // Subject crumb (first item in breadcrumb) for the mobile back link
  const subjectCrumb = breadcrumb[0]
  const subjectHref = subjectCrumb
    ? ROUTES.WIKI_SUBJECT(subjectCrumb.slug)
    : ROUTES.WIKI

  // Tier check for ad
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userTier = 'free'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
    userTier = profile?.tier ?? 'free'
  }
  const showAd = userTier === 'free' && AD_SLOTS.length > 0
  const ad = showAd ? pickAd(slug) : null

  const formattedDate = new Date(page.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const headings = extractHeadings(page.markdown_content)
  const showConnections = backlinks.length > 0 || forwardLinks.length > 0
  const showRightRail = headings.length > 0 || ad

  return (
    <div className="flex gap-8 w-full max-w-[calc(720px+200px+32px)]">
      {/* Article Content */}
      <article className="flex-1 min-w-0 max-w-[720px]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          <Link
            href={ROUTES.WIKI}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            Wiki
          </Link>
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              {i === 0 ? (
                <Link
                  href={ROUTES.WIKI_SUBJECT(crumb.slug)}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.name}
                </Link>
              ) : (
                <span>{crumb.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Mobile back link */}
        <Link
          href={subjectHref}
          className="lg:hidden inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
          Back to {subjectCrumb?.name ?? 'Wiki'}
        </Link>

        {/* Deprecation banner */}
        {page.is_deprecated && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-color-signal-amber/30 bg-color-signal-amber/5 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-color-signal-amber mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">This page is deprecated</p>
              {page.deprecated_note && (
                <p className="text-xs text-muted-foreground mt-0.5">{page.deprecated_note}</p>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-2">
          {page.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" strokeWidth={1.5} />
            Updated {formattedDate}
          </span>
          {!page.is_free && (
            <Badge variant="outline" className="text-[10px] h-5">Pro</Badge>
          )}
        </div>

        {/* Mobile TOC dropdown — hidden on xl+ (right rail takes over) */}
        {headings.length > 0 && (
          <details className="xl:hidden mb-6 rounded-lg border border-border/40 p-3">
            <summary className="text-xs font-medium text-foreground cursor-pointer select-none">
              On this page ({headings.length})
            </summary>
            <ul className="mt-2 space-y-1">
              {headings.map(({ id, text, level }) => (
                <li key={id} style={{ paddingLeft: level === 3 ? '12px' : '0' }}>
                  <a
                    href={`#${id}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Tags */}
        {page.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            <Tag className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            {page.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-muted-foreground bg-secondary rounded-md px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Markdown Content — scroll-mt on headings for anchor breathing room */}
        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 [&_table]:text-xs [&_th]:text-left [&_th]:font-medium [&_td]:py-1.5 [&_th]:py-1.5 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-border/40 [&_th]:border-border/40 [&_td]:px-3 [&_th]:px-3 [&_h2]:text-base [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-medium [&_h2]:tracking-tight [&_p]:text-[13px] [&_li]:text-[13px] [&_strong]:font-semibold [&_p]:leading-[1.75]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {page.markdown_content}
          </ReactMarkdown>
        </div>

        {/* Prev / Next navigation */}
        <ArticlePrevNext prev={adjacent.prev} next={adjacent.next} />

        {/* Bi-directional links */}
        {showConnections && (
          <div className="mt-8 border-t border-border/40 pt-6 space-y-4">
            {forwardLinks.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                  Links to
                </h2>
                <div className="flex flex-wrap gap-2">
                  {forwardLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={ROUTES.WIKI_PAGE(link.slug)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Link2 className="h-3 w-3" strokeWidth={1.5} />
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {backlinks.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Link2 className="h-3 w-3" strokeWidth={1.5} />
                  Backlinks ({backlinks.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {backlinks.map((link) => (
                    <Link
                      key={link.id}
                      href={ROUTES.WIKI_PAGE(link.slug)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Right Rail — sticky TOC + ad */}
      {showRightRail && (
        <aside className="hidden xl:block w-[200px] shrink-0">
          <div className="sticky top-8 space-y-6">
            {headings.length > 0 && <WikiTableOfContents headings={headings} />}
            {ad && <SponsoredCard ad={ad} variant="rail" />}
          </div>
        </aside>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run dev and verify article page**

Navigate to any wiki article. Confirm:
- Left sidebar shows all subjects collapsed except the one containing the current article
- Right rail TOC appears on wide screens (≥1280px / xl breakpoint)
- Mobile TOC `<details>` dropdown appears on smaller screens
- Breadcrumb: "Wiki → [Subject Link] → [Category]"
- Prev/Next links at bottom (if the article has siblings in the same category)
- Ad appears in right rail for free users

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```

Fix any errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/wiki/\(article\)/ src/components/wiki/ArticlePrevNext.tsx src/components/wiki/WikiTableOfContents.tsx src/components/wiki/WikiSidebar.tsx
git commit -m "feat(wiki): enhance article page with TOC rail, prev/next, scoped sidebar, and ads"
```

---

## Chunk 8: Final Integration Check

### Task 16: Full integration verification

- [ ] **Step 1: Full type-check**

```bash
npm run type-check
```

All errors must be resolved.

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Fix any new errors (warnings from pre-existing code are acceptable).

- [ ] **Step 3: Manual browser walkthrough**

Check each route:

| Route | What to verify |
|---|---|
| `/dashboard/wiki` | Subject cards are links, ⌘K bar visible, recently updated strip scrolls |
| `/dashboard/wiki/subject/[slug]` | Breadcrumb links back to hub, category cards with page previews, paginated list, pagination controls |
| `/dashboard/wiki/[slug]` | 3-col layout on desktop (sidebar + content + TOC rail), TOC dropdown on tablet, breadcrumb links to subject page, prev/next at bottom |
| `/dashboard/wiki/search?q=building` | Results with highlighted excerpts, subject filter chips, pagination |
| Any page — press ⌘K | Palette opens, type 2+ chars → live results, Enter navigates, "View all →" goes to search page |
| Free user | SponsoredCard appears in hub (pos 3), subject landing (last grid item), article right rail |
| Pro/Max user | No SponsoredCard anywhere — grid reflows cleanly |
| Mobile (375px) | Single-column hub, subject landing single-column, article shows "← Back to [Subject]" link instead of sidebar, TOC dropdown visible |
| Tablet (768px) | 2-col grids, article sidebar hidden, TOC dropdown |

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(wiki): complete hub-and-spoke UX overhaul — search, TOC, ads, mobile"
```
