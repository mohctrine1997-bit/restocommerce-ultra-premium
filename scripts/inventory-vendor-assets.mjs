/** CDC Maître — Lot 2 : inventaire authentifié des styles et scripts livrés au cockpit vendeur. */
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = (process.env.RC_STAGING_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const output = '/home/ubuntu/resto-commerce-theme/docs/receipts/lot-2-artifacts/vendor-asset-inventory.json';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  await page.goto(`${origin}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (await page.locator('#user_login').count()) { await page.locator('#user_login').fill(username); await page.locator('#user_pass').fill(password); await Promise.all([page.waitForLoadState('domcontentloaded'), page.locator('#wp-submit').click()]); }
  await page.goto(`${origin}/store-manager/`, { waitUntil: 'networkidle', timeout: 60000 }); await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 30000 });
  const inventory = await page.evaluate(() => ({
    url: location.href,
    styles: [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => ({ id: node.id, href: node.href })).filter((entry) => entry.href),
    scripts: [...document.scripts].map((node) => ({ id: node.id, src: node.src, type: node.type, defer: node.defer })).filter((entry) => entry.src),
    resources: performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, type: entry.initiatorType, duration: Math.round(entry.duration), transfer: entry.transferSize || 0 })).filter((entry) => entry.name.startsWith(location.origin)).sort((a, b) => b.transfer - a.transfer),
  }));
  await fs.writeFile(output, JSON.stringify(inventory, null, 2)); console.log(JSON.stringify(inventory, null, 2)); await context.close();
} finally { await browser.close(); }
