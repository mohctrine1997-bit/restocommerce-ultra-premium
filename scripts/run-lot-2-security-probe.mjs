import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
const archivedProductUrl = process.env.RC_ARCHIVED_PRODUCT_URL;
if (!username || !password || !archivedProductUrl) throw new Error('RC_VENDOR_USER, RC_VENDOR_PASSWORD et RC_ARCHIVED_PRODUCT_URL sont requis.');

const outputRoot = path.resolve(process.env.RC_QA_OUT || path.join(process.cwd(), 'docs', 'receipts', 'lot-2-artifacts'));
const runId = `lot2-security-${Date.now()}`;
const result = { runId, startedAt: new Date().toISOString(), checks: {}, limits: ['La propriété inter-vendeur n’est pas rejouée : aucun second compte n’est créé pour cette sonde.'] };
await fs.mkdir(outputRoot, { recursive: true });

async function dismissOverlays(page) {
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
}

async function login(page) {
  let lastIssue = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto(`${origin}/wp-login.php?rcqa=${runId}-${attempt}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (await page.locator('#user_login').count()) {
      await page.locator('#user_login').fill(username); await page.locator('#user_pass').fill(password);
      const navigated = page.waitForURL((url) => !url.pathname.endsWith('/wp-login.php'), { waitUntil: 'domcontentloaded', timeout: 15000 }).then(() => true).catch(() => false);
      await page.locator('#wp-submit').click();
      if (!await navigated) { lastIssue = (await page.locator('#login_error').allTextContents()).join(' ').replace(/\s+/g, ' ').trim() || 'navigation de connexion sans redirection'; continue; }
    }
    await page.goto(`${origin}/store-manager/?rcqa=${runId}-${attempt}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!await page.locator('[data-rc-vendor-app]').isVisible().catch(() => false)) { lastIssue = `cockpit indisponible (${page.url()})`; continue; }
    await dismissOverlays(page);
    return;
  }
  throw new Error(`Authentification vendeur non stabilisée : ${lastIssue}`);
}

let browser;
try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  const ownerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const ownerPage = await ownerContext.newPage();
  await login(ownerPage);
  const missingNonce = await ownerPage.evaluate(async () => {
    const data = new FormData();
    data.append('action', 'restocommerce_vendor_archive_product');
    data.append('product_id', '0');
    const response = await fetch(window.restocommerceVendorApp?.ajaxUrl || '/wp-admin/admin-ajax.php', { method: 'POST', body: data, credentials: 'same-origin' });
    const body = await response.text();
    try { return { httpStatus: response.status, payload: JSON.parse(body) }; } catch { return { httpStatus: response.status, payload: body.slice(0, 180) }; }
  });
  result.checks.missingNonce = { rejected: missingNonce?.payload?.success === false || missingNonce.payload === -1 || missingNonce.payload === '-1', httpStatus: missingNonce.httpStatus, message: missingNonce?.payload?.data?.message || String(missingNonce.payload).slice(0, 180) };
  if (!result.checks.missingNonce.rejected) throw new Error('La requête de mutation sans nonce n’a pas été refusée.');
  await ownerContext.close();

  const publicContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const publicPage = await publicContext.newPage();
  const response = await publicPage.goto(archivedProductUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  result.checks.archivedProductPublic = { httpStatus: response?.status() ?? null, inaccessible: (response?.status() ?? 0) === 404, finalUrl: publicPage.url().replace(/\?.*$/, '') };
  if (!result.checks.archivedProductPublic.inaccessible) throw new Error('Le produit de recette archivé reste publiquement accessible.');
  await publicContext.close();
  result.finishedAt = new Date().toISOString();
  await fs.writeFile(path.join(outputRoot, `${runId}-results.json`), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  result.failure = { message: error.message }; result.finishedAt = new Date().toISOString();
  await fs.writeFile(path.join(outputRoot, `${runId}-failure.json`), JSON.stringify(result, null, 2));
  console.error(JSON.stringify(result, null, 2)); process.exitCode = 1;
} finally { await browser?.close().catch(() => {}); }
