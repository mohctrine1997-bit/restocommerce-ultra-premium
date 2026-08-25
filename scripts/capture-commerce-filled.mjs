/**
 * RestoCommerce visual baseline: capture the public WooCommerce cart and
 * checkout from a real, fresh session containing one restaurant product.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = '/home/ubuntu/resto-commerce-visual-baseline/filled';
const origin = 'https://aliceblue-bison-433987.hostingersite.com';
const product = `${origin}/produit/tokyo-bento-chicken-katsu-curry/?visual-baseline=filled`;
const flows = [
  { name: 'cart', url: `${origin}/panier/?visual-baseline=filled` },
  { name: 'checkout', url: `${origin}/commander/?visual-baseline=filled` },
];
const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });

for (const [label, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: label === 'mobile' });
  const page = await context.newPage();

  await page.goto(product, { waitUntil: 'networkidle', timeout: 45000 });
  await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
  await page.evaluate(() => document.fonts?.ready);

  const selectors = await page.locator('form.cart select').all();
  for (const selector of selectors) {
    const values = await selector.locator('option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
    if (values[0]) await selector.selectOption(values[0]);
  }

  const addButton = page.locator('form.cart button.single_add_to_cart_button, form.cart button[name="add-to-cart"]').first();
  await page.waitForFunction(() => {
    const variation = document.querySelector('form.cart input.variation_id');
    const button = document.querySelector('form.cart button.single_add_to_cart_button');
    return (!variation || variation.value !== '0') && button && !button.classList.contains('disabled');
  }, null, { timeout: 15000 });
  await addButton.waitFor({ state: 'visible', timeout: 15000 });
  await addButton.click();
  await page.waitForTimeout(1800);

  for (const flow of flows) {
    await page.goto(flow.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
    await page.evaluate(() => document.fonts?.ready);
    const count = await page.locator('.woocommerce-cart-form .product-name, .woocommerce-checkout-review-order-table .product-name').count();
    if (!count) throw new Error(`Panier vide pendant la capture ${flow.name}/${label}`);
    await page.screenshot({ path: resolve(output, `wordpress-${flow.name}-filled-${label}.png`), fullPage: true });
  }

  await context.close();
}

await browser.close();
console.log(`Filled commerce captures saved in ${output}`);
