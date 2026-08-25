/**
 * RestoCommerce visual baseline: captures reference React and public WordPress screens
 * at consistent desktop/mobile sizes. Outputs remain outside the deployable project tree.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = '/home/ubuntu/resto-commerce-visual-baseline';
const screens = [
  { name: 'react-marketplace', url: 'http://127.0.0.1:3000/', desktop: true, mobile: true },
  { name: 'react-restaurant', url: 'http://127.0.0.1:3000/restaurant/la-table-de-lila', desktop: true, mobile: true },
  { name: 'wordpress-marketplace', url: 'https://aliceblue-bison-433987.hostingersite.com/?visual-baseline=final', desktop: true, mobile: true },
  { name: 'wordpress-restaurant', url: 'https://aliceblue-bison-433987.hostingersite.com/restaurant/demo-tokyo-bento/?visual-baseline=final', desktop: true, mobile: true },
  { name: 'wordpress-product', url: 'https://aliceblue-bison-433987.hostingersite.com/produit/tokyo-bento-chicken-katsu-curry/?visual-baseline=final', desktop: true, mobile: true },
  { name: 'wordpress-cart', url: 'https://aliceblue-bison-433987.hostingersite.com/panier/?visual-baseline=final', desktop: true, mobile: true },
  { name: 'wordpress-checkout', url: 'https://aliceblue-bison-433987.hostingersite.com/commander/?visual-baseline=final', desktop: true, mobile: true },
];

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
for (const screen of screens.filter((screen) => screen.name.startsWith('wordpress-'))) {
  for (const [label, viewport] of Object.entries(viewports)) {
    if (!screen[label]) continue;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: label === 'mobile' });
    const page = await context.newPage();
    await page.goto(screen.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
    await page.evaluate(() => document.fonts?.ready);
    await page.screenshot({ path: resolve(output, `${screen.name}-${label}.png`), fullPage: true });
    await context.close();
  }
}
await browser.close();
console.log(`Captures saved in ${output}`);
