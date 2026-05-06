import { expect, test } from '@playwright/test'

const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'

/** Click an element by bounding-box center to work around Base UI trigger quirks */
async function nativeClick(page: import('@playwright/test').Page, locator: import('@playwright/test').Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element not visible for native click')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

test.describe('dialog accessibility and interaction', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run dialog accessibility coverage.',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/developer/tools/test-data', {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('body')).toContainText('Test Data Generator', {
      timeout: 15000,
    })
    // Allow React hydration to finish before interacting with Base UI triggers
    await page.waitForTimeout(3000)
  })

  test('AlertDialog opens from trigger and exposes correct accessible semantics', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })
    await expect(trigger).toBeVisible()

    await nativeClick(page, trigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()

    // Accessible name from title
    await expect(dialog).toContainText('Generate Test Sessions')
    await expect(dialog).toContainText(
      'This will create 5 mock quiz sessions in the database. Continue?',
    )

    // Dialog exposes correct ARIA role
    const dialogRole = await dialog.evaluate((el) => el.getAttribute('role'))
    expect(dialogRole).toBe('dialog')
  })

  test('AlertDialog closes on Escape key', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })
    await nativeClick(page, trigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Page remains usable after close
    await expect(trigger).toBeVisible()
    await expect(trigger).toBeEnabled()
  })

  test('AlertDialog closes on Cancel button click', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })
    await nativeClick(page, trigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()

    const cancel = dialog.getByRole('button', { name: 'Cancel' })
    await nativeClick(page, cancel)
    await expect(dialog).not.toBeVisible()

    await expect(trigger).toBeVisible()
  })

  test('AlertDialog closes on overlay click', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })
    await nativeClick(page, trigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()

    // Click the backdrop (outside the dialog content)
    const backdrop = page.locator('[data-slot="dialog-overlay"]').first()
    const box = await dialog.boundingBox()
    if (box) {
      // Click well outside the dialog center
      await page.mouse.click(box.x - 50, box.y + box.height / 2)
    } else {
      await nativeClick(page, backdrop)
    }

    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeVisible()
  })

  test('AlertDialog keyboard navigation works inside dialog', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })
    await nativeClick(page, trigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()

    // Get all focusable elements inside the dialog
    const focusable = await dialog
      .locator(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      .all()
    expect(focusable.length).toBeGreaterThanOrEqual(2)

    const expectDialogFocus = async () => {
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const active = document.activeElement
            if (!active?.closest('[data-slot="dialog-content"]')) return null
            return active.textContent?.trim() || active.getAttribute('aria-label')
          })
        )
        .toMatch(/Cancel|Generate/)
    }

    // Tab should move focus between dialog elements after Base UI focus guards settle.
    await page.keyboard.press('Tab')
    await expectDialogFocus()

    // Tab again and verify focus is still trapped within dialog controls.
    await page.keyboard.press('Tab')
    await expectDialogFocus()

    // Shift+Tab should also wrap within dialog controls.
    await page.keyboard.press('Shift+Tab')
    await expectDialogFocus()

    // Close with Escape to clean up
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('AlertDialog Action button triggers callback and closes dialog', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })
    await nativeClick(page, trigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()

    const action = dialog.getByRole('button', { name: 'Generate' })
    await nativeClick(page, action)

    // Dialog should close after action regardless of server result
    await expect(dialog).not.toBeVisible()

    // Trigger remains usable
    await expect(trigger).toBeVisible()
  })

  test('second AlertDialog on same page behaves independently', async ({
    page,
  }) => {
    const orgTrigger = page.getByRole('button', { name: 'Generate Org' })
    await nativeClick(page, orgTrigger)

    const dialog = page.locator('[data-slot="dialog-content"]')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Generate Test Organization')

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // First dialog still works
    const sessionTrigger = page.getByRole('button', {
      name: 'Generate Sessions',
    })
    await nativeClick(page, sessionTrigger)
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Generate Test Sessions')

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('page is fully usable after dialog open-close cycle', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Generate Sessions' })

    // Open and close
    await nativeClick(page, trigger)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-slot="dialog-content"]')).not.toBeVisible()

    // All original interactive elements remain accessible
    await expect(
      page.getByRole('button', { name: 'Generate Sessions' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Generate Org' }),
    ).toBeVisible()

    // No leftover modal backdrop blocking clicks
    const backdrop = page.locator('[data-slot="dialog-overlay"]')
    await expect(backdrop).toHaveCount(0)
  })
})
