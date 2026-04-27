import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { ensurePerfDirs, PERF_DIR, RESULTS_DIR, writeMarkdown, safeJsonFile } from './perf-utils.mjs'

ensurePerfDirs()
const now = () => new Date().toISOString()
const readJson = (name) => {
  const file = path.join(RESULTS_DIR, name)
  if (!existsSync(file)) return null
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}
const code = (value) => '`' + value + '`'
const fmtMs = (v) => Number.isFinite(v) ? Math.round(v) + ' ms' : 'n/a'
const fmtKiB = (v) => Number.isFinite(v) ? (v / 1024).toFixed(1) + ' KiB' : 'n/a'
const fmtNum = (v) => Number.isFinite(v) ? String(Math.round(v)) : 'n/a'
const md = (name, lines) => writeMarkdown(path.join(PERF_DIR, name), lines.join('\n'))

const environment = readJson('environment.json')
const inventory = readJson('inventory.json')
const nav = readJson('frontend_navigation_results.json')
const flows = readJson('frontend_user_flows_results.json')
const finalFrontendFailure = readJson('final_frontend_failure.json')
const fullFrontendVerification = readJson('full_frontend_verification_after_metadata.json')
const dashboardComparison = readJson('dashboard_remediation_frontend_comparison.json')
const supabaseTightening = readJson('supabase_query_tightening_before_after.json')
const labBundleAfter = readJson('3d_lab_bundle_after_direct_imports.json')
const api = readJson('api_benchmark_results.json')
const supabase = readJson('supabase_query_inventory.json')
const supabaseLatency = readJson('supabase_latency_results.json')
const build = readJson('build_startup_results.json')
const hotspots = readJson('component_hotspot_inventory.json')

const missing = [
  ['environment.json', environment],
  ['inventory.json', inventory],
  ['frontend_navigation_results.json', nav],
  ['frontend_user_flows_results.json', flows],
  ['api_benchmark_results.json', api],
  ['supabase_query_inventory.json', supabase],
  ['build_startup_results.json', build],
  ['component_hotspot_inventory.json', hotspots],
].filter((entry) => !entry[1]).map((entry) => entry[0])

const slowestRoutes = nav?.routeSummaries ? [...nav.routeSummaries].sort((a, b) => (b.cold?.p95 ?? -1) - (a.cold?.p95 ?? -1)).slice(0, 10) : []
const largestRoutes = nav?.routeSummaries ? [...nav.routeSummaries].sort((a, b) => (b.transferredBytes?.p50 ?? -1) - (a.transferredBytes?.p50 ?? -1)).slice(0, 10) : []
const slowestApis = api?.endpointSummaries ? [...api.endpointSummaries].sort((a, b) => (b.latencyMs?.p95 ?? -1) - (a.latencyMs?.p95 ?? -1)).slice(0, 10) : []
const routeRows = slowestRoutes.map((r) => '| ' + code(r.route) + ' | ' + fmtMs(r.cold?.p50) + ' | ' + fmtMs(r.cold?.p95) + ' | ' + fmtMs(r.warm?.p50) + ' | ' + fmtMs(r.fcp?.p50) + ' | ' + fmtMs(r.lcp?.p50) + ' | ' + fmtNum(r.requests?.p50) + ' | ' + fmtKiB(r.transferredBytes?.p50) + ' | ' + (r.errorCount ?? 0) + ' |')
const apiRows = slowestApis.map((e) => '| ' + code(e.endpoint) + ' | ' + (e.statusCodes?.join(', ') || 'n/a') + ' | ' + (e.runCount ?? 0) + ' | ' + fmtMs(e.latencyMs?.p50) + ' | ' + fmtMs(e.latencyMs?.p95) + ' | ' + (e.usesSupabase ? 'yes' : 'no') + ' | ' + (e.usesAuth ? 'yes' : 'no') + ' |')
const assetRows = build?.largestStaticAssets?.slice(0, 10).map((a) => '| ' + code(a.file) + ' | ' + fmtKiB(a.bytes) + ' |') ?? []
const flowRows = flows?.runs?.map((f) => '| ' + f.name + ' | ' + f.status + ' | ' + fmtMs(f.durationMs) + ' | ' + (f.blocker ?? f.error ?? '') + ' |') ?? []
const resourceRows = nav?.runs ? nav.runs.flatMap((run) => (run.resources?.slowest ?? []).map((resource) => ({ route: run.route, ...resource })))
  .sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
  .slice(0, 20)
  .map((r) => '| ' + code(r.route) + ' | ' + (r.initiatorType ?? 'unknown') + ' | ' + fmtMs(r.duration) + ' | ' + fmtKiB(r.transferSize) + ' | ' + code(String(r.name ?? '').replace(process.cwd(), '').slice(0, 120).replace(/\|/g, '\\|')) + ' |') : []

const fullFrontendPassed = fullFrontendVerification?.status === 'passed'
const fullFrontendLatestText = fullFrontendPassed
  ? 'Latest full `bun run perf:frontend` completed all Playwright performance tests with exit 0; memory-threshold restart warning still observed.'
  : (finalFrontendFailure?.failure ?? 'Final frontend verification failed on /dashboard/3d-lab, and static audit still shows broad 3D registry/config surface.')

