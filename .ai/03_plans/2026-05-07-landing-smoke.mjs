import { chromium } from '@playwright/test'

const baseUrl = process.env.BASE_URL || 'http://localhost:3000/'
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 750 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
]

const failures = []
const notes = []

const browser = await chromium.launch({ headless: true })

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport })
  const consoleErrors = []
  page.on('console', (msg) => {
    if (['error'].includes(msg.type())) consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(err.message))

  const response = await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 })
  if (!response || !response.ok()) failures.push(`${viewport.name}: homepage did not return 2xx`)

  const sectionAudit = await page.evaluate(() => Array.from(document.querySelectorAll('main > *')).map((el, index) => {
    const r = el.getBoundingClientRect()
    return {
      index,
      id: el.id || el.querySelector(':scope > [id]')?.id || '',
      height: Math.round(r.height),
      textLength: (el.textContent || '').replace(/\s+/g, ' ').trim().length,
      hiddenAnimated: Array.from(el.querySelectorAll('[style*=opacity]')).filter((n) => getComputedStyle(n).opacity === '0').length,
      label: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70),
    }
  }))

  for (const section of sectionAudit) {
    if (section.height < 40) failures.push(`${viewport.name}: section ${section.index} too short (${section.height}px): ${section.label}`)
    if (section.textLength < 20) failures.push(`${viewport.name}: section ${section.index} has little/no text: ${section.label}`)
    if (section.hiddenAnimated > 0) failures.push(`${viewport.name}: section ${section.index} has ${section.hiddenAnimated} opacity-hidden animated children`)
  }

  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]')).map((a) => {
    const href = a.getAttribute('href') || ''
    return { text: a.textContent?.trim() || '', href, target: !!document.getElementById(href.slice(1)) }
  }))
  for (const link of links) {
    if (!link.target) failures.push(`${viewport.name}: missing hash target ${link.href} (${link.text})`)
  }

  await page.getByRole('button', { name: /^1100$/ }).click()
  const explorerTooClose = await page.getByText(/Too close in this study state/).isVisible().catch(() => false)
  if (!explorerTooClose) failures.push(`${viewport.name}: eave 1100 interaction did not show too-close state`)

  await page.getByRole('radio', { name: /Narrow urban lot/ }).click()
  const narrowChecked = await page.getByRole('radio', { name: /Narrow urban lot/ }).getAttribute('aria-checked')
  if (narrowChecked !== 'true') failures.push(`${viewport.name}: lot radio did not update checked state`)

  await page.getByRole('radio', { name: /Because setbacks and clearances/ }).click()
  await page.getByRole('button', { name: /Submit answer/ }).click()
  const explanationVisible = await page.getByText(/Good review does not stop at the answer/).isVisible().catch(() => false)
  if (!explanationVisible) failures.push(`${viewport.name}: quiz submit did not reveal explanation`)

  if (consoleErrors.length) failures.push(`${viewport.name}: console/page errors: ${consoleErrors.join(' | ')}`)
  notes.push(`${viewport.name}: ${sectionAudit.length} sections, ${links.length} hash links, interactions OK`)
  await page.close()
}

await browser.close()

console.log('Landing smoke audit')
for (const note of notes) console.log(`- ${note}`)
if (failures.length) {
  console.error('\nFailures:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('\nPASS: no blank sections, hash targets valid, explorer and quiz interactions work across tested viewports.')
