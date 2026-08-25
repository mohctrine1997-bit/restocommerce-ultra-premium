import { chromium } from 'playwright';

const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const dishes = [
  { title: 'Bowl signature du marché', price: '89' },
  { title: 'Tagliatelles au safran', price: '112' },
  { title: 'Poulet rôti aux herbes', price: '96' },
  { title: 'Fondant chocolat noir', price: '54' },
];
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${origin}/wp-login.php`, { waitUntil: 'commit', timeout: 60000 });
await page.locator('#user_login').fill(username);
await page.locator('#user_pass').fill(password);
await page.locator('#wp-submit').click();
await page.waitForTimeout(900);

if (process.env.INSPECT === '1') {
  await page.goto(`${origin}/store-manager/products-manage/`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#pro_title', { timeout: 30000 });
  const fields = await page.locator('input, select, textarea').evaluateAll((elements) => elements.map((element) => ({ id: element.id, name: element.name, type: element.type, value: element.value, required: element.required, checked: element.checked })).filter((field) => field.type === 'checkbox' || field.required || ['pro_title', 'regular_price', 'wcfm_products_simple_submit_button'].includes(field.id)));
  const form = await page.locator('#wcfm_products_manage_form').evaluate((element) => ({ action: element.getAttribute('action'), method: element.getAttribute('method'), inputs: [...element.querySelectorAll('input[type=hidden]')].map((input) => ({ name: input.name, value: input.value })) }));
  console.log(JSON.stringify({ fields, form }, null, 2));
  await browser.close();
  process.exit(0);
}

if (process.env.DIAG_SUBMIT === '1') {
  await page.goto(`${origin}/store-manager/products-manage/`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForSelector('#pro_title', { timeout: 30000 });
  const ajax = [];
  const clientErrors = [];
  page.on('pageerror', (error) => clientErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') clientErrors.push(message.text()); });
  page.on('response', async (response) => {
    if (!response.url().includes('admin-ajax.php')) return;
    try { ajax.push({ url: response.url(), status: response.status(), body: (await response.text()).slice(0, 1200) }); } catch {}
  });
  await page.locator('#pro_title').fill('Bowl signature du marché');
  await page.locator('#regular_price').fill('89');
  await page.locator('#wcfm_products_simple_submit_button').click();
  await page.waitForTimeout(2500);
  const messages = await page.locator('.wcfm_message, .wcfm-message, .wcfm_notice, .wcfmmp-store-message').allTextContents();
  const stock = await page.locator('#stock_qty').evaluate((input) => { const style = getComputedStyle(input); const box = input.getBoundingClientRect(); return { required: input.required, disabled: input.disabled, offsetParent: Boolean(input.offsetParent), display: style.display, visibility: style.visibility, opacity: style.opacity, width: box.width, height: box.height }; });
  const fixLoaded = await page.locator('script[src*="vendor-wcfm-form-fix"]').count();
  console.log(JSON.stringify({ url: page.url(), ajax, messages, clientErrors, stock, fixLoaded }, null, 2));
  await browser.close();
  process.exit(0);
}

for (const dish of dishes) {
  await page.goto(`${origin}/store-manager/products-manage/`, { waitUntil: 'commit', timeout: 60000 });
  await page.locator('#pro_title').fill(dish.title);
  await page.locator('#regular_price').fill(dish.price);
  await page.locator('#wcfm_products_simple_submit_button').click();
  await page.waitForTimeout(900);
}
await page.goto(`${origin}/store-manager/`, { waitUntil: 'commit', timeout: 60000 });
console.log(JSON.stringify({ url: page.url(), created: dishes.map(({ title }) => title) }, null, 2));
await browser.close();
