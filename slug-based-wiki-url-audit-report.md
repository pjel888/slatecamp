SLUG-BASED WIKI URL BUILDERS — AUDIT REPORT
============================================

Generated: 2026-05-04
Scope: src/ (entire application source)
Migration context: articleId-based wiki URLs (slug-based URLs are deprecated)

LEGEND
------
(1) Still wrong and must be fixed — the URL is built from a slug and will 404 or mis-route.
(2) Valid metadata usage — slug is read from DB for display / context, not used in a URL.
(3) Deprecated fallback — code explicitly prefers articleId but keeps slug as fallback.
(4) Test fixture — storybook / test data only.
(5) Documentation — comments or AGENTS.md notes.

---

A. DEFINITE BUGS (Classification 1 — still wrong, must be fixed)
----------------------------------------------------------------

1. src/lib/actions/quiz-v2/submit-answer.ts:291
   Current code:
     const wikiArticleUrl =
       feedbackTiming === 'immediate' && wikiSlug ? `/dashboard/wiki/${wikiSlug}?from=quiz` : null
   Classification: (1) Still wrong — builds URL from wikiSlug (a DB slug string).
   Recommended action: Change loadWikiSlug helper to loadWikiArticleId (select article_id
   instead of slug from wiki_articles), rename variable to wikiArticleId, and interpolate
   that into the URL.

2. src/lib/actions/quiz-v2/get-review-data.ts:118
   Current code:
     wikiMap.set(w.node_id, w.wiki_articles?.slug ? `/dashboard/wiki/${w.wiki_articles.slug}?from=quiz` : null)
   Classification: (1) Still wrong — query selects wiki_articles(slug) and uses it in URL.
   Recommended action: Change the Supabase query to select wiki_articles(article_id)
   instead of slug, then use article_id in the URL template.

3. src/lib/actions/quiz-v2/generate-recommendations.ts:214
   Current code:
     href: ROUTES.wiki.article(wikiRec.slug),
   Classification: (1) Still wrong — getUnreadWikiForTopic returns { slug, title } and
   the slug is passed to ROUTES.wiki.article().
   Recommended action: Update getUnreadWikiForTopic to return article_id instead of (or
   alongside) slug, then pass article_id to ROUTES.wiki.article().

4. src/components/wiki/article/WikiLearningJourney.tsx:172
   Current code:
     href={`/dashboard/wiki/${topic.article_id || topic.slug}`}
   Classification: (3) Deprecated fallback — prefers article_id but falls back to slug.
   Recommended action: Verify that topic.article_id is always populated in production;
   if so, remove the || topic.slug fallback to eliminate the slug path.

5. src/components/wiki/shared/WikiRelatedPopover.tsx:106
   Current code:
     href={ROUTES.wiki.article(topic.article_id || topic.slug)}
   Classification: (3) Deprecated fallback — same pattern as #4.
   Recommended action: Same as #4; confirm article_id is always present and drop the
   fallback.

6. src/components/testing/hub/SessionsTable.tsx:142-144
   Current code:
     const articleSlug = session.config?.articleSlug
     if (articleSlug) {
       return `/dashboard/wiki/${articleSlug}`
     }
   Classification: (1) Still wrong — session config stores articleSlug and uses it for URL.
   Recommended action: Update quiz session creation (wiki-quiz.ts and get-prequestions.ts)
   to store articleId in config instead of articleSlug, then read articleId here.

7. src/app/dashboard/code-updates/_components/CodeUpdateCard.tsx:67
   Current code:
     href={`${ROUTES.wiki.article(update.article_id || lea_id.toLowerCase().replace(/\s+/g, '-'))}`}
   Classification: (3) Deprecated fallback — prefers article_id but falls back to a slug
   derived from lea_id.
   Recommended action: Confirm article_id is always present on code-update rows; if so,
   remove the slug fallback.

8. src/components/wiki/navigation/WikiRightSidebar.tsx:69
   Current code:
     const url = `${window.location.origin}${ROUTES.wiki.article(articleId || articleSlug)}`
   Classification: (3) Deprecated fallback — copy-link feature falls back to articleSlug.
   Recommended action: Ensure articleId is always passed to WikiRightSidebar; if so,
   remove the || articleSlug fallback.

B. VALID METADATA USAGE (Classification 2 — slug used for display / data, not URLs)
---------------------------------------------------------------------------------

9. src/lib/actions/wiki-actions.ts (multiple lines)
   slug is selected from wiki_articles and included in search results / trail nodes.
   No URL is built from these slugs in this file.
   Classification: (2) Valid metadata usage.
   Recommended action: None — keep as-is; slugs are useful for display and SEO context.

10. src/lib/actions/cached-queries.ts:118
    slug is returned in article excerpts for display.
    Classification: (2) Valid metadata usage.
    Recommended action: None.

11. src/lib/actions/admin/content.ts:294
    slug is included in admin content mapping objects.
    Classification: (2) Valid metadata usage.
    Recommended action: None.

