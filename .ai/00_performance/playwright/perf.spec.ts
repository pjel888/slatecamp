import { expect, test, type Browser, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

type NumericSummary = {
  count: number
  min: number | null
  max: number | null
  mean: number | null
  median: number | null
  p50: number | null
  p75: number | null
  p95: number | null
  p99: number | null
  stddev: number | null
}

type Measurement = {
  timestamp: string
  project: string
  route: string
  scenario: string
  runIndex: number
  status: number | null
  ok: boolean
  finalUrl: string | null
  durationMs: number
  navigation: Record<string, number | string | null>
  paints: Record<string, number | null>
  webVitalsProxy: {
    lcp: number | null
    cls: number | null
    longTaskCount: number
    longTaskTotalMs: number
    maxLongTaskMs: number | null
    inpProxyMs: number | null
  }
  resources: {
    count: number
    totalTransferSize: number
    totalEncodedBodySize: number
    byType: Record<string, { count: number; transferSize: number; encodedBodySize: number }>
    slowest: Array<Record<string, number | string>>
  }
  heap: Record<string, number | null>
  contentSignals: Record<string, boolean>
  errors: string[]
  screenshot: string | null
  trace: string | null
}

type FlowMeasurement = {
  timestamp: string
  project: string
  name: string
  status: 'measured' | 'blocked' | 'failed'
  durationMs: number | null
  metrics: Record<string, number | string | null>
  blocker?: string
  error?: string
}

const perfDir = path.join(process.cwd(), '.ai/00_performance')
const resultsDir = path.join(perfDir, 'results')
const tracesDir = path.join(perfDir, 'traces')
const screenshotsDir = path.join(perfDir, 'screenshots')
fs.mkdirSync(resultsDir, { recursive: true })
fs.mkdirSync(tracesDir, { recursive: true })
fs.mkdirSync(screenshotsDir, { recursive: true })

const repeat = Number(process.env.PERF_FRONTEND_REPEAT ?? 3)
const userFlowRepeat = Number(process.env.PERF_USER_FLOW_REPEAT ?? 3)
const userFlowActionTimeout = Number(process.env.PERF_USER_FLOW_ACTION_TIMEOUT_MS ?? 20_000)
const captureTraces = process.env.PERF_TRACE !== 'false'
const captureScreenshots = process.env.PERF_SCREENSHOT !== 'false'
const routeFilter = process.env.PERF_ROUTE_FILTER
const routeSequence = process.env.PERF_ROUTE_SEQUENCE
const runUserFlows =
  process.env.PERF_USER_FLOWS === 'true' ||
  (!routeFilter && !routeSequence && process.env.PERF_USER_FLOWS !== 'false')
const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'
const memoryProfileLabel = slug(
  process.env.PERF_MEMORY_PROFILE_LABEL ??
    (process.env.PLAYWRIGHT_USE_BUILT_APP === 'true' ? 'built-app' : 'dev-server'),
)
const serverMemoryProfilePath =
  process.env.PERF_MEMORY_PROFILE_FILE ??
  path.join(resultsDir, `dev_server_memory_profile_${memoryProfileLabel}.json`)

const defaultRoutes = ['/', '/login', '/register', '/forgot-password', '/pricing', '/about', '/contact', '/try', '/dashboard', '/dashboard/wiki', '/dashboard/analytics', '/dashboard/3d-lab', '/developer', '/admin/login']
const targetFile = path.join(resultsDir, 'frontend_route_targets.json')
const targetRoutes = loadRoutes()
const navigationResults: Measurement[] = []
const flowResults: FlowMeasurement[] = []

function loadRoutes() {
  const resolveSequence = (routes: string[]) => {
    if (!routeSequence) return null
    const tokens = routeSequence
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (!tokens.length) return null

    return tokens.map((token) => {
      const exact = routes.find((route) => route === token)
      if (exact) return exact
      return routes.find((route) => route.includes(token)) ?? token
    })
  }

  const applyFilter = (routes: string[]) => {
    const sequenced = resolveSequence(routes)
    if (sequenced) return sequenced
    if (!routeFilter) return routes
    const filters = routeFilter
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (!filters.length) return routes

    const filtered = routes.filter((route) =>
      filters.some((filter) => route === filter || route.includes(filter)),
    )

    return filtered.length ? filtered : filters
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(targetFile, 'utf8')) as { public?: string[]; authenticatedDemo?: string[] }
    const routes = [...(parsed.public ?? []), ...(parsed.authenticatedDemo ?? [])]
    return applyFilter([...new Set(routes.length ? routes : defaultRoutes)]).slice(0, Number(process.env.PERF_ROUTE_LIMIT ?? 18))
  } catch {
    return applyFilter(defaultRoutes).slice(0, Number(process.env.PERF_ROUTE_LIMIT ?? 18))
  }
}

