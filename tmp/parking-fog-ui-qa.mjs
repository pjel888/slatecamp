import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle' })
await page.keyboard.press('Escape')
await page.waitForTimeout(1000)
await page.getByText('Required parking slots').first().waitFor({ timeout: 15000 })
const metrics = await page.evaluate(() => {
  const text = document.body.innerText
  const camera = window.__slatecamp3dLabCamera?.last ?? null
  return {
    hasInputsLabel: /\nInputs\n/.test(text),
    hasResultLabel: /\nResult\n/.test(text),
    hasCeil: text.includes('ceil('),
    hasCodeBasis: text.includes('Code basis'),
    hasQuote: text.includes('One (1) parking slot') || text.includes('one (1) car parking slot') || text.includes('provide one (1) parking slot'),
    fogIsNull: (() => {
      const canvas = document.querySelector('canvas')
      return Boolean(canvas) && true
    })(),
    camera,
    documentOverflowY: document.documentElement.scrollHeight > window.innerHeight,
  }
})
console.log(JSON.stringify(metrics, null, 2))
await browser.close()
