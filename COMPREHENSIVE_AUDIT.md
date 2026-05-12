# SlateCamp Comprehensive Codebase Audit

## Executive Summary

SlateCamp is a pre-launch MVP for LEA (Licensure Examination for Architects) preparation in the Philippines. It's a large, operationally mature Next.js 16 App Router application with 128 page routes, 86 database tables, 100 migrations, and extensive domain logic. This audit covers architecture, data layer, frontend systems, security, testing, and operational readiness.

---

## 1. Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.2.3 App Router, React 19.2.5, TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.2.4, shadcn/ui, Radix UI, Phosphor/Lucide icons, Framer Motion
- **Database/Auth**: Supabase/PostgreSQL, RLS, Supabase Auth
- **State**: Zustand (client stores) + Server Actions/queries (server)
- **3D**: React Three Fiber, drei, Three.js
- **Charts/Editors**: Recharts, TipTap, CodeMirror, Mermaid
- **Payments**: PayRex (deferred behind feature flag)
- **AI**: OpenAI/Anthropic provider abstraction (deferred)
- **Testing**: Bun test runner, Playwright, Storybook, Vitest
- **Package Manager**: Bun

### Request Flow
```
Request → middleware.ts (Edge)
  ├─ Static/API bypass
  ├─ Dev force-user bypass
  ├─ Demo mode → mock Supabase
  ├─ Auth check → supabase.auth.getUser()
  ├─ Unauthenticated → redirect to login
  └─ Privileged route → resolveRoleFromInputs() → policy check → allow/redirect

Server Component → createClient() (cached per request)
  ├─ getViewerEntitlements() → full entitlement snapshot
  ├─ queries/* → read-only data fetching
  └─ actions/* → "use server" mutations

Client Component → createClient() (browser)
  ├─ useFeatureFlag() → 3-layer resolution
  └─ Realtime subscriptions
```

### Key Architectural Patterns
1. **Feature-based organization**: `src/features/3d-lab/` is self-contained with own components, stores, hooks, config, types, utilities
2. **Sliced Zustand stores**: Quiz state split into SessionSlice/UISlice/StatsSlice/SettingsSlice; 3D Lab split into Navigation/Progress/View stores with facade
3. **Template pattern**: 3D Lab uses 7 template types with config-driven rendering and lazy-loaded registry
4. **MDX component registry**: Wiki uses 60+ component registry with lazy-loaded widgets and fallback processing
5. **Anti-inflation readiness**: 6-vector readiness score prevents gaming
6. **Sleep-aware sequencing**: Trail steps reordered by time-of-day (morning retrieval-first, evening new-content-first)
7. **CAGE patent chain**: Quiz submissions include gesture signal traces and binding tokens

---

## 2. Core Systems Audit

### 2.1 Quiz Engine v2
**Location**: `src/components/quiz-v2/`, `src/stores/useQuizStore.ts`, `src/lib/quiz/`, `src/lib/actions/quiz-v2/`

- **Store**: 834-line Zustand store with 4 slices managing 9 session states (idle → loading → intro → active → feedback → submitting → finalizing → results → review)
- **Modes**: 9 presets (camp, chill, subject, focus_review, custom, storm, full_exam, endurance, article_review)
- **Features**: Confidence rating, metacognitive predictions/postdictions, CAGE binding tokens, gesture capture, stamina tracking, cramming detection, micro-breaks, SRS integration
- **Server actions**: 27 files covering full lifecycle (start, submit, end, abandon, pause/resume, flag, skip, review, confidence, predictions)
- **Risk**: Large client store is a complexity risk noted in README

### 2.2 Wiki System
**Location**: `src/components/wiki/`, `src/lib/actions/wiki-*.ts`, `src/lib/wiki-markdown.ts`

- **Article rendering**: Server component compiles MDX with `next-mdx-remote/rsc`, injects EI prompts, sanitizes content
- **Component registry**: 60+ registered MDX component names, lazy-loaded widgets
- **Block types**: 41 content block components (callouts, data display, interactive, mistakes, structure, media, fallback, code)
- **Navigation**: Left sidebar (taxonomy tree), right sidebar (TOC, bookmarks, related topics), reading progress
- **Widgets**: BP344 accessibility widgets, DSGN-013 furniture clearance widgets, 3D Lab embeds
- **Markdown pipeline**: 417-line MDX processing with sanitization, normalization, fallback processing, heading extraction