function slug(value: string) {
  return value.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'root'
}

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return null
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function summarize(values: Array<number | null | undefined>): NumericSummary {
  const nums = values.filter((value): value is number => Number.isFinite(value)).sort((a, b) => a - b)
  if (!nums.length) return { count: 0, min: null, max: null, mean: null, median: null, p50: null, p75: null, p95: null, p99: null, stddev: null }
  const count = nums.length
  const mean = nums.reduce((sum, value) => sum + value, 0) / count
  const variance = nums.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count
  return { count, min: nums[0], max: nums[count - 1], mean, median: percentile(nums, 0.5), p50: percentile(nums, 0.5), p75: percentile(nums, 0.75), p95: percentile(nums, 0.95), p99: percentile(nums, 0.99), stddev: Math.sqrt(variance) }
}

function readServerMemoryProfile() {
  if (!fs.existsSync(serverMemoryProfilePath)) return null

  try {
    const profile = JSON.parse(fs.readFileSync(serverMemoryProfilePath, 'utf8')) as {
      warnings?: Array<unknown>
      summary?: Record<string, unknown>
      samples?: Array<{ rssKiB?: number }>
    }
    const rssValues = (profile.samples ?? [])
      .map((sample) => sample.rssKiB)
      .filter((value): value is number => Number.isFinite(value))

    return {
      enabled: true,
      profileFile: path.relative(process.cwd(), serverMemoryProfilePath),
      summary: {
        ...(profile.summary ?? {}),
        rssBytes: summarize(rssValues.map((value) => value * 1024)),
        memoryThresholdRestartObserved: Boolean(
          profile.warnings?.some((warning) =>
            JSON.stringify(warning).includes('memory threshold'),
          ),
        ),
      },
    }
  } catch (error) {
    return {
      enabled: true,
      profileFile: path.relative(process.cwd(), serverMemoryProfilePath),
      error: String((error as Error).message ?? error),
    }
  }
}

async function addPerfObservers(page: Page) {
  await page.addInitScript(() => {
    ;(window as typeof window & { __slatecampPerf?: any }).__slatecampPerf = {
      lcp: null,
      cls: 0,
      longTasks: [],
      events: [],
    }
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1] as any
        if (last) (window as any).__slatecampPerf.lcp = last.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) (window as any).__slatecampPerf.cls += entry.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          ;(window as any).__slatecampPerf.longTasks.push({ startTime: entry.startTime, duration: entry.duration })
        }
      }).observe({ type: 'longtask', buffered: true })
    } catch {}
  })
}

