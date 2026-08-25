import { chromium } from 'playwright';

const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${origin}/wp-login.php`, { waitUntil: 'networkidle', timeout: 45000 });
await page.locator('#user_login').fill(username);
await page.locator('#user_pass').fill(password);
await page.locator('#wp-submit').click();
await page.waitForTimeout(2000);
const loginUrl = page.url();
const loginExcerpt = (await page.locator('body').innerText()).replaceAll(password, '[redacted]').slice(0, 700);
if (loginUrl.includes('/wp-login.php')) {
  console.log(JSON.stringify({ stage: 'login', loginUrl, loginExcerpt }, null, 2));
  throw new Error('L’authentification WordPress du vendeur de démonstration a échoué.');
}
await page.goto(`${origin}/store-manager/`, { waitUntil: 'networkidle', timeout: 45000 });

const hasDashboard = await page.locator('#wcfm-main-contentainer, #wcfm-main-content, .wcfm_dashboard_container').count();
const body = await page.locator('body').innerText();
await page.screenshot({ path: '/home/ubuntu/resto-commerce-visual-baseline/wcfm-demo-vendor-dashboard.png', fullPage: true });
console.log(JSON.stringify({ stage: 'store-manager', url: page.url(), hasDashboard, excerpt: body.slice(0, 1200) }, null, 2));
if (!hasDashboard || /incorrect username|incorrect password|connexion échouée/i.test(body.slice(0, 900))) {
  throw new Error('Le compte vendeur de démonstration ne donne pas accès au dashboard WCFM.');
}

console.log(`Vendor WCFM login verified: ${page.url()}`);
await context.close();
await browser.close();
