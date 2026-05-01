import { chromium } from 'playwright'
const base = process.env.BASE_URL || 'http://localhost:3001'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ baseURL: base })
await context.addInitScript(() => {
  localStorage.setItem('3dlab_onboarded', 'true')
  localStorage.setItem('slatecamp-3dlab:onboarding:v1:global-complete', 'true')
  localStorage.setItem('slatecamp-viewport-onboarding-seen', 'true')
  localStorage.setItem('slatecamp-3dlab:onboarding:v1:viewport-tooltip-seen', 'true')
  localStorage.setItem('module_stairway-configurator_seen', 'true')
  localStorage.setItem('slatecamp-3dlab:onboarding:v1:module:stairway-configurator:seen', 'true')
})
const page = await context.newPage()
const errors = []
page.on('console', msg => { if (msg.type()==='error') errors.push(msg.text()) })
await page.goto('/dashboard/3d-lab/stairway-configurator', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.getByTestId('3dlab-shell-toolbar-overlay').getByTestId('3dlab-control-iso-se').waitFor({ timeout: 30000 })
await page.waitForTimeout(2500)
const read = () => page.evaluate(() => {
  const q = (id) => document.querySelector(`[data-testid="${id}"]`)
  const canvas = document.querySelector('canvas')
  const canvasKeys = canvas ? Object.keys(canvas).filter((k) => /r3f|fiber|react|three/i.test(k)).slice(0,20) : []
  return {
    url: location.href,
    canvas: !!canvas,
    canvasKeys,
    controls: {
      se: q('3dlab-control-iso-se')?.getAttribute('aria-pressed'),
      ne: q('3dlab-control-iso-ne')?.getAttribute('aria-pressed'),
      persp: q('3dlab-control-persp')?.getAttribute('aria-pressed'),
      iso: q('3dlab-control-iso')?.getAttribute('aria-pressed'),
      slider: !!q('3dlab-control-zoom-slider'),
    },
    globalControls: globalThis.__slatecamp3dLabControls,
  }
})
console.log('initial', JSON.stringify(await read(), null, 2))
async function click(id) {
  await page.getByTestId('3dlab-shell-toolbar-overlay').getByTestId(id).evaluate(el => el.click())
  await page.waitForTimeout(1200)
  return read()
}
console.log('after iso', JSON.stringify(await click('3dlab-control-iso'), null, 2))
console.log('after persp', JSON.stringify(await click('3dlab-control-persp'), null, 2))
console.log('errors', JSON.stringify(errors.slice(0,5), null, 2))
await browser.close()
