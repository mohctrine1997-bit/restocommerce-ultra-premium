import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputRoot = process.env.RC_QA_OUT || path.join(root, 'docs', 'receipts', 'route-regression-artifacts');
const runDir = path.join(outputRoot, runId);
const knownVendorSlug = process.env.RC_KNOWN_VENDOR_SLUG || 'demo-safran-medina';
const engines = [
  { name: 'chromium', launcher: chromium },
  { name: 'firefox', launcher: firefox },
  { name: 'webkit', launcher: webkit },
].filter((engine) => !process.env.RC_ENGINES || process.env.RC_ENGINES.split(',').map((item) => item.trim()).includes(engine.name));
const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
].filter((viewport) => !process.env.RC_VIEWPORTS || process.env.RC_VIEWPORTS.split(',').map((item) => item.trim()).includes(viewport.name));
const selectedRouteIds = process.env.RC_ROUTE_IDS ? process.env.RC_ROUTE_IDS.split(',').map((item) => item.trim()).filter(Boolean) : null;
const publicRoutes = [
  { id: 'marketplace', path: '/', selector: '[data-rc-marketplace]', expectedStatus: 200 },
  { id: 'restaurant-canonique', path: `/restaurant/${knownVendorSlug}/`, selector: '[data-rc-store-menu]', expectedStatus: 200, canonical: `/restaurant/${knownVendorSlug}/` },
  { id: 'legacy-store-redirect', path: `/store/${knownVendorSlug}/`, selector: '[data-rc-store-menu]', expectedStatus: 200, finalPath: `/restaurant/${knownVendorSlug}/`, redirected: true },
  { id: 'restaurant-inconnu', path: `/restaurant/route-inconnue-rc-${runId}/`, selector: '.rc-page-not-found', expectedStatus: 404 },
  { id: 'panier', path: '/panier/', selector: '.woocommerce-cart-form, .wc-block-cart, .cart-empty', expectedStatus: 200 },
	{ id: 'commande', path: '/commande/', selector: 'form.checkout, .wc-block-checkout, .woocommerce-checkout, .woocommerce-cart-form, .cart-empty', expectedStatus: 200, finalPaths: ['/commander/', '/panier/'], note: 'Une session sans panier est redirigée vers le panier ; le checkout complet est vérifié séparément avec une session de recette.' },
].filter((route) => !selectedRouteIds || selectedRouteIds.includes(route.id));
const shouldCheckProduct = !selectedRouteIds || selectedRouteIds.includes('produit');

const checks = [];
const blockers = [];
const urlFor = (routePath) => `${origin}${routePath}${routePath.includes('?') ? '&' : '?'}rcqa=${encodeURIComponent(runId)}`;
const tidyPath = (value) => new URL(value).pathname.replace(/\/+$/, '/') || '/';

async function checkRoute(page, engineName, viewport, route) {
	const response = await page.goto(urlFor(route.path), { waitUntil: 'domcontentloaded', timeout: 12000 });
	const status = response?.status() ?? 0;
	await page.locator(route.selector).first().waitFor({ state: 'visible', timeout: 6000 });
  const finalPath = tidyPath(page.url());
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
  const redirected = Boolean(response?.request().redirectedFrom());
  const genericWcfmPage = await page.locator('#wcfmmp-store, .wcfmmp-store-page:not(body)').count();
  const errors = [];
  if (status !== route.expectedStatus) errors.push(`HTTP ${status} au lieu de ${route.expectedStatus}`);
  if (route.finalPath && finalPath !== route.finalPath) errors.push(`destination ${finalPath} au lieu de ${route.finalPath}`);
  if (route.finalPaths && !route.finalPaths.includes(finalPath)) errors.push(`destination ${finalPath} hors destinations attendues (${route.finalPaths.join(', ')})`);
  if (route.canonical && tidyPath(canonical || '') !== route.canonical) errors.push(`canonical ${canonical || 'absent'} au lieu de ${route.canonical}`);
  if (route.redirected && !redirected) errors.push('redirection 301/302 absente');
  if (genericWcfmPage) errors.push('template WCFM générique détecté');
  const item = { engine: engineName, viewport: viewport.name, route: route.id, status, finalPath, canonical, redirected, genericWcfmPage, note: route.note || null, errors };
  checks.push(item);
  if (errors.length) blockers.push(`${engineName}/${viewport.name}/${route.id}: ${errors.join('; ')}`);
}

