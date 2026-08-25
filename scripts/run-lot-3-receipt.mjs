import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis pour la recette vendeur réelle du Lot 3.');

const receiptRoot = path.resolve(process.env.RC_QA_OUT || path.join(process.cwd(), 'docs', 'receipts', 'lot-3-artifacts'));
const runId = `lot3-${Date.now()}`;
const shopName = `Table recette ${runId}`;
const dishName = `Plat accueil ${runId}`;
const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9JfhYAAAAASUVORK5CYII=', 'base64');
const engines = [
  ['chromium', chromium, { executablePath: '/usr/bin/chromium', args: ['--disable-dev-shm-usage', '--disable-gpu'] }],
  ['firefox', firefox, {}],
  ['webkit', webkit, {}],
].filter(([name]) => !process.env.RC_ENGINES || process.env.RC_ENGINES.split(',').map((item) => item.trim()).includes(name));
const widths = [390, 768, 1440, 1920].filter((width) => !process.env.RC_VIEWPORTS || process.env.RC_VIEWPORTS.split(',').map((item) => Number(item.trim())).includes(width));
const results = { runId, shopName, dishName, origin, receiptRoot, startedAt: new Date().toISOString(), checks: {}, axe: {}, screens: [], cleanup: {} };
let activeBrowser;

await fs.mkdir(receiptRoot, { recursive: true });
const safe = (value) => String(value).replace(/[^a-z0-9-]/gi, '-');
const screenshot = async (page, label) => { const file = path.join(receiptRoot, `${safe(label)}.png`); await page.evaluate(async () => { await document.fonts?.ready; }); await page.screenshot({ path: file, fullPage: true, animations: 'disabled' }); results.screens.push(file); return file; };
const axe = async (page, label) => { const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze(); results.axe[label] = report.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => node.target) })); if (report.violations.length) throw new Error(`${label}: ${report.violations.length} violation(s) axe-core.`); };
const login = async (page) => {
  await page.goto(`${origin}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (await page.locator('#user_login').count()) { await page.locator('#user_login').fill(username); await page.locator('#user_pass').fill(password); await Promise.all([page.waitForLoadState('domcontentloaded'), page.locator('#wp-submit').click()]); }
  await page.goto(`${origin}/store-manager/?rcqa=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 30000 });
  const tour = page.locator('[data-rc-guidance-tour]:not([hidden])'); if (await tour.isVisible().catch(() => false) && !(await page.locator('[data-rc-vendor-onboarding][open]').count())) { await tour.locator('[data-rc-tour-skip]').click(); await tour.waitFor({ state: 'hidden', timeout: 5000 }); }
};
const openOnboarding = async (page) => { const dialog = page.locator('[data-rc-vendor-onboarding][open]'); const product = page.locator('[data-rc-product-wizard][open]'); if (await product.count()) await product.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {}); if (!(await dialog.count())) { const tour = page.locator('[data-rc-guidance-tour]:not([hidden])'); if (await tour.count()) { await tour.locator('[data-rc-tour-skip]').click(); await tour.waitFor({ state: 'hidden', timeout: 5000 }); } await page.locator('[data-rc-open-onboarding]:visible').first().click(); } await dialog.waitFor({ state: 'visible', timeout: 15000 }); };
const onboardingNext = async (page) => { await page.locator('[data-rc-vendor-onboarding] [data-rc-onboarding-next]').click(); };
const vendorRequest = async (page, action, fields = {}) => page.evaluate(async ({ action, fields }) => { const data = new FormData(); data.append('action', action); data.append('nonce', window.restocommerceVendorApp.nonce); Object.entries(fields).forEach(([key, value]) => data.append(key, String(value))); return (await fetch(window.restocommerceVendorApp.ajaxUrl, { method: 'POST', body: data, credentials: 'same-origin' })).json(); }, { action, fields });
const resetIncompleteOnboarding = async (page) => {
  if (process.env.RC_SKIP_RESET === '1') { await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 30000 }); return; }
  let result = await vendorRequest(page, 'restocommerce_vendor_reset_incomplete_onboarding');
  if (!result.success && /déjà publiée/i.test(result.data?.message || '')) {
    const restored = await vendorRequest(page, 'restocommerce_vendor_restore_onboarding_backup'); if (!restored.success) throw new Error(restored.data?.message || 'Impossible de restaurer le profil de recette publié.');
    await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 30000 }); await page.locator('[data-rc-tab="menu"]:visible').first().click();
    const staleProducts = await page.locator('[data-rc-product]').evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.rcProduct)).filter(Boolean));
    for (const productId of staleProducts) { const archived = await vendorRequest(page, 'restocommerce_vendor_archive_product', { product_id: productId }); if (!archived.success) throw new Error(archived.data?.message || 'Impossible d’archiver un plat temporaire précédent.'); }
    result = await vendorRequest(page, 'restocommerce_vendor_reset_incomplete_onboarding');
  }
  if (!result.success) throw new Error(result.data?.message || 'Impossible de réinitialiser le brouillon vendeur de recette.'); await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 30000 });
};
const openProductWizard = async (page) => { const dialog = page.locator('[data-rc-product-wizard]'); const alreadyOpen = await dialog.count() && await dialog.evaluate((node) => node.hasAttribute('open')); if (!alreadyOpen) { await page.locator('[data-rc-tab="menu"]:visible').first().click(); await page.locator('[data-rc-open-product-wizard]:visible').first().click(); } await dialog.waitFor({ state: 'visible', timeout: 15000 }); };
const addFirstDish = async (page) => {
  await openProductWizard(page);
  await page.locator('[data-rc-wizard-photo]').setInputFiles({ name: 'premier-plat.png', mimeType: 'image/png', buffer: photo });
  await page.locator('[data-rc-product-wizard] [data-rc-wizard-next]').click();
  await page.locator('[data-rc-wizard-category="plats"]').click(); await page.locator('[data-rc-product-wizard] [data-rc-wizard-next]').click();
  await page.locator('[data-rc-wizard-name]').fill(dishName); await page.locator('[data-rc-wizard-description]').fill('Premier plat créé par la recette réelle du Lot 3.'); await page.locator('[data-rc-product-wizard] [data-rc-wizard-next]').click();
  await page.locator('[data-rc-wizard-price]').fill('69'); await page.locator('[data-rc-product-wizard] [data-rc-wizard-next]').click();
  await page.locator('[data-rc-product-wizard] [data-rc-wizard-next]').click(); await page.locator('[data-rc-product-wizard] [data-rc-wizard-next]').click();
  await page.waitForLoadState('domcontentloaded'); await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 30000 }); await page.locator('[data-rc-product-wizard][open]').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
};