12. src/lib/actions/stats-actions.ts:312
    slug is returned in stats payload.
    Classification: (2) Valid metadata usage.
    Recommended action: None.

13. src/lib/actions/wiki-bookmarks.ts:36
    slug is returned alongside article_id for display.
    Classification: (2) Valid metadata usage.
    Recommended action: None.

14. src/app/api/ai/tutor/route.ts:39
    SLUG is included in AI context chunks as metadata.
    Classification: (2) Valid metadata usage.
    Recommended action: None.

C. EXPLICIT DEPRECATED FALLBACKS (Classification 3 — already documented, prefer articleId)
------------------------------------------------------------------------------------------

15. src/features/3d-lab/components/templates/HotspotAnnotation.tsx:12-14
    Interface declares:
      /** @deprecated Prefer wikiArticleId ... */
      wikiSlug?: string
      wikiArticleId?: string
    Code at line 47-51 already prefers wikiArticleId, then falls back to wikiSlug.
    Classification: (3) Deprecated fallback — correctly documented.
    Recommended action: Populate wikiArticleId in all HotspotDef configs, then remove
    wikiSlug field and fallback path.

16. src/features/3d-lab/components/templates/InfoPanel.tsx:13-15
    Same pattern as #15 — interface is documented and code prefers wikiArticleId.
    Classification: (3) Deprecated fallback.
    Recommended action: Same as #15.

17. src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrders.tsx & ClassicalOrdersScene.tsx
    These data files still contain wikiSlug values (e.g. 'classical-orders-stylobate').
    The consuming components (HotspotAnnotation, InfoPanel) already prefer wikiArticleId
    when provided.
    Classification: (3) Deprecated fallback at data layer.
    Recommended action: Add wikiArticleId values to the hotspot configs and deprecate
    wikiSlug fields.

18. src/components/shared/SourceBadge.tsx:14-22
    Props accept slug and optional articleId; targetId = articleId || slug.
    Classification: (3) Deprecated fallback.
    Recommended action: Ensure all callers pass articleId, then remove slug prop and
    fallback.

19. src/components/quiz-v2/SocraticExplorer.tsx:63-64
    handleSourceClick takes slug and optional articleId; URL uses articleId || slug.
    Classification: (3) Deprecated fallback.
    Recommended action: Ensure callers always pass articleId, then remove slug parameter.

D. TEST / STORYBOOK FIXTURES (Classification 4)
-------------------------------------------------

20. src/storybook/fixtures/wiki.ts:44
    articleSlug: 'fire-separation-occupancy-exit-strategy'
    Classification: (4) Test fixture.
    Recommended action: Update fixture to include a realistic articleId and remove
    articleSlug if the component under test no longer needs it.

21. src/storybook/scenes/wiki/WikiArticleScene.stories.tsx:149
    articleSlug={wikiHeaderFixture.articleSlug}
    Classification: (4) Test fixture.
    Recommended action: Same as #20.

22. src/components/wiki/quiz/WikiQuizModal.test.tsx:46
    articleSlug: 'test-article'
    Classification: (4) Test fixture.
    Recommended action: Update test props to pass articleId instead of articleSlug.

23. src/components/wiki/quiz/WikiQuizModal.stories.tsx:19
    articleSlug: 'fire-separation-occupancy-exit-strategy'
    Classification: (4) Test fixture.
    Recommended action: Same as #20.

24. src/lib/actions/quiz-v2/submit-answer.test.ts (multiple lines)
    wiki_slug: 'test-article' in mock RPC results.
    Classification: (4) Test fixture.
    Recommended action: Update mocks to return wiki_article_id instead of wiki_slug.

25. src/app/dashboard/wiki/[articleId]/page.test.tsx:79
    wiki: { article: (articleId: string) => `/dashboard/wiki/${articleId}` }
    Classification: (4) Test fixture — the mock ROUTES is correct (uses articleId).
    Recommended action: None; this mock is already articleId-based.

E. DOCUMENTATION / COMMENTS (Classification 5)
----------------------------------------------

26. src/lib/actions/wiki-actions.ts:393-399
    JSDoc comments on resolveArticleAndNode describe slug-matching logic and mark the
    function as @deprecated.
    Classification: (5) Documentation.
    Recommended action: None — comments are accurate.

27. src/lib/actions/cached-queries.ts:138
    JSDoc: "@deprecated Use getCachedArticleAndNodeById instead."
    Classification: (5) Documentation.
    Recommended action: None.

F. ALREADY CORRECT (articleId-based, no slug involved)
--------------------------------------------------------

28. src/app/dashboard/wiki/[articleId]/page.tsx:280-289
    Sibling navigation links use ROUTES.wiki.article(siblings.prev.article_id || '').
    Classification: Already correct.

29. src/components/wiki/shared/WikiReference.tsx:108,124
    Uses ROUTES.wiki.article(targetId) where targetId is resolved from article_id.
    Classification: Already correct.

30. src/components/wiki/navigation/WikiBookmarks.tsx:141
    Uses ROUTES.wiki.article(b.articleId).
    Classification: Already correct.

