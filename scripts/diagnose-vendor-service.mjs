import { chromium } from 'playwright';

const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('Identifiants vendeur requis.');
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--disable-dev-shm-usage', '--disable-gpu'] });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#user_login').fill(username); await page.locator('#user_pass').fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith('/wp-login.php'), { waitUntil: 'domcontentloaded', timeout: 30000 }),
    page.locator('#wp-submit').click(),
  ]);
  await page.goto(`${origin}/store-manager/?rcqa=service-diagnostic-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(JSON.stringify({ checkpoint: 'after-store-manager-navigation', url: page.url(), title: await page.title(), excerpt: (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 240) }));
  await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(1200);
  const stateBefore = await page.evaluate(() => ({
    service: document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed'),
    tour: (() => { const node = document.querySelector('[data-rc-guidance-tour]'); return node ? { hidden: node.hidden, display: getComputedStyle(node).display } : null; })(),
    onboarding: (() => { const node = document.querySelector('[data-rc-vendor-onboarding]'); return node ? { open: node.open, display: getComputedStyle(node).display } : null; })(),
    contrast: (() => { const card = document.querySelector('.rc-vendor-card > header > div > p'); const bar = document.querySelector('.rc-vendor-bars b'); return { card: card ? { color: getComputedStyle(card).color, background: getComputedStyle(card.parentElement?.parentElement).backgroundColor } : null, bar: bar ? { color: getComputedStyle(bar).color, background: getComputedStyle(bar.parentElement?.parentElement).backgroundColor } : null, hotfix: [...document.styleSheets].map((sheet) => sheet.href || '').filter((href) => href.includes('vendor-accessibility-hotfix')) }; })(),
  }));
  const service = page.locator('[data-rc-service-toggle]');
  if (stateBefore.tour && !stateBefore.tour.hidden) await page.locator('[data-rc-tour-skip]').click();
  if (stateBefore.onboarding?.open) await page.locator('[data-rc-onboarding-close]').click();
  await page.waitForTimeout(250);
  await service.click({ timeout: 5000 });
  await page.waitForTimeout(2500);
  const stateAfter = await page.evaluate(() => ({
    service: document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed'),
    busy: document.querySelector('[data-rc-service-toggle]')?.hasAttribute('aria-busy'),
    feedback: document.querySelector('[data-rc-vendor-feedback]')?.textContent?.trim() || '',
  }));
  if (stateAfter.service !== stateBefore.service && !stateAfter.busy) { await service.click({ timeout: 5000 }); await page.waitForTimeout(2500); }
  const stateRestored = await page.evaluate(() => ({ service: document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed'), busy: document.querySelector('[data-rc-service-toggle]')?.hasAttribute('aria-busy'), feedback: document.querySelector('[data-rc-vendor-feedback]')?.textContent?.trim() || '' }));
  console.log(JSON.stringify({ stateBefore, stateAfter, stateRestored }, null, 2));
  await context.close();
} finally { await browser.close(); }
