import {
  absoluteUrl,
  buildRouteManifest,
  collectBrowserAccounting,
  parseFlag,
  parseNumberOption,
  resolveBaseUrl,
  summarizeAccounting,
  writeEvidence,
  writeRouteManifestEvidence,
} from './_shared'
import { chromium } from 'playwright'

type BrowserAuditResult = {
  consoleErrors: Array<{ location?: string; text: string }>
  durationMs: number
  failedRequests: Array<{ errorText?: string; method: string; resourceType: string; url: string }>
  finalUrl?: string
  navigationTrail: string[]
  pageErrors: string[]
  responseStatus?: number
  routePath: string
  status: 'pass' | 'failed' | 'gated' | 'fixture_missing' | 'redirect_loop'
  targetKind: 'auth-page' | 'protected-probe'
  warningCount: number
}

const DEFAULT_TIMEOUT_MS = 15_000
const REDIRECT_LOOP_NAVIGATION_THRESHOLD = 10
const GATED_DESTINATIONS = ['/login', '/register', '/forgot-password', '/auth/reset-password', '/admin/login', '/dashboard']

const inferTargetKind = (routePath: string) =>
  routePath === '/login' ||
  routePath === '/register' ||
  routePath === '/forgot-password' ||
  routePath === '/auth/reset-password' ||
  routePath === '/admin/login' ||
  routePath.startsWith('/onboarding')
    ? 'auth-page'
    : 'protected-probe'

const main = async () => {
  const manifest = await buildRouteManifest()
  const manifestPath = await writeRouteManifestEvidence(manifest)
  const baseUrl = resolveBaseUrl()
  const timeoutMs = parseNumberOption('--timeout-ms', DEFAULT_TIMEOUT_MS)
  const manifestOnly = parseFlag('--manifest-only')
  const allStaticProtected = parseFlag('--all-static-protected')

  const targetRoutes = manifest.routes.filter((route) => {
    if (route.auditTargets.includes('auth-browser')) {
      return true
    }

    if (allStaticProtected && route.access === 'protected' && !route.requiresFixture) {
      return true
    }

    return route.auditTargets.includes('protected-browser-probe')
  })

  const fixtureMissing = manifest.routes
    .filter((route) => route.requiresFixture)
    .map((route) => ({
      path: route.path,
      relativePageFile: route.relativePageFile,
      status: 'fixture_missing' as const,
      targetKind: route.access === 'protected' ? 'protected-probe' as const : 'auth-page' as const,
    }))

  const results: BrowserAuditResult[] = []
  const environment = {
    launchError: null as string | null,
    playwrightBrowserAvailable: true,
  }

  if (!manifestOnly) {
    let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null

    try {
      browser = await chromium.launch({ headless: true })
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
      })

      for (const route of targetRoutes) {
        const page = await context.newPage()
        page.setDefaultNavigationTimeout(timeoutMs)

        const consoleErrors: BrowserAuditResult['consoleErrors'] = []
        const pageErrors: string[] = []
        const failedRequests: BrowserAuditResult['failedRequests'] = []
        const navigationTrail: string[] = []
        const startedAt = Date.now()
        let responseStatus: number | undefined
        let finalUrl: string | undefined
        let status: BrowserAuditResult['status'] = 'pass'

        page.on('console', (message) => {
          if (message.type() !== 'error') {
            return
          }

          const location = message.location()
          consoleErrors.push({
            location: location.url ? `${location.url}:${location.lineNumber ?? 0}` : undefined,
            text: message.text(),
          })
        })

        page.on('pageerror', (error) => {
          pageErrors.push(error.message)
        })

        page.on('requestfailed', (request) => {
          failedRequests.push({
            errorText: request.failure()?.errorText,
            method: request.method(),
            resourceType: request.resourceType(),
            url: request.url(),
          })
        })

        page.on('framenavigated', (frame) => {
          if (frame !== page.mainFrame()) {
            return
          }

          navigationTrail.push(frame.url())
        })

        try {
          const response = await page.goto(absoluteUrl(baseUrl, route.path), {
            waitUntil: 'networkidle',
          })
          responseStatus = response?.status()
          finalUrl = page.url()

          if (navigationTrail.length > REDIRECT_LOOP_NAVIGATION_THRESHOLD) {
            status = 'redirect_loop'
          } else if (finalUrl) {
            const finalPath = new URL(finalUrl).pathname
            if (responseStatus && responseStatus >= 400) {
              status = 'failed'
            } else if (route.path !== finalPath) {
              status = GATED_DESTINATIONS.some(
                (destination) => finalPath === destination || finalPath.startsWith(`${destination}/`)
              )
                ? 'gated'
                : 'failed'
            }
          }
        } catch (error) {
          finalUrl = page.url()
          const errorMessage = error instanceof Error ? error.message : String(error)
          pageErrors.push(errorMessage)
          status = errorMessage.includes('ERR_TOO_MANY_REDIRECTS') ? 'redirect_loop' : 'failed'
        }

        results.push({
          consoleErrors,
          durationMs: Date.now() - startedAt,
          failedRequests,
          finalUrl,
          navigationTrail,
          pageErrors,
          responseStatus,
          routePath: route.path,
          status,
          targetKind: inferTargetKind(route.path),
          warningCount: consoleErrors.length + pageErrors.length + failedRequests.length,
        })

        await page.close()
      }

      await context.close()
    } catch (error) {
      environment.playwrightBrowserAvailable = false
      environment.launchError = error instanceof Error ? error.message : String(error)
    } finally {
      await browser?.close()
    }
  }

  const accounting = collectBrowserAccounting(manifest)
  const accountingSummary = summarizeAccounting(accounting)
  const evidence = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    environment,
    manifestOnly,
    manifestPath,
    routeManifestShape: manifest.routeManifestShape,
    summary: {
      blockedByEnvironment: !environment.playwrightBrowserAvailable,
      failedRoutes: results.filter((result) => result.status === 'failed').length,
      fixtureMissing: fixtureMissing.length,
      gatedRoutes: results.filter((result) => result.status === 'gated').length,
      passedRoutes: results.filter((result) => result.status === 'pass').length,
      redirectLoops: results.filter((result) => result.status === 'redirect_loop').length,
      totalTargets: targetRoutes.length,
    },
    accounting: {
      byReason: {
        dynamicFixtureMissing: accountingSummary['dynamic-fixture-missing'],
        nonPublicRoute: accountingSummary['non-public-route'],
        protectedNotProbedByDefault: accountingSummary['protected-not-probed-by-default'],
      },
      entries: accounting,
      fixtureMissing,
    },
    results,
  }

  const evidencePath = await writeEvidence('auth-route-browser.json', evidence)
  console.log(`Route manifest: ${manifestPath}`)
  console.log(`Auth route browser evidence: ${evidencePath}`)
  if (environment.launchError) {
    console.log(`Playwright launch blocker: ${environment.launchError}`)
  }
  console.log(
    `Targets: ${targetRoutes.length}; pass=${evidence.summary.passedRoutes}; gated=${evidence.summary.gatedRoutes}; failed=${evidence.summary.failedRoutes}; redirect_loop=${evidence.summary.redirectLoops}; fixture_missing=${evidence.summary.fixtureMissing}`
  )
}

main().catch((error) => {
  console.error('Failed to run auth route browser audit.')
  console.error(error)
  process.exit(1)
})