async function checkProduct(page, engineName, viewport) {
	await page.goto(urlFor(`/restaurant/${knownVendorSlug}/`), { waitUntil: 'domcontentloaded', timeout: 12000 });
  const href = await page.locator('[data-rc-store-menu] a[href*="/produit/"]').first().getAttribute('href').catch(() => null);
  if (!href) {
    blockers.push(`${engineName}/${viewport.name}/produit: aucun lien produit public détecté.`);
    checks.push({ engine: engineName, viewport: viewport.name, route: 'produit', errors: ['aucun lien produit public détecté'] });
    return;
  }
	const response = await page.goto(new URL(href, origin).toString(), { waitUntil: 'domcontentloaded', timeout: 12000 });
	await page.locator('.rc-product-page, [id^="rc-quick-quantity-"]').first().waitFor({ state: 'visible', timeout: 6000 });
  const status = response?.status() ?? 0;
  const errors = status !== 200 ? [`HTTP ${status} au lieu de 200`] : [];
  const item = { engine: engineName, viewport: viewport.name, route: 'produit', status, finalPath: tidyPath(page.url()), errors };
  checks.push(item);
  if (errors.length) blockers.push(`${engineName}/${viewport.name}/produit: ${errors.join('; ')}`);
}

async function vendorDashboardCheck(browser) {
  if (!process.env.RC_VENDOR_USER || !process.env.RC_VENDOR_PASSWORD) {
    return { status: 'skipped', reason: 'RC_VENDOR_USER et RC_VENDOR_PASSWORD ne sont pas définis.' };
  }
  const context = await browser.newContext({ viewport: viewports[0], locale: 'fr-FR', reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
		await page.goto(`${origin}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 12000 });
    await page.locator('#user_login').fill(process.env.RC_VENDOR_USER);
    await page.locator('#user_pass').fill(process.env.RC_VENDOR_PASSWORD);
    await page.locator('#wp-submit').click();
		await page.waitForURL((url) => !url.pathname.endsWith('/wp-login.php'), { timeout: 12000 });
		const response = await page.goto(urlFor('/store-manager/'), { waitUntil: 'domcontentloaded', timeout: 12000 });
		await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 6000 });
    const status = response?.status() ?? 0;
    const errors = status !== 200 ? [`HTTP ${status} au lieu de 200`] : [];
    checks.push({ engine: 'chromium', viewport: '390x844', route: 'dashboard-vendeur', status, finalPath: tidyPath(page.url()), errors });
    if (errors.length) blockers.push(`chromium/390x844/dashboard-vendeur: ${errors.join('; ')}`);
    return { status: errors.length ? 'failed' : 'completed' };
  } catch (error) {
    blockers.push(`dashboard-vendeur: ${error.message}`);
    return { status: 'failed', error: error.message };
  } finally {
    await context.close();
  }
}

for (const engine of engines) {
  let browser;
  try {
    browser = await engine.launcher.launch({ headless: true });
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, locale: 'fr-FR', reducedMotion: 'reduce' });
      const page = await context.newPage();
      try {
        for (const route of publicRoutes) {
          try { await checkRoute(page, engine.name, viewport, route); }
          catch (error) { checks.push({ engine: engine.name, viewport: viewport.name, route: route.id, errors: [error.message] }); blockers.push(`${engine.name}/${viewport.name}/${route.id}: ${error.message}`); }
        }
		if (shouldCheckProduct) {
			try { await checkProduct(page, engine.name, viewport); }
			catch (error) { checks.push({ engine: engine.name, viewport: viewport.name, route: 'produit', errors: [error.message] }); blockers.push(`${engine.name}/${viewport.name}/produit: ${error.message}`); }
		}
      } finally {
        await context.close();
      }
    }
    if (engine.name === 'chromium') var vendorDashboard = await vendorDashboardCheck(browser);
  } catch (error) {
    blockers.push(`${engine.name}: démarrage impossible (${error.message})`);
  } finally {
    await browser?.close();
  }
}

const receipt = { runId, origin, knownVendorSlug, readOnly: true, outputDirectory: runDir, vendorDashboard: vendorDashboard || { status: 'not-run' }, checks, blockers, completedAt: new Date().toISOString() };
await fs.mkdir(runDir, { recursive: true });
await fs.writeFile(path.join(runDir, 'route-regression.json'), JSON.stringify(receipt, null, 2));
await fs.writeFile(path.join(runDir, 'route-regression.md'), `# Régression de routes RestoCommerce\n\n| Élément | Valeur |\n| --- | --- |\n| Exécution | ${runId} |\n| Origine | ${origin} |\n| Mode | Lecture seule : aucune création, suppression, désactivation, archivage ou mise à jour métier. |\n| Preuves privées | ${runDir} |\n\n## Résultats\n\n| Moteur | Breakpoint | Route | HTTP | Erreurs |\n| --- | --- | --- | ---: | --- |\n${checks.map((item) => `| ${item.engine} | ${item.viewport} | ${item.route} | ${item.status ?? '—'} | ${item.errors?.join('; ') || 'Aucune'} |`).join('\n')}\n\n## Bloquants\n\n${blockers.length ? blockers.map((item) => `- ${item}`).join('\n') : '- Aucun blocage de routage détecté par cette recette de lecture seule.'}\n`);
console.log(JSON.stringify({ runDir, readOnly: true, blockers, checks: checks.length, vendorDashboard: receipt.vendorDashboard }, null, 2));
process.exit(blockers.length ? 1 : 0);
