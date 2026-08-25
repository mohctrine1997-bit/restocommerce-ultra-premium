import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const url = `https://aliceblue-bison-433987.hostingersite.com/restaurant/demo-safran-medina/?rcqa=lot1-contrast-${Date.now()}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
await page.locator('[data-rc-store-menu]').waitFor({ state: 'visible', timeout: 60000 });
const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
const violations = results.violations.map((item) => ({ id: item.id, impact: item.impact, help: item.help, nodes: item.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) }));
await fs.writeFile('/home/ubuntu/resto-commerce-qa/lot-1/axe-store-detailed.json', JSON.stringify({ url, violations }, null, 2));
console.log(JSON.stringify(violations, null, 2));
await context.close();
await browser.close();
