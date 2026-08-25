import { chromium } from 'playwright';

const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await page.goto(`${origin}/wp-login.php`, { waitUntil: 'networkidle', timeout: 45000 });
await page.locator('#user_login').fill(username);
await page.locator('#user_pass').fill(password);
await page.locator('#wp-submit').click();
await page.waitForTimeout(1500);
await page.goto(`${origin}/store-manager/`, { waitUntil: 'networkidle', timeout: 45000 });

const audit = await page.evaluate(() => ({
  url: location.href,
  bodyClasses: document.body.className,
  menus: [...document.querySelectorAll('#wcfm_menu .wcfm_menu_item, #wcfm_menu > li, #wcfm_menu a')]
    .map((node) => {
      const link = node.matches('a') ? node : node.querySelector('a');
      return {
        id: node.id,
        classes: node.className,
        text: node.textContent?.replace(/\s+/g, ' ').trim(),
        href: link?.href || null,
      };
    })
    .filter((item) => item.text),
  dashboard: [...document.querySelectorAll('#wcfm-main-contentainer, #wcfm-main-content, .wcfm_dashboard_container')]
    .map((node) => ({ id: node.id, classes: node.className })),
  headings: [...document.querySelectorAll('h1, h2, h3, .wcfm-title')]
    .map((node) => node.textContent?.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 20),
}));

console.log(JSON.stringify(audit, null, 2));
await page.screenshot({ path: '/home/ubuntu/resto-commerce-visual-baseline/wcfm-dashboard-mobile-before.png', fullPage: true });
await context.close();
await browser.close();
