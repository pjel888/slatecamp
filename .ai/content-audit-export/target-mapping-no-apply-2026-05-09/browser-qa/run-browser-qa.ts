import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

type BrowserQaMetrics = {
  rawPlaceholderOpenCount?: number
  rawPlaceholderCloseCount?: number
  extractedPropsLineCount?: number
  hasWikiArticleError?: boolean
  h1Count?: number
  h2Count?: number
  articleTextLength?: number
  emptyHeadingCount?: number
  brokenImageCount?: number
  horizontalOverflow?: boolean
}

type TableExpectation = {
  caption: string
  minRoleTableCount: number
  minTabCount: number
  expectedTexts: string[]
}

type TableMetrics = {
  required: boolean
  captionPresent: boolean
  roleTableCount: number
  nativeTableCount: number
  tabListCount: number
  tabCount: number
  missingExpectedTexts: string[]
}

const targetRoot = path.resolve('.ai/content-audit-export/target-mapping-no-apply-2026-05-09')
const qaRoot = path.join(targetRoot, 'browser-qa')
const manifestPath = path.join(qaRoot, 'render-manifest.json')
const screenshotsRoot = path.join(qaRoot, 'screenshots')
mkdirSync(screenshotsRoot, { recursive: true })

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

const viewports = [
  { name: 'desktop', width: 1440, height: 900, screenshot: true },
  { name: 'mobile', width: 390, height: 844, screenshot: true },
]

const tableExpectations: Record<string, TableExpectation> = {
  'bp-344-ramp-slope-tiers': {
    caption: 'BP 344 ramp checks from the cited Appendix A excerpts',
    minRoleTableCount: 1,
    minTabCount: 2,
    expectedTexts: ['Ramp geometry', 'Handrail checks', 'Clear width', '1200 mm minimum'],
  },
  'pd-1096-rule-vii-area-metrics': {
    caption: 'PD 1096 Rule VII controls to separate before computing',
    minRoleTableCount: 1,
    minTabCount: 2,
    expectedTexts: ['Location checks', 'Area controls', 'Direct access', 'Section 704.1(a)'],
  },
}

