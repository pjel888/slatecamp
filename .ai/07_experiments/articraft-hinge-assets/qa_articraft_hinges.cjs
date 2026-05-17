const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const types = ['butt','loose-pin','ball-bearing','spring','pivot','continuous','concealed','parliament','strap'];
  const outDir = '/Users/philiplewis/slatecamp/.ai/03_plans/articles/articraft-hinge-glb-screenshots';
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const results = [];
  for (const type of types) {
    const errors = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', (e) => errors.push(String(e)));
    const url = `http://localhost:3000/dev/door-hinges-preview?mode=model&type=${type}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    const fig = await page.locator('figure').first();
    const shot = path.join(outDir, `${type}.png`);
    await fig.screenshot({ path: shot });
    const hasCanvas = await page.locator('canvas').count();
    const title = await page.locator('figure h4').first().textContent();
    results.push({ type, title, hasCanvas, errors, shot });
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