async function measureNavigation(browser: Browser, project: string, baseURL: string, route: string, scenario: 'cold' | 'warm', runIndex: number): Promise<Measurement> {
  const context = await browser.newContext({ baseURL })
  const page = await context.newPage()
  await addPerfObservers(page)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  let tracePath: string | null = null
  const traceThisRun = captureTraces && runIndex === 1 && ['/', '/dashboard', '/dashboard/wiki', '/dashboard/3d-lab'].includes(route)
  if (traceThisRun) await context.tracing.start({ screenshots: false, snapshots: true, sources: false })

  if (scenario === 'warm') {
    await page.goto(route, { waitUntil: 'load', timeout: 60_000 }).catch(() => null)
    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null)
  }

  const started = performance.now()
  let status: number | null = null
  let ok = false
  let finalUrl: string | null = null
  try {
    const response = await page.goto(route, { waitUntil: 'load', timeout: 60_000 })
    status = response?.status() ?? null
    ok = response?.ok() ?? false
    finalUrl = page.url()
    await page.waitForLoadState('networkidle', { timeout: 6_000 }).catch(() => null)
    await page.waitForTimeout(750)
  } catch (error) {
    errors.push(String((error as Error).message ?? error))
  }
  const durationMs = performance.now() - started

  const contentSignals = await page.evaluate(() => {
    const bodyText = document.body?.innerText ?? ''

    return {
      finalPathIsLogin: window.location.pathname.startsWith('/login'),
      threeDLabTitleVisible: /3D Interactive Lab/i.test(bodyText),
      threeDLabInteractiveModulesAvailable: /interactive modules available/i.test(bodyText),
      threeDLabLockedOrUpgradeCopyVisible: /unlock|upgrade|locked/i.test(bodyText),
    }
  }).catch(() => ({
    finalPathIsLogin: false,
    threeDLabTitleVisible: false,
    threeDLabInteractiveModulesAvailable: false,
    threeDLabLockedOrUpgradeCopyVisible: false,
  }))

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime]))
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const byType: Record<string, { count: number; transferSize: number; encodedBodySize: number }> = {}
    for (const resource of resources) {
      const type = resource.initiatorType || 'unknown'
      byType[type] ??= { count: 0, transferSize: 0, encodedBodySize: 0 }
      byType[type].count += 1
      byType[type].transferSize += resource.transferSize || 0
      byType[type].encodedBodySize += resource.encodedBodySize || 0
    }
    const slowest = resources
      .map((resource) => ({ name: resource.name, initiatorType: resource.initiatorType || 'unknown', duration: resource.duration, transferSize: resource.transferSize || 0, encodedBodySize: resource.encodedBodySize || 0 }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 15)
    const slatePerf = (window as any).__slatecampPerf ?? { lcp: null, cls: null, longTasks: [] }
    const longTasks = slatePerf.longTasks ?? []
    const eventEntries = (performance.getEntriesByType('event') as PerformanceEventTiming[] | undefined) ?? []
    const maxEvent = eventEntries.length ? Math.max(...eventEntries.map((entry: any) => entry.duration ?? 0)) : null
    const memory = (performance as any).memory
    return {
      navigation: nav ? nav.toJSON() : {},
      paints,
      resources: {
        count: resources.length,
        totalTransferSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
        totalEncodedBodySize: resources.reduce((sum, resource) => sum + (resource.encodedBodySize || 0), 0),
        byType,
        slowest,
      },
      webVitalsProxy: {
        lcp: slatePerf.lcp ?? null,
        cls: slatePerf.cls ?? null,
        longTaskCount: longTasks.length,
        longTaskTotalMs: longTasks.reduce((sum: number, task: { duration: number }) => sum + task.duration, 0),
        maxLongTaskMs: longTasks.length ? Math.max(...longTasks.map((task: { duration: number }) => task.duration)) : null,
        inpProxyMs: maxEvent,
      },
      heap: memory ? { jsHeapSizeLimit: memory.jsHeapSizeLimit ?? null, totalJSHeapSize: memory.totalJSHeapSize ?? null, usedJSHeapSize: memory.usedJSHeapSize ?? null } : { jsHeapSizeLimit: null, totalJSHeapSize: null, usedJSHeapSize: null },
    }
  }).catch((error) => {
    errors.push(`performance evaluate failed: ${String((error as Error).message ?? error)}`)
    return {
      navigation: {},
      paints: {},
      resources: { count: 0, totalTransferSize: 0, totalEncodedBodySize: 0, byType: {}, slowest: [] },
      webVitalsProxy: { lcp: null, cls: null, longTaskCount: 0, longTaskTotalMs: 0, maxLongTaskMs: null, inpProxyMs: null },
      heap: { jsHeapSizeLimit: null, totalJSHeapSize: null, usedJSHeapSize: null },
    }
  })

  let screenshot: string | null = null
  if (captureScreenshots && runIndex === 1 && scenario === 'cold' && ['/', '/dashboard', '/dashboard/wiki', '/dashboard/3d-lab'].includes(route)) {
    screenshot = path.join(screenshotsDir, `${project}-${slug(route)}-${scenario}.png`)
    await page.screenshot({ path: screenshot, fullPage: true }).catch((error) => errors.push(`screenshot failed: ${String(error)}`))
  }

  if (traceThisRun) {
    tracePath = path.join(tracesDir, `${project}-${slug(route)}-${scenario}.zip`)
    await context.tracing.stop({ path: tracePath }).catch((error) => errors.push(`trace failed: ${String(error)}`))
  }

  await context.close()

  return {
    timestamp: new Date().toISOString(),
    project,
    route,
    scenario,
    runIndex,
    status,
    ok,
    finalUrl,
    durationMs,
    navigation: perf.navigation,
    paints: { fcp: Number(perf.paints['first-contentful-paint'] ?? null), fp: Number(perf.paints['first-paint'] ?? null) },
    webVitalsProxy: perf.webVitalsProxy,
    resources: perf.resources,
    heap: perf.heap,
    contentSignals,
    errors,
    screenshot: screenshot ? path.relative(process.cwd(), screenshot) : null,
    trace: tracePath ? path.relative(process.cwd(), tracePath) : null,
  }
}