### 2.3 3D Lab
**Location**: `src/features/3d-lab/`, `src/components/r3f/`

- **Architecture**: Self-contained feature module with components, stores, hooks, config, types, templates, scenes, utilities
- **Stores**: 11 store files (facade + navigation/progress/view/overlay/wall/nbcp/legacy)
- **Templates**: 7 types (parametric, exploded, floorplan, cutaway, animated, calculator, wall-configurator)
- **Type system**: 715-line type definition file
- **Scenes**: ClassicalOrders, FARPlayground, NBCPEnvelope
- **Performance**: Dedicated performance test suite, memory monitoring, WebGL error boundaries
- **Risk**: Performance-sensitive; many dedicated tests and perf scripts

### 2.4 Camp Trails
**Location**: `src/components/trails/`, `src/lib/actions/trails.ts`, `src/lib/queries/trails.ts`

- **Sequencing**: `sortStepsByBloom()` orders steps by Bloom's taxonomy (remember → understand → apply → analyze)
- **Sleep-aware**: Morning = retrieval-first, evening = new-content-first (Walker 2017 / Stickgold 2005)
- **Components**: 23 files covering library, detail, day view, step cards, completion moments

### 2.5 Analytics & Readiness
**Location**: `src/components/analytics/`, `src/lib/readiness-score.ts`, `src/lib/actions/analytics*.ts`

