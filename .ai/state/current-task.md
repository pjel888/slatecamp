Implementation Complete: Wiki Route V2.2 Performance Optimization

CURRENT DOMAIN: Wiki Route Performance
STATUS: COMPLETE

COMPLETED:
- Phase 1: Subscription Tier Consolidation (5-tier model enforced)
- Phase 2: Route Nomenclature Migration (testing → drills)
- Phase 3: Database Migration Script (tier_consolidation.sql)
- Phase 4: Wiki Route Performance Audit (V2.2 approved)
- Phase 5: Wiki Performance Optimization (V2.2 executed)
  - Step 0: Baselines — 562 published articles, existing indexes audited
  - Step 1: 2 junction table composite indexes deployed
  - Step 2: get_article_with_node RPC created + resolveArticleAndNode updated with fallback
  - Step 3: Cache TTLs set (article: 1h, taxonomy: 2h) — no more infinite caches
  - Step 4: WikiSidebarLoader switched to getCachedTaxonomyTreeFull (cached with 2h TTL)
  - Step 5: Suspense boundary added around WikiRightSidebar in [slug]/page.tsx
  - Step 6: React.cache() memoization added for resolveArticleAndNode, getTaxonomyTree, getBreadcrumbTrail
  - Step 7: Performance logging added to resolveArticleAndNode (RPC + fallback paths)

NEXT ACTION: Execute payment decoupling plan to fix build errors and enable "Free Mode" operation

BLOCKERS:
- Build fails due to missing @lemonsqueezy/lemonsqueezy.js package
- Both Payrex and LemonSqueezy API keys empty in .env.local