async function measureAction(name: string, project: string, action: () => Promise<Record<string, number | string | null>>): Promise<FlowMeasurement> {
  const started = performance.now()
  try {
    const metrics = await action()
    return { timestamp: new Date().toISOString(), project, name, status: 'measured', durationMs: performance.now() - started, metrics }
  } catch (error) {
    return { timestamp: new Date().toISOString(), project, name, status: 'failed', durationMs: performance.now() - started, metrics: {}, error: String((error as Error).message ?? error) }
  }
}

test.describe.serial('SlateCamp performance navigation baselines', () => {
  for (const route of targetRoutes) {
    test(`navigation metrics for ${route}`, async ({ browser, baseURL }, testInfo) => {
      test.setTimeout(180_000)
      const project = testInfo.project.name
      const base = baseURL ?? 'http://localhost:3217'
      for (let runIndex = 1; runIndex <= repeat; runIndex += 1) {
        navigationResults.push(await measureNavigation(browser, project, base, route, 'cold', runIndex))
        navigationResults.push(await measureNavigation(browser, project, base, route, 'warm', runIndex))
      }
      expect(navigationResults.some((result) => result.route === route)).toBe(true)
    })
  }

  test('user flow timing proxies', async ({ page }, testInfo) => {
    test.setTimeout(Math.max(180_000, userFlowRepeat * (userFlowActionTimeout * 3 + 15_000)))
    const project = testInfo.project.name
    if (!runUserFlows) {
      flowResults.push({ timestamp: new Date().toISOString(), project, name: 'user flows', status: 'blocked', durationMs: null, metrics: {}, blocker: 'PERF_USER_FLOWS=false' })
      return
    }

    for (let i = 0; i < userFlowRepeat; i += 1) {
      flowResults.push(await measureAction('open app to first visible UI', project, async () => {
        const started = performance.now()
        const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
        await page.locator('body').waitFor({ timeout: 30_000 })
        return { runIndex: i + 1, status: response?.status() ?? null, domContentVisibleMs: performance.now() - started }
      }))
    }

    if (!demoAuthEnabled) {
      flowResults.push({ timestamp: new Date().toISOString(), project, name: 'authenticated dashboard/login flows', status: 'blocked', durationMs: null, metrics: {}, blocker: 'PLAYWRIGHT_DEMO_AUTH is not true and no test credentials were provided.' })
      return
    }

    for (let i = 0; i < userFlowRepeat; i += 1) {
      flowResults.push(await measureAction('login entry to authenticated dashboard (demo auth)', project, async () => {
        const started = performance.now()
        await page.goto('/login', { waitUntil: 'commit' }).catch(() => null)
        await page.waitForURL(/\/dashboard$/, { timeout: userFlowActionTimeout })
        await page.locator('body').getByText(/Readiness Score|Dashboard/i).first().waitFor({ timeout: userFlowActionTimeout })
        return { runIndex: i + 1, loginToDashboardMs: performance.now() - started }
      }))

      flowResults.push(await measureAction('dashboard primary data visible (demo auth)', project, async () => {
        const started = performance.now()
        const response = await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
        await page.locator('body').getByText(/Readiness Score|Dashboard/i).first().waitFor({ timeout: userFlowActionTimeout })
        return { runIndex: i + 1, status: response?.status() ?? null, primaryDataVisibleMs: performance.now() - started }
      }))

      flowResults.push(await measureAction('wiki search/filter proxy (demo auth)', project, async () => {
        const started = performance.now()
        await page.goto('/dashboard/wiki', { waitUntil: 'domcontentloaded' })
        const search = page.getByRole('textbox').first()
        if (!(await search.count())) throw new Error('No textbox/search input found on /dashboard/wiki')
        await search.fill('building')
        await page.waitForTimeout(500)
        return { runIndex: i + 1, inputToSettledProxyMs: performance.now() - started }
      }))
    }
  })
})

