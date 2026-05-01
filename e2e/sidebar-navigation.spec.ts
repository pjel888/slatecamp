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
  'Quiz',
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
    await suppressNextDevPortal(page)
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

    const quizLink = sidebar.locator('[data-t="Quiz"]')
    await quizLink.click()
    await expect(page).toHaveURL(/\/dashboard\/quiz$/)
    await expect(sidebar.locator('[data-t="Quiz"]')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('uses the mobile navigation shell without rendering the desktop rail', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const response = await page.goto('/dashboard/quiz', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard/quiz should return 2xx on mobile').toBe(
      true,
    )
    await suppressNextDevPortal(page)

    await expect(
      page.getByRole('button', { name: 'Open navigation' }),
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeHidden()
  })
})

async function sidebarWidth(sidebar: Locator) {
  const box = await sidebar.boundingBox()
  return Math.round(box?.width ?? 0)
}

async function setSidebarExpanded(page: Page, expanded: boolean) {
  const sidebar = page.getByRole('navigation', { name: 'Main navigation' })
  const targetWidth = expanded ? 256 : 52
  const currentWidth = await sidebarWidth(sidebar)

  if (currentWidth !== targetWidth) {
    const toggle = sidebar.getByRole('button', {
      name: expanded ? 'Expand sidebar' : 'Collapse sidebar',
    })

    await expect(toggle).toBeVisible()
    await toggle.click()
    await expect.poll(() => sidebarWidth(sidebar)).toBe(targetWidth)
  }
}

async function suppressNextDevPortal(page: Page) {
  await page.addStyleTag({
    content: `
      nextjs-portal {
        display: none !important;
        pointer-events: none !important;
      }
    `,
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
