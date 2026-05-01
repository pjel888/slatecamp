import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const outDir = '.omx/artifacts/landing-audit';
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const targets = [
  { name: 'slate-desktop', url: 'http://localhost:3001/', viewport: { width: 1440, height: 1000 }, wait: 3500 },
  { name: 'slate-tablet', url: 'http://localhost:3001/', viewport: { width: 768, height: 1000 }, wait: 2500 },
  { name: 'slate-mobile', url: 'http://localhost:3001/', viewport: { width: 390, height: 844 }, wait: 2500, isMobile: true },
  { name: 'pixelvault', url: 'https://www.pixelvault.fit/', viewport: { width: 1440, height: 1000 }, wait: 4500 },
  { name: 'bruno', url: 'https://bruno-simon.com/', viewport: { width: 1440, height: 1000 }, wait: 6500 },
];
const results = [];
for (const target of targets) {
  const context = await browser.newContext({ viewport: target.viewport, isMobile: !!target.isMobile, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) consoleErrors.push(`${msg.type()}: ${msg.text().slice(0,200)}`); });
  page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message.slice(0,200)}`));
  try {
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(target.wait);
    await page.screenshot({ path: `${outDir}/${target.name}.png`, fullPage: true });
    const data = await page.evaluate(() => {
      const rect = document.documentElement.getBoundingClientRect();
      const qs = (sel) => [...document.querySelectorAll(sel)].map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 220),
        href: el.href || null,
        aria: el.getAttribute('aria-label'),
        classes: el.getAttribute('class'),
      })).slice(0, 80);
      const buttons = [...document.querySelectorAll('a,button,summary')].map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName.toLowerCase(), text: (el.innerText||el.textContent||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,80), href: el.href || null, w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
      }).slice(0, 140);
      const canvases = [...document.querySelectorAll('canvas')].map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) }; });
      const bodyText = (document.body.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 6000);
      const hero = document.querySelector('main section')?.getBoundingClientRect();
      const main = document.querySelector('main')?.getBoundingClientRect();
      const overflowX = document.documentElement.scrollWidth > window.innerWidth;
      const bg = getComputedStyle(document.body).backgroundColor;
      return { title: document.title, url: location.href, width: innerWidth, height: innerHeight, docH: Math.round(rect.height), scrollW: document.documentElement.scrollWidth, overflowX, bg, hero: hero ? {w: Math.round(hero.width), h: Math.round(hero.height), top: Math.round(hero.top)} : null, main: main ? {w: Math.round(main.width), h: Math.round(main.height)} : null, headings: qs('h1,h2,h3'), buttons, canvases, bodyText };
    });
    results.push({ name: target.name, ok: true, screenshot: `${outDir}/${target.name}.png`, consoleErrors: consoleErrors.slice(0,20), ...data });
  } catch (e) {
    results.push({ name: target.name, ok: false, error: String(e), consoleErrors });
  }
  await context.close();
}
await browser.close();
await fs.writeFile(`${outDir}/capture.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map(r => ({name:r.name, ok:r.ok, title:r.title, url:r.url, screenshot:r.screenshot, overflowX:r.overflowX, docH:r.docH, canvases:r.canvases, consoleErrors:r.consoleErrors?.slice(0,5), error:r.error})), null, 2));
