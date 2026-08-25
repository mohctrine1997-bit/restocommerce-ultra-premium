/**
 * Contrôle micro-visuel RestoCommerce.
 * Produit des captures à taille identique et une carte pixel des différences de premier écran.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const output = '/home/ubuntu/resto-commerce-visual-baseline/diff';
const viewport = { width: 1440, height: 1000 };
const cacheBuster = `micro-parity=061&captured=${Date.now()}`;
const pairs = [
  { name: 'marketplace', reference: 'http://127.0.0.1:3000/', candidate: `https://aliceblue-bison-433987.hostingersite.com/?${cacheBuster}` },
  { name: 'restaurant', reference: 'http://127.0.0.1:3000/restaurant/la-table-de-lila', candidate: `https://aliceblue-bison-433987.hostingersite.com/restaurant/demo-tokyo-bento/?${cacheBuster}` },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const report = [];

for (const pair of pairs) {
  const capture = async (url, destination) => {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
    await page.evaluate(() => document.fonts?.ready);
    await page.screenshot({ path: destination, clip: { x: 0, y: 0, width: viewport.width, height: viewport.height } });
    await context.close();
  };

  const referencePath = `${output}/${pair.name}-react.png`;
  const candidatePath = `${output}/${pair.name}-wordpress.png`;
  const normalizedReference = `${output}/${pair.name}-react-normalized.png`;
  const normalizedCandidate = `${output}/${pair.name}-wordpress-normalized.png`;
  await capture(pair.reference, referencePath);
  await capture(pair.candidate, candidatePath);
  await sharp(referencePath).ensureAlpha().png().toFile(normalizedReference);
  await sharp(candidatePath).ensureAlpha().png().toFile(normalizedCandidate);
  const [referenceBuffer, candidateBuffer] = await Promise.all([readFile(normalizedReference), readFile(normalizedCandidate)]);
  const reference = PNG.sync.read(referenceBuffer);
  const candidate = PNG.sync.read(candidateBuffer);
  const diff = new PNG({ width: viewport.width, height: viewport.height });
  const changedPixels = pixelmatch(reference.data, candidate.data, diff.data, viewport.width, viewport.height, { threshold: 0.18, includeAA: false, alpha: 0.65, diffColor: [215, 119, 87] });
  const diffPath = `${output}/${pair.name}-diff.png`;
  await writeFile(diffPath, PNG.sync.write(diff));
  report.push({ screen: pair.name, changedPixels, pixels: viewport.width * viewport.height, changedPercent: Number((changedPixels / (viewport.width * viewport.height) * 100).toFixed(2)), referencePath, candidatePath, diffPath });
}

await browser.close();
await writeFile(`${output}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
