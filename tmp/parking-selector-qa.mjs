import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle' })
const desktop = page.getByTestId('3dlab-shell-left-sidebar')
await desktop.getByText('Project type').waitFor({ timeout: 15000 })
await desktop.getByText('Office condo unit').waitFor({ timeout: 15000 })
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
await desktop.locator('button').filter({ hasText: 'Office condo unit' }).click({ force: true })
await page.getByRole('option', { name: /Food and beverage/i }).waitFor({ timeout: 15000 })
const metrics = await page.evaluate(() => {
  const projectType = [...document.querySelectorAll('*')].find((el) => el.textContent?.trim() === 'Project type')
  const trigger = [...document.querySelectorAll('button')].find((el) => el.textContent?.includes('Office condo unit'))
  const options = [...document.querySelectorAll('[role="option"]')]
  const rect = (el) => {
    const r = el.getBoundingClientRect()
    return { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) }
  }
  return {
    hasProjectType: Boolean(projectType),
    triggerRect: trigger ? rect(trigger) : null,
    optionCount: options.length,
    optionLabels: options.map((el) => el.textContent?.trim()).slice(0, 4),
    documentOverflowY: document.documentElement.scrollHeight > window.innerHeight,
  }
})
console.log(JSON.stringify(metrics, null, 2))
await browser.close()
