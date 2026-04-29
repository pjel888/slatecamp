import { expect, type Locator, type Page } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
} from './support/authenticated-demo'

const navLabels = [
  'Dashboard',
  'Wiki',
  'Notes',
  '3D Lab',
  'Drills',
  'Camp Trail',
  'Flash Cards',
  'Analytics',
  'Settings',
] as const

const removedSubItems = /Site Development|Stairs|Unified Wall|Sessions/

test.describe('sidebar navigation rail', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run sidebar navigation coverage.',
  )

  test('keeps primary icon centers fixed in collapsed and expanded states', async ({
    page,
  }) => {
    test.setTimeout(90_000)

    await page.setViewportSize({ width: 1440, height: 900 })
    const response = await page.goto('/dashboard', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard should return 2xx').toBe(true)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(100)
    await setSidebarExpanded(page, false)

    const sidebar = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(sidebar).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Rendering', { exact: false })).toHaveCount(0, {
      timeout: 30_000,
    })
    await expect(sidebar.locator('[data-t="Dashboard"]')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(sidebar).not.toContainText(removedSubItems)
    await page.waitForTimeout(2000)

    await expect.poll(() => sidebarWidth(sidebar)).toBe(52)
    const collapsedCenters = await iconCenterPoints(sidebar)

    await setSidebarExpanded(page, true)
    await expect.poll(() => sidebarWidth(sidebar)).toBe(256)
    await expect(sidebar).not.toContainText(removedSubItems)
    await assertIconCentersUnchanged(sidebar, collapsedCenters)

    await setSidebarExpanded(page, false)
    await expect.poll(() => sidebarWidth(sidebar)).toBe(52)
    await assertIconCentersUnchanged(sidebar, collapsedCenters)

    const wikiLink = sidebar.locator('[data-t="Wiki"]')
    await wikiLink.hover()
    await expect(page.locator('[data-slot="tooltip-content"]')).toContainText(
      'Wiki',
    )
  })
})

async function sidebarWidth(sidebar: Locator) {
  const box = await sidebar.boundingBox()
  return Math.round(box?.width ?? 0)
}

async function setSidebarExpanded(page: Page, expanded: boolean) {
  await page.evaluate((value) => {
    window.localStorage.setItem('slatecamp_sidebar_expanded', String(value))
  }, expanded)
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Rendering', { exact: false })).toHaveCount(0, {
    timeout: 30_000,
  })
}

type CenterPoint = {
  x: number
  y: number
}

async function iconCenterPoints(sidebar: Locator) {
  const centers: Record<string, CenterPoint> = {}

  for (const label of navLabels) {
    const icon = sidebar.locator(`[data-t="${label}"] svg`).first()
    const box = await icon.boundingBox()

    expect(box, `${label} icon should be measurable`).not.toBeNull()
    centers[label] = {
      x: Number((box!.x + box!.width / 2).toFixed(2)),
      y: Number((box!.y + box!.height / 2).toFixed(2)),
    }
  }

  return centers
}

async function assertIconCentersUnchanged(
  sidebar: Locator,
  baseline: Record<string, CenterPoint>,
) {
  const current = await iconCenterPoints(sidebar)

  for (const label of navLabels) {
    expect(
      Math.abs(current[label].x - baseline[label].x),
      `${label} icon x-center moved from ${baseline[label].x} to ${current[label].x}`,
    ).toBeLessThanOrEqual(0.5)
    expect(
      Math.abs(current[label].y - baseline[label].y),
      `${label} icon y-center moved from ${baseline[label].y} to ${current[label].y}`,
    ).toBeLessThanOrEqual(0.5)
  }
}
