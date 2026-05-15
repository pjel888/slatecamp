import { chromium } from 'playwright'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForSelector('canvas', { timeout: 30000 })
const result = await page.evaluate(() => {
  const text = document.body.innerText
  const els = [...document.querySelectorAll('*')]
  const byText = (needle) => els.find(el => el.textContent?.trim() === needle)
  const right = document.querySelector('[aria-label="Parking requirement result"]')
  const canvas = document.querySelector('canvas')
  return {
    hasOldQuoteContainer: text.includes('“Restaurants, fast-food centers'),
    hasRawQuote: text.includes('Restaurants, fast-food centers, bars and beerhouses: One (1) car slot for every 30.00 sq. meters of customer area.'),
    hasInputLabel: text.includes('Your input'),
    hasMeasuredAs: text.includes('Measured as'),
    hasLawCardTitle: text.includes('PD 1096 — NBCP'),
    hasSourceBadge: text.includes('source'),
    hasPersonDomHint: text.toLowerCase().includes('human silhouette'),
    rightPanel: right ? { scrollHeight: right.scrollHeight, clientHeight: right.clientHeight, width: Math.round(right.getBoundingClientRect().width) } : null,
    canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
    requiredCardFound: !!byText('Required parking slots'),
  }
})
console.log(JSON.stringify({ result, errors: errors.slice(0, 5) }, null, 2))
await browser.close()
