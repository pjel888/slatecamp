# 15 — Appendix: VizCode Feature Gap Analysis

## Complete Feature Gap: VizCode vs Current SlateCamp vs Target LI

This appendix catalogs every VizCode feature identified in the competitive audit and maps it to current SlateCamp capability and target LI capability.

| # | VizCode Feature | Evidence | Current SlateCamp | Target LI | Phase | Gap |
|---|----------------|----------|-------------------|-----------|-------|-----|
| 1 | PD 1096 code library (67 pages) | 135 captured variants | Wiki articles (partial) | Source View + Coverage View | P2 | Source cards needed |
| 2 | BP 344 code library (57 pages) | 115 captured variants | Wiki articles (partial) | Source View + Coverage View | P2 | Source cards needed |
| 3 | BP 220/PD 957 code library (54 pages) | 121 captured variants | Wiki articles (minimal) | Source View + Coverage View | P2 | Source cards needed |
| 4 | RA 9514 code library (37 pages) | 75 captured variants | Wiki articles (partial) | Source View + Coverage View | P2 | Source cards needed |
| 5 | GBC code library (14 pages) | 29 captured variants | None | Source View + Coverage View | P3 | Source cards needed |
| 6 | Isolation Mode | "Focus on one topic at a time" | None | Focus View (3D layer exploration) | MVP | ✅ |
| 7 | Comparative Mode | "Side-by-side view" | None | Compare View (toggle states) | P2 | ✅ |
| 8 | Game Mode | "Interactive quizzes" (text) | Quiz system (separate) | Mistake Hunt (spatial) + Board Drill (3D overlay) | P2/P3 | ✅ |
| 9 | Category sidebar navigation | `?categoriesPanel=show` (237 states) | 3D Lab category drill-down | Coverage View (browsable atlas) | P2 | ✅ |
| 10 | Topic pages with text + diagrams | 267+ unique pages | Wiki articles + 3D Lab modules | Wiki + LI module (source card + 3D) | P1 | Integration needed |
| 11 | QUBI AI Chatbot | "Trained on Philippine architectural standards" | None | Repair Path (source-grounded, not AI) | P3 | Differentiated |
| 12 | AI Chat Credits (PHP 99) | Separate product | None | Included in Pro (no separate credit) | N/A | Differentiated |
| 13 | Voice mode for AI | Toggle on QUBI page | None | N/A — not relevant | N/A | Skip |
| 14 | Discord community | Subscription-gated, bot verification | Separate community strategy | N/A — not LI domain | N/A | Separate |
| 15 | TopLab review center partnership | PHP 49,950 institutional | None | Institutional offering (separate) | N/A | Separate |
| 16 | Group plans (2-24 users) | Tiered per-seat pricing | None | Institutional offering (separate) | N/A | Separate |
| 17 | Shared accounts | "One account. Full access." | None | Named seats (separate) | N/A | Separate |
| 18 | Blog (2 posts) | WordPress blog | Blog (separate content strategy) | N/A — not LI domain | N/A | Separate |
| 19 | FAQ page | FAQ REST content present | FAQ page exists | N/A — not LI domain | N/A | Separate |
| 20 | Contact/Report forms | Contact + Report Issue forms | Support channels exist | Source Card "Report Issue" action | P2 | Integration needed |
| 21 | Terms and Conditions | Empty (0 REST chars) | ⚠ Needs improvement | ⚠ Separate legal | N/A | Legal gap |
| 22 | Privacy Policy | Generic WordPress boilerplate | ⚠ Needs improvement | ⚠ Separate legal | N/A | Legal gap |
| 23 | How It Works page | "Supplementary resource" disclaimer | None | Trust docs (separate) | N/A | Separate |
| 24 | Social proof (899+ members, testimonials) | Home page REST copy | Needs building | Separate marketing | N/A | Separate |
| 25 | Static diagrams/GIFs | Multiple marketing assets | 3D interactive (superior) | 3D interactive (superior) | MVP | ✅ Beat |
| 26 | Desktop-first ("best viewed on Desktop") | How It Works note | Responsive (mobile bottom sheet) | Responsive (inherits ViewportShell) | MVP | ✅ Beat |
| 27 | Manual payment verification | Bank details after plan selection | Automated (Supabase + payment) | N/A — not LI domain | N/A | ✅ Beat |
| 28 | WooCommerce products (18 items) | Product IDs 414-416, 12082, etc. | Separate commerce | N/A — not LI domain | N/A | Separate |
| 29 | WordPress REST API (1,012 routes) | Public REST exposure | Next.js App Router (not WP) | N/A — different stack | N/A | Different |
| 30 | Public media endpoint (exposes personal filenames) | Privacy risk found in audit | Private storage (Supabase) | N/A — not LI domain | N/A | ✅ Beat |

