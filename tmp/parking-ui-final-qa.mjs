import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForSelector('canvas', { timeout: 30000 })
await page.keyboard.press('Escape')
await page.waitForTimeout(250)
await page.locator('[data-testid="3dlab-shell-left-sidebar"] button[aria-haspopup="listbox"]').click()
const result = await page.evaluate(() => {
  const text = document.body.innerText
  const left = document.querySelector('[data-testid="3dlab-shell-left-sidebar"] [aria-label="Parking requirement inputs"]')
  const right = document.querySelector('[data-testid="3dlab-shell-right-sidebar"] [aria-label="Parking requirement result"]')
  const trigger = left?.querySelector('button[aria-haspopup="listbox"]')
  const projectLabel = [...document.querySelectorAll('[data-testid="3dlab-shell-left-sidebar"] *')].find(el => el.textContent?.trim() === 'Project type')
  const groups = [...document.querySelectorAll('[role="listbox"] div')]
    .map(el => el.textContent?.trim())
    .filter(t => ['Food and beverage','Retail','Business / mixed-use','Hotels','Healthcare','Industrial','Residential'].includes(t || ''))
  const dividers = [...document.querySelectorAll('[role="listbox"] .border-t')].length
  const rr = right?.getBoundingClientRect()
  const lr = left?.getBoundingClientRect()
  const tr = trigger?.getBoundingClientRect()
  const pr = projectLabel?.getBoundingClientRect()
  const rightText = right?.innerText || ''
  return {
    hasComputedOrCalculatedPill: /\b(COMPUTED|CALCULATED)\b/.test(rightText),
    rightGrossFloorAreaCount: (rightText.match(/gross floor area/gi) || []).length,
    noHuaVisible: !/\bHUA\b/.test(text),
    noGfaVisible: !/\bGFA\b/.test(text),
    hasHighlyUrbanizedLabel: text.includes('Hotel in a highly urbanized area'),
    hasOtherHotelLabel: text.includes('Hotel in other areas'),
    groups,
    dividers,
    hasBasedOnYourInput: rightText.includes('Based on your input'),
    hasInputSqm: rightText.includes('700 sqm gross floor area'),
    hasOneLineSlotsRequired: rightText.includes('parking slots required'),
    rightPanel: right ? { width: Math.round(rr.width), scrollHeight: right.scrollHeight, clientHeight: right.clientHeight } : null,
    leftPanel: left ? { scrollHeight: left.scrollHeight, clientHeight: left.clientHeight } : null,
    selectTopDeltaFromPanel: left && trigger ? Math.round(tr.top - lr.top) : null,
    labelToSelectGap: projectLabel && trigger ? Math.round(tr.top - pr.bottom) : null,
  }
})
console.log(JSON.stringify(result, null, 2))
await browser.close()
