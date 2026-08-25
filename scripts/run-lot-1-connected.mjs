import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis.');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputRoot = process.env.RC_QA_OUT || path.join(root, 'docs', 'receipts', 'lot-1-connected-artifacts');
const runDir = path.join(outputRoot, runId);
const engines = [{ name: 'chromium', launcher: chromium, options: { executablePath: '/usr/bin/chromium', args: ['--disable-dev-shm-usage', '--disable-gpu'] } }, { name: 'firefox', launcher: firefox, options: {} }, { name: 'webkit', launcher: webkit, options: {} }].filter((engine) => !process.env.RC_ENGINES || process.env.RC_ENGINES.split(',').map((item) => item.trim()).includes(engine.name));
const viewports = [{ name: '390x844', width: 390, height: 844 }, { name: '768x1024', width: 768, height: 1024 }, { name: '1440x900', width: 1440, height: 900 }, { name: '1920x1080', width: 1920, height: 1080 }].filter((viewport) => !process.env.RC_VIEWPORTS || process.env.RC_VIEWPORTS.split(',').map((item) => item.trim()).includes(viewport.name));
const receipt = { runId, origin, mode: 'Vendeur de recette isolé ; aucun compte, produit ou commande existant n’est ciblé.', checks: [], blockers: [], cleanup: {}, startedAt: new Date().toISOString() };

async function login(page) {
  let lastIssue = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto(`${origin}/wp-login.php?rcqa=${encodeURIComponent(`${runId}-${attempt}`)}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (await page.locator('#user_login').count()) {
      await page.locator('#user_login').fill(username);
      await page.locator('#user_pass').fill(password);
      const navigated = page.waitForURL((url) => !url.pathname.endsWith('/wp-login.php'), { waitUntil: 'domcontentloaded', timeout: 15000 }).then(() => true).catch(() => false);
      await page.locator('#wp-submit').click();
      if (!await navigated) {
        lastIssue = (await page.locator('#login_error').allTextContents()).join(' ').replace(/\s+/g, ' ').trim() || 'navigation de connexion sans redirection';
        continue;
      }
    }
    await page.goto(`${origin}/store-manager/?rcqa=${encodeURIComponent(`${runId}-${attempt}`)}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const app = page.locator('[data-rc-vendor-app]');
    if (!await app.isVisible().catch(() => false)) {
      lastIssue = `cockpit indisponible après connexion (${page.url()})`;
      continue;
    }
    await page.waitForTimeout(500);
    const onboarding = page.locator('[data-rc-vendor-onboarding][open]');
    if (await onboarding.count()) {
      await page.locator('[data-rc-onboarding-close]').click();
      await onboarding.waitFor({ state: 'hidden', timeout: 5000 });
    }
    await page.waitForTimeout(300);
    const tour = page.locator('[data-rc-guidance-tour]:not([hidden])');
    if (await tour.count()) {
      await tour.locator('[data-rc-tour-skip]').click();
      await tour.waitFor({ state: 'hidden', timeout: 5000 });
    }
    return;
  }
  throw new Error(`Authentification vendeur non stabilisée après deux essais : ${lastIssue}`);
}

async function inspectFocus(page, method, tabStart = '') {
  return page.evaluate(({ method, tabStart }) => {
    const node = document.activeElement;
    const style = node ? getComputedStyle(node) : null;
    const outlineWidth = Number.parseFloat(style?.outlineWidth || '0');
    const visibleOutline = Boolean(style && style.outlineStyle !== 'none' && outlineWidth > 0);
    const visibleShadow = Boolean(style && style.boxShadow !== 'none');
    return {
      tag: node?.tagName || '',
      outlineStyle: style?.outlineStyle || '',
      outlineWidth: style?.outlineWidth || '',
      boxShadow: style?.boxShadow || '',
      discernable: visibleOutline || visibleShadow,
      method,
      tabStart,
    };
  }, { method, tabStart });
}

for (const engine of engines) {
  const browser = await engine.launcher.launch({ headless: true, ...engine.options });
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, locale: 'fr-FR', reducedMotion: 'reduce' });
      const page = await context.newPage();
      try {
        await login(page);
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const service = page.locator('[data-rc-service-toggle]');
        await page.keyboard.press('Tab');
        let focus = await inspectFocus(page, 'keyboard-tab');
        if (['BODY', 'HTML'].includes(focus.tag)) {
          await service.focus();
          focus = await inspectFocus(page, 'controlled-service-toggle', focus.tag);
        }
        const navTabs = await page.locator('[data-rc-tab]').count();
        const before = await service.getAttribute('aria-pressed').catch(() => null);
        let after = before; let restored = before;
        if (engine.name === 'chromium' && viewport.name === '390x844' && before !== null) {
          await service.click(); await page.waitForFunction((expected) => document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed') !== expected && !document.querySelector('[data-rc-service-toggle]')?.hasAttribute('aria-busy'), before, { timeout: 10000 }); after = await service.getAttribute('aria-pressed');
          await service.click(); await page.waitForFunction((expected) => document.querySelector('[data-rc-service-toggle]')?.getAttribute('aria-pressed') === expected && !document.querySelector('[data-rc-service-toggle]')?.hasAttribute('aria-busy'), before, { timeout: 10000 }); restored = await service.getAttribute('aria-pressed');
          receipt.cleanup.serviceStateRestored = restored === before;
        }
        const check = { engine: engine.name, viewport: viewport.name, axe: axe.violations.map((item) => ({ id: item.id, impact: item.impact, targets: item.nodes.map((node) => node.target) })), focus, navTabs, service: { before, after, restored }, errors: [] };
        if (check.axe.length) check.errors.push(`${check.axe.length} violation(s) axe`);
        if (!navTabs) check.errors.push('Navigation vendeur introuvable');
        if (focus.tag === 'BODY' || focus.tag === 'HTML' || !focus.discernable) check.errors.push('Focus clavier non discernable');
        if (engine.name === 'chromium' && viewport.name === '390x844' && before !== null && (after === before || restored !== before)) check.errors.push('Bascule de service non réversible');
        receipt.checks.push(check); if (check.errors.length) receipt.blockers.push(`${engine.name}/${viewport.name}: ${check.errors.join('; ')}`);
      } catch (error) { receipt.blockers.push(`${engine.name}/${viewport.name}: ${error.message}`); }
      finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
receipt.finishedAt = new Date().toISOString();
await fs.mkdir(runDir, { recursive: true });
await fs.writeFile(path.join(runDir, 'lot-1-connected.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify({ runDir, checks: receipt.checks.length, blockers: receipt.blockers, cleanup: receipt.cleanup }, null, 2));
process.exit(receipt.blockers.length ? 1 : 0);