try {
  activeBrowser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] });
  const context = await activeBrowser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage();
  await login(page); await resetIncompleteOnboarding(page); await openOnboarding(page); await axe(page, 'chromium-onboarding-390-initial');
  results.checks.crossOwnerRefusal = await page.evaluate(async () => {
    const foreign = await fetch('/wp-json/wp/v2/product?per_page=20&_fields=id,author', { credentials: 'same-origin' }).then((response) => response.ok ? response.json() : []);
    const ownIds = Array.from(document.querySelectorAll('[data-rc-product]'), (node) => Number(node.dataset.rcProduct)).filter(Boolean);
    const candidate = foreign.find((product) => !ownIds.includes(Number(product.id)));
    if (!candidate) return { checked: false, reason: 'Aucun produit tiers public n’est disponible sur ce staging.' };
    const body = new FormData(); body.append('action', 'restocommerce_vendor_archive_product'); body.append('nonce', window.restocommerceVendorApp.nonce); body.append('product_id', String(candidate.id));
    const response = await fetch(window.restocommerceVendorApp.ajaxUrl, { method: 'POST', body, credentials: 'same-origin' });
    const result = await response.json();
    return { checked: true, productId: Number(candidate.id), refused: !result.success, message: result.data?.message || '' };
  });
  if (!results.checks.crossOwnerRefusal.checked || !results.checks.crossOwnerRefusal.refused) throw new Error('Le refus de propriété croisée du plat n’est pas prouvé.');
  results.checks.invalidNonceRefusal = await page.evaluate(async () => {
    const body = new FormData(); body.append('action', 'restocommerce_vendor_onboarding_data'); body.append('nonce', 'nonce-invalide-lot3');
    const response = await fetch(window.restocommerceVendorApp.ajaxUrl, { method: 'POST', body, credentials: 'same-origin' });
    return { status: response.status, body: (await response.text()).trim() };
  });
  if (results.checks.invalidNonceRefusal.body !== '-1') throw new Error('Le refus d’un nonce invalide de l’onboarding n’est pas prouvé.');
  results.checks.contract = await page.evaluate(() => ({ dialog: Boolean(document.querySelector('dialog[aria-modal="true"]')), title: document.querySelector('#rc-onboarding-title')?.textContent?.trim(), progress: document.querySelector('.rc-vendor-onboarding-progress i')?.style.width, support: document.querySelector('.rc-vendor-onboarding-help')?.href }));
  if (Math.abs(Number.parseFloat(results.checks.contract.progress) - (100 / 6)) > 0.01) throw new Error('Le contrat mobile de la première étape est incomplet.');
  await page.keyboard.press('Tab'); results.checks.keyboardFocus = await page.evaluate(() => { const active = document.activeElement; const style = active ? getComputedStyle(active) : null; return { tag: active?.tagName, outlineStyle: style?.outlineStyle, outlineWidth: style?.outlineWidth }; });
  if (results.checks.keyboardFocus.outlineStyle === 'none' || results.checks.keyboardFocus.outlineWidth === '0px') throw new Error('Le focus clavier de l’onboarding n’est pas visible.');
  const baseline = await screenshot(page, `${runId}-chromium-onboarding-390-initial`);

  await page.locator('[data-rc-onboarding-name]').fill(shopName); await page.locator('[data-rc-onboarding-cuisine]').fill('Cuisine marocaine'); await page.locator('[data-rc-onboarding-description]').fill('Une adresse de recette QA pour valider le parcours public.'); await onboardingNext(page); await page.locator('[data-rc-onboarding-city]').waitFor({ state: 'visible' });
  await page.locator('[data-rc-onboarding-city]').fill('Gueliz'); await page.locator('[data-rc-onboarding-street]').fill('12 rue des Orangers'); await onboardingNext(page); await page.locator('[data-rc-onboarding-cover]').waitFor({ state: 'visible' });
  results.checks.coverCapture = await page.locator('[data-rc-onboarding-cover]').getAttribute('capture'); if (results.checks.coverCapture !== 'environment') throw new Error('La photo de couverture ne propose pas l’appareil arrière mobile.');
  await page.locator('[data-rc-onboarding-cover]').setInputFiles({ name: 'couverture-boutique.png', mimeType: 'image/png', buffer: photo }); await onboardingNext(page); await page.locator('[data-rc-onboarding-open]').waitFor({ state: 'visible' });
  await page.locator('[data-rc-onboarding-open]').fill('11:30'); await page.locator('[data-rc-onboarding-close-time]').fill('22:30'); await onboardingNext(page); await page.waitForFunction(() => /5 sur 6/.test(document.querySelector('.rc-vendor-onboarding-topline p')?.textContent || ''), null, { timeout: 15000 });
  await page.locator('[data-rc-vendor-onboarding][open]').waitFor({ state: 'visible' });
  results.checks.resume = await page.evaluate(() => ({ step: document.querySelector('.rc-vendor-onboarding-topline p')?.textContent?.trim(), hasLaunchButton: Boolean(document.querySelector('[data-rc-open-onboarding]')) }));
  if (!/5 sur 6/.test(results.checks.resume.step || '')) throw new Error('La sauvegarde progressive ne reprend pas à l’étape du premier plat.');
  await page.locator('[data-rc-onboarding-open-product]').click(); await addFirstDish(page);
  await openOnboarding(page);
  if (!/5 sur 6/.test(await page.locator('.rc-vendor-onboarding-topline p').textContent())) throw new Error('Le retour après premier plat ne reprend pas l’onboarding.');
  await onboardingNext(page); await page.locator('[data-rc-vendor-onboarding][open]').waitFor({ state: 'visible' });
  await axe(page, 'chromium-onboarding-390-review'); await screenshot(page, `${runId}-chromium-onboarding-390-review`);
  await Promise.all([page.waitForURL('**/restaurant/**', { timeout: 30000 }), onboardingNext(page)]);
  const storeUrl = page.url(); results.checks.storeUrl = storeUrl;
  if (!storeUrl.includes('/restaurant/')) throw new Error(`La publication n’a pas ouvert la boutique publique attendue : ${storeUrl}`);
  await page.locator('body').waitFor({ state: 'visible' }); results.checks.publicStore = await page.locator('body').textContent(); if (!results.checks.publicStore.includes(shopName) || !results.checks.publicStore.includes(dishName)) throw new Error('La boutique publique ne contient pas le restaurant et son premier plat.');
  await axe(page, 'chromium-storefront-390'); await screenshot(page, `${runId}-chromium-storefront-390`);
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForFunction((name) => document.body.textContent.includes(name), shopName, { timeout: 30000 });
  results.checks.marketplaceVisible = await page.locator('[data-rc-restaurant]', { hasText: shopName }).count(); if (!results.checks.marketplaceVisible) throw new Error('La boutique publiée n’apparaît pas dans la marketplace publique.');
  await page.goto(`${origin}/store-manager/`, { waitUntil: 'domcontentloaded' }); await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible' });
  await page.locator('[data-rc-tab="menu"]:visible').first().click(); const product = page.locator('[data-rc-product]', { hasText: dishName }).first(); await product.waitFor({ state: 'visible', timeout: 30000 }); const productId = Number(await product.getAttribute('data-rc-product')); results.checks.firstDishId = productId;
  const nonce = await page.evaluate(() => window.restocommerceVendorApp.nonce); const cleanup = await page.evaluate(async ({ productId, nonce }) => { const request = async (action, extra = {}) => { const body = new FormData(); body.append('action', action); body.append('nonce', nonce); Object.entries(extra).forEach(([key, value]) => body.append(key, String(value))); return (await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body, credentials: 'same-origin' })).json(); }; return { dish: await request('restocommerce_vendor_archive_product', { product_id: productId }), profile: await request('restocommerce_vendor_restore_onboarding_backup') }; }, { productId, nonce }); results.cleanup = cleanup; const profileProtected = !cleanup.profile.success && /restauration automatique est désactivée/i.test(cleanup.profile.data?.message || ''); results.cleanup.profileProtected = profileProtected; if (!cleanup.dish.success || (!cleanup.profile.success && !profileProtected)) throw new Error('Le nettoyage contrôlé du plat ou du profil de recette a échoué.');
  await resetIncompleteOnboarding(page);
  await context.close(); await activeBrowser.close(); activeBrowser = null;

  for (const [name, launcher, launchOptions] of engines) {
    activeBrowser = await launcher.launch({ headless: true, ...launchOptions }); const context = await activeBrowser.newContext({ viewport: { width: 390, height: 844 } }); const page = await context.newPage(); await login(page);
    for (const width of widths) { await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 }); await openOnboarding(page); await axe(page, `${name}-onboarding-${width}`); await screenshot(page, `${runId}-${name}-onboarding-${width}`); await page.locator('[data-rc-onboarding-close]').click(); }
    await context.close(); await activeBrowser.close(); activeBrowser = null;
  }

  activeBrowser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] }); const pixelContext = await activeBrowser.newContext({ viewport: { width: 390, height: 844 } }); const pixelPage = await pixelContext.newPage(); await login(pixelPage); await openOnboarding(pixelPage); const current = await screenshot(pixelPage, `${runId}-chromium-onboarding-390-pixel-current`); const first = PNG.sync.read(await fs.readFile(baseline)); const second = PNG.sync.read(await fs.readFile(current)); if (first.width !== second.width || first.height !== second.height) throw new Error('Les captures Pixelmatch n’ont pas les mêmes dimensions.'); const pixels = pixelmatch(first.data, second.data, null, first.width, first.height, { threshold: 0.1, includeAA: false }); const ratio = pixels / (first.width * first.height); const toleranceRatio = 0.005; results.checks.pixelmatch = { baseline, current, pixels, ratio, toleranceRatio, stable: ratio <= toleranceRatio }; if (!results.checks.pixelmatch.stable) throw new Error(`Pixelmatch détecte ${(ratio * 100).toFixed(2)} % de pixels différents sur l’état initial de l’onboarding.`); await pixelContext.close(); await activeBrowser.close(); activeBrowser = null;
  results.finishedAt = new Date().toISOString(); await fs.writeFile(path.join(receiptRoot, `${safe(runId)}-results.json`), JSON.stringify(results, null, 2)); console.log(JSON.stringify(results, null, 2));
} catch (error) {
  results.failure = { message: error.message, stack: error.stack }; results.finishedAt = new Date().toISOString(); await fs.writeFile(path.join(receiptRoot, `${safe(runId)}-failure.json`), JSON.stringify(results, null, 2)); console.error(JSON.stringify(results, null, 2)); process.exitCode = 1;
} finally { if (activeBrowser) await activeBrowser.close().catch(() => {}); }
