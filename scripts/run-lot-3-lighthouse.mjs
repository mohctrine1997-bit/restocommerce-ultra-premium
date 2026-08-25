/** CDC Maître — Lot 3 : Lighthouse mobile sur staging réel, cockpit propriétaire et storefront canonique. */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const origin = (process.env.RC_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const username = process.env.RC_VENDOR_USER;
const password = process.env.RC_VENDOR_PASSWORD;
const artifactDir = path.resolve(process.env.RC_QA_OUT || path.join(root, 'docs', 'receipts', 'lot-3-artifacts'));
const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rc-lot3-lh-'));
const port = 9327;

if (!username || !password) throw new Error('RC_VENDOR_USER et RC_VENDOR_PASSWORD sont requis pour la mesure Lighthouse Lot 3.');
await fs.mkdir(artifactDir, { recursive: true });

const launchLighthouse = (args) => new Promise((resolve) => {
  const child = spawn('pnpm', ['exec', 'lighthouse', ...args], { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = ''; let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('close', (code) => resolve({ code, stdout, stderr }));
  child.on('error', (error) => resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}` }));
});
const summarize = async (name, processResult) => {
  const reportPath = path.join(artifactDir, `lighthouse-lot-3-${name}.json`);
  if (processResult.code !== 0) return { status: 'failed', reason: processResult.stderr || processResult.stdout };
  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  const score = (key) => Math.round((report.categories?.[key]?.score ?? 0) * 100);
  return { status: 'completed', reportPath, scores: { performance: score('performance'), accessibility: score('accessibility'), bestPractices: score('best-practices'), seo: score('seo') }, metrics: { lcp: report.audits?.['largest-contentful-paint']?.displayValue, cls: report.audits?.['cumulative-layout-shift']?.displayValue, tbt: report.audits?.['total-blocking-time']?.displayValue, speedIndex: report.audits?.['speed-index']?.displayValue } };
};

const context = await chromium.launchPersistentContext(profileDir, { headless: true, viewport: { width: 390, height: 844 }, args: [`--remote-debugging-port=${port}`, '--no-sandbox', '--disable-gpu'] });
try {
  const page = await context.newPage();
  await page.goto(`${origin}/wp-login.php`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (await page.locator('#user_login').count()) {
    await page.locator('#user_login').fill(username); await page.locator('#user_pass').fill(password);
    await Promise.all([page.waitForLoadState('domcontentloaded'), page.locator('#wp-submit').click()]);
  }
  await page.goto(`${origin}/store-manager/?rcqa=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('[data-rc-vendor-app]').waitFor({ state: 'visible', timeout: 60000 });
  await page.locator('[data-rc-vendor-onboarding][open]').waitFor({ state: 'visible', timeout: 30000 });
  await page.screenshot({ path: path.join(artifactDir, 'lighthouse-lot-3-onboarding-390.png'), fullPage: true, animations: 'disabled' });
  await page.locator('[data-rc-onboarding-close]').click();

  const baseArgs = ['--output=json', '--only-categories=performance,accessibility,best-practices,seo', '--form-factor=mobile', '--throttling-method=simulate', `--port=${port}`, '--chrome-flags=--headless --no-sandbox --disable-gpu', '--quiet'];
  const cockpit = await launchLighthouse([`${origin}/store-manager/?rcqa=1`, `--output-path=${path.join(artifactDir, 'lighthouse-lot-3-cockpit.json')}`, ...baseArgs]);
  const storefront = await launchLighthouse([`${origin}/restaurant/demo-safran-medina/?lot3-lh=1`, `--output-path=${path.join(artifactDir, 'lighthouse-lot-3-storefront.json')}`, ...baseArgs]);
  const receipt = { lot: 3, version: '2.4.7', origin, measuredAt: new Date().toISOString(), cockpit: await summarize('cockpit', cockpit), storefront: await summarize('storefront', storefront) };
  await fs.writeFile(path.join(artifactDir, 'lighthouse-lot-3-summary.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await context.close().catch(() => undefined);
  await fs.rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
}
