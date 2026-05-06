# Performance and Pagination

## Dataset size

Current dataset:

- 567 articles.
- 7,159 questions.
- 249 design scenario questions.

The article table can be relatively light, but the question table must be paginated.

## Requirements

- Use server-side pagination.
- Default page size: 25 or 50.
- Avoid loading all questions in the browser.
- Avoid N+1 Supabase calls per row.
- Fetch statuses/findings in batch for current page IDs.

## Query strategy

For each paginated list:

1. Load target rows.
2. Collect target IDs.
3. Load audit statuses for target IDs.
4. Load open findings for target IDs.
5. Merge server-side.

## Indexes

The migration spec includes indexes for:

- target lookup,
- status filters,
- severity filters,
- run lookup,
- created-at ordering.

## Caching

No special caching is required for MVP. Use normal framework cache conventions. Admin pages should prioritize freshness over aggressive caching.

## Realtime

Realtime updates are not required. A refresh button is enough.
