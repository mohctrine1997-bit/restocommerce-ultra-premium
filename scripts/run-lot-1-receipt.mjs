/** CDC Maître — Lot 1 : recette UX/accessibilité/performance sur staging WordPress réel. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const qaRoot = process.env.RC_QA_ROOT || '/home/ubuntu/resto-commerce-qa';
const origin = (process.env.RC_STAGING_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.join(qaRoot, 'lot-1', 'runs', runId);
const baselineDir = path.join(qaRoot, 'lot-1', 'baseline', 'ux-foundations-v2');
const updateBaseline = process.argv.includes('--update-baseline');
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const engines = [{ name: 'chromium', launcher: chromium }, { name: 'firefox', launcher: firefox }, { name: 'webkit', launcher: webkit }];
const viewports = [{ name: 'mobile-390x844', width: 390, height: 844 }, { name: 'tablet-768x1024', width: 768, height: 1024 }, { name: 'desktop-1440x900', width: 1440, height: 900 }, { name: 'wide-1920x1080', width: 1920, height: 1080 }];
const routes = [
  { id: 'marketplace', url: '/', ready: '[data-rc-marketplace]', states: ['loading', 'empty', 'error', 'success'], statePrefix: 'marketplace' },
  { id: 'restaurant-menu', url: '/restaurant/demo-safran-medina/', ready: '[data-rc-store-menu]', states: ['loading', 'empty', 'error', 'success'], statePrefix: 'menu' },
  { id: 'not-found', url: '/adresse-introuvable-rc/', ready: '.rc-page-not-found', states: [], statePrefix: null },
];
const safe = (value) => value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
const exists = async (file) => fs.access(file).then(() => true).catch(() => false);
const urlFor = (route, extras = {}) => `${origin}${route.url}?${new URLSearchParams({ rcqa: runId, ...extras }).toString()}`;
const violations = (results) => results.violations.map((item) => ({ id: item.id, impact: item.impact || 'unknown', nodes: item.nodes.length }));

async function gotoReady(page, url, selector) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
      await page.locator(selector).first().waitFor({ state: 'visible', timeout: 60000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await page.waitForTimeout(1000 * attempt);
    }
  }
  throw lastError;
}

async function settle(page) {
  await page.waitForTimeout(450);
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const images = [...document.images];
    images.forEach((image) => { image.loading = 'eager'; });
    for (let top = 0; top < document.documentElement.scrollHeight; top += innerHeight) { scrollTo(0, top); await pause(100); }
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    scrollTo(0, 0); await pause(180);
  });
}

async function compare(currentPath, referencePath, diffPath) {
  const [current, reference] = await Promise.all([fs.readFile(currentPath), fs.readFile(referencePath)]).then((files) => files.map((file) => PNG.sync.read(file)));
  if (current.width !== reference.width || current.height !== reference.height) return { status: 'dimension-mismatch' };
  const diff = new PNG({ width: current.width, height: current.height });
  const changedPixels = pixelmatch(reference.data, current.data, diff.data, current.width, current.height, { threshold: 0.1, includeAA: false });
  await fs.writeFile(diffPath, PNG.sync.write(diff));
  return { status: 'compared', changedPixels, changedRatio: Number((changedPixels / (current.width * current.height)).toFixed(6)) };
}

async function captureNormal(page, engine, route, viewport, receipt) {
  const id = `${engine.name}-${route.id}-${viewport.name}`;
  await gotoReady(page, urlFor(route), route.ready);
  await settle(page);
  await page.keyboard.press('Tab');
  const keyboard = await page.evaluate(() => { const active = document.activeElement; const style = active ? getComputedStyle(active) : null; return { element: active ? active.tagName.toLowerCase() : null, visible: Boolean(style && (style.outlineStyle !== 'none' || style.boxShadow !== 'none')) }; });
  const axe = await new AxeBuilder({ page }).withTags(tags).analyze();
  const screenshot = path.join(runDir, `${safe(id)}.png`);
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  const reference = path.join(baselineDir, `${safe(id)}.png`);
  const diff = updateBaseline || !(await exists(reference)) ? (await fs.copyFile(screenshot, reference), { status: 'baseline-created' }) : await compare(screenshot, reference, path.join(runDir, `diff-${safe(id)}.png`));
  const item = { id, route: route.id, engine: engine.name, viewport: viewport.name, keyboard, axeViolations: violations(axe), screenshot, diff };
  receipt.normal.push(item);
  if (!keyboard.visible) receipt.blockers.push(`${id} : focus clavier non discernable.`);
  if (item.axeViolations.length) receipt.blockers.push(`${id} : ${item.axeViolations.length} violation(s) axe-core.`);
}

async function captureStates(browser, route, receipt) {
  for (const state of route.states) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR', reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
      await gotoReady(page, urlFor(route, { rc_ui: `${route.statePrefix}-${state}` }), '.rc-ui-state:not([hidden])');
      const axe = await new AxeBuilder({ page }).withTags(tags).analyze();
      const screenshot = path.join(runDir, `state-${safe(route.id)}-${state}.png`);
      await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
      const item = { route: route.id, state, status: 'completed', screenshot, axeViolations: violations(axe) };
      receipt.states.push(item);
      if (item.axeViolations.length) receipt.blockers.push(`${route.id} état ${state} : ${item.axeViolations.length} violation(s) axe-core.`);
    } catch (error) { receipt.states.push({ route: route.id, state, status: 'failed', error: error.message }); receipt.blockers.push(`${route.id} état ${state} : ${error.message}`); }
    finally { await context.close().catch(() => undefined); }
  }
}

function processRun(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] }); let stdout = ''; let stderr = '';
    child.stdout.on('data', (data) => { stdout += data; }); child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', (error) => resolve({ code: -1, stdout, stderr, error: error.message })); child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function lighthouse() {
  const outputPath = path.join(runDir, 'lighthouse-mobile.json');
  const result = await processRun('pnpm', ['exec', 'lighthouse', urlFor(routes[0]), '--output=json', `--output-path=${outputPath}`, '--only-categories=performance,accessibility,best-practices,seo', '--form-factor=mobile', '--throttling-method=simulate', '--chrome-flags=--headless --no-sandbox --disable-gpu', '--quiet']);
  if (result.code !== 0 || !(await exists(outputPath))) return { status: 'failed', process: result };
  const report = JSON.parse(await fs.readFile(outputPath, 'utf8')); const score = (name) => Math.round((report.categories?.[name]?.score ?? 0) * 100);
  return { status: 'completed', scores: { performance: score('performance'), accessibility: score('accessibility'), bestPractices: score('best-practices'), seo: score('seo') }, metrics: { lcp: report.audits?.['largest-contentful-paint']?.displayValue, cls: report.audits?.['cumulative-layout-shift']?.displayValue, tbt: report.audits?.['total-blocking-time']?.displayValue, speedIndex: report.audits?.['speed-index']?.displayValue } };
}

function markdown(receipt) {
  const normal = receipt.normal.map((item) => `| ${item.engine} | ${item.route} | ${item.viewport} | ${item.axeViolations.length} | ${item.keyboard.visible ? 'Oui' : 'Non'} | ${item.diff.status}${item.diff.changedRatio !== undefined ? ` (${item.diff.changedRatio})` : ''} |`).join('\n');
  const states = receipt.states.map((item) => `| ${item.route} | ${item.state} | ${item.status} | ${item.axeViolations?.length ?? 'n/a'} |`).join('\n');
  const lh = receipt.lighthouse.status === 'completed' ? `| ${receipt.lighthouse.scores.performance} | ${receipt.lighthouse.scores.accessibility} | ${receipt.lighthouse.scores.bestPractices} | ${receipt.lighthouse.scores.seo} | ${receipt.lighthouse.metrics.lcp} | ${receipt.lighthouse.metrics.cls} | ${receipt.lighthouse.metrics.tbt} |` : '| Échec | — | — | — | — | — | — |';
  return `# RestoCommerce — Recette automatisée Lot 1\n\n| Élément | Valeur |\n| --- | --- |\n| Staging | ${origin} |\n| Exécution | ${runId} |\n| Commande | pnpm qa:lot1 |\n| Preuves | ${runDir} |\n\n## Matrice multi-navigateurs et responsive\n\n| Moteur | Parcours | Breakpoint | Axe | Focus | Pixelmatch |\n| --- | --- | --- | ---: | --- | --- |\n${normal}\n\n## États UX contrôlés par paramètre sandbox\n\n| Parcours | État | Résultat | Axe |\n| --- | --- | --- | ---: |\n${states}\n\n## Lighthouse mobile\n\n| Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |\n| ---: | ---: | ---: | ---: | --- | --- | --- |\n${lh}\n\n## Bloquants\n\n${receipt.blockers.length ? receipt.blockers.map((item) => `- ${item}`).join('\n') : '- Aucun blocage technique détecté ; la validation humaine reste obligatoire avant le Lot 2.'}\n`;
}

await fs.mkdir(runDir, { recursive: true }); await fs.mkdir(baselineDir, { recursive: true });
const receipt = { lot: 1, runId, origin, runDir, normal: [], states: [], blockers: [], lighthouse: { status: 'pending' }, vendorCoverage: 'recette réelle séparée : scripts/verify-vendor-dashboard-2-0.mjs', startedAt: new Date().toISOString() };
for (const engine of engines) {
  let browser;
  try { browser = await engine.launcher.launch({ headless: true }); } catch (error) { receipt.blockers.push(`${engine.name} ne démarre pas : ${error.message}`); continue; }
  try {
    for (const route of routes) for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, locale: 'fr-FR', reducedMotion: 'reduce' }); const page = await context.newPage(); page.setDefaultTimeout(60000);
      try { await captureNormal(page, engine, route, viewport, receipt); } catch (error) { receipt.blockers.push(`${engine.name} ${route.id} ${viewport.name} : ${error.message}`); }
      finally { await context.close().catch(() => undefined); }
    }
    if (engine.name === 'chromium') for (const route of routes.filter((route) => route.states.length)) await captureStates(browser, route, receipt);
  } finally { await browser.close().catch(() => undefined); }
}
receipt.lighthouse = await lighthouse(); if (receipt.lighthouse.status !== 'completed') receipt.blockers.push('Lighthouse mobile n’a pas généré de rapport exploitable.'); receipt.completedAt = new Date().toISOString();
await fs.writeFile(path.join(runDir, 'lot-1-receipt.json'), JSON.stringify(receipt, null, 2)); await fs.writeFile(path.join(runDir, 'lot-1-receipt.md'), markdown(receipt)); console.log(JSON.stringify({ runDir, blockers: receipt.blockers, lighthouse: receipt.lighthouse }, null, 2));
