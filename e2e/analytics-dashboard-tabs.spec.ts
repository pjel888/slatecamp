import { expect, type Page } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
  gotoAllowRedirectAbort,
} from './support/authenticated-demo'

const analyticsTabs = [
  {
    id: 'ready',
    label: 'Ready',
    primaryPanels: ['subject-mastery', 'readiness', 'exam-countdown'],
  },
  {
    id: 'focus',
    label: 'Focus',
    primaryPanels: ['weakest-topics', 'topic-intelligence', 'error-patterns'],
  },
  {
    id: 'practice',
    label: 'Practice',
    primaryPanels: ['session-history', 'accuracy-by-subject', 'pacing-insights'],
  },
  {
    id: 'habits',
    label: 'Habits',
    primaryPanels: ['study-streak', 'timeline-heatmap', 'forgetting-curves'],
  },
] as const

const analyticsDetails = [
  {
    tab: 'ready',
    detail: 'readiness-diagnostics',
    panels: ['simulation', 'irt-trajectory', 'progress-card', 'radar'],
  },
  {
    tab: 'ready',
    detail: 'calibration',
    panels: ['calibration-score', 'confidence-calibration', 'metacognition'],
  },
  {
    tab: 'ready',
    detail: 'exam-outcome',
    panels: ['exam-outcome'],
  },
  {
    tab: 'practice',
    detail: 'pacing',
    panels: [
      'pacing-quadrant',
      'pacing-accuracy',
      'difficulty-mastery',
      'time-spent',
    ],
  },
  {
    tab: 'habits',
    detail: 'retention',
    panels: [
      'memory',
      'study-velocity',
      'relearning-velocity',
      'reading-correlation',
      'reading-depth',
      'mastery-sparkline',
    ],
  },
  {
    tab: 'habits',
    detail: 'stamina',
    panels: ['stamina', 'stamina-heatmap', 'mode-funnel', 'multimodal-study'],
  },
] as const

const legacyDestinations = [
  ['readiness', '/dashboard/analytics?tab=ready'],
  ['performance', '/dashboard/analytics?tab=practice'],
  ['topics', '/dashboard/analytics?tab=focus'],
  ['learning', '/dashboard/analytics?tab=habits&detail=retention'],
  ['behavior', '/dashboard/analytics?tab=habits'],
  ['calibration', '/dashboard/analytics?tab=ready&detail=calibration'],
] as const

const desktopViewports = [
  { width: 1440, height: 900 },
  { width: 1512, height: 982 },
  { width: 1920, height: 1080 },
] as const

const pathAndSearch = (url: string) => {
  const parsed = new URL(url)
  return `${parsed.pathname}${parsed.search}`
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const installNextDevPerformanceMeasureGuard = async (page: Page) => {
  await page.addInitScript(() => {
    const originalMeasure = window.performance.measure.bind(window.performance)

    window.performance.measure = ((
      measureName: string,
      startOrMeasureOptions?: string | PerformanceMeasureOptions,
      endMark?: string,
    ) => {
      try {
        return originalMeasure(measureName, startOrMeasureOptions as never, endMark)
      } catch (error) {
        if (String(error).includes('cannot have a negative time stamp')) {
          return undefined as unknown as PerformanceMeasure
        }

        throw error
      }
    }) as Performance['measure']
  })
}

const expectPrimaryTabStrip = async (page: Page) => {
  const tabLinks = page.locator('[data-analytics-tab-link]')

  await expect(tabLinks).toHaveCount(4, { timeout: 15000 })
  await expect(page.locator('[data-analytics-tab-strip]')).toBeVisible()
}

const expectPrimaryTabPanel = async (page: Page, tabId: string) => {
  await expect(page.locator(`[data-analytics-tab="${tabId}"]`)).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator(`[data-analytics-tab-panel="${tabId}"]`)).toBeVisible({
    timeout: 15000,
  })
}

