import { expect, test, type Page } from '@playwright/test'
import { dragSliderToSubmit } from './support/quiz-gestures'
import {
  QUIZ_REAL_SEED,
  assertQuizRealServerEnv,
  hasQuizRealDbEnv,
  seedQuizRealDb,
} from './support/quiz-real-db'

const noQuestionsServerMessage =
  'No questions found. Try widening your selection or changing difficulty.'
const emptyPoolDiagnosticMessage = '[intelligent-routing] Empty pool after all fallbacks'

async function selectSubject(page: Page, name: string | RegExp, selectedCount: number) {
  const configurator = page.getByRole('dialog', { name: /Build SlateCamp Quiz/i })
  await expect(configurator).toBeVisible({ timeout: 60_000 })
  const subjectOption = configurator.getByRole('button', { name, exact: typeof name === 'string' })
  await subjectOption.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'center' })
  })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if ((await subjectOption.getAttribute('aria-pressed')) === 'true') break
    await subjectOption.click({ force: true })
    await page.waitForTimeout(150)
    if ((await subjectOption.getAttribute('aria-pressed')) === 'true') break
    const box = await subjectOption.boundingBox()
    if (!box) throw new Error(`Subject option ${String(name)} is not visible`)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(150)
    if ((await subjectOption.getAttribute('aria-pressed')) === 'true') break
    await subjectOption.press('Enter')
    await page.waitForTimeout(150)
  }
  await expect(
    page.getByText(new RegExp(`Subjects selected|${selectedCount} subject`, 'i')),
    `selected subject count target ${selectedCount}`,
  ).toBeVisible({ timeout: 10_000 })
}

async function openQuiz(page: Page) {
  await page.addInitScript(() => window.localStorage.clear())
  const response = await page.goto('/dashboard/quiz', {
    waitUntil: 'domcontentloaded',
  })

  expect(response?.ok(), '/dashboard/quiz should return 2xx').toBe(true)
  await expect(
    page.getByRole('heading', { name: /Choose a quiz mode/i }),
  ).toBeVisible({ timeout: 60_000 })
  const buildQuizButton = page.getByRole('button', { name: /Build quiz/i })
  const box = await buildQuizButton.boundingBox()
  if (!box) throw new Error('Build quiz button is not visible')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(
    page.getByRole('heading', { name: /Build SlateCamp Quiz/i }),
  ).toBeVisible({ timeout: 60_000 })
}

test.describe('real seeded quiz session flow', () => {
  test.skip(
    !hasQuizRealDbEnv(),
    'Set PLAYWRIGHT_QUIZ_REAL_DB=true with Supabase service env to run real quiz E2E.',
  )

  test.beforeAll(async () => {
    assertQuizRealServerEnv()
    await seedQuizRealDb()
  })

  test.beforeEach(async () => {
    await seedQuizRealDb()
  })

  test('starts through real slide controls, submits persisted questions, and opens results through the final transition', async ({
    page,
  }) => {
    test.setTimeout(180_000)
    await openQuiz(page)
    await selectSubject(page, QUIZ_REAL_SEED.subjectName, 1)

    await dragSliderToSubmit(page, page.getByTestId('quiz-start-slider'))

    await expect(page.locator('body')).not.toContainText(noQuestionsServerMessage, {
      timeout: 5_000,
    })
    await expect(page).toHaveURL(/\/dashboard\/quiz\/session\//, {
      timeout: 60_000,
    })

    for (const questionNumber of QUIZ_REAL_SEED.questionIds.map((_, index) => index + 1)) {
      await expect(page.getByTestId('quiz-current-question')).toContainText(
        new RegExp(`Question ${questionNumber}\\b`, 'i'),
        { timeout: 30_000 },
      )
      await expect(page.getByTestId('quiz-current-question')).toContainText(
        /Playwright seeded quiz question/i,
      )
      await expect(page.getByTestId('quiz-answer-option')).toHaveCount(4)

      await page.getByRole('radio', { name: /Option A:/ }).check({ force: true })
      await expect(page.getByRole('radio', { name: /Option A:/ })).toBeChecked()

      await dragSliderToSubmit(page, page.getByTestId('quiz-submit-slider'), {
        waitForLabel: /Checking your answer|Answer checked/i,
      })
      await expect(
        page.locator('[role="status"]').filter({ hasText: /Correct|Not quite/i }),
      ).toBeVisible({ timeout: 30_000 })

      if (questionNumber < QUIZ_REAL_SEED.questionIds.length) {
        await page.getByRole('button', { name: /^Next question$/i }).first().click()
      }
    }

    await page.getByRole('button', { name: /^See results$/i }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/quiz\/session\/[^/]+\/results/, {
      timeout: 60_000,
    })
    await expect(page.getByTestId('quiz-results')).toBeVisible({ timeout: 60_000 })
  })

  test('supports accessible keyboard fallback for the start slider', async ({ page }) => {
    test.setTimeout(120_000)
    await openQuiz(page)
    await selectSubject(page, QUIZ_REAL_SEED.subjectName, 1)

    await page.getByTestId('quiz-start-slider').press('Enter')

    await expect(page.locator('body')).not.toContainText(noQuestionsServerMessage, {
      timeout: 5_000,
    })
    await expect(page).toHaveURL(/\/dashboard\/quiz\/session\//, {
      timeout: 60_000,
    })
  })

  test('shows a recoverable error when selected filters have no matching questions', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await openQuiz(page)

    await selectSubject(page, QUIZ_REAL_SEED.emptySubjectName, 1)
    await dragSliderToSubmit(page, page.getByTestId('quiz-start-slider'))

    await expect(page.locator('body')).toContainText(noQuestionsServerMessage, {
      timeout: 30_000,
    })
    expect(
      consoleErrors.every(
        (message) =>
          message.includes(noQuestionsServerMessage) ||
          message.includes(emptyPoolDiagnosticMessage),
      ),
    ).toBe(true)

    await selectSubject(page, QUIZ_REAL_SEED.subjectName, 2)
    await dragSliderToSubmit(page, page.getByTestId('quiz-start-slider'))
    await expect(page).toHaveURL(/\/dashboard\/quiz\/session\//, {
      timeout: 60_000,
    })
  })
})
