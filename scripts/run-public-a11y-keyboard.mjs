import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputRoot = process.env.RC_QA_OUT || path.join(root, 'docs', 'receipts', 'a11y-keyboard-artifacts');
const runDir = path.join(outputRoot, runId);
const engines = [{ name: 'chromium', launcher: chromium }, { name: 'firefox', launcher: firefox }, { name: 'webkit', launcher: webkit }];
const viewports = [{ name: '390x844', width: 390, height: 844 }, { name: '1440x900', width: 1440, height: 900 }];
const baseRoutes = [{ id: 'marketplace', path: '/', selector: '[data-rc-marketplace]' }, { id: 'restaurant', path: '/restaurant/demo-safran-medina/', selector: '[data-rc-store-menu]' }];
const results = []; const blockers = [];
const urlFor = (route) => `${origin}${route}${route.includes('?') ? '&' : '?'}rcqa=${encodeURIComponent(runId)}`;

async function keyboardTrace(page) {
  await page.locator('body').press('Home').catch(() => null);
  const trace = [];
  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab');
    trace.push(await page.evaluate(() => { const node = document.activeElement; return { tag: node?.tagName || '', id: node?.id || '', role: node?.getAttribute('role') || '', label: node?.getAttribute('aria-label') || '', text: (node?.textContent || '').trim().slice(0, 60) }; }));
  }
  return trace;
}

for (const engine of engines) {
  const browser = await engine.launcher.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, locale: 'fr-FR', reducedMotion: 'reduce' });
      const page = await context.newPage();
      try {
        const routes = [...baseRoutes];
        await page.goto(urlFor('/restaurant/demo-safran-medina/'), { waitUntil: 'domcontentloaded', timeout: 30000 });
        const productHref = await page.locator('[data-rc-store-menu] a[href*="/produit/"]').first().getAttribute('href').catch(() => null);
        if (productHref) routes.push({ id: 'produit', path: new URL(productHref, origin).pathname, selector: '.rc-product-page, [data-rc-quick-order-form]' });
        for (const route of routes) {
          const response = await page.goto(urlFor(route.path), { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.locator(route.selector).first().waitFor({ state: 'visible', timeout: 15000 });
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
          const keyboard = await keyboardTrace(page);
          const focusable = keyboard.filter((item) => item.tag && item.tag !== 'BODY' && item.tag !== 'HTML');
          const item = { engine: engine.name, viewport: viewport.name, route: route.id, status: response?.status() ?? 0, axeViolations: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })), keyboardSteps: keyboard, errors: [] };
          if (item.status !== 200) item.errors.push(`HTTP ${item.status}`);
          if (item.axeViolations.length) item.errors.push(`${item.axeViolations.length} violation(s) axe`);
          if (!focusable.length) item.errors.push('Aucun élément focalisable détecté après navigation clavier.');
          results.push(item); if (item.errors.length) blockers.push(`${engine.name}/${viewport.name}/${route.id}: ${item.errors.join('; ')}`);
        }
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}

const receipt = { runId, origin, mode: 'Lecture seule ; aucune session vendeur, commande, préférence, produit, média ou compte n’est modifié.', results, blockers, limitations: ['Le script ne valide pas le cockpit connecté, les alertes navigateur, les dialogues après écriture ou les lecteurs d’écran natifs.', 'Les résultats clavier confirment l’atteignabilité ; une validation NVDA/VoiceOver réelle reste nécessaire.'], completedAt: new Date().toISOString() };
await fs.mkdir(runDir, { recursive: true });
await fs.writeFile(path.join(runDir, 'public-a11y-keyboard.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({ runDir, checks: results.length, blockers }, null, 2));
process.exit(blockers.length ? 1 : 0);
