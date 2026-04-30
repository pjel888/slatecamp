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
    await page.goto('/quiz', {
      waitUntil: 'domcontentloaded',
    })

    await expect(
      page.getByRole('heading', { name: /Configure your quiz/i }),
    ).toBeVisible()

    await page.waitForTimeout(5000)
    await page.getByRole('button', { name: /Add All/i }).click()
    await expect(page.getByText(/Targeting 2 subjects/i)).toBeVisible()
    await page.getByLabel(/Slide to start quiz/i).press('Enter')

    await expect(
      page.getByRole('heading', { name: /Quiz Ready/i }),
    ).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: /^Cancel$/ }).click()

    await expect(
      page.getByRole('heading', { name: /Configure your quiz/i }),
    ).toBeVisible()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', { name: /Configure your quiz/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Resume quiz/i }),
    ).toHaveCount(0)
  })

  test('quiz hub launches a custom session and supports one answer submission', async ({
    page,
  }) => {
    test.setTimeout(150000)
    const response = await page.goto('/quiz', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/quiz should return 2xx').toBe(true)
    await expect(
      page.getByRole('heading', { name: /Build mastery with one focused quiz/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Configure your quiz/i }),
    ).toBeVisible()

    await page.waitForTimeout(5000)
    await page.getByRole('button', { name: /Add All/i }).click()
    await expect(page.getByText(/Targeting 2 subjects/i)).toBeVisible()
    await page.getByLabel(/Slide to start quiz/i).press('Enter')

    await expect(
      page.getByRole('heading', { name: /Quiz Ready/i }),
    ).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: /Enter Quiz/i }).click()

    await expect(page).toHaveURL(/\/quiz\/session\//, {
      timeout: 60000,
    })
    await expect(
      page.getByRole('heading', { name: /Question 1/i }),
    ).toBeVisible({ timeout: 30000 })
    await expect(page.getByLabel(/Slide to submit/i)).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('radio', { name: /Option A:/ }).check({ force: true })
    await page.getByLabel(/Slide to submit/i).press('Enter')

    await expect(
      page.getByRole('button', { name: /^Next question$|^See results$/ }).first(),
    ).toBeVisible({ timeout: 20000 })
  })
})
