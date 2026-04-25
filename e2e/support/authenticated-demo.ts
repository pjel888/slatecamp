import { expect, test as base, type Page } from '@playwright/test'

export const demoAuthEnabled = process.env.PLAYWRIGHT_DEMO_AUTH === 'true'

export const authenticatedDemoTest = base.extend<{ assertNoAppErrors: void }>({
  assertNoAppErrors: [
    async ({ page }, use) => {
      const errors: string[] = []

      page.on('pageerror', (error) => {
        errors.push(error.message)
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
  return page.goto(path, { waitUntil: 'commit' }).catch((error) => {
    const message = String(error)
    if (
      message.includes('ERR_ABORTED') ||
      message.includes('frame was detached')
    ) {
      return null
    }

    throw error
  })
}
