import { test, expect } from '@playwright/test'

async function dragSlider(page, label: string | RegExp) {
  const slider = page.getByLabel(label).first()
  await expect(slider).toBeVisible({ timeout: 60_000 })
  const box = await slider.boundingBox()
  if (!box) throw new Error('slider has no box')
  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.92, box.y + box.height / 2, { steps: 25 })
  await page.mouse.up()
}

test('reproduce drills current failure', async ({ page }) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.goto('/dashboard/drills', { waitUntil: 'domcontentloaded', timeout: 120000 })
  await expect(page.locator('body')).toContainText(/Canvas|Drills|Testing/i, { timeout: 120000 })
  const subject = page.getByRole('button', { name: /^Architectural Design$/i })
  await expect(subject).toBeVisible({ timeout: 60_000 })
  await subject.click()
  await expect(page.locator('body')).toContainText(/Targeting 1 subject/i, { timeout: 10_000 })
  await dragSlider(page, /slide to start session/i)
  await page.waitForTimeout(10_000)
  console.log('URL', page.url())
  console.log('BODY', (await page.locator('body').innerText()).slice(0, 2500))
  console.log('ERRORS', errors)
  expect(errors.join('\n')).not.toContain('No questions found. Try widening your selection or changing difficulty.')
  await expect(page.locator('body')).toContainText(/Session Ready|questions queued|Question\s+1|Option A/i, { timeout: 60_000 })
})