const bottlenecks = [
  ['3D Lab dev-server runtime/memory remains warning-only after full-suite recovery', 'src/app/dashboard/3d-lab/page.tsx; src/features/3d-lab/components/*; src/features/3d-lab/config/registry/*', fullFrontendLatestText, nav?.routeSummaries?.find((r) => r.route === '/dashboard/3d-lab') ? 'Latest 3D Lab cold p95 ' + fmtMs(nav.routeSummaries.find((r) => r.route === '/dashboard/3d-lab').cold?.p95) + '; warm p95 ' + fmtMs(nav.routeSummaries.find((r) => r.route === '/dashboard/3d-lab').warm?.p95) : '3D Lab route metric unavailable or blocked.', 'No longer blocks this exact full-suite run, but high dev cold variance and memory warnings still threaten reliable regression gating.', 'high', 'medium', 'medium', 'Keep 3D in warning-only full-suite measurement, preserve route-isolated lane, and compare heap/chunk data before hard gating.'],
  ['Supabase broad-read and missing-limit candidates remain after first tightening pass', 'results/supabase_query_inventory.json and 07_supabase_database.md', (supabase?.summary?.selectStarCount ?? 'n/a') + ' select-star candidate(s), ' + (supabase?.summary?.unboundedReadCandidates ?? 'n/a') + ' unbounded read candidate(s), ' + (supabase?.summary?.clientSideQueryBlocks ?? 'n/a') + ' client query block(s).', supabaseLatency?.status ?? 'Live latency blocked until safe read-only credentials exist.', 'Can inflate payloads, RLS work, network bytes, and waterfall latency.', 'medium', 'varies', 'medium-high', 'Continue explicit columns/limits on high-traffic paths, then run targeted EXPLAIN and route perf tests.'],
  ['Admin content/editor surfaces overfetch and render large lists without virtualization', 'src/lib/actions/admin/content.ts; src/components/admin/unified-editor/QuestionsPanel.tsx; taxonomy tree/picker components', 'Static audit found broad admin content loads, a 1481-line QuestionsPanel, and unvirtualized list/grouping risks.', 'Privileged admin runtime metric requires safe role fixture.', 'Affects internal content operations and editor responsiveness.', 'medium', 'medium-hard', 'medium', 'Measure admin routes with privileged fixtures; add pagination/virtualization; remeasure.'],
  ['AI/API routes need mocked latency/error budget benchmarks after timeout wrappers', 'src/app/api/ai/*/route.ts; src/lib/ai/provider.ts; payment/webhook routes', 'Provider fetch timeout wrappers were added, but mutation/AI/payment POST benchmarks remain blocked without safe mocked/staging fixtures.', 'Mutation/AI POST endpoints were not called by safe benchmark harness.', 'Can create long tail waits and serverless duration risk.', 'medium', 'medium', 'medium', 'Add mocked provider latency benchmarks; track p95/p99 and timeout rate.'],
  ['Cron routes include N+1/per-user scaling patterns', 'src/app/api/cron/compute-signals/route.ts; src/app/api/cron/focus-review-scan/route.ts', 'API/backend audit found loops over active users with multiple DB calls per user; focus-review timestamp schema mismatch was fixed but scaling remains unmeasured.', 'Cron endpoints require secret and were not automatically called.', 'Operational timeout risk grows with active users.', 'medium-high', 'medium-hard', 'high', 'Measure on local seeded DB by user count and compare batch/RPC refactor.'],
  ['Bundle-heavy route families need analyzer-backed budgets', 'analytics, wiki, admin editor, notes, 3D Lab; Mermaid/CodeMirror/Tiptap/Recharts imports', 'Build and hotspot scans show tracked heavy dependencies and large build artifacts; direct 3D imports reduced hub manifest bytes but registry metadata split remains open.', build?.build?.summary ? 'Build p50 ' + fmtMs(build.build.summary.p50) + '; largest static ' + fmtKiB(build.largestStaticAssets?.[0]?.bytes) : 'Build metrics missing.', 'Large JS chunks harm cold route load and interaction readiness.', 'medium', 'varies', 'low-medium', 'Add route bundle budgets and rerun perf:build plus perf:frontend.'],
  ['Dashboard sync dedupe needs production-auth monitoring', 'src/components/dashboard/DashboardAnalyticsSync.tsx; src/lib/actions/dashboard-page.ts; src/app/dashboard/page.tsx', dashboardComparison?.summary ? 'Local comparison after sync-payload split shows cold p95 delta ' + fmtMs(dashboardComparison.summary.coldP95Ms?.delta) + ' (' + dashboardComparison.summary.coldP95Ms?.deltaPercent + '%).' : 'Dashboard remediation comparison unavailable.', nav?.routeSummaries?.find((r) => r.route === '/dashboard') ? 'Dashboard cold p95 ' + fmtMs(nav.routeSummaries.find((r) => r.route === '/dashboard').cold?.p95) : 'Dashboard runtime metric unavailable or blocked.', 'Dashboard is the primary authenticated landing page; the local fix needs credentialed production-like confirmation.', 'medium', 'easy', 'low-medium', 'Rerun dashboard route/user-flow p95 with safe auth fixture and compare request counts/server logs.'],
]

