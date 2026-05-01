import { chromium } from 'playwright'

const url = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001'
const labels = ['Dashboard', 'Wiki', 'Notes', '3D Lab', 'Drills', 'Camp Trail', 'Flash Cards', 'Analytics', 'Settings']

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => window.localStorage.setItem('slatecamp_sidebar_expanded', 'false'))
await page.goto(`${url}/dashboard`, { waitUntil: 'load' })
await page.waitForTimeout(5000)

async function measure() {
  return page.evaluate((labels) => {
    const center = (rect) => ({
      x: Number((rect.left + rect.width / 2).toFixed(3)),
      y: Number((rect.top + rect.height / 2).toFixed(3)),
    })

    const out = {}
    for (const label of labels) {
      const svg = document.querySelector(`[data-t="${label}"] svg`)
      out[label] = svg ? center(svg.getBoundingClientRect()) : null
    }

    const toggle = document.querySelector('button[aria-label="Expand sidebar"] svg, button[aria-label="Collapse sidebar"] svg')
    if (toggle) out.__toggle = center(toggle.getBoundingClientRect())

    const nav = document.querySelector('nav[aria-label="Main navigation"]')
    if (nav) out.__sidebarWidth = Number(nav.getBoundingClientRect().width.toFixed(3))
    return out
  }, labels)
}

const samples = []
samples.push({ t: 'collapsed-before', ...(await measure()) })
await page.getByRole('button', { name: 'Expand sidebar' }).click()
for (let i = 0; i < 18; i++) {
  await page.waitForTimeout(16)
  samples.push({ t: `expand-${i}`, ...(await measure()) })
}
await page.waitForTimeout(350)
samples.push({ t: 'expanded-after', ...(await measure()) })
await page.getByRole('button', { name: 'Collapse sidebar' }).click()
for (let i = 0; i < 18; i++) {
  await page.waitForTimeout(16)
  samples.push({ t: `collapse-${i}`, ...(await measure()) })
}
await page.waitForTimeout(350)
samples.push({ t: 'collapsed-after', ...(await measure()) })

const drift = {}
for (const key of [...labels, '__toggle']) {
  const vals = samples.map((s) => s[key]).filter((v) => v && typeof v.x === 'number' && typeof v.y === 'number')
  const xs = vals.map((v) => v.x)
  const ys = vals.map((v) => v.y)
  drift[key] = {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    xDelta: Number((Math.max(...xs) - Math.min(...xs)).toFixed(3)),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
    yDelta: Number((Math.max(...ys) - Math.min(...ys)).toFixed(3)),
  }
}
console.log(JSON.stringify({
  drift,
  samples: samples.map((s) => ({
    t: s.t,
    width: s.__sidebarWidth,
    Dashboard: s.Dashboard,
    Wiki: s.Wiki,
    '3D Lab': s['3D Lab'],
    Drills: s.Drills,
    Analytics: s.Analytics,
    Settings: s.Settings,
    toggle: s.__toggle,
  })),
}, null, 2))
await browser.close()
