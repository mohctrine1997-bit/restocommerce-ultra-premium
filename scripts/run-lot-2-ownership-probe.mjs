import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const owner = { username: process.env.RC_VENDOR_USER, password: process.env.RC_VENDOR_PASSWORD };
const other = { username: process.env.RC_OTHER_VENDOR_USER, password: process.env.RC_OTHER_VENDOR_PASSWORD };
if (!owner.username || !owner.password || !other.username || !other.password) throw new Error('Les variables des deux vendeurs de recette sont requises.');

const outputRoot = path.resolve(process.env.RC_QA_OUT || path.join(process.cwd(), 'docs', 'receipts', 'lot-2-artifacts'));
const runId = `lot2-ownership-${Date.now()}`;
const fixtureName = `Isolation recette ${runId}`;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9JfhYAAAAASUVORK5CYII=', 'base64');
const result = { runId, startedAt: new Date().toISOString(), checks: {}, cleanup: {} };
await fs.mkdir(outputRoot, { recursive: true });

const dismissOverlays = async (page) => {
  await page.waitForTimeout(350);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const onboarding = page.locator('[data-rc-vendor-onboarding][open]');
    if (await onboarding.count()) { await page.locator('[data-rc-onboarding-close]').click(); await onboarding.waitFor({ state: 'hidden', timeout: 5000 }); }
    const tour = page.locator('[data-rc-guidance-tour]:not([hidden])');
    if (await tour.count()) { await tour.locator('[data-rc-tour-skip]').click(); await tour.waitFor({ state: 'hidden', timeout: 5000 }); }
    if (!await page.locator('[data-rc-vendor-onboarding][open], [data-rc-guidance-tour]:not([hidden])').count()) return;
    await page.waitForTimeout(250);
  }
  throw new Error('Un overlay vendeur reste ouvert après trois tentatives de fermeture.');
};

const login = async (page, credentials, label) => {
  let lastIssue = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto(`${origin}/wp-login.php?rcqa=${encodeURIComponent(`${runId}-${label}-${attempt}`)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (await page.locator('#user_login').count()) {
      await page.locator('#user_login').fill(credentials.username); await page.locator('#user_pass').fill(credentials.password);
      const navigated = page.waitForURL((url) => !url.pathname.endsWith('/wp-login.php'), { waitUntil: 'domcontentloaded', timeout: 15000 }).then(() => true).catch(() => false);
      await page.locator('#wp-submit').click();
      if (!await navigated) { lastIssue = (await page.locator('#login_error').allTextContents()).join(' ').replace(/\s+/g, ' ').trim() || 'navigation de connexion sans redirection'; continue; }
    }
    await page.goto(`${origin}/store-manager/?rcqa=${encodeURIComponent(`${runId}-${label}-${attempt}`)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!await page.locator('[data-rc-vendor-app]').isVisible().catch(() => false)) { lastIssue = `cockpit indisponible (${page.url()})`; continue; }
    await dismissOverlays(page); return;
  }
  throw new Error(`Authentification ${label} non stabilisée : ${lastIssue}`);
};

const post = async (page, action, fields = {}) => page.evaluate(async ({ action, fields }) => {
  const data = new FormData(); data.append('action', action); data.append('nonce', window.restocommerceVendorApp?.nonce || '');
  Object.entries(fields).forEach(([key, value]) => data.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value)));
  const response = await fetch(window.restocommerceVendorApp?.ajaxUrl || '/wp-admin/admin-ajax.php', { method: 'POST', body: data, credentials: 'same-origin' });
  return response.json();
}, { action, fields });

