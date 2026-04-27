import { expect } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
} from './support/authenticated-demo'

test.describe('demo-auth learning flow', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run demo-auth learning coverage.',
  )

  test('canceling a ready but unentered session does not create a resume CTA', async ({
    page,
  }) => {
    test.setTimeout(90000)
    await page.goto('/dashboard/drills', {
      waitUntil: 'domcontentloaded',
    })

    await expect(
      page.getByRole('heading', { name: /Intelligent Configurator/i }),
    ).toBeVisible()

    await page.waitForTimeout(5000)
    await page.getByRole('button', { name: /Add All/i }).click()
    await expect(page.getByText(/Targeting 2 subjects/i)).toBeVisible()
    await page.getByLabel(/Slide to start session/i).press('Enter')

    await expect(
      page.getByRole('heading', { name: /Session Ready/i }),
    ).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: /^Cancel$/ }).click()

    await expect(
      page.getByRole('heading', { name: /Intelligent Configurator/i }),
    ).toBeVisible()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', { name: /Intelligent Configurator/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Resume session/i }),
    ).toHaveCount(0)
  })

  test('drills hub launches a custom session and supports one answer submission', async ({
    page,
  }) => {
    test.setTimeout(90000)
    const response = await page.goto('/dashboard/drills', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard/drills should return 2xx').toBe(true)
    await expect(
      page.getByRole('heading', { name: /Build Mastery\. Earn your Score\./i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Intelligent Configurator/i }),
    ).toBeVisible()

    await page.waitForTimeout(5000)
    await page.getByRole('button', { name: /Add All/i }).click()
    await expect(page.getByText(/Targeting 2 subjects/i)).toBeVisible()
    await page.getByLabel(/Slide to start session/i).press('Enter')

    await expect(
      page.getByRole('heading', { name: /Session Ready/i }),
    ).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: /Enter Session/i }).click()

    await expect(page).toHaveURL(/\/quiz\/custom\/session\//, {
      timeout: 60000,
    })
    await expect(
      page.getByRole('heading', { name: /Question 1/i }),
    ).toBeVisible()
    await expect(page.getByLabel(/Slide to submit/i)).toBeVisible()

    await page.getByRole('radio', { name: /Option A:/ }).check({ force: true })
    await page.getByLabel(/Slide to submit/i).press('Enter')

    await expect(page.getByRole('status')).toContainText(/Correct/i)
    await expect(
      page.getByRole('button', { name: /^Next question$|^See results$/ }).first(),
    ).toBeVisible()
  })
})
