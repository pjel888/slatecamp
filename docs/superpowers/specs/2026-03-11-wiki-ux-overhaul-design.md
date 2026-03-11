# Wiki UX Overhaul — Design Spec
**Date:** 2026-03-11
**Status:** Approved
**Scope:** Full wiki UX/UI overhaul — layout, navigation, search, article reading experience, ad placement, mobile handling

---

## Overview

Cerebro's wiki serves architecture students preparing for board exams. It must support two equally important usage modes: **browsing to discover/study** and **fast lookup of specific content**. The current implementation has a flat sidebar tree that does not scale to 500+ pages, no mobile navigation, submit-only search, and no ad infrastructure.

The redesign adopts a **Hub-and-Spoke** information architecture — the home page is a subject hub, each subject has its own landing page, and the article page is scoped to its subject. This enforces progressive disclosure, eliminates doom scrolling, and creates natural parent/child navigation.

---

## 1. Route Structure

| Route | Purpose | Status |
|---|---|---|
| `/dashboard/wiki` | Subject Hub | Existing — refactor |
| `/dashboard/wiki/subject/[slug]` | Subject Landing Page | New |
| `/dashboard/wiki/[slug]` | Article Page | Existing — enhance |
| `/dashboard/wiki/search` | Full Search Results | New |

**Route safety note:** `/dashboard/wiki/subject/[slug]` uses the literal path segment `subject`, making it safe alongside `/dashboard/wiki/[slug]` (article slugs) in the App Router. No collision is possible because `subject` is a fixed segment, not a dynamic one.

**Subject definition:** A "subject" is a root-level wiki category (`parent_id IS NULL` in the `wiki_categories` table). Child categories are sub-categories within a subject. The `/dashboard/wiki/subject/[slug]` route only applies to root-level categories. Navigating to a child category slug at this route should return a 404.

---

## 2. Layout Architecture

### Layout Behavior by Route

| Route | Left Sidebar | Right Rail | Max Width |
|---|---|---|---|
| Hub | None | None | 1100px full-bleed grid |
| Subject Landing | None | None | 900px |
| Article | Subject-scoped page tree (220px) | Table of Contents (200px) | 720px content |
| Search Results | None | None | 900px |

### Context-Aware Layout — Implementation Mechanism
Use **Next.js App Router route groups** to give different layouts to different wiki routes. Do not use `usePathname()` in a Server Component.

```
src/app/dashboard/wiki/
  layout.tsx                    ← minimal shared wrapper (no sidebar)
  (hub)/
    page.tsx                    ← Subject Hub
  (subject)/
    subject/[slug]/
      page.tsx                  ← Subject Landing Page
  (article)/
    layout.tsx                  ← adds sidebar + right rail
    [slug]/
      page.tsx                  ← Article Page
  (search)/
    search/
      page.tsx                  ← Full Search Results
```

The top-level `wiki/layout.tsx` fetches only what is shared across all routes (user auth, tier check). The `(article)/layout.tsx` fetches the subject-scoped page tree and mounts `WikiSidebar` and `WikiTableOfContents`.

**WikiDevPanel preservation:** The existing `<WikiDevPanel>` (admin-only tooling) must be preserved. Move it into `(article)/layout.tsx` so it only renders on article pages — this is its current effective scope.

### Navigation Hierarchy
```
Wiki Home (Hub)
  └── Subject Landing  (e.g. "Building Laws")
        └── Category Section  (e.g. "Fire Codes")
              └── Article  (sidebar shows only this subject's pages)
```

Breadcrumb on every page reflects this full path. All intermediate crumb nodes are clickable links:
- "Wiki" → `/dashboard/wiki`
- Subject name → `/dashboard/wiki/subject/[subject-slug]`
- Category name → plain text (no route for category alone)
- Article title → current page (no link)

---

## 3. Subject Hub (`/dashboard/wiki`)

### Purpose
Orient the user. Show all 8 subjects at a glance. Make browse and search equally accessible.

### Layout
- Wiki header with full-width ⌘K search bar trigger
- 3-column subject card grid (desktop), 2-column (tablet), 1-column (mobile)
- "Recently Updated" horizontal scroll strip below the grid (8–10 most recent non-deprecated pages)

### Subject Cards
- Full clickable link to `/dashboard/wiki/subject/[slug]`
- Shows: subject icon (resolved from `WIKI_SUBJECT_ICONS[category.slug]` — see Data Notes), name, short description, page count
- Hover: subtle border lift (no heavy shadows)
- Keyboard focus ring always visible (Apple HIG)

### Ad Slot (Free Tier Only)
- Position 3 in the grid (after first two subject cards)
- Renders `<SponsoredCard variant="subject" />` — see Section 7 for props
- Pro tier: grid reflows to fill cleanly without a gap (no empty placeholder)

### Recently Updated Strip
- Horizontal scrollable row of pill-links to 8–10 most recently updated pages
- Excludes deprecated pages (`is_deprecated = false` filter)
- Natural scroll on touch, wheel on desktop

---

## 4. Subject Landing Page (`/dashboard/wiki/subject/[slug]`)

