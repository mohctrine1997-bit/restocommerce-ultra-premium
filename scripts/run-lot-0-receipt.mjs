/**
 * CDC Maître — Lot 0 : recette de référence de la page d'accueil WordPress.
 * Cette recette est volontairement indépendante du front React : elle contrôle le staging réel.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const qaRoot = process.env.RC_QA_ROOT || '/home/ubuntu/resto-commerce-qa';
const origin = (process.env.RC_STAGING_ORIGIN || 'https://aliceblue-bison-433987.hostingersite.com').replace(/\/$/, '');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.join(qaRoot, 'lot-0', 'runs', runId);
const baselineDir = path.join(qaRoot, 'lot-0', 'baseline', 'home-stable-1');
const updateBaseline = process.argv.includes('--update-baseline');

const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
];

const engines = [
  { name: 'chromium', launcher: chromium },
  { name: 'firefox', launcher: firefox },
  { name: 'webkit', launcher: webkit },
];

function safeFileName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '');
}

async function ensureDir(directory) {
  await fs.mkdir(directory, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function comparePng(currentPath, baselinePath, diffPath) {
  const [currentBuffer, baselineBuffer] = await Promise.all([fs.readFile(currentPath), fs.readFile(baselinePath)]);
  const current = PNG.sync.read(currentBuffer);
  const baseline = PNG.sync.read(baselineBuffer);

  if (current.width !== baseline.width || current.height !== baseline.height) {
    return {
      status: 'dimension-mismatch',
      current: { width: current.width, height: current.height },
      baseline: { width: baseline.width, height: baseline.height },
    };
  }

  const diff = new PNG({ width: current.width, height: current.height });
  const changedPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    current.width,
    current.height,
    { threshold: 0.1, includeAA: false },
  );
  await fs.writeFile(diffPath, PNG.sync.write(diff));
  return {
    status: 'compared',
    changedPixels,
    changedRatio: Number((changedPixels / (current.width * current.height)).toFixed(6)),
    diffPath,
  };
}

function runProcess(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => resolve({ code: -1, stdout, stderr, error: error.message }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function closeContextWithDeadline(context, timeoutMs = 15000) {
  let timeoutId;
  const closeResult = context.close()
    .then(() => ({ status: 'closed' }))
    .catch((error) => ({ status: 'error', error: error.message }));
  const timeoutResult = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve({ status: 'timed-out' }), timeoutMs);
  });
  const result = await Promise.race([closeResult, timeoutResult]);
  clearTimeout(timeoutId);
  return result;
}

async function runLighthouse() {
  const outputPath = path.join(runDir, 'lighthouse-mobile.json');
  const result = await runProcess(
    'pnpm',
    [
      'exec',
      'lighthouse',
      `${origin}/?rcqa=${encodeURIComponent(runId)}`,
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--form-factor=mobile',
      '--throttling-method=simulate',
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
      '--quiet',
    ],
    projectRoot,
  );

  if (result.code !== 0 || !(await fileExists(outputPath))) {
    return { status: 'failed', outputPath, process: result };
  }

  const report = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  const categoryScore = (key) => Math.round((report.categories?.[key]?.score ?? 0) * 100);
  return {
    status: 'completed',
    outputPath,
    scores: {
      performance: categoryScore('performance'),
      accessibility: categoryScore('accessibility'),
      bestPractices: categoryScore('best-practices'),
      seo: categoryScore('seo'),
    },
    metrics: {
      lcp: report.audits?.['largest-contentful-paint']?.displayValue || 'n/a',
      cls: report.audits?.['cumulative-layout-shift']?.displayValue || 'n/a',
      tbt: report.audits?.['total-blocking-time']?.displayValue || 'n/a',
      speedIndex: report.audits?.['speed-index']?.displayValue || 'n/a',
    },
  };
}

function summarizeAxe(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact || 'unknown',
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.length,
    targets: violation.nodes.slice(0, 3).map((node) => node.target),
  }));
}

async function stabiliseVisualState(page) {
  await page.evaluate(async () => {
    const wait = (delay) => new Promise((resolve) => window.setTimeout(resolve, delay));
    const waitForImage = (image) => new Promise((resolve) => {
      if (image.complete && image.naturalWidth > 0) {
        resolve();
        return;
      }
      const settle = () => resolve();
      image.addEventListener('load', settle, { once: true });
      image.addEventListener('error', settle, { once: true });
      window.setTimeout(settle, 8000);
    });
    const images = [...document.images];
    images.forEach((image) => {
      image.loading = 'eager';
    });
    const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    for (let top = 0; top < pageHeight; top += window.innerHeight) {
      window.scrollTo(0, top);
      await wait(180);
    }
    await Promise.all(images.map(waitForImage));
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
    await wait(300);
  });
  await page.waitForTimeout(250);
}

function markdownTable(rows) {
  return rows.join('\n');
}

function buildMarkdownReport(receipt) {
  const browserRows = receipt.browserRuns.map((entry) => {
    const a11y = entry.axe ? `${entry.axe.violations} violation(s), ${entry.axe.criticalOrSerious} bloquante(s)` : 'non exécuté';
    const status = entry.status === 'completed' ? 'Exécuté' : `Échec : ${entry.error}`;
    return `| ${entry.engine} | ${entry.viewport} | ${status} | ${a11y} | ${entry.keyboard?.firstFocusedElement || 'n/a'} |`;
  });

  const diffRows = receipt.diffs.map((entry) => {
    if (entry.status === 'baseline-created') return `| ${entry.engine} | ${entry.viewport} | Référence créée | — |`;
    if (entry.status === 'compared') return `| ${entry.engine} | ${entry.viewport} | Comparé | ${entry.changedPixels} (${entry.changedRatio}) |`;
    return `| ${entry.engine} | ${entry.viewport} | ${entry.status} | — |`;
  });

  const lighthouse = receipt.lighthouse.status === 'completed'
    ? `| Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |\n| ---: | ---: | ---: | ---: | --- | --- | --- |\n| ${receipt.lighthouse.scores.performance}/100 | ${receipt.lighthouse.scores.accessibility}/100 | ${receipt.lighthouse.scores.bestPractices}/100 | ${receipt.lighthouse.scores.seo}/100 | ${receipt.lighthouse.metrics.lcp} | ${receipt.lighthouse.metrics.cls} | ${receipt.lighthouse.metrics.tbt} |`
    : `> Lighthouse mobile n’a pas produit de rapport exploitable. Détail : ${receipt.lighthouse.process?.stderr?.slice(-500) || 'indisponible'}`;

  const blockers = receipt.blockers.length
    ? receipt.blockers.map((item) => `- ${item}`).join('\n')
    : '- Aucun blocage technique détecté par l’orchestrateur ; la validation humaine reste obligatoire.';

  const axeSection = receipt.axeFindings.length
    ? receipt.axeFindings.map((item) => {
      const violations = item.violations.map((violation) => `- **${violation.impact} — ${violation.id}** : ${violation.help} (${violation.nodes} nœud(s)). Cibles : ${violation.targets.map((target) => target.join(' ')).join(', ')}`).join('\n');
      return `### ${item.engine} · ${item.viewport}\n\n${violations}`;
    }).join('\n\n')
    : 'Aucune violation axe-core détectée.';

  return `# RestoCommerce — Rapport de recette Lot 0\n\n> Portée : première référence mesurée de la page d’accueil du staging réel, sans modification fonctionnelle du thème. Ce rapport ne vaut pas autorisation de démarrer le Lot 1 : une validation humaine explicite est requise.\n\n| Élément | Valeur |\n| --- | --- |\n| Staging contrôlé | ${receipt.origin} |\n| Exécution | ${receipt.runId} |\n| Commande | pnpm qa:lot0 |\n| Matrice | Chromium, Firefox, WebKit × 390/768/1440/1920 |\n| Répertoire des preuves | ${receipt.runDir} |\n\n## Exécution multi-navigateurs, responsive et clavier\n\n| Moteur | Breakpoint | Statut | axe-core | Premier focus clavier |\n| --- | --- | --- | --- | --- |\n${markdownTable(browserRows)}\n\n## Référence visuelle Pixelmatch\n\n| Moteur | Breakpoint | Statut | Pixels changés |\n| --- | --- | --- | --- |\n${markdownTable(diffRows)}\n\n## Lighthouse — profil mobile avec simulation réseau et CPU\n\n${lighthouse}\n\n## Violations axe-core\n\n${axeSection}\n\n## Écarts et décision de passage\n\n${blockers}\n\nLa recette **reste bloquée au Lot 0** tant que les écarts ci-dessus ne sont pas traités ou formellement acceptés et que l’utilisateur n’a pas donné son accord explicite.\n`;
}

await ensureDir(runDir);
await ensureDir(baselineDir);

const receipt = {
  lot: 0,
  runId,
  origin,
  runDir,
  startedAt: new Date().toISOString(),
  browserRuns: [],
  diffs: [],
  axeFindings: [],
  lighthouse: { status: 'pending' },
  blockers: [],
};

for (const engine of engines) {
  let browser;
  try {
    browser = await engine.launcher.launch({ headless: true });
  } catch (error) {
    receipt.blockers.push(`${engine.name} ne démarre pas : ${error.message}`);
    for (const viewport of viewports) {
      receipt.browserRuns.push({ engine: engine.name, viewport: viewport.name, status: 'failed', error: error.message });
    }
    continue;
  }

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        locale: 'fr-FR',
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      page.setDefaultTimeout(45000);
      const consoleErrors = [];
      const requestFailures = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));

      const outputName = `${safeFileName(engine.name)}-${safeFileName(viewport.name)}.png`;
      const screenshotPath = path.join(runDir, outputName);
      const testUrl = `${origin}/?rcqa=${encodeURIComponent(`${runId}-${engine.name}-${viewport.name}`)}`;
      try {
        await page.goto(testUrl, { waitUntil: 'commit', timeout: 60000 });
        await page.locator('.rc-marketplace-hero, .rc-site-header').first().waitFor({ state: 'visible', timeout: 60000 });
        await page.waitForTimeout(1000);
        await stabiliseVisualState(page);
        await page.keyboard.press('Tab');
        const keyboard = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active) return { firstFocusedElement: null, outlineVisible: false };
          const style = window.getComputedStyle(active);
          return {
            firstFocusedElement: `${active.tagName.toLowerCase()}${active.id ? `#${active.id}` : ''}${active.className ? `.${String(active.className).split(/\s+/).filter(Boolean).slice(0, 2).join('.')}` : ''}`,
            outlineVisible: style.outlineStyle !== 'none' || style.boxShadow !== 'none',
          };
        });
        const axeResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const axeSummary = summarizeAxe(axeResults.violations);
        const criticalOrSerious = axeSummary.filter((item) => ['critical', 'serious'].includes(item.impact)).length;
        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });

        const baselinePath = path.join(baselineDir, outputName);
        let diff;
        if (updateBaseline || !(await fileExists(baselinePath))) {
          await fs.copyFile(screenshotPath, baselinePath);
          diff = { engine: engine.name, viewport: viewport.name, status: 'baseline-created', baselinePath };
        } else {
          const diffPath = path.join(runDir, `diff-${outputName}`);
          diff = { engine: engine.name, viewport: viewport.name, ...(await comparePng(screenshotPath, baselinePath, diffPath)), baselinePath };
        }
        receipt.diffs.push(diff);
        receipt.browserRuns.push({
          engine: engine.name,
          viewport: viewport.name,
          status: 'completed',
          screenshotPath,
          keyboard,
          axe: { violations: axeSummary.length, criticalOrSerious },
          consoleErrors,
          requestFailures,
        });
        if (axeSummary.length) receipt.axeFindings.push({ engine: engine.name, viewport: viewport.name, violations: axeSummary });
        if (criticalOrSerious) receipt.blockers.push(`${engine.name} à ${viewport.name} contient ${criticalOrSerious} violation(s) axe-core sérieuse(s) ou critique(s).`);
        if (!keyboard.outlineVisible) receipt.blockers.push(`${engine.name} à ${viewport.name} ne montre pas de focus clavier discernable lors du premier Tab.`);
      } catch (error) {
        receipt.browserRuns.push({ engine: engine.name, viewport: viewport.name, status: 'failed', error: error.message, consoleErrors, requestFailures });
        receipt.blockers.push(`${engine.name} à ${viewport.name} n’a pas terminé : ${error.message}`);
      } finally {
        const closeResult = await closeContextWithDeadline(context);
        if (closeResult.status !== 'closed') {
          receipt.blockers.push(`${engine.name} à ${viewport.name} : fermeture du contexte ${closeResult.status === 'error' ? `en erreur (${closeResult.error})` : 'expirée après 15 s'}.`);
        }
      }
    }
  } finally {
    await browser.close();
  }
}

receipt.lighthouse = await runLighthouse();
if (receipt.lighthouse.status !== 'completed') receipt.blockers.push('Lighthouse mobile n’a pas pu être exécuté ou son rapport est absent.');
receipt.completedAt = new Date().toISOString();

const jsonPath = path.join(runDir, 'lot-0-receipt.json');
const markdownPath = path.join(runDir, 'lot-0-receipt.md');
await fs.writeFile(jsonPath, JSON.stringify(receipt, null, 2));
await fs.writeFile(markdownPath, buildMarkdownReport(receipt));
console.log(JSON.stringify({ jsonPath, markdownPath, blockers: receipt.blockers, lighthouse: receipt.lighthouse }, null, 2));
