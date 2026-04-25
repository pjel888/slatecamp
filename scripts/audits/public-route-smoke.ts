import {
  absoluteUrl,
  buildRouteManifest,
  collectPublicAccounting,
  parseFlag,
  parseNumberOption,
  resolveBaseUrl,
  summarizeAccounting,
  writeEvidence,
  writeRouteManifestEvidence,
} from './_shared'

type PublicRouteSmokeResult = {
  durationMs: number
  error?: string
  finalUrl?: string
  redirectChain: string[]
  routePath: string
  status: 'pass' | 'failed' | 'gated' | 'redirect_loop'
  statusCode?: number
}

const DEFAULT_TIMEOUT_MS = 12_000
const DEFAULT_MAX_REDIRECTS = 8
const KNOWN_GATED_PATH_PREFIXES = ['/login', '/register', '/forgot-password', '/admin/login', '/dashboard', '/developer', '/admin', '/ceo']

const isRedirect = (statusCode: number) => statusCode >= 300 && statusCode < 400

const tracePublicRoute = async (
  baseUrl: string,
  routePath: string,
  timeoutMs: number,
  maxRedirects: number
): Promise<PublicRouteSmokeResult> => {
  const redirectChain: string[] = []
  const startedAt = Date.now()
  let currentUrl = absoluteUrl(baseUrl, routePath)

  try {
    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      redirectChain.push(currentUrl)
      const timeout = AbortSignal.timeout(timeoutMs)
      const response = await fetch(currentUrl, {
        headers: {
          'user-agent': 'SlateCamp public-route-smoke audit',
        },
        redirect: 'manual',
        signal: timeout,
      })

      if (!isRedirect(response.status)) {
        const finalUrl = currentUrl
        const finalPath = new URL(finalUrl).pathname
        const status =
          response.status >= 400
            ? 'failed'
            : KNOWN_GATED_PATH_PREFIXES.some(
                  (prefix) => finalPath === prefix || finalPath.startsWith(`${prefix}/`)
                ) && routePath !== finalPath
              ? 'gated'
              : 'pass'

        return {
          durationMs: Date.now() - startedAt,
          finalUrl,
          redirectChain,
          routePath,
          status,
          statusCode: response.status,
        }
      }

      const location = response.headers.get('location')
      if (!location) {
        return {
          durationMs: Date.now() - startedAt,
          error: `Redirect response missing location header (${response.status}).`,
          finalUrl: currentUrl,
          redirectChain,
          routePath,
          status: 'failed',
          statusCode: response.status,
        }
      }

      const nextUrl = new URL(location, currentUrl).toString()
      if (redirectChain.includes(nextUrl)) {
        redirectChain.push(nextUrl)
        return {
          durationMs: Date.now() - startedAt,
          error: `Redirect loop detected after revisiting ${nextUrl}.`,
          finalUrl: nextUrl,
          redirectChain,
          routePath,
          status: 'redirect_loop',
          statusCode: response.status,
        }
      }

      currentUrl = nextUrl
    }

    return {
      durationMs: Date.now() - startedAt,
      error: `Redirect loop suspected after exceeding ${maxRedirects} redirects.`,
      finalUrl: currentUrl,
      redirectChain,
      routePath,
      status: 'redirect_loop',
    }
  } catch (error) {
    return {
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      finalUrl: currentUrl,
      redirectChain,
      routePath,
      status: 'failed',
    }
  }
}

const main = async () => {
  const manifest = await buildRouteManifest()
  const manifestPath = await writeRouteManifestEvidence(manifest)
  const baseUrl = resolveBaseUrl()
  const timeoutMs = parseNumberOption('--timeout-ms', DEFAULT_TIMEOUT_MS)
  const maxRedirects = parseNumberOption('--max-redirects', DEFAULT_MAX_REDIRECTS)
  const manifestOnly = parseFlag('--manifest-only')

  const targetRoutes = manifest.routes.filter((route) => route.auditTargets.includes('public-smoke'))
  const results: PublicRouteSmokeResult[] = []

  if (!manifestOnly) {
    for (const route of targetRoutes) {
      results.push(await tracePublicRoute(baseUrl, route.path, timeoutMs, maxRedirects))
    }
  }

  const accounting = collectPublicAccounting(manifest)
  const accountingSummary = summarizeAccounting(accounting)
  const evidence = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    manifestOnly,
    manifestPath,
    routeManifestShape: manifest.routeManifestShape,
    summary: {
      failedRoutes: results.filter((result) => result.status === 'failed').length,
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
    },
    results,
  }

  const evidencePath = await writeEvidence('public-route-smoke.json', evidence)
  console.log(`Route manifest: ${manifestPath}`)
  console.log(`Public route smoke evidence: ${evidencePath}`)
  console.log(
    `Targets: ${targetRoutes.length}; pass=${evidence.summary.passedRoutes}; gated=${evidence.summary.gatedRoutes}; failed=${evidence.summary.failedRoutes}; redirect_loop=${evidence.summary.redirectLoops}`
  )
}

main().catch((error) => {
  console.error('Failed to run public route smoke audit.')
  console.error(error)
  process.exit(1)
})