safeJsonFile(path.join(RESULTS_DIR, 'baseline_summary.json'), {
  timestamp: now(),
  missingInputs: missing,
  environment: environment ? { gitCommit: environment.gitCommit, branch: environment.branch, os: environment.os, versions: environment.versions } : null,
  inventoryCounts: inventory?.counts ?? null,
  frontendSummary: nav?.summary ?? null,
  apiSummary: api?.summary ?? null,
  supabaseSummary: supabase?.summary ?? null,
  buildSummary: build?.build ?? null,
  hotspotSummary: hotspots?.byCategory ?? null,
  bottlenecks: bottlenecks.map((b, i) => ({ rank: i + 1, title: b[0], location: b[1], evidence: b[2], metricBefore: b[3], impact: b[4], confidence: b[5], ease: b[6], risk: b[7], verify: b[8] })),
})

md('03_baseline_summary.md', [
  '# 03 — Baseline Summary', '', 'Generated: ' + now(), '',
  '## Evidence completeness', missing.length ? 'Missing/blocked result files: ' + missing.map(code).join(', ') + '.' : 'All expected machine-readable result files were present at summary time.', '',
  '## Environment', '- Commit: ' + code(environment?.gitCommit ?? 'unknown'), '- Branch: ' + code(environment?.branch ?? 'unknown'), '- Runtime: Node ' + (environment?.versions?.node ?? 'unknown') + ', Bun ' + (environment?.versions?.bun ?? 'unknown') + ', Playwright ' + (environment?.versions?.playwright ?? 'unknown'), '',
  '## Inventory counts', '- Pages: ' + (inventory?.counts?.pages ?? 'n/a'), '- Route handlers: ' + (inventory?.counts?.routeHandlers ?? 'n/a'), '- Loading files: ' + (inventory?.counts?.loading ?? 'n/a'), '- Client components: ' + (inventory?.counts?.clientComponents ?? 'n/a'), '- Server-action-like files: ' + (inventory?.counts?.serverActionLikeFiles ?? 'n/a'), '',
  '## Frontend baseline', '- Cold route duration p50/p95: ' + fmtMs(nav?.summary?.coldDurationMs?.p50) + ' / ' + fmtMs(nav?.summary?.coldDurationMs?.p95), '- Warm route duration p50/p95: ' + fmtMs(nav?.summary?.warmDurationMs?.p50) + ' / ' + fmtMs(nav?.summary?.warmDurationMs?.p95), '- FCP p50/p95: ' + fmtMs(nav?.summary?.fcpMs?.p50) + ' / ' + fmtMs(nav?.summary?.fcpMs?.p95), '- LCP proxy p50/p95: ' + fmtMs(nav?.summary?.lcpMs?.p50) + ' / ' + fmtMs(nav?.summary?.lcpMs?.p95), '- Request count p50/p95: ' + fmtNum(nav?.summary?.requestCount?.p50) + ' / ' + fmtNum(nav?.summary?.requestCount?.p95), '- Transfer p50/p95: ' + fmtKiB(nav?.summary?.transferredBytes?.p50) + ' / ' + fmtKiB(nav?.summary?.transferredBytes?.p95), '',
  '### Slowest measured routes by cold p95', '| Route | Cold p50 | Cold p95 | Warm p50 | FCP p50 | LCP p50 | Requests p50 | Transfer p50 | Errors |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |', ...(routeRows.length ? routeRows : ['| no route measurements available | | | | | | | | |']), '',
  '## API/backend baseline', '- Server reachable: ' + (api?.serverReachable === true ? 'yes' : api?.serverReachable === false ? 'no' : 'unknown'), '- API total duration p50/p95: ' + fmtMs(api?.summary?.p50) + ' / ' + fmtMs(api?.summary?.p95), '', '| Endpoint | Status codes | Runs | p50 | p95 | Supabase | Auth |', '| --- | --- | ---: | ---: | ---: | --- | --- |', ...(apiRows.length ? apiRows : ['| no API latency measurements available | | | | | | |']), '',
  '## Supabase/static database baseline', '- Query blocks: ' + (supabase?.totalFromQueryBlocks ?? 'n/a'), '- Tables/targets touched: ' + (supabase?.summary?.tablesTouched ?? 'n/a'), '- select-star candidates: ' + (supabase?.summary?.selectStarCount ?? 'n/a'), '- Missing-limit candidates: ' + (supabase?.summary?.unboundedReadCandidates ?? 'n/a'), '- Live latency: ' + (supabaseLatency?.status ?? 'not recorded'), '',
  '## Build/bundle baseline', '- Build exit codes: ' + (build?.build?.runs?.map((run) => run.exitCode).join(', ') || 'n/a'), '- Build p50/p95: ' + fmtMs(build?.build?.summary?.p50) + ' / ' + fmtMs(build?.build?.summary?.p95), '- Typecheck p50: ' + fmtMs(build?.typeCheck?.summary?.p50), '', '| Largest static asset | Size |', '| --- | ---: |', ...(assetRows.length ? assetRows : ['| no build asset data | |']), '',
  '## Hotspot baseline', 'Static hotspot category counts live in ' + code('results/component_hotspot_inventory.json') + '.', ...(hotspots?.byCategory ? Object.entries(hotspots.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => '- ' + k + ': ' + v) : ['- Not available.'])
])

