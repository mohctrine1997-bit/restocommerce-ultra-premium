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
await page.waitForTimeout(1200);
await page.goto(`${origin}/store-manager/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForSelector('.rc-vendor-service-shell', { timeout: 20000 });

const elements = await page.evaluate(() => [...document.querySelectorAll('[id*="menu"], [class*="menu"], [class*="dashboard"], [id*="dashboard"]')]
  .map((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      tag: element.tagName,
      id: element.id,
      classes: element.className,
      display: style.display,
      position: style.position,
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    };
  })
  .filter((item) => item.display !== 'none' && item.width > 100 && item.height > 20)
  .sort((a, b) => a.top - b.top));

console.log(JSON.stringify(elements, null, 2));
await context.close();
await browser.close();
