import { chromium } from 'playwright'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage({ viewport: { width: 1440, height: 820 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push(err.message))
await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const onboardingSkip = [...document.querySelectorAll('button')].find((b) => /skip orientation/i.test(b.innerText))
  onboardingSkip?.click()
})
await page.waitForTimeout(250)

const closed = await page.evaluate(() => {
  const projectSection = [...document.querySelectorAll('section')].find((s) => s.textContent?.includes('Project type'))
  const trigger = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Restaurants and bars') || b.innerText.includes('Office or commercial condominium'))
  const sectionStyle = projectSection ? getComputedStyle(projectSection) : null
  const triggerStyle = trigger ? getComputedStyle(trigger) : null
  return {
    projectSectionChildren: projectSection ? [...projectSection.children].map((el) => el.tagName) : [],
    triggerBorder: triggerStyle?.borderTopWidth,
    triggerBackground: triggerStyle?.backgroundColor,
    triggerShadow: triggerStyle?.boxShadow,
    triggerRect: trigger ? (() => { const r = trigger.getBoundingClientRect(); return { height: Math.round(r.height), width: Math.round(r.width) } })() : null,
    sectionBorderRadius: sectionStyle?.borderTopLeftRadius,
    consoleErrors: [],
  }
})

await page.evaluate(() => {
  const trigger = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Restaurants and bars') || b.innerText.includes('Office or commercial condominium'))
  trigger?.click()
})
await page.waitForTimeout(250)
const open = await page.evaluate(() => {
  const options = [...document.querySelectorAll('[role="option"]')]
  const heights = options.map((el) => Math.round(el.getBoundingClientRect().height))
  const overflowing = options.flatMap((button) => [...button.querySelectorAll('span span')])
    .filter((span) => span.textContent?.trim())
    .filter((span) => span.scrollWidth > span.clientWidth + 1 || span.scrollHeight > span.clientHeight + 1)
    .map((span) => span.textContent?.trim())
  return { optionCount: options.length, heights, uniqueHeights: [...new Set(heights)], overflowing }
})
await browser.close()
console.log(JSON.stringify({ errors, closed, open }, null, 2))
if (errors.length) process.exit(1)
if (closed.projectSectionChildren.join(',') !== 'SPAN,DIV') process.exit(2)
if (closed.triggerBorder !== '0px') process.exit(3)
if (closed.triggerShadow !== 'none') process.exit(4)
if (open.uniqueHeights.length !== 1 || open.uniqueHeights[0] !== 68) process.exit(5)
if (open.overflowing.length) process.exit(6)
