import { chromium } from 'playwright';

const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu', '--renderer-process-limit=1'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();

await page.goto(`${origin}/wp-login.php`, { waitUntil: 'commit', timeout: 60000 });
await page.locator('#user_login').fill(username);
await page.locator('#user_pass').fill(password);
await page.locator('#wp-submit').click();
await page.waitForTimeout(3000);
if (page.url().includes('/wp-login.php')) {
  const loginText = (await page.locator('body').innerText()).replaceAll(password, '[redacted]').slice(0, 800);
  throw new Error(`La connexion vendeur n’a pas abouti : ${loginText}`);
}
if (!page.url().includes('/store-manager/')) {
  await page.goto(`${origin}/store-manager/`, { waitUntil: 'commit', timeout: 60000 }).catch((error) => {
    if (!String(error?.message || error).includes('ERR_ABORTED')) throw error;
  });
}
await page.waitForTimeout(5000);
const boot = await page.evaluate(() => ({
  url: location.href,
  bodyClass: document.body.className,
  shell: !!document.querySelector('.rc-vendor-service-shell'),
  vendorConfig: !!window.restocommerceVendorDashboard,
  script: !!document.querySelector('script[src*="vendor-dashboard.js"]'),
  stylesheet: !!document.querySelector('link[href*="vendor-dashboard.css"]'),
  excerpt: document.body.innerText.replace(/\s+/g, ' ').slice(0, 700),
}));
if (!boot.shell) {
  await page.screenshot({ path: '/home/ubuntu/resto-commerce-visual-baseline/wcfm-dashboard-mobile-1-1-debug.png', fullPage: true });
  throw new Error(`Le cockpit vendeur n’a pas été rendu : ${JSON.stringify(boot)}`);
}

const validation = await page.evaluate(() => ({
  shell: !!document.querySelector('.rc-vendor-service-shell'),
  nextStep: document.querySelector('.rc-vendor-next-step h2')?.textContent?.trim(),
  nav: [...document.querySelectorAll('.rc-vendor-mobile-nav .rc-vendor-nav-link span')].map((item) => item.textContent?.trim()),
  legacyMenuDisplay: getComputedStyle(document.querySelector('#wcfm_menu')).display,
  secondaryContentDisplay: getComputedStyle(document.querySelector('#wcfm-main-content')).display,
  quickActions: [...document.querySelectorAll('.rc-vendor-action-card span')].map((item) => item.textContent?.trim()),
  pauseLabel: document.querySelector('[data-rc-vendor-pause] span')?.textContent?.trim(),
  newDishHref: document.querySelector('.rc-vendor-action-card')?.getAttribute('href'),
}));

if (!validation.shell || validation.nextStep !== 'Vérifier les commandes.' || validation.legacyMenuDisplay !== 'none' || validation.secondaryContentDisplay !== 'none') {
  throw new Error(`Le cockpit mobile n’est pas prêt : ${JSON.stringify(validation)}`);
}
if (JSON.stringify(validation.nav) !== JSON.stringify(['Aujourd’hui', 'Commandes', 'Menu', 'Boutique', 'Plus'])) {
  throw new Error(`Navigation mobile inattendue : ${JSON.stringify(validation.nav)}`);
}

const pauseButton = page.locator('[data-rc-vendor-pause]');
await pauseButton.click();
await page.waitForFunction(() => document.querySelector('[data-rc-vendor-pause] span')?.textContent?.includes('pause'));
const pausedLabel = await pauseButton.locator('span').textContent();
await pauseButton.click();
await page.waitForFunction(() => document.querySelector('[data-rc-vendor-pause] span')?.textContent?.includes('ouvert'));
const reopenedLabel = await pauseButton.locator('span').textContent();

await page.screenshot({ path: '/home/ubuntu/resto-commerce-visual-baseline/wcfm-dashboard-mobile-1-1.png', fullPage: true });
console.log(JSON.stringify({ validation, pausedLabel, reopenedLabel, url: page.url() }, null, 2));

await context.close();
await browser.close();