md('08_auth_and_user_wait.md', [
  '# 08 — Auth and Perceived User Wait', '', 'Generated: ' + now(), '',
  '## User-flow timing results', '| Flow | Status | Duration | Blocker/error |', '| --- | --- | ---: | --- |', ...(flowRows.length ? flowRows : ['| no user-flow measurements available | | | |']), '',
  '## Wait classification', '| Wait surface | Classification | Evidence | Notes |', '| --- | --- | --- | --- |',
  '| App start to first visible UI | blocking-to-visible | Playwright user-flow proxy and route timing | Measured without real login secrets. |',
  '| App start to authenticated state known | blocking auth/session wait | Middleware Supabase session update/getUser and dashboard user requirement | Demo auth measures route behavior; real auth latency needs test credentials. |',
  '| App start to primary dashboard data visible | skeleton/loading + server data wait | Dashboard route/user-flow metrics and server data actions | Duplicate client analytics sync is a suspected avoidable wait. |',
  '| Login submit to success UI | blocked/partially measured | Demo auth redirect can be measured | Real credentialed login blocked unless safe test account is supplied. |',
  '| Signup submit to success UI | blocked | No safe signup fixture provided | Use disposable staging credentials and redact values. |',
  '| Logout submit to logged-out UI | blocked | Not covered by current perf suite | Add safe demo-auth logout flow. |',
  '| Route transition to usable page | loading/skeleton wait | Route loading files and Playwright timings | Add usability selectors for stricter meaningful-interaction timing. |',
  '| Search/filter/sort to results updated | interaction wait | Wiki search proxy in demo auth | Add route-specific selectors for admin tables/wiki results. |',
  '| Mutation to visible result/server state | blocked | Mutation endpoints/actions intentionally not called | Add non-production fixtures before measuring writes. |', '',
  '## Loading-state review', '- Inventory found ' + (inventory?.counts?.loading ?? 'n/a') + ' loading files.', '- Loading states should be paired with data-visible budgets so they do not hide regressions.', '- Admin/developer/CEO waits need safe role fixtures before full measurement.'
])

md('09_network_and_caching.md', [
  '# 09 — Network and Caching', '', 'Generated: ' + now(), '',
  '## Network baseline from Playwright resource timing', '- Request count p50/p95: ' + fmtNum(nav?.summary?.requestCount?.p50) + ' / ' + fmtNum(nav?.summary?.requestCount?.p95), '- Transfer p50/p95: ' + fmtKiB(nav?.summary?.transferredBytes?.p50) + ' / ' + fmtKiB(nav?.summary?.transferredBytes?.p95), '',
  '## Largest measured route transfers', '| Route | Transfer p50 | Requests p50 | Cold p95 |', '| --- | ---: | ---: | ---: |', ...(largestRoutes.length ? largestRoutes.map((r) => '| ' + code(r.route) + ' | ' + fmtKiB(r.transferredBytes?.p50) + ' | ' + fmtNum(r.requests?.p50) + ' | ' + fmtMs(r.cold?.p95) + ' |') : ['| no route transfer data | | | |']), '',
  '## Slowest individual resource timings', '| Route | Type | Duration | Transfer | Resource |', '| --- | --- | ---: | ---: | --- |', ...(resourceRows.length ? resourceRows : ['| no resource timing data | | | | |']), '',
  '## Caching architecture evidence', '- Next config defines global security headers and image remote patterns.', '- Inventory found ' + (inventory?.dataFetchingArchitecture?.cachingFiles?.length ?? 'n/a') + ' files with cache/revalidation/browser-storage signals.', '- Dashboard and taxonomy/wiki loaders include unstable_cache usage per static backend audit.', '- Middleware updates Supabase session for non-static/image routes, affecting route TTFB.', '- Supabase query scan found ' + (supabase?.summary?.unboundedReadCandidates ?? 'n/a') + ' possible broad reads.', '',
  '## Cache risks', '1. Some cached data may be requested again from client effects.', '2. API route handlers do not expose explicit revalidate/runtime/maxDuration metadata in inventory.', '3. External AI/payment/provider calls need explicit timeout and cache/non-cache decisions.', '4. Production response headers should be measured separately from local dev.'
])

