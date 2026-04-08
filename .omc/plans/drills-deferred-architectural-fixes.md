# Drills Deferred Architectural Fixes

**Source:** `2026-04-08-drills-ux-performance-audit.md` (deferred items)
**Status:** APPROVED
**Created:** 2026-04-08

---

## Requirements Summary

Five deferred audit findings need architectural resolution:

| # | Issue | Severity | Root Cause |
|---|-------|----------|------------|
| 3.1 | Sequential taxonomy tree traversal (up to 7 DB round-trips) | HIGH | Client-side while-loop, no recursive CTE |
| 3.2 | No taxonomy caching in session creation | MEDIUM | `start-session.ts` does raw queries despite `getCachedTaxonomyTree()` existing in `cached-queries.ts` |
| 3.4 | Duplicate interaction fetch | MEDIUM | `start-session.ts` fetches `recentQuestionIds` but doesn't pass them to `selectQuestionsWithRouting()` |
| 6.2 | JS-side filtering above 100 interactions | MEDIUM | Threshold at 100 switches from DB filter to JS filter for `interactedIds` |
| 6.4 | `any` types in intelligent-routing | LOW | Missing interfaces for query returns |

## Decision: Cached In-Memory Traversal (Not Recursive CTE)

**Why NOT an RPC migration:**
- Taxonomy tree is static curriculum data — changes ~monthly at most
- `getCachedTaxonomyTree()` already caches with 7200s TTL in `cached-queries.ts`
- RPC requires a migration, harder to test, and adds Postgres lock-in
- In-memory traversal of ~5000 nodes is <1ms — no performance concern

**Why cached traversal:**
- Zero DB queries for repeat sessions (cache hit)
- Cross-ref resolution can be cached separately (also static data)
- Eliminates ALL 7 sequential queries in one shot
- Uses existing `unstable_cache` infrastructure

---

## Acceptance Criteria

1. `start-session.ts` taxonomy resolution makes **at most 1 DB query** on cache miss (vs current 4–7)
2. `start-session.ts` passes `excludeQuestionIds` to `selectQuestionsWithRouting()` — zero duplicate `user_interactions` queries
3. `intelligent-routing.ts` no longer independently fetches `user_interactions` when `excludeQuestionIds` is provided
4. `intelligent-routing.ts` always uses DB-level `.not()` filter — no JS-side fallback
5. Zero `any` types in `intelligent-routing.ts` return values
6. All existing tests pass (`bun test`)
7. `tsc --noEmit` clean

---

## Implementation Steps

### Phase 1: Eliminate Duplicate Interaction Fetch (3.4 + 6.2)
**Files:** `start-session.ts`, `intelligent-routing.ts`

**Step 1.1:** Add `excludeQuestionIds` to `RoutingOptions` interface
```
File: src/lib/quiz/intelligent-routing.ts:12-18
Add: excludeQuestionIds?: string[]
```

**Step 1.2:** Replace independent `user_interactions` fetch with passed data
```
File: src/lib/quiz/intelligent-routing.ts:99-108
- Remove the supabase.from('user_interactions') query from the Promise.all
- Use excludeQuestionIds to build the interactedSet directly
- Keep user_question_states queries (remediation + SR) — these are unique to routing
```

**Step 1.3:** Always use DB-level filtering (remove 100-threshold)
```
File: src/lib/quiz/intelligent-routing.ts:137-139
- Remove the `interactedIds.length < 100` condition
- Always apply .not() filter, chunking IDs if needed (PostgREST URL limit ~2000 chars)
- Use the existing CHUNK_SIZE constant for consistency
```

**Step 1.4:** Pass `recentQuestionIds` from start-session to routing
```
File: src/lib/actions/quiz-v2/start-session.ts:250-257
- Add excludeQuestionIds: recentQuestionIds to the selectQuestionsWithRouting call
- Same for selectQuestionsWithInterleaving (check its interface too)
```

### Phase 2: Cached Taxonomy Traversal (3.1 + 3.2)
**Files:** `cached-queries.ts`, `start-session.ts`

**Step 2.1:** Create `getCachedTaxonomyDescendants()` in cached-queries.ts
```
File: src/lib/actions/cached-queries.ts
- New function: getCachedTaxonomyDescendants(topicIds: string[]): Promise<string[]>
- Uses getCachedTaxonomyTree() (already cached, 7200s TTL)
- Builds parent→children map in memory from the flat cached array
- BFS/DFS traversal from given topicIds to collect all descendant node_ids
- Filters: is_leaf OR has questions (include non-leaf for question mapping)
- Excludes: is_cross_ref_only nodes (collected separately)
- Returns: { descendantIds: string[], crossRefSourceIds: string[] }
```

**Step 2.2:** Create `getCachedCrossRefMap()` in cached-queries.ts
```
File: src/lib/actions/cached-queries.ts
- New function: getCachedCrossRefMap(): Promise<Map<string, string[]>>
- Fetches all taxonomy_cross_references (small table, ~50 rows)
- Cached with unstable_cache, 7200s TTL, tag 'taxonomy'
- Returns: Map<sourceNodeId, targetNodeId[]>
```

**Step 2.3:** Replace while-loop traversal in start-session.ts
```
File: src/lib/actions/quiz-v2/start-session.ts:130-208
- Replace the entire `if (topics.length > 0)` block (lines 130-208)
- Call getCachedTaxonomyDescendants(topics) for descendant resolution
- Call getCachedCrossRefMap() for cross-ref resolution
- Resolve cross-ref targets and their descendants using the same cached tree
- All done in memory — zero additional DB queries
```

### Phase 3: Type Safety (6.4)
**File:** `intelligent-routing.ts`

**Step 3.1:** Define `QuestionRow` interface for routing queries
```
File: src/lib/quiz/intelligent-routing.ts
- Add interface for the QUESTION_COLS shape
- Replace `any[]` return types with the typed interface
- Type the queryQuestionsChunked return and additionalFilter parameter
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cached tree stale after admin adds topics | New topics not in quiz pool for up to 2h | Acceptable — taxonomy changes are planned, not real-time. Can revalidateTag('taxonomy') after admin changes. |
| Cross-ref map grows beyond expected size | Memory overhead | Table has ~50 rows. Even 500 rows = negligible. Monitor. |
| Removing JS-side filter fallback breaks edge case | Missing questions in pool | The `.not()` DB filter with chunking handles all sizes. Chunking already proven in `queryQuestionsChunked`. |
| `excludeQuestionIds` is empty on first session | No-op filter, same as current behavior | The `.not()` filter with empty array is a no-op in PostgREST. Safe. |

---

## Verification Steps

1. **Type safety:** `tsc --noEmit` clean
2. **Unit tests:** `bun test` — all existing pass
3. **Integration check:** Start a 50-question custom session → verify questions load, no duplicates
4. **Performance check:** Add `console.time('taxonomy-resolution')` temporarily — target <50ms on cache hit
5. **Cache verification:** Start two sessions back-to-back — second should have zero taxonomy DB queries (verify via Supabase logs or network tab)

---

## Execution Order

Phase 1 → Phase 2 → Phase 3 (sequential — each phase builds on previous)

Phase 1 is lowest risk and highest immediate value (eliminates duplicate DB query on every session start). Phase 2 is the biggest architectural change but isolated to the taxonomy resolution block. Phase 3 is pure cleanup with zero behavior change.
