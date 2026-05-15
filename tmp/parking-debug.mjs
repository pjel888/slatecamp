import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 820 } })
await page.goto('http://localhost:3000/dashboard/3d-lab/parking-lot-requirements', { waitUntil: 'networkidle' })
console.log(await page.evaluate(() => ({title: document.title, text: document.body.innerText.slice(0,2000), buttons:[...document.querySelectorAll('button')].map(b=>b.innerText || b.getAttribute('aria-label')).slice(0,30)})))
await browser.close()