### Purpose
Bridge between hub and articles. Show all categories and pages within one subject without overwhelming the user.

### Layout (top to bottom)
1. Breadcrumb: `← Wiki / [Subject Name]`
2. Subject header: icon, name, description, page count + category count
3. Subject-scoped search input (inline results, no page navigation for <6 results)
4. Category cards grid (2-column)
5. Paginated flat page list (15 per page, alphabetical, all pages in the subject including sub-categories)

### Category Cards
- Shows: category name, page count, preview of first 3 page titles as links
- "+ N more →" link navigates to same page with `?category=[slug]` query param which scrolls to and expands that category section
- Clicking the card header navigates to `?category=[slug]` (query param on the same page, not a separate route)

### Ad Slot (Free Tier Only)
- Last position in the category grid
- Renders `<SponsoredCard variant="category" />`
- Pro tier: grid reflows without a gap

### Paginated Page List
- Flat alphabetical list of **all** pages in the subject (includes pages from all child categories)
- 15 per page, Prev/Next with page number
- No infinite scroll
- Each row shows: page title (linked), category tag, updated date

---

## 5. Article Page (`/dashboard/wiki/[slug]`)

### Purpose
Deep focus reading of long-form content (2000+ words). Clear context. No disorientation.

### Three-Column Layout
```
Left Sidebar (220px) | Content (720px max) | Right Rail TOC (200px)
```

### Left Sidebar — Subject-Scoped
- Shows only categories and pages within the current article's subject
- `WikiSidebar` receives a scoped `pagesByCategory` filtered to the current subject's category IDs only
- Categories are collapsible; current article is highlighted with active state
- Hidden on tablet and mobile

### Article Content
- 720px max-width, 1.75 line height, 15px base body text
- Section headings have generous `scroll-mt-20` (or equivalent) for anchor scroll breathing room
- **Prev/Next article navigation** at the bottom (within same category, ordered by `order_index`), powered by `getAdjacentWikiPages(pageId, categoryId)` — see Section 9
- Backlinks/Forward links at very bottom, collapsed behind "Show connections (N)" toggle if >5

### Table of Contents (Right Rail)
- Auto-generated from `##` and `###` headings in the markdown content
- Sticky — scrolls with user, highlights current section via `IntersectionObserver`
- On tablet: collapses to "On this page ▾" dropdown below the article title
- On mobile: same "On this page ▾" dropdown

### Ad Slot (Free Tier Only)
- Single `<SponsoredCard variant="rail" />` below the TOC list in the right rail
- Pro tier: replaced by "Related Pages" section — pages from other subjects sharing tags with the current article
- Never injected mid-article

---

## 6. Search

### Mode 1 — ⌘K Command Palette
- Triggered by `⌘K` / `Ctrl+K` or clicking the wiki header search bar trigger
- Modal overlay, centered, dimmed backdrop
- Results appear after 2+ characters with 200ms debounce
- Shows top 6 results: page title, subject label, highlighted excerpt
- Keyboard navigable (arrow keys + Enter, Escape to dismiss)
- "View all results →" link navigates to full results page
- Built with shadcn `Command` (cmdk)
- **`WikiSearchBar` is deleted** and replaced by this palette. The existing submit-on-form search behavior is eliminated.

### Mode 2 — Full Results Page (`/dashboard/wiki/search?q=`)
- Paginated at 10 per page (Prev/Next, no infinite scroll)
- Subject filter chips via `?subject=[slug]` URL param
- Each result: title, subject label, highlighted excerpt, tags
- Sorted by PostgreSQL full-text relevance rank (requires new DB function — see Section 9)
- Empty state shows suggested subjects to browse
- No ads on this page

### Subject-Scoped Search
- Available on Subject Landing pages as an inline input
- Routes to `/dashboard/wiki/search?q=[term]&subject=[slug]`

---

## 7. Ad System

### Subscription Tier Check
Read from the user's profile: `profiles.tier` (enum values: `'free'` | `'pro'` | `'max'`). This check happens in the server component for each layout. If `tier === 'free'`, render `<SponsoredCard>`. Any non-`'free'` value (`'pro'` or `'max'`) suppresses ads — render the real content card or nothing (grid reflows).

### Ad Content Source
For the initial implementation, ad content is **hardcoded as a constant** in `src/lib/constants/ads.ts`. This can be replaced with a CMS or external ad provider later. The constant exports an array of `AdSlot` objects.

```ts
// src/lib/constants/ads.ts
export interface AdSlot {
  id: string
  label: string        // "Sponsored" shown in UI
  headline: string     // e.g. "Kaplan Architecture Exam Prep"
  body: string         // short description
  ctaText: string      // e.g. "Learn More"
  ctaUrl: string       // external URL
  imageUrl?: string    // optional static image
}

export const AD_SLOTS: AdSlot[] = [
  // hardcoded initial ads
]
```

### SponsoredCard Props
```ts
interface SponsoredCardProps {
  ad: AdSlot
  variant: 'subject' | 'category' | 'rail'
}
```
- `subject`: same width/height as a subject card in the hub grid
- `category`: same width/height as a category card in the subject landing grid
- `rail`: narrow vertical card for the article right rail

