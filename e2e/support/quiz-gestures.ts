import { expect, type Locator, type Page } from '@playwright/test'

export async function dragSliderToSubmit(
  page: Page,
  locator: Locator,
  options: { waitForLabel?: RegExp | string } = {},
) {
  await expect(locator).toBeVisible({ timeout: 60_000 })
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('Slider is not visible or has no bounding box')
  }

  const handle = locator.locator('[data-testid$="-handle"]').first()

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const handleBox = (await handle.count()) > 0 ? await handle.boundingBox() : null
    const startX = handleBox ? handleBox.x + handleBox.width / 2 : box.x + box.width * 0.08
    const startY = handleBox ? handleBox.y + handleBox.height / 2 : box.y + box.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width - 6, box.y + box.height / 2, {
      steps: 40,
    })
    await page.mouse.up()
    await page.waitForTimeout(350)

    if (!options.waitForLabel) return

    const label = await locator.textContent()
    if (
      label &&
      (options.waitForLabel instanceof RegExp
        ? options.waitForLabel.test(label)
        : label.includes(options.waitForLabel))
    ) {
      return
    }
  }

  if (options.waitForLabel) {
    await expect(locator).toContainText(options.waitForLabel, { timeout: 10_000 })
  }
}
