import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputRoot = process.env.RC_QA_OUT || path.join(root, 'docs', 'receipts', 'a11y-keyboard-artifacts');
const runDir = path.join(outputRoot, `${runId}-dialogs`);
const results = []; const blockers = [];

async function assertDialog(page, name, trigger, dialog) {
  await trigger.focus();
  const triggerId = await trigger.evaluate((node) => { node.dataset.rcQaTrigger = 'true'; return node.id || null; });
  await trigger.press('Enter');
  await dialog.waitFor({ state: 'visible', timeout: 10000 });
  const visibleAfterOpen = await dialog.evaluate((node) => node.matches('dialog') ? node.open : node.getAttribute('aria-hidden') === 'false');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const hiddenAfterEscape = await dialog.evaluate((node) => node.matches('dialog') ? !node.open : node.getAttribute('aria-hidden') !== 'false');
  const focusReturned = await page.evaluate(() => document.activeElement?.dataset?.rcQaTrigger === 'true');
  await trigger.evaluate((node) => delete node.dataset.rcQaTrigger);
  const item = { name, triggerId, visibleAfterOpen, hiddenAfterEscape, focusReturned, errors: [] };
  if (!visibleAfterOpen) item.errors.push('dialogue non visible après ouverture');
  if (!hiddenAfterEscape) item.errors.push('Échap ne ferme pas le dialogue');
  if (!focusReturned) item.errors.push('focus non retourné au déclencheur après Échap');
  results.push(item); if (item.errors.length) blockers.push(`${name}: ${item.errors.join('; ')}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', reducedMotion: 'reduce' });
const page = await context.newPage();
try {
  await page.goto(`${origin}/restaurant/demo-safran-medina/?rcqa=${encodeURIComponent(runId)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('[data-rc-store-menu]').waitFor({ state: 'visible', timeout: 15000 });
  const quickTrigger = page.locator('[data-rc-quick-product]').first();
  if (await quickTrigger.count()) await assertDialog(page, 'quick-view', quickTrigger, page.locator('[data-rc-quick-view]'));
  else blockers.push('quick-view: déclencheur introuvable');
  await assertDialog(page, 'panier-lateral', page.locator('[data-rc-open-cart]').first(), page.locator('[data-rc-cart-drawer]'));
} catch (error) { blockers.push(`recette dialogue: ${error.message}`); }
finally { await context.close(); await browser.close(); }
const receipt = { runId, origin, mode: 'Lecture seule ; ouverture et fermeture de dialogues publics sans ajout panier.', results, blockers, completedAt: new Date().toISOString() };
await fs.mkdir(runDir, { recursive: true });
await fs.writeFile(path.join(runDir, 'public-dialog-keyboard.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({ runDir, results, blockers }, null, 2));
process.exit(blockers.length ? 1 : 0);
