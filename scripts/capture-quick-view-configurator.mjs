/**
 * Validation mobile du configurateur RestoCommerce : choix de variation,
 * confirmation puis ajout direct au panier depuis le quick view.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const output = '/home/ubuntu/resto-commerce-visual-baseline/quick-view';

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
const page = await context.newPage();

await page.goto(`${origin}/restaurant/demo-tokyo-bento/?visual-baseline=quick-view-mobile-102`, { waitUntil: 'networkidle', timeout: 45000 });
await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
await page.evaluate(() => document.fonts?.ready);

await page.locator('button[data-rc-quick-product="55"]').first().click();
await page.locator('[data-rc-quick-view][open] [data-rc-quick-order-form]').waitFor({ state: 'visible', timeout: 15000 });
await page.screenshot({ path: resolve(output, 'quick-view-mobile-initial.png'), fullPage: false });

await page.locator('[data-rc-quick-order-form] [data-rc-option-set] label').first().click();
await page.locator('[data-rc-quick-order-form] .rc-quick-conditions label').click();
await page.waitForFunction(() => {
  const variation = document.querySelector('[data-rc-variation-id]');
  const button = document.querySelector('[data-rc-quick-submit]');
  return variation?.value !== '0' && button && !button.disabled;
}, null, { timeout: 10000 });
await page.screenshot({ path: resolve(output, 'quick-view-mobile-configured.png'), fullPage: false });

await page.locator('[data-rc-quick-submit]').click();
await page.locator('[data-rc-cart-drawer][aria-hidden="false"]').waitFor({ state: 'visible', timeout: 15000 });
const count = await page.locator('[data-rc-cart-count]').first().innerText();
if (Number(count) < 1) throw new Error('Le panier n’a pas été mis à jour après l’ajout direct.');
await page.waitForFunction(() => {
  const image = document.querySelector('.rc-cart-line-media img');
  return !image || (image.complete && image.naturalWidth > 0);
}, null, { timeout: 10000 });
await page.screenshot({ path: resolve(output, 'quick-view-mobile-cart.png'), fullPage: false });

await context.close();
await browser.close();
console.log(`Quick view mobile captures saved in ${output}`);
