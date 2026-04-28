import { expect, test as base, type Page } from '@playwright/test'

export const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'

export const authenticatedDemoTest = base.extend<{ assertNoAppErrors: void }>({
  assertNoAppErrors: [
    async ({ page }, use) => {
      const errors: string[] = []

      page.on('pageerror', (error) => {
        errors.push(error.stack || error.message)
      })
      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(message.text())
        }
      })

      await use()

      expect(errors, 'browser runtime errors').toEqual([])
    },
    { auto: true },
  ],
})

export async function gotoAllowRedirectAbort(page: Page, path: string) {
  const response = await page.goto(path, {
    timeout: 120000,
    waitUntil: 'commit',
  }).catch((error) => {
    const message = String(error)
    if (
      message.includes('ERR_ABORTED') ||
      message.includes('frame was detached') ||
      (message.includes('Timeout') && page.url() !== 'about:blank')
    ) {
      return null
    }

    throw error
  })

  if (page.url() === 'about:blank') {
    return page.goto(path, {
      timeout: 120000,
      waitUntil: 'commit',
    })
  }

  return response
}

export async function slideControlByLabel(page: Page, label: RegExp | string) {
  const slider = page.getByLabel(label)
  const handle = slider.locator('[aria-hidden="true"]').last()
  const box = await handle.boundingBox()

  if (!box) {
    throw new Error(`Unable to resolve slider bounds for ${String(label)}`)
  }

  const startX = box.x + box.width / 2
  const endX = box.x + 220
  const y = box.y + box.height / 2

  await page.mouse.move(startX, y)
  await page.mouse.down()
  await page.mouse.move(endX, y, { steps: 12 })
  await page.mouse.up()
}
