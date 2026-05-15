import { chromium } from 'playwright'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage({ viewport: { width: 1440, height: 820 } })
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(err.message))

await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')]
    .find((b) => b.innerText.includes('Office or commercial condominium'))
  button?.click()
})
await page.waitForTimeout(250)

const result = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('[role="option"]')]
  const heights = buttons.map((button) => Math.round(button.getBoundingClientRect().height))
  const labelAndHintSpans = buttons.flatMap((button) => [...button.querySelectorAll('span span')])
    .filter((span) => span.textContent?.trim())
  const overflowingText = labelAndHintSpans
    .filter((span) => span.scrollWidth > span.clientWidth + 1 || span.scrollHeight > span.clientHeight + 1)
    .map((span) => span.textContent?.trim())
  const projectSection = [...document.querySelectorAll('section')]
    .find((section) => section.textContent?.includes('Project type'))
  const nestedWrapperCount = projectSection
    ? [...projectSection.children].filter((child) => child.tagName === 'DIV').length
    : null
  const pageText = document.body.innerText
  return {
    optionCount: buttons.length,
    heights,
    uniqueHeights: [...new Set(heights)],
    overflowingText,
    nestedWrapperCount,
    hasRuleLabelInDropdown: /1 car slot per|1 parking slot per/.test(pageText),
    hasHuaOrGfa: /\bHUA\b|\bGFA\b/.test(pageText),
    hasHumanScaleToggle: [...document.querySelectorAll('button')].some((b) => /human scale/i.test(b.innerText || b.getAttribute('aria-label') || '')),
  }
})

await browser.close()
console.log(JSON.stringify({ errors, result }, null, 2))
if (errors.length) process.exit(1)
if (result.optionCount !== 9) process.exit(2)
if (result.uniqueHeights.length !== 1 || result.uniqueHeights[0] !== 68) process.exit(3)
if (result.overflowingText.length) process.exit(4)
if (result.nestedWrapperCount !== 1) process.exit(5)
if (result.hasRuleLabelInDropdown) process.exit(6)
if (result.hasHuaOrGfa) process.exit(7)
if (result.hasHumanScaleToggle) process.exit(8)
