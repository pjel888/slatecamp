import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ baseURL: 'http://localhost:3001', viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => window.localStorage.setItem('slatecamp_sidebar_expanded', 'false'))
await page.goto('/dashboard', { waitUntil: 'load' })
await page.waitForTimeout(5000)
const sidebar = page.getByRole('navigation', { name: 'Main navigation' })
await sidebar.screenshot({ path: '.omx/artifacts/sidebar-navigation/sidebar-collapsed-after.png' })
await page.getByRole('button', { name: 'Expand sidebar' }).click()
await page.waitForTimeout(700)
await sidebar.screenshot({ path: '.omx/artifacts/sidebar-navigation/sidebar-expanded-after.png' })
const labels = ['Dashboard', 'Wiki', 'Notes', '3D Lab', 'Drills', 'Camp Trail', 'Flash Cards', 'Analytics', 'Settings']
const centers = {}
for (const label of labels) {
  const box = await sidebar.locator(`[data-t="${label}"] svg`).first().boundingBox()
  centers[label] = Number((box.x + box.width / 2).toFixed(2))
}
console.log(JSON.stringify({ expandedWidth: Math.round((await sidebar.boundingBox()).width), iconCenters: centers }, null, 2))
await browser.close()
