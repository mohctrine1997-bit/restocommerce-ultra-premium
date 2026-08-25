import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const vendorSlug = process.env.RC_KNOWN_VENDOR_SLUG || 'demo-safran-medina';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputRoot = process.env.RC_QA_OUT || path.join(root, 'docs', 'receipts', 'lot-12-artifacts');
const runDir = path.join(outputRoot, runId);
const profile = { viewport: '390x844', latencyMs: 150, downloadMbps: 1.6, uploadKbps: 750, cpuSlowdown: 4 };
const results = []; const blockers = [];
const queryUrl = (route) => `${origin}${route}${route.includes('?') ? '&' : '?'}rcqa=${encodeURIComponent(runId)}`;

async function navigation(page, id, route, selector) {
  const response = await page.goto(queryUrl(route), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15000 });
  const metrics = await page.evaluate(() => { const entry = performance.getEntriesByType('navigation')[0]; return entry ? { ttfb: Math.round(entry.responseStart), domInteractive: Math.round(entry.domInteractive), domContentLoaded: Math.round(entry.domContentLoadedEventEnd), load: Math.round(entry.loadEventEnd) } : null; });
  const item = { id, route, status: response?.status() ?? 0, metrics, errors: [] };
  if (item.status !== 200) item.errors.push(`HTTP ${item.status}`);
  results.push(item); if (item.errors.length) blockers.push(`${id}: ${item.errors.join('; ')}`);
  return item;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', reducedMotion: 'reduce' });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: profile.latencyMs, downloadThroughput: Math.round(profile.downloadMbps * 1024 * 1024 / 8), uploadThroughput: Math.round(profile.uploadKbps * 1024 / 8), connectionType: 'cellular3g' });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuSlowdown });

try {
  await navigation(page, 'marketplace', '/', '[data-rc-marketplace]');
  await navigation(page, 'restaurant', `/restaurant/${vendorSlug}/`, '[data-rc-store-menu]');
  const href = await page.locator('[data-rc-store-menu] a[href*="/produit/"]').first().getAttribute('href');
  if (!href) throw new Error('Aucun produit public n’est disponible pour le parcours panier.');
  await navigation(page, 'produit', new URL(href, origin).pathname, '.rc-product-page, [data-rc-quick-order-form], form.cart');
  const customForm = page.locator('[data-rc-quick-order-form]').first();
  if (await customForm.count()) { const requiredRadios = customForm.locator('input[type="radio"][required]'); if (await requiredRadios.count()) { const radioId = await requiredRadios.first().getAttribute('id'); if (radioId) await customForm.locator(`label[for="${radioId}"]`).click(); else await requiredRadios.first().check({ force: true }); } const confirmation = customForm.locator('input[name="rc_menu_confirmation"][required]'); if (await confirmation.count()) await customForm.locator('label:has(input[name="rc_menu_confirmation"])').click(); }
  const selects = page.locator('form.cart select');
  for (let index = 0; index < await selects.count(); index += 1) { const options = await selects.nth(index).locator('option').evaluateAll((nodes) => nodes.map((node) => ({ value: node.value, disabled: node.disabled })).filter((item) => item.value && !item.disabled)); if (options[0]) await selects.nth(index).selectOption(options[0].value); }
  const add = customForm.count() ? customForm.locator('[data-rc-quick-submit]:not([disabled])').first() : page.locator('form.cart button.single_add_to_cart_button:not([disabled]), form.cart button[type="submit"]:not([disabled]), button[name="add-to-cart"]:not([disabled])').first();
  const addItem = { id: 'ajout-panier-isole', route: new URL(href, origin).pathname, performed: false, sessionOnly: true, errors: [] };
  if (await add.count()) {
    const start = Date.now(); await add.click({ timeout: 10000 });
    await page.waitForTimeout(1500);
    addItem.performed = true; addItem.feedbackMs = Date.now() - start;
    addItem.visibleFeedback = await page.locator('.woocommerce-message, .woocommerce-notices-wrapper, [role="alert"], .rc-cart-drawer').count() > 0;
  } else addItem.errors.push('Bouton ajout panier indisponible après choix des options.');
  results.push(addItem); if (addItem.errors.length) blockers.push(`${addItem.id}: ${addItem.errors.join('; ')}`);
} catch (error) { blockers.push(`recette publique: ${error.message}`); }
finally { await context.close(); await browser.close(); }

const receipt = { runId, origin, profile, mutationPolicy: 'Aucun compte, produit, média, commande, statut vendeur ou contenu n’est modifié. L’ajout panier éventuel s’exécute dans un contexte navigateur neuf et fermé en fin de recette.', results, blockers, limitations: ['Le cockpit vendeur, l’ajout/modification de produit et l’avancement de commande ne sont pas testables sans session vendeur explicitement autorisée.', 'La mesure reflète la variabilité du staging et un seul profil mobile simulé ; elle ne remplace pas un appareil physique.'], completedAt: new Date().toISOString() };
await fs.mkdir(runDir, { recursive: true });
await fs.writeFile(path.join(runDir, 'lot-12-degraded.json'), JSON.stringify(receipt, null, 2));
await fs.writeFile(path.join(runDir, 'lot-12-degraded.md'), `# Lot 12 — Dégradation simulée\n\n| Paramètre | Valeur |\n| --- | --- |\n| Vue | ${profile.viewport} |\n| Latence | ${profile.latencyMs} ms |\n| Débit descendant | ${profile.downloadMbps} Mbps |\n| CPU | ×${profile.cpuSlowdown} |\n| Mode | Session publique isolée, sans compte vendeur ni commande |\n\n| Parcours | HTTP / état | TTFB | DOM prêt | Load | Retour action | Erreurs |\n| --- | --- | ---: | ---: | ---: | ---: | --- |\n${results.map((item) => `| ${item.id} | ${item.status ?? (item.performed ? 'effectué' : 'non effectué')} | ${item.metrics?.ttfb ?? '—'} ms | ${item.metrics?.domContentLoaded ?? '—'} ms | ${item.metrics?.load ?? '—'} ms | ${item.feedbackMs ?? '—'} ms | ${(item.errors || []).join('; ') || 'Aucune'} |`).join('\n')}\n\n## Limites\n\n${receipt.limitations.map((item) => `- ${item}`).join('\n')}\n`);
console.log(JSON.stringify({ runDir, profile, results, blockers }, null, 2));
process.exit(blockers.length ? 1 : 0);
