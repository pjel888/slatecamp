import fs from 'node:fs'
import path from 'node:path'
import { expect, test, devices, type Browser, type BrowserContextOptions, type Page } from '@playwright/test'

const repoRoot = process.cwd()
const resultsDir = path.join(repoRoot, '.ai/00_performance/results')
const screenshotsDir = path.join(repoRoot, '.ai/00_performance/screenshots')
fs.mkdirSync(resultsDir, { recursive: true })
fs.mkdirSync(screenshotsDir, { recursive: true })

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.PLAYWRIGHT_PORT ?? '3217'}`
const mode = process.env.THREED_MODE ?? 'all'
const failOnCritical = process.env.PERF_3D_GATE_MODE === 'hard' || process.env.THREED_FAIL_ON_CRITICAL === 'true'
const perRouteTimeoutMs = Number(process.env.THREED_ROUTE_TIMEOUT_MS ?? 30_000)
const moduleLimit = Number(process.env.THREED_MODULE_LIMIT ?? 0)
const moduleFilter = process.env.THREED_MODULE_FILTER
const mobileModuleLimit = Number(process.env.THREED_MOBILE_MODULE_LIMIT ?? 3)

const shouldRun = (target: string) => mode === 'all' || mode === target

type BrowserMessage = {
  type: string
  text: string
  location?: string
}

type Measurement = {
  kind: string
  path: string
  moduleId?: string
  startedAt: string
  endedAt: string
  durationMs: number
  responseStatus: number | null
  ok: boolean
  navigationError: string | null
  consoleMessages: BrowserMessage[]
  pageErrors: string[]
  criticalConsoleMessages: BrowserMessage[]
  criticalErrors: string[]
  browserMetrics: Record<string, unknown> | null
  notes: string[]
}

const measurements: Measurement[] = []

const parseModuleIds = () => {
  const registryDir = path.join(repoRoot, 'src/features/3d-lab/config/registry')
  const ids: string[] = []

  for (const file of fs.readdirSync(registryDir).filter((name) => /^cat-\d+\.ts$/.test(name)).sort()) {
    const source = fs.readFileSync(path.join(registryDir, file), 'utf8')
    for (const match of source.matchAll(/id:\s*['"]([^'"]+)['"]/g)) {
      ids.push(match[1])
    }
  }

  const deduped = [...new Set(ids)].sort()
  const filtered = moduleFilter
    ? deduped.filter((id) => id.includes(moduleFilter) || new RegExp(moduleFilter).test(id))
    : deduped

  return moduleLimit > 0 ? filtered.slice(0, moduleLimit) : filtered
}

const isAllowedConsoleMessage = (message: BrowserMessage) => {
  if (message.type !== 'error') return true
  return [
    /ResizeObserver loop limit exceeded/i,
    /ResizeObserver loop completed/i,
    /favicon\.ico/i,
  ].some((pattern) => pattern.test(message.text))
}

const absoluteUrl = (routePath: string) => new URL(routePath, baseURL).toString()

const redactEnvPresence = () => ({
  PLAYWRIGHT_DEMO_AUTH: process.env.PLAYWRIGHT_DEMO_AUTH === 'true' ? 'enabled' : 'disabled',
  PLAYWRIGHT_USE_BUILT_APP: process.env.PLAYWRIGHT_USE_BUILT_APP === 'true' ? 'enabled' : 'disabled',
  PLAYWRIGHT_TEST_EMAIL: process.env.PLAYWRIGHT_TEST_EMAIL ? 'present-redacted' : 'missing',
  PLAYWRIGHT_TEST_PASSWORD: process.env.PLAYWRIGHT_TEST_PASSWORD ? 'present-redacted' : 'missing',
  PLAYWRIGHT_ADMIN_EMAIL: process.env.PLAYWRIGHT_ADMIN_EMAIL ? 'present-redacted' : 'missing',
  PLAYWRIGHT_ADMIN_PASSWORD: process.env.PLAYWRIGHT_ADMIN_PASSWORD ? 'present-redacted' : 'missing',
})

async function createContext(browser: Browser, options: BrowserContextOptions = {}, suppressOnboarding = true) {
  const context = await browser.newContext({ baseURL, ...options })

  await context.addInitScript(({ suppress }) => {
    const mark = (key: string) => localStorage.setItem(key, 'true')
    const clear = (key: string) => localStorage.removeItem(key)
    const moduleMatch = location.pathname.match(/\/dashboard\/3d-lab\/([^/]+)/)
    const moduleId = moduleMatch ? decodeURIComponent(moduleMatch[1]) : null

    if (suppress) {
      mark('3dlab_onboarded')
      mark('slatecamp-3dlab:onboarding:v1:global-complete')
      mark('slatecamp-viewport-onboarding-seen')
      mark('slatecamp-3dlab:onboarding:v1:viewport-tooltip-seen')
      if (moduleId) {
        mark(`module_${moduleId}_seen`)
        mark(`slatecamp-3dlab:onboarding:v1:module:${moduleId}:seen`)
      }
    } else {
      clear('3dlab_onboarded')
      clear('slatecamp-3dlab:onboarding:v1:global-complete')
      clear('slatecamp-viewport-onboarding-seen')
      clear('slatecamp-3dlab:onboarding:v1:viewport-tooltip-seen')
      clear('devcontrols-tour-dismissed')
      for (const key of Object.keys(localStorage)) {
        if (
          key.startsWith('module_') ||
          key.startsWith('slatecamp-3dlab:onboarding:v1:module:') ||
          key.startsWith('slatecamp-tour-completed-')
        ) {
          clear(key)
        }
      }
    }
  }, { suppress: suppressOnboarding })

  return context
}

function collectPageDiagnostics(page: Page) {
  let consoleMessages: BrowserMessage[] = []
  let pageErrors: string[] = []

  page.on('console', (message) => {
    const location = message.location()
    consoleMessages.push({
      type: message.type(),
      text: message.text(),
      location: location.url ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : undefined,
    })
  })

  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  return {
    take() {
      const result = { consoleMessages, pageErrors }
      consoleMessages = []
      pageErrors = []
      return result
    },
  }
}

async function readBrowserMetrics(page: Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const paints = Object.fromEntries(
      performance.getEntriesByType('paint').map((entry) => [entry.name, Math.round(entry.startTime * 100) / 100]),
    )
    const resources = performance
      .getEntriesByType('resource')
      .map((entry) => entry as PerformanceResourceTiming)
    const transferBytes = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
    const slowestResources = resources
      .map((resource) => ({
        name: resource.name,
        initiatorType: resource.initiatorType,
        durationMs: Math.round(resource.duration * 100) / 100,
        transferSize: resource.transferSize || 0,
      }))
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 10)

    const supportsWebGL = (() => {
      const canvas = document.createElement('canvas')
      try {
        return Boolean(
          canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl'),
        )
      } catch {
        return false
      }
    })()

    const count = (selector: string) => document.querySelectorAll(selector).length
    const bodyText = document.body.innerText

    return {
      finalUrl: location.href,
      title: document.title,
      bodyTextSample: bodyText.slice(0, 1200),
      navigation: nav
        ? {
            durationMs: Math.round(nav.duration * 100) / 100,
            ttfbMs: Math.round((nav.responseStart - nav.requestStart) * 100) / 100,
            domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd * 100) / 100,
            loadEventMs: Math.round(nav.loadEventEnd * 100) / 100,
          }
        : null,
      paints,
      resourceCount: resources.length,
      transferBytes,
      slowestResources,
      heap: (performance as unknown as { memory?: unknown }).memory ?? null,
      supportsWebGL,
      canvasCount: count('canvas'),
      webglUnavailableVisible: count('[data-testid="3dlab-webgl-unavailable"]'),
      webglRecoveryVisible: count('[data-testid="3dlab-webgl-recovery"]'),
      slowSceneNoticeVisible: count('[data-testid="3dlab-slow-scene-notice"]'),
      onboarding: {
        globalDialog: count('[data-testid="3dlab-onboarding-dialog"]'),
        globalOverlay: count('[data-testid="3dlab-onboarding-overlay"]'),
        moduleContext: count('[data-testid="3dlab-module-context-card"]'),
        viewportTooltip: count('[data-testid="3dlab-first-time-tooltip"]'),
        devControlsTour: count('[data-testid="3dlab-devcontrols-tour-overlay"]'),
        activeTutorialSurfaces: count('[data-testid="3dlab-onboarding-dialog"], [data-testid="3dlab-module-context-card"], [data-testid="3dlab-first-time-tooltip"], [data-testid="3dlab-devcontrols-tour-overlay"]'),
        telemetry: (window as unknown as { __slatecamp3dLabOnboarding?: unknown }).__slatecamp3dLabOnboarding ?? null,
      },
      contentSignals: {
        loginRedirect: /sign in|log in|login/i.test(bodyText) && location.pathname.includes('/login'),
        threeLabHub: /3D Interactive Lab|interactive modules available/i.test(bodyText),
        moduleView: /Practice a question|Loading 3D scene|Checking graphics support|Stairway|Development Controls|Code reference/i.test(bodyText),
        unsupportedWebGL: count('[data-testid="3dlab-webgl-unavailable"]') > 0,
      },
    }
  })
}

async function measureRoute(
  page: Page,
  kind: string,
  routePath: string,
  moduleId?: string,
  options: { navigate?: boolean } = {},
) {
  const startedAt = new Date()
  const started = performance.now()
  const notes: string[] = []
  let responseStatus: number | null = null
  let navigationError: string | null = null

  if (options.navigate !== false) {
    try {
      const response = await page.goto(absoluteUrl(routePath), {
        waitUntil: 'domcontentloaded',
        timeout: perRouteTimeoutMs,
      })
      responseStatus = response?.status() ?? null
    } catch (error) {
      navigationError = String(error)
    }
  }

  try {
    await page.waitForLoadState('networkidle', { timeout: 8_000 })
  } catch {
    notes.push('networkidle timed out after domcontentloaded; metrics still captured')
  }

  await page.waitForTimeout(500)

  const browserMetrics = await readBrowserMetrics(page).catch((error) => {
    notes.push(`browser metrics failed: ${String(error)}`)
    return null
  })

  const diagnostics = (page as unknown as { __take3dDiagnostics?: () => { consoleMessages: BrowserMessage[]; pageErrors: string[] } }).__take3dDiagnostics?.() ?? {
    consoleMessages: [],
    pageErrors: [],
  }
  const criticalConsoleMessages = diagnostics.consoleMessages.filter((message) => !isAllowedConsoleMessage(message))
  const criticalErrors = [...diagnostics.pageErrors, ...criticalConsoleMessages.map((message) => message.text)]
  const finalUrl = typeof browserMetrics?.finalUrl === 'string' ? browserMetrics.finalUrl : ''
  const ok = !navigationError && !criticalErrors.length && !finalUrl.includes('/login')

  const measurement: Measurement = {
    kind,
    path: routePath,
    moduleId,
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
    responseStatus,
    ok,
    navigationError,
    consoleMessages: diagnostics.consoleMessages,
    pageErrors: diagnostics.pageErrors,
    criticalConsoleMessages,
    criticalErrors,
    browserMetrics: browserMetrics as Record<string, unknown> | null,
    notes,
  }

  measurements.push(measurement)
  return measurement
}

async function newMeasuredPage(browser: Browser, options: BrowserContextOptions = {}, suppressOnboarding = true) {
  const context = await createContext(browser, options, suppressOnboarding)
  const page = await context.newPage()
  const diagnostics = collectPageDiagnostics(page)
  ;(page as unknown as { __take3dDiagnostics: typeof diagnostics.take }).__take3dDiagnostics = diagnostics.take
  return { context, page }
}

const writeJson = (fileName: string, payload: unknown) => {
  fs.writeFileSync(path.join(resultsDir, fileName), `${JSON.stringify(payload, null, 2)}\n`)
}

test.afterAll(() => {
  const payload = {
    timestamp: new Date().toISOString(),
    mode,
    baseURL,
    env: redactEnvPresence(),
    failOnCritical,
    moduleCount: parseModuleIds().length,
    measurements,
  }

  writeJson('3d_lab_production_hardening_results.json', payload)
  writeJson('3d_lab_console_policy_results.json', {
    ...payload,
    summary: {
      totalMeasurements: measurements.length,
      measurementsWithCriticalErrors: measurements.filter((run) => run.criticalErrors.length > 0).length,
      criticalErrors: measurements.flatMap((run) => run.criticalErrors.map((error) => ({ path: run.path, moduleId: run.moduleId, error }))),
    },
  })

  const byKind = (kind: string) => measurements.filter((run) => run.kind === kind)
  if (byKind('module-smoke').length) writeJson('3d_lab_module_smoke_results.json', { ...payload, measurements: byKind('module-smoke') })
  if (byKind('mobile-webgl').length) writeJson('3d_lab_mobile_webgl_results.json', { ...payload, measurements: byKind('mobile-webgl') })
  if (byKind('auth-timing').length) writeJson('3d_lab_auth_timing_results.json', { ...payload, measurements: byKind('auth-timing') })
  if (byKind('onboarding').length) writeJson('3d_lab_onboarding_overlay_results.json', { ...payload, measurements: byKind('onboarding') })
  if (byKind('fallbacks').length) writeJson('3d_lab_fallback_results.json', { ...payload, measurements: byKind('fallbacks') })
})

test.describe.serial('3D Lab production hardening gates', () => {
  test('first-run tutorial owns only one active overlay at a time', async ({ browser }) => {
    test.skip(!shouldRun('onboarding'), `THREED_MODE=${mode} skips onboarding check`)
    test.setTimeout(90_000)

    const { context, page } = await newMeasuredPage(browser, {}, false)
    const firstRun = await measureRoute(page, 'onboarding', '/dashboard/3d-lab/site-development-controls', 'site-development-controls')
    const firstMetrics = firstRun.browserMetrics as { onboarding?: { activeTutorialSurfaces?: number } } | null

    expect(firstMetrics?.onboarding?.activeTutorialSurfaces ?? 0).toBeLessThanOrEqual(1)

    const skipButton = page.getByRole('button', { name: /skip orientation/i })
    if (await skipButton.count()) {
      await skipButton.first().click()
      await page.waitForTimeout(700)
      const afterSkip = await measureRoute(
        page,
        'onboarding',
        '/dashboard/3d-lab/site-development-controls',
        'site-development-controls',
        { navigate: false },
      )
      const afterSkipMetrics = afterSkip.browserMetrics as { onboarding?: { activeTutorialSurfaces?: number } } | null
      expect(afterSkipMetrics?.onboarding?.activeTutorialSurfaces ?? 0).toBeLessThanOrEqual(1)
    }

    await context.close()
  })

  test('return-visit DevControls tour waits until the module context card is dismissed', async ({ browser }) => {
    test.skip(!shouldRun('onboarding'), `THREED_MODE=${mode} skips onboarding check`)
    test.setTimeout(90_000)

    const context = await browser.newContext({ baseURL })
    await context.addInitScript(() => {
      localStorage.setItem('3dlab_onboarded', 'true')
      localStorage.setItem('slatecamp-3dlab:onboarding:v1:global-complete', 'true')
      localStorage.removeItem('module_site-development-controls_seen')
      localStorage.removeItem('slatecamp-3dlab:onboarding:v1:module:site-development-controls:seen')
      localStorage.removeItem('devcontrols-tour-dismissed')
    })
    const page = await context.newPage()
    const diagnostics = collectPageDiagnostics(page)
    ;(page as unknown as { __take3dDiagnostics: typeof diagnostics.take }).__take3dDiagnostics = diagnostics.take

    const run = await measureRoute(page, 'onboarding', '/dashboard/3d-lab/site-development-controls', 'site-development-controls')
    const metrics = run.browserMetrics as { onboarding?: { moduleContext?: number; devControlsTour?: number; activeTutorialSurfaces?: number } } | null

    expect(metrics?.onboarding?.moduleContext ?? 0).toBe(1)
    expect(metrics?.onboarding?.devControlsTour ?? 0).toBe(0)
    expect(metrics?.onboarding?.activeTutorialSurfaces ?? 0).toBeLessThanOrEqual(1)

    await context.close()
  })

  test('built/demo auth timing reaches authenticated 3D hub content', async ({ browser }) => {
    test.skip(!shouldRun('auth-timing'), `THREED_MODE=${mode} skips auth timing check`)
    test.setTimeout(90_000)

    const { context, page } = await newMeasuredPage(browser)
    const run = await measureRoute(page, 'auth-timing', '/dashboard/3d-lab')
    const metrics = run.browserMetrics as { contentSignals?: { loginRedirect?: boolean; threeLabHub?: boolean }; finalUrl?: string } | null

    expect(metrics?.contentSignals?.loginRedirect).toBeFalsy()
    expect(metrics?.contentSignals?.threeLabHub).toBeTruthy()
    expect(metrics?.finalUrl).toContain('/dashboard/3d-lab')

    await context.close()
  })

  test('module smoke matrix loads every selected 3D module without critical runtime errors', async ({ browser }) => {
    test.skip(!shouldRun('module-smoke'), `THREED_MODE=${mode} skips module smoke`)

    const moduleIds = parseModuleIds()
    test.setTimeout(Math.max(120_000, moduleIds.length * perRouteTimeoutMs + 60_000))

    const { context, page } = await newMeasuredPage(browser)
    const failed: Measurement[] = []

    for (const moduleId of moduleIds) {
      const run = await measureRoute(page, 'module-smoke', `/dashboard/3d-lab/${moduleId}`, moduleId)
      if (!run.ok) failed.push(run)
    }

    await context.close()

    if (failOnCritical) {
      expect(failed.map((run) => ({ moduleId: run.moduleId, error: run.criticalErrors[0] ?? run.navigationError }))).toEqual([])
    }
  })

  test('mobile mid-range WebGL pass covers hub and representative module routes', async ({ browser }) => {
    test.skip(!shouldRun('mobile-webgl'), `THREED_MODE=${mode} skips mobile WebGL`)

    const moduleIds = parseModuleIds().slice(0, Math.max(1, mobileModuleLimit))
    const routes = ['/dashboard/3d-lab', ...moduleIds.map((moduleId) => `/dashboard/3d-lab/${moduleId}`)]
    test.setTimeout(Math.max(120_000, routes.length * perRouteTimeoutMs + 30_000))

    const { context, page } = await newMeasuredPage(browser, {
      ...devices['Pixel 7'],
      reducedMotion: 'reduce',
    })
    const failed: Measurement[] = []

    for (const routePath of routes) {
      const moduleId = routePath.split('/').at(-1)
      const run = await measureRoute(page, 'mobile-webgl', routePath, routePath === '/dashboard/3d-lab' ? undefined : moduleId)
      const metrics = run.browserMetrics as { supportsWebGL?: boolean; contentSignals?: { unsupportedWebGL?: boolean } } | null
      if (!run.ok || metrics?.supportsWebGL === false || metrics?.contentSignals?.unsupportedWebGL) failed.push(run)
    }

    await context.close()

    if (failOnCritical) {
      expect(failed.map((run) => ({ path: run.path, error: run.criticalErrors[0] ?? run.navigationError }))).toEqual([])
    }
  })

  test('WebGL unsupported, context-loss, and slow-scene fallbacks are measurable', async ({ browser }) => {
    test.skip(!shouldRun('fallbacks'), `THREED_MODE=${mode} skips fallback checks`)
    test.setTimeout(120_000)

    const unsupportedContext = await browser.newContext({ baseURL })
    await unsupportedContext.addInitScript(() => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function patchedGetContext(type: string, ...args: unknown[]) {
        if (/webgl/i.test(type)) return null
        return originalGetContext.apply(this, [type, ...args] as Parameters<typeof originalGetContext>)
      } as typeof HTMLCanvasElement.prototype.getContext
      localStorage.setItem('3dlab_onboarded', 'true')
      localStorage.setItem('slatecamp-3dlab:onboarding:v1:global-complete', 'true')
      localStorage.setItem('module_stairway-configurator_seen', 'true')
      localStorage.setItem('slatecamp-3dlab:onboarding:v1:module:stairway-configurator:seen', 'true')
    })
    const unsupportedPage = await unsupportedContext.newPage()
    const unsupportedDiagnostics = collectPageDiagnostics(unsupportedPage)
    ;(unsupportedPage as unknown as { __take3dDiagnostics: typeof unsupportedDiagnostics.take }).__take3dDiagnostics = unsupportedDiagnostics.take

    await unsupportedPage.goto(absoluteUrl('/dashboard/3d-lab/stairway-configurator'), { waitUntil: 'domcontentloaded' })
    await expect(unsupportedPage.getByTestId('3dlab-webgl-unavailable').first()).toBeVisible()
    const unsupportedRun = await measureRoute(
      unsupportedPage,
      'fallbacks',
      '/dashboard/3d-lab/stairway-configurator',
      'stairway-configurator',
      { navigate: false },
    )
    const unsupportedMetrics = unsupportedRun.browserMetrics as { webglUnavailableVisible?: number; supportsWebGL?: boolean } | null
    expect(unsupportedMetrics?.webglUnavailableVisible ?? 0).toBeGreaterThan(0)
    expect(unsupportedMetrics?.supportsWebGL).toBe(false)
    await unsupportedContext.close()

    const { context, page } = await newMeasuredPage(browser)
    await page.goto(absoluteUrl('/dashboard/3d-lab/stairway-configurator'), { waitUntil: 'domcontentloaded' })
    await page.locator('canvas').first().waitFor({ timeout: 30_000 })
    await page.evaluate(() => {
      document.querySelector('canvas')?.dispatchEvent(
        new Event('webglcontextlost', { cancelable: true }),
      )
    })
    await expect(page.getByTestId('3dlab-webgl-recovery').first()).toBeVisible()
    const contextLossRun = await measureRoute(
      page,
      'fallbacks',
      '/dashboard/3d-lab/stairway-configurator',
      'stairway-configurator',
      { navigate: false },
    )
    const contextLossMetrics = contextLossRun.browserMetrics as { webglRecoveryVisible?: number } | null
    expect(contextLossMetrics?.webglRecoveryVisible ?? 0).toBeGreaterThan(0)
    await context.close()

    const slowContext = await browser.newContext({ baseURL })
    await slowContext.addInitScript(() => {
      ;(window as unknown as { __slatecamp3dLabHoldSceneReady?: boolean }).__slatecamp3dLabHoldSceneReady = true
      ;(window as unknown as { __slatecamp3dLabSlowSceneTimeoutMs?: number }).__slatecamp3dLabSlowSceneTimeoutMs = 100
      localStorage.setItem('3dlab_onboarded', 'true')
      localStorage.setItem('slatecamp-3dlab:onboarding:v1:global-complete', 'true')
      localStorage.setItem('module_stairway-configurator_seen', 'true')
      localStorage.setItem('slatecamp-3dlab:onboarding:v1:module:stairway-configurator:seen', 'true')
    })
    const slowPage = await slowContext.newPage()
    const slowDiagnostics = collectPageDiagnostics(slowPage)
    ;(slowPage as unknown as { __take3dDiagnostics: typeof slowDiagnostics.take }).__take3dDiagnostics = slowDiagnostics.take

    await slowPage.goto(absoluteUrl('/dashboard/3d-lab/stairway-configurator'), { waitUntil: 'domcontentloaded' })
    await expect(slowPage.getByTestId('3dlab-slow-scene-notice').first()).toBeVisible({ timeout: 10_000 })
    const slowRun = await measureRoute(
      slowPage,
      'fallbacks',
      '/dashboard/3d-lab/stairway-configurator',
      'stairway-configurator',
      { navigate: false },
    )
    const slowMetrics = slowRun.browserMetrics as { slowSceneNoticeVisible?: number } | null
    expect(slowMetrics?.slowSceneNoticeVisible ?? 0).toBeGreaterThan(0)
    await slowContext.close()
  })
})