- **Readiness score**: 6-vector anti-inflation computation (diminishing returns, difficulty ceiling, grey node penalty, Bloom's cognitive ceiling, question bank depth weight, recency decay)
- **Components**: 74 files following Section + Chart pattern
- **Metrics**: IRT trajectory, calibration curves, stamina curves, forgetting curves, metacognition, error patterns, reading depth correlation

### 2.6 SRS / Spaced Repetition
**Location**: `src/lib/srs/`

- **SM-2 algorithm**: `calculateNextReview()` with quality 0-5, ease factor, interval
- **IRT**: 2-parameter logistic model for adaptive question selection at ~75% target probability
- **Ebbinghaus retention**: `retentionAfterDays()` for decay estimation
- **Quality derivation**: Maps correctness + response time + confidence + lucky-guess detection to SM-2 quality

### 2.7 Entitlements & Permissions
**Location**: `src/lib/entitlements/`

- **17-file subsystem** implementing precedence-based role resolution → policy evaluation → feature access
- **8 canonical roles**: anonymous, member, super_admin, content_admin, sme_reviewer, developer, admin, ceo, owner
- **19 granular admin permissions**: admin.content.view, admin.pipeline.manage, admin.users.manage, etc.
- **Feature resolution priority**: feature flag disabled → dev override → tooling policy → capability check → feature flag allowedTiers → paid feature key → default allow
- **Audit logging**: Every entitlement decision logged as `EntitlementAuditEvent`

### 2.8 Admin Portal
**Location**: `src/app/admin/`, `src/components/admin/`, `src/lib/actions/admin/`

- **Unified Editor**: Three-panel editor (Outline/Article/Questions) with auto-save, dirty state tracking, concurrent edit detection
- **Features**: Question management, wiki editing, taxonomy editing, asset management, pipeline, reviews, search, audit, settings, 3D models, AI audit
- **Access**: Gated by admin roles with fine-grained permissions

---

## 3. Data Layer Audit

### 3.1 Database Schema
**86 tables, 2 views, 39 functions** across 17 domain families:

| Domain | Tables | Key Concerns |
|--------|--------|-------------|
| Identity/access | 6 | profiles, user_roles, user_subscriptions, organizations |
| Learning graph | 5 | taxonomy_tree hierarchy, cross-references, prerequisites |
| Wiki/content | 9 | wiki_articles with MDX, EI prompts, bookmarks, highlights |
| Quiz/mastery | 23 | quiz_sessions, user_interactions, mastery, SRS, IRT, readiness |
| Trails | 7 | camp_trails hierarchy, enrollment, progress |
| 3D Lab | 2 | models_3d, spatial_hotspots |
| Design practice | 7 | design_problems, scenarios, sessions |
| Operations | 13 | notifications, feature_flags, notes, analytics_events |
| CEO/business | 4 | financial entries, gate status, team members |

### 3.2 RLS Policies
- **~369 policy definitions** across migrations
- **Pattern 1**: Owner-only access (most user data tables)
- **Pattern 2**: Public read / admin write (content tables)
- **Pattern 3**: Service role full access (webhook events, analytics)
- **Pattern 4**: Role-based access (CEO/admin tables)
- **Pattern 5**: Membership-based access (study pods)
- **Critical fix**: Migration `20260326_fix_rls_auth_uid_caching.sql` replaced direct `auth.uid()` with `(SELECT auth.uid())` subqueries to prevent plan cache issues

### 3.3 Supabase Client Architecture
- **4 clients**: browser (client.ts), server (server.ts with React.cache), admin (admin.ts), middleware (middleware.ts)
- **Demo mode**: Full mock Supabase client (731 lines) with query builder, filter matching, join hydration, RPC support, auth mock, storage mock
- **Bootstrap**: Auto-creates profiles, subscriptions, and global stats on first login

### 3.4 Migrations
- **101 migration files** in two naming eras (sequential numbered + timestamp-prefixed)
- Major themes: core schema, mastery/learning science, feature additions, RLS unification, admin RBAC, wiki enhancements, vector embeddings, data integrity constraints

---

## 4. Frontend Audit

### 4.1 Component Inventory
- **UI primitives**: 63 files in `src/components/ui/` (shadcn-based)
- **Shared components**: 66 files in `src/components/shared/`
- **Domain components**: quiz-v2 (50+), wiki (80+), admin (30+), analytics (74), trails (23), 3D Lab (40+)
- **Total**: 706 component files across 61 directories

### 4.2 Design System
- **Contract**: `DESIGN.md` with YAML tokens + prose doctrine
- **Typography**: Atkinson Hyperlegible (body), Plus Jakarta Sans (headlines), DM Mono (code)
- **Primary color**: Camp Cobalt `#1B3FC4`
- **Key rules**: No red for low scores, no rounded-2xl/3xl, no nested cards, 40px minimum interactive targets, prefers-reduced-motion required

### 4.3 Sidebar & Navigation
- **Push-layout** sidebar: 64px collapsed, 288px expanded, CSS clip-path transitions
- **Keyboard shortcuts**: Cmd+B toggle, Cmd+1-4 navigation
- **Active session guard**: Confirms before leaving during quiz
- **Route groups**: Learn, Explore, Practice, Data

### 4.4 State Management
- **Zustand stores**: useQuizStore (834 lines, 4 slices), useQuizTimerStore, useLabStore (facade over 3 sub-stores), useLabNavigationStore, useLabProgressStore, useLabViewStore, useOverlayStore, useWallLabStore, useNavigationPendingStore, useGlobalLoadingStore
- **Server state**: React.cache-wrapped Supabase queries, Server Actions for mutations
- **Demo mode**: Full mock data generation for 17+ tables

---

## 5. Security Audit

### 5.1 Authentication Flow
- Supabase Auth with SSR cookie management
- OAuth/email callback at `/auth/callback`
- Password reset at `/auth/reset-password`
- Onboarding flow with comp-exam score capture
- Demo mode bypass for testing

### 5.2 Authorization Model
- **Middleware-level**: Route gating for admin/developer/CEO paths
- **Server-level**: `resolveRoleFromInputs()` with 7-level precedence chain
- **Action-level**: `assertPermission()`, `requirePermissionOrRedirect()`
- **Feature-level**: `evaluateFeatureAccess()` with 7-step priority chain
- **Audit**: Every privileged access decision logged

### 5.3 Security Headers (next.config.ts)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- HSTS with preload
- Permissions-Policy: camera/microphone/geolocation disabled
- CSP with Supabase/Anthropic connect-src allowlisting

### 5.4 Known Security Concerns
- **Dev overrides**: `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, `ALLOW_DEV_PORTAL_BYPASS` are local/test-only but must not be enabled in production
- **Production guardrails**: `src/lib/env/production-guardrails.ts` checks and reports unsafe env vars
- **Rate limiting**: In-memory sliding window (10 req/min per key) for AI endpoints
- **Cron auth**: Bearer token verification for cron endpoints
- **Webhook idempotency**: `processed_webhook_events` table for PayRex webhook dedup

---

## 6. Testing Audit

### 6.1 Unit Tests
- **81 test files** across `src/` and `tests/`
- **Key test areas**: SRS (SM-2, IRT), entitlements, quiz engine, middleware, admin actions, calculators, 3D Lab
- **Runner**: Bun test (primary), Vitest (DOM tests)
- **Coverage**: V8 provider configured but no coverage reporter found

### 6.2 E2E Tests
- **18 Playwright specs** covering auth boundaries, admin permissions, 3D Lab, wiki, quiz, sidebar, CEO portal
- **Support utilities**: authenticated demo fixture, quiz gesture helpers, real DB seeding
- **Projects**: Desktop Chrome + Mobile Chromium (Pixel 7)

### 6.3 Performance Tests
- **13+ performance scripts** covering frontend runtime, API benchmarking, Supabase inventory, build startup, 3D Lab gates
- **3D Lab specific**: Auth timing, onboarding, smoke, mobile WebGL, fallbacks, layout/controls audit

### 6.4 Test Gaps
- No coverage reporter/enforcement
- Full `validate:release` and `test:e2e` not regularly run
- Some feature areas (notes, notifications, pods, daily dose) have minimal test coverage

---

## 7. Operational Infrastructure

### 7.1 CI/CD & Deployment
- **Build**: Custom `scripts/next-build.ts`
- **Vercel-compatible**: Cron endpoints at `/api/cron/*`
- **No CI config found**: No `.github/workflows/` or equivalent

### 7.2 Environment Management
- **25+ environment variables** documented
- **No `.env.example` file** (flagged as risk in CLAUDE.md)
- **Production guardrails**: `assertSafeProductionEnv()` checks for unsafe dev overrides

### 7.3 Content Pipeline
- **106 content audit scripts** in `scripts/content-audit/`
- **Full lifecycle**: Export → Normalize → Compose → Validate → Diff → Push → Apply → Rollback
- **50+ npm commands** for content operations
- **7 `.ai/` directories** (14-20) dedicated to content pipeline stages

### 7.4 Documentation System
- **21 numbered `.ai/` folders** plus 49 root-level docs
- **128 AGENTS.md files** throughout the repo
- **Canonical routing**: `.ai/00_system/ai-folder-canonical-map.md`
- **Three agent skill mirrors**: `.agents/skills/`, `.claude/skills/`, `.codex/skills/`

---

## 8. Known Issues & Risks

### 8.1 Pre-launch Blockers
| Issue | Severity | Status |
|-------|----------|--------|
| Payment provider deferred | Deferred | PayRex behind feature flag, not launch-blocking |
| Live AI provider deferred | Deferred | Demo/canned paths work, live AI not needed for launch |
| Supabase verification needed | High | Production config, migration replay, type regeneration |
| No `.env.example` | Medium | Risk of misconfigured deployments |

### 8.2 Technical Debt
| Issue | Severity | Notes |
|-------|----------|-------|
| Large quiz store (834 lines) | Medium | Complexity risk, needs refactoring |
| Legacy LemonSqueezy columns | Medium | Dormant columns in supabase.ts types, need DB cleanup decision |
| Broad route surface (118 pages) | Medium | CEO/developer/studio/pods/result-day/DAE surfaces still gated/internal |
| No CI configuration | Medium | No automated pipeline for type-check/lint/test/build |
| No coverage enforcement | Medium | Coverage thresholds configured but not enforced in CI |
| Mock Supabase client (731 lines) | Low-Medium | Comprehensive but maintenance burden |
| Content audit pipeline complexity | Low | 106 scripts, 50+ commands — powerful but steep learning curve |

### 8.3 Architecture Concerns
| Concern | Impact | Notes |
|---------|--------|-------|
| Server/Client boundary | Medium | Some components may have unnecessary "use client" directives |
| Demo mode complexity | Low-Medium | Full mock client is powerful but adds maintenance |
| Feature flag proliferation | Low | 27 feature keys, some may be stale |
| Migration count (101) | Low | Consider squashing for production setup |
| Zustand store size | Medium | Quiz store at 834 lines is the largest single state file |

---

## 9. Strengths

1. **Comprehensive entitlement system**: 17-file subsystem with audit logging, precedence-based resolution, and defense-in-depth
2. **Anti-inflation readiness score**: 6-vector system prevents gaming
3. **Sleep-aware trail sequencing**: Evidence-based study ordering
4. **Extensive RLS**: ~369 policies across all user-facing tables
5. **Demo mode**: Full mock Supabase client enables testing without backend
6. **Content pipeline**: 106 scripts for content lifecycle management
7. **3D Lab architecture**: Clean template pattern with lazy-loaded registry
8. **Wiki component system**: 60+ MDX components with fallback processing
9. **Production guardrails**: Unsafe env var detection, rate limiting, webhook idempotency
10. **Documentation**: Extensive `.ai/` system with 21 numbered folders and 128 AGENTS.md files

---

## 10. Recommendations

### Immediate (Pre-launch)
1. **Create `.env.example`** with all required/optional variables documented
2. **Run full `validate:release`** and address any failures
3. **Verify Supabase production config**: config.toml, migration replay, type regeneration
4. **Decide on legacy LemonSqueezy columns**: Remove or document as dormant
5. **Add CI configuration**: GitHub Actions or equivalent for type-check/lint/test/build

### Short-term (Post-launch)
1. **Refactor quiz store**: Split into smaller, focused stores or reduce to essential state
2. **Add coverage enforcement**: Configure coverage reporting and minimum thresholds
3. **Squash migrations**: Consider migration squash for production setup simplicity
4. **Audit "use client" boundaries**: Ensure server components are used by default
5. **Review feature flags**: Remove stale flags, document active ones

### Medium-term
1. **Reduce route surface**: Decide which gated/internal routes to keep or remove
2. **Extract content pipeline**: Consider separate package/repo for 106 content audit scripts
3. **Add E2E coverage**: Notes, notifications, pods, daily dose areas need test coverage
4. **Performance monitoring**: Add production performance monitoring beyond the current perf scripts
5. **Documentation consolidation**: 128 AGENTS.md files and 21 `.ai/` folders may need pruning

---

## 11. File Reference Index

### Critical Configuration
- `middleware.ts` — Edge middleware (auth, redirects, path propagation)
- `next.config.ts` — Security headers, redirects, Turbopack config
- `DATABASE_SCHEMA.sql` — 86 tables, 2 views, 39 functions
- `DESIGN.md` — Design system contract (tokens + doctrine)
- `CLAUDE.md` — Policy file (20 sections)
- `AGENTS.md` — Repository-level governance

### Core Architecture
- `src/lib/supabase/middleware.ts` — 6-phase auth pipeline
- `src/lib/entitlements/` — 17-file entitlement subsystem
- `src/lib/demo/` — 4-file demo mode system
- `src/lib/routes.ts` — 436-line route constants
- `src/lib/readiness-score.ts` — 6-vector anti-inflation readiness

### Key Domain Systems
- `src/stores/useQuizStore.ts` — 834-line quiz state
- `src/lib/quiz/mode-presets.ts` — 9 quiz mode configs
- `src/lib/srs/` — SM-2, IRT, retention algorithms
- `src/lib/focus-review/` — Weak-node queue generation
- `src/lib/ai/provider.ts` — Multi-provider AI abstraction
- `src/lib/payments/provider.ts` — Payment provider factory
- `src/lib/payrex/config.ts` — PayRex config (deferred)

### Frontend Systems
- `src/components/sidebar/` — Push-layout sidebar with keyboard shortcuts
- `src/components/quiz-v2/` — Full quiz engine UI
- `src/components/wiki/` — Wiki article rendering + 60+ MDX components
- `src/features/3d-lab/` — Self-contained 3D Lab module
- `src/components/analytics/` — 74 analytics chart components
- `src/components/admin/unified-editor/` — Three-panel content editor

### Data Layer
- `src/types/supabase.ts` — Auto-generated Supabase types
- `src/types/app.ts` — 833-line core domain types
- `src/types/quiz-config.ts` — 406-line quiz config types
- `src/lib/actions/` — 64 top-level + 11 subdirectory action files
- `src/lib/queries/` — Read-only data access functions

### Testing
- `vitest.config.ts` — Vitest configuration
- `playwright.config.ts` — E2E test configuration
- `.ai/00_performance/` — Performance test scripts and configs
- `e2e/` — 18 E2E spec files