md('12_regression_testing_plan.md', [
  '# 12 — Regression Testing Plan', '', 'Generated: ' + now(), '',
  '## Repeatable commands', ...['perf:inventory','perf:environment','perf:frontend','perf:api','perf:supabase','perf:build','perf:hotspots','perf:summary','perf:all'].map((s) => '- ' + code('bun run ' + s)), '',
  '## What should run where', '| Test | CI? | Manual? | Reason |', '| --- | --- | --- | --- |',
  '| Inventory/static scans | yes | yes | Fast, deterministic, catches route/query drift. |', '| Supabase static query inventory | yes | yes | Read-only and no credentials needed. |', '| Hotspot static scan | yes warning-only | yes | Static signals are useful but not pass/fail proof. |', '| Build/typecheck perf | yes warning-only initially | yes | Build time is environment-dependent. |', '| Frontend Playwright route perf | nightly or pre-release | yes | Valuable but variance requires tolerance. |', '| API GET benchmark | nightly when test server available | yes | Needs reachable target and fixtures. |', '| Live Supabase EXPLAIN/latency | no by default | yes/staging | Requires safe read-only credentials. |', '| AI/payment provider timing | no by default | yes with mocks/staging | External noise and secrets make normal CI unsuitable. |', '',
  '## Baseline update workflow', '1. Run ' + code('bun run perf:all') + ' on a clean machine or CI runner.', '2. Store JSON artifacts under ' + code('.ai/00_performance/results') + '.', '3. Compare p50/p75/p95/p99 and error/timeout rates.', '4. Update baseline docs only with measured evidence.', '5. Do not loosen budgets without noting product reason and evidence.'
])

md('13_ci_perf_gates.md', [
  '# 13 — CI Performance Gates', '', 'Generated: ' + now(), '',
  '## Gate philosophy', 'Initial CI gates should be warning-first and based on current baseline plus tolerance. Hard failures should wait for at least 3 comparable CI baseline runs.', '',
  '## Proposed budgets', '| Metric | Current baseline | Warning threshold | Failure threshold | Notes |', '| --- | ---: | ---: | ---: | --- |',
  '| Frontend cold route p95 | ' + fmtMs(nav?.summary?.coldDurationMs?.p95) + ' | baseline + 20% | baseline + 35% | Use per-route budgets when stable. |',
  '| Frontend warm route p95 | ' + fmtMs(nav?.summary?.warmDurationMs?.p95) + ' | baseline + 20% | baseline + 35% | Warm regressions often indicate JS/render bloat. |',
  '| Route request count p95 | ' + fmtNum(nav?.summary?.requestCount?.p95) + ' | baseline + 10 requests | baseline + 20 requests | Gate by route family after history exists. |',
  '| Route transfer p95 | ' + fmtKiB(nav?.summary?.transferredBytes?.p95) + ' | baseline + 15% | baseline + 30% | Prefer built app for CI. |',
  '| API GET p95 | ' + fmtMs(api?.summary?.p95) + ' | baseline + 20% | baseline + 40% | Static GET endpoints only. |',
  '| Build time p95 | ' + fmtMs(build?.build?.summary?.p95) + ' | baseline + 15% | baseline + 30% | Runner-specific. |',
  '| Typecheck duration | ' + fmtMs(build?.typeCheck?.summary?.p50) + ' | baseline + 20% | baseline + 40% | Less noisy than Playwright. |',
  '| Supabase select-star count | ' + (supabase?.summary?.selectStarCount ?? 'n/a') + ' | any increase | high-traffic increase | Needs allowlist. |',
  '| Supabase missing-limit candidates | ' + (supabase?.summary?.unboundedReadCandidates ?? 'n/a') + ' | high-traffic increase | high-traffic increase | Needs allowlist. |', '',
  '## Recommended CI commands', '- Pull request warning lane: ' + code('bun run perf:inventory && bun run perf:supabase && bun run perf:hotspots && bun run perf:summary'), '- Nightly baseline lane: ' + code('PLAYWRIGHT_USE_BUILT_APP=true bun run perf:frontend && bun run perf:api && bun run perf:build && bun run perf:summary'), '- Release lane: full ' + code('bun run perf:all') + ' against production-like build and safe staging credentials.'
])

const bottleneckTable = bottlenecks.map((b, i) => '| ' + (i + 1) + ' | ' + b[0] + ' | ' + b[4] + ' | ' + b[5] + ' | ' + b[6] + ' | ' + b[7] + ' |')
const bottleneckDetails = bottlenecks.flatMap((b, i) => ['', '## ' + (i + 1) + '. ' + b[0], '', '- Location: ' + b[1], '- Evidence: ' + b[2], '- Metric before: ' + b[3], '- Why it matters: ' + b[4], '- Suspected cause: ' + b[0], '- Recommended fix: see ' + code('15_recommendations.md') + ' and use measurement-backed reversible changes.', '- Expected impact: reduce p95 wait, payload, or operational timeout risk.', '- Verify fix: ' + b[8], '- Timing: ' + (i < 3 ? 'fix now or next performance sprint' : i < 6 ? 'this week/month after fixture coverage' : 'monitor and budget')])
md('14_bottlenecks_ranked.md', ['# 14 — Ranked Bottlenecks', '', 'Generated: ' + now(), '', '## Ranking table', '| Rank | Bottleneck | User impact | Confidence | Ease of fix | Risk of fix |', '| ---: | --- | --- | --- | --- | --- |', ...bottleneckTable, ...bottleneckDetails])

