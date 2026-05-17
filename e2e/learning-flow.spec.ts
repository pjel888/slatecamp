import { expect, type Page } from '@playwright/test'
import {
  authenticatedDemoTest as test,
  demoAuthEnabled,
} from './support/authenticated-demo'
import { dragSliderToSubmit } from './support/quiz-gestures'

test.describe('demo-auth learning flow', () => {
  test.skip(
    !demoAuthEnabled,
    'Set PLAYWRIGHT_DEMO_AUTH=true to run demo-auth learning coverage.',
  )

  const selectAllDemoSubjects = async (page: Page) => {
    await page.getByRole('button', { name: /Add all/i }).click()
    await expect(page.getByText(/Subjects selected/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/^2$/).first()).toBeVisible({ timeout: 10_000 })
  }

  const openQuizBuilder = async (page: Page) => {
    await expect(
      page.getByRole('heading', { name: /Choose a quiz mode/i }),
    ).toBeVisible({ timeout: 30_000 })
    const buildQuizButton = page.getByRole('button', { name: /Build quiz/i })
    const box = await buildQuizButton.boundingBox()
    if (!box) throw new Error('Build quiz button is not visible')
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await expect(
      page.getByRole('heading', { name: /Build SlateCamp Quiz/i }),
    ).toBeVisible({ timeout: 30_000 })
  }

  test('quiz builder opens and returns to mode selection without starting a session', async ({
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
    await openQuizBuilder(page)
    await page.getByRole('button', { name: /^Close$/ }).click()

    await expect(
      page.getByRole('heading', { name: /Choose a quiz mode/i }),
    ).toBeVisible({ timeout: 10_000 })
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
    await openQuizBuilder(page)

    await page.waitForTimeout(5000)
    await selectAllDemoSubjects(page)
    await dragSliderToSubmit(page, page.getByTestId('quiz-start-slider'))

    await expect(page).toHaveURL(/\/dashboard\/quiz\/session\//, {
      timeout: 60000,
    })
    await expect(
      page.getByRole('heading', { name: /Question 1/i }),
    ).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('quiz-submit-slider')).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('radio', { name: /Option A:/ }).check({ force: true })
    await expect(page.getByRole('radio', { name: /Option A:/ })).toBeChecked()
    await dragSliderToSubmit(page, page.getByTestId('quiz-submit-slider'), {
      waitForLabel: /Checking your answer|Answer checked/i,
    })

    await expect(
      page.getByRole('button', { name: /^Next question$|^See results$/ }).first(),
    ).toBeVisible({ timeout: 20000 })
  })
})