test.afterAll(async ({}, testInfo) => {
  const project = testInfo.project.name
  const navForProject = navigationResults.filter((result) => result.project === project)
  const flowForProject = flowResults.filter((result) => result.project === project)
  const routeSummaries = [...new Set(navForProject.map((result) => result.route))].map((route) => {
    const byRoute = navForProject.filter((result) => result.route === route)
    return {
      route,
      runs: byRoute.length,
      cold: summarize(byRoute.filter((r) => r.scenario === 'cold').map((r) => r.durationMs)),
      warm: summarize(byRoute.filter((r) => r.scenario === 'warm').map((r) => r.durationMs)),
      ttfb: summarize(byRoute.map((r) => Number(r.navigation.responseStart ?? null))),
      domContentLoaded: summarize(byRoute.map((r) => Number(r.navigation.domContentLoadedEventEnd ?? null))),
      load: summarize(byRoute.map((r) => Number(r.navigation.loadEventEnd ?? null))),
      fcp: summarize(byRoute.map((r) => r.paints.fcp)),
      lcp: summarize(byRoute.map((r) => r.webVitalsProxy.lcp)),
      cls: summarize(byRoute.map((r) => r.webVitalsProxy.cls)),
      longTaskTotal: summarize(byRoute.map((r) => r.webVitalsProxy.longTaskTotalMs)),
      requests: summarize(byRoute.map((r) => r.resources.count)),
      transferredBytes: summarize(byRoute.map((r) => r.resources.totalTransferSize)),
      jsHeapUsed: summarize(byRoute.map((r) => r.heap.usedJSHeapSize)),
      jsHeapTotal: summarize(byRoute.map((r) => r.heap.totalJSHeapSize)),
      jsHeapLimit: summarize(byRoute.map((r) => r.heap.jsHeapSizeLimit)),
      errorCount: byRoute.reduce((sum, result) => sum + result.errors.length + (result.ok ? 0 : 1), 0),
      screenshots: byRoute.map((r) => r.screenshot).filter(Boolean),
      traces: byRoute.map((r) => r.trace).filter(Boolean),
    }
  })
  const devServerMemory = readServerMemoryProfile()

  const navPayload = {
    timestamp: new Date().toISOString(),
    project,
    repeat,
    routeFilter: routeFilter ?? null,
    routeSequence: routeSequence ?? null,
    routeSelection: {
      routeFilter: routeFilter ?? null,
      routeSequence: routeSequence ?? null,
      routeLimit: Number(process.env.PERF_ROUTE_LIMIT ?? 18),
    },
    serverMemoryProfile: fs.existsSync(serverMemoryProfilePath)
      ? path.relative(process.cwd(), serverMemoryProfilePath)
      : null,
    devServerMemory,
    targetRoutes,
    runs: navForProject,
    routeSummaries,
    summary: {
      coldDurationMs: summarize(navForProject.filter((r) => r.scenario === 'cold').map((r) => r.durationMs)),
      warmDurationMs: summarize(navForProject.filter((r) => r.scenario === 'warm').map((r) => r.durationMs)),
      fcpMs: summarize(navForProject.map((r) => r.paints.fcp)),
      lcpMs: summarize(navForProject.map((r) => r.webVitalsProxy.lcp)),
      requestCount: summarize(navForProject.map((r) => r.resources.count)),
      transferredBytes: summarize(navForProject.map((r) => r.resources.totalTransferSize)),
      jsHeapUsedBytes: summarize(navForProject.map((r) => r.heap.usedJSHeapSize)),
    },
    notes: [
      'Navigation duration is measured wall-clock around page.goto plus bounded network-idle/settling wait.',
      'Web vital values are browser Performance API/observer proxies; validate production Core Web Vitals with RUM for final budgets.',
      'Traced runs add overhead and are diagnostic, not pristine latency baselines.',
      'Server memory profile is sampled from the local Next server process tree when scripts/playwright-web-server.ts owns the server process.',
    ],
  }
  const flowPayload = {
    timestamp: new Date().toISOString(),
    project,
    demoAuthEnabled,
    repeat: userFlowRepeat,
    runs: flowForProject,
    summaries: Object.fromEntries([...new Set(flowForProject.map((run) => run.name))].map((name) => [name, summarize(flowForProject.filter((run) => run.name === name).map((run) => run.durationMs))])),
  }

  fs.writeFileSync(path.join(resultsDir, 'frontend_navigation_results.json'), `${JSON.stringify(navPayload, null, 2)}\n`)
  fs.writeFileSync(path.join(resultsDir, 'frontend_user_flows_results.json'), `${JSON.stringify(flowPayload, null, 2)}\n`)

  const routeRows = routeSummaries.map((s) => `| \`${s.route}\` | ${s.runs} | ${s.cold.p50?.toFixed?.(0) ?? 'n/a'} | ${s.cold.p95?.toFixed?.(0) ?? 'n/a'} | ${s.warm.p50?.toFixed?.(0) ?? 'n/a'} | ${s.fcp.p50?.toFixed?.(0) ?? 'n/a'} | ${s.lcp.p50?.toFixed?.(0) ?? 'n/a'} | ${s.requests.p50?.toFixed?.(0) ?? 'n/a'} | ${s.transferredBytes.p50 ? (s.transferredBytes.p50 / 1024).toFixed(1) : 'n/a'} | ${s.errorCount} |`).join('\n')
  const flowRows = flowForProject.map((flow) => `| ${flow.name} | ${flow.status} | ${flow.durationMs?.toFixed?.(0) ?? 'n/a'} | ${flow.blocker ?? flow.error ?? ''} |`).join('\n')

  fs.writeFileSync(path.join(perfDir, '04_frontend_runtime.md'), `# 04 — Frontend Runtime Performance\n\nGenerated: ${navPayload.timestamp}\n\n## Measurement method\nPlaywright Chromium navigation tests measured cold and warm route loads with ${repeat} repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.\n\n## Route summary\n| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${routeRows || '| no routes measured | | | | | | | | | |'}\n\n## Overall summary\n- Cold duration p50/p95: ${navPayload.summary.coldDurationMs.p50?.toFixed?.(0) ?? 'n/a'} / ${navPayload.summary.coldDurationMs.p95?.toFixed?.(0) ?? 'n/a'} ms\n- Warm duration p50/p95: ${navPayload.summary.warmDurationMs.p50?.toFixed?.(0) ?? 'n/a'} / ${navPayload.summary.warmDurationMs.p95?.toFixed?.(0) ?? 'n/a'} ms\n- FCP p50/p95: ${navPayload.summary.fcpMs.p50?.toFixed?.(0) ?? 'n/a'} / ${navPayload.summary.fcpMs.p95?.toFixed?.(0) ?? 'n/a'} ms\n- LCP p50/p95: ${navPayload.summary.lcpMs.p50?.toFixed?.(0) ?? 'n/a'} / ${navPayload.summary.lcpMs.p95?.toFixed?.(0) ?? 'n/a'} ms\n- Requests p50/p95: ${navPayload.summary.requestCount.p50?.toFixed?.(0) ?? 'n/a'} / ${navPayload.summary.requestCount.p95?.toFixed?.(0) ?? 'n/a'}\n- Transferred bytes p50/p95: ${navPayload.summary.transferredBytes.p50 ? (navPayload.summary.transferredBytes.p50 / 1024).toFixed(1) : 'n/a'} / ${navPayload.summary.transferredBytes.p95 ? (navPayload.summary.transferredBytes.p95 / 1024).toFixed(1) : 'n/a'} KiB\n\n## Evidence files\n- Raw navigation JSON: \`.ai/00_performance/results/frontend_navigation_results.json\`\n- Server memory profile: ${navPayload.serverMemoryProfile ? '`' + navPayload.serverMemoryProfile + '`' : 'not available for this run'}\n- Screenshots: \`.ai/00_performance/screenshots/\`\n- Diagnostic traces: \`.ai/00_performance/traces/\`\n\n## Limitations\n- Local development/server measurements are not production RUM.\n- Trace-enabled runs add overhead and should be used diagnostically.\n- Auth-gated pages may measure redirect or demo-auth behavior depending on \`PLAYWRIGHT_DEMO_AUTH\`.\n`)

  fs.writeFileSync(path.join(perfDir, '05_playwright_e2e.md'), `# 05 — Playwright E2E Performance\n\nGenerated: ${flowPayload.timestamp}\n\n## User-flow timing proxy results\n| Flow | Status | Duration ms | Blocker/error |\n| --- | --- | ---: | --- |\n${flowRows || '| no user flows recorded | | | |'}\n\n## Auth flow status\n- Demo auth enabled: ${demoAuthEnabled ? 'yes' : 'no'}\n- If demo auth is disabled and no test credentials are present, login/signup measurements are intentionally blocked to avoid storing secrets.\n\n## Raw evidence\n- Raw flow JSON: \`.ai/00_performance/results/frontend_user_flows_results.json\`\n- Playwright spec: \`.ai/00_performance/playwright/perf.spec.ts\`\n\n## Notes\n- This test suite is intended for repeatable local/CI trend measurement, not one-off visual correctness.\n- Existing functional E2E specs remain under \`e2e/\`; this performance spec stores its outputs under \`.ai/00_performance\`.\n`)
})
