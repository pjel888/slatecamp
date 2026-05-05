import { expect, test } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'test-results', 'ai-inspection')

/** Harmless errors that should not fail the inspection */
const CONSOLE_ERROR_ALLOWLIST = [
  /favicon/i,
  /net::ERR_ABORTED/i,
  /sourcemap/i,
  /Failed to load resource.*\.map/i,
  /^\/__nextjs_original-stack-frame/i,
  /Download the React DevTools/i,
]

/** Non-critical URL patterns that may 404 */
const NETWORK_FAILURE_ALLOWLIST = [
  /favicon/i,
  /\.map$/i,
  /google-analytics/i,
  /googletagmanager/i,
  /fonts\.googleapis/i,
  /fonts\.gstatic/i,
  /chrome-extension:/i,
]

function isAllowedConsoleError(text: string): boolean {
  return CONSOLE_ERROR_ALLOWLIST.some((pattern) => pattern.test(text))
}

function isAllowedNetworkFailure(url: string): boolean {
  return NETWORK_FAILURE_ALLOWLIST.some((pattern) => pattern.test(url))
}

function isCriticalNetworkFailure(url: string, _status?: number): boolean {
  if (isAllowedNetworkFailure(url)) return false
  // Any non-2xx for same-origin document/script/style/font is critical
  try {
    const u = new URL(url)
    const isSameOrigin = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
    const isCriticalAsset = /\.(js|css|html|json|woff2?|ttf|otf)$/i.test(u.pathname)
    return isSameOrigin && isCriticalAsset
  } catch {
    return false
  }
}

function ensureOutDir() {
  mkdirSync(OUT_DIR, { recursive: true })
}

test.describe('AI UI Inspection', () => {
  test('homepage — capture diagnostics for AI review', async ({ page }) => {
    ensureOutDir()

    const consoleErrors: Array<{ type: string; text: string; location?: string }> = []
    const pageErrors: Array<{ message: string; stack?: string; filename?: string; lineno?: number; colno?: number }> = []
    const networkFailures: Array<{ url: string; status?: number; failure?: string }> = []

    // Inject a global error catcher to capture filename/line/col for syntax errors
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__aiInspectionErrors = []
      window.addEventListener('error', (event) => {
        const arr = (window as unknown as Record<string, Array<unknown>>).__aiInspectionErrors
        arr.push({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          errorStack: event.error?.stack,
        })
      })
    })

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location().url,
        })
      }
    })

    page.on('pageerror', (error) => {
      pageErrors.push({
        message: error.message,
        stack: error.stack,
      })
    })

    page.on('response', (response) => {
      const status = response.status()
      if (status >= 400) {
        networkFailures.push({
          url: response.url(),
          status,
        })
      }
    })

    page.on('requestfailed', (request) => {
      networkFailures.push({
        url: request.url(),
        failure: request.failure()?.errorText ?? 'unknown',
      })
    })

    // Navigate to homepage
    const response = await page.goto('/', { waitUntil: 'networkidle' })

    // Screenshots — if these throw, the test fails fast (no report yet)
    await page.screenshot({
      path: path.join(OUT_DIR, 'homepage-full.png'),
      fullPage: true,
    })
    await page.screenshot({
      path: path.join(OUT_DIR, 'homepage-viewport.png'),
    })

    // Collect visible text from key landmarks
    const visibleText = await page.evaluate(() => {
      const landmarks = document.querySelectorAll('h1, h2, header, main, footer')
      return Array.from(landmarks)
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
        .slice(0, 40)
    })

    const title = await page.title()
    const url = page.url()

    // Build report
    const criticalConsoleErrors = consoleErrors.filter((e) => !isAllowedConsoleError(e.text))
    const criticalNetworkFailures = networkFailures.filter((n) =>
      isCriticalNetworkFailure(n.url, n.status),
    )

    const report = {
      inspectedAt: new Date().toISOString(),
      url,
      title,
      viewport: page.viewportSize(),
      visibleTextPreview: visibleText.slice(0, 20),
      consoleErrorCount: consoleErrors.length,
      consoleErrors: consoleErrors.slice(0, 50),
      criticalConsoleErrorCount: criticalConsoleErrors.length,
      criticalConsoleErrors: criticalConsoleErrors.slice(0, 50),
      pageErrorCount: pageErrors.length,
      pageErrors: pageErrors.slice(0, 50),
      networkFailureCount: networkFailures.length,
      networkFailures: networkFailures.slice(0, 50),
      criticalNetworkFailureCount: criticalNetworkFailures.length,
      criticalNetworkFailures: criticalNetworkFailures.slice(0, 50),
      screenshots: [
        'test-results/ai-inspection/homepage-full.png',
        'test-results/ai-inspection/homepage-viewport.png',
      ],
    }

    // Write report BEFORE assertions so it survives failure
    writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))

    // ── Assertions that fail the test when the UI is broken ──

    // 1. Page must load successfully
    expect(response?.ok(), 'Homepage should return HTTP 2xx').toBe(true)

    // 2. Title must contain expected branding
    expect(title, 'Page title should reference SlateCamp').toMatch(/SlateCamp/i)

    // 3. Must contain expected content (sanity check against blank/broken page)
    expect(
      visibleText.some((t) => /LEA|readiness|architecture/i.test(String(t))),
      'Page should contain expected LEA/readiness content',
    ).toBe(true)

    // 4. No uncaught page errors (these are always serious)
    expect(
      pageErrors.length,
      `Uncaught page errors detected: ${pageErrors.map((e) => e.message).join('; ')}`,
    ).toBe(0)

    // 5. No critical console errors
    expect(
      criticalConsoleErrors.length,
      `Critical console errors detected: ${criticalConsoleErrors.map((e) => e.text).join('; ')}`,
    ).toBe(0)

    // 6. No critical network failures (same-origin scripts/styles/fonts)
    expect(
      criticalNetworkFailures.length,
      `Critical network failures detected: ${criticalNetworkFailures.map((n) => `${n.url} (${n.status ?? n.failure})`).join('; ')}`,
    ).toBe(0)
  })
})
