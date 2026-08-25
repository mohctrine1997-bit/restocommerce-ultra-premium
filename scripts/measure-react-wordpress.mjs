/**
 * Référence de parité « Le Comptoir Éditorial ».
 * Compare les métriques de composition de la maquette React et des pages WordPress.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = '/home/ubuntu/resto-commerce-visual-baseline/metrics';
const desktop = { width: 1440, height: 1000 };
const cacheBuster = `micro-parity=061&captured=${Date.now()}`;
const pages = [
  { id: 'react-marketplace', url: 'http://127.0.0.1:3000/' },
  { id: 'react-restaurant', url: 'http://127.0.0.1:3000/restaurant/la-table-de-lila' },
  { id: 'wordpress-marketplace', url: `https://aliceblue-bison-433987.hostingersite.com/?${cacheBuster}` },
  { id: 'wordpress-restaurant', url: `https://aliceblue-bison-433987.hostingersite.com/restaurant/demo-tokyo-bento/?${cacheBuster}` },
  { id: 'wordpress-product', url: `https://aliceblue-bison-433987.hostingersite.com/produit/tokyo-bento-chicken-katsu-curry/?${cacheBuster}` },
];

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const results = {};

for (const current of pages) {
  const context = await browser.newContext({ viewport: desktop, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(current.url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
  await page.evaluate(() => document.fonts?.ready);
  results[current.id] = await page.evaluate(() => {
    const visible = (element) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || box.width < 2 || box.height < 2) return null;
      return {
        tag: element.tagName.toLowerCase(),
        className: element.className?.toString().slice(0, 180) || '',
        text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 90),
        x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height),
        fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
        lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor, color: style.color,
        gap: style.gap, padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
      };
    };
    const pickText = (selector, text) => [...document.querySelectorAll(selector)].find((element) => element.textContent.trim().includes(text));
    const cards = [...document.querySelectorAll('article')].map(visible).filter(Boolean).slice(0, 6);
    return {
      location: location.href,
      body: { background: getComputedStyle(document.body).backgroundColor, font: getComputedStyle(document.body).fontFamily },
      header: visible(document.querySelector('header')),
      heading: visible(document.querySelector('main h1, h1')),
      subheading: visible(document.querySelector('main h2, h2')),
      search: visible(document.querySelector('input[type="search"], input[placeholder*="cuisine"], input[placeholder*="restaurant"]')),
      primaryButton: visible(document.querySelector('main button, main .button, main a.button')),
      firstCard: cards[0] || null,
      cards,
      titleByText: visible(pickText('h1,h2,h3', 'menu du comptoir') || pickText('h1,h2,h3', 'Le menu') || pickText('h1,h2,h3', 'Choisissez')),
    };
  });
  await context.close();
}

await browser.close();
await mkdir(output, { recursive: true });
await writeFile(`${output}/react-wordpress-geometry.json`, `${JSON.stringify(results, null, 2)}\n`);
console.log(`${output}/react-wordpress-geometry.json`);