md('15_recommendations.md', [
  '# 15 — Recommendations', '', 'Generated: ' + now(), '',
  '## Immediate quick wins', '1. Keep the performance harness in CI as warning-only: perf:inventory, perf:supabase, perf:hotspots, perf:summary.', '2. Add allowlists/comments for intentional Supabase broad reads and select-star usage.', '3. Add route-specific primary-content-visible selectors.', '4. Keep AI provider timeout wrappers covered and add mocked timeout/error benchmarks for AI/payment flows.', '',
  '## Measurement/instrumentation improvements', '1. Run frontend perf against PLAYWRIGHT_USE_BUILT_APP=true for production-like numbers.', '2. Add safe staging/demo credential mechanism for real auth timings without storing secrets.', '3. Add API fixture params for dynamic GET routes and mock/staging modes for POST endpoints.', '4. Add dated history folders and a compare script.', '',
  '## Frontend rendering improvements', '1. Profile then virtualize/paginate admin question lists and taxonomy trees.', '2. Split heavy editors/charts/diagram engines behind dynamic imports where tab-gated/below-fold.', '3. Replace obvious per-frame allocations in 3D useFrame loops with reused refs.', '4. Add explicit dimensions/lazy/decoding or next/image for stable raw images.', '',
  '## Data loading improvements', '1. Validate the compact dashboard analytics sync payload under production-like auth and keep server-rendered data authoritative.', '2. Review sequential awaits and parallelize only truly independent calls.', '3. Add per-route request-count and data-visible budgets.', '',
  '## Supabase/database improvements', '1. Tighten high-traffic explicit column lists and add limits/ranges.', '2. Run read-only EXPLAIN for dashboard, admin content, analytics, quiz, and CEO query shapes.', '3. Verify migration/schema drift on performance indexes.', '4. Prefer RPC/materialized views for cron/user-wide analytics loops.', '',
  '## API/backend improvements', '1. Extend timeout/error-rate metrics to mocked AI providers and payment/webhook paths.', '2. Add safe API benchmarks for AI/payment routes with mocked providers.', '3. Rework cron N+1 loops into batch queries/RPCs once measured.', '',
  '## Bundle/build improvements', '1. Add bundle analyzer on wiki/admin/3D/analytics route families.', '2. Split 3D module metadata from full config imports.', '3. Dynamically load CodeMirror/Tiptap/Mermaid/Recharts where interaction permits.', '',
  '## Caching improvements', '1. Document cache intent for each high-traffic loader and route handler.', '2. Add stale/revalidate tags where current behavior is intentionally cached.', '3. Measure production headers for HTML/RSC/chunks/images/fonts.', '',
  '## UX/perceived performance improvements', '1. Measure data-visible time so skeletons do not hide backend regressions.', '2. Add optimistic UI timing measurements for safe mutation flows.', '3. Ensure auth-gated redirects are fast and do not flash misleading loading states.', '',
  '## CI/regression prevention', '1. Warning-only static perf gates now; hard fail after three stable baselines.', '2. Per-route budgets for /, /dashboard, /dashboard/wiki, /dashboard/analytics, /dashboard/3d-lab, /admin, and quiz session flows.', '3. API p95 and 5xx gates for safe GET endpoints.', '',
  '## Prioritized action plan', '### Today', '- Report and keep the performance harness plus baseline.', '- Rerun frontend with a built app if a production-like baseline is needed.', '- Add exact blockers for unavailable live credentials.', '', '### This week', '- Add safe fixtures for auth, dynamic routes, and mutation benchmarks.', '- Tighten obvious high-traffic Supabase query shapes and remeasure.', '- Add mocked timeout/error-rate tests for AI endpoints and extend timeout budgets to payment/webhook paths where needed.', '', '### This month', '- Split 3D config metadata and virtualize admin/taxonomy heavy lists.', '- Add bundle analyzer budgets and CI history comparison.', '- Batch cron/user-wide analytics queries.', '', '### Longer-term', '- Add production RUM/Core Web Vitals and backend tracing.', '- Add Supabase query performance dashboards using safe aggregated telemetry.', '- Build a performance dashboard from results/history.'
])