const getWorkspaceMetrics = (tabId: string) => {
  const documentElement = document.documentElement
  const body = document.body
  const main = document.querySelector('main')
  const shell = document.querySelector(`[data-analytics-shell][data-analytics-tab="${tabId}"]`)
  const panel = document.querySelector(`[data-analytics-tab-panel="${tabId}"]`)

  if (
    !(main instanceof HTMLElement) ||
    !(shell instanceof HTMLElement) ||
    !(panel instanceof HTMLElement)
  ) {
    return null
  }

  const shellRect = shell.getBoundingClientRect()
  const clippedPrimaryPanels = Array.from(
    shell.querySelectorAll('[data-analytics-primary-panel]'),
  )
    .filter((element) => element instanceof HTMLElement)
    .filter((element) => {
      const rect = element.getBoundingClientRect()
      return (
        rect.bottom > shellRect.bottom + 2 ||
        rect.right > shellRect.right + 2 ||
        rect.top < shellRect.top - 2 ||
        rect.left < shellRect.left - 2
      )
    })
    .map((element) =>
      (element as HTMLElement).dataset.analyticsPrimaryPanel ?? 'unknown',
    )

  return {
    bodyClientHeight: body.clientHeight,
    bodyScrollHeight: body.scrollHeight,
    documentClientHeight: documentElement.clientHeight,
    documentScrollHeight: documentElement.scrollHeight,
    mainClientHeight: main.clientHeight,
    mainClientWidth: main.clientWidth,
    mainScrollHeight: main.scrollHeight,
    panelClientHeight: panel.clientHeight,
    panelScrollHeight: panel.scrollHeight,
    shellClientHeight: shell.clientHeight,
    shellScrollHeight: shell.scrollHeight,
    clippedPrimaryPanels,
  }
}