## Competitive Gap Summary

### What LI Directly Competes With

| VizCode | LI Equivalent | Status |
|---------|---------------|--------|
| Isolation Mode | Focus View | ✅ MVP |
| Code Library | Source View | ✅ MVP |
| Comparative Mode | Compare View | ✅ Phase 2 |
| Game Mode | Mistake Hunt + Board Drill | ✅ Phase 2-3 |
| Category Navigation | Coverage View | ✅ Phase 2 |
| AI Chatbot | Repair Path | ✅ Phase 3 (differentiated) |

### What LI Exceeds

| Capability | VizCode | LI |
|-----------|---------|-----|
| Spatial dimensionality | 2D static | 3D interactive |
| Source verification | Interpretive | Source-cited |
| Mobile access | Desktop-first warning | Responsive |
| Payment automation | Manual verification | Automated |
| Privacy/media hygiene | Exposes personal filenames | Private storage |

### What LI Doesn't Cover (Intentionally)

| Area | Reason |
|------|--------|
| Full text code library | SlateCamp Wiki handles text references |
| AI chatbot | Repair Path is source-grounded, not AI |
| Community/Discord | Separate SlateCamp community strategy |
| Pricing/plans | Separate SlateCamp commerce strategy |
| Blog/content marketing | Separate SlateCamp content strategy |
| Institutional sales | Separate SlateCamp B2B strategy |

## VizCode Weaknesses Exploitable by LI

| Weakness | LI Exploitation |
|----------|----------------|
| Static 2D diagrams | True 3D spatial interaction |
| "Diagrams reflect interpretation" | Source-verified citations on every element |
| Empty Terms page | Full trust/legal posture (separate, but referenced from LI) |
| Manual payment verification | Instant automated access |
| No mobile optimization | Responsive ViewportShell |
| Only 2 blog posts | Wiki articles with SEO value |
| AI without source citations | Repair Path is deterministic and source-grounded |
| 0% group discount at 12-month for 2-4 users | Real group pricing (separate strategy) |
| Personal media exposed publicly | Private asset storage |

## What VizCode Could Add (Future Risk)

These are features VizCode could potentially add that we should monitor:

| Potential VizCode Feature | LI Preparedness |
|--------------------------|-----------------|
| 3D models | LI already has superior 3D (R3F, Drei, Blender pipeline) |
| Source citations | Source card system is SlateCamp's moat |
| Better mobile support | ViewportShell already responsive |
| More content | Phase 1-4 content roadmap covers all topics |
| Better AI | SlateCamp's AI strategy (separate) should source-ground AI |
| Better trust docs | SlateCamp's trust docs (separate) should be ready before launch |
| Community features | SlateCamp's community strategy (separate) should connect to LI |

## Monitoring Plan

**Frequency**: Monthly competitive review
**Triggers**: Monitor VizCode's public REST API for new features, pages, or products
**Actions**: Update this gap analysis; adjust LI roadmap if VizCode adds significant new capability

**Key monitoring endpoints**:
- `https://vizcodeph.com/wp-json/wp/v2/pages` — new pages
- `https://vizcodeph.com/wp-json/wp/v2/posts` — new blog posts
- `https://vizcodeph.com/wp-json/wc/store/v1/products` — new products/pricing
- `https://vizcodeph.com/wp-json/llm-chat/v1/` — AI feature changes