const blockers = []
if (!nav) blockers.push(['Frontend route measurement', 'Playwright perf results missing or failed.', 'Run PLAYWRIGHT_DEMO_AUTH=true bun run perf:frontend.'])
if (finalFrontendFailure?.status === 'blocked' && !fullFrontendPassed) blockers.push(['Final full frontend verification', finalFrontendFailure.failure ?? 'Final bun run perf:frontend failed.', 'Treat the preserved partial run as failure evidence; isolate /dashboard/3d-lab with built-app and memory profiling before requiring the full dev-server suite to pass.'])
if (fullFrontendVerification?.memoryThresholdRestartObserved) blockers.push(['3D Lab full-suite memory warning', 'Latest full perf:frontend passed, but Next dev server still emitted a memory-threshold restart warning near the dashboard/analytics/3D segment.', 'Keep /dashboard/3d-lab warning-only, collect heap profiles, and require three comparable green full-suite runs before hard gating.'])
if (!api?.serverReachable) blockers.push(['API latency measurement', 'Server not reachable at ' + (api?.baseUrl ?? 'configured base URL') + '.', 'Start local server or set PERF_BASE_URL, then run bun run perf:api.'])
if (supabaseLatency?.status?.includes('blocked')) blockers.push(['Live Supabase latency/EXPLAIN', 'No safe read-only DB/test credentialed execution path was used.', 'Provide local seeded Supabase or staging read-only role and run targeted EXPLAIN manually.'])
if (!flows?.demoAuthEnabled) blockers.push(['Real auth/login/signup timing', 'No test credentials stored/provided; demo auth may be disabled.', 'Use externally supplied staging credentials or demo auth without logging values.'])
blockers.push(['Real Supabase Auth provider latency', 'Demo auth can measure authenticated screens without secrets, but it does not measure real Supabase Auth provider latency or credential-submit timing.', 'Use externally supplied staging/test credentials via PLAYWRIGHT_TEST_EMAIL/PLAYWRIGHT_TEST_PASSWORD or admin equivalents; never store values.'])
blockers.push(['OMX tmux team runtime', 'Current surface is Codex App/native outside tmux; tmux team panes cannot be launched here.', 'Run from attached OMX CLI tmux shell if durable team-pane coordination is required.'])
const gitnexusLog = path.join(PERF_DIR, 'logs/gitnexus-help.log')
if (existsSync(gitnexusLog)) {
  const gitnexusText = readFileSync(gitnexusLog, 'utf8')
  if (/npm error|Cannot destructure|not found/i.test(gitnexusText)) {
    blockers.push(['GitNexus detect_changes', 'Deferred GitNexus MCP tools were unavailable and npx gitnexus failed; see logs/gitnexus-help.log.', 'Use the configured GitNexus MCP/CLI in a repaired environment before committing if graph-level scope verification is required.'])
  }
}
md('16_open_questions_and_blockers.md', ['# 16 — Open Questions and Blockers', '', 'Generated: ' + now(), '', '| Area | Blocker / open question | Proposed next step |', '| --- | --- | --- |', ...(blockers.length ? blockers.map((b) => '| ' + b[0] + ' | ' + b[1] + ' | ' + b[2] + ' |') : ['| none | | |']), '', '## Open questions', '1. Which routes should become launch-critical hard performance gates versus warning-only observability?', '2. What staging credential model can safely support real login/signup/logout timings without storing secrets?', '3. Which admin/CEO datasets are representative enough for performance fixtures?', '4. Which Supabase queries are intentionally broad and should be allowlisted versus fixed?', '5. What production RUM provider or custom telemetry path should capture Core Web Vitals after launch?'])