test.describe('analytics dashboard relevance-first tabs', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run authenticated analytics coverage.',
  )

  test.beforeEach(async ({ page }) => {
    await installNextDevPerformanceMeasureGuard(page)
  })

  for (const tab of analyticsTabs) {
    test(`renders ${tab.id} as one of four primary tabs`, async ({ page }) => {
      test.setTimeout(150000)
      await page.setViewportSize({ width: 1440, height: 900 })
      await gotoAllowRedirectAbort(page, `/dashboard/analytics?tab=${tab.id}`)

      await expectPrimaryTabStrip(page)
      await expect(page).toHaveURL(
        new RegExp(`/dashboard/analytics\\?tab=${tab.id}$`),
      )
      await expect(
        page.locator(`[data-analytics-tab-link="${tab.id}"]`),
      ).toHaveAttribute('aria-current', 'page')
      await expectPrimaryTabPanel(page, tab.id)
      await expect(
        page.locator(
          `[data-analytics-tab="${tab.id}"] [data-analytics-primary-panel]`,
        ),
      ).toHaveCount(tab.primaryPanels.length)
      await expect(
        page.locator(
          `[data-analytics-tab="${tab.id}"] [data-analytics-detail-panel]`,
        ),
      ).toHaveCount(0)

      for (const panel of tab.primaryPanels) {
        await expect(
          page.locator(`[data-analytics-primary-panel="${panel}"]`),
        ).toBeVisible()
      }
    })
  }

  for (const viewport of desktopViewports) {
    for (const tab of analyticsTabs) {
      test(`keeps ${tab.id} non-scrollable at ${viewport.width}x${viewport.height}`, async ({
        page,
      }) => {
        test.setTimeout(180000)
        await page.setViewportSize(viewport)
        await gotoAllowRedirectAbort(page, `/dashboard/analytics?tab=${tab.id}`)
        await expect(page).toHaveURL(
          new RegExp(`/dashboard/analytics\\?tab=${tab.id}$`),
        )
        await expectPrimaryTabPanel(page, tab.id)

        const metrics = await page.evaluate(getWorkspaceMetrics, tab.id)

        expect(metrics).not.toBeNull()
        expect(metrics?.mainClientWidth).toBeGreaterThan(1200)
        expect(metrics?.documentScrollHeight).toBeLessThanOrEqual(
          (metrics?.documentClientHeight ?? 0) + 8,
        )
        expect(metrics?.bodyScrollHeight).toBeLessThanOrEqual(
          (metrics?.bodyClientHeight ?? 0) + 8,
        )
        expect(metrics?.mainScrollHeight).toBeLessThanOrEqual(
          (metrics?.mainClientHeight ?? 0) + 8,
        )
        expect(metrics?.shellScrollHeight).toBeLessThanOrEqual(
          (metrics?.shellClientHeight ?? 0) + 8,
        )
        expect(metrics?.panelScrollHeight).toBeLessThanOrEqual(
          (metrics?.panelClientHeight ?? 0) + 8,
        )
        expect(metrics?.clippedPrimaryPanels).toEqual([])
      })
    }
  }

  for (const detail of analyticsDetails) {
    test(`renders canonical detail ${detail.tab}/${detail.detail}`, async ({
      page,
    }) => {
      test.setTimeout(150000)
      await page.setViewportSize({ width: 1440, height: 900 })
      await gotoAllowRedirectAbort(
        page,
        `/dashboard/analytics?tab=${detail.tab}&detail=${detail.detail}`,
      )

      await expect(page).toHaveURL(
        new RegExp(
          `/dashboard/analytics\\?tab=${detail.tab}&detail=${detail.detail}$`,
        ),
      )
      await expect(
        page.locator(`[data-analytics-tab-link="${detail.tab}"]`),
      ).toHaveAttribute('aria-current', 'page')
      await expect(
        page.locator(
          `[data-analytics-tab-panel="${detail.tab}"][data-analytics-detail="${detail.detail}"]`,
        ),
      ).toBeVisible()
      await expect(
        page.locator('[data-analytics-primary-panel]'),
      ).toHaveCount(0)
      await expect(
        page.locator('[data-analytics-detail-panel]'),
      ).toHaveCount(detail.panels.length)

      for (const panel of detail.panels) {
        await expect(
          page.locator(`[data-analytics-detail-panel="${panel}"]`),
        ).toBeVisible()
      }
    })
  }

  test('canonicalizes invalid tab and detail state safely', async ({ page }) => {
    test.setTimeout(150000)
    await page.setViewportSize({ width: 1440, height: 900 })

    await gotoAllowRedirectAbort(page, '/dashboard/analytics')
    await expect(page.locator('[data-analytics-tab-link="ready"]')).toHaveAttribute(
      'aria-current',
      'page',
    )

    await gotoAllowRedirectAbort(page, '/dashboard/analytics?tab=unknown')
    await expect(page).toHaveURL(/\/dashboard\/analytics\?tab=ready$/)
    expect(pathAndSearch(page.url())).toBe('/dashboard/analytics?tab=ready')

    await gotoAllowRedirectAbort(
      page,
      '/dashboard/analytics?tab=practice&detail=stamina',
    )
    await expect(page).toHaveURL(/\/dashboard\/analytics\?tab=practice$/)
    expect(pathAndSearch(page.url())).toBe('/dashboard/analytics?tab=practice')

    await gotoAllowRedirectAbort(page, '/dashboard/analytics?detail=calibration')
    await expect(page).toHaveURL(
      /\/dashboard\/analytics\?tab=ready&detail=calibration$/,
    )
    expect(pathAndSearch(page.url())).toBe(
      '/dashboard/analytics?tab=ready&detail=calibration',
    )

    await gotoAllowRedirectAbort(
      page,
      '/dashboard/analytics?tab=habits&detail=missing',
    )
    await expect(page).toHaveURL(/\/dashboard\/analytics\?tab=habits$/)
    expect(pathAndSearch(page.url())).toBe('/dashboard/analytics?tab=habits')
  })

  test('preserves legacy analytics tab aliases and advanced route', async ({
    page,
  }) => {
    test.setTimeout(150000)
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [legacy, destination] of legacyDestinations) {
      await gotoAllowRedirectAbort(page, `/dashboard/analytics?tab=${legacy}`)
      await expect(page).toHaveURL(new RegExp(`${escapeRegExp(destination)}$`))
      expect(pathAndSearch(page.url())).toBe(destination)
    }

    await gotoAllowRedirectAbort(page, '/dashboard/analytics/advanced')
    await expect(page).toHaveURL(/\/dashboard\/analytics\?tab=ready$/)
    expect(pathAndSearch(page.url())).toBe('/dashboard/analytics?tab=ready')
  })

  test('keeps mobile tab panel regions reachable', async ({ page }) => {
    test.setTimeout(150000)
    await page.setViewportSize({ width: 393, height: 852 })
    await gotoAllowRedirectAbort(page, '/dashboard/analytics?tab=habits')

    const region = page.locator('[data-analytics-panel-scroll-region="habits"]')
    await expect(region).toBeVisible()
    await expect(region).toHaveAttribute('aria-label', 'Habits analytics panel')
    await expect(region).toHaveAttribute('tabindex', '0')

    await region.focus()
    await expect(region).toBeFocused()

    const before = await region.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    }))

    if (before.scrollHeight > before.clientHeight) {
      await page.keyboard.press('PageDown')
      await expect
        .poll(() => region.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(before.scrollTop)
    }
  })
})