const createFixture = async (page) => {
  await dismissOverlays(page); await page.locator('[data-rc-tab="menu"]:visible').first().click();
  await page.locator('[data-rc-open-product-wizard]:visible').first().click(); await page.locator('[data-rc-product-wizard][open]').waitFor({ state: 'visible' });
  await page.locator('[data-rc-wizard-photo]').setInputFiles({ name: 'isolation-recette.png', mimeType: 'image/png', buffer: png });
  await page.locator('[data-rc-wizard-next]').click(); await page.locator('[data-rc-wizard-category="plats"]').click(); await page.locator('[data-rc-wizard-next]').click();
  await page.locator('[data-rc-wizard-name]').fill(fixtureName); await page.locator('[data-rc-wizard-description]').fill('Fixture isolée pour le contrôle propriétaire autorisé.'); await page.locator('[data-rc-wizard-next]').click();
  await page.locator('[data-rc-wizard-price]').fill('1'); await page.locator('[data-rc-wizard-next]').click(); await page.locator('[data-rc-wizard-next]').click();
  await page.locator('[data-rc-wizard-next]').click(); await page.locator('[data-rc-product-wizard][open]').waitFor({ state: 'hidden', timeout: 60000 }); await dismissOverlays(page);
  await page.locator('[data-rc-tab="menu"]:visible').first().click(); const row = page.locator('[data-rc-product]', { hasText: fixtureName }).first(); await row.waitFor({ state: 'visible', timeout: 30000 });
  const productId = Number(await row.getAttribute('data-rc-product')); const editor = await post(page, 'restocommerce_vendor_product_editor_data', { product_id: productId });
  if (!productId || !editor.success || !editor.data?.product?.url) throw new Error('La fixture propriétaire n’a pas été publiée correctement.');
  return { productId, publicUrl: editor.data.product.url };
};

let browser; let ownerPage; let fixture;
try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  const ownerContext = await browser.newContext({ viewport: { width: 390, height: 844 } }); ownerPage = await ownerContext.newPage(); await login(ownerPage, owner, 'source'); fixture = await createFixture(ownerPage);
  result.checks.fixtureCreated = { published: true };
  const otherContext = await browser.newContext({ viewport: { width: 390, height: 844 } }); const otherPage = await otherContext.newPage(); await login(otherPage, other, 'second');
  const foreignMutation = await post(otherPage, 'restocommerce_vendor_archive_product', { product_id: fixture.productId });
  result.checks.foreignArchive = { rejected: foreignMutation.success === false, message: foreignMutation?.data?.message || '' };
  if (!result.checks.foreignArchive.rejected) throw new Error('Le second vendeur a pu archiver une fixture qui ne lui appartient pas.');
  await otherContext.close();
  const ownerArchive = await post(ownerPage, 'restocommerce_vendor_archive_product', { product_id: fixture.productId }); result.cleanup.ownerArchive = { success: ownerArchive.success === true };
  if (!result.cleanup.ownerArchive.success) throw new Error('Le vendeur source n’a pas pu archiver sa fixture.');
  const publicContext = await browser.newContext({ viewport: { width: 390, height: 844 } }); const publicPage = await publicContext.newPage(); const response = await publicPage.goto(fixture.publicUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }); result.cleanup.publicAfterArchive = { inaccessible: response?.status() === 404 };
  if (!result.cleanup.publicAfterArchive.inaccessible) throw new Error('La fixture archivée reste publiquement accessible.');
  await publicContext.close(); await ownerContext.close(); ownerPage = null;
  result.finishedAt = new Date().toISOString(); await fs.writeFile(path.join(outputRoot, `${runId}-results.json`), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (fixture?.productId && ownerPage) {
    try { const cleanup = await post(ownerPage, 'restocommerce_vendor_archive_product', { product_id: fixture.productId }); result.cleanup.failureArchive = { success: cleanup.success === true }; } catch (cleanupError) { result.cleanup.failureArchive = { success: false, message: cleanupError.message }; }
  }
  result.failure = { message: error.message }; result.finishedAt = new Date().toISOString(); await fs.writeFile(path.join(outputRoot, `${runId}-failure.json`), JSON.stringify(result, null, 2)); console.error(JSON.stringify(result, null, 2)); process.exitCode = 1;
} finally { await browser?.close().catch(() => {}); }