md('README.md', [
  '# SlateCamp Performance Audit', '', 'Generated: ' + now(), '',
  'This folder is the centralized performance ledger for SlateCamp. It contains repeatable scripts, raw JSON, command logs, Playwright traces/screenshots, static inventories, and human-readable reports.', '',
  '## What was measured', '- Repository route/tooling/data-fetch inventory.', '- Environment and runtime versions.', '- Frontend route navigation and Playwright user-flow timing proxies.', '- Static GET API route latency when a target server is reachable.', '- Supabase usage inventory and database risk scan.', '- Build/typecheck timing and largest Next build artifacts.', '- Static component/function hotspot patterns.', '',
  '## How to rerun', '~~~bash', 'bun run perf:inventory', 'bun run perf:environment', 'bun run perf:frontend', 'bun run perf:api', 'bun run perf:supabase', 'bun run perf:build', 'bun run perf:hotspots', 'bun run perf:summary', '# or the whole local suite', 'bun run perf:all', '~~~', '',
  'Useful knobs:', '- PERF_FRONTEND_REPEAT=5 for more route samples.', '- PERF_USER_FLOW_REPEAT=5 for more user-flow samples.', '- PERF_API_REPEAT=10 PERF_BASE_URL=http://localhost:3217 for API samples.', '- PLAYWRIGHT_USE_BUILT_APP=true for production-build Playwright measurement.', '- PERF_ROUTE_FILTER=/dashboard/3d-lab limits frontend measurement to selected comma-separated routes.', '- PERF_ROUTE_SEQUENCE=/dashboard,/dashboard/wiki,/dashboard/analytics,/dashboard/3d-lab runs routes in that exact order for cumulative memory isolation.', '- PERF_MEMORY_PROFILE_LABEL=<label> names the server RSS profile JSON.', '- PERF_DEV_SERVER_MEMORY_PROFILE=false disables server memory sampling when needed.', '',
  'Comparison/history helpers:', '- ' + code('bun run perf:compare -- --before <before.json> --after <after.json>'), '- ' + code('bun run perf:snapshot -- --mode=<mode> --label=<label>'), '',
  '## Where raw results live', '- JSON results: ' + code('results/'), '- Command logs: ' + code('logs/'), '- Playwright traces: ' + code('traces/'), '- Screenshots: ' + code('screenshots/'), '- Playwright harness: ' + code('playwright/'), '- Scripts: ' + code('scripts/'), '',
  '## Current baseline summary', '- Commit: ' + code(environment?.gitCommit ?? 'unknown'), '- Pages / route handlers: ' + (inventory?.counts?.pages ?? 'n/a') + ' / ' + (inventory?.counts?.routeHandlers ?? 'n/a'), '- Frontend cold p50/p95: ' + fmtMs(nav?.summary?.coldDurationMs?.p50) + ' / ' + fmtMs(nav?.summary?.coldDurationMs?.p95), '- API GET p50/p95: ' + fmtMs(api?.summary?.p50) + ' / ' + fmtMs(api?.summary?.p95), '- Build p50/p95: ' + fmtMs(build?.build?.summary?.p50) + ' / ' + fmtMs(build?.build?.summary?.p95), '- Supabase select-star / missing-limit candidates: ' + (supabase?.summary?.selectStarCount ?? 'n/a') + ' / ' + (supabase?.summary?.unboundedReadCandidates ?? 'n/a'), '',
  '## Remediation-loop evidence',
  '- Dashboard duplicate-data remediation comparison: ' + (dashboardComparison?.summary ? 'cold p95 delta ' + fmtMs(dashboardComparison.summary.coldP95Ms?.delta) + ' (' + (dashboardComparison.summary.coldP95Ms?.deltaPercent ?? 'n/a') + '%); see ' + code('20_dashboard_remediation.md') + '.' : 'not available.'),
  '- Supabase query tightening: ' + (supabaseTightening?.summary ? 'select-star candidates ' + supabaseTightening.summary.selectStarBefore + ' -> ' + supabaseTightening.summary.selectStarAfter + '; see ' + code('21_supabase_query_tightening.md') + '.' : 'not available.'),
  '- 3D Lab direct-import split: ' + (labBundleAfter?.routes?.[0] ? 'hub raw client-reference signal bytes ' + fmtKiB(labBundleAfter.beforeFromStaticAudit?.rawBytes) + ' -> ' + fmtKiB(labBundleAfter.routes[0].rawBytes) + '; see ' + code('22_3d_lab_bundle_remediation.md') + '.' : 'not available.'),
  '- Latest exact ' + code('bun run perf:frontend') + ': ' + (fullFrontendPassed ? 'passed all 15 Playwright perf tests; memory-threshold restart warning still observed; see ' + code('results/full_frontend_verification_after_metadata.json') + '.' : finalFrontendFailure?.status === 'blocked' ? 'blocked/failing at ' + code(finalFrontendFailure.failedRoute ?? 'unknown') + '; partial evidence preserved in ' + code(finalFrontendFailure.partialResults ?? 'results/final_frontend_failed_partial.json') + '.' : 'no final failure recorded.'), '',
  '## Top bottlenecks', ...bottlenecks.slice(0, 5).map((b, i) => String(i + 1) + '. ' + b[0]), '',
  '## Recommended next actions', '1. Add safe auth/API/database fixtures so blocked live flows can be measured without secrets.', '2. Convert warning-only performance scripts into CI trend checks.', '3. Measure built-app frontend performance and compare against the current dev-server baseline.', '4. Tighten or allowlist Supabase broad-read candidates.', '5. Focus next remediation on 3D Lab memory/startup, remaining Supabase broad reads, admin large lists, and dashboard production-auth monitoring.', '',
  '## Known gaps/blockers', ...blockers.map((b) => '- ' + b[0] + ': ' + b[1]), '',
  '## Reports', ...['00_inventory.md','01_measurement_plan.md','02_environment.md','03_baseline_summary.md','04_frontend_runtime.md','05_playwright_e2e.md','06_api_backend.md','07_supabase_database.md','08_auth_and_user_wait.md','09_network_and_caching.md','10_bundle_build_startup.md','11_component_function_hotspots.md','12_regression_testing_plan.md','13_ci_perf_gates.md','14_bottlenecks_ranked.md','15_recommendations.md','16_open_questions_and_blockers.md','17_built_app_frontend_baseline.md','18_fixture_unblock_plan.md','19_live_measurement_readiness.md','20_dashboard_remediation.md','21_supabase_query_tightening.md','22_3d_lab_bundle_remediation.md','23_admin_editor_remediation.md','24_api_provider_timeout_remediation.md','25_cron_scaling_remediation.md','26_ci_history_and_compare.md','27_3d_lab_runtime_memory_isolation.md','28_3d_lab_metadata_registry_split.md','29_authenticated_built_app_fixture_attempt.md','30_dashboard_metric_reconciliation.md','31_performance_history_snapshot_writer.md','32_next_regression_gates_update.md','33_full_frontend_rejoin_verification.md','34_dev_server_memory_profile.md','35_authenticated_built_app_3d_timing.md','36_3d_hard_gate_decision.md','remediation_run_notes.md','llm_crosschecks.md'].map((f) => '- ' + code('.ai/00_performance/' + f))
])
