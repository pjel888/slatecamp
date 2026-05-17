import { expect, type Page } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
} from './support/authenticated-demo'

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

    await setSidebarExpanded(page, true)
    await expect(sidebar).not.toContainText(removedSubItems)

    await setSidebarExpanded(page, false)

    await expect(sidebar.locator('[data-t="Quiz"]')).toHaveAttribute(
      'href',
      '/dashboard/quiz',
    )
  })

  test('uses the mobile navigation shell without rendering the desktop rail', async ({
    page,
  }) => {
    test.setTimeout(90_000)
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

async function setSidebarExpanded(page: Page, expanded: boolean) {
  const sidebar = page.getByRole('navigation', { name: 'Main navigation' })
  const toggle = sidebar.getByRole('button', {
    name: expanded ? 'Expand sidebar' : 'Collapse sidebar',
  })

  if ((await toggle.count()) > 0 && (await toggle.first().isVisible())) {
    await toggle.first().click()
  }

  await expect(
    sidebar.getByRole('button', {
      name: expanded ? 'Collapse sidebar' : 'Expand sidebar',
    }),
  ).toBeVisible()
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