function failReasons(
  metrics: BrowserQaMetrics | undefined,
  tableMetrics: TableMetrics | null,
  tableExpectation: TableExpectation | undefined,
  consoleErrors: string[],
  pageErrors: string[],
) {
  const reasons: string[] = []
  if (!metrics) reasons.push('window.__slatecampBrowserQa missing')
  if (metrics?.rawPlaceholderOpenCount !== 0) reasons.push(`raw placeholder openings rendered: ${metrics?.rawPlaceholderOpenCount}`)
  if (metrics?.rawPlaceholderCloseCount !== 0) reasons.push(`raw placeholder closings rendered: ${metrics?.rawPlaceholderCloseCount}`)
  if (metrics?.extractedPropsLineCount !== 0) reasons.push(`placeholder props summaries rendered: ${metrics?.extractedPropsLineCount}`)
  if (metrics?.hasWikiArticleError) reasons.push('WikiArticle error state rendered')
  if ((metrics?.h1Count ?? 0) < 1) reasons.push('missing article h1')
  if ((metrics?.h2Count ?? 0) < 4) reasons.push(`too few h2 sections: ${metrics?.h2Count ?? 0}`)
  if ((metrics?.articleTextLength ?? 0) < 2500) reasons.push(`article text too short in browser: ${metrics?.articleTextLength ?? 0}`)
  if ((metrics?.emptyHeadingCount ?? 0) > 0) reasons.push(`empty headings rendered: ${metrics?.emptyHeadingCount}`)
  if ((metrics?.brokenImageCount ?? 0) > 0) reasons.push(`broken images rendered: ${metrics?.brokenImageCount}`)
  if (metrics?.horizontalOverflow) reasons.push('horizontal overflow detected')
  if (tableExpectation) {
    if (!tableMetrics) reasons.push('table expectation metrics missing')
    if (tableMetrics && !tableMetrics.captionPresent) reasons.push('WikiTableTabs caption missing')
    if (tableMetrics && tableMetrics.roleTableCount < tableExpectation.minRoleTableCount) reasons.push(`too few role="table" elements: ${tableMetrics.roleTableCount}`)
    if (tableMetrics && tableMetrics.tabCount < tableExpectation.minTabCount) reasons.push(`too few table tabs: ${tableMetrics.tabCount}`)
    if (tableMetrics && tableMetrics.nativeTableCount > 0) reasons.push(`native <table> elements rendered: ${tableMetrics.nativeTableCount}`)
    if (tableMetrics?.missingExpectedTexts.length) reasons.push(`missing expected table text: ${tableMetrics.missingExpectedTexts.join(', ')}`)
  }
  if (consoleErrors.length) reasons.push(`console errors: ${consoleErrors.length}`)
  if (pageErrors.length) reasons.push(`page errors: ${pageErrors.length}`)
  return reasons
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const results: any[] = []

  for (const article of manifest.articles) {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
      const consoleErrors: string[] = []
      const consoleWarnings: string[] = []
      const pageErrors: string[] = []

      page.on('console', (msg) => {
        const line = `${msg.type()}: ${msg.text()}`
        if (msg.type() === 'error') consoleErrors.push(line)
        if (msg.type() === 'warning') consoleWarnings.push(line)
      })
      page.on('pageerror', (err) => pageErrors.push(err.message))

      const fileUrl = pathToFileURL(path.resolve(article.preview_file)).href
      await page.goto(fileUrl, { waitUntil: 'load' })
      await page.waitForTimeout(100)

      const metrics = await page.evaluate(() => (window as any).__slatecampBrowserQa as BrowserQaMetrics)
      const tableExpectation = tableExpectations[article.slug]
      const tableMetrics = tableExpectation
        ? await page.evaluate((expectation) => {
          const body = document.querySelector('[data-qa-article-body]')
          const text = body?.textContent ?? ''
          return {
            required: true,
            captionPresent: text.includes(expectation.caption),
            roleTableCount: body?.querySelectorAll('[role="table"]').length ?? 0,
            nativeTableCount: body?.querySelectorAll('table').length ?? 0,
            tabListCount: body?.querySelectorAll('[role="tablist"]').length ?? 0,
            tabCount: body?.querySelectorAll('[role="tab"]').length ?? 0,
            missingExpectedTexts: expectation.expectedTexts.filter((expected) => !text.includes(expected)),
          }
        }, tableExpectation)
        : null
      const screenshotFile = `${article.slug}-${viewport.name}.png`
      const screenshotPath = path.join(screenshotsRoot, screenshotFile)
      if (viewport.screenshot) {
        await page.screenshot({ path: screenshotPath, fullPage: true })
      }

      const reasons = failReasons(metrics, tableMetrics, tableExpectation, consoleErrors, pageErrors)
      results.push({
        article_id: article.article_id,
        label: article.label,
        slug: article.slug,
        title: article.title,
        viewport: viewport.name,
        dimensions: { width: viewport.width, height: viewport.height },
        url: fileUrl,
        screenshot: screenshotPath,
        metrics,
        table_expectation: tableExpectation ?? null,
        table_metrics: tableMetrics,
        console_errors: consoleErrors,
        console_warnings: consoleWarnings,
        page_errors: pageErrors,
        status: reasons.length ? 'FAIL' : 'PASS',
        fail_reasons: reasons,
      })
      await page.close()
    }
  }

  await browser.close()

  const summary = {
    generated_at: new Date().toISOString(),
    scope: 'local browser-rendered QA for 5 mapped existing article repairs only',
    mutation_status: 'No Supabase article/question apply and no insertion workflow executed by this QA harness.',
    render_method: 'candidate.md compiled through SlateCamp compileWikiArticleWithRenderer(), served as local static HTML, opened in Chromium via Playwright.',
    article_count: manifest.articles.length,
    viewport_count: viewports.length,
    pass_count: results.filter((r) => r.status === 'PASS').length,
    fail_count: results.filter((r) => r.status === 'FAIL').length,
    overall_status: results.every((r) => r.status === 'PASS') ? 'PASS' : 'FAIL',
    results,
  }

  writeFileSync(path.join(qaRoot, 'browser-results.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify({
    overall_status: summary.overall_status,
    pass_count: summary.pass_count,
    fail_count: summary.fail_count,
    results: results.map((r) => ({ slug: r.slug, viewport: r.viewport, status: r.status, fail_reasons: r.fail_reasons, screenshot: r.screenshot })),
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