### Rules
- One ad per page maximum — never stacked
- Fixed positions only — never mid-article or mid-list injection
- No animation, no bright colors, no auto-play — static only
- Always labeled "Sponsored" in `muted-foreground` (using `ad.label`)
- Pro tier: `<SponsoredCard>` is not rendered; grid reflows cleanly

### Slot Locations

| Page | Position | Variant |
|---|---|---|
| Subject Hub | Grid position 3 | `subject` |
| Subject Landing | Last category card position | `category` |
| Article Page | Below TOC in right rail | `rail` |
| Search Results | None | — |

---

## 8. Mobile & Tablet

### Tablet (768px–1024px)
- Hub and Subject Landing: 2-column grid
- Article: left sidebar hidden, TOC collapses to "On this page ▾" dropdown below the article title, content goes full-width
- ⌘K palette: triggered by tapping the search bar trigger

### Mobile (<768px)
- Hub and Subject Landing: single column
- Article: breadcrumb truncates to immediate parent (`← [Subject Name]` link only), TOC → "On this page ▾" dropdown, left sidebar hidden, a "← Back to [Subject Name]" link appears at the top of the article in place of the sidebar
- All tap targets minimum 44px (Apple HIG)
- Horizontal scroll only on "Recently Updated" strip on the hub (intentional)

---

## 9. Components To Build / Modify

### New Components
- `SubjectHub` — refactored home page (`src/app/dashboard/wiki/(hub)/page.tsx`)
- `SubjectLandingPage` — new route (`src/app/dashboard/wiki/(subject)/subject/[slug]/page.tsx`)
- `SearchResultsPage` — new route (`src/app/dashboard/wiki/(search)/search/page.tsx`)
- `WikiCommandPalette` — ⌘K modal (shadcn `Command`)
- `WikiTableOfContents` — sticky right-rail TOC with `IntersectionObserver`
- `SponsoredCard` — native ad card (`src/components/wiki/SponsoredCard.tsx`)
- `ArticlePrevNext` — prev/next article navigation at article bottom

### Modified Components
- `WikiSidebar` — accepts scoped `pagesByCategory` (only current subject's categories); unchanged interface, filtered data
- `WikiLayout` (top-level) — becomes minimal shared wrapper; sidebar logic moves to `(article)/layout.tsx`
- `WikiDevPanel` — moved to `(article)/layout.tsx` (preserves existing behavior)

### Deleted Components
- `WikiSearchBar` — replaced entirely by `WikiCommandPalette` trigger button

---

## 10. New Server Actions (`src/lib/actions/wiki.ts`)

| Action | Description |
|---|---|
| `getWikiSubjectBySlug(slug)` | Fetch root-level category by slug with all child categories and pages |
| `getWikiPagesBySubject(subjectSlug, page, perPage)` | Paginated flat list of all pages under a subject |
| `getAdjacentWikiPages(pageId, categoryId)` | Returns `{ prev, next }` — adjacent pages in same category ordered by `order_index` |
| `getRecentlyUpdatedPages(limit)` | Most recently updated pages excluding deprecated (`is_deprecated = false`) |
| `searchWikiPaginated(q, subject?, page, perPage)` | Paginated, subject-filtered full-text search (requires new Postgres RPC — see below) |

### Required New Postgres RPC: `search_wiki_paginated`
The existing `search_wiki` function accepts only `search_term` and `max_results`. The new paginated + subject-filtered search requires a new RPC to be added to `DATABASE_SCHEMA.sql`:

```sql
-- New function signature (to be implemented)
CREATE OR REPLACE FUNCTION search_wiki_paginated(
  search_term TEXT,
  subject_slug TEXT DEFAULT NULL,   -- filters to root category + children
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
  rank REAL,
  total_count BIGINT
)
```

This function must be created and added to `DATABASE_SCHEMA.sql` before the search feature can be implemented.

---

## 11. Data Notes

### Icon Resolution
Subject icons are **not stored in the database**. They are resolved client-side via the `WIKI_SUBJECT_ICONS` map in `src/components/wiki/wiki-icons.ts`, keyed by `category.slug`. All new components that render subject icons must import and use this map. If a slug has no mapping, fall back to `DEFAULT_WIKI_ICON`.

### Subject vs Sub-category
- Subjects = `wiki_categories` rows where `parent_id IS NULL`
- Sub-categories = `wiki_categories` rows where `parent_id IS NOT NULL`
- `getWikiSubjectBySlug` must query `WHERE slug = $1 AND parent_id IS NULL`
- If a sub-category slug is passed to the subject landing route, return `notFound()`

---

## 12. Design Tokens (Existing — No Changes)

- Primary CTA: `#ED8008` (amber)
- Correct: `#34C759`, Incorrect: `#FF3B30`
- No gradients, no heavy shadows, no bouncy animations
- Transitions: 150ms
- Focus rings: always visible
- Min tap target: 44px (mobile)
