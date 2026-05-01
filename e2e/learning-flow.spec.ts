import { expect, type Page } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
} from './support/authenticated-demo'

test.describe('demo-auth learning flow', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run demo-auth learning coverage.',
  )

  const selectAllDemoSubjects = async (page: Page) => {
    await page.getByRole('button', { name: /Add All/i }).click()
    const targetingText = page.getByText(/Targeting 2 subjects/i)

    try {
      await expect(targetingText).toBeVisible({ timeout: 10_000 })
      return
    } catch {
      for (const subjectName of [/Building Code/i, /Structures/i]) {
        const subjectButton = page.getByRole('button', { name: subjectName })
        if ((await subjectButton.getAttribute('aria-pressed')) !== 'true') {
          await subjectButton.click({ force: true })
        }
      }
    }

    await expect(targetingText).toBeVisible({ timeout: 10_000 })
  }

  test('canceling a ready but unentered session does not create a resume CTA', async ({
    page,
  }) => {
    test.setTimeout(90000)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/dashboard/quiz', {
      waitUntil: 'domcontentloaded',
    })

    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(
      page.getByRole('heading', { name: /Configure your quiz/i }),
    ).toBeVisible()

    await page.waitForTimeout(5000)
    await selectAllDemoSubjects(page)
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
    await page.setViewportSize({ width: 1440, height: 900 })
    const response = await page.goto('/dashboard/quiz', {
      waitUntil: 'domcontentloaded',
    })

    expect(response?.ok(), '/dashboard/quiz should return 2xx').toBe(true)
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(
      page.getByRole('heading', { name: /Build mastery with one focused quiz/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /Configure your quiz/i }),
    ).toBeVisible()

    await page.waitForTimeout(5000)
    await selectAllDemoSubjects(page)
    await page.getByLabel(/Slide to start quiz/i).press('Enter')

    await expect(
      page.getByRole('heading', { name: /Quiz Ready/i }),
    ).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: /Enter Quiz/i }).click()

    await expect(page).toHaveURL(/\/dashboard\/quiz\/session\//, {
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