31. src/components/dashboard/FeatureDiscoveryRow.tsx:68
    href={article ? `/dashboard/wiki/${article.articleId}` : '/dashboard/wiki'}
    Classification: Already correct.

32. src/app/admin/knowledge/[id]/page.tsx:75
    href={`/dashboard/wiki/${article.article_id}`}
    Classification: Already correct.

33. src/components/wiki/article/WikiItemRenderer.tsx:133
    href={`/dashboard/wiki/${targetId}`} where targetId = item.article_id || slug.
    Note: This is a cross_ref renderer. The item.article_id path is correct; the slug
    path is a deprecated fallback (same classification as #18).

34. src/lib/routes.ts:140
    article: (articleId: string) => `/dashboard/wiki/${articleId}` as const
    Classification: Already correct — ROUTES.wiki.article expects an articleId.

G. SESSION CONFIG PROPAGATION (root cause for several fallbacks)
----------------------------------------------------------------

35. src/lib/actions/wiki-quiz.ts:165-169
    quiz_sessions.config stores { mode, source, ...(articleSlug && { articleSlug }) }.
    This is the source of the articleSlug value read by SessionsTable.tsx.
    Classification: (1) Still wrong — stores slug instead of articleId.
    Recommended action: Change to store articleId (pass it into getWikiQuizQuestions,
    or look it up from the nodeId / question data). Update SessionsTable to read
    session.config.articleId.

36. src/lib/actions/wiki/get-prequestions.ts:113-117
    Same pattern — quiz_sessions.config stores articleSlug.
    Classification: (1) Still wrong.
    Recommended action: Same as #35.

37. src/components/wiki/blocks/PrequestionGate.tsx:18,74
    Accepts articleSlug prop and passes it to getPrequestions().
    Classification: (3) Deprecated fallback — prop is only used to store in session config.
    Recommended action: Replace articleSlug prop with articleId, update getPrequestions
    signature, and store articleId in config.

38. src/components/wiki/quiz/WikiQuizModal.tsx:15,187
    Accepts articleSlug prop and passes it to getWikiQuizQuestions().
    Classification: (3) Deprecated fallback.
    Recommended action: Replace articleSlug prop with articleId, update action signature,
    and store articleId in config.

39. src/components/wiki/quiz/WikiQuizButton.tsx:16,67
    Passes articleSlug down to WikiQuizModal.
    Classification: (3) Deprecated fallback.
    Recommended action: Same as #38.

SUMMARY TABLE
-------------
| # | File | Line(s) | Class | Action |
|---|------|---------|-------|--------|
| 1 | submit-answer.ts | 291 | 1 | loadWikiArticleId instead of loadWikiSlug |
| 2 | get-review-data.ts | 118 | 1 | select article_id, use it in URL |
| 3 | generate-recommendations.ts | 214 | 1 | return article_id from helper |
| 4 | WikiLearningJourney.tsx | 172 | 3 | drop || topic.slug fallback |
| 5 | WikiRelatedPopover.tsx | 106 | 3 | drop || topic.slug fallback |
| 6 | SessionsTable.tsx | 142-144 | 1 | read articleId from session config |
| 7 | CodeUpdateCard.tsx | 67 | 3 | drop slug fallback |
| 8 | WikiRightSidebar.tsx | 69 | 3 | drop || articleSlug fallback |
| 9-14 | Various actions | — | 2 | No action needed |
| 15-19 | 3D-lab / SourceBadge / SocraticExplorer | — | 3 | Populate articleId, then remove slug fallback |
| 20-25 | Storybook / test fixtures | — | 4 | Update fixtures to use articleId |
| 26-27 | wiki-actions.ts / cached-queries.ts | — | 5 | No action needed |
| 28-34 | Correct usages | — | — | No action needed |
| 35 | wiki-quiz.ts | 165-169 | 1 | store articleId in config |
| 36 | get-prequestions.ts | 113-117 | 1 | store articleId in config |
| 37 | PrequestionGate.tsx | 18,74 | 3 | replace articleSlug prop with articleId |
| 38 | WikiQuizModal.tsx | 15,187 | 3 | replace articleSlug prop with articleId |
| 39 | WikiQuizButton.tsx | 16,67 | 3 | replace articleSlug prop with articleId |

TOP PRIORITY FIXES (will eliminate the majority of slug-based URLs)
-------------------------------------------------------------------
1. Fix quiz-v2 server actions (submit-answer.ts, get-review-data.ts, generate-recommendations.ts)
   — these directly build URLs from slugs returned by DB queries.
2. Fix session config storage (wiki-quiz.ts, get-prequestions.ts) to store articleId instead
   of articleSlug, then update SessionsTable.tsx to read articleId.
3. Populate wikiArticleId in all 3D-lab hotspot configs and remove wikiSlug fields.
4. Audit SourceBadge and SocraticExplorer callers to ensure articleId is always passed,
   then remove slug fallback props.
5. Update storybook / test fixtures to use articleId.

No files were created or modified during this audit.
