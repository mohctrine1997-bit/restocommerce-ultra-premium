import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const output = '/home/ubuntu/resto-commerce-visual-baseline';
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(`${origin}/wp-login.php`, { waitUntil: 'commit', timeout: 60000 });
await page.waitForSelector('#user_login', { timeout: 30000 });
await page.locator('#user_login').fill(username);
await page.locator('#user_pass').fill(password);
await Promise.all([
  page.waitForURL(/store-manager|wp-admin/, { timeout: 60000 }),
  page.locator('#wp-submit').click(),
]);
await page.goto(`${origin}/store-manager/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-rc-vendor-app]', { timeout: 30000 });
await page.waitForTimeout(600);
const initial = await page.evaluate(() => ({
  app: Boolean(document.querySelector('[data-rc-vendor-app]')),
  legacy: Boolean(document.querySelector('#wcfm_menu, #wcfm-main-contentainer, .wcfm_dashboard_container')),
  tabs: [...document.querySelectorAll('[data-rc-tab]')].map((tab) => tab.textContent?.trim()),
  panels: [...document.querySelectorAll('[data-rc-panel]')].map((panel) => panel.dataset.rcPanel),
  template: document.body.className,
}));
const service = page.locator('[data-rc-service-toggle]');
const wasPaused = await service.getAttribute('aria-pressed') === 'true';
if (wasPaused) await service.click();
await service.click();
await page.waitForFunction(() => document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed') === 'true');
const pauseWorks = await service.textContent();
await service.click();
await page.waitForFunction(() => document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed') === 'false');
const reopenWorks = await service.textContent();
await page.screenshot({ path: `${output}/vendor-dashboard-2-0-desktop.png`, fullPage: true });
const orderStates = {};
for (const state of ['loading', 'empty', 'error', 'success']) {
  await page.goto(`${origin}/store-manager/?rcqa=lot1-vendor-states&rc_ui=orders-${state}`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('[data-rc-vendor-app]', { timeout: 30000 });
  await page.waitForSelector('.rc-ui-state:not([hidden])', { timeout: 30000 });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  await page.screenshot({ path: `${output}/vendor-dashboard-2-0-orders-${state}.png`, fullPage: true });
  orderStates[state] = {
    visible: await page.locator('.rc-ui-state:not([hidden])').first().isVisible(),
    axeViolations: axe.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })),
    })),
  };
}
await page.goto(`${origin}/store-manager/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-rc-vendor-app]', { timeout: 30000 });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(350);
await page.screenshot({ path: `${output}/vendor-dashboard-2-0-mobile.png`, fullPage: true });
const interactions = {};
for (const target of ['orders', 'menu', 'hours', 'profile']) {
  await page.locator(`[data-rc-tab="${target}"]:visible`).first().click();
  await page.waitForTimeout(120);
  interactions[target] = await page.locator(`[data-rc-panel="${target}"]`).isVisible();
  if (target === 'menu') {
    await page.screenshot({ path: `${output}/vendor-dashboard-2-0-menu-mobile.png`, fullPage: true });
  }
}
await page.locator(`[data-rc-tab="menu"]:visible`).first().click();
const productToggle = page.locator('[data-rc-product-toggle]').first();
const productCount = await page.locator('[data-rc-product]').count();
let productToggleWorks = null;
if (productCount) {
  const initialAvailability = await productToggle.getAttribute('data-rc-available');
  await productToggle.click();
  await page.waitForFunction((before) => document.querySelector('[data-rc-product-toggle]')?.getAttribute('data-rc-available') !== before, initialAvailability);
  const changedAvailability = await productToggle.getAttribute('data-rc-available');
  await productToggle.click();
  await page.waitForFunction((before) => document.querySelector('[data-rc-product-toggle]')?.getAttribute('data-rc-available') !== before, changedAvailability);
  productToggleWorks = { initialAvailability, changedAvailability, restoredAvailability: await productToggle.getAttribute('data-rc-available') };
}
await fs.writeFile(`${output}/vendor-dashboard-2-0-validation.json`, JSON.stringify({ initial, interactions, orderStates, service: { pauseWorks, reopenWorks }, productCount, productToggleWorks, url: page.url() }, null, 2));
console.log(JSON.stringify({ initial, interactions, orderStates, service: { pauseWorks, reopenWorks }, productCount, productToggleWorks }, null, 2));
await browser.close();
