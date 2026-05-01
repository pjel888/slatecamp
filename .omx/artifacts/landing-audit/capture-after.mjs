import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const outDir = '.omx/artifacts/landing-audit';
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const targets = [
  { name: 'after-desktop', url: 'http://localhost:3001/', viewport: { width: 1440, height: 1000 }, wait: 4500 },
  { name: 'after-tablet', url: 'http://localhost:3001/', viewport: { width: 768, height: 1000 }, wait: 3500 },
  { name: 'after-mobile', url: 'http://localhost:3001/', viewport: { width: 390, height: 844 }, wait: 3500, isMobile: true },
];
const results = [];
for (const target of targets) {
  const context = await browser.newContext({ viewport: target.viewport, isMobile: !!target.isMobile, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) consoleMessages.push(`${msg.type()}: ${msg.text().slice(0,300)}`); });
  page.on('pageerror', err => consoleMessages.push(`pageerror: ${err.message.slice(0,300)}`));
  try {
    const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(target.wait);
    await page.screenshot({ path: `${outDir}/${target.name}.png`, fullPage: true });
    const data = await page.evaluate(() => {
      const getRect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      const buttons = [...document.querySelectorAll('a,button,summary')].map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName.toLowerCase(), text: (el.innerText||el.textContent||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,100), href: el.href || null, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
      }).slice(0, 80);
      return {
        title: document.title,
        statusText: document.body.innerText.slice(0,200),
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        docH: document.documentElement.getBoundingClientRect().height,
        h1Count: document.querySelectorAll('h1').length,
        hero: getRect('main section'),
        canvas: [...document.querySelectorAll('canvas')].map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) }; }),
        ctaVisible: [...document.querySelectorAll('a')].some(a => /Start the readiness check|Go to Dashboard|Go to dashboard/.test(a.textContent || '') && a.getBoundingClientRect().height > 0),
        buttons,
      };
    });
    results.push({ name: target.name, ok: true, status: response?.status(), screenshot: `${outDir}/${target.name}.png`, consoleMessages, ...data });
  } catch (e) {
    results.push({ name: target.name, ok: false, error: String(e), consoleMessages });
  }
  await context.close();
}
await browser.close();
await fs.writeFile(`${outDir}/capture-after.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map(r => ({name:r.name, ok:r.ok, status:r.status, overflowX:r.overflowX, h1Count:r.h1Count, hero:r.hero, canvas:r.canvas, ctaVisible:r.ctaVisible, consoleMessages:r.consoleMessages?.slice(0,8), error:r.error})), null, 2));
